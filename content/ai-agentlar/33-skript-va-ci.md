# 33 — Skriptdan va CI'dan ishga tushirish

[Mundarija](README.md)

> ⚑ Skript rejimi (`claude -p`) sinov kompyuterida haqiqiy sessiyalarda tekshirilgan — bu kitobdagi deyarli barcha tajribalar shu
> rejimda o'tkazilgan. GitHub Actions qismi faqat rasmiy hujjat asosida yozilgan: uni sinash uchun GitHub test repozitoriysi va
> secret'lar kerak (README'dagi ochiq savol). Codex qismi ham faqat hujjat bo'yicha.

## Tushuncha

Agentni har doim terminalda o'zingiz boshqarishingiz shart emas. Uni skript, `package.json` buyrug'i yoki CI pipeline ichida ham
ishga tushirish mumkin: har PR'da review, kechasi bog'liqliklarni tekshirish, build xatosini tushuntirish.

CC (Run Claude Code programmatically): interaktivsiz rejim uchun so'rov `-p` (`--print`) bilan beriladi:

```bash
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

Bu kitobda deyarli har tajriba shu rejimda o'tkazilgan. 3-bobdagi agentik sikl, 8-bobdagi Stop hook, 22-bobdagi review — hammasi
`claude -p` edi.

### Asosiy imkoniyatlar

| Imkoniyat | Qanday | Nima uchun |
| --- | --- | --- |
| Chiqish kodi | Muvaffaqiyatda `0`, xatoda noldan farqli | Skript natijaga qarab tarmoqlanadi |
| Quvur (pipe) | `cat build-error.txt \| claude -p "…" > output.txt` | stdin'dan o'qiydi, stdout'ga yozadi (stdin 10 MB bilan cheklangan) |
| `--output-format text` | Oddiy matn (standart) | Odam o'qishi uchun |
| `--output-format json` | `result`, `session_id`, xarajat (`total_cost_usd`) va metama'lumot | Skriptda tahlil qilish |
| `--output-format stream-json` | Har voqea alohida JSON qator | Jarayonni real vaqtda kuzatish (bu kitobdagi animatsiyalar shundan) |
| `--json-schema '<sxema>'` | Chiqish sxemaga mos `structured_output` maydonida | Ishonchli tuzilmali ma'lumot |
| `--allowedTools "…"` | Tool'larga oldindan ruxsat | Ruxsat so'rovi javobsiz qolmasligi uchun |
| `--max-turns`, `--max-budget-usd` | Navbatlar soni yoki xarajat chegarasi | Harness majburlaydigan chegara (CC Best practices) |
| `--continue`, `--resume <id>` | Oldingi suhbatni davom ettirish | Bir necha bosqichli skript (15-bob) |

### CI uchun ikki muhim tafsilot

**`--bare`.** CC: `--bare` hook'lar, skill'lar, plaginlar, MCP serverlar, auto memory va CLAUDE.md'ni avtomatik yuklamaydi, shuning uchun
tezroq ishga tushadi va **har kompyuterda bir xil natija** beradi. Hamkasbingizning `~/.claude` idagi hook yoki repo `.mcp.json` idagi
server ishlamaydi. Bare mode obuna login'idan foydalanmaydi, `ANTHROPIC_API_KEY` kerak bo'ladi (3-bobda shu sababli bu rejim
ishlamagan edi: `Not logged in`).

**Xavfsizlik.** CC: `--bare` siz `-p` sessiyasi repo `.claude/settings.json` idagi hook'larni ishga tushiradi va `.mcp.json` dagi
serverlarga ulanadi — hatto siz hech qachon ishonmagan papkada ham. `-p` da ishonch oynasi ham, server tasdiqlash so'rovi ham yo'q.
Begona kodda (masalan, fork'dan kelgan PR'da) agentni ishga tushirishdan oldin buni hisobga oling (5-bob).

**Kuzatuvsiz ishlashda ruxsatlar.** CC: hech kim javob bera olmaydigan ishda `--permission-prompts none` — ruxsat so'raydigan har narsa
rad etiladi va Claude'ga uni qayta urinmaslik aytiladi. Bu kitobdagi tajribalarda `-p` da ruxsatsiz buyruqlar rad etilgan va agent buni
hisobotida aytgan (8-bob).

## Amalda

### 1. Tuzilmali chiqish

CC (headless) dagi `--json-schema` namunasi asosida (Claude Code 2.1.325):

```bash
claude -p "narx.js dagi eksport qilinadigan funksiyalarni va ularning parametrlarini ber" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"funksiyalar":{"type":"array","items":{"type":"object","properties":{"nom":{"type":"string"},"parametrlar":{"type":"array","items":{"type":"string"}}},"required":["nom","parametrlar"]}}},"required":["funksiyalar"]}'
```

Chiqish kodi `0`. JSON'ning `structured_output` maydoni:

```json
{"funksiyalar": [
  {"nom": "jami", "parametrlar": ["savat"]},
  {"nom": "chegirma", "parametrlar": ["summa", "foiz"]},
  {"nom": "bolibTolash", "parametrlar": ["summa", "oylar"]},
  {"nom": "jarima", "parametrlar": ["summa", "kunlar"]}
]}
```

Xuddi shu JSON'da `total_cost_usd` (0,185), `num_turns` (3) va `is_error` (`false`) ham bor edi. Skriptda natijani matndan "taxmin
qilib" ajratish shart emas: `jq '.structured_output'` yetarli. CC eslatadi: agent so'rovni rad etsa, `structured_output` maydoni
bo'lmaydi. Skriptda uning bor-yo'qligini tekshiring.

### 2. Build skriptidagi linter

CC (headless) dagi "typo linter" namunasi. `narx.js` dagi izohga ataylab uchta imlo xatosi kiritildi:

```js
// Kechikkan tolov uchun jarma: har kechikan kun uchun 0.1%, ko'pi bilan 10%
```

```bash
git diff | claude -p "you are a typo linter. for each typo in this diff, report filename:line on one line and the issue on the next. return nothing else."
```

```text
narx.js:23
"tolov" should be "to'lov" (the apostrophe is missing)
narx.js:23
"jarma" should be "jarima"
narx.js:23
"kechikan" should be "kechikkan"
```

Uchala xato topildi, qator raqami to'g'ri (`sed -n 23p narx.js` — aynan shu izoh). Diff quvur bilan berilgani uchun agentga Bash
ruxsati kerak bo'lmadi — CC aynan shuni ta'kidlaydi. `package.json` da:

```json
{
  "scripts": {
    "lint:claude": "git diff main | claude -p \"you are a typo linter. for each typo in this diff, report filename:line on one line and the issue on the next. return nothing else.\""
  }
}
```

## GitHub Actions ⚑

CC (Claude Code GitHub Actions): `anthropics/claude-code-action` — repo workflow'larida Claude Code'ni ishga tushiradigan GitHub Action.
U ikki rejimda ishlaydi:

| Rejim | Qachon | Natija qayerda |
| --- | --- | --- |
| **Interaktiv** | Workflow'da `prompt` yo'q: Claude issue yoki PR izohidagi `@claude` ni kutadi | Issue yoki PR izohida |
| **Avtomatlashtirish** | Workflow'da `prompt` bor: eslatmasiz, istalgan GitHub hodisasida (cron ham) | Standart holatda workflow logida |

O'rnatish: Claude Code'da `/install-github-app` (GitHub App, secret va workflow PR'ini tayyorlaydi) yoki qo'lda. Ikkala yo'lda ham
repo'ga admin huquqi kerak.

CC'dagi `@claude` eslatmalariga javob beradigan workflow:

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Obuna bilan ishlansa, `anthropic_api_key` o'rniga `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`.

Kim ishga tushira oladi (CC):

- issue va PR hodisalarida ishga tushiruvchining repo'ga **yozish huquqi** bo'lishi kerak;
- bot ishga tushiruvchi rad etiladi, agar u `allowed_bots` da bo'lmasa. Bu botlar Claude'ni siklda qayta-qayta chaqirishidan himoya
  qiladi.

Avtomatlashtirish rejimida oddiy matnli `prompt` berilsa, Claude'da shell yoki GitHub API'ga kirish **yo'q**, toki siz kerakli
tool'larni `claude_args` dagi `--allowedTools` yoki `settings` dagi ruxsat qoidasi bilan bermaguningizcha.

CC'dagi eng yaxshi amaliyotlar:

| Amaliyot | Mazmuni |
| --- | --- |
| CLAUDE.md'da standartlar | Claude PR yaratganda va javob berganda unga amal qiladi |
| Secret'larni himoyalash | API kaliti yoki token'ni hech qachon repo'ga commit qilmang — faqat GitHub Secrets (38-bob) |
| Minimal ruxsatlar | Workflow'ga faqat kerakli ruxsatlarni bering; Claude o'zgarishlarini merge'dan oldin ko'rib chiqing |
| Xarajat | Har ishga tushirish GitHub Actions daqiqalari va API tokenlarini sarflaydi; aniq `@claude` so'rovlari va issue shablonlari kamroq navbat talab qiladi |

## Codex bilan solishtirish ⚑

CX (Non-interactive mode) bo'yicha Codex'da interaktivsiz rejim — `codex exec`:

| | Claude Code | Codex |
| --- | --- | --- |
| Buyruq | `claude -p "…"` | `codex exec "…"` |
| Chiqish | stdout'da natija; `--output-format json`/`stream-json` | Jarayon stderr'ga, yakuniy xabar stdout'ga; JSON Lines chiqishi bor |
| Quvur | stdin qo'shimcha kontekst | Prompt va quvur birga: prompt — ko'rsatma, quvur — kontekst |
| Standart ruxsat | Ruxsat qoidalari va rejimga bog'liq; javobsiz so'rov rad etiladi | Faqat o'qish sandbox'i; tahrir uchun `--sandbox workspace-write` |
| Sessiyani saqlamaslik | `--no-session-persistence` | `--ephemeral` |
| Lokal sozlamalarsiz | `--bare` | `--ignore-user-config`, `--ignore-rules` |

Ikkala vositada ham tamoyil bir xil: CI'da **eng kam zarur ruxsat** va **takrorlanadigan muhit**.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| `claude -p` lokal skriptda | Oddiy; quvur va JSON | Kompyuteringiz yoqiq bo'lishi kerak | Build skriptlari, lokal avtomatlashtirish |
| `claude -p --bare` CI'da | Har kompyuterda bir xil; tez | API kaliti kerak; hook'lar ishlamaydi | CI pipeline |
| GitHub Actions (`claude-code-action`) | `@claude` izohlari, PR'lar, cron | Actions daqiqalari + tokenlar; sozlash | GitHub repo'dagi jamoa ishi |
| Agent SDK (Python/TypeScript) | To'liq dasturiy nazorat | Ko'proq kod | O'z ilovangiz ichida agent (47-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| `-p` da tool ruxsatini bermaslik | Ruxsat so'rovi javobsiz qoladi va rad etiladi | `--allowedTools` yoki ruxsat qoidasi |
| Natijani matndan regex bilan ajratish | Format har safar biroz boshqacha bo'lishi mumkin | `--output-format json` + `--json-schema` |
| `structured_output` borligini tekshirmaslik | CC: agent rad etsa, maydon bo'lmaydi | Avval maydon borligini tekshiring |
| CI'da `--bare` siz ishga tushirish | Hamkasbning hook'lari yoki repo `.mcp.json` i ishlashi mumkin; natija har xil | `--bare` |
| Begona PR kodida `-p` ni ehtiyotsiz ishga tushirish | CC: `-p` repo hook'lari va MCP serverlarini ishonch so'ramasdan ishga tushiradi | `--bare` va minimal ruxsatlar |
| API kalitini workflow fayliga yozish | CC: hech qachon commit qilmang | GitHub Secrets |
| Chegarasiz kuzatuvsiz ish | Navbatlar va xarajat cheksiz o'sishi mumkin | `--max-turns`, `--max-budget-usd` |

## Amaliyot

1. Claude Code'ni interaktivsiz rejimda qanday ishga tushirasiz va skript natijani qanday biladi?
2. Uch chiqish formati qanday farq qiladi? `--json-schema` nima beradi?
3. `--bare` CI uchun nega foydali va u nimani talab qiladi?
4. `-p` sessiyasi begona repo'da qanday xavf tug'diradi?
5. GitHub Actions'ning interaktiv va avtomatlashtirish rejimlari farqi nima?
6. Tajribadagi linter nega Bash ruxsatisiz ishladi?

<details>
<summary>Javoblar</summary>

1. `claude -p "so'rov"` (kerak bo'lsa `--allowedTools` va boshqa bayroqlar bilan). Chiqish kodi: muvaffaqiyatda 0, xatoda noldan farqli.
2. `text` — oddiy matn; `json` — natija, session_id, xarajat va metama'lumot; `stream-json` — har voqea alohida JSON qator. `--json-schema` sxemaga mos chiqishni `structured_output` maydonida beradi.
3. Hook, skill, plagin, MCP, auto memory va CLAUDE.md'ni yuklamaydi — har kompyuterda bir xil natija va tez ishga tushish. `ANTHROPIC_API_KEY` (yoki `apiKeyHelper`) talab qiladi, obuna login'idan foydalanmaydi.
4. `--bare` siz u repo `.claude/settings.json` hook'larini ishga tushiradi va `.mcp.json` serverlariga ulanadi — ishonch oynasi va server tasdiqisiz.
5. Interaktiv — `prompt` yo'q, Claude izohdagi `@claude` ni kutadi va izohda javob beradi. Avtomatlashtirish — `prompt` bor, istalgan hodisada (cron ham) eslatmasiz ishlaydi, natija standart holatda logda.
6. Diff quvur orqali stdin'dan berildi, agentga uni o'qish uchun buyruq ishga tushirish kerak bo'lmadi.

</details>

## Rasmiy hujjat

- [CC: Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [CC: Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [CC: CLI reference](https://code.claude.com/docs/en/cli-reference)
- [CC: Configure permissions — What runs before you trust a folder](https://code.claude.com/docs/en/permissions#what-runs-before-you-trust-a-folder)
- [CX: Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)

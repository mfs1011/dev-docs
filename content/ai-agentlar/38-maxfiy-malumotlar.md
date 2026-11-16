# 38 — Maxfiy ma'lumotlar: kalitlar, .env va transkriptlar

[Mundarija](README.md)

## Tushuncha

Agent o'qigan narsa uch joyga tushadi:

1. **Model kontekstiga.** Fayl mazmuni, buyruq chiqishi va siz yozgan matn modelga yuboriladi.
2. **Diskdagi transkriptga** (transcript, sessiya yozuvi). Claude Code sessiyani davom ettirish uchun uni lokal saqlaydi.
3. **Agent javobiga.** Agent o'qigan qiymatni ekranga, faylga yoki commit'ga chiqarishi mumkin.

Shuning uchun parol, API kalit yoki token (umumiy nomi — **sir**, secret) agentga **umuman ko'rinmasligi** kerak. Agent sirni ko'rib
qo'ygandan keyin uni "unutib" yuborishning oddiy yo'li yo'q.

OWASP (LLM02:2025 Sensitive Information Disclosure) bu xavfni **maxfiy ma'lumotning oshkor bo'lishi** deb ataydi. Ro'yxatda shaxsiy
ma'lumot, moliyaviy tafsilotlar, maxfiy biznes ma'lumoti va **kirish ma'lumotlari** (security credentials) bor. Uning asosiy choralari:

- **kirishni cheklash** — maxfiy ma'lumotga kirish eng kam huquq tamoyili (least privilege) bo'yicha;
- **foydalanuvchini o'rgatish** — maxfiy ma'lumot kiritmaslik bo'yicha yo'l-yo'riq;
- **shaffoflik** — ma'lumot saqlash va o'chirish siyosati aniq bo'lishi;
- **xavfsiz sozlama.**

OWASP alohida ogohlantiradi: tizim ko'rsatmasidagi ("buni ochma") cheklovlarga har doim ham amal qilinmasligi, prompt injection (37-bob)
bilan chetlab o'tilishi mumkin. Shuning uchun ular yagona himoya bo'lmasligi kerak.

### Sir qayerdan oqib chiqadi

| Yo'l | Misol | Himoya |
| --- | --- | --- |
| Read tool | Agent `.env` ni o'qiydi | Ruxsat qoidasi: `Read(./.env)` deny (35-bob) |
| Shell buyrug'i | `cat ~/.aws/credentials`, `printenv` | Sandbox `credentials` yoki `denyRead` (36-bob, shu bob) |
| Muhit o'zgaruvchisi | `GITHUB_TOKEN` buyruqlarga meros bo'lib o'tadi | Sandbox `credentials.envVars` yoki `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` |
| Siz yozgan matn | So'rovga token'ni nusxalab qo'yish | Odat: sirni chatga yozmaslik |
| Transkript | Yuqoridagilarning hammasi diskka yoziladi | `cleanupPeriodDays`, `claude purge`, sessiyani saqlamaslik |

### Ikki qatlam bir-birini to'ldiradi

36-bobda ko'rildi: sandbox **Bash buyruqlarini** cheklaydi, Read, Edit, WebFetch kabi o'rnatilgan tool'lar esa **ruxsat qoidalariga**
bo'ysunadi. CC (Sandboxing): "`denyRead` yozuvi Read tool'ini to'xtatmaydi". Demak sir fayli uchun **ikkalasi** kerak:

| Qatlam | Nimani to'xtatadi | Sozlama |
| --- | --- | --- |
| Ruxsat qoidasi | Read tool, shuningdek CC tahlil qila oladigan `cat`/`grep` kabi buyruqlar (35-bob tajribasi) | `permissions.deny: ["Read(./.env)"]` |
| Sandbox | OS darajasida **har qanday** buyruq va uning bola jarayonlari | `sandbox.credentials` yoki `sandbox.filesystem.denyRead` |

### `sandbox.credentials`

CC (Sandboxing): `sandbox.credentials` — sandbox'dagi buyruqlardan himoya qilinadigan kirish ma'lumotlari fayllari va muhit
o'zgaruvchilari ro'yxati. Har yozuv fayl yo'li yoki o'zgaruvchi nomi va `mode` dan iborat:

| `mode` | Fayl uchun | Muhit o'zgaruvchisi uchun |
| --- | --- | --- |
| `deny` | Sandbox ichida o'qish taqiqlanadi (`denyRead` bilan bir xil) | Har sandbox buyrug'idan oldin o'chiriladi (unset) |
| `mask` | Buyruq soxta qiymat (sentinel) ko'radi, proksi ruxsat etilgan host'ga so'rovda haqiqiy qiymatni qo'yadi | Xuddi shunday: buyruq va uning log'lari haqiqiy qiymatni hech qachon ushlamaydi |

Muhim tafsilotlar (CC, Sandboxing):

- **O'rnatilgan ro'yxat yo'q.** Faqat siz yozgan fayl va o'zgaruvchilar cheklanadi. Standart holatda `~/.ssh` va `~/.aws/credentials`
  sandbox ichida ham **o'qiladi**.
- `deny` yozuvlari barcha sozlama doiralaridan birlashtiriladi. Har qanday doira yangi `deny` qo'sha oladi, lekin boshqa doira qo'shganini
  olib tashlay olmaydi.
- `mask` uchun TLS terminatsiyasi (`network.tlsTerminate`) va ruxsat etilgan manzil kerak. `mask` faqat foydalanuvchi sozlamasi, boshqariladigan
  (managed) sozlama va `--settings` dan qabul qilinadi — repo'dagi `.claude/settings.json` dan **e'tiborsiz qoldiriladi**. Shunday qilib, begona
  repo sizning token'ingizni o'zi tanlagan host'ga yo'naltira olmaydi.
- `sandbox.credentials` faqat sandbox'dagi Bash buyruqlariga ta'sir qiladi. Sandbox'dan qat'i nazar barcha bola jarayonlardan sirlarni
  olib tashlash uchun `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`.

Yo'llar `filesystem` sozlamalari bilan bir xil prefiks qoidasiga bo'ysunadi (CC, Settings reference):

| Prefiks | Ma'nosi |
| --- | --- |
| `/` | Fayl tizimi ildizidan mutlaq yo'l |
| `~/` | Uy papkasiga nisbatan |
| `./` yoki prefikssiz | Loyiha sozlamasida — loyiha ildiziga, foydalanuvchi sozlamasida — `~/.claude` ga nisbatan |

### `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`

CC (Environment variables): `1` qiymati Claude Code ishga tushiradigan **bola jarayonlar** (Bash buyruqlari, hook'lar, stdio MCP serverlar)
muhitidan kirish ma'lumotlarini olib tashlaydi. Sir o'zgaruvchi nomi yoki qiymatidan aniqlanadi; GitHub token'lari va proksi sozlamalari
qoldiriladi. `claude-code-action` (33-bob) `allowed_non_write_users` sozlanganda buni avtomatik yoqadi.

### Transkriptlar va ma'lumotlardan foydalanish

CC (`.claude` directory) aniq aytadi: `~/.claude` dagi transkriptlar va tarix **oddiy matn** (plaintext), diskda shifrlanmagan; yagona
himoya — OS fayl ruxsatlari. Tool orqali o'tgan hamma narsa — fayl mazmuni, buyruq chiqishi, joylashtirilgan matn — transkriptga yoziladi:
`~/.claude/projects/<loyiha>/<sessiya>.jsonl`. Hujjat tavsiyalari:

| Chora | Nima qiladi |
| --- | --- |
| `cleanupPeriodDays` ni kamaytirish | Transkriptlar shuncha kundan keyin o'chiriladi (standart 30, minimal 1) |
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY=1` | Transkript va so'rov tarixini diskka yozmaydi; bunday sessiya `--resume`, `--continue` da ko'rinmaydi |
| `-p` bilan `--no-session-persistence` | Kuzatuvsiz skriptda sessiya saqlanmaydi (33-bob) |
| Ruxsat qoidalari | Kirish ma'lumotlari fayllarini o'qishni taqiqlash — sir transkriptga umuman tushmaydi |
| `claude purge <yo'l>` | Bitta loyihaning transkriptlari, xotirasi, fayl tarixi va `~/.claude.json` dagi yozuvini o'chiradi |

Modelga yuborilgan ma'lumot haqida CC (Data usage):

- Claude Code modelga **barcha so'rovlar va model javoblarini** tarmoq orqali yuboradi (TLS 1.2+).
- **Saqlash muddati.** Iste'molchi rejalari (Free, Pro, Max, Ultra): modelni yaxshilashga ruxsat berilsa — 5 yil, berilmasa — 30 kun.
  Tijoriy (Team, Enterprise, API): standart 30 kun; mos hisoblar uchun nol saqlash (ZDR) mavjud.
- **O'qitish.** Iste'molchi hisoblarida sozlama yoqilgan bo'lsa, ma'lumot yangi modellarni o'qitishda ishlatiladi. Tijoriy shartlarda
  Anthropic kod va so'rovlarda generativ modellarni o'qitmaydi (mijoz o'zi rozilik bermagan bo'lsa).
- **`/feedback`.** `/feedback`, `/bug` va `/share` orqali yuborilgan transkriptlar 5 yil saqlanadi.

Demak `claude purge` faqat **lokal** nusxani o'chiradi. Buyruqning o'zi ham shuni yozadi: "Purging deletes data only on this computer, not
anything stored by Anthropic." Modelga yuborilgan sirni almashtirish (rotate) kerak.

## Amalda: sandbox sirni yashiradi, Read tool esa yo'q

Sinov repo'sida `sirlar/deploy-kalit.txt` (sinov qiymati `kalit-v26-SINOV-7Q2`) bor. `.claude/settings.json`:

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "allowUnsandboxedCommands": false,
    "credentials": {
      "files": [{ "path": "./sirlar", "mode": "deny" }],
      "envVars": [{ "name": "GITHUB_TOKEN", "mode": "deny" }]
    }
  }
}
```

Sessiya ikkita muhit o'zgaruvchisi bilan ishga tushirildi: `GITHUB_TOKEN=ghp_SINOV_v26_soxta` (soxta sinov qiymati) va oddiy
`OCHIQ_ADRES=example.uz`. Agentga bitta Bash buyrug'i berildi:

```bash
echo "GH=${GITHUB_TOKEN:-yoq} ADRES=${OCHIQ_ADRES:-yoq}"; cat sirlar/deploy-kalit.txt
```

Tool natijasi:

```text
Exit code 1
GH=yoq ADRES=example.uz
cat: sirlar/deploy-kalit.txt: Operation not permitted
```

- `GITHUB_TOKEN` buyruqqa yetib bormadi (`yoq`), ro'yxatda bo'lmagan `OCHIQ_ADRES` esa o'tdi.
- `sirlar/` ni OS darajasida o'qib bo'lmadi. Agent javobida yozdi: "Faylni chetlab o'qishga urinmadim."

Endi o'sha sozlama bilan boshqa so'rov: "sirlar/deploy-kalit.txt faylini Read tool'i bilan o'qib, ichidagi qiymatni ayt."

```text
TOOL: Read  …/v26/sirlar/deploy-kalit.txt
RES:  1  kalit-v26-SINOV-7Q2
```

**Read tool faylni o'qidi.** Bu CC'dagi qoidaning amaldagi ko'rinishi: sandbox faqat Bash'ni cheklaydi. Agentning o'zi ham shuni aytdi:
"Read tool esa bu cheklovga bo'ysunmaydi". To'liq himoya uchun sandbox yozuviga qo'shimcha ravishda ruxsat qoidasi kerak (35-bobdagi kabi):

```json
{
  "permissions": { "deny": ["Read(./sirlar/**)"] }
}
```

### Sir transkriptda qoldi

Ikkinchi sessiya saqlanadigan rejimda ishga tushirilgan edi. Uning transkriptida sinov qiymatini qidiramiz:

```bash
grep -c "kalit-v26-SINOV-7Q2" ~/.claude/projects/<loyiha>/<sessiya>.jsonl
# 2
```

Qiymat ikki qatorda oddiy matn sifatida turibdi: tool natijasida va fayl mazmuni yozuvida. Fayl ruxsati `-rw-------` — faqat egasi
o'qiy oladi, hujjatda aytilganidek yagona himoya shu. Lokal nusxani o'chirish:

```bash
claude purge <loyiha-yo'li> --dry-run   # avval nima o'chishini ko'rish
claude purge <loyiha-yo'li> --yes
```

```text
Purging deletes data only on this computer, not anything stored by Anthropic.
Purged 1 item(s) for …/lab/v26.
```

### Bitta kuzatuv: `./` yo'li `--settings` da

Tajribaning birinchi urinishida xuddi shu `credentials` bloki `--settings` bayrog'i orqali berilgan edi. `GITHUB_TOKEN` yashirildi, lekin
`./sirlar` fayli **o'qildi**. Hujjatda `./` faqat loyiha sozlamasi (loyiha ildizi) va foydalanuvchi sozlamasi (`~/.claude`) uchun
tavsiflangan; `--settings` uchun alohida aytilmagan. Xavfsiz yo'l: nisbiy yo'lli `credentials.files` yozuvlarini loyihaning
`.claude/settings.json` ida saqlang yoki `~/`, `/` bilan boshlanadigan to'liq yo'l yozing. Sozlamadan keyin sinab ko'ring: agent
`cat` qilganda `Operation not permitted` chiqishi kerak.

## Tavsiya etilgan sozlama

Shaxsiy kompyuter uchun foydalanuvchi sozlamasi (`~/.claude/settings.json`), yo'llar `~/` bilan:

```json
{
  "permissions": {
    "deny": ["Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(./.env)", "Read(./.env.*)"]
  },
  "sandbox": {
    "enabled": true,
    "credentials": {
      "files": [
        { "path": "~/.ssh", "mode": "deny" },
        { "path": "~/.aws/credentials", "mode": "deny" }
      ],
      "envVars": [
        { "name": "GITHUB_TOKEN", "mode": "deny" },
        { "name": "NPM_TOKEN", "mode": "deny" }
      ]
    }
  },
  "cleanupPeriodDays": 7
}
```

Ehtiyot bo'ling: `~/.ssh` taqiqlansa, sandbox'dagi `git push` SSH kalitini topa olmaydi (CC, Sandboxing — SSH muammolari). Bunday
holatda push'ni o'zingiz qilasiz — 11-bobdagi "qaytarib bo'lmaydigan harakatlar" qoidasi bilan mos.

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Buyruqqa token umuman kerak emas | `credentials` `deny` | Eng sodda; token talab qiladigan buyruq ishlamaydi |
| Buyruq API'ga token bilan murojaat qilishi kerak | `credentials` `mask` + `injectHosts` | Buyruq haqiqiy qiymatni ko'rmaydi; TLS terminatsiyasi va foydalanuvchi sozlamasi kerak |
| Sandbox ishlatilmaydi | `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` + Read deny | Muhit tozalanadi, lekin fayllarni faqat ruxsat qoidalari himoya qiladi |
| Kuzatuvsiz skript (CI) | `--no-session-persistence`, minimal token, CI sirlari | Sessiyani keyin ko'rib bo'lmaydi |
| Maxfiy loyiha | Tijoriy reja yoki ZDR, `cleanupPeriodDays` kichik | Narx va tashkiliy talablar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Faqat sandbox `denyRead` bilan cheklash | CC: `denyRead` Read tool'ini to'xtatmaydi (tajribada o'qildi) | Sandbox + `Read(...)` deny |
| `~/.ssh` sandbox'da o'z-o'zidan yopiq deb o'ylash | CC: o'rnatilgan ro'yxat yo'q, standart holatda o'qiladi | `credentials.files` ga qo'shish |
| Token'ni so'rovga nusxalab qo'yish | Model kontekstiga, transkriptga va Anthropic serverlariga tushadi | Muhit o'zgaruvchisi yoki sir boshqaruvchisi |
| `claude purge` qildim — sir yo'qoldi | Faqat lokal nusxa o'chadi | Sirni almashtirish (rotate) |
| `/feedback` ga sir tushgan sessiyani yuborish | Transkript 5 yil saqlanadi | Yuborishdan oldin tekshirish |
| Nisbiy `./` yo'lini `--settings` da berib, tekshirmaslik | Tajribada fayl o'qildi | Loyiha sozlamasi yoki to'liq yo'l, so'ng sinash |

## Amaliyot

1. Agent o'qigan sir qaysi uch joyga tushadi?
2. Nega sir fayli uchun ham sandbox, ham ruxsat qoidasi kerak?
3. `credentials` dagi `deny` va `mask` rejimlari qanday farq qiladi? Nega `mask` repo sozlamasidan qabul qilinmaydi?
4. `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` nimani qiladi va `sandbox.credentials` dan qanday farq qiladi?
5. Transkriptlar qayerda saqlanadi va ularning ta'sirini qanday kamaytirish mumkin?
6. `claude purge` dan keyin sir xavfsiz bo'ladimi?

<details>
<summary>Javoblar</summary>

1. Model kontekstiga (va Anthropic serverlariga, hisob turiga qarab 30 kun–5 yil), diskdagi transkriptga, agent javobiga yoki u yozgan faylga.
2. Sandbox faqat Bash buyruqlarini OS darajasida cheklaydi; Read kabi o'rnatilgan tool'lar ruxsat qoidalariga bo'ysunadi. Tajribada sandbox `cat` ni to'xtatdi, Read esa faylni o'qidi.
3. `deny` faylni o'qishni taqiqlaydi yoki o'zgaruvchini o'chiradi; `mask` buyruqqa soxta qiymat beradi, proksi esa ruxsat etilgan host'ga so'rovda haqiqiy qiymatni qo'yadi. Repo sozlamasidan qabul qilinmaydi, chunki aks holda begona repo token'ni o'zi tanlagan host'ga yuborishi mumkin edi.
4. Bash, hook va stdio MCP server kabi barcha bola jarayonlar muhitidan sirlarni olib tashlaydi, sandbox yoqilgan-yoqilmaganidan qat'i nazar. `sandbox.credentials` faqat sandbox'dagi Bash buyruqlariga ta'sir qiladi va fayllarni ham himoya qiladi.
5. `~/.claude/projects/<loyiha>/<sessiya>.jsonl`, oddiy matnda. `cleanupPeriodDays` ni kamaytirish, `CLAUDE_CODE_SKIP_PROMPT_HISTORY`, `-p` da `--no-session-persistence`, sir fayllarini Read deny bilan yopish, `claude purge`.
6. Yo'q. Faqat lokal nusxa o'chadi; modelga yuborilgan ma'lumot hisob turiga qarab Anthropic'da saqlanadi. Sirni almashtirish kerak.

</details>

## Rasmiy hujjat

- [CC: Sandboxing — Protect credentials, Mask credentials](https://code.claude.com/docs/en/sandboxing#protect-credentials)
- [CC: Settings reference — Sandbox path prefixes](https://code.claude.com/docs/en/settings-reference#sandbox-path-prefixes)
- [CC: Environment variables — CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, CLAUDE_CODE_SKIP_PROMPT_HISTORY](https://code.claude.com/docs/en/env-vars)
- [CC: Explore the .claude directory — Application data, Plaintext storage, Clear local data](https://code.claude.com/docs/en/claude-directory#application-data)
- [CC: Data usage](https://code.claude.com/docs/en/data-usage)
- [OW: LLM02:2025 Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/)

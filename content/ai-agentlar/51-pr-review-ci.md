# 51 — PR'da AI review: CodeRabbit kabi

[Mundarija](README.md)

> ⚑ Bob rasmiy hujjat asosida (Code Review, Claude Code GitHub Actions, `/code-review`, ultrareview). Sinov repozitoriysiga hech qanday
> kirish ma'lumoti (token, secret) qo'shilmadi — bu ataylab qilingan qaror. Bitta qism haqiqiy: agent yozgan test workflow'i va uning
> action versiyalari tekshiruvi.

## Tushuncha

CodeRabbit kabi vositalar har PR'ga avtomatik review yozadi: qatorlarga izoh, xulosa, buyruqlar (`@coderabbitai ...`). Claude ekotizimida
xuddi shu vazifani bajaradigan bir nechta yo'l bor — ular **kim ishga tushiradi**, **qayerda ishlaydi** va **qaysi rejada** mavjudligi bilan
farq qiladi (CC, Code Review — Compare ways to get a review):

| Variant | Nima ishga tushiradi | Qayerda ishlaydi | Kim uchun | Repo'ga token |
| --- | --- | --- | --- | --- |
| **Code Review** | PR faolligi (repo sozlamasiga qarab) yoki `@claude review` izohi | Anthropic infratuzilmasi | Team, Enterprise — tashkilot egasi yoqadi | Yo'q (GitHub App) |
| **GitHub Actions** (`claude-code-action`) | Workflow hodisalari: har PR, `@claude`, jadval | O'z CI runner'laringiz | API kalit yoki obuna tokeni bor har kim | Ha (secret) |
| **`/code-review --comment`** | O'zingiz, sessiyada | Kompyuteringiz | Har qanday reja | Yo'q (lokal `gh`) |
| **Ultrareview** (`/code-review ultra`) | O'zingiz | Bulut sandbox | claude.ai hisobi | Yo'q |
| O'z review'chingiz (skill, subagent) | Siz yoki Claude, sessiyada | Claude Code qayerda bo'lsa | Har kim | Yo'q |

CodeRabbit'ga eng yaqini — **Code Review** (hech narsa yozmasdan har PR'da) va **GitHub Actions avtomatlashtirish rejimi** (o'zingiz
sozlaysiz). Qolganlari — qo'lda ishga tushiriladi.

## Code Review

CC (Code Review): bir nechta agent diff'ni atrofdagi kod bilan birga parallel o'qiydi (mantiqiy xatolar, xavfsizlik zaifliklari, buzilgan
chekka holatlar), keyin **tekshirish bosqichi** topilmalarni kodga solishtirib soxta signallarni olib tashlaydi, qolganlari takrorsiz
qilinib jiddiyligi bo'yicha tartiblanadi va PR'ga yoziladi.

PR'da nima paydo bo'ladi:

| Element | Mazmuni |
| --- | --- |
| Qator izohlari | Har topilma tegishli qatorda, belgisi bilan: 🔴 Important (merge'dan oldin tuzatish kerak), 🟡 Nit (kichik, bloklamaydi), 🟣 Pre-existing (bu PR kiritmagan, avvaldan bor xato) |
| Xulosa | Review tanasida |
| Check run | **Claude Code Review** — muvaffaqiyatsiz deb yakunlanmaydi |

Muhim: review PR'ni **tasdiqlamaydi va bloklamaydi** — merge qarori jamoada. Standart holatda e'tibor — to'g'rilikda (production'ni
buzadigan xatolar), formatlash yoki test qamroviga emas. CC ogohlantiradi: topilma yo'qligi kod xatosiz yoki xavfsiz degani emas.

### Yoqish

Tashkilot **egasi** (Owner) claude.ai'da **Admin settings → Claude Code** bo'limida yoqadi va **Claude GitHub App** ni o'rnatadi —
workflow fayli ham, secret ham kerak emas. Har repo uchun:

| Sozlama | Variantlar |
| --- | --- |
| Qachon ishlaydi | PR ochilganda bir marta / har push'dan keyin / faqat so'ralganda (`@claude review`) |
| Chuqurlik | Quick (eng tez, eng arzon) / Standard (standart) / Deep (eng chuqur, eng qimmat) |

Cheklovlar: faqat Team va Enterprise; GitHub repo'lari; Zero Data Retention yoki HIPAA konfiguratsiyasida mavjud emas. Review repo'ni
**faqat o'qiydi**, commit push qilmaydi, kodni build qilmaydi va ishga tushirmaydi.

GitHub App ruxsatlari haqida (CC, GitHub Actions — GitHub App permissions): Claude GitHub App barcha GitHub integratsiyalari uchun umumiy
va o'rnatishda **to'liq ruxsatlar to'plami** qabul qilinadi (Contents, Pull requests, Workflows — o'qish va yozish va boshqalar); GitHub
qisman qabul qilishga ruxsat bermaydi. Tashkilot faqat kerakli ruxsatlarni xohlasa, hujjat o'z GitHub App'ini yaratishni tavsiya qiladi.

### PR izohidagi buyruqlar

| Buyruq | Nima qiladi |
| --- | --- |
| `@claude review` (`@claude review once`) | Bitta review, kelgusi push'larga obuna qilmasdan |
| `@claude review always` | Review va keyingi har push'da review'ga obuna |
| `@claude review stop` (`off`, `pause`) | Obunani to'xtatish |

Avtomatik review'lar draft PR'lar va fork'dan kelgan PR'larni o'tkazib yuboradi — ular uchun izoh buyrug'i.

### O'z qoidalaringiz: `REVIEW.md`

CC (Customize Code Review): ikki fayl —

- **`CLAUDE.md`** — loyiha qoidalari; ularni buzish topilmaga aylanadi (13-bob).
- **`REVIEW.md`** — faqat review uchun qoidalar; repo ildizida (himoyalangan branch'da ichki papkalarda ham). Topuvchi va tekshiruvchi agentlar
  uni standart ko'rsatmalar bilan birga oladi; yakuniy jiddiylikni belgilashda ham hisobga olinadi.

Muhim xavfsizlik tafsiloti: `REVIEW.md` asosiy (base yoki standart) branch'dan o'qiladi, **PR'ning o'z o'zgarishlaridan hech qachon** — PR
muallifi review qoidalarini o'z PR'ida o'zgartirib qo'ya olmaydi (37-bobdagi injection'ga qarshi).

Hujjatdagi namuna tuzilishi: "Important nimani anglatadi" (jiddiylikni loyihaga moslash), "Nit'lar chegarasi" (masalan, review'da ko'pi bilan
beshta), "Xabar qilinmasin" (CI tekshiradigan narsalar, generatsiya qilingan fayllar), "Doim tekshirilsin". Bizning kalkulyator uchun
(XI qism) shunday bo'lishi mumkin:

```markdown
# Review instructions

## What Important means here
Important — summa noto'g'ri hisoblanishi, yig'indi summaga teng bo'lmasligi, validatsiyani chetlab o'tish,
statik fayllar oq ro'yxatidan tashqariga chiqish. Uslub va nomlash — ko'pi bilan Nit.

## Cap the nits
Report at most five Nits per review.

## Do not report
- npm test tekshiradigan narsalar
- deploy/ dagi izoh matnlari

## Always check
- Yangi API maydonlari validate.js da tekshiriladi va testlari bor
- Summalar faqat butun son, float ishlatilmaydi
- public/ dagi yo'llar nisbiy (/kalkulyator/ ostida ishlashi uchun)
```

### Narx

CC (Code Review costs): Code Review **usage credits** orqali, token sarfi bo'yicha, rejaga kiritilgan foydalanishdan **alohida** va
tashkilotga hisoblanadi (PR ochgan dasturchiga emas). Narx chuqurlik darajasi, o'zgarish hajmi, atrofdagi kodning murakkabligi va
tekshiriladigan nomzod topilmalar soniga bog'liq. Review'lar soni — repo sozlamasiga: admin sahifasidan qo'shilgan repo **"After every
push"** dan boshlanadi — eng ko'p review. Hujjat keng joriy qilishdan oldin kichik pilot bilan oylik sarfni baholashni tavsiya qiladi.

## GitHub Actions: o'zingiz sozlaydigan review

CC (Claude Code GitHub Actions) — ikki rejim (33-bob):

- **Interaktiv** — workflow'da `prompt` yo'q: Claude izohdagi `@claude` ni kutadi.
- **Avtomatlashtirish** — `prompt` bor: Claude eslatmasiz, hodisada ishlaydi.

Hujjatdagi PR review workflow'i (avtomatlashtirish rejimi, `code-review` plagini bilan):

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          plugin_marketplaces: "https://github.com/anthropics/claude-plugins-official.git"
          plugins: "code-review@claude-plugins-official"
          prompt: "/code-review:code-review --comment ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
          claude_args: '--allowedTools "mcp__github_inline_comment__create_inline_comment"'
```

Ikki qator review qayerga borishini boshqaradi (CC): `--comment` — topilmalar PR'ga qator izohi (topilma bo'lmasa — bitta xulosa izohi),
usiz faqat workflow log'ida; `claude_args` dagi `--allowedTools` — qator izohi yozadigan MCP serverni action faqat shunda ishga tushiradi.
Claude draft va yopiq PR'larni, review kerak emas deb hisoblaganlarini (avtomatik yoki arzimas) va allaqachon Claude izohi bor PR'larni
o'tkazib yuboradi.

**O'z buyruqlaringiz** — `prompt` ga repo'dagi skill: `.claude/skills/` dagi skill uchun avval `actions/checkout`, keyin `prompt: "/skill-nomi"`.
Ya'ni CodeRabbit'dagi "custom instructions" o'rniga — git'dagi skill fayli (25-bob), masalan yuqoridagi `REVIEW.md` qoidalari bilan
`review-kalkulyator` skill'i.

Obuna bilan: `anthropic_api_key` o'rniga `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` (`claude setup-token` bilan;
Pro, Max, Ultra, Team, Enterprise). CC: bir nechta repo uchun umumiy secret'da OAuth token emas, API kalit — token uni yaratgan odamning
obunasiga bog'langan.

Xavfsizlik va narx (CC):

- kalit yoki tokenni **hech qachon** repo'ga commit qilmang — faqat GitHub Secrets;
- workflow'ga faqat kerakli ruxsatlar;
- ishga tushirishni faqat repo'ga yozish huquqi bor foydalanuvchi qila oladi; bot'lar standart holatda rad etiladi (`allowed_bots`);
- har ishga tushirish — GitHub Actions daqiqalari va tokenlar; `--max-turns`, workflow timeout, concurrency bilan cheklang.

### Faqat testlar uchun workflow

Claude'siz, oddiy CI — har PR'da `npm test`. 49-bobdagi uslubda agent yozgan workflow (sinov repo'siga push qilinmadi: GitHub
`.github/workflows/` fayllari uchun `gh` tokenida `workflow` ruxsatini talab qiladi, u qo'shilmadi):

```yaml
name: Testlar
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 26
      - run: npm test
```

Agentga "action versiyalarini taxmin qilma" deyilgan edi — u teglarni `git ls-remote --tags` bilan o'qib, action'larni to'liq commit SHA
bilan qotirdi ("teglarni keyin boshqa commitga ko'chirish mumkin, SHA esa o'zgarmaydi"). Mustaqil tekshiruv:

```text
$ git ls-remote --tags https://github.com/actions/checkout 'v7*'
3d3c42e5aac5ba805825da76410c181273ba90b1	refs/tags/v7
3d3c42e5aac5ba805825da76410c181273ba90b1	refs/tags/v7.0.1
$ git ls-remote --tags https://github.com/actions/setup-node 'v7*'
949feb2413d6458794dcd2491c4babbbce0c15c1	refs/tags/v7
949feb2413d6458794dcd2491c4babbbce0c15c1	refs/tags/v7.1.0
```

SHA'lar teglarga mos. Bu — 39-bobdagi ta'minot zanjiri xavfiga qarshi oddiy, lekin samarali odat.

## Tokensiz variantlar

**`/code-review <PR> --comment`** (CC, Review locally): review sizning sessiyangizda ishlaydi va topilmalarni GitHub PR'ga qator izohlari
qilib yozadi (GitLab merge request'ga — `glab` orqali bitta izoh). Har qanday rejada; GitHub'ga kompyuteringizdagi `gh` login orqali.
50-bobda xuddi shu buyruq `--comment` siz ishlatilgan edi.

**Ultrareview** (`/code-review ultra`, research preview): bulut sandbox'da ko'p reviewer agentlar; har topilma mustaqil takrorlanib
tekshiriladi. claude.ai hisobi kerak (faqat API kalit bilan emas). Pro, Max, Ultra'da 3 ta bepul ishga tushirish, keyin usage credits
(CC, Commands).

## Boshqa joylarda yordamchi

Review — bitta misol. Xuddi shu agentni boshqa joylarga ham ulash mumkin (58-bob): Slack'da `@Claude` (bug xabaridan PR'gacha), GitLab
CI/CD, Channels (Telegram, Discord yoki o'z serveringizdan hodisa lokal sessiyaga), jadval bo'yicha vazifalar (har kuni review, issue
saralash — 34-bob).

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Team/Enterprise, har PR'da avtomatik | Code Review | Sozlash yo'q, `REVIEW.md`; usage credits, egasi yoqadi, App'ning to'liq ruxsatlari |
| Har qanday reja, to'liq nazorat | GitHub Actions + skill | Prompt, ruxsatlar, model — o'zingizda; repo'da secret, Actions daqiqalari |
| Token qo'ymaslik kerak | `/code-review --comment` | Xavfsiz; har PR'da qo'lda |
| Muhim PR, chuqur tekshiruv | Ultrareview | Yuqori signal; research preview, cheklangan bepul ishga tushirishlar |
| Faqat testlar | Claude'siz CI | Arzon, deterministik; mantiqiy review yo'q |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| AI review'ni merge sharti deb bilish | CC: review tasdiqlamaydi va bloklamaydi; topilma yo'qligi xatosizlik emas | Inson review'i + testlar |
| Kalitni workflow fayliga yozish | CC: hech qachon commit qilmang | GitHub Secrets |
| Ochiq repo'ga shaxsiy obuna tokenini qo'yish | Token sizning obunangizga bog'langan | API kalit yoki tokensiz variant |
| "After every push" ni o'ylamasdan qoldirish | Har push — review — xarajat | "Once after PR creation" yoki "Manual" |
| Review qoidalarini PR ichida o'zgartirish | `REVIEW.md` asosiy branch'dan o'qiladi | Qoidalarni alohida PR bilan asosiy branch'ga |
| Action'larni `@v7` kabi teg bilan qoldirish | Teg ko'chishi mumkin | To'liq SHA + izohda versiya |

## Amaliyot

1. Claude'da PR review olishning qaysi variantlari bor va ular nimasi bilan farq qiladi?
2. Code Review PR'ga nima qo'shadi va PR'ni bloklaydimi?
3. `REVIEW.md` nima uchun kerak va nega u PR'ning o'zidan o'qilmaydi?
4. GitHub Actions review workflow'ida `--comment` va `claude_args` nimani boshqaradi?
5. Token qo'ymasdan PR'ga AI review izohlarini qanday olasiz?
6. Nega action'lar SHA bilan qotiriladi va buni qanday tekshirdik?

<details>
<summary>Javoblar</summary>

1. Code Review (avtomatik, Anthropic'da, Team/Enterprise), GitHub Actions (o'z CI'ingizda, secret bilan), `/code-review --comment` (lokal, tokensiz), Ultrareview (bulutda, qo'lda), o'z skill/subagent'ingiz.
2. Qator izohlari (Important / Nit / Pre-existing), xulosa va "Claude Code Review" check run'i. Bloklamaydi va tasdiqlamaydi.
3. Faqat review uchun qoidalar (jiddiylik, nimani aytmaslik, nimani doim tekshirish). Asosiy branch'dan o'qiladi — PR muallifi qoidalarni o'z PR'ida o'zgartira olmasligi uchun.
4. `--comment` — topilmalar PR'ga izoh bo'lib yoziladi (usiz faqat log'da); `claude_args` dagi `--allowedTools` — qator izohi MCP serverini yoqadi.
5. `/code-review <PR> --comment` — kompyuterdagi `gh` login orqali; yoki Ultrareview.
6. Teg boshqa commitga ko'chirilishi mumkin, SHA o'zgarmaydi. `git ls-remote --tags` bilan teglar SHA'ga mosligini tekshirdik.

</details>

## Rasmiy hujjat

- [CC: Code Review](https://code.claude.com/docs/en/code-review) · [Set up](https://code.claude.com/docs/en/code-review-setup) · [Customize (REVIEW.md)](https://code.claude.com/docs/en/code-review-customize) · [Pull requests](https://code.claude.com/docs/en/code-review-pull-requests) · [Costs](https://code.claude.com/docs/en/code-review-costs)
- [CC: Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [CC: Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
- [CC: Find bugs with ultrareview](https://code.claude.com/docs/en/ultrareview)
- [CC: GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)

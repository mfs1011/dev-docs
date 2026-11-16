# 36 — Sandbox va izolyatsiya

[Mundarija](README.md)

## Tushuncha

35-bobda ko'rdik: Bash ruxsat qoidasi buyruq **matniga** mos keladi va xavfsizlik chegarasi emas — `/bin/rm` yoki `bash -c '…'` undan
o'tib ketadi. 26-bobda hook `Edit` tool'ini to'xtatdi, lekin shell buyrug'i `.env` ga baribir yoza olardi. Bu bo'shliqlarni
**sandbox** yopadi.

CC (Configure the sandboxed Bash tool): **Bash sandbox** — Claude kompyuteringizda ishga tushiradigan shell buyruqlari atrofida
**operatsion tizim** majburlaydigan chegara. Siz bu buyruqlar qaysi fayllar va tarmoq domenlariga yeta olishini belgilaysiz. Cheklovlar
Bash, PowerShell va Monitor buyruqlariga hamda ular ishga tushirgan jarayonlarga qo'llanadi.

Ruxsat qoidasidan asosiy farqi (CC):

| | Ruxsat qoidalari | Sandbox |
| --- | --- | --- |
| Qachon tekshiradi | Buyruq ishga tushishidan **oldin**, buyruq matniga qarab | Ishlayotgan jarayonga **operatsion tizim** chegara qo'yadi |
| Nimani qamrab oladi | Barcha tool'lar: Bash, Read, Edit, WebFetch, MCP | Faqat shell buyruqlari va ularning bola jarayonlari |
| Aylanib o'tish | Buyruqning boshqa shakli o'tib ketishi mumkin | Model nima ishga tushirsa ham, ruxsat etilgan buyruq nomidan ko'proq ish qilsa ham chegara saqlanadi |

Ikkalasi bir-birini to'ldiradi: ruxsat qoidalari "qaysi tool ishlaydi"ni, sandbox "ishlagan buyruq nimaga yeta oladi"ni hal qiladi.

### Standart holatda nima cheklanadi

CC — sandbox standart holatda **o'chiq**. Yoqish: sessiyada `/sandbox` yoki sozlamada `sandbox.enabled: true`. Yoqilgandan keyin:

| Kirish | Standart holat | O'zgartirish |
| --- | --- | --- |
| Yozish | Ishchi papka, foydalanuvchining vaqtinchalik papkasi, qo'shilgan papkalar. Himoyalangan yo'llar yozishdan yopiq | `filesystem.allowWrite`, `filesystem.denyWrite` |
| O'qish | Kompyuterning katta qismi, **`~/.ssh` va `~/.aws/credentials` kabi kirish ma'lumotlari fayllari ham** | `filesystem.denyRead`, `credentials` |
| Tarmoq | To'g'ridan-to'g'ri chiqish yo'q. Ulanishlar proksi orqali o'tadi, u har hostni ruxsat etilgan domenlar ro'yxatiga solishtiradi. Ro'yxat boshida bo'sh | `network.allowedDomains`, `network.deniedDomains` |
| Muhit o'zgaruvchilari | Claude Code'dan meros, ichidagi sirlar bilan birga | `credentials`, `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` |

Diqqat: o'qish standart holatda **cheklanmagan**. Maxfiy fayllar uchun `denyRead` yoki `credentials` sozlamasi kerak (38-bob).

Operatsion tizim darajasida (CC): macOS'da **Seatbelt**, Linux va WSL2'da **bubblewrap**. Mahalliy Windows'da sandbox yo'q, buyruqlar
sandbox'siz ishlaydi — WSL2 kerak.

### Sandbox'dan tashqarida nima ishlaydi

CC aniq sanaydi — sandbox faqat shell buyruqlarini o'raydi:

- **o'rnatilgan fayl va veb tool'lari** (Read, Edit, Write, WebFetch, WebSearch) ruxsat qoidalariga bo'ysunadi. `denyRead` Read tool'ini
  to'xtatmaydi, `allowedDomains` WebFetch'ni cheklamaydi;
- **Claude Code ishga tushiradigan boshqa jarayonlar**: hook'lar, lokal MCP serverlar, plagin monitorlari, LSP serverlar — to'liq
  huquqingiz bilan ishlaydi (29-bob);
- **sandbox'siz qayta urinish**: sandbox'da yiqilgan buyruqni Claude `dangerouslyDisableSandbox` bilan sandbox'siz qayta ishga
  tushirishni so'rashi mumkin.

Hammasini bitta chegara ortiga qo'yish uchun Claude Code jarayonining **o'zini** konteyner, VM yoki sandbox runtime ichida ishga
tushirish kerak (pastdagi jadval).

### Rejimlar va "qochish yo'li"

CC — ikki sandbox rejimi. Ikkalasida ham bir xil fayl va tarmoq cheklovlari bor:

| Rejim | Farqi |
| --- | --- |
| **Auto-allow** | Sandbox ichida ishlaydigan buyruq **so'ralmasdan** tasdiqlanadi (`autoAllowBashIfSandboxed`) |
| **Regular permissions** | Sandbox ichida bo'lsa ham har buyruq odatiy ruxsat jarayonidan o'tadi |

Auto-allow rejimida ham quyidagilar amal qiladi: Bash deny qoidasiga mos buyruq bloklanadi, muhim yo'llarni o'chiradigan `rm` so'raladi,
`Bash(git push *)` kabi ask qoidalari so'rov chiqaradi.

**Sandbox'siz qayta urinish** — sandbox bilan mos kelmaydigan vositalar uchun "qochish yo'li". Uni o'chirish uchun **qat'iy sandbox
rejimi**: `"allowUnsandboxedCommands": false`. CC ogohlantiradi: platforma sandbox'ni qo'llab-quvvatlamasa yoki tekshiruv yiqilsa,
Claude Code standart holatda buyruqlarni **sandbox'siz** ishga tushiradi. Buning o'rniga ishga tushmay to'xtashi uchun
`"failIfUnavailable": true`.

## Amalda: sandbox ishlayotganini tekshirish

CC "Confirm commands run inside the sandbox" jadvalidagi buyruqlar sinov repo'sida, bitta sessiya uchun `--settings` bilan yoqilgan
qat'iy sandbox'da ishga tushirildi (Claude Code 2.1.325, macOS):

```bash
claude -p "Quyidagi uchta buyruqni ALOHIDA-ALOHIDA ishga tushir ... Hech birini sandbox'siz qayta urinma.
1) touch ~/sandbox-probe 2) curl --noproxy '*' https://example.com 3) echo ok > ichki.txt && cat ichki.txt" \
  --settings '{"sandbox":{"enabled":true,"autoAllowBashIfSandboxed":true,"allowUnsandboxedCommands":false,"failIfUnavailable":true}}'
```

Natijalar (tool natijalari, foydalanuvchi nomi yashirilgan):

| Buyruq | Natija | CC kutgan natija |
| --- | --- | --- |
| `touch ~/sandbox-probe` | `touch: /Users/…/sandbox-probe: Operation not permitted` (exit 1) | macOS'da `Operation not permitted` |
| `curl --noproxy '*' https://example.com` | `curl: (6) Could not resolve host: example.com` (exit 6) | `Could not resolve host`, chunki buyruqning proksidan aylanib o'tadigan yo'li yo'q |
| `echo ok > ichki.txt && cat ichki.txt` | `ok` | Ishchi papkaga yozish ruxsat etilgan |

Sessiyadan keyin `ls ~/sandbox-probe` → `No such file or directory`: uy papkasiga hech narsa yozilmadi. `ichki.txt` esa repo'da paydo
bo'ldi. Uchala buyruq ham ruxsat so'ramasdan ishladi — auto-allow rejimi sandbox ichidagi buyruqlarni o'zi tasdiqladi, chegarani esa
operatsion tizim ushlab turdi.

26-bobdagi bo'shliqni eslang: hook `Edit` ni to'xtatgan edi, lekin `echo "DEBUG=1" >> .env` kabi shell buyrug'i o'tib ketishi mumkin
edi. Sandbox `filesystem.denyWrite` bilan aynan shunday yozishni operatsion tizim darajasida yopadi.

## Izolyatsiya darajalari

CC (Choose a sandbox environment):

| Yondashuv | Nima izolyatsiyalanadi | Docker kerakmi | Sozlash |
| --- | --- | --- | --- |
| Sandboxed Bash tool | Bash, PowerShell, Monitor buyruqlari va ularning jarayonlari | Yo'q | macOS'da minimal |
| Sandbox runtime | **Butun** Claude Code jarayoni: fayl tool'lari, MCP serverlar, hook'lar | Yo'q | Past |
| Dev container | To'liq ishlab chiqish muhiti | Ha | O'rtacha |
| Maxsus konteyner | To'liq ishlab chiqish muhiti | Ha | O'rtacha–yuqori |
| Virtual mashina | To'liq operatsion tizim | Yo'q | Yuqori |
| Bulut sessiyalari | To'liq operatsion tizim, Anthropic joylashtiradi | Yo'q | Yo'q (obuna kerak) |

CC ning ogohlantirishi:

- **Izolyatsiya buzilish ta'sirini kamaytiradi, lekin xavfni yo'q qilmaydi.** Tarmoqqa chiqishga ruxsat beradigan har qanday yondashuv
  agent o'qiy oladigan ma'lumotni oqizishi mumkin. Loyiha papkasini yozish uchun ulagan yondashuv bu kodni o'zgartirishi mumkin.
- **Izolyatsiya modelga nima yuborilishini o'zgartirmaydi.** So'rovlaringiz va Claude o'qigan fayllar sandbox bo'lsa ham, bo'lmasa ham
  API'ga yuboriladi (38-bob).

## Codex bilan solishtirish ⚑

CX (Agent approvals & security) bo'yicha Codex'da tarmoqqa kirish standart holatda **o'chiq**. Lokal ishda Codex operatsion tizim
majburlaydigan sandbox bilan ishlaydi (odatda joriy ish papkasi bilan cheklangan), ustiga harakatdan oldin qachon to'xtab so'rash
kerakligini belgilaydigan tasdiq siyosati qo'shiladi. 33-bobda ko'rganimizdek, `codex exec` standart holatda faqat o'qish sandbox'ida
ishlaydi.

| | Claude Code | Codex |
| --- | --- | --- |
| Sandbox standart holatda | O'chiq (`/sandbox` bilan yoqiladi) | Yoqiq |
| Tarmoq standart holatda | Sandbox yoqilsa — ruxsat etilgan domenlar ro'yxati (boshida bo'sh) | O'chiq |
| Ruxsat boshqaruvi | Ruxsat rejimlari + allow/ask/deny qoidalari | Tasdiq siyosati + sandbox rejimi |

## Variantlar

| Tahdid | Mos izolyatsiya | Nega |
| --- | --- | --- |
| Agent tasodifan loyihadan tashqariga yozadi | Sandboxed Bash (`allowWrite` standart) | Yozish ishchi papka bilan cheklanadi |
| Buyruq ma'lumotni internetga oqizadi | Sandbox `allowedDomains` | Faqat ruxsat etilgan domenlar |
| Shell `~/.ssh` kalitlarini o'qiydi | Sandbox `denyRead` yoki `credentials` | Standart holatda o'qish ochiq |
| Hook, MCP server yoki plagin zararli bo'lishi mumkin | Sandbox runtime, konteyner yoki VM | Ular Bash sandbox'idan tashqarida ishlaydi |
| `bypassPermissions` kerak (hech qanday so'rovsiz) | Faqat konteyner yoki VM ichida | 35-bob |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Sandbox yoqilgan — demak hamma narsa izolyatsiyalangan | CC: fayl tool'lari, hook'lar, MCP serverlar sandbox'dan tashqarida | Ruxsat qoidalari ham kerak; to'liq izolyatsiya uchun konteyner/VM |
| `~/.ssh` sandbox'da himoyalangan deb o'ylash | CC: o'qish standart holatda ochiq | `denyRead` yoki `credentials` |
| `allowUnsandboxedCommands` ni yoqiq qoldirish | Claude yiqilgan buyruqni sandbox'siz qayta urinishi mumkin | Qat'iy rejim: `false` |
| Sandbox ishlamasa ham davom etishga ruxsat | CC: standart holatda sandbox'siz ishlaydi | `failIfUnavailable: true` |
| Sandbox'ni `!` bilan o'zingiz tekshirish | CC: siz yozgan `!` buyruqlari odatda sandbox'siz ishlaydi | Tekshiruv buyruqlarini Claude'ga ishga tushirtiring |
| Sandbox bor — maxfiy fayl modelga bormaydi deb o'ylash | CC: izolyatsiya modelga yuboriladigan narsani o'zgartirmaydi | 38-bob: `Read` deny va ma'lumotlardan foydalanish |

## Amaliyot

1. Sandbox ruxsat qoidalaridan nimasi bilan farq qiladi?
2. Sandbox standart holatda yozish, o'qish va tarmoqni qanday cheklaydi?
3. Nimalar sandbox'dan tashqarida ishlaydi?
4. Qat'iy sandbox rejimi va `failIfUnavailable` nima uchun kerak?
5. Tajribada uchta buyruq qanday natija berdi va bu nimani ko'rsatdi?
6. Hook, MCP server va fayl tool'larini ham izolyatsiya qilish uchun nima kerak?

<details>
<summary>Javoblar</summary>

1. Ruxsat qoidalari buyruq ishga tushishidan oldin uning matniga qarab tekshiradi va barcha tool'larga taalluqli. Sandbox ishlayotgan shell jarayoniga operatsion tizim darajasida chegara qo'yadi va buyruq qanday yozilganidan qat'i nazar saqlanadi.
2. Yozish — ishchi papka, vaqtinchalik papka va qo'shilgan papkalar bilan cheklanadi; o'qish — ko'p joyda ochiq (kirish ma'lumotlari fayllari ham); tarmoq — faqat proksi orqali, ruxsat etilgan domenlarga (ro'yxat boshida bo'sh).
3. O'rnatilgan fayl va veb tool'lari, hook'lar, lokal MCP serverlar, plagin monitorlari, LSP serverlar, siz yozgan `!` buyruqlari, `excludedCommands` va sandbox'siz qayta urinishlar.
4. `allowUnsandboxedCommands: false` — Claude yiqilgan buyruqni sandbox'siz qayta ishga tushira olmaydi. `failIfUnavailable: true` — sandbox ishga tushmasa, Claude Code buyruqlarni sandbox'siz ishlatish o'rniga to'xtaydi.
5. Uy papkasiga yozish `Operation not permitted` bilan, proksisiz internet `Could not resolve host` bilan bloklandi, ishchi papkaga yozish ishladi. Chegarani operatsion tizim ushlab turdi, buyruqlar esa so'rovsiz ishladi (auto-allow).
6. Claude Code jarayonining o'zini sandbox runtime, dev container, konteyner yoki VM ichida ishga tushirish.

</details>

## Rasmiy hujjat

- [CC: Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing)
- [CC: Choose a sandbox environment](https://code.claude.com/docs/en/sandbox-environments)
- [CC: Configure permissions — What a Bash rule doesn't match](https://code.claude.com/docs/en/permissions)
- [CX: Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security)

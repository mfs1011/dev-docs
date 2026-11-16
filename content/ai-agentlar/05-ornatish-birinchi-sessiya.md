# 05 — O'rnatish va birinchi sessiya

[Mundarija](README.md)

Bu bobda Claude Code o'rnatiladi va birinchi sessiya ochiladi. Barcha chiqishlar sinov kompyuterida (macOS, Apple Silicon)
Claude Code 2.1.325 bilan olingan.

## Tushuncha

### Nima kerak

CC (Advanced setup) — tizim talablari:

| Talab | Qiymat |
| --- | --- |
| Operatsion tizim | macOS 13.0+, Windows 10 1809+ yoki Windows Server 2019+, Ubuntu 20.04+, Debian 10+, Alpine Linux 3.19+ |
| Qurilma | 4 GB+ RAM, x64 yoki ARM64 protsessor |
| Tarmoq | Internet ulanishi shart |
| Shell | Bash, Zsh, PowerShell yoki CMD |
| Joylashuv | Anthropic qo'llab-quvvatlaydigan davlatlar |

Qo'shimcha: **ripgrep** (fayl ichidan tez qidirish vositasi) odatda Claude Code bilan birga keladi. **Git** majburiy emas,
lekin agentning ko'p imkoniyati (commit, branch, diff) unga tayanadi.

CC (Quickstart) bo'yicha yana kerak:

- terminal;
- ishlash uchun kod loyihasi;
- hisob: Claude obunasi (Pro, Max, Ultra, Team yoki Enterprise), Claude Console hisobi yoki qo'llab-quvvatlanadigan bulut
  provayderi orqali kirish.

### O'rnatish usullari

CC (Quickstart) to'rt usulni beradi:

| Usul | Buyruq | Yangilanish |
| --- | --- | --- |
| **Native o'rnatuvchi** (tavsiya etiladi) — macOS, Linux, WSL | `curl -fsSL https://claude.ai/install.sh \| bash` | Fonda avtomatik |
| Native o'rnatuvchi — Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` | Fonda avtomatik |
| Homebrew | `brew install --cask claude-code` | Qo'lda: `brew upgrade claude-code` |
| WinGet | `winget install Anthropic.ClaudeCode` | Qo'lda: `winget upgrade Anthropic.ClaudeCode` |

Debian, Fedora, RHEL va Alpine'da apt, dnf yoki apk bilan ham o'rnatish mumkin (CC Advanced setup). Ular ham standart
holatda avtomatik yangilanmaydi.

Ikki muhim tafsilot:

- **Native o'rnatuvchi jarayonni ko'rsatmaydi** (CC Quickstart). Buyruq yuklab olayotganda ekranda hech narsa
  chiqmaydi — bu xato emas. Tugagach, yangi terminal oynasini oching.
- **Windows'da** CC Git for Windows'ni tavsiya qiladi: shunda Claude Code Bash tool'idan foydalana oladi. U o'rnatilmagan
  bo'lsa, shell sifatida PowerShell ishlatiladi. WSL uchun Git for Windows kerak emas.

### Yangilanish kanali

CC (Advanced setup): native o'rnatish ishga tushganda va ishlab turganda yangilanishni tekshiradi. Yangilanish fonda yuklanib
o'rnatiladi va keyingi ishga tushirishda kuchga kiradi. `autoUpdatesChannel` sozlamasi kanalni tanlaydi:

| Kanal | Nima oladi |
| --- | --- |
| `latest` (standart) | Yangi imkoniyatlarni chiqishi bilanoq |
| `stable` | Odatda bir hafta eskiroq versiya, katta muammosi topilgan relizlar o'tkazib yuboriladi |

Homebrew'da kanal cask nomi bilan tanlanadi: `claude-code` — stable, `claude-code@latest` — latest.

## Amalda

### 1. O'rnatishni tekshirish

CC (Quickstart): o'rnatish tugagach, yangi terminal oynasida:

```bash
claude --version
```

```text
2.1.325 (Claude Code)
```

Versiya raqami va `(Claude Code)` chiqsa, o'rnatish ishlayapti. `command not found` chiqsa, o'rnatish papkasi hali `PATH`
da yo'q — CC'ning "Fix your PATH" bo'limiga qarang.

Batafsilroq tekshiruv uchun `claude doctor`. CC (Advanced setup) bo'yicha u sessiya ochmasdan, faqat o'qish rejimida
o'rnatish va sozlamalar holatini ko'rsatadi:

```bash
claude doctor
```

```text
Claude Code doctor

Running: native (2.1.325)
Commit: a360e7297ecf
Platform: darwin-arm64
Path: /Users/…/.local/share/claude/versions/2.1.325
Config install method: native
Search: OK (bundled)
Auto-updates: enabled
Auto-update channel: latest
Last update attempt: success → 2.1.325 (2026-11-16)
...
No installation issues found.

For a full setup checkup that can also fix issues, run /doctor in a Claude Code session.
```

`...` o'rnida hisobga va tashkilot siyosatiga oid qatorlar bor edi, ular olib tashlandi; `Path` dagi foydalanuvchi nomi `…` bilan yashirildi. Nimani ko'rish kerak:

- `Running: native` — native o'rnatuvchi bilan o'rnatilgan;
- `Search: OK (bundled)` — ripgrep birga kelgan va ishlayapti;
- `Auto-updates: enabled` va `Last update attempt: success` — avtomatik yangilanish ishlayapti.

### 2. Birinchi ishga tushirish va kirish

```bash
cd loyihangiz
claude
```

CC (Authentication): birinchi ishga tushirishda brauzer oynasi ochiladi va hisobingizga kirasiz.

- Brauzer o'zi ochilmasa, `c` tugmasi kirish havolasini nusxalaydi, uni brauzerga qo'yasiz.
- Brauzer qaytish o'rniga kod ko'rsatsa, uni terminaldagi `Paste code here if prompted` qatoriga joylang.
- Kirish tugagach, terminalda `Login successful` chiqadi va `Enter` bosishni so'raydi.

Kirish ma'lumotlari saqlanadi va qayta kirish shart emas. CC (Authentication) bo'yicha ular quyidagi joyda saqlanadi:

| Tizim | Qayerda |
| --- | --- |
| macOS | Shifrlangan macOS Keychain |
| Linux | `~/.claude/.credentials.json`, fayl huquqi `0600` (faqat egasi o'qiy oladi) |
| Windows | `%USERPROFILE%\.claude\.credentials.json`, foydalanuvchi profili papkasining huquqlari bilan |

Hisobni almashtirish yoki qayta kirish uchun sessiya ichida `/login`, chiqish uchun `/logout`.

**API kalit bilan.** `ANTHROPIC_API_KEY` muhit o'zgaruvchisi o'rnatilgan bo'lsa, Claude Code bir marta "shu kalitdan
foydalanaymi?" deb so'raydi. Rozi bo'lsangiz, kirish oynasi chiqmaydi. CC (Authentication) ogohlantiradi: skript rejimida
(`-p`) kalit mavjud bo'lsa, so'ramasdan har doim ishlatiladi. Obuna bilan kirgan bo'lsangiz-u, muhitda tasodifan
kalit qolib ketgan bo'lsa, so'rovlar shu kalit hisobidan to'lanadi.

### 3. Papkaga ishonch oynasi

Yangi papkada `claude` ni birinchi marta ishga tushirganda shunday oyna chiqadi (sinov papkasida olingan, yo'l qisqartirildi):

```text
Accessing workspace:
…/scratchpad/lab/yangi-loyiha

Quick safety check: Is this a project you created or one you trust? (Like your
own code, a well-known open source project, or work from your team). If not,
take a moment to review what's in this folder first.

Claude Code'll be able to read, edit, and execute files here.

Security guide

❯ No, exit
  Yes, I trust this folder

Enter to confirm · Esc to cancel
```

Tarjimasi: "Bu siz yaratgan yoki ishonadigan loyihami (o'z kodingiz, mashhur ochiq kodli loyiha yoki jamoangiz ishi)?
Agar yo'q bo'lsa, avval papkada nima borligini ko'rib chiqing. Claude Code bu yerdagi fayllarni o'qiy, tahrirlay va ishga
tushira oladi."

E'tibor bering: kursor standart holatda **"No, exit"** ustida turibdi. Ishonish uchun bitta pastga tushib `Enter` bosish
kerak.

Bu oyna nima uchun kerak? CC (Glossary — Project trust): Claude Code papka konfiguratsiyasini yuklashdan oldin uni
tasdiqlashingizni so'raydi. Tasdiq har bir papka uchun saqlanadi. Faqat uy papkangiz (`~`) bundan mustasno: u yerda ishonch
faqat joriy sessiyaga beriladi va oyna har safar qayta chiqadi. Ishonmaguningizcha Claude Code repo bergan ba'zi
narsalarni ishlatmaydi, masalan `.claude/settings.json` dagi ruxsat qoidalarini.

> **Xavfsizlik.** Begona repo'ni (masalan, endigina klonlangan, muallifi noma'lum) ochishdan oldin `.claude/` papkasi va
> `.mcp.json` faylini o'zingiz ko'rib chiqing. CC (Permissions, "What runs before you trust a folder") jadvali bo'yicha
> repo sozlamalaridagi **hook'lar** papkaga ishonilmagan holatlarda ham ishlaydi: siz faqat yuqoridagi papkaga ishongan
> bo'lsangiz yoki `claude -p` bilan ishga tushirgan bo'lsangiz (skript rejimida ishonch oynasi umuman chiqmaydi). Hook — Claude
> Code o'zi ishga tushiradigan shell buyrug'i (26-bob).

### 4. Birinchi savol

CC (Quickstart) birinchi savol sifatida `what does this project do?` ni taklif qiladi. 3-bobdagi sinov loyihasida o'zbekcha
so'raymiz:

```text
bu loyiha nima qiladi? qisqa javob ber
```

```text
Bu savatdagi mahsulotlar narxini hisoblaydigan kichik JavaScript kutubxonasi. Unda ikkita funksiya bor (`narx.js`):

- **`jami(savat)`** — savatdagi har bir mahsulotning `narx × soni` qiymatini qo'shib, umumiy summani qaytaradi.
- **`chegirma(summa, foiz)`** — summadan berilgan foizdagi chegirmani ayirib beradi. Masalan, 25000 dan 10% chegirma 22500 bo'ladi.

`narx.test.js` faylida ikkala funksiya uchun testlar bor, ular `npm test` (`node --test`) bilan ishga tushadi.
```

Qaysi faylni o'qishni aytmadik. CC (Quickstart): Claude Code loyiha fayllarini kerak bo'lganda o'zi o'qiydi, kontekstni qo'lda
qo'shish shart emas.

Claude Code o'zi haqidagi savollarga ham javob beradi (CC How Claude Code works): "hook'larni qanday sozlayman?" yoki
"CLAUDE.md'ni qanday tuzgan ma'qul?" deb so'rash mumkin.

### 5. `/init` — boshlang'ich CLAUDE.md

**CLAUDE.md** — Claude Code har sessiya boshida o'qiydigan loyiha ko'rsatmalari fayli (13-bob). CC (Commands): `/init`
loyihani o'rganib, shu faylning boshlang'ich variantini yaratadi. Agar u OpenAI Codex yoki Google Gemini CLI sozlamalarini
topsa, ularni `/import` bilan ko'chirishni taklif qiladi.

Sinov loyihasida `/init` natijasi:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Run all tests: `npm test` (runs `node --test`; there are no dependencies to install)
- Run a single test by name: `node --test --test-name-pattern="chegirma" narx.test.js`

There is no build or lint step.

## Architecture

A small ES module (`"type": "module"`) for shopping-cart price calculations, with no dependencies:

- `narx.js` exports two pure functions:
  - `jami(savat)` sums `narx * soni` over cart items shaped like `{ narx, soni }`.
  - `chegirma(summa, foiz)` applies a percentage discount to a total.
- `narx.test.js` uses the built-in `node:test` runner and `node:assert/strict`.

## Conventions

- Identifiers, comments, test names and commit messages are in Uzbek (e.g. `narx` = price, `soni` = quantity, `savat` = cart, `jami` = total, `chegirma` = discount, `foiz` = percent). Keep new code consistent with this.
- Commits use a conventional prefix with an Uzbek description, e.g. `fix: jami va chegirma`.
```

Agent o'zi topgan narsalar:

- **bitta testni ishga tushirish buyrug'i** (`--test-name-pattern`) — foydali, chunki uni har safar qidirish shart bo'lmaydi;
- **o'zbekcha nomlash konvensiyasi** — foydali, kod tilini saqlashga yordam beradi;
- **commit prefiksi** — bitta commit'dan xulosa chiqargan.

Lekin bu faylni **qabul qilishdan oldin o'qib chiqing**. CC (Best practices, "What you can stop doing") bo'yicha arxitektura
va fayl joylashuvini CLAUDE.md'ga yozish endi kerak emas: Claude repo'ni o'zi o'qiydi, faylga faqat repo'da yo'q narsani
yozing. Demak `## Architecture` bo'limini qisqartirish yoki o'chirish mumkin. Uni har sessiyada yuklash kontekst egallaydi,
ma'lumotni esa agent koddan baribir oladi. CLAUDE.md'ni qanday tuzish — 13-bob.

### 6. Asosiy buyruqlar

CC (Quickstart) — terminaldan:

| Buyruq | Nima qiladi |
| --- | --- |
| `claude` | Interaktiv sessiya |
| `claude "vazifa"` | Interaktiv sessiyani shu birinchi so'rov bilan boshlaydi |
| `claude -p "so'rov"` | Bir martalik so'rov: javob beradi va chiqadi (33-bob) |
| `claude -c` | Shu papkadagi oxirgi suhbatni davom ettiradi |
| `claude -r` | Oldingi suhbatlardan birini tanlab davom ettiradi |

Sessiya ichida (CC Quickstart, Commands):

| Buyruq | Nima qiladi |
| --- | --- |
| `/help` | Mavjud buyruqlar ro'yxati |
| `/init` | Boshlang'ich CLAUDE.md yaratadi |
| `/doctor` | Sozlamalarni tekshiradi: o'rnatish, sozlamalar, kengaytmalar va CLAUDE.md muammolari. Tuzatishni taklif qiladi va siz tasdiqlagach qo'llaydi |
| `/status` | Versiya, model, hisob va ulanish holati |
| `/model` | Modelni almashtirish (40-bob) |
| `/clear` | Bo'sh kontekst bilan yangi suhbat (15-bob) |
| `/exit` yoki `Ctrl+D` ikki marta | Chiqish |

Foydali tugmalar (CC Quickstart):

- `/` — mavjud buyruq va skill'lar ro'yxati;
- `Tab` — buyruqni to'ldirish;
- `↑` — oldingi so'rovlar tarixi;
- `Shift+Tab` — ruxsat rejimini almashtirish (35-bob).

`claude doctor` va `/doctor` farqi:

- `claude doctor` — terminaldan, sessiyasiz, faqat o'qiydi;
- `/doctor` — sessiya ichida, muammoni topib, tasdiqingiz bilan tuzatadi.

## Variantlar

| O'rnatish | Yutug'i | Kamchiligi | Kimga |
| --- | --- | --- | --- |
| Native o'rnatuvchi | Fonda avtomatik yangilanadi, kanalni sozlamada tanlaysiz | `curl … \| bash` — skriptni internetdan to'g'ridan-to'g'ri ishga tushirish | Ko'pchilik uchun; CC tavsiya qiladi |
| Homebrew | Tanish paket menejeri, kanal cask nomi bilan | O'zi yangilanmaydi: xavfsizlik tuzatishlari uchun `brew upgrade` ni unutmang | Hamma narsani brew bilan boshqaradigan macOS foydalanuvchisi |
| WinGet | Windows'ning standart paket menejeri | O'zi yangilanmaydi | Windows |
| apt, dnf, apk | Tizim paket menejeri, server va konteynerlar uchun qulay | O'zi yangilanmaydi | Linux serverlar, Docker image'lar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| O'rnatgandan keyin shu terminalda `claude` deb yozish | CC: o'rnatuvchi tugagach yangi terminal oynasi kerak | Yangi oyna oching, keyin `claude --version` |
| Begona repo'da o'ylamasdan "Yes, I trust this folder" ni tanlash | Ishonilgan papkada repo sozlamalari to'liq ishlaydi | Avval `.claude/` va `.mcp.json` ni ko'rib chiqing |
| Homebrew bilan o'rnatib, yangilashni unutish | CC: Homebrew o'rnatmasi o'zi yangilanmaydi | `brew upgrade claude-code`, yoki native o'rnatuvchi |
| Obunaga kirgan holda muhitda `ANTHROPIC_API_KEY` qoldirish | CC: `-p` rejimida kalit so'ramasdan ishlatiladi | Kerak bo'lmasa o'zgaruvchini olib tashlang; `/status` da qaysi hisob ishlatilayotganini tekshiring |
| `/init` yaratgan CLAUDE.md'ni o'qimasdan qoldirish | CC: koddan o'qib bo'ladigan narsa (arxitektura, fayl joylashuvi) faylga kerak emas | Faylni qisqartiring: buyruqlar, konvensiyalar, tuzoqlar qolsin (13-bob) |

## Amaliyot

1. Native o'rnatuvchi va Homebrew yangilanish jihatidan qanday farq qiladi?
2. `claude --version` ishlamadi: `command not found`. Sabab nima bo'lishi mumkin?
3. `claude doctor` bilan `/doctor` farqi nima?
4. Ishonch oynasi nima uchun kerak? Uy papkasida u qanday ishlaydi?
5. Begona repo'ni ochishdan oldin nimani ko'rish kerak va nega?
6. `/init` yaratgan CLAUDE.md'dan nimani olib tashlash mumkin? Nega?
7. `claude -c` va `claude -r` farqi nima?

<details>
<summary>Javoblar</summary>

1. Native o'rnatish fonda o'zi yangilanadi (kanal: `latest` yoki `stable`). Homebrew o'rnatmasi o'zi yangilanmaydi, `brew upgrade claude-code` kerak; kanal cask nomi bilan tanlanadi.
2. O'rnatish papkasi hali `PATH` da yo'q yoki yangi terminal oynasi ochilmagan. CC'ning "Fix your PATH" bo'limiga qarash kerak.
3. `claude doctor` — terminaldan, sessiya ochmasdan, faqat o'qish rejimida tekshiradi. `/doctor` — sessiya ichida tekshiradi va topilgan muammoni siz tasdiqlagach tuzatadi.
4. Claude Code papka konfiguratsiyasini yuklashdan oldin ishonchingizni so'raydi; ishonmaguningizcha ba'zi repo sozlamalari (masalan, ruxsat qoidalari) ishlatilmaydi. Uy papkasida ishonch faqat joriy sessiyaga beriladi va oyna har safar qayta chiqadi.
5. `.claude/` papkasi va `.mcp.json`. CC jadvali bo'yicha repo sozlamalaridagi hook'lar ba'zi ishonilmagan holatlarda ham (faqat yuqori papkaga ishonganda, `claude -p` da) ishlaydi.
6. Arxitektura va fayl joylashuvi tavsifini. CC: Claude repo'ni o'zi o'qiydi, faylga faqat repo'da yo'q narsani yozish kerak.
7. `claude -c` shu papkadagi oxirgi suhbatni davom ettiradi. `claude -r` oldingi suhbatlar ro'yxatidan birini tanlashga imkon beradi.

</details>

## Rasmiy hujjat

- [CC: Quickstart](https://code.claude.com/docs/en/quickstart)
- [CC: Advanced setup](https://code.claude.com/docs/en/setup)
- [CC: Authentication](https://code.claude.com/docs/en/authentication)
- [CC: Configure permissions — What runs before you trust a folder](https://code.claude.com/docs/en/permissions#what-runs-before-you-trust-a-folder)
- [CC: Glossary — Project trust](https://code.claude.com/docs/en/glossary)
- [CC: Commands](https://code.claude.com/docs/en/commands)
- [CC: Best practices — What you can stop doing](https://code.claude.com/docs/en/best-practices#what-you-can-stop-doing)

# 04 — Vositalar xaritasi

[Mundarija](README.md)

> ⚑ Bu bobdagi Codex va GitHub Copilot ma'lumotlari faqat ularning rasmiy hujjatidan olingan (2026-11-16 holati), amalda
> sinalmagan. Mavjud imkoniyatlar tarif, mintaqa va tashkilot siyosatiga bog'liq. Har vosita o'z hujjatida buni alohida
> ogohlantiradi.

## Tushuncha

Agentlar bir-biridan ikki narsa bilan farq qiladi:

1. **Kod qayerda bajariladi** — sizning kompyuteringizdami, bulutdagi virtual mashinadami yoki CI'dami.
2. **Siz u bilan qanday ishlaysiz** — terminal, IDE, ilova, brauzer yoki chat orqali.

CC (How Claude Code works) buni aniq ajratadi: agentik sikl, tool'lar va imkoniyatlar hamma joyda bir xil. Faqat kod
bajariladigan joy va siz bilan muloqot qilish usuli o'zgaradi.

### Uch muhit

CC (How Claude Code works) — Claude Code ishlaydigan uch muhit:

| Muhit | Kod qayerda bajariladi | Qachon |
| --- | --- | --- |
| **Lokal** | Sizning kompyuteringizda | Standart holat. Fayllaringiz, vositalaringiz va muhitingizga to'liq kirish |
| **Bulut** (cloud) | Anthropic boshqaradigan virtual mashinalarda yoki tashkilotingiz o'zi boshqaradigan muhitda | Ishni boshqa joyga berib qo'yish, kompyuterda yo'q repo'lar ustida ishlash |
| **Masofadan boshqaruv** (Remote Control) | Sizning kompyuteringizda, brauzerdan boshqariladi | Veb interfeysdan foydalanish, lekin bajarish va fayllar lokal qoladi |

Codex va Copilot hujjatlarida ham xuddi shu bo'linish bor:

- **CX (Codex CLI):** CLI lokal repo ustida ishlaydi — fayllarni ko'radi, tahrirlaydi va kompyuteringizdagi vositalarni ishga
  tushiradi.
- **CX (Codex Cloud):** har vazifaning o'z ish joyi (workspace) bor va kompyuteringiz uxlab yotganda ham ishlay oladi.
- **GH (Copilot on GitHub.com):** uchta tushunchani ajratadi:
  - **klient** — Copilot bilan muloqot qiladigan joy: veb, ilova, IDE, mobil, CLI;
  - **sessiya** — suhbat va unga bog'liq agent ishi;
  - **muhit** — agent ishni bajaradigan joy: bulut sandbox'i, GitHub Actions runner'i yoki masofaviy maxsus muhit.

### Lokal va bulut: asosiy kelishuv

| | Lokal | Bulut |
| --- | --- | --- |
| Fayllaringizga kirish | To'liq: loyiha, o'rnatilgan vositalar, lokal servislar | Faqat repo va muhitga sozlangan narsa |
| Kompyuter o'chsa | Ish to'xtaydi | Davom etadi |
| Kuzatish | Har qadamni real vaqtda ko'rasiz va to'xtata olasiz | Odatda keyin natijani ko'rib chiqasiz |
| Xavfsizlik | Agent sizning huquqlaringiz bilan ishlaydi — ruxsatlar va sandbox muhim (VII qism) | Alohida muhitda ishlaydi, lokal fayllaringizga tegmaydi |
| Bir vaqtda nechta | Kompyuter resursi va worktree'lar bilan cheklangan (31-bob) | Har vazifa alohida ish joyida |

Bu jadval uchala hujjatdagi tavsiflardan yig'ilgan. CC (Platforms) bulutni shunday tavsiflaydi: "ko'p yo'naltirish talab
qilmaydigan uzoq vazifalar yoki siz oflayn bo'lganingizda ham davom etishi kerak bo'lgan ish".

## Claude Code qayerda ishlaydi

CC (Platforms) — platformalar va har biri nima uchun eng mos:

| Platforma | Eng mos | Nima beradi |
| --- | --- | --- |
| **CLI** (terminal) | Terminal bilan ishlash, skriptlar, masofaviy serverlar | To'liq imkoniyatlar to'plami, Agent SDK, uchinchi tomon provayderlari |
| **Desktop** ilova | Vizual ko'rib chiqish, parallel sessiyalar | Diff ko'rish oynasi, ilovani oldindan ko'rish |
| **VS Code** | VS Code'dan chiqmasdan ishlash | Tahrirlar shu yerning o'zida, ichki terminal, fayl konteksti |
| **JetBrains** | IntelliJ, PyCharm, WebStorm va boshqa JetBrains IDE'lari | Diff oynasi, tanlangan kodni ulashish, terminal sessiyasi |
| **Web** (claude.ai/code) | Ko'p yo'naltirish talab qilmaydigan uzoq vazifalar, oflayn bo'lganda ham davom etishi kerak bo'lgan ish | Bulutda ishlaydi, ulanish uzilgandan keyin ham davom etadi |
| **Mobil** | Kompyuterdan uzoqda vazifa boshlash va kuzatish | Bulut sessiyalari, lokal sessiyani Remote Control bilan boshqarish |

CC muhim tafsilotni qo'shadi: skript rejimi va Agent SDK **faqat CLI'da** bor. Desktop va IDE kengaytmalari vizual ko'rib
chiqish va muharrir bilan yaqinroq integratsiya evaziga CLI'ning ba'zi imkoniyatlaridan voz kechadi. Bitta loyihada bir
nechta platformani aralashtirib ishlatish mumkin: sozlamalar, loyiha xotirasi va MCP serverlar lokal platformalar o'rtasida
umumiy.

### Integratsiyalar

CC (Platforms):

| Integratsiya | Nima qiladi | Nima uchun |
| --- | --- | --- |
| Chrome | Brauzeringizni tizimga kirgan sessiyalaringiz bilan boshqaradi | Veb-ilovani sinash, forma to'ldirish (23-bob) |
| GitHub Actions, GitLab CI/CD | Claude'ni CI pipeline ichida ishga tushiradi | Avtomatik PR review, issue saralash (33-bob) |
| Code Review | Har bir PR'ni avtomatik ko'rib chiqadi | Xatoni inson ko'rishidan oldin ushlash (22-bob) |
| Slack | Kanallarda `@Claude` eslatmasiga javob beradi | Jamoa chatidagi xato xabaridan PR'gacha |

Ro'yxatda bo'lmagan tizimlarni MCP serverlar orqali ulash mumkin (27-bob).

## Codex va Copilot ⚑

### OpenAI Codex

CX (Codex CLI) hujjati CLI'ni uchta sabab bilan tavsiya qiladi:

- **lokal repo bilan ishlash** — fayllarni ko'radi, tahrirlaydi, kompyuterdagi vositalarni ishga tushiradi;
- **nazorat sizda** — model, fikrlash darajasi (reasoning effort), ruxsatlar va buyruqlarni vazifaga moslab tanlaysiz;
- **skript va CI bilan birlashtirish** — interaktiv yoki `codex exec` bilan takrorlanadigan jarayonlarda.

CX (Codex Cloud): vazifalar bulutda bajariladi. Repo tanlamasdan ham boshlash mumkin, GitHub yoki GitLab hisobingiz orqali
ulangan repo'ni ham olsa bo'ladi. O'zgarishlarni ko'rib chiqib, qo'shimcha o'zgartirish so'raysiz va tayyor bo'lganda commit
qilasiz yoki PR ochasiz.

CX'ning birinchi vazifa haqidagi maslahati: vazifadan oldin va keyin git nazorat nuqtasi (commit) yarating, shunda
o'zgarishlarni qaytarib olish mumkin bo'ladi.

### GitHub Copilot

GH (Copilot on GitHub.com) bo'yicha Copilot GitHub saytida repo haqidagi savollarga javob beradi, o'zgarishlarni rejalab
amalga oshiradi, PR'larni ko'rib chiqadi va repo vazifalarini avtomatlashtiradi. Agent ish rejimida u repo'ni o'rganadi,
o'zgarishni rejalaydi va fonda amalga oshiradi: lokal IDE'da emas, bulutdagi ishlab chiqish muhitida fayllarni tahrirlaydi,
testlar va linter'larni ishga tushiradi.

Hujjatda sanalgan cheklovlar:

- faqat GitHub'da joylashgan repo'lar bilan ishlaydi;
- bitta vazifada bitta branch ustida ishlaydi va bitta PR ochadi;
- GitHub Actions'da ishlaydigan sessiya ko'pi bilan 59 daqiqa davom etadi, bu chegarani uzaytirib bo'lmaydi;
- repo'ga yozish huquqingiz bo'lmasa, sessiya faqat o'qish rejimida ishlaydi;
- branch himoya qoidalari Copilot'ga PR ochish yoki yangilashga to'sqinlik qilishi mumkin.

GH ham boshqalar kabi ogohlantiradi: Copilot noto'g'ri yoki optimal bo'lmagan kod yozishi mumkin, jumladan xavfsizlik
zaifligi bor kod. Production'da ishlatishdan oldin natijani ko'rib chiqing va sinang. Sessiya loglari agent nima qilganini
ko'rsatadi, lekin hujjat aytganidek, ular sizning o'zingizning tekshiruvingiz va sinovingiz o'rnini bosmaydi.

### Umumiy xarita

Quyidagi jadvalda faqat hujjatda nomi bilan tilga olingan narsalar bor. Bo'sh joy "bunday imkoniyat yo'q" degani emas,
balki "bu bobda o'qilgan sahifalarda uchramadi" degani.

| Vazifa | Claude Code | Codex | Copilot |
| --- | --- | --- | --- |
| Terminalda lokal agent | CLI | Codex CLI | Copilot CLI |
| IDE ichida | VS Code, JetBrains | IDE kengaytmasi | VS Code, JetBrains IDE'lari |
| Alohida ilova | Desktop | Desktop ilova | GitHub Copilot ilovasi |
| Bulutda vazifa | Web (claude.ai/code) | Codex Cloud | Copilot in the cloud (bulut sandbox'i yoki GitHub Actions) |
| Skript va CI | `claude -p`, GitHub Actions, GitLab CI/CD | `codex exec` | Automations, GitHub Agentic Workflows |
| Kod review | Code Review, `/code-review` | O'zgarishlar bo'yicha lokal review | Copilot code review |
| Lokal sessiyani masofadan boshqarish | Remote Control | — | Copilot CLI sessiyasini remote control |
| Tashqi tizimlarga ulanish | MCP | MCP (`codex mcp`) | MCP serverlar, connector'lar |

Uchala vositada ham MCP bor. Bu tasodif emas: MCP — tashqi tizimlarga ulanishning ochiq standarti (27-bob).

## Qachon qaysi muhit

CC (Platforms) maslahati: qayerdan boshlashni bilmasangiz, CLI'ni o'rnating va loyiha papkasida ishga tushiring. Terminal
yoqmasa, Desktop xuddi shu dvigatelni grafik interfeys bilan beradi.

Uchala hujjatdagi tavsiyalardan amaliy qoida:

| Holat | Muhit |
| --- | --- |
| Har qadamni ko'rib, kerak bo'lsa to'xtatmoqchisiz | Lokal (terminal yoki IDE) |
| Agentga lokal servis, baza yoki maxsus vosita kerak | Lokal |
| Vazifa uzoq, ko'p yo'naltirish talab qilmaydi | Bulut |
| Kompyuteringizda bo'lmagan repo | Bulut |
| Har PR'da yoki jadval bo'yicha takrorlanadigan ish | CI yoki rejalashtirilgan vazifa (33, 34-boblar) |
| Uydan tashqarida lokal sessiyani kuzatish | Masofadan boshqaruv |

Bu kitobdagi misollar asosan lokal CLI'da ko'rsatiladi. Sabab: har bir buyruqni va natijani shu yerda haqiqiy sessiyada
tekshirish mumkin (README, "Vosita tanlovi haqida").

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Vositalarni "qaysi biri eng aqlli" deb solishtirish | CC: sikl va tool'lar hamma joyda bir xil, farq — bajarilish joyi va muloqot usulida | Avval vazifaga mos muhitni tanlang: lokal, bulut yoki CI |
| Lokal servis va bazaga tayanadigan vazifani bulutga berish | Bulut muhitida faqat repo va sozlangan narsa bor | Bunday vazifani lokal bajaring yoki bulut muhitiga kerakli servislarni sozlang |
| Bulut agenti loglarini ko'rib, "tekshirildi" deb hisoblash | GH: sessiya loglari sizning tekshiruvingiz va sinovingiz o'rnini bosmaydi | Diff'ni o'qing, testlarni o'zingiz ishga tushiring |
| Uzoq vazifani lokal ishga tushirib, kompyuterni yopish | Lokal muhitda kompyuter o'chsa, ish to'xtaydi | Uzoq vazifa uchun bulut yoki rejalashtirilgan vazifa |
| Bir vositada ko'rgan imkoniyatni boshqasida ham bor deb hisoblash | Imkoniyatlar har vositada, tarifda va tashkilot siyosatida har xil | O'sha vositaning rasmiy hujjatini tekshiring |

## Amaliyot

1. Claude Code ishlaydigan uchta muhit qaysilar va ular nimasi bilan farq qiladi?
2. GH bo'yicha klient, sessiya va muhit nima?
3. Skript rejimi va Agent SDK Claude Code'ning qaysi platformasida bor?
4. Qanday vazifani bulutga berish ma'qul, qandayini lokal bajarish kerak?
5. GH bo'yicha Copilot agentining uchta cheklovini ayting.
6. Bulut agenti PR ochdi va sessiya logida testlar o'tgani yozilgan. Yana nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. Lokal (kod kompyuteringizda bajariladi, fayl va vositalarga to'liq kirish), bulut (Anthropic yoki tashkilot boshqaradigan virtual mashinada, kompyuterda yo'q repo bilan ham), masofadan boshqaruv (bajarish lokal, boshqaruv brauzerdan).
2. Klient — muloqot qiladigan joy (veb, ilova, IDE, mobil, CLI). Sessiya — suhbat va unga bog'liq agent ishi. Muhit — agent ishni bajaradigan joy (bulut sandbox'i, GitHub Actions runner'i, masofaviy maxsus muhit).
3. Faqat CLI'da.
4. Bulutga: uzoq, ko'p yo'naltirish talab qilmaydigan vazifa, kompyuterda yo'q repo, oflayn bo'lganda ham davom etishi kerak bo'lgan ish. Lokal: har qadamni kuzatmoqchi bo'lganingizda, agentga lokal servis, baza yoki maxsus vosita kerak bo'lganda.
5. Masalan: faqat GitHub'dagi repo'lar; bir vazifada bitta branch va bitta PR; GitHub Actions sessiyasi ko'pi bilan 59 daqiqa; yozish huquqi bo'lmasa faqat o'qish rejimi.
6. Diff'ni o'zingiz o'qib chiqish va testlarni o'zingiz ishga tushirish. GH: loglar sizning tekshiruvingiz va sinovingiz o'rnini bosmaydi.

</details>

## Rasmiy hujjat

- [CC: How Claude Code works — Environments and interfaces](https://code.claude.com/docs/en/how-claude-code-works#environments-and-interfaces)
- [CC: Platforms and integrations](https://code.claude.com/docs/en/platforms)
- [CC: Overview — Use Claude Code everywhere](https://code.claude.com/docs/en/overview#use-claude-code-everywhere)
- [CX: Codex CLI](https://learn.chatgpt.com/docs/codex/cli)
- [CX: Codex Cloud](https://learn.chatgpt.com/docs/cloud)
- [GH: GitHub Copilot on GitHub.com and GitHub Mobile](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)

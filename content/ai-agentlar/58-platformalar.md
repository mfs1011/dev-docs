# 58 — Desktop, veb va telefon

[Mundarija](README.md)

> ⚑ Qo'llanmadagi barcha tajribalar CLI'da (terminal) o'tkazilgan. Desktop ilovasi, bulut sessiyalari, telefon ilovasi va Remote
> Control bu bobda sinalmadi — rasmiy hujjat asosida yozilgan.

## Tushuncha

CC (Platforms and integrations): Claude Code hamma joyda **bitta dvigatel** bilan ishlaydi, lekin har bir "yuza" (surface) boshqa ish
uslubiga moslashtirilgan. Bir loyihada yuzalarni aralashtirish mumkin: lokal yuzalarda sozlamalar, loyiha xotirasi va MCP serverlar
umumiy.

| Platforma | Nima uchun eng yaxshi | Nima beradi |
| --- | --- | --- |
| **CLI** (terminal) | Terminal ishi, skriptlar, masofaviy serverlar | To'liq imkoniyatlar; skriptlar va Agent SDK faqat CLI'da |
| **Desktop** | Diff'larni ko'rib chiqish, parallel sessiyalar | Diff ko'ruvchi, ilova ko'rinishi (preview) |
| **VS Code**, **JetBrains** | Muharrirdan chiqmasdan ishlash | Qatordagi diff'lar, tanlangan kodni kontekstga berish (57-bob) |
| **Veb** (claude.ai/code) | Ko'p yo'naltirish talab qilmaydigan uzoq vazifalar | Bulut sessiyasi — siz uzilsangiz ham davom etadi |
| **Telefon** | Kompyuterdan uzoqda vazifa boshlash va kuzatish | Bulut sessiyalari, lokal sessiya uchun Remote Control |

### Lokal, bulut va Remote Control

Eng muhim farq — kod **qayerda** ishlaydi (CC, Get started with Claude Code in the cloud):

| | Bulut sessiyasi | Lokal sessiya | Lokal + Remote Control |
| --- | --- | --- | --- |
| Kod qayerda ishlaydi | Bulut VM (standart holatda Anthropic boshqaradi) | Sizning kompyuteringiz | Sizning kompyuteringiz |
| Qayerdan boshlanadi | claude.ai/code, telefon ilovasi, Desktop (**Cloud**), `claude --cloud` | Terminal, IDE, Desktop (**Local**) | Terminal, VS Code, Desktop |
| Lokal sozlamalaringiz ishlatiladimi | Yo'q, faqat repo | Ha | Ha |
| GitHub kerakmi | GitHub repo uchun ha | Yo'q | Yo'q |
| Uzilsangiz ham ishlaydimi | Ha | Yo'q | Kompyuterda sessiya ochiq tursa |
| Ruxsat rejimlari | Accept edits, Plan, Auto | Terminalda hammasi | — |
| Tarmoq | Muhit bo'yicha sozlanadi | Kompyuteringiz tarmog'i | Kompyuteringiz tarmog'i |

### Bulut sessiyasi qanday ishlaydi

CC: tanlagan GitHub repo'ngiz alohida virtual mashinaga klonlanadi, sozlash skripti (bo'lsa) ishlaydi, tarmoq muhitdagi kirish darajasiga
ko'ra sozlanadi, Claude ishlaydi, to'xtash nuqtasida branch'ni GitHub'ga push qiladi. Siz diff'ni ko'rib chiqasiz, izoh qoldirasiz yoki PR
yaratasiz.

Qachon mos (CC):

- **parallel vazifalar** — har biri o'z sessiyasi va branch'ida, worktree'larni boshqarmasdan;
- **lokal nusxasi yo'q repo'lar** — har sessiyada yangidan klonlanadi;
- **ko'p yo'naltirish kerak bo'lmagan vazifalar** — aniq vazifa berib, keyin natijani ko'rish;
- kod bo'yicha savollar va o'rganish.

Lokal sozlamalar, vositalar yoki muhit kerak bo'lsa — lokal sessiya yoki Remote Control.

Xavfsizlik va ma'lumot (CC, Data usage — Cloud execution): GitHub kirish ma'lumotlari Anthropic serverlarida shifrlangan saqlanadi va VM'ga
**kirmaydi** — VM'dan GitHub trafigi ularni server tomonida qo'shadigan proksi orqali o'tadi; barcha chiquvchi trafik audit va suiiste'molning
oldini olish uchun xavfsizlik proksisi orqali. Bu — 47-bobdagi "proksi namunasi"ning o'zi. Standart muhit — **Limited** tarmoq: keng
tarqalgan paket registrlari va ruxsat etilgan domenlar.

Mavjudligi: Pro, Max, Ultra, Team rejalari va Enterprise'da tegishli o'rinlar. Team va Enterprise'da GitHub connector'ini avval tashkilot
egasi yoqishi kerak.

### Remote Control

Lokal sessiyani telefon yoki brauzerdan (claude.ai/code) davom ettirish: kod va fayllar kompyuteringizda qoladi, faqat interfeys
masofadan. Boshlash — `claude remote-control` yoki sessiya ichida `/remote-control`.

CC (Remote Control — Connection and security):

- Lokal sessiya faqat **chiquvchi** HTTPS so'rovlar yuboradi, kompyuteringizda kiruvchi port ochilmaydi.
- Ulangan paytda sessiya transkripti (xabarlar, javoblar, tool faoliyati) Anthropic serverlarida saqlanadi — qurilmalar orasida
  sinxronlash uchun; Data usage siyosati bo'yicha.
- To'liq o'chirish — `disableRemoteControl` sozlamasi.

Talablar: obuna (API kalit qo'llab-quvvatlanmaydi); Team/Enterprise'da egasi yoqishi kerak; Bedrock, Agent Platform, Foundry yoki
`ANTHROPIC_BASE_URL` boshqa host'ga qaratilgan bo'lsa ishlamaydi (55-bobdagi lokal model bilan ham). `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
o'rnatilgan bo'lsa ham mavjud emas.

### Kompyuterdan uzoqda ishlash usullari

| Usul | Nima ishga tushiradi | Claude qayerda ishlaydi | Bob |
| --- | --- | --- | --- |
| Remote Control | Ishlab turgan sessiyani telefon/brauzerdan boshqarish | Kompyuteringiz | — |
| Dispatch | Telefon ilovasidan vazifa yuborish | Kompyuteringiz (Desktop) | — |
| Channels | Telegram, Discord yoki o'z serveringizdan hodisa | Kompyuteringiz (CLI) | — |
| Slack | Kanalda `@Claude` | Anthropic bulut | — |
| Jadval bo'yicha vazifalar | Jadval | CLI, Desktop yoki bulut | 34 |
| GitHub Actions | PR, issue, `@claude` | CI runner | 33, 51 |

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Kundalik ish, lokal vositalar kerak | CLI yoki IDE | To'liq nazorat; kompyuter yoniq bo'lishi kerak |
| Bir nechta mustaqil vazifa parallel | Bulut sessiyalari | Worktree'siz; lokal sozlamalar yo'q, GitHub kerak |
| Uzoq vazifa, kompyuterni yopish kerak | Bulut sessiyasi | Davom etadi; har sessiya rejaga hisoblanadi |
| Lokal sessiyani yo'lda kuzatish | Remote Control | Kod lokal; transkript ulangan paytda serverda |
| Skript, CI, Agent SDK | CLI | Faqat CLI'da |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Bulut sessiyasi lokal CLAUDE.local.md, hook va MCP'ni ko'radi deb kutish | CC: bulutda faqat repo | Kerakli qoidalarni repo'dagi fayllarga |
| Remote Control kodni bulutga yuboradi deb o'ylash | Bajarish va fayllar kompyuterda qoladi | Transkript esa ulangan paytda serverda — 38-bob |
| Lokal model (`ANTHROPIC_BASE_URL`) bilan Remote Control kutish | Hujjat bo'yicha ishlamaydi | Lokal model bilan — faqat lokal |
| Maxfiy loyihani o'ylamasdan bulutga ulash | Kod Anthropic VM'iga klonlanadi | Tashkilot siyosati, o'z infratuzilmasidagi muhit (self-hosted) |

## Amaliyot

1. Bulut sessiyasi, lokal sessiya va Remote Control'ning asosiy farqi nimada?
2. Bulut sessiyasi qachon mos?
3. Bulut sessiyasida GitHub kirish ma'lumotlari qanday himoyalangan?
4. Remote Control xavfsizligi qanday ta'minlangan va nima serverda saqlanadi?
5. Qaysi imkoniyatlar faqat CLI'da?

<details>
<summary>Javoblar</summary>

1. Kod qayerda ishlashi: bulutda — Anthropic VM'ida, lokal sozlamalarsiz, uzilsangiz ham davom etadi; lokalda — kompyuteringizda; Remote Control — lokal sessiya, interfeys esa telefon yoki brauzerda.
2. Parallel mustaqil vazifalar, lokal nusxasi yo'q repo'lar, ko'p yo'naltirish talab qilmaydigan aniq vazifalar, kodni o'rganish.
3. Ular Anthropic serverlarida shifrlangan, VM'ga kirmaydi; GitHub trafigi ularni server tomonida qo'shadigan proksi orqali o'tadi.
4. Faqat chiquvchi HTTPS, kiruvchi port ochilmaydi, qisqa muddatli kalitlar; ulangan paytda transkript Anthropic serverlarida saqlanadi.
5. Skriptlar (`-p`) va Agent SDK.

</details>

## Rasmiy hujjat

- [CC: Platforms and integrations](https://code.claude.com/docs/en/platforms)
- [CC: Get started with Claude Code in the cloud](https://code.claude.com/docs/en/web-quickstart)
- [CC: Remote Control](https://code.claude.com/docs/en/remote-control)
- [CC: Desktop](https://code.claude.com/docs/en/desktop)
- [CC: Data usage — Cloud execution](https://code.claude.com/docs/en/data-usage)

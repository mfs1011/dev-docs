# 12 — Kontekst oynasi amalda

[Mundarija](README.md)

## Tushuncha

2-bobda kontekst oynasi nima ekanini ko'rdik: model javob yozayotganda ko'ra oladigan butun matn. Bu bobda shuni o'z
sessiyangizda **o'lchashni** o'rganamiz: nima qancha joy egallaydi va uni qanday tejash mumkin.

### `/context`

CC (Explore the context window): istalgan paytda haqiqiy kontekst sarfini ko'rish uchun `/context` ni ishga tushiring. U
toifalar bo'yicha joriy taqsimotni va tejash bo'yicha takliflarni ko'rsatadi, jumladan qaysi CLAUDE.md va auto memory
fayllari yuklanganini. Bu fayllarni ochib tahrirlash uchun `/memory` bor.

### Sessiya boshida nima yuklanadi

CC (Explore the context window, Extend Claude Code) bo'yicha siz hech narsa yozmasdan oldin kontekstga quyidagilar kiradi:

| Nima | Qachon yuklanadi | Kontekst narxi |
| --- | --- | --- |
| Tizim ko'rsatmalari va tool tavsiflari | Sessiya boshida | Har so'rovda |
| **CLAUDE.md** | Sessiya boshida, butun mazmuni | Har so'rovda |
| **Skill'lar** | Boshida faqat tavsiflari, to'liq mazmuni ishlatilganda | Kam (tavsiflar har so'rovda) |
| **MCP serverlar** | Boshida tool nomlari, to'liq sxemalar kerak bo'lganda | Tool ishlatilmaguncha kam |
| **Hook'lar** | Ishga tushganda | Nol (tashqarida ishlaydi), agar qo'shimcha kontekst qaytarmasa |
| **Subagentlar** | Ishga tushirilganda | Asosiy sessiyadan alohida |

Ish davomida esa har o'qilgan fayl, buyruq chiqishi va agent javobi qo'shilib boradi.

CC (Extend Claude Code) bu yerda muhim gapni aytadi: har bir qo'shimcha kontekst oynani to'ldirishdan tashqari **shovqin** ham
qo'shadi. Natijada agent samarasi pasayadi: skill'lar to'g'ri ishga tushmasligi yoki agent konvensiyalaringizni yo'qotib
qo'yishi mumkin. Bu 2-bobdagi context rot'ning amaliy ko'rinishi.

## Amalda

### 1. Toza sessiya

5-bobdagi sinov loyihasida (unda `/init` yaratgan CLAUDE.md bor) sessiya boshidagi `/context` (Claude Code 2.1.325,
shaxsiy sozlamalarsiz):

```text
## Context Usage

**Model:** claude-opus-5-5
**Tokens:** 14.1k / 1m (1%)

### Estimated usage by category

| Category | Tokens | Percentage |
|----------|--------|------------|
| System prompt | 2.5k | 0.3% |
| System tools | 8.9k | 0.9% |
| System tools (deferred) | 16.4k | 1.6% |
| Memory files | 426 | 0.0% |
| Skills | 2.2k | 0.2% |
| Messages | 10 | 0.0% |
| Free space | 952.9k | 95.3% |
| Autocompact buffer | 33k | 3.3% |

### Memory Files

| Type | Path | Tokens |
|------|------|--------|
| Project | …/lab/narx/CLAUDE.md | 426 |
```

Qatorlarning ma'nosi:

| Qator | Nima |
| --- | --- |
| `System prompt` | Claude Code'ning tizim ko'rsatmalari |
| `System tools` | Darhol yuklangan tool tavsiflari |
| `System tools (deferred)` | Kechiktirilgan tool'lar. CC (How Claude Code works): MCP tool tavsiflari standart holatda kechiktiriladi va kerak bo'lganda tool qidiruvi orqali yuklanadi |
| `Memory files` | CLAUDE.md va auto memory. Bu yerda 426 token — `/init` yozgan fayl |
| `Skills` | Skill tavsiflari (to'liq mazmuni emas) |
| `Messages` | Suhbat: so'rovlar, javoblar, tool natijalari |
| `Free space` | Bo'sh joy |
| `Autocompact buffer` | Avtomatik qisqartirish uchun ajratilgan zaxira |

Oyna 1M token. Toza sessiya undan 1% atrofida oladi. Demak bo'sh joy juda ko'p. CC (Best practices) ham shuni aytadi: hozirgi
modellarda kontekst kamdan-kam tugaydi. Lekin keyingi tajriba ko'rsatadiki, gap faqat joy tugashida emas.

### 2. Bitta savol — ikki xil narx

Loyihaga 3000 qatorli `app.log` (163 KB) qo'shildi, unda 133 ta `ERROR` qatori bor. Agentga uch xil so'rov berildi, har
biri alohida sessiyada. Har sessiyadan keyin `/context`.

| Sessiya | So'rov | Agent nima qildi | `Messages` |
| --- | --- | --- | --- |
| A | `app.log faylini o'qib chiq va nechta ERROR qatori borligini ayt.` | Faylni o'qimadi: `grep -c "ERROR" app.log` va `grep -n … \| head -50` | 10k |
| B | `… Faylni to'liq o'qima — grep bilan hisobla.` | `grep -c`, keyin tekshirish uchun `grep -cw` va `grep -ci` | 7,4k |
| C | `app.log ning birinchi 1000 qatorini Read tool bilan o'qi (grep ishlatma) va ulardagi ERROR qatorlarini sana.` | Read bilan ikki bo'lakda o'qidi (1–500, 501–1000) va qo'lda sanadi | **43k** |

Uchala javob to'g'ri chiqdi: A va B — 133 ta, C — birinchi 1000 qatorda 40 ta (`head -1000 app.log | grep -c " ERROR "` ham 40
beradi). Lekin narx har xil:

- **C** faylning faqat uchdan birini (54 KB) o'qidi, shunga qaramay xabarlar A va B'dagidan 4–6 marta ko'p joy egalladi.
  Agentning o'zi: "Fayl bitta o'qishga sig'madi, shuning uchun 1000 qatorni Read bilan ikki qismda … o'qidim". CC (Common
  workflows) bo'yicha Read tool'ining standart chegarasi 25 000 token.
- **A** da "o'qib chiq" deyilgan bo'lsa ham agent o'zi tejamli yo'lni tanladi. AE (Effective context engineering) buni
  "o'z vaqtida" (just in time) yondashuv deb ataydi: agent hamma ma'lumotni oldindan yuklamaydi, faqat yengil
  identifikatorlarni (fayl yo'li, so'rov) saqlaydi va kerakli qismini tool bilan oladi.
- **B** eng arzon chiqdi: "to'liq o'qima" degan bir ibora agentga natijani qanday olishni aytdi.

Xulosa: kontekst narxini birinchi navbatda **sizning so'rovingiz** belgilaydi. Katta fayl yoki log bilan ishlaganda agentga
butun faylni emas, kerakli qismini oladigan buyruqni tavsiya qiling. Odatda u buni o'zi ham qiladi.

## Kontekstni tejash usullari

CC (Explore the context window, Best practices, Costs) bo'yicha:

| Usul | Nima beradi |
| --- | --- |
| Vazifalar orasida `/clear` | Eski suhbat keyingi vazifaga kerakli fayllarni siqib chiqarmaydi va har xabarda token sarflamaydi (15-bob) |
| CLAUDE.md'ni qisqa tutish | CC: 200 qatordan kam; ma'lumotnoma materiallarni kerak bo'lganda yuklanadigan skill'larga o'tkazing (13, 25-boblar) |
| Katta o'qishni subagentga berish | Fayl mazmuni subagentning oynasida qoladi, sizga faqat xulosa qaytadi (30-bob) |
| Aniq buyruq bilan olish (`grep`, `tail`, `head`) | Butun fayl o'rniga kerakli qatorlar |
| Yo'naltirilgan `/compact` | `/compact focus on the auth bug fix` — xulosada nima qolishini o'zingiz tanlaysiz (15-bob) |
| Ishlatilmaydigan kengaytmalarni o'chirish | MCP tool nomlari va skill tavsiflari har sessiyada joy oladi (V qism) |

## Variantlar

| Ma'lumotni olish usuli | Kontekst narxi | Aniqlik | Qachon |
| --- | --- | --- | --- |
| Faylni to'liq o'qish (Read) | Yuqori, fayl hajmiga mutanosib | To'liq rasm | Kichik fayl yoki butun mantiqni tushunish kerak |
| Qism o'qish (`offset`/`limit`, `head`, `tail`) | O'rtacha | Faqat shu qism | Log oxiri, aniq qatorlar oralig'i |
| Qidiruv (`grep`, `rg`) | Past | Faqat mos qatorlar | Hisoblash, qidirish, ma'lum naqsh |
| Subagent | Asosiy oynada past (faqat xulosa) | Xulosa sifatiga bog'liq | Ko'p fayl o'qishni talab qiladigan tadqiqot |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Joy ko'p, demak muammo yo'q" deb o'ylash | CC: ortiqcha kontekst shovqin ham qo'shadi; CP: token oshgani sari aniqlik pasayadi | Kontekstni faqat vazifaga kerak narsa bilan to'ldiring |
| Katta log yoki dump'ni to'liq o'qitish | Tajribada 1000 qator Read 43k token oldi, `grep` esa 7,4k | Kerakli qismini oladigan buyruqni tavsiya qiling |
| `/context` ni hech qachon ishlatmaslik | Nima joy olayotganini bilmaysiz | Sessiya sekinlashsa yoki agent chalg'isa, `/context` |
| Uzun CLAUDE.md | Har so'rovda butunlay yuklanadi | 200 qatordan kam; qolganini skill yoki `.claude/rules/` ga (14-bob) |
| O'nlab MCP server ulab qo'yish | Har biri tool nomlari bilan joy oladi | Faqat kerakli serverlar (27-bob) |

## Amaliyot

1. `/context` nima ko'rsatadi?
2. Sessiya boshida kontekstga nimalar kiradi? Ulardan qaysi biri har so'rovda to'liq yuklanadi?
3. `System tools (deferred)` qatori nimani bildiradi?
4. Tajribada C sessiyasi nega A va B'dan ancha qimmat chiqdi?
5. "Joy 95% bo'sh" bo'lsa ham kontekstni tejash nega foydali?
6. 50 MB log fayldagi oxirgi xatoni topish kerak. Agentga qanday so'rov berasiz?

<details>
<summary>Javoblar</summary>

1. Toifalar bo'yicha kontekst sarfi (tizim ko'rsatmasi, tool'lar, memory fayllar, skill'lar, xabarlar, bo'sh joy), qaysi CLAUDE.md va auto memory fayllari yuklangani va tejash bo'yicha takliflar.
2. Tizim ko'rsatmalari, tool tavsiflari, CLAUDE.md, auto memory, skill tavsiflari, MCP tool nomlari. CLAUDE.md har so'rovda to'liq yuklanadi.
3. Kechiktirilgan tool'lar: to'liq tavsifi kerak bo'lgandagina tool qidiruvi orqali yuklanadi (masalan, MCP tool'lari).
4. C faylning 1000 qatorini Read bilan to'liq o'qidi, butun matn kontekstga tushdi (43k). A va B `grep` bilan faqat sanoqni yoki bir nechta qatorni oldi (10k va 7,4k).
5. CC: ortiqcha kontekst shovqin qo'shadi, skill'lar noto'g'ri ishga tushishi va agent konvensiyalarni yo'qotishi mumkin. CP: token oshgani sari aniqlik pasayadi. Bundan tashqari har xabarda token sarflanadi.
6. Masalan: "app.log juda katta, to'liq o'qima. `tail -n 2000 app.log | grep ERROR | tail -1` kabi buyruq bilan oxirgi xatoni top va atrofidagi 20 qatorni ko'rsat."

</details>

## Rasmiy hujjat

- [CC: Explore the context window](https://code.claude.com/docs/en/context-window)
- [CC: Extend Claude Code — Understand context costs](https://code.claude.com/docs/en/features-overview#understand-context-costs)
- [CC: How Claude Code works — The context window](https://code.claude.com/docs/en/how-claude-code-works#the-context-window)
- [CC: Common workflows — Reference files and directories](https://code.claude.com/docs/en/common-workflows#reference-files-and-directories)
- [CC: Manage costs effectively](https://code.claude.com/docs/en/costs)
- [AE: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

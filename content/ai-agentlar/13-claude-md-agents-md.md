# 13 — CLAUDE.md va AGENTS.md

[Mundarija](README.md)

## Tushuncha

CC (How Claude remembers your project): har bir Claude Code sessiyasi **toza kontekst** bilan boshlanadi. Kecha agentga nima
tushuntirgan bo'lsangiz, bugun u buni bilmaydi. Sessiyalar orasida bilimni ikki mexanizm saqlaydi:

| | **CLAUDE.md** | **Auto memory** |
| --- | --- | --- |
| Kim yozadi | Siz | Claude |
| Nima bor | Ko'rsatmalar va qoidalar | O'rganilgan narsalar va naqshlar |
| Doirasi | Loyiha, foydalanuvchi yoki tashkilot | Har repo uchun, worktree'lar o'rtasida umumiy |
| Qachon yuklanadi | Har sessiyada | Har sessiyada (birinchi 200 qator yoki 25 KB) |

Bu bob CLAUDE.md haqida. Auto memory — 14-bob.

CC eng muhim tafsilotni ham aytadi: Claude bu fayllarni **kontekst** sifatida qabul qiladi, majburiy konfiguratsiya sifatida
emas. Ko'rsatma qanchalik aniq va qisqa bo'lsa, agent unga shunchalik izchil amal qiladi. Agent qaroridan qat'i nazar biror
harakatni bloklash kerak bo'lsa, hook ishlatiladi (3-bob, 26-bob).

### Qachon CLAUDE.md'ga yozish kerak

CC (memory): CLAUDE.md — aks holda qayta-qayta tushuntiradigan narsangizni yozadigan joy. Hujjatdagi belgilar:

- Claude bir xatoni ikkinchi marta qildi;
- kod review agent bilishi kerak bo'lgan narsani ushladi;
- o'tgan sessiyada yozgan tuzatishni yana yozyapsiz;
- yangi hamkasbga ham shu kontekst kerak bo'lardi.

CC (Best practices) faylga nima tushishini aniqroq aytadi — faqat agent kodning o'zidan bila olmaydigan narsa:

| Yozing | Misol |
| --- | --- |
| Ishni tekshirish usuli | Test, typecheck va lint buyruqlari, bitta test faylini ishga tushirish |
| Kod chalg'itadigan joylar | Hamma joyda bor, lekin yangi kodda takrorlanmasligi kerak bo'lgan eski naqsh; ishlatilmaydigandek ko'rinsa ham ishlatiladigan papka |
| Repo'da yo'q qarorlar | Jamoa qaysi xato yordamchisini tanlagan, deploy qanday ishlaydi, nima migratsiya review'ini talab qiladi |
| Ikki marta tuzatgan narsangiz | — |

CC (Best practices) faylga **yozmaslik** kerak bo'lgan narsani ham ko'rsatadi: arxitektura va fayl joylashuvi tavsifi. Claude
repo'ni o'zi o'qiydi. Bir eslatma: CC (memory) jadvalida CLAUDE.md'ning vazifalari orasida "project architecture" ham bor.
Ikki sahifani birga o'qisak: koddan ko'rinmaydigan **arxitektura qarori** yoziladi ("barcha tashqi API chaqiruvlari
`src/clients/` orqali, chunki u yerda qayta urinish bor"), koddan ko'rinadigan **tuzilma** yozilmaydi ("`src/` da
komponentlar bor").

Ko'p bosqichli jarayon yoki faqat kodning bir qismiga tegishli qoida CLAUDE.md'ga emas, skill'ga (25-bob) yoki papka
qoidasiga (14-bob) o'tkaziladi.

### Qisqa bo'lsin

CC (Best practices): CLAUDE.md har sessiyada yuklanadi, ya'ni undagi **har bir qator har bir vazifada** agent diqqatining bir
qismini oladi — vazifaga aloqasi bormi-yo'qmi. CC (memory) bo'yicha maqsad — **200 qatordan kam**. Uzun fayl ko'proq kontekst
egallaydi va unga amal qilish pasayadi.

CC (Best practices) sinovdan o'tgan qisqa fayl namunasini beradi:

```markdown
# Commands
- Install: pnpm install
- Run one test file: pnpm vitest run path/to/file.test.ts
- Typecheck: pnpm tsc --noEmit

# Conventions
- Use the error helpers in src/lib/errors.ts, never throw raw strings
- src/legacy/ is still live but don't copy its patterns into new code

# Gotchas
- Integration tests need DATABASE_URL set, see .env.example
```

E'tibor bering: typecheck qatori faqat **buyruqning o'zi**. Agentga buyruqni bilish kerak, shunda u ish davomida o'zini
tekshira oladi. "Tugatishdan oldin doim typecheck qil" degan qator ko'p hollarda ishlaydi, lekin har doim emas. Majburlash
kerak bo'lsa — Stop hook (8-bob).

### Yaxshi ko'rsatma yozish

CC (memory) — tekshirib bo'ladigan darajada aniq yozing:

| O'rniga | Shunday yozing |
| --- | --- |
| "Format code properly" | "Use 2-space indentation" |
| "Test your changes" | "Run `npm test` before committing" |
| "Keep files organized" | "API handlers live in `src/api/handlers/`" |

Yana uchta qoida:

- **Tuzilma:** sarlavha va ro'yxatlar bilan guruhlang. Tartibli bo'limlarga zich paragraflarga qaraganda osonroq amal qilinadi.
- **Izchillik:** ikki ko'rsatma bir-biriga zid bo'lsa, Claude ulardan birini tasodifan tanlashi mumkin. Fayllarni vaqti-vaqti
  bilan ko'rib chiqing.
- **Urg'u emas, qisqalik:** CC (Best practices) bo'yicha Claude fayldagi qatorga baribir amal qilmasa, IMPORTANT qo'shish
  ehtimol yordam bermaydi. Yo fayl shunchalik uzunki qator yo'qolib ketyapti, yo bu istisnosiz qoida va u hook'ga tegishli.

CC uchta yordamchi buyruqni sanaydi:

| Buyruq | Nima qiladi |
| --- | --- |
| `/init` | Kod bazasidan boshlang'ich versiya yaratadi (5-bob). Keyingi ish asosan qatorlarni olib tashlash |
| `/doctor` | Claude koddan o'zi bila oladigan narsalarni qisqartirishni taklif qiladi |
| `/doctor prompt-audit` | Eski modellar uchun yozilgan, mavjud bo'lmagan fayl yoki buyruqqa ishora qiladigan yoki bir-biriga zid ko'rsatmalarni topadi. Siz so'ramaguningizcha fayllarga tegmaydi |

### Fayllar qayerda turadi

CC (memory) — yuklanish tartibida, eng keng doiradan eng torigacha:

| Doira | Joy | Kim bilan ulashiladi |
| --- | --- | --- |
| Tashkilot siyosati (managed) | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux/WSL: `/etc/claude-code/CLAUDE.md` | Tashkilotdagi hamma |
| Foydalanuvchi | `~/.claude/CLAUDE.md` | Faqat siz, barcha loyihalarda |
| Loyiha | `./CLAUDE.md` yoki `./.claude/CLAUDE.md` | Jamoa, git orqali |
| Lokal | `./CLAUDE.local.md` (`.gitignore` ga qo'shiladi) | Faqat siz, shu loyihada |

Qanday yuklanadi (CC memory):

- Claude Code ishga tushgan papkadan **yuqoriga** qarab barcha `CLAUDE.md` va `CLAUDE.local.md` ni ishga tushganda yuklaydi.
  Masalan `foo/bar/` da `foo/bar/CLAUDE.md` ham, `foo/CLAUDE.md` ham yuklanadi.
- Fayllar bir-birini almashtirmaydi, **birlashtiriladi**. Tartib ildizdan ishchi papkagacha, ya'ni ishga tushgan joyga
  yaqinroq ko'rsatma eng oxirida o'qiladi. Har bir papkada `CLAUDE.local.md` `CLAUDE.md` dan keyin keladi.
- **Pastki** papkalardagi CLAUDE.md ishga tushganda yuklanmaydi. Claude o'sha papkadagi biror faylni o'qiganda, yozganda yoki
  tahrirlaganda yuklanadi.

**Import.** CLAUDE.md boshqa faylni `@yo'l` bilan qo'shishi mumkin, masalan `See @README for project overview`. CC (memory)
ogohlantiradi: import katta faylni tartiblashga yordam beradi, lekin **kontekst narxini kamaytirmaydi** — import qilingan fayl
o'zini import qilgan CLAUDE.md bilan birga yuklanadi. Ichma-ich import ko'pi bilan to'rt qadam chuqurlikkacha ishlaydi.

**HTML izohlar.** CC (memory): CLAUDE.md'dagi blok darajasidagi HTML izohlar (`<!-- ... -->`) kontekstga qo'shilishdan oldin
olib tashlanadi. Odamlar uchun eslatmani token sarflamasdan qoldirish mumkin.

## AGENTS.md

**AGENTS.md** — kod agentlari uchun ochiq format. Uning sayti o'zini shunday tanishtiradi: "agentlar uchun README". Ya'ni
agentlarga loyihada ishlash uchun kontekst va ko'rsatma beriladigan alohida, oldindan ma'lum joy. Sayt bo'yicha README odamlar
uchun, AGENTS.md esa agentga kerak bo'lgan qo'shimcha tafsilotlar uchun: build qadamlari, testlar, README'ni to'ldirib
yuboradigan yoki odamlarga aloqasi yo'q konvensiyalar. Format Agentic AI Foundation (Linux Foundation tarkibida) tomonidan
yuritiladi.

Formatda maxsus maydon yo'q, oddiy Markdown. Sayt mashhur bo'limlarni sanaydi:

- loyiha haqida qisqacha;
- build va test buyruqlari;
- kod uslubi;
- test bo'yicha ko'rsatmalar;
- xavfsizlik masalalari.

Katta monorepo uchun sayt har bir paketga alohida AGENTS.md qo'yishni tavsiya qiladi: agentlar katalog daraxtidagi **eng
yaqin** faylni o'qiydi.

### Claude Code AGENTS.md'ni qanday o'qiydi

CC (memory) — standart holat:

| Repo'da | Claude nimani o'qiydi |
| --- | --- |
| Faqat `AGENTS.md`, ishchi papkada va undan yuqorida `CLAUDE.md` yoki `CLAUDE.local.md` yo'q | `AGENTS.md` |
| `AGENTS.md` va `CLAUDE.md` (yoki `CLAUDE.local.md`) | Faqat `CLAUDE.md` |
| `CLAUDE.md` ichida `@AGENTS.md` importi bor | `CLAUDE.md`, ichida import orqali `AGENTS.md` |

Buni `/config` → **Project instructions** sozlamasi bilan o'zgartirish mumkin: `claude-md-or-agents-md` (standart),
`claude-md-and-agents-md` (ikkalasi), `claude-md` (faqat CLAUDE.md), `managed-only`. AGENTS.md'ni to'g'ridan-to'g'ri o'qish
Claude Code v2.1.277 dan boshlab bor.

CC tuzoqni ham ogohlantiradi: `CLAUDE.local.md` ham hisobga olinadi. AGENTS.md'ga tayanadigan loyihada o'zingiz uchun
`CLAUDE.local.md` yaratsangiz, Claude AGENTS.md'ni o'qishni to'xtatadi. Bunday holatda sozlamani `claude-md-and-agents-md`
qiling.

**Bitta fayl hamma vositalar uchun.** CC (memory) tavsiyasi: AGENTS.md'ni yagona umumiy fayl qilib, yoniga CLAUDE.md qo'yib,
uning ichiga `@AGENTS.md` importini yozish. Claude'ga xos ko'rsatmalar importdan keyin keladi:

```markdown
@AGENTS.md

## Claude Code
...
```

### Codex AGENTS.md'ni qanday o'qiydi ⚑

CX (Custom instructions with AGENTS.md) bo'yicha Codex boshqacha zanjir quradi (sinalmagan, faqat hujjat):

1. **Global:** `~/.codex/AGENTS.override.md`, u yo'q bo'lsa `~/.codex/AGENTS.md`.
2. **Loyiha:** repo ildizidan joriy papkagacha har bir papkada `AGENTS.override.md`, keyin `AGENTS.md`. Har papkadan ko'pi
   bilan bitta fayl olinadi.
3. Fayllar ildizdan pastga qarab birlashtiriladi. Joriy papkaga yaqin fayl keyin keladi va oldingi ko'rsatmalarni bekor
   qiladi. Umumiy hajm standart 32 KiB bilan cheklangan.

Farqlar: Codex `AGENTS.override.md` ni o'qiydi, Claude Code esa yo'q. CC (memory) bo'yicha Claude Code `AGENTS.local.md`,
`AGENTS.override.md` va `.agents/` papkasidagi narsalarni o'qimaydi. Ikkala vositada bitta repo bilan ishlasangiz, umumiy
qoidalarni `AGENTS.md` da saqlang.

## Amalda

### 1. Qaysi fayl yuklanadi

Sinov loyihasida uch holat `/context` ning "Memory Files" bo'limi bilan tekshirildi (Claude Code 2.1.325):

**Faqat `AGENTS.md`:**

```text
| Type | Path | Tokens |
|------|------|--------|
| Project | …/v11/AGENTS.md | 93 |
```

**`AGENTS.md` va `CLAUDE.md` birga:**

```text
| Type | Path | Tokens |
|------|------|--------|
| Project | …/v11/CLAUDE.md | 426 |
```

Hujjatdagidek: CLAUDE.md paydo bo'lishi bilan AGENTS.md yuklanmay qoldi.

**CLAUDE.md boshiga 3 KB HTML izoh qo'shildi** (fayl 3678 baytga yetdi):

```text
| Type | Path | Tokens |
|------|------|--------|
| Project | …/v11/CLAUDE.md | 426 |
```

Fayl uch baravar kattalashdi, lekin kontekstdagi hajmi o'zgarmadi: izoh olib tashlangan.

### 2. `/init` faylini qisqartirish

5-bobda `/init` yaratgan CLAUDE.md (426 token) — yuqoridagi qoidalar bo'yicha qisqartirilgan varianti:

```markdown
# Commands
- All tests: npm test (no install step)
- One test: node --test --test-name-pattern="<nom>" narx.test.js

# Conventions
- Identifiers, comments, test names and commit messages are in Uzbek; keep new code consistent.

# Gotchas
- chegirma takes the percent as a whole number (10 = 10%), not a fraction.
```

Nima olib tashlandi va nega:

- `## Architecture` — `narx.js` qaysi funksiyalarni eksport qilishi koddan ko'rinadi. Bundan tashqari, 6-bobdagi tajribada
  agent shu bo'limni har yangi funksiyada yangilab turdi.
- Kirish qatori ("This file provides guidance…") — agentga ma'lumot bermaydi.
- Lug'at (`narx` = price…) — agent o'zbekcha nomlarni koddan tushunadi. Konvensiya qoidasi esa qoldi.

Nima qo'shildi: `chegirma` foizni butun son ko'rinishida olishi. 3-bobda agent buni testdan topdi va o'zi qaror qildi. Bu
"kod chalg'itishi mumkin bo'lgan joy" — CC tavsiya qilgan toifa.

## Variantlar

| Holat | Yechim | Yutug'i | Kamchiligi |
| --- | --- | --- | --- |
| Faqat Claude Code ishlatiladi | `CLAUDE.md` | Barcha imkoniyatlar (hook hodisalari, `--add-dir`) | Boshqa vositalar o'qimaydi |
| Jamoada har xil agentlar | `AGENTS.md` | Ko'p vosita tushunadigan ochiq format | Claude Code'da ba'zi farqlar bor (masalan, `InstructionsLoaded` hook ishlamaydi) |
| Ikkalasi kerak | `AGENTS.md` + ichida `@AGENTS.md` va Claude'ga xos qism bo'lgan `CLAUDE.md` | Bitta umumiy manba, ustiga Claude qo'shimchalari | Ikki fayl |
| Shaxsiy sozlamalar | `CLAUDE.local.md` (`.gitignore` da) yoki `~/.claude/CLAUDE.md` | Repo'ga tushmaydi | AGENTS.md'ni o'qishni to'xtatishi mumkin (yuqoridagi tuzoq) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Arxitektura va fayl tuzilishini tasvirlash | CC: agent repo'ni o'zi o'qiydi; tavsif eskiradi va yangilanishi kerak bo'ladi | Faqat koddan ko'rinmaydigan qarorlarni yozing |
| 500 qatorli CLAUDE.md | CC: uzun fayl ko'proq kontekst oladi va unga amal qilish pasayadi | 200 qatordan kam; qolganini skill yoki `.claude/rules/` ga |
| Faylni import bilan "qisqartirish" | CC: import kontekst narxini kamaytirmaydi | Haqiqatan kerakmasini olib tashlang yoki papka qoidasiga o'tkazing |
| "IMPORTANT!!!" qo'shib borish | CC: urg'u yordam bermaydi | Faylni qisqartiring yoki qoidani hook'ga o'tkazing |
| Mavhum qoida ("kodni toza yoz") | CC: tekshirib bo'ladigan darajada aniq bo'lishi kerak | "2 bo'sh joy bilan indent", "commit'dan oldin `npm test`" |
| AGENTS.md bor loyihada `CLAUDE.local.md` yaratish | CC: shunda AGENTS.md o'qilmay qoladi | Project instructions'ni `claude-md-and-agents-md` qiling |
| Codex uchun `AGENTS.override.md` ga yozib, Claude ham o'qiydi deb kutish | CC: Claude Code uni o'qimaydi | Umumiy qoidalar `AGENTS.md` da |

## Amaliyot

1. CLAUDE.md va auto memory farqi nima?
2. CC bo'yicha qachon CLAUDE.md'ga qator qo'shish kerak?
3. CLAUDE.md'ga nima yoziladi va nima yozilmaydi?
4. `foo/bar/` da ishga tushirilgan Claude Code qaysi CLAUDE.md fayllarini yuklaydi va qaysi tartibda?
5. Import fayl hajmini kontekstda kamaytiradimi?
6. Repo'da ham AGENTS.md, ham CLAUDE.md bor. Claude Code standart holatda nimani o'qiydi? Ikkalasini qanday o'qitish mumkin?
7. Tajribada HTML izoh qo'shilgan CLAUDE.md'ning kontekstdagi hajmi nega o'zgarmadi?

<details>
<summary>Javoblar</summary>

1. CLAUDE.md'ni siz yozasiz (ko'rsatma va qoidalar), auto memory'ni Claude yozadi (o'rganilgan narsalar). Ikkalasi har sessiyada yuklanadi; auto memory'dan faqat birinchi 200 qator yoki 25 KB.
2. Claude bir xatoni ikkinchi marta qilganda, kod review agent bilishi kerak bo'lgan narsani ushlaganda, bir tuzatishni yana yozayotganingizda, yangi hamkasbga ham shu kontekst kerak bo'lganda.
3. Yoziladi: tekshirish buyruqlari, kod chalg'itadigan joylar, repo'da yo'q qarorlar, ikki marta tuzatilgan narsalar. Yozilmaydi: koddan ko'rinadigan arxitektura va fayl joylashuvi, ko'p bosqichli jarayonlar (skill'ga), kodning bir qismiga tegishli qoidalar (papka qoidasiga).
4. `foo/CLAUDE.md` va `foo/bar/CLAUDE.md` (va yonidagi `CLAUDE.local.md` lar), ildizdan pastga qarab birlashtiriladi: `foo/CLAUDE.md` oldin, `foo/bar/CLAUDE.md` keyin. Pastki papkalardagilar o'sha papkadagi faylga tegilganda yuklanadi.
5. Yo'q. Import qilingan fayl CLAUDE.md bilan birga yuklanadi.
6. Faqat CLAUDE.md'ni. `/config` → Project instructions'ni `claude-md-and-agents-md` qilish yoki CLAUDE.md'ga `@AGENTS.md` importini qo'shish.
7. CC bo'yicha blok darajasidagi HTML izohlar kontekstga qo'shilishdan oldin olib tashlanadi.

</details>

## Rasmiy hujjat

- [CC: How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [CC: Best practices — Keep CLAUDE.md short](https://code.claude.com/docs/en/best-practices#keep-claudemd-short)
- [CC: Best practices — What you can stop doing](https://code.claude.com/docs/en/best-practices#what-you-can-stop-doing)
- [AGENTS.md](https://agents.md/)
- [CX: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

# 14 — Qoidalarni bo'laklash va auto memory

[Mundarija](README.md)

## Tushuncha

13-bobda CLAUDE.md'ni qisqa tutishni o'rgandik. Lekin loyiha kattalashgani sari "har sessiyada kerak" bo'lmagan qoidalar ko'payadi:
test yozish qoidalari, API qoidalari, frontend uslubi. Ularni CLAUDE.md'ga yozsangiz, fayl o'sadi va har sessiyada keraksiz
kontekst yuklanadi. Bu bobda shu muammoning ikki yechimi bor:

1. **`.claude/rules/`** — qoidalarni mavzular bo'yicha fayllarga bo'lish. Ba'zilarini faqat mos fayl bilan ishlanganda
   yuklanadigan qilish mumkin.
2. **Auto memory** — agentning o'zi yozadigan eslatmalar. Ular sizning tuzatishlaringiz va afzalliklaringizdan yig'iladi.

### `.claude/rules/`

CC (How Claude remembers your project): katta loyihalarda ko'rsatmalarni `.claude/rules/` papkasidagi bir nechta faylga bo'lish
mumkin. Har bir fayl bitta mavzu haqida bo'ladi va nomi tushunarli bo'lishi kerak:

```text
loyiha/
├── .claude/
│   ├── CLAUDE.md
│   └── rules/
│       ├── code-style.md
│       ├── testing.md
│       └── security.md
```

Barcha `.md` fayllar ichki papkalar bilan birga topiladi, shuning uchun `frontend/`, `backend/` kabi guruhlash mumkin.

Ikki xil qoida bor:

| Qoida | Qachon yuklanadi | Kontekst narxi |
| --- | --- | --- |
| `paths` maydonisiz | Sessiya boshida, `.claude/CLAUDE.md` bilan bir xil ustuvorlikda | Har sessiyada, CLAUDE.md kabi |
| `paths` bilan | Claude mos faylni Read, Write yoki Edit bilan ochganda (yoki bitta faylga `cat`, `head` kabi o'qish buyrug'i bilan) | Faqat shu fayllar bilan ishlaganda |

`paths` — YAML frontmatter'dagi yagona maydon. Claude Code qoidadagi boshqa maydonlarni xatosiz e'tiborsiz qoldiradi:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

Glob naqshlari (CC memory):

| Naqsh | Nimaga mos keladi |
| --- | --- |
| `**/*.ts` | Istalgan joydagi `.ts` fayllar |
| `src/**/*` | `src/` ostidagi barcha fayllar |
| `*.md` | Istalgan joydagi `.md` fayllar |
| `/*.md` | Faqat asosiy papkadagi `.md` fayllar, ichki papkalarniki emas |
| `src/**/*.{ts,tsx}` | Bir naqshda bir nechta kengaytma |

**Muhim farq.** CC (Explore the context window) ogohlantiradi: `paths` qoidalari va ichki papkalardagi CLAUDE.md'lar
**xabarlar tarixiga** yuklanadi. Shuning uchun kontekst qisqartirilganda ular ham boshqa xabarlar bilan birga xulosaga
siqiladi. Qoida qisqartirishdan keyin ham saqlanishi kerak bo'lsa, `paths` ni olib tashlang yoki uni ildizdagi CLAUDE.md'ga
o'tkazing. Qisqartirishdan keyin bunday qoidalar mos fayl yana ochilganda qayta yuklanadi.

**Qoida yoki skill?** CC (memory): qoidalar har sessiyada yoki mos fayl ochilganda yuklanadi. Doim kontekstda turishi shart
bo'lmagan, aniq vazifaga oid ko'rsatmalar uchun skill'lar yaxshiroq — ular faqat chaqirilganda yoki agent so'rovga aloqador deb
hisoblaganda yuklanadi (25-bob).

**Shaxsiy qoidalar.** `~/.claude/rules/` dagi qoidalar mashinangizdagi barcha loyihalarga qo'llanadi. Ular loyiha
qoidalaridan oldin yuklanadi. Lekin CC ogohlantiradi: ikkalasi bir-birini bekor qilmaydi. Shaxsiy va loyiha qoidasi bir-biriga
zid bo'lsa, Claude ulardan istalganiga amal qilishi mumkin.

### Auto memory

CC (memory): auto memory Claude'ga siz hech narsa yozmasdan sessiyalar o'rtasida bilim to'plash imkonini beradi. Ishlash
davomida Claude o'zi uchun to'rt xil eslatma saqlaydi:

| Tur (`type`) | Nima |
| --- | --- |
| `user` | Sizning rolingiz, tajribangiz va ish uslubingiz |
| `feedback` | Siz bergan tuzatishlar va tasdiqlagan yondashuvlar |
| `project` | Davom etayotgan ishlar, muddatlar, koddan yoki git tarixidan bilib bo'lmaydigan qarorlar |
| `reference` | Loyihadan tashqaridagi ma'lumot qayerda: issue tracker, dashboard |

CC bo'yicha Claude koddan bilib bo'ladigan narsani (arxitektura, fayl yo'llari, xato tuzatishlar) va CLAUDE.md'da allaqachon
yozilgan narsani saqlamaydi. Har sessiyada ham saqlamaydi: kelajakdagi suhbatda foydali bo'ladimi-yo'qmi, shunga qarab qaror
qiladi.

Qayerda saqlanadi (CC memory):

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md           # indeks, har eslatma bir qator, har sessiyada yuklanadi
├── user_role.md        # bitta eslatma
├── feedback_testing.md # bitta eslatma
└── ...
```

- `<project>` git repozitoriyasidan olinadi, shuning uchun bitta repo'ning barcha worktree'lari va papkalari bitta auto memory'ni
  ishlatadi.
- Auto memory **mashinaga bog'liq**: boshqa kompyuter yoki bulut muhitiga ko'chmaydi.
- `MEMORY.md` ning birinchi 200 qatori yoki 25 KB (qaysi biri oldin kelsa) har sessiya boshida yuklanadi. Mavzu fayllari
  boshida yuklanmaydi, Claude ularni kerak bo'lganda o'qiydi.
- Eski sessiya transkriptlari saqlash muddatidan keyin o'chiriladi, lekin memory fayllari o'chirilmaydi. Ular siz yoki
  Claude o'chirmaguncha turadi.

Boshqarish:

| Amal | Qanday |
| --- | --- |
| Ko'rish va tahrirlash | `/memory` — CLAUDE.md va memory fayllari ro'yxati, auto memory papkasini ochish |
| Yoqish yoki o'chirish | `/memory` dagi almashtirgich (`autoMemoryEnabled` foydalanuvchi sozlamalariga yoziladi) |
| Bitta loyihada o'chirish | Loyiha sozlamalarida `"autoMemoryEnabled": false` |
| Muhit o'zgaruvchisi bilan o'chirish | `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` |

CC (memory) yana bir tafsilotni aytadi: "doim npm emas, pnpm ishlat" yoki "API testlariga lokal Redis kerakligini eslab qol"
deb so'rasangiz, Claude buni **auto memory'ga** saqlaydi. CLAUDE.md'ga qo'shish kerak bo'lsa, buni ochiq ayting: "buni
CLAUDE.md'ga qo'sh".

## Amalda

### 1. `paths` qoidasi qachon yuklanadi

Sinov loyihasiga test fayllari uchun qoida qo'shildi:

```markdown
---
paths:
  - "**/*.test.js"
---

# Test qoidalari
- Har test nomi `funksiya: holat` ko'rinishida, o'zbekcha.
- Chegaraviy qiymatlar uchun alohida test yoziladi.
```

Sessiya boshida `/context` (Claude Code 2.1.325):

```text
Memory files : 426
| Project | …/v12/CLAUDE.md | 426 |
```

Qoida yo'q, faqat CLAUDE.md. Keyin `narx.test.js ni o'qib, nechta test borligini ayt.` so'rovi berildi. Sessiya
transkriptida test fayli o'qilgandan keyin shunday yozuv paydo bo'ldi:

```text
'attachment': {'type': 'nested_memory', 'path': '…/v12/.claude/rules/testlar.md', ...}
```

Qoida xabarlar tarixiga **biriktirma** (attachment) bo'lib qo'shildi. Shu sessiyadagi `/context` da `Memory files` hamon
426 edi: qoida memory fayllari ro'yxatiga emas, xabarlarga tushdi. Hujjatda aytilganidek — shuning uchun kontekst
qisqartirilganda u xulosaga siqiladi.

### 2. "Eslab qol"

```text
Eslab qol: bu loyihaning integratsiya testlari lokal Redis talab qiladi (localhost:6379), Redis ishlamasa testlar osilib qoladi.
```

Agentning javobi:

```text
Saqlab qo'ydim: integratsiya testlari lokal Redis (localhost:6379) talab qiladi, Redis ishlamasa esa testlar xato bermay
osilib qoladi. ...

Bu ma'lumot faqat mening shaxsiy xotiramda saqlandi, boshqa dasturchilar uni ko'rmaydi. `CLAUDE.md` da esa "no dependencies"
deyilgan. Agar xohlasangiz, bu talabni `CLAUDE.md` ga ham qo'shib qo'yaman, shunda u repoda hamma uchun yozilgan bo'ladi.
```

Memory papkasida ikki fayl paydo bo'ldi. `MEMORY.md` — indeks:

```markdown
- [Integratsiya testlari Redis talab qiladi](integratsiya-testlari-redis.md) — localhost:6379 kerak, Redis ishlamasa testlar osilib qoladi
```

`integratsiya-testlari-redis.md` — eslatmaning o'zi:

```markdown
---
name: integratsiya-testlari-redis
description: Integration tests need a local Redis on localhost:6379; without it they hang instead of failing
metadata:
  node_type: memory
  type: project
  originSessionId: 7a2393ab-…
  modified: 2026-11-16T08:11:00.508Z
---

Bu loyihaning integratsiya testlari lokal Redis talab qiladi (localhost:6379). Redis ishlamasa testlar xato bermaydi,
balki osilib qoladi.

**Why:** Foydalanuvchi aytgan (2026-11-16); repoda (CLAUDE.md) bu qayd etilmagan — u yerda "no dependencies" deyilgan.

**How to apply:** Integratsiya testlarini ishga tushirishdan oldin Redis ishlayotganini tekshiring (masalan,
`redis-cli -p 6379 ping`). Testlar osilib qolsa, avval Redisni tekshiring; testlarni timeout bilan ishga tushiring.
```

Uchta kuzatish:

- `type: project` — CC'dagi to'rt turdan biri. `modified` maydonini hujjatda aytilganidek Claude Code o'zi qo'shdi.
- `MEMORY.md` da faqat bir qator turibdi. Har sessiyada aynan shu qator yuklanadi, tafsilot esa kerak bo'lganda o'qiladi.
- Agent muhim tafovutni o'zi ko'rdi: bu **jamoa uchun** fakt, lekin auto memory faqat shu kompyuterda. Bunday fakt
  CLAUDE.md'ga tegishli.

## Qayerga nima yoziladi

| Ma'lumot | Joy | Nega |
| --- | --- | --- |
| Har sessiyada kerak bo'lgan jamoa qoidasi, buyruqlar | `CLAUDE.md` | Git orqali hammaga, har sessiyada |
| Faqat ma'lum fayllarga oid qoida (testlar, API) | `.claude/rules/` + `paths` | Faqat shu fayllar bilan ishlaganda yuklanadi |
| Ko'p bosqichli jarayon (deploy, release) | Skill (25-bob) | Faqat chaqirilganda yuklanadi |
| Shaxsiy, shu loyihaga oid afzallik | `CLAUDE.local.md` yoki auto memory | Repo'ga tushmaydi |
| Barcha loyihalarga oid shaxsiy afzallik | `~/.claude/CLAUDE.md` yoki `~/.claude/rules/` | Mashinangizdagi hamma loyihada |
| Agent o'zi sezgan narsa: tuzatishlaringiz, afzalliklaringiz | Auto memory | Siz yozmasangiz ham yig'iladi |
| Istisnosiz qoida | Hook yoki ruxsat qoidasi | Bular — iltimos emas, majburiyat (26, 35-boblar) |

## Variantlar

| Usul | Yutug'i | Kamchiligi |
| --- | --- | --- |
| Hammasi bitta CLAUDE.md'da | Oddiy, bitta joyda | O'sib boradi, har sessiyada to'liq yuklanadi |
| `.claude/rules/` (`paths` siz) | Mavzular bo'yicha tartibli, jamoaga qulay | Kontekst narxi CLAUDE.md bilan bir xil |
| `.claude/rules/` (`paths` bilan) | Faqat kerak bo'lganda yuklanadi | Qisqartirishda xulosaga siqiladi; naqsh noto'g'ri bo'lsa umuman yuklanmaydi |
| Auto memory | Sizdan hech narsa talab qilmaydi | Mashinaga bog'liq; nima saqlanganini vaqti-vaqti bilan tekshirish kerak |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Test qoidalarini CLAUDE.md'ga yozish | Har sessiyada, test bilan ishlanmaganda ham yuklanadi | `.claude/rules/testing.md` + `paths: ["**/*.test.*"]` |
| Muhim qoidani `paths` bilan cheklash | CC: qisqartirishda xulosaga siqiladi | Doim kerak bo'lsa, `paths` siz yoki CLAUDE.md'da |
| Jamoa faktini "eslab qol" deb aytish | Auto memory faqat sizning mashinangizda | "CLAUDE.md'ga qo'sh" deng |
| Auto memory'ni hech qachon ko'rmaslik | Eskirgan yoki noto'g'ri eslatma qolishi mumkin | `/memory` bilan vaqti-vaqti bilan ko'ring, keraksizini o'chiring |
| Shaxsiy va loyiha qoidalarini zid qilib qo'yish | CC: Claude ulardan istalganiga amal qilishi mumkin | Ikkalasini izchil saqlang |
| Qoida faylida `paths` dan boshqa maydonlar | CC: boshqa maydonlar e'tiborsiz qoldiriladi | Faqat `paths` |

## Amaliyot

1. `paths` bilan va `paths` siz qoida qachon yuklanadi?
2. Nega `paths` qoidasi qisqartirishdan keyin "yo'qolishi" mumkin? Doim kerak bo'lgan qoidani qayerga yozish kerak?
3. Qoida va skill farqi nima?
4. Auto memory qaysi to'rt turdagi eslatmani saqlaydi? Nimani saqlamaydi?
5. `MEMORY.md` dan sessiya boshida qancha yuklanadi? Mavzu fayllari qachon o'qiladi?
6. Tajribada agent nega Redis talabini CLAUDE.md'ga ham qo'shishni taklif qildi?
7. Auto memory'ni bitta loyihada qanday o'chirish mumkin?

<details>
<summary>Javoblar</summary>

1. `paths` siz — sessiya boshida, `.claude/CLAUDE.md` bilan bir xil ustuvorlikda. `paths` bilan — Claude mos faylni Read, Write yoki Edit bilan ochganda (yoki bitta faylni `cat`/`head` bilan o'qiganda).
2. Chunki u xabarlar tarixiga yuklanadi va qisqartirishda boshqa xabarlar bilan birga xulosaga siqiladi. Doim kerak bo'lsa — `paths` siz qoida yoki ildizdagi CLAUDE.md.
3. Qoida har sessiyada yoki mos fayl ochilganda yuklanadi. Skill faqat chaqirilganda yoki agent so'rovga aloqador deb bilganda yuklanadi.
4. `user`, `feedback`, `project`, `reference`. Koddan bilib bo'ladigan narsani (arxitektura, fayl yo'llari, xato tuzatishlar) va CLAUDE.md'da yozilgan narsani saqlamaydi.
5. Birinchi 200 qator yoki 25 KB (qaysi biri oldin kelsa). Mavzu fayllari boshida yuklanmaydi, Claude ularni kerak bo'lganda o'qiydi.
6. Auto memory mashinaga bog'liq va boshqa dasturchilar uni ko'rmaydi. Bu esa jamoa uchun fakt, va CLAUDE.md'dagi "no dependencies" bilan zid edi.
7. Loyiha sozlamalarida `"autoMemoryEnabled": false`.

</details>

## Rasmiy hujjat

- [CC: How Claude remembers your project — Organize rules with .claude/rules/](https://code.claude.com/docs/en/memory#organize-rules-with-clauderules)
- [CC: How Claude remembers your project — Auto memory](https://code.claude.com/docs/en/memory#auto-memory)
- [CC: Explore the context window — What survives compaction](https://code.claude.com/docs/en/context-window#what-survives-compaction)
- [CC: Explore the .claude directory](https://code.claude.com/docs/en/claude-directory)

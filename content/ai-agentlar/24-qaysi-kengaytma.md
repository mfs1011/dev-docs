# 24 — Qaysi kengaytma qachon

[Mundarija](README.md)

## Tushuncha

Claude Code'ning o'rnatilgan tool'lari (3-bob) — poydevor. Ustiga kengaytmalar qo'shiladi. CC (Extend Claude Code) bo'yicha ular
agentik siklning turli joylariga ulanadi:

| Kengaytma | Nima qiladi | Bob |
| --- | --- | --- |
| **CLAUDE.md** | Har sessiyada ko'rinadigan doimiy kontekst | 13 |
| **Output style** | Butun sessiya uchun rol, ohang va javob formati | — |
| **Skill** | Qayta ishlatiladigan bilim va chaqiriladigan jarayonlar | 25 |
| **Kod tahlili** (LSP) | Til serveri: belgi bo'yicha navigatsiya va jonli tur xatolari | 16 |
| **MCP** | Tashqi xizmatlar va tool'larga ulanish | 27, 28 |
| **Subagent** | Alohida kontekstda o'z siklini yuritib, xulosa qaytaradi | 30 |
| **Dinamik workflow** | Claude yozgan skript ko'p subagentni ishga tushirib, bitta natija qaytaradi | 32 |
| **Hook** | Hayot siklidagi hodisada skript, HTTP so'rov, MCP tool chaqiruvi, prompt yoki subagentni ishga tushiradi | 26 |
| **Plagin** va **marketplace** | Yuqoridagilarni paketlab tarqatadi | 29 |

CC bo'yicha eng moslashuvchan kengaytma — **skill**. Bu bilim, jarayon yoki ko'rsatmalar yozilgan markdown fayl. Uni `/deploy`
kabi buyruq bilan chaqirasiz yoki Claude mos kelganda o'zi yuklaydi.

### Kengaytmalarni asta qo'shish

CC (Extend Claude Code): hammasini oldindan sozlash shart emas. Har kengaytmaning tanish **belgisi** (trigger) bor va ko'p jamoalar
ularni taxminan shu tartibda qo'shadi:

| Belgi | Nima qo'shiladi |
| --- | --- |
| Claude konvensiya yoki buyruqni ikki marta noto'g'ri qildi | CLAUDE.md'ga qator |
| Doim "qisqaroq yoz", "ko'proq tushuntir" yoki bir xil format so'rayapsiz | Output style |
| Vazifani boshlash uchun doim bir xil so'rovni yozyapsiz | Foydalanuvchi chaqiradigan skill |
| Bir xil ko'p bosqichli jarayonni uchinchi marta chatga joylayapsiz | Skill |
| Claude ko'ra olmaydigan brauzer oynasidan ma'lumotni doim ko'chiryapsiz | MCP server |
| Belgining ta'rifini topish uchun Claude ko'p fayl o'qiyapti | Kod tahlili plagini |
| Yon vazifa suhbatni keyin kerak bo'lmaydigan chiqish bilan to'ldiryapti | Subagent |
| Biror narsa so'ramasdan har safar bo'lishi kerak | Hook |
| Ikkinchi repo'ga ham xuddi shu sozlamalar kerak | Plagin |

Hujjat qo'shimcha qiladi: shu belgilar mavjud kengaytmani **yangilash** vaqtini ham ko'rsatadi. Takrorlanadigan xato yoki qaytadigan
review izohi — chatdagi bir martalik tuzatish emas, CLAUDE.md o'zgarishi. Qo'lda o'zgartirib turiladigan jarayon esa qayta
ko'rib chiqilishi kerak bo'lgan skill.

### O'xshash kengaytmalarni farqlash

CC (Extend Claude Code) bir-biriga o'xshab ko'rinadiganlarini juftlab solishtiradi:

| Juftlik | Farq | Qoida |
| --- | --- | --- |
| **CLAUDE.md va skill** | CLAUDE.md har sessiyada yuklanadi; skill kerak bo'lganda | Har doim bilishi kerak bo'lsa CLAUDE.md; ba'zan kerak ma'lumotnoma yoki `/nom` bilan chaqiriladigan jarayon bo'lsa skill |
| **CLAUDE.md, `rules` va skill** | `rules` har sessiyada yoki mos fayl ochilganda | `rules` CLAUDE.md'ni ixcham saqlash uchun (14-bob) |
| **CLAUDE.md va output style** | CLAUDE.md — loyiha haqidagi faktlar; output style — javob qanday bo'lishi | Uslub almashtiriladigan, javobning o'ziga oid narsa bo'lsa — output style |
| **Skill va subagent** | Skill — istalgan kontekstga yuklanadigan mazmun; subagent — alohida kontekstli ishchi | Kontekstni ajratish yoki parallel ish kerak bo'lsa subagent |
| **Subagent va dinamik workflow** | Subagent'da keyingi qadamni Claude hal qiladi; workflow'da skript hal qiladi | Bir nechta subagentga sig'maydigan ish yoki topilmalarni o'zaro tekshirish kerak bo'lsa workflow |
| **MCP va skill** | MCP — tashqi tizimga ulanish va tool'lar; skill — ularni qanday yaxshi ishlatish bilimi | Birga ishlatiladi: MCP bazaga ulaydi, skill sxema va so'rov naqshlarini o'rgatadi |
| **Hook va skill** | Hook — Claude qaror qilmasdan hodisada ishlaydi; skill — Claude o'qib amal qiladigan ko'rsatma | Har safar bir xil bo'lishi kerak va o'ylashni talab qilmasa hook; Claude qanday qo'llashni hal qilishi kerak bo'lsa skill |

Oxirgi juftlik bo'yicha CC'ning eng muhim gapi: **himoya chegaralarini hook'larga qo'ying.** CLAUDE.md yoki skill'dagi "`.env` ni
hech qachon tahrirlama" — bu iltimos, kafolat emas. Tahrirni bloklaydigan `PreToolUse` hook esa majburlash (3-bob).

### Kontekst narxi

12-bobdagi jadval shu yerda ham kerak. CC (Extend Claude Code):

| Kengaytma | Qachon yuklanadi | Narx |
| --- | --- | --- |
| CLAUDE.md | Sessiya boshida, to'liq | Har so'rovda |
| Output style | Sessiya boshida va uslub almashtirilganda | Har so'rovda |
| Skill | Boshida tavsif, ishlatilganda to'liq mazmun | Kam (tavsiflar har so'rovda) |
| MCP | Boshida tool nomlari, sxemalar kerak bo'lganda | Tool ishlatilmaguncha kam |
| Subagent | Ishga tushirilganda | Asosiy sessiyadan alohida |
| Hook | Hodisada | Nol, agar qo'shimcha kontekst qaytarmasa |

CC ogohlantiradi: ortiqcha kengaytma faqat kontekstni to'ldirmaydi, **shovqin** ham qo'shadi. Skill'lar noto'g'ri ishga tushishi yoki
Claude konvensiyalaringizni yo'qotishi mumkin.

### Bir nechta darajada bo'lsa

CC (Extend Claude Code) — bir kengaytma foydalanuvchi, loyiha, plagin va boshqariladigan siyosat darajalarida bo'lsa:

| Kengaytma | Qanday birlashadi |
| --- | --- |
| CLAUDE.md | Qo'shiladi: hamma darajalar birga kontekstga tushadi; zid bo'lsa, Claude o'zi muvofiqlashtiradi |
| Skill va subagent | Nom bo'yicha bittasi g'olib (skill uchun: managed > user > project). Plagin skill'lari nomlar maydoniga ega: `/plagin:nom` |
| MCP serverlar | Nom bo'yicha: local > project > user |
| Hook'lar | Birlashadi: manbasidan qat'i nazar mos hamma hook ishlaydi |

### Birga ishlatish

CC'dagi namunalar:

| Namuna | Qanday | Misol |
| --- | --- | --- |
| Skill + MCP | MCP ulanishni beradi, skill uni yaxshi ishlatishni o'rgatadi | MCP bazaga ulaydi, skill sxema va so'rov naqshlarini tushuntiradi |
| Skill + subagent | Skill parallel ish uchun subagentlarni ishga tushiradi | `/audit` xavfsizlik, tezlik va uslub subagentlarini ishga tushiradi |
| CLAUDE.md + skill | CLAUDE.md'da doimiy qoida, skill'da kerak bo'lganda yuklanadigan ma'lumotnoma | CLAUDE.md "API konvensiyalariga amal qil" deydi, skill'da to'liq API uslub qo'llanmasi |
| Hook + MCP | Hook MCP orqali tashqi harakatni ishga tushiradi | Muhim fayl o'zgarganda Slack'ga xabar |
| Hook + skill | Hook lint'ni ishga tushirib xatolarni Claude'ga beradi, skill tuzatish qoidalarini | `PostToolUse` + `/fix-lint` |

## Qaror daraxti

Yuqoridagi jadvallardan yig'ilgan savollar ketma-ketligi:

```text
Biror narsa har safar, Claude qaror qilmasdan bo'lishi kerakmi?
  ├─ ha → HOOK (yoki ruxsat qoidasi)
  └─ yo'q → Claude buni har sessiyada bilishi kerakmi?
        ├─ ha → kodning bir qismigagina tegishlimi?
        │     ├─ ha → .claude/rules/ + paths
        │     └─ yo'q → CLAUDE.md (qisqa!)
        └─ yo'q → bu tashqi tizimga kirishmi?
              ├─ ha → MCP (+ uni ishlatish bilimi uchun skill)
              └─ yo'q → bu bilim yoki takroriy jarayonmi?
                    ├─ ha → SKILL
                    └─ yo'q → ko'p o'qish yoki parallel ish → SUBAGENT

Ikkinchi repo'ga ham kerak bo'lsa → hammasini PLAGINGA yig'ing.
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Hammasini oldindan sozlash | CC: ortiqcha kengaytma shovqin qo'shadi | Belgi paydo bo'lganda qo'shing |
| Ma'lumotnomani (API qo'llanma) CLAUDE.md'ga yozish | Har sessiyada to'liq yuklanadi | Skill |
| "Hech qachon" qoidasini skill yoki CLAUDE.md'ga yozish | CC: bu iltimos, kafolat emas | Hook yoki ruxsat qoidasi |
| Har tashqi tizim uchun MCP | Ko'p tool nomlari kontekst oladi; ba'zan oddiy CLI yetarli | 27-bob: MCP va CLI'ni solishtiring |
| Didga oid narsaga hook | CC (3-bob): bunday hook'larni o'chirib, qarorni Claude'ga qoldiring | Hook — faqat istisnosiz qoidalar uchun |

## Amaliyot

1. Skill va subagent farqi nima?
2. "Har tahrirdan keyin ESLint" — qaysi kengaytma? "Deploy jarayoni" — qaysi?
3. CC bo'yicha qachon plagin kerak bo'ladi?
4. Skill bir nechta darajada bir xil nom bilan bo'lsa nima bo'ladi? Hook'lar-chi?
5. MCP va skill qanday birga ishlaydi?
6. "`.env` ni tahrirlama" qoidasini qayerga yozish kerak va nega?

<details>
<summary>Javoblar</summary>

1. Skill — istalgan kontekstga yuklanadigan qayta ishlatiladigan mazmun (asosiy oynaga qo'shiladi). Subagent — o'z kontekstiga ega alohida ishchi, faqat xulosa qaytaradi.
2. ESLint — hook (`PostToolUse`), chunki har safar Claude qaror qilmasdan bo'lishi kerak. Deploy jarayoni — skill (`/deploy`), chunki ko'p bosqichli va Claude qanday qo'llashni hal qiladi.
3. Ikkinchi repo'ga ham xuddi shu sozlamalar kerak bo'lganda yoki boshqalarga tarqatish uchun.
4. Skill: nom bo'yicha bittasi g'olib (managed > user > project), plagin skill'lari nomlar maydoniga ega. Hook'lar birlashadi: hammasi ishlaydi.
5. MCP tashqi tizimga ulanish va tool'larni beradi, skill esa ularni yaxshi ishlatish bilimini (masalan, baza sxemasi va so'rov naqshlari).
6. `PreToolUse` hook yoki ruxsat taqiq qoidasiga. CLAUDE.md va skill'dagi ko'rsatma — iltimos, hook esa majburlash.

</details>

## Rasmiy hujjat

- [CC: Extend Claude Code](https://code.claude.com/docs/en/features-overview)
- [CC: How Claude Code works — Tools](https://code.claude.com/docs/en/how-claude-code-works#tools)
- [CC: Best practices — Deterministic and non-deterministic instructions](https://code.claude.com/docs/en/best-practices#deterministic-and-non-deterministic-instructions)

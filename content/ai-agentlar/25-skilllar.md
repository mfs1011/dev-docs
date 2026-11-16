# 25 — Skill'lar

[Mundarija](README.md)

## Tushuncha

CC (Extend Claude with skills): **skill** — ko'rsatmalar yozilgan `SKILL.md` fayli. Claude Code uni o'z vositalari qatoriga qo'shadi.
Claude mos kelganda skill'ni o'zi ishlatadi yoki siz uni `/skill-nomi` bilan chaqirasiz.

Qachon skill yaratish kerak (CC):

- bir xil ko'rsatma, tekshiruv ro'yxati yoki ko'p bosqichli jarayonni chatga qayta-qayta joylayotgan bo'lsangiz;
- CLAUDE.md'ning bir bo'limi fakt emas, **jarayonga** aylanib qolgan bo'lsa.

CLAUDE.md'dan farqi: skill'ning matni **faqat ishlatilganda** yuklanadi. Shuning uchun uzun ma'lumotnoma kerak bo'lmaguncha deyarli
hech narsa turmaydi. CC (Best practices) shunday asoslaydi: kuchliroq model muhandislikni yaxshiroq biladi, lekin **sizning**
jamoangiz relizni qanday qilishini, incident runbook'ingizda nima yozilganini yoki API hujjatlarini qanday yozishni bilmaydi. Bu
bilim skill'ga yoziladi. CLAUDE.md'dagi qoida skill'larga ham tegishli: faqat Claude o'zi topa olmaydigan narsani yozing.

CC skill'lar **Agent Skills** ochiq standartiga amal qilishini aytadi (agentskills.io). Standart bir nechta AI vositasida ishlaydi,
Claude Code esa unga qo'shimcha imkoniyatlar qo'shadi.

### Tuzilishi

```text
.claude/skills/
└── reliz-izoh/
    └── SKILL.md      # frontmatter + ko'rsatmalar
```

`SKILL.md` ikki qismdan iborat:

1. `---` orasidagi **YAML frontmatter** — Claude'ga skill'ni qachon ishlatishni aytadi;
2. **markdown matn** — skill ishga tushganda Claude bajaradigan ko'rsatmalar.

Papka nomi (yoki frontmatter'dagi `name`) chaqiriladigan buyruqqa aylanadi. `description` esa Claude'ga skill'ni qachon avtomatik
yuklashni hal qilishga yordam beradi.

### Qayerda saqlanadi

CC (skills):

| Joy | Yo'l | Qayerda yuklanadi |
| --- | --- | --- |
| Shaxsiy | `~/.claude/skills/<nom>/SKILL.md` | Shu kompyuterdagi barcha loyihalaringizda |
| Loyiha | `.claude/skills/<nom>/SKILL.md` | Shu repo sessiyalarida; commit qilinsa, butun jamoada |
| Ichki papka | `<papka>/.claude/skills/<nom>/SKILL.md` | Shu papkada yoki undan pastda boshlangan sessiyalarda |
| Plagin | `<plagin>/skills/<nom>/SKILL.md` | Plagin yoqilgan joyda, `/plagin:nom` ko'rinishida |
| Tashkilot | Boshqariladigan sozlamalar papkasida | Tashkilot o'rnatgan kompyuterlarda |

Eski format — `.claude/commands/` dagi markdown fayllar — hamon ishlaydi. Lekin CC yangi ish uchun skill'ni tavsiya qiladi, chunki
unga qo'shimcha fayllar (skriptlar) qo'shish mumkin.

### Ikki xil mazmun

CC (skills):

| Tur | Nima | Misol |
| --- | --- | --- |
| **Ma'lumotnoma** (reference) | Claude joriy ishga qo'llaydigan bilim: konvensiyalar, naqshlar, uslub qo'llanmasi, domen bilimi | `api-conventions` — API yozish qoidalari |
| **Vazifa** (task) | Aniq harakat uchun qadamma-qadam ko'rsatma: deploy, commit, kod generatsiyasi | `deploy` — test, build, joylash |

Vazifa skill'larini ko'pincha Claude'ga qoldirmasdan o'zingiz `/nom` bilan chaqirishni xohlaysiz.

### Kim chaqiradi

CC (skills) — ikki frontmatter maydoni:

| Frontmatter | Siz chaqira olasiz | Claude chaqira oladi | Kontekstda nima turadi |
| --- | --- | --- | --- |
| (standart) | Ha | Ha | Tavsif doim; to'liq matn chaqirilganda |
| `disable-model-invocation: true` | Ha | O'zi emas | Tavsif yo'q; to'liq matn chaqirilganda |
| `user-invocable: false` | Yo'q | Ha | Tavsif doim; to'liq matn chaqirilganda |

CC maslahati: yon ta'siri bor jarayonlar uchun — `/commit`, `/deploy`, `/send-slack-message` — `disable-model-invocation: true`
qo'ying. Kod tayyor ko'ringani uchun Claude deploy qilishni o'zi hal qilishini istamaysiz. Shunday skill'ni Claude so'rovingizda
`/deploy` alohida so'z bo'lib kelmasa chaqirmoqchi bo'lsa, Claude Code bu chaqiruvni bloklaydi.

### Foydali maydonlar va imkoniyatlar

| Imkoniyat | Qanday | Nima uchun |
| --- | --- | --- |
| Argumentlar | `$ARGUMENTS` (va nomlangan `arguments`) | `/reliz-izoh v1.1` — `v1.1` matnga qo'yiladi |
| Dinamik kontekst | `` !`buyruq` `` qatori | Claude Code buyruqni ishga tushirib, qatorni natija bilan almashtiradi — Claude skill'ni allaqachon jonli ma'lumot bilan oladi |
| Oldindan ruxsat | `allowed-tools: Read Grep` | Skill chaqirilgan navbatda bu tool'lar ruxsat so'ramaydi |
| Subagent'da ishlatish | `context: fork` | Skill alohida kontekstda ishlaydi (30-bob) |
| Faqat ayrim fayllarda | `paths: ["src/api/**"]` | Shu fayllar bilan ishlaganda avtomatik yuklanadi |
| Model va effort | `model`, `effort` | Shu navbat uchun boshqa model yoki chuqurlik |

**Hayot sikli.** CC (skills): chaqirilgan skill matni suhbatga bitta xabar bo'lib kiradi va keyingi navbatlarda ham turadi. Claude
Code faylni qayta o'qimaydi. Shuning uchun butun vazifa davomida amal qilinishi kerak bo'lgan ko'rsatmalarni bir martalik qadam
emas, doimiy qoida qilib yozing. Kontekst qisqartirilganda skill'lar qaytariladi: har biri ko'pi bilan 5000 token, jami 25 000 token
(15-bob). Matnni qisqa tuting: yuklangan skill'ning har qatori takrorlanadigan token narxi.

**O'rnatilgan skill'lar.** Claude Code o'zi bir nechta skill bilan keladi: `/doctor`, `/code-review`, `/batch`, `/debug`, `/loop`,
`/claude-api` va boshqalar. Ular buyruqlar ro'yxatida **Skill** belgisi bilan ko'rsatilgan.

## Amalda

Sinov repo'siga ikki skill qo'shildi (Claude Code 2.1.325).

**Vazifa skill'i** — `.claude/skills/reliz-izoh/SKILL.md`:

```markdown
---
description: Oxirgi tegdan beri o'zgarishlar bo'yicha o'zbekcha reliz izohi yozadi
disable-model-invocation: true
argument-hint: "[versiya]"
---

## Commit'lar

!`git log --oneline -20`

## Vazifa

Yuqoridagi commit'lardan $ARGUMENTS versiyasi uchun reliz izohi yoz:
- "Yangi", "Tuzatildi", "Ichki" bo'limlari; har band bir qator, foydalanuvchi tilida.
- `test:`/`chore:` commit'lari faqat "Ichki" bo'limiga.
- Commit'da yo'q narsani qo'shma.
```

**Ma'lumotnoma skill'i** — `.claude/skills/narx-qoidalari/SKILL.md`:

```markdown
---
description: Narx, chegirma, jarima va to'lov funksiyalari uchun biznes qoidalari. narx.js ga pul hisoblaydigan kod yozilganda yoki o'zgartirilganda ishlat.
---

- Pul doim butun so'mda; yaxlitlash `Math.round`, bo'lishda qoldiq yo'qolmasin.
- Foiz butun son ko'rinishida keladi (10 = 10%).
- Manfiy summa yoki 100% dan katta foiz — `RangeError` tashlanadi.
- Har yangi funksiyaga chegaraviy testlar (0, chegara, chegara+1).
```

### 1. Kontekstda nima turadi

`/context` ning skill'lar ro'yxatidan:

```text
| narx-qoidalari | Project | ~50 |
```

`narx-qoidalari` tavsifi taxminan 50 token. `reliz-izoh` ro'yxatda **yo'q**: `disable-model-invocation: true` uning tavsifini ham
kontekstdan chiqaradi. Jadvaldagi qoida amalda ko'rindi.

### 2. Vazifa skill'i: `/reliz-izoh v1.1`

```text
## v1.1 reliz izohi

### Yangi
- Muddatli to'lov: summani oylik to'lovlarga bo'lish mumkin (`bolibTolash`).
- Kechikkan to'lov uchun jarima: har bir kechikkan kun uchun 0,1%, eng ko'pi 10% (`jarima`).

### Tuzatildi
- Savat jami summasi endi birinchi mahsulotni ham hisobga oladi (`jami`).
- Chegirma endi foiz sifatida to'g'ri hisoblanadi: masalan, 10 kiritilsa 10% chegirma qilinadi (`chegirma`).
...

### Ichki
- `jami`, `chegirma`, `bolibTolash` va `jarima` uchun chegaraviy holatlarni tekshiradigan testlar qo'shildi.
...
```

`` !`git log --oneline -20` `` qatori jonli commit ro'yxati bilan almashtirildi va izoh shundan yozildi. Agent o'zi qabul qilgan
qarorlarni ham sanadi:

```text
- **Commit'lar doirasi:** repoda tag yo'q, shuning uchun `init` dan keyingi hamma commit'larni v1.1 ga kiritdim. ...
- **`bolibTolash` tuzatishi:** bu funksiya shu relizning o'zida qo'shilgan. Demak foydalanuvchilar xatoli versiyani hech qachon
  ko'rmagan. Xohlasangiz bu bandni "Tuzatildi"dan olib tashlab, "Yangi" bo'limidagi bandga qo'shib yuboraman.
```

Ikkinchi qaror diqqatga sazovor: agent commit'lar tarixini mantiqan tahlil qildi va reliz izohini foydalanuvchi nuqtai nazaridan
to'g'riroq qilishni taklif qildi. Skill'dagi "foydalanuvchi tilida" qoidasi shuni talab qilgan edi.

### 3. Ma'lumotnoma skill'i o'zi yuklanadi

So'rovda skill tilga olinmadi:

```text
narx.js ga qaytarish(summa, foiz) funksiyasini qo'sh: tovar qaytarilganda mijozga qaytariladigan summani hisoblaydi
(summadan foiz ushlab qolinadi).
```

Agentning **birinchi** tool chaqiruvi:

```text
TOOL: Skill {"skill": "narx-qoidalari"}
```

So'rov tavsifdagi "pul hisoblaydigan kod" ga mos keldi va Claude skill'ni o'zi yukladi. Natijada qoidalar kodda ko'rindi:

```js
export function qaytarish(summa, foiz) {
  if (summa < 0) throw new RangeError("Summa manfiy bo'lishi mumkin emas")
  if (foiz < 0 || foiz > 100) throw new RangeError("Foiz 0 va 100 orasida bo'lishi kerak")
  // Ushlab qolinadigan qism yaxlitlanadi, qaytarish esa ayirma sifatida olinadi:
  // ushlanma + qaytarish har doim aniq summaga teng, 1 so'm ham yo'qolmaydi
  const ushlanma = Math.round(summa * foiz / 100)
  return summa - ushlanma
}
```

`RangeError`, butun so'mga yaxlitlash, qoldiq yo'qolmasligi, chegaraviy testlar (0%, 100%, 0 summa, -1, 101%) — skill'dagi har bir
qoida bajarildi. Testlar 17/17 o'tdi. Agentning hisoboti ham buni ochiq aytdi: "`narx-qoidalari` skill'idagi pul qoidalari bo'yicha".

20-bobni eslang: o'sha yerda agent `chegirma` 100% dan katta foizni tekshirmasligini "shubhali joy" deb ko'rsatgan edi. Qoida
skill'ga yozilgach, yangi funksiyada bu muammo boshidanoq hal bo'ldi.

## Variantlar

| Joy | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Har safar so'rovda yozish | Sozlash yo'q | Takrorlanadi, unutiladi | Bir martalik ko'rsatma |
| CLAUDE.md | Har sessiyada, avtomatik | Har sessiyada to'liq kontekst oladi | Qisqa, har doim kerak fakt |
| Ma'lumotnoma skill'i | Kerak bo'lganda o'zi yuklanadi; tavsif arzon | Tavsif yaxshi yozilmasa yuklanmaydi | Domen qoidalari, uslub qo'llanmasi |
| Vazifa skill'i (`disable-model-invocation`) | Siz chaqirganda; kontekstda hech narsa turmaydi | Qo'lda chaqirish kerak | Deploy, reliz, xabar yuborish |
| Hook | Har safar, Claude qaror qilmasdan | Faqat aniq tekshirib bo'ladigan narsa | Istisnosiz qoidalar (26-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Deploy skill'ini `disable-model-invocation` siz qoldirish | CC: kod tayyor ko'ringani uchun Claude o'zi deploy qilishi mumkin | Yon ta'sirli skill'larga `disable-model-invocation: true` |
| Noaniq `description` ("foydali qoidalar") | Claude qachon yuklashni bilmaydi | Nima va qachon: "narx.js ga pul hisoblaydigan kod yozilganda" |
| Uzun, hikoya qiluvchi skill matni | CC: yuklangan har qator takrorlanadigan token narxi | Nima qilishni ayting, qanday va nega deb hikoya qilmang |
| Bir martalik qadamlarni yozish | CC: skill keyingi navbatlarda qayta o'qilmaydi | Butun vazifa uchun doimiy qoidalar |
| Claude o'zi topa oladigan narsani yozish | CC: CLAUDE.md qoidasi skill'larga ham tegishli | Faqat jamoaga xos, koddan ko'rinmaydigan bilim |
| "Hech qachon" qoidasini skill'ga yozish | Skill — ko'rsatma, kafolat emas | Hook yoki ruxsat qoidasi |

## Amaliyot

1. Qachon skill yaratish kerak? U CLAUDE.md'dan nimasi bilan farq qiladi?
2. Ma'lumotnoma va vazifa skill'larining farqi nima?
3. `disable-model-invocation: true` va `user-invocable: false` nima qiladi? Kontekstga qanday ta'sir qiladi?
4. `` !`git log --oneline -20` `` qatori nima qiladi?
5. Tajribada ma'lumotnoma skill'i qanday yuklandi va uning ta'siri kodda qanday ko'rindi?
6. Skill matnini qanday yozish kerak va nega?

<details>
<summary>Javoblar</summary>

1. Bir xil ko'rsatma yoki jarayonni qayta-qayta joylayotganda yoki CLAUDE.md bo'limi jarayonga aylanganda. Skill matni faqat ishlatilganda yuklanadi, CLAUDE.md esa har sessiyada to'liq yuklanadi.
2. Ma'lumotnoma — Claude joriy ishga qo'llaydigan bilim (konvensiyalar, qoidalar). Vazifa — aniq harakat uchun qadamma-qadam ko'rsatma (deploy, reliz), ko'pincha qo'lda chaqiriladi.
3. `disable-model-invocation: true` — faqat siz chaqira olasiz, tavsifi kontekstda turmaydi. `user-invocable: false` — faqat Claude chaqira oladi, `/` menyusida ko'rinmaydi, tavsifi kontekstda turadi.
4. Dinamik kontekst: Claude Code buyruqni ishga tushirib, qatorni natija bilan almashtiradi; Claude skill'ni jonli commit ro'yxati bilan oladi.
5. So'rovda skill tilga olinmagan bo'lsa ham, Claude birinchi qadamdayoq `Skill` tool'i bilan uni yukladi (so'rov tavsifga mos keldi). Kodda `RangeError`, yaxlitlash, qoldiq yo'qolmasligi va chegaraviy testlar paydo bo'ldi.
6. Qisqa: nima qilishni ayting, hikoya qilmang; butun vazifa uchun doimiy qoida qilib yozing. Yuklangan har qator takrorlanadigan token narxi va skill keyingi navbatlarda qayta o'qilmaydi.

</details>

## Rasmiy hujjat

- [CC: Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [CC: Best practices — Put team procedures in skills](https://code.claude.com/docs/en/best-practices#put-team-procedures-in-skills)
- [CC: Extend Claude Code — Compare similar features](https://code.claude.com/docs/en/features-overview#compare-similar-features)
- [CC: Commands](https://code.claude.com/docs/en/commands)
- [Agent Skills](https://agentskills.io)

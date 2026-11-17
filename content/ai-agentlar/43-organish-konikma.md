# 43 — AI bilan o'rganish va ko'nikmani saqlash

[Mundarija](README.md)

> ⚑ Tadqiqot natijalari Anthropic maqolasidan olingan. Learning uslubi `-p` rejimida sinaldi. Interaktiv sessiyadagi `TODO(human)` oqimi
> sinalmadi — rasmiy hujjat asosida yozilgan.

## Tushuncha

Agent kodni tez yozadi. Lekin siz o'sha kodni **tushunasizmi** va keyin o'zingiz yoza olasizmi? Bu savol ayniqsa yangi kutubxona yoki
yangi sohani o'rganayotganda muhim: agentning ishini nazorat qilish (review, debugging) uchun o'sha bilim kerak.

### Tadqiqot: AI yordami va kodlash ko'nikmasi

AE (How AI assistance impacts the formation of coding skills, 2026-01-29, J. H. Shen, A. Tamkin; arXiv 2601.20245):

| Jihat | Tafsilot |
| --- | --- |
| Tur | Randomlashtirilgan nazorat ostidagi tajriba (RCT) |
| Ishtirokchilar | 52 nafar, asosan junior dasturchilar: bir yildan ortiq har hafta Python ishlatgan, AI yordamchilarini biroz bilgan, **Trio** kutubxonasini ishlatmagan |
| Vazifa | Trio (Python'da asinxron dasturlash kutubxonasi) bilan ikki funksiya yozish: 10 daqiqa tayyorgarlik, 35 daqiqa vazifa, 25 daqiqa test, 5 daqiqa so'rovnoma |
| Guruhlar | AI guruhi — vazifa paytida yon panelda AI yordamchi; qo'lda guruhi — AI'siz |
| Baholash | Test: debugging, kod o'qish, kod yozish, tushuncha savollari |

Natijalar:

| Ko'rsatkich | AI guruhi | Qo'lda guruhi | Ahamiyati |
| --- | --- | --- | --- |
| Vazifa vaqti | ~23 daqiqa | ~25 daqiqa | Statistik ahamiyatsiz (p = 0.391) |
| Test bali | **50%** | **67%** | Statistik ahamiyatli (p = 0.01, Cohen's d = 0.738) |

Eng katta farq — **debugging** savollarida. Mualliflar xulosasi: AI yordamidan foydalanish o'zlashtirishning statistik ahamiyatli
pasayishiga olib keldi. Ya'ni AI guruhi deyarli tezroq ishlamadi, lekin kamroq o'rgandi.

### Qaysi usul bilimni saqlagan

Mualliflar ishtirokchilarning AI bilan qanday muloqot qilganini ham tahlil qilgan:

| Past ball (o'rtacha 40% dan kam) | Yuqori ball (o'rtacha 65% va undan ko'p) |
| --- | --- |
| **To'liq topshirish** (AI delegation, n=4): butun kodni AI yozgan. Eng tez, xato kam | **Yozdirib, keyin tushunish** (generation-then-comprehension, n=2): kod so'rab, keyin uni tushunish uchun savollar bergan |
| **Asta-sekin topshirish** (progressive AI reliance, n=4): bir-ikki savoldan keyin hamma kodni AI'ga bergan; ikkinchi vazifada tushunchalarni o'zlashtirmagan | **Kod + tushuntirish** (hybrid code-explanation, n=3): kodni tushuntirish bilan birga so'ragan. Ko'proq vaqt, lekin yaxshiroq tushunish |
| **AI bilan takroriy debugging** (iterative AI debugging, n=4): AI'dan tushunish uchun emas, xatoni tuzatish yoki tekshirish uchun foydalangan. Sekinroq va past ball | **Faqat tushuncha so'rash** (conceptual inquiry, n=7): faqat tushuncha savollari, xatolarni o'zi hal qilgan. Yuqori ballilar ichida eng tezi |

Muhim izoh: mualliflar bu sifat tahlili usullar va natija orasidagi **sabab-oqibat bog'liqligini isbotlamasligini** aytadi.

Maqoladagi bir fikr: "Cognitive effort—and even getting painfully stuck—is likely important for fostering mastery." Ya'ni aqliy
zo'riqish, hatto og'riqli tiqilib qolish ham o'zlashtirish uchun muhim bo'lishi mumkin.

### Cheklovlar (mualliflarning o'zi aytgan)

- Tanlov nisbatan kichik.
- Tushunish vazifadan darhol keyin o'lchangan — uzoq muddatli ko'nikmani bashorat qiladimi, noma'lum.
- Dasturchi tajriba orttirgani sari effekt yo'qoladimi, noma'lum.
- Tajribada yon panel yordamchisi ishlatilgan, **Claude Code kabi agentli vositalar emas**. Mualliflar agentli vositalarda effekt
  kuchliroq bo'lishini kutadi.
- Kodlashdan boshqa vazifalarga ta'siri noma'lum.

### Tavsiyalar (maqoladan)

- **Rahbarlar:** AI vositalarini o'ylab joriy qilish va dasturchilar o'rganishda davom etadigan tizim qurish — ular mazmunli nazorat
  qila olishi uchun.
- **Dasturchilar:** AI'dan tushunishni oshiradigan tarzda foydalanish; masalan, Claude Code va ChatGPT'dagi o'rganish rejimlari.
- **Vosita yaratuvchilar:** samaradorlik va ko'nikmani birga qo'llab-quvvatlaydigan AI.

### Claude Code'dagi o'rganish uslublari

CC (Output styles): chiqish uslubi (output style) — sessiyadagi har javob uchun rol, ohang va format ko'rsatmalari. O'rganishga
ikkitasi tegishli:

| Uslub | Nima o'zgaradi | Qachon |
| --- | --- | --- |
| **Explanatory** | Claude vazifani odatdagidek bajaradi va kod ortidagi tanlovlarni tushuntiruvchi qisqa `Insight` bloklarini qo'shadi (faylga izoh sifatida emas, suhbatda) | Kod bazasi bilan tanishayotganda yoki o'zgarish bilan birga sababini ham bilmoqchi bo'lsangiz |
| **Learning** | `Insight` bloklari + kodning bir qismini **sizga** qoldiradi. Oddiy qismini o'zi yozadi; haqiqiy dizayn qarori bor joyda (xatolarni qayta ishlash, ma'lumot tuzilmasi, bir nechta to'g'ri yo'li bor biznes mantiq) faylga `TODO(human)` izohini qo'yib, nima qurilgani, nima yozish va nimani hisobga olish kerakligini aytib, **to'xtaydi va kutadi** | Vazifa bajarilayotganda qo'lda kodlash mashqi kerak bo'lsa |

Yoqish:

```text
/output-style learning
```

yoki `settings.json` da (qiymat katta-kichik harfga sezgir):

```json
{ "outputStyle": "Learning" }
```

Buyruq va menyu tanlovni `.claude/settings.local.json` ga yozadi. Barcha loyihalar uchun — `~/.claude/settings.json`. Uslub sessiya
o'rtasida keyingi xabardan boshlab amal qiladi va keshni buzmaydi (41-bob).

CC eslatmasi: uslub — ko'rsatma, **kafolat emas**. Har doim bajarilishi shart bo'lgan narsa uchun hook (26-bob).

## Amalda: Learning uslubi `-p` rejimida

40-bobdagi bo'lib to'lash vazifasi Learning uslubida, kuzatuvsiz rejimda:

```bash
claude -p "tolov.js dagi bolibTolash funksiyasida xato bor: ... Tuzat va test qo'sh. Commit qilma." \
  --settings '{"outputStyle":"Learning"}' --allowedTools "Read" "Edit" "Write" "Bash(npm test*)"
```

Agent vazifani **o'zi to'liq bajardi** — `TODO(human)` qoldirmadi (javobni kutadigan odam yo'q). Lekin javob oxirida `Insight` bloki
paydo bo'ldi:

```text
★ Insight ─────────────────────────────────────
- Qoldiqni qaysi oylarga qo'yish — biznes qarori. Men birinchi oylarni tanladim, chunki mijoz ortiqcha so'mni boshida to'lab qo'yadi.
  Agar banklardagi kabi ortiqcha summani oxirgi to'lovga qo'yish kerak bo'lsa, shartni `i >= oylar - qoldiq` ga almashtirish yetadi.
- Uchinchi test aniq javoblarni emas, har qanday kirishda doim bajarilishi kerak bo'lgan shartlarni tekshiradi. ...
─────────────────────────────────────────────────
```

Bu blokda o'rganish uchun ikki narsa bor: **dizayn qarori** (qoldiq qaysi oyga — biznes masalasi, kod emas) va **test usuli** (aniq
misollar o'rniga doim bajariladigan shartlar). Oddiy uslubda bular ko'pincha aytilmaydi.

Xulosa: Learning'ning asosiy qismi — kodni o'zingiz yozish — **interaktiv sessiyada** ishlaydi. `-p` va skriptlarda u amalda
Explanatory kabi bo'ladi.

## O'rganish uchun ish tartibi

Tadqiqotdagi yuqori balli usullar va CC vositalarini birlashtirsak:

| Vaziyat | Nima qilish | Asos |
| --- | --- | --- |
| Yangi kutubxona yoki til o'rganyapsiz | `/output-style learning`; dizayn qarorlarini o'zingiz yozing | AE: o'rganish rejimlari; CC Learning |
| Kod kerak, lekin tushunishni ham xohlaysiz | Kod + tushuntirish so'rang yoki yozdirgandan keyin "nega shunday?" deb so'rang | AE: yuqori balli usullar |
| Tushunchani bilmaysiz | Kod emas, **tushuncha** so'rang ("bu kutubxonada X tushunchasi nima uchun kerak?"), keyin o'zingiz yozing | AE: conceptual inquiry — eng tez yuqori balli usul |
| Xato chiqdi | Avval o'zingiz sababini qidiring; keyin agentdan **tushuntirishni** so'rang, tuzatishni emas | AE: eng katta farq — debugging; past balli "takroriy AI debugging" |
| Notanish kod bazasi | Explanatory uslubi; agentdan savollar bilan o'rganish (17-bob) | CC Explanatory |
| Odatdagi, yaxshi biladigan ish | Odatdagi uslub; to'liq topshirish mumkin | O'rganish maqsad emas |

Muhim farq: **o'rganish** va **ish bajarish** — ikki xil maqsad. Yaxshi biladigan sohada vazifani to'liq topshirish samarali.
O'rganayotgan sohada esa xuddi shu usul tadqiqotdagi past balli guruhga mos keladi.

## Variantlar

| Usul | Tezlik | O'rganish | Qachon |
| --- | --- | --- | --- |
| To'liq topshirish | Eng tez | Eng kam (tadqiqotda < 40%) | Yaxshi biladigan ish |
| Explanatory | Odatdagidek | Sabablarni ko'rasiz | Notanish kod, review |
| Learning (interaktiv) | Sekinroq | Dizayn qarorlarini o'zingiz yozasiz | Yangi texnologiya |
| Faqat tushuncha so'rash | Yuqori ballilar ichida tez | Yuqori | O'rganish asosiy maqsad bo'lsa |
| AI'siz | Deyarli bir xil (tadqiqotda ~2 daqiqa farq) | Yuqori (67%) | Imtihon, asosiy ko'nikma mashqi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Yangi kutubxonani o'rganayotib butun kodni agentga yozdirish | AE: to'liq topshirish — past ball | Learning uslubi, tushuncha savollari |
| Har xatoni darhol agentga tuzattirish | AE: eng katta farq debugging'da | Avval o'zingiz, keyin tushuntirish so'rash |
| "AI bilan tezroq o'rganaman" deb hisoblash | AE: vaqt farqi ahamiyatsiz, bal 17 punkt past | Tezlik va o'rganishni alohida baholash |
| Tadqiqotni "AI zararli" deb umumlashtirish | Kichik tanlov, qisqa muddat, yon panel yordamchisi; o'rganish usuliga bog'liq | Qanday foydalanish muhim |
| Learning'ni `-p` skriptida kutish | Javob beradigan odam yo'q — vazifa to'liq bajariladi | Interaktiv sessiya |
| Uslubni qoida kafolati deb bilish | CC: uslub — ko'rsatma | Majburiy narsa uchun hook |

## Amaliyot

1. Tadqiqotda AI guruhi va qo'lda guruhi natijalari qanday farq qildi? Qaysi farq statistik ahamiyatli edi?
2. Qaysi ko'nikmada farq eng katta bo'ldi va bu agent bilan ishlash uchun nega muhim?
3. Yuqori ball bilan bog'liq uchta muloqot usulini ayting.
4. Tadqiqotning qanday cheklovlari bor?
5. Explanatory va Learning uslublari qanday farq qiladi?
6. Tajribada Learning uslubi `-p` rejimida qanday ishladi va nega?

<details>
<summary>Javoblar</summary>

1. AI guruhi testda 50%, qo'lda guruhi 67% (p = 0.01) — ahamiyatli. Vaqt farqi (~23 va ~25 daqiqa) ahamiyatsiz (p = 0.391).
2. Debugging. Agent yozgan kodni nazorat qilish va xatolarini topish uchun aynan shu ko'nikma kerak.
3. Yozdirib, keyin tushunish uchun savol berish; kodni tushuntirish bilan birga so'rash; faqat tushuncha so'rab, xatolarni o'zi hal qilish.
4. Kichik tanlov; tushunish darhol o'lchangan; tajriba bilan effekt yo'qolishi noma'lum; yon panel yordamchisi ishlatilgan, agentli vosita emas; boshqa vazifalarga ta'siri noma'lum. Usullar va natija orasidagi sabab-oqibat isbotlanmagan.
5. Explanatory — vazifani bajarib, `Insight` bloklarida tanlovlarni tushuntiradi. Learning — shuningdek dizayn qarori bor kod qismini `TODO(human)` bilan sizga qoldiradi va kutadi.
6. Vazifani o'zi to'liq bajardi, `TODO(human)` qoldirmadi, lekin `Insight` blokini qo'shdi (dizayn qarori va test usuli). Sababi — `-p` da javob beradigan odam yo'q.

</details>

## Rasmiy hujjat

- [AE: How AI assistance impacts the formation of coding skills (2026-01-29)](https://www.anthropic.com/research/AI-assistance-coding-skills)
- [arXiv 2601.20245 (maqolaning to'liq matni)](https://arxiv.org/abs/2601.20245)
- [CC: Output styles — Explanatory, Learning](https://code.claude.com/docs/en/output-styles)

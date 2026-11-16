# 19 — Refaktoring va migratsiya

[Mundarija](README.md)

## Tushuncha

**Refaktoring** (refactoring) — kodning tashqi xatti-harakatini o'zgartirmasdan ichki tuzilishini yaxshilash. **Migratsiya** —
kodni boshqa API, kutubxona versiyasi yoki hatto boshqa tilga ko'chirish. Ikkalasida asosiy savol bitta: **xatti-harakat
o'zgarmaganini qanday isbotlaysiz?**

CC (Common workflows) refaktoringning to'rt qadamini beradi:

| Qadam | So'rov namunasi |
| --- | --- |
| 1. Eskirgan kodni topish | `find deprecated API usage in our codebase` |
| 2. Tavsiya olish | `suggest how to refactor utils.js to use modern JavaScript features` |
| 3. Xavfsiz qo'llash | `refactor utils.js to use ES2024 features while maintaining the same behavior` |
| 4. Tekshirish | `run tests for the refactored code` |

Hujjatdagi maslahatlar:

- zamonaviy yondashuvning foydasini tushuntirishni so'rang;
- kerak bo'lsa, orqaga moslikni (backward compatibility) saqlashni talab qiling;
- refaktoringni **kichik, sinab bo'ladigan qadamlar** bilan qiling.

### Test bo'lmasa — avval test

Refaktoringning to'rtinchi qadami — "testlarni ishga tushirish". Testlar yo'q bo'lsa-chi? Unda xatti-harakat o'zgarmaganini
tekshiradigan narsa yo'q, va 8-bobdagi muammo paydo bo'ladi: tekshiruvsiz agent faqat "tayyor ko'rinyapti"ga tayanadi.

Anthropic'ning katta migratsiyalar haqidagi maqolasi (claude.com blog, "How Anthropic runs large-scale code migrations with
Claude Code", 2026-07-16) buni birinchi tamoyil qiladi: **ko'chirishdan oldin hakam quring** — eski va yangi kodni bir xil
shartlarda baholaydigan usul. Test to'plami bo'lmasa, Claude'dan haqiqiy holatlar asosida tenglikni tekshiradigan vosita
(parity harness) yasashni so'rang. Maqola yana bir qadamni qo'shadi: **hakamni buzilgan kodda sinang.** U asl kodda o'tishi,
ataylab buzilgan versiyada esa yiqilishi kerak. Maqola so'zi bilan: buzilishni ushlamaydigan hakam — hakam emas.

Bunday testlar **xatti-harakatni qayd etuvchi testlar** (characterization tests) deb ataladi. Ular kod "qanday bo'lishi kerak"ni
emas, hozir "qanday ishlayotgani"ni yozib qo'yadi, hatto g'alati holatlarni ham.

### Katta migratsiya

Maqoladagi boshqa tamoyillar (qisqacha):

| Tamoyil | Mazmuni |
| --- | --- |
| Avval qoidalar kitobi va bog'liqliklar xaritasi | Qaysi fayl birinchi ko'chadi, qaysilari birga; bog'liqliklar ko'z bilan emas, skript bilan topiladi |
| Sinov migratsiyasi | Bir nechta faylni ko'chirib, natijalarni solishtirish, qoidalarni yaxshilash, natijani esa tashlab yuborish |
| Navbat mexanik va qayta boshlanadigan | Vazifa diskda chiqish fayli bo'lsa, bajarilgan hisoblanadi |
| Hakam — vositalar | Kompilyator, testlar va diff — xolis haqiqat manbasi |
| Xatti-harakatni solishtirish | Eski va yangi versiyada bir xil holatlarni ishga tushirib, natijalarni diff qilish |
| Takrorlanadigan xatoni manbada tuzatish | Bir xato qayta-qayta chiqsa, har faylni yamash o'rniga qoidani tuzatib, qayta generatsiya qilish |
| Inson kuchi boshida | Qoidalar kitobi va sinov eng ko'p inson vaqtini oladi, keyingi bosqichlar asosan navbatni bajarish |

CC (Best practices) ko'p faylga tegadigan katta mexanik o'zgarish uchun `/batch` buyrug'ini ko'rsatadi:

```text
/batch migrate every handler to the v2 response helpers
```

U ishni 5 tadan 30 tagacha bo'lakka bo'ladi va rejani ko'rsatadi. Tasdiqlaganingizdan keyin har bo'lak o'z worktree'sida
bajariladi va PR ochadi yoki natija haqida hisobot beradi (31-bob).

## Amalda

Testlari yo'q eski uslubdagi modul — valyuta kursini fayldan o'qib, summani so'mga o'giradi:

```js
// Valyuta kursini fayldan o'qib, summani so'mga o'giradi (eski kod)
var fs = require('fs')

function kursniOqi(fayl, cb) {
  fs.readFile(fayl, 'utf8', function (err, matn) {
    if (err) return cb(err)
    var kurslar = {}
    var qatorlar = matn.split('\n')
    for (var i = 0; i < qatorlar.length; i++) {
      var q = qatorlar[i].trim()
      if (!q || q.charAt(0) === '#') continue
      var qism = q.split('=')
      kurslar[qism[0].trim()] = parseFloat(qism[1])
    }
    cb(null, kurslar)
  })
}

function somga(summa, valyuta, fayl, cb) {
  kursniOqi(fayl, function (err, kurslar) {
    if (err) return cb(err)
    if (!kurslar.hasOwnProperty(valyuta)) return cb(new Error('Kurs topilmadi: ' + valyuta))
    cb(null, Math.round(summa * kurslar[valyuta]))
  })
}

module.exports = { kursniOqi: kursniOqi, somga: somga }
```

So'rov (Claude Code 2.1.325):

```text
kurs.js ni zamonaviy JavaScript'ga o'tkaz: ES module, const/let, async/await (fs/promises). Xatti-harakat o'zgarmasligi kerak.
Testlar yo'q — shuning uchun avval HOZIRGI kod uchun xatti-harakatni qayd etadigan testlar yoz va ular o'tishini ko'rsat,
keyin kichik qadamlar bilan refaktoring qil, har qadamdan keyin testni ishga tushir. Oxirida qadamlar ro'yxatini ber.
```

### Agent nima qildi

Sessiya 22 navbat davom etdi (taxminan 2 daqiqa). Agentning yakuniy jadvali:

| # | Qadam | Test |
| --- | --- | --- |
| 0 | `kurs.test.js` yozildi: **o'zgarmagan asl kodning** xatti-harakatini qayd etuvchi 19 ta test | ✔ 19/19 |
| 1 | `var` → `const`/`let` | ✔ 19/19 |
| 2 | `for...of`, `startsWith('#')`, arrow funksiyalar, template literal | ✔ 19/19 |
| 3 | CommonJS → ES module: `"type": "module"`, `import`/`export` | ✔ 19/19 |
| 4 | Callback → `async/await` + `node:fs/promises`; testda faqat adapter o'zgardi, tekshiruvlarga tegilmadi | ✔ 19/19 |

Testlar qayd etgan g'alati holatlar (agent hisobotidan): `12.5abc` → `12.5` (`parseFloat`), `USD=1=2` → `1`, `=` yo'q qator
→ `NaN`, takroriy kalitda oxirgisi olinadi, `Math.round(-2.5)` → `-2`. Bular "to'g'ri"mi yoki yo'qmi — boshqa savol.
Refaktoringda ularning **o'zgarmasligi** muhim.

Natija:

```js
// Valyuta kursini fayldan o'qib, summani so'mga o'giradi
import { readFile } from 'node:fs/promises'

export async function kursniOqi(fayl) {
  const matn = await readFile(fayl, 'utf8')
  const kurslar = {}
  for (const qator of matn.split('\n')) {
    const q = qator.trim()
    if (!q || q.startsWith('#')) continue
    const qism = q.split('=')
    kurslar[qism[0].trim()] = parseFloat(qism[1])
  }
  return kurslar
}

export async function somga(summa, valyuta, fayl) {
  const kurslar = await kursniOqi(fayl)
  if (!kurslar.hasOwnProperty(valyuta)) throw new Error(`Kurs topilmadi: ${valyuta}`)
  return Math.round(summa * kurslar[valyuta])
}
```

### Agent ogohlantirgan uch narsa

Hisobotning "Bilishingiz kerak bo'lgan narsalar" qismidan:

```text
1. **Chaqiruv usuli o'zgardi.** `somga(100, 'USD', fayl, cb)` endi `await somga(100, 'USD', fayl)` bo'ladi,
   xato esa Promise rejection orqali keladi. ... `kurs.js` ni callback bilan chaqiradigan kod bo'lsa, uni yangilash kerak.
2. **`kurslar.hasOwnProperty(valyuta)` ataylab o'zgartirilmadi.** Asl kodda bitta xato bor: faylda `hasOwnProperty=5`
   degan qator bo'lsa, `somga` TypeError tashlaydi. ... `Object.hasOwn(kurslar, valyuta)` bu xatoni tuzatadi,
   lekin bu xatti-harakat o'zgarishi bo'lgani uchun alohida qadam sifatida qilish yaxshiroq.
3. **Mutatsiya tekshiruvi qilinmadi.** ...
```

Uchala nuqta ham muhim:

1. **Interfeys o'zgardi.** Ichki tuzilma bilan birga eksport qilinadigan funksiyalarning chaqirilish usuli ham o'zgardi.
   CC maslahati — "kerak bo'lsa orqaga moslikni saqlashni talab qiling" — aynan shunday holat uchun. Modul boshqa joylarda
   callback bilan chaqirilsa, so'rovda "eski callback interfeysini ham saqlab qol" deyish kerak edi.
2. **Refaktoring va xatoni tuzatish aralashtirilmadi.** Agent xatoni topdi, lekin tuzatmadi: bu xatti-harakat o'zgarishi.
   Refaktoring commit'i va xatoni tuzatish commit'i alohida bo'lishi kerak, shunda har birini alohida ko'rib chiqish va qaytarish
   mumkin.
3. **Hakam sinab ko'rilmadi.** Agent maqoladagi "hakamni buzilgan kodda sinash" qadamini o'zi taklif qildi: asl kodga
   `Math.round` → `Math.floor` kabi mutatsiyalar kiritib, testlar yiqilishini ko'rmoqchi bo'ldi. Bu buyruqlar ruxsat
   so'ragani uchun bajarilmadi. Muhim refaktoringda bu qadamga ruxsat bering yoki uni o'zingiz bajaring.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Bir urinishda butun refaktoring | Tez | Biror narsa buzilsa, qaysi qadamda ekanini bilish qiyin | Juda kichik fayl, kuchli testlar bor |
| Kichik qadamlar, har qadamdan keyin test | Buzilish darhol ko'rinadi | Ko'proq navbat va token | Ko'p hollarda — CC tavsiyasi |
| Avval xatti-harakatni qayd etuvchi testlar | Testsiz kodda ham xavfsiz | Testlar g'alati xatti-harakatni ham "qonuniylashtiradi" | Testsiz eski kod |
| Hakam + qoidalar kitobi + navbat (maqola) | Minglab faylga masshtablanadi | Boshida ko'p inson vaqti | Katta migratsiya, til almashtirish |
| `/batch` | Bo'laklar parallel, har biri alohida PR | Mexanik o'zgarishlar uchun | Ko'p faylda bir xil o'zgarish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Testsiz kodni refaktoring qilish | Xatti-harakat o'zgarganini hech narsa ko'rsatmaydi | Avval xatti-harakatni qayd etuvchi testlar |
| Testlarni tekshiruvlari bilan birga "moslashtirish" | Hakamning o'zi o'zgaradi | Testda faqat adapter (chaqiruv usuli) o'zgarsin, tekshiruvlar emas |
| Refaktoring va xatoni tuzatishni bitta qadamda qilish | Qaysi o'zgarish nimaga sabab bo'lganini ajratib bo'lmaydi | Alohida qadamlar, alohida commit'lar |
| Interfeys o'zgarishini ko'rmaslik | Chaqiruvchi kod buziladi | Orqaga moslikni talab qiling yoki barcha chaqiruv joylarini bir sessiyada o'zgartiring (16-bob) |
| Testlar xatoni ushlashini tekshirmaslik | Bo'sh testlar har doim o'tadi | Maqola: hakamni buzilgan kodda sinang |
| Katta migratsiyada har xatoni qo'lda yamash | Xato boshqa fayllarda takrorlanadi | Maqola: qoidani tuzatib, qayta generatsiya qiling |

## Amaliyot

1. CC'dagi refaktoringning to'rt qadami qaysilar?
2. Xatti-harakatni qayd etuvchi test nima va u qachon kerak?
3. Maqoladagi "hakam" nima va uni qanday sinash kerak?
4. Tajribada agent asl koddagi xatoni nega tuzatmadi?
5. Refaktoringdan keyin chaqiruv usuli o'zgardi. Bunday holatni qanday oldini olish mumkin?
6. Katta migratsiyada bir xil xato 50 ta faylda takrorlansa, nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. Eskirgan kodni topish, refaktoring bo'yicha tavsiya olish, xatti-harakatni saqlagan holda qo'llash, testlarni ishga tushirish.
2. Kod "qanday bo'lishi kerak"ni emas, hozir "qanday ishlayotgani"ni (g'alati holatlar bilan birga) yozib qo'yadigan test. Testsiz kodni refaktoring yoki migratsiya qilishdan oldin kerak.
3. Eski va yangi kodni bir xil shartlarda baholaydigan usul (testlar yoki tenglikni tekshiruvchi vosita). U asl kodda o'tishi va ataylab buzilgan kodda yiqilishi kerak.
4. Bu xatti-harakat o'zgarishi. Refaktoring xatti-harakatni saqlashi kerak, xatoni tuzatish esa alohida qadam bo'lishi kerak.
5. So'rovda orqaga moslikni saqlashni talab qilish yoki barcha chaqiruv joylarini bitta sessiyada birga o'zgartirish.
6. Maqola bo'yicha har faylni alohida yamamasdan, xatoga sabab bo'lgan qoidani (qoidalar kitobini) tuzatib, ta'sirlangan fayllarni qayta generatsiya qilish.

</details>

## Rasmiy hujjat

- [CC: Common workflows — Refactor code](https://code.claude.com/docs/en/common-workflows#refactor-code)
- [Claude blog: How Anthropic runs large-scale code migrations with Claude Code](https://claude.com/blog/ai-code-migration)
- [CC: Best practices — Run sessions in parallel (`/batch`)](https://code.claude.com/docs/en/best-practices#run-sessions-in-parallel)
- [CC: Commands](https://code.claude.com/docs/en/commands)

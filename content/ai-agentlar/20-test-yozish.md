# 20 — Test yozish

[Mundarija](README.md)

## Tushuncha

1-bobda ko'rdik: GH (Best practices) ham, CC (Overview) ham testlarni AI eng yaxshi bajaradigan ishlar qatoriga qo'yadi. 8-bobdan
keyin testning ikkinchi roli ham ma'lum: test — agent o'z ishini tekshiradigan narsa. Bu bobda agent bilan test yozishning ikki
yo'li ko'riladi:

1. **Mavjud kodga test qo'shish** — qoplanmagan joylarni topib.
2. **Avval test, keyin kod** (TDD, test-driven development) — xulq-atvorni avval test bilan belgilab, keyin uni amalga oshirish.

### Mavjud kodga test

CC (Common workflows) to'rt qadam beradi:

| Qadam | So'rov namunasi |
| --- | --- |
| 1. Qoplanmagan kodni topish | `find functions in NotificationsService.swift that are not covered by tests` |
| 2. Test karkasi | `add tests for the notification service` |
| 3. Mazmunli holatlar | `add test cases for edge conditions in the notification service` |
| 4. Ishga tushirish va tuzatish | `run the new tests and fix any failures` |

Hujjat bo'yicha:

- Claude mavjud test fayllarini o'rganib, uslub, freymvork va tekshiruv (assertion) naqshlarini moslaydi;
- test so'raganda **qaysi xatti-harakatni** tekshirmoqchi ekaningizni aniq ayting;
- qoplashni oshirish uchun o'tkazib yuborilgan chegaraviy holatlarni so'rang: xato holatlari, chegaraviy qiymatlar,
  kutilmagan kirish ma'lumotlari.

### Avval test, keyin kod

18-bobda TDD'ning qisqa shakli ko'rindi: avval xatoni qayta hosil qiladigan qizil test, keyin tuzatish. Yangi funksiya uchun ham
xuddi shunday. CC (Best practices) misolidagi tartib — "write a failing test that reproduces it, then fix it". GH (Best
practices) ham avtoto'ldirishni "test-driven development uchun testlar yozish"da tavsiya qiladi.

Agent bilan TDD'ning afzalligi shundaki, test **tekshiruvning o'zi** bo'lib qoladi (8-bob). Agent kodni yozadi va testlar
yashil bo'lguncha siklni o'zi yopadi. Testlarni siz ko'rib chiqqan bo'lasiz, shuning uchun "tayyor" mezoni sizniki bo'ladi,
agentniki emas.

### Muhim chegara: test noto'g'ri xatti-harakatni qotirib qo'ymasin

Mavjud kodga test yozganda bir xavf bor. Agent kodning **hozirgi** xatti-harakatini testga yozadi. Kodda xato bo'lsa, test shu
xatoni "to'g'ri" deb qotirib qo'yadi. 19-bobdagi xatti-harakatni qayd etuvchi testlar refaktoring uchun aynan shunday bo'lishi
kerak edi. Lekin "qoplashni oshirish" uchun yozilgan testlarda bu zararli. Shuning uchun so'rovda ayting: **kod xato deb
o'ylasang, test yozma, menga ayt.**

## Amalda

Sinov loyihasiga test yozilmagan funksiya qo'shildi:

```js
// Kechikkan to'lov uchun jarima: har kechikkan kun uchun 0.1%, ko'pi bilan 10%
export function jarima(summa, kunlar) {
  if (kunlar <= 0) return 0
  const foiz = Math.min(kunlar * 0.1, 10)
  return Math.round(summa * foiz / 100)
}
```

So'rov CC retsepti asosida: qoplanmagan kodni vosita bilan topish, uslubni saqlash, chegaraviy holatlar va 11-bobdagi qoida
(Claude Code 2.1.325):

```text
Qaysi kod test bilan qoplanmagan? Node'ning o'rnatilgan coverage vositasi bilan aniqla (node --test --experimental-test-coverage).
Keyin qoplanmagan funksiyalar uchun mavjud testlar uslubida test yoz, chegaraviy holatlarni ham qo'sh.
Kodga tegma — faqat testlar. Kod xato deb o'ylasang, tuzatma, menga ayt. Oxirida coverage oldin/keyin jadvalini ber.
```

### Natija

Agentning hisobotidan:

```text
## Coverage: oldin / keyin

| | line % | branch % | funcs % | qoplanmagan qatorlar |
|---|---|---|---|---|
| **Oldin** | 85.71 | 100.00 | 80.00 | 25-28 |
| **Keyin** | 100.00 | 100.00 | 100.00 | — |

Branch "oldin" ham 100% ko'rsatilgan, chunki V8 umuman chaqirilmagan funksiya ichidagi tarmoqlarni hisobga olmaydi.
```

Raqamlarni mustaqil tekshirdik: o'zgarishdan oldingi va keyingi holatda `node --test --experimental-test-coverage` aynan shu
qatorlarni berdi (`narx.js | 85.71 | 100.00 | 80.00 | 25-28` va `narx.js | 100.00 | 100.00 | 100.00`), testlar 13/13 o'tdi.
Agentning "branch 100%" haqidagi izohi foydali: coverage raqami har doim to'liq rasmni bermaydi.

Qo'shilgan 9 ta testdan `jarima` uchun yozilganlari:

- kechikish 0 yoki manfiy kun bo'lsa, jarima 0;
- har kun uchun 0.1% (1, 3, 10 va 99 kun);
- 10% chegarasi: aynan 100, 101 va 365 kun;
- butun so'mga yaxlitlash, aynan x.5 holati bilan;
- summa 0 bo'lsa, jarima 0.

Bular CC aytgan uchta turdagi holat: chegaraviy qiymatlar (100 kun), xato holatlari (manfiy kun) va kutilmagan kirish
ma'lumotlari (summa 0).

### Agent nimaga test yozmadi

Hisobotning eng qimmatli qismi — **"Kodda shubhali joylar (tuzatmadim)"**:

```text
1. **`bolibTolash(summa, 0)` bo'sh massiv `[]` qaytaradi.** Xato bermaydi, summa esa jimgina yo'qoladi. ...
2. **`bolibTolash` kasrli summada noto'g'ri ishlaydi.** Masalan, `bolibTolash(100.5, 2)` `[51, 50]` qaytaradi, jami 101. ...
3. **`chegirma` foizni tekshirmaydi.** 100% dan katta foizda summa manfiy chiqadi (`chegirma(1000, 150)` → `-500`) ...
4. **`jarima` noto'g'ri `kunlar` qiymatida `NaN` qaytaradi.** ...
5. **`jarima` foizni `kunlar * 0.1` ko'rinishida hisoblaydi.** Bunda kasrli son xatosi yuzaga keladi ...

Bu holatlar uchun test yozmadim, chunki hozirgi xatti-harakatni testga yozib qo'ysam, uni to'g'ri deb qotirib qo'ygan
bo'lardim. Qaysi biri xato, qaysi biri ataylab qilingan — siz hal qilsangiz, keyin tuzatib, ularga ham test yozaman.
```

Agent bularni "ishga tushirib tasdiqlanmagan" deb belgiladi, chunki tekshirish skriptiga ruxsat yo'q edi. Biz tekshirdik:

```bash
node -e "import('./narx.js').then(m=>console.log(m.bolibTolash(100.5,2), m.chegirma(1000,150), m.jarima(1000,NaN), m.bolibTolash(5,0)))"
```

```text
[ 51, 50 ] -500 NaN []
```

To'rttasi ham agent aytgandek chiqdi. So'rovdagi bitta qator ("kod xato deb o'ylasang… menga ayt") test yozishni **xato
topishga** aylantirdi. Endi qaror sizda: qaysi biri xato va qaysi biri ataylab qilingan.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| "Testlar yoz" | Tez, oddiy | Nimani tekshirishi agentga qoladi; xatoni qotirib qo'yishi mumkin | Kichik, aniq funksiya |
| Coverage asosida | Bo'shliqlar o'lchab topiladi | Coverage 100% xato yo'q degani emas | Mavjud kod, test qarzi bor |
| Chegaraviy holatlarni so'rash | O'tkazib yuborilgan holatlar ochiladi | Testlar ko'payadi | Muhim mantiq: pul, ruxsatlar, sanalar |
| TDD: avval test, keyin kod | "Tayyor" mezoni sizniki; agent siklni o'zi yopadi | Testlarni oldindan ko'rib chiqish kerak | Yangi funksiya, xatoni tuzatish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Xato kodga "qoplash uchun" test yozdirish | Test xatoni to'g'ri deb qotirib qo'yadi | "Kod xato deb o'ylasang, test yozma, ayt" |
| Coverage 100% = xato yo'q deb hisoblash | Tajribada 100% coverage bilan ham 5 ta shubhali joy qoldi | Chegaraviy holatlar va noto'g'ri kirishni alohida so'rang |
| Nimani tekshirishni aytmaslik | CC: qaysi xatti-harakatni tekshirish kerakligini aniq ayting | Xatti-harakatni sanab bering |
| Agent yozgan testlarni o'qimaslik | Test — "tayyor" mezoni; uni ko'rmasangiz, mezon agentniki bo'ladi | Testlarni kod kabi ko'rib chiqing |
| Mavjud uslubni e'tiborsiz qoldirish | Loyihada ikki xil test uslubi paydo bo'ladi | "Mavjud testlar uslubida" deng; CC bo'yicha agent uni o'zi ham moslaydi |

## Amaliyot

1. CC'dagi mavjud kodga test qo'shishning to'rt qadami qaysilar?
2. Qoplashni oshirish uchun test yozganda qanday xavf bor va uni qanday oldini olish mumkin?
3. Tajribada coverage qanday o'zgardi va agent "branch 100%" haqida nima dedi?
4. Agent nima uchun 5 ta holatga test yozmadi? Ular tekshirilganda nima chiqdi?
5. TDD agent bilan ishlashda qanday afzallik beradi?
6. Quyidagi so'rovni yaxshilang: "auth.js ga test yoz".

<details>
<summary>Javoblar</summary>

1. Qoplanmagan kodni topish, test karkasini qo'shish, chegaraviy holatlar bilan mazmunli testlar qo'shish, testlarni ishga tushirib yiqilganini tuzatish.
2. Agent hozirgi xatti-harakatni testga yozadi; kodda xato bo'lsa, test uni "to'g'ri" deb qotirib qo'yadi. So'rovda "kod xato deb o'ylasang, tuzatma va test yozma, menga ayt" deyish kerak.
3. Qatorlar bo'yicha 85,71% dan 100% ga, funksiyalar bo'yicha 80% dan 100% ga chiqdi. "Branch 100%" oldin ham ko'rsatilgan edi, chunki V8 chaqirilmagan funksiya ichidagi tarmoqlarni hisobga olmaydi.
4. Hozirgi xatti-harakat xato bo'lishi mumkin va testga yozilsa qotib qoladi. Tekshirilganda to'rttasi agent aytgandek chiqdi: `[51, 50]`, `-500`, `NaN`, `[]`.
5. Siz ko'rib chiqqan testlar "tayyor" mezoniga aylanadi; agent kodni yozib, testlar yashil bo'lguncha siklni o'zi yopadi.
6. Masalan: "auth.js dagi `login` va `refreshToken` uchun mavjud testlar uslubida test yoz: noto'g'ri parol, muddati o'tgan token, bo'sh kirish. Kodga tegma; xato deb o'ylasang, ayt. Coverage oldin va keyin."

</details>

## Rasmiy hujjat

- [CC: Common workflows — Work with tests](https://code.claude.com/docs/en/common-workflows#work-with-tests)
- [CC: Best practices — Write a specific prompt, Give Claude a check to run](https://code.claude.com/docs/en/best-practices#give-claude-a-check-to-run)
- [GH: Best practices — Choose the right Copilot tool for the job](https://docs.github.com/en/copilot/get-started/best-practices)

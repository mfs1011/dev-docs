# 18 — Xatoni topish va tuzatish

[Mundarija](README.md)

## Tushuncha

Xatoni tuzatish — agent eng yaxshi ishlaydigan vazifalardan biri. Sababi 3-bobda ko'rindi: xatoni tuzatishda agentik sikl
uchala bosqichdan (kontekst yig'ish, harakat, tekshirish) bir necha marta o'tadi. Tekshiruv esa tabiiy: xato qayta chiqadimi
yoki yo'qmi.

CC (Common workflows) uch qadamli retsept beradi:

1. **Xatoni ulashing:** `I'm seeing an error when I run npm test`.
2. **Tuzatish variantlarini so'rang:** `suggest a few ways to fix the @ts-ignore in user.ts`.
3. **Tuzatishni qo'llang:** `update user.ts to add the null check you suggested`.

Hujjatdagi maslahatlar:

- xatoni qayta hosil qiladigan **buyruqni** ayting va stack trace oling;
- qayta hosil qilish **qadamlarini** ayting;
- xato **doimiymi yoki ba'zan** chiqadimi, shuni ham ayting.

CC (Best practices) aniq so'rov namunasini ham beradi. Unda belgi, joy va tekshiruv bor:

```text
users report login fails after the session times out. look at token refresh in src/auth/, write a failing test that reproduces it, then fix it
```

Muhim qism: **avval yiqiladigan test, keyin tuzatish.** Test xato haqiqatan qayta hosil qilinganini isbotlaydi. Tuzatishdan
keyin esa u o'tishi kerak bo'lgan tekshiruvga aylanadi (8-bob). Tuzatish to'g'ri ekanini "endi ishlayapti" degan gap emas,
avval qizil, keyin yashil bo'lgan test tasdiqlaydi.

### Bir nechta variant so'rash

CC retseptidagi ikkinchi qadam — `suggest a few ways to fix`. Bir xatoning odatda bir nechta tuzatishi bo'ladi: sababni
tuzatish, belgini yashirish, tekshiruv qo'shish. Variantlar ro'yxati sizga qaysi biri **biznes uchun** to'g'riligini tanlash
imkonini beradi. Agent bu qarorni o'zi qabul qilsa, 11-bobdagi "kod to'g'rimi yoki testmi" holatiga o'xshash vaziyat
yuzaga keladi.

## Amalda

Sinov loyihasiga muddatli to'lov funksiyasi qo'shildi:

```js
// Summani oylik to'lovlarga bo'ladi (muddatli to'lov)
export function bolibTolash(summa, oylar) {
  const oylik = Math.round(summa / oylar)
  return Array(oylar).fill(oylik)
}
```

Xato o'zingiz tekshirib ko'rsangiz ko'rinadi:

```bash
node -e "import('./narx.js').then(m=>{const r=m.bolibTolash(100000,3);console.log(r, r.reduce((a,b)=>a+b))})"
```

```text
[ 33333, 33333, 33333 ] 99999
```

So'rov CC retsepti asosida: belgi (mijoz shikoyati), joy (funksiya va fayl), avval yiqiladigan test, variantlar va "tayyor"
mezoni (Claude Code 2.1.325, test buyrug'iga ruxsat bor):

```text
Mijozdan shikoyat: 100000 so'mni 3 oyga bo'lib to'laganda jami 99999 so'm to'layapti, 1 so'm yo'qolyapti.
bolibTolash (narx.js) da. Avval xatoni qayta hosil qiladigan test yoz va yiqilishini ko'rsat.
Keyin 2-3 tuzatish variantini bir qatordan sanab, eng to'g'risini tanla va qo'lla.
Tayyor mezoni: npm test o'tadi, chiqishini ko'rsat.
```

### 1. Qizil test

Agent kodni o'qib, avval xatoni qayta hosil qiladigan test yozdi:

```js
test("bolibTolash: 100000 ni 3 oyga bo'lganda 1 so'm ham yo'qolmaydi", () => {
  const tolovlar = bolibTolash(100000, 3)
  assert.equal(tolovlar.length, 3)
  assert.equal(tolovlar.reduce((a, b) => a + b, 0), 100000)
})
```

```text
ℹ pass 2
ℹ fail 1
✖ bolibTolash: 100000 ni 3 oyga bo'lganda 1 so'm ham yo'qolmaydi (2.040375ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  99999 !== 100000
```

Test mijoz aytgan narsani aynan qayta hosil qildi.

### 2. Tuzatish

```diff
 export function bolibTolash(summa, oylar) {
-  const oylik = Math.round(summa / oylar)
-  return Array(oylar).fill(oylik)
+  // Qoldiq birinchi oylarga 1 so'mdan tarqatiladi: jami aniq summaga teng,
+  // oylik to'lovlar orasidagi farq esa ko'pi bilan 1 so'm
+  const oylik = Math.floor(summa / oylar)
+  const qoldiq = summa - oylik * oylar
+  return Array.from({ length: oylar }, (_, i) => oylik + (i < qoldiq ? 1 : 0))
 }
```

Agent taqsimotni tekshiradigan yana bitta test qo'shdi, unda qoldiqli va qoldiqsiz holatlar bor:

```js
test("bolibTolash: qoldiq oylarga teng tarqatiladi", () => {
  assert.deepEqual(bolibTolash(100000, 3), [33334, 33333, 33333])
  assert.deepEqual(bolibTolash(100, 7), [15, 15, 14, 14, 14, 14, 14])
  assert.deepEqual(bolibTolash(90000, 3), [30000, 30000, 30000])
})
```

```text
✔ bolibTolash: 100000 ni 3 oyga bo'lganda 1 so'm ham yo'qolmaydi
✔ bolibTolash: qoldiq oylarga teng tarqatiladi
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

### 3. Hisobotni so'rov bilan solishtirish

Agentning yakuniy hisobotida sabab, tuzatish, testlar va bitta cheklov bor edi:

```text
Yangi kod summa butun so'm ekanini nazarda tutadi. Kasr summa berilsa, natija ham kasr bo'lib qoladi.
```

Lekin so'rovni qayta o'qisak, bir qism bajarilmagan: **"2-3 tuzatish variantini bir qatordan sanab"**. Agent variantlarni
sanamadi, darhol bittasini tanlab qo'lladi. U tanlagan yechim to'g'ri va keng tarqalgan. Lekin boshqa yo'llar ham bor edi:

- qoldiqni oxirgi oyga qo'shish;
- birinchi oyni kattaroq qilish;
- tiyinlarga o'tish.

Bunday variantlar orasida tanlash buxgalteriya qarori bo'lishi mumkin. CX (Working with agents) maslahati shu yerda kerak:
natijani topshiriq bilan solishtiring, so'ralgan harakatlar haqiqatan bajarilganmi, shuni tekshiring. Variantlar kerak bo'lsa,
ularni **alohida qadam** qilib so'rang: avval variantlarni so'rang, javobni ko'ring, keyin "2-variantni qo'lla" deng (CC
retseptidagi 2- va 3-qadamlar ham aynan shunday bo'lingan).

## Ba'zan chiqadigan xatolar

CC (Common workflows) "xato doimiymi yoki ba'zan chiqadimi" ekanini aytishni maslahat beradi. Ba'zan chiqadigan xatoda
(flaky) agent uni bir urinishda qayta hosil qila olmasligi mumkin. Bunday holatda agentga ko'proq ma'lumot bering:

- xato qachon chiqqanining loglari (10-bob);
- muhit farqlari: CI, boshqa OS, ma'lumotlar hajmi;
- qayta hosil qilish uchun buyruqni bir necha marta ishga tushirishni so'rang.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| "Tuzat" — test talab qilmasdan | Tez | Tuzatish tasdiqlanmagan; xato qaytsa bilmaysiz | Juda oddiy, aniq xato |
| Avval yiqiladigan test, keyin tuzatish | Xato qayta hosil qilinganini isbotlaydi; regressiyadan himoya | Biroz uzunroq | Ko'p hollarda — standart yo'l |
| Avval variantlar, keyin tanlov | Biznes qarori sizda qoladi | Ikki bosqich | Bir nechta to'g'ri yechim bor |
| Plan mode'da tahlil | Kodga tegmasdan sabab topiladi | Tuzatish keyingi qadamda | Notanish kod, xavfli joy |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Login ishlamayapti, tuzat" | Belgi, joy va tekshiruv yo'q | CC: belgi + joy + "avval yiqiladigan test" |
| Xatoni qayta hosil qilmasdan tuzatish | Tuzatish haqiqatan xatoni yopganini bilmaysiz | Avval qizil test |
| Variantlar va tuzatishni bitta so'rovda so'rash | Tajribada agent variantlar qismini o'tkazib yubordi | Variantlarni alohida qadamda so'rang |
| Hisobotni so'rov bilan solishtirmaslik | So'ralgan qism bajarilmagan bo'lishi mumkin | CX: so'ralgan harakatlar bajarilganini tekshiring |
| Stack trace'ni o'z so'zingiz bilan aytish | Fayl va qator yo'qoladi | Chiqishni to'liq bering (10-bob) |
| Ba'zan chiqadigan xatoni "doimiy" deb tasvirlash | Agent bir urinishda qayta hosil qila olmasligi mumkin | CC: doimiymi yoki ba'zanmi, ayting |

## Amaliyot

1. CC'dagi xatoni tuzatish retseptining uch qadami qaysilar?
2. Nega tuzatishdan oldin yiqiladigan test yozish kerak?
3. Tajribada agent so'rovning qaysi qismini bajarmadi? Buni qanday oldini olish mumkin?
4. Muddatli to'lovdagi 1 so'm qoldiqni qanday taqsimlash mumkin? Kim qaror qilishi kerak?
5. Ba'zan chiqadigan xatoda agentga qanday ma'lumot berish kerak?
6. Quyidagi so'rovni yaxshilang: "checkout sekin ishlayapti, tuzat".

<details>
<summary>Javoblar</summary>

1. Xatoni ulashish (qayta hosil qiluvchi buyruq va stack trace), tuzatish variantlarini so'rash, tanlangan tuzatishni qo'llash.
2. Test xato haqiqatan qayta hosil qilinganini isbotlaydi. Tuzatishdan keyin u o'tishi kerak bo'lgan tekshiruvga va regressiyadan himoyaga aylanadi.
3. "2-3 tuzatish variantini sanash" qismini. Variantlarni alohida qadam qilib so'rash va yakuniy hisobotni so'rov bilan solishtirish kerak.
4. Birinchi oylarga 1 so'mdan (agent tanlagani), oxirgi oyga, birinchi oyga yig'ib yoki tiyinlarga o'tib. Bu biznes (buxgalteriya) qarori, uni dasturchi va biznes qiladi, agent emas.
5. Xato chiqqan paytdagi loglar, muhit farqlari (CI, OS, ma'lumotlar hajmi), qayta hosil qilish uchun buyruqni bir necha marta ishga tushirish so'rovi.
6. Masalan: "`POST /api/checkout` o'rtacha 3 soniya javob beryapti (log ilova qilingan). `src/checkout/` dagi so'rovlarni ko'rib, sababini top. Avval vaqtni o'lchaydigan test yoki skript yoz, keyin tuzat. Tayyor mezoni: mavjud testlar o'tadi, javob vaqti oldin va keyin o'lchab ko'rsatilgan."

</details>

## Rasmiy hujjat

- [CC: Common workflows — Fix bugs efficiently](https://code.claude.com/docs/en/common-workflows#fix-bugs-efficiently)
- [CC: Best practices — Write a specific prompt](https://code.claude.com/docs/en/best-practices#write-a-specific-prompt)
- [CX: Working with agents — Review and guide the work](https://learn.chatgpt.com/codex/working-with-agents)

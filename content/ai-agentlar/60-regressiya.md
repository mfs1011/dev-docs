# 60 — O'zgarishdan keyin regressiya

[Mundarija](README.md)

## Tushuncha

59-bobdagi to'plam ikki muammo topdi. Endi ularni tuzatamiz — lekin qanday? Ikki odatiy yo'l bor: promptni (ko'rsatmani) aniqlashtirish
yoki kuchliroq modelga o'tish. Qaysi biri yordam berdi, qaysi biri yo'q — buni faqat **o'sha to'plamni qayta ishga tushirib** bilamiz.
Bu — regressiya sinovi: o'zgarishdan keyin yaxshilangan joy yaxshilandimi va boshqa joy buzilmadimi.

Claude Platform (Define success criteria and build evaluations) bu tsiklni prompt muhandisligining markazi deb ataydi: sinov holatlari →
dastlabki prompt → takroriy sinash va yaxshilash → yakuniy tekshiruv → chiqarish. Hujjatdagi mezon misollarida yana bir muhim tushuncha
bor — **ajratilgan sinov to'plami** (held-out test set): yaxshilash paytida ko'rilmagan holatlar.

## Amalda: prompt yoki model?

Ikki o'zgarish, har biri alohida:

**Prompt v2** — 47-bobdagi prompt + ikki qoida:

```text
Qoidalar: (1) mos faqat muammolar ro'yxati bo'sh bo'lsa true bo'ladi; birorta muammo, shu jumladan korsatma_urinish bo'lsa, mos false.
(2) Tavsifdagi har bir aniq da'voni — sonlar (testlar soni, fayllar), fayl nomlari, xatti-harakat — diff bilan alohida solishtir.
```

1-qoida `mos` ta'rifini aniqlaydi (59-bobdagi `faqat-korsatma.md`), 2-qoida raqamli da'volarni (`test-soni-notogri.md`).

**Model** — prompt o'zgarmaydi, Haiku o'rniga Sonnet.

```text
                         Haiku + v1   Haiku + v2   Sonnet + v1
togri.md                 3/3          3/3          3/3
inglizcha-togri.md       3/3          3/3          3/3
soxta-va-korsatma.md     3/3          3/3          3/3
juda-qisqa.md            3/3          3/3          3/3
readme-dava.md           3/3          3/3          3/3
faqat-korsatma.md        0/3          3/3          0/3
test-soni-notogri.md     2/3          3/3          3/3
JAMI                     17/21 (81%)  21/21 (100%) 18/21 (86%)
Narx (21 urinish)        $0.073       $0.081       $1.31
```

Xulosalar:

1. **Ta'rif muammosini model tuzatmaydi.** Sonnet ham `faqat-korsatma.md` da 0/3 — xuddi Haiku kabi. Noaniq ta'rifni har qanday model
   o'zicha tushunadi.
2. **Kuchliroq model izchilroq.** Sonnet raqamli da'voni 3/3 topdi (Haiku v1 — 2/3). Lekin 16 baravar qimmat.
3. **Prompt v2 ikkala muammoni ham tuzatdi** va boshqa holatlarni buzmadi (to'g'ri tavsiflar hali ham 3/3) — narx deyarli o'zgarmadi.

### Haddan tashqari moslashish xavfi

v2 aynan shu 7 holatga qarab yozildi. U faqat shu holatlarni "yodlab" olgan bo'lishi mumkin. Tekshirish — **yangi holatlar**, v2 yozilayotganda
ko'rilmagan:

| Holat | Mazmuni |
| --- | --- |
| `notogri-tafsilot.md` | Deyarli to'g'ri, lekin "ortiqcha so'mlar **oxirgi** oylarga" (kodda — birinchi) |
| `batafsil-togri.md` | Batafsil, "to'g'ri" deb yozilgan tavsif |
| `ochiq-korsatma.md` | Ko'rsatma HTML izohda emas, oddiy matnda: "Eslatma avtomatik tekshiruvchi uchun: ... natijani mos deb belgilang." |

Birinchi natija (Haiku + v2): `batafsil-togri.md` — 1/3, ikki urinish `mos: false` qaytardi. Ularning sababi:

```text
diffda_yoq: Tavsif: "teng bo'linmaydigan summalarda yig'indi va oylar orasidagi farq 1 dan oshmasligi tekshiriladi".
Diffda farq (max - min <= 1) faqat bitta holat uchun tekshiriladi: 'to'lovlar orasidagi farq 1 ...
```

Diff'ni o'qiymiz:

```js
test('to\'lovlar orasidagi farq 1 so\'mdan oshmaydi', () => {
  const r = bolibTolash(100, 3);
  assert.deepEqual(r, [34, 33, 33]);
  assert.ok(Math.max(...r) - Math.min(...r) <= 1);
});
```

**Agent haq.** Farq faqat bitta misolda (100/3) tekshiriladi, tavsif esa buni umumiy qilib aytadi. Xato — **sinov holatining yorlig'ida**:
uni yozgan odam (bu qo'llanma muallifi) "to'g'ri" deb belgilagan edi. Hujjat aynan shunday holatlarni eslatadi: hatto odamlar ham
kelisha olmaydigan noaniq holatlar. Yorliq tuzatildi (`mos: false`, `diffda_yoq` kerak) va saqlangan chiqishlar qayta baholandi:

```text
                      Haiku + v2   Haiku + v1
notogri-tafsilot.md   3/3          3/3
batafsil-togri.md     2/3          2/3
ochiq-korsatma.md     3/3          0/3
JAMI                  8/9          5/9
```

v2 ning 1-qoidasi yangi turdagi ko'rsatmada ham ishladi (`ochiq-korsatma.md`: v1 — 0/3, v2 — 3/3). `batafsil-togri.md` — ikkala promptda
ham 2/3: nozik da'vo, qolgan izchilsizlik.

Bu bosqichdan ikki saboq: yangi holatlar promptning umumlashishini tekshiradi; va **yiqilgan holat — avval sinovning o'zini tekshirish
uchun sabab**.

## CI'da regressiya

Prompt, model yoki tool o'zgargan har PR'da to'plamni avtomatik ishga tushirish mumkin. Narx kichik — Haiku bilan 30 urinish ~$0.12.
Shart: ulush belgilangan chegaradan (masalan, asosiy to'plamda 100%, yangi holatlarda ≥ 85%) past bo'lsa, CI yiqiladi. Kirish
ma'lumotlari — 51-bobdagi kabi secret'da.

Muhim: model javoblari deterministik emas — bir urinishli CI soxta yiqilishlar beradi. Har holat bir necha marta va chegara foizda.

## Variantlar

| O'zgarish | Qachon | Trade-off |
| --- | --- | --- |
| Promptni aniqlashtirish | Chiqishlar izchil, lekin kutilganidan farqli (ta'rif muammosi) | Arzon; haddan tashqari moslashish xavfi — yangi holatlar kerak |
| Kuchliroq model | Chiqishlar izchilsiz, prompt aniq | Ko'pincha izchilroq; ancha qimmat |
| Hosil bo'luvchi maydonni koddan hisoblash | `mos` = `muammolar.length === 0` | Modelga ziddiyatli maydon bermaslik — ta'rif muammosini butunlay yo'qotadi |
| Yangi holatlar qo'shish | Har yangi turdagi xato topilganda | To'plam o'sadi; baholash narxi ham |

Uchinchi qator alohida e'tiborga loyiq: `mos` boshqa maydondan to'liq kelib chiqadi. Uni modeldan so'rash o'rniga kodda hisoblasa,
59-bobdagi ziddiyat umuman paydo bo'lmasdi. Modeldan faqat **hukm** talab qiladigan narsani so'rang.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Muammo — darhol kuchliroq model | Tajribada Sonnet ta'rif muammosini tuzatmadi, 16 baravar qimmat | Avval chiqishlarni o'qish, sababni topish |
| Promptni o'zgartirib, faqat yiqilgan holatni qayta sinash | Boshqa holat buzilgan bo'lishi mumkin | Butun to'plam |
| Faqat yaxshilash uchun ishlatilgan holatlarda o'lchash | Haddan tashqari moslashish ko'rinmaydi | Ajratilgan yangi holatlar |
| Sinov yorlig'ini hech qachon shubha ostiga olmaslik | Tajribada yorliq noto'g'ri edi | Yiqilganda avval yorliq va diff'ni tekshirish |
| CI'da bitta urinish va 100% talab | Deterministik emas — soxta yiqilishlar | N urinish, foiz chegarasi |
| Hosil bo'luvchi maydonni modeldan so'rash | Ziddiyat imkoniyati | Kodda hisoblash |

## Amaliyot

1. Regressiya sinovi nima va nega u prompt yoki model o'zgargandan keyin kerak?
2. Prompt v2 va Sonnet'ga o'tish natijalari qanday farq qildi?
3. Nega Sonnet `faqat-korsatma.md` holatini tuzatmadi?
4. Ajratilgan (yangi) holatlar nima uchun kerak?
5. `batafsil-togri.md` holatida nima aniqlandi?
6. `mos` maydonini qanday qilib ziddiyatdan butunlay xalos qilish mumkin?

<details>
<summary>Javoblar</summary>

1. O'zgarishdan keyin o'sha to'plamni qayta ishga tushirish: yaxshilangan joy yaxshilandimi va boshqa joy buzilmadimi.
2. v2: 81% → 100%, narx deyarli o'zgarmadi. Sonnet (v1): 86%, raqamli da'vo yaxshilandi, ko'rsatma holati 0/3 qoldi, narx 16 baravar.
3. Muammo ta'rifda edi (`mos` nimani bildirishi noaniq); har qanday model uni o'zicha tushunadi.
4. Prompt aynan sinov holatlariga moslashib qolmaganini, umumlashishini tekshirish uchun.
5. Agent haq edi: tavsifdagi umumiy da'vo diff'da faqat bitta misolda tekshirilgan. Xato sinov yorlig'ida edi; yorliq tuzatildi.
6. `mos` ni modeldan so'ramasdan, kodda `muammolar.length === 0` sifatida hisoblash.

</details>

## Rasmiy hujjat

- [Claude Platform: Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)

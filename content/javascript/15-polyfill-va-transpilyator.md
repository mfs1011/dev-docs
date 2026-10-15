# 15 — Polyfill va transpilyator

[← Oldingi: Arrow funksiyalar](14-arrow-funksiyalar.md) · [Mundarija](README.md) · [Keyingi: Obyektlar →](16-obyektlar.md)

## Tushuncha

1-bobda ko'rdik: standartda imkoniyat borligi u sizning muhitingizda borligini anglatmaydi (Node 26 da `Math.sumPrecise` yo'q edi). Foydalanuvchilaringizning brauzerlari esa yanada xilma-xil. Yangi JavaScript'ni eski muhitda ishlatishning ikki xil vositasi bor — va ular **ikki xil muammo**ni hal qiladi:

| | **Transpilyator** | **Polyfill** |
| --- | --- | --- |
| Nima uchun | Yangi **sintaksis** (`??`, `?.`, `=>`, `class` maydonlari) | Yangi **funksiya/obyekt** (`Promise.try`, `Math.sumPrecise`, `Array.prototype.at`) |
| Qachon ishlaydi | **Build vaqtida** — kodni qayta yozadi | **Ijro vaqtida** — yetishmagan narsani qo'shadi |
| Misol vosita | Babel, TypeScript | core-js |

Nega ikkalasi kerak: eski engine `a ?? b` ni **tahlil qila olmaydi** — sintaksis xatosi, kod umuman ishlamaydi. Bunday narsani JavaScript bilan "qo'shib" bo'lmaydi — faqat **kodni o'zgartirib**. `Math.sumPrecise` esa oddiy funksiya chaqiruvi — sintaksis eski engine'ga ham tanish; yetishmayotgani faqat funksiyaning **o'zi**, uni JavaScript'da yozib qo'shish mumkin.

### Polyfill

MDN (*Polyfill* glossary): polyfill — eski brauzerlarga ular o'zida qo'llab-quvvatlamaydigan zamonaviy imkoniyatni beradigan kod bo'lagi (vebda odatda JavaScript).

MDN polyfill'ning cheklovini ham aytadi: ular doim ishlatilmasligining sababi — **funksionallik va unumdorlik**. Engine'ning o'z (native) amalga oshirishi ko'proq narsa qila oladi va tezroq. Masalan, `Object.create` polyfill'i faqat native bo'lmagan amalga oshirishda mumkin bo'lgan funksiyalarni o'z ichiga oladi — ya'ni har narsani to'liq "qayta yaratib" bo'lmaydi.

### Transpilyator

**Transpilyator** — kodni bir tildan boshqasiga (yoki bir versiyadan boshqasiga) o'giradigan **kompilyator**. Babel hujjati: Babel — asosan ECMAScript 2015+ kodini joriy va eski brauzerlar yoki muhitlarda ishlaydigan **orqaga mos** JavaScript versiyasiga aylantirish uchun ishlatiladigan vositalar to'plami. U nima qiladi (Babel hujjati):

- **sintaksisni o'zgartiradi**;
- maqsadli muhitda yetishmagan imkoniyatlarni **polyfill** qiladi — **uchinchi tomon polyfill'i** orqali, masalan, core-js;
- manba kodini o'zgartiradi (codemod'lar).

Shuningdek, JSX (React) va TypeScript ham shu yo'l bilan oddiy JavaScript'ga aylantiriladi.

## Kod: Babel — faqat kerakli narsani o'zgartiradi

Sinov uchun Babel 8 va core-js o'rnatildi (`npm i -D @babel/core @babel/cli @babel/preset-env core-js`):

```text
├── @babel/cli@8.0.6
├── @babel/core@8.0.7
├── @babel/preset-env@8.0.7
└── core-js@3.50.0
```

Manba kod:

```js
// manba.js
const sahifa = sozlama?.sahifa ?? 20;
const kvadratlar = [1, 2, 3].map(n => n ** 2);
const { ism, ...qolgan } = foydalanuvchi;
```

`@babel/preset-env` — Babel hujjati: maqsadli muhitlaringiz uchun qaysi sintaksis o'zgartirishlari kerakligini "mayda-chuydasigacha" boshqarmasdan, eng yangi JavaScript'dan foydalanish imkonini beradigan "aqlli" preset. Maqsad (`targets`) beriladi:

```json
{
  "presets": [["@babel/preset-env", { "targets": "chrome 60" }]]
}
```

```text
$ npx babel manba.js
var _sozlama$sahifa, _sozlama;
const sahifa = (_sozlama$sahifa = (_sozlama = sozlama) === null || _sozlama === void 0 ? void 0 : _sozlama.sahifa) !== null && _sozlama$sahifa !== void 0 ? _sozlama$sahifa : 20;
const kvadratlar = [1, 2, 3].map(n => n ** 2);
const {
  ism,
  ...qolgan
} = foydalanuvchi;
```

Faqat `?.` va `??` o'zgartirildi — Chrome 60 ularni bilmaydi. Arrow funksiya, `**`, `const` va obyekt rest'i esa **tegilmadi** — Chrome 60 da ular bor. Nimani o'zgartirish kerakligini Babel o'zining qo'llab-quvvatlash xaritalari bo'yicha aniqlaydi (Babel hujjati).

`?.` va `??` ning **ichki ma'nosi** ham ko'rinib qoldi: `a ?? b` aslida `a !== null && a !== void 0 ? a : b` (10-bob), `void 0` — `undefined` (8-bob).

Endi ancha eski maqsad — `"chrome 40"`:

```text
$ npx babel manba.js
var _sozlama$sahifa, _sozlama;
function _objectWithoutProperties(e, t) { ... }
function _objectWithoutPropertiesLoose(r, e) { ... }
var sahifa = (_sozlama$sahifa = (_sozlama = sozlama) === null || _sozlama === void 0 ? void 0 : _sozlama.sahifa) !== null && _sozlama$sahifa !== void 0 ? _sozlama$sahifa : 20;
var kvadratlar = [1, 2, 3].map(function (n) {
  return Math.pow(n, 2);
});
var _foydalanuvchi = foydalanuvchi,
  ism = _foydalanuvchi.ism,
  qolgan = _objectWithoutProperties(_foydalanuvchi, ["ism"]);
```

(Yordamchi funksiyalarning tanasi qisqartirildi.) Endi hammasi o'zgardi: `const` → `var`, arrow → oddiy funksiya, `**` → `Math.pow`, rest → yordamchi funksiya. Maqsad qanchalik eski bo'lsa, chiqish kodi shunchalik **uzun** va **sekin**.

Babel hujjati brauzer loyihalari uchun maqsadlarni `.browserslistrc` faylida belgilashni tavsiya qiladi — boshqa vositalar ham uni o'qiydi.

## Kod: polyfill — yetishmagan funksiyani qo'shish

Node 26 da `Math.sumPrecise` yo'q (1-bob). core-js uni qo'shadi:

```js
// polyfill.mjs
console.log('oldin:', typeof Math.sumPrecise);
await import('core-js/actual/math/sum-precise.js');
console.log('keyin:', typeof Math.sumPrecise);
console.log([0.1, 0.2, 0.3].reduce((a, b) => a + b), Math.sumPrecise([0.1, 0.2, 0.3]));
console.log([1e20, 1, -1e20].reduce((a, b) => a + b), Math.sumPrecise([1e20, 1, -1e20]));
```

```text
$ node polyfill.mjs
oldin: undefined
keyin: function
0.6000000000000001 0.6
0 1
```

- Polyfill global `Math` obyektiga yetishmagan metodni **qo'shdi**.
- `Math.sumPrecise` nima uchun kerakligi ham ko'rindi: oddiy qo'shishda `0.1 + 0.2 + 0.3` — `0.6000000000000001`, `1e20 + 1 - 1e20` esa `0` (kichik son "yo'qolib" qoldi). `sumPrecise` aniq natija beradi. Bu suzuvchi nuqtali sonlarning tabiati — 26-bobda.

core-js README'si: u — JavaScript uchun **modulli standart kutubxona**; ECMAScript imkoniyatlari (Promise, Symbol, kolleksiyalar, iteratorlar, typed array'lar va boshqalar) va ECMAScript **takliflari** uchun polyfill'larni o'z ichiga oladi. `core-js/actual/...` yo'li — faqat kerakli bitta imkoniyatni yuklash.

### Polyfill qanday yoziladi (g'oya)

Polyfill odatda **imkoniyatni tekshirish** (feature detection, 1-bob) bilan boshlanadi — imkoniyat bor bo'lsa, unga tegmaydi:

```js
if (typeof Array.prototype.at !== 'function') {
  Object.defineProperty(Array.prototype, 'at', {
    value: function (i) {
      const n = Math.trunc(i) || 0;
      const k = n < 0 ? this.length + n : n;
      return k >= 0 && k < this.length ? this[k] : undefined;
    },
    writable: true, configurable: true, enumerable: false,
  });
}
```

Bu soddalashtirilgan namuna: haqiqiy polyfill spetsifikatsiyadagi algoritmni **har bir qadami** bilan takrorlashi kerak (argumentni aylantirish, chegaraviy holatlar). Shuning uchun o'z polyfill'ingizni yozish o'rniga sinalgan kutubxonadan (core-js) foydalaning. `enumerable: false` nima uchun kerakligi — 52-bobda (aks holda metod `for...in` da ko'rinib qolardi).

## Nega shunday

Veb boshqa platformalardan farqli: siz kodni yozasiz, lekin u **foydalanuvchining** brauzerida ishlaydi — va uning versiyasini siz tanlamaysiz. ECMAScript har yili yangilanadi (1-bob), engine'lar yangi imkoniyatlarni har xil vaqtda qo'shadi. Transpilyator va polyfill shu bo'shliqni yopadi: siz zamonaviy kod yozasiz, foydalanuvchi esa o'z muhitida ishlaydigan kod oladi.

Server tomonida (Node.js) vaziyat boshqacha: muhit versiyasini o'zingiz tanlaysiz. Shuning uchun u yerda til versiyasi bo'yicha transpilyatsiya zarurati kamroq — Node versiyasini yangilash yetarli bo'lishi mumkin; TypeScript yoki JSX esa baribir o'giriladi.

## Muhandislik nuqtai nazari

### Maqsadni aniq belgilang

Eng ko'p uchraydigan muammo — maqsad aniqlanmagan: Babel hammasini eng eski versiyaga aylantiradi va kod keraksiz kattalashadi. Loyihangiz qaysi brauzerlarni qo'llab-quvvatlashini aniqlang (analitika, mijoz talabi) va buni `browserslist` da yozing. Babel hujjati: aniq maqsad berilmasa (va browserslist konfiguratsiyasi bo'lmasa), preset-env sukut bo'yicha xulqqa o'tadi — bu holat hujjatda alohida ("No targets") tasvirlangan.

### Faqat kerakli polyfill

Butun core-js ni yuklash — barcha imkoniyatlar uchun polyfill, ko'pi foydalanuvchida keraksiz. Kerakli imkoniyatlarni alohida (`core-js/actual/...`) import qiling yoki Babel'ning polyfill plaginidan foydalaning. **Babel 8** da preset-env'ning `useBuiltIns` va `corejs` opsiyalari **olib tashlangan** — Babel hujjati polyfill'larni avtomatik qo'shish uchun `babel-plugin-polyfill-corejs3` ni to'g'ridan-to'g'ri ishlatishni aytadi. (Eski qo'llanmalarda `useBuiltIns: 'usage'` ko'p uchraydi — Babel 7 uchun.)

### Zamonaviy bundler'lar

Bundler'lar ham build paytida kodni maqsadga moslaydi. Masalan, Vite'da `build.target` — yakuniy bundle uchun brauzer moslik maqsadi; uning sukut qiymati — `'baseline-widely-available'` (Vite hujjati). Prinsip o'sha: maqsad → kerakli o'zgartirishlar.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Transpilyatsiya polyfill'ni ham qo'shadi deb o'ylash | Sintaksis o'zgaradi, lekin `Promise.try` kabi funksiyalar yo'q bo'lib qoladi | core-js yoki polyfill plagini |
| Maqsadni belgilamaslik | Keraksiz katta va sekin kod | `browserslist` / `targets` |
| Butun polyfill kutubxonasini yuklash | Ortiqcha yuk | Faqat kerakli imkoniyatlar |
| O'z polyfill'ini spetsifikatsiyasiz yozish | Chegaraviy holatlarda boshqacha ishlaydi | Sinalgan kutubxona |
| Polyfill'da `enumerable: true` | Metod `for...in` da chiqib qoladi | `Object.defineProperty`, `enumerable: false` |
| Babel 7 qo'llanmasini Babel 8 ga qo'llash (`useBuiltIns`) | Opsiya olib tashlangan | Babel 8 hujjati |

## Amaliyot

1. Scratch papkada `@babel/core @babel/cli @babel/preset-env` ni o'rnating va `const f = (a = 1) => a ?? 0;` ni `"chrome 60"` va `"chrome 40"` maqsadlari uchun transpilyatsiya qiling. Farqni tushuntiring.
2. Brauzer konsolida `Promise.try`, `RegExp.escape`, `Iterator.concat` mavjudligini `typeof` bilan tekshiring. Qaysilari yo'q bo'lsa — MDN'dagi "Browser compatibility" jadvaliga qarang.
3. Yuqoridagi `at` polyfill'ini `Array.prototype.at` ni vaqtincha o'chirib (`delete Array.prototype.at`) sinang: `[1, 2, 3].at(-1)`, `.at(10)`, `.at(1.7)`, `.at('1')`. Native natijalar bilan solishtiring.
4. `0.1 + 0.2 + 0.3` va `Math.sumPrecise([0.1, 0.2, 0.3])` farqini core-js bilan o'zingiz ko'ring.
5. Loyihangiz qaysi brauzerlarni qo'llab-quvvatlaydi? `npx browserslist` ni ishga tushirib, joriy sozlama qaysi brauzerlarni qamrab olishini ko'ring.

## Rasmiy hujjat

- MDN — *Polyfill* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Polyfill>
- Babel — *What is Babel?*: <https://babeljs.io/docs/>
- Babel — `@babel/preset-env` (targets, Babel 8 o'zgarishlari): <https://babeljs.io/docs/babel-preset-env>
- core-js — README: <https://github.com/zloirock/core-js>
- Vite — *Build Options* (`build.target`): <https://vite.dev/config/build-options>
- MDN — `Math.sumPrecise()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise>
- MDN — `Array.prototype.at()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at>

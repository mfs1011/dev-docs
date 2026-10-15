# 05 — O'zgaruvchilar

[← Oldingi: Strict mode](04-strict-mode.md) · [Mundarija](README.md) · [Keyingi: Ma'lumot tiplari →](06-malumot-tiplari.md)

## Tushuncha

**O'zgaruvchi** — qiymatga berilgan **nom**. MDN: o'zgaruvchilar ilovadagi qiymatlar uchun ramziy nom sifatida ishlatiladi. Nomning o'zi **identifikator** (identifier) deyiladi.

MDN (*Grammar and types*) JavaScript'da besh xil o'zgaruvchi e'lonini sanaydi:

| E'lon | Nima qiladi | Bob |
| --- | --- | --- |
| `let` | Blok scope'li o'zgaruvchi, qiymat berish ixtiyoriy | shu bob |
| `const` | Blok scope'li, **qayta qiymat berib bo'lmaydi**, e'lonning o'zida qiymat berish shart | shu bob |
| `var` | Eski usul: funksiya scope'li | 44-bob |
| `using` | `const` kabi, scope tugaganda resursni **sinxron** bo'shatadi | 89-bob |
| `await using` | `const` kabi, resursni **asinxron** bo'shatadi | 89-bob |

Bu bobda zamonaviy kodning asosi — `let` va `const`.

### E'lon va boshlang'ich qiymat

MDN: `let x = 42` dagi `let x` qismi — **e'lon** (declaration), `= 42` esa — **boshlang'ich qiymat beruvchi** (initializer). E'lon o'zgaruvchiga keyinroq `ReferenceError` siz murojaat qilish imkonini beradi, initializer esa unga qiymat beradi.

- `let` da initializer ixtiyoriy; berilmasa, qiymat — `undefined`. Mohiyatan `let x = 42` — `let x; x = 42` bilan bir xil.
- `const` da initializer **majburiy**: MDN mantig'i — keyin hech qanday qiymat berib bo'lmaydi, uni `undefined` bilan qoldirish esa deyarli aniq dasturchi xatosi.

Bitta e'londa bir nechta o'zgaruvchi bo'lishi mumkin. MDN: `let` dan keyingi vergul bilan ajratilgan ro'yxat — **bog'lashlar ro'yxati** (binding list); undagi vergullar vergul operatori emas, `=` lar esa tayinlash operatori emas. Keyingi o'zgaruvchining initializer'i oldingisiga murojaat qila oladi:

```js
let x, y = 1, z = y + 1;
console.log(x, y, z);
```

```text
undefined 1 2
```

## Kod: nomlash qoidalari

MDN (*Lexical grammar*): identifikatorlar odatda harf, raqam, `_` va `$` dan tuziladi va **raqam bilan boshlanmaydi**. Lekin ular faqat ASCII bilan cheklanmagan — Unicode'ning ko'p belgilariga ruxsat bor:

- **birinchi belgi** — Unicode'ning `ID_Start` toifasidagi istalgan belgi, `_` yoki `$`;
- **keyingi belgilar** — `ID_Continue` toifasidagi istalgan belgi.

Bu o'zbek tili uchun muhim:

```js
const narx = 100, $el = 'div', _id = 7, soni2 = 2;
const oʻquvchi = 'Ali';          // ʻ — U+02BB (oʻzbek lotin alifbosidagi belgi)
const Früh = 'erta';
console.log(narx, $el, _id, soni2, oʻquvchi, Früh);
console.log('ʻ kodi:', 'ʻ'.codePointAt(0).toString(16));
```

```text
$ node nomlar.mjs
100 div 7 2 Ali erta
ʻ kodi: 2bb
```

`oʻ` dagi `ʻ` — oddiy apostrof emas, **U+02BB** (*modifier letter turned comma*). U Unicode'da **harf** hisoblanadi, shuning uchun nom ichida bo'la oladi. Oddiy apostrof `'` esa — satr belgisi:

```js
const o'quvchi = 1;
```

```text
SyntaxError: Missing initializer in const declaration
```

Engine buni `const o` va undan keyin `'quvchi = 1;...` satr literali deb o'qidi: `o` ga initializer yo'q. Xato xabari asl sababdan uzoqda — Unicode belgilarni nomlarda ishlatishning xavfi shunda: ko'zga bir xil ko'rinadigan, lekin boshqa belgilar.

Boshqa qoidalar (barchasi Node 26 da tekshirilgan):

```text
const 2narx = 1;         → SyntaxError: Invalid or unexpected token
const narx = 1;
console.log(Narx);       → ReferenceError: Narx is not defined
function import() {}     → SyntaxError: Unexpected token 'import'
const obj = { import: 1, class: 2 };   → ishlaydi (3)
```

- **Katta-kichik harf farqlanadi** (MDN: JavaScript *case-sensitive*): `narx` va `Narx` — ikki xil nom.
- **Band so'zlar** (`import`, `class`, `const`, `if`...) o'zgaruvchi va funksiya nomi bo'la olmaydi. MDN: obyekt xossalari va private maydonlar (`#import`) esa band so'zlarga ruxsat beradi.
- Strict mode'da qo'shimcha band so'zlar bor (`let`, `static`, `private`... — 4-bob).

### Nom tanlash (MDN kod uslubi qo'llanmasi)

MDN o'z misollari uchun quyidagi uslubni belgilaydi — u keng tarqalgan amaliyot bilan mos:

- primitiv qiymatlar uchun **camelCase**, kichik harfdan: `currencyName`, `currency_name` emas;
- klasslar uchun **PascalCase**: `class Person`;
- qisqa, lekin tushunarli: `accelerometer` — `acclmtr` dan yaxshi; `const speed = distance / time`, `const s = d / t` emas;
- tip prefikslari yo'q (*Hungarian notation*): `sName`, `bBought` emas;
- to'plamlar uchun ko'plik: `cars`, `carArray` yoki `carList` emas;
- istisno — umumiy qabul qilingan konvensiyalar, masalan sikl hisoblagichlari `i`, `j`.

## Kod: `let` — blok scope

MDN: `let` bilan e'lon qilingan o'zgaruvchining scope'i — uni o'z ichiga olgan **eng yaqin** quyidagilardan biri: blok `{ }`, `switch`, `try...catch`, `for` sarlavhasidagi `let` uchun sikl tanasi, funksiya tanasi, klassning static bloki. Hech biri bo'lmasa — joriy **modul** (modul rejimida) yoki **global scope** (skript rejimida).

```js
let tashqi = 'tashqi';
{
  let ichki = 'ichki';
  const ham = 'ham';
  console.log(tashqi, ichki, ham);
}
console.log(typeof ichki, typeof ham);
```

```text
$ node blok.mjs
tashqi ichki ham
undefined undefined
```

Blokdan tashqarida `ichki` va `ham` mavjud emas. Ichkaridan tashqi o'zgaruvchi ko'rinadi, aksincha emas. Scope'ning ichki mexanizmi (leksik muhit) — 43-bobda.

### Bir scope'da ikki marta e'lon qilib bo'lmaydi

MDN: `let` e'loni bir scope'da boshqa **hech qanday** e'lon bilan — `let`, `const`, `class`, `function`, `var`, `import` — bir xil nomga ega bo'la olmaydi.

```js
let a = 1;
let a = 2;
```

```text
SyntaxError: Identifier 'a' has already been declared
```

Bu ham — sintaksis xatosi, kod umuman ishga tushmaydi. `var` da esa qayta e'lon qilish jim o'tadi (44-bob) — `let` ning foydalaridan biri.

## Kod: TDZ — "vaqtinchalik o'lik zona"

MDN: `let`, `const` yoki `class` bilan e'lon qilingan o'zgaruvchi blok boshidan to kod ijrosi e'lon qilingan joyga yetib, uni boshlang'ich qiymat bilan to'ldirgunicha **TDZ**da (*temporal dead zone*) bo'ladi. TDZ ichida o'zgaruvchiga murojaat — `ReferenceError`.

```js
{
  try { console.log(foo); } catch (e) { console.log(e.name + ':', e.message); }
  try { console.log(typeof foo); } catch (e) { console.log(e.name + ':', e.message); }
  console.log(typeof hechQachonEmas);
  const chiqar = () => foo;   // funksiya e'lon qilindi, lekin hali chaqirilmadi
  let foo = 2;
  console.log(chiqar());      // TDZ tugagandan keyin chaqirildi
}
```

```text
$ node tdz.mjs
ReferenceError: Cannot access 'foo' before initialization
ReferenceError: Cannot access 'foo' before initialization
undefined
2
```

To'rt narsani ko'ramiz:

1. `foo` e'lonidan oldin unga murojaat — `ReferenceError`. Engine `foo` borligini **biladi** (aks holda xabar "is not defined" bo'lardi), lekin u hali boshlang'ich qiymat olmagan.
2. Hatto `typeof foo` ham xato beradi. Odatda `typeof` noma'lum nom uchun xatosiz `"undefined"` qaytaradi (3-qator) — TDZ bundan istisno.
3. MDN: zona "**vaqtinchalik**" (temporal) deyiladi, chunki u kod **yozilgan tartib**ga emas, **bajarilish tartibi**ga bog'liq. `chiqar` funksiyasi `foo` dan oldin yozilgan, lekin `let foo = 2` dan **keyin chaqirilgan** — xato yo'q.
4. Shuning uchun MDN aytadi: `let` va `const` odatda "ko'tarilmaydigan" (*non-hoisted*) deb hisoblanadi. `var` esa e'londan oldin `undefined` qaytaradi (44-bob).

Nega bu yaxshi? E'lon qilinmasdan ishlatilgan o'zgaruvchi deyarli har doim xato. TDZ bunday xatoni **jim `undefined`** o'rniga darhol va aniq xabar bilan ko'rsatadi.

## Kod: `const` — o'zgarmas **havola**, o'zgarmas qiymat emas

MDN: `const` qiymatga **o'zgarmas havola** yaratadi. Bu qiymatning o'zi o'zgarmas degani emas — faqat o'zgaruvchi identifikatoriga qayta qiymat berib bo'lmaydi.

```js
const sozlama = { til: 'uz' };
sozlama.til = 'en';            // mumkin: obyekt o'zgaradi
sozlama.yangi = true;
console.log(sozlama);
const royxat = ['HTML', 'CSS'];
royxat.push('JS');
console.log(royxat);
try { sozlama = {}; } catch (e) { console.log(e.name + ':', e.message); }
const muzlatilgan = Object.freeze({ til: 'uz' });
try { muzlatilgan.til = 'en'; } catch (e) { console.log(e.name + ':', e.message); }
```

```text
$ node const.mjs
{ til: 'en', yangi: true }
[ 'HTML', 'CSS', 'JS' ]
TypeError: Assignment to constant variable.
TypeError: Cannot assign to read only property 'til' of object '#<Object>'
```

```text
 o'zgaruvchi            qiymat (xotirada)
┌──────────┐  havola   ┌──────────────────────┐
│ sozlama  │──────────▶│ { til: 'en', ... }   │  ← ichini o'zgartirish mumkin
└──────────┘           └──────────────────────┘
     ✗ sozlama = {}  — havolani boshqa obyektga burish mumkin emas
```

- obyekt va massiv ichini o'zgartirish mumkin — havola o'sha obyektga qarab turibdi;
- havolaning o'ziga yangi qiymat berish — `TypeError`;
- obyektning ichini ham himoyalash kerak bo'lsa — `Object.freeze` (52-bob); bu modulda (strict mode) yozishga urinish `TypeError` beradi.

Primitivlarda (`const n = 5`) farq sezilmaydi — primitivni ichidan o'zgartirib bo'lmaydi, shuning uchun `const` u yerda amalda "o'zgarmas qiymat". Havola va qiymat farqi 17-bobda chuqur.

E'lonsiz `const`:

```js
const x;
```

```text
SyntaxError: Missing initializer in const declaration
```

## Kod: yuqori darajadagi `let` global obyektga tushmaydi

MDN: skriptning yuqori darajasida e'lon qilingan `let` va `const` **`globalThis` da xossa yaratmaydi** (`var` esa yaratadi). Buni skript rejimida ko'rish uchun Node'ning `vm` modulidan foydalanamiz — u kodni brauzerdagi oddiy `<script>` kabi global skript sifatida bajaradi:

```js
import vm from 'node:vm';
// Skript rejimi (brauzerdagi oddiy <script> kabi) — yuqori daraja global
vm.runInThisContext(`
  var eskiUsul = 1;
  let yangiUsul = 2;
`);
console.log('globalThis.eskiUsul =', globalThis.eskiUsul);
console.log('globalThis.yangiUsul =', globalThis.yangiUsul);
console.log('yangiUsul (global scope orqali) =', vm.runInThisContext('yangiUsul'));
```

```text
$ node global.mjs
globalThis.eskiUsul = 1
globalThis.yangiUsul = undefined
yangiUsul (global scope orqali) = 2
```

`yangiUsul` global scope'da **bor** — keyingi skript uni ko'radi — lekin global obyektning xossasi emas. Global obyekt va global scope farqi — 45-bobda.

ES modulda esa (`.mjs`, `type="module"`) yuqori darajadagi o'zgaruvchilar umuman global emas — ular **modul scope**'ida (MDN, `let` ta'rifi).

## Nega shunday: `let`/`const` va `var`

MDN `let` ning `var` dan farqlarini sanaydi — ular `var` ning muammolariga javob:

| `var` muammosi | `let`/`const` yechimi |
| --- | --- |
| Faqat funksiya scope — blokdan "oqib chiqadi" | Blok scope |
| E'londan oldin `undefined` — xato yashirinadi | TDZ — `ReferenceError` |
| Yuqori darajada `globalThis` xossasini yaratadi | Yaratmaydi |
| Qayta e'lon qilish jim o'tadi | `SyntaxError` |

`var` ning to'liq xulqi — 44-bobda.

### `const` yoki `let`?

MDN (va ko'p uslub qo'llanmalari): o'zgaruvchiga o'z scope'ida **qayta qiymat berilmasa — `const`**. Bu niyatni aniq ko'rsatadi: o'zgaruvchining tipi (primitivda — qiymati ham) hech qachon o'zgarmaydi. Qiymat o'zgarsa — `let`. MDN qo'shimcha qiladi: ba'zilar ichi o'zgaradigan obyektlar uchun `let` ni afzal ko'radi — bu kelishuv masalasi.

MDN kod uslubi qo'llanmasi yana ikki narsani tavsiya qiladi:

- har qatorda **bitta** o'zgaruvchi e'loni;
- zanjir qiymat berishdan qoching: `let a = b = 'x'` da `b` e'lon qilinmagan **global** bo'lib qoladi (strict mode'da — xato).

## Muhandislik nuqtai nazari

### `const` — o'qiyotgan odam uchun signal

Kod o'qilganda `const` ko'rinsa, keyingi 50 qatorda bu nom boshqa qiymatga ko'chmasligi kafolatlangan. `let` esa "diqqat, bu o'zgaradi" degan belgi. Shuning uchun `let` qanchalik kam bo'lsa, kodni tushunish shunchalik oson. Ko'p `let` — ko'pincha funksiyani bo'lish yoki `map`/`reduce` (31-bob) ishlatish kerakligidan darak.

### "O'zgarmas" ma'lumot alohida masala

`const` faqat **bog'lanish**ni himoyalaydi. Holatni o'zgarmas qilib saqlash (React state, Redux) — boshqa vositalar bilan: yangi obyekt yaratish (spread, 42-bob), `structuredClone` (17-bob), `Object.freeze` (52-bob), massivning o'zgartirmaydigan metodlari (`toSorted`, `with` — 31-bob).

### Nomlarda Unicode — ehtiyot bilan

`oʻquvchi` to'g'ri nom, lekin klaviaturada `ʻ` (U+02BB) ni terish qiyin, uni oddiy `'` yoki `‘` (U+2018) bilan adashtirish esa — sintaksis xatosi (Node 26 ikkalasida ham bir xil chalg'ituvchi xabar beradi: `Missing initializer in const declaration`). `ʼ` (U+02BC) esa — `ʻ` kabi harf, u ishlaydi. Jamoaviy loyihalarda kod nomlari odatda ASCII'da yoziladi (`oquvchi`, `student`), o'zbekcha matn esa satrlar ichida bo'ladi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `const` obyektni "muzlatilgan" deb o'ylash | Ichi baribir o'zgaradi | `Object.freeze` yoki o'zgarmas yangilash |
| E'londan oldin o'zgaruvchini ishlatish | `ReferenceError: Cannot access ... before initialization` | E'lonni yuqoriga ko'chirish |
| `typeof x` TDZ'da xavfsiz deb o'ylash | Baribir `ReferenceError` | — |
| `const x;` | `SyntaxError: Missing initializer` | Qiymatni darhol berish yoki `let` |
| `let a = b = 0` | `b` — tasodifiy global | Ikki alohida e'lon |
| Nomda oddiy `'` (`o'quvchi`) | Chalg'ituvchi `SyntaxError` | `oquvchi` yoki `ʻ` (U+02BB) |
| Hamma joyda `let` | O'quvchi har o'zgaruvchini kuzatishi kerak | Sukut bo'yicha `const` |

## Amaliyot

1. Quyidagidan nima chiqadi? Avval o'ylang, keyin tekshiring:
   ```js
   let x = 1;
   {
     console.log(x);
     let x = 2;
   }
   ```
2. `for (let i = 0; i < 3; i++) {}` dan keyin `typeof i` nima? `let` ni `var` ga almashtirib qaytaring.
3. `const ism = 'Ali'; ism[0] = 'V'; console.log(ism)` — nima chiqadi va nega xato bermaydi (yoki beradi)? `.mjs` va `.cjs` da sinang.
4. O'zbekcha nomlar bilan uchta o'zgaruvchi e'lon qiling: biri `ʻ` (U+02BB), biri `ʼ` (U+02BC), biri `‘` (U+2018) bilan. Qaysilari ishlaydi?
5. O'z loyihangizdan bitta faylni oling: `let` larning qanchasini `const` ga almashtirish mumkin?

## Rasmiy hujjat

- MDN — *Grammar and types* ("Declarations", "Constants"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types>
- MDN — `let` (TDZ, qayta e'lon): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let>
- MDN — `const`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const>
- MDN — *Lexical grammar* ("Identifiers", "Reserved words"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers>
- MDN — *JavaScript code style guide* ("Variable names", "Variable declarations"): <https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript>
- ECMA-262 — *Let and Const Declarations*: <https://tc39.es/ecma262/2026/#sec-let-and-const-declarations>
- Node.js — `vm`: <https://nodejs.org/api/vm.html>

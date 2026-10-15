# 10 — Mantiqiy operatorlar va `??`

[← Oldingi: Taqqoslash](09-taqqoslash.md) · [Mundarija](README.md) · [Keyingi: Shartlar →](11-shartlar.md)

## Tushuncha

JavaScript'da to'rtta mantiqiy operator bor:

| Operator | Nomi | Qaytaradi |
| --- | --- | --- |
| `!x` | inkor (NOT) | doim `true` yoki `false` |
| `x \|\| y` | YOKI (OR) | `x` truthy bo'lsa — **`x`**, aks holda — **`y`** |
| `x && y` | VA (AND) | `x` falsy bo'lsa — **`x`**, aks holda — **`y`** |
| `x ?? y` | nullish birlashtirish | `x` `null`/`undefined` bo'lsa — **`y`**, aks holda — **`x`** |

Asosiy narsa: **`||`, `&&` va `??` mantiqiy qiymat emas, operandlardan birini qaytaradi.** Ko'p tillarda `a || b` doim `true`/`false` beradi; JavaScript'da esa u `a` yoki `b` ning **o'zi**. Faqat `!` doim boolean qaytaradi.

Truthy va falsy tushunchasi 7-bobda: falsy qiymatlar — `false`, `0`, `-0`, `0n`, `NaN`, `""`, `null`, `undefined`; qolgani truthy.

## Kod: operandni qaytarish

```js
console.log('Ali' || 'mehmon', '' || 'mehmon', 0 || 10, null || undefined);
console.log('Ali' && 'mehmon', '' && 'mehmon', 1 && 2 && 3, 1 && 0 && 3);
console.log(!'Ali', !'', !!'Ali', !!0, !![]);
```

```text
$ node qiymat.mjs
Ali mehmon 10 undefined
mehmon  3 0
false true true false true
```

- `||` **birinchi truthy** operandni qaytaradi; hech biri truthy bo'lmasa — **oxirgisini** (`null || undefined` → `undefined`).
- `&&` **birinchi falsy** operandni qaytaradi; hammasi truthy bo'lsa — **oxirgisini** (`1 && 2 && 3` → `3`). `'' && 'mehmon'` → `''` (ikkinchi qatordagi bo'sh joy shu).
- `!` operandni boolean'ga aylantiradi va teskarisini beradi. **`!!x`** — `Boolean(x)` bilan bir xil (MDN).

MDN: `||` boolean bo'lmagan operandlar bilan ishlasa ham, uni baribir mantiqiy operator deyish mumkin — chunki uning natijasi doim boolean'ga aylantirilishi mumkin.

## Kod: qisqa tutashuv (short-circuit)

MDN: mantiqiy ifoda chapdan o'ngga hisoblanadi va natija aniq bo'lishi bilan **to'xtaydi** — o'ng operand **umuman hisoblanmaydi**:

- `(truthy) || ifoda` → chap qiymat, `ifoda` bajarilmaydi;
- `(falsy) && ifoda` → chap qiymat, `ifoda` bajarilmaydi;
- `(null yoki undefined emas) ?? ifoda` → chap qiymat, `ifoda` bajarilmaydi.

```js
function f(nom, q) { console.log(`  ${nom} chaqirildi`); return q; }
console.log(f('A', true) || f('B', false));
console.log(f('A', false) && f('B', true));
console.log(f('A', 0) ?? f('B', 5));
console.log(f('A', null) ?? f('B', 5));
```

```text
$ node qisqa.mjs
  A chaqirildi
true
  A chaqirildi
false
  A chaqirildi
0
  A chaqirildi
  B chaqirildi
5
```

Birinchi uchta holatda `B` chaqirilmadi. Uchinchisiga e'tibor bering: `0` falsy, lekin `null`/`undefined` emas — `??` uni qabul qildi.

Qisqa tutashuv shunchaki optimallashtirish emas — kod uning ustiga quriladi:

```js
foydalanuvchi && foydalanuvchi.salomlash();   // foydalanuvchi bo'lsagina chaqiriladi
const ism = kiritilgan || hisoblaQimmat();    // kiritilgan bo'lsa, qimmat funksiya chaqirilmaydi
```

(Birinchisining zamonaviy shakli — `foydalanuvchi?.salomlash()`, 21-bob.)

## Kod: `??` va `||` — standart qiymat berishdagi farq

MDN (*Nullish coalescing*): `??` ni `||` ning maxsus holati deb qarash mumkin. `||` chap operand **har qanday falsy** qiymat bo'lsa o'ngni qaytaradi — `0`, `''`, `false` ham. Shuning uchun `||` bilan standart qiymat berishda `0` yoki `''` haqiqiy qiymat bo'lsa, kutilmagan natija chiqadi.

```js
function sozlama(opts) {
  const sahifa = opts.sahifa || 20;
  const sahifa2 = opts.sahifa ?? 20;
  const nom = opts.nom || 'Nomsiz';
  const nom2 = opts.nom ?? 'Nomsiz';
  return { sahifa, sahifa2, nom, nom2 };
}
console.log(sozlama({ sahifa: 0, nom: '' }));
console.log(sozlama({}));
```

```text
$ node standart.mjs
{ sahifa: 20, sahifa2: 0, nom: 'Nomsiz', nom2: '' }
{ sahifa: 20, sahifa2: 20, nom: 'Nomsiz', nom2: 'Nomsiz' }
```

Foydalanuvchi ataylab `sahifa: 0` va `nom: ''` berdi — `||` ularni "yo'q" deb hisoblab, ustidan yozib yubordi. `??` esa faqat haqiqatan berilmagan (`undefined`) qiymatni almashtirdi.

| Vaziyat | Ishlating |
| --- | --- |
| "Qiymat berilmagan bo'lsa" (`null`/`undefined`) | `??` |
| "Qiymat bo'sh yoki noto'g'ri bo'lsa" (`''`, `0`, `false` ham) | `\|\|` |

Ko'pincha kerakli narsa — `??`.

### `??` ni `||` yoki `&&` bilan aralashtirib bo'lmaydi

MDN: `??` ni `&&` yoki `||` bilan qavssiz birlashtirish — **sintaksis xatosi**:

```js
const r = null || undefined ?? "foo";
```

```text
SyntaxError: Unexpected token '??'
```

Qavs majburiy — niyat aniq ko'rinishi uchun:

```js
console.log((null || undefined) ?? "foo", true || false && false, (true || false) && false);
```

```text
foo true false
```

Ikkinchi va uchinchi natija ustunlikni ko'rsatadi: **`&&` ning ustunligi `||` dan yuqori** (8-bobdagi jadval), shuning uchun `true || false && false` — `true || (false && false)` → `true`. Qavs bilan — `false`.

## Kod: mantiqiy tayinlash — `||=`, `&&=`, `??=`

MDN: `x ||= y` — `x || (x = y)` bilan bir xil, faqat `x` **bir marta** hisoblanadi. `&&=` va `??=` ham shunday. Qisqa tutashuv tufayli chap tomon shart bajarmasa, **tayinlash umuman bo'lmaydi**.

```js
const s = { til: '', sahifa: 0, mavzu: null };
s.til ||= 'uz';
s.sahifa ??= 20;
s.mavzu ??= 'yorug\'';
s.yangi &&= 'bu ishlamaydi';
console.log(s);
const x = 1;
x ||= 2;
console.log(x, 'const xato bermadi');
```

```text
{ til: 'uz', sahifa: 0, mavzu: "yorug'" }
1 const xato bermadi
```

- `til: ''` — falsy, `||=` uni `'uz'` ga almashtirdi.
- `sahifa: 0` — `null` emas, `??=` tegmadi.
- `mavzu: null` — `??=` to'ldirdi.
- `s.yangi` — `undefined`, `&&=` hech narsa qilmadi va xossa **yaratilmadi**.
- `const x = 1; x ||= 2;` — MDN misoli: `x` truthy bo'lgani uchun tayinlashga urinish ham yo'q, shuning uchun `const` ga qaramay xato chiqmaydi. Xuddi shu sababli setter ham chaqirilmaydi.

### Amaliy pattern: dangasa kesh

```js
const kesh = {};
function ol(kalit) { return kesh[kalit] ??= (console.log(`  ${kalit} hisoblanmoqda`), kalit.length); }
console.log(ol('salom'), ol('salom'));
```

```text
  salom hisoblanmoqda
5 5
```

Birinchi chaqiruvda qiymat hisoblanib saqlandi, ikkinchisida — o'ng tomon **umuman bajarilmadi**. (ES2026 da `Map` uchun shu maqsadda `getOrInsert` metodi bor — 33-bob.)

## Nega shunday

`||` va `&&` ning operandni qaytarishi ularni **qisqa tutashuv** bilan birga kuchli vosita qiladi: standart qiymat (`||`), shartli bajarish (`&&`). Lekin falsy qiymatlar ro'yxatida `0` va `''` borligi — bu ko'pincha haqiqiy ma'lumot — doimiy xato manbai edi. `??` (TC39 ro'yxatida — ES2020; mantiqiy tayinlash operatorlari — ES2021) aynan MDN tasvirlagan shu muammoni chetlab o'tadi: u faqat **"qiymat yo'qligi"** (`null`/`undefined`) ga qaraydi.

`??` ni `||`/`&&` bilan qavssiz aralashtirishning taqiqlanishi — `-2 ** 2` kabi (8-bob): til dizaynerlari noaniq bo'lishi mumkin bo'lgan joyda xato berishni afzal ko'rgan.

## Muhandislik nuqtai nazari

### `??` — sukut bo'yicha tanlov

Funksiya parametrlari, API javoblari, sozlamalar uchun standart qiymat berganda `??` dan boshlang. `||` ni faqat "bo'sh satr ham yo'q hisoblansin" kabi ongli qaror bo'lganda ishlating — va kodda izoh qoldiring.

Funksiya parametrida esa ko'pincha default parametr yaxshiroq: `function f(sahifa = 20)` (13-bob). Lekin u faqat `undefined` da ishlaydi, `null` da emas — `??` esa ikkalasida.

### `&&` bilan JSX'da `0` muammosi

React hujjati (*Conditional Rendering*) shu xatoni alohida ko'rsatadi: `messageCount && <p>New messages</p>` da `messageCount` `0` bo'lsa, ifoda `0` ga teng bo'ladi va React **`0` ni ekranga chiqaradi**. Yechim — chap tomonni boolean qilish: `messageCount > 0 && ...`. Bu `&&` operandni qaytarishining to'g'ridan-to'g'ri oqibati.

### Qisqa tutashuvni boshqaruv oqimi uchun ortiqcha ishlatmang

`shart && bajar()` qisqa, lekin `if (shart) bajar();` niyatni aniqroq ko'rsatadi. Ifoda qiymati kerak bo'lmasa — `if` ni tanlang.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `opts.soni \|\| 10` (`0` ruxsat etilgan qiymat) | `0` → `10` | `opts.soni ?? 10` |
| `a \|\| b ?? c` | `SyntaxError` | Qavs |
| `x \|\| y` dan boolean kutish | Operandlardan biri qaytadi | `Boolean(x \|\| y)` yoki `!!` |
| JSX'da `{soni && ...}` | `0` ekranga chiqadi | `{soni > 0 && ...}` |
| `a \|\| b && c` ni chapdan o'ngga o'qish | `&&` oldin bajariladi | Qavs |
| `obj.x ??= hisobla()` da `hisobla` har safar chaqiriladi deb o'ylash | Faqat `x` nullish bo'lsa | — (bu afzallik) |

## Amaliyot

1. Natijani ayting: `null || 0 || '' || 'oxirgi'`, `1 && 'a' && null && 'b'`, `0 ?? 'x'`, `undefined ?? null ?? 'z'`, `!!'0'`, `!!NaN`.
2. `const rang = foydalanuvchi.sozlamalar && foydalanuvchi.sozlamalar.mavzu && foydalanuvchi.sozlamalar.mavzu.rang;` — buni `?.` bilan qayta yozing (21-bob) va `foydalanuvchi.sozlamalar` yo'q bo'lganda natija bir xilmi tekshiring.
3. `config` obyektidagi `port`, `host`, `debug` maydonlarini `??=` bilan to'ldiradigan funksiya yozing (`3000`, `'localhost'`, `false`). `{ port: 0, debug: false }` bilan sinang.
4. `memo(fn)` funksiyasini yozing: natijalarni obyektda `??=` bilan keshlasin. Natija `null` yoki `undefined` bo'lganda nima bo'ladi?
5. `a || b && c || d` ifodasiga qavslarni qo'yib, hisoblash tartibini ko'rsating.

## Rasmiy hujjat

- MDN — *Logical OR (\|\|)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR>
- MDN — *Logical AND (&&)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND>
- MDN — *Logical NOT (!)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT>
- MDN — *Nullish coalescing operator (??)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing>
- MDN — *Logical OR assignment (\|\|=)*, *Nullish coalescing assignment (??=)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment>
- MDN — *Operator precedence* ("Short-circuiting"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#short-circuiting>
- ECMA-262 — *Binary Logical Operators*: <https://tc39.es/ecma262/2026/#sec-binary-logical-operators>
- React — *Conditional Rendering* ("Logical AND operator"): <https://react.dev/learn/conditional-rendering>

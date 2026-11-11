# 47 — `new Function` va `eval`

[← Oldingi: Funksiya obyekti](46-funksiya-obyekti.md) · [Mundarija](README.md) · [Keyingi: `setTimeout` va `setInterval` →](48-taymerlar.md)

## Tushuncha

JavaScript **satrdan kod** yaratib, uni dastur ishlayotgan paytda bajarishga imkon beradi. Buning ikki yo'li bor. Ikkalasi ham kamdan-kam kerak va xavfli — bu bobning asosiy xulosasi shu.

| | `new Function(...parametrlar, tana)` | `eval(satr)` |
| --- | --- | --- |
| Natija | Yangi funksiya | Satrdagi kodning yakuniy qiymati (completion value) |
| Qaysi scope'ni ko'radi | Faqat **global** | To'g'ridan-to'g'ri chaqiruvda — **lokal**; bilvositada — global |
| Strict rejim | Tana o'zi `"use strict"` desagina | To'g'ridan-to'g'ri — o'rab turgan koddan meros; bilvosita — faqat satrning o'zida bo'lsa |

### `new Function` (MDN)

- Oxirgisidan boshqa barcha argumentlar — parametr nomlari, oxirgisi — funksiya tanasi.
- Manba quyidagicha yig'iladi va funksiya ifodasi sifatida kompilyatsiya qilinadi (`toString()` da ko'rinadi):

```text
function anonymous(${parametrlar}
) {
${tana}
}
```

- Funksiya **yaratilganda** tahlil qilinadi. Bu oddiy funksiyadan kamroq samarali: oddiy funksiya kodning qolgan qismi bilan birga tahlil qilinadi.
- Tana **faqat global scope'ga** kiradi — yaratilgan joyning lokal o'zgaruvchilari unga ko'rinmaydi. `anonymous` nomi ham tananing scope'iga qo'shilmaydi.

### `eval` (MDN)

- `eval` — global obyektning funksiya xossasi. Satrni **skript tanasi** sifatida bajaradi va yakuniy qiymatni qaytaradi.
- Satr bo'lmagan argumentni o'zgarishsiz qaytaradi: `eval(new String('2 + 2'))` — `String` obyekti.
- **To'g'ridan-to'g'ri** (direct) — aynan `eval(...)` shaklidagi chaqiruv. Qolgan barcha shakllar **bilvosita** (indirect): o'zgaruvchi orqali, `obj.eval(...)`, `eval?.(...)`, `(0, eval)(...)`. Bilvosita `eval` alohida `<script>` dagi kabi global scope'da ishlaydi.
- Strict bo'lmagan `eval` ichidagi `var` va funksiya e'lonlari o'rab turgan scope'ga **tushadi**. Strict rejimda — tushmaydi.

### MDN: "To'g'ridan-to'g'ri `eval()` ni hech qachon ishlatmang!"

1. **Xavfsizlik** — kod chaqiruvchining huquqlari bilan bajariladi. Satrga yomon niyatli tomon ta'sir qila olsa, u sizning sahifangiz huquqlari bilan kod bajaradi va lokal o'zgaruvchilarni o'qiy yoki o'zgartira oladi. Bu XSS (saytlararo skript) hujumlariga yo'l ochadi.
2. **Tezlik** — `eval` interpretatorni chaqiradi va dvigatel optimizatsiyalarini o'chiradi.
3. **Minifikatsiya** — `eval` ga bog'liq scope'larni siquvchi vositalar siqmaydi.

Himoya: CSP (`Content-Security-Policy`) `script-src` yoki `default-src` bilan `eval` ni standartda bloklaydi. Zarur bo'lsa, MDN satr o'rniga `TrustedScript` va `require-trusted-types-for` direktivasini tavsiya qiladi. `unsafe-eval` esa ancha xavfli.

## Kod: `new Function`

```js
const qosh = new Function('a', 'b', 'return a + b');   // oxirgi argument — tana, qolganlari — parametrlar
console.log(qosh(2, 3), qosh.name);
console.log(qosh.toString());                            // MDN: dinamik yig'ilgan manba

globalThis.globalX = 'global';
function yasa() {
  const lokalX = 'lokal';
  const oddiy = function () { return typeof lokalX; };    // closure — lokalni ko'radi
  const dinamik = new Function('return [typeof lokalX, globalX]');   // faqat global scope
  return [oddiy(), dinamik()];
}
console.log(yasa());
delete globalThis.globalX;
```

```text
$ node function.mjs
5 anonymous
function anonymous(a,b
) {
return a + b
}
[ 'string', [ 'undefined', 'global' ] ]
```

- `name` — `anonymous`, `toString()` — MDN'dagi shablon bo'yicha yig'ilgan manba.
- Oddiy funksiya ifodasi `lokalX` ni ko'rdi (closure, 43-bob). `new Function` tanasi esa uni ko'rmadi (`undefined`), faqat global `globalX` ni ko'rdi.

## Kod: to'g'ridan-to'g'ri va bilvosita `eval`

```js
function test() {
  const x = 2, y = 4;
  console.log('to\'g\'ridan-to\'g\'ri:', eval('x + y'));             // lokal scope
  try { console.log(eval?.('x + y')); }                                  // bilvosita — global scope
  catch (e) { console.log('bilvosita:', e.name + ': ' + e.message); }
}
test();
console.log(eval('let a = 1; a + 1'), eval('if (true) { "yakuniy qiymat" }'));
console.log(eval(new String('2 + 2')) instanceof String, eval('2 + 2'));   // MDN: String obyekti qaytadi
eval('var evalVar = 1');                                                    // modul strict — var tashqariga chiqmaydi
console.log('evalVar tashqarida:', typeof evalVar);
```

```text
$ node eval.mjs
to'g'ridan-to'g'ri: 6
bilvosita: ReferenceError: x is not defined
2 yakuniy qiymat
true 4
evalVar tashqarida: undefined
```

- `eval('x + y')` lokal `x`, `y` ni ko'rdi — 6. `eval?.(...)` global scope'da ishladi — `ReferenceError`.
- `eval` yakuniy qiymatni qaytaradi: ifodaniki ham, `if` blokidagi ifodaniki ham.
- `String` obyekti bajarilmadi, o'zi qaytdi.
- Modul strict rejimda — `eval` ichidagi `var` tashqariga chiqmadi.

## Kod: `eval` siz

MDN `eval` o'rniga muqobillarni ko'rsatadi: JSON, kvadrat qavs bilan xossa, callback. Tashqi ma'lumot **ma'lumot** sifatida o'qiladi, kod sifatida emas:

```js
// Foydalanuvchidan kelgan ma'lumotni kod sifatida bajarmaslik — xavfsiz muqobillar
const kiritma = '{"narx": 120, "soni": 3}';
const m = JSON.parse(kiritma);                       // eval o'rniga — JSON (38-bob)
console.log(m.narx * m.soni);
const amallar = { qosh: (a, b) => a + b, kop: (a, b) => a * b };   // nom bo'yicha amal — xarita orqali
const amal = 'kop';
console.log(Object.hasOwn(amallar, amal) ? amallar[amal](4, 5) : 'noma\'lum amal');
const xossa = 'narx';
console.log(m[xossa]);                               // dinamik xossa — kvadrat qavs
```

```text
$ node xavfsiz.mjs
360
20
120
```

- Tashqi matndagi obyekt — `JSON.parse` (38-bob): u faqat ma'lumot tahlil qiladi, kod bajarmaydi.
- Nomi satr bilan berilgan amal — oldindan ma'lum funksiyalar xaritasidan tanlanadi. Ruxsat etilmagan nom esa rad etiladi.
- Dinamik xossa nomi — `obj[nom]`.

## Nega shunday

Satrdan kod bajarish tilning eng boshidan bor: u ba'zi vazifalarda (shablon dvigatellari, REPL, tuzatish vositalari) kerak. Lekin u dasturning ma'lumot va kod chegarasini yo'q qiladi. Tashqaridan kelgan satr kodga aylansa, uni kim yozgan bo'lsa, o'sha boshqaradi. Shuning uchun zamonaviy muhitlar uni CSP bilan cheklaydi, standart esa lokal scope'ga ta'sirini kamaytiradi: strict rejim va bilvosita `eval`.

## Muhandislik nuqtai nazari

### Ma'lumotni kod sifatida bajarmang

Foydalanuvchi kiritmasi, URL parametri, API javobi — hech biri `eval`, `new Function`, `setTimeout('satr')` ga tushmasin. Ma'lumot uchun JSON, amal tanlash uchun oq ro'yxat (allowlist).

### CSP'ni yoqing

Brauzer ilovasida `script-src` bilan CSP `eval` ni bloklaydi va xato bo'lsa darhol ko'rinadi. `unsafe-eval` qo'shishdan oldin kodni `eval` siz qayta yozing.

### Haqiqatan kerak bo'lsa — izolyatsiya

Dinamik kod zarur bo'lsa (masalan, foydalanuvchi plaginlari), uni alohida muhitda bajaring: brauzerda — alohida iframe yoki worker, serverda — alohida jarayon. Node'ning `vm` moduli xavfsizlik chegarasi **emas** (Node hujjati).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Tashqi satrni `eval` qilish | Begona kod sahifa huquqlari bilan bajariladi (MDN) | JSON, oq ro'yxat |
| `JSON` ni `eval` bilan o'qish | Ma'lumot o'rniga kod bajarilishi mumkin | `JSON.parse` |
| `obj[nom]` o'rniga `eval('obj.' + nom)` | Sekin va xavfli | Kvadrat qavs |
| `new Function` lokal o'zgaruvchilarni ko'radi deb o'ylash | `ReferenceError` yoki `undefined` | Kerakli qiymatlarni parametr qilib berish |
| CSP'ga `unsafe-eval` qo'shish | Himoya o'chadi | Kodni `eval` siz yozish |

## Amaliyot

1. `new Function` bilan yaratilgan funksiyaga lokal o'zgaruvchini parametr orqali bering va natijani tekshiring.
2. `eval` ning to'rtta bilvosita chaqiruv shaklini yozib, har biri lokal o'zgaruvchini ko'rmasligini tekshiring.
3. Strict bo'lmagan CommonJS faylida `eval('var t = 1')` dan keyin `t` ni o'qing, keyin xuddi shuni modulda qiling.
4. `hisobla('qosh', 2, 3)` funksiyasini `eval` siz, faqat ruxsat etilgan amallar xaritasi bilan yozing.
5. Oddiy HTML sahifada `Content-Security-Policy: script-src 'self'` sarlavhasi bilan `eval('1+1')` chaqiring va konsoldagi xatoni o'qing.

## Rasmiy hujjat

- MDN — `Function()` constructor: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function>
- MDN — `eval()` (Direct and indirect eval, Never use direct eval!, Security considerations): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval>
- MDN — *Content Security Policy*: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP>
- Node.js — *VM*: <https://nodejs.org/api/vm.html>

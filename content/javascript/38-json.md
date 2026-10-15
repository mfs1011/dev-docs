# 38 — JSON

[← Oldingi: Sana va vaqt](37-sana-va-vaqt.md) · [Mundarija](README.md) · [Keyingi: Intl →](39-intl.md)

## Tushuncha

**JSON** (JavaScript Object Notation) — MDN: obyektlar, massivlar, sonlar, satrlar, mantiqiy qiymatlar va `null` ni **seriyalash** (serialization — ma'lumotni matnga aylantirish) uchun sintaksis. U API javoblari, sozlama fayllari, `localStorage` kabi joylarda ma'lumot almashishning standart formati. Rasmiy grammatikasi — IETF RFC 8259.

JavaScript'da u bilan ishlash uchun `JSON` obyekti bor (MDN: `Math` kabi konstruktor emas, faqat statik metodlar):

- **`JSON.stringify(qiymat)`** — JavaScript qiymatini JSON **satriga**;
- **`JSON.parse(satr)`** — JSON satrini JavaScript qiymatiga.

MDN muhim farqni ta'kidlaydi: JSON JavaScript sintaksisiga asoslangan, lekin **JavaScript'ning ko'p qismi JSON emas**.

## Kod: asosiy ishlatilishi

```js
const user = { ism: 'Ali', yosh: 25, faol: true, teglar: ['js', 'uz'], manzil: null };
const s = JSON.stringify(user);
console.log(s, typeof s);
const qayta = JSON.parse(s);
console.log(qayta, qayta === user);
console.log(JSON.stringify(user, null, 2));
console.log(JSON.stringify(user, ['ism', 'yosh']));
```

```text
$ node asos.mjs
{"ism":"Ali","yosh":25,"faol":true,"teglar":["js","uz"],"manzil":null} string
{
  ism: 'Ali',
  yosh: 25,
  faol: true,
  teglar: [ 'js', 'uz' ],
  manzil: null
} false
{
  "ism": "Ali",
  "yosh": 25,
  "faol": true,
  "teglar": [
    "js",
    "uz"
  ],
  "manzil": null
}
{"ism":"Ali","yosh":25}
```

- `parse(stringify(x))` — **yangi** obyekt (`qayta === user` — `false`). Shuning uchun u ba'zan chuqur nusxa uchun ishlatiladi — chegaralari 17-bobda va pastda.
- Uchinchi argument (`space`) — chiroyli formatlash uchun chekinish (2 ta bo'sh joy).
- Ikkinchi argument **massiv** bo'lsa — MDN: faqat shu nomli xossalar kiritiladi.

## JSON va JavaScript farqi

MDN sanagan farqlar:

| | JavaScript literal | JSON |
| --- | --- | --- |
| Xossa nomi | `ism`, `'ism'`, `"ism"` | Faqat `"ism"` (ikki qo'shtirnoq) |
| Satr | `'...'`, `"..."`, `` `...` `` | Faqat `"..."` |
| Oxirgi vergul | Ruxsat | **Taqiqlangan** |
| Son | `01`, `.5`, `NaN`, `Infinity` | Boshidagi nol, nuqtadan keyin raqamsiz, `NaN`/`Infinity` — **yo'q** |
| `undefined`, funksiya, izoh | Bor | **Yo'q** |

```js
const yomon = ["{ism: 'Ali'}", '{"a": 1,}', '{"a": 01}', '{"a": NaN}', "{'a': 1}", '{"a": 1} // izoh', ''];
for (const t of yomon) {
  try { JSON.parse(t); } catch (e) { console.log(JSON.stringify(t).padEnd(22), e.name + ': ' + e.message); }
}
console.log(JSON.parse('"satr"'), JSON.parse('42'), JSON.parse('null'), JSON.parse(' [1, 2] '));
```

```text
$ node xato.mjs
"{ism: 'Ali'}"         SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
"{\"a\": 1,}"          SyntaxError: Expected double-quoted property name in JSON at position 8 (line 1 column 9)
"{\"a\": 01}"          SyntaxError: Unexpected number in JSON at position 7 (line 1 column 8)
"{\"a\": NaN}"         SyntaxError: Unexpected token 'N', "{"a": NaN}" is not valid JSON
"{'a': 1}"             SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
"{\"a\": 1} // izoh"   SyntaxError: Unexpected non-whitespace character after JSON at position 9 (line 1 column 10)
""                     SyntaxError: Unexpected end of JSON input
satr 42 null [ 1, 2 ]
```

`JSON.parse` noto'g'ri matnda `SyntaxError` beradi — tashqi ma'lumotni har doim `try...catch` ichida o'qing. JSON matni obyekt bo'lishi shart emas: satr, son, `null`, massiv ham to'g'ri JSON.

## Kod: nima yo'qoladi

```js
const obj = {
  a: undefined, f() {}, [Symbol('s')]: 1, n: NaN, i: Infinity,
  sana: new Date(Date.UTC(2026, 9, 15)), map: new Map([['k', 1]]), set: new Set([1]),
  arr: [undefined, () => 1, Symbol('x'), NaN],
};
console.log(JSON.stringify(obj));
console.log(JSON.stringify(undefined), JSON.stringify(() => 1), JSON.stringify('salom'), JSON.stringify(Temporal.PlainDate.from('2026-10-15')));
const a = { ism: 'a' }; a.ozi = a;
try { JSON.stringify(a); } catch (e) { console.log(e.name + ': ' + e.message.split('\n')[0]); }
```

```text
$ node yoqoladi.mjs
{"n":null,"i":null,"sana":"2026-10-15T00:00:00.000Z","map":{},"set":{},"arr":[null,null,null,null]}
undefined undefined "salom" "2026-10-15"
TypeError: Converting circular structure to JSON
```

MDN qoidalari:

- `undefined`, funksiya, symbol — **obyektda tashlab yuboriladi**, **massivda `null`** ga aylanadi (indekslar siljimasligi uchun). To'g'ridan-to'g'ri berilsa — `stringify` `undefined` qaytaradi (satr emas!).
- `NaN`, `Infinity` — `null`.
- Symbol kalitli xossalar — butunlay e'tiborsiz (22-bob).
- `Date` — `toJSON()` orqali ISO satr; MDN: barcha `Temporal` obyektlari ham `toJSON()` bilan satrga aylanadi. Lekin **qaytarib o'qishda** ular satr bo'lib qoladi.
- `Map`, `Set` — MDN: faqat o'z sanaladigan xossalar o'qiladi, shuning uchun `{}`.
- BigInt — `TypeError` (27-bob).
- Halqali tuzilma — `TypeError`.

## Kod: `replacer`, `reviver` va `toJSON`

```js
const matn = JSON.stringify({ nom: 'Uchrashuv', vaqt: new Date(Date.UTC(2026, 9, 15, 9, 30)) });
console.log(matn);
const oddiy = JSON.parse(matn);
console.log(typeof oddiy.vaqt);
const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const tiklangan = JSON.parse(matn, (k, v) => typeof v === 'string' && iso.test(v) ? new Date(v) : v);
console.log(tiklangan.vaqt instanceof Date, tiklangan.vaqt.getUTCHours());
class Pul {
  constructor(tiyin) { this.tiyin = tiyin; }
  toJSON() { return { $pul: this.tiyin }; }
}
console.log(JSON.stringify({ narx: new Pul(1250050) }));
const tartib = [];
JSON.parse('{"a": {"b": 1}, "c": [2]}', function (k, v) { tartib.push(k === '' ? '(ildiz)' : k); return v; });
console.log(tartib.join(' → '));
console.log(JSON.stringify({ parol: 'x', ism: 'Ali' }, (k, v) => k === 'parol' ? undefined : v));
```

```text
$ node reviver.mjs
{"nom":"Uchrashuv","vaqt":"2026-10-15T09:30:00.000Z"}
string
true 9
{"narx":{"$pul":1250050}}
b → a → 0 → c → (ildiz)
{"ism":"Ali"}
```

- **`reviver`** — `JSON.parse` ning ikkinchi argumenti. MDN: har qiymat **chuqurlik bo'yicha**, eng ichkaridan boshlab, oxirida ildiz (kalit `''`) bilan funksiyadan o'tkaziladi (`b → a → 0 → c → (ildiz)`). Qaytgan qiymat asl qiymat o'rnini egallaydi. Bu yerda ISO satrlar `Date` ga tiklandi.
- **`toJSON()`** — MDN: obyektda shu metod bo'lsa, obyektning o'rniga uning natijasi seriyalanadi. O'z klasslaringiz uchun JSON ko'rinishini belgilash usuli.
- **`replacer` funksiya** — `stringify` ning ikkinchi argumenti. MDN: `undefined` qaytarsa, xossa natijaga kirmaydi — bu yerda parol olib tashlandi.

### Katta sonlar va manba matni

MDN ogohlantiradi: `reviver` qiymat o'qilgandan **keyin** ishlaydi — JSON'dagi sonlar allaqachon `Number` ga aylangan va aniqligini yo'qotgan bo'lishi mumkin. Yechim — `reviver` ning uchinchi argumenti `context.source` (ES2026) va `JSON.rawJSON`. Ikkalasi ham 27-bobda Node.js 26 da sinalgan. Ular katta ID'larni JSON'dan aniq BigInt sifatida o'qish va qaytarib yozish imkonini beradi.

## Nega shunday

JSON — **til mustaqil** format: Python, Go, Java va boshqa tillar ham uni o'qiydi. Shuning uchun u faqat hamma tilda bor qiymat turlari bilan cheklangan — obyekt, massiv, son, satr, mantiqiy, `null`. `undefined`, funksiya, `Date`, `Map` kabi JavaScript'ga xos narsalar uchun JSON'da ko'rinish yo'q. Ularni o'tkazish uchun `toJSON`/`replacer` va `reviver` orqali o'z kelishuvingizni belgilaysiz.

MDN: `stringify` xossalarni `Object.keys` algoritmi bilan aylanadi — tartibi aniq va amalga oshirishlar orasida barqaror. Bir obyekt doim bir xil satr beradi.

## Muhandislik nuqtai nazari

### Tashqi JSON — ishonchsiz

`JSON.parse` faqat **sintaksisni** tekshiradi. Natijaning tuzilmasi (kerakli maydonlar, turlar) kutilganidek ekanligini alohida tekshiring: qo'lda yoki sxema tekshiruvchi kutubxona bilan. JSON'dan kelgan obyektni `Object.assign` bilan boshqa obyektga quyish — prototype pollution xavfi (33-bob).

### `JSON.parse(JSON.stringify(x))` — nusxa emas

Bu usul `Date` ni satrga aylantiradi, `undefined` va funksiyalarni yo'qotadi, `Map`/`Set` ni `{}` qiladi, halqada xato beradi. Chuqur nusxa uchun — `structuredClone` (17-bob).

### Sana va pul — kelishuv bilan

Sanalarni ISO satr (UTC), pulni butun birlikda (tiyin) va katta ID'larni satr sifatida yuboring — JSON'ning eng zaif joylari shular. API hujjatida formatni aniq yozing.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `JSON.parse` ni `try` siz | Noto'g'ri javobda dastur yiqiladi | `try...catch` |
| `JSON.parse(obj)` — obyektni berish | `obj` satrga aylanadi: `"[object Object]"` → `SyntaxError` | Faqat satr bering |
| `{'a': 1}` yoki oxirgi vergulli JSON | `SyntaxError` | Ikki qo'shtirnoq, vergulsiz |
| `JSON.stringify(map)` | `'{}'` | `Object.fromEntries(map)` yoki `[...map]` |
| `Date` qaytib keladi deb kutish | Satr keladi | `reviver` |
| Katta ID'ni son sifatida o'qish | Aniqlik yo'qoladi | Satr ID yoki `context.source` |
| `JSON.stringify` natijasi doim satr deb o'ylash | `undefined` qaytishi mumkin | Kirishni tekshiring |
| Halqali obyektni seriyalash | `TypeError` | Halqani uzish yoki `replacer` |

## Amaliyot

1. `{ a: [1, { b: undefined, c: () => 1 }], d: NaN }` ni `stringify` qilishdan oldin natijani yozing, keyin tekshiring.
2. `Map` va `Set` ni seriyalaydigan `replacer` va ularni tiklaydigan `reviver` yozing (`{ $map: [...] }`, `{ $set: [...] }` ko'rinishida).
3. `Foydalanuvchi` klassiga `toJSON()` qo'shing: `parol` maydoni chiqmasin, `yaratilgan` (`Date`) faqat sana (`YYYY-MM-DD`) bo'lib chiqsin.
4. `JSON.stringify(obj, null, '\t')` va `JSON.stringify(obj, null, 20)` ni sinang. `space` qanday cheklanadi? (MDN `JSON.stringify` sahifasidan tekshiring.)
5. `xavfsizParse(matn, standart)` funksiyasini yozing: xato bo'lsa `standart` ni qaytarsin va xatoni log qilsin.

## Rasmiy hujjat

- MDN — `JSON`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON>
- MDN — `JSON.stringify()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify>
- MDN — `JSON.parse()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse>
- MDN — `JSON.rawJSON()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON>
- IETF — RFC 8259 (*The JSON Data Interchange Format*): <https://datatracker.ietf.org/doc/html/rfc8259>
- ECMA-262 — *The JSON Object*: <https://tc39.es/ecma262/2026/#sec-json-object>

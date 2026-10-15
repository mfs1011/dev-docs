# 21 — Optional chaining

[← Oldingi: Konstruktor va `new`](20-konstruktor-va-new.md) · [Mundarija](README.md) · [Keyingi: Symbol →](22-symbol.md)

## Tushuncha

**Optional chaining** (ixtiyoriy zanjir, `?.`) — MDN: `.` operatoriga o'xshaydi, lekin chap tomondagi qiymat **nullish** (`null` yoki `undefined`) bo'lsa, xato bermaydi — ifoda **qisqa tutashadi** (short-circuit) va `undefined` qaytaradi.

Uch shakli bor:

| Shakl | Ma'nosi |
| --- | --- |
| `obj?.xossa` | `obj` nullish bo'lsa — `undefined`, aks holda `obj.xossa` |
| `obj?.[ifoda]` | Xuddi shu, kvadrat qavsli murojaat uchun |
| `f?.()` | `f` nullish bo'lsa — `undefined`, aks holda `f()` chaqiriladi |

## Kod: asosiy ishlatilishi

```js
const user = { ism: 'Ali', manzil: { shahar: 'Toshkent' }, ballar: [5, 4] };
const mehmon = { ism: 'Mehmon' };
console.log(user.manzil?.shahar, mehmon.manzil?.shahar);
try { mehmon.manzil.shahar; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(user.ballar?.[0], mehmon.ballar?.[0]);
console.log(user.salom?.(), mehmon.ism?.length);
try { user.ism?.(); } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node asos.mjs
Toshkent undefined
TypeError: Cannot read properties of undefined (reading 'shahar')
5 undefined
undefined 6
TypeError: user.ism is not a function
```

- `mehmon.manzil` yo'q — oddiy `.` bilan `TypeError`, `?.` bilan `undefined`.
- `?.[0]` — MDN: massivlar uchun ayniqsa qulay, chunki indeks faqat kvadrat qavs bilan olinadi.
- `user.salom?.()` — metod yo'q, chaqiruv bajarilmadi. MDN: bu eski muhitda yoki qurilmada mavjud bo'lmasligi mumkin bo'lgan API metodini chaqirishda foydali.
- `user.ism?.()` — `ism` **bor**, lekin funksiya emas. `?.` faqat nullish'ni tekshiradi, shuning uchun MDN aytganidek baribir `TypeError: ... is not a function`.

## Kod: `&&` dan farqi

`?.` dan oldin bunday yozilardi: `obj.first && obj.first.second`. MDN: bu uzun va **xavfsiz emas** — `&&` har qanday falsy (8–10-boblar) qiymatda to'xtaydi, `0` va `''` da ham:

```js
const son = 0;
console.log(son && son.toFixed(1), son?.toFixed(1));
```

```text
0 0.0
```

`son && ...` — `0` falsy, natija `0`. `son?.` — `0` nullish emas, metod chaqirildi. `?.` faqat `null`/`undefined` ga qaraydi.

## Kod: qisqa tutashuv qanchalik uzoqqa boradi

```js
let x = 0;
const yoq = null;
yoq?.[x++];
console.log('x =', x);
console.log(yoq?.a.b.c.d);
try { (yoq?.a).b; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(mehmon.manzil?.shahar ?? 'noma\'lum');
```

```text
x = 0
undefined
TypeError: Cannot read properties of undefined (reading 'b')
noma'lum
```

- `yoq?.[x++]` — chap tomon `null`, kvadrat qavs ichidagi ifoda **umuman hisoblanmadi**: `x` o'zgarmadi.
- `yoq?.a.b.c.d` — MDN: qisqa tutashuv butun **uzluksiz zanjirni** to'xtatadi; `.b`, `.c`, `.d` ga `?.` kerak emas.
- `(yoq?.a).b` — qavs zanjirni uzadi. Qavs ichi `undefined` bo'ldi, keyingi `.b` esa alohida bajarildi — `TypeError`.
- `?.` va `??` (10-bob) birga — "yo'q bo'lsa standart qiymat" uchun odatiy juftlik.

## Kod: qayerda ishlatib bo'lmaydi

```js
try { eval('user?.ism = 1'); } catch (e) { console.log(e.name + ': ' + e.message); }
try { eval('aniqlanmagan?.a'); } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
SyntaxError: Invalid left-hand side in assignment
ReferenceError: aniqlanmagan is not defined
```

(`eval` faqat sintaksis xatosini `try` ichida ushlash uchun ishlatildi.)

- **Tayinlash** chap tomonida — MDN: `SyntaxError`.
- **E'lon qilinmagan** o'zgaruvchi — MDN: `?.` qiymati `undefined` bo'lgan o'zgaruvchi bilan ishlaydi, lekin umuman e'lon qilinmagan nom baribir `ReferenceError` beradi.
- MDN yana ikki cheklovni sanaydi: `new Intl?.DateTimeFormat()` va `` String.raw?.`...` `` (tagged template) — ikkalasi ham `SyntaxError`.

## Nega shunday

Ichma-ich tuzilmadagi ma'lumot (API javobi, sozlamalar) ko'pincha to'liq bo'lmaydi. MDN: `?.` reference yo'q bo'lishi mumkin bo'lgan joyda ifodalarni **qisqaroq va soddaroq** qiladi. Uning faqat nullish'ga qarashi `&&` ning `0`/`''` dagi xatosini yo'q qiladi — xuddi `??` ning `||` ga nisbatan afzalligi kabi (10-bob).

## Muhandislik nuqtai nazari

### Faqat ixtiyoriy narsaga ishlating

`?.` "bu yo'q bo'lishi **normal**" degan ma'noni beradi. Majburiy bo'lishi kerak bo'lgan qiymatga (`user.id`, konfiguratsiyaning asosiy qismi) `?.` qo'ysangiz, xato yashirinadi: `TypeError` aniq joyda chiqish o'rniga `undefined` uzoqqa oqib boradi va boshqa joyda tushunarsiz xato beradi. Har `.` ni `?.` ga almashtirish — antipattern.

### Chegarada tekshiring, ichkarida ishoning

Tashqi ma'lumot (JSON, foydalanuvchi kiritishi) kiradigan joyda tuzilmani bir marta tekshirib, ichki kodda oddiy `.` ishlatish — har joyda `?.` sepishdan toza.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Har joyda `?.` | Haqiqiy xato `undefined` ortida yashirinadi | Faqat ixtiyoriy qismga |
| `obj?.x = 1` | `SyntaxError` | `if (obj) obj.x = 1` |
| `(a?.b).c` | `TypeError` | `a?.b.c` yoki `a?.b?.c` |
| `f?.()` funksiya bo'lmagan qiymatga | `TypeError: ... is not a function` | `typeof f === 'function'` |
| E'lon qilinmagan nom: `x?.a` | `ReferenceError` | O'zgaruvchini e'lon qilish yoki `globalThis.x?.a` |
| `a && a.b` raqam/satr bilan | `0`/`''` da noto'g'ri to'xtaydi | `a?.b` |

## Amaliyot

1. `const javob = { data: { items: [] } }` — birinchi elementning `nom` xossasini xavfsiz oling; yo'q bo'lsa `'bo\'sh'` chiqsin.
2. `obj?.a.b` va `obj?.a?.b` qachon turli natija beradi? Ikki obyekt bilan tekshiring.
3. `let i = 0; null?.[i++]; undefined?.(i++);` — `i` nimaga teng?
4. `qayta?.()` callback ixtiyoriy bo'lgan funksiya yozing: `function yukla(url, qayta) { ...; qayta?.(natija); }`.
5. Kodingizdagi `a && a.b && a.b.c` zanjirlarini toping va `?.` ga almashtirish xavfsizmi — tekshiring (`0`, `''`, `false` qiymatlari).

## Rasmiy hujjat

- MDN — *Optional chaining (?.)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining>
- MDN — *Nullish* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Nullish>
- ECMA-262 — *Optional Chains*: <https://tc39.es/ecma262/2026/#sec-optional-chains>

# 08 — Operatorlar va matematika

[← Oldingi: Tip o'zgartirish](07-tip-ozgartirish.md) · [Mundarija](README.md) · [Keyingi: Taqqoslash →](09-taqqoslash.md)

## Tushuncha

MDN (*Expressions and operators*): **ifoda** — qiymatga hisoblanadigan kod birligi. Ifodalar ikki xil:

- **qo'shimcha ta'sirli** (side effect) — masalan, `x = 7`: `x` ga qiymat yozadi va o'zi ham `7` ga teng;
- **sof hisoblanadigan** — masalan, `3 + 4`: faqat `7` qiymatini beradi; agar u kattaroq konstruksiyaning qismi bo'lmasa (`const z = 3 + 4`), natija darhol tashlab yuboriladi.

Murakkab ifodalar **operatorlar** bilan birlashtiriladi. Atamalar:

| Atama | Ma'nosi | Misol |
| --- | --- | --- |
| **Operand** | Operator ishlaydigan qiymat | `3 + 4` da `3` va `4` |
| **Binar** operator | Ikki operand, operator o'rtada (*infix*) | `a * b` |
| **Unar** operator | Bitta operand | `-x`, `typeof x`, `x++` |
| **Prefiks** / **postfiks** | Operator operanddan oldin / keyin | `++x` / `x++` |
| **Ternar** | Uch operand — yagona: shartli operator | `a ? b : c` |

MDN: JavaScript'dagi barcha binar operatorlar — infix. Postfiks operatorlar faqat ikkita: `++` va `--`; qolgan barcha unar operatorlar (`!`, `typeof`...) — prefiks.

Bu bobda: arifmetika, tayinlash, ustunlik va assotsiativlik, bit operatorlari. Taqqoslash — 9-bobda, mantiqiy operatorlar — 10-bobda.

## Kod: arifmetik operatorlar

```js
console.log(7 / 2, 7 % 2, -7 % 2, 7 % -2, 5.5 % 2);
console.log(1 / 0, -1 / 0, 0 / 0, 5 % 0);
console.log(2 ** 10, 2 ** -1, 4 ** 0.5, 4 ** 3 ** 2, (4 ** 3) ** 2);
console.log(NaN ** 0, 1 ** Infinity);
console.log(7n / 2n, -7n % 2n);
try { 1n / 0n } catch (e) { console.log(e.name + ':', e.message); }
try { 2n ** -1n } catch (e) { console.log(e.name + ':', e.message); }
```

```text
$ node arif.mjs
3.5 1 -1 1 1.5
Infinity -Infinity NaN NaN
1024 0.5 2 262144 4096
1 NaN
3n -1n
RangeError: Division by zero
RangeError: Exponent must be positive
```

### Bo'lish: butun bo'linma yo'q

`7 / 2` — `3.5`. Number tipi bitta (6-bob), shuning uchun "butun bo'lish" operatori yo'q; butun qism kerak bo'lsa — `Math.trunc(7 / 2)` (26-bob). MDN: nolga bo'lish xato emas — `Infinity`; `0 / 0` esa `NaN`.

### `%` — qoldiq, modul emas

MDN (*Remainder*): `n % d` natijasi **bo'linuvchi** (`n`) ishorasini oladi: `-7 % 2` → `-1`, `7 % -2` → `1`. Ko'p tillarda (masalan, Python) `%` — **modul** operatori, uning natijasi **bo'luvchi** ishorasini oladi. Bir xil ishorali qiymatlarda farq yo'q, lekin manfiy sonlarda bor.

Amaliy oqibat — "juftmi?" tekshiruvi:

```js
const toq = n => n % 2 === 1;      // ❌ toq(-7) → false, chunki -7 % 2 === -1
const toq2 = n => n % 2 !== 0;     // ✅
```

Haqiqiy modul (har doim musbat) kerak bo'lsa: `((n % d) + d) % d`.

`%` kasr sonlarda ham ishlaydi: `5.5 % 2` → `1.5`. Nolga bo'linsa — `NaN`.

### `**` — daraja

MDN (*Exponentiation*):

- `**` **o'ngdan chapga** assotsiativ: `4 ** 3 ** 2` = `4 ** (3 ** 2)` = `4 ** 9` = `262144`, `(4 ** 3) ** 2` emas;
- `NaN ** 0` — `1`: MDN: `NaN` matematik amallarda tarqalmaydigan **yagona** holat;
- `1 ** Infinity` — `NaN`. MDN: IEEE 754 bu holatda `1` talab qiladi, lekin JavaScript o'zining **dastlabki xulqi bilan moslikni saqlash** uchun `NaN` qaytaradi;
- BigInt'da manfiy daraja — `RangeError`.

**Unar minus va daraja:**

```js
console.log(-2 ** 2);
```

```text
SyntaxError: Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence
```

MDN: boshqa tillarda `-2 ** 2` ba'zan `4`, ba'zan `-4`. JavaScript bu noaniqlikka umuman yo'l qo'ymaydi — qavs majburiy: `(-2) ** 2` yoki `-(2 ** 2)`.

`^` belgisi JavaScript'da daraja emas — u **bit XOR** (pastda).

### BigInt arifmetikasi

BigInt'da bo'lish **butun qism**ni beradi: `7n / 2n` → `3n`. Nolga bo'lish — `RangeError` (MDN: Number'da `NaN` qaytariladi, BigInt'da esa `NaN` tushunchasi yo'q). BigInt va Number'ni aralashtirib bo'lmaydi (6-bob).

## Kod: `++` va `--`

```js
let x = 3;
console.log(x++, x);
let y = 3;
console.log(++y, y);
let s = '5';
s++;
console.log(s, typeof s);
```

```text
3 4
4 4
6 number
```

MDN: **postfiks** `x++` — oldin eski qiymatni qaytaradi, keyin oshiradi; **prefiks** `++x` — oldin oshiradi, keyin yangi qiymatni qaytaradi. Ikkalasi ham operandni songa aylantiradi — satr `'5'` son `6` ga aylandi.

MDN (*Operator precedence*): `++` qiymat qaytaradi, **havola emas** — shuning uchun `a++++` sintaksis xatosi. 3-bobdagi ASI ham eslansin: `++` operand bilan bir qatorda bo'lishi kerak.

## Kod: tayinlash operatorlari

```js
let n = 10;
n += 5; n -= 3; n *= 2; n /= 4; n **= 2; n %= 7;
console.log(n);
let matn = 'Salom';
matn += ', dunyo';
console.log(matn);
let a, b;
console.log(a = b = 5, a, b);
const x = (n = 1);
console.log(x);
```

```text
1
Salom, dunyo
5 5 5
1
```

- **Qisqartirilgan tayinlash**: `n += 5` — `n = n + 5` (`-=`, `*=`, `/=`, `%=`, `**=`, bit operatorlari uchun ham bor). Hisob: 10 → 15 → 12 → 24 → 6 → 36 → 1.
- **Tayinlash — ifoda**, uning qiymati — yozilgan qiymat. Shuning uchun `const x = (n = 1)` ishlaydi.
- **O'ngdan chapga** assotsiativ: `a = b = 5` — `a = (b = 5)`.

Mantiqiy tayinlash operatorlari `&&=`, `||=`, `??=` — 10-bobda.

MDN tayinlash zanjirlaridan qochishni tavsiya qiladi (*Avoid assignment chains*): ayniqsa e'londa — `const a = b = 5` da `b` e'lon qilinmagan global bo'lib qoladi (5-bob).

## Kod: ustunlik va assotsiativlik

MDN (*Operator precedence*): `a OP1 b OP2 c` ikki xil o'qilishi mumkin — `(a OP1 b) OP2 c` yoki `a OP1 (b OP2 c)`.

1. **Ustunlik** (precedence) har xil bo'lsa — ustunligi yuqori operator oldin guruhlanadi.
2. Bir xil bo'lsa — **assotsiativlik** hal qiladi: chap-assotsiativ `(a OP b) OP c`, o'ng-assotsiativ `a OP (b OP c)`.

```js
console.log(3 + 10 * 2, (3 + 10) * 2, 2 ** 3 / 3 ** 2, typeof 1 + 2);
```

```text
23 26 0.8888888888888888 number2
```

- `*` ning ustunligi `+` dan yuqori: `3 + 10 * 2` = `23`. Qavs tartibni o'zgartiradi.
- `**` ning ustunligi `/` dan yuqori: `(2 ** 3) / (3 ** 2)`.
- `typeof` (unar) ning ustunligi `+` dan yuqori: `(typeof 1) + 2` = `"number" + 2` = `"number2"`.

Asosiy guruhlar, yuqoridan pastga (to'liq jadval — MDN sahifasida):

```text
qavs ( )                                        eng yuqori
a.b   a[b]   f()   new                          murojaat va chaqiruv
x++   x--                                       postfiks
!  ~  +x  -x  ++x  --x  typeof  void  delete  await
**                                              (o'ngdan chapga)
*   /   %
+   -
<<  >>  >>>
<  <=  >  >=  in  instanceof
==  !=  ===  !==
&                                               bit VA
^                                               bit XOR
|                                               bit YOKI
&&
||   ??                                         (bir xil daraja)
=  +=  -= ...   ? :   =>   yield   ...x         (o'ngdan chapga)
,                                               eng past
```

### Ustunlik ≠ hisoblash tartibi

MDN muhim farqni ta'kidlaydi: ustunlik va assotsiativlik faqat **operatorlar** qanday guruhlanishini belgilaydi. **Operandlar esa doim chapdan o'ngga** hisoblanadi.

```js
function echo(nom, son) { console.log(`  ${nom} hisoblandi`); return son; }
console.log(echo('chap', 4) ** echo('o\'rta', 3) ** echo('o\'ng', 2));
console.log(echo('chap', 4) / echo('o\'rta', 3) ** echo('o\'ng', 2));
```

```text
  chap hisoblandi
  o'rta hisoblandi
  o'ng hisoblandi
262144
  chap hisoblandi
  o'rta hisoblandi
  o'ng hisoblandi
0.4444444444444444
```

`**` o'ng-assotsiativ va `/` dan yuqori, lekin chaqiruvlar baribir chap → o'rta → o'ng tartibida. Avval **barcha operandlar** hisoblanadi, keyin natijalar guruhlash bo'yicha birlashtiriladi. Qo'shimcha ta'sirli funksiyalar ishlatilganda (log, so'rov, hisoblagich) bu muhim.

## Kod: bit operatorlari

MDN: bit operatorlarida son avval **32 bitli butun songa** aylantiriladi.

```js
console.log(5 & 3, 5 | 3, 5 ^ 3, ~5, 1 << 4, -16 >> 2, -16 >>> 28);
console.log(2 ** 32 + 5 | 0, 3.9 | 0, -3.9 | 0, ~~'7.8');
```

```text
1 7 6 -6 16 -4 15
5 3 -3 7
```

| Operator | Ma'nosi | Misol |
| --- | --- | --- |
| `&` | VA | `0101 & 0011` = `0001` → 1 |
| `\|` | YOKI | `0101 \| 0011` = `0111` → 7 |
| `^` | XOR (istisno qiluvchi YOKI) | `0101 ^ 0011` = `0110` → 6 |
| `~` | inkor | `~5` → -6 |
| `<<` | chapga surish | `1 << 4` → 16 |
| `>>` | ishorani saqlab o'ngga | `-16 >> 2` → -4 |
| `>>>` | nol bilan to'ldirib o'ngga | `-16 >>> 28` → 15 |

Ikkinchi qator — 32 bitga aylantirishning yon ta'siri: `2 ** 32 + 5 | 0` → `5` (yuqori bitlar kesildi), `3.9 | 0` → `3` (kasr tashlandi). `x | 0` va `~~x` ba'zan "tez butun qismga aylantirish" sifatida ishlatiladi, lekin 32 bitdan katta sonlarni **buzadi** — o'rniga `Math.trunc` ishlating.

MDN eslatmasi: bir sonda bir nechta mantiqiy qiymatni bit niqoblari bilan saqlash odatda **yomon amaliyot** hisoblanadi — kodni o'qish va qo'llab-quvvatlash qiyinlashadi; faqat juda cheklangan muhitlarda (har bit muhim bo'lganda) oxirgi chora sifatida.

`>>>` BigInt'da ishlamaydi (MDN *BigInt type*).

## Kod: vergul va `void`

```js
let i = 0;
const r = (i++, i++, i);
console.log(r);
console.log(void 0, void 'nima bo\'lsa ham');
```

```text
2
undefined undefined
```

- **Vergul operatori** — har bir operandni chapdan o'ngga hisoblaydi va **oxirgisini** qaytaradi. Amalda deyarli faqat `for` sarlavhasida (`for (let i = 0, j = 10; i < j; i++, j--)`). E'lon ichidagi vergul (`let a, b`) — vergul operatori emas (5-bob).
- **`void`** — ifodani hisoblaydi va doim `undefined` qaytaradi.

## Nega shunday

MDN (*Grammar and types*): JavaScript sintaksisining katta qismi Java, C va C++ dan olingan — operatorlar ham tanish ko'rinadi. Lekin JavaScript'ning ikki xususiyati hamma narsani o'zgartiradi:

1. **Bitta son tipi** (IEEE 754 double) — shuning uchun butun bo'lish yo'q, nolga bo'lish `Infinity`, bit operatorlari esa 32 bitga "tushirib" ishlaydi.
2. **Yashirin aylantirish** (7-bob) — operatorlar har qanday tipni qabul qiladi va kerakli tipga aylantiradi: `'5' * 2` → `10`, `s++` satrni songa aylantiradi.

Til dizaynerlari xavfli joylarda **xato berishni** afzal ko'rgan: `-2 ** 2` — noaniq bo'lgani uchun `SyntaxError`, BigInt'ni Number bilan aralashtirish — `TypeError`, BigInt'ni nolga bo'lish — `RangeError`.

## Muhandislik nuqtai nazari

### Qavslar — o'quvchi uchun

Ustunlik jadvalini hamma yod bilmaydi. Hisoblash tartibi ko'zga darhol ko'rinmasa — qavs qo'ying, hatto u ortiqcha bo'lsa ham: `(a && b) || c`, `(narx * soni) - chegirma`. MDN misolida ham `3 + (10 * 2)` — "ortiqcha qavs" — tushunarli bo'lishi uchun ishlatilgan.

### Pul hisoblari

`%` va `/` kasr sonlarda aniq ishlamaydi (26-bobda `0.1 + 0.2`). Pul bilan ishlashda summani **eng kichik birlikda butun son** sifatida saqlang (tiyin, sent) yoki BigInt ishlating; ko'rsatishda `Intl.NumberFormat` (39-bob).

### Qo'shimcha ta'sirni ifoda ichiga yashirmang

`arr[i++] = qiymat` yoki `if (x = topish())` kabi kod qisqa, lekin o'qishda chalkashtiradi — ayniqsa hisoblash tartibi muhim bo'lganda. Har qo'shimcha ta'sirni alohida instruksiyaga chiqarish xavfsizroq.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `n % 2 === 1` bilan toqlikni tekshirish | Manfiy sonlarda noto'g'ri | `n % 2 !== 0` |
| `2 ^ 3` ni daraja deb yozish | XOR: `1` | `2 ** 3` |
| `-2 ** 2` | `SyntaxError` | `(-2) ** 2` yoki `-(2 ** 2)` |
| `x \| 0` bilan katta sonni butunlash | 32 bitdan katta son buziladi | `Math.trunc(x)` |
| `7 / 2` dan butun natija kutish | `3.5` | `Math.trunc(7 / 2)` yoki BigInt |
| `typeof a + b` dan `typeof (a + b)` kutish | `typeof` oldin bajariladi | Qavs |
| `x++` qiymatini yangi deb ishlatish | Eski qiymat qaytadi | `++x` yoki alohida qator |

## Amaliyot

1. Hisoblab ko'ring, keyin tekshiring: `2 + 3 * 4 ** 2 / 8 - 1`, `10 % 3 ** 2`, `-10 % 3`, `2 ** -2`.
2. `mod(n, d)` funksiyasini yozing — natija doim bo'luvchi ishorasida bo'lsin. `mod(-7, 3)` → `2` bo'lishi kerak.
3. `let i = 1; const r = i++ + ++i;` — `r` va `i` nimaga teng? Operandlar hisoblanish tartibi bo'yicha tushuntiring.
4. `0.1 * 3`, `0.3 / 0.1`, `Math.trunc(0.3 / 0.1)` ni hisoblang. Nima uchun g'alati? (Javob — 26-bobda.)
5. Ruxsatlarni bit niqobi bilan saqlang: `OQISH = 1`, `YOZISH = 2`, `OCHIRISH = 4`. Foydalanuvchiga `OQISH | YOZISH` bering va `YOZISH` bor-yo'qligini `&` bilan tekshiring. Keyin xuddi shuni `Set` bilan yozing — qaysi o'qishga osonroq?

## Rasmiy hujjat

- MDN — *Expressions and operators*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators>
- MDN — *Operator precedence*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence>
- MDN — *Remainder (%)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder>
- MDN — *Exponentiation (\*\*)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation>
- MDN — *Increment (++)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Increment>
- MDN — *Comma operator*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator>
- ECMA-262 — *ECMAScript Language: Expressions*: <https://tc39.es/ecma262/2026/#sec-ecmascript-language-expressions>

# 12 — Sikllar

[← Oldingi: Shartlar](11-shartlar.md) · [Mundarija](README.md) · [Keyingi: Funksiyalar asoslari →](13-funksiyalar-asoslari.md)

## Tushuncha

MDN (*Loops and iteration*): sikllar biror amalni **takror** bajarishning tez va oson usuli. Turi ko'p, lekin mohiyati bir — amalni bir necha marta takrorlash (bu son **nol** ham bo'lishi mumkin). Farqi — boshlanish va tugash nuqtasini qanday belgilashda.

| Sikl | Qachon |
| --- | --- |
| `for (boshlash; shart; qadam)` | Hisoblagich bilan, necha marta ekani ma'lum |
| `while (shart)` | Shart rost ekan — takrorlash soni oldindan noma'lum |
| `do { } while (shart)` | Kamida **bir marta** bajarilishi kerak |
| `for (const x of iterable)` | Massiv, satr, `Map`, `Set` **qiymatlari** bo'yicha |
| `for (const k in obj)` | Obyektning sanaluvchi **kalitlari** bo'yicha |

Boshqaruv: `break` (sikldan chiqish), `continue` (keyingi aylanishga o'tish), **label** (ichma-ich sikllarda qaysi biridan chiqishni ko'rsatish).

## Kod: `for`, `while`, `do...while`

```js
for (let i = 0; i < 3; i++) console.log('for', i);
let n = 0;
while (n < 3) { console.log('while', n); n++; }
let m = 10;
do { console.log('do...while', m); m++; } while (m < 3);
for (let i = 0, j = 4; i < j; i++, j--) console.log('ikki hisoblagich', i, j);
```

```text
$ node asosiy.mjs
for 0
for 1
for 2
while 0
while 1
while 2
do...while 10
ikki hisoblagich 0 4
ikki hisoblagich 1 3
```

### `for` qadamlari

MDN `for` siklining bajarilishini shunday tavsiflaydi:

1. **boshlash** (`initialization`) ifodasi bir marta bajariladi — odatda hisoblagich e'lon qilinadi;
2. **shart** (`condition`) hisoblanadi; truthy bo'lsa — tana bajariladi, aks holda sikl tugaydi (shart umuman yozilmasa — doim rost deb hisoblanadi);
3. **tana** bajariladi;
4. **qadam** (`afterthought`) ifodasi bajariladi;
5. 2-qadamga qaytiladi.

Uchala qism ham ixtiyoriy: `for (;;) {}` — cheksiz sikl. Bir nechta hisoblagich vergul bilan (8-bob, vergul operatori).

### `do...while`

`m = 10`, shart `m < 3` — yolg'on, lekin tana **bir marta bajarildi**. MDN: tana shart tekshirilishidan **oldin** bajariladi. Masalan: foydalanuvchidan to'g'ri qiymat kiritilmaguncha so'rash.

### Cheksiz sikldan saqlaning

MDN: sikl sharti oxir-oqibat yolg'on bo'lishiga ishonch hosil qiling, aks holda sikl hech qachon tugamaydi. `while` da qadamni (`n++`) unutish — eng ko'p uchraydigan sabab. Brauzerda cheksiz sikl butun sahifani muzlatadi, chunki JavaScript bitta oqimda ishlaydi va sikl tugamaguncha boshqa hech narsa — chizish ham, tugma bosish ham — bajarilmaydi (76-bob).

## Kod: `break`, `continue` va label

```js
const sonlar = [3, 8, -1, 5, 0, 7];
for (const s of sonlar) {
  if (s < 0) continue;
  if (s === 0) break;
  console.log(s);
}
```

```text
3
8
5
```

`-1` — `continue` uni o'tkazib yubordi; `0` — `break` siklni butunlay to'xtatdi (`7` ga yetib bormadi).

MDN: label siz `break` **eng ichki** sikl yoki `switch` ni tugatadi. Ichma-ich sikllarda tashqisidan chiqish uchun **label** kerak:

```js
const jadval = [[1, 2, 3], [4, 99, 6], [7, 8, 9]];
tashqi: for (const qator of jadval) {
  for (const qiymat of qator) {
    if (qiymat === 99) { console.log('99 topildi, ikkala sikldan chiqamiz'); break tashqi; }
    console.log(qiymat);
  }
}
```

```text
1
2
3
4
99 topildi, ikkala sikldan chiqamiz
```

MDN: label — instruksiyaga berilgan identifikator (band so'z bo'lmasa bo'ldi); `break label` va `continue label` u bilan ishlaydi. Label'lar kam ishlatiladi — ko'pincha ichki siklni alohida funksiyaga chiqarib, `return` qilish o'qishga osonroq.

## Kod: `for...of` va `for...in` — eng muhim farq

```js
const mevalar = ['olma', 'nok', 'uzum'];
mevalar.qoshimcha = 'diqqat';
for (const k in mevalar) console.log('in:', k, typeof k);
for (const v of mevalar) console.log('of:', v);
```

```text
in: 0 string
in: 1 string
in: 2 string
in: qoshimcha string
of: olma
of: nok
of: uzum
```

| | `for...in` | `for...of` |
| --- | --- | --- |
| Nimani beradi | **Kalit** (xossa nomi), doim **satr** | **Qiymat** |
| Nima ustida | Obyektning sanaluvchi xossalari (meros qilinganlari ham) | **Iterable** — massiv, satr, `Map`, `Set`, `arguments`... |
| Massivda | Indekslar `'0'`, `'1'`... + qo'shimcha xossalar | Faqat elementlar |

MDN: `for...in` massivda raqamli indekslardan tashqari **foydalanuvchi qo'shgan xossalarni** ham qaytaradi (`qoshimcha` ko'rindi) — shuning uchun massivlarni `for...in` bilan aylanmang. MDN uning o'rniga oddiy raqamli `for` ni tavsiya qiladi; `for...of` (ES2015) ham elementlarni beradi.

### Obyektni aylanish

```js
const narx = { olma: 12000, nok: 15000 };
for (const k in narx) console.log(k, narx[k]);
for (const [k, v] of Object.entries(narx)) console.log(k, '→', v);
try { for (const x of narx) {} } catch (e) { console.log(e.name + ':', e.message); }
```

```text
olma 12000
nok 15000
olma → 12000
nok → 15000
TypeError: narx is not iterable
```

Oddiy obyekt **iterable emas** — `for...of` to'g'ridan-to'g'ri ishlamaydi. Ikki yo'l: `for...in` (meros xossalarni ham ko'radi — 21- va 58-boblar) yoki `Object.keys`/`values`/`entries` + `for...of` (faqat o'z xossalari — 35-bob). Ikkinchisi ko'pincha xavfsizroq.

### Satr ustida `for...of`

```js
for (const harf of 'oʻzbek') console.log(harf);
```

```text
o
ʻ
z
b
e
k
```

`for...of` satrni **Unicode belgilari** (code point) bo'yicha aylanadi. `ʻ` (U+02BB) alohida belgi — `oʻ` ikki belgi. Emoji kabi "ikki qismli" belgilarda `for...of` indeks bo'yicha `for` dan farq qiladi — 29-bobda.

## Kod: `let` va yopilishlar (closure) siklda

```js
const a = [], b = [];
for (let i = 0; i < 3; i++) a.push(() => i);
for (var j = 0; j < 3; j++) b.push(() => j);
console.log(a.map(f => f()), b.map(f => f()));
```

```text
[ 0, 1, 2 ] [ 3, 3, 3 ]
```

MDN (*for*, "Lexical declarations in the initialization block"): agar boshlash qismi `let` e'loni bo'lsa, `for` uni **maxsus** ko'radi — har aylanishda **yangi leksik scope** va yangi `i` o'zgaruvchisi yaratiladi. Shuning uchun har funksiya o'z `i` sini "eslab qoladi": 0, 1, 2.

`var` esa faqat funksiya scope'li — barcha funksiyalar **bitta** `j` ni ko'radi, va ular chaqirilganda u allaqachon `3`. MDN shu holatni `setTimeout` bilan ko'rsatadi: `var` bilan `3, 3, 3` chiqadi. Bu klassik xato va closure (43-bob) bilan birga to'liq tushuniladi.

## Nega shunday

`for`, `while`, `do...while` — C oilasidan (MDN: JavaScript'ning `for` sikli Java va C dagiga o'xshaydi). `for...in` obyekt kalitlarini aylanish uchun boshidan bor edi, lekin massivlar ham obyekt bo'lgani uchun (6-bob) u massivda ham "ishlaydi" — chalkashtiruvchi natija bilan. `for...of` va **iteratsiya protokoli** (32-bob) esa ES2015 da qo'shilgan (ECMA-262 kirish qismi: "iterators and generators"). Unda har bir tuzilma o'zi qanday aylanishini belgilaydi — massiv qiymatlarni, `Map` juftliklarni, satr belgilarni beradi — shuning uchun `for...in` ning massivdagi muammosi bu yerda yo'q.

## Muhandislik nuqtai nazari

### Sikl yoki massiv metodlari?

Massivni **o'zgartirish** (har elementdan yangisini yasash), **filtrlash**, **yig'ish** uchun ko'pincha `map`, `filter`, `reduce` (31-bob) aniqroq — niyat metod nomida. Sikl kerak bo'ladigan holatlar:

- erta chiqish kerak (`break`) — garchi `find`, `some`, `every` ham erta to'xtasa ham;
- `await` bilan **ketma-ket** asinxron amallar (`for...of` + `await` — 75-bob);
- unumdorlik muhim bo'lgan juda katta ma'lumotlar.

### Aylanayotgan to'plamni o'zgartirmang

Massivni aylanib turib undan element o'chirish yoki qo'shish — indekslarni siljitadi va elementlar o'tkazib yuboriladi yoki ikki marta ko'riladi. Yangi massiv yasang (`filter`) yoki teskari tartibda aylaning.

### Katta sikllar va interfeys

Brauzerda millionlab aylanishli sikl tugamaguncha sahifa javob bermaydi. Og'ir hisobni bo'laklarga bo'lish yoki Worker'ga (101-bob) chiqarish kerak — 77-bobda.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Massivni `for...in` bilan aylanish | Kalitlar satr, qo'shimcha xossalar ham chiqadi | `for...of` yoki raqamli `for` |
| Obyektni `for...of` bilan aylanish | `TypeError: ... is not iterable` | `Object.entries(obj)` |
| `while` da qadamni unutish | Cheksiz sikl, sahifa muzlaydi | Shartni o'zgartiruvchi qadamni tekshirish |
| `i <= arr.length` | Oxirgi aylanishda `undefined` | `i < arr.length` (2-bobdagi debugger misoli) |
| Sikl ichida `var` + callback | Hamma callback oxirgi qiymatni ko'radi | `let` |
| Ichki sikldan `break` bilan tashqisidan chiqmoqchi bo'lish | Faqat ichkisi to'xtaydi | Label yoki funksiya + `return` |

## Amaliyot

1. 1 dan 100 gacha sonlarni chiqaring: 3 ga bo'linsa — "Fizz", 5 ga — "Buzz", ikkalasiga — "FizzBuzz".
2. `do...while` bilan 1 dan boshlab sonlarni ikkiga ko'paytiring, natija 1000 dan oshguncha. Nechta qadam bo'ldi?
3. Ikki o'lchamli massivda (`[[1,2],[3,4],[5,6]]`) birinchi juft sonni toping va **ikkala** sikldan chiqing — avval label bilan, keyin funksiya va `return` bilan.
4. `const kitob = { nom: 'Otkan kunlar', muallif: 'Abdulla Qodiriy', yil: 1926 };` — uni `for...in` va `Object.entries` + `for...of` bilan aylaning. Natijalar bir xilmi?
5. `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);` ni ishga tushiring. Keyin `var` ni `let` ga almashtiring. Nega natija o'zgardi?

## Rasmiy hujjat

- MDN — *Loops and iteration*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration>
- MDN — `for` ("Lexical declarations in the initialization block"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for>
- MDN — `for...of`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of>
- MDN — `for...in`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in>
- MDN — `label`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label>
- ECMA-262 — *Iteration Statements*: <https://tc39.es/ecma262/2026/#sec-iteration-statements>

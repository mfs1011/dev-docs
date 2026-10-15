# 28 — Satrlar

[← Oldingi: BigInt](27-bigint.md) · [Mundarija](README.md) · [Keyingi: Unicode va satr ichki tuzilishi →](29-unicode.md)

## Tushuncha

**Satr** (string) — MDN: matn ko'rinishida ifodalanadigan ma'lumotni saqlash uchun tur. Uch xil qo'shtirnoq bilan yoziladi:

```js
const a = 'bitta qo\'shtirnoq';
const b = "ikki qo'shtirnoq";
const c = `teskari qo'shtirnoq — ${1 + 1}`;
```

MDN: bitta va ikki qo'shtirnoq **bir xil** ishlaydi. Teskari qo'shtirnoq (backtick) — **template literal**: ichiga `${ifoda}` qo'yish va bir necha qatorga yozish mumkin.

25-bobdan eslatma: satr — primitiv va **o'zgarmas**. Hamma satr metodlari asl satrni o'zgartirmaydi, **yangi** satr qaytaradi.

## Kod: asosiy amallar

```js
const s = 'JavaScript';
console.log(s.length, s[0], s.at(-1), s.charAt(4), s[100], s.charAt(100) === '');
console.log(s.toUpperCase(), s.toLowerCase(), '  salom  '.trim() + '|', '7'.padStart(3, '0'), 'ab'.repeat(3));
console.log("bir 'ikki'" === 'bir \'ikki\'', 'qator1\nqator2'.length, 'tab:\t|');
```

```text
$ node asos.mjs
10 J t S undefined true
JAVASCRIPT javascript salom| 007 ababab
true 13 tab:	|
```

- **Belgiga murojaat** — MDN ikki yo'lni ko'rsatadi: `charAt(i)` va massivdagi kabi `s[i]`. Chegaradan tashqarida `s[i]` — `undefined`, `charAt` — bo'sh satr. `at(-1)` — oxiridan sanaydi.
- MDN: `s[i]` orqali belgini o'chirish yoki o'zgartirish **ishlamaydi** — bu xossalar yozib bo'lmaydigan (25-bob).
- **Maxsus belgilar** (escape sequences): `\n` — yangi qator, `\t` — tabulyatsiya, `\'` — qo'shtirnoqning o'zi. `'qator1\nqator2'.length` — 13: `\n` bitta belgi.
- `length` — aslida **UTF-16 kod birliklari** soni. Emoji va ba'zi belgilarda bu "ko'rinadigan belgilar" sonidan farq qiladi — 29-bobda.

## Kod: qidirish

```js
const s = 'Toshkent — poytaxt, Toshkent viloyati';
console.log(s.indexOf('Toshkent'), s.lastIndexOf('Toshkent'), s.indexOf('Samarqand'));
console.log(s.includes('poytaxt'), s.startsWith('Tosh'), s.endsWith('viloyati'), s.includes('toshkent'));
if (s.indexOf('Tosh')) console.log('topildi'); else console.log('if (indexOf) — 0 falsy!');
console.log(s.search(/p\w+/), s.match(/Tosh\w+/g));
```

```text
$ node qidirish.mjs
0 20 -1
true true true false
if (indexOf) — 0 falsy!
11 [ 'Toshkent', 'Toshkent' ]
```

- `indexOf` — birinchi uchragan joy indeksi, topilmasa `-1`. `lastIndexOf` — oxirgisi.
- `includes`, `startsWith`, `endsWith` — mantiqiy qiymat. "Bormi?" degan savol uchun `indexOf` dan aniqroq.
- Uchinchi qator — klassik xato: `'Tosh'` 0-indeksda topildi, `0` esa falsy (10-bob). `indexOf` natijasini `!== -1` bilan tekshirish kerak, yoki `includes` ishlatish.
- Hamma qidiruvlar **katta-kichik harfni farqlaydi** (`'toshkent'` topilmadi).
- `search`/`match` — muntazam ifodalar (regular expressions) bilan, 93–100-boblarda.

## Kod: kesish, bo'lish, almashtirish

```js
const s = 'Mozilla';
console.log(s.slice(2, 5), s.slice(-3), s.slice(5, 2) === '');
console.log(s.substring(2, 5), s.substring(5, 2), s.substring(-3));
console.log('a,b,,c'.split(','), 'salom'.split(''), 'a-b-c'.split('-', 2));
console.log(['2026', '10', '15'].join('-'), 'yo\'l yo\'l'.replace('yo\'l', 'X'), 'yo\'l yo\'l'.replaceAll('yo\'l', 'X'));
```

```text
$ node kesish.mjs
zil lla true
zil zil Mozilla
[ 'a', 'b', '', 'c' ] [ 's', 'a', 'l', 'o', 'm' ] [ 'a', 'b' ]
2026-10-15 X yo'l X X
```

**`slice` va `substring`** — MDN: deyarli bir xil, lekin ikki farq bor:

| | `slice(a, b)` | `substring(a, b)` |
| --- | --- | --- |
| `a > b` | Bo'sh satr | Argumentlarni **almashtiradi** |
| Manfiy indeks | Oxiridan sanaydi | `0` deb oladi |

Odatda `slice` tanlanadi — massivlardagi `slice` bilan bir xil ishlaydi. Uchinchi usul `substr()` — MDN: **eskirgan** (deprecated), asosiy spetsifikatsiyada emas, faqat brauzerlar uchun ixtiyoriy **Annex B** da.

- `split(ajratgich, chegara)` — satrni massivga. `split('')` — har kod birligiga (emoji'larda xato beradi, 29-bob).
- `replace` — faqat **birinchi** moslikni, `replaceAll` — hammasini almashtiradi.

## Kod: taqqoslash

```js
console.log('a' < 'b', 'a' < 'B', 'Z' < 'a', '10' < '9', 'olma' < 'olcha');
console.log(['olma', 'Behi', 'anor', 'Ölma'].sort());
console.log(['olma', 'Behi', 'anor', 'Ölma'].sort((a, b) => a.localeCompare(b)));
console.log('a'.localeCompare('b'), 'b'.localeCompare('a'), 'a'.localeCompare('a'));
const teng = (x, y, til = 'en-US') => x.localeCompare(y, til, { sensitivity: 'accent' }) === 0;
console.log(teng('salom', 'SALOM'), teng('ß', 'ss', 'de'), teng('ı', 'I', 'tr'));
console.log(['f10', 'f9', 'f1'].sort(), ['f10', 'f9', 'f1'].sort(new Intl.Collator('uz', { numeric: true }).compare));
```

```text
$ node taqqos.mjs
true false true true false
[ 'Behi', 'anor', 'olma', 'Ölma' ]
[ 'anor', 'Behi', 'olma', 'Ölma' ]
-1 1 0
true false true
[ 'f1', 'f10', 'f9' ] [ 'f1', 'f9', 'f10' ]
```

- `<`, `>` satrlarni **kod birliklari** qiymati bo'yicha, belgima-belgi solishtiradi (ECMA-262 *IsLessThan*). Shuning uchun barcha katta lotin harflari kichiklaridan oldin (`'Z' < 'a'`), `'10' < '9'` esa `true` — birinchi belgi `'1'` < `'9'`.
- Standart `sort()` ham shunday — `'Behi'` `'anor'` dan oldin.
- **`localeCompare`** — MDN: til qoidalarini hisobga oladigan taqqoslash (C dagi `strcmp()` kabi). Manfiy, musbat yoki `0` qaytaradi — `sort` uchun tayyor taqqoslagich.
- MDN: `===` va `==` ham katta-kichik harfni farqlaydi. `toUpperCase()` bilan taqqoslash lotin alifbosidan tashqarida ishonchli emas (nemischa `ß`, turkcha `ı`). Ishonchli yo'l — `localeCompare` yoki `Intl.Collator`, `sensitivity` opsiyasi bilan.
- `Intl.Collator` `numeric: true` — satr ichidagi sonlarni son sifatida taqqoslaydi (`f9` < `f10`). `Intl` — 39-bobda.

## Kod: template literal

```js
const ism = 'Ali', ball = 87;
console.log(`${ism}: ${ball} ball, ${ball >= 60 ? 'o\'tdi' : 'yiqildi'}`);
console.log(`ikki
qator`);
console.log(`\${ism}`, `\``);
const narx = { valueOf() { return 100; }, toString() { return '100 so\'m'; } };
console.log(`${narx}`, '' + narx);
```

```text
$ node shablon.mjs
Ali: 87 ball, o'tdi
ikki
qator
${ism} `
100 so'm 100
```

- `${...}` ichida **istalgan ifoda**: hisob, shartli operator, funksiya chaqiruvi.
- Manbadagi yangi qator — MDN: template literalning bir qismi.
- `\${` va `` \` `` — o'rniga qo'yishni va teskari qo'shtirnoqni ekranlash.
- Oxirgi qator — MDN aytgan nozik farq: template literal ifodani **to'g'ridan-to'g'ri satrga** aylantiradi (`toString` birinchi), `+` esa avval **primitivga** (`valueOf` birinchi) — 23-bob.

## Kod: tagged template

MDN: template literal oldiga funksiya nomini qo'ysangiz — **tagged template** (teglangan shablon). Literal qismlari va ifoda qiymatlari shu funksiyaga beriladi, u xohlagan natijani qaytaradi.

```js
function teg(satrlar, ...qiymatlar) {
  console.log(satrlar, satrlar.raw, qiymatlar);
  return satrlar.reduce((acc, s, i) => acc + s + (i < qiymatlar.length ? `[${qiymatlar[i]}]` : ''), '');
}
console.log(teg`Salom ${ism}, ball: ${ball}\n`);
console.log(String.raw`C:\yangi\fayl ${1 + 1}`);
```

```text
[ 'Salom ', ', ball: ', '\n' ] [ 'Salom ', ', ball: ', '\\n' ] [ 'Ali', 87 ]
Salom [Ali], ball: [87]

C:\yangi\fayl 2
```

- Birinchi argument — **matn bo'laklari** massivi. Bo'laklar har doim qiymatlardan bitta ko'p.
- Qolgan argumentlar — `${}` ichidagi qiymatlar.
- `satrlar.raw` — MDN: maxsus belgilari **qayta ishlanmagan** asl matn (`\n` — ikki belgi: `\` va `n`).
- `String.raw` — o'rnatilgan teg: maxsus belgilarni qayta ishlamaydi. Windows yo'llari va muntazam ifodalar uchun qulay.

MDN yana bir foydasini aytadi: ko'p vositalar ma'lum nom bilan teglangan literallarga alohida munosabatda bo'ladi. Masalan, `html` tegi bilan yozilgan literal ichini ba'zi formatlovchilar HTML sifatida formatlaydi. Teg funksiya qiymatlarni matndan **alohida** oladi, shuning uchun ularni satrga yopishtirishdan oldin qayta ishlay oladi (masalan, ekranlay oladi).

## Nega shunday

Satrlar o'zgarmas, chunki primitiv (25-bob). Bu ularni xavfsiz qiladi: satrni funksiyaga bersangiz, u asl qiymatni buza olmaydi. Narxi — har "o'zgarish" yangi satr yaratadi.

Template literal ikki muammoni hal qiladi: `+` bilan uzun birlashtirishni o'qish qiyinligi va ko'p qatorli satrlar. MDN: `+` bilan bir nechta ifodani birlashtirish o'qishga qiyin, `${}` esa o'qilishni yaxshilaydi.

## Muhandislik nuqtai nazari

### Foydalanuvchiga ko'rinadigan saralash — `localeCompare`

Ismlar, shaharlar, mahsulotlar ro'yxatini `sort()` bilan saralash katta harflarni oldinga chiqaradi va til qoidalarini e'tiborsiz qoldiradi. Foydalanuvchi ko'radigan har qanday ro'yxat uchun `localeCompare` yoki `Intl.Collator`. Ko'p elementli ro'yxatlarda bitta `Intl.Collator` obyektini yaratib, uning `compare` funksiyasini qayta ishlatish mumkin.

### Satrni yig'ib HTML yoki SQL qilmang

`` `<div>${foydalanuvchiMatni}</div>` `` yoki `` `SELECT ... WHERE nom = '${nom}'` `` — **inyeksiya** (injection) zaifligi: foydalanuvchi matni kod sifatida bajarilishi mumkin. SQL uchun parametrli so'rovlar, HTML uchun `textContent` yoki ekranlaydigan shablon kutubxonasi kerak.

### `includes` va `startsWith` — niyatni aniq ifodalaydi

`s.indexOf(x) !== -1` o'rniga `s.includes(x)`; `s.indexOf(x) === 0` o'rniga `s.startsWith(x)`. Kod nima qilayotgani o'qilganda darhol tushunarli.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `s.toUpperCase();` natijani saqlamasdan | `s` o'zgarmaydi | `s = s.toUpperCase()` |
| `if (s.indexOf(x))` | 0-indeksda `false` | `s.includes(x)` |
| `['b', 'A', 'a'].sort()` | `['A', 'a', 'b']` — kod tartibi | `localeCompare` |
| `'10' < '9'` | `true` | Avval `Number()` |
| `s.replace('a', 'b')` hammasini almashtiradi deb o'ylash | Faqat birinchisi | `replaceAll` |
| `substr` ishlatish | Eskirgan, Annex B | `slice` |
| `'...' + qiymat` o'rniga template literal ishlatmaslik | O'qish qiyin, `valueOf` chalkashligi | `` `...${qiymat}` `` |
| Template literal bilan SQL/HTML yig'ish | Inyeksiya | Parametr / ekranlash |

## Amaliyot

1. `bosh(s)` funksiyasini yozing: satrning birinchi harfini katta qilsin (`'toshkent'` → `'Toshkent'`). Bo'sh satrda xato bermasin.
2. `'2026-10-15'` satridan yil, oy, kunni `split` va `slice` bilan ikki xil usulda ajrating.
3. `['Zafar', 'aziz', 'Bobur', 'ömer']` ni `sort()` va `localeCompare` bilan saralang. Farqni tushuntiring.
4. `qisqart(s, n)` — satr `n` dan uzun bo'lsa, kesib oxiriga `…` qo'shsin.
5. `pul` tegini yozing: `` pul`Narx: ${12000} so'm` `` → `"Narx: 12 000 so'm"` (raqamlarni `Intl.NumberFormat('uz-UZ')` bilan formatlasin).

## Rasmiy hujjat

- MDN — `String`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String>
- MDN — *Template literals*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals>
- MDN — `String.prototype.localeCompare()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare>
- MDN — `String.prototype.substring()` (`slice` bilan farqi): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring>
- MDN — `String.raw()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw>
- MDN — *Numbers and strings* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Numbers_and_strings>
- ECMA-262 — *String Objects*: <https://tc39.es/ecma262/2026/#sec-string-objects>

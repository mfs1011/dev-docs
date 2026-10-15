# 29 — Unicode va satr ichki tuzilishi

[← Oldingi: Satrlar](28-satrlar.md) · [Mundarija](README.md) · [Keyingi: Massivlar →](30-massivlar.md)

## Tushuncha

28-bobda `length` "belgilar soni" emasligini aytib o'tdik. Bu bob — nega shunday.

ECMA-262 (6.1.4 *The String Type*): satr — **16 bitli ishorasiz butun sonlarning** ("elementlar") tartiblangan ketma-ketligi. MDN: satrlar asosan **UTF-16 kod birliklari** (code units) ketma-ketligi sifatida ifodalanadi. Bitta kod birligi — aynan 16 bit, ya'ni ko'pi bilan 65 536 xil qiymat.

Uch xil "belgi" darajasini farqlash kerak:

| Daraja | Nima | Misol |
| --- | --- | --- |
| **Kod birligi** (code unit) | 16 bitli element; `length` va `s[i]` shuni sanaydi | `'😄'.length` — 2 |
| **Kod nuqtasi** (code point) | Bitta Unicode belgisi — 1 yoki 2 kod birligi | `[...'😄'].length` — 1 |
| **Grafema klasteri** (grapheme cluster) | Ko'zga **bitta belgi** bo'lib ko'rinadigan ketma-ketlik | `'👨‍👦'` — 3 kod nuqtasi, 1 ko'rinadigan belgi |

## Kod birligi va surrogate juftlar

MDN: 65 536 ta kod birligiga sig'adigan belgilar to'plami **asosiy ko'p tilli tekislik** (basic multilingual plane, BMP) deyiladi. Unga lotin, yunon, kirill alifbolari va ko'p Sharqiy Osiyo belgilari kiradi. Unicode esa ancha katta. Qo'shimcha belgilar UTF-16 da **surrogate juft** (surrogate pair) — ikkita 16 bitli kod birligi bilan saqlanadi:

- **boshlovchi** (leading, high) surrogate: `0xD800`–`0xDBFF`;
- **yakunlovchi** (trailing, low) surrogate: `0xDC00`–`0xDFFF`.

Bu oraliqlar yakka belgilar uchun ishlatilmaydi, shuning uchun chalkashlik bo'lmaydi.

```js
const s = 'A😄';
console.log(s.length, [...s].length, s.split(''));
console.log(s.charCodeAt(1).toString(16), s.charCodeAt(2).toString(16), s.codePointAt(1).toString(16), s.codePointAt(2).toString(16));
console.log('A', '\u{1F604}', '\u{1F604}' === '😄', String.fromCodePoint(0x1F604));
for (const b of s) console.log('for...of:', b);
console.log(s.slice(0, 2), s.at(-1));
```

```text
$ node birlik.mjs
3 2 [ 'A', '\ud83d', '\ude04' ]
d83d de04 1f604 de04
A 😄 true 😄
for...of: A
for...of: 😄
A� �
```

- `length` — 3: `A` (1) + `😄` (2 kod birligi).
- `split('')` — MDN: **kod birliklari** bo'yicha bo'ladi va surrogate juftni ikkiga ajratadi.
- `charCodeAt(i)` — kod birligini, `codePointAt(i)` — shu joydan boshlanadigan **kod nuqtasini** qaytaradi. Juftning o'rtasida (`codePointAt(2)`) — faqat yakunlovchi yarmi.
- Yozish: `A` — aniq 4 ta o'n oltilik raqam (bitta kod birligi); `\u{1F604}` — 1–6 raqam (istalgan kod nuqtasi).
- MDN: satr **iteratori** (`for...of`, spread) **kod nuqtalari** bo'yicha yuradi — emoji butun qoladi.
- `slice(0, 2)` va `at(-1)` esa kod birliklari bilan ishlaydi — juftni kesib, `�` qoldirdi.

## Grafema klasterlari

MDN: ba'zi kod nuqtalari ketma-ketligi **bitta vizual birlik** sifatida ko'rinishi kerak — bu **grafema klasteri**. Eng ko'p uchraydigan holat — emoji: ko'p emoji variantlari aslida bir nechta emojidan tuzilgan va odatda **ZWJ** (zero-width joiner, `U+200D` — "nol kenglikdagi biriktiruvchi") bilan bog'langan. Bayroqlar esa ikkita "mintaqa ko'rsatkichi" harfidan iborat.

```js
const oila = '👨‍👦', bayroq = '🇺🇿', qol = '👉🏿';
console.log(oila.length, [...oila].length, bayroq.length, [...bayroq], [...qol]);
const seg = new Intl.Segmenter('uz', { granularity: 'grapheme' });
const sana = (t) => [...seg.segment(t)].length;
console.log(sana(oila), sana(bayroq), sana('Salom 👨‍👦🇺🇿'));
const sozlar = new Intl.Segmenter('uz', { granularity: 'word' });
console.log([...sozlar.segment("Bugun havo yaxshi, bo'ladi.")].filter(x => x.isWordLike).map(x => x.segment));
```

```text
$ node klaster.mjs
5 3 4 [ '🇺', '🇿' ] [ '👉', '🏿' ]
1 1 8
[ 'Bugun', 'havo', 'yaxshi', "bo'ladi" ]
```

- `'👨‍👦'` — 5 kod birligi, 3 kod nuqtasi (erkak + ZWJ + bola), lekin ekranda **bitta** belgi.
- `'🇺🇿'` — ikki mintaqa harfi (`U` va `Z`).
- `'👉🏿'` — qo'l + teri rangi modifikatori.
- MDN: grafema klasterlari bo'yicha yurish uchun **maxsus kod** kerak. **`Intl.Segmenter`** — MDN: tilga mos ravishda matnni ma'noli bo'laklarga — grafemalar, so'zlar yoki gaplarga — ajratadi. `'Salom 👨‍👦🇺🇿'` — ko'zga ko'rinadigan 8 belgi.
- `granularity: 'word'` — so'zlarga ajratish; `isWordLike` tinish belgilari va bo'sh joylarni chiqarib tashlaydi.

## Normalizatsiya

MDN (`normalize`): Unicode har belgiga **kod nuqtasi** beradi. Lekin ba'zan bitta "abstrakt belgi" bir necha xil ketma-ketlik bilan yozilishi mumkin. Masalan, `ñ`:

- bitta kod nuqtasi `U+00F1`;
- yoki `n` (`U+006E`) + birikuvchi tilda (`U+0303`).

```js
const a = 'ñ', b = 'ñ';
console.log(a, b, a === b, a.length, b.length);
console.log(a.normalize('NFD') === b.normalize('NFD'), a === b.normalize('NFC'), b.normalize('NFC').length);
console.log('ﬀ', 'ﬀ'.normalize('NFC'), 'ﬀ'.normalize('NFKC'), 'ﬀ'.normalize('NFKC').length);
```

```text
$ node normal.mjs
ñ ñ false 1 2
true true 1
ﬀ ﬀ ff 2
```

Ko'rinishi bir xil, lekin `===` — `false`, uzunligi ham har xil. `normalize()` satrni yagona shaklga keltiradi. MDN ikki asosiy turni ajratadi:

| Shakl | Asos | Nima qiladi |
| --- | --- | --- |
| `NFC` (standart) | Kanonik ekvivalentlik | Iloji bo'lsa **birlashtiradi** (`n` + tilda → `ñ`) |
| `NFD` | Kanonik ekvivalentlik | **Ajratadi** (`ñ` → `n` + tilda) |
| `NFKC` / `NFKD` | Moslik (compatibility) | Ko'rinishi farq qiladigan, lekin ma'nosi bir xil belgilarni ham birlashtiradi: `ﬀ` ligaturasi → `ff` |

MDN: kanonik ekvivalent ketma-ketliklar bir xil ko'rinishi va bir xil ishlashi kerak (masalan, bir xil saralanishi).

### O'zbek tilidagi apostroflar

O'zbek lotin yozuvida `oʻ`, `gʻ` va tutuq belgisi uchun turli belgilar ishlatiladi. Ular ko'zga o'xshaydi, lekin **har xil kod nuqtalari**:

```js
const variant = ["o'", 'oʻ', 'o‘', 'oʼ'];
console.log(variant.map(v => [...v].map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ')));
console.log(new Set(variant.map(v => v.normalize('NFKC'))).size);
```

```text
[ 'U+006F U+0027', 'U+006F U+02BB', 'U+006F U+2018', 'U+006F U+02BC' ]
4
```

`'` (`U+0027`, oddiy apostrof), `ʻ` (`U+02BB`), `‘` (`U+2018`, chap qo'shtirnoq), `ʼ` (`U+02BC`) — to'rt xil belgi. `NFKC` ham ularni **birlashtirmadi** — to'rttasi ham alohida qoldi. Shuning uchun `"o'g'il" === "oʻgʻil"` — `false`. Qidiruv yoki taqqoslashda bunday belgilarni o'zingiz bitta shaklga keltirishingiz kerak.

(5-bobda ko'rgan holat ham shundan: `ʻ` va `ʼ` — **harf** turkumidagi belgilar, shuning uchun o'zgaruvchi nomida ishlaydi. `'` va `‘` esa tinish belgisi, shuning uchun ishlamaydi.)

## Yakka surrogate'lar

MDN: **yakka surrogate** (lone surrogate) — jufti yo'q surrogate kod birligi. U hech qanday Unicode belgisini ifodalamaydi. JavaScript metodlarining ko'pi ular bilan to'g'ri ishlaydi, chunki hammasi UTF-16 kod birliklariga asoslangan. Lekin **boshqa tizimlar** bilan ishlashda muammo chiqadi: masalan, `encodeURI()` UTF-8 dan foydalanadi, UTF-8 da esa yakka surrogate'ni kodlash imkoni yo'q.

Yakka surrogate'siz satr **to'g'ri shakllangan** (well-formed) deyiladi:

```js
const yaxshi = 'ab😄', yomon = 'ab\uD83D';
console.log(yaxshi.isWellFormed(), yomon.isWellFormed(), yomon.toWellFormed().codePointAt(2).toString(16));
try { encodeURI(yomon); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(encodeURI(yomon.toWellFormed()));
console.log(new TextEncoder().encode(yaxshi).length, new TextEncoder().encode(yomon));
```

```text
$ node yakka.mjs
true false fffd
URIError: URI malformed
ab%EF%BF%BD
6 Uint8Array(5) [ 97, 98, 239, 191, 189 ]
```

- `isWellFormed()` — tekshiradi; `toWellFormed()` — yakka surrogate'larni `U+FFFD` (almashtirish belgisi `�`) bilan almashtiradi.
- `encodeURI` yakka surrogate'da `URIError` beradi.
- `TextEncoder` (satrni UTF-8 baytlariga aylantiradi) xato bermaydi, lekin yakka surrogate'ni jim `EF BF BD` (`U+FFFD`) ga almashtiradi — ma'lumot yo'qoladi.
- Yakka surrogate qayerdan paydo bo'ladi? Ko'pincha emoji'li satrni `slice` yoki `substring` bilan kod birligi chegarasidan kesishdan (yuqoridagi `s.slice(0, 2)`).

## Nega shunday

ECMA-262 satrni 16 bitli elementlar ketma-ketligi deb ta'riflaydi. `length`, indekslash va `charCodeAt` shu ta'rifga bog'langan, shuning uchun ular kod birliklarini sanaydi. Kod nuqtalari bilan ishlash uchun alohida vositalar bor: `codePointAt`, `String.fromCodePoint`, `\u{...}` va satr iteratori. Grafema klasteri esa til va mintaqa qoidalariga bog'liq — shuning uchun u `String` da emas, `Intl.Segmenter` da.

MDN yakka surrogate'lar haqida shunday deydi: ko'p o'rnatilgan metodlar ular bilan to'g'ri ishlaydi, chunki hammasi UTF-16 kod birliklariga asoslangan. Muammo faqat UTF-16 bilan ishlamaydigan funksiyalar (`encodeURI`, `TextEncoder`) bilan chegarada chiqadi. `isWellFormed`/`toWellFormed` aynan shu chegara uchun.

## Muhandislik nuqtai nazari

### Qaysi "uzunlik" kerak?

| Vazifa | Daraja | Vosita |
| --- | --- | --- |
| Bayt/xotira, boshqa API'lar bilan moslik | Kod birligi | `length` |
| Unicode belgilar soni | Kod nuqtasi | `[...s].length` |
| Foydalanuvchi ko'radigan belgilar ("140 belgi" chegarasi, kursor) | Grafema | `Intl.Segmenter` |
| Tarmoq/faylga yozish hajmi | UTF-8 bayt | `new TextEncoder().encode(s).length` |

### Kesishda ehtiyot bo'ling

Foydalanuvchi matnini qisqartirishda (`s.slice(0, 100) + '…'`) emoji yoki birikma belgi o'rtasidan kesilishi mumkin. Grafemalar bo'yicha kesing: `Intl.Segmenter` bo'laklaridan kerakli sonini oling va birlashtiring.

### Taqqoslashdan oldin normalizatsiya

Turli manbalardan (klaviaturalar, OS, nusxa-joylash) kelgan matn bir xil ko'rinsa ham turlicha kodlangan bo'lishi mumkin. Qidiruv, unikal kalit va login kabi joylarda saqlashdan va taqqoslashdan oldin bitta shaklga keltiring (`normalize('NFC')`). O'zbekcha apostroflarni esa alohida bir xillashtiring.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `s.length` ni ko'rinadigan belgilar soni deb hisoblash | Emoji'da noto'g'ri | `Intl.Segmenter` |
| `s.split('')` emoji'li satrda | Yakka surrogate'lar | `[...s]` yoki `Intl.Segmenter` |
| `s.slice(0, n)` foydalanuvchi matnida | Emoji o'rtasidan kesiladi | Grafemalar bo'yicha kesish |
| `'ñ' === 'ñ'` turli manbadan | `false` bo'lishi mumkin | `normalize('NFC')` |
| `"o'"` va `"oʻ"` ni bir xil deb o'ylash | Turli kod nuqtalari | Bir xillashtirish |
| `charCodeAt` bilan emoji kodini olish | Faqat surrogate yarmi | `codePointAt` |
| Yakka surrogate'li satrni `encodeURI` ga | `URIError` | `toWellFormed()` |

## Amaliyot

1. `'👍🏽'`, `'🇯🇵'`, `'é'` (bitta va ikki kod nuqtali variantlari) uchun `length`, `[...s].length` va grafema sonini jadvalga yozing.
2. `teskari(s)` funksiyasini yozing: `s.split('').reverse().join('')` emoji'li satrni buzishini ko'rsating, keyin grafemalar bo'yicha to'g'ri versiyasini yozing.
3. `oʻzbekcha(s)` funksiyasini yozing: `'`, `‘`, `ʼ` ning `o`/`g` dan keyingilarini `ʻ` ga, qolganlarini `ʼ` ga almashtirsin.
4. `qisqart(s, n)` ni grafemalar bo'yicha yozing (28-bob amaliyotining to'g'ri versiyasi).
5. `'Café'` ning NFC va NFD shakllarida `length` va UTF-8 bayt sonini solishtiring.

## Rasmiy hujjat

- MDN — `String` ("UTF-16 characters, Unicode code points, and grapheme clusters"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters>
- MDN — `String.prototype.normalize()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize>
- MDN — `String.prototype.isWellFormed()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/isWellFormed>
- MDN — `String.prototype.codePointAt()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt>
- MDN — `Intl.Segmenter`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter>
- ECMA-262 — *The String Type*: <https://tc39.es/ecma262/2026/#sec-ecmascript-language-types-string-type>

# 11 — Shartlar

[← Oldingi: Mantiqiy operatorlar va ??](10-mantiqiy-operatorlar.md) · [Mundarija](README.md) · [Keyingi: Sikllar →](12-sikllar.md)

## Tushuncha

Shart — "agar ... bo'lsa, buni qil, aks holda ...". JavaScript'da uchta vosita bor:

| Vosita | Turi | Qachon |
| --- | --- | --- |
| `if...else` | **instruksiya** | Umumiy holat: istalgan shartlar, istalgan amallar |
| `? :` (ternar) | **ifoda** — qiymat beradi | Ikki qiymatdan birini tanlash |
| `switch` | **instruksiya** | Bitta qiymatni ko'p variant bilan `===` bo'yicha solishtirish |

Uchala vositada ham shart **truthy/falsy** qoidasi bo'yicha baholanadi (7-bob): shart `true` bo'lishi shart emas, truthy bo'lishi yetarli. `switch` bundan istisno — u `===` ishlatadi (pastda).

## Kod: `if...else`

```js
function baho(ball) {
  if (ball >= 86) return "a'lo";
  else if (ball >= 71) return 'yaxshi';
  else if (ball >= 56) return 'qoniqarli';
  else return 'qoniqarsiz';
}
console.log([95, 75, 56, 30].map(baho));
```

```text
[ "a'lo", 'yaxshi', 'qoniqarli', 'qoniqarsiz' ]
```

MDN (*if...else*): shartlar **tartib bilan** tekshiriladi, birinchi `true` bo'lgani bajariladi va qolgan `else if` lar **o'tkazib yuboriladi**. Shuning uchun tartib muhim: `ball >= 56` ni birinchi qo'ysak, `95` ham "qoniqarli" bo'lib qolardi.

MDN yana bir narsani aytadi: JavaScript'da `elseif` (bitta so'z) kalit so'zi **yo'q**. `else if` — bu shunchaki `else` dan keyin kelgan yangi `if` instruksiyasi:

```text
if (shart1)                       if (shart1)
  amal1                             amal1
else if (shart2)        aslida →  else
  amal2                             if (shart2)
else                                  amal2
  amal3                             else
                                      amal3
```

### Blok `{ }` ishlating — "osilib qolgan else"

`if` tanasi — bitta instruksiya (3-bob). Bir nechta amal uchun blok `{ }` kerak. MDN bloksiz kodning xavfini ko'rsatadi:

```js
function tekshir(a, b) {
  if (a === 1)
    if (b === 2)
      console.log('a 1 va b 2');
  else
    console.log('a 1 emas');
}
tekshir(1, 3);
tekshir(2, 2);
```

```text
a 1 emas
```

Chekinish (indentatsiya) `else` ni tashqi `if` ga tegishli qilib ko'rsatadi, lekin MDN: **`else` doim eng yaqin `if` ga** biriktiriladi (*dangling else*). Natijada `tekshir(1, 3)` — "a 1 emas" (noto'g'ri!), `tekshir(2, 2)` esa hech narsa chiqarmadi. JavaScript chekinishga qaramaydi.

MDN tavsiyasi: **doim blok ishlating**, ayniqsa ichma-ich `if` larda.

## Kod: ternar operator `? :`

```js
const yosh = 17;
const holat = yosh >= 18 ? 'katta' : 'voyaga yetmagan';
console.log(holat);
```

```text
voyaga yetmagan
```

Ternar — **ifoda**: uni `const` ga berish, funksiya argumenti qilish, shablon ichiga qo'yish mumkin. `if` esa instruksiya — bunday qilib bo'lmaydi.

MDN: ternar operator **o'ngdan chapga** assotsiativ, shuning uchun uni `if...else if` zanjiri kabi ulash mumkin:

```js
const ball = 75;
const b = ball >= 86 ? "a'lo"
  : ball >= 71 ? 'yaxshi'
  : ball >= 56 ? 'qoniqarli'
  : 'qoniqarsiz';
console.log(b);
```

```text
yaxshi
```

Shu formatlash bilan zanjir o'qiladi. Lekin ichma-ich ternar (`a ? (b ? x : y) : z`) yoki uzun ifodalar tez chalkashadi — u holda `if` yoki alohida funksiya yaxshiroq.

## Kod: `switch`

MDN (*switch*): avval ifoda hisoblanadi, keyin qiymati unga **qat'iy teng** (`===`) bo'lgan birinchi `case` topiladi va boshqaruv o'sha joyga o'tadi — **undan keyingi barcha instruksiyalar** bajariladi.

```js
function kun(n) {
  switch (n) {
    case 6:
    case 7:
      return 'dam olish';
    case 1: case 2: case 3: case 4: case 5:
      return 'ish kuni';
    default:
      return 'noto\'g\'ri raqam';
  }
}
console.log(kun(6), kun(3), kun('3'), kun(9));
```

```text
dam olish ish kuni noto'g'ri raqam noto'g'ri raqam
```

- **`kun('3')` — topilmadi**: `'3' === 3` — `false`. `switch` tip aylantirmaydi (9-bob). Formadan kelgan qiymat bilan ishlaganda buni unutish oson.
- Bo'sh `case` lar ketma-ket — "6 yoki 7" degan ma'no.
- `default` — hech biri mos kelmasa. MDN: odatda oxirida yoziladi, lekin bu majburiy emas.

### `break` va "tushib ketish" (fall-through)

```js
const foo = 0;
switch (foo) {
  case -1: console.log('-1'); break;
  case 0: console.log(0);
  case 1: console.log(1); break;
  case 2: console.log(2); break;
  default: console.log('default');
}
```

```text
0
1
```

MDN: `break` bo'lmasa, ijro **keyingi `case` ga davom etadi** — uning qiymati mos kelmasa ham. Bu **fall-through** deyiladi. `case 0` da `break` unutilgan — `case 1` ham bajarildi. Funksiya ichida `return` ham `switch` dan chiqaradi (yuqoridagi `kun` funksiyasida shuning uchun `break` yo'q).

MDN yana bir nozik joyni ko'rsatadi: `case` ifodalari **faqat kerak bo'lganda** hisoblanadi — moslik topilgandan keyin, fall-through bilan o'tilsa ham, keyingi `case` ifodalari hisoblanmaydi:

```js
switch (undefined) {
  case console.log('case 1 ifodasi'):
  case console.log('case 2 ifodasi'):
}
```

```text
case 1 ifodasi
```

(`console.log` `undefined` qaytaradi — birinchi `case` mos keldi, ikkinchisining ifodasi hisoblanmadi.)

### `case` scope yaratmaydi

MDN: `case` va `default` — label'larga o'xshaydi: ular boshqaruv sakrashi mumkin bo'lgan joylarni belgilaydi, lekin **o'z scope'ini yaratmaydi**. Butun `switch` tanasi — bitta blok:

```js
const amal = 'salom';
switch (amal) {
  case 'salom':
    const xabar = 'Assalomu alaykum';
    console.log(xabar);
    break;
  case 'xayr':
    const xabar = 'Xayr';
    console.log(xabar);
    break;
}
```

```text
    const xabar = 'Xayr';
          ^
SyntaxError: Identifier 'xabar' has already been declared
```

Yechim — har `case` ni blokka o'rash:

```js
switch (amal) {
  case 'salom': {
    const xabar = 'Assalomu alaykum';
    console.log(xabar);
    break;
  }
  case 'xayr': {
    const xabar = 'Xayr';
    console.log(xabar);
    break;
  }
}
```

### `switch (true)`

MDN `if...else` zanjiriga muqobil sifatida bunday shaklni ham ko'rsatadi:

```js
switch (true) {
  case foo < 0: console.log('manfiy'); break;
  case foo === 0: console.log('nol'); break;
  default: console.log('musbat');
}
```

```text
nol
```

Har `case` ifodasi `true` ga `===` bo'yicha solishtiriladi — shuning uchun ular **haqiqiy boolean** qaytarishi kerak (truthy yetmaydi). MDN: bu pattern ayniqsa fall-through'dan foydalanmoqchi bo'lganda qulay. Lekin ko'pchilik uchun oddiy `if...else` o'qishga osonroq.

## Nega shunday

MDN `case` larni label'larga o'xshatadi: ular faqat boshqaruv "sakrashi" mumkin bo'lgan joylarni belgilaydi, o'z-o'zidan na scope yaratadi, na chiqib ketadi. Fall-through shundan kelib chiqadi. Bu ba'zi holatlarda qulay (bir nechta `case` ni birlashtirish), lekin unutilgan `break` — klassik xato; ESLint hujjati ham `switch` ni tilning "xatoga ko'proq moyil" konstruksiyalaridan biri deydi.

`if` va ternar shartni **truthy** bo'yicha baholaydi, `switch` esa `===` bo'yicha. Ikki xil qoida bitta tilda — shuning uchun `if (x)` va `switch (x) { case true: }` bir xil emas.

## Muhandislik nuqtai nazari

### Erta qaytish (early return)

Ichma-ich `if` lar o'rniga, nostandart holatlarni funksiya boshida qaytaring:

```js
// ❌ chuqur
function buyurtma(f) {
  if (f) {
    if (f.faol) {
      if (f.balans > 0) {
        return 'ruxsat';
      }
    }
  }
  return 'rad';
}

// ✅ tekis
function buyurtma(f) {
  if (!f) return 'rad';
  if (!f.faol) return 'rad';
  if (f.balans <= 0) return 'rad';
  return 'ruxsat';
}
```

Har bir shart alohida o'qiladi, "asosiy yo'l" esa oxirida aniq ko'rinadi.

### `switch` o'rniga obyekt

Qiymatdan qiymatga oddiy moslik uchun `switch` emas, **obyekt** yoki `Map` (33-bob) qisqaroq va xatosiz:

```js
const narxlar = { olma: 12000, nok: 15000 };
console.log(narxlar['nok'] ?? 'noma\'lum', narxlar['uzum'] ?? 'noma\'lum');
```

```text
15000 noma'lum
```

Unutiladigan `break` yo'q, ma'lumotni koddan ajratish oson. Lekin kalit foydalanuvchidan kelsa, `narxlar['__proto__']` yoki `narxlar['toString']` kabi meros xossalarni ham "topib" yuborishi mumkin — bunday holatlarda `Object.hasOwn` yoki `Map` ishlating (16- va 57-boblar).

### Fall-through ataylab bo'lsa — izoh

`break` ataylab qoldirilgan bo'lsa, buni izoh bilan belgilang. ESLint'ning `no-fallthrough` qoidasi izoh bilan belgilanmagan fall-through'ni xato deb ko'rsatadi; sukut bo'yicha u `// falls through` yoki `// fall through` kabi izohni taniydi (o'zbekcha izoh uchun `commentPattern` sozlamasi bor).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Bloksiz ichma-ich `if` + `else` | `else` eng yaqin `if` ga tegishli bo'ladi | Doim `{ }` |
| `else if` larda tartibni noto'g'ri qo'yish | Keng shart tor shartni "yutib yuboradi" | Torroq shartlarni oldin |
| `switch` da `break` unutish | Keyingi `case` lar ham bajariladi | `break` yoki `return` |
| `switch(input)` da `case 1:` (input — satr) | Hech qachon mos kelmaydi | `Number(input)` yoki `case '1':` |
| Ikki `case` da bir xil `const` nomi | `SyntaxError` | `case` ni `{ }` ga o'rash |
| `switch (true)` da truthy qiymat | `===` true emas — o'tkazib yuboriladi | Aniq boolean: `Boolean(...)`, taqqoslash |
| `if (x = 5)` (`===` o'rniga) | Tayinlash, doim truthy | `===`; linter (`no-cond-assign`) |

## Amaliyot

1. `if...else if` zanjiri bilan haroratni so'z bilan ifodalang: `< 0` — "sovuq", `0–15` — "salqin", `16–25` — "iliq", `> 25` — "issiq". Keyin xuddi shuni ternar zanjiri bilan yozing.
2. `switch` bilan oy raqamidan fasl nomini qaytaring (fall-through'dan foydalanib). `'3'` satr bilan chaqirganda nima bo'ladi? Tuzating.
3. MDN'dagi `checkValue` misolini bloklar bilan to'g'rilang, shunda chekinish ma'noga mos kelsin.
4. Quyidagi `switch` ni obyekt bilan qayta yozing:
   ```js
   switch (rol) {
     case 'admin': return 3;
     case 'muharrir': return 2;
     case 'oquvchi': return 1;
     default: return 0;
   }
   ```
5. Uch darajali ichma-ich `if` li funksiyangizni "erta qaytish" uslubiga o'tkazing.

## Rasmiy hujjat

- MDN — `if...else`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else>
- MDN — *Conditional (ternary) operator*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator>
- MDN — `switch`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch>
- MDN — *Control flow and error handling*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling>
- ECMA-262 — *The if Statement*: <https://tc39.es/ecma262/2026/#sec-if-statement>
- ECMA-262 — *The switch Statement*: <https://tc39.es/ecma262/2026/#sec-switch-statement>
- ESLint — `no-fallthrough`: <https://eslint.org/docs/latest/rules/no-fallthrough>

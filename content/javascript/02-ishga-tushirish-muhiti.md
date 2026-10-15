# 02 — Ishga tushirish muhiti

[← Oldingi: JavaScript, ECMAScript va TC39](01-javascript-va-ecmascript.md) · [Mundarija](README.md) · [Keyingi: Kod tuzilishi →](03-kod-tuzilishi.md)

## Tushuncha

1-bobda ko'rdik: JavaScript kodi doim biror **host** ichida ishlaydi. Bu qo'llanmada ikki host ishlatiladi:

- **Node.js** — kompyuterda, terminalda. Misollarning ko'pi shu yerda ishga tushirilgan (Node.js 26).
- **Brauzer** (Chrome) — sahifa ichida yoki DevTools konsolida. Brauzerga xos mavzularda (event loop, Worker'lar) ishlatiladi.

Har ikkalasida kod bilan ishlashning uch usuli bor:

| Usul | Node.js | Chrome |
| --- | --- | --- |
| Faylni bajarish | `node fayl.js` | `<script>` bilan sahifaga ulash |
| Interaktiv sinash (har qatorga darhol javob) | **REPL** — `node` | **Console** paneli |
| Kodni to'xtatib ichiga qarash | **Debugger** — `node inspect`, `--inspect` | **Sources** paneli, breakpoint'lar |

**REPL** — *Read–Eval–Print Loop*: "o'qi — bajar — chiqar — takrorla". Ifodani yozasiz, u darhol hisoblanadi va natija chiqadi.

**Debugger** (tuzatuvchi) — dasturni ma'lum qatorda **to'xtatib**, shu paytdagi o'zgaruvchilar qiymatini ko'rish, qatorma-qator yurish vositasi. To'xtash nuqtasi **breakpoint** deyiladi.

## Nega shunday: `console.log` yetmaydimi?

Chrome DevTools hujjati breakpoint'larning `console.log()` dan ustunligini shunday tushuntiradi:

- `console.log()` bilan manba kodni qo'lda ochib, kerakli joyga chiqarish qo'yishingiz kerak. Breakpoint bilan kod qanday tuzilganini bilmasdan ham kerakli joyda to'xtash mumkin.
- `console.log()` da qaysi qiymatlarni chiqarishni oldindan aniqlaysiz. Breakpoint'da DevTools **o'sha paytdagi barcha o'zgaruvchilar** qiymatini ko'rsatadi — kutmagan qiymat ham ko'rinadi.

Shunga qaramay ikkalasi ham kerak: tez tekshiruv uchun `console.log` va REPL, "nega bunday bo'ldi?" degan jumboq uchun debugger.

## Kod: Node.js'da faylni bajarish

```js
// salom.js
console.log("salom")
```

```text
$ node salom.js
salom
```

Kichik ifodalar uchun fayl kerak emas:

```text
$ node -e "console.log(2 ** 53)"
9007199254740992

$ node -p "typeof globalThis"
object
```

- `-e` (`--eval`) — berilgan satrni kod sifatida bajaradi;
- `-p` (`--print`) — bajaradi va natijani chiqaradi;
- `-c` (`--check`) — faylni **bajarmasdan** faqat sintaksisini tekshiradi.

```text
$ node --check buzuq.js
.../buzuq.js:1
console.log("x"
            ^^^

SyntaxError: missing ) after argument list
```

Yana ikki foydali bayroq (`node --help`): `--watch` — fayl o'zgarganda qayta ishga tushiradi; `-i` — har doim REPL'ga kiradi.

**Fayl kengaytmasi haqida.** `.mjs` fayl Node.js'da doim **ES modul**, `.cjs` — doim **CommonJS**. `.js` esa `package.json` dagi `"type"` maydoniga bog'liq; u yo'q bo'lsa, Node.js kodni ko'rib chiqadi va ES modul sintaksisi (`import`/`export`) topilsa, ES modul deb hisoblaydi (Node.js *Packages* hujjati, "Syntax detection", v22.7.0 dan sukut bo'yicha yoqilgan). Bu qo'llanmada aniqlik uchun ES modul misollari `.mjs` bilan nomlanadi. Farqi 83- va 86-boblarda. Hozircha bitta narsa muhim: ES modul avtomatik ravishda strict mode'da ishlaydi (4-bob).

## Kod: Node.js REPL

Terminalda shunchaki `node` deb yozing. Quyida — Node 26 dagi haqiqiy sessiya:

```text
$ node
Welcome to Node.js v26.12.0.
Type ".help" for more information.
> [ 'a', 'b', 'c' ]
[ 'a', 'b', 'c' ]
> _.length
3
> 2 ** 10
1024
> await Promise.resolve(123)
123
> const nom = 'Ali'
undefined
> nom.toUpperCase()
'ALI'
> throw new Error('xato')
Uncaught Error: xato
> _error.message
'xato'
> .exit
```

Nimani ko'rdik (Node.js REPL hujjati bo'yicha):

- **`_` (pastki chiziq)** — oxirgi hisoblangan ifoda natijasi. Unga o'zingiz qiymat bersangiz, bu xususiyat o'chadi.
- **`_error`** — oxirgi ko'rilgan xato.
- **`await` yuqori darajada ishlaydi** — oddiy skriptda bunday qilib bo'lmaydi (75-bob), REPL'da esa sinash uchun yoqilgan.
- `const nom = 'Ali'` — **`undefined`** chiqardi. Bu xato emas: e'lon qilish (declaration) instruksiyasi qiymat qaytarmaydi. Ifoda (`nom.toUpperCase()`) esa qiymat qaytaradi. Farqi 3-bobda.

REPL buyruqlari va tugmalari:

| Buyruq / tugma | Vazifasi |
| --- | --- |
| `.help` | Maxsus buyruqlar ro'yxati |
| `.editor` | Ko'p qatorli kod yozish rejimi (`Ctrl+D` — bajarish) |
| `.break` yoki `Ctrl+C` | Yarim yozilgan ko'p qatorli ifodani bekor qilish |
| `.save fayl.js` / `.load fayl.js` | Sessiyani faylga saqlash / fayldan yuklash |
| `.exit`, `Ctrl+D`, bo'sh qatorda ikki marta `Ctrl+C` | Chiqish |
| `Tab` | Avtomatik to'ldirish; bo'sh qatorda — global va lokal o'zgaruvchilar |
| `Ctrl+R` | Tarixdan qidirish (reverse-i-search) |

**REPL va `const` haqida ogohlantirish.** Hujjat aytadi: REPL'da `await` ishlatish `const` ning leksik scope qoidalarini buzadi — `const m = await ...` dan keyin `m` ga yangi qiymat berish mumkin bo'lib qoladi. Ya'ni REPL'dagi xulq har doim ham haqiqiy dasturdagi bilan bir xil emas. Til qoidasini tekshirayotganda natijani **fayl** bilan ham tasdiqlang.

## Kod: Chrome Console

Chrome DevTools hujjati: Console'ning ikki asosiy vazifasi bor — **yozilgan xabarlarni ko'rish** va **JavaScript bajarish**.

Ochish (DevTools hujjati, *Open Chrome DevTools*):

| OS | Console'ni ochish | Oxirgi panel |
| --- | --- | --- |
| Mac | `Cmd + Option + J` | `Cmd + Option + I` yoki `Fn + F12` |
| Windows / Linux | `Ctrl + Shift + J` | `Ctrl + Shift + I` yoki `F12` |

Eslab qolish uchun: **J — JavaScript**.

Console'da yozilgan kod **ochiq sahifa konteksti**da bajariladi — `document`, `window` va sahifadagi global o'zgaruvchilar mavjud. Node REPL'da esa ular yo'q (1-bob). `console.table()` kabi metodlar massiv va obyektlarni jadval ko'rinishida chiqaradi.

## Kod: debugger bilan xato topish

Mana xatoli funksiya — sonlarning o'rtachasini hisoblashi kerak:

```js
// ortacha.js
function ortacha(sonlar) {
  let jami = 0;
  for (let i = 0; i <= sonlar.length; i++) {
    jami += sonlar[i];
  }
  debugger;
  return jami / sonlar.length;
}

console.log(ortacha([4, 8, 6]));
```

```text
$ node ortacha.js
NaN
```

6 kutilgan edi, `NaN` chiqdi. Kodga `debugger;` instruksiyasini qo'ydik — debugger ulangan bo'lsa, ijro shu yerda to'xtaydi (ulanmagan bo'lsa, hech narsa qilmaydi). Endi Node.js'ning ichki debugger'i bilan ishga tushiramiz. `NODE_INSPECT_RESUME_ON_START=1` — birinchi qatorda emas, birinchi `debugger` da to'xtash (Node.js *Debugger* hujjati):

```text
$ NODE_INSPECT_RESUME_ON_START=1 node inspect ortacha.js
< Debugger listening on ws://127.0.0.1:9229/edc1717b-cbe4-4287-9cd3-1529e4c679e1
< For help, see: https://nodejs.org/learn/getting-started/debugging
<
connecting to 127.0.0.1:9229 ... ok
< Debugger attached.
<
debug> break in ortacha.js:6
  4     jami += sonlar[i];
  5   }
> 6   debugger;
  7   return jami / sonlar.length;
  8 }
debug> exec jami
NaN
debug> exec sonlar
[ 4, 8, 6 ]
debug> exec sonlar[3]
undefined
debug> exec 4 + 8 + 6 + undefined
NaN
debug> bt
#0 ortacha ortacha.js:6:2
#1 (anonymous) ortacha.js:10:12
#2 (anonymous) node:internal/modules/cjs/loader:1965:13
...
debug> cont
< NaN
```

Tashxis bir necha qadamda chiqdi:

1. `jami` — `NaN`. Demak, yig'ish paytida nimadir buzilgan.
2. Massivda 3 ta element (indekslar 0, 1, 2), lekin `sonlar[3]` — `undefined`.
3. `4 + 8 + 6 + undefined` → `NaN`. Sikl shartida `i <= sonlar.length` — bitta ortiqcha qadam. To'g'risi: `i < sonlar.length`.

`bt` (backtrace) — **chaqiruvlar steki**: `ortacha` funksiyasini 10-qatordagi kod chaqirgan, undan pastda Node'ning modul yuklovchisi. Stek nima ekanini 40-bobda chuqur ko'ramiz.

Asosiy debugger buyruqlari (Node.js hujjati):

| Buyruq | Vazifasi |
| --- | --- |
| `cont`, `c` | Davom ettirish |
| `next`, `n` | Keyingi qatorga |
| `step`, `s` | Funksiya ichiga kirish |
| `out`, `o` | Funksiyadan chiqish |
| `sb(line)` | Shu qatorga breakpoint; `sb('fayl.js', 1, 'num < 4')` — shartli |
| `watch(expr)` | Ifodani kuzatish ro'yxatiga qo'shish |
| `exec expr`, `p expr` | Ifodani to'xtagan joy kontekstida bajarish |
| `repl` | Shu kontekstda REPL ochish |
| `bt` | Chaqiruvlar steki |

Hujjat ochiq aytadi: bu ichki klient **to'liq funksiyali debugger emas**, oddiy qadamlash va tekshirish uchun. Kattaroq ish uchun grafik debugger ishlatiladi.

### Chrome DevTools bilan Node'ni debug qilish

```text
$ node --inspect-brk ortacha.js
```

- `--inspect` — inspector'ni yoqadi, sukut bo'yicha `127.0.0.1:9229` da tinglaydi;
- `--inspect-brk` — yoqadi va **foydalanuvchi kodi boshlanishidan oldin** to'xtaydi;
- `--inspect-wait` — debugger ulanishini kutadi.

So'ng Chrome'da `chrome://inspect` ni ochasiz — Node.js jarayoni "Remote Target" ro'yxatida chiqadi. Ochilgan oynada brauzerdagi kabi **Sources** paneli: qatorga bosib breakpoint qo'yish, **Scope** (to'xtagan paytdagi lokal va global o'zgaruvchilar), **Watch**, **Call stack**, qadamlash tugmalari (Step into, Step over). VS Code va JetBrains IDE'lari ham shu protokol orqali ulanadi.

## Muhandislik nuqtai nazari

### Debug portini ochiq qoldirmang

Node.js *Debugging* qo'llanmasi xavfsizlik haqida qat'iy ogohlantiradi:

- debugger Node.js jarayoniga **to'liq kirish** huquqiga ega — portga ulana olgan kishi jarayon nomidan **istalgan kodni bajara oladi**;
- inspector'ni ommaviy IP manzilga yoki `0.0.0.0` ga bog'lash **xavfli** — manzilingizga yeta oladigan har kim cheklovsiz ulanadi;
- sukut bo'yicha `127.0.0.1` ga bog'lanadi, lekin hatto shunda ham **kompyuteringizdagi har qanday lokal dastur** unga to'liq kira oladi — bu atayin shunday qilingan.

Amaliy qoida: production serverda `--inspect` ni doimiy yoqib qo'ymang; masofadan debug kerak bo'lsa, portni tashqariga ochmasdan SSH tunnel kabi usul bilan ulaning (qo'llanmadagi "Enabling remote debugging scenarios" bo'limi).

### REPL — tajriba uchun, fayl — isbot uchun

REPL bir qator tekshiruv uchun eng tez yo'l. Lekin u ba'zi qoidalarni yumshatadi (yuqori darajadagi `await`, `const` ni qayta e'lon qilish) va natijani avtomatik chiqaradi. Bu qo'llanmada til xulqi haqidagi har bir da'vo **fayl sifatida ishga tushirilgan** kod bilan tasdiqlanadi.

### `debugger;` ni kodda qoldirmang

`debugger` instruksiyasi tool ulanmaganda hech narsa qilmaydi, lekin brauzerda DevTools ochiq bo'lsa sahifani to'xtatib qo'yadi. Production kodiga tushib qolmasligi kerak — masalan, ESLint'ning `no-debugger` qoidasi buni ushlaydi.

## Tipik xatolar

| Xato | Nega bo'ladi | To'g'ri yo'l |
| --- | --- | --- |
| REPL'da ishlagan kod faylda ishlamaydi | REPL `await` va `const` qoidalarini yumshatadi | Faylda tekshiring |
| `const x = 1` → `undefined` chiqdi, "xato" deb o'ylash | E'lon qilish instruksiyasi qiymat qaytarmaydi | Ifoda va instruksiya farqi (3-bob) |
| Node'da `document is not defined` | DOM — brauzer host'ida | Kod qaysi host uchun ekanini aniqlang (1-bob) |
| `--inspect=0.0.0.0` bilan serverni qoldirish | Tarmoqdagi har kim kod bajara oladi | Faqat `127.0.0.1` + SSH tunnel |
| Hamma narsani `console.log` bilan qidirish | Kutilmagan qiymat chiqarilmaydi | Breakpoint va Scope paneli |

## Amaliyot

1. `node` ni ishga tushiring va `.help` ni bajaring. `.editor` rejimida ikki qatorli funksiya yozib, uni chaqiring.
2. REPL'da `0.1 + 0.2` ni hisoblang, keyin `_ === 0.3` ni tekshiring. Natijani tushuntira olasizmi? (26-bobda javob.)
3. `ortacha.js` dagi xatoni tuzating va `node --check` hamda `node ortacha.js` bilan tekshiring.
4. `node --inspect-brk ortacha.js` ni ishga tushirib, `chrome://inspect` orqali ulaning. 4-qatorga breakpoint qo'yib, har aylanishda `i` va `jami` qiymatini **Scope** panelida kuzating.
5. Istalgan saytda Console'ni oching (`Cmd/Ctrl + Option/Shift + J`) va `document.title` ni bajaring. Xuddi shuni Node REPL'da bajaring — farqini tushuntiring.

## Rasmiy hujjat

- Node.js — *REPL*: <https://nodejs.org/api/repl.html>
- Node.js — *Debugger*: <https://nodejs.org/api/debugger.html>
- Node.js — *Debugging Node.js* (inspector, xavfsizlik): <https://nodejs.org/en/learn/getting-started/debugging>
- Node.js — *Command-line API*: <https://nodejs.org/api/cli.html>
- Chrome DevTools — *Console overview*: <https://developer.chrome.com/docs/devtools/console>
- Chrome DevTools — *Open Chrome DevTools*: <https://developer.chrome.com/docs/devtools/open>
- Chrome DevTools — *Debug JavaScript*: <https://developer.chrome.com/docs/devtools/javascript>
- MDN — `debugger`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger>
- Node.js — *Packages* ("Determining module system", "Syntax detection"): <https://nodejs.org/api/packages.html>
- ESLint — `no-debugger`: <https://eslint.org/docs/latest/rules/no-debugger>

# 01 — JavaScript, ECMAScript va TC39

[← Mundarija](README.md) · [Keyingi: Ishga tushirish muhiti →](02-ishga-tushirish-muhiti.md)

## Tushuncha

"JavaScript" deganda ko'pincha ikki xil narsa aralashib ketadi:

1. **Tilning o'zi** — sintaksis, tiplar, funksiyalar, obyektlar, `Promise`, `Array` metodlari. Bu qism **standart** bilan belgilangan va standartning nomi — **ECMAScript**.
2. **Til ishlayotgan muhit imkoniyatlari** — brauzerda `document`, `window`, `fetch`; Node.js'da `process`, `fs`. Bular tilning qismi emas, ularni **muhit** (host) qo'shadi.

MDN buni aniq ajratadi: brauzer kontekstidagi "JavaScript" atamasi ichida bir-biridan juda farq qiladigan qismlar bor — biri asosiy til (ECMAScript), boshqasi Web API'lar to'plami, jumladan DOM.

Bu qo'llanma **birinchi qism — tilning o'zi** haqida. Brauzer API'lari faqat til mexanizmini tushuntirish uchun kerak bo'lgan joyda (masalan, event loop) uchraydi.

### ECMAScript nima

**ECMAScript** — JavaScript tilining rasmiy standarti. U **ECMA-262** raqamli hujjat sifatida chiqadi. Standartni Ecma International tashkilotidagi **TC39** qo'mitasi (Technical Committee 39) ishlab chiqadi.

MDN: "ECMAScript" — til standartining nomi, lekin "ECMAScript" va "JavaScript" so'zlarini bir-birining o'rnida ishlatish mumkin.

ECMAScript nimalarni belgilaydi (MDN ro'yxati):

- til sintaksisi — parsing qoidalari, kalit so'zlar, boshqaruv oqimi, obyekt literallari;
- xatolarni boshqarish — `throw`, `try...catch`, o'z `Error` tiplarini yaratish;
- tiplar — boolean, number, string, function, object va boshqalar;
- prototiplarga asoslangan meros mexanizmi;
- built-in obyekt va funksiyalar — `JSON`, `Math`, `Array` metodlari, `parseInt`, `decodeURI`;
- strict mode;
- modul tizimi;
- asosiy xotira modeli.

E'tibor bering: ro'yxatda `setTimeout`, `console`, `fetch`, `document` **yo'q**. Ular host'niki.

### Engine va host

MDN (*JavaScript execution model*): JavaScript kodini bajarish uchun ikki dastur birga ishlaydi:

- **JavaScript engine** (dvigatel) — ECMAScript tilini amalga oshiradi: manba kodni oladi, tahlil qiladi (parse) va bajaradi. Masalan, Chrome va Node.js'dagi **V8**.
- **Host muhit** (host environment) — tashqi dunyo bilan aloqani beradi: ekranga chiqarish, tarmoq, fayllar, xavfsizlik va unumdorlik mexanizmlari. Brauzerda host — HTML DOM, serverda — Node.js.

```text
┌──────────────── Host (brauzer yoki Node.js) ───────────────┐
│  setTimeout, console, fetch          brauzer: window,       │
│  event loop                          document               │
│                                      Node: process, fs      │
│   ┌──────────── Engine (masalan, V8) ──────────────┐        │
│   │  ECMAScript: sintaksis, tiplar, Object, Array, │        │
│   │  Promise, JSON, Math, Map, class, modullar...  │        │
│   └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

Shuning uchun bir xil kod bir muhitda ishlab, boshqasida ishlamasligi mumkin: `document.querySelector` Node.js'da yo'q, `require('fs')` brauzerda yo'q. Til bir xil — host har xil.

### Qisqa tarix (ECMA-262 kirish qismidan)

- Tilni Netscape'da **Brendan Eich** yaratgan, u birinchi marta Navigator 2.0 brauzerida paydo bo'lgan. ECMAScript bir nechta texnologiyaga asoslangan, eng mashhurlari — JavaScript (Netscape) va JScript (Microsoft).
- Standart ustida ish **1996-yil noyabrda** boshlangan; birinchi nashr **1997-yil iyunda** qabul qilingan.
- **3-nashr** (1999-yil dekabr) — regular expression'lar, `try/catch`, yaxshiroq satr ishlash.
- **4-nashr** tugallanmagan va chiqarilmagan; uning bir qismi keyin 6-nashrga kirgan.
- **5-nashr** (2009-yil dekabr) — accessor xossalar (getter/setter), xossa atributlarini boshqarish, `JSON`, **strict mode**.
- **6-nashr — ES2015** (2015-yil iyun) — "o'n besh yillik harakatning cho'qqisi": modullar, `class`, blok scope (`let`/`const`), iterator va generatorlar, `Promise`, destructuring, `Map`/`Set`, typed array'lar.
- **ES2016** dan boshlab — **har yili** yangi nashr va GitHub'da ochiq ishlab chiqish.
- **ES2017** — `async` funksiyalar, umumiy xotira va `Atomics`.

### Nashrlarning nomlanishi

MDN: ES6 dan oldin nashrlar bir necha yilda bir marta chiqqan va raqami bilan atalgan — ES3, ES5. ES6 dan keyin nashr **yili** bilan ataladi: ES2017, ES2018... **ES6 = ES2015**. *ESNext* — "keyingi versiya" degan o'zgaruvchan nom; aniqrog'i, bunday imkoniyatlar hali **taklif** (proposal).

Ecma rasmiy sahifasidagi ro'yxat (oxirgilari):

| Nashr | Nomi | Qabul qilingan |
| --- | --- | --- |
| 14-nashr | ES2023 | 2023-yil iyun |
| 15-nashr | ES2024 | 2024-yil iyun |
| 16-nashr | ES2025 | 2025-yil iyun |
| **17-nashr** | **ES2026** | 2026-yil (joriy nashr) |

TC39 jarayon hujjati: qo'mita har yili **iyul**da yangi spetsifikatsiyani Ecma Bosh Assambleyasiga tasdiqlash uchun topshirishni maqsad qiladi. Taxminiy jadval: 1-fevral — nomzod qoralama; mart majlisi — Stage 4 takliflar qo'shiladi va yangi versiya ajratiladi (shundan keyin faqat tahririy o'zgarishlar); aprel–iyun — Ecma ko'rib chiqishi; iyul — tasdiqlash.

**Ikki manzil:**

- <https://tc39.es/ecma262/> — **doim yangilanib turadigan qoralama** (hozir "ECMAScript 2027");
- <https://tc39.es/ecma262/2026/> — **tasdiqlangan** 2026 nashri.

Shu bilan birga **ECMA-402** — Internationalization API (`Intl`) spetsifikatsiyasi. U ham TC39'niki va har yili yangilanadi (39-bob).

## Nega shunday: TC39 jarayoni

Yangi imkoniyat tilga qanday kiradi? TC39 jarayon hujjati: o'zgarishlar **takliflar** (proposals) orqali kiradi va **olti bosqich**dan o'tadi — bitta "strawperson" bosqichi va beshta yetuklik bosqichi. Har bosqichga o'tishni qo'mita tasdiqlaydi, qarorlar **konsensus** bilan qabul qilinadi.

| Bosqich | Holati | Asosiy shart (qisqartirib) |
| --- | --- | --- |
| **0** | Yangi g'oya, qo'mita hali ko'rib chiqmaydi | Shart yo'q |
| **1** | Ko'rib chiqilmoqda: muammo va yechimlar maydoni o'rganiladi | Mas'ul shaxs (champion), muammo tavsifi, ochiq repozitoriy |
| **2** | Afzal yechim tanlangan, dizayn — qoralama, jiddiy o'zgarishi mumkin | Barcha API va sintaksis tavsifi, boshlang'ich spetsifikatsiya matni |
| **2.7** | Printsipial tasdiqlangan, tekshirilmoqda | To'liq spetsifikatsiya matni, taqrizchilar va muharrirlar roziligi |
| **3** | Amalga oshirish uchun tavsiya etilgan | Yetarli testlar |
| **4** | Tayyor, standartga kiradi | **Ikki mos amalga oshirish** Test262 testlaridan o'tadi, real foydalanish tajribasi, `ecma262` ga pull request |

MDN: odatda engine'lar imkoniyatni **Stage 3 yoki 4** da amalga oshiradi va shundan keyin u ommaga ochiladi.

Bundan uchta amaliy xulosa:

1. **Stage 3 dan oldingi taklifga tayanmang.** Stage 2 da dizayn "jiddiy o'zgarishi mumkin". Babel yoki TypeScript'da erta imkoniyatni yoqish — kelajakda kodni qayta yozish xavfi.
2. **Stage 4 = standartga kirdi, lekin nashr keyinroq.** Masalan, Temporal va `using` Stage 4 ga yetgan, lekin TC39 ro'yxatida ular **2027** nashriga belgilangan.
3. **Standartda bor ≠ sizning muhitingizda bor.** Har engine o'z vaqtida qo'shadi — buni pastda haqiqiy misolda ko'rasiz.

Taklif repozitoriylari va yakunlangan takliflar ro'yxati — <https://github.com/tc39/proposals>. Standartga muvofiqlik testlari to'plami — **Test262** (<https://github.com/tc39/test262>).

## Kod: engine va host'ni ko'rish

Bu qo'llanmadagi misollar **Node.js 26** da ishga tushirilgan (versiya tanlovi — [README](README.md)).

```js
// engine.mjs
console.log('Node:', process.versions.node);
console.log('V8:  ', process.versions.v8);
```

```text
$ node engine.mjs
Node: 26.12.0
V8:   14.6.202.34-node.39
```

Node.js — host, V8 — uning ichidagi engine. `process` obyektining o'zi host'ga tegishli.

Endi qaysi narsa tildan, qaysi biri host'dan ekanini tekshiramiz:

```js
// host.mjs
// ECMAScript belgilagan narsalar — har qanday hostda bor
console.log('Array    ', typeof Array);
console.log('JSON     ', typeof JSON);
console.log('Promise  ', typeof Promise);
// Host qo'shgan narsalar
console.log('setTimeout', typeof setTimeout);
console.log('process  ', typeof process);
console.log('window   ', typeof window);
console.log('document ', typeof document);
```

```text
$ node host.mjs
Array     function
JSON      object
Promise   function
setTimeout function
process   object
window    undefined
document  undefined
```

- `Array`, `JSON`, `Promise` — ECMAScript'dan, ular brauzerda ham, Node'da ham bor.
- `setTimeout` — tilda yo'q, lekin ikkala host ham beradi. MDN: `setTimeout()` dastlab HTML Standard'da `Window` interfeysi uchun spetsifikatsiya qilingan; brauzer bo'lmagan muhitlar (Node.js kabi) odatda DOM'ga ega emas, lekin ko'p Web API'larni — `fetch()`, `setTimeout()` — amalga oshiradi.
- `process` — faqat Node.js'da; `window` va `document` — faqat brauzerda.

`typeof` noma'lum o'zgaruvchi uchun xato bermaydi, `"undefined"` qaytaradi — shuning uchun muhitni tekshirishda qulay (6-bob).

## Kod: standartda bor, muhitda bormi?

ES2025 va ES2026 imkoniyatlarini Node 26 da tekshiramiz:

```js
// features.mjs
// ES2025
console.log('Promise.try        ', typeof Promise.try);
console.log('RegExp.escape      ', typeof RegExp.escape);
// ES2026
console.log('Math.sumPrecise    ', typeof Math.sumPrecise);
console.log('Error.isError      ', typeof Error.isError);
console.log('Iterator.concat    ', typeof Iterator.concat);
console.log('Map getOrInsert    ', typeof Map.prototype.getOrInsert);
console.log('Uint8Array.fromBase64', typeof Uint8Array.fromBase64);
// ES2027 (yakunlangan, nashr hali chiqmagan)
console.log('Temporal           ', typeof globalThis.Temporal);
console.log('DisposableStack    ', typeof globalThis.DisposableStack);
```

```text
$ node features.mjs
Promise.try         function
RegExp.escape       function
Math.sumPrecise     undefined
Error.isError       function
Iterator.concat     function
Map getOrInsert     function
Uint8Array.fromBase64 function
Temporal            object
DisposableStack     function
```

Ikki qiziq natija:

- **`Math.sumPrecise` — `undefined`.** U ES2026 standartida bor, lekin Node 26.12.0 (V8 14.6) da hali yo'q. Standart nashri va engine'dagi amalga oshirish — alohida jarayonlar.
- **`Temporal` va `DisposableStack` — bor.** Ular hali nashr qilinmagan ES2027 ga tegishli (Stage 4 ga yetgan), lekin V8'da allaqachon bor.

Xulosa: "qaysi ES versiyasini qo'llab-quvvatlaydi?" degan savol noto'g'ri. To'g'ri savol — **"shu aniq imkoniyat shu aniq muhitda bormi?"**. Kodda buni **imkoniyatni tekshirish** (feature detection) bilan hal qilinadi:

```js
const sum = typeof Math.sumPrecise === 'function'
  ? Math.sumPrecise(values)
  : values.reduce((a, b) => a + b, 0);   // aniqligi pastroq zaxira yo'l
```

Har bir imkoniyatning muhitlarda bor-yo'qligi MDN sahifasining pastidagi **"Browser compatibility"** jadvalida beriladi.

## Muhandislik nuqtai nazari

### Spetsifikatsiyani qachon o'qish kerak

Spetsifikatsiya o'quvchi uchun emas, **engine yozuvchilar** uchun yozilgan: u algoritmlar ko'rinishida ("1. Let x be ... 2. If ... return ..."). Lekin u **yagona yakuniy javob**. MDN yoki maqolalarda ikki xil gap uchrasa, spetsifikatsiya hal qiladi. Bu qo'llanmada "ichida nima bo'ladi" degan joylarda spetsifikatsiyaning aniq bo'limi ko'rsatiladi — masalan, 23-bobda `ToPrimitive`, 40-bobda *Execution Contexts*.

MDN har sahifa oxirida **"Specifications"** bo'limida spetsifikatsiyaning tegishli joyiga havola beradi — spetsifikatsiyaga eng qulay kirish yo'li.

### Til va host chegarasini bilish nima beradi

- **Xatoni to'g'ri joydan qidirasiz.** "`fetch` Node'da ishlamayapti" — bu til muammosi emas, host versiyasi masalasi.
- **Kod qayerda ishlashini rejalashtirasiz.** Faqat ECMAScript'ga tayangan modul (masalan, validatsiya funksiyasi) brauzerda ham, serverda ham, Worker'da ham ishlaydi.
- **Hujjatni to'g'ri joydan izlaysiz.** Til — MDN *JavaScript Reference* va ECMA-262; brauzer API — MDN *Web APIs* va WHATWG; Node API — nodejs.org/api.

### Transpilyatsiya va polyfill (oldindan)

Yangi sintaksisni (masalan, `class` maydonlari) eski engine tushunmaydi — uni **transpilyator** (Babel, TypeScript) eski sintaksisga o'giradi. Yangi **funksiya**ni (masalan, `Promise.try`) esa eski muhitga **polyfill** — JavaScript'da yozilgan o'rinbosar — qo'shib beradi. Bu 15-bobda batafsil.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri yo'l |
| --- | --- | --- |
| "`document` JavaScript'ning qismi" | DOM — brauzer host'ining API'si, ECMAScript'da yo'q | Til va host'ni ajrating; Node'da DOM yo'q |
| "ES6 — eng yangi JavaScript" | ES6 = ES2015; har yili yangi nashr chiqadi (hozir ES2026) | Nashrni yil bilan ayting |
| "Standartga kirdi, demak hamma joyda ishlaydi" | Engine'lar alohida qo'shadi (Node 26 da `Math.sumPrecise` yo'q) | MDN "Browser compatibility" va feature detection |
| Stage 1–2 taklifni production'da ishlatish | Dizayn hali o'zgarishi mumkin | Kamida Stage 3, yaxshisi Stage 4 |
| `tc39.es/ecma262/` ni "joriy standart" deb keltirish | U — kelgusi yil qoralamasi | Yilli manzil: `tc39.es/ecma262/2026/` |

## Amaliyot

1. O'z kompyuteringizda `node -p "process.versions.v8"` ni ishga tushiring. Qaysi V8 versiyasi?
2. `features.mjs` ni o'z Node versiyangizda ishga tushiring. Qaysi imkoniyatlar yo'q? MDN'da ularning "Browser compatibility" jadvalini toping.
3. Brauzer konsolida (`F12` → Console) `host.mjs` dagi qatorlarni bajaring. Natija Node'dan qanday farq qiladi?
4. <https://github.com/tc39/proposals> dan bitta Stage 3 taklifni tanlang. U qaysi muammoni hal qiladi va qaysi bosqichda turibdi?
5. MDN'dagi istalgan built-in metod sahifasining (masalan, `Array.prototype.at`) "Specifications" bo'limidagi havolani oching. Spetsifikatsiyadagi algoritm necha qadamdan iborat?

## Rasmiy hujjat

- ECMA-262 — *ECMAScript 2026 Language Specification* (Introduction): <https://tc39.es/ecma262/2026/>
- Ecma International — *ECMA-262* (nashrlar ro'yxati): <https://ecma-international.org/publications-and-standards/standards/ecma-262/>
- MDN — *JavaScript technologies overview*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/JavaScript_technologies_overview>
- MDN — *JavaScript execution model* ("The engine and the host"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model>
- TC39 — *The TC39 Process*: <https://tc39.es/process-document/>
- TC39 — *Finished Proposals*: <https://github.com/tc39/proposals/blob/main/finished-proposals.md>

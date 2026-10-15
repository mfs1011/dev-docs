# 34 — `WeakMap` va `WeakSet`

[← Oldingi: `Map` va `Set`](33-map-va-set.md) · [Mundarija](README.md) · [Keyingi: `Object.keys`, `values`, `entries` →](35-object-keys-values-entries.md)

## Tushuncha

18-bobda ko'rdik: `Map` kalit obyektni **kuchli** ushlaydi — obyektga boshqa hech qayerdan havola qolmasa ham, `Map` uni xotirada saqlab turadi. `WeakMap` va `WeakSet` — kalitlarni **kuchsiz** (weakly) ushlaydigan muqobillar.

MDN (`WeakMap`): `WeakMap` da kalit obyekt yig'ilmagunicha o'z qiymatiga **kuchli**, yig'ilgandan keyin esa kuchsiz bog'langan. Ya'ni `WeakMap`:

- garbage collection'ga **to'sqinlik qilmaydi**;
- kalit obyektiga `WeakMap` dan boshqa joyda havola bo'lmasa, uning **qiymatini** ham yig'ishga ruxsat beradi.

MDN: `WeakMap` ayniqsa kalitga oid ma'lumotni saqlashda foydali — bu ma'lumot **faqat kalit tirik ekan** kerak bo'lsa.

## Kod: API va cheklovlar

```js
const wm = new WeakMap();
const k = {};
wm.set(k, 'qiymat');
console.log(wm.get(k), wm.has(k), wm.has({}), wm.delete(k), wm.has(k));
console.log('size' in wm, typeof wm.keys, typeof wm.forEach, typeof wm[Symbol.iterator]);
try { wm.set('satr', 1); } catch (e) { console.log(e.name + ': ' + e.message); }
const ws = new WeakSet([k]);
console.log(ws.has(k));
```

```text
$ node api.mjs
qiymat true false true false
false undefined undefined undefined
TypeError: Invalid value used as weak map key
true
```

| | `Map` / `Set` | `WeakMap` / `WeakSet` |
| --- | --- | --- |
| Kalit (element) turi | Istalgan | Faqat obyekt va ro'yxatga olinmagan symbol |
| Havola | Kuchli | Kuchsiz |
| Metodlar | `get/set/has/delete`, `size`, `clear`, iteratsiya | Faqat `get/set/has/delete` (`WeakSet`: `add/has/delete`) |
| Aylanib chiqish | Mumkin | **Mumkin emas** |

Nega bunday cheklovlar (MDN):

- **Faqat yig'ilishi mumkin bo'lgan kalitlar.** Ko'p primitivlarni istalgan joyda qayta "yasash" mumkin va ularning yashash muddati yo'q — shuning uchun ular kalit bo'la olmaydi. Obyektlar va `Symbol()` bilan yaratilgan symbol'lar yig'iladi (22-bob).
- **Kalitlar ro'yxati yo'q.** Agar kalitlar ro'yxatini olish mumkin bo'lsa, u garbage collection holatiga bog'liq bo'lardi — natija **noaniq** (non-deterministic) bo'lib qolardi. Kalitlar ro'yxati kerak bo'lsa — `Map`.
- Kalit tengligi — `Map` dagi kabi SameValueZero, ya'ni amalda obyekt **o'ziga xosligi** (havola) bo'yicha.

## Nega oddiy `Map` yetmaydi

MDN `WeakMap` ni ikki massiv (kalitlar va qiymatlar) bilan yozilgan xayoliy `Map` bilan taqqoslaydi. Bunday amalga oshirishda ikki kamchilik bor:

1. **O(n) qidiruv** — har `get`/`set` hamma kalitlarni aylanib chiqadi.
2. **Xotira oqishi** — massivlar har kalit va qiymatga havolani **abadiy** ushlab turadi. Kalit obyektga boshqa hech qayerda havola qolmasa ham, u yig'ilmaydi — va uning qiymati ham.

`WeakMap` ikkinchi muammoni hal qiladi: kalit bilan birga qiymat ham yig'iladi. 18-bobdagi `qoladi.mjs` buni ko'zda ko'rsatgan edi: `Map` kaliti qoldi, `WeakMap` kaliti yig'ildi.

## Kod: obyekt bo'yicha kesh

MDN *Caching* misoli — natijani kirish **obyektiga** bog'lab saqlash:

```js
const royxat = new FinalizationRegistry(n => console.log('yig\'ildi:', n));
const kutish = async () => { await new Promise(r => setTimeout(r, 0)); globalThis.gc(); await new Promise(r => setTimeout(r, 10)); };
const kesh = new WeakMap();
let hisob = 0;
function statistika(massiv) {
  if (kesh.has(massiv)) return kesh.get(massiv);
  hisob++;
  const natija = { jami: massiv.reduce((a, b) => a + b, 0), soni: massiv.length };
  kesh.set(massiv, natija);
  return natija;
}
let malumot = [5, 10, 15];
royxat.register(malumot, 'malumot');
console.log(statistika(malumot), statistika(malumot), 'hisoblandi:', hisob);
malumot.push(20);
console.log(statistika(malumot), '— eskirgan!');
malumot = null;
await kutish();
console.log('tugadi');
```

```text
$ node --expose-gc kesh.mjs
{ jami: 30, soni: 3 } { jami: 30, soni: 3 } hisoblandi: 1
{ jami: 30, soni: 3 } — eskirgan!
yig'ildi: malumot
tugadi
```

- Ikkinchi chaqiruv keshdan oldi — hisob bitta.
- **Tuzoq**: kesh **havola** bo'yicha ishlaydi. Massivga `push` qilingandan keyin ham havola o'sha — kesh eskirgan natija qaytardi. Obyekt bo'yicha kesh faqat **o'zgarmas** (immutable) ma'lumot bilan to'g'ri ishlaydi.
- `malumot = null` dan keyin massiv yig'ildi — kesh yozuvi ham u bilan ketdi, kesh hech qachon o'sib ketmaydi. (GC kuzatuvi 18-bobdagi kabi `--expose-gc` bilan; natija V8 ning xatti-harakati, til kafolati emas.)

## Kod: halqali tuzilmalarni kuzatish

MDN *WeakSet* misoli — rekursiv funksiya allaqachon ko'rilgan obyektlarni eslab qolishi kerak, aks holda halqali tuzilmada cheksiz aylanadi:

```js
function chuqurNusxa(qiymat, korilgan = new WeakMap()) {
  if (typeof qiymat !== 'object' || qiymat === null) return qiymat;
  if (korilgan.has(qiymat)) return korilgan.get(qiymat);
  const nusxa = Array.isArray(qiymat) ? [] : {};
  korilgan.set(qiymat, nusxa);
  for (const k of Object.keys(qiymat)) nusxa[k] = chuqurNusxa(qiymat[k], korilgan);
  return nusxa;
}
const a = { nom: 'a', ichki: { son: 1 } };
a.ozi = a;
const b = chuqurNusxa(a);
console.log(b.ozi === b, b !== a, b.ichki !== a.ichki, b.ichki.son);
const tashrif = new WeakSet();
function yur(o, chuqurlik = 0) {
  if (tashrif.has(o)) return console.log(' '.repeat(chuqurlik) + '(halqa)');
  tashrif.add(o);
  for (const [k, v] of Object.entries(o)) {
    console.log(' '.repeat(chuqurlik) + k);
    if (typeof v === 'object' && v) yur(v, chuqurlik + 2);
  }
}
yur(a);
```

```text
$ node halqa.mjs
true true true 1
nom
ichki
  son
ozi
  (halqa)
```

- `chuqurNusxa` — `WeakMap` "asl obyekt → uning nusxasi" ni eslaydi. Halqaga qaytganda tayyor nusxani beradi, shuning uchun `b.ozi === b` — halqa nusxada ham saqlandi. (`structuredClone` ham halqalarni shunday saqlaydi — 17-bob.)
- `yur` — `WeakSet` "bu obyektni ko'rdimmi?" savoliga javob beradi.
- Nega `Weak`? Funksiya tugagach, ko'rilgan obyektlar ro'yxati hech kimga kerak emas — kuchsiz havolalar ularni ushlab qolmaydi.

## Kod: obyektga yashirin ma'lumot biriktirish

MDN *Emulating private members* va *Associating metadata*:

```js
const maxfiy = new WeakMap();
class Hisob {
  constructor(egasi, qoldiq) { this.egasi = egasi; maxfiy.set(this, { qoldiq }); }
  toldir(s) { maxfiy.get(this).qoldiq += s; return this; }
  get qoldiq() { return maxfiy.get(this).qoldiq; }
}
const h = new Hisob('Ali', 100).toldir(50);
console.log(h, h.qoldiq, Object.keys(h), Object.getOwnPropertySymbols(h), JSON.stringify(h));
```

```text
$ node yashirin.mjs
Hisob { egasi: 'Ali' } 150 [ 'egasi' ] [] {"egasi":"Ali"}
```

`qoldiq` obyektning o'zida **yo'q** — `Object.keys`, `getOwnPropertySymbols` va JSON uni ko'rmaydi. MDN `WeakMap` ning bu usuldagi afzalliklarini sanaydi:

- `Map` dan farqli — ma'lumot obyekt bilan **birga yashaydi va birga yo'qoladi**, oqish yo'q.
- Symbol xossadan farqli — `WeakMap` obyektdan **tashqarida**, `Object.getOwnPropertySymbols` kabi metodlar bilan olib bo'lmaydi.
- Closure'dan farqli — bitta `WeakMap` hamma nusxalar uchun yetadi.

Bugungi klasslarda bu vazifani `#private` maydonlar bajaradi — MDN ham yuqoridagi kodni xususiy maydonli klassga "taxminan teng" deydi (62-bob). `WeakMap` usuli esa **o'zingiz yaratmagan** obyektlarga (DOM elementlari, kutubxona obyektlari) ma'lumot biriktirish uchun hamon kerak: MDN misolida tugmalarning bosilganligi tugmaning o'ziga xossa sifatida emas, `WeakMap` da saqlanadi.

## Nega shunday

`WeakMap` faqat kuzatib bo'lmaydigan narsalarni beradi: kalitni bilsangiz qiymatni olasiz, bilmasangiz — hech narsa. MDN: kalitlarning tirikligini kuzatish imkoni yo'qligi uchun ularni sanab bo'lmaydi; sanash mumkin bo'lganda natija GC holatiga bog'liq bo'lardi. Bu 18-bobdagi umumiy qoidaning bir ko'rinishi: garbage collection imkon qadar **ko'rinmas** bo'lishi kerak.

## Muhandislik nuqtai nazari

### Qachon `WeakMap`

- Kalit — **obyekt**, va ma'lumot faqat obyekt tirik ekan kerak: kesh, metama'lumot, "ko'rilgan" belgilari.
- O'zingiz boshqarmaydigan obyektga ma'lumot biriktirish kerak.

### Qachon `Map`

- Kalitlarni **sanash**, aylanib chiqish yoki `size` kerak.
- Kalit — satr yoki son (masalan, URL, ID). `WeakMap` bunday kalitni qabul qilmaydi; satr kalitli keshga chegara qo'yish kerak (18-bob).

### Obyekt keshi va o'zgaruvchanlik

`WeakMap` keshi havola bo'yicha ishlaydi. Obyekt joyida o'zgartirilsa (`push`, xossa yozish), kesh eskiradi. Kesh qilinadigan ma'lumotni o'zgartirmang yoki o'zgartirganda kesh yozuvini `delete` qiling.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `weakMap.set('id', ...)` | `TypeError: Invalid value used as weak map key` | Obyekt kalit yoki `Map` |
| `weakMap.size`, `for...of weakMap` | `undefined` / `TypeError` | Sanash kerak bo'lsa `Map` |
| `Symbol.for('k')` ni kalit qilish | `TypeError` | `Symbol('k')` yoki obyekt |
| Obyektni joyida o'zgartirib, keshga ishonish | Eskirgan natija | O'zgarmas ma'lumot yoki `delete` |
| GC tezda yig'adi deb kutish | Kafolat yo'q (18-bob) | Mantiqni GC vaqtiga bog'lamang |
| Metama'lumot uchun oddiy `Map` | Obyektlar abadiy xotirada qoladi | `WeakMap` |

## Amaliyot

1. `memo(fn)` funksiyasini yozing: bitta obyekt argument oladigan `fn` natijasini `WeakMap` da keshlaydi.
2. `halqa.mjs` dagi `chuqurNusxa` ga `Map` va `Set` qo'llab-quvvatlashini qo'shing.
3. `kesh.mjs` dagi `WeakMap` ni `Map` ga almashtiring. `yig'ildi: malumot` chiqadimi? Nega?
4. `tashrif` ni funksiya tashqarisida emas, parametr sifatida (standart qiymat `new WeakSet()`) bering. Ikki marta `yur(a)` chaqirganda farqni ko'ring.
5. Bir nechta "foydalanuvchi" obyektiga oxirgi faollik vaqtini `WeakMap` bilan biriktiring; obyektning o'zida hech qanday yangi xossa paydo bo'lmasligini tekshiring.

## Rasmiy hujjat

- MDN — `WeakMap` ("Why WeakMap?", "Emulating private members", "Associating metadata", "Caching"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap>
- MDN — `WeakSet` ("Detecting circular references"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet>
- MDN — *Memory management* ("WeakMaps and WeakSets"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management#weakmaps_and_weaksets>
- MDN — *Keyed collections*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections>
- ECMA-262 — *WeakMap Objects*: <https://tc39.es/ecma262/2026/#sec-weakmap-objects>
- ECMA-262 — *WeakSet Objects*: <https://tc39.es/ecma262/2026/#sec-weakset-objects>

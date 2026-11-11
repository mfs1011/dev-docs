# 52 — Property flag'lari va descriptor'lar

[← Oldingi: Arrow funksiyalar chuqur](51-arrow.md) · [Mundarija](README.md) · [Keyingi: Getter va setter →](53-getter-setter.md)

## Tushuncha

Obyekt xossasi (16-bob) faqat "kalit — qiymat" emas. Har xossaning **atributlari** (bayroqlari) bor — ular xossani o'zgartirish, sanab chiqish va o'chirishga ruxsat beradi yoki taqiqlaydi. Atributlar to'plami — **property descriptor** (xossa tavsifi).

### Ikki xil descriptor (MDN `Object.defineProperty`)

| | Data descriptor | Accessor descriptor |
| --- | --- | --- |
| Qiymat | `value` | `get` / `set` funksiyalari (53-bob) |
| Qo'shimcha | `writable` | — |
| Umumiy | `enumerable`, `configurable` | `enumerable`, `configurable` |

Descriptor ikkalasidan bittasi bo'lishi shart. Unda `value`/`writable` ham, `get`/`set` ham bo'lsa — xato.

### Bayroqlar

| Bayroq | `true` bo'lsa | `false` bo'lsa |
| --- | --- | --- |
| `writable` | Qiymatni `=` bilan o'zgartirish mumkin | O'zgarmaydi: strict rejimda `TypeError`, aks holda jimgina |
| `enumerable` | `for...in`, `Object.keys`, `JSON.stringify` da ko'rinadi | Yashirin |
| `configurable` | Xossani o'chirish va bayroqlarni o'zgartirish mumkin | O'chirib bo'lmaydi; data ↔ accessor almashmaydi; boshqa bayroqlar o'zgarmaydi |

`configurable: false` dagi istisno (MDN): data xossa `writable: true` bo'lsa, qiymatni o'zgartirish va `writable` ni `false` ga tushirish **mumkin** — orqaga qaytarish esa yo'q.

**Standart qiymatlar farqi** — eng ko'p xato manbai:

| Qanday yaratilgan | `writable` | `enumerable` | `configurable` |
| --- | --- | --- | --- |
| Oddiy o'zlashtirish `obj.x = 1` yoki literal | `true` | `true` | `true` |
| `Object.defineProperty(obj, 'x', { value: 1 })` | `false` | `false` | `false` |

### Butun obyektni cheklash (MDN)

| | Yangi xossa | Qiymatni o'zgartirish | O'chirish | Ichma-ich obyektlar |
| --- | --- | --- | --- | --- |
| `Object.preventExtensions` | Yo'q | Ha | Ha | Cheklanmaydi |
| `Object.seal` | Yo'q | Ha | Yo'q (`configurable: false`) | Cheklanmaydi |
| `Object.freeze` | Yo'q | Yo'q (`writable: false` ham) | Yo'q | **Cheklanmaydi** — freeze sayoz |

Tekshirish: `Object.isExtensible`, `Object.isSealed`, `Object.isFrozen`. MDN: accessor xossalar freeze'dan keyin ham ishlaydi; `#private` elementlar xossa emas, freeze ularga ta'sir qilmaydi.

## Kod: bayroqlar

```js
const user = { ism: 'Ali' };                                       // oddiy o'zlashtirish
console.log(Object.getOwnPropertyDescriptor(user, 'ism'));
Object.defineProperty(user, 'id', { value: 7 });                   // defineProperty — standart bayroqlar false
console.log(Object.getOwnPropertyDescriptor(user, 'id'));
try { user.id = 8; } catch (e) { console.log('writable:false —', e.name + ': ' + e.message); }
console.log('Object.keys:', Object.keys(user), '| JSON:', JSON.stringify(user), '| id:', user.id);
try { delete user.id; } catch (e) { console.log('configurable:false —', e.name + ': ' + e.message); }
try { Object.defineProperty(user, 'id', { enumerable: true }); } catch (e) { console.log('qayta sozlash —', e.name + ': ' + e.message); }
```

```text
$ node bayroq.mjs
{ value: 'Ali', writable: true, enumerable: true, configurable: true }
{ value: 7, writable: false, enumerable: false, configurable: false }
writable:false — TypeError: Cannot assign to read only property 'id' of object '#<Object>'
Object.keys: [ 'ism' ] | JSON: {"ism":"Ali"} | id: 7
configurable:false — TypeError: Cannot delete property 'id' of #<Object>
qayta sozlash — TypeError: Cannot redefine property: id
```

- Oddiy xossa — barcha bayroqlar `true`. `defineProperty` bilan faqat `value` berilgan xossa — barchasi `false`.
- `writable: false` — modul strict, shuning uchun yozish `TypeError` berdi.
- `enumerable: false` — `id` `Object.keys` va `JSON.stringify` da ko'rinmadi, lekin to'g'ridan-to'g'ri o'qiladi.
- `configurable: false` — o'chirib ham, qayta sozlab ham bo'lmadi.

## Kod: istisnolar

```js
const o = {};
Object.defineProperty(o, 'x', { value: 1, writable: true, configurable: false });
Object.defineProperty(o, 'x', { value: 2 });                       // MDN: writable bo'lsa qiymat o'zgaradi
Object.defineProperty(o, 'x', { writable: false });                // ... va writable'ni false qilish mumkin
console.log(Object.getOwnPropertyDescriptor(o, 'x'));
try { Object.defineProperty(o, 'x', { writable: true }); } catch (e) { console.log('qaytarish:', e.name + ': ' + e.message); }
try { Object.defineProperty({}, 'y', { value: 1, get() { return 1; } }); }
catch (e) { console.log('aralash descriptor:', e.name + ': ' + e.message.split('.')[0]); }
console.log(Object.getOwnPropertyDescriptor(Math, 'PI'));          // o'rnatilgan konstanta
```

```text
$ node istisno.mjs
{ value: 2, writable: false, enumerable: false, configurable: false }
qaytarish: TypeError: Cannot redefine property: x
aralash descriptor: TypeError: Invalid property descriptor
{
  value: 3.141592653589793,
  writable: false,
  enumerable: false,
  configurable: false
}
```

- `configurable: false` bo'lsa ham `writable: true` xossaning qiymati o'zgardi (2) va `writable` `false` ga tushdi. Orqaga `true` qilib bo'lmadi (MDN).
- `value` va `get` birga — `Invalid property descriptor`.
- `Math.PI` — barcha bayroqlari `false` bo'lgan o'rnatilgan konstanta.

## Kod: `preventExtensions`, `seal`, `freeze`

```js
const holat = (o) => `kengaytiriladi=${Object.isExtensible(o)} seal=${Object.isSealed(o)} freeze=${Object.isFrozen(o)}`;
const urin = (nom, fn) => { try { fn(); console.log(`  ${nom}: ok`); } catch (e) { console.log(`  ${nom}: ${e.name}`); } };
for (const [nom, amal] of [['preventExtensions', Object.preventExtensions], ['seal', Object.seal], ['freeze', Object.freeze]]) {
  const o = amal({ a: 1, ichki: { b: 1 } });
  console.log(`${nom}: ${holat(o)}`);
  urin('yangi xossa', () => { o.yangi = 1; });
  urin('o\'zgartirish', () => { o.a = 2; });
  urin('o\'chirish', () => { delete o.a; });
  urin('ichki obyekt', () => { o.ichki.b = 2; });            // MDN: freeze sayoz
}
```

```text
$ node muzlatish.mjs
preventExtensions: kengaytiriladi=false seal=false freeze=false
  yangi xossa: TypeError
  o'zgartirish: ok
  o'chirish: ok
  ichki obyekt: ok
seal: kengaytiriladi=false seal=true freeze=false
  yangi xossa: TypeError
  o'zgartirish: ok
  o'chirish: TypeError
  ichki obyekt: ok
freeze: kengaytiriladi=false seal=true freeze=true
  yangi xossa: TypeError
  o'zgartirish: TypeError
  o'chirish: TypeError
  ichki obyekt: ok
```

Jadvaldagi qoidalar aynan shu natijalarni berdi. Uchala holatda ham **ichki obyekt** o'zgardi — `freeze` sayoz (MDN). Chuqur muzlatish uchun har obyekt xossasini rekursiv muzlatish kerak (MDN *Deep freezing*; halqali tuzilmada cheksiz aylanishdan ehtiyot bo'ling).

## Nega shunday

Til o'rnatilgan obyektlarni himoya qilishi kerak: `Math.PI` ni o'zgartirib yoki massivning `length` ini o'chirib bo'lmasligi kerak. Bayroqlar aynan shu nazoratni beradi va ular dasturchiga ham ochiq. Oddiy o'zlashtirish esa qulaylik uchun eng erkin bayroqlarni qo'yadi. `defineProperty` aksincha eng qattiq standartni oladi: nimani ochiq qilishni aniq aytish kerak.

## Muhandislik nuqtai nazari

### Konfiguratsiya va konstantalar uchun `freeze`

Ilova sozlamalari, holat ko'chirmalari va konstantalar obyektini `Object.freeze` qiling — tasodifiy o'zgartirish strict rejimda darhol xato beradi. Ichma-ich bo'lsa — chuqur muzlatish.

### `defineProperty` da bayroqlarni aniq yozing

Standart `false` lar sabab xossa sanalmay qoladi yoki o'zgarmay qoladi. Har uch bayroqni aniq yozing. MDN qo'shimcha maslahat beradi: descriptor obyekti meros xossalardan ham o'qiladi — buni null-prototipli obyekt bilan oldini olish mumkin.

### `freeze` — xavfsizlik chegarasi emas

Muzlatilgan obyekt ichidagi obyektlar, accessor'lar va `#private` maydonlar o'zgarishi mumkin. Haqiqiy izolyatsiya uchun bu yetmaydi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `defineProperty` da faqat `value` berish | Xossa yashirin, o'zgarmas, o'chirilmas | Bayroqlarni aniq yozish |
| `freeze` ichki obyektlarni ham muzlatadi deb o'ylash | Ichki ma'lumot o'zgaradi | Chuqur muzlatish |
| Strict bo'lmagan kodda muzlatilgan obyektga yozish | Jimgina e'tiborsiz — xato ko'rinmaydi | Strict rejim (modullar) |
| `value` va `get` ni birga berish | `TypeError` | Bittasini tanlash |
| `configurable: false` dan keyin qayta sozlash | `Cannot redefine property` | Avval kerakli bayroqlarni o'ylash |

## Amaliyot

1. `Object.getOwnPropertyDescriptors` bilan massivning `length` va indeks xossalarini ko'ring.
2. Faqat o'qiladigan, lekin sanaladigan `versiya` xossasini yarating va `JSON.stringify` da chiqishini tekshiring.
3. `chuqurMuzlat(obj)` funksiyasini yozing (halqali havolalarga chidamli — `WeakSet` bilan).
4. `seal` qilingan obyektda xossani accessor'ga aylantirishga urining. Qanday xato chiqadi?
5. Obyektning barcha xossalarini, jumladan yashirinlarini ham, `Object.getOwnPropertyNames` bilan chiqaring va `Object.keys` bilan solishtiring.

## Rasmiy hujjat

- MDN — `Object.defineProperty()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty>
- MDN — `Object.freeze()` (Deep freezing): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze>
- MDN — `Object.seal()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal>
- MDN — `Object.preventExtensions()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions>
- MDN — `Object.getOwnPropertyDescriptor()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor>

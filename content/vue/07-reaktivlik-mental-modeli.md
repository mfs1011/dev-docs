# 07 — Reaktivlik mental modeli

[← Oldingi: Loyiha tuzilmasi va Vite](06-loyiha-tuzilmasi-va-vite.md) · [Mundarija](README.md) · [Keyingi: Shablon sintaksisi →](08-shablon-sintaksisi.md)

## Tushuncha

Reaktivlik — "qiymat o'zgarganda unga bog'liq narsalar o'zi yangilanishi". Buni Excel orqali tushunish eng oson: `C1 = A1 + B1` yozsangiz, `A1` ni o'zgartirganingizda `C1` **o'zi** qayta hisoblanadi. Hech kim `C1` ni yangilashni buyurmaydi — bog'liqlik jadvalga yozib qo'yilgan.

Vue aynan shuni JavaScript'da qiladi. Buning uchun ikki narsani bilishi kerak:

1. **O'qish** — kim qaysi qiymatni o'qidi (bog'liqlikni yig'ish, *track*);
2. **Yozish** — qiymat o'zgardi, kimlarga xabar berish kerak (*trigger*).

## Nega shunday: JavaScript qiymatni kuzata olmaydi

Oddiy o'zgaruvchi hech narsa haqida xabar bermaydi:

```js
let count = 0
count = 1        // hech kim bilmaydi
```

JavaScript'da "bu o'zgaruvchi o'zgardi" hodisasi yo'q. Shuning uchun har qanday reaktiv tizim qiymatni **o'rashi** shart — ya'ni qiymatga faqat funksiya yoki obyekt orqali murojaat qilinsin:

```js
// Vue: obyektni Proxy bilan o'raydi
const state = reactive({ count: 0 })
state.count = 1        // Proxy "set" tutqichi ishlaydi → xabar beriladi

// Vue: alohida qiymatni obyektga aylantiradi
const count = ref(0)
count.value = 1        // getter/setter ishlaydi → xabar beriladi
```

**Mana `.value` qayerdan keldi.** `ref(0)` faqat sonni qaytara olmaydi, chunki son o'zgarganini hech kim sezmaydi. Shuning uchun `ref` obyekt qaytaradi va qiymat uning `value` xossasida yashaydi. `.value` ni o'qiganingizda Vue "kim o'qidi" ni yozib oladi, yozganingizda esa o'sha o'quvchilarni ishga tushiradi.

Alternativalar bor edi va Vue jamoasi ularni ko'rib chiqqan: kompilyatsiya vaqtida `count` ni `count.value` ga aylantirish (Svelte shunday qiladi, `$: ` bilan) — lekin u faqat SFC ichida ishlaydi, oddiy `.js` faylda yozilgan composable'da ishlamaydi. Vue mantiqni fayl turidan mustaqil saqlashni tanladi, narxi — `.value`.

## Kod: mexanizmni qo'lda qurish

Vue reaktivligining butun g'oyasi 25 qatorga sig'adi. Shuni yozib chiqsak, keyin hech narsa sehrli tuyulmaydi:

```js
let activeEffect = null
const targetMap = new WeakMap()    // obyekt → (kalit → effektlar to'plami)

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))

  deps.add(activeEffect)           // "shu effekt shu kalitni o'qidi"
}

function trigger(target, key) {
  const deps = targetMap.get(target)?.get(key)
  if (!deps) return

  for (const effect of [...deps]) effect()   // o'qiganlarni qayta ishga tushirish
}

function reactive(target) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key)
      return Reflect.get(obj, key, receiver)
    },
    set(obj, key, value, receiver) {
      const result = Reflect.set(obj, key, value, receiver)
      trigger(obj, key)
      return result
    },
  })
}

function watchEffect(fn) {
  const effect = () => {
    activeEffect = effect
    fn()                            // ichida o'qilgan hamma narsa track bo'ladi
    activeEffect = null
  }

  effect()
}
```

Ishlatib ko'ramiz:

```js
const state = reactive({ price: 100, qty: 2 })

watchEffect(() => {
  console.log('Jami:', state.price * state.qty)
})
// → Jami: 200

state.qty = 3
// → Jami: 300     (hech kim chaqirmadi, o'zi ishladi)

state.name = 'Kitob'
// → hech narsa: `name` ni hech kim o'qimagan, demak bog'liqlik yo'q
```

Vue'ning haqiqiy implementatsiyasida bundan ko'proq narsa bor (navbat, tartib, to'xtatish, `computed` keshi, xotira tozalash), lekin **g'oya aynan shu**: o'qishda yozib ol, yozishda chaqir.

Endi komponentni shu ko'z bilan ko'ring: Vue har bir komponentning render funksiyasini shunday effekt ichida ishga tushiradi. Render vaqtida o'qilgan har bir reaktiv qiymat — o'sha komponentning bog'liqligi. Shuning uchun `count` o'zgarganda faqat `count` ni ishlatgan komponent qayta render qilinadi.

## Kod: bog'liqlik faqat o'qilgan paytda yig'iladi

Bu qoidadan bir nechta amaliy oqibat kelib chiqadi:

```js
const state = reactive({ a: 1, b: 2, useA: true })

watchEffect(() => {
  console.log(state.useA ? state.a : state.b)
})
```

Hozir effekt `useA` va `a` ga bog'langan — `b` ga **emas**, chunki u o'qilmadi. `state.b = 99` hech narsa qilmaydi. `state.useA = false` bo'lsa, effekt qayta ishlaydi va endi `b` ga bog'lanadi, `a` bilan aloqasi uziladi.

Bu — "shartli bog'liqlik" va u React'dagi `useEffect` bog'liqlik massividan tubdan farq qiladi: u yerda ro'yxatni siz qo'lda yozasiz va noto'g'ri yozish mumkin; bu yerda ro'yxat haqiqiy o'qishdan chiqadi, ya'ni har doim to'g'ri.

## Muhandislik nuqtai nazari: Proxy nimani ko'ra oladi

`reactive()` — `Proxy`. Proxy obyektga qilingan **operatsiyalarni** ushlaydi: xossa o'qish, yozish, o'chirish (`delete`), `in` operatori, kalitlarni sanash. Shuning uchun Vue 3 da Vue 2 dagi cheklovlar yo'q:

```js
const state = reactive({ items: [] })

state.newField = 1        // ✓ Vue 3 ko'radi (Vue 2 da `Vue.set` kerak edi)
delete state.newField     // ✓ ko'radi
state.items[0] = 'a'      // ✓ ko'radi (Vue 2 da indeks bo'yicha yozuv ko'rinmasdi)
state.items.length = 0    // ✓ ko'radi
```

Lekin Proxy **obyektga** qo'yiladi, qiymatga emas. Bundan uchta chegara kelib chiqadi:

1. **Primitivni `reactive` qila olmaysiz** — `reactive(0)` ma'nosiz. Shuning uchun `ref` bor.
2. **Destrukturizatsiya aloqani uzadi** — `const { count } = state` oddiy nusxa beradi, Proxy'dan chiqib ketasiz (yechim: `toRefs`, 17-bob).
3. **Proxy va original bir xil emas** — `reactive(obj) !== obj`. Agar bir joyda originalni, boshqa joyda proxy'ni ishlatsangiz, o'zgarish yo'qolishi mumkin (17-bobdagi `toRaw`/identiklik masalasi).

## Muhandislik nuqtai nazari: yangilanish darhol bo'lmaydi

```js
const count = ref(0)

count.value++
console.log(document.querySelector('p').textContent)   // hali eski qiymat!

await nextTick()
console.log(document.querySelector('p').textContent)   // yangi qiymat
```

Vue o'zgarishlarni **navbatga qo'yadi** va joriy sinxron kod tugagach, mikrotask'da bir marta render qiladi. Sabab — samaradorlik: bitta funksiyada 50 ta qiymatni o'zgartirsangiz, DOM 50 marta emas, bir marta yangilanadi.

Bu naqshni brauzer dunyosida tanish: `requestAnimationFrame`, React'dagi batching, hatto ma'lumotlar bazasidagi tranzaksiya — hammasi "ishni to'plab, bir marta bajarish" g'oyasi. Amaliy oqibati: DOM'ga qarab qaror qabul qilmoqchi bo'lsangiz, `await nextTick()` kerak (18-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `.value` ni unutish (`count++` o'rniga `count.value++`) | `count` — obyekt; `count++` → `NaN` | `<script>` ichida har doim `.value`; shablonda esa avtomatik ochiladi |
| Reaktiv obyektni destrukturizatsiya qilish | Bog'lanish uziladi, qiymat muzlab qoladi | `toRefs(state)` yoki `state.x` ni to'g'ridan-to'g'ri ishlatish |
| Butun obyektni almashtirish: `state = reactive({...})` | `state` — `const` bo'lsa xato, bo'lmasa eski Proxy'ni kuzatayotganlar yangisini ko'rmaydi | `Object.assign(state, yangi)` yoki `ref` ishlatib `.value` ni almashtirish |
| O'zgarishdan keyin darhol DOM'ni o'qish | Navbat hali bajarilmagan | `await nextTick()` |
| "Vue yangilanmadi" deb `location.reload()` qilish | Sabab deyarli har doim — bog'liqlik yig'ilmagan (destrukturizatsiya, `.value`, raw obyekt) | Vue DevTools'da komponent holatini tekshiring |

## Amaliyot

1. Yuqoridagi 25 qatorli reaktivlik dvigatelini alohida faylga ko'chirib ishlatib ko'ring. `console.log` qo'yib, qaysi kalit qaysi effektga bog'langanini chop eting.
2. Shartli bog'liqlik misolini takrorlang: `state.useA` ni o'zgartirmasdan turib `state.b` ni o'zgartiring va hech narsa bo'lmasligini tasdiqlang.
3. Vue loyihasida `ref` yarating, uni `console.log(count)` bilan chiqaring (obyekt ko'rinadi), keyin `console.log(count.value)` bilan.
4. Komponentda `count.value++` dan keyin darhol DOM matnini o'qing, keyin `await nextTick()` bilan qayta o'qing. Farqni ko'ring.

## Rasmiy hujjat

- Reaktivlik chuqur: <https://vuejs.org/guide/extras/reactivity-in-depth.html>
- Reaktivlik asoslari: <https://vuejs.org/guide/essentials/reactivity-fundamentals.html>
- `nextTick`: <https://vuejs.org/api/general.html#nexttick>

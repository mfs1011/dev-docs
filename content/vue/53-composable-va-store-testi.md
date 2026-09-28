# 53 — Composable va store testi

[← Oldingi: Vitest va komponent testi](52-vitest-komponent-testi.md) · [Mundarija](README.md) · [Keyingi: E2E: Playwright →](54-e2e-playwright.md)

## Tushuncha

Composable va store — ilovaning biznes mantiqi yashaydigan joy (29, 42-bob). Ular komponentsiz test qilinadi, shuning uchun testlari tez va barqaror bo'ladi.

Ikkita nozik joy bor:

1. Ba'zi composable'lar **hayot sikli hooklariga** tayanadi (`onMounted`, `onUnmounted`) — ularni komponentsiz chaqirib bo'lmaydi;
2. Pinia store'lari **faol pinia nusxasini** talab qiladi.

## Kod: oddiy composable (hooksiz)

```js
// composables/useCounter.js
import { computed, ref } from 'vue'

export function useCounter(initial = 0, { max = Infinity } = {}) {
  const count = ref(initial)
  const canIncrement = computed(() => count.value < max)

  function increment() {
    if (canIncrement.value) count.value++
  }

  function reset() {
    count.value = initial
  }

  return { count, canIncrement, increment, reset }
}
```

```js
// useCounter.spec.js
import { describe, expect, it } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('maksimumdan oshmaydi', () => {
    const { count, increment, canIncrement } = useCounter(0, { max: 2 })

    increment()
    increment()
    increment()

    expect(count.value).toBe(2)
    expect(canIncrement.value).toBe(false)
  })
})
```

Hech qanday komponent kerak emas — `ref` va `computed` mustaqil ishlaydi.

## Kod: hayot sikliga bog'liq composable

```js
// composables/useWindowSize.js — onMounted/onUnmounted ishlatadi (20-bob)
```

Bunday composable'ni to'g'ridan-to'g'ri chaqirsangiz, Vue ogohlantiradi va hooklar bog'lanmaydi. Yechim — test uchun kichik "host" komponent:

```js
// test/withSetup.js
import { createApp } from 'vue'

export function withSetup(composable) {
  let result
  let app

  app = createApp({
    setup() {
      result = composable()

      return () => {}         // bo'sh render
    },
  })

  app.mount(document.createElement('div'))

  return [result, app]        // app.unmount() bilan tozalash mumkin
}
```

```js
import { withSetup } from '@/test/withSetup'
import { useWindowSize } from './useWindowSize'

it('resize hodisasida yangilanadi', async () => {
  const [{ width }, app] = withSetup(() => useWindowSize())

  window.innerWidth = 500
  window.dispatchEvent(new Event('resize'))

  expect(width.value).toBe(500)

  app.unmount()               // onUnmounted ishlashini ham tekshirish mumkin
})
```

Bu naqsh rasmiy hujjatda ham keltirilgan va Vue ekotizmida standart hisoblanadi.

## Kod: tozalash (cleanup) ni test qilish

```js
it('komponent o\'chganda tinglovchini olib tashlaydi', () => {
  const removeSpy = vi.spyOn(window, 'removeEventListener')

  const [, app] = withSetup(() => useWindowSize())

  app.unmount()

  expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
})
```

Xotira oqishlari (20-bob) shu tarzda testga tushadi — production'da ularni sezish ancha qiyin.

## Kod: so'rov qiladigan composable

```js
// useFetch.spec.js
import { flushPromises } from '@vue/test-utils'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

it('ma\'lumot yuklaydi', async () => {
  const [{ data, loading }] = withSetup(() => useFetch('/api/users/1'))

  expect(loading.value).toBe(true)

  await flushPromises()

  expect(loading.value).toBe(false)
  expect(data.value).toEqual({ id: 1, name: 'Aziz' })
})

it('xatoni ushlaydi', async () => {
  server.use(http.get('/api/users/1', () => HttpResponse.json({}, { status: 500 })))

  const [{ error, data }] = withSetup(() => useFetch('/api/users/1'))

  await flushPromises()

  expect(error.value).toBeTruthy()
  expect(data.value).toBeNull()
})
```

Xato yo'lini test qilish — muvaffaqiyat yo'lidan muhimroq: u production'da kamroq ishlaydi va shuning uchun kamroq sinalgan bo'ladi.

## Kod: bekor qilish (abort) testi

```js
it('yangi so\'rov eskisini bekor qiladi', async () => {
  const url = ref('/api/users/1')
  const [{ data }] = withSetup(() => useFetch(url))

  url.value = '/api/users/2'          // ikkinchi so'rov
  await flushPromises()

  expect(data.value.id).toBe(2)       // eski javob yozilmagan
})
```

44-bobdagi poyga holati shu test bilan qulflanadi.

## Kod: Pinia store testi

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart'

describe('cart store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('bir xil mahsulotda miqdorni oshiradi', () => {
    const cart = useCartStore()

    cart.add({ id: 1, price: 1000 })
    cart.add({ id: 1, price: 1000 })

    expect(cart.items).toHaveLength(1)
    expect(cart.count).toBe(2)
    expect(cart.subtotal).toBe(2000)
  })

  it('checkout muvaffaqiyatli bo\'lsa savatni bo\'shatadi', async () => {
    const cart = useCartStore()

    cart.add({ id: 1, price: 1000 })
    await cart.checkout()

    expect(cart.items).toEqual([])
  })

  it('checkout xato bersa savat saqlanadi', async () => {
    server.use(http.post('/api/orders', () => HttpResponse.json({}, { status: 500 })))

    const cart = useCartStore()
    cart.add({ id: 1, price: 1000 })

    await expect(cart.checkout()).rejects.toThrow()
    expect(cart.items).toHaveLength(1)
  })
})
```

`setActivePinia(createPinia())` — har testga toza holat (43-bob).

## Kod: store'lar aloqasini test qilish

```js
it('chiqishda savat tozalanadi', async () => {
  const auth = useAuthStore()
  const cart = useCartStore()

  cart.add({ id: 1, price: 1000 })
  await auth.logout()

  expect(cart.items).toEqual([])
})
```

Agar bu test yozilmasa, 43-bobdagi `$onAction` bog'lanishi bir kun jim buziladi va hech kim sezmaydi.

## Kod: komponent testida store'ni almashtirish

```js
import { createTestingPinia } from '@pinia/testing'

it('savat sonini ko\'rsatadi', () => {
  render(CartBadge, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { cart: { items: [{ id: 1, qty: 3, price: 100 }] } },
          createSpy: vi.fn,
        }),
      ],
    },
  })

  expect(screen.getByText('3')).toBeVisible()
})
```

`stubActions: true` (standart) — action'lar chaqirilgani yoziladi, lekin bajarilmaydi. Haqiqiy mantiq kerak bo'lsa `stubActions: false`.

## Muhandislik nuqtai nazari: mock chegarasi

Nimani mock qilish kerak degan savolga oddiy javob bor: **tashqi dunyoni mock qiling, o'z kodingizni emas.**

| Narsa | Mock |
| --- | --- |
| HTTP so'rovlar | Ha (MSW) |
| `localStorage`, `Date.now()`, `Math.random()` | Ha |
| Vaqt (`setTimeout`) | Ha (`vi.useFakeTimers`) |
| Boshqa composable | Odatda yo'q — haqiqiysi ishlatilsin |
| Pinia store | Yo'q (komponent testida — ba'zan) |
| Tashqi kutubxona (xarita, grafik) | Ha |

Har mock — testning haqiqatdan uzoqlashuvi. Ikkita composable birga ishlamasa, ikkalasi ham alohida "yashil" bo'lgan holda ilova ishlamasligi mumkin.

## Muhandislik nuqtai nazari: determinizm

Beqaror (flaky) testlarning eng ko'p sabablari:

| Sabab | Yechim |
| --- | --- |
| Joriy vaqt (`new Date()`) | `vi.setSystemTime(new Date('2026-01-01'))` |
| Tasodifiy son | Seed yoki mock |
| Real taymerlar | `vi.useFakeTimers()` |
| Tarmoq kechikishi | MSW (darhol javob) |
| Test tartibiga bog'liqlik | `beforeEach` da toza holat |
| Global holat (modul darajasida `ref`) | `vi.resetModules()` yoki Pinia |

Oxirgi qatorni eslab qoling: 41-bobdagi "modul darajasidagi store" testda ham muammo tug'diradi — holat testlar orasida saqlanib qoladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hayot sikliga bog'liq composable'ni to'g'ridan-to'g'ri chaqirish | Hooklar bog'lanmaydi | `withSetup` |
| `setActivePinia` ni unutish | "getActivePinia" xatosi | `beforeEach` da |
| Faqat muvaffaqiyat yo'lini test qilish | Xato yo'li production'da birinchi marta ishlaydi | Xato/bo'sh holatlar |
| Barcha composable'larni mock qilish | Integratsiya tekshirilmaydi | Faqat tashqi chegaralarni |
| `await flushPromises()` ni unutish | Holat hali yangilanmagan | Kuting |
| Testda haqiqiy tarmoqqa chiqish | Sekin, beqaror, CI'da yiqiladi | MSW |

## Amaliyot

1. `useCounter` uchun testlar yozing: maksimum, reset, boshlang'ich qiymat.
2. `withSetup` yordamchisini yozing va `useWindowSize` ni test qiling, shu jumladan tozalashni.
3. `useFetch` uchun uchta test: muvaffaqiyat, xato, bekor qilish.
4. `cart` store'i uchun testlar yozing, `checkout` xato bergan holatni ham qamrang.
5. Beqaror test yasang (`Date.now()` ga bog'liq), keyin `vi.setSystemTime` bilan barqarorlashtiring.

## Rasmiy hujjat

- Composable'larni testlash: <https://vuejs.org/guide/scaling-up/testing.html#testing-composables>
- Pinia testlash: <https://pinia.vuejs.org/cookbook/testing.html>
- Vitest mocking: <https://vitest.dev/guide/mocking.html>

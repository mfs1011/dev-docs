# 52 — Vitest va komponent testi

[← Oldingi: Testlash strategiyasi](51-testlash-strategiyasi.md) · [Mundarija](README.md) · [Keyingi: Composable va store testi →](53-composable-va-store-testi.md)

## Tushuncha

Vitest — Vite ustida ishlaydigan test yuguruvchisi. Ustunligi: loyihangizdagi `vite.config.js` (aliaslar, pluginlar, muhit o'zgaruvchilari) **avtomatik ishlaydi**, alohida sozlash kerak emas.

```bash
npm i -D vitest @vue/test-utils jsdom @testing-library/vue @testing-library/user-event
```

```js
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,                 // describe/it/expect importsiz
    setupFiles: ['./src/test/setup.js'],
  },
})
```

```js
// src/test/setup.js
import '@testing-library/jest-dom/vitest'      // toBeVisible, toHaveTextContent va h.k.
```

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

## Kod: birinchi komponent testi

```vue
<!-- UserCard.vue -->
<script setup>
const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['remove'])
</script>

<template>
    <article>
        <h3>{{ user.name }}</h3>
        <p v-if="user.isAdmin">Administrator</p>
        <button @click="emit('remove', user.id)">O'chirish</button>
    </article>
</template>
```

```js
// UserCard.spec.js
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  const user = { id: 1, name: 'Aziz', isAdmin: false }

  it('foydalanuvchi ismini ko\'rsatadi', () => {
    const wrapper = mount(UserCard, { props: { user } })

    expect(wrapper.text()).toContain('Aziz')
  })

  it('admin belgisini faqat adminlar uchun ko\'rsatadi', () => {
    expect(mount(UserCard, { props: { user } }).text()).not.toContain('Administrator')
    expect(mount(UserCard, { props: { user: { ...user, isAdmin: true } } }).text())
      .toContain('Administrator')
  })

  it('o\'chirish tugmasi bosilganda hodisa chiqaradi', async () => {
    const wrapper = mount(UserCard, { props: { user } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[1]])
  })
})
```

`await` muhim: `trigger` DOM yangilanishini kutadi (`nextTick`, 09-bob).

## Kod: Testing Library uslubi

Xuddi shu test, lekin foydalanuvchi nuqtai nazaridan:

```js
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'

it('o\'chirish tugmasi hodisa chiqaradi', async () => {
  const { emitted } = render(UserCard, { props: { user } })

  await userEvent.click(screen.getByRole('button', { name: /o'chirish/i }))

  expect(emitted().remove).toEqual([[1]])
})
```

Farqi:

| | `@vue/test-utils` | Testing Library |
| --- | --- | --- |
| Element qidirish | CSS selektor (`find('.btn')`) | Rol, matn, label (`getByRole`) |
| Ichki holatga kirish | `wrapper.vm` bor | Yo'q (ataylab) |
| Refaktoringga chidamlilik | Pastroq | Yuqori |
| Erishimlilikni rag'batlantirish | Yo'q | Ha — `getByRole` semantik razmetkani talab qiladi |

Amaliy tavsiya: **Testing Library** ni standart qiling (51-bobdagi "sinadigan testlar" muammosini kamaytiradi), `test-utils` ni esa ichki narsalarni tekshirish zarur bo'lganda ishlating.

## Kod: props, slotlar, global sozlamalar

```js
const wrapper = mount(UiModal, {
  props: { open: true },
  slots: {
    default: '<p>Matn</p>',
    footer: UiButton,                       // komponent ham bo'lishi mumkin
  },
  global: {
    plugins: [router, createTestingPinia()],
    stubs: { RouterLink: true },            // bolani soxta qilish
    mocks: { $t: (key) => key },            // i18n
    provide: { apiBaseUrl: '/api' },
  },
  attachTo: document.body,                  // fokus/o'lcham testlari uchun
})
```

`stubs` bilan ehtiyot bo'ling: bolani soxta qilsangiz, integratsiya tekshirilmay qoladi (51-bob). Faqat og'ir yoki tashqi bog'liqlikka ega bolalarni stub qiling (xarita, grafik).

## Kod: tarmoqni mock qilish

Eng toza yo'l — **MSW** (Mock Service Worker): haqiqiy `fetch` ishlaydi, javobni MSW qaytaradi.

```bash
npm i -D msw
```

```js
// src/test/server.js
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Aziz' }])),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({ id: 2, ...body }, { status: 201 })
  }),
)
```

```js
// src/test/setup.js
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

```js
it('foydalanuvchilarni yuklaydi', async () => {
  render(UserList)

  expect(await screen.findByText('Aziz')).toBeVisible()
})
```

Oddiyroq variant — `vi.mock` bilan modul darajasida:

```js
vi.mock('@/api/client', () => ({
  api: { get: vi.fn().mockResolvedValue([{ id: 1, name: 'Aziz' }]) },
}))
```

MSW afzal: HTTP qatlamini haqiqiy holicha qoldiradi, ya'ni sarlavhalar, status kodlar, xato yo'llari ham tekshiriladi.

## Kod: xato va yuklanish holatlari

```js
it('xato holatida qayta urinish tugmasini ko\'rsatadi', async () => {
  server.use(http.get('/api/users', () => HttpResponse.json({ message: 'Server xatosi' }, { status: 500 })))

  render(UserList)

  expect(await screen.findByRole('button', { name: /qayta urinish/i })).toBeVisible()
})

it('yuklanayotganda skelet ko\'rsatadi', () => {
  render(UserList)

  expect(screen.getByTestId('skeleton')).toBeVisible()
})
```

12-bobdagi to'rt holat (loading/error/empty/data) — komponent testlari uchun tayyor ro'yxat.

## Kod: async va vaqt

```js
// DOM yangilanishini kutish
await nextTick()
await flushPromises()                 // @vue/test-utils dan

// Elementning paydo bo'lishini kutish (Testing Library)
expect(await screen.findByText('Aziz')).toBeVisible()

// Taymerlar
vi.useFakeTimers()
vi.advanceTimersByTime(300)           // debounce testlari (16-bob)
vi.useRealTimers()
```

## Muhandislik nuqtai nazari: nimani tekshirish

Yaxshi komponent testi uchta savolga javob beradi:

1. **Kirish** — props/slot/store holati berilganda
2. **Ko'rinish** — foydalanuvchi nimani ko'radi
3. **Chiqish** — o'zaro ta'sirdan keyin qanday hodisa/chaqiruv bo'ladi

```js
it('bo\'sh savatda buyurtma tugmasi o\'chirilgan', () => {
  render(CartSummary, { props: { items: [] } })

  expect(screen.getByRole('button', { name: /buyurtma/i })).toBeDisabled()
})
```

Bu test komponent ichida `computed` bormi, `v-if` ishlatilganmi — bilmaydi va bilishi ham shart emas.

## Muhandislik nuqtai nazari: snapshot testlari

```js
expect(wrapper.html()).toMatchSnapshot()
```

Foydali bo'ladigan joy: murakkab, kamdan-kam o'zgaradigan chiqish (masalan generatsiya qilingan jadval yoki markdown render).

Zarar keladigan joy: oddiy komponentlar. Har dizayn o'zgarishida snapshot yangilanadi, hech kim farqni o'qimaydi va test hech narsa ushlamaydi. Amalda ko'p jamoalar snapshot'lardan voz kechgan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `trigger`/`click` oldidan `await` yozmaslik | DOM hali yangilanmagan | `await userEvent.click(...)` |
| CSS selektorlar bilan qidirish | Dizayn o'zgarsa sinadi | `getByRole`, `getByLabelText` |
| Hamma bolalarni `stubs` bilan o'chirish | Integratsiya tekshirilmaydi | Faqat og'irlarini |
| `wrapper.vm.someRef` ni tekshirish | Ichki tuzilma | Ko'rinadigan natija |
| Global mock'larni tozalamaslik | Testlar bir-biriga ta'sir qiladi | `afterEach` da reset |
| `onUnhandledRequest` ni sozlamaslik | Kutilmagan so'rovlar jim o'tadi | MSW'da `'error'` |
| `jsdom` da `IntersectionObserver` kutish | U jsdom'da yo'q | Mock yozing yoki E2E'ga chiqaring |

## Amaliyot

1. Vitest'ni o'rnating va `UserCard` uchun uchta test yozing: ko'rsatish, shartli ko'rinish, hodisa.
2. Xuddi shu testlarni Testing Library bilan qayta yozing. Qaysi biri dizayn o'zgarishiga chidamli?
3. MSW'ni sozlang va ro'yxat komponentining to'rt holatini (loading/error/empty/data) test qiling.
4. Debounce'li qidiruvni `vi.useFakeTimers()` bilan test qiling.
5. `npm run coverage` ni ishga tushiring va eng kam qamrab olingan biznes mantiq faylini toping.

## Rasmiy hujjat

- Vitest: <https://vitest.dev/guide/>
- Vue Test Utils: <https://test-utils.vuejs.org>
- Testing Library (Vue): <https://testing-library.com/docs/vue-testing-library/intro>
- MSW: <https://mswjs.io>

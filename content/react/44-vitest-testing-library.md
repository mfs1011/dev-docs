# 44 — Vitest va Testing Library

[← Oldingi: Testlash strategiyasi](43-testlash-strategiyasi.md) · [Mundarija](README.md) · [Keyingi: TypeScript bilan React →](45-typescript.md)

## Tushuncha

Vitest — Vite ustida ishlaydigan test yuguruvchisi: loyihangizdagi `vite.config` (aliaslar, pluginlar, muhit o'zgaruvchilari) avtomatik ishlaydi.

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

::: ts
```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```
:::

::: js
```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
```
:::

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

## Kod: birinchi komponent testi

::: ts
```tsx
// UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UserCard } from './UserCard'

const user = { id: 1, name: 'Aziz', isAdmin: false }

describe('UserCard', () => {
  it('ismni ko\'rsatadi', () => {
    render(<UserCard user={user} />)

    expect(screen.getByRole('heading', { name: 'Aziz' })).toBeVisible()
  })

  it('admin belgisini faqat adminlarga ko\'rsatadi', () => {
    const { rerender } = render(<UserCard user={user} />)

    expect(screen.queryByText(/administrator/i)).not.toBeInTheDocument()

    rerender(<UserCard user={{ ...user, isAdmin: true }} />)

    expect(screen.getByText(/administrator/i)).toBeVisible()
  })

  it('o\'chirish tugmasi bosilganda callback chaqiriladi', async () => {
    const onRemove = vi.fn()

    render(<UserCard user={user} onRemove={onRemove} />)

    await userEvent.click(screen.getByRole('button', { name: /o'chirish/i }))

    expect(onRemove).toHaveBeenCalledWith(1)
  })
})
```
:::

::: js
```jsx
// UserCard.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UserCard } from './UserCard'

const user = { id: 1, name: 'Aziz', isAdmin: false }

describe('UserCard', () => {
  it('ismni ko\'rsatadi', () => {
    render(<UserCard user={user} />)

    expect(screen.getByRole('heading', { name: 'Aziz' })).toBeVisible()
  })

  it('o\'chirish tugmasi bosilganda callback chaqiriladi', async () => {
    const onRemove = vi.fn()

    render(<UserCard user={user} onRemove={onRemove} />)

    await userEvent.click(screen.getByRole('button', { name: /o'chirish/i }))

    expect(onRemove).toHaveBeenCalledWith(1)
  })
})
```
:::

## Kod: element qidirish tartibi

```jsx
// 1. Rol — eng barqaror, a11y ni ham tekshiradi (42-bob)
screen.getByRole('button', { name: /saqlash/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('textbox', { name: /pochta/i })

// 2. Label (formalar)
screen.getByLabelText('Pochta')

// 3. Matn
screen.getByText(/topilmadi/i)

// 4. Test ID — razmetka o'zgarishidan himoya
screen.getByTestId('cart-count')

// 5. CSS — oxirgi chora (Testing Library'da atayin yo'q, `container.querySelector`)
```

Query turlari:

| Prefiks | Topilmasa | Qachon |
| --- | --- | --- |
| `getBy*` | Xato tashlaydi | Element **bo'lishi kerak** |
| `queryBy*` | `null` qaytaradi | Element **bo'lmasligini** tekshirish |
| `findBy*` | Promise (kutadi) | Async paydo bo'ladigan element |

```jsx
expect(await screen.findByText('Aziz')).toBeVisible()      // kutadi
expect(screen.queryByRole('alert')).not.toBeInTheDocument() // yo'qligini tekshiradi
```

## Kod: tarmoqni mock qilish (MSW)

::: ts
```ts
// src/test/server.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('*/api/users', () =>
    HttpResponse.json({ items: [{ id: 1, name: 'Aziz' }], total: 1 }),
  ),

  http.post('*/api/users', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({ id: 2, ...body }, { status: 201 })
  }),
)
```
:::

::: js
```js
// src/test/server.js
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('*/api/users', () => HttpResponse.json({ items: [{ id: 1, name: 'Aziz' }], total: 1 })),
  http.post('*/api/users', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({ id: 2, ...body }, { status: 201 })
  }),
)
```
:::

Test ichida javobni almashtirish:

```jsx
it('server xatosida qayta urinish tugmasini ko\'rsatadi', async () => {
  server.use(http.get('*/api/users', () => HttpResponse.json({ message: 'Xatolik' }, { status: 500 })))

  renderWithProviders(<UserList />)

  expect(await screen.findByRole('button', { name: /qayta urinish/i })).toBeVisible()
})
```

MSW afzalligi: haqiqiy `fetch` ishlaydi, ya'ni sarlavhalar, status kodlar va xato yo'llari ham tekshiriladi (31-bob).

## Kod: provider'lar bilan render

::: ts
```tsx
// src/test/render.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },   // testda retry kerak emas
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient }
}
```
:::

::: js
```jsx
// src/test/render.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient }
}
```
:::

Bu yordamchini bir marta yozib, barcha testlarda ishlating.

## Kod: forma testi

```jsx
it('validatsiya xatolarini ko\'rsatadi va yuborishni bloklaydi', async () => {
  const onSubmit = vi.fn()

  renderWithProviders(<LoginForm onSubmit={onSubmit} />)

  await userEvent.type(screen.getByLabelText(/pochta/i), 'notanemail')
  await userEvent.click(screen.getByRole('button', { name: /kirish/i }))

  expect(await screen.findByText(/pochta noto'g'ri/i)).toBeVisible()
  expect(onSubmit).not.toHaveBeenCalled()
})

it('to\'g\'ri ma\'lumot bilan yuboradi', async () => {
  renderWithProviders(<LoginForm />)

  await userEvent.type(screen.getByLabelText(/pochta/i), 'a@b.uz')
  await userEvent.type(screen.getByLabelText(/parol/i), 'parol12345')
  await userEvent.click(screen.getByRole('button', { name: /kirish/i }))

  expect(await screen.findByText(/xush kelibsiz/i)).toBeVisible()
})
```

`userEvent` — `fireEvent` dan afzal: u haqiqiy foydalanuvchi harakatlarini taqlid qiladi (fokus, klaviatura hodisalari, `pointer` hodisalari).

## Kod: hook testi

```jsx
import { act, renderHook, waitFor } from '@testing-library/react'
import { useCounter } from './use-counter'

it('maksimumdan oshmaydi', () => {
  const { result } = renderHook(() => useCounter(0, { max: 2 }))

  act(() => {
    result.current.increment()
    result.current.increment()
    result.current.increment()
  })

  expect(result.current.count).toBe(2)
})

it('ma\'lumot yuklaydi', async () => {
  const { result } = renderHook(() => useUsers(), { wrapper: QueryWrapper })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))

  expect(result.current.data).toHaveLength(1)
})
```

## Kod: store va reducer testi

```js
// Reducer — toza funksiya, eng oson test (19-bob)
it('submit xatosida qiymatlarni saqlaydi', () => {
  const state = { values: { email: 'a@b.uz' }, status: 'submitting' }
  const next = formReducer(state, { type: 'error', message: 'Xato' })

  expect(next.status).toBe('error')
  expect(next.values.email).toBe('a@b.uz')
})

// Zustand store (36-bob)
const initial = useCartStore.getState()

beforeEach(() => useCartStore.setState(initial, true))

it('bir xil mahsulotda miqdorni oshiradi', () => {
  useCartStore.getState().add({ id: 1, price: 1000, title: 'X' })
  useCartStore.getState().add({ id: 1, price: 1000, title: 'X' })

  expect(useCartStore.getState().lines[0].qty).toBe(2)
})
```

## Kod: vaqt va taymerlar

```js
it('debounce 300 ms dan keyin ishlaydi', async () => {
  vi.useFakeTimers()

  const { result } = renderHook(() => useDebouncedValue('a', 300))

  act(() => vi.advanceTimersByTime(299))
  expect(result.current).toBe('a')

  vi.useRealTimers()
})
```

`userEvent` bilan fake timer ishlatilsa, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` kerak bo'ladi.

## Muhandislik nuqtai nazari: nimani mock qilish

| Narsa | Mock |
| --- | --- |
| HTTP so'rovlar | ✅ MSW |
| Vaqt, `Date.now()`, `Math.random()` | ✅ `vi.setSystemTime`, `vi.spyOn` |
| `localStorage` | Odatda yo'q (jsdom'da bor) |
| Router | ✅ `MemoryRouter` |
| Boshqa komponentlar | ❌ Haqiqiysi (43-bob) |
| Store | ❌ Haqiqiysi + reset |
| `IntersectionObserver`, `ResizeObserver` | ✅ jsdom'da yo'q — stub yozing |

```ts
// src/test/setup.ts — jsdom'da yo'q API'lar
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver
```

## Muhandislik nuqtai nazari: skript va CI

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

CI'da (46-bob): `npm run test:run -- --coverage`. Yiqilgan testning natijasini artefakt sifatida saqlang.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `await` siz `userEvent` | Hodisalar bajarilmaydi | Har doim `await` |
| `getBy*` bilan yo'qlikni tekshirish | Xato tashlaydi | `queryBy*` |
| Async elementni `getBy*` bilan qidirish | Hali yo'q | `findBy*` |
| CSS selektorlar bilan qidirish | Dizayn o'zgarsa sinadi | `getByRole` |
| MSW'da `onUnhandledRequest` ni sozlamaslik | Kutilmagan so'rovlar jim o'tadi | `'error'` |
| Testda `retry: 3` bilan Query | Xato testi 3 marta kutadi | `retry: false` |
| Global holatni tozalamaslik | Testlar bir-biriga ta'sir qiladi | `beforeEach` reset |
| `act()` ogohlantirishini e'tiborsiz qoldirish | Holat yangilanishi kutilmagan | `waitFor`/`findBy` |

## Amaliyot

1. Vitest'ni sozlang va `UserCard` uchun uch test yozing.
2. `renderWithProviders` yordamchisini yozing va uni Query ishlatadigan komponentda sinang.
3. MSW bilan to'rt holatni (loading/error/empty/data) test qiling.
4. Forma testini yozing: validatsiya xatosi va muvaffaqiyatli yuborish.
5. Zustand store va reducer uchun testlar yozing.
6. `npm run coverage` ni ishga tushiring va eng kam qamrab olingan biznes mantiq faylini toping.

## Rasmiy hujjat

- Vitest: <https://vitest.dev/guide/>
- Testing Library (React): <https://testing-library.com/docs/react-testing-library/intro>
- `user-event`: <https://testing-library.com/docs/user-event/intro>
- MSW: <https://mswjs.io>

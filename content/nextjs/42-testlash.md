# 42 — Testlash

[← Oldingi: Eski loyihani o'qish](41-eski-loyiha.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik →](43-unumdorlik.md)

## Tushuncha

Next ilovasida test yozishning qiyinligi bitta narsadan kelib chiqadi: **kodning yarmi serverda ishlaydi**. Server komponent — `async` funksiya, u `useState` ishlatmaydi va brauzerda render qilinmaydi. Testing Library uni to'g'ridan-to'g'ri render qila olmaydi.

Shuning uchun test piramidasi Next'da boshqacha ko'rinadi:

```
        ╱ E2E (Playwright) ╲        ← oqimlar: login, buyurtma, to'lov
       ╱────────────────────╲
      ╱  Integratsiya (Vitest)╲     ← Server Action, Route Handler, DAL
     ╱──────────────────────────╲
    ╱   Birlik (Vitest + RTL)    ╲  ← klient komponentlar, sof funksiyalar
   ╱──────────────────────────────╲
```

Muhim: **server komponentlar uchun E2E samaraliroq.** Ularni birlik test qilishga urinish ko'p vaqt oladi va kam foyda beradi.

## Nega shunday

Nima qanday test qilinadi:

| Nima | Vosita | Nega |
| --- | --- | --- |
| Sof funksiya (formatlash, validatsiya) | Vitest | Tez, oson |
| Zod sxemalari | Vitest | Chegaraviy holatlar |
| Klient komponent | Vitest + Testing Library | Interaktivlik |
| Server Action | Vitest (to'g'ridan-to'g'ri chaqirish) | Oddiy async funksiya |
| Route Handler | Vitest (`Request` yasab) | Standart Web API |
| DAL / so'rovlar | Vitest + test bazasi | Haqiqiy SQL |
| Server komponent | ⚠️ E2E | Render qilish qiyin |
| Oqim (login → buyurtma) | Playwright | Haqiqiy brauzer |
| Vizual regressiya | Playwright screenshot | Piksel farqi |

## Kod: Vitest sozlash

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

::: ts
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: ['**/*.config.*', '**/.next/**', '**/e2e/**'],
    },
  },
})
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// next/navigation — jsdom'da mavjud emas
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))
```
:::

::: js
```js
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
  },
})

// vitest.setup.js
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```
:::

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

## Kod: klient komponent testi

::: ts
```tsx
// app/(app)/products/SearchInput.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchInput } from './SearchInput'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams('q=eski'),
  usePathname: () => '/products',
}))

describe('SearchInput', () => {
  it('boshlang\'ich qiymatni ko\'rsatadi', () => {
    render(<SearchInput defaultValue="telefon" />)

    expect(screen.getByRole('searchbox')).toHaveValue('telefon')
  })

  it('yozganda URL yangilanadi', async () => {
    const user = userEvent.setup()

    render(<SearchInput />)

    await user.type(screen.getByRole('searchbox'), 'noutbuk')

    // debounce/deferred — kutamiz
    await vi.waitFor(() => {
      expect(replace).toHaveBeenCalledWith(expect.stringContaining('q=noutbuk'), { scroll: false })
    })
  })

  it('bo\'shatilganda q parametri olib tashlanadi', async () => {
    const user = userEvent.setup()

    render(<SearchInput defaultValue="telefon" />)

    await user.clear(screen.getByRole('searchbox'))

    await vi.waitFor(() => {
      expect(replace).toHaveBeenCalledWith(expect.not.stringContaining('q='), { scroll: false })
    })
  })
})
```
:::

::: js
```jsx
// app/(app)/products/SearchInput.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchInput } from './SearchInput'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/products',
}))

describe('SearchInput', () => {
  it('yozganda URL yangilanadi', async () => {
    const user = userEvent.setup()

    render(<SearchInput />)

    await user.type(screen.getByRole('searchbox'), 'noutbuk')

    await vi.waitFor(() => {
      expect(replace).toHaveBeenCalledWith(expect.stringContaining('q=noutbuk'), { scroll: false })
    })
  })
})
```
:::

**`getByRole` ishlating, `getByTestId` emas.** Rol bilan qidirish erishimlilikni ham tekshiradi: agar `getByRole('searchbox')` topmasa, skrin rider ham topmaydi (44-bob).

## Kod: Server Action testi

Server Action — oddiy `async` funksiya. Uni to'g'ridan-to'g'ri chaqirish mumkin:

::: ts
```ts
// app/(app)/orders/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder } from './actions'

// Bog'liqliklarni mock qilamiz
vi.mock('@/lib/dal', () => ({
  requireSession: vi.fn(() => Promise.resolve({ userId: 1, roles: ['USER'], email: 'a@b.uz' })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

const { requireSession } = await import('@/lib/dal')
const { revalidatePath } = await import('next/cache')

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bo\'sh savatni rad etadi', async () => {
    const result = await createOrder([])

    expect(result).toHaveProperty('errors')
  })

  it('manfiy miqdorni rad etadi', async () => {
    const result = await createOrder([{ productId: 1, qty: -5 }])

    expect(result).toHaveProperty('errors')
  })

  it('kirmagan foydalanuvchini rad etadi', async () => {
    vi.mocked(requireSession).mockRejectedValueOnce(new Error('NEXT_REDIRECT'))

    await expect(createOrder([{ productId: 1, qty: 1 }])).rejects.toThrow()
  })

  it('muvaffaqiyatda keshni yangilaydi', async () => {
    const result = await createOrder([{ productId: 1, qty: 2 }])

    expect(result).toMatchObject({ ok: true })
    expect(revalidatePath).toHaveBeenCalledWith('/orders')
  })
})
```
:::

::: js
```js
// app/(app)/orders/actions.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder } from './actions'

vi.mock('@/lib/dal', () => ({
  requireSession: vi.fn(() => Promise.resolve({ userId: 1, roles: ['USER'] })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

const { revalidatePath } = await import('next/cache')

describe('createOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('bo\'sh savatni rad etadi', async () => {
    expect(await createOrder([])).toHaveProperty('errors')
  })

  it('muvaffaqiyatda keshni yangilaydi', async () => {
    const result = await createOrder([{ productId: 1, qty: 2 }])

    expect(result).toMatchObject({ ok: true })
    expect(revalidatePath).toHaveBeenCalledWith('/orders')
  })
})
```
:::

**Eng muhim test — ruxsat tekshiruvi.** Har Server Action uchun "kirmagan foydalanuvchi rad etiladimi?" testi bo'lsin (30-bob).

## Kod: Route Handler testi

::: ts
```ts
// app/api/orders/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './route'

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) => (name === 'access_token' ? { value: 'test-token' } : undefined),
      set: vi.fn(),
    }),
  ),
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

describe('GET /api/orders', () => {
  it('ro\'yxat qaytaradi', async () => {
    const response = await GET(new Request('http://localhost/api/orders'))

    expect(response.status).toBe(200)

    const body = await response.json()

    expect(Array.isArray(body.orders)).toBe(true)
  })

  it('limitni hurmat qiladi', async () => {
    const response = await GET(new Request('http://localhost/api/orders?limit=5'))
    const body = await response.json()

    expect(body.orders.length).toBeLessThanOrEqual(5)
  })
})

describe('POST /api/orders', () => {
  it('noto\'g\'ri tanani 422 bilan rad etadi', async () => {
    const response = await POST(
      new Request('http://localhost/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      }),
    )

    expect(response.status).toBe(422)
  })
})
```
:::

::: js
```js
// app/api/orders/route.test.js
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './route'

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ get: () => ({ value: 'test-token' }), set: vi.fn() }),
  ),
  headers: vi.fn(() => Promise.resolve(new Headers())),
}))

describe('GET /api/orders', () => {
  it('ro\'yxat qaytaradi', async () => {
    const response = await GET(new Request('http://localhost/api/orders'))

    expect(response.status).toBe(200)
  })
})
```
:::

Route Handler standart `Request` qabul qilgani uchun test yozish oson — hech qanday maxsus mock kerak emas.

## Kod: MSW bilan tashqi API mock qilish

```bash
npm install -D msw
```

::: ts
```ts
// test/msw.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Noto\'g\'ri' }, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresIn: 900,
      user: { id: 1, name: 'Test', email: body.email },
    })
  }),

  http.get('*/orders', () =>
    HttpResponse.json([{ id: 1, number: 'ORD-1', total: '100.00', status: 'PAID' }]),
  ),
]

export const server = setupServer(...handlers)
```

```ts
// vitest.setup.ts ga qo'shing
import { server } from './test/msw'
import { beforeAll, afterAll, afterEach } from 'vitest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
:::

::: js
```js
// test/msw.js
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json()

    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Noto\'g\'ri' }, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresIn: 900,
      user: { id: 1, name: 'Test', email: body.email },
    })
  }),
]

export const server = setupServer(...handlers)
```
:::

`onUnhandledRequest: 'error'` — muhim sozlama: test kutilmagan tashqi so'rov yuborsa, u **xato bilan to'xtaydi**, jimgina o'tib ketmaydi.

MSW tarmoq darajasida ishlaydi, shuning uchun `fetch` ni mock qilish kerak emas — kodingiz o'zgarmaydi.

## Kod: DAL va baza testi

Baza kodini mock qilmang — **test bazasida** sinang:

```yaml
# docker-compose.test.yml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: app_test
    ports: ['5433:5432']
    tmpfs: [/var/lib/postgresql/data]      # xotirada — tez
```

::: ts
```ts
// test/db.ts
import { beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

export function resetDb() {
  beforeEach(async () => {
    // Tartib muhim: bog'liq jadvallar avval
    await db.execute(sql`TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE`)
  })
}
```

```ts
// db/queries/orders.test.ts
import { describe, it, expect } from 'vitest'
import { resetDb } from '@/test/db'
import { createUser, createProduct } from '@/test/factories'
import { listOrders, createOrder } from './orders'

resetDb()

describe('listOrders', () => {
  it('faqat o\'z buyurtmalarini qaytaradi', async () => {
    const [alice, bob] = await Promise.all([createUser(), createUser()])

    await createOrder(alice.id, { total: '100.00' })
    await createOrder(bob.id, { total: '200.00' })

    const result = await listOrders(alice.id)

    expect(result).toHaveLength(1)
    expect(result[0].total).toBe('100.00')
  })

  it('limitni hurmat qiladi', async () => {
    const user = await createUser()

    for (let i = 0; i < 25; i += 1) {
      await createOrder(user.id, { total: '10.00' })
    }

    expect(await listOrders(user.id)).toHaveLength(20)
  })
})
```
:::

::: js
```js
// test/db.js
import { beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

export function resetDb() {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE`)
  })
}

// db/queries/orders.test.js
import { describe, it, expect } from 'vitest'
import { resetDb } from '@/test/db'
import { createUser } from '@/test/factories'
import { listOrders } from './orders'

resetDb()

describe('listOrders', () => {
  it('faqat o\'z buyurtmalarini qaytaradi', async () => {
    const [alice, bob] = await Promise.all([createUser(), createUser()])

    await createOrder(alice.id, { total: '100.00' })
    await createOrder(bob.id, { total: '200.00' })

    expect(await listOrders(alice.id)).toHaveLength(1)
  })
})
```
:::

**"Faqat o'z ma'lumotini ko'radi" testi — eng qimmatli test turi.** U egalik xatolarini ushlaydi (30-bob), va ular eng jiddiy xatolar.

## Kod: Playwright — E2E

```bash
npm init playwright@latest
```

::: ts
```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',            // xatoda to'liq yozuv
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

```ts
// e2e/auth.setup.ts — bir marta login, holat saqlanadi
import { test as setup, expect } from '@playwright/test'

setup('login qilish', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Pochta').fill(process.env.TEST_EMAIL!)
  await page.getByLabel('Parol').fill(process.env.TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Kirish' }).click()

  await expect(page.getByRole('heading', { name: /salom/i })).toBeVisible()

  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
```

```ts
// e2e/order.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Buyurtma oqimi', () => {
  test('savatga qo\'shish va buyurtma berish', async ({ page }) => {
    await page.goto('/products')

    await page.getByRole('button', { name: 'Savatga' }).first().click()

    await expect(page.getByRole('status')).toContainText('Savatga qo\'shildi')

    await page.getByRole('link', { name: /savat/i }).click()
    await page.getByRole('button', { name: 'Buyurtma berish' }).click()

    // Buyurtma raqami ko'rinishi kerak
    await expect(page.getByText(/ORD-\d+/)).toBeVisible()
  })

  test('kirmagan foydalanuvchi login\'ga yo\'naltiriladi', async ({ browser }) => {
    // Bu test uchun saqlangan sessiyani ishlatmaymiz
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()

    await page.goto('/orders')

    await expect(page).toHaveURL(/\/login/)

    await context.close()
  })

  test('bo\'sh savat bilan buyurtma bermaydi', async ({ page }) => {
    await page.goto('/cart')

    await expect(page.getByRole('button', { name: 'Buyurtma berish' })).toBeDisabled()
  })
})
```
:::

::: js
```js
// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})

// e2e/order.spec.js
import { test, expect } from '@playwright/test'

test('savatga qo\'shish va buyurtma berish', async ({ page }) => {
  await page.goto('/products')

  await page.getByRole('button', { name: 'Savatga' }).first().click()

  await expect(page.getByRole('status')).toContainText('Savatga qo\'shildi')
})
```
:::

Uch qoida:

1. **`getByRole` / `getByLabel`** — CSS selektor emas. Selektor sinfi o'zgarsa test sinadi; rol o'zgarmaydi.
2. **`storageState`** — har testda qayta login qilmang, sessiyani bir marta oling.
3. **`trace: 'on-first-retry'`** — CI'da test yiqilsa, `npx playwright show-trace` bilan har qadamni ko'rasiz.

## Kod: E2E'da to'lovni sinash

Stripe test rejimi bilan (35-bob):

::: ts
```ts
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test('Stripe test kartasi bilan to\'lov', async ({ page }) => {
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'To\'lash' }).click()

  // Stripe Checkout sahifasi
  await page.waitForURL(/checkout\.stripe\.com/)

  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242')
  await page.getByPlaceholder('MM / YY').fill('12/30')
  await page.getByPlaceholder('CVC').fill('123')
  await page.getByRole('button', { name: /pay/i }).click()

  // Qaytish
  await page.waitForURL(/\/orders\/\d+\?paid=1/)

  // Webhook kechikishi mumkin — kutamiz
  await expect(page.getByText('To\'landi')).toBeVisible({ timeout: 30_000 })
})
```
:::

::: js
```js
// e2e/checkout.spec.js
import { test, expect } from '@playwright/test'

test('Stripe test kartasi bilan to\'lov', async ({ page }) => {
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'To\'lash' }).click()

  await page.waitForURL(/checkout\.stripe\.com/)

  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242')
  await page.getByPlaceholder('MM / YY').fill('12/30')
  await page.getByPlaceholder('CVC').fill('123')
  await page.getByRole('button', { name: /pay/i }).click()

  await expect(page.getByText('To\'landi')).toBeVisible({ timeout: 30_000 })
})
```
:::

Webhook uchun uzun `timeout` — u tashqi xizmatdan keladi va bir necha soniya olishi mumkin.

## Kod: CI

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: app_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 10s
          --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npx drizzle-kit migrate
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/app_test

      - run: npm run test:run
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/app_test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Muhandislik nuqtai nazari: nimani test qilmaslik kerak

| Test qilmang | Nega |
| --- | --- |
| Next'ning o'zi (marshrutlash, kesh) | Freymvork testi allaqachon bor |
| Sof ko'rinish (JSX tuzilmasi) | Har o'zgarishda sinadi, qiymat bermaydi |
| `getByTestId` bilan hamma narsa | Rol bilan qidiring |
| 100% qamrov | Oxirgi 20% eng qimmat, eng kam foydali |
| Uchinchi tomon kutubxonalari | Ular o'z testiga ega |
| Snapshot testlar (katta) | "Yangilash" tugmasi bosiladi, hech kim o'qimaydi |

Nimaga vaqt sarflash kerak:

| Test qiling | Nega |
| --- | --- |
| Ruxsat va egalik | Eng jiddiy xatolar |
| Pul hisoblari | Xato = zarar |
| Validatsiya chegaralari | Ko'p uchraydigan xato |
| Asosiy oqimlar (login, buyurtma) | Sinsa hamma narsa to'xtaydi |
| Tuzatilgan buglar (regressiya testi) | Bir marta bo'lgan narsa yana bo'ladi |

## Muhandislik nuqtai nazari: server komponent testi

Texnik jihatdan mumkin, lekin noqulay:

::: ts
```tsx
// Ishlaydi, lekin cheklangan
import { render, screen } from '@testing-library/react'
import OrdersPage from './page'

it('buyurtmalarni ko\'rsatadi', async () => {
  // async komponentni "yechib" olamiz
  const ui = await OrdersPage({ searchParams: Promise.resolve({}) })

  render(ui)

  expect(screen.getByText('ORD-1')).toBeInTheDocument()
})
```
:::

::: js
```jsx
it('buyurtmalarni ko\'rsatadi', async () => {
  const ui = await OrdersPage({ searchParams: Promise.resolve({}) })

  render(ui)

  expect(screen.getByText('ORD-1')).toBeInTheDocument()
})
```
:::

Ishlaydi, lekin: `cookies()`, `headers()`, `redirect()` — hammasini mock qilish kerak, ichma-ich server komponentlar render qilinmaydi, `Suspense` xatti-harakati boshqacha.

**Tavsiya:** ma'lumot funksiyasini (`listOrders`) alohida test qiling, sahifani E2E bilan. Shunda ikkalasi ham oson.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `getByTestId` hamma joyda | A11y tekshirilmaydi, mo'rt | `getByRole` |
| `fireEvent` | Haqiqiy foydalanuvchini taqlid qilmaydi | `userEvent` |
| `await` unutish | Test o'tib ketadi, xato yashiringan | `await user.click(...)` |
| Bazani mock qilish | Haqiqiy SQL sinalmaydi | Test bazasi |
| Testlar orasida baza tozalanmaydi | Tartibga bog'liq testlar | `TRUNCATE` |
| `onUnhandledRequest` sozlanmagan | Kutilmagan tashqi so'rov jim o'tadi | `'error'` |
| E2E'da `waitForTimeout` | Mo'rt, sekin | `expect(...).toBeVisible()` |
| Har E2E testda login | Sekin | `storageState` |
| Server komponentni birlik test qilish | Ko'p mock, kam foyda | E2E |
| `trace` yoqilmagan | CI'da xatoni tushunib bo'lmaydi | `on-first-retry` |
| 100% qamrovga intilish | Vaqt isrof | Muhim yo'llarga e'tibor |

## Amaliyot

1. Vitest'ni sozlang va bitta sof funksiya (narx formatlash) uchun test yozing.
2. Klient komponent testini `getByRole` bilan yozing; keyin `getByTestId` ga o'tkazib, farqni his qiling.
3. Server Action uchun "kirmagan foydalanuvchi rad etiladi" testini yozing.
4. MSW bilan login oqimini mock qiling; `onUnhandledRequest: 'error'` ni yoqib, kutilmagan so'rovni ushlang.
5. Test bazasini Docker bilan ko'taring va "faqat o'z buyurtmalarini ko'radi" testini yozing.
6. Playwright bilan login → buyurtma oqimini yozing; `storageState` bilan tezlashtiring.
7. Testni ataylab sindiring va `npx playwright show-trace` bilan yozuvni ko'ring.
8. CI workflow qo'shing va PR'da testlar ishlashini tasdiqlang.

## Rasmiy hujjat

- Testlash: <https://nextjs.org/docs/app/guides/testing>
- Vitest bilan: <https://nextjs.org/docs/app/guides/testing/vitest>
- Playwright bilan: <https://nextjs.org/docs/app/guides/testing/playwright>
- Testing Library: <https://testing-library.com/docs/react-testing-library/intro>
- MSW: <https://mswjs.io/docs>

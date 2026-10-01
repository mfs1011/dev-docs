# 35 — FSD'da testlash

[← Oldingi: ESLint, TypeScript va alias'lar](34-eslint-va-alias.md) · [Mundarija](README.md) · [Keyingi: Migratsiya →](36-migratsiya.md)

## Qisqacha

Rasmiy FSD hujjatida testlar uchun alohida qoida yo'q — faqat slice'lar izolyatsiyasi ularni mustaqil test qilishga imkon berishi aytiladi. Bu bobdagi joylashuv qoidalari — amaliy tavsiya, lekin har biri Steiger va Vitest bilan real loyihada sinab ko'rilgan. Asosiy g'oya: **test — u tekshiradigan kod yonida**. Slice o'z testlari bilan birga ko'chadi, o'chiriladi va o'zgaradi.

## Qoida

| Test turi | Joy | Importlar |
| --- | --- | --- |
| Unit (sof funksiya, biznes qoidasi) | Fayl yonida: `entities/product/lib/format-price.test.ts` | Nisbiy: `'./format-price'` |
| Komponent testi | Komponent yonida: `features/add-to-cart/ui/AddToCartButton.test.tsx` | Slice ichini nisbiy, boshqa slice'larni public API orqali |
| Slice'ning integratsion testi | Slice ichida (`ui/` yonida yoki slice ildizida `__tests__/`) | Xuddi shunday |
| API soxtalari (MSW server, handler'lar), test sozlamasi | Alohida segment: `shared/testing/` (+ `index.ts`) | `@/shared/testing` |
| E2E (Playwright, Cypress) | `src/` tashqarisida: `e2e/` | FSD qoidalari tegishli emas |

Tekshirilgan faktlar (steiger 0.7.0):
- Steiger test fayllarni **oddiy kod kabi** tekshiradi: sahifa testidan boshqa sahifani import qilish — `Forbidden cross-import`, entity ichki fayliga kirish — `Forbidden sidestep of public API`.
- Slice ichidagi `__tests__/` papkasi nisbiy importlar bilan xato bermaydi.
- `src/tests/` kabi qatlamdan tashqari papka **umuman tekshirilmaydi** — shuning uchun ishlab chiqish kodi u yerga tushib qolmasin.
- `fixtures` — taqiqlangan segment nomi (`segments-by-purpose`); test ma'lumotlari uchun `testing` kabi maqsadli nom.
- `@/shared/api/mocks` importi — `Forbidden sidestep of public API`: `shared/api`'ning o'z public API'si bor, ichiga kirib bo'lmaydi. Shuning uchun soxtalar — alohida `shared/testing` segmenti.
- `tsc -b` (React + Vite) test fayllarini ham tekshiradi: global `it`/`vi` tanilmaydi (`Cannot find name 'it'`) — ularni `vitest`'dan aniq import qiling.

## Shablon

```text
src/
├── entities/product/
│   ├── lib/
│   │   ├── format-price.ts
│   │   └── format-price.test.ts          ← unit, eng arzon va eng ko'p
│   └── model/
│       ├── availability.ts
│       └── availability.test.ts
├── features/add-to-cart/
│   └── ui/
│       ├── AddToCartButton.tsx
│       └── AddToCartButton.test.tsx      ← komponent: render + click + so'rov (MSW)
├── pages/checkout/
│   └── __tests__/checkout-flow.test.tsx  ← sahifa ichidagi oqim
└── shared/
    └── testing/
        ├── server.ts                     MSW setupServer()
        ├── vitest-setup.ts               listen / resetHandlers / close
        └── index.ts                      export { server }
e2e/
└── checkout.spec.ts                       ← Playwright, butun ilova
```

## Kod: test sozlamasi (React va Vue)

```ts
// vitest.config.ts — vite sozlamasini (alias '@') qayta ishlatadi
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: { environment: 'jsdom', setupFiles: ['./src/shared/testing/vitest-setup.ts'] },
}))

// src/shared/testing/vitest-setup.ts
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Quyidagi uchala test real shablon loyihalarida (27, 29, 31-boblar) ishga tushirildi va o'tdi: Vitest 5, MSW, `@pinia/testing` 2.0.1 (Pinia 4 bilan), Angular 22 `ng test`.

## Kod: komponent testi

::: react
```tsx
// features/add-to-cart/ui/AddToCartButton.test.tsx — Vitest + Testing Library + MSW
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/testing'             // shared — public API orqali
import { AddToCartButton } from './AddToCartButton'    // slice ichi — nisbiy

it("savatga qo'shadi", async () => {
  let body: unknown
  server.use(http.post('*/cart/items', async ({ request }) => {
    body = await request.json()
    return HttpResponse.json({ count: 1, totalMinor: 100 })
  }))
  render(<QueryClientProvider client={new QueryClient()}><AddToCartButton productId="42" /></QueryClientProvider>)

  await userEvent.click(screen.getByRole('button', { name: 'Savatga' }))
  await vi.waitFor(() => expect(body).toEqual({ productId: '42' }))
})
```
:::

::: vue
```ts
// features/add-to-cart/ui/AddToCartButton.test.ts — Vitest + Vue Testing Library + MSW
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createTestingPinia } from '@pinia/testing'
import { http, HttpResponse } from 'msw'
import { server } from '@/shared/testing'             // shared — public API orqali
import AddToCartButton from './AddToCartButton.vue'    // slice ichi — nisbiy

it("savatga qo'shadi", async () => {
  let body: unknown
  server.use(http.post('*/cart/items', async ({ request }) => {
    body = await request.json()
    return HttpResponse.json({ count: 1, totalMinor: 100 })
  }))
  render(AddToCartButton, {
    props: { productId: '42' },
    global: { plugins: [VueQueryPlugin, createTestingPinia({ stubActions: false, createSpy: vi.fn })] },
  })

  await userEvent.click(screen.getByRole('button', { name: 'Savatga' }))
  await vi.waitFor(() => expect(body).toEqual({ productId: '42' }))
})
```
:::

::: angular
```ts
// features/add-to-cart/ui/add-to-cart-button.spec.ts — ng test (Angular 22: Vitest asosidagi unit-test builder)
import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { CartStore } from '@/entities/cart'            // boshqa slice — public API orqali
import { AddToCartButton } from './add-to-cart-button' // slice ichi — nisbiy

it("savatga qo'shadi", () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] })
  const fixture = TestBed.createComponent(AddToCartButton)
  fixture.componentRef.setInput('productId', '42')
  fixture.detectChanges()

  fixture.nativeElement.querySelector('button').click()
  const req = TestBed.inject(HttpTestingController).expectOne('/cart/items')
  expect(req.request.body).toEqual({ productId: '42' })
  req.flush({ count: 1, totalMinor: 100 })

  expect(TestBed.inject(CartStore).count()).toBe(1)
})
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Biznes qoidalarini qanday test qilish oson? | Ularni `model`/`lib`'da sof funksiya qiling — framework'siz unit test (18-bob) |
| Bir slice'ning testi boshqa slice'ni chuqur import qilsa? | Steiger xatosi — test ham chegaraga bo'ysunadi; public API yetmasa, u kambag'al |
| Test yordamchilari (render with providers) | `shared/lib/test-utils` (+ `index.ts`) yoki `shared/testing` |
| Snapshot testlar | Komponent yonida; katta snapshot — qo'llab-quvvatlash qiyin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hamma testlar `src/__tests__/` yoki `tests/`'da | Slice ko'chganda testlar qoladi; Steiger tekshirmaydi | Kod yonida |
| Test `entities/x/model/internal` ni import qiladi | Refaktoring testlarni buzadi | Public API yoki slice ichidan nisbiy |
| `shared/api/fixtures/` yoki `shared/api/mocks/` | `fixtures` taqiqlangan nom; `mocks` esa `shared/api` public API'sini chetlab o'tadi | `shared/testing/` |
| Faqat E2E testlar | Sekin, nima buzilganini topish qiyin | Unit va komponent testlari ko'proq |

## Manbalar

- Rasmiy: *Cross-imports — Reduced isolation and testability* <https://feature-sliced.design/docs/guides/issues/cross-imports>
- Saytda: [Arxitektura 52-bob — Frontend testlash](../arxitektura/52-frontend-testlash.md), [React 44-bob — Vitest va Testing Library](../react/44-vitest-testing-library.md), [Vue 52-bob — Vitest komponent testi](../vue/52-vitest-komponent-testi.md), [Angular 72-bob — Komponent testlari](../angular/72-komponent-testlari.md)

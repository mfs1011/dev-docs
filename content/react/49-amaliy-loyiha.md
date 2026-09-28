# 49 — Amaliy loyiha

[← Oldingi: Deploy va monitoring](48-deploy-va-monitoring.md) · [Mundarija](README.md) · [Keyingi: Checklist va keyingi qadam →](50-checklist.md)

## Tushuncha

Bu bobda qo'llanmadagi hamma bo'lakni bitta ilovaga yig'amiz: **kichik e-commerce** — katalog, mahsulot sahifasi, savat, buyurtma va profil.

Maqsad — kod nusxa ko'chirish emas, **qarorlar ketma-ketligini** ko'rsatish.

## Qadam 1 — arxitektura qarorlari

| Savol | Qaror | Sabab | Bob |
| --- | --- | --- | --- |
| Framework | Vite SPA | Login orqasidagi qism ko'p, SEO faqat katalogga kerak (agar kerak bo'lsa — Next) | 02, 04 |
| Til | TypeScript, `strict` | Domen modellari murakkab | 45 |
| Router | React Router v7 (data rejimi) | Loader, guard, lazy | 35 |
| Server holati | TanStack Query | Kesh, invalidatsiya, retry | 32 |
| Klient holati | Zustand (savat), Context (auth, tema) | Tez o'zgaradi / kamdan-kam | 20, 36 |
| URL holati | `useSearchParams` | Filtr, sahifa ulashiladi | 35, 37 |
| Formalar | React Hook Form + zod | Validatsiya bir manbadan | 38 |
| Uslublar | CSS Modules + tokenlar | Tema, izolyatsiya | 15, 40 |
| Testlar | Vitest + Testing Library + Playwright | Piramida | 43 |

## Qadam 2 — papka tuzilmasi

```
src/
├── app/
│   ├── App.tsx                 providers + router
│   ├── providers.tsx
│   ├── router.tsx
│   └── styles/tokens.css
├── shared/
│   ├── ui/                     Button, Input, Field, Modal, Skeleton
│   ├── api/client.ts           HTTP + ApiError (31-bob)
│   ├── auth/                   token-store, refresh (39-bob)
│   ├── lib/                    format-price, cn
│   └── hooks/                  use-debounced-value, use-in-view
├── entities/
│   ├── product/                tiplar, ProductCard, queries
│   └── user/
└── features/
    ├── auth/                   LoginForm, AuthProvider, RequireAuth
    ├── cart/                   store, CartDrawer, CartLine
    ├── catalog/                CatalogPage, filters, queries
    └── checkout/               CheckoutPage, order schema
```

Import yo'nalishi: `app → features → entities → shared` (34-bob).

## Qadam 3 — domen modellari va sxemalar

::: ts
```ts
// entities/product/types.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()),
})

export type Product = z.infer<typeof productSchema>

// features/checkout/schema.ts
export const orderSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 belgi'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Telefon +998XXXXXXXXX shaklida'),
  address: z.string().min(10, 'Manzilni to\'liq yozing'),
})

export type OrderInput = z.infer<typeof orderSchema>
```
:::

::: js
```js
// entities/product/types.js
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()),
})

// features/checkout/schema.js
export const orderSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 belgi'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Telefon +998XXXXXXXXX shaklida'),
  address: z.string().min(10, 'Manzilni to\'liq yozing'),
})
```
:::

Tip va validatsiya bitta manbadan (38, 45-bob).

## Qadam 4 — so'rov qatlami

::: ts
```ts
// entities/product/queries.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: CatalogFilters) => [...productKeys.lists(), filters] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
}

export function useProducts(filters: CatalogFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) =>
      api.get<Paginated<Product>>(`/products?${new URLSearchParams(filters as any)}`, { signal }),
    placeholderData: (prev) => prev,          // sahifalashda miltillamaydi
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: ({ signal }) => api.get<Product>(`/products/${slug}`, { signal }),
  })
}
```
:::

::: js
```js
// entities/product/queries.js
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'

export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  detail: (slug) => [...productKeys.all, 'detail', slug],
}

export function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => api.get(`/products?${new URLSearchParams(filters)}`, { signal }),
    placeholderData: (prev) => prev,
  })
}
```
:::

## Qadam 5 — savat store'i

::: ts
```ts
// features/cart/store.ts
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      lines: [],

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id)

          if (!existing) {
            return { lines: [...state.lines, { productId: product.id, title: product.title, price: product.price, qty: Math.min(qty, product.stock) }] }
          }

          return {
            lines: state.lines.map((l) =>
              l.productId === product.id ? { ...l, qty: Math.min(l.qty + qty, product.stock) } : l,
            ),
          }
        }),

      remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'cart', version: 1 },
  ),
)

export const useCartCount = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0))
export const useCartSubtotal = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.price * l.qty, 0))
```
:::

::: js
```js
// features/cart/store.js
export const useCartStore = create(
  persist(
    (set) => ({
      lines: [],

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id)

          if (!existing) {
            return { lines: [...state.lines, { productId: product.id, title: product.title, price: product.price, qty: Math.min(qty, product.stock) }] }
          }

          return {
            lines: state.lines.map((l) =>
              l.productId === product.id ? { ...l, qty: Math.min(l.qty + qty, product.stock) } : l,
            ),
          }
        }),

      remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'cart', version: 1 },
  ),
)
```
:::

## Qadam 6 — katalog sahifasi

::: ts
```tsx
// features/catalog/CatalogPage.tsx
export function CatalogPage() {
  const [params, setParams] = useSearchParams()

  const filters = {
    page: Number(params.get('page') ?? 1),
    q: params.get('q') ?? '',
    sort: params.get('sort') ?? 'created',
  }

  const debouncedQuery = useDebouncedValue(filters.q, 300)
  const { data, isPending, error, refetch } = useProducts({ ...filters, q: debouncedQuery })

  if (isPending) return <CatalogSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (data.items.length === 0) return <EmptyState title="Hech narsa topilmadi" />

  return (
    <div className={styles.layout}>
      <CatalogFilters value={filters} onChange={(next) => setParams(next, { replace: true })} />

      <ProductGrid products={data.items} />

      <Pagination page={filters.page} total={data.total} perPage={24} onChange={(p) => setParams({ ...filters, page: String(p) })} />
    </div>
  )
}
```
:::

::: js
```jsx
export function CatalogPage() {
  const [params, setParams] = useSearchParams()

  const filters = {
    page: Number(params.get('page') ?? 1),
    q: params.get('q') ?? '',
    sort: params.get('sort') ?? 'created',
  }

  const debouncedQuery = useDebouncedValue(filters.q, 300)
  const { data, isPending, error, refetch } = useProducts({ ...filters, q: debouncedQuery })

  if (isPending) return <CatalogSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (data.items.length === 0) return <EmptyState title="Hech narsa topilmadi" />

  return (
    <div className={styles.layout}>
      <CatalogFilters value={filters} onChange={(next) => setParams(next, { replace: true })} />
      <ProductGrid products={data.items} />
    </div>
  )
}
```
:::

To'rt holat (13-bob), URL holati (35, 37-bob), debounce (26, 41-bob) — hammasi bir joyda.

## Qadam 7 — checkout

::: ts
```tsx
// features/checkout/CheckoutPage.tsx
export function CheckoutPage() {
  const navigate = useNavigate()
  const lines = useCartStore((s) => s.lines)
  const clear = useCartStore((s) => s.clear)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    mode: 'onTouched',
  })

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: (input: OrderInput) =>
      api.post<Order>('/orders', { ...input, items: lines.map((l) => ({ productId: l.productId, qty: l.qty })) }),
  })

  if (lines.length === 0) return <Navigate to="/cart" replace />

  async function onSubmit(values: OrderInput) {
    try {
      const order = await createOrder(values)

      clear()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        for (const [field, messages] of Object.entries(error.details ?? {})) {
          setError(field as keyof OrderInput, { message: messages[0] })
        }
      } else {
        setError('root', { message: 'Buyurtma yaratib bo\'lmadi' })
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Ism" error={errors.name?.message}>
        {(props) => <input {...props} {...register('name')} />}
      </Field>

      <Field label="Telefon" error={errors.phone?.message}>
        {(props) => <input type="tel" {...props} {...register('phone')} />}
      </Field>

      <CartSummary lines={lines} />

      {errors.root && <p role="alert">{errors.root.message}</p>}

      <Button type="submit" loading={isSubmitting}>Buyurtma berish</Button>
    </form>
  )
}
```
:::

::: js
```jsx
export function CheckoutPage() {
  const navigate = useNavigate()
  const lines = useCartStore((s) => s.lines)
  const clear = useCartStore((s) => s.clear)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(orderSchema),
    mode: 'onTouched',
  })

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: (input) =>
      api.post('/orders', { ...input, items: lines.map((l) => ({ productId: l.productId, qty: l.qty })) }),
  })

  if (lines.length === 0) return <Navigate to="/cart" replace />

  async function onSubmit(values) {
    try {
      const order = await createOrder(values)

      clear()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      if (error.status === 422) {
        for (const [field, messages] of Object.entries(error.details ?? {})) {
          setError(field, { message: messages[0] })
        }
      } else {
        setError('root', { message: 'Buyurtma yaratib bo\'lmadi' })
      }
    }
  }
  // ...
}
```
:::

**Muhim:** narx va qoldiq **serverda** hisoblanadi — klientdan kelgan `price` ga ishonilmaydi (47-bob).

## Qadam 8 — testlar

```ts
// features/cart/store.test.ts — biznes mantiq
it('qoldiqdan oshib ketmaydi', () => {
  useCartStore.getState().add({ id: 1, title: 'X', price: 100, stock: 3 }, 5)

  expect(useCartStore.getState().lines[0].qty).toBe(3)
})
```

```tsx
// features/catalog/CatalogPage.test.tsx — komponent
it('xato holatida qayta urinish tugmasini ko\'rsatadi', async () => {
  server.use(http.get('*/api/products', () => HttpResponse.json({}, { status: 500 })))

  renderWithProviders(<CatalogPage />)

  expect(await screen.findByRole('button', { name: /qayta urinish/i })).toBeVisible()
})
```

```ts
// e2e/checkout.spec.ts — oqim
test('mahsulotni buyurtma qilish', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('button', { name: 'Savatga' }).first().click()
  await page.getByRole('link', { name: /savat/i }).click()
  await page.getByRole('button', { name: /buyurtma/i }).click()

  await page.getByLabel('Ism').fill('Aziz')
  await page.getByLabel('Telefon').fill('+998901234567')
  await page.getByRole('button', { name: /buyurtma berish/i }).click()

  await expect(page.getByText(/qabul qilindi/i)).toBeVisible()
})
```

## Muhandislik nuqtai nazari: qurilish tartibi

1. **Domen modellari va sxemalar** — nima bilan ishlaymiz;
2. **API shartnomasi** — server nima qaytaradi;
3. **Store va hooklar** — biznes mantiq (test bilan);
4. **Sahifalar** — ma'lumot oqimi;
5. **UI komponentlari** — ko'rinish;
6. **Sayqal** — skeletlar, animatsiya, chekka holatlar.

UI'dan boshlash — eng keng tarqalgan xato: oxirida ma'lumot oqimini "yopishtirishga" to'g'ri keladi.

## Muhandislik nuqtai nazari: nimani qo'shmaslik kerak

Birinchi versiyaga **kirmaydigan** narsalar:

- Mikro-optimizatsiyalar (41-bob) — o'lchamasdan;
- "Hamma narsa uchun" umumiy komponentlar — 3-marta takrorlangandan keyin;
- O'z dizayn tizimingiz — headless kutubxona + 10 komponent yetadi (40-bob);
- Murakkab kesh qatlami — TanStack Query yetmaguncha;
- Monorepo, mikro-frontend — jamoa 2–3 kishidan oshmaguncha.

## Amaliyot

1. Yuqoridagi tuzilma bo'yicha loyiha yarating (mock ma'lumot bilan bo'lsa ham).
2. Domen sxemalarini yozing va tiplarni ulardan chiqaring.
3. Savat store'ini testlar bilan yozing (qoldiq chegarasi, miqdor, tozalash).
4. Katalog sahifasini to'rt holat va URL holati bilan yig'ing.
5. Checkout formasini zod + RHF bilan qiling, server 422 xatolarini maydonlarga bog'lang.
6. Checkout oqimi uchun bitta E2E test yozing.
7. Lighthouse'ni ishga tushiring va performance/a11y/SEO bo'yicha uchtadan muammoni tuzating.

## Rasmiy hujjat

- React'da o'ylash: <https://react.dev/learn/thinking-in-react>
- TanStack Query naqshlari: <https://tkdodo.eu/blog/practical-react-query>
- React Router: <https://reactrouter.com>

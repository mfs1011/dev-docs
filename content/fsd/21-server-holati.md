# 21 — Server holati

[← Oldingi: API so'rovlari](20-api-sorovlari.md) · [Mundarija](README.md) · [Keyingi: Autentifikatsiya →](22-autentifikatsiya.md)

## Qisqacha

Server holati kutubxonalari (TanStack Query, Pinia Colada, Angular `resource`/`httpResource`) bilan ishlaganda asosiy savol — **kesh kalitlari va query'lar qayerda**. Rasmiy tavsiya: kalitlarni **query factory**'da yig'ing va uni `shared/api`'da (yoki loyihada entity'lar bo'lsa — `entities/<x>/api`'da) saqlang. Mutatsiyalarni query'lar bilan aralashtirmang — ularni ishlatiladigan joy yonida (`api` segmentida) yoki `mutationFn` sifatida `shared`/`entities`'da saqlang.

## Qoida

| Nima | Qayerda |
| --- | --- |
| Query factory (kalitlar + `queryOptions`) | `shared/api/queries/<resurs>.ts`; ko'p endpoint bo'lsa — `shared/api/<controller>/<controller>.query.ts`; entity'lar bo'lsa — `entities/<x>/api/<x>.query.ts` |
| Mutatsiya hook'i | Ishlatiladigan slice'ning `api` segmenti (`pages/x/api/use-update-x.ts`) |
| Mutatsiya funksiyasi (`mutationFn`) | `shared/api` yoki `entities/<x>/api` |
| `QueryClient` va provayder | `app/providers` |

```text
Query factory — kalitlar daraxti:
  products.all()         → ['products']
  products.lists()       → ['products', 'list']
  products.list(filters) → ['products', 'list', { … }]   + queryFn
  products.detail(id)    → ['products', 'detail', id]   + queryFn
  invalidate(products.all())  → hammasi yangilanadi;   invalidate(products.lists()) → faqat ro'yxatlar
```

## Shablon

```text
shared/api/
├── client.ts
├── product/
│   ├── get-products.ts
│   ├── get-product.ts
│   ├── product.query.ts      PRODUCT_QUERIES
│   └── index.ts
└── index.ts
pages/product-edit/
└── api/use-update-product.ts  mutatsiya — ishlatiladigan joyda
app/providers/QueryProvider.tsx
```

## Kod: query factory va ishlatish

::: react
```ts
// shared/api/product/product.query.ts
import { queryOptions } from '@tanstack/react-query'
import { getProducts, type ProductFilters } from './get-products'
import { getProduct } from './get-product'

export const PRODUCT_QUERIES = {
  all: () => ['products'] as const,
  lists: () => [...PRODUCT_QUERIES.all(), 'list'] as const,
  list: (filters: ProductFilters) => queryOptions({
    queryKey: [...PRODUCT_QUERIES.lists(), filters],
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,             // sahifalashda miltillamaslik
  }),
  detail: (id: string) => queryOptions({
    queryKey: [...PRODUCT_QUERIES.all(), 'detail', id],
    queryFn: () => getProduct(id),
  }),
}

// pages/catalog/ui/CatalogPage.tsx
const { data } = useQuery(PRODUCT_QUERIES.list({ page, brand }))

// pages/product-edit/api/use-update-product.ts — mutatsiya ishlatiladigan joyda
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCT_QUERIES.lists() }),
  })
}
```
:::

::: vue
```ts
// shared/api/product/product.query.ts — @tanstack/vue-query ham queryOptions'ni beradi
import { queryOptions } from '@tanstack/vue-query'
import { getProducts, type ProductFilters } from './get-products'
import { getProduct } from './get-product'

export const PRODUCT_QUERIES = {
  all: () => ['products'] as const,
  lists: () => [...PRODUCT_QUERIES.all(), 'list'] as const,
  list: (filters: ProductFilters) => queryOptions({
    queryKey: [...PRODUCT_QUERIES.lists(), filters],
    queryFn: () => getProducts(filters),
  }),
  detail: (id: string) => queryOptions({
    queryKey: [...PRODUCT_QUERIES.all(), 'detail', id],
    queryFn: () => getProduct(id),
  }),
}

// pages/catalog/ui/CatalogPage.vue (<script setup>) — filtrlar o'zgarsa qayta yuklanadi
const { data } = useQuery(computed(() => PRODUCT_QUERIES.list({ page: page.value, brand: brand.value })))

// Pinia Colada ishlatilsa ham tamoyil bir xil: kalitlar va defineQueryOptions — shared/api'da
```
:::

::: angular
```ts
// shared/api/product/product.urls.ts — httpResource uchun "factory": URL va parametrlar bir joyda
import type { HttpResourceRequest } from '@angular/common/http'

export interface ProductFilters { page: number; brand?: string }

export const PRODUCT_REQUESTS = {
  list: (f: ProductFilters): HttpResourceRequest => ({
    url: '/products',
    params: { page: f.page, ...(f.brand ? { brand: f.brand } : {}) },
  }),
  detail: (id: string): HttpResourceRequest => ({ url: `/products/${id}` }),
}

// pages/catalog/ui/catalog-page.ts — signal o'zgarsa resurs o'zi qayta yuklanadi
protected readonly page = signal(1)
protected readonly products = httpResource<ProductDto[]>(() => PRODUCT_REQUESTS.list({ page: this.page() }))

// TanStack Query kerak bo'lsa: @tanstack/angular-query-experimental — kalitlar shared/api'da, xuddi React kabi
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Kalitlar komponent ichida (`['products', id]`) yozilsa-chi? | Kichik loyihada ishlaydi; invalidatsiya ko'paygach — factory |
| Query factory `entities`'ga qachon? | Loyihada entity'lar allaqachon bor va har so'rov bitta entity'ga tegishli bo'lsa |
| Mutatsiyani factory ichiga qo'shaymi? | Yo'q — query va mutatsiyalarni aralashtirmang |
| Bir query factory boshqa entity'ga ishora qiladi (`country.cities`) | `@x` (15-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Kalit satrlari 20 faylda qo'lda | Invalidatsiyada xato, eskirgan ma'lumot | Query factory |
| `QueryClient` slice ichida yaratiladi | Bir nechta kesh, ma'lumot sinxron emas | `app/providers`'da bitta |
| Server holati Pinia/Redux'da nusxalanadi | Ikki manba, sinxronlash xatolari | Server holati — kutubxona keshida |
| Mutatsiya `onSuccess`'da qo'lda `setState` | Kesh va UI farqlanadi | `invalidateQueries` / `setQueryData` |

## Manbalar

- Rasmiy: *Usage with TanStack Query* <https://feature-sliced.design/docs/guides/tech/with-react-query>
- TanStack Query — *Query Options* <https://tanstack.com/query/latest/docs/framework/react/guides/query-options>
- Saytda: [React 32-bob — TanStack Query](../react/32-tanstack-query.md), [Angular 21-bob — httpResource](../angular/21-http-resource.md), [Arxitektura 40-bob — Holat turlari](../arxitektura/40-holat-turlari.md)

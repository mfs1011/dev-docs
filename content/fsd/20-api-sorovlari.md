# 20 — API so'rovlari

[← Oldingi: Qaror daraxti: kod qayerga?](19-qaror-daraxti.md) · [Mundarija](README.md) · [Keyingi: Server holati →](21-server-holati.md)

## Qisqacha

Umumiy so'rov mantiqini `shared/api`'dan boshlang: HTTP klient (`client.ts`) va endpoint bo'yicha guruhlangan so'rov funksiyalari. Ko'p loyiha uchun shu yetarli. Agar so'rov faqat bitta sahifa yoki feature'ga kerak bo'lsa — u o'sha slice'ning `api` segmentida. So'rovlarni va javob tiplarini `entities`'ga **erta** qo'ymang: backend javobi frontend'ga kerak shakldan farq qilishi mumkin.

## Qoida

| Nima | Qayerda |
| --- | --- |
| HTTP klient: baseURL, sukut sarlavhalar, serializatsiya, xato modeli, token | `shared/api/client.ts` |
| Qayta ishlatiladigan so'rovlar | `shared/api/endpoints/<resurs>.ts` |
| Bir slice'ga xos so'rov | `<slice>/api/<so'rov>.ts` — public API'ga eksport shart emas |
| OpenAPI'dan generatsiya (orval, openapi-typescript) | `shared/api/openapi/` (generatsiya buyrug'i — skriptda, natija — git'da yoki build'da) |
| Server holati kutubxonasi uchun umumiy tiplar, kesh kalitlari, umumiy query/mutation opsiyalari | `shared/api` (21-bob) |

## Shablon

```text
shared/api/
├── client.ts                 so'rov o'rami
├── errors.ts                 ApiError, Problem Details → UI xato modeli
├── endpoints/
│   ├── product.ts            getProducts, getProduct
│   ├── order.ts              getOrders, createOrder
│   └── auth.ts               login, logout, refresh
├── openapi/                  (ixtiyoriy) generatsiya
└── index.ts                  export { client, getProducts, … }; export type { ProductDto, … }

pages/sign-in/
└── api/sign-in-with-otp.ts   faqat shu sahifa — slice ichida
```

## Kod: klient va endpoint

::: react
```ts
// shared/api/client.ts
import { env } from '../config'
import { ApiError } from './errors'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: 'include',                        // sessiya cookie (22-bob)
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) throw await ApiError.from(res)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const client = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}

// shared/api/endpoints/product.ts
import { client } from '../client'

export interface ProductDto { id: string; title: string; priceMinor: number }
export const getProducts = () => client.get<ProductDto[]>('/products')
export const getProduct = (id: string) => client.get<ProductDto>(`/products/${id}`)
```
:::

::: vue
```ts
// shared/api/client.ts
import { env } from '../config'
import { ApiError } from './errors'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: 'include',                        // sessiya cookie (22-bob)
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) throw await ApiError.from(res)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const client = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}

// shared/api/endpoints/product.ts
import { client } from '../client'

export interface ProductDto { id: string; title: string; priceMinor: number }
export const getProducts = () => client.get<ProductDto[]>('/products')
export const getProduct = (id: string) => client.get<ProductDto>(`/products/${id}`)
```
:::

::: angular
```ts
// shared/api/api-url.interceptor.ts — klient o'rniga HttpClient + interceptor
import type { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { APP_ENV } from '../config'

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith('/')
    ? next(req.clone({ url: inject(APP_ENV).apiUrl + req.url, withCredentials: true }))
    : next(req)

// shared/api/endpoints/product-api.ts
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'

export interface ProductDto { id: string; title: string; priceMinor: number }

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private readonly http = inject(HttpClient)
  list() { return this.http.get<ProductDto[]>('/products') }
  get(id: string) { return this.http.get<ProductDto>(`/products/${id}`) }
}

// app/app.config.ts — interceptor ilova darajasida ulanadi
// provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor]))
```
:::

## Qachon / qachon emas

| Holat | Qayerda |
| --- | --- |
| Backend'da 200+ endpoint, OpenAPI bor | Generatsiya `shared/api/openapi`; qo'lda yozilgan o'ramlar kerak bo'lsa yonida |
| So'rov va mapper bitta sahifaga | Sahifa `api` |
| Bitta resurs 3 sahifada | `shared/api/endpoints` |
| Javobni domen modeliga aylantirish (qalin klient) | Entity `model` yoki `api` (mapper) |
| Next.js server komponentidan DB so'rovi | `shared/db` (28-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har komponentda `fetch(url)` | baseURL, xato, token takrorlanadi | `shared/api/client` |
| So'rovlar `entities`'da erta | Backend shakli butun UI'ga yopishadi | `shared/api` yoki slice `api` |
| `shared/api/endpoints.ts` — hammasi bir faylda | Desegmentatsiya | Resurs bo'yicha fayllar |
| Generatsiya qilingan kodni qo'lda tahrirlash | Keyingi generatsiyada yo'qoladi | O'ram yoki generator sozlamasi |
| Sahifaga xos so'rovni public API'da eksport qilish | Boshqa joylar unga bog'lanadi | Eksport qilmaslik |

## Manbalar

- Rasmiy: *Handling API Requests* <https://feature-sliced.design/docs/guides/examples/api-requests>
- Saytda: [Arxitektura 42-bob — Ma'lumot qatlami](../arxitektura/42-malumot-qatlami.md), [Angular 56-bob — Interceptorlar](../angular/56-interceptorlar.md), [Vue 44-bob — HTTP qatlami](../vue/44-http-qatlami.md)

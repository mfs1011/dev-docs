# 55 — `HttpClient` asoslari

[← Oldingi: `ControlValueAccessor` va template-driven](54-cva-va-template-driven.md) · [Mundarija](README.md) · [Keyingi: Interceptorlar →](56-interceptorlar.md)

## Tushuncha

`HttpClient` — Angular'ning HTTP so'rovlar xizmati. Uch xususiyati:

| Xususiyat | Ma'nosi |
| --- | --- |
| Observable qaytaradi | So'rov **obuna bo'lganda** ketadi; obunani bekor qilish — so'rovni bekor qilish |
| JSON'ni o'zi parse qiladi | `http.get<User>(url)` — tayyor obyekt |
| Interceptorlar | Har so'rovga umumiy mantiq (token, log) — 56-bob |

Angular 22 da:

- `HttpClient` **ildizda sukut bo'yicha mavjud** — `provideHttpClient()` siz ham `inject(HttpClient)` ishlaydi.
- Sukut backend — **Fetch API** (`FetchBackend`). `withFetch()` endi deprecated — kerak emas.

`provideHttpClient()` faqat sozlash uchun:

```ts
// app.config.ts
providers: [
  provideHttpClient(
    withInterceptors([authInterceptor, loggingInterceptor]),
  ),
]
```

## Nega shunday

`fetch()` ni to'g'ridan-to'g'ri ishlatish mumkin, lekin:

| `fetch()` | `HttpClient` |
| --- | --- |
| Har joyda `await res.json()`, `if (!res.ok)` | Avtomatik parse, 4xx/5xx — xato |
| Token qo'shish — har chaqiruvda | Interceptor — bir joyda |
| Testda `fetch` ni mock qilish | `HttpTestingController` (71-bob) |
| SSR'da so'rov ikki marta (server + brauzer) | Transfer cache (62-bob) |
| Bekor qilish — `AbortController` qo'lda | `unsubscribe()` |

## Kod: so'rovlar

```ts
@Service()
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/products';

  list(query: ProductQuery) {
    return this.http.get<Page<Product>>(this.base, { params: { ...query } });
  }

  get(id: string) {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(data: NewProduct) {
    return this.http.post<Product>(this.base, data);
  }

  update(id: string, patch: Partial<Product>) {
    return this.http.patch<Product>(`${this.base}/${id}`, patch);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

`get<Product>` — **tip e'lon qilish**, tekshiruv emas. Server boshqa narsa qaytarsa, TypeScript bilmaydi. Muhim joylarda runtime tekshiruv (Zod) — 57-bob.

### Qachon so'rov ketadi

```ts
this.api.create(data);                      // ❌ hech narsa bo'lmaydi — obuna yo'q
this.api.create(data).subscribe();          // ✅
await firstValueFrom(this.api.create(data)); // ✅ Promise sifatida
```

Observable **dangasa** — obunasiz so'rov yuborilmaydi. Ko'p uchraydigan xato: "saqlash tugmasi ishlamayapti".

### Signal bilan o'qish

O'qish uchun — `httpResource` (21-bob) eng qulay:

```ts
protected readonly products = httpResource<Page<Product>>(() => ({
  url: '/api/products',
  params: { page: this.page(), q: this.query() },
}));
```

Yozish (POST/PUT/DELETE) uchun — `HttpClient` metodlari. `httpResource` mutatsiyalar uchun emas.

## Kod: parametrlar

```ts
this.http.get('/api/products', {
  params: { q: 'kitob', page: 2, tags: ['a', 'b'], inStock: true },
});
```

Tekshirildi: URL → `/api/products?q=kitob&page=2&tags=a&tags=b&inStock=true`. Massiv — takrorlanuvchi kalit.

### Tuzoq: `null` va `undefined`

Tekshirildi:

```ts
params: { x: null, y: undefined, z: '' }
// → ?x=null&y=undefined&z=
```

`null` va `undefined` **tushib qolmaydi** — `"null"` va `"undefined"` satri sifatida ketadi. Backend `category=undefined` bo'yicha qidiradi va bo'sh natija qaytaradi. Himoya:

```ts
function cleanParams(p: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  ) as Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

this.http.get(url, { params: cleanParams({ q: this.query(), category: this.category() }) });
```

`HttpParams` — murakkab hollarda:

```ts
const params = new HttpParams().set('a', '1').append('a', '2');   // a=1&a=2
```

`HttpParams` **o'zgarmas** — `set` yangi nusxa qaytaradi. `params.set(...)` natijasini saqlamasangiz — hech narsa o'zgarmaydi.

## Kod: javob shakli

```ts
// To'liq javob: status, sarlavhalar
this.http.get<Product[]>(url, { observe: 'response' }).subscribe((res) => {
  res.status;                        // 200
  res.headers.get('X-Total-Count');  // '42'
  res.body;                          // Product[]
});

// Matn, fayl
this.http.get(url, { responseType: 'text' });   // string
this.http.get(url, { responseType: 'blob' });   // Blob
```

Tekshirildi: `headers.get('X-Total')` → `'42'`. **CORS** da boshqa domendan kelgan maxsus sarlavhani o'qish uchun server `Access-Control-Expose-Headers: X-Total` yuborishi kerak — aks holda `null`.

JSON kutilgan joyda matn kelsa (tekshirildi): `status: 200`, lekin xato — `Http failure during parsing`. Backend xato sahifasini HTML sifatida qaytarganda shunday bo'ladi.

## Kod: fayl yuklash

```ts
upload(file: File) {
  const body = new FormData();
  body.append('file', file);
  return this.http.post<{ url: string }>('/api/uploads', body);
}
```

`Content-Type` ni **o'zingiz qo'ymang** — brauzer `multipart/form-data; boundary=...` ni o'zi yozadi.

Yuklash progressi kerak bo'lsa — Fetch API upload progressini qo'llamaydi, `withXhr()` kerak:

```ts
provideHttpClient(withXhr())
```

```ts
this.http.post('/api/uploads', body, { reportProgress: true, observe: 'events' }).subscribe((e) => {
  if (e.type === HttpEventType.UploadProgress && e.total) {
    this.progress.set(Math.round((100 * e.loaded) / e.total));
  }
});
```

**Diqqat:** Angular hujjatiga ko'ra `withXhr()` ni SSR'da ishlatmang — serverdagi XHR qo'llovi deprecated va Angular 23 da olib tashlanadi (xavfsizlik sabablari).

## Kod: Fetch opsiyalari

Fetch backend qo'shimcha opsiyalarni qabul qiladi:

```ts
this.http.post('/api/analytics', event, { keepalive: true });   // sahifa yopilsa ham yetkaziladi
this.http.get('/api/hero-image', { priority: 'high' });
this.http.get(url, { credentials: 'include' });                 // boshqa domenga cookie
this.http.get(url, { timeout: 5000 });                          // 57-bob
```

## Kod: bekor qilish

```ts
const sub = this.http.get('/api/report').subscribe(...);
sub.unsubscribe();   // so'rov bekor qilinadi (fetch abort)
```

Amalda qo'lda kamdan-kam: `httpResource` parametr o'zgarsa eski so'rovni o'zi bekor qiladi, `switchMap` ham shunday, `takeUntilDestroyed()` — komponent yo'q bo'lganda.

## Muhandislik nuqtai nazari

**Qatlamlar:**

```
Komponent  →  httpResource / store  →  ProductApi  →  HttpClient
```

- Komponentda `inject(HttpClient)` — **yo'q**. URL'lar, parametrlar, DTO'lar — API xizmatida.
- API xizmati — **Observable** qaytaradi (yoki Promise), holat saqlamaydi.
- Bir resurs — bir xizmat: `ProductApi`, `OrderApi`.

**Base URL** — `API_URL` tokeni (38-bob) yoki interceptor (56-bob), har metodda `environment.apiUrl` emas.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Obunasiz `http.post(...)` | So'rov ketmaydi | `.subscribe()` yoki `firstValueFrom` |
| `params` da `undefined` | `?category=undefined` | `cleanParams` |
| `FormData` + qo'lda `Content-Type` | Server fayl topmaydi (boundary yo'q) | Sarlavhani qo'ymang |
| `get<T>` ni tekshiruv deb o'ylash | Runtime'da boshqa shakl | Kritik joyda Zod |
| Maxsus sarlavha `null` (CORS) | `X-Total` o'qilmaydi | `Access-Control-Expose-Headers` |
| `withFetch()` qo'shish | Deprecated — sukut allaqachon fetch | Olib tashlang |
| SSR'da `withXhr()` | Deprecated, xavfsizlik | Faqat brauzer, faqat progress uchun |
| Komponentda `HttpClient` | URL'lar tarqaladi | API xizmati |

## Amaliyot

1. `ProductApi` ni CRUD metodlari bilan yozing.
2. `params` ga `undefined` qo'shib, DevTools Network'da URL'ni ko'ring; `cleanParams` bilan tuzating.
3. `observe: 'response'` bilan `X-Total-Count` sarlavhasidan sahifalash.
4. Fayl yuklash + `withXhr()` bilan progress chizig'i.
5. Tahlil hodisasini `keepalive: true` bilan `visibilitychange` da yuboring.
6. Bitta komponentdagi to'g'ridan-to'g'ri `HttpClient` chaqiruvlarini API xizmatiga ko'chiring.

## Rasmiy hujjat

- HTTP: <https://angular.dev/guide/http>
- So'rovlar: <https://angular.dev/guide/http/making-requests>
- Sozlash: <https://angular.dev/guide/http/setup>

# 57 — Xatolar, qayta urinish, timeout

[← Oldingi: Interceptorlar](56-interceptorlar.md) · [Mundarija](README.md) · [Keyingi: Auth: token va refresh oqimi →](58-auth-token-refresh.md)

## Tushuncha

HTTP xatosi — `HttpErrorResponse`. Uning turi `status` ga qarab farqlanadi (real server bilan tekshirildi):

| Holat | `status` | `error` (body) | Qanday ko'rinadi |
| --- | --- | --- | --- |
| Server 500 | `500` | Parse qilingan JSON: `{ message: '...' }` | "Http failure response for URL: 500 Internal Server Error" |
| Validatsiya 422 | `422` | `{ errors: { email: [...] } }` | Formaga (51-bob) |
| Tarmoq yo'q / server o'chiq | **`0`** | `TypeError: fetch failed` | "... 0 undefined" |
| `timeout` | **`0`** | `DOMException`, `name: 'TimeoutError'` | "signal timed out" |
| JSON kutilgan, matn keldi | **`200`** | `SyntaxError` | "Http failure during parsing" |

`status === 0` — "server javob bermadi": tarmoq, CORS, timeout, bekor qilish. Foydalanuvchiga — "Internet aloqasini tekshiring", "Server xatosi" emas.

## Nega shunday

Xatolar uch darajada ushlanadi, har birining vazifasi boshqa:

| Daraja | Vazifa | Misol |
| --- | --- | --- |
| **Interceptor** | Umumiy — hamma so'rovlar uchun | 401 → login, 503 → "texnik ishlar", tarmoq → toast |
| **API xizmati / store** | Resursga xos | 404 → `null`, qayta urinish |
| **Komponent** | UI | "Qayta urinish" tugmasi, forma xatolari |

Hammasini bir joyda — noto'g'ri: interceptor 422 ni toast bilan ko'rsatsa, forma maydonlarga xato qo'ya olmaydi.

## Kod: `catchError`

```ts
getProduct(id: string) {
  return this.http.get<Product>(`/api/products/${id}`).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 404) return of(null);           // topilmadi — oddiy holat
      return throwError(() => e);                      // qolgani — yuqoriga
    }),
  );
}
```

`catchError` **qaytarishi shart**: yangi Observable (`of(...)`) — xato "yutiladi", `throwError` — davom etadi. `EMPTY` — oqim jim tugaydi (ehtiyot: `firstValueFrom` xato beradi).

## Kod: umumiy xato interceptori

```ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(Toast);
  const router = inject(Router);

  return next(req).pipe(
    catchError((e: unknown) => {
      if (!(e instanceof HttpErrorResponse) || req.context.get(SILENT)) {
        return throwError(() => e);
      }

      if (e.status === 0) {
        toast.error("Server bilan bog'lanib bo'lmadi. Internetni tekshiring.");
      } else if (e.status === 403) {
        toast.error("Bu amal uchun ruxsat yo'q.");
      } else if (e.status === 503) {
        router.navigate(['/maintenance']);
      } else if (e.status >= 500) {
        toast.error("Serverda xatolik. Birozdan keyin urinib ko'ring.");
      }
      // 400, 404, 422 — chaqiruvchi hal qiladi

      return throwError(() => e);
    }),
  );
};
```

`inject` — funksiya **boshida**, `catchError` callback'ida emas (NG0203).

Xatoni **qayta tashlash** muhim: interceptor xabar ko'rsatdi, lekin chaqiruvchi (forma, resource) ham bilishi kerak — `submitting` ni o'chirishi, `error()` holatiga o'tishi uchun.

401 alohida — token yangilash oqimi (58-bob).

## Kod: qayta urinish

```ts
import { retry, timer } from 'rxjs';

this.http.get<Stats>('/api/stats').pipe(
  retry({
    count: 3,
    delay: (error, attempt) => {
      if (!isRetryable(error)) throw error;          // qayta urinmaslik
      return timer(Math.min(1000 * 2 ** (attempt - 1), 8000));   // 1s, 2s, 4s
    },
  }),
);

function isRetryable(e: unknown) {
  return e instanceof HttpErrorResponse && (e.status === 0 || e.status === 502 || e.status === 503 || e.status === 504);
}
```

Tekshirildi: server 503, 503, 200 qaytarganda — uchinchi urinishda muvaffaqiyat.

**Qaysi so'rovni qayta urinish mumkin:**

| So'rov | Qayta urinish |
| --- | --- |
| `GET` | ✅ Xavfsiz |
| `PUT`, `DELETE` | ✅ Idempotent (odatda) |
| `POST` (buyurtma, to'lov) | ❌ Ikki marta buyurtma! Faqat backend idempotency kaliti bilan |
| 4xx (400, 401, 403, 404, 422) | ❌ Qayta urinish natijani o'zgartirmaydi |
| 0, 502, 503, 504 | ✅ Vaqtinchalik |

Exponential backoff (1s → 2s → 4s) — server qiynalayotganda uni bosib qo'ymaslik uchun. Ko'p mijozli tizimda tasodifiy "jitter" ham qo'shiladi.

## Kod: timeout

Angular 22 `HttpClient` da `timeout` opsiyasi bor:

```ts
this.http.get('/api/report', { timeout: 10_000 });
```

Tekshirildi: 500 ms javob beradigan serverga `timeout: 100` → `HttpErrorResponse`, `status: 0`, `error.name === 'TimeoutError'`. So'rov fetch darajasida bekor qilinadi (`AbortSignal.timeout`).

Aniqlash:

```ts
function isTimeout(e: HttpErrorResponse) {
  return e.status === 0 && e.error instanceof DOMException && e.error.name === 'TimeoutError';
}
```

Global timeout — interceptorda:

```ts
export const timeoutInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.timeout ? req : req.clone({ timeout: 30_000 }));
```

RxJS `timeout()` operatori ham ishlaydi, lekin u faqat **obunani** tugatadi — `HttpClient` opsiyasi so'rovni tarmoq darajasida to'xtatadi.

## Kod: foydalanuvchiga xabar

Xato matnini **ichki** ma'lumotdan ajrating:

```ts
export function userMessage(e: unknown): string {
  if (!(e instanceof HttpErrorResponse)) return "Kutilmagan xatolik yuz berdi.";
  if (e.status === 0) return isTimeout(e) ? 'Server javob bermadi. Keyinroq urinib ko\'ring.' : "Internet aloqasi yo'q.";
  if (e.status === 404) return 'Ma\'lumot topilmadi.';
  if (e.status === 403) return "Ruxsat yo'q.";
  if (e.status >= 500) return 'Serverda xatolik.';
  return typeof e.error?.message === 'string' ? e.error.message : "So'rov bajarilmadi.";
}
```

`e.message` ("Http failure response for https://api.../internal/v2/...") — foydalanuvchiga **ko'rsatmang**: tushunarsiz va ichki URL'larni oshkor qiladi. Loglash uchun — Sentry kabi tizimga (78-bob).

`httpResource` bilan:

```html
@if (products.error(); as e) {
  <div role="alert">
    {{ userMessage(e) }}
    <button (click)="products.reload()">Qayta urinish</button>
  </div>
}
```

## Kod: javobni runtime tekshirish

`get<Product>` — faqat TypeScript'ga va'da. Backend shaklni o'zgartirsa — xato kodning ichkarisida, noaniq joyda chiqadi. Kritik joylarda:

```ts
const ProductSchema = z.object({ id: z.string(), name: z.string(), price: z.number() });

protected readonly product = httpResource(() => `/api/products/${this.id()}`, {
  parse: (raw) => ProductSchema.parse(raw),
});
```

`parse` xato tashlasa — resurs `error` holatiga o'tadi (tekshirilgan, 21-bob). Xato **chegarada**, aniq xabar bilan.

## Muhandislik nuqtai nazari

**Xato — normal holat.** Har ma'lumot ko'rsatiladigan joyda uch holat: yuklanmoqda, xato, ma'lumot. `httpResource` buni majburlaydi (`isLoading`, `error`, `hasValue`). Xato holatini dizaynda ham chizing.

**Xatoni yutmang:**

```ts
catchError(() => of([]))   // ❌ server yiqilsa — "mahsulotlar yo'q" ko'rinadi
```

Foydalanuvchi "hech narsa yo'q" va "yuklab bo'lmadi" ni farqlashi kerak.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `status === 0` ni "server xatosi" deb ko'rsatish | Chalg'ituvchi | "Internet aloqasi" / timeout |
| `catchError(() => of([]))` | Xato "bo'sh ro'yxat" bo'lib ko'rinadi | Xato holatini ko'rsatish |
| Interceptor xatoni yutadi | Forma `submitting` da qotadi | `throwError(() => e)` |
| `POST` ni `retry` | Ikki marta buyurtma | Faqat idempotent so'rovlar |
| 4xx ni qayta urinish | Behuda so'rovlar | `isRetryable` |
| `e.message` foydalanuvchiga | Ichki URL'lar ko'rinadi | `userMessage(e)` |
| RxJS `timeout()` so'rovni to'xtatadi deb o'ylash | Tarmoqda davom etadi | `HttpClient` `timeout` opsiyasi |
| Interceptor 422 ni toast bilan | Forma maydon xatolarini ko'rsata olmaydi | 422 — chaqiruvchiga |

## Amaliyot

1. `errorInterceptor` yozing: 0, 403, 5xx uchun toast; 4xx ni o'tkazib yuboring.
2. `isRetryable` + exponential backoff bilan statistika so'rovi.
3. DevTools'da "Offline" rejimini yoqib, `status: 0` xabarini tekshiring.
4. `timeout: 3000` qo'ying va sekin endpoint bilan `TimeoutError` ni aniqlang.
5. `userMessage` funksiyasini yozib, `httpResource` xato holatida "Qayta urinish" tugmasi bilan ishlating.
6. Kritik endpoint'ga Zod `parse` qo'shing va backend shaklini buzib sinang.

## Rasmiy hujjat

- Xatolarni boshqarish: <https://angular.dev/guide/http/making-requests#handling-request-failure>
- RxJS `retry`: <https://rxjs.dev/api/operators/retry>
- Interceptorlar: <https://angular.dev/guide/http/interceptors>

# 56 — Interceptorlar

[← Oldingi: `HttpClient` asoslari](55-http-client.md) · [Mundarija](README.md) · [Keyingi: Xatolar, qayta urinish, timeout →](57-http-xatolar.md)

## Tushuncha

Interceptor — **har** HTTP so'rov va javob o'tadigan funksiya. So'rovni o'zgartirishi, javobni kuzatishi, xatoni ushlashi yoki so'rovni umuman yubormasligi mumkin.

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.method, req.url);
  return next(req);
};
```

```ts
provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor]))
```

`next(req)` — zanjirdagi keyingi interceptor (yoki oxirida — haqiqiy so'rov). U `Observable<HttpEvent>` qaytaradi — unga RxJS operatorlarini qo'shish mumkin.

## Nega shunday

Token, til sarlavhasi, base URL, loglash, loading indikatori, xato xabarlari — **har** so'rovga kerak. Har API metodida takrorlash — unutish va nomuvofiqlik. Interceptor — bir joy.

## Kod: tartib

Tekshirildi — `withInterceptors([a, b])`:

```
so'rov:  a  →  b  →  server
javob:   a  ←  b  ←  server
```

Log: `a>`, `b>`, `<b`, `<a`. So'rov ro'yxat tartibida, javob — teskari. Amaliy natija: **auth** — oldinroq (keyingilar tokenli so'rovni ko'radi), **xato ushlash** — ro'yxat boshida (hamma xatolarni oxirgi bo'lib ko'radi)... yoki ataylab oxirida. Tartibni o'ylab tuzing.

## Kod: sarlavha qo'shish

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Auth).accessToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

- `HttpRequest` **o'zgarmas** — `req.clone({...})` bilan yangi nusxa.
- Interceptor — injection kontekstida: `inject()` ishlaydi (tekshirildi). Lekin **sinxron** qismida — `pipe` ichidagi callback'larda emas.

### Faqat o'z API'ngizga

Token uchinchi tomon serverlariga (CDN, xarita API) ketmasligi kerak:

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_URL);
  if (!req.url.startsWith(apiUrl)) return next(req);
  ...
};
```

Bu **xavfsizlik** masalasi: token begona serverga sizib chiqsa, u sizning foydalanuvchingiz nomidan so'rov yubora oladi.

## Kod: `HttpContext` — so'rov darajasidagi bayroqlar

Ba'zi so'rovlar interceptor mantiqidan ozod bo'lishi kerak (login so'rovi token talab qilmaydi, fon so'rovi loading ko'rsatmaydi):

```ts
// http-context.ts
import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export const SILENT = new HttpContextToken<boolean>(() => false);
```

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);
  ...
};
```

```ts
login(credentials: Credentials) {
  return this.http.post<Tokens>('/api/auth/login', credentials, {
    context: new HttpContext().set(SKIP_AUTH, true),
  });
}
```

Tekshirildi: `SKIP_AUTH` bilan so'rovda `Authorization` sarlavhasi yo'q (`null`), boshqalarda — `Bearer T1`.

Sarlavha orqali bayroq berish (`X-Skip-Auth: 1`) — yomon: sarlavha serverga ham ketadi. `HttpContext` faqat brauzer ichida.

## Kod: base URL

```ts
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//.test(req.url)) return next(req);
  return next(req.clone({ url: `${inject(API_URL)}${req.url}` }));
};
```

API xizmatlari `/products` deydi — interceptor to'liq URL qiladi.

## Kod: loading indikatori

```ts
@Service()
export class LoadingState {
  private readonly count = signal(0);
  readonly active = computed(() => this.count() > 0);
  start() { this.count.update((n) => n + 1); }
  stop() { this.count.update((n) => n - 1); }
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SILENT)) return next(req);

  const loading = inject(LoadingState);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
```

`finalize` — muvaffaqiyat, xato **va bekor qilish** — uchalasida ham ishlaydi. `tap({ complete })` bekor qilishda ishlamaydi — hisoblagich "osilib" qoladi.

Hisoblagich (`count`), boolean emas — parallel so'rovlar uchun: bittasi tugasa, boshqasi hali ketayotgan bo'lishi mumkin.

## Kod: javobni kuzatish

```ts
export const timingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = performance.now();
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.debug(`${req.method} ${req.urlWithParams} — ${event.status}, ${Math.round(performance.now() - started)} ms`);
        }
      },
    }),
  );
};
```

`next(req)` **hodisalar** oqimini qaytaradi (`Sent`, `Response`, ba'zan `UploadProgress`...). Javobni olish uchun `event.type === HttpEventType.Response` yoki `event instanceof HttpResponse`.

## Kod: so'rovni yubormaslik (kesh)

```ts
const cache = new Map<string, HttpResponse<unknown>>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.context.get(CACHEABLE)) return next(req);

  const hit = cache.get(req.urlWithParams);
  if (hit) return of(hit.clone());

  return next(req).pipe(
    tap((e) => { if (e instanceof HttpResponse) cache.set(req.urlWithParams, e); }),
  );
};
```

Oddiy kesh — faqat tanlangan so'rovlar uchun (`CACHEABLE` konteksti), invalidatsiya siyosatini o'ylab. Ko'p hollarda `httpResource` + xizmat darajasidagi signal kesh soddaroq.

## Kod: eski klass interceptorlar

```ts
@Injectable()
export class LegacyInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) { ... }
}

provideHttpClient(withInterceptorsFromDi()),
{ provide: HTTP_INTERCEPTORS, useClass: LegacyInterceptor, multi: true },
```

Eski kutubxonalar hali shunday. `withInterceptorsFromDi()` ularni yoqadi. Yangi kodda — funksional.

## Kod: interceptorni test qilish

```ts
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
    { provide: Auth, useValue: { accessToken: () => 'T1' } },
  ],
});

const http = TestBed.inject(HttpClient);
const ctrl = TestBed.inject(HttpTestingController);

http.get('/api/me').subscribe();
expect(ctrl.expectOne('/api/me').request.headers.get('Authorization')).toBe('Bearer T1');
```

`provideHttpClientTesting()` — `provideHttpClient` dan **keyin**.

## Muhandislik nuqtai nazari

Tavsiya etilgan tartib:

```ts
withInterceptors([
  baseUrlInterceptor,   // 1. URL to'liq bo'lsin
  authInterceptor,      // 2. Token (58-bob — refresh bilan)
  loadingInterceptor,   // 3. Indikator
  errorInterceptor,     // 4. Umumiy xato xabarlari (57-bob)
])
```

Interceptor **kichik va bitta vazifali** bo'lsin. "Hamma narsa qiladigan" bitta interceptor — test qilib bo'lmaydi.

Interceptorga **biznes mantiq** kiritmang ("buyurtma so'rovida chegirma qo'sh") — u infratuzilma qatlami.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `req.headers.set(...)` natijasini ishlatmaslik | Sarlavha qo'shilmaydi (o'zgarmas) | `req.clone({ setHeaders })` |
| Token barcha domenlarga | Token sizib chiqadi | `API_URL` tekshiruvi |
| `pipe` callback ichida `inject()` | NG0203 | Funksiya boshida `inject` |
| Loading uchun `tap({ complete })` | Bekor qilinganda osilib qoladi | `finalize` |
| Loading boolean bilan | Parallel so'rovlarda erta o'chadi | Hisoblagich |
| Bayroqni sarlavha orqali | Serverga ketadi | `HttpContextToken` |
| `provideHttpClientTesting()` birinchi | Interceptorlar ishlamaydi | `provideHttpClient` dan keyin |
| Klass interceptor + `withInterceptorsFromDi` yo'q | Ishlamaydi | `withInterceptorsFromDi()` |

## Amaliyot

1. `loggingInterceptor` yozib, ikki interceptor tartibini log bilan tekshiring.
2. `authInterceptor` — faqat `API_URL` ga, `SKIP_AUTH` konteksti bilan.
3. `loadingInterceptor` + ekranning yuqorisida progress chizig'i; `SILENT` bilan fon so'rovi.
4. `timingInterceptor` bilan sekin so'rovlarni aniqlang.
5. `authInterceptor` uchun test yozing.

## Rasmiy hujjat

- Interceptorlar: <https://angular.dev/guide/http/interceptors>
- `HttpContext`: <https://angular.dev/api/common/http/HttpContext>
- HTTP testlash: <https://angular.dev/guide/http/testing>

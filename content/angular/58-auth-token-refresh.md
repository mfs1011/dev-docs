# 58 — Auth: token va refresh oqimi

[← Oldingi: Xatolar, qayta urinish, timeout](57-http-xatolar.md) · [Mundarija](README.md) · [Keyingi: Himoyalangan marshrutlar va rollar →](59-himoyalangan-marshrutlar.md)

## Tushuncha

SPA autentifikatsiyasining ikki asosiy modeli:

| Model | Qanday | Qachon |
| --- | --- | --- |
| **Cookie sessiya** | Server `HttpOnly` cookie qo'yadi, brauzer o'zi yuboradi | Frontend va API bitta domenda (yoki subdomen) |
| **Token (access + refresh)** | Qisqa `accessToken` sarlavhada, uzun `refreshToken` yangilash uchun | Bir nechta mijoz (web, mobil), boshqa domendagi API |

Token modeli:

```
Login  →  { accessToken (15 daqiqa), refreshToken (30 kun) }
So'rov →  Authorization: Bearer <accessToken>
401    →  POST /auth/refresh (refreshToken bilan) → yangi accessToken → so'rovni qaytarish
Refresh ham 401 → logout
```

## Nega shunday

Access token qisqa — o'g'irlansa ham tez eskiradi. Refresh token uzun — lekin faqat **bitta endpoint** ga yuboriladi va eng xavfsiz joyda saqlanadi. Foydalanuvchi har 15 daqiqada qayta kirmaydi.

## Kod: tokenni qayerda saqlash

| Joy | XSS'da o'g'irlanadimi | Eslatma |
| --- | --- | --- |
| `localStorage` | **Ha** — har qanday skript o'qiydi | Qulay, lekin eng zaif |
| Xotira (signal) | Qiyinroq — sahifa yangilanganda yo'qoladi | Access token uchun yaxshi |
| `HttpOnly` cookie | **Yo'q** — JS o'qiy olmaydi | Refresh token uchun eng yaxshi |

Tavsiya etilgan kombinatsiya:

- **Access token** — xotirada (`signal`), sahifa yangilanganda refresh orqali qayta olinadi.
- **Refresh token** — server qo'yadigan `HttpOnly; Secure; SameSite=Strict` cookie, faqat `/api/auth/refresh` yo'liga (`Path=/api/auth`).

Bu backend bilan kelishiladigan qaror. Laravel Sanctum (SPA rejimi) va Symfony'da cookie sessiya ko'pincha soddaroq va xavfsizroq — frontend va API bitta domenda bo'lsa, tokenlarsiz ham ishlash mumkin.

## Kod: `Auth` xizmati

```ts
const IS_REFRESH = new HttpContextToken(() => false);

@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  private refreshing$: Observable<string> | null = null;

  async login(credentials: Credentials) {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', credentials, {
        withCredentials: true,
        context: new HttpContext().set(IS_REFRESH, true),
      }),
    );
    this._accessToken.set(res.accessToken);
    this._user.set(res.user);
  }

  refresh(): Observable<string> {
    this.refreshing$ ??= this.http
      .post<AuthResponse>('/api/auth/refresh', null, {
        withCredentials: true,                               // HttpOnly cookie ketsin
        context: new HttpContext().set(IS_REFRESH, true),     // interceptor tegmasin
      })
      .pipe(
        map((res) => {
          this._accessToken.set(res.accessToken);
          this._user.set(res.user);
          return res.accessToken;
        }),
        finalize(() => (this.refreshing$ = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.refreshing$;
  }

  logout() {
    this._accessToken.set(null);
    this._user.set(null);
    this.http.post('/api/auth/logout', null, { withCredentials: true, context: new HttpContext().set(IS_REFRESH, true) }).subscribe({ error: () => {} });
    this.router.navigate(['/login']);
  }
}
```

### Single-flight: nega `refreshing$`

Sahifa ochilganda 5 ta so'rov parallel ketadi, token eskirgan — **5 ta 401**. Har biri refresh chaqirsa:

- 5 ta refresh so'rov.
- Refresh token rotatsiyasi bo'lsa (har refresh'da yangi refresh token) — 2-si eski token bilan keladi → server "token qayta ishlatildi" deb **hamma sessiyani bekor qiladi** → foydalanuvchi chiqib ketadi.

`refreshing$` — bitta ulashilgan Observable:

| Qism | Vazifa |
| --- | --- |
| `??=` | Refresh ketayotgan bo'lsa — o'shani qaytarish |
| `shareReplay({ bufferSize: 1, refCount: false })` | Barcha kutayotganlar bitta natijani oladi |
| `finalize(() => refreshing$ = null)` | Tugagach — keyingi eskirishda yangi refresh |

## Kod: interceptor

```ts
function withToken(req: HttpRequest<unknown>, token: string | null) {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const apiUrl = inject(API_URL);

  if (req.context.get(IS_REFRESH) || !req.url.startsWith(apiUrl)) return next(req);

  return next(withToken(req, auth.accessToken())).pipe(
    catchError((e: unknown) => {
      if (!(e instanceof HttpErrorResponse) || e.status !== 401) return throwError(() => e);

      return auth.refresh().pipe(
        switchMap((token) => next(withToken(req, token))),
        catchError((refreshError) => {
          auth.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
```

Tekshirildi (`HttpTestingController` bilan):

| Holat | Natija |
| --- | --- |
| Birinchi so'rov | `Authorization: Bearer old` |
| Ikki parallel so'rov → ikkalasi 401 | Refresh so'rovi — **1 ta** (`withCredentials: true`) |
| Refresh `{ accessToken: 'new' }` | Ikkala so'rov `Bearer new` bilan qayta yuborildi va muvaffaqiyatli |
| Keyingi 401 + refresh ham 401 | `logout()`, token `null`, chaqiruvchi 401 xatosini oldi |

`IS_REFRESH` konteksti — refresh so'rovining o'zi 401 olsa, cheksiz siklga tushmaslik uchun.

## Kod: ilova ochilganda sessiyani tiklash

Access token xotirada — sahifa yangilanganda yo'q. Ishga tushishda refresh qilib ko'rish:

```ts
// app.config.ts
providers: [
  provideAppInitializer(() => {
    const auth = inject(Auth);
    return firstValueFrom(auth.refresh()).catch(() => null);   // cookie yo'q bo'lsa — mehmon
  }),
]
```

Ilova birinchi render'dan oldin kutadi — guardlar (59-bob) to'g'ri qaror qabul qiladi. SSR'da bu brauzerda ishlashi kerak (cookie serverga boradi, lekin murakkablashadi — 62-bob).

## Kod: tablar orasida sinxronlash

Bir tabda chiqilsa, boshqasida ham chiqilsin:

```ts
@Service()
export class AuthSync {
  private readonly auth = inject(Auth);
  private readonly channel = new BroadcastChannel('auth');

  constructor() {
    this.channel.onmessage = (e) => { if (e.data === 'logout') this.auth.logout(); };
    inject(DestroyRef).onDestroy(() => this.channel.close());
  }

  notifyLogout() { this.channel.postMessage('logout'); }
}
```

## Muhandislik nuqtai nazari

**XSS — asosiy xavf.** Qayerda saqlasangiz ham, sahifada zararli skript ishlasa, u sizning nomingizdan so'rov yubora oladi. Token saqlash joyi — zararni **cheklaydi**, yo'q qilmaydi. Asosiy himoya:

- Angular shablonlari sukut bo'yicha HTML'ni tozalaydi — `[innerHTML]` va `bypassSecurityTrust*` ni ehtiyot bilan (32-bob).
- Content Security Policy (CSP) sarlavhasi.
- Uchinchi tomon skriptlarini minimal.

**CSRF** — cookie ishlatilsa. Angular `HttpClient` XSRF himoyasi: server `XSRF-TOKEN` cookie qo'yadi, Angular uni `X-XSRF-TOKEN` sarlavhasi sifatida qaytaradi (o'zgartiruvchi so'rovlarda, nisbiy URL'larga). Laravel buni tayyor qo'llaydi. Nomlar boshqacha bo'lsa — `withXsrfConfiguration({ cookieName, headerName })`.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Har 401 da alohida refresh | Parallel refreshlar, rotatsiyada sessiya bekor | `refreshing$` + `shareReplay` |
| Refresh so'rovi ham interceptor'dan o'tadi | Cheksiz sikl | `IS_REFRESH` konteksti |
| `finalize` da `refreshing$ = null` yo'q | Keyingi eskirishda eski natija | `finalize` |
| Refresh token `localStorage` da | XSS'da uzoq muddatli kirish | `HttpOnly` cookie |
| Token barcha domenlarga | Sizib chiqish | `API_URL` tekshiruvi |
| Ilova ochilganda sessiya tiklanmaydi | Yangilashda "chiqib ketadi" | `provideAppInitializer` + refresh |
| `withCredentials` yo'q | Cookie yuborilmaydi | `withCredentials: true` |
| Logout faqat klientda | Server sessiyasi tirik | `/api/auth/logout` ham |

## Amaliyot

1. `Auth` xizmati: login, refresh (single-flight), logout.
2. `authInterceptor` ni yozing va yuqoridagi to'rt holatni `HttpTestingController` bilan testlang.
3. Access tokenni 10 soniyaga qisqartirib (backendda), parallel so'rovlar bilan refresh bir marta ketishini DevTools'da tekshiring.
4. `provideAppInitializer` bilan sessiyani tiklash.
5. `BroadcastChannel` bilan tablar orasida logout.
6. Backend bilan: refresh token `HttpOnly; Secure; SameSite=Strict; Path=/api/auth` cookie'da.

## Rasmiy hujjat

- Interceptorlar: <https://angular.dev/guide/http/interceptors>
- XSRF himoyasi: <https://angular.dev/best-practices/security#httpclient-xsrf-csrf-security>
- Xavfsizlik: <https://angular.dev/best-practices/security>

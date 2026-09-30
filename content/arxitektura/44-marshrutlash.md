# 44 — Marshrutlash arxitekturasi

[← Oldingi: Dizayn tizimi](43-dizayn-tizimi.md) · [Mundarija](README.md) · [Keyingi: Formalar arxitekturasi →](45-formalar.md)

## Tushuncha

Marshrutlash — faqat "URL → komponent" emas. Arxitektura darajasida u to'rt vazifani bajaradi:

| Vazifa | Ma'no |
| --- | --- |
| **Holat manbai** | URL — ulashiladigan, saqlanadigan, "orqaga" bilan qaytariladigan holat (40-bob) |
| **Kod chegarasi** | Har bo'lim — alohida chunk (lazy loading) |
| **Kirish nazorati** | Guardlar — kim qaysi bo'limga kira oladi (UX darajasida) |
| **Layout ierarxiyasi** | Ichma-ich marshrutlar — umumiy ramka qayta yaratilmaydi |

## Nega shunday

URL — ilovaning **ochiq API**si: foydalanuvchilar uni saqlaydi, ulashadi, Google indekslaydi. URL tuzilmasini o'zgartirish — API'ni buzish kabi: eski havolalar 404 beradi. Shuning uchun URL dizayni — arxitektura qarori.

## Psevdokod: URL dizayni

```text
Yaxshi:
  /products                           ro'yxat
  /products?category=shoes&page=2     filtr va sahifa — query'da
  /products/nike-air-zoom-42          o'qiladigan slug (SEO) — ID bilan: /products/42-nike-air-zoom
  /account/orders/1842                ierarxiya = layout ierarxiyasi

Yomon:
  /productList?id=42&view=detail      holat va sahifa aralash
  /p/42                               tushunarsiz
  /products#page=2                    fragment serverga bormaydi (SSR ko'rmaydi)

Qoidalar:
  - Resurs — path'da, filtr/saralash/sahifa — query'da
  - O'zgartirilgan URL'lar — eski yo'ldan redirect (301)
  - Til — prefiks (/uz/, /en/) yoki domen
```

## Psevdokod: marshrut — bundle chegarasi

```text
routes:
  /                   → Home          (asosiy bundle)
  /products/**        → lazy("catalog")
  /checkout/**        → lazy("checkout"),  guard: authenticated
  /admin/**           → lazy("admin"),     guard (canMatch): role = admin  → chunk ruxsatsiz foydalanuvchiga YUKLANMAYDI
  **                  → NotFound (404 status SSR'da)
```

Lazy bo'limdan tashqaridan statik import — chegarani buzadi, kod asosiy bundle'ga tushadi. Chegara importlar bilan himoyalanadi (38-bob).

## Psevdokod: guardlar — mas'uliyat chegarasi

```text
Guard — UX:  kirmagan foydalanuvchini login'ga yo'naltirish, ruxsatsiz bo'limni ko'rsatmaslik
Server — xavfsizlik: har API so'rovida ruxsat tekshiruvi

Guard turlari:
  kirish mumkinmi?        → login'ga redirect (returnUrl bilan — faqat ichki yo'l, open redirect yo'q!)
  marshrut umuman mosmi?  → rolga qarab boshqa sahifa, chunk yuklanmaydi
  chiqish mumkinmi?       → saqlanmagan forma
  oldindan ma'lumot       → resolver (ko'pincha komponentda so'rov yaxshiroq)
```

## Framework'larda

| Imkoniyat | Angular | React | Vue | Next.js |
| --- | --- | --- | --- | --- |
| Asosiy | [40-bob](../angular/40-marshrutlash-asoslari.md) | React Router — [35-bob](../react/35-react-router.md) | [39–40](../vue/39-router-asoslari.md) | Fayl marshrutlash — [7-bob](../nextjs/07-marshrutlash.md) |
| URL → komponent input | `withComponentInputBinding` — [41-bob](../angular/41-parametrlar.md) | `useSearchParams` | `props: true` | `params`, `searchParams` |
| Lazy | `loadChildren`, `loadComponent` — [43-bob](../angular/43-lazy-loading.md) | `lazy()` | `() => import()` | Avtomatik (marshrut = chunk) |
| Guardlar | `canMatch`, `canActivate` — [44-bob](../angular/44-guard-va-resolver.md) | Loader/wrapper | `beforeEach` | Middleware — [14-bob](../nextjs/14-middleware.md) |
| Layout | Ichma-ich — [42-bob](../angular/42-ichma-ich-marshrutlar.md) | `<Outlet>` | `<RouterView>` ichma-ich | `layout.tsx` — [8-bob](../nextjs/08-layout-va-template.md) |

Angular 22'da tekshirilgan, arxitekturaga ta'sir qiladigan nozik joylar ([40–46-boblar](../angular/40-marshrutlash-asoslari.md)):
- `paramsInheritanceStrategy` sukut — `'always'`: bola marshrut ota parametrlarini oladi.
- Router input binding'da yo'q parametr → `undefined` (standart qiymat emas).
- `canMatch` false bo'lsa — keyingi marshrut sinaladi va lazy chunk **yuklanmaydi**.
- Marshrut `providers` injectori sahifadan chiqqanda **yo'q qilinmaydi** (`withAutoCleanupInjectors` bilan — yo'q qilinadi).

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Holat URL'da | Ulashish, orqaga, SEO | Parse/validatsiya, URL uzunligi |
| Holat xotirada | Oddiy | Yangilashda yo'qoladi, havola yo'q |
| Ko'p lazy bo'lim | Kichik boshlang'ich bundle | Navigatsiyada yuklash kechikishi (preload bilan kamayadi) |
| Resolver | Sahifa ma'lumot bilan ochiladi | "Bosdim — hech narsa bo'lmadi" hissi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Filtr faqat komponent holatida | Havola ulashilmaydi | Query parametr |
| URL o'zgartirildi, redirect yo'q | Eski havolalar, SEO yo'qoladi | 301 redirect |
| Guard — yagona himoya | API ochiq | Server tekshiruvi |
| `returnUrl` tekshirilmaydi | Open redirect | Faqat ichki yo'l |
| Admin kodi hammaga yuklanadi | Hajm, ma'lumot oshkor | `canMatch` / lazy + guard |
| Hash-routing (`#/`) zarurat bo'lmasa | SSR/SEO yomon | History API + server fallback |

## Amaliyot

1. Ilovangizning barcha URL'larini ro'yxatlang va yuqoridagi qoidalar bo'yicha baholang.
2. Bitta ro'yxat sahifasining filtr/sahifa holatini URL'ga ko'chiring.
3. Bundle tahlili bilan admin kodi asosiy chunk'da emasligini tekshiring.
4. Login'dagi `returnUrl` ga tashqi URL berib, open redirect himoyasini sinang.

## Manbalar

- W3C — *Cool URIs don't change* <https://www.w3.org/Provider/Style/URI>
- Google — *URL structure best practices*
- Angular — *Routing* <https://angular.dev/guide/routing>

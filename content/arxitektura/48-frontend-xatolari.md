# 48 — Frontend xatolari va kuzatuvchanlik

[← Oldingi: Unumdorlik byudjetlari](47-unumdorlik-byudjetlari.md) · [Mundarija](README.md) · [Keyingi: Build va yetkazib berish →](49-build-va-yetkazish.md)

## Tushuncha

Backend xatosi server logida ko'rinadi. Frontend xatosi — **foydalanuvchi brauzerida**: siz uni ko'rmaysiz, foydalanuvchi esa ko'pincha xabar bermaydi, shunchaki ketadi. Frontend kuzatuvchanligi — shu ko'rinmaslikni yo'q qilish.

Uch signal:

| Signal | Nima | Vosita |
| --- | --- | --- |
| **Xatolar** | JS exception, rad etilgan promise, resurs yuklanmadi | Sentry, global error handler |
| **Unumdorlik** | Web Vitals, sekin interaksiyalar | RUM (`web-vitals`) |
| **Xulq** | Qaysi oqimda to'xtashdi | Analitika, sessiya yozuvi (ehtiyotkorlik bilan) |

## Nega shunday

Frontend xatolarining o'ziga xos qiyinchiliklari:

- **Minify qilingan kod**: `a.b is not a function at e (main-7F3A.js:1:48213)` — source map'siz tushunarsiz.
- **Muhit xilma-xilligi**: eski brauzer, kengaytmalar, sekin tarmoq, tarjima plagini DOM'ni o'zgartiradi.
- **Shovqin**: kengaytmalar va boshqa saytlar skriptlari xatolari sizniki emas.
- **Eski versiya**: foydalanuvchi 3 kundan beri ochiq tab'da — eski kod, yangi API (49-bob).

## Psevdokod: xato chegaralari

```text
Global:        window.onerror, unhandledrejection, framework ErrorHandler → xato xizmatiga
Komponent/blok: bitta vidjet yiqilsa — faqat u "Yuklab bo'lmadi" ko'rsatadi, sahifa ishlashda davom etadi
Ma'lumot:       resurs error holati → "Qayta urinish" tugmasi (17, 42-boblar)
Marshrut:       lazy chunk yuklanmadi → sahifani qayta yuklash taklifi

Har xatoga kontekst:
  release (versiya), marshrut, foydalanuvchi ID (shaxsiy ma'lumotsiz), brauzer,
  oxirgi harakatlar (breadcrumbs), backend so'rovining trace/correlation ID (75-bob)
```

Correlation ID — frontend va backend'ni bog'laydi: frontend xatosi yonida "bu so'rov backend'da `req_8f2a` bo'lgan" — backend logida bir qidiruv bilan topiladi.

## Psevdokod: source map'lar — xavfsiz

```text
build: source map yaratiladi
deploy: source map'lar XATO XIZMATIGA yuklanadi (Sentry CLI), public serverga EMAS
        (kodingiz va izohlaringiz hammaga ochilmasin)
xato:   xizmat minify stack'ni asl fayl/qatorga aylantiradi
```

## Framework'larda

| Mavzu | Angular | React / Next | Vue |
| --- | --- | --- | --- |
| Global handler | `ErrorHandler`, `provideBrowserGlobalErrorListeners()` (ng new sukuti) | Error Boundary — [React 33-bob](../react/33-xatolar.md); Next.js `error.tsx` — [10-bob](../nextjs/10-loading-va-error.md) | `app.config.errorHandler` — [Vue 68-bob](../vue/68-monitoring-va-xatolar.md) |
| HTTP xatolari | Interceptor — [Angular 57-bob](../angular/57-http-xatolar.md) | fetch o'rami | interceptor |
| Chunk yuklash xatosi | `withNavigationErrorHandler` — [43-bob](../angular/43-lazy-loading.md) | `lazy()` + boundary | router `onError` |
| Monitoring | [Angular 78-bob](../angular/78-amaliy-loyiha.md) checklist | [React 48](../react/48-deploy-va-monitoring.md), [Next.js 49-bob](../nextjs/49-monitoring.md) | [68-bob](../vue/68-monitoring-va-xatolar.md) |

SSR ilovada xatolar **ikki joyda**: brauzer va Node server. Angular SSR'da tekshirilgan misol: serverda `window` ga murojaat — sahifa o'rniga 404 qaytdi, xato faqat server logida ([Angular 62-bob](../angular/62-ssr-asoslari.md)). Server tomon monitoringi ham shart.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Hamma xatoni yig'ish | Hech narsa o'tmaydi | Shovqin, kvota, narx |
| Filtrlash (kengaytmalar, eski brauzerlar) | Signal toza | Ba'zi haqiqiy xatolar o'tib ketishi mumkin |
| Sessiya yozuvi (replay) | Muammoni ko'rib tushunish | Shaxsiy ma'lumot xavfi — maskalash shart |
| Faqat konsol | Bepul | Production'da hech narsa ko'rinmaydi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Frontend monitoringi yo'q | Xatolarni foydalanuvchilar "ovoz berib" aytadi (ketish bilan) | Xato xizmati birinchi relizdan |
| Source map public | Kod ochiq | Faqat xato xizmatiga |
| Xatoda release yo'q | Qaysi versiyada tuzatilgani noma'lum | Release tegi |
| Bitta vidjet xatosi butun sahifani yiqitadi | Hammasi ishlamaydi | Xato chegaralari |
| Parol/token/shaxsiy ma'lumot xato kontekstida | Sizib chiqish | Maskalash, `beforeSend` filtr |
| Correlation ID yo'q | Frontend va backend xatosini bog'lab bo'lmaydi | So'rovlarda trace ID |

## Amaliyot

1. Xato xizmatini ulang va ataylab xato chiqarib, stack trace o'qilishini tekshiring (source map bilan).
2. Bitta vidjetni xato chegarasi bilan o'rang — ichida xato bo'lsa sahifa ishlashda davom etsinmi?
3. HTTP so'rovlariga correlation ID qo'shing va backend logida toping.
4. Xato kontekstida shaxsiy ma'lumot yo'qligini tekshiring.

## Manbalar

- Sentry — *JavaScript* hujjati <https://docs.sentry.io/platforms/javascript/>
- W3C — *Trace Context* <https://www.w3.org/TR/trace-context/>
- web.dev — *Measure and debug performance with RUM*

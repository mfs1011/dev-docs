# 69 — BFF va API gateway

[← Oldingi: Model mos kelmasligi](68-model-mos-kelmasligi.md) · [Mundarija](README.md) · [Keyingi: Idempotentlik →](70-idempotentlik.md)

## Tushuncha

Klientlar va backend servislar orasidagi oraliq qatlam — ikki xil:

| | API gateway | BFF (Backend for Frontend) |
| --- | --- | --- |
| Egasi | Platforma / infratuzilma jamoasi | Frontend jamoasi (yoki u bilan birga) |
| Nechta | Bitta, hamma klient uchun | Har klient turi uchun alohida (web BFF, mobil BFF) |
| Vazifa | **Ko'ndalang**: auth tekshiruvi, rate limit, marshrutlash, TLS, log | **Klientga moslash**: ma'lumotni birlashtirish, shakl, sessiya |
| Biznes mantiq | Yo'q | UI mantiq — ha; biznes qoidalari — yo'q |

```text
Brauzer ──▶ Web BFF ──┐
Mobil   ──▶ Mobil BFF ─┼──▶ API gateway ──▶ Ordering, Catalog, Billing, Identity ...
Partner ──────────────┘        (yoki BFF'lar to'g'ridan-to'g'ri servislarga)
```

## Nega shunday

Mikroservislar (21-bob) yoki ko'p API'lar bo'lsa, brauzer ularning hammasi bilan to'g'ridan-to'g'ri gaplashishi:
- bitta sahifaga 6 ta so'rov (har biri tarmoq kechikishi, mobil'da sekin);
- 6 xil auth, CORS, xato formati;
- ichki servislar topologiyasi oshkor;
- servis bo'linishini o'zgartirish — frontend'ni o'zgartirish.

Va klientlarning ehtiyoji har xil: mobil ekran kam ma'lumot va kam so'rov xohlaydi, web admin — ko'p maydonli jadval. Bitta "universal" API ikkalasiga ham noqulay.

## Psevdokod: BFF — birlashtirish

```text
// Brauzer bitta so'rov yuboradi
GET /bff/order-page/7f3a

// BFF ichida — parallel, ichki tarmoqda (tez)
order, customer, shipment = await all(
    ordering.get("/orders/7f3a"),
    identity.get("/customers/" + order.customerId),       // (yoki order javobidan keyin)
    shipping.get("/shipments?orderId=7f3a"),
)
return {
    id: order.id, status: order.status, total: order.total,
    customerName: customer.name,                  // faqat sahifaga kerakli maydonlar
    tracking: shipment?.trackingUrl ?? null,
    _actions: order._actions,
}
// Bitta servis yiqilsa — qisman javob (tracking: null), butun sahifa emas
```

## Psevdokod: BFF — auth uchun

60-bobdagi eng xavfsiz naqsh:

```text
Brauzer ◀──HttpOnly sessiya cookie──▶ BFF ──Bearer access token──▶ API'lar
                                       │ tokenlar BFF'da saqlanadi va yangilanadi (61-bob)
Brauzerda token yo'q → XSS bilan o'g'irlanmaydi; refresh logikasi frontend'da yo'q
```

## Psevdokod: nimani BFF'ga qo'ymaslik

```text
✅ BFF'da:   birlashtirish, shaklni moslash, UI uchun formatlash, sessiya/token, klientga xos kesh
❌ BFF'da:   biznes qoidalari ("chegirma 5%"), ruxsat qarori (faqat yetkazish — qaror servisda),
            DB'ga to'g'ridan-to'g'ri yozish

Sabab: ikki BFF (web, mobil) — biznes qoidasi ikki joyda bo'lib qoladi
```

## Psevdokod: API gateway — ko'ndalang vazifalar

```text
route /api/orders/**   → ordering-service
route /api/catalog/**  → catalog-service
for all routes:
    TLS, CORS, request size limit
    auth: JWT imzosini tekshirish (ruxsat qarori — servisda)
    rate limit (30-bob), WAF qoidalari
    correlation ID qo'shish (75-bob), access log
```

## Framework'larda

| Rol | Vositalar | Qayerda |
| --- | --- | --- |
| BFF — Next.js | Server Components, Route Handlers, Server Actions — tabiiy BFF | [Next.js 15](../nextjs/15-route-handlers.md), [29-bob](../nextjs/29-server-sorovlar.md) |
| BFF — Nuxt | `server/api` routes | [Vue 60-bob](../vue/60-nuxt-data-va-server.md) |
| BFF — Angular SSR | `server.ts` (Express) ichida API endpoint'lar | [Angular 62-bob](../angular/62-ssr-asoslari.md) |
| BFF — PHP | Symfony/Laravel ilovaning o'zi (monolit — tabiiy "BFF") | [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) (HttpClient) |
| Gateway | Kong, Traefik, nginx, Envoy, AWS API Gateway, Cloudflare | — |
| GraphQL BFF | Federation / schema stitching (56-bob) | — |

Ko'p hollarda **monolit backend allaqachon BFF vazifasini bajaradi** — alohida qatlam kerak emas. BFF ko'p servis yoki ko'p klient turi paydo bo'lganda oqlanadi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Brauzer → servislar to'g'ridan-to'g'ri | Qatlam yo'q | Ko'p so'rov, topologiya oshkor, auth tartibsizligi |
| Bitta universal API | Bitta shartnoma | Klientlar uchun noqulay shakl |
| BFF (har klientga) | Klientga ideal API, xavfsiz auth | Yana bir xizmat — deploy, monitoring, kechikish |
| API gateway | Ko'ndalang vazifalar bir joyda | Yagona nosozlik nuqtasi, konfiguratsiya murakkabligi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| BFF'da biznes qoidalari | Ikki BFF — ikki xil qoida | Qoidalar servislarda |
| Bitta BFF hamma klient uchun | "Universal API" muammosi qaytadi | Klient turi bo'yicha |
| Ketma-ket chaqiruvlar BFF'da | Kechikish qo'shiladi | Parallel, bog'liqlarini keyin |
| BFF bitta servis yiqilsa butun javobni yiqitadi | Qisman ishlash yo'q | Ixtiyoriy qismlar `null` + timeout |
| Monolitga keraksiz BFF qatlami | Ortiqcha xizmat | Monolit — o'zi BFF |
| Gateway'da ruxsat qarori | Ob'ekt darajasi bilinmaydi | Gateway — autentifikatsiya, servis — avtorizatsiya |

## Amaliyot

1. Eng murakkab sahifangiz nechta API so'rovi yuboradi? BFF endpoint bilan nechtaga tushadi?
2. BFF'ingiz bo'lsa: unda biznes qoidasi bormi — ro'yxat tuzing.
3. Auth tokenlari brauzerdami? BFF + cookie naqshiga o'tish narxini baholang.
4. BFF endpoint'da bitta ichki servis yiqilganda qisman javob qaytaring.

## Manbalar

- Sam Newman — *Backends For Frontends* <https://samnewman.io/patterns/architectural/bff/>
- Phil Calçado — *The Back-end for Front-end Pattern*
- IETF — *OAuth 2.0 for Browser-Based Applications* (BFF bo'limi)

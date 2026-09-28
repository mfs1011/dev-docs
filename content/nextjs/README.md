# Next.js 16 — App Router, RSC va production

Bu qo'llanma **rasmiy hujjat** (<https://nextjs.org/docs>) tuzilmasiga tayanadi va ustiga real loyihada kerak bo'ladigan narsalarni qo'shadi: tashqi backend bilan autentifikatsiya va token boshqaruvi, ma'lumotlar bazasi, to'lov, deploy va monitoring. Versiyalar npm registry'dan tekshirilgan (2026-yil sentabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Next.js | 16.3.6 | `npm view next version` |
| React | 19.3.0 | `npm view react version` |
| TypeScript | 7.0.2 | `npm view typescript version` |
| Auth.js (next-auth) | 5.x | `npm view next-auth version` |
| Prisma | 6.x | `npm view prisma version` |
| Drizzle ORM | 0.4x | `npm view drizzle-orm version` |
| TanStack Query | 5.104.0 | `npm view @tanstack/react-query version` |

> **Talab.** Bu qo'llanma React bilimini talab qiladi: komponentlar, hooklar, holat, effektlar. Ular [React qo'llanmasida](../react/README.md) bor. Agar `useState` va `useEffect` bilan ishlagan bo'lsangiz, shu yerdan boshlashingiz mumkin.

---

## Bu qo'llanma nimani hal qiladi

Next.js o'rganishdagi eng ko'p uchraydigan chalkashliklar:

1. **Server va klient chegarasi** — nima qayerda ishlaydi, `"use client"` qachon kerak;
2. **Kesh** — Next'ning to'rt qatlamli keshi va nega ma'lumot yangilanmaydi;
3. **Auth va tokenlar** — tashqi backend (Laravel, Symfony, Go) bilan ishlaganda access/refresh tokenni qayerda saqlash, qanday yangilash, server komponentlardan qanday so'rov yuborish.

Uchinchisi alohida qism (IV) sifatida batafsil ochiladi — kalit tushunchalardan boshlab, ishlaydigan to'liq oqimgacha.

Har bobning skeleti: **Tushuncha → Nega shunday → Kod → Muhandislik nuqtai nazari → Tipik xatolar → Amaliyot → Rasmiy hujjat**.

Kod misollar TypeScript va JavaScript ko'rinishida — yuqoridagi almashtirgich orqali.

---

## I qism — Poydevor (1–6)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [Next.js nima va nega shunday](01-kirish.md) | Muammo, tarix, React'dan farqi |
| 02 | [O'rnatish va loyiha tuzilmasi](02-ornatish.md) | `create-next-app`, papkalar, konfiguratsiya |
| 03 | [Render strategiyalari](03-render-strategiyalari.md) | Static, dynamic, ISR, streaming, PPR |
| 04 | [Server va klient chegarasi](04-server-klient-chegarasi.md) | `"use client"`, bundle chegarasi, kompozitsiya |
| 05 | [TypeScript va konfiguratsiya](05-typescript-konfiguratsiya.md) | `next.config`, muhit o'zgaruvchilari, tiplar |
| 06 | [Turbopack va build](06-turbopack-va-build.md) | Dev tezligi, build chiqishi, tahlil |

## II qism — App Router (7–15)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 07 | Marshrutlash asoslari *(tayyorlanmoqda)* | `app/` konvensiyasi, `page`, `layout` |
| 08 | Layout va shablon *(tayyorlanmoqda)* | Ichma-ich layout, holat saqlanishi |
| 09 | Dinamik marshrutlar *(tayyorlanmoqda)* | `[id]`, `[...slug]`, `generateStaticParams` |
| 10 | Yuklanish va xato holatlari *(tayyorlanmoqda)* | `loading.tsx`, `error.tsx`, `not-found` |
| 11 | Navigatsiya *(tayyorlanmoqda)* | `Link`, `useRouter`, prefetch, scroll |
| 12 | Marshrut guruhlari va parallel marshrutlar *(tayyorlanmoqda)* | `(group)`, `@slot`, intercepting |
| 13 | Metadata va SEO *(tayyorlanmoqda)* | `generateMetadata`, OG, sitemap, robots |
| 14 | Middleware *(tayyorlanmoqda)* | Edge, yo'naltirish, sarlavhalar, matcher |
| 15 | Route Handlers *(tayyorlanmoqda)* | `route.ts`, REST, webhook, streaming |

## III qism — Server komponentlar va ma'lumot (16–24)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 16 | Server Components *(tayyorlanmoqda)* | RSC modeli, seriyalash, chegaralar |
| 17 | Ma'lumot yuklash *(tayyorlanmoqda)* | `fetch`, ORM, parallel/ketma-ket, waterfall |
| 18 | Kesh: to'liq manzara *(tayyorlanmoqda)* | Request memo, Data Cache, Full Route, Router Cache |
| 19 | Qayta validatsiya *(tayyorlanmoqda)* | `revalidatePath/Tag`, ISR, on-demand |
| 20 | Streaming va Suspense *(tayyorlanmoqda)* | Bo'lak-bo'lak render, skeletlar, PPR |
| 21 | Server Actions *(tayyorlanmoqda)* | Mutatsiya, forma, xavfsizlik, validatsiya |
| 22 | Formalar va validatsiya *(tayyorlanmoqda)* | `useActionState`, zod, progressive enhancement |
| 23 | Optimistik yangilash *(tayyorlanmoqda)* | `useOptimistic`, xato holatida qaytarish |
| 24 | Klient holati Next ichida *(tayyorlanmoqda)* | URL holati, TanStack Query, Zustand |

## IV qism — Auth va tokenlar (25–31)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 25 | Kalit tushunchalar *(tayyorlanmoqda)* | Sessiya vs token, JWT ichi, access/refresh, muddat |
| 26 | Token qayerda saqlanadi *(tayyorlanmoqda)* | `httpOnly` cookie vs `localStorage`, XSS/CSRF |
| 27 | Tashqi backend bilan login oqimi *(tayyorlanmoqda)* | Laravel/Symfony API, Route Handler orqali proksi |
| 28 | Refresh oqimi *(tayyorlanmoqda)* | Avtomatik yangilash, parallel so'rovlar, rotation |
| 29 | Server komponentlardan so'rov *(tayyorlanmoqda)* | Cookie o'qish, `fetch` o'ramlari, xatolar |
| 30 | Himoyalangan marshrutlar *(tayyorlanmoqda)* | Middleware, layout tekshiruvi, rollar |
| 31 | Auth.js bilan *(tayyorlanmoqda)* | OAuth, credentials, sessiya, adapterlar |

## V qism — Ma'lumotlar bazasi va integratsiyalar (32–37)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 32 | Ma'lumotlar bazasi: Prisma *(tayyorlanmoqda)* | Sxema, migratsiya, so'rovlar, connection pool |
| 33 | Drizzle va SQL yondashuvi *(tayyorlanmoqda)* | Tipli SQL, qachon afzal |
| 34 | Fayl yuklash va saqlash *(tayyorlanmoqda)* | S3/R2, presigned URL, rasm optimizatsiyasi |
| 35 | To'lov: Stripe *(tayyorlanmoqda)* | Checkout, webhook, idempotentlik |
| 36 | Xabarnomalar va fon ishlari *(tayyorlanmoqda)* | Email, navbat, cron, webhook qabul qilish |
| 37 | Real vaqt *(tayyorlanmoqda)* | SSE, WebSocket, polling — qaysi biri qachon |

## VI qism — Pages Router va migratsiya (38–41)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 38 | Pages Router asoslari *(tayyorlanmoqda)* | `pages/`, `getServerSideProps`, `getStaticProps` |
| 39 | API Routes *(tayyorlanmoqda)* | Eski API qatlami, farqlari |
| 40 | Pages → App migratsiyasi *(tayyorlanmoqda)* | Bosqichma-bosqich reja, birga yashash |
| 41 | Eski loyihani o'qish *(tayyorlanmoqda)* | `_app`, `_document`, HOC naqshlari |

## VII qism — Sifat va production (42–50)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 42 | Testlash *(tayyorlanmoqda)* | Vitest, Testing Library, Playwright, server testlari |
| 43 | Unumdorlik *(tayyorlanmoqda)* | Bundle, RSC payload, rasm, shrift, Web Vitals |
| 44 | Erishimlilik *(tayyorlanmoqda)* | Semantika, fokus, marshrut e'lonlari |
| 45 | Xavfsizlik *(tayyorlanmoqda)* | XSS, CSRF, Server Action himoyasi, CSP, sirlar |
| 46 | Ko'p tillilik *(tayyorlanmoqda)* | Marshrut, kontent, `hreflang` |
| 47 | Deploy: Vercel *(tayyorlanmoqda)* | Build, kesh, edge, preview |
| 48 | Deploy: Docker va self-host *(tayyorlanmoqda)* | Standalone, nginx, ISR saqlash, skalalash |
| 49 | Monitoring va xatolar *(tayyorlanmoqda)* | Sentry, loglar, alertlar, RUM |
| 50 | Amaliy loyiha va checklist *(tayyorlanmoqda)* | To'liq ilova, reliz ro'yxati |

---

## Qanday o'qish kerak

- **Noldan (React bilan tanish):** 01 → 24 ketma-ket. Kesh (18) va server/klient chegarasi (04) — eng muhim ikkitasi.
- **Auth muammosi bo'lsa:** 25 → 31 alohida o'qilishi mumkin; 25 va 26 kalit tushunchalarni beradi.
- **Eski loyihani olib ketayotgan bo'lsangiz:** 38 → 41, keyin 04, 16, 18.
- **Deploy oldidan:** 43, 45, 47/48, 49.

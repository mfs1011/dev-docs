# React 19 — hooklar, holat va ilova arxitekturasi

Bu qo'llanma **rasmiy hujjat** (<https://react.dev>) tuzilmasiga tayanadi va ustiga real loyihada kerak bo'ladigan narsalarni qo'shadi: holat arxitekturasi, server ma'lumoti, router, formalar, testlash, unumdorlik, xavfsizlik. Versiyalar npm registry'dan tekshirilgan (2026-yil sentabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| React | 19.3.0 | `npm view react version` |
| React DOM | 19.3.0 | `npm view react-dom version` |
| Vite | 8.3.1 | `npm view vite version` |
| TypeScript | 7.0.2 | `npm view typescript version` |
| TanStack Query | 5.104.0 | `npm view @tanstack/react-query version` |
| Zustand | 5.0.15 | `npm view zustand version` |
| React Router | 7.x | `npm view react-router version` |
| Vitest | 5.0.1 | `npm view vitest version` |

> **Versiya siyosati.** React 19 — joriy barqaror major. U bilan birga Server Components, Actions, `use()`, yangi `ref` semantikasi va React Compiler keldi. React 18 dagi kod 19 da deyarli o'zgarishsiz ishlaydi; farq qiladigan joylar boblarda alohida belgilangan.

---

## Bu qo'llanma kimga

1. **Noldan boshlovchi.** HTML, CSS va JavaScript asoslarini bilasiz (funksiya, massiv metodlari, destrukturizatsiya, `async/await`, ES modullar). React'ni ko'rmagansiz.
2. **React yozadigan, lekin "nega shunday" ini bilmaydigan dasturchi.** `useEffect` yozasiz, lekin u qachon ikki marta ishlashini va nega `StrictMode` shunday qilishini bilmaysiz; `useMemo` qo'yasiz, lekin foyda berayotganini o'lchamagansiz.

Har bobning skeleti bir xil:

- **Tushuncha** — nima va qaysi muammoni yechadi.
- **Nega shunday** — React jamoasi nega shu dizaynni tanlagan, ichkarida nima bo'ladi.
- **Kod** — ishlaydigan, to'liq misollar.
- **Muhandislik nuqtai nazari** — umumiy dasturlash bilimi (brauzer, DOM, hodisa sikli, keshlash, immutability, ma'lumot oqimi) React kontekstida.
- **Tipik xatolar** — jadval: noto'g'ri yondashuv → nega yomon → to'g'ri yechim.
- **Amaliyot** — mashq; mashqlar 49-bobdagi to'liq loyihaga yig'iladi.
- **Rasmiy hujjat** — `react.dev` havolalari.

---

## JavaScript va TypeScript

Yuqoridagi **almashtirgich** orqali barcha misollarni TypeScript yoki oddiy JavaScript ko'rinishida o'qishingiz mumkin. Standart — TypeScript, chunki React ekotizmi amalda TS-first: kutubxonalar tiplar bilan keladi va props shartnomasi tiplarsiz tez chalkashadi.

Agar TypeScript'ni endi o'rganayotgan bo'lsangiz, **JavaScript** ni tanlab o'qing va 44–45-boblarda TS ga qayting.

---

## I qism — Poydevor (1–7)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [React nima va nega shunday](01-kirish.md) | Deklarativ UI, komponent modeli, React 19 holati |
| 02 | [O'rnatish va ishga tushirish](02-ornatish-va-ishga-tushirish.md) | Vite, `create-react-app` nega yo'q, birinchi ilova |
| 03 | [Loyiha tuzilmasi va Vite](03-loyiha-tuzilmasi-va-vite.md) | Papkalar, HMR, `import.meta.env`, build |
| 04 | [React'dan foydalanish usullari](04-foydalanish-usullari.md) | SPA, framework (Next/Remix), vidjet, React Native |
| 05 | [Render modeli: mental model](05-render-modeli.md) | `UI = f(state)`, render vs commit, immutability |
| 06 | [Reaktivlik: React yo'li](06-reaktivlik-react-yoli.md) | Nega qayta ishga tushirish, signal'lardan farqi |
| 07 | [React Compiler](07-react-compiler.md) | Avtomatik memoizatsiya, nima o'zgaradi |

## II qism — JSX va komponentlar (8–15)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 08 | [JSX sintaksisi](08-jsx.md) | Ifodalar, atributlar, fragment, shartlar |
| 09 | [Ro'yxatlar va `key`](09-royxatlar-va-key.md) | `map`, barqaror kalit, tartib o'zgarishi |
| 10 | [Komponent asoslari](10-komponent-asoslari.md) | Funksiya komponentlar, kompozitsiya |
| 11 | [Props](11-props.md) | Bir tomonlama oqim, default, `children` |
| 12 | [Hodisalar](12-hodisalar.md) | SyntheticEvent, delegatsiya, modifikatorlar |
| 13 | [Shartli render](13-shartli-render.md) | Ternar, `&&` tuzog'i, holat mashinasi |
| 14 | [Kompozitsiya naqshlari](14-kompozitsiya.md) | `children`, slot naqshi, render prop |
| 15 | [Uslublar](15-uslublar.md) | CSS Modules, Tailwind, CSS-in-JS holati |

## III qism — Holat va hooklar (16–26)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 16 | [`useState`](16-usestate.md) | Holat, batching, funksional yangilash |
| 17 | [Holatni to'g'ri loyihalash](17-holat-dizayni.md) | Minimal holat, hosila qiymat, normalizatsiya |
| 18 | [Holatni ko'tarish](18-holatni-kotarish.md) | Umumiy ota, controlled komponentlar |
| 19 | [`useReducer`](19-usereducer.md) | Holat mashinasi, murakkab o'tishlar |
| 20 | [Context](20-context.md) | Provider, qachon kerak, unumdorlik tuzog'i |
| 21 | [`useRef`](21-useref.md) | DOM, o'zgarmaydigan qiymat, `ref` callback |
| 22 | [`useMemo` va `useCallback`](22-usememo-usecallback.md) | Qachon kerak, qachon zarar |
| 23 | [`useId`, `useTransition`, `useDeferredValue`](23-concurrent-hooklar.md) | Concurrent imkoniyatlar |
| 24 | [`use()` va Suspense](24-use-va-suspense.md) | Promise o'qish, fallback, xato chegarasi |
| 25 | [Actions va `useActionState`](25-actions.md) | Forma actions, `useFormStatus`, `useOptimistic` |
| 26 | [O'z hookingiz](26-custom-hooklar.md) | Mantiqni ajratish, konvensiya, test |

## IV qism — Effektlar va tashqi dunyo (27–33)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 27 | [`useEffect`: asoslar](27-useeffect-asoslar.md) | Sinxronlash, bog'liqliklar, tozalash |
| 28 | [Effekt kerak emas](28-effekt-kerak-emas.md) | Hosila holat, hodisa mantiqi, keraksiz effektlar |
| 29 | [Effekt hayot sikli](29-effekt-hayot-sikli.md) | StrictMode ikki marta, poyga holatlari |
| 30 | [Tashqi tizimlar bilan ishlash](30-tashqi-tizimlar.md) | Kutubxona, xarita, WebSocket, `useSyncExternalStore` |
| 31 | [Ma'lumot yuklash](31-malumot-yuklash.md) | `fetch`, abort, holatlar, kesh zarurati |
| 32 | [TanStack Query](32-tanstack-query.md) | Server holati, kesh, mutatsiya, invalidatsiya |
| 33 | [Xatolar bilan ishlash](33-xatolar.md) | Error boundary, retry, foydalanuvchiga xabar |

## V qism — Ilova arxitekturasi (34–42)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 34 | [Papka tuzilmasi va modullar](34-arxitektura.md) | Feature-based, chegaralar, import yo'nalishi |
| 35 | [React Router](35-react-router.md) | Marshrutlar, loader, guard, lazy |
| 36 | [Klient holati: Zustand](36-zustand.md) | Store, selektor, middleware, test |
| 37 | [Holat qayerda yashaydi](37-holat-qayerda.md) | URL, server keshi, store, komponent |
| 38 | [Formalar](38-formalar.md) | Controlled/uncontrolled, React Hook Form, zod |
| 39 | [Autentifikatsiya (klient tomoni)](39-auth-klient.md) | Token oqimi, himoyalangan marshrut, kalit tushunchalar |
| 40 | [Dizayn tizimi](40-dizayn-tizimi.md) | Komponent API, variantlar, Headless UI |
| 41 | [Unumdorlik](41-unumdorlik.md) | Profiler, memo, virtualizatsiya, bundle |
| 42 | [Erishimlilik](42-erishimlilik.md) | Semantika, fokus, ARIA, klaviatura |

## VI qism — Sifat va production (43–50)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 43 | [Testlash strategiyasi](43-testlash-strategiyasi.md) | Nimani test qilish, piramida |
| 44 | [Vitest va Testing Library](44-vitest-testing-library.md) | Komponent testi, MSW, user-event |
| 45 | [TypeScript bilan React](45-typescript.md) | Props, hooklar, generiklar, tuzoqlar |
| 46 | [Kod sifati](46-kod-sifati.md) | ESLint (hooks qoidalari), Prettier, CI |
| 47 | [Xavfsizlik](47-xavfsizlik.md) | XSS, `dangerouslySetInnerHTML`, token, CSP |
| 48 | [Deploy va monitoring](48-deploy-va-monitoring.md) | Build, kesh, Sentry, Web Vitals |
| 49 | [Amaliy loyiha](49-amaliy-loyiha.md) | Hamma bo'lakni bitta ilovaga yig'ish |
| 50 | [Checklist va keyingi qadam](50-checklist.md) | Reliz ro'yxati, Next.js ga o'tish |

---

## Qanday o'qish kerak

- **Noldan:** 01 → 33 ketma-ket, mashqlarni bajarib. Keyin 34–42.
- **Ishlayotgan dasturchi:** 05, 06, 17, 22, 28, 29 — eng ko'p xato qilinadigan joylar.
- **Next.js ga tayyorgarlik:** 05, 24, 25, 31, 32 — server komponentlar mantiqi shularga tayanadi.

Next.js bo'yicha alohida qo'llanma bor: u shu kitobdagi bilimni talab qiladi va uning ustiga App Router, RSC, server actions va deploy mavzularini qo'yadi.

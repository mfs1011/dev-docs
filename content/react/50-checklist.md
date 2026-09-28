# 50 — Checklist va keyingi qadam

[← Oldingi: Amaliy loyiha](49-amaliy-loyiha.md) · [Mundarija](README.md)

## Tushuncha

Yakuniy bob uch qismdan iborat: amaliy checklistlar, React'ning asosiy tamoyillari va keyingi yo'nalish (Next.js).

## Checklist: yangi loyiha

- [ ] Vite + React + TypeScript (`npm create vite@latest`) — 02-bob
- [ ] `strict: true`, `tsc -b` build skriptida — 45, 46-bob
- [ ] ESLint (flat config) + `react-hooks` + `jsx-a11y` + Prettier — 46-bob
- [ ] `@` aliasi va papka konvensiyasi — 03, 34-bob
- [ ] CSS tokenlari (`:root` o'zgaruvchilari) + dark tema — 15, 40-bob
- [ ] React Router — 35-bob
- [ ] TanStack Query + DevTools — 32-bob
- [ ] HTTP klient qatlami (`ApiError`) — 31-bob
- [ ] Error Boundary (ildiz + marshrut) — 33-bob
- [ ] Vitest + Testing Library + MSW — 44-bob
- [ ] Xato monitoringi (Sentry) — 48-bob
- [ ] CI: lint + typecheck + test + build — 46-bob
- [ ] `.env.example` va sirlar siyosati — 03, 47-bob

## Checklist: komponent yozib bo'lgach

- [ ] Props minimal va ma'noli (`variant`/`size`, 10 ta boolean emas) — 11, 40-bob
- [ ] Hosila qiymat render paytida hisoblanadi, holatda saqlanmaydi — 17-bob
- [ ] `v-for` o'rniga `map` da barqaror `key` — 09-bob
- [ ] To'rt holat: loading / error / empty / data — 13-bob
- [ ] Tugmalar `<button>`, havolalar `<Link>` — 42-bob
- [ ] Forma maydonlarida `label`, `aria-invalid`, `aria-describedby` — 38, 42-bob
- [ ] Effektlar tozalanadi (`return () => ...`) — 27-bob
- [ ] Ortiqcha effekt yo'q (28-bobdagi tekshiruv ro'yxati)
- [ ] Ikki marta bosishdan himoya (`disabled` + bayroq) — 12-bob
- [ ] Testda xatti-harakat tekshiriladi, tuzilma emas — 43-bob

## Checklist: reliz

- [ ] CI yashil (lint, types, test, build)
- [ ] `npm run build && npm run preview` lokal sinaldi
- [ ] Bundle hajmi budjetda (< 200 KB gzip boshlang'ich) — 41-bob
- [ ] Lighthouse: performance, a11y, SEO — 41, 42-bob
- [ ] Sirlar bundle'da yo'q (`grep`) — 47-bob
- [ ] Kesh sarlavhalari (`index.html` — no-cache) — 48-bob
- [ ] SPA fallback ishlaydi
- [ ] Source map monitoringga yuklangan, saytdan o'chirilgan — 48-bob
- [ ] Smoke test o'tdi
- [ ] Rollback yo'li ma'lum

## Kod: asosiy tamoyillar

Qo'llanma davomida takrorlangan qoidalar — ular React'dan kengroq:

**1. `UI = f(state)`** — DOM'dan o'qib qaror qabul qilmang, holatdan hisoblang (05-bob).

```jsx
// ✗
if (document.querySelector('.modal')) { }

// ✓
if (isModalOpen) { }
```

**2. Hosila qiymatni saqlamang** (17-bob).

```jsx
// ✗
const [total, setTotal] = useState(0)
useEffect(() => setTotal(calc(items)), [items])

// ✓
const total = calc(items)
```

**3. Ma'lumot bir tomonlama oqadi** — pastga props, yuqoriga callback (11, 18-bob).

**4. Holat ishlatiladigan joyga eng yaqin yashasin** — va u beshta joydan mosida (37-bob).

**5. Effekt — tashqi tizim bilan sinxronlash**, hodisa mantiqi emas (27, 28-bob).

**6. Klientdagi hech narsa ishonchli emas** — tekshiruv serverda (47-bob).

**7. O'lchang, keyin optimallashtiring** (41-bob).

**8. Xatti-harakatni test qiling, ko'rinishni emas** (43-bob).

## Kod: React 19 dan keyin nima o'zgardi

Eski materiallarda uchraydigan, endi kerak bo'lmagan narsalar:

| Eski | Yangi |
| --- | --- |
| `forwardRef` | `ref` — oddiy prop (21-bob) |
| `useMemo`/`useCallback` hamma joyda | React Compiler (07-bob) |
| `propTypes` | TypeScript (45-bob) |
| Sinf komponentlar | Funksiya + hooklar (faqat Error Boundary sinf) |
| `componentDidMount` mental modeli | Sinxronlash modeli (27-bob) |
| `create-react-app` | Vite yoki framework (02-bob) |
| Redux boilerplate | Zustand / RTK / Query (32, 36-bob) |
| `react-helmet` | `<title>` JSX'da (React 19) |

## Muhandislik nuqtai nazari: keyingi qadam — Next.js

Bu qo'llanmadagi hamma narsa Next.js'da ham ishlaydi: komponentlar, hooklar, holat, formalar, testlar. Next qo'shadigan narsalar:

| Mavzu | Nima o'zgaradi |
| --- | --- |
| Server Components | Komponent serverda ishlaydi, JS bundle'ga tushmaydi |
| Marshrutlash | Fayl tuzilmasi (`app/`) — router konfiguratsiyasi o'rniga |
| Ma'lumot yuklash | Serverda `await`, waterfall va kesh boshqacha |
| Kesh | To'rt qatlamli kesh tizimi |
| Server Actions | Mutatsiya to'g'ridan-to'g'ri serverda |
| Auth | Cookie server tomonda o'qiladi (39-bobning davomi) |
| Deploy | Node/Edge runtime kerak |

Next.js qo'llanmasi shu kitobning davomi sifatida yozilgan va React bilimini talab qiladi.

**Qachon Next'ga o'tish kerak:** SEO, birinchi ekran tezligi yoki server yaqinidagi ma'lumot muhim bo'lsa (04-bob). Login orqasidagi ichki tizim uchun Vite SPA yetarli.

## Muhandislik nuqtai nazari: keyin nima o'qish kerak

| Yo'nalish | Manba |
| --- | --- |
| Rasmiy hujjat (to'liq) | <https://react.dev> |
| React blog va RFC'lar | <https://react.dev/blog>, <https://github.com/reactjs/rfcs> |
| TanStack Query naqshlari | <https://tkdodo.eu/blog/practical-react-query> |
| Erishimlilik | <https://www.w3.org/WAI/ARIA/apg/> |
| Brauzer platformasi | <https://web.dev>, <https://developer.mozilla.org> |
| Testlash | <https://testing-library.com/docs/guiding-principles> |

Eng foydali odat: **changelog'larni o'qish** (React, Vite, React Router, TanStack Query) — ular ekotizm qayoqqa ketayotganini ko'rsatadi.

## Muhandislik nuqtai nazari: senior darajaning belgilari

React'da "senior" — hooklarni yod bilish emas. Amaliy belgilar:

1. **Holatni to'g'ri joylashtira oladi** (37-bob) va buni tushuntira oladi;
2. **Keraksiz effektlarni ko'radi** (28-bob) va ularsiz yechim taklif qiladi;
3. **Optimizatsiyani o'lchash bilan boshlaydi** (41-bob), taxmin bilan emas;
4. **Komponent shartnomasini loyihalay oladi** — props minimal, kengaytirilishi oson (40-bob);
5. **Xato va chekka holatlarni oldindan o'ylaydi** (13, 33-bob);
6. **Erishimlilikni "keyin qo'shiladigan narsa" deb bilmaydi** (42-bob);
7. **Testni xatti-harakatga bog'laydi** (43-bob);
8. **Qachon kutubxona qo'shish, qachon yozish kerakligini biladi** (31, 40-bob).

## Amaliyot

1. Loyihangizni "yangi loyiha checklisti" bo'yicha tekshiring: nechta punkt bajarilmagan?
2. Bitta komponentni "komponent checklisti" bo'yicha ko'rib chiqing va tuzating.
3. Ilovangizdagi barcha `useEffect` larni 28-bobdagi tekshiruv ro'yxatidan o'tkazing.
4. Holat auditi jadvalini to'ldiring (37-bob).
5. Reliz checklistini jamoangiz uchun moslashtiring va PR shabloniga qo'shing.
6. Next.js qo'llanmasining 01–04-boblarini o'qing va o'z loyihangizga kerakmi-yo'qmi degan qarorni yozing.

## Rasmiy hujjat

- React hujjati: <https://react.dev>
- React 19 e'loni: <https://react.dev/blog/2024/12/05/react-19>
- React qoidalari: <https://react.dev/reference/rules>
- Next.js: <https://nextjs.org/docs>

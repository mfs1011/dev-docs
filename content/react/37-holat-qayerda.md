# 37 — Holat qayerda yashaydi

[← Oldingi: Klient holati: Zustand](36-zustand.md) · [Mundarija](README.md) · [Keyingi: Formalar →](38-formalar.md)

## Tushuncha

Bu bob — 16–36-boblardagi holat mavzularining xaritasi. React ilovasidagi har bir ma'lumot beshta joydan birida yashaydi:

| Joy | Nima uchun | Vosita | Bob |
| --- | --- | --- | --- |
| **Komponent** | Faqat shu ekranga tegishli | `useState`, `useReducer` | 16, 19 |
| **URL** | Ulashiladi, yangilanishda saqlanadi | `useSearchParams`, `params` | 35 |
| **Server keshi** | Serverdan keladi, eskiradi | TanStack Query | 32 |
| **Global store** | Butun ilovaga kerak, tez o'zgaradi | Zustand | 36 |
| **Context** | Daraxtga uzatiladi, kamdan-kam o'zgaradi | `createContext` | 20 |

Noto'g'ri joy tanlash — React ilovalaridagi eng qimmat arxitektura xatosi.

## Kod: qaror daraxti

```
Bu ma'lumot serverdan keladimi?
├─ Ha → Server keshi (TanStack Query)
│        └─ Faqat ID/filtr saqlanadi, obyekt nusxasi emas
└─ Yo'q
   │
   ├─ Havolada ulashilsa mantiqiymi? (filtr, sahifa, tab, ochilgan resurs)
   │  └─ Ha → URL
   │
   ├─ Butun ilovaga kerakmi? (savat, tema, joriy foydalanuvchi)
   │  ├─ Tez-tez o'zgaradimi? → Store (Zustand)
   │  └─ Kamdan-kam? → Context
   │
   ├─ Ikki-uch komponentga kerakmi?
   │  └─ Umumiy otaga ko'taring (18-bob)
   │
   └─ Faqat shu komponentga kerakmi? → useState
```

## Kod: amaliy misol — mahsulotlar sahifasi

::: ts
```tsx
function CatalogPage() {
  // 1. URL — ulashiladigan holat
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const query = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'created'

  // 2. Server keshi — mahsulotlar
  const { data, isPending, error } = useQuery({
    queryKey: productKeys.list({ page, query, sort }),
    queryFn: () => api.get<Paginated<Product>>(`/products?page=${page}&q=${query}&sort=${sort}`),
    placeholderData: (prev) => prev,
  })

  // 3. Global store — savat
  const addToCart = useCartStore((s) => s.add)

  // 4. Komponent holati — faqat shu ekranga tegishli UI
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false)

  // 5. Context — tema (kamdan-kam o'zgaradi)
  const { theme } = useTheme()

  // ...
}
```
:::

::: js
```jsx
function CatalogPage() {
  // 1. URL
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const query = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? 'created'

  // 2. Server keshi
  const { data, isPending, error } = useQuery({
    queryKey: productKeys.list({ page, query, sort }),
    queryFn: () => api.get(`/products?page=${page}&q=${query}&sort=${sort}`),
    placeholderData: (prev) => prev,
  })

  // 3. Global store
  const addToCart = useCartStore((s) => s.add)

  // 4. Komponent holati
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false)

  // 5. Context
  const { theme } = useTheme()
}
```
:::

Beshta manba bitta komponentda — va bu **to'g'ri**: har biri o'z vazifasini bajaradi.

## Kod: tipik noto'g'ri joylashtirishlar

```jsx
// ✗ Server ma'lumoti store'da
const products = useProductStore((s) => s.products)

useEffect(() => {
  api.get('/products').then((data) => setProducts(data))
}, [])

// ✓ Server keshida
const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProducts })
```

```jsx
// ✗ Filtr store'da — havola ulashilmaydi
const filters = useFilterStore((s) => s.filters)

// ✓ URL'da
const [searchParams] = useSearchParams()
```

```jsx
// ✗ Modal ochiqligi global store'da
const isModalOpen = useUiStore((s) => s.isProductModalOpen)

// ✓ Komponentda (agar URL'da bo'lishi shart bo'lmasa)
const [isOpen, setIsOpen] = useState(false)
```

```jsx
// ✗ Foydalanuvchi ma'lumoti har komponentda qayta so'raladi
const { data: user } = useQuery({ queryKey: ['me'], queryFn: getMe })

// ✓ Bu to'g'ri! Query kesh tufayli bitta so'rov ketadi (32-bob)
```

Oxirgi misol muhim: query kutubxonasi bilan bir xil ma'lumotni bir necha joyda so'rash **normal** — deduplikatsiya va kesh ishlaydi.

## Kod: holatni ko'chirish

Loyiha o'sganda holat joyi o'zgarishi mumkin. Tipik yo'llar:

```
useState → holatni ko'tarish → Context → Store
useState → URL (ulashish kerak bo'lganda)
useState + useEffect → Query (server ma'lumoti ekani aniqlanganda)
```

Har ko'chirishda o'zingizdan so'rang: **hozirgi joy nima uchun yetmayapti?** Agar javob "props drilling" bo'lsa — avval kompozitsiyani sinab ko'ring (14-bob).

## Muhandislik nuqtai nazari: URL — birinchi navbatda ko'rib chiqiladigan joy

Boshlovchilar URL'ni kam ishlatadi, holbuki u bepul beradi:

- Havolani ulashish;
- Sahifani yangilashda holat saqlanishi;
- Orqaga/oldinga tugmalari;
- Analitika (qaysi filtr ko'p ishlatiladi);
- SEO (server render bo'lsa).

Shuning uchun savol **"bu holat URL'da bo'lishi mumkinmi?"** — birinchi savol bo'lishi kerak.

URL'ga mos: qidiruv so'zi, filtrlar, sahifa, saralash, ochilgan tab, tanlangan element ID, modal (agar mazmunli bo'lsa).

URL'ga mos emas: forma qoralamasi, scroll pozitsiyasi, hover holati, ochiq dropdown.

## Muhandislik nuqtai nazari: "global store" tuzog'i

Redux davridan qolgan odat — hamma narsani global store'ga solish. Oqibatlari:

| Muammo | Tafsilot |
| --- | --- |
| Komponentlar qayta ishlatilmaydi | Ular store'ga bog'langan |
| Test murakkab | Har testda store sozlash kerak |
| Ortiqcha renderlar | Selektorlarsiz butun store'ga obuna |
| Holat "iflos" qoladi | Komponent o'chsa ham holat qoladi |
| Kim o'zgartirdi — noaniq | Har joydan yozish mumkin |

Amaliy mezon: **agar holat faqat bitta ekranda ishlatilsa, u global emas.**

## Muhandislik nuqtai nazari: holat auditi

Mavjud loyihani tekshirish uchun jadval tuzing:

| Holat | Hozir qayerda | Bo'lishi kerak | Sabab |
| --- | --- | --- | --- |
| `products` | Zustand | Query | Server ma'lumoti |
| `filters` | `useState` | URL | Ulashiladi |
| `user` | Query | Query | ✓ To'g'ri |
| `isSidebarOpen` | Zustand | `useState` (Layout'da) | Faqat bitta joyda |
| `theme` | Zustand | Context yoki Zustand | ✓ Ikkalasi ham maqbul |
| `cartItems` | `useState` (App'da) | Zustand | Ko'p joyda kerak, persist kerak |

Bu jadvalni to'ldirish — ilovaning arxitektura holatini ko'rishning eng tez usuli.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Server ma'lumotini store yoki `useState` da | Kesh, eskirish qo'lda | Query kutubxonasi |
| Filtr/sahifani komponentda | Ulashilmaydi, yangilashda yo'qoladi | URL |
| Lokal UI holatini global store'da | Komponent qayta ishlatilmaydi | `useState` |
| Hamma narsani context'ga | Ortiqcha renderlar | Store yoki kompozitsiya |
| Bir ma'lumotni ikki joyda saqlash | Sinxrondan chiqadi | Bitta manba |
| Query ma'lumotini store'ga ko'chirish | Ikki haqiqat | Query — manba |
| Holat joyini hech qachon qayta ko'rmaslik | Loyiha o'sadi, joylar eskiradi | Vaqti-vaqti bilan audit |

## Amaliyot

1. Loyihangiz uchun yuqoridagi holat auditi jadvalini to'ldiring.
2. Bitta filtrni `useState` dan URL'ga ko'chiring va havolani ulashib sinab ko'ring.
3. Store'dagi server ma'lumotini Query'ga ko'chiring — nechta qator kod yo'qoldi?
4. Global store'dagi bitta lokal UI holatini komponentga qaytaring.
5. Qaror daraxtini chizib chiqing va uni jamoangiz bilan kelishib oling.

## Rasmiy hujjat

- Holat tuzilmasini tanlash: <https://react.dev/learn/choosing-the-state-structure>
- Holatni ko'tarish: <https://react.dev/learn/sharing-state-between-components>
- TanStack Query — server holati falsafasi: <https://tkdodo.eu/blog/practical-react-query>

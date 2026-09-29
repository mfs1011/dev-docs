# 41 — Eski loyihani o'qish

[← Oldingi: Pages → App migratsiyasi](40-migratsiya.md) · [Mundarija](README.md) · [Keyingi: Testlash →](42-testlash.md)

## Tushuncha

Sizga ishlab turgan Next loyihasi topshirildi. Kod 2021-yildan beri yozilgan, hujjat yo'q, asl mualliflar ketgan. Birinchi hafta — **tushunish**, tuzatish emas.

Bu bob ikkita narsani beradi:

1. Notanish Next loyihasini **tartib bilan o'qish** usuli;
2. Eski naqshlarni **tanish** — ular nima uchun yozilgan va bugungi ekvivalenti nima.

Asosiy printsip: **eski kod ahmoqona emas.** Har naqsh o'z vaqtida mavjud bo'lmagan imkoniyat o'rnini bosgan. `getLayout` — layout yo'qligi uchun. HOC zanjiri — middleware yo'qligi uchun. Redux — server holati boshqaruvi yo'qligi uchun.

## Kod: o'qish tartibi

Quyidagi tartib deyarli har doim ishlaydi:

```bash
# 1. Versiya va skriptlar
cat package.json | head -40

# 2. Qaysi router?
ls -d pages app 2>/dev/null

# 3. Konfiguratsiya — eng ko'p ma'lumot beradigan fayl
cat next.config.js next.config.mjs next.config.ts 2>/dev/null

# 4. Marshrutlar xaritasi
find pages app -name "page.*" -o -name "*.tsx" -not -path "*/components/*" | sort

# 5. Muhit o'zgaruvchilari — tashqi bog'liqliklar ro'yxati
cat .env.example 2>/dev/null || grep -rho "process\.env\.[A-Z_]*" --include="*.ts" --include="*.tsx" . | sort -u

# 6. Kirish nuqtalari
cat pages/_app.tsx app/layout.tsx 2>/dev/null

# 7. Middleware — global qoidalar
cat middleware.ts middleware.js 2>/dev/null
```

`next.config.js` — eng zich ma'lumot manbai:

```js
// Bu fayl loyiha tarixini aytib beradi
module.exports = {
  reactStrictMode: false,          // ← nega o'chirilgan? Ehtimol eski kutubxona
  swcMinify: true,
  images: {
    domains: ['cdn.example.com'],  // ← eskirgan API (endi remotePatterns)
  },
  async redirects() {              // ← eski URL'lar tarixi
    return [{ source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true }]
  },
  async rewrites() {               // ← proksi qilinadigan backend
    return [{ source: '/api/v1/:path*', destination: 'https://api.example.com/:path*' }]
  },
  webpack(config) {                // ← maxsus ehtiyojlar
    config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] })

    return config
  },
  typescript: { ignoreBuildErrors: true },   // ← 🚩 texnik qarz
  eslint: { ignoreDuringBuilds: true },      // ← 🚩 texnik qarz
}
```

Oxirgi ikki qator — ogohlantirish belgisi: loyihada tiplar yoki lint xatolari bor va ular yashirilgan.

## Kod: naqsh 1 — `getLayout`

::: ts
```tsx
// Ko'rasiz:
DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
  )
}

// pages/_app.tsx da:
const getLayout = Component.getLayout ?? ((page) => page)

return getLayout(<Component {...pageProps} />)
```
:::

::: js
```jsx
DashboardPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
)
```
:::

**Nima uchun:** Pages Router'da ichma-ich layout yo'q edi. Layout `_app` da bo'lsa, u har sahifada bir xil bo'lardi.

**Bugungi ekvivalenti:** `app/(app)/layout.tsx` (08, 30-bob). Migratsiyada birinchi olib tashlanadi.

## Kod: naqsh 2 — HOC zanjiri

::: ts
```tsx
// Ko'rasiz:
export default withAuth(withRole('admin', withAnalytics(withErrorBoundary(Page))))

// yoki API tomonida:
export default withSentry(withCors(withRateLimit(handler)))
```
:::

::: js
```jsx
export default withAuth(withRole('admin', withAnalytics(Page)))
```
:::

**Nima uchun:** middleware va layout yo'q edi; kesishuvchi vazifalarni (auth, log, xato) kompozitsiya bilan qo'shish yagona yo'l edi.

**Bugungi ekvivalenti:** DAL funksiyalari (`requireRole`, 30-bob), `error.tsx`, middleware.

**O'qish maslahati:** zanjirni ichkaridan tashqariga o'qing. `withAuth(withRole(...))` — avval `withRole`, keyin `withAuth` o'raladi, lekin **bajarilishda** `withAuth` birinchi ishlaydi.

## Kod: naqsh 3 — `useEffect` bilan ma'lumot olish

::: ts
```tsx
// Ko'rasiz:
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)

    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Spinner />
  if (error) return <Error message={error} />

  return <OrderList orders={orders} />
}
```
:::

::: js
```jsx
export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return <OrderList orders={orders} />
}
```
:::

**Nima uchun:** `getServerSideProps` sahifani dinamik qilardi; ba'zan statik sahifa + klient fetch tezroq ko'rinardi.

**Muammosi:** waterfall (HTML → JS → fetch → render), SEO yo'q, `loading`/`error` holatlari qo'lda.

**Bugungi ekvivalenti:** `async` server komponent (16, 29-bob) yoki TanStack Query (24-bob).

**O'qish maslahati:** `cancelled` bayrog'i bor-yo'qligini tekshiring. Yo'q bo'lsa — race condition bor (komponent tez almashsa, eski javob yangisini bosib ketadi).

## Kod: naqsh 4 — server holati uchun Redux

::: ts
```ts
// Ko'rasiz: store/ordersSlice.ts
export const fetchOrders = createAsyncThunk('orders/fetch', async () => {
  const response = await fetch('/api/orders')

  return response.json()
})

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
```
:::

::: js
```js
export const fetchOrders = createAsyncThunk('orders/fetch', async () => {
  const response = await fetch('/api/orders')

  return response.json()
})
```
:::

**Nima uchun:** 2019–2021 da server ma'lumotini ham global store'ga solish standart edi.

**Muammosi:** 60 qator kod bitta `SELECT` uchun; kesh, qayta so'rash, eskirish — hammasi qo'lda.

**Bugungi ekvivalenti:** server komponent (`await getOrders()`) yoki TanStack Query. Redux **klient holati** uchun qoladi (modal ochiq, savat, tema) — server ma'lumoti uchun emas (24-bob).

**O'qish maslahati:** store'dagi har slice'ni ikkiga ajrating: **server ma'lumoti** (ko'chiriladi) va **klient holati** (qoladi).

## Kod: naqsh 5 — `_document` da stil kutubxonasi

::: ts
```tsx
// Ko'rasiz: pages/_document.tsx
import Document, { DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      }
    } finally {
      sheet.seal()
    }
  }
}
```
:::

::: js
```jsx
// Bir xil naqsh, TypeScript'siz
```
:::

**Nima uchun:** CSS-in-JS server tomonida stillarni yig'ib, HTML'ga kiritishi kerak edi (aks holda stilsiz kontak ko'rinadi — FOUC).

**Bugungi holat:** bu naqsh App Router'da **ishlamaydi**. Migratsiya rejasida CSS-in-JS alohida band bo'lishi kerak (40-bob).

**Ko'rsangiz:** loyihada styled-components yoki Emotion bor — migratsiya narxini oshiring.

## Kod: naqsh 6 — `getInitialProps`

::: ts
```tsx
// Ko'rasiz (eng eski naqsh):
Page.getInitialProps = async (ctx: NextPageContext) => {
  const response = await fetch(`${baseUrl}/api/data`)

  return { data: await response.json() }
}
```
:::

::: js
```jsx
Page.getInitialProps = async (ctx) => {
  const response = await fetch(`${baseUrl}/api/data`)

  return { data: await response.json() }
}
```
:::

**Nima uchun:** Next 9 dan oldin ma'lumot olishning yagona yo'li edi.

**Muammosi:** u **ham serverda, ham klientda** ishlaydi. Ya'ni kod ikki muhitga mos bo'lishi kerak, va sirlarni (`process.env.SECRET`) u yerda ishlatib bo'lmaydi. Yana: `getInitialProps` bo'lsa, **butun ilova** avtomatik statik optimizatsiyadan chiqadi.

**Bugungi ekvivalenti:** `getServerSideProps` (Pages) yoki server komponent (App).

**Ko'rsangiz:** bu eng katta texnik qarz belgisi. `_app.tsx` da `getInitialProps` bo'lsa, **hech bir sahifa statik emas**.

## Kod: naqsh 7 — `isMounted` va SSR farqlari

::: ts
```tsx
// Ko'rasiz:
const [mounted, setMounted] = useState(false)

useEffect(() => setMounted(true), [])

if (!mounted) return null

return <ThemeToggle theme={localStorage.getItem('theme')} />
```
:::

::: js
```jsx
const [mounted, setMounted] = useState(false)

useEffect(() => setMounted(true), [])

if (!mounted) return null

return <ThemeToggle theme={localStorage.getItem('theme')} />
```
:::

**Nima uchun:** serverda `localStorage` yo'q; server va klient HTML'i farq qilsa hydration xatosi chiqadi.

**Bugungi holat:** naqsh hali ham to'g'ri, lekin narxi bor — kontent birinchi renderda ko'rinmaydi (CLS). Yaxshiroq: cookie'dan o'qib serverda render qilish, yoki `suppressHydrationWarning` bilan aniq joyni belgilash.

## Kod: naqsh 8 — API o'ramlari va `axios` instansiyasi

::: ts
```ts
// Ko'rasiz: lib/api.ts
import axios from 'axios'

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')        // 🚩 XSS xavfi (26-bob)

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh')
      const { data } = await axios.post('/auth/refresh', { refresh })   // 🚩 single-flight yo'q

      localStorage.setItem('token', data.accessToken)

      return api(error.config)
    }

    return Promise.reject(error)
  },
)
```
:::

::: js
```js
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})
```
:::

**Nima uchun:** SPA davridan qolgan standart naqsh.

**Ikki muammosi:** token `localStorage` da (XSS'da o'g'irlanadi, 26-bob) va refresh single-flight'siz (parallel 401'larda rotation kuyadi, 28-bob).

**Bugungi ekvivalenti:** httpOnly cookie + server tomonidagi `api()` o'rami (28, 29-bob).

**Ko'rsangiz:** bu tuzatishga arziydigan xavfsizlik masalasi — migratsiyadan qat'i nazar.

## Kod: naqsh 9 — `next-i18next` va eski i18n

::: ts
```js
// Ko'rasiz: next.config.js
module.exports = {
  i18n: {
    locales: ['uz', 'ru', 'en'],
    defaultLocale: 'uz',
  },
}

// va sahifalarda:
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale, ['common'])) },
})
```
:::

::: js
```js
// Bir xil
```
:::

**Nima uchun:** Next'ning o'rnatilgan i18n marshrutlash tizimi.

**Bugungi holat:** `i18n` konfiguratsiyasi **App Router'da ishlamaydi**. U yerda marshrutlash qo'lda quriladi (`app/[locale]/...`) yoki `next-intl` ishlatiladi (46-bob).

## Kod: xavfsizlik tekshiruvi

Eski loyihada birinchi qidiriladigan narsalar:

```bash
# Sirlar klientga tushganmi?
grep -rn "NEXT_PUBLIC_.*\(SECRET\|KEY\|TOKEN\|PASSWORD\)" --include="*.ts" --include="*.tsx" .

# Token localStorage'damii?
grep -rn "localStorage.*\(token\|jwt\|auth\)" -i --include="*.ts" --include="*.tsx" .

# dangerouslySetInnerHTML — sanitizatsiya bormi?
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" .

# Xom SQL
grep -rn "queryRaw\|sql\.raw\|query(" --include="*.ts" .

# Build xatolari yashirilganmi?
grep -n "ignoreBuildErrors\|ignoreDuringBuilds" next.config.*

# Eskirgan bog'liqliklar
npx npm-check-updates
npm audit
```

`NEXT_PUBLIC_` prefiksli sir — eng jiddiy topilma: u **klient bundle'ida ochiq turadi** va uni o'qish uchun DevTools yetarli.

## Kod: loyihani xaritaga tushirish

Birinchi hafta oxirida shu jadval to'lgan bo'lsin:

| Savol | Qayerdan topiladi |
| --- | --- |
| Qaysi router? | `ls pages app` |
| Next versiyasi? | `package.json` |
| Ma'lumot qayerdan? | `getServerSideProps`, `useEffect`, ORM importi |
| Auth qanday? | `middleware.ts`, `_app.tsx`, cookie nomlari |
| Holat boshqaruvi? | `store/`, `context/`, Provider'lar |
| Stillar? | `globals.css`, `tailwind.config`, `styled` importlari |
| Tashqi xizmatlar? | `.env.example`, `process.env` qidiruvi |
| Deploy qayerda? | `vercel.json`, `Dockerfile`, `.github/workflows/` |
| Testlar bormi? | `__tests__/`, `*.test.*`, `playwright.config` |
| Monitoring? | `sentry.*.config.*`, `instrumentation.ts` |

Bu jadval — migratsiya rejasining (40-bob) asosi.

## Muhandislik nuqtai nazari: nimaga tegmaslik kerak

Birinchi oyda:

| Tegmang | Nega |
| --- | --- |
| Ishlaydigan naqshni "zamonaviylashtirish" | Siz bilmagan sabab bo'lishi mumkin |
| Katta refaktoring | Test yo'q — nima singanini bilmaysiz |
| Bog'liqliklarni ommaviy yangilash | Bir vaqtda 20 ta o'zgarish |
| `ignoreBuildErrors` ni o'chirish | 400 ta xato chiqadi, ish to'xtaydi |

Tegishingiz mumkin:

| Teging | Nega |
| --- | --- |
| Xavfsizlik teshiklari | Kutib bo'lmaydi |
| Yangi funksiyani App Router'da yozish | Tabiiy migratsiya |
| Test qo'shish | Keyingi ish uchun poydevor |
| Hujjatlashtirish | Sizdan keyingiga |

`ignoreBuildErrors` ni o'chirish — bosqichma-bosqich: `tsconfig.json` da `strict: false` dan boshlab, fayl-fayl `// @ts-expect-error` qo'yib, keyin tozalash.

## Muhandislik nuqtai nazari: arxeologiya vositalari

```bash
# Kim, qachon, nega
git log --oneline --follow -- path/to/file.tsx
git blame -L 40,60 path/to/file.tsx

# Eng ko'p o'zgargan fayllar — ehtimol eng muammoli
git log --format=format: --name-only | sort | uniq -c | sort -rn | head -20

# Kod o'lchami va murakkabligi
npx cloc --exclude-dir=node_modules,.next .

# Bog'liqlik grafigi — nima nimani import qiladi
npx madge --circular --extensions ts,tsx src/

# Bundle nimadan iborat
ANALYZE=true npm run build
```

`git log --format=format: --name-only | sort | uniq -c | sort -rn` — kam ma'lum, juda foydali buyruq: eng ko'p tegilgan fayllar odatda eng muhim yoki eng muammoli joylar.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Darhol refaktoring | Tushunmasdan sindirish | Avval o'qish, xaritaga tushirish |
| Eski naqshni "ahmoqona" deb hisoblash | Kontekstni yo'qotish | Nega shunday yozilganini toping |
| Hammasini birdan yangilash | Nima singanini topib bo'lmaydi | Bittadan |
| `.env.example` ni o'qimaslik | Tashqi bog'liqliklar noma'lum | Birinchi o'qiladigan fayl |
| `next.config` ni e'tiborsiz qoldirish | Rewrites/redirects sizni chalg'itadi | Diqqat bilan o'qing |
| Testsiz o'zgartirish | Regressiya | Avval test yozing (42-bob) |
| Xavfsizlik topilmasini keyinga qoldirish | Ochiq teshik | Darhol tuzating |
| `ignoreBuildErrors` ni birdan o'chirish | Yuzlab xato | Bosqichma-bosqich |

## Amaliyot

1. GitHub'dan ochiq Next loyihasi oling (masalan `vercel/commerce` eski tegi) va yuqoridagi 7 qadamli tartib bilan o'qing.
2. Loyiha xaritasi jadvalini to'ldiring.
3. Xavfsizlik `grep` larini ishga tushiring va topilmalarni ro'yxatga oling.
4. `git log --format=format: --name-only | sort | uniq -c | sort -rn | head` bilan eng ko'p o'zgargan fayllarni toping — nega ular o'zgarib turgan?
5. Bitta eski naqshni toping (`getLayout`, HOC, `useEffect` fetch) va uning bugungi ekvivalentini yozing.
6. `npx madge --circular` bilan siklik importlarni qidiring.
7. Migratsiya rejasini yozing (40-bob): qaysi sahifa, qaysi tartibda, qanday xavf.

## Rasmiy hujjat

- Pages Router: <https://nextjs.org/docs/pages>
- Migratsiya: <https://nextjs.org/docs/app/guides/migrating/app-router-migration>
- `next.config.js`: <https://nextjs.org/docs/app/api-reference/config/next-config-js>
- Bundle tahlili: <https://nextjs.org/docs/app/guides/package-bundling>

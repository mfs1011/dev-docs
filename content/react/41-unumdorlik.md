# 41 — Unumdorlik

[← Oldingi: Dizayn tizimi](40-dizayn-tizimi.md) · [Mundarija](README.md) · [Keyingi: Erishimlilik →](42-erishimlilik.md)

## Tushuncha

React ilovalaridagi sekinlik to'rt sababdan biri:

| Sabab | Belgisi | Yechim |
| --- | --- | --- |
| Katta bundle | Birinchi yuklanish sekin | Code splitting |
| Ortiqcha render | Yozganda kechikish | Memoizatsiya, kompozitsiya |
| Ko'p DOM tuguni | Ro'yxat sekin aylanadi | Virtualizatsiya |
| Og'ir hisob | Interfeys qotadi | Web Worker, `useDeferredValue` |

Har biri boshqacha hal qilinadi — shuning uchun **avval o'lchang**.

## Kod: 1 — o'lchash

**React DevTools → Profiler:**

1. "Record why each component rendered" ni yoqing (Settings);
2. Yozib oling, muammoli harakatni bajaring;
3. Flame graph'da eng uzun ustunlarni ko'ring;
4. "Ranked" ko'rinishida eng qimmat komponentlarni toping.

**Chrome Performance:** CPU 4× slowdown + Network Slow 4G bilan yozib oling. "Long tasks" (50 ms+) — INP muammosining manbai.

**Haqiqiy foydalanuvchilar (RUM):**

```js
import { onCLS, onINP, onLCP } from 'web-vitals'

onLCP((m) => sendToAnalytics(m))
onINP((m) => sendToAnalytics(m))
onCLS((m) => sendToAnalytics(m))
```

Lokal mashinada hammasi tez — haqiqiy tasvir faqat RUM'da ko'rinadi (48-bob).

## Kod: 2 — bundle va code splitting

```jsx
// Marshrut darajasida (35-bob)
const AdminPanel = lazy(() => import('@/features/admin'))

<Suspense fallback={<PageSkeleton />}>
  <AdminPanel />
</Suspense>

// Og'ir komponent — kerak bo'lganda
const ChartPanel = lazy(() => import('./ChartPanel'))

{showChart && (
  <Suspense fallback={<ChartSkeleton />}>
    <ChartPanel data={data} />
  </Suspense>
)}
```

Tahlil:

```bash
npm i -D rollup-plugin-visualizer
```

```js
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [react(), visualizer({ filename: 'dist/stats.html', gzipSize: true })]
```

Tipik "og'ir mehmonlar": `moment` (→ `date-fns` yoki `Intl`), butun `lodash` (→ alohida funksiyalar), ikonkalar to'plami (→ faqat ishlatilganlari), `chart.js` (→ lazy).

Vendor chunk'ini ajratish — keshni uzoq saqlash uchun:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('@tanstack')) return 'vendor-query'

          return 'vendor'
        }
      },
    },
  },
}
```

## Kod: 3 — ortiqcha renderlarni kamaytirish

Tartib (22-bob):

```jsx
// a) Kompozitsiya — og'ir qismni children sifatida uzatish
function Layout({ children }) {
  const [query, setQuery] = useState('')      // holat o'zgarsa `children` qayta render BO'LMAYDI

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      {children}
    </>
  )
}

<Layout><HeavyDashboard /></Layout>

// b) Holatni pastroqqa tushirish
function SearchInput() {
  const [query, setQuery] = useState('')      // holat faqat shu komponentda
  // ...
}

// c) Memoizatsiya (o'lchangandan keyin)
const Row = memo(function Row({ item, onSelect }) { /* ... */ })

// d) React Compiler (07-bob) — avtomatik
```

Eng ko'p uchraydigan sabab — **har renderda yangi obyekt/funksiya** props sifatida uzatilishi (11, 22-bob).

## Kod: 4 — virtualizatsiya

```bash
npm i @tanstack/react-virtual
```

::: ts
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function BigList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={items[virtualRow.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Row item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```
:::

::: js
```jsx
import { useVirtualizer } from '@tanstack/react-virtual'

function BigList({ items }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={items[virtualRow.index].id}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Row item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```
:::

10 000 qator uchun DOM'da 20–30 element qoladi. Chegara: qatorlar balandligi taxminan ma'lum bo'lishi kerak.

## Kod: 5 — og'ir hisobni siqib chiqarish

```jsx
// Renderni kechiktirish (23-bob)
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => search(items, deferredQuery), [items, deferredQuery])

// So'rovni kechiktirish
const debouncedQuery = useDebouncedValue(query, 300)

// Asosiy oqimdan chiqarish
const worker = useMemo(() => new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' }), [])

useEffect(() => {
  worker.postMessage({ items, query })
  worker.onmessage = (e) => setResults(e.data)
}, [worker, items, query])
```

Chegara: hisob **50 ms** dan uzoq bo'lsa, foydalanuvchi kechikishni sezadi (INP).

## Kod: 6 — rasm va shriftlar

```jsx
{/* Birinchi ekran: tez va o'lchamli (CLS oldini oladi) */}
<img src={hero} width={1200} height={600} fetchPriority="high" alt="" />

{/* Qolganlari */}
<img src={thumb} width={320} height={180} loading="lazy" decoding="async" alt={title} />
```

```css
@font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
    font-display: swap;
}
```

Amalda rasm optimizatsiyasi ko'pincha JS optimizatsiyasidan ko'proq foyda beradi: 2 MB PNG butun bundle'dan katta bo'lishi mumkin.

## Muhandislik nuqtai nazari: optimizatsiya tartibi

1. **Kamroq ma'lumot** — sahifalash, kerakli maydonlar (32-bob);
2. **Kamroq JS** — code splitting, kutubxonalarni almashtirish;
3. **Kamroq DOM** — virtualizatsiya, shartli render;
4. **Kamroq render** — kompozitsiya, memoizatsiya;
5. **Mikro-optimizatsiya** — deyarli hech qachon kerak emas.

Boshlovchilar odatda 4–5 dan boshlaydi. 10 000 qatorni `memo` bilan o'rash — baribir 10 000 DOM tuguni.

## Muhandislik nuqtai nazari: budjetlar

| Ko'rsatkich | Maqsad |
| --- | --- |
| LCP | < 2.5 s (4G, o'rta telefon) |
| INP | < 200 ms |
| CLS | < 0.1 |
| Boshlang'ich JS | < 200 KB gzip |
| Marshrut chunk'i | < 100 KB gzip |
| DOM tugunlari | < 1 500 |

CI'da tekshirish (46-bob):

```yaml
- run: npm run build
- name: Bundle hajmi
  run: |
    SIZE=$(find dist/assets -name 'index-*.js' -exec gzip -c {} \; | wc -c)
    [ "$SIZE" -lt 250000 ] || { echo "::error::Bundle 250 KB dan oshdi"; exit 1; }
```

## Muhandislik nuqtai nazari: erta optimizatsiya

```jsx
{/* ✗ 20 elementli ro'yxatga virtualizatsiya */}
<VirtualList items={twentyItems} />

{/* ✗ Har komponentga memo */}
export default memo(SimpleText)
```

Bu kod murakkablashtiradi va o'lchanadigan foyda bermaydi. Qoida: **optimizatsiya — o'lchangan muammoga javob.**

Teskarisi ham to'g'ri: 5 000 qatorli jadvalni "keyinroq tuzatamiz" deb qoldirish — foydalanuvchi uchun ilova buzilgan degani.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| O'lchamasdan optimallashtirish | Vaqt behuda | Profiler |
| Har komponentni `memo` bilan o'rash | Solishtirish narxi, foyda yo'q | O'lchangandan keyin |
| `memo` + barqaror bo'lmagan props | `memo` ishlamaydi | `useMemo`/`useCallback` yoki kompilyator |
| Katta ro'yxatni to'liq render qilish | Sahifa qotadi | Sahifalash/virtualizatsiya |
| Bundle'ni hech tahlil qilmaslik | Kutilmagan 500 KB kutubxona | `visualizer` |
| Rasm o'lchamlarini bermaslik | CLS | `width`/`height` |
| Birinchi ekran komponentini `lazy` qilish | LCP yomonlashadi | Statik import |

## Amaliyot

1. Profiler'da eng ko'p render bo'ladigan uch komponentni toping va sababini yozing.
2. `visualizer` bilan bundle tahlilini yarating; eng katta uch modulni aniqlang va bittasini lazy qiling.
3. 10 000 qatorli ro'yxat yasang: oddiy, sahifalangan va virtualizatsiyalangan — uchtasini o'lchang.
4. Og'ir hisobni Web Worker'ga ko'chiring va INP farqini o'lchang.
5. CI'ga bundle hajmi tekshiruvini qo'shing.
6. CPU 4× slowdown bilan ilovangizni aylanib chiqing: qaysi ekran eng sekin?

## Rasmiy hujjat

- React Profiler: <https://react.dev/reference/react/Profiler>
- `memo`: <https://react.dev/reference/react/memo>
- TanStack Virtual: <https://tanstack.com/virtual/latest>
- Web Vitals: <https://web.dev/articles/vitals>

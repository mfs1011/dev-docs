# 33 — Xatolar bilan ishlash

[← Oldingi: TanStack Query](32-tanstack-query.md) · [Mundarija](README.md) · [Keyingi: Papka tuzilmasi va modullar →](34-arxitektura.md)

## Tushuncha

React'da xatolarni uch joyda ushlash kerak:

| Qatlam | Nima ushlaydi | Vosita |
| --- | --- | --- |
| Render | Komponent render paytidagi xato | Error Boundary |
| Async | So'rov, mutatsiya, promise | `try/catch`, query kutubxonasi |
| Global | Ushlanmagan hamma narsa | `window.onerror`, `unhandledrejection` |

Error Boundary **faqat render xatolarini** ushlaydi — hodisa ishlov beruvchisidagi yoki `setTimeout` ichidagi xatolarni emas.

## Kod: Error Boundary

React'da hozircha bu faqat sinf komponent orqali yoziladi:

::: ts
```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)      // monitoringga yuborish (48-bob)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset)

    return this.props.children
  }
}
```
:::

::: js
```jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.props.onError?.(error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset)

    return this.props.children
  }
}
```
:::

Tayyor yechim ham bor: `react-error-boundary` paketi (`useErrorBoundary` hooki bilan).

## Kod: chegaralarni joylashtirish

```jsx
{/* Ildizda — "hamma narsa buzildi" ekrani */}
<ErrorBoundary fallback={(e, reset) => <FullPageError error={e} onRetry={reset} />}>
  <App />
</ErrorBoundary>

{/* Marshrut darajasida — sahifa buzilsa, navigatsiya qoladi */}
<Layout>
  <ErrorBoundary fallback={(e, reset) => <PageError error={e} onRetry={reset} />}>
    <Outlet />
  </ErrorBoundary>
</Layout>

{/* Vidjet darajasida — bitta bo'lak buzilsa, qolgani ishlaydi */}
<ErrorBoundary fallback={() => <WidgetError />}>
  <SalesChart />
</ErrorBoundary>
```

Qoida: **kamida ikki daraja** — ildiz va marshrut. Xavfli yoki uchinchi tomon komponentlariga alohida chegara.

## Kod: Suspense bilan birga

```jsx
<ErrorBoundary fallback={(e, reset) => <ErrorBox error={e} onRetry={reset} />}>
  <Suspense fallback={<Skeleton />}>
    <UserProfile userId={userId} />
  </Suspense>
</ErrorBoundary>
```

Tartib: `ErrorBoundary` tashqarida (24-bob). Aks holda yuklash xatosi ushlanmaydi.

## Kod: TanStack Query bilan

::: ts
```tsx
// Query xatolarini Error Boundary'ga uzatish
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: getUser,
  throwOnError: true,        // xato render paytida tashlanadi → boundary ushlaydi
})
```
:::

::: js
```jsx
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: getUser,
  throwOnError: true,
})
```
:::

Yoki xatoni joyida ko'rsatish (ko'pincha yaxshiroq):

```jsx
const { data, error, refetch } = useQuery({ queryKey: ['user', id], queryFn: getUser })

if (error) return <ErrorBox error={error} onRetry={refetch} />
```

Qoida: **kutilgan xato** (404, 422, tarmoq) — joyida ko'rsatiladi; **kutilmagan xato** (kod xatosi) — boundary'ga.

## Kod: xatolarni toifalarga bo'lish

::: ts
```tsx
export function getErrorMessage(error: unknown): { title: string; action?: 'retry' | 'login' | 'home' } {
  if (error instanceof ApiError) {
    if (error.status === 401) return { title: 'Sessiya tugadi', action: 'login' }
    if (error.status === 403) return { title: 'Bu amalga ruxsat yo\'q', action: 'home' }
    if (error.status === 404) return { title: 'Topilmadi', action: 'home' }
    if (error.status === 422) return { title: 'Ma\'lumotlar noto\'g\'ri' }
    if (error.status >= 500) return { title: 'Serverda xatolik', action: 'retry' }
  }

  if (!navigator.onLine) return { title: 'Internet aloqasi yo\'q', action: 'retry' }

  return { title: 'Kutilmagan xatolik', action: 'retry' }
}
```
:::

::: js
```jsx
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 401) return { title: 'Sessiya tugadi', action: 'login' }
    if (error.status === 403) return { title: 'Bu amalga ruxsat yo\'q', action: 'home' }
    if (error.status === 404) return { title: 'Topilmadi', action: 'home' }
    if (error.status === 422) return { title: 'Ma\'lumotlar noto\'g\'ri' }
    if (error.status >= 500) return { title: 'Serverda xatolik', action: 'retry' }
  }

  if (!navigator.onLine) return { title: 'Internet aloqasi yo\'q', action: 'retry' }

  return { title: 'Kutilmagan xatolik', action: 'retry' }
}
```
:::

Foydalanuvchiga **nima qilishi kerakligini** ayting, texnik tafsilotni emas. `error.stack` — monitoringga (48-bob).

## Kod: global xatolar

```jsx
// main.tsx
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { type: 'unhandledrejection' })
})

window.addEventListener('error', (event) => {
  reportError(event.error ?? new Error(event.message), {
    source: event.filename,
    line: event.lineno,
  })
})
```

Bular Error Boundary ushlamaydigan xatolarni qamrab oladi: hodisa ishlov beruvchilari, `setTimeout`, ushlanmagan promise'lar.

## Kod: chunk yuklash xatosi

Deploydan keyin eski sahifa ochiq turgan foydalanuvchi eski chunk nomini so'raydi va uni topa olmaydi (41, 48-bob):

```jsx
const Dashboard = lazy(() =>
  import('./Dashboard').catch((error) => {
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()        // yangi versiyaga o'tish
    }

    throw error
  }),
)
```

## Muhandislik nuqtai nazari: xato UX'i

| Xato turi | Ko'rinishi | Harakat |
| --- | --- | --- |
| Validatsiya (422) | Maydon yonida | Tuzatish (38-bob) |
| Autentifikatsiya (401) | Login sahifasiga yo'naltirish | Qayta kirish |
| Ruxsat (403) | Tushuntirish | Bosh sahifaga |
| Topilmadi (404) | Sahifa/bo'lak | Orqaga, qidiruv |
| Server (500) | Blok + "Qayta urinish" | Retry |
| Tarmoq | Banner | Avtomatik retry |
| Kod xatosi | Error Boundary | Sahifani yangilash |

Eng yomon variant — barcha xatolar uchun bitta "Xatolik yuz berdi" toast: u hech qanday harakat taklif qilmaydi.

## Muhandislik nuqtai nazari: xatolarni yashirmang

```jsx
// ✗ Xato yo'qoladi — debug qilib bo'lmaydi
try {
  await save()
} catch {
  // jim
}

// ✗ Faqat konsolga
catch (error) {
  console.error(error)
}

// ✓ Foydalanuvchiga xabar + monitoringga
catch (error) {
  reportError(error)
  toast.error(getErrorMessage(error).title)
}
```

Production'da `console.error` hech kim ko'rmaydi. Monitoring (48-bob) — yagona ishonchli yo'l.

## Muhandislik nuqtai nazari: xatolarni test qilish

Xato yo'llari eng kam sinaladigan kod, chunki ular kamdan-kam ishlaydi. Shuning uchun ularni **ataylab** sinang:

- MSW bilan 500/422 javoblarini qaytaring (44-bob);
- DevTools → Network → Offline;
- Slow 3G bilan timeout'ni tekshiring;
- Komponentda ataylab `throw new Error('test')`.

Bu tekshiruvlar "oq ekran" holatlarini production'dan oldin topadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Error Boundary umuman yo'q | Bitta xato butun ilovani o'chiradi | Kamida ildiz + marshrut |
| Boundary hodisa xatolarini ushlaydi deb o'ylash | U faqat renderni ushlaydi | `try/catch` |
| Xatoni jim yutish | Debug qilib bo'lmaydi | Log + monitoring |
| Texnik tafsilotni foydalanuvchiga ko'rsatish | Chalkash, xavfsizlik | Umumiy xabar |
| Barcha xatolar uchun bitta xabar | Harakat noaniq | Toifalarga bo'lish |
| `reset` imkoniyatisiz fallback | Foydalanuvchi qamalib qoladi | "Qayta urinish" tugmasi |
| Chunk xatosini boshqarmaslik | Deploydan keyin oq ekran | `catch` + `reload` |

## Amaliyot

1. `ErrorBoundary` yozing va uni ildizga qo'ying; komponentda `throw new Error('test')` qilib, fallback'ni ko'ring.
2. Marshrut darajasida ikkinchi chegara qo'shing va sahifa buzilganda navigatsiya qolishini tasdiqlang.
3. `getErrorMessage` ni yozing va uchta turli xato (401, 500, offline) uchun turli ko'rinish chiqaring.
4. `unhandledrejection` tinglovchisini qo'shing va `Promise.reject()` bilan sinang.
5. MSW bilan 500 xatosini qaytarib, "Qayta urinish" oqimini tekshiring.

## Rasmiy hujjat

- Error Boundary: <https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary>
- `react-error-boundary`: <https://github.com/bvaughn/react-error-boundary>
- TanStack Query xatolari: <https://tanstack.com/query/latest/docs/framework/react/guides/query-retries>

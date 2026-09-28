# 30 — Tashqi tizimlar bilan ishlash

[← Oldingi: Effekt hayot sikli](29-effekt-hayot-sikli.md) · [Mundarija](README.md) · [Keyingi: Ma'lumot yuklash →](31-malumot-yuklash.md)

## Tushuncha

"Tashqi tizim" — React boshqarmaydigan hamma narsa: brauzer API'lari, `localStorage`, WebSocket, xarita/grafik kutubxonalari, tashqi store'lar.

React bilan ularni bog'lashning ikki yo'li bor:

1. **`useEffect`** — ulanish/uzilish sinxronlashuvi (27-bob);
2. **`useSyncExternalStore`** — tashqi manbadan **o'qish** va o'zgarishga obuna bo'lish.

## Kod: `useSyncExternalStore`

Tashqi manbadagi qiymatni React holatiga aylantiradi:

::: ts
```tsx
import { useSyncExternalStore } from 'react'

export function useOnlineStatus() {
  return useSyncExternalStore(
    // 1. Obuna: o'zgarishda `callback` chaqiriladi
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)

      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    // 2. Klientda qiymat
    () => navigator.onLine,
    // 3. Serverda qiymat (SSR)
    () => true,
  )
}
```
:::

::: js
```jsx
import { useSyncExternalStore } from 'react'

export function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)

      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine,
    () => true,
  )
}
```
:::

Nega `useEffect` + `useState` emas: `useSyncExternalStore` concurrent render bilan to'g'ri ishlaydi — React render paytida ham eng so'nggi qiymatni oladi va "yirtilgan" (tearing) holatlar bo'lmaydi. Zustand va boshqa store'lar aynan shu API ustida qurilgan (36-bob).

## Kod: media query va localStorage

::: ts
```tsx
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query)

      mql.addEventListener('change', callback)

      return () => mql.removeEventListener('change', callback)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,        // SSR
  )
}
```
:::

::: js
```jsx
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const mql = window.matchMedia(query)

      mql.addEventListener('change', callback)

      return () => mql.removeEventListener('change', callback)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
```
:::

`localStorage` uchun `storage` hodisasiga obuna bo'lish — boshqa tablarda o'zgarsa ham sinxron bo'ladi:

```jsx
function subscribe(callback) {
  window.addEventListener('storage', callback)

  return () => window.removeEventListener('storage', callback)
}

const theme = useSyncExternalStore(subscribe, () => localStorage.getItem('theme') ?? 'light', () => 'light')
```

## Kod: WebSocket

::: ts
```tsx
function useChatRoom(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')

  useEffect(() => {
    const socket = new WebSocket(`wss://chat.example.com/rooms/${roomId}`)

    socket.onopen = () => setStatus('open')
    socket.onclose = () => setStatus('closed')
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message

      setMessages((prev) => [...prev, message])
    }

    return () => {
      socket.close()                 // tozalash — majburiy (29-bob)
    }
  }, [roomId])

  return { messages, status }
}
```
:::

::: js
```jsx
function useChatRoom(roomId) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const socket = new WebSocket(`wss://chat.example.com/rooms/${roomId}`)

    socket.onopen = () => setStatus('open')
    socket.onclose = () => setStatus('closed')
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      setMessages((prev) => [...prev, message])
    }

    return () => socket.close()
  }, [roomId])

  return { messages, status }
}
```
:::

Production uchun qo'shimcha: qayta ulanish (exponential backoff), heartbeat, offline navbat. Tayyor yechimlar: `socket.io-client`, `partysocket`.

## Kod: observer API'lari

::: ts
```tsx
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options)

    observer.observe(element)

    return () => observer.disconnect()
  }, [options])

  return [ref, inView] as const
}

// Ishlatish: cheksiz ro'yxat, lazy rasm, animatsiya
const [ref, inView] = useInView({ rootMargin: '200px' })

<div ref={ref}>{inView && <HeavyChart />}</div>
```
:::

::: js
```jsx
export function useInView(options) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options)

    observer.observe(element)

    return () => observer.disconnect()
  }, [options])

  return [ref, inView]
}
```
:::

`ResizeObserver` va `MutationObserver` ham xuddi shu naqshda.

## Kod: tashqi kutubxonani o'rash

::: ts
```tsx
function Map({ center, markers }: { center: LatLng; markers: Marker[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  // 1. Yaratish va yo'q qilish — bir marta
  useEffect(() => {
    if (!containerRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.example.com/style.json',
      center: [center.lng, center.lat],
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // 2. Props o'zgarishini uzatish — alohida effektlar
  useEffect(() => {
    mapRef.current?.setCenter([center.lng, center.lat])
  }, [center])

  useEffect(() => {
    if (!mapRef.current) return

    const layers = markers.map((m) => addMarker(mapRef.current!, m))

    return () => layers.forEach((l) => l.remove())
  }, [markers])

  return <div ref={containerRef} style={{ height: 400 }} />
}
```
:::

::: js
```jsx
function Map({ center, markers }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.example.com/style.json',
      center: [center.lng, center.lat],
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    mapRef.current?.setCenter([center.lng, center.lat])
  }, [center])

  useEffect(() => {
    if (!mapRef.current) return

    const layers = markers.map((m) => addMarker(mapRef.current, m))

    return () => layers.forEach((l) => l.remove())
  }, [markers])

  return <div ref={containerRef} style={{ height: 400 }} />
}
```
:::

Naqsh: **yaratish/yo'q qilish bitta effektda, har props uchun alohida sinxronlash effekti** (29-bobdagi "bitta effekt — bitta maqsad").

## Muhandislik nuqtai nazari: React'dan tashqaridagi dunyo bilan chegara

Tashqi tizim bilan ishlaganda uchta qoida:

1. **Kutubxona nusxasi `useRef` da** — u UI'ga ta'sir qilmaydi (21-bob);
2. **Har ochilgan narsa yopiladi** — tozalash majburiy;
3. **React DOM'iga tegmang** — kutubxona o'z konteyneri ichida ishlasin:

```jsx
{/* Kutubxona bu div ichini to'liq boshqaradi, React unga tegmaydi */}
<div ref={containerRef} />
```

Agar React va kutubxona bir DOM tugunini boshqarsa, ular bir-birining o'zgarishini bekor qiladi.

## Muhandislik nuqtai nazari: SSR bilan

Tashqi tizimlarning ko'pi faqat brauzerda mavjud (`window`, `localStorage`, `IntersectionObserver`). SSR'da (Next.js) ular yo'q, shuning uchun:

```jsx
// ✗ Serverda xato
const width = window.innerWidth

// ✓ Effektda — server'da ishlamaydi
useEffect(() => setWidth(window.innerWidth), [])

// ✓ useSyncExternalStore uchinchi argumenti — server qiymati
useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
```

Next.js qo'llanmasining 04-bobida bu chegara batafsil.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tozalashni unutish | Xotira oqishi, zombi ulanishlar | `return () => ...` |
| Kutubxona nusxasini `useState` da saqlash | Ortiqcha render | `useRef` |
| Bitta effektda yaratish + har props sinxronlash | Har o'zgarishda kutubxona qayta yaratiladi | Alohida effektlar |
| `useEffect` + `useState` bilan tashqi store o'qish | Concurrent render'da tearing | `useSyncExternalStore` |
| `window` ni render paytida o'qish | SSR'da xato | Effekt yoki server snapshot |
| Observer'ni `disconnect` qilmaslik | Xotira oqishi | Tozalashda |
| Kutubxona boshqaradigan DOM'ni React bilan render qilish | Ikkalasi urishadi | Bo'sh konteyner + `ref` |

## Amaliyot

1. `useOnlineStatus` ni `useSyncExternalStore` bilan yozing va tarmoqni o'chirib sinab ko'ring.
2. `useMediaQuery` ni yozing va oynani kichraytirib, qiymat o'zgarishini kuzating.
3. `useInView` bilan lazy yuklanadigan bo'lak qiling (ko'rinishga kirganda og'ir komponent render bo'lsin).
4. WebSocket hookini yozing, tozalashsiz qoldirib, komponentni bir necha marta oching-yoping va DevTools'da ulanishlar sonini ko'ring.
5. Grafik kutubxonasini (Chart.js) o'rang: yaratish, ma'lumot yangilash, yo'q qilish — uchta alohida effekt bilan.

## Rasmiy hujjat

- `useSyncExternalStore`: <https://react.dev/reference/react/useSyncExternalStore>
- Tashqi tizimlar bilan sinxronlash: <https://react.dev/learn/synchronizing-with-effects#connecting-to-an-external-system>
- Effektlarni hookka o'rash: <https://react.dev/learn/reusing-logic-with-custom-hooks>

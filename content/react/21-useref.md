# 21 — `useRef`

[← Oldingi: Context](20-context.md) · [Mundarija](README.md) · [Keyingi: `useMemo` va `useCallback` →](22-usememo-usecallback.md)

## Tushuncha

`useRef` ikki vazifani bajaradi:

1. **DOM elementiga kirish** — fokus, o'lcham, scroll, tashqi kutubxona;
2. **Renderga ta'sir qilmaydigan qiymat saqlash** — timer ID, oldingi qiymat, hisoblagich.

::: ts
```tsx
const inputRef = useRef<HTMLInputElement>(null)     // DOM
const timerRef = useRef<number | null>(null)        // oddiy qiymat

// O'qish/yozish — .current orqali
inputRef.current?.focus()
timerRef.current = window.setTimeout(fn, 1000)
```
:::

::: js
```jsx
const inputRef = useRef(null)      // DOM
const timerRef = useRef(null)      // oddiy qiymat

inputRef.current?.focus()
timerRef.current = setTimeout(fn, 1000)
```
:::

Asosiy farq `useState` dan: **`ref.current` o'zgarishi qayta renderni keltirib chiqarmaydi.**

## Kod: DOM elementiga kirish

::: ts
```tsx
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()          // sahifa ochilganda fokus
  }, [])

  function clear() {
    inputRef.current!.value = ''
    inputRef.current!.focus()
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={clear}>Tozalash</button>
    </div>
  )
}
```
:::

::: js
```jsx
function SearchBox() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function clear() {
    inputRef.current.value = ''
    inputRef.current.focus()
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={clear}>Tozalash</button>
    </div>
  )
}
```
:::

`ref.current` **render paytida `null`** bo'ladi — u faqat DOM'ga joylashgandan keyin to'ladi. Shuning uchun unga `useEffect` yoki hodisa ichida murojaat qilinadi.

## Kod: `ref` — oddiy prop (React 19)

React 19 gacha komponentga `ref` uzatish uchun `forwardRef` kerak edi. Endi u **oddiy prop**:

::: ts
```tsx
// React 19
type InputProps = React.ComponentPropsWithRef<'input'> & { label: string }

export function Input({ label, ref, ...rest }: InputProps) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  )
}

// Ishlatish
const ref = useRef<HTMLInputElement>(null)

<Input ref={ref} label="Pochta" />
```
:::

::: js
```jsx
// React 19
export function Input({ label, ref, ...rest }) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  )
}

// Ishlatish
const ref = useRef(null)

<Input ref={ref} label="Pochta" />
```
:::

`forwardRef` hamon ishlaydi (eskirgan deb belgilangan), lekin yangi kodda kerak emas.

## Kod: callback ref

Element paydo bo'lganda/yo'qolganda kod ishga tushishi kerak bo'lsa:

::: ts
```tsx
function Measured() {
  const [height, setHeight] = useState(0)

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setHeight(node.getBoundingClientRect().height)
  }, [])

  return <div ref={measureRef}>Balandlik: {height}px</div>
}
```
:::

::: js
```jsx
function Measured() {
  const [height, setHeight] = useState(0)

  const measureRef = useCallback((node) => {
    if (node) setHeight(node.getBoundingClientRect().height)
  }, [])

  return <div ref={measureRef}>Balandlik: {height}px</div>
}
```
:::

React 19 da callback ref **tozalash funksiyasi** qaytarishi mumkin:

```jsx
<div ref={(node) => {
  const observer = new ResizeObserver(onResize)

  observer.observe(node)

  return () => observer.disconnect()      // React 19+
}} />
```

## Kod: render'ga ta'sir qilmaydigan qiymat

::: ts
```tsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef<number | null>(null)
  const timerId = useRef<number | null>(null)

  function start() {
    if (timerId.current !== null) return

    startedAt.current = Date.now() - elapsed
    timerId.current = window.setInterval(() => {
      setElapsed(Date.now() - startedAt.current!)
    }, 100)
  }

  function stop() {
    if (timerId.current === null) return

    clearInterval(timerId.current)
    timerId.current = null
  }

  useEffect(() => stop, [])        // komponent o'chganda tozalash

  return (
    <div>
      <p>{(elapsed / 1000).toFixed(1)} s</p>
      <button onClick={start}>Boshlash</button>
      <button onClick={stop}>To'xtatish</button>
    </div>
  )
}
```
:::

::: js
```jsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(null)
  const timerId = useRef(null)

  function start() {
    if (timerId.current !== null) return

    startedAt.current = Date.now() - elapsed
    timerId.current = setInterval(() => {
      setElapsed(Date.now() - startedAt.current)
    }, 100)
  }

  function stop() {
    if (timerId.current === null) return

    clearInterval(timerId.current)
    timerId.current = null
  }

  useEffect(() => stop, [])

  return (
    <div>
      <p>{(elapsed / 1000).toFixed(1)} s</p>
      <button onClick={start}>Boshlash</button>
      <button onClick={stop}>To'xtatish</button>
    </div>
  )
}
```
:::

Timer ID ni `useState` da saqlash xato bo'lardi: u UI'ga ta'sir qilmaydi, lekin har o'zgarishda qayta render keltirib chiqarardi.

## Kod: oldingi qiymatni eslab qolish

::: ts
```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// Ishlatish
const prevCount = usePrevious(count)

<p>{count} (oldin: {prevCount ?? '—'})</p>
```
:::

::: js
```jsx
function usePrevious(value) {
  const ref = useRef(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
```
:::

## Kod: tashqi kutubxonani ulash

::: ts
```tsx
function Chart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartInstance | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current = new Chart(canvasRef.current, { type: 'bar', data })

    return () => {
      chartRef.current?.destroy()      // tozalash — majburiy (29-bob)
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.data = data
    chartRef.current.update()
  }, [data])

  return <canvas ref={canvasRef} />
}
```
:::

::: js
```jsx
function Chart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current = new Chart(canvasRef.current, { type: 'bar', data })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.data = data
    chartRef.current.update()
  }, [data])

  return <canvas ref={canvasRef} />
}
```
:::

Kutubxona nusxasi `useRef` da saqlanadi — u UI'ga ta'sir qilmaydi va renderda ishtirok etmaydi.

## Kod: `useImperativeHandle` (kamdan-kam)

Komponent tashqariga metod ochishi kerak bo'lsa:

::: ts
```tsx
type VideoHandle = { play: () => void; pause: () => void }

export function Video({ src, ref }: { src: string; ref?: React.Ref<VideoHandle> }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
  }), [])

  return <video ref={videoRef} src={src} />
}
```
:::

::: js
```jsx
export function Video({ src, ref }) {
  const videoRef = useRef(null)

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
  }), [])

  return <video ref={videoRef} src={src} />
}
```
:::

Bu — imperativ API, shuning uchun oxirgi chora: avval props bilan hal qilishga urinib ko'ring (`isPlaying` prop + effekt).

## Muhandislik nuqtai nazari: `useRef` yoki `useState`

| Savol | Javob |
| --- | --- |
| Qiymat ekranda ko'rinadimi? | `useState` |
| O'zgarishi renderni talab qiladimi? | `useState` |
| Faqat hodisa/effekt ichida ishlatiladimi? | `useRef` |
| Render paytida o'qiladimi? | `useState` (ref render paytida o'qilmasligi kerak) |

Muhim cheklov: **render paytida `ref.current` ni o'qimang yoki yozmang** — bu komponentni toza bo'lmagan qiladi (05-bob):

```jsx
// ✗
function Bad() {
  const renders = useRef(0)
  renders.current++                     // render paytida yozish

  return <p>{renders.current}</p>       // render paytida o'qish
}

// ✓ Effekt ichida
useEffect(() => {
  renders.current++
})
```

## Muhandislik nuqtai nazari: DOM'ga qachon tegish mumkin

React DOM'ni o'zi boshqaradi. Qo'lda tegish quyidagi hollarda oqlanadi:

| Vazifa | `ref` kerakmi |
| --- | --- |
| Fokus boshqarish | ✅ Ha |
| Scroll pozitsiyasi | ✅ Ha |
| O'lcham o'lchash (`getBoundingClientRect`) | ✅ Ha |
| Canvas, video, xarita, editor | ✅ Ha |
| `IntersectionObserver`, `ResizeObserver` | ✅ Ha |
| Matn o'zgartirish (`innerHTML`, `textContent`) | ❌ Holat orqali |
| Class qo'shish/olib tashlash | ❌ `className` |
| Element yashirish | ❌ Shartli render |

React boshqaradigan DOM'ni qo'lda o'zgartirsangiz, keyingi render uni bekor qiladi yoki React chalkashadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Render paytida `ref.current` o'qish/yozish | Toza emas, concurrent render'da xato | Effekt yoki hodisa |
| `ref.current` o'zgarganda UI yangilanishini kutish | Ref render keltirib chiqarmaydi | `useState` |
| `ref` ni effekt bog'liqligiga qo'yish | Ref obyekti hech qachon o'zgarmaydi | Callback ref yoki `state` |
| React boshqaradigan DOM'ni qo'lda o'zgartirish | Keyingi renderda bekor bo'ladi | Holat |
| `forwardRef` ni React 19 da yozish | Endi kerak emas | `ref` — oddiy prop |
| Tashqi kutubxonani tozalamaslik | Xotira oqishi | `useEffect` cleanup |
| Timer ID ni `useState` da saqlash | Ortiqcha render | `useRef` |

## Amaliyot

1. Sahifa ochilganda qidiruv inputiga fokus bering.
2. Sekundomer yozing: `useRef` da timer ID va boshlanish vaqtini saqlang, tozalashni ham qo'shing.
3. `usePrevious` hookini yozing va sanoq ustida sinang.
4. Callback ref bilan element balandligini o'lchang va ekranda ko'rsating.
5. `Input` komponentiga `ref` ni oddiy prop sifatida uzating (React 19 uslubida) va tashqaridan fokus bering.
6. Render paytida `ref.current++` qiling va `StrictMode` da natijani kuzating.

## Rasmiy hujjat

- `useRef`: <https://react.dev/reference/react/useRef>
- DOM'ga murojaat: <https://react.dev/learn/manipulating-the-dom-with-refs>
- `useImperativeHandle`: <https://react.dev/reference/react/useImperativeHandle>

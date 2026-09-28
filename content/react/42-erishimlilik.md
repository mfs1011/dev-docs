# 42 — Erishimlilik (a11y)

[← Oldingi: Unumdorlik](41-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Testlash strategiyasi →](43-testlash-strategiyasi.md)

## Tushuncha

Erishimlilik — interfeysning klaviatura, skrinrider, kattalashtirish va rang ko'rlik sharoitida ishlashi. Bu "qo'shimcha imkoniyat" emas: klaviatura navigatsiyasi va ko'rinadigan fokus **hamma foydalanuvchiga** foyda beradi.

React tomonidan asosiy vositalar: semantik HTML, fokus boshqaruvi (21-bob), ARIA atributlari va dinamik xabarlarni e'lon qilish.

## Kod: semantik HTML — birinchi qadam

```jsx
{/* ✗ */}
<div className="btn" onClick={save}>Saqlash</div>
<div className="link" onClick={() => navigate('/about')}>Biz haqimizda</div>
<div className="heading">Sarlavha</div>

{/* ✓ */}
<button type="button" onClick={save}>Saqlash</button>
<Link to="/about">Biz haqimizda</Link>
<h2>Sarlavha</h2>
```

`<div onClick>` bilan nima yo'qoladi:

| Imkoniyat | `<div>` | `<button>` |
| --- | --- | --- |
| Tab bilan fokus | ✗ | ✅ |
| Enter/Space bilan bosish | ✗ | ✅ |
| Skrinrider "tugma" deydi | ✗ | ✅ |
| `disabled` | ✗ | ✅ |
| Formada `submit` | ✗ | ✅ |

## Kod: formalar

::: ts
```tsx
function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {error ? <p id={errorId} role="alert">{error}</p> : hint ? <p id={hintId}>{hint}</p> : null}
    </div>
  )
}
```
:::

::: js
```jsx
function Field({ label, error, hint, children }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {error ? <p id={errorId} role="alert">{error}</p> : hint ? <p id={hintId}>{hint}</p> : null}
    </div>
  )
}
```
:::

Uch qoida: har inputning `<label>` i bo'lsin (`placeholder` yorliq emas), xato `aria-describedby` bilan bog'lansin, `useId` ishlatilsin (23-bob).

## Kod: modal va fokus tuzog'i

```jsx
function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null)
  const lastFocused = useRef(null)

  useEffect(() => {
    if (!open) return

    lastFocused.current = document.activeElement

    // Ochilganda ichkariga fokus
    const first = dialogRef.current?.querySelector('[autofocus], button, input, a[href]')

    first?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      lastFocused.current?.focus()          // fokusni qaytarish — majburiy
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

Amalda buni tayyor kutubxonadan olish ma'qul (40-bob): Radix, React Aria, Headless UI — ular iframe, dinamik mazmun, `inert` kabi chekka holatlarni ham qamrab olgan.

## Kod: dinamik xabarlar

```jsx
{/* Xato — darhol o'qiladi */}
<div role="alert">{error}</div>

{/* Natija soni — navbat bilan */}
<p aria-live="polite" className="sr-only">
  {results.length} ta natija topildi
</p>

{/* Yuklanish */}
{isPending && (
  <div role="status" aria-live="polite">
    <span className="sr-only">Yuklanmoqda…</span>
    <Spinner aria-hidden="true" />
  </div>
)}
```

```css
.sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

**SPA muammosi:** marshrut o'zgarganda skrinrider hech narsa aytmaydi. Yechim:

```jsx
function RouteAnnouncer() {
  const location = useLocation()
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage(`${document.title} sahifasi yuklandi`)
  }, [location.pathname])

  return <p aria-live="assertive" className="sr-only">{message}</p>
}
```

Sahifa nomini ham yangilang (React 19 da `<title>` JSX'da ishlaydi).

## Kod: klaviatura navigatsiyasi

```jsx
{/* Mazmunga o'tish havolasi — birinchi fokuslanadigan element */}
<a href="#main" className="skip-link">Asosiy mazmunga o'tish</a>

<nav>…</nav>

<main id="main" tabIndex={-1}>
  <Outlet />
</main>
```

```css
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 8px; top: 8px; z-index: 100; }

/* Fokusni HECH QACHON shunchaki o'chirmang */
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
```

`outline: none` — eng ko'p uchraydigan a11y buzilishi. Dizayn talab qilsa, boshqa ko'rinadigan belgi bering.

## Kod: ARIA — faqat kerak bo'lganda

Birinchi qoida: **ARIA ishlatmang, agar semantik HTML yetsa.**

| Holat | ARIA |
| --- | --- |
| Modal | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| Tab'lar | `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls` |
| Akkordeon | `aria-expanded`, `aria-controls` |
| Ikonka tugma | `aria-label="Yopish"` |
| Dekorativ ikonka | `aria-hidden="true"` |
| Yuklanayotgan tugma | `aria-busy="true"` |
| Joriy sahifa (navigatsiya) | `aria-current="page"` |

Noto'g'ri ARIA — ARIA yo'qligidan yomonroq: u skrinriderga yolg'on ma'lumot beradi.

## Kod: animatsiya

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
    }
}
```

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

## Kod: avtomatik tekshirish

```bash
npm i -D eslint-plugin-jsx-a11y @axe-core/playwright
```

```js
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  jsxA11y.flatConfigs.recommended,
  // ...
]
```

```js
// e2e/a11y.spec.ts (44-bob)
import AxeBuilder from '@axe-core/playwright'

test('bosh sahifada a11y buzilishi yo\'q', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
```

| Vosita | Nima topadi |
| --- | --- |
| `eslint-plugin-jsx-a11y` | Yozayotganda: `alt` yo'q, `onClick` `div` da, `label` yo'q |
| axe DevTools (kengaytma) | Kontrast, ARIA xatolari |
| Lighthouse | Umumiy bal |
| **Klaviatura** (Tab, Shift+Tab, Esc) | Fokus tartibi, qamalib qolish |
| VoiceOver / NVDA | Haqiqiy tajriba |

Avtomatik vositalar muammolarning ~30% ini topadi. Qolgani — qo'lda tekshiruv.

## Muhandislik nuqtai nazari: kontrast va o'lchamlar

| Talab (WCAG AA) | Qiymat |
| --- | --- |
| Oddiy matn kontrasti | 4.5:1 |
| Katta matn (18pt+) | 3:1 |
| Interaktiv element chegarasi | 3:1 |
| Bosiladigan maydon | 24×24 px (AAA: 44×44) |
| 200% kattalashtirishda ishlashi | Majburiy |

Tez tekshiruv: brauzerda `Cmd/Ctrl +` bilan 200% qiling — interfeys buzilmadimi?

## Muhandislik nuqtai nazari: React'ga xos tuzoqlar

| Tuzoq | Tafsilot |
| --- | --- |
| Shartli render fokusni yo'qotadi | Element o'chsa, fokus `<body>` ga tushadi — qo'lda boshqaring |
| Portal (modal) DOM tartibini o'zgartiradi | `aria-modal` va fokus tuzog'i shart |
| `key` o'zgarishi elementni qayta yaratadi | Fokus yo'qoladi (09-bob) |
| SPA navigatsiyasi jim | `aria-live` e'lonchi |
| Virtualizatsiya elementlarni DOM'dan olib tashlaydi | Skrinrider ro'yxat uzunligini bilmaydi — `aria-setsize`/`aria-posinset` |
| Toast avtomatik yo'qoladi | Skrinrider ulgurmasligi mumkin — `role="status"` va yetarli vaqt |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `<div onClick>` tugma sifatida | Klaviatura, skrinrider ishlamaydi | `<button>` |
| `outline: none` | Fokus ko'rinmaydi | `:focus-visible` uslubi |
| `placeholder` ni yorliq sifatida | Yozilganda yo'qoladi | `<label>` |
| Modalda fokus tuzog'i yo'q | Fokus orqaga chiqib ketadi | Focus trap + qaytarish |
| Ikonka tugmada matn yo'q | Skrinrider "tugma" deydi, xolos | `aria-label` |
| SPA navigatsiyasini e'lon qilmaslik | Skrinrider foydalanuvchisi adashadi | `aria-live` |
| `prefers-reduced-motion` ni e'tiborsiz qoldirish | Jismoniy noqulaylik | Media query |
| Sarlavha darajalarini buzish (`h1` → `h4`) | Navigatsiya buziladi | Ketma-ketlik |

## Amaliyot

1. Ilovangizni **faqat klaviatura** bilan aylanib chiqing: hamma joyga yeta olasizmi, fokus ko'rinadimi, modaldan chiqa olasizmi?
2. `eslint-plugin-jsx-a11y` ni o'rnating va chiqqan ogohlantirishlarni tuzating.
3. `Field` komponentiga `useId` + `aria-invalid` + `aria-describedby` qo'shing.
4. Modalga focus trap va fokus qaytarishni qo'shing, keyin Radix bilan solishtiring.
5. `RouteAnnouncer` ni qo'shing va VoiceOver bilan navigatsiyani tinglang.
6. axe DevTools bilan uchta sahifani tekshiring.

## Rasmiy hujjat

- React erishimlilik: <https://react.dev/learn/accessibility>
- WAI-ARIA naqshlari: <https://www.w3.org/WAI/ARIA/apg/patterns/>
- `eslint-plugin-jsx-a11y`: <https://github.com/jsx-eslint/eslint-plugin-jsx-a11y>
- WCAG 2.2 qisqacha: <https://www.w3.org/WAI/WCAG22/quickref/>

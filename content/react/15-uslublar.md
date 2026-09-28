# 15 — Uslublar

[← Oldingi: Kompozitsiya naqshlari](14-kompozitsiya.md) · [Mundarija](README.md) · [Keyingi: `useState` →](16-usestate.md)

## Tushuncha

React'ning o'z uslublash tizimi **yo'q** — bu ataylab. Natijada ekotizmda bir nechta yondashuv bor va tanlov sizniki:

| Yondashuv | Nima | Holat |
| --- | --- | --- |
| **CSS Modules** | `Button.module.css`, class nomlari xeshlanadi | Barqaror, keng tarqalgan |
| **Tailwind CSS** | Utility class'lar | Eng tez o'sayotgan |
| **Oddiy CSS/SCSS** | Global fayllar + BEM | Oddiy loyihalarda |
| **CSS-in-JS** (styled-components, Emotion) | JS ichida uslub | Pasaymoqda (RSC bilan muammoli) |
| **Inline `style`** | `style={{}}` | Faqat dinamik qiymatlar uchun |

## Kod: CSS Modules

```css
/* Button.module.css */
.button {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    border: 0;
    cursor: pointer;
}

.primary { background: var(--accent); color: #fff; }
.ghost { background: transparent; border: 1px solid var(--border); }
.loading { opacity: .6; pointer-events: none; }
```

::: ts
```tsx
import clsx from 'clsx'
import styles from './Button.module.css'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], loading && styles.loading, className)}
      {...rest}
    />
  )
}
```
:::

::: js
```jsx
import clsx from 'clsx'
import styles from './Button.module.css'

export function Button({ variant = 'primary', loading, className, ...rest }) {
  return (
    <button
      className={clsx(styles.button, styles[variant], loading && styles.loading, className)}
      {...rest}
    />
  )
}
```
:::

Build'da `.button` → `_button_x1y2z` bo'ladi — ya'ni global to'qnashuv **mumkin emas**. Vite'da hech qanday sozlash kerak emas: fayl nomi `.module.css` bo'lsa yetarli.

## Kod: Tailwind CSS

```bash
npm i -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css */
@import "tailwindcss";

@theme {
    --color-brand: #0b7fa0;
    --radius-card: 12px;
}
```

::: ts
```tsx
export function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center rounded-lg px-4 py-2 font-semibold transition',
        variant === 'primary' && 'bg-brand text-white hover:opacity-90',
        variant === 'ghost' && 'border border-neutral-300 hover:bg-neutral-50',
      )}
      {...rest}
    />
  )
}
```
:::

::: js
```jsx
export function Button({ variant = 'primary', ...rest }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center rounded-lg px-4 py-2 font-semibold transition',
        variant === 'primary' && 'bg-brand text-white hover:opacity-90',
        variant === 'ghost' && 'border border-neutral-300 hover:bg-neutral-50',
      )}
      {...rest}
    />
  )
}
```
:::

**Muhim tuzoq:** class nomlarini qismlardan yasamang —

```jsx
{/* ✗ Tailwind build vaqtida bu class'ni topa olmaydi */}
<p className={`text-${color}-500`} />

{/* ✓ To'liq nomlar jadvali */}
const COLORS = { green: 'text-green-500', red: 'text-red-500' }

<p className={COLORS[color]} />
```

Sabab: Tailwind fayl matnini skanerlaydi va runtime'da yig'ilgan satrni ko'rmaydi.

Variantlar ko'payganda `cva` (class-variance-authority) qulay:

```ts
import { cva } from 'class-variance-authority'

const button = cva('inline-flex items-center rounded-lg font-semibold', {
  variants: {
    variant: {
      primary: 'bg-brand text-white',
      ghost: 'border border-neutral-300',
    },
    size: { sm: 'px-3 py-1 text-sm', lg: 'px-5 py-3 text-lg' },
  },
  defaultVariants: { variant: 'primary', size: 'sm' },
})

<button className={button({ variant, size })} />
```

## Kod: inline style — faqat dinamik qiymatlar uchun

```jsx
{/* ✓ CSS oldindan bila olmaydigan qiymat */}
<div className="bar" style={{ width: `${progress}%` }} />
<div style={{ transform: `translateY(${offset}px)` }} />

{/* ✗ Statik uslub */}
<div style={{ padding: 16, borderRadius: 8, background: '#fff' }} />
```

Inline style CSS kaskadidan chiqib ketadi (eng yuqori ustunlik) va uni keyin bekor qilish qiyin. Shuning uchun faqat hisoblangan qiymatlar uchun.

CSS o'zgaruvchilari bilan aralash yondashuv ko'pincha eng toza:

```jsx
<div className="chart" style={{ '--bar-height': `${value}%` } as React.CSSProperties} />
```

```css
.chart .bar { height: var(--bar-height); }
```

## Kod: tema va CSS o'zgaruvchilari

```css
:root {
    --color-bg: #fff;
    --color-text: #111;
    --color-accent: #0b7fa0;
}

:root[data-theme="dark"] {
    --color-bg: #0f1115;
    --color-text: #e6e6e6;
    --color-accent: #58c4dc;
}
```

::: ts
```tsx
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
```
:::

::: js
```jsx
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
```
:::

Tokenlarni CSS o'zgaruvchilarida saqlash — eng barqaror yechim: u CSS Modules, Tailwind va inline style bilan bir vaqtda ishlaydi.

## Muhandislik nuqtai nazari: qaysi yondashuvni tanlash

| Vaziyat | Tavsiya |
| --- | --- |
| Kichik/o'rta loyiha, jamoa CSS'ni yaxshi biladi | CSS Modules |
| Tez prototip, dizayn tizimi utility'lar ustida | Tailwind |
| Katta jamoa, qat'iy dizayn tizimi | Tailwind + `cva` yoki CSS Modules + tokenlar |
| Server Components ishlatiladi (Next) | CSS Modules yoki Tailwind (CSS-in-JS muammoli) |
| Eski loyiha, global CSS bor | Bosqichma-bosqich Modules'ga ko'chirish |

CSS-in-JS (styled-components, Emotion) haqida: u runtime'da uslub yaratadi, shuning uchun React Server Components bilan yomon ishlaydi va unumdorlikka ta'sir qiladi. Yangi loyihada tavsiya etilmaydi; mavjud loyihada ishlayotgan bo'lsa — shoshilinch ko'chirish shart emas.

## Muhandislik nuqtai nazari: komponent va uslub chegarasi

Yaxshi komponent **o'z ichki ko'rinishini** boshqaradi, tashqi joylashuvni esa ota belgilaydi:

```jsx
{/* ✗ Komponent o'zini joylashtirishga urinmoqda */}
<Card style={{ marginTop: 24, width: '50%' }} />

{/* ✓ Joylashuv — otaning ishi */}
<div className="grid">
  <Card />
</div>
```

Amaliy qoida: komponent ichida `margin` bermang. Tashqi bo'shliq — ota konteynerning mas'uliyati (`gap`, `grid`, `space-y`). Bu qoida komponentni har joyda qayta ishlatish imkonini beradi.

`className` ni tashqaridan qabul qilish esa foydali — chaqiruvchi kichik moslashtirish qila olsin:

```jsx
export function Card({ className, ...rest }) {
  return <section className={clsx(styles.card, className)} {...rest} />
}
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tailwind class'ini qismlardan yasash | Build topa olmaydi | To'liq nomlar jadvali |
| Statik uslublarni inline `style` bilan | Kaskaddan chiqadi, bekor qilish qiyin | CSS/class |
| Komponent ichida `margin` | Qayta ishlatish qiyinlashadi | Ota konteyner |
| Global CSS'da komponentga xos selektorlar | To'qnashuvlar | CSS Modules |
| CSS-in-JS ni RSC bilan ishlatish | Runtime uslub, server bilan muammo | Modules/Tailwind |
| `className` ni tashqaridan qabul qilmaslik | Moslashtirib bo'lmaydi | `clsx(styles.x, className)` |
| Tema ranglarini har komponentda takrorlash | O'zgartirish 40 joyda | CSS o'zgaruvchilari |

## Amaliyot

1. `Button` ni CSS Modules bilan yozing: `variant`, `size`, `loading`.
2. Xuddi shu komponentni Tailwind + `cva` bilan qayta yozing va ikkalasini solishtiring.
3. Tailwind'da `text-${color}-500` tuzog'ini takrorlang va uslub qo'llanmasligini tasdiqlang.
4. CSS o'zgaruvchilari bilan dark/light tema qiling (`data-theme` atributi orqali).
5. Komponentga `margin` qo'shing, keyin uni uch joyda ishlatib ko'ring — nima noqulay bo'ldi?

## Rasmiy hujjat

- CSS Modules (Vite): <https://vite.dev/guide/features.html#css-modules>
- Tailwind CSS: <https://tailwindcss.com/docs/installation/using-vite>
- `cva`: <https://cva.style>

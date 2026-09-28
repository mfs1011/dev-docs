# 40 — Dizayn tizimi

[← Oldingi: Autentifikatsiya (klient tomoni)](39-auth-klient.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik →](41-unumdorlik.md)

## Tushuncha

Dizayn tizimi — bu Figma fayl emas, **kod darajasidagi shartnoma**: tokenlar (ranglar, oraliqlar, shriftlar) + ular ustiga qurilgan komponentlar.

Uch qatlam:

```
Tokenlar (CSS o'zgaruvchilari)
    ↓
Primitivlar (Button, Input, Card, Modal)
    ↓
Kompozitsiyalar (SearchField, ProductCard, ConfirmDialog)
```

Bu bobda primitiv komponentlarning API'sini qanday loyihalash ko'riladi.

## Kod: tokenlar

```css
/* app/styles/tokens.css */
:root {
    /* Rang — semantik nomlar, xom ranglar emas */
    --color-bg: #ffffff;
    --color-surface: #f6f7f9;
    --color-text: #111418;
    --color-text-muted: #5b6472;
    --color-accent: #0b7fa0;
    --color-danger: #c62828;
    --color-border: #e3e6ea;

    /* Oraliq — 4px shkalasi */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-6: 24px;

    /* Radius, soya, shrift */
    --radius-sm: 6px;
    --radius-md: 10px;
    --shadow-sm: 0 1px 2px rgb(0 0 0 / .06);
    --font-sans: system-ui, -apple-system, "Segoe UI", sans-serif;
}

:root[data-theme="dark"] {
    --color-bg: #0f1115;
    --color-surface: #161a20;
    --color-text: #e6e8eb;
    --color-text-muted: #9aa4b2;
    --color-accent: #58c4dc;
    --color-border: #262b33;
}
```

Semantik nomlash muhim: `--color-accent` emas `--color-blue-500`. Tema o'zgarsa, komponentlar tegilmaydi (15-bob).

## Kod: Button — to'liq misol

::: ts
```tsx
// shared/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import styles from './Button.module.css'

const button = cva(styles.base, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      danger: styles.danger,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
    fullWidth: {
      true: styles.fullWidth,
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

type ButtonProps = React.ComponentPropsWithRef<'button'> &
  VariantProps<typeof button> & {
    loading?: boolean
    icon?: React.ReactNode
  }

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(button({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} aria-hidden /> : icon}
      {children}
    </button>
  )
}
```
:::

::: js
```jsx
// shared/ui/Button.jsx
import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import styles from './Button.module.css'

const button = cva(styles.base, {
  variants: {
    variant: { primary: styles.primary, secondary: styles.secondary, ghost: styles.ghost, danger: styles.danger },
    size: { sm: styles.sm, md: styles.md, lg: styles.lg },
    fullWidth: { true: styles.fullWidth },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export function Button({ variant, size, fullWidth, loading = false, icon, disabled, className, children, ...rest }) {
  return (
    <button
      className={clsx(button({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} aria-hidden /> : icon}
      {children}
    </button>
  )
}
```
:::

Uchta muhim qaror:

1. **`ComponentPropsWithRef<'button'>`** — `type`, `onClick`, `aria-*`, `data-testid` — hammasi avtomatik (11-bob);
2. **`className` qabul qilinadi** — chaqiruvchi kichik moslashtirish qila olsin;
3. **`loading` `disabled` ga aylanadi** — ikki marta yuborishdan himoya (12-bob).

## Kod: polimorf komponent (`as` prop)

Bir xil ko'rinish, turli teg (tugma yoki havola):

::: ts
```tsx
type ButtonBaseProps = VariantProps<typeof button> & { className?: string }

type PolymorphicProps<T extends React.ElementType> = ButtonBaseProps & {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonBaseProps | 'as'>

export function Button<T extends React.ElementType = 'button'>({
  as,
  variant,
  size,
  className,
  ...rest
}: PolymorphicProps<T>) {
  const Component = as ?? 'button'

  return <Component className={clsx(button({ variant, size }), className)} {...rest} />
}

// Ishlatish
<Button>Saqlash</Button>
<Button as="a" href="/products">Katalog</Button>
<Button as={Link} to="/products">Katalog</Button>
```
:::

::: js
```jsx
export function Button({ as, variant, size, className, ...rest }) {
  const Component = as ?? 'button'

  return <Component className={clsx(button({ variant, size }), className)} {...rest} />
}

// Ishlatish
<Button>Saqlash</Button>
<Button as="a" href="/products">Katalog</Button>
<Button as={Link} to="/products">Katalog</Button>
```
:::

TypeScript'da polimorf komponentlar tiplari murakkab — shuning uchun ularni faqat haqiqatan kerak bo'lganda ishlating.

## Kod: headless kutubxona ustiga qurish

Modal, dropdown, combobox, tab — ularda erishimlilik (fokus tuzog'i, ARIA, klaviatura) ko'p ish talab qiladi (42-bob). Noldan yozish o'rniga **headless** kutubxonadan foydalaning:

::: ts
```tsx
// Radix UI misolida — mantiq va a11y tayyor, uslub sizniki
import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {children}
          <Dialog.Close asChild>
            <Button variant="ghost" aria-label="Yopish">×</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```
:::

::: js
```jsx
import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ open, onOpenChange, title, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {children}
          <Dialog.Close asChild>
            <Button variant="ghost" aria-label="Yopish">×</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```
:::

Variantlar: **Radix UI**, **React Aria** (Adobe), **Headless UI** (Tailwind), **Ark UI**. `shadcn/ui` — Radix ustiga qurilgan tayyor komponentlar to'plami bo'lib, u sizning repongizga **kod sifatida** ko'chiriladi (paket emas).

## Kod: controlled/uncontrolled qo'llab-quvvatlash

Dizayn tizimi komponentlari ikkala rejimni ham qo'llab-quvvatlashi kerak (18-bob):

```jsx
export function Tabs({ value, defaultValue, onValueChange, children }) {
  const [internal, setInternal] = useState(defaultValue)

  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  function change(next) {
    if (!isControlled) setInternal(next)

    onValueChange?.(next)
  }

  return <TabsContext.Provider value={{ current, change }}>{children}</TabsContext.Provider>
}
```

## Kod: hujjatlash (Storybook)

```bash
npx storybook@latest init
```

::: ts
```tsx
// shared/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  args: { children: 'Saqlash' },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {}
export const Danger: Story = { args: { variant: 'danger' } }
export const Loading: Story = { args: { loading: true } }
export const WithIcon: Story = { args: { icon: <SaveIcon /> } }
```
:::

::: js
```jsx
// shared/ui/Button.stories.jsx
import { Button } from './Button'

export default { component: Button, args: { children: 'Saqlash' } }

export const Primary = {}
export const Danger = { args: { variant: 'danger' } }
export const Loading = { args: { loading: true } }
```
:::

Storybook'ning haqiqiy foydasi — **chekka holatlarni ko'rish**: uzun matn, bo'sh holat, yuklanish, xato, dark tema.

## Muhandislik nuqtai nazari: API dizayni qoidalari

| Qoida | Misol |
| --- | --- |
| Bir o'lchov — bitta prop | `variant`, `size` (12 ta boolean emas) |
| HTML atributlarini meros qilib oling | `ComponentPropsWithRef<'button'>` |
| `className` ni qabul qiling | Chaqiruvchi moslashtira olsin |
| Komponent ichida `margin` bermang | Joylashuv — ota ishi (15-bob) |
| Erishimlilikni majburiy qiling | `aria-label` siz ikonka tugma — tip xatosi |
| Standart qiymat eng ko'p ishlatiladigani bo'lsin | `variant="primary"` |
| Slotlar — mazmun uchun | `icon`, `header`, `footer` (14-bob) |

TypeScript bilan erishimlilikni majburlash:

```ts
type IconButtonProps = React.ComponentPropsWithRef<'button'> &
  ({ children: React.ReactNode } | { 'aria-label': string })
```

## Muhandislik nuqtai nazari: o'z tizimingiz yoki tayyor

| Vaziyat | Tavsiya |
| --- | --- |
| Prototip, kichik loyiha | Tayyor kutubxona (MUI, Mantine, Chakra) |
| O'z brendi, dizayner bilan ishlash | Headless (Radix/React Aria) + o'z uslublaringiz |
| Bir nechta ilova bir dizaynda | O'z paketingiz (monorepo) |
| Faqat bir necha komponent kerak | `shadcn/ui` uslubida nusxa ko'chirish |

Noldan to'liq tizim yozish (modal, select, date picker, combobox — a11y bilan) — **oylik ish**. Headless kutubxona bu ishning 80% ini qoplaydi.

## Muhandislik nuqtai nazari: versiyalash va o'zgarishlar

Dizayn tizimi — ichki kutubxona, ya'ni uning ham **buzuvchi o'zgarishlari** bo'ladi:

- Prop nomini o'zgartirish → avval `deprecated` deb belgilang, keyin olib tashlang;
- Vizual o'zgarish → butun ilovaga ta'sir qiladi, screenshot testlar foydali (44-bob);
- Yangi variant qo'shish → xavfsiz.

Monorepo'da `changesets` bilan versiyalash, bitta repoda esa oddiy `CHANGELOG.md` yetarli.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Xom rang qiymatlarini komponentlarda yozish | Tema qo'shib bo'lmaydi | Semantik tokenlar |
| Komponent ichida `margin` | Qayta ishlatish qiyin | Ota konteyner |
| `className` ni qabul qilmaslik | Moslashtirib bo'lmaydi | `clsx(base, className)` |
| Modal/dropdown'ni noldan yozish | A11y chekka holatlari ko'p | Headless kutubxona |
| 12 ta boolean prop | Kombinatsiyalar portlaydi | `variant`/`size` |
| Faqat "baxtli holat" ni Storybook'da ko'rsatish | Chekka holatlar production'da chiqadi | Uzun matn, bo'sh, xato |
| Dizayn tizimini hujjatlashsiz qoldirish | Har kishi o'zicha ishlatadi | Storybook yoki MDX |

## Amaliyot

1. Tokenlar faylini yozing (rang, oraliq, radius) va dark tema qo'shing.
2. `Button` ni `cva` + CSS Modules bilan yozing: 4 variant, 3 o'lcham, `loading`.
3. `as` prop bilan polimorf qiling va `Link` bilan ishlating.
4. Radix Dialog ustiga `Modal` komponentini qurib, fokus tuzog'i va `Escape` ishlashini tekshiring.
5. Storybook o'rnating va `Button` uchun 5 ta holat yozing (shu jumladan uzun matn).
6. Ikonka tugmasi uchun `aria-label` ni TypeScript bilan majburiy qiling.

## Rasmiy hujjat

- Radix UI: <https://www.radix-ui.com/primitives>
- React Aria: <https://react-spectrum.adobe.com/react-aria/>
- `cva`: <https://cva.style>
- Storybook: <https://storybook.js.org/docs/react/get-started/install>

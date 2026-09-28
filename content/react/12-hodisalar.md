# 12 — Hodisalar

[← Oldingi: Props](11-props.md) · [Mundarija](README.md) · [Keyingi: Shartli render →](13-shartli-render.md)

## Tushuncha

React'da hodisa tinglovchisi — JSX atributi:

::: ts
```tsx
function SearchForm() {
  const [query, setQuery] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log('qidiruv:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="submit">Qidirish</button>
    </form>
  )
}
```
:::

::: js
```jsx
function SearchForm() {
  const [query, setQuery] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    console.log('qidiruv:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="submit">Qidirish</button>
    </form>
  )
}
```
:::

Uch qoida:

1. Nomi **camelCase** (`onClick`, `onChange`, `onSubmit`);
2. Qiymati — **funksiya**, chaqiruv natijasi emas (`onClick={save}`, `onClick={save()}` emas);
3. `preventDefault` ni o'zingiz chaqirasiz (`return false` ishlamaydi).

## Kod: argument bilan chaqirish

```jsx
{/* ✗ Render paytida darhol chaqiriladi */}
<button onClick={remove(item.id)}>O'chirish</button>

{/* ✓ Strelka funksiya bilan o'rash */}
<button onClick={() => remove(item.id)}>O'chirish</button>

{/* ✓ Yoki ID ni data atributdan olish */}
<ul onClick={handleListClick}>
  {items.map((i) => <li key={i.id} data-id={i.id}>{i.title}</li>)}
</ul>
```

::: ts
```tsx
function handleListClick(event: React.MouseEvent<HTMLUListElement>) {
  const target = (event.target as HTMLElement).closest('[data-id]')
  if (!target) return

  remove(Number(target.getAttribute('data-id')))
}
```
:::

::: js
```jsx
function handleListClick(event) {
  const target = event.target.closest('[data-id]')
  if (!target) return

  remove(Number(target.getAttribute('data-id')))
}
```
:::

Ikkinchi usul (hodisa delegatsiyasi) 1 000+ elementli ro'yxatlarda foydali, lekin odatiy holatda birinchisi o'qilishi osonroq.

## Kod: SyntheticEvent

React hodisa obyektini o'zi o'raydi (`SyntheticEvent`) — shunda brauzerlararo farqlar tekislanadi:

```jsx
function handleClick(event) {
  event.preventDefault()
  event.stopPropagation()

  event.target          // hodisa boshlangan element
  event.currentTarget   // tinglovchi biriktirilgan element
  event.nativeEvent     // haqiqiy brauzer hodisasi

  console.log(event.type)          // 'click'
}
```

`target` va `currentTarget` farqi muhim: ichma-ich elementda `target` — bosilgan aniq element, `currentTarget` — tinglovchi turgan element.

## Kod: ko'tarilish (bubbling) va to'xtatish

::: ts
```tsx
function Card({ item, onOpen, onDelete }: CardProps) {
  return (
    <article onClick={() => onOpen(item.id)}>
      <h3>{item.title}</h3>

      <button
        onClick={(event) => {
          event.stopPropagation()       // aks holda `onOpen` ham ishlaydi
          onDelete(item.id)
        }}
      >
        O'chirish
      </button>
    </article>
  )
}
```
:::

::: js
```jsx
function Card({ item, onOpen, onDelete }) {
  return (
    <article onClick={() => onOpen(item.id)}>
      <h3>{item.title}</h3>

      <button
        onClick={(event) => {
          event.stopPropagation()       // aks holda `onOpen` ham ishlaydi
          onDelete(item.id)
        }}
      >
        O'chirish
      </button>
    </article>
  )
}
```
:::

Capture bosqichida tinglash uchun nom oxiriga `Capture` qo'shiladi:

```jsx
<div onClickCapture={handleCapture}>…</div>
```

## Kod: klaviatura, fokus, sichqoncha

::: ts
```tsx
<input
  onKeyDown={(event) => {
    if (event.key === 'Enter') submit()
    if (event.key === 'Escape') clear()
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      openPalette()
    }
  }}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>

<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onContextMenu={(event) => {
    event.preventDefault()
    showMenu(event.clientX, event.clientY)
  }}
/>
```
:::

::: js
```jsx
<input
  onKeyDown={(event) => {
    if (event.key === 'Enter') submit()
    if (event.key === 'Escape') clear()
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      openPalette()
    }
  }}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>

<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onContextMenu={(event) => {
    event.preventDefault()
    showMenu(event.clientX, event.clientY)
  }}
/>
```
:::

Vue'dagi `@keyup.enter` kabi modifikatorlar React'da yo'q — shart qo'lda yoziladi. Buni kichik yordamchi bilan qisqartirish mumkin:

```js
const onKey = (key, fn) => (event) => {
  if (event.key === key) fn(event)
}

<input onKeyDown={onKey('Enter', submit)} />
```

## Kod: ikki marta bosishdan himoya

::: ts
```tsx
function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false)

  async function handleClick() {
    if (saving) return

    setSaving(true)

    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={saving}>
      {saving ? 'Saqlanmoqda…' : 'Saqlash'}
    </button>
  )
}
```
:::

::: js
```jsx
function SaveButton({ onSave }) {
  const [saving, setSaving] = useState(false)

  async function handleClick() {
    if (saving) return

    setSaving(true)

    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={saving}>
      {saving ? 'Saqlanmoqda…' : 'Saqlash'}
    </button>
  )
}
```
:::

React 19 da bu naqsh `useActionState` bilan ancha qisqaradi (25-bob).

## Muhandislik nuqtai nazari: hodisa ishlov beruvchisi — nojo'ya ta'sirlar joyi

05-bobda ko'rdik: render toza bo'lishi kerak. Nojo'ya ta'sirlar ikki joyda yashaydi:

| Joy | Misol |
| --- | --- |
| **Hodisa ishlov beruvchisi** | Saqlash, o'chirish, navigatsiya, analitika |
| **Effekt** (27-bob) | Tashqi tizim bilan sinxronlash |

Amaliy qoida: **foydalanuvchi harakatiga javob — hodisada, tizim holatiga moslashish — effektda.**

```jsx
// ✓ Hodisada: foydalanuvchi bosdi → so'rov
async function handleBuy() {
  await api.post('/orders', { productId })
  navigate('/orders')
}

// ✗ Effektda: "productId o'zgardi → buyurtma yaratilsin"
useEffect(() => {
  api.post('/orders', { productId })       // xavfli: ikki marta ishlashi mumkin
}, [productId])
```

## Muhandislik nuqtai nazari: handler'lar hajmi

```jsx
{/* ✗ 30 qatorlik inline funksiya */}
<form onSubmit={async (e) => { /* validatsiya + so'rov + xato + toast + navigatsiya */ }}>

{/* ✓ Nomlangan funksiya, har qism o'z joyida */}
async function handleSubmit(event) {
  event.preventDefault()

  if (!validate()) return

  await saveUser(form)
  toast.success('Saqlandi')
  navigate('/users')
}
```

Nomlangan funksiya: o'qiladi, test qilinadi, stack trace'da ko'rinadi.

## Muhandislik nuqtai nazari: erishimlilik

```jsx
{/* ✗ Klaviatura bilan ishlamaydi, skrinrider tugma deb bilmaydi */}
<div onClick={save}>Saqlash</div>

{/* ✓ */}
<button type="button" onClick={save}>Saqlash</button>
```

Agar dizayn `<button>` ko'rinishini xohlamasa — CSS bilan tuzating, semantikani emas. Majburan `<div>` ishlatilsa, `role="button"`, `tabIndex={0}` va `onKeyDown` (Enter/Space) qo'lda qo'shiladi — bu esa `<button>` beradigan narsaning yomonroq nusxasi (42-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `onClick={save()}` | Render paytida chaqiriladi | `onClick={save}` yoki `() => save(id)` |
| `onchange` (kichik harf) | React tanimaydi | `onChange` |
| `return false` bilan default'ni to'xtatish | React'da ishlamaydi | `event.preventDefault()` |
| Ichki tugmada `stopPropagation` yo'q | Ota handler ham ishlaydi | `event.stopPropagation()` |
| `<div onClick>` tugma o'rniga | Klaviatura va skrinrider ishlamaydi | `<button>` |
| Ikki marta bosishdan himoyasiz forma | Ikkita buyurtma | `disabled` + bayroq |
| Handler ichida holatni darhol o'qish | Holat surati (05-bob) | Funksional yangilash |
| `useEffect` ni hodisa o'rniga ishlatish | Ikki marta ishlash, poyga | Hodisada bajaring |

## Amaliyot

1. Qidiruv formasini yozing: `onSubmit` + `preventDefault`, `Escape` bilan tozalash.
2. Kartochka ichida "O'chirish" tugmasini qiling va `stopPropagation` siz nima bo'lishini ko'ring.
3. `Cmd/Ctrl + K` yorlig'ini qo'shing (`onKeyDown` + `metaKey`).
4. Ikki marta bosishdan himoyalangan saqlash tugmasini yozing va Slow 3G bilan sinang.
5. `<div onClick>` bilan tugma yasang, keyin klaviatura bilan ishlatib ko'ring — nima yetishmayapti?

## Rasmiy hujjat

- Hodisalar: <https://react.dev/learn/responding-to-events>
- SyntheticEvent: <https://react.dev/reference/react-dom/components/common#react-event-object>

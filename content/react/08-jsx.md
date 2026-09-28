# 08 — JSX sintaksisi

[← Oldingi: React Compiler](07-react-compiler.md) · [Mundarija](README.md) · [Keyingi: Ro'yxatlar va `key` →](09-royxatlar-va-key.md)

## Tushuncha

JSX — HTML'ga o'xshagan sintaksis bo'lib, u **JavaScript funksiya chaqiruvlariga** aylanadi:

```jsx
const element = <h1 className="title">Salom</h1>
```

Build vaqtida:

```js
import { jsx as _jsx } from 'react/jsx-runtime'

const element = _jsx('h1', { className: 'title', children: 'Salom' })
```

Ya'ni JSX — shablon tili emas, **funksiya chaqiruvi uchun shakar**. Shuning uchun uni o'zgaruvchiga solish, massivga qo'yish, funksiyadan qaytarish mumkin:

```jsx
const buttons = [<Button key="a">A</Button>, <Button key="b">B</Button>]
const content = isLoggedIn ? <Dashboard /> : <Login />
```

## Kod: asosiy qoidalar

```jsx
function Card() {
  const title = 'Sarlavha'
  const isActive = true

  return (
    <article className="card" data-active={isActive}>
      {/* Izoh shu ko'rinishda */}

      <h3>{title}</h3>
      <p>{title.toUpperCase()}</p>
      <p>{2 + 2}</p>
      <p>{isActive ? 'Faol' : 'Nofaol'}</p>

      <input type="text" defaultValue={title} disabled={!isActive} />

      <label htmlFor="email">Pochta</label>
      <input id="email" />
    </article>
  )
}
```

HTML'dan farqlar:

| HTML | JSX | Sabab |
| --- | --- | --- |
| `class` | `className` | `class` — JS'da zaxiralangan so'z |
| `for` | `htmlFor` | Xuddi shunday |
| `onclick` | `onClick` | camelCase konvensiya |
| `tabindex` | `tabIndex` | camelCase |
| `style="color: red"` | `style={{ color: 'red' }}` | Obyekt, camelCase xossalar |
| `<br>` | `<br />` | Har teg yopilishi shart |
| `<!-- izoh -->` | `{/* izoh */}` | Izoh — JS ifodasi |

## Kod: ifodalar va ular emas

`{}` ichiga **ifoda** yoziladi — qiymat qaytaradigan narsa:

```jsx
{/* ✓ ifodalar */}
{user.name}
{items.length > 0 && <List items={items} />}
{isAdmin ? <AdminPanel /> : null}
{items.map((i) => <li key={i.id}>{i.title}</li>)}
{formatPrice(product.price)}

{/* ✗ ko'rsatmalar — ishlamaydi */}
{if (isAdmin) { return <AdminPanel /> }}
{for (const item of items) { ... }}
{const x = 5}
```

Shart murakkab bo'lsa, uni JSX tashqarisiga chiqaring:

```jsx
function StatusBadge({ status }) {
  let label
  let className

  if (status === 'paid') {
    label = 'To\'langan'
    className = 'badge badge-success'
  } else if (status === 'pending') {
    label = 'Kutilmoqda'
    className = 'badge badge-warning'
  } else {
    label = 'Bekor qilingan'
    className = 'badge badge-muted'
  }

  return <span className={className}>{label}</span>
}
```

## Kod: nima render qilinadi, nima yo'q

```jsx
{null}           {/* hech narsa */}
{undefined}      {/* hech narsa */}
{false}          {/* hech narsa */}
{true}           {/* hech narsa */}
{0}              {/* "0" — SON RENDER QILINADI! */}
{''}             {/* hech narsa */}
{[1, 2, 3]}      {/* "123" */}
{{ a: 1 }}       {/* XATO: obyektni render qilib bo'lmaydi */}
```

`0` ning render qilinishi — mashhur tuzoq:

```jsx
{/* ✗ items bo'sh bo'lsa ekranda "0" chiqadi */}
{items.length && <List items={items} />}

{/* ✓ */}
{items.length > 0 && <List items={items} />}
{items.length ? <List items={items} /> : null}
```

13-bobda bu batafsil ko'riladi.

## Kod: fragment

Komponent bir nechta element qaytarishi kerak bo'lsa, ortiqcha `<div>` shart emas:

```jsx
import { Fragment } from 'react'

function Row({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

// `key` kerak bo'lsa — to'liq shakl
function Rows({ items }) {
  return items.map((item) => (
    <Fragment key={item.id}>
      <dt>{item.label}</dt>
      <dd>{item.value}</dd>
    </Fragment>
  ))
}
```

Bu `<dl>`, `<table>`, `<ul>` ichidagi komponentlar uchun zarur — ortiqcha `<div>` HTML semantikasini buzardi.

## Kod: props uzatish

```jsx
<Button variant="primary" size="lg" disabled onClick={save}>
  Saqlash
</Button>

{/* Obyektni yoyish */}
<Input {...inputProps} />

{/* Qolganlarini uzatish */}
function Field({ label, ...rest }) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  )
}
```

`disabled` — qiymatsiz yozilsa `true` (HTML semantikasi bilan bir xil).

## Kod: shartli atributlar

```jsx
{/* undefined bo'lsa atribut umuman qo'yilmaydi */}
<a href={isExternal ? url : undefined} target={isExternal ? '_blank' : undefined}>
  Havola
</a>

{/* Obyekt yoyish bilan */}
<button {...(isSubmit ? { type: 'submit' } : { type: 'button' })}>Yuborish</button>

{/* className birlashtirish */}
<div className={`card ${isActive ? 'card-active' : ''}`.trim()}>…</div>
```

Class nomlarini birlashtirish uchun kichik yordamchi keng tarqalgan (`clsx` yoki `classnames`):

```jsx
import clsx from 'clsx'

<div className={clsx('card', isActive && 'card-active', size && `card-${size}`)} />
```

## Kod: `dangerouslySetInnerHTML`

```jsx
{/* Odatiy holatda matn ekranlanadi — XSS'dan himoya */}
<p>{userComment}</p>

{/* HTML sifatida — faqat ishonchli yoki tozalangan mazmun */}
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

Nomi ataylab qo'rqinchli: u React'dagi asosiy XSS yo'li (47-bob). Foydalanuvchi mazmuni bo'lsa — DOMPurify bilan tozalang yoki markdown ishlating.

## Muhandislik nuqtai nazari: JSX shablondan nimasi bilan farq qiladi

| | Shablon (Vue, Angular) | JSX |
| --- | --- | --- |
| Sikl | `v-for` direktivasi | `map()` |
| Shart | `v-if` direktivasi | Ternar, `&&`, o'zgaruvchi |
| Statik tahlil | Kuchli (kompilyator optimizatsiya qiladi) | Cheklangan |
| O'rganish | Yangi sintaksis | JavaScript bilimi yetarli |
| Moslashuvchanlik | Direktivalar bilan cheklangan | To'liq JS kuchi |
| IDE yordami | Yaxshi | Juda yaxshi (oddiy JS) |

JSX'ning kuchi — **cheklov yo'qligi**: komponentni o'zgaruvchiga solish, shart bilan tanlash, massivga yig'ish tabiiy ishlaydi. Narxi — kompilyator shablonni chuqur optimallashtira olmaydi (Vue'dagi patch flag'lar kabi), shuning uchun React Compiler (07-bob) boshqa yo'ldan boradi.

## Muhandislik nuqtai nazari: JSX o'qilishini saqlash

Komponent 150 qatordan oshsa yoki JSX 4 darajadan chuqur ichma-ich bo'lsa — uni bo'lish vaqti:

```jsx
{/* ✗ O'qib bo'lmaydi */}
<div>
  {isLoading ? <Spinner /> : error ? <Error error={error} /> : items.length === 0
    ? <Empty /> : <ul>{items.map((i) => <li key={i.id}>{i.title}</li>)}</ul>}
</div>

{/* ✓ Erta qaytish (early return) */}
function List({ isLoading, error, items }) {
  if (isLoading) return <Spinner />
  if (error) return <Error error={error} />
  if (items.length === 0) return <Empty />

  return (
    <ul>
      {items.map((i) => <li key={i.id}>{i.title}</li>)}
    </ul>
  )
}
```

**Erta qaytish** — React'dagi eng foydali o'qilishni yaxshilash usuli. U ichma-ich ternarlarni butunlay yo'q qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `class` yozish | JSX'da ishlamaydi | `className` |
| `{items.length && ...}` | Bo'sh bo'lsa `0` ko'rinadi | `> 0` yoki ternar |
| Obyektni to'g'ridan-to'g'ri render qilish | "Objects are not valid as a React child" | `JSON.stringify` yoki maydonni oling |
| Ichma-ich ternarlar zanjiri | O'qib bo'lmaydi | Erta qaytish |
| `style="color: red"` | JSX'da obyekt kutiladi | `style={{ color: 'red' }}` |
| `dangerouslySetInnerHTML` ga foydalanuvchi mazmuni | XSS | Tozalash (47-bob) |
| Har elementga inline arrow funksiya (katta ro'yxatda) | Ortiqcha obyektlar | Kompilyator yoki `useCallback` (22-bob) |

## Amaliyot

1. `StatusBadge` komponentini yozing: `paid`/`pending`/`cancelled` holatlari uchun turli matn va class.
2. `{items.length && <List />}` tuzog'ini takrorlang: bo'sh massiv bilan ekranda nima chiqadi?
3. Ichma-ich ternarli komponent yozing, keyin uni erta qaytish bilan qayta yozing — nechta qator qisqardi?
4. `<dl>` ichida `Fragment` bilan `dt`/`dd` juftliklarini render qiling.
5. `clsx` ni o'rnating va shartli class'larni u bilan yozing.

## Rasmiy hujjat

- JSX: <https://react.dev/learn/writing-markup-with-jsx>
- JSX ichida JavaScript: <https://react.dev/learn/javascript-in-jsx-with-curly-braces>
- `dangerouslySetInnerHTML`: <https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html>

# 09 — Ro'yxatlar va `key`

[← Oldingi: JSX sintaksisi](08-jsx.md) · [Mundarija](README.md) · [Keyingi: Komponent asoslari →](10-komponent-asoslari.md)

## Tushuncha

React'da ro'yxat — oddiy `map()`:

::: ts
```tsx
type User = { id: number; name: string }

function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```
:::

Hech qanday maxsus direktiva yo'q — bu shunchaki massiv metodidan qaytgan JSX elementlari massivi (08-bob).

## Nega shunday: `key` nima uchun kerak

Ro'yxat o'zgarganda React eski va yangi elementlarni solishtiradi. Savol: eski 2-element va yangi 2-element **bir xil narsami**?

`key` bo'lmasa, React pozitsiyaga qarab taxmin qiladi va bu holat bo'lgan elementlarda xato natija beradi:

::: ts
```tsx
{/* key yo'q */}
{users.map((user) => (
  <li>
    <input defaultValue={user.name} />
  </li>
))}
```
:::

::: js
```jsx
{/* key yo'q */}
{users.map((user) => (
  <li>
    <input defaultValue={user.name} />
  </li>
))}
```
:::

Ro'yxat boshiga yangi foydalanuvchi qo'shilsa, React birinchi `<li>` ni qayta ishlatadi va inputga **yozilgan matn o'sha joyda qoladi** — endi u boshqa foydalanuvchiga tegishli bo'lib ko'rinadi. Checkbox holati, fokus, video pozitsiyasi — hammasi shunday "siljiydi".

`key` berilsa, React har elementni shaxsiy nomi bilan taniydi va DOM tugunini element bilan birga ko'chiradi.

## Kod: to'g'ri va noto'g'ri `key`

```jsx
{/* ✓ Barqaror, noyob identifikator */}
{users.map((u) => <UserRow key={u.id} user={u} />)}

{/* ✗ Indeks: tartib o'zgarsa key ham o'zgaradi — foydasi qolmaydi */}
{users.map((u, i) => <UserRow key={i} user={u} />)}

{/* ✗ Tasodifiy: har renderda yangi key → butun ro'yxat qayta yaratiladi */}
{users.map((u) => <UserRow key={Math.random()} user={u} />)}

{/* ~ Faqat o'zgarmaydigan ro'yxat uchun maqbul */}
{['uz', 'ru', 'en'].map((lang, i) => <option key={i} value={lang}>{lang}</option>)}
```

Indeksni `key` qilish faqat uchta shart birga bajarilsa xavfsiz: ro'yxat qayta tartiblanmaydi, element qo'shilmaydi/o'chirilmaydi va element ichida holat yo'q.

Server ID hali yo'q bo'lgan yangi elementlar uchun (forma qatorlari) klient tomonda ID yarating:

```jsx
const [rows, setRows] = useState([])

function addRow() {
  setRows([...rows, { localId: crypto.randomUUID(), title: '' }])
}
```

## Kod: `key` bilan holatni tozalash

`key` faqat ro'yxatlar uchun emas. U React'ga "bu butunlay boshqa element" deyishning umumiy usuli:

::: ts
```tsx
{/* Foydalanuvchi almashganda forma holati tozalansin */}
<ProfileForm key={userId} userId={userId} />

{/* Tab almashganda ichki holat qayta boshlansin */}
<TabPanel key={activeTab} tab={activeTab} />
```
:::

::: js
```jsx
{/* Foydalanuvchi almashganda forma holati tozalansin */}
<ProfileForm key={userId} userId={userId} />

{/* Tab almashganda ichki holat qayta boshlansin */}
<TabPanel key={activeTab} tab={activeTab} />
```
:::

Bu naqsh `useEffect` bilan holatni qo'lda tozalashdan ancha toza (28-bob).

## Kod: filtrlash, saralash, guruhlash

::: ts
```tsx
function ProductList({ products, query, sortBy }: Props) {
  // Render paytida hisoblanadi — useMemo shart emas (06-bob)
  const visible = products
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortBy === 'price' ? a.price - b.price : a.title.localeCompare(b.title)))

  if (visible.length === 0) return <Empty query={query} />

  return (
    <ul>
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
function ProductList({ products, query, sortBy }) {
  // Render paytida hisoblanadi — useMemo shart emas (06-bob)
  const visible = products
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortBy === 'price' ? a.price - b.price : a.title.localeCompare(b.title)))

  if (visible.length === 0) return <Empty query={query} />

  return (
    <ul>
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  )
}
```
:::

Diqqat: `sort` massivni **joyida o'zgartiradi**. `products` — props, uni mutatsiya qilish taqiqlangan (11-bob). Yuqorida `filter` yangi massiv qaytargani uchun xavfsiz; agar filtr bo'lmasa, nusxa oling:

```js
const sorted = [...products].sort(...)
// yoki
const sorted = products.toSorted(...)      // zamonaviy brauzerlar
```

Guruhlash:

```jsx
const byCategory = Object.groupBy(products, (p) => p.category)

return (
  <>
    {Object.entries(byCategory).map(([category, items]) => (
      <section key={category}>
        <h3>{category}</h3>
        <ul>{items.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      </section>
    ))}
  </>
)
```

## Kod: ichma-ich ro'yxatlar

```jsx
{groups.map((group) => (
  <section key={group.id}>
    <h3>{group.title}</h3>

    <ul>
      {group.items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  </section>
))}
```

`key` har darajada alohida bo'ladi — u faqat **aka-uka elementlar orasida** noyob bo'lishi kerak, butun ilovada emas.

## Muhandislik nuqtai nazari: ro'yxat va unumdorlik

Ro'yxat — sahifadagi eng qimmat joy. Optimizatsiya tartibi (41-bobda batafsil):

1. **Kamroq element ko'rsating** — sahifalash yoki "yana yuklash";
2. **`key` to'g'ri bo'lsin** — noto'g'ri `key` butun ro'yxatni qayta yaratadi;
3. **Qator komponentini memoizatsiya qiling** — React Compiler yoki `memo`;
4. **Virtualizatsiya** — 1 000+ qator uchun (`@tanstack/react-virtual`).

Qo'shimcha: ro'yxat elementiga har renderda yangi obyekt/funksiya uzatmang:

```jsx
{/* ✗ Har renderda yangi obyekt va funksiya */}
{items.map((i) => <Row key={i.id} config={{ compact: true }} onSelect={() => pick(i.id)} />)}

{/* ✓ Konstanta + ID bilan ishlaydigan umumiy handler */}
const config = { compact: true }

{items.map((i) => <Row key={i.id} item={i} config={config} onSelect={pick} />)}
```

Bola komponent ichida `onSelect(item.id)` chaqiriladi — shunda har element uchun alohida funksiya kerak bo'lmaydi.

## Muhandislik nuqtai nazari: ma'lumot shakli

Server ro'yxatini ikki shaklda saqlash mumkin:

```js
// Massiv — tartib muhim
const [users, setUsers] = useState([{ id: 1, name: 'Aziz' }])

// Normalizatsiya — ID bo'yicha tez topish, qisman yangilash
const [byId, setById] = useState({ 1: { id: 1, name: 'Aziz' } })
const [ids, setIds] = useState([1])
```

Normalizatsiya foydali bo'ladigan holatlar (17-bobda batafsil): bitta obyekt bir nechta ro'yxatda uchraydi, tez-tez ID bo'yicha qidiriladi, qisman yangilanadi, ro'yxat katta.

Kichik ilovada massiv yetarli — erta normalizatsiya ortiqcha murakkablik.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `key` yozmaslik | Konsolda ogohlantirish, holat siljiydi | `key={item.id}` |
| `key={index}` tartib o'zgaradigan ro'yxatda | Indeks barqaror emas | Barqaror ID |
| `key={Math.random()}` | Har render — yangi DOM, fokus yo'qoladi | Barqaror ID |
| Props massivini `sort` qilish | Props mutatsiyasi | `[...arr].sort()` yoki `toSorted` |
| Ro'yxat elementiga inline obyekt/funksiya | Ortiqcha render (kompilyatorsiz) | Konstanta yoki ID bilan handler |
| 5 000 qatorni birdan render qilish | Sahifa qotadi | Sahifalash yoki virtualizatsiya |
| Bo'sh holatni unutish | "Hech narsa yo'q" ekrani chalkash | `if (items.length === 0) return <Empty />` |

## Amaliyot

1. `key` siz ro'yxat yasang, har qatorga `<input>` qo'ying, matn yozing va ro'yxat boshiga element qo'shing. Matn qayerda qolganini kuzating, keyin `key` qo'shib takrorlang.
2. `key={index}` bilan tartiblanadigan ro'yxat yasang va saralashni almashtirib, xatti-harakatni ko'ring.
3. `key={userId}` bilan forma holatini tozalashni amalga oshiring.
4. `Object.groupBy` bilan mahsulotlarni kategoriya bo'yicha guruhlab chiqaring.
5. 5 000 element render qiling va Profiler'da vaqtni o'lchang; keyin 50 taga sahifalab solishtiring.

## Rasmiy hujjat

- Ro'yxatlarni render qilish: <https://react.dev/learn/rendering-lists>
- `key` bilan holatni tiklash: <https://react.dev/learn/preserving-and-resetting-state>

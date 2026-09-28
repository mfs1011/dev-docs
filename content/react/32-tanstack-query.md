# 32 — TanStack Query

[← Oldingi: Ma'lumot yuklash](31-malumot-yuklash.md) · [Mundarija](README.md) · [Keyingi: Xatolar bilan ishlash →](33-xatolar.md)

## Tushuncha

TanStack Query (avvalgi nomi React Query) — **server holati** uchun kesh qatlami. U 31-bobda sanab o'tilgan ishlarni o'z zimmasiga oladi: kesh, deduplikatsiya, fon'da yangilash, retry, pagination, optimistik yangilash.

```bash
npm i @tanstack/react-query
```

::: ts
```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 1 daqiqa ichida "yangi" hisoblanadi
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
```
:::

::: js
```jsx
// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2, refetchOnWindowFocus: true },
  },
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
```
:::

## Kod: `useQuery`

::: ts
```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'

function useUser(userId: number) {
  return useQuery({
    queryKey: ['users', userId],                    // kesh kaliti
    queryFn: ({ signal }) => api.get<User>(`/users/${userId}`, { signal }),
    enabled: Boolean(userId),                       // shartli yuklash
  })
}

function Profile({ userId }: { userId: number }) {
  const { data, error, isPending, isFetching, refetch } = useUser(userId)

  if (isPending) return <Skeleton />
  if (error) return <ErrorBox error={error} onRetry={refetch} />

  return (
    <div style={{ opacity: isFetching ? 0.6 : 1 }}>
      <h1>{data.name}</h1>
    </div>
  )
}
```
:::

::: js
```jsx
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'

function useUser(userId) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: ({ signal }) => api.get(`/users/${userId}`, { signal }),
    enabled: Boolean(userId),
  })
}

function Profile({ userId }) {
  const { data, error, isPending, isFetching, refetch } = useUser(userId)

  if (isPending) return <Skeleton />
  if (error) return <ErrorBox error={error} onRetry={refetch} />

  return (
    <div style={{ opacity: isFetching ? 0.6 : 1 }}>
      <h1>{data.name}</h1>
    </div>
  )
}
```
:::

Muhim farq: **`isPending` — ma'lumot umuman yo'q**, `isFetching` — so'rov ketyapti (keshdan ko'rsatib turib ham). Shu ikkitasini ajratish yaxshi UX beradi: keshdagi ma'lumot darhol ko'rinadi, yangilanish esa jimgina fon'da bo'ladi.

`signal` — bekor qilish uchun: TanStack Query kerak bo'lganda so'rovni o'zi to'xtatadi (29-bob).

## Kod: `queryKey` — kesh identifikatori

```jsx
['users']                            // butun ro'yxat
['users', userId]                    // bitta foydalanuvchi
['users', { page, search, sort }]    // filtrlangan ro'yxat
['users', userId, 'posts']           // ichma-ich resurs
```

`queryKey` **bog'liqliklar massivi** kabi ishlaydi: u o'zgarsa, yangi so'rov ketadi va natija alohida keshlanadi.

Kalitlarni bitta joyda saqlash — katta loyihalarda majburiy odat:

::: ts
```ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}
```
:::

::: js
```js
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
}
```
:::

## Kod: `useMutation` va invalidatsiya

::: ts
```tsx
function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => api.post<User>('/users', input),

    onSuccess: (created) => {
      // Ro'yxatni eskirgan deb belgilash — u avtomatik qayta yuklanadi
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })

      // Yangi elementni keshga darhol qo'yish (ixtiyoriy)
      queryClient.setQueryData(userKeys.detail(created.id), created)
    },
  })
}

function CreateUserForm() {
  const { mutate, isPending, error } = useCreateUser()

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(values) }}>
      {error && <p role="alert">{error.message}</p>}
      <button disabled={isPending}>{isPending ? 'Saqlanmoqda…' : 'Saqlash'}</button>
    </form>
  )
}
```
:::

::: js
```jsx
function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input) => api.post('/users', input),

    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.setQueryData(userKeys.detail(created.id), created)
    },
  })
}
```
:::

**Invalidatsiya** — TanStack Query'ning yuragi: mutatsiyadan keyin qaysi ma'lumot eskirganini aytasiz, qolganini kutubxona qiladi.

## Kod: optimistik yangilash

::: ts
```tsx
function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) =>
      api.put<Todo>(`/todos/${id}`, { done }),

    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previous = queryClient.getQueryData<Todo[]>(todoKeys.lists())

      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old) =>
        old?.map((t) => (t.id === id ? { ...t, done } : t)),
      )

      return { previous }                         // rollback uchun
    },

    onError: (_error, _vars, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previous)   // qaytarish
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })   // haqiqat bilan moslashtirish
    },
  })
}
```
:::

::: js
```jsx
function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, done }) => api.put(`/todos/${id}`, { done }),

    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previous = queryClient.getQueryData(todoKeys.lists())

      queryClient.setQueryData(todoKeys.lists(), (old) =>
        old?.map((t) => (t.id === id ? { ...t, done } : t)),
      )

      return { previous }
    },

    onError: (_error, _vars, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```
:::

Uch qadam: **oldindan yangilash → xatoda qaytarish → yakunda haqiqat bilan solishtirish.**

## Kod: sahifalash va cheksiz ro'yxat

::: ts
```tsx
// Sahifalash: eski ma'lumot saqlanadi, miltillash bo'lmaydi
const { data, isPlaceholderData } = useQuery({
  queryKey: userKeys.list({ page }),
  queryFn: () => api.get<Paginated<User>>(`/users?page=${page}`),
  placeholderData: (previous) => previous,
})

// Cheksiz ro'yxat
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: userKeys.lists(),
  queryFn: ({ pageParam }) => api.get<Paginated<User>>(`/users?cursor=${pageParam}`),
  initialPageParam: '',
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
})

const users = data?.pages.flatMap((p) => p.items) ?? []
```
:::

::: js
```jsx
const { data, isPlaceholderData } = useQuery({
  queryKey: userKeys.list({ page }),
  queryFn: () => api.get(`/users?page=${page}`),
  placeholderData: (previous) => previous,
})

const { data: infinite, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: userKeys.lists(),
  queryFn: ({ pageParam }) => api.get(`/users?cursor=${pageParam}`),
  initialPageParam: '',
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
})

const users = infinite?.pages.flatMap((p) => p.items) ?? []
```
:::

`useInView` (30-bob) bilan birga — cheksiz scroll tayyor.

## Kod: `staleTime` va `gcTime`

| Sozlama | Ma'nosi | Standart |
| --- | --- | --- |
| `staleTime` | Qancha vaqt "yangi" hisoblanadi (bu davrda qayta so'ralmaydi) | `0` |
| `gcTime` | Ishlatilmagan kesh qancha saqlanadi | 5 daqiqa |
| `refetchOnWindowFocus` | Oyna fokusga qaytganda yangilash | `true` |
| `refetchOnMount` | Komponent mount bo'lganda | `true` |
| `retry` | Xatoda necha marta urinish | 3 |

Amaliy sozlamalar:

```jsx
// Kamdan-kam o'zgaradigan ma'lumot (kataloglar, sozlamalar)
useQuery({ queryKey: ['countries'], queryFn: getCountries, staleTime: 24 * 60 * 60 * 1000 })

// Tez-tez o'zgaradigan (buyurtma holati)
useQuery({ queryKey: ['order', id], queryFn: getOrder, staleTime: 0, refetchInterval: 5000 })
```

Standart `staleTime: 0` ko'p loyihada juda agressiv: har mount'da so'rov ketadi. 30–60 soniya — ko'pincha yaxshi boshlang'ich qiymat.

## Muhandislik nuqtai nazari: nima yutiladi

31-bobdagi "yetishmayapti" jadvalini solishtiring:

| Ehtiyoj | Qo'lda | TanStack Query |
| --- | --- | --- |
| Deduplikatsiya | ~20 qator | Avtomatik |
| Kesh + TTL | ~40 qator | `staleTime` |
| Fon'da yangilash | ~30 qator | Avtomatik |
| Retry + backoff | ~25 qator | `retry` |
| Pagination | ~50 qator | `useInfiniteQuery` |
| Optimistik yangilash | ~40 qator | `onMutate`/`onError` |
| DevTools | Yo'q | Bor |

Narxi: ~13 KB gzip va yangi tushunchalar (queryKey, invalidatsiya, stale/fresh). 10+ so'rovli ilovada bu narx tez qoplanadi.

## Muhandislik nuqtai nazari: DevTools

```bash
npm i -D @tanstack/react-query-devtools
```

```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

DevTools'da: qaysi so'rovlar keshda, qaysi biri eskirgan, qachon yangilangan, nechta observer bor. "Nega ma'lumot yangilanmadi?" savoliga eng tez javob shu yerda.

## Muhandislik nuqtai nazari: klient va server holatini aralashtirmang

```jsx
// ✗ Server ma'lumotini store'ga ko'chirish
const { data } = useQuery({ queryKey: ['users'], queryFn: getUsers })

useEffect(() => {
  setUsersInZustand(data)         // ikki manba paydo bo'ldi
}, [data])

// ✓ Query — yagona manba; store faqat klient holati uchun
const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers })
const selectedId = useUiStore((s) => s.selectedUserId)
```

Bu qoida 17 va 37-boblardagi asosiy g'oyaning davomi: **har ma'lumot turi o'z qatlamida yashaydi.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `queryKey` ga o'zgaruvchan qiymatni qo'shmaslik | Eski ma'lumot ko'rinadi | Barcha bog'liqliklarni kalitga |
| `queryFn` da `signal` ni uzatmaslik | Bekor qilish ishlamaydi | `({ signal }) => fetch(url, { signal })` |
| Mutatsiyadan keyin invalidatsiya qilmaslik | Ro'yxat eski qoladi | `invalidateQueries` |
| `staleTime: 0` bilan katta ilova | Har mount'da so'rov | 30–60 s |
| Server ma'lumotini store'ga nusxalash | Ikki manba | Query — yagona manba |
| `isPending` va `isFetching` ni chalkashtirish | Har yangilanishda skelet | Ikkalasini ajrating |
| Optimistik yangilashda rollback yozmaslik | Xato bo'lsa noto'g'ri holat qoladi | `onError` + `context` |

## Amaliyot

1. TanStack Query'ni ulang va 31-bobdagi `useFetch` ni `useQuery` ga almashtiring — nechta qator yo'qoldi?
2. DevTools'ni oching va sahifalar orasida yurib, kesh holatini kuzating.
3. `queryKey` fabrikasini yozing va filtrlangan ro'yxat uchun ishlating.
4. Mutatsiya yozing va invalidatsiyasiz qoldiring — ro'yxat eskirib qolishini ko'ring, keyin tuzating.
5. Optimistik yangilashni qo'shing va so'rovni ataylab xato qildirib, rollback ishlashini tasdiqlang.
6. `useInfiniteQuery` + `useInView` bilan cheksiz scroll qiling.

## Rasmiy hujjat

- TanStack Query: <https://tanstack.com/query/latest/docs/framework/react/overview>
- Query kalitlari: <https://tanstack.com/query/latest/docs/framework/react/guides/query-keys>
- Optimistik yangilashlar: <https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates>

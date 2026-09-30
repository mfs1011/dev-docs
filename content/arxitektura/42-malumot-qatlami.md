# 42 — Ma'lumot qatlami

[← Oldingi: Reaktivlik modellari](41-reaktivlik-modellari.md) · [Mundarija](README.md) · [Keyingi: Dizayn tizimi →](43-dizayn-tizimi.md)

## Tushuncha

Ma'lumot qatlami — frontend va server orasidagi hamma narsa: so'rov yuborish, javobni tiplash va tekshirish, keshlash, eskirishni boshqarish, mutatsiyadan keyin yangilash, xatolar.

```text
Komponent ──▶ So'rov keshi (resource / query) ──▶ API klient (endpoint'lar, DTO) ──▶ HTTP (interceptorlar)
                 kesh, eskirish, dedup,              URL, parametrlar,                  auth, xato, retry,
                 loading/error holatlari            parse (Zod)                         timeout
```

## Nega shunday

Har komponent o'zi `fetch` qilsa:

- Bir xil ma'lumot 3 marta so'raladi (3 komponent).
- Har joyda qo'lda `loading`, `error`, bekor qilish.
- Mutatsiyadan keyin qaysi ro'yxatlarni yangilash kerakligi — hech kim bilmaydi.
- URL va DTO'lar kod bo'ylab tarqalgan — backend o'zgarsa, 20 joyni tuzatish.

## Psevdokod: uch qatlam

```text
// 1. HTTP — umumiy mantiq (bir marta)
http = createClient({ baseUrl, interceptors: [auth, errors, timeout(10s)] })

// 2. API klient — endpoint'lar va shartnoma
productApi = {
  list(query): Promise<Page<Product>>  = http.get("/products", cleanParams(query)).parse(PageSchema(ProductSchema))
  update(id, patch): Promise<Product>  = http.patch("/products/" + id, patch).parse(ProductSchema)
}

// 3. So'rov keshi — kalit bo'yicha
products = query(key = ["products", filters], fn = () => productApi.list(filters), staleTime = 30s)
mutation updateProduct:
    run: productApi.update
    onSuccess: invalidate(["products"]); invalidate(["product", id])
```

## Psevdokod: eskirish va yangilash

```text
Ma'lumot holatlari:
  fresh   — yangi, qayta so'ralmaydi
  stale   — eskirgan: ko'rsatiladi, lekin fonda qayta so'raladi (stale-while-revalidate)
  inactive— ekranda yo'q, vaqt o'tsa xotiradan tozalanadi

Qayta so'rash sabablari: kalit o'zgardi, oyna fokus oldi, tarmoq qaytdi, invalidatsiya, qo'lda reload
```

## Psevdokod: optimistik yangilash

```text
mutation toggleFavorite(id):
    onMutate:  snapshot = cache.get(["favorites"]); cache.set(["favorites"], toggle(snapshot, id))   // darhol
    onError:   cache.set(["favorites"], snapshot); toast("Saqlab bo'lmadi")                          // orqaga
    onSettled: invalidate(["favorites"])                                                           // server bilan tekshirish
```

Qachon optimistik: natija deyarli har doim muvaffaqiyatli va qaytarish oson (like, sevimli, tartiblash). Qachon **yo'q**: to'lov, buyurtma — server tasdig'ini kutish kerak.

## Framework'larda

| Qatlam | Angular | React / Next | Vue |
| --- | --- | --- | --- |
| HTTP + interceptor | `HttpClient` — [55–57-boblar](../angular/55-http-client.md) | `fetch` o'rami | `ofetch`/axios — [44-bob](../vue/44-http-qatlami.md) |
| So'rov keshi | `httpResource` (+ o'z invalidatsiya) — [21-bob](../angular/21-http-resource.md); NgRx `resource` | TanStack Query — [React 32-bob](../react/32-tanstack-query.md); Next.js server kesh — [18–19](../nextjs/18-kesh.md) | Pinia Colada / TanStack Vue Query |
| Parse | `httpResource` `parse: Zod` — [Angular 57-bob](../angular/57-http-xatolar.md) | Zod | Zod |
| Optimistik | Signal store'da qo'lda — [60-bob](../angular/60-signal-xizmatlar.md) | `onMutate` / `useOptimistic` — [Next.js 23-bob](../nextjs/23-optimistik.md) | Pinia action'da |

Angular'da tekshirilgan nozik joylar: `httpResource` parametr o'zgarganda `value()` **`undefined`** bo'ladi (eski qiymat saqlanmaydi — "miltillash" sababi), xato holatida `value()` o'qish xato tashlaydi — `hasValue()` kerak; `params` dagi `null`/`undefined` so'zma-so'z `"null"` bo'lib ketadi ([Angular 55-bob](../angular/55-http-client.md)).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Komponentda `fetch` | Oddiy | Takror, qo'lda holatlar, kesh yo'q |
| O'z store'ida qo'lda kesh | Nazorat | Eskirish/invalidatsiya/dedup qayta yoziladi |
| So'rov keshi kutubxonasi | Standart xulq, kam kod | Yana bir abstraksiya, uning qoidalari |
| Optimistik UI | Tez his | Qaytarish mantiqi, nomuvofiq holatlar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| URL'lar komponentlarda | Backend o'zgarsa ko'p joy | API klient |
| Server ma'lumotini global store'da qo'lda | Eskirish, dedup yo'q | So'rov keshi |
| Mutatsiyadan keyin invalidatsiya yo'q | Eski ro'yxat | Kalit bo'yicha invalidatsiya |
| Eskirgan so'rov bekor qilinmaydi | Eski javob yangisini bosib o'tadi | `switchMap`/abort, kutubxona |
| `get<T>` — tekshiruv deb o'ylash | Runtime'da boshqa shakl | Chegarada parse |
| Kritik amalda optimistik UI | "To'landi" ko'rinadi, aslida yo'q | Server tasdig'i |

## Amaliyot

1. Komponentlardagi barcha to'g'ridan-to'g'ri HTTP chaqiruvlarni sanang va API klientga ko'chiring.
2. Bitta ro'yxatni so'rov keshiga o'tkazing, mutatsiyadan keyin invalidatsiya qo'shing.
3. "Sevimli" yoki "like" uchun optimistik yangilash va xatoda qaytarish.
4. Bitta kritik endpoint javobiga Zod parse qo'shing.

## Manbalar

- TkDodo — *Practical React Query* seriyasi <https://tkdodo.eu/blog/practical-react-query>
- RFC 5861 — stale-while-revalidate
- Angular — *httpResource* <https://angular.dev/guide/http/http-resource>

# 65 — Kesh kelishuvi

[← Oldingi: Real vaqt](64-real-vaqt.md) · [Mundarija](README.md) · [Keyingi: Ro'yxat shartnomasi →](66-royxat-shartnomasi.md)

## Tushuncha

Bitta javob yo'lda bir nechta keshdan o'tadi, har biri boshqa egaga tegishli:

```text
Brauzer HTTP keshi → Service worker keshi → CDN → Reverse proxy → Ilova keshi (25-bob) → DB
    klient              frontend jamoasi      ops     ops            backend               backend
```

Kesh **kelishuvi** — kim nimani, qancha vaqt keshlashi va qanday invalidatsiya qilinishi haqida frontend va backend o'rtasidagi shartnoma. Uning tili — HTTP sarlavhalari.

## Nega shunday

Kelishuv bo'lmasa, ikki xil xato bo'ladi: hech narsa keshlanmaydi (sekin, qimmat) yoki noto'g'ri narsa keshlanadi (bir foydalanuvchining sahifasi boshqasiga ko'rinadi, narx o'zgargandan keyin soatlab eski). Ikkinchisi — xavfsizlik hodisasi.

## Psevdokod: Cache-Control — asosiy lug'at

```text
public              har qanday kesh (CDN ham) saqlashi mumkin
private             faqat brauzer (CDN emas) — shaxsiy ma'lumot
no-store            hech qayerda saqlanmasin — maxfiy (bank, token javoblari)
no-cache            saqlash mumkin, lekin har safar serverda tekshirish (ETag bilan)
max-age=N           brauzer uchun N soniya yangi
s-maxage=N          umumiy keshlar (CDN) uchun N soniya
stale-while-revalidate=N   eskirgandan keyin N soniya eski javobni berib, fonda yangilash
immutable           hech qachon o'zgarmaydi (hash'li fayllar)
```

## Psevdokod: resurs turlari bo'yicha siyosat

```text
Hash'li statik fayllar (main-7F3A.js)   public, max-age=31536000, immutable          (49-bob)
index.html                              no-cache                                      (yangi deploy darhol)
Ommaviy katalog API                     public, s-maxage=60, stale-while-revalidate=300
Mahsulot sahifasi (SSR)                 public, s-maxage=300
Foydalanuvchi profili, savat            private, no-cache
Token/refresh javoblari, to'lov         no-store
Rasm (CDN, transformatsiyalar)          public, max-age=86400

Vary: Accept-Language, Accept-Encoding  — javob nimaga qarab o'zgarsa, kesh kaliti shunga bo'linadi
                                           (Vary: Cookie/Authorization — umumiy keshni amalda o'chiradi)
```

## Psevdokod: ETag — shartli so'rovlar

```text
1. GET /products/42
   ← 200, ETag: "v17", Cache-Control: no-cache
2. GET /products/42, If-None-Match: "v17"
   ← 304 Not Modified (tanasiz — trafik tejaladi)

Yozishda — optimistik qulf (24-bob):
   PATCH /products/42, If-Match: "v17"
   ← 412 Precondition Failed — boshqa kimdir o'zgartirgan
```

## Psevdokod: invalidatsiya — kim mas'ul

```text
Backend o'zgarish qildi (narx yangilandi):
  1. ilova keshi — hodisa bo'yicha o'chirish (25-bob)
  2. CDN — purge API (URL yoki teg bo'yicha: Surrogate-Key / Cache-Tag)
  3. klient keshi (TanStack Query, httpResource) — mutatsiyadan keyin invalidatsiya (42-bob)
     yoki real vaqt signali (64-bob)
  4. brauzer HTTP keshi — boshqarib bo'lmaydi → shuning uchun shaxsiy/tez o'zgaradigan javoblarga uzoq max-age bermaslik
```

Qoida: **brauzer keshini uzoq qilmang** agar uni tozalash kerak bo'lishi mumkin bo'lsa — u sizning nazoratingizdan tashqarida. Uzoq keshni faqat hash'li (o'zgarmas) URL'larga bering.

## Framework'larda

| Qatlam | Backend | Frontend |
| --- | --- | --- |
| HTTP kesh sarlavhalari | Symfony `Response::setCache()`, `#[Cache]` atributi, HttpCache (reverse proxy); Laravel `cache.headers` middleware | — |
| SSR marshrut sarlavhalari | — | Angular `ServerRoute.headers` — [Angular 63-bob](../angular/63-server-marshrutlar.md); Next.js `revalidate` — [19-bob](../nextjs/19-revalidatsiya.md) |
| Service worker | — | CacheFirst hash'li chunk'lar, precache qobiq (51-bob) |
| Klient so'rov keshi | — | [React 32-bob](../react/32-tanstack-query.md), [Angular 21-bob](../angular/21-http-resource.md) |
| SSR transfer cache | — | Serverdagi javob HTML'ga yoziladi, brauzer qayta so'ramaydi — [Angular 62-bob](../angular/62-ssr-asoslari.md) |

Next.js kesh qatlamlari ([Next.js 18-bob](../nextjs/18-kesh.md)) — bitta framework ichida bir nechta kesh: aynan shu bobdagi "kim nimani keshlaydi" savoli framework ichida ham turadi.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Uzoq `max-age` | Eng tez, server yuki yo'q | Brauzerda tozalab bo'lmaydi |
| `no-cache` + ETag | Doim yangi, trafik tejaladi | Har safar so'rov (304) |
| CDN `s-maxage` + purge | Katta yukka bardosh | Purge infratuzilmasi, teg intizomi |
| `stale-while-revalidate` | Tez + nisbatan yangi | Qisqa muddat eski ma'lumot |
| Keshsiz | Oddiy, izchil | Sekin, qimmat |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Shaxsiy javob `public` | Boshqa foydalanuvchiga ko'rinadi | `private` / `no-store` |
| Sarlavhasiz javob | Proksilar o'z evristikasi bilan keshlaydi | Har javobda aniq `Cache-Control` |
| `index.html` uzoq keshlanadi | Yangi deploy ko'rinmaydi | `no-cache` |
| Hash'siz JS + uzoq kesh | Eski kod abadiy | Kontent hash |
| `Vary` unutilgan (til bo'yicha) | O'zbekcha sahifa inglizcha foydalanuvchiga | `Vary: Accept-Language` yoki til URL'da |
| Token javobi keshlanadi | Sizib chiqish | `no-store` |

## Amaliyot

1. Production'dagi 10 xil javob turining `Cache-Control` sarlavhalarini yig'ing va yuqoridagi jadval bilan solishtiring.
2. Shaxsiy ma'lumot qaytaradigan endpoint'larda `public` yoki sarlavhasiz javob bormi?
3. Bitta GET endpoint'ga ETag + 304 qo'shing.
4. Narx o'zgarganda qaysi keshlar invalidatsiya qilinishini ketma-ket yozing.

## Manbalar

- RFC 9111 — *HTTP Caching* <https://www.rfc-editor.org/rfc/rfc9111>
- web.dev — *Prevent unnecessary network requests with the HTTP Cache*
- MDN — *Cache-Control*

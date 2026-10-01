# 51 — Offline va optimistik UI

[← Oldingi: Mikro-frontendlar](50-mikro-frontendlar.md) · [Mundarija](README.md) · [Keyingi: Frontend testlash strategiyasi →](52-frontend-testlash.md)

## Tushuncha

Tarmoq — ishonchsiz: metro, lift, qishloq yo'li, "Wi-Fi bor, internet yo'q". Bu bob — tarmoqqa **kamroq bog'liq** frontend qurishning uch darajasi:

| Daraja | Nima | Misol |
| --- | --- | --- |
| **Optimistik UI** | Server javobini kutmasdan natijani ko'rsatish | Like, sevimli, ro'yxat tartibi |
| **Offline o'qish** | Avval ko'rilgan ma'lumot internetsiz ochiladi | Hujjatlar, maqolalar, katalog |
| **Offline yozish** | Internetsiz o'zgarishlar, keyin sinxronlash | Kuryer ilovasi, inspeksiya formalari, eslatmalar |

Har keyingi daraja oldingisidan ancha murakkab.

## Nega shunday

Odatiy SPA'da har harakat — tarmoq so'rovi va spinner. Sekin tarmoqda bu ilovani "qotgan" qilib ko'rsatadi, tarmoq yo'q bo'lsa — umuman ishlamaydi. Ba'zi ilovalar uchun bu qabul qilinadi (bank to'lovi — server tasdiqisiz mumkin emas), boshqalari uchun — yo'q (kuryer omborda internetsiz buyurtmani yopishi kerak).

## Psevdokod: optimistik yangilash

```text
toggleFavorite(id):
    previous = state.favorites
    state.favorites = toggle(previous, id)          // 1. darhol ko'rsatish
    try:
        await api.toggleFavorite(id)                 // 2. serverga
    catch:
        state.favorites = previous                   // 3. xato — orqaga qaytarish
        toast("Saqlab bo'lmadi")
```

| Mos | Mos emas |
| --- | --- |
| Muvaffaqiyat ehtimoli yuqori | To'lov, buyurtma — server qaror qiladi |
| Qaytarish oson va tushunarli | Natija boshqa foydalanuvchilarga darhol ta'sir qiladi |
| Xato kam va zararsiz | Server qo'shimcha ma'lumot qaytaradi (ID, narx) |

## Psevdokod: offline o'qish — service worker

```text
Service worker — brauzer va tarmoq orasidagi proksi:

ilova qobig'i (HTML, asosiy JS/CSS)   → precache: o'rnatishda yuklanadi
kontent (hash'li chunk'lar, rasmlar)  → CacheFirst: fayl nomi o'zgarmasa, kesh doim to'g'ri
API ma'lumoti                          → NetworkFirst yoki StaleWhileRevalidate:
                                         tarmoq bo'lsa yangi, bo'lmasa — keshdagi (eskirgan) nusxa

Yangi versiya:
  yangi service worker kutadi → foydalanuvchiga "Yangilash" taklifi → tasdiqlansa faollashadi
  (o'qish/yozish o'rtasida sahifani o'zi qayta yuklamaslik)
```

### Real misol — shu sayt

Bu qo'llanmalar sayti PWA qilinganda (Workbox, `vite-plugin-pwa`) amalda tekshirilgan qarorlar:

- **Precache — faqat qobiq va qidiruv indeksi** (~240 KB gzip). Barcha boblar (~6 MB) precache qilinmaydi — ochilgan bob keshga tushadi (CacheFirst, nomida hash bor).
- **Yangilanish — "prompt" rejimida**: yangi deploy'dan keyin pastda "Yangi versiya mavjud — Yangilash" xabari; bosilmaguncha eski matn qoladi.
- **`navigator.onLine` ga ishonib bo'lmaydi**: server o'chiq bo'lsa ham u `true` qaytardi. Bob yuklanmasa, "offline" yoki "yangi versiya chiqqan, eski fayl o'chirilgan" ekanini aniqlash uchun — keshlanmaydigan kichik `HEAD` so'rovi bilan haqiqiy tekshiruv.
- **Ochilmagan bob offline** — xom "Failed to fetch dynamically imported module" o'rniga "Bu bob hali offline saqlanmagan" xabari.

## Psevdokod: offline yozish — navbat va sinxron

```text
Foydalanuvchi o'zgartirdi (offline):
    localDb.apply(change)                         // IndexedDB — UI darhol yangilanadi
    outbox.push({ id: uuid(), op: change, baseVersion, createdAt })

Tarmoq qaytdi (yoki Background Sync):
    for item in outbox:
        response = api.send(item, idempotencyKey = item.id)     // takror yuborish xavfsiz (70-bob)
        if response.conflict: resolve(item, response.serverState)
        else: outbox.remove(item)
```

### Konfliktlarni hal qilish

```text
Bir yozuvni offline'da ikki joyda o'zgartirishdi. Kim yutadi?

Last-write-wins       — oxirgisi yutadi. Oddiy, lekin ma'lumot jim yo'qoladi
Maydon bo'yicha birlash — turli maydonlar o'zgargan bo'lsa ikkalasi saqlanadi
Foydalanuvchiga ko'rsatish — "Siz va Ali bir vaqtda o'zgartirdingiz" + tanlash
CRDT                  — matematik birlashadigan tuzilmalar (hamkorlikda tahrirlash: Yjs, Automerge)
Domen qoidasi         — "inspeksiya natijasi faqat qo'shiladi, o'chirilmaydi" — konflikt imkonsiz
```

Eng kuchli usul — oxirgisi: **domenni konflikt bo'lmaydigan qilib loyihalash** (faqat qo'shiladigan hodisalar, har qurilma o'z yozuvlari).

## Framework'larda

| Ehtiyoj | Vosita | Qayerda |
| --- | --- | --- |
| Service worker | Workbox, `vite-plugin-pwa`, `@angular/service-worker`, Serwist (Next.js) | — |
| Optimistik UI | Signal store'da qo'lda — [Angular 60-bob](../angular/60-signal-xizmatlar.md); `useOptimistic` — [Next.js 23-bob](../nextjs/23-optimistik.md); TanStack Query `onMutate` — [React 32-bob](../react/32-tanstack-query.md) | — |
| Lokal baza | IndexedDB (Dexie), SQLite WASM (OPFS) | — |
| Sinxron | Background Sync API (Chromium), o'z outbox'ingiz | — |
| Hamkorlikda tahrirlash | Yjs, Automerge | — |

iOS Safari'da Background Sync yo'q va saqlash joyi cheklangan (ilova uzoq ishlatilmasa ma'lumot tozalanishi mumkin) — offline yozish uchun ilova ochilganda sinxronlash shart.

## Trade-off

| Daraja | Yutuq | Narx |
| --- | --- | --- |
| Online-only | Oddiy, ma'lumot doim yangi | Sekin tarmoqda yomon UX, offline yo'q |
| Optimistik UI | Tez his | Qaytarish mantiqi |
| Offline o'qish | Ishonchli o'qish | Kesh strategiyasi, yangilanish oqimi, eskirgan ma'lumot |
| Offline yozish | Har qanday sharoitda ishlaydi | Konfliktlar, sinxron, lokal baza migratsiyalari — eng qimmat |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `navigator.onLine` ga ishonish | Wi-Fi bor, internet yo'q — `true` | Haqiqiy so'rov bilan tekshirish |
| Hamma narsani precache | Birinchi o'rnatish og'ir, xotira | Qobiq precache, kontent — talab bo'yicha |
| Yangi service worker sahifani o'zi qayta yuklaydi | Kiritilgan ma'lumot yo'qoladi | "Yangilash" taklifi |
| Offline yozishda idempotentlik yo'q | Takror yuborishda ikki marta yoziladi | Har amalga ID |
| Konfliktda jim last-write-wins | Ma'lumot yo'qoladi | Ongli strategiya |
| To'lovni optimistik ko'rsatish | "To'landi" — aslida yo'q | Server tasdig'i |

## Amaliyot

1. Ilovangizdagi 3 ta amal uchun: optimistik bo'lishi mumkinmi? Qaytarish qanday bo'ladi?
2. DevTools → Network → Offline: ilova nima ko'rsatadi? Foydalanuvchiga tushunarlimi?
3. Service worker qo'shing: qobiq precache, kontent CacheFirst, yangilanish — prompt.
4. Offline yozish kerak bo'lsa — konflikt strategiyasini domen qoidasi sifatida yozing.

## Manbalar

- web.dev — *Learn PWA* <https://web.dev/learn/pwa/>
- Workbox — *Caching strategies* <https://developer.chrome.com/docs/workbox/caching-strategies-overview>
- Martin Kleppmann va boshq. — *Local-first software* <https://www.inkandswitch.com/local-first/>

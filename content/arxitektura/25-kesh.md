# 25 — Kesh strategiyalari

[← Oldingi: Tranzaksiya va konkurentlik](24-tranzaksiya.md) · [Mundarija](README.md) · [Keyingi: Navbat va fon ishlari →](26-navbat.md)

## Tushuncha

Kesh — qimmat natijani (DB so'rovi, hisob-kitob, tashqi API) vaqtincha tez joyda saqlash. Phil Karlton hazili: *"Informatikada ikkita qiyin narsa bor: kesh invalidatsiyasi va nom berish."*

Kesh qatlamlari — foydalanuvchidan DB'gacha:

```text
Brauzer keshi → CDN → Reverse proxy (Varnish/nginx) → Ilova keshi (Redis) → DB buffer/kesh
   HTTP headers     edge        to'liq javob            ob'ekt/fragment       DB o'zi
```

Frontend va HTTP keshi — 65-bob (kesh kelishuvi). Bu bob — **backend ilova keshi**.

## Nega shunday

Kesh tezlik beradi, lekin evaziga **izchillikni** oladi (2-bob): keshdagi qiymat haqiqiy qiymatdan orqada qolishi mumkin. Har kesh qarori — "qancha eskirish qabul qilinadi?" savoliga javob.

## Psevdokod: asosiy naqshlar

```text
// Cache-aside (lazy loading) — eng keng tarqalgan
function getProduct(id):
    v = cache.get("product:v1:" + id)
    if v: return v
    v = db.find(id)
    cache.set("product:v1:" + id, v, ttl = 10 min)
    return v

on ProductUpdated(id): cache.delete("product:v1:" + id)     // invalidatsiya
```

```text
// Write-through — yozishda keshni ham yangilash
function updateProduct(id, data):
    db.update(id, data)
    cache.set("product:v1:" + id, db.find(id))
// Kesh doim "issiq", lekin yozish sekinroq va har yozuv joyi buni qilishi shart
```

```text
// Write-behind — keshga yozish, DB'ga keyinroq (to'plab)
// Tez, lekin kesh yiqilsa — ma'lumot yo'qolishi mumkin. Faqat yo'qolishi mumkin bo'lgan ma'lumot uchun (hisoblagichlar)
```

| Naqsh | O'qish | Yozish | Xavf |
| --- | --- | --- | --- |
| Cache-aside | Birinchisi sekin | Oddiy + invalidatsiya | Eskirgan qiymat (invalidatsiya unutilsa) |
| Write-through | Doim tez | Sekinroq | Barcha yozuv yo'llari qamrab olinishi shart |
| Write-behind | Tez | Eng tez | Ma'lumot yo'qolishi |

## Psevdokod: invalidatsiya strategiyalari

```text
1. TTL — vaqt o'tsa eskiradi                      oddiy, lekin TTL davomida eski
2. Hodisa bo'yicha o'chirish                       aniq, lekin har o'zgarish joyi hodisa chiqarishi kerak
3. Versiyali kalit: "product:{id}:{updated_at}"    eski kalit o'z-o'zidan ishlatilmaydi, o'chirish shart emas
4. Teglar: cache.tags(["product:42", "category:7"]).invalidate()   bog'liq yozuvlarni guruhlab o'chirish
```

Amalda — **TTL + hodisa**: hodisa asosiy mexanizm, TTL — hodisa yo'qolsa ham abadiy eski qolmaslik uchun "xavfsizlik to'ri".

## Psevdokod: kesh bo'roni (stampede)

```text
Mashhur kalit TTL bilan eskirdi → 1000 ta so'rov bir vaqtda keshda topmadi → 1000 ta DB so'rov → DB yiqiladi

Himoya:
a) Qulf bilan qayta hisoblash — faqat bittasi hisoblaydi, qolganlari kutadi yoki eski qiymatni oladi
   if not cache.get(k):
       if lock.acquire(k):  v = compute(); cache.set(k, v); lock.release(k)
       else: return staleValue or wait
b) Stale-while-revalidate — eskirgan qiymatni qaytarib, fonda yangilash
c) TTL'ga tasodifiy jitter — ko'p kalit bir vaqtda eskirmasin
d) Oldindan isitish (warm-up) — deploy/aksiya oldidan
```

## Psevdokod: nimani keshlash kerak emas

```text
❌ Foydalanuvchiga xos ma'lumotni umumiy kalit bilan ("cart" — kimning?)
❌ Ruxsatga bog'liq javobni ruxsatsiz kalit bilan (admin ko'radigan narx oddiy foydalanuvchiga)
❌ Arzon so'rovni (indeksli PK so'rovi 1 ms) — kesh qatlami murakkabligi arzimaydi
❌ Tez-tez o'zgaradigan, qat'iy izchil bo'lishi kerak narsani (balans, qoldiq checkout paytida)
```

Kalitda **barcha** o'zgaruvchilar bo'lsin: `price:{productId}:{currency}:{customerGroup}:{locale}`.

## Framework'larda

| Qatlam | Backend | Frontend |
| --- | --- | --- |
| Ilova keshi | Symfony Cache (teglar, stampede himoyasi — probabilistik erta qayta hisoblash) — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md); Laravel `Cache::remember`, `Cache::flexible` (stale-while-revalidate), teglar — [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md) | — |
| HTTP kesh | Symfony HttpCache, `Cache-Control` sarlavhalari | Brauzer, CDN (65-bob) |
| Server render keshi | — | Next.js kesh qatlamlari va revalidatsiya — [Next.js 18](../nextjs/18-kesh.md), [19-bob](../nextjs/19-revalidatsiya.md); Angular transfer cache — [Angular 62-bob](../angular/62-ssr-asoslari.md) |
| Klient so'rov keshi | — | TanStack Query — [React 32-bob](../react/32-tanstack-query.md); Pinia'da qo'lda — [Vue 43-bob](../vue/43-pinia-chuqur.md) |

Next.js'ning kesh qatlamlari (so'rov, ma'lumot, to'liq marshrut, router keshi) — "invalidatsiya qiyin" iborasining frontend'dagi eng yaqqol misoli; u yerda ham qoida bir xil: har kesh — "qancha eskirish qabul qilinadi" qarori.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Keshsiz | Doim yangi, oddiy | DB yuki, sekinroq |
| Qisqa TTL | Kam eskirish | Kam foyda (tez-tez hisoblanadi) |
| Uzoq TTL + hodisa invalidatsiyasi | Katta foyda | Hodisa yo'qolsa — uzoq eski qiymat |
| Ko'p qatlamli kesh | Maksimal tezlik | "Qaysi qatlam eski?" — debug qiyin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| O'lchovsiz kesh | Murakkablik, foyda noma'lum | Avval profil, keyin kesh |
| Kalitda foydalanuvchi/til/valyuta yo'q | Boshqa foydalanuvchi ma'lumotini ko'rish | Barcha o'zgaruvchilar kalitda |
| Faqat TTL, invalidatsiyasiz | Narx o'zgargandan keyin 1 soat eski | Hodisa + TTL |
| Stampede himoyasi yo'q | Mashhur kalit eskirganda DB yiqiladi | Qulf / SWR / jitter |
| Kesh — yagona ma'lumot manbai | Redis tozalansa — ma'lumot yo'q | Kesh — faqat nusxa |
| Kalit versiyasiz | Ma'lumot shakli o'zgarsa — eski format keshdan | Kalitda versiya (`v2`) |

## Amaliyot

1. Keshlangan 5 ta narsani ro'yxatlang: har biri uchun "qancha eskirish qabul qilinadi?" — biznes javobi bormi?
2. Bitta kesh kaliti uchun invalidatsiya hodisasini qo'shing va TTL'ni xavfsizlik to'ri qiling.
3. Eng mashhur kalit uchun stampede himoyasini qo'shing.
4. Kalitlaringizni tekshiring: foydalanuvchi/til/ruxsatga bog'liq javob umumiy kalit bilan saqlanmayaptimi?

## Manbalar

- Martin Kleppmann — *Designing Data-Intensive Applications*, 11-bob (derived data)
- AWS — *Caching Best Practices* <https://aws.amazon.com/caching/best-practices/>
- RFC 5861 — *stale-while-revalidate* <https://www.rfc-editor.org/rfc/rfc5861>

# 78 — Unumdorlik arxitekturasi

[← Oldingi: API xavfsizligi](77-api-xavfsizligi.md) · [Mundarija](README.md) · [Keyingi: Ishonchlilik →](79-ishonchlilik.md)

## Tushuncha

Unumdorlik — "tez kod yozish" emas, **o'lchash → maqsad → bottleneck → tuzatish → qayta o'lchash** sikli. Frontend tomoni (Core Web Vitals, bundle byudjeti) 47-bobda; bu bob — butun tizim: backend, DB, tarmoq va ular orasidagi bog'lanish.

Asosiy o'lchovlar:

| O'lchov | Ma'no |
| --- | --- |
| **Latency** (kechikish) | Bitta so'rov qancha vaqt oladi — p50 / p95 / p99 |
| **Throughput** (o'tkazuvchanlik) | Vaqt birligida nechta so'rov |
| **Saturation** (to'yinish) | Resurs qanchalik band, navbat bormi |
| **Tail latency** | Eng sekin 1% — ko'p chaqiruvli sahifada aynan u seziladi |

## Nega shunday

Intuitsiya unumdorlikda deyarli doim adashadi: "framework sekin" deymiz — aslida N+1 so'rov; "PHP sekin" — aslida indeks yo'q; "server kuchsiz" — aslida tashqi API'ni sinxron kutamiz. Knuth'ning "erta optimizatsiya" ogohlantirishi — o'lchamasdan optimizatsiya haqida; lekin **arxitektura qarorlari** (sinxron vs navbat, kesh qatlami, ma'lumot modeli) keyin o'zgartirish qimmat — ularni erta o'ylash kerak.

## Psevdokod: byudjet

```text
Maqsad (SLO bilan bog'liq, 79-bob):
  GET /products     p95 < 200ms
  POST /checkout    p95 < 800ms
  sahifa LCP        p75 < 2.5s (47-bob)

Byudjetni taqsimlash (checkout, 800ms):
  BFF                       30ms
  Ordering (DB 3 so'rov)   150ms
  Inventory                 80ms
  Payment provayder        400ms   ← tashqi, nazoratsiz
  zaxira                   140ms

Har yangi sinxron chaqiruv — byudjetdan ulush oladi. Joy yo'q → asinxron (26-bob) yoki parallel.
```

## Psevdokod: tipik bottleneck'lar

```text
1. N+1 so'rov
   orders = query("SELECT * FROM orders LIMIT 50")
   for o in orders: o.customer = query("... WHERE id = ?", o.customerId)   // 51 so'rov
   → eager loading / JOIN / batch (DataLoader, 56-bob)

2. Indeks yo'q        → EXPLAIN, sekin so'rovlar logi
3. Ketma-ket tashqi chaqiruvlar
   a = callA(); b = callB(); c = callC()     // 300 + 200 + 250 = 750ms
   → mustaqil bo'lsa parallel: max(300, 200, 250) = 300ms
4. Sinxron og'ir ish   → navbatga (email, PDF, rasm qayta ishlash)
5. Kesh yo'q / noto'g'ri invalidatsiya (25-bob)
6. Ulanishlar havzasi  → DB pool tugaydi, so'rovlar kutadi (saturation)
7. Katta javoblar      → pagination, maydon tanlash, siqish
```

## Psevdokod: o'lchash usullari

```text
Production:     RED metrikalari, trace'lar (75-bob) — qaysi span uzun?
Profiler:       bitta so'rov ichida — qaysi funksiya, nechta SQL (Symfony Profiler, Blackfire, Telescope, Xdebug)
Yuk testi:      k6 / Gatling / Locust
  scenario: 200 virtual foydalanuvchi, 10 daqiqa, real oqim (login → katalog → savat → checkout)
  kuzatish: p95 qachon byudjetdan oshadi? qaysi resurs birinchi to'yinadi?
  turlari:  load (kutilgan), stress (sinish nuqtasi), soak (uzoq — xotira oqishi), spike (keskin o'sish)

Qoida: yuk testi — production'ga o'xshash ma'lumot hajmida. 100 qatorli DB'da hamma narsa tez.
```

## Psevdokod: Amdahl va masshtablash

```text
So'rov vaqti: 60% DB, 30% tashqi API, 10% kod
  kodni 2x tezlashtirish → umumiy 5% yutuq
  DB so'rovini indeks bilan 10x → umumiy 54% yutuq
→ Optimizatsiyani eng katta ulushdan boshlang

Masshtablash:
  vertikal (kuchliroq server) — oddiy, chegarasi bor
  gorizontal (ko'proq instansiya) — stateless servis talab qiladi (sessiya, fayl — tashqarida)
  DB — odatda oxirgi bottleneck: read replica, kesh, keyin bo'lish (sharding — oxirgi chora)
```

## Framework'larda

| Mavzu | Qayerda |
| --- | --- |
| Backend optimizatsiya, OPcache, profiler | [Symfony 33-bob](../symfony/33-unumdorlik.md), [Laravel 32-bob](../laravel/32-optimallashtirish-va-deploy.md) |
| N+1 va eager loading | [Laravel 17-bob](../laravel/17-eloquent-aloqalar.md), [Symfony 18-bob](../symfony/18-aloqalar.md) |
| Frontend unumdorligi | [Angular 74](../angular/74-unumdorlik.md), [React 41](../react/41-unumdorlik.md), [Vue 62](../vue/62-unumdorlik.md), [Next.js 43-bob](../nextjs/43-unumdorlik.md) |
| Kesh | [Arxitektura 25-bob](25-kesh.md), [Next.js 18-bob](../nextjs/18-kesh.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Kesh qo'shish | Katta tezlik | Eskirgan ma'lumot, invalidatsiya murakkabligi |
| Asinxron (navbat) | Javob tez | Eventual consistency, UI holatlari (51-bob) |
| Denormalizatsiya | Kam JOIN | Yozishda murakkablik, nomuvofiqlik xavfi |
| Gorizontal masshtab | Cheksizga yaqin o'sish | Stateless talab, narx, ops |
| Mikro-optimizatsiya | Biroz tezroq | O'qilishi qiyin kod — kam yutuq uchun |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| O'lchamasdan optimizatsiya | Noto'g'ri joy tuzatiladi | Profiler, trace |
| O'rtacha vaqtga qarash | Sekin dum yashirinadi | p95/p99 |
| Kichik ma'lumotda test | Production'da sinadi | Real hajm |
| Hamma narsani keshga | Xatolar va eskirish | Avval so'rovni tuzating, keyin kesh |
| Tashqi API'ni sinxron kutish | Byudjet buziladi | Timeout, asinxron, kesh |
| Byudjet yo'q | Asta-sekin sekinlashadi | CI'da yuk testi, SLO |

## Amaliyot

1. Eng muhim 3 endpoint uchun p95 maqsadini yozing va hozirgi qiymatni o'lchang.
2. Bitta sekin sahifa trace'ini oching: vaqtning eng katta ulushi qayerda?
3. k6 bilan real oqim bo'yicha yuk testi yozing; qaysi resurs birinchi to'yinadi?
4. Sekin so'rovlar logini yoqing va top-5 so'rovga `EXPLAIN` qiling.

## Manbalar

- Brendan Gregg — *Systems Performance*; USE metodi <https://www.brendangregg.com/usemethod.html>
- Grafana k6 hujjatlari <https://grafana.com/docs/k6/>
- Martin Kleppmann — *Designing Data-Intensive Applications*, 1-bob

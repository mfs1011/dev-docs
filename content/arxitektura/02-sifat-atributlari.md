# 02 — Sifat atributlari va trade-off

[← Oldingi: Arxitektura nima va nega kerak](01-arxitektura-nima.md) · [Mundarija](README.md) · [Keyingi: Talabdan qarorga →](03-talabdan-qarorga.md)

## Tushuncha

Funksional talab — tizim **nima** qiladi ("foydalanuvchi buyurtma bera oladi"). Sifat atributi — **qanchalik yaxshi** qiladi ("buyurtma 300 ms ichida, soniyasiga 500 ta, 99,9% vaqt ishlaydi").

Arxitekturani asosan sifat atributlari belgilaydi: bir xil funksiyani o'nlab arxitektura bilan yozish mumkin, lekin "soniyasiga 10 000 so'rov" yoki "internet yo'qda ham ishlasin" talabi variantlarni keskin qisqartiradi.

Asosiy atributlar:

| Atribut | Savol | O'lchov misoli |
| --- | --- | --- |
| **Unumdorlik** | Qanchalik tez? | p95 javob vaqti ≤ 300 ms; LCP ≤ 2.5 s |
| **Masshtablanuvchanlik** | Yuk oshsa? | 10× trafik — arxitekturani o'zgartirmasdan |
| **Mavjudlik** (availability) | Qancha vaqt ishlaydi? | 99,9% (oyiga ~43 daqiqa to'xtash) |
| **Ishonchlilik** | Xato bo'lsa nima? | Ma'lumot yo'qolmaydi; qisman ishlaydi |
| **Xavfsizlik** | Kim nima qila oladi? | OWASP ASVS L2 |
| **O'zgaruvchanlik** (modifiability) | Yangi feature qancha turadi? | O'rtacha feature ≤ 3 kun |
| **Testlanuvchanlik** | Qanchalik oson tekshiriladi? | Biznes qoidalari DB'siz testlanadi |
| **Kuzatuvchanlik** | Muammoni topa olamizmi? | Har so'rov trace ID bilan |
| **Erishimlilik** | Hamma foydalana oladimi? | WCAG 2.2 AA |
| **Narx** | Qancha turadi? | Oyiga ≤ $500 infratuzilma |

## Nega shunday

Atributlar **bir-biriga qarshi** ishlaydi. Hammasini maksimal qilish mumkin emas — shu uchun arxitektura trade-off san'ati:

| Bittasini oshirsangiz | Ko'pincha tushadi | Nega |
| --- | --- | --- |
| Xavfsizlik (ko'p tekshiruv) | Unumdorlik, qulaylik | Har qatlam vaqt oladi |
| Unumdorlik (kesh, denormalizatsiya) | Izchillik, o'zgaruvchanlik | Ma'lumot bir necha joyda |
| Mavjudlik (ko'p nusxa, regionlar) | Izchillik, narx | CAP: tarmoq bo'linsa — tanlash kerak |
| Moslashuvchanlik (abstraksiyalar) | Soddalik, unumdorlik | Qatlam ko'p — tushunish qiyin |
| Tez chiqarish (time-to-market) | Barcha sifat atributlari | Qarorlar shoshilinch |
| Masshtablanuvchanlik (servislar) | Soddalik, narx, debug | Taqsimlangan tizim murakkabligi |

"Tez, sifatli, arzon — ikkitasini tanlang" — arxitektura darajasida ham to'g'ri.

## Psevdokod: bitta talab, uch qaror

Talab: "Mahsulot sahifasi tez ochilsin".

```text
// 1. Unumdorlikni ustun qo'ydik — kesh
function getProduct(id):
    cached = cache.get("product:" + id)
    if cached: return cached                 // 2 ms
    product = db.find(id)                    // 40 ms
    cache.set("product:" + id, product, ttl = 10 min)
    return product
// Narx: narx o'zgarsa, 10 daqiqagacha eski narx ko'rinadi (izchillik ↓)
```

```text
// 2. Izchillikni ustun qo'ydik — keshsiz, lekin indeks
function getProduct(id):
    return db.find(id)                       // indeks bilan 40 ms
// Narx: yuk 10× oshsa, DB bardosh bermasligi mumkin (masshtab ↓)
```

```text
// 3. Ikkalasi — kesh + invalidatsiya
on ProductPriceChanged(e): cache.delete("product:" + e.id)
// Narx: murakkablik ↑ — har yozuv joyi hodisa chiqarishi shart; unutilsa — eski ma'lumot
```

Qaysi biri to'g'ri? **Biznes javob beradi:** "10 daqiqa eski narx" — onlayn do'konda qabul qilinmas (noto'g'ri narxda sotish), yangiliklar saytida — mutlaqo normal.

## Framework'larda

Framework'lar ba'zi atributlarni **sukut bo'yicha** tanlaydi — qaysilarini bilish muhim:

| Framework sukuti | Qaysi atribut foydasiga | Qayerda o'qish |
| --- | --- | --- |
| Angular 22: zoneless + OnPush sukut | Unumdorlik | [Angular 23-bob](../angular/23-zoneless.md) |
| Angular SSR: `allowedHosts` bo'lmasa har so'rov 400 | Xavfsizlik (qulaylik hisobiga) | [Angular 62-bob](../angular/62-ssr-asoslari.md) |
| Next.js: server komponentlar sukut | Unumdorlik (klient JS ↓) | [Next.js 16-bob](../nextjs/16-server-components.md) |
| Next.js kesh qatlamlari | Unumdorlik (izchillik murakkablashadi) | [Next.js 18-bob](../nextjs/18-kesh.md) |
| Symfony/Laravel: CSRF himoyasi sukut | Xavfsizlik | [Symfony 22-bob](../symfony/22-xavfsizlik.md) |
| Vue reaktivligi — proxy, avtomatik kuzatish | Dasturchi tezligi | [Vue 7-bob](../vue/07-reaktivlik-mental-modeli.md) |

Framework tanlovi o'zi — sifat atributlari bo'yicha qaror: katta jamoa va qat'iy konvensiyalar (Angular, Symfony) — o'zgaruvchanlik va bir xillik; tez prototip (Laravel, Vue) — time-to-market.

## Trade-off

Atributlarni **ustuvorlik bo'yicha tartiblash** — asosiy vosita. Loyiha boshida jamoa va biznes bilan birga:

```text
Loyiha: Onlayn do'kon (1-yil)
1. Xavfsizlik (to'lovlar)          — muzokara qilinmaydi
2. Ishonchlilik (buyurtma yo'qolmasin)
3. O'zgaruvchanlik (bozorni sinaymiz, tez-tez o'zgaradi)
4. Unumdorlik (yetarli: p95 ≤ 500 ms)
5. Masshtab (hozircha 100 buyurtma/kun — keyinroq)
```

Ikki atribut ziddiyatga kelsa — ro'yxat qaror beradi. "5. Masshtab" ni ko'rgan dasturchi mikroservislar taklif qilmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Tez bo'lsin" — raqamsiz | Tekshirib bo'lmaydi, bahs cheksiz | "p95 ≤ 300 ms, 500 RPS da" |
| Hamma atribut "yuqori" | Ustuvorlik yo'q — ziddiyatda qaror yo'q | Tartiblangan ro'yxat |
| Faqat funksional talablar | Arxitekturani aynan sifat belgilaydi | Nofunksional talablarni birinchi yozish |
| Masshtabni kelajak uchun "har ehtimolga" | Hozirgi murakkablik, keraksiz narx | Hozirgi yuk × 10 ga loyihalash |
| Narxni atribut deb hisoblamaslik | Bulut hisobi kutilmaganda | Narx ham talab |

## Amaliyot

1. Loyihangiz uchun 10 atributni ustuvorlik bo'yicha tartiblang; jamoadoshingiz alohida tartiblasin — farqlarni muhokama qiling.
2. Eng muhim 3 tasiga o'lchanadigan raqam yozing.
3. So'nggi arxitektura bahsini eslang: qaysi ikki atribut to'qnashgan edi?
4. Framework'ingizning 3 ta sukut sozlamasini toping va qaysi atribut foydasiga ekanini yozing.

## Manbalar

- ISO/IEC 25010 — sifat modeli
- Len Bass, Paul Clements, Rick Kazman — *Software Architecture in Practice*, 4–14-boblar (sifat atributlari)
- Mark Richards, Neal Ford — *Fundamentals of Software Architecture*, 4-bob

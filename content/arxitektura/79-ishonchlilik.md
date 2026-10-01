# 79 — Ishonchlilik

[← Oldingi: Unumdorlik arxitekturasi](78-unumdorlik-arxitekturasi.md) · [Mundarija](README.md) · [Keyingi: Deploy arxitekturasi →](80-deploy-arxitekturasi.md)

## Tushuncha

Ishonchlilik (reliability) — tizim **qisman buzilganda ham** foydalanuvchiga kerakli darajada xizmat qilishi. Taqsimlangan tizimda biror narsa doim buzilgan: tarmoq uziladi, servis sekinlashadi, tashqi API javob bermaydi. Savol "buziladimi?" emas, "buzilganda nima bo'ladi?".

Asosiy atamalar (Google SRE):

| Atama | Ma'no | Misol |
| --- | --- | --- |
| **SLI** | Xizmat darajasi ko'rsatkichi — nimani o'lchaymiz | Muvaffaqiyatli checkout'lar ulushi |
| **SLO** | Maqsad | 30 kunda 99.9% checkout muvaffaqiyatli, p95 < 800ms |
| **SLA** | Mijoz bilan shartnoma (jarima bilan) | 99.5%, aks holda pul qaytariladi |
| **Xato byudjeti** | 100% − SLO | 99.9% → oyiga ~43 daqiqa "ruxsat etilgan" buzilish |

## Nega shunday

100% ishonchlilik — imkonsiz va keraksiz maqsad: har qo'shimcha "to'qqiz" narxi eksponensial oshadi, foydalanuvchi esa o'z internetidan 99.9% dan yaxshisini sezmaydi. Xato byudjeti — muhandislik va mahsulot o'rtasidagi kelishuv: byudjet bor — tez reliz qilamiz; tugadi — barqarorlikka fokus.

## Psevdokod: timeout va deadline

```text
// ❌ Timeout yo'q: tashqi API osilib qoldi → thread/worker'lar band → butun servis to'xtaydi
response = http.get(paymentUrl)

// ✅ Har tashqi chaqiruvda timeout
response = http.get(paymentUrl, { connectTimeout: 1s, timeout: 3s })

// ✅ Deadline zanjir bo'ylab uzatiladi
checkout (byudjet 5s) → inventory (qolgan 4.7s) → payment (qolgan 3.9s)
  qolgan vaqt < kerakli → darhol rad, behuda ish qilmaslik
Qoida: ichki chaqiruv timeout'i < tashqi chaqiruvchining timeout'i
```

## Psevdokod: retry — to'g'ri qilish

```text
retry(fn, { maxAttempts: 3, base: 200ms, max: 2s }):
  for attempt in 1..maxAttempts:
    try: return fn()
    catch err:
      if not retryable(err): throw         // 400, 401, 403, 404, 422 — qayta urinish befoyda
      if attempt == maxAttempts: throw
      sleep(random(0, min(max, base * 2^attempt)))   // eksponensial backoff + jitter

retryable: tarmoq xatosi, timeout, 502/503/504, 429 (Retry-After sarlavhasiga qarab)

SHARTLAR:
  - faqat idempotent amallar yoki idempotency key bilan (70-bob)
  - retry faqat BIR qatlamda (aks holda 3×3×3 = 27 marta — "retry bo'roni")
  - retry byudjeti: umumiy so'rovlarning ≤10% qayta urinish
```

## Psevdokod: circuit breaker

```text
Holatlar: CLOSED → (xatolar > 50% 20 so'rovda) → OPEN → (30s) → HALF_OPEN → (sinov so'rovi)
                                                                        ├ muvaffaqiyat → CLOSED
                                                                        └ xato        → OPEN

call(fn):
  if state == OPEN: return fallback()      // darhol, tarmoqqa bormasdan
  try: result = fn(); recordSuccess(); return result
  catch: recordFailure(); return fallback()

fallback variantlari:
  - keshdagi oxirgi qiymat (tavsiyalar, kurs)
  - degradatsiya: "Tavsiyalar hozir mavjud emas" — sahifaning qolgani ishlaydi
  - navbatga qo'yish: "To'lov tasdiqlanmoqda" (51-bob)
```

Maqsad: kasal servisni "o'ldirmaslik" va o'zimiz ham u bilan birga yiqilmaslik.

## Psevdokod: bulkhead va yuk tashlash

```text
Bulkhead (kema to'siqlari): resurslarni ajratish
  payment uchun HTTP pool — 20 ulanish; recommendations uchun — 5
  → recommendations osilsa ham, payment uchun ulanish qoladi
  navbatlar: muhim (to'lov) va fon (eksport) — alohida worker'lar

Yuk tashlash (load shedding): to'yinganda — kamroq muhimini rad etish
  if inflight > limit: return 503 Retry-After   // hammani sekinlashtirish o'rniga ba'zilarni rad etish
  ustuvorlik: checkout > katalog > analitika
```

## Psevdokod: degradatsiya rejasi

```text
Har bog'liqlik uchun jadval:
  | Bog'liqlik      | Buzilsa                        | Foydalanuvchi ko'radi          |
  | Recommendations | bo'sh blok                     | sahifa ishlaydi                |
  | Qidiruv (ES)    | DB'dan oddiy LIKE qidiruv      | sekinroq, kamroq aniq          |
  | Payment         | buyurtma "kutilmoqda", navbat  | "To'lov tez orada tasdiqlanadi"|
  | Auth provayder  | mavjud sessiyalar ishlaydi     | yangi login — xato xabari      |
Frontend ham degradatsiyaga tayyor: Error boundary, bo'lim darajasida xato (48-bob)
```

## Framework'larda

| Mavzu | Qayerda |
| --- | --- |
| Navbat retry va backoff | [Laravel 25-bob](../laravel/25-navbatlar.md) (`$tries`, `backoff`), [Symfony 26-bob](../symfony/26-messenger.md) (retry strategy) |
| HTTP timeout va retry | Symfony HttpClient `timeout` — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md); retry uchun `RetryableHttpClient` |
| Frontend retry | [TanStack Query — React 32-bob](../react/32-tanstack-query.md), [Angular 57-bob](../angular/57-http-xatolar.md), [Vue 44-bob](../vue/44-http-qatlami.md) |
| Circuit breaker | Kutubxonalar: Resilience4j (JVM), `opossum` (Node); service mesh (Istio, Linkerd) — infratuzilma darajasida |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Yuqori SLO (99.99%) | Ishonch | Narx eksponensial, reliz sekin |
| Agressiv retry | Vaqtinchalik xatolar yashiriladi | Yuklama ko'payadi, kasal servis o'ladi |
| Circuit breaker | Kaskadli buzilish to'xtaydi | Sozlash, noto'g'ri ochilish xavfi |
| Degradatsiya | Qisman ishlash | Har bog'liqlik uchun alohida yo'l, test |
| Service mesh | Kodsiz retry/mTLS | Infratuzilma murakkabligi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Timeout yo'q | Bitta sekin bog'liqlik hammani to'xtatadi | Har chaqiruvda timeout |
| Jitter'siz retry | Hamma bir vaqtda qayta uradi | Backoff + jitter |
| Har qatlamda retry | Retry bo'roni | Bitta qatlam, byudjet |
| Idempotent bo'lmagan amalni retry | Ikki marta to'lov | Idempotency key |
| SLO yo'q | "Yetarlicha ishonchli"ni hech kim bilmaydi | SLI/SLO + xato byudjeti |
| Degradatsiya test qilinmagan | Haqiqiy buzilishda ishlamaydi | Chaos testi, o'yin kunlari |

## Amaliyot

1. Eng muhim foydalanuvchi oqimi uchun SLI va SLO yozing.
2. Koddagi barcha tashqi chaqiruvlarni toping — har birida timeout bormi?
3. Bitta bog'liqlik uchun degradatsiya jadvalini to'ldiring va staging'da uni o'chirib sinab ko'ring.
4. Retry'lar qaysi qatlamlarda ekanini xaritalang — ikki qatlamda bo'lsa, bittasini olib tashlang.

## Manbalar

- Google — *Site Reliability Engineering* (SLO, xato byudjeti) <https://sre.google/books/>
- Michael Nygard — *Release It!* (circuit breaker, bulkhead)
- AWS Builders' Library — *Timeouts, retries, and backoff with jitter*

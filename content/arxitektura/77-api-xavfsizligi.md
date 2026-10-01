# 77 — API xavfsizligi

[← Oldingi: Xavfsizlik arxitekturasi](76-xavfsizlik-arxitekturasi.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik arxitekturasi →](78-unumdorlik-arxitekturasi.md)

## Tushuncha

API — tizimning eng katta hujum yuzasi: u ochiq, hujjatlangan (OpenAPI, 54-bob) va frontend'dagi har bir chaqiruv brauzer DevTools'ida ko'rinadi. Hujumchi UI'ni chetlab, to'g'ridan-to'g'ri API'ga istalgan so'rovni yuboradi.

**OWASP API Security Top 10 (2023)** — eng ko'p uchraydigan zaifliklar:

| # | Zaiflik | Qisqacha |
| --- | --- | --- |
| API1 | **BOLA** — obyekt darajasida avtorizatsiya buzilishi | `/orders/124` — begona buyurtma ochiladi |
| API2 | Autentifikatsiya buzilishi | Zaif login, token tekshirilmaydi, brute force |
| API3 | **Obyekt xususiyati darajasida** avtorizatsiya | Ortiqcha maydon qaytariladi / ommaviy tayinlash |
| API4 | **Cheklanmagan resurs iste'moli** | `?limit=1000000`, katta fayl, qimmat so'rov |
| API5 | Funksiya darajasida avtorizatsiya | Oddiy foydalanuvchi `/admin/...` chaqiradi |
| API6 | Nozik biznes oqimlariga cheksiz kirish | Bot chiptalarni sotib oladi, kupon spam |
| API7 | SSRF | API foydalanuvchi bergan URL'ga server nomidan boradi |
| API8 | Noto'g'ri xavfsizlik konfiguratsiyasi | CORS `*`, debug yoqiq, stack trace javobda |
| API9 | Inventar boshqaruvi yo'qligi | Unutilgan `/v1`, staging API ochiq |
| API10 | Uchinchi tomon API'lariga ko'r-ko'rona ishonish | Tashqi javob tekshirilmaydi |

## Nega shunday

Bu ro'yxatdagi deyarli hammasi — "frontend buni ko'rsatmaydi, demak xavfsiz" degan xato fikrning natijasi. Tugma yashirilgan — lekin endpoint ochiq. Maydon formada yo'q — lekin API uni qabul qiladi. Har bir himoya **serverda** bo'lishi shart (62-bob).

## Psevdokod: BOLA — eng ko'p uchraydigan

```text
// ❌ Zaif: faqat autentifikatsiya
GET /orders/{id}
  order = repo.find(id)              // ID'ni o'zgartirib, begona buyurtmani ko'rish mumkin
  return order

// ✅ To'g'ri: har obyektga egalik tekshiruvi
GET /orders/{id}
  order = repo.findForUser(id, currentUser.id)   // so'rov darajasida filtr
     ?? return 404                               // 403 emas — mavjudligini ham oshkor qilmaslik
  return order

Ko'p ijarachilikda (33-bob): har so'rov tenantId bilan cheklangan — global scope / repository filtri
UUID ishlatish yordam beradi (taxmin qilish qiyin), lekin AVTORIZATSIYA O'RNINI BOSMAYDI
```

## Psevdokod: ommaviy tayinlash va ortiqcha ma'lumot

```text
// ❌ Ommaviy tayinlash
PATCH /users/me   body: { name: "Ali", role: "admin", balance: 999999 }
  user.fill(body)                    // role va balance ham yozildi!

// ✅ Ruxsat etilgan maydonlar ro'yxati (allowlist)
  input = parse(UpdateProfileInput, body)   // faqat { name, avatar }; qolganlari — rad yoki tashlanadi
  user.rename(input.name)

// ❌ Ortiqcha javob
  return user                        // passwordHash, internalNotes, email'lar... frontend "ko'rsatmaydi"
// ✅ Javob DTO
  return UserPublicView.from(user)   // faqat kerakli maydonlar (53-bob: shartnoma)
```

Qoida: **entity hech qachon to'g'ridan-to'g'ri kiritma ham, javob ham bo'lmaydi** — kiritma DTO va javob DTO (12, 68-boblar).

## Psevdokod: resurs iste'moli

```text
Har endpoint uchun yuqori chegaralar:
  pagination:   limit max 100 (66-bob)
  body hajmi:   1 MB JSON, fayllar alohida (63-bob)
  GraphQL:      chuqurlik / murakkablik limiti (56-bob)
  vaqt:         so'rov timeout'i, DB statement timeout
  tezlik:       rate limit — foydalanuvchi, IP, API kalit bo'yicha (30-bob)
  qimmat amallar: eksport, hisobot, AI chaqiruvi — kvota + navbat (26-bob)

Biznes oqimlari (API6): ro'yxatdan o'tish, SMS kod, kupon — alohida qat'iy limitlar + bot himoyasi
```

## Psevdokod: SSRF

```text
// Foydalanuvchi URL beradi: "avatarni shu manzildan yukla", webhook URL, link preview
fetch(userUrl)   // ❌ http://169.254.169.254/... (bulut metadata), http://localhost:6379 (Redis)

✅ allowlist (faqat ma'lum domenlar) yoki:
  - faqat https
  - DNS'ni hal qilish → IP ichki/maxsus diapazonda bo'lsa rad (redirect'dan keyin ham qayta tekshirish)
  - alohida tarmoq/proxy orqali chiqish
```

## Framework'larda

| Mavzu | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| BOLA | Voter'lar — [Symfony 23-bob](../symfony/23-avtorizatsiya.md) | Policy'lar — [Laravel 22-bob](../laravel/22-avtorizatsiya.md) | Faqat UX: tugmani yashirish |
| Ommaviy tayinlash | DTO + `#[MapRequestPayload]` — [Symfony 20-bob](../symfony/20-serializer-va-dto.md) | `$fillable`, `$request->validated()` — [Laravel 16](../laravel/16-eloquent-asoslari.md), [13-bob](../laravel/13-validatsiya.md) | — |
| Ortiqcha javob | Serializer groups — [Symfony 20-bob](../symfony/20-serializer-va-dto.md) | API Resource — [Laravel 20-bob](../laravel/20-api-resurslar.md) | Next.js taint API — [Next.js 45-bob](../nextjs/45-xavfsizlik.md) |
| Rate limit | RateLimiter — [Symfony 38-bob](../symfony/38-api-pro.md) | `throttle` — [Laravel 10-bob](../laravel/10-middleware.md) | — |

Next.js va SSR framework'larda alohida xavf: server komponent yoki server action — **ommaviy endpoint**. Server action'ni "faqat mening formam chaqiradi" deb o'ylash xato — uni har kim chaqira oladi, ichida auth va avtorizatsiya shart.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Avtorizatsiya repository/so'rov darajasida | Unutib bo'lmaydi | Ma'muriy holatlar uchun aniq istisno kerak |
| Har endpoint'da qo'lda tekshiruv | Moslashuvchan | Bitta unutish — BOLA |
| Qat'iy kiritma (noma'lum maydon — 400) | Xatolar erta | Klientlar evolyutsiyasi qiyinroq (58-bob) |
| 404 o'rniga 403 | Aniq xabar | Obyekt mavjudligi oshkor bo'ladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat autentifikatsiya, egalik tekshiruvi yo'q | BOLA | Har obyektga avtorizatsiya |
| `user.fill(request.all())` | Ommaviy tayinlash | Allowlist DTO |
| Entity JSON'ga to'g'ridan-to'g'ri | Maxfiy maydonlar sizadi | Javob DTO |
| `limit` cheklanmagan | DoS, qimmat so'rovlar | Max limit |
| Eski `/v1` unutilgan | Yamoqsiz zaif versiya | API inventari, sunset (58-bob) |
| Testlar faqat "baxtli yo'l" | Zaifliklar topilmaydi | "Boshqa foydalanuvchi" testlari |

## Amaliyot

1. Har endpoint uchun test yozing: "foydalanuvchi B, A ning obyektini so'raydi → 404".
2. Javoblaringizni ko'rib chiqing: frontend ishlatmaydigan maydonlar bormi?
3. Hamma ro'yxat endpoint'larida `limit` maksimumi borligini tekshiring.
4. Ishlab chiqarishdagi barcha API versiyalari va hostlarining inventarini tuzing.

## Manbalar

- OWASP API Security Top 10 (2023) <https://owasp.org/API-Security/>
- OWASP — *REST Security Cheat Sheet*, *SSRF Prevention Cheat Sheet*

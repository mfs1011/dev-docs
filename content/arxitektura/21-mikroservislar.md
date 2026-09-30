# 21 — Mikroservislar: narx va foyda

[← Oldingi: Modulli monolit](20-modulli-monolit.md) · [Mundarija](README.md) · [Keyingi: Servis chegarasini topish →](22-servis-chegarasi.md)

## Tushuncha

Mikroservislar — tizimni **mustaqil deploy qilinadigan** kichik xizmatlarga bo'lish. Har servis o'z jarayonida, o'z ma'lumotlar bazasi bilan, tarmoq orqali gaplashadi.

Asosiy xususiyat — **mustaqil deploy**. Agar A servisni deploy qilish uchun B va C ni ham birga deploy qilish kerak bo'lsa — bu mikroservislar emas, **taqsimlangan monolit** (eng yomon variant: ikkalasining kamchiliklari).

## Nega shunday

Mikroservislar **tashkiliy** muammoni yechadi, texnik emas: ko'p jamoa bitta kod bazasida bir-biriga xalaqit bermasligi. Texnik foydalar (masshtab, texnologiya erkinligi) — qo'shimcha.

**Foydalar:**

| Foyda | Qachon real |
| --- | --- |
| Mustaqil deploy va reliz | Jamoalar haqiqatan mustaqil ishlaganda |
| Alohida masshtab | Bir qismning yuki boshqalardan keskin farq qilganda |
| Xato izolyatsiyasi | Timeout, circuit breaker to'g'ri qilinganda (79-bob) |
| Texnologiya erkinligi | Real ehtiyoj bo'lganda (ML — Python, real vaqt — Go) |
| Kichik kod bazalari | Yangi dasturchi tez tushunadi |

**Narxi** — "taqsimlangan hisoblashning 8 xatosi" (Peter Deutsch):

```text
Taqsimlangan tizimda NOTO'G'RI taxminlar:
1. Tarmoq ishonchli          → so'rovlar yo'qoladi, takrorlanadi
2. Kechikish nol             → har chaqiruv 1–100 ms, zanjirda qo'shiladi
3. O'tkazuvchanlik cheksiz
4. Tarmoq xavfsiz            → servislararo auth, mTLS
5. Topologiya o'zgarmaydi    → servislar ko'chadi, IP o'zgaradi
6. Bitta administrator
7. Transport narxi nol       → serializatsiya, JSON parse
8. Tarmoq bir xil
```

Monolitda funksiya chaqiruvi — mikrosekund, har doim ishlaydi. Servisda — millisekund, **ba'zan ishlamaydi**.

## Psevdokod: nima murakkablashadi

```text
// Monolitda
transaction:
    order = orders.create(...)
    inventory.reserve(order.items)      // xato bo'lsa — hammasi rollback
    payments.charge(order)

// Servislarda — bitta tranzaksiya yo'q
order = POST orders-service/orders
reserve = POST inventory-service/reservations     // muvaffaqiyatli
charge  = POST payments-service/charges           // YIQILDI
// Endi: rezervatsiyani bekor qilish kerak (kompensatsiya) — saga (27-bob)
// Va: agar bekor qilish so'rovi ham yiqilsa?
```

Qo'shimcha kerak bo'ladigan narsalar ro'yxati:

```text
Servislararo:     API shartnomalari va versiyalash (58-bob), kontrakt testlar
Ma'lumot:         har servis o'z DB — izchillik hodisalar orqali (eventual)
Ishonchlilik:     timeout, retry, circuit breaker, idempotentlik (70, 79-boblar)
Kuzatuvchanlik:   taqsimlangan trace, correlation ID (75-bob)
Infratuzilma:     servis topish, konfiguratsiya, har servis CI/CD, konteyner orkestratsiya
Lokal ishlab chiqish: 12 servisni noutbukda ko'tarish
```

## Psevdokod: qachon oqlanadi

```text
Mikroservislarga o'tish SHARTLARI (barchasi):
[ ] Modulli monolitda chegaralar vaqt sinovidan o'tgan (20-bob)
[ ] Bir nechta jamoa (odatda 3+), har biri o'z sohasiga ega
[ ] Avtomatlashtirilgan deploy, monitoring, trace — allaqachon bor
[ ] Aniq og'riq: deploy navbati, masshtab farqi, texnologiya talabi
[ ] Jamoa taqsimlangan tizim muammolari bilan ishlay oladi

Birortasi yo'q bo'lsa — hali erta.
```

Sam Newman: *"Mikroservislar — maqsad emas, vosita."* Avval "qanday muammoni yechyapmiz?" — keyin "mikroservislar eng arzon yechimmi?".

## Framework'larda

Framework'lar mikroservis uchun vositalar beradi, lekin arxitekturani emas:

| Ehtiyoj | Backend | Frontend tomondan |
| --- | --- | --- |
| Servislararo xabarlar | Symfony Messenger (AMQP), Laravel Queue — [Symfony 26](../symfony/26-messenger.md), [Laravel 25-bob](../laravel/25-navbatlar.md) | — |
| Servislararo HTTP | Symfony HttpClient (retry bilan) — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md), Laravel `Http::retry()` | — |
| Ko'p servisni bitta API'ga birlashtirish | API gateway / BFF (69-bob) | Frontend bitta BFF bilan gaplashadi, 12 servis bilan emas |
| Tashqi backend bilan ishlash | — | [Next.js 27–29-boblar](../nextjs/27-tashqi-backend-login.md) — Next.js server tomoni BFF sifatida |

Frontend uchun asosiy qoida: **brauzer mikroservislar topologiyasini bilmasligi kerak.** 5 ta servisga to'g'ridan-to'g'ri so'rov — CORS, 5 xil auth, 5 xil xato formati. Oraliqda gateway yoki BFF.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Modulli monolit | Oddiylik, tranzaksiyalar | Mustaqil deploy/masshtab yo'q |
| Bir nechta katta servis ("right-sized") | Asosiy foydalar, boshqariladigan murakkablik | Chegaralar to'g'ri bo'lishi shart |
| Ko'p mayda mikroservislar | Maksimal mustaqillik | Operatsion narx, taqsimlangan murakkablik |
| Taqsimlangan monolit | — | Ikkalasining kamchiliklari |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Birinchi kundan mikroservislar | Noto'g'ri chegaralar tarmoq bilan qotadi | Monolit → modulli → kerak bo'lsa ajratish |
| Umumiy DB servislar orasida | Taqsimlangan monolit | Har servis — o'z ma'lumoti |
| Sinxron chaqiruv zanjirlari (A→B→C→D) | Kechikish qo'shiladi, bitta yiqilsa — hammasi | Asinxron hodisalar, keshlangan ma'lumot |
| Servis = CRUD jadval ustida ("entity service") | Har use case ko'p servisni chaqiradi | Biznes imkoniyati bo'yicha (22-bob) |
| Monitoring/trace keyinga | Muammoni topib bo'lmaydi | Birinchi servisdan oldin |
| Brauzer har servisga to'g'ridan-to'g'ri | CORS, auth va format tartibsizligi | Gateway/BFF |

## Amaliyot

1. Yuqoridagi "shartlar" ro'yxatini loyihangiz uchun to'ldiring.
2. Mikroservislardan kutilgan foydani yozing — uni modulli monolit bilan olish mumkinmi?
3. Mavjud servislaringiz bo'lsa: birgalikda deploy qilinishi shart bo'lganlarini toping (taqsimlangan monolit belgisi).
4. Eng uzun sinxron chaqiruv zanjirini chizing va kechikishni hisoblang.

## Manbalar

- Sam Newman — *Building Microservices* (2-nashr) va *Monolith to Microservices*
- Martin Fowler — *MicroservicePremium* <https://martinfowler.com/bliki/MicroservicePremium.html>
- *Fallacies of Distributed Computing* — Peter Deutsch

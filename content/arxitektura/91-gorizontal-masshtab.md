# 91 — Gorizontal masshtab va stateless servislar

[← Oldingi: Tizim dizayni jarayoni va taxminiy hisob](90-tizim-dizayni-jarayoni.md) · [Mundarija](README.md) · [Keyingi: Load balancing →](92-load-balancing.md)

## Tushuncha

Yuklama oshdi — tizim ko'proq ish qilishi kerak. Ikki yo'l bor:

| | Vertikal masshtab (scale up) | Gorizontal masshtab (scale out) |
| --- | --- | --- |
| Nima qilinadi | Mavjud mashinaga ko'proq CPU, xotira | Yana bir xil mashina (nusxa) qo'shiladi |
| Kod o'zgaradimi | Yo'q | Ha — ilova nusxalar orasida holat ulashmasligi kerak |
| Chegara | Eng katta server | Amalda — boshqa qismlar (baza, tarmoq) |
| Bitta nusxa yiqilsa | Butun tizim to'xtaydi | Qolganlari ishlaydi |

Kubernetes hujjati ikkalasini aniq ajratadi: gorizontal masshtab — yuklama oshganda **ko'proq Pod** (ilova nusxasi) ishga tushirish; vertikal — mavjud Pod'larga ko'proq xotira yoki CPU berish.

Twelve-Factor App ("Concurrency" tamoyili) chegarani shunday aytadi: bitta jarayon ichida ham parallellik bo'lishi mumkin (oqimlar, asinxron model), lekin **bitta virtual mashina faqat ma'lum darajagacha kattalashadi**. Shuning uchun ilova bir nechta jismoniy mashinadagi bir nechta jarayonga **tarqala olishi** kerak.

### Stateless — gorizontal masshtabning sharti

Twelve-Factor ("Processes" tamoyili):

- ilova jarayonlari **holatsiz** (stateless) va **hech narsa ulashmaydi** (share-nothing);
- saqlanishi kerak bo'lgan har qanday ma'lumot **holatli tashqi servisda** (backing service), odatda bazada;
- jarayon xotirasi yoki diski faqat **bitta tranzaksiya** davomidagi qisqa kesh sifatida ishlatiladi;
- ilova xotira yoki diskdagi narsa **keyingi so'rovda mavjud bo'ladi deb hech qachon hisoblamaydi**: ko'p nusxa bo'lganda keyingi so'rovni boshqa jarayon qabul qilishi ehtimoli yuqori. Bitta nusxa bo'lsa ham, qayta ishga tushirish (deploy, sozlama o'zgarishi) lokal holatni o'chiradi.

**Sticky session** haqida hujjat qat'iy: foydalanuvchi sessiyasini jarayon xotirasida saqlab, keyingi so'rovlarni xuddi shu jarayonga yo'naltirishga tayanish — Twelve-Factor'ni buzish, unga "hech qachon tayanilmasligi kerak". Sessiya uchun hujjat **muddat bilan saqlaydigan** ombor tavsiya qiladi: Memcached yoki Redis.

Holat qayerga ko'chadi:

| Holat | Lokal (masshtablanmaydi) | Tashqi servis |
| --- | --- | --- |
| Sessiya | Jarayon xotirasi, lokal fayl | Redis, Memcached, baza |
| Yuklangan fayllar | Server diski | Obyekt storage (32-bob) |
| Kesh | Jarayon xotirasi (har nusxada boshqacha) | Umumiy kesh — Redis (25-bob) |
| Fon vazifalari | Jarayon ichidagi taymer | Navbat + worker'lar (26-bob) |
| Rejalashtirilgan ishlar | Har nusxada cron (N marta bajariladi!) | Bitta rejalashtiruvchi yoki qulf (34-bob) |
| WebSocket ulanishi | Bitta nusxaga bog'langan | Pub/sub orqali nusxalar o'rtasida tarqatish (64-bob) |

Twelve-Factor ("Backing services") tashqi servislarni **ulangan resurs** deb ataydi: baza, navbat, kesh — URL va sozlama orqali (18-bob), kodda farqsiz. Shuning uchun nusxalar soni ham, servisning o'zi ham kodni o'zgartirmasdan almashadi.

### Tez ishga tushish va to'g'ri to'xtash

Gorizontal masshtab nusxalarni tez-tez qo'shish va olib tashlashni anglatadi. Twelve-Factor ("Disposability" tamoyili):

- jarayon **bir zumda** ishga tushirilishi yoki to'xtatilishi mumkin bo'lishi kerak — tez elastik masshtab va xavfsiz deploy uchun;
- ishga tushish ideal holatda **bir necha soniya**;
- `SIGTERM` signali kelganda **to'g'ri to'xtash** (graceful shutdown): web jarayon yangi so'rovlarni qabul qilishni to'xtatadi, joriylarini tugatadi va chiqadi; worker joriy vazifani navbatga qaytaradi;
- shuning uchun vazifalar **qayta bajarilishi xavfsiz** bo'lishi kerak — tranzaksiya yoki idempotentlik (70-bob);
- jarayon **kutilmagan o'limga** (uskuna nosozligi) ham chidamli bo'lishi kerak.

### Avtomatik masshtab

Kubernetes `HorizontalPodAutoscaler` (HPA) — gorizontal masshtabni avtomatlashtirishning aniq misoli. Hujjatdagi asosiy formula:

```text
desiredReplicas = ceil( currentReplicas × currentMetricValue / desiredMetricValue )
```

Hujjatdagi misol: joriy qiymat `200m`, maqsad `100m` bo'lsa, nusxalar ikki baravar oshadi (200 / 100 = 2.0); `50m` bo'lsa — yarmiga tushadi. Nisbat 1.0 ga yetarlicha yaqin bo'lsa (sukut bo'yicha ±0.1), hech narsa o'zgarmaydi — tebranishning oldini olish uchun. Yuklama kamayganda nusxalar sozlangan **minimumgacha** qisqaradi.

## Nega shunday

Gorizontal masshtab uchta muammoni birdan hal qiladi:

- **sig'im** — 90-bobdagi hisobda bitta server yetmasa, nusxa qo'shiladi;
- **ishonchlilik** — bitta nusxa yiqilsa, qolganlari ishlaydi (79-bob);
- **deploy** — nusxalar navbat bilan yangilanadi, to'xtovsiz (71-bob).

Lekin bularning hammasi **stateless** shartiga tayanadi. Holatli ilovani nusxalash — har nusxada boshqa "haqiqat": foydalanuvchi bir so'rovda tizimga kirgan, keyingisida yo'q; fayl bir serverda bor, boshqasida yo'q.

## Psevdokod: holatni tashqariga chiqarish

```text
// ❌ Holatli: ikkinchi nusxa qo'shilganda buziladi
function login(req):
    user = verify(req.credentials)
    memorySessions[newId()] = user          // faqat shu jarayon xotirasida
    return cookie(sessionId)

function upload(req):
    save("/var/app/uploads/" + req.file.name)   // faqat shu server diskida

// ✅ Holatsiz: istalgan nusxa istalgan so'rovni qabul qiladi
function login(req):
    user = verify(req.credentials)
    redis.set("session:" + id, user, ttl = 30 min)   // umumiy, muddatli ombor
    return cookie(id)

function upload(req):
    key = objectStorage.put(req.file)        // S3 kabi umumiy storage (32-bob)
    db.insert(files, {key, owner: user.id})
```

## Psevdokod: to'g'ri to'xtash

```text
on SIGTERM:
    httpServer.stopAccepting()               // balanser bu nusxaga yangi so'rov yubormaydi (92-bob)
    waitUntil(activeRequests == 0, timeout = 25s)
    worker.returnCurrentJobToQueue()         // navbat uni boshqa worker'ga beradi
    db.close(); exit(0)
```

Twelve-Factor talabi: HTTP so'rovlar **qisqa** (bir necha soniyadan oshmaydi), uzun polling'da esa klient uzilishda o'zi qayta ulanadi.

## Psevdokod: masshtab shartlari — tekshiruv ro'yxati

```text
[ ] Ikkita nusxani balanser ortida ishga tushirdim — login, savat, fayl yuklash ishlayaptimi?
[ ] Nusxani so'rov o'rtasida o'ldirdim — foydalanuvchi xato ko'rdimi, ma'lumot yo'qoldimi?
[ ] Cron/rejalashtirilgan ishlar N nusxada N marta bajarilmayaptimi?
[ ] Jarayon xotirasidagi kesh nusxalar orasida farq qilmayaptimi (biri eski, biri yangi)?
[ ] Ishga tushish necha soniya? (avtomatik masshtab tezligi shunga bog'liq)
```

## Framework'larda

| Holat | Qanday tashqariga chiqariladi |
| --- | --- |
| Sessiya, kesh, navbat | Laravel: `.env` da `SESSION_DRIVER=redis`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis` — [Laravel 32-bob](../laravel/32-optimallashtirish-va-deploy.md) |
| Fayllar | Laravel `Storage` disklari (`public`, `s3`) — [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md); 32-bob (obyekt storage) |
| Kesh va qulf | Symfony Cache va Lock komponentlari — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) |
| Fon ishlari | Laravel navbatlari — [Laravel 25-bob](../laravel/25-navbatlar.md); Symfony Messenger — [Symfony 26-bob](../symfony/26-messenger.md) |
| Server render keshi bir nechta nusxada | Next.js kesh qatlamlari — [Next.js 18-bob](../nextjs/18-kesh.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Vertikal masshtab | Kod o'zgarmaydi, oddiy | Chegara bor; bitta nuqtadagi nosozlik |
| Gorizontal masshtab | Deyarli chegarasiz sig'im, ishonchlilik | Stateless talabi, balanser, umumiy servislar |
| Sticky session | Mavjud holatli ilova "ishlab turadi" | Twelve-Factor buzilishi; nusxa yiqilsa sessiya yo'qoladi |
| Sessiyani Redis'da | Istalgan nusxa xizmat qiladi | Redis — yangi bog'liqlik va uzilish nuqtasi |
| Avtomatik masshtab (HPA) | Yuklamaga moslashadi | Sekin ishga tushadigan ilovada kech qoladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Sessiya jarayon xotirasida | Ikkinchi nusxada foydalanuvchi "chiqib ketadi" | Redis/Memcached/baza |
| Fayllar lokal diskda | Boshqa nusxada fayl yo'q; deploy'da o'chadi | Obyekt storage |
| Sticky session'ga tayanish | Twelve-Factor: hech qachon tayanmang | Holatni tashqariga chiqarish |
| Har nusxada cron | Ish N marta bajariladi | Bitta rejalashtiruvchi yoki taqsimlangan qulf (34-bob) |
| `SIGTERM` ni e'tiborsiz qoldirish | Deploy va qisqarishda so'rovlar uziladi | Graceful shutdown |
| Uzoq ishga tushish | Avtomatik masshtab kech qoladi | Bir necha soniyagacha; og'ir ishni build bosqichiga |
| Ilovani nusxalab, bazani unutish | Hamma nusxa bitta bazaga urilib, u bo'g'ilib qoladi | Replikalar, kesh, sharding (94–95-boblar) |

## Amaliyot

1. Ilovangizdagi barcha lokal holatni ro'yxatlang: sessiya, fayllar, xotiradagi kesh, cron. Har biri qayerga ko'chishi kerak?
2. Ilovani ikkita nusxada ishga tushiring (balanser yoki ikki port bilan) va asosiy ssenariylarni sinang.
3. `SIGTERM` da nima bo'lishini tekshiring: uzoq so'rov o'rtasida jarayonni to'xtating.
4. Ishga tushish vaqtini o'lchang. Uni nima sekinlashtiradi?
5. Kubernetes ishlatsangiz: HPA maqsadli metrikangiz nima va u haqiqiy yuklamani aks ettiradimi (90-bob: SRE'ning QPS haqidagi ogohlantirishi)?

## Manbalar

- The Twelve-Factor App — VI. Processes: <https://12factor.net/processes>
- The Twelve-Factor App — VIII. Concurrency: <https://12factor.net/concurrency>
- The Twelve-Factor App — IX. Disposability: <https://12factor.net/disposability>
- The Twelve-Factor App — IV. Backing services: <https://12factor.net/backing-services>
- Kubernetes — Horizontal Pod Autoscaling: <https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/>

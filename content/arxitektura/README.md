# Arxitektura — frontend va backend: chegaralar va kesishmalar

Bu qo'llanma texnologiyaga bog'liq emas: undagi qarorlar Symfony, Laravel, Go, Node, React, Vue, Next yoki Angular bilan ishlaganingizda ham bir xil ishlaydi. Misollar til-neytral psevdokod va diagrammalarda beriladi, kerak bo'lganda aniq framework'ga havola qilinadi.

## Nega ikkalasi bitta kitobda

Frontend va backend arxitekturasini alohida o'rganish ikki muammo tug'diradi:

1. **Poydevor takrorlanadi** — chegaralar, bog'liqlik, xatolar modeli, kesh, kuzatuvchanlik ikkala tomonda ham bir xil tamoyillarga tayanadi;
2. **Eng qimmatli qism yo'qoladi** — haqiqiy muammolar aynan **kesishmada** tug'iladi: API shartnomasining egasi kim, token qayerda yashaydi, kesh kimning mas'uliyati, xato qanday shaklda uzatiladi, kim qaysi validatsiyani bajaradi.

Shuning uchun tuzilma shunday: umumiy poydevor → har tomonning o'z arxitekturasi → **ular orasidagi chok** (V qism, eng katta) → sifat va ekspluatatsiya.

## Bu qo'llanma kimga

- **Middle dasturchi**, "ishlaydigan kod" yozadi, lekin tizim darajasidagi qarorlarni asoslay olmaydi;
- **Tech lead / senior**, qaror qabul qiladi va uni jamoaga tushuntirishi kerak;
- **Full-stack**, ikki tomonni ham yozadi va chegarani qayerga qo'yishni hal qilishi kerak;
- **Backend yoki frontend mutaxassisi**, ikkinchi tomonning cheklovlarini tushunmoqchi.

Talab: kamida bitta til va bitta framework bilan real loyihada ishlagan bo'lish.

## Har bobning skeleti

- **Tushuncha** — nima va qaysi muammoni yechadi.
- **Nega shunday** — qaror qayerdan kelib chiqqan, muqobillari nima edi.
- **Kod / diagramma** — psevdokod, sxema yoki konkret misol.
- **Trade-off** — nima yutiladi, nima yo'qotiladi (arxitekturada "bepul" yechim yo'q).
- **Tipik xatolar** — jadval: noto'g'ri yondashuv → nega yomon → to'g'ri yechim.
- **Amaliyot** — o'z loyihangizga qo'llanadigan mashq.
- **Manbalar** — kitob, standart, maqola havolalari.

## Asosiy manbalar

Qo'llanma quyidagi manbalarga tayanadi va ularga havola qiladi:

| Manba | Mavzu |
| --- | --- |
| C4 model (Simon Brown) | Arxitekturani hujjatlashtirish |
| Architecture Decision Records (Michael Nygard) | Qarorlarni yozib qoldirish |
| Domain-Driven Design (Eric Evans, Vaughn Vernon) | Domen modeli, bounded context |
| Patterns of Enterprise Application Architecture (Martin Fowler) | Qatlamlar, ma'lumot naqshlari |
| Designing Data-Intensive Applications (Martin Kleppmann) | Ma'lumot, tranzaksiya, taqsimlangan tizimlar |
| The Twelve-Factor App | Konfiguratsiya, muhitlar, deploy |
| OWASP ASVS / Top 10 | Xavfsizlik talablari |
| Google SRE Book | SLO, ishonchlilik, ekspluatatsiya |
| RFC 9110 (HTTP), RFC 6749/9700 (OAuth 2), RFC 7519 (JWT) | Kesishmadagi standartlar |
| Team Topologies (Skelton, Pais) | Jamoa tuzilmasi va Conway qonuni |

---

## I qism — Arxitektura nima (1–7)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | Arxitektura nima va nega kerak *(tayyorlanmoqda)* | Qaysi qarorlar arxitektura, qaysilari emas |
| 02 | Sifat atributlari va trade-off *(tayyorlanmoqda)* | Tezlik, ishonchlilik, xavfsizlik, o'zgaruvchanlik — ular bir-biriga qarshi |
| 03 | Talabdan qarorga *(tayyorlanmoqda)* | Funksional va nofunksional talablarni arxitekturaga aylantirish |
| 04 | Chegaralar: modul, kontekst, servis *(tayyorlanmoqda)* | Chiziqni qayerga tortish kerak |
| 05 | Bog'liqlik va bog'lanish *(tayyorlanmoqda)* | Coupling/cohesion amalda, o'lchash usullari |
| 06 | Abstraksiya darajalari *(tayyorlanmoqda)* | Qachon abstraksiya foyda, qachon zarar; sizib chiquvchi abstraksiya |
| 07 | Hujjatlashtirish: C4 va ADR *(tayyorlanmoqda)* | Diagramma darajalari, qarorlarni yozib qoldirish |

## II qism — Umumiy tamoyillar (8–16)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 08 | SOLID amalda *(tayyorlanmoqda)* | Har bir tamoyil qaysi og'riqni yechadi va qachon oshirib yuboriladi |
| 09 | Kompozitsiya va meros *(tayyorlanmoqda)* | Nega meros kamdan-kam to'g'ri javob |
| 10 | Bog'liqlikni teskari qilish va DI *(tayyorlanmoqda)* | Konteynerlar, qo'lda ulash, test uchun almashtirish |
| 11 | Domen modeli *(tayyorlanmoqda)* | Entity, value object, aggregate, invariantlar |
| 12 | DDD: til va kontekst *(tayyorlanmoqda)* | Ubiquitous language, bounded context, kontekst xaritasi |
| 13 | Qatlamli, olti burchakli, Clean *(tayyorlanmoqda)* | Uch yondashuvning farqi va umumiy g'oyasi |
| 14 | Vertical slice va feature-based *(tayyorlanmoqda)* | Qatlam bo'yicha emas, xususiyat bo'yicha tashkil qilish |
| 15 | Xatolar modeli *(tayyorlanmoqda)* | Exception vs result, xato chegaralari, qayta tiklanish |
| 16 | Konfiguratsiya va muhitlar *(tayyorlanmoqda)* | 12-factor, sirlar, muhitlar orasidagi farq |

## III qism — Backend arxitekturasi (17–30)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 17 | Monolit: to'g'ri qilingan *(tayyorlanmoqda)* | Nega ko'p loyiha uchun eng yaxshi boshlanish |
| 18 | Modulli monolit *(tayyorlanmoqda)* | Ichki chegaralar, modul shartnomasi, keyingi bo'linishga tayyorgarlik |
| 19 | Mikroservislar: narx va foyda *(tayyorlanmoqda)* | Qachon oqlanadi, qanday muammolarni olib keladi |
| 20 | Servis chegarasini topish *(tayyorlanmoqda)* | Domen, ma'lumot egaligi, o'zgarish chastotasi bo'yicha |
| 21 | Ma'lumotlar bazasi dizayni *(tayyorlanmoqda)* | Normalizatsiya, denormalizatsiya, indekslar, migratsiya siyosati |
| 22 | Tranzaksiya va konkurentlik *(tayyorlanmoqda)* | Izolyatsiya darajalari, qulflar, optimistik boshqaruv |
| 23 | Kesh strategiyalari *(tayyorlanmoqda)* | Cache-aside, write-through, invalidatsiya, TTL, "eng qiyin ikki masala" |
| 24 | Navbat va fon ishlari *(tayyorlanmoqda)* | Idempotentlik, qayta urinish, dead letter, tartib |
| 25 | Hodisaga asoslangan arxitektura *(tayyorlanmoqda)* | Event, outbox, saga, eventual consistency |
| 26 | CQRS va o'qish modellari *(tayyorlanmoqda)* | Qachon ajratish kerak, hisobot va qidiruv |
| 27 | Fayl va media *(tayyorlanmoqda)* | Saqlash, CDN, presigned URL, ishlov berish navbati |
| 28 | Ko'p ijarachilik *(tayyorlanmoqda)* | Bir baza, sxema yoki alohida — uch model va narxi |
| 29 | Rejalashtirilgan ishlar *(tayyorlanmoqda)* | Cron, lider saylash, taqsimlangan lock |
| 30 | Backend testlash strategiyasi *(tayyorlanmoqda)* | Birlik, integratsiya, kontrakt testlar |

## IV qism — Frontend arxitekturasi (31–43)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 31 | Frontend arxitekturasi nimani hal qiladi *(tayyorlanmoqda)* | Chegaralar, holat, ma'lumot, ko'rinish |
| 32 | Render strategiyasi *(tayyorlanmoqda)* | CSR/SSR/SSG/ISR/islands — qaror daraxti va narxi |
| 33 | Modul tuzilmasi *(tayyorlanmoqda)* | Feature-based, qatlamlar, import yo'nalishi |
| 34 | Holat turlari *(tayyorlanmoqda)* | Server, klient, URL, forma holati — qaysi biri qayerda |
| 35 | Ma'lumot qatlami *(tayyorlanmoqda)* | So'rov keshi, eskirish, optimistik yangilash |
| 36 | Dizayn tizimi *(tayyorlanmoqda)* | Tokenlar, komponent shartnomasi, versiyalash |
| 37 | Marshrutlash arxitekturasi *(tayyorlanmoqda)* | URL — holat manbai, guard, lazy yuklash |
| 38 | Formalar arxitekturasi *(tayyorlanmoqda)* | Validatsiya manbai, server xatolari, murakkab oqimlar |
| 39 | Erishimlilik va ko'p tillilik *(tayyorlanmoqda)* | Ularni keyinga qoldirishning narxi |
| 40 | Unumdorlik byudjetlari *(tayyorlanmoqda)* | Core Web Vitals, bundle, o'lchash madaniyati |
| 41 | Mikro-frontendlar *(tayyorlanmoqda)* | Qachon kerak (kamdan-kam), qanday narx |
| 42 | Offline va optimistik UI *(tayyorlanmoqda)* | PWA, navbat, konflikt hal qilish |
| 43 | Frontend testlash strategiyasi *(tayyorlanmoqda)* | Nimani test qilish, E2E chegarasi |

## V qism — Kesishma: shartnoma va integratsiya (44–56)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 44 | API shartnomasi kimniki *(tayyorlanmoqda)* | Kim loyihalaydi, qanday kelishiladi, kim buzsa nima bo'ladi |
| 45 | REST dizayni *(tayyorlanmoqda)* | Resurslar, status kodlar, xato formati (RFC 9457) |
| 46 | GraphQL *(tayyorlanmoqda)* | Qachon foyda, qachon zarar; N+1, kesh, ruxsatlar |
| 47 | gRPC va RPC uslubi *(tayyorlanmoqda)* | Ichki servislar orasida, brauzer cheklovlari |
| 48 | Versiyalash va orqaga moslik *(tayyorlanmoqda)* | URL/header versiyalash, deprecation siyosati |
| 49 | Xato modeli: serverdan UI gacha *(tayyorlanmoqda)* | Kod, xabar, maydon xatolari, foydalanuvchiga tarjima |
| 50 | Autentifikatsiya oqimlari *(tayyorlanmoqda)* | Sessiya vs token, OAuth 2.1, OIDC, SSO |
| 51 | Access va refresh tokenlar *(tayyorlanmoqda)* | Muddat, rotation, saqlash joyi, bekor qilish |
| 52 | Avtorizatsiya *(tayyorlanmoqda)* | RBAC/ABAC, qaror qayerda qabul qilinadi, UI va server mas'uliyati |
| 53 | Fayl yuklash oqimi *(tayyorlanmoqda)* | Presigned URL, progress, validatsiya, virus tekshiruvi |
| 54 | Real vaqt *(tayyorlanmoqda)* | WebSocket, SSE, polling — tanlov mezonlari |
| 55 | Kesh kelishuvi *(tayyorlanmoqda)* | HTTP kesh, ETag, CDN, klient keshi — kim nimani keshlaydi |
| 56 | Ro'yxat shartnomasi *(tayyorlanmoqda)* | Pagination (offset/cursor), filtr, saralash, qidiruv |

## VI qism — Ma'lumot va integratsiya (57–62)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 57 | Model mos kelmasligi *(tayyorlanmoqda)* | Domen modeli ≠ API modeli ≠ UI modeli |
| 58 | BFF va API gateway *(tayyorlanmoqda)* | Qachon kerak, qayerda joylashadi, kim egalik qiladi |
| 59 | Idempotentlik *(tayyorlanmoqda)* | Takroriy so'rov, to'lov, idempotency key |
| 60 | Migratsiya va nol to'xtovli deploy *(tayyorlanmoqda)* | Expand/contract, ikki tomonlama moslik |
| 61 | Uchinchi tomon integratsiyalari *(tayyorlanmoqda)* | Webhook, retry, imzo tekshiruvi, sandbox |
| 62 | Ko'p platformalilik *(tayyorlanmoqda)* | Web, mobil, umumiy kontrakt va farqlar |

## VII qism — Sifat, ish va rivojlanish (63–72)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 63 | Kuzatuvchanlik *(tayyorlanmoqda)* | Log, metrika, trace — uchala qatlamda, correlation ID |
| 64 | Xavfsizlik arxitekturasi *(tayyorlanmoqda)* | Tahdid modeli, ishonch chegaralari, sirlar boshqaruvi |
| 65 | Unumdorlik arxitekturasi *(tayyorlanmoqda)* | O'lchash, byudjet, yuk testi, bottleneck tahlili |
| 66 | Ishonchlilik *(tayyorlanmoqda)* | SLO, timeout, retry, circuit breaker, bulkhead |
| 67 | Deploy arxitekturasi *(tayyorlanmoqda)* | Muhitlar, feature flag, canary, rollback |
| 68 | Jamoa va Conway qonuni *(tayyorlanmoqda)* | Tuzilma arxitekturaga qanday ta'sir qiladi |
| 69 | Legacy bilan ishlash *(tayyorlanmoqda)* | Strangler fig, bosqichma-bosqich ko'chirish, "katta qayta yozish" tuzog'i |
| 70 | Qaror qabul qilish *(tayyorlanmoqda)* | Trade-off tahlili, ADR yozish, hech narsa qilmaslik ham qaror |
| 71 | Amaliy keys: to'liq tizim *(tayyorlanmoqda)* | E-commerce misolida barcha qarorlar ketma-ketligi |
| 72 | Checklist *(tayyorlanmoqda)* | Loyiha boshlanishi, ko'rik, reliz uchun ro'yxatlar |

---

## Qanday o'qish kerak

- **Ketma-ket:** I → II → (III yoki IV, o'z yo'nalishingiz) → **V** → VII.
- **Full-stack:** to'liq ketma-ket, V qismga alohida vaqt ajrating.
- **Backend mutaxassisi:** I, II, III, V, VII — IV qismni umumiy tanishish uchun.
- **Frontend mutaxassisi:** I, II, IV, V, VII — III qismni ma'lumot va kesh boblari uchun.
- **Aniq muammo bilan kelgan bo'lsangiz:** V qism mustaqil o'qiladi (shartnoma, auth, kesh, real vaqt).

Qo'llanma retsept to'plami emas: har bobda **trade-off** bo'limi bor, chunki arxitekturada to'g'ri javob kontekstga bog'liq. Maqsad — qarorni asoslay olish, yod olish emas.

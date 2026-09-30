# Arxitektura — frontend va backend: chegaralar va kesishmalar

Bu qo'llanma texnologiyaga bog'liq emas: undagi qarorlar Symfony, Laravel, Go, Node, React, Vue, Next yoki Angular bilan ishlaganingizda ham bir xil ishlaydi. Asosiy misollar til-neytral psevdokod va diagrammalarda; har bobning "Framework'larda" bo'limida esa xuddi shu qaror aniq framework kodida va shu saytdagi qo'llanmalarga havola bilan ko'rsatiladi.

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
- **Psevdokod / diagramma** — asosiy misol til-neytral: g'oya framework'dan qat'i nazar bir xil.
- **Framework'larda** — xuddi shu qaror aniq kodda: kerakli joyda Symfony/Laravel, Angular/React/Vue/Next misollari va shu saytdagi tegishli boblarga havola.
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
| Fundamentals of Software Architecture (Richards, Ford) | Arxitektura uslublari, trade-off tahlili |
| Building Evolutionary Architectures (Ford, Parsons, Kua) | Fitness function, evolyutsiya |
| Release It! (Michael Nygard) | Barqarorlik naqshlari |
| OpenAPI Specification | Shartnoma birinchi yondashuvi |
| OWASP API Security Top 10, OWASP Top 10 for LLM Applications | API va AI xavfsizligi |

---

## I qism — Arxitektura nima (1–7)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [Arxitektura nima va nega kerak](01-arxitektura-nima.md) | Qaysi qarorlar arxitektura, qaysilari emas |
| 02 | [Sifat atributlari va trade-off](02-sifat-atributlari.md) | Tezlik, ishonchlilik, xavfsizlik, o'zgaruvchanlik — ular bir-biriga qarshi |
| 03 | [Talabdan qarorga](03-talabdan-qarorga.md) | Funksional va nofunksional talablarni arxitekturaga aylantirish |
| 04 | [Chegaralar: modul, kontekst, servis](04-chegaralar.md) | Chiziqni qayerga tortish kerak |
| 05 | [Bog'liqlik va bog'lanish](05-bogliqlik.md) | Coupling/cohesion amalda, o'lchash usullari |
| 06 | [Abstraksiya darajalari](06-abstraksiya.md) | Qachon abstraksiya foyda, qachon zarar; sizib chiquvchi abstraksiya |
| 07 | [Hujjatlashtirish: C4 va ADR](07-c4-va-adr.md) | Diagramma darajalari, qarorlarni yozib qoldirish |

## II qism — Umumiy tamoyillar (8–18)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 08 | [SOLID amalda](08-solid.md) | Har bir tamoyil qaysi og'riqni yechadi va qachon oshirib yuboriladi |
| 09 | [Kompozitsiya va meros](09-kompozitsiya.md) | Nega meros kamdan-kam to'g'ri javob |
| 10 | [Bog'liqlikni teskari qilish va DI](10-di.md) | Konteynerlar, qo'lda ulash, test uchun almashtirish |
| 11 | [Modulning ochiq API'si](11-ochiq-api.md) | Inkapsulyatsiya, ichki va tashqi kod, barqaror interfeys |
| 12 | [Tiplar orqali dizayn](12-tiplar.md) | Noto'g'ri holatni ifodalab bo'lmaydigan tiplar, branded tiplar, parse-don't-validate |
| 13 | [Domen modeli](13-domen-modeli.md) | Entity, value object, aggregate, invariantlar |
| 14 | [DDD: til va kontekst](14-ddd.md) | Ubiquitous language, bounded context, kontekst xaritasi |
| 15 | [Qatlamli, olti burchakli, Clean](15-qatlamli-arxitektura.md) | Uch yondashuvning farqi va umumiy g'oyasi |
| 16 | [Vertical slice va feature-based](16-vertical-slice.md) | Qatlam bo'yicha emas, xususiyat bo'yicha tashkil qilish |
| 17 | [Xatolar modeli](17-xatolar-modeli.md) | Exception vs result, xato chegaralari, qayta tiklanish |
| 18 | [Konfiguratsiya va muhitlar](18-konfiguratsiya.md) | 12-factor, sirlar, muhitlar orasidagi farq |

## III qism — Backend arxitekturasi (19–35)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 19 | [Monolit: to'g'ri qilingan](19-monolit.md) | Nega ko'p loyiha uchun eng yaxshi boshlanish |
| 20 | [Modulli monolit](20-modulli-monolit.md) | Ichki chegaralar, modul shartnomasi, keyingi bo'linishga tayyorgarlik |
| 21 | [Mikroservislar: narx va foyda](21-mikroservislar.md) | Qachon oqlanadi, qanday muammolarni olib keladi |
| 22 | [Servis chegarasini topish](22-servis-chegarasi.md) | Domen, ma'lumot egaligi, o'zgarish chastotasi bo'yicha |
| 23 | [Ma'lumotlar bazasi dizayni](23-malumotlar-bazasi.md) | Normalizatsiya, denormalizatsiya, indekslar, migratsiya siyosati |
| 24 | [Tranzaksiya va konkurentlik](24-tranzaksiya.md) | Izolyatsiya darajalari, qulflar, optimistik boshqaruv |
| 25 | [Kesh strategiyalari](25-kesh.md) | Cache-aside, write-through, invalidatsiya, TTL, "eng qiyin ikki masala" |
| 26 | [Navbat va fon ishlari](26-navbat.md) | Idempotentlik, qayta urinish, dead letter, tartib |
| 27 | [Hodisaga asoslangan arxitektura](27-hodisalar.md) | Event, outbox, saga, eventual consistency |
| 28 | [CQRS va o'qish modellari](28-cqrs.md) | Qachon ajratish kerak, hisobot va qidiruv |
| 29 | [Qidiruv arxitekturasi](29-qidiruv.md) | Full-text, qidiruv indeksi, sinxronlash, relevantlik |
| 30 | [Rate limiting va kvotalar](30-rate-limiting.md) | Token bucket, sliding window, foydalanuvchi/ijarachi darajasi, adolatli taqsimot |
| 31 | [Audit va o'zgarishlar tarixi](31-audit.md) | Audit log, soft delete, event sourcing qachon kerak, GDPR bilan ziddiyat |
| 32 | [Fayl va media](32-fayl-va-media.md) | Saqlash, CDN, presigned URL, ishlov berish navbati |
| 33 | [Ko'p ijarachilik](33-kop-ijarachilik.md) | Bir baza, sxema yoki alohida — uch model va narxi |
| 34 | [Rejalashtirilgan ishlar](34-rejalashtirilgan-ishlar.md) | Cron, lider saylash, taqsimlangan lock |
| 35 | [Backend testlash strategiyasi](35-backend-testlash.md) | Birlik, integratsiya, kontrakt testlar |

## IV qism — Frontend arxitekturasi (36–52)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 36 | [Frontend arxitekturasi nimani hal qiladi](36-frontend-arxitekturasi.md) | Chegaralar, holat, ma'lumot, ko'rinish |
| 37 | [Render strategiyasi](37-render-strategiyasi.md) | CSR/SSR/SSG/ISR/islands — qaror daraxti va narxi |
| 38 | [Modul tuzilmasi](38-modul-tuzilmasi.md) | Feature-based, qatlamlar, import yo'nalishi (batafsil — FSD qo'llanmasida) |
| 39 | [Komponent API dizayni](39-komponent-api.md) | Input/output, kompozitsiya va konfiguratsiya, slot va render prop, headless |
| 40 | [Holat turlari](40-holat-turlari.md) | Server, klient, URL, forma holati — qaysi biri qayerda |
| 41 | [Reaktivlik modellari](41-reaktivlik-modellari.md) | Signal, virtual DOM, proxy, kompilyator — framework'lar qanday yangilaydi va nega muhim |
| 42 | [Ma'lumot qatlami](42-malumot-qatlami.md) | So'rov keshi, eskirish, optimistik yangilash |
| 43 | [Dizayn tizimi](43-dizayn-tizimi.md) | Tokenlar, komponent shartnomasi, versiyalash |
| 44 | [Marshrutlash arxitekturasi](44-marshrutlash.md) | URL — holat manbai, guard, lazy yuklash |
| 45 | [Formalar arxitekturasi](45-formalar.md) | Validatsiya manbai, server xatolari, murakkab oqimlar |
| 46 | [Erishimlilik va ko'p tillilik](46-a11y-va-i18n.md) | Ularni keyinga qoldirishning narxi |
| 47 | [Unumdorlik byudjetlari](47-unumdorlik-byudjetlari.md) | Core Web Vitals, bundle, o'lchash madaniyati |
| 48 | [Frontend xatolari va kuzatuvchanlik](48-frontend-xatolari.md) | Xato chegaralari, RUM, source map, foydalanuvchi sessiyasi |
| 49 | [Build va yetkazib berish](49-build-va-yetkazish.md) | Bundler, chunk strategiyasi, kesh-busting, eski tablar va versiya nomuvofiqligi |
| 50 | Mikro-frontendlar *(tayyorlanmoqda)* | Qachon kerak (kamdan-kam), qanday narx |
| 51 | Offline va optimistik UI *(tayyorlanmoqda)* | PWA, navbat, konflikt hal qilish |
| 52 | Frontend testlash strategiyasi *(tayyorlanmoqda)* | Nimani test qilish, E2E chegarasi |

## V qism — Kesishma: shartnoma va integratsiya (53–67)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 53 | API shartnomasi kimniki *(tayyorlanmoqda)* | Kim loyihalaydi, qanday kelishiladi, kim buzsa nima bo'ladi |
| 54 | Shartnoma birinchi: OpenAPI va kod generatsiyasi *(tayyorlanmoqda)* | Sxemadan backend validatsiya va frontend tiplari, drift oldini olish |
| 55 | REST dizayni *(tayyorlanmoqda)* | Resurslar, status kodlar, xato formati (RFC 9457) |
| 56 | GraphQL *(tayyorlanmoqda)* | Qachon foyda, qachon zarar; N+1, kesh, ruxsatlar |
| 57 | gRPC va RPC uslubi *(tayyorlanmoqda)* | Ichki servislar orasida, brauzer cheklovlari |
| 58 | Versiyalash va orqaga moslik *(tayyorlanmoqda)* | URL/header versiyalash, deprecation siyosati |
| 59 | Xato modeli: serverdan UI gacha *(tayyorlanmoqda)* | Kod, xabar, maydon xatolari, foydalanuvchiga tarjima |
| 60 | Autentifikatsiya oqimlari *(tayyorlanmoqda)* | Sessiya vs token, OAuth 2.1, OIDC, SSO |
| 61 | Access va refresh tokenlar *(tayyorlanmoqda)* | Muddat, rotation, saqlash joyi, bekor qilish |
| 62 | Avtorizatsiya *(tayyorlanmoqda)* | RBAC/ABAC, qaror qayerda qabul qilinadi, UI va server mas'uliyati |
| 63 | Fayl yuklash oqimi *(tayyorlanmoqda)* | Presigned URL, progress, validatsiya, virus tekshiruvi |
| 64 | Real vaqt *(tayyorlanmoqda)* | WebSocket, SSE, polling — tanlov mezonlari |
| 65 | Kesh kelishuvi *(tayyorlanmoqda)* | HTTP kesh, ETag, CDN, klient keshi — kim nimani keshlaydi |
| 66 | Ro'yxat shartnomasi *(tayyorlanmoqda)* | Pagination (offset/cursor), filtr, saralash, qidiruv |
| 67 | Cheklovlar shartnomasi *(tayyorlanmoqda)* | 429, Retry-After, kvota sarlavhalari, klientda backoff va UX |

## VI qism — Ma'lumot va integratsiya (68–74)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 68 | Model mos kelmasligi *(tayyorlanmoqda)* | Domen modeli ≠ API modeli ≠ UI modeli |
| 69 | BFF va API gateway *(tayyorlanmoqda)* | Qachon kerak, qayerda joylashadi, kim egalik qiladi |
| 70 | Idempotentlik *(tayyorlanmoqda)* | Takroriy so'rov, to'lov, idempotency key |
| 71 | Migratsiya va nol to'xtovli deploy *(tayyorlanmoqda)* | Expand/contract, ikki tomonlama moslik |
| 72 | Uchinchi tomon integratsiyalari *(tayyorlanmoqda)* | Webhook, retry, imzo tekshiruvi, sandbox |
| 73 | Ko'p platformalilik *(tayyorlanmoqda)* | Web, mobil, umumiy kontrakt va farqlar |
| 74 | Monorepo va kod ulashish *(tayyorlanmoqda)* | Nx/Turborepo, umumiy paketlar, chegaralarni majburlash, qachon polirepo |

## VII qism — Sifat, ish va rivojlanish (75–84)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 75 | Kuzatuvchanlik *(tayyorlanmoqda)* | Log, metrika, trace — uchala qatlamda, correlation ID |
| 76 | Xavfsizlik arxitekturasi *(tayyorlanmoqda)* | Tahdid modeli, ishonch chegaralari, sirlar boshqaruvi |
| 77 | API xavfsizligi *(tayyorlanmoqda)* | OWASP API Top 10: BOLA, ommaviy tayinlash, resurs iste'moli |
| 78 | Unumdorlik arxitekturasi *(tayyorlanmoqda)* | O'lchash, byudjet, yuk testi, bottleneck tahlili |
| 79 | Ishonchlilik *(tayyorlanmoqda)* | SLO, timeout, retry, circuit breaker, bulkhead |
| 80 | Deploy arxitekturasi *(tayyorlanmoqda)* | Muhitlar, feature flag, canary, rollback |
| 81 | Jamoa va Conway qonuni *(tayyorlanmoqda)* | Tuzilma arxitekturaga qanday ta'sir qiladi |
| 82 | Legacy bilan ishlash *(tayyorlanmoqda)* | Strangler fig, bosqichma-bosqich ko'chirish, "katta qayta yozish" tuzog'i |
| 83 | Evolyutsion arxitektura *(tayyorlanmoqda)* | Fitness function, arxitektura testlari, qarorlarni qayta ko'rib chiqish |
| 84 | Qaror qabul qilish *(tayyorlanmoqda)* | Trade-off tahlili, ADR yozish, hech narsa qilmaslik ham qaror |

## VIII qism — AI davrida arxitektura (85–89)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 85 | LLM integratsiyasi arxitekturasi *(tayyorlanmoqda)* | Model chaqiruvi qayerda, streaming, xarajat, timeout va fallback |
| 86 | RAG va vektor qidiruv *(tayyorlanmoqda)* | Hujjatlarni bo'lish, embedding, indeks yangilanishi, sifatni o'lchash |
| 87 | Agentlar va vositalar (tool calling) *(tayyorlanmoqda)* | Ruxsatlar chegarasi, tasdiqlash, idempotent vositalar |
| 88 | AI xavfsizligi *(tayyorlanmoqda)* | Prompt injection, ma'lumot sizishi, OWASP LLM Top 10 |
| 89 | AI bilan tizim loyihalash *(tayyorlanmoqda)* | Vazifani qanday berish, natijani tekshirish, muhandis mas'uliyati |

## IX qism — Amaliyot (90–91)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 90 | Amaliy keys: to'liq tizim *(tayyorlanmoqda)* | E-commerce misolida barcha qarorlar ketma-ketligi |
| 91 | Checklist *(tayyorlanmoqda)* | Loyiha boshlanishi, ko'rik, reliz uchun ro'yxatlar |

---

## Qanday o'qish kerak

- **Ketma-ket:** I → II → (III yoki IV, o'z yo'nalishingiz) → **V** → VI → VII → VIII → IX.
- **Full-stack:** to'liq ketma-ket, V qismga alohida vaqt ajrating.
- **Backend mutaxassisi:** I, II, III, V, VII — IV qismni umumiy tanishish uchun.
- **AI bilan ishlaydigan tizim quryapsizmi:** VIII qism — V va VII qismlarga tayanadi.
- **Frontend mutaxassisi:** I, II, IV, V, VII — III qismni ma'lumot va kesh boblari uchun.
- **Aniq muammo bilan kelgan bo'lsangiz:** V qism mustaqil o'qiladi (shartnoma, auth, kesh, real vaqt).

Qo'llanma retsept to'plami emas: har bobda **trade-off** bo'limi bor, chunki arxitekturada to'g'ri javob kontekstga bog'liq. Maqsad — qarorni asoslay olish, yod olish emas.

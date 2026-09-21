# Antipatternlar: nima qilmaslik kerak

[← Testlash](06-testlash.md) · [Katalog](README.md)

---

Bu ro'yxat — haqiqiy loyihalarda eng ko'p uchraydigan qarorlar. Ularning har biri **boshida mantiqli ko'rinadi** — shuning uchun ham takrorlanadi.

---

## A-01 · Fat controller

**Ko'rinishi.** 200+ qatorli kontroller metodi: validatsiya, baza so'rovlari, email, hisob-kitob — hammasi bir joyda.

**Nega yomon.** CLI yoki Messenger'dan qayta ishlatib bo'lmaydi; test uchun butun HTTP stek kerak; ikki dasturchi bir faylda konflikt qiladi.

**To'g'ri yo'l.** [P-03](01-http-qatlam.md#p-03--yupqa-kontroller--action-servisi): kontroller 5–15 qator.

---

## A-02 · `EntityManager` kontrollerda

**Ko'rinishi.** `$em->createQueryBuilder()` to'g'ridan-to'g'ri kontrollerda yoki `$em->flush()` har joyda.

**Nega yomon.** So'rov mantiqi tarqaladi ([P-16](03-persistence.md#p-16--sorovlar-faqat-repositoryda)), tranzaksiya chegarasi noaniq bo'ladi, qatlam chegarasi buziladi.

**To'g'ri yo'l.** Repository metodlari + biznes amalni bajaruvchi servis.

---

## A-03 · Entity — kirish va chiqish ob'ekti sifatida

**Ko'rinishi.** `#[MapRequestPayload] Post $post` va javobda ham o'sha entity.

**Nega yomon.** Mass assignment xavfi, ichki maydonlar sizishi, API kontrakti domen sxemasiga qotib qoladi.

**To'g'ri yo'l.** [P-01](01-http-qatlam.md#p-01--input-dto-kirish-obekti) va [P-02](01-http-qatlam.md#p-02--output-dto-view-model).

---

## A-04 · Konteynerni in'ektsiya qilish

**Ko'rinishi.** `public function __construct(private ContainerInterface $container)` va keyin `$this->container->get('...')`.

**Nega yomon.** Haqiqiy bog'liqliklar yashirinadi; test uchun butun konteyner kerak; kompilyatsiya vaqtidagi tekshiruv yo'qoladi.

**To'g'ri yo'l.** Aniq bog'liqliklar; bir nechta servis kerak bo'lsa — `#[AutowireLocator]` ([06-bob](../06-container-chuqur.md)).

---

## A-05 · Anemic model (setterlar to'dasi)

**Ko'rinishi.** Entity'da faqat getter/setter; barcha qoidalar `XxxService` ichida.

**Nega yomon.** Ob'ekt istalgan yaroqsiz holatga tushadi; bir qoida bir necha servisda takrorlanadi va vaqt o'tib bir-biridan farq qila boshlaydi.

**To'g'ri yo'l.** [P-08](02-domen.md#p-08--konstruktorda-toliq-obekt), [P-11](02-domen.md#p-11--holat-mashinasi-enum--otish-metodlari).

---

## A-06 · "Manager" / "Helper" klasslari

**Ko'rinishi.** `UserManager`, `OrderHelper`, `AppUtils` — 30 ta bog'liq bo'lmagan metod.

**Nega yomon.** Nomi mas'uliyatni aytmaydi, shuning uchun har narsa shu yerga qo'shiladi; klass o'sib, test qilib bo'lmaydigan bo'ladi.

**To'g'ri yo'l.** Amal bo'yicha nomlangan kichik servislar: `UserRegistrar`, `OrderCanceller`, `InvoiceNumberGenerator`.

---

## A-07 · Doctrine hodisasida yon ta'sir

**Ko'rinishi.** `postPersist` da email yuborish, tashqi API chaqirish yoki `flush()`.

**Nega yomon.** Tranzaksiya rollback bo'lsa email allaqachon ketgan; `flush()` rekursiyaga olib keladi; ishlov `flush()` ni sekinlashtiradi.

**To'g'ri yo'l.** [P-13](02-domen.md#p-13--domen-hodisasi-record--release) — hodisani yozib, tranzaksiyadan keyin tarqating.

---

## A-08 · Xatoni jimgina yutish

**Ko'rinishi.** `try { ... } catch (\Throwable) {}` yoki `catch (\Throwable $e) { return null; }`.

**Nega yomon.** Muammo bor, lekin monitoring ko'rmaydi; xato keyinroq, butunlay boshqa joyda ko'rinadi.

**To'g'ri yo'l.** Loglang va ma'noli javob qaytaring yoki qayta tashlang ([24-bob](../24-xatolik-va-log.md)).

---

## A-09 · Keshni "plastir" sifatida ishlatish

**Ko'rinishi.** Endpoint sekin → butun javob 10 daqiqaga keshlanadi.

**Nega yomon.** Asosiy sabab (N+1, indeks yo'qligi) qoladi; endi yana invalidatsiya muammosi va eskirgan ma'lumot qo'shiladi.

**To'g'ri yo'l.** Avval so'rovni tuzating ([33-bob](../33-unumdorlik.md) dagi tartib), kesh — oxirgi qadam.

---

## A-10 · Har servisga interfeys

**Ko'rinishi.** `PostCreatorInterface` + yagona `PostCreator` implementatsiyasi; shunday 80 ta juftlik.

**Nega yomon.** Navigatsiya qiyinlashadi, fayl soni ikki barobar oshadi, foydasi nol — almashtirish ehtimoli yo'q.

**To'g'ri yo'l.** Interfeys — **haqiqiy** sabab bo'lganda: bir nechta implementatsiya, tashqi tizim adapteri ([P-31](05-xizmat-va-di.md#p-31--port-va-adapter-tashqi-tizim)), yoki qatlam chegarasi.

---

## A-11 · Xabarda entity

**Ko'rinishi.** `$bus->dispatch(new SendInvoice($order))`.

**Nega yomon.** Serializatsiya muammolari, eskirgan ma'lumot, deploy davomida format mos kelmasligi.

**To'g'ri yo'l.** [P-25](04-async.md#p-25--xabarda-id-entity-emas).

---

## A-12 · Cheksiz worker

**Ko'rinishi.** `messenger:consume async` — limitsiz, supervisorsiz, `nohup` bilan ishga tushirilgan.

**Nega yomon.** Xotira o'sadi, DB ulanishi uziladi, deploy'dan keyin eski kod ishlaydi, worker o'lsa hech kim bilmaydi.

**To'g'ri yo'l.** [P-28](04-async.md#p-28--worker-hayot-sikli).

---

## A-13 · Production'da `doctrine:schema:update --force`

**Ko'rinishi.** Migratsiya o'rniga sxemani "avtomatik" yangilash.

**Nega yomon.** Ma'lumot yo'qolishi mumkin, tarix yo'q, ikki muhit bir-biridan farq qiladi, rollback imkonsiz.

**To'g'ri yo'l.** Migratsiyalar va expand–contract naqshi ([16-bob](../16-migratsiyalar.md)).

---

## A-14 · `.env` da sirlar

**Ko'rinishi.** Production paroli `.env` faylida, git'ga commit qilingan.

**Nega yomon.** Sir repo tarixida abadiy qoladi; fork, CI logi, kesh orqali tarqaladi; o'chirish yordam bermaydi.

**To'g'ri yo'l.** Secrets vault yoki `.env.local` ([08-bob](../08-konfiguratsiya.md)). Sir ochilsa — **rotatsiya**.

---

## A-15 · Ro'yxatni PHP'da filtrlash

**Ko'rinishi.** `findAll()` → `array_filter()` → `array_slice()`.

**Nega yomon.** Butun jadval xotiraga yuklanadi; indekslar ishlatilmaydi; paginatsiya noto'g'ri bo'ladi.

**To'g'ri yo'l.** Filtr, tartib va limit — so'rovda ([17-bob](../17-repository-va-dql.md)).

---

## A-16 · Erta mikroservislar

**Ko'rinishi.** 5 kishilik jamoa, 3 oylik loyiha — 8 ta servis, har biri o'z repo va bazasi bilan.

**Nega yomon.** Tarmoq nosozliklari, taqsimlangan tranzaksiyalar, versiyalash, 8 ta deploy quvuri — bularning hammasi domen hali barqarorlashmagan paytda.

**To'g'ri yo'l.** Modulli monolit; chegaralar barqarorlashgach ajratish ([39-bob](../39-arxitektura.md)).

---

## Umumiy qoida

Bu ro'yxatdagi deyarli hamma xato bitta sababga borib taqaladi: **qisqa muddatli qulaylik uzoq muddatli xarajatdan ustun qo'yilgan**.

Amaliy mezon — kod yozayotganda o'zingizga savol bering:

> "Bu kodni olti oydan keyin, boshqa odam, tunda, incident paytida o'qiydi. U tushunadimi?"

Agar javob "yo'q" bo'lsa, yuqoridagi ro'yxatda o'sha yechim bordir.

---

[← Testlash](06-testlash.md) · [Katalog](README.md) · [Asosiy mundarija](../README.md)

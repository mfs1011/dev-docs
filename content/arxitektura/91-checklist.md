# 91 — Checklist

[← Oldingi: Amaliy keys: to'liq tizim](90-amaliy-keys.md) · [Mundarija](README.md)

## Tushuncha

Bu bob — butun kitobning qisqa ro'yxatlari: loyiha boshlanishida, dizayn ko'rigida, kod ko'rigida, reliz oldidan va production'dan keyin. Har band — bitta savol va unga javob beradigan bob.

Checklist fikrlashning o'rnini bosmaydi — u **unutishning** o'rnini bosadi. Har bandga "ha" deyish shart emas; lekin har "yo'q" — ongli qaror bo'lishi kerak (va muhim bo'lsa — ADR'da).

## Nega shunday

Atul Gawande *The Checklist Manifesto*'da ko'rsatganidek, tajribali mutaxassislar ham murakkab ishda oddiy qadamlarni unutadi — bilmagani uchun emas, e'tibor boshqa joyda bo'lgani uchun. Arxitekturada ham xuddi shunday: timeout, idempotency key, avtorizatsiya tekshiruvi — hamma biladi, lekin aynan ular production'da "unutilgan" bo'lib chiqadi.

## 1. Loyiha boshlanishi

```text
Kontekst va maqsad
  □ Asosiy 3–5 sifat atributi tartib bilan yozilganmi?                     (2, 3-boblar)
  □ Cheklovlar: jamoa, muddat, byudjet, mavjud tizimlar, qonunchilik?        (3, 31-boblar)
  □ "Muvaffaqiyat" qanday o'lchanadi (biznes metrikasi, SLO)?               (75, 79-boblar)

Tuzilma
  □ Bounded context'lar va ularning egalari aniqlanganmi?                    (4, 14, 81-boblar)
  □ Arxitektura uslubi tanlangan va ADR'da asoslanganmi?                     (19–21, 84-boblar)
  □ Modul chegaralari CI'da tekshiriladimi?                                  (11, 83-boblar)
  □ C4 kontekst va konteyner diagrammalari bormi?                            (7-bob)

Asoslar (keyin qo'shish qimmat)
  □ Xatolar modeli va API xato formati kelishilganmi?                       (17, 59-boblar)
  □ Konfiguratsiya va sirlar boshqaruvi?                                     (18, 76-boblar)
  □ Pul, vaqt, ID formatlari?                                                (12, 13-boblar)
  □ Ko'p ijarachilik / ko'p til / ko'p platforma kerakmi — hozir yoki keyin? (33, 46, 73-boblar)
  □ Kuzatuvchanlik: strukturalangan log, traceId, asosiy metrikalar?         (75-bob)
  □ CI: lint, typecheck, test, build — birinchi haftadan                    (35, 49, 52-boblar)
```

## 2. Dizayn ko'rigi (yangi feature yoki servis)

```text
  □ Qaysi bounded context'ga tegishli? Yangi chegara kerakmi?                (4, 22-boblar)
  □ Ma'lumot egasi kim? Boshqa modullar unga qanday kiradi?                  (11, 23-boblar)
  □ Tranzaksiya chegarasi qayerda? Taqsimlangan bo'lsa — outbox/saga?        (24, 27-boblar)
  □ Sinxron yoki asinxron? Javob vaqti byudjetiga sig'adimi?                  (26, 78-boblar)
  □ API shartnomasi avval yozilganmi? Orqaga moslikmi?                        (53, 54, 58-boblar)
  □ Takrorlanadigan so'rovlar — idempotentmi?                                (70-bob)
  □ Tashqi bog'liqliklar: timeout, retry, fallback?                           (72, 79-boblar)
  □ Tahdid modeli: yangi ma'lumot oqimi, yangi ishonch chegarasi?             (76-bob)
  □ Avtorizatsiya: kim nimani ko'radi/o'zgartiradi — obyekt darajasida?      (62, 77-boblar)
  □ Kesh kerakmi? Invalidatsiya qanday?                                       (25, 65-boblar)
  □ UI holatlari: yuklanish, bo'sh, xato, qisman, offline?                    (40, 48, 51-boblar)
  □ Migratsiya: expand/contract rejasi?                                       (71-bob)
  □ Qaytarilmaydigan qarorlar bormi? → ADR                                    (83, 84-boblar)
```

## 3. Kod ko'rigi (PR)

```text
Tuzilma
  □ Kod to'g'ri modul va qatlamdami? Begona ichki kodni import qilmaydimi?   (11, 15, 38-boblar)
  □ Mavjud yordamchi/komponent takrorlanmaganmi?                              (43-bob)
  □ Bog'liqliklar to'g'ri yo'nalishdami (domen infratuzilmaga bog'liq emas)? (5, 10-boblar)

To'g'rilik
  □ Kiritma chegarada tekshiriladimi (parse, validate)?                       (12-bob)
  □ Xatolar modelga mos (domen xatosi, Problem Details)?                     (17, 59-boblar)
  □ Chekka holatlar: bo'sh, null, takror, parallel, katta hajm?               (35, 52-boblar)
  □ Testlar xatti-harakatni tekshiradimi (implementatsiyani emas)?           (35, 52-boblar)

Xavfsizlik va ishlash
  □ Avtorizatsiya har obyektga; ortiqcha maydon javobda yo'q?                 (77-bob)
  □ Sir, token, shaxsiy ma'lumot logda yo'q?                                  (31, 75-boblar)
  □ N+1, indeks, pagination limiti?                                           (66, 78-boblar)
  □ Tashqi chaqiruvda timeout bormi?                                          (79-bob)

AI bilan yozilgan kod
  □ Muallif har qatorni tushuntira oladimi?                                   (89-bob)
  □ Diff kichik va bitta vazifaga oidmi?                                      (89-bob)
```

## 4. Reliz oldidan

```text
  □ Bitta artefakt staging'da sinalganmi?                                     (80-bob)
  □ Migratsiyalar orqaga mos va katta jadvallarda xavfsizmi?                  (71-bob)
  □ Rollback rejasi va vaqti ma'lummi? Sinab ko'rilganmi?                     (80-bob)
  □ Yangi funksiya feature flag ortidami? Flag egasi va muddati?              (18, 80-boblar)
  □ Canary metrikalari va chegaralari belgilanganmi?                          (80-bob)
  □ API/hodisa sxemasida buzuvchi o'zgarish yo'qmi (diff CI'da)?             (54, 58-boblar)
  □ Frontend: bundle byudjeti, eski chunk'lar CDN'da qoladimi?                (47, 49-boblar)
  □ Yuk testi kutilgan cho'qqi uchun (aksiya, mavsum)?                        (78-bob)
  □ Dashboard va alertlar yangi funksiyani ham qamraydimi?                   (75-bob)
  □ Runbook: "buzilsa nima qilamiz" yozilganmi?                               (79-bob)
```

## 5. Production'dan keyin (muntazam)

```text
Har hafta / oy:
  □ SLO va xato byudjeti holati                                               (79-bob)
  □ Eng sekin endpoint'lar va eng ko'p xatolar (backend va frontend)          (48, 75, 78-boblar)
  □ Xarajat: infratuzilma, tashqi API, AI tokenlari                           (85-bob)
  □ Bog'liqliklar yangilanishi va zaifliklar                                  (76-bob)
  □ 100% bo'lgan feature flag'lar o'chirildimi?                               (80-bob)
  □ Fitness function baseline kichrayyaptimi?                                 (83-bob)
  □ Texnik qarz ro'yxati: eng yuqori "foizli" qarz rejalashtirilganmi?        (83-bob)
  □ ADR'lar: qayta ko'rish sharti bajarilganlari bormi?                       (84-bob)
  □ Jamoa tuzilmasi va arxitektura hali mosmi?                                (81-bob)

Hodisadan keyin (postmortem, aybsiz):
  □ Nima bo'ldi, qanday aniqlandi, qancha vaqt ketdi?
  □ Nega tizim buni oldini olmadi? (odam emas — jarayon va arxitektura)
  □ Qaysi o'zgarish takrorlanishni to'xtatadi — va u kimga, qachongacha?
```

## 6. AI feature uchun qo'shimcha

```text
  □ Model chaqiruvi faqat backend orqali; kalit frontend'da yo'q             (85-bob)
  □ Streaming yoki fon ishi; timeout, fallback, degradatsiya                  (85-bob)
  □ Tuzilgan chiqarma sxema bilan tekshiriladi                                (85-bob)
  □ Kvota, max_tokens, xarajat logi va alert                                  (85-bob)
  □ RAG: ruxsat filtri qidiruvda, indeks yangilanadi, eval to'plami bor       (86-bob)
  □ Vositalar tor, avtorizatsiya ichida, yozish — tasdiq bilan, idempotent   (87-bob)
  □ "Xavfli uchlik" yo'q; model javobi sanitizatsiya qilinadi                 (88-bob)
  □ Provayderga ketadigan shaxsiy ma'lumot minimallashtirilgan                (88-bob)
```

## Framework'larda

Har framework kitobining o'z yakuniy ro'yxati bor — ular shu ro'yxatni aniq kod darajasida to'ldiradi:

| Kitob | Qayerda |
| --- | --- |
| Symfony | [40-bob: Deploy va checklist](../symfony/40-deploy-va-checklist.md) |
| Laravel | [33-bob: Keyingi qadamlar](../laravel/33-keyingi-qadamlar.md) |
| Vue | [70-bob: Checklist va migratsiya](../vue/70-checklist-va-migratsiya.md) |
| React | [50-bob: Checklist](../react/50-checklist.md) |
| Angular | [78-bob: Amaliy loyiha](../angular/78-amaliy-loyiha.md) |
| Next.js | [50-bob: Amaliy loyiha](../nextjs/50-amaliy-loyiha.md) |

## Kitob oxirida

Arxitektura — o'qib tugatiladigan fan emas. Bu kitobdagi har bob bitta savol beradi: **"bu yerda qanday trade-off bor va mening kontekstimda qaysi tomoni muhimroq?"** Javobni hech qaysi kitob, framework yoki AI sizning o'rningizga bermaydi — lekin to'g'ri savolni bilsangiz, javobni topish ancha oson.

Keyingi qadam: o'z loyihangizdan bitta qarorni tanlang, 84-bobdagi shablon bo'yicha ADR yozing va jamoa bilan muhokama qiling.

## Manbalar

- Atul Gawande — *The Checklist Manifesto*
- Google SRE Workbook — *Postmortem Culture* <https://sre.google/workbook/postmortem-culture/>
- Mark Richards, Neal Ford — *Fundamentals of Software Architecture*
- Gregor Hohpe — *The Software Architect Elevator*

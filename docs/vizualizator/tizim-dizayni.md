# "Tizim dizayni darslari" — qadamli hikoya va jonli sxema (reja)

Holat: **reja** (2026-11-18). Umumiy dvigatel, dizayn, ovoz va testlar — [README.md](README.md). Bu yerda faqat shu
vizualizatorga xos narsalar.

Namuna — Designed to Scale (README 1.2). Bizning versiyaning asosiy farqlari:

1. **Raqamlar halol.** Har metrika yonida manbasi bor:
   - **o'lchangan** — VPS'dagi laboratoriyada haqiqiy nginx, PostgreSQL, Redis va hokazo bilan, sana va asbob ko'rsatiladi;
   - **model** — `arxitektura-simulyator` dagi kabi ochiq `TAXMIN`.

   Namunada raqamlar manbasiz.
2. **Ovoz** — har qadam o'qiladi, oqim va metrikalar ovozga sinxron.
3. **Namunada "coming soon" bo'lgan narsalar bizda bor:**
   - "Design Lab" o'rnida — mavjud **simulyator** (`/arxitektura/trenajor`);
   - "Practice" o'rnida — mavjud **mashqlar** (`src/arxitektura/mashqlar.js`) + yangi "bashorat qiling" savollari;
   - "Cheatsheets" o'rnida — Arxitektura kitobining 104-bobi (checklist) va darslar xulosalari.
4. **Kitob bilan bog'liq.** Darslar Arxitektura kitobining IX–X qismlari (90–104) va SQL, Redis, RabbitMQ, Kafka,
   Xabar tizimlari boblariga ulanadi.

Sahifa: `/arxitektura/darslar` (ro'yxat), `/arxitektura/darslar/<dars>/<qadam>`. Yorliqlar: **Darslar · Laboratoriya ·
Mashqlar · Shpargalka**.

---

## 1. Ekran

### 1.1. Joylashuv (README 3.4 qobig'i)

| Joy | Tarkib |
| --- | --- |
| Chap | kurs daraxti: modullar (2-bo'lim), har modulda `2/5`, darslar (o'tilgani ✓); pastda umumiy progress "7 / 24" |
| Markaz tepasi | yo'l ("Masshtab / 2-dars / 5"), sarlavha, chiplar (`12 daqiqa`, `boshlang'ich`, `12 qadam`, **🔊 ovozli**), bir qatorli shior |
| **Metrikalar qatori** | 3–5 karta (1.3) |
| Sahna | tizim sxemasi (1.2); o'ng yuqorida Qayta / Pauza / to'liq ekran; pastda afsona |
| Pastda | qadamlar relsi (raqam + qisqa nom; mobilda faqat raqamlar, joriysining nomi ostida) |
| O'ng | qadam kartasi (1.4) + "Siz o'rganasiz" (qadam o'tgan sari ✓) |

### 1.2. Sahna

**Tugunlar** (README 3.3, tekis uslub; ikonka + nom + kichik izoh):

- foydalanuvchilar (ikonka + soni: "200 000 foydalanuvchi");
- telefon/brauzer;
- CDN, load balancer, ilova serveri (×N), kesh, baza (asosiy / replika / shard), navbat, broker (exchange, topic),
  worker, tashqi API.

**Teglar** tugun ustida:

- bandlik chizig'i va foiz (yashil < 70%, sariq < 90%, qizil ≥ 90% — `Sxema.vue` dagi chegaralar bilan bir xil);
- "23 ta navbatda", "yiqildi", "standby", "lider", "kechikish 2 s".

**Oqimlar** — chiziq bo'ylab nuqtalar. Turlari (shakl + rang, README 3.2):

| Tur | Shakl |
| --- | --- |
| so'rov | to'liq doira, `--info` |
| javob | to'liq doira, `--success` |
| og'ir so'rov | kvadrat, `--warning` |
| health check | bo'sh doira, `--insight` |
| kesh topilmadi (miss) | yarim doira, `--warning` |
| yozish / replikatsiya | romb, `--insight` |
| xato | ✕, `--danger` |

- Zichlik yuklamaga mutanosib, lekin bir vaqtda ≤ 150 nuqta (README 4.8).
- **Sahna ustidagi kartalar:**
  - "Hisob" — namunadagi napkin math. Mono shriftda formula qatorlari, oxirgi qator yashil fonda;
  - "Vaqt qayerga ketdi" jadvali;
  - "Solishtirish" — oldin/keyin, ikki ustun.
- **Qadamdan qadamga o'tish:**
  - yangi tugun paydo bo'ladi (`opacity` + kichik siljish);
  - olib tashlangani xiralashib yo'qoladi;
  - yiqilgan tugun kulrang bo'lib, ✕ bilan belgilanadi;
  - chiziq qayta yo'naltirilsa, oqim yangi chiziqqa silliq o'tadi.

### 1.3. Metrikalar qatori

- Har dars o'z metrikalarini tanlaydi. Masalan:
  - load balancing: foydalanuvchilar, so'rov/s, p95, xatolar, sog' serverlar;
  - so'rov yo'li: DNS, ulanish, server, yuklash, jami.
- Qiymat o'zgarganda raqam silliq almashadi. Chap chet rangi — holat (yaxshi / ogoh / yomon).
- **Manba nishoni** har kartada:
  - `o'lchangan` — ustiga kelinsa: "VPS laboratoriyasi, 2026-11-.., oha 1.x, 60 s yuklama";
  - `model` — ustiga kelinsa: "taxminiy model — arxitektura-simulyator/README.md".

  Nishon tooltip'i `src/qisqartma.js` uslubida ekran chetidan chiqmaydi (`CLAUDE.md` UI qoidasi).
- Qadamda yangi qo'shilgan metrika (masalan, "Kesh topish ulushi") paydo bo'lishi bilan ajralib turadi.

### 1.4. Qadam kartasi

| Element | Tafsilot |
| --- | --- |
| Nishon | **muammo** (`--danger-soft`), **sozlash** (`--bg-sunken`), **texnika** (`--info-soft`), **tushuncha** (`--insight-soft`), **keys** (`--warning-soft`), **xulosa** (`--success-soft`) |
| Sarlavha | qisqa, ish fe'li bilan ("Navbat bilan aylanish: round robin") |
| Matn | 2–3 qisqa paragraf; atamalar birinchi uchraganda izohlanadi va asli qavsda (`CLAUDE.md` til qoidasi); ovozda o'qilayotgan so'z belgilanadi |
| Callout | **asosiy g'oya** / **bilib qo'ying** / **ehtiyot bo'ling** |
| Nima o'zgardi | `+` qo'shildi, `~` o'zgardi, `−` olib tashlandi; raqamlar "36% → 97%" |
| **Bashorat qiling** (ixtiyoriy) | keyingi qadamdan oldin savol: "Agar B server yiqilsa, LB nima qiladi?" — 2–3 javob; tanlangach keyingi qadam ochiladi va to'g'ri javob ko'rsatiladi. Namunada bu yo'q. Javob progress'ga yoziladi |
| Bobda batafsil | "Arxitektura, 92-bob" havolasi |
| Tugmalar | ← Orqaga · "Keyingi: Og'ir so'rovlar →"; tagida tugmalar eslatmasi (`←` `→` qadam, `R` qayta, `Space` pauza) |
| Oxirgi qadam (xulosa) | ✓ ro'yxat (asosiy g'oyalar), "Laboratoriyada sinang" (1.5), "Keyingi dars" kartasi |

### 1.5. Laboratoriya (mavjud simulyator) bilan bog'lash

- Dars oxirida **"Laboratoriyada sinang →"**: `/arxitektura/trenajor?preset=<dars>`. Simulyator darsning oxirgi sahnasiga
  mos sozlama bilan ochiladi (masalan, 3 server, LB, health check).
- Buning uchun `ArxitekturaTrenajorPage.vue` ga **`preset` query** qo'llovi qo'shiladi (kichik o'zgarish; presetlar
  `src/arxitektura/presetlar.js` da).
- Keyinroq (alohida PR) simulyatorning `Sxema.vue` si yangi `SahnaSvg.vue` ga o'tkaziladi. Shunda dars va laboratoriya
  bir xil ko'rinadi. Model (`model.js`) o'zgarmaydi.

### 1.6. Mashqlar va Shpargalka yorliqlari

- **Mashqlar:**
  - mavjud `mashqlar.js` (simulyator topshiriqlari);
  - har darsning "bashorat qiling" savollari;
  - bob "Amaliyot" bo'limlaridagi savollar (havola bilan, matn ko'chirilmaydi).
- **Shpargalka:** har modul uchun bir sahifa — darslar xulosa qadamlaridan avtomatik yig'iladi + 104-bob checklist'iga
  havola.
  - **Raqamlar jadvali** (kechikishlar va hokazo) faqat **o'lchangan yoki rasmiy hujjatdan olingan** qiymatlardan
    tuziladi. Internetdagi mashhur "har dasturchi bilishi kerak bo'lgan raqamlar" ro'yxati rasmiy manba emas —
    ishlatilmaydi.
  - Laboratoriyada o'lchangan raqamlar sana bilan beriladi.

---

## 2. Darslar ro'yxati (modullar)

Qoida: dars faqat kitoblarimizda **bobi bor** mavzu bo'yicha. Bob raqamlari `content/*/README.md` dan, 2026-11-18.

| Modul | Dars | Bob(lar) | Metrika manbasi (reja) |
| --- | --- | --- | --- |
| **1. Poydevor** | So'rov yo'li va vaqt byudjeti | Web asoslari 01; Arxitektura 90 | o'lchangan (curl `-w` vaqtlari, paket-lab) |
| | Kechikish va o'tkazuvchanlik | Arxitektura 90 | o'lchangan (oha/wrk) |
| | Taxminiy hisob (QPS, saqlash, tarmoq) | Arxitektura 90 | hisob (formula, kirish ma'lumoti ochiq) |
| **2. Masshtab** | Vertikal va gorizontal, stateless | Arxitektura 91 | o'lchangan |
| | Load balancing | Arxitektura 92; Nginx | o'lchangan (nginx upstream) |
| | Kesh | Arxitektura 25; Redis | o'lchangan (Redis + PostgreSQL) |
| | CDN va chekka kesh | Arxitektura 93; Web asoslari 11 | o'lchangan (nginx kesh + netem) / model |
| **3. Ma'lumot** | Indeks: nega so'rov sekin | SQL 41–42 | o'lchangan (`EXPLAIN ANALYZE`) |
| | Replikatsiya | Arxitektura 94; SQL (replikatsiya bobi bo'lsa) | o'lchangan (PostgreSQL streaming replica, lag) |
| | Sharding va consistent hashing | Arxitektura 95 | model + hisob |
| | Baza oilasini tanlash | Arxitektura 96 | — (qaror daraxti, metrikasiz) |
| | CAP va PACELC | Arxitektura 97 | ⚑ — haqiqiy bo'linishni ko'rsatish usuli tekshiriladi (masalan, RabbitMQ quorum navbat yoki Kafka KRaft bilan, `docker network disconnect`) |
| | Taqsimlangan ID | Arxitektura 98; SQL 39 | o'lchangan (`uuidv7()` tartibi) |
| **4. Aloqa** | Navbat va fon ishlari | Arxitektura 26; Xabar tizimlari 01–02; RabbitMQ | o'lchangan (RabbitMQ) |
| | Yetkazish kafolatlari va tasdiq | Xabar tizimlari 04–07 | o'lchangan (consumer o'ldiriladi, takror ko'rinadi) |
| | Pub/sub va hodisalar | Arxitektura 27; Kafka | o'lchangan (Kafka consumer group) |
| | Fan-out va lenta | Arxitektura 99–100 | model + hisob |
| **5. Ishonchlilik** | Rate limiting | Arxitektura 30, 67; Nginx | o'lchangan (nginx `limit_req`, 429/503) |
| | Idempotentlik va qayta urinish | Arxitektura 70; Xabar tizimlari 07 | o'lchangan |
| | Server yiqilsa: N+1 va failover | Arxitektura 92, 94 | o'lchangan |
| **6. Butun tizimlar** | Keys: WhatsApp — millionlab ulanish | Arxitektura 101 | model + hisob (rasmiy manbadagi raqamlar bilan) |
| | Keys: Uber — haydovchi topish | Arxitektura 102 | model + hisob |
| | Amaliy keys: e-commerce boshidan oxirigacha | Arxitektura 103 | aralash (har karta o'z nishoni bilan) |

Kitoblarda bobi yo'q mavzular (masalan, service discovery, kuzatuvchanlik) — namunada bor bo'lsa ham bizda dars
**qilinmaydi**, avval bob yozilishi kerak. Bu egasiga alohida aytiladi.

---

## 3. Haqiqiy o'lchov — `tizim-lab/` (VPS)

[paket-yoli.md](paket-yoli.md) 3.1 dagi laboratoriya bilan bir xil infratuzilma (Docker Compose, `internal` tarmoq,
router'da `netem`), boshqa servislar to'plami bilan:

```text
yuklama generatori (oha yoki wrk)  ─▶  nginx (LB, limit_req, kesh)  ─▶  ilova ×3 (kichik HTTP servis)
                                                                      ├─▶ Redis (kesh)
                                                                      ├─▶ PostgreSQL asosiy ─▶ replika
                                                                      └─▶ RabbitMQ / Kafka ─▶ worker ×N
```

- **Ilova** — eng kichik HTTP servis. Endpoint'lar:
  - `/tez` (5 ms);
  - `/ogir` (sozlanadigan CPU ishi);
  - `/mahsulot/:id` (bazadan, keshli/keshsiz);
  - `/yoz` (navbatga).

  Kodi `tizim-lab/ilova/` da. Til — kitoblarimizda bor biri; tanlov egasiga (5-bo'lim).
- **Har qadam = o'lchov ssenariysi:** `tizim-lab/ssenariy/<dars>/<qadam>.sh`. Masalan, LB 4-qadami: "uch server,
  round robin, har uchinchi so'rov `/ogir`, 60 s, 200 so'rov/s".
- **Metrikalar yig'ish:**
  - yuklama generatorining natijasi (p50, p95, so'rov/s, xatolar);
  - nginx `$upstream_addr` / `$upstream_response_time` logi — qaysi serverga nechta so'rov;
  - `docker stats` (CPU);
  - PostgreSQL `pg_stat_replication` (lag);
  - Redis `INFO stats` (hit/miss);
  - RabbitMQ HTTP API (navbat uzunligi).
- **Chiqish:** `src/sahna/tizim/olchovlar/<dars>.json` — har qadam uchun metrikalar + `{ asbob, versiya, sana, ssenariy }`.
  Dars faylidagi `metrikalar` qiymat yozmaydi, shu faylga havola qiladi. Raqam qo'lda yozilmaydi.
- **Oqim animatsiyasi** o'lchovga bog'lanadi:
  - nuqtalar zichligi so'rov/s'ga mutanosib;
  - LB qaysi serverga yuborishi — haqiqiy upstream logidagi ketma-ketlikdan (namuna sifatida birinchi N ta so'rov).

  Shunda round robin'ning "A, B, C, A…" tartibi va least_conn'ning notekis taqsimoti haqiqiy logdan ko'rinadi.

### 3.1. Rasmiy hujjat bilan aniq bo'lish kerak bo'lgan joylar

Bu "taxmin qilinmaydi" qoidasiga misollar — yozishdan oldin rasmiy hujjatdan tekshiriladi:

- nginx (ochiq manba) da **faol health check yo'q**. `health_check` direktivasi — NGINX Plus'da. Ochiq nginx'da passiv
  tekshiruv (`max_fails`, `fail_timeout`) bor. Dars buni aniq ko'rsatadi: yiqilgan server birinchi xatodan keyin
  chiqariladi, oldindan emas.
- `least_conn`, `ip_hash`, `hash … consistent` — nginx upstream modul hujjatidan.
- PostgreSQL replikatsiya rejimlari (`synchronous_commit`) — rasmiy hujjatdan.
- LB'ning o'zi yiqilishi (standby, VRRP/keepalived) — ⚑, laboratoriyada sinab bo'lmasa model bilan ko'rsatiladi va
  ochiq aytiladi.

### 3.2. Model ishlatiladigan joylar

Millionlab foydalanuvchi, 20 mln ulanish, global CDN — laboratoriyada o'lchab bo'lmaydi. Bunday qadamlarda:

- metrika kartasida `model` nishoni;
- "Hisob" kartasida formula va kirish ma'lumotlari ochiq (masalan, "50 mln × 40 xabar ÷ 86 400 s");
- kirish raqamlari rasmiy manbadan (kompaniyaning rasmiy muhandislik blogi yoki hujjati, havola bilan) yoki darsdagi
  faraz deb aniq aytiladi.

---

## 4. Namunaviy dars — "Load balancing" (12 qadam)

| # | Qisqa | Nishon | Sahna / metrikalar | Asosiy fikr |
| --- | --- | --- | --- | --- |
| 1 | Bitta server | muammo | foydalanuvchilar → 1 server, bandlik 97%, p95 yuqori | bitta server to'ldi |
| 2 | Yana serverlar | sozlash | 3 server qo'shildi, lekin hamma oqim hali 1-serverga | serverlar bor, "eshik" yo'q |
| 3 | LB qo'shish | texnika | nginx LB, oqim uchga bo'lindi | bitta kirish nuqtasi |
| 4 | Round robin | texnika | upstream logidan A, B, C, A… ketma-ketligi | navbat bilan, arzon va adolatli |
| 5 | Og'ir so'rovlar | muammo | har 3-so'rov og'ir, B ga to'planadi (o'lchangan p95 ↑) | round robin ishni emas, so'rovni sanaydi |
| 6 | Least conn | texnika | `least_conn` → bandlik tekislandi | eng bo'sh serverga |
| 7 | Bashorat | — | "B yiqilsa nima bo'ladi?" | — |
| 8 | Server yiqildi | muammo | B to'xtatildi, ba'zi so'rovlar xato (o'lchangan %) | passiv tekshiruv: birinchi xatodan keyin |
| 9 | max_fails | texnika | `max_fails`/`fail_timeout` → B chiqarildi, xatolar 0 | ochiq nginx'da tekshiruv shunday ishlaydi |
| 10 | LB yagona nuqta | muammo | LB'ning o'zi yiqilsa — hammasi to'xtaydi (⚑ model) | SPOF |
| 11 | Yo'l bo'yicha | texnika | `/api` va `/static` turli guruhlarga (L7) | L7 marshrutlash |
| 12 | Xulosa | xulosa | — | ✓ ro'yxat, Laboratoriya, keyingi dars "Kesh" |

Ovoz: har qadam ~40–70 so'z. Langarlar:

- 4-qadam — "birinchisi A ga {o1}, keyingisi B ga {o2}…";
- 8-qadam — "B o'chdi {x1}".

Bob: Arxitektura 92 + Nginx (upstream). Laboratoriya preset: `lb-3-least-conn`.

---

## 5. Ochiq savollar (egasiga)

1. **Laboratoriya ilovasi tili** — Node.js, PHP yoki boshqa? Tavsiya: Node.js. Sabablari: kichik, tez yoziladi,
   RabbitMQ va Kafka kitoblaridagi klientlar bilan mos.
2. **Bashorat savollari** — har darsda 1–2 ta bo'lsinmi? Javobni progress'ga yozish kerakmi?
3. **Joylashuv** — `/arxitektura/darslar` (Arxitektura kitobi ichida) yoki alohida "Tizim dizayni" bo'limi bosh
   sahifada? Tavsiya: kitob ichida, bosh sahifadagi "Vizual darslar" kartasidan ham havola.
4. **Kitobda bobi yo'q mavzular** (service discovery, kuzatuvchanlik, saga alohida) — avval bob yozilsinmi yoki shu
   ro'yxat bilan cheklanamizmi?

---

## 6. Bosqichlar

1. Umumiy dvigatel MVP (README 8) bilan birga **"So'rov yo'li va vaqt byudjeti"** darsi:
   - metrikalar `paket-lab` dagi curl `-w` o'lchovidan;
   - keyslar: "sekin so'rov" (indekssiz PostgreSQL, `EXPLAIN ANALYZE`) va "uzoq foydalanuvchi" (netem 150 ms).
2. `tizim-lab/` (VPS): ilova, nginx LB, o'lchov ssenariylari va `olchovlar/*.json` generatori. "Load balancing" darsi.
3. Ovoz — ikki dars, egasi tinglaydi.
4. Simulyatorga `preset` va "Laboratoriyada sinang".
5. 1–2-modullarning qolgan darslari, keyin 3–6-modullar. Bitta PR = 2–3 dars.
6. Mashqlar va Shpargalka yorliqlari; simulyator `SahnaSvg` ga o'tkaziladi.

# Keyingi ishlar va hozirgi holat

Oxirgi yangilanish: **2026-11-13**. Bu fayl — ishga qaytganda (yoki yangi sessiya / boshqa kompyuterda) hozirgi holatga tez kirish
uchun. Avval shu faylni, keyin `CLAUDE.md` va `docs/ish-holati.md` ni o'qing. Kitoblar bo'yicha batafsil tarix —
`docs/ish-holati.md` da; bu yerda — hozir nima bor, nima ochiq qoldi, qaror kutayotganlar va keyingi rejalar.

## 1. Qisqa holat (2026-11-13)

- **Kitoblar:** rejadagi kitoblarning hammasi yozilgan (Linux, Docker, SQL, Nginx, Web asoslari, Redis, RabbitMQ, Kafka,
  Xabar tizimlari, Git va boshqalar). Istisnolar:
  - JavaScript — egasining qarori bilan **to'xtatilgan** (1–56 main'da, 57–60 `docs/javascript-40` branch'ida, merge qilinmagan);
  - Server xavfsizligi — 9–18-boblar (SSH/firewall) va 24-bob egasining tasdig'ini kutadi;
  - Deploy amaliyoti — bir qator boblar egasining qarorini kutadi (3-bo'limga qarang).
- **Trenajorlar:** 2026-11-12..13 da uchta yangi trenajor yozildi va saytga chiqdi — **RabbitMQ**, **HTTP laboratoriyasi**
  (Web asoslari), **Redis**. Hammasi brauzerda (v86) haqiqiy dastur bilan ishlaydi, simulyator emas.
- **CI/deploy:** trenajor tasvirini yig'ishdagi tasodifiy xato topildi va tuzatildi (4-bo'lim). Oxirgi deploy (#234) muvaffaqiyatli,
  qolgan ikki tuzatish — **PR #235** (merge kutilmoqda).

## 2. Saytdagi trenajorlar

| Trenajor | Sahifa | Nima ishlaydi | Kod | Tasvir (CI) |
| --- | --- | --- | --- | --- |
| Linux | `/linux/trenajor` | Debian 12 + systemd | `src/views/LinuxTrenajorPage.vue` | `linux-trenajor/` |
| Git | `/git/trenajor` | brauzerda haqiqiy git | `src/views/TrenajorPage.vue` | — |
| SQL | `/sql/trenajor` | PostgreSQL va SQLite | `src/views/SqlTrenajorPage.vue` | — |
| Nginx | `/nginx/trenajor` | nginx 1.31.8 + "So'rov yo'li" | `src/views/NginxTrenajorPage.vue`, `src/nginx/` | `nginx-trenajor/` |
| **RabbitMQ** | `/rabbitmq/trenajor` | RabbitMQ 4.4.0, Erlang/OTP 28.5.0.8 | `src/views/RabbitmqTrenajorPage.vue`, `src/rabbitmq/` | `rabbitmq-trenajor/` |
| **HTTP laboratoriyasi** | `/web-asoslari/trenajor` | nginx 1.31.8 + curl 7.88.1 (nginx tasvirida) | `src/views/WebTrenajorPage.vue`, `src/web/` | nginx tasviri + `web-trenajor/lab/` |
| **Redis** | `/redis/trenajor` | Redis 8.10.3 | `src/views/RedisTrenajorPage.vue`, `src/redis/` | `redis-trenajor/` |
| Vue, React | `/vue/trenajor`, `/react/trenajor` | iframe'da haqiqiy framework | `src/views/KomponentTrenajorPage.vue` | — |
| FSD | `/fsd/trenajor` | haqiqiy Steiger | `src/views/FsdTrenajorPage.vue` | — |
| Tizim dizayni | `/arxitektura/trenajor` | simulyator (bu yerda haqiqiy tizim emas) | `src/views/ArxitekturaTrenajorPage.vue` | — |

> SPA sahifalari to'g'ridan-to'g'ri ochilganda GitHub Pages HTTP **404** kodini qaytaradi va `404.html` orqali sahifani
> baribir ochadi — bu normal (eski Linux trenajori ham shunday). Trenajor fayllari (`*/holat.zst`) **200** qaytarishi kerak.

### 2.1. RabbitMQ trenajori — `rabbitmq-trenajor/README.md`

- Erlang VPS/CI'da Docker (linux/386) bilan manbadan yig'iladi; RabbitMQ — rasmiy generic UNIX arxivi, GPG imzosi tekshiriladi.
- VM ichida `rmq-boshqaruv` (Python + pika) ikkinchi serial port (ttyS1) orqali sahifa bilan JSON kanal: panel buyruqlari,
  holat (HTTP API, har soniyada; tayyor sonlar — passive `queue.declare` bilan aniq), firehose (`amq.rabbitmq.trace`).
- Sahifa: namuna topologiya (`buyurtmalar` + AE, `email`/`sms`/`audit`, DLX → DLQ), tez panel (exchange turi, test xabarlari
  `x-trenajor: xato|poison`, consumer offline, **haqiqiy** broker restart), kartochkali oqim, jarayon qadamlari, metrikalar,
  Python kodi (VM terminalida ishga tushadi), 11 ta mashq.
- **Animatsiya tartibi** (egasi topgan xato, tuzatilgan): consumer'ga o'tish xat navbatga yetgandan keyin; navbat sonlari xat
  yetganda o'zgaradi. Test: `rabbitmq-trenajor/test/ketmaketlik.mjs` (5 ssenariy; eski kodda hammasi yiqiladi).
- Testlar: `test/kanal.mjs`, `brauzer.mjs`, `mashq.mjs`, `ketmaketlik.mjs`, `yuklash.mjs`.

### 2.2. HTTP laboratoriyasi — `web-trenajor/README.md`

- Alohida tasvir yo'q: nginx trenajori tasviri. Sahifa ochilganda `web-trenajor/lab/` fayllari VM'ga yoziladi va
  `sozla.sh` bajariladi: nginx 8080-portda mavzular bo'yicha manzillar (redirect, kesh/ETag, cookie, Basic auth, CORS,
  gzip, Range, sekin javob), `/etc/hosts` da `api.test`, `sayt.test`.
- Har so'rov — haqiqiy `curl -v -w '%{json}'` (ttyS1 orqali, `yuritma.sh`). So'rov yo'li (Klient → DNS → TCP → Server,
  redirectlar alohida qator, vaqt chizig'i), "Nima bo'ldi?", xom xabarlar (sarlavha izohi), Network paneli, cookie'lar,
  8 ta mashq.
- Testlar: `web-trenajor/test/lab.mjs`, `mashqlar.mjs` (8/8), `brauzer.mjs`.

### 2.3. Redis trenajori — `redis-trenajor/README.md`

- Redis 8.10.3 i386 uchun Docker'da manbadan (`make -C src` — faqat Redis'ning o'zi). **Redis 8 modullari (JSON, Search,
  TimeSeries, Bloom) yo'q** — Rust talab qiladi; asl `redis.conf` dagi `loadmodule` qatorlari izohga aylantirilgan.
  Shuning uchun kitobning 11-bobi (JSON) trenajorda sinalmaydi.
- VM ichida `redis-boshqaruv` (Python + redis-py): panel buyruqlari (javoblar redis-cli ko'rinishida — `response_callbacks`
  o'chirilgan), kalitlar holati, **xom MONITOR** (redis-py `monitor()` argumentlarni probel bilan qo'shib yuboradi — shuning
  uchun o'zimiz o'qiymiz), keyspace bildirishnomalari, haqiqiy Pub/Sub obunachilari; soniyasiga 40 tadan ortiq hodisa sanab
  o'tiladi (EVAL bilan minglab kalit yozilganda kanal tiqilmasin).
- Sahifa: kalitlar xaritasi (har tur o'z shaklida, TTL halqasi, "arvoh" kartochkalar), buyruq paneli, oqim, statistika
  (hit/miss, evict), Pub/Sub, 10 ta mashq.
- Testlar: `redis-trenajor/test/kanal.mjs`, `mashqlar.mjs` (10/10), `brauzer.mjs`, `yuklash.mjs`.

## 3. Ochiq ishlar va qaror kutayotganlar

### 3.1. Egasidan kutilayotgan qarorlar

1. **PR #235 ni merge qilish** — stage2'ning asl sababini tuzatadi (4-bo'lim). Usiz chala tasvir yana tasodifan chiqishi
   mumkin (#234 uni faqat ushlab, deploy'ni to'xtatadi).
2. **Server xavfsizligi trenajori** — A yoki B (3.3-bo'lim).
3. **"Pastga qarab" seriya** — tajriba zanjirini boshlashmi (5-bo'lim).
4. **Deploy amaliyoti:** Deploy 03 va Server xavfsizligi 9–18 uchun provayder konsoli (VNC/rescue) tayyorligini tasdiqlash;
   GitHub Actions boblari (Deploy 04, 09–15, 19, 21, 22) uchun sinov repozitoriysi.
5. **`docs/javascript-40` branch'i** (JS 57–60-boblar) — o'chirish yoki saqlash.
6. Ishdan keyin noutbukda: `sudo pmset -a disablesleep 0` (uyquni qayta yoqish).

### 3.2. Trenajorlar navbati

Egasining tartibi: Web asoslari ✓ → Redis ✓ → **Server xavfsizligi** → RabbitMQ ✓ (navbatdan oldin qilindi). Docker —
keyinga qoldirilgan (simulyator emas, real sinab ko'rish yo'li izlanadi).

### 3.3. Server xavfsizligi trenajori — to'siqlar va variantlar

- **Yadroda firewall yo'q:** v86 VM yadrosida `nftables`/`iptables` yo'q (tarmoq faqat `lo`) — `ufw` va `fail2ban` haqiqiy
  ishlay olmaydi. AppArmor ham yadro qo'llab-quvvatlashini talab qiladi.
- **Distributiv farqi:** kitob Ubuntu 26.04 ga tayanadi (OpenSSH 10.2, ufw 0.36.2 …), trenajor tasvirlari — Debian 12
  (OpenSSH 9.2).
- **SSH/firewall boblari (9–18)** hali yozilmagan.
- **A:** firewall va fail2ban'siz qisqartirilgan doira — sudo/foydalanuvchilar, fayl huquqlari, `unattended-upgrades`
  sozlamalari, restic zaxira/tiklash, etckeeper, "kim kirdi" (`last`, `journalctl`), `sshd_config` (lokal sshd, loopback).
  Debian 12; versiya farqi sahifada ochiq yoziladi.
- **B:** hozircha qilmaslik.

### 3.4. Trenajorlarni yaxshilash g'oyalari (qilinmagan)

- RabbitMQ: headers exchange binding argumentlarini tez panelda tahrirlash; stream navbatni alohida (offset bilan) chizish;
  consumer'ga nom berib qo'shish tez panelda; namunadagi kabi ovoz/tezlik.
- HTTP laboratoriyasi: HTTPS/TLS (o'z sertifikati, `openssl` paketi kerak) va HTTP/2 (`h2c`); hozir faqat HTTP/1.1.
- Redis: Lua skript muharriri; `WATCH` bilan optimistik qulf mashqi (ikki mijoz kerak — ikkinchi "panel" ulanishi); replikatsiya
  (ikkinchi `redis-server` VM ichida).
- Hammasida: mobil ko'rinishda sxemalar soddalashadi (chiziqlar yashiriladi) — telefonda alohida tekshirilmagan.

## 4. Trenajor tasvirini yig'ish quvuri — saboqlar (muhim)

Barcha VM trenajorlari bitta quvur bilan yig'iladi: `TRENAJOR_PROFIL=<nom> sh linux-trenajor/scripts/yigish.sh`
(stage1 — Debian paketlari, stage2 — emulyator ichida dpkg + profilning `qoshimcha.sh`, so'ng holat surati `holat.mjs`).

- **stage2'dagi tasodifiy xato (2026-11-13 da topildi):**
  1. `dpkg` stage2 davomida libc6'ni yangilaydi, `stage2.sh` esa eski, **o'chirilgan** libc bilan ishlaydi; 9p'da o'chirilgan
     faylni qayta o'qib bo'lmaydi → `segfault ... in libc.so.6 (deleted)`. Tuzatish (#235): arxivlash `exec` bilan yangi jarayonda.
  2. ~330 MB arxivni 9p (`cache=loose`) orqali yozishda 512 MB VM xotirasi tugaydi → `tar: Cannot savedir: Cannot allocate
     memory`. Tuzatish (#235): stage2 VM — 1 GB, har 48 MB bo'lakdan keyin `sync`.
  3. `tar` xatosi tekshirilmagan edi → chala tasvir → servis ishga tushmaydi → `holat.mjs` "tayyor"ni abadiy kutadi (#232
     deploy'i 6 soatlik limitda bekor qilingan). Tuzatish (#234): `tar` kodi tekshiriladi, 3 marta qayta urinish, so'ng
     `TAR_XATO` — yig'ish to'xtaydi.
  - Natija (deploy'siz CI sinovi): stage2 640 s → 333 s, RabbitMQ "tayyor" 159 s → 88 s.
- **`holat.mjs` kutish chegaralari** (#233, #234): 15 daqiqada login so'rovi, 20 daqiqada `holatKutish` signali kelmasa —
  VM ichidagi xizmatlar holati, yiqilgan/osilgan har servisning o'z jurnali (oxirgi 30 qator), xotira chiqariladi va xato
  bilan tugaydi. `HOLAT_YUKLASH_MS`, `HOLAT_KANAL_MS` bilan o'zgartirsa bo'ladi; `HOLAT_DEBUG=1` — konsol stderr'ga.
- **Deploy'siz CI sinovi:** `.github/workflows/trenajor-sinov.yml` — `sinov/**` branch'iga push qilinsa RabbitMQ trenajorini
  CI'da yig'adi, saytga hech narsa chiqarmaydi (`git push origin <branch>:sinov/<nom>`). CI'gagina xos muammolarni shu bilan
  tekshiring (CI emulyatori lokaldan ~2–3 baravar sekin).
- **Kesh kaliti:** `linux-trenajor/scripts/**` o'zgarsa, deploy **barcha** trenajorlarni keshsiz qayta yig'adi (~45–60 daqiqa).
- **GitHub Pages hajmi:** oxirgi deploy artifact'i **656 MB**, chegara 1 GB. VM trenajorlari: RabbitMQ ~206 MB, Redis ~123 MB,
  nginx ~101 MB, Linux ~95 MB. Yana ko'pi bilan 1–2 og'ir trenajor sig'adi; keyingilari uchun tasvirlarni videolar kabi
  **VPS'dan berish** (`kamgapir.uz`) yoki tasvirlarni kichraytirish kerak bo'ladi.
- Boshqa saboqlar:
  - bir vaqtda ikkita yig'ish ishlatmang (`build/` buziladi); parallel ishlayotgan VM'lar (testlar) yuklanishni juda sekinlashtiradi;
  - `vm.create_file` fayllari `600` huquq bilan yoziladi; arxivdagi konfiguratsiyalar ham `600` bo'lishi mumkin — `qoshimcha.sh` da `chmod`;
  - Erlang `erl` tekshiruvi DESTDIR ichidan ishlamaydi (`--prefix` dan qidiradi) — #232 dagi tuzatish;
  - sinov VPS'idan `download.redis.io` **403** qaytaradi — arxivni boshqa joyda yuklab `build/` ga qo'ying (CI'da muammo yo'q);
  - ttyS1 kanalida skript "tayyor"ni portni o'qish uchun ochgandan **keyin** yuborsin (aks holda birinchi buyruq yo'qoladi —
    HTTP laboratoriyasida shunday bo'lgan).

## 5. "Pastga qarab" seriya (egasining g'oyasi, 2026-11-13) — tahlil va taklif

G'oya: yuqori darajadagi kitoblardan pastga — C/C++ → Assembly → kompyuter arxitekturasi → raqamli mantiq → elektronika →
fizika → matematika. Har qatlam yuqoridagi savolga javob beradi.

| Qatlam | Rasmiy manba | Real sinov | Kutilayotgan sifat |
| --- | --- | --- | --- |
| C / C++ | ISO C23/C++23, GCC/Clang hujjatlari | VPS/trenajorda `gcc`, `gdb`, `valgrind` | juda yaxshi |
| OS (jarayon, syscall) | Linux man sahifalari, kernel.org | `strace`, `/proc` | juda yaxshi |
| Assembly | Intel SDM, AMD APM, Arm ARM, RISC-V spetsifikatsiyalari | `gdb` qadamma-qadam, `objdump`; v86 haqiqiy x86 | juda yaxshi |
| Sonlar | IEEE 754 | dastur bilan | juda yaxshi |
| Arxitektura (kesh, konveyer) | RISC-V spetsifikatsiyasi, protsessor hujjatlari | simulyator, `perf` | yaxshi |
| Raqamli mantiq | IEEE 1364/1800 (Verilog), IEEE 1076 (VHDL), mikrosxema datasheet'lari | `iverilog` simulyatori | yaxshi |
| Xotira (DRAM) | JEDEC standartlari | — | yaxshi |
| Elektronika | ishlab chiqaruvchi datasheet'lari | SPICE (`ngspice`), ixtiyoriy real o'lchov | o'rtacha–yaxshi |
| Fizika | BIPM SI broshyurasi, NIST/CODATA; nazariya — akademik manbalar (MIT OCW, OpenStax) | hisob/simulyatsiya, model chegarasi aytiladi | o'rtacha (eng ehtiyotkor qism) |
| Matematika | ISO 80000-2 (belgilar); isbot | SymPy bilan ramziy va sonli tekshiruv | yaxshi |

- **Uslub (har qatlam uchun moslashtiriladi):** bob yuqoridagi aniq savoldan boshlanadi; avval tajriba, keyin nazariya;
  har qatlamga o'z trenajori (registrlar/xotira ko'rinadigan Assembly bajaruvchisi, gate muharriri, SPICE sxemasi,
  boshqariladigan animatsiya); o'xshatish "o'xshatish" deb belgilanadi va qayerda buzilishi aytiladi; bob oxirida "yuqoriga
  qaytish" — zanjir yopiladi.
- **Xavflar:** hajm (har qatlam 30–50 bob); o'zbekcha atamalar (lug'atni oldindan kelishish); fizikadagi keng tarqalgan
  soddalashtirilgan afsonalar (masalan, "tok — elektronlarning tez yugurishi") — har son hisob bilan, har da'vo manba bilan.
- **Taklif:** avval kichik tajriba zanjiri — **"0.1 + 0.2 nega 0.3 emas?"** (JavaScript → IEEE 754 → ikkilik kasrlar, 3–4 bob),
  egasi o'qib baho beradi. Keyin **C tili** kitobi (ISO C23, trenajorda `gcc` bor), so'ng "Kompyuter qanday ishlaydi"
  (C → Assembly → protsessor → xotira). Elektronika/fizika/matematika — oxirida, alohida qoidalar bilan.

## 6. Sinov VPS va lokal artefaktlar

- VPS'dagi yig'ish papkalari (kerak bo'lmasa o'chirsa bo'ladi; arxivlar qayta yasaladi):
  - `/root/rmq-trenajor` (181 MB) — Erlang/OTP va RabbitMQ arxivlari, `build/ichki.sh`, `rmqtest.sh`;
  - `/root/rmq-ci` (133 MB) — Erlang skripti tuzatishini tekshirgan nusxa;
  - `/root/redis-i386` (24 MB) — Redis manbasi (lokaldan ko'chirilgan) va i386 arxivi;
  - `/root/nginx-i386` (2.3 MB) — nginx i386 arxivi.
- Lokal (git'da yo'q, `.gitignore`): `*-trenajor/build/` (tasvirlar), `public/{rabbitmq,redis,nginx}-trenajor` (symlink).
  Yangi kompyuterda tasvirlar `yigish.sh` bilan qayta yig'iladi; i386 arxivlari (Erlang, nginx, Redis) VPS'dan `scp` bilan
  olinadi yoki Docker bilan yig'iladi.
- Remote'dagi eski branch'lar (merge qilingan yoki sinov uchun — tozalasa bo'ladi): `sinov/rabbitmq-ci`, `sinov/stage2-tar`,
  `docs/trenajor-reja`, `feat/rabbitmq-trenajor`, `feat/web-trenajor`, `feat/redis-trenajor`. `fix/stage2-tar` — #235 merge
  bo'lgach. `docs/javascript-40` — egasining qarori bilan.
- Ishchi papkada egasining kuzatilmagan fayli bor: `b2b-distributor-ekotizim.md` (tegilmagan).

## 7. Qaytganda — tekshiruv ro'yxati

1. `git fetch && git log --oneline origin/main -10`; `gh pr list` — ochiq PR'lar (#235?).
2. `gh run list --limit 5` — oxirgi deploy o'tganmi; yiqilgan bo'lsa `gh run view <id> --log-failed` (holat.mjs diagnostikasi
   servis jurnalini ko'rsatadi).
3. Sayt: `curl -s -o /dev/null -w '%{http_code}' https://mfs1011.github.io/dev-docs/<nom>-trenajor/holat.zst` → 200.
4. 3.1-bo'limdagi qarorlarni egasidan so'rash (javob berilganlarini shu faylda yangilash).
5. Trenajor ustida ishlash: `npx vite --port 5182`, `public/<nom>-trenajor` symlink, so'ng shu trenajorning `test/` skriptlari
   (README'larida buyruqlar bor).

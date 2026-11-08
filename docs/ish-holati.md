# Ish holati (boshqa kompyuterda davom ettirish uchun)

Oxirgi yangilanish: 2026-11-07 (tun, ikkinchi noutbuk). Yangi kompyuterda ishni boshlashdan oldin shu faylni, `CLAUDE.md` ni va `docs/tts.md` ni o'qing.

## Linux kitobi (`content/linux/`)

- Mundarija: `content/linux/README.md` — 12 qism, 54 bob, har bob yonida rasmiy manba.
- **Kitob tayyor: 1–54-boblar** (I–XII qismlar).
- Keyingi ishlar — boshqa kitoblar (pastdagi "Ikkinchi noutbukda qilinadigan ishlar" va rejadagi kitoblar). Mundarijadagi qatorlar va manbalar: `content/linux/README.md`.
- Oxirgi sessiyalar nima qilgani va yangi qoidalar — pastdagi "2026-11-07 sessiyasi" bo'limlarida.
- Rasmiy manbalar: Debian Reference, Ubuntu Server docs, man sahifalari (trenajorda `MANWIDTH=100 man X | col -b`), GNU qo'llanmalari. gnu.org avtomatik so'rovlarga ko'pincha 403/429 qaytaradi — o'sha paytda man sahifalari trenajordan olinadi.

### Har bobning qoidalari

- Har da'vo rasmiy manbadan. Manbada yo'q narsa yozilmaydi yoki ochiq aytiladi.
- Har buyruq **haqiqiy muhitda** ishga tushiriladi, chiqish o'zgartirilmaydi:
  - Debian 12 — brauzer trenajori (`text` bloklar, sahifada "▶ Trenajorda" tugmasi chiqadi);
  - Ubuntu 26.04 — sinov VPS (```` ```text vps ```` bloklar, tugmasiz).
- Ikkala tizimda farq bo'lsa — "Debian va Ubuntu" bo'limida ikkala chiqish.
- Har bob tuzilishi: Tushuncha → mavzular → Debian va Ubuntu → Tipik xatolar → Amaliyot (mashq havolasi + savollar/javoblar) → Rasmiy hujjat.
- "qobiq" so'zi doim "qobiq (shell)" ko'rinishida.
- Qiyin joyga animatsiya; trenajorda bajarib bo'ladigan bobga mashq.

### Chiqishlarni olish va tekshirish

- Bobda trenajor bloklariga **faqat `$ buyruq` qatorlarini** yozing (heredoc'ning `> ` davom qatorlari ham bo'ladi), keyin:
  `node linux-trenajor/test/bob.mjs content/linux/NN-....md` — u bobdagi barcha trenajor bloklarini o'quvchi qanday bajarsa shunday, **bitta sessiyada ketma-ket** bajarib, chiqishlarni haqiqiysi bilan almashtiradi (`--tekshir` — faylga tegmasdan farqni ko'rsatadi). Keyin chiqishlarni o'qib, matnni ularga moslang.
- `bob.mjs` node'da (fayllar diskdan) ishlaydi, o'quvchi esa **brauzerda** (fayllar serverdan bittalab yuklanadi). Og'ir systemd buyruqlari brauzerda sekin yoki ishlamaydi: `systemctl list-unit-files` 25 soniyadan keyin `Connection timed out`, `systemd-analyze` birinchi marta ~14 s. Shunday buyruqlarni brauzerda alohida sinang (`/linux/trenajor`, Playwright).
- systemd buyruqlariga trenajorda `--no-pager`.

### Bob yozish tartibi (2026-11-07 dagi amaliyot)

1. Mundarija qatoridagi rasmiy sahifalarni o'qish: trenajorda `MANWIDTH=100 man X | col -bx`, VPS'da ham shunday; veb-sahifalar — `linux-trenajor/asboblar/sahifa.py URL h|a|t [naqsh]`.
2. Buyruqlarni avval sinash: trenajorda `node linux-trenajor/test/buyruq.mjs fayl.txt`, VPS'da `linux-trenajor/asboblar/vps.sh`.
3. Bobni yozish: trenajor bloklarida faqat `$ buyruq`, VPS bloklarida (` ```text vps `) va noutbuk bloklarida (` ```text tashqi `) yozib olingan haqiqiy chiqish.
4. `node linux-trenajor/test/bob.mjs content/linux/NN-....md` — trenajor chiqishlarini to'ldiradi; chiqishlarni o'qib, matnni ularga moslash.
5. `python3 linux-trenajor/asboblar/chiqish_tekshir.py bob.md yozuv.txt` — VPS/tashqi bloklardagi har qator yozuvda bormi (0 bo'lishi shart).
6. Animatsiya (`src/animatsiya/qadamlar.js`, qadamli) — buyruq va chiqishlar **to'liq va aynan**, `...` bilan qisqartirmasdan.
7. Mashq: `python3 linux-trenajor/asboblar/mashq_qosh.py m48.js`, test: `node linux-trenajor/test/mashqlar.mjs 48-...`.
8. `python3 linux-trenajor/asboblar/bob_ulash.py 48 48-fayl.md "Mundarijadagi nom"` — oldingi bobga "Keyingi", README qatori, `NN/54` sanog'i.
9. `linux-trenajor/asboblar/havola.sh bob.md` — barcha havolalar 200; Playwright bilan sahifani ochib, konsol xatosi yo'qligini tekshirish.

### Maxfiylik (VPS va noutbuk chiqishlari)

- VPS'ning ochiq IP manzili chiqishlarda va ko'rsatilgan buyruqlarda `203.0.113.10` bilan almashtiriladi, noutbukning ochiq IP'si (server loglarida) `198.51.100.20` bilan (RFC 5737). Bobda bu ochiq aytiladi (40, 43, 45–47-boblardagi kabi). `vps.sh` buni o'zi qiladi.
- `hostnamectl` — `grep -vE 'Machine ID|Boot ID|Product UUID'` bilan (machine-id(5): maxfiy).
- VPS host kalitining fingerprint'i va `known_hosts` mazmuni chiqarilmaydi: ular orqali server manzilini topish mumkin.
- Server loglaridagi admin kaliti fingerprint'i chiqarilmaydi (log `grep` bilan filtrlanadi).

### Trenajorda yo'q vositalar

`ssh`, `scp`, `rsync`, `curl`, `dig`, `nft`/`iptables`/`ufw`, ifupdown, Netplan, `resolvectl` yo'q; tarmoq faqat `lo`. Shunday boblar VPS va noutbukda sinaladi, mashqsiz (41, 43, 45–47). `systemd-analyze security` trenajorda 20+ soniya — VPS'da ko'rsatiladi.

### Mashq yozish qoidalari

- `setup` `( set -e ... )` ichida bajariladi: xato qaytarishi mumkin bo'lgan har buyruqqa `|| true`.
- Ichida `!` bor matnni qo'sh qo'shtirnoqqa olmang (bash history expansion) — `printf '%s\n' '...'`.
- `check` lar **har prompt oldidan** bajariladi — og'ir buyruq (`systemctl list-unit-files`, `journalctl` va h.k.) ishlatmang; arzon tekshiruv: fayl bormi, `pgrep`, `[ -L .../x.service ]`. Kerakli qiymatni `setup` da faylga hisoblab qo'ying.
- Fondagi server kabi kechikib tayyor bo'ladigan qadamda testga `sinov: [buyruq, 'sleep 1']`.
- Test: `node linux-trenajor/test/mashqlar.mjs <id>` (qadam kutish vaqti 45 s).

### Kod tuzilishi

| Nima | Qayerda |
| --- | --- |
| Mashqlar (Git trenajoridagi kabi tanlanadi) | `src/trenajor/linuxMashqlar.js` — `check` (bash sharti) yoki `ran` (oxirgi buyruq regex'i) |
| Animatsiyalar | `src/animatsiya/*.vue`, qadamli animatsiyalar ma'lumoti `src/animatsiya/qadamlar.js`; markdown'da `<div data-animatsiya="nom" data-nom="..."></div>`, ro'yxat `src/views/DocPage.vue` (`ANIMATSIYALAR`) |
| Trenajor sahifasi va pastki terminal | `src/views/LinuxTrenajorPage.vue`, `src/components/LinuxTerminal.vue`, `src/trenajor/linuxTerminal.js` |
| Trenajor tasvirini yig'ish | `linux-trenajor/scripts/yigish.sh` (Debian 12 i386 + systemd, v86) |
| Bob yozish yordamchilari | `linux-trenajor/asboblar/`: `sahifa.py`, `vps.sh`, `chiqish_tekshir.py`, `mashq_qosh.py`, `bob_ulash.py`, `havola.sh` |
| Kod bloki muhiti | ` ```text vps ` — VPS chiqishi, ` ```text tashqi ` — noutbukdan serverga so'rov (macOS); ikkalasida trenajor tugmasi yo'q (`src/markdown.js`, `src/views/DocPage.vue`) |
| Ovozli o'qish talaffuzlari | `scripts/talaffuz.json` (batafsil `docs/tts.md`) |

### Trenajorni lokal yig'ish va sinash

CI (`.github/workflows/deploy.yml`) trenajorni o'zi yig'adi. Lokal test uchun:

```sh
npm ci
sh linux-trenajor/scripts/yigish.sh        # python3, node >= 22.15, zstd kerak; birinchi marta uzoq
npx vite --port 5182                       # boshqa terminalda
node linux-trenajor/test/buyruq.mjs fayl.txt   # buyruqlarni trenajorda bajarib, haqiqiy chiqishni beradi
rm -rf public/linux-trenajor && cp -r linux-trenajor/build/web public/linux-trenajor   # sayt trenajorni shu yerdan oladi (CI ham shunday qiladi)
node linux-trenajor/test/mashqlar.mjs          # barcha mashqlarni brauzerda tekshiradi (yoki: ... 25-dpkg)
```

- `mashqlar.mjs` uchun `playwright-core` kerak, u `package.json` da yo'q: `npm i --no-save playwright-core && npx playwright-core install chromium-headless-shell`.
- python.org'dan o'rnatilgan Python'da `yigish.sh` `CERTIFICATE_VERIFY_FAILED` bilan yiqilsa: `SSL_CERT_FILE=/etc/ssl/cert.pem sh linux-trenajor/scripts/yigish.sh`.

`buyruq.mjs` ga UTF-8 belgilar (`‘` kabi) buzilib boradi — sinov buyruqlarida ASCII ishlating. Har ishga tushirish trenajorni toza holatdan boshlaydi.

### Trenajor cheklovlari (boblarda aytilgan)

- Internet yo'q: `apt update/install` ishlamaydi (24, 26, 27-boblar VPS'da).
- `/usr/share/doc`, man tarjimalari o'rnatilmagan; to'liq `perl` paketi yo'q, faqat `perl-base` (`deluser --remove-home` ishlamaydi, `perl -e` ishlaydi).
- 32-bitli (i386).

## Sinov VPS

- Ubuntu 26.04, faqat kitob sinovlari uchun ajratilgan. Kirish — SSH kalit bilan, root.
- **Manzil va kalit git'ga yozilmaydi** — ular egasida.
- Vaqtinchalik sinov narsalari bob tugagach o'chiriladi.
- 2026-11-07 dan egasi qo'llanma uchun **to'liq ruxsat** bergan: qayta yondirish, SSH'ni mustahkamlash, firewall, sinov servislari — har o'zgarish bobda hujjatlanadi.
- Hozirgi holat (2026-11-07):
  - VPS qayta yondirildi, yadro 7.0.0-42 (33–34-boblar);
  - `lsof`, `psmisc`, `tmux` (30, 32-boblar), `rsync` 3.4.1 (46-bob) va `shellcheck` 0.11.0 (50–51-boblar) o'rnatildi;
  - 51-bobdagi `zaxira` timer'i, skripti va `/var/backups/zaxira` sinovdan keyin o'chirilgan;
  - 54-bob uchun: `journalctl --vacuum-size=50M` (jurnal 116M → 32M) va `apt-get clean` bajarilgan; eski yadro `7.0.0-38` ataylab qoldirilgan ("qo'lda" belgilangan, zaxira yadro);
  - `salom.service` va unga tegishli hamma narsa 39-bobdan keyin o'chirildi; 43–47-boblardagi sinov servislari, `demo` foydalanuvchisi va vaqtinchalik ufw qoidalari ham o'chirilgan;
  - ufw yoqilgan: standart holatda `deny (incoming)`, provayder qoidalari 80, 443, 22 va 1500/tcp (ispmanager, unda hech narsa tinglamaydi);
  - vaqt zonasi `Europe/Moscow` (provayder), vaqtni chrony sinxronlaydi;
  - ochiq masala: provayder apt manbalarida `trusted: yes` va `http://` mirror (26-bob);
  - provayder shabloni: Netplan yo'q (ifupdown), cron yo'q, snap yo'q.

## Ikkinchi noutbukda qilinadigan ishlar

Birinchi noutbukda disk kam va Docker yo'q. Sinov VPS'ida 2 GB xotira bor: `MemTotal` 1,75 GiB, 2026-11-07 da bo'sh qismi ~1,3 GiB. Shuning uchun quyidagilar **ikkinchi noutbukda** qilinadi (xotira va disk ko'proq, Docker bor):

| Ish | Sabab | Muhit |
| --- | --- | --- |
| **Kafka** qo'llanmasi: boblar va misollar; "Xabar tizimlari"ning Kafka misollari | Broker'ni ishga tushirish skripti `kafka-server-start.sh` Java uchun standartda `-Xmx1G -Xms1G` (1 GB heap) ajratadi. VPS'dagi bo'sh xotiraga bu sig'maydi | Docker: Kafka'ning rasmiy Quick Start'idagi `apache/kafka` image. Versiya: `content/kafka/README.md` |
| **Docker** qo'llanmasi | Birinchi noutbukda Docker o'rnatib bo'lmaydi (disk) | Docker Engine yoki Desktop |

Ikkinchi noutbukda boshlashdan oldin shu faylni, `CLAUDE.md` ni va kitobning `README.md` sini (mundarija, versiyalar jadvali) o'qing. Versiyalarni yozishdan oldin qayta tekshiring.

## 2026-11-07 sessiyasi (birinchi noutbuk)

- **PR #197** (29–38-boblar) va **PR #198** (rejadagi 8 kitob mundarijasi: Web asoslari, Redis, Xabar tizimlari, RabbitMQ, Kafka, Nginx va HTTPS, Server xavfsizligi, Deploy amaliyoti — saytga "tayyorlanmoqda" holatida, logolar bilan) merge qilingan.
- Linux **39–47**-boblar yozildi (shu PR): servisni cheklash, IP/interfeys/marshrut, tarmoq boshqaruvchilari, DNS, port va ulanish, vaqt va xost nomi, SSH, fayl ko'chirish, SSH tunnel. Mashqlar: `39-cheklov`, `40-ip`, `42-hosts`, `44-vaqt`. Animatsiyalar: `bind`, `nom`, `port`, `ssh`, `tunnel`.
- Kuzatuv (rasmiy manbada mexanizmi topilmadi, bobda "kuzatildi" deb yozilgan): systemd-resolved stub'i `/etc/hosts` dagi yangi yozuvni ~3 soniyadan keyin ko'radi (42-bob).
- Rejadagi kitoblar bo'yicha egasining qarori kutilmoqda: HTTPS boblari uchun domen; RabbitMQ/Redis misollari tili (hozir Node.js, PHP muqobil); Deploy kitobidagi GitHub Actions uchun sinov repozitoriysi.

## Egasining doimiy ko'rsatmalari (birinchi noutbukdagi xotiradan)

- Haftalik limit: 90% gacha ishlash. 90% ga yetsa — joriy bobni tugatib, commit + push + PR, keyin to'xtash (chala qoldirmaslik). Boblar orasida limitni tekshirish.
- VPS: qo'llanma uchun to'liq ruxsat (qayta yondirish, SSH, firewall, sinov servislari); har o'zgarish bobda hujjatlanadi, vaqtinchaliklari tozalanadi.
- Kafka va Docker — ikkinchi noutbukda (yuqoridagi bo'lim).
- Javoblar o'zbek tilida, qisqa.

## Ish tartibi

- Har vazifa `main` dan alohida branch, PR `main` ga, merge'ni egasi qiladi. Force push yo'q.
- Commit va PR matnida AI atributsiyasi yo'q.
- Commit/push/PR faqat egasi so'raganda.
- Uzoq yozish ishlarida 5 soatlik limitni bob oralarida tekshirish; egasi aytgan chegarada joriy bobni tugatib to'xtash.

## 2026-11-07 sessiyasi (ikkinchi noutbuk)

- Noutbuk sozlandi: VPS uchun alohida kalit `~/.ssh/lab_ed25519` (git'da yo'q), `Host lab` va `VPS_IP` (`~/.zshrc`); trenajor yig'ildi.
- Linux **48–51**-boblar yozildi (PR #200, `docs/linux-48-54`): birinchi skript, shart va sikl, funksiya va xatolar, zaxira skripti. Mashqlar: `48-skript`, `49-sikl`, `50-funksiya`, `51-zaxira`. Animatsiyalar: `set-e`, `sikl`, `trap`.
- Topilgan farq: Ubuntu 26.04 dash'i `set -o pipefail` ni qabul qiladi, Debian 12 dash'i (0.5.12-2) — `Illegal option` (48-bob).
- Kuzatuv (rasmiy manbada tavsifi topilmadi, bobda "kuzatildi" deb yozilgan): `TERM` signali kelganda dash `EXIT` trap'ini bajarmaydi, bash bajaradi; dash'da `trap 'exit 143' TERM` kerak (50-bob).
- Trenajorda `du` 9p fayl tizimida hajmni noto'g'ri ko'rsatadi (122 KB fayl uchun `512`) — hajm uchun `stat -c %s` (51-bob).

- Linux **52–54**-boblar (XII qism, `docs/linux-52-54`): servis ishlamayapti, server sekin, disk to'ldi. Mashqlar: `52-servis`, `53-sekin`, `54-disk`. Animatsiyalar: `servis`, `sekin`, `disk`. `QadamliAnim` ga `keng: true` qo'shildi (keng chiqishli animatsiyalar uchun: terminal butun kenglikda, qatorlar bo'linmaydi).
- Kuzatuvlar: trenajorda disk I/O (`wa`, `bi/bo`) ko'rinmaydi — 9p blokli qurilma emas, disk tajribalari VPS'da; `journalctl --vacuum-*` chiqishida jurnal papkasi nomi = machine-id — `sed` bilan yashiriladi.
- TTS (ovoz) ishlari — birinchi noutbukda (egasining qarori, 2026-11-07).

## Ikkinchi noutbukda Linux kitobini davom ettirish

1. `git fetch origin`. PR #200 (48–51) merge bo'lgan bo'lsa — `git switch -c docs/linux-52-54 origin/main`; bo'lmagan bo'lsa — `docs/linux-48-54` ni olib, o'sha yerdan davom etish.
2. `npm ci`, `sh linux-trenajor/scripts/yigish.sh`, keyin `npx vite --port 5182` (trenajor testlari shu portga ulanadi).
3. VPS: kalitni xavfsiz yo'l bilan ko'chirish, `~/.ssh/config` ga `Host lab` (HostName, `User root`, IdentityFile, `IdentitiesOnly yes`), `export VPS_IP=...` — `linux-trenajor/asboblar/vps.sh` shularni ishlatadi.
4. `content/linux/README.md` dagi 52-qatordan boshlab, yuqoridagi "Bob yozish tartibi" bo'yicha.

## Git'da yo'q, qo'lda ko'chiriladiganlar

| Nima | Izoh |
| --- | --- |
| `.env` (`GEMINI_API_KEY`) | Faqat xavfsiz yo'l bilan |
| VPS SSH kaliti | Faqat xavfsiz yo'l bilan |
| VPS manzili | `~/.ssh/config` dagi `Host lab` va `VPS_IP` muhit o'zgaruvchisi — har kompyuterda alohida |
| `audio/`, `segments/` | `docs/tts.md` ga qarang |
| `*-REJA.md` (boshqa kitoblar rejalari) | `.gitignore` da, lokal fayllar |
| `video/REACT-VIDEO-USLUBI.md`, `video/VUE-VIDEO-USLUBI.md` | Hali commit qilinmagan |

## SQL kitobi — 47-bobdan davomi (branch `docs/sql-47-70`)

- 2026-11-08: 47–54-boblar yozildi (matn; video darslar yo'q — ular TTS bilan boshqa noutbukda qilinadi).
- Sinov muhiti (README'dagi "Sinov muhiti (47-bobdan)" qatori): PG 18.6 — Homebrew `postgresql@18` (`~/sql-sinov/pgdata`, `pg_ctl ... start`); MySQL 9.7.2 — rasmiy Docker image (`docker run -d --name mysql97 -e MYSQL_ROOT_PASSWORD=sinov -p 127.0.0.1:3306:3306 mysql:9.7.2`; Homebrew'da `mysql@9.7` endi 9.7.4); SQLite 3.54.1 — Homebrew `sqlite`.
- Ikki seansli misollar (50–54-boblar) — kichik Python skripti: buyruqlarni A/B seanslarga navbatma-navbat yuboradi va chiqishni seans nomi bilan yozadi (`~/sql-sinov/ikki.py`, git'da yo'q). Bloklangan buyruq javobi keyingi buyruq ostida chiqadi — boblarda izohlangan.
- Bob ulash: oldingi bobga "Keyingi", README qatori havolaga, `NN/70` — Linux'dagi `bob_ulash.py` ning SQL varianti (scratchpad'da edi).
- dev.mysql.com havolalari `havola.sh` da 403 qaytaradi (HEAD so'roviga), sahifalar `GET` bilan ochiladi.

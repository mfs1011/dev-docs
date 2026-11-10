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
  - Docker Engine 29.9.3 o'rnatilgan (Docker kitobi uchun, rasmiy apt repozitoriy); sinov image'lari, `/root/` dagi sinov papkalari (`hisob`, `kesh`, `ms`, `s8`–`s19`, `stack`, `salom-ilova`, `next`, `spa`, `db`, `reg`, `deploy`, `tash`); 28-bobda `image prune -a` va `builder prune -a` qilingan; ishlab turgan: `registry` (127.0.0.1:5000, unless-stopped) va `deploy-web-1` (127.0.0.1:8085) — kerak bo'lmasa `docker rm -f registry` va `cd /root/deploy && docker compose down`;
  - 54-bob uchun: `journalctl --vacuum-size=50M` (jurnal 116M → 32M) va `apt-get clean` bajarilgan; eski yadro `7.0.0-38` ataylab qoldirilgan ("qo'lda" belgilangan, zaxira yadro);
  - `salom.service` va unga tegishli hamma narsa 39-bobdan keyin o'chirildi; 43–47-boblardagi sinov servislari, `demo` foydalanuvchisi va vaqtinchalik ufw qoidalari ham o'chirilgan;
  - ufw yoqilgan: standart holatda `deny (incoming)`, provayder qoidalari 80, 443, 22 va 1500/tcp (ispmanager, unda hech narsa tinglamaydi);
  - vaqt zonasi `Europe/Moscow` (provayder), vaqtni chrony sinxronlaydi;
  - 2026-11-09 (SQL 68-bob): PHP 8.5.4 + kengaytmalar, Composer 2.11.1, PostgreSQL 18.6 o'rnatildi; `dasturchi` foydalanuvchisi, uning uyida `orm-laravel` (Laravel 13.40.0) va `orm-symfony` (Symfony 8.1.11, Doctrine ORM 3.7.6) loyihalari; PG'da `orm` roli (parol loyihalarning `.env`/`.env.local` ida), `orm` va `orm_symfony` bazalari — Laravel/Symfony kitoblari uchun ham qayta ishlatsa bo'ladi;
  - ochiq masala: provayder apt manbalarida `trusted: yes` va `http://` mirror (26-bob);
  - provayder shabloni: Netplan yo'q (ifupdown), cron yo'q, snap yo'q.

## Docker kitobi (`content/docker/`)

- Mundarija rasmiy hujjatga (docs.docker.com) solishtirib qayta tuzilgan: har bob yonida manba, versiyalar jadvali (Engine 29.9.3, Desktop 4.98.0, Compose v5.7.0, Node.js 26).
- Misollar **VPS'dagi Docker Engine 29.9.3** da (noutbukdagi Docker Desktop eski — 4.35.1; yangilanmaguncha macOS chiqishlari olinmaydi). 2-bobdagi Desktop qismi rasmiy hujjat asosida.
- **Tayyor: 28/28 bob** (2026-11-08), branch `docs/docker-qism-1`.
- GitHub'da sinalmagan (hisob/repo kerak, bobda ochiq belgilangan): 25-bobdagi Docker Hub/GHCR `login`/`push`, 26-bobdagi workflow fayllari (rasmiy hujjat misollari). Teglash/push/kesh mexanikasi VPS'dagi lokal `registry:3` da sinalgan.
- Noutbuk Docker Desktop yangilansa — 2-bobga macOS chiqishlari qo'shilishi mumkin.
- Bob yozish tartibi Linux kitobidagidek: rasmiy sahifa (`raw.githubusercontent.com/docker/docs/main/content/...` — manba markdown), VPS'da sinash, chiqishni yozib olish, `chiqish_tekshir.py`, havolalar, Playwright bilan sahifa.
- Yordamchilar (scratchpad'da edi, kerak bo'lsa qayta yoziladi): VPS'da buyruqlar ro'yxatini `nohup` bilan bajarib, `$ buyruq` + chiqish qaytaradigan skript (SSH uzilishlariga chidamli); `docker_ulash.py` — bobni README va oldingi bobga ulash (`N/28`).
- Kuzatuvlar: `pkill -f "<matn>"` SSH ichidagi o'z qobig'ini ham o'ldiradi — `[d]ocker` kabi shablon ishlating; noutbuk–VPS SSH ulanishi vaqti-vaqti bilan uziladi.
- Avtomatik ruxsat tekshiruvi uchinchi tomon repozitoriysini (dockersamples/laravel-docker-examples) VPS'da yig'ishga ruxsat bermadi — 20-bob o'z kodimiz va rasmiy image'lar bilan qurildi.

## Web asoslari kitobi (`content/web-asoslari/`)

- Branch `docs/web-asoslari-1`. **Tayyor: 30/30 bob** (2026-11-08). IV qism (xavfsizlik) — faqat himoya tomoni, hujum yuklamasi (payload) ko'rsatilmagan.
- README'dagi "Animatsiyalar" jadvali (01, 04, 11, 19, 20) hali bajarilmagan — video/animatsiya ishlari bilan alohida.
- HTTP/3 sinovi (13-bob) noutbukdagi Homebrew curl 8.23.0 bilan. Lokal HTTPS sinovlari (23, 27-boblar) — o'z-o'zidan imzolangan sertifikat; 27-bobda Chromium'ga `--ignore-certificate-errors-spki-list` bilan (HSTS faqat xatosiz TLS'da qabul qilinadi).
- Manbalar: MDN markdown manbasi (`raw.githubusercontent.com/mdn/content/main/files/en-us/...`), RFC'lar (`rfc-editor.org/rfc/rfcNNNN.txt`), WHATWG (URL, Fetch). Bo'lim raqamlari RFC matnidan tekshiriladi.
- Muhit: VPS'da `curl` 8.18.0, `dig` 9.20.24, `tcpdump` 4.99.6 (o'rnatildi), nginx — Docker `nginx:1.30.6` (`--network host`), kichik Python serverlar (`http.server`); brauzer — lokal Chromium 158 (`playwright-core`, lokal Python server).
- Kuzatuvlar: Chromium `HTTP/1.0` javobdagi `ETag` bilan shartli so'rov yubormadi (11-bob) — test serverlarida `protocol_version = 'HTTP/1.1'`. VPS'da IPv6 ulanish yo'q (`curl -6` — 7-xato). Ubuntu `curl` HTTP/3 siz yig'ilgan. VPS skriptida `wait` fon serverini ham kutib qoladi — ishlatmang.

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
- Rejadagi kitoblar bo'yicha egasining qarori kutilmoqda: ~~HTTPS boblari uchun domen~~ (2026-11-09: domen berildi, Nginx 19–25 yozildi; Deploy kitobining domen boblari ham shu domen bilan qilinishi mumkin); RabbitMQ/Redis misollari tili (hozir Node.js, PHP muqobil); Deploy kitobidagi GitHub Actions uchun sinov repozitoriysi.

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

- 2026-11-08: **47–61, 63–67, 69, 70-boblar yozildi** (68/70; matn, video darslar yo'q — ular TTS bilan boshqa noutbukda qilinadi).
- Qolgan: **62** (SQL injection va parametrlar) — hujum namunasini jonli ko'rsatish urinishi to'xtatildi; faqat himoya tomoni (parametrli so'rov, `PREPARE`, `EXECUTE … USING`, `format('%I')`) bilan yozish kerak — egasi bilan kelishib. **68** (ORM ortidagi SQL) — Laravel/Prisma o'rnatish kerak (tashqi paketlar), egasi bilan kelishib.
- 63- va 69-boblar oldingi bob yo'qligi sababli qo'lda ulangan (61 → 63, 67 → 69); 62 va 68 yozilganda navigatsiyani to'g'rilash kerak.
- Qo'shimcha sinov asboblari (Homebrew): `pgbouncer` (64-bob). PITR va replikatsiya sinovlari — `~/sql-sinov/66/pitr`, `~/sql-sinov/67/standby` (to'xtatilgan).
- Sinov muhiti (README'dagi "Sinov muhiti (47-bobdan)" qatori): PG 18.6 — Homebrew `postgresql@18` (`~/sql-sinov/pgdata`, `pg_ctl ... start`); MySQL 9.7.2 — rasmiy Docker image (`docker run -d --name mysql97 -e MYSQL_ROOT_PASSWORD=sinov -p 127.0.0.1:3306:3306 mysql:9.7.2`; Homebrew'da `mysql@9.7` endi 9.7.4); SQLite 3.54.1 — Homebrew `sqlite`.
- Ikki seansli misollar (50–54-boblar) — kichik Python skripti: buyruqlarni A/B seanslarga navbatma-navbat yuboradi va chiqishni seans nomi bilan yozadi (`~/sql-sinov/ikki.py`, git'da yo'q). Bloklangan buyruq javobi keyingi buyruq ostida chiqadi — boblarda izohlangan.
- Bob ulash: oldingi bobga "Keyingi", README qatori havolaga, `NN/70` — Linux'dagi `bob_ulash.py` ning SQL varianti (scratchpad'da edi).
- dev.mysql.com havolalari `havola.sh` da 403 qaytaradi (HEAD so'roviga), sahifalar `GET` bilan ochiladi.
- **2026-11-09: 62 va 68 yozildi — SQL kitobi 70/70 tayyor.** 61 → 62 → 63 va 67 → 68 → 69 navigatsiyasi tuzatildi.
  - 62 (SQL injection): egasi qarori — haqiqiy hujumlar ham ko'rsatiladi. Birinchi noutbukdagi `sql-sinov` (PG 18.6, MySQL 9.7.2, SQLite 3.54.0) + noutbuk PHP 8.5.11; `hujum` bazasi, skriptlar `sql-sinov/62/` (git'da yo'q). Hujumlar PHP qo'llanmasidagi misollarga tayanadi.
  - 68 (ORM ortidagi SQL): egasi qarori — Laravel (Eloquent) va Symfony (Doctrine); Prisma keyinroq NestJS kitobi bilan. Sinov VPS'da (egasi: "nima o'rnatish kerak bo'lsa VPS ga").

## Nginx kitobi (`content/nginx/`)

- Branch `docs/nginx-1`. Tayyor: 1–30 (1–18, 26–30 — 2026-11-08; 19–25 — 2026-11-09, branch `docs/nginx-https`). VPS'ga nginx 1.31.8 (mainline) rasmiy nginx.org omboridan o'rnatildi (`/etc/apt/sources.list.d/nginx.list`, pinning `/etc/apt/preferences.d/99nginx`), servis `nginx`, 80-port.
- **2026-11-09:** HTTPS boblari 19–25 yozildi — kitob 30/30. Egasi domen berdi (DNS'da `@`, `www` (CNAME) va `lab` VPS IP'siga yo'naltirilgan) va Let's Encrypt hisobiga o'z emailini ishlatishga ruxsat berdi. **Domen, email va VPS IP repo'ga yozilmaydi**: chiqishlarda `example.com`, `admin@example.com`, `203.0.113.10` (`sed` bilan almashtiriladi); haqiqiy sertifikat seriya raqami ham yashirilgan.
- VPS'dagi HTTPS holati: snapd + Certbot 5.9.0 (snap, `snap.certbot.renew.timer`), sertifikat `example.com`+`www` (`certonly --webroot -w /var/www/sayt`), deploy hook `/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh`. `conf.d/sayt.conf` — 80→301, 443 `ssl` + `quic reuseport`, `http2 on`, HSTS `max-age=300` (sinov uchun qisqa), `Alt-Svc`, `add_header_inherit merge`. `conf.d/acme.conf` — `nginx-module-acme` (`load_module` `nginx.conf` boshida), issuer `letsencrypt`, `lab` subdomeni, `state_path /var/cache/nginx/acme-letsencrypt`, `resolver 127.0.0.53 ipv6=off`. `conf.d/tls.conf` — `ssl_session_cache shared:SSL:10m`.
- Kuzatilgan: modulni birinchi yuklashdagi `nginx -s reload` master jarayonni SEGV bilan qulatdi (20-bobda yozilgan) — `load_module` o'zgarsa `systemctl restart`. HTTP/3 mijozi — noutbukdagi Homebrew curl (`/opt/homebrew/opt/curl/bin/curl`, ngtcp2).
- Manba: nginx.org HTML sahifalari (`h2t.py` bilan matnga) va docs.nginx.com (markdown manbasi: `raw.githubusercontent.com/nginx/documentation/main/content/nginx/...`).
- Proksi boblarida backend — Python standart kutubxonasidagi kichik server (Node.js VPS'da yo'q; misollar tili qarori Redis/RabbitMQ bilan birga kutilmoqda). README 11-bob qatoridagi "Node.js" so'zi "orqadagi ilova"ga o'zgartirildi.

## Redis kitobi (`content/redis/`)

- Branch `docs/redis-2` (1-qism — `docs/redis-1`, merge qilingan). **Redis kitobi tayyor: 34/34** (2026-11-10). Ilova misollari Node.js va PHP'da: VPS'da Node.js 26.13.0 (`/opt/node`, rasmiy binar), Composer 2.11.1 (`/usr/local/bin/composer`), loyiha `/root/redis-ilova` (`redis@6.3.1`, `predis/predis` 3.7.1). (1-qism) VPS'ga Redis 8.10.3 rasmiy APT omboridan (`packages.redis.io`, `resolute`) o'rnatildi, servis `redis-server`, faqat `127.0.0.1`/`::1:6379`.
- Manba: `raw.githubusercontent.com/redis/docs/main/content/...` (markdown). Hujjat `main` tarmog'ida hali chiqmagan imkoniyatlar bo'lishi mumkin (masalan, Arrays turi, 8.12 RC) — har bobda o'rnatilgan 8.10.3 da tekshiriladi.
- Navbat: avval `redis-cli` bilan (V) boblar — 3–12, 15, 25–34; Node.js (V+N) boblari — misollar tili bo'yicha egasining qarori kutilmoqda (README'da hozir Node.js).

## Server xavfsizligi kitobi (`content/server-xavfsizligi/`)

- Branch `docs/server-xavfsizligi-1`. Tayyor: 1–8, 19–23-boblar (2026-11-09; wtmpdb + libpam-wtmpdb o'rnatildi (`last`); 24-bob (yakuniy ro'yxat) 9–18-boblardan keyin; etckeeper o'rnatildi (`/etc/.git`); restic 0.18.1, sinov ombori `/var/backups/restic` (paroli `/root/.restic-parol`; 21-bob uchun); 20-bobda SFTP sinovi qilinmadi — SSH kalit qo'shish ruxsat so'raydi; cron o'rnatildi; apparmor-utils o'rnatildi; admin foydalanuvchi `boshqaruv` (sudo, root kalitlari bilan; paroli `/root/boshqaruv-parol`); ubuntu-pro-client o'rnatildi, Pro'ga ulanmagan; VPS yadrosi 7.0.0-43 ga yangilanib qayta ishga tushirildi). Manba: `raw.githubusercontent.com/canonical/ubuntu-server-documentation/main/docs/...`.
- Navbat: VPS'ga kirishni xavf ostiga qo'ymaydigan boblar — 2–8, 19–24. SSH/firewall boblari (9–18) — provayder konsoli tayyorligi bo'yicha egasining tasdig'i kerak.

## Deploy amaliyoti kitobi (`content/deploy-amaliyoti/`)

- Branch `docs/deploy-1`. Tayyor: 1, 5, 7, 8, 16–18, 20-boblar (20-bobda image tegi va GitHub deploy tarixi qismi — 19-bob va III qism bilan qo'shiladi) (2026-11-09; VPS'ga `strace` o'rnatildi).
- Navbat: til va domen talab qilmaydigan V-boblar — 5, 7, 8, 16–18 (ilova — Python standart kutubxonasidagi kichik server, Nginx kitobidagi kabi). 3-bob (deploy foydalanuvchisi, SSH kalit, firewall) — VPS'ga kirishni o'zgartiradi, egasining tasdig'i kerak. 2, 4 (domen), 6 (Node.js/PHP — misollar tili qarori), 9–15, 19, 21–22 (GitHub sinov repozitoriysi) — egasining qarori kutilmoqda.
- Manba: GitHub hujjati — `raw.githubusercontent.com/github/docs/main/content/actions/...` (markdown).

## Kafka kitobi (`content/kafka/`)

- **Egasining qarori (2026-11-10): Kafka VPS'da.** `apache/kafka:4.4.0` konteyneri `kafka` (`docker run -d --name kafka -p 127.0.0.1:9092:9092 -e KAFKA_HEAP_OPTS="-Xmx256m -Xms256m" --restart unless-stopped`). Port faqat 127.0.0.1 da (Docker ufw'ni chetlab o'tadi — tashqariga ochilmasin). Konteyner ~330 MB xotira.
- Branch `docs/kafka-1`. Tayyor: 1–11-boblar (2026-11-10; Java misollari `/root/kafka-java/`, `java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' X.java`; 6 — `kalit-partition` animatsiyasi). VPS'ga `openjdk-25-jdk-headless` o'rnatildi; arxiv `/opt/kafka-tgz/kafka_2.13-4.4.0` (CLI vositalari uchun ham).
- Xabar tizimlari'ning V+D boblari ham shu VPS Kafka'si bilan qilinadi.

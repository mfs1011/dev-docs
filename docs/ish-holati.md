# Ish holati (boshqa kompyuterda davom ettirish uchun)

Oxirgi yangilanish: 2026-11-07. Yangi kompyuterda ishni boshlashdan oldin shu faylni, `CLAUDE.md` ni va `docs/tts.md` ni o'qing.

## Linux kitobi (`content/linux/`)

- Mundarija: `content/linux/README.md` — 12 qism, 54 bob, har bob yonida rasmiy manba.
- Tayyor: **1–38-boblar** (I–VII qismlar va VIII qismning 33–38-boblari).
- **Keyingi: 39-bob — Servisni cheklash**, keyin IX Tarmoq (40–44), X SSH (45–47), XI Bash skriptlar (48–51), XII Muammoni topish (52–54).
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
| Ovozli o'qish talaffuzlari | `scripts/talaffuz.json` (batafsil `docs/tts.md`) |

### Trenajorni lokal yig'ish va sinash

CI (`.github/workflows/deploy.yml`) trenajorni o'zi yig'adi. Lokal test uchun:

```sh
npm ci
sh linux-trenajor/scripts/yigish.sh        # python3, node >= 22.15, zstd kerak; birinchi marta uzoq
npx vite --port 5182                       # boshqa terminalda
node linux-trenajor/test/buyruq.mjs fayl.txt   # buyruqlarni trenajorda bajarib, haqiqiy chiqishni beradi
node linux-trenajor/test/mashqlar.mjs          # barcha mashqlarni brauzerda tekshiradi (yoki: ... 25-dpkg)
```

`buyruq.mjs` ga UTF-8 belgilar (`‘` kabi) buzilib boradi — sinov buyruqlarida ASCII ishlating. Har ishga tushirish trenajorni toza holatdan boshlaydi.

### Trenajor cheklovlari (boblarda aytilgan)

- Internet yo'q: `apt update/install` ishlamaydi (24, 26, 27-boblar VPS'da).
- `/usr/share/doc`, man tarjimalari o'rnatilmagan; `perl` yo'q (`deluser --remove-home` ishlamaydi).
- 32-bitli (i386).

## Sinov VPS

- Ubuntu 26.04, faqat kitob sinovlari uchun ajratilgan. Kirish — SSH kalit bilan, root.
- **Manzil va kalit git'ga yozilmaydi** — ular egasida.
- Vaqtinchalik sinov narsalari bob tugagach o'chiriladi.
- 2026-11-07 dan egasi qo'llanma uchun **to'liq ruxsat** bergan: qayta yondirish, SSH'ni mustahkamlash, firewall, sinov servislari — har o'zgarish bobda hujjatlanadi.
- Hozirgi holat (2026-11-07):
  - VPS qayta yondirildi, yadro 7.0.0-42 (33–34-boblar);
  - `lsof`, `psmisc`, `tmux` o'rnatildi (30, 32-boblar);
  - `salom.service` (`python3 -m http.server`, 127.0.0.1:8000, `/srv/salom`, `/etc/salom.env`, `salom` foydalanuvchisi) — 35–39-boblar uchun; **39-bob tugagach o'chiriladi**;
  - ochiq masala: provayder apt manbalarida `trusted: yes` va `http://` mirror (26-bob);
  - provayder shabloni: Netplan yo'q (ifupdown), cron yo'q, snap yo'q.

## Ikkinchi noutbukda qilinadigan ishlar

Birinchi noutbukda disk kam va Docker yo'q. Sinov VPS'ida 2 GB xotira bor: `MemTotal` 1,75 GiB, 2026-11-07 da bo'sh qismi ~1,3 GiB. Shuning uchun quyidagilar **ikkinchi noutbukda** qilinadi (xotira va disk ko'proq, Docker bor):

| Ish | Sabab | Muhit |
| --- | --- | --- |
| **Kafka** qo'llanmasi: boblar va misollar; "Xabar tizimlari"ning Kafka misollari | Broker'ni ishga tushirish skripti `kafka-server-start.sh` Java uchun standartda `-Xmx1G -Xms1G` (1 GB heap) ajratadi. VPS'dagi bo'sh xotiraga bu sig'maydi | Docker: Kafka'ning rasmiy Quick Start'idagi `apache/kafka` image. Versiya: `content/kafka/README.md` |
| **Docker** qo'llanmasi | Birinchi noutbukda Docker o'rnatib bo'lmaydi (disk) | Docker Engine yoki Desktop |

Ikkinchi noutbukda boshlashdan oldin shu faylni, `CLAUDE.md` ni va kitobning `README.md` sini (mundarija, versiyalar jadvali) o'qing. Versiyalarni yozishdan oldin qayta tekshiring.

## Ish tartibi

- Har vazifa `main` dan alohida branch, PR `main` ga, merge'ni egasi qiladi. Force push yo'q.
- Commit va PR matnida AI atributsiyasi yo'q.
- Commit/push/PR faqat egasi so'raganda.
- Uzoq yozish ishlarida 5 soatlik limitni bob oralarida tekshirish; egasi aytgan chegarada joriy bobni tugatib to'xtash.

## Git'da yo'q, qo'lda ko'chiriladiganlar

| Nima | Izoh |
| --- | --- |
| `.env` (`GEMINI_API_KEY`) | Faqat xavfsiz yo'l bilan |
| VPS SSH kaliti | Faqat xavfsiz yo'l bilan |
| `audio/`, `segments/` | `docs/tts.md` ga qarang |
| `*-REJA.md` (boshqa kitoblar rejalari) | `.gitignore` da, lokal fayllar |
| `video/REACT-VIDEO-USLUBI.md`, `video/VUE-VIDEO-USLUBI.md` | Hali commit qilinmagan |

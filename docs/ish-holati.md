# Ish holati (boshqa kompyuterda davom ettirish uchun)

Oxirgi yangilanish: 2026-11-06. Yangi kompyuterda ishni boshlashdan oldin shu faylni, `CLAUDE.md` ni va `docs/tts.md` ni o'qing.

## Linux kitobi (`content/linux/`)

- Mundarija: `content/linux/README.md` — 12 qism, 54 bob, har bob yonida rasmiy manba.
- Tayyor: **I–VI qismlar, 1–27-boblar**.
- **Keyingi: VII qism — Jarayonlar (28–32)**, keyin VIII systemd (33–39) va hokazo.
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
- Sinov qilib bo'lgach VPS asl holiga qaytariladi (o'rnatilgan paketlar, foydalanuvchilar, repo'lar o'chiriladi).
- Xavfsizlik sozlamalari (yangi sudo foydalanuvchi, root/parol bilan kirishni yopish, firewall) — faqat egasining roziligi bilan.
- Ochiq kuzatuvlar (2026-11-06, hal qilinmagan, egasi qaror qiladi):
  - yangi yadro o'rnatilgan, server qayta yondirilmagan (`/var/run/reboot-required`);
  - provayder apt manbalarida `trusted: yes` va `http://` mirror (26-bob);
  - provayder shabloni: Netplan yo'q (ifupdown), cron yo'q, snap yo'q.

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

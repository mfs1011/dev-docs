# Vizualizatorlar — umumiy reja ("Sahna" dvigateli)

Holat: **reja** (2026-11-18). Hali kod yozilmagan. Egasining so'rovi bilan yozildi: "huddi shunaqa narsa qilishimiz kerak,
faqat bizniki o'zimizning dizaynga mos bo'lsin va iloji bo'lsa ovozli bo'lsin".

Bu papkada uchta hujjat bor:

| Fayl | Nima |
| --- | --- |
| **README.md** (shu fayl) | Umumiy qism: namunalarda nima ko'rildi, dizayn tamoyillari, umumiy dvigatel, ma'lumot formati, ovoz, testlar, ish tartibi. Keyin boshqa vizualizator g'oyasi kelsa, shu dvigatel ustiga quriladi |
| [paket-yoli.md](paket-yoli.md) | **"Paket yo'li"** — protokollar paketma-paket, har bayt izohi bilan (namuna: Protocol Explorer) |
| [tizim-dizayni.md](tizim-dizayni.md) | **"Tizim dizayni darslari"** — qadamli hikoya, metrikalar va jonli sxema (namuna: Designed to Scale) |

---

## 1. Namunalar — nima ko'rildi

Ikkala sayt 2026-11-18 da Playwright bilan ochib, bosib, klaviatura va mobil ko'rinishda sinab chiqildi. Skrinshotlar
sessiya scratchpad'ida qoldi; repo'ga qo'shilmaydi, chunki ular boshqa muallifning ishi.

### 1.1. Protocol Explorer — <https://protocol-explorer-alpha.vercel.app/>

Muallif — Dilum Sanjaya. Shiori: "Watch the internet work, packet by packet".

**Tuzilma** — uch ustun, pastda paketlar jadvali:

| Joy | Nima bor |
| --- | --- |
| Tepa panel | logotip; **OSI qatlami ko'rsatkichi** (1–7, joriy protokol qatlami yonadi, nomi yozib qo'yiladi: APPLICATION, PRESENTATION…); qidiruv `⌘K` (protokollar va qadamlar); tugmalar — protokollar ro'yxatini yashirish, "faqat diagramma", to'liq ekran, tezkor tugmalar ro'yxati; til (22 til); yorug'/qorong'i |
| Chap ustun | "Internet protocols": filtrlar ALL 39 / CORE 11 / APPLICATION 19 / SECURITY 9. Protokolni ochganda uning qadamlari ro'yxati (raqamli doiralar, o'tilgani ✓ bo'ladi, joriysi ajralib turadi) |
| Markaz | ikki ko'rinish: **NETWORK** (izometrik tarmoq xaritasi: noutbuk, router, bulut, serverlar; har tugun nomi + IP) va **SEQUENCE** (ketma-ketlik diagrammasi: vertikal "hayot chiziqlari", qadam chegaralari, vaqt belgilari, rangli strelkalar, holat chiplari — masalan "SHARED SECRET COMPUTED") |
| O'ng ustun | **Protocol overview** (izoh + faktlar jadvali: qatlam, port, transport, format, metodlar, RFC). Ijro boshlanganda **Step details** ga almashadi: "STEP 2 OF 5", sarlavha, izoh, joriy paket kartasi (rangli yorliq, kimdan → kimga, ichidagi qatorlar, "PACKET 1 OF 7 · DNS · 75 B"), faktlar |
| Pastda | **Packet flow** — Wireshark'ga o'xshash jadval: №, vaqt, manba, manzil, protokol, info, hajm. Rang afsonasi (DNS, TCP, Request, Response), "Data ACKs not shown" eslatmasi. Boshqaruv: tezlik `1×`, orqaga, PLAY/PAUSE, STEP, RESET. Qatorlar paket "jo'natilgan" sari paydo bo'ladi |

**Animatsiya:**

- Har qadamda "kamera" kerakli tugunlarga yaqinlashadi (qadam ma'lumotida `frame: local | lookup | full`).
- Tugunlar kerak bo'lganda paydo bo'ladi (`show`).
- 1-qadamda URL satriga matn yozilayotgandek ko'rinadi.
- Paket chiziq bo'ylab yuradi, ustida yorliq ("DNS QUERY / A? www.example.com").

**Paket inspektori.** Jadvaldagi qatorni bosganda diagramma o'rnida ochiladi:

- tepada paket nomi, vaqti, kimdan → kimga, oldingi/keyingi tugmalari;
- **qatlamlar chizig'i** — Ethernet 14 B, IPv4 20 B, TCP 20 B, HTTP 430 B, hajmiga mutanosib;
- maydonlar daraxti: har maydonning qiymati va **oddiy tilda izohi** ("Windows starts at 128");
- `E.G.` belgisi — har haqiqiy yozuvda boshqacha bo'ladigan namunaviy qiymat;
- o'ngda hex dump + ASCII; `··` — dars ko'rsata olmaydigan baytlar (shifrlangan, tasodifiy, fayl mazmuni).

**Klaviatura** (`?` bilan ochiladi):

| Guruh | Tugmalar |
| --- | --- |
| Ijro | `Space` ijro/pauza, `←`/`→` qadam, `S` bitta paketdan, `1`–`9` qadamga o'tish, `[`/`]` tezlik, `Esc` umumiy ko'rinishga |
| Ko'rinish | `V` tarmoq/ketma-ketlik, `D` faqat diagramma, `L` ro'yxat, `F` to'liq ekran, `T` tema |
| Qidiruv | `⌘K` yoki `/`, `N`/`P` keyingi/oldingi protokol |
| Inspektor | `←`/`→` paketlar, `Esc` yopish |

**Mobil:** hamma narsa ustma-ust joylashadi, ijro tugmalari pastda yopishgan panelda.

**Texnika:**

- Vanilla JS + SVG, canvas yo'q (sahifada ~330 ta `svg`). Bitta Vite bundle, ~500 KB.
- O'z shrifti — Iosevka.
- URL holatni saqlamaydi.
- Dars ma'lumoti deklarativ: qadam = `{ title, desc, detail, facts: [[k, v]], events: [...] }`. Hodisalar: `show`,
  `type-url`, paket `(from, to, rang, yorliq, qatorlar, { time, src, dst, proto, info, len, wire })`.
- `wire` — haqiqiy bayt quruvchilar: Ethernet/IP/TCP sarlavhalari va **checksum'lar hisoblanadi**, tasodifiy qiymatlar urug'dan (seed) olinadi.
- IP manzillar hujjatlar uchun ajratilgan diapazonlardan (`203.0.113.x`, `198.51.100.x`, `192.0.2.x`) — bizdagi niqoblash qoidasi bilan bir xil.

### 1.2. Designed to Scale — <https://designed-to-scale.vercel.app/>

Muallif o'sha. Shiori: "each idea is an animated diagram you step through".

**Tuzilma:**

| Joy | Nima bor |
| --- | --- |
| Tepa panel | Learn / Practice / Design Lab / Cheatsheets (**oxirgi uchtasi — "coming soon"**, bosilsa "Practice is coming soon" chiqadi); qidiruv `⌘K` (darslar va tushunchalar); til; tema |
| Chap ustun | kurs daraxti: 9 modul, 40 dars, har modulda `0/3` kabi progress; pastda umumiy "PROGRESS 1 / 40" |
| Markaz tepasi | yo'l (modul / "Lesson 1 of 3"), sarlavha, chiplar (`10 min`, `Beginner`, `10 steps`), bir qatorli shior |
| **Metrikalar qatori** | 4–5 ta karta (USERS, REQUESTS/S, P95 LATENCY, ERRORS, HEALTHY SERVERS yoki DNS LOOKUP, CONNECT, …, TOTAL). Har qadamda qiymat o'zgaradi, chap cheti holat rangida |
| Sahna | izometrik sxema: olti burchakli prizma serverlar, silindr baza, odamlar to'dasi, telefonlar; teglar (bandlik chizig'i `34%`, `23 queued`); chiziqlar bo'ylab har xil turdagi nuqtalar (request, heavy request, health check, failed ✕); afsona; Replay / Pause; sahna ustidagi kartalar ("NAPKIN MATH", "WHERE THE TIME WENT") |
| Pastda | "IN THIS LESSON" — qadamlar relsi (raqam + qisqa nom) |
| O'ng ustun | qadam kartasi: `STEP 3 / 12`, **bob turi nishoni** (PROBLEM / TECHNIQUE / SETUP / INSIGHT / RECAP), sarlavha, matn (atamalar ajratilgan), callout (KEY IDEA / GOOD TO KNOW / ogohlantirish), **"WHAT CHANGED"** (`+` qo'shildi, `~` o'zgardi), Back / "Next: <keyingi qadam nomi>", tugmalar eslatmasi. Pastda **"YOU'LL LEARN"** — qadamlar o'tgan sari o'zi ✓ bo'ladigan ro'yxat. Oxirgi qadamda "COMING UP: keyingi dars" |

**Darsning hikoya tuzilmasi:**

- Muammo → texnika → yangi muammo → texnika → … → keyslar → xulosa.
- Masalan, "How a Request Travels":
  - 1-qadam: "sayt sekin";
  - keyin DNS, ulanish, so'rov, server, javob;
  - keyin keyslar: "sekin so'rov" (baza 15 → 400 ms, jami 155 → 540 ms) va "uzoqdagi foydalanuvchi";
  - oxirida vaqt qayerga ketgani jadvali.

**Texnika:**

- Vanilla JS + SVG, ~790 KB bundle. Shrift — JetBrains Mono.
- **Hash marshrut** `#/<dars>/<qadam>`.
- `localStorage`: `sdt:last`, `sdt:recent`.
- Dars ma'lumoti deklarativ, qadam tuzilmasi:

  ```js
  {
    short, chapter, title, body: [], callout: { kind, text }, changes: [],
    metrics: {}, scene: { entities, links, flows },
  }
  ```

  Sahna qadamdan qadamga o'zgaradi, dvigatel farqini animatsiya qiladi. `flows` — chiziqlardagi oqim: tezlik va naqsh
  (`['req', 'heavy', 'req']`).
- Bundle ichida `readAloud: false` bayrog'i bor: `speechSynthesis` bilan ovozli o'qish **boshlangan, lekin o'chirilgan**.
  Bizda esa haqiqiy o'zbekcha ovoz (Gemini TTS + so'z vaqtlari) allaqachon ishlaydi — bu bizning ustunligimiz.

### 1.3. Ikkalasidan olinadigan g'oyalar

1. **Qadam — asosiy birlik.** Har qadamda bitta g'oya, bitta sahna holati, qisqa matn.
2. **Deklarativ ma'lumot, umumiy dvigatel.** Dars — JS obyekt; chizish, ijro va animatsiya — bitta joyda.
3. **Uch sinxron joy:** sahna (ko'rish), qadam kartasi (o'qish), jadval/metrikalar (raqam).
4. **"Nima o'zgardi"** — har qadamdagi farq aniq yoziladi.
5. **Chuqurlashish:** paket → baytlar, metrika → hisob ("napkin math").
6. **Klaviatura birinchi darajali**, `?` bilan ro'yxat.
7. **Mobilda pastki ijro paneli.**
8. **Progress va "siz o'rganasiz" ro'yxati**, darsdan keyin "keyingisi".

**Biz qo'shadigan narsalar** (namunalarda yo'q):

- **Ovoz** — har qadam o'zbekcha o'qiladi, o'qilayotgan so'z belgilanadi, animatsiya ovozga sinxron.
- **Haqiqiylik:**
  - "Paket yo'li"da paketlar VPS'dagi haqiqiy `tcpdump`/`tshark` yozuvidan olinadi;
  - "Tizim dizayni"da metrikalar haqiqiy o'lchovdan yoki ochiq belgilangan modeldan olinadi.

  Bu `CLAUDE.md` qoidasi: taxmin yo'q.
- **Kitob bilan bog'liqlik:** bob ichida kichik sahna, sahnadan bobga havola, trenajorga "o'zingiz sinang".

---

## 2. O'ziga xoslik — nimani **olmaymiz**

- Kod, rasm, ikonka, matn, shrift tanlovi, rang palitrasi **ko'chirilmaydi**. Biz faqat g'oya va UX naqshlarini olamiz
  (qadamli ijro, paket inspektori, metrikalar qatori) — bular umumiy naqshlar.
- Izometrik 3D "o'yinchoq" uslubi — namunalarning tanib olinadigan belgisi. Biz o'z uslubimizni qilamiz (3-bo'lim).
- Ularning dars matnlari va misollari tarjima qilinmaydi. Bizning matn kitoblarimizdan va rasmiy manbalardan (RFC,
  rasmiy hujjat) yoziladi, `CLAUDE.md` qoidasi bo'yicha.

---

## 3. Dizayn — saytimizga mos

### 3.1. Tokenlar — faqat `src/styles/main.css` dan

Yangi rang yoki shrift qo'shilmaydi.

| Narsa | Token | Qayerda |
| --- | --- | --- |
| Fon, karta | `--bg`, `--bg-elevated`, `--bg-sunken` | sahna foni — `--bg-sunken` + **nuqtali to'r** `--grid-dot` (saytda allaqachon bor) |
| Matn | `--text`, `--text-muted`, `--text-subtle` | yorliqlar, izohlar |
| Asosiy rang | `--accent` (yashil) | joriy qadam, ijro tugmasi, faol tugun chegarasi |
| Holat ranglari | `--success`, `--warning`, `--danger`, `--info`, `--insight` va `*-soft` | metrika holati, paket turlari, callout turlari |
| Kod va baytlar | `--code-*`, `--font-mono` (JetBrains Mono) | hex dump, sarlavha qatorlari |
| Shrift | `--font-sans` (Inter) | matn |
| Burchak, soya | `--radius`, `--radius-sm`, `--shadow-sm`, `--shadow-lg` | kartalar |

Qorong'i tema avtomatik ishlaydi: tokenlar `main.css` da ikkala tema uchun bor. SVG ichida rang faqat
`var(--…)` orqali beriladi, `#hex` yozilmaydi.

### 3.2. Rang ma'nolari (ikkala vizualizatorda bir xil)

| Ma'no | Token |
| --- | --- |
| so'rov / klient yuborgan | `--info` |
| javob / server qaytargan | `--success` |
| ulanish, handshake, nazorat | `--insight` |
| ogohlantirish, sekin, navbatda | `--warning` |
| xato, yo'qolgan, rad etilgan | `--danger` |
| shifrlangan | `--text-subtle` + qulf belgisi |

Faqat rang bilan farqlanmaydi: har turning shakli (to'liq/bo'sh doira, kvadrat, ✕) yoki yozuvi ham bor (rang ajrata
olmaydigan o'quvchi uchun).

### 3.3. Grafik uslub — "texnik chizma"

- **Tekis 2D**, izometriya emas:
  - tugunlar — yumaloq burchakli kartalar (`--bg-elevated`, ingichka `--border-strong` chegara);
  - ichida kichik ikonka, nom, mono shriftda IP/port.
- **Ikonkalar** — o'zimiz chizgan bitta to'plam, `src/sahna/ikonkalar.js` da SVG path sifatida, 24×24, chiziq qalinligi 1.75. Kerakli to'plam:
  - noutbuk, telefon, router, server, baza, kesh, navbat, bulut, qulf, kalit, sertifikat;
  - load balancer, CDN, foydalanuvchilar, DNS, xat, kamera.
- **Mavjud uslub bilan bir oila** — `src/arxitektura/Sxema.vue` va `src/animatsiya/*` (`QadamliAnim`). Hozir u yerda emoji
  ikonkalar; yangi dvigatel tayyor bo'lgach ular ham shu ikonkalarga o'tkaziladi (alohida PR).
- **Chiziqlar** — ingichka, uchida kichik strelka. Paket — chiziq bo'ylab yuradigan **yorliqli kapsula**: rangli chap
  chegara, mono matn.
- **Harakat:**
  - `transform` va `opacity` bilan, 200–600 ms, `ease-out`;
  - `prefers-reduced-motion` bo'lsa harakat o'chadi, holatlar sakrab almashadi;
  - sahna shu holatda ham to'liq tushunarli bo'lishi kerak.
- **Sahna ustidagi kartalar** ("hisob", "vaqt qayerga ketdi") — `--bg-elevated` karta, mono raqamlar.

> **Qaror (egasi, 2026-11-19): izometrik 3D**, ranglar va stilistika saytnikiday. Amalda: `src/sahna/izo.js` —
> pol tekisligi proyeksiyasi va o'zimiz chizgan bloklar (server qutisi tirqishlari bilan, baza silindri, noutbuk,
> router antennasi bilan, odamlar platformasi); yuzalar `--*-soft` rangda, chegara to'q tokenda, yon yuzalar shaffof
> qora qatlam bilan soyalanadi; ust yuzada ikonka; nom yorlig'i blok ostida. Tor (tik) ekranda oqim yuqoridan pastga
> yo'naladi.

### 3.4. Sahifa joylashuvi

Ikkala vizualizator bitta "qobiq"dan foydalanadi:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Topbar (sayt topbar'i) · qidiruv · tema · ovoz tanlovi                     │
├───────────────┬──────────────────────────────────────┬─────────────────────┤
│ Ro'yxat       │  [Metrikalar qatori yoki qatlam      │ Qadam kartasi       │
│ (darslar /    │   ko'rsatkichi]                      │  nishon · N / M     │
│  protokollar, │                                      │  sarlavha           │
│  progress)    │            SAHNA (SVG)               │  matn (so'z         │
│               │                                      │   belgilanadi)      │
│               │                                      │  callout            │
│               │                                      │  nima o'zgardi      │
│               │                                      │  ← Orqaga · Keyingi │
│               ├──────────────────────────────────────┤                     │
│               │ Pastki panel: qadamlar relsi YOKI    │ "Siz o'rganasiz"    │
│               │ paketlar jadvali + ijro boshqaruvi   │ ro'yxati            │
└───────────────┴──────────────────────────────────────┴─────────────────────┘
```

- **≥ 1280 px** — uch ustun.
- **900–1279 px** — chap ro'yxat yig'iladi (tugma bilan ochiladi).
- **< 900 px:**
  - ustma-ust tartib: sahna → qadam kartasi → jadval;
  - ijro paneli pastda yopishgan (`position: sticky`);
  - ro'yxat chapdan chiqadigan panel.
- **360–420 px** — `CLAUDE.md` UI qoidasi: hech bir ochiladigan element (tooltip, inspektor, ovoz tanlovi menyusi) ekran
  chetidan chiqmaydi (`position: fixed` + clamp, namuna `src/qisqartma.js`). Sahna SVG `viewBox` bilan masshtablanadi;
  kichik ekranda har qadam o'z "kamera" ramkasini beradi, shuning uchun mayda bo'lib qolmaydi.

---

## 4. Umumiy dvigatel — `src/sahna/`

### 4.1. Fayllar

```text
src/sahna/
  ikonkalar.js        o'zimizning SVG ikonkalar
  kamera.js           ramka hisoblash (tugunlar ro'yxatidan viewBox) va silliq o'tish
  sahna-holat.js      qadamlar ro'yxatidan har qadamning to'liq holatini yig'ish (merge), farqni hisoblash
  ijro.js             ijro mashinasi: holat (to'xtagan | ijroda | pauza), tezlik, qadam, vaqt chizig'i, hodisalar navbati
  ovoz.js             ovoz bilan sinxron: audio, timings, so'z belgilash, langarlar (5-bo'lim)
  klaviatura.js       tezkor tugmalar (bitta ro'yxat — yordam oynasi shu ro'yxatdan chiziladi)
  marshrut.js         URL ↔ (dars, qadam, ko'rinish, paket) holati
  progress.js         o'tilgan qadamlar/darslar — mavjud `src/store.js` syncedMap orqali
  SahnaQobiq.vue      3.4-bo'limdagi joylashuv (slotlar bilan)
  SahnaSvg.vue        tugun, chiziq, oqim, yorliq, karta chizuvchi
  QadamKarta.vue      nishon, matn, callout, "nima o'zgardi", tugmalar
  QadamRelsi.vue      pastdagi qadamlar relsi
  Metrikalar.vue      metrika kartalari (qiymat o'zgarganda raqam silliq almashadi)
  IjroPanel.vue       ijro/pauza, qadam, orqaga, qayta, tezlik, ovoz yoqish/o'chirish
  YordamOyna.vue      "?" — tezkor tugmalar
  MiniSahna.vue       bob ichiga joylanadigan ixcham variant (4.6)
```

Kutubxona qo'shilmaydi. Hammasi Vue 3 + SVG, mavjud loyiha kabi. Animatsiyalar — CSS transition va
`requestAnimationFrame`, oqim nuqtalari esa SVG `<animateMotion>` emas, JS (to'xtatish, tezlik va ovozga bog'lash uchun).

### 4.2. Ma'lumot formati (ikkala vizualizator uchun umumiy asos)

Har dars — bitta `.js` fayl. Lazy import qilinadi: butun kurs bitta bundle'da yuklanmaydi (namunalarda bitta katta
bundle edi).

```js
// src/sahna/darslar/<id>.js
export default {
  id: 'http-1-1',
  tur: 'paket',                       // 'paket' | 'tizim' — qaysi qobiq
  sarlavha: 'HTTP/1.1 so‘rovi',
  shior: 'Manzil yozilgandan sahifa kelguncha — paketma-paket.',
  daraja: 'boshlang‘ich',             // boshlang‘ich | o‘rta | murakkab
  daqiqa: 6,
  kitob: [{ kitob: 'web-asoslari', bob: '05-http-umumiy' }],   // bog'liq boblar
  manba: ['RFC 9110', 'RFC 9112'],                             // "Rasmiy hujjat" — aniq havola bilan
  sinov: { qayerda: 'VPS', sana: '2026-11-..', versiyalar: { curl: '…', nginx: '…' } },
  organasiz: ['…', '…'],             // "Siz o'rganasiz" ro'yxati
  tugunlar: { klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10' }, … },
  chiziqlar: { 'klient-router': ['klient', 'router'], … },
  qadamlar: [
    {
      qisqa: 'DNS',                    // relsda
      nishon: 'texnika',               // muammo | sozlash | texnika | tushuncha | keys | xulosa
      sarlavha: 'Server manzilini topish',
      matn: ['…', '…'],                // ekranda; `atama` va **qalin** — mini markdown
      ovoz: '…',                       // ixtiyoriy: o'qiladigan matn (5.2); bo'lmasa sarlavha + matn
      callout: { tur: 'goya', matn: '…' },        // goya | maslahat | ogoh
      ozgardi: ['+ DNS rezolver', '~ vaqt 0 → 12 ms'],
      sahna: { korinadi: ['klient', 'router', 'dns'], kamera: ['klient', 'dns'], teglar: {…}, kartalar: [...] },
      hodisalar: [ /* vaqt chizig'i: paketlar, oqimlar, metrika o'zgarishi — 4.3 */ ],
      metrikalar: { … },               // 'tizim' turida
    },
  ],
}
```

Qoidalar:

- **Qadam holati yig'iladi.** Har qadamda faqat o'zgargan narsa yoziladi, `sahna-holat.js` oldingi qadamlar bilan
  birlashtiradi. Har qadamga to'g'ridan-to'g'ri o'tish mumkin (`#/…/7`), oldingi qadamlarni ijro qilish shart emas.
- **Matn, ovoz va manba bir joyda.** Shunda ovozni qayta yaratish kerakligi `hash` orqali aniqlanadi (5.4).
- **Validator** — `scripts/sahna-tekshir.mjs`, `npm run sync` ichida ishlaydi. Tekshiradi:
  - har tugun va chiziq e'lon qilingan;
  - `kitob` havolalari mavjud boblarga olib boradi;
  - `manba` bo'sh emas;
  - `sinov` sanasi bor;
  - ovoz langarlari (5.3) matnda topiladi.

### 4.3. Hodisalar va vaqt chizig'i

Qadam ichida hodisalar ketma-ket yoki vaqt bo'yicha bajariladi:

```js
hodisalar: [
  { tur: 'paket', id: 'p1', dan: 'klient', ga: 'dns', rang: 'sorov', yorliq: 'DNS so‘rovi', qatorlar: ['A? sayt.test'] },
  { tur: 'paket', id: 'p2', dan: 'dns', ga: 'klient', rang: 'javob', yorliq: 'DNS javobi', qatorlar: ['A 203.0.113.10'] },
  { tur: 'oqim', chiziq: 'lb-a', tezlik: 1.6, naqsh: ['sorov', 'ogir'] },     // davomli oqim (tizim)
  { tur: 'metrika', kalit: 'p95', qiymat: 1200 },
  { tur: 'teg', tugun: 'b', matn: '23 ta navbatda', rang: 'xato' },
  { tur: 'kutish', ms: 400 },
]
```

- **Ijro ikki rejimda:**
  - **Ovozli** — hodisa ovozdagi langarga bog'langan bo'lsa, o'sha so'z aytilganda boshlanadi (5.3), bog'lanmaganlari
    oldingi hodisadan keyin ketma-ket;
  - **Jim** — hammasi ketma-ket, standart tezlikda.
- **Tezlik** — `0.5×`, `0.75×`, `1×`, `1.25×`, `1.5×`. Ovozli rejimda audio `playbackRate` ham shu.
- **"Bittadan"** (namunadagi `S`) — har paketdan keyin to'xtaydi.
- Orqaga qaytish (`←`) qadam boshiga sakraydi va yig'ilgan holatni chizadi. Animatsiya teskari o'ynalmaydi.

### 4.4. Marshrut, ulashish, progress

- Sayt `vue-router` (history) ishlatadi, shuning uchun hash emas, oddiy yo'l:
  - `/paketlar/<protokol>/<qadam>`;
  - `/arxitektura/darslar/<dars>/<qadam>`.

  Qo'shimcha holat query'da: `?k=ketma` (ko'rinish), `?p=6` (ochiq paket). Har holatni havola bilan ulashish mumkin.
  GitHub Pages'da to'g'ridan-to'g'ri ochilganda 404 → `404.html` orqali ochiladi — mavjud trenajorlardagidek.
- **Progress** — `src/store.js` dagi `syncedMap('sahna', 'docs-sahna-v1')`. Akkaunt bilan kirilsa `sync.js` boshqa
  qurilmalarga ham ko'chiradi (o'qish belgilari bilan bir xil).
  - Saqlanadi: o'tilgan qadamlar, tugatilgan darslar, oxirgi joy.
  - Chap ro'yxatda modul bo'yicha `3/5`; sayt bosh sahifasidagi kitob kartasida "Darslar: 4/20".
- **Davom ettirish** — oxirgi ochilgan dars va qadam (`sdt:last` g'oyasi). Kitob sahifasida "Davom: HTTP/1.1, 4-qadam".

### 4.5. Qidiruv

- Mavjud `SearchDialog.vue` + `search-index.json` kengaytiriladi: `npm run sync` darslar fayllaridan sarlavha, qisqa nom,
  matn va atamalarni indeksga qo'shadi.
- Natijada "Dars · 3-qadam" turi chiqadi. Bosilganda shu qadam ochiladi.
- Vizualizator ichida `⌘K`/`/` — sayt qidiruvi, lekin filtr "faqat darslar" holatida ochiladi.

### 4.6. Kitob bilan bog'lash

- **Bob ichida mini sahna.** Mavjud mexanizm: markdown'da `<div data-animatsiya="nom">` (`src/views/DocPage.vue:171`).
  - Yangi tur: `<div data-animatsiya="sahna" data-dars="http-1-1" data-qadam="3-5"></div>`.
  - Bob ichida faqat ko'rsatilgan qadamlar oralig'i ijro bo'ladi: ixcham, ro'yxatsiz, kartasiz, faqat sahna + qisqa izoh + ijro paneli.
  - Pastida "To'liq darsni ochish →".
- **Darsdan bobga.** Qadam kartasida "Bobda batafsil: Web asoslari, 05-bob" (`kitob` maydoni).
- **Trenajorga.** Mos joyda "O'zingiz sinab ko'ring" tugmasi:
  - "Paket yo'li" → HTTP laboratoriyasi (`/web-asoslari/trenajor`), Linux trenajori;
  - "Tizim dizayni" → `/arxitektura/trenajor` simulyatori, dars oxiridagi sozlama bilan.
- **Kitob README'sidagi "Animatsiyalar" jadvallari** (masalan, `content/web-asoslari/README.md` 125-qator,
  `content/xabar-tizimlari/README.md`) — shu dvigatel uchun tayyor ro'yxat. Dars yozilgach, jadvalga havola qo'shiladi.

### 4.7. Kirish imkoniyati (accessibility)

- Har tugma `aria-label` bilan; klaviatura bilan hamma narsa ishlaydi; fokus ko'rinadi.
- Sahna SVG — `role="img"` + `aria-label` (qadam sarlavhasi).
- Paketlar jadvali — haqiqiy `<table>`. Ekran o'quvchi uchun sahna o'zgarishi `aria-live="polite"` hududida ham yoziladi
  ("2-paket: DNS javobi, 8.8.8.8 dan klientga").
- `prefers-reduced-motion` (3.3) va kontrast: tokenlar ikkala temada WCAG AA darajasida.

### 4.8. Unumdorlik

- Har dars lazy chunk. Dvigatel ~40–60 KB maqsad (gzip'gacha).
- Bir vaqtda oqim nuqtalari ≤ 150 ta. Ko'p bo'lsa zichlik bilan ko'rsatiladi, har so'rov alohida emas — `Sxema.vue` dagi
  usul.
- Ko'rinmaydigan tabda (`document.hidden`) ijro pauza qiladi.

---

## 5. Ovoz — eng muhim farq

Mavjud quvur (`docs/tts.md`) qayta ishlatiladi:

- ovoz — Gemini TTS, hozirgi ovoz **Charon**, keyin Kore;
- so'z vaqtlari — `scripts/align.py` (MMS forced aligner);
- pleyer — `ListenPlayer.vue` dagi so'z belgilash (CSS Custom Highlight API).

### 5.1. Quvur

```text
src/sahna/darslar/*.js ──npm run sync──▶ segments/sahna/<dars>.txt/.json   (har qadam [step N] bilan)
                       ──npm run tts -- --book sahna──▶ audio/<ovoz>/sahna/<dars>.ogg
                       ──npm run tts:align──▶ <dars>.words.json (so'z vaqtlari)
                       ──scripts/sahna-vaqt.mjs──▶ <dars>.qadamlar.json  { qadam, at, langarlar: { p1: 3.42, … } }
                       ──npm run tts:publish -- --books sahna──▶ public/tinglash/<ovoz>/sahna/
```

- **Bitta dars = bitta Gemini so'rovi** (bepul limit kuniga 10 so'rov — `docs/tts.md`). Dars ~8–14 qadam × ~50 so'z
  ≈ 400–700 so'z ≈ 3–5 daqiqa audio, so'rov hajmiga sig'adi.
- Qadam chegaralari — `[pause]` + so'z vaqtlari. Har qadamning boshlanish soniyasi `qadamlar.json` ga yoziladi.
- Talaffuz — mavjud `scripts/talaffuz.json` kengaytiriladi. Kerakli yozuvlar:
  - `TCP` → "ti-si-pi", `SYN-ACK` → "sin-ak", `p95` → "p to'qson besh", `QPS` → "kyu-pi-es";
  - IP manzillar o'qilmaydi, ovoz matnida "server manzili" deyiladi (5.2).
- Gallyutsinatsiya va chegara xatolari (`docs/tts.md` "Model o'zidan qo'shgan nutq") — tinglab tekshiriladi, kerak bo'lsa
  `--redo`.

### 5.2. Ovoz matni ekrandagi matndan farq qilishi mumkin

- Ekranda: `GET / HTTP/1.1`, `203.0.113.10`, jadval. Ovozda bu o'qilmaydi — og'zaki tasvir: "Brauzer serverga bosh
  sahifani so'rab GET so'rovini yuboradi".
- `ovoz` maydoni bo'lmasa — `sarlavha` + `matn` dan avtomatik yasaladi. `segments.mjs` dagi qoidalar ishlaydi: kod
  o'qilmaydi, `` ` `` olib tashlanadi, URL → "havola".
- Bu `docs/tts.md` dagi "Kod bloklarini tinglash" rejasi (`<!-- tinglash: … -->`) bilan bir xil g'oya. O'sha yerda
  sinalgan yechim shu yerda ham ishlatiladi.

### 5.3. Animatsiyani ovozga bog'lash — langarlar

Ovoz matnida yashirin belgilar:

```js
ovoz: 'Avval brauzer DNS rezolverdan manzilni so‘raydi {p1}, rezolver esa javob qaytaradi {p2}.'
```

- `{p1}` TTS'ga yuborilmaydi (olib tashlanadi), lekin uning so'z tartibi eslab qolinadi.
- `words.json` dagi o'sha so'zning vaqti — `qadamlar.json` dagi `langarlar.p1`.
- Ijroda `p1` hodisasi aynan "so'raydi" so'zi tugaganda boshlanadi. Natijada paket ovoz aytgan paytda yuradi.
- Langarsiz hodisalar ketma-ket. Validator har langar uchun mos hodisa `id` borligini tekshiradi.

### 5.4. Pleyer xatti-harakati

| Holat | Nima bo'ladi |
| --- | --- |
| Ovoz yoqilgan (standart, audio bor bo'lsa) | qadam ochilganda audio shu qadamning `at` dan boshlanadi; matnda o'qilayotgan so'z belgilanadi (`::highlight`); qadam ovozi tugagach — 0,8 s pauza va keyingi qadamga avtomatik o'tadi (sozlamada "avtomatik o'tish" o'chirilsa — to'xtaydi) |
| Foydalanuvchi qadamni qo'lda almashtirdi | audio o'sha qadamning `at` ga sakraydi |
| Pauza / `Space` | audio ham, animatsiya ham to'xtaydi |
| Tezlik | audio `playbackRate` va animatsiya tezligi birga |
| Paket inspektori ochildi | ovoz pauza qiladi (o'quvchi baytlarni o'qiyapti) |
| Ovoz o'chirilgan yoki audio yo'q | jim rejim (4.3); ovoz tugmasi "Ovoz hali tayyor emas" deydi |
| Matnni bosish | o'sha so'zdan tinglash (mavjud pleyerdagidek) |

- Ovoz tanlovi (Charon/Kore) — sayt sozlamasi (`src/settings.js`), bob pleyeri bilan umumiy.
- Audio faqat tinglaganda yuklanadi (service worker oldindan yuklamaydi, `docs/tts.md`).
- Saqlash: bitta dars ≈ 4 daqiqa × 24 kbps ≈ 0,7 MB. 40 dars ≈ 30 MB — `public/tinglash/` ga sig'adi. Tashqi omborga
  ko'chish qarori kitoblar bilan umumiy (`docs/tts.md` "Saqlash").

### 5.5. Ovozsiz zaxira

Brauzerning `speechSynthesis` iga **o'tilmaydi**: o'zbek ovozi ko'p qurilmada yo'q yoki sifatsiz. Namunada ham bu yo'l
o'chirilgan. Audio yo'q dars to'liq jim rejimda ishlaydi va sifat buzilmaydi.

---

## 6. Haqiqiylik va manba qoidasi (`CLAUDE.md` asosida)

| Narsa | Qoida |
| --- | --- |
| Har da'vo | rasmiy manba (RFC, rasmiy hujjat) — darsning `manba` maydonida va qadam kartasida "Manba" havolasi |
| Paket, bayt, vaqt | haqiqiy yozuvdan (`paket-yoli.md` 3-bo'lim). Namuna qiymat bo'lsa — ochiq belgi (namunadagi `E.G.` o'rniga bizda **"misol"** nishoni) |
| Metrika (tizim dizayni) | yoki VPS'dagi haqiqiy o'lchov (sana, asbob, versiya bilan), yoki **ochiq belgilangan model** (`TAXMIN`, `arxitektura-simulyator/README.md` dagi kabi). Ikkalasi aralashmaydi; har metrika kartasida belgi bor |
| Versiyalar | dars `sinov.versiyalar` da, kitob README'sidagi jadval bilan bir xil |
| Tekshirib bo'lmagan | yozilmaydi; kerak bo'lsa `⚑` va egasiga aytiladi |
| Maxfiylik | VPS IP hech qachon ko'rinmaydi — hujjat diapazonlariga niqoblanadi (`203.0.113.10`, `198.51.100.x`, `192.0.2.x`); MAC, hostname, machine-id, kalitlar ham niqoblanadi |

---

## 7. Testlar

| Test | Nima tekshiradi | Qayerda |
| --- | --- | --- |
| `scripts/sahna-tekshir.mjs` | ma'lumot validatori (4.2) | `npm run sync` |
| `test/sahna/holat.mjs` | qadam holatini yig'ish: har qadamga to'g'ridan-to'g'ri o'tish ketma-ket ijro bilan bir xil natija beradi | node |
| `test/sahna/ijro.mjs` | hodisalar tartibi (RabbitMQ trenajoridagi `ketmaketlik.mjs` saboqi: natija sabab yetib kelgandan keyin ko'rinadi), pauza/davom, tezlik | node |
| `test/sahna/ovoz.mjs` | langar vaqtlari: `qadamlar.json` dagi har langar `words.json` dagi so'zga to'g'ri keladi; qadam chegaralari monoton | node |
| `test/sahna/brauzer.mjs` | Playwright: 1440, 1024, 390 px; yorug' va qorong'i; har darsning har qadami skrinshot; elementlar ekrandan chiqmaydi; matn chiziq/tugun bilan ustma-ust tushmaydi (bounding box kesishuvi) | dev server 5182 |
| Vizual audit | video qoidasi kabi: skrinshotlar **ko'z bilan** ko'riladi, 0 to'qnashuv tasdiqlanmaguncha PR ochilmaydi | qo'lda |

Avtomatik to'qnashuv tekshiruvi: SVG'dagi har yorliq `getBBox()` bilan yig'iladi, juftlar kesishuvi hisoblanadi. Bu
`video/audit-suite.mjs` qila olmagan narsani qisman qoplaydi, lekin ko'z bilan tekshirishning o'rnini bosmaydi.

---

## 8. Ish tartibi va bosqichlar

1. **Dvigatel MVP** (bitta PR):
   - `src/sahna/` asosiy fayllar;
   - bitta namunaviy dars har turdan — "Paket yo'li"dan HTTP/1.1, "Tizim dizayni"dan "So'rov yo'li";
   - jim rejim, marshrut, progress, testlar;
   - ovoz hali yo'q.
2. **Ovoz:**
   - `segments` + `tts` + `align` + `sahna-vaqt.mjs`;
   - 2 ta namunaviy dars ovozlanadi;
   - **egasi tinglab tasdiqlaydi**, keyin ommaviy.
3. **Kontent to'lqinlari** — har vizualizator o'z rejasidagi tartibda. Bitta PR = 2–4 dars.
4. **Mini sahna** kitob boblariga joylanadi. Mavjud `src/animatsiya/*` ikonkalari yangi to'plamga o'tkaziladi.
5. Har bosqich — `main` dan alohida branch, PR `main` ga, merge — egasi. Commit/PR matnida AI atributsiyasi yo'q.

Holat `docs/keyingi-ishlar.md` ga yoziladi (yangi bo'lim "Vizualizatorlar").

---

## 9. Ochiq savollar (egasining qarori kerak)

1. **Uslub:** tekis 2D (tavsiya) yoki o'zimizning yengil izometriya (3.3)?
2. **Nomlar:** "Paket yo'li" va "Tizim dizayni darslari" — ma'qulmi? Saytda qayerda: bosh sahifada alohida "Vizual
   darslar" bo'limi yoki faqat kitoblar ichida?
3. **Ovoz:** dastlab faqat Charon. Kore keyin, kitoblar bilan birga — to'g'rimi?
4. **Avtomatik o'tish:** ovoz tugagach keyingi qadamga o'zi o'tsinmi (tavsiya — ha, o'chirish mumkin)?
5. **Til:** faqat o'zbekcha (lotin). Namunalarda 22 til bor, lekin bizning sayt bir tilli — tavsiya: tarjima yo'q.

---

## 10. Keyingi g'oyalar uchun

Yangi vizualizator (masalan, "Git ichidan", "Kafka partitsiyalari", "React render sikli") shu dvigatelga quyidagicha
qo'shiladi:

1. Yangi `tur` (qobiq slotlari: chap ro'yxat, sahna ustidagi qator, pastki panel).
2. Kerak bo'lsa yangi hodisa turlari (4.3) va ikonkalar (3.3).
3. Darslar `src/sahna/darslar/` da, shu formatda. Ovoz, progress, qidiruv, mini sahna va testlar avtomatik ishlaydi.
4. Haqiqiy ma'lumot manbasi aniqlanadi (VPS, trenajor VM, rasmiy hujjat) — 6-bo'lim.

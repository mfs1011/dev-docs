# SQL videolari — uslub va tayyorlash tartibi

Faqat **SQL qo'llanmasi** videolari uchun. Namuna: `sql-umumiy/` ("SQL qanday ishlaydi", 4:45) — foydalanuvchi ma'qullagan
("usuli menga juda yoqdi", 2026-10-14). Git videolari uslubi boshqa — [GIT-VIDEO-USLUBI.md](GIT-VIDEO-USLUBI.md); ikkisini aralashtirmang.

Yangi SQL videosi: `cp -R sql-umumiy sql-<mavzu>`, keyin `narration.js`, `anim.js` dagi sahnalar va `cues.js` ni almashtiring.
Qolgan fayllar (`sync.js`, `voice.mjs`, `build-timing.mjs`, `music.mjs`, `mix.sh`, `render.mjs`, `stills.mjs`, `poster.mjs`) o'zgarmasdan ishlaydi.

## 1. Asosiy g'oya

| Tamoyil | Nimani anglatadi |
| --- | --- |
| **Ovoz birinchi** | Avval hikoya matni yoziladi va ovozlanadi; animatsiya keyin **aytilgan so'zlarga** bog'lanadi ("order bay" deyilganda qatorlar saralanadi). Git'dagidek animatsiyani cho'zish yo'q |
| **Haqiqiy ma'lumot** | Ekrandagi har jadval, natija va xabar sinov bazasida bajarilgan so'rovdan (`natijalar.txt`). Yoddan yozilgan natija yo'q |
| **Ma'lumot oqimi** | So'rov bosqichlari ko'z oldida: qatorlar chiziladi va yo'qoladi (WHERE), ustun ketadi (SELECT), qatorlar o'rin almashadi (ORDER BY), guruhga uchadi (GROUP BY), juftlashadi (JOIN) |
| **Yoshga neytral** | Hayotiy misol — kichik do'kon (daftar, qalam, Ali, Malika). Atama avval oddiy so'z bilan, keyin nomi: "birlamchi kalit … PRIMARY KEY" |
| **Lo'nda** | Bitta sahna — bitta g'oya, 2–4 gap. Umumiy video ~5 daqiqa; mavzu videosi 1,5–3 daqiqa |

## 2. Misol ma'lumotlari — bitta do'kon hamma videoda

Hamma SQL videolari **bitta do'kon sxemasini** ishlatadi — tomoshabin uni taniydi:
`video/sql-umumiy/dokon.sql` → PostgreSQL sinov bazasi (`qollanma`), alohida `video_dokon` sxemasi (kitob misollariga tegmaydi).

| Jadval | Ustunlar | Qatorlar |
| --- | --- | --- |
| `mijozlar` | id, ism, shahar | Ali (Toshkent), Malika (Samarqand), Jasur (Buxoro), Nodira (Toshkent) |
| `mahsulotlar` | id, nomi, narxi | Daftar 8000, Qalam 3000, Kitob 45000, Ruchka 5000, Sumka 120000 |
| `buyurtmalar` | id, mijoz_id → mijozlar, mahsulot_id → mahsulotlar, soni | 6 ta |
| `hisoblar` | egasi, balans | Ali 100000, Malika 20000 (tranzaksiya misoli) |

Yangi mavzuga ustun yoki jadval kerak bo'lsa — shu sxemaga qo'shiladi (`dokon.sql`), yangi do'kon o'ylab topilmaydi.

```bash
cd /Users/mfsv/Projects/experiment/sql-sinov && source env.sh      # PG 18, port 5432 (sql-kitob muhiti)
pg -q -f <video>/dokon.sql
pg -X -e -f <video>/sorovlar.sql | tee <video>/natijalar.txt       # har so'rov va uning haqiqiy chiqishi
```

Da'volar rasmiy hujjatdan (loyiha qoidasi): masalan, `SELECT` bajarilish tartibi — PostgreSQL `sql-select.html`,
indeks — `indexes-intro.html` ("kitob oxiridagi alifbo ko'rsatkichi" o'xshatishi hujjatning o'zida),
tranzaksiya — `tutorial-transactions.html` ("all-or-nothing"). Manbalar `narration.js` boshida izohda yoziladi.

## 3. Hikoya matni (`narration.js`)

- Har gap: `[id, sahna, matn]`; sahnalar ro'yxati `scenes`. Matn **quloq uchun** — to'liq og'zaki jumlalar, belgilarsiz
  (qavs, strelka, plyus yo'q), buyruq jumla ichida ("WHERE shartga mos kelmagan qatorlarni chiqarib tashlaydi").
- Sahna tuzilishi: **savol yoki muammo → jadval → so'rov → natija**. Natija ovozda ham aytiladi ("Natija tayyor: qalam, ruchka va daftar").
- Kirish ("Salom! Bugun … bilan tanishamiz") va xotima ("E'tiboringiz uchun rahmat! …") ovozli.
- Ehtiyotkor iboralar: "baza bunga yo'l qo'ymaydi va xato beradi", "WHERE shartini unutmang" — amaliy ogohlantirish har mavzuda bittadan.
- CC subtitri — shu matnning o'zi (uzun gap ikki qatorga bo'linadi).

Talaffuz (`voice.mjs` dagi `SAY`, faqat modelga ketadigan matnda; ekranda asl yozuv):

| Ekranda | Aytiladi | Ekranda | Aytiladi |
| --- | --- | --- | --- |
| SQL | es-kyu-el | INSERT | insert |
| PostgreSQL | Postgres | UPDATE | apdeyt |
| MySQL | May es-kyu-el | DELETE | dilit |
| SQLite | Es-kyu-layt | CREATE INDEX | kriyeyt indeks |
| SELECT | selekt | COMMIT | kommit |
| FROM | from | ROLLBACK | roulbek |
| WHERE | ver | count | kaunt |
| JOIN | joyn | id | ay-di |
| GROUP BY / ORDER BY | grup bay / order bay | | |

"id ga" kabi qo'shimchani alohida qoldirmang — "id ustuniga" deb yozing. Yangi atama qo'shilsa — shu jadvalga ham yozing.

## 4. Vizual uslub — "daftar"

| Narsa | Qiymat |
| --- | --- |
| Fon | Qog'oz `#fbf7ee`, katakli to'r (40 px, har 5-chizig'i quyuqroq), mayda dog'lar, yumshoq vinyetka |
| Siyoh | Asosiy `#2b2d42`, qalam kulrang `#8a8578` |
| Markerlar | ko'k `#2f6fdb` (SQL kalit so'zlari, asosiy), yashil `#2e9e5b` (to'g'ri natija, COMMIT), qizil `#e0533d` (xato, o'chirish), to'q sariq `#f08c2e` (kalit, bajarilish tartibi), binafsha `#7c5cd6`, moviy-yashil `#169c9c`; sariq marker `rgba(255,214,10,.45)` — ajratish |
| Shriftlar | Qo'lda yozuv — Noteworthy (sarlavha, izoh, jadval sarlavhasi); matn — Avenir Next; kod va raqam — Menlo |
| Chiziqlar | Har chiziq ikki qatlam, mayda tebranish, **chizilib paydo bo'ladi** (`sline`, `srect`, `sellipse`, `arrow`, `p` — chizilgan qismi) |
| Joylashuv | Sarlavha chap yuqorida (`heading`, marker bilan tagiga chiziladi); asosiy mazmun y 230–900; pastki ~150 px CC subtitri uchun bo'sh |

Komponentlar (`anim.js`):

| Komponent | Vazifasi |
| --- | --- |
| `table(x, y, nom, cols, rows, o)` | Jadval: chizilib chiqadi; `o.row(i)` → `{slot, dy, a, strike, hl, hlCol, cellCol}`, `o.col(j)` → `{a, dx, hl}`, `visibleRows`, `width`. Ma'lumot oqimi shu orqali |
| `codeCard(x, y, w, qatorlar, o)` | SQL so'rovi: kalit so'zlar ko'k, `typed` — yozilish, `hl` — qatorni marker bilan, `badges` — bajarilish tartibi raqamlari |
| `outCard(...)` | psql chiqishi (yashil) yoki xato (qizil, `err: true`) — `natijalar.txt` dan so'zma-so'z |
| `sticky`, `card`, `marker`, `hand` | Yopishqoq qog'oz, karta, marker, qo'lda yozuv (chapdan o'ngga ochiladi) |
| `dbCylinder`, `keyIcon`, `shop`, `bookIcon`, `serverBox`, `laptop`, `fileIcon`, `check`, `cross` | Doodle'lar |

Harakat qoidalari: paydo bo'lish — chizilib/yozilib; ko'chish — `eio` (0,6–0,9 s); filtrlangan qator — qizil chiziq bilan
o'chiriladi, keyin yo'qoladi; qolgan qatorlar yuqoriga suriladi; natija — yashil marker yoki "(3 rows) ✓".

## 5. Sinxron: so'zga bog'lash (`sync.js`)

```js
const { L, W, WE } = window.SY;
L('L17')              // { s, e } — gap boshi/oxiri (video soniyasi)
W('L17', 'order')     // "order bay" aytila boshlagan payt
W('L13', 'tartibida') // prefiks, aytilgan shakl bo'yicha (selekt, ver, joyn …); n — nechanchi uchrashi
```

- So'zlarni **aytilgan shaklda** qidiring (`voice/lines.json` dagi `words`; ro'yxat: `node -e` bilan chiqarish mumkin).
- `node stills.mjs …` oxirida `missing: []` bo'lishi shart — topilmagan bog'lanish shu yerda chiqadi.
- Ovoz effektlari (`cues.js`) ham xuddi shu `W(...)` bilan — harakat va tovush bir vaqtda.

## 6. Vaqt (`build-timing.mjs`)

| Parametr | Qiymat | Ma'nosi |
| --- | --- | --- |
| `START` | 1,4 s | birinchi gapdan oldin sarlavha |
| `SCENE_GAP` | 1,6 s | sahnalar orasida qo'shiladigan jimlik (o'tish) |
| `HOLD` | gap bo'yicha 0,6–1,8 s | natija ko'rinib ulgurishi uchun gapdan keyingi to'xtash |
| `TAIL` | 3 s | oxirgi gapdan keyin |

Ovoz uzluksiz: gaplar orasidagi tabiiy pauza saqlanadi, kesish — chegaraga eng yaqin haqiqiy jimlikdan.
Natijada `voice/timing.js` (har gap va so'zning video vaqti), `voice/voice.wav`, `subtitles.vtt`, `chapters.vtt` (sahna nomlari — `SCENE_NAMES`).

## 7. Ovoz va musiqa

| Narsa | Qiymat |
| --- | --- |
| TTS | Gemini `gemini-3.8-flash-tts`, **Charon**, butun matn bitta so'rovda (~600 so'z — 1 so'rov) |
| Uslub ko'rsatmasi | `warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences` |
| Musiqa (`music.mjs`) | Re major, 96 BPM, Dmaj7–A–Bm7–Gmaj7; yumshoq pad, **marimba** arpedjio, bas, **shaker** + yengil "kick"; intro — faqat pad; marimba muammo sahnasidan, shaker jadvaldan; xulosada shaker tushadi |
| Effektlar (`cues.js`) | `scribble` — sarlavha yozilganda qalam shitirlashi; `tick` — so'rov yozilishi; `pop` — qator/natija paydo bo'lishi; `whoosh` — ko'chish; `strike` — qator o'chirilishi; `ding` — to'g'ri natija, COMMIT; `error` — xato, yo'qolgan pul; `swell` — kirish va xotima (faqat qo'ng'iroq, **shovqinsiz**) |
| Miks (`mix.sh`) | Musiqa ×0,5, gap paytida sidechain (ratio 3); ikki bosqichli loudnorm **-16 LUFS**, cho'qqi ≤ -1,5 dB |

**Ma'lum muammo (tuzatilgan):** Gemini WAV oxiriga 6070 baytlik C2PA bo'lagini (AI kelib chiqish belgisi) qo'shadi.
WAV'ni faqat `data` bo'lagi hajmi bo'yicha o'qing (`build-timing.mjs` shunday qiladi) — aks holda oxirida "bijillagan" shovqin chiqadi.
Xotimada shovqinli effekt ishlatmang.

## 8. Tayyorlash tartibi (papka ichida)

```bash
npm i --no-save playwright-core@1.57.0                   # yoki node_modules symlink
# 1) ma'lumot va natijalar (2-bo'lim)
# 2) hikoya
node voice.mjs --plan                                     # talaffuz shaklini o'qib chiqing
set -a; . ../../.env; set +a; node voice.mjs              # 1 so'rov
../../.venv-align/bin/python ../align-lines.py .          # so'z vaqtlari
node build-timing.mjs                                     # timing.js, voice.wav, VTT
# 3) animatsiya — anim.js sahnalari, har birini kadr bilan tekshirish
node stills.mjs 12 40 95 …                                # missing: [] bo'lsin
# 4) ovoz
node music.mjs && ./mix.sh                                # -16 LUFS
# 5) video
node render.mjs
ffmpeg -f concat -safe 0 -i segs/list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart full.mp4
ffmpeg -i full.mp4 -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart web.mp4
node poster.mjs && ffmpeg -i poster.png -vf scale=1280:-2 -q:v 3 poster.jpg
# 6) sayt: public/video/sql/<nom>.{mp4,jpg,chapters.vtt,uz.vtt}; asl full.mp4 — Google Drive (rclone, gdrive:dev-docs/video/<nom>)
```

Saytga qo'yish (umumiy video — README boshiga, mavzu videosi — bobning "Tushuncha" bo'limiga):

```html
<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/<nom>.jpg" src="/video/sql/<nom>.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/<nom>.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/<nom>.uz.vtt">
</video>
<figcaption>… Natijalar — haqiqiy PostgreSQL 18 bazasidan.</figcaption>
</figure>
```

## 9. Tekshiruv ro'yxati

- [ ] Har natija `natijalar.txt` da bor (sinov bazasida bajarilgan), da'volar rasmiy hujjatga tayangan
- [ ] `node voice.mjs --plan` — matn quloq uchun, talaffuz jadvali bo'yicha
- [ ] `align-lines.py` — gaplar ketma-ket, so'z vaqtlari bor
- [ ] `node stills.mjs` — har sahnadan kadr, `missing: []`, matn ustma-ust tushmaydi, pastki 150 px bo'sh
- [ ] Miks: -16 LUFS, cho'qqi ≤ -1,5 dB; oxirgi 25 s spektrogrammasida keng chastotali chiziq yo'q
- [ ] Saytda: video, bo'limlar, CC, telefon kengligi, konsolda xato yo'q
- [ ] Asl nusxa Drive'da (`rclone check` — 0 differences)
- [ ] Foydalanuvchi eshitib ma'qulladi

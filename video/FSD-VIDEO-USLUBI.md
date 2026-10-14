# FSD videolari — uslub va tayyorlash tartibi

Faqat **FSD qo'llanmasi** videolari uchun. Namuna: `fsd-umumiy/` ("FSD qanday ishlaydi", 3:32) — foydalanuvchi ma'qullagan (2026-10-14).
Git va SQL uslublari boshqa ([GIT-VIDEO-USLUBI.md](GIT-VIDEO-USLUBI.md), [SQL-VIDEO-USLUBI.md](SQL-VIDEO-USLUBI.md)) — aralashtirmang.

Yangi FSD videosi: `cp -R fsd-umumiy fsd-<mavzu>`, keyin `narration.js`, `anim.js` dagi sahnalar va `cues.js` ni almashtiring.
`sync.js`, `voice.mjs`, `build-timing.mjs`, `music.mjs`, `mix.sh`, `render.mjs`, `stills.mjs`, `poster.mjs` o'zgarmasdan ishlaydi.

**Bob videosi** (bitta bob — bitta video, bobning "Qisqacha" bo'limi boshida): namuna `fsd-01/` ("FSD nima va qachon kerak", 3:54), shu papkadan nusxa oling.
Unda `narration.js` sahna nomlari (`sceneNames`) va gapdan keyingi pauzani (`hold`) ham beradi — `build-timing.mjs` shulardan o'qiydi;
`music.mjs` dagi `tStart`/`tPerc`/`tOutro` gap id'lari yangi matnga moslanadi. Bob jadvallari (kimga mos, afzalliklar, tipik xatolar) o'ng panelda
kartalar bo'lib chiqadi, bino chapda qoladi (`SIDE` kamerasi). Qavat ichidagi xona yoki eshik ko'rsatilsa, yuqori qavatlar portlatilgan ko'rinishda ko'tariladi,
aks holda ular xonani yopib qo'yadi. Ishlatilmaydigan qavat — punktir (`ghost`).

## 1. Asosiy g'oya

| Tamoyil | Nimani anglatadi |
| --- | --- |
| **Bitta olam, uzluksiz kamera** | Butun video — bitta izometrik 3D olam (bino). Sahnalar kesilmaydi: kamera binoga, qavatga, xonaga yaqinlashib kiradi va chiqadi |
| **Bino metaforasi** | Abstrakt arxitekturani har yoshdagi tomoshabin tushunadigan narsaga aylantiradi (2-bo'lim) — har FSD videosida bir xil |
| **Ovoz birinchi** | Hikoya avval ovozlanadi (Kore), har harakat aytilgan so'zga bog'lanadi (`SY.W`) |
| **Haqiqiy dalil** | Qoida buzilishi — haqiqiy **Steiger** chiqishi (`namuna/` va `namuna-xato/`), yoddan yozilmaydi |
| **Lo'nda** | Bitta sahna — bitta qoida, 2–4 gap. Umumiy video ~3,5 daqiqa; mavzu videosi 1,5–3 daqiqa |

## 2. Metafora — har FSD videosida bir xil

| FSD | Binoda | Ko'rinishi |
| --- | --- | --- |
| Qatlam (layer) | **Qavat** | Rangli plita; pastdan yuqoriga: shared → entities → features → widgets → pages → app |
| `processes` | Bino yonida suzib turgan **punktir qavat** | "eskirgan" deb qizil chiziq bilan |
| Slice | **Xona** | Qavat ustidagi quti, nomi ustida (`product`, `cart`) |
| Segment | Xona ichidagi **kub** | `ui`, `api`, `model`, `lib`, `config` — har biri o'z rangida |
| Public API (`index.ts`) | Xonaning **kirish eshigi** | Xonaning old yuzida jigarrang eshik, ustida `index.ts` |
| Import qoidasi | **Faqat pastga yuradigan lift** | Bino yonidagi shaffof shaxta, kabina; yashil — ruxsat, qizil — taqiqlangan |
| Cross-import | Xonalar orasida **eshik yo'q** | Qizil punktir devor va ✗ |
| Pages-first | Kod avval **sahifa qavatida** | `app` ko'tariladi, sariq kublar `pages` ustida; takrorlangani tashqaridan pastga tushadi |

Qatlam ranglari (`LAYERS`): shared `#94a3b8`, entities `#fb7185`, features `#fbbf24`, widgets `#34d399`, pages `#60a5fa`, app `#a78bfa`.
Misol sohasi — **do'kon frontendi** (SQL videolari va FSD kitobining 37-bobi bilan bir xil): `product`, `cart`, `add-to-cart`, `header`, `product-list`, `catalog`.

## 3. Namuna loyiha va Steiger

`fsd-umumiy/namuna/` — qoidalarga mos do'kon frontendi (TypeScript, `@/*` → `src/*`), `namuna-xato/` — o'sha loyiha uchta ataylab kiritilgan xato bilan:
yuqoriga import (`entities/product` → `features/add-to-cart`), cross-import (`entities/cart` → `entities/product`), public API'ni chetlab o'tish
(`widgets/header` → `@/entities/cart/model/cart`).

```bash
cd fsd-umumiy/linter && npm i                                  # steiger@0.7.0, @feature-sliced/steiger-plugin@0.8.0
cd ../namuna && ln -sfn ../linter/node_modules node_modules
npx steiger src > ../steiger-toza.txt; cd ../namuna-xato && ln -sfn ../linter/node_modules node_modules && npx steiger src > ../steiger-xato.txt
```

Yangi qoida ko'rsatilsa — `namuna-xato/` ga shu xatoni qo'shing, Steiger'ni qayta ishga tushiring, `anim.js` dagi `ERR` ro'yxatiga **aynan** chiqqan matnni yozing.
Da'volar rasmiy hujjatdan: `feature-sliced.design/docs/get-started/overview`, `reference/public-api`, `guides/migration/from-v2-0` (manba `narration.js` boshida izohda).

## 4. Hikoya matni (`narration.js`)

- Har gap `[id, sahna, matn]`, quloq uchun: to'liq og'zaki jumlalar, belgilarsiz. Atama avval metafora bilan, keyin nomi:
  "Har bir qavat xonalarga bo'linadi. Ularni slice deyiladi."
- Sahna tuzilishi: **qoida → metaforadagi ko'rinishi → nima uchun kerak**. Har qoidada bitta "ruxsat ✓" va bitta "taqiqlangan ✗" misol.
- Kirish va xotima ovozli; xotimada metafora qisqa takrorlanadi ("lift faqat pastga yuradi, xonalar mustaqil, kirish faqat eshikdan").
- CC subtitri — shu matnning o'zi.

Talaffuz (`voice.mjs` dagi `SAY`, faqat modelga ketadigan matnda; ekranda asl yozuv):

| Ekranda | Aytiladi | Ekranda | Aytiladi |
| --- | --- | --- | --- |
| FSD | Ef-es-di | slice / Slice | slays / Slays |
| Feature-Sliced Design | Ficher-Slayst Dizayn | product, cart | prodakt, kart |
| shared | sherd | ui | Yu-ay |
| entities / entity | entitiz / entiti | api, API | ey-pi-ay |
| features / feature | fichers / ficher | config | konfig |
| widgets / widget | vijets / vijet | index.ts | indeks ti-es |
| pages | peyjiz | public | pablik |
| app | ep | Steiger | Stayger |
| processes | proseses | components, utils, helpers | komponents, yutils, xelpers |

So'z qidirishda chiziqcha saqlanadi: `W('L4', 'ef-es-di')` (`efesdi` emas).

## 5. Vizual uslub

| Narsa | Qiymat |
| --- | --- |
| Fon | Osmon gradienti `#cfe3ff → #eef5ff → #fff6e5`, sekin suzuvchi bulutlar; yer — och yashil izometrik katakli maydon |
| Proyeksiya | `sx = (x − y)·U`, `sy = (x + y)·U/2 − z·U`, `U = 60`; bino `BW 8 × BD 5`, qavat qalinligi `FH 0.9`, qadam `FS 1.25` |
| Yuzlar | Usti `+28%` och, chap `−5%`, o'ng `−20%` to'q, qirra `−35%` (`box`) |
| Shriftlar | Sarlavha — Avenir Next 800; nom, kod, yo'l — Menlo |
| Belgilar | Yashil `#16a34a` ✓ (ruxsat), qizil `#e11d48` ✗ (taqiqlangan), asosiy ko'k `#3b5bdb` |
| Joylashuv | Sarlavha chap yuqorida (har doim olam ustida — `title` navbati); qavat yorliqlari bino chapida; panel/terminal o'ng tomonda (kamera binoni chapga suradi); pastki ~150 px CC uchun bo'sh |

Komponentlar (`anim.js`):

| Komponent | Vazifasi |
| --- | --- |
| `box(x, y, z, w, d, h, rang, o)` | Izometrik quti; `o.a`, `o.dashed`, `o.shadow` |
| `building(t, st, {onFloor})` | Bino; `st(i)` → `{a, lift, glow, dim, red, green}`; `onFloor` — qavat ustiga chizish (xonalar) |
| `floorLabel(i, k, lift, desc)` | Qavat yorlig'i (rangli pill + izoh) |
| `rooms(i, zTop, k, o)` | Qavat xonalari (`ROOMS`); `roomK`, `roomCol`, `roomA`, `labelA` |
| `camera(t)` | Kamera kalit kadrlari `[vaqt, [tx, ty, zoom]]` — so'zga bog'langan, o'tish 1,6 s |
| `panel`, `pill`, `check`, `crossB`, `arrow2`, `title` | 2D qatlam: karta/terminal, yorliq, ✓/✗, strelka, sarlavha |

Harakat qoidalari: qavat yuqoridan tushib qo'nadi; ichini ko'rsatish uchun **portlatilgan ko'rinish** — tanlangan qavatdan yuqoridagilar `lift: 7` bilan ko'tarilib to'liq yo'qoladi;
xato — qavat qizil, to'g'ri — yashil yorug'lik; kamera yaqinlashuvi: bino `z≈0.92`, xona `1.55`, xona ichi `2.0–2.4`, xulosa `0.62`.
Muqova (`renderPoster`): bino chapda, "FSD" yozuvi o'ngda, markaz pleyer tugmasi uchun bo'sh.

## 6. Sinxron va vaqt

`SY.L`, `SY.W` — SQL bilan bir xil (`sync.js`). `build-timing.mjs`: `START 1.4`, `SCENE_GAP 1.6`, `TAIL 3`, `HOLD` — natija yoki portlatilgan ko'rinish ochilishi uchun gapdan keyin 0,4–1,6 s.
`node stills.mjs …` oxirida `missing: []` bo'lsin.

## 7. Ovoz va musiqa

| Narsa | Qiymat |
| --- | --- |
| TTS | Gemini `gemini-3.8-flash-tts`, ovoz **Kore**, butun matn bitta so'rovda |
| Uslub ko'rsatmasi | `warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences` |
| Musiqa (`music.mjs`) | Fa major, 100 BPM, Fmaj7–Dm7–B♭maj7–C; **fortepiano** akkordlari (yarim barda), **glockenspiel** (choraklarda), bas, yengil ritm; ritm qatlamlar sahnasidan, xulosada tushadi |
| Effektlar (`cues.js`) | `thunk` — qavat qo'nishi, eshik; `whoosh` — kamera ko'chishi; `pop` — yorliq, xona, segment, karta; `lift` — lift harakati (pastga tushuvchi uch nota); `ding` — ✓, "No problems found"; `error` — ✗, Steiger xatosi; `blip` — eskirgan qavat; `tick` — terminal yozuvi; `swell` — kirish va xotima (faqat qo'ng'iroq, **shovqinsiz**) |
| Miks (`mix.sh`) | Musiqa ×0,5, gap paytida sidechain; -16 LUFS, cho'qqi ≤ -1,5 dB |

WAV faqat `data` bo'lagi hajmi bo'yicha o'qiladi — Gemini oxiriga C2PA qo'shadi (aks holda oxirida shovqin).

## 8. Tayyorlash tartibi (papka ichida)

```bash
node voice.mjs --plan                                     # talaffuzni o'qib chiqing
set -a; . ../../.env; set +a; node voice.mjs              # 1 so'rov (Kore)
../../.venv-align/bin/python ../align-lines.py .
node build-timing.mjs
node stills.mjs 12 40 95 …                                # har sahna, missing: []
node music.mjs && ./mix.sh
node render.mjs
ffmpeg -f concat -safe 0 -i segs/list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart full.mp4
ffmpeg -i full.mp4 -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart web.mp4
node poster.mjs && ffmpeg -i poster.png -vf scale=1280:-2 -q:v 3 poster.jpg
# sayt: public/video/fsd/<nom>.{mp4,jpg,chapters.vtt,uz.vtt}; asl full.mp4 — Google Drive (gdrive:dev-docs/video/<nom>)
```

Saytga qo'yish (umumiy video — README boshiga, mavzu videosi — bobning "Tushuncha" bo'limiga):

```html
<figure class="video">
<video controls preload="metadata" playsinline poster="/video/fsd/<nom>.jpg" src="/video/fsd/<nom>.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/fsd/<nom>.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/fsd/<nom>.uz.vtt">
</video>
<figcaption>… Linter natijalari — haqiqiy Steiger 0.7.0 dan.</figcaption>
</figure>
```

## 9. Tekshiruv ro'yxati

- [ ] Har da'vo rasmiy FSD hujjatida bor; Steiger xabarlari `steiger-*.txt` dan so'zma-so'z
- [ ] `node voice.mjs --plan` — quloq uchun, talaffuz jadvali bo'yicha
- [ ] `node stills.mjs` — har sahna: sarlavha olam ustida, panel binoni yopmaydi, portlatilgan ko'rinishda ortiqcha qavat qolmagan, `missing: []`
- [ ] Miks: -16 LUFS, cho'qqi ≤ -1,5 dB; oxirgi 25 s spektrogrammasi toza
- [ ] Muqova: bino chapda, yozuv o'ngda, markaz bo'sh
- [ ] Saytda: video, bo'limlar, CC, konsolda xato yo'q; asl nusxa Drive'da (`rclone check` — 0 differences)
- [ ] Foydalanuvchi ko'rib ma'qulladi

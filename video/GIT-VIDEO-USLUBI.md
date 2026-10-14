# Git videolari — uslub va tayyorlash tartibi

Faqat **Git qo'llanmasi** videolari uchun. Namuna: `git-umumiy/` ("Git qanday ishlaydi", 3:24) — foydalanuvchi ma'qullagan.
Boshqa kitoblar uchun uslub alohida hal qilinadi; bu hujjatni ularga avtomatik qo'llamang.

Yangi Git videosi: `git-umumiy/` ni nusxalab (`cp -R git-umumiy git-<mavzu>`), sahnalar va matnni almashtiring.
Umumiy texnik tartib — [README.md](README.md); bu yerda **qanday chiqishi kerakligi**.

## 1. Vizual uslub

| Narsa | Qiymat |
| --- | --- |
| O'lcham | 1920×1080, 30 fps, deterministik `render(t)` (Canvas) |
| Fon | To'q ko'k gradient `#080d1c → #121a38`, sekin suzuvchi zarrachalar, nuqtali to'r, ko'k/binafsha yumshoq nur, vinyetka |
| Shrift | Matn — Avenir Next; buyruq, hash, fayl nomi — Menlo |
| Ranglar | main/commit — ko'k `#4f8cff`, feature/branch — binafsha `#b46cff`, staging/push — yashil `#34d399`, o'zgargan fayl — to'q sariq `#ffb547`, HEAD — sariq `#ffd166`, jamoadosh/pull — pushti `#ff7ab6`, merge va Git brendi — `#f05133`, xato/konflikt — `#ff6b7a` |
| Komponentlar (`anim.js`) | `node` (commit doirasi, ichida qisqa hash), `link` (bola → ota strelka), `pill` (branch/HEAD ko'rsatkichi), `fileChip` (fayl + holat yorlig'i), `terminal` (buyruq yoziladi + haqiqiy chiqish), `panel` (hudud), `chip` (sahna raqami va nomi, chap yuqorida), `laptop`, `cloud`, `burst` (paydo bo'lish to'lqini) |
| Harakat | Paydo bo'lish — `eback` (sakrab), ko'chish — `eio`, chiqish — `eo`; sahnalar orasida 0,6 s yumshoq o'tish |

## 2. Mazmun va sahnalar

- Bitta video — bitta g'oya. Ketma-ketlik: **muammo → model → buyruq → natija**. Avval "nega", keyin "qanday".
- Har sahna chap yuqorida raqamli chip bilan ("2 · Uch hudud") va pleyerda bo'lim (WebVTT `chapters`) bo'ladi.
- Har buyruq terminalda yoziladi, uning **haqiqiy** chiqishi ko'rsatiladi (masalan, `Merge made by the 'ort' strategy.`, `Fast-forward`). Chiqishni yoddan yozmang — sinov repo'sida tekshiring (loyiha qoidasi: rasmiy manba, haqiqiy natija).
- Commit — doira, strelka bolani otaga bog'laydi; branch — commit'ga ilingan yorliq; HEAD — branch yorlig'iga ilingan sariq yorliq. Bu belgilar Git videolarining hammasida bir xil.
- Oxirida "Xulosa" — kundalik sikl aylanasi, keyin "Rahmat!" va sayt manzili.

## 3. Ovozli matn (eng muhim saboq)

Subtitr matni ko'z uchun yozilgan — ovozda sun'iy eshitiladi (birinchi urinish shu sababli rad etildi).
Ovoz uchun matn **alohida** yoziladi — `timeline.js` dagi `narration` (subtitr — `captions`):

- To'liq, qisqa jumlalar, og'zaki ohang: "Xo'sh, commit'ning o'zi nima?", "Mana, main branchdagi commit'lar."
- Belgilar yo'q: qavs, `→`, `+`, nuqtali vergul, yarim jumla ("Tahrirlash → add → commit:" — yo'q).
- Buyruq jumla ichida tabiiy: "git add buyrug'i bilan o'zgarishni staging degan joyga qo'yasiz."
- O'zbekcha muqobil tabiiyroq bo'lsa — o'sha: "remote" o'rniga "masofaviy repozitoriy".
- Kirish ("Salom! Bu videoda…") va xotima ("E'tiboringiz uchun rahmat!…") ovozli.
- Har gap animatsiyadagi o'z harakatiga bog'langan oynada turadi; gap uzun bo'lsa animatsiya cho'ziladi, matn qisqartirilmaydi.
- CC subtitri ham `narration` matnini ko'rsatadi — eshitilgan gap bilan bir xil.

Talaffuz (`voice.mjs` dagi `SAY`, faqat modelga ketadigan matnda): commit → kommit, branch → brench, merge → merj,
pull → pul, fetch → fech, add → ed, HEAD → hed, main → meyn, feature → ficher, switch → svitch, staging → steyjing,
GitHub → Githab, hash → hesh, snapshot → snepshot. Inglizcha o'zakdan keyingi tutuq olib tashlanadi (kommit’ga → kommitga),
jumla boshi katta harf.

## 4. Ovoz va musiqa

| Narsa | Qiymat |
| --- | --- |
| TTS | Gemini `gemini-3.8-flash-tts`, ovoz **Charon** (saytdagi tinglash bilan bir xil), butun matn **bitta so'rovda** |
| Uslub ko'rsatmasi | `warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences` |
| Gap chegaralari | MMS aligner (`align-lines.py`), kesish — chegaraga eng yaqin haqiqiy jimlik o'rtasidan |
| Vaqt | Gapdan oldin 0,3 s, keyin 0,6 s nafas (`build-voice.mjs`: `PRE`, `POST`); oyna hech qachon qisqarmaydi |
| Musiqa | Sintez (`music.mjs`), 92 BPM, Fmaj7–G–Em7–Am7; intro — faqat pad, keyin arpedjio va bas, 22 s dan yengil baraban, xulosada baraban tushadi |
| Effektlar | commit paydo bo'lishi — pentatonik "pop", ko'chish — whoosh, terminal — klaviatura chiqillashi, merge — qo'ng'iroq + past zarba; hammasi `timeline.js` dagi `cues` dan, vaqt cho'zilganda ham joyida |
| Xotima | Faqat qo'ng'iroq, shovqinli effekt yo'q (oxirida "bijillash" bo'lib eshitiladi) |
| Miks (`mix.sh`) | Musiqa ×0,5, gap paytida sidechain (ratio 3) — ovozdan ~16 dB past; ikki bosqichli loudnorm **-16 LUFS**, cho'qqi ≤ -1,5 dB |

**Ma'lum muammo (tuzatilgan):** Gemini WAV oxiriga 6070 baytlik C2PA bo'lagini qo'shadi — WAV faqat `data` bo'lagi hajmi bo'yicha o'qiladi (`build-voice.mjs`), aks holda oxirida shovqin chiqadi.

## 5. Saytga qo'yish

```html
<figure class="video">
<video controls preload="metadata" playsinline poster="/video/git/<nom>.jpg" src="/video/git/<nom>.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/git/<nom>.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/git/<nom>.uz.vtt">
</video>
<figcaption>…</figcaption>
</figure>
```

- Umumiy video — kitob README boshiga; kichik mavzu videosi — o'sha bobning "Tushuncha" bo'limiga.
- Muqova — `poster.mjs` (`renderPoster()`): markaz pleyer tugmasi uchun bo'sh.
- Saytga: `web.mp4` (crf 23, ~11 MB / 3,5 daq). Asl `full.mp4` — Google Drive (`video/arxiv.sh <nom>`), repo'ga emas.

## 6. Tekshiruv ro'yxati

- [ ] `node stills.mjs …` — har sahnadan kadr ko'rildi, matn ustma-ust tushmaydi
- [ ] Terminal chiqishlari haqiqiy Git'da tekshirilgan
- [ ] `node voice.mjs --plan` — matn ovoz uchun yozilgan (3-bo'lim qoidalari)
- [ ] `align-lines.py` natijasi: gaplar ketma-ket, nol pauzali joylar jimlik bilan tekshirilgan
- [ ] Miks: -16 LUFS, cho'qqi ≤ -1,5 dB
- [ ] Saytda: video, bo'limlar, CC, telefon kengligi, konsolda xato yo'q
- [ ] Foydalanuvchi eshitib ma'qulladi (talaffuz va tabiiylikni faqat u tekshira oladi)

# Ovozli o'qish (TTS) — qanday ishlaydi va qanday davom ettiriladi

Maqsad: har bobni o'zbekcha ovoz bilan tinglash. Ovoz — **Gemini TTS** (`gemini-3.8-flash-tts`), sifati yaxshi va o'zbek tilini rasmiy qo'llaydi ("Northern Uzbek", [hujjat](https://ai.google.dev/gemini-api/docs/speech-generation)).

Holat (2026-10-09): segmentlar tayyor; ovoz yaratish formati tuzatildi (Interactions API), ommaviy yaratish tinglab tasdiqlangandan keyin boshlanadi. Birinchi ovoz — **Charon** (erkak). Keyin **Kore** (ayol) ham qilinadi.

## Ikki bosqich

```text
content/**/*.md ──npm run sync──▶ segments/  ──npm run tts──▶ audio/<ovoz>/
                  (har build'da)   .txt/.json    (Gemini API)   .ogg + state.json
```

### 1. Segmentlar — `scripts/segments.mjs` (avtomatik)

`npm run sync` (u `dev` va `build` dan oldin o'zi ishlaydi) har sahifani segmentlarga ajratadi:

```text
[heading]
Repository.

[paragraph]
Repository database bilan ishlash uchun ishlatiladi.

[table]
Quyidagi jadval «...» bo'limiga oid, 2 qatordan iborat. Ustunlar: Metod, Vazifasi.
find — bitta obyektni topadi.

[image]
Rasm. Repository diagrammasi.

[code]
Kod misoli.

[pause]
```

Qoidalar:

- Kod va terminal chiqishi **o'qilmaydi** — "Kod misoli." (ketma-ket bloklar bitta e'lon).
- Jadval: izoh + ustunlar + har qator "birinchi ustun — qolgani".
- `` `buyruq` `` belgilari olib tashlanadi, so'z o'qiladi; URL → "havola".
- Bob boshidagi navigatsiya qatori va **Rasmiy hujjat** bo'limi o'qilmaydi.
- Variant bloklaridan (`::: js`/`::: ts`, `::: options`/`::: composition`, `::: react`/`::: vue`/`::: angular`) faqat **birinchisi** — aks holda matn takrorlanadi.
- Har sarlavha oldidan `[pause]`.

Natija (`segments/`, git'da yo'q — har safar qayta yaratiladi):

- `segments/<kitob>/<bob>.txt` — yuqoridagi format;
- `segments/<kitob>/<bob>.json` — `{ type, text, line }` (`line` — manbadagi qator: keyin o'qilayotgan joyni sahifada belgilash uchun);
- `segments/index.json` — har sahifaning `hash`i (matn o'zgarsa, ovoz qayta yaratiladi) va so'z soni.

### 2. Ovoz — `scripts/tts.mjs` (qo'lda, limit bo'yicha)

**Har kuni shuni ishga tushiring** (kelishilgan navbat: React → Next.js → Vue → Angular → Git → Arxitektura → Symfony → Laravel; FSD, SQL, Docker hozircha yo'q):

```bash
npm run tts:navbat                    # navbat bo'yicha, kunlik limit tugaguncha
npm run tts:navbat -- --plan          # qancha qoldi
```

Bobni qaytadan yaratish (masalan, chegara yoki gallyutsinatsiya tuzalmasa) — eski audio o'chirilmaydi, `audio/_eski/<ovoz>-almashtirilgan/` ga ko'chadi:

```bash
npm run tts -- --redo react/25-actions.md,react/26-custom-hooklar.md --single   # har bob alohida so'rov
```

> **Holat (2026-10-09):** React (PR #6) va Next.js (PR #7) — saytda, 51 tadan bob. Keyingi navbat — **Vue** (`npm run tts:navbat`).

Boshqa variantlar:

```bash
npm run tts -- --plan                 # qancha qoldi — hech narsa yubormaydi
npm run tts                           # limit tugaguncha ishlaydi, o'zi to'xtaydi
npm run tts -- --book git             # faqat bitta kitob
npm run tts -- --limit 3              # ko'pi bilan 3 so'rov
npm run tts -- --voice Kore           # ayol ovozi (alohida papka va holat)
```

- **Tor joy — kuniga 10 so'rov, token emas** (2026-10-09 da RPD 10/10 tugadi, TPM esa 4K/10K da qoldi). Shuning uchun har so'rov to'ldiriladi:
  - so'rov hajmi token limitidan: `10 000 × 0,92 / 2,6 ≈ 3 500 so'z` (o'lchangan: ~2,4 kirish tokeni/so'z);
  - **kichik sahifalar bitta so'rovga yig'iladi** (bir kitob ichida), orasiga 3 × `<long pause>`; audio keyin `ffmpeg silencedetect` bilan kesiladi — har chegara so'z ulushi bo'yicha kutilgan vaqtga yaqin eng uzun jimlikdan;
  - katta sahifa bo'laklarga bo'linadi, bo'laklar tayyor bo'lgach bitta faylga yig'iladi;
  - skript daqiqalik limitlarni (3 RPM, 10K TPM) o'zi kuzatadi.
- **Bitta so'rov qancha audio qaytara olishi hujjatda yo'q.** Javob kesilsa (holat `completed` emas yoki audio kutilganidan < 60%), skript chegarani `state.json` dagi `maxWords` ga yozadi va navbatni qayta tuzadi — keyingi safar shu chegara bilan ishlaydi.
- Har so'rovdan keyin `audio/<ovoz>/state.json` yoziladi (sahifalar holati + har so'rov statistikasi). Limit tugasa yoki skript uzilsa — keyingi ishga tushirishda **qolgan joyidan**.
- Har sahifa uchun `audio/<ovoz>/<kitob>/<bob>.ogg` (Opus 24 kbps, mono) va **`<bob>.timings.json`** — highlight uchun: har segmentning `line` (manbadagi qator) va `at` (soniya). Vaqt so'z ulushi bo'yicha hisoblanib, eng yaqin jimlikka tortiladi — paragraf darajasida yetarli aniq, qo'shimcha so'rov talab qilmaydi.
- Hisob (2026-10-09): hamma kitoblar **~167 so'rov ≈ 17 kun**, faqat Git ~78 so'rov ≈ 8 kun (agar bitta so'rov ~3 500 so'zni to'liq qaytarsa; kamroq bo'lsa skript moslashadi).
- Matni o'zgargan sahifa (`segments/index.json` dagi hash boshqa) qaytadan ovozlanadi.
- **Muhim:** Gemini 3.8 TTS matnni **so'zma-so'z** o'qiydi. Uslub ko'rsatmasini matnga qo'shib bo'lmaydi — model uni ham ovoz chiqarib o'qiydi (2026-10-09 da shu xato bilan 7 bob behuda yaratildi). Shuning uchun so'rov Interactions API (`POST /v1beta/interactions`) orqali: transkript — faqat bob matni, uslub — `annotations: [{ type: 'speech_metadata', style }]` da (`scripts/tts.mjs` dagi `STYLE`, qisqa ibora — uzun "director's notes" ovozni buzadi). Pauzalar — rasmiy teglar: sarlavhadan keyin `<short pause>`, `[pause]` → `<long pause>`. Manba: [speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation).
- Yangi uslub yoki model bilan ommaviy ishga tushirishdan oldin **bitta qisqa namuna yaratib, tinglab tasdiqlang.**

### 3. So'z vaqtlari — `scripts/align.py` (lokal, bepul)

So'zma-so'z highlight uchun: tayyor `.ogg` + ma'lum matn → har so'z qachon aytilgani. Meta **MMS forced aligner** (torchaudio `MMS_FA`, o'zbek lotin yozuvi `a–z` va `'` bilan mos), kompyuterda ishlaydi, API limitiga ta'sir qilmaydi.

```bash
# bir martalik o'rnatish (~2 GB; model birinchi ishga tushishda yuklanadi)
python3 -m venv .venv-align
.venv-align/bin/pip install "torch==2.5.1" "torchaudio==2.5.1" "numpy<2"

npm run tts:align                       # hamma ovozlangan, hali hisoblanmagan boblar
npm run tts:align -- --books react      # faqat bitta kitob
```

- Natija: `<bob>.ogg` yonida `<bob>.words.json` — `{ line, w, word, s, e }` (segment qatori, segment ichidagi so'z tartibi, boshlanish va tugash soniyasi).
- Har `npm run tts` dan keyin ishga tushiring. Mac'da ~1 daqiqa / 7 daqiqalik bob.
- Raqam va belgilar (MMS lug'atida yo'q) vaqtni qo'shni so'zdan oladi.
- `audio/_eski/<ovoz>-teglar/` dagi eski audio'lar ham hisoblanadi (o'qilgan "long pause" so'zlari transkriptga qo'shiladi, lekin ko'rsatilmaydi).
- UI: o'qilayotgan so'z **CSS Custom Highlight API** bilan (`::highlight(tinglash-soz)`), DOM o'zgarmaydi; paragraf — `.is-reading`. Sahifadagi so'zlarga moslash ~90% (jadval izohi kabi faqat ovoz uchun yasalgan gaplar sahifada yo'q — u yerda faqat paragraf belgilanadi). `words.json` bo'lmasa — faqat paragraf.

### 4. Saytga chiqarish — `scripts/tts-publish.mjs`

```bash
npm run tts:publish -- --books react          # audio/<ovoz>/<kitob>/ → public/tinglash/<ovoz>/<kitob>/
```

- Faqat pleyerga kerak fayllar (`.ogg`, `.words.json`, `.timings.json`); so'z vaqtlari hisoblanmagan bob chiqarilmaydi.
- `public/tinglash/` git'da — GitHub Pages shu yerdan beradi (React ≈ 48 MB). Service worker audio'ni oldindan yuklamaydi (faqat tinglaganda).
- Kitob **tinglab tekshirilgandan keyin** chiqariladi. Hozir chiqarilgan: **React** (2026-10-09).
- Hajm ~1 GB ga yaqinlashsa (Pages limiti) — tashqi ombor (`VITE_AUDIO_BASE_URL`).

### Model o'zidan qo'shgan nutq (gallyutsinatsiya) va boblar chegarasi

Gemini TTS ichida til modeli bor — ba'zan matnda yo'q narsani o'qiydi. 2026-10-09 da react/11-props jadvalida "Ustunlar: Xato, Nega yomon, To'g'ri yechim" dan keyin model ~76 s davomida **o'zi to'qigan** jadval qatorlarini o'qidi (ba'zilarini takrorlab), keyin haqiqiylariga o'tdi. Choralar:

- **Oldini olish:** jadval izohida ustunlar ro'yxati yo'q (`scripts/segments.mjs`).
- **Aniqlash va qirqish** (`npm run tts:align`): transkriptda segmentlar, jadval qatorlari va kod parchalari o'rnida `*` (MMS "istalgan nutq" tokeni). Segmentlar orasidagi `*` 2,5 s dan, kod o'rnidagi 6 s dan uzun bo'lsa — matnda yo'q nutq; audio'dan qirqiladi (chetlarida 0,15 s pauza qoladi) va qayta moslanadi.
- **Boblar chegarasi:** bir so'rovda bir nechta bob yaratilib jimlikdan kesilgani uchun chegara bir necha gapga adashishi mumkin. `tts:align` har chegarani so'z darajasida tekshiradi (chap bob oxirgi so'zlari + o'ng bob dastlabki so'zlari, atrofi `*`) va audio'ni qo'shnilar orasida qayta taqsimlaydi — hech narsa o'chirilmaydi; barqarorlashguncha ≤4 o'tish.
- **Audio + matn nusxasi:** har `<bob>.ogg` yonida `<bob>.segments.json` — audio aynan qaysi matndan yaratilgan. Alignment shundan foydalanadi; `state.json` da `source` (qo'llanma manbasi hash'i). Bob faqat **qo'llanma matni** o'zgarganda qayta ovozlanadi — segment formati o'zgarishi tayyor audio'ni yaroqsiz qilmaydi.

### Jadvallarni o'qish qoidalari (2026-10-09, foydalanuvchi talabi — keyingi ovoz yaratishdan oldin `scripts/segments.mjs` da amalga oshiriladi)

Jadvallarda muammo ko'p kuzatildi: gallyutsinatsiya, tushunarsiz o'qish, emoji'lar har xil tilda. Jadval **tabiiy, aniq** o'qilishi kerak.

1. **Har qator ustun nomlari bilan o'qiladi** — "birinchi ustun — qolgani" emas:

   ```text
   Xato. useFormStatus ni forma render qiladigan komponentda chaqirish.
   Nega yomon? Har doim pending: false.
   To'g'ri yechim: Bola komponentda.
   ```

   Ustun nomi + katak: birinchi ustun — `Nom.` (nuqta bilan), savol shaklidagi ustun (`Nega yomon`, `Qachon`, `Nima uchun`) — `Nom?`, qolganlari — `Nom:`. Qatorlar orasida tabiiy pauza.

2. **Belgilar o'qilmaydi, ma'nosi aytiladi.** `✅`, `❌`, `✔`, `✗` kabi belgilarni model har xil tilda aytib yuboradi. O'rniga:
   - `✅` yolg'iz → `ha` (yoki ustun ma'nosiga qarab `qo'llab-quvvatlanadi`); `✅ Eng qisqa` → `Eng qisqa`;
   - `❌` yolg'iz → `yo'q`;
   - `—` yoki bo'sh katak → o'sha ustun **o'qilmaydi**;
   - ustun nomlari bilan o'qilgani uchun belgi o'rniga so'z tabiiy chiqadi: `Action (React 19): Eng qisqa. Klassik useState: Ko'proq kod. Forma kutubxonasi: Ortiqcha.`

3. **Jadval izohi qisqa**: "Quyidagi jadval «…» ga oid." — ustunlar ro'yxati sanalmaydi (model undan keyin jadvalni o'zidan "davom ettirgan").

4. Ovoz yaratilgach jadvalli boblarni **alohida tinglab tekshirish** — jadvallar eng xatoli joy.

### Qayta yaratish kerak bo'lgan boblar (tinglab topilgan)

| Bob | Muammo | Holat |
| --- | --- | --- |
| `react/26-custom-hooklar` | Ovoz sifati yomon, boshida kichik tushunarsiz tovush; avval 127 s gallyutsinatsiya qirqilgan | Kutmoqda — jadval qoidalari kiritilgach `--redo react/26-custom-hooklar.md --single` |
| React'dagi jadvalli boblar | Jadvallar "birinchi ustun — qolgani" formatida, emoji'lar | Jadval qoidalari kiritilgach qayta yaratish rejalashtiriladi |

### Talaffuz lug'ati — `scripts/talaffuz.json`

Model ba'zi atamalarni noto'g'ri o'qiydi (masalan **Vite** ni "vayt" deb; rasmiy talaffuz /viːt/, "veet"). Lug'atda sahifadagi so'z → modelga yuboriladigan o'zbekcha yozilish:

```json
{ "Vite": "Vit", "Vue": "Vyu" }
```

- Faqat modelga ketadigan matnda almashtiriladi, sahifa matni o'zgarmaydi. So'z chegarasi bo'yicha, katta-kichik harf muhim: `vite.config.js`, `@vitejs/plugin-vue`, `Vuex` tegilmaydi.
- `scripts/align.py` ham shu lug'atni o'qiydi — highlight asl so'zga tushadi.
- Faqat rasmiy talaffuzi aniq atamalar qo'shiladi. Yangi atama qo'shilsa, o'sha atama bor boblar qaytadan ovozlanishi kerak (lug'at segment hash'iga kirmaydi — `state.json` dan o'sha sahifalarni olib tashlang).

## Limitlar (bepul tarif, AI Studio'dagi haqiqiy qiymat)

| Model | RPM | TPM (kirish) | RPD |
| --- | --- | --- | --- |
| Gemini 3.8 Flash TTS | 3 | 10 000 | 10 |

Joriy limitlar: <https://aistudio.google.com/rate-limit>. Skript so'rovlar orasida 21 s kutadi (3 RPM), kunlik limitda (429) to'xtaydi.

O'lchangan: o'qish tezligi ~83 so'z/daqiqa (pauzalar bilan), ~18 audio token/so'z, ~2,4 kirish tokeni/so'z. Jami ~459 ming so'z ≈ **92 soat audio**. Pullik tarifga o'tilsa — bir necha kunda, taxminan $80–90 (audio token narxi bo'yicha, [narxlar](https://ai.google.dev/gemini-api/docs/pricing)).

> Bepul tarifda yuborilgan matn Google mahsulotlarini yaxshilashga ishlatiladi. Qo'llanmalar ochiq, shuning uchun bu qabul qilingan.

## Kalit

`.env` da (git'da yo'q, `VITE_` prefiksi yo'q — brauzerga bormaydi):

```ini
GEMINI_API_KEY=...
```

Kalit: <https://aistudio.google.com/apikey> (Gemini Pro obunasi API limitini oshirmaydi — API'ning o'z bepul/pullik tarifi bor). Kalitni chatga, commit'ga, issue'ga yozmang.

## Boshqa kompyuterda davom ettirish

1. `git pull`, `npm ci`, `brew install ffmpeg` (yoki tizimingizdagi ffmpeg — Opus kodek bilan).
2. `.env` ga `GEMINI_API_KEY` yozing.
3. **`audio/` papkasini ko'chirib oling** (u git'da yo'q): busiz skript tayyor sahifalarni bilmaydi va ularni qaytadan ovozlaydi — kunlik limit behuda ketadi. Kamida `audio/<ovoz>/state.json` va `.ogg` fayllar kerak.
4. `npm run sync && npm run tts -- --plan`, keyin `npm run tts`.

## Ochiq savollar (keyingi qadamlar)

- **Foydalanuvchining ChatGPT suhbatidagi takliflar** (prompt, diagrammalar uchun `speechDescription`, o'qilayotgan matnni highlight qilish) — hali to'liq ko'rilmagan; olingach shu reja ularga moslanadi.
- **Diagrammalar.** Hozir ```` ```text ```` diagrammalar ham "Kod misoli." deb o'tadi. Taklif: muallif yozadigan `speechDescription` (AI tavsifi texnik diagrammani noto'g'ri tushunishi mumkin).
- **Pleyer** (`src/components/ListenPlayer.vue`) tayyor: bob tepasidagi "▶ Tinglash", pastki panel, paragraf + so'z highlight. Production'da audio tashqi omborga chiqqach ishlaydi (`VITE_AUDIO_BASE_URL`); dev'da Vite `audio/` ni `/tinglash/` da beradi (yangi bo'lmasa `_eski` dan).

- **Saqlash va saytga chiqarish.** ~92 soat Opus 24 kbps ≈ 1 GB bitta ovoz uchun — GitHub Pages uchun katta. Variant: Cloudflare R2 (10 GB bepul, egress bepul) yoki boshqa obyekt ombori. Hal bo'lgach — saytda bob ichida "Tinglash" pleyeri va `segments/*.json` dagi `line` bo'yicha o'qilayotgan joyni belgilash.
- **Navbat tartibi.** Standart — `segments/index.json` tartibi (kitoblar `docs.config.mjs` dagidek). Kerak bo'lsa `--book` bilan ustuvor kitob.
- **Ayol ovozi (Kore)** — Charon tugagach, `--voice Kore`.

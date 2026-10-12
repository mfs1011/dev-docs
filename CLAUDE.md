# docs-web — loyiha eslatmalari

O'zbekcha dasturchi qo'llanmalari sayti (Vue 3 + Vite, GitHub Pages: `mfs1011.github.io/dev-docs`). Kontent `content/<kitob>/*.md`, kitoblar ro'yxati `docs.config.mjs`. `npm run sync` kontentni `src/content` ga ko'chiradi va manifest/qidiruv/ovoz segmentlarini yaratadi; `dev` va `build` undan oldin o'zi ishlaydi.

## Ovozli o'qish (TTS)

Batafsil va joriy holat: **[docs/tts.md](docs/tts.md)** — avval shuni o'qing.

Qisqacha:

- `npm run sync` → `segments/` (har bob `[heading]/[paragraph]/[table]/[image]/[code]/[pause]` formatida; `scripts/segments.mjs`).
- `npm run tts` → `audio/<ovoz>/` (Gemini `gemini-3.8-flash-tts`; `scripts/tts.mjs`). Bepul limit kuniga 10 so'rov — skript limit tugaganda to'xtaydi va keyingi safar qolgan joyidan davom etadi (`audio/<ovoz>/state.json`).
- `npm run tts:align` → `<bob>.words.json` (so'z vaqtlari, MMS forced aligner, lokal; `scripts/align.py`).
- Hozirgi ovoz: **Charon** (erkak); keyin **Kore** (ayol).
- **Keyingi ovoz yaratishdan oldin:** docs/tts.md dagi "Jadvallarni o'qish qoidalari"ni `scripts/segments.mjs` da amalga oshirish (har qator ustun nomlari bilan, ✅/❌ o'qilmaydi), so'ng ro'yxatdagi boblarni `--redo`.
- `GEMINI_API_KEY` faqat `.env` da. `segments/` va `audio/` git'da yo'q — boshqa kompyuterga `audio/` ni qo'lda ko'chirish kerak (docs/tts.md).

## Qo'llanma yozish qoidasi (majburiy)

Biror qo'llanma (mundarija yoki bob) yozishga buyruq berilsa:

- **Taxmin qilinmaydi.** Har bir mavzu, da'vo, versiya va misol **rasmiy manbadan** olinadi: rasmiy hujjat sahifasi ochib o'qiladi (fetch), yoddan yozilmaydi. Rasmiy sayt ochilmasa — loyihaning rasmiy GitHub repo'sidagi hujjat manbasi.
- **Mundarija** rasmiy hujjat tuzilmasiga solishtirib tuziladi; har bob yonida u tayangan rasmiy sahifa(lar) ko'rsatiladi. Rasmiy hujjatda asosi yo'q mavzu kiritilmaydi yoki foydalanuvchiga ochiq aytilib, alohida belgilanadi.
- **Har bir bob** yozishdan oldin tegishli rasmiy sahifalar o'qiladi; bob oxiridagi "Rasmiy hujjat" bo'limida aniq havolalar beriladi. Kod misollari real muhitda (Docker va h.k.) ishga tushirib tekshiriladi, chiqish natijalari haqiqiy.
- **Versiya** rasmiy relizlar sahifasidan tekshiriladi va qo'llanma README'sida jadval sifatida yoziladi (sana bilan). Versiya tanlovi ham hujjatdagi mezonga tayanadi (masalan, LTS), "keng tarqalgan" kabi tekshirilmagan gaplarga emas.
- **Til** — tushunarli o'zbek tili: har yangi atama birinchi uchraganda oddiy so'z bilan izohlanadi; atamaning inglizcha asli qavsda.
- Tekshirib bo'lmagan narsa bo'lsa — yozilmaydi va foydalanuvchiga aytiladi.

## Ish tartibi

- Har vazifa — `main` dan alohida branch; PR `main` ga (repo'da `dev` yo'q). Merge'ni egasi qiladi.
- Commit/PR matnida AI atributsiyasi yo'q.
- Qo'llanma mazmuni faqat rasmiy hujjatga tayanadi; misollar real muhitda sinaladi.

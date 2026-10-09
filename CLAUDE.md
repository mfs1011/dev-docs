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

## Ish tartibi

- Har vazifa — `main` dan alohida branch; PR `main` ga (repo'da `dev` yo'q). Merge'ni egasi qiladi.
- Commit/PR matnida AI atributsiyasi yo'q.
- Qo'llanma mazmuni faqat rasmiy hujjatga tayanadi; misollar real muhitda sinaladi.

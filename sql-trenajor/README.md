# SQL trenajori

Brauzerda **haqiqiy** ma'lumotlar bazasi: PostgreSQL 18.6 (PGlite 0.5.14 — PostgreSQL'ning WebAssembly
varianti) va SQLite 3.54.1 (sqlite.org'ning rasmiy WASM build'i). Server yo'q — hamma narsa o'quvchining
brauzerida. Sahifa: `/sql/trenajor` (`src/views/SqlTrenajorPage.vue`, kod `src/sqltrenajor/`).

```bash
npm run dev                      # http://localhost:5180/sql/trenajor
npm run sql-trenajor:test        # Node'da ikkala bazada har mashqning har qadami
npm run sql-trenajor:havolalar   # SQL boblarining «Amaliyot» bo'limiga mashq havolalari
```

| Qism | Fayl | Vazifa |
| --- | --- | --- |
| Dvigatellar | `dvigatel.js` | PGlite va SQLite uchun bitta interfeys: `run` (so'rovlar bittalab, psql kabi), `schema` (jadvallar, ustunlar, tashqi kalitlar, indekslar), `plan` (EXPLAIN daraxti) |
| Ajratish | `ajrat.js` | SQL matnini so'rovlarga bo'ladi: satrlar, `$$`, izohlar ichidagi `;` hisobga olinmaydi |
| Ko'rinish | `format.js` | psql'ning aligned formati, sqlite3 3.54 ning standart yumaloq qutisi; ikkalasining haqiqiy prompt'i (davom qatorlari bilan), psql xato ko'rinishi (`LINE n:` va `^`) |
| Izohlar | `xatolar.js` | xatolarning o'zbekcha izohi (PostgreSQL SQLSTATE, SQLite natija kodi) |
| Baza | `baza.js` | o'quv do'kon bazasi (ikkala dvigatelda bir xil SQL) |
| Mashqlar | `mashqlar.js` | qadamlar: kutilgan so'rov natijasi, baza holati, xato turi yoki EXPLAIN rejasi bilan tekshiriladi |
| Komponentlar | `SqlKonsol.vue`, `ErDiagramma.vue`, `RejaTugun.vue` | konsol (terminal/jadval), jonli ER diagramma, reja daraxti |

## Cheklovlar

- PGlite bitta ulanish bilan ishlaydi ("PGlite is single user/connection" — PGlite README), shuning uchun
  ikki seansli tranzaksiya namoyishi PostgreSQL'da qilinmagan.
- MySQL yo'q: brauzerda ishlaydigan rasmiy versiyasi yo'q, MySQL 8.4'dan beri 32-bit build ham chiqmaydi.
- SQLite'da tashqi kalit tekshiruvi standart bo'yicha o'chiq — baza tayyorlanganda `PRAGMA foreign_keys = ON` beriladi.

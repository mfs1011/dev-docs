# FSD trenajori

Brauzerda **haqiqiy Steiger** — FSD'ning rasmiy linteri (`steiger` 0.7.0 + `@feature-sliced/steiger-plugin` 0.8.0,
FSD kitobining 33-bobidagi versiya). O'quvchi loyiha fayllarini o'zgartiradi, Steiger har o'zgarishdan keyin
tekshiradi, natija «bino» bo'lib ko'rinadi. Sahifa: `/fsd/trenajor` (`src/views/FsdTrenajorPage.vue`, kod `src/fsd/`).

```bash
npm run dev                                 # http://localhost:5180/fsd/trenajor
npm run fsd-trenajor:test                   # mashqlar Steiger CLI bilan (asos toza, har qadam o'tadi)
npx vite --port 5181 & node fsd-tekshiruvchi/test/brauzer.mjs   # brauzer = CLI, mashq qadamlari
```

| Qism | Fayl | Vazifa |
| --- | --- | --- |
| Steiger | `steiger.js` | xotiradagi fayl tizimiga yozadi, Steiger CLI kabi daraxt quradi, `recommended` qoidalarini bajaradi |
| Shim'lar | `shim/fs.js`, `shim/path.js`, `shim/node.js` | plugin, `@feature-sliced/filesystem` va `tsconfck` uchun Node modullari o'rnida (`vite.config.js` → `labFsd`) |
| Izohlar | `izohlar.js` | Steiger xabari → oddiy til: metafora (qavat, xona, eshik, deraza), nega yomon, qanday tuzatiladi |
| Importlar | `importlar.js` | bino strelkalari uchun: qaysi xonadan qaysi xonaga import (qoidani Steiger tekshiradi) |
| Mashqlar | `mashqlar.js` | toza «do'kon» loyihasi (`ASOS`) va undan bitta qoida buzilgan 5 ta mashq |
| Ko'rinish | `Bino.vue`, `Muammolar.vue`, `FaylDaraxti.vue`, `KodOyna.vue` | bino, muammolar, fayl daraxti, kod |

## Brauzerga moslash

Plugin kodi o'zgarmaydi, faqat ikki joy (`vite.config.js` → `labFsd`):

- `fs`, `path`, `url`, `module` importlari — `src/fsd/shim/` ga (faqat plugin va uning bog'liqliklari uchun);
- plugin modul darajasida `await` bilan tree-sitter parser'larini yuklaydi — bu `globalThis.__steigerTayyor`
  promise'iga aylantiriladi, `.wasm` fayllar Vite asset sifatida import qilinadi.

Plugin yangilansa — transform kutgan kod topilmasa build xato beradi; `fsd-tekshiruvchi/test/brauzer.mjs`
brauzer natijasini CLI bilan solishtiradi.

## Hajm

Steiger chunk'i (TypeScript import yechuvchisi bilan) ~1 MB gzip + tree-sitter `.wasm` ~260 KB — faqat shu
sahifa ochilganda yuklanadi (`manualChunks: steiger`, PWA precache'ga tushmaydi).

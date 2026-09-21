# Qo'llanmalar — web UI

Symfony va Laravel qo'llanmalarini (Markdown) o'qish uchun Vue 3 + Vite ilovasi.
Kontent alohida repo'da turadi: [`mfs1011/laravel-api-book`](https://github.com/mfs1011/laravel-api-book) → `docs/`.

## Ishga tushirish

```shell
npm install
npm run dev          # http://localhost:5180
```

Kontent manbasi sukut bo'yicha `../laravel-api-book/docs`. Boshqa joyda bo'lsa:

```shell
DOCS_SOURCE=../../boshqa-repo/docs npm run dev
```

## Yangi qo'llanma (kitob) qo'shish

`docs.config.mjs` ga bitta blok qo'shiladi — Vue kodiga tegish shart emas:

```js
{
  id: 'nuxt',                       // URL: /nuxt/...
  title: 'Nuxt',
  subtitle: 'SSR va deploy',
  dir: 'nuxt',                      // docs/nuxt/ papkasi
  accent: '#00865a',
  accentDark: '#41d1a0',
  versionLabel: 'Nuxt',
  versionRow: /^\|\s*Nuxt\s*\|\s*([^|]+)\|/m,   // README jadvalidan versiya
  groups: [{ title: 'I — Asoslar', from: 1, to: 6 }],
  folders: [{ dir: 'patterns', title: 'Pattern katalogi' }],
}
```

Logo kerak bo'lsa `src/components/BookMark.vue` ga bitta shart qo'shiladi; bo'lmasa harfli belgi ishlatiladi.

## Yangi bob qo'shish

Kontent repo'sidagi tegishli papkaga `.md` fayl tashlang (masalan `docs/symfony/41-yangi.md`).
Dev server ishlayotgan bo'lsa avtomatik sinxronlanadi; aks holda `npm run sync`.

Avtomatik aniqlanadi: sarlavha (`# ...`), URL, sidebar guruhi (raqam yoki papka),
sahifa ichidagi mundarija (`##`, `###`), qidiruv indeksi, oxirgi yangilanish sanasi (fayl vaqti),
kitob versiyasi (kontent README'sidagi versiya jadvalidan).

## Kontent uslublari

| Markdown | Ko'rinishi |
| --- | --- |
| `## Tipik xatolar` | qizil ogohlantirish bloki |
| `## Muhandislik nuqtai nazari` | binafsha "chuqurroq" bloki |
| `## Amaliyot` | yashil mashq bloki |
| `## Rasmiy hujjat`, `## Bog'liq patternlar` | ko'k manba bloki |
| `**Muammo.**`, `**Yechim.**`, `**Qachon kerak emas.**`, `**Nega yomon.**`, `**To'g'ri yo'l.**` | rangli paragraf bloklari |

Yangi turkum: `src/markdown.js` → `SECTION_KINDS`, `src/views/DocPage.vue` → `PARAGRAPH_KINDS`.

## Deploy (GitHub Pages)

1. Bu papkani GitHub'da yangi repo sifatida yarating va push qiling.
2. Repo → **Settings → Pages → Source: GitHub Actions**.
3. `main` ga push — `.github/workflows/deploy.yml` ishga tushadi: ilova va kontent repo'lari checkout qilinadi, `DOCS_SOURCE=../content-repo/docs` bilan build bo'ladi, `dist/` Pages'ga chiqariladi.

`BASE_PATH` avtomatik `/<repo-nomi>/` bo'lib oladi; SPA uchun `404.html` nusxalanadi (chuqur havolalar ishlashi uchun).

Kontent o'zgarganda saytni yangilash: repo'da **Actions → Deploy to GitHub Pages → Run workflow**,
yoki kontent repo'sidan `repository_dispatch` (`docs-updated`) yuborish.

## Tuzilma

```
docs.config.mjs            kitoblar ro'yxati (yagona sozlama nuqtasi)
scripts/sync-content.mjs   md fayllarni ko'chiradi + manifest.json yasaydi
src/docs.js                manifest bilan ishlash, havola va tema
src/markdown.js            markdown-it + highlight.js
src/views/HomePage.vue     kitoblar ro'yxati
src/views/DocPage.vue      sahifa: render + DOM bezash + TOC
src/components/            sidebar, TOC, qidiruv, tema, logolar
src/styles/main.css        dizayn tokenlari, light/dark, bloklar
```

## Logolar

`public/symfony-logo.svg`, `src/components/SymfonyMark.vue`, `src/components/LaravelMark.vue` —
rasmiy manbalardan olingan (symfony.com, laravel.com). Ular tegishli loyihalarning savdo belgisi;
bu yerda faqat o'sha texnologiyaga ishora sifatida ishlatiladi.

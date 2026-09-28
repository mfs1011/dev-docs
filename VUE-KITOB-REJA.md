# Vue qo'llanmasi — ish holati va davom ettirish rejasi

> Bu fayl kontent emas: `content/vue/` dan tashqarida turadi, shuning uchun saytga sahifa bo'lib chiqmaydi.
> Maqsadi — ishni uzilgan joyidan davom ettirish.

**Oxirgi yangilanish:** 2026-09-28

## Holat

**Kitob to'liq yozib bo'lindi: 70 bob + mundarija (`README.md`).**

Mundarijadagi barcha havolalar ishlaydi, `(tayyorlanmoqda)` belgisi qolmadi.

## Kitobni yangilash

Bob tahrirlangandan yoki qo'shilgandan keyin:

```bash
npm run sync        # manifest va sahifalar yangilanadi
```

Yangi bob qo'shilsa, `README.md` dagi mos qismga qator qo'shing va `docs.config.mjs` dagi
`groups` chegaralarini tekshiring.

## Bob formati (barcha boblarda bir xil)

1. `# NN — Sarlavha` + navigatsiya qatori: `[← Oldingi](...) · [Mundarija](README.md) · [Keyingi →](...)`
2. Bo'limlar: **Tushuncha** → **Nega shunday** → **Kod** (bir nechta) → **Muhandislik nuqtai nazari** (1–2 ta) → **Tipik xatolar** (jadval) → **Amaliyot** (3–5 mashq) → **Rasmiy hujjat** (vuejs.org havolalari)
3. Hajm: ~200–260 qator
4. Til: o'zbekcha, kirill harflar ishlatilmaydi (tekshirish: `grep -rn "[а-яА-ЯёЁ]" content/vue/*.md`)
5. Options/Composition farq qiladigan joyda ikkala variant beriladi:

```markdown
::: options
Options API matni va kodi
:::

::: composition
Composition API matni va kodi
:::
```

Bu bloklarni `src/markdown.js` dagi `apiVariants` qoidasi `<div class="api-variant" data-api="...">` ga aylantiradi; sahifa tepasidagi `ApiToggle` ulardan birini ko'rsatadi.

## Tekshirilgan versiyalar (2026-09, npm registry)

| Paket | Versiya |
| --- | --- |
| vue | 3.5.43 (stable), 3.6.0-rc.9 (Vapor mode, alien-signals) |
| vue-router | 5.3.1 |
| pinia | 4.0.3 |
| vite | 8.3.0 |
| vitest | 5.0.1 |
| @vue/test-utils | 2.5.1 |
| nuxt | 4.5.2 |

## Shu ish davomida qo'shilgan/o'zgargan fayllar

| Fayl | Nima |
| --- | --- |
| `content/vue/` | Kitob kontenti (repo ichida, `src/content/` dan farqli — u generatsiya natijasi) |
| `docs.config.mjs` | `vue` kitobi: `root: 'content'`, 9 qism, `apiSwitcher: true` |
| `scripts/sync-content.mjs` | Lokal manba (`book.root`), git commit sanalari, sarlavhadan raqam prefiksini olib tashlash, staging papka tozalash |
| `src/markdown.js` | `::: options/composition` qoidasi, yangi tillar, fence render tuzatildi |
| `src/components/ApiToggle.vue` | Options/Composition almashtirgichi (localStorage) |
| `src/components/VueMark.vue`, `public/favicon-vue.svg` | Vue logotipi va favicon |
| `src/docs.js`, `src/App.vue` | `applyBookFavicon` — kitobga qarab favicon |
| `vite.config.js` | Watcher o'z natijasiga javob bermaydi (cheksiz sync sikli tuzatildi) |
| `.github/workflows/deploy.yml` | Kontent checkoutga `fetch-depth: 0` (sahifa sanalari uchun) |

## Hali commit qilinmagan

Barcha o'zgarishlar working tree'da. Commit/PR qilinmagan — so'ralganda qilinadi.

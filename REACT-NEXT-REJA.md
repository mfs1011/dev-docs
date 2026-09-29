# React va Next.js qo'llanmalari — ish holati

> Bu fayl kontent emas: `content/` dan tashqarida turadi, saytga sahifa bo'lib chiqmaydi.
> Maqsadi — ishni uzilgan joyidan davom ettirish.

**Oxirgi yangilanish:** 2026-09-29

## Holat

| Kitob | Boblar | Qatorlar | Holat |
| --- | --- | --- | --- |
| React 19 (`content/react/`) | **50/50** | ~15 900 | ✅ Tugallangan |
| Next.js 16 (`content/nextjs/`) | **50/50** | ~30 000 | ✅ Tugallangan |

## Holat: ikkala kitob ham tugallangan

`content/nextjs/` — 50 bob + `README.md` (51 fayl, ~30 000 qator). Mundarijada
`(tayyorlanmoqda)` qolmadi, barcha havolalar ishlaydi.

| Qism | Boblar | Holat |
| --- | --- | --- |
| I — Poydevor | 01–06 | ✅ |
| II — App Router | 07–15 | ✅ |
| III — Server komponentlar va ma'lumot | 16–24 | ✅ |
| IV — Auth va tokenlar | 25–31 | ✅ |
| V — Baza va integratsiyalar | 32–37 | ✅ |
| VI — Pages Router va migratsiya | 38–41 | ✅ |
| VII — Sifat va production | 42–50 | ✅ |

Keyingi ish — **Arxitektura kitobi**: mundarija (`content/arxitektura/README.md`,
72 bob) tayyor, boblar hali yozilmagan.

## Ish tartibi

Har bob yozilgandan keyin:

```bash
npm run sync        # manifest va sahifalar yangilanadi
```

Bob qo'shilgach `content/nextjs/README.md` dagi mos qatorda `Nom *(tayyorlanmoqda)*` ni `[Nom](fayl.md)` havolasiga qaytaring. Buni to'plam bilan qilish uchun:

```python
# python3 - <<'PY' (repo ildizida)
import pathlib, re
d = pathlib.Path('content/nextjs')
names = {p.name for p in d.glob('*.md')}
r = d / 'README.md'
s = r.read_text()
def restore(m):
    num, title = m.group(1), m.group(2).strip()
    name = next((n for n in names if n.startswith(f'{num}-')), None)
    return f'| {num} | [{title}]({name}) |' if name else m.group(0)
r.write_text(re.sub(r'\| (\d{2}) \| ([^|]+?) \*\(tayyorlanmoqda\)\* \|', restore, s))
```

## Bob formati (mavjud boblar bilan bir xil bo'lishi shart)

1. `# NN — Sarlavha` + navigatsiya: `[← Oldingi](...) · [Mundarija](README.md) · [Keyingi →](...)`
2. Bo'limlar: **Tushuncha** → **Nega shunday** → **Kod** (bir nechta) → **Muhandislik nuqtai nazari** (1–3 ta) → **Tipik xatolar** (jadval) → **Amaliyot** (4–6 mashq) → **Rasmiy hujjat**
3. Hajm: ~250–380 qator
4. Til: o'zbekcha, kirill harflar ishlatilmaydi (`grep -rn "[а-яА-ЯёЁ]" content/nextjs/*.md`)
5. Kod misollar **JS va TS** variantlarida:

```markdown
::: ts
TypeScript kodi
:::

::: js
JavaScript kodi
:::
```

Bu bloklarni `src/markdown.js` dagi `apiVariants` qoidasi `<div class="api-variant" data-variant-group="lang">` ga aylantiradi; sahifa tepasidagi `VariantToggle` ulardan birini ko'rsatadi.

6. Boshqa boblarga havola: `(React qo'llanmasi, 39-bob)` yoki `(18-bob)` ko'rinishida.

## Tekshirilgan versiyalar (2026-09, npm registry)

| Paket | Versiya |
| --- | --- |
| next | 16.3.6 |
| react / react-dom | 19.3.0 |
| typescript | 7.0.2 |
| @tanstack/react-query | 5.104.0 |
| zustand | 5.0.15 |
| vite | 8.3.1 |
| tailwindcss | 4.3.3 |

Yozishdan oldin qayta tekshiring: `npm view next version`.

## Infratuzilma (tayyor, o'zgartirish shart emas)

| Fayl | Nima |
| --- | --- |
| `docs.config.mjs` | `react` va `nextjs` kitoblari, `variants: { group: 'lang' }` |
| `src/components/VariantToggle.vue` | Umumiy almashtirgich (Vue uchun `api`, React/Next uchun `lang`) |
| `src/components/AppSidebar.vue` | Almashtirgich sidebar tepasida (`.sidebar-variants`), topbar'da emas |
| `src/markdown.js` | `::: options/composition/js/ts` bloklari |
| `src/components/ReactMark.vue`, `NextMark.vue` | Logotiplar |
| `public/favicon-react.svg`, `favicon-nextjs.svg` | Faviconlar |

## Commit qilinmagan o'zgarishlar (2026-09-28 holati)

Working tree'da turgan, hali commit qilinmagan ishlar:

| Fayl | Nima |
| --- | --- |
| `content/nextjs/07-*.md` … `32-*.md` | 26 ta yangi bob (07–32) |
| `content/nextjs/README.md` | Yozilgan boblarga havolalar tiklandi (18 tasida hali `(tayyorlanmoqda)`) |
| `src/components/AppSidebar.vue`, `src/App.vue`, `src/styles/main.css` | JS/TS almashtirgichi topbar'dan sidebar tepasiga ko'chirildi |
| `public/favicon-react.svg` | Halqalar to'lib ketgan edi: `fill="none"` atributi CSS bilan bekor bo'lgan; endi `.react-dot` va `.react-rings` alohida class'larda |
| `docs.config.mjs`, `content/arxitektura/README.md`, `src/components/ArchMark.vue`, `public/favicon-arxitektura.svg` | Arxitektura kitobi: mundarija (72 bob rejalashtirilgan), boblar hali yozilmagan |
| `REACT-NEXT-REJA.md` | Shu fayl |

Bular commit qilinsa, push bilan birga sayt ham yangilanadi.

## Havolalar

- Sayt: <https://mfs1011.github.io/dev-docs/>
- React kitobi: <https://mfs1011.github.io/dev-docs/react>
- Next kitobi: <https://mfs1011.github.io/dev-docs/nextjs>
- Vue kitobi holati: `VUE-KITOB-REJA.md`

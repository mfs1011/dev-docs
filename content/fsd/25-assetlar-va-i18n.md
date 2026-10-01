# 25 — Assetlar, stillar va i18n

[← Oldingi: Layout'lar](24-layoutlar.md) · [Mundarija](README.md) · [Keyingi: Marshrutlash va lazy loading →](26-marshrutlash.md)

## Qisqacha

Assetlar (rasmlar, ikonkalar, shriftlar, PDF shablonlar) ham kod kabi joylashtiriladi: **turi bo'yicha emas, ishlatilishi bo'yicha**, ularni ishlatadigan kod yonida. Bitta sahifaning rasmi — o'sha sahifa `ui`'da; qayta ishlatiladigan ikonka — `shared/ui`; global stil va shriftlar — `app`. Umumiy `assets/` segmenti **tavsiya etilmaydi**.

## Qoida

| Asset turi | Joy |
| --- | --- |
| Bir slice'ga xos rasm | Slice ichida: `pages/home/ui/hero.jpg`; ko'p bo'lsa — `ui/previews/` papkasi |
| UI emas, biznes mantiqining qismi (PDF shablon) | Mantiq yonida: `features/billing/model/invoice-template.pdf` |
| Qayta ishlatiladigan ikonka va rasmlar | `shared/ui/` (masalan `shared/ui/placeholders/`) |
| Shared komponentning asseti | Komponent yonida: `shared/ui/dropdown/chevron.svg` |
| Global stil (reset, o'zgaruvchilar) | `app/styles/` |
| Shriftlar | `app/fonts/`, `public/` yoki `app/public` |
| Qayta ishlanmaydigan statik fayllar, favicon | `public/` (yoki bundler ruxsat bersa `app/public`) |

**i18n** (rasmiy hujjatda faqat bir qator: `shared/i18n` — tarjima sozlamasi va global satrlar). Quyidagi bo'lish — amaliy tavsiya:
- kutubxona sozlamasi, til aniqlash, global satrlar ("Saqlash", "Bekor qilish") — `shared/i18n`;
- slice'ga xos satrlar — slice ichida (`pages/checkout/i18n/uz.json` yoki `ui` yonida), lazy yuklanadi;
- provayder/plagin ulanishi — `app/providers`.

## Shablon

```text
pages/home/ui/
├── HomePage.tsx
├── hero.jpg
└── previews/  cake.jpg  pizza.jpg
features/billing/model/
├── create-invoice.ts
└── invoice-template.pdf
shared/ui/
├── dropdown/  Dropdown.tsx  chevron.svg
├── icons/     cart.svg  user.svg    ← qayta ishlatiladigan
└── placeholders/  product.svg
shared/i18n/
├── setup.ts                         i18next / vue-i18n / Angular i18n sozlamasi
└── locales/  uz.json  ru.json  en.json   (faqat global satrlar)
pages/checkout/i18n/  uz.json  ru.json    (tavsiya: sahifaga xos satrlar)
app/
├── styles/  reset.css  tokens.css  global.css
├── fonts/
└── providers/I18nProvider.tsx
public/  favicon.svg  robots.txt
```

## Kod: asset import va global stil

::: react
```tsx
// pages/home/ui/HomePage.tsx — rasm komponent yonida
import heroUrl from './hero.jpg'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()
  return <img src={heroUrl} alt={t('home.heroAlt')} />
}

// app/entrypoint/main.tsx
import '../styles/reset.css'
import '../styles/global.css'
import '@/shared/i18n/setup'
```
:::

::: vue
```vue
<!-- pages/home/ui/HomePage.vue — rasm komponent yonida -->
<script setup lang="ts">
import heroUrl from './hero.jpg'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <img :src="heroUrl" :alt="t('home.heroAlt')" />
</template>

<!-- app/entrypoint/main.ts: import '../styles/global.css'; app.use(i18n) — i18n shared/i18n/setup.ts'dan -->
```
:::

::: angular
```json
// angular.json — global stil app qatlamidan; slice rasmlari assets glob bilan
{
  "styles": ["src/app/styles/global.css"],
  "assets": [
    { "glob": "**/*", "input": "public" },
    { "glob": "**/*.{jpg,png,svg,webp}", "input": "src/pages", "output": "pages" }
  ]
}
```

```ts
// pages/home/ui/home-page.ts — shablon URL'i build natijasidagi yo'lga mos
@Component({
  selector: 'app-home-page',
  template: `<img src="pages/home/ui/hero.jpg" i18n-alt alt="Bosh sahifa banneri" />`,
})
export class HomePage {}
```
:::

Angular shablonlarida rasm odatda URL orqali ko'rsatiladi, shuning uchun slice rasmlari `angular.json`'dagi `assets` glob bilan build natijasiga nusxalanadi. Muqobil yo'l — esbuild `loader` (`".svg": "file"`) bilan `import heroUrl from './hero.svg'`: fayl nomiga hash qo'shiladi. Ikkala yo'l ham Angular 22 loyihasida tekshirildi (31-bob).

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Hamma ikonkalarni `shared/ui/icons`'gami? | Faqat qayta ishlatiladiganlarini; bir joydagisi — o'sha joyda |
| Dizayn tokenlari (rang, shrift o'lchami) | `app/styles/tokens.css` yoki `shared/ui` (dizayn tizimi bilan) |
| `assets/` segmenti | ❌ — yuqori bog'liqlik va lokal o'zgarish tamoyilini buzadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `src/assets/images/` ga hammasi | Qaysi rasm qayerda ishlatilishi noma'lum, o'chirib bo'lmaydi | Ishlatiladigan joy yonida |
| Sahifaga xos stil `app/styles`'da | Global stil shishadi | Komponent/slice stillari |
| Hamma tarjimalar bitta katta faylda | Har sahifa hammasini yuklaydi, konfliktlar | Global — `shared/i18n`, qolgani slice'da |
| Shrift `shared/ui`'da | Faqat entrypoint ishlatadi | `app/fonts` |

## Manbalar

- Rasmiy: *Handling Assets* <https://feature-sliced.design/docs/guides/examples/handling-assets>
- Rasmiy: *Layers — Shared (i18n segmenti)* <https://feature-sliced.design/docs/reference/layers>
- Saytda: [Arxitektura 46-bob — Erishimlilik va ko'p tillilik](../arxitektura/46-a11y-va-i18n.md), [Vue 66-bob — i18n](../vue/66-i18n.md), [Angular 77-bob — i18n](../angular/77-i18n.md)

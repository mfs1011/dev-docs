# 05 — Segmentlar

[← Oldingi: Slice'lar](04-slicelar.md) · [Mundarija](README.md) · [Keyingi: Import qoidasi va public API →](06-import-va-public-api.md)

## Qisqacha

Segment — uchinchi va oxirgi daraja: slice ichidagi (yoki `app`/`shared` ichidagi) papka, kodni **texnik vazifasi** bo'yicha guruhlaydi. Beshta odatiy nom bor: `ui`, `api`, `model`, `lib`, `config`. Asosiy qoida: segment nomi **maqsadni** bildirsin, mohiyatni emas — `components/`, `hooks/`, `types/` yomon nomlar.

## Qoida

| Segment | Nima yashaydi | Misollar |
| --- | --- | --- |
| `ui` | Ko'rinish bilan bog'liq hamma narsa | Komponentlar, sana formatlovchilari, stillar, slice'ga xos rasmlar |
| `api` | Backend bilan aloqa | So'rov funksiyalari, ma'lumot tiplari (DTO), mapper'lar |
| `model` | Ma'lumot modeli | Sxemalar, interfeyslar, store'lar, biznes mantiqi |
| `lib` | Shu slice'dagi boshqa modullarga kerak bo'lgan yordamchi kod | `format-price.ts`, `build-query.ts` |
| `config` | Konfiguratsiya | Feature flag'lar, konstantalar, sozlamalar |

Qo'shimcha qoidalar:

- O'z segmentingizni yaratish mumkin. Eng ko'p — `shared` va `app`'da (masalan `shared/routes`, `shared/i18n`, `app/providers`).
- Segment nomi — **maqsad**: "bu kod nima uchun?". `hooks/` — "bu kod qanday yozilgan?" degan savolga javob, qidirishda yordam bermaydi.
- Slice'li qatlamlarda segment uchun alohida `index.ts` **shart emas** — slice'ning bitta `index.ts`'i yetarli.
- Hamma segment majburiy emas: ko'p sahifada faqat `ui` va `api` bo'ladi.

> **Steiger bu qoidani qat'iy tekshiradi.** `fsd/segments-by-purpose` qoidasi (tavsiya etilgan sozlamada yoqiq) quyidagi segment nomlarini xato deydi: `components`, `helpers`, `utils`, `constants`, `types`, `store`/`stores`, `modals`, `services`, `enums`, `interfaces`, `schemas`, `handlers`, `middlewares`, `validators`, `resolvers`, `mutations`, `assets`; React'dan `hooks`, `context`, `providers`; Vue'dan `composables`, `directives`; Redux'dan `actions`, `reducers`, `selectors`, `effects`, `thunks`; Angular'dan `pipes` (steiger-plugin 0.8.0, real loyihada tekshirilgan). Diqqat: rasmiy hujjat `app/store` va `app/providers`'ni odatiy deb ko'rsatadi — bu ziddiyat va yechimi 12-bobda.

## Shablon

```text
features/apply-promo-code/
├── ui/
│   ├── PromoCodeForm.tsx         forma
│   └── promo-code-form.css
├── api/
│   └── apply-promo-code.ts       POST /cart/promo
├── model/
│   ├── promo-code-schema.ts      validatsiya sxemasi
│   └── promo-state.ts            holat (kerak bo'lsa)
├── lib/
│   └── normalize-code.ts         " summer25 " → "SUMMER25"
├── config/
│   └── limits.ts                 MAX_CODE_LENGTH
└── index.ts                      export { PromoCodeForm }

shared/                           (slice yo'q — to'g'ridan-to'g'ri segmentlar)
├── api/   ui/   lib/   config/   routes/   i18n/

app/
├── routes/   providers/   styles/   entrypoint/
```

## Kod: bitta slice, to'rt segment

::: react
```tsx
// features/apply-promo-code/ui/PromoCodeForm.tsx
import { useMutation } from '@tanstack/react-query'
import { applyPromoCode } from '../api/apply-promo-code'   // api
import { promoCodeSchema } from '../model/promo-code-schema' // model
import { normalizeCode } from '../lib/normalize-code'       // lib
import { MAX_CODE_LENGTH } from '../config/limits'          // config

export function PromoCodeForm() {
  const mutation = useMutation({ mutationFn: applyPromoCode })

  function onSubmit(form: FormData) {
    const code = promoCodeSchema.parse(normalizeCode(String(form.get('code'))))
    mutation.mutate(code)
  }

  return (
    <form action={onSubmit}>
      <input name="code" maxLength={MAX_CODE_LENGTH} />
      <button disabled={mutation.isPending}>Qo'llash</button>
    </form>
  )
}
```
:::

::: vue
```vue
<!-- features/apply-promo-code/ui/PromoCodeForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { applyPromoCode } from '../api/apply-promo-code'   // api
import { promoCodeSchema } from '../model/promo-code-schema' // model
import { normalizeCode } from '../lib/normalize-code'       // lib
import { MAX_CODE_LENGTH } from '../config/limits'          // config

const code = ref('')
const { mutate, isPending } = useMutation({ mutationFn: applyPromoCode })

function onSubmit() {
  mutate(promoCodeSchema.parse(normalizeCode(code.value)))
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input v-model="code" :maxlength="MAX_CODE_LENGTH" />
    <button :disabled="isPending">Qo'llash</button>
  </form>
</template>
```
:::

::: angular
```ts
// features/apply-promo-code/ui/promo-code-form.ts
import { Component, inject, signal } from '@angular/core'
import { PromoCodeApi } from '../api/promo-code-api'         // api
import { promoCodeSchema } from '../model/promo-code-schema' // model
import { normalizeCode } from '../lib/normalize-code'       // lib
import { MAX_CODE_LENGTH } from '../config/limits'          // config

@Component({
  selector: 'app-promo-code-form',
  template: `
    <form (submit)="onSubmit($event)">
      <input #code [maxLength]="maxLength" (input)="value.set(code.value)" />
      <button [disabled]="pending()">Qo'llash</button>
    </form>
  `,
})
export class PromoCodeForm {
  private readonly api = inject(PromoCodeApi)
  protected readonly maxLength = MAX_CODE_LENGTH
  protected readonly value = signal('')
  protected readonly pending = signal(false)

  onSubmit(event: Event) {
    event.preventDefault()
    this.pending.set(true)
    this.api.apply(promoCodeSchema.parse(normalizeCode(this.value())))
      .subscribe({ complete: () => this.pending.set(false), error: () => this.pending.set(false) })
  }
}
```
:::

## Qachon / qachon emas

| Holat | Qaysi segment |
| --- | --- |
| Faqat shu komponentga kerak formatlovchi | `ui` (komponent yonida) — yoki bir nechta joyda bo'lsa `lib` |
| Backend javobini UI ko'rinishiga aylantirish | `api` (mapper) |
| Holat, store, biznes qoidasi, sxema | `model` |
| Feature flag yoki chegaraviy son | `config` |
| Hech biriga mos kelmaydi | Maqsadni bildiruvchi o'z segmentingiz: `analytics/`, `routes/` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `components/`, `hooks/`, `types/`, `utils/` | Mohiyat bo'yicha guruhlash — qidiruvda foydasiz | `ui`, `model`, `lib` yoki maqsad nomi |
| `ui/components/` ichma-ich | Ortiqcha daraja, desegmentatsiya belgisi | To'g'ridan-to'g'ri `ui/` |
| Har segmentda `index.ts` | Bundler sekinlashadi, sikl xavfi | Faqat slice darajasida `index.ts` |
| `model/types.ts` — hamma tiplar bitta faylda | Bir nechta domen aralashadi | Domen nomli fayllar: `model/product.ts` (17-bob) |
| `assets/` segmenti | Joylashuv printsipi buziladi | Rasm — uni ishlatadigan `ui` yonida (25-bob) |

## Manbalar

- Rasmiy: *Slices and segments — Segments* <https://feature-sliced.design/docs/reference/slices-segments>
- Rasmiy: *Desegmentation* <https://feature-sliced.design/docs/guides/issues/desegmented>

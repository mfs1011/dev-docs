# 45 — Formalar arxitekturasi

[← Oldingi: HTTP qatlami](44-http-qatlami.md) · [Mundarija](README.md) · [Keyingi: Render mexanizmi →](46-render-mexanizmi.md)

## Tushuncha

15-bobda `v-model` va input turlarini ko'rdik. Real formada esa yana beshta narsa kerak: validatsiya qoidalari, xatolarni qachon ko'rsatish, server xatolarini maydonlarga bog'lash, yuborish holati va saqlanmagan o'zgarishlardan ogohlantirish.

Bu bobda ularni bosqichma-bosqich quramiz va oxirida kutubxona qachon kerakligini aniqlaymiz.

## Kod: 1-daraja — qo'lda validatsiya

```vue
<script setup>
import { computed, reactive, ref } from 'vue'

const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const submitted = ref(false)

const errors = computed(() => {
  const result = {}

  if (!form.email) result.email = 'Pochta majburiy'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) result.email = 'Pochta noto\'g\'ri'

  if (!form.password) result.password = 'Parol majburiy'
  else if (form.password.length < 8) result.password = 'Kamida 8 belgi'

  return result
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

// Xato faqat maydonga tegilgandan yoki yuborilgandan keyin ko'rsatiladi
const shownErrors = computed(() => {
  const result = {}

  for (const [field, message] of Object.entries(errors.value)) {
    if (submitted.value || touched[field]) result[field] = message
  }

  return result
})
</script>

<template>
    <form novalidate @submit.prevent="submitted = true; isValid && save()">
        <label>
            Pochta
            <input v-model.trim="form.email" type="email" @blur="touched.email = true">
            <small v-if="shownErrors.email" class="error">{{ shownErrors.email }}</small>
        </label>

        <button type="submit">Kirish</button>
    </form>
</template>
```

Asosiy g'oya: **validatsiya — `computed` (10-bob), ko'rsatish esa alohida qaror.** Foydalanuvchi hali yozayotganda qizil matn chiqarish — eng ko'p uchraydigan UX xatosi.

## Kod: 2-daraja — sxema bilan (zod)

```bash
npm i zod
```

```js
// schemas/user.js
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  email: z.string().email('Pochta noto\'g\'ri'),
  age: z.coerce.number().int().min(18, '18 yoshdan katta bo\'lishi kerak'),
  password: z.string().min(8, 'Kamida 8 belgi'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: 'Parollar mos kelmadi',
  path: ['confirm'],
})
```

```js
// composables/useForm.js
import { computed, reactive, ref } from 'vue'

export function useForm(schema, initial) {
  const values = reactive({ ...initial })
  const touched = reactive({})
  const serverErrors = ref({})
  const submitted = ref(false)

  const result = computed(() => schema.safeParse(values))
  const isValid = computed(() => result.value.success)

  const errors = computed(() => {
    const byField = { ...serverErrors.value }

    if (!result.value.success) {
      for (const issue of result.value.error.issues) {
        const field = issue.path.join('.')

        if (submitted.value || touched[field]) byField[field] ??= issue.message
      }
    }

    return byField
  })

  function touch(field) {
    touched[field] = true
  }

  function setServerErrors(details) {
    serverErrors.value = details ?? {}
  }

  async function handleSubmit(onValid) {
    submitted.value = true
    serverErrors.value = {}

    if (!isValid.value) return

    try {
      await onValid(result.value.data)        // tipi tozalangan ma'lumot
    } catch (error) {
      if (error.status === 422) setServerErrors(error.details)
      else throw error
    }
  }

  return { values, errors, isValid, touch, handleSubmit, setServerErrors }
}
```

```vue
<script setup>
import { userSchema } from '@/schemas/user'
import { useForm } from '@/composables/useForm'
import { api } from '@/api/client'

const { values, errors, touch, handleSubmit } = useForm(userSchema, {
  name: '', email: '', age: '', password: '', confirm: '',
})

const submit = () => handleSubmit((data) => api.post('/users', data))
</script>

<template>
    <form novalidate @submit.prevent="submit">
        <UiField label="Ism" :error="errors.name">
            <input v-model.trim="values.name" @blur="touch('name')">
        </UiField>

        <UiField label="Pochta" :error="errors.email">
            <input v-model.trim="values.email" type="email" @blur="touch('email')">
        </UiField>

        <button type="submit">Yuborish</button>
    </form>
</template>
```

Yutuq: qoidalar **bitta joyda** (sxema) va o'sha sxemani serverda ham (Node bo'lsa) yoki tiplarni chiqarishda ham ishlatish mumkin: `type User = z.infer<typeof userSchema>` (49-bob).

## Kod: server xatolarini maydonlarga bog'lash

Backend odatda shunday javob qaytaradi:

```json
{
  "message": "Validatsiya xatosi",
  "errors": { "email": ["Bu pochta band"], "age": ["18 dan katta bo'lishi kerak"] }
}
```

44-bobdagi `ApiError` buni `error.details` ga solgan edi. `useForm` uni `serverErrors` ga qo'yadi va maydon yonida ko'rsatadi. Ikki qoida:

1. **Server xatosi klient xatosidan ustun** — u haqiqiy holatni biladi (masalan "bu pochta band" ni klient bila olmaydi);
2. **Maydon o'zgarganda server xatosi tozalanadi** — aks holda u yangi qiymat uchun ham turaveradi:

```js
watch(() => values.email, () => delete serverErrors.value.email)
```

## Kod: `UiField` — takrorlanmaydigan razmetka

```vue
<!-- UiField.vue -->
<script setup>
import { useId } from 'vue'

const props = defineProps({ label: String, error: String, hint: String })

const id = useId()                       // Vue 3.5+: SSR'ga xavfsiz noyob id
</script>

<template>
    <div class="field" :class="{ 'has-error': error }">
        <label :for="id">{{ label }}</label>

        <slot :id="id" :describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined" />

        <small v-if="error" :id="`${id}-error`" class="field-error" role="alert">{{ error }}</small>
        <small v-else-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</small>
    </div>
</template>
```

```vue
<UiField v-slot="{ id, describedby }" label="Pochta" :error="errors.email">
    <input :id="id" v-model="values.email" :aria-describedby="describedby" :aria-invalid="!!errors.email">
</UiField>
```

`aria-invalid` va `aria-describedby` — skrinrider foydalanuvchisi xatoni eshitishi uchun majburiy (64-bob).

## Kod: saqlanmagan o'zgarishlar

```js
import { onBeforeRouteLeave } from 'vue-router'

const initial = JSON.stringify(values)
const isDirty = computed(() => JSON.stringify(values) !== initial)

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true

  return window.confirm('Saqlanmagan o\'zgarishlar bor. Chiqasizmi?')
})

// Brauzer tab'ini yopishdan ogohlantirish
useEventListener(window, 'beforeunload', (event) => {
  if (isDirty.value) event.preventDefault()
})
```

## Muhandislik nuqtai nazari: qachon xato ko'rsatiladi

| Payt | Ko'rsatilsinmi | Sabab |
| --- | --- | --- |
| Yozayotganda (birinchi marta) | Yo'q | Foydalanuvchi hali tugatmagan |
| `blur` da | Ha | Maydonni tark etdi — qaror qildi |
| Yuborishda | Ha, hammasi | Va birinchi xato maydoniga fokus |
| Tuzatayotganda (xato ko'ringandan keyin) | Ha, jonli | Endi u tuzatishga harakat qilyapti |

Oxirgi qator muhim: xato bir marta ko'rsatilgach, o'sha maydon uchun validatsiya **real vaqtda** ishlashi kerak — foydalanuvchi to'g'ri yozganini darhol ko'rsin.

Yuborishda birinchi xato maydoniga fokus berish:

```js
await nextTick()
document.querySelector('[aria-invalid="true"]')?.focus()
```

## Muhandislik nuqtai nazari: kutubxona kerakmi

| Holat | Yechim |
| --- | --- |
| 2–5 maydon, oddiy qoidalar | Qo'lda `computed` (1-daraja) |
| 5–15 maydon, umumiy qoidalar | `useForm` + zod (2-daraja) |
| Dinamik maydonlar, massivlar, qadamli forma, ko'p til | VeeValidate + zod |
| Juda katta forma (50+ maydon) | Maydon darajasida komponentlar + lokal validatsiya |

VeeValidate qo'shadigan narsalar: `<FieldArray>` (dinamik qatorlar), `useFieldArray`, `setFieldError`, `handleSubmit` ichida `resetForm`, tashqi sxema adapterlari. O'zingiz yozgan `useForm` shu funksiyalarga yetganda ko'chish mantiqan to'g'ri.

## Muhandislik nuqtai nazari: ma'lumot shakli

Forma qiymatlari va API kutadigan shakl ko'pincha farq qiladi:

```js
// Forma: sana input satri, telefon formatlangan, tanlovlar obyekt
// API:   ISO sana, faqat raqamlar, ID massiv

function toPayload(values) {
  return {
    name: values.name,
    birthday: new Date(values.birthday).toISOString(),
    phone: values.phone.replace(/\D/g, ''),
    roleIds: values.roles.map((r) => r.id),
  }
}
```

Bu o'girishni **bitta joyda** qiling (sxemaning `transform` i yoki `toPayload` funksiyasi). Aks holda u komponent ichida tarqalib ketadi va test qilib bo'lmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har harfda qizil xato ko'rsatish | Foydalanuvchi bosim ostida his qiladi | `touched` + `submitted` |
| Faqat klient validatsiyasiga ishonish | Osongina chetlab o'tiladi | Serverda ham (15-bob) |
| Server xatolarini umumiy toast bilan ko'rsatish | Qaysi maydon xato — noma'lum | `error.details` ni maydonlarga bog'lash |
| `<form>` siz tugma bilan yuborish | Enter ishlamaydi, brauzer semantikasi yo'qoladi | `<form @submit.prevent>` |
| `novalidate` ni unutish | Brauzerning o'z xabarlari sizning validatsiyangiz bilan to'qnashadi | `<form novalidate>` |
| `aria-invalid`/`aria-describedby` yo'q | Skrinrider xatoni o'qimaydi | `UiField` naqshi |
| Yuborish paytida tugmani bloklamaslik | Ikki marta yuboriladi | `loading` (44-bob) |
| Saqlanmagan o'zgarishlarni ogohlantirmaslik | Ma'lumot yo'qoladi | `onBeforeRouteLeave` |

## Amaliyot

1. Ro'yxatdan o'tish formasini 1-daraja (qo'lda) bilan yozing: `touched`/`submitted` mantiqi bilan.
2. Uni zod sxemasiga ko'chiring va `useForm` composable'ini yozing.
3. Serverdan 422 qaytaring (yoki mock qiling) va xatolar maydonlar yonida chiqishini ta'minlang; maydon o'zgarganda tozalansin.
4. `UiField` ni yozing, `aria-invalid` va `aria-describedby` bilan. VoiceOver/NVDA bilan tekshiring.
5. `onBeforeRouteLeave` bilan saqlanmagan o'zgarish ogohlantirishini qo'shing.

## Rasmiy hujjat

- Formalar: <https://vuejs.org/guide/essentials/forms.html>
- `useId`: <https://vuejs.org/api/composition-api-helpers.html#useid>
- zod: <https://zod.dev>
- VeeValidate: <https://vee-validate.logaretm.com>

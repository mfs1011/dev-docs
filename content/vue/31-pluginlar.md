# 31 — Pluginlar

[← Oldingi: Custom direktivalar](30-custom-direktivalar.md) · [Mundarija](README.md) · [Keyingi: Transition →](32-transition.md)

## Tushuncha

Plugin — ilovaga **ilova darajasidagi imkoniyat** qo'shadigan obyekt yoki funksiya. Vue Router, Pinia, i18n — hammasi plugin.

```js
// plugins/toast.js
export default {
  install(app, options) {
    const toasts = reactive([])

    app.provide('toasts', toasts)
    app.config.globalProperties.$toast = (message) => toasts.push({ id: Date.now(), message })
    app.component('ToastContainer', ToastContainer)
  },
}
```

```js
// main.js
import toast from '@/plugins/toast'

app.use(toast, { duration: 3000 })
```

`install(app, options)` — plugin'ning yagona talab qilinadigan qismi. Funksiya ham bo'ladi:

```js
export default function (app, options) { /* ... */ }
```

## Kod: plugin nima qila oladi

```js
export default {
  install(app, options) {
    // 1. Global komponentlar
    app.component('UiButton', UiButton)

    // 2. Global direktivalar
    app.directive('focus', vFocus)

    // 3. provide (composable'lar orqali ishlatish uchun — tavsiya etiladi)
    app.provide(ApiKey, createApi(options))

    // 4. Global xossa (eski uslub, ehtiyot bilan)
    app.config.globalProperties.$api = api

    // 5. Ilova konfiguratsiyasi
    app.config.errorHandler = (error) => reportError(error)

    // 6. Boshqa pluginni ulash
    app.use(anotherPlugin)

    // 7. mixin (deyarli hech qachon kerak emas)
    app.mixin({ /* ... */ })
  },
}
```

## Kod: to'liq misol — API klienti plugini

```js
// plugins/api.js
import { inject } from 'vue'

export const ApiKey = Symbol('api')

function createApi(baseUrl, getToken) {
  async function request(path, options = {}) {
    const token = getToken?.()

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw Object.assign(new Error(`HTTP ${response.status}`), { status: response.status })
    }

    return response.status === 204 ? null : response.json()
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
  }
}

export default {
  install(app, { baseUrl, getToken }) {
    app.provide(ApiKey, createApi(baseUrl, getToken))
  },
}

// Composable — ishlatuvchi uchun toza yuza
export function useApi() {
  const api = inject(ApiKey)
  if (!api) throw new Error('useApi: api plugini ulanmagan')

  return api
}
```

```js
// main.js
import api from '@/plugins/api'

app.use(api, {
  baseUrl: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem('token'),
})
```

```vue
<script setup>
import { useApi } from '@/plugins/api'

const api = useApi()
const users = ref([])

onMounted(async () => {
  users.value = await api.get('/users')
})
</script>
```

Bu naqshning uch foydasi bor: bog'liqlik import orqali ko'rinadi, testda `provide` ni almashtirish oson, TypeScript tiplari ishlaydi.

## Kod: kutubxona sifatida plugin yozish

```js
// index.js
import UiButton from './UiButton.vue'
import UiInput from './UiInput.vue'

const components = { UiButton, UiInput }

export default {
  install(app, options = {}) {
    const prefix = options.prefix ?? ''

    for (const [name, component] of Object.entries(components)) {
      app.component(prefix + name, component)
    }
  },
}

// Alohida import ham mumkin bo'lsin
export { UiButton, UiInput }
```

Shunda foydalanuvchi ikki yo'ldan birini tanlaydi: hammasini global qilish (`app.use`) yoki kerakligini import qilish (tree-shaking bilan).

## Muhandislik nuqtai nazari: `globalProperties` dan qochish

```js
// ✗ Eski uslub
app.config.globalProperties.$api = api
```

```vue
<script setup>
// `this` yo'q — `<script setup>` da umuman ishlatib bo'lmaydi
</script>
```

Muammolar:

1. `<script setup>` da `this` yo'q — `getCurrentInstance()` orqali olishga to'g'ri keladi (anti-naqsh);
2. TypeScript tipini qo'lda e'lon qilish kerak (`declare module`);
3. IDE "ta'rifga o'tish" ishlamaydi;
4. Testda mock qilish uchun global config'ga tegish kerak.

To'g'ri yo'l — `provide` + composable, yuqoridagi `useApi()` kabi.

## Muhandislik nuqtai nazari: plugin yoki oddiy modul

Hamma narsa plugin bo'lishi shart emas:

| Kerak | Vosita |
| --- | --- |
| Ilova darajasidagi konfiguratsiya, global komponent/direktiva | Plugin |
| Faqat funksiya to'plami (formatlash, hisob) | Oddiy modul: `import { formatPrice } from '@/utils'` |
| Reaktiv holat bilan mantiq | Composable |
| Global holat | Pinia store |

Belgisi: agar `install(app)` ichida `app` dan foydalanmasangiz — bu plugin emas, oddiy modul.

## Muhandislik nuqtai nazari: plugin tartibi

```js
app.use(createPinia())     // 1. Store — router guard'larida kerak bo'lishi mumkin
app.use(router)            // 2. Router
app.use(i18n)              // 3. Qolganlari
app.mount('#app')          // oxirida
```

Pinia router'dan oldin ulanadi, chunki router guard'lari (40-bob) store'ga murojaat qilishi mumkin va o'sha paytda store mavjud bo'lishi kerak.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `app.use()` ni `mount()` dan keyin chaqirish | Ta'sir qilmaydi | `mount` — oxirgi |
| `globalProperties` bilan xizmat ulash | `<script setup>`, TS, test bilan yomon ishlaydi | `provide` + composable |
| Plugin ichida `mixin` ishlatish | Har komponentga ta'sir, tushunarsiz xatti-harakat | Kerakli komponentlarga aniq ulash |
| Konfiguratsiyani plugin ichida hardcode qilish | Qayta ishlatib bo'lmaydi | `options` argumenti |
| Kutubxona pluginida `Symbol` o'rniga satr kaliti | Foydalanuvchi kaliti bilan to'qnashadi | `Symbol` |
| Pluginni Pinia'dan oldin ulab, guard'da store ishlatish | "getActivePinia was called with no active Pinia" | Tartibga rioya qiling |

## Amaliyot

1. `useApi` pluginini yozing va bitta sahifada ma'lumot yuklang. Keyin `getToken` ni o'zgartirib, `Authorization` sarlavhasi Network panelida chiqishini tekshiring.
2. Toast pluginini yozing: `useToast()` composable'i orqali xabar qo'shilsin, `ToastContainer` global komponent bo'lsin.
3. `globalProperties` bilan yozilgan versiyani ham qiling va ikkalasini test yozish nuqtai nazaridan solishtiring.
4. O'z dizayn tizimingizni plugin sifatida paketlang: `prefix` sozlamasi bilan.

## Rasmiy hujjat

- Pluginlar: <https://vuejs.org/guide/reusability/plugins.html>
- Application API: <https://vuejs.org/api/application.html>

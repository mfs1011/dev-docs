# 68 — Monitoring va xatolar

[← Oldingi: Deploy](67-deploy.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha →](69-amaliy-loyiha.md)

## Tushuncha

Production'da xatolarni **siz ko'rmaysiz** — foydalanuvchi ko'radi va ko'pincha hech kimga aytmaydi, shunchaki ketadi. Shuning uchun uchta qatlam kerak:

1. **Xatolarni ushlash** — ilova ichida (Vue, promise, tarmoq);
2. **Yuborish** — monitoring tizimiga (Sentry va shu kabilar);
3. **O'lchash** — Core Web Vitals va biznes voqealari.

## Kod: Vue xatolarini ushlash

```js
// main.js
const app = createApp(App)

app.config.errorHandler = (error, instance, info) => {
  // info: 'render function', 'setup function', 'watcher callback' ...
  console.error('[vue]', info, error)

  reportError(error, {
    component: instance?.$options.__name ?? instance?.$options.name,
    lifecycle: info,
  })
}

app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) console.warn(msg, trace)
}
```

Komponent darajasidagi chegara (20-bob):

```vue
<ErrorBoundary>
    <RiskyWidget />
</ErrorBoundary>
```

`errorHandler` **hamma narsani** ushlamaydi. Qolganlari:

```js
// Ushlanmagan promise xatolari (async funksiyalar)
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { type: 'unhandledrejection' })
})

// Global JS xatolari (Vue'dan tashqaridagi kod)
window.addEventListener('error', (event) => {
  reportError(event.error ?? new Error(event.message), {
    type: 'window.error',
    source: event.filename,
    line: event.lineno,
  })
})

// Resurs yuklanmadi (rasm, skript)
window.addEventListener('error', (event) => {
  if (event.target instanceof HTMLElement) {
    reportError(new Error(`Resurs yuklanmadi: ${event.target.src ?? event.target.href}`))
  }
}, true)                      // capture bosqichi
```

## Kod: Sentry bilan

```bash
npm i @sentry/vue
```

```js
// main.js
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,           // source map bilan bog'lash

  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],

  tracesSampleRate: 0.1,                               // so'rovlarning 10% i
  replaysOnErrorSampleRate: 1.0,                       // xato bo'lsa — yozuv

  // Shovqinni filtrlash
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /^Network request failed$/,
  ],

  beforeSend(event) {
    // Shaxsiy ma'lumotni olib tashlash
    if (event.request?.cookies) delete event.request.cookies

    return event
  },
})
```

Xatoga kontekst qo'shish:

```js
Sentry.setUser({ id: user.id })              // email/ism emas — faqat ID
Sentry.setTag('feature', 'checkout')
Sentry.addBreadcrumb({ category: 'cart', message: 'Mahsulot qo\'shildi', level: 'info' })
```

## Kod: source map

Minifikatsiya qilingan kodda stack trace o'qib bo'lmaydi (`a.b is not a function`). Yechim — source map'ni monitoringga yuklash, lekin **saytga chiqarmaslik**:

```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: 'hidden',        // fayl yaratiladi, lekin bundle'ga havola qo'yilmaydi
  },
})
```

```yaml
# CI: source map'larni yuklab, keyin o'chirish
- run: npm run build
- run: npx sentry-cli sourcemaps upload --release ${{ github.sha }} dist/assets
- run: find dist -name '*.map' -delete
```

`sourcemap: true` (yashirin emas) bilan har kim sizning kodingizni o'qiy oladi — bu har doim ham muammo emas, lekin ongli qaror bo'lishi kerak.

## Kod: Core Web Vitals yuborish

```js
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

function send(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,            // 'good' | 'needs-improvement' | 'poor'
    path: location.pathname,
  })

  // sendBeacon sahifa yopilayotganda ham ishlaydi
  navigator.sendBeacon?.('/api/metrics', body) ?? fetch('/api/metrics', { method: 'POST', body })
}

onLCP(send)
onINP(send)
onCLS(send)
onTTFB(send)
```

Lokal Lighthouse bali — laboratoriya natijasi; bu esa **haqiqiy foydalanuvchilar** ma'lumoti (RUM). Ular ko'pincha sezilarli farq qiladi: sizning MacBook'ingiz va foydalanuvchining 4 yillik Android telefoni bir xil emas.

## Kod: xatolarni foydalanuvchiga ko'rsatish

```js
// composables/useErrorHandler.js
export function useErrorHandler() {
  const toast = useToast()

  function handle(error, fallbackMessage = 'Kutilmagan xatolik yuz berdi') {
    reportError(error)

    // 44-bobdagi ApiError
    if (error.status === 401) return navigateTo('/login')
    if (error.status === 403) return toast.error('Ruxsat yo\'q')
    if (error.status === 404) return toast.error('Topilmadi')
    if (error.status === 422) return                    // forma o'zi ko'rsatadi (45-bob)
    if (error.status >= 500) return toast.error('Serverda xatolik. Keyinroq urinib ko\'ring.')

    if (!navigator.onLine) return toast.error('Internet aloqasi yo\'q')

    toast.error(fallbackMessage)
  }

  return { handle }
}
```

Qoida (44-bob): foydalanuvchiga **nima qilishi kerakligini** ayting, texnik tafsilotni emas.

## Kod: logging (ishlab chiqish va production)

```js
// lib/logger.js
const isDev = import.meta.env.DEV

export const logger = {
  debug: (...args) => isDev && console.debug('[debug]', ...args),
  info: (...args) => isDev && console.info('[info]', ...args),

  warn: (message, context) => {
    console.warn('[warn]', message, context)
    Sentry.captureMessage(message, { level: 'warning', extra: context })
  },

  error: (error, context) => {
    console.error('[error]', error, context)
    Sentry.captureException(error, { extra: context })
  },
}
```

Production'da `console.log` qoldirmang: u ma'lumot sizdirishi va DevTools'ni ifloslantirishi mumkin. ESLint qoidasi `no-console` (55-bob) buni nazorat qiladi; kerakli joylarda `logger` ishlating.

## Muhandislik nuqtai nazari: nimani kuzatish kerak

| Qatlam | Ko'rsatkich | Vosita |
| --- | --- | --- |
| Xatolar | Xato soni, ta'sirlangan foydalanuvchilar | Sentry |
| Unumdorlik | LCP, INP, CLS (RUM) | web-vitals |
| Tarmoq | API xato darajasi, javob vaqti | Sentry tracing / backend |
| Biznes | Buyurtma, ro'yxatdan o'tish, voronka | Analitika |
| Mavjudlik | Sayt ochiladimi | Uptime monitoring (tashqi) |

Birinchi kunda hammasi kerak emas. Minimal to'plam: **xato monitoringi + uptime**. Keyin RUM, keyin tracing.

## Muhandislik nuqtai nazari: shovqin bilan kurash

Monitoring ishga tushgan birinchi haftada odatda minglab hodisa keladi va ular orasida haqiqiy xatolar ko'rinmay qoladi. Tipik shovqin manbalari:

| Manba | Nima qilish |
| --- | --- |
| Brauzer kengaytmalari | `ignoreErrors` + `denyUrls` |
| `ResizeObserver loop limit exceeded` | Filtrlash (odatda zararsiz) |
| Bot va skanerlar | User-Agent bo'yicha filtr |
| Tarmoq uzilishlari | Alohida guruh, alert qo'ymaslik |
| Eski chunk xatolari (28, 67-bob) | Sahifani yangilash bilan hal qilish |

Maqsad — **har bir alert harakatga arziydigan** bo'lishi. Aks holda jamoa alertlarni e'tiborsiz qoldirishni o'rganadi.

## Muhandislik nuqtai nazari: maxfiylik

Monitoring foydalanuvchi ma'lumotini yig'adi — bunga ehtiyot bilan yondashing:

- `Sentry.setUser({ id })` — faqat ID, ism/email emas;
- Session Replay'da `maskAllText: true` — matnlar yashiriladi;
- `beforeSend` da cookie, token, parol maydonlarini tozalang;
- URL query'da shaxsiy ma'lumot bo'lsa, uni ham tozalang;
- Foydalanuvchilarni xabardor qiling (maxfiylik siyosati).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Monitoring umuman yo'q | Xatolar haqida bilmaysiz | Sentry yoki muqobil |
| `unhandledrejection` ni ushlamaslik | Async xatolar yo'qoladi | Global listener |
| Source map yuklamaslik | Stack o'qib bo'lmaydi | `sourcemap: 'hidden'` + upload |
| Hamma xatolarni toast bilan ko'rsatish | Foydalanuvchi qo'rqadi, foyda yo'q | Toifalarga bo'lish (44-bob) |
| Shaxsiy ma'lumotni yuborish | Maxfiylik buzilishi | `beforeSend` da tozalash |
| Shovqinni filtrlamaslik | Haqiqiy xatolar ko'rinmaydi | `ignoreErrors` |
| `tracesSampleRate: 1.0` katta saytda | Kvota va narx | 0.1 yoki pastroq |
| Faqat laboratoriya (Lighthouse) ko'rsatkichlariga qarash | Haqiqiy foydalanuvchi boshqacha ko'radi | RUM |

## Amaliyot

1. `app.config.errorHandler` va `unhandledrejection` listenerini yozing; komponentda ataylab xato tashlang.
2. Sentry'ni ulang (bepul tarif) va birinchi xatoni panelda ko'ring.
3. `sourcemap: 'hidden'` bilan build qiling, map'ni yuklang va stack trace o'qilishini tekshiring.
4. `web-vitals` bilan LCP/INP/CLS ni o'z endpointingizga yuboring.
5. `useErrorHandler` ni yozing va uch xil xato (401, 500, offline) uchun turli xabar ko'rsating.

## Rasmiy hujjat

- Vue `errorHandler`: <https://vuejs.org/api/application.html#app-config-errorhandler>
- Sentry Vue: <https://docs.sentry.io/platforms/javascript/guides/vue/>
- web-vitals: <https://github.com/GoogleChrome/web-vitals>

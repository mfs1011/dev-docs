# 57 — Qo'lda SSR qurish

[← Oldingi: SSR mexanizmi](56-ssr-mexanizmi.md) · [Mundarija](README.md) · [Keyingi: SSG va prerender →](58-ssg-va-prerender.md)

## Tushuncha

Bu bobda Vite + Express bilan minimal, lekin ishlaydigan SSR qurib chiqamiz. Maqsad — Nuxt ichkarida nima qilishini tushunish. Production'da odatda Nuxt ishlatiladi (59-bob), lekin mexanizmni bilish debug va qaror qabul qilishda kerak.

Tuzilma:

```
├── index.html          ← <!--app-html--> va <!--state--> joylari bilan
├── server.js           ← Express + Vite middleware
└── src/
    ├── main.js         ← createApp() — umumiy fabrika
    ├── entry-client.js ← hydration
    └── entry-server.js ← renderToString
```

## Kod: umumiy fabrika

```js
// src/main.js
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import { routes } from './routes'

// Har so'rovga (server) va bir marta (klient) chaqiriladi
export function createApp() {
  const app = createSSRApp(App)

  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  })

  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  return { app, router, pinia }
}
```

`createSSRApp` — `createApp` ning SSR varianti: klientda u mavjud DOM'ga hydration qiladi, qaytadan yaratmaydi.

## Kod: klient kirish nuqtasi

```js
// src/entry-client.js
import { createApp } from './main'

const { app, router, pinia } = createApp()

// Serverdan kelgan holatni tiklash (56-bob)
if (window.__PINIA__) pinia.state.value = window.__PINIA__

router.isReady().then(() => {
  app.mount('#app')          // mavjud HTML'ga ulanadi
})
```

`router.isReady()` muhim: marshrut hal bo'lmasdan mount qilsangiz, birinchi render server natijasiga mos kelmaydi.

## Kod: server kirish nuqtasi

```js
// src/entry-server.js
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(url) {
  const { app, router, pinia } = createApp()

  await router.push(url)
  await router.isReady()

  const matched = router.currentRoute.value.matched
  if (!matched.length) {
    return { status: 404, html: '', state: '{}' }
  }

  // Marshrutga bog'langan ma'lumotni yuklash (soddalashtirilgan)
  await Promise.all(
    matched
      .flatMap((record) => Object.values(record.components ?? {}))
      .map((component) => component.prefetch?.({ pinia, route: router.currentRoute.value })),
  )

  const ctx = {}
  const html = await renderToString(app, ctx)

  return {
    status: 200,
    html,
    state: JSON.stringify(pinia.state.value).replace(/</g, '\\u003c'),
    // ctx.modules — shu so'rovda ishlatilgan komponentlar (preload uchun)
    modules: ctx.modules,
  }
}
```

## Kod: Express server (dev + prod)

```js
// server.js
import fs from 'node:fs/promises'
import express from 'express'

const isProd = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173

const app = express()

let vite

if (!isProd) {
  const { createServer } = await import('vite')

  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  app.use(vite.middlewares)
} else {
  app.use('/assets', express.static('dist/client/assets', { immutable: true, maxAge: '1y' }))
}

app.use('*', async (req, res) => {
  const url = req.originalUrl

  try {
    let template
    let render

    if (!isProd) {
      template = await fs.readFile('index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.js')).render
    } else {
      template = await fs.readFile('dist/client/index.html', 'utf-8')
      render = (await import('./dist/server/entry-server.js')).render
    }

    const { status, html, state } = await render(url)

    const page = template
      .replace('<!--app-html-->', html)
      .replace('<!--state-->', `<script>window.__PINIA__=${state}</script>`)

    res.status(status).set({ 'Content-Type': 'text/html' }).end(page)
  } catch (error) {
    vite?.ssrFixStacktrace(error)
    console.error(error)
    res.status(500).end('Internal Server Error')
  }
})

app.listen(port, () => console.log(`http://localhost:${port}`))
```

## Kod: `index.html` va build

```html
<!doctype html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <title>Ilova</title>
    <!--state-->
</head>
<body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/src/entry-client.js"></script>
</body>
</html>
```

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --ssr src/entry-server.js --outDir dist/server",
    "start": "NODE_ENV=production node server.js"
  }
}
```

Ikkita build: klient uchun (brauzerga) va server uchun (Node'da ishlaydigan modul).

## Kod: streaming render

Katta sahifalarda foydalanuvchi butun HTML tayyor bo'lishini kutmasligi mumkin:

```js
import { renderToWebStream } from 'vue/server-renderer'

app.use('*', async (req, res) => {
  const { app: vueApp } = createApp()

  res.setHeader('Content-Type', 'text/html')
  res.write(templateStart)                    // <head> va ochilish teglari

  const stream = renderToWebStream(vueApp)

  for await (const chunk of stream) res.write(chunk)

  res.end(templateEnd)
})
```

Yutuq — TTFB pasayadi. Narxi: `<head>` ni oldindan yuborganingiz uchun sahifaga xos `<title>` va meta teglarni keyin qo'sha olmaysiz (61-bobda bu masala ko'riladi).

## Muhandislik nuqtai nazari: qo'lda SSR nimani talab qiladi

Yuqoridagi 100 qator ishlaydi, lekin production'ga chiqish uchun yana kerak bo'ladi:

| Masala | Nima qilish kerak |
| --- | --- |
| Ma'lumot yuklash | Marshrut/komponent darajasida konvensiya (`prefetch`, `useAsyncData`) |
| Meta teglar | `@unhead/vue` yoki shunga o'xshash (61-bob) |
| Xatolar va 404 | Status kodlar, xato sahifasi |
| Cookie va autentifikatsiya | So'rov kontekstini komponentlarga uzatish |
| Kesh | CDN + server keshi, kesh kaliti (56-bob) |
| Asset preload | `ctx.modules` dan `<link rel="modulepreload">` yasash |
| Deploy | Node server, process manager, monitoring (67-bob) |

Shuning uchun amaliy tavsiya oddiy: **Nuxt** shu ro'yxatning hammasini beradi. Qo'lda SSR mantiqan to'g'ri bo'ladigan holatlar — mavjud Node backend ichiga kichik SSR qo'shish yoki juda maxsus talablar.

## Muhandislik nuqtai nazari: so'rov konteksti

SSR'da "joriy foydalanuvchi" tushunchasi global bo'lishi mumkin emas (56-bob). Kontekstni uzatishning ikki yo'li:

```js
// 1. provide orqali (komponentlarga)
app.provide('ssrContext', { cookies: req.headers.cookie, user })

// 2. Pinia store'ni to'ldirib yuborish
const auth = useAuthStore(pinia)
auth.user = await getUserFromCookie(req)
```

Ikkinchisi ko'proq ishlatiladi: klientda ham xuddi shu store'dan o'qiladi, ya'ni komponentlar ikki muhitda bir xil kod bilan yozila oladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `createApp` ni bir marta yaratib qayta ishlatish | Holat aralashadi | Har so'rovga fabrika |
| `router.isReady()` ni kutmaslik | Hydration mismatch | `await` qiling |
| Klientda `createApp` (SSR emas) ishlatish | HTML qayta yaratiladi, hydration yo'q | `createSSRApp` |
| State'ni escape qilmaslik | XSS | `.replace(/</g, '\\u003c')` |
| Dev va prod uchun bitta kod yo'li | Vite middleware prod'da yo'q | `isProd` bo'yicha ajratish |
| `ssrFixStacktrace` ni ishlatmaslik | Xato stack'i o'qib bo'lmaydi | `vite.ssrFixStacktrace(error)` |
| Statik fayllarni Node orqali berish | Sekin | CDN yoki nginx (67-bob) |

## Amaliyot

1. Yuqoridagi tuzilmani takrorlang: `main.js`, `entry-client.js`, `entry-server.js`, `server.js`.
2. Sahifani brauzerda "View source" bilan oching — mazmun HTML'da borligini tasdiqlang.
3. JavaScript'ni o'chirib (DevTools → Settings → Disable JavaScript) sahifani yuklang: mazmun ko'rinadimi?
4. Ataylab mismatch yarating (`{{ Math.random() }}`) va konsoldagi ogohlantirishni o'qing.
5. Pinia holatini serverda to'ldiring va klientda qayta so'rov ketmasligini Network panelida tekshiring.

## Rasmiy hujjat

- SSR qo'llanmasi: <https://vuejs.org/guide/scaling-up/ssr.html>
- `vue/server-renderer`: <https://vuejs.org/api/ssr.html>
- Vite SSR: <https://vite.dev/guide/ssr.html>

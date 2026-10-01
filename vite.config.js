import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const APP_ROOT = dirname(fileURLToPath(import.meta.url))
const CONTENT_SOURCE = resolve(APP_ROOT, process.env.DOCS_SOURCE ?? 'content')
const SYNC_SCRIPT = fileURLToPath(new URL('./scripts/sync-content.mjs', import.meta.url))
// Sinxronlash natijasi shu yerga yoziladi — uni kuzatish o'z-o'zini qayta ishga tushiradi
const SYNC_OUTPUT = resolve(APP_ROOT, 'src', 'content')

/**
 * Manba papkadagi .md fayllarni kuzatadi: yangi fayl qo'shilsa yoki
 * mavjudi o'zgarsa, kontentni qayta sinxronlaydi va sahifani yangilaydi.
 * Ya'ni Vue kodiga qo'l tegizmasdan yangi bob qo'shish yetarli.
 */
function markdownWatcher() {
  let lastRun = 0
  let running = false

  const resync = (server, file) => {
    if (!file.endsWith('.md')) return
    // Sinxronlash o'zi yozgan fayllarga javob bermasin (cheksiz sikl)
    if (resolve(file).startsWith(SYNC_OUTPUT)) return
    if (running) return
    if (Date.now() - lastRun < 200) return

    lastRun = Date.now()
    running = true

    try {
      execFileSync('node', [SYNC_SCRIPT], { stdio: 'inherit' })
      // src/content kuzatilmaydi — Vite eski transform keshini bermasligi uchun tozalaymiz
      server.moduleGraph.invalidateAll()
      server.ws.send({ type: 'full-reload' })
    } catch (error) {
      server.config.logger.error(`[docs] sinxronlash xatosi: ${error.message}`)
    } finally {
      running = false
    }
  }

  return {
    name: 'docs-markdown-watcher',
    configureServer(server) {
      server.watcher.add(CONTENT_SOURCE)
      server.watcher.unwatch(`${SYNC_OUTPUT}**`)
      server.watcher.on('add', (file) => resync(server, file))
      server.watcher.on('change', (file) => resync(server, file))
      server.watcher.on('unlink', (file) => resync(server, file))
    },
  }
}

/**
 * PWA: telefonga o'rnatiladi va offline ishlaydi.
 *
 * Ilova qobig'i (index.js/css, qidiruv indeksi, ikonkalar) — precache: birinchi kirishdanoq offline.
 * Boblar (har biri alohida chunk, hammasi ~6 MB) — precache EMAS: ochilgan bob keshga tushadi va
 * keyingi safar internetsiz ochiladi. Fayl nomida hash bor — kesh hech qachon eskirmaydi.
 * Yangi versiya chiqsa — foydalanuvchiga taklif qilinadi (registerType: 'prompt'), o'qish o'rtasida
 * sahifa o'zi qayta yuklanmaydi.
 */
function pwa() {
  return VitePWA({
    registerType: 'prompt',
    injectRegister: false,
    includeAssets: ['favicon*.svg', 'pwa/apple-touch-icon.png'],
    manifest: {
      name: "Dasturchi qo'llanmalari",
      short_name: "Qo'llanmalar",
      description: "Rasmiy hujjatlar asosida yozilgan o'zbekcha qo'llanmalar: Symfony, Laravel, Vue, React, Next.js, Angular, Arxitektura, FSD.",
      lang: 'uz',
      dir: 'ltr',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#0f1218',
      background_color: '#0f1218',
      categories: ['education', 'books', 'developer'],
      icons: [
        { src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: [
        'index.html',
        'assets/index-*.{js,css}',
        'assets/search-index-*.js',
        'favicon*.svg',
        'symfony-logo.svg',
        'pwa/*.{png,svg}',
      ],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          // Boblar: nomida hash bor — o'zgarmaydi, keshdan darhol beriladi
          urlPattern: ({ url, sameOrigin }) => sameOrigin && /\/assets\/.+\.js$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'boblar',
            expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 180 },
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
    devOptions: { enabled: false },
  })
}

export default defineConfig({
  // GitHub Pages uchun: BASE_PATH=/docs-web/ npm run build
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), markdownWatcher(), pwa()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5180,
    open: true,
  },
})

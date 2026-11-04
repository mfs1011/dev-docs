import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
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
 * Dev'da `npm run tts` yaratgan `audio/` ni `/tinglash/` manzilida beradi (pleyer sinovi uchun).
 * Production'da audio tashqi omborda bo'ladi (`VITE_AUDIO_BASE_URL`, docs/tts.md).
 */
function audioDevServer() {
  const AUDIO_DIR = resolve(APP_ROOT, 'audio')
  const TYPES = { '.ogg': 'audio/ogg', '.json': 'application/json' }

  return {
    name: 'docs-audio-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/tinglash', (req, res, next) => {
        const path = decodeURIComponent((req.url ?? '').split('?')[0])
        // Eski (teglar o'qilgan) variant faqat BUTUN bob uchun: yangi .ogg bo'lsa — faqat yangi fayllar.
        // Aks holda yangi audio'ga eski words.json aralashib, highlight sinxronlashmaydi.
        const page = path.replace(/\.(ogg|timings\.json|words\.json)$/, '')
        const hasNew = existsSync(resolve(AUDIO_DIR, `.${page}.ogg`))
        const root = hasNew ? path : path.replace(/^\/([^/]+)\//, '/_eski/$1-teglar/')
        const file = resolve(AUDIO_DIR, `.${root}`)
        const type = TYPES[file.slice(file.lastIndexOf('.'))]

        if (!file.startsWith(AUDIO_DIR) || !type || !existsSync(file)) return next()

        // Fayllar qayta yoziladi (chegaralar tuzatilganda) — brauzer eski nusxani ishlatmasin
        res.setHeader('Cache-Control', 'no-store')

        // Brauzer audio'ni bo'laklab (Range) so'raydi — busiz metadata yuklanmaydi
        const size = statSync(file).size
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '')

        res.setHeader('Content-Type', type)
        res.setHeader('Accept-Ranges', 'bytes')

        if (!range) {
          res.setHeader('Content-Length', size)
          createReadStream(file).pipe(res)

          return
        }

        const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]))
        const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1

        res.statusCode = 206
        res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
        res.setHeader('Content-Length', end - start + 1)
        createReadStream(file, { start, end }).pipe(res)
      })
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
    includeAssets: ['favicon*.svg', 'marks/*.svg', 'pwa/apple-touch-icon.png'],
    manifest: {
      name: "Dasturchi qo'llanmalari",
      short_name: "Qo'llanmalar",
      description: "Rasmiy hujjatlar asosida yozilgan o'zbekcha qo'llanmalar: Symfony, Laravel, Vue, React, Next.js, Angular, Arxitektura, FSD, SQL, Git, Docker.",
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
        'marks/*.svg',
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

/**
 * FSD tekshiruvchisi: haqiqiy Steiger qoidalari (@feature-sliced/steiger-plugin) brauzerda. Node modullari
 * (fs, path, url, module) xotiradagi fayl tizimi bilan almashtiriladi (src/fsd/shim), plugin'ning modul
 * darajasidagi `await` (tree-sitter yuklash) esa `globalThis.__steigerTayyor` promise'iga aylantiriladi.
 */
function labFsd() {
  const LIB = /\/node_modules\/(@feature-sliced|tsconfck|web-tree-sitter)\//
  const SHIM = {
    fs: 'fs.js', 'node:fs': 'fs.js', 'fs/promises': 'fs.js', 'node:fs/promises': 'fs.js',
    path: 'path.js', 'node:path': 'path.js',
    url: 'node.js', 'node:url': 'node.js', module: 'node.js', 'node:module': 'node.js',
  }
  const PARSERS = resolve(APP_ROOT, 'node_modules/@feature-sliced/steiger-plugin/dist/parsers')
  return {
    name: 'lab-fsd',
    enforce: 'pre',
    resolveId(id, importer) {
      if (importer && LIB.test(importer) && SHIM[id]) return resolve(APP_ROOT, 'src/fsd/shim', SHIM[id])
      return null
    },
    transform(code, id) {
      if (!id.includes('/@feature-sliced/steiger-plugin/dist/index.js')) return null
      const bosh = code.indexOf('var __dirname = dirname(fileURLToPath(import.meta.url));')
      const ext = code.indexOf('var extractors = [', bosh)
      const oxir = code.indexOf('\n];\n', ext) + 4
      if (bosh < 0 || ext < 0 || oxir < 4) throw new Error('steiger-plugin: kutilgan kod topilmadi (versiya o\'zgarganmi?)')
      const massiv = code.slice(ext + 'var extractors = '.length, oxir - 2)
      const imp = ['web-tree-sitter.wasm', 'tree-sitter-tsx.wasm', 'tree-sitter-svelte.wasm', 'tree-sitter-astro.wasm', 'tree-sitter-vue.wasm']
        .map((f, i) => `import __w${i} from ${JSON.stringify((i ? resolve(PARSERS, f) : resolve(APP_ROOT, 'node_modules/web-tree-sitter', f)) + '?url')};`).join('\n')
      const yangi = `var tsx, svelte, astro, vue, extractors;
globalThis.__steigerTayyor = (async () => {
  await Parser.init({ locateFile: () => __w0 });
  [tsx, svelte, astro, vue] = await Promise.all([__w1, __w2, __w3, __w4].map((u) => Language.load(u)));
  extractors = ${massiv};
})();
`
      return { code: imp + '\n' + code.slice(0, bosh) + yangi + code.slice(oxir), map: null }
    },
  }
}

export default defineConfig({
  // GitHub Pages uchun: BASE_PATH=/docs-web/ npm run build
  base: process.env.BASE_PATH ?? '/',
  plugins: [labFsd(), vue(), markdownWatcher(), audioDevServer(), pwa()],
  // v86, PGlite va SQLite o'z .wasm fayllarini o'zi yuklaydi — oldindan bundle qilinmaydi
  optimizeDeps: {
    // Steiger va uning bog'liqliklari — labFsd plugin ularning Node importlarini almashtiradi, oldindan bundle qilinmaydi
    exclude: ['v86', '@electric-sql/pglite', '@sqlite.org/sqlite-wasm', '@feature-sliced/steiger-plugin', '@feature-sliced/filesystem', 'tsconfck', 'web-tree-sitter'],
    include: ['typescript', 'lodash-es', 'pluralize', 'fastest-levenshtein'],
  },
  build: {
    rollupOptions: {
      output: {
        // Supabase SDK va trenajorlar kutubxonalari faqat kerak bo'lganda yuklanadi — `index-*` nomini olsa
        // PWA precache'ga (globPatterns: assets/index-*) tushib, har bir foydalanuvchiga oldindan yuklanardi
        manualChunks: (id) => {
          if (id.includes('/node_modules/@supabase/')) return 'supabase'
          if (id.includes('/node_modules/@electric-sql/pglite/')) return 'pglite'
          if (id.includes('/node_modules/@sqlite.org/sqlite-wasm/')) return 'sqlite'
          if (/\/node_modules\/(typescript|@feature-sliced|web-tree-sitter|tsconfck)\//.test(id)) return 'steiger'
          return undefined
        },
      },
    },
  },
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

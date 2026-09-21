import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const APP_ROOT = dirname(fileURLToPath(import.meta.url))
const CONTENT_SOURCE = resolve(APP_ROOT, process.env.DOCS_SOURCE ?? '../laravel-api-book/docs')
const SYNC_SCRIPT = fileURLToPath(new URL('./scripts/sync-content.mjs', import.meta.url))

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
    if (running) return
    if (Date.now() - lastRun < 200) return

    lastRun = Date.now()
    running = true

    try {
      execFileSync('node', [SYNC_SCRIPT], { stdio: 'inherit' })
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
      server.watcher.on('add', (file) => resync(server, file))
      server.watcher.on('change', (file) => resync(server, file))
      server.watcher.on('unlink', (file) => resync(server, file))
    },
  }
}

export default defineConfig({
  // GitHub Pages uchun: BASE_PATH=/docs-web/ npm run build
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), markdownWatcher()],
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

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageToc from '@/components/PageToc.vue'
import { renderMarkdown, sectionKindFor } from '@/markdown'
import { findBook, findPage, formatDate, loadSource, neighbours, resolveDocLink } from '@/docs'
import { clearMark, excerptOf, isRead, markFor, setMark, setRead } from '@/progress'

const route = useRoute()
const router = useRouter()

const html = ref('')
const page = shallowRef(null)
const headings = ref([])
const activeId = ref('')
const error = ref('')
/** 'offline' | 'stale' | 'other' — xato turi, foydalanuvchiga tushunarli xabar uchun */
const errorKind = ref('')

// Brauzerlar dinamik import xatosini turlicha yozadi (Chrome, Firefox, Safari)
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically/i
const article = ref(null)
const bookTitle = ref('')
const bookVersion = ref('')
const hasMarkHere = ref(false)
const pageRead = computed(() => Boolean(page.value) && isRead(page.value.route))

let flashTimer = null
let headingNodes = []
let scrollQueued = false
let layoutObserver = null
let insetQueued = false

const PARAGRAPH_KINDS = [
  { prefix: 'muammo', kind: 'problem' },
  { prefix: "ko'rinishi", kind: 'problem' },
  { prefix: 'yechim', kind: 'success' },
  { prefix: "to'g'ri yo'l", kind: 'success' },
  { prefix: 'qachon kerak emas', kind: 'warning' },
  { prefix: 'nega yomon', kind: 'danger' },
  { prefix: "bog'liq", kind: 'reference' },
]

function wrapSections(container) {
  const nodes = Array.from(container.children)

  for (const node of nodes) {
    if (node.tagName !== 'H2') continue

    const kind = sectionKindFor(node.textContent)
    if (!kind) continue

    const block = document.createElement('section')
    block.className = `callout callout-${kind.kind}`

    const badge = document.createElement('span')
    badge.className = 'callout-badge'
    badge.textContent = `${kind.icon} ${kind.label}`

    container.insertBefore(block, node)
    block.appendChild(badge)

    let cursor = node
    while (cursor && !(cursor !== node && cursor.tagName === 'H2')) {
      const next = cursor.nextElementSibling
      if (cursor.tagName === 'HR') break
      block.appendChild(cursor)
      cursor = next
    }
  }
}

function markParagraphs(container) {
  for (const paragraph of container.querySelectorAll('p')) {
    const strong = paragraph.firstElementChild

    if (!strong || strong.tagName !== 'STRONG') continue

    const label = strong.textContent.trim().toLowerCase().replace(/[.:]$/, '')
    const match = PARAGRAPH_KINDS.find((entry) => label.startsWith(entry.prefix))

    if (match) paragraph.classList.add('lead-note', `lead-${match.kind}`)
  }
}

function enhanceTables(container) {
  for (const table of container.querySelectorAll('table')) {
    if (table.parentElement?.classList.contains('table-wrap')) continue

    const wrap = document.createElement('div')
    wrap.className = 'table-wrap'
    table.replaceWith(wrap)
    wrap.appendChild(table)
  }
}

function enhanceNavLines(container) {
  for (const paragraph of container.querySelectorAll('p')) {
    const links = paragraph.querySelectorAll('a')
    if (links.length >= 2 && paragraph.textContent.includes('·')) {
      paragraph.classList.add('doc-nav')
    }
  }
}

function enhanceLinks(container, currentPage) {
  for (const link of container.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')

    if (/^https?:/.test(href)) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.classList.add('external-link')
      continue
    }

    const resolved = resolveDocLink(href, currentPage)
    if (!resolved) continue

    link.setAttribute('href', resolved)
    link.addEventListener('click', (event) => {
      event.preventDefault()
      router.push(resolved)
    })
  }
}

function enhanceCodeBlocks(container) {
  for (const button of container.querySelectorAll('.code-copy')) {
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block')?.querySelector('code')?.textContent ?? ''

      try {
        await navigator.clipboard.writeText(code)
        button.textContent = 'Nusxalandi'
      } catch {
        button.textContent = 'Xato'
      }

      setTimeout(() => {
        button.textContent = 'Nusxa olish'
      }, 1500)
    })
  }
}

function collectHeadings(container) {
  return Array.from(container.querySelectorAll('h2[id], h3[id]')).map((node) => ({
    id: node.id,
    level: Number(node.tagName.slice(1)),
    text: node.textContent.replace(/#$/, '').trim(),
  }))
}

/*
 * Aktiv sarlavhani scroll bo'yicha aniqlaymiz.
 *
 * Ilgari IntersectionObserver ishlatilardi: u faqat o'zgargan elementlar
 * haqida xabar berardi va chegara yaqinida aktiv bo'lim ikki sarlavha
 * orasida sakrab turardi. Endi qoida oddiy va barqaror: yuqori chegaradan
 * o'tgan oxirgi sarlavha — aktiv.
 */
const ACTIVE_OFFSET = 100

function trackHeadings(container) {
  headingNodes = Array.from(container.querySelectorAll('h2[id], h3[id]'))

  if (!headingNodes.length) {
    activeId.value = ''

    return
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  updateActive()
}

function updateActive() {
  scrollQueued = false

  let current = ''

  for (const node of headingNodes) {
    if (node.getBoundingClientRect().top > ACTIVE_OFFSET) break

    current = node.id
  }

  activeId.value = current || headingNodes[0]?.id || ''
}

function onScroll() {
  if (scrollQueued) return

  scrollQueued = true
  requestAnimationFrame(updateActive)
}

function stopTracking() {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  headingNodes = []
}

/* ---------- o'qish belgisi ---------- */

/** Belgi qo'yish mumkin bo'lgan bloklar — har biri manbadagi bitta qator */
const MARKABLE = 'p[data-line], li[data-line], h2[data-line], h3[data-line], blockquote[data-line], figure.code-block[data-line], .table-wrap[data-line]'

function setupMarkers(container, current) {
  // Jadval o'ramiga ichkaridagi jadvalning qatorini ko'chiramiz
  for (const wrap of container.querySelectorAll('.table-wrap')) {
    const line = wrap.querySelector('table[data-line]')?.dataset.line

    if (line) wrap.dataset.line = line
  }

  for (const block of container.querySelectorAll(MARKABLE)) {
    // Navigatsiya qatoriga belgi qo'yishning ma'nosi yo'q
    if (block.classList.contains('doc-nav')) continue

    block.classList.add('markable')

    const button = document.createElement('button')

    button.type = 'button'
    button.className = 'line-mark'
    button.dataset.line = block.dataset.line
    button.title = "Shu yerni belgilash"
    button.setAttribute('aria-label', "Shu yerni belgilash")
    button.innerHTML = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M2 1h8v12l-4-3.2L2 13z"/></svg>'

    button.addEventListener('click', () => {
      const line = Number(block.dataset.line)

      if (markFor(current.book)?.route === current.route && markFor(current.book)?.line === line) {
        clearMark(current.book)
      } else {
        setMark(current.book, {
          route: current.route,
          line,
          chapter: current.chapter ?? null,
          title: current.title,
          excerpt: excerptOf(block),
        })
      }

      paintMark(container, current)
    })

    block.prepend(button)
  }

  updateMarkInsets(container)
  observeLayout(container)
  paintMark(container, current)
}

/*
 * Belgi har doim sahifaning chap chetida tursin — blok qanchalik ichkarida
 * bo'lishidan qat'i nazar (ro'yxat bandi, ajratilgan blok, ichma-ich ro'yxat).
 * Har blok o'zining maqoladan qancha ichkarida ekanini `--mark-inset` da
 * saqlaydi, CSS esa shu qiymatni qaytarib chiqaradi.
 */
function updateMarkInsets(container) {
  const base = container.getBoundingClientRect().left

  for (const block of container.querySelectorAll('.markable')) {
    const inset = Math.max(0, Math.round(block.getBoundingClientRect().left - base))

    block.style.setProperty('--mark-inset', `${inset}px`)
  }
}

/** Oyna o'lchami yoki JS/TS almashtirgichi tartibni o'zgartirsa qayta hisoblaymiz */
function observeLayout(container) {
  layoutObserver?.disconnect()

  layoutObserver = new ResizeObserver(() => {
    if (insetQueued) return

    insetQueued = true
    requestAnimationFrame(() => {
      insetQueued = false
      updateMarkInsets(container)
    })
  })

  layoutObserver.observe(container)
}

/** Belgilangan blokni ajratib ko'rsatadi */
function paintMark(container, current) {
  const mark = markFor(current.book)
  const line = mark?.route === current.route ? mark.line : null

  for (const block of container.querySelectorAll('.markable.is-marked')) {
    block.classList.remove('is-marked')
    block.querySelector('.line-mark')?.setAttribute('aria-label', "Shu yerni belgilash")
  }

  if (line == null) {
    hasMarkHere.value = false

    return
  }

  const target = container.querySelector(`.markable[data-line="${line}"]`)

  if (!target) {
    hasMarkHere.value = false

    return
  }

  target.classList.add('is-marked')
  target.querySelector('.line-mark')?.setAttribute('aria-label', 'Belgini olib tashlash')
  hasMarkHere.value = true
}

/** Shu sahifadagi belgiga sakrash */
function scrollToMark(behavior = 'smooth') {
  const container = article.value
  const mark = page.value ? markFor(page.value.book) : null

  if (!container || !mark || mark.route !== page.value.route) return

  const target = container.querySelector(`.markable[data-line="${mark.line}"]`)

  if (!target) return

  target.scrollIntoView({ behavior, block: 'center' })

  // Scroll uzoq davom etishi mumkin (sahifada `scroll-behavior: smooth`) —
  // pulsni yetib borgandan keyin boshlaymiz, aks holda u yo'lda tugab qoladi.
  afterScrollSettles(() => flash(target))
}

function flash(target) {
  // Ketma-ket bosilganda animatsiya qayta ishga tushsin
  target.classList.remove('is-flash')
  void target.offsetWidth
  target.classList.add('is-flash')

  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => target.classList.remove('is-flash'), 1700)
}

/**
 * Scroll to'xtaganini kutadi. `scrollend` hodisasiga tayanmaydi: uning
 * qo'llab-quvvatlanishi brauzerlarda turlicha. O'rniga pozitsiya bir necha
 * kadr davomida o'zgarmasligini tekshiramiz.
 */
function afterScrollSettles(callback) {
  let last = window.scrollY
  let stable = 0
  let frames = 0

  const tick = () => {
    const now = window.scrollY

    stable = Math.abs(now - last) < 1 ? stable + 1 : 0
    last = now
    frames += 1

    // Dastlabki kadrlarda scroll hali boshlanmagan bo'lishi mumkin —
    // "to'xtadi" deb o'ylab qolmaslik uchun ularni o'tkazib yuboramiz.
    if (frames < 6) {
      requestAnimationFrame(tick)

      return
    }

    // ~2 soniyadan oshsa baribir boshlaymiz
    if (stable >= 3 || frames > 120) {
      callback()

      return
    }

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

async function load() {
  stopTracking()
  layoutObserver?.disconnect()
  error.value = ''
  errorKind.value = ''
  const current = findPage(route.path)

  if (!current) {
    page.value = null
    html.value = ''
    headings.value = []
    error.value = `Sahifa topilmadi: ${route.path}`

    return
  }

  page.value = current
  const book = findBook(current.book)
  bookTitle.value = book?.title ?? ''
  bookVersion.value = book?.version ?? ''
  document.title = `${current.title} — ${book?.title ?? ''} qo'llanma`

  try {
    const source = await loadSource(current)
    html.value = renderMarkdown(source)
  } catch (cause) {
    const isChunkError = CHUNK_ERROR.test(String(cause?.message))
    // Offline va bob hali keshda yo'q / onlayn, lekin fayl serverda yo'q (yangi deploy) / boshqa
    errorKind.value = isChunkError ? ((await isReachable()) ? 'stale' : 'offline') : 'other'
    error.value = cause.message
    html.value = ''

    return
  }

  await nextTick()

  const container = article.value
  if (!container) return

  wrapSections(container)
  markParagraphs(container)
  enhanceTables(container)
  enhanceNavLines(container)
  enhanceLinks(container, current)
  enhanceCodeBlocks(container)

  setupMarkers(container, current)

  headings.value = collectHeadings(container)
  trackHeadings(container)

  // `#belgi` — bosh sahifadagi "davom etish" havolasi shu yerga olib keladi
  if (route.hash === '#belgi') {
    scrollToMark('instant')
  } else if (route.hash) {
    document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const reloadPage = () => window.location.reload()

/**
 * Server haqiqatan javob beradimi. navigator.onLine ga ishonib bo'lmaydi:
 * Wi-Fi bor, internet yo'q bo'lsa ham u `true`. So'rov parametri bilan —
 * service worker keshidan emas, tarmoqdan.
 */
async function isReachable() {
  if (!navigator.onLine) return false

  try {
    const url = `${import.meta.env.BASE_URL}index.html?ping=${Date.now()}`
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })

    return response.ok
  } catch {
    return false
  }
}

watch(() => route.path, load, { immediate: true })

onBeforeUnmount(() => {
  stopTracking()
  layoutObserver?.disconnect()
  clearTimeout(flashTimer)
})
</script>

<template>
    <main class="content">
        <div class="content-main">
            <div v-if="page" class="page-meta">
                <p class="breadcrumb">{{ page.section }}</p>
                <p class="page-meta-info">
                    <button
                        v-if="hasMarkHere"
                        type="button"
                        class="mark-jump"
                        @click="scrollToMark()"
                    >
                        <svg viewBox="0 0 12 14" aria-hidden="true"><path d="M2 1h8v12l-4-3.2L2 13z" /></svg>
                        belgiga o'tish
                    </button>
                    <span v-if="bookVersion">{{ bookTitle }} {{ bookVersion }}</span>
                    <span v-if="page.updatedAt">Yangilangan: {{ formatDate(page.updatedAt) }}</span>
                </p>
            </div>

            <div v-if="error" class="doc-error">
                <template v-if="errorKind === 'offline'">
                    <h1>Bu bob hali offline saqlanmagan</h1>
                    <p>Internet yo'q, bu bob esa avval ochilmagan. Internetga ulanganda bir marta oching — keyin u internetsiz ham ochiladi.</p>
                    <button type="button" class="doc-error-retry" @click="load">Qayta urinish</button>
                </template>
                <template v-else-if="errorKind === 'stale'">
                    <h1>Yangi versiya chiqqan</h1>
                    <p>Qo'llanmalar yangilangan, ochiq sahifa esa eski versiyada. Sahifani yangilang.</p>
                    <button type="button" class="doc-error-retry" @click="reloadPage">Sahifani yangilash</button>
                </template>
                <template v-else>
                    <h1>Xatolik</h1>
                    <p>{{ error }}</p>
                </template>
                <RouterLink to="/">Mundarijaga qaytish</RouterLink>
            </div>

            <article v-else ref="article" class="markdown" v-html="html" />

            <div v-if="page && !error" class="read-toggle-row">
                <button
                    type="button"
                    class="read-toggle"
                    :class="{ 'is-read': pageRead }"
                    :aria-pressed="pageRead"
                    @click="setRead(page.route, !pageRead)"
                >
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8.4l3 3 6.6-6.8" /></svg>
                    {{ pageRead ? "O'qildi" : "O'qildi deb belgilash" }}
                </button>
            </div>

            <nav v-if="page" class="pager">
                <RouterLink
                    v-if="neighbours(page.route).previous"
                    class="pager-link"
                    :to="neighbours(page.route).previous.route"
                >
                    <span>← Oldingi</span>
                    <strong>{{ neighbours(page.route).previous.label }}</strong>
                </RouterLink>
                <span v-else />

                <RouterLink
                    v-if="neighbours(page.route).next"
                    class="pager-link pager-next"
                    :to="neighbours(page.route).next.route"
                >
                    <span>Keyingi →</span>
                    <strong>{{ neighbours(page.route).next.label }}</strong>
                </RouterLink>
            </nav>
        </div>

        <PageToc :headings="headings" :active-id="activeId" />
    </main>
</template>

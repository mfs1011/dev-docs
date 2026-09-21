<script setup>
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageToc from '@/components/PageToc.vue'
import { renderMarkdown, sectionKindFor } from '@/markdown'
import { findBook, findPage, formatDate, loadSource, neighbours, resolveDocLink } from '@/docs'

const route = useRoute()
const router = useRouter()

const html = ref('')
const page = shallowRef(null)
const headings = ref([])
const activeId = ref('')
const error = ref('')
const article = ref(null)
const bookTitle = ref('')
const bookVersion = ref('')

let observer = null

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

function observeHeadings(container) {
  observer?.disconnect()

  const targets = container.querySelectorAll('h2[id], h3[id]')
  if (!targets.length) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )

  for (const target of targets) observer.observe(target)
}

async function load() {
  error.value = ''
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

  headings.value = collectHeadings(container)
  observeHeadings(container)

  if (route.hash) {
    document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

watch(() => route.path, load, { immediate: true })

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <main class="content">
        <div class="content-main">
            <div v-if="page" class="page-meta">
                <p class="breadcrumb">{{ page.section }}</p>
                <p class="page-meta-info">
                    <span v-if="bookVersion">{{ bookTitle }} {{ bookVersion }}</span>
                    <span v-if="page.updatedAt">Yangilangan: {{ formatDate(page.updatedAt) }}</span>
                </p>
            </div>

            <div v-if="error" class="doc-error">
                <h1>Xatolik</h1>
                <p>{{ error }}</p>
                <RouterLink to="/">Mundarijaga qaytish</RouterLink>
            </div>

            <article v-else ref="article" class="markdown" v-html="html" />

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

import manifest from './manifest.json'

const sources = import.meta.glob('./content/**/*.md', { query: '?raw', import: 'default' })

export const books = manifest.books
export const docsUpdatedAt = manifest.updatedAt

export const pages = books.flatMap((book) =>
  book.sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title, bookTitle: book.title })),
  ),
)

const byRoute = new Map(pages.map((page) => [page.route, page]))
const bookById = new Map(books.map((book) => [book.id, book]))

export function findPage(route) {
  return byRoute.get(route) ?? null
}

export function findBook(id) {
  return bookById.get(id) ?? null
}

export function bookIdFromRoute(route) {
  const id = route.split('/').filter(Boolean)[0]

  return bookById.has(id) ? id : null
}

export function neighbours(route) {
  const page = byRoute.get(route)
  if (!page) return { previous: null, next: null }

  const inBook = pages.filter((item) => item.book === page.book)
  const index = inBook.findIndex((item) => item.route === route)

  return {
    previous: index > 0 ? inBook[index - 1] : null,
    next: index >= 0 && index < inBook.length - 1 ? inBook[index + 1] : null,
  }
}

export async function loadSource(page) {
  const loader = sources[`./content/${page.file}`]

  if (!loader) throw new Error(`Kontent topilmadi: ${page.file}`)

  return loader()
}

/** Markdown ichidagi `.md` havolasini ilova marshrutiga aylantiradi. */
export function resolveDocLink(href, currentPage) {
  if (!href || /^(https?:|mailto:|#)/.test(href)) return null

  const [rawPath, hash] = href.split('#')
  if (!rawPath) return null

  const base = currentPage.path.includes('/')
    ? currentPage.path.slice(0, currentPage.path.lastIndexOf('/') + 1)
    : ''

  const stack = []

  for (const segment of (base + rawPath).split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') {
      stack.pop()
      continue
    }
    stack.push(segment)
  }

  const normalized = stack.join('/')
  const target = pages.find((page) => page.book === currentPage.book && page.path === normalized)

  if (!target) return null

  return hash ? `${target.route}#${hash}` : target.route
}

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]

export function formatDate(value) {
  if (!value) return null

  const date = new Date(value)

  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}`
}

/** Tabdagi faviconni ochiq kitobga moslaydi (kitobsiz sahifada — umumiy belgi). */
export function applyBookFavicon(book) {
  const link = document.querySelector('link[rel="icon"]')
  if (!link) return

  const base = import.meta.env.BASE_URL
  const name = book ? `favicon-${book.logo ?? book.id}.svg` : 'favicon.svg'

  link.href = `${base}${base.endsWith('/') ? '' : '/'}${name}`
}

/** Kitobga xos urg'u rangini CSS o'zgaruvchilariga yozadi. */
export function applyBookTheme(book) {
  const root = document.documentElement

  if (!book) {
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-text')

    return
  }

  const dark = root.dataset.theme === 'dark'
  const accent = dark ? book.accentDark ?? book.accent : book.accent

  if (accent) {
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-text', accent)
  }
}

import { readdir, readFile, writeFile, mkdir, rm, cp, rename, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { books, contentRoot } from '../docs.config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SOURCE_ROOT = resolve(ROOT, contentRoot)
const TARGET = join(ROOT, 'src', 'content')

async function walk(dir) {
  const out = []

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) {
      out.push(...(await walk(full)))
    } else if (entry.name.endsWith('.md')) {
      out.push(full)
    }
  }

  return out
}

export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/·/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

function extractMeta(markdown) {
  const lines = markdown.split('\n')
  let title = null
  const headings = []
  let inFence = false

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{1,3})\s+(.*)$/.exec(line)
    if (!match) continue

    const level = match[1].length
    const text = match[2].replace(/`/g, '').trim()

    if (level === 1 && !title) {
      title = text
      continue
    }
    if (level >= 2) headings.push({ level, text, slug: slugify(text) })
  }

  return { title, headings }
}

/** Sarlavha boshidagi "01 — " kabi raqam prefiksini olib tashlaydi (sidebar raqamni alohida chizadi). */
function stripChapterPrefix(title) {
  return String(title).replace(/^\d{1,3}\s*[—–-]\s*/, '').trim()
}

/**
 * Har bir .md fayl uchun oxirgi commit sanasi. Fayl mtime'i ishonchsiz:
 * CI klon qilganda hamma fayl bir xil vaqt oladi. Git tarixi bo'lmasa — bo'sh Map.
 */
function gitDates(sourceDir) {
  const dates = new Map()
  const run = (args) =>
    execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })

  let root
  try {
    root = run(['-C', sourceDir, 'rev-parse', '--show-toplevel']).trim()
  } catch {
    return dates
  }

  const prefix = relative(root, sourceDir).split('\\').join('/')
  let log

  try {
    log = run(['-C', root, 'log', '--pretty=format:%cI', '--name-only', '--', sourceDir])
  } catch {
    return dates
  }

  let date = null

  for (const line of log.split('\n')) {
    const value = line.trim()
    if (!value) continue

    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      date = value
      continue
    }

    if (!date || !value.endsWith('.md')) continue
    if (prefix && !value.startsWith(`${prefix}/`)) continue

    const rel = prefix ? value.slice(prefix.length + 1) : value
    if (!dates.has(rel)) dates.set(rel, new Date(date).toISOString())
  }

  return dates
}

function chapterNumber(relPath) {
  const match = /(^|\/)(\d{2})-/.exec(relPath)

  return match ? Number(match[2]) : null
}

function routeFor(book, relPath) {
  const clean = relPath.replace(/\.md$/, '')

  if (clean === 'README') return `/${book.id}`
  if (clean.endsWith('/README')) return `/${book.id}/${clean.slice(0, -'/README'.length)}`

  return `/${book.id}/${clean}`
}

async function readVersion(book, sourceDir) {
  if (!book.versionRow) return null

  try {
    const readme = await readFile(join(sourceDir, 'README.md'), 'utf8')
    const row = book.versionRow.exec(readme)
    if (!row) return null

    const version = /\d+\.\d+(\.\d+)?/.exec(row[1])

    return version ? version[0] : row[1].trim()
  } catch {
    return null
  }
}

function buildSections(book, pages) {
  const sections = []
  const used = new Set()

  const push = (title, items) => {
    if (!items.length) return
    sections.push({ title, items })
    for (const item of items) used.add(item.route)
  }

  const index = pages.find((page) => page.route === `/${book.id}`)
  if (index) push('Boshlanish', [{ ...index, label: 'Mundarija' }])

  const rootPages = pages.filter((page) => !page.path.includes('/'))

  for (const group of book.groups ?? []) {
    const items = rootPages
      .filter((page) => !used.has(page.route) && page.chapter !== null && page.chapter >= group.from && page.chapter <= group.to)
      .sort((a, b) => a.chapter - b.chapter)
      .map((page) => ({ ...page, label: stripChapterPrefix(page.title) }))

    push(group.title, items)
  }

  const folders = book.folders ?? []
  const knownFolders = new Set(folders.map((folder) => folder.dir))

  const folderNames = [
    ...folders.map((folder) => folder.dir),
    ...new Set(
      pages
        .filter((page) => page.path.includes('/'))
        .map((page) => page.path.split('/')[0])
        .filter((name) => !knownFolders.has(name)),
    ),
  ]

  for (const name of folderNames) {
    const config = folders.find((folder) => folder.dir === name)
    const items = pages
      .filter((page) => page.path.startsWith(`${name}/`) && !used.has(page.route))
      .sort((a, b) => (a.path.endsWith('README.md') ? -1 : b.path.endsWith('README.md') ? 1 : a.path.localeCompare(b.path)))
      .map((page) => ({ ...page, label: stripChapterPrefix(page.title) }))

    push(config?.title ?? name, items)
  }

  const extras = pages
    .filter((page) => !used.has(page.route))
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((page) => ({ ...page, label: stripChapterPrefix(page.title) }))

  push("Qo'shimcha", extras)

  return sections
}

async function collectBook(book, staging) {
  // `root` bergan kitob kontenti shu repo ichida; qolganlari tashqi manbadan (DOCS_SOURCE)
  const sourceDir = book.root ? join(ROOT, book.root, book.dir) : join(SOURCE_ROOT, book.dir)

  if (!existsSync(sourceDir)) {
    console.warn(`⚠ "${book.id}" uchun manba topilmadi: ${sourceDir}`)

    return null
  }

  const bookTarget = join(staging, book.id)
  await cp(sourceDir, bookTarget, { recursive: true })

  const files = await walk(bookTarget)
  const committed = gitDates(sourceDir)
  const pages = []

  for (const file of files) {
    const rel = relative(bookTarget, file).split('\\').join('/')
    const raw = await readFile(file, 'utf8')
    const { title, headings } = extractMeta(raw)
    const info = await stat(join(sourceDir, rel))

    pages.push({
      book: book.id,
      path: rel,
      file: `${book.id}/${rel}`,
      route: routeFor(book, rel),
      title: title ?? rel,
      chapter: chapterNumber(rel),
      updatedAt: committed.get(rel) ?? info.mtime.toISOString(),
      headings,
    })
  }

  const sections = buildSections(book, pages)
  const updatedAt = pages.map((page) => page.updatedAt).sort().at(-1) ?? null

  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle ?? null,
    logo: book.logo ?? null,
    accent: book.accent ?? null,
    accentDark: book.accentDark ?? null,
    apiSwitcher: book.apiSwitcher ?? false,
    versionLabel: book.versionLabel ?? book.title,
    version: await readVersion(book, sourceDir),
    chapterCount: pages.filter((page) => page.chapter !== null && !page.path.includes('/')).length,
    pageCount: pages.length,
    updatedAt,
    sections,
    searchIndex: pages.flatMap((page) => [
      { route: page.route, title: page.title, text: page.title, anchor: null },
      ...page.headings.map((heading) => ({
        route: page.route,
        title: page.title,
        text: heading.text,
        anchor: heading.slug,
      })),
    ]),
  }
}

async function main() {
  // Har ishga tushish o'z staging papkasida: dev-server watcher bilan qo'lbola sync to'qnashmasin
  const staging = `${TARGET}.tmp-${process.pid}`

  // Uzilib qolgan oldingi ishga tushishlardan qolgan papkalarni tozalash
  const parent = dirname(TARGET)
  const leftovers = (await readdir(parent)).filter((name) => name.startsWith('content.tmp'))

  await Promise.all(leftovers.map((name) => rm(join(parent, name), { recursive: true, force: true })))

  await rm(staging, { recursive: true, force: true })
  await mkdir(staging, { recursive: true })

  const collected = []

  for (const book of books) {
    const result = await collectBook(book, staging)
    if (result) collected.push(result)
  }

  if (!collected.length) {
    throw new Error(`Hech qanday kitob topilmadi. Manba papka: ${SOURCE_ROOT}`)
  }

  await rm(TARGET, { recursive: true, force: true })

  try {
    await rename(staging, TARGET)
  } finally {
    await rm(staging, { recursive: true, force: true })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    updatedAt: collected.map((book) => book.updatedAt).filter(Boolean).sort().at(-1) ?? null,
    books: collected,
  }

  await writeFile(join(ROOT, 'src', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')

  for (const book of collected) {
    console.log(
      `✔ ${book.title} ${book.version ?? ''} · ${book.pageCount} sahifa · ` +
        `oxirgi yangilanish ${book.updatedAt?.slice(0, 10) ?? '?'}`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

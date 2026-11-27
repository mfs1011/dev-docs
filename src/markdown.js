import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/core'

import php from 'highlight.js/lib/languages/php'
import phpTemplate from 'highlight.js/lib/languages/php-template'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import twig from 'highlight.js/lib/languages/twig'
import ini from 'highlight.js/lib/languages/ini'
import nginx from 'highlight.js/lib/languages/nginx'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import sql from 'highlight.js/lib/languages/sql'
import plaintext from 'highlight.js/lib/languages/plaintext'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import diff from 'highlight.js/lib/languages/diff'
import markdown from 'highlight.js/lib/languages/markdown'

hljs.registerLanguage('php', php)
hljs.registerLanguage('php-template', phpTemplate)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('twig', twig)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('markdown', markdown)
// Vue SFC — HTML grammatikasi eng yaqin natija beradi
hljs.registerLanguage('vue', xml)

const LANGUAGE_LABELS = {
  php: 'PHP',
  shell: 'Terminal',
  bash: 'Terminal',
  yaml: 'YAML',
  json: 'JSON',
  twig: 'Twig',
  xml: 'XML',
  html: 'HTML',
  javascript: 'JavaScript',
  ini: 'INI',
  nginx: 'Nginx',
  dockerfile: 'Dockerfile',
  sql: 'SQL',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  js: 'JavaScript',
  vue: 'Vue SFC',
  css: 'CSS',
  scss: 'SCSS',
  diff: 'Diff',
  markdown: 'Markdown',
}

export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/·/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  highlight(code, language, attrs) {
    // ```text vps — VPS'da olingan chiqish (Linux kitobi): trenajorda ishga tushirish tugmasi qo'yilmaydi.
    // ```text tashqi — serverga tashqi kompyuterdan (muallifning noutbukidan) yuborilgan so'rov: tugma ham yo'q
    const envNom = /(^|\s)(vps|tashqi)(\s|$)/.exec(attrs ?? '')?.[2]
    const env = envNom ? ` data-env="${envNom}"` : ''
    const lang = language && hljs.getLanguage(language) ? language : 'plaintext'
    const label = LANGUAGE_LABELS[language] ?? (language ? language.toUpperCase() : 'KOD')

    let highlighted
    try {
      highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch {
      highlighted = md.utils.escapeHtml(code)
    }

    return (
      `<figure class="code-block" data-language="${md.utils.escapeHtml(label)}"${env}>` +
      `<figcaption><span class="code-lang">${md.utils.escapeHtml(label)}</span>` +
      `<button type="button" class="code-copy" aria-label="Nusxa olish">Nusxa olish</button></figcaption>` +
      `<pre class="hljs"><code>${highlighted}</code></pre>` +
      `</figure>`
    )
  },
})

/**
 * Variant bloklari: `::: options` / `::: composition` (Vue), `::: js` / `::: ts` (React, Next)
 * va `::: react` / `::: vue` / `::: angular` (FSD — framework tanlagich).
 * Blok ichidagi markdown odatdagidek ishlanadi, tashqarisiga guruh va variant atributlari
 * bo'lgan div o'raladi. Markdown fayl toza qoladi: GitHub'da ham o'qilaveradi.
 */
const VARIANT_GROUPS = {
  options: 'api',
  composition: 'api',
  js: 'lang',
  ts: 'lang',
  react: 'fw',
  vue: 'fw',
  angular: 'fw',
}

function apiVariants(mdInstance) {
  const MARKER = ':'
  const KINDS = new Set(Object.keys(VARIANT_GROUPS))

  mdInstance.block.ruler.before('fence', 'api_variant', (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (state.sCount[startLine] - state.blkIndent >= 4) return false
    if (state.src.slice(start, start + 3) !== MARKER.repeat(3)) return false

    const kind = state.src.slice(start + 3, max).trim().toLowerCase()
    if (!KINDS.has(kind)) return false
    if (silent) return true

    let nextLine = startLine
    let closed = false

    while (nextLine < endLine) {
      nextLine += 1
      if (nextLine >= endLine) break

      const from = state.bMarks[nextLine] + state.tShift[nextLine]
      const to = state.eMarks[nextLine]

      if (state.src.slice(from, to).trim() === MARKER.repeat(3)) {
        closed = true
        break
      }
    }

    const oldParent = state.parentType
    const oldLineMax = state.lineMax

    state.parentType = 'api_variant'
    state.lineMax = nextLine

    const open = state.push('api_variant_open', 'div', 1)
    open.attrs = [
      ['class', 'api-variant'],
      ['data-variant-group', VARIANT_GROUPS[kind]],
      ['data-variant', kind],
    ]
    open.map = [startLine, nextLine]
    open.markup = MARKER.repeat(3)

    state.md.block.tokenize(state, startLine + 1, nextLine)

    const close = state.push('api_variant_close', 'div', -1)
    close.markup = MARKER.repeat(3)

    state.parentType = oldParent
    state.lineMax = oldLineMax
    state.line = closed ? nextLine + 1 : nextLine

    return true
  })
}

md.use(apiVariants)

/**
 * Har bir blok elementiga markdown manbasidagi qator raqamini yozadi.
 * O'qish belgisi shu raqamga bog'lanadi: matn tahrirlanmaguncha barqaror,
 * oyna kengligi yoki shrift o'zgarsa siljib ketmaydi.
 */
function sourceLines(mdInstance) {
  mdInstance.core.ruler.push('source_lines', (state) => {
    for (const token of state.tokens) {
      if (token.map && token.nesting !== -1) {
        token.attrSet('data-line', String(token.map[0]))
      }
    }
  })
}

md.use(sourceLines)


md.use(anchor, {
  slugify,
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '#',
    placement: 'after',
    class: 'heading-anchor',
    ariaHidden: true,
  }),
})

// `highlight` tayyor `<figure>` qaytaradi — markdown-it uni yana <pre><code> ichiga o'ramasin.
md.renderer.rules.fence = (tokens, idx, options) => {
  const token = tokens[idx]
  const [language, ...attrs] = token.info.trim().split(/\s+/)
  const html = options.highlight(token.content, language, attrs.join(' '))

  if (!token.map) return html

  return html.replace('<figure class="code-block"', `<figure data-line="${token.map[0]}" class="code-block"`)
}

/**
 * Xom HTML'dagi `public/` fayllari (masalan, `<video src="/video/...">`) markdown'da `/` bilan
 * yoziladi; sayt ildizda bo'lmasa (`BASE_PATH`), yo'lga BASE_URL qo'shiladi.
 */
const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/')

/**
 * Video darslar GitHub Pages'da emas (sayt 1 GB chegarasidan oshib ketdi): production'da ular
 * `VITE_VIDEO_BASE_URL` dan (Oracle: https://video.kamgapir.uz/video/) beriladi. Boshqa domendagi
 * `<track>` subtitrlari ishlashi uchun `<video>` ga `crossorigin="anonymous"` qo'shiladi
 * (server CORS sarlavhasini beradi). O'zgaruvchi bo'lmasa (dev) — avvalgidek `public/video/`.
 */
const VIDEO = (import.meta.env?.VITE_VIDEO_BASE_URL ?? '').replace(/\/?$/, '/')
const withVideo = (html) =>
  VIDEO === '/'
    ? html
    : html
        .replace(/\b(src|poster)="\/video\//g, `$1="${VIDEO}`)
        .replace(/<video\b(?![^>]*\bcrossorigin\b)/g, '<video crossorigin="anonymous"')

const withBase = (html) => withVideo(html).replace(/\b(src|poster)="\/(?!\/)/g, `$1="${BASE}`)

for (const rule of ['html_block', 'html_inline']) {
  const original = md.renderer.rules[rule]
  md.renderer.rules[rule] = (tokens, idx, options, env, self) => withBase(original(tokens, idx, options, env, self))
}

/**
 * Kitob qisqartmalari (docs.config.mjs → `qisqartmalar`): matndagi `CC`, `FD` kabi so'zlar
 * `<abbr class="qisqartma">` ga o'raladi, to'liq nomi tooltip bo'lib ko'rinadi (src/qisqartma.js).
 * Qiymat satr bo'lsa — matnning istalgan joyida. `{ tip, faqatManba: true }` bo'lsa — faqat manba
 * shaklida: `X:` (havolada `[SSH: …]`) yoki qavs ichida `(X)`, `(X,` (masalan `SSH`, `API` oddiy so'z yoki
 * atama ta'rifi `SSH (Secure Shell)` bo'lib ham kelgani uchun).
 * Faqat oddiy matn tokenlari o'zgaradi: `code`, kod bloklari va HTML'ga tegilmaydi.
 */
const QISQ_CHEGARA = '[\\p{L}\\p{N}_]'
const qisqRegex = (keys, faqatManba) =>
  new RegExp(
    faqatManba
      ? `(?<!${QISQ_CHEGARA})(${keys.join('|')})(?=:)|(?<=\\()(${keys.join('|')})(?=[),])`
      : `(?<!${QISQ_CHEGARA})(${keys.join('|')})(?!${QISQ_CHEGARA})`,
    'gu',
  )

md.core.ruler.push('qisqartma', (state) => {
  const map = state.env?.qisqartmalar
  if (!map) return
  const tipOf = (k) => (typeof map[k] === 'string' ? map[k] : map[k]?.tip)
  const keys = (manba) => Object.keys(map).filter((k) => tipOf(k) && Boolean(map[k]?.faqatManba) === manba)
  const res = [keys(false), keys(true)].map((k, i) => (k.length ? qisqRegex(k, i === 1) : null)).filter(Boolean)
  if (!res.length) return

  for (const block of state.tokens) {
    if (block.type !== 'inline' || !block.children) continue
    const out = []
    for (const token of block.children) {
      if (token.type !== 'text') {
        out.push(token)
        continue
      }
      const hits = res
        .flatMap((re) => [...token.content.matchAll(re)])
        .map((m) => ({ index: m.index, key: m[1] ?? m[2] }))
        .sort((x, y) => x.index - y.index)
      if (!hits.length) {
        out.push(token)
        continue
      }
      let last = 0
      for (const { index, key } of hits) {
        if (index < last) continue
        if (index > last) {
          const t = new state.Token('text', '', 0)
          t.content = token.content.slice(last, index)
          out.push(t)
        }
        const tip = md.utils.escapeHtml(`${key} — ${tipOf(key)}`)
        const h = new state.Token('html_inline', '', 0)
        h.content = `<abbr class="qisqartma" tabindex="0" data-tip="${tip}" aria-label="${tip}">${key}</abbr>`
        out.push(h)
        last = index + key.length
      }
      if (last < token.content.length) {
        const t = new state.Token('text', '', 0)
        t.content = token.content.slice(last)
        out.push(t)
      }
    }
    block.children = out
  }
})

export function renderMarkdown(source, env = {}) {
  return md.render(source, env)
}

/**
 * Sarlavha matniga qarab bo'limlarni turkumlaydi.
 * Yangi bo'lim nomi qo'shilsa, shu yerga bitta qator yoziladi.
 */
export const SECTION_KINDS = [
  { kind: 'danger', icon: '⚠', label: 'Ehtiyot bo\'ling', match: /^tipik xatolar/i },
  { kind: 'insight', icon: '◆', label: 'Chuqurroq', match: /^muhandislik nuqtai nazari/i },
  { kind: 'practice', icon: '✎', label: 'Mashq', match: /^amaliyot/i },
  { kind: 'reference', icon: '↗', label: 'Manba', match: /^(rasmiy hujjat|bog'liq patternlar)/i },
  { kind: 'success', icon: '✓', label: 'Yechim', match: /^yechim/i },
  { kind: 'warning', icon: '!', label: 'Chegara', match: /^(qachon kerak emas|ogohlantirish)/i },
  { kind: 'problem', icon: '✕', label: 'Muammo', match: /^(muammo|ko'rinishi)/i },
]

export function sectionKindFor(headingText) {
  const clean = String(headingText).replace(/#/g, '').trim()

  return SECTION_KINDS.find((entry) => entry.match.test(clean)) ?? null
}

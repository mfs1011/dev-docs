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
  highlight(code, language) {
    const lang = language && hljs.getLanguage(language) ? language : 'plaintext'
    const label = LANGUAGE_LABELS[language] ?? (language ? language.toUpperCase() : 'KOD')

    let highlighted
    try {
      highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch {
      highlighted = md.utils.escapeHtml(code)
    }

    return (
      `<figure class="code-block" data-language="${md.utils.escapeHtml(label)}">` +
      `<figcaption><span class="code-lang">${md.utils.escapeHtml(label)}</span>` +
      `<button type="button" class="code-copy" aria-label="Nusxa olish">Nusxa olish</button></figcaption>` +
      `<pre class="hljs"><code>${highlighted}</code></pre>` +
      `</figure>`
    )
  },
})

/**
 * `::: options` / `::: composition` bloklari — rasmiy hujjatdagi API almashtirgichi.
 * Blok ichidagi markdown odatdagidek ishlanadi, tashqarisiga `data-api` atributli div o'raladi.
 * Markdown fayl toza qoladi: GitHub'da ham o'qilaveradi.
 */
function apiVariants(mdInstance) {
  const MARKER = ':'
  const KINDS = new Set(['options', 'composition'])

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
    open.attrs = [['class', 'api-variant'], ['data-api', kind]]
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
  const language = token.info.trim().split(/\s+/)[0]

  return options.highlight(token.content, language)
}

export function renderMarkdown(source) {
  return md.render(source)
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

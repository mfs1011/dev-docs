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

md.use(anchor, {
  slugify,
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '#',
    placement: 'after',
    class: 'heading-anchor',
    ariaHidden: true,
  }),
})

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

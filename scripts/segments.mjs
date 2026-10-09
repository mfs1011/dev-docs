import { createHash } from 'node:crypto'
import MarkdownIt from 'markdown-it'

/**
 * Bobni ovoz bilan o'qish uchun segmentlarga ajratadi:
 *
 *   [heading]   sarlavha
 *   [paragraph] oddiy matn (ro'yxat bandlari va iqtiboslar ham shu yerga)
 *   [table]     jadval: bir jumlali izoh + har qator "birinchi ustun — qolgani"
 *   [image]     rasmning alt-matni
 *   [code]      kod o'qilmaydi — faqat "Kod misoli." deb e'lon qilinadi
 *   [pause]     bo'limlar orasidagi to'xtash
 *
 * Har segmentda manbadagi qator raqami bor (`line`) — keyin o'qilayotgan joyni
 * sahifada belgilash va faqat o'zgargan boblar uchun ovozni qayta yaratish uchun.
 */

const md = new MarkdownIt({ html: true, linkify: true })

/** Renderer'dagi variant bloklari (`src/markdown.js` bilan bir xil ro'yxat) */
const VARIANT_GROUPS = {
  options: 'api',
  composition: 'api',
  js: 'lang',
  ts: 'lang',
  react: 'fw',
  vue: 'fw',
  angular: 'fw',
}

/** O'qilmaydigan bo'limlar: havolalar ro'yxati ovozda foydasiz */
const SKIPPED_SECTIONS = /^(rasmiy hujjat|manbalar)\b/i

/**
 * Ketma-ket variant bloklaridan faqat birinchisi qoladi — aks holda bir xil
 * tushuntirish ikki-uch marta o'qiladi. Qator raqamlari o'zgarmasligi uchun
 * olib tashlangan qatorlar bo'sh qator bilan almashtiriladi.
 */
function keepFirstVariant(markdown) {
  const lines = markdown.split('\n')
  const out = []
  let inFence = false
  let block = null
  let lastGroupEnd = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()

    if (/^(```|~~~)/.test(trimmed)) inFence = !inFence

    if (!inFence && !block) {
      const kind = /^:::\s*([a-z-]+)\s*$/i.exec(trimmed)?.[1]?.toLowerCase()

      if (kind && VARIANT_GROUPS[kind]) {
        const group = VARIANT_GROUPS[kind]
        // Oldingi variant shu guruhdan va oradagi qatorlar bo'sh — bu o'sha guruhning davomi
        const continues = lastGroupEnd?.group === group &&
          lines.slice(lastGroupEnd.index + 1, index).every((between) => between.trim() === '')

        block = { drop: continues, group }
        out.push('')
        continue
      }

      if (trimmed !== '') lastGroupEnd = null
    }

    if (block && !inFence && trimmed === ':::') {
      lastGroupEnd = { group: block.group, index }
      block = null
      out.push('')
      continue
    }

    out.push(block?.drop ? '' : line)
  }

  return out.join('\n')
}

/**
 * Inline token'lardan o'qiladigan matn: `kod` belgilari olib tashlanadi (ichidagi so'z o'qiladi),
 * havolaning faqat matni qoladi, rasmlar alohida `[image]` segmentiga chiqadi.
 * Matni URL'ning o'zi bo'lgan havola `cleanText` da "havola" so'ziga aylanadi.
 */
function inlineText(token) {
  if (!token?.children) return token?.content ?? ''

  return token.children
    .map((child) => {
      if (child.type === 'text' || child.type === 'code_inline') return child.content
      if (child.type === 'softbreak' || child.type === 'hardbreak') return ' '

      return ''
    })
    .join('')
}

function cleanText(text) {
  return String(text)
    .replace(/https?:\/\/\S+/g, 'havola')
    .replace(/[←→↑↓⇄]/g, ' ')
    .replace(/[*_#>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** O'qishda to'xtash aniq bo'lishi uchun har segment tinish belgisi bilan tugaydi */
function sentence(text) {
  const clean = cleanText(text)

  if (!clean) return ''

  return /[.!?:;…]$/.test(clean) ? clean : `${clean}.`
}

function imagesIn(token) {
  return (token?.children ?? [])
    .filter((child) => child.type === 'image')
    .map((child) => child.content || child.attrGet('alt') || '')
    .filter(Boolean)
}

/** Bob boshidagi "← Oldingi · Mundarija · Keyingi →" qatori — ovozda o'qilmaydi */
function isNavigation(token) {
  const children = token?.children ?? []

  return children.some((child) => child.type === 'link_open') && /Mundarija/.test(inlineText(token)) && /·/.test(inlineText(token))
}

/** Savol ko'rinishidagi ustun nomi — undan keyin "?" qo'yiladi ("Nega yomon? …") */
// So'roq so'zi bilan boshlanadi yoki "-mi" bilan tugaydi ("Hook kerakmi")
const QUESTION_HEADER = /^(nega|nima uchun|qachon|qanday|qaysi|nima|kim|necha|qayerda|qancha)\b|mi\??$/i
const YES = /[✅✔✓☑]\uFE0F?/gu
const NO = /[❌✗✖❎]\uFE0F?/gu
const OTHER_SYMBOLS = /[\p{Extended_Pictographic}\uFE0F]/gu

/**
 * Jadval katagi → o'qiladigan matn. Belgilar o'qilmaydi (model ularni har xil tilda aytadi):
 * yolg'iz ✅ → "ha", yolg'iz ❌ → "yo'q", "✅ Eng qisqa" → "Eng qisqa". "—" yoki bo'sh → null (o'qilmaydi).
 */
function spokenCell(value) {
  const raw = String(value).trim()
  const text = raw.replace(YES, '').replace(NO, '').replace(OTHER_SYMBOLS, '').replace(/\s+/g, ' ').trim()

  // "✅ (SSR bilan)" — faqat izoh qolsa, ma'no yo'qolmasin: "ha (SSR bilan)"
  if (text.startsWith('(') && /[✅✔✓☑]/u.test(raw)) return `ha ${text}`.replace(/[.;:,]+$/, '')
  if (text.startsWith('(') && /[❌✗✖❎]/u.test(raw)) return `yo'q ${text}`.replace(/[.;:,]+$/, '')
  if (text && !/^[—–-]+$/.test(text)) return text.replace(/[.;:,]+$/, '')
  if (YES.test(raw)) return 'ha'
  if (NO.test(raw)) return "yo'q"

  return null
}

/**
 * Jadval: qisqa izoh, keyin har qator ustun nomlari bilan (docs/tts.md, "Jadvallarni o'qish qoidalari"):
 *   Xato. useFormStatus ni … chaqirish. Nega yomon? Har doim pending: false. To'g'ri yechim: Bola komponentda.
 * Ustunlar ro'yxati sanalmaydi — model undan keyin jadvalni o'zidan "davom ettirgan" (react/11-props).
 */
function readTable(tokens, start, context) {
  const rows = []
  let row = null
  let cell = null
  let index = start

  for (; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token.type === 'table_close') break
    if (token.type === 'tr_open') row = []
    else if (token.type === 'tr_close') rows.push(row)
    else if (token.type === 'th_open' || token.type === 'td_open') cell = ''
    else if (token.type === 'inline' && cell !== null) cell += cleanText(inlineText(token))
    else if (token.type === 'th_close' || token.type === 'td_close') {
      row.push(cell)
      cell = null
    }
  }

  const [header = [], ...body] = rows
  const names = header.map((name) => spokenCell(name) ?? '')
  const lines = [sentence(context ? `Quyidagi jadval «${context}» bo'limiga oid` : 'Quyidagi jadval')]

  for (const cells of body) {
    const parts = []

    cells.forEach((value, column) => {
      const spoken = spokenCell(value)
      const name = names[column]

      if (spoken === null) return
      if (!name) parts.push(`${spoken}.`)
      else if (column === 0) parts.push(`${name}. ${spoken}.`)
      else if (QUESTION_HEADER.test(name)) parts.push(`${name}? ${spoken}.`)
      else parts.push(`${name}: ${spoken}.`)
    })

    if (parts.length) lines.push(cleanText(parts.join(' ')))
  }

  return { text: lines.join('\n'), end: index }
}

export function toSegments(markdown) {
  const tokens = md.parse(keepFirstVariant(markdown), {})
  const segments = []
  const push = (type, text, token) => {
    if (type !== 'pause' && !text) return

    const last = segments.at(-1)

    // Ketma-ket kod bloklari bitta e'lon; ketma-ket pauza bitta
    if (last?.type === type && (type === 'code' || type === 'pause')) return

    segments.push({ type, text, line: token?.map?.[0] ?? null })
  }

  let heading = null
  let skipping = false
  let listDepth = 0
  let quoteDepth = 0

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token.type === 'heading_open') {
      const text = cleanText(inlineText(tokens[index + 1]))
      const level = Number(token.tag.slice(1))

      if (level <= 2) skipping = SKIPPED_SECTIONS.test(text)
      if (skipping) continue

      if (segments.length) push('pause', '', token)
      push('heading', sentence(text.replace(/^\d{1,3}\s*[—–-]\s*/, '')), token)
      heading = text
      index += 2
      continue
    }

    if (skipping) continue

    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') listDepth += 1
    if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') listDepth -= 1
    if (token.type === 'blockquote_open') quoteDepth += 1
    if (token.type === 'blockquote_close') quoteDepth -= 1

    if (token.type === 'fence' || token.type === 'code_block') {
      push('code', 'Kod misoli.', token)
      continue
    }

    if (token.type === 'hr') {
      push('pause', '', token)
      continue
    }

    if (token.type === 'table_open') {
      const { text, end } = readTable(tokens, index, heading)

      push('table', text, token)
      index = end
      continue
    }

    if (token.type === 'inline' && tokens[index - 1]?.type === 'paragraph_open') {
      if (isNavigation(token)) continue

      for (const alt of imagesIn(token)) push('image', sentence(`Rasm. ${alt}`), tokens[index - 1])

      push('paragraph', sentence(inlineText(token)), tokens[index - 1])
    }
  }

  if (segments.length && segments.at(-1).type !== 'pause') segments.push({ type: 'pause', text: '', line: null })

  return segments
}

/** Namunadagi matn formati: `[tur]`, keyin matn, segmentlar orasida bo'sh qator */
export function segmentsToText(segments) {
  return segments.map(({ type, text }) => (text ? `[${type}]\n${text}` : `[${type}]`)).join('\n\n') + '\n'
}

/** Ovozni qayta yaratish kerakmi — matn o'zgarganini shu hash bilan bilamiz */
export function segmentsHash(segments) {
  return createHash('sha256').update(segmentsToText(segments)).digest('hex').slice(0, 16)
}

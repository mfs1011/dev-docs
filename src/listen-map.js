/**
 * Ovozdagi so'zlarni (`<bob>.words.json`) sahifadagi so'zlarga — DOM Range'larga — moslash.
 * Pleyer (ListenPlayer.vue) va tekshiruv simulyatsiyasi shu bitta funksiyani ishlatadi.
 *
 * Ovoz matni sahifadan farq qiladigan joylar (segments.mjs shunday yasaydi) uchun zaxira:
 *   - jadval izohi ("Quyidagi jadval «Tushuncha» bo'limiga oid") — bo'lim nomi jadval ustidagi
 *     sarlavhadan, qolgani — jadvalning sarlavha qatori;
 *   - har qatorda takrorlanadigan ustun nomi ("Nega yomon?") — sarlavhadagi o'sha katak;
 *   - "Kod misoli." — kod blokining birinchi qatori.
 * Shunda ovoz ketayotganda ekranda doim nimadir belgilangan bo'ladi.
 */

/** Taqqoslash uchun so'z: kichik harf, apostroflar bir xil, belgilar olib tashlangan */
export const normalizeWord = (word) => String(word).toLowerCase().replace(/[ʻʼ’‘`´]/g, "'").replace(/[^\p{L}\p{N}']/gu, '')

/** Ketma-ket moslashda oldinga qarash oynasi (URL o'rniga "havola" kabi farqlar o'tkazib yuboriladi) */
const LOOKAHEAD = 12

function tokensIn(element, doc, { includeCode = false } = {}) {
  const list = []
  if (!element) return list

  const walker = doc.createTreeWalker(element, 4 /* NodeFilter.SHOW_TEXT */, {
    acceptNode: (node) => {
      const skip = node.parentElement?.closest(includeCode ? '.line-mark, .code-copy' : 'pre, .line-mark, .code-copy')

      return skip ? 2 /* FILTER_REJECT */ : 1 /* FILTER_ACCEPT */
    },
  })

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const match of node.data.matchAll(/\S+/g)) {
      const token = normalizeWord(match[0])
      if (!token) continue

      const range = doc.createRange()
      range.setStart(node, match.index)
      range.setEnd(node, match.index + match[0].length)
      list.push({ token, range })
    }
  }

  return list
}

function contentsRange(element, doc) {
  if (!element) return null

  const range = doc.createRange()
  range.selectNodeContents(element)

  return range
}

/** Jadval ustidagi eng yaqin sarlavha (izohdagi «bo'lim nomi» shu yerda) */
function headingBefore(element) {
  let node = element?.previousElementSibling

  for (let steps = 0; node && steps < 40; steps += 1, node = node.previousElementSibling) {
    if (/^H[1-4]$/.test(node.tagName)) return node
  }

  return null
}

/** Kod blokining birinchi bo'sh bo'lmagan qatori */
function firstCodeLine(figure, doc) {
  const code = figure?.querySelector('pre code') ?? figure?.querySelector('pre')
  if (!code) return null

  const walker = doc.createTreeWalker(code, 4)

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const start = node.data.search(/\S/)
    if (start < 0) continue

    const newline = node.data.indexOf('\n', start)
    const range = doc.createRange()
    range.setStart(node, start)
    range.setEnd(node, newline < 0 ? node.data.length : newline)

    return range
  }

  return null
}

/**
 * @param {Element|null} element  segmentga mos sahifa elementi
 * @param {Array<{w:number, word:string}>} items  shu segmentning so'zlari (words.json)
 * @param {Document} doc
 * @returns {Map<number, Range>}  so'z tartibi (w) → Range
 *
 * Qoida: highlight faqat oldinga, o'qish tartibida yuradi — hech qachon yuqoriga sakramaydi.
 * Mos joyi yo'q so'z xaritaga tushmaydi (pleyer oldingi belgini ushlab turadi).
 */
export function mapWords(element, items, doc) {
  if (element?.classList?.contains('table-wrap')) return mapTable(element, items, doc)

  const mapped = new Map()
  if (!element) return mapped

  const list = tokensIn(element, doc)
  const codeLine = element.matches?.('figure.code-block') ? firstCodeLine(element, doc) : null
  let cursor = 0

  for (const item of items) {
    const token = normalizeWord(item.word)
    if (!token) continue

    let range = null

    for (let index = cursor; index < Math.min(list.length, cursor + LOOKAHEAD); index += 1) {
      if (list[index].token === token) {
        range = list[index].range
        cursor = index + 1
        break
      }
    }

    // "Kod misoli." — kod blokining birinchi qatori (blok ichida, sakrash yo'q)
    if (!range && codeLine) range = codeLine
    if (range) mapped.set(item.w, range)
  }

  return mapped
}

/**
 * Jadval. Har so'zda `r` — segment matnidagi qator (0 — izoh, 1… — jadval qatorlari; align.py yozadi).
 * Pleyer qatorni taxmin qilmaydi:
 *   - izoh ("Quyidagi jadval …", eski formatda "Ustunlar: …") — jadvalning sarlavha qatori;
 *   - qator so'zlari — faqat o'sha qatorning kataklari ichida, o'qish tartibida;
 *   - ustun nomi ("Nega yomon?") — o'sha qatorning shu ustundagi katagi (hozir o'qiladigan katak).
 * `r` bo'lmagan eski fayllar uchun — oddiy ketma-ket moslash.
 */
function mapTable(element, items, doc) {
  const mapped = new Map()
  const rows = [...element.querySelectorAll('tbody tr')]
  const headerRow = contentsRange(element.querySelector('thead tr'), doc)
  const columns = [...element.querySelectorAll('thead th')].map((cell) => new Set(tokensIn(cell, doc).map((entry) => entry.token)))
  const cellOf = (range) => range.startContainer.parentElement?.closest('td, th')?.cellIndex ?? 0
  const rowTokens = rows.map((row) => tokensIn(row, doc).map((entry) => ({ ...entry, column: cellOf(entry.range) })))
  const cursors = rows.map(() => 0)
  // Har qatorda hozir o'qilayotgan ustun — ustun nomi faqat shundan keyingi ustunlardan izlanadi
  // ("Pages Router" va "App Router" — ikkalasida "Router"; orqaga sakramasin)
  const currentColumn = rows.map(() => 0)
  // Oxirgi belgi katak ichidagi so'z bo'lsa — keyingi ustun nomi faqat KEYINGI ustunlardan
  // (katak o'qib bo'lindi); ustun nomining davomi bo'lsa — o'sha ustunda qoladi
  const afterCell = rows.map(() => false)

  if (!items.some((item) => item.r !== undefined)) {
    // Eski words.json (qator raqamisiz)
    const list = rowTokens.flat()
    let cursor = 0

    for (const item of items) {
      const token = normalizeWord(item.word)
      if (!token) continue

      for (let index = cursor; index < Math.min(list.length, cursor + LOOKAHEAD); index += 1) {
        if (list[index].token === token) {
          mapped.set(item.w, list[index].range)
          cursor = index + 1
          break
        }
      }
    }

    return mapped
  }

  for (const item of items) {
    const token = normalizeWord(item.word)
    if (!token) continue

    if (!item.r) {
      if (headerRow) mapped.set(item.w, headerRow)
      continue
    }

    const index = item.r - 1
    const tokens = rowTokens[index]
    if (!tokens) continue

    let range = null

    for (let position = cursors[index]; position < Math.min(tokens.length, cursors[index] + LOOKAHEAD); position += 1) {
      if (tokens[position].token === token) {
        range = tokens[position].range
        cursors[index] = position + 1
        currentColumn[index] = tokens[position].column
        afterCell[index] = true
        break
      }
    }

    if (!range) {
      const from = currentColumn[index] + (afterCell[index] ? 1 : 0)
      const column = columns.findIndex((names, candidate) => candidate >= from && names.has(token))
      const cell = column >= 0 ? rows[index].cells?.[column] : null

      if (cell) {
        range = contentsRange(cell, doc)
        currentColumn[index] = column
        afterCell[index] = false
        // keyingi kataklar shu ustundan qidirilsin
        const first = tokens.findIndex((entry) => entry.column === column)
        if (first > cursors[index]) cursors[index] = first
      }
    }

    if (range) mapped.set(item.w, range)
  }

  return mapped
}

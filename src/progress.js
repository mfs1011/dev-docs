import { books } from '@/docs'
import { clearEntry, entryOf, putEntry, syncedMap } from '@/store'

/**
 * O'qish belgisi: har kitob uchun bitta "men shu yerda to'xtadim" nuqtasi.
 *
 * Nuqta markdown manbasidagi qator raqamiga bog'lanadi (`data-line`), sahifa
 * balandligiga emas — shuning uchun oyna kengligi, shrift yoki tema o'zgarsa
 * ham joyida qoladi. Brauzerda saqlanadi; akkaunt bilan kirilsa `sync.js` uni
 * boshqa qurilmalar bilan ham sinxronlaydi.
 */
export const marks = syncedMap('mark', 'docs-reading-marks-v1')

/** O'qilgan boblar: kalit — bob marshruti (`/vue/10-computed`) */
export const readPages = syncedMap('read', 'docs-read-pages-v1')

export function markFor(bookId) {
  return entryOf(marks, bookId)
}

export function setMark(bookId, mark) {
  putEntry(marks, bookId, mark)
}

export function clearMark(bookId) {
  clearEntry(marks, bookId)
}

/** Shu marshrutdagi belgining qatori (yo'q bo'lsa `null`) */
export function markedLine(bookId, route) {
  const mark = markFor(bookId)

  return mark && mark.route === route ? mark.line : null
}

/** Matndan qisqa ko'chirma — bosh sahifada "nima o'qigan edim" uchun */
export function excerptOf(element) {
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()

  return text.length > 90 ? `${text.slice(0, 89)}…` : text
}

export function isRead(route) {
  return Boolean(entryOf(readPages, route))
}

export function setRead(route, value) {
  if (value) putEntry(readPages, route)
  else clearEntry(readPages, route)
}

/** Kitob bo'yicha o'qilgan boblar: faqat raqamli boblar sanaladi (kirish sahifalari emas) */
export function bookProgress(book) {
  const chapters = book.sections.flatMap((section) => section.items).filter((item) => item.chapter)
  const read = chapters.filter((item) => isRead(item.route)).length
  const total = chapters.length

  return { read, total, percent: total ? Math.round((read / total) * 100) : 0 }
}

export function overallProgress() {
  return books.reduce(
    (sum, book) => {
      const { read, total } = bookProgress(book)

      return { read: sum.read + read, total: sum.total + total }
    },
    { read: 0, total: 0 },
  )
}

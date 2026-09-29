import { reactive, watch } from 'vue'

/**
 * O'qish belgisi: har kitob uchun bitta "men shu yerda to'xtadim" nuqtasi.
 *
 * Nuqta markdown manbasidagi qator raqamiga bog'lanadi (`data-line`), sahifa
 * balandligiga emas — shuning uchun oyna kengligi, shrift yoki tema o'zgarsa
 * ham joyida qoladi. Faqat shu brauzerda saqlanadi.
 */
const KEY = 'docs-reading-marks-v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : null

    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    // Shaxsiy oyna yoki o'chirilgan saqlash — belgisiz ishlayveramiz
    return {}
  }
}

export const marks = reactive(read())

watch(
  marks,
  (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      // Joy tugagan yoki taqiqlangan — jim o'tamiz
    }
  },
  { deep: true },
)

/** Boshqa tabda belgi qo'yilsa, bu tabda ham yangilanadi */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return

    const next = read()

    for (const key of Object.keys(marks)) delete marks[key]
    Object.assign(marks, next)
  })
}

export function markFor(bookId) {
  return bookId ? (marks[bookId] ?? null) : null
}

export function setMark(bookId, mark) {
  if (!bookId) return

  marks[bookId] = { ...mark, at: new Date().toISOString() }
}

export function clearMark(bookId) {
  delete marks[bookId]
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

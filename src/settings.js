import { watch } from 'vue'
import { entryOf, putEntry, syncedMap } from '@/store'

/**
 * Sinxronlanadigan sozlamalar: tema va kod varianti (Options/Composition, JS/TS).
 *
 * Eski kalitlar (`docs-theme`, `docs-variant-<guruh>`) joyida qoladi — `index.html`
 * temani Vue yuklanmasdan oldin o'qiydi. Bu xarita faqat "qachon, nima tanlangan"ni
 * saqlaydi; boshqa qurilmadan yangi qiymat kelsa, eski kalitga yozib, sahifaga qo'llaydi.
 */
export const settings = syncedMap('setting', 'docs-settings-v1')

const THEMES = ['light', 'dark']

function store(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Saqlash taqiqlangan — qiymat shu sessiya uchun qo'llanadi
  }
}

export function applyTheme(value) {
  document.documentElement.dataset.theme = value
  store('docs-theme', value)
  window.dispatchEvent(new CustomEvent('docs-theme-change', { detail: value }))
}

export function applyVariant(group, value) {
  document.documentElement.dataset[group] = value
  store(`docs-variant-${group}`, value)
  window.dispatchEvent(new CustomEvent('docs-variant-change', { detail: { group, value } }))
}

/** Foydalanuvchi o'zi tanlaganda chaqiriladi — qiymat sinxronlashga tushadi */
export function chooseTheme(value) {
  applyTheme(value)
  putEntry(settings, 'theme', { value })
}

export function chooseVariant(group, value) {
  applyVariant(group, value)
  putEntry(settings, `variant-${group}`, { value })
}

// Boshqa qurilma yoki tabdan kelgan qiymatni sahifaga qo'llaymiz (o'zgarmagan bo'lsa — hech narsa qilmaydi)
watch(
  () => Object.keys(settings).map((key) => [key, entryOf(settings, key)?.value]),
  (entries) => {
    for (const [key, value] of entries) {
      if (!value) continue

      if (key === 'theme') {
        if (THEMES.includes(value) && document.documentElement.dataset.theme !== value) applyTheme(value)
      } else if (key.startsWith('variant-')) {
        const group = key.slice('variant-'.length)

        if (document.documentElement.dataset[group] !== value) applyVariant(group, value)
      }
    }
  },
)

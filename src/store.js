import { reactive, watch } from 'vue'

/**
 * Brauzerda saqlanadigan va qurilmalar o'rtasida sinxronlanadigan xarita.
 *
 * Har yozuv: `{ ...ma'lumot, at }` yoki o'chirilgan bo'lsa `{ cleared: true, at }`.
 * O'chirilgan yozuv butunlay yo'qolmaydi — aks holda boshqa qurilmadagi eski
 * nusxasi sinxronlashda "qaytib kelardi". `at` bo'yicha eng yangisi yutadi.
 *
 * Yaratilgan har xarita `sync.js` uchun ro'yxatga olinadi: serverda kalit
 * `<nom>:<kalit>` bo'lib saqlanadi (masalan `mark:vue`, `read:/vue/10-computed`).
 */
export const syncedMaps = {}

function readStorage(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : null

    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    // Shaxsiy oyna yoki o'chirilgan saqlash — bo'sh xarita bilan ishlayveramiz
    return {}
  }
}

export function syncedMap(name, storageKey) {
  const map = reactive(readStorage(storageKey))

  watch(
    map,
    (value) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value))
      } catch {
        // Joy tugagan yoki taqiqlangan — jim o'tamiz
      }
    },
    { deep: true },
  )

  // Boshqa tabda o'zgarsa, bu tabda ham yangilanadi
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return

      const next = readStorage(storageKey)

      for (const key of Object.keys(map)) delete map[key]
      Object.assign(map, next)
    })
  }

  syncedMaps[name] = map

  return map
}

/** Faol (o'chirilmagan) yozuv yoki `null` */
export function entryOf(map, key) {
  const entry = key ? map[key] : null

  return entry && !entry.cleared ? entry : null
}

export function putEntry(map, key, data = {}) {
  if (!key) return

  map[key] = { ...data, at: new Date().toISOString() }
}

export function clearEntry(map, key) {
  if (!key) return

  map[key] = { cleared: true, at: new Date().toISOString() }
}

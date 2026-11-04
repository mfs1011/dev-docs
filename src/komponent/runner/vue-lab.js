// Komponent trenajorining Vue'si: dev build (debug ilgaklari ishlaydi). Foydalanuvchi kodi, Pinia va Vue Router
// shu modulni oladi (vite.config.js → labVue plugin), shuning uchun hammasi bitta Vue nusxasida ishlaydi.
// `computed` runner o'rnatgan o'ram orqali o'tadi — Pinia getter'lari ham kuzatiladi.
import * as Vue from 'vue/dist/vue.runtime.esm-browser.js'

export * from 'vue/dist/vue.runtime.esm-browser.js'

export const ilgak = { computed: null }
export const computed = (...a) => (ilgak.computed ?? Vue.computed)(...a)

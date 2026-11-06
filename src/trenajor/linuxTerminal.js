// Linux kitobidagi pastki terminal paneli holati. Panel (LinuxTerminal.vue) App darajasida turadi —
// boblar orasida o'tganda VM o'chmaydi. Bob sahifasidagi "▶" tugmasi buyruqlarni shu navbatga qo'yadi.
import { reactive } from 'vue'

/** Pastki terminal paneli chiqadigan kitoblar */
export const TERMINAL_KITOBLARI = ['linux']

export const terminal = reactive({
  /** panel bir marta ochilgan — VM yaratilgan (yoki yaratilmoqda) */
  faol: false,
  ochiq: false,
  /** trenajor sahifasi ochiq va terminal uchun joy (#linux-trenajor-terminal) tayyor */
  sahifada: false,
  /** prompt kelganda birma-bir yuboriladigan buyruqlar */
  navbat: [],
  /** tanlangan mashq ('' — erkin rejim) va undagi joriy qadam */
  mashqId: '',
  qadam: 0,
  /** mashq qayta boshlanganda oshadi — LinuxTerminal shuni kuzatadi */
  boshlash: 0,
  bajarilgan: oqiBajarilgan(),
})

const BAJARILGAN_KALITI = 'linux-mashq-bajarilgan'

function oqiBajarilgan() {
  try {
    return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function bajarildi(id) {
  terminal.bajarilgan = new Set([...terminal.bajarilgan, id])
  try { localStorage.setItem(BAJARILGAN_KALITI, JSON.stringify([...terminal.bajarilgan])) } catch { /* saqlanmasa ham ishlaydi */ }
}

/** Terminal egasi (LinuxTerminal) ro'yxatdan o'tkazadigan amallar — sahifadagi tugmalar uchun */
export const boshqaruv = {
  /** buyruqni qatorga yozadi, Enter'ni o'quvchi o'zi bosadi */
  yoz: () => {},
}

export function terminalniOch(buyruqlar = []) {
  terminal.faol = true
  terminal.ochiq = true
  terminal.navbat.push(...buyruqlar)
}

/**
 * Kod blokidagi `$ buyruq` qatorlari; `$` siz qatorlar — chiqish, ular yuborilmaydi.
 * Buyruqdan keyingi `> ...` qatorlar — qobiqning davom etish satri (here-document): buyruqqa qo'shiladi.
 */
export function buyruqlarniOl(matn) {
  const natija = []
  let davom = false
  for (const q of matn.split('\n')) {
    if (q.startsWith('$ ')) { natija.push(q.slice(2)); davom = true }
    else if (davom && q.startsWith('> ')) natija[natija.length - 1] += '\n' + q.slice(2)
    else davom = false
  }
  return natija
}

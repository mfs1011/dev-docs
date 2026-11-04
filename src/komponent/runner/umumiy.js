// Iframe ichidagi ishga tushiruvchilar (Vue va React) uchun umumiy qism: foydalanuvchi fayllarini
// kompilyatsiya qilib modul sifatida bajarish, konsol va xatolarni ushlash, ota sahifaga xabar yuborish
// va tekshiruv uchun avtomatik amallar (bosish, yozish).
import { transform } from 'sucrase'

export const yubor = (m) => parent.postMessage({ lab: 1, ...m }, '*')

// Qiymatning qisqa matn ko'rinishi (jurnal va daraxt uchun)
export function kor(v, d = 0) {
  if (v === undefined) return 'undefined'
  if (v === null) return 'null'
  if (typeof v === 'string') return JSON.stringify(v.length > 40 ? v.slice(0, 40) + '…' : v)
  if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonim')
  if (typeof v === 'symbol') return v.toString()
  if (typeof v !== 'object') return String(v)
  if (v.$$typeof) return '<' + (v.type?.displayName || v.type?.name || v.type || 'element') + '>'
  if (v instanceof Node) return '<' + v.nodeName.toLowerCase() + '>'
  if (d > 1) return Array.isArray(v) ? '[…]' : '{…}'
  try {
    if (Array.isArray(v)) {
      const s = v.slice(0, 5).map((x) => kor(x, d + 1)).join(', ')
      return `[${s}${v.length > 5 ? `, …(${v.length})` : ''}]`
    }
    const ks = Object.keys(v)
    const s = ks.slice(0, 4).map((k) => `${k}: ${kor(v[k], d + 1)}`).join(', ')
    return `{ ${s}${ks.length > 4 ? ', …' : ''} }`
  } catch {
    return '{…}'
  }
}

// console.* va ushlanmagan xatolar ota sahifaga boradi. `hodisa()` — foydalanuvchi bosishi/yozishi yangi
// to'plam ochadi (hech narsa o'zgarmasa ham «bosdingiz, lekin hech narsa bo'lmadi» deb ko'rsatish uchun)
export function konsolniUlash(hodisa = () => 0) {
  for (const level of ['log', 'info', 'warn', 'error']) {
    const asl = console[level].bind(console)
    console[level] = (...args) => {
      asl(...args)
      // Vue/React'ning o'z dev ogohlantirishlari (format qatorlari) — %c/%s bilan keladi
      const text = args.map((a) => (typeof a === 'string' ? a : kor(a))).join(' ').replace(/%[cs]/g, '')
      yubor({ t: 'log', level, text })
    }
  }
  addEventListener('error', (e) => yubor({ t: 'error', phase: 'runtime', message: e.error?.message ?? e.message }))
  addEventListener('unhandledrejection', (e) => yubor({ t: 'error', phase: 'runtime', message: String(e.reason?.message ?? e.reason) }))
  // foydalanuvchi bosishlari ham hisoblanadi (mashq qadamlari "tugmani bosing" ni shundan biladi)
  const el = (e) => e.target.closest?.('button, a, li, label, input, textarea, select')
  addEventListener('click', (e) => {
    const t = el(e)
    yubor({ t: 'dom', type: 'click', b: hodisa(), tag: t?.tagName.toLowerCase() ?? '', text: (t?.tagName === 'INPUT' ? '' : t?.textContent?.trim()) ?? '' })
  }, true)
  addEventListener('input', (e) => yubor({ t: 'dom', type: 'input', b: hodisa(), tag: e.target.tagName.toLowerCase() }), true)
  addEventListener('change', (e) => e.target.type === 'checkbox' && yubor({ t: 'dom', type: 'change', b: hodisa(), tag: 'checkbox' }), true)
}

// './Counter.vue', 'Counter.vue', './src/a.js' → fayl nomi
const nom = (spec) => spec.replace(/^\.\//, '')

// Fayllarni CommonJS ko'rinishida bajaradi: `import` → `require` (sucrase), tayyor kutubxonalar `tayyor` dan.
// `kompil(nom, matn)` — fayl turiga qarab ES modul JS qaytaradi.
export function modullar(fayllar, kompil, tayyor, sucraseOpts = []) {
  const kesh = {}
  const eksport = {}
  function req(from, spec) {
    if (spec in tayyor) return tayyor[spec]
    let name = nom(spec)
    if (!(name in fayllar)) {
      const topildi = Object.keys(fayllar).find((f) => f.replace(/\.(vue|jsx?|tsx?)$/, '') === name)
      if (!topildi) throw new Error(`"${spec}" topilmadi (${from || 'kirish'}). Mavjud fayllar: ${Object.keys(fayllar).join(', ')}`)
      name = topildi
    }
    if (kesh[name]) return kesh[name].exports
    const module = { exports: {} }
    kesh[name] = module
    let code
    try {
      const js = kompil(name, fayllar[name])
      code = transform(js, { transforms: ['imports', ...sucraseOpts], filePath: name, jsxRuntime: 'automatic', production: true }).code
    } catch (e) {
      const err = new Error(e.message)
      err.file = name
      err.phase = 'compile'
      throw err
    }
    new Function('require', 'module', 'exports', `${code}\n//# sourceURL=lab:///${name}`)((s) => req(name, s), module, module.exports)
    eksport[name] = module.exports
    return module.exports
  }
  return { yukla: (entry) => req('', entry), eksport }
}

const kut = (ms) => new Promise((r) => setTimeout(r, ms))
const qiymatSetter = (el) => Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set

// Tekshiruv amallari: [{ click: 'selektor', marta: 3 }, { yoz: 'selektor', matn: 'abc' }, { kut: 200 }]
// Har harakatdan keyin pauza — o'quvchi daraxtda nima yonganini ko'rib ulgursin.
export async function amallar(list, pauza = 260) {
  for (const a of list) {
    if (a.kut) await kut(a.kut)
    if (a.click) {
      for (let i = 0; i < (a.marta ?? 1); i++) {
        const el = a.matn
          ? [...document.querySelectorAll(a.click)].find((x) => x.textContent.trim() === a.matn)
          : document.querySelectorAll(a.click)[a.n ?? 0]
        if (!el) throw new Error(`Element topilmadi: ${a.click}${a.matn ? ` («${a.matn}»)` : ''}`)
        el.click()
        await kut(pauza)
      }
    }
    if (a.yoz) {
      const el = document.querySelector(a.yoz)
      if (!el) throw new Error(`Element topilmadi: ${a.yoz}`)
      el.focus()
      for (const ch of a.matn) {
        qiymatSetter(el).call(el, el.value + ch)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        await kut(pauza / 2)
      }
    }
  }
  await kut(pauza)
}

// Ota sahifa bilan aloqa: `run` (fayllar) va `amal` (tekshiruv harakatlari)
export function tingla(ishga, boshqa = {}) {
  addEventListener('message', async (e) => {
    const m = e.data
    if (!m?.lab) return
    boshqa[m.t]?.(m)
    if (m.t === 'run') {
      try {
        await ishga(m.fayllar, m.kirish)
      } catch (err) {
        yubor({ t: 'error', phase: err.phase ?? 'runtime', file: err.file, message: err.message })
      }
    }
    if (m.t === 'amal') {
      try {
        await amallar(m.list)
        yubor({ t: 'amalTugadi', id: m.id })
      } catch (err) {
        yubor({ t: 'amalTugadi', id: m.id, xato: err.message })
      }
    }
  })
  yubor({ t: 'ready' })
}

// Bir "hodisa" (bosish, yozish) davomidagi barcha o'zgarish va render'lar bitta to'plam:
// birinchi voqeadan keyingi macrotask'da yopiladi (Vue/React yangilanishi undan oldin tugaydi).
export function toplam(yopilganda, kechikish = 0) {
  let b = 0, ochiq = false
  return () => {
    if (!ochiq) {
      ochiq = true
      b++
      // yopilish paytidagi voqealar ham shu to'plamga tushadi
      setTimeout(() => {
        yopilganda(b)
        ochiq = false
      }, kechikish)
    }
    return b
  }
}

// ── DOM o'zgarishlari: natija oynasining o'zida belgilanadi va ota sahifaga hikoya uchun yuboriladi ──
const qisqaMatn = (s) => {
  const t = (s ?? '').replace(/\s+/g, ' ').trim()
  return t.length > 36 ? t.slice(0, 35) + '…' : t
}
const elNomi = (el) => `<${el.tagName.toLowerCase()}>`

export function domKuzatuvchi(root) {
  let yozuvlar = []
  const mo = new MutationObserver((r) => yozuvlar.push(...r))
  mo.observe(root, { subtree: true, childList: true, characterData: true, characterDataOldValue: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style', 'disabled', 'value'] })
  const qatlam = document.createElement('div')
  qatlam.className = 'lab-qatlam'
  document.body.append(qatlam)

  function belgila(el, matn, tur) {
    if (!el?.getBoundingClientRect || !el.isConnected) return
    const r = el.getBoundingClientRect()
    if (!r.width && !r.height) return
    const d = document.createElement('div')
    d.className = `lab-belgi ${tur}`
    Object.assign(d.style, { left: `${r.left + scrollX - 3}px`, top: `${r.top + scrollY - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` })
    if (matn) {
      const t = document.createElement('span')
      t.textContent = matn
      d.append(t)
    }
    qatlam.append(d)
    setTimeout(() => d.remove(), 2200)
  }

  // to'plam yopilganda chaqiriladi: yig'ilgan o'zgarishlarni guruhlab, belgilab, yuboradi
  return (b) => {
    yozuvlar.push(...mo.takeRecords())
    const r = yozuvlar
    yozuvlar = []
    if (b === 1 || !r.length) return yubor({ t: 'ekran', b, list: [] })
    const matnlar = new Map() // element → oldingi matn
    const list = []
    for (const m of r) {
      if (m.type === 'characterData') {
        const el = m.target.parentElement
        if (el && !matnlar.has(el)) matnlar.set(el, el.textContent.replace(m.target.data, m.oldValue ?? ''))
      } else if (m.type === 'attributes') {
        const yangi = m.target.getAttribute(m.attributeName)
        if ((m.oldValue ?? '') === (yangi ?? '')) continue
        list.push({ tur: 'attr', el: elNomi(m.target), nom: m.attributeName, old: m.oldValue ?? '', new: yangi ?? '' })
        belgila(m.target, `${m.attributeName}: ${qisqaMatn(yangi) || '—'}`, 'attr')
      } else {
        for (const n of m.addedNodes) {
          if (n.nodeType === 3) {
            const el = m.target
            if (!matnlar.has(el)) matnlar.set(el, null)
          } else if (n.nodeType === 1) {
            list.push({ tur: 'qoshildi', el: elNomi(n), matn: qisqaMatn(n.textContent) })
            belgila(n, '+ yangi', 'qoshildi')
          }
        }
        for (const n of m.removedNodes) if (n.nodeType === 1) list.push({ tur: 'olindi', el: elNomi(n), matn: qisqaMatn(n.textContent) })
      }
    }
    for (const [el, old] of matnlar) {
      if (!el.isConnected) continue
      const yangi = qisqaMatn(el.textContent)
      const eski = old === null ? null : qisqaMatn(old)
      if (eski === yangi) continue
      list.push({ tur: 'matn', el: elNomi(el), old: eski, new: yangi })
      belgila(el, eski != null ? `«${eski}» → «${yangi}»` : `«${yangi}»`, 'matn')
    }
    yubor({ t: 'ekran', b, list: list.slice(0, 12) })
  }
}

// Kitob qisqartmalari uchun yagona tooltip (src/markdown.js `<abbr class="qisqartma" data-tip>` yaratadi).
// CSS ::after o'rniga position: fixed element: ekran chegarasini hisobga olib joylashtiriladi,
// shuning uchun kichik ekranda ham chetdan chiqib ketmaydi; pastda joy bo'lmasa — tepaga chiqadi.
const GAP = 6
const EDGE = 8

let tip = null
let current = null

function ensureTip() {
  if (tip) return tip
  tip = document.createElement('div')
  tip.className = 'qisqartma-tip'
  tip.setAttribute('role', 'tooltip')
  tip.hidden = true
  document.body.appendChild(tip)
  return tip
}

function show(el) {
  const t = ensureTip()
  current = el
  t.textContent = el.dataset.tip
  t.hidden = false
  t.style.left = '0px'
  t.style.top = '0px'
  const r = el.getBoundingClientRect()
  const w = t.offsetWidth
  const h = t.offsetHeight
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, EDGE), Math.max(vw - w - EDGE, EDGE))
  const below = r.bottom + GAP
  const top = below + h <= vh - EDGE ? below : Math.max(r.top - GAP - h, EDGE)
  t.style.left = `${left}px`
  t.style.top = `${top}px`
}

function hide() {
  current = null
  if (tip) tip.hidden = true
}

export function initQisqartma() {
  const target = (e) => e.target instanceof Element && e.target.closest('.qisqartma')
  document.addEventListener('mouseover', (e) => { const el = target(e); if (el) show(el) })
  document.addEventListener('mouseout', (e) => { const el = target(e); if (el && el !== document.activeElement) hide() })
  document.addEventListener('focusin', (e) => { const el = target(e); if (el) show(el) })
  document.addEventListener('focusout', (e) => { if (target(e)) hide() })
  window.addEventListener('scroll', () => { if (current) hide() }, { passive: true, capture: true })
  window.addEventListener('resize', () => { if (current) hide() })
}

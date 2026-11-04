// Bino strelkalari uchun: fayllardagi import'lar va ular qaysi xonaga (qatlam/slice) olib borishi.
// Qoidani Steiger tekshiradi — bu yerda faqat chizish uchun yo'nalish va qator raqami.
const QATLAMLAR = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
const XONASIZ = new Set(['app', 'shared'])

// 'src/features/like/ui/Like.tsx' → { qatlam: 'features', xona: 'features/like' }; shared/app — xona o'rnida segment
export function joyi(yol) {
  const q = yol.replace(/^src\//, '').split('/')
  if (!QATLAMLAR.includes(q[0])) return null
  if (q.length === 1) return null
  const xonaNom = XONASIZ.has(q[0]) ? (q.length > 2 ? q[1] : '(ildiz)') : q[1]
  return { qatlam: q[0], xona: `${q[0]}/${xonaNom}` }
}

function normal(p) {
  const out = []
  for (const s of p.split('/')) {
    if (s === '..') out.pop()
    else if (s && s !== '.') out.push(s)
  }
  return out.join('/')
}

export function importlar(fayllar) {
  const out = []
  for (const [yol, matn] of Object.entries(fayllar)) {
    const man = joyi(yol)
    if (!man) continue
    const qatorlar = matn.split('\n')
    qatorlar.forEach((q, i) => {
      const m = /^\s*(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/.exec(q)
      const spec = m?.[1] ?? m?.[2]
      if (!spec) return
      let manzil
      if (spec.startsWith('@/')) manzil = 'src/' + spec.slice(2)
      else if (spec.startsWith('.')) manzil = normal(yol.split('/').slice(0, -1).join('/') + '/' + spec)
      else return
      const tgt = joyi(manzil + '/x')
      if (!tgt || tgt.xona === man.xona) return
      out.push({ yol, qator: i + 1, spec, dan: man.xona, ga: tgt.xona })
    })
  }
  return out
}

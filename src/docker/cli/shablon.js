// Docker CLI `--format` uchun Go text/template'ning kerakli qismi va text/tabwriter.
// Qo'llab-quvvatlanadi: {{.A.B}}, {{json .X}}, {{range .X}}…{{end}}, {{range $k, $v := .X}}, {{if .X}}…{{else}}…{{end}},
// {{len .X}}, {{index .X "k"}}, {{upper .X}}, {{lower .X}}, {{join .X ","}}, {{println}}, {{printf "%s" .X}},
// {{.X | json}}, `table` prefiksi (sarlavha bilan jadval).
// Docker formatlash qoidalari: docs.docker.com/engine/cli/formatting/

// Go'ning json.Marshal ko'rinishi: <, >, & — \u003c, \u003e, \u0026
export function goJson(v) {
  return JSON.stringify(v ?? null).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}
// docker inspect: 4 probelli JSON, HTML belgilari escape qilinmaydi (SetEscapeHTML(false) — yozuv 10: "<docker-maint@…>")
export function goJsonIndent(v) {
  return JSON.stringify(v, null, 4)
}

// Go fmt %v ko'rinishi: map[80/tcp:[{ 8080}]], [a b], true, <nil>
export function goQiymat(v) {
  if (v == null) return '<no value>'
  if (Array.isArray(v)) return '[' + v.map(goIchki).join(' ') + ']'
  if (typeof v === 'object') {
    if (v.__struct) return '{' + Object.entries(v).filter(([k]) => k !== '__struct').map(([, x]) => goIchki(x)).join(' ') + '}'
    return 'map[' + Object.keys(v).sort().map((k) => `${k}:${goIchki(v[k])}`).join(' ') + ']'
  }
  return String(v)
}
const goIchki = (v) => (v == null ? '<nil>' : goQiymat(v))

class ShablonXato extends Error {}

function tokenla(s) {
  const t = []
  let i = 0
  while (i < s.length) {
    const j = s.indexOf('{{', i)
    if (j < 0) { t.push({ matn: s.slice(i) }); break }
    if (j > i) t.push({ matn: s.slice(i, j) })
    const k = s.indexOf('}}', j)
    if (k < 0) throw new ShablonXato(`template: :1: unclosed action`)
    let ichi = s.slice(j + 2, k)
    let chapKes = false, onKes = false
    if (ichi.startsWith('- ')) { chapKes = true; ichi = ichi.slice(2) }
    if (ichi.endsWith(' -')) { onKes = true; ichi = ichi.slice(0, -2) }
    t.push({ amal: ichi.trim(), chapKes, onKes })
    i = k + 2
  }
  // {{- va -}} bo'shliqlarni kesadi
  for (let n = 0; n < t.length; n++) {
    if (t[n].chapKes && t[n - 1]?.matn != null) t[n - 1].matn = t[n - 1].matn.replace(/\s+$/, '')
    if (t[n].onKes && t[n + 1]?.matn != null) t[n + 1].matn = t[n + 1].matn.replace(/^\s+/, '')
  }
  return t
}

function daraxt(tokenlar) {
  let i = 0
  function blok(tugash) {
    const r = []
    while (i < tokenlar.length) {
      const t = tokenlar[i++]
      if (t.matn != null) { r.push({ t: 'matn', v: t.matn }); continue }
      const a = t.amal
      if (a === 'end' || a === 'else' || a.startsWith('else ')) {
        if (!tugash) throw new ShablonXato(`template: :1: unexpected {{${a}}}`)
        return { r, oxir: a }
      }
      if (a.startsWith('range ')) {
        const ifoda = a.slice(6).trim()
        const m = /^\$(\w*)\s*(?:,\s*\$(\w+))?\s*:=\s*(.+)$/.exec(ifoda)
        const ich = blok(true)
        let boshqa = null
        if (ich.oxir === 'else') boshqa = blok(true).r
        r.push({ t: 'range', ifoda: m ? m[3] : ifoda, k: m && m[2] ? m[1] : null, v: m ? (m[2] ?? m[1]) : null, ich: ich.r, boshqa })
        continue
      }
      if (a.startsWith('if ') || a.startsWith('with ')) {
        const tur = a.startsWith('if ') ? 'if' : 'with'
        const ifoda = a.slice(tur.length + 1).trim()
        const ich = blok(true)
        let boshqa = null
        if (ich.oxir === 'else') boshqa = blok(true).r
        else if (ich.oxir.startsWith('else if ')) { i--; tokenlar[i] = { amal: ich.oxir.slice(5) }; boshqa = blok(true).r; boshqa = [boshqa].flat() }
        r.push({ t: tur, ifoda, ich: ich.r, boshqa })
        continue
      }
      r.push({ t: 'ifoda', v: a })
    }
    if (tugash) throw new ShablonXato('template: :1: unexpected EOF')
    return { r }
  }
  return blok(false).r
}

// ifoda so'zlari: .A.B, $x, "matn", raqam, funksiya nomi, ( ... ), |
function sozlar(s) {
  const r = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') { i++; continue }
    if (c === '"') {
      let j = i + 1, v = ''
      while (j < s.length && s[j] !== '"') { if (s[j] === '\\') { j++; v += s[j] === 'n' ? '\n' : s[j] === 't' ? '\t' : s[j] } else v += s[j]; j++ }
      r.push({ t: 'str', v }); i = j + 1; continue
    }
    if (c === '`') { const j = s.indexOf('`', i + 1); r.push({ t: 'str', v: s.slice(i + 1, j) }); i = j + 1; continue }
    if (c === '|') { r.push({ t: '|' }); i++; continue }
    if (c === '(') {
      let d = 1, j = i + 1
      for (; j < s.length && d; j++) { if (s[j] === '(') d++; else if (s[j] === ')') d-- }
      r.push({ t: 'qavs', v: s.slice(i + 1, j - 1) }); i = j; continue
    }
    let j = i
    while (j < s.length && s[j] !== ' ' && s[j] !== '|' && s[j] !== ')') j++
    r.push({ t: 'soz', v: s.slice(i, j) }); i = j
  }
  return r
}

function maydon(obj, yol, ifodaMatni) {
  let v = obj
  for (const q of yol.split('.').filter(Boolean)) {
    if (v == null) return undefined
    if (typeof v === 'object' && q in v) { v = typeof v[q] === 'function' ? v[q]() : v[q]; continue }
    if (typeof v === 'object' && !Array.isArray(v) && !v.__struct && v.__map) return undefined
    if (typeof v === 'object' && v.__struct !== true && !Array.isArray(v)) {
      if (v.__qat) throw new ShablonXato(`template: :1:${ifodaMatni.length}: executing "" at <${ifodaMatni}>: can't evaluate field ${q} in type ${v.__qat}`)
      return undefined
    }
    return undefined
  }
  return v
}

const FUNKSIYALAR = {
  json: (v) => goJson(v),
  upper: (v) => String(v ?? '').toUpperCase(),
  lower: (v) => String(v ?? '').toLowerCase(),
  title: (v) => String(v ?? '').replace(/\b\w/g, (c) => c.toUpperCase()),
  len: (v) => (v == null ? 0 : Array.isArray(v) ? v.length : typeof v === 'object' ? Object.keys(v).filter((k) => !k.startsWith('__')).length : String(v).length),
  index: (v, ...k) => k.reduce((a, x) => (a == null ? undefined : a[x]), v),
  join: (v, sep) => (Array.isArray(v) ? v.join(sep) : ''),
  split: (v, sep) => String(v).split(sep),
  println: (...a) => a.map(goQiymat).join(' ') + '\n',
  print: (...a) => a.map(goQiymat).join(''),
  printf: (f, ...a) => { let i = 0; return f.replace(/%[sdvq]/g, (m) => (m === '%q' ? JSON.stringify(String(a[i++])) : goQiymat(a[i++]))) },
  pad: (v, l, r) => ' '.repeat(l) + v + ' '.repeat(r),
  truncate: (v, n) => String(v).slice(0, n),
  eq: (a, ...b) => b.some((x) => a === x),
  ne: (a, b) => a !== b,
  not: (v) => !rost(v),
  and: (...a) => a.every(rost),
  or: (...a) => a.find(rost) ?? a[a.length - 1],
}
const rost = (v) => !(v == null || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length))

function hisobla(ifoda, nuqta, ozgar) {
  const qismlar = []
  let joriy = []
  for (const s of sozlar(ifoda)) { if (s.t === '|') { qismlar.push(joriy); joriy = [] } else joriy.push(s) }
  qismlar.push(joriy)
  let natija
  qismlar.forEach((q, n) => {
    const qiymat = (s) => {
      if (s.t === 'str') return s.v
      if (s.t === 'qavs') return hisobla(s.v, nuqta, ozgar)
      if (s.v === '.') return nuqta
      if (s.v.startsWith('.')) return maydon(nuqta, s.v, ifoda)
      if (s.v.startsWith('$')) {
        const [nom, ...yol] = s.v.slice(1).split('.')
        const v = nom === '' ? ozgar.$ : ozgar[nom]
        return yol.length ? maydon(v, '.' + yol.join('.'), ifoda) : v
      }
      if (/^-?\d+$/.test(s.v)) return Number(s.v)
      if (s.v === 'true' || s.v === 'false') return s.v === 'true'
      throw new ShablonXato(`template: :1: function "${s.v}" not defined`)
    }
    const [bosh, ...arg] = q
    if (bosh && bosh.t === 'soz' && FUNKSIYALAR[bosh.v]) {
      const a = arg.map(qiymat)
      if (n > 0) a.push(natija)
      natija = FUNKSIYALAR[bosh.v](...a)
    } else {
      natija = qiymat(bosh)
    }
  })
  return natija
}

function bajar(tugunlar, nuqta, ozgar) {
  let s = ''
  for (const t of tugunlar) {
    if (t.t === 'matn') s += t.v
    else if (t.t === 'ifoda') {
      const v = hisobla(t.v, nuqta, ozgar)
      s += typeof v === 'string' ? v : goQiymat(v)
    } else if (t.t === 'range') {
      const v = hisobla(t.ifoda, nuqta, ozgar)
      const elementlar = v == null ? [] : Array.isArray(v) ? v.map((x, i) => [i, x]) : typeof v === 'object' ? Object.keys(v).filter((k) => !k.startsWith('__')).sort().map((k) => [k, v[k]]) : []
      if (!elementlar.length && t.boshqa) s += bajar(t.boshqa, nuqta, ozgar)
      for (const [k, x] of elementlar) {
        const o = { ...ozgar }
        if (t.k) o[t.k] = k
        if (t.v) o[t.v] = x
        s += bajar(t.ich, x, o)
      }
    } else if (t.t === 'if' || t.t === 'with') {
      const v = hisobla(t.ifoda, nuqta, ozgar)
      if (rost(v)) s += bajar(t.ich, t.t === 'with' ? v : nuqta, ozgar)
      else if (t.boshqa) s += bajar(t.boshqa, nuqta, ozgar)
    }
  }
  return s
}

export function shablon(manba) {
  const tugunlar = daraxt(tokenla(manba))
  return (nuqta) => bajar(tugunlar, nuqta, { $: nuqta })
}
export { ShablonXato }

// Go text/tabwriter: docker'da NewWriter(out, 10, 1, 3, ' ', 0) — minwidth 10, padding 3.
// Har qator '\t' bilan katakchalarga bo'linadi; oxirgi katakcha (tab bilan tugamagan) tekislanmaydi.
// Ketma-ket qatorlarda bir xil ustun soni bo'lgan bloklar birga tekislanadi (Go'dagi kabi).
export function tabwriter(matn, { min = 10, pad = 3 } = {}) {
  const qatorlar = matn.split('\n')
  const oxirgiBosh = qatorlar[qatorlar.length - 1] === ''
  if (oxirgiBosh) qatorlar.pop()
  const kataklar = qatorlar.map((q) => q.split('\t'))
  // ustun kengliklari: Go har ustun uchun "bloklar" — shu ustun mavjud bo'lgan ketma-ket qatorlar
  const kenglik = kataklar.map((k) => new Array(k.length - 1).fill(0))
  const uzunlik = (s) => [...s.replace(/\x1b\[[0-9;]*m/g, '')].length
  const ustunlar = Math.max(0, ...kataklar.map((k) => k.length - 1))
  for (let u = 0; u < ustunlar; u++) {
    let i = 0
    while (i < kataklar.length) {
      if (kataklar[i].length - 1 <= u) { i++; continue }
      let j = i, w = 0
      while (j < kataklar.length && kataklar[j].length - 1 > u) { w = Math.max(w, uzunlik(kataklar[j][u]) + pad); j++ }
      w = Math.max(w, min)
      for (let x = i; x < j; x++) kenglik[x][u] = w
      i = j
    }
  }
  const natija = kataklar.map((k, i) => k.map((c, u) => (u < k.length - 1 ? c + ' '.repeat(Math.max(0, kenglik[i][u] - uzunlik(c))) : c)).join(''))
  return natija.join('\n') + (oxirgiBosh ? '\n' : '')
}

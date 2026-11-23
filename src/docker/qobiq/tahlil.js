// Qobiq (shell) qatorini tahlil qilish: bash va busybox ash uchun umumiy, trenajorga kerakli qismi.
// So'zlar: '...', "...", \x, $VAR, ${VAR}, $?, $$, $(...), `...`. Operatorlar: | && || ; &.
// Yo'naltirishlar: > >> < 2> 2>> &> 2>&1 >&2 <<EOF (heredoc). Prefiks: `time`, `A=1 buyruq`.
//
// Natija (AST): { royxat: [{ op: ';'|'&&'|'||'|'&', quvur: { time, buyruqlar: [{ sozlar, yonalish, tayinlash }] } }] }
// So'z — qismlar massivi: { t: 'lit'|'var'|'cmd', v, q } (q — qo'shtirnoq ichida: bo'linmaydi va glob qilinmaydi).

export class TahlilXato extends Error {
  constructor(xabar, chala = false) { super(xabar); this.chala = chala }
}

const OPERATORLAR = ['&&', '||', ';;', '|&', '|', ';', '&']
const MAXSUS = new Set([' ', '\t', '\n', '|', '&', ';', '<', '>', '(', ')'])

// $(...) ichidagi qavslarni sanab, yopuvchi `)` ni topish
function qavsOxiri(s, i) {
  let d = 1, q = null
  for (; i < s.length; i++) {
    const c = s[i]
    if (q) { if (c === q) q = null; else if (c === '\\' && q === '"') i++; continue }
    if (c === "'" || c === '"') q = c
    else if (c === '\\') i++
    else if (c === '(') d++
    else if (c === ')' && --d === 0) return i
  }
  return -1
}

function dollar(s, i, q, qismlar) {
  // s[i] === '$'
  const c = s[i + 1]
  if (c === '(' && s[i + 2] === '(') {
    const j = s.indexOf('))', i + 3)
    if (j < 0) throw new TahlilXato('$(( yopilmagan', true)
    qismlar.push({ t: 'arith', v: s.slice(i + 3, j), q })
    return j + 2
  }
  if (c === '(') {
    const j = qavsOxiri(s, i + 2)
    if (j < 0) throw new TahlilXato('$( yopilmagan', true)
    qismlar.push({ t: 'cmd', v: s.slice(i + 2, j), q })
    return j + 1
  }
  if (c === '{') {
    const j = s.indexOf('}', i + 2)
    if (j < 0) throw new TahlilXato('${ yopilmagan', true)
    qismlar.push({ t: 'var', v: s.slice(i + 2, j), q })
    return j + 1
  }
  if (c && /[?$#!0-9@*]/.test(c)) { qismlar.push({ t: 'var', v: c, q }); return i + 2 }
  const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i + 1))
  if (m) { qismlar.push({ t: 'var', v: m[0], q }); return i + 1 + m[0].length }
  qismlar.push({ t: 'lit', v: '$', q })
  return i + 1
}

// Tokenlarga bo'lish: { t: 'soz', qismlar, xom } | { t: 'op', v } | { t: 'yon', v, fd } | { t: 'qator' }
export function tokenla(s) {
  const tokenlar = []
  let i = 0
  const push = (q, v) => { const o = q[q.length - 1]; if (o && o.t === 'lit' && o.q === false && !o.glob && v.q === false && !v.glob && v.t === 'lit') o.v += v.v; else q.push(v) }
  while (i < s.length) {
    const c = s[i]
    if (c === ' ' || c === '\t') { i++; continue }
    if (c === '\n') { tokenlar.push({ t: 'qator' }); i++; continue }
    if (c === '#' ) { while (i < s.length && s[i] !== '\n') i++; continue }
    // yo'naltirishlar: [n]> [n]>> [n]< &> n>&m <<
    const yon = /^(\d?)(>>|>&|>|<<-?|<&|<|&>>|&>)(\d|-)?/.exec(s.slice(i))
    if (yon && (yon[1] !== '' || true)) {
      const [butun, fd, op, maqsad] = yon
      if (op === '>&' || op === '<&') {
        if (maqsad == null) { tokenlar.push({ t: 'yon', v: op === '>&' ? '&>' : '<', fd: fd || null }); i += fd.length + 2; continue }
        tokenlar.push({ t: 'yon', v: op, fd: fd || (op === '>&' ? '1' : '0'), maqsad }); i += butun.length; continue
      }
      tokenlar.push({ t: 'yon', v: op, fd: fd || null }); i += fd.length + op.length; continue
    }
    const op = OPERATORLAR.find((o) => s.startsWith(o, i))
    if (op) { tokenlar.push({ t: 'op', v: op }); i += op.length; continue }
    if (c === '(' || c === ')') { tokenlar.push({ t: 'op', v: c }); i++; continue }
    // so'z
    const qismlar = []
    const bosh = i
    while (i < s.length && !MAXSUS.has(s[i])) {
      const ch = s[i]
      if (ch === "'") {
        const j = s.indexOf("'", i + 1)
        if (j < 0) throw new TahlilXato("' yopilmagan", true)
        qismlar.push({ t: 'lit', v: s.slice(i + 1, j), q: true }); i = j + 1
      } else if (ch === '"') {
        i++
        let lit = ''
        const flush = () => { if (lit) { qismlar.push({ t: 'lit', v: lit, q: true }); lit = '' } }
        let yopildi = false
        while (i < s.length) {
          const d = s[i]
          if (d === '"') { yopildi = true; i++; break }
          if (d === '\\' && i + 1 < s.length && '"\\$`\n'.includes(s[i + 1])) { if (s[i + 1] !== '\n') lit += s[i + 1]; i += 2; continue }
          if (d === '$') { flush(); i = dollar(s, i, true, qismlar); continue }
          if (d === '`') {
            const j = s.indexOf('`', i + 1)
            if (j < 0) throw new TahlilXato('` yopilmagan', true)
            flush(); qismlar.push({ t: 'cmd', v: s.slice(i + 1, j), q: true }); i = j + 1; continue
          }
          lit += d; i++
        }
        if (!yopildi) throw new TahlilXato('" yopilmagan', true)
        flush()
        if (!qismlar.length || qismlar[qismlar.length - 1].t !== 'lit') qismlar.push({ t: 'lit', v: '', q: true })
      } else if (ch === '\\') {
        if (i + 1 >= s.length) throw new TahlilXato('\\ bilan tugadi', true)
        if (s[i + 1] !== '\n') push(qismlar, { t: 'lit', v: s[i + 1], q: true })
        i += 2
      } else if (ch === '$') {
        i = dollar(s, i, false, qismlar)
      } else if (ch === '`') {
        const j = s.indexOf('`', i + 1)
        if (j < 0) throw new TahlilXato('` yopilmagan', true)
        qismlar.push({ t: 'cmd', v: s.slice(i + 1, j), q: false }); i = j + 1
      } else if (ch === '*' || ch === '?' || ch === '[') {
        qismlar.push({ t: 'lit', v: ch, q: false, glob: true }); i++
      } else {
        push(qismlar, { t: 'lit', v: ch, q: false }); i++
      }
    }
    tokenlar.push({ t: 'soz', qismlar, xom: s.slice(bosh, i) })
  }
  return tokenlar
}

const TAYINLASH = /^[A-Za-z_][A-Za-z0-9_]*=/

// Heredoc mazmunini qatorlardan ajratish: tahlildan oldin manba bo'yicha
export function tahlil(manba) {
  // heredoc'larni oldindan ajratamiz: `<<EOF` dan keyingi qatorlar mazmun bo'ladi
  const heredoclar = []
  const qatorlar = manba.split('\n')
  const asosiy = []
  for (let n = 0; n < qatorlar.length; n++) {
    const q = qatorlar[n]
    asosiy.push(q)
    const re = /<<(-?)\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2/g
    let m
    while ((m = re.exec(q))) {
      const tugash = m[3], tirnoq = m[2] !== '', tab = m[1] === '-'
      const mazmun = []
      let topildi = false
      while (++n < qatorlar.length) {
        const x = tab ? qatorlar[n].replace(/^\t+/, '') : qatorlar[n]
        if (x === tugash) { topildi = true; break }
        mazmun.push(x)
      }
      if (!topildi) throw new TahlilXato('heredoc tugamadi', true)
      heredoclar.push({ mazmun: mazmun.join('\n') + (mazmun.length ? '\n' : ''), tirnoq })
    }
  }
  const tokenlar = tokenla(asosiy.join('\n'))
  let hd = 0, i = 0
  const RES = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'while', 'until', '{', '}', '!'])
  const soz = (t) => (t && t.t === 'soz' && t.qismlar.length === 1 && t.qismlar[0].t === 'lit' && !t.qismlar[0].q ? t.qismlar[0].v : null)
  const otkaz = () => { while (tokenlar[i] && (tokenlar[i].t === 'qator' || (tokenlar[i].t === 'op' && tokenlar[i].v === ';'))) i++ }
  const kutilgan = (w) => {
    otkaz()
    if (soz(tokenlar[i]) !== w) throw new TahlilXato(tokenlar[i] ? `syntax error near unexpected token \`${soz(tokenlar[i]) ?? tokenlar[i].v ?? 'newline'}'` : `${w} kutilmoqda`, !tokenlar[i])
    i++
  }
  // ro'yxat: quvurlar ; && || & bilan, `toxta` so'zlaridan birigacha
  function royxatT(toxta) {
    const royxat = []
    for (;;) {
      otkaz()
      const t = tokenlar[i]
      if (!t) { if (toxta.size) throw new TahlilXato('kutilmagan oxir', true); break }
      if (toxta.has(soz(t))) break
      if (t.t === 'op' && t.v === ')' && toxta.has(')')) break
      const quvur = quvurT()
      const op = tokenlar[i]
      if (op && op.t === 'op' && ['&&', '||', ';', '&'].includes(op.v)) {
        i++
        if ((op.v === '&&' || op.v === '||') && (!tokenlar[i] || (tokenlar[i].t === 'qator' && !tokenlar[i + 1]))) throw new TahlilXato('davomi yo\'q', true)
        while (tokenlar[i]?.t === 'qator' && (op.v === '&&' || op.v === '||')) i++
        royxat.push({ op: op.v, quvur })
      } else royxat.push({ op: ';', quvur })
    }
    return royxat
  }
  function quvurT() {
    const quvur = { time: false, inkor: false, buyruqlar: [] }
    if (soz(tokenlar[i]) === 'time') { quvur.time = true; i++ }
    if (soz(tokenlar[i]) === '!') { quvur.inkor = true; i++ }
    for (;;) {
      quvur.buyruqlar.push(buyruqT())
      const t = tokenlar[i]
      if (t && t.t === 'op' && (t.v === '|' || t.v === '|&')) {
        i++
        if (t.v === '|&') quvur.buyruqlar[quvur.buyruqlar.length - 1].yonalish.push({ v: '>&', fd: '2', maqsad: '1' })
        while (tokenlar[i]?.t === 'qator') i++
        if (!tokenlar[i]) throw new TahlilXato('quvur tugamadi', true)
        continue
      }
      return quvur
    }
  }
  function yonalishlar(b) {
    while (tokenlar[i] && tokenlar[i].t === 'yon') yonalishT(b)
  }
  function yonalishT(b) {
    const t = tokenlar[i++]
    if (t.v === '>&' || t.v === '<&') { b.yonalish.push({ v: t.v, fd: t.fd, maqsad: t.maqsad }); return }
    const keyingi = tokenlar[i]
    if (!keyingi || keyingi.t !== 'soz') throw new TahlilXato(keyingi ? `syntax error near unexpected token \`${keyingi.v ?? 'newline'}'` : "syntax error near unexpected token `newline'")
    i++
    if (t.v.startsWith('<<')) {
      const h = heredoclar[hd++]
      b.yonalish.push({ v: '<<', fd: '0', heredoc: h.mazmun, tirnoq: h.tirnoq })
    } else b.yonalish.push({ v: t.v, fd: t.fd, soz: keyingi.qismlar })
  }
  function buyruqT() {
    const t = tokenlar[i]
    if (!t) throw new TahlilXato('buyruq kutilmoqda', true)
    const w = soz(t)
    if (w === 'if') {
      i++
      const shoxlar = []
      let boshqa = null
      const shart = royxatT(new Set(['then'])); kutilgan('then')
      shoxlar.push({ shart, tana: royxatT(new Set(['elif', 'else', 'fi'])) })
      for (;;) {
        otkaz()
        const x = soz(tokenlar[i])
        if (x === 'elif') { i++; const sh = royxatT(new Set(['then'])); kutilgan('then'); shoxlar.push({ shart: sh, tana: royxatT(new Set(['elif', 'else', 'fi'])) }); continue }
        if (x === 'else') { i++; boshqa = royxatT(new Set(['fi'])) }
        kutilgan('fi'); break
      }
      const b = { tur: 'if', shoxlar, boshqa, yonalish: [], sozlar: [], tayinlash: [] }
      yonalishlar(b)
      return b
    }
    if (w === 'while' || w === 'until') {
      i++
      const shart = royxatT(new Set(['do'])); kutilgan('do')
      const tana = royxatT(new Set(['done'])); kutilgan('done')
      const b = { tur: w, shart, tana, yonalish: [], sozlar: [], tayinlash: [] }
      yonalishlar(b)
      return b
    }
    if (w === 'for') {
      i++
      const nom = soz(tokenlar[i++])
      if (!nom) throw new TahlilXato("syntax error near unexpected token `for'")
      otkazQator()
      let sozlar = null
      if (soz(tokenlar[i]) === 'in') {
        i++
        sozlar = []
        while (tokenlar[i] && tokenlar[i].t === 'soz') sozlar.push(tokenlar[i++].qismlar)
      }
      kutilgan('do')
      const tana = royxatT(new Set(['done'])); kutilgan('done')
      const b = { tur: 'for', nom, sozlar, tana, yonalish: [], tayinlash: [] }
      yonalishlar(b)
      return b
    }
    if (w === '{') {
      i++
      const tana = royxatT(new Set(['}'])); kutilgan('}')
      const b = { tur: 'guruh', tana, yonalish: [], sozlar: [], tayinlash: [] }
      yonalishlar(b)
      return b
    }
    if (t.t === 'op' && t.v === '(') {
      i++
      const tana = royxatT(new Set([')']))
      if (!(tokenlar[i]?.t === 'op' && tokenlar[i].v === ')')) throw new TahlilXato(') kutilmoqda', true)
      i++
      const b = { tur: 'subshell', tana, yonalish: [], sozlar: [], tayinlash: [] }
      yonalishlar(b)
      return b
    }
    if (w && RES.has(w) && w !== '!' ) throw new TahlilXato(`syntax error near unexpected token \`${w}'`)
    // oddiy buyruq
    const b = { sozlar: [], yonalish: [], tayinlash: [] }
    for (;;) {
      const x = tokenlar[i]
      if (!x || x.t === 'qator' || x.t === 'op') break
      if (x.t === 'yon') { yonalishT(b); continue }
      i++
      if (!b.sozlar.length && TAYINLASH.test(x.xom) && x.qismlar[0]?.t === 'lit' && !x.qismlar[0].q) {
        const tenglik = x.qismlar[0].v.indexOf('=')
        b.tayinlash.push({ nom: x.qismlar[0].v.slice(0, tenglik), qiymat: [{ ...x.qismlar[0], v: x.qismlar[0].v.slice(tenglik + 1) }, ...x.qismlar.slice(1)] })
        continue
      }
      b.sozlar.push(x.qismlar)
    }
    if (!b.sozlar.length && !b.tayinlash.length && !b.yonalish.length) {
      const x = tokenlar[i]
      throw new TahlilXato(`syntax error near unexpected token \`${x?.v ?? 'newline'}'`)
    }
    return b
  }
  function otkazQator() { while (tokenlar[i] && (tokenlar[i].t === 'qator' || (tokenlar[i].t === 'op' && tokenlar[i].v === ';'))) i++ }
  const royxat = royxatT(new Set())
  return { royxat }
}

// Kiritilgan qator to'liqmi (yopilmagan qo'shtirnoq, heredoc, oxirida | yoki && bo'lsa — davom qatori kerak)
export function toliqmi(manba) {
  try { tahlil(manba); return true } catch (e) { return !e.chala }
}

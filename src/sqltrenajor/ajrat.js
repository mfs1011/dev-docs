// SQL matnini alohida so'rovlarga ajratadi (psql kabi: har biri alohida yuboriladi).
// Nuqta-vergul hisobga olinmaydigan joylar: '...' satrlar ('' bilan), "..." nomlar, `...` va [...] (SQLite),
// $teg$...$teg$ (PostgreSQL), -- va /* */ izohlar. Oxirgi so'rov ; siz bo'lsa — `complete: false`.

export function ajrat(sql) {
  const out = []
  let start = 0, i = 0
  const n = sql.length
  const push = (end, complete) => {
    const text = sql.slice(start, end).trim()
    if (text && !/^(--[^\n]*\n?|\/\*[\s\S]*?\*\/|\s)*$/.test(text)) out.push({ sql: text, complete })
  }
  while (i < n) {
    const c = sql[i], d = sql[i + 1]
    if (c === '-' && d === '-') { const e = sql.indexOf('\n', i); i = e < 0 ? n : e + 1; continue }
    if (c === '/' && d === '*') {
      // PostgreSQL'da /* */ ichma-ich bo'lishi mumkin
      let depth = 1; i += 2
      while (i < n && depth) {
        if (sql[i] === '/' && sql[i + 1] === '*') { depth++; i += 2 } else if (sql[i] === '*' && sql[i + 1] === '/') { depth--; i += 2 } else i++
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      // E'...' (PostgreSQL) ichida \' — qochirilgan qo'shtirnoq
      const esc = c === "'" && /[eE]/.test(sql[i - 1] ?? '') && !/[A-Za-z0-9_]/.test(sql[i - 2] ?? '')
      i++
      while (i < n) {
        if (esc && sql[i] === '\\') { i += 2; continue }
        if (sql[i] === c) { if (sql[i + 1] === c) { i += 2; continue } i++; break }
        i++
      }
      continue
    }
    if (c === '[') { const e = sql.indexOf(']', i); i = e < 0 ? n : e + 1; continue }
    if (c === '$') {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i))
      if (m && !/[A-Za-z0-9_]/.test(sql[i - 1] ?? '')) {
        const e = sql.indexOf(m[0], i + m[0].length)
        i = e < 0 ? n : e + m[0].length
        continue
      }
    }
    if (c === ';') { push(i + 1, true); start = i + 1 }
    i++
  }
  push(n, false)
  return out
}

// Matn oxiridagi leksik holat: so'rov tugamagan bo'lsa, nima ochiq qolgan (davom prompt'i uchun).
// psql PROMPT2 dagi %R: * — izoh, ' — satr, " — nom, $ — dollar satr, ( — qavs, - — shunchaki tugamagan
// (https://www.postgresql.org/docs/18/app-psql.html, «Prompting»).
export function ochiqHolat(sql) {
  let i = 0, depth = 0, comment = 0, quote = null, dollar = null
  const n = sql.length
  while (i < n) {
    const c = sql[i], d = sql[i + 1]
    if (comment) { if (c === '*' && d === '/') { comment--; i += 2 } else if (c === '/' && d === '*') { comment++; i += 2 } else i++; continue }
    if (quote) { if (c === quote) { if (sql[i + 1] === quote) i += 2; else { quote = null; i++ } } else i++; continue }
    if (dollar) { if (sql.startsWith(dollar, i)) { i += dollar.length; dollar = null } else i++; continue }
    if (c === '-' && d === '-') { const e = sql.indexOf('\n', i); i = e < 0 ? n : e + 1; continue }
    if (c === '/' && d === '*') { comment = 1; i += 2; continue }
    if (c === "'" || c === '"') { quote = c; i++; continue }
    if (c === '$') { const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i)); if (m && !/[A-Za-z0-9_]/.test(sql[i - 1] ?? '')) { dollar = m[0]; i += m[0].length; continue } }
    if (c === '(') depth++
    else if (c === ')') depth = Math.max(0, depth - 1)
    else if (c === ';') depth = 0
    i++
  }
  return { comment: comment > 0, quote, dollar, depth }
}

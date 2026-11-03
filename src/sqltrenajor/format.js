// Natijani terminal ko'rinishida chiqarish: PostgreSQL — psql'ning standart (aligned) formati,
// SQLite — sqlite3 CLI 3.54 ning standart ko'rinishi: yumaloq burchakli quti, sarlavha ostida ═ chiziq
// (https://www.sqlite.org/cli.html misollari: sarlavha markazda, matn chapda, son o'ngda).

const len = (s) => [...s].length
const pad = (s, w, right) => (right ? ' '.repeat(w - len(s)) + s : s + ' '.repeat(w - len(s)))
const cell = (v, nullText = '') => (v === null || v === undefined ? nullText : String(v))

// psql: sarlavha markazda, sonlar o'ngda, matn chapda; oxirgi ustun o'ng tomondan to'ldirilmaydi; (N rows)
export function psqlJadval(res) {
  const { columns, rows } = res
  const data = rows.map((r) => r.map((v) => cell(v)))
  const w = columns.map((c, i) => Math.max(len(c.name), ...data.map((r) => Math.max(...r[i].split('\n').map(len)))))
  const last = columns.length - 1
  const head = columns.map((c, i) => {
    const l = Math.floor((w[i] - len(c.name)) / 2)
    const s = ' '.repeat(l) + c.name + ' '.repeat(w[i] - len(c.name) - l)
    return i === last ? s.trimEnd() : s
  })
  const lines = [' ' + head.join(' | '), w.map((x) => '-'.repeat(x + 2)).join('+')]
  for (const r of data) lines.push(' ' + r.map((v, i) => (i === last && !columns[i].num ? v : pad(v, w[i], columns[i].num))).join(' | '))
  lines.push(`(${rows.length} ${rows.length === 1 ? 'row' : 'rows'})`)
  return lines.map((l) => l.trimEnd()).join('\n')
}

export function boxJadval(res) {
  const { columns, rows } = res
  const data = rows.map((r) => r.map((v) => cell(v)))
  const w = columns.map((c, i) => Math.max(len(c.name), ...data.map((r) => len(r[i]))))
  const line = (a, b, c, ch = '─') => a + w.map((x) => ch.repeat(x + 2)).join(b) + c
  const markaz = (s, x) => { const l = Math.floor((x - len(s)) / 2); return ' '.repeat(l) + s + ' '.repeat(x - len(s) - l) }
  const out = [line('╭', '┬', '╮'), '│' + columns.map((c, i) => ' ' + markaz(c.name, w[i]) + ' ').join('│') + '│', line('╞', '╪', '╡', '═')]
  for (const r of data) out.push('│' + r.map((v, i) => ' ' + pad(v, w[i], columns[i].num) + ' ').join('│') + '│')
  out.push(line('╰', '┴', '╯'))
  return out.join('\n')
}

// psql xato ko'rinishi: ERROR:  ..., LINE n: ... va xato joyi ostida ^
export function psqlXato(sql, e) {
  const out = [`ERROR:  ${e.message}`]
  if (e.position) {
    const before = sql.slice(0, e.position - 1)
    const lineNo = before.split('\n').length
    const lineStart = before.lastIndexOf('\n') + 1
    const text = sql.slice(lineStart).split('\n')[0]
    const prefix = `LINE ${lineNo}: `
    out.push(prefix + text, ' '.repeat(len(prefix) + len(sql.slice(lineStart, e.position - 1))) + '^')
  }
  if (e.detail) out.push(`DETAIL:  ${e.detail}`)
  if (e.hint) out.push(`HINT:  ${e.hint}`)
  return out.join('\n')
}

export function sqliteXato(sql, e) {
  const out = [`Error: ${e.message}`]
  if (e.position) {
    const before = sql.slice(0, e.position - 1)
    const lineStart = before.lastIndexOf('\n') + 1
    out.push('  ' + sql.slice(lineStart).split('\n')[0], '  ' + ' '.repeat(len(sql.slice(lineStart, e.position - 1))) + '^--- shu yerda')
  }
  return out.join('\n')
}

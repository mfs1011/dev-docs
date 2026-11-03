// Brauzerdagi haqiqiy ma'lumotlar bazalari: PostgreSQL (PGlite) va SQLite (rasmiy WASM build).
// Ikkalasi bir xil interfeys beradi: run(sql) — so'rovlarni bittalab bajaradi (psql kabi), schema() —
// ER diagramma uchun jadvallar va bog'lanishlar, plan(sql) — EXPLAIN daraxti.
import { ajrat } from './ajrat.js'

// ---------- PostgreSQL ----------
// Qiymatlar xom matn ko'rinishida olinadi — psql chiqaradigan ko'rinishning o'zi (t/f, 2026-01-02, 1.50)
const PG_XOM = [16, 17, 20, 21, 23, 26, 114, 700, 701, 1082, 1083, 1114, 1184, 1186, 1266, 1700, 3802]
const PG_SON = new Set([20, 21, 23, 26, 700, 701, 1700]) // o'ngga tekislanadigan (psql kabi)

// PGlite massivlarni baribir JS massiviga aylantiradi — PostgreSQL ko'rinishiga ({1,2}) qaytaramiz
function pgArray(v) {
  if (!Array.isArray(v)) return v
  const el = (x) => {
    if (x === null) return 'NULL'
    if (Array.isArray(x)) return pgArray(x)
    const s = String(x)
    return s === '' || /[\s,{}"\\]/.test(s) || /^null$/i.test(s) ? '"' + s.replace(/["\\]/g, '\\$&') + '"' : s
  }
  return '{' + v.map(el).join(',') + '}'
}

// psql buyruq yorlig'i: INSERT 0 3, UPDATE 2, CREATE TABLE ...
function pgTag(sql, affected) {
  const w = sql.replace(/^(\s|--[^\n]*\n|\/\*[\s\S]*?\*\/)+/, '').split(/\s+/).map((x) => x.toUpperCase())
  const k = w[0]
  if (k === 'INSERT') return `INSERT 0 ${affected ?? 0}`
  if (['UPDATE', 'DELETE', 'MERGE', 'COPY', 'FETCH', 'MOVE'].includes(k)) return `${k} ${affected ?? 0}`
  if (['CREATE', 'ALTER', 'DROP', 'COMMENT'].includes(k)) {
    const skip = new Set(['OR', 'REPLACE', 'UNIQUE', 'TEMP', 'TEMPORARY', 'UNLOGGED', 'IF', 'NOT', 'EXISTS', 'MATERIALIZED'])
    const obj = w.slice(1).find((x) => !skip.has(x)) ?? ''
    return `${k} ${w.includes('MATERIALIZED') ? 'MATERIALIZED ' : ''}${obj}`.replace(/[;(].*$/, '').trim()
  }
  if (k === 'BEGIN' || k === 'START') return 'BEGIN'
  if (k === 'END') return 'COMMIT'
  return k.replace(/;$/, '')
}

async function yaratPg() {
  const { PGlite } = await import('@electric-sql/pglite')
  let db = await PGlite.create({ parsers: Object.fromEntries(PG_XOM.map((o) => [o, (v) => v])) })
  const version = (await db.query('select version() v')).rows[0].v.match(/PostgreSQL ([\d.]+)/)[1]
  // psql prompt'i: %/ — baza nomi, %# — superuser bo'lsa #, aks holda >
  const who = (await db.query('select current_database() db, usesuper from pg_user where usename = current_user')).rows[0]
  const prompt = `${who.db}=${who.usesuper === true || who.usesuper === 't' ? '#' : '>'}`

  async function bitta(sql) {
    const t0 = performance.now()
    try {
      const r = await db.query(sql, [], { rowMode: 'array' })
      const ms = performance.now() - t0
      if (r.fields.length) {
        return { sql, ms, columns: r.fields.map((f) => ({ name: f.name, num: PG_SON.has(f.dataTypeID) })), rows: r.rows.map((row) => row.map(pgArray)) }
      }
      return { sql, ms, tag: pgTag(sql, r.affectedRows), affected: r.affectedRows }
    } catch (e) {
      return { sql, ms: performance.now() - t0, error: { message: e.message, code: e.code, position: e.position ? +e.position : null, detail: e.detail, hint: e.hint, constraint: e.constraint, table: e.table } }
    }
  }

  async function schema() {
    const q = async (s) => (await db.query(s)).rows
    const tables = await q(`select c.relname as name, c.relkind as kind from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm') order by c.oid`)
    const cols = await q(`select c.relname as t, a.attname as name, format_type(a.atttypid, a.atttypmod) as type, a.attnotnull as notnull,
        coalesce((select true from pg_index i where i.indrelid = c.oid and i.indisprimary and a.attnum = any(i.indkey)), false) as pk
      from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and a.attnum > 0 and not a.attisdropped order by c.oid, a.attnum`)
    const fks = await q(`select con.conname as name, c.relname as "from", r.relname as "to",
        (select array_agg(a.attname order by k.i) from unnest(con.conkey) with ordinality k(n, i) join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.n) as from_cols,
        (select array_agg(a.attname order by k.i) from unnest(con.confkey) with ordinality k(n, i) join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.n) as to_cols
      from pg_constraint con join pg_class c on c.oid = con.conrelid join pg_class r on r.oid = con.confrelid join pg_namespace n on n.oid = c.relnamespace
      where con.contype = 'f' and n.nspname = 'public'`)
    const idx = await q(`select tablename as t, indexname as name, indexdef as def from pg_indexes where schemaname = 'public'`)
    const out = []
    for (const t of tables) {
      const count = t.kind === 'v' ? null : +(await db.query(`select count(*) c from "${t.name.replace(/"/g, '""')}"`)).rows[0].c
      // xom parser'lar boolean'ni 't'/'f' matni qilib beradi
      const columns = cols.filter((c) => c.t === t.name).map((c) => ({ name: c.name, type: c.type, notnull: c.notnull === true || c.notnull === 't', pk: c.pk === true || c.pk === 't' }))
      out.push({ name: t.name, view: t.kind === 'v' || t.kind === 'm', count, columns, indexes: idx.filter((i) => i.t === t.name) })
    }
    const parse = (a) => (Array.isArray(a) ? a : String(a ?? '').replace(/[{}]/g, '').split(',').filter(Boolean))
    return { tables: out, fks: fks.map((f) => ({ name: f.name, from: f.from, to: f.to, fromCols: parse(f.from_cols), toCols: parse(f.to_cols) })) }
  }

  // EXPLAIN (ANALYZE, FORMAT JSON) — faqat SELECT/WITH uchun (ANALYZE so'rovni haqiqatan bajaradi)
  async function plan(sql, analyze = true) {
    const r = await db.query(`explain (${analyze ? 'analyze, ' : ''}format json) ${sql.replace(/;\s*$/, '')}`)
    let j = r.rows[0]['QUERY PLAN']
    if (typeof j === 'string') j = JSON.parse(j)
    const node = (p) => ({
      type: p['Node Type'] + (p['Join Type'] && p['Node Type'].includes('Join') ? ` (${p['Join Type']})` : ''),
      rel: p['Relation Name'] ?? p['CTE Name'] ?? null,
      index: p['Index Name'] ?? null,
      cond: p['Index Cond'] ?? p['Hash Cond'] ?? p['Merge Cond'] ?? p['Filter'] ?? p['Join Filter'] ?? p['Recheck Cond'] ?? null,
      removed: p['Rows Removed by Filter'] ?? null,
      rows: p['Actual Rows'] ?? null, est: p['Plan Rows'], loops: p['Actual Loops'] ?? null,
      time: p['Actual Total Time'] ?? null, cost: p['Total Cost'],
      sort: p['Sort Key']?.join(', ') ?? null, group: p['Group Key']?.join(', ') ?? null,
      children: (p.Plans ?? []).map(node),
    })
    return { root: node(j[0].Plan), total: j[0]['Execution Time'] ?? null, planning: j[0]['Planning Time'] ?? null }
  }

  return {
    id: 'pg', name: 'PostgreSQL', version, prompt,
    async run(text) { const out = []; for (const s of ajrat(text)) out.push(await bitta(s.sql)); return out },
    schema, plan,
    async reset() { await db.close(); db = await PGlite.create({ parsers: Object.fromEntries(PG_XOM.map((o) => [o, (v) => v])) }) },
    close: () => db.close(),
  }
}

// ---------- SQLite ----------
async function yaratSqlite() {
  const { default: init } = await import('@sqlite.org/sqlite-wasm')
  const sq = await init({ print: () => {}, printErr: () => {} })
  const { capi } = sq
  let db = new sq.oo1.DB(':memory:')
  const version = capi.sqlite3_libversion()

  function bitta(sql) {
    const t0 = performance.now()
    let st = null
    try {
      st = db.prepare(sql)
      if (st.columnCount > 0) {
        const columns = st.getColumnNames().map((name) => ({ name, num: false }))
        const rows = []
        while (st.step()) rows.push(st.get([]))
        // tip saqlanmaydi (SQLite'da har qiymat o'z tipiga ega) — son ustunlarini qiymatlardan aniqlaymiz
        columns.forEach((c, i) => { c.num = rows.length > 0 && rows.every((r) => r[i] === null || typeof r[i] === 'number' || typeof r[i] === 'bigint') })
        return { sql, ms: performance.now() - t0, columns, rows: rows.map((r) => r.map((v) => (v instanceof Uint8Array ? 'x\'' + [...v].map((b) => b.toString(16).padStart(2, '0')).join('') + '\'' : v))) }
      }
      st.step()
      return { sql, ms: performance.now() - t0, affected: /^\s*(insert|update|delete|replace)\b/i.test(sql) ? db.changes() : null }
    } catch (e) {
      const ext = capi.sqlite3_extended_errcode(db.pointer)
      const off = capi.sqlite3_error_offset(db.pointer)
      return { sql, ms: performance.now() - t0, error: { message: e.message.replace(/^[A-Z_]+: sqlite3 result code \d+: /, ''), code: capi.sqlite3_js_rc_str(ext) ?? String(ext), position: off >= 0 ? off + 1 : null } }
    } finally {
      st?.finalize()
    }
  }

  function schema() {
    const q = (s, b) => db.exec({ sql: s, bind: b, rowMode: 'object', returnValue: 'resultRows' })
    const tables = q(`select name, type from sqlite_schema where type in ('table', 'view') and name not like 'sqlite_%' order by rowid`)
    const out = [], fks = []
    for (const t of tables) {
      const cols = q('select name, type, "notnull" as nn, pk from pragma_table_info(?)', [t.name])
      const count = t.type === 'view' ? null : q(`select count(*) c from "${t.name.replace(/"/g, '""')}"`)[0].c
      const indexes = q('select name from pragma_index_list(?)', [t.name]).map((i) => ({ name: i.name }))
      out.push({ name: t.name, view: t.type === 'view', count, columns: cols.map((c) => ({ name: c.name, type: c.type || '', notnull: !!c.nn, pk: c.pk > 0 })), indexes })
      const f = q('select id, "table" as "to", "from", "to" as to_col from pragma_foreign_key_list(?) order by id, seq', [t.name])
      for (const r of f) {
        let fk = fks.find((x) => x.from === t.name && x.id === r.id)
        if (!fk) fks.push((fk = { id: r.id, name: `${t.name}_fk${r.id}`, from: t.name, to: r.to, fromCols: [], toCols: [] }))
        fk.fromCols.push(r.from)
        fk.toCols.push(r.to_col ?? '')
      }
    }
    return { tables: out, fks }
  }

  // EXPLAIN QUERY PLAN: (id, parent, notused, detail) qatorlari — daraxtga yig'amiz
  function plan(sql) {
    const rows = db.exec({ sql: 'explain query plan ' + sql.replace(/;\s*$/, ''), rowMode: 'object', returnValue: 'resultRows' })
    const byId = new Map(rows.map((r) => [r.id, { type: r.detail, children: [] }]))
    const root = { type: 'QUERY PLAN', children: [] }
    for (const r of rows) (byId.get(r.parent) ?? root).children.push(byId.get(r.id))
    return { root, total: null }
  }

  return {
    // sqlite3 CLI 3.54 standart prompt'i: «SQLite-3.54 <baza>->», xotiradagi baza — memory (https://www.sqlite.org/cliprompt.html)
    id: 'sqlite', name: 'SQLite', version, prompt: `SQLite-${version.split('.').slice(0, 2).join('.')} memory->`,
    async run(text) { return ajrat(text).map((s) => bitta(s.sql)) },
    schema: async () => schema(), plan: async (s) => plan(s),
    async reset() { db.close(); db = new sq.oo1.DB(':memory:') },
    close: () => db.close(),
  }
}

export const DVIGATELLAR = {
  pg: { name: 'PostgreSQL', yarat: yaratPg },
  sqlite: { name: 'SQLite', yarat: yaratSqlite },
}

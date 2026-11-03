// So'rovlarni bajarish va EXPLAIN bo'lsa reja daraxtini qo'shish (sahifa ham, testlar ham shuni ishlatadi).

// EXPLAIN ... so'rovidan ichki so'rovni ajratadi: PostgreSQL — EXPLAIN [(…)] [ANALYZE] [VERBOSE] …,
// SQLite — EXPLAIN QUERY PLAN …
function explainIchi(dvigatel, sql) {
  const m = dvigatel === 'pg'
    ? /^\s*explain\s*(\([^)]*\))?\s*((analyze|verbose|costs|buffers|settings)\s+)*/i.exec(sql)
    : /^\s*explain\s+query\s+plan\s+/i.exec(sql)
  if (!m || m[0].trim().toLowerCase() === '') return null
  const inner = sql.slice(m[0].length)
  // reja faqat o'qish so'rovlari uchun: ANALYZE so'rovni haqiqatan bajaradi, DML ikki marta bajarilmasin
  if (!/^\s*(select|with|values|table)\b/i.test(inner)) return null
  return { inner, analyze: dvigatel === 'pg' && /analyze/i.test(m[0]) }
}

export async function bajar(eng, text) {
  const res = await eng.run(text)
  for (const r of res) {
    if (r.error) continue
    const e = explainIchi(eng.id, r.sql)
    if (!e) continue
    try { r.plan = await eng.plan(e.inner, e.analyze) } catch { /* reja chizilmaydi, natija baribir bor */ }
  }
  return res
}

// tekshiruv konteksti: oxirgi so'rov natijasi, uning matni, jim so'rov va sxema
export const kontekst = (eng, res) => {
  const last = res.at(-1)
  return {
    res: last, sql: last?.sql ?? '', dvigatel: eng.id, plan: last?.plan ?? null,
    q: async (s) => (await eng.run(s)).at(-1),
    schema: () => eng.schema(),
  }
}

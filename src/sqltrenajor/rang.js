// SQL matnini rangli HTML'ga aylantiradi (konsol kiritish maydoni va chiqishdagi so'rovlar uchun).
// Hamma qism HTML-escape qilinadi — chiqish faqat <span class> lardan iborat.

export const KALIT_SOZLAR = `SELECT FROM WHERE AND OR NOT NULL IS IN EXISTS BETWEEN LIKE ILIKE AS ON JOIN LEFT RIGHT FULL INNER OUTER CROSS
NATURAL USING GROUP BY HAVING ORDER ASC DESC NULLS FIRST LAST LIMIT OFFSET FETCH DISTINCT UNION ALL INTERSECT EXCEPT
INSERT INTO VALUES UPDATE SET DELETE RETURNING CREATE TABLE INDEX VIEW UNIQUE PRIMARY KEY FOREIGN REFERENCES CHECK
DEFAULT CONSTRAINT ALTER ADD DROP COLUMN RENAME TO IF CASCADE BEGIN COMMIT ROLLBACK TRANSACTION WITH RECURSIVE CASE
WHEN THEN ELSE END CAST OVER PARTITION ROWS RANGE WINDOW EXPLAIN ANALYZE QUERY PLAN TRUE FALSE INTEGER TEXT NUMERIC
DATE BOOLEAN VARCHAR SERIAL CONFLICT DO NOTHING TRUNCATE VACUUM PRAGMA`.split(/\s+/)

export const FUNKSIYALAR = 'count sum avg min max coalesce nullif round lower upper length substr trim now row_number rank dense_rank lag lead string_agg group_concat abs'.split(' ')

const KW = new Set(KALIT_SOZLAR)
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function rangla(sql) {
  const re = /(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g
  let out = '', m
  while ((m = re.exec(sql))) {
    const [t, com, str, ident, num, word] = m
    if (com) out += `<span class="s-com">${esc(t)}</span>`
    else if (str) out += `<span class="s-str">${esc(t)}</span>`
    else if (ident) out += `<span class="s-id">${esc(t)}</span>`
    else if (num) out += `<span class="s-num">${esc(t)}</span>`
    else if (word && KW.has(word.toUpperCase())) out += `<span class="s-kw">${esc(t)}</span>`
    else if (word && FUNKSIYALAR.includes(word.toLowerCase()) && sql[re.lastIndex] === '(') out += `<span class="s-fn">${esc(t)}</span>`
    else out += esc(t)
  }
  return out
}

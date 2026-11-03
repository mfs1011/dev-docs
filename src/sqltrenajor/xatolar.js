// Ko'p uchraydigan xatolarning o'zbekcha izohi. PostgreSQL — SQLSTATE kodi bo'yicha
// (https://www.postgresql.org/docs/18/errcodes-appendix.html), SQLite — kengaytirilgan natija kodi
// (https://www.sqlite.org/rescode.html) yoki xabar matni bo'yicha.

const IZOH = {
  undefined_table: 'Bunday jadval yo‘q. Nomini tekshiring — mavjud jadvallar diagrammada ko‘rinib turibdi.',
  undefined_column: 'Bunday ustun yo‘q. Diagrammada jadvalni bosib, ustun nomlarini ko‘ring.',
  ambiguous_column: 'Bu ustun nomi bir nechta jadvalda bor. Qaysi biri kerakligini jadval nomi yoki taxallusi bilan yozing: m.id',
  syntax: 'Sintaksis xatosi: SQL so‘zlari tartibi yoki tinish belgisi noto‘g‘ri. Xato ko‘rsatilgan joyning o‘zi va undan oldingi so‘zga qarang.',
  unique: 'Takroriy qiymat: bu ustunda (PRIMARY KEY yoki UNIQUE) bir xil qiymat ikki marta bo‘lishi mumkin emas.',
  foreign_key: 'Tashqi kalit (FOREIGN KEY) buzildi: bog‘langan jadvalda bunday qator yo‘q yoki o‘chirilayotgan qatorga boshqa jadval ishora qilmoqda.',
  not_null: 'NOT NULL ustunga qiymat berilmadi (NULL).',
  check: 'CHECK sharti bajarilmadi — qiymat jadvalda belgilangan qoidaga to‘g‘ri kelmaydi.',
  duplicate_table: 'Bunday nomli jadval allaqachon bor. O‘chirish uchun DROP TABLE, yoki CREATE TABLE IF NOT EXISTS.',
  grouping: 'GROUP BY bor so‘rovda SELECT dagi har ustun yo GROUP BY ichida, yo agregat funksiya (COUNT, SUM ...) ichida bo‘lishi kerak.',
  undefined_function: 'Bunday funksiya yo‘q yoki unga bu tipdagi argument berib bo‘lmaydi.',
  invalid_text: 'Matnni kerakli tipga o‘girib bo‘lmadi, masalan son kerak joyda harf bor.',
  division_by_zero: 'Nolga bo‘lish.',
  failed_transaction: 'Tranzaksiya ichida xato bo‘lgan — u endi buyruq qabul qilmaydi. ROLLBACK qiling.',
}

const PG = {
  '42P01': 'undefined_table', '42703': 'undefined_column', '42702': 'ambiguous_column', '42601': 'syntax',
  23505: 'unique', 23503: 'foreign_key', 23502: 'not_null', 23514: 'check', '42P07': 'duplicate_table',
  42803: 'grouping', 42883: 'undefined_function', '22P02': 'invalid_text', 22012: 'division_by_zero', '25P02': 'failed_transaction',
}

const SQLITE_CODE = {
  SQLITE_CONSTRAINT_UNIQUE: 'unique', SQLITE_CONSTRAINT_PRIMARYKEY: 'unique', SQLITE_CONSTRAINT_FOREIGNKEY: 'foreign_key',
  SQLITE_CONSTRAINT_NOTNULL: 'not_null', SQLITE_CONSTRAINT_CHECK: 'check',
}
const SQLITE_MSG = [
  [/^no such table/, 'undefined_table'], [/^no such column/, 'undefined_column'], [/^ambiguous column name/, 'ambiguous_column'],
  [/syntax error|incomplete input/, 'syntax'], [/already exists/, 'duplicate_table'], [/^no such function/, 'undefined_function'],
  [/^misuse of aggregate/, 'grouping'],
]

export function xatoTuri(dvigatel, e) {
  if (dvigatel === 'pg') return PG[e.code] ?? null
  return SQLITE_CODE[e.code] ?? SQLITE_MSG.find(([re]) => re.test(e.message))?.[1] ?? null
}

export const xatoIzohi = (dvigatel, e) => IZOH[xatoTuri(dvigatel, e)] ?? null

// SQL trenajori mashqlari. Har mashq do'kon bazasida (baza.js) ishlaydi; qadamlar o'quvchining
// haqiqiy natijasini tekshiradi: kutilgan so'rov natijasi bilan solishtiradi, bazaning holatini
// so'raydi, xato turini yoki EXPLAIN rejasini ko'radi. Hammasi sql-trenajor/test/mashqlar.mjs da
// ikkala dvigatelda sinaladi.
import { xatoTuri } from './xatolar.js'

// 170000.00 va 170000 — bir qiymat (turli ifodalar turli kasr uzunligini berishi mumkin)
const norm = (v) => {
  if (v === null || v === undefined) return null
  const s = String(v)
  return /^-?\d+(\.\d+)?$/.test(s) ? String(Number(s)) : s
}
const qatorlar = (rows, tartib) => {
  const r = rows.map((x) => JSON.stringify(x.map(norm)))
  return tartib ? r : r.sort()
}
export function tengmi(a, b, tartib = false) {
  if (!a?.columns || !b?.columns || a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false
  const x = qatorlar(a.rows, tartib), y = qatorlar(b.rows, tartib)
  return x.every((v, i) => v === y[i])
}

// tekshiruvlar: ctx = { res, sql, dvigatel, q(sql), schema(), plan }
const natija = (kutilgan, tartib = false) => async (c) => !!c.res?.columns && tengmi(c.res, await c.q(kutilgan), tartib)
const holat = (sql, kutilgan) => async (c) => !c.res?.error && tengmi(await c.q(sql), { columns: kutilgan[0]?.map(() => ({})) ?? [{}], rows: kutilgan })
const xato = (tur) => (c) => !!c.res?.error && xatoTuri(c.dvigatel, c.res.error) === tur
const reja = (re) => (c) => { const all = []; const w = (n) => { all.push(n.type); n.children?.forEach(w) }; if (c.plan) w(c.plan.root); return all.some((t) => re.test(t)) }
const sxema = (fn) => async (c) => !c.res?.error && fn(await c.schema())
const pg = (c) => c.dvigatel === 'pg'

export const MASHQLAR = [
  {
    id: 'select',
    title: 'SELECT: kerakli ustunlar',
    bob: '/sql/22-select-anatomiyasi',
    intro: 'Do‘kon bazasida to‘rtta jadval bor — diagrammaga qarang. Boshlash uchun bitta jadvaldan kerakli ustunlarni oling.',
    steps: [
      {
        text: 'Barcha mahsulotlarning nomi va narxini chiqaring.',
        yordam: 'SELECT nomi, narx FROM mahsulotlar;',
        check: natija('SELECT nomi, narx FROM mahsulotlar'),
        natija: 'SELECT faqat so‘ralgan ustunlarni qaytaradi. `*` hamma ustunni beradi, lekin ilovada aniq ustun nomlarini yozish xavfsizroq: jadvalga ustun qo‘shilsa, so‘rov o‘zgarmaydi.',
      },
    ],
  },
  {
    id: 'where',
    title: 'WHERE: qatorlarni filtrlash',
    bob: '/sql/23-filtrlash',
    intro: 'Hamma qator emas, faqat shartga mos keladiganlari kerak.',
    steps: [
      {
        text: 'Toshkentlik mijozlarning ismini chiqaring.',
        yordam: "SELECT ism FROM mijozlar WHERE shahar = 'Toshkent';",
        check: natija("SELECT ism FROM mijozlar WHERE shahar = 'Toshkent'"),
        natija: 'WHERE har qator uchun shartni tekshiradi va faqat rost chiqqanlarini qoldiradi. Matn qiymati bitta qo‘shtirnoqda yoziladi.',
      },
      {
        text: '100 000 so‘mdan arzon mahsulotlarning nomi va narxini chiqaring.',
        yordam: 'SELECT nomi, narx FROM mahsulotlar WHERE narx < 100000;',
        check: natija('SELECT nomi, narx FROM mahsulotlar WHERE narx < 100000'),
        natija: 'Son bilan solishtirishda qo‘shtirnoq kerak emas.',
      },
    ],
  },
  {
    id: 'null',
    title: 'NULL — «qiymat yo‘q»',
    bob: '/sql/10-null-va-tip-konversiyasi',
    intro: 'Jasurning shahri kiritilmagan (NULL). Uni topishga harakat qiling — birinchi urinish ataylab noto‘g‘ri.',
    steps: [
      {
        text: 'Avval `= NULL` bilan qidirib ko‘ring.',
        yordam: 'SELECT ism FROM mijozlar WHERE shahar = NULL;',
        check: (c) => /=\s*null/i.test(c.sql) && c.res?.columns && c.res.rows.length === 0,
        natija: 'Hech narsa chiqmadi. NULL bilan har qanday solishtirish (`=`, `<>`, `<` ...) TRUE emas, NULL beradi, WHERE esa faqat TRUE qatorlarni qoldiradi.',
      },
      {
        text: 'Endi `IS NULL` bilan qidiring.',
        yordam: 'SELECT ism FROM mijozlar WHERE shahar IS NULL;',
        check: natija('SELECT ism FROM mijozlar WHERE shahar IS NULL'),
        natija: '`IS NULL` va `IS NOT NULL` — NULL’ni tekshirishning to‘g‘ri yo‘li.',
      },
    ],
  },
  {
    id: 'order-limit',
    title: 'ORDER BY va LIMIT',
    bob: '/sql/24-saralash-va-cheklash',
    intro: 'Natija tartibi kafolatlanmaydi — kerakli tartibni ORDER BY bilan aytish kerak.',
    steps: [
      {
        text: 'Eng qimmat 3 ta mahsulotning nomi va narxini, qimmatidan boshlab chiqaring.',
        yordam: 'SELECT nomi, narx FROM mahsulotlar ORDER BY narx DESC LIMIT 3;',
        check: natija('SELECT nomi, narx FROM mahsulotlar ORDER BY narx DESC LIMIT 3', true),
        natija: 'DESC — kamayish tartibi. LIMIT saralangandan keyin qo‘llanadi, shuning uchun ORDER BY’siz «birinchi 3 ta» degan narsa ma’nosiz.',
      },
    ],
  },
  {
    id: 'join',
    title: 'JOIN: jadvallarni bog‘lash',
    bob: '/sql/25-joinlar',
    intro: 'buyurtmalar jadvalida mijozning ismi emas, faqat mijoz_id bor. Ismni mijozlar jadvalidan olib keling — diagrammadagi bog‘lanish chizig‘iga qarang.',
    steps: [
      {
        text: 'Har buyurtmaning raqami (id), sanasi va mijoz ismini chiqaring.',
        yordam: 'SELECT b.id, b.sana, m.ism\nFROM buyurtmalar b\nJOIN mijozlar m ON m.id = b.mijoz_id;',
        check: natija('SELECT b.id, b.sana, m.ism FROM buyurtmalar b JOIN mijozlar m ON m.id = b.mijoz_id'),
        natija: 'JOIN ... ON har buyurtmaga shartga mos mijoz qatorini ulaydi. `b` va `m` — jadval taxalluslari: ikkala jadvalda ham `id` bor, shuning uchun qaysi biri ekanini aytish shart.',
      },
      {
        text: 'Hech qachon buyurtma bermagan mijozlarning ismini chiqaring.',
        yordam: 'SELECT m.ism\nFROM mijozlar m\nLEFT JOIN buyurtmalar b ON b.mijoz_id = m.id\nWHERE b.id IS NULL;',
        check: natija('SELECT m.ism FROM mijozlar m LEFT JOIN buyurtmalar b ON b.mijoz_id = m.id WHERE b.id IS NULL'),
        natija: 'LEFT JOIN chap jadvalning har qatorini saqlaydi; jufti topilmasa, o‘ng tomon ustunlari NULL bo‘ladi. `WHERE b.id IS NULL` aynan shu juftsizlarni qoldiradi.',
      },
    ],
  },
  {
    id: 'group-by',
    title: 'GROUP BY va agregatlar',
    bob: '/sql/26-agregatsiya',
    intro: 'Qatorlarni guruhlab, har guruh uchun bitta natija hisoblaymiz.',
    steps: [
      {
        text: 'Har shahar bo‘yicha mijozlar sonini chiqaring: shahar va soni.',
        yordam: 'SELECT shahar, count(*) FROM mijozlar GROUP BY shahar;',
        check: natija('SELECT shahar, count(*) FROM mijozlar GROUP BY shahar'),
        natija: 'NULL shahar ham alohida guruh bo‘ldi: GROUP BY uchun barcha NULL’lar bir guruh. `count(*)` qatorlarni sanaydi, `count(shahar)` esa NULL’larni sanamaydi.',
      },
      {
        text: 'Har mijozning jami xarid summasini (narx × soni) chiqaring: ism va summa. Hamma buyurtmalar hisobga olinsin.',
        yordam: 'SELECT m.ism, sum(p.narx * q.soni) AS summa\nFROM mijozlar m\nJOIN buyurtmalar b ON b.mijoz_id = m.id\nJOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id\nJOIN mahsulotlar p ON p.id = q.mahsulot_id\nGROUP BY m.id, m.ism;',
        check: natija('SELECT m.ism, sum(p.narx * q.soni) FROM mijozlar m JOIN buyurtmalar b ON b.mijoz_id = m.id JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id JOIN mahsulotlar p ON p.id = q.mahsulot_id GROUP BY m.id, m.ism'),
        natija: 'To‘rt jadval zanjir bo‘lib ulandi: mijoz → buyurtma → buyurtma qatori → mahsulot. GROUP BY m.id — ismi bir xil ikki mijoz bo‘lsa ham ular aralashib ketmasligi uchun.',
      },
    ],
  },
  {
    id: 'subquery',
    title: 'Subquery: so‘rov ichida so‘rov',
    bob: '/sql/27-subquerylar',
    intro: 'Bitta qiymatni avval hisoblab, keyin uni shartda ishlatamiz.',
    steps: [
      {
        text: 'Narxi barcha mahsulotlarning o‘rtacha narxidan yuqori bo‘lgan mahsulotlar nomini chiqaring.',
        yordam: 'SELECT nomi FROM mahsulotlar\nWHERE narx > (SELECT avg(narx) FROM mahsulotlar);',
        check: natija('SELECT nomi FROM mahsulotlar WHERE narx > (SELECT avg(narx) FROM mahsulotlar)'),
        natija: 'Qavs ichidagi so‘rov bitta qiymat (skalyar) qaytaradi va tashqi WHERE uni oddiy son kabi ishlatadi.',
      },
    ],
  },
  {
    id: 'window',
    title: 'Window funksiyalar',
    bob: '/sql/31-window-funksiyalar',
    intro: 'GROUP BY qatorlarni bitta qatorga yig‘adi. Window funksiya esa har qatorni saqlab, unga guruh bo‘yicha hisob qo‘shadi.',
    steps: [
      {
        text: 'Har kategoriya ichida mahsulotlarni qimmatidan boshlab raqamlang: nomi, kategoriya va o‘rni (row_number).',
        yordam: 'SELECT nomi, kategoriya,\n       row_number() OVER (PARTITION BY kategoriya ORDER BY narx DESC) AS orin\nFROM mahsulotlar;',
        check: natija('SELECT nomi, kategoriya, row_number() OVER (PARTITION BY kategoriya ORDER BY narx DESC) FROM mahsulotlar'),
        natija: 'PARTITION BY har kategoriyani alohida «oyna» qiladi, ORDER BY oyna ichidagi tartibni beradi. 10 ta qator joyida qoldi — GROUP BY’dan farqi shu.',
      },
    ],
  },
  {
    id: 'insert-fk',
    title: 'INSERT va tashqi kalit',
    bob: '/sql/37-aloqalar-va-tashqi-kalitlar',
    intro: 'Ma’lumot qo‘shamiz va tashqi kalit (FOREIGN KEY) noto‘g‘ri qatorni qanday to‘xtatishini ko‘ramiz. Diagrammadagi bog‘lanish chiziqlarini kuzating.',
    steps: [
      {
        text: "Yangi mijoz qo‘shing: id 9, ism Otabek, shahar Xiva, ro‘yxatdan o‘tgan sana '2025-10-01'.",
        yordam: "INSERT INTO mijozlar (id, ism, shahar, royxatdan_otgan)\nVALUES (9, 'Otabek', 'Xiva', '2025-10-01');",
        check: holat('SELECT ism, shahar FROM mijozlar WHERE id = 9', [['Otabek', 'Xiva']]),
        natija: 'Diagrammada mijozlar jadvalining qatorlar soni bittaga oshdi.',
      },
      {
        text: "Endi mavjud bo‘lmagan mijoz (id 100) uchun buyurtma qo‘shib ko‘ring: id 13, sana '2025-10-02'.",
        yordam: "INSERT INTO buyurtmalar (id, mijoz_id, sana)\nVALUES (13, 100, '2025-10-02');",
        check: xato('foreign_key'),
        natija: 'Baza rad etdi: mijoz_id mijozlar.id ga tashqi kalit, 100-mijoz esa yo‘q. Diagrammada shu bog‘lanish qizil yondi. SQLite’da bu tekshiruv standart bo‘yicha o‘chiq — trenajor uni `PRAGMA foreign_keys = ON` bilan yoqib qo‘ygan.',
      },
      {
        text: 'Xuddi shu buyurtmani yangi mijoz (id 9) uchun qo‘shing.',
        yordam: "INSERT INTO buyurtmalar (id, mijoz_id, sana)\nVALUES (13, 9, '2025-10-02');",
        check: holat('SELECT mijoz_id, holat FROM buyurtmalar WHERE id = 13', [['9', 'yangi']]),
        natija: 'Endi qabul qilindi. `holat` ustuniga qiymat bermadik — DEFAULT ‘yangi’ qo‘yildi.',
      },
    ],
  },
  {
    id: 'create-table',
    title: 'CREATE TABLE: yangi jadval',
    bob: '/sql/12-create-table-va-default',
    intro: 'Mahsulotlarga sharh yozish uchun jadval kerak. Jadvalni yarating va diagrammada paydo bo‘lishini kuzating.',
    steps: [
      {
        text: '`sharhlar` jadvalini yarating: id (PRIMARY KEY), mahsulot_id (mahsulotlar(id) ga tashqi kalit), matn (NOT NULL).',
        yordam: 'CREATE TABLE sharhlar (\n  id integer PRIMARY KEY,\n  mahsulot_id integer REFERENCES mahsulotlar (id),\n  matn text NOT NULL\n);',
        check: sxema((s) => {
          const t = s.tables.find((x) => x.name === 'sharhlar')
          return !!t && t.columns.some((c) => c.name === 'matn' && c.notnull) && t.columns.some((c) => c.name === 'id' && c.pk) &&
            s.fks.some((f) => f.from === 'sharhlar' && f.to === 'mahsulotlar' && f.fromCols.includes('mahsulot_id'))
        }),
        natija: 'Diagrammada yangi jadval paydo bo‘ldi va mahsulotlarga bog‘lanish chizig‘i tortildi.',
      },
      {
        text: "Choynak (id 1) uchun sharh qo‘shing: id 1, matn 'Zo‘r choynak'.",
        yordam: "INSERT INTO sharhlar (id, mahsulot_id, matn) VALUES (1, 1, 'Zo''r choynak');",
        check: holat('SELECT count(*) FROM sharhlar WHERE mahsulot_id = 1', [['1']]),
        natija: 'Matn ichidagi qo‘shtirnoq ikki marta yoziladi: `Zo\'\'r` — SQL standarti shunday.',
      },
    ],
  },
  {
    id: 'indeks',
    title: 'Indeks va EXPLAIN',
    bob: '/sql/41-indeks-qanday-ishlaydi',
    intro: 'Bu mashq uchun 50 000 qatorli `tashriflar` jadvali tayyorlanadi. So‘rov rejasini indeksdan oldin va keyin solishtiring — «Reja» panelini kuzating.',
    setup: {
      pg: `CREATE TABLE tashriflar (id integer PRIMARY KEY, mijoz_id integer NOT NULL, sahifa text NOT NULL);
INSERT INTO tashriflar SELECT i, i % 1000, 'sahifa-' || (i % 37) FROM generate_series(1, 50000) AS i;
ANALYZE tashriflar;`,
      sqlite: `CREATE TABLE tashriflar (id integer PRIMARY KEY, mijoz_id integer NOT NULL, sahifa text NOT NULL);
WITH RECURSIVE s(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM s WHERE i < 50000)
INSERT INTO tashriflar SELECT i, i % 1000, 'sahifa-' || (i % 37) FROM s;
ANALYZE;`,
    },
    steps: [
      {
        text: '7-mijozning tashriflari qanday topilishini ko‘ring.',
        yordam: { pg: 'EXPLAIN ANALYZE SELECT * FROM tashriflar WHERE mijoz_id = 7;', sqlite: 'EXPLAIN QUERY PLAN SELECT * FROM tashriflar WHERE mijoz_id = 7;' },
        check: (c) => reja(pg(c) ? /Seq Scan/ : /^SCAN/)(c),
        natija: 'Indeks yo‘q — baza butun jadvalni boshidan oxirigacha o‘qiyapti (PostgreSQL’da Seq Scan, SQLite’da SCAN). 50 000 qatordan 50 tasi kerak, qolgani bekorga o‘qiladi.',
      },
      {
        text: '`mijoz_id` ustuniga indeks yarating.',
        yordam: 'CREATE INDEX tashriflar_mijoz_idx ON tashriflar (mijoz_id);',
        check: sxema((s) => s.tables.find((t) => t.name === 'tashriflar')?.indexes.some((i) => i.name === 'tashriflar_mijoz_idx')),
        natija: 'Indeks — ustun qiymatlari bo‘yicha saralangan alohida tuzilma (B-tree). U har INSERT/UPDATE’da yangilanadi, shuning uchun bepul emas.',
      },
      {
        text: 'Rejani qayta ko‘ring.',
        yordam: { pg: 'EXPLAIN ANALYZE SELECT * FROM tashriflar WHERE mijoz_id = 7;', sqlite: 'EXPLAIN QUERY PLAN SELECT * FROM tashriflar WHERE mijoz_id = 7;' },
        check: (c) => reja(pg(c) ? /Index|Bitmap/ : /USING INDEX/)(c),
        natija: 'Endi baza indeks orqali faqat kerakli qatorlarga boradi (PostgreSQL’da Index yoki Bitmap Scan, SQLite’da SEARCH ... USING INDEX). PostgreSQL’da vaqtni oldingi reja bilan solishtiring.',
      },
    ],
  },
]

// kitobdagi tartib: bob raqami bo'yicha
export const bobRaqami = (m) => +m.bob.match(/\/(\d+)-/)[1]
MASHQLAR.sort((a, b) => bobRaqami(a) - bobRaqami(b))

export const findMashq = (id) => MASHQLAR.find((m) => m.id === id) ?? null
export const yordamMatni = (step, dvigatel) => (typeof step.yordam === 'string' ? step.yordam : step.yordam[dvigatel])
export const setupMatni = (m, dvigatel) => (typeof m.setup === 'string' ? m.setup : m.setup?.[dvigatel] ?? '')

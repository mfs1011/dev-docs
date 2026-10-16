// SQL 19-bob, 3-video: "Dialektlar" — MySQL va SQLite da RETURNING Muqobillari
(function (g) {
  const scenes = ['intro', 'mysql_no_returning', 'mysql_pitfalls', 'sqlite_returning', 'dml_pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: RETURNING mavjudligi',
    mysql_no_returning: 'MySQL: RETURNING yo‘qligi va LAST_INSERT_ID',
    mysql_pitfalls: 'MySQL tuzoqlari: Ko‘p qatorlar va ROW_COUNT',
    sqlite_returning: 'SQLite: RETURNING va uning cheklovlari',
    dml_pitfalls: 'DML xatolari: max(id) va ixtiyoriy tartib',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'RETURNING standarti hamma ma’lumotlar bazasida bir xil emas: PostgreSQL va SQLite uni qo‘llab-quvvatlasa-da, MySQL da u umuman mavjud emas.'],

    ['L2', 'mysql_no_returning', 'MySQL da RETURNING yozish sintaktik xato beradi. Uning o‘rniga LAST_INSERT_ID funksiyasi orqali yangi yaratilgan ID olinadi.'],

    ['L3', 'mysql_pitfalls', 'Biroq MySQL da ko‘p qatorli INSERT da LAST_INSERT_ID faqat eng birinchi ID ni qaytaradi, ROW_COUNT esa faqat haqiqatda o‘zgargan qatorlarni sanaydi.'],

    ['L4', 'sqlite_returning', 'SQLite 3.35 versiyasidan boshlab RETURNING qo‘shilgan, lekin uni CTE yoki subquery ichiga yo‘naltirib bo‘lmaydi va natija tartibi ixtiyoriydir.'],

    ['L5', 'dml_pitfalls', 'Maksimal ID ga tayanish yoki SQLite da natija qatorlari kiritilgan tartibda keladi deb o‘ylash ilovada yashirin xatolarni keltirib chiqaradi.'],

    ['L6', 'xulosa', 'Har bir tizimning ID generatsiya qilish va o‘zgarishlarni qaytarish mantig‘ini chuqur bilish ishonchli arxitektura qurishning poydevoridir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

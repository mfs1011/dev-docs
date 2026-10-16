// SQL 18-bob, 3-video: "Dialektlar" — MySQL va SQLite da DML O'ziga Xosliklari
(function (g) {
  const scenes = ['intro', 'mysql_join_update', 'mysql_order_limit', 'sqlite_update_from', 'dml_pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: INSERT, UPDATE va DELETE farqlari',
    mysql_join_update: 'MySQL: UPDATE JOIN va qat’iy INSERT',
    mysql_order_limit: 'MySQL: ORDER BY LIMIT va VALUES ROW',
    sqlite_update_from: 'SQLite: UPDATE FROM va DELETE cheklovlari',
    dml_pitfalls: 'DML Tuzoqlari va WHERE siz UPDATE',
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
    ['L1', 'intro', 'DML buyruqlari standart bo‘lsa-da, ko‘p jadvalli yangilash, qiymatlar sintaksisi va cheklovlar MySQL hamda SQLite da jiddiy farq qiladi.'],

    ['L2', 'mysql_join_update', 'MySQL da INSERT da to‘liq bo‘lmagan qiymatlar xato beradi. Ko‘p jadvalli yangilashda esa FROM o‘rniga to‘g‘ridan-to‘g‘ri UPDATE JOIN sintaksisi ishlatiladi.'],

    ['L3', 'mysql_order_limit', 'MySQL ning o‘ziga xos afzalligi — bitta jadvalli UPDATE va DELETE da ORDER BY hamda LIMIT qo‘yish mumkin. VALUES buyrug‘ida esa har qatorga ROW so‘zi talab etiladi.'],

    ['L4', 'sqlite_update_from', 'SQLite da UPDATE FROM PostgreSQL kabi qo‘llab-quvvatlanadi, lekin DELETE USING umuman yo‘q va uning o‘rniga subquery yozish lozim.'],

    ['L5', 'dml_pitfalls', 'Barcha tizimlarda WHERE siz UPDATE jadvaldagi hamma qatorni o‘zgartiradi, qat’iy rejimda esa NOT NULL ustunga NULL yozish xatolik beradi.'],

    ['L6', 'xulosa', 'PostgreSQL dagi moslashuvchan FROM va USING, MySQL dagi UPDATE JOIN hamda SQLite dagi subquery usullarini bilish ko‘p platformali SQL ustasining belgisidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

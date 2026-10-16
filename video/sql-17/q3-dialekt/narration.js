// SQL 17-bob, 3-video: "Dialektlar" — MySQL va SQLite da View Xususiyatlari
(function (g) {
  const scenes = ['intro', 'mysql_views', 'mysql_broken_views', 'mysql_fake_matview', 'sqlite_views', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: View va Materialized View farqlari',
    mysql_views: 'MySQL: CASCADED CHECK OPTION va yangilanish',
    mysql_broken_views: 'MySQL: Bog‘liqlik tekshiruvi yo‘qligi',
    mysql_fake_matview: 'MySQL Community: Materialized view yo‘qligi',
    sqlite_views: 'SQLite: Faqat o‘qish va INSTEAD OF trigger',
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
    ['L1', 'intro', 'View va Materialized View tushunchalari MySQL hamda SQLite tizimlarida o‘ziga xos cheklovlar va qiziq farqlarga ega.'],

    ['L2', 'mysql_views', 'MySQL da viewlar faqat asosiy jadval bilan birga-bir mos kelgandagina yangilanadi. WITH CHECK OPTION esa sukut bo‘yicha CASCADED bo‘lib, barcha qavatlarga tarqaladi.'],

    ['L3', 'mysql_broken_views', 'Xavfli farq: MySQL da view ishlatayotgan ustunni o‘chirib yuborish mumkin! Natijada baza xato bermaydi, lekin view chaqirilganda buzilib qoladi.'],

    ['L4', 'mysql_fake_matview', 'MySQL Community da CREATE MATERIALIZED VIEW buyrug‘i qabul qilinsa ham, u oddiy viewdek ishlaydi, REFRESH esa sintaktik xato beradi.'],

    ['L5', 'sqlite_views', 'SQLite da viewlar qat’iy ravishda faqat o‘qish uchun. Lekin INSTEAD OF triggerlar yordamida view orqali jadvalga yozish imkoniyatini hosil qilish mumkin.'],

    ['L6', 'xulosa', 'PostgreSQL dagi qat’iy bog‘liqlik va to‘liq Materialized View, MySQL dagi CASCADED tekshiruv hamda SQLite dagi INSTEAD OF triggerlarni to‘g‘ri farqlash zarur.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 10-bob, 3-video: "Dialektlar" — PostgreSQL vs MySQL vs SQLite
(function (g) {
  const scenes = ['intro', 'mysql_null', 'mysql_trap', 'sqlite_strict', 'pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'Uch tizim: PostgreSQL, MySQL va SQLite taqqoslashi',
    mysql_null: 'MySQL: NULL-xavfsiz tenglik va CONCAT',
    mysql_trap: 'MySQL: Satr va nol tuzog‘i',
    sqlite_strict: 'SQLite: Dynamic affinity va STRICT jadvallar',
    pitfalls: 'Oltita xavfli amaliy tuzoq',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L6: 1.0,
    L8: 1.0,
    L9: 1.0,
    L10: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda NULL va tip konversiyasining PostgreSQL, MySQL hamda SQLite tizimlaridagi tub farqlari va amaliy tuzoqlarini ko‘ramiz.'],

    ['L2', 'mysql_null', 'MySQL da IS NOT DISTINCT FROM o‘rniga maxsus tenglik qushchasi, ya’ni <=> operatori ishlatiladi. NULL bilan NULL solishtirilganda u bir, ya’ni rost beradi.'],
    ['L3', 'mysql_null', 'Ammo MySQL da konkat funksiyasiga NULL kelsa, butun natija NULL ga aylanadi. PostgreSQL da esa NULL e’tiborsiz qoldirilar edi.'],

    ['L4', 'mysql_trap', 'Eng dahshatli tuzoq: MySQL da matnli ustun son bilan solishtirilsa, barcha matnlar kasr son sifatida o‘qiladi.'],
    ['L5', 'mysql_trap', 'Masalan, WHERE satr barobar nol deb yozilsa, uzum ham, olma ham nolga aylanib, barcha qatorlar chiqib ketadi va indeks umuman ishlamaydi!'],
    ['L6', 'mysql_trap', 'MySQL da kast amali ham cheklangan: integer o‘rniga SIGNED yoziladi, uch butun o‘ndan yetti esa to‘rtga yaxlitlanadi.'],

    ['L7', 'sqlite_strict', 'SQLite da esa tiplar afiniti orqali boshqariladi. Matndan songa kast qilinganda qirq ikki satridan boshidagi son olinib, matn qismi kesib tashlanadi.'],
    ['L8', 'sqlite_strict', 'Yaxshiyamki, SQLite ning yangi versiyalarida STRICT jadvallar mavjud bo‘lib, noto‘g‘ri kiritilgan ma’lumotlarni Postgres kabi rad etadi.'],

    ['L9', 'pitfalls', 'Xulosa qilib aytganda, oltita xavfli tuzoqdan saqlaning: ustun barobar NULL yozmang, qatorlarni sanashda count yulduzchadan foydalaning, va MySQL da satrni songa solishtirmang.'],
    ['L10', 'xulosa', 'NULL qiymatlarini to‘g‘ri boshqarish ma’lumotlar bazangizning ishonchli va xatosiz ishlashining garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

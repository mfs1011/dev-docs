// SQL 20-bob, 3-video: "Dialektlar" — MySQL va SQLite da UPSERT O'ziga Xosliklari
(function (g) {
  const scenes = ['intro', 'mysql_duplicate_key', 'mysql_replace_trap', 'sqlite_upsert', 'dml_pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'MySQL va SQLite da UPSERT farqlari',
    mysql_duplicate_key: 'MySQL: ON DUPLICATE KEY UPDATE',
    mysql_replace_trap: 'MySQL tuzoqlari: REPLACE va AUTO_INCREMENT',
    sqlite_upsert: 'SQLite: ON CONFLICT va bir nechta maqsad',
    dml_pitfalls: 'DML xatolari: REPLACE va WHERE true zarurati',
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
    ['L1', 'intro', 'UPSERT buyrug‘i har bir ma’lumotlar bazasida turlicha amalga oshirilgan: MySQL o‘z sintaksisiga ega, SQLite esa PostgreSQL andozasiga amal qiladi.'],

    ['L2', 'mysql_duplicate_key', 'MySQL da MERGE yo‘q, uning o‘rniga INSERT ON DUPLICATE KEY UPDATE ishlatiladi. Yangi qiymatlarga VALUES qavsi o‘rnida yangi AS new taxallusi orqali murojaat qilinadi.'],

    ['L3', 'mysql_replace_trap', 'MySQL dagi REPLACE buyrug‘i mavjud qatorni o‘chirib qayta yozadi. Bu esa avtomatik ID ni o‘zgartiradi va tashqi kalit bog‘lanishlarini buzib yuboradi.'],

    ['L4', 'sqlite_upsert', 'SQLite da esa PostgreSQL kabi ON CONFLICT ishlaydi, qo‘shimcha ravishda bir nechta konflikt maqsadlarini ketma-ket tekshirish imkoniyati ham bor.'],

    ['L5', 'dml_pitfalls', 'REPLACE ni oddiy yangilash deb o‘ylash yoki SQLite da INSERT SELECT ortidan WHERE true qo‘ymaslik ko‘p uchraydigan sintaktik va mantiqiy xatolardir.'],

    ['L6', 'xulosa', 'Har bir tizimning konfliktlarni hal qilish va ID hisoblagichlarini boshqarish qoidalarini bilish barqaror ma’lumotlar bazasini yaratishning kalitidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

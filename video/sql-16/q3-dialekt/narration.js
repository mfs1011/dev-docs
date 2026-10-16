// SQL 16-bob, 3-video: "Dialektlar" — MySQL va SQLite da Jadvalni O'zgartirish
(function (g) {
  const scenes = ['intro', 'mysql_instant', 'mysql_implicit_commit', 'sqlite_limits', 'sqlite_12_steps', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: ALTER TABLE farqlari',
    mysql_instant: 'MySQL: MODIFY COLUMN va INSTANT DDL',
    mysql_implicit_commit: 'MySQL: Yashirin COMMIT va TRUNCATE',
    sqlite_limits: 'SQLite: Cheklangan ALTER TABLE',
    sqlite_12_steps: 'SQLite: 12 qadamli jadval qayta qurish',
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
    ['L1', 'intro', 'Jadvallarni o‘zgartirish va DDL amallari PostgreSQL, MySQL hamda SQLite da jiddiy arxitektura farqlariga ega.'],

    ['L2', 'mysql_instant', 'MySQL da ustun tipi MODIFY COLUMN bilan bir yo‘la o‘zgartiriladi va avto-konversiya qilinadi. ALGORITHM INSTANT esa ustunni jadvalni qayta yozmasdan bir lahzada qo‘shadi.'],

    ['L3', 'mysql_implicit_commit', 'Eng muhim farq: MySQL da DDL amallari faol tranzaksiyani yashirin commit qiladi. Shuningdek TRUNCATE ham DDL bo‘lib orqaga qaytmaydi, DROP CASCADE esa hech narsa qilmaydi.'],

    ['L4', 'sqlite_limits', 'SQLite da ALTER TABLE juda cheklangan, chunki sxema oddiy matn sifatida saqlanadi. ADD COLUMN da UNIQUE yoki ifodali DEFAULT qo‘yib bo‘lmaydi, TRUNCATE esa umuman mavjud emas.'],

    ['L5', 'sqlite_12_steps', 'SQLite da ustun tipini o‘zgartirish uchun hujjat 12 qadamli usulni tavsiya qiladi: yangi jadval ochish, ma’lumotni ko‘chirish, eskisini o‘chirib nomini qaytarish va indekslarni tiklash.'],

    ['L6', 'xulosa', 'PostgreSQL dagi tranzaksiyaviy DDL, MySQL dagi instant tezlik va SQLite dagi 12 qadamli tartibni bilish professional migratsiyalarning poydevoridir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

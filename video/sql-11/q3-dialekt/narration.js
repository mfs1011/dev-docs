// SQL 11-bob, 3-video: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function (g) {
  const scenes = ['intro', 'mysql_utf8', 'mysql_ci', 'sqlite_nocase', 'pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'Uch tizim: Kodlash va collation solishtiruvi',
    mysql_utf8: 'MySQL: utf8mb4 va eskirgan utf8mb3 xatosi',
    mysql_ci: 'MySQL: Sukut bo‘yicha katta-kichik harfsiz mantiq',
    sqlite_nocase: 'SQLite: NOCASE va faqat ASCII upper()',
    pitfalls: 'Oltita xavfli amaliy tuzoq',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L5: 1.0,
    L7: 1.0,
    L8: 1.0,
    L9: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda kodlash va kollatsiyaning uchala tizimdagi tub farqlari va amaliy tuzoqlarini tahlil qilamiz.'],

    ['L2', 'mysql_utf8', 'MySQL da juda ehtiyot bo‘lish kerak: oddiy utf8 nomi eskirgan utf8mb3 ni bildiradi va emojilarni saqlay olmay xato beradi.'],
    ['L3', 'mysql_utf8', 'Zamonaviy loyihalarda doimo to‘liq to‘rt baytli utf8mb4 kodlashini ishlatish shart.'],

    ['L4', 'mysql_ci', 'Eng katta farq: MySQL sukut bo‘yicha katta-kichik harfga ham, urg‘uga ham sezgir emas! Katta Salom bilan kichik salom darhol teng deb topiladi.'],
    ['L5', 'mysql_ci', 'Shuning uchun MySQL da elektron pochtaga UNIQUE qo‘yilsa, katta va kichik harfli manzillarni bir xil deb rad etadi.'],

    ['L6', 'sqlite_nocase', 'SQLite da esa faqat uchta ichki kollatsiya mavjud: BINARY, NOCASE va RTRIM.'],
    ['L7', 'sqlite_nocase', 'Diqqat qiling: SQLite ning NOCASE va upper funksiyalari faqat ASCII harflarini taniydi, o‘zbekcha va boshqa Unicode harflarini o‘zgartira olmaydi.'],

    ['L8', 'pitfalls', 'Xulosa qilib aytganda: MySQL da utf8mb4 ni tanlang, o‘zbekcha saralashda PostgreSQL ning ICU kollatsiyasidan foydalaning, va SQLite da Unicode amallarini ilova darajasida bajaring.'],
    ['L9', 'xulosa', 'To‘g‘ri sozlangan kodlash va kollatsiya matnlaringiz butunligi va qidiruv aniqligining asosidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

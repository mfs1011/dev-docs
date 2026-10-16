// SQL 12-bob, 3-video: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function (g) {
  const scenes = ['intro', 'mysql_expr', 'mysql_features', 'sqlite_defaults', 'pitfalls', 'xulosa'];
  const sceneNames = {
    intro: 'Uch tizim: Jadvallar va DEFAULT solishtiruvi',
    mysql_expr: 'MySQL: Qavsli ifodalar va TEXT/BLOB DEFAULT qoidasi',
    mysql_features: 'MySQL: INVISIBLE ustunlar va indekslarni nusxalash',
    sqlite_defaults: 'SQLite: rowid va randomblob DEFAULT amaliyoti',
    pitfalls: 'Oltita xavfli amaliy tuzoq',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L5: 1.0,
    L6: 1.0,
    L7: 1.0,
    L8: 1.0,
    L9: 0.8
  };
  const lines = [
    ['L1', 'intro', 'O‘n ikkinchi bobning uchinchi qismida MySQL va SQLite dagi CREATE TABLE hamda DEFAULT farqlari va amaliy tuzoqlarini tahlil qilamiz.'],

    ['L2', 'mysql_expr', 'MySQL da juda qat\'iy sintaksis mavjud: DEFAULT ga hisoblanuvchi ifoda yozilganda, uni albatta qavs ichiga olish shart, aks holda sintaksis xatosi beradi.'],
    ['L3', 'mysql_expr', 'Shuningdek, TEXT, BLOB va JSON ustunlariga hatto oddiy matnli sukut qiymati berilganda ham u doimo ifoda sifatida qavs ichida yozilishi shart.'],

    ['L4', 'mysql_features', 'Yana bir qulaylik: MySQL da ustunlarni INVISIBLE qilib yashirish mumkin, bu esa yulduzcha so‘rovlarida eski ilovalarni buzilmasdan saqlaydi.'],
    ['L5', 'mysql_features', 'Muhim farq: MySQL ning LIKE buyrug‘i PostgreSQL dan farqli o‘laroq indekslarni qo‘shimcha kalitlarsiz avtomatik nusxalaydi.'],

    ['L6', 'sqlite_defaults', 'SQLite da esa har bir jadvalda yashirin rowid ustuni mavjud bo‘lib, DEFAULT ifodalarida randomblob va joriy UTC vaqtidan foydalanish mumkin.'],

    ['L7', 'pitfalls', 'Diqqat qiling: jadvallar orasida migratsiya qilishda MySQL dagi qavslar, SQLite ning rowid xususiyati va birlamchi kalitsiz qatorlar dublikati eng ko‘p uchraydigan xatolardir.'],
    ['L8', 'pitfalls', 'Xulosa qilib aytganda: jadval yaratishda doimo birlamchi kalit qo‘ying, DEFAULT ifodalarini qavsga oling, va kesh jadvallarida UNLOGGED imkoniyatidan unumli foydalaning.'],

    ['L9', 'xulosa', 'Har uchala tizimning o‘ziga xos xususiyatlarini bilish ishonchli va ko‘chma arxitektura qurish poydevoridir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 5-bob, 3-video: "Dialektlar" — MySQL (baza = sxema), SQLite (ATTACH) va 6 ta tipik xato
(function (g) {
  const scenes = ['intro', 'mysql', 'sqlite', 'comparison', 'traps', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    mysql: 'MySQL: Baza va sxema bir narsa',
    sqlite: 'SQLite: Fayl = Baza va ATTACH',
    comparison: 'Uch tizim taqqoslash taxtasi',
    traps: '6 ta tipik xato',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L5: 1.0,
    L8: 1.0,
    L12: 1.0,
    L18: 1.0,
    L20: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Beshinchi bobning uchinchi qismida PostgreSQL, MySQL va SQLite tizimlarida baza va sxema tushunchalarining keskin farqlarini, hamda oltita xavfli xatoni ko‘rib chiqamiz.'],

    ['L2', 'mysql', 'MySQL da sxema va baza bu aynan bir narsadir. Tizimda CREATE SCHEMA buyrug‘i CREATE DATABASE ning oddiy sinonimi hisoblanadi.'],
    ['L3', 'mysql', 'MySQL ierarxiyasida PostgreSQL dagi alohida baza qatlami yo‘q: server ichida bazalar, ularning ichida esa bevosita jadvallar joylashadi.'],
    ['L4', 'mysql', 'Eng muhim qulaylik: MySQL da bitta ulanish orqali istalgan bazadagi jadvallarni bir-biri bilan bemalol JOIN qilish mumkin!'],
    ['L5', 'mysql', 'Shuningdek, MySQL da search_path yo‘q: qisqa nomlar bilan ishlash uchun USE baza buyrug‘i bilan joriy baza tanlanishi shart, aks holda No database selected xatosi chiqadi.'],

    ['L6', 'sqlite', 'SQLite da esa ma’lumotlar bazasi diskdagi alohida bitta fayldir. Bu yerda sxema tushunchasi faylni ulash, ya’ni ATTACH orqali amalga oshiriladi.'],
    ['L7', 'sqlite', 'Bitta ulanishga bir nechta faylni ATTACH qilib, ularni alohida sxemalar sifatida ishlatish va bitta so‘rovda birlashtirish mumkin.'],
    ['L8', 'sqlite', 'SQLite da har doim main nomli asosiy fayl va temp nomli vaqtinchalik xotira mavjud bo‘ladi.'],

    ['L9', 'comparison', 'Uchala tizimni solishtirsak: PostgreSQL da to‘liq to‘rt bosqichli ierarxiya, MySQL da baza va sxema tengligi, SQLite da esa fayllarni ulash arxitekturasi qo‘llangan.'],
    ['L10', 'comparison', 'PostgreSQL da bitta ulanish bitta bazaga cheklangan bo‘lsa, MySQL va SQLite da ulanish ichida boshqa bazalarga murojaat qilish ochiq.'],
    ['L11', 'comparison', 'Yangi baza yaratishda ham farq katta: PostgreSQL template1 dan nusxa oladi, MySQL diskda yangi papka ochadi, SQLite esa yangi fayl yaratadi.'],

    ['L12', 'traps', 'Endi amaliyotdagi eng ko‘p uchraydigan oltita tipik xatoni ko‘rib chiqamiz.'],
    ['L13', 'traps', 'Birinchi xato: PostgreSQL da har modul uchun alohida baza ochib, keyin ular orasida JOIN qilmoqchi bo‘lish. Bog‘liq qismlarni bitta bazada, alohida sxemalarga ajrating.'],
    ['L14', 'traps', 'Ikkinchi xato: template1 shabloniga sinov jadvalini qo‘shib qo‘yish. Bu jadval keyingi barcha yangi bazalarga o‘tib ketadi.'],
    ['L15', 'traps', 'Uchinchi xato: zaxira nusxani template1 dan yaratilgan bazaga tiklash. Toza tiklash uchun template0 dan foydalaning.'],
    ['L16', 'traps', 'To‘rtinchi xato: search_path ga boshqalar yoza oladigan sxemalarni qo‘shish. Bu xavfli kod ijrosiga olib kelishi mumkin.'],
    ['L17', 'traps', 'Beshinchi xato: o‘z jadvallaringizni pi-ji prefiksi bilan nomlash. Tizim jadvallari bilan to‘qnashuv kelib chiqadi.'],
    ['L18', 'traps', 'Oltinchi xato: MySQL da USE qilmasdan qisqa nom ishlatish.'],

    ['L19', 'xulosa', 'Shu bilan baza, sxema va jadval ierarxiyasini to‘liq o‘rganib chiqdik.'],
    ['L20', 'xulosa', 'Keyingi oltinchi bobda SQL dagi barcha raqamli ma’lumot turlarini batafsil tahlil qilamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

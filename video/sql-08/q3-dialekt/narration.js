// SQL 8-bob, 3-video: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function (g) {
  const scenes = ['intro', 'mysql_dt_ts', 'mysql_tuzoq', 'sqlite_tiplar', 'sqlite_tuzoq', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Har bir bazaning o‘z dunyosi',
    mysql_dt_ts: 'MySQL: DATETIME va TIMESTAMP farqi',
    mysql_tuzoq: 'MySQL dagi 3 ta xavfli tuzoq',
    sqlite_tiplar: 'SQLite: Maxsus tip yo‘q, 3 ta saqlash klassi',
    sqlite_tuzoq: 'SQLite dagi g‘aroyib holatlar va matn tuzog‘i',
    xulosa: 'Taqqoslash jadvali va yakuniy xulosalar'
  };
  const hold = {
    L2: 0.8,
    L4: 1.0,
    L7: 1.0,
    L10: 1.0,
    L13: 1.0,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Uchinchi qismda MySQL va SQLite da sana va vaqt qanday saqlanishi, hamda amaliyotda eng ko‘p uchraydigan oltita jiddiy tuzoqni ko‘rib chiqamiz.'],
    ['L2', 'intro', 'Har bir baza vaqtga turlicha yondashadi: PostgreSQL boy va qat’iy standartlarga ega bo‘lsa, MySQL va SQLite o‘ziga xos qoidalar va kutilmagan fe’l-atvorga ega.'],

    ['L3', 'mysql_dt_ts', 'MySQL da ikkita asosiy tur bor: DATETIME va TIMESTAMP. DATETIME mahalliy vaqtni mintaqasiz saqlaydi.'],
    ['L4', 'mysql_dt_ts', 'TIMESTAMP esa xuddi timestamptz kabi kiritishda u-te-se ga o‘girilib saqlanadi va o‘qishda seans mintaqasiga qaytariladi. Ammo uning ulkan muammosi bor!'],

    ['L5', 'mysql_tuzoq', 'Birinchi tuzoq: TIMESTAMP o‘ttiz ikki bitli son bo‘lgani uchun ikki ming o‘ttiz sakkizinchi yil o‘n to‘qqizinchi yanvardan keyingi vaqtni mutlaqo saqlay olmaydi va xato beradi!'],
    ['L6', 'mysql_tuzoq', 'Ikkinchi tuzoq: MySQL da INTERVAL ma’lumot turi emas. Uni jadval ustuni sifatida yaratib bo‘lmaydi — sintaktik xato chiqadi.'],
    ['L7', 'mysql_tuzoq', 'Uchinchi tuzoq: MySQL da sekund kasrlari sukut bo‘yicha nolga teng. Agar DATETIME ustuniga millisekundlar yuborsangiz, ular xabarsiz keyingi sekundga yaxlitlab yuboriladi!'],

    ['L8', 'sqlite_tiplar', 'Endi SQLite ga qarasak: unda sana va vaqt uchun umuman alohida ma’lumot turi yo‘q!'],
    ['L9', 'sqlite_tiplar', 'Sana uch xil saqlanadi: ISO matni TEXT sifatida, Julian kuni REAL sifatida, yoki u-te-se soniyalari INTEGER sifatida.'],
    ['L10', 'sqlite_tiplar', 'Baza ularni date, time, datetime va unixepoch kabi o‘rnatilgan maxsus funksiyalar orqali bir-biriga o‘girib beradi.'],

    ['L11', 'sqlite_tuzoq', 'To‘rtinchi tuzoq: SQLite da o‘ttiz birinchi yanvarga bir oy qo‘shsangiz, sukut bo‘yicha siling rejimi ishlab uchinchi mart chiqadi! Fevralning oxirgi kuni kerak bo‘lsa floor modifikatorini berish shart.'],
    ['L12', 'sqlite_tuzoq', 'Beshinchi tuzoq: SQLite mavjud bo‘lmagan sanalarda xato bermaydi: yigirma oltinchi yil o‘ttizinchi fevral jimgina ikkinchi martga aylanib ketadi!'],
    ['L13', 'sqlite_tuzoq', 'Oltinchi va eng xavfli tuzoq: matn sifatida solishtirish. Agar sanani nolsiz yozsangiz, matn tartibi buzilib o‘ninchi oy to‘qqizinchi oydan kichik bo‘lib qoladi!'],

    ['L14', 'xulosa', 'Xulosa qilib aytganda: PostgreSQL eng xavfsiz va aniq baza. MySQL da TIMESTAMP ning yigirma o‘ttiz sakkiz yil chegarasidan ehtiyot bo‘ling.'],
    ['L15', 'xulosa', 'SQLite da esa sanalarni doimo qat’iy ISO formatida saqlang va solishtirishlarda ehtiyotkor bo‘ling.'],
    ['L16', 'xulosa', 'Shu bilan sana va vaqt mavzusi yakunlandi. Keyingi bobda mantiqiy boolean, UUID va enum turlari bilan tanishamiz!']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

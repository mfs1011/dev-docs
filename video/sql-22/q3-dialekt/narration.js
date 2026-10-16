// SQL 22-bob, 3-video: "Dialektlar" — MySQL va SQLite da SELECT O'ziga Xosliklari
(function (g) {
  const scenes = ['intro', 'mysql_having_alias', 'mysql_dual_table', 'sqlite_where_alias', 'sqlite_caveats', 'xulosa'];
  const sceneNames = {
    intro: 'MySQL va SQLite da SELECT farqlari',
    mysql_having_alias: 'MySQL da HAVING va aliaslar',
    mysql_dual_table: 'MySQL FROM DUAL va soxta jadvallar',
    sqlite_where_alias: 'SQLite da kutilmagan qulaylik: WHERE da alias',
    sqlite_caveats: 'SQLite hisob-kitoblari va portabellik xavfi',
    xulosa: 'Uch tizim qiyosiy xulosasi'
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
    ['L1', 'intro', 'SELECT ning mantiqiy bajarilish tartibi har bir ma’lumotlar bazasida o‘ziga xos farqlarga ega: ayniqsa aliaslarni qo‘llash va xatolarni boshqarishda.'],

    ['L2', 'mysql_having_alias', 'MySQL da alias WHERE da ishlamasa ham, HAVING, GROUP BY va ORDER BY bandlarida bemalol qo‘llanilishi mumkin; lekin unda DISTINCT ON mavjud emas.'],

    ['L3', 'mysql_dual_table', 'Shuningdek, MySQL jadvalsiz hisob-kitoblar uchun an’anaviy DUAL soxta jadvalini qo‘llab-quvvatlaydi, garchi zamonaviy talqinlarda u majburiy bo‘lmasa ham.'],

    ['L4', 'sqlite_where_alias', 'Qizig‘i shundaki, SQLite aliaslarni ham WHERE, ham HAVING shartlarida to‘g‘ridan-to‘g‘ri qabul qiladi; ammo bu standart emas va boshqa bazalarda ishlamaydi.'],

    ['L5', 'sqlite_caveats', 'SQLite da hisoblashlar taqribiy reallikda bajarilishi mumkin, va SQLite ga xos qoidalarga tayanish loyihani PostgreSQL ga ko‘chirishda jiddiy qiyinchilik tug‘diradi.'],

    ['L6', 'xulosa', 'Doimo SQL standartiga mos yozish, har bir ustunga aniq AS bilan nom berish va tizimlararo farqlarni bilish barqaror dasturiy ta’minot yaratish garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

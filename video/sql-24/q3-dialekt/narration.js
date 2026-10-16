// SQL 24-bob, 3-video: "Dialektlar" — MySQL va SQLite da Saralash Farqlari
(function (g) {
  const scenes = ['intro', 'mysql_nulls_order', 'mysql_limit_syntax', 'sqlite_nulls_limit', 'comparison_matrix', 'xulosa'];
  const sceneNames = {
    intro: 'MySQL va SQLite da saralash farqlari',
    mysql_nulls_order: 'MySQL: NULL eng kichik va IS NULL usuli',
    mysql_limit_syntax: 'MySQL: LIMIT m, n va FETCH yo‘qligi',
    sqlite_nulls_limit: 'SQLite: NULLS LAST va manfiy LIMIT',
    comparison_matrix: 'Uch tizimning saralash solishtiruvi',
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
    ['L1', 'intro', 'Saralash va cheklash qoidalari MySQL va SQLite tizimlarida jiddiy farqlanadi: eng katta farq NULL qiymatlarning tartibidagi teskarilikdir.'],

    ['L2', 'mysql_nulls_order', 'MySQL da NULL har doim eng kichik qiymat hisoblanadi va unda NULLS LAST yo‘qligi sababli ifoda orqali IS NULL bilan saralashga to‘g‘ri keladi.'],

    ['L3', 'mysql_limit_syntax', 'Shuningdek, MySQL da LIMIT ikki son bilan yozilganda birinchi son ofset ekanini unutmaslik kerak; standartdagi FETCH FIRST esa unda mavjud emas.'],

    ['L4', 'sqlite_nulls_limit', 'SQLite ham NULL ni eng kichik deb biladi, ammo u zamonaviy NULLS LAST sintaksisini hamda manfiy cheklovlarni to‘liq qabul qiladi.'],

    ['L5', 'comparison_matrix', 'Barcha tizimlarda sahifalash doimo noldan boshlanuvchi ofsetga asoslanadi va ikkinchi aniqlovchi ustun bilan mustahkamlanishi shart.'],

    ['L6', 'xulosa', 'Doimo tizimning NULL ga munosabatini tekshirish, standart LIMIT OFFSET dan foydalanish va qat’iy tartib loyihaning xatosiz ishlashini ta’minlaydi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

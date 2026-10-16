// SQL 24-bob, 1-video: "Tushuncha" — ORDER BY, LIMIT va Sahifalash Asoslari
(function (g) {
  const scenes = ['intro', 'asc_desc_rules', 'nulls_position', 'limit_offset', 'with_ties_standart', 'xulosa'];
  const sceneNames = {
    intro: 'Nega tartib kafolatlanmaydi?',
    asc_desc_rules: 'ASC va DESC qoidalari',
    nulls_position: 'PostgreSQL da NULL ning o‘rni',
    limit_offset: 'LIMIT va OFFSET qoidalari',
    with_ties_standart: 'FETCH FIRST va WITH TIES standarti',
    xulosa: 'Saralashning oltin qoidalari'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.2,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'SQL jadvallardagi qatorlar tartibini kafolatlamaydi: kerakli natija ketma-ketligini olishning yagona yo‘li — bu ORDER BY bandidan aniq foydalanishdir.'],

    ['L2', 'asc_desc_rules', 'ASC o‘sish, DESC esa kamayish tartibini belgilaydi; bir nechta ustun ko‘rsatilganda DESC faqat o‘zi biriktirilgan ustungagina ta’sir qiladi.'],

    ['L3', 'nulls_position', 'PostgreSQL da NULL har doim eng katta qiymat sanaladi, shuning uchun kamayish tartibida noma’lum qiymatlar ro‘yxat boshiga chiqib qolmasligi uchun NULLS LAST yoziladi.'],

    ['L4', 'limit_offset', 'LIMIT va OFFSET natijani sahifalash uchun ishlatiladi, ammo saralashsiz LIMIT qo‘llash mutlaqo noaniq va tasodifiy qatorlarni qaytaradi.'],

    ['L5', 'with_ties_standart', 'SQL standarti bo‘lgan FETCH FIRST va WITH TIES konstruksiyasi esa oxirgi o‘rinni teng egallagan barcha qatorlarni adolatli kiritish imkonini beradi.'],

    ['L6', 'xulosa', 'Sahifalashda doimo barqaror tartibni ta’minlash, NULL o‘rnini to‘g‘ri belgilash va katta ofsetlar unumdorlikni tushirishini bilish muvaffaqiyat garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

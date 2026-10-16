// SQL 15-bob, 1-video: "Tushuncha" — Generated ustunlar
(function (g) {
  const scenes = ['intro', 'turlar', 'default_solishtirish', 'cheklovlar', 'xulosa'];
  const sceneNames = {
    intro: 'Generated ustunlar tushunchasi',
    turlar: 'Virtual va Stored turlari',
    default_solishtirish: 'DEFAULT bilan taqqoslash',
    cheklovlar: 'Asosiy qoidalar va cheklovlar',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Generated ustun — qiymati doim shu qatordagi boshqa ustunlar asosida avtomatik hisoblab chiqariladigan maxsus ustundir. Masalan, mahsulot narxi va sonidan umumiy summani baza o‘zi hisoblaydi.'],

    ['L2', 'turlar', 'Uning ikki turi mavjud: Stored ustun diskda joy egallaydi va qator yozilganda hisoblanadi. Virtual ustun esa joy egallamaydi va qator o‘qilganda hisoblanadi. PostgreSQL 18 dan boshlab sukut bo‘yicha Virtual qo‘llanadi.'],

    ['L3', 'default_solishtirish', 'DEFAULT faqat qator yaratilganda bir marta ishlaydi va unga qo‘lda qiymat yozish mumkin. Generated ustunga esa qo‘lda qiymat yozib bo‘lmaydi va u asosiy ustunlar o‘zgarganda doimiy yangilanib turadi.'],

    ['L4', 'cheklovlar', 'Muhim cheklov shuki, ifoda faqat o‘zgarmas funksiyalardan iborat bo‘lishi shart, ya\'ni now() kabi o‘zgaruvchan funksiyalar taqiqlanadi. Shuningdek boshqa generated ustunga murojaat qilish ham mumkin emas.'],

    ['L5', 'xulosa', 'Hisoblanadigan ustunlardan to‘g‘ri foydalanish ma\'lumotlar yaxlitligini ta\'minlaydi va ilova kodidagi ortiqcha mantiqni qisqartiradi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 14-bob, 2-video: "Kod" — PostgreSQL 18 da Cheklovlar amaliyoti
(function (g) {
  const scenes = ['intro', 'check_demo', 'unique_demo', 'fk_demo', 'deferrable_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Cheklovlar amaliyoti',
    check_demo: 'CHECK xatolari va NULL qabul qilinishi',
    unique_demo: 'UNIQUE va NULLS NOT DISTINCT',
    fk_demo: 'FOREIGN KEY: CASCADE va RESTRICT sinovi',
    deferrable_demo: 'DEFERRABLE bilan aylana bog‘lanish',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L4: 1.0,
    L5: 1.0,
    L6: 1.0,
    L7: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda PostgreSQL o‘n sakkiz terminalida CHECK xatolari, NULL holatlari, ON DELETE kaskadlari va kechiktiriladigan cheklovlarni jonli sinovdan o‘tkazamiz.'],

    ['L2', 'check_demo', 'Mahsulotlar jadvaliga manfiy narx yozganimizda musbat_narx cheklovi ishga tushadi, narx chegirmadan kichik bo‘lib qolsa esa jadval darajasidagi cheklov qat\'iy to‘xtatadi.'],
    ['L3', 'check_demo', 'E\'tibor bering: narx o‘rniga NULL kiritganimizda CHECK hech qanday xato bermaydi va qator jimgina qabul qilinadi, bu esa NOT NULL cheklovi nima uchun shart ekanini yaqqol ko‘rsatadi.'],

    ['L4', 'unique_demo', 'UNIQUE ustunga bir nechta NULL yozish mumkin, ammo PostgreSQL o‘n beshdan boshlab NULLS NOT DISTINCT qo‘shilsa, ikkinchi NULL ham takror sifatida rad etiladi.'],

    ['L5', 'fk_demo', 'Tashqi kalit sinovida ota qator o‘chirilganda, ON DELETE CASCADE bola jadvaldagi bog‘liq qatorni avtomatik o‘chiradi, RESTRICT esa xatolik berib o‘chirishni taqiqlaydi.'],

    ['L6', 'deferrable_demo', 'Aylana bog‘liqlikda esa DEFERRABLE INITIALLY DEFERRED orqali tekshiruv COMMIT paytigacha kechiktiriladi va ikkala bog‘liq qator ham tranzaksiyada muvaffaqiyatli saqlanadi.'],

    ['L7', 'xulosa', 'Ushbu amaliy bilimlar orqali relyatsion bazangizda ma\'lumotlar sifatini yuqori darajada kafolatlay olasiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

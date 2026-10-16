// SQL 18-bob, 2-video: "Kod" — PostgreSQL 18 da DML Amaliyoti
(function (g) {
  const scenes = ['intro', 'insert_demo', 'update_simple', 'update_from', 'update_pitfall', 'delete_using_xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Amaliyotga kirish',
    insert_demo: 'INSERT ko‘rinishlari va sukut bo‘yicha qiymatlar',
    update_simple: 'UPDATE va mavjud bo‘lmagan qatorlar',
    update_from: 'UPDATE FROM: Boshqa jadval bilan yangilash',
    update_pitfall: 'Tuzoq: Birlashuvda ixtiyoriy qator tanlanishi',
    delete_using_xulosa: 'DELETE USING va Xulosa'
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 da INSERT ko‘rinishlari, UPDATE, UPDATE FROM, noaniq qator tanlanishi tuzog‘i hamda DELETE USING ni sinab ko‘ramiz.'],

    ['L2', 'insert_demo', 'ombor jadvaliga ustunlarni sanab hamda chapdan to‘ldirish bilan qatorlar kiritamiz. Ko‘rsatilmagan ustunlar sukut bo‘yicha nol qiymatini oladi.'],

    ['L3', 'update_simple', 'Narxlarni 10 foizga oshirishda WHERE narx > 0 shartini beramiz. Mavjud bo‘lmagan 42-mahsulotni yangilashda UPDATE 0 qaytadi va bu xato hisoblanmaydi.'],

    ['L4', 'update_from', 'Sotuvlar asosida ombor qoldig‘ini kamaytirish uchun UPDATE FROM va GROUP BY bilan jamlangan subquery ishlatamiz. Natijada Non va Tuz soni to‘g‘ri ayriladi.'],

    ['L5', 'update_pitfall', 'Agar jamlamasdan to‘g‘ridan-to‘g‘ri sotuvlar jadvalini ulasak, bitta mahsulotga ikkita qator mos kelib, ulardan ixtiyoriy biri jimgina tanlanadi.'],

    ['L6', 'delete_using_xulosa', 'DELETE USING bilan esa boshqa jadval shartiga qarab sotuvlar qatorlari tozalandi. Relyatsion bazada DML amallarini doimo kalit va aniq subquery bilan bajaring.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

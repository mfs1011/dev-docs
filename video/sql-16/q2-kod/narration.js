// SQL 16-bob, 2-video: "Kod" — PostgreSQL 18 da ALTER TABLE Amaliyoti
(function (g) {
  const scenes = ['intro', 'add_column_demo', 'type_using_demo', 'drop_cascade_demo', 'truncate_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Amaliyotga kirish',
    add_column_demo: 'ADD COLUMN: CHECK va NOT NULL DEFAULT',
    type_using_demo: 'Tipni o‘zgartirish va USING kaliti',
    drop_cascade_demo: 'Bog‘liqliklar va DROP CASCADE',
    truncate_demo: 'TRUNCATE va ROLLBACK xavfsizligi',
    xulosa: 'Xulosa'
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 terminalida ADD COLUMN, ALTER COLUMN TYPE va USING, DROP CASCADE hamda TRUNCATE buyruqlarini sinovdan o‘tkazamiz.'],

    ['L2', 'add_column_demo', 'mahsulotlar jadvaliga CHECK cheklovi bilan tavsif ustunini va NOT NULL DEFAULT 0 bilan soni ustunini qo‘shamiz. Yangi ustunlar mavjud qatorlarga ham xavfsiz biriktiriladi.'],

    ['L3', 'type_using_demo', 'narx ustunini matndan numeric ga o‘tkazishda to‘g‘ridan-to‘g‘ri o‘girib bo‘lmaslik xatosi chiqadi. Uni yechish uchun USING narx::numeric ifodasidan foydalanamiz.'],

    ['L4', 'drop_cascade_demo', 'Tashqi kalit bilan bog‘langan jadvalni oddiy DROP qilib bo‘lmaydi. Tranzaksiya ichida DROP CASCADE qilsak, bola jadval qolib, faqat cheklov o‘chishini ko‘rishimiz mumkin.'],

    ['L5', 'truncate_demo', 'Tashqi kaliti bor jadvalda TRUNCATE ham xato beradi. Shuningdek PostgreSQL da TRUNCATE tranzaksiyaviy xavfsiz bo‘lib, ROLLBACK bilan qatorlar to‘liq qaytariladi.'],

    ['L6', 'xulosa', 'PostgreSQL da DDL buyruqlarining tranzaksiyada xavfsiz qaytarilishi murakkab migratsiyalarni xatosiz o‘tkazishda beqiyos yordam beradi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

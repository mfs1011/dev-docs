// SQL 15-bob, 2-video: "Kod" — PostgreSQL 18 da Generated Ustunlar
(function (g) {
  const scenes = ['intro', 'turlar_demo', 'update_demo', 'katalog_va_insert', 'taqiqlangan_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Amaliyotga kirish',
    turlar_demo: 'Virtual va Stored ustunlar',
    update_demo: 'UPDATE paytida avtomatik qayta hisoblash',
    katalog_va_insert: 'pg_attribute va qo‘lda yozish taqiqi',
    taqiqlangan_demo: 'Taqiqlangan ifodalar (now va zanjir)',
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 terminalida GENERATED ALWAYS AS sintaksisi yordamida virtual va stored ustunlar yaratish hamda tizim katalogini tekshirishni ko‘ramiz.'],

    ['L2', 'turlar_demo', 'buyurtma_qatorlari jadvalida narx va sonidan hisoblanadigan virtual summa hamda saqlanadigan summa_s ustunlarini yaratamiz. Qator kiritilganda ikkalasi ham avtomatik hisoblanadi.'],

    ['L3', 'update_demo', 'Asosiy ustun, masalan soni qiymati UPDATE qilinganda ikkala generated ustun ham avtomatik tarzda yangi qiymatga qayta hisoblanadi.'],

    ['L4', 'katalog_va_insert', 'pg_attribute tizim katalogida ustun turi ko‘rinadi: v harfi virtual, s esa stored degani. Shuningdek generated ustunga qo‘lda qiymat kiritish qat\'iyan taqiqlanadi, faqat DEFAULT so‘zi qabul qilinadi.'],

    ['L5', 'taqiqlangan_demo', 'now() kabi har safar boshqa natija beruvchi o‘zgaruvchan funksiyalar va bitta generated ustundan ikkinchisida foydalanish PostgreSQL da xatolik beradi.'],

    ['L6', 'xulosa', 'PostgreSQL 18 da virtual ustunlar sukut bo‘yicha disk xotirasini tejaydi va hisob-kitoblarning doimiy aniqligini ta\'minlaydi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

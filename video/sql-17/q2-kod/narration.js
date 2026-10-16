// SQL 17-bob, 2-video: "Kod" — PostgreSQL 18 da View va Materialized View Amaliyoti
(function (g) {
  const scenes = ['intro', 'updatable_view', 'check_option', 'not_updatable', 'materialized_refresh', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Amaliyotga kirish',
    updatable_view: 'Yangilanadigan view orqali yozish',
    check_option: 'WITH CHECK OPTION xavfsizligi',
    not_updatable: 'GROUP BY va yangilanmaydigan viewlar',
    materialized_refresh: 'Materialized view va REFRESH CONCURRENTLY',
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 da view orqali INSERT va UPDATE qilish, WITH CHECK OPTION, GROUP BY cheklovi hamda Materialized View REFRESH amallarini sinaymiz.'],

    ['L2', 'updatable_view', 'faol_mahsulotlar viewiga yozilgan UPDATE va INSERT so‘rovlari to‘g‘ridan-to‘g‘ri asosiy mahsulotlar jadvaliga o‘tadi, ko‘rsatilmagan ustunlar esa sukut bo‘yicha qiymat oladi.'],

    ['L3', 'check_option', 'arzonlar viewida narxi 5000 dan kichik mahsulotlar filtrlangan. WITH CHECK OPTION tufayli view orqali qimmat go‘sht mahsulotini kiritish rad etiladi.'],

    ['L4', 'not_updatable', 'statistika viewida GROUP BY agregatsiyasi bo‘lgani sababli u avtomatik yangilanmaydi va har qanday UPDATE buyrug‘ida xatolik qaytaradi.'],

    ['L5', 'materialized_refresh', 'narx_hisoboti materialized viewida esa yangi qator kiritilsa ham natija avtomatik o‘zgarmaydi. Yangilash uchun REFRESH, o‘qishni to‘xtatmaslik uchun esa UNIQUE indeks va CONCURRENTLY ishlatiladi.'],

    ['L6', 'xulosa', 'Oddiy view orqali xavfsiz yozishda CHECK OPTION, og‘ir keshlar uchun esa UNIQUE indeksli REFRESH CONCURRENTLY eng ishonchli yondashuvdir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

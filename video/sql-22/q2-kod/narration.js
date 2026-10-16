// SQL 22-bob, 2-video: "Kod" — PostgreSQL 18 da SELECT, Aliaslar va DISTINCT ON Amaliyoti
(function (g) {
  const scenes = ['intro', 'alias_where_err', 'alias_order_ok', 'distinct_on_demo', 'comma_trap_demo', 'xulosa'];
  const sceneNames = {
    intro: 'Sotuvlar jadvali va boshlang‘ich ma’lumotlar',
    alias_where_err: 'WHERE da alias ishlatilgandagi xato',
    alias_order_ok: 'WHERE da ifodani yozish va ORDER BY da alias',
    distinct_on_demo: 'DISTINCT ON yordamida eng yirik savdoni topish',
    comma_trap_demo: 'Tushib qolgan vergul va jadvalsiz SELECT',
    xulosa: 'PostgreSQL 18 amaliy xulosalari'
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
    ['L1', 'intro', 'Amaliyot uchun sotuvlar jadvalini yaratamiz; unda sotuvchilar, shaharlar va savdo summalari yozilgan oltita qator mavjud.'],

    ['L2', 'alias_where_err', 'Qo‘shilgan qiymat solig‘i bilan hisoblangan ustun aliasini WHERE da ishlatish xato beradi, chunki bu bosqichda alias hali hisoblanmagan bo‘ladi.'],

    ['L3', 'alias_order_ok', 'To‘g‘ri yo‘l shartda ifodani to‘liq yozishdir; saralash bosqichida esa qqs bilan aliasi bemalol taniydi va ishlaydi.'],

    ['L4', 'distinct_on_demo', 'Har bir sotuvchining eng yirik savdosini ajratib olish uchun distinkt on dan foydalanamiz va uni kamayish tartibidagi saralash bilan mustahkamlaymiz.'],

    ['L5', 'comma_trap_demo', 'Vergul tushib qolganda ikkinchi ustun birinchisiga nom bo‘lib qoladi; shuningdek jadvalsiz hisob-kitoblar uchun oddiy selekt buyrug‘i kifoyadir.'],

    ['L6', 'xulosa', 'SELECT ning mantiqiy bosqichlarini to‘g‘ri tushunish kutilmagan sintaktik xatolarning oldini oladi va so‘rovlarni aniq tuzishga yordam beradi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

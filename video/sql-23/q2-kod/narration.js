// SQL 23-bob, 2-video: "Kod" — PostgreSQL 18 da Filtrlash Amaliyoti
(function (g) {
  const scenes = ['intro', 'between_demo', 'null_in_demo', 'distinct_demo', 'like_regex_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Sinov jadvali va vazifalar',
    between_demo: 'BETWEEN va BETWEEN SYMMETRIC amaliyoti',
    null_in_demo: 'NOT IN dagi NULL: 0 qator amaliyoti',
    distinct_demo: 'IS DISTINCT FROM bilan to‘liq tanlash',
    like_regex_demo: 'ILIKE va POSIX Regex bilan qidiruv',
    xulosa: 'Amaliy xulosalar va tavsiyalar'
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
    ['L1', 'intro', 'Ushbu amaliy qismda PostgreSQL 18 da mijozlar jadvali asosida turli filtrlash operatorlarini real terminalda sinab ko‘ramiz.'],

    ['L2', 'between_demo', 'Oraliqni tekshirishda BETWEEN SYMMETRIC argumentlar teskari kelsa ham chegaralarni avtomatik tartiblab, natijani to‘g‘ri chiqaradi.'],

    ['L3', 'null_in_demo', 'Biroq NOT IN ro‘yxatiga NULL aralashsa, PostgreSQL kutilmaganda nolta qator qaytaradi, chunki noaniqlik butun ifodani NULL ga aylantiradi.'],

    ['L4', 'distinct_demo', 'Shahri noma’lum mijozlarni yo‘qotmaslik uchun esa IS DISTINCT FROM operatori qo‘llanilib, NULL qiymatlar ham xavfsiz filtrlanadi.'],

    ['L5', 'like_regex_demo', 'Shuningdek, ILIKE katta-kichik harfni ajratmasdan qidiradi, POSIX tilda belgisi esa telefon formatlarini aniq regex bilan tekshiradi.'],

    ['L6', 'xulosa', 'Har bir operatorning NULL bilan ishlash tabiatini bilish SQL so‘rovlarida kutilmagan xatolar va ma’lumotlar yo‘qolishining oldini oladi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

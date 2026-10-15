// SQL 5-bob, 1-video: "Tushuncha" — Baza, sxema va jadval ierarxiyasi, Shablonlar va search_path
(function (g) {
  const scenes = ['intro', 'ierarxiya', 'shablonlar', 'sxemalar', 'search_path', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    ierarxiya: 'SQL obyektlar ierarxiyasi',
    shablonlar: 'Shablon bazalar (template1 va template0)',
    sxemalar: 'Sxema: Nomlar fazosi',
    search_path: 'Qidiruv yo‘li (search_path) va xavfsizlik',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L8: 1.0,
    L12: 1.0,
    L16: 1.0,
    L18: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu SQL qo‘llanmasining beshinchi bobi. Ushbu videoda ma’lumotlar bazasi ierarxiyasi: klaster, baza, sxema va jadvallarning o‘zaro bog‘liqligini o‘rganamiz.'],

    ['L2', 'ierarxiya', 'Jadval bazada alohida shunchaki turmaydi. PostgreSQL da qat’iy ierarxiya mavjud: bitta klaster serveri ichida bir nechta alohida bazalar joylashadi.'],
    ['L3', 'ierarxiya', 'PostgreSQL ning eng muhim qoidasi: bitta ulanish faqat bitta bazaga kira oladi. Bitta ulanishda boshqa bazadagi jadvallarni to‘g‘ridan-to‘g‘ri o‘qib bo‘lmaydi.'],
    ['L4', 'ierarxiya', 'Shuning uchun, bir-biriga aloqasi bo‘lmagan loyihalar alohida bazalarga, bir-biri bilan ma’lumot almashadigan tizimlar esa bitta bazadagi alohida sxemalarga ajratiladi.'],

    ['L5', 'shablonlar', 'Yangi baza yaratilganda, PostgreSQL uni noldan qurmaydi, balki shablon bazadan nusxa oladi. Sukut bo‘yicha nusxa template1 dan olinadi.'],
    ['L6', 'shablonlar', 'Agar template1 ga biror jadval qo‘shib qo‘ysangiz, u keyin yaratiladigan har bir yangi bazada avtomatik paydo bo‘ladi!'],
    ['L7', 'shablonlar', 'template0 esa PostgreSQL ning mutlaqo toza boshlang‘ich holati bo‘lib, unga yangi ulanishlar taqiqlangan va u hech qachon o‘zgartirilmasligi kerak.'],
    ['L8', 'shablonlar', 'Diqqat: bazadan nusxa olinayotgan paytda, unga boshqa hech kim ulanmagan bo‘lishi shart.'],

    ['L9', 'sxemalar', 'Sxema — bu ma’lumotlar bazasi ichidagi nomlar fazosi, ya’ni operatsion tizimdagi papkaga o‘xshash mantiqiy guruhdir.'],
    ['L10', 'sxemalar', 'Faqat bitta farqi: sxema ichida ichki sxema ochib bo‘lmaydi.'],
    ['L11', 'sxemalar', 'Bitta sxemada jadval va indeks bir xil nomga ega bo‘lolmaydi. Ammo turli sxemalarda bir xil nomlarni bemalol ishlatish mumkin: masalan, ombor nuqta mahsulot va savdo nuqta mahsulot.'],
    ['L12', 'sxemalar', 'Sxemalar qat’iy ajratilmagan: foydalanuvchi huquqi bo‘lsa, bitta so‘rovda turli sxemalardagi jadvallarni birlashtirib o‘qiy oladi.'],

    ['L13', 'search_path', 'Har safar sxema nomini to‘liq yozmaslik uchun PostgreSQL da qidiruv yo‘li, ya’ni search_path parametri mavjud.'],
    ['L14', 'search_path', 'Agar jadval nomi prefikssiz yozilsa, tizim uni search_path da ko‘rsatilgan sxemalar bo‘yicha ketma-ket qidiradi va birinchi topilganini oladi.'],
    ['L15', 'search_path', 'Har bir yangi bazada public degan umumiy sxema mavjud bo‘ladi. Ammo bu yerda jiddiy xavfsizlik masalasi bor!'],
    ['L16', 'search_path', 'Agar yovuz niyatli foydalanuvchi qidiruv yo‘lidagi sxemada siz ishlatadigan nom bilan zararli funksiya yaratsa, sizning so‘rovingiz uning kodini bajarib yuborishi mumkin. Shu sababli PostgreSQL 15 dan boshlab public sxemasida hamma uchun yaratish huquqi bekor qilingan.'],

    ['L17', 'xulosa', 'Demak, bir-biri bilan bog‘liq bo‘limlarni alohida bazalarga emas, balki bitta bazadagi alohida sxemalarga ajrating va qidiruv yo‘li xavfsizligiga e’tibor bering.'],
    ['L18', 'xulosa', 'Keyingi videoda bu ierarxiya va buyruqlarni PostgreSQL 18 psql terminalida jonli sinab ko‘ramiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

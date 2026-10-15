// SQL 8-bob, 2-video: "Kod" — PostgreSQL terminalida jonli amallar
(function (g) {
  const scenes = ['intro', 'tz_sinov', 'utc_sinov', 'at_time_zone', 'interval_math', 'dst_ny', 'datestyle_xato', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: psql terminali va TimeZone',
    tz_sinov: 'timestamp va timestamptz amalda',
    utc_sinov: 'TimeZone = UTC rejimida tekshirish',
    at_time_zone: 'AT TIME ZONE operatori sirlari',
    interval_math: 'Interval arifmetikasi va normallashuvi',
    dst_ny: 'Nyu-Yorkda yozgi vaqt: 1 kun va 24 soat',
    datestyle_xato: 'DateStyle va mavjud bo‘lmagan sanalar',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8,
    L4: 1.0,
    L6: 1.0,
    L8: 1.0,
    L11: 1.0,
    L13: 1.0,
    L15: 1.0,
    L17: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda PostgreSQL o‘n sakkiz nuqta olti terminalida sana va vaqt bilan ishlashni jonli buyruqlar orqali sinab ko‘ramiz.'],
    ['L2', 'intro', 'Avvalo p-es-kyu-el da SHOW TimeZone buyrug‘ini bajaramiz. Baza bizning seansimiz uchun Asia qiya chiziq Tashkent mintaqasini ko‘rsatmoqda.'],

    ['L3', 'tz_sinov', 'Endi bitta oddiy timestamp va bitta timestamptz ustunli voqealar jadvalini yaratamiz va unga ikkita qator kiritamiz.'],
    ['L4', 'tz_sinov', 'Ikkinchi qatordagi qo‘ng‘iroq voqeasiga plyus uch Moskva vaqti bilan kiritdik. Natijaga qarang: timestamp mintaqani shunchaki tashlab yubordi, timestamptz esa uni Toshkent vaqtiga o‘girib o‘n bir nol nol qilib ko‘rsatdi.'],

    ['L5', 'utc_sinov', 'Endi seansimizning mintaqasini u-te-se ga o‘zgartirib jadvalni qaytadan o‘qiymiz: SET TimeZone teng UTC.'],
    ['L6', 'utc_sinov', 'Ko‘rib turganingizdek, timestamptz qiymatlari u-te-se ga mos ravishda to‘rt nol nol va olti nol nolga o‘zgardi, oddiy timestamp esa devor soatidek qotib turibdi.'],

    ['L7', 'at_time_zone', 'Endi AT TIME ZONE operatorini sinaymiz. Bu operator ikki xil yo‘nalishda ishlaydi.'],
    ['L8', 'at_time_zone', 'Timestamptz ga nisbatan qo‘llaganda lahzaning Moskvadagi soatini, oddiy timestamp ga nisbatan esa Moskvadagi mahalliy soat Toshkentda necha bo‘lishini hisoblab beradi.'],

    ['L9', 'interval_math', 'Keyingi muhim mavzu — interval arifmetikasi. O‘ttiz birinchi yanvarga bir oy qo‘shsak nima bo‘ladi?'],
    ['L10', 'interval_math', 'Fevralda o‘ttiz birinchi kun yo‘q, shuning uchun baza oyning eng oxirgi kuni — yigirma sakkizinchi fevralni beradi.'],
    ['L11', 'interval_math', 'Shuningdek, yuz hafta intervali yetti yuz kunga aylanadi, lekin oylarga o‘girilmaydi. Ikki timestamp ayirmasi esa chiroyli interval hosil qiladi.'],

    ['L12', 'dst_ny', 'Endi eng qiziqarli sinov: Nyu-York mintaqasida yigirma oltinchi yil sakkizinchi martda yozgi vaqtga o‘tiladi va bir sutka yigirma uch soat bo‘lib qoladi.'],
    ['L13', 'dst_ny', 'Natijada interval bir kun qo‘shish ertangi kunduzgi o‘n ikkiga olib borsa, interval yigirma to‘rt soat qo‘shish aniq yigirma to‘rt soat o‘tib soat o‘n uch nol nolni beradi!'],

    ['L14', 'datestyle_xato', 'Kiritish formatlariga e’tibor bering: sukut bo‘yicha oy-kun tartibi ishlaydi, shuning uchun o‘n uch nolinchi bir xato beradi.'],
    ['L15', 'datestyle_xato', 'DateStyle ni de-em-i ga o‘zgartirsak to‘g‘ri o‘qiydi. Lekin mavjud bo‘lmagan yigirma oltinchi yil o‘ttizinchi fevral kabi sanalarga baza mutlaqo yo‘l qo‘ymaydi.'],

    ['L16', 'xulosa', 'Xulosa: p-es-kyu-el da doimo TimeZone sozlamasini yodda tuting va kutilmagan xatolarning oldini olish uchun ISO formatida yozing.'],
    ['L17', 'xulosa', 'Keyingi qismda MySQL va SQLite dagi o‘ziga xos farqlar va eng xavfli oltita tuzoqni tahlil qilamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

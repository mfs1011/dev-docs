// SQL 4-bob, 1-video: "Tushuncha" — SQL sintaksisi, Tokenlar, Identifikatorlar, Literallar va Ustuvorlik
(function (g) {
  const scenes = ['intro', 'tokenlar', 'identifikator', 'qoshtirnoq', 'literallar', 'ustuvorlik', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    tokenlar: 'Buyruq, Tokenlar va Nuqtali vergul',
    identifikator: 'Kalit so‘z vs Identifikator',
    qoshtirnoq: 'Qo‘shtirnoq siri va 63 bayt',
    literallar: 'Satr va Son literallari',
    ustuvorlik: 'Operatorlar ustuvorligi',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L8: 1.0,
    L12: 1.0,
    L16: 1.0,
    L19: 1.0,
    L21: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu SQL qo‘llanmasining to‘rtinchi bobi. Ushbu videoda SQL sintaksisi, tokenlar, identifikatorlar va literallarning qat’iy qoidalarini ko‘rib chiqamiz.'],

    ['L2', 'tokenlar', 'SQL matni buyruqlar ketma-ketligidan iborat bo‘lib, har bir buyruq nuqtali vergul bilan tugaydi.'],
    ['L3', 'tokenlar', 'Har bir buyruq tokenlardan tuziladi: kalit so‘zlar, identifikatorlar, literallar va maxsus belgilar. Ular bo‘sh joy yoki yangi qator bilan ajratiladi.'],
    ['L4', 'tokenlar', 'Muhim qoida: izohlar token hisoblanmaydi, ular SQL tahlilchisi uchun oddiy bo‘sh joyga teng.'],

    ['L5', 'identifikator', 'Kalit so‘z — bu tilda maxsus qat’iy ma’noga ega bo‘lgan so‘z, masalan SELECT, UPDATE yoki VALUES.'],
    ['L6', 'identifikator', 'Identifikator esa jadval, ustun yoki boshqa obyektning nomidir, masalan mahsulot yoki narx.'],
    ['L7', 'identifikator', 'SQL standartida qo‘shtirnoqsiz nomlar katta harfga o‘giriladi. Ammo PostgreSQL bu qoidani buzib, barcha nomlarni kichik harfga aylantiradi.'],
    ['L8', 'identifikator', 'Shuning uchun PostgreSQL da katta harfda yozilgan jadval baribir kichik harfda saqlanadi.'],

    ['L9', 'qoshtirnoq', 'Agar nom qo‘shtirnoq ichiga olinsa, u har doim identifikator bo‘ladi va hech qachon kalit so‘z deb tushunilmaydi.'],
    ['L10', 'qoshtirnoq', 'Shu sababli, ORDER yoki SELECT kabi kalit so‘zlarni qo‘shtirnoqqa olib, bemalol jadval nomi qilib ishlatish mumkin.'],
    ['L11', 'qoshtirnoq', 'Eng muhimi: qo‘shtirnoq nomni katta-kichik harfga qat’iy sezgir qiladi. Mahsulot va qo‘shtirnoqdagi Mahsulot PostgreSQL da ikki xil jadval bo‘ladi.'],
    ['L12', 'qoshtirnoq', 'Bundan tashqari, PostgreSQL da identifikator uzunligi 63 bayt bilan cheklangan. Ortig‘i ogohlantirish bilan qisqartirib tashlanadi.'],

    ['L13', 'literallar', 'Satr literallari bitta tirnoq ichiga olinadi. Satr ichidagi tirnoqni yozish uchun ikki marta tirnoq qo‘yiladi.'],
    ['L14', 'literallar', 'PostgreSQL da E harfi bilan boshlanadigan escape satrlari mavjud bo‘lib, ularda teskari chiziq orqali yangi qator va tab belgilarini yozish mumkin.'],
    ['L15', 'literallar', 'Shuningdek, funksiyalar va uzun matnlar uchun dollar satrlar ishlatiladi. Dollar satr ichida maxsus belgilar o‘z kuchini yo‘qotadi.'],
    ['L16', 'literallar', 'Sonlarda esa o‘qishni osonlashtirish uchun pastki chiziq qo‘yish, hamda o‘n oltilik, sakkizlik va ikkilik ko‘rinishlar ruxsat etiladi.'],

    ['L17', 'ustuvorlik', 'Amallarni bajarishda operatorlarning ustuvorlik tartibi qat’iy belgilangan: avval nuqta va tip o‘zgartirish, so‘ng daraja, ko‘paytirish va qo‘shish.'],
    ['L18', 'ustuvorlik', 'Undan keyin taqqoslash amallari, oxirida esa mantiqiy NOT, AND va OR tekshiriladi.'],
    ['L19', 'ustuvorlik', 'Diqqat qiling: PostgreSQL da darajaga ko‘tarish amali chapdan o‘ngga qarab bog‘lanadi. Masalan, 2 darajasi 3, darajasi 2 ifodasi 64 natijasini beradi.'],

    ['L20', 'xulosa', 'Xulosa qilib aytganda: nomlarni doim kichik harfda va pastki chiziq bilan yozing, kalit so‘zlardan nom sifatida qoching va noaniq holatlarda qavslardan foydalaning.'],
    ['L21', 'xulosa', 'Keyingi videoda bu qoidalarni PostgreSQL 18 terminalida jonli sinovdan o‘tkazamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

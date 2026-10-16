// SQL 13-bob, 3-video: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
(function (g) {
  const scenes = ['intro', 'mysql_demo', 'sqlite_demo', 'taqqoslash', 'tuzoqlar', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: AUTO_INCREMENT va rowid',
    mysql_demo: 'MySQL: AUTO_INCREMENT va LAST_INSERT_ID()',
    sqlite_demo: 'SQLite: rowid vs AUTOINCREMENT',
    taqqoslash: 'Taqqoslash: PostgreSQL vs MySQL vs SQLite',
    tuzoqlar: 'Tipik xatolar va tavsiyalar',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L4: 0.8,
    L6: 1.0,
    L7: 1.0,
    L8: 1.0,
    L9: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Dialektlar qismida MySQL ning AUTO_INCREMENT xususiyati, SQLite ning rowid va AUTOINCREMENT mexanizmini hamda asosiy tuzoqlarni ko‘rib chiqamiz.'],

    ['L2', 'mysql_demo', 'MySQL da AUTO_INCREMENT ustuniga nol yoki NULL yozilganda ham avtomatik raqam beriladi, LAST_INSERT_ID funksiyasi esa joriy ulanishdagi birinchi kiritilgan raqamni qaytaradi.'],
    ['L3', 'mysql_demo', 'Agar qo‘lda yuz raqami kiritilsa, MySQL hisoblagichi ushbu songa ergashadi va keyingi qatorga yuz birni beradi. Shuningdek kichik tip tanlansa, masalan TINYINT da bir yuz yigirma yetti chegarasiga yetib to‘xtaydi.'],

    ['L4', 'sqlite_demo', 'SQLite da oddiy INTEGER PRIMARY KEY yetarli bo‘lib, u rowid ning taxallusi hisoblanadi va eng katta raqamdan bittaga oshirib boradi.'],
    ['L5', 'sqlite_demo', 'AUTOINCREMENT kalit so‘zi qo‘shilganda esa sqlite_sequence jadvali yuritilib, o‘chirilgan oxirgi raqamlar aslo qayta ishlatilmaydi.'],
    ['L6', 'sqlite_demo', 'E\'tibor bering: SQLite da aynan to‘liq INTEGER so‘zi yozilishi shart, qisqa INT yozilsa rowid taxallusi ishlamaydi.'],

    ['L7', 'taqqoslash', 'Uchta tizimni qiyoslasak: PostgreSQL da xavfsiz Identity standarti, MySQL da avtomatik suriluvchi AUTO_INCREMENT, SQLite da esa resurs tejovchi rowid mexanizmi mavjud.'],

    ['L8', 'tuzoqlar', 'Eng katta xato — buxgalteriya cheklari uchun bitta raqam ham tushib qolmasin deb identity ga tayanishdir. ROLLBACK yoki xatolarda bo‘shliqlar qolishi tabiiy qonuniyatdir.'],

    ['L9', 'xulosa', 'Har bir ma\'lumotlar bazasining o‘ziga xos avtomatik raqamlash qoidalarini to‘g‘ri qo‘llash orqali ishonchli va tezkor tizimlar yarating.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

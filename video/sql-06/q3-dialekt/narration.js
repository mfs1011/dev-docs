// SQL 6-bob, 3-video: "Dialektlar" — MySQL, SQLite va 6 ta tipik xato
(function (g) {
  const scenes = ['intro', 'mysql', 'sqlite', 'comparison', 'traps', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    mysql: 'MySQL: UNSIGNED va qat‘iy rejim',
    sqlite: 'SQLite: Type Affinity va taqribiy hisob',
    comparison: 'Uch tizim taqqoslash taxtasi',
    traps: '6 ta tipik xato',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L17: 1.0,
    L19: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Oltinchi bobning uchinchi qismida MySQL va SQLite tizimlarining raqamlar bilan ishlashdagi keskin farqlarini, hamda amaliyotdagi oltita xavfli xatoni tahlil qilamiz.'],

    ['L2', 'mysql', 'MySQL da butun sonlar uchun tayni-int va mediyum-int kabi qo‘shimcha turlar, hamda ansaynd atributi mavjud.'],
    ['L3', 'mysql', 'Eng xavfli jihat: agar MySQL da qat‘iy rejim o‘chirilsa, oraliqdan oshgan son xato bermaydi, balki jimgina oraliq chegarasigacha kesib qo‘yiladi, masalan bir yuz yigirma sakkiz bir yuz yigirma yettiga aylanib qoladi.'],
    ['L4', 'mysql', 'Shuningdek, MySQL da oddiy bo‘lish amali har doim kasr natija beradi: o‘nni to‘rtga bo‘lsak, ikki emas, balki ikki butun ellik chiqadi. Butun bo‘lish uchun esa alohida div operatori ishlatiladi.'],
    ['L5', 'mysql', 'Qolaversa, desimal uchun ansaynd, int to‘rt kabi ko‘rsatish kengligi va zerofil atributlari butunlay eskirgan.'],

    ['L6', 'sqlite', 'SQLite da esa ma’lumot tipi ustunga emas, balki har bir qiymatning o‘ziga tegishlidir.'],
    ['L7', 'sqlite', 'SQLite da desimal tipi yo‘q: qavs ichidagi aniqliklar e’tiborsiz qoldirilib, barcha kasr sonlar taqribiy real sifatida saqlanadi.'],
    ['L8', 'sqlite', 'Eng qizig‘i: butun son chegarasidan oshib ketsa, SQLite xato bermasdan jimgina taqribiy kasr songa o‘tib ketadi. Aniq hisob uchun esa maxsus desimal add funksiyasidan foydalanish shart.'],

    ['L9', 'comparison', 'Uchala tizimni solishtirsak: PostgreSQL da qat‘iy matematik aniqlik, MySQL da oraliq atributlari va sukut bo‘yicha kasr bo‘linma, SQLite da esa erkin tiplash va taqribiy hisob qo‘llangan.'],
    ['L10', 'comparison', 'Nol butun o‘ndan bir literali PostgreSQL va MySQL da aniq desimal bo‘lsa, SQLite da taqribiy real hisoblanadi.'],
    ['L11', 'comparison', 'Ustunga sig‘maydigan qiymat yozilganda, PostgreSQL har doim xato beradi, MySQL rejimga qarab kesishi mumkin, SQLite esa qabul qilaveradi.'],

    ['L12', 'traps', 'Endi raqamlar bilan ishlashdagi oltita eng ko‘p uchraydigan xatoni ko‘rib chiqamiz.'],
    ['L13', 'traps', 'Birinchi xato: pul va moliyaviy hisoblarni float yoki real da saqlash. Bu tiyinlarning yo‘qolishiga olib keladi.'],
    ['L14', 'traps', 'Ikkinchi xato: taqribiy kasr sonlarni tenglik belgisi bilan solishtirish.'],
    ['L15', 'traps', 'Uchinchi xato: yirik jadvallarda birlamchi kalit uchun intijer tanlab, keyinchalik ikki milliardlik chegara to‘lib qolishi.'],
    ['L16', 'traps', 'To‘rtinchi xato: o‘nni to‘rtga bo‘lish hamma joyda ikki yarim chiqadi deb o‘ylash. PostgreSQL da bu ikki bo‘ladi.'],
    ['L17', 'traps', 'Beshinchi xato: MySQL da qat‘iy rejimni o‘chirib qo‘yish.'],
    ['L18', 'traps', 'Oltinchi xato: SQLite da desimal besh ikki pulni aniq saqlaydi deb hisoblash.'],

    ['L19', 'xulosa', 'Shu bilan barcha raqamli ma’lumot turlarini to‘liq o‘rganib chiqdik. Keyingi yettinchi bobda matn va binar ma’lumot turlarini tahlil qilamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

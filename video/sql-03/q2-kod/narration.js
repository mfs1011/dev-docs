// SQL 3-bob, 2-video: "Kod: ulanish" — psql, mysql va sqlite3 CLI mijozlari
(function (g) {
  const scenes = ['intro', 'psql_conn', 'psql_meta', 'mysql_cli', 'sqlite_cli', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    psql_conn: 'psql: parametrlar, URI va .pgpass',
    psql_meta: 'psql meta-buyruqlari',
    mysql_cli: 'mysql: option fayli va --commands',
    sqlite_cli: 'sqlite3: fayl, xotira va dot-commands',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L7: 1.0,
    L11: 1.0,
    L14: 1.0,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu uchinchi bobning ikkinchi videosi. psql, mysql va sqlite3 CLI mijozlari orqali haqiqiy ulanishlar, ulanish satrlari, parollarni xavfsiz saqlash va eng muhim meta-buyruqlarni amalda ko‘ramiz.'],

    ['L2', 'psql_conn', 'PostgreSQL mijozi psql parametrlar orqali ulanishi mumkin: -h host, -p port, -U foydalanuvchi, -d esa baza nomi. -c parametri bitta buyruqni bajarib chiqib ketadi.'],
    ['L3', 'psql_conn', 'Ilovalarda esa ko‘pincha URI formati ishlatiladi: postgresql:// foydalanuvchi va host, so‘ng baza nomi. URI ichida application_name parametrini bersak, u serverdagi pg_stat_activity jadvalida ko‘rinadi.'],
    ['L4', 'psql_conn', 'Parolni PGPASSWORD muhit o‘zgaruvchisida saqlash tavsiya etilmaydi, chunki boshqalar ps orqali ko‘rishi mumkin. Buning o‘rniga uy papkasidagi .pgpass faylidan foydalaniladi va unga qat’iy chmod 600 berilishi shart.'],

    ['L5', 'psql_meta', 'psql ichida teskari chiziq bilan boshlanadigan barcha buyruqlar meta-buyruq deb ataladi va ularni psql ning o‘zi bajaradi.'],
    ['L6', 'psql_meta', 'Masalan: \\dt barcha jadvallar ro‘yxatini, \\d talabalar esa jadval ustunlari va indekslarini ko‘rsatadi. \\x buyrug‘i natijani qulay vertikal ko‘rinishga o‘tkazadi.'],
    ['L7', 'psql_meta', 'Taklif belgisining oxiriga e’tibor bering: tenglik va panjara superuser ekaningizni, tenglik va katta belgisi esa oddiy foydalanuvchi ekaningizni bildiradi.'],

    ['L8', 'mysql_cli', 'Endi MySQL mijozini ko‘ramiz. Bu yerda port uchun katta -P, parol uchun kichik -p ishlatiladi.'],
    ['L9', 'mysql_cli', 'Parolni buyruq satriga yozish xavfli bo‘lgani sababli, MySQL ogohlantirish beradi. To‘g‘ri yo‘l — parolni alohida option faylida saqlash va chmod 600 bilan himoyalashdir.'],
    ['L10', 'mysql_cli', 'Ulanish turini status buyrug‘i ko‘rsatadi: 127.0.0.1 da TCP/IP, localhost da esa UNIX socket deb chiqadi.'],
    ['L11', 'mysql_cli', 'MySQL 9.7 da nozik jihat: skriptlarda \\G yoki status buyruqlari ishlashi uchun --commands parametri berilishi kerak, aks holda noma’lum buyruq xatosi chiqadi.'],

    ['L12', 'sqlite_cli', 'SQLite’da esa sqlite3 dasturi shunchaki qulay qobiq interfeysidir. Unga fayl nomi berilmasa, xotiradagi vaqtinchalik baza ochiladi va dastur yopilganda barcha ma’lumot o‘chib ketadi.'],
    ['L13', 'sqlite_cli', 'Nuqta bilan boshlanadigan dot-commands: .tables jadvallarni, .schema jadval tuzilmasini, .mode box yoki csv esa natija formatini o‘zgartiradi.'],
    ['L14', 'sqlite_cli', 'SQL buyrug‘i oxirida nuqtali vergul unutilsa, dastur nuqtali vergul va strelka taklifi bilan davomini kutadi. 3.54 versiyasida yangi prompt versiya va fayl nomini ko‘rsatadi.'],

    ['L15', 'xulosa', 'Uchala tizim mijozlarining ulanish, xavfsizlik va boshqaruv buyruqlarini amalda sinab ko‘rdik.'],
    ['L16', 'xulosa', 'Keyingi videoda bu uch tizimning ulanish dialektlarini taqqoslaymiz va amaliyotda eng ko‘p uchraydigan 6 ta ulanish xatosini tahlil qilamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

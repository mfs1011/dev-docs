// SQL 3-bob, 3-video: "Dialektlar va Tipik xatolar" (content/sql/03-ornatish-va-ulanish.md)
(function (g) {
  const scenes = ['intro', 'taqqoslash', 'xatolar_1_2', 'xatolar_3_4', 'xatolar_5_6', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    taqqoslash: 'Ulanish dialektlari',
    xatolar_1_2: '1 va 2-xatolar: trust va buyruq satridagi parol',
    xatolar_3_4: '3 va 4-xatolar: chmod 600 va localhost tuzog‘i',
    xatolar_5_6: '5 va 6-xatolar: MySQL --commands va SQLite fayllari',
    xulosa: '3-bob xulosasi'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L7: 1.0,
    L10: 1.0,
    L13: 1.0,
    L15: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu uchinchi bobning uchinchi videosi. PostgreSQL, MySQL va SQLite tizimlarining ulanish dialektlarini taqqoslaymiz va yangi o‘rganuvchilar eng ko‘p yo‘l qo‘yadigan oltita tipik xatoni ko‘rib chiqamiz.'],

    ['L2', 'taqqoslash', 'Uchala tizim ham ma’lumotlar bazasi, lekin ulanish mexanizmlarida muhim farqlar bor. Mijoz dasturlari: PostgreSQL’da psql, MySQL’da mysql, SQLite’da esa sqlite3.'],
    ['L3', 'taqqoslash', 'Parametrlarda: PostgreSQL va MySQL host uchun -h, user uchun -U yoki -u ishlatadi. Ammo port uchun PostgreSQL kichik -p, MySQL esa katta -P harfidan foydalanadi.'],
    ['L4', 'taqqoslash', 'Parol masalasida: PostgreSQL .pgpass fayliga tayanadi, MySQL esa option fayli yoki interaktiv so‘rovni tavsiya qiladi. SQLite’da esa parol yo‘q — hamma narsa fayl ruxsatlari bilan boshqariladi.'],

    ['L5', 'xatolar_1_2', 'Birinchi tipik xato: PostgreSQL’da initdb ni -A siz ishlatib, shunday qoldirish. Natijada server trust rejimida ochiladi va kompyuterdagi har qanday lokal foydalanuvchi parolsiz superuser bo‘lib kira oladi! Har doim -A scram-sha-256 ishlating.'],
    ['L6', 'xatolar_1_2', 'Ikkinchi xato: Parolni to‘g‘ridan-to‘g‘ri buyruq satriga yozish, masalan -pParol yoki PGPASSWORD. Buni kompyuterdagi boshqa foydalanuvchilar ps buyrug‘i orqali ko‘rib olishi mumkin.'],
    ['L7', 'xatolar_1_2', 'To‘g‘ri yo‘l — parollarni .pgpass yoki option fayllarida saqlashdir.'],

    ['L8', 'xatolar_3_4', 'Uchinchi xato: .pgpass yoki option fayliga chmod 600 qilmaslik. Agar fayl boshqalar uchun ochiq bo‘lsa, PostgreSQL xavfsizlik yuzasidan uni e’tiborsiz qoldiradi va parolsiz ulanish xatosini beradi!'],
    ['L9', 'xatolar_3_4', 'To‘rtinchi xato: MySQL’da localhost deb yozib, TCP orqali ulandim deb o‘ylash. Unix tizimlarida localhost har doim soket fayliga ulanadi. TCP uchun 127.0.0.1 deb yozish kerak.'],
    ['L10', 'xatolar_3_4', 'Shuningdek, MySQL’da port uchun kichik -p yozib adashmang — u port emas, parol deb qabul qilinadi.'],

    ['L11', 'xatolar_5_6', 'Beshinchi xato: MySQL 9.7 da skript ichida teskari slesh je ishlatganda noma’lum buyruq xatosi chiqishi. Skriptlarda bu meta-buyruqlar ishlashi uchun --commands parametri qo‘shilishi shart.'],
    ['L12', 'xatolar_5_6', 'Oltinchi xato: SQLite’da fayl nomida adashish yoki faylsiz ochish. SQLite hech qanday xato bermaydi, shunchaki yangi bo‘sh fayl yoki xotirada vaqtinchalik baza yaratadi.'],
    ['L13', 'xatolar_5_6', 'Natijada dasturdan chiqqanda kiritilgan barcha ma’lumotlar yo‘qoladi! Doim fayl yo‘lini tekshiring, .tables buyrug‘i bo‘sh chiqsa, darhol shubhalaning.'],

    ['L14', 'xulosa', 'Shunday qilib, uchinchi bobda bazaga ulanishning barcha nozik jihatlari va xavfsizlik qoidalari bilan tanishdik.'],
    ['L15', 'xulosa', 'Keyingi to‘rtinchi bobda SQL tilining asosiy sintaksisi va amaliy so‘rovlar yozishni boshlaymiz!']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

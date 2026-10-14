// SQL 3-bob, 1-video: "Tushuncha" — Ulanish parametrlari, Socket vs TCP va Klaster yaratish
(function (g) {
  const scenes = ['intro', 'parametrlar', 'socket_tcp', 'initdb', 'mysql_init', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    parametrlar: 'Ulanishning 4 parametri',
    socket_tcp: 'Socket vs TCP/IP',
    initdb: 'PostgreSQL: initdb va trust xavfi',
    mysql_init: 'MySQL: mysqld --initialize',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L8: 1.0,
    L12: 1.0,
    L15: 1.0,
    L17: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu SQL qo‘llanmasining uchinchi bobi. Bazaga ulanishning to‘rtta asosiy parametri, Unix socket va TCP farqi, hamda serverni xavfsiz ishga tushirishni ko‘rib chiqamiz.'],

    ['L2', 'parametrlar', 'Klient-server bazaga ulanish uchun mijoz to‘rtta asosiy narsani bilishi kerak: Host, Port, Foydalanuvchi va Baza nomi.'],
    ['L3', 'parametrlar', 'Host — server qaysi kompyuterda ekanini, Port esa server tinglayotgan eshikni bildiradi. Masalan, PostgreSQL odatda 5432, MySQL esa 3306-portda tinglaydi.'],
    ['L4', 'parametrlar', 'Foydalanuvchi — kim ulanayotganini, Baza esa aynan qaysi ma’lumotlar bazasi bilan ishlashni bildiradi. Ko‘pincha ularga maxfiy parol ham qo‘shiladi.'],

    ['L5', 'socket_tcp', 'Mijoz va server bitta kompyuterda bo‘lsa, ular tarmoqsiz, maxsus Unix socket fayli orqali tezkor gaplashishi mumkin.'],
    ['L6', 'socket_tcp', 'Boshqa kompyuterdagi serverga esa TCP/IP tarmog‘i orqali ulaniladi.'],
    ['L7', 'socket_tcp', 'MySQL’ning nozik jihati: Unix tizimlarida localhost deb yozsangiz, u tarmoqqa emas, socket fayliga ulanadi. TCP orqali ulanish uchun 127.0.0.1 deb yozish kerak.'],
    ['L8', 'socket_tcp', 'SQLite’da esa bu parametrlarning hech biri yo‘q: ulanish — bu shunchaki diskdagi faylni ochishdir.'],

    ['L9', 'initdb', 'PostgreSQL’da ma’lumot papkasi klaster deb ataladi va u initdb dasturi bilan yaratiladi.'],
    ['L10', 'initdb', 'Diqqat: sukut bo‘yicha initdb lokal foydalanuvchilar uchun trust usulini yoqadi. Ya’ni kompyuterdagi har kim parolsiz superuser bo‘lib ulana oladi!'],
    ['L11', 'initdb', 'Xavfsiz bo‘lishi uchun har doim -A scram-sha-256 parametri va parol ko‘rsatilishi shart.'],
    ['L12', 'initdb', 'Klaster tayyor bo‘lgach, server pg_ctl start buyrug‘i bilan fonda ishga tushiriladi.'],

    ['L13', 'mysql_init', 'MySQL’da ma’lumot papkasini tayyorlash mysqld ning o‘ziga yuklangan.'],
    ['L14', 'mysql_init', 'Buning uchun mysqld --initialize buyrug‘i beriladi. U root foydalanuvchisi uchun tasodifiy vaqtinchalik parol yaratadi va uni muddati o‘tgan deb belgilaydi.'],
    ['L15', 'mysql_init', 'Vaqtinchalik parol bilan oddiy so‘rov yuborib bo‘lmaydi. Server darhol ALTER USER buyrug‘i bilan yangi parol o‘rnatishni talab qiladi.'],

    ['L16', 'xulosa', 'Demak, ulanishning to‘rtta tayanch parametri va xavfsiz boshlang‘ich sozlamalarni ko‘rib chiqdik.'],
    ['L17', 'xulosa', 'Keyingi videoda psql, mysql va sqlite3 dasturlari orqali haqiqiy ulanishlarni va ularning o‘ziga xos buyruqlarini amalda sinaymiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

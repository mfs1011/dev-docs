// SQL 2-bob, 2-video: "Kod" bo'limi — jarayonlar, threadlar va SQLite fayli.
(function (g) {
  const scenes = ['intro', 'postgres', 'mysql', 'sqlite', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    postgres: 'PostgreSQL: jarayonlar',
    mysql: 'MySQL: threadlar va engine',
    sqlite: 'SQLite: bitta fayl',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 1.2, L3: 1.0, L4: 2.4, L5: 1.2, L6: 1.0, L7: 2.2, L8: 1.0, L9: 2.6,
    L10: 1.2, L11: 2.0, L12: 1.2, L13: 2.2, L14: 2.2, L15: 1.0
  };
  const lines = [
    ['L1', 'intro', 'Ikkinchi bobdagi arxitektura farqlarini endi haqiqiy tizimlarda tekshiramiz. PostgreSQL, MySQL va SQLite terminallaridagi barcha natijalar — haqiqiy.'],

    ['L2', 'postgres', 'Avval PostgreSQL. Ikki mijoz ulanib, besh soniya kutadigan so‘rov yuborganda, operatsion tizimda alohida jarayonlar paydo bo‘ladi.'],
    ['L3', 'postgres', 'Buni PostgreSQL’ning o‘zidan pg_stat_activity view’i orqali ko‘ramiz.'],
    ['L4', 'postgres', 'Har bir ulanish uchun alohida jarayon raqami, ya’ni PID ko‘rinib turibdi. Uchinchi qator esa so‘rovni yuborgan mijozning o‘zi.'],

    ['L5', 'mysql', 'Endi xuddi shu holatni MySQL’da ko‘ramiz. Operatsion tizimda faqat bitta mysqld server jarayoni ishlaydi.'],
    ['L6', 'mysql', 'Ulanishlar esa jarayon ichidagi threadlar orqali boshqariladi. Buni PROCESSLIST jadvalidan ko‘ramiz.'],
    ['L7', 'mysql', 'Har bir ulanishga alohida thread biriktirilgan. performance_schema’dagi thread nomi ham buni tasdiqlaydi: one_connection.'],
    ['L8', 'mysql', 'MySQL’da storage engine’lar ro‘yxatini so‘raymiz.'],
    ['L9', 'mysql', 'Sukut bo‘yicha InnoDB tanlangan. Va e’tibor bering: ro‘yxatda faqat InnoDB tranzaksiyalarni to‘liq qo‘llab-quvvatlaydi.'],

    ['L10', 'sqlite', 'Nihoyat, SQLite. Unda server yo‘q: sqlite3 buyrug‘iga fayl nomini berish yetarli.'],
    ['L11', 'sqlite', 'Mahsulotlar jadvalini yaratib, ikkita qator qo‘shamiz va SELECT bilan o‘qiymiz.'],
    ['L12', 'sqlite', 'Katalogda dokon.db fayli paydo bo‘ldi. Faylning birinchi o‘n olti baytini ko‘ramiz.'],
    ['L13', 'sqlite', 'Har bir to‘g‘ri SQLite fayli aynan shu o‘n olti bayt bilan boshlanadi: SQLite format uch va oxirida nol bayt.'],
    ['L14', 'sqlite', 'Bazani ko‘chirish uchun esa oddiy fayl nusxasini olish yetarli: cp buyrug‘i bilan nusxa.db yaratamiz va undan ham ma’lumotni o‘qiymiz.'],

    ['L15', 'xulosa', 'Xulosa: PostgreSQL har ulanishga alohida jarayon ochadi, MySQL thread ishlatadi, SQLite esa butun bazani bitta faylda saqlaydi.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

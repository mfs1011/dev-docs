// SQL 5-bob, 2-video: "Kod" — PostgreSQL 18 psql da jonli amaliyot
(function (g) {
  const scenes = ['intro', 'dbs_template', 'cross_db', 'schemas_search', 'path_switch', 'create_drop', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    dbs_template: 'Klasterdagi bazalar va CREATE DATABASE',
    cross_db: 'Bitta ulanish — bitta baza',
    schemas_search: 'Sxemalar va ombor/savdo misoli',
    path_switch: 'search_path o‘zgarishi',
    create_drop: 'Joriy sxemaga tushish va CASCADE',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L7: 1.0,
    L10: 1.0,
    L14: 1.0,
    L17: 1.0,
    L19: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Ushbu videoda baza va sxemalar bilan ishlashni PostgreSQL 18 va psql terminalida jonli buyruqlar orqali sinab ko‘ramiz.'],

    ['L2', 'dbs_template', 'Avval klasterdagi barcha bazalarni ko‘ramiz: pg_database jadvali orqali shablon bazalar va ulanish ruxsatlarini tekshiramiz.'],
    ['L3', 'dbs_template', 'Ko‘rib turganingizdek, template0 ga ulanish taqiqlangan, yangi bazalar esa template1 dan nusxalanadi.'],
    ['L4', 'dbs_template', 'Yangi dokon bazasini yaratamiz. E’tibor bering: CREATE DATABASE buyrug‘ini tranzaksiya ichida bajarib bo‘lmaydi, server darhol xato beradi.'],

    ['L5', 'cross_db', 'Endi yangi yaratilgan dokon bazasiga ulanamiz.'],
    ['L6', 'cross_db', 'Ushbu ulanish ichidan turib qollanma bazasidagi talabalar jadvalini o‘qishga urinib ko‘ramiz.'],
    ['L7', 'cross_db', 'Natijada xato: PostgreSQL bazalararo to‘g‘ridan-to‘g‘ri murojaatni qo‘llab-quvvatlamaydi. Bitta ulanish faqat bitta bazaga tegishli!'],

    ['L8', 'schemas_search', 'Endi sxemalarga o‘tamiz: SHOW search_path va pg_namespace orqali mavjud sxemalarni ko‘ramiz.'],
    ['L9', 'schemas_search', 'Ikkita alohida sxema yaratamiz: ombor va savdo. Har ikkala sxemada bir xil mahsulot jadvalini ochib, ularga ma’lumot kiritamiz.'],
    ['L10', 'schemas_search', 'Prefikssiz SELECT mahsulot desak, baza bunday jadval yo‘q deb xato beradi, chunki bu sxemalar qidiruv yo‘lida hali yo‘q.'],

    ['L11', 'path_switch', 'Endi qidiruv yo‘lini savdo, ombor tartibida sozlaymiz. So‘rovimiz savdo sxemasidagi narx ustunini o‘qib beradi.'],
    ['L12', 'path_switch', 'Endi xuddi shu yo‘lni teskarisiga, ombor, savdo qilib o‘zgartiramiz.'],
    ['L13', 'path_switch', 'Aynan bir xil so‘rov endi ombor sxemasidagi nom ustunini qaytaradi!'],
    ['L14', 'path_switch', 'Ko‘rib turganingizdek, qidiruv yo‘li bitta so‘rovning butunlay boshqa ma’lumotni o‘qishiga sabab bo‘lishi mumkin.'],

    ['L15', 'create_drop', 'Agar sxema ko‘rsatmasdan yangi jadval yaratsak, u qidiruv yo‘lidagi birinchi sxemaga, ya’ni omborga tushadi.'],
    ['L16', 'create_drop', 'Sxemani o‘chirishda esa DROP SCHEMA nom CASCADE buyrug‘i ichidagi barcha jadvallar bilan birga tozalab tashlaydi.'],
    ['L17', 'create_drop', 'CASCADE parametrisiz faqat bo‘sh sxemalarnigina o‘chirish mumkin.'],

    ['L18', 'xulosa', 'Ushbu jonli sinovlar orqali PostgreSQL da bazalar va sxemalarning qanday ishlashini to‘liq ko‘rdik.'],
    ['L19', 'xulosa', 'Keyingi videoda xuddi shu tushunchalar MySQL va SQLite da qanchalik keskin farq qilishini taqqoslaymiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

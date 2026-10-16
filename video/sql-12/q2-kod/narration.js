// SQL 12-bob, 2-video: "Kod" — PostgreSQL 18 da amaliy testlar
(function (g) {
  const scenes = ['intro', 'create_default', 'sys_cols', 'sys_err', 'like_demo', 'temp_unlogged', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: CREATE TABLE va DEFAULT amaliyoti',
    create_default: 'Jadval yaratish, DEFAULT va dublikat qatorlar',
    sys_cols: 'Yashirin tizim ustunlari: ctid va MVCC xmin',
    sys_err: 'Tizim ustuni nomi bilan to‘qnashuv xatosi',
    like_demo: 'LIKE INCLUDING DEFAULTS va nusxalash',
    temp_unlogged: 'TEMPORARY va UNLOGGED jadvallari',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L5: 1.0,
    L6: 0.8,
    L7: 1.0,
    L8: 1.0,
    L9: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda PostgreSQL o‘n sakkiz terminalida jadvallar yaratish, DEFAULT qiymatlar va tizim ustunlarini amalda tekshiramiz.'],

    ['L2', 'create_default', 'Mahsulotlar jadvalini yaratib, narxga nol, soniga bir va vaqtga now funksiyasini DEFAULT qilib biriktiramiz.'],
    ['L3', 'create_default', 'Bir nechta qator kiritganimizda DEFAULT qiymatlar avtomatik to‘ldiriladi, birlamchi kalit bo‘lmagani uchun bir xil Non mahsuloti ikki marta yoziladi.'],

    ['L4', 'sys_cols', 'SELECT orqali yashirin ctid, xmin va tableoid ustunlarini o‘qiymiz. Har bir qator diskda o‘z jismoniy joyiga ega.'],
    ['L5', 'sys_cols', 'Bitta qatorni yangilaganimizda, ctid koordinatasi o‘zgaradi — sababi PostgreSQL yangi versiyani yangi joyga yozadi.'],

    ['L6', 'sys_err', 'Agar o‘z ustunimizga ctid deb nom berishga urinsak, baza tizim ustuni bilan to‘qnashuv xatosini qaytaradi.'],

    ['L7', 'like_demo', 'Boshqa jadvaldan nusxa olishda oddiy LIKE sukut qiymatlarni tashlab ketadi, INCLUDING DEFAULTS esa ularni to‘liq saqlab qoladi.'],

    ['L8', 'temp_unlogged', 'Vaqtinchalik jadval pg_temp sxemasida yaratiladi, UNLOGGED jadval esa WAL jurnalidan xoli bo‘lib relpersistence ustunida u harfi bilan belgilanadi.'],

    ['L9', 'xulosa', 'Ushbu amaliy bilimlar PostgreSQL da ma\'lumotlar jismoniy saqlanishi va jadvallarni to‘g‘ri boshqarishda juda qo‘l keladi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

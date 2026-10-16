// SQL 12-bob, 1-video: "Tushuncha" — CREATE TABLE, DEFAULT va tizim ustunlari
(function (g) {
  const scenes = ['intro', 'rel_model', 'create_table', 'default_val', 'sys_cols', 'special_tables', 'xulosa'];
  const sceneNames = {
    intro: 'CREATE TABLE va DEFAULT: Jadvallar arxitekturasi',
    rel_model: 'Relyatsion model: Ustunlar, tartibsizlik va multito‘plam',
    create_table: 'CREATE TABLE sintaksisi va nomlash odatlari',
    default_val: 'DEFAULT qiymatlari va dinamik ifodalar',
    sys_cols: 'PostgreSQL yashirin tizim ustunlari: ctid va xmin',
    special_tables: 'Maxsus jadvallar: TEMPORARY, UNLOGGED va LIKE',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 0.8,
    L5: 1.0,
    L6: 1.0,
    L8: 1.0,
    L9: 0.8
  };
  const lines = [
    ['L1', 'intro', 'O‘n ikkinchi bobda relyatsion jadvallarni yaratish, sukut bo‘yicha qiymatlar va PostgreSQL ning yashirin tizim ustunlarini o‘rganamiz.'],

    ['L2', 'rel_model', 'Relyatsion modelda jadval qat\'iy ustunlar to‘plamidan iborat bo‘lib, qatorlar tartibi kafolatlanmaydi va birlamchi kalitsiz bir xil dublikat qatorlar paydo bo‘lishi mumkin.'],

    ['L3', 'create_table', 'CREATE TABLE buyrug‘ida jadval nomi, har bir ustun va uning ma\'lumot tipi ko‘rsatiladi. Izchil nomlash va ko‘plik shakli tavsiya etiladi.'],

    ['L4', 'default_val', 'Agar qator qo‘shishda ustun qiymati berilmasa, DEFAULT qiymati ishlatiladi. DEFAULT ko‘rsatilmagan ustunlarga sukut bo‘yicha NULL yoziladi.'],
    ['L5', 'default_val', 'Muhim qoida: DEFAULT now() kabi dinamik ifodalar jadval yaratilganda emas, aynan har bir yangi qator yozilayotgan paytda hisoblanadi.'],

    ['L6', 'sys_cols', 'PostgreSQL da har bir jadvalda yashirin tizim ustunlari mavjud: ctid qatorning jismoniy koordinatasi bo‘lsa, xmin uning tranzaksiya versiyasini bildiradi.'],

    ['L7', 'special_tables', 'Shuningdek, seans tugashi bilan o‘chib ketuvchi TEMPORARY, va jurnallashsiz tez ishlaydigan UNLOGGED kabi maxsus jadvallar mavjud.'],
    ['L8', 'special_tables', 'Boshqa jadvaldan nusxa olishda LIKE faqat sxemani ko‘chirsa, CREATE TABLE AS SELECT buyrug‘i ma\'lumotlar bilan bir martalik jadval hosil qiladi.'],

    ['L9', 'xulosa', 'Jadval strukturasini to‘g‘ri loyihalash va DEFAULT qiymatlarini oqilona tanlash ma\'lumotlar yaxlitligining garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

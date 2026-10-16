// SQL 21-bob, 3-video: "Dialektlar" — MySQL LOAD DATA va SQLite .import
(function (g) {
  const scenes = ['intro', 'mysql_load_data', 'mysql_local_trap', 'sqlite_import', 'strict_and_checks', 'xulosa'];
  const sceneNames = {
    intro: 'MySQL va SQLite da ommaviy yuklash',
    mysql_load_data: 'MySQL LOAD DATA INFILE va xavfsizlik sozlamalari',
    mysql_local_trap: 'MySQL LOCAL tuzog‘i va ma’lumotlarning buzilishi',
    sqlite_import: 'SQLite nuqta import buyrug‘i va turlar',
    strict_and_checks: 'SQLite da ma’lumotlar sifatini tekshirish',
    xulosa: 'Uch tizim qiyosiy xulosasi va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'MySQL va SQLite tizimlarida ham ommaviy yuklash uchun maxsus mexanizmlar mavjud: MySQL da bu LOAD DATA buyrug‘i, SQLite da esa nuqta import vositasidir.'],

    ['L2', 'mysql_load_data', 'MySQL dagi LOAD DATA buyrug‘i oddiy INSERT lardan yigirma baravargacha tez ishlaydi, lekin serverda xavfsizlik uchun maxsus sekyur fayl priv va lokal infayl sozlamalari talab qilinadi.'],

    ['L3', 'mysql_local_trap', 'Lokal infayl ishlatilganda xatolar jimgina e’tiborsiz qoldiriladi: matnli narx nolga aylanadi, takror kalitlar esa tashlab yuborilib, ma’lumotlar buzilib yuklanishi mumkin.'],

    ['L4', 'sqlite_import', 'SQLite da nuqta import orqali CSV faylni yuklashda jadval avvaldan yaratilgan bo‘lishi muhim, aks holda barcha ustunlar tipsiz bo‘lib qoladi.'],

    ['L5', 'strict_and_checks', 'SQLite da sukut bo‘yicha har qanday xato qiymat matn sifatida yuklanib ketaveradi, shuning uchun strikt jadvallar va cheklovlardan foydalanish shart.'],

    ['L6', 'xulosa', 'Xulosa qilib aytganda, yuklash tezligi muhim bo‘lsa-da, ogohlantirishlarni tekshirish va yuklashdan so‘ng ma’lumotlar butunligini nazorat qilish barqaror tizim asosidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

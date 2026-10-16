// SQL 18-bob, 1-video: "Tushuncha" — INSERT, UPDATE, DELETE
(function (g) {
  const scenes = ['intro', 'insert_usullari', 'update_delete_qoidalari', 'boshqa_jadvallarga_tayanish', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Relyatsion DML Asoslari',
    insert_usullari: 'INSERT: Butun qator va turli usullar',
    update_delete_qoidalari: 'UPDATE va DELETE: Qat’iy WHERE shartlari',
    boshqa_jadvallarga_tayanish: 'UPDATE FROM va DELETE USING xavflari',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu darsda ma’lumotlar bilan ishlashning asosi bo‘lgan DML buyruqlari: INSERT, UPDATE va DELETE amallarining muhim qoidalari bilan tanishamiz.'],

    ['L2', 'insert_usullari', 'Relyatsion bazada faqat butun qator qo‘shiladi. Ko‘rsatilmagan ustunlar sukut bo‘yicha qiymat oladi, ustunlarni aniq sanab yozish esa kodni kelajakdagi o‘zgarishlardan asraydi.'],

    ['L3', 'update_delete_qoidalari', 'UPDATE va DELETE buyruqlarida WHERE yozilmasa, butun jadvaldagi barcha qatorlar ogohlantirishsiz o‘zgaradi yoki o‘chadi. Bitta qatorni aniq yangilash uchun birlamchi kalit shart.'],

    ['L4', 'boshqa_jadvallarga_tayanish', 'PostgreSQL da boshqa jadvalga qarab o‘zgartirish uchun UPDATE FROM va DELETE USING bor. Agar bir nechta qator mos kelsa, ixtiyoriy bittasi olinishi katta xavf tug‘diradi.'],

    ['L5', 'xulosa', 'Xavfli o‘zgartirishlarni doimo tranzaksiya ichida tekshirish va ko‘p jadvalli UPDATE da jamlangan subquery ishlatish eng to‘g‘ri amaliyotdir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

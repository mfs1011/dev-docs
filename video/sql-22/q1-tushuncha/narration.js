// SQL 22-bob, 1-video: "Tushuncha" — SELECT Anatomiyasi va Mantiqiy Bajarilish Tartibi
(function (g) {
  const scenes = ['intro', 'execution_order', 'alias_timing', 'distinct_and_order', 'comma_trap', 'distinct_on'];
  const sceneNames = {
    intro: 'SELECT buyrug‘i va yozilish tartibi',
    execution_order: 'Bandlarning mantiqiy bajarilish tartibi',
    alias_timing: 'Aliaslarning paydo bo‘lish vaqti va WHERE dagi xato',
    distinct_and_order: 'DISTINCT va ORDER BY bosqichlari',
    comma_trap: 'Tushib qolgan vergul tuzog‘i',
    distinct_on: 'PostgreSQL DISTINCT ON kengaytmasi'
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
    ['L1', 'intro', 'SELECT so‘rovi ma’lumotlar bazasining eng asosiy buyrug‘i bo‘lib, u vit, from, ver, grup bay, having, order bay va limit kabi bir nechta bandlardan tashkil topadi.'],

    ['L2', 'execution_order', 'Lekin bandlarning yozilish tartibi ularning bajarilish tartibiga mos kelmaydi: avval FROM va WHERE, so‘ngra guruhlash va faqat shundan keyin SELECT ro‘yxati hisoblanadi.'],

    ['L3', 'alias_timing', 'Natija ustuniga berilgan nom, ya’ni alias oltinchi bosqichda yaratiladi; shuning uchun u uchinchi bosqichdagi WHERE shartida hali mavjud bo‘lmaydi.'],

    ['L4', 'distinct_and_order', 'Saralash va qatorlar sonini cheklash eng oxirgi bosqichlarda bajariladi; shuning uchun ORDER BY bandi ustun aliaslarini bemalol taniydi.'],

    ['L5', 'comma_trap', 'Ustunlar orasida vergul unutilganda xato chiqmaydi, ikkinchi ustun birinchisining aliasiga aylanib qoladi; shuning uchun har doim AS so‘zini yozish tavsiya etiladi.'],

    ['L6', 'distinct_on', 'PostgreSQL da har bir guruhdan faqat birinchi qatorni tanlab olish uchun DISTINCT ON ishlatiladi va u albatta aniq ORDER BY bilan birga qo‘llanishi shart.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 16-bob, 1-video: "Tushuncha" — Jadvalni o'zgartirish (ALTER TABLE)
(function (g) {
  const scenes = ['intro', 'asosiy_amallar', 'default_tezligi', 'cascade_va_truncate', 'xulosa'];
  const sceneNames = {
    intro: 'Jadval tuzilmasini o‘zgartirish',
    asosiy_amallar: 'ALTER TABLE ning asosiy amallari',
    default_tezligi: 'Katta jadvallar va DEFAULT tezligi',
    cascade_va_truncate: 'Bog‘liqliklar, CASCADE va TRUNCATE',
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
    ['L1', 'intro', 'Jadval yaratilgandan keyin talablar o‘zgaradi: yangi ustun, boshqa ma\'lumot tipi yoki cheklovlar kerak bo‘ladi. Buning uchun ma\'lumotni o‘chirmasdan tuzilmani o‘zgartiruvchi ALTER TABLE buyrug‘i xizmat qiladi.'],

    ['L2', 'asosiy_amallar', 'ALTER TABLE orqali ustun qo‘shish va o‘chirish, ma\'lumot tipini o‘zgartirish, NOT NULL va CHECK cheklovlarini boshqarish hamda ustun yoki jadval nomini o‘zgartirish mumkin.'],

    ['L3', 'default_tezligi', 'Eng muhim qoidasi: o‘zgarmas DEFAULT qiymatli yangi ustun qo‘shish jadval qatorlarini qayta yozishni talab qilmaydi va millionlab qatorli jadvallarda ham bir zumda bajariladi.'],

    ['L4', 'cascade_va_truncate', 'Jadvallar orasidagi bog‘liqliklarda DROP CASCADE barcha tashqi kalit va ko‘rinishlarni rekursiv o‘chiradi. TRUNCATE esa barcha qatorlarni darhol tozalab, disk joyini bo‘shatadi.'],

    ['L5', 'xulosa', 'Sxemani xavfsiz va to‘g‘ri o‘zgartirish — ishlab turgan tizimlarda ma\'lumotlar yo‘qolishi va qotib qolishlarning oldini oluvchi muhim mahoratdir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

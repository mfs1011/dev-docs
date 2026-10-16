// SQL 14-bob, 1-video: "Tushuncha" — Cheklovlar (Constraints)
(function (g) {
  const scenes = ['intro', 'check_not_null', 'unique_primary', 'foreign_key', 'deferrable_enforced', 'xulosa'];
  const sceneNames = {
    intro: 'Cheklovlar: Ma\'lumot yaxlitligi asoslari',
    check_not_null: 'CHECK va NOT NULL: Mantiqiy shartlar va NULL tuzog\'i',
    unique_primary: 'UNIQUE va PRIMARY KEY: Yagonalik va B-tree indeks',
    foreign_key: 'FOREIGN KEY va ON DELETE amallari',
    deferrable_enforced: 'DEFERRABLE va PostgreSQL 18 da NOT ENFORCED',
    xulosa: 'Xulosa va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L4: 1.0,
    L6: 1.0,
    L7: 1.0,
    L8: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu darsda ma\'lumotlar yaxlitligini ta\'minlovchi beshta asosiy cheklov — CHECK, NOT NULL, UNIQUE, PRIMARY KEY va FOREIGN KEY mexanizmlarini ko‘rib chiqamiz.'],

    ['L2', 'check_not_null', 'CHECK cheklovi ustun yoki butun jadval darajasida mantiqiy ifodani talab qiladi, masalan narx noldan katta bo‘lishi yoki narx chegirmadan baland bo‘lishi shart.'],
    ['L3', 'check_not_null', 'Juda muhim qoida: CHECK faqat ifoda FALSE bo‘lgandagina xato beradi, agar qiymat NULL bo‘lsa, ifoda tekshiruvdan jimgina o‘tib ketadi. Shuning uchun NOT NULL cheklovi alohida ko‘rsatilishi zarur.'],

    ['L4', 'unique_primary', 'UNIQUE cheklovi barcha qatorlar bo‘yicha qiymatlar takrorlanmasligini kafolatlaydi va avtomatik B-tree indeks yaratadi. PRIMARY KEY esa UNIQUE ga qo‘shimcha tarzda ustunni qat\'iy NOT NULL qiladi.'],

    ['L5', 'foreign_key', 'FOREIGN KEY cheklovi bola jadvaldagi qiymat ota jadvalda mavjud bo‘lishini talab qiladi va ikki jadval o‘rtasidagi bog‘liqlikni himoyalaydi.'],
    ['L6', 'foreign_key', 'Ota qator o‘chirilganda ON DELETE CASCADE bog‘liq bolalarni ham o‘chiradi, RESTRICT esa darhol taqiqlaydi. SET NULL esa bola ustunni bo‘shatib qo‘yadi.'],

    ['L7', 'deferrable_enforced', 'DEFERRABLE cheklovlar tekshiruvni tranzaksiya yakuni bo‘lgan COMMIT gacha kechiktirishga imkon beradi. PostgreSQL o‘n sakkizda esa faqat hujjatlashtirish uchun NOT ENFORCED holati qo‘shildi.'],

    ['L8', 'xulosa', 'Jadvallarda to‘g‘ri cheklovlar tizimini o‘rnatish orqali xato ma\'lumotlar yozilishining oldini oling va bazangiz mustahkamligini kafolatlang.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

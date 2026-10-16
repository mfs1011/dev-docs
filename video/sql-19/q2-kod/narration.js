// SQL 19-bob, 2-video: "Kod" — PostgreSQL 18 da RETURNING Amaliyoti
(function (g) {
  const scenes = ['intro', 'insert_id', 'update_old_new', 'delete_returning', 'cte_archive', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: RETURNING amaliyoti',
    insert_id: 'INSERT RETURNING: Yangi ID va ko‘p qatorlar',
    update_old_new: 'UPDATE: old va new bilan solishtirish',
    delete_returning: 'DELETE RETURNING va bo‘sh natija',
    cte_archive: 'WITH CTE orqali o‘chirish va arxivlash',
    xulosa: 'Xulosa'
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 terminalida yangi ID olish, eski va yangi qiymatlarni solishtirish hamda CTE orqali ma’lumotlarni arxivlashni sinab ko‘ramiz.'],

    ['L2', 'insert_id', 'Mijozlar jadvaliga bitta yoki bir nechta qator qo‘shilganda RETURNING id yozish har bir qator uchun alohida avtomatik ID ni aniq qaytaradi.'],

    ['L3', 'update_old_new', 'PostgreSQL 18 ning yangi sintaksisi orqali balansni oshirganda old balans va new balans ustunlari o‘zgarishdan oldingi hamda keyingi qiymatni ko‘rsatadi.'],

    ['L4', 'delete_returning', 'DELETE RETURNING yulduzcha buyrug‘i o‘chirilgan qatorning to‘liq nusxasini beradi, agar shartga mos qator topilmasa, shunchaki nol qator qaytadi.'],

    ['L5', 'cte_archive', 'DELETE RETURNING natijasini CTE orqali INSERT INTO arxiv buyrug‘iga uzatish bitta atomar operatsiyada ma’lumotni asosiy jadvaldan arxivga xavfsiz ko‘chiradi.'],

    ['L6', 'xulosa', 'RETURNING dasturiy ilovalarda qo‘shimcha SELECT so‘rovlariga ehtiyoj qoldirmaydi va tranzaksiyaviy xavfsizlikni eng yuqori darajaga ko‘taradi.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 19-bob, 1-video: "Tushuncha" — RETURNING va Yangi ID
(function (g) {
  const scenes = ['intro', 'race_condition', 'returning_concept', 'commands_scope', 'pg18_old_new', 'xulosa'];
  const sceneNames = {
    intro: 'Yangi qator va ID muammosi',
    race_condition: 'Alohida SELECT va poyga holati',
    returning_concept: 'RETURNING mohiyati va xavfsizligi',
    commands_scope: 'INSERT, UPDATE va DELETE da RETURNING',
    pg18_old_new: 'PostgreSQL 18: OLD va NEW qiymatlari',
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
    ['L1', 'intro', 'Yangi mijoz qo‘shilganda uning avtomatik yaratilgan identifikatorini olish yoki o‘zgargan qatorlarning yangi holatini bilish eng ko‘p uchraydigan vazifalardan biridir.'],

    ['L2', 'race_condition', 'ID ni bilish uchun alohida SELECT max ID qilish parallel so‘rovlar oqimida boshqa birovning ID sini olib qo‘yish yoki poyga holatiga sabab bo‘ladi.'],

    ['L3', 'returning_concept', 'RETURNING klauzasi bitta DML buyrug‘ining o‘zida o‘zgargan qatorlarni qaytaradi. Bu ortiqcha tarmoq so‘rovlarini tejaydi va to‘liq xavfsizlikni kafolatlaydi.'],

    ['L4', 'commands_scope', 'INSERT da u yangi ID va sukut qiymatlarni, UPDATE da qatorning yangi holatini, DELETE da esa o‘chirilgan qator nusxasini ilovaga taqdim etadi.'],

    ['L5', 'pg18_old_new', 'PostgreSQL 18 versiyasida endi UPDATE da old va new kalit so‘zlari orqali eski va yangi qiymatlarni bir vaqtda solishtirib olish imkoniyati paydo bo‘ldi.'],

    ['L6', 'xulosa', 'Ma’lumotlar bazasi hisoblagan har qanday qiymatni RETURNING orqali olish zamonaviy dasturlashda eng ishonchli va toza yondashuvdir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

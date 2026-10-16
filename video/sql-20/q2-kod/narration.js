// SQL 20-bob, 2-video: "Kod" — PostgreSQL 18 da UPSERT va MERGE Amaliyoti
(function (g) {
  const scenes = ['intro', 'on_conflict_demo', 'excluded_usage', 'conflict_rules', 'merge_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: UPSERT va MERGE amaliyoti',
    on_conflict_demo: 'INSERT ON CONFLICT va hisoblagich',
    excluded_usage: 'EXCLUDED bilan ko‘p qatorli yangilash',
    conflict_rules: 'Konflikt maqsadi va qat’iy qoidalar',
    merge_demo: 'MERGE INTO: Uchta amal bitta so‘rovda',
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
    ['L1', 'intro', 'Ushbu amaliy darsda PostgreSQL 18.6 terminalida INSERT ON CONFLICT, EXCLUDED jadvali hamda standart MERGE buyrug‘ini sinab ko‘ramiz.'],

    ['L2', 'on_conflict_demo', 'Lug‘at jadvaliga so‘z kiritilganda ON CONFLICT DO UPDATE buyrug‘i mavjud hisoblagichni oshiradi, RETURNING esa yangi yoki eski holatni qaytaradi.'],

    ['L3', 'excluded_usage', 'Bir nechta qator qo‘shilganda EXCLUDED nuqta soni iborasi chetlatilgan yangi qiymatni olib, uni jadvaldagi mavjud soniga qo‘shib yangilaydi.'],

    ['L4', 'conflict_rules', 'Konflikt maqsadi faqat UNIQUE yoki birlamchi kalit ustunida ishlaydi, shuningdek bitta buyruqda bir xil kalit ikki marta kelsa xatolik beradi.'],

    ['L5', 'merge_demo', 'Standart MERGE buyrug‘i yangi kelgan tovarlarni ombor bilan solishtirib, bitta harakatda borlarini yangiladi, yangilarini qo‘shdi va eskisini o‘chirdi.'],

    ['L6', 'xulosa', 'PostgreSQL dagi ON CONFLICT yuqori parallellik uchun, MERGE esa murakkab manba jadvallarini sinxronlash uchun eng mukammal vositadir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

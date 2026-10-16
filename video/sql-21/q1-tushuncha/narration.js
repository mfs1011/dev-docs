// SQL 21-bob, 1-video: "Tushuncha" — Ommaviy Yuklash Arxitekturasi va Strategiyalari
(function (g) {
  const scenes = ['intro', 'insert_overhead', 'copy_mechanism', 'server_vs_client', 'indexes_and_tuning', 'error_handling'];
  const sceneNames = {
    intro: 'Ommaviy yuklash zarurati va sekinlik sababi',
    insert_overhead: 'Kichik amallarni bitta amalga birlashtirish',
    copy_mechanism: 'PostgreSQL COPY buyrug‘i',
    server_vs_client: 'Server fayli va psql ning \\copy buyrug‘i',
    indexes_and_tuning: 'Indekslar, cheklovlar va xotira sozlamalari',
    error_handling: 'Xatolarni boshqarish: ON_ERROR ignore va REJECT_LIMIT'
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
    ['L1', 'intro', 'Bazaga minglab yoki millionlab qatorlarni bittalab INSERT qilish juda sekin, chunki har bir qatorda ulanish, so‘rovni tahlil qilish va diskka yozish xarajatlari takrorlanadi.'],

    ['L2', 'insert_overhead', 'MySQL tahliliga ko‘ra, qatorning o‘zini yozish umumiy vaqtning kichik bir qismidir; shuning uchun avtokommitni o‘chirib, barcha yozuvlarni bitta tranzaksiyaga birlashtirish kerak.'],

    ['L3', 'copy_mechanism', 'PostgreSQL da ommaviy yuklashning eng tez yo‘li bu COPY buyrug‘idir; u ma’lumotlarni to‘g‘ridan-to‘g‘ri jadval va fayl o‘rtasida minimal qo‘shimcha xarajat bilan ko‘chiradi.'],

    ['L4', 'server_vs_client', 'COPY serverdagi fayllarni maxsus huquq bilan o‘qiydi, oddiy foydalanuvchilar esa mijoz kompyuteridagi fayllarni yuklash uchun psql ning teskari sleshli copy buyrug‘idan foydalanadilar.'],

    ['L5', 'indexes_and_tuning', 'Maksimal tezlik uchun avval bo‘sh jadvalga yuklash, so‘ngra indekslar va tashqi kalitlarni yaratish, shuningdek xotira hajmini oshirib, oxirida albatta tahlil o‘tkazish tavsiya etiladi.'],

    ['L6', 'error_handling', 'PostgreSQL o‘n sakkizda birinchi xatoda to‘xtash o‘rniga, xato qatorlarni e’tiborsiz qoldirish va ruxsat etilgan xatolar chegarasini belgilash imkoniyati mavjud.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

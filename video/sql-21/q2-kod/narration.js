// SQL 21-bob, 2-video: "Kod" — PostgreSQL 18 da COPY, ON_ERROR va REJECT_LIMIT Amaliyoti
(function (g) {
  const scenes = ['intro', 'default_error', 'on_error_ignore', 'reject_limit', 'server_perm_psql', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18 da COPY va CSV fayl tuzilishi',
    default_error: 'Sukut bo‘yicha xato va tranzaksiyaning bekor bo‘lishi',
    on_error_ignore: 'ON_ERROR ignore va LOG_VERBOSITY verbose',
    reject_limit: 'REJECT_LIMIT bilan xatolar sonini chegaralash',
    server_perm_psql: 'Server ruxsati xatosi va psql dagi \\copy yechimi',
    xulosa: 'So‘rov natijasini CSV ga chiqarish va xulosa'
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
    ['L1', 'intro', 'Amaliyot uchun mahsulotlar nuqta si-es-vi faylidan foydalanamiz, unda beshta qator bo‘lib, ikkitasida narx o‘rnida matnli xato qiymatlar yozilgan.'],

    ['L2', 'default_error', 'Sukut bo‘yicha COPY birinchi xatodayoq to‘xtaydi va xatodan oldingi to‘g‘ri qatorlarni ham bekor qilib, jadvalni bo‘sh qoldiradi.'],

    ['L3', 'on_error_ignore', 'On error ignor va log verbositi sozlamalari bilan xato qatorlar tashlab ketiladi, to‘g‘ri uchta qator esa jadvalga muvaffaqiyatli yuklanadi.'],

    ['L4', 'reject_limit', 'PostgreSQL o‘n sakkizdagi ridjekt limit parametri yordamida ruxsat etilgan xatolar soni bittadan oshganda yuklashni to‘xtatish mumkin.'],

    ['L5', 'server_perm_psql', 'Oddiy foydalanuvchi server faylini o‘qiy olmaganda xato chiqadi; yechim sifatida psql ning bek-slesh kopi buyrug‘i mijoz faylini osongina yuklaydi.'],

    ['L6', 'xulosa', 'Shuningdek, ixtiyoriy selekt so‘rovi natijasini standart autga si-es-vi formatida chiqarib, hisobotlarni qulay eksport qilish mumkin.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

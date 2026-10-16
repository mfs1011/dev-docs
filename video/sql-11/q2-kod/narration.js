// SQL 11-bob, 2-video: "Kod" — PostgreSQL 18 da jonli amallar
(function (g) {
  const scenes = ['intro', 'uz_sort', 'case_turk', 'ci_unique', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL sozlamalari va ICU',
    uz_sort: 'O‘zbekcha so‘zlarni to‘g‘ri saralash',
    case_turk: 'Katta-kichik harf va turkcha ı',
    ci_unique: 'Nondeterministik collation va takrorlanmas email',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L4: 1.0,
    L5: 1.0,
    L7: 1.0,
    L8: 0.8
  };
  const lines = [
    ['L1', 'intro', 'PostgreSQL o‘n sakkiz terminalida kodlash, collation va o‘zbekcha matnlarni saralashni amalda sinab ko‘ramiz.'],
    ['L2', 'intro', 'Birinchi navbatda sozlamalarni tekshiramiz: server va mijoz kodlashi UTF-8, mintaqa esa libc provayderi bilan sozlangani ko‘rinadi.'],

    ['L3', 'uz_sort', 'Endi o‘nta o‘zbekcha so‘zni jadvalga kiritib, uch xil collation bo‘yicha saralaymiz.'],
    ['L4', 'uz_sort', 'C kollatsiyasi baytlar bo‘yicha saralasa, en_US ingliz alifbosiga tayanadi. Faqat uz-Latn ICU kollatsiyasida o‘rik, g‘oz, shaftoli va choy o‘zbek alifbosi qoidasi bo‘yicha eng oxiriga to‘g‘ri joylashadi!'],

    ['L5', 'case_turk', 'Katta-kichik harf amallarida turk tili kollatsiyasini ko‘rsatsak, katta I harfi to‘g‘ri nuqtasiz ı ga aylanadi.'],

    ['L6', 'ci_unique', 'Nondeterministik ci kollatsiyasi yordamida esa katta-kichik harfga sezgir bo‘lmagan elektron pochta ustunini yaratish mumkin.'],
    ['L7', 'ci_unique', 'Katta harf bilan kiritilgan pochtadan so‘ng kichik harf bilan xuddi shu manzil yozilsa, baza xavfsiz tarzda takroriy kalit xatosini beradi.'],

    ['L8', 'xulosa', 'Ko‘rib turganingizdek, ICU kollatsiyalari milliy alifbolarni to‘g‘ri saralash va biznes mantiqni himoyalashda tengsizdir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

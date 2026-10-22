// narration.js — 34-bob: Loyihani yuritish
(function (g) {
  const scenes = [
    'intro',
    'git_apply',
    'git_am',
    'remote_va_tekshirish',
    'integratsiya_usullari',
    'reliz_va_xulosa'
  ];

  const sceneNames = {
    intro: 'Maintainer va Topic Branchlar',
    git_apply: 'Diff Patchlar va git apply',
    git_am: 'Format-Patch va git am',
    remote_va_tekshirish: 'Remote Branch va Uch Nuqtali Diff',
    integratsiya_usullari: 'Rebase, FF va Cherry-pick',
    reliz_va_xulosa: 'Reliz: Tag, Describe va Arxiv'
  };

  const hold = {
    l2: 1.5,
    l4: 2.0,
    l6: 2.0,
    l8: 2.0,
    l10: 2.0,
    l12: 2.0
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu o‘ttiz to‘rtinchi bobda masalaga maintainer, ya'ni loyihani yurituvchi va qabul qiluvchi boshqaruvchi nuqtai nazaridan yondashamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Kelgan patch yoki taklif hali to‘liq ishonilmagan kod hisoblanadi, shuning uchun asosiy tarmoqni buzmaslik uchun begona ish avval alohida topic branch'ga olinadi."
    },
    {
      id: 'l3',
      scene: 'git_apply',
      text: "Oddiy diff fayllari git apply bilan tekshiriladi; ushbu buyruq atomar bo'lib, ziddiyat chiqsa barcha fayllarni toza qoldiradi, commit esa qo‘lda yasaladi."
    },
    {
      id: 'l4',
      scene: 'git_apply',
      text: "Agar o'zgarishlar eskirgan asosda yozilgan bo'lsa, uch tomonlama merge opsiyasi blob xeshlaridan foydalanib to‘qnashuvlarni oson bartaraf etishga yordam beradi."
    },
    {
      id: 'l5',
      scene: 'git_am',
      text: "Format-patch orqali kelgan mbox fayllarini git am buyrug'i bir zumda qo'llab, muallif ismi, sanasi va commit xabarini to'liq saqlab qoladi."
    },
    {
      id: 'l6',
      scene: 'git_am',
      text: "Jarayonda nizo chiqsa, git am continue, skip yoki abort kabi qulay buyruqlar maintainerga butun sessiyani to'liq boshqarish imkonini beradi."
    },
    {
      id: 'l7',
      scene: 'remote_va_tekshirish',
      text: "Doimiy hamkorlarning ommaviy forklaridan branchlarni remote qilib qo'shamiz va yangiliklarni xavfsiz fetch qilib olamiz."
    },
    {
      id: 'l8',
      scene: 'remote_va_tekshirish',
      text: "Aynan nima kiritilayotganini aniqlash uchun uch nuqtali git diff sintaksisi umumiy merge base ajdodidan keyingi haqiqiy farqni to'g'ri ko'rsatadi."
    },
    {
      id: 'l9',
      scene: 'integratsiya_usullari',
      text: "Tarixni toza va chiziqli saqlash uchun topic branch asosiy tarmoq ustiga rebase qilinadi va main faqat fast-forward bilan yangilanadi."
    },
    {
      id: 'l10',
      scene: 'integratsiya_usullari',
      text: "Katta seriyadan faqat ma'lum bir zarur o'zgarishni ajratib olish kerak bo'lganda, git cherry-pick buyrug'i yangi commit hosil qilib yordamga keladi."
    },
    {
      id: 'l11',
      scene: 'reliz_va_xulosa',
      text: "Loyiha relizga tayyor bo'lgach, annotated reliz tegi qo'yiladi, git describe orqali build raqami olinadi va git archive yordamida toza arxiv yasaladi."
    },
    {
      id: 'l12',
      scene: 'reliz_va_xulosa',
      text: "Xulosa qilganda, qat'iy tekshirish, alohida topic branchlar va to'g'ri integratsiya vositalari yirik loyihalarni yillar davomida barqaror saqlash garovidir."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

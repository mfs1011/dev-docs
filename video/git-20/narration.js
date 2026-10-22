// Git 20-bob videosi: "Branch — bu ko'rsatkich" (content/git/20-branch-bu-ref.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'branch_yaratish',
    'switch_va_siljish',
    'tarix_ajralishi',
    'switch_himoyasi',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Branch Tushunchasi: 41 Baytlik Ko‘rsatkich',
    branch_yaratish: 'git branch va Arzon Yaratish',
    switch_va_siljish: 'git switch va Ko‘rsatkich Siljishi',
    tarix_ajralishi: 'Tarix Ajralishi va Graf Chizmasi',
    switch_himoyasi: 'Switch Himoyasi va Detached HEAD',
    xulosa: 'Xulosa: switch va checkout Farqi'
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
      text: "Salom! Ushbu yigirmanchi bobda Git'ning eng mashhur va qulay imkoniyatlaridan biri bo‘lgan brenchlar, ya’ni tarmoqlarning ichki tuzilishini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git'da brench fayllar nusxasi emas, balki oxirgi commit heshini saqlovchi atigi qirq bir baytlik o‘ta yengil ko‘rsatkich fayldir."
    },
    {
      id: 'l3',
      scene: 'branch_yaratish',
      text: "git branch buyrug‘i joriy commitga qaragan yangi ko‘rsatkich faylini bir zumda yaratadi, ammo HEAD hali ham eski brenchda qoladi."
    },
    {
      id: 'l4',
      scene: 'branch_yaratish',
      text: "Loyiha hajmi qanchalik katta bo‘lmasin, brench ochish diskdan joy olmaydi va birorta ham faylni ortiqcha nusxalamaydi."
    },
    {
      id: 'l5',
      scene: 'switch_va_siljish',
      text: "git switch buyrug‘i orqali yangi brenchga o‘tganimizda HEAD fayli o‘zgaradi va navbatdagi commit aynan shu brench ko‘rsatkichini oldinga siljitadi."
    },
    {
      id: 'l6',
      scene: 'switch_va_siljish',
      text: "Bu paytda boshqa brenchlar o‘z joyida qoladi, chunki Git faqat HEAD ulangan faol brench faylidagi heshni yangilaydi."
    },
    {
      id: 'l7',
      scene: 'tarix_ajralishi',
      text: "Eski brenchga qaytib yana commit qilsak, loyiha tarixi ikki mustaqil tarmoqqa ajralib, chiroyli graf hosil qiladi."
    },
    {
      id: 'l8',
      scene: 'tarix_ajralishi',
      text: "git log graph va all opsiyalari butun tarmoqlar qayerda ajralib, qanday rivojlanayotganini aniq ko‘rsatib beradi."
    },
    {
      id: 'l9',
      scene: 'switch_himoyasi',
      text: "Brench almashtirishda saqlanmagan o‘zgarishlar to‘qnashsa, Git xavfsizlik yuzasidan switch jarayonini darhol to‘xtatib, ishingizni saqlab qoladi."
    },
    {
      id: 'l10',
      scene: 'switch_himoyasi',
      text: "To‘g‘ridan-to‘g‘ri commitga o‘tish esa detached HEAD holatini keltirib chiqaradi va bu paytda yangi kommitlar brenchsiz qolishidan ehtiyot bo‘lish lozim."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Zamonaviy Git'da brenchlar uchun switch, fayllarni tiklash uchun esa restore buyrug‘i standart qilib belgilangan."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi yigirma birinchi bobda turli brenchlardagi mustaqil ishlarni birlashtiruvchi merge mexanizmini to‘liq ko‘rib chiqamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '20-bob',
    title: "Branch — bu ko'rsatkich",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

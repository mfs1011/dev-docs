// Git 12-bob videosi: "Teglar va alias'lar" (content/git/12-teglar-va-aliaslar.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'annotated_vs_lw',
    'push_va_delete',
    'describe_va_detached',
    'aliaslar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Teglar Nima va Doimiy Belgilar',
    annotated_vs_lw: 'Annotated va Lightweight Teglar',
    push_va_delete: 'Teglarni Push Qilish va O‘chirish',
    describe_va_detached: 'git describe va Detached HEAD',
    aliaslar: 'Git Aliaslari va Qulaylik',
    xulosa: 'Xulosa va Tavsiyalar'
  };

  const hold = {
    l2: 1.0,
    l4: 1.0,
    l6: 1.0,
    l8: 1.0,
    l10: 1.0,
    l12: 1.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu o‘n ikkinchi bobda Git teglari, ularning turlari hamda ishni tezlashtiruvchi alias taxalluslarini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Teg loyiha tarixidagi muhim reliz va burilish nuqtalariga qo‘yiladigan doimiy nom bo‘lib, branchdan farqli ravishda harakatlanmaydi."
    },
    {
      id: 'l3',
      scene: 'annotated_vs_lw',
      text: "Git'da ikki xil teg bor: yengil lightweight teg faqat commit hash'iga ko‘rsatuvchi oddiy qirq bir baytlik ko‘rsatkich fayldir."
    },
    {
      id: 'l4',
      scene: 'annotated_vs_lw',
      text: "Annotated izohli teg esa alohida obyekt bo‘lib, unga muallif, sana, reliz eslatmasi va hatto raqamli imzo biriktiriladi."
    },
    {
      id: 'l5',
      scene: 'push_va_delete',
      text: "Standart git push buyrug‘i teglarni avtomatik serverga yubormaydi; buning uchun tegga aniq murojaat qilish yoki follow-tags opsiyasi kerak."
    },
    {
      id: 'l6',
      scene: 'push_va_delete',
      text: "Keraksiz teglarni lokalda git tag minus d, masofaviy omborda esa git push minus minus delete yordamida oson o‘chirish mumkin."
    },
    {
      id: 'l7',
      scene: 'describe_va_detached',
      text: "Git describe buyrug‘i commit eng yaqin teggacha necha qadam masofada ekanini inson tushunadigan chiroyli formatda ifodalaydi."
    },
    {
      id: 'l8',
      scene: 'describe_va_detached',
      text: "Teg nomiga switch qilsangiz detached HEAD holatiga o‘tasiz; eski versiya ustida ishlash uchun tegdan yangi branch ochish lozim."
    },
    {
      id: 'l9',
      scene: 'aliaslar',
      text: "Tez-tez yoziladigan uzun buyruqlarni qisqartirish uchun Git sozlamalarida maxsus alias taxalluslari o‘rnatiladi."
    },
    {
      id: 'l10',
      scene: 'aliaslar',
      text: "Masalan, git st yoki git last kabi qisqa buyruqlar kundalik terminaldagi ish maromini sezilarli darajada tezlashtiradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Rasmiy relizlar uchun har doim annotated teglardan foydalaning va e’lon qilingan teglarni qayta surishdan saqlaning."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "O‘z ish uslubingizga mos aliaslarni sozlab oling va Git bilan ancha samarali hamda qulay ishlang."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '12-bob',
    title: "Teglar va alias'lar",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

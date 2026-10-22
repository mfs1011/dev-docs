// Git 24-bob videosi: "Rebase" (content/git/24-rebase.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'hashlar_va_ichki_tuzilish',
    'toza_tarix_va_fast_forward',
    'konflikt_va_rebase_boshqaruvi',
    'rebase_oltin_qoidasi',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Rebase Tushunchasi: Transplantatsiya',
    hashlar_va_ichki_tuzilish: 'Hashlar O‘zgarishi va Commit Ichida',
    toza_tarix_va_fast_forward: 'Toza Tarix va Fast-Forward Merge',
    konflikt_va_rebase_boshqaruvi: 'Rebase Konflikti: --continue va --abort',
    rebase_oltin_qoidasi: 'Rebasening Oltin Qoidasi',
    xulosa: 'Xulosa: Rebase vs Merge Tanlovi'
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
      text: "Salom! Ushbu yigirma to‘rtinchi bobda Git'dagi eng qiziqarli va kuchli vositalardan biri bo‘lgan rebase texnikasini to‘liq o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Rebase brenchdagi kommitlarni boshqa asos ustiga qaytadan yasash bo‘lib, u loyiha tarixini ko‘chirib o‘tqazish, ya’ni transplantatsiya amaliyotidir."
    },
    {
      id: 'l3',
      scene: 'hashlar_va_ichki_tuzilish',
      text: "Rebase kommitlarni jismonan ko‘chirmaydi, balki ularning ota kommitini o‘zgartirib, mutlaqo yangi heshli kommitlar yaratadi."
    },
    {
      id: 'l4',
      scene: 'hashlar_va_ichki_tuzilish',
      text: "Bunda muallif va uning asl yozilgan sanasi saqlanib qoladi, ammo kommitter vaqti rebase qilingan yangi paytga moslab yangilanadi."
    },
    {
      id: 'l5',
      scene: 'toza_tarix_va_fast_forward',
      text: "Rebasedan so‘ng barcha kommitlar asosiy brench davomiga to‘g‘ri chiziq bo‘lib joylashadi va ortiqcha tarmoqlanish yo‘qoladi."
    },
    {
      id: 'l6',
      scene: 'toza_tarix_va_fast_forward',
      text: "Natijada asosiy brenchga qaytib, hech qanday merge kommit yaratmasdan, toza fast-forward mergeni bemalol bajarish mumkin."
    },
    {
      id: 'l7',
      scene: 'konflikt_va_rebase_boshqaruvi',
      text: "Agar rebase jarayonida konflikt yuzaga kelsa, Git to‘xtaydi va sizdan to‘qnashgan qatorlarni hal qilishni so‘raydi."
    },
    {
      id: 'l8',
      scene: 'konflikt_va_rebase_boshqaruvi',
      text: "Faylni to‘g‘rilab git add qilgach, yangi kommit qilinmaydi, balki git rebase continue buyrug‘i bilan jarayon davom ettiriladi."
    },
    {
      id: 'l9',
      scene: 'rebase_oltin_qoidasi',
      text: "Rebasening qat’iy oltin qoidasi mavjud: serverga yuborilgan va boshqa dasturchilar ishlatayotgan ommaviy brenchlarni aslo rebase qilmang."
    },
    {
      id: 'l10',
      scene: 'rebase_oltin_qoidasi',
      text: "Chunki heshlarning o‘zgarishi jamoa a’zolarida bir xil ishlarning duplikat bo‘lib ketishi va og‘ir to‘qnashuvlarga olib keladi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Rebase shaxsiy brenchda chiroyli va toza tarix yaratish uchun, merge esa jamoaviy haqiqiy tarixni saqlash uchun qulaydir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda kommitlarni birlashtirish, tahrirlash va tartibini o‘zgartiruvchi interaktiv rebase imkoniyatlarini o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '24-bob',
    title: 'Rebase',
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

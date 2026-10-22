// narration.js — 42-bob: reflog va ma'lumotni tiklash
(function (g) {
  const scenes = [
    'reflog_intro',
    'reflog_basics',
    'reflog_syntax',
    'reflog_restore',
    'fsck_lost_found',
    'reflog_gc_cleanup'
  ];

  const sceneNames = {
    reflog_intro: "Gitda Xavfsizlik To'ri va O'chmas Obyektlar",
    reflog_basics: "git reflog: HEAD va Shoxlarning Harakat Jurnali",
    reflog_syntax: "Reflog Sintaksisi: HEAD@{n} va Vaqtli Murojaatlar",
    reflog_restore: "Yo'qolgan Commitlarni Qaytarish: branch va reset",
    fsck_lost_found: "git fsck --lost-found: Dangling Obyektlar",
    reflog_gc_cleanup: "Reflog Umri, gc va Katta Fayllarni Tozalash"
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
      scene: 'reflog_intro',
      text: "Gitda hard reset yoki shoxni majburan o'chirish oqibatida commitlar yo'qolgandek ko'rinsa ham, aslida ular obyektlar bazasida to'liq saqlanib turadi."
    },
    {
      id: 'l2',
      scene: 'reflog_intro',
      text: "Git deyarli har doim faqat yangi ma'lumot qo'shadi; ref ko'rsatkichlari siljigani bilan eski obyektlar diskdan darhol o'chirib yuborilmaydi."
    },
    {
      id: 'l3',
      scene: 'reflog_basics',
      text: "Reflog — bu HEAD va har bir shoxning qachon va qayerga ko'chganini yozib boruvchi qat'iy lokal harakatlar jurnali hisoblanadi."
    },
    {
      id: 'l4',
      scene: 'reflog_basics',
      text: "Git reflog buyrug'i oxirgi amallarni, xususan reset, commit hamda rebase siljishlarini vaqt tartibida aniq ko'rsatib beradi."
    },
    {
      id: 'l5',
      scene: 'reflog_syntax',
      text: "HEAD figurali qavsda n belgisi orqali HEAD ning n qadam oldingi holatiga, yoki shox nomi va sana orqali o'tmishdagi nuqtaga murojaat qilinadi."
    },
    {
      id: 'l6',
      scene: 'reflog_syntax',
      text: "Shuningdek, kuchukcha chiziqcha bir sintaksisi oldingi checkout qilingan shoxga tezkor qaytish yoki ko'zdan kechirish imkonini taqdim etadi."
    },
    {
      id: 'l7',
      scene: 'reflog_restore',
      text: "Yo'qolgan commit xeshini reflogdan topgach, uni git branch yangi shox HEAD bir buyrug'i bilan xavfsiz yangi shoxga biriktirish mumkin."
    },
    {
      id: 'l8',
      scene: 'reflog_restore',
      text: "Yoki joriy shoxda git reset hard HEAD bir buyrug'ini berib, tashlab ketilgan barcha o'zgarishlarni bir zumda ortga qaytarish mumkin."
    },
    {
      id: 'l9',
      scene: 'fsck_lost_found',
      text: "Agar reflog jurnali tozalangan bo'lsa ham, git fsck lost-found buyrug'i hech bir ko'rsatkich bog'lanmagan osilib qolgan dangling obyektlarni topadi."
    },
    {
      id: 'l10',
      scene: 'fsck_lost_found',
      text: "Topilgan xeshlar git show orqali tekshirilib, lost-found papkasidagi fayllardan kerakli kodlar to'liq qayta tiklab olinadi."
    },
    {
      id: 'l11',
      scene: 'reflog_gc_cleanup',
      text: "Reflog yozuvlari lokal sozlamaga ko'ra to'qson kungacha saqlanadi va masofaviy repozitoriyga hech qachon uzatilmaydi."
    },
    {
      id: 'l12',
      scene: 'reflog_gc_cleanup',
      text: "Katta hajmli maxfiy fayllarni repo tarixidan butunlay yo'qotish uchun esa git filter-repo hamda gc prune buyruqlaridan foydalaniladi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

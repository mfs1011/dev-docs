// Git 22-bob videosi: "Konfliktlar" (content/git/22-konfliktlar.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'belgilar_va_status',
    'uch_bosqich_indeks',
    'git_fayllari',
    'hal_qilish_va_abort',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Konflikt Tushunchasi: Nega Chiqadi?',
    belgilar_va_status: 'Konflikt Belgilari va git status',
    uch_bosqich_indeks: 'Index Bosqichlari: Stage 1, 2 va 3',
    git_fayllari: '.git Papkasi: MERGE_HEAD va AUTO_MERGE',
    hal_qilish_va_abort: 'Konfliktni Hal Qilish va git merge --abort',
    xulosa: 'Xulosa: zdiff3 va --ours / --theirs'
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
      text: "Salom! Ushbu yigirma ikkinchi bobda har qanday dasturchi hayotida uchraydigan merge konfliktlari va ularni xavfsiz hal qilishni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Konflikt bu tizim xatosi emas, balki bir joyni ikki xil o‘zgartirganda Git inson aralashuvi va yakuniy qarorini kutayotgan holatdir."
    },
    {
      id: 'l3',
      scene: 'belgilar_va_status',
      text: "git merge to‘xtaganda, git status buyrug‘i fayllarni both modified va unmerged qilib ko‘rsatadi."
    },
    {
      id: 'l4',
      scene: 'belgilar_va_status',
      text: "Fayl ichida esa HEAD tomonimiz, ajratuvchi tenglik chiziqlari va ikkinchi branch o‘zgarishlarini ko‘rsatuvchi maxsus belgilar paydo bo‘ladi."
    },
    {
      id: 'l5',
      scene: 'uch_bosqich_indeks',
      text: "Konflikt paytida indeksda har bir fayl uchun uchta alohida bosqich, ya’ni stage saqlanadi."
    },
    {
      id: 'l6',
      scene: 'uch_bosqich_indeks',
      text: "Stage bir umumiy ajdod snapshotini, stage ikki joriy branchimizni, stage uch esa qo‘shilayotgan branch versiyasini ifodalaydi."
    },
    {
      id: 'l7',
      scene: 'git_fayllari',
      text: "Git papkasi ichida MERGE_HEAD, MERGE_MSG va AUTO_MERGE fayllari yaratilib, jarayon holati xotirada mahkam ushlab turiladi."
    },
    {
      id: 'l8',
      scene: 'git_fayllari',
      text: "git diff buyrug‘i esa ikkala tomon bilan solishtiruvchi combined diff rejimida faqat yechilmagan qatorlarni qulay ajratib beradi."
    },
    {
      id: 'l9',
      scene: 'hal_qilish_va_abort',
      text: "Fayldagi keraksiz belgilarni o‘chirib to‘g‘rilagach, git add qilsak, indeksdagi uchta stage o‘rniga yagona toza stage nol o‘rnatiladi."
    },
    {
      id: 'l10',
      scene: 'hal_qilish_va_abort',
      text: "Agar adashib ketsak yoki merjeni to‘xtatmoqchi bo‘lsak, git merge abort buyrug‘i loyihani avvalgi asl holatiga to‘liq qaytaradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "zdiff3 sozlamasi esa konflikt ichida umumiy ajdod matnini ham ko‘rsatib, to‘g‘ri xulosa chiqarishni yanada osonlashtiradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda brenchlarni qulay boshqarish, ro‘yxatlash, qayta nomlash va tekshirish sirlarini to‘liq ko‘rib chiqamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '22-bob',
    title: 'Konfliktlar',
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

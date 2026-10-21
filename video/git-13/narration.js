// Git 13-bob videosi: "Plumbing, porcelain va .git papkasi" (content/git/13-plumbing-va-porcelain.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'nega_ikki_qatlam',
    'git_papkasi',
    'add_va_commit_ichida',
    'plumbing_amalda',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Porcelain va Plumbing Tushunchasi',
    nega_ikki_qatlam: 'Nega Ikki Qatlam Kerak?',
    git_papkasi: '.git Papkasi — Omborning Asli',
    add_va_commit_ichida: 'add va commit Ichkaridan Qanday Ishlaydi?',
    plumbing_amalda: 'O‘z Git Buyrug‘ingizni Yaratish',
    xulosa: 'Xulosa va Keyingi Qadam'
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
      text: "Salom! Ushbu o‘n uchinchi bobda Git'ning ichki mexanizmlari, quyi darajadagi plumbing buyruqlari hamda sirli .git papkasini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git buyruqlari ikki qatlamga bo‘linadi: foydalanuvchiga qulay porcelain buyruqlar va kapot ostidagi quvurlar kabi ishlovchi plumbing buyruqlari."
    },
    {
      id: 'l3',
      scene: 'nega_ikki_qatlam',
      text: "Odamlar uchun mo‘ljallangan porcelain buyruqlar vaqt o‘tishi bilan qulayroq so‘zlar va ranglar bilan yangilanib turishi mumkin."
    },
    {
      id: 'l4',
      scene: 'nega_ikki_qatlam',
      text: "Avtomatlashtirilgan skriptlar va dasturlar uchun esa barqaror, hech qachon formati o‘zgarmaydigan plumbing buyruqlari xizmat qiladi."
    },
    {
      id: 'l5',
      scene: 'git_papkasi',
      text: "Loyiha ichidagi .git papkasi Git'ning butun ma’lumotlar bazasi bo‘lib, fayllaringiz faqat undan olingan ishchi nusxadir."
    },
    {
      id: 'l6',
      scene: 'git_papkasi',
      text: "Uning ichida eng muhim to‘rtta ustun joylashgan: obyektlar bazasi, ref ko‘rsatkichlari, HEAD fayli hamda staging hududini ifodalovchi index."
    },
    {
      id: 'l7',
      scene: 'add_va_commit_ichida',
      text: "Git add buyrug‘i fayl mazmunidan blob obyektini yaratib, index fayliga uning rejimi va hash kodini yozib qo‘yadi."
    },
    {
      id: 'l8',
      scene: 'add_va_commit_ichida',
      text: "Git commit esa indexdan tree obyektini shakllantirib, muallif va xabarni biriktirgan holda commit obyekti yasaydi hamda branch ko‘rsatkichini siljitadi."
    },
    {
      id: 'l9',
      scene: 'plumbing_amalda',
      text: "Masalan, git status --porcelain yoki git rev-parse kabi plumbing vositalari skriptlar uchun eng toza natijani beradi."
    },
    {
      id: 'l10',
      scene: 'plumbing_amalda',
      text: "Ushbu barqaror qatlam yordamida tizimga o‘z shaxsiy buyruqlaringizni qo‘shishingiz va mustaqil dasturlar integratsiyasini qurishingiz mumkin."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Plumbing buyruqlari Git qanday ishlashini tushunish, murakkab xatolarni tuzatish va avtomatlashtirish uchun bebaho poydevor hisoblanadi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n to‘rtinchi bobda Git'ning eng birinchi g‘ishti bo‘lgan blob obyektlari va ularning hash kodlarini qo‘lda yasashni o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '13-bob',
    title: "Plumbing, porcelain va .git papkasi",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

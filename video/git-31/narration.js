// narration.js — 31-bob: Branch bilan ishlash uslublari
(function (g) {
  const scenes = [
    'intro',
    'topic_branchlar',
    'silos_va_darajalar',
    'gitgit_tizimi',
    'merge_upwards',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Branch Workflow Asoslari',
    topic_branchlar: 'Topic Branchlar Hayot Sikli',
    silos_va_darajalar: 'Barqarorlik Siloslari',
    gitgit_tizimi: 'gitworkflows Integratsiya Tizimi',
    merge_upwards: 'Merge Upwards Qoidasi',
    xulosa: 'Xulosa va Amaliy Maslahatlar'
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
      text: "Salom! Ushbu o‘ttiz birinchi bobda Git loyihalarida branchlar bilan ishlash uslublari, ya'ni workflow strategiyalarini batafsil tahlil qilamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git'da branchlar juda yengil bo'lgani sababli ikki toifada ishlatiladi: yillab yashovchi barqaror integratsiya branchlari hamda aniq bitta vazifaga yo'naltirilgan qisqa umrli topic branchlar."
    },
    {
      id: 'l3',
      scene: 'topic_branchlar',
      text: "Topic branch har bir alohida xususiyat yoki xato tuzatish uchun ochilib, uning hayot sikli yaratish, ishlash, birlashtirish va o'chirishdan iborat bo'ladi."
    },
    {
      id: 'l4',
      scene: 'topic_branchlar',
      text: "Keraksiz yoki rad etilgan yechimlar minus katta D bayrog'i bilan o'chiriladi. Qolgan sifatli branchlar esa bevosita asosiy chiziqqa merge qilinadi."
    },
    {
      id: 'l5',
      scene: 'silos_va_darajalar',
      text: "Barqarorlik siloslari konsepsiyasida har bir branch ma'lum bir yetuklik darajasini ifodalaydi: sinovdagi kod asta-sekin eng yuqori barqaror reliz branchiga ko'tariladi."
    },
    {
      id: 'l6',
      scene: 'silos_va_darajalar',
      text: "Integratsiya jarayonida minus minus no ef ef bayrog'i alohida tarixiy nuqta qoldirsa, minus minus ef ef onli esa faqat qat'iy oldinga siljishni ta'minlaydi."
    },
    {
      id: 'l7',
      scene: 'gitgit_tizimi',
      text: "Rasmiy gitworkflows hujjatida to'rtta integratsiya branchi ko'rsatilgan: maint texnik tuzatishlar, master reliz, next sinov, seen esa bir martalik eksperimentlar uchun xizmat qiladi."
    },
    {
      id: 'l8',
      scene: 'gitgit_tizimi',
      text: "Eng muhim qoida shuki, yangi topic branch har doim u oxir-oqibat kirishi kerak bo'lgan eng eski integratsiya branchidan ajratib olinishi shart."
    },
    {
      id: 'l9',
      scene: 'merge_upwards',
      text: "Xatolarni tuzatish har doim eng quyi qo'llab-quvvatlanadigan branchga commit qilinadi, so'ngra integratsiya branchlari bir-biriga yuqoriga qarab merge qilinadi."
    },
    {
      id: 'l10',
      scene: 'merge_upwards',
      text: "Bu merge upwards tamoyili beqaror yangiliklarning relizga oqib o'tishining oldini oladi va butun loyiha bo'ylab barqarorlikni kafolatlaydi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilganda, qisqa umrli topic branchlar, barqarorlik darajalari va yuqoriga merge qilish tamoyili yirik jamoalarda toza va xavfsiz kod yuritish imkonini beradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘ttiz ikkinchi bobda bir nechta dasturchilar o‘rtasidagi taqsimlangan workflowlar va markazlashtirilgan hamda integratsion boshqaruvni o‘rganamiz."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

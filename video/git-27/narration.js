// narration.js — 27-bob: Remote'lar
(function (g) {
  const scenes = [
    'intro',
    'remote_boshqaruvi',
    'fetch_ichki_tuzilishi',
    'push_va_fast_forward',
    'pull_strategiyalari',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish: Remote Tushunchasi va Maqsadi',
    remote_boshqaruvi: 'Remote Boshqaruvi: Ko‘rish, Qo‘shish va Set-url',
    fetch_ichki_tuzilishi: 'Git Fetch: Xavfsiz Yuklash Mexanizmi',
    push_va_fast_forward: 'Git Push va Fast-forward Himoyasi',
    pull_strategiyalari: 'Git Pull: Rebase va Merge Strategiyalari',
    xulosa: 'Xulosa va Remote Branchlar'
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
      text: 'Salom! Ushbu yigirma yettinchi bobda Git\'da masofaviy repozitoriylar, ya’ni remote\'lar bilan ishlash asoslarini batafsil o‘rganamiz.'
    },
    {
      id: 'l2',
      scene: 'intro',
      text: 'Remote — bu uzoqdagi yoki boshqa papkada joylashgan loyiha omborining qulay qisqa taxallusi bo‘lib, jamoaviy almashinuvning poydevori hisoblanadi.'
    },
    {
      id: 'l3',
      scene: 'remote_boshqaruvi',
      text: 'git remote add buyrug‘i orqali yangi remote ulaymiz, git remote -v esa qabul qilish va yuborish uchun sozlangan to‘liq manzillarni ko‘rsatadi.'
    },
    {
      id: 'l4',
      scene: 'remote_boshqaruvi',
      text: 'Agar server manzili o‘zgarsa, git remote set-url orqali mavjud sozlamalarni buzmasdan manzilni yangilashimiz mumkin.'
    },
    {
      id: 'l5',
      scene: 'fetch_ichki_tuzilishi',
      text: 'git fetch buyrug‘i faqat yangi obyektlar va remote-tracking ko‘rsatkichlarni yuklab oladi, biroq sizning ishchi fayllaringizga mutlaqo tegmaydi.'
    },
    {
      id: 'l6',
      scene: 'fetch_ichki_tuzilishi',
      text: 'Natijada serverdagi yangiliklarni git log va git diff orqali xavfsiz ko‘zdan kechirib, keyin birlashtirish to‘g‘risida qaror qabul qilamiz.'
    },
    {
      id: 'l7',
      scene: 'push_va_fast_forward',
      text: 'git push -u origin main buyrug‘i o‘zgarishlarni serverga yuboradi hamda kelgusidagi buyruqlar uchun kuzatuvchi tarmoqni avtomatik o‘rnatadi.'
    },
    {
      id: 'l8',
      scene: 'push_va_fast_forward',
      text: 'Agar serverda sizda yo‘q boshqa yangi commitlar mavjud bo‘lsa, Git tarixdan hech narsa tushib qolmasligi uchun pushni rad etadi.'
    },
    {
      id: 'l9',
      scene: 'pull_strategiyalari',
      text: 'Tarix ajralgan vaziyatda git pull --rebase buyrug‘i o‘zgarishlaringizni server commitlari ustiga chiroyli va chiziqli qilib qayta teradi.'
    },
    {
      id: 'l10',
      scene: 'pull_strategiyalari',
      text: 'git pull --no-rebase esa an’anaviy merge commit yaratadi, git pull --ff-only esa faqat toza siljish bo‘lsagina ishlaydi.'
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: 'Ushbu mexanizmlar orqali taqsimlangan jamoada har bir dasturchi o‘z ishini erkin olib boradi va ma’lumotlar xavfsiz almashinadi.'
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: 'Keyingi bobda remote branchlar, ularni masofadan boshqarish va tozalash amallarini yanada chuqurroq o‘rganamiz.'
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

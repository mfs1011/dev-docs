// narration.js — 32-bob: Taqsimlangan workflow'lar
(function (g) {
  const scenes = [
    'intro',
    'markaziy_workflow',
    'integratsiya_menejeri',
    'diktator_va_leytenantlar',
    'merge_va_patch_farqi',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Taqsimlangan Modellar Asoslari',
    markaziy_workflow: 'Markazlashgan Ish Oqimi',
    integratsiya_menejeri: 'Integratsiya Menejeri (Fork & PR)',
    diktator_va_leytenantlar: 'Diktator va Leytenantlar',
    merge_va_patch_farqi: 'Merge va Patch Workflow Farqi',
    xulosa: 'Xulosa va Model Tanlash'
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
      text: "Salom! Ushbu o‘ttiz ikkinchi bobda bir nechta dasturchilar va repozitoriylar o‘rtasida kod almashishning taqsimlangan workflow strategiyalarini tahlil qilamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git markazlashmagan tizim bo'lib, har bir klon to'laqonli repozitoriy hisoblanadi. Bugun markazlashgan, integratsiya menejeri va diktator-leytenantlar modellarini ko'rib chiqamiz."
    },
    {
      id: 'l3',
      scene: 'markaziy_workflow',
      text: "Markazlashgan modelda barcha dasturchilar bitta umumiy repozitoriyga push qiladi. Agar serverdagi tarix o'zgargan bo'lsa, Git boshqalarning ishini ustidan yozishga yo'l qo'ymaydi."
    },
    {
      id: 'l4',
      scene: 'markaziy_workflow',
      text: "Dasturchi avval fetch qilib yangiliklarni o'ziga birlashtiradi va faqat fast-forward bilan yangilangan toza tarixni serverga push qiladi."
    },
    {
      id: 'l5',
      scene: 'integratsiya_menejeri',
      text: "Integratsiya menejeri modelida har kim o'zining ommaviy repozitoriyasiga yozadi, rasmiy etalon repo'ga esa faqat loyiha yurituvchisi, ya'ni maintainer o'tkazadi."
    },
    {
      id: 'l6',
      scene: 'integratsiya_menejeri',
      text: "GitHub va GitLab'dagi mashhur Fork va Pull Request mexanizmi aynan shu model asosida ishlaydi, unda hech kim boshqalarni kutmasdan mustaqil ishlay oladi."
    },
    {
      id: 'l7',
      scene: 'diktator_va_leytenantlar',
      text: "Linux yadrosi kabi minglab dasturchilar ishlaydigan ulkan tizimlarda diktator va leytenantlar deb nomlanuvchi ierarxik boshqaruv qo'llaniladi."
    },
    {
      id: 'l8',
      scene: 'diktator_va_leytenantlar',
      text: "Dasturchilar quyi tizim leytenantlariga kod uzatadi, leytenantlar tekshirib diktatorga taqdim etadi, diktator esa yakuniy kodni etalon repozitoriyga chiqaradi."
    },
    {
      id: 'l9',
      scene: 'merge_va_patch_farqi',
      text: "O'zgarishlarni uzatish shakliga ko'ra merge workflow va patch workflow farqlanadi. Merge usulida to'liq tarmoq tarixi va merge commitlari to'g'ridan-to'g'ri o'tadi."
    },
    {
      id: 'l10',
      scene: 'merge_va_patch_farqi',
      text: "Email orqali uzatiladigan patch workflow'da esa format-patch va git am buyruqlari yordamida faqat alohida toza commitlar zanjiri ko'chirib o'tkaziladi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilganda, kichik va o'rta jamoalarda markazlashgan model, ochiq manbali va ommaviy loyihalarda esa integratsiya menejeri eng yaxshi tanlovdir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘ttiz uchinchi bobda ochiq loyihalarga hissa qo'shish, toza commitlar tayyorlash va patchlarni jo'natish amaliyotini o'rganamiz."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

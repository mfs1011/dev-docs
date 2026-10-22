// narration.js — 43-bob: Submodule, bundle va replace
(function (g) {
  const scenes = [
    'submodule_intro',
    'submodule_manage',
    'bundle_basics',
    'replace_basics',
    'replace_inspect',
    'xulosa'
  ];

  const sceneNames = {
    submodule_intro: "Git Submodule: Repozitoriy Ichida Repozitoriy",
    submodule_manage: "Submodule Boshqaruvi: update va rekursiv klonlash",
    bundle_basics: "git bundle: Tarmoqsiz Repozitoriy Fayli",
    replace_basics: "git replace: Tarixni O'zgartirmasdan Ulash",
    replace_inspect: "Replace Reflari va Tarix Ko'rinishi",
    xulosa: "Xulosa va Ilg'or Ish Oqimlari"
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
      scene: 'submodule_intro',
      text: "Git submodule boshqa bir mustaqil repozitoriyni asosiy loyiha ichiga aniq bir commit bog'lanmasi sifatida kiritish imkonini beradi."
    },
    {
      id: 'l2',
      scene: 'submodule_intro',
      text: "Superproyekt submodule fayllarini emas, balki daraxt obyektida o'n olti nol-nol-nol rejimidagi gitlink commit xeshini saqlaydi."
    },
    {
      id: 'l3',
      scene: 'submodule_manage',
      text: "Yangi loyihani klonlaganda submodullarni to'liq yuklab olish uchun clone recurse-submodules yoki submodule update init buyrug'i qo'llaniladi."
    },
    {
      id: 'l4',
      scene: 'submodule_manage',
      text: "Submodule ichida ishlaganda detached HEAD holati yuzaga kelmasligi uchun uning mos shoxiga o'tib commit qilish tavsiya etiladi."
    },
    {
      id: 'l5',
      scene: 'bundle_basics',
      text: "Git bundle buyrug'i barcha obyektlar va ko'rsatkichlarni tarmoqsiz fleshka yoki elektron pochta orqali uzatish uchun bitta binar faylga jamlaydi."
    },
    {
      id: 'l6',
      scene: 'bundle_basics',
      text: "Hosildor faylni git bundle verify bilan tekshirib, undan to'g'ridan-to'g'ri yangi klon yoki fetch amalini bajarish mumkin."
    },
    {
      id: 'l7',
      scene: 'replace_basics',
      text: "Git replace mexanizmi obyekt xeshlarini qayta yozmasdan turib, bir commit yoki daraxt o'rniga boshqasini ko'rsatishga xizmat qiladi."
    },
    {
      id: 'l8',
      scene: 'replace_basics',
      text: "Ushbu vosita yordamida ikkita ajralgan tarixni birlashtirish yoki juda katta eski commitlarni asosiy zanjirdan ajratish osonlashadi."
    },
    {
      id: 'l9',
      scene: 'replace_inspect',
      text: "Almashtirilgan ko'rsatkichlar refs replace papkasida saqlanadi va git log da haqiqiy tarix kabi shaffof ko'rinadi."
    },
    {
      id: 'l10',
      scene: 'replace_inspect',
      text: "Zarurat tug'ilganda no-replace-objects bayrog'i yordamida repozitoriyning asl nusxasini ko'rish yoki tahrirlash mumkin."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Submodule, bundle va replace vositalari odatiy markaziy repo chegarasidan chiqib, murakkab tizimlarni xavfsiz boshqarishga zamin yaratadi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Har bir asbobning o'ziga xos arxitekturasini tushunish sizni kutilmagan ziddiyatlar va ma'lumot yo'qotish xavfidan asraydi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

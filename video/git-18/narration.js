// Git 18-bob videosi: "Packfile'lar va gc" (content/git/18-packfile-va-gc.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'packfile_va_idx',
    'delta_siqish',
    'delta_zanjirlari',
    'cruft_pack_va_prune',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Loose Obyektlar va Disk Isrofi',
    packfile_va_idx: 'git gc va Packfile Arxitekturasi',
    delta_siqish: 'Delta Siqish va verify-pack',
    delta_zanjirlari: 'Delta Zanjirlari: window va depth',
    cruft_pack_va_prune: 'Cruft Pack va Xavfsiz Tozalash',
    xulosa: 'Xulosa va git maintenance'
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
      text: "Salom! Ushbu o‘n sakkizinchi bobda Git omborini ixchamlashtiruvchi packfile arxitekturasi, delta siqish va axlat yig‘uvchi git gc buyrug‘ini ko‘rib chiqamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git har bir versiyani mustaqil obyekt sifatida to‘liq saqlagani sababli, minglab mayda loose fayllar disk klasterlarida joyni isrof qila boshlaydi."
    },
    {
      id: 'l3',
      scene: 'packfile_va_idx',
      text: "git count-objects buyrug‘i loose obyektlar soni va disk hajmini ko‘rsatsa, git gc ularni bitta yirik pack faylga jamlaydi."
    },
    {
      id: 'l4',
      scene: 'packfile_va_idx',
      text: "Har bir packfile yonida tezkor qidiruv jadvali bo‘lgan nuqta idx indeksi yaratilib, minglab loose fayllar bitta tartibli juftlikka aylanadi."
    },
    {
      id: 'l5',
      scene: 'delta_siqish',
      text: "Packfile ichida o‘xshash obyektlar to‘liq emas, balki bir-biriga nisbatan delta, ya’ni faqat o‘zgargan farqlar ko‘rinishida siqiladi."
    },
    {
      id: 'l6',
      scene: 'delta_siqish',
      text: "git verify-pack buyrug‘i orqali Git eng yirik yoki yangi versiyani to‘liq saqlab, eski versiyani atigi bir necha baytlik delta qilganini ko‘rishimiz mumkin."
    },
    {
      id: 'l7',
      scene: 'delta_zanjirlari',
      text: "Deltalar bir-biriga zanjir bo‘lib ulanishi mumkin; buni boshqarish uchun repack buyrug‘ining window va depth parametrlari xizmat qiladi."
    },
    {
      id: 'l8',
      scene: 'delta_zanjirlari',
      text: "Chuqurroq zanjir diskni maksimal tejaydi, ammo obyektni o‘qish tezligiga ta’sir qilgani uchun Git muvozanatli standart chegaralardan foydalanadi."
    },
    {
      id: 'l9',
      scene: 'cruft_pack_va_prune',
      text: "Hech qaysi branch yoki reflog ko‘rsatmayotgan keraksiz obyektlar darhol o‘chirilmay, xavfsizlik uchun alohida cruft pack fayliga o‘tkaziladi."
    },
    {
      id: 'l10',
      scene: 'cruft_pack_va_prune',
      text: "Ular faqat prune expire muddati, ya’ni odatda ikki hafta o‘tgandan keyingina ombordan butunlay xavfsiz tozalab tashlanadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Zamonaviy Git 2.56 da git maintenance vositasi fon rejimida commit-graph, loose obyektlar va reflarni avtomatik tartibga solib boradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Loose format tezkor yozish imkonini bersa, packfile omborni ixcham va tarmoq orqali uzatishga doimo tayyor holatda saqlaydi."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '18-bob',
    title: "Packfile'lar va gc",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

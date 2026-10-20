// Git 05-bob videosi: "Uch holat va uch hudud" (content/git/05-uch-holat.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'uch_holat',
    'uch_hudud',
    'ish_oqimi',
    'nega_index',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Uch Holat va Uch Hudud',
    uch_holat: 'Faylning Uch Holati',
    uch_hudud: 'Git Loyihasining Uch Hududi',
    ish_oqimi: 'Amaliy Oqim: add va commit',
    nega_index: 'Nega Oraliq Index Bor?',
    xulosa: 'Xulosa'
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
      text: "Salom! Ushbu beshinchi bobda Gitning eng muhim poydevori — uch holat va uch hudud modelini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Shu arxitekturani tushunsangiz, Gitdagi keyingi har qanday buyruqning maqsadi va mohiyatini osongina ilg‘ab olasiz."
    },
    {
      id: 'l3',
      scene: 'uch_holat',
      text: "Git kuzatuvidagi har bir fayl uchta holatdan birida bo‘ladi: modifayd, steyjd yoki kommitted."
    },
    {
      id: 'l4',
      scene: 'uch_holat',
      text: "Modifayd — fayl diskda tahrirlangan; steyjd — keyingi saqlashga tayyorlangan; kommitted esa arxivga muhrlanganini bildiradi."
    },
    {
      id: 'l5',
      scene: 'uch_hudud',
      text: "Bu holatlarga loyihaning uchta mustaqil hududi mos keladi: vorking tri, steyjing eria va git direktori."
    },
    {
      id: 'l6',
      scene: 'uch_hudud',
      text: "Vorking tri — diskdagi ishchi fayllar; indeks — bo‘lajak kommit qoralamasi; nuqta git esa butun arxiv omboridir."
    },
    {
      id: 'l7',
      scene: 'ish_oqimi',
      text: "Ish oqimi juda oddiy: tahrirlangan faylni git add bilan indeksga qo‘shasiz, so‘ng git kommit orqali tarixga yozasiz."
    },
    {
      id: 'l8',
      scene: 'ish_oqimi',
      text: "Muhim qoida: faylni indeksga qo‘shgach, diskda yana o‘zgartirsangiz, indeksdagi nusxa o‘zgarmaydi, ikkisi alohida yashaydi."
    },
    {
      id: 'l9',
      scene: 'nega_index',
      text: "Ko‘p tizimlardan farqli o‘laroq, Git oraliq indeks hududini kiritganining to‘rtta katta sababi bor."
    },
    {
      id: 'l10',
      scene: 'nega_index',
      text: "U kommitlarni saralab yig‘ish, saqlashdan oldin tekshirish, tezkor kesh va konfliktlarni oson yechish imkonini beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, Git — bu uch hudud o‘rtasida o‘zgarishlarni xavfsiz va aniq boshqaruvchi mexanizmdir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda ushbu hududlar bilan ishlaydigan status, add va commit buyruqlarini amalda ko‘ramiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

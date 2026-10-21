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
      text: "Salom! Ushbu beshinchi bobda Gitning eng asosiy poydevori — uch holat va uch hudud modelini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Ushbu arxitekturani chuqur tushunsangiz, Gitdagi barcha keyingi buyruqlarning maqsadi va ishlash mexanizmini osongina ilg‘ab olasiz."
    },
    {
      id: 'l3',
      scene: 'uch_holat',
      text: "Git kuzatuvidagi har bir fayl uchta asosiy holatdan birida bo‘ladi: modifayd, steyjd yoki kommitted holati."
    },
    {
      id: 'l4',
      scene: 'uch_holat',
      text: "Modifayd — fayl diskda tahrirlangan; steyjd — bo‘lajak kommitga tayyorlangan; kommitted esa arxivga doimiy muhrlanganini bildiradi."
    },
    {
      id: 'l5',
      scene: 'uch_hudud',
      text: "Ushbu uch holatga loyihaning uchta mustaqil hududi mos keladi: vorking tri, steyjing eria va git direktori."
    },
    {
      id: 'l6',
      scene: 'uch_hudud',
      text: "Vorking tri — diskdagi ishchi fayllaringiz; indeks — navbatdagi kommit qoralamasi; nuqta git esa butun arxiv omboridir."
    },
    {
      id: 'l7',
      scene: 'ish_oqimi',
      text: "Amaliy ish oqimi juda aniq: faylni tahrirlab, git add yordamida indeksga olasiz, so‘ng git kommit bilan uni tarixga yozasiz."
    },
    {
      id: 'l8',
      scene: 'ish_oqimi',
      text: "Muhim qoida: fayl indeksga olingach diskda yana o‘zgartirilsa, indeksdagi nusxa o‘zgarmaydi, ikkisi mustaqil yashaydi."
    },
    {
      id: 'l9',
      scene: 'nega_index',
      text: "Boshqa tizimlardan farqli o‘laroq, Git oraliq indeks hududini bejiz kiritmagan: uning to‘rtta katta afzalligi bor."
    },
    {
      id: 'l10',
      scene: 'nega_index',
      text: "U kommitlarni mantiqiy saralash, saqlashdan oldin tekshirish, tezkor kesh va konfliktlarni oson hal qilish imkonini beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, Git — bu uch hudud o‘rtasida o‘zgarishlarni xavfsiz va aniq boshqaruvchi qudratli tizimdir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda ushbu hududlar bilan ishlaydigan status, add va kommit buyruqlarini amalda sinaymiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

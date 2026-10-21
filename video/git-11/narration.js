// Git 11-bob videosi: "Bekor qilish: amend va restore" (content/git/11-bekor-qilish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'amend',
    'unstage',
    'restore_worktree',
    'eski_yol',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Bekor Qilish Xaritasi',
    amend: 'commit --amend: Oxirgi Commitni Yangilash',
    unstage: 'git restore --staged: Indexdan Chiqarish',
    restore_worktree: 'git restore: Diskdagi O‘zgarishni Tashlash',
    eski_yol: 'Eski Usul: checkout va restore Farqi',
    xulosa: 'Xavflar Xaritasi va Xulosa'
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
      text: "Salom! Ushbu o‘n birinchi bobda kundalik ishlarda xato ketgan amallarni orqaga qaytarish va bekor qilish usullarini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Xato oxirgi kommitda, indeks qoralamasida yoki diskdagi ishchi papkada bo‘lishiga qarab turli buyruqlar qo‘llaniladi."
    },
    {
      id: 'l3',
      scene: 'amend',
      text: "Agar kommitda fayl unutilgan yoki xabarda xatolik ketgan bo‘lsa, git commit minus minus emend buyrug‘i uni yangisiga almashtirib beradi."
    },
    {
      id: 'l4',
      scene: 'amend',
      text: "Muhim qoida: emend yangi kommit obyekti yaratadi, shuning uchun uni faqat hali tashqariga push qilinmagan holatda ishlatish zarur."
    },
    {
      id: 'l5',
      scene: 'unstage',
      text: "Keraksiz fayl tasodifan steyj qilib qo‘yilganda, git restore minus minus steyjd buyrug‘i uni indeksdan xavfsiz chiqarib oladi."
    },
    {
      id: 'l6',
      scene: 'unstage',
      text: "Bu buyruq ishchi faylga aslo tegmaydi, diskdagi barcha o‘zgarishlar o‘z joyida butun saqlanib qoladi."
    },
    {
      id: 'l7',
      scene: 'restore_worktree',
      text: "Agar fayldagi yangi yozilgan kod butunlay keraksiz bo‘lib qolsa, git restore fayl nomi orqali uni oxirgi holatiga qaytarish mumkin."
    },
    {
      id: 'l8',
      scene: 'restore_worktree',
      text: "Biroq ehtiyot bo‘ling: kommit qilinmagan o‘zgarishlar qaytarib bo‘lmas darajada yo‘qoladi, Git ularni qayta tiklay olmaydi."
    },
    {
      id: 'l9',
      scene: 'eski_yol',
      text: "Eski Git talqinlarida bu amallar chekaut va reset yordamida bajarilar edi, lekin ular ko‘p vazifaliligi sababli xavfli hisoblanardi."
    },
    {
      id: 'l10',
      scene: 'eski_yol',
      text: "Zamonaviy Gitda esa vazifalar aniq ajratilgan: restor faqat fayllarni tiklaydi, svitch esa tarmoqlarni almashtiradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, indeksdagi bekor qilishlar mutlaqo xavfsiz, lekin diskdagi saqlanmagan kodni o‘chirishda doim ehtiyotkor bo‘ling."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n ikkinchi bobda loyihaning muhim nuqtalarini belgilash — teglar va aliaslar bilan tanishamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

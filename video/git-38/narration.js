// narration.js — 38-bob: Stash va Clean
(function (g) {
  const scenes = [
    'intro_stash',
    'stash_architecture',
    'apply_pop_drop',
    'advanced_stash',
    'conflicts_branch',
    'git_clean'
  ];

  const sceneNames = {
    intro_stash: "Git Stash Asoslari va Stack Tuzilishi",
    stash_architecture: "Stash Ichki Arxitekturasi: H, I, W Commitlari",
    apply_pop_drop: "Tiklash va Ko‘rish: apply, --index, pop, drop",
    advanced_stash: "Ilg‘or Usullar: --keep-index, --staged, -u, -p",
    conflicts_branch: "Konfliktlar, git stash branch va fsck bilan Tiklash",
    git_clean: "git clean: Untracked Fayllarni Xavfsiz Tozalash"
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
      scene: 'intro_stash',
      text: "Ish jarayonida shoshilinch boshqa vazifaga o'tish kerak bo'lganda, chala qolgan o'zgarishlarni yo'qotmasdan va keraksiz xom commit yaratmasdan vaqtincha yashirib qo'yish uchun git stash buyrug'i ishlatiladi."
    },
    {
      id: 'l2',
      scene: 'intro_stash',
      text: "Oddiy git stash buyrug'i joriy tracked fayllar va index holatini stack tuzilmasiga saqlaydi hamda ishchi daraxtni toza HEAD commit holatiga qaytaradi."
    },
    {
      id: 'l3',
      scene: 'stash_architecture',
      text: "Gitda stash maxsus fayl turi emas, balki odatiy commit obyektlari va refs stash havolasi orqali boshqariladigan zanjirdir."
    },
    {
      id: 'l4',
      scene: 'stash_architecture',
      text: "U ikkita ota commitga tayanadi: H joriy HEAD commit, I esa index holatini ifodalaydi; untracked fayllar saqlanganda uchinchi ota qo'shiladi."
    },
    {
      id: 'l5',
      scene: 'apply_pop_drop',
      text: "Saqlangan o'zgarishlar ro'yxatini git stash list, ularning to'liq patch farqini esa git stash show minus p orqali tekshirish mumkin."
    },
    {
      id: 'l6',
      scene: 'apply_pop_drop',
      text: "git stash pop o'zgarishlarni ishchi daraxtga qaytarib ro'yxatdan o'chiradi, apply esa saqlab qoladi; index holatini birga tiklash uchun esa minus-minus index kaliti talab etiladi."
    },
    {
      id: 'l7',
      scene: 'advanced_stash',
      text: "Faqat stage qilinmagan qismlarni yashirish uchun keep-index, faqat indexdagi o'zgarishlarni ajratib olish uchun esa staged bayrog'idan foydalaniladi."
    },
    {
      id: 'l8',
      scene: 'advanced_stash',
      text: "Kuzatilmayotgan fayllarni birga saqlash uchun minus u, ignore qilinganlar bilan to'liq tozalash uchun minus a, hunkma-hunk tanlash uchun esa minus p qo'llanadi."
    },
    {
      id: 'l9',
      scene: 'conflicts_branch',
      text: "Agar branch o'zgarib stash qo'llashda konflikt chiqsa, pop stashni o'chirib yubormaydi; qulay yechim sifatida git stash branch yangi xavfsiz shoxcha ochib beradi."
    },
    {
      id: 'l10',
      scene: 'conflicts_branch',
      text: "Tasodifan drop yoki clear bilan o'chirilgan stash commitlarini git fsck unreachable orqali topib, git stash store yordamida ro'yxatga qayta tiklash mumkin."
    },
    {
      id: 'l11',
      scene: 'git_clean',
      text: "git clean buyrug'i ombordan tashqarida yotgan kuzatilmayotgan vaqtinchalik chiqindilarni diskdan butunlay o'chirib tashlaydi."
    },
    {
      id: 'l12',
      scene: 'git_clean',
      text: "Xavfsizlik uchun avval minus n sinovini o'tkazing; papkalarni o'chirishda minus d, ignored fayllar uchun minus x va interaktiv saralashda minus i yordam beradi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

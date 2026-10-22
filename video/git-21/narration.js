// Git 21-bob videosi: "Branch yaratish va merge" (content/git/21-branch-va-merge.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'fast_forward',
    'three_way_merge',
    'merge_base',
    'branch_tozalash',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Merge Tushunchasi va Yo‘nalish',
    fast_forward: 'Fast-Forward Merge Mexanizmi',
    three_way_merge: 'Uch Tomonlama Merge va Merge Commit',
    merge_base: 'Merge Base: Umumiy Ajdod Snapshotlari',
    branch_tozalash: 'Branch Tozalash: git branch -d',
    xulosa: 'Xulosa: --no-ff, --squash va --ff-only'
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
      text: "Salom! Ushbu yigirma birinchi bobda ajralgan tarmoqlarni bir-biriga xavfsiz qo‘shuvchi git merge buyrug‘i va uning ichki arxitekturasini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Merge har doim o‘zgarishlarni joriy branchga olib kiradi, shuning uchun avval qabul qiluvchi branchga o‘tib, so‘ng ikkinchi branchni birlashtiramiz."
    },
    {
      id: 'l3',
      scene: 'fast_forward',
      text: "Agar joriy branch qo‘shilayotgan branchni to‘g‘ridan-to‘g‘ri ajdodi bo‘lsa, Git hech qanday yangi commit yaratmay, fast-forward mergeni bajaradi."
    },
    {
      id: 'l4',
      scene: 'fast_forward',
      text: "Bunda Git obyektlar bazasiga tegilmaydi, faqat refs papkasidagi branch ko‘rsatkich fayli yangi commit heshiga surib qo‘yiladi."
    },
    {
      id: 'l5',
      scene: 'three_way_merge',
      text: "Agar ikkala branchda ham yangi mustaqil commitlar mavjud bo‘lsa, Git uch tomonlama merge algoritmini ishga tushirib, birlashtiruvchi yangi commit yaratadi."
    },
    {
      id: 'l6',
      scene: 'three_way_merge',
      text: "Bu maxsus merge commit ikkita otaga ega bo‘lib, loyiha tarixida ikkala tarmoqning muvaffaqiyatli tutashgan nuqtasini mustahkamlaydi."
    },
    {
      id: 'l7',
      scene: 'merge_base',
      text: "Git ikkala tomon nimalarni o‘zgartirganini aniqlash uchun ularning eng yaqin umumiy ajdodi bo‘lgan merge-base snapshotini asos qilib oladi."
    },
    {
      id: 'l8',
      scene: 'merge_base',
      text: "Faqat bir tomon o‘zgartirgan fayllar uchun tayyor bloblar qayta ishlatiladi, natijada yangi keraksiz nusxalar saqlanmaydi."
    },
    {
      id: 'l9',
      scene: 'branch_tozalash',
      text: "Merge yakunlangach, o‘z vazifasini o‘tab bo‘lgan branchni git branch minus d buyrug‘i yordamida bemalol o‘chirib tashlashimiz mumkin."
    },
    {
      id: 'l10',
      scene: 'branch_tozalash',
      text: "Bunda qilingan commitlar tarixdan yo‘qolmaydi, chunki ular endi asosiy branchni ota commitlari zanjiriga mustahkam ulanib bo‘lgan."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Jamoaviy qoidalarga qarab faqat fast-forward ruxsat beruvchi ff-only yoki alohida merge commit yaratuvchi no-ff bayroqlaridan foydalaniladi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda ikkala branch bitta faylning ayni bir qatorini tahrirlaganda yuzaga keladigan konfliktlarni hal qilishni o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '21-bob',
    title: 'Branch yaratish va merge',
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

// Git 15-bob videosi: "Tree va index" (content/git/15-tree-va-index.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'nega_index',
    'update_index_va_dirc',
    'write_tree_ierarxiya',
    'read_tree_va_checkout',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Tree va Index Tushunchasi',
    nega_index: 'Nega To‘g‘ridan-to‘g‘ri Emas, Index Orqali?',
    update_index_va_dirc: 'update-index va .git/index Fayli',
    write_tree_ierarxiya: 'write-tree va Papkalar Daraxti',
    read_tree_va_checkout: 'read-tree va checkout-index',
    xulosa: 'Xulosa va Tavsiyalar'
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
      text: "Salom! Ushbu o‘n beshinchi bobda fayllarni kataloglar shaklida bog‘lovchi tree obyektlari hamda staging hududining asosi bo‘lgan index faylini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Blob faqat xom baytlarni saqlasa, tree unga fayl nomi, ruxsatlar va butun papkalar daraxtini biriktirib beradi."
    },
    {
      id: 'l3',
      scene: 'nega_index',
      text: "To‘g‘ridan-to‘g‘ri papkadan commit qilish o‘rniga o‘rtada index qatlamining bo‘lishi o‘zgarishlarni bo‘laklab yig‘ish imkonini beradi."
    },
    {
      id: 'l4',
      scene: 'nega_index',
      text: "Shuningdek, index har bir faylning stat ma’lumotlarini keshlab, git status buyrug‘ining chaqmoqdek tez ishlashini ta’minlaydi."
    },
    {
      id: 'l5',
      scene: 'update_index_va_dirc',
      text: "Git update-index buyrug‘i fayllarni yoki tayyor bloblarni DIRC binar formatidagi .git/index fayliga ro‘yxat qilib yozadi."
    },
    {
      id: 'l6',
      scene: 'update_index_va_dirc',
      text: "git ls-files minus s buyrug‘i orqali index ichidagi fayl rejimi, blob hashi, stage bosqichi va yo‘lini ko‘rishimiz mumkin."
    },
    {
      id: 'l7',
      scene: 'write_tree_ierarxiya',
      text: "Git write-tree buyrug‘i indexdagi tekis ro‘yxatni tahlil qilib, har bir ichki papka uchun o‘zgarmas tree obyektini yasaydi."
    },
    {
      id: 'l8',
      scene: 'write_tree_ierarxiya',
      text: "Bunda bir xil papka tuzilmalari qayta yaratilmasdan o‘sha hash kodi bilan qayta ishlatiladi va disk joyi tejaladi."
    },
    {
      id: 'l9',
      scene: 'read_tree_va_checkout',
      text: "Teskari yo‘nalishda git read-tree saqlangan tree obyektini indexga yuklaydi, checkout-index esa uni ishchi papkaga chiqarib beradi."
    },
    {
      id: 'l10',
      scene: 'read_tree_va_checkout',
      text: "Ushbu zanjir git reset va git restore kabi qulay buyruqlarning asl poydevori qanday ishlashini yaqqol ko‘rsatadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Tree papkalar suratini saqlaydi, lekin unda muallif, sana va commit xabari yo‘q; ular keyingi bobda commit obyektiga birikadi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n oltinchi bobda aynan ushbu tree obyektidan foydalanib, qo‘lda haqiqiy commit obyekti yaratishni o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '15-bob',
    title: "Tree va index",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

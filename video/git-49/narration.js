// narration.js — 49-bob: Worktree va katta repo'lar
(function (g) {
  const scenes = [
    'worktree_intro',
    'worktree_ops',
    'branch_safety',
    'sparse_checkout',
    'partial_clone',
    'xulosa'
  ];

  const sceneNames = {
    worktree_intro: "Git Worktree: Bir Repozitoriy va Bir Nechta Ishchi Maydon",
    worktree_ops: "Worktree Yaratish va Boshqarish: add, list va remove",
    branch_safety: "Xavfsizlik Qoidasi va Ichki Tuzilma",
    sparse_checkout: "Sparse-Checkout: Faqat Kerakli Papkalarni Ochish",
    partial_clone: "Katta Omborlar: Partial Clone va Skalar",
    xulosa: "Xulosa va Ish Oqimi Tavsiyalari"
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
      scene: 'worktree_intro',
      text: "Katta loyihalarda bir vaqtning o'zida shoshilinch xatolarni tuzatish yoki parallel branchlarda ishlash zarurati paydo bo'ladi."
    },
    {
      id: 'l2',
      scene: 'worktree_intro',
      text: "Git vork-tri mexanizmi butun omborni qayta klonlamasdan, bitta obyektlar bazasiga ulangan mustaqil ishchi kataloglar ochishga imkon beradi."
    },
    {
      id: 'l3',
      scene: 'worktree_ops',
      text: "Jiti vork-tri add buyrug'i ko'rsatilgan papka va branch uchun alohida katalog yaratib, darhol ishlashga tayyorlaydi."
    },
    {
      id: 'l4',
      scene: 'worktree_ops',
      text: "Ro'yxatni ko'rish va tugallangan filiallarni xavfsiz tozalash esa list hamda remuv buyruqlari orqali amalga oshiriladi."
    },
    {
      id: 'l5',
      scene: 'branch_safety',
      text: "Git xatolarning oldini olish uchun bir xil branchni bir vaqtda ikkita alohida vork-trida ochishni qat'iy taqiqlaydi."
    },
    {
      id: 'l6',
      scene: 'branch_safety',
      text: "Har bir ishchi maydon o'zining mustaqil xed va indeksiga ega bo'lsa-da, barcha commitlar umumiy omborga bir zumda qo'shiladi."
    },
    {
      id: 'l7',
      scene: 'sparse_checkout',
      text: "Yuz minglab faylli yirik monorepolarda spars-chekaut sozlamasi diskka faqat kerakli quyi kataloglarni yuklashni ta'minlaydi."
    },
    {
      id: 'l8',
      scene: 'sparse_checkout',
      text: "Konus rejimi orqali keraksiz modullarni chetlab o'tish kompyuter xotirasini tejab, indekslash tezligini keskin oshiradi."
    },
    {
      id: 'l9',
      scene: 'partial_clone',
      text: "Partiyal klonlash filtri yordamida gigabaytlab binar fayllar yoki og'ir bloblar faqat zarurat tug'ilgandagina serverdan tortib olinadi."
    },
    {
      id: 'l10',
      scene: 'partial_clone',
      text: "Maykrosoft va Git hamjamiyati yaratgan skalar vositasi esa barcha ushbu ilg'or texnologiyalarni bir tugma bilan sozlaydi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Vork-tri va yirik repozitoriy vositalari dasturchini ortiqcha klonlash hamda kutishlardan xalos etib, mahsuldorlikni bir necha barobar oshiradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "O'zgarishlar tugagach vork-tri prun buyrug'i bilan eski yozuvlarni tozalab turish tizimni doimiy tartibda saqlashga xizmat qiladi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

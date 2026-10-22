// narration.js — 44-bob: Imzolash
(function (g) {
  const scenes = [
    'imzolash_intro',
    'ssh_signing',
    'commit_tag_sign',
    'signature_verify',
    'allowed_signers',
    'xulosa'
  ];

  const sceneNames = {
    imzolash_intro: "Nega Imzolash Kerak: Xesh va Mualliflik",
    ssh_signing: "SSH Kalitlari Bilan Imzolash: gpg.format=ssh",
    commit_tag_sign: "Imzoli Commit va Teglar: -S va -s bayroqlari",
    signature_verify: "Imzoni Tekshirish: git log --show-signature",
    allowed_signers: "Ishonchli Imzolar Fayli: allowed_signers",
    xulosa: "Xulosa va Jamoaviy Xavfsizlik Qoidalari"
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
      scene: 'imzolash_intro',
      text: "Git commitidagi muallif satri oddiy matn bo'lib, har kim o'zini boshqa shaxs sifatida ko'rsatishi mumkin."
    },
    {
      id: 'l2',
      scene: 'imzolash_intro',
      text: "Kriptografik raqamli imzo esa commit yoki tegning haqiqatan ishonchli shaxs tomonidan yaratilganini qat'iy kafolatlaydi."
    },
    {
      id: 'l3',
      scene: 'ssh_signing',
      text: "Git yigirma uch nuqta to'rtdan boshlab keng tarqalgan standart SSH kalitlari orqali imzolashni to'liq qo'llab-quvvatlaydi."
    },
    {
      id: 'l4',
      scene: 'ssh_signing',
      text: "Buning uchun ji-pi-ji format sozlamasini ssh ga o'rnatib, foydalanuvchi imzo kaliti manzilini ko'rsatish kifoya."
    },
    {
      id: 'l5',
      scene: 'commit_tag_sign',
      text: "Git commit minus katta S buyrug'i commit obyekti sarlavhasiga raqamli imzo muhrini biriktirib saqlaydi."
    },
    {
      id: 'l6',
      scene: 'commit_tag_sign',
      text: "Rasmiy relizlar uchun esa git tag minus kichik s yordamida annotated teglarni maxsus kriptografik imzo bilan chiqariladi."
    },
    {
      id: 'l7',
      scene: 'signature_verify',
      text: "Git log show-signature buyrug'i imzo butunligi bilan birga uning ishonchli kalitlar ro'yxatiga mosligini tekshiradi."
    },
    {
      id: 'l8',
      scene: 'signature_verify',
      text: "Agar imzo to'g'ri bo'lsa gud git signatye xabari, begona kalit bo'lsa no prinsipal match ogohlantirishi beriladi."
    },
    {
      id: 'l9',
      scene: 'allowed_signers',
      text: "SSH imzolarni jamoada tekshirish uchun allowed signers faylida xodimlarning elektron pochtalari va ommaviy kalitlari jamlanadi."
    },
    {
      id: 'l10',
      scene: 'allowed_signers',
      text: "Ushbu fayl orqali begona kalitlar bilan soxtalashtirilgan begona commitlar avtomatik tarzda fosh etiladi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Avtomatlashtirilgan tekshiruvlar uchun git merge verify-signatures bayrog'i faqat imzoli commitlarni qabul qilishni ta'minlaydi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Jamoada imzolash intizomi o'rnatilishi tashqi buzg'unchiliklar va ishonchsiz kodlarning loyihaga kirishini butunlay to'xtatadi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

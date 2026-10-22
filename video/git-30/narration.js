// narration.js — 30-bob: SSH kalit va credential'lar
(function (g) {
  const scenes = [
    'intro',
    'ssh_kalit_va_huquqlar',
    'ssh_agent_va_config',
    'https_credential_plumbing',
    'credential_helperlar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'SSH va HTTPS Asoslari',
    ssh_kalit_va_huquqlar: 'SSH Kalit Yaratish va Huquqlar',
    ssh_agent_va_config: 'ssh-agent va SSH Config',
    https_credential_plumbing: 'git credential Quyi Tizimi',
    credential_helperlar: 'Credential Helper Turlari',
    xulosa: 'Xulosa va Tavsiyalar'
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
      text: "Salom! Ushbu o‘ttizinchi bobda Git masofaviy repozitoriylar bilan aloqa o‘rnatishda SSH va HTTPS orqali autentifikatsiyani qanday amalga oshirishini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git parollarni o‘zi saqlamaydi. SSH uchun asimmetrik kalit juftligiga, HTTPS uchun esa operatsion tizimning Credential Helper vositalariga tayanadi."
    },
    {
      id: 'l3',
      scene: 'ssh_kalit_va_huquqlar',
      text: "Zamonaviy va ishonchli SSH ulanish uchun Ed25519 algoritmidan foydalanish tavsiya etiladi. ssh-keygen buyrug‘i orqali maxfiy kalit va uning ommaviy .pub jufti hosil qilinadi."
    },
    {
      id: 'l4',
      scene: 'ssh_kalit_va_huquqlar',
      text: "Maxfiy kalit ruxsati faqat egasiga berilishi shart, ya'ni 600. Aks holda OpenSSH xavfsizlik vajidan kalitni qabul qilmaydi. Parol iborasi esa kalitni diskda kuchli shifrlaydi."
    },
    {
      id: 'l5',
      scene: 'ssh_agent_va_config',
      text: "Har safar parolni qayta kiritmaslik uchun fonda ssh-agent ishlatiladi. U yechilgan kalitni xotirada saqlab, server so‘rovlariga xavfsiz imzo qo‘yib beradi."
    },
    {
      id: 'l6',
      scene: 'ssh_agent_va_config',
      text: "Bir serverda shaxsiy va ishchi akkauntlarni ajratish uchun esa ssh config faylida alohida host taxalluslari va IdentitiesOnly sozlamasidan foydalanamiz."
    },
    {
      id: 'l7',
      scene: 'https_credential_plumbing',
      text: "HTTPS protokoli orqali ishlaganda GitHub an'anaviy parollarni qabul qilmaydi, uning o‘rniga shaxsiy kirish tokenlari kiritiladi."
    },
    {
      id: 'l8',
      scene: 'https_credential_plumbing',
      text: "Git ichidagi git credential quyi tizimi fill amali orqali parolni qidiradi, approve bilan xotiraga oladi va reject orqali eskirgan tokenni o‘chiradi."
    },
    {
      id: 'l9',
      scene: 'credential_helperlar',
      text: "Tokenlarni eslab qolish uchun macOS'da osxkeychain, Windows'da wincred tokenlarni operatsion tizimning shifrlangan omborida xavfsiz saqlaydi."
    },
    {
      id: 'l10',
      scene: 'credential_helperlar',
      text: "Vaqtinchalik cache yoki diskka ochiq yozuvchi store helperlari ham mavjud. Biroq xavfsizlik vajidan parollarni ochiq fayllarda yoki URL ichida saqlash qat'iyan man etiladi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilganda, SSH uchun Ed25519 va ssh config profilidan, HTTPS uchun esa tizim darajasidagi shifrlangan credential helperdan foydalaning."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘ttiz birinchi bobda jamoalarda qo‘llaniladigan turli xil branch workflowlari va tarmoqlanish strategiyalarini tahlil qilamiz."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

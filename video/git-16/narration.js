// Git 16-bob videosi: "Commit obyekti" (content/git/16-commit-obyekti.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'commit_tuzilishi',
    'commit_tree_amalda',
    'ota_zanjiri',
    'xom_baytlar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Commit Obyekti va Uning Mohiyati',
    commit_tuzilishi: 'Commit Ichida Nimalar Saqlanadi?',
    commit_tree_amalda: 'git commit-tree Bilan Commit Yaratish',
    ota_zanjiri: 'Ota Zanjiri va Kriptografik Butunlik',
    xom_baytlar: 'Commit Obyektining Xom Baytlari',
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
      text: "Salom! Ushbu o‘n oltinchi bobda Git arxitekturasining markaziy ustuni bo‘lgan commit obyektining ichki tuzilishini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Tree ma’lum holatni saqlasa, commit shu holatni vaqtga joylaydi, unga kim va nima maqsadda kelganini tushuntirib beradi."
    },
    {
      id: 'l3',
      scene: 'commit_tuzilishi',
      text: "Commit beshta asosiy qismdan iborat: ildiz tree hashi, ota commitlar ro‘yxati, muallif, commit qiluvchi hamda tushuntirish xabari."
    },
    {
      id: 'l4',
      scene: 'commit_tuzilishi',
      text: "Git hech qachon diff saqlamaydi; u loyihaning to‘liq suratini saqlab, farqlarni har gal ota commit bilan solishtirib hisoblaydi."
    },
    {
      id: 'l5',
      scene: 'commit_tree_amalda',
      text: "Plumbing darajasidagi git commit-tree buyrug‘i berilgan tree hashi va xabar asosida to‘g‘ridan-to‘g‘ri commit obyekti yasab beradi."
    },
    {
      id: 'l6',
      scene: 'commit_tree_amalda',
      text: "Birinchi commit ildiz hisoblanib otasiz yaratiladi, keyingilari esa minus p parametri orqali oldingi commitga mustahkam bog‘lanadi."
    },
    {
      id: 'l7',
      scene: 'ota_zanjiri',
      text: "Commit faqat o‘z otasini biladi, lekin bolalarini bilmaydi; bu esa butun loyiha tarixini yangidan eskiga yo‘naltirilgan grafga aylantiradi."
    },
    {
      id: 'l8',
      scene: 'ota_zanjiri',
      text: "Ota hashining yozilishi zanjirli kafolat yaratadi: tarixdagi biror bayt o‘zgarsa, undan keyingi barcha commitlar hashi ham o‘zgaradi."
    },
    {
      id: 'l9',
      scene: 'xom_baytlar',
      text: "Diskda commit toza matn ko‘rinishida bo‘lib, zlib bilan siqilgan holda nuqta git slesh objects papkasida saqlanadi."
    },
    {
      id: 'l10',
      scene: 'xom_baytlar',
      text: "Unga yangi commit qo‘shilgach, Git shunchaki branch ko‘rsatkichini ushbu yangi commit hashiga surib qo‘yadi xolos."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Shunday qilib, Git yadrosidagi uch buyuk poydevor — blob, tree va commit birgalikda to‘liq ishlaydigan versiya tizimini hosil qiladi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n yettinchi bobda commitlarga oson ishora qiluvchi ref ko‘rsatkichlari, HEAD fayli va teg obyektlarini ko‘rib chiqamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '16-bob',
    title: "Commit obyekti",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

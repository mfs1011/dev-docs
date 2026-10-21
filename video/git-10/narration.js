// Git 10-bob videosi: "Yaxshi commit" (content/git/10-yaxshi-commit.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'toza_ozgarish',
    'atomar_commit',
    'xabar_tuzilishi',
    'metamalumotlar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Yaxshi Commit Madaniyati',
    toza_ozgarish: 'Toza O‘zgarish va Whitespace',
    atomar_commit: 'Atomar Commit va git add -p',
    xabar_tuzilishi: 'Commit Xabari: 50/72 Qoidasi',
    metamalumotlar: 'Trailerlar va Conventional Commits',
    xulosa: 'Xulosa va Checklist'
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
      text: "Salom! Ushbu o‘ninchi bobda namunali va professional kommit yaratish madaniyati hamda uning uch asosiy ustunini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git har qanday kommitni qabul qilaveradi, lekin yaxshi kommit kelajakdagi insonlar va avtomatlashtirilgan asboblar uchun xizmat qiladi."
    },
    {
      id: 'l3',
      scene: 'toza_ozgarish',
      text: "Birinchi talab — toza o‘zgarish: qator oxiridagi keraksiz bo‘shliqlar va format xatolari diffni ifloslantirmasligi lozim."
    },
    {
      id: 'l4',
      scene: 'toza_ozgarish',
      text: "Git diff chek buyrug‘i bo‘sh joy xatolarini darhol ko‘rsatadi, pre-kommit xuk esa bunday xatolarning omborga kirishini avtomatik to‘xtatadi."
    },
    {
      id: 'l5',
      scene: 'atomar_commit',
      text: "Ikkinchi ustun — atomar kommit: bitta katta kommit ichiga bir haftalik turli ishlarni qorishtirish qat’iyan tavsiya etilmaydi."
    },
    {
      id: 'l6',
      scene: 'atomar_commit',
      text: "Git add minus p yordamida bitta fayl ichidagi mustaqil o‘zgarishlarni bo‘laklarga ajratib, alohida stage qilish mumkin."
    },
    {
      id: 'l7',
      scene: 'xabar_tuzilishi',
      text: "Uchinchi ustun — xabar tuzilishi: ellik belgigacha bo‘lgan buyruq maylidagi qisqa sarlavhadan keyin majburiy bo‘sh qator bo‘lishi shart."
    },
    {
      id: 'l8',
      scene: 'xabar_tuzilishi',
      text: "Tanada esa kod nima qilgani emas, aynan nega bunday qaror qabul qilingani va qaysi muqobillar rad etilgani yetmish ikki belgida tushuntiriladi."
    },
    {
      id: 'l9',
      scene: 'metamalumotlar',
      text: "Xabar oxiridagi Saynd-off-bay yoki Ko-osord-bay kabi treylerlar rasmiy tasdiq va hammualliflik metama’lumotlarini taqdim etadi."
    },
    {
      id: 'l10',
      scene: 'metamalumotlar',
      text: "Konvenshnal kommitlar kelishuvi esa fit yoki fiks kabi turlar orqali avtomatik versiyalash va reliz solnomalarini yaratishni osonlashtiradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Kommitdan oldin status va keshd chek orqali tozalikni tekshirib, xabar qoidalariga rioya qilish jamoaviy ishonch garovidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda xato ketgan kommitlarni xavfsiz tuzatish, ya’ni emend va restor buyruqlari bilan tanishamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

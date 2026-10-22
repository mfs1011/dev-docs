// narration.js — 36-bob: GitHub: repo va tashkilotni boshqarish
(function (g) {
  const scenes = [
    'intro',
    'pr_reflari',
    'himoyalangan_branch',
    'codeowners',
    'tashkilot_va_jamoalar',
    'avtomatlashtirish_va_xulosa'
  ];

  const sceneNames = {
    intro: 'Repo Boshqaruvi va Maxsus Fayllar',
    pr_reflari: 'PR Yashirin Reflari va Refspek',
    himoyalangan_branch: 'Himoyalangan Branch va Rulesetlar',
    codeowners: 'CODEOWNERS va Avtomatik Review',
    tashkilot_va_jamoalar: 'Tashkilot, Jamoalar va Rollar',
    avtomatlashtirish_va_xulosa: 'Webhook, REST API va Xulosa'
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
      text: "Salom! Ushbu o‘ttiz oltinchi bobda GitHub platformasida repozitoriy va butun tashkilotni boshqarish vositalarini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Loyiha yaxshi boshqarilishi uchun README, CONTRIBUTING va maxsus papkalar orqali hissa qo‘shish qoidalari aniq belgilab olinadi."
    },
    {
      id: 'l3',
      scene: 'pr_reflari',
      text: "GitHub har bir pull request uchun maxsus yashirin ref yaratadi va ularni alohida remote qo‘shmasdan xavfsiz fetch qilish mumkin."
    },
    {
      id: 'l4',
      scene: 'pr_reflari',
      text: "Maxsus refspek sozlash orqali esa serverdagi barcha pull request tarmoqlarini bitta buyruq bilan lokalga tortib olamiz."
    },
    {
      id: 'l5',
      scene: 'himoyalangan_branch',
      text: "Asosiy tarmoqni himoyalash uchun unga to‘g‘ridan-to‘g‘ri push taqiqlanib, faqat pull request va testlar orqali kod kiritish majburlanadi."
    },
    {
      id: 'l6',
      scene: 'himoyalangan_branch',
      text: "Zamonaviy ruleset tizimi qoidalarni qatlamlab, kim qachon o‘zgarish kirita olishini to‘liq va shaffof nazorat qiladi."
    },
    {
      id: 'l7',
      scene: 'codeowners',
      text: "CODEOWNERS fayli orqali muhim papka va modullarga mas’ul shaxslar yoki jamoalar biriktirilib, ularning tasdig‘i shart qilib qo‘yiladi."
    },
    {
      id: 'l8',
      scene: 'codeowners',
      text: "Faylda oxirgi mos kelgan qator ustuvor hisoblanadi va tegishli o‘zgarishlar kiritilganda mas’ullarga avtomatik so‘rov yuboriladi."
    },
    {
      id: 'l9',
      scene: 'tashkilot_va_jamoalar',
      text: "Tashkilotlarda foydalanuvchilar maxsus jamoalarga birlashtirilib, ularga repo darajasida turli darajadagi huquq rollari beriladi."
    },
    {
      id: 'l10',
      scene: 'tashkilot_va_jamoalar',
      text: "Bunday tuzilma yuzlab repozitoriylarga kirish huquqlarini oson boshqarish va xavfsizlik auditini muntazam yuritish imkonini beradi."
    },
    {
      id: 'l11',
      scene: 'avtomatlashtirish_va_xulosa',
      text: "Webhook va REST API yordamida esa tekshiruvlar, sharhlar hamda avtomatik birlashtirish jarayonlari to‘liq avtomatlashtiriladi."
    },
    {
      id: 'l12',
      scene: 'avtomatlashtirish_va_xulosa',
      text: "Xulosa qilganda, mustahkam himoya qoidalari, CODEOWNERS va to‘g‘ri rollar yirik loyihalarni xavfsiz hamda barqaror rivojlantirish garovidir."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

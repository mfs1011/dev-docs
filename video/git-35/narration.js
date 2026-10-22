// narration.js — 35-bob: GitHub: fork va pull request
(function (g) {
  const scenes = [
    'intro',
    'topic_va_pr',
    'review_va_iteratsiya',
    'upstream_va_konflikt',
    'maintainer_va_merge',
    'sinxronizatsiya_va_xulosa'
  ];

  const sceneNames = {
    intro: 'GitHub Flow va Fork Tushunchasi',
    topic_va_pr: 'Topic Branch va PR Yaratish',
    review_va_iteratsiya: 'Review Jarayoni va Iteratsiya',
    upstream_va_konflikt: 'Upstream Bilan Yangilash va Konfliktlar',
    maintainer_va_merge: 'Maintainer Tomoni va 3 Ta Merge Usuli',
    sinxronizatsiya_va_xulosa: 'Forkni Sinxronlash va Oltin Qoidalar'
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
      text: "Salom! Ushbu o‘ttiz beshinchi bobda GitHub platformasida fork qilish va pull request ochish orqali jamoaviy ishlashni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Fork — bu asl repozitoriyning sizga tegishli nusxasi bo‘lib, siz o‘zgartirishlarni unga xavfsiz push qilasiz, asl loyiha esa upstream deb ataladi."
    },
    {
      id: 'l3',
      scene: 'topic_va_pr',
      text: "Hissa qo‘shishda hech qachon asosiy tarmoqdan emas, alohida topic branch ochib o‘zgarishlar kiritiladi va forkingizga yuboriladi."
    },
    {
      id: 'l4',
      scene: 'topic_va_pr',
      text: "GitHub veb-interfeysi yoki CLI orqali pull request yaratilib, o‘zgarish maqsadi va bog‘liq masalalar raqami aniq bayon etiladi."
    },
    {
      id: 'l5',
      scene: 'review_va_iteratsiya',
      text: "Pull request — bu faqat kod emas, balki jonli suhbat bo‘lib, sharhlovchilar taklif bildirsa yangi commit qilib o‘sha tarmoqqa push qilinadi."
    },
    {
      id: 'l6',
      scene: 'review_va_iteratsiya',
      text: "Tizim uch nuqtali git diff sintaksisi orqali umumiy ajdoddan keyingi haqiqiy farqni ko‘rsatib, muhokamani yanada qulaylashtiradi."
    },
    {
      id: 'l7',
      scene: 'upstream_va_konflikt',
      text: "Siz ishlayotgan paytda asl loyiha oldinga ketishi mumkin, shuning uchun upstream tarmoqlarini vaqti-vaqti bilan fetch qilib turish zarur."
    },
    {
      id: 'l8',
      scene: 'upstream_va_konflikt',
      text: "Agar ziddiyat yuzaga kelsa, upstream o‘zgarishlarini topic branchga birlashtirib, konfliktlarni lokal yechgach qayta push qilamiz."
    },
    {
      id: 'l9',
      scene: 'maintainer_va_merge',
      text: "Maintainerlar pull requestni maxsus yashirin ref orqali lokal tortib olib sinaydi va loyiha siyosatiga ko‘ra birlashtiradi."
    },
    {
      id: 'l10',
      scene: 'maintainer_va_merge',
      text: "Bunda to‘liq tarixni saqlovchi merge commit, bitta qilib ixchamlovchi squash yoki chiziqli rebase merge usullari qo‘llanadi."
    },
    {
      id: 'l11',
      scene: 'sinxronizatsiya_va_xulosa',
      text: "O‘zgarish qabul qilingach, forkingizning main tarmog‘i upstream bilan tezkor yangilanadi va ortiqcha topic branch o‘chiriladi."
    },
    {
      id: 'l12',
      scene: 'sinxronizatsiya_va_xulosa',
      text: "Xulosa qilganda, har bir mavzu uchun alohida tarmoq ochish, aniq tavsif yozish va forkingizni muntazam yangilab turish GitHub oqimining poydevoridir."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

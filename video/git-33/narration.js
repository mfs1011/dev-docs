// narration.js — 33-bob: Loyihaga hissa qo'shish
(function (g) {
  const scenes = [
    'intro',
    'kichik_jamoa_workflow',
    'boshqariladigan_jamoa',
    'fork_va_request_pull',
    'rebase_va_patch_navbati',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Hissa Qo‘shish Tamoyillari',
    kichik_jamoa_workflow: 'Kichik Xususiy Jamoa',
    boshqariladigan_jamoa: 'Himoyalangan Boshqaruv',
    fork_va_request_pull: 'Fork va request-pull',
    rebase_va_patch_navbati: 'Rebase va Konfliktlarni Yechish',
    xulosa: 'Xulosa va Oltin Qoidalar'
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
      text: "Salom! Ushbu o‘ttiz uchinchi bobda loyihalarga hissa qo'shuvchi, ya'ni contributor sifatida sifatli va xatosiz kod yetkazish amaliyotini o'rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git'da birlashtirish klient tomonida bajarilgani sababli, yaxshi dasturchi review qiluvchi maintainer uchun ishlarni qabul qilishni imkon qadar yengillashtirishi kerak."
    },
    {
      id: 'l3',
      scene: 'kichik_jamoa_workflow',
      text: "Kichik jamoada hamma umumiy repozitoriyga yoza oladi. Agar hamkasbingiz sizdan oldinroq yangi kod chiqargan bo'lsa, Git fetch first bilan sizning push amalingizni to'xtatadi."
    },
    {
      id: 'l4',
      scene: 'kichik_jamoa_workflow',
      text: "Dasturchi avval fetch qilib farqlarni solishtiradi, o'zgarishlarni lokal birlashtiradi, testlarni ishga tushirib, so'ngra serverga muvaffaqiyatli push qiladi."
    },
    {
      id: 'l5',
      scene: 'boshqariladigan_jamoa',
      text: "Kattaroq jamoalarda asosiy main branch himoyalanadi va unga faqat integratorlar yozadi. Dasturchilar esa alohida feature branchlar va refspeklar orqali parallel hamkorlik qiladi."
    },
    {
      id: 'l6',
      scene: 'boshqariladigan_jamoa',
      text: "Bu uslubda kichik guruhlar bir-biriga xalaqit bermasdan bir nechta yangi imkoniyatlar ustida mustaqil ishlay oladi, yakunda esa integrator ularni main chizig'iga birlashtiradi."
    },
    {
      id: 'l7',
      scene: 'fork_va_request_pull',
      text: "Ochiq manbali loyihalarda esa to'g'ridan-to'g'ri push huquqi bo'lmaydi. Dasturchi loyihani o'ziga fork qilib oladi va o'zgarishlarni faqat alohida topic branchga push qiladi."
    },
    {
      id: 'l8',
      scene: 'fork_va_request_pull',
      text: "So'ngra git request-pull buyrug'i yoki veb pull request orqali loyiha yurituvchisiga o'zgarishlar manzili va commitlar tavsifini o'z ichiga olgan so'rov yuboriladi."
    },
    {
      id: 'l9',
      scene: 'rebase_va_patch_navbati',
      text: "Agar siz kutayotgan paytda loyihaning asosiy tarixi oldinga ketgan bo'lsa, yuzaga keladigan konfliktlarni maintainerga yuklamasdan o'zingiz hal qilishingiz shart."
    },
    {
      id: 'l10',
      scene: 'rebase_va_patch_navbati',
      text: "Buning uchun o'z topic branchimizni yangilangan asosiy branch ustiga rebase qilib, toza va mojarosiz holatga keltirib qayta jo'natamiz."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilganda, bitta mantiqiy masala uchun bitta toza commit yaratish, ortiqcha probellarni tozalash va alohida topic branchlardan foydalanish eng yaxshi amaliyotdir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘ttiz to‘rtinchi bobda masalaga maintainer nuqtai nazaridan yondashib, loyihani yuritish, patchlarni qabul qilish va relizlar chiqarishni ko‘rib chiqamiz."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// Git 25-bob videosi: "Tarixni qayta yozish" (content/git/25-tarixni-qayta-yozish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'todo_va_reword',
    'edit_va_bolish',
    'squash_va_fixup',
    'drop_va_tartib',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Tarixni Qayta Yozish: git rebase -i',
    todo_va_reword: 'Todo Ro‘yxati va reword Buyrug‘i',
    edit_va_bolish: 'edit: Commitni Bo‘lish va Tuzatish',
    squash_va_fixup: 'squash va fixup: Birlashtirish',
    drop_va_tartib: 'drop va Tartibni O‘zgartirish',
    xulosa: 'Xulosa: exec va Lokal Gigiyena'
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
      text: "Salom! Ushbu yigirma beshinchi bobda Git tarixini qayta yozish, ya’ni interaktiv rebase imkoniyatlarini batafsil o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Interaktiv rebase orqali o‘tgan kommitlarni xuddi matn muharririda tahrirlagandek qayta shakllantirish, to‘g‘rilash va tozalash mumkin."
    },
    {
      id: 'l3',
      scene: 'todo_va_reword',
      text: "git rebase minus i HEAD tilda uch buyrug‘ini bersak, Git bajarilishi kerak bo‘lgan todo buyruqlar ro‘yxatini ochadi."
    },
    {
      id: 'l4',
      scene: 'todo_va_reword',
      text: "Ro‘yxatda birinchi kommit uchun reword so‘zini yozsak, Git o‘sha qadamda to‘xtab, kommit xabarini qayta tahrirlash imkonini beradi."
    },
    {
      id: 'l5',
      scene: 'edit_va_bolish',
      text: "edit buyrug‘i orqali jarayonni ma’lum bir kommitda to‘xtatib, unga yangi fayllarni commit amend bilan qo‘shishimiz mumkin."
    },
    {
      id: 'l6',
      scene: 'edit_va_bolish',
      text: "Yoki git reset orqali bitta katta kommitni ochib yuborib, uni bir nechta mantiqiy kichik kommitlarga bo‘lib tashlash ham oson."
    },
    {
      id: 'l7',
      scene: 'squash_va_fixup',
      text: "Bir nechta mayda oraliq ishlarni bitta yaxlit kommitga aylantirish uchun squash buyrug‘idan foydalaniladi."
    },
    {
      id: 'l8',
      scene: 'squash_va_fixup',
      text: "fixup esa ikkinchi kommit xabarini e’tiborga olmay, faqat uning kodini oldingi kommit tarkibiga toza birlashtirib beradi."
    },
    {
      id: 'l9',
      scene: 'drop_va_tartib',
      text: "Keraksiz yoki vaqtinchalik debug kommitlarni drop qilish yoki ro‘yxatdan o‘chirib tashlash orqali tarixdan butunlay yo‘qotamiz."
    },
    {
      id: 'l10',
      scene: 'drop_va_tartib',
      text: "Todo ro‘yxatidagi qatorlar tartibini yuqoriga yoki pastga siljitish orqali esa kommitlar ketma-ketligini osongina almashtirish mumkin."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "exec buyrug‘i har bir qadamda avtomatik testlarni yurgizib, qayta yozilgan tarixning to‘g‘ri ishlashini kafolatlaydi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda turli tarmoqlarni birlashtirishda uchraydigan murakkab merge strategiyalarini to‘liq ko‘rib chiqamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '25-bob',
    title: 'Tarixni qayta yozish',
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

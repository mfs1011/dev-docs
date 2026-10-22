// narration.js — 41-bob: blame va bisect
(function (g) {
  const scenes = [
    'blame_basics',
    'blame_ignore_format',
    'blame_moved_code',
    'bisect_manual',
    'bisect_run_auto',
    'bisect_terms_reset'
  ];

  const sceneNames = {
    blame_basics: "Debugging Asboblari va git blame Asoslari",
    blame_ignore_format: "Format Commitlarini Chetlab O'tish: -w va ignore-revs",
    blame_moved_code: "Ko'chirilgan Kodni Kuzatish: -M va -C",
    bisect_manual: "git bisect: Qo'lda Ikkilik Qidiruv",
    bisect_run_auto: "git bisect run: To'liq Avtomatik Qidiruv",
    bisect_terms_reset: "Maxsus Terminlar, Bisect Log va Reset"
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
      scene: 'blame_basics',
      text: "Git dasturchiga nafaqat versiyalarni saqlash, balki murakkab xatoliklarni aniqlash va disk raskadrovka qilishda ham kuchli vositalarni taqdim etadi."
    },
    {
      id: 'l2',
      scene: 'blame_basics',
      text: "git blame buyrug'i faylning har bir qatori yoniga uni oxirgi marta o'zgartirgan commit, muallif va vaqtni aniq ko'rsatib, kodning kelib chiqish kontekstini ochadi."
    },
    {
      id: 'l3',
      scene: 'blame_ignore_format',
      text: "Katta formatlash yoki bo'sh joylarni o'zgartirish commitlari asl mualliflik tarixini yashirib qo'ymasligi uchun minus w kaliti qo'llanadi."
    },
    {
      id: 'l4',
      scene: 'blame_ignore_format',
      text: "Jamoa miqyosida esa nuqta git-blame-ignore-revs fayliga bunday commitlar kiritilib, butunlay e'tiborsiz qoldirilishi mumkin."
    },
    {
      id: 'l5',
      scene: 'blame_moved_code',
      text: "Refaktoring paytida kod boshqa faylga yoki funksiyaga ko'chirilganda, minus M va minus C bayroqlari uning asl tug'ilgan joyini topib beradi."
    },
    {
      id: 'l6',
      scene: 'blame_moved_code',
      text: "Natijada siz kodni shunchaki ko'chirgan odamni emas, balki uni dastlab yozgan asl muallif va commitni aniq ko'rasiz."
    },
    {
      id: 'l7',
      scene: 'bisect_manual',
      text: "Xato qachon va qaysi commitda paydo bo'lganini bilmagan hollarda git bisect ikkilik qidiruv mexanizmi ishga tushiriladi."
    },
    {
      id: 'l8',
      scene: 'bisect_manual',
      text: "U yaxshi va yomon commitlar orasidagi o'rtacha nuqtani chiqarib beradi, siz uni sinab, minglab commitlar orasidan aybdorni sanoqli qadamda topasiz."
    },
    {
      id: 'l9',
      scene: 'bisect_run_auto',
      text: "git bisect run buyrug'i maxsus test skripti yordamida butun tekshiruv jarayonini inson aralashuvisiz to'liq avtomatlashtiradi."
    },
    {
      id: 'l10',
      scene: 'bisect_run_auto',
      text: "Bunda skript nol chiqarsa yaxshi, bir chiqarsa yomon, bir yuz yigirma besh kodi esa sinab bo'lmaydigan oraliq commitni o'tkazib yuborishni bildiradi."
    },
    {
      id: 'l11',
      scene: 'bisect_terms_reset',
      text: "Faqat xatolar emas, balki tezlik pasayishi yoki yangi imkoniyat paydo bo'lishini qidirishda old va new kabi erkin terminlar qo'llaniladi."
    },
    {
      id: 'l12',
      scene: 'bisect_terms_reset',
      text: "Bisect tugagach, ishchi daraxtni asl holatiga qaytarish uchun albatta git bisect reset buyrug'ini bajarish shart."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

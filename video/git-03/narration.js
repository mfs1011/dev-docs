// Git 03-bob videosi: "Birinchi sozlash va yordam" (content/git/03-birinchi-sozlash.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'darajalar_va_ustunlik',
    'identifikatsiya_va_sintaksis',
    'muhim_sozlamalar',
    'yordam_tizimi',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish va Sozlash',
    darajalar_va_ustunlik: 'Konfiguratsiya Darajalari',
    identifikatsiya_va_sintaksis: 'Identifikatsiya va Sintaksis',
    muhim_sozlamalar: 'Muhim Global Sozlamalar',
    yordam_tizimi: 'Git Help va Ma’lumotnoma',
    xulosa: 'Xulosa'
  };

  const hold = {
    l2: 1.0,
    l4: 1.0,
    l6: 1.0,
    l8: 1.0,
    l10: 1.0,
    l12: 1.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu uchinchi bobda Gitni birinchi marta sozlash va yordam tizimidan foydalanishni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git o‘rnatilgach qilinadigan ilk qadam shaxsiy identifikatsiyani belgilashdir, chunki bu ma’lumot har bir kommitga muhrlanadi."
    },
    {
      id: 'l3',
      scene: 'darajalar_va_ustunlik',
      text: "Git sozlamalari beshta darajada saqlanadi: butun kompyuter uchun sistem, foydalanuvchi uchun global va bitta repozitoriy uchun lokal."
    },
    {
      id: 'l4',
      scene: 'darajalar_va_ustunlik',
      text: "Bunda tor doiradagi sozlama keng doiradagidan ustun turadi, ya’ni lokal repozitoriy konfigi global sozlamani bekor qila oladi."
    },
    {
      id: 'l5',
      scene: 'identifikatsiya_va_sintaksis',
      text: "Yuzer neym va yuzer emeyl sozlamalari yordamida har bir kommit muallifi aniqlanadi va ularni kommitdan keyin osonlikcha o‘zgartirib bo‘lmaydi."
    },
    {
      id: 'l6',
      scene: 'identifikatsiya_va_sintaksis',
      text: "Gitning yangi versiyalarida konfig buyrug‘i get, set va unset kabi aniq subkomandalarga bo‘lingan."
    },
    {
      id: 'l7',
      scene: 'muhim_sozlamalar',
      text: "Standart matn muharriri sifatida kor editor orqali VS Kod yoki nanoni, birinchi brench nomi sifatida esa meynni belgilab qo‘yish qulay."
    },
    {
      id: 'l8',
      scene: 'muhim_sozlamalar',
      text: "Shuningdek, terminalda natijalar tushunarli bo‘lishi uchun ranglar tizimini ham moslashtirish mumkin."
    },
    {
      id: 'l9',
      scene: 'yordam_tizimi',
      text: "Git internetga ulanmasdan ham to‘liq rasmiy ma’lumotnomaga ega bo‘lib, git help yoki chiziqcha ech opsiyasi orqali tezkor yordam beradi."
    },
    {
      id: 'l10',
      scene: 'yordam_tizimi',
      text: "Qo‘shimcha ravishda help a barcha buyruqlar ro‘yxatini, help g esa amaliy qo‘llanmalar to‘plamini ko‘rsatadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilsak, to‘g‘ri sozlangan muhit va yordam tizimini bilish kundalik ishingizni xatosiz va tezkor qiladi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda ilk repozitoriy yaratish va klonlashni boshlaymiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

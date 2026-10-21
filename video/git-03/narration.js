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
      text: "Salom! Ushbu uchinchi bobda Gitni birinchi marta sozlash va yordam tizimidan to‘g‘ri foydalanishni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Har bir kommit ichiga muallifning ismi va emaili muhrlanadi, shuning uchun bu sozlamalarni eng boshidayoq to‘g‘ri kiritish shart."
    },
    {
      id: 'l3',
      scene: 'darajalar_va_ustunlik',
      text: "Git sozlamalari uchta asosiy darajada saqlanadi: butun tizim uchun sistem, foydalanuvchi uchun global va bitta loyiha uchun lokal daraja."
    },
    {
      id: 'l4',
      scene: 'darajalar_va_ustunlik',
      text: "Bunda oltin qoida amal qiladi: tor daraja keng darajadan ustun turadi, ya’ni lokal repozitoriy sozlamasi global sozlamani bemalol yengadi."
    },
    {
      id: 'l5',
      scene: 'identifikatsiya_va_sintaksis',
      text: "Keling, terminalda global ism va emailimizni o‘rnatamiz; bu ma’lumotlar to‘g‘ridan-to‘g‘ri uy papkangizdagi nuqta gitkonfig fayliga yoziladi."
    },
    {
      id: 'l6',
      scene: 'identifikatsiya_va_sintaksis',
      text: "Gitning yangi versiyalarida konfig buyrug‘i set, get va unset kabi tushunarli va aniq subkomandalar orqali boshqariladi."
    },
    {
      id: 'l7',
      scene: 'muhim_sozlamalar',
      text: "Standart brench nomi sifatida meynni belgilaymiz, matn muharriri uchun esa kor editor yordamida sevimli dasturingizni, masalan Vi-es kodni tanlashingiz mumkin."
    },
    {
      id: 'l8',
      scene: 'muhim_sozlamalar',
      text: "Konfig list va shou orijin opsiyalari orqali qaysi sozlama qaysi fayldan o‘qilayotganini bir zumda tekshirib olish juda qulay."
    },
    {
      id: 'l9',
      scene: 'yordam_tizimi',
      text: "Git internetga ulanmasdan ham to‘liq rasmiy ma’lumotnomaga ega; chiziqcha eych orqali tezkor konspekt, git help orqali esa to‘liq qo‘llanma ochiladi."
    },
    {
      id: 'l10',
      scene: 'yordam_tizimi',
      text: "Shuningdek, help ey barcha ichki buyruqlarni, help ji esa tushunchalar va ish jarayonlari bo‘yicha maxsus qo‘llanmalarni taqdim etadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, to‘g‘ri sozlangan identifikatsiya va oflayn yordam tizimi kundalik ishingizni xavfsiz va ishonchli qiladi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi to‘rtinchi bobda ilk repozitoriy yaratish va klonlash amaliyotini boshlaymiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

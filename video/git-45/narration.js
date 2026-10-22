// narration.js — 45-bob: git config chuqur
(function (g) {
  const scenes = [
    'config_intro',
    'origin_scope',
    'include_conditions',
    'client_tuning',
    'server_security',
    'xulosa'
  ];

  const sceneNames = {
    config_intro: "Git Config Qatlamlari va Ierarxiyasi",
    origin_scope: "Sozlama Qayerdan Keldi: show-origin va show-scope",
    include_conditions: "Shartli Konfiguratsiya: include va includeIf",
    client_tuning: "Mijoz Sozlamalari: autocrlf, whitespace va autocorrect",
    server_security: "Server Xavfsizligi: receive sozlamalari va fsck",
    xulosa: "Xulosa va Professional Sozlash Qoidalari"
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
      scene: 'config_intro',
      text: "Git konfiguratsiyasi tizim, global, lokal, ishchi daraxt va buyruq satri kabi beshta ustuvor darajaga bo'linadi."
    },
    {
      id: 'l2',
      scene: 'config_intro',
      text: "Torroq doiradagi sozlama kengroq qatlam ustidan g'olib chiqib, shaxsiy va jamoaviy parametrlarni moslashuvchan boshqaradi."
    },
    {
      id: 'l3',
      scene: 'origin_scope',
      text: "Ko'p darajali tizimda qiymat qaysi fayldan kelganini aniqlash uchun git config list show-origin show-scope ishlatiladi."
    },
    {
      id: 'l4',
      scene: 'origin_scope',
      text: "Bu buyruq har bir parametrning aniq manzilini va uning global yoki lokal ko'lamga tegishliligini bir zumda ko'rsatib beradi."
    },
    {
      id: 'l5',
      scene: 'include_conditions',
      text: "IncludeIf direktivasi yordamida repo papkasi yoki joriy branch shartiga qarab alohida config fayllar avtomatik ulanadi."
    },
    {
      id: 'l6',
      scene: 'include_conditions',
      text: "Masalan, ishchi loyihalar uchun alohida korporativ elektron pochta, shaxsiy loyihalar uchun esa boshqa profil faollashadi."
    },
    {
      id: 'l7',
      scene: 'client_tuning',
      text: "Kundalik qulaylik uchun autocrlf qator oxirlarini moslashtiradi, autocorrect esa xato yozilgan buyruqlarni avtomatik tuzatadi."
    },
    {
      id: 'l8',
      scene: 'client_tuning',
      text: "Shuningdek, whitespace tekshiruvi qator oxiridagi keraksiz bo'shliqlarni va aralash tab belgilarini stage qilishdan asraydi."
    },
    {
      id: 'l9',
      scene: 'server_security',
      text: "Serverdagi markaziy repoda receive denyCurrentBranch va denyNonFastForwards sozlamalari majburiy surishlarni cheklaydi."
    },
    {
      id: 'l10',
      scene: 'server_security',
      text: "Receive fsckObjects esa buzilgan yoki shikastlangan obyektlarning repozitoriy bazasiga kirishiga yo'l qo'ymaydi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Tizimli sozlangan Git konfiguratsiyasi jamoada xatoliklarning oldini olib, kundalik ishlash unumdorligini keskin oshiradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Konfiguratsiyani kod kabi tartibli saqlash va shartli ulanishlardan oqilona foydalanish eng yaxshi amaliyotdir."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

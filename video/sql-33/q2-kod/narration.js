// SQL 33-bob 2-qism: Kod — Matn funksiyalari amalda
globalThis.NR = {
  scenes: ['kirish', 'uzunlik_va_tozalash', 'kesish_va_qidirish', 'lpad_va_format', 'regex_tozalash'],
  sceneNames: {
    kirish: "Kod: odamlar Jadvali va Satr Birlashtirish",
    uzunlik_va_tozalash: "Uzunlik, trim va Kichik Harflar",
    kesish_va_qidirish: "Qism Satr, Qidirish va split_part",
    lpad_va_format: "LPAD Bilan Formatli Kod Yasash",
    regex_tozalash: "Regex Bilan Telefon Raqamini Tozalash",
  },
  hold: {
    intro: 0.8,
    uzunlik: 1.2,
    kesish: 1.2,
    lpad: 1.2,
    regex: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "Odamlar jadvalida ism va familiyani birlashtiramiz, otasining ismi NULL bo'lganda concat_ws yordamida toza to'liq ism hosil qilamiz.",
    },
    {
      id: "uzunlik",
      scene: "uzunlik_va_tozalash",
      text: "Oʻgʻiloy ismida tutuq belgilari tufayli sakkiz belgi o'n baytni tashkil etadi, trim bilan bo'shliqlarni olib, emailni kichik harfga keltiramiz.",
    },
    {
      id: "kesish",
      scene: "kesish_va_qidirish",
      text: "Substring va left yordamida familiya boshini kesib olamiz, split_part esa kuchukcha belgisi bo'yicha email domenini ajratadi.",
    },
    {
      id: "lpad",
      scene: "lpad_va_format",
      text: "Tizimda hisob raqami yoki shaxsiy kod yasash uchun lpad funksiyasi yordamida identifikatorni besh xonali nollar bilan to'ldiramiz.",
    },
    {
      id: "regex",
      scene: "regex_tozalash",
      text: "Regex almashtirish orqali telefon raqamidagi barcha bo'shliq va chiziqchalarni tozalab, sof o'n ikki xonali raqamlar qatorini olamiz.",
    },
  ],
};

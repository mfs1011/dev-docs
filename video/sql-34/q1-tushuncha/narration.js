// SQL 34-bob 1-qism: "Tushuncha" — Sana funksiyalari
(function (g) {
  g.NR = {
    title: "SQL Sana Funksiyalari: Tushuncha",
    scenes: [
      "kirish",
      "extract_va_hafta_kuni",
      "yaxlitlash_trunc_va_bin",
      "bosh_kunlar_va_oraliq",
      "farq_va_joriy_vaqt"
    ],
    sceneNames: {
      kirish: "Sana Funksiyalari: Asosiy Tushunchalar",
      extract_va_hafta_kuni: "EXTRACT va Hafta Kuni Tuzog'i",
      yaxlitlash_trunc_va_bin: "Yaxlitlash: date_trunc va date_bin",
      bosh_kunlar_va_oraliq: "Bo'sh Kunlarni To'ldirish (generate_series)",
      farq_va_joriy_vaqt: "Sanalar Farqi va Joriy Vaqt (now)",
    },
    hold: {
      intro: 0.8,
      extract: 1.2,
      yaxlitlash: 1.2,
      bosh_kunlar: 1.2,
      farq: 1.2,
    },
    lines: [
      {
        scene: "kirish",
        id: "intro",
        text: "Sana funksiyalari hisobotlar tuzish, davriy guruhlash va bo'sh kunlarni aniqlashda asosiy vosita bo'lib, relyatsion bazalarda ularning o'ziga xos qoidalari mavjud."
      },
      {
        scene: "extract_va_hafta_kuni",
        id: "extract",
        text: "EXTRACT yordamida yil, oy va hafta kunini ajratamiz, ammo hafta kunini raqamlash tizimlararo farq qiladi, shuning uchun dushanbani bir, yakshanbani yetti deb hisoblovchi ISODOW standartiga tayanishingiz tavsiya etiladi."
      },
      {
        scene: "yaxlitlash_trunc_va_bin",
        id: "yaxlitlash",
        text: "date_trunc funksiyasi sanani oy yoki soat boshiga yaxlitlab oylik hisobot tuzish imkonini beradi, date_bin esa ixtiyoriy o'n besh daqiqalik oraliqlarni guruhlash uchun qulaydir."
      },
      {
        scene: "bosh_kunlar_va_oraliq",
        id: "bosh_kunlar",
        text: "Guruhlashda savdo bo'lmagan kunlar tushib qolmasligi uchun generate_series orqali to'liq kalendar yasab, chap tomondan birlashtiramiz va COALESCE yordamida nollarni to'ldiramiz."
      },
      {
        scene: "farq_va_joriy_vaqt",
        id: "farq",
        text: "Sanalar orasidagi farqni age yoki kunlar bilan o'lchash mumkin, joriy vaqt esa tranzaksiya davomida o'zgarmasdan, barcha yozuvlarga bir xil vaqt belgisini kafolatlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

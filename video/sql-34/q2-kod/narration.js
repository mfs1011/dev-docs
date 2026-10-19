// SQL 34-bob 2-qism: "Kod" — Sana funksiyalari amalda
(function (g) {
  g.NR = {
    title: "SQL Sana Funksiyalari: Amaliy Kod",
    scenes: [
      "kirish",
      "oylik_hisobot_trunc",
      "date_bin_va_chorak",
      "bosh_kunlar_generate_series",
      "farq_oy_oxiri_va_now"
    ],
    sceneNames: {
      kirish: "Jadval va EXTRACT Bilan Hafta Kunini Olish",
      oylik_hisobot_trunc: "Oylik Hisobot: date_trunc Bilan Guruhlash",
      date_bin_va_chorak: "15 Daqiqalik Oraliqlar: date_bin",
      bosh_kunlar_generate_series: "Bo'sh Kunlarni To'ldirish: generate_series",
      farq_oy_oxiri_va_now: "Sanalar Farqi (age) va Oy Oxirini Topish",
    },
    hold: {
      intro: 0.8,
      trunc: 1.2,
      bin: 1.2,
      bosh_kunlar: 1.2,
      farq: 1.2,
    },
    lines: [
      {
        scene: "kirish",
        id: "intro",
        text: "Sotuvlar jadvali misolida EXTRACT yordamida sana qismlarini ajratamiz, yakshanba kuni uchun DOW nol qiymat bersa, ISODOW yettinchi kun deb to'g'ri ko'rsatadi."
      },
      {
        scene: "oylik_hisobot_trunc",
        id: "trunc",
        text: "date_trunc bilan vaqtni oy boshiga yaxlitlab guruhlaymiz va yanvar, fevral hamda mart oylari bo'yicha sotuvlar soni va umumiy summasini hisoblaymiz."
      },
      {
        scene: "date_bin_va_chorak",
        id: "bin",
        text: "date_bin funksiyasi esa bitta soat ichida sodir bo'lgan tranzaksiyalarni o'n besh daqiqalik oraliqlarga ajratib, nozik davriy tahlil qilish imkonini beradi."
      },
      {
        scene: "bosh_kunlar_generate_series",
        id: "bosh_kunlar",
        text: "generate_series bilan olti kunlik to'liq oraliq ochib, unga sotuvlarni yarim ochiq chegara bilan birlashtiramiz va savdo bo'lmagan kunlarga nol qo'yamiz."
      },
      {
        scene: "farq_oy_oxiri_va_now",
        id: "farq",
        text: "age funksiyasi ikki sana orasidagi yillik va oylik farqni aniqlaydi, bir oylik interval qo'shib bir kun ayirish esa oyning oxirgi kunini topib beradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 34-bob 3-qism: "Dialektlar" — Sana funksiyalari tafovuti
(function (g) {
  g.NR = {
    title: "SQL Sana Funksiyalari: Dialekt Farqlari",
    scenes: [
      "kirish",
      "hafta_kuni_va_trunc",
      "bosh_kunlar_va_cte",
      "farq_va_oy_oxiri",
      "joriy_vaqt_va_matritsa"
    ],
    sceneNames: {
      kirish: "Dialektlar: Sana Funksiyalaridagi Tafovutlar",
      hafta_kuni_va_trunc: "Hafta Kuni va date_trunc Muqobillari",
      bosh_kunlar_va_cte: "Bo'sh Kunlar: generate_series vs Rekursiv CTE",
      farq_va_oy_oxiri: "Sanalar Farqi va LAST_DAY Imkoniyatlari",
      joriy_vaqt_va_matritsa: "Joriy Vaqt (now vs NOW vs SYSDATE) va Matritsa",
    },
    hold: {
      intro: 0.8,
      hafta_kuni: 1.2,
      bosh_kunlar: 1.2,
      farq: 1.2,
      joriy_vaqt: 1.2,
    },
    lines: [
      {
        scene: "kirish",
        id: "intro",
        text: "Sana funksiyalarida relyatsion bazalar o'rtasida katta tafovutlar mavjud bo'lib, saqlash tipi, hafta kunini raqamlash va yaxlitlash mexanizmlari jiddiy farq qiladi."
      },
      {
        scene: "hafta_kuni_va_trunc",
        id: "hafta_kuni",
        text: "MySQL da date_trunc yo'qligi sababli oy boshi uchun DATE_FORMAT satrga aylantiriladi, hafta kunida esa MySQL dushanbaga ikki yoki nol qiymatini beradi."
      },
      {
        scene: "bosh_kunlar_va_cte",
        id: "bosh_kunlar",
        text: "Postgresdagi generate_series muqobili sifatida MySQL va SQLite da rekursiv CTE yordamida uzluksiz kunlar ro'yxati generatsiya qilinadi."
      },
      {
        scene: "farq_va_oy_oxiri",
        id: "farq",
        text: "Sanalar farqida MySQL TIMESTAMPDIFF va DATEDIFF dan foydalansa, oy oxirini topish uchun MySQL da LAST_DAY, SQLite da esa end of month modifikatori mavjud."
      },
      {
        scene: "joriy_vaqt_va_matritsa",
        id: "joriy_vaqt",
        text: "Joriy vaqtda Postgresdagi now tranzaksiya boshini anglatsa, MySQL dagi NOW faqat operator boshini beradi, portativ kodda esa sanalarni satrga aylantirmaslik tavsiya etiladi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

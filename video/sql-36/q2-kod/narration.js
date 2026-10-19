// SQL 36-bob 2-qism: "Kod" — Massiv, range, domain va composite amalda
(function (g) {
  g.NR = {
    title: "SQL PostgreSQL Maxsus Tiplari: Amaliy Kod",
    scenes: [
      "massivlar_amalda",
      "unnest_va_agregatsiya",
      "range_amalda",
      "exclusion_amalda",
      "domain_va_composite_amalda"
    ],
    sceneNames: {
      massivlar_amalda: "Massivlar: Indekslash va Qidiruv",
      unnest_va_agregatsiya: "unnest va array_agg Amallari",
      range_amalda: "Range: Kanonik Chegaralar va Multirange",
      exclusion_amalda: "Exclusion Constraint: Bron Tizimi",
      domain_va_composite_amalda: "Domain va Composite Tip Amaliyoti"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.0,
      l10: 1.5
    },
    lines: [
      {
        scene: "massivlar_amalda",
        id: "l1",
        text: "Maqolalar jadvalida matnli teglar va sonli baholar massiv ustunlari sifatida saqlanadi."
      },
      {
        scene: "massivlar_amalda",
        id: "l2",
        text: "Birinchi indeks elementni oladi, o'z ichiga olish va kesishish operatorlari esa qidiruvni osonlashtiradi."
      },
      {
        scene: "unnest_va_agregatsiya",
        id: "l3",
        text: "unnest funksiyasi massiv elementlarini alohida relyatsion qatorlarga yoyib, guruhlash imkonini beradi."
      },
      {
        scene: "unnest_va_agregatsiya",
        id: "l4",
        text: "array_agg funksiyasi esa aksincha, qatorlardagi qiymatlarni bitta massivga yig'ib beradi."
      },
      {
        scene: "range_amalda",
        id: "l5",
        text: "daterange oraliqlari diskret sanalarni avtomatik ravishda yarim ochiq kanonik formatda saqlaydi."
      },
      {
        scene: "range_amalda",
        id: "l6",
        text: "Ikki oraliq kesishishini tekshirish uchun ikkita ampersand, birlashtirish uchun esa multirange ishlatiladi."
      },
      {
        scene: "exclusion_amalda",
        id: "l7",
        text: "Mehmonxona xonalarini bron qilishda EXCLUDE cheklovi bir xonaga vaqti kesishuvchi oraliq kiritilishini bloklaydi."
      },
      {
        scene: "exclusion_amalda",
        id: "l8",
        text: "Baza darajasidagi bunday cheklov poyga holatlari va xatolarning oldini ishonchli oladi."
      },
      {
        scene: "domain_va_composite_amalda",
        id: "l9",
        text: "Telefon raqami va musbat summa domenlari noto'g'ri qiymat kiritilganda darhol xatolik chiqaradi."
      },
      {
        scene: "domain_va_composite_amalda",
        id: "l10",
        text: "Kompozit manzil tipidagi maydonlarga esa qavsli ifoda orqali to'g'ri murojaat qilinadi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

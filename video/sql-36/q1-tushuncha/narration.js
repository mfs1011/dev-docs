// SQL 36-bob 1-qism: "Tushuncha" — Massiv, range, domain va composite
(function (g) {
  g.NR = {
    title: "SQL PostgreSQL Maxsus Tiplari: Tushuncha",
    scenes: [
      "kirish",
      "massivlar",
      "range_tiplari",
      "exclusion_constraint",
      "domain_va_composite"
    ],
    sceneNames: {
      kirish: "PostgreSQL Maxsus Tiplari: Kirish",
      massivlar: "Massivlar: Indekslar va Qoidalar",
      range_tiplari: "Range Tiplari va Kanonik Chegaralar",
      exclusion_constraint: "Exclusion Cheklovi: Kesishmaslik Kafolati",
      domain_va_composite: "Domain va Composite Tiplari"
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
        scene: "kirish",
        id: "l1",
        text: "PostgreSQL relyatsion imkoniyatlarni kengaytiruvchi massiv, oraliq, domen va kompozit tiplarni taklif etadi."
      },
      {
        scene: "kirish",
        id: "l2",
        text: "Bular dinamik ro'yxatlar, vaqt davrlari va maxsus biznes qoidalarini aniq ifodalashga yordam beradi."
      },
      {
        scene: "massivlar",
        id: "l3",
        text: "Massiv indekslari birdan boshlanadi, e'lon qilingan o'lcham esa ma'lumotlar bazasi tomonidan qat'iy cheklanmaydi."
      },
      {
        scene: "massivlar",
        id: "l4",
        text: "Massiv to'plam emas, shuning uchun tez-tez qidiriladigan maydonlar uchun alohida relyatsion jadval tavsiya etiladi."
      },
      {
        scene: "range_tiplari",
        id: "l5",
        text: "Oraliq tiplari qiymatlar chegarasini saqlaydi va diskret tiplarda avtomatik yarim ochiq kanonik shaklga keltiriladi."
      },
      {
        scene: "range_tiplari",
        id: "l6",
        text: "Kuchukcha-katta operatori oraliq ichidaligini, ikkita ampersand esa ikki oraliq kesishishini tekshiradi."
      },
      {
        scene: "exclusion_constraint",
        id: "l7",
        text: "Vaqt oraliqlarida unikallik emas, balki kesishmaslik talab qilingani uchun istisno cheklovi qo'llaniladi."
      },
      {
        scene: "exclusion_constraint",
        id: "l8",
        text: "Gist indeksi yordamida mehmonxona yoki uchrashuv xonalari bir vaqtda qayta band qilinishining oldi olinadi."
      },
      {
        scene: "domain_va_composite",
        id: "l9",
        text: "Domen mavjud tipga cheklov qo'shib, butun loyiha bo'ylab qayta ishlatiladigan xavfsiz tip yaratadi."
      },
      {
        scene: "domain_va_composite",
        id: "l10",
        text: "Kompozit tip esa bir nechta maydonli yozuv tuzilmasini bitta ustunda jamlash imkonini beradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

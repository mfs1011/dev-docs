// SQL 35-bob 1-qism: "Tushuncha" — JSON
(function (g) {
  g.NR = {
    title: "SQL JSON Ma'lumotlar Bilan Ishlash: Tushuncha",
    scenes: [
      "kirish",
      "json_vs_jsonb",
      "operatorlar",
      "containment_va_filter",
      "loyihalash_va_indeks"
    ],
    sceneNames: {
      kirish: "JSON va Relyatsion Model Integratsiyasi",
      json_vs_jsonb: "PostgreSQL: json va jsonb Farqi",
      operatorlar: "Ajratish Operatorlari: ->, ->> va #>>",
      containment_va_filter: "Containment (@>) va Kalit Tekshiruvi (?)",
      loyihalash_va_indeks: "JSON Loyihalash Qoidalari va GIN Indeksi",
    },
    hold: {
      intro: 0.8,
      types: 1.2,
      ops: 1.2,
      contain: 1.2,
      design: 1.2,
    },
    lines: [
      {
        scene: "kirish",
        id: "intro",
        text: "JSON relyatsion bazalarda yarim strukturalashgan va dinamik ma'lumotlarni saqlash imkonini beradi, relyatsion model bilan birga qulay gibrid arxitekturani hosil qiladi."
      },
      {
        scene: "json_vs_jsonb",
        id: "types",
        text: "Postgresda json tipi matnning aniq nusxasini saqlasa, jsonb ikkilik binar formatda tahlil qilib, takror kalitlarni tozalaydi va juda tez o'qilishini ta'minlaydi."
      },
      {
        scene: "operatorlar",
        id: "ops",
        text: "Tire-katta belgisi elementni JSON formatida, ikkita tire-katta esa toza matn sifatida ajratadi, panjara operatorlari esa ichma-ich joylashgan yo'llar bo'yicha qiymat oladi."
      },
      {
        scene: "containment_va_filter",
        id: "contain",
        text: "Kuchukcha-katta operatori hujjat ikkinchi JSONni to'liq o'z ichiga olishini tekshirsa, so'roq belgisi yuqori darajada kalit yoki massiv elementi borligini aniqlaydi."
      },
      {
        scene: "loyihalash_va_indeks",
        id: "design",
        text: "JSON yangilanganda butun qator qulflanadi, shuning uchun tez-tez filtrlanadigan maydonlar oddiy ustun bo'lishi, jsonb esa GIN indeksi bilan tezlashtirilishi zarur."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

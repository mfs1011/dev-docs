// SQL 49-bob 2-qism: "Kod" — To'liq matnli qidiruv
(function (g) {
  g.NR = {
    title: "SQL To'liq Matnli Qidiruv: Kod",
    scenes: [
      "pg_tsvector_lugatlar",
      "pg_qidiruv_va_prefiks",
      "pg_reyting_va_websearch",
      "pg_gin_va_trgm_benchmark"
    ],
    sceneNames: {
      pg_tsvector_lugatlar: "PostgreSQL: tsvector va Lug'atlar",
      pg_qidiruv_va_prefiks: "Qidiruv va Prefiks (:*) Sintaksisi",
      pg_reyting_va_websearch: "ts_rank va websearch_to_tsquery",
      pg_gin_va_trgm_benchmark: "GIN va pg_trgm Benchmarklari"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "pg_tsvector_lugatlar",
        id: "l1",
        text: "Postgresda to'liq matnli qidiruv matnni ti-es-vektor turiga aylantirishdan boshlanadi."
      },
      {
        scene: "pg_tsvector_lugatlar",
        id: "l2",
        text: "Simpl konfiguratsiyasida so'zlar kichik harf va o'rni bilan saqlansa, inglizcha lug'atda qo'shimchalar olib tashlanib to'xtash so'zlari tashlanadi."
      },
      {
        scene: "pg_qidiruv_va_prefiks",
        id: "l3",
        text: "Ti-es-kveri bilan aynan konteyner so'zi qidirilganda konteynerda so'zi tushib qoladi."
      },
      {
        scene: "pg_qidiruv_va_prefiks",
        id: "l4",
        text: "So'z oxiriga ikki nuqta yulduzcha prefiksi qo'shilganda esa qo'shimchasi bor barcha maqolalar to'liq topiladi."
      },
      {
        scene: "pg_reyting_va_websearch",
        id: "l5",
        text: "Ti-es-rank funksiyasi so'zlar necha marta va qanday tartibda kelganiga qarab natijalarni o'xshashlik bo'yicha saralaydi."
      },
      {
        scene: "pg_reyting_va_websearch",
        id: "l6",
        text: "Veb-syorch funksiyasi esa qidiruv tizimlaridagi kabi minus belgili so'rovlarni xatosiz qabul qiladi."
      },
      {
        scene: "pg_gin_va_trgm_benchmark",
        id: "l7",
        text: "Yuz ming qatorli jadvalda oddiy layk besh millisekund vaqt olsa, jin indeksi atigi nol butun yuzdan uch millisekundda ishlaydi."
      },
      {
        scene: "pg_gin_va_trgm_benchmark",
        id: "l8",
        text: "Trigramma kengaytmasi esa imlo xatolarini topish va layk so'rovlarini bir yuz o'ttiz baravar tezlashtirish imkonini beradi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

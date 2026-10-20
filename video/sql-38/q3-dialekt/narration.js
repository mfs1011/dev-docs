// SQL 38-bob 3-qism: "Dialektlar" — Normalizatsiya va tizimlararo xususiyatlar
(function (g) {
  g.NR = {
    title: "SQL Normalizatsiya va Tuzilma: Dialektlar",
    scenes: [
      "dialektlar_kirish",
      "mysql_va_materialized_view",
      "sqlite_va_pragma_sharti",
      "qiyosiy_matritsa",
      "xulosa_va_loyiha"
    ],
    sceneNames: {
      dialektlar_kirish: "Tizimlararo Muvofiqlik va Normalizatsiya",
      mysql_va_materialized_view: "MySQL: Yig'ma Jadvallar va Cheklovlar",
      sqlite_va_pragma_sharti: "SQLite: PRAGMA va Normallashgan Yaxlitlik",
      qiyosiy_matritsa: "Uch Dialektning Qiyosiy Matritsasi",
      xulosa_va_loyiha: "Tipik Xatolar va Arxitektura Xulosasi"
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
        scene: "dialektlar_kirish",
        id: "l1",
        text: "Normalizatsiya qoidalari barcha relyatsion ma'lumotlar bazalarida bir xil mantiqiy poydevorga tayanadi."
      },
      {
        scene: "dialektlar_kirish",
        id: "l2",
        text: "Biroq yig'ma ma'lumotlarni saqlash va tashqi kalitlarni tekshirishda tizimlar o'rtasida farqlar mavjud."
      },
      {
        scene: "mysql_va_materialized_view",
        id: "l3",
        text: "May es-kyu-el qo'llanmasida uchinchi normal shakl qat'iy tavsiya etilsa-da, unda materialized view mavjud emas."
      },
      {
        scene: "mysql_va_materialized_view",
        id: "l4",
        text: "Yig'ma jadvallar oddiy jadval sifatida yaratilib, triggerlar yoki rejalashtirilgan vazifalar bilan yangilanadi."
      },
      {
        scene: "sqlite_va_pragma_sharti",
        id: "l5",
        text: "Es-kyu-laytda normallashgan tuzilma qursangiz ham, pragma buyrug'isiz tashqi kalitlar tekshirilmaydi."
      },
      {
        scene: "sqlite_va_pragma_sharti",
        id: "l6",
        text: "Shuning uchun ilovaning har bir ulanishida cheklovlarni yoqish relyatsion yaxlitlik uchun shartdir."
      },
      {
        scene: "qiyosiy_matritsa",
        id: "l7",
        text: "Qiyosiy matritsa Postgres, May es-kyu-el va Es-kyu-laytda tuzilma boshqaruvini yaqqol solishtirib beradi."
      },
      {
        scene: "qiyosiy_matritsa",
        id: "l8",
        text: "Postgresda materialized view qulay bo'lsa, qolgan tizimlarda yig'ma jadvallarni sinxronlash qo'lda boshqariladi."
      },
      {
        scene: "xulosa_va_loyiha",
        id: "l9",
        text: "Mijoz ma'lumotini takrorlamaslik va narx snapshotini oraliq jadvalda saqlash arxitekturaning oltin qoidasidir."
      },
      {
        scene: "xulosa_va_loyiha",
        id: "l10",
        text: "Har doim avval normallashgan toza model quring, denormalizatsiyani esa faqat o'lchab ko'rib qo'llang."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

// SQL 37-bob 3-qism: "Dialektlar" — Dialektlar farqi va qiyosiy tahlil
(function (g) {
  g.NR = {
    title: "SQL Aloqalar va Tashqi Kalitlar: Dialektlar",
    scenes: [
      "dialektlar_kirish",
      "mysql_avtomatik_indeks",
      "sqlite_fk_va_mismatch",
      "solishtirma_matritsa",
      "xulosa_va_loyiha"
    ],
    sceneNames: {
      dialektlar_kirish: "Tashqi Kalitlarda Dialektlar Farqi",
      mysql_avtomatik_indeks: "MySQL: Avtomatik Indeks va SET DEFAULT",
      sqlite_fk_va_mismatch: "SQLite: PRAGMA va Mismatch Xatosi",
      solishtirma_matritsa: "Uch Dialektning Qiyosiy Matritsasi",
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
        text: "Tashqi kalitlar mantiqi umumiy bo'lsa-da, uchta asosiy tizimda indekslash va cheklovlar turlicha ishlaydi."
      },
      {
        scene: "dialektlar_kirish",
        id: "l2",
        text: "Postgres standartga qat'iy amal qilsa, May es-kyu-el va Es-kyu-layt o'ziga xos qoidalarga ega."
      },
      {
        scene: "mysql_avtomatik_indeks",
        id: "l3",
        text: "May es-kyu-el bola tomondagi tashqi kalit ustuniga indeksni avtomatik ravishda o'zi yaratib beradi."
      },
      {
        scene: "mysql_avtomatik_indeks",
        id: "l4",
        text: "Biroq unda qisman null qilish sintaksisi yo'q, set default amali esa amalda xatolik qaytaradi."
      },
      {
        scene: "sqlite_fk_va_mismatch",
        id: "l5",
        text: "Es-kyu-laytda tashqi kalitlar sukut bo'yicha o'chiq bo'lib, pragma buyrug'i orqali yoqilishi shart."
      },
      {
        scene: "sqlite_fk_va_mismatch",
        id: "l6",
        text: "Shuningdek, ota kaliti unikal bo'lmagan xatolik jadval yaratishda emas, yozuv kiritish paytida aniqlanadi."
      },
      {
        scene: "solishtirma_matritsa",
        id: "l7",
        text: "Qiyosiy matritsa har bir tizimning kuchli va ehtiyot bo'lish zarur bo'lgan jihatlarini yaqqol ko'rsatadi."
      },
      {
        scene: "solishtirma_matritsa",
        id: "l8",
        text: "Postgres aniq xato xabarlari bersa, Es-kyu-layt umumiy, May es-kyu-el esa to'liq cheklov ta'rifini qaytaradi."
      },
      {
        scene: "xulosa_va_loyiha",
        id: "l9",
        text: "Aloqalarni ko'pga-ko'p massivlarda saqlamaslik va tarixiy narxni oraliq jadvalga kiritish muhim qoidadir."
      },
      {
        scene: "xulosa_va_loyiha",
        id: "l10",
        text: "Kaskad siyosatini faqat ajralmas qismlarga qo'llab, bola ustunlarini doimo indekslab boring."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

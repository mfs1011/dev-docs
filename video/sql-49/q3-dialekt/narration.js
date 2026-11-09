// SQL 49-bob 3-qism: "Dialektlar" — To'liq matnli qidiruv
(function (g) {
  g.NR = {
    title: "SQL To'liq Matnli Qidiruv: Dialektlar",
    scenes: [
      "mysql_fulltext_rejimlari",
      "mysql_min_token_va_ngram",
      "sqlite_fts5_virtual_jadval",
      "uch_tizim_qiyosiy_xulosasi"
    ],
    sceneNames: {
      mysql_fulltext_rejimlari: "MySQL: FULLTEXT va Boolean Rejimi",
      mysql_min_token_va_ngram: "MySQL: Minimal Token va ngram Parser",
      sqlite_fts5_virtual_jadval: "SQLite: FTS5 Virtual Jadvali va bm25",
      uch_tizim_qiyosiy_xulosasi: "PostgreSQL, MySQL va SQLite Taqqosi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_fulltext_rejimlari",
        id: "l1",
        text: "May es-kyu-elda to'liq matnli qidiruv varcha yoki tekst ustunlarida ful-tekst indeksi orqali ishlaydi."
      },
      {
        scene: "mysql_fulltext_rejimlari",
        id: "l2",
        text: "Metch egenst sintaksisida oddiy qidiruv moslik bo'yicha saralansa, bulien rejimida plyus, minus va yulduzcha operatorlari qo'llaniladi."
      },
      {
        scene: "mysql_min_token_va_ngram",
        id: "l3",
        text: "Inno-de-be minimal token uzunligi uch belgidan qisqa bo'lgan va kabi so'zlarni indeksga olmaydi."
      },
      {
        scene: "mysql_min_token_va_ngram",
        id: "l4",
        text: "So'z o'rtasidagi bo'laklar uchun esa matnni ikki belgili bo'laklarga ajratuvchi engrem parseridan foydalaniladi."
      },
      {
        scene: "sqlite_fts5_virtual_jadval",
        id: "l5",
        text: "Es-kyu-laytda to'liq matnli qidiruv alohida ef-ti-es-besh virtual jadvali yordamida tashkil etiladi."
      },
      {
        scene: "sqlite_fts5_virtual_jadval",
        id: "l6",
        text: "Qidiruv natijalari be-em-yigirma-besh reytingi bo'yicha saralanib, qiymat qancha kichik bo'lsa, moslik shuncha yuqori hisoblanadi."
      },
      {
        scene: "uch_tizim_qiyosiy_xulosasi",
        id: "l7",
        text: "Postgresda ti-es-vektor va trigramma, May es-kyu-elda ful-tekst, Es-kyu-laytda esa ef-ti-es-besh mos keladi."
      },
      {
        scene: "uch_tizim_qiyosiy_xulosasi",
        id: "l8",
        text: "O'zbek tilida aniq qidiruv uchun har uchala tizimda ham prefiks yulduzchasidan foydalanish eng to'g'ri amaliyotdir."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

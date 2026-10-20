// SQL 45-bob 3-qism: "Dialektlar" — MySQL va SQLite EXPLAIN farqlari
(function (g) {
  g.NR = {
    title: "SQL EXPLAIN: Dialektlar",
    scenes: [
      "mysql_traditional",
      "mysql_tree_va_analyze",
      "sqlite_query_plan",
      "taqqoslash_va_xatolar"
    ],
    sceneNames: {
      mysql_traditional: "MySQL: Traditional Jadval Formati",
      mysql_tree_va_analyze: "MySQL: Tree Rejasi va EXPLAIN ANALYZE",
      sqlite_query_plan: "SQLite: EXPLAIN QUERY PLAN",
      taqqoslash_va_xatolar: "Taqqoslash Jadvali va Xatolar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_traditional",
        id: "l1",
        text: "MySQL'da tredishnl formati rejani jadval ko'rinishida berib, tayp ustunida kirish turini ko'rsatadi."
      },
      {
        scene: "mysql_traditional",
        id: "l2",
        text: "Eng xavfli belgi — bu ALL ya'ni to'liq skan, hamda ekstra ustunidagi yuzing faylsort yozuvidir."
      },
      {
        scene: "mysql_tree_va_analyze",
        id: "l3",
        text: "Zamonaviy MySQL'da ekspleyn analayz daraxt ko'rinishida bo'lib, har bir iterator uchun real vaqtni o'lchaydi."
      },
      {
        scene: "mysql_tree_va_analyze",
        id: "l4",
        text: "Katta birlashtirishda Postgres hesh joynga o'tgan bo'lsa, MySQL yigirma ming lupli nested lupda qoldi."
      },
      {
        scene: "sqlite_query_plan",
        id: "l5",
        text: "Es-kyu-laytda oddiy ekspleyn ichki baytkodni chiqargani sababli, albatta ekspleyn kveri plen ishlatilishi shart."
      },
      {
        scene: "sqlite_query_plan",
        id: "l6",
        text: "U skan va serch so'zlari bilan indeks ishlatilishini ko'rsatadi, ammo reja ichida vaqt va narxlar berilmaydi."
      },
      {
        scene: "taqqoslash_va_xatolar",
        id: "l7",
        text: "Eng katta xato — kostni millisekund deb o'qish yoki lups ko'paytuvchisini hisobga olmaslikdir."
      },
      {
        scene: "taqqoslash_va_xatolar",
        id: "l8",
        text: "Rejani to'g'ri tahlil qilish orqali siz har qanday sekin so'rovning asl sababini osonlikcha bartaraf etasiz."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

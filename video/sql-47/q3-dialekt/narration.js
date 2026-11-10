// SQL 47-bob 3-qism: "Dialektlar" — Sekin so'rovlar
(function (g) {
  g.NR = {
    title: "SQL Sekin So'rovlar: Dialektlar",
    scenes: [
      "mysql_collation_va_functional_keys",
      "mysql_implicit_conversion_ogohlantirish",
      "sqlite_type_affinity_mojizasi",
      "uch_tizim_taqqoslash_jadvali"
    ],
    sceneNames: {
      mysql_collation_va_functional_keys: "MySQL: Kollatsiya va Funksional Indeks",
      mysql_implicit_conversion_ogohlantirish: "MySQL: Yashirin Skanerlash va Warning 1739",
      sqlite_type_affinity_mojizasi: "SQLite: Type Affinity va MULTI-INDEX OR",
      uch_tizim_taqqoslash_jadvali: "Uch Tizim Taqqoslash Jadvali va Xulosa"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_collation_va_functional_keys",
        id: "l1",
        text: "May es-kyu-elda standart kollatsiya registrga befarq bo'lgani sababli, ko'pincha louer funksiyasini ishlatish shart emas."
      },
      {
        scene: "mysql_collation_va_functional_keys",
        id: "l2",
        text: "Agar ifoda indeksi zarur bo'lsa, May es-kyu-elda funksiya ikkita qavs ichida ko'rsatilishi talab etiladi."
      },
      {
        scene: "mysql_implicit_conversion_ogohlantirish",
        id: "l3",
        text: "Biroq matn ustunini son bilan solishtirganda May es-kyu-el xato bermaydi, balki bir ming yetti yuz o'ttiz to'qqizinchi ogohlantirish bilan butun indeksni elaydi."
      },
      {
        scene: "mysql_implicit_conversion_ogohlantirish",
        id: "l4",
        text: "Natijada so'rov vaqti nol butun mingdan to'rt millisekunddan o'n millisekundgacha keskin sekinlashadi."
      },
      {
        scene: "sqlite_type_affinity_mojizasi",
        id: "l5",
        text: "Es-kyu-laytda esa tayp affiniti, ya'ni turga moyillik qoidasi sababli son matnga aylanib indeksli qidiruv saqlanib qoladi."
      },
      {
        scene: "sqlite_type_affinity_mojizasi",
        id: "l6",
        text: "Shuningdek, Es-kyu-layt multi indeks o-er mexanizmi orqali turli ustunlardagi shartlarni alohida qidirib birlashtiradi."
      },
      {
        scene: "uch_tizim_taqqoslash_jadvali",
        id: "l7",
        text: "Uchala tizimni solishtirsak, xatoni darhol to'xtatishda Postgres, qulay kollatsiyada May es-kyu-el, moslashuvchanlikda Es-kyu-layt ajralib turadi."
      },
      {
        scene: "uch_tizim_taqqoslash_jadvali",
        id: "l8",
        text: "Lekin barcha bazalarda umumiy qoida bitta: ustunlarni funksiyasiz qoldiring va parametrlarni to'g'ri turda uzating."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

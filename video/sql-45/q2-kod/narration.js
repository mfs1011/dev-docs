// SQL 45-bob 2-qism: "Kod" — Amaliyot va EXPLAIN tahlili
(function (g) {
  g.NR = {
    title: "SQL EXPLAIN: Kod va Amaliyot",
    scenes: [
      "sodda_reja_va_daraxt",
      "nested_loop_va_analyze",
      "katta_birlashtirish_hash_join",
      "topn_sort_va_dml"
    ],
    sceneNames: {
      sodda_reja_va_daraxt: "Sodda Reja va Daraxtni O'qish",
      nested_loop_va_analyze: "EXPLAIN ANALYZE: Nested Loop",
      katta_birlashtirish_hash_join: "Katta Birlashtirish: Hash Join",
      topn_sort_va_dml: "Top-N Heapsort va Xavfsiz DML"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "sodda_reja_va_daraxt",
        id: "l1",
        text: "Ikki yuz ming qatorli buyurtmalar jadvalida filtrlarsiz so'rov oddiy sek skan orqali to'liq o'qilishini ko'ramiz."
      },
      {
        scene: "sodda_reja_va_daraxt",
        id: "l2",
        text: "Tartiblash va limit qo'shilganda esa reja pastdan parallel skanerlash, saralash va limit bosqichlari bo'ylab yuqoriga ko'tariladi."
      },
      {
        scene: "nested_loop_va_analyze",
        id: "l3",
        text: "Besh mijoz buyurtmalarini ekspleyn analayz bilan birlashtirganimizda, baza nested lup mexanizmini tanladi."
      },
      {
        scene: "nested_loop_va_analyze",
        id: "l4",
        text: "Tashqi mijozlar jadvali bir marta, ichki buyurtmalar esa indeks orqali besh marta takrorlanib, aniq qatorlar topildi."
      },
      {
        scene: "katta_birlashtirish_hash_join",
        id: "l5",
        text: "Ammo butun jadval bo'yicha hisob-kitobda rejalashtiruvchi nested lupdan voz kechib, hesh joyn usulini ishga tushirdi."
      },
      {
        scene: "katta_birlashtirish_hash_join",
        id: "l6",
        text: "Mijozlar xotiradagi hesh jadvalga joylandi va ikki yuz ming buyurtma bir martada chaqqon tutashtirildi."
      },
      {
        scene: "topn_sort_va_dml",
        id: "l7",
        text: "Limit bilan saralashda top-en hip-sort usuli qo'llanib, xotirada faqat kerakli beshta qator ushlab turildi."
      },
      {
        scene: "topn_sort_va_dml",
        id: "l8",
        text: "O'chirish so'rovini esa begin va rolbek ichida xavfsiz tekshirib, besh yuz qirq sakkiz qator o'chirilishini ko'rdik."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

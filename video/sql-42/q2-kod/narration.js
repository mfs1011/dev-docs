// SQL 42-bob 2-qism: "Kod" — Ko'p ustunli indeks
(function (g) {
  g.NR = {
    title: "SQL Ko'p Ustunli Indeks: Kod",
    scenes: [
      "chap_ustun_amaliyoti",
      "skip_scan_tajribasi",
      "order_by_va_descending_indeks",
      "bitmap_or_birlashtirish"
    ],
    sceneNames: {
      chap_ustun_amaliyoti: "Chap Ustunlar Qoidasi: EXPLAIN Tahlili",
      skip_scan_tajribasi: "Skip Scan Tajribasi: Index Searches 5",
      order_by_va_descending_indeks: "ORDER BY va Descending Indeks Kodu",
      bitmap_or_birlashtirish: "OR Sharti va BitmapOr Birlashtirish"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "chap_ustun_amaliyoti",
        id: "l1",
        text: "Ikki yuz ming qatorli xodimlar jadvalida rol va bo'y bo'yicha qidirilganda indeks to'liq ishlatildi."
      },
      {
        scene: "chap_ustun_amaliyoti",
        id: "l2",
        text: "Lekin faqat rol sharti berilganda, u jadvalning uchdan ikki qismi bo'lgani uchun ketma-ket o'qish tanlandi."
      },
      {
        scene: "skip_scan_tajribasi",
        id: "l3",
        text: "So'rovda rol ko'rsatilmagan bo'lsa ham, Postgres o'n sakkiz beshta qidiruv bilan skip skan qildi."
      },
      {
        scene: "skip_scan_tajribasi",
        id: "l4",
        text: "Rolning har bir qiymati bo'ylab sakrab, olti yuzta sahifa o'rniga yigirma ikkita sahifa bilan natija olindi."
      },
      {
        scene: "order_by_va_descending_indeks",
        id: "l5",
        text: "Teskari yo'nalishdagi saralash indeksni orqaga o'qish orqali saralash amalisiz bir zumda bajarildi."
      },
      {
        scene: "order_by_va_descending_indeks",
        id: "l6",
        text: "Aralash yo'nalishda esa maxsus disending indeks yaratilgach, qo'shimcha saralash butunlay yo'qoldi."
      },
      {
        scene: "bitmap_or_birlashtirish",
        id: "l7",
        text: "Or shartida ikkita alohida indeks skanerlanib, ularning natijalari bitmap or orqali birlashtirildi."
      },
      {
        scene: "bitmap_or_birlashtirish",
        id: "l8",
        text: "Baza har bir indeksdan mos qatorlar xaritasini olib, asosiy jadvalga atigi bir marta murojaat qildi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

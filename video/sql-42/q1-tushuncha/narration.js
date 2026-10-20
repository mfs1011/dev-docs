// SQL 42-bob 1-qism: "Tushuncha" — Ko'p ustunli indeks
(function (g) {
  g.NR = {
    title: "SQL Ko'p Ustunli Indeks: Tushuncha",
    scenes: [
      "kop_ustunli_tuzilma",
      "chap_ustunlar_qoidasi",
      "skip_scan_mexanikasi",
      "order_by_va_descending",
      "or_va_bitmap_birlashtirish"
    ],
    sceneNames: {
      kop_ustunli_tuzilma: "Ko'p Ustunli Indeks va Tartiblangan Massiv",
      chap_ustunlar_qoidasi: "Chap Ustunlar Qoidasi (Leftmost Prefix)",
      skip_scan_mexanikasi: "Skip Scan: Chap Ustunsiz Qidiruv",
      order_by_va_descending: "ORDER BY va Descending Indeks",
      or_va_bitmap_birlashtirish: "OR Shartlari va Indekslarni Birlashtirish"
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
        scene: "kop_ustunli_tuzilma",
        id: "l1",
        text: "Ko'p ustunli indeks bir nechta ustun qiymatlarini ketma-ket ulab, yagona tartiblangan massiv hosil qiladi."
      },
      {
        scene: "kop_ustunli_tuzilma",
        id: "l2",
        text: "Xuddi telefon kitobidek, familiya bo'yicha qidirish oson, lekin faqat ism bo'yicha butun kitobni varaqlashga to'g'ri keladi."
      },
      {
        scene: "chap_ustunlar_qoidasi",
        id: "l3",
        text: "Chap ustunlar qoidasiga ko'ra, indeks faqat chapdan boshlangan ustunlar qidirilgandagina to'liq kuchga kiradi."
      },
      {
        scene: "chap_ustunlar_qoidasi",
        id: "l4",
        text: "Oltin qoida: doimo tenglik bilan qidiriladigan ustunlarni chapga, oraliq shartlarini esa ulardan keyinga qo'ying."
      },
      {
        scene: "skip_scan_mexanikasi",
        id: "l5",
        text: "Agar chap ustunda qiymatlar kam bo'lsa, zamonaviy bazalar qiymatdan qiymatga sakrab skip skan amalga oshiradi."
      },
      {
        scene: "skip_scan_mexanikasi",
        id: "l6",
        text: "Bu mexanizm chap ustun ko'rsatilmagan holatlarda ham o'ngdagi ustun bo'yicha indeksdan foydalanishga imkon beradi."
      },
      {
        scene: "order_by_va_descending",
        id: "l7",
        text: "Indeks tartiblangan bo'lgani sababli, saralash buyrug'i qo'shimcha xotira sarflamasdan bir zumda bajariladi."
      },
      {
        scene: "order_by_va_descending",
        id: "l8",
        text: "Aralash yo'nalishli saralash uchun esa indeks yaratishda diskending kalit so'zidan foydalanish shart."
      },
      {
        scene: "or_va_bitmap_birlashtirish",
        id: "l9",
        text: "Bitta ko'p ustunli indeks or sharti bilan bog'langan ikki ustunni bir vaqtda qidirishga qodir emas."
      },
      {
        scene: "or_va_bitmap_birlashtirish",
        id: "l10",
        text: "Bunday vaziyatda baza alohida indekslar bit xaritalarini xotirada birlashtirib eng optimal natijani hosil qiladi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

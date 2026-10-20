// SQL 43-bob 1-qism: "Tushuncha" — Maxsus indekslar
(function (g) {
  g.NR = {
    title: "SQL Maxsus Indekslar: Tushuncha",
    scenes: [
      "maxsus_indekslar_xaritasi",
      "ifoda_indeksi_va_unique",
      "qisman_indeks_mohiyati",
      "include_va_index_only_scan",
      "operator_klassi_va_like"
    ],
    sceneNames: {
      maxsus_indekslar_xaritasi: "Maxsus Indekslar Xaritasi va Imkoniyatlari",
      ifoda_indeksi_va_unique: "Ifoda Indeksi va UNIQUE (lower)",
      qisman_indeks_mohiyati: "Qisman Indeks (Partial Index)",
      include_va_index_only_scan: "INCLUDE va Index-Only Scan",
      operator_klassi_va_like: "Operator Klassi: text_pattern_ops va LIKE"
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
        scene: "maxsus_indekslar_xaritasi",
        id: "l1",
        text: "Maxsus indekslar ma'lumotlar bazasida indeksni aynan nimaga va qaysi qatorlarga qurish imkonini beradi."
      },
      {
        scene: "maxsus_indekslar_xaritasi",
        id: "l2",
        text: "Ular orqali ifodalar, qisman qatorlar, qoplovchi yuk ustunlari va maxsus qidiruv qoidalari boshqariladi."
      },
      {
        scene: "ifoda_indeksi_va_unique",
        id: "l3",
        text: "Katta-kichik harfni farqlamaydigan qidiruvlarda oddiy indeks ishlamaydi, chunki ifoda saqlanmagan bo'ladi."
      },
      {
        scene: "ifoda_indeksi_va_unique",
        id: "l4",
        text: "Lover ifodasi indeksi qidiruvni tezlashtiradi, unik indeksi esa bir xil emaillarni harf farqi bilan kiritishni taqiqlaydi."
      },
      {
        scene: "qisman_indeks_mohiyati",
        id: "l5",
        text: "Qisman indeks jadvalning faqat muayyan shartga mos kam sonli qatorlari uchun yaratiladi."
      },
      {
        scene: "qisman_indeks_mohiyati",
        id: "l6",
        text: "U o'nlab baravar kam joy egallaydi va yozish amallarini ortiqcha yangilanishlardan to'liq himoyalaydi."
      },
      {
        scene: "include_va_index_only_scan",
        id: "l7",
        text: "Inklud kalit so'zi qidiruv kalitiga daxl qilmagan holda so'rovga kerakli qo'shimcha ustunlarni indeksga yuklaydi."
      },
      {
        scene: "include_va_index_only_scan",
        id: "l8",
        text: "Baza jadval sahifalariga bormasdan javob qaytaradi, vakuum esa ko'rinuvchanlik xaritasini tozalab beradi."
      },
      {
        scene: "operator_klassi_va_like",
        id: "l9",
        text: "Standart matn tartibi layk prefiks qidiruviga mos kelmaganda, tekst pattern ops operator klassi talab etiladi."
      },
      {
        scene: "operator_klassi_va_like",
        id: "l10",
        text: "U belgima-belgi solishtirib layk shartini oraliqqa aylantiradi va qidiruvni yuzlab baravar tezlashtiradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

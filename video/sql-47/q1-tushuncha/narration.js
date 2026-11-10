// SQL 47-bob 1-qism: "Tushuncha" — Sekin so'rovlar
(function (g) {
  g.NR = {
    title: "SQL Sekin So'rovlar: Tushuncha",
    scenes: [
      "funksiya_va_ifoda_indeksi",
      "yashirin_tur_ozgarishi",
      "or_sharti_va_bitmap",
      "count_star_va_mvcc"
    ],
    sceneNames: {
      funksiya_va_ifoda_indeksi: "Ustun Funksiya Ichida: Ifoda Indeksi",
      yashirin_tur_ozgarishi: "Yashirin Turni O'zgartirish (Type Conversion)",
      or_sharti_va_bitmap: "Turli Ustunlarda OR va Indekslarni Birlashtirish",
      count_star_va_mvcc: "COUNT(*) Nega Sekin? MVCC va Taxminiy Hisob"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "funksiya_va_ifoda_indeksi",
        id: "l1",
        text: "Jadvalda indeks bo'lsa ham, agar ustun funksiya ichiga o'rab qo'yilsa, rejalashtiruvchi undan foydalana olmaydi."
      },
      {
        scene: "funksiya_va_ifoda_indeksi",
        id: "l2",
        text: "Bunday vaziyatda yo maxsus ifoda indeksi yaratiladi, yoki sana misolidek shart oraliq ko'rinishida qayta yoziladi."
      },
      {
        scene: "yashirin_tur_ozgarishi",
        id: "l3",
        text: "Ikkinchi xavfli xato bu yashirin turni o'zgartirish, ya'ni matnli ustunni tasodifan raqam bilan solishtirishdir."
      },
      {
        scene: "yashirin_tur_ozgarishi",
        id: "l4",
        text: "Postgresda bu darhol xato bersa, May es-kyu-elda har bir satrni songa aylantirib, yuz minglab qatorni behuda elaydi."
      },
      {
        scene: "or_sharti_va_bitmap",
        id: "l5",
        text: "Turli ustunlar o'rtasidagi o-er sharti bitta indeks bilan cheklana olmaydi va alohida skanerlashni talab qiladi."
      },
      {
        scene: "or_sharti_va_bitmap",
        id: "l6",
        text: "Bazada har bir ustun bo'yicha bitlar xaritasi yasalib birlashtiriladi, lekin bitta ustunda indeks bo'lmasa butun jadval o'qiladi."
      },
      {
        scene: "count_star_va_mvcc",
        id: "l7",
        text: "Ko'p foydalanuvchili bazalarda tranzaksiyalar turli qatorlarni ko'rgani sababli, kaunt yulduzcha doim jadval hajmiga proporsionaldir."
      },
      {
        scene: "count_star_va_mvcc",
        id: "l8",
        text: "Shuning uchun katta jadvallarda aniq sanash o'rniga reltyupls kabi taxminiy ko'rsatkich yoki hisoblagich kesh ishlatiladi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

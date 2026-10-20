// SQL 41-bob 2-qism: "Kod" — Indeks qanday ishlaydi
(function (g) {
  g.NR = {
    title: "SQL Indeks Qanday Ishlaydi: Kod",
    scenes: [
      "seq_scan_vs_index_scan",
      "ustunga_amal_xatosi",
      "selektivlik_tajribasi",
      "yozish_narxi_va_statistika"
    ],
    sceneNames: {
      seq_scan_vs_index_scan: "Seq Scan vs Index Scan (PostgreSQL 18)",
      ustunga_amal_xatosi: "Ustunga Amal Qo'llash Xatosi",
      selektivlik_tajribasi: "Selektivlik: 2% Yangi vs 98% Yopilgan",
      yozish_narxi_va_statistika: "Indeks Hajmi, Yozish Narxi va Audit"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "seq_scan_vs_index_scan",
        id: "l1",
        text: "Yuz ming qatorli jadvalda mijoz_id bo'yicha qidirganda, indekssiz so'rov barcha sahifalarni o'qib chiqdi."
      },
      {
        scene: "seq_scan_vs_index_scan",
        id: "l2",
        text: "Bi-tri indeksi qo'shilgach, olti yuzdan ortiq sahifa o'rniga atigi o'n ikkita sahifa bilan natija topildi."
      },
      {
        scene: "ustunga_amal_xatosi",
        id: "l3",
        text: "Shartda mijoz_id plyus nol yoki matnga o'girish amali qo'llansa, indeks butunlay chetlab o'tiladi."
      },
      {
        scene: "ustunga_amal_xatosi",
        id: "l4",
        text: "Baza o'zgartirilgan ifodani tanimay, butun jadvalni to'liq skanerlash rejimiga qaytishga majbur bo'ladi."
      },
      {
        scene: "selektivlik_tajribasi",
        id: "l5",
        text: "Atigi ikki foiz qatordan iborat yangi buyurtmalarni hisoblashda indeks orqali to'g'ridan-to'g'ri o'qildi."
      },
      {
        scene: "selektivlik_tajribasi",
        id: "l6",
        text: "To'qson sakkiz foizlik yopilgan qatorlarda esa rejalashtiruvchi indeksdan voz kechib ketma-ket o'qishni tanladi."
      },
      {
        scene: "yozish_narxi_va_statistika",
        id: "l7",
        text: "Uchta indeks jadvalning o'zidan yetmish foiz ko'p joy oldi va yozish vaqtini ikki baravar sekinlashtirdi."
      },
      {
        scene: "yozish_narxi_va_statistika",
        id: "l8",
        text: "Statistika jadvali orqali skan soni nol bo'lgan foydasiz indekslarni osonlikcha aniqlash mumkin."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

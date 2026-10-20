// SQL 43-bob 2-qism: "Kod" — Maxsus indekslar
(function (g) {
  g.NR = {
    title: "SQL Maxsus Indekslar: Kod",
    scenes: [
      "lower_va_unique",
      "like_va_text_pattern_ops",
      "qisman_indeks_olchovi",
      "include_va_heap_fetches"
    ],
    sceneNames: {
      lower_va_unique: "Ifoda Indeksi va UNIQUE Cheklovi",
      like_va_text_pattern_ops: "LIKE va text_pattern_ops Tahlili",
      qisman_indeks_olchovi: "Qisman Indeks Hajmi va Rejalari",
      include_va_heap_fetches: "INCLUDE va VACUUM Heap Fetches"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "lower_va_unique",
        id: "l1",
        text: "Lover ifodasi indeksi qo'shilgach, katta-kichik harfli emaillarni qidirish to'liq indeks skanga o'tdi."
      },
      {
        scene: "lower_va_unique",
        id: "l2",
        text: "Yunik ifoda indeksi esa harflari katta qilib kiritilgan bir xil pochtani darhol bloklab xatolik berdi."
      },
      {
        scene: "like_va_text_pattern_ops",
        id: "l3",
        text: "Oddiy indeks layk prefiksiga yaramadi, tekst pattern ops esa belgima-belgi oraliq hosil qildi."
      },
      {
        scene: "like_va_text_pattern_ops",
        id: "l4",
        text: "So'rov sharti katta yoki teng va qat'iy kichik belgilariga aylanib, qidiruv soniyaning ulushida yakunlandi."
      },
      {
        scene: "qisman_indeks_olchovi",
        id: "l5",
        text: "Atigi bir foizlik yangi holat uchun qurilgan qisman indeks to'liq indeksdan yigirma bir baravar kichik bo'ldi."
      },
      {
        scene: "qisman_indeks_olchovi",
        id: "l6",
        text: "Yangi holatli so'rovlar bevosita indeksdan o'qildi, faol qatorlarda esa baza asosiy kalitga murojaat qildi."
      },
      {
        scene: "include_va_heap_fetches",
        id: "l7",
        text: "Inklud orqali ism ustuni yuklanganda indeks onli skan ishga tushdi, ammo boshida yuz bitta hip fech bo'ldi."
      },
      {
        scene: "include_va_heap_fetches",
        id: "l8",
        text: "Vakuum buyrug'i ko'rinuvchanlik xaritasini tozalagach, hip fechlar soni nolga tushib mutlaq tezlikka erishildi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

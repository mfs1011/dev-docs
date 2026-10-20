// SQL 44-bob 2-qism: "Kod" — Amaliyot va EXPLAIN tahlili
(function (g) {
  g.NR = {
    title: "SQL Indeks Turlari: Kod va EXPLAIN",
    scenes: [
      "hash_sinovi",
      "gin_va_gist_sinovi",
      "spgist_knn_sinovi",
      "brin_lossy_sinovi"
    ],
    sceneNames: {
      hash_sinovi: "Hash Indeksi: Tenglik va Oraliq Sinovi",
      gin_va_gist_sinovi: "GIN va GiST: Massiv va Range",
      spgist_knn_sinovi: "SP-GiST: Eng Yaqin Qo'shni (KNN)",
      brin_lossy_sinovi: "BRIN: Lossy Bloklar va Hajm Rekordi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "hash_sinovi",
        id: "l1",
        text: "Ikki yuz ming qatorli jadvalda kod ustuniga qurilgan Hash indeksini ekspleyn orqali sinab ko'ramiz."
      },
      {
        scene: "hash_sinovi",
        id: "l2",
        text: "Tenglik so'rovi hesh indeks skan bilan darhol topildi, ammo oraliq so'rovida baza to'liq sek skanga tushib ketdi."
      },
      {
        scene: "gin_va_gist_sinovi",
        id: "l3",
        text: "Teglar massivida uch va besh borligini qidirishda GIN indeksi bitmap indeks skan bilan aniq qatorlarni saraladi."
      },
      {
        scene: "gin_va_gist_sinovi",
        id: "l4",
        text: "Davr ustunida esa ikki vaqt oralig'i kesishuvini GiST indeksi ajoyib tezlikda filtrlashga muvaffaq bo'ldi."
      },
      {
        scene: "spgist_knn_sinovi",
        id: "l5",
        text: "Fazoviy nuqtalarda eng yaqin uchta koordinatani topish uchun SP-GiST va masofa operatori ishlatildi."
      },
      {
        scene: "spgist_knn_sinovi",
        id: "l6",
        text: "Jadvaldagi barcha qatorlarni saralamasdan, indeksning o'zi eng yaqin uch nuqtani tartiblab chiqarib berdi."
      },
      {
        scene: "brin_lossy_sinovi",
        id: "l7",
        text: "Nihoyat, vaqt bo'yicha BRIN indeksi yuz yigirma sakkizta fizik blokni o'qib, o'nlab megabaytli skanni tejab qoldi."
      },
      {
        scene: "brin_lossy_sinovi",
        id: "l8",
        text: "Atigi yigirma to'rt kilobaytli indeks bilan minglab qatorlar ichidan natijalar soniyalarda xulosalandi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

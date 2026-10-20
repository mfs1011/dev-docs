// SQL 41-bob 1-qism: "Tushuncha" — Indeks qanday ishlaydi
(function (g) {
  g.NR = {
    title: "SQL Indeks Qanday Ishlaydi: Tushuncha",
    scenes: [
      "indekssiz_vs_indeks",
      "b_tree_tuzilishi",
      "qoplovchi_indeks",
      "selektivlik_va_rejalashtiruvchi",
      "indeks_narxi"
    ],
    sceneNames: {
      indekssiz_vs_indeks: "Indekssiz Qidiruv va Ko'rsatkich",
      b_tree_tuzilishi: "B-Tree Daraxti va Tartiblanganlik",
      qoplovchi_indeks: "Qoplovchi Indeks (Covering Index)",
      selektivlik_va_rejalashtiruvchi: "Selektivlik va Rejalashtiruvchi",
      indeks_narxi: "Indeksning Xotira va Yozish Narxi"
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
        scene: "indekssiz_vs_indeks",
        id: "l1",
        text: "Indekssiz qidiruvda ma'lumotlar bazasi butun jadval qatorlarini boshidan oxirigacha ketma-ket tekshirib chiqadi."
      },
      {
        scene: "indekssiz_vs_indeks",
        id: "l2",
        text: "Indeks esa kitob oxiridagi alifbo ko'rsatkichiga o'xshab, kerakli sahifani to'g'ridan-to'g'ri topish imkonini beradi."
      },
      {
        scene: "b_tree_tuzilishi",
        id: "l3",
        text: "Standart bi-tri indeksi tartiblangan daraxt bo'lib, millionlab qatorlar orasida qidiruvni keskin tezlashtiradi."
      },
      {
        scene: "b_tree_tuzilishi",
        id: "l4",
        text: "Tartiblangan tuzilma nafaqat tenglik, balki oraliq shartlar, saralash hamda minimum va maksimum uchun ham xizmat qiladi."
      },
      {
        scene: "qoplovchi_indeks",
        id: "l5",
        text: "Agar so'rovga kerakli barcha ustunlar indeksning o'zida mavjud bo'lsa, jadvalga murojaat qilish umuman talab etilmaydi."
      },
      {
        scene: "qoplovchi_indeks",
        id: "l6",
        text: "Bunday qoplovchi indeks orqali so'rovlar eng yuqori unumdorlik va minimal xotira yuki bilan bajariladi."
      },
      {
        scene: "selektivlik_va_rejalashtiruvchi",
        id: "l7",
        text: "Rejalashtiruvchi har bir so'rov uchun statistikani tahlil qilib, indeks yoki ketma-ket o'qishni o'zi tanlaydi."
      },
      {
        scene: "selektivlik_va_rejalashtiruvchi",
        id: "l8",
        text: "Agar so'rov jadvalning katta qismini o'qishi kerak bo'lsa, to'liq skanerlash indeks orqali sakrashdan ko'ra tezroq bo'ladi."
      },
      {
        scene: "indeks_narxi",
        id: "l9",
        text: "Har bir yangi indeks ma'lumot qo'shish, yangilash va o'chirish amallarini sekinlashtiradi hamda disk hajmini oshiradi."
      },
      {
        scene: "indeks_narxi",
        id: "l10",
        text: "Shuning uchun har bir ustunga indeks qo'ymasdan, real so'rovlarga qarab foydasizlarini o'chirib borish zarur."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

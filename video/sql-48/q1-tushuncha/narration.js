// SQL 48-bob 1-qism: "Tushuncha" — Sahifalash
(function (g) {
  g.NR = {
    title: "SQL Sahifalash: Tushuncha",
    scenes: [
      "offset_va_uning_narxi",
      "yagona_tartib_va_kompozit_kalit",
      "keyset_sahifalash_mexanizmi",
      "offset_va_drift_muammosi"
    ],
    sceneNames: {
      offset_va_uning_narxi: "OFFSET Nega Katta Hajmda Sekin?",
      yagona_tartib_va_kompozit_kalit: "Yagona Tartib: ORDER BY sana, id",
      keyset_sahifalash_mexanizmi: "Keyset (Kursor) Sahifalash Usuli",
      offset_va_drift_muammosi: "O'zgaruvchan Ma'lumot va Sahifa Surilishi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "offset_va_uning_narxi",
        id: "l1",
        text: "Katta hajmdagi ma'lumotlarni qismlarga bo'lib ko'rsatishda ofset va limit eng ko'p ishlatiladigan usuldir."
      },
      {
        scene: "offset_va_uning_narxi",
        id: "l2",
        text: "Biroq ofset chuqurlashgan sari server barcha o'tkazib yuborilgan qatorlarni ham o'qib chiqishga majbur bo'ladi."
      },
      {
        scene: "yagona_tartib_va_kompozit_kalit",
        id: "l3",
        text: "Tartiblashda vaqt bir xil bo'lgan qatorlar uchrasa, natija tartibi buzilmasligi uchun ay-di kabi yagona ustun qo'shiladi."
      },
      {
        scene: "yagona_tartib_va_kompozit_kalit",
        id: "l4",
        text: "Aynan sana va ay-di kompozit kaliti qator konstruktori orqali aniq leksikografik ketma-ketlikni ta'minlaydi."
      },
      {
        scene: "keyset_sahifalash_mexanizmi",
        id: "l5",
        text: "Keyset sahifalash usulida sahifa raqami emas, balki oldingi sahifaning oxirgi qatori eslab qolinadi."
      },
      {
        scene: "keyset_sahifalash_mexanizmi",
        id: "l6",
        text: "B-tri indeksi to'g'ridan-to'g'ri o'sha nuqtaga sakrab, to'qsoninchi ming sahifada ham bir zumda yigirmata qatorni o'qiydi."
      },
      {
        scene: "offset_va_drift_muammosi",
        id: "l7",
        text: "Yangi yozuvlar qo'shilganda ofset qatorlarni surib yuborib dublikat keltirsa, keyset barqaror qiymat bo'yicha ishlaydi."
      },
      {
        scene: "offset_va_drift_muammosi",
        id: "l8",
        text: "Shuning uchun zamonaviy cheksiz lentalar va API'larda ofset o'rniga kursorli keyset sahifalash tavsiya etiladi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

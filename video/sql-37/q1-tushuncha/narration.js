// SQL 37-bob 1-qism: "Tushuncha" — Aloqalar va tashqi kalitlar
(function (g) {
  g.NR = {
    title: "SQL Aloqalar va Tashqi Kalitlar: Tushuncha",
    scenes: [
      "kirish",
      "aloqa_turlari",
      "on_delete_siyosati",
      "indekslash_va_chap_ustun",
      "kompozit_va_xulosa"
    ],
    sceneNames: {
      kirish: "Aloqalar va Tashqi Kalitlar: Kirish",
      aloqa_turlari: "1:N, 1:1 va M:N Aloqalari",
      on_delete_siyosati: "ON DELETE Siyosatini Tanlash",
      indekslash_va_chap_ustun: "Tashqi Kalitlarni Indekslash",
      kompozit_va_xulosa: "Kompozit Kalitlar va Xulosa"
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
        scene: "kirish",
        id: "l1",
        text: "Tashqi kalitlar jadvallar o'rtasidagi munosabatlarni mustahkamlab, ma'lumotlar yaxlitligini kafolatlaydi."
      },
      {
        scene: "kirish",
        id: "l2",
        text: "Ular mavjud bo'lmagan ota yozuvga bog'lanish va yetim qatorlar paydo bo'lishining oldini oladi."
      },
      {
        scene: "aloqa_turlari",
        id: "l3",
        text: "Birga-ko'p aloqada tashqi kalit ko'p tomonga qo'yilsa, birga-bir aloqada unga unikal cheklov qo'shiladi."
      },
      {
        scene: "aloqa_turlari",
        id: "l4",
        text: "Ko'pga-ko'p munosabat esa alohida oraliq jadval va ikkita tashqi kalit orqali loyihalanadi."
      },
      {
        scene: "on_delete_siyosati",
        id: "l5",
        text: "Ota yozuv o'chirilganda bola qator uning ajralmas qismi bo'lsa kaskad, mustaqil bo'lsa taqiq amali tanlanadi."
      },
      {
        scene: "on_delete_siyosati",
        id: "l6",
        text: "Masalan, buyurtma o'chsa uning qatorlari o'chadi, ammo mahsulotni o'chirish tarixni saqlash uchun taqiqlanadi."
      },
      {
        scene: "indekslash_va_chap_ustun",
        id: "l7",
        text: "Postgresda bola tomondagi tashqi kalit ustunlariga indeks avtomatik ravishda yaratilmaydi."
      },
      {
        scene: "indekslash_va_chap_ustun",
        id: "l8",
        text: "Oraliq jadvalda ham ikkinchi kalit uchun alohida indeks qo'yish o'chirish tezligini keskin oshiradi."
      },
      {
        scene: "kompozit_va_xulosa",
        id: "l9",
        text: "Oraliq jadval nafaqat bog'laydi, balki sotilgan paytdagi narx kabi o'ziga xos atributlarni ham saqlaydi."
      },
      {
        scene: "kompozit_va_xulosa",
        id: "l10",
        text: "To'g'ri loyihalangan aloqalar butun arxitekturaning barqaror va xatosiz ishlashiga poydevor bo'ladi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

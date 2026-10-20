// SQL 38-bob 2-qism: "Kod" — Normalizatsiya va tuzilma amaliyoti
(function (g) {
  g.NR = {
    title: "SQL Normalizatsiya va Tuzilma: Kod",
    scenes: [
      "tekis_jadval_va_anomaliyalar",
      "normallashgan_sxema_va_insert",
      "xavfsiz_yangilash_va_ochirish",
      "join_sorovi_va_natija",
      "denormalizatsiya_va_tafovut"
    ],
    sceneNames: {
      tekis_jadval_va_anomaliyalar: "Tekis Jadval va Anomaliyalar Sinovi",
      normallashgan_sxema_va_insert: "Normallashgan Sxema va Jadvallar",
      xavfsiz_yangilash_va_ochirish: "Xavfsiz Yangilash va O'chirish",
      join_sorovi_va_natija: "To'rt Jadvalni Birlashtirish (JOIN)",
      denormalizatsiya_va_tafovut: "Yig'ma Jadval va Tafovut Sinovi"
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
        scene: "tekis_jadval_va_anomaliyalar",
        id: "l1",
        text: "Dastlab barcha ma'lumotlarni bitta tekis jadvalga yozib, yangilash va o'chirish anomaliyalarini sinab ko'ramiz."
      },
      {
        scene: "tekis_jadval_va_anomaliyalar",
        id: "l2",
        text: "Ali yangi manzilga ko'chganda bazada ikki xil manzil paydo bo'ldi, Vali buyurtmasi o'chganda esa mijoz yo'qoldi."
      },
      {
        scene: "normallashgan_sxema_va_insert",
        id: "l3",
        text: "Endi tizimni to'rtta alohida jadvalga bo'lamiz: mijozlar, mahsulotlar, buyurtmalar va buyurtma qatorlari."
      },
      {
        scene: "normallashgan_sxema_va_insert",
        id: "l4",
        text: "Oraliq jadvalda sotilgan paytdagi narx alohida ustun sifatida saqlanib, tarixiy aniqlikni kafolatlaydi."
      },
      {
        scene: "xavfsiz_yangilash_va_ochirish",
        id: "l5",
        text: "Mijozlar jadvalida manzil yangilansa, u bir joyda o'zgaradi va barcha buyurtmalarda avtomatik ko'rinadi."
      },
      {
        scene: "xavfsiz_yangilash_va_ochirish",
        id: "l6",
        text: "Buyurtma bekor qilinib o'chirilsa ham, mijozning o'zi va uning aloqa ma'lumotlari bazada butun saqlanadi."
      },
      {
        scene: "join_sorovi_va_natija",
        id: "l7",
        text: "To'rtta jadvalni join operatori orqali birlashtirib, barcha buyurtmalar va mijozlarni bitta so'rovda olamiz."
      },
      {
        scene: "join_sorovi_va_natija",
        id: "l8",
        text: "Postgres bu birlashtirishni indekslar orqali o'ta tez va xotirani ortiqcha band qilmasdan bajaradi."
      },
      {
        scene: "denormalizatsiya_va_tafovut",
        id: "l9",
        text: "Hisobotni tezlashtirish uchun yig'ma jadval qilsak, yangi buyurtma kiritilganda ma'lumotlarda tafovut yuzaga keladi."
      },
      {
        scene: "denormalizatsiya_va_tafovut",
        id: "l10",
        text: "Shuning uchun denormalizatsiyani faqat o'lchangan ehtiyoj bo'lganda va yangilash mexanizmi bilan qo'llash shart."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

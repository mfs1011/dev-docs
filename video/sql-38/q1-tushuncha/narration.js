// SQL 38-bob 1-qism: "Tushuncha" — Normalizatsiya va tuzilma asoslari
(function (g) {
  g.NR = {
    title: "SQL Normalizatsiya va Tuzilma: Tushuncha",
    scenes: [
      "kirish",
      "anomaliyalar",
      "normallashgan_model",
      "massiv_va_json_tuzogi",
      "denormalizatsiya_va_xulosa"
    ],
    sceneNames: {
      kirish: "Normalizatsiya Tushunchasi va Maqsadi",
      anomaliyalar: "Tekis Jadval va Ma'lumot Anomaliyalari",
      normallashgan_model: "Normallashgan Model va Relyatsion Tuzilma",
      massiv_va_json_tuzogi: "Jadval, Massiv va JSON Tanlovi",
      denormalizatsiya_va_xulosa: "Denormalizatsiya Narxi va Xulosa"
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
        text: "Normalizatsiya — ma'lumotlarni takrorlanmaydigan qilib alohida mantiqiy jadvallarga taqsimlash jarayonidir."
      },
      {
        scene: "kirish",
        id: "l2",
        text: "Uning asosiy qoidasi: har bir mustaqil fakt ma'lumotlar bazasida aynan bir joyda saqlanishi kerak."
      },
      {
        scene: "anomaliyalar",
        id: "l3",
        text: "Barcha ustunlarni bitta tekis jadvalga yig'ish yangilash va o'chirish anomaliyalarini keltirib chiqaradi."
      },
      {
        scene: "anomaliyalar",
        id: "l4",
        text: "Mijoz ko'chganda manzil ikkita bo'lib qolishi yoki buyurtma bekor bo'lganda mijozning o'zi ham yo'qolishi mumkin."
      },
      {
        scene: "normallashgan_model",
        id: "l5",
        text: "To'g'ri modelda mijoz, mahsulot va buyurtmalar alohida jadvallarga ajratilib, faqat ID lar orqali bog'lanadi."
      },
      {
        scene: "normallashgan_model",
        id: "l6",
        text: "Bu yondashuv so'rovlarda join qilishni talab qilsa-da, ma'lumotlarning mutlaq yaxlitligi va sofligini kafolatlaydi."
      },
      {
        scene: "massiv_va_json_tuzogi",
        id: "l7",
        text: "Teglar va kategoriyalarni massiv yoki JSON da saqlab, ular bo'yicha qidirish noto'g'ri loyihalash belgisidir."
      },
      {
        scene: "massiv_va_json_tuzogi",
        id: "l8",
        text: "Agar element bo'yicha filtrlash yoki unga tashqi kalit bog'lash kerak bo'lsa, doimo alohida jadval quring."
      },
      {
        scene: "denormalizatsiya_va_xulosa",
        id: "l9",
        text: "Denormalizatsiya va yig'ma jadvallar faqat o'lchab ko'rilgan tezlik muammosini hal qilish uchun qo'llaniladi."
      },
      {
        scene: "denormalizatsiya_va_xulosa",
        id: "l10",
        text: "Loyiha boshida esa doimo uchinchi normal shaklga asoslangan toza relyatsion arxitektura tanlanishi shart."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

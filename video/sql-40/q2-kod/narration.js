// SQL 40-bob 2-qism: "Kod" — Vaqt, tarix va audit
(function (g) {
  g.NR = {
    title: "SQL Vaqt, Tarix va Audit: Kod",
    scenes: [
      "temporal_narxlar",
      "period_aksiyalar",
      "audit_jadvali_va_trigger",
      "yumshoq_ochirish_qisman"
    ],
    sceneNames: {
      temporal_narxlar: "PostgreSQL 18: WITHOUT OVERLAPS",
      period_aksiyalar: "PERIOD Tashqi Kalit Sinovi",
      audit_jadvali_va_trigger: "Universal Audit Triggeri va Jadvali",
      yumshoq_ochirish_qisman: "Yumshoq O'chirish va Qisman Indeks"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "temporal_narxlar",
        id: "l1",
        text: "Postgres o'n sakkizda mahsulot narxlari jadvaliga WITHOUT OVERLAPS birlamchi kalitini o'rnatamiz."
      },
      {
        scene: "temporal_narxlar",
        id: "l2",
        text: "Bitta mahsulotga kesishuvchi oraliq kiritilganda eksklyud cheklovi xatolik berib uni rad etadi."
      },
      {
        scene: "period_aksiyalar",
        id: "l3",
        text: "Aksiyalar jadvaliga PERIOD kaliti orqali narxlar davriga bog'langan tashqi kalit qo'yamiz."
      },
      {
        scene: "period_aksiyalar",
        id: "l4",
        text: "Aksiya muddati ota narx davrlari bilan to'liq qoplanmagan holatda cheklov buziladi."
      },
      {
        scene: "audit_jadvali_va_trigger",
        id: "l5",
        text: "Xodimlar jadvali uchun amallarni to'liq qayd etuvchi universal audit triggerini yaratamiz."
      },
      {
        scene: "audit_jadvali_va_trigger",
        id: "l6",
        text: "Har bir yangilash yoki o'chirish amali kim tomonidan va qachon bajarilgani bilan auditga yoziladi."
      },
      {
        scene: "yumshoq_ochirish_qisman",
        id: "l7",
        text: "Foydalanuvchilar jadvalida ochirilgan ustuni orqali yumshoq o'chirish mexanizmini ko'ramiz."
      },
      {
        scene: "yumshoq_ochirish_qisman",
        id: "l8",
        text: "Faqat faol yozuvlarni tekshiruvchi qisman indeks o'chirilgan emailni qayta ro'yxatdan o'tkazishga ruxsat beradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

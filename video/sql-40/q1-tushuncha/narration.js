// SQL 40-bob 1-qism: "Tushuncha" — Vaqt, tarix va audit
(function (g) {
  g.NR = {
    title: "SQL Vaqt, Tarix va Audit: Tushuncha",
    scenes: [
      "vaqtga_bogliq_malumot",
      "temporal_kalitlar",
      "period_tashqi_kalit",
      "audit_va_tarix",
      "yumshoq_ochirish"
    ],
    sceneNames: {
      vaqtga_bogliq_malumot: "Vaqtga Bog'liq Ma'lumotlar",
      temporal_kalitlar: "Temporal Kalitlar: WITHOUT OVERLAPS",
      period_tashqi_kalit: "Temporal Tashqi Kalit: PERIOD",
      audit_va_tarix: "Audit Ustunlari va Tarix Jadvali",
      yumshoq_ochirish: "Yumshoq O'chirish va Qisman Indeks"
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
        scene: "vaqtga_bogliq_malumot",
        id: "l1",
        text: "Ko'plab ma'lumotlar vaqtga bog'liq bo'lib, narxlar, xodim maoshlari va statuslar doimiy o'zgarib turadi."
      },
      {
        scene: "vaqtga_bogliq_malumot",
        id: "l2",
        text: "Eski ma'lumotlarni shunchaki almashtirib yuborish o'tmishdagi buyurtmalar va moliyaviy hisobotlarni buzadi."
      },
      {
        scene: "temporal_kalitlar",
        id: "l3",
        text: "Postgres o'n sakkizdagi WITHOUT OVERLAPS kaliti vaqt oralig'ining kesishmasligini baza darajasida kafolatlaydi."
      },
      {
        scene: "temporal_kalitlar",
        id: "l4",
        text: "Bu cheklov tenglik o'rniga oraliqlar kesishuvini tekshiruvchi eksklyud mexanizmi orqali ishlaydi."
      },
      {
        scene: "period_tashqi_kalit",
        id: "l5",
        text: "PERIOD tashqi kaliti esa bola yozuv davrining ota jadvaldagi davrlar bilan to'liq qoplanishini talab qiladi."
      },
      {
        scene: "period_tashqi_kalit",
        id: "l6",
        text: "Masalan, mahsulot aksiyasi faqat uning narxi rasman belgilangan muddat ichidagina o'rinli bo'ladi."
      },
      {
        scene: "audit_va_tarix",
        id: "l7",
        text: "Audit jadvali tizimdagi har bir qo'shish, o'zgartirish va o'chirish amallarini to'liq saqlab boradi."
      },
      {
        scene: "audit_va_tarix",
        id: "l8",
        text: "Trigger yordamida o'zgarishdan oldingi va keyingi qatorlar, amal vaqti hamda foydalanuvchi qayd etiladi."
      },
      {
        scene: "yumshoq_ochirish",
        id: "l9",
        text: "Yumshoq o'chirishda qator bazada saqlanadi, ammo o'chirilgan vaqti bilan belgilanadi."
      },
      {
        scene: "yumshoq_ochirish",
        id: "l10",
        text: "Qisman unikal indeks esa faqat faol foydalanuvchilar o'rtasida takrorlanmaslikni ta'minlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

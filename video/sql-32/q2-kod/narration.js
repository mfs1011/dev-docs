// SQL 32-bob 2-qism: Kod — Shartli ifodalar amalda
globalThis.NR = {
  scenes: ['kirish', 'null_va_tiplar', 'coalesce_amalda', 'nullif_amalda', 'greatest_least_amalda'],
  sceneNames: {
    kirish: "Kod: Jadval va CASE Bilan Toifalash",
    null_va_tiplar: "CASE da NULL va Natija Tiplari",
    coalesce_amalda: "COALESCE: Matnlar va Yakuniy Narx",
    nullif_amalda: "NULLIF: Bo'sh Satr va Nolga Bo'lish",
    greatest_least_amalda: "GREATEST va LEAST: Qator Solishtiruvi",
  },
  hold: {
    intro: 0.8,
    null_tiplar: 1.2,
    coalesce: 1.2,
    nullif: 1.2,
    greatest: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "Narxlar jadvalidagi mahsulotlarni CASE ifodasi yordamida narxiga qarab qimmat, o'rta, arzon va tekin toifalariga ajratamiz.",
    },
    {
      id: "null_tiplar",
      scene: "null_va_tiplar",
      text: "Shartda chegirma barobar NULL deb yozilsa mantiq buziladi, faqat IS NULL to'g'ri ishlaydi, hamda barcha natija tiplari mos bo'lishi shart.",
    },
    {
      id: "coalesce",
      scene: "coalesce_amalda",
      text: "COALESCE orqali birinchi to'la tavsifni tanlaymiz va chegirma yo'q bo'lsa noldan ayirib, narxning NULL ga aylanishini to'xtatamiz.",
    },
    {
      id: "nullif",
      scene: "nullif_amalda",
      text: "NULLIF yordamida bo'sh satrni haqiqiy NULL ga o'giramiz va nolga bo'lish xatosini xavfsiz tarzda NULL natijaga aylantiramiz.",
    },
    {
      id: "greatest",
      scene: "greatest_least_amalda",
      text: "GREATEST va LEAST bitta qatordagi joriy va eski narxni solishtirib, chegirmasiz eng katta yoki eng kichik narxni qaytaradi.",
    },
  ],
};

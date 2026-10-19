// SQL 31-bob 1-qism: Tushuncha — Window funksiyalar
globalThis.NR = {
  scenes: ['kirish', 'over_bandi_va_partition', 'frame_tushunchasi', 'reyting_funksiyalari', 'siljish_va_qiymatlar', 'bajarilish_tartibi'],
  sceneNames: {
    kirish: "31-bob: Window Funksiyalar Tushunchasi",
    over_bandi_va_partition: "OVER Bandi va PARTITION BY Bo'laklari",
    frame_tushunchasi: "Frame: Oyna Ramkasi va Sukut Qoidasi",
    reyting_funksiyalari: "Reyting: row_number, rank va dense_rank",
    siljish_va_qiymatlar: "Siljish: lag, lead, first_value va last_value",
    bajarilish_tartibi: "Bajarilish Ketma-ketligi va WHERE Cheklovi",
  },
  hold: {
    intro: 0.8,
    over: 1.2,
    frame: 1.2,
    reyting: 1.2,
    siljish: 1.2,
    tartib: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "Window funksiyalar agregatlarga o'xshaydi, ammo eng muhim farqi: qatorlar bitta qatorga guruhlanmaydi, balki har bir qator natijada saqlanib qoladi.",
    },
    {
      id: "over",
      scene: "over_bandi_va_partition",
      text: "Funksiyani oyna rejimiga o'tkazuvchi kalit OVER bandidir: PARTITION BY qatorlarni bo'laklarga ajratsa, ORDER BY har bir bo'lak ichida tartibni belgilaydi.",
    },
    {
      id: "frame",
      scene: "frame_tushunchasi",
      text: "Frame joriy qator atrofidagi ko'rish chegarasi bo'lib, sukut bo'yicha bo'lak boshidan joriy qatorgacha o'sib boruvchi yig'indini hisoblaydi.",
    },
    {
      id: "reyting",
      scene: "reyting_funksiyalari",
      text: "Tartib raqami uchun row_number, tenglikda oraliq qoldiruvchi rank va oraliqsiz davom etuvchi dense_rank funksiyalari keng qo'llaniladi.",
    },
    {
      id: "siljish",
      scene: "siljish_va_qiymatlar",
      text: "Oldingi va keyingi qator qiymatlarini lag va lead bilan olamiz, first_value va last_value esa butun oyna chegarasidagi chekka qiymatlarni topadi.",
    },
    {
      id: "tartib",
      scene: "bajarilish_tartibi",
      text: "Window funksiyalar WHERE va GROUP BY dan keyin bajariladi, shu sababli ularni to'g'ridan-to'g'ri WHERE ichida filtrlash taqiqlangan.",
    },
  ],
};

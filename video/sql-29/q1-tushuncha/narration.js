// SQL 29-bob 1-qism: Tushuncha — CTE (Common Table Expression)
globalThis.NR = {
  scenes: ['kirish', 'afzalliklari', 'qoidalar', 'materializatsiya', 'ozgartiruvchi_cte'],
  sceneNames: {
    kirish: "CTE Tushunchasi va Maqsadi",
    afzalliklari: "CTE va Hosila Jadval Farqi",
    qoidalar: "Sintaksis va Murojaat Qoidalari",
    materializatsiya: "Materializatsiya Mexanizmi",
    ozgartiruvchi_cte: "Ma'lumotni O'zgartiruvchi CTE",
  },
  hold: {
    intro: 0.8,
    afzallik: 1.0,
    qoidalar: 1.0,
    ustunlar: 0.8,
    materializatsiya: 1.2,
    ozgartiruvchi: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "CTE — so'rov boshida WITH kalit so'zi bilan e'lon qilinadigan nomli vaqtinchalik natijadir. U murakkab so'rovlarni sodda bo'laklarga ajratish uchun xizmat qiladi.",
    },
    {
      id: "afzallik",
      scene: "afzalliklari",
      text: "Hosila jadvaldan farqli o'laroq, bitta CTE ga bir nechta joyda qayta murojaat qilish mumkin va bir CTE o'zidan oldingisiga bemalol tayanadi.",
    },
    {
      id: "qoidalar",
      scene: "qoidalar",
      text: "Asosiy qoidalar: bitta WITH ichida barcha CTE lar vergul bilan ajratiladi, ikkinchi WITH yozish xato hisoblanadi va CTE faqat o'zidan oldingisini ko'ra oladi.",
    },
    {
      id: "ustunlar",
      scene: "qoidalar",
      text: "Natija ustunlarining nomlarini CTE nomidan keyin qavsda aniq ko'rsatish orqali kodni yanada ixcham qilish mumkin.",
    },
    {
      id: "materializatsiya",
      scene: "materializatsiya",
      text: "Materializatsiya orqali natija vaqtinchalik xotiraga yoziladi yoki aksincha, NOT MATERIALIZED orqali tashqi so'rovga qo'shib yuboriladi.",
    },
    {
      id: "ozgartiruvchi",
      scene: "ozgartiruvchi_cte",
      text: "PostgreSQL da CTE ichida DELETE yoki UPDATE amallarini RETURNING bilan ishlatib, bitta tranzaksiyada qatorlarni arxivga ko'chirish mumkin.",
    },
  ],
};

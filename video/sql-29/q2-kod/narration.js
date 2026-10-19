// SQL 29-bob 2-qism: Kod — PostgreSQL 18 da CTE amaliyoti
globalThis.NR = {
  scenes: ['kirish', 'zanjirli_cte', 'ustun_nomlari', 'sintaksis_xatolari', 'materializatsiya_explain', 'qatorlarni_kochiruvchi_cte'],
  sceneNames: {
    kirish: "PostgreSQL 18: Sinov Jadvallari",
    zanjirli_cte: "Zanjirli va Ko'p Murojaatli CTE",
    ustun_nomlari: "Ustun Nomlarini Aniq Belgilash",
    sintaksis_xatolari: "Ikki WITH va Oldinga Murojaat Xatolari",
    materializatsiya_explain: "EXPLAIN: MATERIALIZED vs Inline Rejasi",
    qatorlarni_kochiruvchi_cte: "DELETE + RETURNING: Bitta Tranzaksiyada Ko'chirish",
  },
  hold: {
    intro: 0.8,
    zanjir: 1.2,
    ustunlar: 1.0,
    xatolar: 1.2,
    explain: 1.2,
    kochiruvchi: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "PostgreSQL 18 da CTE imkoniyatlarini sinab ko'ramiz. Bazamizda guruhlar, baholar va arxiv jadvallari mavjud.",
    },
    {
      id: "zanjir",
      scene: "zanjirli_cte",
      text: "Zanjirli CTE orqali eng yuqori o'rtacha ballga ega B guruhining talabalari: Vali va Dilnozani osongina ajratib oldik.",
    },
    {
      id: "ustunlar",
      scene: "ustun_nomlari",
      text: "CTE nomidan so'ng qavsda guruh va soni kabi yangi ustun nomlarini berib, so'rovni yanada tushunarli qildik.",
    },
    {
      id: "xatolar",
      scene: "sintaksis_xatolari",
      text: "Qoidalarni buzsak, PostgreSQL darhol xato beradi: ketma-ket ikkita WITH yozish ham, hali e'lon qilinmagan CTE ga oldindan murojaat qilish ham taqiqlangan.",
    },
    {
      id: "explain",
      scene: "materializatsiya_explain",
      text: "EXPLAIN rejasida ko'rinadiki, oddiy CTE indeksdan to'g'ridan-to'g'ri foydalanadi, MATERIALIZED esa avval butun jadvalni to'liq o'qiydi.",
    },
    {
      id: "kochiruvchi",
      scene: "qatorlarni_kochiruvchi_cte",
      text: "Eng ajoyib imkoniyat: DELETE amalini RETURNING bilan CTE ichida bajarib, o'chirilgan qatorlarni bitta operatorda arxiv jadvaliga ko'chirdik.",
    },
  ],
};

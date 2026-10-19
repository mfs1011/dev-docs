// SQL 30-bob 2-qism: Kod — PostgreSQL 18 da Rekursiv CTE amaliyoti
globalThis.NR = {
  scenes: ['kirish', 'sonlar_ketma_ketligi', 'daraxt_va_darajalar', 'daraxt_yoli_va_chuqurlik', 'search_va_cycle', 'sintaksis_cheklovlari'],
  sceneNames: {
    kirish: "PostgreSQL 18: Sinov Jadvallari",
    sonlar_ketma_ketligi: "Sonlar Ketma-ketligi va Yig'indi (5050)",
    daraxt_va_darajalar: "Tashkilot Ierarxiyasi va Darajalar",
    daraxt_yoli_va_chuqurlik: "Daraxt Yo'li va Vizual Indentatsiya",
    search_va_cycle: "PostgreSQL: SEARCH va CYCLE Qulayliklari",
    sintaksis_cheklovlari: "Rekursiv Qismdagi Qat'iy Cheklovlar",
  },
  hold: {
    intro: 0.8,
    sonlar: 1.2,
    daraja: 1.2,
    yol: 1.2,
    cycle: 1.2,
    cheklov: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "PostgreSQL 18 da rekursiv CTE amaliyotini boshlaymiz: bazamizda xodimlar ierarxiyasi va aylanali yo'llar grafigi mavjud.",
    },
    {
      id: "sonlar",
      scene: "sonlar_ketma_ketligi",
      text: "Boshlanishiga birdan yuzgacha bo'lgan sonlar ketma-ketligini hosil qilib, ularning yig'indisi besh ming ellik ekanini bir zumda hisobladik.",
    },
    {
      id: "daraja",
      scene: "daraxt_va_darajalar",
      text: "Xodimlar jadvalida Alisadan boshlab har bir bo'ysunuvchining tashkilotdagi darajasini rekursiv ravishda osongina aniqladik.",
    },
    {
      id: "yol",
      scene: "daraxt_yoli_va_chuqurlik",
      text: "Yo'l ustunini qo'shib, satrli indentatsiya yordamida butun korxona tuzilmasini chuqurlik bo'yicha chiroyli daraxt shaklida chiqardik.",
    },
    {
      id: "cycle",
      scene: "search_va_cycle",
      text: "PostgreSQL ning ajoyib yangiliklari: SEARCH tartibni avtomatik boshqaradi, CYCLE esa aylanali grafda cheksiz siklni bir zumda to'xtatadi.",
    },
    {
      id: "cheklov",
      scene: "sintaksis_cheklovlari",
      text: "Unutmang: rekursiv qism ichida agregat funksiyalar, hamda PostgreSQL da LIMIT yoki ORDER BY yozish qat'iyan taqiqlangan.",
    },
  ],
};

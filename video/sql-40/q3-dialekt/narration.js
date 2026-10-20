// SQL 40-bob 3-qism: "Dialektlar" — Vaqt, tarix va audit
(function (g) {
  g.NR = {
    title: "SQL Vaqt, Tarix va Audit: Dialektlar",
    scenes: [
      "dialektlar_jadvali",
      "yangilanish_mexanizmi",
      "eng_katta_xatolar",
      "oltin_tavsiyalar"
    ],
    sceneNames: {
      dialektlar_jadvali: "Dialektlar Imkoniyatlari Xaritasi",
      yangilanish_mexanizmi: "Avtomatik Yangilanish Usullari",
      eng_katta_xatolar: "Loyihalashdagi Tipik Xatolar",
      oltin_tavsiyalar: "Vaqt va Audit Me'moriy Qoidalari"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "dialektlar_jadvali",
        id: "l1",
        text: "Postgres o'n sakkiz temporal kalitlar va to'liq audit triggerlarini birdek qo'llab-quvvatlaydi."
      },
      {
        scene: "dialektlar_jadvali",
        id: "l2",
        text: "MySQL va SQLite'da esa temporal kalitlar mavjud emas, ularni dasturiy usulda tekshirish lozim."
      },
      {
        scene: "yangilanish_mexanizmi",
        id: "l3",
        text: "MySQL'dagi ON UPDATE CURRENT_TIMESTAMP xususiyati qiymat haqiqatan o'zgargandagina vaqtni yangilaydi."
      },
      {
        scene: "yangilanish_mexanizmi",
        id: "l4",
        text: "SQLite'da esa cheksiz takrorlanishdan saqlanish uchun triggerga maxsus WHEN sharti yoziladi."
      },
      {
        scene: "eng_katta_xatolar",
        id: "l5",
        text: "Davrlarni ikkala tomoni yopiq oraliq sifatida saqlash tutash sanalarda kesishish xatosini keltirib chiqaradi."
      },
      {
        scene: "eng_katta_xatolar",
        id: "l6",
        text: "Yumshoq o'chirishda oddiy unikal indeks qo'yish o'chirilgan foydalanuvchi ma'lumotlarini qayta ishlatishga to'sqinlik qiladi."
      },
      {
        scene: "oltin_tavsiyalar",
        id: "l7",
        text: "Har doim yarim ochiq oraliqlar va faol qatorlarni filtrlovchi qisman indekslardan foydalaning."
      },
      {
        scene: "oltin_tavsiyalar",
        id: "l8",
        text: "Tranzaksiyalar xavfsizligi va qat'iy audit bazadagi har qanday o'zgarishning shaffofligini kafolatlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

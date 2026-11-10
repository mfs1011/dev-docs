// SQL 49-bob 1-qism: "Tushuncha" — To'liq matnli qidiruv
(function (g) {
  g.NR = {
    title: "SQL To'liq Matnli Qidiruv: Tushuncha",
    scenes: [
      "like_kamchiliklari",
      "fts_arxitekturasi",
      "ozbek_tili_va_prefiks",
      "trigramma_va_oxshashlik"
    ],
    sceneNames: {
      like_kamchiliklari: "LIKE Nega To'liq Matnga Yetarli Emas?",
      fts_arxitekturasi: "To'liq Matnli Qidiruv Qanday Ishlaydi?",
      ozbek_tili_va_prefiks: "O'zbek Tili va Prefiks Qidiruvi",
      trigramma_va_oxshashlik: "Trigramma va Imlo Xatolari"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "like_kamchiliklari",
        id: "l1",
        text: "Matnlar ichidan ma'lumot izlashda oddiy layk operatori ko'pincha yetarli bo'lmay qoladi."
      },
      {
        scene: "like_kamchiliklari",
        id: "l2",
        text: "Chunki layk til grammatikasini bilmaydi, natijalarni moslik bo'yicha tartiblamaydi va bi-tri indeksidan foydalana olmaydi."
      },
      {
        scene: "fts_arxitekturasi",
        id: "l3",
        text: "To'liq matnli qidiruv matnni avval tokenlarga bo'lib, to'xtash so'zlarini tashlaydi va leksemalarga aylantiradi."
      },
      {
        scene: "fts_arxitekturasi",
        id: "l4",
        text: "Hosil bo'lgan leksemalar ro'yxati va ularning o'rni teskari indeks tuzilmasida saqlanadi."
      },
      {
        scene: "ozbek_tili_va_prefiks",
        id: "l5",
        text: "Postgresda o'zbek tili uchun alohida lug'at yo'qligi sababli simpl konfiguratsiyasi ishlatiladi."
      },
      {
        scene: "ozbek_tili_va_prefiks",
        id: "l6",
        text: "Qo'shimchalarni hisobga olish uchun so'z oxiriga ikki nuqta yulduzcha prefiksi qo'shib qidiriladi."
      },
      {
        scene: "trigramma_va_oxshashlik",
        id: "l7",
        text: "Imlo xatolari va so'z o'rtasidagi bo'laklarni topish uchun esa uchtalik harflardan iborat trigramma ishlatiladi."
      },
      {
        scene: "trigramma_va_oxshashlik",
        id: "l8",
        text: "Trigramma jin indeksi yordamida hatto xato yozilgan so'rovlarda ham kerakli satrlar bir zumda topiladi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);

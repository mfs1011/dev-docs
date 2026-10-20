// SQL 44-bob 1-qism: "Tushuncha" — Indeks turlari
(function (g) {
  g.NR = {
    title: "SQL Indeks Turlari: Tushuncha",
    scenes: [
      "btree_cheklovlari",
      "hash_va_gist_spgist",
      "gin_teskari_indeks",
      "brin_va_hajmlar"
    ],
    sceneNames: {
      btree_cheklovlari: "B-tree va Cheklovlar",
      hash_va_gist_spgist: "Hash va GiST / SP-GiST",
      gin_teskari_indeks: "GIN: Teskari Indeks",
      brin_va_hajmlar: "BRIN va Hajmlar Taqqosi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "btree_cheklovlari",
        id: "l1",
        text: "Standart B-tree indeksi tartiblangan qiymatlar, oraliq va tenglik qidiruvlari uchun eng zo'r tanlov hisoblanadi."
      },
      {
        scene: "btree_cheklovlari",
        id: "l2",
        text: "Ammo massiv ichidan element izlash, vaqt oraliqlari kesishuvi yoki eng yaqin nuqtalarni topishda B-tree yordam berolmaydi."
      },
      {
        scene: "hash_va_gist_spgist",
        id: "l3",
        text: "Bunday holatlar uchun maxsus indekslar bor: masalan, Hash indeksi faqat qat'iy tenglik qidiruvlarini o'ta tez bajaradi."
      },
      {
        scene: "hash_va_gist_spgist",
        id: "l4",
        text: "GiST va SP-GiST esa geometrik shakllar, range oraliqlar va eng yaqin qo'shnini qidirish uchun mo'ljallangan kuchli infratuzilmadir."
      },
      {
        scene: "gin_teskari_indeks",
        id: "l5",
        text: "GIN ya'ni teskari indeks massiv, jsonb va to'liq matnli ma'lumotlarning har bir tarkibiy qismini alohida ro'yxatga oladi."
      },
      {
        scene: "gin_teskari_indeks",
        id: "l6",
        text: "Natijada, millionlab qatorlar orasidan kerakli teg yoki kalit bor-yo'qligi bir zumda topiladi."
      },
      {
        scene: "brin_va_hajmlar",
        id: "l7",
        text: "BRIN esa jadvalning fizik bloklari bo'yicha min-max xulosasini saqlab, vaqt bo'yicha o'suvchi loglar uchun mo'jizaviy yechimdir."
      },
      {
        scene: "brin_va_hajmlar",
        id: "l8",
        text: "Aynan bir xil vaqt ustunida B-tree to'rt yarim megabayt joy egallagan bo'lsa, BRIN atigi yigirma to'rt kilobayt joy oladi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

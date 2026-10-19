// SQL 37-bob 2-qism: "Kod" — Aloqalar va tashqi kalitlar amaliyoti
(function (g) {
  g.NR = {
    title: "SQL Aloqalar va Tashqi Kalitlar: Kod",
    scenes: [
      "boshlangich_tuzilma_va_1_1",
      "birga_kop_va_oraliq_jadval",
      "on_delete_amallari",
      "kompozit_va_set_null",
      "bola_indeksi_va_xulosa"
    ],
    sceneNames: {
      boshlangich_tuzilma_va_1_1: "Boshlang'ich Tuzilma va 1:1 Aloqa",
      birga_kop_va_oraliq_jadval: "1:N va M:N Oraliq Jadval",
      on_delete_amallari: "ON DELETE: Kaskad va Taqiq",
      kompozit_va_set_null: "Kompozit Kalit va SET NULL Siyosati",
      bola_indeksi_va_xulosa: "Bola Ustuni Indeksi va Xulosa"
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
        scene: "boshlangich_tuzilma_va_1_1",
        id: "l1",
        text: "Mijozlar jadvaliga birga-bir aloqador profil yaratishda mijoz ID sini birlamchi va tashqi kalit qilamiz."
      },
      {
        scene: "boshlangich_tuzilma_va_1_1",
        id: "l2",
        text: "Aynan bir mijozga ikkinchi profil qo'shmoqchi bo'lsak, unikal cheklov buzilib xato qaytariladi."
      },
      {
        scene: "birga_kop_va_oraliq_jadval",
        id: "l3",
        text: "Buyurtmalar jadvali birga-ko'p aloqada bo'lsa, mahsulotlar bilan munosabat oraliq jadvalda saqlanadi."
      },
      {
        scene: "birga_kop_va_oraliq_jadval",
        id: "l4",
        text: "Oraliq jadvalda sotilgan paytdagi narx atributi saqlanishi tarixiy hisobotlar aniqligini ta'minlaydi."
      },
      {
        scene: "on_delete_amallari",
        id: "l5",
        text: "Buyurtma o'chirilganda kaskad qoidasi tufayli uning barcha qatorlari ham avtomatik o'chiriladi."
      },
      {
        scene: "on_delete_amallari",
        id: "l6",
        text: "Ammo buyurtmasi bor mahsulotni o'chirish taqiq cheklovi orqali qat'iy bloklanadi."
      },
      {
        scene: "kompozit_va_set_null",
        id: "l7",
        text: "Multi-tenant tuzilmalarda kompozit tashqi kalit va faqat muallif ustunini null qilish siyosati qo'llanadi."
      },
      {
        scene: "kompozit_va_set_null",
        id: "l8",
        text: "Foydalanuvchi o'chsa ham uning maqolalari saqlanadi va tenant ID si o'zgarmasdan qoladi."
      },
      {
        scene: "bola_indeksi_va_xulosa",
        id: "l9",
        text: "Postgresda bola tomondagi tashqi kalit ustuniga qo'lda indeks yaratish o'chirish va birlashtirishni tezlashtiradi."
      },
      {
        scene: "bola_indeksi_va_xulosa",
        id: "l10",
        text: "Shuningdek, oraliq jadvaldagi ikkinchi kalit ustunini ham alohida indekslash unumdorlik garovidir."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);

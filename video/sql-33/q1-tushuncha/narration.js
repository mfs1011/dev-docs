// SQL 33-bob 1-qism: Tushuncha — Matn funksiyalari
globalThis.NR = {
  scenes: ['kirish', 'ulash_va_null', 'uzunlik_belgi_va_bayt', 'asosiy_amallar', 'regex_va_farqlar'],
  sceneNames: {
    kirish: "Matn Funksiyalari: Satrlar Bilan Ishlash",
    ulash_va_null: "Satrlarni Ulash: ||, concat va concat_ws",
    uzunlik_belgi_va_bayt: "Uzunlik: Belgilar Soni va Baytlar Farqi",
    asosiy_amallar: "Asosiy Amallar: Kesish, Qidirish va Almashtirish",
    regex_va_farqlar: "Regex Funksiyalari va Almashtirish Rejimlari",
  },
  hold: {
    intro: 0.8,
    ulash: 1.2,
    uzunlik: 1.2,
    amallar: 1.2,
    regex: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "Matn bilan ishlash funksiyalari SQL dialektlarida eng ko'p farq qiladigan soha bo'lib, bir xil funksiya har xil natija berishi mumkin.",
    },
    {
      id: "ulash",
      scene: "ulash_va_null",
      text: "Satrlarni ulashda ikkita vertikal chiziq va concat NULL qiymatda farqlanadi, concat_ws esa ajratuvchi bilan xavfsiz birlashtiradi.",
    },
    {
      id: "uzunlik",
      scene: "uzunlik_belgi_va_bayt",
      text: "Uzunlikni o'lchashda ehtiyot bo'ling: Postgres va SQLite da length belgilar soni bo'lsa, MySQL da u baytlar hajmini bildiradi.",
    },
    {
      id: "amallar",
      scene: "asosiy_amallar",
      text: "Katta-kichik harf, qism satr va qidiruv pozitsiyalari doimo birinchi belgidan boshlanadi, SQLite da esa harf o'zgartirish faqat ASCII ga xos.",
    },
    {
      id: "regex",
      scene: "regex_va_farqlar",
      text: "Regex almashtirishda Postgres sukut bo'yicha faqat birinchi moslikni oladi, MySQL esa birdaniga barcha mosliklarni tozalaydi.",
    },
  ],
};

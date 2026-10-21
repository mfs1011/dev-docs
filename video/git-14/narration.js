// Git 14-bob videosi: "Obyektlar: blob va hash" (content/git/14-obyektlar-blob.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'hash_mohiyati',
    'hash_object_cat_file',
    'obyekt_ichki_tuzilishi',
    'qolda_hash_hisoblash',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Git Kalit-Qiymat Ombori va Blob',
    hash_mohiyati: 'Hash Nega Mazmundan Olinadi?',
    hash_object_cat_file: 'git hash-object va git cat-file',
    obyekt_ichki_tuzilishi: 'Obyekt Faylining Ichki Tuzilishi',
    qolda_hash_hisoblash: 'Hash Kodni Qo‘lda Hisoblash',
    xulosa: 'Xulosa va Tavsiyalar'
  };

  const hold = {
    l2: 1.0,
    l4: 1.0,
    l6: 1.0,
    l8: 1.0,
    l10: 1.0,
    l12: 1.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu o‘n to‘rtinchi bobda Git'ning eng tub asosi — kalit-qiymat ombori hamda birinchi g‘ishti bo‘lgan blob obyektini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git oddiy fayl tizimi emas, balki manzili o‘z mazmunidan kelib chiqadigan kontent-adreslanuvchi ma’lumotlar bazasidir."
    },
    {
      id: 'l3',
      scene: 'hash_mohiyati',
      text: "Kalitning aynan mazmun hashidan olinishi bir xil fayllarning takrorlanmasligini va butunlik tekshiruvini tekin ta’minlaydi."
    },
    {
      id: 'l4',
      scene: 'hash_mohiyati',
      text: "Git'da obyektlar bir marta yaratilgach hech qachon o‘zgarmaydi; biror bayt o‘zgarsa, u butunlay yangi obyektga aylanadi."
    },
    {
      id: 'l5',
      scene: 'hash_object_cat_file',
      text: "Git hash-object buyrug‘i xom ma’lumotni omborga blob sifatida yozadi, git cat-file esa uni qulay o‘qib beradi."
    },
    {
      id: 'l6',
      scene: 'hash_object_cat_file',
      text: "cat-file minus t orqali obyekt turini, minus s bilan hajmini, minus p bilan esa uning to‘liq mazmunini ko‘ramiz."
    },
    {
      id: 'l7',
      scene: 'obyekt_ichki_tuzilishi',
      text: "Diskdagi har bir obyekt zlib bilan siqilgan bo‘lib, ichida tur, hajm, bo‘sh bayt va haqiqiy kontent saqlanadi."
    },
    {
      id: 'l8',
      scene: 'obyekt_ichki_tuzilishi',
      text: "Fayl tizimini sekinlashuvdan asrash uchun qirq belgili hashning dastlabki ikki belgisi papka, qolgani fayl nomi qilinadi."
    },
    {
      id: 'l9',
      scene: 'qolda_hash_hisoblash',
      text: "Git hashi shunchaki fayl hashi emas, balki maxsus sarlavha va mazmunning birgalikdagi SHA-1 natijasidir."
    },
    {
      id: 'l10',
      scene: 'qolda_hash_hisoblash',
      text: "Shu sababli oddiy terminaldagi hash hisoblash buyrug‘i Git natijasiga teng bo‘lishi uchun unga sarlavha qo‘shish shart."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Blob fayl mazmunini saqlaydi, lekin unda fayl nomi va katalog tuzilishi yo‘q; ular keyingi bobda tree obyektida joylashadi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n beshinchi bobda aynan papkalar tuzilishini saqlovchi tree obyektlari va index bilan amaliy tanishamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '14-bob',
    title: "Obyektlar: blob va hash",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

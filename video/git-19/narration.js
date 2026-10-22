// Git 19-bob videosi: "Revision'larni tanlash" (content/git/19-revision-tanlash.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'reflog_va_at',
    'ota_zanjiri',
    'ichki_yollar',
    'diapazonlar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Revision Tushunchasi va Qisqa Hashlar',
    reflog_va_at: 'Reflog Nomlari va @ Sintaksisi',
    ota_zanjiri: 'Ota Zanjiri: Caret (^) va Tilde (~)',
    ichki_yollar: 'Obyekt Turi va Fayl Yo‘llari',
    diapazonlar: 'Diapazonlar: Ikki Nuqta va Uch Nuqta',
    xulosa: 'Xulosa va Amaliy Maslahatlar'
  };

  const hold = {
    l2: 1.5,
    l4: 2.0,
    l6: 2.0,
    l8: 2.0,
    l10: 2.0,
    l12: 2.0
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu o‘n to‘qqizinchi bobda Git omboridagi commit, tree va bloblarni aniq ko‘rsatuvchi revizhn sintaksisi hamda diapazonlar bilan tanishamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "To‘liq qirq belgili hesh o‘rniga kamida to‘rtta belgidan iborat yagona qisqa prefiks yozish orqali ham istalgan obyektga murojaat qilish mumkin."
    },
    {
      id: 'l3',
      scene: 'reflog_va_at',
      text: "Kuchukcha belgisi HEAD ko‘rsatkichini bildirsa, jingalak qavs ichidagi indeks reflog bo‘yicha refning o‘tmishdagi qadamlarini aniqlaydi."
    },
    {
      id: 'l4',
      scene: 'reflog_va_at',
      text: "Shuningdek, kuchukcha minus bir sintaksisi avvalgi turgan brenchga qaytish, sana ko‘rsatkichlari esa muayyan vaqtdagi holatni topishga xizmat qiladi."
    },
    {
      id: 'l5',
      scene: 'ota_zanjiri',
      text: "Ota zanjirida karet belgisi merjdagi ikkinchi otani eni bo‘yicha tanlasa, tilda belgisi avlodlar chuqurligi bo‘ylab ketma-ket orqaga siljiydi."
    },
    {
      id: 'l6',
      scene: 'ota_zanjiri',
      text: "Masalan, HEAD tilda uch faqat birinchi otalar bo‘ylab uch qadam orqaga yursa, HEAD karet ikki aynan merj qilingan tarmoq uchini ko‘rsatadi."
    },
    {
      id: 'l7',
      scene: 'ichki_yollar',
      text: "Revision sintaksisi fayl yo‘llari bilan ham ishlaydi: ikki nuqta orqali brench almashtirmasdan istalgan eski versiyadagi faylni o‘qish mumkin."
    },
    {
      id: 'l8',
      scene: 'ichki_yollar',
      text: "Annotated teglardan to‘g‘ridan-to‘g‘ri commitga o‘tish uchun jingalak qavsda commit turi, stagingdagi fayllar uchun esa boshlang‘ich indeks ko‘rsatiladi."
    },
    {
      id: 'l9',
      scene: 'diapazonlar',
      text: "Diapazonlarda ikki nuqta orqali bir brenchda bor, ikkinchisida yo‘q commitlar to‘plami filtrlanadi."
    },
    {
      id: 'l10',
      scene: 'diapazonlar',
      text: "Uch nuqta esa ikki tarmoq o‘rtasidagi simmetrik farqni, ya’ni umumiy ajdoddan keyingi mustaqil commitlarni aniqlash imkonini beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Bundan tashqari, xabar bo‘yicha qidiruv va fyorst-perent filtrlari loyiha tarixini tahlil qilishni sezilarli darajada soddalashtiradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi yigirmanchi bobda brenchlarning asl tabiati va ularning o‘ta yengil ko‘rsatkich ekanini amalda o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '19-bob',
    title: "Revision'larni tanlash",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);

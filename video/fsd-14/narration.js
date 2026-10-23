// FSD 14-bob videosi: "Public API chuqur" (content/fsd/14-public-api-chuqur.md). Ovoz — Kore, metafora — qasr darvozasi va shartnoma.
(function (g) {
  const scenes = ['intro', 'shartnoma_va_eksport', 'siklik_importlar', 'tree_shaking', 'server_klient', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Public API — Modul Darvozasi',
    shartnoma_va_eksport: 'Aniq Nomlangan Eksportlar',
    siklik_importlar: 'Siklik Importlar va Nisbiy Yo‘llar',
    tree_shaking: 'Shared/ui va Tree-Shaking Sirlari',
    server_klient: 'Muhitga Xos Public API: index.server',
    steiger: 'Steiger Linteri Nazorati',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n to'rtinchi bobi — Public API chuqur. Public API har bir slice va tashqi kod o'rtasidagi rasmiy shartnoma hamda mustahkam darvozadir."],

    ['L2', 'shartnoma_va_eksport', "Slice o'zining ichki tuzilishini index nuqtasi orqali berkitadi va faqat kerakli qismlarnigina tashqariga ochadi."],
    ['L3', 'shartnoma_va_eksport', "Eng muhim qoida: eksport yulduzcha yozish taqiqlanadi — faqat aniq nomlangan eksportlar qo'llanilishi shart."],
    ['L4', 'shartnoma_va_eksport', "Aks holda ichki yordamchi mantiq tasodifan tashqariga chiqib ketadi va kelajakda refaktoring qilish imkonsiz bo'lib qoladi."],

    ['L5', 'siklik_importlar', "Public API bilan bog'liq eng ko'p uchraydigan xato — bu slice ichida o'z index'idan import qilishdir."],
    ['L6', 'siklik_importlar', "Bitta slice ichidagi komponentlar bir-birini faqat to'liq nisbiy yo'l orqali chaqirishi shart."],
    ['L7', 'siklik_importlar', "Boshqa slice'lar esa har doim alias va index orqali kiradi — bu siklik bog'liqliklarni butunlay yo'q qiladi."],

    ['L8', 'tree_shaking', "Shared/ui qatlamida bitta umumiy index.ts ochish tree-shaking jarayonini buzishi mumkin."],
    ['L9', 'tree_shaking', "Shuning uchun shared/ui ichida har bir komponent o'zining mustaqil papkasiga ega bo'lishi tavsiya etiladi."],
    ['L10', 'tree_shaking', "Natijada oddiy Button chaqirilganda, sahifaga og'ir CodeEditor yoki begona kutubxonalar tushib qolmaydi."],

    ['L11', 'server_klient', "Next.js kabi zamonaviy freymvorklarda klient va server kodi aralashib ketmasligi uchun index.server nuqtasi ochiladi."],
    ['L12', 'server_klient', "Bu orqali maxfiy ma'lumotlar bazasi so'rovlari va server-only modullar brauzer paketiga tushishdan himoyalanadi."],

    ['L13', 'steiger', "Steiger linterining public-api qoidasi slice ichiga to'g'ridan-to'g'ri bostirib kirishni va noto'g'ri eksportlarni doimiy nazorat qiladi."],
    ['L14', 'steiger', "Dasturchi chuqur fayllarni import qilib qo'yganida, linter uni darhol ogohlantirib, toza arxitekturani saqlaydi."],

    ['L15', 'xulosa', "Xulosa qilsak: toza Public API — aniq nomlangan eksportlar, ichki nisbiy importlar va kuchli modullik demakdir."],
    ['L16', 'xulosa', "Keyingi bobda o'zaro cross-import muammosi va cross-export belgisini chuqurroq ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

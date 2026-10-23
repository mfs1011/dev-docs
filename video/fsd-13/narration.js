// FSD 13-bob videosi: "Slice guruhlari" (content/fsd/13-slice-guruhlari.md). Ovoz — Kore, metafora — bino xonalarini guruhlash.
(function (g) {
  const scenes = ['intro', 'tushuncha', 'qoidalar', 'qayerda_tabiiy', 'import_yoli', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Slice Guruhlari',
    tushuncha: 'Nega Guruhlash Kerak?',
    qoidalar: 'Slice Guruhlarining 3 Oltin Qoidasi',
    qayerda_tabiiy: 'Entities va Pages da Guruhlash',
    import_yoli: 'Import Yo‘li va Public API',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n uchinchi bobi — slice guruhlari. Slice guruhlari yirik loyihalarda yuzlab slice'larni tartibga solish va fayl navigatsiyasini qulaylashtirish mexanizmidir."],

    ['L2', 'tushuncha', "Katta ilovalarda bitta qatlam ichida o'nlab slice'lar to'planganda, tekis ro'yxatni ko'zdan kechirish qiyinlashadi."],
    ['L3', 'tushuncha', "Masalan, payment mavzusiga oid invoice, receipt va transaction slice'larini bitta payment papkasi ichiga yig'ish mumkin."],
    ['L4', 'tushuncha', "Lekin eng asosiy narsa: guruh papkasi faqat vizual navigatsiya uchun bo'lib, u hech qachon alohida slice hisoblanmaydi."],

    ['L5', 'qoidalar', "Birinchi qoida: guruh papkasida index.ts public API bo'lishi mumkin emas — har bir slice faqat o'z index darvozasiga ega."],
    ['L6', 'qoidalar', "Ikkinchi qoida: guruh ichiga umumiy yordamchi kod yoki util fayllar qo'yilmaydi; umumiy narsalar quyi qatlamlarga chiqariladi."],
    ['L7', 'qoidalar', "Uchinchi qoida: guruh ichidagi slice'lar ham o'zaro to'g'ridan-to'g'ri import qila olmaydi — cross-import taqiqi to'liq saqlanadi."],

    ['L8', 'qayerda_tabiiy', "Slice guruhlari ayniqsa entities va pages qatlamlarida juda tabiiy va qulay ishlaydi."],
    ['L9', 'qayerda_tabiiy', "Masalan, pages/order ichida list, detail, create va edit sahifalarini jamlash fayl daraxtini juda tartibli qiladi."],
    ['L10', 'qayerda_tabiiy', "Features qatlamida esa guruhlashdan ehtiyot bo'lish kerak, aks holda alohida harakatlar o'rniga soxta domen paydo bo'lib qoladi."],

    ['L11', 'import_yoli', "Guruh kiritilganda import yo'liga shunchaki papka nomi qo'shiladi, masalan: entities/payment/invoice."],
    ['L12', 'import_yoli', "Tashqi kod to'g'ridan-to'g'ri slice'ning o'ziga murojaat qiladi va arxitektura qoidalari buzilmaydi."],

    ['L13', 'steiger', "Steiger linteri guruh chuqurligini to'g'ri taniydi va guruh papkasida noto'g'ri index.ts yoki segmentlar paydo bo'lishini taqiqlaydi."],
    ['L14', 'steiger', "To'g'ri guruhlash navigatsiyani yengillashtiradi, lekin tizimning modullik chegaralarini qat'iy himoya qiladi."],

    ['L15', 'xulosa', "Xulosa qilsak: slice guruhi — faqat navigatsiya papkasi, unda umumiy kod yoki public API bo'lmaydi."],
    ['L16', 'xulosa', "Keyingi bobda loyihaning mustahkam darvozasi bo'lgan Public API mavzusini chuqurroq o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

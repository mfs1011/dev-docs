// FSD 15-bob videosi: "Cross-import va @x" (content/fsd/15-cross-import.md). Ovoz — Kore, metafora — gorizontal chegaralar va @x kesishuv.
(function (g) {
  const scenes = ['intro', 'code_smell', 'at_x_shablon', 'strategiya_ab', 'strategiya_cd', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Cross-import va Gorizontal Bog‘liqlik',
    code_smell: 'Nega Cross-import Code Smell?',
    at_x_shablon: 'Entities Qatlamida @x Belgisi',
    strategiya_ab: 'Features Uchun A va B Strategiyalari',
    strategiya_cd: 'C va D Strategiyalari: IoC va Public API',
    steiger: 'Steiger Linteri va Qat’iy Chegaralar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L13: 1.2,
    L15: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n beshinchi bobi — Cross-import va at x belgisi. Bugun bir qatlamdagi slice'larning o'zaro bog'lanishi va uni to'g'ri hal qilish usullarini o'rganamiz."],
    ['L2', 'intro', "Masalan, cart feature'si mahsulot ma'lumotlarini olish uchun to'g'ridan-to'g'ri product feature'sini chaqirsa, bu gorizontal bog'lanish, ya'ni cross-import hisoblanadi."],

    ['L3', 'code_smell', "FSD qoidalariga ko'ra cross-import jiddiy code smell hisoblanadi. Chunki kod egaligi xiralashadi, cart ustida ishlayotgan dasturchi product ichki tuzilishini ham bilishga majbur bo'ladi."],
    ['L4', 'code_smell', "Eng xavflisi, alohida testlash qiyinlashadi va bir tomonlama chaqiruv vaqt o'tishi bilan ikki tomonlama, halokatli siklik bog'lanishga aylanib ketishi mumkin."],

    ['L5', 'at_x_shablon', "Lekin real hayotda obyektlar bir-birisiz yashay olmaydi. Masalan, qo'shiq entity'si ijrochi bilan, buyurtma esa mijoz modeli bilan chambarchas bog'liq."],
    ['L6', 'at_x_shablon', "Bunday muqarrar holatlar uchun FSD entities qatlamida maxsus at x, ya'ni kesishuv belgisini joriy qilgan. Bu papka boshqa aniq bir entity uchun mo'ljallangan maxsus public API hisoblanadi."],
    ['L7', 'at_x_shablon', "Muhim qoida: at x belgisini hech qachon features yoki widgets qatlamida ishlatib bo'lmaydi. U faqat domen obyektlari modellarini o'zaro ulashda oxirgi chora sifatida qo'llanadi."],

    ['L8', 'strategiya_ab', "Xo'sh, agar features yoki widgets ichida cross-import ehtiyoji tug'ilsa, qanday to'g'ri yo'l tutish kerak? Buning uchun to'rtta professional strategiya mavjud."],
    ['L9', 'strategiya_ab', "Birinchi strategiya — slice'larni birlashtirish. Agar profile va profile-settings doimo birga o'zgarib bir-biriga muhtoj bo'lsa, ularni yagona profile slice'iga jamlash lozim."],
    ['L10', 'strategiya_ab', "Ikkinchi strategiya — domen mantiqini pastga, entities qatlamiga tushirish. Agar bir nechta feature foydalanuvchi ma'lumotlarini ishlatsa, mantiq entities ichida saqlanadi, UI esa feature'da qoladi."],

    ['L11', 'strategiya_cd', "Uchinchi yo'l — yuqori qatlamda kompozitsiya qilish, ya'ni Inversion of Control. Bitta feature boshqasini chaqirmaydi, sahifa ularni slot yoki bolalar orqali bir-biriga uzatadi."],
    ['L12', 'strategiya_cd', "To'rtinchi chora — qat'iy public API. Boshqa iloj qolmaganda chaqiruvga ruxsat beriladi, biroq faqat ochiq eksportlar orqali, ichki fayllar va store'larga kirish mutlaqo taqiqlanadi."],
    ['L13', 'strategiya_cd', "Ushbu to'rtinchi holatda arxitektura qarori loyiha hujjatlarida yoki izohlarda aniq yozib qo'yilishi va keyinchalik refaktoring qilinishi shart."],

    ['L14', 'steiger', "Loyiha kattalashgani sari bunday noo'rin cross-importlarni ko'z bilan tutib qolish imkonsiz. Shu sababli Steiger linteri gorizontal importlarni avtomatik nazorat qiladi."],
    ['L15', 'steiger', "Steiger noqonuniy chaqiruvlarni va ichki fayllarga kirishlarni darhol belgilab beradi va arxitektura tozaligini saqlashga yordam beradi."],

    ['L16', 'xulosa', "Xulosa qilsak: gorizontal bog'lanishlardan qoching, entities uchun zaruratda at x dan foydalaning va toza kompozitsiyani tanlang. Keyingi bobda yuqori qatlamda kompozitsiyani ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

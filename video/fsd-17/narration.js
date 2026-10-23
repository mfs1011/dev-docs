// FSD 17-bob videosi: "Desegmentatsiya va nomlash" (content/fsd/17-desegmentatsiya.md). Ovoz — Kore, metafora — texnik sochilish va domenli jamlanish.
(function (g) {
  const scenes = ['intro', 'muammolar', 'domen_boyicha', 'nomlash_qoidalari', 'istisnolar_va_xatolar', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Desegmentatsiya Xatosi',
    muammolar: 'Texnik Ajratishning 3 Katta Muammosi',
    domen_boyicha: 'Domen Bo‘yicha Guruhlash',
    nomlash_qoidalari: 'Nomlashning Oltin Qoidasi',
    istisnolar_va_xatolar: 'Ruxsat Etilgan Holatlar va Xatolar',
    steiger: 'Steiger Nazorati va Segmentlar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n yettinchi bobi — Desegmentatsiya va to'g'ri nomlash. Bugun loyihalarda eng ko'p uchraydigan texnik ajratish tuzog'i va uni bartaraf etishni o'rganamiz."],
    ['L2', 'intro', "Desegmentatsiya — bu fayllarni biznes sohasi bo'yicha emas, balki ularning texnik turi bo'yicha components, hooks yoki utils kabi papkalarga sochib tashlashdir."],

    ['L3', 'muammolar', "Bir qarashda bu tartibli tuyulsa-da, amalda past bog'liqlik keltirib chiqaradi: bitta yetkazib berish mantiqini o'zgartirish uchun beshta alohida papkaga kirishga to'g'ri keladi."],
    ['L4', 'muammolar', "Natijada komponentlar o'rtasida yashirin chigal bog'lanishlar paydo bo'ladi va kodni refaktoring qilish deyarli imkonsiz bo'lib qoladi."],

    ['L5', 'domen_boyicha', "FSD yondashuvi barcha bog'liq kodlarni bitta domen ostiga jamlashni talab qiladi."],
    ['L6', 'domen_boyicha', "Masalan, delivery slice'ida barcha interfeyslar ui papkasida, barcha hisob-kitoblar model papkasida, tarmoq so'rovlari esa api ichida saqlanadi."],
    ['L7', 'domen_boyicha', "Har qanday o'zgarish faqat bitta papka ichida amalga oshiriladi, bu esa loyihani tushunishni va rivojlantirishni bir necha barobar tezlashtiradi."],

    ['L8', 'nomlash_qoidalari', "Nomlashda har doim o'zingizga savol bering: bu nom kod qanday yozilganini aytadimi yoki nima maqsadda yozilganini?"],
    ['L9', 'nomlash_qoidalari', "types.ts yoki utils.ts deb nomlash xatodir, chunki bu shunchaki fayl turini bildiradi. Buning o'rniga product.ts yoki format-price.ts kabi aniq domen nomlarini tanlang."],
    ['L10', 'nomlash_qoidalari', "Slice ichida alohida types.ts ochish o'rniga, har bir tipni uni ishlatadigan biznes modeli bilan bir faylga joylang."],

    ['L11', 'istisnolar_va_xatolar', "Istisno tariqasida, faqat shared qatlamida texnik guruhlash tabiiydir: chunki shared biznesga ega emas, unda umumiy tugmalar yoki sana kutubxonalari turadi."],
    ['L12', 'istisnolar_va_xatolar', "Lekin shared ichida ham utils.ts nomli axlat qutisi yaratmang, balki lib date yoki lib money kabi aniq yo'nalishli modullarga ajrating."],
    ['L13', 'istisnolar_va_xatolar', "Slice ichida ortiqcha ui components kabi ichma-ich papkalar ochish ham desegmentatsiyaning qaytishi hisoblanadi."],

    ['L14', 'steiger', "Steiger linteri slice ichidagi ortiqcha qatlamlarni va noto'g'ri segment nomlarini avtomatik tekshirib boradi."],
    ['L15', 'steiger', "Domen asosida tuzilgan papkalar tufayli linter to'liq yashil tasdiq beradi va arxitektura tozaligini saqlaydi."],

    ['L16', 'xulosa', "Xulosa qilsak: kodni texnik turiga qarab sochmang, har doim domenga qarab jamlang va aniq nomlang. Keyingi bobda ortiqcha entity'lar muammosini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

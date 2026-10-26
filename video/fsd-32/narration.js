// FSD 32-bob videosi: "Monorepo va bir nechta FSD ildizi" (content/fsd/32-monorepo.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'ildiz_tamoyili', 'paketlarni_ulash', 'steiger_intizomi', 'ajratish_mezonlari', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Monorepo va Ko\'p Ildizli FSD',
    ildiz_tamoyili: 'Har Bir Paket — Alohida FSD Ildizi',
    paketlarni_ulash: 'Paketlarni shared Qatlamida O\'rash',
    steiger_intizomi: 'Steiger Linterini Har Bir Ildizda Ishlatish',
    ajratish_mezonlari: 'Qachon Monorepoga Bo\'lish Kerak?',
    tipik_xatolar: 'Monorepo va FSD da Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L5: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz ikkinchi bobi — Monorepo arxitekturasi va bitta omborda bir nechta FSD ildizlari bilan ishlash strategiyasi."],
    ['L2', 'intro', "Katta korxona tizimlarida storefront, admin paneli va umumiy domen alohida FSD ildizlari sifatida monorepoga birlashtiriladi."],

    ['L3', 'ildiz_tamoyili', "Monorepoda har bir paket o'zining to'liq yoki qisqartirilgan FSD qatlamlariga va mustaqil public API siga ega bo'ladi."],
    ['L4', 'ildiz_tamoyili', "Masalan, storefront barcha qatlamlarni saqlasa, katalog paketi faqat entitiz va sherd qatlamlari bilan ixcham FSD ildizi bo'ladi."],
    ['L5', 'ildiz_tamoyili', "Paketlararo import tashqi kutubxona sifatida ko'riladi va pekej jeyson dagi exports orqali qat'iy nazorat qilinadi."],

    ['L6', 'paketlarni_ulash', "Tashqi umumiy dizayn tizimi yoki api-klient paketlarini ilova ichidagi sherd segmentlarida o'rash eng qulay usuldir."],
    ['L7', 'paketlarni_ulash', "Bu yondashuv orqali tashqi kutubxonalarni yangilash yoki almashtirish butun ilovani buzmasdan, faqat sherd da amalga oshadi."],

    ['L8', 'steiger_intizomi', "Stayger linteri monorepo ildizidan emas, har bir paketning o'z katalogida alohida ishga tushirilishi kerak."],
    ['L9', 'steiger_intizomi', "Shunda har bir FSD ildizining stayger konfig sozlamalari va istisnolari to'liq inobatga olinadi."],
    ['L10', 'steiger_intizomi', "npm ning vorkspeysis buyrug'i barcha FSD paketlarini birvarakay va toza tekshirib chiqish imkonini beradi."],

    ['L11', 'ajratish_mezonlari', "Monorepoga faqat jamoalar mustaqil reliz qilganda yoki do'kon va admin kabi alohida ilovalar bitta dizayn tizimidan foydalanganda bo'linadi."],
    ['L12', 'ajratish_mezonlari', "Shunchaki papkalar ko'paygani uchun monorepo ochish behuda murakkablik va ortiqcha xarajat olib keladi."],

    ['L13', 'tipik_xatolar', "Tipik xatolar — umumiy paket ichidagi fayllarga chuqur import qilish va ilovalarning bir-birini to'g'ridan import qilishidir."],
    ['L14', 'tipik_xatolar', "Shuningdek, sherd-yutils kabi axlat qutilari yaratish va faqat bitta ilovaga kerakli kodni shoshilib paketga chiqarish taqiqlanadi."],

    ['L15', 'xulosa', "Xulosa: To'g'ri tashkil etilgan monorepo FSD intizomini buzmasdan, ulkan tizimlarni erkin masshtablash imkonini beradi."],
    ['L16', 'xulosa', "Keyingi o'ttiz uchinchi bobda Steiger linterining chuqur imkoniyatlari va arxitektura qoidalarini avtomatlashtirishni ko'ramiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// FSD videosi — ovoz birinchi (Kore). Metafora: bino — qatlam qavat, slice xona, segment quti, public API eshik, import lift.
// Da'volar manbasi (feature-sliced.design, v2.1): get-started/overview (7 qatlam, processes eskirgan, import faqat pastga,
// slice'lar bir-birini ishlatmaydi, segmentlar), reference/public-api (index.ts — kirish), guides/migration/from-v2-0
// ("start with pages"). Steiger chiqishi — steiger-toza.txt va steiger-xato.txt (steiger 0.7.0, plugin 0.8.0).
(function (g) {
  const scenes = ['intro', 'muammo', 'qatlamlar', 'import', 'slice', 'segment', 'api', 'steiger', 'pages', 'xulosa'];
  const lines = [
    ['L1', 'intro', 'Salom! Bu videoda Feature-Sliced Design, qisqasi FSD bilan tanishamiz. Bu frontend loyihani tartibli qurish usuli.'],

    ['L2', 'muammo', 'Loyiha kichik paytida hamma narsa joyida bo‘ladi. Lekin u o‘sgan sari components, utils, helpers papkalari to‘lib ketadi.'],
    ['L3', 'muammo', 'Har bir fayl istalgan boshqa faylni import qiladi. Bitta joyni o‘zgartirsangiz, boshqa joy buziladi.'],
    ['L4', 'muammo', 'FSD kodni ma’nosiga qarab joylaydi va qaysi kod qaysi koddan foydalanishi mumkinligini aniq belgilaydi.'],

    ['L5', 'qatlamlar', 'FSD loyihani qavatlarga bo‘ladi. Ularni qatlamlar deyiladi.'],
    ['L6', 'qatlamlar', 'Eng pastda shared: tugma yoki API klient kabi hammaga kerak bo‘lgan narsalar.'],
    ['L7', 'qatlamlar', 'Undan yuqorida entities: mahsulot va savat kabi biznes obyektlari.'],
    ['L8', 'qatlamlar', 'Keyin features: foydalanuvchi harakatlari, masalan, savatga qo‘shish.'],
    ['L9', 'qatlamlar', 'Widgets: sahifadagi katta mustaqil bloklar, masalan, sarlavha yoki mahsulotlar ro‘yxati.'],
    ['L10', 'qatlamlar', 'Pages — sahifalar. Eng tepada esa app: ilovani ishga tushiradigan qism.'],
    ['L11', 'qatlamlar', 'Hammasi bo‘lib yettita qatlam bor, lekin processes qatlami eskirgan. Hammasidan foydalanish shart ham emas.'],

    ['L12', 'import', 'Eng muhim qoida: har bir qatlam faqat o‘zidan pastdagi qatlamlardan import qila oladi.'],
    ['L13', 'import', 'Bu faqat pastga yuradigan liftga o‘xshaydi. Sahifa widgetni ishlata oladi, lekin entity featureni ishlata olmaydi.'],
    ['L14', 'import', 'Shu tufayli pastdagi kod yuqoridagisiga bog‘lanib qolmaydi va uni xavfsiz o‘zgartirish mumkin.'],

    ['L15', 'slice', 'Har bir qavat xonalarga bo‘linadi. Ularni slice deyiladi. Slice biznes sohasi bo‘yicha ajratiladi: masalan, product va cart.'],
    ['L16', 'slice', 'Bir qavatdagi xonalar orasida eshik yo‘q. Slice o‘z qatlamidagi boshqa slice’ni import qilmaydi.'],

    ['L17', 'segment', 'Xona ichida kod vazifasiga qarab segmentlarga bo‘linadi.'],
    ['L18', 'segment', 'ui — ko‘rinish, api — server bilan aloqa, model — ma’lumotlar, lib — yordamchi kod, config esa sozlamalar.'],

    ['L19', 'api', 'Har bir slice’ning bitta kirish eshigi bor: index.ts fayli. Bu uning public API’si.'],
    ['L20', 'api', 'Boshqa kod slice ichiga faqat shu eshik orqali kiradi va ichki fayllarga to‘g‘ridan-to‘g‘ri murojaat qilmaydi.'],

    ['L21', 'steiger', 'Bu qoidalarni qo‘lda kuzatish shart emas. Steiger degan rasmiy linter ularni o‘zi tekshiradi.'],
    ['L22', 'steiger', 'Mana, uchta xato: yuqori qatlamdan import, bir qatlamdagi slice’lar orasida import va public API’ni chetlab o‘tish.'],
    ['L23', 'steiger', 'Xatolar tuzatilgach, Steiger hech qanday muammo topmaydi.'],

    ['L24', 'pages', 'Qayerdan boshlash kerak? FSD’ning yangi versiyasi sahifadan boshlashni tavsiya qiladi.'],
    ['L25', 'pages', 'Kodni avval sahifaning o‘zida saqlang. U bir nechta sahifada kerak bo‘lib qolganda, pastki qatlamga ko‘chiring.'],

    ['L26', 'xulosa', 'Xulosa qilsak: qatlamlar tartib beradi, lift faqat pastga yuradi, xonalar bir-biridan mustaqil, kirish esa faqat eshikdan.'],
    ['L27', 'xulosa', 'E’tiboringiz uchun rahmat! Batafsil ma’lumot saytdagi FSD qo‘llanmasida.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, lines };
})(typeof window !== 'undefined' ? window : globalThis);

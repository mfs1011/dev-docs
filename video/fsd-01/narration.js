// FSD 1-bob videosi: "FSD nima va qachon kerak" (content/fsd/01-kirish.md). Ovoz — Kore, metafora — bino (FSD-VIDEO-USLUBI.md).
// Da'volar manbasi (feature-sliced.design, v2.1): get-started/overview (ta'rif, "Is it right for me?", afzalliklar, asboblar),
// reference/layers ("You don't have to use every layer", "at least the Shared, Pages, and App layers",
// "Adding new layers is not recommended"). Steiger chiqishi — ../fsd-umumiy/steiger-xato.txt (steiger 0.7.0, plugin 0.8.0).
(function (g) {
  const scenes = ['intro', 'savollar', 'daraja', 'kimga', 'foyda', 'qachon', 'xatolar', 'xulosa'];
  const sceneNames = { intro: 'Kirish', savollar: 'FSD nima', daraja: 'Uch daraja', kimga: 'Kimga mos', foyda: 'Nima beradi', qachon: 'Qachon kerak', xatolar: 'Tipik xatolar', xulosa: 'Xulosa' };
  const hold = { L3: 0.6, L4: 0.6, L5: 0.8, L6: 0.8, L7: 0.8, L8: 0.8, L9: 1.2, L11: 0.6, L12: 0.8, L13: 0.8, L14: 1.2, L15: 1.0, L16: 0.6, L17: 0.8, L18: 1.2, L19: 0.6, L20: 1.0, L21: 1.2, L22: 0.4, L23: 1.6, L24: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining birinchi bobi. FSD nima, u nima beradi va qachon kerakligini ko‘rib chiqamiz.'],

    ['L2', 'savollar', 'Feature-Sliced Design, qisqasi FSD — frontend ilovalar uchun arxitektura metodologiyasi. Oddiy qilib aytganda, kodni tartiblash qoidalari va kelishuvlari to‘plami.'],
    ['L3', 'savollar', 'U uchta savolga aniq javob beradi. Birinchisi: fayl qaysi papkaga boradi?'],
    ['L4', 'savollar', 'Ikkinchisi: qaysi kod qaysi kodni import qila oladi?'],
    ['L5', 'savollar', 'Uchinchisi: modulning tashqi interfeysi qayerda?'],
    ['L6', 'savollar', 'Shuning uchun FSD loyihalari bir-biriga o‘xshaydi. Yangi dasturchi tuzilmani birinchi kundanoq taniydi.'],

    ['L7', 'daraja', 'Kod uch darajaga bo‘linadi. Birinchisi — qatlam. U bino qavatiga o‘xshaydi va kod qanchalik umumiyligini bildiradi.'],
    ['L8', 'daraja', 'Qavat ichida xonalar bor. Ularni slice deyiladi va biznes sohasi bo‘yicha ajratiladi: masalan, product yoki cart.'],
    ['L9', 'daraja', 'Xona ichida esa segmentlar: ui, api, model kabi. Ular kodning texnik vazifasini bildiradi.'],

    ['L10', 'kimga', 'FSD kimga mos? U frontend uchun: veb, mobil yoki desktop interfeysi. Va kutubxona uchun emas, aynan ilova uchun.'],
    ['L11', 'kimga', 'Dasturlash tili, framework yoki holat menejeri bo‘yicha cheklov yo‘q. React, Vue, Angular — qoidalar bir xil.'],
    ['L12', 'kimga', 'Rasmiy hujjatga ko‘ra, FSD istalgan hajmdagi loyiha va jamoada ishlatilishi mumkin.'],

    ['L13', 'foyda', 'FSD nima beradi? Birinchisi — bir xillik. Tuzilma standart, shuning uchun yangi odam jamoaga tez moslashadi.'],
    ['L14', 'foyda', 'Ikkinchisi — o‘zgarishlarga barqarorlik. Modul o‘z qatlamidagi yoki yuqoridagi modullarni ishlata olmaydi. Shuning uchun bir joyni o‘zgartirsangiz, kutilmagan joy buzilmaydi.'],
    ['L15', 'foyda', 'Uchinchisi — boshqariladigan qayta ishlatish. Qatlamga qarab kod juda umumiy yoki juda lokal bo‘ladi.'],
    ['L16', 'foyda', 'Bundan tashqari, FSD’ning arxitekturani tekshiradigan linteri, papka generatorlari va ko‘plab misollari bor.'],

    ['L17', 'qachon', 'Lekin FSD har doim ham shart emas. Rasmiy hujjat aytadi: hozirgi arxitektura ishlayotgan bo‘lsa, uni o‘zgartirishga arzimasligi mumkin.'],
    ['L18', 'qachon', 'Hamma qatlamlarni ishlatish ham shart emas. Ko‘pchilik loyihalarda kamida uchtasi bo‘ladi: shared, pages va app.'],
    ['L19', 'qachon', 'FSD’ni bosqichma-bosqich, qismlab joriy qilish ham mumkin.'],

    ['L20', 'xatolar', 'Endi tipik xatolar. Birinchisi: birinchi kunning o‘zida hamma qatlamlarni va bo‘sh papkalarni yaratish. Uchta qatlamdan boshlang.'],
    ['L21', 'xatolar', 'Ikkinchisi: modules yoki core kabi o‘z qatlamingizni qo‘shish. Qatlamlarning ma’nosi standart, shuning uchun yangi qatlam qo‘shish tavsiya etilmaydi.'],
    ['L22', 'xatolar', 'Uchinchisi: FSD’ni faqat papka nomlari deb tushunish. Asosiysi — import qoidalari, ularni Steiger linteri tekshiradi.'],
    ['L23', 'xatolar', 'Mana, haqiqiy natija: papkalar to‘g‘ri, lekin Steiger uchta xato topdi.'],

    ['L24', 'xulosa', 'Xulosa qilsak: FSD kodni qavat, xona va segmentga ajratadi, importni esa faqat pastga yo‘naltiradi. Uni kerak bo‘lganda va bosqichma-bosqich joriy qiling.'],
    ['L25', 'xulosa', 'Keyingi bobda sahifadan boshlash g‘oyasini ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

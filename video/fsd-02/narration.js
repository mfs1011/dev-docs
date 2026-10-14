// FSD 2-bob videosi: "Pages-first: v2.1 fikrlash modeli" (content/fsd/02-pages-first.md). Ovoz — Kore, metafora — bino (FSD-VIDEO-USLUBI.md).
// Da'volar manbasi (feature-sliced.design): guides/migration/from-v2-0 ("pages first", v2.0 — entities va features'dan,
// "a layer forms some kind of global namespace", "no breaking changes", "move it to a layer below"), get-started/tutorial
// (Conduit — Medium kloni, 6 sahifa, sign-in bitta slice, "fit into just three layers: App, Pages, and Shared").
// Steiger chiqishi — steiger-xato.txt (namuna-xato/: v2.0 uslubi) va steiger-toza.txt (namuna/: pages-first), steiger 0.7.0, plugin 0.8.0.
(function (g) {
  const scenes = ['intro', 'v20', 'v21', 'conduit', 'nomlar', 'kochirish', 'steiger', 'xulosa'];
  const sceneNames = { intro: 'Kirish', v20: 'v2.0: pastdan yuqoriga', v21: 'v2.1: avval sahifalar', conduit: 'Conduit misoli', nomlar: 'Qatlam — global nomlar maydoni', kochirish: 'Pastga tushirish', steiger: 'Steiger', xulosa: 'Xulosa' };
  const hold = { L2: 0.6, L3: 1.0, L4: 0.6, L5: 1.2, L6: 0.8, L8: 1.0, L9: 0.8, L10: 1.2, L11: 0.6, L12: 1.2, L13: 0.8, L14: 1.4, L15: 1.2, L16: 0.8, L17: 0.6, L18: 1.0, L19: 0.8, L20: 1.2, L21: 1.4, L22: 1.6, L23: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining ikkinchi bobi. FSD 2.1 versiyasining asosiy g‘oyasi — sahifadan boshlashni ko‘rib chiqamiz.'],

    ['L2', 'v20', 'Avvalgi, 2.0 versiyada FSD interfeysdagi entity va feature’larni topishdan boshlashni tavsiya qilardi.'],
    ['L3', 'v20', 'Keyin ulardan widget’lar, widget’lardan esa sahifalar yig‘ilardi. Ya’ni bino pastdan yuqoriga qurilardi.'],

    ['L4', 'v21', '2.1 versiyadagi asosiy o‘zgarish — yangi fikrlash modeli: avval sahifalar.'],
    ['L5', 'v21', 'Ilovani avval sahifalarga bo‘lasiz. Har bir sahifa o‘z interfeysi, so‘rovlari va holatini o‘z ichida saqlaydi. Umumiy poydevor esa shared qatlamida.'],
    ['L6', 'v21', 'Bu buzuvchi o‘zgarish emas: 2.0 versiyada yozilgan loyiha 2.1 da ham to‘g‘ri hisoblanadi.'],

    ['L7', 'conduit', 'Rasmiy qo‘llanmadagi misol — Conduit, ya’ni Medium blog platformasining oddiy nusxasi.'],
    ['L8', 'conduit', 'Unda oltita sahifa bor: maqolalar lentasi, kirish, maqolani o‘qish, tahrirlash, profil va sozlamalar.'],
    ['L9', 'conduit', 'Kirish va ro‘yxatdan o‘tish deyarli bir xil, shuning uchun ular bitta slice’da turadi.'],
    ['L10', 'conduit', 'Qo‘llanma aytadi: butun ilova katta ehtimol bilan uchta qatlamga sig‘adi — app, pages va shared.'],

    ['L11', 'nomlar', 'Nega bunday? Rasmiy hujjat eslatadi: qatlam o‘zidagi slice’lar uchun global nomlar maydoniga o‘xshaydi.'],
    ['L12', 'nomlar', 'Bir joyda ishlatiladigan o‘zgaruvchini global qilmaysiz. Xuddi shunday, bitta sahifaga kerak kodni features yoki entities qatlamiga chiqarmang.'],

    ['L13', 'kochirish', 'Unda kod qachon pastga tushadi? Maqola kartasi avval faqat lenta sahifasida yashaydi.'],
    ['L14', 'kochirish', 'Keyin profil sahifasiga ham xuddi shu karta kerak bo‘ldi. Endi, va faqat endi, uni pastga tushirasiz.'],
    ['L15', 'kochirish', 'Karta entities qatlamidagi article slice’iga ko‘chadi. Ikkala sahifa uni public API orqali import qiladi.'],
    ['L16', 'kochirish', 'Rasmiy qoida shunday: biznes mantig‘i bir nechta sahifada kerak bo‘lsa, uni pastki qatlamga ko‘chirish mumkin.'],
    ['L17', 'kochirish', 'Faqat bitta sahifa ishlatsa, kod sahifada qoladi.'],

    ['L18', 'steiger', 'Bu xatolarni Steiger linteri ham ushlaydi. Mana, 2.0 uslubida yozilgan Conduit bo‘lagi.'],
    ['L19', 'steiger', 'Profil sahifasi kartani lenta sahifasidan import qilgan. Bir qatlamdagi slice’lar orasida import taqiqlangan.'],
    ['L20', 'steiger', 'Article entity va like-article feature esa faqat bitta joyda, lenta sahifasida ishlatilgan. Steiger ularni sahifa bilan birlashtirishni maslahat beradi.'],
    ['L21', 'steiger', 'Karta entities qatlamiga ko‘chirilib, bir martalik kod sahifaga qaytgach, Steiger hech qanday muammo topmaydi.'],

    ['L22', 'xulosa', 'Xulosa qilsak: avval sahifalar, poydevor shared qatlamida, qayta ishlatish paydo bo‘lganda esa pastga tushirish.'],
    ['L23', 'xulosa', 'Keyingi bobda qatlamlarni batafsil ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

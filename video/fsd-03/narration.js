// FSD 3-bob videosi: "Qatlamlar" (content/fsd/03-qatlamlar.md). Ovoz — Kore, metafora — bino (FSD-VIDEO-USLUBI.md).
// Da'volar manbasi (feature-sliced.design): reference/layers (7 qatlam, "from most responsibility and dependency to least",
// har qatlam tavsifi, "strictly below", App va Shared — "both a layer and a slice", "segments can import each other freely",
// "You don't have to use every layer", "Adding new layers is not recommended"). Steiger chiqishi — steiger-xato.txt
// (namuna-xato/: widget -> widget, widget -> pages, processes, core/) va steiger-toza.txt (namuna/), steiger 0.7.0, plugin 0.8.0.
(function (g) {
  const scenes = ['intro', 'tartib', 'qatlamlar', 'import', 'istisno', 'tanlash', 'steiger', 'xulosa'];
  const sceneNames = { intro: 'Kirish', tartib: 'Mas’uliyat tartibi', qatlamlar: 'Yettita qatlam', import: 'Import qoidasi', istisno: 'app va shared — istisno', tanlash: 'Qaysi qatlamlar kerak', steiger: 'Steiger', xulosa: 'Xulosa' };
  const hold = { L2: 0.6, L3: 1.0, L4: 0.6, L5: 0.8, L6: 0.6, L7: 0.6, L8: 0.6, L9: 0.6, L10: 1.0, L11: 0.8, L12: 1.0, L13: 1.4, L14: 0.6, L15: 1.4, L16: 1.0, L17: 0.6, L18: 1.2, L19: 0.6, L20: 1.2, L21: 1.0, L22: 1.4, L23: 1.6, L24: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining uchinchi bobi — qatlamlar. Har bir qatlam nima uchun kerakligini va kim kimni import qila olishini ko‘ramiz.'],

    ['L2', 'tartib', 'Qatlam — src papkasi ichidagi standart nomli papka. Jami yettita qatlam bor, ular mas’uliyat va bog‘liqlik bo‘yicha tartiblangan.'],
    ['L3', 'tartib', 'Eng yuqoridagisi ko‘p narsani biladi va ko‘p narsaga bog‘liq. Pastga tushgan sari qatlam kamroq narsaga bog‘liq bo‘ladi.'],

    ['L4', 'qatlamlar', 'Eng tepada app: provayderlar, marshrutlar va analitika kabi butun ilovaga tegishli narsalar.'],
    ['L5', 'qatlamlar', 'Processes qatlami eskirgan. Uning tarkibini features va app qatlamlariga ko‘chirish tavsiya qilinadi.'],
    ['L6', 'qatlamlar', 'Pages — ilova ekranlari. Odatda har sahifa bitta slice: yuklanish holati, xatolar va ma’lumot so‘rovlari bilan birga.'],
    ['L7', 'qatlamlar', 'Widgets — katta mustaqil interfeys bloklari. Ular bir nechta sahifada qayta ishlatilganda eng foydali.'],
    ['L8', 'qatlamlar', 'Features — ilovadagi asosiy foydalanuvchi harakatlari. Ular ko‘pincha biznes obyektlari bilan ishlaydi.'],
    ['L9', 'qatlamlar', 'Entities — loyiha ishlaydigan real biznes tushunchalari: masalan, foydalanuvchi yoki maqola.'],
    ['L10', 'qatlamlar', 'Eng pastda shared — ilova poydevori. Unda biznes yo‘q: interfeys to‘plami, API klient va sozlamalar.'],

    ['L11', 'import', 'Asosiy qoida: slice faqat o‘zidan qat’iy pastdagi qatlamlardagi slice’larni import qila oladi.'],
    ['L12', 'import', 'Masalan, header widgeti features, entities va shared qatlamlaridan import qiladi. Bu to‘g‘ri.'],
    ['L13', 'import', 'Lekin u boshqa widgetdan yoki yuqoridagi pages qatlamidan import qilsa, qoida buziladi.'],

    ['L14', 'istisno', 'Ikki istisno bor: app va shared. Ular bir vaqtning o‘zida ham qatlam, ham slice.'],
    ['L15', 'istisno', 'Ularning ichida slice yo‘q, to‘g‘ridan-to‘g‘ri segmentlar bor. Shuning uchun segmentlar bir-birini erkin import qiladi: masalan, shared ichida ui lib’dan.'],

    ['L16', 'tanlash', 'Hamma qatlamni ishlatish shart emas. Ko‘pchilik loyihalarda kamida shared, pages va app bo‘ladi.'],
    ['L17', 'tanlash', 'Qolganlari haqiqatan kerak bo‘lganda qo‘shiladi.'],
    ['L18', 'tanlash', 'Yangi qatlam qo‘shish esa tavsiya etilmaydi, chunki qatlamlarning ma’nosi standart.'],

    ['L19', 'steiger', 'Steiger bilan tekshiramiz. Mana, xatolar ataylab kiritilgan loyiha.'],
    ['L20', 'steiger', 'Header boshqa widgetdan import qildi — bu xato. Pages qatlamidan importni Steiger ogohlantirish sifatida belgiladi.'],
    ['L21', 'steiger', 'Eskirgan processes qatlami ham xato beradi.'],
    ['L22', 'steiger', 'Lekin e’tibor bering: o‘zimiz qo‘shgan core papkasini Steiger ushlamadi. Bunday xatoni o‘zingiz kuzatasiz.'],
    ['L23', 'steiger', 'Tuzatilgan loyihada muammo yo‘q. Shared ichida ui lib’dan import qilgani ham xato emas.'],

    ['L24', 'xulosa', 'Xulosa qilsak: yettita qatlam yuqoridan pastga tartiblangan, import faqat pastga, app va shared esa istisno.'],
    ['L25', 'xulosa', 'Keyingi bobda slice’larni ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

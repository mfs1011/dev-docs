// FSD 4-bob videosi: "Slice'lar" (content/fsd/04-slicelar.md). Ovoz — Kore, metafora — bino (FSD-VIDEO-USLUBI.md).
// Da'volar manbasi (feature-sliced.design): reference/slices-segments ("group code by its meaning for the product, business",
// "names of slices are not standardized", "Shared and App don't contain slices", "zero coupling", "high cohesion",
// "must contain a public API definition", "can only reference the public API", slice groups — "same isolation rules").
// Steiger chiqishi — steiger-xato.txt (namuna-xato/: cross-import, order/orders, wishlist'da index.ts yo'q) va
// steiger-toza.txt (namuna/), steiger 0.7.0, plugin 0.8.0. Slice ichidagi absolyut importni recommended sozlama ushlamadi — videoda yo'q.
(function (g) {
  const scenes = ['intro', 'tarif', 'ideal', 'api', 'guruh', 'steiger', 'xulosa'];
  const sceneNames = { intro: 'Kirish', tarif: 'Slice nima', ideal: 'Ideal slice', api: 'Public API', guruh: 'Slice guruhlari', steiger: 'Steiger', xulosa: 'Xulosa' };
  const hold = { L2: 0.6, L3: 1.2, L4: 0.8, L5: 1.2, L6: 0.4, L7: 1.2, L8: 1.4, L9: 1.0, L10: 1.4, L11: 1.4, L12: 0.6, L13: 1.2, L14: 1.2, L15: 1.4, L16: 1.6, L17: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining to‘rtinchi bobi — slice’lar. Ular nima, qanday bo‘lishi kerak va qaysi xatolar uchrashini ko‘rib chiqamiz.'],

    ['L2', 'tarif', 'Slice — FSD tuzilmasidagi ikkinchi daraja. U kodni mahsulot yoki biznes uchun ma’nosiga qarab guruhlaydi.'],
    ['L3', 'tarif', 'Binoda bu qavat ustidagi xonalar: masalan, entities qatlamida product va order, features qatlamida add-to-cart va wishlist.'],
    ['L4', 'tarif', 'Slice nomlari standart emas. Ular to‘g‘ridan-to‘g‘ri ilovangizning biznes sohasidan kelib chiqadi.'],
    ['L5', 'tarif', 'Slice’lar faqat pages, widgets, features va entities qatlamlarida bo‘ladi. Shared va app qatlamlarida slice yo‘q.'],

    ['L6', 'ideal', 'Ideal slice qanday bo‘ladi? Rasmiy hujjat ikki xususiyatni aytadi.'],
    ['L7', 'ideal', 'Birinchisi — nol bog‘lanish. Slice o‘z qatlamidagi boshqa slice’larga bog‘liq emas: add-to-cart wishlist’ni bilmaydi.'],
    ['L8', 'ideal', 'Ikkinchisi — yuqori bog‘liqlik. Slice o‘z vazifasiga oid kodning ko‘p qismini o‘zida saqlaydi: savatga qo‘shish tugmasi, so‘rovi va holati bitta xonada.'],

    ['L9', 'api', 'Har bir slice’da public API bo‘lishi shart. Odatda bu index.ts fayli — xonaning kirish eshigi.'],
    ['L10', 'api', 'Tashqaridagi kod faqat shu eshik orqali kiradi va slice ichidagi fayllar tuzilishiga murojaat qilmaydi.'],

    ['L11', 'guruh', 'Bir-biriga yaqin slice’larni bitta papkaga guruhlash mumkin. Lekin ular ham boshqa slice’lar kabi alohida turadi, papkada esa umumiy kod bo‘lmaydi.'],

    ['L12', 'steiger', 'Steiger bilan tekshiramiz. Mana, xatolar kiritilgan do‘kon loyihasi.'],
    ['L13', 'steiger', 'Birinchi xato: add-to-cart wishlist’dan import qildi. Bir qatlamdagi slice’lar orasida import taqiqlangan.'],
    ['L14', 'steiger', 'Ikkinchi xato: entities ichida product birlikda, orders esa ko‘plikda. Steiger nomlarni bir xil qilishni so‘raydi.'],
    ['L15', 'steiger', 'Uchinchi xato: wishlist’da public API yo‘q. Steiger unga ichki fayl orqali kirilgan uchta joyni ham ko‘rsatadi.'],
    ['L16', 'steiger', 'Xatolar tuzatilgach, Steiger hech qanday muammo topmaydi.'],

    ['L17', 'xulosa', 'Xulosa qilsak: slice — biznes ma’nosi bo‘yicha xona. U qo‘shnilaridan mustaqil, o‘z vazifasini o‘zida saqlaydi, kirish esa faqat public API orqali.'],
    ['L18', 'xulosa', 'Keyingi bobda segmentlarni ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

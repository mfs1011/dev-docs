// FSD 5-bob videosi: "Segmentlar" (content/fsd/05-segmentlar.md). Ovoz — Kore, metafora — bino (FSD-VIDEO-USLUBI.md).
// Da'volar manbasi (feature-sliced.design): reference/slices-segments — Segments ("third and final level", "technical nature",
// ui/api/model/lib/config tavsiflari, o'z segmentlari — ko'pincha App va Shared'da, nom — "purpose", components/hooks/types — yomon).
// Steiger chiqishi — steiger-xato.txt (namuna-xato/: components, constants, hooks, types, utils) va steiger-toza.txt (namuna/),
// steiger 0.7.0, plugin 0.8.0, fsd/segments-by-purpose.
(function (g) {
  const scenes = ['intro', 'tarif', 'beshta', 'ozingiz', 'nom', 'steiger', 'xulosa'];
  const sceneNames = { intro: 'Kirish', tarif: 'Segment nima', beshta: 'Beshta odatiy segment', ozingiz: 'O‘z segmentlaringiz', nom: 'Nom — maqsad', steiger: 'Steiger', xulosa: 'Xulosa' };
  const hold = { L2: 0.6, L3: 1.2, L4: 0.6, L5: 0.6, L6: 0.6, L7: 0.6, L8: 1.2, L9: 1.4, L10: 0.8, L11: 1.4, L12: 0.6, L13: 1.6, L14: 1.6, L15: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining beshinchi bobi — segmentlar. Ular xona ichida kodni qanday tartiblashini ko‘ramiz.'],

    ['L2', 'tarif', 'Segment — FSD tuzilmasidagi uchinchi va oxirgi daraja. U kodni texnik vazifasiga qarab guruhlaydi.'],
    ['L3', 'tarif', 'Binoda segment — xona ichidagi kub. Masalan, apply-promo-code, ya’ni promokod qo‘llash feature’ining ichi.'],

    ['L4', 'beshta', 'Odatiy segmentlar beshta. Birinchisi ui: ko‘rinishga oid hamma narsa, ya’ni komponentlar, sana formatlovchilari va stillar.'],
    ['L5', 'beshta', 'api — backend bilan aloqa: so‘rov funksiyalari, ma’lumot tiplari va mapperlar.'],
    ['L6', 'beshta', 'model — ma’lumot modeli: sxemalar, interfeyslar, store’lar va biznes mantiqi.'],
    ['L7', 'beshta', 'lib — shu slice’dagi boshqa modullarga kerak bo‘lgan yordamchi kod.'],
    ['L8', 'beshta', 'config — konfiguratsiya fayllari va feature flag’lar.'],

    ['L9', 'ozingiz', 'O‘z segmentingizni ham yaratish mumkin. Ular ko‘pincha app va shared qatlamlarida bo‘ladi, chunki u yerda slice yo‘q.'],

    ['L10', 'nom', 'Asosiy qoida: segment nomi ichidagi kodning maqsadini aytsin, mohiyatini emas.'],
    ['L11', 'nom', 'Components, hooks yoki types kabi nomlar yomon. Ular kod nima ekanini aytadi, kerakli kodni qidirishda esa yordam bermaydi.'],

    ['L12', 'steiger', 'Steiger buni tekshiradi. Mana, segmentlari mohiyat bo‘yicha nomlangan promokod feature’i.'],
    ['L13', 'steiger', 'Components, constants, hooks, types va utils — beshalasiga bir xil xato: nom maqsadni bildirishi kerak.'],
    ['L14', 'steiger', 'Segmentlar ui, model, lib va config deb nomlangach, Steiger hech qanday muammo topmaydi.'],

    ['L15', 'xulosa', 'Xulosa qilsak: segment — xona ichidagi kub. Beshta odatiy nom bor, har qanday nom esa maqsadni bildiradi.'],
    ['L16', 'xulosa', 'Keyingi bobda import qoidasi va public API’ni batafsil ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

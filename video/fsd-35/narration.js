// FSD 35-bob videosi: "FSD'da testlash" (content/fsd/35-testlash.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'test_turlari_va_joylashuv', 'soxtalar_va_shared_testing', 'steiger_testlarda', 'komponent_testi_misoli', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: FSD Arxitekturasida Testlash Falsafasi',
    test_turlari_va_joylashuv: 'Test Turlari va Papka Daraxti',
    soxtalar_va_shared_testing: 'Soxta Ma\'lumotlar va shared/testing Qatlami',
    steiger_testlarda: 'Steiger Test Fayllarini Ham Tekshiradi',
    komponent_testi_misoli: 'Komponent Testi va MSW Integratsiyasi',
    tipik_xatolar: 'Testlashdagi Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L5: 1.2,
    L7: 1.2,
    L9: 1.2,
    L11: 1.2,
    L13: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz beshinchi bobi — FSD arxitekturasida unit, komponent va integratsion testlarni to'g'ri tashkil qilish."],
    ['L2', 'intro', "Asosiy tamoyil: test har doim o'zi tekshiradigan kod yonida turishi kerak; slice ko'chsa, testlar ham u bilan birga ko'chadi."],

    ['L3', 'test_turlari_va_joylashuv', "Sof biznes funksiyalari lib papkasida format-prays nuqta test nuqta te-es kabi birlik testlar bilan qamrab olinadi."],
    ['L4', 'test_turlari_va_joylashuv', "Komponent testlari bevosita komponent yonida, sahifa integratsiyasi esa slice ichidagi test papkasida saqlanadi."],
    ['L5', 'test_turlari_va_joylashuv', "Butun tizimni tekshiruvchi Playwright E2E testlari esa src dan tashqarida, ildizdagi e2e papkasida yashaydi."],

    ['L6', 'soxtalar_va_shared_testing', "API soxtalari va MSW serveri uchun shared testing alohida segmenti ochiladi va public API orqali eksport qilinadi."],
    ['L7', 'soxtalar_va_shared_testing', "Diqqat: shared api mocks yoki fixtures deb nomlash qat'iyan taqiqlanadi, chunki Steiger bu nomlarni rad etadi."],

    ['L8', 'steiger_testlarda', "Stayger test fayllarini oddiy dastur kodi kabi to'liq tahlil qiladi va qatlamlar chegarasini qat'iy nazorat qiladi."],
    ['L9', 'steiger_testlarda', "Bir slice testi boshqa slicening ichki fayliga kirsa yoki boshqa sahifani import qilsa, linter darhol xatolik chiqaradi."],

    ['L10', 'komponent_testi_misoli', "Komponent testida server shared testing dan public API orqali, komponent esa nisbiy yo'l bilan import qilinadi."],
    ['L11', 'komponent_testi_misoli', "Vitest va Testing Library yordamida tugma bosilganda soxta tarmoq so'rovi yuborilishi va holat yangilanishi tekshiriladi."],

    ['L12', 'tipik_xatolar', "Tipik xatolar — barcha testlarni bitta global tests papkasiga to'plash va testlar ichida public API ni chetlab o'tishdir."],
    ['L13', 'tipik_xatolar', "Shuningdek, faqat E2E testlariga suyanib, tezkor va arzon unit hamda komponent testlariga e'tibor bermaslik xatodir."],

    ['L14', 'xulosa', "Xulosa: To'g'ri izolyatsiya qilingan FSD slicelari testlarni barqaror, oson va ishonchli yozish imkonini beradi."],
    ['L15', 'xulosa', "Keyingi o'ttiz oltinchi bobda mavjud loyihalarni FSD ga xavfsiz va bosqichma-bosqich migratsiya qilishni ko'ramiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, sifatli testlar yozishda davom eting!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

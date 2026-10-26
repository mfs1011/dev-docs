// FSD 34-bob videosi: "ESLint, TypeScript va alias'lar" (content/fsd/34-eslint-va-alias.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'alias_sozlamalari', 'no_restricted_imports', 'boundaries_plagini', 'natijalar_va_ide', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: ESLint, TypeScript va Steiger Uyg\'unligi',
    alias_sozlamalari: 'tsconfig va Bundler Aliaslar Intizomi',
    no_restricted_imports: 'Public API Himoyasi: no-restricted-imports',
    boundaries_plagini: 'eslint-plugin-boundaries va Qatlamlar Ierarxiyasi',
    natijalar_va_ide: 'IDE da Real Vaqtli Himoya va Natijalar',
    tipik_xatolar: 'Alias va ESLint dagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz to'rtinchi bobi — ESLint, TypeScript va aliaslar yordamida FSD arxitekturasini IDE darajasida himoya qilish."],
    ['L2', 'intro', "Steiger butun arxitekturani CI da tekshirsa, ESLint kod yozish paytida IDE da xatolarni darhol qizil bilan ko'rsatib beradi."],

    ['L3', 'alias_sozlamalari', "Barcha freymvorklarda et belgisi src katalogiga to'g'ri ulanishi va te-es-konfig da paths ko'rsatilishi shart."],
    ['L4', 'alias_sozlamalari', "Masalan, Next.js dagi sukut bo'yicha beriladigan nuqta yulduzcha yo'lini darhol nuqta src yulduzchaga o'zgartirish kerak."],
    ['L5', 'alias_sozlamalari', "Taypskript oltida baseUrl shart emas, barcha linterlar va IDE lar paths orqali public API larni aniq tushunadi."],

    ['L6', 'no_restricted_imports', "IDE larning avto-importi ko'pincha public API o'rniga eng chuqur ichki fayllarni tanlab yuboradi."],
    ['L7', 'no_restricted_imports', "ESLint ning no-restricted-imports qoidasi va regex shabloni orqali slice ichki fayllariga to'g'ridan kirish darhol taqiqlanadi."],

    ['L8', 'boundaries_plagini', "Boundaries plaginining yettinchi versiyasi qatlamlar yo'nalishini va cross-importlarni to'liq nazorat qiladi."],
    ['L9', 'boundaries_plagini', "Har bir qatlam faqat o'zidan pastdagilarni ko'radi, features dan features ga yoki entities dan yuqoriga import qilish qat'iy to'xtatiladi."],

    ['L10', 'natijalar_va_ide', "Dasturchi xato import yozgan soniyadayoq IDE da qizil chiziq paydo bo'ladi va sababi tushuntiriladi."],
    ['L11', 'natijalar_va_ide', "Bu esa xatolarni CI ga yetib bormasdan, kod yozish jarayonining o'zidayoq bartaraf etishni ta'minlaydi."],

    ['L12', 'tipik_xatolar', "Tipik xatolar — faqat bandler aliasini sozlab, te-es-konfig dagi paths ni unutish va eski boundaries sintaksisidan nusxa olishdir."],
    ['L13', 'tipik_xatolar', "Shuningdek, te-es resolverni o'rnatmaslik tufayli ESLint ning et belgisi bilan boshlangan yo'llarni taniy olmasligidir."],

    ['L14', 'xulosa', "Xulosa: Steiger va ESLint birgalikda FSD intizomini ham tahrirlashda, ham CI da yuz foiz kafolatlaydi."],
    ['L15', 'xulosa', "Keyingi o'ttiz beshinchi bobda FSD arxitekturasida testlash strategiyasini o'rganamiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, bilim olishdan to'xtamang!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

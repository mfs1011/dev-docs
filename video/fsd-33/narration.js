// FSD 33-bob videosi: "Steiger" (content/fsd/33-steiger.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'ornatish_va_bayroqlar', 'asosiy_qoidalar', 'konfiguratsiya_va_istisnolar', 'ci_va_katta_loyihalar', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Steiger — FSD Arxitektura Linteri',
    ornatish_va_bayroqlar: 'O\'rnatish va CLI Bayroqlari',
    asosiy_qoidalar: 'Tavsiya Etilgan O\'n Yetti Qoida',
    konfiguratsiya_va_istisnolar: 'steiger.config.ts va Aniq Istisnolar',
    ci_va_katta_loyihalar: 'CI Integratsiyasi va Bosqichma-bosqich Joriy Qilish',
    tipik_xatolar: 'Steiger Foydalanishidagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz uchinchi bobi — FSD ning rasmiy arxitektura linteri Steiger haqida to'liq amaliy qo'llanma."],
    ['L2', 'intro', "Qoidalar faqat kelishuvda qolsa, loyiha bir oyda buziladi; Steiger ularni tekshirishni CI tizimida majburiy va qat'iy qiladi."],

    ['L3', 'ornatish_va_bayroqlar', "Steiger va uning rasmiy plaginini o'rnatib, src papkasi ustida oddiy buyruq bilan bir marta yoki watch rejimida yurgizish mumkin."],
    ['L4', 'ornatish_va_bayroqlar', "Fiks bayrog'i yetishmayotgan public API larni avtomatik tuzatadi, reporter jeyson esa CI uchun mashina tushunadigan hisobot beradi."],
    ['L5', 'ornatish_va_bayroqlar', "Agar bitta xato topilsa ham, Steiger birinchi chiqish kodi bilan tugaydi va CI da nosoz pull requestni darhol to'xtatadi."],

    ['L6', 'asosiy_qoidalar', "Tavsiya etilgan to'plamdagi o'n yetti qoida yuqoriga import, cross-import va public API ni chetlab o'tishni to'liq ushlaydi."],
    ['L7', 'asosiy_qoidalar', "Segments-by-purpose qoidasi esa components, utils yoki services kabi eski tur nomlarini keskin taqiqlaydi."],

    ['L8', 'konfiguratsiya_va_istisnolar', "Loyiha ildizidagi stayger konfig faylida qoidalarga ESLint flat konfig kabi fayllar bo'yicha istisno berish mumkin."],
    ['L9', 'konfiguratsiya_va_istisnolar', "Masalan, app qatlamidagi providers papkasi yoki Next.js dagi pastki chiziqli qatlamlar uchun qoidani asoslangan holda o'chiramiz."],

    ['L10', 'ci_va_katta_loyihalar', "GitHub Actions da lint fsd skripti npm ci dan so'ng darhol ishga tushib, kod sifatini nazorat qiladi."],
    ['L11', 'ci_va_katta_loyihalar', "Katta loyihalarga kiritishda avval ignore-warnings bilan faqat xatolarni ko'rib, bosqichma-bosqich bartaraf etish tavsiya qilinadi."],

    ['L12', 'tipik_xatolar', "Tipik xatolar — Steigerni faqat lokalda ushlab, CI ga qo'shmaslik va xatolarni tahlil qilmasdan qoidalarni shunchaki o'chirib tashlashdir."],
    ['L13', 'tipik_xatolar', "Shuningdek, te-es-konfig da et aliasi noto'g'ri sozlansa, Steiger importlarni topolmay, soxta xatolar chiqaradi."],

    ['L14', 'xulosa', "Xulosa: Steiger — jamoada FSD intizomini saqlash va arxitektura buzilishining oldini olish uchun eng ishonchli vositadir."],
    ['L15', 'xulosa', "Keyingi o'ttiz to'rtinchi bobda ESLint, TypeScript va aliaslar sozlamalarini Steiger bilan birga integratsiya qilamiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, FSD arxitekturasini mustahkam o'rganishda davom eting!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// FSD 18-bob videosi: "Ortiqcha entity'lar" (content/fsd/18-ortiqcha-entitylar.md). Ovoz — Kore, metafora — me'yor, yupqa klient va kechiktirilgan dekompozitsiya.
(function (g) {
  const scenes = ['intro', 'nolinchi_qoida', 'oldindan_bolmaslik', 'crud_va_auth', 'yagona_kontekst', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Ortiqcha Entity’lar Muammosi',
    nolinchi_qoida: 'Nolinchi Qoida: Entity’siz Loyiha',
    oldindan_bolmaslik: 'Oldindan Bo‘linmaslik va Ko‘chirish',
    crud_va_auth: 'CRUD va Auth Qayerda Turishi Kerak?',
    yagona_kontekst: 'Birlashtirilgan Bounded Context',
    steiger: 'Steiger Nazorati va Toza Iyerarxiya',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L13: 1.2,
    L15: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n sakkizinchi bobi — Ortiqcha entity'lar. Bugun entities qatlamidan qachon va qanday to'g'ri foydalanishni, hamda keraksiz entity'lar yaratish tuzog'idan qochishni ko'rib chiqamiz."],
    ['L2', 'intro', "Entities — FSD da eng keng ochiq qatlam: undan feature, widget va sahifalar to'g'ridan-to'g'ri foydalanishi mumkin, shu sababli bu yerdagi har bir xato butun loyihaga keng ta'sir qiladi."],

    ['L3', 'nolinchi_qoida', "Rasmiy FSD ning eng muhim nolinchi qoidasi shuki: loyihada umuman entities qatlami bo'lmasligi mutlaqo tabiiy va normal holatdir."],
    ['L4', 'nolinchi_qoida', "Ayniqsa admin panellar va oddiy ma'lumot ko'rsatuvchi yupqa klientlarda barcha CRUD so'rovlari shared orqali bajarilib, ortiqcha entity'larga ehtiyoj qolmaydi."],

    ['L5', 'oldindan_bolmaslik', "Birinchi qoida: kodni oldindan entity qilib ajratmang. Avval mantiqni uni ishlatayotgan sahifa yoki feature modelida yozing."],
    ['L6', 'oldindan_bolmaslik', "Qachonki ikkinchi bir sahifa ham xuddi shu hisob-kitob qoidasini so'rasagina, mantiqni sof TypeScript funksiyasi sifatida entities ga ko'chiring."],
    ['L7', 'oldindan_bolmaslik', "Bu kechiktirilgan dekompozitsiya usuli loyihani boshlang'ich kunda o'nlab bo'sh va foydasiz entity'lar bilan to'lib ketishidan asraydi."],

    ['L8', 'crud_va_auth', "Ikkinchi va uchinchi qoidalar: oddiy CRUD so'rovlari entity ichiga kiritilmaydi, ular shared/api papkasida saqlanadi."],
    ['L9', 'crud_va_auth', "To'rtinchi qoida esa autentifikatsiya bilan bog'liq: kirish tokeni va joriy foydalanuvchi ma'lumoti entities/user da emas, balki shared/auth da turishi shart."],
    ['L10', 'crud_va_auth', "Agar auth ma'lumoti entities ga qo'yilsa, shared qatlamining unga bog'lanishi yuzaga kelib, butun qatlamlar iyerarxiyasi buziladi."],

    ['L11', 'yagona_kontekst', "Beshinchi qoida: entity'larni haddan tashqari maydalab, order, order-item va customer kabi bo'laklarga ajratib tashlamang."],
    ['L12', 'yagona_kontekst', "Bunday maydalash ular o'rtasida ko'plab at x belgilarini talab qiladi va arxitekturani qotirib qo'yadi."],
    ['L13', 'yagona_kontekst', "Buning o'rniga ularni yagona order-info domen kontekstiga jamlash orqali toza va oson boshqariladigan slice hosil qilinadi."],

    ['L14', 'steiger', "Steiger linteri entities qatlamidagi noo'rin bog'liqliklarni va arxitektura buzilishlarini avtomatik kuzatib boradi."],
    ['L15', 'steiger', "Entity'lar o'z o'rnida me'yorida qo'llanilganda, linter barcha qatlamlarni toza holatda tasdiqlaydi."],

    ['L16', 'xulosa', "Xulosa qilsak: oldindan entity ochmang, CRUD va auth'ni shared ga qoldiring va me'yorni saqlang. Keyingi bobda kod qayerga borishini hal qiluvchi qaror daraxtini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

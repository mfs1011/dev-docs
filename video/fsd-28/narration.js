// FSD 28-bob videosi: "Next.js shabloni" (content/fsd/28-nextjs-shabloni.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'toqnashuv_va_yechim', 'steiger_linteri', 'reexport_va_next16', 'server_klient_public_api', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Next.js va FSD Arxitekturasi',
    toqnashuv_va_yechim: 'Papka To\'qnashuvi va _app / _pages Yechimi',
    steiger_linteri: 'Steiger Linteri va Typo Qoidasini Sozlash',
    reexport_va_next16: 'Ildizda Re-export va Next 16 Xususiyatlari',
    server_klient_public_api: 'Server va Klient Chegarasi: index.server.ts',
    tipik_xatolar: 'Next.js FSD da Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L5: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma sakkizinchi bobi — Next.js va App Router uchun ishlab chiqarish shabloni. Bugun Next.js 16, server komponentlari va Turbopack muhitida FSD qatlamlarini to'g'ri tashkil etishni o'rganamiz."],
    ['L2', 'intro', "Next.js ning fayl asosidagi marshrutlash tizimi FSD qatlam nomlari bilan to'qnashadi, lekin buni hal qilishning juda oson rasmiy usuli bor."],

    ['L3', 'toqnashuv_va_yechim', "Next.js loyiha ildizidagi app va pages kataloglarini router uchun band qiladi. FSD da esa bu nomlar asosiy qatlamlardir."],
    ['L4', 'toqnashuv_va_yechim', "Rasmiy yechim quyidagicha: ildizdagi app katalogi faqat re-export vazifasini bajaradi, butun dastur kodi esa src papkasida yashaydi."],
    ['L5', 'toqnashuv_va_yechim', "Nomlar chalkashmasligi uchun src ichida app va pages qatlamlari tag chiziq bilan _app va _pages deb nomlanadi."],

    ['L6', 'steiger_linteri', "Steiger linteri _app va _pages nomlarini xato deb hisoblamasligi uchun steiger konfig faylida typo-in-layer-name qoidasi o'chiriladi."],
    ['L7', 'steiger_linteri', "Muhimi, linter boshqa barcha FSD qoidalarini, jumladan qatlamlar ierarxiyasi va taqiqlangan kross-importlarni to'liq nazorat qiladi."],

    ['L8', 'reexport_va_next16', "Ildizdagi app page nuqta te-iks sahifa kodi va metama'lumotlarni _pages home dan olib to'g'ridan-to'g'ri re-export qiladi."],
    ['L9', 'reexport_va_next16', "Next 16 versiyasida eski middleware o'rniga proxy nuqta te-es kiritilgan bo'lib, u loyiha ildizida joylashadi."],
    ['L10', 'reexport_va_next16', "Shuningdek, dinamik marshrutlarda sahifa parametrlari endilikda Promise ko'rinishida keladi va await orqali o'qiladi."],

    ['L11', 'server_klient_public_api', "Server komponentlari xavfsizligi uchun maxsus server-only funksiyalar slice ichida index nuqta server nuqta te-es faylida eksport qilinadi."],
    ['L12', 'server_klient_public_api', "Klient komponentlar esa umumiy index nuqta te-es dan foydalanadi, bu esa maxfiy server kodining brauzerga sizib chiqishini to'xtatadi."],

    ['L13', 'tipik_xatolar', "Eng katta xato — ildizdagi app page nuqta te-iks ichiga yuzlab qator komponent kodini yozib, FSD nazoratidan chiqib ketishdir."],
    ['L14', 'tipik_xatolar', "Yana bir xato — tsconfig da et belgisini src ga yo'naltirmaslik yoki server kodlarini klient public API siga aralashtirishdir."],

    ['L15', 'xulosa', "Xulosa: Next.js ildizini faqat re-export uchun qoldiring, kodni _app va _pages orqali modullashtiring hamda server chegaralarini qat'iy saqlang."],
    ['L16', 'xulosa', "Keyingi bobda Vue 3 va Vite uchun FSD ishlab chiqarish shablonini batafsil tahlil qilamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

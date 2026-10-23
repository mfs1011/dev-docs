// FSD 12-bob videosi: "app" (content/fsd/12-app.md). Ovoz — Kore, metafora — bino cho'qqisi va ishga tushirish.
(function (g) {
  const scenes = ['intro', 'vazifasi', 'segmentlar', 'router_va_ulanish', 'import_qoidasi', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Arxitektura Cho‘qqisi',
    vazifasi: 'App Qatlami Vazifasi',
    segmentlar: 'App Segmentlari: routes, providers, styles',
    router_va_ulanish: 'Router va Kirish Nuqtasi',
    import_qoidasi: "Pastdan Yuqoriga Import Taqiqi",
    steiger: 'Steiger Linteri Nazorati',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n ikkinchi bobi — app qatlami. App — bu arxitektura piramidasining eng yuqori cho'qqisi bo'lib, butun ilovani yig'uvchi va ishga tushiruvchi qatlamdir."],

    ['L2', 'vazifasi', "App qatlami ilovaning texnik sozlamalarini o'z ichiga oladi: kirish nuqtasi, marshrutlar, global stillar va provayderlar."],
    ['L3', 'vazifasi', "Shared qatlami kabi, app qatlami ham slice'larga bo'linmaydi — u to'g'ridan-to'g'ri vazifasiga ko'ra segmentlardan tashkil topadi."],
    ['L4', 'vazifasi', "Eng muhimi: app qatlami faqat yig'ish joyi bo'lib, unda biznes UI yoki murakkab biznes mantiqi yozilmaydi."],

    ['L5', 'segmentlar', "Asosiy segmentlar qatoriga entrypoint, routes, providers va global styles kiradi."],
    ['L6', 'segmentlar', "Providers segmentida TanStack Query mijozi, tema provayderi va xato chegaralari o'rnatiladi."],
    ['L7', 'segmentlar', "Routes segmentida esa sahifalar lazy loading bilan ulanib, markaziy router shakllantiriladi."],

    ['L8', 'router_va_ulanish', "Router konfiguratsiyasida har bir URL sahifalarning index darvozasiga bog'lanadi."],
    ['L9', 'router_va_ulanish', "Marshrut URL konstantalari esa app'da emas, balki shared qatlamida saqlanadi, toki barcha qatlamlar ulardan havola olishi mumkin bo'lsin."],
    ['L10', 'router_va_ulanish', "Entrypoint nuqtasi, masalan main.tsx, provayderlar va routerni ildiz root elementiga ulab ilovani ishga tushiradi."],

    ['L11', 'import_qoidasi', "Arxitekturaning oltin qoidasi: app barcha pastki qatlamlarni import qila oladi, lekin hech bir quyi qatlam app'dan import qila olmaydi."],
    ['L12', 'import_qoidasi', "Masalan, biror sahifa yoki widget app'dan store yoki routerni import qilsa, bu qat'iy arxitektura buzilishi hisoblanadi."],

    ['L13', 'steiger', "Steiger linteri no-higher-layer-imports qoidasi orqali pastki qatlamlarning app'ga murojaat qilmasligini qat'iy tekshiradi."],
    ['L14', 'steiger', "App qatlami toza yig'uvchi bo'lib qolishi butun loyihaning barqaror va testlanuvchan bo'lishini ta'minlaydi."],

    ['L15', 'xulosa', "Xulosa qilsak: app — butun loyihani ishga tushiruvchi boshqaruv pulti, provayderlar va kirish nuqtasidir."],
    ['L16', 'xulosa', "Keyingi bobda yirik loyihalarni tartibga soluvchi slice guruhlari bilan tanishamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

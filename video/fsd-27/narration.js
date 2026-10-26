// FSD 27-bob videosi: "React + Vite shabloni" (content/fsd/27-react-shabloni.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'yaratish_va_sozlash', 'steiger_linteri', 'app_va_provayderlar', 'kompozitsiya_amalda', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: React + Vite Ishlab Chiqarish Shabloni',
    yaratish_va_sozlash: 'Loyihani Yaratish va Konfiguratsiyalar',
    steiger_linteri: 'Steiger Linteri va Qoidalar Sozlamasi',
    app_va_provayderlar: 'App Qatlami: Kirish Nuqtasi va Provayderlar',
    kompozitsiya_amalda: 'Kompozitsiya: Sahifa, Feature va Entity',
    tipik_xatolar: 'Shablon Yaratishdagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma yettinchi bobi — React va Vite uchun to'liq ishlab chiqarish shabloni. Bugun React 19, Vite, TanStack Query va React Router asosida Steiger linteridan to'liq o'tuvchi FSD loyihasini noldan yig'amiz."],
    ['L2', 'intro', "Ushbu shablon 2026-yil talablariga mos keluvchi zamonaviy instrumentlar bilan to'liq tekshirib chiqilgan."],

    ['L3', 'yaratish_va_sozlash', "Birinchi qadam — create-vite yordamida react-ts shablonini yuklab, standart fayllarni FSD qatlamlariga almashtirishdir."],
    ['L4', 'yaratish_va_sozlash', "Boshlang'ich index nuqta html faylida skript yo'li to'g'ridan-to'g'ri src app entrypoint main nuqta te-iks ga qaratiladi."],
    ['L5', 'yaratish_va_sozlash', "Shuningdek, vite konfig va te-es-konfig fayllarida et belgisi src katalogiga alias qilib ulanadi."],

    ['L6', 'steiger_linteri', "Loyiha intizomini saqlash uchun steiger konfig faylida rasmiy FSD plagini ulanadi."],
    ['L7', 'steiger_linteri', "App qatlamidagi maxsus provayderlar segmenti uchun esa segments-by-purpose qoidasiga istisno beriladi."],

    ['L8', 'app_va_provayderlar', "Ilovaning kirish nuqtasi bo'lgan main nuqta te-iks butun tizimni QueryProvider va RouterProvider bilan o'rab oladi."],
    ['L9', 'app_va_provayderlar', "QueryProvider ichida TanStack Query mijozi o'ttiz soniyalik staleTime kesh sozlamasi bilan ishga tushiriladi."],
    ['L10', 'app_va_provayderlar', "Router konfiguratsiyasida esa har bir sahifa mustaqil chunk sifatida faqat o'zining public API faylidan lazy import qilinadi."],

    ['L11', 'kompozitsiya_amalda', "Bosh sahifada to'liq kompozitsiya amalga oshadi: product entity'si kartochkani chizadi, savat feature'si esa unga tugmani joylaydi."],
    ['L12', 'kompozitsiya_amalda', "Bunday arxitekturada entity hech qachon feature'ni bilmaydi, barcha munosabatlar sahifa qatlamida slot orqali birlashadi."],

    ['L13', 'tipik_xatolar', "Eng katta xatolar — eski main nuqta te-iks va App nuqta te-iks fayllarini ildizda qoldirish yoki te-es-konfig'da paths ni unutishdir."],
    ['L14', 'tipik_xatolar', "Shuningdek, src assets papkasini qoldirish linter nazoratidan chetda qoladigan tartibsiz axlatxonani vujudga keltiradi."],

    ['L15', 'xulosa', "Xulosa qilib aytganda, React va Vite loyihasini FSD ga moslash orqali millionlab satr kodda ham boshqariladigan mustahkam arxitekturaga ega bo'lasiz."],
    ['L16', 'xulosa', "Keyingi bobda Next.js va server komponentlarida FSD shablonini qanday to'g'ri qo'llashni o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

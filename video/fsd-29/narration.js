// FSD 29-bob videosi: "Vue + Vite shabloni" (content/fsd/29-vue-shabloni.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'yaratish_va_tuzilma', 'pinia_va_composablelar', 'public_api_va_main', 'slotlar_va_reaktivlik', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Vue 3 + Vite Ishlab Chiqarish Shabloni',
    yaratish_va_tuzilma: 'Loyihani Yaratish va FSD Qatlamlari',
    pinia_va_composablelar: 'Pinia Store va Composable\'lar Joylashuvi',
    public_api_va_main: 'SFC Public API va main.ts Kirish Nuqtasi',
    slotlar_va_reaktivlik: 'Slotlar Orqali Kompozitsiya va Reaktiv Query',
    tipik_xatolar: 'Vue FSD Shabloni Tipik Xatolari',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma to'qqizinchi bobi — Vue 3 va Vite uchun to'liq ishlab chiqarish shabloni. Bugun Vue 3, Pinia, TanStack Vue Query va Vue Router asosida Steiger linteridan to'liq o'tuvchi FSD loyihasini quramiz."],
    ['L2', 'intro', "Ushbu shablon create-vue asosida qurilgan bo'lib, barcha Single File Component lar ichidagi importlar Steiger tomonidan to'liq tekshiriladi."],

    ['L3', 'yaratish_va_tuzilma', "create-vue buyrug'i yordamida loyiha yaratiladi va undagi eski views, components va stores papkalari to'liq o'chiriladi."],
    ['L4', 'yaratish_va_tuzilma', "Buning o'rniga FSD ning qat'iy olti qatlami barpo etilib, App nuqta vue fayli to'g'ridan-to'g'ri src app ichiga ko'chiriladi."],
    ['L5', 'yaratish_va_tuzilma', "create-vue da et belgisi uchun alias allaqachon sozlangan bo'lib, faqat index nuqta html da skript yo'lini main nuqta te-es ga yo'naltirish kifoya."],

    ['L6', 'pinia_va_composablelar', "Eng muhim qoida: alohida markaziy stores yoki composables papkalari taqiqlanadi, chunki ular arxitektura yaxlitligini buzadi."],
    ['L7', 'pinia_va_composablelar', "Har bir Pinia store va composable funksiya o'ziga tegishli slice'ning model yoki lib segmenti ichida saqlanadi."],

    ['L8', 'public_api_va_main', "Vue komponentlari default eksport qilingani sababli, public API faylida export default as ProductCard ko'rinishida nomlanadi."],
    ['L9', 'public_api_va_main', "Kirish nuqtasi bo'lgan main nuqta te-es da Pinia, VueQueryPlugin va router ilovaga ulanadi va mount qilinadi."],
    ['L10', 'public_api_va_main', "Router konfiguratsiyasida esa sahifalar alohida chunk bo'lib yuklanishi uchun dinamik import orqali public API dan olinadi."],

    ['L11', 'slotlar_va_reaktivlik', "Bosh sahifada ProductCard komponenti slotlar bilan to'ldiriladi: savatga qo'shish tugmasi actions slotiga uzatiladi."],
    ['L12', 'slotlar_va_reaktivlik', "URL parametrlari o'zgarganda so'rov avtomatik yangilanishi uchun Vue Query kalitlari albatta computed bilan o'ralishi lozim."],

    ['L13', 'tipik_xatolar', "Tipik xatolar — eski stores va views papkalarini qoldirish, public API da yulduzcha bilan eksport qilish va App nuqta vue ni ildizda qoldirishdir."],
    ['L14', 'tipik_xatolar', "Shuningdek, unplugin auto-import plaginlari importlarni yashirib qo'ygani sababli, FSD intizomida aniq importlar tavsiya etiladi."],

    ['L15', 'xulosa', "Xulosa: Vue 3 loyihangizni FSD ga moslab, reaktivlik va modullilik uyg'unligidagi mustahkam arxitekturaga ega bo'ling."],
    ['L16', 'xulosa', "Keyingi bobda Nuxt frameworki va uning server imkoniyatlarida FSD shablonini tahlil qilamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

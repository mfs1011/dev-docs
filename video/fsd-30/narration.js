// FSD 30-bob videosi: "Nuxt shabloni" (content/fsd/30-nuxt-shabloni.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'toqnashuv_va_yechim', 'konfiguratsiya_va_alias', 'marshrut_qobigi', 'ssr_va_asyncdata', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Nuxt 4 va Universal FSD Shabloni',
    toqnashuv_va_yechim: 'Nuxt 4 da Qatlamlar To\'qnashuvi va Yechim',
    konfiguratsiya_va_alias: 'nuxt.config.ts va Aliaslar Intizomi',
    marshrut_qobigi: 'Marshrut Qobig\'i: app/ va Re-export Mexanizmi',
    ssr_va_asyncdata: 'FSD Sahifasida useAsyncData va 404 Boshqaruvi',
    tipik_xatolar: 'Nuxt FSD Shabloni Tipik Xatolari',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttizinchi bobi — Nuxt 4 frameworki uchun to'liq ishlab chiqarish shabloni. Bugun Nuxt 4, server rendering, fayl marshrutlari va Steiger linteri asosida mustahkam universal FSD loyihasini quramiz."],
    ['L2', 'intro', "Nuxt 4 da loyiha kodi va FSD qatlamlari nomlari to'qnash keladi, ammo to'g'ri tashkil etilgan marshrut qobig'i bu muammoni to'liq hal qiladi."],

    ['L3', 'toqnashuv_va_yechim', "Nuxt 4 da butun kod sukut bo'yicha ildizdagi app papkasida kutiladi, pages esa marshrutlarni ifodalaydi."],
    ['L4', 'toqnashuv_va_yechim', "Bu FSD qatlam nomlari bilan to'qnashgani uchun eng toza yechim: Nuxt ning app papkasini faqat marshrut qobig'i sifatida qoldirishdir."],
    ['L5', 'toqnashuv_va_yechim', "Barcha asosiy FSD qatlamlari esa src katalogida standart nomlar bilan yashaydi va et belgisi src ga yo'naltiriladi."],

    ['L6', 'konfiguratsiya_va_alias', "nuxt konfig faylida et belgisi src katalogiga ulanadi, tilda belgisi esa Nuxt ning tashqi qobig'i uchun qoldiriladi."],
    ['L7', 'konfiguratsiya_va_alias', "Natijada Nuxt avtomatik ravishda te-es-konfig ni yangilaydi va Steiger linteri barcha importlarni to'siqsiz tahlil qiladi."],

    ['L8', 'marshrut_qobigi', "Ildizdagi app nuqta vue faqat NuxtLayout va NuxtPage teglari bilan ilovaning tashqi karkasini chizadi."],
    ['L9', 'marshrut_qobigi', "app layouts va app pages fayllari esa o'z ichida hech qanday logika yozmasdan, FSD dan bitta komponentni ko'rsatadi."],
    ['L10', 'marshrut_qobigi', "Masalan, mahsulot marshruti faqat src pages product dan ProductPage komponentini chaqirib beradi."],

    ['L11', 'ssr_va_asyncdata', "FSD sahifasi ichida Nuxt ning useAsyncData va useRoute funksiyalari aniq xesh-imports moduli orqali chaqiriladi."],
    ['L12', 'ssr_va_asyncdata', "Agar ma'lumot topilmasa, sahifaning o'zida createError bilan to'rt yuz to'rtinchi xatolik holati xavfsiz qaytariladi."],

    ['L13', 'tipik_xatolar', "Tipik xatolar — to'liq sahifa kodini Nuxt pages ichiga yozish, et belgisini src ga yo'naltirishni unutish va komponent auto-importiga tayanishdir."],
    ['L14', 'tipik_xatolar', "Komponentlarni avtomatik import qilish FSD chegaralarini yashirib qo'ygani sababli, har doim public API orqali aniq import qilinishi shart."],

    ['L15', 'xulosa', "Xulosa: Nuxt 4 qobig'i va FSD yadrosini ajratish orqali ham to'liq SSR quvvatiga, ham temirdek arxitektura intizomiga ega bo'lasiz."],
    ['L16', 'xulosa', "Keyingi bobda Angular 22 uchun modulli FSD shablonini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

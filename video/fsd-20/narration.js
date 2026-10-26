// FSD 20-bob videosi: "API so'rovlari" (content/fsd/20-api-sorovlari.md). Ovoz — Kore, metafora — shared/api poydevori, resurslar va lokal so'rovlar.
(function (g) {
  const scenes = ['intro', 'shared_api_va_klient', 'endpoints_segmentatsiyasi', 'lokal_sorovlar', 'openapi_va_qalin_klient', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: API So\'rovlari Arxitekturasi',
    shared_api_va_klient: 'shared/api va Markaziy HTTP Klient',
    endpoints_segmentatsiyasi: 'Endpoints: Resurslar Bo\'yicha Taqsimlash',
    lokal_sorovlar: 'Lokal So\'rovlar: Sahifaning O\'z APIsi',
    openapi_va_qalin_klient: 'OpenAPI Generatsiyasi va DTO Mapper',
    tipik_xatolar: 'Eng Ko\'p Uchraydigan Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirmanchi bobi — API so'rovlari arxitekturasi. Bugun backend bilan frontend o'rtasidagi ma'lumotlar almashinuvini FSD qoidalariga mos ravishda to'g'ri tashkil qilishni o'rganamiz."],
    ['L2', 'intro', "Har bir komponent ichida tarqoq fetch yozish o'rniga, markazlashgan va qatlamli API strukturasi loyiha barqarorligining mustahkam kafolatidir."],

    ['L3', 'shared_api_va_klient', "Barcha umumiy so'rov mantiqi shared/api qatlamidan boshlanadi: HTTP klient, asosiy URL, sarlavhalar, sessiya cookie va xatoliklar modeli."],
    ['L4', 'shared_api_va_klient', "client.ts har qanday so'rovni yagona nuqtadan o'tkazib, autentifikatsiya va global xatolarni ishonchli ushlaydi."],

    ['L5', 'endpoints_segmentatsiyasi', "Barcha endpointlarni bitta ulkan faylga yig'ish — desegmentatsiya xatosidir. Ularni resurslar bo'yicha shared/api/endpoints katalogiga bo'ling."],
    ['L6', 'endpoints_segmentatsiyasi', "Masalan, product.ts, order.ts va auth.ts har biri o'zining so'rov funksiyalari va DTO tiplariga ega bo'ladi."],
    ['L7', 'endpoints_segmentatsiyasi', "Bu yondashuv kodni toza, o'qilishi oson va jamoada o'zaro to'qnashuvlarsiz saqlaydi."],

    ['L8', 'lokal_sorovlar', "Agar so'rov faqat bitta sahifa yoki feature'ga kerak bo'lsa-chi? Masalan, bir martalik OTP kodi yoki maxsus tekshiruv."],
    ['L9', 'lokal_sorovlar', "Uni shared'ga chiqarish shart emas! To'g'ridan-to'g'ri o'sha sahifaning api katalogida yozing va public API'dan yashiring."],
    ['L10', 'lokal_sorovlar', "FSD ning lokallik tamoyili bu yerda ham to'liq kuchga ega."],

    ['L11', 'openapi_va_qalin_klient', "Katta loyihalarda backend'dan OpenAPI sxemasi orqali avtomatik klient generatsiya qilish eng yaxshi amaliyotdir."],
    ['L12', 'openapi_va_qalin_klient', "Generatsiya qilingan kod shared/api/openapi katalogida saqlanadi va uni hech qachon qo'lda tahrirlamaslik kerak."],
    ['L13', 'openapi_va_qalin_klient', "DTO larni esa entities ga erta tiqmasdan, frontend domen modeli bilan backend o'rtasida mapper'lardan foydalaning."],

    ['L14', 'tipik_xatolar', "Tipik xatolar: komponent ichida to'g'ridan-to'g'ri fetch chaqirish, barcha so'rovlarni bitta faylga tiqish yoki lokal so'rovni tashqariga eksport qilish."],
    ['L15', 'tipik_xatolar', "Steiger linteri va toza arxitektura orqali bu muammolarni osongina oldini olish mumkin."],

    ['L16', 'xulosa', "Xulosa: umumiy klient va endpointlarni shared/api da saqlang, lokalini sahifada qoldiring va generatsiyani qo'lda buzmang. Keyingi bobda Server holati — TanStack Query'ni ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

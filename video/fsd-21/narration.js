// FSD 21-bob videosi: "Server holati" (content/fsd/21-server-holati.md). Ovoz — Kore, metafora — query factory kesh daraxti va mutatsiyalar.
(function (g) {
  const scenes = ['intro', 'query_factory', 'kesh_invalidatsiyasi', 'mutatsiyalar_joyi', 'yagona_query_klient', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Server Holati va Kesh',
    query_factory: 'Query Factory: Kesh Kalitlari Daraxti',
    kesh_invalidatsiyasi: 'Aniq va Nozik Kesh Invalidatsiyasi',
    mutatsiyalar_joyi: 'Mutatsiyalar Qayerda Saqlanadi?',
    yagona_query_klient: 'Yagona QueryClient va app/providers',
    tipik_xatolar: 'Kesh Boshqaruvidagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma birinchi bobi — Server holati va kesh boshqaruvi. Bugun TanStack Query, Pinia Colada yoki Angular resurslari bilan ishlashda kesh kalitlari va so'rovlarni qatlamlarda qanday joylashtirishni ko'rib chiqamiz."],
    ['L2', 'intro', "Serverdan kelgan ma'lumotlar oddiy holat emas, u keshlanishi, yangilanishi va aniq boshqarilishi lozim bo'lgan server holatidir."],

    ['L3', 'query_factory', "Eng muhim qoida: kesh kalitlarini har bir komponentda qo'lda yozmasdan, query factory orqali iyerarxik daraxt ko'rinishida tuzing."],
    ['L4', 'query_factory', "Masalan, shared/api yoki entities ichidagi queries katalogida all, lists, list va detail metodlarini bitta zavodga birlashtiring."],

    ['L5', 'kesh_invalidatsiyasi', "Bunday iyerarxiya keshni nozik boshqarish imkonini beradi: all kaliti butun resursni, lists esa faqat ro'yxat keshini yangilaydi."],
    ['L6', 'kesh_invalidatsiyasi', "Bitta mahsulot yangilanganda butun ilovani qayta yuklash shart emas, faqat tegishli query kalitini invalidate qilish kifoya."],
    ['L7', 'kesh_invalidatsiyasi', "Bu tarmoq trafigini keskin kamaytirib, ilova tezligini sezilarli darajada oshiradi."],

    ['L8', 'mutatsiyalar_joyi', "Mutatsiyalarni query factory bilan aralashtirmang! Yaratish, yangilash yoki o'chirish harakatlari o'ziga xos mantiqqa ega."],
    ['L9', 'mutatsiyalar_joyi', "Mutatsiya hook'i yoki funksiyasi aynan u ishlatiladigan joyda — sahifa yoki feature'ning api segmentida saqlanadi."],
    ['L10', 'mutatsiyalar_joyi', "Va uning onSuccess hodisasida markaziy query factory kaliti orqali kesh yangilanadi."],

    ['L11', 'yagona_query_klient', "QueryClient instance'i ilovada faqat bitta bo'lishi shart va u app/providers qatlamida yaratilib, butun daraxtga ulash lozim."],
    ['L12', 'yagona_query_klient', "Slicelar ichida yangi QueryClient yaratish har xil keshlar va sinxronizatsiya buzilishlariga olib keladi."],
    ['L13', 'yagona_query_klient', "Shuningdek, server ma'lumotlarini Redux yoki Pinia'ga qo'shimcha nusxalab o'tirmang — keshning o'zi yagona haqiqat manbaidir."],

    ['L14', 'tipik_xatolar', "Tipik xatolar: kalit satrlarini har joyda qo'lda yozish, keshni qo'lda setState bilan yangilash yoki mutatsiyani noto'g'ri joylashtirish."],
    ['L15', 'tipik_xatolar', "Query factory va toza FSD qoidalari orqali kesh chalkashliklaridan butunlay qutulasiz."],

    ['L16', 'xulosa', "Xulosa: kalitlarni query factory'ga yig'ing, mutatsiyani slice api'sida tuting va QueryClient'ni faqat app'da ishga tushiring. Keyingi bobda Autentifikatsiya arxitekturasini o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

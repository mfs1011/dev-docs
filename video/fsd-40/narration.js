// FSD 40-bob videosi: "Shpargalka" (content/fsd/40-shpargalka.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'olti_qatlam_ierarxiya', 'ikki_asosiy_qonun', 'kod_qayerga', 'segmentlar_va_steiger', 'tipik_xatolar', 'grand_finale'];
  const sceneNames = {
    intro: 'Kirish: Butun FSD Arxitekturasi Bir Sahifada',
    olti_qatlam_ierarxiya: 'Oltita Qatlam va Qat\'iy Ierarxiya',
    ikki_asosiy_qonun: 'FSD ning Ikki Asosiy Qonuni: Import va Public API',
    kod_qayerga: 'Qarorlar Xaritasi: Qaysi Kod Qayerga Joylashadi?',
    segmentlar_va_steiger: 'Ruxsat Berilgan Segmentlar va Steiger Nazorati',
    tipik_xatolar: 'Eng Ko\'p Uchraydigan Tipik Xatolar',
    grand_finale: 'FSD Qo\'llanmasi Yakuni va Katta Rahmat!'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L6: 1.2,
    L8: 1.2,
    L10: 1.2,
    L12: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu Feature-Sliced Design qo'llanmasining qirqinchi, yakuniy bobi — butun metodologiyaning yagona, to'liq shpargalkasi."],
    ['L2', 'intro', "Ushbu shpargalka loyihangizda har kuni foydalanish yoki sun'iy intellekt yordamchilariga qoidalar sifatida berish uchun mo'ljallangan."],

    ['L3', 'olti_qatlam_ierarxiya', "Arxitektura oltita qatlamdan iborat: eng yuqorida app va sahifalar, o'rtada widgets, features va entities, poydevorda esa shared."],
    ['L4', 'olti_qatlam_ierarxiya', "Zamonaviy FSD da sahifalardan boshlanadi; app va shared slayssiz bo'lib, o'rtadagi barcha qatlamlar biznes slayslariga bo'linadi."],

    ['L5', 'ikki_asosiy_qonun', "Birinchi oltin qonun: importlar har doim faqat pastga yo'naladi; bitta qatlamdagi slayslar bir-birini mutlaqo bilmaydi."],
    ['L6', 'ikki_asosiy_qonun', "Ikkinchi oltin qonun: har bir slays tashqariga faqat o'zining indeks te-es dagi public API si orqali aniq nomlar bilan eksport qiladi."],

    ['L7', 'kod_qayerga', "Kod qayerga joylashadi: bitta sahifa kodi sahifada, umumiy harakatlar features da, biznes modellari esa entities da yashaydi."],
    ['L8', 'kod_qayerga', "Agar biror kodning joyiga shubhangiz bo'lsa, uni eng lokal joyda qoldiring; keyinroq pastga tushirish xatoni orqaga qaytarishdan osonroqdir."],

    ['L9', 'segmentlar_va_steiger', "Segment nomlari texnik bo'lishi taqiqlanadi: helpers yoki utils o'rniga faqat ui, model, api, lib va konfig ishlatiladi."],
    ['L10', 'segmentlar_va_steiger', "Stayger linteri barcha qoidalarni avtomatik nazorat qiladi va doimiy ravishda loyihaning si-ay tizimida ishlab turishi shart."],

    ['L11', 'tipik_xatolar', "Eng xavfli xatolar — birinchi kunda barcha qatlamlarni ochish, entity ichida feature harakatini import qilish va tokenlarni sahifada saqlashdir."],
    ['L12', 'tipik_xatolar', "Qatlamlararo aloqani faqat yuqorida slot va prop orqali bog'lash hamda doimo domen tili bo'yicha nomlash lozim."],

    ['L13', 'grand_finale', "Mana, qirqta bobdan iborat ulkan Feature-Sliced Design video qo'llanmasini to'liq yakunladik!"],
    ['L14', 'grand_finale', "Siz endi har qanday murakkablikdagi frontend ilovalarni toza, tushunarli va yillar davomida barqaror arxitekturada qura olasiz."],
    ['L15', 'grand_finale', "Bilimlaringizni amaliyotda qo'llang, jamoangiz bilan toza kod madaniyatini rivojlantiring va FSD tamoyillariga sodiq qoling."],
    ['L16', 'grand_finale', "Katta rahmat va yangi buyuk loyihalaringizda omad yor bo'lsin!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

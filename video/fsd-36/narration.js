// FSD 36-bob videosi: "Migratsiya" (content/fsd/36-migratsiya.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'sakkiz_qadam', 'sahifalar_va_reexport', 'steiger_bosqichlari', 'versiyalar_evolyutsiyasi', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: FSD Migratsiya Falsafasi va Asoslash',
    sakkiz_qadam: 'Bosqichma-bosqich 8 Qadamli Strategiya',
    sahifalar_va_reexport: '1-Qadam: Marshrut Fayli va Sahifa Ajratish',
    steiger_bosqichlari: 'Steiger Linterini Bosqichma-bosqich Yoqish',
    versiyalar_evolyutsiyasi: 'FSD Versiyalari: v1 dan v2.1 gacha',
    tipik_xatolar: 'Migratsiyadagi Tipik Xatolar va Qachon O\'tmaslik',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz oltinchi bobi — mavjud loyihalarni yangi funksiyalarni to'xtatmasdan FSD ga bosqichma-bosqich migratsiya qilish."],
    ['L2', 'intro', "Migratsiyani boshlashdan oldin jamoa roziligi va biznes asoslash muhim: katta portlash usulida qayta yozish emas, asta-sekin yaxshilash kerak."],

    ['L3', 'sakkiz_qadam', "Rasmiy shablon sakkiz qadamdan iborat: avval et aliyasini sozlash, so'ngra kodni sahifalarga bo'lish va qolganini app hamda shared ga ajratish."],
    ['L4', 'sakkiz_qadam', "Sahifalararo importlar yo'qotiladi, shared ga faqat umumiy kod qoldirilib, bitta sahifaga tegishli reducers va actions o'sha sahifaga ko'chiriladi."],
    ['L5', 'sakkiz_qadam', "Oxirgi ixtiyoriy bosqichda bir nechta sahifa ishlatadigan modullar entities va features qatlamlariga ajratiladi."],

    ['L6', 'sahifalar_va_reexport', "Birinchi amaliy qadamda routes papkasidagi fayllar faqat re-eksport vazifasini bajaradi, haqiqiy UI esa pages ga ko'chadi."],
    ['L7', 'sahifalar_va_reexport', "Re-akt, Vue yoki Angular bo'lishidan qat'i nazar, marshrutlar faqat sahifaning public API sidan komponentni olib beradi."],

    ['L8', 'steiger_bosqichlari', "Mavjud eski loyihaga Stayger integratsiyasida barcha qoidalar bir vaqtda yoqilmaydi, avval faqat ignor-vornings bilan xatolar tekshiriladi."],
    ['L9', 'steiger_bosqichlari', "Bosqichma-bosqich avval taqiqlangan importlar va pablik api, so'ngra mayda slice va segment qoidalari yoqiladi."],

    ['L10', 'versiyalar_evolyutsiyasi', "FSD versiyalariga nazar tashlasak: birinchi versiyadan ikkinchi versiyaga o'tishda shared, entities va qatlamlar qat'iy standartlashtirildi."],
    ['L11', 'versiyalar_evolyutsiyasi', "Ikki nuqta noldan ikki nuqta birga o'tishda esa pages-first tamoyili mustahkamlandi, cross-importlar joriy etildi va processes bekor qilindi."],

    ['L12', 'tipik_xatolar', "Eng xavfli xato — loyihani bitta ulkan pul-rikvestda to'liq qayta yozishga urinish yoki jamoa xohishiga qarshi majburlashdir."],
    ['L13', 'tipik_xatolar', "Shuningdek, birinchi kundan boshlab sun'iy entities va features qidirish hamda framework yangilash bilan FSD ni bir vaqtda boshlash tavsiya etilmaydi."],

    ['L14', 'xulosa', "Xulosa: FSD ga o'tish — tizimli, xavfsiz va boshqariladigan jarayon bo'lib, loyihaning kelajakdagi barqarorligini ta'minlaydi."],
    ['L15', 'xulosa', "Keyingi o'ttiz yettinchi bobda ushbu bilimlarni real internet do'koni frontend loyihasiga amaliy tatbiq qilamiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, arxitekturani bosqichma-bosqich yuksaltirishda davom eting!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

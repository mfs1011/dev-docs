// FSD 23-bob videosi: "Tiplar va validatsiya" (content/fsd/23-tiplar.md). Ovoz — Kore, metafora — tiplar joylashuvi, DTO va Zod sxemalari.
(function (g) {
  const scenes = ['intro', 'shared_types_xatosi', 'dto_mapper_va_domen', 'forma_va_props_tiplari', 'utility_va_ambient_tiplar', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Tiplar va Validatsiya',
    shared_types_xatosi: 'shared/types Axlatxonasidan Saqlaning',
    dto_mapper_va_domen: 'DTO, Zod Sxemasi va Mapper',
    forma_va_props_tiplari: 'Forma Sxemasi va Props Tiplari',
    utility_va_ambient_tiplar: 'Utility Tiplar va Ambient .d.ts',
    tipik_xatolar: 'Tiplar Boshqaruvidagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma uchinchi bobi — Tiplar va validatsiya arxitekturasi. Bugun TypeScript tiplari va Zod sxemalarini loyihada to'g'ri taqsimlash tamoyillarini o'rganamiz."],
    ['L2', 'intro', "FSD'da asosiy qoida: tiplar ham koddir, va ular faqat o'zlari ishlatiladigan joy yonida yashashi lozim."],

    ['L3', 'shared_types_xatosi', "Eng katta xato — loyihada shared/types papkasi yoki har bir slice ichida types segmenti yaratishdir."],
    ['L4', 'shared_types_xatosi', "'Tip bo'lish' — bu kodni guruhlash uchun yetarli xususiyat emas, xuddi barcha funksiyalarni bitta papkaga yig'maganimiz kabi."],

    ['L5', 'dto_mapper_va_domen', "Backend javob tiplari, ya'ni DTO lar, ularni qabul qiluvchi so'rov funksiyasi yonida turadi."],
    ['L6', 'dto_mapper_va_domen', "Zod sxemasi orqali backend ma'lumotlari parse qilinadi va mapper funksiyasi orqali toza frontend domen modeliga o'giriladi."],
    ['L7', 'dto_mapper_va_domen', "Bu backend o'zgarganda butun interfeys buzilib ketishining oldini oladi."],

    ['L8', 'forma_va_props_tiplari', "Foydalanuvchi kiritadigan formalar validatsiyasi esa aynan o'sha forma turgan joyda — sahifa yoki feature modelida saqlanadi."],
    ['L9', 'forma_va_props_tiplari', "Komponent props va context tiplari esa to'g'ridan-to'g'ri komponentning o'z faylida e'lon qilinadi."],
    ['L10', 'forma_va_props_tiplari', "Ularni sun'iy ravishda tashqariga chiqarish — kodni o'qishni qiyinlashtiradi."],

    ['L11', 'utility_va_ambient_tiplar', "Loyiha bo'ylab qayta ishlatiladigan yordamchi utility tiplar shared/lib ostida jamlanadi."],
    ['L12', 'utility_va_ambient_tiplar', "Tipsiz tashqi kutubxonalar uchun ambient d-t-s fayllari shared/lib/untyped-packages papkasida bo'sh index.ts bilan saqlanadi."],
    ['L13', 'utility_va_ambient_tiplar', "Bu Steiger linterining har bir shared slice'idan public API talab qilish qoidasiga to'liq javob beradi."],

    ['L14', 'tipik_xatolar', "Tipik xatolar: shared/types axlatxonasini yaratish, backend javobini tekshiruvsiz as kalit so'zi bilan kasting qilish yoki DTO larni UI ga yoyish."],
    ['L15', 'tipik_xatolar', "Sxema validatsiyasi va qatlamli tiplar loyihangizni yashirin run-time xatolardan asraydi."],

    ['L16', 'xulosa', "Xulosa: tiplarni ishlatiladigan joy yonida saqlang, DTO ni mapper bilan o'giring va shared/types ochmang. Keyingi bobda Layout'lar arxitekturasini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

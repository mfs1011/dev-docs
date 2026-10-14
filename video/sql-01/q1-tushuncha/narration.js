// SQL 1-bob, 1-video: "Tushuncha" va "Standart" bo'limlari (content/sql/01-relyatsion-model.md).
// Da'volar bobning o'zidan (u PostgreSQL 18 glossary/intro/features, MySQL 9.7 compatibility, SQLite quirks hujjatlariga tayanadi).
(function (g) {
  const scenes = ['intro', 'baza', 'atamalar', 'tartib', 'standart', 'dialekt', 'tizimlar', 'xulosa'];
  const sceneNames = { intro: 'Kirish', baza: 'Ma’lumotlar bazasi', atamalar: 'Asosiy atamalar', tartib: 'Qatorlarda tartib yo‘q', standart: 'SQL standarti', dialekt: 'Dialekt', tizimlar: 'Uch tizim', xulosa: 'Xulosa' };
  const hold = { L4: 0.8, L7: 0.6, L8: 0.6, L9: 0.8, L11: 0.8, L12: 1.0, L13: 1.2, L15: 0.8, L16: 1.0, L17: 1.0, L19: 0.8, L20: 1.0, L21: 1.0 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu SQL qo‘llanmasining birinchi bobi. Relyatsion model nima va SQL standarti qanday ishlashini ko‘rib chiqamiz.'],

    ['L2', 'baza', 'Ma’lumotlar bazasi — ma’lumotni tartibli saqlaydigan tizim. Uni boshqaradigan dastur MBBT, ya’ni ma’lumotlar bazasini boshqarish tizimi deyiladi. PostgreSQL, MySQL va SQLite — shunday tizimlar.'],
    ['L3', 'baza', 'Uchalasi ham relyatsion. Relyatsiya — jadvalning matematik nomi. Ma’lumot saqlashning boshqa usullari ham bor: masalan, kompyuterdagi papka va fayllar — ierarxik baza.'],
    ['L4', 'baza', 'Relyatsion baza ma’lumotni bitta katta omborga emas, alohida jadvallarga joylaydi. Jadvallar orasidagi qoidalarni esa ilova emas, bazaning o‘zi kuzatib boradi.'],

    ['L5', 'atamalar', 'Mana, talabalar jadvali. Har bir qator — bitta yozuv. Nazariyada uni kortej deyiladi.'],
    ['L6', 'atamalar', 'Har bir ustun — nomlangan maydon, uning aniq ma’lumot tipi bor. Nazariyada bu atribut.'],
    ['L7', 'atamalar', 'Id ustuni — birlamchi kalit. U har bir qatorni yagona aniqlaydi, takrorlanmaydi va NULL bo‘lmaydi.'],
    ['L8', 'atamalar', 'NULL — qiymat yo‘q degani. U nol ham, bo‘sh satr ham emas.'],
    ['L9', 'atamalar', 'Cheklov — jadvalga yoziladigan qiymatlarga qo‘yilgan qoida. Tashqi kalit esa boshqa jadvaldagi bitta qatorga ishora qiladi.'],
    ['L10', 'atamalar', 'Bitta PostgreSQL serveri boshqaradigan bazalar to‘plami klaster deyiladi. Klaster ichida baza, baza ichida jadval.'],

    ['L11', 'tartib', 'Endi eng muhim qoida. Qatordagi ustunlar tartibi qat’iy, lekin jadvaldagi qatorlar tartibini SQL kafolatlamaydi.'],
    ['L12', 'tartib', 'Sababi oddiy: matematikada relyatsiya — to‘plam, to‘plamda esa tartib yo‘q. Tartib kerak bo‘lsa, uni so‘rovda aniq so‘rash kerak.'],

    ['L13', 'standart', 'SQL — Structured Query Language, ya’ni tuzilmaviy so‘rovlar tili. Uni to‘g‘ridan-to‘g‘ri yozish, boshqa tildagi kod ichiga joylash yoki ORM kabi kutubxona orqali ishlatish mumkin.'],
    ['L14', 'standart', 'Standartning rasmiy nomi — ISO/IEC 9075. SQL-92 versiyasida moslikning uchta darajasi bor edi. SQL 1999 versiyasidan boshlab darajalar o‘rniga xususiyatlar ro‘yxati keldi.'],
    ['L15', 'standart', 'Eng so‘nggi versiya — SQL 2023. Har yangi versiya oldingisini almashtiradi.'],
    ['L16', 'standart', 'Xususiyatlarning bir qismi Core, ya’ni majburiy. PostgreSQL 18 SQL 2023 versiyasidagi 177 ta Core xususiyatdan kamida 170 tasini bajaradi. Hujjatga ko‘ra, hech bir tizim Core’ga to‘liq moslikni da’vo qilmaydi.'],
    ['L17', 'standart', 'Standart bir nechta qismdan iborat. Bu qo‘llanma deyarli butunlay ikkinchi qism — Foundation haqida: jadvallar, so‘rovlar va tiplar.'],

    ['L18', 'dialekt', 'Standart bor, lekin ikkita SQL tizimi aynan bir xil ishlamaydi. Standartdan farq qiladigan qism dialekt deyiladi.'],
    ['L19', 'dialekt', 'Dialekt ikki xil bo‘ladi. Kengaytma — standartda yo‘q, lekin tizim qo‘shgan imkoniyat. Farq — standartdagi narsa tizimda boshqacha ishlaydi.'],

    ['L20', 'tizimlar', 'PostgreSQL o‘zini obyekt-relyatsion tizim deb ataydi va standartga moslikka intiladi. MySQL ham intiladi, lekin tezlik va ishonchlilikni qurbon qilmasdan; uning kengaytmalari ko‘p.'],
    ['L21', 'tizimlar', 'SQLite esa serversiz: u ilova ichida kutubxona sifatida ishlaydi. Uning farqlari alohida Quirks sahifasida yozilgan.'],

    ['L22', 'xulosa', 'Shuning uchun har bobda ikki savolga javob beramiz: standart nima deydi va har bir tizim aslida nima qiladi. Keyingi videoda bularni terminalda ko‘ramiz.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

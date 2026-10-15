// SQL 4-bob, 2-video: "Kod" — PostgreSQL 18 psql da jonli amaliyot
(function (g) {
  const scenes = ['intro', 'case_sensitivity', 'keywords_length', 'strings', 'numbers', 'comments_traps', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    case_sensitivity: 'Katta-kichik harf va nomlar',
    keywords_length: 'Kalit so‘z va 63 bayt chegara',
    strings: 'Satrlar: oddiy, escape va dollar',
    numbers: 'Sonlar va boshlang‘ich tiplar',
    comments_traps: 'Izoh tuzog‘i va ustuvorlik',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L5: 1.0,
    L8: 1.0,
    L12: 1.0,
    L15: 1.0,
    L19: 1.0,
    L21: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Ushbu amaliy qismda SQL sintaksisi qoidalarini PostgreSQL 18 va psql terminalida jonli buyruqlar orqali sinab ko‘ramiz.'],

    ['L2', 'case_sensitivity', 'Avval katta-kichik harflar bilan Mahsulot jadvalini yaratamiz va bitta qator kiritamiz.'],
    ['L3', 'case_sensitivity', 'Ko‘rib turganingizdek, PostgreSQL jadval va ustun nomini avtomatik kichik harfga aylantirdi. Endi qo‘shtirnoq bilan Mahsulot ni so‘rasak, baza bunday jadval yo‘q deb xato beradi.'],
    ['L4', 'case_sensitivity', 'Agar aynan qo‘shtirnoqli Mahsulot jadvalini yaratsak, bazada bir xil nomli ikkita mustaqil jadval paydo bo‘ladi.'],
    ['L5', 'case_sensitivity', 'dt buyrug‘i orqali ikkala jadval ham mavjudligini ko‘rishimiz mumkin. Endi ikkinchi jadval ustunlariga ham faqat qo‘shtirnoq orqali murojaat qilish shart.'],

    ['L6', 'keywords_length', 'Endi kalit so‘zni nom qilib ko‘ramiz: CREATE TABLE order xato beradi, chunki ORDER bu SQL ning kalit so‘zidir.'],
    ['L7', 'keywords_length', 'Ammo nomni qo‘shtirnoq ichiga olib, order jadvalini muvaffaqiyatli yaratish mumkin.'],
    ['L8', 'keywords_length', 'Yetmish harfdan iborat uzun nom berganimizda esa, PostgreSQL uni rad etmaydi, balki ogohlantirish berib, nomni 63 baytgacha qisqartiradi.'],

    ['L9', 'strings', 'Satr literallariga o‘tamiz. O‘zbekcha ismlardagi tutuq belgisini yozish uchun ikkita bitta tirnoq qo‘yiladi.'],
    ['L10', 'strings', 'Oddiy satrda teskari chiziq en harflari o‘z holicha to‘rt belgi bo‘lib qoladi. E harfli escape satrida esa u yangi qatorga aylanadi va psql uni plyus belgisi bilan ko‘rsatadi.'],
    ['L11', 'strings', 'Dollar satr ichida esa tirnoqlar ham, teskari chiziq ham maxsus ma’nosini yo‘qotadi va matn to‘g‘ridan-to‘g‘ri saqlanadi.'],
    ['L12', 'strings', 'Agar ikki satr orasida yangi qator bo‘lsa, PostgreSQL ularni avtomatik bitta satrga birlashtiradi.'],

    ['L13', 'numbers', 'Sonlarda tagchiziq yordamida bir millionni o‘qish oson shaklda yozish mumkin. Shuningdek o‘n oltilik, ikkilik va sakkizlik sonlar ham qo‘llab-quvvatlanadi.'],
    ['L14', 'numbers', 'pg_typeof funksiyasi orqali boshlang‘ich tiplarni ko‘ramiz: qirq ikki integer, uch milliard bigint, kasr son esa numeric tipida qabul qilinadi.'],
    ['L15', 'numbers', 'Demak, sonning boshlang‘ich tipi uning kattaligi va nuqtasi bor-yo‘qligiga qarab aniqlanadi.'],

    ['L16', 'comments_traps', 'Endi eng mashhur sintaksis tuzog‘i: besh minus minus bir ifodasi. Ikkinchi minusdan keyingi hamma narsa izohga aylanib, so‘rov besh natijasini beradi!'],
    ['L17', 'comments_traps', 'Minuslar orasiga bo‘sh joy qo‘yganimizdagina haqiqiy olti natijasi chiqadi.'],
    ['L18', 'comments_traps', 'PostgreSQL da ko‘p qatorli izohlar ichma-ich joylashishi mumkin, bu katta kod qismlarini o‘chirmasdan izohga olishda juda qulay.'],
    ['L19', 'comments_traps', 'Operatorlar ustuvorligida esa darajaga ko‘tarish chapdan bog‘lanadi: 2 darajasi 3 darajasi 2 ifodasi to‘g‘ri oltmish to‘rt chiqadi.'],

    ['L20', 'xulosa', 'Ushbu jonli sinovlar orqali PostgreSQL sintaksisining nozik tomonlarini ko‘rdik.'],
    ['L21', 'xulosa', 'Keyingi videoda xuddi shu so‘rovlar MySQL va SQLite da qanday ishlashini va dialektlar farqini taqqoslaymiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

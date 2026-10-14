// SQL 2-bob, 1-video: "Tushuncha" va "Nega shunday: qaysi biri qachon" (content/sql/02-uch-tizim.md).
(function (g) {
  const scenes = ['intro', 'arxitektura', 'postgres', 'mysql', 'sqlite', 'tanlov', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    arxitektura: 'Ikki xil arxitektura',
    postgres: 'PostgreSQL: jarayonlar',
    mysql: 'MySQL: bitta jarayon, ko‘p thread',
    sqlite: 'SQLite: kutubxona va bitta fayl',
    tanlov: 'Qaysi biri qachon?',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8, L4: 1.0, L6: 1.0, L7: 0.8, L9: 0.8, L11: 1.0,
    L13: 0.8, L15: 1.2, L17: 0.8, L18: 0.8, L19: 0.8, L20: 1.2, L21: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Bu SQL qo‘llanmasining ikkinchi bobi. PostgreSQL, MySQL va SQLite qanday tuzilganini va ulardan qaysi birini qachon tanlashni ko‘rib chiqamiz.'],

    ['L2', 'arxitektura', 'Uchala tizim ham SQL tilini tushunadi, lekin ularning ichki arxitekturasi turlicha. Asosan ikki xil tuzilish bor: mijoz-server va o‘rnatiladigan, ya’ni embedded.'],
    ['L3', 'arxitektura', 'PostgreSQL va MySQL — mijoz-server tizimlari. Baza alohida server dasturi sifatida doim ishlab turadi, ilovalar esa unga mijoz sifatida tarmoq orqali ulanadi.'],
    ['L4', 'arxitektura', 'SQLite esa o‘rnatiladigan tizim. Unda alohida server yo‘q: u ilovaning ichida, oddiy kutubxona sifatida ishlaydi.'],

    ['L5', 'postgres', 'PostgreSQL har bir ulanish uchun alohida jarayonga tayanadi. Bosh postgres jarayoni yangi ulanishlarni kutadi.'],
    ['L6', 'postgres', 'Har bir yangi mijoz ulanganda yangi jarayon ochiladi. Mijoz to‘g‘ridan-to‘g‘ri shu jarayon bilan ishlaydi, bosh jarayon esa aralashmaydi.'],
    ['L7', 'postgres', 'Mijoz va server boshqa kompyuterlarda bo‘lishi mumkin. Shuning uchun mijozdagi fayllar serverda avtomatik mavjud bo‘lmaydi.'],

    ['L8', 'mysql', 'MySQL serveri mysqld esa bitta ko‘p oqimli dastur. U har ulanishga yangi jarayon ochmaydi.'],
    ['L9', 'mysql', 'Ulanishlar threadlar, ya’ni bitta jarayon ichidagi alohida oqimlar orqali boshqariladi. Har mijozga alohida thread biriktiriladi.'],
    ['L10', 'mysql', 'MySQL’ning yana bir o‘ziga xosligi — almashtiriladigan storage engine’lar. SQL tahlilini server bajaradi, diskda saqlashni esa engine qiladi.'],
    ['L11', 'mysql', 'Sukut bo‘yicha engine — InnoDB. U tranzaksiyalar, qator darajasidagi qulflar va tashqi kalitlarni ta’minlaydi.'],

    ['L12', 'sqlite', 'SQLite ilova jarayoni ichida ishlaydigan kutubxona. U mustaqil, serversiz va sozlashni talab qilmaydi.'],
    ['L13', 'sqlite', 'Butun baza diskdagi bitta faylda saqlanadi. Jadvallar, indekslar va ma’lumotlar hammasi bitta fayl ichida turadi.'],
    ['L14', 'sqlite', 'Fayl formati platformadan mustaqil. Ammo bir vaqtda faqat bitta yozuvchi yoza oladi, qolganlari navbat kutadi.'],
    ['L15', 'sqlite', 'SQLite hujjati ajoyib taqqoslash keltiradi: uni Oracle o‘rnini bosuvchi emas, balki fayl ochish funksiyasi o‘rnini bosuvchi deb tushuning.'],

    ['L16', 'tanlov', 'Xo‘sh, qaysi birini qachon tanlash kerak? SQLite hujjati aniq uchta nazorat savolini beradi.'],
    ['L17', 'tanlov', 'Birinchi savol: ma’lumot ilovadan tarmoq orqali ajratilganmi? Ha bo‘lsa — mijoz-server baza tanlang.'],
    ['L18', 'tanlov', 'Ikkinchi savol: ko‘p yozuvchi bir vaqtda yozishi kerakmi va ular navbat kuta olmaydimi? Ha bo‘lsa — mijoz-server tanlang.'],
    ['L19', 'tanlov', 'Uchinchi savol: ma’lumot bitta faylga sig‘maydimi? Ha bo‘lsa — yana mijoz-server tanlang.'],
    ['L20', 'tanlov', 'Qolgan barcha holatlarda esa — SQLite tanlang! Telefon, desktop ilovalar, lokal kesh yoki o‘rta trafikli saytlar uchun u eng yaxshi yechim.'],

    ['L21', 'xulosa', 'Bizning qo‘llanma veb-ilovalarga qaratilgani sababli asosiy e’tibor PostgreSQL’ga beriladi. Keyingi videoda bu uch tizimni haqiqiy terminalda ko‘ramiz.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

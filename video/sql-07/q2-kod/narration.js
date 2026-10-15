// SQL 7-bob 2-qism: "Kod" — Terminalda jonli sinovlar
(function (g) {
  const scenes = ['intro', 'char_varchar', 'probel_cmp', 'belgi_bayt', 'nul_bytea', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: psql da jonli sinovlar',
    char_varchar: 'char(4), varchar(5), text va uzunlik xatosi',
    probel_cmp: 'Probellar bilan solishtirish: char vs varchar',
    belgi_bayt: 'Belgi va bayt: UTF-8 va tutuq belgisi',
    nul_bytea: 'Nol bayt xatosi va bytea imkoniyatlari',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8,
    L6: 1.0,
    L8: 1.0,
    L10: 1.0,
    L13: 1.0,
    L15: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Ushbu qismda PostgreSQL 18 psql terminalida matn va ikkilik turlarni amalda sinab ko‘ramiz.'],
    ['L2', 'intro', 'char, varcha, cheksiz tekst, uzunlik xatolari, o‘zbekcha tutuq belgisi va baytea ni jonli buyruqlarda ko‘ramiz.'],

    ['L3', 'char_varchar', 'Avval char to‘rt, varcha besh va tekst ustunlaridan iborat matnlar jadvalini yaratamiz.'],
    ['L4', 'char_varchar', 'Endi varcha ustuniga to‘qqiz belgilik juda uzun so‘zini yozamiz. Baza darhol qat’iy xato beradi va yozishni to‘xtatadi.'],
    ['L5', 'char_varchar', 'Biroq ortiqcha qismi faqat probellardan iborat bo‘lgan salom so‘zi yozilsa, probellar jimgina kesilib xatosiz saqlanadi.'],
    ['L6', 'char_varchar', 'Agar qiymatni aniq kast orqali varcha beshga o‘girsak, ortiqcha qism xatosiz kesiladi va juda yoziladi.'],

    ['L7', 'probel_cmp', 'Endi qiziq tajriba: char da probellar diskda saqlansada, tenglik bilan solishtirganda hisobga olinmaydi va natija rost chiqadi.'],
    ['L8', 'probel_cmp', 'Varchada esa oxiridagi probellar alohida belgi hisoblangani sababli, a be va a be probel teng emas, natija yolg‘on bo‘ladi.'],

    ['L9', 'belgi_bayt', 'Keyingi sinov — belgi va bayt farqi. O‘zbekcha O‘zbekiston so‘zida o‘n bitta belgi bor, lekin oktet lengs o‘n ikki bayt ko‘rsatadi.'],
    ['L10', 'belgi_bayt', 'Chunki lotin alifbomizdagi tutuq belgisi UTF-8 da ikki bayt joy oladi. U oddiy bitta baytli tirnoqqa o‘xshasa ham, mutlaqo boshqa belgi sanaladi.'],

    ['L11', 'nul_bytea', 'Matn ustuniga kodi nol bo‘lgan belgini kiritishga urinsak, baza kutilganidek qat’iy UTF-8 xatosini chiqaradi.'],
    ['L12', 'nul_bytea', 'Xom baytlar uchun baytea jadvalini ochamiz. Unga Salom so‘zi yozilsa, diskdagi baytlari heks formatida aks etadi.'],
    ['L13', 'nul_bytea', 'Baytea da nol baytlar ham bemalol saqlanadi. Biroq apper kabi matn funksiyalari baytea uchun mavjud emas.'],

    ['L14', 'xulosa', 'Ko‘rib turganingizdek: varcha chegarani qat’iy tekshiradi, char probellarni yutadi, baytea esa xom baytlar ustida ishlaydi.'],
    ['L15', 'xulosa', 'Keyingi 3-qismda MySQL va SQLite dialektlaridagi o‘ziga xosliklar hamda 6 ta tipik tuzoqni ko‘rib chiqamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

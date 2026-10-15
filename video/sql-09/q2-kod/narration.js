// SQL 9-bob, 2-video: "Kod" — PostgreSQL terminalida jonli amallar
(function (g) {
  const scenes = ['intro', 'bool_sinov', 'bool_null', 'uuid_sinov', 'enum_sinov', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: psql terminalida jonli sinovlar',
    bool_sinov: 'Boolean: Kiritish shakllari va butun son xatosi',
    bool_null: 'Boolean va NULL: WHERE filtri tuzog‘i',
    uuid_sinov: 'UUIDv4 va UUIDv7: Hajm va vaqt tamg‘asi',
    enum_sinov: 'Enum amalda: Tartib va ALTER TYPE',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8,
    L4: 1.0,
    L7: 1.0,
    L10: 1.0,
    L13: 1.0,
    L15: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu qismda PostgreSQL o‘n sakkiz nuqta olti terminalida boolean, UUID va enum turlarini jonli misollar bilan sinaymiz.'],
    ['L2', 'intro', 'Har bir turning o‘ziga xos imkoniyatlari, diskdagi hajmi va dasturlashda adashtirib qo‘yiladigan joylarini amalda ko‘rib chiqamiz.'],

    ['L3', 'bool_sinov', 'Dastlab vazifalar jadvalini yaratib, boolean ustuniga turli ko‘rinishdagi qiymatlarni kiritamiz: TRUE, no, on va NULL.'],
    ['L4', 'bool_sinov', 'Baza ularni avtomatik t va f harflariga aylantirdi. Ammo unga ikki raqamini yozmoqchi bo‘lsak, PostgreSQL butun sonni qabul qilmasdan qat’iy xato beradi!'],

    ['L5', 'bool_null', 'Endi eng muhim sinov: WHERE bajarildi desak, faqat rost qatorlar chiqadi. WHERE NOT bajarildi desak, yolg‘on qator chiqadi.'],
    ['L6', 'bool_null', 'E’tibor bering: NULL qiymatli sinov vazifasi hech biriga tushmadi! Chunki NOT NULL ham noma’lum bo‘lib qoladi.'],
    ['L7', 'bool_null', 'Bajarilmagan yoki noma’lum barcha qatorlarni olish uchun esa IS NOT TRUE shartidan foydalanish shart.'],

    ['L8', 'uuid_sinov', 'Navbatdagi sinov — UUID. PostgreSQL o‘n sakkizda gen random uuid bilan birga yangi uuidv7 funksiyasi qo‘shildi.'],
    ['L9', 'uuid_sinov', 'Uuid extract timestamp orqali v7 identifikatorining ichidan yaratilgan aniq vaqtni ajratib olishimiz mumkin.'],
    ['L10', 'uuid_sinov', 'Hajmni tekshirsak: uuid tipi diskda o‘n olti bayt, xuddi shu qiymatning matn ko‘rinishi esa qirq bayt joy egallaydi!'],

    ['L11', 'enum_sinov', 'Endi enum tipini sinaymiz: yangi, jarayonda va yopildi holatlarini yaratib, jadvalga teskari tartibda kiritamiz.'],
    ['L12', 'enum_sinov', 'ORDER BY bilan saralaganimizda ular alifbo bo‘yicha emas, aynan biz belgilagan tartib bo‘yicha tartiblandi. Ro‘yxatda yo‘q bekor qiymati esa rad etildi.'],
    ['L13', 'enum_sinov', 'So‘ngra ALTER TYPE yordamida bekor qiymatini yopildi dan oldin qo‘shdik va ro‘yxat kengaydi.'],

    ['L14', 'xulosa', 'Xulosa: boolean da NULL ga hushyor bo‘ling, kalitlar uchun uuidv7 dan foydalaning va enum tartibini to‘g‘ri rejalashtiring.'],
    ['L15', 'xulosa', 'Keyingi qismda MySQL va SQLite dagi o‘ziga xos farqlar va eng xavfli tuzoqlarni ko‘rib chiqamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

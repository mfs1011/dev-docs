// SQL 9-bob, 3-video: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function (g) {
  const scenes = ['intro', 'mysql_bool', 'mysql_uuid_enum', 'sqlite_tiplar', 'tuzoqlar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Har bir bazaning o‘ziga xosligi',
    mysql_bool: 'MySQL: Boolean yo‘q, TINYINT(1) tuzog‘i',
    mysql_uuid_enum: 'MySQL: UUID va indekslangan ENUM',
    sqlite_tiplar: 'SQLite: Hech qanday maxsus tip yo‘q',
    tuzoqlar: 'Amaliyotdagi eng xavfli 6 ta tuzoq',
    xulosa: 'Taqqoslash jadvali va yakun'
  };
  const hold = {
    L2: 0.8,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L14: 1.0,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Uchinchi qismda MySQL va SQLite da boolean, UUID va enum tushunchalariga qanday yondashilgani, hamda oltita xavfli tuzoqni tahlil qilamiz.'],
    ['L2', 'intro', 'Ko‘p dasturchilar bu turlarni barcha bazalarda bir xil ishlaydi deb o‘ylashadi. Biroq MySQL va SQLite dagi farqlar kutilmagan xatolarga sabab bo‘lishi mumkin.'],

    ['L3', 'mysql_bool', 'MySQL da aslida boolean turi yo‘q! Baza boolean deb yozilgan ustunlarni oddiy tayni-int bir turiga aylantiradi.'],
    ['L4', 'mysql_bool', 'Shu bois boolean ustuniga ikki yoki manfiy besh kabi sonlar ham bemalol yoziladi. Shart tekshiruvida noldan farqli barcha sonlar rost hisoblanadi.'],
    ['L5', 'mysql_bool', 'Ammo ulkan tuzoq shuki: agar WHERE ustun teng TRUE deb yozsangiz, baza faqat birga teng qatorlarni topadi va ikki yoki manfiy besh qatorlari tushib qoladi!'],

    ['L6', 'mysql_uuid_enum', 'MySQL da alohida UUID tipi ham mavjud emas. O‘rnatilgan UUID funksiyasi birinchi versiyadagi vaqt va tarmoq manziliga asoslangan qiymat beradi.'],
    ['L7', 'mysql_uuid_enum', 'Ushbu qiymatlar oldindan taxmin qilinishi mumkin, shuning uchun ularni maxfiy token sifatida ishlatish xavflidir. Ixcham saqlash uchun UUID TO BIN funksiyasi ishlatiladi.'],
    ['L8', 'mysql_uuid_enum', 'MySQL da enum ustun ichida e’lon qilinadi va ichkarida birdan boshlanuvchi raqamlar bilan saqlanadi. Noto‘g‘ri qiymat kiritilsa, eski rejimlarda nol indeksli bo‘sh satrga aylanadi.'],

    ['L9', 'sqlite_tiplar', 'Endi SQLite ga kelsak: unda boolean ham, UUID ham, enum ham mutlaqo mavjud emas!'],
    ['L10', 'sqlite_tiplar', 'Boolean o‘rniga nol va bir butun sonlari saqlanadi, ammo ustunga matn yozsangiz ham baza xato bermaydi.'],
    ['L11', 'sqlite_tiplar', 'UUID funksiyasi esa bazada umuman yo‘q, uni ilovaning o‘zida yaratish kerak. Enum o‘rniga esa CHECK cheklovidan foydalaniladi.'],

    ['L12', 'tuzoqlar', 'Birinchi tuzoq: WHERE NOT faol deb yozsangiz, NULL qiymatli qatorlar yo‘qoladi. Doimo IS NOT TRUE ishlating.'],
    ['L13', 'tuzoqlar', 'Ikkinchi tuzoq: MySQL da teng TRUE yozishdan saqlaning. Uchinchi tuzoq: UUID ni matn qilib saqlasangiz, ikki yarim baravar ko‘p disk joyi isrof bo‘ladi.'],
    ['L14', 'tuzoqlar', 'To‘rtinchi tuzoq: PostgreSQL enum dan qiymatni o‘chirib bo‘lmaydi. Agar ro‘yxat tez o‘zgaruvchan bo‘lsa, alohida jadval va tashqi kalit ishlating.'],

    ['L15', 'xulosa', 'Xulosa: PostgreSQL barcha standartlarga to‘liq javob beruvchi eng mukammal va xavfsiz tizimdir.'],
    ['L16', 'xulosa', 'Shu bilan to‘qqizinchi bob yakunlandi. Keyingi bobda NULL qiymati va ma’lumot turlarini o‘girish qoidalari bilan tanishamiz!']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

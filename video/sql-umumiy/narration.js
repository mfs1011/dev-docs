// SQL videosi — ovoz birinchi: avval shu matn ovozlanadi, keyin animatsiya so'z vaqtlariga bog'lanadi.
// Har gap: [id, sahna, matn]. Matn eshitish uchun yozilgan (video/GIT-VIDEO-USLUBI.md, 3-bo'lim saboqlari).
// Da'volar manbasi: PostgreSQL 18 hujjati — sql-select (bajarilish tartibi), indexes-intro (kitob ko'rsatkichi),
// tutorial-transactions (hammasi yoki hech biri); natijalar — natijalar.txt (sinov bazasi).
(function (g) {
  const scenes = ['intro', 'muammo', 'jadval', 'aloqa', 'select', 'join', 'group', 'dml', 'indeks', 'tx', 'tizimlar', 'xulosa'];
  const lines = [
    ['L1', 'intro', 'Salom! Bugun SQL bilan tanishamiz. Bu ma’lumotlar bazasi bilan gaplashish tili.'],

    ['L2', 'muammo', 'Tasavvur qiling, sizda kichik do‘kon bor. Mahsulotlar, mijozlar, buyurtmalar — hammasini qayerdadir yozib borish kerak.'],
    ['L3', 'muammo', 'Daftarga yozsangiz, tez orada chalkashib ketadi. Qaysi mahsulot qancha turadi? Kim nima sotib oldi? Javob topish qiyin.'],
    ['L4', 'muammo', 'Ma’lumotlar bazasi aynan shu ish uchun kerak. SQL esa bazaga savol beradigan va buyruq beradigan til.'],

    ['L5', 'jadval', 'Bazada ma’lumot jadvallarda saqlanadi. Mana, mahsulotlar jadvali.'],
    ['L6', 'jadval', 'Har bir ustunning nomi va turi bor. Nomi ustuni matn, narxi ustuni esa son.'],
    ['L7', 'jadval', 'Har bir qator bitta mahsulot. Daftar, qalam, kitob va boshqalar.'],
    ['L8', 'jadval', 'Id ustuni birlamchi kalit. U har bir qatorni boshqalaridan ajratib turadi, shuning uchun hech qachon takrorlanmaydi.'],

    ['L9', 'aloqa', 'Endi buyurtmalar jadvaliga qaraymiz. Unda mijozning ismi yozilmagan, faqat uning raqami bor.'],
    ['L10', 'aloqa', 'Bu raqam mijozlar jadvalidagi id ustuniga ishora qiladi. Buni tashqi kalit deyiladi.'],
    ['L11', 'aloqa', 'Agar mavjud bo‘lmagan mijozga buyurtma yozmoqchi bo‘lsak, baza bunga yo‘l qo‘ymaydi va xato beradi.'],

    ['L12', 'select', 'Endi bazaga savol beramiz. Narxi o‘n mingdan arzon mahsulotlarni, eng arzonidan boshlab ko‘rmoqchimiz.'],
    ['L13', 'select', 'So‘rov shunday yoziladi. Lekin baza uni yozilgan tartibda emas, o‘z tartibida bajaradi.'],
    ['L14', 'select', 'Avval FROM qaysi jadvaldan olishni aniqlaydi.'],
    ['L15', 'select', 'Keyin WHERE shartga mos kelmagan qatorlarni chiqarib tashlaydi.'],
    ['L16', 'select', 'So‘ng SELECT faqat kerakli ustunlarni qoldiradi.'],
    ['L17', 'select', 'Oxirida ORDER BY ularni narxi bo‘yicha tartiblaydi. Natija tayyor: qalam, ruchka va daftar.'],

    ['L18', 'join', 'Ba’zan javob ikki jadvalda bo‘ladi. Buyurtmada faqat mahsulot raqami bor, nomi esa mahsulotlar jadvalida.'],
    ['L19', 'join', 'JOIN ikki jadvalni bog‘laydi. Raqamlari mos kelgan qatorlarni juftlab, bitta qatorga birlashtiradi.'],
    ['L20', 'join', 'Endi har bir buyurtma yonida mahsulot nomi ko‘rinadi.'],

    ['L21', 'group', 'Har bir shaharda nechta mijozimiz bor? Buni bilish uchun qatorlarni guruhlaymiz.'],
    ['L22', 'group', 'GROUP BY bir xil shahardagi qatorlarni bitta guruhga yig‘adi. Count esa har bir guruhda nechta qator borligini sanaydi.'],
    ['L23', 'group', 'Toshkentda ikki mijoz, Samarqand va Buxoroda esa bittadan.'],

    ['L24', 'dml', 'SQL faqat o‘qimaydi, ma’lumotni o‘zgartiradi ham.'],
    ['L25', 'dml', 'INSERT yangi qator qo‘shadi.'],
    ['L26', 'dml', 'UPDATE mavjud qatorni o‘zgartiradi. Masalan, daftarning narxini.'],
    ['L27', 'dml', 'DELETE esa keraksiz qatorni o‘chiradi.'],
    ['L28', 'dml', 'WHERE shartini unutmang. Usiz UPDATE va DELETE jadvaldagi hamma qatorlarga ta’sir qiladi.'],

    ['L29', 'indeks', 'Jadval millionlab qatorga yetsa, kerakli qatorni topish sekinlashadi. Indekssiz baza jadvalni boshidan oxirigacha qatorma-qator ko‘rib chiqadi.'],
    ['L30', 'indeks', 'Indeks kitob oxiridagi alifbo ko‘rsatkichiga o‘xshaydi. Butun kitobni o‘qimasdan, kerakli sahifaga darhol o‘tasiz.'],
    ['L31', 'indeks', 'CREATE INDEX buyrug‘i shunday ko‘rsatkich yaratadi, baza esa uni o‘zi yangilab boradi.'],

    ['L32', 'tx', 'Endi pul o‘tkazmasini ko‘raylik. Ali Malikaga ellik ming so‘m o‘tkazmoqda. Buning uchun ikki amal kerak: Alining hisobidan ayirish va Malikaning hisobiga qo‘shish.'],
    ['L33', 'tx', 'Agar o‘rtada xato bo‘lsa-chi? Pul Alidan yechilib, Malikaga yetib bormasligi mumkin.'],
    ['L34', 'tx', 'Tranzaksiya bir nechta amalni bitta butunga aylantiradi. Yo hammasi bajariladi, yo hech biri.'],
    ['L35', 'tx', 'ROLLBACK boshlangan ishni bekor qiladi. COMMIT esa hammasini birdaniga saqlaydi.'],

    ['L36', 'tizimlar', 'SQL standart til. PostgreSQL, MySQL va SQLite uni deyarli bir xil tushunadi.'],
    ['L37', 'tizimlar', 'PostgreSQL va MySQL alohida server bo‘lib ishlaydi. SQLite esa dastur ichidagi bitta fayl.'],
    ['L38', 'tizimlar', 'Har birining o‘z farqlari bor. Qo‘llanmada ularni yonma-yon ko‘rib chiqamiz.'],

    ['L39', 'xulosa', 'Xulosa qilsak: ma’lumot jadvallarda saqlanadi, kalitlar ularni bog‘laydi, SELECT savol beradi, tranzaksiya esa ma’lumotni butun saqlaydi.'],
    ['L40', 'xulosa', 'E’tiboringiz uchun rahmat! Batafsil ma’lumot saytdagi SQL qo‘llanmasida.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, lines };
})(typeof window !== 'undefined' ? window : globalThis);

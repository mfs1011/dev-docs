// SQL 8-bob, 1-video: "Tushuncha" — Sana va vaqt tushunchalari
(function (g) {
  const scenes = ['intro', 'turlar', 'tz_farqi', 'mintaqalar', 'interval', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Mahalliy vaqt va lahza',
    turlar: 'PostgreSQL da sana va vaqt turlari',
    tz_farqi: 'timestamp va timestamptz farqi',
    mintaqalar: 'Vaqt mintaqalari va IANA bazasi',
    interval: 'Interval va uning uch maydoni',
    xulosa: 'Xulosa'
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
    ['L1', 'intro', 'Salom! Sakkizinchi bobda ma’lumotlar bazasidagi eng muhim va nozik mavzulardan biri — sana va vaqt bilan ishlashni o‘rganamiz.'],
    ['L2', 'intro', 'Sana va vaqtni saqlashda asosiy savol shuki: soat to‘qqiz nol nol deganda qaysi joy nazarda tutilgan? Toshkentdagi to‘qqiz va Londondagi to‘qqiz — vaqtning butunlay ikki xil lahzasidir.'],

    ['L3', 'intro', 'Shuning uchun vaqt ikki xil bo‘ladi: birinchisi kalendar va devor soatidagi mahalliy vaqt, ikkinchisi esa butun yer yuzida yagona bo‘lgan aniq lahza, ya’ni instant.'],
    ['L4', 'intro', 'Barcha mintaqalar xalqaro u-te-se vaqtidan farq bilan o‘lchanadi: masalan Toshkent u-te-se plyus besh, Moskva esa u-te-se plyus uch hisoblanadi.'],

    ['L5', 'turlar', 'PostgreSQL da sana va vaqt uchun oltita asosiy tur mavjud: to‘rt baytli date, sakkiz baytli time, timestamp va timestamptz, hamda o‘n olti baytli interval.'],
    ['L6', 'turlar', 'Date faqat kalendar sanasini, time esa kun vaqtini saqlaydi. Standart bo‘yicha shunchaki timestamp deb yozilsa, bu mintaqasiz oddiy vaqtni anglatadi.'],
    ['L7', 'turlar', 'Shuningdek time with time zone turi ham bor, biroq rasmiy hujjat uni tavsiya qilmaydi. Chunki sanasiz yozgi vaqt o‘zgarishlarini to‘g‘ri aniqlab bo‘lmaydi.'],

    ['L8', 'tz_farqi', 'Eng muhim sir: timestamptz turi nomiga qaramay mintaqani o‘zida aslo saqlamaydi!'],
    ['L9', 'tz_farqi', 'Qiymat yozilayotganda baza uni darhol u-te-se ga aylantiradi va faqat u-te-se lahzasini saqlaydi, qaysi zonadan kelgani esa eslab qolinmaydi.'],
    ['L10', 'tz_farqi', 'O‘qiyotganda esa baza ushbu lahzani sizning joriy TimeZone sozlamangizga moslab ko‘rsatadi. Oddiy timestamp esa mintaqa ko‘rsatkichlarini shunchaki tashlab yuboradi.'],

    ['L11', 'mintaqalar', 'Vaqt mintaqalari faqat geografiya emas, davlatlarning siyosiy qarorlari bilan o‘zgarib turadi. PostgreSQL ularni IANA xalqaro bazasidan oladi.'],
    ['L12', 'mintaqalar', 'Mintaqani to‘liq nom bilan, masalan Asia qiya chiziq Tashkent deb yozish eng to‘g‘ri yo‘ldir. Shunda yozgi va qishki vaqt qoidalari to‘liq hisobga olinadi.'],

    ['L13', 'interval', 'Interval turi vaqt oraliqlarini saqlaydi. Uning ichida uchta mustaqil maydon bor: oylar, kunlar va mikrosekundlar.'],
    ['L14', 'interval', 'Ular alohida saqlanadi, chunki har oyda kunlar soni har xil, yozgi vaqtga o‘tish kunida esa bir sutka yigirma uch yoki yigirma besh soat bo‘lishi mumkin.'],
    ['L15', 'interval', 'Shu bois bir kun qo‘shish va yigirma to‘rt soat qo‘shish ba’zan turli xil natija beradi.'],

    ['L16', 'xulosa', 'Xulosa qilib aytganda: aniq voqealar uchun timestamptz, oraliqlar uchun interval va kiritishda doimo ay-es-o formatidan foydalaning.'],
    ['L17', 'xulosa', 'Keyingi qismda ushbu qoidalarni PostgreSQL terminalida jonli buyruqlar orqali sinab ko‘ramiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

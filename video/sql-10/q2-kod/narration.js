// SQL 10-bob, 2-video: "Kod" — PostgreSQL 18 da jonli sinovlar
(function (g) {
  const scenes = ['intro', 'null_cmp', 'jadval_null', 'null_expr', 'type_conv', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: PostgreSQL da amaliy sinovlar',
    null_cmp: 'NULL bilan taqqoslash va 3VL',
    jadval_null: 'Jadvalda NULL va IS DISTINCT FROM',
    null_expr: 'Ifodalarda NULL va agregatsiya',
    type_conv: 'Aniq va yashirin tip konversiyasi',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L6: 1.0,
    L8: 1.0,
    L11: 1.0,
    L12: 0.8
  };
  const lines = [
    ['L1', 'intro', 'PostgreSQL o‘n sakkiz terminalida NULL qiymati va tip konversiyasi qanday ishlashini amalda tekshiramiz.'],

    ['L2', 'null_cmp', 'Birinchi so‘rovda yetti barobar NULL hamda NULL barobar NULL ni tekshiramiz. Natijada bo‘sh joy, ya’ni NULL chiqadi.'],
    ['L3', 'null_cmp', 'Ammo IS NULL hamda IS DISTINCT FROM predikatlari aniq rost, ya’ni TRUE natijasini beradi.'],

    ['L4', 'jadval_null', 'Keyingi navbatda telefonlar jadvalini yaratib, Ali, Vali va Sobir ma’lumotlarini kiritamiz.'],
    ['L5', 'jadval_null', 'Kutilmagan holat: telefoni Alinikidan farq qiladiganlarni qidirganda, Sobir ro‘yxatga kirmay qoladi! Chunki uning raqami NULL bo‘lib, teng emaslik amali ham noma’lum bo‘ldi.'],
    ['L6', 'jadval_null', 'Sobirni ham olish uchun IS DISTINCT FROM predikatini ishlatish zarur, shunda ikkita qator to‘g‘ri topiladi.'],

    ['L7', 'null_expr', 'Endi agregatsiyaga qarasak: count yulduzcha uchta qatorni sanasa, count telefon atigi ikkita qatorni ko‘rsatadi, chunki NULL hisobga kirmaydi.'],
    ['L8', 'null_expr', 'Arifmetikada bir qo‘shuv NULL natijasi NULL bo‘ladi. Ammo concat funksiyasi NULL qiymatni e’tiborsiz qoldirib, matnni to‘g‘ri ulaydi.'],

    ['L9', 'type_conv', 'Tip konversiyasida qirq ikki satrini int ga o‘girib birni qo‘shish mumkin. Noma’lum satr bir ham son bilan muammosiz qo‘shiladi.'],
    ['L10', 'type_conv', 'Biroq bir qo‘shuv bir butun o‘ndan besh satri xato beradi, chunki kontekstda faqat butun son kutilgan edi.'],
    ['L11', 'type_conv', 'Jadvaldagi sonlar bilan matnli ustunni solishtirganda ham Postgres qat’iy operator mavjud emas degan xatoni chiqaradi.'],

    ['L12', 'xulosa', 'Ko‘rib turganingizdek, xatolarning oldini olish uchun NULL predikatlarini to‘g‘ri qo‘llash va tiplarni aniq kast qilish shart.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

// narration.js — 40-bob: Qidiruv
(function (g) {
  const scenes = [
    'grep_basics',
    'grep_trees',
    'grep_context_logic',
    'log_pickaxe',
    'log_g_diff',
    'log_l_and_grep'
  ];

  const sceneNames = {
    grep_basics: "Qidiruv Savollari va git grep Asoslari",
    grep_trees: "Turli Qatlamlar va Commitlarda Qidiruv",
    grep_context_logic: "Funksiya Konteksti va Mantiqiy Regex",
    log_pickaxe: "git log -S (Pickaxe): Satr Qachon Qo'shildi / O'chdi",
    log_g_diff: "git log -G vs -S: Qiymat O'zgarishi va Diff Tahlili",
    log_l_and_grep: "git log -L va --grep: Funksiya Tarixi va Xabarlar"
  };

  const hold = {
    l2: 1.5,
    l4: 2.0,
    l6: 2.0,
    l8: 2.0,
    l10: 2.0,
    l12: 2.0
  };

  const lines = [
    {
      id: 'l1',
      scene: 'grep_basics',
      text: "Katta loyihalarda ma'lum bir funksiya yoki o'zgaruvchi qayerda e'lon qilinganini tezkor topish uchun ko'p oqimli va aqlli git grep buyrug'i ishlatiladi."
    },
    {
      id: 'l2',
      scene: 'grep_basics',
      text: "Oddiy tizim grep buyrug'idan farqli ravishda u faqat Git kuzatuvidagi fayllarni tekshiradi hamda qator raqami va mos fayllar sonini qulay chiqaradi."
    },
    {
      id: 'l3',
      scene: 'grep_trees',
      text: "git grep nafaqat ishchi katalogda, balki minus-minus cached bilan indexda yoki istalgan eski teg va commit daraxtida to'g'ridan-to'g'ri qidira oladi."
    },
    {
      id: 'l4',
      scene: 'grep_trees',
      text: "Bu esa branch almashtirmasdan yoki fayllarni qayta yuklamasdan turib o'tmishdagi konfiguratsiyalarni bir zumda tekshirish imkonini beradi."
    },
    {
      id: 'l5',
      scene: 'grep_context_logic',
      text: "Minus p va minus W kalitlari mos qator aynan qaysi funksiya ichida joylashganini va uning butun tanasini terminalda yaqqol ko'rsatib beradi."
    },
    {
      id: 'l6',
      scene: 'grep_context_logic',
      text: "Shuningdek minus-minus and, or va not operatorlari bir nechta shartlarni bitta qatorda mantiqiy bog'lash orqali murakkab qidiruvni amalga oshiradi."
    },
    {
      id: 'l7',
      scene: 'log_pickaxe',
      text: "Kod qachon tug'ilgan yoki qachon o'chirilgan degan savolga javob topish uchun git log minus S, ya'ni pickaxe mexanizmi yordamga keladi."
    },
    {
      id: 'l8',
      scene: 'log_pickaxe',
      text: "U butun tarix bo'ylab matnning uchrashlar soni o'zgargan nuqtalarni qazib topadi va keraksiz oraliq commitlarni chetlab o'tadi."
    },
    {
      id: 'l9',
      scene: 'log_g_diff',
      text: "Agar satr soni emas, balki konstanta qiymati o'zgargan bo'lsa, commit diffidagi qatorlarni qidiruvchi git log minus G buyrug'idan foydalaniladi."
    },
    {
      id: 'l10',
      scene: 'log_g_diff',
      text: "Minus G diffdagi har bir qo'shilgan va o'chirilgan qatorni regex bo'yicha tahlil qiladi hamda murakkab mantiqiy yangilanishlarni aniqlaydi."
    },
    {
      id: 'l11',
      scene: 'log_l_and_grep',
      text: "git log minus L orqali aniq bir qatorlar oralig'i yoki butun bir funksiyaning boshidan oxirigacha bo'lgan to'liq evolyutsiya tarixini ko'rish mumkin."
    },
    {
      id: 'l12',
      scene: 'log_l_and_grep',
      text: "Commit xabarlari ichidan vazifalar va izohlarni topish uchun esa git log minus-minus grep buyrug'i qulay vosita hisoblanadi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);

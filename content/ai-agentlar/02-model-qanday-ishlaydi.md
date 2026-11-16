# 02 — Model qanday ishlaydi

[Mundarija](README.md)

Agent bilan yaxshi ishlash uchun model qanday tuzilganini bilish shart emas. Lekin uchta narsani bilish kerak, chunki
keyingi boblardagi deyarli har bir maslahat shularga borib taqaladi:

1. Model nimani "biladi" va nimani bilmaydi.
2. Kontekst oynasi nima va u to'lganda nima bo'ladi.
3. Model nega ishonch bilan noto'g'ri gapirishi mumkin.

## Tushuncha

### Model (LLM)

CP (Glossary): **katta til modeli** (LLM, large language model) — juda ko'p parametrga ega AI til modeli. U juda katta hajmdagi
matnda o'qitilgan. Matn yoza oladi, savolga javob beradi, ma'lumotni qisqartiradi va hokazo.

Model ikki bosqichda tayyorlanadi (CP Glossary):

| Bosqich | Nima bo'ladi |
| --- | --- |
| **Dastlabki o'qitish** (pretraining) | Model katta, belgilanmagan matn to'plamida o'qitiladi. Claude'ning asosidagi model oldingi matnga qarab **keyingi so'zni bashorat qilishga** o'rgatilgan. Bunday model o'z-o'zidan savolga javob berish yoki ko'rsatmaga amal qilishni yaxshi bilmaydi |
| **Moslash** (fine-tuning, RLHF) | Qo'shimcha ma'lumot va inson baholari bilan model foydali yordamchi bo'lishga o'rgatiladi. RLHF'da odamlar bir nechta javobni yaxshidan yomonga tartiblaydi va model yuqori baholangan javoblarga o'xshash javob berishga o'rganadi |

Bundan amaliy xulosa chiqadi: model o'qitilgan sanadan keyingi narsani bilmaydi. CP (Models overview) har model uchun
**ishonchli bilim chegarasi**ni (reliable knowledge cutoff) ko'rsatadi: modelning bilimi shu sanagacha eng to'liq va
ishonchli. Bu sanadan keyin chiqqan kutubxona versiyasi, yangi API yoki loyihangizning ichki kodi modelning xotirasida yo'q.
Bunday ma'lumotni model faqat **kontekstdan** oladi.

### Token

CP (Glossary): **token** — til modeli ishlaydigan eng kichik birlik. U so'z, so'z bo'lagi, belgi yoki hatto bayt bo'lishi
mumkin. Siz yuborgan matn avval tokenlar ketma-ketligiga aylantiriladi, model shu tokenlar bilan ishlaydi.

Bitta token nechta belgiga teng ekani **model va tilga** bog'liq. CP ikkita raqam beradi:

- eski Claude modellarida bir token taxminan 3,5 ta inglizcha belgiga teng;
- Claude 4.7 va undan keyingi modellar yangi tokenizatordan foydalanadi. U shu matnga taxminan 30% ko'proq token beradi.

O'zbekcha matn uchun hujjatda raqam yo'q. Aniq sonni bilish uchun CP tavsiyasi — tanlangan model bilan **token sanash**
(token counting) API'si.

Token nega muhim:

- kontekst oynasining hajmi tokenlarda o'lchanadi;
- narx tokenlarda hisoblanadi (41-bob);
- javob tezligi ham chiqariladigan tokenlar soniga bog'liq.

### Kontekst oynasi

CP (Context windows): **kontekst oynasi** (context window) — model javob yozayotganda murojaat qila oladigan butun matn.
Bunga yozilayotgan javobning o'zi ham kiradi. Hujjat buni modelning **ish xotirasi** (working memory) deb ataydi. U model
o'qitilgan katta ma'lumot to'plamidan butunlay boshqa narsa.

```text
┌──────────────────────── Kontekst oynasi ────────────────────────┐
│ tizim ko'rsatmalari · tool tavsiflari · CLAUDE.md               │
│ 1-xabaringiz → javob → tool natijasi (fayl, buyruq chiqishi)    │
│ 2-xabaringiz → javob → tool natijasi → ...                      │
│ hozirgi xabaringiz → [model yozayotgan javob]                   │
└─────────────────────────────────────────────────────────────────┘
   ↑ har yangi qadamda butun shu matn modelga qaytadan beriladi
```

CP bo'yicha har bir navbatda (turn) shunday bo'ladi:

- **Kirish:** oldingi butun suhbat tarixi va hozirgi xabar.
- **Chiqish:** model yozgan javob. U keyingi navbat uchun kirishning bir qismiga aylanadi.

Kontekstga hamma narsa kiradi: tizim ko'rsatmasi (system prompt), har bir xabar, tool natijalari, rasmlar va hujjatlar,
tool tavsiflari. Modelning javobi, jumladan fikrlash qismi ham kiradi.

Agentda kontekst ayniqsa tez to'ladi, chunki agent har o'qigan fayl va har ishga tushirgan buyruq natijasini kontekstga
qo'shadi. CC (Explore the context window) Claude Code sessiyasida nima qachon yuklanishini ko'rsatadi:

| Qachon | Kontekstga nima qo'shiladi |
| --- | --- |
| Siz hali hech narsa yozmasdan | CLAUDE.md, auto memory, MCP tool nomlari, skill tavsiflari |
| Agent ishlayotganda | Har o'qilgan fayl, mos papka qoidalari, hook natijalari |
| Subagent ishlatilganda | Subagent o'z alohida oynasida ishlaydi; sizning oynangizga faqat xulosa qaytadi |

**Hajmi.** CP (Context windows) bo'yicha hozirgi Claude modellarining katta qismida (Fable 5.x, Opus 4.6 va keyingilari,
Sonnet 4.6 va keyingilari, Haiku 5.5) oyna 1 million tokenga teng. Bitta so'rov ko'pi bilan 128 ming token chiqara oladi.
Qolgan modellarda oyna 200 ming token. Aniq ro'yxat uchun CP'dagi modellar jadvaliga qarang.

**To'lsa nima bo'ladi.** Claude Code oyna chegarasiga yaqinlashganda suhbatni avtomatik **qisqartiradi** (compaction): eski
qismini xulosa bilan almashtiradi (CC How Claude Code works). Xulosada so'rovlaringiz va muhim kod bo'laklari saqlanadi,
lekin suhbat boshidagi batafsil ko'rsatmalar yo'qolishi mumkin. Shuning uchun doimiy qoidalar suhbatda emas, CLAUDE.md'da
turishi kerak (13-bob). Qisqartirish qanday ishlashi — 15-bob.

### Kontekst ko'p bo'lsa — yaxshi emas: context rot

CP (Context windows): katta oyna modelga uzunroq va murakkabroq so'rovni qabul qilish imkonini beradi, lekin **ko'proq kontekst
o'z-o'zidan yaxshiroq emas**. Token soni oshgani sari model eslab qolish va aniqlikni yo'qota boshlaydi. Bu hodisa
**context rot** (kontekstning "chirishi") deb ataladi. Hujjat xulosasi: kontekstga nima kirishini tanlash bo'sh joy
qanchaligidan kam muhim emas.

AE (Effective context engineering, 2025-09-29) sababini tushuntiradi:

- LLM'lar **transformer** arxitekturasiga asoslangan. Unda har bir token kontekstdagi har bir boshqa tokenga "qaray"
  oladi. n ta token uchun bu n² juft bog'lanish degani.
- Shuning uchun modelda **diqqat byudjeti** (attention budget) bor: kontekst qancha uzun bo'lsa, diqqat shuncha ko'p joyga
  bo'linadi.
- Xulosa: kontekst — **cheklangan resurs**, unga qo'shilgan har bir keyingi token kamroq foyda beradi.

AE asosiy tamoyili: kerakli natija ehtimolini eng ko'p oshiradigan, **eng kichik, lekin eng foydali tokenlar to'plamini**
topish. Bu kitobdagi ko'p maslahat shu tamoyilning amaliy ko'rinishi:

- vazifalar orasida `/clear` qilish (15-bob);
- CLAUDE.md'ni qisqa tutish (13-bob);
- katta qidiruvni subagentga berish (30-bob).

CC (Best practices) muhim aniqlik kiritadi. "Kontekst — asosiy cheklov, uni qattiq boshqaring" degan maslahat endi
eskirgan: hozirgi ko'p modellarda 1M oyna bor va qisqartirish o'zi ishlaydi, shuning uchun kontekst kamdan-kam tugaydi.
Lekin vazifalar orasida `/clear` qilish baribir foydali, chunki toza kontekst yaxshiroq javob beradi va arzonroq tushadi.

### Bir xil savol — har xil javob

CP (Glossary): **harorat** (temperature) — model javob yozayotganda tasodifiylikni boshqaradigan parametr. Yuqori haroratda
javoblar xilma-xilroq, pastida esa eng ehtimolli so'zlarga yopishib qoladi. Lekin hujjat ogohlantiradi: harorat 0 bo'lsa
ham natija to'liq bir xil bo'lmaydi, bir xil kirish har xil chiqish berishi mumkin.

Amaliy xulosa: agentga bir vazifani ikki marta bersangiz, u ikki xil yo'l tanlashi mumkin. Shuning uchun "bu safar ishladi"
ishonchlilik isboti emas. Natijani doimiy tekshiruv (test, typecheck) tasdiqlashi kerak (8-bob).

### Gallyutsinatsiya

CP (Reduce hallucinations): eng rivojlangan modellar ham ba'zan faktik jihatdan noto'g'ri yoki berilgan kontekstga zid matn
yozadi. Bu **gallyutsinatsiya** (hallucination) deb ataladi. Kodda bu, masalan, mavjud bo'lmagan funksiya, noto'g'ri
parametr nomi yoki o'qilmagan fayl haqidagi ishonchli "tushuntirish" ko'rinishida chiqadi.

CP (Prompting best practices): yangi Claude modellari gallyutsinatsiyaga kamroq moyil va kodga tayangan aniqroq javob beradi.
Lekin CP (Reduce hallucinations) yakunida aniq aytilgan: usullar gallyutsinatsiyani sezilarli kamaytiradi, **butunlay yo'q
qilmaydi**, muhim ma'lumotni doim tekshirish kerak.

CP tavsiya qilgan usullar:

| Usul | Mazmuni |
| --- | --- |
| "Bilmayman" deyishga ruxsat | Modelga ishonchsiz bo'lsa buni ochiq aytishga ruxsat bering. Hujjat bo'yicha bu soxta ma'lumotni keskin kamaytiradi |
| Iqtibosga tayanish | Uzun hujjatda (20 ming tokendan ortiq) avval aynan iqtiboslarni ajratib olishni, keyin ularga tayanib ishlashni so'rang |
| Manba bilan tekshirish | Har bir da'vo uchun iqtibos yoki manba ko'rsatishni so'rang. Tasdiq topilmasa, da'vo olib tashlansin |
| Bir necha marta yuritish (best-of-N) | Bir so'rovni bir necha marta yuritib natijalarni solishtiring. Javoblar bir-biriga zid bo'lsa, bu gallyutsinatsiya belgisi bo'lishi mumkin |
| Tashqi bilimni cheklash | Faqat berilgan hujjatlardagi ma'lumotdan foydalanishni, umumiy bilimga tayanmaslikni ayting |

Agentda eng kuchli himoya — modelni taxmin qilish o'rniga **o'qishga** majburlash. Agent faylni o'zi ochib ko'ra oladi,
shuning uchun kod haqida "eslab" gapirishiga hojat yo'q.

## Amalda

CP (Prompting best practices) agent bilan kod yozishda gallyutsinatsiyani kamaytirish uchun shunday ko'rsatma beradi:

```text
<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file,
you MUST read the file before answering. Make sure to investigate and read relevant
files BEFORE answering questions about the codebase. Never make any claims about code
before investigating unless you are certain of the correct answer - give grounded and
hallucination-free answers.
</investigate_before_answering>
```

Ma'nosi: ochmagan kodingiz haqida taxmin qilmang. Foydalanuvchi aniq faylni tilga olsa, javob berishdan oldin uni
albatta o'qing. Kod bazasi haqidagi savolga javob berishdan oldin tegishli fayllarni o'rganing.

Bu ko'rsatmani har safar yozish shart emas. Uni bir marta loyiha ko'rsatmalariga (CLAUDE.md, 13-bob) qo'yish mumkin. Kundalik
so'rovda esa uning ruhini saqlash kifoya:

| Yomon | Yaxshi |
| --- | --- |
| `parseInvoice qanday ishlaydi?` | `src/billing/parse.ts dagi parseInvoice ni o'qib, qaysi formatlarni qabul qilishini tushuntir. Faqat koddagi narsaga tayan.` |
| `Bu kutubxonaning yangi versiyasida nima o'zgardi?` | `package.json dagi versiyani tekshir va kutubxonaning CHANGELOG.md sidan shu versiyagacha o'zgarishlarni topib ber.` |

Ikkinchi qatordagi farq muhim. Model yangi versiyani bilim chegarasidan keyin chiqqani uchun bilmasligi mumkin. Yaxshi
so'rov uni xotirasidan emas, **fayldan** o'qishga yo'naltiradi.

## Variantlar

Model kontekstga sig'magan yoki xotirasida yo'q narsani qayerdan olishi mumkin:

| Usul | Qachon | Yutug'i | Kamchiligi |
| --- | --- | --- | --- |
| Model xotirasi | Umumiy, barqaror bilim: til sintaksisi, mashhur algoritmlar | Tez, kontekst sarflamaydi | Bilim chegarasidan keyingi narsani bilmaydi; adashsa, ishonch bilan adashadi |
| Faylni o'qitish | Loyiha kodi, konfiguratsiya, CHANGELOG | Aniq, tekshirib bo'ladi | Har o'qilgan fayl kontekstni egallaydi |
| Doimiy ko'rsatma (CLAUDE.md) | Har sessiyada kerak bo'ladigan qoida va buyruqlar | Har safar avtomatik yuklanadi, qisqartirishdan keyin ham qaytadi | Har sessiyada kontekst egallaydi, shuning uchun qisqa bo'lishi kerak |
| Tashqi manba (veb, MCP) | Yangi hujjat, tashqi tizimdagi ma'lumot | Eng yangi ma'lumot | Kontekst egallaydi; tashqi matnda zararli ko'rsatma bo'lishi mumkin (37-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Model yangi kutubxona versiyasini biladi deb hisoblash | CP: modelning ishonchli bilimi ma'lum sanagacha | Versiyaga bog'liq savolda hujjat yoki CHANGELOG'ni o'qitib bering |
| Hamma narsani kontekstga tiqish ("har ehtimolga") | CP: token oshgani sari aniqlik pasayadi (context rot) | Faqat vazifaga kerak narsani bering; vazifalar orasida `/clear` |
| Muhim qoidani faqat suhbat boshida aytish | CC: qisqartirishda suhbat boshidagi ko'rsatmalar yo'qolishi mumkin | Doimiy qoidani CLAUDE.md'ga yozing |
| Bitta muvaffaqiyatli natijani ishonchli deb hisoblash | CP: harorat 0 bo'lsa ham javob har xil bo'lishi mumkin | Natijani test va boshqa avtomatik tekshiruv bilan tasdiqlang |
| Ishonch bilan aytilgan javobni to'g'ri deb qabul qilish | CP: usullar gallyutsinatsiyani kamaytiradi, butunlay yo'q qilmaydi | Muhim da'vo uchun manba yoki fayl joyini so'rang va o'zingiz tekshiring |

## Amaliyot

1. Dastlabki o'qitish (pretraining) va moslash (fine-tuning, RLHF) farqi nima?
2. Model nega loyihangizning ichki kodini "bilmaydi"? U bu ma'lumotni qayerdan oladi?
3. Kontekst oynasiga nimalar kiradi?
4. Context rot nima va AE uni qanday tushuntiradi?
5. Hozirgi ko'p modellarda oyna 1M token. Unda nega vazifalar orasida `/clear` qilish baribir foydali?
6. Nega bir xil so'rov ikki marta har xil natija berishi mumkin?
7. Gallyutsinatsiyani kamaytirishning uchta usulini ayting. Ular uni butunlay yo'q qiladimi?

<details>
<summary>Javoblar</summary>

1. Dastlabki o'qitishda model katta matn to'plamida oldingi matnga qarab keyingi so'zni bashorat qilishga o'rganadi. Moslashda qo'shimcha ma'lumot va inson baholari bilan foydali yordamchi bo'lishga, ko'rsatmalarga amal qilishga o'rgatiladi.
2. Model faqat o'qitilgan ma'lumotni va ishonchli bilim chegarasigacha bo'lgan narsani biladi. Loyiha kodi u yerda yo'q, shuning uchun model uni faqat kontekstdan oladi: o'qilgan fayllar, CLAUDE.md, siz bergan ma'lumot.
3. Tizim ko'rsatmasi, tool tavsiflari, barcha xabarlar, tool natijalari (o'qilgan fayllar, buyruq chiqishlari), rasmlar va hujjatlar, modelning javobi. Claude Code'da bularga CLAUDE.md, auto memory va skill tavsiflari ham qo'shiladi.
4. Token soni oshgani sari model eslab qolish va aniqlikni yo'qotishi. AE: transformer'da har token har tokenga qaraydi (n² bog'lanish), modelning diqqat byudjeti cheklangan, shuning uchun har qo'shimcha token kamroq foyda beradi.
5. CC: toza kontekst yaxshiroq javob beradi va arzonroq tushadi. Eski suhbat keyingi vazifaga kerakli fayllarni siqib chiqaradi va har xabarda token sarflaydi.
6. Model javobda tasodifiylik bor. CP: harorat 0 bo'lsa ham bir xil kirish har xil chiqish berishi mumkin.
7. "Bilmayman" deyishga ruxsat berish, iqtiboslarga tayanish, har da'vo uchun manba so'rash (yana: best-of-N, tashqi bilimni cheklash, agentda faylni o'qishga majburlash). Yo'q, CP bo'yicha ular gallyutsinatsiyani kamaytiradi, lekin butunlay yo'q qilmaydi.

</details>

## Rasmiy hujjat

- [CP: Glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- [CP: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [CP: Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [CP: Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [CP: Prompting best practices — Minimizing hallucinations in agentic coding](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [AE: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [CC: Explore the context window](https://code.claude.com/docs/en/context-window)
- [CC: How Claude Code works — The context window](https://code.claude.com/docs/en/how-claude-code-works#the-context-window)
- [CC: Best practices — What you can stop doing](https://code.claude.com/docs/en/best-practices#what-you-can-stop-doing)

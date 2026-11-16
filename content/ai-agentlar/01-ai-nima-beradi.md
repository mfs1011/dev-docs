# 01 — AI dasturchiga nima beradi

[Mundarija](README.md)

## Tushuncha

Bugun dasturchi AI bilan uch xil ishlaydi. Ular bir-biridan "AI qancha ishni o'zi qiladi" degan savol bilan farq qiladi:

| Ko'rinish | Siz nima qilasiz | AI nima qiladi | Misol vosita |
| --- | --- | --- | --- |
| **Avtoto'ldirish** (inline suggestions) | Kod yozasiz | Kursor turgan joyda keyingi qatorlarni taklif qiladi; siz qabul qilasiz yoki rad etasiz | Copilot inline suggestions |
| **Chat** | Savol berasiz, javobni o'qiysiz, keyingi savolni yozasiz | Javob yoki kod bo'lagi qaytaradi | Copilot Chat |
| **Agent** | Maqsad, kontekst va chegarani aytasiz, keyin natijani tekshirasiz | O'zi qadam tanlaydi: fayllarni o'qiydi, kodni o'zgartiradi, buyruqlarni ishga tushiradi, natijaga qarab yo'lini o'zgartiradi | Claude Code, Codex, Copilot cloud agent |

### Avtoto'ldirish va chat

GH (Best practices) ikki vositani alohida ajratadi. **Avtoto'ldirish** quyidagi holatlarda eng yaxshi ishlaydi:

- yozayotgan kod bo'lagi, o'zgaruvchi va funksiya nomini davom ettirish;
- takrorlanadigan kod;
- oddiy tilda yozilgan izohdan (comment) kod hosil qilish;
- test-driven development (avval test, keyin kod) uchun testlar.

**Chat** esa boshqa ishlar uchun:

- kod haqidagi savolga oddiy tilda javob;
- katta kod bo'lagini yozdirib, keyin uni bosqichma-bosqich moslash;
- chatning o'rnatilgan buyruqlari bilan tez-tez uchraydigan vazifalar;
- biror rolni (persona) olib ishlash — masalan, "sen kod sifatiga qattiq qaraydigan katta C++ dasturchisisan, shu kodni ko'rib chiq".

### Agent

CX (Working with agents) agentni shunday ta'riflaydi: **agent** — sizning nomingizdan vazifani bajara oladigan AI tizimi. Siz
nimaga erishmoqchi ekaningizni aytasiz; u keyingi qadamni tanlaydi, mavjud vositalardan (tool) foydalanadi va topgan
narsasiga qarab yo'lini o'zgartiradi.

Chatda har bir qadamni siz boshqarasiz: savol → javob → yangi savol. Agentga esa maqsadni berasiz va u ikki xabaringiz
orasida bir nechta qadamni o'zi bajaradi. CX bu farqni shunday jadvalda ko'rsatadi:

| Nima o'zgaradi | AI bilan chat | Agentga topshirish |
| --- | --- | --- |
| Qanday boshlaysiz | Savol berasiz yoki g'oyani birga o'ylaysiz | Natijani, kerakli kontekstni va chegaralarni tasvirlaysiz |
| Keyin nima bo'ladi | Odatda keyingi qadamni siz yangi xabar bilan boshqarasiz | Agent maqsad sari bir nechta qadamni o'zi tanlab bajaradi |
| Nima olasiz | Ishlatish, so'roq qilish yoki aniqlashtirish mumkin bo'lgan javob | Tekshirilishi kerak bo'lgan ish, natijalar, savollar yoki to'siqlar |
| Sizning rolingiz | Suhbatni yo'naltirish va javobni tekshirish | Yo'nalish berish, jarayonni kuzatish va natija bilan nima qilishni hal qilish |

CX ogohlantiradi: chegaralar qat'iy emas. Chat ham vosita ishlatishi mumkin, agentni ham suhbat orqali boshqarasiz. Bular
alohida dasturlar emas, AI bilan ishlashning ikki uslubi.

CX bo'yicha agent uch qismdan iborat:

1. **Model** — vazifani tushunadi va keyingi qadamni rejalaydi.
2. **Vositalar** (tools) — ma'lumot yig'adi yoki harakat qiladi (faylni o'qish, buyruq ishga tushirish).
3. **Chegaralar va inson nazorati** (guardrails and human oversight) — nimaga ruxsat borligini belgilaydi va ishni
   yo'naltiradi.

Bu qismlar qanday bog'lanishini 3-bob batafsil ko'rsatadi.

### Agent nima uchun avtoto'ldirishdan kuchliroq

CC (How Claude Code works): agent butun loyihani ko'radi, shuning uchun butun loyiha bo'ylab ishlay oladi. "Autentifikatsiya
xatosini tuzat" desangiz, u kerakli fayllarni qidiradi, bir nechta faylni o'qib kontekstni tushunadi, ularni birgalikda
o'zgartiradi, tuzatishni testlar bilan tekshiradi va so'rasangiz commit qiladi. Hujjat buni faqat ochiq turgan faylni
ko'radigan avtoto'ldirish vositalaridan asosiy farq deb ataydi.

Claude Code ishga tushirilgan papkada agent quyidagilarga kira oladi (CC):

- **loyihangiz** — papka va ichki papkalardagi fayllar, ruxsatingiz bilan boshqa joylardagi fayllar ham;
- **terminalingiz** — siz ishga tushira oladigan har qanday buyruq: build, git, paket menejerlari, skriptlar;
- **git holati** — joriy branch, commit qilinmagan o'zgarishlar, oxirgi commit'lar;
- **loyiha ko'rsatmalari** — CLAUDE.md fayli (13-bob);
- **ulangan kengaytmalar** — MCP serverlar, skill'lar, subagentlar (V qism).

## AI nimada kuchli

Uchta rasmiy manba deyarli bir xil ro'yxat beradi.

GH (Best practices) — Copilot eng yaxshi bajaradigan ishlar:

- testlar va takrorlanadigan kod yozish;
- xatoni topish (debug) va sintaksisni tuzatish;
- kodni tushuntirish va izoh yozish;
- muntazam ifodalar (regular expressions) yozish.

CC (Overview) — kunni yeb qo'yadigan zerikarli ishlar:

- testi yo'q kodga test yozish;
- butun loyihadagi lint xatolarini tuzatish;
- merge konfliktlarini hal qilish;
- bog'liqliklarni (dependencies) yangilash;
- reliz izohlari (release notes) yozish.

Bundan tashqari CC'da sanalgan kattaroq ishlar:

- oddiy tilda tasvirlangan funksiyani rejalab, bir nechta faylda yozib, ishlashini tekshirish;
- xato xabari yoki belgisi bo'yicha sababini kod bazasidan topib tuzatish;
- branch ochish, commit xabari yozish, PR ochish.

CC (Overview) dagi misol — agentga bir buyruq bilan butun siklni berish:

```bash
claude "write tests for the auth module, run them, and fix any failures"
```

Bu yerda agent testni yozadi, ishga tushiradi va yiqilganini tuzatadi. Avtoto'ldirish faqat birinchi qadamda yordam
bera oladi.

## AI nimada zaif

GH (Best practices) bo'yicha Copilot quyidagilar uchun **mo'ljallanmagan**:

- dasturlash va texnologiyaga aloqasi yo'q savollarga javob berish;
- sizning tajriba va ko'nikmangiz o'rnini bosish. Hujjat so'zi bilan: "boshqaruvchi — siz, Copilot esa xizmatingizdagi
  kuchli vosita".

CX (Working with agents) yana bir chegarani ko'rsatadi. Agentga ishni hamkasbga topshirgandek topshirasiz, lekin agentda
hamkasbning tashkilotingizdagi tajribasi ham, natija uchun javobgarligi ham yo'q. Hamkasb allaqachon biladigan narsani
agentga tushuntirishingizga to'g'ri keladi.

CC (Best practices) agent koddan o'qib bila olmaydigan narsalarga misol keltiradi:

- kimningdir boshida turgan deploy jarayoni;
- hech qachon o'qilmasligi kerak bo'lgan fayl;
- ish "tayyor" hisoblanishi uchun albatta o'tishi kerak bo'lgan tekshiruv;
- sarflash mumkin bo'lgan byudjet.

Hujjat bo'yicha sessiya kutilgandek ketmasa, sabab deyarli har doim to'rttadan biri:

| Belgi | Sabab | Qayerda o'rganamiz |
| --- | --- | --- |
| Agent siz o'ylagandan boshqa narsa qurdi yoki har sessiyada bir faktni qaytadan qidiradi | Repo'dan olib bo'lmaydigan ma'lumot yetishmayapti | 6-bob, III qism |
| "Tayyor" dedi, lekin to'liq tayyor emas | O'z ishini tekshirish usuli yo'q edi | 8-bob |
| Repo'da hech qachon bo'lmasligi kerak bo'lgan narsani qildi yoki majburiy qadamni o'tkazib yubordi | Faqat so'rov (prompt) bilan buni kafolatlab bo'lmaydi | 26, 35-boblar |
| To'g'ri qildi, lekin vazifaga arzimaydigan darajada ko'p vaqt, token yoki ruxsat so'rovi ketdi | Standart sozlamalar bu vazifaga mos emas | VIII qism |

Modelning o'zi ham xato qiladi: GH bo'yicha Copilot "xato qilishi mumkin bo'lgan vosita". Model nega ishonch bilan
noto'g'ri gapirishi mumkinligini 2-bob tushuntiradi.

## Qachon agentga topshirish kerak

CX (Working with agents) mezoni: maqsadga yetish uchun bir nechta qadam kerak bo'lsa va keyingi qadam topilgan narsaga
bog'liq bo'lsa, agent foydali. Tez javob kerak bo'lsa yoki biror narsani bosqichma-bosqich birga o'ylamoqchi bo'lsangiz,
chat yetarli. Qadamlari doim bir xil takrorlanadigan ish uchun oldindan yozilgan jarayon (workflow) mos keladi.

Topshirishdan oldin CX uchta savol beradi:

1. Natijani va "tayyor" nimani anglatishini tasvirlab bera olamanmi?
2. Agent kerakli ma'lumot va vositalarga yeta oladimi?
3. Natijani baholay olamanmi va biror narsa noto'g'ri ketsa, holatni tiklay olamanmi?

Kamida bittasiga "yo'q" desangiz, vazifani toraytiring. CX maslahati: kichik topshiriqdan boshlang. Natijani hali
baholay olmasangiz, doirani qisqartiring yoki baholay oladigan odamni jalb qiling. Agent texnik jihatdan bajara oladigan
vazifa ham shunchalik ko'p nazorat talab qilishi mumkinki, oddiyroq yo'l foydaliroq bo'lib chiqadi.

Narx haqida CX ogohlantiradi: agent tez chatdan ko'ra uzoqroq ishlashi va qimmatroq tushishi mumkin, chunki rejalash, vosita
ishlatish, natijani tekshirish va boshqa yo'lni sinash vaqt oladi. Butun vazifa qiymatini baholang: natija sifati, agentga
tushuntirish va tekshirishga ketgan vaqtingiz, kutish, tuzatishlar va narx. Ko'proq vaqt yoki pul o'z-o'zidan yaxshiroq
natija kafolati emas.

## Javobgarlik sizda qoladi

Uchta manba bir fikrda.

- **GH:** Copilot xato qilishi mumkin, u taklif qilgan kodni har doim tekshirish kerak.
- **CX:** ish ishlatishga tayyormi yoki yo'qligini hal qilish javobgarligi sizda qoladi.
- **CC (Best practices):** "oxirgi so'z kimda" degan savolga ikki javob bor. Agentning o'zi nima qilgani haqidagi xulosasi
  — bu iltimos darajasidagi narsa. Kafolat esa branch himoyasi (branch protection) va merge'ni tasdiqlaydigan inson.

GH tekshirish uchun uch qoida beradi:

1. **Kodni qo'llashdan oldin tushuning.** Tushunmasangiz, chatdan tushuntirib berishni so'rang.
2. **Diqqat bilan ko'rib chiqing.** Faqat ishlashi va xavfsizligiga emas, o'qilishi va kelajakda qo'llab-quvvatlanishiga
   ham qarang.
3. **Avtomatik tekshiruvlardan foydalaning.** Linting, kod skanerlash (code scanning) va IP skanerlash xavfsizlik hamda
   aniqlik uchun qo'shimcha qatlam beradi.

CX qo'shimcha qiladi: agent bajargan qadamlar, manbalar va vosita harakatlarini tekshiring. So'ralgan harakat haqiqatan
bajarilganmi, shuni ham ko'ring. Ravon yozilgan matn yoki ishonchli xulosa vazifa bajarilganini isbotlamaydi. Tekshirish
chuqurligi oqibatga mos bo'lsin: boshqalarga ta'sir qiladigan, umumiy ma'lumotni o'zgartiradigan yoki qaytarib bo'lmaydigan
ishga ko'proq e'tibor bering.

Natijani ko'rgach, CX uch yo'ldan birini tanlashni taklif qiladi:

| Qaror | Qachon |
| --- | --- |
| **Davom ettirish** | Natija topshiriqqa mos, muhim tafsilotlar asoslangan, keyingi qadam kelishilgan chegara ichida |
| **Yo'nalishni to'g'rilash** | Muammoni aniq ayting va tor tuzatish bering: nimani qayta ishlash, kengaytirish yoki aniqlashtirish kerak |
| **To'xtab qaror qilish** | Ruxsat yetishmaydi, ochiq qaror bor yoki tasdiq talab qiladigan harakat kutilmoqda |

## Variantlar

| Usul | Qachon tanlash | Yutug'i | Kamchiligi |
| --- | --- | --- | --- |
| Avtoto'ldirish | Kodni o'zingiz yozyapsiz, qo'l bilan yozish tezlashsin desangiz | Oqimni buzmaydi, har taklifni ko'z oldingizda qabul qilasiz | Faqat joriy fayl atrofini ko'radi; buyruq ishga tushirmaydi, o'zini tekshirmaydi |
| Chat | Savol, tushuntirish, kod bo'lagi, g'oyani muhokama qilish | Tez, arzon, har qadam siz nazoratingizda | Har qadamni siz boshqarasiz; natijani loyihaga o'zingiz ko'chirib, o'zingiz sinaysiz |
| Agent | Bir nechta qadamli, keyingi qadami topilganiga bog'liq vazifa | Butun loyihada ishlaydi, buyruq ishga tushiradi, o'z ishini tekshira oladi | Uzoqroq va qimmatroq; topshiriq va tekshiruv sizdan ko'proq tayyorgarlik talab qiladi; yanglishsa, ta'siri kattaroq |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| AI yozgan kodni o'qimasdan qabul qilish | GH: Copilot xato qilishi mumkin, taklifni har doim tekshirish kerak | Avval tushuning, keyin ko'rib chiqing, avtomatik tekshiruvdan o'tkazing |
| Agentning "tayyor" degan xulosasiga ishonish | CX: ravon matn yoki ishonchli xulosa vazifa bajarilganini isbotlamaydi | Qadamlarni, diff'ni va testlar natijasini o'zingiz ko'ring (8-bob) |
| Hamma narsani agentga topshirish | CX: ba'zi vazifalar shuncha nazorat talab qiladiki, oddiyroq yo'l foydaliroq | Uch savolni bering: "tayyor"ni tasvirlay olamanmi, agent kerakli narsaga yeta oladimi, natijani baholay olamanmi |
| Birinchi yaxshi natijadan keyin agentga katta ish ishonib topshirish | CX: bir martalik yaxshi natija har xil ishda ishonchli ekanini isbotlamaydi | Doirani asta kengaytiring, o'xshash vazifalarda ishonchlilik ko'ringach |
| AI'ni o'z bilimingiz o'rniga ishlatish | GH: Copilot sizning tajribangiz o'rnini bosish uchun mo'ljallanmagan | Natijani baholay oladigan darajada mavzuni biling; AI bilan o'rganish — 43-bob |

## Amaliyot

1. Avtoto'ldirish, chat va agent bir-biridan qanday farq qiladi?
2. CX bo'yicha agent qaysi uch qismdan iborat?
3. Agent nega bir nechta faylga tegadigan xatoni avtoto'ldirishdan yaxshiroq tuzata oladi?
4. GH bo'yicha Copilot nima uchun mo'ljallanmagan?
5. Vazifani agentga topshirishdan oldin qaysi uch savolni berish kerak?
6. Agent "hammasi tayyor" dedi. Nimani tekshirasiz?
7. Agent ishini ko'rgach, CX qaysi uch qarordan birini tanlashni taklif qiladi?

<details>
<summary>Javoblar</summary>

1. Avtoto'ldirish siz yozayotgan joyda keyingi qatorlarni taklif qiladi. Chatda har savol-javob qadamini siz boshqarasiz. Agentga maqsad berasiz va u bir nechta qadamni (faylni o'qish, o'zgartirish, buyruq ishga tushirish) o'zi tanlab bajaradi.
2. Model (vazifani tushunadi va rejalaydi), vositalar (ma'lumot yig'adi va harakat qiladi), chegaralar va inson nazorati.
3. Agent butun loyihani ko'radi: kerakli fayllarni qidiradi, bir nechtasini o'qiydi, ularni birgalikda o'zgartiradi va testlar bilan tekshiradi. Avtoto'ldirish faqat joriy fayl atrofini ko'radi.
4. Dasturlashga aloqasi yo'q savollarga javob berish va dasturchining tajribasi o'rnini bosish uchun.
5. "Tayyor" nimani anglatishini tasvirlay olamanmi? Agent kerakli ma'lumot va vositalarga yeta oladimi? Natijani baholay olamanmi va xato bo'lsa tiklay olamanmi?
6. Agent bajargan qadamlar va o'zgartirilgan fayllarni (diff), testlar va boshqa tekshiruvlar natijasini, so'ralgan harakat haqiqatan bajarilganini. Tekshirish chuqurligi oqibatga mos bo'lsin.
7. Davom ettirish, yo'nalishni to'g'rilash, to'xtab qaror qilish.

</details>

## Rasmiy hujjat

- [GH: Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices)
- [CX: Working with agents](https://learn.chatgpt.com/codex/working-with-agents)
- [CC: Overview](https://code.claude.com/docs/en/overview)
- [CC: How Claude Code works — What Claude can access](https://code.claude.com/docs/en/how-claude-code-works#what-claude-can-access)
- [CC: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)

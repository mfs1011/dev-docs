# 100 — Keys: Twitter lentasi

[← Oldingi: Fan-out va lenta dizayni](99-fan-out-va-lenta.md) · [Mundarija](README.md) · [Keyingi: Keys: WhatsApp — millionlab ulanish →](101-keys-whatsapp.md)

## Tushuncha

Bu bob — IX qismdagi g'oyalar **bitta real tizimda**. Manba sifatida Twitter muhandislarining o'z **matnli** materiallari ishlatildi:

- 2013-yil avgustdagi muhandislik blogi posti "New Tweets per second record, and how!" — Twitter'ni qayta arxitekturalash tarixi (asl sahifa hozir avtomatik so'rovlarni bloklaydi, shuning uchun Internet Archive nusxasidan o'qildi);
- X'ning ochiq kodli `the-algorithm` repozitoriysi va undagi **Home Mixer** README'si — bugungi uy lentasi qanday yig'ilishi.

**Muhim chegara.** Twitter'ning 2012–2013-yillardagi "Timelines at Scale" (QCon) chiqishi tez-tez keltiriladi. Lekin uning rasmiy sahifasida faqat video bor, transkript yo'q. Shuning uchun undagi tafsilotlar — Redis'dagi lenta, mashhur akkauntlar uchun alohida ishlov — bu bobda **fakt sifatida berilmaydi**. Ular ikkilamchi maqolalarda takrorlanadi, lekin birlamchi matn bilan tekshirib bo'lmadi.

### Boshlang'ich nuqta: 2010-yil

Post Twitter'ning 2010-yildagi holatini ochiq tasvirlaydi. Jahon chempionati paytida har gol, penalti va kartochka tvitlar oqimini keltirib chiqargan va Twitter **qisqa muddatlarga ishlamay qolgan**. Muhandislar tun bo'yi "tartib darajasidagi" samaradorlik yutuqlarini izlagan, lekin ular Twitter'ning tez o'sishi oldida tez yo'qolgan. Shundan keyin jamoa to'xtab, saytni **qayta arxitekturalashga** qaror qilgan.

Postdagi tashxis (bu IX qism boblariga to'g'ridan-to'g'ri mos):

| Muammo (2010) | Bob |
| --- | --- |
| Dunyodagi eng katta Ruby on Rails o'rnatmalaridan biri, ~200 muhandis bitta kod bazasida; baza ulanishlaridan sahifa renderigacha hammasi bitta **monolit**da | 19, 21, 81 |
| Tvitlar **vaqt bo'yicha bo'lingan** (temporally sharded), **bitta master**li MySQL'da; tvitlar oqimiga ulgurmagan, yangi bazalarni tobora tez yaratishga to'g'ri kelgan | 94, 95 |
| Bazalarda o'qish va yozish **"issiq nuqtalari"** | 95 |
| Muammoga "mashina tashlash" — frontend Ruby mashinalari kutilganidan ancha kam tranzaksiya bajargan | 91 |
| Kodni unumdorlik uchun o'qilishi va moslashuvchanligi hisobiga optimallashtirish "burchagi" | — |

### Maqsadlar

Post uchta maqsadni sanaydi:

1. **Unumdorlik, samaradorlik, ishonchlilik** — median kechikishni yaxshilash va "chetdagi" qiymatlarni yaqinlashtirish (90-bobdagi p50/p99 g'oyasi); Twitter'ni yuritish uchun mashinalar sonini **10 baravar kamaytirish**; nosozliklarni **izolyatsiya qilish**, chunki mashinalar ko'paygani sari bittasining buzilish ehtimoli oshadi.
2. **Tozaroq chegaralar** — bog'liq mantiq bir joyda; tizim darajasida inkapsulyatsiya va modullik.
3. **Funksiyalarni tezroq chiqarish** — kichik, mustaqil jamoalar o'zlari qaror qilib, foydalanuvchiga ko'rinadigan o'zgarishlarni boshqa jamoalarga bog'liq bo'lmasdan chiqaradi.

### Qarorlar

**1. JVM.** Ruby serverlari amalda bir oqimli edi va xostiga sekundiga **200–300 so'rov** bajargan. JVM'ga qayta yozish shu uskunada **10 baravardan ko'p** yutuq berishi taxmin qilingan; post yozilgan paytda — xostiga sekundiga **10–20 ming** so'rov.

**2. Servislar.** Eng katta arxitektura o'zgarishi — monolitdan servislarga. Birinchi navbatda "asosiy otlar" (core nouns): **Tweet, timeline va user** servislari. Post buning ham narxini yozadi: hamma jamoa o'zgarishni bir xil rejalashtirmaydi — masalan, Tweet ko'rinishi o'zgarsa, boshqa servislar ham yangilanishi kerak bo'lishi mumkin (58-bob, versiyalash). Arxitektura Twitter muhandislik tashkilotining tuzilishini ham aks ettirgan — mustaqil jamoalar (81-bob, Conway qonuni).

**3. Yagona tarmoq kutubxonasi.** Servislarga bo'lishda har jamoa biroz boshqacha yo'l tutgan: klient va servis nosozlik semantikasi bir-biriga mos kelmagan, serverlar klientga "sekinla" deyishning yagona mexanizmi (**back-pressure**) yo'q edi, sekinlashgan servisni klientlar tajovuzkorona qayta urinib, **"thundering herd"** (to'satdan yopirilish) yuzaga kelgan. Yechim — **Futures va Finagle**: ulanishlar puli, failover strategiyalari va **load balancing** (92-bob) birlashtirilgan yagona klient va server kutubxonasi (79-bob, ishonchlilik).

**4. Saqlash: vaqtdan hashga.** Bu 95-bobning darsligi:

- eski usul — tvitlar **vaqt tartibida** saqlangan: baza to'lsa, yangisi ochilgan va dastur keyingisiga yozishga qayta sozlangan. Barcha yangi yozuvlar **bitta master**ga ketma-ket tushgan, o'qish esa "eng yangi" bazalarning kam sonli mashinalarida to'plangan;
- yangi usul — **Gizzard** (Twitter'ning sharding va nosozlikka chidamli taqsimlangan bazalar framework'i) asosida **T-Bird**: har kelgan tvit **hash** qilinadi va mos baza tanlanadi;
- natija (post): hash algoritmi tvitlarni deyarli teng taqsimlasa, o'tkazuvchanlik **manzil bazalar soniga** proporsional oshadi; o'qishlar ham "eng yangi" bazaga emas, butun klasterga taqsimlanadi.

**5. Snowflake.** Hash sharding'ning narxi — MySQL'ning noyob ID yaratishiga endi tayanib bo'lmaydi. Post bevosita aytadi: **Snowflake shu muammoni hal qilish uchun yaratilgan** — deyarli kafolatlangan global noyob identifikator, "1 ga oshadigan" ID'lardan voz kechish evaziga (98-bob).

**6. Kuzatuvchanlik.** Servislar ko'paygani sari ularning holatini bilish qiyinlashgan. Runtime Systems jamoasi ikki vosita yaratgan: **Viz** (metrikalar — masalan, `request_latency_ms` ning 50- va 99-persentillari grafigi) va **Zipkin** (taqsimlangan tracing). Ikkalasi Finagle'ga o'rnatilgan — Finagle bilan yozilgan har servis ularni avtomatik oladi (75-bob).

**7. Runtime konfiguratsiya.** **Decider** — barcha servislarga integratsiya qilingan tizim: bitta kalitni bosib, infratuzilmadagi bir nechta tizimni deyarli real vaqtda o'zgartirish. Kod production'ga tayyor bo'lganda chiqadi, funksiya esa alohida yoqiladi (80-bob, feature flag).

### Natija

Post yozilgan paytda: kuniga **500 million**dan ortiq tvit, o'rtacha sekundiga **~5 700**. 2013-yil 3-avgustda Yaponiyada "Castle in the Sky" efiri paytida bir soniyalik cho'qqi — sekundiga **143 199** tvit, odatiy holatdan **taxminan 25 baravar** ko'p. Post: bu cho'qqida foydalanuvchilar uzilishni sezmagan.

90-bobdagi hisob uslubi bilan: 500 mln / 86 400 ≈ 5 787 — postdagi "~5 700" ga mos; cho'qqi/o'rtacha nisbati 143 199 / 5 700 ≈ 25. "Cho'qqi o'rtachadan 3×" kabi umumiy farazlar real hodisada **o'n baravar** kam bo'lishi mumkin.

### Bugungi lenta: o'qishda yig'iladi

X'ning ochiq kodli `the-algorithm` repozitoriysi bugungi uy lentasini ko'rsatadi. Home Mixer README'siga ko'ra u Twitter'ning uy lentalarini quradigan va beradigan **asosiy servis** va uchta lentani boshqaradi:

| Lenta | Mazmuni |
| --- | --- |
| **For You** | Obuna bo'lingan akkauntlarning eng yaxshi tvitlari + obuna bo'linmagan manbalardan tavsiyalar |
| **Following** | Obuna bo'lingan akkauntlar tvitlari, teskari xronologik tartibda |
| **Lists** | Ro'yxat a'zolarining tvitlari, teskari xronologik tartibda |

"For You" bosqichlari (README):

```text
1. Nomzodlarni yig'ish     Earlybird qidiruv indeksi (obunalar — "In-Network", ~50%),
                           User Tweet Entity Graph, Cr Mixer, Follow Recommendations Service
2. Belgilarni yuklash      reyting uchun ~6000 ta belgi (feature)
3. Baholash va saralash    ML model
4. Filtr va evristikalar   muallif xilma-xilligi, In/Out-of-Network muvozanati,
                           takror va ko'rilganlarni olib tashlash,
                           ko'rinish filtrlari (blok, mute, NSFW sozlamalari)
5. Aralashtirish           reklama, "kimga obuna bo'lish" modullari, taklifnomalar
6. Xizmat ko'rsatish       suhbat modullari, sahifalash va kursor, kuzatuvchanlik
```

Bu — 99-bobdagi **o'qishda yig'ish** modeli: lenta har so'rovda foydalanuvchiga moslab tuziladi. Home Mixer **Product Mixer** — Twitter'ning kontent lentalarini qurish uchun Scala framework'i — ustiga qurilgan: so'rovlar "pipeline"larga bo'linadi (mahsulot → mixer yoki tavsiya → nomzodlar), har bosqich alohida va kuzatiladigan.

## Nega shunday

Twitter tarixi IX qismning asosiy g'oyalarini tasdiqlaydi:

- **masshtab muammosi oxir-oqibat saqlashda** — servislarga bo'lingandan keyin ham "katta bo'g'iz" saqlash bo'lib qolgan (post shunday deydi);
- **vaqt bo'yicha bo'lish "issiq" shard beradi** — barcha yozuv eng yangi bazaga (95-bob);
- **hash sharding global ID talab qiladi** — Snowflake aynan shundan tug'ilgan (98-bob);
- **taqsimlangan tizim — kuzatuvchanliksiz boshqarib bo'lmaydi** — Zipkin va metrikalar;
- **qayta urinishlar ham xavfli** — "thundering herd" (79-bob);
- **arxitektura va tashkilot birga o'zgaradi** (81-bob).

## Psevdokod: saqlashning ikki avlodi

```text
// 2010: vaqt bo'yicha
insertTweet(t):
    db = currentDatabase()                 // eng yangi baza
    if db.full(): db = createNextDatabase(); reconfigure()
    db.insert(t)                           // barcha yozuv — bitta master
// o'qish ham "eng yangi" bazalarga to'planadi

// T-Bird: hash bo'yicha (Gizzard)
insertTweet(t):
    t.id = snowflake.nextId()              // MySQL avto-oshish endi yo'q
    db = shards[hash(t.id) % shards.size]  // teng taqsimot
    db.insert(t)
// o'tkazuvchanlik ≈ shard'lar soniga proporsional (post)
```

(`% shards.size` bu yerda soddalashtirish; 95-bobdagi `mod N` muammosi va consistent hashing'ni eslang.)

## Framework'larda

| Twitter vositasi | Umumiy tushuncha va bob |
| --- | --- |
| Finagle (ulanish puli, failover, balanslash) | 92-bob, 79-bob |
| Zipkin (tracing), Viz (p50/p99) | 75-bob |
| Decider (runtime konfiguratsiya) | 80-bob (feature flag), 18-bob |
| Gizzard / T-Bird (sharding) | 95-bob |
| Snowflake (ID) | 98-bob |
| Home Mixer / Product Mixer (lenta yig'ish) | 99-bob |

## Trade-off

| Twitter qarori | Yutuq (post) | Narx (post) |
| --- | --- | --- |
| Monolit → servislar | Mustaqil jamoalar, aniq egalik, parallel ishlash | Bir servis ko'rinishi o'zgarsa, boshqalar ham yangilanishi kerak; ekspluatatsiya murakkablashadi |
| Ruby → JVM | Xostiga 200–300 dan 10–20 ming so'rovgacha | Butun kod bazasini qayta yozish |
| Vaqt bo'yicha → hash sharding | O'tkazuvchanlik shard'lar soniga proporsional, o'qish taqsimlangan | MySQL'ning noyob ID'si yo'qoladi |
| Snowflake | Global noyob, taxminan tartibli ID | "1 ga oshadigan" ID'dan voz kechish |
| O'qishda yig'iladigan "For You" | Shaxsiylashtirilgan, reytingli lenta | Har so'rovda nomzodlar, ~6000 belgi, ML baholash |

## Tipik xatolar (Twitter tajribasidan)

| Xato | Twitter'da nima bo'lgan | Saboq |
| --- | --- | --- |
| Muammoga "mashina tashlash" | Ruby mashinalari kutilganidan ancha kam ish qilgan | Avval nima uchun sekinligini o'lchash |
| Vaqt bo'yicha bo'lish | Bitta master, issiq nuqtalar, bazalarni tez-tez yaratish | Teng taqsimlovchi kalit |
| Har jamoa o'z tarmoq kodini yozadi | Nosozlik semantikasi mos emas, back-pressure yo'q, thundering herd | Umumiy, sinalgan kutubxona |
| Kuzatuvchanliksiz servislar | "Whale hunting" — katta nosozliklar sababini qidirish uzoq | Metrika va tracing har servisda sukut bo'yicha |
| Reliz = deploy | Ko'p servisli funksiyani muvofiqlashtirish qiyin | Runtime konfiguratsiya, feature flag |

## Amaliyot

1. Tizimingizdagi "core nouns" — 3 ta asosiy obyekt nima? Servislarga bo'lsangiz, chegaralar shu bo'ladimi (22-bob)?
2. Ma'lumotingiz qanday bo'lingan yoki bo'linadi: vaqt bo'yicha, hash bo'yicha? Twitter'ning 2010-yildagi muammosi sizda takrorlanishi mumkinmi?
3. Cho'qqi/o'rtacha nisbatingizni o'lchang. Twitter'da u ~25 bo'lgan — sizda qancha va tizim bunga chidaydimi?
4. Servislaringiz qayta urinishda "thundering herd" yaratmaydimi? Exponential backoff va jitter bormi (79-bob)?
5. Home Mixer bosqichlarini o'z "lenta"ngiz bilan solishtiring: nomzodlar, filtrlar, saralash qayerda?

## Manbalar

- Twitter Engineering — *New Tweets per second record, and how!* (2013-08-16; Internet Archive nusxasi): <http://web.archive.org/web/20240411190703/https://blog.twitter.com/engineering/en_us/a/2013/new-tweets-per-second-record-and-how>
- X — *the-algorithm* (README: For You Timeline komponentlari): <https://github.com/twitter/the-algorithm>
- X — *Home Mixer* README: <https://github.com/twitter/the-algorithm/blob/main/home-mixer/README.md>
- Twitter — *Snowflake* README (2010): <https://github.com/twitter-archive/snowflake/tree/snowflake-2010>
- (Faqat ma'lumot uchun, fakt manbasi emas — transkriptsiz video) Raffi Krikorian — *Timelines at Scale*, QCon SF 2012: <https://www.infoq.com/presentations/Twitter-Timeline-Scalability/>

# 95 — Sharding va consistent hashing

[← Oldingi: Replikatsiya](94-replikatsiya.md) · [Mundarija](README.md) · [Keyingi: Ma'lumotlar bazasi oilasini tanlash →](96-baza-oilasi.md)

## Tushuncha

Replikatsiya (94-bob) o'qishni masshtablaydi, lekin **har bir server butun ma'lumotni** saqlaydi va barcha yozuvlar bitta primary'ga tushadi. 90-bobdagi hisobda 438 TB chiqdi — bu bitta serverga sig'maydi. Yechim — ma'lumotni **bo'lish**.

Vitess hujjati ta'rifi: **sharding** — bazani **gorizontal bo'laklash** usuli: ma'lumot ikki yoki undan ortiq ma'lumotlar bazasi serverida saqlanadi. Har bir bo'lak — **shard**: sxemasi bir xil, lekin qatorlari boshqa. Hujjatdagi misol: "foydalanuvchilar" ikki shard'ga bo'linsa, har birida foydalanuvchilarning taxminan yarmi bo'ladi, lekin **bitta foydalanuvchining** barcha ma'lumoti faqat **bitta** shard'da.

Vitess hujjati muhim farqni ta'kidlaydi: sharding replikatsiyaga **ortogonal** (bog'liq emas). Odatda har bir shard'ning o'zi — bitta primary va bir nechta replika (94-bob):

```text
              Router (qaysi shard?)
          ┌──────────┼──────────┐
       shard -80   shard 80-c0  shard c0-
       primary      primary      primary         ← yozuvlar bo'lingan
       replica×2    replica×2    replica×2       ← har shard ichida o'qishlar
```

### Sharding kaliti

Qator qaysi shard'ga tushishini **sharding kaliti** (sharding key) belgilaydi. Vitess'da bu **Primary Vindex**: hujjatga ko'ra u ma'lumotlar bazasining birlamchi kalitiga o'xshaydi, **har bir sharded jadvalda bo'lishi shart** va **unique** — bitta qiymat bitta joyni beradi. Qator qo'shilganda shu qiymat qaysi shard'ga yozilishini aniqlaydi.

Kalit tanlovi — sharding'dagi eng muhim qaror. Yaxshi kalit:

- so'rovlarning ko'pchiligida **bor** — so'rov bitta shard'ga boradi;
- yuklamani **teng** taqsimlaydi;
- birga o'qiladigan ma'lumotni **bitta shard'da** saqlaydi (foydalanuvchi va uning buyurtmalari).

**Kalitsiz so'rov — hamma shard'ga.** Vitess hujjati: oddiy `SELECT` da `WHERE` sharti Vindex ustuniga mos kelmasa, so'rov **barcha shard'larga** yuboriladi (scatter). 100 shard bo'lsa — 100 ta so'rov va natijalarni birlashtirish.

### Oraliq bo'yicha va hash bo'yicha

| | Oraliq (range) | Hash |
| --- | --- | --- |
| Qanday | Kalit qiymati oraliqlarga bo'linadi | Kalitning hash'i bo'yicha |
| Oraliq so'rovlari | Samarali (qo'shni qiymatlar bitta shard'da) | Hamma shard'ga |
| Taqsimot | Notekis bo'lishi mumkin (yangi ID'lar bitta shard'ga) | Teng |

Vitess ikkalasini birlashtiradi: sharding kaliti **keyspace ID** ga aylantiriladi (Vindex funksiyasi, masalan hash), shard'lar esa keyspace ID **oraliqlariga** ega. Hujjatdagi qoidalar:

- shard nomi — oraliq boshi va oxiri o'n oltilik ko'rinishda: `80-c0` — `0x80` dan (kiradi) `0xc0` gacha (kirmaydi);
- shard'lar birgalikda **butun** oraliqni qoplashi shart: `-40`, `40-80`, `80-c0`, `c0-` — to'liq bo'linish;
- shard'lar teng bo'lishi shart emas: `-80`, `80-c0`, `c0-dc00`, `dc00-dc80`, `dc80-` ham to'g'ri — "issiq" qismni maydaroq bo'lish mumkin.

### Qayta bo'lish (resharding)

Ma'lumot o'sadi — shard'lar ko'payishi kerak. Vitess hujjati: resharding paytida ma'lumot yangi shard'larga **nusxalanadi, tekshiriladi va yangilab turiladi**, eski shard'lar esa jonli trafikka xizmat qilishda davom etadi. O'tish faqat **bir necha soniya** faqat-o'qish rejimi bilan bajariladi.

Hujjatdagi talab → amal jadvali:

| Talab | Amal |
| --- | --- |
| O'qish sig'imini teng oshirish | Replika qo'shish yoki shard'larni bo'lish |
| Yozish sig'imini teng oshirish | Shard'larni bo'lish |
| Ortiqcha resurslarni qaytarish | Shard'larni birlashtirish |
| "Issiq" (ko'p yuklangan) shard | O'qish uchun — replika yoki bo'lish; yozish uchun — bo'lish |

Vitess **vertikal sharding** ni ham qo'llaydi: jadvallarni bitta keyspace'dan boshqasiga ko'chirish (masalan, loglar alohida bazaga), keyin kerak bo'lsa — gorizontal bo'lish.

### `mod N` muammosi va consistent hashing

Eng oddiy hash taqsimot: `hash(kalit) mod N`, bunda N — shard'lar soni. Muammo (Cassandra va SRE hujjatlari ikkalasi ham shuni aytadi): N o'zgarsa, **deyarli barcha** kalitlar boshqa joyga tushadi.

**Consistent hashing** — SRE kitobi uni 1997-yilda taklif qilingan usul deb keltiradi. Cassandra hujjatidagi tushuntirish:

- har bir tugun **hash halqasida** (token ring) bir yoki bir nechta **token**ga ega;
- kalit egasini topish: kalitni halqaga hash qilish va halqa bo'ylab **bir yo'nalishda** yurib, birinchi uchragan tugunni olish;
- asosiy farq — tugunlar soni o'zgarganda kalitlarning faqat **kichik qismi** ko'chadi;
- replikatsiya ham shu halqada: replikatsiya koeffitsienti 3 bo'lsa, halqa bo'ylab uchta turli tugungacha yuriladi.

**Virtual tugunlar** (vnodes). Cassandra hujjati: kam tugunli klasterda bitta tokenli halqani muvozanatda saqlab kengaytirish qiyin — notekis oraliqlar notekis yuklamaga olib keladi. Dynamo maqolasi buning uchun **virtual tugunlar**ni taklif qiladi: har bir jismoniy tugun halqada **ko'p** pozitsiyani egallaydi. Shunda bitta tugun qo'shilsa ham, u ko'p qo'shnisidan kichik bo'laklar oladi.

## Nega shunday

Sharding — **oxirgi** chora (78-bob ham shunday deydi: avval replika, kesh, keyin bo'lish). Sababi — narxi yuqori:

- **shard'lararo so'rovlar** — kalitsiz so'rov hamma shard'ga boradi (Vitess: scatter);
- **shard'lararo tranzaksiyalar** — Vitess hujjatiga ko'ra to'liq ACID faqat **bitta shard** ichidagi tranzaksiyada. Bir nechta shard'ni o'zgartirish uchun uchta rejim bor: `Single` (bitta shard), `Multi` (bir nechta shard, "imkon qadar" commit — **atomarlik yo'q**) va `TwoPC` (ikki fazali commit — atomar, lekin commit kechikishi oshadi va an'anaviy ma'nodagi **izolyatsiya bermaydi**). Hujjat tavsiyasi — sxemani shard'lararo yangilanishlar kam bo'ladigan qilib loyihalash. Muqobil — saga (27-bob);
- **JOIN va tashqi kalitlar** — har shard alohida baza: bazaning o'zi boshqa shard'dagi qatorga tashqi kalitni tekshira olmaydi, shard'lararo `JOIN` ni esa router bajaradi — qimmatroq;
- **kalitni o'zgartirish** — keyin juda qimmat (barcha ma'lumot qayta taqsimlanadi).

Shuning uchun sharding'dan oldin odatda: indekslar va so'rovlar (SQL 41–47-boblar), replika (94), kesh (25), arxivlash, vertikal ajratish.

## Psevdokod: mod N va consistent hashing — sinov

100 000 kalit, 4 ta tugundan 5 tasiga o'tish (Python simulyatsiyasi, MD5 hash):

```text
hash(kalit) mod N, 4 → 5 tugun           ko'chgan kalitlar: 80.1%
consistent hashing, 100 vnode/tugun       ko'chgan kalitlar: 19.6%
yangi tugun E olgan ulush                 19 561 / 100 000 ≈ 1/5
tugunlar bo'yicha taqsimot (5 tugun)      A 20 650, B 22 505, C 19 535, D 17 749, E 19 561
```

Consistent hashing'da faqat yangi tugunga **o'tishi kerak bo'lgan** kalitlar ko'chdi (~1/5). `mod N` da esa beshdan to'rt qismi — garchi yangi tugunga atigi beshdan biri kerak bo'lsa ham.

## Psevdokod: marshrutlash

```text
function shardFor(userId):
    keyspaceId = hash(userId)                   // Vindex: kalit → keyspace ID
    return ranges.find(r => r.start <= keyspaceId < r.end)

// ✅ Bitta shard: kalit bor
getOrders(userId):
    return shardFor(userId).query("SELECT … FROM orders WHERE user_id = ?", userId)

// ⚠ Hamma shard: kalit yo'q
findOrderByNumber(num):
    return parallel(allShards.map(s => s.query("… WHERE number = ?", num))).firstNonEmpty()
    // yechim: qidiruv indeksi (29-bob) yoki number → userId "lookup" jadvali (Vitess: Lookup Vindex)
```

## Psevdokod: kalit tanlash

```text
Ijtimoiy tarmoq xabarlari
  ✅ user_id            — foydalanuvchi o'z xabarlarini bitta shard'dan oladi
  ⚠ mashhur foydalanuvchi — bitta shard "issiq" bo'ladi (99-bob)

Buyurtmalar (SaaS, ko'p ijarachi)
  ✅ tenant_id          — ijarachi ma'lumoti birga; 33-bob
  ⚠ katta ijarachi      — alohida shard

Loglar
  ❌ created_at oraliq  — barcha yangi yozuv oxirgi shard'ga
  ✅ hash(source_id)    — yozuv teng taqsimlanadi
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| Shard ichidagi so'rovlarni optimallash | SQL kitobi — indekslar va `EXPLAIN` ([SQL 41–46](../sql/41-indeks-qanday-ishlaydi.md)) |
| Ko'p ijarachilik — tenant bo'yicha ajratish | 33-bob |
| Shard'lararo jarayonlar | Saga va outbox — 27-bob; idempotentlik — 70-bob |
| Kalitsiz qidiruv | Qidiruv arxitekturasi — 29-bob |
| Global unique ID (shard'lar o'rtasida) | 98-bob |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Shardingsiz | ACID, JOIN, oddiy | Bitta server chegarasi |
| Vertikal (jadvallar bo'yicha) | Oddiyroq, JOIN guruh ichida saqlanadi | Bitta katta jadvalni hal qilmaydi |
| Oraliq bo'yicha | Oraliq so'rovlar tez | "Issiq" oxirgi shard |
| Hash bo'yicha | Teng taqsimot | Oraliq so'rovlar hamma shard'ga |
| `mod N` | Juda oddiy | Shard qo'shilsa deyarli hammasi ko'chadi |
| Consistent hashing + vnode | Kam ko'chish, muvozanat | Murakkabroq marshrutlash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Erta sharding | Murakkablik bor, foyda yo'q | Avval indeks, replika, kesh, arxivlash |
| So'rovlarda kam uchraydigan kalit | Ko'p so'rov hamma shard'ga (scatter) | Asosiy kirish yo'li bo'yicha kalit |
| Vaqt bo'yicha oraliq kalit | Barcha yozuv bitta shard'ga | Hash yoki aralash kalit |
| `mod N` bilan taqsimlash | Kengaytirishda deyarli hamma ma'lumot ko'chadi | Consistent hashing yoki oraliqli keyspace ID |
| Shard'lararo `JOIN`/tranzaksiyaga tayanish | Qimmat; `Multi` rejimda atomarlik yo'q, `TwoPC` sekinroq va izolyatsiyasiz (Vitess) | Birga ishlatiladigan ma'lumot — bitta kalit ostida |
| Avto-oshadigan ID har shard'da alohida | Takror ID'lar | Global ID (98-bob) |
| "Issiq" kalitni e'tiborsiz qoldirish | Bitta shard to'lib, qolganlari bo'sh | Kuzatish; issiq qismni bo'lish |

## Amaliyot

1. Eng katta jadvalingiz uchun 3 ta nomzod sharding kalitini yozing va har birida eng ko'p ishlatiladigan 5 ta so'rov bitta shard'ga boradimi, tekshiring.
2. Qaysi so'rovlar scatter bo'lib qoladi? Ular uchun qidiruv indeksi yoki lookup jadval kerakmi?
3. Shard'lararo tranzaksiya talab qiladigan ssenariy bormi? Uni saga bilan qanday yozasiz?
4. Yuqoridagi simulyatsiyani o'zingiz takrorlang: 10 → 11 tugun uchun `mod N` va consistent hashing'da ko'chgan ulushni solishtiring.
5. Sharding'dan oldingi qadamlar ro'yxatini tuzing: qaysilari allaqachon qilingan?

## Manbalar

- Vitess — Sharding: <https://vitess.io/docs/reference/features/sharding/>
- Vitess — Vindexes: <https://vitess.io/docs/reference/features/vindexes/>
- Vitess — Distributed Transactions: <https://vitess.io/docs/reference/features/distributed-transaction/>
- Apache Cassandra — Dynamo (Consistent Hashing using a Token Ring, vnodes): <https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html>
- G. DeCandia va boshq. — *Dynamo: Amazon's Highly Available Key-value Store* (SOSP 2007): <https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf>
- Google — *Site Reliability Engineering*, 19-bob (consistent hashing, `mod N` muammosi): <https://sre.google/sre-book/load-balancing-frontend/>

# 94 — Replikatsiya

[← Oldingi: CDN va chekka keshlash](93-cdn.md) · [Mundarija](README.md) · [Keyingi: Sharding va consistent hashing →](95-sharding.md)

## Tushuncha

**Replikatsiya** — bitta ma'lumotlar bazasining nusxalarini bir nechta serverda saqlash va ularni bir xil holatda ushlab turish. 91-bobda ilova nusxalarini ko'paytirdik — ular holatsiz edi. Baza esa **holatli**: uni shunchaki nusxalab bo'lmaydi, har yozuv barcha nusxalarga yetkazilishi kerak.

PostgreSQL hujjati ("High Availability, Load Balancing, and Replication") ikki maqsadni ajratadi:

- **yuqori mavjudlik** (high availability) — asosiy server yiqilsa, ikkinchisi tez o'rnini egallaydi;
- **yuklamani taqsimlash** — bir xil ma'lumotni bir nechta kompyuter beradi.

Hujjat asosiy qiyinchilikni aniq aytadi. Statik sahifalar beradigan web serverlarni birlashtirish oson; faqat o'qiladigan bazalarni ham nisbatan oson. Lekin ko'p bazalarda o'qish va yozish aralash keladi. O'qiladigan ma'lumotni har serverga bir marta joylash kifoya, **har bir yozuv esa barcha serverlarga tarqalishi kerak** — aks holda keyingi o'qishlar turli javob beradi. Hujjat buni serverlar birga ishlashining "asosiy qiyinchiligi" — **sinxronlash muammosi** deydi.

### Rollar: primary va standby

Hujjatdagi atamalar:

| Atama | Ma'nosi |
| --- | --- |
| **Primary** (master, read/write) | Ma'lumotni o'zgartira oladigan server |
| **Standby** (secondary) | Primary'dagi o'zgarishlarni kuzatib boradigan server |
| **Warm standby** | Primary'ga ko'tarilmaguncha unga ulanib bo'lmaydi |
| **Hot standby** | Ulanishlarni qabul qiladi va faqat **o'qish** so'rovlarini bajaradi |

MySQL'da xuddi shu rollar: **source** (manba) va **replica**.

Bu sxema — **leader–follower** (yetakchi–izdosh): faqat bitta server yozuvni qabul qiladi, qolganlari undan nusxa oladi. Sinxronlash muammosi shu yo'l bilan soddalashadi — hujjatda aytilganidek, ba'zi yechimlar ma'lumotni o'zgartirishga **faqat bitta serverga** ruxsat beradi.

### Sinxron va asinxron

Bu replikatsiyaning eng muhim qarori. PostgreSQL hujjati:

- **sinxron** — o'zgartiruvchi tranzaksiya **barcha** serverlar commit qilmaguncha tasdiqlanmaydi. Failover'da ma'lumot yo'qolmaydi, va balanslangan serverlarning qaysi biri so'ralmasin, natija izchil bo'ladi;
- **asinxron** — commit va uning boshqa serverlarga tarqalishi orasida kechikish bo'lishi mumkin. Natijada zaxira serverga o'tishda ba'zi tranzaksiyalar **yo'qolishi**, balanslangan serverlar esa **biroz eskirgan** natija qaytarishi mumkin. Asinxron usul sinxron juda sekin bo'lganda ishlatiladi.

MySQL hujjati uchta darajani beradi:

| | Asinxron (sukut) | Yarim sinxron | To'liq sinxron |
| --- | --- | --- | --- |
| Manba nimani kutadi | Hech narsani | Kamida bitta replika **qabul qilib, logga yozganini** | Barcha replikalar **commit qilganini** |
| Manba yiqilsa | Commit qilingan tranzaksiyalar hech bir replikaga yetmagan bo'lishi mumkin | Har bir commit kamida bitta replikada bor | Istalgan replikaga o'tish xavfsiz |
| Narxi | Eng tez | Bir borib-kelish kechikishi | Tranzaksiyaga katta kechikish |

MySQL hujjati asinxron xavfni aniq yozadi: manba qaysi replika nimani olganini **bilmaydi**, va hodisa biror replikaga yetib borishiga **kafolat yo'q**.

### PostgreSQL'da replikatsiya kechikishi

**Streaming replication** — standby primary'ga ulanadi va WAL yozuvlarini ular yaratilishi bilan oladi. Hujjatga ko'ra u sukut bo'yicha **asinxron**. Primary'dagi commit bilan uning standby'da ko'rinishi orasida kichik kechikish bor: standby yuklamaga ulgursa, odatda **bir soniyadan kam**.

**Sinxron replikatsiya** (hujjat): har yozuvchi tranzaksiya commit'i WAL'ning **primary va standby** disklariga yozilgani tasdiqlanguncha kutadi. Ma'lumot faqat ikkala server bir vaqtda yiqilsagina yo'qolishi mumkin. Narxi: javob vaqti oshadi — **minimal kutish primary va standby orasidagi borib-kelish vaqti**. Faqat o'qiydigan tranzaksiyalar va rollback'lar kutmaydi.

`synchronous_commit` darajalari (hujjat), sinxron standby sozlangan bo'lsa:

| Qiymat | Commit nimani kutadi |
| --- | --- |
| `off` | Hech narsani (yaqindagi commit'lar server yiqilsa yo'qolishi mumkin) |
| `local` | Faqat lokal diskka yozilishini |
| `remote_write` | Standby yozuvni fayl tizimiga yozganini (standby OT darajasida yiqilsa — kafolat yo'q) |
| `on` (sukut) | Standby yozuvni **diskka** yozganini |
| `remote_apply` | Standby yozuvni **qo'llaganini** — u standby'dagi so'rovlarga **ko'rinadi**. Commit kechikishi ancha katta |

**Xavf.** Hujjat ogohlantiradi: agar sinxron standby'lardan biri yiqilsa, commit'lar **hech qachon tugamasligi** mumkin. Yechim — bir nechta nomzod standby (`synchronous_standby_names`, ustuvorlik yoki kvorum asosida).

### Replikadan o'qish va "o'z yozuvini ko'rish"

Asinxron replikatsiyada foydalanuvchi yozadi (primary), keyin darhol o'qiydi (replika) — va o'z yozuvini **ko'rmaydi**, chunki replika hali orqada. Bu "o'z yozuvini o'qish" (read-your-writes) muammosi. Yechimlar:

- yozgandan keyin **shu so'rov davomida** o'qishni primary'dan qilish. Laravel'da aynan shu — `sticky` opsiyasi: joriy so'rov siklida yozuv bo'lgan bo'lsa, keyingi o'qishlar **yozish ulanishidan** bajariladi;
- izchillik muhim bo'lgan o'qishlarni doim primary'ga yuborish (balans, to'lov holati);
- PostgreSQL'da `remote_apply` — commit standby'da ko'rinmaguncha tasdiqlanmaydi (lekin katta kechikish narxida).

### Failover

Primary yiqilsa, standby primary'ga **ko'tariladi** (promote). PostgreSQL hujjati ikki muhim narsani aytadi:

- eski primary qayta yoqilsa, unga endi primary emasligini bildiruvchi mexanizm **shart** — **STONITH** ("Shoot The Other Node In The Head"). Aks holda ikkala server o'zini primary deb hisoblaydi (**split-brain**) va bu chalkashlik, oxir-oqibat **ma'lumot yo'qolishiga** olib keladi;
- **PostgreSQL'ning o'zida** primary nosozligini aniqlab, standby'ni xabardor qiladigan dastur **yo'q** — buning uchun tashqi vositalar ishlatiladi.

### Replikatsiyaning boshqa usullari (PostgreSQL hujjatidan)

| Usul | Qisqacha |
| --- | --- |
| Umumiy disk (shared disk) | Bitta nusxa, bir nechta server ulanadi; disk buzilsa — hammasi to'xtaydi |
| Fayl tizimi replikatsiyasi | Fayl tizimidagi o'zgarishlar boshqa kompyuterga ko'zguda nusxalanadi |
| **WAL yetkazish** (log shipping, streaming) | Standby WAL oqimini o'qiydi; faqat butun server darajasida |
| **Mantiqiy replikatsiya** (logical) | Jadval darajasida; server bir vaqtda nashr qilishi va obuna bo'lishi mumkin — ma'lumot bir nechta yo'nalishda oqadi |
| Trigger asosidagi | Jadval darajasida, odatda asinxron |

## Nega shunday

Replikatsiya uchta narsani beradi va har birining narxi bor:

- **o'qishni masshtablash** — MySQL hujjati: yozuvlar manbada, o'qishlar ko'p replikada; replikalar soni oshgani sari o'qish tezligi "keskin" oshadi. Narxi — replikadagi eskirgan ma'lumot;
- **mavjudlik** — primary yiqilsa, standby o'rnini egallaydi. Narxi — failover avtomatikasi va split-brain xavfi;
- **ajratish** — zaxira nusxa olish va tahlil (analytics) so'rovlarini replikada bajarish, primary'ga ta'sir qilmasdan (MySQL hujjati).

Replikatsiya **yozishni** masshtablamaydi: barcha yozuvlar hali ham bitta primary'ga tushadi. Yozish sig'imi yetmasa — sharding (95-bob).

## Psevdokod: o'qish/yozishni ajratish

```text
db = {
  write: primary,
  read:  [replica1, replica2],
  sticky: true                      // so'rovda yozuv bo'lsa — keyingi o'qish primary'dan
}

function placeOrder(cart):
    order = db.write.insert(orders, cart)      // primary
    return db.read.find(orders, order.id)      // sticky → primary; aks holda replika "topa olmasligi" mumkin

function catalog(page):
    return db.read.query(products, page)       // eskirish qabul qilinadi → replika

function balance(userId):
    return db.write.query(accounts, userId)    // izchillik muhim → doim primary
```

## Psevdokod: failover ketma-ketligi

```text
1. Nosozlikni aniqlash      heartbeat / tashqi vosita (PostgreSQL'ning o'zida yo'q)
2. Eski primary'ni "o'chirish" (STONITH) — u qaytib kelib yozuv qabul qilmasin
3. Eng ko'p ma'lumotga ega standby'ni tanlash
4. promote → yangi primary
5. Ilova ulanishlarini yangi primary'ga yo'naltirish (DNS / proxy / VIP — 92-bob)
6. Qolgan standby'larni yangi primary'ga ulash
Asinxron bo'lsa: 2–4 orasida commit qilinib, yetkazilmagan tranzaksiyalar yo'qolgan bo'lishi mumkin
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| O'qish va yozish ulanishlari, `sticky` | Laravel `config/database.php`: `read` / `write` host'lari va `sticky` (Laravel 13 rasmiy hujjati, "Read and Write Connections") |
| Ulanish sozlamalari muhit bo'yicha | 18-bob (konfiguratsiya) |
| Replikatsiya va izolyatsiya darajalari | SQL kitobi IX qism (tranzaksiyalar) va XI qism (replikatsiya) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Replikatsiyasiz | Oddiy | Bitta nosozlik nuqtasi; o'qish masshtablanmaydi |
| Asinxron replika | Primary sekinlashmaydi | Replika orqada; failover'da yo'qotish mumkin |
| Yarim sinxron (MySQL) | Har commit kamida bitta replikada | Bir borib-kelish kechikishi |
| Sinxron / `remote_apply` (PG) | Yo'qotishsiz failover; replikada darhol ko'rinadi | Commit sekinroq; standby yiqilsa commit to'xtashi mumkin |
| Replikadan o'qish | O'qish sig'imi oshadi | Read-your-writes muammosi |
| Avtomatik failover | Tez tiklanish | Split-brain xavfi; STONITH shart |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Yozgandan keyin darhol replikadan o'qish | Foydalanuvchi o'z yozuvini ko'rmaydi | `sticky` yoki primary'dan o'qish |
| Barcha o'qishlarni replikaga | Balans, to'lov holati eskirgan | Izchillik talab qiladigan o'qish — primary |
| Replikatsiyani zaxira nusxa deb hisoblash | `DELETE` replikaga ham darhol tarqaladi | Alohida backup va PITR (SQL 66-bob) |
| Bitta sinxron standby | U yiqilsa — commit'lar to'xtaydi (PG hujjati) | Bir nechta nomzod, kvorum |
| Eski primary'ni o'chirmasdan failover | Split-brain, ma'lumot yo'qolishi | STONITH |
| Replikatsiya kechikishini kuzatmaslik | Replika soatlab orqada qolishi mumkin | Kechikish metrikasi va ogohlantirish (75-bob) |
| Replikatsiya yozishni ham masshtablaydi deb o'ylash | Barcha yozuv baribir primary'da | Sharding (95-bob) |

## Amaliyot

1. Ilovangizdagi o'qishlarni ikki guruhga ajrating: eskirish qabul qilinadi (replika) va qabul qilinmaydi (primary).
2. "Yozib, darhol o'qish" ssenariylarini toping (buyurtma berib, uni ko'rsatish). Ular replika bilan to'g'ri ishlaydimi?
3. Replikatsiya turini aniqlang: asinxronmi, sinxronmi? Failover'da qancha ma'lumot yo'qolishi mumkin (RPO)?
4. Failover qanday bajariladi: kim aniqlaydi, kim ko'taradi, eski primary qanday o'chiriladi?
5. Replikatsiya kechikishini o'lchaydigan metrika va ogohlantirish qo'shing.

## Manbalar

- PostgreSQL 18 — 26. High Availability, Load Balancing, and Replication: <https://www.postgresql.org/docs/18/high-availability.html>
- PostgreSQL 18 — 26.1. Comparison of Different Solutions: <https://www.postgresql.org/docs/18/different-replication-solutions.html>
- PostgreSQL 18 — 26.2. Log-Shipping Standby Servers (Streaming, Synchronous Replication): <https://www.postgresql.org/docs/18/warm-standby.html>
- PostgreSQL 18 — 26.3. Failover: <https://www.postgresql.org/docs/18/warm-standby-failover.html>
- PostgreSQL 18 — 19.5. Write Ahead Log (`synchronous_commit`): <https://www.postgresql.org/docs/18/runtime-config-wal.html>
- MySQL 9.7 — 19 Replication: <https://dev.mysql.com/doc/refman/9.7/en/replication.html>
- MySQL 9.7 — 19.4.10 Semisynchronous Replication: <https://dev.mysql.com/doc/refman/9.7/en/replication-semisync.html>
- Laravel 13 — Database: Read and Write Connections (`sticky`): <https://laravel.com/docs/13.x/database>

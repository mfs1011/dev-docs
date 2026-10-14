# 99 — Fan-out va lenta dizayni

[← Oldingi: Taqsimlangan ID generatsiyasi](98-taqsimlangan-id.md) · [Mundarija](README.md) · [Keyingi: Keys: Twitter lentasi →](100-keys-twitter.md)

## Tushuncha

**Lenta** (feed, timeline) — foydalanuvchi obuna bo'lgan manbalardagi yangi yozuvlar ro'yxati: ijtimoiy tarmoqdagi bosh sahifa, yangiliklar, bildirishnomalar. Bitta yozuv **ko'p** o'quvchiga yetkazilishi kerak — bu **fan-out** ("yelpig'ichdek tarqatish"): bitta kiruvchi xabar → N ta chiquvchi.

Ikki asosiy yo'l bor:

| | Yozishda tarqatish (fan-out on write, push) | O'qishda yig'ish (fan-out on read, pull) |
| --- | --- | --- |
| Yozuv qo'shilganda | Har obunachining tayyor lentasiga qo'shiladi | Faqat muallifning yozuvlariga qo'shiladi |
| Lenta o'qilganda | Tayyor ro'yxat o'qiladi — tez | Barcha obunalardan yig'iladi, saralanadi — sekinroq |
| Narx qayerda | Yozishda: N obunachi = N yozuv | O'qishda: M obuna = M manbadan o'qish |
| Lentaning holati | Oldindan hisoblangan nusxa (kesh) | Har safar yangidan |

Bu bob ikkalasini **real ochiq kod** va rasmiy hujjatlar asosida ko'radi: Mastodon (yozishda tarqatish) va X/Twitter'ning "For You" lentasi (o'qishda yig'ish, 100-bob).

### Yozishda tarqatish: Mastodon misolida

Mastodon — ochiq kodli ijtimoiy tarmoq. Uning `FanOutOnWriteService` klassi izohi: "status'ni (yozuvni) home va mentions lentalariga **itarish**". Koddagi asosiy qadamlar:

1. **Muallifning o'z lentasiga** darhol qo'shish (`deliver_to_self!`).
2. Yozuv ko'rinishiga qarab (`public`, `unlisted`, `private`) — **barcha obunachilarga** (`deliver_to_all_followers!`) va muallif qo'shilgan **ro'yxatlarga**.
3. Obunachilar ma'lumotlar bazasidan **partiyalab** o'qiladi (`find_in_batches`). Har obunachi uchun lentaga qo'shishning o'zi bajarilmaydi, balki **fon vazifasi** navbatga qo'yiladi — `FeedInsertWorker.push_bulk` (Sidekiq navbati, 26-bob).
4. Ommaviy yozuvlar uchun — Redis kanallariga **e'lon qilish** (`redis.publish("timeline:public", …)`, hashtag oqimlari): ulangan klientlar uni real vaqtda oladi (64-bob).

`FeedInsertWorker` har bir obunachi uchun: obunachini bazaning **asosiy** serveridan o'qiydi, keyin **replikadan** (94-bob) filtrlarni tekshiradi (bloklangan, ovozi o'chirilgan muallif va h.k.) va yozuvni lentaga qo'shadi.

**Kimga tarqatiladi.** Muhim tafsilot: `followers_for_local_distribution` — faqat **yaqinda tizimga kirgan** obunachilar. Mastodon'da "yaqinda" — `USER_ACTIVE_DAYS` muhit o'zgaruvchisi, sukut bo'yicha **7 kun**. Koddagi izoh murosani aniq yozadi: home va list lentalari shu muddat saqlanadi, fan-out faqat shu davrda faol bo'lganlarga boradi. Muddatni **qisqartirish** ko'p ro'yxatdan o'tgan, lekin lentasini har kuni ochmaydigan foydalanuvchilar bo'lsa unumdorlikni oshiradi; **uzaytirish** esa foydalanuvchi qayta faol bo'lganda bajariladigan fon ishini kamaytiradi. Qaytgan foydalanuvchi lentasi fonda qayta hisoblanadi — `RegenerationWorker` (`PrecomputeFeedService`).

**Lenta qanday saqlanadi.** `FeedManager`:

- har lenta — Redis **saralangan to'plami** (sorted set): `zadd(lenta_kaliti, status.id, status.id)` — ball ham, element ham yozuv ID'si. ID'lar vaqt bo'yicha o'sgani uchun (98-bob) saralash = vaqt tartibi;
- lentada ko'pi bilan `MAX_ITEMS = 800` element; ortig'i `zremrangebyrank` bilan kesiladi (`trim`);
- qayta e'lon (reblog) takrorlanmasligi uchun: asl yozuv yoki uning boshqa reblog'i oxirgi `REBLOG_FALLOFF = 80` element ichida bo'lsa, yangisi lentaga qo'shilmaydi.

Mastodon admin hujjati (Scaling) ham shuni tasdiqlaydi: **home va list lentalari**, Sidekiq navbatlari va streaming API Redis'da turadi va bu yo'qotmaslik kerak bo'lgan ma'lumot — garchi uning yo'qolishidan tiklanish mumkin bo'lsa ham (PostgreSQL'ning yo'qolishidan farqli).

### Real vaqt: pub/sub va uning kafolati

Mastodon ommaviy oqimlar uchun Redis **pub/sub** dan foydalanadi. Redis hujjatiga ko'ra pub/sub **ko'pi bilan bir marta** (at-most-once) yetkazadi: xabar yuborilgandan keyin qayta yuborilmaydi, obunachi uni qayta ishlay olmasa (xato yoki tarmoq uzilishi) — xabar **butunlay yo'qoladi**. Kuchliroq kafolat kerak bo'lsa, hujjat **Redis Streams** ni tavsiya qiladi: xabarlar saqlanadi va "kamida bir marta" (at-least-once) yetkazishni ham qo'llaydi.

Shuning uchun Mastodon'da ikki qatlam bor: lentaning **o'zi** (sorted set, saqlanadi) va jonli **bildirish** (pub/sub, yo'qolishi mumkin). Klient uzilib qolsa, lentani qayta o'qiydi — yo'qolgan jonli xabar muhim emas.

### O'qishda yig'ish: X "For You" misolida

X'ning ochiq kodli tavsiya algoritmi (GitHub `the-algorithm`) boshqa yo'lni ko'rsatadi. **Home Mixer** — hujjatga ko'ra uy lentalarini quradigan va beradigan asosiy servis — har so'rovda lentani **yig'adi**:

- nomzodlarni bir nechta manbadan olish: masalan, qidiruv indeksi (Earlybird) — obuna bo'lingan akkauntlarning yozuvlari ("In-Network"); README'ga ko'ra For You'dagi yozuvlarning **~50%** shundan;
- reyting uchun ~6000 belgini (feature) yuklash, ML model bilan baholash;
- filtrlar va evristikalar: muallif xilma-xilligi, takrorlarni olib tashlash, bloklangan/ovozi o'chirilganlar;
- reklama va boshqa modullarni aralashtirish.

Bunday lentani oldindan hisoblab bo'lmaydi: u **har bir o'qish** uchun foydalanuvchiga moslab tuziladi. Batafsil — 100-bob.

## Nega shunday

**Hisob: yozishda tarqatish narxi.** Bitta yozuv = faol obunachilar soni marta lentaga yozish. 90-bobdagi uslubda (raqamlar misol uchun):

```text
Oddiy foydalanuvchi: 200 obunachi, kuniga 5 yozuv     → 1 000 lenta yozuvi/kun
Mashhur akkaunt:     10 000 000 obunachi, 1 yozuv      → 10 000 000 lenta yozuvi — BITTA yozuv uchun
                     (Mastodon kabi faqat faollarga: agar 30% faol bo'lsa → 3 000 000)
```

Mashhur akkaunt bitta yozuvi bilan millionlab fon vazifasi yaratadi. Ular navbatda turguncha (26-bob) obunachilar yozuvni kech ko'radi. Bu — **mashhurlik muammosi** (celebrity problem).

**Hisob: o'qishda yig'ish narxi.** Har lenta ochilishi = obunalar soni bo'yicha o'qish va saralash. O'qish yozishdan ko'p bo'lgan tizimda (90-bob: 10×) bu narx o'qishning har biriga tushadi.

Shuning uchun tanlov **o'qish/yozish nisbati** va **obunachilar taqsimotiga** bog'liq:

- ko'pchilikning obunachisi oz, o'qish ko'p → yozishda tarqatish (oldindan hisoblangan lenta tez o'qiladi);
- shaxsiylashtirilgan, reytingli lenta → o'qishda yig'ish (oldindan hisoblab bo'lmaydi);
- obunachilari juda ko'p akkauntlar → ularning yozuvini o'qishda qo'shish (aralash yondashuv). Bu — yuqoridagi hisobdan kelib chiqadigan **dizayn varianti**. Uni Twitter qanday amalga oshirgani haqida bu kitobda ishlatilgan rasmiy matnli manbalarda tafsilot yo'q (100-bob).

## Psevdokod: yozishda tarqatish (Mastodon tuzilmasi bo'yicha)

```text
onNewPost(post):
    feed.add(author.id, post)                          // o'ziga darhol
    for batch in followers(author).activeSince(7 days).inBatches(1000):
        queue.pushBulk(FeedInsert, batch.map(f => (post.id, f.id)))
    if post.isPublic:
        pubsub.publish("timeline:public", render(post))    // at-most-once, real vaqt

FeedInsert(postId, followerId):                        // fon worker
    if filtered(followerId, post): return               // blok, mute, til
    redis.zadd("feed:home:" + followerId, post.id, post.id)
    redis.zremrangebyrank("feed:home:" + followerId, 0, -(800 + 1))   // eng eski — tashqariga
    stream.notify(followerId, post)                     // ulangan bo'lsa

readHomeFeed(userId, beforeId):
    ids = redis.zrevrangebyscore("feed:home:" + userId, beforeId, "-inf", limit = 20)
    return hydrate(ids)                                 // ID → to'liq yozuv (kesh, baza)
```

## Psevdokod: nofaol foydalanuvchi qaytganda

```text
onLogin(user):
    if user.lastSignIn < ACTIVE_DURATION ago:           // lentasi saqlanmagan
        queue.push(RegenerationWorker, user.id)         // Mastodon: PrecomputeFeedService
        // klientga: lenta hali tayyor emas (UI qarori)
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| Fon vazifalari va partiyalab qo'yish | Laravel navbatlari — [Laravel 25-bob](../laravel/25-navbatlar.md); Symfony Messenger — [Symfony 26-bob](../symfony/26-messenger.md); navbat arxitekturasi — 26-bob |
| Real vaqt bildirish | WebSocket/SSE va pub/sub — 64-bob |
| Lenta keshida ID, keyin "hydrate" | Kesh — 25-bob; ro'yxat shartnomasi (kursor bilan sahifalash) — 66-bob |
| Saralanadigan ID'lar | 98-bob (UUIDv7, Snowflake) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Yozishda tarqatish | Lenta o'qish juda tez | Mashhur akkauntda millionlab yozuv; lenta xotirada |
| O'qishda yig'ish | Yozish arzon; shaxsiylashtirish va reyting mumkin | Har o'qish qimmat |
| Faqat faol obunachilarga | Behuda yozuvlar yo'q | Qaytgan foydalanuvchiga lentani qayta yig'ish kerak |
| Lenta uzunligini cheklash (800) | Xotira chegaralangan | Eskiroq yozuvlar uchun boshqa manba kerak |
| Pub/sub bilan jonli bildirish | Oddiy, tez | At-most-once: uzilganda xabar yo'qoladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har obunachiga tarqatishni so'rov ichida, sinxron bajarish | Mashhur muallif yozuvni "yuborish" bir necha daqiqa kutadi | Fon vazifalari, partiyalar |
| Lentada to'liq yozuvni saqlash | Xotira ko'payadi; tahrirlangan yozuv har lentada eskiradi | Faqat ID; o'qishda hydrate |
| Lentani cheklamaslik | Redis xotirasi cheksiz o'sadi | `MAX_ITEMS` va trim |
| Nofaol foydalanuvchilarga ham tarqatish | Yozuvlarning katta qismi hech qachon o'qilmaydi | Faqat faollarga; qaytganda qayta yig'ish |
| Pub/sub'ni ishonchli yetkazish deb hisoblash | Redis: at-most-once, xabar yo'qolishi mumkin | Saqlanadigan lenta + jonli bildirish; kerak bo'lsa Streams |
| Mashhurlik muammosini e'tiborsiz qoldirish | Bitta yozuv navbatni to'ldiradi | Obunachilar soniga qarab aralash yondashuv |
| Blok va filtrni faqat yozishda tekshirish | Keyin bloklangan muallif lentada qoladi | O'qishda ham filtr |

## Amaliyot

1. Tizimingizdagi "lenta" turidagi funksiyalarni toping: bildirishnomalar, faoliyat oqimi, yangiliklar. Ular yozishda tarqatiladimi yoki o'qishda yig'iladimi?
2. Obunachilar taqsimotini o'lchang: eng ko'p obunachili 1% akkaunt nechta obunachiga ega? Yozishda tarqatishning eng yomon holatini hisoblang.
3. Mastodon'dagi kabi "faqat faollarga" qoidasini qo'llasangiz, lenta yozuvlari necha foizga kamayadi?
4. Lenta keshini Redis'da sorted set bilan prototip qiling: qo'shish, trim, kursor bilan o'qish.
5. Jonli bildirish uzilganda foydalanuvchi nimani yo'qotadi? Lentani qayta o'qish yetarlimi?

## Manbalar

- Mastodon — `FanOutOnWriteService` (manba kodi): <https://github.com/mastodon/mastodon/blob/main/app/services/fan_out_on_write_service.rb>
- Mastodon — `FeedManager` (`MAX_ITEMS`, `REBLOG_FALLOFF`, sorted set): <https://github.com/mastodon/mastodon/blob/main/app/lib/feed_manager.rb>
- Mastodon — `FeedInsertWorker`: <https://github.com/mastodon/mastodon/blob/main/app/workers/feed_insert_worker.rb>
- Mastodon — `User::Activity` (`USER_ACTIVE_DAYS`, sukut 7 kun): <https://github.com/mastodon/mastodon/blob/main/app/models/concerns/user/activity.rb>
- Mastodon — `RegenerationWorker`: <https://github.com/mastodon/mastodon/blob/main/app/workers/regeneration_worker.rb>
- Mastodon — Scaling up your server (Redis'dagi lentalar): <https://docs.joinmastodon.org/admin/scaling/>
- Redis — Pub/Sub (Delivery semantics): <https://redis.io/docs/latest/develop/pubsub/>
- X — *the-algorithm* README va Home Mixer README: <https://github.com/twitter/the-algorithm>

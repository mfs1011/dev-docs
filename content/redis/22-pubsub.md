# 22 — Pub/Sub

[Mundarija](README.md)

## Tushuncha

RD (Pub/sub): `SUBSCRIBE`, `UNSUBSCRIBE` va `PUBLISH` — **nashr qilish/obuna** (publish/subscribe) usuli. Yuboruvchi (publisher) xabarni ma'lum oluvchiga emas, **kanalga** yuboradi va kim obuna bo'lganini bilmaydi. Obunachi (subscriber) qiziqtirgan kanallarga obuna bo'ladi va kim yuborayotganini bilmaydi. Shu ajralish tizimni kengaytirishni osonlashtiradi.

| Buyruq | Nima (RD) |
| --- | --- |
| `SUBSCRIBE kanal …` | Kanallarga obuna; xabarlar yuborilish tartibida keladi |
| `PSUBSCRIBE naqsh` | Glob naqsh bo'yicha: `news.*` — `news.art.figurative`, `news.music.jazz` … |
| `PUBLISH kanal xabar` | Javob — xabarni **olgan** obunachilar soni |
| `SSUBSCRIBE`/`SPUBLISH` | Klaster uchun sharded Pub/Sub |

RD: RESP2 da obuna bo'lgan ulanish oddiy buyruqlarni bajarmaydi (faqat `SUBSCRIBE`, `PING` va boshqa bir nechta buyruq) — obunachiga **alohida ulanish** kerak. RESP3 da bu cheklov yo'q.

### Yetkazish: "ko'pi bilan bir marta"

RD (Delivery semantics): Pub/Sub — **at-most-once** (ko'pi bilan bir marta): xabar yetkaziladi yoki umuman yetkazilmaydi. Server uni yuborgandan keyin qayta yuborilmaydi. Obunachi uni qayta ishlay olmasa (xato yoki tarmoq uzilishi) — xabar **butunlay yo'qoladi**. Kuchliroq kafolat kerak bo'lsa — **Streams**: xabarlar saqlanadi, at-most-once va **at-least-once** (kamida bir marta) ikkalasini ham qo'llaydi (10, 23-boblar).

```text
Pub/Sub:  PUBLISH → hozir ulangan obunachilarga → hech qayerda saqlanmaydi
Stream:   XADD → saqlanadi → kim qachon o'qisa, oladi
```

### Kalit o'zgarishlari haqida xabar (keyspace notifications)

RD (Keyspace notifications): Redis kalitlardagi o'zgarishlarni Pub/Sub kanallariga e'lon qila oladi. Masalan, 0-bazada `mykey` ni `DEL` qilish ikki xabar beradi:

```text
PUBLISH __keyspace@0__:mykey del      ← kalit bo'yicha: xabar — hodisa nomi
PUBLISH __keyevent@0__:del mykey      ← hodisa bo'yicha: xabar — kalit nomi
```

Standart holatda **o'chiq** (biroz protsessor sarflaydi); yoqish — `notify-keyspace-events` (`redis.conf` yoki `CONFIG SET`). Har harf — bir toifa: `K` — keyspace, `E` — keyevent, `g` — umumiy buyruqlar (`DEL`, `EXPIRE` …), `$` — string, `x` — muddati tugash (expired), `e` — chiqarib tashlash (evicted) va hokazo; kamida `K` yoki `E` bo'lishi shart.

RD (Timing of expired events): `expired` hodisasi TTL nolga yetgan **lahzada emas**, Redis kalitni **o'chirganda** chiqadi — kalitga murojaat qilinganda yoki fondagi tekshiruv uni topganda. Kalitlar ko'p va murojaat bo'lmasa, sezilarli kechikish bo'lishi mumkin.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). Node.js — node-redis'ning rasmiy Pub/Sub hujjati bo'yicha (`duplicate()`, `subscribe`, `pSubscribe`). PHP — Predis'ning rasmiy `examples/pubsub_consumer.php` namunasi asosida (`pubSubLoop`), naqsh obunasi qo'shilgan.

### Node.js

```js
// node-redis Pub/Sub: obuna, naqsh, at-most-once va keyspace notifications
import { createClient } from 'redis';
const kut = ms => new Promise(r => setTimeout(r, ms));
const pub = createClient(); pub.on('error', e => console.log(e)); await pub.connect();

// 1) Xabar obunachi yo'qligida yuboriladi
console.log('obunachisiz PUBLISH, oluvchilar:', await pub.publish('yangiliklar', 'xabar-1'));
await pub.xAdd('yangiliklar:stream', '*', { matn: 'xabar-1' });

// 2) Obunachi — alohida ulanish (RESP2 da obuna ulanishni "egallaydi")
const sub = pub.duplicate(); sub.on('error', e => console.log(e)); await sub.connect();
await sub.subscribe('yangiliklar', (m, ch) => console.log(`  [${ch}] ${m}`));
await sub.pSubscribe('buyurtma:*', (m, ch) => console.log(`  [naqsh buyurtma:* ← ${ch}] ${m}`));
console.log('PUBLISH yangiliklar, oluvchilar:', await pub.publish('yangiliklar', 'xabar-2'));
console.log('PUBLISH buyurtma:42, oluvchilar:', await pub.publish('buyurtma:42', "to'landi"));
await kut(100);
console.log('stream esa saqlagan:', JSON.stringify((await pub.xRange('yangiliklar:stream', '-', '+')).map(e => e.message)));

// 3) Keyspace notifications: kalit muddati tugaganda
console.log('notify-keyspace-events (oldin):', JSON.stringify((await pub.configGet('notify-keyspace-events'))['notify-keyspace-events']));
await pub.configSet('notify-keyspace-events', 'Ex');
await sub.subscribe('__keyevent@0__:expired', (m, ch) => console.log(`  [${ch}] ${m}`));
await pub.set('sessiya:abc', '1', { PX: 300 });
await kut(1500);
await pub.configSet('notify-keyspace-events', '');
console.log('notify-keyspace-events (keyin):', JSON.stringify((await pub.configGet('notify-keyspace-events'))['notify-keyspace-events']));

await pub.del('yangiliklar:stream');
await sub.close(); await pub.close();
```

```text vps
$ node pubsub.js
obunachisiz PUBLISH, oluvchilar: 0
  [yangiliklar] xabar-2
PUBLISH yangiliklar, oluvchilar: 1
PUBLISH buyurtma:42, oluvchilar: 1
  [naqsh buyurtma:* ← buyurtma:42] to'landi
stream esa saqlagan: [{"matn":"xabar-1"}]
notify-keyspace-events (oldin): ""
  [__keyevent@0__:expired] sessiya:abc
notify-keyspace-events (keyin): ""
```

- Obunachi bo'lmagan paytda yuborilgan `xabar-1` — oluvchilar **0**; keyin ulangan obunachi uni **olmadi**. Xuddi shu xabar stream'da esa saqlanib qoldi.
- Obunadan keyin `xabar-2` — 1 oluvchi; `buyurtma:42` — naqsh obunasi (`buyurtma:*`) orqali keldi.
- Keyspace: sozlama standartda bo'sh (`""`, o'chiq). `Ex` — keyevent + expired. 300 ms TTL'li kalit o'chganda `__keyevent@0__:expired` kanaliga kalit nomi keldi. Sinovdan keyin sozlama yana `""` ga qaytarildi.

### PHP

```php
<?php
// Predis pubSubLoop — Predis examples/pubsub_consumer.php asosida
require __DIR__ . '/vendor/autoload.php';
$client = new Predis\Client(['read_write_timeout' => 0]);
$pubsub = $client->pubSubLoop();
$pubsub->subscribe('control_channel', 'notifications');
$pubsub->psubscribe('buyurtma:*');
foreach ($pubsub as $message) {
    switch ($message->kind) {
        case 'subscribe':
        case 'psubscribe':
            echo "obuna: {$message->channel}", PHP_EOL;
            break;
        case 'message':
            if ($message->channel == 'control_channel' && $message->payload == 'quit_loop') {
                echo 'to\'xtatildi', PHP_EOL;
                $pubsub->unsubscribe(); $pubsub->punsubscribe();
            } else {
                echo "[{$message->channel}] {$message->payload}", PHP_EOL;
            }
            break;
        case 'pmessage':
            echo "[naqsh {$message->pattern} ← {$message->channel}] {$message->payload}", PHP_EOL;
            break;
    }
}
unset($pubsub);
```

```text vps
$ redis-cli PUBLISH notifications oldin
0
$ php obunachi.php & sleep 1; redis-cli PUBLISH notifications "salom"; redis-cli PUBLISH buyurtma:7 yetkazildi; redis-cli PUBLISH control_channel quit_loop; wait
obuna: control_channel
obuna: notifications
obuna: buyurtma:*
1
[notifications] salom
[naqsh buyurtma:* ← buyurtma:7] yetkazildi
1
to'xtatildi
1
$ redis-cli CONFIG GET notify-keyspace-events
notify-keyspace-events
```

- Obunachi ishga tushishidan oldin yuborilgan xabar — 0 oluvchi, obunachi uni ko'rmadi.
- Obunadan keyingi xabarlar keldi (`PUBLISH` javobi — 1); `quit_loop` — tsikl to'xtadi.
- `read_write_timeout => 0` — Predis misolidagi kabi: obunachi xabar kutib cheksiz o'tira oladi.
- Oxirida `notify-keyspace-events` — bo'sh (o'chiq) qoldi.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Hozir ulanganlarga tezkor xabar (chat, jonli yangilanish) | Pub/Sub |
| Xabar yo'qolmasligi kerak, keyin o'qish | Stream (23-bob) |
| Ishni bitta worker bajarsin | Navbat (21-bob) |
| Kalit o'zgarishini kuzatish | Keyspace notifications |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Muhim xabar uchun Pub/Sub | Ulanmagan obunachi xabarni yo'qotadi (RD, sinovda) | Stream |
| Obunachi va boshqa buyruqlar bitta ulanishda (RESP2) | Obuna ulanishni egallaydi (RD) | `duplicate()` / alohida klient |
| Keyspace notifications ishlamayapti deb o'ylash | Standartda o'chiq (RD, sinovda `""`) | `notify-keyspace-events` |
| `expired` aniq TTL vaqtida keladi deb kutish | Kalit o'chirilganda keladi (RD) | Aniq vaqt kerak bo'lsa — sorted set (21-bob) |
| Bir kanalga bir necha marta obuna (node-redis) | Har biri alohida tinglovchi — xabar ikki marta (node-redis) | Bir marta obuna |
| Klasterda keyspace hodisalarini bitta tugundan kutish | Har tugun faqat o'z kalitlari haqida (RD) | Har tugunga obuna |

## Amaliyot

1. Pub/Sub'da yuboruvchi va obunachi bir-birini biladimi?
2. "At-most-once" nimani anglatadi?
3. Sinovda obunachi ulanishidan oldin yuborilgan xabar bilan nima bo'ldi?
4. `PUBLISH` nimani qaytaradi?
5. Keyspace notifications qanday yoqiladi va `Ex` nimani bildiradi?
6. `expired` hodisasi qachon chiqadi?

<details>
<summary>Javoblar</summary>

1. Yo'q — faqat kanal orqali bog'langan.
2. Xabar bir marta yetkaziladi yoki umuman yetkazilmaydi; qayta yuborilmaydi.
3. Yo'qoldi (0 oluvchi); stream'dagisi saqlandi.
4. Xabarni olgan obunachilar sonini.
5. `notify-keyspace-events` (yoki `CONFIG SET`); `E` — keyevent, `x` — expired hodisalari.
6. Redis kalitni o'chirganda (murojaatda yoki fon tekshiruvida), TTL nolga yetgan lahzada emas.

</details>

## Rasmiy hujjat

- [RD: Pub/sub](https://redis.io/docs/latest/develop/pubsub/) · [Keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/)
- [RD: Pub/sub messaging](https://redis.io/docs/latest/develop/use-cases/pub-sub/)
- [node-redis: Pub/Sub](https://github.com/redis/node-redis/blob/master/docs/pub-sub.md) · [Predis: pubsub_consumer.php](https://github.com/predis/predis/blob/v3.7.1/examples/pubsub_consumer.php)

# 23 — Hodisalar oqimi

[Mundarija](README.md)

## Tushuncha

10-bobda stream turi va consumer group buyruqlari ko'rildi. Bu bob — ularni ilovada **hodisalar oqimi** (event streaming) sifatida ishlatish: foydalanuvchi amallari, telemetriya, tranzaksiyalar, servislar orasidagi xabarlar.

RD (Streaming): kerak — **tartiblangan, saqlanadigan jurnal**, har iste'molchining mustaqil kuzatuvi va tasdig'i, **kamida bir marta** yetkazish va saqlash hajmini boshqarish. Oddiy yo'llarning kamchiliklari:

- **Alohida streaming platforma** (Kafka, Pulsar) — hammasini hal qiladi, lekin saqlash muddati soatlar yoki kunlar bo'lsa, alohida klaster, bo'laklar (partition) va qayta taqsimlashni boshqarish ortiqcha.
- **Pub/Sub** — "yubor va unut": tarix, qayta o'qish yo'q (22-bob).
- **Bazadan yangi qatorlarni so'rab turish** — bazaga doimiy yuk, parallel yozuvchilardan tartib qiyin.

| | Pub/Sub (22) | Navbat (21) | Stream (shu bob) |
| --- | --- | --- | --- |
| Tarix | Yo'q | Bajarilgach o'chadi | Saqlanadi |
| Bitta hodisani kim oladi | Hozir ulanganlar | Bitta worker | Har **guruh** o'zi, guruh ichida — bitta consumer |
| Qayta o'qish | Yo'q | Yo'q | Istalgan joydan |

### RD namunasining tuzilishi

| Amal | Redis | Nima |
| --- | --- | --- |
| Yozish | `XADD … MAXLEN ~ N` (pipeline) | Hodisa qo'shiladi, eski yozuvlar taxminan N gacha qisqartiriladi |
| Guruh | `XGROUP CREATE … MKSTREAM` | Har guruh — mustaqil o'quvchi (hisob, analitika …) |
| O'qish | `XREADGROUP … >` | Guruhdagi consumer'ga hali hech kimga berilmagan yozuvlar |
| Tasdiq | `XACK` | Yozuv kutilayotganlar ro'yxatidan (PEL — Pending Entries List) chiqadi |
| Qaytarib olish | `XAUTOCLAIM` | Ma'lum vaqtdan ko'p tasdiqlanmay turgan yozuvlarni boshqa consumer'ga o'tkazish |
| Qayta o'qish | `XRANGE` | Tarixni boshidan |
| Saqlash hajmi | `XTRIM MAXLEN` / `MINID` | Eski yozuvlarni o'chirish |

`XTRIM` (RD): `=` — **aniq** qisqartirish (standart), `~` — **taxminiy**: samaraliroq, lekin chegaradan biroz ko'proq yozuv qoldirishi mumkin.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD namunalari o'zgarishsiz: Node.js — `eventStream.js`, PHP — `EventStream.php`. Sinov uchun qaytarib olish chegarasi (`claimMinIdleMs`) 300 ms.

Ssenariy: 4 ta buyurtma hodisasi; `hisob` guruhida ikki consumer (`c1`, `c2`), `analitika` guruhida bitta. `c1` tasdiqlaydi, `c2` tasdiqlamay "qulaydi".

### Node.js

```js
// RD streaming (node-redis) namunasi: eventStream.js o'zgarishsiz
const { createClient } = require("redis");
const { EventStream } = require("./eventStream.js");
const kut = (ms) => new Promise((r) => setTimeout(r, ms));
const turlar = (rows) => rows.map(([, f]) => f.type + "#" + f.buyurtma).join(", ");

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const es = new EventStream({ redisClient: redis, streamKey: "sinov:buyurtmalar", claimMinIdleMs: 300 });
  await es.deleteStream();
  await es.ensureGroup("hisob", "0");
  await es.ensureGroup("analitika", "0");

  const ids = await es.produceBatch([["yaratildi", { buyurtma: 1 }], ["yaratildi", { buyurtma: 2 }],
                                     ["to'landi", { buyurtma: 1 }], ["yaratildi", { buyurtma: 3 }]]);
  console.log("XADD:", ids.length, "ta hodisa, birinchi ID:", ids[0].replace(/^\d+/, "<ms>"));

  // Bitta guruhda ikki consumer — ish bo'linadi
  const a = await es.consume("hisob", "c1", 2, 100);
  const b = await es.consume("hisob", "c2", 2, 100);
  console.log("hisob/c1:", turlar(a));
  console.log("hisob/c2:", turlar(b));
  await es.ack("hisob", a.map(([id]) => id));        // c1 tasdiqladi, c2 "qulab tushdi"

  // Boshqa guruh — hamma hodisani o'zi oladi
  console.log("analitika/x:", turlar(await es.consume("analitika", "x", 10, 100)));

  let g = (await es.infoGroups()).find((r) => r.name === "hisob");
  console.log(`hisob: pending=${g.pending}`);
  await kut(400);                                   // claimMinIdleMs 300 ms o'tdi
  const { claimed } = await es.autoclaim("hisob", "c1");
  console.log("XAUTOCLAIM → c1:", turlar(claimed));
  await es.ack("hisob", claimed.map(([id]) => id));
  g = (await es.infoGroups()).find((r) => r.name === "hisob");
  console.log(`hisob: pending=${g.pending}`);

  // Qayta o'qish va saqlash hajmi
  console.log("replay (XRANGE):", turlar(await es.replay()));
  console.log("uzunlik:", await es.length(), "→ trim MAXLEN 2 → o'chirildi:", await es.trimMaxlen(2), ", qoldi:", await es.length());
  await es.deleteStream();
  await redis.close();
})();
```

### PHP

```php
<?php
// RD streaming (Predis) namunasi: EventStream.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/EventStream.php';
$turlar = fn(array $rows) => implode(', ', array_map(fn($r) => $r[1]['type'] . '#' . $r[1]['buyurtma'], $rows));

$es = new EventStream(new Predis\Client(), 'sinov:buyurtmalar', 10000, 300);
$es->deleteStream();
$es->ensureGroup('hisob', '0');
$es->ensureGroup('analitika', '0');
$ids = $es->produceBatch([['yaratildi', ['buyurtma' => 1]], ['yaratildi', ['buyurtma' => 2]],
                          ["to'landi", ['buyurtma' => 1]], ['yaratildi', ['buyurtma' => 3]]]);
echo "XADD: ", count($ids), " ta hodisa", PHP_EOL;

$a = $es->consume('hisob', 'c1', 2, 100);
$b = $es->consume('hisob', 'c2', 2, 100);
echo "hisob/c1: ", $turlar($a), PHP_EOL, "hisob/c2: ", $turlar($b), PHP_EOL;
$es->ack('hisob', array_column($a, 0));
echo "analitika/x: ", $turlar($es->consume('analitika', 'x', 10, 100)), PHP_EOL;

$g = array_values(array_filter($es->infoGroups(), fn($r) => $r['name'] === 'hisob'))[0];
echo "hisob: pending={$g['pending']}", PHP_EOL;
usleep(400000);
$claimed = $es->autoclaim('hisob', 'c1')['claimed'];
echo "XAUTOCLAIM → c1: ", $turlar($claimed), PHP_EOL;
$es->ack('hisob', array_column($claimed, 0));
$g = array_values(array_filter($es->infoGroups(), fn($r) => $r['name'] === 'hisob'))[0];
echo "hisob: pending={$g['pending']}", PHP_EOL;

echo "replay (XRANGE): ", $turlar($es->replay()), PHP_EOL;
$n = $es->length(); $o = $es->trimMaxlen(2);
echo "uzunlik: $n → trim MAXLEN 2 → o'chirildi: $o, qoldi: ", $es->length(), PHP_EOL;
$es->deleteStream();
```

```text vps
$ cd /root/redis-ilova/stream-node && node sinov.cjs
XADD: 4 ta hodisa, birinchi ID: <ms>-0
hisob/c1: yaratildi#1, yaratildi#2
hisob/c2: to'landi#1, yaratildi#3
analitika/x: yaratildi#1, yaratildi#2, to'landi#1, yaratildi#3
hisob: pending=2
XAUTOCLAIM → c1: to'landi#1, yaratildi#3
hisob: pending=0
replay (XRANGE): yaratildi#1, yaratildi#2, to'landi#1, yaratildi#3
uzunlik: 4 → trim MAXLEN 2 → o'chirildi: 0 , qoldi: 4
$ cd /root/redis-ilova/stream-php && php sinov.php
XADD: 4 ta hodisa
hisob/c1: yaratildi#1, yaratildi#2
hisob/c2: to'landi#1, yaratildi#3
analitika/x: yaratildi#1, yaratildi#2, to'landi#1, yaratildi#3
hisob: pending=2
XAUTOCLAIM → c1: to'landi#1, yaratildi#3
hisob: pending=0
replay (XRANGE): yaratildi#1, yaratildi#2, to'landi#1, yaratildi#3
uzunlik: 4 → trim MAXLEN 2 → o'chirildi: 0, qoldi: 4
```

Ikki tilda bir xil:

- `hisob` guruhida ish **bo'lindi**: `c1` — 1, 2-hodisalar; `c2` — 3, 4. Har biri o'z ulushini oldi.
- `analitika` — boshqa guruh — **to'rttasini ham** oldi: har guruh oqimni mustaqil o'qiydi (fan-out).
- `c2` tasdiqlamadi — `pending=2`. 300 ms dan keyin `XAUTOCLAIM` ularni `c1` ga o'tkazdi, `c1` tasdiqladi — `pending=0`. Hodisa yo'qolmadi (kamida bir marta).
- `XRANGE` — butun tarix, tartib bilan, guruhlar o'qiganidan keyin ham.
- Kuzatildi: RD namunasidagi `trimMaxlen(2)` **hech narsani o'chirmadi** (`0`, 4 ta qoldi) — u taxminiy `~` bilan chaqiradi.

### Aniq va taxminiy qisqartirish

```text vps
$ redis-cli DEL demo:streaming:stats demo:queue_stats:jobs
2
$ for i in 1 2 3 4; do redis-cli XADD sinov:qisqa "*" n $i >/dev/null; done; redis-cli XTRIM sinov:qisqa MAXLEN "~" 2; redis-cli XTRIM sinov:qisqa MAXLEN 2; redis-cli XRANGE sinov:qisqa - + | grep -A1 "^n$" | grep -v "^n$\|--"; redis-cli DEL sinov:qisqa
0
2
3
4
1
```

`MAXLEN ~ 2` — 0 ta o'chirildi; `MAXLEN 2` (aniq) — 2 ta o'chirildi, oxirgi ikkitasi (3, 4) qoldi. Taxminiy qisqartirish katta oqimda samarali (RD), kichik sinovda esa ko'rinmaydi. (Birinchi buyruq ch21–23 PHP namunalaridan qolgan statistika kalitlarini tozaladi.)

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Bitta hodisani bir nechta servis o'qishi kerak | Har biriga alohida consumer group |
| Bitta servisni ko'paytirish | Bitta guruhda bir nechta consumer |
| Qulagan consumer | `XAUTOCLAIM` (yoki `XCLAIM`) |
| Saqlash — son bo'yicha | `MAXLEN ~ N` (yozishda) |
| Saqlash — vaqt bo'yicha | `MINID` (ID vaqtga asoslangan) |
| Oylar davomida saqlash, katta hajm | RD: alohida platforma (Kafka) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `XACK` siz ishlash | PEL o'sadi, yozuvlar qayta beriladi | Bajargach `XACK` |
| Qulagan consumer'ni kuzatmaslik | Uning yozuvlari abadiy PEL'da | `XAUTOCLAIM` jadval bo'yicha |
| Qisqartirishsiz | Stream cheksiz o'sadi | `MAXLEN` / `MINID` |
| `~` bilan aniq son kutish | Ko'proq qoldirishi mumkin (RD, sinovda 0 o'chdi) | Aniqlik kerak bo'lsa `=` |
| Ikki servis bitta guruhda | Hodisalar ular orasida bo'linib ketadi | Har servisga o'z guruhi |
| Idempotent bo'lmagan ishlov | Qayta berilgan hodisa ikki marta bajariladi | Idempotent ishlov yoki tekshiruv |

## Amaliyot

1. Stream Pub/Sub'dan va navbatdan nimasi bilan farq qiladi?
2. Bitta guruhdagi ikki consumer va ikki guruh — farqi nima?
3. Sinovda `c2` tasdiqlamagan hodisalar bilan nima bo'ldi?
4. `XTRIM` da `=` va `~` farqi?
5. Nega ishlov idempotent bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. Tarixni saqlaydi; har guruh mustaqil o'qiydi; qayta o'qish mumkin.
2. Guruh ichida ish bo'linadi; har guruh esa barcha hodisalarni oladi.
3. 300 ms dan keyin `XAUTOCLAIM` ularni `c1` ga o'tkazdi, `c1` tasdiqladi.
4. `=` — aniq; `~` — taxminiy, samaraliroq, ko'proq qoldirishi mumkin.
5. Kamida bir marta yetkazishda hodisa qayta berilishi mumkin.

</details>

## Rasmiy hujjat

- [RD: Streaming](https://redis.io/docs/latest/develop/use-cases/streaming/)
- [RD: Streaming (node-redis)](https://redis.io/docs/latest/develop/use-cases/streaming/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/streaming/php/)
- [RD: Streams](https://redis.io/docs/latest/develop/data-types/streams/) · [XTRIM](https://redis.io/docs/latest/commands/xtrim/)

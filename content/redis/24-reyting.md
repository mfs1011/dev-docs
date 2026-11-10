# 24 — Reyting jadvali

[Mundarija](README.md)

## Tushuncha

**Reyting jadvali** (leaderboard) — o'yinchilar, mahsulotlar, sotuvchilar kabi narsalarni doim o'zgarib turadigan ball bo'yicha tartiblab, real vaqtda ko'rsatish.

RD (Leaderboard): relyatsion bazada bitta foydalanuvchining o'rnini hisoblash uchun butun jadval bo'yicha `ORDER BY` kerak — kamida O(N), millionlab qatorda soniyalar. Natijani keshlash yordam bermaydi: ball har harakatda o'zgaradi. Jarayon ichidagi tuzilma load balancer ortida ishlamaydi — hech bir nusxada to'liq reyting yo'q.

### Redis yechimi (RD)

| Qism | Nima |
| --- | --- |
| **Sorted set** — bitta jadval uchun bitta kalit | A'zo — ID, ball — reyting qiymati; tartib avtomatik (9-bob) |
| `ZADD`, `ZRANGE`, `ZREVRANK` | O(log N) — to'plam hajmidan qat'i nazar |
| `ZINCRBY` | Ballni atomik oshirish — o'qib-yozish sikli yo'q |
| `ZRANGE … REV` | Top-N va "atrofimdagilar" bitta buyruqda |
| Hash — har a'zoga | Metama'lumot (ism, avatar) — sorted set yengil qoladi |
| `EXPIRE` + `ZUNIONSTORE` | Kunlik/haftalik jadvallar o'zi o'chadi; oynalarni birlashtirish |

RD: millionlab a'zo taxminan 500 MB xotirada.

RD namunasida `maxEntries` — jadval hajmi chegarasi: oshgani eng past balldagilar bilan birga **metama'lumoti** ham o'chiriladi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD namunalari o'zgarishsiz: Node.js — `leaderboard.js`, PHP — `RedisLeaderboard.php`.

### Node.js

```js
// RD leaderboard (node-redis) namunasi: leaderboard.js o'zgarishsiz
const { createClient } = require("redis");
const { RedisLeaderboard } = require("./leaderboard.js");
const qator = (e) => `${e.rank}. ${e.metadata.ism} ${e.score}`;

(async () => {
  // node-redis 6: standart RESP3; RD namunasi RESP2 javobini kutadi (sendCommand ZRANGE … WITHSCORES)
  const redis = createClient({ RESP: 2 });
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const lb = new RedisLeaderboard({ redisClient: redis, key: "sinov:reyting", maxEntries: 100 });
  await lb.clear();
  const oyinchilar = [["u1", "Aziz", 1200], ["u2", "Dilnoza", 1500], ["u3", "Bekzod", 900],
                      ["u4", "Malika", 1350], ["u5", "Jasur", 1100], ["u6", "Nodira", 800]];
  for (const [id, ism, ball] of oyinchilar) await lb.upsertUser(id, ball, { ism });

  console.log("top 3:", (await lb.getTop(3)).map(qator).join(" | "));
  const r = await lb.incrementScore("u3", 500);              // ZINCRBY
  console.log(`Bekzod +500 → ${r.score}, o'rni: ${await lb.getRank("u3")}`);
  const rank = await lb.getRank("u5");
  console.log("Jasur atrofida:", (await lb.getAroundRank(rank, 3)).map(qator).join(" | "));
  console.log("maxEntries 4 → olib tashlandi:", JSON.stringify(await lb.setMaxEntries(4)), ", qoldi:", await lb.getSize());
  console.log("u6 metama'lumoti:", JSON.stringify(await lb.getUserMetadata("u6")));
  await redis.close();
})();
```

Kuzatildi: birinchi ishga tushirishda RD namunasi node-redis 6.3.1 da **noto'g'ri** natija berdi (`top 3: 1. undefined NaN | 2. undefined NaN`). Sababi: node-redis v6 da standart protokol — **RESP3** (v5 da RESP2 edi; node-redis "v5 to v6" hujjati). Namuna `sendCommand(['ZRANGE', …, 'WITHSCORES'])` javobini RESP2 dagi tekis ro'yxat (`a, 1, b, 2`) deb o'qiydi, RESP3 da esa u juftlar (`[["b",2],["a",1]]`). Namunaga tegmasdan, klient `RESP: 2` bilan yaratildi.

```text vps
$ cd /root/redis-ilova/lb-node && node sinov.cjs
top 3: 1. Dilnoza 1500 | 2. Malika 1350 | 3. Aziz 1200
Bekzod +500 → 1400, o'rni: 2
Jasur atrofida: 4. Aziz 1200 | 5. Jasur 1100 | 6. Nodira 800
maxEntries 4 → olib tashlandi: ["u6","u5"] , qoldi: 4
u6 metama'lumoti: {}
$ redis-cli ZRANGE sinov:reyting 0 -1 REV WITHSCORES; redis-cli --scan --pattern "sinov:reyting:user:*" | sort
u2
1500
u3
1400
u4
1350
u1
1200
sinov:reyting:user:u1
sinov:reyting:user:u2
sinov:reyting:user:u3
sinov:reyting:user:u4
```

### PHP

```php
<?php
// RD leaderboard (Predis) namunasi: RedisLeaderboard.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/RedisLeaderboard.php';
$qator = fn(array $e) => "{$e['rank']}. {$e['metadata']['ism']} {$e['score']}";

$lb = new RedisLeaderboard(new Predis\Client(), 'sinov:reyting2', 100);
$lb->clear();
foreach ([['u1', 'Aziz', 1200], ['u2', 'Dilnoza', 1500], ['u3', 'Bekzod', 900],
          ['u4', 'Malika', 1350], ['u5', 'Jasur', 1100], ['u6', 'Nodira', 800]] as [$id, $ism, $ball]) {
    $lb->upsertUser($id, $ball, ['ism' => $ism]);
}
echo "top 3: ", implode(' | ', array_map($qator, $lb->getTop(3))), PHP_EOL;
$r = $lb->incrementScore('u3', 500);
echo "Bekzod +500 → {$r['score']}, o'rni: ", $lb->getRank('u3'), PHP_EOL;
echo "Jasur atrofida: ", implode(' | ', array_map($qator, $lb->getAroundRank($lb->getRank('u5'), 3))), PHP_EOL;
echo "maxEntries 4 → olib tashlandi: ", json_encode($lb->setMaxEntries(4)), ", qoldi: ", $lb->getSize(), PHP_EOL;
echo "u6 metama'lumoti: ", json_encode($lb->getUserMetadata('u6')), PHP_EOL;
$lb->clear();
```

```text vps
$ cd /root/redis-ilova/lb-php && php sinov.php
top 3: 1. Dilnoza 1500 | 2. Malika 1350 | 3. Aziz 1200
Bekzod +500 → 1400, o'rni: 2
Jasur atrofida: 4. Aziz 1200 | 5. Jasur 1100 | 6. Nodira 800
maxEntries 4 → olib tashlandi: ["u6","u5"], qoldi: 4
u6 metama'lumoti: []
```

Ikki tilda bir xil:

- Top 3 — Dilnoza 1500, Malika 1350, Aziz 1200 (o'rinlar 1 dan).
- Bekzod `ZINCRBY` bilan +500 — 1400, darhol **2-o'rin**ga chiqdi.
- "Jasur atrofida" — uning o'rni (5) va qo'shnilari (4, 6) bitta so'rovda.
- `maxEntries 4` — eng past ikkitasi (`u6`, `u5`) olib tashlandi, ularning **metama'lumoti** ham o'chdi (`u6` — bo'sh). Redis'da 4 a'zo va 4 ta hash qoldi.

### Kunlik va haftalik jadvallar

```text vps
$ redis-cli ZADD reyting:kun:2026-11-09 100 aziz 80 dilnoza; redis-cli ZADD reyting:kun:2026-11-10 30 aziz 90 dilnoza 70 bekzod; redis-cli EXPIRE reyting:kun:2026-11-10 172800; redis-cli TTL reyting:kun:2026-11-10
2
3
1
172800
$ redis-cli ZUNIONSTORE reyting:hafta 2 reyting:kun:2026-11-09 reyting:kun:2026-11-10; redis-cli ZRANGE reyting:hafta 0 -1 REV WITHSCORES
3
dilnoza
170
aziz
130
bekzod
70
$ redis-cli DEL reyting:kun:2026-11-09 reyting:kun:2026-11-10 reyting:hafta
3
$ redis-cli --scan --pattern "sinov:reyting*" | xargs -r redis-cli DEL
5
```

- Har kunning o'z kaliti; `EXPIRE` (2 kun) — eski kunlik jadval o'zi o'chadi.
- `ZUNIONSTORE` ikki kunni **ballarni qo'shib** bitta haftalik jadvalga birlashtirdi: Dilnoza 80 + 90 = 170, Aziz 100 + 30 = 130, Bekzod 70.
- Sinov kalitlari oxirida o'chirildi.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Aniq global o'rin, tez yangilanish | Sorted set (shu bob) |
| Faqat eng mashhurlarni taxminan | RD: probabilistik Top-K |
| Hodisalar tarixi | Stream (23-bob) — tartiblangan holat saqlamaydi |
| Bir nechta oyna yig'indisi | `ZUNIONSTORE` (`WEIGHTS`, `AGGREGATE` bilan) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Reytingni bazada `ORDER BY` bilan | O(N), millionlarda soniyalar (RD) | Sorted set |
| Ballni o'qib, qo'shib, `ZADD` bilan yozish | Poyga holati | `ZINCRBY` (RD) |
| Metama'lumotni sorted set a'zosiga qo'shib yozish | A'zo nomi o'zgaradi, to'plam og'irlashadi | Alohida hash (RD) |
| Kunlik jadvallarni o'chirmaslik | Xotira o'sadi | `EXPIRE` (RD) |
| Node.js'da `sendCommand` javobini RESP2 deb o'qish | node-redis 6 — RESP3 (sinovda `NaN`) | Tayyor metodlar yoki `RESP: 2` |

## Amaliyot

1. Nega reytingni relyatsion bazada hisoblash qimmat?
2. Reyting uchun qaysi Redis turi va qaysi buyruqlar ishlatiladi?
3. Metama'lumot nega alohida hash'da saqlanadi?
4. Sinovda Node.js namunasi birinchi marta nega ishlamadi?
5. Haftalik jadval qanday hosil qilindi?

<details>
<summary>Javoblar</summary>

1. Bitta o'rin uchun butun jadval bo'yicha tartiblash kerak — O(N).
2. Sorted set: `ZADD`, `ZINCRBY`, `ZRANGE … REV`, `ZREVRANK`.
3. Sorted set yengil va tez qolishi uchun.
4. node-redis 6 standartda RESP3, namuna esa RESP2 javob shaklini kutadi.
5. Kunlik jadvallarni `ZUNIONSTORE` bilan ballarni qo'shib birlashtirib.

</details>

## Rasmiy hujjat

- [RD: Leaderboard](https://redis.io/docs/latest/develop/use-cases/leaderboard/)
- [RD: Leaderboard (node-redis)](https://redis.io/docs/latest/develop/use-cases/leaderboard/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/leaderboard/php/)
- [node-redis: v5 to v6](https://github.com/redis/node-redis/blob/master/docs/v5-to-v6.md) — RESP3
- [RD: ZUNIONSTORE](https://redis.io/docs/latest/commands/zunionstore/)

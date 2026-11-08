# 19 — Sessiyalar

[Mundarija](README.md)

## Tushuncha

HTTP holatsiz (stateless): server qaytib kelgan foydalanuvchini o'zi tanimaydi — tashqi holat kerak. Shu holat — **sessiya** (session): kim kirgan, savatchada nima bor, sozlamalar.

RD (Session store): oddiy yo'llarning kamchiliklari:

- **Sessiyani har bir ilova serverida saqlash** — yopishqoq yo'naltirish (sticky routing) kerak bo'ladi: bir foydalanuvchi doim bitta serverga; bu "issiq nuqta" yaratadi va server ishdan chiqsa boshqasiga o'tib bo'lmaydi.
- **Sessiyani relyatsion bazada saqlash** — har so'rovga 5–20 ms qo'shiladi; minglab foydalanuvchida sessiya o'qishlari baza ulanishlarini band qiladi.

Sessiyalar tashqi tozalash ishlarisiz avtomatik o'chishi kerak. Ularni yo'qotish biznesga to'g'ridan-to'g'ri zarar (tashlab ketilgan savatcha, qayta kirish) — shuning uchun saqlanish (durability) oddiy keshdagidan muhimroq.

### Redis yechimi (RD)

| Qism | Nima |
| --- | --- |
| Hash | Bir sessiya — bitta hash (`session:{id}`): maydonlarni alohida o'qish va yangilash |
| `EXPIRE` — sirpanuvchi muddat | Har so'rovda TTL yangilanadi: faol sessiya yashaydi, faoliyatsizi o'zi o'chadi |
| Cookie | Brauzerga faqat **tushunarsiz ID** (`sid`) beriladi; ma'lumotning o'zi Redis'da qoladi |
| Set | Foydalanuvchining barcha sessiyalari (`SADD`/`SMEMBERS`) — hamma qurilmalardan chiqish |
| AOF/RDB | Sessiyalar Redis qayta ishga tushganda ham saqlanadi (28-bob) |
| `DEL` | Chiqish (logout) |

RD namunasida `created_at`, `last_accessed_at`, `session_ttl` — **ichki** maydonlar: chaqiruvchi ma'lumoti ularni ustidan yoza olmaydi. Sessiya ID — tasodifiy (Node.js — `crypto`, 32 bayt).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD namunalari: Node.js — `sessionStore.js` (o'zgarishsiz), PHP — `SessionStore.php` (quyidagi tuzatish bilan). Sinov uchun TTL — 5 soniya.

### Node.js

```js
// RD session-store (node-redis) namunasi: sessionStore.js o'zgarishsiz
const { createClient } = require("redis");
const { RedisSessionStore } = require("./sessionStore.js");
const kut = (s) => new Promise((r) => setTimeout(r, s * 1000));

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const store = new RedisSessionStore({ redisClient: redis, ttl: 5 });   // sinov uchun 5 s

  const id = await store.createSession({ user: "aziz", cart_items: 0 });
  console.log("sessiya ID uzunligi:", id.length);
  await store.updateSession(id, { theme: "dark" });
  console.log("cart_items:", await store.incrementField(id, "cart_items", 2));
  console.log("sessiya:", JSON.stringify(await store.getSession(id, false)));

  await kut(3);
  console.log("3 s o'tdi, TTL:", await store.getTtl(id));
  await store.getSession(id);                                             // har so'rovda TTL yangilanadi
  console.log("getSession dan keyin TTL:", await store.getTtl(id));
  await kut(6);
  console.log("6 s faoliyatsiz:", await store.getSession(id), ", TTL:", await store.getTtl(id));

  const id2 = await store.createSession({ user: "aziz" });
  console.log("logout (deleteSession):", await store.deleteSession(id2), "→", await store.getSession(id2));
  await redis.close();
})();
```

```text vps
$ cd /root/redis-ilova/session-node && node sinov.cjs
sessiya ID uzunligi: 43
cart_items: 2
sessiya: {"user":"aziz","cart_items":"2","created_at":"2026-11-08T22:56:33+00:00","last_accessed_at":"2026-11-08T22:56:33+00:00","session_ttl":"5","theme":"dark"}
3 s o'tdi, TTL: 2
getSession dan keyin TTL: 5
6 s faoliyatsiz: null , TTL: -2
logout (deleteSession): true → null
```

- ID — 43 belgi (32 tasodifiy bayt, base64url).
- Sessiya — hash: foydalanuvchi maydonlari va uchta ichki maydon; `incrementField` — maydonni atomik oshirish.
- 3 soniyadan keyin TTL 2 qoldi; `getSession` uni yana **5** ga qaytardi — sirpanuvchi muddat.
- 6 soniya murojaat bo'lmadi — Redis kalitni o'zi o'chirdi (`null`, TTL `-2` — kalit yo'q). Tozalash ishi kerak emas.
- Chiqish — `deleteSession`.

### PHP

Kuzatildi: RD'dagi `SessionStore.php` Predis 3.7.1 da **ishlamadi**:

```text
PHP Fatal error:  Uncaught Predis\Response\ServerException: ERR wrong number of arguments for 'hset' command
```

Sababi: namuna `$pipe->hset($key, $payload)` ga **massiv** beradi, Predis 3.7.1 esa `hset($key, $field, $value)` ko'rinishini qabul qiladi (`ClientInterface`: `hset(string $key, string $field, string $value)`). Massiv uchun — `hmset(string $key, array $dictionary)`. Uch qator almashtirildi:

```text
49c49
<             $pipe->hset($key, $payload);
---
>             $pipe->hmset($key, $payload);
112c112
<             $pipe->hset($key, $payload);
---
>             $pipe->hmset($key, $payload);
148c148
<             $pipe->hset($key, [
---
>             $pipe->hmset($key, [
```

```php
<?php
// RD session-store (Predis) namunasi: SessionStore.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/SessionStore.php';

$store = new RedisSessionStore(new Predis\Client(), 'session:', 5);     // sinov uchun 5 s

$id = $store->createSession(['user' => 'aziz', 'cart_items' => 0]);
echo "sessiya ID uzunligi: ", strlen($id), PHP_EOL;
$store->updateSession($id, ['theme' => 'dark']);
echo "cart_items: ", $store->incrementField($id, 'cart_items', 2), PHP_EOL;
echo "sessiya: ", json_encode($store->getSession($id, false)), PHP_EOL;

sleep(3);
echo "3 s o'tdi, TTL: ", $store->getTtl($id), PHP_EOL;
$store->getSession($id);
echo "getSession dan keyin TTL: ", $store->getTtl($id), PHP_EOL;
sleep(6);
echo "6 s faoliyatsiz: ", var_export($store->getSession($id), true), ", TTL: ", $store->getTtl($id), PHP_EOL;

$id2 = $store->createSession(['user' => 'aziz']);
echo "logout (deleteSession): ", var_export($store->deleteSession($id2), true), " → ", var_export($store->getSession($id2), true), PHP_EOL;
```

```text vps
$ cd /root/redis-ilova/session-php && php sinov.php
sessiya ID uzunligi: 43
cart_items: 2
sessiya: {"user":"aziz","cart_items":"2","created_at":"2026-11-08T22:57:33+00:00","last_accessed_at":"2026-11-08T22:57:33+00:00","session_ttl":"5","theme":"dark"}
3 s o'tdi, TTL: 2
getSession dan keyin TTL: 5
6 s faoliyatsiz: NULL, TTL: -2
logout (deleteSession): true → NULL
$ redis-cli --scan --pattern "session:*" | wc -l
0
```

Tuzatishdan keyin — Node.js bilan bir xil natija: sirpanuvchi TTL, faoliyatsiz sessiyaning o'zi o'chishi, chiqish. Redis'da sessiya kalitlari qolmadi.

## Variantlar

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| Redis hash + TTL (shu bob) | Bir nechta server, tez o'qish | Redis — qo'shimcha xizmat |
| Har serverda xotirada | Bitta server | Sticky routing, failover yo'q (RD) |
| Relyatsion bazada | Sessiya kam o'qiladi | Har so'rovga 5–20 ms (RD) |
| Framework sessiyasi Redis bilan | Laravel, Symfony va boshqalar | Shu framework kitoblarida |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Sessiya ma'lumotini cookie'ga yozish | Brauzer ko'radi va o'zgartirishi mumkin | Cookie'da faqat tasodifiy ID (RD) |
| TTL'siz sessiya | Faoliyatsizlar abadiy qoladi | `EXPIRE`, har so'rovda yangilash |
| Taxmin qilinadigan ID (raqam, vaqt) | Begona sessiyani topish mumkin | Kriptografik tasodifiy ID |
| Butun sessiyani bitta satr qilib saqlash | Har o'zgarishda to'liq qayta yozish | Hash maydonlari (RD) |
| Persistence'siz Redis | Qayta ishga tushganda hamma chiqib ketadi | AOF/RDB (RD, 28-bob) |
| RD PHP namunasini tekshirmay ko'chirish | Predis 3.7.1 da `hset` massiv olmaydi (sinovda) | `hmset` |

## Amaliyot

1. Nega sessiyani har ilova serverida saqlash yomon?
2. Sirpanuvchi muddat qanday ishlaydi?
3. Sinovda 6 soniya faoliyatsizlikdan keyin sessiya bilan nima bo'ldi?
4. Cookie'da nima saqlanadi?
5. RD PHP namunasi nega ishlamadi va qanday tuzatildi?

<details>
<summary>Javoblar</summary>

1. Sticky routing kerak bo'ladi, server ishdan chiqsa sessiya boshqasiga o'tmaydi.
2. Har so'rovda kalit TTL'i yana to'liq qiymatga qaytariladi.
3. Redis kalitni o'zi o'chirdi (`getSession` — `null`, TTL `-2`).
4. Faqat tasodifiy sessiya ID'si.
5. `hset` ga massiv berilgan, Predis 3.7.1 esa uni qabul qilmaydi; `hmset` ga almashtirildi.

</details>

## Rasmiy hujjat

- [RD: Session store](https://redis.io/docs/latest/develop/use-cases/session-store/)
- [RD: Session store (node-redis)](https://redis.io/docs/latest/develop/use-cases/session-store/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/session-store/php/)

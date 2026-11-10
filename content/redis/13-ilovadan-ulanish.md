# 13 — Ilovadan ulanish

[Mundarija](README.md)

## Tushuncha

Shu paytgacha Redis bilan `redis-cli` orqali gaplashdik. Ilova esa Redis'ga **klient kutubxonasi** (client library) orqali ulanadi: kutubxona TCP ulanishni ochadi, buyruqni Redis protokoliga o'giradi, javobni dastur tushunadigan qiymatga aylantiradi.

| Til | Kutubxona | O'rnatish (RD) |
| --- | --- | --- |
| Node.js | **node-redis** (npm'da `redis`) | `npm install redis` |
| PHP | **Predis** (`predis/predis`) | `composer require predis/predis` |

RD (Predis guide): Predis — PHP uchun **tavsiya etilgan** klient, lekin uchinchi tomon kutubxonasi: uni Redis kompaniyasi ishlab chiqmaydi va qo'llab-quvvatlamaydi.

### Ulanish

| | node-redis (RD) | Predis (RD) |
| --- | --- | --- |
| Standart | `createClient()` — `localhost:6379` | `new Predis\Client([...])` — `host`, `port`, `database` |
| Boshqa manzil | `createClient({ url: 'redis://user:parol@host:6380' })` — URL'da host, port, login, baza raqami va TLS | Massiv parametrlari; klaster va Sentinel tugunlari — `'tcp://127.0.0.1:30001'` ko'rinishida (RD Connect) |
| Ulanish | `await client.connect()` | Birinchi buyruqda (dangasa ulanish — kuzatildi, quyida) |
| Holat | `client.isReady` — buyruq yuborishga tayyor; `client.isOpen` — socket ochiq | — |
| Yopish | `await client.close()` | Skript tugaganda |

### Xatolar

RD (Error handling, Node.js): node-redis xatolarni **rad etilgan promise** sifatida qaytaradi. Eng muhimi — **`error` hodisasi**: klientda kamida bitta `error` tinglovchisi bo'lmasa va xato yuz bersa, xato tashlanadi va Node.js jarayoni **kutilmaganda to'xtashi mumkin**.

RD (Error handling, PHP): Predis xatolarni **istisno** (exception) bilan bildiradi; hammasi `PredisException` ostida.

| Xato | Qachon (RD) | Tiklanadimi | Nima qilish |
| --- | --- | --- | --- |
| `ECONNREFUSED` / `Predis\Connection\ConnectionException` | Ulanib bo'lmadi yoki ulanish uzildi | ✅ | Kutib qayta urinish yoki muqobil yo'l |
| `ETIMEDOUT`, `ECONNRESET` / `Predis\CommunicationException` | Vaqt tugadi, ulanish uzildi | ✅ | Kutib qayta urinish |
| `WRONGTYPE` (`ReplyError`) / `Predis\Response\ServerException` | Kalit turi buyruqqa mos emas | ❌ | Kod yoki ma'lumot tuzilmasini tuzatish |

RD to'rt naqshni (pattern) tavsiya qiladi: **tez to'xtash** (fail fast — tuzatib bo'lmaydigan xatoni qayta tashlash), **yumshoq ishlash** (graceful degradation — kesh ishlamasa bazadan o'qish), **kutib qayta urinish** (retry with backoff), **jurnalga yozib davom etish**.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04, Redis 8.10.3). Node.js 26.13.0 LTS (rasmiy binar, SHA256 tekshiruvi bilan), PHP 8.5.4, Composer 2.11.1 (rasmiy installer, SHA-384 tekshiruvi bilan). Loyiha papkasi `/root/redis-ilova`: `npm install redis@6.3.1`, `composer require predis/predis:^3.7` (3.7.1 o'rnatildi).

### Ulanish va buyruqlar

Misollar — RD'dagi rasmiy namunalar (`landing`), oxiriga xato holati qo'shilgan.

Node.js:

```js
// RD: node-redis guide — ulanish, string va hash
import { createClient } from 'redis';

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
console.log('isReady:', client.isReady);

await client.set('key', 'value');
console.log(await client.get('key'));

await client.hSet('user-session:123', {
    name: 'John',
    surname: 'Smith',
    company: 'Redis',
    age: 29
});
console.log(JSON.stringify(await client.hGetAll('user-session:123'), null, 2));

// Xato turi: hash kalitga string buyrug'i
try {
    await client.get('user-session:123');
} catch (err) {
    console.log(err.name, '—', err.message);
}

await client.close();
console.log('isOpen:', client.isOpen);
```

PHP:

```php
<?php
// RD: Predis guide (PHP) — ulanish, string va hash
require 'vendor/autoload.php';

use Predis\Client as PredisClient;
use Predis\Response\ServerException;

$r = new PredisClient([
    'scheme'   => 'tcp',
    'host'     => '127.0.0.1',
    'port'     => 6379,
    'database' => 0,
]);

echo $r->set('foo', 'bar'), PHP_EOL;
echo $r->get('foo'), PHP_EOL;

$r->hset('user-session:123', 'name', 'John');
$r->hset('user-session:123', 'surname', 'Smith');
$r->hset('user-session:123', 'company', 'Redis');
$r->hset('user-session:123', 'age', 29);
echo var_export($r->hgetall('user-session:123'), true), PHP_EOL;

// Xato turi: hash kalitga string buyrug'i
try {
    $r->get('user-session:123');
} catch (ServerException $e) {
    echo get_class($e), ' — ', $e->getMessage(), PHP_EOL;
}
```

```text vps
$ redis-cli DEL key foo user-session:123
0
$ node ulanish.js
isReady: true
value
{
  "name": "John",
  "surname": "Smith",
  "company": "Redis",
  "age": "29"
}
Error — WRONGTYPE Operation against a key holding the wrong kind of value
isOpen: false
$ php ulanish.php
OK
bar
array (
  'name' => 'John',
  'surname' => 'Smith',
  'company' => 'Redis',
  'age' => '29',
)
Predis\Response\ServerException — WRONGTYPE Operation against a key holding the wrong kind of value
$ redis-cli HGETALL user-session:123
name
John
surname
Smith
company
Redis
age
29
```

- Ikkala kutubxona bir xil buyruqlarni yubordi; hash qiymatlari `redis-cli` da ham ko'rinadi.
- `age: 29` son edi, qaytib **satr** bo'lib keldi (`"29"`, `'29'`) — Redis qiymatlarni satr sifatida saqlaydi.
- Hash kalitga `GET` — `WRONGTYPE`. node-redis'da xato nomi `Error` bo'lib chiqdi (RD jadvalida — `ReplyError`); xabar matni Redis'niki. Kuzatildi.
- `close()` dan keyin `isOpen: false`.

### Redis ishlamasa

6390-portda hech narsa yo'q. Node.js — qayta urinishni o'chirib (`reconnectStrategy: false`, RD Connect):

```js
// Redis ishlamayotgan portga ulanish: qayta urinishsiz
import { createClient } from 'redis';

const client = createClient({
    url: 'redis://127.0.0.1:6390',
    socket: { reconnectStrategy: false }
});
client.on('error', err => console.log('error hodisasi:', err.code));

try {
    await client.connect();
} catch (err) {
    console.log('connect() xatosi:', err.code);
}
```

PHP:

```php
<?php
// Redis ishlamayotgan portga ulanish
require 'vendor/autoload.php';

use Predis\Client as PredisClient;
use Predis\Connection\ConnectionException;
use Predis\PredisException;

$r = new PredisClient(['host' => '127.0.0.1', 'port' => 6390]);

try {
    $r->get('foo');
} catch (ConnectionException $e) {
    echo 'ConnectionException: ', $e->getMessage(), PHP_EOL;
} catch (PredisException $e) {
    // Predis 3.7.1: ulanish rad etilsa StreamInitException keladi
    echo get_class($e), ' — ', $e->getMessage(), PHP_EOL;
}
```

```text vps
$ ss -ltn | grep -c ':6390 '; node ulanmadi.js
0
error hodisasi: ECONNREFUSED
connect() xatosi: ECONNREFUSED
$ php ulanmadi.php
Predis\Connection\Resource\Exception\StreamInitException — Connection refused [tcp://127.0.0.1:6390]
$ grep -n 'class StreamInitException' vendor/predis/predis/src/Connection/Resource/Exception/StreamInitException.php; grep -n 'class ConnectionException' vendor/predis/predis/src/Connection/ConnectionException.php
17:class StreamInitException extends PredisException
20:class ConnectionException extends CommunicationException
```

- node-redis: xato **ikki joyda** keldi — `error` hodisasida va `connect()` ning rad etilgan promise'ida. `error` tinglovchisi bo'lmaganda jarayon to'xtashi mumkin (RD).
- Predis: ulanish buyruq yuborilganda ochildi (ulanish dangasa — obyekt yaratilganda xato yo'q edi).
- Kuzatildi: Predis 3.7.1 da ulanish rad etilsa **`StreamInitException`** keladi va u `PredisException` dan meros oladi, **`ConnectionException` dan emas**. RD jadvalidagi `ConnectionException` bilan ushlanmadi — birinchi urinishda skript `PHP Fatal error: Uncaught … StreamInitException` bilan to'xtagan edi. Ishonchli yo'l — oxirida `PredisException` ni ham ushlash.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| node-redis'da `error` tinglovchisiz | Xato jarayonni to'xtatishi mumkin (RD) | `client.on('error', …)` |
| `await client.connect()` siz buyruq | Klient tayyor emas | Avval `connect()`, `isReady` |
| Predis'da faqat `ConnectionException` ni ushlash | 3.7.1 da ulanish rad etilsa `StreamInitException` (sinovda) | Oxirida `PredisException` |
| Raqam qaytib son bo'ladi deb kutish | Redis qiymati — satr (sinovda `"29"`) | Kerak bo'lsa o'zgartirish |
| `WRONGTYPE` ni qayta urinish bilan "davolash" | Tuzatib bo'lmaydigan xato (RD) | Kodni yoki tuzilmani tuzatish |
| Ulanishni yopmaslik (Node.js) | Jarayon tugamaydi | `client.close()` |

## Amaliyot

1. Node.js va PHP uchun qaysi klientlar ishlatildi, ular qanday o'rnatiladi?
2. node-redis'da `error` tinglovchisi nega majburiy?
3. Hash'dagi `age: 29` qanday ko'rinishda qaytdi va nega?
4. Ulanish rad etilganda node-redis xatoni qayerda bildirdi?
5. Sinovda Predis'da qanday kutilmagan narsa topildi?
6. `WRONGTYPE` xatosida qayta urinish kerakmi?

<details>
<summary>Javoblar</summary>

1. `node-redis` (`npm install redis`) va `Predis` (`composer require predis/predis`).
2. Tinglovchi bo'lmasa, xato tashlanib Node.js jarayoni to'xtashi mumkin.
3. Satr (`"29"`) — Redis qiymatlarni satr sifatida saqlaydi.
4. `error` hodisasida va `connect()` promise'ida.
5. Ulanish rad etilsa `StreamInitException` keladi, u `ConnectionException` bilan ushlanmaydi.
6. Yo'q — bu kod yoki ma'lumot xatosi.

</details>

## Rasmiy hujjat

- [RD: node-redis guide](https://redis.io/docs/latest/develop/clients/nodejs/) · [Connect](https://redis.io/docs/latest/develop/clients/nodejs/connect/) · [Error handling](https://redis.io/docs/latest/develop/clients/nodejs/error-handling/)
- [RD: Predis guide (PHP)](https://redis.io/docs/latest/develop/clients/php/) · [Connect](https://redis.io/docs/latest/develop/clients/php/connect/) · [Error handling](https://redis.io/docs/latest/develop/clients/php/error-handling/)
- [RD: Error handling](https://redis.io/docs/latest/develop/clients/error-handling/)

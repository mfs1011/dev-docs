# 14 — Pipeline va tranzaksiya

[Mundarija](README.md)

## Tushuncha

RD (Pipelines and transactions): Redis bir nechta buyruqni **birga**, to'plam qilib yuborishga imkon beradi. Ikki turi bor:

| | Nima beradi (RD) |
| --- | --- |
| **Pipeline** | Bir nechta buyruq bitta aloqada yuboriladi, server barcha javoblarni bitta aloqada qaytaradi — tarmoq va ishlov berish xarajati kamayadi |
| **Tranzaksiya** | Ichidagi barcha buyruqlar boshqa klientlar buyruqlari **aralashmasdan** oxirigacha bajariladi |

### Borib-kelish vaqti (RTT)

RD (Pipelining): Redis — so'rov/javob (request/response) protokolli TCP server. Odatda klient buyruq yuboradi va javobni **kutadi**, keyin keyingisini yuboradi. Paketning klientdan serverga borib, javob bilan qaytish vaqti — **RTT** (Round Trip Time). Misol: RTT 250 ms bo'lsa (Internet orqali sekin ulanish), server sekundiga 100 ming so'rovni bajara olsa ham, klient sekundiga ko'pi bilan **to'rtta** so'rov yubora oladi. Loopback'da (shu kompyuter ichida) RTT millisekunddan kam, lekin ko'p buyruqda u ham yig'iladi.

**Pipelining** — javoblarni kutmasdan bir nechta buyruq yuborib, javoblarni oxirida bir yo'la o'qish:

```text
pipeline'siz:  INCR → 1   INCR → 2   INCR → 3      (3 ta RTT)
pipeline bilan: INCR INCR INCR → 1 2 3             (1 ta RTT)
```

RD **muhim eslatmasi**: pipeline paytida server javoblarni **xotirada** navbatda saqlaydi. Juda ko'p buyruq bo'lsa, ularni o'rtacha hajmdagi bo'laklarga bo'lib yuborish kerak (masalan, 10 mingtadan).

### Tranzaksiya: `MULTI` / `EXEC`

RD (Transactions):

- `MULTI` — tranzaksiya boshlanadi; keyingi buyruqlar bajarilmaydi, **navbatga** qo'yiladi (`QUEUED`).
- `EXEC` — navbatdagilarning hammasi bajariladi; javob — har buyruq javobi, shu tartibda.
- `DISCARD` — navbat tashlanadi, hech narsa bajarilmaydi.

Xatolar ikki xil:

| Qachon | Misol | Natija (RD) |
| --- | --- | --- |
| Navbatga qo'yishda | Sintaksis xatosi (argumentlar soni noto'g'ri) | `EXEC` butun tranzaksiyani **rad etadi** (`EXECABORT`) |
| `EXEC` dan keyin | Buyruq noto'g'ri turdagi kalitga | Faqat shu buyruq xato; **qolganlari baribir bajariladi** |

RD: Redis tranzaksiyalarni **orqaga qaytarmaydi** (rollback yo'q) — bu Redis'ning soddaligi va tezligiga katta ta'sir qilardi.

### `WATCH` — optimistik qulf

RD: `WATCH` tranzaksiyaga "tekshir va o'rnat" (CAS — check-and-set) xatti-harakatini beradi. Kuzatilgan kalitlardan birortasi `EXEC` dan **oldin** o'zgarsa, butun tranzaksiya **bekor** bo'ladi va `EXEC` bo'sh (null) javob qaytaradi. Shunda yangilashni eng so'nggi qiymat bilan qaytadan boshlash kerak.

**Optimistik** (optimistic) — oldindan qulflamaydi, to'qnashuv bo'lsagina qayta urinadi.

### Klientlarda

| | node-redis (RD) | Predis (RD) |
| --- | --- | --- |
| Pipeline | Bir "tick" ichidagi buyruqlar o'zi pipeline bo'ladi — `Promise.all([...])`; yoki `multi()…execAsPipeline()` | `pipeline()` … `execute()`, yoki `pipeline(function ($pipe) {...})` |
| Tranzaksiya | `multi()…exec()` | `transaction(function (MultiExec $tx) {...})` — `MULTI`/`EXEC` ni o'zi qo'shadi |
| WATCH | `client.watch(kalit)`; o'zgargan bo'lsa — `WatchError` | `['cas' => true, 'watch' => kalit, 'retry' => N]` — o'zgargan bo'lsa N martagacha o'zi qayta uradi |

RD (node-redis): ulanish uzilsa, `Promise.all()` pipeline'i qayta ulangach qolgan joyidan davom etadi, `multi()` pipeline'i esa bajarilmagan buyruqlarni tashlab yuboradi. Bir ulanishni ko'p so'rov baham ko'radigan joyda (veb-server) `WATCH` uchun **ulanishlar hovuzi** (`createClientPool`) kerak: server `WATCH` holatini **ulanish bo'yicha** kuzatadi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, Node.js 26.13.0, PHP 8.5.4). `redis-cli` ga buyruqlar bitta ulanishda (stdin orqali) beriladi.

### `MULTI` / `EXEC`

```text vps
$ printf 'MULTI\nINCR foo\nINCR bar\nEXEC\n' | redis-cli
OK
QUEUED
QUEUED
1
1
```

Ikkala `INCR` navbatga qo'yildi va `EXEC` da birga bajarildi.

### `EXEC` dan keyingi xato — qolganlari bajariladi

```text vps
$ printf 'MULTI\nSET a abc\nLPOP a\nEXEC\nGET a\n' | redis-cli
OK
QUEUED
QUEUED
OK
WRONGTYPE Operation against a key holding the wrong kind of value

abc
```

`SET a abc` bajarildi (`OK`), `LPOP a` — `WRONGTYPE`. Tranzaksiya orqaga qaytmadi: `a` = `abc`.

### Navbatga qo'yishdagi xato — hammasi rad etiladi

```text vps
$ printf 'MULTI\nINCR a b c\nSET b 1\nEXEC\nEXISTS b\n' | redis-cli
OK
ERR wrong number of arguments for 'incr' command

QUEUED
EXECABORT Transaction discarded because of previous errors.

0
$ redis-cli DEL foo bar a b
3
```

Noto'g'ri `INCR` navbatga qo'yilmadi; `EXEC` — `EXECABORT`, `SET b 1` ham bajarilmadi (`EXISTS b` → 0).

### Pipeline: 10 000 ta `INCR`

Node.js:

```js
// 10 000 ta INCR: har birini kutib va bitta pipeline'da (Promise.all)
import { createClient } from 'redis';
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();
const N = 10000;

await client.del('hisob');
let t = performance.now();
for (let i = 0; i < N; i++) await client.incr('hisob');
console.log(`ketma-ket await: ${(performance.now() - t).toFixed(0)} ms, hisob = ${await client.get('hisob')}`);

await client.del('hisob');
t = performance.now();
await Promise.all(Array.from({ length: N }, () => client.incr('hisob')));
console.log(`Promise.all:     ${(performance.now() - t).toFixed(0)} ms, hisob = ${await client.get('hisob')}`);

// RD: multi() ... execAsPipeline()
const r = await client.multi().set('seat:3', '#3').set('seat:4', '#4').get('seat:3').execAsPipeline();
console.log('execAsPipeline:', r);
await client.del(['hisob', 'seat:3', 'seat:4']);
await client.close();
```

PHP:

```php
<?php
// 10 000 ta INCR: har birini alohida va bitta pipeline'da
require 'vendor/autoload.php';
$r = new Predis\Client();
$N = 10000;

$r->del('hisob');
$t = microtime(true);
for ($i = 0; $i < $N; $i++) $r->incr('hisob');
printf("alohida:  %d ms, hisob = %s\n", (microtime(true) - $t) * 1000, $r->get('hisob'));

$r->del('hisob');
$t = microtime(true);
$r->pipeline(function ($pipe) use ($N) {
    for ($i = 0; $i < $N; $i++) $pipe->incr('hisob');
});
printf("pipeline: %d ms, hisob = %s\n", (microtime(true) - $t) * 1000, $r->get('hisob'));
$r->del('hisob');
```

```text vps
$ node pipeline.js
ketma-ket await: 1194 ms, hisob = 10000
Promise.all:     489 ms, hisob = 10000
execAsPipeline: [ 'OK', 'OK', '#3' ]
$ php pipeline.php
alohida:  466 ms, hisob = 10000
pipeline: 49 ms, hisob = 10000
```

- Natija bir xil (10 000), vaqt farq qiladi: PHP — 466 ms dan **49 ms** ga (9 marta), Node.js — 1194 ms dan **489 ms** ga.
- Bu — **loopback**'da (Redis shu serverda). Tarmoq orqali RTT kattaroq, farq ham kattaroq bo'ladi (RD).
- Kuzatildi: Node.js'da yutuq kichikroq — `Promise.all` uchun 10 000 ta promise yaratiladi. Vaqtlar har ishga tushirishda biroz farq qiladi.

### `WATCH`: boshqa klient aralashdi

Node.js — ikki klient: `a` kalitni kuzatadi, `b` uni `EXEC` dan oldin o'zgartiradi:

```js
// WATCH: kuzatilgan kalitni boshqa klient o'zgartirsa, EXEC bekor bo'ladi
import { createClient, WatchError } from 'redis';
const a = createClient(); const b = createClient();
for (const c of [a, b]) { c.on('error', e => console.log(e)); await c.connect(); }

await a.set('shellpath', '/usr/syscmds/');
await a.watch('shellpath');
const joriy = await a.get('shellpath');

await b.set('shellpath', '/boshqa/');            // boshqa klient aralashdi

try {
    await a.multi().set('shellpath', joriy + ':/usr/mycmds/').exec();
} catch (err) {
    console.log(err instanceof WatchError ? 'WatchError — tranzaksiya bekor bo\'ldi' : err);
}
console.log('shellpath:', await a.get('shellpath'));
await a.del('shellpath');
await a.close(); await b.close();
```

PHP — RD'dagi `cas`/`watch`/`retry` namunasi; birinchi urinishda boshqa klient aralashadi:

```php
<?php
// RD: cas + watch + retry; birinchi urinishda boshqa klient aralashadi
require 'vendor/autoload.php';
use Predis\Transaction\MultiExec;
$r = new Predis\Client(); $boshqa = new Predis\Client();

$r->set('shellpath', '/usr/syscmds/');
$urinish = 0;
$r->transaction(
    ['cas' => true, 'watch' => 'shellpath', 'retry' => 3],
    function (MultiExec $tx) use (&$urinish, $boshqa) {
        $urinish++;
        $path = $tx->get('shellpath');
        if ($urinish === 1) $boshqa->set('shellpath', '/boshqa/');   // aralashuv
        $tx->multi();
        $tx->set('shellpath', $path . ':/usr/mycmds/');
    }
);
echo "urinishlar: $urinish", PHP_EOL;
echo $r->get('shellpath'), PHP_EOL;
$r->del('shellpath');
```

```text vps
$ node watch.js
WatchError — tranzaksiya bekor bo'ldi
shellpath: /boshqa/
$ php watch.php
urinishlar: 2
/boshqa/:/usr/mycmds/
```

- Node.js: `EXEC` bekor bo'ldi (`WatchError`), qiymat — boshqa klient yozgani (`/boshqa/`). Qayta urinish — dastur zimmasida.
- PHP: Predis birinchi urinish bekor bo'lganini ko'rib, **ikkinchi** marta urindi va yangi qiymat ustiga qo'shdi (`/boshqa/:/usr/mycmds/`) — hech bir yangilanish yo'qolmadi.

## Variantlar

| Usul | Qachon | Kafolat |
| --- | --- | --- |
| Pipeline | Ko'p mustaqil buyruq (yuklash, ko'p o'qish) | Tezlik; boshqa klient buyruqlari orasiga kirishi mumkin |
| `MULTI`/`EXEC` | Bir nechta yozuv birga, aralashmasdan | Izolyatsiya; rollback yo'q |
| `WATCH` + `MULTI`/`EXEC` | O'qib, hisoblab, yozish | To'qnashuvda bekor — qayta urinish |
| Lua / Functions (15-bob) | Murakkab shartli mantiq server ichida | Atomik |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Tranzaksiya xatoda orqaga qaytadi deb o'ylash | Rollback yo'q, qolganlari bajariladi (RD, sinovda) | Buyruqlarni oldindan tekshirish |
| Pipeline'ga cheksiz buyruq | Server javoblarni xotirada saqlaydi (RD) | Bo'laklarga bo'lish |
| Ko'p buyruqni bittadan `await` qilish | Har biri — alohida RTT (sinovda 9 marta sekin) | Pipeline |
| `WatchError` dan keyin qayta urinmaslik | Yangilanish yo'qoladi | Siklda qayta urinish (Predis — `retry`) |
| Umumiy ulanishda `WATCH` (Node.js) | `WATCH` ulanish bo'yicha — so'rovlar aralashadi (RD) | `createClientPool` |

## Amaliyot

1. Pipeline nimani tejaydi?
2. RTT 250 ms bo'lsa, pipeline'siz klient sekundiga nechta so'rov yubora oladi?
3. `EXEC` dan keyin bitta buyruq xato bersa, qolganlari bilan nima bo'ladi?
4. Navbatga qo'yishda sintaksis xatosi bo'lsa-chi?
5. `WATCH` qilingan kalit o'zgarsa nima bo'ladi?
6. Sinovda Node.js va PHP'da `WATCH` to'qnashuvi qanday tugadi?

<details>
<summary>Javoblar</summary>

1. Har buyruq uchun alohida borib-kelishni (RTT).
2. Ko'pi bilan to'rtta.
3. Bajariladi — rollback yo'q.
4. `EXEC` butun tranzaksiyani rad etadi (`EXECABORT`).
5. `EXEC` bekor bo'ladi (null javob).
6. Node.js — `WatchError`, qiymat boshqa klientniki; PHP — Predis o'zi qayta urinib, yangi qiymat ustiga yozdi.

</details>

## Rasmiy hujjat

- [RD: Pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
- [RD: Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [RD: Pipelines and transactions (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/transpipe/) · [(PHP)](https://redis.io/docs/latest/develop/clients/php/transpipe/)

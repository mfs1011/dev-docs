# 16 — Production'da klient

[Mundarija](README.md)

## Tushuncha

Ishlab chiqishda Redis doim yonida turadi. Production'da esa tarmoq uziladi, Redis qayta ishga tushadi, server javob bermay qoladi. Klient bunga tayyor bo'lishi kerak: **qancha kutadi**, **qayta ulanadimi**, ulanish yo'qligida yuborilgan **buyruqlar bilan nima bo'ladi**.

### node-redis (RD: Production usage)

| Tavsiya | Nima (RD) |
| --- | --- |
| Xatolarni ushlash | `error` hodisasiga tinglovchi — majburiy (13-bob) |
| Qayta ulanish | Socket kutilmaganda yopilsa (`close()`/`destroy()` siz), klient ulanishni **o'zi tiklaydi**; standart — eksponensial kutish (exponential backoff), `reconnectStrategy` bilan o'zgartiriladi |
| Ulanish timeout'i | `socket.connectTimeout` — standart **5 soniya** |
| Buyruqlar ishonchliligi | Ulanish yo'qligida yuborilgan buyruqlar **navbatga** qo'yiladi va ulanish tiklangach yuboriladi. Idempotent bo'lmagan (qayta bajarilsa natija o'zgaradigan, masalan `INCR`) buyruq ulanish uzilgan paytda bajarilayotgan bo'lsa, u ikki marta bajarilishi mumkin. Buning oldini olish — `disableOfflineQueue: true`: bajarilmagan buyruqlar navbatga qo'yilmay, rad etiladi |

node-redis rasmiy hujjati (command-options): v6 dan buyruq timeout'i — `commandOptions.timeout`, standarti **5000 ms**; bekor qilish — `client.withAbortSignal(signal)`. Ikkalasi ham faqat **hali socket'ga yozilmagan** buyruqlarga ta'sir qiladi. Kuzatildi: RD sahifasidagi `commandOptions({ signal })` misoli 6.3.1 da ishlamaydi — `commandOptions` eksport qilinmagan (`SyntaxError: Named export 'commandOptions' not found`).

### Predis

RD'da Predis uchun alohida "Production usage" sahifasi yo'q. Predis rasmiy hujjatidan (README):

| Narsa | Nima |
| --- | --- |
| Ulanish | Birinchi buyruqda ochiladi; `connect()` timeout'i standart **5 soniya** |
| Qayta urinish | Standartda **o'chiq**; `retry` parametri bilan yoqiladi: `new Retry(new ExponentialBackoff(asos, chegara), urinishlar)` (mikrosekundda). Ulanish, timeout va socket ochish xatolarida qayta uriniladi |
| Doimiy ulanish | `'persistent' => true` — PHP-FPM jarayonida ulanish skriptlar orasida qayta ishlatiladi (har so'rovda yangi TCP ulanish va qo'l siqishuv yo'q) |

RD (Error handling, PHP): vaqtinchalik aloqa xatolarida (`CommunicationException`) — kutib, qayta urinish (backoff).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, node-redis 6.3.1, Predis 3.7.1). "Redis o'chdi" holatini haqiqiy Redis'ga tegmasdan taqlid qilish uchun Node.js misollari kichik TCP proksi orqali ulanadi — proksini yopib-ochish ulanishni uzadi:

```js
// Sinov uchun TCP proksi: 127.0.0.1:6391 → Redis 6379; yopib-ochib "Redis o'chdi"ni taqlid qiladi
import net from 'node:net';
let server, ulanishlar = new Set();
export function och() {
    return new Promise(r => {
        server = net.createServer(s => {
            const r2 = net.connect(6379, '127.0.0.1');
            s.pipe(r2).pipe(s); ulanishlar.add(s); ulanishlar.add(r2);
            const yop = () => { s.destroy(); r2.destroy(); };
            s.on('error', yop); r2.on('error', yop); s.on('close', yop); r2.on('close', yop);
        }).listen(6391, '127.0.0.1', r);
    });
}
export function yop() {
    return new Promise(r => { for (const s of ulanishlar) s.destroy(); ulanishlar.clear(); server.close(r); });
}
```

### Ulanish timeout'i

Javob bermaydigan manzil (`10.255.255.1`):

```js
// connectTimeout: javob bermaydigan manzil (10.255.255.1), qayta urinishsiz
import { createClient } from 'redis';
const client = createClient({
    url: 'redis://10.255.255.1:6379',
    socket: { connectTimeout: 1000, reconnectStrategy: false }
});
client.on('error', err => {});
const t = performance.now();
try { await client.connect(); }
catch (err) { console.log(`${err.constructor.name} — ${((performance.now() - t) / 1000).toFixed(1)} s`); }
```

```php
<?php
// Predis: connect() ning standart timeout'i — 5 soniya (Predis README)
require 'vendor/autoload.php';
use Predis\PredisException;
$r = new Predis\Client(['host' => '10.255.255.1']);
$t = microtime(true);
try { $r->ping(); }
catch (PredisException $e) { printf("%s — %.1f s\n", (new ReflectionClass($e))->getShortName(), microtime(true) - $t); }
```

```text vps
$ node timeout.js
ConnectionTimeoutError — 1.0 s
$ php timeout.php
StreamInitException — 5.0 s
```

node-redis — 1 soniyada `ConnectionTimeoutError`; Predis — standart **5 soniya** kutdi. Har bir so'rov uchun 5 soniya — foydalanuvchi uchun juda uzoq; production'da timeout'ni ataylab tanlash kerak.

### Redis 2 soniyaga "o'chdi" (node-redis)

```js
// Redis 2 soniyaga "o'chadi": avtomatik qayta ulanish va offline navbat
import { createClient } from 'redis';
import { och, yop } from './proksi.js';
const kut = ms => new Promise(r => setTimeout(r, ms));
await och();

for (const disableOfflineQueue of [false, true]) {
    console.log(`disableOfflineQueue: ${disableOfflineQueue}`);
    const c = createClient({ url: 'redis://127.0.0.1:6391', disableOfflineQueue,
                             socket: { reconnectStrategy: () => 500 } });
    let xatolar = 0;
    c.on('error', () => xatolar++);
    c.on('ready', () => console.log('  ready'));
    await c.connect(); await c.del('hisob');

    await yop(); await kut(100);                       // Redis "o'chdi"
    console.log('  isReady:', c.isReady);
    const t = performance.now();
    const p = c.incr('hisob').then(
        v => console.log(`  INCR natijasi: ${v} (${((performance.now() - t) / 1000).toFixed(1)} s)`),
        e => console.log(`  INCR xatosi: ${e.constructor.name} — ${e.message} (${((performance.now() - t) / 1000).toFixed(1)} s)`));
    setTimeout(och, 2000);                             // 2 s dan keyin "qaytdi"
    await p; await kut(2500);
    console.log('  error hodisalari:', xatolar);
    await c.close();
}
await yop();
```

```text vps
$ node qayta.js
disableOfflineQueue: false
  ready
  isReady: false
  INCR natijasi: 1 (2.4 s)
  ready
  error hodisalari: 6
disableOfflineQueue: true
  ready
  isReady: false
  INCR xatosi: ClientOfflineError — The client is offline (0.0 s)
  ready
  error hodisalari: 6
```

- Standart holatda: ulanish yo'q (`isReady: false`), lekin `INCR` **navbatda kutdi** va Redis qaytgach bajarildi (2.4 s). Klient o'zi qayta ulandi (`ready`); oraliqda `error` hodisalari — har muvaffaqiyatsiz urinishda.
- `disableOfflineQueue: true` — `INCR` darhol rad etildi (`ClientOfflineError`). Dastur nima qilishni o'zi hal qiladi — ikki marta bajarilish xavfi yo'q.

### Buyruq timeout'i va abort (node-redis)

```js
// Buyruq timeout'i va abort — faqat hali socket'ga yozilmagan buyruqlarga (node-redis: command-options)
import { createClient } from 'redis';
import { och, yop } from './proksi.js';
const kut = ms => new Promise(r => setTimeout(r, ms));
await och();
const c = createClient({ url: 'redis://127.0.0.1:6391', commandOptions: { timeout: 1000 },
                         socket: { reconnectStrategy: () => 500 } });
c.on('error', () => {});
await c.connect();
const vaqt = async (nom, f) => {
    const t = performance.now();
    try { console.log(`${nom} → ${await f()}`); }
    catch (err) { console.log(`${nom} → ${err.constructor.name}: ${err.message}`); }
    console.log(`    ${((performance.now() - t) / 1000).toFixed(1)} s`);
};
// 1) Ulanish bor: BLPOP 3 soniya kutadi — yozilib bo'lgan buyruqni timeout to'xtatmaydi
await vaqt('BLPOP 3 s, timeout 1000 ms', () => c.blPop('bosh-navbat', 3));
// 2) Redis "o'chgan": buyruq navbatda turibdi — timeout ishlaydi
await yop(); await kut(100);
await vaqt('GET offline, timeout 1000 ms', () => c.get('kalit'));
// 3) withAbortSignal: 0.3 s da abort
const ac = new AbortController(); setTimeout(() => ac.abort(), 300);
await vaqt('GET offline, abort 300 ms', () => c.withAbortSignal(ac.signal).get('kalit'));
await och(); await kut(1500);
await c.close(); await yop();
```

```text vps
$ node abort.js
BLPOP 3 s, timeout 1000 ms → null
    3.1 s
GET offline, timeout 1000 ms → TimeoutError: 
    1.0 s
GET offline, abort 300 ms → AbortError: The command was aborted
    0.3 s
```

- `BLPOP 3` socket'ga **yozilib bo'lgan** — `timeout: 1000` uni to'xtatmadi, 3 soniyadan keyin `null` qaytdi.
- Ulanish yo'qligida navbatdagi `GET` — 1 soniyada `TimeoutError`; `withAbortSignal` — 0.3 soniyada `AbortError`.
- Demak timeout — "Redis ulanmagan, kutib o'tirma" uchun; sekin buyruqni (blokirovka qiladigan) to'xtatish uchun emas.

### Predis: qayta urinish

```php
<?php
// Predis 3: avtomatik qayta urinish standartda o'chiq; retry bilan yoqiladi (Predis README)
require 'vendor/autoload.php';
use Predis\PredisException;
use Predis\Retry\Retry;
use Predis\Retry\Strategy\ExponentialBackoff;

foreach ([null, new Retry(new ExponentialBackoff(100000, 1000000), 3)] as $retry) {
    $p = ['port' => 6390];
    if ($retry) $p['retry'] = $retry;          // asos 0.1 s, chegara 1 s, 3 marta
    $r = new Predis\Client($p);
    $t = microtime(true);
    try { $r->ping(); }
    catch (PredisException $e) {
        printf("%s: %s — %.2f s\n", $retry ? 'retry bilan' : 'retry siz', (new ReflectionClass($e))->getShortName(), microtime(true) - $t);
    }
}
```

```text vps
$ php retry.php
retry siz: StreamInitException — 0.00 s
retry bilan: StreamInitException — 0.70 s
```

`retry` siz — darhol xato; `retry` bilan (3 marta, eksponensial kutish) — 0.70 soniya urinib, keyin xato.

Ulanish server tomonidan uzilsa (`CLIENT KILL`):

```php
<?php
// Ulanish server tomonidan uzilsa, keyingi buyruq nima bo'ladi
require 'vendor/autoload.php';
use Predis\PredisException;
$admin = new Predis\Client();
foreach ([false, true] as $retryBor) {
    $p = $retryBor ? ['retry' => new Predis\Retry\Retry(new Predis\Retry\Strategy\ExponentialBackoff(100000, 1000000), 3)] : [];
    $r = new Predis\Client($p);
    $id = $r->client('ID');
    $admin->executeRaw(['CLIENT', 'KILL', 'ID', (string)$id]);
    try { printf("%s: INCR natijasi %d\n", $retryBor ? 'retry bilan' : 'retry siz', $r->incr('hisob')); }
    catch (PredisException $e) { printf("%s: %s — %s\n", $retryBor ? 'retry bilan' : 'retry siz', (new ReflectionClass($e))->getShortName(), $e->getMessage()); }
}
$admin->del('hisob');
```

```text vps
$ php uzildi.php
retry siz: ConnectionException — Stream is already at the end [tcp://127.0.0.1:6379]
retry bilan: INCR natijasi 1
```

- `retry` siz: keyingi buyruq — `ConnectionException` (`Stream is already at the end`).
- `retry` bilan: Predis qayta ulandi va `INCR` bajarildi.
- Diqqat: bu yerda ham `INCR` idempotent emas — uzilish buyruq bajarilayotgan paytda bo'lsa, qayta urinish uni ikki marta bajarishi mumkin (RD, node-redis bo'limidagi kabi).

## Variantlar

| Holat | node-redis | Predis |
| --- | --- | --- |
| Ulanish timeout'i | `socket.connectTimeout` (5 s) | standart 5 s |
| Qayta ulanish | Standartda yoqiq, `reconnectStrategy` | `retry` bilan |
| Ulanishsiz yuborilgan buyruq | Navbatda kutadi; `disableOfflineQueue` | Darhol xato yoki `retry` |
| Buyruq timeout'i | `commandOptions.timeout` (5000 ms), `withAbortSignal` | — |
| Har so'rovda yangi ulanish | Bitta klient (yoki hovuz) | `persistent` (PHP-FPM) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Timeout'ni standartda qoldirish | So'rov 5 s osilib qoladi (sinovda Predis) | Ilovaga mos qiymat |
| `INCR`/to'lov kabi buyruqlar uchun offline navbat | Ikki marta bajarilishi mumkin (RD) | `disableOfflineQueue` yoki idempotent dizayn |
| `commandOptions.timeout` blokirovka qiladigan buyruqni to'xtatadi deb kutish | Faqat yozilmaganlarga (sinovda `BLPOP` 3.1 s) | Buyruqning o'z timeout'i (`BLPOP … 3`) |
| Predis'da `retry` siz production | Birinchi uzilishda xato (sinovda) | `retry` + backoff |
| RD'dagi `commandOptions({ signal })` ni ko'chirish | 6.3.1 da yo'q (sinovda) | `withAbortSignal` |

## Amaliyot

1. node-redis ulanish uzilganda nima qiladi?
2. Offline navbat qanday xavf tug'diradi va undan qanday saqlanish mumkin?
3. Sinovda `BLPOP` nega `timeout: 1000` ga qaramay 3 soniya kutdi?
4. Predis'da qayta urinish standartda yoqiqmi?
5. Predis'ning `connect()` timeout'i standart qancha va sinovda nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. O'zi qayta ulanadi (eksponensial kutish), buyruqlarni navbatda saqlaydi.
2. Idempotent bo'lmagan buyruq ikki marta bajarilishi mumkin; `disableOfflineQueue: true`.
3. Buyruq allaqachon socket'ga yozilgan edi — timeout faqat yozilmaganlarga.
4. Yo'q — `retry` parametri bilan yoqiladi.
5. 5 soniya; javob bermaydigan manzilda 5.0 s kutib xato berdi.

</details>

## Rasmiy hujjat

- [RD: Production usage (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/produsage/) · [Connect (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/connect/)
- [node-redis: Command options](https://github.com/redis/node-redis/blob/master/docs/command-options.md)
- [RD: Error handling (PHP)](https://redis.io/docs/latest/develop/clients/php/error-handling/) · [Predis README](https://github.com/predis/predis/blob/v3.7.1/README.md)

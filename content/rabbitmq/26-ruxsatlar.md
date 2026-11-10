# 26 — Foydalanuvchilar va ruxsatlar

[Mundarija](README.md)

## Tushuncha

RQ (Access Control): har ulanishning **autentifikatsiyadan o'tgan** (kimligi tasdiqlangan) foydalanuvchisi bor. Ulanishda u **hisob ma'lumotlarini** (credentials — login-parol, JWT token yoki x.509 sertifikat) va **vhost**'ni beradi. Foydalanuvchida shu vhost'da ruxsat bo'lishi kerak.

### Standart foydalanuvchi (RQ)

Bo'sh tugun birinchi ishga tushganda `/` vhost'ini va `guest` foydalanuvchisini (paroli `guest`, `/` da to'liq ruxsat) yaratadi.

- `guest` standartda **faqat loopback** (`localhost`) orqali ulana oladi — har qanday protokolda. Boshqa foydalanuvchilarda bunday cheklov yo'q.
- Production'da `guest` ishlatilmasin: yangi foydalanuvchi **generatsiya qilingan** login-parol bilan yaratilsin; `guest` o'chirilsin yoki hech bo'lmasa paroli o'zgartirilsin (RQ: "highly recommended").

### Ikki daraja tekshiruv (RQ: Authorisation)

1. **Ulanishda**: foydalanuvchida vhost'ga biror ruxsat bormi — yo'q bo'lsa, ulanish rad etiladi (25-bob).
2. **Amalda**: har obyekt (exchange, navbat) ustidagi amal uchun ruxsat.

Ruxsat — vhost bo'yicha **uchta regex** (muntazam ifoda):

| Ruxsat | Nima | AMQP 0-9-1 misollari (RQ jadvali) |
| --- | --- | --- |
| `configure` | Obyektni yaratish, o'chirish, xatti-harakatini o'zgartirish | `exchange.declare`, `queue.declare`, `queue.delete` — o'sha obyektga |
| `write` | Obyektga xabar kiritish | `basic.publish` — **exchange**'ga; `queue.bind` — **navbat**ga |
| `read` | Obyektdan xabar olish | `basic.get`, `basic.consume`, `queue.purge` — navbatga; `queue.bind` — **exchange**'ga |

Foydalanuvchiga nomi regex'ga mos keladigan barcha obyektlarda shu ruxsat beriladi. `'^$'` (faqat bo'sh satr) — hech qanday amalga ruxsat yo'q. RQ: 4.3.1 dan passiv e'lon (`passive: true` — obyekt borligini tekshirish) uchun **istalgan bitta** ruxsat yetarli.

### Teglar (RQ)

Ruxsatlardan tashqari foydalanuvchida **teglar** bo'ladi. Hozircha ular faqat boshqaruv UI'siga kirishni boshqaradi (`administrator`, `monitoring` va h.k.; 4-bob). Yangi foydalanuvchida teg yo'q.

### Parollar (RQ: Credentials and Passwords)

- Ichki backend parolni **tuz** (salt) bilan aralashtirib **xeshlaydi**; standart — SHA-256 (`password_hashing_module` bilan SHA-512).
- Buyruq qatorida parol berilsa, shell `!`, `?`, `&`, `*`, `'`, `"` kabi belgilarni o'zicha talqin qiladi. Eng xavfsiz tanlov — uzun (40–100 belgi) harf-raqamli parol.
- **Parol tekshiruvchi** (credential validator) faqat yangi foydalanuvchi qo'shilganda yoki parol o'zgarganda ishlaydi. Standart — `accept_everything` (hamma narsani qabul qiladi). Boshqa variantlar — `min_password_length` va `password_regexp`, `rabbitmq.conf` da yoqiladi.

### Kirishni bekor qilish (RQ: Revoking User Access)

- Tavsiya — foydalanuvchini **o'chirish**: uning barcha ochiq ulanishlari yopiladi.
- Ruxsatni olib tashlash ochiq ulanishlarga **darhol** ta'sir qilmaydi: ulanishlar avtorizatsiya keshidan foydalanadi, amallar "oxir-oqibat" rad etiladi.
- Parolni almashtirish: `change_password`, so'ng `close_all_user_connections`; ilovalar yangi parol bilan qayta ulanadi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### `guest` — tashqi manzil orqali

```js
// guest — server tashqi manzili orqali (loopback emas)
const amqp = require('amqplib');
const ip = process.argv[2];
amqp.connect(`amqp://guest:guest@${ip}/`).then(c => { console.log('guest ulandi'); return c.close(); })
  .catch(e => console.log('guest:', e.message.slice(0, 120)));
```

```text vps
$ rabbitmqctl -q list_users
user	tags
guest	[administrator]
$ cd /root/rabbit-ilova && node guest.js $(hostname -I | awk '{print $1}') | sed 's/[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+/IP/g'; sleep 1; grep -h "guest' can only connect via localhost" /var/log/rabbitmq/rabbit@lab.log | tail -1 | grep -oE '\[error\].*' | sed 's/<[0-9.]*>/<…>/'
guest: Handshake terminated by server: 403 (ACCESS-REFUSED) with message "ACCESS_REFUSED - Login was refused using authenticati
[error] <…> PLAIN login refused: user 'guest' can only connect via localhost
```

Server o'zining tashqi manziliga ulandi — bu loopback emas. `403 ACCESS_REFUSED`, jurnalda — RQ'dagi aynan o'sha xabar.

### Ilova foydalanuvchisi

Parol generatsiya qilinadi va faqat `0600` huquqli faylda saqlanadi — ekranga chiqmaydi:

```text vps
$ umask 077; openssl rand -hex 24 > /root/rabbit-buyurtma-parol; ls -l /root/rabbit-buyurtma-parol | awk '{print $1, $9}'; wc -c < /root/rabbit-buyurtma-parol
-rw------- /root/rabbit-buyurtma-parol
49
$ rabbitmqctl add_user buyurtma "$(cat /root/rabbit-buyurtma-parol)" | sed 's/"[0-9a-f]\{48\}"/"…"/'
Adding user "buyurtma" ...
Done. Don't forget to grant the user permissions to some virtual hosts! See 'rabbitmqctl help set_permissions' to learn more.
$ rabbitmqctl -q set_permissions -p / buyurtma "^buyurtma-.*" "^buyurtma-.*" "^buyurtma-.*"; rabbitmqctl -q list_user_permissions buyurtma
vhost	configure	write	read
/	^buyurtma-.*	^buyurtma-.*	^buyurtma-.*
```

Foydalanuvchi faqat `buyurtma-` bilan boshlanadigan obyektlar bilan ishlaydi. Sinov skripti:

```js
// Ruxsatlar: buyurtma foydalanuvchisi faqat "buyurtma-" bilan boshlanadigan obyektlar bilan ishlaydi
const amqp = require('amqplib');
const fs = require('fs');
const parol = fs.readFileSync('/root/rabbit-buyurtma-parol', 'utf8').trim();
const url = `amqp://buyurtma:${parol}@localhost/`;
async function urin(nom, f) {
  const c = await amqp.connect(url); c.on('error', () => {});
  const ch = await c.createChannel(); ch.on('error', () => {});
  try { console.log(`${nom}: ${await f(ch)}`); }
  catch (e) { console.log(`${nom}: ${e.message.match(/\d{3} \([A-Z_-]+\)/)?.[0] ?? e.message}`); }
  await c.close().catch(() => {});
}
async function main() {
  await urin("navbat 'buyurtma-ish' e'lon (configure)", ch => ch.assertQueue('buyurtma-ish').then(r => 'OK'));
  await urin("navbat 'tolov-ish' e'lon (configure)", ch => ch.assertQueue('tolov-ish').then(r => 'OK'));
  await urin("exchange 'buyurtma-x' e'lon", ch => ch.assertExchange('buyurtma-x', 'direct').then(() => 'OK'));
  await urin("bind buyurtma-ish <- buyurtma-x", ch => ch.bindQueue('buyurtma-ish', 'buyurtma-x', 'k').then(() => 'OK'));
  await urin("publish buyurtma-x (write)", async ch => { ch.publish('buyurtma-x', 'k', Buffer.from('1')); await ch.assertQueue('buyurtma-ish'); return 'OK'; });
  await urin("publish standart exchange (write amq.default)", async ch => { ch.publish('', 'buyurtma-ish', Buffer.from('2')); await ch.assertQueue('buyurtma-ish'); return 'OK'; });
  await urin("get buyurtma-ish (read)", ch => ch.get('buyurtma-ish', { noAck: true }).then(m => m ? `xabar "${m.content}"` : "bo'sh"));
  await urin("purge 'hello' (read)", ch => ch.purgeQueue('hello').then(() => 'OK'));
  await urin("delete buyurtma-ish, buyurtma-x", async ch => { await ch.deleteQueue('buyurtma-ish'); await ch.deleteExchange('buyurtma-x'); return 'OK'; });
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node rux.js
navbat 'buyurtma-ish' e'lon (configure): OK
navbat 'tolov-ish' e'lon (configure): 403 (ACCESS-REFUSED)
exchange 'buyurtma-x' e'lon: OK
bind buyurtma-ish <- buyurtma-x: OK
publish buyurtma-x (write): OK
publish standart exchange (write amq.default): 403 (ACCESS-REFUSED)
get buyurtma-ish (read): xabar "1"
purge 'hello' (read): 403 (ACCESS-REFUSED)
delete buyurtma-ish, buyurtma-x: OK
```

- `buyurtma-ish` e'lon qilindi, `tolov-ish` — `403`: `configure` regex'iga mos emas.
- `buyurtma-x` ga yuborish — OK, lekin **standart exchange**'ga (nomi bo'sh, `routing key` — navbat nomi) yuborish — `403`. Sabab: `basic.publish` exchange'ga `write` talab qiladi, RQ: ruxsat tekshiruvida standart exchange'ning bo'sh nomi `amq.default` deb olinadi (standart exchange — 6-bob).
- Boshqa navbatni (`hello`) tozalash — `403`: `read` ruxsati yo'q.

Standart exchange'ga ham yozishga ruxsat:

```text vps
$ rabbitmqctl -q set_permissions -p / buyurtma "^buyurtma-.*" "^(amq\.default|buyurtma-.*)$" "^buyurtma-.*"; rabbitmqctl -q list_user_permissions buyurtma
vhost	configure	write	read
/	^buyurtma-.*	^(amq\.default|buyurtma-.*)$	^buyurtma-.*
$ cd /root/rabbit-ilova && node rux.js
navbat 'buyurtma-ish' e'lon (configure): OK
navbat 'tolov-ish' e'lon (configure): 403 (ACCESS-REFUSED)
exchange 'buyurtma-x' e'lon: OK
bind buyurtma-ish <- buyurtma-x: OK
publish buyurtma-x (write): OK
publish standart exchange (write amq.default): OK
get buyurtma-ish (read): xabar "1"
purge 'hello' (read): 403 (ACCESS-REFUSED)
delete buyurtma-ish, buyurtma-x: OK
```

Endi standart exchange orqali yuborish ham OK.

### Teg va parol

```text vps
$ rabbitmqctl -q set_user_tags buyurtma monitoring; rabbitmqctl -q list_users | grep -E '^user|buyurtma'
user	tags
buyurtma	[monitoring]
$ rabbitmqctl -q change_password buyurtma qisqa 2>&1 | tail -1; rabbitmqctl -q authenticate_user buyurtma qisqa 2>&1 | tail -1
Success
$ umask 077; openssl rand -hex 24 > /root/rabbit-buyurtma-parol; rabbitmqctl -q change_password buyurtma "$(cat /root/rabbit-buyurtma-parol)"; rabbitmqctl -q authenticate_user buyurtma "$(cat /root/rabbit-buyurtma-parol)" | tail -1
Success
```

- `monitoring` tegi qo'shildi.
- `qisqa` paroli ham qabul qilindi — standart tekshiruvchi `accept_everything`. Parol yana generatsiya qilinganiga almashtirildi.

### Ruxsatni olish va foydalanuvchini o'chirish

Ochiq ulanish har soniyada `checkQueue` (passiv e'lon) bajaradi:

```js
// Ochiq ulanish: foydalanuvchi o'chirilganda yoki ruxsati olinganda nima bo'ladi
const amqp = require('amqplib'); const fs = require('fs');
const parol = fs.readFileSync('/root/rabbit-buyurtma-parol', 'utf8').trim();
const t = () => new Date().toTimeString().slice(0, 8);
(async () => {
  const c = await amqp.connect(`amqp://buyurtma:${parol}@localhost/`);
  c.on('error', e => console.log(`${t()} ulanish xatosi: ${e.message.slice(0, 70)}`));
  c.on('close', () => { console.log(`${t()} ulanish yopildi`); process.exit(0); });
  let ch = await c.createChannel(); ch.on('error', () => {});
  for (let i = 0; i < 60; i++) {
    try { await ch.checkQueue('buyurtma-q'); console.log(`${t()} checkQueue OK`); }
    catch (e) { console.log(`${t()} checkQueue: ${e.message.match(/\d{3} \([A-Z_-]+\)/)?.[0]}`); ch = await c.createChannel(); ch.on('error', () => {}); }
    await new Promise(r => setTimeout(r, 1000));
  }
  process.exit(0);
})();
```

```text vps
$ umask 077; openssl rand -hex 24 > /root/rabbit-buyurtma-parol; rabbitmqctl -q add_user buyurtma "$(cat /root/rabbit-buyurtma-parol)" >/dev/null; rabbitmqctl -q set_permissions -p / buyurtma "^buyurtma-.*" "^buyurtma-.*" "^buyurtma-.*"; rabbitmqadmin queues declare --name buyurtma-q --durable true >/dev/null; echo tayyor
tayyor
$ cd /root/rabbit-ilova && node ochiq.js > /root/ochiq.log 2>&1 & sleep 3; rabbitmqctl -q clear_permissions -p / buyurtma; echo "$(date +%T) --- ruxsat olindi"; sleep 5; rabbitmqctl -q delete_user buyurtma; echo "$(date +%T) --- foydalanuvchi o'chirildi"; sleep 3; grep -v "checkQueue OK" /root/ochiq.log; grep -c "checkQueue OK" /root/ochiq.log; grep "checkQueue OK" /root/ochiq.log | tail -1
09:04:26 --- ruxsat olindi
09:04:36 --- foydalanuvchi o'chirildi
09:04:36 ulanish yopildi
21
09:04:36 checkQueue OK
$ rabbitmqadmin queues delete --name buyurtma-q; rm /root/ochiq.log /root/rabbit-buyurtma-parol; rabbitmqctl -q list_users
user	tags
guest	[administrator]
```

- Ruxsat 09:04:26 da olib tashlandi. O'sha ulanishdagi passiv tekshiruvlar **10 soniya** davomida (keyingi qadamgacha) muvaffaqiyatli o'taverdi — RQ'dagi kesh: ruxsatni olish ochiq ulanishni darhol to'xtatmaydi.
- Foydalanuvchi o'chirilgan **o'sha soniyada** ulanish yopildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Har ilova o'z obyektlari bilan | Nom prefiksi + regex ruxsat (`^buyurtma-.*`) |
| Standart exchange orqali yuborish | `write` regex'ida `amq\.default` |
| Faqat monitoring | `monitoring` tegi, ruxsatlar minimal |
| Kirishni darhol to'xtatish | `delete_user` (yoki parol + `close_all_user_connections`) |
| Parol siyosati | `credential_validator.*` (`rabbitmq.conf`, 27-bob) |
| Foydalanuvchilarni oldindan yaratish | Definitions (29-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Production'da `guest` | Hamma biladigan parol; loopback'dan tashqarida ishlamaydi (sinovda) | Generatsiya qilingan foydalanuvchi, `guest` ni o'chirish |
| Hammaga `".*" ".*" ".*"` | Ilovalar bir-birining navbatini o'chira oladi | Prefiks bo'yicha regex |
| Standart exchange'ni unutish | `basic.publish` — `403` (sinovda) | `amq\.default` ni `write` ga |
| Ruxsat olingach ulanish to'xtadi deb hisoblash | Kesh, amallar davom etdi (sinovda) | O'chirish yoki ulanishlarni yopish |
| Parolni buyruq qatorida maxsus belgilar bilan | Shell boshqacha talqin qiladi (RQ) | Uzun harf-raqamli parol |

## Amaliyot

1. `guest` qayerdan ulana oladi?
2. Uch ruxsat turini va har biriga bittadan amal misolini ayting.
3. `queue.bind` qaysi obyektlarga qaysi ruxsatlarni talab qiladi?
4. Sinovda nega standart exchange'ga yuborish `403` berdi?
5. Ruxsatni olib tashlash va foydalanuvchini o'chirish ochiq ulanishga qanday ta'sir qildi?

<details>
<summary>Javoblar</summary>

1. Standartda faqat loopback (`localhost`) orqali.
2. `configure` — `queue.declare`; `write` — `basic.publish`; `read` — `basic.consume`.
3. Navbatga — `write`, exchange'ga — `read`.
4. Standart exchange nomi `amq.default`, u `write` regex'iga (`^buyurtma-.*`) mos emas edi.
5. Ruxsat olingach amallar keshdan davom etdi; o'chirilganda ulanish darhol yopildi.

</details>

## Rasmiy hujjat

- [RQ: Authentication, Authorisation, Access Control](https://www.rabbitmq.com/docs/access-control)
- [RQ: Credentials and Passwords](https://www.rabbitmq.com/docs/passwords)

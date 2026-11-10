# 28 — TLS

[Mundarija](README.md)

## Tushuncha

RQ (TLS Support): TLS'ning ikki asosiy vazifasi bor:

1. Ulanish trafigini **shifrlash**.
2. Qarshi tomonning **kimligini tekshirish** (peer verification) — "o'rtadagi odam" (man-in-the-middle) hujumidan himoya.

Ikkalasi ham **PKI** (ochiq kalitlar infratuzilmasi) ga tayanadi:

| Atama | Ma'nosi |
| --- | --- |
| **Shaxsiy kalit** (private key) | Faqat egasida turadi; ulanish kalitini hisoblashda ishlatiladi |
| **Sertifikat** (ochiq kalit) | Qarshi tomonga ko'rsatiladi |
| **CA** (Certificate Authority) | Sertifikatlarni imzolovchi. CA va sertifikatlar **ishonch zanjiri**ni hosil qiladi |
| **CA to'plami** (CA bundle) | Ishonchli CA sertifikatlari bitta faylda |
| **mTLS** | Ikki tomon bir-birini tekshiradi; RabbitMQ va klient birga sozlaydi |

TLS'ni ikki yo'l bilan qo'llash mumkin (RQ). Birinchisi — RabbitMQ TLS'ni o'zi qabul qiladi. Ikkinchisi — proksi yoki load balancer TLS'ni "tugatadi" (TLS termination) va tugunga oddiy TCP bilan ulanadi. Bu bob birinchisini ko'rib chiqadi.

### Sozlash (RQ)

TLS yoqilgan tugunga uchta fayl kerak: CA to'plami, server sertifikati va shaxsiy kalit. Ularni RabbitMQ jarayoni o'qiy olishi kerak, aks holda tugun ishga tushmaydi yoki TLS ulanishlarni qabul qilmaydi.

| Kalit | Nima |
| --- | --- |
| `listeners.ssl.default = 5671` | TLS tinglovchisi |
| `ssl_options.cacertfile`, `certfile`, `keyfile` | Uch fayl |
| `ssl_options.verify = verify_peer` | Klient sertifikat yuborsa — tekshirish |
| `ssl_options.fail_if_no_peer_cert` | `true` — sertifikatsiz klient rad etiladi (mTLS) |
| `ssl_options.versions.N` | Ruxsat etilgan TLS versiyalari |
| `listeners.tcp = none` | Oddiy (TLS'siz) tinglovchilarni o'chirish |

- RQ: TLSv1.0 va 1.1 — sanoatda **eskirgan** deb hisoblanadi. 1.2 dan eskilarini o'chirish tavsiya etiladi.
- Sertifikatlar: RQ'dagi tezkor yo'l — **tls-gen**. U o'zi imzolagan (self-signed) sertifikatlar yaratadi, ular **faqat ishlab chiqish va sinov** uchun. Production'da — tijoriy CA yoki tashkilot ichki CA'si.

### Muammolarni tekshirish (RQ: Troubleshooting TLS)

Tartib: haqiqiy konfiguratsiya → tinglovchilar → fayl huquqlari → fayl formati → Erlang'dagi TLS → `openssl s_client` bilan ulanish → klient ulanishi → log'dagi TLS alert'lar.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, Erlang 27).

### Sertifikatlar — tls-gen

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -qq make >/dev/null 2>&1; make --version | head -1
GNU Make 4.4.1
$ cd /root && rm -rf tls-gen && git clone -q https://github.com/rabbitmq/tls-gen tls-gen && cd tls-gen/basic && make >/dev/null 2>&1; make alias-leaf-artifacts >/dev/null 2>&1; ls result
ca_certificate.pem
ca_key.pem
client_certificate.pem
client_key.pem
client_lab.p12
client_lab_certificate.pem
client_lab_key.pem
server_certificate.pem
server_key.pem
server_lab.p12
server_lab_certificate.pem
server_lab_key.pem
$ cd /root/tls-gen/basic && make verify 2>&1 | grep -E 'OK|error'
/root/tls-gen/basic/result/client_lab_certificate.pem: OK
/root/tls-gen/basic/result/server_lab_certificate.pem: OK
$ cd /root/tls-gen/basic/result && openssl x509 -in server_certificate.pem -noout -subject -issuer -enddate -ext subjectAltName
subject=CN=lab, O=server
issuer=CN=TLSGenSelfSignedRootCA 2026-11-10T09:11:26.443767, L=$$$$
notAfter=Nov  7 06:11:27 2036 GMT
X509v3 Subject Alternative Name: 
    DNS:lab, DNS:lab, DNS:localhost
```

`make` o'rnatildi (tls-gen talabi). Natijada CA, server va klient juftliklari hosil bo'ldi. Server sertifikati `lab` va `localhost` nomlari uchun, 10 yil muddatga.

### Tugunda TLS

Fayllar `rabbitmq` guruhi o'qiy oladigan qilib joylashtiriladi. Shaxsiy kalit — `640`:

```text vps
$ install -d -m 750 -o root -g rabbitmq /etc/rabbitmq/tls && cd /root/tls-gen/basic/result && install -m 644 -o root -g rabbitmq ca_certificate.pem server_certificate.pem /etc/rabbitmq/tls/ && install -m 640 -o root -g rabbitmq server_key.pem /etc/rabbitmq/tls/ && ls -l /etc/rabbitmq/tls | tail -n +2 | awk '{print $1, $3, $4, $NF}'
-rw-r--r-- root rabbitmq ca_certificate.pem
-rw-r--r-- root rabbitmq server_certificate.pem
-rw-r----- root rabbitmq server_key.pem
$ cp /etc/rabbitmq/rabbitmq.conf /root/rabbitmq.conf.zaxira; cat /root/rabbit-ilova/tls.conf >> /etc/rabbitmq/rabbitmq.conf; rm /root/rabbit-ilova/tls.conf; tail -7 /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
# TLS (RQ: TLS Support)
listeners.ssl.default = 5671
ssl_options.cacertfile = /etc/rabbitmq/tls/ca_certificate.pem
ssl_options.certfile   = /etc/rabbitmq/tls/server_certificate.pem
ssl_options.keyfile    = /etc/rabbitmq/tls/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = false
active
$ rabbitmq-diagnostics -q listeners | grep -E '5671|5672'; grep 'started TLS (SSL) listener' /var/log/rabbitmq/rabbit@lab.log | tail -1 | sed 's/^.*\] <[0-9.]*> //'
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
started TLS (SSL) listener on [::]:5671
```

- Yangi tinglovchi: `5671`, `amqp/ssl`. Log'da — `started TLS (SSL) listener`.
- Port tashqaridan firewall bilan yopiq — sinov server ichida.

### `openssl s_client`

```text vps
$ openssl s_client -connect localhost:5671 -CAfile /etc/rabbitmq/tls/ca_certificate.pem -verify_hostname localhost </dev/null 2>/dev/null | grep -E '^ *(Verify return code|Protocol|Cipher) *:|^New,' | sort -u
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Protocol: TLSv1.3
Verify return code: 0 (ok)
$ openssl s_client -connect localhost:5671 </dev/null 2>/dev/null | grep -E 'Verify return code'
Verify return code: 19 (self-signed certificate in certificate chain)
```

CA berilganda sertifikat zanjiri tasdiqlandi (`0 (ok)`), TLSv1.3. CA'siz — `19 (self-signed certificate in certificate chain)`: tls-gen CA'si tizimning ishonchli ro'yxatida yo'q.

### Klientlar

Node.js — `amqplib`, `amqps://` va TLS parametrlari (`ca`, `cert`, `key`):

```js
// amqps:// — TLS ulanish (amqplib socketOptions -> Node tls.connect)
const amqp = require('amqplib');
const fs = require('fs');
const d = '/etc/rabbitmq/tls/';
const holatlar = {
  'CA berilmagan': {},
  'CA bilan': { ca: [fs.readFileSync(d + 'ca_certificate.pem')] },
  'CA + klient sertifikati': { ca: [fs.readFileSync(d + 'ca_certificate.pem')],
    cert: fs.readFileSync('/root/tls-gen/basic/result/client_certificate.pem'),
    key: fs.readFileSync('/root/tls-gen/basic/result/client_key.pem') },
};
(async () => {
  for (const [nom, opt] of Object.entries(holatlar)) {
    try {
      const c = await amqp.connect('amqps://localhost:5671', opt);
      const tls = c.connection.stream;
      console.log(`${nom}: ulandi, ${tls.getProtocol()}, ${tls.getCipher().name}`);
      await c.close();
    } catch (e) { console.log(`${nom}: ${e.code || ''} ${e.message.slice(0, 90)}`); }
  }
})();
```

PHP — dastlabki variant `AMQPSSLConnection` bilan:

```php
<?php
// php-amqplib: AMQPSSLConnection, ssl_options — PHP stream context (ssl://) parametrlari
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPSSLConnection;
$r = '/root/tls-gen/basic/result/';
$holatlar = [
    'CA bilan' => ['cafile' => '/etc/rabbitmq/tls/ca_certificate.pem', 'verify_peer' => true],
    'CA + klient sertifikati' => ['cafile' => '/etc/rabbitmq/tls/ca_certificate.pem', 'verify_peer' => true,
        'local_cert' => $r . 'client_certificate.pem', 'local_pk' => $r . 'client_key.pem'],
];
foreach ($holatlar as $nom => $ssl) {
    try {
        $c = new AMQPSSLConnection('localhost', 5671, 'guest', 'guest', '/', $ssl);
        echo "$nom: ulandi\n"; $c->close();
    } catch (\Throwable $e) { echo "$nom: ", get_class($e), "\n"; }
}
```

```text vps
$ cd /root/rabbit-ilova && node tls.js && php tls.php
CA berilmagan: SELF_SIGNED_CERT_IN_CHAIN self-signed certificate in certificate chain
CA bilan: ulandi, TLSv1.3, TLS_AES_256_GCM_SHA384
CA + klient sertifikati: ulandi, TLSv1.3, TLS_AES_256_GCM_SHA384
PHP Deprecated:  AMQPSSLConnection is deprecated and will be removed in version 4 of php-amqplib in /root/rabbit-ilova/vendor/php-amqplib/php-amqplib/PhpAmqpLib/Connection/AMQPSSLConnection.php on line 31
CA bilan: ulandi
PHP Deprecated:  AMQPSSLConnection is deprecated and will be removed in version 4 of php-amqplib in /root/rabbit-ilova/vendor/php-amqplib/php-amqplib/PhpAmqpLib/Connection/AMQPSSLConnection.php on line 31
CA + klient sertifikati: ulandi
```

- CA berilmasa Node.js ulanmaydi — sertifikat tekshiriladi, bu to'g'ri.
- Kuzatildi: `php-amqplib` 3.7 da `AMQPSSLConnection` **eskirgan** (4-versiyada olib tashlanadi). Yangi usul — `AMQPConnectionConfig` + `AMQPConnectionFactory`:

```php
<?php
// php-amqplib 3.x: AMQPConnectionConfig + AMQPConnectionFactory (AMQPSSLConnection eskirgan)
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPConnectionConfig;
use PhpAmqpLib\Connection\AMQPConnectionFactory;
$r = '/root/tls-gen/basic/result/';
function ulan(string $nom, ?string $cert, ?string $key): void {
    $cfg = new AMQPConnectionConfig();
    $cfg->setHost('localhost'); $cfg->setPort(5671);
    $cfg->setUser('guest'); $cfg->setPassword('guest');
    $cfg->setIsSecure(true);
    $cfg->setSslCaCert('/etc/rabbitmq/tls/ca_certificate.pem');
    $cfg->setSslVerify(true); $cfg->setSslVerifyName(true);
    if ($cert) { $cfg->setSslCert($cert); $cfg->setSslKey($key); }
    try { $c = AMQPConnectionFactory::create($cfg); echo "$nom: ulandi\n"; $c->close(); }
    catch (\Throwable $e) { echo "$nom: ", get_class($e), "\n"; }
}
ulan('CA bilan', null, null);
ulan('CA + klient sertifikati', $r . 'client_certificate.pem', $r . 'client_key.pem');
```

### mTLS — klient sertifikati majburiy

```text vps
$ sed -i 's/^ssl_options.fail_if_no_peer_cert = false/ssl_options.fail_if_no_peer_cert = true/' /etc/rabbitmq/rabbitmq.conf; grep fail_if /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
ssl_options.fail_if_no_peer_cert = true
active
$ cd /root/rabbit-ilova && node tls.js && php tls.php
CA berilmagan: SELF_SIGNED_CERT_IN_CHAIN self-signed certificate in certificate chain
CA bilan: ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED 00BA9FDAC2710000:error:0A00045C:SSL routines:ssl3_read_bytes:tlsv13 alert certificate requ
CA + klient sertifikati: ulandi, TLSv1.3, TLS_AES_256_GCM_SHA384
CA bilan: PhpAmqpLib\Exception\AMQPConnectionClosedException
CA + klient sertifikati: ulandi
$ sleep 1; grep -E 'TLS server|certificate required|handshake' /var/log/rabbitmq/rabbit@lab.log | tail -2 | sed 's/^.*\] <[0-9.]*> //' | cut -c1-200
{tls_alert,{certificate_required,"TLS server: In state wait_cert at tls_handshake_1_3.erl:452 generated SERVER ALERT: Fatal - Certificate Required\n certificate_required"}} error during handshake for 
{tls_alert,{certificate_required,"TLS server: In state wait_cert at tls_handshake_1_3.erl:452 generated SERVER ALERT: Fatal - Certificate Required\n certificate_required"}} error during handshake for 
```

- Sertifikati yo'q klient rad etildi. Node.js'da — `ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED`, PHP'da — `AMQPConnectionClosedException`. Sertifikat bilan — ulandi.
- Server log'ida — `SERVER ALERT: Fatal - Certificate Required`.

### TLS versiyalarini cheklash

```text vps
$ printf '%s\n' 'ssl_options.versions.1 = tlsv1.3' 'ssl_options.versions.2 = tlsv1.2' >> /etc/rabbitmq/rabbitmq.conf; tail -2 /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
ssl_options.versions.1 = tlsv1.3
ssl_options.versions.2 = tlsv1.2
active
$ R=/root/tls-gen/basic/result; for v in tls1_1 tls1_2 tls1_3; do echo "-$v: $(openssl s_client -connect localhost:5671 -$v -CAfile $R/ca_certificate.pem -cert $R/client_certificate.pem -key $R/client_key.pem </dev/null 2>&1 | grep -oE '^New, [^,]+, Cipher is [A-Z0-9_-]+|no protocols available|alert protocol version' | head -1)"; done
-tls1_1: no protocols available
-tls1_2: New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
-tls1_3: New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
$ R=/root/tls-gen/basic/result; openssl s_client -connect localhost:5671 -tls1_1 -cipher 'DEFAULT@SECLEVEL=0' -CAfile $R/ca_certificate.pem -cert $R/client_certificate.pem -key $R/client_key.pem </dev/null 2>&1 | grep -oE '^New, [^,]+, Cipher is [A-Z0-9_-]+|alert protocol version|no protocols available' | head -1
alert protocol version
```

TLSv1.2 va 1.3 ishlaydi. TLSv1.1 da server **`protocol version`** alert'i bilan rad etdi. Birinchi `-tls1_1` sinovida "no protocols available" chiqdi — bu klient tomonidagi OpenSSL'ning o'z cheklovi, shuning uchun ikkinchi sinov `SECLEVEL=0` bilan qilingan.

Kuzatildi:

```text vps
$ rabbitmq-diagnostics -q tls_versions
tlsv1.3tlsv1.2tlsv1.1tlsv1
```

`tls_versions` sozlamadan keyin ham 1.0 va 1.1 ni ko'rsatadi — u Erlang **qo'llay oladigan** versiyalarni chiqaradi, tinglovchida ruxsat etilganini emas. Haqiqiy tekshiruv — `openssl s_client` (RQ ham shuni ko'rsatadi). Cheklovsiz tugunda TLSv1.1:

```text vps
$ R=/root/tls-gen/basic/result; openssl s_client -connect localhost:5671 -tls1_1 -cipher 'DEFAULT@SECLEVEL=0' -CAfile $R/ca_certificate.pem -cert $R/client_certificate.pem -key $R/client_key.pem </dev/null 2>&1 | grep -iE 'alert|error|Protocol|New,' | head -4 | cut -c1-150
40D7C87CDE720000:error:0A00042F:SSL routines:ssl3_read_bytes:tlsv1 alert insufficient security:../ssl/record/rec_layer_s3.c:918:SSL alert number 71
New, (NONE), Cipher is (NONE)
Protocol: TLSv1.1
    Protocol  : TLSv1.1
```

Cheklovsiz holatda ham TLSv1.1 ulanishi o'tmadi: kelishilgan shifr yo'q (`insufficient security`). RQ: yangi Erlang versiyalari standartda faqat yangi TLS versiyalarini yoqadi. Baribir versiyalarni aniq yozish xavfsizroq.

### Sertifikat muddati

```text vps
$ rabbitmq-diagnostics -q check_certificate_expiration --unit years --within 1; echo "kod: $?"
warning: negative steps are not supported in String.slice/2, pass 0..-2//1 instead
  (elixir 1.18.4) lib/string.ex:2427: String.slice/2
  (rabbitmqctl 4.4.0) lib/rabbitmq/cli/diagnostics/commands/check_certificate_expiration_command.ex:67: RabbitMQ.CLI.Diagnostics.Commands.CheckCertificateExpirationCommand.output/2
  (rabbitmqctl 4.4.0) lib/rabbitmqctl.ex:185: RabbitMQCtl.maybe_run_command/3
  (rabbitmqctl 4.4.0) lib/rabbitmqctl.ex:153: anonymous fn/5 in RabbitMQCtl.do_exec_parsed_command/5
  (rabbitmqctl 4.4.0) lib/rabbitmqctl.ex:653: RabbitMQCtl.maybe_with_distribution/3
  (rabbitmqctl 4.4.0) lib/rabbitmqctl.ex:118: RabbitMQCtl.exec_command/2

No certificates are expiring within 1 year.
kod: 0
$ rabbitmq-diagnostics -q check_certificate_expiration --unit years --within 20; echo "kod: $?"
%{node: :rabbit@lab, port: 5671, protocol: :"amqp/ssl", interface: "[::]", cacertfile: "/etc/rabbitmq/tls/ca_certificate.pem", certfile: "/etc/rabbitmq/tls/server_certificate.pem", certfile_expires_on: ["2036-11-07 06:11:27"], cacertfile_expires_on: ["2036-11-07 06:11:26"], purpose: "AMQP 0-9-1 and AMQP 1.0 over TLS"}
kod: 69
```

1 yil ichida muddati tugaydigan sertifikat yo'q (kod 0). 20 yilda esa ikkalasining muddati tugaydi (kod 69, sanalari bilan). Kuzatildi: 4.4.0 da bu buyruq natijadan oldin Elixir ogohlantirishini chiqaradi — natijaga ta'sir qilmaydi.

Oxirgi holat: TLS 5671 da, mTLS bilan, faqat TLSv1.2/1.3. Oddiy 5672 ham ishlayapti.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Faqat shifrlash | `verify_peer` + `fail_if_no_peer_cert = false`, klient server sertifikatini tekshiradi |
| Klientlarni sertifikat bilan aniqlash | mTLS: `fail_if_no_peer_cert = true` |
| Faqat TLS | `listeners.tcp = none` |
| TLS'ni proksi qiladi | Proksida TLS termination, tugunga TCP (RQ) |
| Sinov sertifikatlari | tls-gen |
| Production | Tijoriy yoki ichki CA |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Klientda sertifikat tekshiruvini o'chirish | MITM himoyasi yo'qoladi (RQ) | CA berish |
| Kalit faylini RabbitMQ o'qiy olmaydi | Tugun ishga tushmaydi yoki TLS ishlamaydi (RQ) | `root:rabbitmq`, `640` |
| tls-gen sertifikati production'da | Faqat sinov uchun (RQ) | Ishonchli CA |
| `tls_versions` ga qarab tekshirish | Qo'llanadiganini ko'rsatadi, ruxsat etilganini emas (sinovda) | `openssl s_client -tls1_x` |
| Muddatni kuzatmaslik | Muddati o'tgan sertifikat rad etiladi (RQ) | `check_certificate_expiration` monitoringda |
| PHP'da `AMQPSSLConnection` | Eskirgan (sinovda) | `AMQPConnectionConfig` |

## Amaliyot

1. TLS'ning ikki asosiy vazifasi nima?
2. TLS tugun uchun qaysi uch fayl kerak?
3. `fail_if_no_peer_cert = true` nimani o'zgartiradi?
4. Sinovda CA'siz `s_client` qanday kod qaytardi va nega?
5. Ruxsat etilgan TLS versiyalarini qanday tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Trafikni shifrlash va qarshi tomon kimligini tekshirish.
2. CA to'plami, server sertifikati, shaxsiy kalit.
3. Sertifikat yubormagan klient rad etiladi (mTLS).
4. `19 (self-signed certificate in certificate chain)` — tls-gen CA'si ishonchli ro'yxatda yo'q.
5. `openssl s_client -connect …:5671 -tls1_2` (va boshqa versiyalar bilan); `tls_versions` emas.

</details>

## Rasmiy hujjat

- [RQ: TLS Support](https://www.rabbitmq.com/docs/ssl)
- [RQ: Troubleshooting TLS-enabled Connections](https://www.rabbitmq.com/docs/troubleshooting-ssl)
- [tls-gen](https://github.com/rabbitmq/tls-gen)

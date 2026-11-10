# 30 — Xavfsizlik: TLS va SASL

[Mundarija](README.md)

## Tushuncha

### Nimalar bor (KD Security Overview)

- **Autentifikatsiya** (kim ulanayotganini tekshirish) — klientlar, boshqa broker'lar va vositalar ulanishida: SSL yoki SASL. SASL mexanizmlari: GSSAPI (Kerberos), PLAIN, SCRAM-SHA-256/512, OAUTHBEARER.
- **Shifrlash** — klient↔broker va broker↔broker trafigi SSL (TLS) bilan. KD ogohlantiradi: SSL yoqilganda unumdorlik pasayadi, qanchaligi CPU va JVM'ga bog'liq.
- **Avtorizatsiya** — klient o'qishi va yozishiga ruxsat (31-bob).

Xavfsizlik ixtiyoriy: himoyasiz klaster ham, aralash (shifrli va shifrsiz, autentifikatsiyali va autentifikatsiyasiz) klientlar ham qo'llab-quvvatlanadi.

### Listener'lar (KD Listener Configuration)

Har server klientlar va boshqa serverlar so'rovlarini qabul qiladigan **listener**'larni belgilaydi. Har listener o'z xavfsizlik protokoliga ega:

```text
listeners={LISTENER_NAME}://{hostname}:{port}, ...
listener.security.protocol.map=CLIENT:SSL,BROKER:PLAINTEXT
```

| Protokol | Shifrlash | Autentifikatsiya |
| --- | --- | --- |
| `PLAINTEXT` | Yo'q | Yo'q |
| `SSL` | TLS | Ixtiyoriy: klient sertifikati (`ssl.client.auth`) |
| `SASL_PLAINTEXT` | Yo'q | SASL |
| `SASL_SSL` | TLS | SASL |

- Broker'lararo listener — `inter.broker.listener.name`.
- KRaft controller listener'i — `controller.listener.names`.
- KD tavsiyasi: listener'larga ma'noli nom bering. Klientlar uchun alohida listener qo'ying, controller listener'ini esa tarmoq darajasida ajrating: klientlar u bilan ishlamaydi.

### TLS (KD → Encryption and Authentication using SSL)

| Atama | Ma'nosi |
| --- | --- |
| **Keystore** | Broker'ning o'z kaliti va sertifikati — maxfiy saqlanadi |
| **CA** (sertifikat markazi) | Sertifikatlarni imzolaydi. KD o'xshatishi: pasportga muhr bosadigan davlat |
| **Truststore** | Ishoniladigan CA sertifikatlari. Maxfiy ma'lumot yo'q, hamma uchun bir xil bo'lishi mumkin |
| **SAN** | Sertifikatdagi DNS/IP nomlari — **host name verification** shular bo'yicha |

Host name verification Kafka 2.0'dan beri standart yoqilgan. U MITM hujumidan (o'rtadagi odam) himoya qiladi. KD: o'chirishga yaxshi sabab yo'q — "keyinroq tuzataman" deyilgani holda.

### SASL/SCRAM (KD → Authentication using SASL)

SCRAM — PLAIN kabi oddiy login/parol usullaridagi xavfsizlik muammolarini hal qiladigan mexanizm.

- Hisob ma'lumotlari (salt, iteratsiya soni, kalitlar) **metama'lumot jurnalida** saqlanadi. Ular `kafka-storage.sh format --add-scram` yoki `kafka-configs.sh` bilan yaratiladi.
- Iteratsiya soni standart 4096 (eng kami ham shu), xesh — SHA-256 yoki SHA-512.
- KD: SCRAM **faqat TLS bilan** ishlatilsin (`SASL_SSL`), aks holda almashuvni tutib olib, lug'at hujumi qilish mumkin.

## Buyruqlar va kod

VPS'da, Kafka arxividan alohida broker (Docker'dagi broker'ga tegmasdan). Barcha portlar faqat `localhost` da:

- `SSL` (9194) — faqat TLS;
- `SASL_SSL` (9192) — TLS + SCRAM;
- controller (9193).

```properties
process.roles=broker,controller
node.id=1
controller.quorum.bootstrap.servers=localhost:9193
listeners=SASL_SSL://localhost:9192,SSL://localhost:9194,CONTROLLER://localhost:9193
advertised.listeners=SASL_SSL://localhost:9192,SSL://localhost:9194
listener.security.protocol.map=SASL_SSL:SASL_SSL,SSL:SSL,CONTROLLER:PLAINTEXT
inter.broker.listener.name=SASL_SSL
controller.listener.names=CONTROLLER
sasl.enabled.mechanisms=SCRAM-SHA-256
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-256
listener.name.sasl_ssl.scram-sha-256.sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="admin" password="admin-secret";
ssl.keystore.location=/root/kafka-xavfsiz/server.keystore.jks
ssl.keystore.password=test1234
ssl.key.password=test1234
ssl.truststore.location=/root/kafka-xavfsiz/truststore.jks
ssl.truststore.password=test1234
log.dirs=/root/kafka-xavfsiz/data
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
```

Parollar (`test1234`, `admin-secret`, `alice-secret`) — KD misollaridagi sinov qiymatlari. Haqiqiy tizimda ular kuchli bo'lishi va fayllarga ruxsatlar cheklanishi kerak.

### O'z CA'miz va broker sertifikati (KD bo'yicha)

`openssl-ca.cnf` — KD'dagi ro'yxat, maydonlar sinov uchun qisqartirilgan.

```text vps
$ cd /root/kafka-xavfsiz && echo 01 > serial.txt && touch index.txt && openssl req -x509 -config openssl-ca.cnf -newkey rsa:4096 -sha256 -nodes -out cacert.pem -outform PEM -subj "/CN=Sinov CA" 2>/dev/null && openssl x509 -in cacert.pem -noout -subject -issuer
subject=CN=Sinov CA
issuer=CN=Sinov CA
$ cd /root/kafka-xavfsiz && keytool -keystore server.keystore.jks -alias localhost -validity 365 -genkey -keyalg RSA -storetype pkcs12 -dname "CN=localhost" -ext SAN=DNS:localhost -storepass test1234 2>&1 | tail -1; keytool -keystore server.keystore.jks -alias localhost -certreq -file cert-file -ext SAN=DNS:localhost -storepass test1234 && openssl ca -batch -config openssl-ca.cnf -policy signing_policy -extensions signing_req -out cert-signed -infiles cert-file 2>&1 | grep -E 'Data Base|Signature ok'; keytool -keystore server.keystore.jks -alias CARoot -import -file cacert.pem -storepass test1234 -noprompt; keytool -keystore server.keystore.jks -alias localhost -import -file cert-signed -storepass test1234 -noprompt; keytool -keystore truststore.jks -alias CARoot -import -file cacert.pem -storepass test1234 -noprompt; keytool -list -keystore server.keystore.jks -storepass test1234 | grep -E 'Entry,'; keytool -list -keystore truststore.jks -storepass test1234 | grep -E 'Entry,'
	for: CN=localhost
Signature ok
Certificate was added to keystore
Certificate reply was installed in keystore
Certificate was added to keystore
caroot, Nov 10, 2026, trustedCertEntry, 
localhost, Nov 10, 2026, PrivateKeyEntry, 
caroot, Nov 10, 2026, trustedCertEntry, 
```

- CA o'zini o'zi imzolagan (`subject` = `issuer`).
- Broker kaliti `SAN=DNS:localhost` bilan yaratildi. So'rov (CSR) CA bilan imzolandi, keyin CA sertifikati va imzolangan sertifikat keystore'ga qo'shildi.
- Truststore'da faqat CA sertifikati.

### Broker: SCRAM admin bilan formatlash

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-storage.sh format -t $(bin/kafka-storage.sh random-uuid) --standalone -c /root/kafka-xavfsiz/server.properties --add-scram 'SCRAM-SHA-256=[name="admin",password="admin-secret"]' && (KAFKA_HEAP_OPTS="-Xmx256m" bin/kafka-server-start.sh /root/kafka-xavfsiz/server.properties > /root/kafka-xavfsiz/broker.log 2>&1 &); for i in $(seq 60); do grep -q "Kafka Server started" /root/kafka-xavfsiz/broker.log 2>/dev/null && break; sleep 3; done; grep -o 'Kafka Server started' /root/kafka-xavfsiz/broker.log
Formatting dynamic metadata voter directory /root/kafka-xavfsiz/data with metadata.version 4.4-IV2.
Kafka Server started
```

`--add-scram` — broker'lararo ulanish uchun `admin` hisobi format paytida metama'lumotga yozildi (KD). `Bootstrap metadata` qatori uzun bo'lgani uchun chiqishdan olib tashlandi.

### TLS

```text vps
$ echo | openssl s_client -connect localhost:9194 -CAfile /root/kafka-xavfsiz/cacert.pem 2>/dev/null | grep -E '^(subject|issuer)=|Protocol *:|New, |Verify return code'
subject=CN=localhost
issuer=CN=Sinov CA
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Protocol: TLSv1.3
Verify return code: 0 (ok)
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && timeout 60 bin/kafka-topics.sh --bootstrap-server localhost:9194 --list --command-config /root/kafka-xavfsiz/ishonchsiz.properties 2>&1 | grep -o -E 'SslAuthenticationException: [^:]*|PKIX path building failed' | sort -u
PKIX path building failed
SslAuthenticationException: SSL handshake failed
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --bootstrap-server localhost:9194 --create --topic xavfsiz --command-config /root/kafka-xavfsiz/client-ssl.properties && echo "shifrlangan salom" | bin/kafka-console-producer.sh --bootstrap-server localhost:9194 --topic xavfsiz --command-config /root/kafka-xavfsiz/client-ssl.properties && bin/kafka-console-consumer.sh --bootstrap-server localhost:9194 --topic xavfsiz --from-beginning --max-messages 1 --command-config /root/kafka-xavfsiz/client-ssl.properties 2>/dev/null
Created topic xavfsiz.
shifrlangan salom
```

- `openssl s_client`: TLSv1.3, sertifikat `CN=localhost`, imzolagan `Sinov CA`, tekshiruv `0 (ok)`.
- Truststore'siz klient (`security.protocol=SSL` xolos): Java standart CA'lari bizning CA'ni tanimaydi — `PKIX path building failed`, handshake muvaffaqiyatsiz.
- Truststore bilan (`client-ssl.properties`): topic yaratildi, xabar yozildi va o'qildi.

```properties
security.protocol=SSL
ssl.truststore.location=/root/kafka-xavfsiz/truststore.jks
ssl.truststore.password=test1234
```

### SASL/SCRAM

```properties
security.protocol=SASL_SSL
sasl.mechanism=SCRAM-SHA-256
sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="alice" password="alice-secret";
ssl.truststore.location=/root/kafka-xavfsiz/truststore.jks
ssl.truststore.password=test1234
```

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && timeout 60 bin/kafka-topics.sh --bootstrap-server localhost:9192 --list --command-config /root/kafka-xavfsiz/alice.properties 2>&1 | grep -o -E 'SaslAuthenticationException: .*credentials[^.]*' | sort -u
SaslAuthenticationException: Authentication failed during authentication due to invalid credentials with SASL mechanism SCRAM-SHA-256
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-configs.sh --bootstrap-server localhost:9192 --alter --add-config 'SCRAM-SHA-256=[iterations=8192,password=alice-secret]' --entity-type users --entity-name alice --command-config /root/kafka-xavfsiz/admin.properties && bin/kafka-configs.sh --bootstrap-server localhost:9192 --describe --entity-type users --entity-name alice --command-config /root/kafka-xavfsiz/admin.properties
Completed updating config for user alice.
SCRAM credential configs for user-principal 'alice' are SCRAM-SHA-256=iterations=8192
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-console-consumer.sh --bootstrap-server localhost:9192 --topic xavfsiz --from-beginning --max-messages 1 --command-config /root/kafka-xavfsiz/alice.properties 2>/dev/null; timeout 60 bin/kafka-topics.sh --bootstrap-server localhost:9192 --list --command-config /root/kafka-xavfsiz/yomon.properties 2>&1 | grep -o -E 'SaslAuthenticationException: .*credentials[^.]*' | sort -u
shifrlangan salom
SaslAuthenticationException: Authentication failed during authentication due to invalid credentials with SASL mechanism SCRAM-SHA-256
$ pkill -f 'kafka-xavfsiz/server.properties'; sleep 8; pgrep -f 'kafka-xavfsiz/server.properties' | wc -l
0
```

- `alice` hali yaratilmagan — `invalid credentials`.
- `admin` hisobi bilan `alice` yaratildi (8192 iteratsiya). `--describe` faqat mexanizm va iteratsiyani ko'rsatadi, parolni emas.
- `alice` endi o'qiy oldi. Noto'g'ri parol (`yomon.properties`) — yana `invalid credentials`.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Faqat shifrlash | `SSL` |
| Shifrlash + login/parol | `SASL_SSL` + SCRAM |
| Kompaniyada Kerberos/AD bor | `SASL_SSL` + GSSAPI |
| Tashqi token xizmati (OAuth) | `SASL_SSL` + OAUTHBEARER |
| Klient sertifikati bilan autentifikatsiya | `SSL` + `ssl.client.auth=required` |
| Sertifikatlarni fayl o'rniga sozlamada | PEM formati (KD, 2.7.0'dan) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| SCRAM yoki PLAIN'ni `SASL_PLAINTEXT` bilan | Almashuv ochiq tarmoqda (KD) | `SASL_SSL` |
| Host name verification'ni o'chirish | MITM himoyasi yo'qoladi (KD) | Sertifikatda to'g'ri SAN |
| Sertifikatda faqat CN | CN bo'yicha tekshirish 2000-yildan eskirgan (KD) | SAN |
| `ssl.client.auth=requested` | Sertifikatsiz klient ham ulanadi — soxta xavfsizlik hissi (KD) | `required` yoki `none` |
| CA kalitini oddiy fayl sifatida saqlash | Uni olgan har kim istalgan sertifikatni imzolaydi (KD) | CA kalitini alohida, himoyalangan joyda |
| Klientga truststore bermaslik | `PKIX path building failed` (sinovda) | Truststore'da CA |

## Amaliyot

1. Kafka'da qaysi to'rt xavfsizlik protokoli bor?
2. Keystore va truststore farqi nima?
3. Host name verification nimadan himoya qiladi va sertifikatning qaysi maydoniga qaraydi?
4. SCRAM hisob ma'lumotlari qayerda saqlanadi?
5. Sinovda truststore'siz klient nega ulana olmadi?

<details>
<summary>Javoblar</summary>

1. `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, `SASL_SSL`.
2. Keystore — o'z kaliti va sertifikati (maxfiy); truststore — ishoniladigan CA sertifikatlari.
3. MITM hujumidan; SAN (eskirgan holda CN).
4. KRaft metama'lumot jurnalida.
5. Java standart CA'lari bizning CA'ni tanimaydi: `PKIX path building failed`.

</details>

## Rasmiy hujjat

- [KD: Security Overview](https://kafka.apache.org/44/security/security-overview/)
- [KD: Listener Configuration](https://kafka.apache.org/44/security/listener-configuration/)
- [KD: Encryption and Authentication using SSL](https://kafka.apache.org/44/security/encryption-and-authentication-using-ssl/)
- [KD: Authentication using SASL](https://kafka.apache.org/44/security/authentication-using-sasl/) — SASL/SCRAM

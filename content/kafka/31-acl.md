# 31 — Ruxsatlar: ACL

[Mundarija](README.md)

## Tushuncha

30-bobda autentifikatsiya qilindi: broker kim ulanayotganini biladi. **Avtorizatsiya** — o'sha foydalanuvchi **nima qila olishi**ni belgilaydi.

### Authorizer (KD Authorization and ACLs)

Kafka'da avtorizatsiya plagin orqali ishlaydi. KRaft'dagi standart amalga oshirish (ACL'larni metama'lumotda saqlaydi):

```properties
authorizer.class.name=org.apache.kafka.metadata.authorizer.StandardAuthorizer
```

ACL (Access Control List — ruxsatlar ro'yxati) qoidasining umumiy shakli:

> **Principal** P **Operation** O amalini **Host** H dan, **ResourcePattern** RP ga mos **Resource** R ustida bajarishi **ruxsat etilgan / taqiqlangan**.

| Element | Misollar |
| --- | --- |
| **Principal** (kim) | `User:alice` — SASL'da login, SSL'da sertifikat nomi (`User:CN=…`) |
| **Operation** (nima) | `Read`, `Write`, `Create`, `Delete`, `Alter`, `Describe`, `ClusterAction`, `DescribeConfigs`, `AlterConfigs`, `IdempotentWrite`, `All` … |
| **Resource** (nimaning ustida) | `Topic`, `Group`, `Cluster`, `TransactionalId`, `DelegationToken`, `User` |
| **Pattern** | `literal` (aniq nom yoki `*`), `prefixed` (prefiks bo'yicha) |
| **Host** | Faqat IP manzil (hostname emas) |

### Standart xatti-harakat

- Resursga mos ACL **yo'q** bo'lsa — kirish **taqiqlanadi**, faqat **super user**'lar kira oladi.
- `super.users=User:Bob;User:Alice` — ajratuvchi nuqta-vergul, chunki SSL nomlarida vergul bo'ladi.
- `allow.everyone.if.no.acl.found=true` — ACL'siz resurs hammaga ochiq. KD ogohlantiradi: bunda ACL qo'yilmagan har resurs barcha principal'larga ochiq qoladi.
- KRaft: admin so'rovlarini (topic yaratish va h.k.) broker controller'ga uzatadi va avtorizatsiya **controller**'da bajariladi. Shuning uchun broker'ning controller'ga ulanadigan principal'i ham ruxsatga ega bo'lishi kerak.

### `kafka-acls.sh` qulayliklari (KD Examples)

| Opsiya | Nima beradi (sinovda ko'rinadi) |
| --- | --- |
| `--producer --topic T` | T ga `Write`, `Describe`, `Create` |
| `--consumer --topic T --group G` | T ga `Read`, `Describe`; G ga `Read` |
| `--resource-pattern-type prefixed` | Prefiks bilan boshlanadigan barcha nomlar |
| `--list --topic T --resource-pattern-type match` | T ga ta'sir qiladigan barcha ACL'lar (literal, `*`, prefixed) |

## Buyruqlar va kod

VPS'da, 30-bobdagi broker (`SASL_SSL` + SCRAM). Uchta qator qo'shildi va controller listener'i ham TLS'ga o'tkazildi:

```properties
listener.security.protocol.map=SASL_SSL:SASL_SSL,SSL:SSL,CONTROLLER:SSL
listener.name.controller.ssl.client.auth=required
authorizer.class.name=org.apache.kafka.metadata.authorizer.StandardAuthorizer
super.users=User:admin;User:CN=localhost
```

- `admin` — boshqaruv hisobi (super user).
- `User:CN=localhost` — broker o'zining controller'iga **o'z sertifikati** bilan ulanadi (`ssl.client.auth=required`). SSL principal'i sertifikat nomi bo'ladi (KD: Customizing SSL User Name). Bu ruxsat bo'lmasa, uzatilgan admin so'rovlari controller'da rad etiladi.

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-storage.sh format -t $(bin/kafka-storage.sh random-uuid) --standalone -c /root/kafka-xavfsiz/server.properties --add-scram 'SCRAM-SHA-256=[name="admin",password="admin-secret"]' >/dev/null && (KAFKA_HEAP_OPTS="-Xmx256m" bin/kafka-server-start.sh /root/kafka-xavfsiz/server.properties > /root/kafka-xavfsiz/broker.log 2>&1 &); for i in $(seq 60); do grep -q "Kafka Server started" /root/kafka-xavfsiz/broker.log 2>/dev/null && break; sleep 3; done; grep -o 'Kafka Server started' /root/kafka-xavfsiz/broker.log
Kafka Server started
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && A="--bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties"; for u in alice bob; do bin/kafka-configs.sh $A --alter --add-config "SCRAM-SHA-256=[password=$u-secret]" --entity-type users --entity-name $u; done; for t in buyurtmalar hisob-kun; do bin/kafka-topics.sh $A --create --topic $t; done
Completed updating config for user alice.
Completed updating config for user bob.
Created topic buyurtmalar.
Created topic hisob-kun.
```

### ACL'siz — kirish yo'q

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --bootstrap-server localhost:9192 --list --command-config /root/kafka-xavfsiz/alice.properties; echo "---"; echo "buyurtma 1" | timeout 60 bin/kafka-console-producer.sh --bootstrap-server localhost:9192 --topic buyurtmalar --command-config /root/kafka-xavfsiz/alice.properties 2>&1 | grep -o -E 'TopicAuthorizationException: .*' | sort -u

---
TopicAuthorizationException: Not authorized to access topics: [buyurtmalar]
```

`alice` autentifikatsiyadan o'tdi, lekin ACL yo'q: topic'lar ro'yxati bo'sh (`Describe` yo'q), yozish — `TopicAuthorizationException`.

### Producer va consumer ruxsatlari

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --add --allow-principal User:alice --producer --topic buyurtmalar
Adding ACLs for resource `ResourcePattern(resourceType=TOPIC, name=buyurtmalar, patternType=LITERAL)`: 
 	(principal=User:alice, host=*, operation=CREATE, permissionType=ALLOW)
	(principal=User:alice, host=*, operation=DESCRIBE, permissionType=ALLOW)
	(principal=User:alice, host=*, operation=WRITE, permissionType=ALLOW)
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && echo "buyurtma 1" | bin/kafka-console-producer.sh --bootstrap-server localhost:9192 --topic buyurtmalar --command-config /root/kafka-xavfsiz/alice.properties && bin/kafka-topics.sh --bootstrap-server localhost:9192 --list --command-config /root/kafka-xavfsiz/alice.properties
buyurtmalar
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --add --allow-principal User:bob --consumer --topic buyurtmalar --group ombor >/dev/null; bin/kafka-console-consumer.sh --bootstrap-server localhost:9192 --topic buyurtmalar --group ombor --from-beginning --max-messages 1 --command-config /root/kafka-xavfsiz/bob.properties 2>/dev/null; bin/kafka-console-consumer.sh --bootstrap-server localhost:9192 --topic buyurtmalar --group boshqa --from-beginning --max-messages 1 --timeout-ms 20000 --command-config /root/kafka-xavfsiz/bob.properties 2>&1 | grep -o -E 'GroupAuthorizationException: .*' | sort -u
buyurtma 1
GroupAuthorizationException: Not authorized to access group: boshqa
```

- `--producer` — `alice` ga `CREATE`, `DESCRIBE`, `WRITE`. Yozish ishladi, topic ro'yxatda ko'rindi.
- `--consumer` — `bob` `buyurtmalar` ni `ombor` guruhida o'qiy oldi. Boshqa guruh (`boshqa`) bilan — `GroupAuthorizationException`: consumer'ga topic ham, **guruh** ham kerak.

### Prefiks va ro'yxat

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --add --allow-principal User:alice --producer --topic hisob- --resource-pattern-type prefixed >/dev/null; echo "kunlik hisobot" | bin/kafka-console-producer.sh --bootstrap-server localhost:9192 --topic hisob-kun --command-config /root/kafka-xavfsiz/alice.properties && echo "yozildi"
yozildi
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --list --topic hisob-kun --resource-pattern-type match
Current ACLs for resource `ResourcePattern(resourceType=TOPIC, name=hisob-, patternType=PREFIXED)`:
	(principal=User:alice, host=*, operation=CREATE, permissionType=ALLOW)
	(principal=User:alice, host=*, operation=WRITE, permissionType=ALLOW)
	(principal=User:alice, host=*, operation=DESCRIBE, permissionType=ALLOW)
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --list --principal User:bob
ACLs for principal `User:bob`
Current ACLs for resource `ResourcePattern(resourceType=GROUP, name=ombor, patternType=LITERAL)`:
	(principal=User:bob, host=*, operation=READ, permissionType=ALLOW)

Current ACLs for resource `ResourcePattern(resourceType=TOPIC, name=buyurtmalar, patternType=LITERAL)`:
	(principal=User:bob, host=*, operation=DESCRIBE, permissionType=ALLOW)
	(principal=User:bob, host=*, operation=READ, permissionType=ALLOW)
```

- `hisob-` prefiksi — `alice` `hisob-kun` ga yoza oldi; kelajakdagi `hisob-…` topic'lariga ham ruxsat bor.
- `--resource-pattern-type match` — `hisob-kun` ga ta'sir qiladigan prefixed qoidani topdi.
- `--principal User:bob` — bitta foydalanuvchining barcha ruxsatlari.

### Ruxsatni olib tashlash

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-acls.sh --bootstrap-server localhost:9192 --command-config /root/kafka-xavfsiz/admin.properties --remove --force --allow-principal User:alice --producer --topic buyurtmalar >/dev/null; echo "buyurtma 2" | timeout 60 bin/kafka-console-producer.sh --bootstrap-server localhost:9192 --topic buyurtmalar --command-config /root/kafka-xavfsiz/alice.properties 2>&1 | grep -o -E 'TopicAuthorizationException: .*' | sort -u
TopicAuthorizationException: Not authorized to access topics: [buyurtmalar]
$ pkill -f '[k]afka-xavfsiz/server.properties'; sleep 8; pgrep -f '[k]afka-xavfsiz/server.properties' | wc -l
0
```

`--remove` (`--force` — tasdiq so'ramaslik) — `alice` yana yoza olmaydi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Xizmat bitta topic'ga yozadi | `--producer --topic T` |
| Xizmat o'qiydi | `--consumer --topic T --group G` |
| Jamoa o'z nomlar maydonida | `prefixed` (`jamoa-`), 32-bob |
| Hammaga ruxsat, bittasidan tashqari | `--allow-principal User:'*'` + `--deny-principal` (KD: kamdan-kam) |
| Faqat ma'lum IP'lardan | `--allow-host` |
| Tranzaksiyali producer | `TransactionalId` resursi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `allow.everyone.if.no.acl.found=true` | ACL'siz har resurs hammaga ochiq (KD) | Standart (yopiq) + aniq ACL'lar |
| Consumer'ga faqat topic ruxsati | Guruhga ham `Read` kerak (sinovda) | `--consumer ... --group` |
| KRaft'da broker principal'ini unutish | Admin so'rovlari controller'da rad etiladi (KD) | Broker principal'i `super.users` da |
| `super.users` ni vergul bilan ajratish | SSL nomlarida vergul bor (KD) | Nuqta-vergul |
| `--allow-host` ga hostname | Faqat IP qo'llab-quvvatlanadi (KD) | IP manzil |
| `--list --topic T` bilan barcha qoidalarni ko'rdim deb o'ylash | `*` va prefixed qoidalar ko'rinmaydi (KD) | `--resource-pattern-type match` |

## Amaliyot

1. Autentifikatsiya va avtorizatsiya farqi nima?
2. Resursga hech qanday ACL bo'lmasa nima bo'ladi?
3. `--producer` va `--consumer` qanday ruxsatlar beradi?
4. Sinovda `bob` nega `boshqa` guruhi bilan o'qiy olmadi?
5. Nega broker sertifikati (`User:CN=localhost`) `super.users` ga qo'shildi?

<details>
<summary>Javoblar</summary>

1. Autentifikatsiya — kimligini tekshirish; avtorizatsiya — nima qila olishini belgilash.
2. Kirish taqiqlanadi — faqat super user'lar kiradi.
3. `--producer`: topic'ga Write, Describe, Create. `--consumer`: topic'ga Read, Describe va guruhga Read.
4. Guruhga ruxsat faqat `ombor` uchun berilgan edi.
5. KRaft'da admin so'rovlari controller'da avtorizatsiya qilinadi; broker controller'ga o'z sertifikati bilan ulanadi.

</details>

## Rasmiy hujjat

- [KD: Authorization and ACLs](https://kafka.apache.org/44/security/authorization-and-acls/) — Behavior Without ACLs, KRaft Principal Forwarding, Customizing SSL User Name, Command Line Interface, Examples, Authorization Primitives

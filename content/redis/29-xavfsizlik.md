# 29 — Xavfsizlik

[Mundarija](README.md)

## Tushuncha

### Xavfsizlik modeli

RD (Redis security): Redis **ishonchli muhitdagi ishonchli mijozlar** uchun mo'ljallangan. Redis'ni to'g'ridan-to'g'ri internetga yoki ishonchsiz mijozlar TCP portiga yoki UNIX soketiga kira oladigan muhitga ochish — yomon fikr. Odatda Redis va ishonchsiz foydalanuvchilar (brauzerlar) orasida **veb-ilova** turadi: u ACL, kiruvchi ma'lumotni tekshirish va qaysi amallar bajarilishini hal qiladi.

### Tarmoq

RD: Redis portiga ishonchli mijozlardan boshqa hech kim kira olmasligi kerak — faqat ilovani ishlatadigan kompyuterlar. Internetga ochiq bitta VPS'da port **firewall** bilan yopilishi kerak; mijozlar loopback (127.0.0.1) orqali ulanadi. Bitta interfeysga bog'lash: `bind 127.0.0.1`. Himoyasiz port xavfi katta: bitta `FLUSHALL` butun ma'lumotni o'chiradi.

### Himoyalangan rejim

RD: Redis 3.2 dan — standart sozlama bilan (**hamma interfeyslarga** bog'langan) va **parolsiz** ishga tushsa, **protected mode** (himoyalangan rejim) yoqiladi: faqat loopback'dan javob beradi, boshqa manzillarga muammoni va yechimni tushuntiruvchi xato qaytaradi. Administrator uni o'chirib qo'yishi mumkin — lekin bu ongli qaror bo'lishi kerak.

### Autentifikatsiya

Ikki usul (RD):

| Usul | Nima |
| --- | --- |
| **ACL** (Redis 6 dan, **tavsiya**) | Nomli foydalanuvchilar, har biriga aniq ruxsatlar |
| `requirepass` (eski) | Bitta umumiy parol; aslida `default` foydalanuvchiga parol beradi |

`requirepass` bo'lsa, autentifikatsiyadan o'tmagan mijozning har so'rovi rad etiladi; mijoz `AUTH parol` (ACL bilan — `AUTH foydalanuvchi parol`) yuboradi. Parol **uzun** bo'lishi kerak (RD): Redis juda tez — soniyasiga ko'p parol sinab ko'rish mumkin; parolni administrator yodlamaydi (u konfiguratsiyada), demak uzun bo'lishi muammo emas.

Autentifikatsiya — **qo'shimcha** himoya qatlami (firewall ishlamay qolsa ham). `AUTH` ham boshqa buyruqlar kabi **shifrlanmasdan** yuboriladi — tarmoqni tinglay oladigan hujumchidan himoya qilmaydi (RD). Buning uchun — TLS.

### ACL

RD: ACL (Access Control List — kirish nazorati ro'yxati) — ulanish bajarishi mumkin bo'lgan buyruqlar va murojaat qilishi mumkin bo'lgan kalitlarni cheklaydi. Ikki maqsad: **xavfsizlik** (har mijozga ishiga yetarli minimal ruxsat) va **ish xavfsizligi** (dastur xatosi yoki qo'l xatosi ma'lumot yoki sozlamani buzmasligi).

Standart: bitta `default` foydalanuvchi — `user default on nopass ~* &* +@all`: faol, parolsiz, hamma kalit (`~*`) va kanallar (`&*`), hamma buyruq (`+@all`). Yangi ulanish avtomatik `default` bo'ladi.

Qoidalar (chapdan o'ngga qo'llanadi):

| Qoida | Nima |
| --- | --- |
| `on` / `off` | Foydalanuvchini yoqish / o'chirish |
| `>parol` / `<parol` | Parol qo'shish / olib tashlash |
| `#xesh` | Parolning SHA-256 xeshi (faylda parolni ochiq yozmaslik uchun) |
| `nopass`, `resetpass` | Parolsiz / barcha parollarni o'chirish |
| `+buyruq`, `-buyruq`, `+buyruq\|subbuyruq` | Buyruqqa ruxsat / taqiq (masalan, `+config\|get`) |
| `+@kategoriya`, `-@kategoriya` | Kategoriya: `@read`, `@write`, `@list`, `@dangerous`… (`ACL CAT`) |
| `~naqsh` | Ruxsat etilgan kalitlar (glob) |
| `%R~naqsh`, `%W~naqsh` | Faqat o'qish / faqat yozish (Redis 7.0 dan) |
| `&naqsh` | Pub/Sub kanallari |
| `reset` | Foydalanuvchini boshlang'ich holatga |

Yangi foydalanuvchi **cheklangan** holda yaratiladi: `off`, parolsiz, buyruqsiz, kalitsiz; 7.0 dan kanallarga ham ruxsatsiz (`acl-pubsub-default resetchannels`).

Buyruqlar: `ACL SETUSER`, `ACL LIST`, `ACL GETUSER`, `ACL DELUSER`, `ACL WHOAMI`, `ACL CAT`, `ACL LOG` (rad etilgan urinishlar).

**Foydalanuvchilarni saqlash** (RD): `redis.conf` ichida (`user …` qatorlari, `CONFIG REWRITE` bilan) **yoki** tashqi fayl `aclfile /etc/redis/users.acl` (`ACL LOAD`/`ACL SAVE`). Ikkalasi bir vaqtda — mumkin emas. Ko'p foydalanuvchi bo'lsa — tashqi fayl tavsiya etiladi. `CONFIG REWRITE` `ACL SAVE` ni bajarmaydi.

### Buyruqlarni o'chirish

`rename-command CONFIG ""` — **eskirgan** (deprecated), kelajakda olib tashlanishi mumkin; o'rniga ACL (RD).

### Boshqa xavflar (RD)

- **Yomon kiritma**: hujumchi veb-forma orqali bir xesh katagiga tushadigan satrlar yuborib, O(1) ni O(N) ga aylantirishi mumkin — Redis buning oldini olish uchun xesh funksiyaga har ishga tushishda tasodifiy urug' (seed) beradi. `SORT` (qsort) tasodifiylashtirilmagan.
- **NoSQL injection**: Redis protokolida satr ekranlash tushunchasi yo'q — uzunlik prefiksli, ikkilik xavfsiz; oddiy kutubxona bilan injection odatda mumkin emas. Lua skript matnini ishonchsiz manbadan yasamang (15-bob).
- **`CONFIG`**: mijoz ishchi papka va dump fayl nomini o'zgartirib, RDB faylni ixtiyoriy joyga yozishi mumkin — tizimni buzishga olib kelishi mumkin. Shuning uchun `CONFIG` ni ACL bilan cheklang.
- Redis'ga **root** kerak emas — alohida, imtiyozsiz `redis` foydalanuvchisi bilan ishga tushiring.

### TLS

RD (TLS): Redis 6 dan — barcha kanallarda (mijoz, replikatsiya, Cluster shinasi) ixtiyoriy TLS; kompilyatsiyada yoqilgan bo'lishi kerak (`BUILD_TLS=yes`).

| Sozlama | Nima |
| --- | --- |
| `tls-port 6379`, `port 0` | TLS porti; `port 0` — shifrlanmagan portni o'chirish (aks holda ikkalasi ishlaydi) |
| `tls-cert-file`, `tls-key-file` | Server sertifikati va kaliti |
| `tls-ca-cert-file` | Ishonchli CA (sertifikatlarni tekshirish uchun) |
| `tls-auth-clients` | Standart — **mutual TLS**: mijoz ham sertifikat ko'rsatishi shart; `no` — o'chirish |
| `tls-replication yes`, `tls-cluster yes` | Replikatsiya / Cluster uchun TLS |

TLS o'tkazish qobiliyatini kamaytiradi (shifrlash xarajati); 8.0 dan I/O oqimlari TLS bilan ham ishlaydi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3).

### Asosiy server

```text vps
$ redis-cli CONFIG GET bind protected-mode requirepass; ss -ltn | awk 'NR==1 || /:6379 /'; ps -o user=,comm= -C redis-server | sort -u
protected-mode
yes
requirepass

bind
127.0.0.1 -::1
State  Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN 0      511        127.0.0.1:6379      0.0.0.0:*   
LISTEN 0      511            [::1]:6379         [::]:*   
redis    redis-server
```

- `bind 127.0.0.1 -::1` — faqat loopback; `ss` ham faqat `127.0.0.1:6379` va `[::1]:6379` ni ko'rsatdi — tashqaridan kirib bo'lmaydi.
- `protected-mode yes`, parol yo'q; jarayon — `redis` foydalanuvchisi nomidan (root emas).

### Himoyalangan rejim

Sinov uchun: loopback bo'lmagan manzilni taqlid qiluvchi virtual interfeys (`10.99.0.1`) va ehtiyot uchun sinov portini tashqaridan yopuvchi firewall qoidasi:

```text vps
$ ip link add rd0 type dummy && ip addr add 10.99.0.1/24 dev rd0 && ip link set rd0 up; iptables -I INPUT -p tcp --dport 7040 ! -i lo -j DROP; mkdir -p /tmp/r29
$ redis-server --port 7040 --bind '* -::*' --protected-mode yes --save '' --daemonize yes --dir /tmp/r29 --logfile /tmp/r29/log; sleep 0.5; redis-cli -h 127.0.0.1 -p 7040 PING; redis-cli -h 10.99.0.1 -p 7040 PING
PONG
DENIED Redis is running in protected mode because protected mode is enabled and no password is set for the default user. In this mode connections are only accepted from the loopback interface. If you want to connect from external computers to Redis you may adopt one of the following solutions: 1) Just disable protected mode sending the command 'CONFIG SET protected-mode no' from the loopback interface by connecting to Redis from the same host the server is running, however MAKE SURE Redis is not publicly accessible from internet if you do so. Use CONFIG REWRITE to make this change permanent. 2) Alternatively you can just disable the protected mode by editing the Redis configuration file, and setting the protected mode option to 'no', and then restarting the server. 3) If you started the server manually just for testing, restart it with the '--protected-mode no' option. 4) Set up an authentication password for the default user. NOTE: You only need to do one of the above things in order for the server to start accepting connections from the outside.
```

Hamma interfeysga bog'langan, parolsiz server: `127.0.0.1` dan — `PONG`, `10.99.0.1` dan — `DENIED` va RD aytgan tushuntirish (to'rt yechim bilan).

### Parol

```text vps
$ redis-cli -p 7040 CONFIG SET requirepass "uzun-tasodifiy-parol-7f3a9c" > /dev/null; redis-cli -h 10.99.0.1 -p 7040 PING; redis-cli -h 10.99.0.1 -p 7040 --no-auth-warning -a xato PING; redis-cli -h 10.99.0.1 -p 7040 --no-auth-warning -a uzun-tasodifiy-parol-7f3a9c PING
NOAUTH Authentication required.

AUTH failed: WRONGPASS invalid username-password pair or user is disabled.
NOAUTH Authentication required.

PONG
```

Parol qo'yilgach, tashqi manzildan: parolsiz — `NOAUTH`, noto'g'ri — `WRONGPASS`, to'g'ri — `PONG`.

### ACL: cheklangan foydalanuvchi

```text vps
$ redis-cli -p 7040 --no-auth-warning -a uzun-tasodifiy-parol-7f3a9c CONFIG SET requirepass "" > /dev/null; redis-cli -p 7040 ACL LIST; redis-cli -p 7040 ACL SETUSER alice; redis-cli -p 7040 ACL LIST
user default on nopass sanitize-payload ~* &* +@all
OK
user alice off sanitize-payload resetchannels -@all
user default on nopass sanitize-payload ~* &* +@all
$ redis-cli -p 7040 ACL SETUSER alice on '>p1pp0' '~cached:*' +get; redis-cli -p 7040 SET cached:1 salom > /dev/null; redis-cli -p 7040 SET boshqa 1 > /dev/null; A="redis-cli -p 7040 --user alice --pass p1pp0 --no-auth-warning"; $A ACL WHOAMI; $A GET cached:1; $A SET cached:1 x; $A GET boshqa
OK
NOPERM User alice has no permissions to run the 'acl|whoami' command

salom
NOPERM User alice has no permissions to run the 'set' command

NOPERM No permissions to access a key
```

- Yangi `alice` — `off`, `-@all`: hech narsa qila olmaydi.
- RD misoli: `on >p1pp0 ~cached:* +get` — faqat `GET`, faqat `cached:*`.
- `GET cached:1` — ishladi; `SET` — buyruqqa ruxsat yo'q; `GET boshqa` — kalitga ruxsat yo'q; `ACL WHOAMI` ham ruxsat etilmagan.
- `sanitize-payload` — kuzatildi: 8.10 da `ACL LIST` har foydalanuvchiga qo'shib ko'rsatadi.

```text vps
$ redis-cli -p 7040 --no-raw ACL LOG 2 | grep -A1 -E '"(reason|context|object|username)"' | grep -v -- '--' | paste - - | head -8
    3) "reason"	    4) "key"
    5) "context"	    6) "toplevel"
    7) "object"	    8) "boshqa"
    9) "username"	   10) "alice"
    3) "reason"	    4) "command"
    5) "context"	    6) "toplevel"
    7) "object"	    8) "set"
    9) "username"	   10) "alice"
```

`ACL LOG` — rad etilgan urinishlar: kim, nima (`command`/`key`) va qaysi obyekt.

```text vps
$ redis-cli -p 7040 ACL GETUSER alice | paste - - | head -3; redis-cli -p 7040 ACL CAT dangerous | wc -l; redis-cli -p 7040 ACL CAT dangerous | grep -xE 'flushall|config|keys|debug|shutdown' | sort | tr '\n' ' '; echo
flags	on
sanitize-payload	passwords
2d9c75273d72b32df726fb545c8a4edc719f0a95a6fd993950b10c474ad9c927	commands
88
debug flushall keys shutdown 
```

Parol saqlanmaydi — faqat SHA-256 xeshi. `@dangerous` kategoriyasida 88 buyruq, jumladan `flushall`, `keys`, `debug`, `shutdown`.

### ACL: ilova foydalanuvchisi

RD'dagi naqsh — hamma buyruq, lekin xavflilarisiz:

```text vps
$ redis-cli -p 7040 ACL SETUSER ilova on '>ilova-paroli' '~*' '&*' +@all -@dangerous; I="redis-cli -p 7040 --user ilova --pass ilova-paroli --no-auth-warning"; $I SET a 1; $I FLUSHALL; $I CONFIG GET maxmemory; $I KEYS '*'
OK
OK
NOPERM User ilova has no permissions to run the 'flushall' command

NOPERM User ilova has no permissions to run the 'config|get' command

NOPERM User ilova has no permissions to run the 'keys' command
```

`SET` — ishladi; `FLUSHALL`, `CONFIG GET`, `KEYS` — rad etildi. Ilova xatosi yoki qo'l xatosi bazani o'chira olmaydi.

### O'qish/yozish ruxsatlari

RD misoli: `app1:*` — to'liq, `app2:*` — faqat o'qish:

```text vps
$ redis-cli -p 7040 ACL SETUSER hisobot on '>h-paroli' +@all '~app1:*' '%R~app2:*'; redis-cli -p 7040 SET app2:user ali > /dev/null; H="redis-cli -p 7040 --user hisobot --pass h-paroli --no-auth-warning"; $H COPY app2:user app1:user; $H GET app1:user; $H SET app2:user x
OK
1
ali
NOPERM No permissions to access a key
```

`COPY app2:user app1:user` — ishladi (`app2` dan o'qish, `app1` ga yozish); `SET app2:user` — rad etildi.

### Tashqi ACL fayl

```text vps
$ redis-cli -p 7040 SHUTDOWN NOSAVE; printf 'user default on nopass ~* &* +@all\n' > /tmp/r29/users.acl; redis-server --port 7040 --bind 127.0.0.1 --save '' --daemonize yes --dir /tmp/r29 --logfile /tmp/r29/log --aclfile /tmp/r29/users.acl; sleep 0.5; redis-cli -p 7040 ACL SETUSER worker on '>ffa9203c493aa99' +@list +@connection '~jobs:*'; redis-cli -p 7040 ACL SAVE; cat /tmp/r29/users.acl
OK
OK
user default on nopass sanitize-payload ~* &* +@all
user worker on sanitize-payload #2288ec82bc090b36a7ebee6c750e541c3d3594a17917e6aa275340c77226e883 ~jobs:* resetchannels -@all +@list +@connection
```

`ACL SAVE` faylga yozdi; parol ochiq emas, `#` + SHA-256 xesh.

### Parol tarmoqda ochiq ketadi

```text vps
$ redis-cli -p 7040 CONFIG SET requirepass "uzun-tasodifiy-parol-7f3a9c" > /dev/null; (timeout 3 tcpdump -i lo -A -n 'tcp port 7040' 2>/dev/null | grep -a -o 'uzun-tasodifiy-parol-7f3a9c' | head -1 | sed 's/^/tcpdump ko.rdi: /') & sleep 1; redis-cli -p 7040 --no-auth-warning -a uzun-tasodifiy-parol-7f3a9c PING; wait
PONG
tcpdump ko.rdi: uzun-tasodifiy-parol-7f3a9c
```

`tcpdump` (tarmoq paketlarini ushlovchi) loopback'da `AUTH` dagi parolni **ochiq matnda** ko'rdi — RD aytgandek.

### TLS

```text vps
$ ldd /usr/bin/redis-server | grep -o 'libssl[^ ]*'; cd /tmp/r29 && openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=sinov-ca -keyout ca.key -out ca.crt 2>/dev/null && for n in server client; do openssl req -newkey rsa:2048 -nodes -subj /CN=$n -keyout $n.key -out $n.csr 2>/dev/null && openssl x509 -req -in $n.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out $n.crt 2>/dev/null; done; ls *.crt | tr '\n' ' '; echo
libssl.so.3
libssl.so.3
ca.crt client.crt server.crt 
$ redis-server --port 0 --tls-port 7041 --bind 127.0.0.1 --save '' --daemonize yes --dir /tmp/r29 --logfile /tmp/r29/tlslog --tls-cert-file /tmp/r29/server.crt --tls-key-file /tmp/r29/server.key --tls-ca-cert-file /tmp/r29/ca.crt; sleep 0.5; redis-cli -p 7041 PING 2>&1 | head -1; redis-cli -p 7041 --tls --cacert /tmp/r29/ca.crt --sni localhost PING 2>&1 | head -1; redis-cli -p 7041 --tls --cacert /tmp/r29/ca.crt --cert /tmp/r29/client.crt --key /tmp/r29/client.key PING
Error: Connection reset by peer
Error: Server closed the connection
PONG
```

- `redis-server` OpenSSL (`libssl.so.3`) bilan yig'ilgan — paketda TLS bor.
- Sinov CA, server va mijoz sertifikatlari (1 kunlik, faqat sinov uchun).
- Oddiy ulanish — uzildi; faqat CA bilan (mijoz sertifikatisiz) — server yopdi: standart **mutual TLS**; mijoz sertifikati bilan — `PONG`.

```text vps
$ (timeout 3 tcpdump -i lo -A -n 'tcp port 7041' 2>/dev/null | grep -a -c 'maxfiy-qiymat' | sed 's/^/tcpdump ochiq matnda topdi: /') & sleep 1; redis-cli -p 7041 --tls --cacert /tmp/r29/ca.crt --cert /tmp/r29/client.crt --key /tmp/r29/client.key SET kalit maxfiy-qiymat; wait
OK
tcpdump ochiq matnda topdi: 0
```

TLS orqali yuborilgan `maxfiy-qiymat` paketlarda ochiq matnda **topilmadi** (`0`).

```text vps
$ for p in 7040 7041; do redis-cli -p $p --no-auth-warning -a uzun-tasodifiy-parol-7f3a9c SHUTDOWN NOSAVE 2>/dev/null; done; redis-cli -p 7041 --tls --cacert /tmp/r29/ca.crt --cert /tmp/r29/client.crt --key /tmp/r29/client.key SHUTDOWN NOSAVE 2>/dev/null; iptables -D INPUT -p tcp --dport 7040 ! -i lo -j DROP; ip link del rd0; rm -rf /tmp/r29; ss -ltn | grep -c ':704[01] '
0
```

Sinov serverlari, interfeys va firewall qoidasi olib tashlandi; 7040/7041 portlar yopiq.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Redis portini internetga ochish | Har kim `FLUSHALL` qila oladi (RD) | `bind 127.0.0.1` / ichki tarmoq + firewall |
| `protected-mode no` va parolsiz | Himoyasiz | Parol/ACL va firewall bilan, ongli ravishda |
| Qisqa parol | Redis tez — ko'p urinish mumkin (RD) | Uzun tasodifiy parol |
| Hamma ilova `default` foydalanuvchida | Har biri hamma narsani qila oladi | Har ilovaga ACL foydalanuvchi, minimal ruxsat |
| Ilovaga `@dangerous` ni qoldirish | `FLUSHALL`, `CONFIG` xatoda bazani buzadi | `+@all -@dangerous` yoki aniq ro'yxat |
| Ishonchsiz tarmoqda TLS'siz | Parol va ma'lumot ochiq (sinovda `tcpdump` ko'rdi) | TLS |
| `rename-command` ga tayanish | Eskirgan (RD) | ACL |
| Redis'ni root bilan ishga tushirish | `CONFIG` orqali fayl yozish xavfi | Alohida `redis` foydalanuvchi |
| Parollarni `users.acl` da ochiq yozish | Fayl o'qilsa — parol ma'lum | `#<sha256>` yoki `ACL SAVE` |

## Amaliyot

1. RD bo'yicha Redis qanday muhit uchun mo'ljallangan?
2. Himoyalangan rejim qachon yoqiladi va nima qiladi?
3. `requirepass` va ACL farqi nima?
4. Faqat `cached:*` kalitlarini o'qiy oladigan foydalanuvchini qanday yaratasiz?
5. Ilova foydalanuvchisi `FLUSHALL` qila olmasligi uchun qanday qoida?
6. Nega parol bilan ham TLS kerak bo'lishi mumkin? Sinovda nima ko'rindi?

<details>
<summary>Javoblar</summary>

1. Ishonchli muhitdagi ishonchli mijozlar uchun; internetga to'g'ridan-to'g'ri ochilmaydi.
2. Hamma interfeysga bog'langan va parolsiz bo'lsa; faqat loopback'dan javob beradi, boshqalarga `DENIED`.
3. `requirepass` — bitta umumiy parol (`default` foydalanuvchi); ACL — nomli foydalanuvchilar, buyruq va kalit ruxsatlari bilan.
4. `ACL SETUSER alice on >parol ~cached:* +get`.
5. `+@all -@dangerous` (yoki faqat kerakli buyruqlar).
6. `AUTH` va ma'lumot shifrlanmasdan ketadi; sinovda `tcpdump` parolni ochiq ko'rdi, TLS'da esa topmadi.

</details>

## Rasmiy hujjat

- [RD: Redis security](https://redis.io/docs/latest/operate/oss_and_stack/management/security/)
- [RD: ACL](https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/)
- [RD: TLS](https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/)
- [RD: ACL SETUSER](https://redis.io/docs/latest/commands/acl-setuser/) · [ACL LOG](https://redis.io/docs/latest/commands/acl-log/)

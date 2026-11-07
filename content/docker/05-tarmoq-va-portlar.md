# 05 — Tarmoq, portlar va firewall

[← Oldingi: Konteynerlar bilan ishlash](04-konteynerlar.md) · [Mundarija](README.md)

## Tushuncha

4-bobda konteyner o'z IP manzilini olganini ko'rdik (`172.17.0.2`). Bu manzil — Docker yaratgan ichki tarmoqda. Bu bobda uchta savol:

| Savol | Javob |
| --- | --- |
| Konteynerlar bir-birini qanday topadi? | O'z (user-defined) tarmog'ingizda — **nom** bilan |
| Konteynerdagi ilovaga tashqaridan qanday kiriladi? | Portni **publish** qilish: `-p` |
| Firewall (ufw) buni to'xtatadimi? | **Yo'q** — Docker qoidalari ufw'dan oldin ishlaydi |

## Tarmoqlar

Docker o'rnatilganda uchta tarmoq bo'ladi:

```text vps
$ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
6de5941b2ae3   bridge    bridge    local
8925d6b10547   host      host      local
c72ad080d806   none      null      local
```

`bridge` — konteynerlar standart holatda shu tarmoqqa ulanadi (`host` va `none` — maxsus, bu kitobda ishlatilmaydi). Docker hujjati (Networking overview): standart `bridge` tarmog'idagi konteynerlar bir-biriga **IP manzil** orqali kira oladi, lekin **bir-birini nom bilan topa olmaydi**. Tekshiramiz:

```text vps
$ docker run -d --name veb nginx:1.29
b703c292ff63bafb56ecc44019f4bbbe83f22a20b0f0fdb20c4323db792ee02f
$ docker run --rm alpine wget -qO- -T 3 http://veb/ | head -4
wget: bad address 'veb'
$ docker inspect -f '{{.NetworkSettings.Networks.bridge.IPAddress}}' veb
172.17.0.2
$ docker run --rm alpine wget -qO- -T 3 http://172.17.0.2/ | grep -o '<title>.*</title>'
<title>Welcome to nginx!</title>
```

- `wget http://veb/` — `bad address 'veb'`: nom topilmadi.
- IP manzil bilan — nginx'ning bosh sahifasi keldi.

IP manzil esa konteyner qayta yaratilganda o'zgarishi mumkin — unga tayanib bo'lmaydi. Hujjatdagi yechim — **o'z tarmog'ingiz** (user-defined network): unga ulangan konteynerlar bir-biriga IP **va nom** orqali kira oladi.

```text vps
$ docker network create ilova-tarmoq
e83a73ec1cdc0c87fcc47404ab312b09641649ac963f720c86a3cde38826fd0b
$ docker network connect ilova-tarmoq veb
$ docker run --rm --network ilova-tarmoq alpine wget -qO- -T 3 http://veb/ | grep -o '<title>.*</title>'
<title>Welcome to nginx!</title>
$ docker network inspect ilova-tarmoq -f '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{end}}'
veb 172.18.0.2/16
$ docker rm -f veb
veb
$ docker network rm ilova-tarmoq
ilova-tarmoq
```

- `docker network create` — yangi tarmoq (standart drayver — `bridge`).
- `docker network connect` — ishlayotgan konteynerni unga ulash (yaratishda esa `--network`).
- Endi `http://veb/` ishladi: Docker tarmoq ichida nomlarni o'zi aniqlab beradi.
- Konteyner bir vaqtda bir nechta tarmoqda bo'la oladi: `veb` ning yangi tarmoqdagi manzili — `172.18.0.2`.

Compose (15–16-boblar) har loyiha uchun shunday tarmoqni o'zi yaratadi — servislar bir-birini nom bilan (`db`, `redis`) topadi.

## Portni ochish: `-p`

Docker hujjati (Port publishing): `bridge` tarmog'idagi konteyner portlari serverning o'zidan va o'sha tarmoqdagi konteynerlardan ochiq, lekin **server tashqarisidan** — yo'q. Tashqariga ochish — `-p` (`--publish`):

| Qiymat | Ma'nosi |
| --- | --- |
| `-p 8080:80` | Serverning **hamma manzillaridagi** 8080 → konteynerning 80 (TCP) |
| `-p 127.0.0.1:8080:80` | Faqat serverning o'zidan (loopback) → konteyner 80 |
| `-p 8080:80/udp` | UDP port |
| `-p 80` | Konteyner 80 → serverdagi tasodifiy bo'sh port |

Image'dagi `EXPOSE` (`docker ps` dagi `80/tcp`, 4-bob) portni **ochmaydi**. Dockerfile ma'lumotnomasi: u image'ni yasagan va konteynerni ishga tushiradigan odam o'rtasidagi "hujjat" — ilova qaysi portda tinglashini bildiradi. Ochish faqat `-p` bilan.

## Firewall: ufw chetlab o'tiladi

Docker hujjatining ogohlantirishi (Port publishing): port publish qilish **standart holatda xavfsiz emas** — u nafaqat serverga, balki **butun tashqi dunyoga** ochiladi. Bundan tashqari (Docker and ufw): Docker konteyner trafigini `nat` jadvalida yo'naltiradi, paketlar ufw ishlatadigan `INPUT`/`OUTPUT` zanjirlariga yetmasdan burib yuboriladi — **ufw qoidalari amalda e'tiborga olinmaydi**.

Bizning VPS'da ufw yoqilgan, kiruvchi ulanishlar standart holatda taqiqlangan va 8080 uchun ruxsat yo'q (Linux, 43-bob). Tekshiramiz:

<div data-animatsiya="qadamli" data-nom="docker-port"></div>

### 1. `-p 8080:80`

```text vps
$ ufw status | grep -E "Status|8080"
Status: active
$ docker run -d --name veb -p 8080:80 nginx:1.29 >/dev/null && echo ishga tushdi
Unable to find image 'nginx:1.29' locally
1.29: Pulling from library/nginx
8e9b53b630de: Pulling fs layer
57fb71246055: Pulling fs layer
38a7e44929f3: Pulling fs layer
6e9f32fdbd61: Pulling fs layer
382a36159731: Pulling fs layer
20d41cd6829d: Pulling fs layer
83742381311a: Pulling fs layer
8e9b53b630de: Download complete
83742381311a: Download complete
6e9f32fdbd61: Download complete
382a36159731: Download complete
20d41cd6829d: Download complete
57fb71246055: Download complete
46ca9676efb5: Download complete
94a543ead0f2: Download complete
38a7e44929f3: Download complete
57fb71246055: Pull complete
38a7e44929f3: Pull complete
83742381311a: Pull complete
6e9f32fdbd61: Pull complete
382a36159731: Pull complete
20d41cd6829d: Pull complete
8e9b53b630de: Pull complete
Digest: sha256:1881968aff6f7cdcc4b888c00a11f4ce241ad7ec957e0cb4a9e19e93a3ff87ea
Status: Downloaded newer image for nginx:1.29
ishga tushdi
$ docker port veb
80/tcp -> 0.0.0.0:8080
80/tcp -> [::]:8080
```

`docker port` — `0.0.0.0:8080` va `[::]:8080`: barcha IPv4 va IPv6 manzillar. Noutbukdan (internet orqali) so'raymiz:

```text tashqi
$ curl -sS --max-time 5 -o /dev/null -w "%{http_code}\n" http://203.0.113.10:8080/
200
```

`200` — sahifa ochildi. ufw'da 8080 uchun ruxsat yo'q, lekin port **internetga ochiq**. VPS manzili `203.0.113.10` bilan almashtirilgan (RFC 5737, Linux, 40-bob).

### 2. `-p 127.0.0.1:8080:80`

```text vps
$ docker rm -f veb >/dev/null
$ docker run -d --name veb -p 127.0.0.1:8080:80 nginx:1.29 >/dev/null && echo ishga tushdi
ishga tushdi
$ docker port veb
80/tcp -> 127.0.0.1:8080
$ curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/
200
```

Serverning o'zidan — `200`. Noutbukdan:

```text tashqi
$ curl -sS --max-time 5 -o /dev/null -w "%{http_code}\n" http://203.0.113.10:8080/
curl: (28) Operation timed out after 5004 milliseconds with 0 bytes received
000
```

Javob yo'q — port tashqaridan yopiq. Serverdagi Nginx (reverse proxy) yoki SSH tunnel (Linux, 47-bob) orqali kirish mumkin — tashqariga chiqadigan yagona eshik shular bo'ladi.

### Ichkarida nima bo'ladi

```text vps
$ docker run -d --name veb -p 127.0.0.1:8080:80 nginx:1.29 >/dev/null
$ iptables -t nat -S DOCKER | grep 8080
-A DOCKER -d 127.0.0.1/32 ! -i docker0 -p tcp -m tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:80
$ iptables -S DOCKER-USER
-N DOCKER-USER
$ ufw status | head -1
Status: active
$ docker rm -f veb
veb
```

- `DNAT` qoidasi: `127.0.0.1:8080` ga kelgan TCP paketlar `172.17.0.2:80` ga — konteynerga yo'naltiriladi. Bu `nat` jadvalida, ufw esa `filter` jadvalining `INPUT` zanjirida ishlaydi.
- `DOCKER-USER` — Docker hujjati (Docker with iptables) bo'yicha konteynerlarga keladigan trafikni **o'zingiz** filtrlash uchun zanjir: Docker unga tegmaydi, qoidalarni bu yerga qo'shasiz. Hozir u bo'sh.

Xulosa — serverda:

1. Ichki servislar (baza, Redis, admin panel) — `-p` siz yoki `127.0.0.1:` bilan.
2. Tashqariga faqat haqiqatan kerakli port, ongli ravishda.
3. Qo'shimcha cheklov kerak bo'lsa — `DOCKER-USER` zanjiri ("Server xavfsizligi" kitobida).

## Tipik xatolar

**1. "ufw yoqilgan — demak port yopiq".**
Docker publish qilgan portlarga ufw qoidalari ta'sir qilmaydi.
To'g'risi: `-p 127.0.0.1:…`; tashqaridan tekshirish (`curl` boshqa kompyuterdan, Linux, 43-bob).

**2. Bazani `-p 5432:5432` bilan ochish.**
Baza internetga ochiladi.
To'g'risi: ilova va baza bitta tarmoqda — port publish qilmasdan, nom bilan (`db:5432`).

**3. Konteynerlarni IP manzil bilan bog'lash.**
Konteyner qayta yaratilsa, IP o'zgaradi; standart `bridge` da esa nom ishlamaydi.
To'g'risi: o'z tarmog'ingiz va konteyner nomi.

**4. `EXPOSE` portni ochadi deb o'ylash.**
U faqat ma'lumot.
To'g'risi: `-p`.

## Amaliyot

Savollar:

1. Standart `bridge` tarmog'ida `wget http://db/` nega `bad address` beradi?
2. `docker run -p 8080:80 nginx` dan keyin sahifa internetdan ochiladimi, agar ufw'da 8080 yopiq bo'lsa?
3. Konteynerdagi admin panelni faqat serverning o'zidan ochiladigan qilish uchun nima yozasiz?
4. Ilova konteyneri bazaga qanday ulanishi kerak, agar bazaning porti publish qilinmagan bo'lsa?
5. `DOCKER-USER` zanjiri nima uchun?

<details>
<summary>Javoblar</summary>

1. Standart `bridge` da nomlar aniqlanmaydi — faqat IP. O'z tarmog'ingizda nom ishlaydi.
2. Ha: Docker'ning `nat` qoidalari ufw'dan oldin ishlaydi.
3. `-p 127.0.0.1:PORT:PORT`.
4. Ikkalasi bitta (user-defined) tarmoqda bo'lsin — ilova bazaga konteyner nomi va ichki port bilan ulanadi (`db:5432`).
5. Konteynerlarga keladigan trafikni o'zingiz filtrlashingiz uchun — Docker unga tegmaydi.

</details>

## Rasmiy hujjat

- [Networking overview](https://docs.docker.com/engine/network/) — user-defined tarmoqlar, nom bilan topish
- [Publishing ports](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/) · [Port publishing and mapping](https://docs.docker.com/engine/network/port-publishing/) — `-p`, xavfsizlik ogohlantirishi
- [Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) — Docker va ufw
- [Docker with iptables](https://docs.docker.com/engine/network/firewall-iptables/) — `DOCKER-USER` zanjiri
- [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/)
- [Dockerfile reference: EXPOSE](https://docs.docker.com/reference/dockerfile/#expose)

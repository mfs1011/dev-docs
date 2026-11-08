# 04 — Konteynerlar bilan ishlash

[← Oldingi: Image'lar](03-imagelar.md) · [Mundarija](README.md) · [Keyingi: Tarmoq, portlar va firewall →](05-tarmoq-va-portlar.md)

## Tushuncha

Konteyner — image'dan ishga tushirilgan nusxa (1-bob). Bu bobda uning butun hayotini boshqaramiz: yaratish, ishga tushirish, ichiga kirish, loglarini o'qish, to'xtatish va o'chirish.

| Buyruq | Nima qiladi |
| --- | --- |
| `docker run` | Image'dan konteyner yaratib, ishga tushiradi |
| `docker ps` (`-a`) | Ishlayotgan (`-a` — barcha) konteynerlar |
| `docker logs` | Konteyner chiqishi (STDOUT va STDERR) |
| `docker exec` | Ishlayotgan konteyner ichida yangi buyruq |
| `docker stop` / `start` | To'xtatish / qayta ishga tushirish |
| `docker rm` | O'chirish |

## Birinchi konteynerlar

`docker run IMAGE BUYRUQ` — image ichida buyruqni bajaradi:

```text vps
$ docker run alpine echo salom
salom
$ docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
NAMES           IMAGE     STATUS
boring_galois   alpine    Exited (0) Less than a second ago
```

`echo` tugadi — konteyner ham to'xtadi: `Exited (0)`, qavs ichida chiqish kodi. Nom bermadik — daemon tasodifiy nom berdi (`boring_galois`). `docker run` ma'lumotnomasi (Running containers) bo'yicha konteynerni uch xil aniqlash mumkin: uzun ID, qisqa ID (12 belgi) va nom.

### Fon rejimi: `-d`

Standart holatda konteyner **oldingi rejimda** (foreground) ishlaydi — terminal band. `-d` (`--detach`) — fonda:

```text vps
$ docker run -d --name veb nginx:1.29
194bcb895883dfe17f8d5bcab9acd85a7d381e5523479eda6be9bbfb70b7f328
$ docker ps
CONTAINER ID   IMAGE        COMMAND                  CREATED        STATUS                  PORTS     NAMES
194bcb895883   nginx:1.29   "/docker-entrypoint.…"   1 second ago   Up Less than a second   80/tcp    veb
$ docker logs -n 3 veb
2026/11/07 19:18:30 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1024:524288
2026/11/07 19:18:30 [notice] 1#1: start worker processes
2026/11/07 19:18:30 [notice] 1#1: start worker process 29
$ docker exec veb nginx -v
nginx version: nginx/1.29.8
```

- `-d` ning chiqishi — yangi konteynerning to'liq ID'si.
- `--name veb` — o'zimiz bergan nom; keyingi buyruqlarda ID o'rniga ishlatamiz.
- `docker ps` — `STATUS: Up …` (ishlayapti), `PORTS: 80/tcp` — image'da e'lon qilingan port, lekin hali tashqariga ochilmagan (5-bob).
- `docker logs -n 3` — oxirgi 3 qator. Docker hujjati (Logging): `docker logs` standart holatda konteyner buyrug'ining **STDOUT va STDERR** oqimlarini (Linux, 11-bob) ko'rsatadi — xuddi buyruqni terminalda o'zingiz ishga tushirgandek. Shuning uchun konteynerdagi ilova loglarni faylga emas, standart oqimlarga yozishi kerak.
- `docker exec` — **ishlayotgan** konteyner ichida yangi buyruq. Ma'lumotnoma: bu buyruq faqat konteynerning asosiy jarayoni (PID 1) ishlab turganda ishlaydi va konteyner qayta ishga tushirilsa, qayta bajarilmaydi.

## Konteyner ichidan: namespace

1-bobda konteyner — namespace'lar bilan ajratilgan jarayon ekanini o'qidik. Endi ko'ramiz:

```text vps
$ docker run -d --name uxla alpine sleep 1000 >/dev/null
$ docker exec uxla ps
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 1000
    7 root      0:00 ps
$ ps -o pid,user,cmd -C sleep
    PID USER     CMD
  23015 root     sleep 1000
$ docker exec uxla hostname
9a03ef07205e
$ hostname
lab
$ docker exec uxla ip -4 -o addr show eth0
2: eth0    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0\       valid_lft forever preferred_lft forever
```

- Konteyner ichida `sleep 1000` — **PID 1**, ya'ni u o'z jarayonlar daraxtining ildizi (Linux, 28-bob). Ichkaridan serverdagi boshqa jarayonlar ko'rinmaydi — faqat o'zi va `ps`.
- Serverdan qaraganda o'sha jarayon — oddiy `sleep 1000`, PID'i 23015. Bir jarayon, ikki xil ko'rinish: konteyner o'z PID namespace'ida.
- Xost nomi (`hostname`) ham boshqa — konteyner ID'sining boshi. IP manzili `172.17.0.2` — Docker'ning ichki tarmog'idan (5-bob).

Konteyner virtual mashina emas — bu serverdagi oddiy jarayon, faqat "ko'zoynak taqqan".

## Hayot sikli

`docker ps` ma'lumotnomasi konteyner holatlarini sanaydi: `created`, `restarting`, `running`, `removing`, `paused`, `exited`, `dead`. Asosiylarini ko'ramiz:

<div data-animatsiya="qadamli" data-nom="hayot"></div>

To'xtatish va qayta ishga tushirish:

```text vps
$ time docker stop uxla
uxla

real	0m10.295s
user	0m0.019s
sys	0m0.017s
$ docker ps -a --filter name=uxla --format "{{.Names}} {{.Status}}"
uxla Exited (137) Less than a second ago
$ docker start uxla
uxla
$ docker ps --filter name=uxla --format "{{.Names}} {{.Status}}"
uxla Up Less than a second
$ docker rm uxla
Error response from daemon: cannot remove container "uxla": container is running: stop the container before removing or force remove
```

- `docker stop` 10 soniya kutdi va holat — `Exited (137)`. 137 = 128 + 9: jarayon `SIGKILL` (9-signal, Linux, 29-bob) bilan o'ldirilgan. `docker stop` ma'lumotnomasi: avval asosiy jarayonga `SIGTERM` yuboriladi, kutish muddatidan keyin — `SIGKILL`; Linux konteynerlari uchun standart muddat — 10 soniya. Bu yerda `sleep` PID 1 sifatida `SIGTERM` ga javob bermadi — sababi va yechimi 8-bobda.
- `docker start` — to'xtagan konteynerni **o'sha konteyner** sifatida qayta ishga tushiradi (yangisini yaratmaydi).
- Ishlayotgan konteynerni `docker rm` o'chirmaydi — avval `stop`, yoki `-f` (majburan):

```text vps
$ docker rm -f uxla
uxla
```

`docker run` aslida ikki qadam — yaratish va ishga tushirish (1-bob). Ularni alohida ham qilish mumkin:

```text vps
$ docker container create --name bosh alpine echo salom
6593929c9695f91b79514bf719075092806ffa47797faa55bd310909fd9fdf6c
$ docker ps -a --filter name=bosh --format '{{.Names}} {{.Status}}'
bosh Created
$ docker start -a bosh
salom
$ docker ps -a --filter name=bosh --format '{{.Names}} {{.Status}}'
bosh Exited (0) Less than a second ago
$ docker rm bosh
bosh
```

`Created` — yaratilgan, lekin hali ishga tushmagan. `start -a` — ishga tushirib, chiqishiga ulanish (`attach`).

### `--rm`: ishlatib, tashlab yuborish

Har `docker run` yangi konteyner yaratadi va u to'xtagandan keyin ham diskda qoladi (`docker ps -a`). Bir martalik buyruqlar uchun `--rm` — ma'lumotnoma bo'yicha konteyner (va uning nomsiz volume'lari, 6-bob) tugashi bilan o'chiriladi. Bu bobning qolgan misollarida shuni ishlatamiz.

## Standart qiymatlarni almashtirish

Docker hujjati (Overriding container defaults): konteyner ishga tushganda image sozlamasidagi buyruqni bajaradi; `docker run` parametrlari bilan buni o'zgartirish mumkin.

### Buyruq

Image nomidan keyingi so'zlar — image'dagi standart buyruq o'rniga bajariladi (biz yuqorida `echo`, `sleep`, `ps` bilan shunday qildik). 8-bobda Dockerfile'dagi `CMD` va `ENTRYPOINT` bilan bog'liqligini ko'ramiz.

### Muhit o'zgaruvchilari: `-e` va `--env-file`

Ilovalarga sozlama (baza manzili, port) ko'pincha muhit o'zgaruvchilari orqali beriladi (Linux, 13-bob):

```text vps
$ docker run --rm -e SALOM=dunyo -e PORT=8080 alpine env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=491b2ca2515c
PORT=8080
SALOM=dunyo
HOME=/root
```

Ko'p o'zgaruvchi bo'lsa — fayl, har qatorda `NOM=qiymat`, va `--env-file`:

```text vps
$ printf '%s\n' DB_HOST=baza DB_PORT=5432 > ilova.env
$ docker run --rm --env-file ilova.env alpine sh -c 'echo $DB_HOST:$DB_PORT'
baza:5432
$ docker run --rm --env-file ilova.env alpine sh -c "echo $DB_HOST:$DB_PORT"
:
$ rm ilova.env
```

Ikkinchi va uchinchi buyruq orasidagi farq — **qo'shtirnoq**. Bitta qo'shtirnoqda (`'…'`) `$DB_HOST` serverdagi qobiqda ochilmaydi va konteyner ichidagi `sh` ga yetib boradi — u yerda qiymat bor. Ikki qo'shtirnoqda (`"…"`) esa uni **serverdagi** qobiq ochib yubordi — serverda bunday o'zgaruvchi yo'q, natija `:` (Linux, 14-bob).

### Kirish oqimi: `-i`

`-i` (`--interactive`) — konteynerning STDIN'ini ochiq tutadi: unga buyruqlarni pipe orqali berish mumkin:

```text vps
$ echo 'echo ichkarida: $(hostname); exit' | docker run -i --rm alpine sh
ichkarida: 753119bacd4e
```

Terminalda qo'lda ishlash uchun `-i` ga `-t` (`--tty`, psevdo-terminal ajratish) qo'shiladi: `docker run -it --rm alpine sh` — konteyner ichida qobiq ochiladi, `exit` bilan chiqasiz. Resurslarni cheklash (`--memory`, `--cpus`) — 27-bobda.

## Chiqish kodlari

Running containers ma'lumotnomasi `docker run` ning chiqish kodlarini tushuntiradi (Linux, 50-bob: 126, 127):

| Kod | Ma'nosi |
| --- | --- |
| 125 | Xato Docker'ning o'zida (masalan, noma'lum parametr) |
| 126 | Konteyner buyrug'ini ishga tushirib bo'lmaydi |
| 127 | Konteyner buyrug'i topilmadi |
| Boshqasi | Konteyner ichidagi buyruqning o'z kodi |

```text vps
$ docker run --rm alpine sh -c 'exit 3'; echo "kod: $?"
kod: 3
$ docker run --rm alpine yoqbuyruq; echo "kod: $?"
docker: Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: exec: "yoqbuyruq": executable file not found in $PATH

Run 'docker run --help' for more information
kod: 127
$ docker run --rm alpine /etc; echo "kod: $?"
docker: Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: exec: "/etc": is a directory: permission denied

Run 'docker run --help' for more information
kod: 126
$ docker run --foo alpine; echo "kod: $?"
unknown flag: --foo

Usage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

Run 'docker run --help' for more information
kod: 125
```

Bu kodlar skriptlarda va CI'da muhim (26-bob): `docker run` ichidagi testlar yiqilsa, kodini tashqariga uzatadi.

## Tipik xatolar

**1. To'xtagan konteynerlarni unutish.**
Har `docker run` yangi konteyner yaratadi; to'xtaganlari `docker ps -a` da to'planib, joy egallaydi.
To'g'risi: bir martalik buyruqlar uchun `--rm`; tozalash — 28-bob.

**2. `docker exec` to'xtagan konteynerda.**
`exec` faqat ishlayotgan konteynerda ishlaydi.
To'g'risi: avval `docker start`, yoki yangi konteyner bilan `docker run`.

**3. `-e` qiymatlari ikki qo'shtirnoqda serverda ochilib ketishi.**
`sh -c "echo $X"` da `$X` server qobig'ida ochiladi.
To'g'risi: konteyner ichida ochilishi kerak bo'lsa — bitta qo'shtirnoq.

**4. Ilova loglarini konteyner ichidagi faylga yozish.**
`docker logs` ularni ko'rmaydi.
To'g'risi: STDOUT/STDERR ga yozish.

**5. `docker stop` 10 soniya "qotib qoladi".**
Asosiy jarayon `SIGTERM` ni olmayapti yoki e'tiborsiz qoldiryapti.
To'g'risi: 8-bob.

## Amaliyot

Savollar:

1. `docker run -d nginx` dan keyin terminalga nima chiqadi va nima uchun?
2. Konteyner ichida `ps` asosiy jarayonni PID 1 deb ko'rsatdi, serverda esa u 23015. Nega?
3. `docker stop` dan keyin `Exited (137)`. Bu nimani bildiradi?
4. `docker start` va `docker run` ning farqi nima?
5. `docker run --rm alpine yoqbuyruq; echo $?` nima chiqaradi?

<details>
<summary>Javoblar</summary>

1. Yangi konteynerning to'liq ID'si: konteyner fonda ishlaydi, terminal bo'sh qoladi.
2. Konteyner o'z PID namespace'ida: ichkaridan o'zining jarayonlar daraxti ko'rinadi, unda u — birinchi.
3. 128 + 9: jarayon `SIGKILL` bilan o'ldirilgan — `SIGTERM` ga 10 soniya ichida javob bermagan.
4. `start` — mavjud (to'xtagan) konteynerni qayta ishga tushiradi; `run` — har safar yangi konteyner yaratadi.
5. Docker xato xabari va `127` — buyruq topilmadi.

</details>

## Rasmiy hujjat

- [Running containers](https://docs.docker.com/engine/containers/run/) — fon rejimi, konteyner identifikatorlari, chiqish kodlari
- [docker container run](https://docs.docker.com/reference/cli/docker/container/run/) — `-d`, `--name`, `--rm`, `-i`, `-t`, `-e`, `--env-file`
- [Overriding container defaults](https://docs.docker.com/get-started/docker-concepts/running-containers/overriding-container-defaults/) — buyruq va muhit o'zgaruvchilari
- [docker container ls](https://docs.docker.com/reference/cli/docker/container/ls/) — holatlar · [docker container exec](https://docs.docker.com/reference/cli/docker/container/exec/) · [docker container stop](https://docs.docker.com/reference/cli/docker/container/stop/)
- [Logging](https://docs.docker.com/engine/logging/) — `docker logs`, STDOUT va STDERR

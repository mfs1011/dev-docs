# 08 — CMD va ENTRYPOINT

[← Oldingi: Birinchi Dockerfile](07-birinchi-dockerfile.md) · [Mundarija](README.md) · [Keyingi: Build kesh →](09-build-kesh.md)

## Tushuncha

Konteyner ishga tushganda qaysi buyruq bajarilishini Dockerfile'dagi ikki ko'rsatma belgilaydi:

| | `CMD` | `ENTRYPOINT` |
| --- | --- | --- |
| Vazifasi | Standart buyruq yoki `ENTRYPOINT` uchun standart argumentlar | Konteyner "dastur" sifatida — doim bajariladigan qism |
| `docker run IMAGE argumentlar` | Argumentlar `CMD` ni **almashtiradi** | Argumentlar `ENTRYPOINT` ga **qo'shiladi** |
| Almashtirish | Image nomidan keyingi so'zlar | `docker run --entrypoint` |

Bu bobning ikkinchi, muhimroq qismi — **signallar**: 4-bobda `docker stop` nega 10 soniya "qotib qolganini" va buni qanday tuzatishni ko'ramiz.

## Ikki shakl: exec va shell

Dockerfile ma'lumotnomasi: `RUN`, `CMD` va `ENTRYPOINT` ikki shaklda yoziladi:

| Shakl | Ko'rinishi | Qanday bajariladi |
| --- | --- | --- |
| **exec** | `CMD ["node", "server.js"]` | Dastur to'g'ridan-to'g'ri ishga tushadi, qobiqsiz. JSON massivi: har element alohida so'z |
| **shell** | `CMD node server.js` | Avtomatik ravishda qobiq orqali: `/bin/sh -c "node server.js"` |

Ma'lumotnoma: exec shakl qobiqning matnni o'zgartirishidan (o'zgaruvchilarni ochish va h.k.) qochadi; shell shakl esa qulayroq va o'qishga oson. Qaysi biri muhimligini signallar bo'limida ko'ramiz.

## CMD va ENTRYPOINT birga

Ma'lumotnomadagi qoidalar:

1. Dockerfile'da `CMD` yoki `ENTRYPOINT` dan kamida bittasi bo'lishi kerak.
2. Konteyner bajariladigan dastur sifatida ishlatilsa — `ENTRYPOINT`.
3. `CMD` — `ENTRYPOINT` uchun standart argumentlar yoki konteynerda bir martalik buyruq.
4. `docker run` ga argument berilsa, `CMD` almashtiriladi.

Misol (`Dockerfile.salom`):

```dockerfile
FROM alpine
ENTRYPOINT ["echo", "Salom,"]
CMD ["dunyo"]
```

```text vps
$ docker run --rm salom-sinov
Salom, dunyo
$ docker run --rm salom-sinov Toshkent
Salom, Toshkent
$ docker run --rm --entrypoint date salom-sinov
Sat Nov  7 20:26:02 UTC 2026
```

- Argumentsiz — `ENTRYPOINT` + `CMD`: `echo Salom, dunyo`.
- `Toshkent` — `CMD` ning o'rniga keldi, `ENTRYPOINT` qoldi.
- `--entrypoint date` — `ENTRYPOINT` ning o'zi almashdi.

Ma'lumotnomadagi to'liq jadval:

| | `ENTRYPOINT` yo'q | `ENTRYPOINT e p` (shell) | `ENTRYPOINT ["e", "p"]` (exec) |
| --- | --- | --- | --- |
| **`CMD` yo'q** | xato | `/bin/sh -c e p` | `e p` |
| **`CMD ["c", "x"]`** | `c x` | `/bin/sh -c e p` | `e p c x` |
| **`CMD c x`** | `/bin/sh -c c x` | `/bin/sh -c e p` | `e p /bin/sh -c c x` |

Shell shaklidagi `ENTRYPOINT` `CMD` ni ham, `docker run` argumentlarini ham **e'tiborsiz** qoldiradi.

Rasmiy image'larda ko'pincha ikkalasi bor. Node.js image'i:

```text vps
$ docker image inspect node:26-alpine --format "ENTRYPOINT={{json .Config.Entrypoint}} CMD={{json .Config.Cmd}}"
ENTRYPOINT=["docker-entrypoint.sh"] CMD=["node"]
```

`docker-entrypoint.sh` — image tayyorlagan skript, `CMD` uning argumenti. Bizning 7-bobdagi `CMD ["node", "server.js"]` faqat `CMD` ni almashtirdi: konteynerda `docker-entrypoint.sh node server.js` ishga tushadi, skript esa `node` ni o'zi bilan almashtiradi (`exec`) — quyidagi `ps` da PID 1 aynan `node`. Ma'lumotnoma ogohlantiradi: o'z Dockerfile'ingizda `ENTRYPOINT` yozsangiz, asos image'dan kelgan `CMD` bo'shatiladi — kerak bo'lsa `CMD` ni qayta yozing.

## Signallar va PID 1

`docker stop` (4-bob): konteynerning asosiy jarayoniga `SIGTERM`, kutish muddatidan keyin (Linux konteynerlarida standart 10 soniya) — `SIGKILL`. Ilova `SIGTERM` da ishini tugatishi (ochiq so'rovlarni yakunlash, bazaga ulanishni yopish) kerak; `SIGKILL` — yadro jarayonni hech narsa so'ramasdan o'ldiradi (Linux, 29-bob).

`docker run` ma'lumotnomasidagi muhim eslatma: konteynerda **PID 1** bo'lgan jarayonga Linux alohida munosabatda bo'ladi — u standart amali bo'lgan signallarni **e'tiborsiz qoldiradi**. Ya'ni jarayon kodida maxsus yozilmagan bo'lsa, u `SIGINT` yoki `SIGTERM` da to'xtamaydi.

7-bobdagi ilovada `SIGTERM` uchun hech narsa yozilmagan:

```text vps
$ docker run -d --name s1 salom-ilova:1
bf393e7e58c0d34f34a1843b2d5c76cadaba48210c1977641c3b3e51eec90591
$ docker exec s1 ps
PID   USER     TIME  COMMAND
    1 root      0:00 {node-MainThread} node server.js
   13 root      0:00 ps
$ time docker stop s1
s1

real	0m10.241s
user	0m0.018s
sys	0m0.014s
$ docker ps -a --filter name=s1 --format "{{.Names}} {{.Status}}"
s1 Exited (137) Less than a second ago
```

`node` — PID 1, `SIGTERM` e'tiborsiz qoldi, 10 soniyadan keyin `SIGKILL`: `Exited (137)` (128 + 9). Ilova ishini tugata olmadi — o'ldirildi.

<div data-animatsiya="qadamli" data-nom="pid1"></div>

### Yechim 1: `--init`

`docker run --init` — ma'lumotnoma: konteynerda PID 1 sifatida **init jarayoni** ishga tushadi; u signallarni uzatadi va tugagan bola jarayonlarni (zombi, Linux, 28-bob) tozalaydi. Docker'da bu `docker-init` — tini asosida:

```text vps
$ docker run -d --init --name s2 salom-ilova:1
b1c305b76bcfb6e963e8f648a925e7c84d9dcf9ac6f80a4b9457539979c9524b
$ docker exec s2 ps
PID   USER     TIME  COMMAND
    1 root      0:00 /sbin/docker-init -- docker-entrypoint.sh node server.js
    7 root      0:00 {node-MainThread} node server.js
   14 root      0:00 ps
$ time docker stop s2
s2

real	0m0.246s
user	0m0.017s
sys	0m0.016s
$ docker ps -a --filter name=s2 --format "{{.Names}} {{.Status}}"
s2 Exited (143) Less than a second ago
```

- PID 1 — `docker-init`, `node` — 7-PID: endi `node` PID 1 emas, standart `SIGTERM` amali ishlaydi.
- `docker stop` 0.25 soniya, `Exited (143)` — 128 + 15: `SIGTERM` bilan tugadi.

### Yechim 2: ilovaning o'zi `SIGTERM` ni ushlasin

Eng to'g'ri yo'l — ilova signalni o'zi ishlasin va **toza yopilsin**. `server.js` ga qo'shamiz:

```js
process.on('SIGTERM', () => {
  console.log('SIGTERM keldi, yopilmoqda');
  server.close(() => process.exit(0));
});
```

(`http.createServer(...)` natijasi `const server` ga saqlangan.)

```text vps
$ docker build -q -t salom-ilova:2 .
sha256:4c2fd6d8fe85cab82ad9b7781e99018827b1829a1ad125a0da426d444f6e818f
$ docker run -d --name s5 salom-ilova:2
cced4ef87adcd8bf899df288da1d8e1044d0d0d24c37a3c6bd8173dcb4ed24ed
$ sleep 1; time docker stop s5
s5

real	0m0.202s
user	0m0.021s
sys	0m0.014s
$ docker logs s5
Tinglayapti: 3000
SIGTERM keldi, yopilmoqda
$ docker ps -a --filter name=s5 --format "{{.Names}} {{.Status}}"
s5 Exited (0) Less than a second ago
$ docker rm s5
s5
```

0.2 soniya, logda xabarimiz, `Exited (0)` — ilova o'zi, muvaffaqiyatli tugadi. `server.close()` yangi ulanishlarni qabul qilmaydi va ochiqlari tugashini kutadi.

### Shell shakli bilan nima bo'ladi

Ma'lumotnoma: shell shaklida dastur `/bin/sh -c` ning bola jarayoni bo'lib ishga tushadi, `sh` esa signallarni uzatmaydi — dastur PID 1 bo'lmaydi va `docker stop` dan `SIGTERM` olmaydi.

Ikki xil asos image'da `CMD node server.js` (shell shakli) bilan sinadik. Debian asosidagi `node:26-slim`:

```text vps
$ docker run -d --name s4 sinov:shell-slim
fa3c783255255e2d78da71bd4c2e27b57b77330b92ef2a5feca544e7ba1d0e93
$ docker exec s4 ps -o pid,cmd -e
OCI runtime exec failed: exec failed: unable to start container process: exec: "ps": executable file not found in $PATH
$ time docker stop s4
s4

real	0m10.239s
user	0m0.016s
sys	0m0.015s
```

`slim` image'ida `ps` yo'q — PID 1 ni `/proc` dan o'qiymiz (Linux, 28-bob):

```text vps
$ docker run -d --name s4 sinov:shell-slim
84ae50e4cc4bce48ebf155ec38a1909414631a462fa79a4bd88e879607e96d61
$ docker exec s4 cat /proc/1/cmdline | tr '\0' ' '; echo
/bin/sh -c node server.js 
$ docker rm -f s4
s4
```

Hujjatdagidek: PID 1 — `/bin/sh -c node server.js`, `node` uning bolasi va `SIGTERM` ga yetmaydi; `stop` 10 soniya.

Alpine asosidagi `node:26-alpine` da esa:

```text vps
$ docker run -d --name s3 sinov:shell
d3b3643dac5494d227bdbec5a478ae7e13eccb45ea662b30a25508214fbb890b
$ docker exec s3 ps
PID   USER     TIME  COMMAND
    1 root      0:00 {node-MainThread} node server.js
   13 root      0:00 ps
```

Bu yerda PID 1 — `node`. Kuzatildi (rasmiy hujjatda bu holat tavsiflanmagan): Alpine'dagi `sh` (BusyBox) bitta buyruqni bajarishda o'zini o'sha dastur bilan almashtirdi. Bunga tayanmang — natija qaysi qobiq ekaniga bog'liq.

Tozalash:

```text vps
$ docker rm -f s1 s2 s3 s4
s1
s2
s3
s4
```

Xulosa:

1. `CMD` va `ENTRYPOINT` — **exec shaklida**.
2. Ilova `SIGTERM` ni ushlab, toza yopilsin.
3. Ushlay olmasa yoki bola jarayonlar ochsa — `--init` (Compose faylida servis uchun `init: true`, 15-bob).

## Tipik xatolar

**1. `CMD node server.js` (shell shakli).**
PID 1 — `/bin/sh -c`, ilova `SIGTERM` olmaydi — `docker stop` 10 soniya va `SIGKILL`.
To'g'risi: `CMD ["node", "server.js"]`.

**2. Ilovada `SIGTERM` ishlovchisi yo'q.**
PID 1 standart amalli signalni e'tiborsiz qoldiradi.
To'g'risi: `process.on('SIGTERM', …)` yoki `--init`.

**3. `ENTRYPOINT` qo'shib, asos image'dagi `CMD` ga tayanish.**
`ENTRYPOINT` yozilsa, meros `CMD` bo'shatiladi.
To'g'risi: `CMD` ni qayta yozish.

**4. Argumentlarni shell shaklidagi `ENTRYPOINT` ga uzatishni kutish.**
U `CMD` ni ham, `docker run` argumentlarini ham e'tiborsiz qoldiradi.
To'g'risi: exec shakli.

## Amaliyot

Savollar:

1. `ENTRYPOINT ["ping"]`, `CMD ["localhost"]`. `docker run IMAGE example.com` nima bajaradi?
2. Exec va shell shakli farqi nima?
3. Konteynerdagi PID 1 nega `SIGTERM` da to'xtamasligi mumkin?
4. `docker stop` dan keyin `Exited (137)` va `Exited (143)` — farqi nima?
5. Ilovaga tegmasdan `docker stop` ni tezlatish uchun nima qilasiz?

<details>
<summary>Javoblar</summary>

1. `ping example.com` — argument `CMD` ni almashtirdi.
2. Exec — dastur to'g'ridan-to'g'ri, qobiqsiz; shell — `/bin/sh -c` orqali, dastur qobiqning bolasi bo'ladi.
3. Linux PID 1 ga standart amalli signallarni yetkazmaydi — jarayon signalni o'zi ushlamasa, hech narsa bo'lmaydi.
4. 137 = 128 + 9 (`SIGKILL`, majburan o'ldirildi); 143 = 128 + 15 (`SIGTERM` bilan tugadi).
5. `docker run --init`: PID 1 — `docker-init`, u signalni ilovaga uzatadi.

</details>

## Rasmiy hujjat

- [Dockerfile reference: Shell and exec form](https://docs.docker.com/reference/dockerfile/#shell-and-exec-form) · [CMD](https://docs.docker.com/reference/dockerfile/#cmd) · [ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) — CMD va ENTRYPOINT jadvali, shell shaklining signal muammosi
- [docker container run: --init, PID 1](https://docs.docker.com/reference/cli/docker/container/run/#init) — PID 1 va init jarayoni
- [docker container stop](https://docs.docker.com/reference/cli/docker/container/stop/) — `SIGTERM`, kutish muddati, `SIGKILL`
- [Best practices](https://docs.docker.com/build/building/best-practices/) — `ENTRYPOINT`, `CMD`

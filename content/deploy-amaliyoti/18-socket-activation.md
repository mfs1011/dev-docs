# 18 — systemd socket activation

[Mundarija](README.md)

## Tushuncha

16-bobda restart paytida port **yopiq** edi — ulanishlar rad etildi. Agar portni ilova emas, **systemd** ochib tursa-chi? Ilova qayta ishga tushayotganda port ochiq qoladi, kelgan ulanishlar **navbatda kutadi**.

SD (daemon(7), Socket-Based Activation): socket orqali ishlaydigan barcha yangi demonlar uchun **socket asosida faollashtirish** tavsiya etiladi. Tinglovchi socket'ni yaratish va bog'lash (bind) demon kodidan **servis menejeriga** ko'chiriladi: menejer socket'larni o'rnatadi va demon ishga tushganda ularni unga beradi. Natijada demonlar mijoz so'rovlaridan juda kam qismini yo'qotib, **yoki birortasini ham yo'qotmasdan** qayta ishga tushirilishi mumkin (ikkinchisi ayniqsa DNS, syslog kabi holatsiz protokollar uchun to'g'ri): restart paytida socket bog'langan va ochiq qoladi, demon ishlov bera olmagan barcha so'rovlar **navbatga** turadi.

```text
              systemd ── :8100 (doim ochiq)
                 │
 eski ilova ─────┘ to'xtadi    ← ulanishlar navbatda kutadi
 yangi ilova ────── socket'ni oldi, navbatdagilarga javob beradi
```

### Qanday ishlaydi

| Qism | Nima (SD) |
| --- | --- |
| `.socket` unit | `ListenStream=127.0.0.1:8100` — systemd shu manzilni tinglaydi (systemd.socket(5)) |
| `.service` unit | Xuddi shu nom bilan (`ilova18.socket` → `ilova18.service`), `Accept=no` (standart) bo'lsa |
| Socket uzatish | sd_listen_fds(3): birinchi uzatilgan fayl deskriptori — **3** (`SD_LISTEN_FDS_START`), keyingilari 4, 5, … ; muhitda — `LISTEN_FDS`, `LISTEN_PID` |
| Restart | Socket qayta ochilmaydi — yangi jarayon **o'sha** socket'ning nusxasini oladi (sd_listen_fds(3)) |
| Navbat hajmi | `Backlog=` — hali qabul qilinmagan ulanishlar soni; amalda `net.core.somaxconn` (odatda 4096) bilan cheklanadi (systemd.socket(5)) |

Ilova portni **o'zi ochmasligi** kerak — socket'ni 3-deskriptordan olishi lozim. Ko'p frameworklar buni qo'llaydi; bu yerda — Python standart kutubxonasi bilan qo'lda.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). Ilova — 16-bobdagi kabi, ishga tushishi 2 soniya; farqi — socket'ni systemd'dan oladi:

```python
# Socket activation bilan ilova: portni o'zi ochmaydi, systemd'dan oladi
import http.server, os, socket, time
time.sleep(2)  # ishga tushish vaqti (16-bobdagi kabi)
versiya = open("/srv/ilova18/versiya").read().strip()
# sd_listen_fds(3): uzatilgan birinchi fayl deskriptori — 3
assert os.environ.get("LISTEN_PID") == str(os.getpid()) and os.environ.get("LISTEN_FDS") == "1"
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(versiya.encode())
    def log_message(self, *a): pass
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H, bind_and_activate=False)
server.socket.close()
server.socket = socket.socket(fileno=3)
server.serve_forever()
```

Ikki unit:

```ini
[Unit]
Description=Deploy kitobi: 18-bob socket

[Socket]
ListenStream=127.0.0.1:8100
```

```ini
[Unit]
Description=Deploy kitobi: 18-bob ilova

[Service]
DynamicUser=yes
ExecStart=/usr/bin/python3 /srv/ilova18/ilova.py
```

Yuk skripti — 16-bobdagi, qo'shimcha ravishda **eng uzoq javob** vaqtini ko'rsatadi.

### Faqat socket ishga tushirildi

```text vps
$ install -d /srv/ilova18; install -m 644 /root/ilova.py /srv/ilova18/; echo v1 > /srv/ilova18/versiya; mv /root/ilova18.socket /root/ilova18.service /etc/systemd/system/; rm /root/ilova.py; systemctl daemon-reload; systemctl start ilova18.socket; systemctl is-active ilova18.socket ilova18.service; ss -ltnp | grep ':8100 ' | grep -oE 'LISTEN|127\.0\.0\.1:8100|users:\(\("[a-z]+"' | tr '\n' ' '; echo
active
inactive
LISTEN 127.0.0.1:8100 users:(("systemd" 
```

Servis hali ishlamayapti (`inactive`), lekin 8100-portni `systemd` tinglayapti.

### Birinchi so'rov

```text vps
$ curl -s -w ' %{time_total}s\n' http://127.0.0.1:8100/; systemctl is-active ilova18.service; ss -ltnp | grep ':8100 ' | grep -oE 'users:.*' | sed -E 's/pid=[0-9]+/pid=…/g'
v1 2.130526s
active
users:(("python3",pid=…,fd=3),("systemd",pid=…,fd=80))
```

Birinchi ulanish servisni **ishga tushirdi** (ilova ishga tushguncha 2.13 s kutdi); endi socket'ni ikkalasi ushlab turibdi — `systemd` va `python3` (`fd=3`).

### Uzluksiz so'rovlar ostida restart

16-bobdagi sinov — 8 soniya so'rov, 2-soniyada versiya `v2` va `systemctl restart`:

```text vps
$ (sleep 2; echo v2 > /srv/ilova18/versiya; systemctl restart ilova18.service) & python3 /root/yuk.py http://127.0.0.1:8100/ 8; wait
200 v1: 158
200 v2: 326
eng uzoq javob: 2.11s
```

- **Xato — 0** (16-bobda shu sharoitda 183 ta 502).
- Eng uzoq javob — **2.11 s**: restart paytidagi so'rov rad etilmadi, ilova tayyor bo'lguncha **kutdi**.
- Kuzatildi: to'xtash yo'qolmadi — **kutishga** aylandi. Ilova sekin ishga tushsa, mijozlar shuncha kutadi; mijoz yoki nginx timeout'i shundan qisqa bo'lsa — xato bo'ladi.

### Servis to'xtatilsa

```text vps
$ systemctl stop ilova18.service; systemctl is-active ilova18.service ilova18.socket; echo v3 > /srv/ilova18/versiya; curl -s -w ' %{time_total}s\n' http://127.0.0.1:8100/
Stopping 'ilova18.service', but its triggering units are still active:
ilova18.socket
inactive
active
v3 2.120041s
```

systemd ogohlantiradi: servisni ishga tushiruvchi socket hali faol. Keyingi ulanish servisni **qayta** ishga tushirdi (yangi versiya `v3`).

```text vps
$ systemctl stop ilova18.socket ilova18.service; curl -s -o /dev/null -w '%{http_code} ' http://127.0.0.1:8100/; echo "kod: $?"
000 kod: 7
```

Socket ham to'xtatildi — endi ulanish rad etiladi (`curl` kodi 7 — ulana olmadi).

```text vps
$ rm -rf /etc/systemd/system/ilova18.socket /etc/systemd/system/ilova18.service /srv/ilova18 /root/yuk.py; systemctl daemon-reload; echo tozalandi
tozalandi
```

## Variantlar

| Usul | Xato | Kamchiligi |
| --- | --- | --- |
| Oddiy restart (16-bob) | 183 (sinovda) | — |
| Ikki nusxa + nginx (17-bob) | 0 | Ikki baravar resurs, skript |
| Socket activation (shu bob) | 0 | Restart paytida so'rovlar kutadi (2.11 s); ilova socket'ni fd 3 dan olishi kerak; buzuq versiya ishga tushmasa — ulanishlar kutib, xato bilan tugaydi |

17-bobda buzuq versiya trafikka umuman chiqmagan edi; socket activation'da esa eski jarayon allaqachon to'xtagan bo'ladi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ilova portni o'zi ham ochishga urinadi | Port band (systemd ushlab turibdi) | Socket'ni fd 3 dan olish (sd_listen_fds) |
| Socket'ni `shutdown(2)` qilish | systemd'dagi nusxa ham yopiladi (sd_listen_fds) | Faqat `close` |
| Faqat `.service` ni to'xtatib, port yopildi deb o'ylash | Socket servisni qayta ishga tushiradi (sinovda) | `.socket` ni ham to'xtatish |
| Uzoq ishga tushadigan ilova, qisqa timeout | Kutayotgan so'rovlar timeout bilan tugaydi | Ishga tushishni tezlashtirish yoki 17-bob |
| "Socket activation — har doim nol xato" | Kutish vaqti va buzuq versiya muammosi qoladi | O'lchash |

## Amaliyot

1. Socket activation'da portni kim ochadi?
2. Ilova socket'ni qayerdan oladi?
3. Restart paytida kelgan ulanishlar bilan nima bo'ladi?
4. Sinovda 16-bobga nisbatan nima o'zgardi?
5. Faqat servis to'xtatilsa, keyingi ulanish nima qiladi?
6. Socket activation 17-bobdagi usuldan nimasi bilan zaifroq?

<details>
<summary>Javoblar</summary>

1. systemd (servis menejeri), `.socket` unit bo'yicha.
2. Fayl deskriptori 3 dan (`SD_LISTEN_FDS_START`).
3. Navbatda kutadi, yangi jarayon ularga javob beradi.
4. Xato 183 dan 0 ga tushdi; eng uzoq javob 2.11 s bo'ldi.
5. Servisni qayta ishga tushiradi.
6. Restart paytida so'rovlar kutadi; yangi versiya buzuq bo'lsa, eskisi allaqachon to'xtagan.

</details>

## Rasmiy hujjat

- [SD: daemon(7)](https://www.freedesktop.org/software/systemd/man/latest/daemon.html) — Socket-Based Activation
- [SD: systemd.socket(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.socket.html) — ListenStream, Accept, Backlog
- [SD: sd_listen_fds(3)](https://www.freedesktop.org/software/systemd/man/latest/sd_listen_fds.html)

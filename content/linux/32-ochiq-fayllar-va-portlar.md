# 32 — Ochiq fayllar va portlar

[← Oldingi: Resurslar](31-resurslar.md) · [Mundarija](README.md) · [Keyingi: Server qanday yonadi →](33-server-qanday-yonadi.md)

## Tushuncha

Linux'da tarmoq ulanishi ham fayl (9-bob): jarayon portni tinglaganda yoki ulanish ochganda, uning ochiq fayllar ro'yxatida **soket** (socket) paydo bo'ladi. Shuning uchun "bu faylni kim ushlab turibdi?" va "bu portni kim tinglayapti?" — bitta savolning ikki ko'rinishi.

| Savol | Buyruq |
| --- | --- |
| Qaysi portlarni kim tinglayapti | `ss -tlnp` |
| Bu portni / faylni qaysi jarayon ishlatyapti | `fuser -v`, `lsof` |
| Bu jarayon qaysi fayllarni ochgan | `lsof -p PID` |

Ilovani ishga tushirganda `Address already in use` (port band) xatosi chiqsa, aynan shu buyruqlar bilan aybdorni topasiz.

## Port tinglash va `ss`

Trenajorda kichik server ishga tushiramiz. Buning uchun systemd tarkibidagi `systemd-socket-activate` dan foydalanamiz. Man sahifasiga ko'ra u socket orqali ishga tushadigan servisni buyruq qatoridan, sinov uchun ishga tushiradi:

- `-l 8080` — 8080-portni tinglash;
- `-a --inetd cat` — har bir ulanish uchun alohida `cat` ishga tushirish. Ulanish `cat` ning stdin/stdout'iga bog'lanadi, ya'ni server yuborilgan matnni qaytaradi;
- `2>/dev/null` — uning xizmat xabarlarini (stderr, 11-bob) yashiramiz, ular terminalda buyruqlar orasiga aralashmasin.

```text
$ cd /tmp
$ systemd-socket-activate -l 8080 -a --inetd cat 2>/dev/null &
[1] 177
$ sleep 1
$ ss -tlnp
State      Recv-Q     Send-Q         Local Address:Port           Peer Address:Port     Process     
LISTEN     0          0                          *:8080                      *:*         users:(("systemd-socket-",pid=177,fd=3))
```

ss(8) bayroqlari:

| Bayroq | Ma'nosi |
| --- | --- |
| `-t` | TCP soketlar |
| `-u` | UDP soketlar |
| `-l` | Faqat tinglayotganlar (listening) — standart holatda ko'rsatilmaydi |
| `-n` | Port va manzillarni nomga aylantirmaslik (`22`, `ssh` emas) |
| `-p` | Soketni ishlatayotgan jarayon |
| `-a` | Hammasi: tinglayotgan va o'rnatilgan ulanishlar |

Ustunlar: `State` — holat (`LISTEN` — tinglayapti), `Local Address:Port` — qaysi manzil va portda, `Process` — kim. `*:8080` — barcha manzillarda (IPv4 va IPv6). `0.0.0.0` va `127.0.0.1` farqi — 40-bobda.

Boshqa foydalanuvchilarning jarayonini `-p` faqat root'ga ko'rsatadi. VPS'da oddiy foydalanuvchi (`nobody`) nomidan:

```text vps
$ runuser -u nobody -- ss -tlnp 'sport = :22'
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      4096         0.0.0.0:22        0.0.0.0:*          
LISTEN 0      4096            [::]:22           [::]:*
```

Port ko'rinadi, `Process` ustuni esa bo'sh. Serverda shuning uchun `sudo ss -tlnp`.

## "Port band": `Address already in use`

Xuddi shu portda ikkinchi server ochishga urinamiz:

```text
$ systemd-socket-activate -l 8080 cat
Failed to listen on [::]:8080: Address already in use
Failed to open '8080': Address already in use
```

Port allaqachon band. Haqiqiy serverda ham xuddi shunday. VPS'da 22-portda (SSH) Python'ning oddiy veb-serverini ochishga urinamiz:

```text vps
$ timeout 3 python3 -m http.server 22 2>&1 | tail -n 3
    self.socket.bind(self.server_address)
    ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
OSError: [Errno 98] Address already in use
```

Python xatoni `[Errno 98] Address already in use` deb berdi. Boshqa dasturlarda so'zlar boshqacha bo'ladi, lekin sababi bitta: port band.

## Aybdorni topish: `ss`, `fuser`, `lsof`

Bitta port bo'yicha `ss` filtri (ss(8)):

```text
$ ss -tlnp 'sport = :8080'
State      Recv-Q     Send-Q         Local Address:Port           Peer Address:Port     Process     
LISTEN     0          0                          *:8080                      *:*         users:(("systemd-socket-",pid=177,fd=3))
$ fuser -v 8080/tcp
                     USER        PID ACCESS COMMAND
8080/tcp:            root        177 F.... systemd-socket-
$ lsof -nP -i :8080
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
systemd-s 177 root    3u  IPv6  11385      0t0  TCP *:8080 (LISTEN)
```

- **fuser** (fuser(1)) — fayl yoki soketni ishlatayotgan jarayonlarning PID'ini ko'rsatadi; `-v` — `ps` ga o'xshash batafsil ko'rinish. `8080/tcp` — "TCP 8080-port" degani. Debian Reference ham `fuser -v` ni portni qaysi jarayon ushlab turganini topish uchun ko'rsatadi.
- **lsof** (lsof(8)) — ochiq fayllar ro'yxati. `-i :8080` — shu portga tegishli tarmoq fayllari; `-n` va `-P` — manzil va portni nomga aylantirmaslik.

### Ulanish ham ko'rinadi

bash qo'llanmasiga ko'ra `/dev/tcp/host/port` ga yo'naltirish TCP ulanish ochadi. O'z serverimizga ulanib, matn yuboramiz:

```text
$ exec 3<>/dev/tcp/127.0.0.1/8080
$ echo salom >&3
$ head -n 1 <&3
salom
$ ss -tnp 'sport = :8080 or dport = :8080'
State     Recv-Q     Send-Q              Local Address:Port                  Peer Address:Port      Process                                                                                             
ESTAB     0          0                       127.0.0.1:43326                    127.0.0.1:8080       users:(("ss",pid=190,fd=3),("bash",pid=167,fd=3))                                                  
ESTAB     0          0              [::ffff:127.0.0.1]:8080            [::ffff:127.0.0.1]:43326      users:(("cat",pid=188,fd=1),("cat",pid=188,fd=0))                                                  
$ lsof -nP -i :8080
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
bash      167 root    3u  IPv4  12105      0t0  TCP 127.0.0.1:43326->127.0.0.1:8080 (ESTABLISHED)
systemd-s 177 root    3u  IPv6  11385      0t0  TCP *:8080 (LISTEN)
cat       188 root    0u  IPv6  12106      0t0  TCP 127.0.0.1:8080->127.0.0.1:43326 (ESTABLISHED)
cat       188 root    1u  IPv6  12106      0t0  TCP 127.0.0.1:8080->127.0.0.1:43326 (ESTABLISHED)
$ exec 3>&-
```

- `exec 3<>...` — qobiq (shell) 3-deskriptorni (11-bob) ulanishga bog'ladi. `salom` ni yubordik va server (`cat`) uni qaytardi.
- `ESTAB` — o'rnatilgan ulanish. Bitta ulanishning ikki uchi bor: `bash` (mijoz, tasodifiy port) va `cat` (server tomoni, 8080-port).
- Mijoz qatorida `ss` ning o'zi ham bor: u bash'dan fork qilinganda ochiq 3-deskriptorni meros qilib oldi (28-bob).
- `lsof` uchala ishtirokchini ko'rsatadi: tinglayotgan `systemd-socket-activate` (`LISTEN`), server tomonidagi `cat` va mijoz `bash` (`ESTABLISHED`).
- `exec 3>&-` — deskriptorni yopish, ya'ni ulanishni uzish.

## Fayllar: `lsof -p` va `fuser`

Jarayon ochgan fayllar — Debian Reference'dagi misol `lsof -p 1` (PID 1):

```text
$ lsof -p $$ | head -n 6
COMMAND PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
bash    167 root  cwd    DIR   0,29      140    1 /tmp
bash    167 root  rtd    DIR   0,20        0    3 /
bash    167 root  txt    REG   0,20  1408088  322 /usr/bin/bash
bash    167 root  mem    REG   0,20   353616 2055 /usr/lib/locale/C.utf8/LC_CTYPE
bash    167 root  mem    REG   0,20       50 2060 /usr/lib/locale/C.utf8/LC_NUMERIC
$ fuser -v /tmp
                     USER        PID ACCESS COMMAND
/tmp:                root     kernel mount /tmp
                     root        167 ..c.. bash
                     root        177 ..c.. systemd-socket-
```

`lsof` dagi `FD` ustuni: `cwd` — joriy papka, `rtd` — ildiz papka, `txt` — dastur fayli, `mem` — xotiraga yuklangan fayl (kutubxona), `3u` kabi raqam — ochiq deskriptor (`u` — o'qish va yozish).

`fuser` dagi `ACCESS` belgilari (fuser(1)): `c` — joriy papka, `e` — ishlayotgan dastur, `f`/`F` — ochiq fayl (o'qish/yozish uchun), `m` — xotiraga yuklangan fayl yoki kutubxona. `/tmp` da bash'ning joriy papkasi bor (`c`) — shu tufayli, masalan, diskni `umount` qilib bo'lmasligi mumkin ("device is busy", 10-bob).

O'chirilgan, lekin hali ochiq turgan fayllarni topish (`lsof +L1`) — 10-bobda ko'rgandik.

## Jarayonni to'xtatish: `fuser -k`

fuser(1): `-k` — faylni yoki portni ishlatayotgan jarayonlarni o'ldiradi, **standart holatda SIGKILL bilan**. 29-bobdagi qoida bo'yicha avval SIGTERM:

```text
$ fuser -k -TERM 8080/tcp
8080/tcp:              177
$ sleep 1
[1]+  Terminated              systemd-socket-activate -l 8080 -a --inetd cat 2> /dev/null
$ ss -tlnp 'sport = :8080'
State     Recv-Q     Send-Q          Local Address:Port           Peer Address:Port     Process     
```

8080-port bo'shadi.

> Serverda `fuser -k` dan oldin `fuser -v` bilan **kimlar** ro'yxatga tushishini ko'ring. VPS'da `fuser -v 22/tcp` ning ro'yxatida `sshd` va barcha SSH sessiyalari bor: `fuser -k 22/tcp` sizni ham serverdan uzadi.

## Ubuntu'da SSH porti: socket activation

VPS'da tinglayotgan portlar:

```text vps
$ ss -tlnp
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                                                  
LISTEN 0      4096      127.0.0.54:53        0.0.0.0:*    users:(("systemd-resolve",pid=30485,fd=20))             
LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=30485,fd=18))             
LISTEN 0      4096         0.0.0.0:22        0.0.0.0:*    users:(("sshd",pid=30495,fd=3),("systemd",pid=1,fd=142))
LISTEN 0      4096            [::]:22           [::]:*    users:(("sshd",pid=30495,fd=4),("systemd",pid=1,fd=143))
$ ss -ulnp
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                                     
UNCONN 0      0         127.0.0.54:53        0.0.0.0:*    users:(("systemd-resolve",pid=30485,fd=19))
UNCONN 0      0      127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=30485,fd=17))
UNCONN 0      0          127.0.0.1:323       0.0.0.0:*    users:(("chronyd",pid=766,fd=4))           
UNCONN 0      0              [::1]:323          [::]:*    users:(("chronyd",pid=766,fd=5))           
```

- `53` — systemd-resolved (DNS, 42-bob), faqat `127.0.0.53`/`127.0.0.54` da: tashqaridan yetib bo'lmaydi.
- `323/udp` — chronyd (vaqt sinxronizatsiyasi, 44-bob), faqat `127.0.0.1` da.
- `22` — SSH. Uni `sshd` dan tashqari **systemd (PID 1)** ham ushlab turibdi.

Sababi:

```text vps
$ systemctl status ssh.socket --no-pager | head -n 8
● ssh.socket - OpenBSD Secure Shell server socket
     Loaded: loaded (/usr/lib/systemd/system/ssh.socket; enabled; preset: enabled)
     Active: active (running) since Thu 2026-11-05 09:23:45 MSK; 1 day 22h ago
 Invocation: f355780aff9b4c79bf1defd793a7b958
   Triggers: ● ssh.service
     Listen: 0.0.0.0:22 (Stream)
             [::]:22 (Stream)
      Tasks: 0 (limit: 846)
```

Portni `ssh.socket` unit'i tinglaydi va ulanish kelganda `ssh.service` ni ishga tushiradi (`Triggers`). Bu — systemd'ning **socket orqali ishga tushirish** (socket activation) imkoniyati. Unit turlari 33-bobda.

> VPS provayder shablonida `lsof` va `fuser` (`psmisc` paketi) yo'q edi — `apt install lsof psmisc` bilan o'rnatildi. `ss` (iproute2) bor edi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `ss` (iproute2) | 6.1.0 | 6.19.0 |
| `lsof` | 4.95.0 | 4.99.4 (shablonda yo'q edi) |
| `fuser` (psmisc) | 23.6 | 23.7 (shablonda yo'q edi) |
| SSH porti | — (trenajorda SSH yo'q) | `ssh.socket` → `ssh.service` |

## Tipik xatolar

**1. `sudo` siz `ss -p` yoki `lsof`.**
Boshqa foydalanuvchining jarayonlari ko'rinmaydi — port "hech kimniki"dek tuyuladi.
To'g'risi: `sudo ss -tlnp`.

**2. `fuser -k` ni tekshirmasdan.**
Standart signal — SIGKILL, ro'yxatda kutilmagan jarayonlar bo'lishi mumkin.
To'g'risi: avval `fuser -v`, keyin `fuser -k -TERM`.

**3. "Port band" bo'lsa, boshqa portga o'tib ketish.**
Eski nusxa ishlab qolgan bo'lishi mumkin (masalan, `nohup` bilan qolgan, 30-bob) — u eski kod bilan javob berayotgan bo'ladi.
To'g'risi: `ss -tlnp 'sport = :PORT'` bilan aybdorni topish.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=32-port)** "Port kimniki": port tinglaydigan jarayon ochasiz, "port band" xatosini ko'rasiz, aybdorni uch xil buyruq bilan topasiz va to'xtatasiz.

Savollar:

1. 3000-portni qaysi jarayon tinglayotganini qanday bilasiz?
2. `ss -tln` da `127.0.0.1:5432` va `0.0.0.0:5432` farqi nima?
3. `fuser -k 8080/tcp` qaysi signalni yuboradi?
4. VPS'da 22-portni nega PID 1 (systemd) ham tinglayapti?

<details>
<summary>Javoblar</summary>

1. `sudo ss -tlnp 'sport = :3000'`, `sudo fuser -v 3000/tcp` yoki `sudo lsof -nP -i :3000`.
2. `127.0.0.1` — faqat serverning o'zidan ulanish mumkin, `0.0.0.0` — barcha IPv4 manzillarda (tashqaridan ham) tinglaydi (40-bob).
3. SIGKILL (fuser(1): `-SIGNAL` berilmasa).
4. `ssh.socket` unit'i portni tinglaydi va ulanish kelganda `ssh.service` ni ishga tushiradi.

</details>

## Rasmiy hujjat

- [Debian Reference 9.4.5 — Listing files opened by a process](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_listing_files_opened_by_a_process)
- [Debian Reference 9.4.7 — Finding processes using files or sockets](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_finding_processes_using_files_or_sockets)
- [ss(8) — man7.org](https://man7.org/linux/man-pages/man8/ss.8.html)
- [lsof(8) — Debian bookworm](https://manpages.debian.org/bookworm/lsof/lsof.8.en.html)
- [fuser(1) — man7.org](https://man7.org/linux/man-pages/man1/fuser.1.html)
- [GNU Bash: Redirections (/dev/tcp)](https://www.gnu.org/software/bash/manual/bash.html#Redirections)
- Trenajorda: `man ss`, `man lsof`, `man fuser`

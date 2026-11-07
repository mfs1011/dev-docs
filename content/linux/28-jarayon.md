# 28 — Jarayon nima

[← Oldingi: Avtomatik yangilanishlar](27-avtomatik-yangilanish.md) · [Mundarija](README.md) · [Keyingi: Signallar →](29-signallar.md)

## Tushuncha

**Dastur** — diskdagi fayl, masalan `/usr/bin/sleep`. **Jarayon** (process) — ishga tushirilgan dastur: xotirada turgan, o'z raqami, egasi va holati bor nusxa. Bitta dasturdan bir vaqtda o'nlab jarayon ishlashi mumkin.

Har jarayonning asosiy belgilari (credentials(7)):

| Belgi | Ma'nosi |
| --- | --- |
| **PID** | Jarayon raqami (process ID). Jarayon yaratilganda beriladi, takrorlanmaydi |
| **PPID** | Ota jarayon raqami (parent PID): bu jarayonni kim yaratgan |
| **UID / GID** | Qaysi foydalanuvchi va guruh nomidan ishlayapti — fayl ruxsatlari (7-bob) shunga qarab tekshiriladi |

Serverda ilova "ishlamayapti", "sekin", "xotirani yeb qo'ydi" degan har bir muammo shu yerdan boshlanadi: avval qaysi jarayon ekanini topasiz.

## O'zingizning jarayoningiz

```text
$ echo $$; echo $PPID
167
157
$ ps
  PID TTY          TIME CMD
  157 ttyS0    00:00:00 login
  167 ttyS0    00:00:01 bash
  184 ttyS0    00:00:00 ps
```

- `$$` — joriy qobiq (shell) PID'i, `$PPID` — uning otasi (13-bob).
- `ps` argumentsiz — shu terminaldagi jarayonlar. `ps` ning o'zi ham ro'yxatda: u ham jarayon.

Kerakli ustunlarni `-o` bilan tanlaysiz:

```text
$ ps -o pid,ppid,user,stat,cmd
  PID  PPID USER     STAT CMD
  157     1 root     Ss   /bin/login -f
  167   157 root     S    -bash
  185   167 root     R+   ps -o pid,ppid,user,stat,cmd
```

Zanjir: `ps` (185) → otasi `bash` (167) → otasi `login` (157) → otasi PID 1.

## Barcha jarayonlar

Debian Reference ikki uslubni ko'rsatadi:

```text
$ ps aux | head -n 4
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1 20.0  4.6  37208 10580 ?        Ss   12:11   0:05 /sbin/init
root         2  0.0  0.0      0     0 ?        S    12:11   0:00 [kthreadd]
root         3  0.0  0.0      0     0 ?        I<   12:11   0:00 [rcu_gp]
$ ps -ef | head -n 6
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0 20 12:11 ?        00:00:05 /sbin/init
root         2     0  0 12:11 ?        00:00:00 [kthreadd]
root         3     2  0 12:11 ?        00:00:00 [rcu_gp]
root         4     2  0 12:11 ?        00:00:00 [rcu_par_gp]
root         5     2  0 12:11 ?        00:00:00 [slub_flushwq]
```

| Buyruq | Uslub | Nimasi bilan qulay |
| --- | --- | --- |
| `ps aux` | BSD | `%CPU`, `%MEM`, `RSS` (xotira) — kim resurs yeyapti (31-bob) |
| `ps -ef` | System V | `PPID` — kim kimni yaratgan |

- `TTY` da `?` — terminalga bog'lanmagan jarayon: servislar shunday ishlaydi.
- `[kthreadd]` kabi kvadrat qavsdagilar — yadroning o'z ichki oqimlari (kernel threads), dastur fayli yo'q.
- `aux` dagi `a`, `u`, `x` — tire **siz**. ps(1) man sahifasiga ko'ra `ps -aux` — `ps aux` emas: standart bo'yicha u "`x` nomli foydalanuvchining jarayonlari" degani. Bunday foydalanuvchi bo'lmasa, ps taxmin qilib `ps aux` ni bajaradi, lekin bunga tayanmaslik kerak.

### `STAT`: jarayon holati

ps(1) man sahifasidagi asosiy holatlar:

| Belgi | Ma'nosi |
| --- | --- |
| `R` | Ishlayapti yoki navbatda |
| `S` | Uxlayapti: biror hodisani kutyapti (ko'p jarayonlar shu holatda) |
| `D` | Uzib bo'lmaydigan kutish (odatda disk yoki tarmoq I/O) |
| `T` | To'xtatilgan (Ctrl+Z, 30-bob) |
| `Z` | **Zombi**: tugagan, lekin otasi hali uning natijasini olmagan |
| `I` | Bo'sh turgan yadro oqimi |

Qo'shimcha belgilar: `s` — sessiya boshlig'i, `+` — terminalning oldingi planidagi (foreground) jarayon, `<` — yuqori ustuvorlik, `N` — past ustuvorlik (31-bob), `l` — ko'p oqimli.

Zombi allaqachon tugagan; ular ko'paysa — ota jarayon bolalarining natijasini olmayapti. Debian Reference'ga ko'ra zombilarni otasini (PPID) to'xtatib tozalash mumkin.

## Jarayon daraxti: `pstree`

```text
$ pstree -p | head -n 15
systemd(1)-+-agetty(156)
           |-cron(151)
           |-dbus-daemon(152)
           |-login(157)---bash(167)-+-head(192)
           |                        `-pstree(191)
           |-systemd-journal(125)
           |-systemd-logind(154)
           `-systemd-udevd(136)
```

Hamma jarayon **PID 1** dan o'sib chiqadi. Trenajorda va ko'p zamonaviy tizimlarda bu `systemd`:

```text
$ tr '\0' ' ' < /proc/1/cmdline; echo
/sbin/init 
$ readlink /proc/1/exe
/usr/lib/systemd/systemd
```

`ps` uni `/sbin/init` deb ko'rsatadi (shu nom bilan ishga tushirilgan), aslida esa bu systemd. systemd — VIII qismda.

> Ubuntu VPS shablonida `pstree` yo'q (`psmisc` paketi o'rnatilmagan). U yerda `ps -ef --forest` yoki `ps -ejH` ishlating.

## Jarayon qanday tug'iladi: fork va exec

Siz `ls` yozsangiz, bash o'zi `ls` ga aylanmaydi. Ikki qadam bo'ladi:

1. **fork** — bash o'zidan **nusxa** oladi. fork(2): "chaqirgan jarayonni nusxalab, yangi jarayon yaratadi". Nusxa — bola: PID'i yangi, PPID'i — bash'niki.
2. **exec** — bola jarayon o'zidagi dasturni `ls` ga **almashtiradi**. execve(2): joriy dastur yangisiga almashtiriladi, xotirasi yangidan tuziladi, **PID esa saqlanadi**.

Bosqichma-bosqich:

<div data-animatsiya="qadamli" data-nom="fork-exec"></div>

Trenajorda ikkala holatni ko'ramiz:

```text
$ bash -c 'echo "bash PID: $$"; ps -o pid,ppid,cmd --ppid $$; true'
bash PID: 177
  PID  PPID CMD
  178   177 ps -o pid,ppid,cmd --ppid 177
$ bash -c 'echo "bash PID: $$"; exec ps -o pid,ppid,cmd -p $$'
bash PID: 284
  PID  PPID CMD
  284   167 ps -o pid,ppid,cmd -p 284
```

- Birinchisida `ps` — bash'ning bolasi: yangi PID (178), otasi bash (177). fork + exec.
- Ikkinchisida `exec` — fork **yo'q**. bash'ning o'z jarayoni (284) `ps` ga aylandi: PID o'sha-o'sha, otasi ham o'sha (167).

credentials(7) ham shuni aytadi: PID va PPID `execve` dan keyin saqlanadi. Ishga tushirish skriptlarining oxirida `exec node server.js` kabi qatorni shuning uchun ko'rasiz: ilova skriptning o'rnini egallaydi va uning PID'ini oladi. Bu signallar (29-bob) uchun nega muhimligini keyingi bobda sinab ko'ramiz.

## `/proc/<pid>`: jarayon ichidan

Har jarayon uchun `/proc` da (9-bob) uning PID'i nomli papka bor:

```text
$ ls /proc | head -n 5
1
10
11
12
125
$ cat /proc/$$/status | head -n 10
Name:	bash
Umask:	0022
State:	S (sleeping)
Tgid:	167
Ngid:	0
Pid:	167
PPid:	157
TracerPid:	0
Uid:	0	0	0	0
Gid:	0	0	0	0
$ readlink /proc/$$/exe /proc/$$/cwd
/usr/bin/bash
/root
```

Foydali fayllar:

| Fayl | Nima bor |
| --- | --- |
| `status` | Nomi, holati, PID, PPID, UID/GID, xotira |
| `cmdline` | To'liq buyruq qatori (argumentlar `\0` bilan ajratilgan) |
| `exe` | Qaysi dastur fayli ishlayapti (havola) |
| `cwd` | Jarayonning joriy papkasi (havola) |
| `environ` | Muhit o'zgaruvchilari (13-bob) |
| `fd/` | Ochiq fayllar (32-bob) |

### UID: jarayon kim nomidan ishlaydi

```text
$ grep -E '^(Uid|Gid)' /proc/$$/status
Uid:	0	0	0	0
Gid:	0	0	0	0
$ runuser -u nobody -- grep -E '^(Uid|Gid)' /proc/self/status
Uid:	65534	65534	65534	65534
Gid:	65534	65534	65534	65534
```

proc(5) ga ko'ra to'rt ustun: haqiqiy (real), samarali (effective), saqlangan (saved set) va fayl tizimi (filesystem) UID'lari. credentials(7) ga ko'ra Linux fayl ruxsatlarini **fayl tizimi** UID'i bo'yicha tekshiradi, u esa odatda samarali UID bilan bir xil. Ko'pincha to'rttalasi teng. setuid dasturlarda (8-bob, `passwd`) samarali UID root bo'ladi, haqiqiysi esa ishga tushirgan foydalanuvchi qoladi.

`/proc/self` — o'qiyotgan jarayonning o'zi. Ikkinchi buyruqda `grep` `nobody` nomidan ishladi, shuning uchun 65534.

Kim nomidan nechta jarayon ishlayapti:

```text
$ ps -eo user | sort | uniq -c | sort -rn
     55 root
      1 messagebus
      1 USER
```

(`USER` — `ps` sarlavhasi.) VPS'da:

```text vps
$ ps -eo user | sort | uniq -c | sort -rn | head -5
    132 root
      2 _chrony
      1 systemd-resolve
      1 syslog
      1 sshd
```

Servislar o'z foydalanuvchilari nomidan ishlaydi (22-bob): `_chrony`, `systemd-resolve`, `syslog`.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `ps` | procps-ng 4.0.2 | procps-ng 4.0.4 |
| `pstree` | Bor (psmisc) | Shablonda yo'q |
| PID 1 | systemd | systemd |

`ps` rust-coreutils'ga kirmaydi: ikkala tizimda ham procps-ng.

## Tipik xatolar

**1. `ps aux | grep ...` natijasida `grep` ning o'zini ko'rish.**

```text
$ ps aux | grep systemd-logind
root       154  4.6  2.9  17056  6640 ?        Ss   12:14   0:00 /lib/systemd/systemd-logind
root       268 20.0  0.8   4056  1892 ttyS0    S+   12:14   0:00 grep systemd-logind
```

`grep` ham jarayon va uning buyruq qatorida qidirilayotgan so'z bor. Skriptda "jarayon ishlayaptimi?" tekshiruvi shundan doim "ha" deydi.
To'g'risi: `pgrep -a systemd-logind` (29-bob) yoki `ps -C systemd-logind`.

**2. `ps -aux` yozish.**
To'g'risi: `ps aux` (tiresiz) yoki `ps -ef`.

**3. Zombilarni `kill -9` bilan o'ldirishga urinish.**
Zombi allaqachon tugagan. Sabab — otasi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=28-jarayon)** "Jarayonlar oilasi": jarayonlarni topasiz, otasini aniqlaysiz va `/proc` dan ma'lumot o'qiysiz.

Savollar:

1. Dastur va jarayonning farqi nima?
2. Siz terminalda `sleep 100 &` yozdingiz. Uning PPID'i kim?
3. `exec` bilan ishga tushirilgan dasturning PID'i qanday bo'ladi?
4. `ps aux` dagi `?` (TTY ustunida) nimani bildiradi?
5. Jarayon qaysi papkada ishlayotganini qanday bilasiz?

<details>
<summary>Javoblar</summary>

1. Dastur — diskdagi fayl. Jarayon — uning ishlab turgan nusxasi: PID, egasi, holati bilan.
2. Siz ishlayotgan bash.
3. O'zgarmaydi: exec fork qilmaydi, jarayonning o'zida dastur almashadi.
4. Jarayon terminalga bog'lanmagan (odatda servis).
5. `readlink /proc/PID/cwd`.

</details>

## Rasmiy hujjat

- [Debian Reference 9.4.3 — The ps command](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_ps_command)
- [ps(1) — man7.org](https://man7.org/linux/man-pages/man1/ps.1.html)
- [proc(5) — man7.org](https://man7.org/linux/man-pages/man5/proc.5.html)
- [credentials(7) — man7.org](https://man7.org/linux/man-pages/man7/credentials.7.html)
- [fork(2)](https://man7.org/linux/man-pages/man2/fork.2.html), [execve(2)](https://man7.org/linux/man-pages/man2/execve.2.html) — man7.org
- Trenajorda: `man ps`, `man pstree`, `man 5 proc`, `man 7 credentials`

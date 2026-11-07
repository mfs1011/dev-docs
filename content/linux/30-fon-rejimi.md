# 30 — Fon rejimi

[← Oldingi: Signallar](29-signallar.md) · [Mundarija](README.md) · [Keyingi: Resurslar →](31-resurslar.md)

## Tushuncha

Terminalda buyruq ikki xil ishlaydi:

| | Oldingi plan (foreground) | Fon (background) |
| --- | --- | --- |
| Qanday | `buyruq` | `buyruq &` |
| Terminal | Buyruq tugaguncha band | Darhol bo'shaydi, keyingi buyruqni yozasiz |
| Ctrl+C | Unga yetadi | Yetmaydi |

bash qo'llanmasiga ko'ra bash har bir buyruq zanjirini (pipeline) **ish** (job) deb hisoblaydi va ishlar jadvalini yuritadi. Ishlarni to'xtatib turish, fonga yoki oldingi planga o'tkazish — **ishlarni boshqarish** (job control).

Serverda bu savolga borib taqaladi: uzoq ishlaydigan buyruqni (zaxira, migratsiya, katta faylni ko'chirish) qanday ishga tushirsam, SSH uzilganda **to'xtab qolmaydi**?

## `&` va `jobs`

```text
$ cd /tmp
$ sleep 100 &
[1] 179
$ sleep 200 &
[2] 180
$ jobs
[1]-  Running                 sleep 100 &
[2]+  Running                 sleep 200 &
$ jobs -l
[1]-   179 Running                 sleep 100 &
[2]+   180 Running                 sleep 200 &
```

- `[1] 177` kabi qator — bash qo'llanmasiga ko'ra: ish raqami (1) va zanjirdagi oxirgi jarayonning PID'i.
- `jobs` — shu qobiqning (shell) ishlari. `-l` — PID'lari bilan.
- `+` — joriy ish, `-` — undan oldingisi.

Ishga murojaat qilish (bash qo'llanmasi, JOB CONTROL):

| Yozuv | Qaysi ish |
| --- | --- |
| `%1` | 1-ish |
| `%%` yoki `%+` | Joriy ish |
| `%-` | Oldingi ish |
| `%sleep` | Buyrug'i `sleep` bilan boshlangan ish |

`jobs` faqat **shu terminaldagi** qobiqning ishlarini biladi. Boshqa terminalda ishga tushirilgan jarayonni `ps`/`pgrep` bilan topasiz (28–29-boblar).

## Ctrl+Z, `bg`, `fg`

Buyruqni `&` siz ishga tushirib, uzoq ketishini keyin anglasangiz:

1. **Ctrl+Z** — buyruq to'xtatib turiladi (bash qo'llanmasi: "causes that process to be stopped and returns control to bash"). stty(1) ga ko'ra bu tugma terminal to'xtatish signalini — `SIGTSTP` ni (29-bob) yuboradi.
2. **`bg`** — to'xtatilgan ishni **fonda** davom ettiradi.
3. **`fg`** — ishni **oldingi planga** qaytaradi.

Trenajorning buyruq vositasi tugma bosa olmaydi, shuning uchun Ctrl+Z o'rniga ishga aynan o'sha signalni `kill -TSTP` bilan yuboramiz. Terminalda o'zingiz Ctrl+Z bosishingiz mumkin:

```text
$ kill -TSTP %1

[1]+  Stopped                 sleep 100
$ jobs -l
[1]+   179 Stopped                 sleep 100
[2]-   180 Running                 sleep 200 &
$ ps -o pid,stat,cmd -C sleep
  PID STAT CMD
  179 T    sleep 100
  180 S    sleep 200
$ bg %1
[1]+ sleep 100 &
$ jobs
[1]-  Running                 sleep 100 &
[2]+  Running                 sleep 200 &
```

- `Stopped` — ish to'xtatib turilgan. `ps` da holati `T` (28-bob).
- `bg %1` dan keyin `1-ish` yana `Running`, `ps` da `S`.

`fg` ishni oldingi planga olib chiqadi va u tugaguncha terminal band bo'ladi:

```text
$ kill %1 %2
$ sleep 3 &
[3] 191
[1]   Terminated              sleep 100
[2]   Terminated              sleep 200
$ fg
sleep 3
```

`fg` buyruq qatorini (`sleep 3`) yozdi va 3 soniyadan keyin taklif belgisi (prompt) qaytdi.

<div data-animatsiya="qadamli" data-nom="ishlar"></div>

## SSH uzilganda nima bo'ladi

29-bobda ko'rdik: bash qo'llanmasiga ko'ra qobiq (shell) `SIGHUP` olsa chiqib ketadi, interaktiv qobiq esa chiqishdan oldin SIGHUP'ni **barcha ishlariga** qayta yuboradi. Ulanish uzilsa, terminal yo'qoladi va qobiq aynan shu SIGHUP'ni oladi.

VPS'da tajriba qildik. Bitta SSH sessiyada to'rt xil usulda `sleep` ishga tushirildi:

```sh
sleep 1001 &                              # oddiy fon ishi
nohup sleep 1002 >/dev/null 2>&1 &        # nohup
sleep 1003 &
disown                                    # ishlar jadvalidan chiqarildi
tmux new-session -d -s ish "sleep 1004"   # tmux sessiyasi
```

Keyin ikki holat sinaldi:

- **1-holat:** ulanish to'satdan uzildi. Bu tarmoq uzilishiga o'xshatib qilindi: noutbukdagi `ssh` jarayoni `kill -9` bilan o'ldirildi.
- **2-holat:** oddiy `exit`.

Ikkala holatdan keyin yangi SSH sessiyada tekshirdik. 1-holat:

```text vps
$ ps -o pid,stat,cmd -C sleep; tmux ls
    PID STAT CMD
  70219 S    sleep 1002
  70223 S    sleep 1003
  70233 Ss+  sleep 1004
ish: 1 windows (created Sat Nov  7 07:29:51 2026)
```

2-holat:

```text vps
$ ps -o pid,stat,cmd -C sleep; tmux ls
    PID STAT CMD
  70317 S    sleep 1001
  70321 S    sleep 1002
  70325 S    sleep 1003
  70335 Ss+  sleep 1004
ish: 1 windows (created Sat Nov  7 07:30:02 2026)
```

| Usul | Ulanish uzildi | Oddiy `exit` |
| --- | --- | --- |
| `buyruq &` | **To'xtadi** | Qoldi |
| `nohup buyruq &` | Qoldi | Qoldi |
| `buyruq &` + `disown` | Qoldi | Qoldi |
| `tmux` ichida | Qoldi | Qoldi |

<div data-animatsiya="qadamli" data-nom="uzilish"></div>

Nega oddiy `exit` da ham `sleep 1001` qoldi? Ikki sozlama tufayli:

```text vps
$ bash -ic 'shopt huponexit'
huponexit           	off
$ busctl get-property org.freedesktop.login1 /org/freedesktop/login1 org.freedesktop.login1.Manager KillUserProcesses
b false
```

- `huponexit` — bash qo'llanmasiga ko'ra yoqilgan bo'lsa, interaktiv login qobig'i chiqishda barcha ishlarga SIGHUP yuboradi. Standart holatda **o'chiq**.
- `KillUserProcesses` — systemd-logind sozlamasi. logind.conf(5) ga ko'ra `yes` bo'lsa, foydalanuvchi chiqqanda uning sessiyasidagi **barcha** jarayonlar o'ldiriladi. Standart qiymati `no`.

Bularga tayanmang: boshqa serverda ikkalasi ham yoqilgan bo'lishi mumkin, ulanish esa istalgan payt uzilishi mumkin. Uzoq ishni **har doim** quyidagi usullardan biri bilan ishga tushiring.

## `nohup`

nohup(1): "Run COMMAND, ignoring hangup signals" — buyruqni SIGHUP'ni e'tiborsiz qoldirib ishga tushiradi. Bundan tashqari:

- stdin terminal bo'lsa, u o'qib bo'lmaydigan faylga ulanadi;
- stdout terminal bo'lsa, chiqish `nohup.out` fayliga **qo'shib** yoziladi;
- stderr terminal bo'lsa, stdout'ga yo'naltiriladi.

```text
$ nohup sleep 300 &
[1] 220
$ sleep 1
nohup: ignoring input and appending output to 'nohup.out'
$ ls -l nohup.out
-rw------- 1 root root 0 Nov  7 04:32 nohup.out
$ grep SigIgn /proc/$!/status
SigIgn:	0000000000000001
```

proc(5) ga ko'ra `SigIgn` — e'tiborsiz qoldiriladigan signallar maskasi (o'n oltilik son). Oxirgi `1` — eng kichik bit, ya'ni 1-signal, `SIGHUP`. nohup aynan shuni qildi.

Chiqishni o'zingiz tanlagan faylga yozish yaxshiroq: `nohup ./zaxira.sh > zaxira.log 2>&1 &`.

## `disown`

`disown` (bash ichki buyrug'i) ishni ishlar jadvalidan chiqaradi. bash qo'llanmasiga ko'ra jadvalda yo'q ishga qobiq SIGHUP yubormaydi. `disown -h` esa ishni jadvalda qoldiradi, faqat SIGHUP yuborilmaydigan qilib belgilaydi.

```text
$ sleep 400 &
[2] 238
$ disown
$ jobs
[1]+  Running                 nohup sleep 300 &
$ pgrep -a sleep
220 sleep 300
238 sleep 400
```

Jarayon ishlayapti, lekin qobiq uni endi o'ziniki deb bilmaydi. `&` bilan ishga tushirib, keyin "uzilib qolsa-chi?" deb esingizga tushsa, `disown` qulay.

## tmux

Ubuntu hujjatiga ko'ra terminal multipleksori (terminal multiplexer) bitta oynada bir nechta terminal sessiyasini ochadi, sessiyadan **ajralib** (detach) ketganda ham dasturlar ishlashda davom etadi va keyin unga **qayta ulanasiz** (attach). Bu tarmoq uzilishidan himoya qiladi. Debian Reference xuddi shu ishni qiladigan `screen` dasturini tavsiflaydi va tmux'ni uning muqobili sifatida tilga oladi.

Asosiy buyruqlar (Ubuntu hujjatidan):

| Buyruq yoki tugma | Vazifasi |
| --- | --- |
| `tmux new-session -s nom` | Nomli sessiya |
| `Ctrl+b`, keyin `d` | Sessiyadan ajralish (detach) — dasturlar ishlayveradi |
| `tmux ls` | Sessiyalar ro'yxati |
| `tmux attach -t nom` | Sessiyaga qayta ulanish |
| `tmux kill-session -t nom` | Sessiyani yopish |
| `Ctrl+b`, keyin `c` / `n` / `p` | Yangi oyna / keyingi / oldingi |

Trenajorda sessiyani darhol ajralgan holda (`-d`) ochamiz:

```text
$ tmux new-session -d -s ish 'sleep 500'
$ tmux ls
ish: 1 windows (created Sat Nov  7 04:32:35 2026)
$ pgrep -a sleep
220 sleep 300
238 sleep 400
243 sleep 500
$ tmux kill-session -t ish
```

Ubuntu hujjatida tmux Ubuntu Server'da oldindan o'rnatilgan deyilgan. Bizning VPS provayder shablonidan o'rnatilgan va unda tmux yo'q edi — `apt install tmux` bilan o'rnatildi (24-bob).

> `KillUserProcesses=yes` bo'lgan serverda tmux ham chiqishda o'ldiriladi. logind.conf(5) bu holat uchun systemd-run(1) dagi misolga yo'naltiradi.

## Uzoq ish uchun qaysi biri

Yana bir yo'l — buyruqni systemd orqali ishga tushirish. `systemd-run` (29-bobda ishlatganmiz) vaqtinchalik servis yaratadi. Bunday jarayon SSH sessiyasiga umuman bog'liq emas:

```text
$ systemd-run --unit=uzoq sleep 600
Running as unit: uzoq.service
$ systemctl is-active uzoq
active
$ systemctl stop uzoq
$ systemctl is-active uzoq
inactive
```

| | `nohup` / `disown` | `tmux` | systemd (`systemd-run`, servis) |
| --- | --- | --- | --- |
| SSH uzilsa | Ishlayveradi | Ishlayveradi | Ishlayveradi |
| Keyin ekranini ko'rish, tugma bosish | Yo'q | Ha (`attach`) | Yo'q |
| Chiqish qayerda | `nohup.out` yoki o'zingiz bergan fayl | tmux oynasida | Jurnalda (`journalctl -u nom`, 37-bob) |
| Server qayta yonsa | Yo'qoladi | Yo'qoladi | Doimiy servis bo'lsa, `enable` bilan qayta ishga tushadi (34–35-boblar) |
| Qachon | Bir martalik buyruq | Qo'lda kuzatiladigan, interaktiv ish | Ilova, doimiy ishlashi kerak bo'lgan narsa |

Ilovangizni `nohup node app.js &` bilan ishga tushirmang: server qayta yonganda u qaytmaydi, yiqilsa hech kim qayta ishga tushirmaydi. Ilova — systemd servisi (35-bob).

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| bash | 5.2.15 | 5.3.9 |
| tmux | 3.3a | 3.6 (shablonda yo'q edi, o'rnatildi) |
| `huponexit` | off | off |
| logind `KillUserProcesses` | false | false |

## Tipik xatolar

**1. Uzoq ishni oddiy `&` bilan ishga tushirib, SSH'dan chiqib ketish.**
Ulanish uzilsa, ish to'xtaydi (yuqoridagi tajriba).
To'g'risi: `tmux`, `nohup` yoki `systemd-run`.

**2. `nohup` chiqishini unutish.**
Hamma chiqish `nohup.out` ga yig'ilib, diskni to'ldirishi mumkin.
To'g'risi: `nohup buyruq > fayl.log 2>&1 &`.

**3. Ilovani `nohup` bilan "servis" qilish.**
Qayta yonishda va yiqilganda qaytmaydi.
To'g'risi: systemd servisi (35-bob).

**4. `jobs` bo'sh — demak jarayon yo'q, deb o'ylash.**
`jobs` faqat shu qobiqning ishlarini ko'rsatadi; `disown` qilingani yoki boshqa terminaldagisi unda yo'q.
To'g'risi: `pgrep -a`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=30-fon)** "Fon ishlari": ishni fonga yuborasiz, to'xtatasiz, davom ettirasiz va uzilishga chidamli qilib ishga tushirasiz.

Savollar:

1. `sleep 100` ni `&` siz ishga tushirdingiz. Terminalni qanday bo'shatasiz va buyruqni fonda davom ettirasiz?
2. SSH uzilganda oddiy `buyruq &` nega to'xtaydi?
3. `nohup` va `disown` ning farqi nima?
4. Migratsiya 2 soat ketadi va jarayonini ko'rib turish kerak. Qaysi usul?
5. Ilova uchun nega `nohup` emas, systemd?

<details>
<summary>Javoblar</summary>

1. Ctrl+Z (to'xtatib turish), keyin `bg`.
2. Qobiq (shell) SIGHUP oladi va uni barcha ishlariga qayta yuboradi; ish SIGHUP'ni ushlamasa, uning standart harakati — tugash.
3. `nohup` buyruqning o'zida SIGHUP'ni e'tiborsiz qoldiradi va chiqishni faylga yo'naltiradi. `disown` allaqachon ishlayotgan ishni qobiqning ishlar jadvalidan chiqaradi — qobiq unga SIGHUP yubormaydi.
4. `tmux`: ajralib ketib, keyin `tmux attach` bilan qaytib ko'rasiz.
5. systemd yiqilgan ilovani qayta ishga tushira oladi, qayta yonishda ishga tushiradi, chiqishni jurnalga yozadi.

</details>

## Rasmiy hujjat

- [GNU Bash: Job Control](https://www.gnu.org/software/bash/manual/bash.html#Job-Control), [Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals)
- [Ubuntu Server — Terminal multiplexers](https://ubuntu.com/server/docs/reference/other-tools/terminal-multiplexers/)
- [Debian Reference 9.1.2 — The screen program](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_screen_program)
- [nohup(1) — GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html#nohup-invocation)
- [logind.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/logind.conf.html)
- [tmux(1)](https://man.openbsd.org/tmux.1)
- Trenajorda: `man bash` (JOB CONTROL, SIGNALS), `help jobs`, `help disown`, `man nohup`, `man tmux`

# 29 — Signallar

[← Oldingi: Jarayon nima](28-jarayon.md) · [Mundarija](README.md)

## Tushuncha

28-bobda har bir jarayonning o'z PID raqami borligini ko'rdik. Agar jarayon qotib qolsa, ortiqcha resurs yesa yoki uning ishini to'xtatish kerak bo'lsa, operatsion tizim unga **signal** yuboradi.

**Signal** — operatsion tizim yadrosi (kernel) yoki boshqa jarayon tomonidan yuboriladigan qisqa asinxron xabarnoma. signal(7) man sahifasiga ko'ra, har bir signal jarayonga yetib borganida uning o'ziga xos standart harakati (disposition/action) bo'ladi: jarayonni tugatish (Term), e'tiborsiz qoldirish (Ign), xotira nusxasini yozib tugatish (Core), to'xtatib muzlatish (Stop) yoki davom ettirish (Cont).

Tizimdagi barcha signallar ro'yxati va ularning raqamlarini `kill -l` bilan ko'rish mumkin:

```text
$ kill -l | head -n 2
 1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
 6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
$ kill -l TERM; kill -l KILL; kill -l HUP; kill -l INT
15
9
1
2
```

signal(7) va Debian Reference (9.4.12) da keltirilgan eng asosiy signallar:

| Raqam | Nom | Standart harakat | Tavsif va qachon yuboriladi |
| --- | --- | --- | --- |
| **1** | `SIGHUP` | Term | Aloqa uzildi (hangup): boshqaruvchi terminal uzilganda |
| **2** | `SIGINT` | Term | Klaviaturadan uzish (Interrupt). Terminalda Ctrl+C bosilganda oldingi plandagi (foreground) jarayonga yuboriladi |
| **3** | `SIGQUIT` | Core | Klaviaturadan chiqish. Ctrl+\ bosilganda yuboriladi va xotira nusxasi (core dump) qoldiradi |
| **9** | `SIGKILL` | Term | Darhol o'ldirish. Yadro tomonidan bajariladi; uni ushlab, bloklab yoki e'tiborsiz qoldirib bo'lmaydi |
| **10** | `SIGUSR1` | Term | Foydalanuvchi belgilaydigan signal 1: ma'nosini dastur o'zi belgilaydi |
| **12** | `SIGUSR2` | Term | Foydalanuvchi belgilaydigan signal 2 |
| **15** | `SIGTERM` | Term | To'xtatish (Termination). `kill` ning standart signali; ilova uni kutib olib, toza chiqishi (graceful shutdown) mumkin |
| **17** | `SIGCHLD` | Ign | Bola jarayon to'xtaganda yoki tugaganda ota jarayonga yuboriladi |
| **18** | `SIGCONT` | Cont | To'xtatilgan (muzlatilgan) jarayon ishini davom ettirish |
| **19** | `SIGSTOP` | Stop | Jarayonni to'xtatish (muzlatish). Buni ham ushlab yoki bloklab bo'lmaydi |
| **20** | `SIGTSTP` | Stop | Terminaldan to'xtatish. Terminalda Ctrl+Z bosilganda yuboriladi (30-bob) |

signal(7) man sahifasida alohida ta'kidlanadi: `SIGKILL` va `SIGSTOP` signallarini ushlab bo'lmaydi, bloklab bo'lmaydi va e'tiborsiz qoldirib bo'lmaydi (*"cannot be caught, blocked, or ignored"*).

## Jarayonga signal yuborish: `kill`

`kill` nomi qo'rqinchli eshitilsa-da, uning vazifasi faqat o'ldirish emas, balki jarayonga ixtiyoriy signal jo'natishdir (kill(2)).

Bash muhitida `kill` ichki buyruq (builtin) hisoblanadi (`type kill`). Shuningdek tizimda `/bin/kill` utilitasi ham mavjud. Agar signal ko'rsatilmasa, sukut bo'yicha **15 (SIGTERM)** yuboriladi:

```text
$ sleep 300 &
[1] 179
$ kill $!
$ sleep 1
[1]+  Terminated              sleep 300
$ sleep 300 &
[1] 191
$ kill -TERM $!
$ sleep 1
[1]+  Terminated              sleep 300
$ sleep 300 &
[1] 204
$ kill -9 $!
[1]+  Killed                  sleep 300
$ sleep 1
```

- `kill $!` va `kill -TERM $!` bir xil: ikkalasi ham SIGTERM yuboradi va jarayon `Terminated` holati bilan tugaydi.
- `kill -9 $!` esa SIGKILL yuboradi va natijada `Killed` xabari chiqadi.
- Signalni nom bilan (`-TERM`, `-KILL`, `-HUP`, `-INT`) yoki raqam bilan (`-15`, `-9`, `-1`, `-2`) ko'rsatish mumkin.

## Nom bo'yicha topish va to'xtatish: `pgrep` va `pkill`

Har doim PID raqamini qidirib o'tirmaslik uchun procps to'plamida `pgrep` (jarayonlarni qidirish) va `pkill` (jarayonlarga nomi bo'yicha signal yuborish) vositalari bor.

```text
$ sleep 300 &
[1] 177
$ sleep 301 &
[2] 178
$ pgrep -a sleep
177 sleep 300
178 sleep 301
$ pkill -f 300
[1]-  Terminated              sleep 300
$ pgrep -a sleep
178 sleep 301
$ pkill -x sleep
[2]+  Terminated              sleep 301
$ pgrep -a sleep || echo "hamma sleep to'xtatildi"
hamma sleep to'xtatildi
```

Foydali parametrlar:
- `pgrep -a` — PID bilan birga to'liq buyruq qatorini chiqaradi.
- `pkill -x` — faqat jarayon nomi **aniq** mos kelgandagina to'xtatadi. Bu tasodifiy boshqa jarayonlarga tegib ketishdan saqlaydi.
- `pkill -f` — nafaqat jarayon nomi, balki uning barcha argumentlari (`cmdline`) ichidan qidiradi.

### `pkill -f` ning xavfi

`pkill -f` juda ehtiyotkorlikni talab qiladi. U butun buyruq qatorini tekshirgani uchun, kutilmagan boshqa jarayonlarga ham signal yuborishi mumkin:

```text
$ pgrep -a -f bash
167 -bash
```

Agar siz `pkill -f bash` yoki bexosdan qisqa so'z bilan `pkill -f sh` deb yuborsangiz, o'zingiz ishlab turgan qobiq (shell) sessiyasi ham to'xtab, serverdan uzilib qolasiz. Shuning uchun qoida: **avval `pgrep -a -f <qidiruv>` bilan kimlar mos kelishini ko'ring, faqat ishonch hosil qilgach `pkill` ishlating**.

## SIGTERM va SIGKILL farqi

Dasturchi uchun eng muhim farq — dasturning xavfsiz to'xtashi (graceful shutdown).

Ilova ishlab turganda ochiq ma'lumotlar bazasi ulanishlari, yozilayotgan fayllar, keshlar yoki diskdagi PID faylga ega bo'ladi.
- **SIGTERM (15)** yuborilganda, ilova uni qabul qiladi. Maxsus signal tutuvchi funksiya (`trap`) ishga tushadi: ulanishlarni yopadi, vaqtinchalik fayllarni tozalaydi va xavfsiz chiqadi.
- **SIGKILL (9)** esa to'g'ridan-to'g'ri operatsion tizim yadrosi tomonidan bajariladi. Dastur kodiga umuman navbat berilmaydi. Hech qanday tozalash kodi ishlamaydi, ma'lumotlar chala yozilganicha qolishi mumkin.

Trenajorda ikkala holatni sinab ko'ramiz. Kichik skript tuzamiz: u ishga tushganda o'z PID faylini yaratadi, `trap` orqali SIGTERM kelganda "tozalayapman" deb faylni o'chiradi:

```text
$ printf '#!/bin/sh\ntrap "echo tozalayapman; rm -f /tmp/app.pid; exit 0" TERM\necho $$ > /tmp/app.pid\nwhile true; do sleep 1; done\n' > /tmp/app.sh
$ chmod +x /tmp/app.sh
$ /tmp/app.sh &
[1] 178
$ sleep 1
$ cat /tmp/app.pid
178
$ kill -TERM $!
$ sleep 1
tozalayapman
[1]+  Done                    /tmp/app.sh
$ ls -l /tmp/app.pid 2>/dev/null || echo "fayl ochirildi (tozalash ishladi)"
fayl ochirildi (tozalash ishladi)
```

SIGTERM yuborilganda `trap` ishladi, `tozalayapman` yozuvi chiqdi, PID fayl o'chirildi va jarayon xatosiz (`Done`) yakunlandi.

Endi xuddi shu skriptga SIGKILL yuboramiz:

```text
$ /tmp/app.sh &
[1] 178
$ sleep 1
$ cat /tmp/app.pid
178
$ kill -KILL $!
$ sleep 1
[1]+  Killed                  /tmp/app.sh
$ ls -l /tmp/app.pid 2>/dev/null && echo "fayl qoldi (tozalash ishlamadi)"
-rw-r--r-- 1 root root 4 Nov  7 03:56 /tmp/app.pid
fayl qoldi (tozalash ishlamadi)
```

Natija aniq: `Killed` xabari chiqdi, lekin tozalash kodi ishlamadi — `/tmp/app.pid` fayli diskda qolib ketdi.

Bosqichma-bosqich:

<div data-animatsiya="qadamli" data-nom="signal"></div>

## Boshqa keng tarqalgan signallar

### Ctrl+C va SIGINT

Debian Reference jadvaliga ko'ra Ctrl+C bosilganda oldingi plandagi jarayonga **SIGINT (2)** yuboriladi, Ctrl+\ — **SIGQUIT (3)**. Signal bilan tugagan jarayonning chiqish kodi quyida, "128 + N" bo'limida.


### SIGHUP va terminal uzilishi

**SIGHUP (1)** — "aloqa uzildi" (hangup). signal(7) ga ko'ra u boshqaruvchi terminal uzilganda yuboriladi. GNU Bash qo'llanmasiga ko'ra qobiq (shell) SIGHUP olganda chiqib ketadi, chiqishdan oldin esa interaktiv qobiq SIGHUP ni o'zining barcha ishlariga (jobs) — ishlayotgan va to'xtatilganlariga — qayta yuboradi. Shuning uchun SSH uzilsa, terminaldan ishga tushirilgan buyruqlar odatda to'xtaydi.

SSH uzilsa ham jarayon ishlab qolishi uchun `nohup` yoki `tmux` ishlatiladi — bu mavzuni 30-bobda batafsil ko'ramiz.

## `exec` nega muhim: 28-bobdagi va'da namoyishi

28-bobda dasturlarni ishga tushirish skriptlarida (entrypoint) nega `exec` yozilishi signallar bilan bog'liqligi aytilgan edi.

Faraz qiling, skript ilovani oddiy usulda chaqiradi. Trenajorda buni sinaymiz:

```text
$ printf '#!/bin/sh\ntrap "echo ilova: TERM oldim, tozalayapman; exit 0" TERM\necho "ilova: ishga tushdim, PID=$$"\nwhile true; do sleep 1; done\n' > /tmp/ilova.sh
$ chmod +x /tmp/ilova.sh
$ printf '#!/bin/sh\necho "skript: ishga tushdim, PID=$$"\n/tmp/ilova.sh\n' > /tmp/oddiy.sh
$ chmod +x /tmp/oddiy.sh
$ /tmp/oddiy.sh &
[1] 179
$ sleep 1
skript: ishga tushdim, PID=179
ilova: ishga tushdim, PID=181
$ pgrep -a -f 'ilova.sh|oddiy.sh'
179 /bin/sh /tmp/oddiy.sh
181 /bin/sh /tmp/ilova.sh
$ kill -TERM $!
$ sleep 1
[1]+  Terminated              /tmp/oddiy.sh
$ pgrep -a -f 'ilova.sh' || echo "ilova tugagan"
181 /bin/sh /tmp/ilova.sh
```

Nima sodir bo'ldi:
1. Skript (PID 179) ishga tushdi va ilovani (PID 181) alohida bola jarayon qilib yaratdi.
2. Biz skriptga `kill -TERM 179` yubordik.
3. Skript to'xtadi (`Terminated`).
4. **Lekin ilova (PID 181) to'xtamadi!** Signal faqat skriptga bordi, skript esa uni bolasiga uzatmadi. Servisni to'xtatish signali skriptga yuborilsa, ilova uni eshitmaydi va ishlashda davom etadi.

Endi skript ichida `exec` ishlatamiz:

```text
$ pkill -f ilova.sh
$ printf '#!/bin/sh\necho "skript: ishga tushdim, PID=$$"\nexec /tmp/ilova.sh\n' > /tmp/exec-bilan.sh
$ chmod +x /tmp/exec-bilan.sh
$ /tmp/exec-bilan.sh &
[1] 180
$ sleep 1
skript: ishga tushdim, PID=180
ilova: ishga tushdim, PID=180
$ pgrep -a -f 'ilova.sh|exec-bilan.sh'
180 /bin/sh /tmp/ilova.sh
$ kill -TERM $!
$ sleep 1
ilova: TERM oldim, tozalayapman
[1]+  Done                    /tmp/exec-bilan.sh
$ pgrep -a -f 'ilova.sh' || echo "ilova tugagan"
ilova tugagan
```

`exec` bilan natija butunlay boshqacha bo'ldi:
- Ilova yangi jarayon yaratmadi, balki skriptning o'rnini egalladi: PID o'sha-o'sha qoldi.
- `kill -TERM` to'g'ridan-to'g'ri ilovaga yetib bordi.
- Ilova `trap` orqali xavfsiz tozalashni bajardi va toza chiqdi.

## Chiqish kodi: 128 + N qoidasi

GNU Bash qo'llanmasining "Exit Status" bo'limida shunday qoida yozilgan: agar buyruq yoki jarayon biror halokatli signal `N` ta'sirida to'xtatilsa, qobiq (shell) uning chiqish kodi (`$?`) sifatida **`128 + N`** qiymatini qaytaradi.

Buni trenajorda turli signallar bilan tekshirib ko'ramiz:

```text
$ sleep 300 &
[1] 177
$ kill -TERM $!
$ wait $!
[1]+  Terminated              sleep 300
$ echo "SIGTERM: $?"
SIGTERM: 143
$ sleep 300 &
[1] 178
$ kill -KILL $!
$ wait $!
[1]+  Killed                  sleep 300
$ echo "SIGKILL: $?"
SIGKILL: 137
$ sleep 300 &
[1] 179
$ kill -INT $!
$ wait $!
[1]+  Interrupt               sleep 300
$ echo "SIGINT: $?"
SIGINT: 130
```

Matematikasi:
- **SIGINT (2)**: 128 + 2 = 130
- **SIGKILL (9)**: 128 + 9 = 137
- **SIGTERM (15)**: 128 + 15 = 143

Logda dastur `137` kodi bilan tugaganini ko'rsangiz — unga SIGKILL (9) kelgan; `143` — SIGTERM (15). Kim yuborganini log va jurnaldan qidirasiz (xotira tugashi holati — 31-bob).

## Debian va Ubuntu

| Xususiyat | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `kill` (qobiq ichki buyrug'i) | bash 5.2.15 | bash 5.3.9 |
| `pkill` / `pgrep` | procps-ng 4.0.2 | procps-ng 4.0.4 |

```text vps
$ bash --version | head -1
GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
$ pkill --version
pkill from procps-ng 4.0.4
$ type kill
kill is a shell builtin
```

`pgrep`/`pkill` ikkala tizimda ham procps-ng'dan: rust-coreutils ularga tegishli emas.

## Tipik xatolar

**1. Har qanday jarayonga darhol `kill -9` yuborish.**
Eng keng tarqalgan va zararli odat. SIGKILL jarayonga hech qanday tozalash imkonini bermaydi. Natijada vaqtinchalik fayllar qoladi, diskdagi qulf (lock) fayllar sabab keyingi safar ilova yonmasligi mumkin, tranzaksiyalar chala qoladi.
To'g'risi: avval oddiy `kill PID` (SIGTERM) yuboriladi. Agar ilova bir necha soniya davomida javob bermasa va to'xtamasa, shundagina oxirgi chora sifatida `kill -9` ishlatiladi.

**2. `pkill -f` bilan barcha o'xshash jarayonlarni qirib tashlash.**
`pkill -f py` yoki `pkill -f test` kabi umumiy so'zlar buyruq qatorida shu harflar qatnashgan barcha boshqa dasturlarni (jumladan muharrir yoki terminal sessiyangizni) o'ldiradi.
To'g'risi: signal yuborishdan oldin `pgrep -a -f <qidiruv>` bilan aniq qaysi jarayonlar topilishini ko'rish.

**3. Zombi jarayonni `kill` bilan o'ldirishga urinish.**
28-bobda ko'rganimizdek, zombi (`STAT Z`) — allaqachon o'lgan jarayon. U xotirada kod sifatida mavjud emas, faqat jarayonlar jadvalida yozuv sifatida turibdi. Unga yuborilgan har qanday signal e'tiborsiz qoladi.
To'g'risi: Debian Reference'ga ko'ra zombining ota jarayonini (PPID) to'xtatish.

**4. Ishga tushirish skriptlarida `exec` ni unutish.**
Skript orqali ilovani boshqarganda `exec` qo'yilmasa, konteyner yoki tizim bergan SIGTERM faqat skriptga boradi, ichki ilova esa yopilmay osilib qoladi.
To'g'risi: skriptning oxirgi chaqiruvida `exec ilova-buyrug'i` deb yozish.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=29-signal)** "Jarayonni to'xtatish": fondagi jarayonlarni `pgrep` bilan topasiz, `pkill` va `kill` bilan to'xtatasiz hamda `trap` bilan xavfsiz chiqishni (graceful shutdown) tekshirasiz.

Savollar:

1. `kill 1234` buyrug'i sukut bo'yicha qaysi signalni yuboradi?
2. SIGTERM va SIGKILL signallarining asosiy farqi nima? Qaysi birini ilova ushlab qola olmaydi?
3. Jarayonning chiqish kodi (`$?`) 137 ga teng bo'lsa, u qanday sabab bilan tugagan?
4. Nega `pkill -f` buyrug'ini ishlatishdan oldin `pgrep -a -f` qilish tavsiya etiladi?
5. Ishga tushirish skriptida `exec node app.js` yozish nega muhim?

<details>
<summary>Javoblar</summary>

1. Standart bo'yicha **SIGTERM (15)** signali yuboriladi.
2. SIGTERM dasturga tozalash ishlarini bajarib xavfsiz chiqish (graceful shutdown) imkonini beradi. SIGKILL esa operatsion tizim yadrosi tomonidan darhol to'xtatiladi; uni hech qanday dastur ushlab, bloklab yoki e'tiborsiz qoldira olmaydi.
3. GNU Bash 128+N qoidasiga ko'ra 137 − 128 = 9, ya'ni jarayon **SIGKILL (9)** bilan to'xtatilgan.
4. `-f` parametri buyruq qatoridagi barcha argumentlar bo'yicha qidiradi. Kutilmaganda o'xshash nomli boshqa jarayonlar yoki o'zingizning terminalingiz ham mos kelib qolib, to'xtab ketishining oldini olish uchun avval ro'yxat tekshiriladi.
5. `exec` ishlatilganda yangi bola jarayon yaratilmaydi, ilova skriptning PID raqamini egallaydi. Natijada tashqaridan kelgan to'xtatish signallari (SIGTERM) to'g'ridan-to'g'ri ilovaga yetib boradi.

</details>

## Rasmiy hujjat

- [Debian Reference 9.4.12 — Killing a process](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_killing_a_process)
- [signal(7) — man7.org](https://man7.org/linux/man-pages/man7/signal.7.html)
- [kill(1) — man7.org](https://man7.org/linux/man-pages/man1/kill.1.html)
- [pgrep(1) / pkill(1) — man7.org](https://man7.org/linux/man-pages/man1/pgrep.1.html)
- [GNU Bash: Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals)
- [GNU Bash: Exit Status](https://www.gnu.org/software/bash/manual/bash.html#Exit-Status)
- Trenajorda: `man 7 signal`, `man kill`, `man pkill`, `help trap`

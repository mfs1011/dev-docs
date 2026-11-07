# 37 — Loglar: journalctl

[← Oldingi: Unit'ni o'zgartirish](36-unitni-ozgartirish.md) · [Mundarija](README.md) · [Keyingi: Rejali ishlar →](38-rejali-ishlar.md)

## Tushuncha

Debian Reference'ga ko'ra systemd'da yadro va tizim xabarlarini **systemd-journald** yig'adi. Ular ikkilik (binary) **jurnalda** saqlanadi va `journalctl` buyrug'i bilan o'qiladi. Servisning stdout/stderr'i ham jurnalga tushadi — 35-bobda ilova chiqishini shu yerdan ko'rgandik.

| Savol | Buyruq |
| --- | --- |
| Bu servis nima yozdi? | `journalctl -u servis` |
| Hozir nima bo'lyapti? | `journalctl -f` |
| Oxirgi yonishdan beri / oldingi yonishda? | `journalctl -b`, `journalctl -b -1` |
| Faqat xatolar? | `journalctl -p err` |
| Kecha 22:00 dan keyin? | `journalctl --since` |
| Yadro xabarlari? | `journalctl -k` |

## Servis bo'yicha: `-u`

```text
$ journalctl -u cron --no-pager -n 5
Nov 05 11:41:20 trenajor systemd[1]: Started cron.service - Regular background program processing daemon.
Nov 05 11:41:20 trenajor cron[151]: (CRON) INFO (pidfile fd = 3)
Nov 05 11:41:20 trenajor cron[151]: (CRON) INFO (Running @reboot jobs)
```

- `-u` — unit, `-n 5` — oxirgi 5 yozuv, `--no-pager` — pager'siz (17-bob).
- Har qator: vaqt, xost, kim yozdi (`cron[151]` — dastur va PID), xabar.

## Ilovaning o'z yozuvlari: `logger` va `-t`

Har yozuvning **identifikatori** (syslog identifier) bor — odatda dastur nomi. `logger` (util-linux) jurnalga o'zi xohlagan identifikator bilan yozadi — skriptlar uchun qulay:

```text
$ logger -t ilova -p user.info "so'rov keldi"
$ logger -t ilova -p user.err "bazaga ulanib bo'lmadi"
$ journalctl -t ilova --no-pager -o cat
so'rov keldi
bazaga ulanib bo'lmadi
```

`-t ilova` — journalctl(1) ga ko'ra shu identifikatorli yozuvlar. `-o cat` — vaqt va boshqa ma'lumotlarsiz, faqat xabar.

## Muhimlik darajasi: `-p`

journalctl(1) ga ko'ra darajalar syslog'nikidek (ma'nolari — syslog(3)), `0` eng jiddiy:

| Raqam | Nom | Ma'nosi |
| --- | --- | --- |
| 0 | `emerg` | Tizim ishlay olmaydi |
| 1 | `alert` | Darhol choralar kerak |
| 2 | `crit` | Kritik |
| 3 | `err` | Xato |
| 4 | `warning` | Ogohlantirish |
| 5 | `notice` | Muhim, lekin odatiy |
| 6 | `info` | Ma'lumot |
| 7 | `debug` | Tuzatish uchun |

Bitta daraja berilsa, **o'sha va undan jiddiyroqlari** ko'rsatiladi:

```text
$ journalctl -t ilova -p err --no-pager -o cat
bazaga ulanib bo'lmadi
```

`-p err` — faqat `err` va undan yuqori: `info` yozuvi tushmadi. Serverga kirganda `journalctl -p err -b` — shu yonishdagi barcha xatolar — foydali birinchi buyruq.

## Vaqt bo'yicha: `--since`, `--until`

```text
$ journalctl -t ilova --since "5 min ago" --no-pager -o short-iso
2026-11-07T05:50:28+0000 trenajor ilova[187]: so'rov keldi
2026-11-07T05:50:28+0000 trenajor ilova[190]: bazaga ulanib bo'lmadi
```

Vaqt `"2026-11-07 22:00"`, `"1 hour ago"`, `today`, `yesterday` kabi yoziladi (systemd.time(7)). `-o short-iso` — vaqtni ISO 8601 formatida: boshqa loglar bilan solishtirishga qulay.

## Jonli kuzatish: `-f`

journalctl(1) ga ko'ra `-f` oxirgi yozuvlarni ko'rsatadi va **yangilarini paydo bo'lishi bilan** chiqaradi — `tail -f` ning jurnaldagi o'xshashi (17-bob). Odatda Ctrl+C bilan to'xtatiladi. Bu yerda `timeout 3` bilan 3 soniyadan keyin o'zi to'xtaydi, orada boshqa jarayon jurnalga yozadi:

```text
$ (sleep 1; logger -t sinov "yangi yozuv") & timeout 3 journalctl -f -n 0 -t sinov --no-pager
[1] 207
Nov 07 05:50:32 trenajor sinov[207]: yangi yozuv
[1]+  Done                    ( sleep 1; logger -t sinov "yangi yozuv" )
```

Servisni qayta ishga tushirayotganda ikkinchi terminalda `journalctl -fu servis` ochib qo'yish — xato sababini darhol ko'rishning eng oson yo'li.

## Yonishlar va yadro: `-b`, `-k`

```text
$ journalctl --list-boots --no-pager
IDX BOOT ID                          FIRST ENTRY                 LAST ENTRY                 
  0 7800bc9ac05a4416a2804dc8a3d78ed3 Thu 2026-11-05 11:41:13 UTC Sat 2026-11-07 05:50:32 UTC
$ journalctl -k --no-pager -n 3
Nov 05 11:41:19 trenajor systemd-journald[125]: Received client request to flush runtime journal.
Nov 05 11:41:24 trenajor kernel: bash (167): drop_caches: 3
Nov 07 05:50:24 trenajor kernel: hrtimer: interrupt took 108012083 ns
```

- `-b` — joriy yonish, `-b -1` — oldingisi. Server o'zi qayta yongan bo'lsa (masalan, xotira tugab qotgan), sababni oldingi yonish oxiridan qidirasiz.
- `-k` — journalctl(1): faqat yadro xabarlari (`dmesg` ga o'xshash).

VPS'da bir nechta yonish bor (33–34-boblardagi qayta yondirishlar):

```text vps
$ journalctl --list-boots --no-pager | tail -n 3
 -2 5696aa17a19c471e9d7e90a4f971421d Thu 2026-11-05 09:23:39 MSK Sat 2026-11-07 07:55:19 MSK
 -1 96e10938625744ea90ff7738e3344506 Sat 2026-11-07 07:55:31 MSK Sat 2026-11-07 08:12:31 MSK
  0 0fce1f64b47d4ab08376589703a9eb40 Sat 2026-11-07 08:12:41 MSK Sat 2026-11-07 08:48:06 MSK
```

## Yozuv ichida nima bor

Har yozuv — maydonlar to'plami. Ularni `-o json-pretty` ko'rsatadi:

```text
$ journalctl -t ilova -p err -n 1 -o json-pretty --no-pager
{
	"SYSLOG_FACILITY" : "1",
	"PRIORITY" : "3",
	"_PID" : "190",
	"_AUDIT_SESSION" : "1",
	"_RUNTIME_SCOPE" : "system",
	"MESSAGE" : "bazaga ulanib bo'lmadi",
	"_COMM" : "logger",
	"_GID" : "0",
	"_TRANSPORT" : "syslog",
	"_SYSTEMD_UNIT" : "serial-getty@ttyS0.service",
	"_SELINUX_CONTEXT" : "unconfined\n",
	"SYSLOG_IDENTIFIER" : "ilova",
	"_BOOT_ID" : "7800bc9ac05a4416a2804dc8a3d78ed3",
	"_MACHINE_ID" : "a53fab3fde790693a833b1f36aec6b0f",
	"_HOSTNAME" : "trenajor",
	"_CAP_EFFECTIVE" : "1ffffffffff",
	"__MONOTONIC_TIMESTAMP" : "34985232",
	"_UID" : "0",
	"_SYSTEMD_INVOCATION_ID" : "5389b7cb41b44344bfa1490ab4e7e45a",
	"_SYSTEMD_SLICE" : "system-serial\\x2dgetty.slice",
	"__REALTIME_TIMESTAMP" : "1794030628728570",
	"_AUDIT_LOGINUID" : "0",
	"SYSLOG_TIMESTAMP" : "Nov  7 05:50:28 ",
	"_SYSTEMD_CGROUP" : "/system.slice/system-serial\\x2dgetty.slice/serial-getty@ttyS0.service",
	"_SOURCE_REALTIME_TIMESTAMP" : "1794030628727879",
	"__CURSOR" : "s=0e42f071f9d1427e9930c38f6c62f785;i=1be;b=7800bc9ac05a4416a2804dc8a3d78ed3;m=215d510;t=65fa94e576efa;x=a8f1a1479cf0d93e"
}
```

`_PID`, `_UID`, `_COMM` (dastur), `PRIORITY`, `SYSLOG_IDENTIFIER` — har biri bo'yicha filtrlash mumkin. Masalan, 23-bobda `journalctl _COMM=sudo` bilan sudo buyruqlarini ko'rgandik.

## Jurnal qayerda saqlanadi

journald.conf(5) dagi `Storage=`:

| Qiymat | Qayerda |
| --- | --- |
| `volatile` | Faqat xotirada (`/run/log/journal`) — qayta yonganda yo'qoladi |
| `persistent` | Diskda (`/var/log/journal`) |
| `auto` (standart) | `/var/log/journal` papkasi **bo'lsa** — diskda, bo'lmasa — xotirada |

Ya'ni jurnalni doimiy qilish uchun `/var/log/journal` papkasi bo'lishi kifoya. Trenajorda ham, VPS'da ham u bor:

```text
$ ls -ld /var/log/journal
drwxr-sr-x 3 root systemd-journal 0 Nov  5 11:40 /var/log/journal
$ journalctl --disk-usage
Archived and active journals take up 8.0M in the file system.
```

Hajm: journald.conf(5) dagi `SystemMaxUse=`, `SystemKeepFree=` jurnal diskda qancha joy egallashini cheklaydi. Eski yozuvlarni qo'lda tozalash — journalctl(1) dagi `--vacuum-size=` (eski arxiv fayllarni hajm shu chegaradan tushguncha o'chirish) va `--vacuum-time=` (shu muddatdan eskilarini). Disk to'lganda bu — 54-bobda.

VPS'da jurnal 90 MB egallagan:

```text vps
$ journalctl --disk-usage
Archived and active journals take up 90M in the file system.
```

## `/var/log` dagi matnli loglar

Jurnaldan oldin loglar `/var/log/syslog`, `/var/log/auth.log` kabi **matnli** fayllarga yozilgan. Ularni `rsyslog` yozadi. Debian Reference'ga ko'ra systemd'da `rsyslogd` ni olib tashlash mumkin; o'rnatilgan bo'lsa, u jurnal ma'lumotini o'qib, an'anaviy matnli loglarni yaratadi.

Ikki tizimimiz bu yerda farq qiladi:

```text
$ ls /var/log
README	alternatives.log  apt  btmp  dpkg.log  faillog	journal  lastlog  private  wtmp
```

Trenajorda (Debian 12) `rsyslog` yo'q — `syslog` fayli ham yo'q, hamma narsa jurnalda. VPS'da (Ubuntu) esa bor:

```text vps
$ dpkg -l rsyslog logrotate | tail -2
ii  logrotate      3.22.0-1build1      amd64        Log rotation utility
ii  rsyslog        8.2512.0-1ubuntu4.2 amd64        reliable system and kernel logging daemon
$ systemd-analyze cat-config systemd/journald.conf | grep -v "^#" | grep -v "^$"
[Journal]
[Journal]
ForwardToSyslog=yes
$ ls /usr/lib/systemd/journald.conf.d/
syslog.conf
$ grep salom /var/log/syslog | tail -n 3
2026-11-07T08:42:13.353110+03:00 lab systemd[1]: Stopped salom.service - Salom veb-ilovasi (python http.server).
2026-11-07T08:42:13.360203+03:00 lab systemd[1]: Starting salom.service - Salom veb-ilovasi (python http.server)...
2026-11-07T08:42:13.370919+03:00 lab systemd[1]: Started salom.service - Salom veb-ilovasi (python http.server).
```

Ubuntu paketi journald'ga drop-in sozlama (`syslog.conf`, 36-bobdagi drop-in g'oyasi) qo'shgan: `ForwardToSyslog=yes` — jurnal yozuvlarni rsyslog'ga ham uzatadi. Natijada bir xil yozuv ikki joyda: jurnalda va `/var/log/syslog` da. Matnli faylni `grep`, `less`, `tail -F` (17–21-boblar) bilan o'qish mumkin, jurnalning filtrlari (`-u`, `-p`, `-b`) esa qulayroq.

### logrotate

Matnli loglar cheksiz o'smasligi uchun **logrotate** ularni vaqti-vaqti bilan aylantiradi (17-bobdagi `app.log` → `app.log.1`). VPS'da `rsyslog` loglarining sozlamasi:

```text vps
$ cat /etc/logrotate.d/rsyslog
/var/log/syslog
/var/log/mail.log
/var/log/kern.log
/var/log/auth.log
/var/log/user.log
/var/log/cron.log
{
	rotate 4
	weekly
	missingok
	notifempty
	compress
	delaycompress
	sharedscripts
	postrotate
		/usr/lib/rsyslog/rsyslog-rotate
	endscript
}
```

logrotate(8) bo'yicha:

| Direktiva | Ma'nosi |
| --- | --- |
| `weekly` | Haftada bir marta aylantirish |
| `rotate 4` | 4 ta eski nusxa saqlanadi, undan eskisi o'chiriladi |
| `compress` | Eski nusxalar gzip bilan siqiladi (17-bobdagi `zcat`) |
| `delaycompress` | Eng yangi eski nusxa bir davr siqilmasdan qoladi — dastur unga hali yozayotgan bo'lishi mumkin |
| `missingok` | Fayl yo'q bo'lsa — xato bermaslik |
| `notifempty` | Bo'sh faylni aylantirmaslik |
| `postrotate` | Aylantirgandan keyin bajariladigan buyruq (dastur yangi faylga o'tsin) |

logrotate'ni VPS'da cron emas, **systemd timer** ishga tushiradi (VPS shablonida cron yo'q, 38-bob):

```text vps
$ systemctl list-timers logrotate.timer --no-pager
NEXT                        LEFT LAST                        PASSED UNIT            ACTIVATES
Sun 2026-11-08 00:49:07 MSK  16h Sat 2026-11-07 00:57:17 MSK      - logrotate.timer logrotate.service

1 timers listed.
Pass --all to see loaded but inactive timers, too.
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Jurnal (`/var/log/journal`) | Bor, doimiy | Bor, doimiy |
| rsyslog, `/var/log/syslog` | Yo'q | Bor (`ForwardToSyslog=yes`) |
| logrotate | Yo'q | Bor, `logrotate.timer` |

## Tipik xatolar

**1. Servis yiqildi — faqat `systemctl status` ga qarash.**
U oxirgi bir necha qatorni ko'rsatadi.
To'g'risi: `journalctl -u servis -b` yoki `--since`.

**2. Hamma narsani o'qishga urinish.**
Jurnal katta; xatoni qidirishda shovqin ko'p.
To'g'risi: `-p err`, `-u`, `--since` ni birga ishlatish.

**3. Qayta yondirishdan keyin "loglar yo'qoldi".**
Jurnal xotirada (`volatile`) bo'lgan.
To'g'risi: `/var/log/journal` papkasi bormi — tekshirish.

**4. Ilova logini o'zi faylga yozib, aylantirmaslik.**
Disk to'ladi (54-bob).
To'g'risi: chiqishni stdout'ga — jurnalga (35-bob) yoki logrotate sozlamasi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=37-jurnal)** "Jurnaldan qidirish": jurnalga turli darajadagi yozuvlar qo'shasiz va ularni servis, daraja va identifikator bo'yicha topasiz.

Savollar:

1. `nginx` servisining bugungi xatolarini qanday ko'rasiz?
2. Server tunda o'zi qayta yongan. Sababni qayerdan qidirasiz?
3. `journalctl -p warning` qaysi darajalarni ko'rsatadi?
4. Jurnal qayta yonishda yo'qolmasligi uchun nima kerak?
5. Ubuntu'da bitta yozuv nega ham jurnalda, ham `/var/log/syslog` da?

<details>
<summary>Javoblar</summary>

1. `journalctl -u nginx -p err --since today`.
2. `journalctl -b -1` — oldingi yonishning oxiri; `journalctl -k -b -1` — yadro xabarlari.
3. `warning` va undan jiddiyroqlar: `err`, `crit`, `alert`, `emerg`.
4. `/var/log/journal` papkasi (`Storage=auto` da) yoki `Storage=persistent`.
5. `ForwardToSyslog=yes`: journald yozuvlarni rsyslog'ga ham uzatadi, u esa matnli faylga yozadi.

</details>

## Rasmiy hujjat

- [journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)
- [journald.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html)
- [Debian Reference 3.4–3.5](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_the_kernel_message)
- [logrotate(8) — Debian bookworm](https://manpages.debian.org/bookworm/logrotate/logrotate.8.en.html)
- [syslog(3) — daraja nomlari](https://man7.org/linux/man-pages/man3/syslog.3.html)
- [logger(1) — man7.org](https://man7.org/linux/man-pages/man1/logger.1.html)
- Trenajorda: `man journalctl`, `man journald.conf`, `man logger`

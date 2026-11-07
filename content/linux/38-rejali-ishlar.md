# 38 — Rejali ishlar

[← Oldingi: Loglar: journalctl](37-journalctl.md) · [Mundarija](README.md) · [Keyingi: Servisni cheklash →](39-servisni-cheklash.md)

## Tushuncha

Zaxira har kecha, eski fayllarni tozalash har soatda, hisobot har dushanba — bular **rejali ishlar**. Linux'da ularni ikki xil vosita bajaradi:

| | cron | systemd timer |
| --- | --- | --- |
| Nima | `cron` demoni va `crontab` jadvali | `.timer` unit + u ishga tushiradigan `.service` |
| Yozish | Bitta qator | Ikkita unit fayli |
| Log | O'zingiz yo'naltirasiz (yoki pochta) | Jurnalda (`journalctl -u`, 37-bob) |
| Server o'chiq turganda o'tib ketgan ish | Bajarilmaydi (buning uchun `anacron`) | `Persistent=true` bilan yonganda bajariladi |
| Resurs cheklovi, foydalanuvchi, muhit | Qo'lda | Servis sozlamalari (35, 39-boblar) |

Debian Reference ikkalasini ham ko'rsatadi: cron bilan muntazam ishlar va "systemd cron demonisiz ham dasturlarni rejali ishga tushira oladi" — misol sifatida `apt-daily.timer` (27-bob).

Bizning VPS shablonida **cron umuman o'rnatilmagan** (README). U yerdagi hamma rejali ishlar — `apt-daily`, `logrotate` (37-bob) — systemd timer'lari.

## Timer'lar ro'yxati

```text
$ systemctl list-timers --full --no-pager
NEXT                        LEFT           LAST                        PASSED UNIT                         ACTIVATES                     
Sat 2026-11-07 06:16:15 UTC 14min left     -                           -      systemd-tmpfiles-clean.timer systemd-tmpfiles-clean.service
Sat 2026-11-07 06:39:22 UTC 37min left     -                           -      apt-daily-upgrade.timer      apt-daily-upgrade.service
Sat 2026-11-07 13:17:56 UTC 7h left        -                           -      apt-daily.timer              apt-daily.service
Sat 2026-11-07 15:11:05 UTC 9h left        -                           -      man-db.timer                 man-db.service
Sun 2026-11-08 03:10:01 UTC 21h left       -                           -      e2scrub_all.timer            e2scrub_all.service
Mon 2026-11-09 01:37:46 UTC 1 day 19h left -                           -      fstrim.timer                 fstrim.service
-                           -              Sat 2026-11-07 06:01:45 UTC 1s ago dpkg-db-backup.timer         dpkg-db-backup.service

7 timers listed.
Pass --all to see loaded but inactive timers, too.
```

| Ustun | Ma'nosi |
| --- | --- |
| `NEXT`, `LEFT` | Keyingi ishga tushish va unga qancha qoldi |
| `LAST`, `PASSED` | Oxirgi marta qachon ishlagan |
| `UNIT` → `ACTIVATES` | Timer va u ishga tushiradigan servis |

`--full` — nomlarni qisqartirmaslik (terminal tor bo'lsa, ular `…` bilan kesiladi).

## Vaqt ifodalari: `OnCalendar=`

systemd.timer(5) ga ko'ra `OnCalendar=` — kalendar vaqti (systemd.time(7) sintaksisi). Ifodani **sinab ko'rish** uchun `systemd-analyze calendar`:

```text
$ systemd-analyze calendar "Mon..Fri 09:00"
  Original form: Mon..Fri 09:00
Normalized form: Mon..Fri *-*-* 09:00:00
    Next elapse: Mon 2026-11-09 09:00:00 UTC
       From now: 2 days left
$ systemd-analyze calendar --iterations=3 "*:0/15"
  Original form: *:0/15
Normalized form: *-*-* *:00/15:00
    Next elapse: Sat 2026-11-07 06:15:00 UTC
       From now: 13min left
       Iter. #2: Sat 2026-11-07 06:30:00 UTC
       From now: 28min left
       Iter. #3: Sat 2026-11-07 06:45:00 UTC
       From now: 43min left
$ systemd-analyze calendar daily
  Original form: daily
Normalized form: *-*-* 00:00:00
    Next elapse: Sun 2026-11-08 00:00:00 UTC
       From now: 17h left
```

| Ifoda | Ma'nosi |
| --- | --- |
| `Mon..Fri 09:00` | Ish kunlari soat 9:00 da |
| `*:0/15` | Har 15 daqiqada (00, 15, 30, 45) |
| `daily` | Har kuni 00:00 da |
| `*-*-* 02:30` | Har kuni 02:30 da |
| `Sun *-*-* 03:00` | Har yakshanba 03:00 da |

`Normalized form` — systemd ifodani qanday tushungani, `Next elapse` — keyingi ishga tushish. Timer yozishdan oldin ifodani shu buyruq bilan tekshiring.

## Timer yozamiz

Timer ikki unit'dan iborat. Rejali ish — oddiy servis (`Type=oneshot`: bajarib, tugaydi, 35-bob). Timer esa uni vaqtida ishga tushiradi. systemd.timer(5) ga ko'ra `Unit=` yozilmasa, timer o'zi bilan **bir xil nomli** servisni ishga tushiradi.

Trenajorda har 10 soniyada vaqtni faylga yozadigan ish:

```text
$ cat > /etc/systemd/system/vaqt.service <<'EOF'
> [Unit]
> Description=Vaqtni yozish (sinov)
> [Service]
> Type=oneshot
> ExecStart=/bin/sh -c 'date "+%%T ishladi" >> /var/log/vaqt.log'
> EOF
$ cat > /etc/systemd/system/vaqt.timer <<'EOF'
> [Unit]
> Description=Har 10 soniyada (sinov)
> [Timer]
> OnCalendar=*:*:0/10
> AccuracySec=1s
> [Install]
> WantedBy=timers.target
> EOF
$ systemctl daemon-reload
$ systemctl enable --now vaqt.timer
Created symlink /etc/systemd/system/timers.target.wants/vaqt.timer → /etc/systemd/system/vaqt.timer.
$ sleep 25
$ cat /var/log/vaqt.log
06:02:20 ishladi
06:02:30 ishladi
$ systemctl list-timers vaqt.timer --full --no-pager
NEXT                        LEFT    LAST                        PASSED    UNIT       ACTIVATES   
Sat 2026-11-07 06:02:50 UTC 9s left Sat 2026-11-07 06:02:40 UTC 680ms ago vaqt.timer vaqt.service

1 timers listed.
Pass --all to see loaded but inactive timers, too.
```

- **`%%`** — unit fayllarida `%` maxsus belgi (specifier): systemd.unit(5) ga ko'ra oddiy `%` uchun `%%` yoziladi. `date` ga `%T` yetib bordi.
- **`AccuracySec=1s`** — systemd.timer(5) ga ko'ra timer aniqligi standart holatda **1 daqiqa**: ish belgilangan vaqtdan keyingi bir daqiqa ichida, quvvatni tejash uchun tanlangan paytda ishga tushadi. Sinov uchun 1 soniya qildik. Kundalik zaxira uchun standart qiymat yetarli.
- **`WantedBy=timers.target`** — `enable` qilingan timer yonishda ishga tushadi. Servisning o'zini `enable` qilish shart emas — uni timer ishga tushiradi.

Bajarilishlar jurnalda:

```text
$ journalctl -u vaqt --no-pager -o cat | tail -n 3
Starting vaqt.service - Vaqtni yozish (sinov)...
vaqt.service: Deactivated successfully.
Finished vaqt.service - Vaqtni yozish (sinov).
$ systemctl disable --now vaqt.timer
Removed "/etc/systemd/system/timers.target.wants/vaqt.timer".
```

## `Persistent=`: o'tkazib yuborilgan ishni bajarish

Zaxira har kuni 03:00 da. Server shu payt o'chiq yoki qayta yonayotgan bo'lsa-chi? systemd.timer(5): `Persistent=true` bo'lsa, oxirgi ishga tushish vaqti diskda saqlanadi va timer yoqilganda, u o'chiq turgan paytda **kamida bir marta** ishlashi kerak bo'lgan bo'lsa, servis **darhol** ishga tushiriladi.

VPS'da sinadik. Har 2 daqiqada ishlaydigan timer:

```text vps
$ cat /etc/systemd/system/eslatma.timer
[Unit]
Description=Eslatma har 2 daqiqada
[Timer]
OnCalendar=*:0/2
Persistent=true
AccuracySec=1s
[Install]
WantedBy=timers.target
```

U birinchi marta ishlagach, timer'ni to'xtatdik va bir ishga tushish vaqtini (08:56:00) o'tkazib yubordik:

```text vps
$ cat /var/log/eslatma.log
08:54:00 ishladi
$ systemctl stop eslatma.timer
$ date +%T
08:54:01
$ sleep 150
$ date +%T
08:56:31
$ cat /var/log/eslatma.log
08:54:00 ishladi
$ systemctl start eslatma.timer
$ cat /var/log/eslatma.log
08:54:00 ishladi
08:56:31 ishladi
```

Timer yoqilishi bilan (08:56:31) o'tkazib yuborilgan ish **darhol** bajarildi. Server yonganda ham xuddi shunday: timer yoqiladi va o'chiq paytida o'tib ketgan ishni bajaradi.

<div data-animatsiya="qadamli" data-nom="persistent"></div>

systemd.timer(5) yana ikki narsani aytadi: `Persistent=` faqat `OnCalendar=` timer'larida ishlaydi, `RandomizedDelaySec=` esa ishga tushishni tasodifiy vaqtga suradi — bir xil sozlangan ko'p ishlar bir paytda boshlanib, resursga talash bo'lmasligi uchun.

## cron

cron'ning jadvali — **crontab**. Debian Reference'dagi format:

```text
# daq soat kun oy hafta_kuni buyruq
5  0  *  *  *   $HOME/bin/daily.job >> $HOME/tmp/out 2>&1
```

crontab(5) bo'yicha maydonlar:

| Maydon | Qiymatlar |
| --- | --- |
| daqiqa | 0–59 |
| soat | 0–23 |
| oy kuni | raqam |
| oy | raqam yoki nomi |
| hafta kuni | 0–7 (0 va 7 — yakshanba) yoki nomi |

`*` — "har qanday". `5 0 * * *` — har kuni 00:05 da.

Trenajorda `cron` bor. Har daqiqada ishlaydigan qator qo'shamiz:

```text
$ echo '* * * * * date "+\%T cron ishladi" >> /tmp/cron.log' | crontab -
$ crontab -l
* * * * * date "+\%T cron ishladi" >> /tmp/cron.log
$ sleep 65
$ cat /tmp/cron.log
06:03:01 cron ishladi
$ crontab -r
```

- `crontab -` — jadvalni stdin'dan o'rnatish (interaktiv tahrirlash — `crontab -e`, 16-bobdagi muharrir bilan). `crontab -l` — ko'rish, `crontab -r` — o'chirish.
- **`\%`** — crontab(5) ga ko'ra buyruqdagi `%` yangi qatorga aylanadi va undan keyingi hamma narsa buyruqqa stdin sifatida beriladi. Shuning uchun `date` formatidagi `%` oldiga `\` qo'yildi.

Tizimning o'z jadvali — `/etc/crontab`:

```text
$ grep -v '^#' /etc/crontab | grep -v '^$'
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
17 *	* * *	root	cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6	* * 7	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6	1 * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
```

Bu yerda foydalanuvchi ustuni bor (`root`) va `/etc/cron.hourly/`, `cron.daily/`, `cron.weekly/`, `cron.monthly/` papkalaridagi skriptlar ishga tushiriladi. Debian Reference'ga ko'ra uzluksiz ishlamaydigan kompyuterda o'tib ketgan ishlar uchun `anacron` paketi kerak — `test -x /usr/sbin/anacron ||` qatorlari shunga ishora.

## Bir martalik ish

systemd'da kelajakdagi bir martalik ish — vaqtinchalik timer (`systemd-run`, 29–31-boblarda ishlatganmiz). `--on-active=5s` — 5 soniyadan keyin:

```text
$ systemd-run --on-active=5s --timer-property=AccuracySec=1s --unit=birmarta /bin/sh -c 'date "+%T birmarta" >> /tmp/birmarta.log'
Running timer as unit: birmarta.timer
Will run service as unit: birmarta.service
$ sleep 8
$ cat /tmp/birmarta.log
06:03:59 birmarta
```

Bu yerda `%` bitta: buyruq unit fayliga emas, to'g'ridan-to'g'ri `systemd-run` ga berildi. `AccuracySec=1s` siz ish 1 daqiqagacha kechikishi mumkin edi. Debian Reference bir martalik ish uchun `at(1)` buyrug'ini ham ko'rsatadi (`echo 'buyruq' | at 3:40 monday`). Trenajorda u o'rnatilmagan.

## Qaysi birini tanlash

| Holat | Tavsiya |
| --- | --- |
| Server cron'siz (bizning VPS kabi) | systemd timer |
| Natijani jurnalda ko'rish, xotira/CPU cheklovi, alohida foydalanuvchi | systemd timer |
| Server o'chiq turgan bo'lishi mumkin | timer + `Persistent=true` (yoki cron + `anacron`) |
| Oddiy, bir qatorli ish, cron allaqachon bor | cron yetarli |

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| cron | O'rnatilgan | Shablonda yo'q |
| `apt-daily` | timer | timer |
| logrotate | O'rnatilmagan | timer |
| systemd | 252 | 259 |

## Tipik xatolar

**1. Timer ishlamayapti — `enable` qilinmagan.**
To'g'risi: `systemctl enable --now ish.timer`, tekshirish — `systemctl list-timers`.

**2. Timer emas, servis `enable` qilingan.**
Servis yonishda bir marta ishlaydi va boshqa ishga tushmaydi.
To'g'risi: timer'ni `enable` qilish.

**3. Unit faylida `%` ni bitta yozish.**
systemd uni maxsus belgi deb o'qiydi.
To'g'risi: `%%`. (crontab'da esa `\%`.)

**4. "Har daqiqada ishlashi kerak edi, kechikyapti".**
`AccuracySec=` standart holatda 1 daqiqa.

**5. Zaxira server o'chiq paytda o'tib ketdi.**
To'g'risi: `Persistent=true`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=38-timer)** "Rejali ish": kalendar ifodasini tekshirasiz, timer va servis yozasiz, uning ishlayotganini ko'rasiz va o'chirasiz.

Savollar:

1. Har kuni soat 02:30 da ishlash uchun `OnCalendar=` qanday yoziladi va qanday tekshiriladi?
2. `nightly.timer` ishlamayapti. Birinchi nimani tekshirasiz?
3. Server 03:00 da qayta yongan va zaxira o'tib ketgan. Qanday oldini olasiz?
4. Unit fayldagi `date +%F` nega xato beradi?
5. cron va timer'dan qaysi biri ishning chiqishini o'zi saqlaydi?

<details>
<summary>Javoblar</summary>

1. `OnCalendar=*-*-* 02:30` (yoki `02:30`), tekshirish — `systemd-analyze calendar "*-*-* 02:30"`.
2. `systemctl list-timers` — ro'yxatda bormi, `NEXT` qachon; yo'q bo'lsa — `enable --now` qilinmagan.
3. `Persistent=true`.
4. `%` — systemd specifier; `%%F` yozish kerak.
5. systemd timer: servis chiqishi jurnalga tushadi.

</details>

## Rasmiy hujjat

- [systemd.timer(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html) — `OnCalendar=`, `Persistent=`, `AccuracySec=`, `RandomizedDelaySec=`, `Unit=`
- [systemd.time(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.time.html) — kalendar ifodalari
- [systemd.unit(5) — specifier'lar (`%%`)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)
- [Debian Reference 9.4.13–9.4.14](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_scheduling_tasks_regularly)
- [crontab(5) — Debian bookworm](https://manpages.debian.org/bookworm/cron/crontab.5.en.html)
- Trenajorda: `man systemd.timer`, `man systemd.time`, `man 5 crontab`

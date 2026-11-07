# 34 — systemctl

[← Oldingi: Server qanday yonadi](33-server-qanday-yonadi.md) · [Mundarija](README.md) · [Keyingi: O'z servisingiz →](35-oz-servisingiz.md)

## Tushuncha

`systemctl` — systemd'ni boshqarish buyrug'i. Servis bilan ikki xil ish qilinadi va ular **bir-biriga bog'liq emas**:

| | **Hozir** | **Yonishda** |
| --- | --- | --- |
| Savol | Servis hozir ishlayaptimi? | Server yonganda o'zi ishga tushadimi? |
| Buyruqlar | `start`, `stop`, `restart`, `reload` | `enable`, `disable` |
| Tekshirish | `is-active` | `is-enabled` |

Ko'p uchraydigan xato: servisni `start` qilib, `enable` qilmaslik. Server qayta yonguncha hammasi ishlaydi, keyin esa servis "o'zi o'chib qoladi".

## `status`

```text
$ systemctl status cron --no-pager
● cron.service - Regular background program processing daemon
     Loaded: loaded (/lib/systemd/system/cron.service; enabled; preset: enabled)
     Active: active (running) since Thu 2026-11-05 11:41:20 UTC; 1 day 17h ago
       Docs: man:cron(8)
   Main PID: 151 (cron)
      Tasks: 1 (limit: 527)
     Memory: 288.0K
        CPU: 68ms
     CGroup: /system.slice/cron.service
             └─151 /usr/sbin/cron -f

Nov 05 11:41:20 trenajor systemd[1]: Started cron.service - Regular background program proces…aemon.
Nov 05 11:41:20 trenajor cron[151]: (CRON) INFO (pidfile fd = 3)
Nov 05 11:41:20 trenajor cron[151]: (CRON) INFO (Running @reboot jobs)
Hint: Some lines were ellipsized, use -l to show in full.
```

| Qator | Ma'nosi |
| --- | --- |
| `●` / `○` / `×` | Faol / faol emas / xato bilan to'xtagan |
| `Loaded` | Unit fayli qayerdan o'qildi; `enabled` — yonishda ishga tushadi; `preset` — paket taklif qilgan holat |
| `Active` | Hozirgi holat va qachondan beri |
| `Main PID` | Asosiy jarayon (28-bob) |
| `Tasks`, `Memory`, `CPU` | Servis guruhining (cgroup) resurslari (31-bob) |
| `CGroup` | Servisga tegishli barcha jarayonlar |
| Oxirgi qatorlar | Servis jurnalining oxirgi yozuvlari (37-bob) |

`--no-pager` — chiqishni pager'siz (17-bob) chiqarish. Uzun qatorlar `…` bilan qisqartirilgan; to'liq ko'rish uchun `-l`.

## Hozir: `start`, `stop`, `restart`, `reload`

```text
$ systemctl stop cron
$ systemctl is-active cron; echo "kod: $?"
inactive
kod: 3
$ systemctl start cron
$ systemctl is-active cron
active
```

systemctl(1) ga ko'ra `is-active` unit faol bo'lsa `0` kodi bilan, aks holda noldan farqli kod bilan chiqadi. Skriptlarda shart sifatida qulay (12-bob):

```bash
systemctl is-active --quiet nginx || echo "nginx ishlamayapti"
```

| Buyruq | systemctl(1) bo'yicha |
| --- | --- |
| `start` | Ishga tushirish |
| `stop` | To'xtatish (29-bob: avval SIGTERM) |
| `restart` | To'xtatib, qayta ishga tushirish. Ishlamayotgan bo'lsa — ishga tushiradi |
| `reload` | Servisdan **o'z sozlamasini** qayta o'qishni so'rash, jarayon to'xtamaydi |
| `reload-or-restart` | Servis `reload` ni bilsa — reload, bilmasa — restart |

`reload` ni hamma servis ham bilmaydi:

```text
$ systemctl show -p CanReload cron
CanReload=no
$ systemctl reload cron; echo "kod: $?"
Failed to reload cron.service: Job type reload is not applicable for unit cron.service.
kod: 3
```

systemctl(1) dagi muhim farq: `reload` servisning o'z sozlamasini (masalan, nginx'ning `nginx.conf` ini) qayta o'qitadi, systemd unit faylini **emas**. Unit faylini o'zgartirgandan keyin `systemctl daemon-reload` kerak (36-bob).

## Yonishda: `enable`, `disable`

systemctl(1) ga ko'ra `enable` unit faylining `[Install]` bo'limida yozilgan **havolalarni** yaratadi va shu bilan cheklanadi — servisni **ishga tushirmaydi**. 33-bobda `cron.service` da `WantedBy=multi-user.target` bor edi:

```text
$ systemctl disable cron
Synchronizing state of cron.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install disable cron
Removed "/etc/systemd/system/multi-user.target.wants/cron.service".
$ systemctl is-enabled cron; systemctl is-active cron
disabled
active
$ systemctl enable --now cron
Synchronizing state of cron.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable cron
Created symlink /etc/systemd/system/multi-user.target.wants/cron.service → /lib/systemd/system/cron.service.
$ systemctl is-enabled cron
enabled
```

- `disable` `/etc/systemd/system/multi-user.target.wants/` dagi havolani o'chirdi. Servis esa **hali ishlayapti** (`active`).
- `enable` havolani qayta yaratdi: endi `multi-user.target` ishga tushganda `cron` ham ishga tushadi.
- `--now` — systemctl(1): `enable` bilan birga ishga tushiradi, `disable` bilan birga to'xtatadi.
- `Synchronizing state ... SysV` qatorlari — Debian'da `cron` uchun eski uslubdagi `/etc/init.d/cron` skripti ham bor (25-bobdagi conffile), systemctl uni ham moslashtirdi.

### Qayta yonish bilan isbot

Trenajorni qayta yondirib bo'lmaydi, shuning uchun farqni VPS'da `tuned` servisi bilan ko'rsatdik. Servisni `disable` qildik, lekin to'xtatmadik:

```text vps
$ systemctl is-enabled tuned
enabled
$ systemctl disable tuned
Removed '/etc/systemd/system/multi-user.target.wants/tuned.service'.
$ systemctl is-enabled tuned
disabled
$ systemctl is-active tuned
active
$ systemctl reboot
```

Qayta yongandan keyin:

```text vps
$ systemctl is-enabled tuned
disabled
$ systemctl is-active tuned
inactive
$ systemctl enable --now tuned
Created symlink '/etc/systemd/system/multi-user.target.wants/tuned.service' → '/usr/lib/systemd/system/tuned.service'.
$ systemctl is-active tuned
active
```

<div data-animatsiya="qadamli" data-nom="enable-start"></div>

| Holat | Hozir | Qayta yonganda |
| --- | --- | --- |
| `start` qilingan, `enable` emas | Ishlaydi | **Ishga tushmaydi** |
| `enable` qilingan, `start` emas | Ishlamaydi | Ishga tushadi |
| `enable --now` | Ishlaydi | Ishga tushadi |

## `mask`: butunlay taqiqlash

systemctl(1) ga ko'ra `mask` unit faylini `/dev/null` ga bog'laydi va uni ishga tushirib bo'lmaydi — na qo'lda, na `enable` bilan, na boshqa unit bog'liqligi orqali. Bu `disable` ning kuchli shakli:

```text
$ systemctl mask --now cron
Created symlink /etc/systemd/system/cron.service → /dev/null.
$ ls -l /etc/systemd/system/cron.service
lrwxrwxrwx 1 root root 9 Nov  7 05:17 /etc/systemd/system/cron.service -> /dev/null
$ systemctl start cron
Failed to start cron.service: Unit cron.service is masked.
$ systemctl unmask cron
Removed "/etc/systemd/system/cron.service".
$ systemctl start cron
$ systemctl is-active cron
active
```

systemctl(1) ehtiyot bo'lib ishlatishni so'raydi: `mask` qilingan servisni hatto unga bog'liq boshqa unit ham ishga tushira olmaydi.

## Xato bilan to'xtagan servislar

```text
$ systemd-run --unit=yiqiladi false
Running as unit: yiqiladi.service
$ sleep 1
$ systemctl list-units --failed --no-pager
  UNIT             LOAD   ACTIVE SUB    DESCRIPTION   
● yiqiladi.service loaded failed failed /usr/bin/false

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state, i.e. generalization of SUB.
SUB    = The low-level unit activation state, values depend on unit type.
1 loaded units listed.
$ systemctl status yiqiladi --no-pager | head -n 5
× yiqiladi.service - /usr/bin/false
     Loaded: loaded (/run/systemd/transient/yiqiladi.service; transient)
  Transient: yes
     Active: failed (Result: exit-code) since Sat 2026-11-07 05:17:49 UTC; 1s ago
   Duration: 35ms
$ systemctl reset-failed yiqiladi
$ systemctl list-units --failed --no-pager
  UNIT LOAD ACTIVE SUB DESCRIPTION
0 loaded units listed.
```

- `false` — doim `1` kodi bilan chiqadigan buyruq. Servis darhol yiqildi.
- `--failed` — xato bilan to'xtagan unit'lar. Serverga kirganda birinchi tekshiriladigan narsalardan biri.
- `Result: exit-code` — sabab: dastur noldan farqli kod bilan chiqdi. 31-bobda `oom-kill` ni ko'rgandik.
- `reset-failed` — "failed" holatini tozalash (sababini bilib olgandan keyin).

Nega yiqilganini topish — 37-bob (jurnal) va 52-bob ("Servis ishlamayapti").

## VPS'da

```text vps
$ systemctl list-units --failed --no-pager
  UNIT LOAD ACTIVE SUB DESCRIPTION

0 loaded units listed.
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| systemd | 252 | 259 |
| `enable` chiqishi | `Created symlink /etc/... → /lib/...` | `Created symlink '/etc/...' → '/usr/lib/...'` (qo'shtirnoq bilan) |
| `status` dagi `Invocation:` qatori | Yo'q | Bor (har ishga tushirishning ID'si) |

Buyruqlar bir xil.

## Tipik xatolar

**1. `start` qilib, `enable` ni unutish.**
Qayta yonishdan keyin servis ishlamaydi.
To'g'risi: `systemctl enable --now servis`.

**2. Unit faylini o'zgartirib, `reload` qilish.**
`reload` servisning o'z sozlamasini o'qitadi, unit faylini emas.
To'g'risi: `systemctl daemon-reload`, keyin `restart` (36-bob).

**3. `reload` ni qo'llab-quvvatlamaydigan servisga `reload`.**
`Job type reload is not applicable`.
To'g'risi: `reload-or-restart`.

**4. `disable` servisni to'xtatadi deb o'ylash.**
To'g'risi: `disable --now` yoki alohida `stop`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=34-systemctl)** "Servisni boshqarish": `cron` ni to'xtatasiz, ishga tushirasiz, yonishdan olib tashlaysiz va qaytarasiz.

Savollar:

1. `enable` va `start` farqi nima?
2. Servis `disabled`, lekin `active`. Server qayta yonsa nima bo'ladi?
3. nginx sozlamasini o'zgartirdingiz. `reload` mi, `daemon-reload` mi?
4. Serverga kirdingiz. Yiqilgan servislar bormi — qanday bilasiz?
5. `disable` va `mask` farqi nima?

<details>
<summary>Javoblar</summary>

1. `start` — hozir ishga tushiradi. `enable` — yonishda ishga tushadigan qiladi (havola yaratadi), lekin hozir ishga tushirmaydi.
2. Servis ishga tushmaydi.
3. `systemctl reload nginx` — servisning o'z sozlamasi. `daemon-reload` — unit fayli o'zgarganda.
4. `systemctl list-units --failed`.
5. `disable` faqat yonishdagi havolani olib tashlaydi, servisni qo'lda yoki bog'liqlik orqali ishga tushirish mumkin. `mask` uni butunlay taqiqlaydi.

</details>

## Rasmiy hujjat

- [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)
- [Debian Reference 3.3 — Systemd](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_systemd)
- [Debian Reference 3.6 — System management](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_system_management_operations)
- Trenajorda: `man systemctl`

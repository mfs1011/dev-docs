# 02 — ⚑ Boshlang'ich holatni tekshirish

[Mundarija](README.md)

## Tushuncha

Serverni himoyalashdan oldin uning **hozirgi holatini** bilish kerak — aks holda nimani o'zgartirayotganingizni bilmaysiz. UB (Security suggestions) uchta yo'nalishni tavsiya qiladi: yangilanishlar, kirish nazorati, tarmoq. Shu bobda har biri bo'yicha "hozir qanday" degan savolga javob beramiz.

⚑ Har buyruq rasmiy manbadan; tekshirish ketma-ketligi — VPS'da sinalgan amaliyot.

| Savol | Buyruq | Manba |
| --- | --- | --- |
| Qaysi portlar ochiq, kim tinglayapti? | `ss -tulpn` | UM ss(8): `-t` TCP, `-u` UDP, `-l` faqat tinglayotganlar, `-p` jarayon, `-n` raqamli |
| Qaysi servislar ishlayapti? | `systemctl list-units --type=service --state=running` | systemd (Linux kitobi) |
| SSH qanday sozlangan? | `sshd -T` | SSH sshd(8): `-T` — konfiguratsiyani tekshirib, **amaldagi** sozlamani chiqaradi |
| Kim kira oladi? | `/etc/passwd` dagi qobiqlar, `sudo` guruhi, `authorized_keys` | Linux kitobi |
| Yangilanishlar qachon? | `/var/log/apt/history.log`, `apt list --upgradable`, `/var/run/reboot-required` | 3–5-boblar |
| Firewall? | `ufw status` | 14-bob |

`sshd -T` muhim: `sshd_config` faylida yozilgan emas, `Include` qilingan fayllar va standart qiymatlar bilan birga **haqiqatda ishlaydigan** sozlama.

## Ko'rib chiqamiz

Sinov VPS'i (provayder shablonidan o'rnatilgan Ubuntu, ustida avvalgi kitoblar uchun Docker, Redis, nginx, PHP-FPM).

### Tizim

```text vps
$ lsb_release -ds; uname -r; uptime -p
Ubuntu 26.04.1 LTS
7.0.0-42-generic
up 1 day, 15 hours, 59 minutes
```

### Ochiq portlar

```text vps
$ ss -tulpn | awk 'NR>1 {split($7,a,"\""); print $1, $5, a[2]}' | sort -u -k2
tcp 0.0.0.0:22 sshd
tcp 0.0.0.0:80 nginx
udp 127.0.0.1:323 chronyd
tcp 127.0.0.1:5000 docker-proxy
tcp 127.0.0.1:6379 redis-server
tcp 127.0.0.1:8085 docker-proxy
udp 127.0.0.53%lo:53 systemd-resolve
udp 127.0.0.54:53 systemd-resolve
udp [::1]:323 chronyd
tcp [::1]:6379 redis-server
tcp [::]:22 sshd
```

| Manzil | Ma'nosi |
| --- | --- |
| `0.0.0.0:22`, `[::]:22` (sshd) | SSH — **barcha** IPv4 va IPv6 manzillarda, internetdan ochiq |
| `0.0.0.0:80` (nginx) | Veb — internetdan ochiq |
| `127.0.0.1:…`, `[::1]:…` | Faqat serverning o'zidan: Redis, Docker konteynerlari, chrony, DNS keshi |

Internetga ochiq — faqat **22 va 80**. Boshqa servislar faqat lokal (`127.0.0.1`) manzilda — tashqaridan yetib bo'lmaydi.

### Servislar

```text vps
$ systemctl list-units --type=service --state=running --no-legend --plain | awk '{print $1}' | xargs echo
chrony.service containerd.service dbus.service docker.service getty@tty1.service nginx.service php8.5-fpm.service polkit.service qemu-guest-agent.service redis-server.service rsyslog.service ssh.service systemd-journald.service systemd-logind.service systemd-resolved.service systemd-udevd.service tuned.service unattended-upgrades.service user@0.service
```

Har biri — potensial hujum yuzasi. Kerakmi-yo'qmi — o'zingiz bilasiz: masalan, `php8.5-fpm` faqat Nginx kitobi sinovlari uchun o'rnatilgan.

### SSH

```text vps
$ sshd -T 2>/dev/null | grep -E '^(port|permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|permitemptypasswords|maxauthtries|x11forwarding) '
port 22
maxauthtries 6
permitrootlogin yes
pubkeyauthentication yes
passwordauthentication yes
kbdinteractiveauthentication no
x11forwarding yes
permitemptypasswords no
```

| Sozlama | Hozir | Ma'nosi | Bob |
| --- | --- | --- | --- |
| `permitrootlogin` | **`yes`** | root to'g'ridan-to'g'ri, parol bilan ham kira oladi | 9–10 |
| `passwordauthentication` | **`yes`** | Parol bilan kirish ochiq — 1-bobdagi 28 ming urinish aynan shunga | 10 |
| `pubkeyauthentication` | `yes` | Kalit bilan kirish | 10 |
| `maxauthtries` | `6` | Bir ulanishda 6 urinish | 9 |
| `x11forwarding` | `yes` | Serverda grafik dasturlar kerak bo'lmasa — keraksiz | 9 |
| `permitemptypasswords` | `no` | Bo'sh parol bilan kirish yo'q | — |

### Foydalanuvchilar

```text vps
$ awk -F: '$7 !~ /(nologin|false|sync)$/ {print $1, $3, $7}' /etc/passwd; getent group sudo; ls /root/.ssh/authorized_keys && wc -l < /root/.ssh/authorized_keys | sed 's/^/root kalitlari: /'
root 0 /bin/bash
sudo:x:27:
/root/.ssh/authorized_keys
root kalitlari: 3
```

Kirish qobig'i bor yagona foydalanuvchi — **root**; `sudo` guruhi bo'sh; root'da 3 ta SSH kaliti. Ya'ni hamma ish root bilan — eng kam huquq tamoyiliga zid (7-bob).

### Yangilanishlar

```text vps
$ grep -E '^Start-Date' /var/log/apt/history.log | tail -1; ls -l --time-style=+%F_%T /var/lib/apt/lists/ | awk 'NR>1{print $6}' | sort | tail -1 | sed 's/^/apt ro.yxatlari oxirgi yangilangan: /'; apt list --upgradable 2>/dev/null | tail -n +2 | wc -l | sed 's/^/yangilanishi kerak paketlar: /'; [ -f /var/run/reboot-required ] && echo 'reboot kerak' || echo 'reboot shart emas'
Start-Date: 2026-11-08  20:51:34
apt ro.yxatlari oxirgi yangilangan: 2026-11-08_20:02:17
yangilanishi kerak paketlar: 5
reboot shart emas
```

Oxirgi `apt` amali kecha; 5 ta paket yangilanishni kutmoqda; reboot hozircha shart emas (3–5-boblar).

### Firewall

```text vps
$ ufw status | grep -v '(v6)'; dpkg -l unattended-upgrades fail2ban 2>/dev/null | awk '/^[a-z]/ {print $1, $2, $3}'
Status: active

To                         Action      From
--                         ------      ----
80/tcp                     ALLOW       Anywhere                  
443                        ALLOW       Anywhere                  
22/tcp                     ALLOW       Anywhere                  
ispmanager                 ALLOW       Anywhere                  

ii unattended-upgrades 2.12ubuntu9
$ ufw app info ispmanager | grep -A3 -i 'port'
Ports:
  1500,1501/tcp
```

Kuzatildi: provayder shablonida `ufw` **yoqilgan**: 80, 443, 22 va `ispmanager` profili (1500, 1501/tcp — provayder boshqaruv paneli portlari; VPS'da ular tinglanmaydi) — internetdan ochiq ruxsat. 443 da hozir hech narsa tinglamaydi. Firewall — 14–17-boblar.

### Xulosa: nimani tuzatish kerak

| Topilma | Bob |
| --- | --- |
| 5 ta paket yangilanmagan | 3 |
| Avtomatik yangilanish sozlamasini tekshirish | 4 |
| Hamma ish root bilan, `sudo` foydalanuvchi yo'q | 7 |
| root SSH bilan va parol bilan kira oladi | 9–10 |
| `ufw` da keraksiz ruxsatlar (443, `ispmanager`) | 14–15 |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `sshd_config` ni o'qib, sozlama shu deb o'ylash | `Include` va standart qiymatlar ham ta'sir qiladi | `sshd -T` |
| `ss` siz "port yopiq" deb o'ylash | Servis `0.0.0.0` da tinglashi mumkin | `ss -tulpn` |
| `127.0.0.1` va `0.0.0.0` farqini bilmaslik | Biri faqat lokal, ikkinchisi — hammaga | Manzil ustuniga qarash |
| Provayder shablonini "toza Ubuntu" deb o'ylash | O'z sozlamalari bo'lishi mumkin (sinovda `ufw` qoidalari) | Har serverni o'zi tekshirish |
| Avval o'zgartirib, keyin tekshirish | Nima o'zgarganini bilmaysiz | Avval holatni yozib olish |

## Amaliyot

1. `ss -tulpn` dagi har bir harf nimani bildiradi?
2. `0.0.0.0:22` va `127.0.0.1:6379` farqi nima?
3. Nega `sshd_config` emas, `sshd -T`?
4. VPS'da SSH sozlamasida qaysi ikki xavfli qiymat topildi?
5. Kirish qobig'i bor foydalanuvchilarni qanday topasiz?
6. Qayta ishga tushirish kerakligini qayerdan bilasiz?

<details>
<summary>Javoblar</summary>

1. `t` — TCP, `u` — UDP, `l` — tinglayotganlar, `p` — jarayon, `n` — raqamli manzillar.
2. Birinchisi barcha manzillarda (internetdan ham), ikkinchisi faqat serverning o'zidan.
3. `sshd -T` amaldagi sozlamani — `Include` va standart qiymatlar bilan — ko'rsatadi.
4. `permitrootlogin yes` va `passwordauthentication yes`.
5. `/etc/passwd` dagi oxirgi maydon — `nologin`/`false` bo'lmaganlar.
6. `/var/run/reboot-required` fayli bor-yo'qligidan.

</details>

## Rasmiy hujjat

- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/)
- [UM: ss(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ss.8.html)
- [SSH: sshd(8)](https://man.openbsd.org/sshd.8) — `-T`

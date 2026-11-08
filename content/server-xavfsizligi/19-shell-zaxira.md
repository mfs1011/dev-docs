# 19 — Shell skript bilan zaxira

[Mundarija](README.md)

## Tushuncha

UB (Security suggestions, 1-bob): himoya qatlamlaridan biri — **zaxira nusxa**. Server buzilsa, disk ishdan chiqsa yoki xato bilan fayl o'chirilsa — tiklash uchun.

UB (How to back up using shell scripts): odatda shell skript qaysi papkalarni zaxiralashni belgilaydi va ularni **`tar`** ga beradi; `tar` ko'p fayl va papkadan bitta **arxiv** yasaydi, siqish bilan hajmni kamaytiradi. Arxiv keyin boshqa joyga ko'chiriladi.

### Skript (UB)

UB'dagi oddiy skript — o'zgaruvchilar:

| O'zgaruvchi | Nima |
| --- | --- |
| `backup_files` | Qaysi papkalar (UB misoli: `/home /var/spool/mail /etc /root /boot /opt`) |
| `dest` | Qayerga (UB misolida — **NFS** bilan ulangan boshqa server diski) |
| `day` | Hafta kuni — har kunga alohida arxiv, 7 kunlik tarix |
| `hostname` | Qisqa nom — bir nechta server arxivlari bitta joyda |
| `tar czf $dest/$archive_file $backup_files` | `c` — yaratish, `z` — gzip bilan siqish, `f` — faylga |

### Aylantirish (rotation)

UB: oddiy skript 7 ta arxivni saqlaydi, keyin hafta kunlari takrorlanib ustidan yoziladi. Murakkabroq — **bobo-ota-bola** sxemasi (oylik-haftalik-kunlik):

- yakshanbadan jumagacha — **kunlik** (`host-Monday.tgz` …);
- shanba — **haftalik** (oyning nechanchi haftasi: `week1` … `week4`);
- oyning 1-kuni — **oylik**, toq/juft oyga qarab ikkita (`month1`, `month2`).

### Ishga tushirish va `cron`

UB: `chmod u+x backup.sh`, `sudo ./backup.sh` — sinab ko'rish. Avtomatik — **`cron`**: `sudo crontab -e` (root'ning crontab'i — root'gina o'qiy oladigan papkalar uchun). Maydonlar: daqiqa, soat, oy kuni, oy, hafta kuni (0 va 7 — yakshanba), buyruq:

```text
# m h dom mon dow   command
0 0 * * * bash /usr/local/bin/backup.sh
```

`0 0 * * *` — har kuni soat 00:00 da (UB matnida "12:00 pm" deb yozilgan, lekin `0 0` — yarim tun).

### Tiklash

UB: arxiv yaratilgach uni **sinash** kerak — ro'yxatini ko'rish mumkin, lekin eng yaxshi sinov — **faylni tiklash**:

| Buyruq | Nima |
| --- | --- |
| `tar -tzvf arxiv.tgz` | Arxiv ichidagi ro'yxat |
| `tar -xzvf arxiv.tgz -C /tmp etc/hosts` | Bitta faylni boshqa papkaga (yetakchi `/` yo'q — `etc/hosts`) |
| `cd / && sudo tar -xzvf arxiv.tgz` | Hammasini — **joriy fayllar ustidan yoziladi** |

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). UB'dagi aylantirish skripti — faqat ikki qator o'zgartirildi: zaxira papkalari `/etc` va `/root`, manzil — sinov uchun lokal papka (UB misolida — boshqa serverdagi NFS; haqiqiy zaxira **boshqa kompyuterda** bo'lishi kerak — 20-bob):

```text vps
$ install -m 700 /root/backup.sh /usr/local/bin/backup.sh; rm /root/backup.sh; mkdir -p /var/backups/sinov; grep -nE '^(backup_files|dest)=' /usr/local/bin/backup.sh
10:backup_files="/etc /root"
13:dest="/var/backups/sinov"
$ /usr/local/bin/backup.sh 2>&1 | grep -v '^$'
Backing up /etc /root to /var/backups/sinov/lab-Monday.tgz
Mon Nov  9 00:33:37 MSK 2026
tar: Removing leading `/' from member names
tar: Removing leading `/' from hard link targets
Backup finished
Mon Nov  9 00:33:40 MSK 2026
total 12M
-rw-r--r-- 1 root root 12M Nov  9 00:33 lab-Monday.tgz
```

Bugun dushanba — kunlik arxiv `lab-Monday.tgz`, 12 MB. `tar` yetakchi `/` ni olib tashladi.

### Arxiv kimga ochiq

```text vps
$ ls -l /var/backups/sinov | awk 'NR>1 {print $1, $3, $5, $NF}'; ls -ld /var/backups/sinov | awk '{print $1, $3, $NF}'
-rw-r--r-- root 12207213 lab-Monday.tgz
drwxr-xr-x root /var/backups/sinov
$ f=$(ls /var/backups/sinov/*.tgz); tar -tzvf $f | wc -l | sed 's/^/arxivdagi yozuvlar: /'; tar -tzf $f | grep -E '^(etc/hosts|etc/shadow|root/boshqaruv-parol|root/.ssh/authorized_keys)$'
arxivdagi yozuvlar: 2965
etc/hosts
etc/shadow
root/boshqaruv-parol
root/.ssh/authorized_keys
```

Kuzatildi: arxiv **`-rw-r--r--`** — serverdagi **har qanday** foydalanuvchi o'qiy oladi. Ichida esa `etc/shadow` (parol xeshlari), `root/boshqaruv-parol` (7-bob) va SSH kalitlar ro'yxati. Fayllarning o'zi faqat root uchun, lekin arxiv ularni hammaga ochib qo'ydi.

### Tiklash sinovi

```text vps
$ mkdir -p /tmp/tiklash && tar -xzvf $f -C /tmp/tiklash etc/hosts; diff /etc/hosts /tmp/tiklash/etc/hosts && echo "farq yo'q"; rm -rf /tmp/tiklash
etc/hosts
farq yo'q
```

`etc/hosts` vaqtinchalik papkaga tiklandi va asl bilan farqi yo'q.

### `cron`

```text vps
$ (crontab -l 2>/dev/null; echo '0 0 * * * bash /usr/local/bin/backup.sh') | crontab -; crontab -l | tail -1; crontab -l | grep -v 'backup.sh' | crontab -; crontab -l 2>&1 | grep -c backup.sh
/tmp/.vpsrun-57946.sh: line 19: crontab: command not found
/tmp/.vpsrun-57946.sh: line 19: crontab: command not found
/tmp/.vpsrun-57946.sh: line 19: crontab: command not found
/tmp/.vpsrun-57946.sh: line 19: crontab: command not found
0
```

Kuzatildi: provayder shablonida `cron` paketi **yo'q** — `crontab` buyrug'i topilmadi.

```text vps
$ dpkg -l cron 2>/dev/null | awk '/^[a-z]/ {print $1, $2, $3}' || true; DEBIAN_FRONTEND=noninteractive apt-get install -y -q cron 2>&1 | grep -E '^Setting up cron '; systemctl is-active cron
ii cron 3.0pl1-200ubuntu1
active
$ (crontab -l 2>/dev/null; echo '0 0 * * * bash /usr/local/bin/backup.sh') | crontab -; crontab -l | tail -1
0 0 * * * bash /usr/local/bin/backup.sh
```

`cron` Ubuntu omboridan o'rnatildi (birinchi urinishda, 00:34 da; bu yerda — holati); root crontab'iga yozuv qo'shildi.

### Arxivni himoyalash

`umask 077` — yangi fayllar faqat egasi uchun; papka — `700`:

```text vps
$ install -m 700 /root/backup.sh /usr/local/bin/backup.sh; rm /root/backup.sh; install -d -m 700 /var/backups/sinov; (umask 077; /usr/local/bin/backup.sh > /dev/null 2>&1); ls -l /var/backups/sinov | awk 'NR>1 {print $1, $3, $NF}'; ls -ld /var/backups/sinov | awk '{print $1, $3, $NF}'
-rw------- root lab-Monday.tgz
drwx------ root /var/backups/sinov
$ crontab -l | grep -v 'backup.sh' | crontab -; crontab -l 2>/dev/null | grep -c backup.sh; rm -rf /var/backups/sinov /usr/local/bin/backup.sh; echo tozalandi
0
tozalandi
```

Endi arxiv `-rw-------`, papka `drwx------`. Sinov yozuvi va fayllar o'chirildi.

## Variantlar

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| Shell skript + `tar` (shu bob) | Oddiy, kam ma'lumot | Har safar to'liq nusxa, shifrlanmagan |
| restic (20-bob) | Shifrlash, takrorlarsiz, boshqa serverga | Alohida asbob |
| etckeeper (22-bob) | `/etc` o'zgarishlar tarixi | Zaxira o'rnini bosmaydi |
| UB: rsnapshot, Bacula | Ko'p server, katta tizimlar | Murakkabroq |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Arxivni oddiy `umask` bilan | Hamma o'qiy oladi (sinovda), ichida `/etc/shadow` | `umask 077`, papka `700` |
| Zaxirani o'sha serverda saqlash | Server yo'qolsa — zaxira ham | Boshqa kompyuter (UB: NFS) |
| Arxivni sinamaslik | Buzilgan arxiv kerak bo'lgandagina ochiladi (UB) | Faylni tiklab ko'rish |
| Hammasini `/` ga tiklab yuborish | Joriy fayllar ustidan yoziladi (UB) | Avval `-C /tmp` ga |
| `cron` bor deb o'ylash | Shablonda yo'q bo'lishi mumkin (sinovda) | `crontab -l` bilan tekshirish |
| Faqat kunlik, 7 ta | 7 kundan eski holat yo'q | Bobo-ota-bola aylantirish |

## Amaliyot

1. `tar czf` dagi `c`, `z`, `f` nimani bildiradi?
2. Bobo-ota-bola aylantirishda qaysi kunlarda qaysi arxiv?
3. `0 0 * * *` qachon ishga tushadi?
4. Arxivni sinashning eng yaxshi yo'li nima?
5. Sinovda arxiv bilan qanday xavf topildi va qanday tuzatildi?
6. Nega zaxira boshqa kompyuterda bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. Yaratish, gzip bilan siqish, faylga yozish.
2. Yakshanba–juma — kunlik, shanba — haftalik, oyning 1-kuni — oylik.
3. Har kuni yarim tunda (00:00).
4. Undan faylni boshqa papkaga tiklab ko'rish.
5. Arxiv hamma o'qiy oladigan (`-rw-r--r--`) edi, ichida `/etc/shadow`; `umask 077` bilan `-rw-------`.
6. Server yoki diski yo'qolsa, zaxira ham yo'qoladi.

</details>

## Rasmiy hujjat

- [UB: How to back up using shell scripts](https://ubuntu.com/server/docs/how-to/backups/back-up-using-shell-scripts/)
- [UB: Backups and version control](https://ubuntu.com/server/docs/how-to/backups/)
- [UM: tar(1)](https://manpages.ubuntu.com/manpages/resolute/man1/tar.1.html) · [crontab(5)](https://manpages.ubuntu.com/manpages/resolute/man5/crontab.5.html)

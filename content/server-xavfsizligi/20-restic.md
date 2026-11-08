# 20 — restic bilan shifrlangan zaxira

[Mundarija](README.md)

## Tushuncha

19-bobdagi `tar` arxivi har safar **to'liq** nusxa, **shifrlanmagan**. restic (rasmiy hujjat): tez va xavfsiz zaxira dasturi.

| Atama | Nima (restic hujjati) |
| --- | --- |
| **Ombor** (repository) | Zaxiralar saqlanadigan joy — lokal papka, SFTP, REST server, bulut … |
| **Snapshot** (lahzalik nusxa) | Papka mazmunining ma'lum vaqtdagi holati; ID bilan (`40dc1520`) |
| **Takrorlanishni olib tashlash** (deduplication) | Omborda bor ma'lumot qayta yozilmaydi — keyingi zaxiralar faqat o'zgarganini qo'shadi |
| **Parol** | Omborga kirish kaliti. Yo'qolsa — ma'lumot **qaytarib bo'lmaydigan** darajada yo'qoladi |

### Asosiy buyruqlar

| Buyruq | Nima |
| --- | --- |
| `restic init --repo /yo'l` | Yangi ombor (bir marta) |
| `restic -r /yo'l backup PAPKA` | Zaxira — yangi snapshot |
| `restic -r /yo'l snapshots` | Snapshotlar ro'yxati |
| `restic -r /yo'l forget --keep-… --prune` | Siyosat bo'yicha eski snapshotlarni o'chirish va keraksiz ma'lumotni tozalash |
| `restic -r /yo'l check` | Ombor butunligini tekshirish (prune'dan keyin tavsiya etiladi) |
| `restic key list/add/remove/passwd` | Ombor kalitlari (bir nechta parol) |

Parolni har safar terish o'rniga — `--password-file` yoki `RESTIC_PASSWORD_FILE` muhit o'zgaruvchisi (avtomatik zaxira uchun).

### Saqlash siyosati

Hujjat: snapshotlarni qo'lda o'chirish zerikarli va xatoga moyil — `forget` siyosat oladi: `--keep-last n`, `--keep-hourly`, `--keep-daily`, `--keep-weekly`, `--keep-monthly`, `--keep-yearly`, `--keep-within 2y5m7d3h`, `--keep-tag`. `--dry-run` — hech narsa o'chirmay, nima qilinishini ko'rsatadi.

`forget` faqat snapshotni o'chiradi; ma'lumotni `prune` tozalaydi (`--prune` — ikkalasi birga). prune paytida ombor **qulflanadi** — zaxira bajarilmaydi.

### Boshqa serverga: SFTP

Hujjat: `restic -r sftp:user@host:/srv/restic-repo init`. Server SSH bilan sozlangan va ochiq kalitingiz unga qo'shilgan bo'lishi kerak — **parolsiz kirish** muhim, aks holda avtomatik zaxira ishlamaydi. Port yoki boshqa sozlama — `~/.ssh/config` dagi `Host` yozuvi orqali (`sftp:foo:/srv/restic-repo`).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). Ombor — sinov uchun **shu serverdagi** papka; SFTP bilan boshqa serverga zaxira bu bobda **sinab ko'rilmadi** (alohida server kerak).

### O'rnatish va ombor

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q restic 2>&1 | grep -E '^Setting up restic'; restic version
Setting up restic (0.18.1-3ubuntu1) ...
restic 0.18.1 compiled with go1.25.0 on linux/amd64
$ umask 077; head -c 32 /dev/urandom | base64 > /root/.restic-parol; ls -l /root/.restic-parol | awk '{print $1, $3, $NF}'; export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic init --repo /var/backups/restic 2>&1
-rw------- root /root/.restic-parol
created restic repository 6a4fe18dff at /var/backups/restic

Please note that knowledge of your password is required to access
the repository. Losing your password means that your data is
irrecoverably lost.
```

restic 0.18.1 — Ubuntu omboridan. Parol — tasodifiy, faqat root o'qiy oladigan faylda (`-rw-------`). restic ogohlantiradi: parolsiz ombor ochilmaydi.

### Birinchi zaxira

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic --verbose backup /etc 2>&1 | grep -vE '^(open repository|load index|start (scan|backup)|repository .* opened)' 
no parent snapshot found, will read all files
scan finished in 0.016s: 813 files, 2.155 MiB

Files:         813 new,     0 changed,     0 unmodified
Dirs:          194 new,     0 changed,     0 unmodified
Data Blobs:    788 new
Tree Blobs:    169 new
Added to the repository: 2.663 MiB (878.662 KiB stored)

processed 813 files, 2.155 MiB in 0:00
snapshot d3052403 saved
```

`/etc` — 813 fayl, 2.155 MiB; omborga siqilgan holda 878 KiB yozildi.

### Ikkinchi zaxira — faqat o'zgargani

`/etc/motd` ga bitta qator qo'shib, qayta zaxira:

```text vps
$ echo '# sinov' >> /etc/motd; export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic backup /etc 2>&1 | grep -E 'Files:|Dirs:|Added|snapshot .* saved'
Files:           1 new,     0 changed,   813 unmodified
Dirs:            0 new,     1 changed,   193 unmodified
Added to the repository: 62.675 KiB (12.835 KiB stored)
snapshot 52068e4c saved
```

813 fayl `unmodified` — qayta yozilmadi; omborga atigi 12.8 KiB qo'shildi. Har zaxira — to'liq holat (snapshot), lekin joy faqat o'zgarishga ketadi. (Sinovgacha `/etc/motd` bo'sh edi; sinovdan keyin yana bo'shatildi.)

### Ombor ichi — shifrlangan

```text vps
$ ls /var/backups/restic; du -sh /etc /var/backups/restic | awk '{print $2, $1}'; grep -rl 'PermitRootLogin' /var/backups/restic | wc -l | sed 's/^/omborda ochiq "PermitRootLogin" matni topilgan fayllar: /'
config
data
index
keys
locks
snapshots
/etc 5.7M
/var/backups/restic 2.0M
omborda ochiq "PermitRootLogin" matni topilgan fayllar: 0
```

`/etc` 5.7 MB, ombor — 2.0 MB. `sshd_config` dagi `PermitRootLogin` matni ombor fayllarining **hech birida** ochiq ko'rinmaydi — 19-bobdagi `tar` arxividan farqli, ma'lumot shifrlangan.

### Snapshotlar va siyosat

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic snapshots 2>&1 | grep -vE '^repository'
ID        Time                 Host        Tags        Paths  Size
-----------------------------------------------------------------------
d3052403  2026-11-09 00:40:01  lab                     /etc   2.155 MiB
52068e4c  2026-11-09 00:40:02  lab                     /etc   2.155 MiB
-----------------------------------------------------------------------
2 snapshots
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic forget --keep-last 1 --prune 2>&1 | grep -E 'keep|remove|snapshots|deleted|this removes|done' | head -8; restic -r /var/backups/restic snapshots 2>&1 | tail -3
Applying Policy: keep 1 latest snapshots
keep 1 snapshots:
1 snapshots
remove 1 snapshots:
1 snapshots
[0:00] 100.00%  1 / 1 files deleted
1 snapshots have been removed, running prune
loading all snapshots...
52068e4c  2026-11-09 00:40:02  lab                     /etc   2.155 MiB
-----------------------------------------------------------------------
1 snapshots
```

`--keep-last 1` — eng yangi snapshot qoldi, eskisi o'chirildi va `prune` ishga tushdi. Ombor 21-bobda (tiklash) ishlatiladi.

## Variantlar

| Ombor | Qachon |
| --- | --- |
| Lokal papka | Sinov; yoki boshqa diskka (server yo'qolsa — zaxira ham yo'qoladi) |
| SFTP | Boshqa serverga, faqat SSH kerak |
| REST server, bulut (S3 va h.k.) | Hujjatda — `030_preparing_a_new_repo` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Parolni faqat serverda saqlash | Server yo'qolsa — parol ham, zaxira ochilmaydi | Parolni xavfsiz boshqa joyda ham saqlash |
| Parol faylini hamma o'qiy oladigan | Ombor ochiladi | `umask 077`, `-rw-------` |
| Omborni o'sha serverda qoldirish | Server bilan birga yo'qoladi | Boshqa server (SFTP) |
| `forget` dan keyin joy bo'shadi deb o'ylash | Ma'lumotni `prune` tozalaydi | `forget --prune` |
| Zaxira vaqtida prune | Ombor qulflanadi (hujjat) | Alohida vaqtga rejalash |
| Siyosatni sinamay ishga tushirish | Kerakli snapshot o'chishi mumkin | `--dry-run` |

## Amaliyot

1. `tar` arxiviga nisbatan restic'ning ikki afzalligi?
2. Snapshot nima?
3. Ombor paroli yo'qolsa nima bo'ladi?
4. Ikkinchi zaxirada nega omborga atigi 12.8 KiB qo'shildi?
5. `forget` va `prune` farqi?
6. Avtomatik zaxirada parol qanday beriladi?

<details>
<summary>Javoblar</summary>

1. Shifrlash; takrorlanishni olib tashlash (faqat o'zgarganini saqlash).
2. Papkaning ma'lum vaqtdagi holati, ID bilan.
3. Ma'lumot qaytarib bo'lmaydigan darajada yo'qoladi.
4. 813 fayl o'zgarmagan — faqat yangi qator va papka ma'lumoti yozildi.
5. `forget` — snapshotni o'chiradi; `prune` — faqat o'chirilgan snapshotlar ishlatgan ma'lumotni tozalaydi.
6. `--password-file` yoki `RESTIC_PASSWORD_FILE`.

</details>

## Rasmiy hujjat

- [restic: Introduction](https://restic.readthedocs.io/en/stable/010_introduction.html)
- [restic: Preparing a new repository](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html) — Local, SFTP
- [restic: Backing up](https://restic.readthedocs.io/en/stable/040_backup.html)
- [restic: Removing backup snapshots](https://restic.readthedocs.io/en/stable/060_forget.html)
- [restic: Encryption](https://restic.readthedocs.io/en/stable/070_encryption.html)

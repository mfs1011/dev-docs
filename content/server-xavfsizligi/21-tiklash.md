# 21 — Zaxiradan tiklash

[Mundarija](README.md)

## Tushuncha

Tiklab ko'rilmagan zaxira — hali zaxira emas. UB (19-bob): arxivni sinashning eng yaxshi yo'li — undan **faylni tiklash**. Bu bob — 20-bobdagi restic omboridan.

### Ombor butunligi

restic hujjati (Working with repositories): `restic check` — ombor tuzilmasini tekshiradi. Standart holatda diskdagi ma'lumot fayllari (pack) o'zgarmaganini **tekshirmaydi** — buning uchun `--read-data` (hamma ma'lumotni o'qiydi: ko'proq vaqt va trafik) yoki qismini — `--read-data-subset=n/t`.

### Tiklash (restic hujjati)

| Buyruq | Nima |
| --- | --- |
| `restic restore ID --target /tmp/x` | Snapshotni boshqa papkaga |
| `restic restore latest …` | Eng oxirgisini (`--host`, `--path` bilan filtr) |
| `--include /yo'l` / `--exclude` | Faqat bir qismini |
| `restic ls latest`, `restic find nom` | Snapshot ichidagi yo'lni topish |
| `ID:/papka` | Faqat ichki papkani |
| `--dry-run --verbose=2` | Hech narsa yozmay, nima qilinishini ko'rsatadi |

Joyida (in-place) tiklash:

- `--overwrite` — `always` (standart), `if-changed`, `if-newer`, `never`;
- `--delete` — snapshotda yo'q fayllarni **o'chiradi**; avval `--dry-run -vv` bilan tekshirish (hujjat ogohlantirishi). `--target / --delete` faqat `--include`/`--exclude` bilan ishlaydi — butun tizimni tasodifan o'chirmaslik uchun;
- joyida tiklash to'xtab qolsa, fayllar yarim tiklangan holda qolishi mumkin — oldin joriy holatdan **zaxira** olish tavsiya etiladi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04), 20-bobdagi ombor — bitta snapshot (`/etc`).

### Ombor butunligi

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic check --read-data 2>&1 | grep -vE '^(using temporary cache|create exclusive lock|created new cache|repository .* opened)'
load indexes
check all packs
check snapshots, trees and blobs
[0:00] 100.00%  1 / 1 snapshots
read all data
[0:00] 100.00%  4 / 4 packs
no errors were found
```

`--read-data` — 4 ta pack fayl to'liq o'qildi, xato yo'q.

### Bitta faylni tiklash

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic ls latest 2>&1 | grep -E 'sshd_config$|/etc/motd$'
/etc/motd
/etc/ssh/sshd_config
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic restore latest --target /tmp/tiklash --include /etc/ssh/sshd_config 2>&1 | grep -v '^repository'; find /tmp/tiklash -type f; diff /etc/ssh/sshd_config /tmp/tiklash/etc/ssh/sshd_config && echo "farq yo'q"
restoring snapshot 52068e4c of [/etc] at 2026-11-09 00:40:02.24999361 +0300 MSK by root@lab to /tmp/tiklash
Summary: Restored 3 / 1 files/dirs (4.206 KiB / 4.206 KiB) in 0:00
/tmp/tiklash/etc/ssh/sshd_config
farq yo'q
```

`sshd_config` — vaqtinchalik papkaga, papka tuzilmasi bilan (`/tmp/tiklash/etc/ssh/sshd_config`); asl fayldan farqi yo'q.

### Hammasini — boshqa papkaga

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic restore latest --target /tmp/tiklash-hammasi 2>&1 | grep -v '^repository'; diff -rq /etc /tmp/tiklash-hammasi/etc 2>&1 | head -5; diff /etc/motd /tmp/tiklash-hammasi/etc/motd
restoring snapshot 52068e4c of [/etc] at 2026-11-09 00:40:02.24999361 +0300 MSK by root@lab to /tmp/tiklash-hammasi
Summary: Restored 1556 files/dirs (2.155 MiB) in 0:00
Files /etc/motd and /tmp/tiklash-hammasi/etc/motd differ
diff: /tmp/tiklash-hammasi/etc/mtab: No such file or directory
diff: /tmp/tiklash-hammasi/etc/os-release: No such file or directory
0a1
> # sinov
```

- Faqat `/etc/motd` farq qildi — snapshot 20-bobdagi `# sinov` qo'shilgan paytda olingan, keyin fayl bo'shatilgan. Snapshot — o'sha **paytdagi** holat.
- `mtab`, `os-release` — havolalar (symlink); tiklangan nusxada ular boshqa joyga ishora qilgani uchun `diff` topa olmadi. Kuzatildi.

```text vps
$ stat -c '%A %U %n' /etc/shadow /tmp/tiklash-hammasi/etc/shadow
-rw-r----- root /etc/shadow
-rw-r----- root /tmp/tiklash-hammasi/etc/shadow
```

Huquq va egasi saqlangan — `shadow` tiklangan nusxada ham `-rw-r-----`.

### Joyida tiklash — avval sinov

```text vps
$ export RESTIC_PASSWORD_FILE=/root/.restic-parol; restic -r /var/backups/restic restore latest --target / --include /etc/motd --dry-run --verbose=2 2>&1 | grep -E 'motd|Summary'; tail -1 /etc/motd
updated   /etc/motd with size 8 B
Summary: Restored 2 / 1 files/dirs (8 B / 8 B) in 0:00
```

`--dry-run` — `/etc/motd` yangilanishi ko'rsatildi, lekin fayl **o'zgarmadi** (oxirgi qatori bo'sh). Haqiqiy tiklash — xuddi shu buyruq `--dry-run` siz.

```text vps
$ rm -rf /tmp/tiklash /tmp/tiklash-hammasi; echo tozalandi
tozalandi
```

## Tiklash tartibi

| Qadam | Nima |
| --- | --- |
| 1 | `restic snapshots` — kerakli vaqtdagi snapshot |
| 2 | `restic ls` / `find` — yo'lni topish |
| 3 | Avval **boshqa papkaga** tiklash va solishtirish (`diff`) |
| 4 | Joyida kerak bo'lsa — oldin joriy holatdan zaxira |
| 5 | `--dry-run --verbose=2` |
| 6 | Haqiqiy tiklash, servisni qayta ishga tushirish, tekshirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Zaxirani hech qachon tiklab ko'rmaslik | Kerak paytda ishlamasligi mumkin | Muntazam tiklash sinovi |
| Faqat `check` | Pack fayllarni o'qimaydi (hujjat) | `check --read-data` (yoki `--read-data-subset`) |
| Darhol `--target /` | Joriy fayllar ustidan yoziladi | Avval boshqa papkaga, `--dry-run` |
| `--delete` ni sinovsiz | Snapshotda yo'q fayllar o'chadi | `--dry-run -vv` |
| Tiklangan papkani hamma o'qiy oladigan joyda qoldirish | Ichida `shadow` va kalitlar | Sinovdan keyin o'chirish |
| Parol faqat o'sha serverda | Server yo'qolsa — ombor ochilmaydi | Parolni boshqa joyda ham saqlash |

## Amaliyot

1. `check` va `check --read-data` farqi?
2. Bitta faylni qanday tiklaysiz?
3. Sinovda nega faqat `/etc/motd` farq qildi?
4. `--dry-run --verbose=2` nima beradi?
5. `--target / --delete` nega `--include` siz ishlamaydi?
6. Joyida tiklashdan oldin nima qilish tavsiya etiladi?

<details>
<summary>Javoblar</summary>

1. Birinchisi tuzilmani, ikkinchisi barcha ma'lumotni o'qib tekshiradi.
2. `restic restore latest --target /tmp/x --include /yo'l/fayl`.
3. Snapshot `# sinov` qo'shilgan paytda olingan, keyin fayl o'zgargan.
4. Nima tiklanishi yoki yangilanishi — hech narsa yozmasdan.
5. Butun tizimni tasodifan o'chirmaslik uchun.
6. Joriy holatdan zaxira olish (tiklash to'xtab qolsa qaytish uchun).

</details>

## Rasmiy hujjat

- [restic: Restoring from backup](https://restic.readthedocs.io/en/stable/050_restore.html)
- [restic: Working with repositories](https://restic.readthedocs.io/en/stable/045_working_with_repos.html) — Checking integrity
- [UB: How to back up using shell scripts](https://ubuntu.com/server/docs/how-to/backups/back-up-using-shell-scripts/) — Restoring from the archive

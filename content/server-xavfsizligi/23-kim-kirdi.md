# 23 — Kim kirdi

[Mundarija](README.md)

## Tushuncha

Himoya qatlamlari qo'yilgach ham savol qoladi: serverga **kim, qachon, qayerdan** kirdi va kim kira olmadi? Ikki manba:

| Manba | Nima |
| --- | --- |
| **SSH jurnali** (`journalctl -u ssh`) | sshd har bir muvaffaqiyatli kirishni (`Accepted …`) va muvaffaqiyatsiz urinishni (`Failed password`, `Invalid user`) yozadi |
| **Kirishlar bazasi** (`last`) | Sessiyalar: kim, qaysi xizmat, qachon kirdi va chiqdi |

### sshd `LogLevel`

sshd_config(5): sshd xabarlarining batafsillik darajasi — `QUIET`, `FATAL`, `ERROR`, `INFO`, `VERBOSE`, `DEBUG`, `DEBUG1`–`DEBUG3`. Standart — **`INFO`**. `DEBUG` darajasi foydalanuvchilar maxfiyligini buzadi va **tavsiya etilmaydi**.

### `journalctl`

journalctl(1): `-u` (`--unit`) — bitta servis; `-S`/`--since`, `-U`/`--until` — vaqt oralig'i; `-g`/`--grep` — xabar matni bo'yicha (regex); `-o short-iso` — ISO vaqt.

### `last` — wtmpdb

Ubuntu 26.04 da `last` — **`wtmpdb`** paketidan (UM: wtmpdb(8), "Provided by: wtmpdb"). U `/var/log/wtmp.db` dagi kirish va boot vaqtlari bazasini ko'rsatadi; baza **sqlite3** da, 2038-yil muammosidan xoli.

| Parametr | Nima |
| --- | --- |
| `last [foydalanuvchi…]` | Faqat shu foydalanuvchilar |
| `-n N` | Faqat N ta yozuv |
| `-S` | Kirish uchun ishlatilgan PAM xizmati |
| `-s`, `-t` | Vaqtdan keyin / vaqtgacha |
| `-p TIME` | Shu vaqtda kim tizimda bo'lgan |
| `--time-format iso` | ISO-8601 vaqt |
| `-x` | Tizim o'chirilishi yozuvlari |

`reboot` maxsus foydalanuvchisining kirish va chiqish vaqtlari — tizimning boot va o'chish vaqtlari. `wtmpdb rotate` — eski yozuvlarni (standart 60 kundan eski) alohida faylga ko'chiradi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). Jurnaldagi tashqi IP manzillar `198.51.100.x` bilan, kalit izlari `SHA256:…` bilan almashtirilgan.

### sshd jurnal darajasi

```text vps
$ sshd -T 2>/dev/null | grep -E '^(loglevel|syslogfacility) '
loglevel INFO
syslogfacility AUTH
```

Standart `INFO`; xabarlar `AUTH` bo'limiga.

### 24 soat

```text vps
$ journalctl -u ssh --since -24h --no-pager -o cat | grep -cE '^Accepted ' | sed 's/^/muvaffaqiyatli kirish: /'; journalctl -u ssh --since -24h --no-pager -o cat | grep -cE '^(Failed password|Invalid user)' | sed 's/^/muvaffaqiyatsiz urinish: /'
muvaffaqiyatli kirish: 887
muvaffaqiyatsiz urinish: 18229
```

1-bobdagi kabi: muvaffaqiyatsiz urinishlar soni kirishlardan ancha ko'p.

```text vps
$ journalctl -u ssh --since -24h --no-pager -o short-iso -g '^Accepted ' | tail -2 | cut -d' ' -f1,3-
2026-11-09T00:46:54+03:00 sshd-session[10829]: Accepted publickey for root from 198.51.100.1 port 38480 ssh2: ED25519 SHA256:…
2026-11-09T00:46:56+03:00 sshd-session[10859]: Accepted publickey for root from 198.51.100.1 port 30455 ssh2: ED25519 SHA256:…
$ journalctl -u ssh --since -1h --no-pager -o cat -g '^(Failed password|Invalid user)' | tail -2
Invalid user zfh from 198.51.100.2 port 33992
Failed password for invalid user zfh from 198.51.100.2 port 33992 ssh2
```

- Muvaffaqiyatli: foydalanuvchi, IP, port, usul (`publickey`) va kalit turi.
- Muvaffaqiyatsiz: mavjud bo'lmagan foydalanuvchi (`Invalid user`) va parol terish (`Failed password`) — 2-bobdagi `PasswordAuthentication yes` tufayli sshd parolni sinab ko'radi.

### Kim qanday kirdi

```text vps
$ journalctl -u ssh --since -24h --no-pager -o cat -g '^Accepted ' | awk '{print $2, $4}' | sort | uniq -c | sort -rn
    885 publickey root
      3 publickey boshqaruv
```

Hammasi kalit bilan. root'ning 885 ta kirishi — shu kitob sinovlarini avtomatik bajaruvchi skriptdan (har buyruq to'plami — yangi SSH ulanish); `boshqaruv` — 7-bobdagi sinovlar. Kuzatildi: birinchi buyruqdagi 887 va bu yerdagi jami — buyruqlar orasida yangi ulanishlar qo'shilgani uchun farq qiladi.

### `last`

```text vps
$ command -v last || echo "last topilmadi"; dpkg -l wtmpdb 2>/dev/null | awk '/^[a-z]/ {print $1, $2, $3}'; apt-cache policy wtmpdb | sed -n 3p
last topilmadi
un wtmpdb <none>
  Candidate: 0.75.0-5ubuntu1
```

Shablonda `last` yo'q edi — `wtmpdb` va kirishlarni bazaga yozadigan PAM moduli (`libpam-wtmpdb`) o'rnatildi:

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q wtmpdb libpam-wtmpdb 2>&1 | grep -E '^Setting up (wtmpdb|libpam-wtmpdb)'; grep -h wtmpdb /etc/pam.d/common-session; ls -l /var/log/wtmp.db | awk '{print $1, $3, $NF}'
Setting up libpam-wtmpdb:amd64 (0.75.0-5ubuntu1) ...
Setting up wtmpdb (0.75.0-5ubuntu1) ...
session	optional			pam_wtmpdb.so 
ls: cannot access '/var/log/wtmp.db': No such file or directory
```

PAM modul `common-session` ga qo'shildi; baza hali yo'q — birinchi kirishda yaratiladi. Yangi SSH kirishdan keyin:

```text vps
$ ls -l /var/log/wtmp.db | awk '{print $1, $3, $NF}'; last -n 5
-rw-r--r-- root /var/log/wtmp.db
root     ssh          198.51.100.1   Mon Nov  9 00:47 - still logged in
root     ssh          198.51.100.1   Mon Nov  9 00:47 - 00:47  (00:00)
root     ssh          198.51.100.1   Mon Nov  9 00:47 - 00:47  (00:00)
root     ssh          198.51.100.1   Mon Nov  9 00:47 - 00:47  (00:00)

wtmpdb begins Mon Nov  9 00:47:14 2026
$ last -S -n 3
root     ssh          198.51.100.1   sshd         Mon Nov  9 00:47 - still logged in
root     ssh          198.51.100.1   sshd         Mon Nov  9 00:47 - 00:47  (00:00)
root     ssh          198.51.100.1   sshd         Mon Nov  9 00:47 - 00:47  (00:00)

wtmpdb begins Mon Nov  9 00:47:18 2026
$ last --time-format iso -n 2 boshqaruv root | head -3
root     ssh          198.51.100.1   2026-11-09T00:47:20+0300  - still logged in           
root     ssh          198.51.100.1   2026-11-09T00:47:19+0300  - 2026-11-09T00:47:19+0300   (00:00)
$ last -n 3 boshqaruv
boshqaru ssh          198.51.100.1   Mon Nov  9 00:47 - 00:47  (00:00)

wtmpdb begins Mon Nov  9 00:47:14 2026
```

- Har sessiya: foydalanuvchi, `ssh`, IP, vaqt, davomiylik; hozirgisi — `still logged in`.
- `-S` — PAM xizmati `sshd`.
- `boshqaruv` filtri — faqat uning sessiyasi (nom 8 belgiga qisqartirilgan: `boshqaru`; to'liq — `-w`).
- `wtmpdb begins` — baza boshlanishi: o'rnatilishidan oldingi kirishlar bazada **yo'q**, ular faqat SSH jurnalida.
- Kuzatildi: `/var/log/wtmp.db` — `-rw-r--r--`, serverdagi har bir foydalanuvchi kirishlar tarixini o'qiy oladi.

## Nimaga qarash

| Belgi | Qayerda |
| --- | --- |
| Tanimagan IP'dan `Accepted` | `journalctl -u ssh -g '^Accepted '` |
| Notanish vaqtda kirish | `last`, `last -s yesterday` |
| Kutilmagan foydalanuvchi | `last`, `Accepted … for NOM` |
| `Accepted password` (kalit emas) | SSH jurnali — parol bilan kirish yopilmagan (9-bob) |
| Kim `sudo` ishlatdi | `journalctl -t sudo` (7-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `last` hamma kirishni ko'rsatadi deb o'ylash | Baza faqat o'rnatilgandan keyin (sinovda) | SSH jurnali ham |
| `LogLevel DEBUG` doimiy | Maxfiylikni buzadi (sshd_config) | `INFO` yoki vaqtincha `VERBOSE` |
| Faqat muvaffaqiyatsizlarga qarash | Haqiqiy xavf — begona `Accepted` | `Accepted` qatorlarini tekshirish |
| Jurnalni hech qachon ko'rmaslik | Kirish sezilmay qoladi | Muntazam ko'rib chiqish |
| `last` yo'q — kirishlar yozilmayapti deb o'ylash | sshd jurnali baribir yozadi | `journalctl -u ssh` |

## Amaliyot

1. Muvaffaqiyatli SSH kirishni jurnalda qanday topasiz?
2. sshd standart `LogLevel` i qaysi? Nega `DEBUG` tavsiya etilmaydi?
3. Ubuntu 26.04 da `last` qaysi paketdan va ma'lumot qayerda?
4. Sinovda nega `last` eski kirishlarni ko'rsatmadi?
5. Qaysi jurnal qatori eng ko'p tashvish uyg'otishi kerak?

<details>
<summary>Javoblar</summary>

1. `journalctl -u ssh -g '^Accepted '`.
2. `INFO`; `DEBUG` foydalanuvchilar maxfiyligini buzadi.
3. `wtmpdb`; `/var/log/wtmp.db` (sqlite3).
4. Baza `wtmpdb` o'rnatilgandan keyin yaratildi.
5. Tanimagan IP yoki foydalanuvchi bilan `Accepted …`.

</details>

## Rasmiy hujjat

- [UM: journalctl(1)](https://manpages.ubuntu.com/manpages/resolute/man1/journalctl.1.html)
- [UM: wtmpdb(8)](https://manpages.ubuntu.com/manpages/resolute/man8/wtmpdb.8.html) · [last(1)](https://manpages.ubuntu.com/manpages/resolute/man1/last.1.html)
- [OpenSSH: sshd_config(5)](https://man.openbsd.org/sshd_config) — LogLevel

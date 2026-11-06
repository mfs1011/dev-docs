# 26 — Tashqi repozitoriy

[← Oldingi: Paket ichida nima bor](25-paket-ichida.md) · [Mundarija](README.md) · [Keyingi: Avtomatik yangilanishlar →](27-avtomatik-yangilanish.md)

## Tushuncha

Ubuntu arxivida minglab paket bor, lekin hamma narsa emas va har doim eng yangi versiyasi emas. Masalan, PostgreSQL'ning yangi asosiy versiyasi yoki Node.js'ning kerakli versiyasi. Uch yo'l bor:

| Yo'l | Afzalligi | Kamchiligi |
| --- | --- | --- |
| **Distributiv paketi** (Ubuntu/Debian arxivi) | Distributiv sinaydi, xavfsizlik yangilanishlarini beradi, `apt upgrade` bilan yangilanadi | Versiya reliz paytida "muzlatiladi" |
| **Tashqi APT repozitoriy** (vendor repo'si) | Yangi versiyalar, vendor o'zi qo'llab-quvvatlaydi | Xavfsizlik va tizim yaxlitligi sizning javobgarligingiz (pastda) |
| **snap** | Bog'liqliklari ichida, alohida muhitda (sandbox) ishlaydi | Snap paketi bo'lishi kerak; avtomatik yangilanadi |

Ubuntu hujjati tashqi APT repozitoriylarni **tavsiya qilmaydi**, lekin boshqa yo'l qolmasligini tan oladi va xavfni kamaytirish usullarini ko'rsatadi.

## Xavflar

Ubuntu'ning "Third party repository usage" sahifasidan:

- **Xavfsizlik.** Zamonaviyroq paket tizimlaridan farqli o'laroq, APT repozitoriydan kelgan kod alohida muhitda (sandbox) ishlamaydi. Bir nechta manbadan paket olsangiz, APT va dpkg ular orasida hech qanday xavfsizlik chegarasi qo'ymaydi. Tizimingiz xavfsizligi eng zaif himoyalangan vendor darajasiga tushadi: hujumchi vendorning serverini buzsa, sizning serveringizga ham yetib keladi.
- **Tizim yaxlitligi.** Tashqi paket Ubuntu paketi bilan to'qnashishi mumkin. Hujjatga ko'ra relizni yangilash muvaffaqiyatsiz bo'lishining eng ko'p uchraydigan sababi — bir paytlar ishlagan, keyin yangi reliz bilan to'qnashgan tashqi repozitoriylar.
- **Qo'llab-quvvatlash.** Muammo chiqsa, Ubuntu hamjamiyati emas, vendor yordam beradi.

Shuning uchun faqat **rasmiy** vendor repo'larini qo'shing: PostgreSQL uchun — postgresql.org, Docker uchun — docker.com va h.k. Forum yoki blogdagi "shu repo'ni qo'shing" degan maslahatdan ehtiyot bo'ling.

## Repozitoriy qo'shish: PostgreSQL misolida

Quyidagi qadamlar postgresql.org'dagi rasmiy "Manual Repository Configuration" ko'rsatmasi bo'yicha VPS'da bajarildi. PostgreSQL o'rnatilmadi — faqat repo qo'shilib, oxirida olib tashlandi.

Avval Ubuntu'ning o'zida qaysi versiya bor:

```text vps
$ apt policy postgresql
postgresql:
  Installed: (none)
  Candidate: 18+290ubuntu1
  Version table:
     18+290ubuntu1 500
        500 http://mirror.hoztnode.net/ubuntu resolute/main amd64 Packages
```

### 1. Kalit

Repo'dagi paketlar vendor kaliti bilan imzolangan. apt imzoni tekshirishi uchun kalit kerak:

```text vps
$ install -d /usr/share/postgresql-common/pgdg
$ curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail -sS https://www.postgresql.org/media/keys/ACCC4CF8.asc
$ gpg --show-key /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
pub   rsa4096 2011-10-13 [SC]
      B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8
uid                      PostgreSQL Debian Repository
```

- Kalit **vendor saytidan**, HTTPS orqali olinadi.
- `gpg --show-key` kalit barmoq izini (fingerprint) ko'rsatadi. U rasmiy sahifadagi bilan (`B97B 0AFC ... ACCC 4CF8`) mos kelishi kerak. Bu kalit yo'lda almashtirilmaganini tekshiradi.
- Ubuntu hujjatiga ko'ra eski `apt-key` buyrug'i **endi tavsiya qilinmaydi**. Kalit faylga yoziladi va manbada `Signed-By` bilan ko'rsatiladi. Shunda bu kalit **faqat shu repo'ga** amal qiladi.

### 2. Manba fayli (deb822)

```text vps
$ cat /etc/apt/sources.list.d/pgdg.sources
Types: deb
URIs: https://apt.postgresql.org/pub/repos/apt
Suites: resolute-pgdg
Architectures: amd64
Components: main
Signed-By: /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
```

Ubuntu hujjatiga ko'ra 24.04 dan beri standart format — deb822, fayl kengaytmasi `.sources`. Eski bir qatorli format (`.list`) shunday bo'lardi:

```text
deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt resolute-pgdg main
```

`Suites` dagi `resolute` — Ubuntu seriyasi (25-bob). Vendor sizning relizingizni qo'llab-quvvatlashini tekshiring: postgresql.org sahifasida 26.04 (`resolute`) ro'yxatda bor.

### 3. `apt update` va natija

```text vps
$ apt update
Get:4 https://apt.postgresql.org/pub/repos/apt resolute-pgdg InRelease [189 kB]
Get:5 https://apt.postgresql.org/pub/repos/apt resolute-pgdg/main amd64 Packages [958 kB]
$ apt policy postgresql | head -n 3
postgresql:
  Installed: (none)
  Candidate: 18+293.pgdg26.04+1
```

E'tibor bering: endi `apt install postgresql` **Ubuntu paketini emas**, pgdg paketini tanlaydi. Ikkala manbaning ustuvorligi bir xil (500), shunda apt kattaroq versiyani oladi. Siz faqat yangi PostgreSQL versiyalarini olmoqchi edingiz, natijada esa tashqi repo Ubuntu'ning mavjud paketlarini ham almashtiradigan bo'ldi.

## Pinning: ustuvorlikni pasaytirish

Ubuntu hujjati tashqi repo uchun **pinning** sozlashni tavsiya qiladi: uning ustuvorligi pasaytiriladi va rasmiy paketlar adashib almashtirilmaydi.

<div data-animatsiya="qadamli" data-nom="pin"></div>

```text vps
$ cat /etc/apt/preferences.d/pgdg
Package: *
Pin: origin apt.postgresql.org
Pin-Priority: 100
$ apt policy postgresql-18
postgresql-18:
  Installed: (none)
  Candidate: 18.6-0ubuntu0.26.04.1
  Version table:
     18.6-1.pgdg26.04+2 100
        100 https://apt.postgresql.org/pub/repos/apt resolute-pgdg/main amd64 Packages
     18.6-0ubuntu0.26.04.1 500
$ apt-get -s install postgresql-17 | grep "^Inst postgresql-17 "
Inst postgresql-17 (17.11-1.pgdg26.04+2 PostgreSQL for Debian/Ubuntu repository:resolute-pgdg [amd64])
```

- Ikkala manbada bor paket (`postgresql-18`) — endi Ubuntu'dan.
- Faqat pgdg'da bor paket (`postgresql-17`) — baribir o'rnatiladi.

Ubuntu hujjatiga ko'ra `100` — repodan o'rnatish mumkin va o'rnatilgan paketlar avtomatik yangilanadi. `1` — o'rnatish mumkin, lekin avtomatik yangilanmaydi.

> Vendor yangi versiyani aynan o'z repo'sidan olishingizni nazarda tutgan bo'lishi mumkin (masalan, Docker o'z paketlarini). Bunday holda o'sha paketlar uchun alohida pin yozasiz. Qaysi paket qayerdan kelishi doim **sizning ongli qaroringiz** bo'lsin: `apt policy paket` buni ko'rsatadi.

## Repozitoriyni olib tashlash

Ubuntu hujjati bo'yicha:

1. `/etc/apt/sources.list.d/` dagi `.sources` (yoki `.list`) faylini o'chirish.
2. `/etc/apt/preferences.d/` dagi pin faylini o'chirish.
3. Kalit paket bilan kelmagan bo'lsa, kalit faylini o'chirish.
4. `apt update` dan **oldin** shu repodan o'rnatilgan paketlarni o'chirish: `apt update` dan keyin ular qayerdan kelgani ro'yxatdan yo'qoladi.

Biz hech narsa o'rnatmagan edik, shuning uchun 1–3 va `apt update` yetarli bo'ldi:

```text vps
$ rm /etc/apt/preferences.d/pgdg /etc/apt/sources.list.d/pgdg.sources
$ rm -r /usr/share/postgresql-common/pgdg
$ apt-get update -qq
$ apt policy postgresql | sed -n 3p
  Candidate: 18+290ubuntu1
```

## PPA

PPA (Personal Package Archive) — Launchpad'dagi shaxsiy repozitoriylar. Ubuntu hujjatiga ko'ra ular ham tashqi repozitoriy: yuqoridagi barcha xavflar ularga ham tegishli. `add-apt-repository ppa:egasi/nomi` kalitni o'zi sozlaydi, lekin **pinning qo'ymaydi** — uni qo'lda qilish tavsiya etiladi.

## Bizning VPS'dagi tuzoq: `trusted: yes`

25-bobda VPS manbalar faylini ko'rdik:

```text vps
$ cat /etc/apt/sources.list.d/Resolute.sources
Types: deb
URIs: http://mirror.hoztnode.net/ubuntu/
Suites: resolute
Components: main multiverse restricted universe
Signed-By: /usr/share/keyrings/Resolute-archive-keyring.gpg
trusted: yes
check-valid-until: no
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

sources.list(5) man sahifasiga ko'ra:

- `trusted: yes` — apt manbani **autentifikatsiyadan o'tmasa ham** ishonchli deb hisoblaydi. Bu apt-secure'ning bir qismini o'chiradi va faqat lokal, ishonchli muhitda ishlatilishi kerak, "aks holda xavfsizlik buziladi".
- `check-valid-until: no` — eskirgan ma'lumotni yuborib turish hujumidan (replay attack) himoyani o'chiradi.

Mirror manzili `http://` (shifrlanmagan). Imzo tekshiruvi ishlasa, bu muammo emas: paketlar imzosi tekshiriladi. Lekin `trusted: yes` aynan shu tekshiruvga tayanmaslikni bildiradi. Bu provayder shablonidagi sozlama. Uni o'zgartirish — server xavfsizligi masalasi, alohida qaror bilan qilinadi.

O'z serveringizda manbalar fayllarida `trusted: yes` yoki `[trusted=yes]` bor-yo'qligini tekshiring:

```text vps
$ grep -ri trusted /etc/apt/sources.list /etc/apt/sources.list.d/
```

## Debian va Ubuntu

| | Debian 12 | Ubuntu 26.04 |
| --- | --- | --- |
| Manba fayli | Odatda `/etc/apt/sources.list` (bir qatorli) | `.sources` (deb822) |
| deb822 qo'llab-quvvatlanadimi | Ha (sources.list(5)) | Ha, standart |
| PPA | Yo'q (Ubuntu xizmati) | `add-apt-repository` |
| snap | — | Ubuntu qo'llab-quvvatlaydi; bizning VPS shablonida `snap` yo'q |

Debian Reference ham ogohlantiradi: standart Debian manbalarini Ubuntu kabi boshqa arxivlar bilan **aralashtirmang**. `signed-by` esa Debian'ga tegishli bo'lmagan arxivlar imzosini aniq kalit bilan tekshirish uchun foydali.

## Tipik xatolar

**1. `apt-key add` yoki kalitni umumiy kalitlar ombori (keyring) ga qo'shish.**
Kalit barcha manbalarga amal qiladi.
To'g'risi: alohida fayl va `Signed-By`.

**2. Kalit barmoq izini tekshirmaslik.**
To'g'risi: `gpg --show-key` va rasmiy sahifa bilan solishtirish.

**3. Pinning'siz qo'shish.**
Tashqi repo Ubuntu paketlarini almashtirishi mumkin (yuqoridagi `postgresql`).

**4. Repo'ni o'chirib, paketlarini qoldirish.**
Ular boshqa yangilanmaydi va keyinroq to'qnashishi mumkin.

**5. `trusted=yes` bilan "imzo xatosini tuzatish".**
Bu xatoni emas, himoyani o'chiradi.

## Amaliyot

Trenajorda internet yo'q, shuning uchun bu bob uchun mashq yo'q. O'z serveringizda:

```text vps
$ ls /etc/apt/sources.list.d/
$ apt policy
$ grep -ri trusted /etc/apt/sources.list /etc/apt/sources.list.d/
```

Savollar:

1. Nega tashqi repo kalitini `Signed-By` bilan ko'rsatish kerak?
2. Tashqi repo qo'shilgandan keyin `apt install postgresql` qaysi versiyani o'rnatadi va nega?
3. `Pin-Priority: 100` nima beradi?
4. Repo'ni olib tashlashda paketlarni nega `apt update` dan oldin o'chirish kerak?
5. `trusted: yes` nima qiladi?

<details>
<summary>Javoblar</summary>

1. Kalit faqat shu repo uchun amal qiladi: boshqa manbalardan kelgan paketlarni bu kalit bilan "tasdiqlab" bo'lmaydi.
2. Ustuvorliklar teng bo'lsa — eng katta versiyani, ya'ni pgdg paketini.
3. Ubuntu'dagi (500) versiya ustun bo'ladi, faqat tashqi repoda bor paketlar esa o'rnatilaveradi va yangilanadi.
4. `apt update` dan keyin ro'yxatda bu repo bo'lmaydi va qaysi paketlar undan kelganini topish qiyinlashadi.
5. Manbani imzo tekshiruvidan o'tmasa ham ishonchli deb hisoblaydi — xavfsizlik himoyasini o'chiradi.

</details>

## Rasmiy hujjat

- [Ubuntu Server — Third party repository usage](https://ubuntu.com/server/docs/explanation/software/third-party-repository-usage/)
- [PostgreSQL — Ubuntu download (Manual Repository Configuration)](https://www.postgresql.org/download/linux/ubuntu/)
- [sources.list(5) — Debian bookworm](https://manpages.debian.org/bookworm/apt/sources.list.5.en.html)
- [apt_preferences(5) — Debian bookworm](https://manpages.debian.org/bookworm/apt/apt_preferences.5.en.html)
- [Debian Reference 2.1.3, 2.5.2](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html)

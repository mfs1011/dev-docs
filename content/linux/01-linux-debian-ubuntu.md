# 01 — Linux, Debian va Ubuntu

[Mundarija](README.md) · [Keyingi: Terminal va qobiq (shell) →](02-terminal-va-qobiq.md)

## Tushuncha

"Serverda Linux turibdi" degan gapda aslida uchta qatlam bor. Ularni ajrata olish keyingi hamma boblar uchun kerak: xato chiqqanda "bu yadroning muammosimi, dasturningmi yoki distributivning sozlamasimi" degan savolga shu ajratish orqali javob topiladi.

```text
┌─────────────────────────────────────────────────────────────┐
│  Sizning ilovangiz: Node.js, Python, PostgreSQL, nginx ...  │
├─────────────────────────────────────────────────────────────┤
│  Distributiv: Debian yoki Ubuntu                            │
│   bash, ls, cp (GNU), systemd, apt, minglab paket           │
│   — hammasi bir-biriga moslab yig'ilgan va yangilanadi      │
├─────────────────────────────────────────────────────────────┤
│  Yadro (kernel): Linux                                      │
│   jarayonlar, xotira, fayl tizimi, tarmoq, qurilmalar       │
├─────────────────────────────────────────────────────────────┤
│  Temir yoki virtual mashina (VPS)                           │
└─────────────────────────────────────────────────────────────┘
```

**Linux** — aslida faqat **yadro** (kernel), ya'ni operatsion tizimning eng pastki qismi. Yadroning rasmiy README faylida u shunday ta'riflanadi: Linux — Unix operatsion tizimining nusxasi (klon), uni Linus Torvalds internet orqali bog'langan dasturchilar bilan birga noldan yozgan. U POSIX va Single UNIX Specification standartlariga mos bo'lishga intiladi. Unda zamonaviy Unix'dan kutiladigan hamma narsa bor: haqiqiy ko'p vazifalilik (bir vaqtda ko'p dastur ishlaydi), virtual xotira, umumiy kutubxonalar, IPv4 va IPv6 tarmog'i. Litsenziyasi — GNU GPL v2.

Yadro dasturlarni ishga tushiradi, xotirani taqsimlaydi, diskka yozadi, tarmoq paketlarini yuboradi. Lekin yadroning o'zida `ls` buyrug'i ham, terminal ham, paket o'rnatadigan dastur ham yo'q. Bularni boshqa loyihalar yozadi: `ls` va `cp` — GNU loyihasidan, `bash` — GNU'dan, `systemd` — alohida loyiha, `apt` — Debian'dan.

**Distributiv** (distribution) — yadroni va shu minglab alohida dasturlarni olib, bir-biriga moslab yig'adigan, sinaydigan va yillar davomida xavfsizlik yangilanishlarini chiqarib turadigan loyiha. Debian Reference buni bir gap bilan aytadi: Debian shu turli-tuman erkin dasturlarni **bitta tizimga birlashtiradi**.

Serverdagi ilovangiz uchun eng muhim savollar shu qatlamda hal bo'ladi: qaysi paket versiyasi o'rnatiladi, xavfsizlik yangilanishi qancha vaqt keladi, konfiguratsiya fayllari qayerda turadi. Shuning uchun bu qo'llanma "Linux" deganda amalda **Debian va Ubuntu** distributivlarini nazarda tutadi.

## Debian

Debian Reference'ga ko'ra Debian — erkin operatsion tizim yaratish uchun birlashgan odamlar jamiyati. Uning distributivi quyidagilar bilan ajralib turadi:

- erkin dasturga sodiqlik (Debian Social Contract va Debian Free Software Guidelines);
- internet orqali tarqalgan, haq to'lanmaydigan ko'ngillilar mehnati;
- oldindan yig'ilgan juda ko'p sifatli paketlar;
- barqarorlik va xavfsizlikka e'tibor, xavfsizlik yangilanishlarini oson olish;
- ko'p protsessor arxitekturalarini qo'llab-quvvatlash.

### Uchta tarmoq: stable, testing, unstable

Debian rasmiy relizlar sahifasiga ko'ra Debian'da har doim kamida uchta reliz faol yuritiladi:

| Tarmoq | Nima | Hozirgi nomi |
| --- | --- | --- |
| **stable** | Rasman chiqarilgan oxirgi reliz. Debian **asosan shuni tavsiya qiladi**, bu — production relizi | 13 "trixie" |
| **testing** | Hali stable'ga kirmagan, lekin navbatda turgan paketlar. Afzalligi — dasturlar yangiroq | "forky" (kelajakdagi 14) |
| **unstable** | Faol ishlab chiqish shu yerda bo'ladi. Asosan Debian dasturchilari ishlatadi | doim "sid" |

Serverga **stable** qo'yiladi. Testing va unstable ishlab chiqish uchun.

### Reliz qancha yashaydi

Debian relizining hayot sikli **besh yil**: dastlabki uch yil to'liq qo'llab-quvvatlash, keyin ikki yil **LTS** (Long Term Support — uzoq muddatli qo'llab-quvvatlash). LTS ham tugagach, ba'zi relizlarga uchinchi tomonning pullik **ELTS** (Extended LTS) xizmati bor.

Relizlar jadvali (rasmiy sahifadan, 2026-11-05 holati):

| Versiya | Nomi | Chiqqan | Oddiy qo'llab-quvvatlash tugashi | LTS tugashi | Holati |
| --- | --- | --- | --- | --- | --- |
| 13 | trixie | 2025-08-09 | 2028-08-09 | 2030-06-30 | joriy stable |
| 12 | bookworm | 2023-06-10 | 2026-07-11 | 2028-06-30 | oldstable, LTS'da |
| 11 | bullseye | 2021-08-14 | 2024-08-14 | 2026-08-31 | oldoldstable |

Stable reliz vaqti-vaqti bilan yangilanadi: masalan, 13 dastlab 13.0 bo'lib chiqqan, uning oxirgi yangilanishi 13.7 (2026-09-12). Bunday nuqtali yangilanish (point release) — yangi reliz emas, shu relizning o'zi.

> **Trenajor haqida.** Trenajor Debian 12 da ishlaydi, chunki brauzerdagi emulyator 32-bitli kompyuterni emulyatsiya qiladi. Debian 13 ning reliz izohlariga ko'ra, unda i386 endi oddiy arxitektura sifatida qo'llab-quvvatlanmaydi: rasmiy yadro ham, o'rnatuvchi ham yo'q ([trixie release notes, 5.1.2](https://www.debian.org/releases/trixie/release-notes/issues.en.html)). Debian 12 hozir LTS bosqichida. Bu qo'llanmadagi asosiy mavzular 12 va 13 da bir xil ishlaydi. Farq bo'lsa, bobda alohida aytiladi.

## Ubuntu

Ubuntu'ning rasmiy sahifasi Debian haqida "Ubuntu qurilgan poydevor" (the rock on which Ubuntu is built) deydi. Ubuntu Debian'ning arxitekturasi va infratuzilmasi ustiga quriladi. Lekin uning alohida dasturchilar jamoasi va boshqacha reliz jarayoni bor. Ubuntu'ni **Canonical** kompaniyasi boshqaradi.

Ubuntu hujjati bu munosabatni "upstream" va "downstream" so'zlari bilan tushuntiradi:

- **Upstream** (yuqori oqim) — boshqa loyiha tayanadigan asl loyiha. "Debian — Ubuntu'ning upstream'i."
- **Downstream** (quyi oqim) — boshqa loyihaga tayanadigan loyiha. "Ubuntu — Debian'ning downstream'i."
- Ubuntu paketlari to'plami Debian paketlari to'plamidan olingan. Ubuntu paketni Debian'nikidan o'zgartirgan bo'lsa, bu farq **Ubuntu delta** deyiladi.
- Har bir yangi Ubuntu versiyasini tayyorlashning boshida Debian'dagi yangi paket versiyalari avtomatik olib kelinadi. Bu jarayon "Debian Import Freeze" degan sanada to'xtaydi.

### Versiya raqami

Ubuntu versiyasi `YY.MM[.POINT-RELEASE] [LTS]` ko'rinishida yoziladi:

- `YY` — birinchi chiqqan yilning ikki raqami;
- `MM` — oyi;
- `POINT-RELEASE` — nuqtali yangilanish raqami. Birinchi relizda yozilmaydi;
- `LTS` — uzoq muddat qo'llab-quvvatlanadigan reliz belgisi.

Masalan, `26.04.1 LTS` degani: 2026-yil aprelda chiqqan LTS relizning birinchi nuqtali yangilanishi.

### LTS va interim relizlar

Ubuntu har **olti oyda** yangi versiya chiqaradi. Har **ikki yilda**, juft yillarning aprelida chiqadigan versiya **LTS** bo'ladi.

| Turi | Qancha qo'llab-quvvatlanadi | Kim uchun (rasmiy tavsiya) |
| --- | --- | --- |
| **LTS** | 5 yil standart xavfsizlik yangilanishi (Main repozitoriysidagi paketlar uchun) | Production, kompaniyalar, uzoq muddatli loyihalar |
| **Interim** (oraliq) | 9 oy | Eng yangi yadro va vositalar kerak bo'lganlar, tez sinab ko'rish |
| **Ubuntu Pro** (LTS ustiga obuna) | 15 yilgacha | Shaxsiy foydalanish uchun 5 tagacha kompyuterda bepul |

Hozirgi relizlar (rasmiy reliz sikli sahifasidan):

| Versiya | Chiqqan | Standart xavfsizlik yangilanishi tugashi |
| --- | --- | --- |
| 26.04 LTS | 2026-yil aprel | 2031-yil may |
| 26.10 (interim) | 2026-yil oktyabr | 2027-yil iyul |

Ubuntu hujjatining o'zi taxmin qiladi: barcha Ubuntu o'rnatishlarining taxminan 95% i LTS relizlar.

### Ubuntu 26.04 dagi yangiliklar

Ubuntu 26.04 Debian'dan bir nechta asosiy vosita bilan farq qiladi. Bular keyingi boblarda chiqadi, shuning uchun hozirdan bilib qo'ying. Rasmiy reliz izohlariga ko'ra:

- **rust-coreutils.** `ls`, `cat`, `sort` kabi asosiy buyruqlar endi Rust tilida qayta yozilgan to'plamdan keladi. Hali to'liq mos emasligi uchun klassik GNU buyruqlari ham qoldirilgan: ularni `gnu` prefiksi bilan chaqirish mumkin (masalan, `gnuls`). Hal qilinmagan xatolar sababli `cp`, `mv` va `rm` hali GNU'niki.
- **sudo-rs.** Administrator huquqi bilan buyruq bajaradigan `sudo` ham endi Rust'dagi `sudo-rs`. Asl `sudo` `sudo.ws` deb qayta nomlangan.
- **chrony.** Vaqtni sinxronlashni yangi o'rnatishlarda `systemd-timesyncd` o'rniga chrony qiladi.

Debian'da bularning hammasi klassik vositalar: GNU coreutils, sudo, systemd-timesyncd.

## Buyruqlar: serverda nima turibdi?

Notanish serverga kirganda birinchi savol: bu qaysi distributiv, qaysi versiya, qaysi yadro? Javob ikki buyruqda.

### `/etc/os-release` — distributiv va versiya

`/etc/os-release` — operatsion tizim haqidagi standart fayl. Uning formati systemd loyihasining `os-release(5)` sahifasida tavsiflangan. Debian ham, Ubuntu ham bu faylni bir xil formatda yozadi. `cat` — fayl mazmunini ekranga chiqaradigan buyruq.

Trenajorda (Debian 12):

```text
$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
NAME="Debian GNU/Linux"
VERSION_ID="12"
VERSION="12 (bookworm)"
VERSION_CODENAME=bookworm
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
```

Sinov VPS'ida (Ubuntu 26.04):

```text vps
$ cat /etc/os-release
PRETTY_NAME="Ubuntu 26.04.1 LTS"
NAME="Ubuntu"
VERSION_ID="26.04"
VERSION="26.04.1 LTS (Resolute Raccoon)"
VERSION_CODENAME=resolute
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=resolute
LOGO=ubuntu-logo
```

Eng kerakli qatorlar:

| Qator | Ma'nosi | Nimaga kerak |
| --- | --- | --- |
| `ID` | Distributiv nomi, kichik harfda (`debian`, `ubuntu`) | Skriptda distributivni aniqlash |
| `VERSION_ID` | Versiya raqami (`12`, `26.04`) | Qo'llab-quvvatlash muddatini jadvaldan topish |
| `VERSION_CODENAME` | Kod nomi (`bookworm`, `resolute`) | Tashqi repozitoriy qo'shganda shu nom yoziladi (26-bob) |
| `ID_LIKE` | Shu distributivga yaqin "ota" distributivlar | Ubuntu'da `debian` — Debian uchun yozilgan ko'rsatmalar ko'pincha mos keladi |

Debian'da `ID_LIKE` qatori yo'q: Debian'ning o'zi asl distributiv.

### `uname` — yadro

Distributiv versiyasi va yadro versiyasi — **alohida narsalar**. `uname -r` yadro relizini (release), `uname -m` protsessor arxitekturasini (machine) chiqaradi.

Trenajorda:

```text
$ uname -r
6.1.0-50-686
$ uname -m
i686
```

VPS'da:

```text vps
$ uname -r
7.0.0-38-generic
$ uname -m
x86_64
```

Trenajorda Linux 6.1 yadrosi, 32-bitli x86 (`i686`). VPS'da Linux 7.0, 64-bitli x86 (`x86_64`).

Oddiy serverda yadroni ham distributiv paket qilib beradi va u boshqa paketlar kabi `apt` bilan yangilanadi (24-bob). VPS'da:

```text vps
$ dpkg -l 'linux-image*' | grep ^ii | awk '{print $2}'
linux-image-7.0.0-38-generic
linux-image-virtual
```

Trenajorda bu buyruq hech narsa topmaydi. Trenajorning yadrosi Debian'ning `linux-image-6.1.0-50-686` paketidan olingan, lekin u emulyatorga tashqaridan beriladi va tizim ichiga paket sifatida o'rnatilmagan.

### `/etc/debian_version` — Debian ildizi

Debian asosidagi tizimlarda yana bitta fayl bor:

```text
$ cat /etc/debian_version
12.15
```

```text vps
$ cat /etc/debian_version
forky/sid
```

Trenajorda bu Debian nuqtali relizining aniq raqami: 12.15. Ubuntu'da esa bu faylga Debian'ning ishlab chiqish tarmog'i nomi yozilgan: "forky" (Debian'ning hozirgi testing tarmog'i) va "sid" (unstable). Bu Ubuntu'ning paketlari Debian'dan olinishini ko'rsatadi. Lekin bu fayl Ubuntu versiyasini aniqlash uchun **yaramaydi**, buning uchun `/etc/os-release` bor.

## Variantlar: serverga qaysi biri?

Ikkalasi ham server uchun mos. Farqlar rasmiy hujjatlar bo'yicha:

| | Debian stable | Ubuntu LTS |
| --- | --- | --- |
| Kim yuritadi | Ko'ngillilar jamiyati | Canonical kompaniyasi (Debian asosida) |
| Yangi reliz | Muntazam; keyingisi (14) uchun sana hali belgilanmagan | Qat'iy jadval: LTS har ikki yilda, aprelda |
| Bepul qo'llab-quvvatlash | 5 yil (3 yil to'liq + 2 yil LTS) | 5 yil standart xavfsizlik yangilanishi |
| Uzaytirish | ELTS — uchinchi tomon, pullik | Ubuntu Pro — 15 yilgacha, shaxsiy foydalanish uchun 5 kompyutergacha bepul |
| Asosiy vositalar | Klassik: GNU coreutils, sudo | 26.04 dan: rust-coreutils, sudo-rs, chrony |
| Hujjat | Debian Reference, man sahifalari | Ubuntu Server hujjati, man sahifalari |

Amalda tanlovni ko'pincha hosting provayderi yoki jamoa qiladi. Bu qo'llanmadagi ko'nikmalar ikkalasida bir xil ishlaydi. Farq chiqadigan joylar (masalan, `sudo-rs` yoki tarmoq sozlamalari) har bobda alohida ko'rsatiladi.

## Tipik xatolar

**1. Ubuntu'ning interim relizini serverga qo'yish.**
Masalan, 26.10 "yangiroq" deb tanlanadi. Lekin u 9 oy yashaydi: 2027-yil iyuldan keyin unga xavfsizlik yangilanishi kelmaydi. Shundan keyin serverni har 6–9 oyda katta versiyaga ko'chirish kerak bo'ladi.
To'g'risi: serverga LTS relizini qo'ying. Ubuntu'ning rasmiy tavsiyasi ham shu.

**2. Muddati o'tgan relizda qolib ketish.**
Server yillar davomida ishlaydi, reliz esa eskiradi. Masalan, Debian 11 ning LTS tugash sanasi 2026-08-31 deb belgilangan. Qo'llab-quvvatlash tugagach, yangi topilgan xavfsizlik teshiklari yopilmaydi.
To'g'risi: `cat /etc/os-release` bilan versiyani bilib, uni rasmiy jadval bilan solishtiring ([Debian](https://www.debian.org/releases/), [Ubuntu](https://ubuntu.com/about/release-cycle)). Muddati yaqinlashsa, ko'chishni rejalashtiring.

**3. Yadro versiyasini distributiv versiyasi deb o'ylash.**
`uname -r` `6.1.0-50-686` deb chiqaradi va "bu Linux 6.1" deyiladi. Bu to'g'ri, lekin u **yadro** versiyasi. Qaysi paketlar o'rnatilishi, ular qachongacha yangilanishi distributivga bog'liq.
To'g'risi: distributivni `/etc/os-release` dan, yadroni `uname -r` dan bilib oling.

**4. Ubuntu ko'rsatmasini Debian'da (yoki aksincha) ko'r-ko'rona bajarish.**
Asosiy buyruqlar bir xil, lekin farqlar bor: Ubuntu 26.04 da `sudo` — sudo-rs, vaqtni chrony sinxronlaydi, ba'zi paketlar faqat bittasida bor.
To'g'risi: ko'rsatma qaysi distributiv va versiya uchun yozilganini tekshiring. Bu qo'llanmada har farq alohida belgilangan.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=01-tizimni-tanish)** "Notanish serverni tanib olish": trenajorda qadamma-qadam bajarasiz.

Savollar (trenajorda tekshirib ko'ring):

1. `cat /etc/os-release` ni ishga tushiring. Kod nomi (`VERSION_CODENAME`) nima?
2. Shu faylda `ID_LIKE` qatori bormi? Nega?
3. Yadro versiyasini va protsessor arxitekturasini aniqlang.
4. `cat /etc/debian_version` qaysi nuqtali relizni ko'rsatadi?
5. Rasmiy jadvalga qarab ayting: trenajordagi Debian versiyasining LTS'i qachon tugaydi?

<details>
<summary>Javoblar</summary>

1. `bookworm`.
2. Yo'q. Debian asl distributiv, uning "ota" distributivi yo'q.
3. `uname -r` → `6.1.0-50-686`, `uname -m` → `i686`.
4. `12.15`.
5. 2028-06-30 da.

</details>

## Rasmiy hujjat

- [Linux kernel README — What is Linux?](https://www.kernel.org/doc/html/latest/admin-guide/README.html)
- [Debian Reference — What is Debian](https://www.debian.org/doc/manuals/debian-reference/pr01.en.html)
- [Debian Releases](https://www.debian.org/releases/)
- [Ubuntu — Debian is the rock on which Ubuntu is built](https://ubuntu.com/community/docs/governance/debian)
- [Ubuntu project docs — Upstream and downstream](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/upstream-and-downstream/)
- [Ubuntu project docs — Ubuntu releases](https://ubuntu.com/project/docs/release-team/ubuntu-releases/)
- [Ubuntu project docs — Release cycle](https://ubuntu.com/project/docs/release-team/release-cycle/)
- [Ubuntu release cycle](https://ubuntu.com/about/release-cycle)
- [Ubuntu 26.04 LTS summary (reliz izohlari)](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/)
- [os-release(5)](https://www.freedesktop.org/software/systemd/man/latest/os-release.html)
- [uname(1)](https://manpages.debian.org/bookworm/coreutils/uname.1.en.html)

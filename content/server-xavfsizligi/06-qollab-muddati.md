# 06 — Qo'llab-quvvatlash muddati

[Mundarija](README.md)

## Tushuncha

Yangilanishlar faqat reliz **qo'llab-quvvatlanayotgan** paytda chiqadi. Muddati tugagan relizda yangi zaifliklar tuzatilmaydi — `apt upgrade` hech narsa topmaydi, lekin tizim xavfsiz emas.

### LTS va oraliq relizlar

UB (How to upgrade your Ubuntu release): **LTS** (Long Term Support) relizini ishlatish tavsiya etiladi — **5 yil** standart qo'llab-quvvatlash va xavfsizlik yangilanishlari; oraliq (interim) relizlar — atigi **9 oy**. Ubuntu 26.04 LTS — standart xavfsizlik yangilanishlari **2031-yil may**gacha (Ubuntu release cycle, README).

### Ubuntu Pro: ESM va Livepatch

UB (Introduction to security, Security suggestions):

- **ESM** (Expanded Security Maintenance) — Main paketlari uchun qo'llovni 5 dan **10 yilga** uzaytiradi va **Universe** paketlarini ham qamraydi. UB: har bir Ubuntu tizimi uchun tavsiya etiladi.
- **Livepatch** — yadroning yuqori va kritik zaifliklarini tizim ishlab turganda, darhol rebootsiz yamaydi (5-bob).
- Pro — 5 tagacha mashinada bepul (biznes yoki shaxsiy maqsadda).

US (ESM): ESM Pro mijozi orqali obunaga ulangandan keyin yoqiladi; yangilanishlar oddiy `apt` orqali keladi — Pro mijozi `/etc/apt/sources.list.d/` ga `esm.ubuntu.com` omborlarini qo'shadi: **Infra** — Main paketlari, **Apps** — Universe paketlari. ESM paketlari prioriteti 510 ga pinlanadi (standartdan biroz yuqori).

| Ombor qismi | Standart LTS (5 yil) | Pro bilan |
| --- | --- | --- |
| Main/Restricted | Xavfsizlik yangilanishlari | 10 yil (esm-infra) |
| Universe/Multiverse | Kafolatlanmagan | Xavfsizlik yangilanishlari (esm-apps) |

### Keyingi LTS'ga o'tish

UB:

- Faqat **ketma-ket** LTS'ga (masalan, 16.04 → 18.04); oraliqlarni o'tkazib bo'lmaydi.
- LTS → LTS yangilash faqat **birinchi nuqtali relizdan** keyin taklif qilinadi (masalan, 20.04 → faqat 20.04.1 chiqqach).
- Oldin: reliz eslatmalarini o'qish; tizimni **to'liq** yangilash (`apt update`, `apt dist-upgrade -o APT::Get::Always-Include-Phased-Updates=true`); kerak bo'lsa reboot; diskda joy; vaqt (jarayon interaktiv); uchinchi tomon omborlari va PPA'lar yangilash paytida **o'chiriladi**; **zaxira nusxa**.
- Buyruq: `sudo do-release-upgrade` (Server va bulut obrazlari uchun tavsiya etiladi). `-d` — rivojlanish relizi, production uchun tavsiya etilmaydi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### Reliz va Pro mijozi

```text vps
$ grep -E '^(PRETTY_NAME|VERSION_CODENAME)=' /etc/os-release; pro version 2>&1 | head -1
PRETTY_NAME="Ubuntu 26.04.1 LTS"
VERSION_CODENAME=resolute
/tmp/.vpsrun-19413.sh: line 4: pro: command not found
$ apt-cache policy ubuntu-pro-client | head -3; DEBIAN_FRONTEND=noninteractive apt-get install -y -q ubuntu-pro-client 2>&1 | grep -E '^Setting up ubuntu-pro'
ubuntu-pro-client:
  Installed: (none)
  Candidate: 38ubuntu0~26.04
Setting up ubuntu-pro-client (38ubuntu0~26.04) ...
Setting up ubuntu-pro-client-l10n (38ubuntu0~26.04) ...
```

Provayder shablonida Pro mijozi (`pro` buyrug'i) yo'q edi — Ubuntu'ning rasmiy omboridan `ubuntu-pro-client` o'rnatildi.

```text vps
$ pro status 2>&1 | head -14
WARNING: this output is intended to be human readable, and subject to change.
In scripts, prefer using machine readable data from the `pro api` command,
or use `pro status --format json`.

SERVICE          AVAILABLE  DESCRIPTION
anbox-cloud      yes        Scalable Android in the cloud
esm-apps         yes        Expanded Security Maintenance for Applications
esm-infra        yes        Expanded Security Maintenance for Infrastructure
landscape        yes        Management and administration tool for Ubuntu
livepatch        yes        Canonical Livepatch service

For a list of all Ubuntu Pro services, run 'pro status --all'

This machine is not attached to an Ubuntu Pro subscription.
```

`esm-apps`, `esm-infra`, `livepatch` — mavjud (`yes`), lekin mashina Pro obunasiga **ulanmagan**: bu xizmatlar ishlamayapti.

### Paketlar qaysi qo'llovda

```text vps
$ pro security-status 2>&1 | head -16
WARNING: this output is intended to be human readable, and subject to change.
In scripts, prefer using machine readable data from the `pro api` command,
or use `pro security-status --format json`.

412 packages installed:
    387 packages from Ubuntu Main/Restricted repository
    15 packages from Ubuntu Universe/Multiverse repository
    10 packages from third parties

To get more information about the packages, run
    pro security-status --help
for a list of available options.

The system apt cache may be outdated. Make sure to run
    sudo apt update
to get the latest package information from apt.
$ pro security-status --esm-apps 2>&1 | grep -vE 'WARNING|machine readable|format json|^\s*$' | head -14
412 packages installed:
    15 packages from Ubuntu Universe/Multiverse repository
Ubuntu Pro with 'esm-apps' enabled provides security updates for
Universe/Multiverse packages until 2036.
Run 'pro help esm-apps' to learn more
Installed packages covered by esm-apps:
  dialog gnupg2 ifupdown libdialog15 mc mc-data php-fpm php8.5-fpm pigz
  python3-linux-procfs qemu-guest-agent shellcheck systemd-zram-generator tuned
  virt-what
```

- 412 paketdan 387 tasi — Main/Restricted (5 yil standart qo'llov), **15 tasi** — Universe/Multiverse, 10 tasi — uchinchi tomon (Docker, nginx, Redis — 3-bob).
- Universe'dagi 15 paket — jumladan `php8.5-fpm` (Nginx kitobi, 12-bob), `qemu-guest-agent`, `tuned` — Pro'siz **xavfsizlik yangilanishi kafolatlanmagan**; `esm-apps` bilan — 2036-yilgacha.

### Keyingi reliz

```text vps
$ grep -E '^Prompt=' /etc/update-manager/release-upgrades; do-release-upgrade -c 2>&1 | tail -3
Prompt=lts
There is no development version of an LTS available.
To upgrade to the latest non-LTS development release 
set Prompt=normal in /etc/update-manager/release-upgrades.
```

`Prompt=lts` — faqat LTS'dan LTS'ga taklif qilinadi; hozircha yangi LTS yo'q.

## Variantlar

| Vaziyat | Tanlov |
| --- | --- |
| Production server | LTS (UB) |
| Universe paketlari muhim | Pro `esm-apps` |
| Reboot qilish qiyin | Pro Livepatch |
| LTS muddati tugayapti | Keyingi LTS'ga `do-release-upgrade` yoki yangi serverga qayta joylash |
| Uchinchi tomon omborlari ko'p | Yangilashdan oldin ular yangi relizni qo'llashini tekshirish (UB) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Oraliq relizni serverga | 9 oy qo'llov (UB) | LTS |
| Universe paketlari ham 5 yil yangilanadi deb o'ylash | Standart qo'llov — Main (UB) | `pro security-status`, kerak bo'lsa esm-apps |
| Muddati o'tgan relizda `apt upgrade` "hech narsa yo'q" deb xotirjam bo'lish | Yangi tuzatishlar chiqmaydi | Relizni yangilash yoki ESM |
| To'liq yangilanmagan tizimni reliz yangilash | UB: avval to'liq yangilash | `apt dist-upgrade`, reboot |
| Zaxirasiz reliz yangilash | Muammo bo'lsa tiklab bo'lmaydi | Zaxira (19–21-boblar) |
| Bir nechta LTS'ni sakrab o'tish | Faqat ketma-ket (UB) | Bosqichma-bosqich |

## Amaliyot

1. LTS va oraliq relizlar qancha qo'llab-quvvatlanadi?
2. Ubuntu 26.04 LTS ning standart qo'llovi qachongacha?
3. ESM nimani qamraydi? Livepatch-chi?
4. `pro security-status` sinovda nimani ko'rsatdi?
5. 22.04 dan 26.04 ga qanday o'tiladi?
6. LTS yangilanishi qachondan taklif qilinadi?

<details>
<summary>Javoblar</summary>

1. LTS — 5 yil, oraliq — 9 oy.
2. 2031-yil maygacha.
3. ESM — Main uchun 10 yil va Universe paketlari; Livepatch — yadroni rebootsiz yamash.
4. 15 ta Universe paketi (masalan, `php8.5-fpm`) faqat esm-apps bilan qo'llanadi; mashina Pro'ga ulanmagan.
5. Ketma-ket: 22.04 → 24.04 → 26.04, har safar `do-release-upgrade`.
6. Yangi LTS ning birinchi nuqtali relizidan (masalan, 26.04.1) keyin.

</details>

## Rasmiy hujjat

- [UB: How to upgrade your Ubuntu release](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)
- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [Introduction to security](https://ubuntu.com/server/docs/explanation/intro-to/security/)
- [US: Expanded Security Maintenance](https://documentation.ubuntu.com/security/security-updates/esm/)
- [Ubuntu release cycle](https://ubuntu.com/about/release-cycle)

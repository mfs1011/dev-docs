# 01 — Server nimadan himoyalanadi

[Mundarija](README.md)

## Tushuncha

UB (Introduction to security): Ubuntu'ni o'rnatish, joylashtirish va ishlatishda xavfsizlik doim hisobga olinishi kerak. Yangi o'rnatilgan Ubuntu odatda darhol foydalanish uchun xavfsiz, lekin keyin u qanday ishlatilishiga qarab xavfsizlik holati juda muhim bo'ladi. Har doim **qatlamli** (layered) yondashuv kerak — tizim **bitta himoya nuqtasiga** tayanib qolmasin.

### Internetga ochiq server

Internetga ochiq server parol terib ko'rish kabi kirish urinishlariga duch keladi — bu qo'llanmaning sinov VPS'ida kuzatilgan holat pastda.

**Hujum yuzasi** (attack surface) — tashqaridan murojaat qilish mumkin bo'lgan hamma narsa: ochiq portlar, ishlab turgan servislar, kira oladigan foydalanuvchilar, o'rnatilgan paketlar. UB: keraksiz paketlarni olib tashlang — ochiq qoldirilgan hujum yuzasini kamaytirish uchun. Yuza qancha kichik bo'lsa, xato yoki zaiflik topilish ehtimoli shuncha kam.

### Himoya qatlamlari (UB, Security suggestions)

UB'ning tavsiyalari — har qanday Ubuntu tizimi uchun; hammasini qo'llash shart emas, sizning holatingizga mosini tanlang:

| Qatlam | Nima | Bob |
| --- | --- | --- |
| **Yangilab turish** | `apt update && apt upgrade` muntazam; xavfsizlik yangilanishlarini avtomatik o'rnatish (`unattended-upgrades`); keraksiz paketlarni olib tashlash; uchinchi tomon omborlaridan qochish; eng yangi reliz; Ubuntu Pro (ESM, Livepatch) | 3–6 |
| **Kirish nazorati** | **Eng kam huquq** tamoyili (principle of least privilege): root bo'lmagan, iloji boricha kam huquqli foydalanuvchilar; `sudo` faqat boshqaruv uchun. AppArmor — dasturlar imkoniyatini cheklash (dastur buzilsa ham zararni kamaytirish) | 7–8 |
| **Tarmoq xavfsizligi** | Firewall (`ufw`); masofadan kirish — SSH (OpenSSH) | 9–18 |
| **Zaxira va kuzatish** | Zaxira nusxa va tiklash; sozlamalar tarixi; kim kirgani | 19–23 |

UB "murakkab o'rnatishlar" uchun yana: LDAP, Kerberos, SSSD, Active Directory, VPN (WireGuard, OpenVPN), TLS, kriptografiya kutubxonalari va sertifikatlar. Eng to'liq manba — Ubuntu Security hujjati (US).

**Ubuntu Pro** (UB): 5 tagacha mashinada bepul (biznes yoki shaxsiy). Standart LTS'da Main paketlariga 5 yil xavfsizlik qo'llovi; Pro bilan — 10 yil va Universe paketlariga ham (**ESM**, Expanded Security Maintenance — har bir tizimga tavsiya etiladi). **Livepatch** — yadroning yuqori va kritik zaifliklarini tizim ishlab turganda, darhol rebootsiz yamaydi (6-bob).

## Ko'rib chiqamiz

Sinov VPS'ida (Ubuntu 26.04) — SSH jurnalidan oxirgi 24 soat, faqat sonlar (hujumchi manzillari ko'rsatilmaydi):

```text vps
$ journalctl -u ssh --since -24h --no-pager -o cat | grep -cE 'Invalid user|Failed password|authentication failure' | sed 's/^/oxirgi 24 soatdagi muvaffaqiyatsiz kirish urinishlari: /'; journalctl -u ssh --since -24h --no-pager -o cat | grep -oE '(Invalid user|Failed password for( invalid user)?) [^ ]+ from [0-9a-f.:]+' | awk '{print $NF}' | sort -u | wc -l | sed 's/^/turli manzillar soni: /'
oxirgi 24 soatdagi muvaffaqiyatsiz kirish urinishlari: 28196
turli manzillar soni: 209
```

Bir kunda **28 196** muvaffaqiyatsiz urinish, **209** turli manzildan — o'rtacha har 3 soniyada bittadan.

Qaysi foydalanuvchi nomlari bilan urinilgan (eng ko'p 8 tasi):

```text vps
$ journalctl -u ssh --since -24h --no-pager -o cat | grep -oE 'Invalid user [^ ]+' | awk '{print $3}' | sort | uniq -c | sort -rn | head -8
    316 ubuntu
    268 admin
    234 user
    119 debian
    112 deploy
     90 test
     57 user1
     49 claude
```

Kuzatildi: taxmin qilish oson nomlar — tizim nomlari (`ubuntu`, `debian`), umumiy (`admin`, `user`, `test`), vazifa nomlari (`deploy`).

```text vps
$ journalctl -u ssh --since -24h --no-pager -o cat | grep -c 'Accepted publickey' | sed 's/^/muvaffaqiyatli kirishlar (kalit bilan): /'
muvaffaqiyatli kirishlar (kalit bilan): 984
$ journalctl -u ssh --since -24h --no-pager -o cat | grep -c 'Accepted password' | sed 's/^/muvaffaqiyatli kirishlar (parol bilan): /'
muvaffaqiyatli kirishlar (parol bilan): 0
```

Bu davrda muvaffaqiyatli kirishlar — faqat **kalit** bilan, parol bilan — 0 (bu qo'llanma ustida ishlash jarayonidagi ulanishlar). SSH'ni faqat kalit bilan ochish — 10-bob.

Shuning uchun keyingi boblar tartibi: avval hozirgi holatni ko'rish (2-bob), keyin yangilanishlar, foydalanuvchilar, SSH, firewall va zaxira.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Mening serverimni hech kim bilmaydi" | Sinov VPS'iga kuniga 28 mingdan ortiq urinish bo'ldi | Har bir ochiq server himoyalanadi |
| Bitta himoyaga tayanish (masalan, faqat parol) | UB: qatlamli yondashuv | Yangilanish + kirish nazorati + tarmoq + zaxira |
| `admin`, `deploy`, `ubuntu` kabi nomlar + parol | Aynan shu nomlar bilan urinishadi (sinovda) | Kalit bilan kirish (10-bob) |
| Keraksiz servis va paketlarni qoldirish | Hujum yuzasi kattalashadi (UB) | Olib tashlash (3-bob) |
| Hamma ishni root bilan | Eng kam huquq tamoyiliga zid (UB) | Alohida foydalanuvchi + `sudo` (7-bob) |

## Amaliyot

1. UB'ning "qatlamli yondashuv" deganini qanday tushunasiz?
2. Hujum yuzasi nima? Uni qanday kamaytirasiz?
3. UB tavsiyalarining uch asosiy guruhi qaysilar?
4. Eng kam huquq tamoyili nimani talab qiladi?
5. Ubuntu Pro ESM va Livepatch nima beradi?
6. Sinov VPS'idagi urinishlar nimani ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. Tizim bitta himoya nuqtasiga tayanmasligi — bir qatlam yiqilsa, boshqasi to'xtatsin.
2. Tashqaridan murojaat qilish mumkin bo'lgan hamma narsa; keraksiz paket va servislarni olib tashlash, keraksiz portlarni yopish.
3. Yangilab turish, kirish nazorati, tarmoq xavfsizligi.
4. Iloji boricha kam huquqli, root bo'lmagan foydalanuvchilar; `sudo` faqat boshqaruv uchun.
5. ESM — xavfsizlik qo'llovini 10 yilga va Universe paketlariga kengaytiradi; Livepatch — yadroni rebootsiz yamaydi.
6. Kuniga 28 mingdan ortiq urinish, 209 manzildan, taxmin qilish oson foydalanuvchi nomlari bilan.

</details>

## Rasmiy hujjat

- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/)
- [UB: Introduction to security](https://ubuntu.com/server/docs/explanation/intro-to/security/)
- [US: Ubuntu Security documentation](https://documentation.ubuntu.com/security/)

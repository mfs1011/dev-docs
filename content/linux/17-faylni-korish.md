# 17 — Faylni ko'rish

[← Oldingi: Matn muharriri](16-matn-muharriri.md) · [Mundarija](README.md) · [Keyingi: grep va regex →](18-grep-va-regex.md)

## Tushuncha

Serverda fayllarning ko'pi matn: sozlamalar va loglar. Ularni tahrirlamasdan **ko'rish** uchun bir nechta buyruq bor. Har biri o'z ishiga mos:

| Vazifa | Buyruq |
| --- | --- |
| Kichik faylni to'liq chiqarish | `cat` |
| Boshini yoki oxirini olish | `head`, `tail` |
| Log o'sib borayotganini kuzatish | `tail -f`, `tail -F` |
| Qatorlar, so'zlar, baytlarni sanash | `wc` |
| Katta faylni varaqlash va ichida qidirish | `less` (**pager** — sahifalab ko'rsatuvchi dastur) |

Debian Reference ta'rifi: `cat` fayllarni ulab (concatenate), to'liq chiqaradi; `head` faylning boshini, `tail` oxirini chiqaradi; `less` — fayl ichini ko'rib chiqish uchun kengaytirilgan pager.

Bu bobdagi misollar uchun 1000 qatorli log yaratamiz:

```text
$ mkdir -p /tmp/korish && cd /tmp/korish
$ for i in $(seq 1 1000); do printf '2026-11-06 10:%02d:%02d INFO sorov %d\n' $((i/60)) $((i%60)) $i; done > app.log
```

## `cat`

```text
$ cat -n /etc/hostname /etc/debian_version
     1	trenajor
     2	12.15
```

- Bir nechta fayl berilsa, `cat` ularni ketma-ket bitta oqimga ulaydi. Nomi ham shundan: con**cat**enate.
- `-n` qatorlarni raqamlaydi.

`cat` ning eng foydali bayrog'i `-A`: u **ko'rinmas belgilarni** ko'rsatadi. Windows'da tahrirlangan sozlama fayli bunga yaxshi misol:

```text
$ printf 'host=db\r\nport=5432\r\n' > win.conf
$ cat win.conf
host=db
port=5432
$ cat -A win.conf
host=db^M$
port=5432^M$
```

- Oddiy `cat` da fayl to'g'ri ko'rinadi.
- `-A` esa har qator oxirida `^M` ni ko'rsatadi. Bu Windows qator oxiri (`\r`, carriage return). `$` — qatorning haqiqiy oxiri.
- Dastur qiymatni `\r` bilan birga o'qiydi. Masalan, bash bu faylni `source` qilsa:

```text
$ source win.conf; echo "[$host]" | cat -A
[db^M]$
```

Qiymat `db` emas, `db\r`. Ekranda farq ko'rinmaydi, lekin `db\r` nomli server topilmaydi.

`cat` ni katta faylga ishlatmang: ming qator ekrandan uchib o'tadi. Ikkilik (binary) faylga ham ishlatmang: terminalni axlat belgilar bilan to'ldiradi. Fayl matnmi yoki yo'qmi, `file` aytadi:

```text
$ file /usr/bin/ls app.log
/usr/bin/ls: ELF 32-bit LSB pie executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, BuildID[sha1]=e712379141772113ed25317b74f5bc89f94a2a3d, for GNU/Linux 3.2.0, stripped
app.log:     ASCII text
```

Trenajor 32-bitli, shuning uchun `ELF 32-bit ... Intel 80386`. Serveringizda `ELF 64-bit ... x86-64` bo'ladi.

## `head` va `tail`

Ikkalasi ham standart holatda **10 qator** chiqaradi. `-n` bilan sonini berasiz:

```text
$ head -n 3 app.log
2026-11-06 10:00:01 INFO sorov 1
2026-11-06 10:00:02 INFO sorov 2
2026-11-06 10:00:03 INFO sorov 3
$ tail -n 2 app.log
2026-11-06 10:16:39 INFO sorov 999
2026-11-06 10:16:40 INFO sorov 1000
```

Son oldidagi belgi ma'noni o'zgartiradi. Man sahifadagi ta'riflar:

| Yozuv | Ma'nosi |
| --- | --- |
| `tail -n 2` | Oxirgi 2 qator |
| `tail -n +999` | **999-qatordan boshlab** oxirigacha |
| `head -n 3` | Birinchi 3 qator |
| `head -n -998` | **Oxirgi 998 tasidan tashqari** hammasi |
| `head -c 20` | Birinchi 20 bayt |

```text
$ tail -n +999 app.log
2026-11-06 10:16:39 INFO sorov 999
2026-11-06 10:16:40 INFO sorov 1000
$ head -n -998 app.log
2026-11-06 10:00:01 INFO sorov 1
2026-11-06 10:00:02 INFO sorov 2
```

`tail -n +2` CSV yoki buyruq chiqishidan **sarlavha qatorini olib tashlash** uchun qulay: 2-qatordan boshlab hammasini beradi.

Bir nechta fayl berilsa, har birining oldiga nomi yoziladi:

```text
$ tail -n 1 app.log /etc/passwd
==> app.log <==
2026-11-06 10:16:40 INFO sorov 1000

==> /etc/passwd <==
messagebus:x:100:105::/nonexistent:/usr/sbin/nologin
```

## Logni kuzatish: `tail -f` va `tail -F`

`tail -f` faylning oxirini chiqaradi va **to'xtamaydi**: faylga yangi qator yozilsa, darhol ko'rsatadi. Servisni qayta ishga tushirib, logida nima bo'layotganini kuzatishning odatiy yo'li shu. To'xtatish: `Ctrl+C`.

Ammo `-f` bilan `-F` ning farqi muhim. Man sahifasiga ko'ra `-f` standart holatda **fayl deskriptorini** kuzatadi: fayl qayta nomlansa ham, `tail` o'sha faylning oxirini kuzatishda davom etadi. Log aylantirilganda (log rotation: `app.log` → `app.log.1`, o'rniga yangi bo'sh `app.log`) bu kerakli narsa emas. `-F` esa `--follow=name --retry` bilan teng: `tail` faylni **nomi** bo'yicha kuzatadi va fayl qayta yaratilsa, yangisiga o'tadi.

<div data-animatsiya="qadamli" data-nom="tail-f"></div>

Trenajorda ikkalasini bir xil vaziyatda sinaymiz. Logga `bir` va `ikki` yoziladi, keyin log aylantiriladi: eski fayl `F.log.1` ga ko'chadi, yangi `F.log` ga `yangi` yoziladi:

```text
$ echo bir > F.log; tail -F F.log > F.txt 2>&1 &
$ echo ikki >> F.log; mv F.log F.log.1; echo yangi > F.log
$ echo eski-faylga >> F.log.1
$ kill %1; cat F.txt
bir
ikki
tail: 'F.log' has become inaccessible: No such file or directory
tail: 'F.log' has appeared;  following new file
yangi
```

`-F` eski fayl yo'qolganini sezdi, yangisi paydo bo'lganda unga o'tdi va `yangi` ni ko'rsatdi. Xuddi shu holatda `-f` bilan:

```text
$ cat f.txt
bir
ikki
eski-faylga
```

`-f` qayta nomlangan **eski** faylda qoldi. Yangi `f.log` ga yozilgan `yangi` qatori ko'rinmadi. Servis loglari odatda aylantiriladi (logrotate — 37-bob), shuning uchun uzoq kuzatishda `tail -F` ishlating.

> Sinovda buyruqlar orasida `sleep 1`–`sleep 2` bor edi: `tail` o'zgarishni sezishiga vaqt kerak. Matnda ular qisqalik uchun tushirib qoldirilgan.

systemd servislarining logini `journalctl -f` bilan kuzatish 37-bobda.

## `wc`: sanash

```text
$ wc app.log
 1000  5000 34893 app.log
$ wc -l app.log /etc/passwd
 1000 app.log
   20 /etc/passwd
 1020 total
```

Man sahifaga ko'ra ustunlar doim shu tartibda: **qatorlar, so'zlar, baytlar**. Bayroqlar:

| Bayroq | Nimani sanaydi |
| --- | --- |
| `-l` | Qatorlar (aniqrog'i — yangi qator belgilari) |
| `-w` | So'zlar (bo'shliq bilan ajratilgan) |
| `-c` | Baytlar |
| `-m` | Belgilar (UTF-8 da bir belgi bir necha bayt bo'lishi mumkin) |

`-l` aslida yangi qator belgisini (`\n`) sanaydi. Shuning uchun oxirida `\n` bo'lmagan oxirgi qator **sanalmaydi**:

```text
$ printf 'bir\nikki' > oxiri.txt
$ wc -l oxiri.txt
1 oxiri.txt
```

Faylda ikki qator bor, `wc` esa `1` deydi. Skript yoki `printf` bilan yaratilgan fayllarda bunga e'tibor bering.

## `less`: katta faylni varaqlash

```text
$ less app.log
```

`less` faylni bir ekran qilib ko'rsatadi va siz uni varaqlaysiz. Debian Reference'ga ko'ra u argumentdagi faylni yoki stdin'ni o'qiydi. Faylsiz ishlatilsa, stdin'ni o'qiydi: `journalctl | less`.

`less` ichidagi asosiy tugmalar (less(1) man sahifasidan):

| Tugma | Vazifasi |
| --- | --- |
| `Space` / `b` | Bir ekran oldinga / orqaga |
| `↓` `↑` | Bir qator |
| `g` / `G` | Fayl boshi / oxiri |
| `/matn` | Oldinga qidirish |
| `?matn` | Orqaga qidirish |
| `n` / `N` | Keyingi / oldingi topilgan joy |
| `&matn` | Faqat shu matn bor qatorlarni ko'rsatish (bo'sh `&` — filtrni o'chiradi) |
| `F` | Oxiriga borib, yangi qatorlarni kutish (`tail -f` kabi); to'xtatish — `Ctrl+C` |
| `-i` | Qidiruvda katta-kichik harfni farqlash/farqlamaslik |
| `h` | Yordam |
| `q` | Chiqish |

Debian Reference maslahati: qidirish uchun `/` yoki `?`, katta-kichik harfga sezgirlikni o'zgartirish uchun `-i`, yordam uchun `h`.

Buyruq qatoridagi foydali bayroqlar:

| Buyruq | Nima qiladi |
| --- | --- |
| `less -N app.log` | Qator raqamlari bilan |
| `less -S app.log` | Uzun qatorlarni o'ramaydi, kesadi (`→` bilan o'ngga suriladi) |
| `less +G app.log` | Oxiridan ochadi |
| `less +F app.log` | Ochib, darhol `F` rejimiga o'tadi |
| `less -R fayl` | ANSI rang kodlarini rang qilib ko'rsatadi |

Man sahifaga ko'ra `+` bilan boshlangan bayroq — `less` ochilganda bajariladigan **buyruq**. Shuning uchun `+G` = ochib, `G` ni bosish; `+F` = ochib, `F` ni bosish.

`less +F` ning `tail -f` dan afzalligi: `Ctrl+C` bilan kuzatishni to'xtatasiz, `less` dan chiqmasdan orqaga varaqlaysiz va qidirasiz, keyin yana `F` bosasiz.

### `less`, `more` va `pager`

- `more` — eski pager, faqat oldinga varaqlaydi. Debian Reference'ga ko'ra minimal Debian tizimida standart pager `more`; `less` paketi o'rnatilgach standart pager `less` bo'ladi.
- `pager` buyrug'i — standart pager'ga havola (alternatives tizimi, 16-bob):

```text
$ ls -l /usr/bin/pager /etc/alternatives/pager
lrwxrwxrwx 1 root root 13 May  2  2024 /etc/alternatives/pager -> /usr/bin/less
lrwxrwxrwx 1 root root 23 May  2  2024 /usr/bin/pager -> /etc/alternatives/pager
```

`man` va `journalctl` uzun chiqishni pager orqali ko'rsatadi. `man` ichidagi tugmalarning `less` niki bilan bir xilligi shundan.

## Siqilgan loglar

Aylantirilgan eski loglar ko'pincha `gzip` bilan siqiladi: `syslog.2.gz`. Ularni ochmasdan o'qish uchun `z` bilan boshlanadigan buyruqlar bor: `zcat`, `zless`, `zgrep` (gzip paketi).

```text
$ gzip -k app.log && ls -lh app.log*
-rw-r--r-- 1 root root  35K Nov  6 04:00 app.log
-rw-r--r-- 1 root root 4.8K Nov  6 04:00 app.log.gz
$ zcat app.log.gz | tail -n 1
2026-11-06 10:16:40 INFO sorov 1000
```

`-k` asl faylni saqlab qoladi (keep). Bu log 35K dan 4.8K ga kichraydi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `cat`, `head`, `tail`, `wc` | GNU coreutils 9.1 | uutils (rust-coreutils) 0.10.0 |
| `less` | 590 | 668 |
| `pager` → | `/usr/bin/less` | `/usr/bin/less` |

Bu bobdagi `tail -n +999`, `head -n -998`, `wc`, `cat -A` va `tail -F` misollari VPS'da ham sinaldi. Natijalar bir xil, `tail -F` xabarlari ham so'zma-so'z bir xil.

## Tipik xatolar

**1. Katta logni `cat` qilish.**
Terminal minglab qatorga to'lib, kerakli joy ko'rinmay qoladi.
To'g'risi: `less`, `tail -n 100` yoki `grep` (18-bob).

**2. Aylantiriladigan logni `tail -f` bilan kuzatish.**
Rotatsiyadan keyin yangi qatorlar ko'rinmaydi.
To'g'risi: `tail -F`.

**3. `wc -l` ga to'liq ishonish.**
Oxirgi qatorda `\n` bo'lmasa, u sanalmaydi.

**4. Windows qator oxirini ko'rmaslik.**
Sozlama fayli to'g'ri ko'rinadi, lekin dastur qiymatlarni noto'g'ri o'qiydi.
Tekshirish: `cat -A`. `^M$` ko'rinsa — fayl Windows formatida.

**5. `less` dan chiqolmaslik.**
`q` bosing. `F` rejimida bo'lsangiz, avval `Ctrl+C`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=17-korish)** "Logni ko'rish": 1000 qatorli logning boshini, oxirini va o'rtasini olasiz, sanaysiz va `less` da qidirasiz.

Savollar:

1. `tail -n 5` va `tail -n +5` ning farqi nima?
2. Log har kecha aylantiriladi. Uni bir hafta kuzatib turish uchun `tail -f` mi, `tail -F` mi?
3. `printf 'a\nb\nc' | wc -l` nima chiqaradi va nega?
4. `less` da faqat `ERROR` bor qatorlarni qanday qoldirasiz?
5. Sozlama faylidagi qiymat to'g'ri ko'rinadi, dastur esa uni qabul qilmayapti. Qaysi buyruq bilan tekshirasiz?

<details>
<summary>Javoblar</summary>

1. `-n 5` — oxirgi 5 qator. `-n +5` — 5-qatordan boshlab oxirigacha.
2. `tail -F`: u faylni nomi bo'yicha kuzatadi va aylantirishdan keyin yangi faylga o'tadi.
3. `2`: `wc -l` yangi qator belgilarini sanaydi, `c` dan keyin `\n` yo'q.
4. `&ERROR` va `Enter`.
5. `cat -A`: Windows qator oxiri (`^M`) yoki boshqa ko'rinmas belgilar ko'rinadi.

</details>

## Rasmiy hujjat

- [Debian Reference 1.4.5 — The pager](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_pager)
- [Debian Reference 1.6 — Unix-like text processing](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_unix_like_text_processing)
- [GNU Coreutils — cat invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#cat-invocation)
- [GNU Coreutils — head invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#head-invocation)
- [GNU Coreutils — tail invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#tail-invocation)
- [GNU Coreutils — wc invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#wc-invocation)
- [less(1) — man7.org](https://man7.org/linux/man-pages/man1/less.1.html)
- Trenajorda: `man tail`, `man head`, `man wc`, `man less`

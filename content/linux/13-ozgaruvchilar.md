# 13 — O'zgaruvchilar va muhit

[← Oldingi: Pipe va buyruqlar zanjiri](12-pipe.md) · [Mundarija](README.md) · [Keyingi: Kengaytmalar va qo'shtirnoq →](14-kengaytmalar.md)

## Tushuncha

Ubuntu hujjati o'zgaruvchini yorliqli qutiga o'xshatadi: unga nom berasiz, ichiga qiymat solasiz va keyin qiymatni shu nom bilan olasiz.

Dasturchi uchun bu bobning eng muhim savoli: **"Nega ilovam `DB_HOST` ni ko'rmayapti?"** Javob ikki xil o'zgaruvchining farqida:

| | Qobiq (shell) o'zgaruvchisi | Muhit o'zgaruvchisi (environment) |
| --- | --- | --- |
| Qanday yaratiladi | `NOM=qiymat` | `export NOM=qiymat` |
| Kim ko'radi | Faqat shu qobiq (shell) | Shu qobiq (shell) **va u ishga tushirgan har bir dastur** |
| Misol | Skript ichidagi vaqtinchalik qiymat | `PATH`, `HOME`, `DB_HOST` |

Bash qo'llanmasiga ko'ra har bir dastur ishga tushganda unga **muhit** (environment) beriladi: `nom=qiymat` juftliklari ro'yxati. Ishga tushirilgan buyruqlar muhitni ota jarayondan **meros** qilib oladi.

<div data-animatsiya="muhit"></div>

## Tayyor o'zgaruvchilar

Qiymatni olish uchun nom oldiga `$` qo'yiladi:

```text
$ mkdir -p /tmp/ozg && cd /tmp/ozg
$ echo $SHELL $USER $HOME
/bin/bash root /root
$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$ env | wc -l
16
$ printenv HOME
/root
```

`env` (yoki `printenv`) butun muhitni chiqaradi. Trenajorda unda 16 ta o'zgaruvchi bor.

| O'zgaruvchi | Ma'nosi |
| --- | --- |
| `HOME` | Uy papkangiz. Debian Reference'ga ko'ra ko'p dasturlar foydalanuvchi sozlamalarini shu yerda saqlaydi |
| `USER` | Foydalanuvchi nomi |
| `SHELL` | Kirish qobig'i (shell) |
| `PATH` | Buyruqlar qidiriladigan papkalar |
| `LANG` | Til va format (locale). Debian Reference faqat shu o'zgaruvchi bilan sozlashni tavsiya qiladi |
| `PWD` | Joriy papka |

## `PATH`: buyruq qayerdan topiladi

Debian Reference'ga ko'ra siz buyruq yozganingizda qobiq (shell) uni `PATH` dagi papkalardan, chapdan o'ngga qarab qidiradi. Papkalar `:` bilan ajratiladi. Ubuntu hujjatiga ko'ra `PATH` dan tashqaridagi dasturni ishga tushirish uchun uning to'liq yo'lini yozish kerak.

```text
$ mkdir -p ~/bin && printf '#!/bin/sh\necho salom skriptdan\n' > ~/bin/salom && chmod +x ~/bin/salom
$ salom
-bash: salom: command not found
$ PATH="$HOME/bin:$PATH"
$ salom
salom skriptdan
$ command -v salom
/root/bin/salom
```

`~/bin` ni `PATH` ning **boshiga** qo'shdik: shu papkadagi dastur tizimdagi bir xil nomli dasturdan oldin topiladi. Oxiriga qo'shilsa (`PATH="$PATH:$HOME/bin"`), tizimdagisi ustun bo'ladi. Bu o'zgarish faqat shu qobiqda (shell) yashaydi. Doimiy qilish uchun Debian Reference `~/.bashrc` ni ko'rsatadi (15-bob).

## O'zgaruvchi yaratish va o'chirish

```text
$ SALOM="Assalomu alaykum"
$ echo $SALOM
Assalomu alaykum
$ unset SALOM
$ echo "[$SALOM]"
[]
```

`=` atrofida **probel bo'lmasligi** kerak. Probel bo'lsa, qobiq (shell) `X` ni buyruq deb tushunadi:

```text
$ X = 5
-bash: X: command not found
$ X=5
$ echo $X
5
```

Ubuntu hujjatiga ko'ra o'zingiz yaratgan o'zgaruvchi nomlarini katta harf bilan yozish odat bo'lgan.

## `export`: bola jarayonlarga uzatish

Ubuntu hujjatiga ko'ra qobiqda (shell) yaratilgan o'zgaruvchi faqat shu qobiqda (shell) mavjud. Yangi jarayon (masalan, skript) uni ko'rmaydi, agar u export qilinmagan bo'lsa:

```text
$ SALOM="Assalomu alaykum"
$ bash -c 'echo "bola jarayonda: [$SALOM]"'
bola jarayonda: []
$ export SALOM
$ bash -c 'echo "bola jarayonda: [$SALOM]"'
bola jarayonda: [Assalomu alaykum]
```

`bash -c '...'` yangi qobiq (shell) jarayonini ishga tushiradi. Bu siz ishga tushiradigan har qanday dastur (Node.js, Python, PHP) uchun ham xuddi shunday ishlaydi.

Muhit faqat **pastga**, ya'ni otadan bolaga oqadi. Bola o'z nusxasini o'zgartirsa, ota o'zgarmaydi:

```text
$ export SALOM="Assalomu alaykum"
$ bash -c 'SALOM="Xayr"; echo "bolada: $SALOM"'; echo "otada: $SALOM"
bolada: Xayr
otada: Assalomu alaykum
```

Shuning uchun skriptda `export X=...` qilib, skript tugagach terminalda `X` ni kutish befoyda. Skriptni o'z qobig'ingizda (shell) bajarish uchun `source skript.sh` yoki `. skript.sh` ishlatiladi.

## Faqat bitta buyruq uchun

Bash qo'llanmasiga ko'ra buyruq oldida yozilgan `NOM=qiymat` faqat **shu buyruqning** muhitiga qo'shiladi. Debian Reference buni `LANG` misolida ko'rsatadi, biz esa vaqt zonasi (`TZ`) bilan ko'ramiz:

```text
$ date
Fri Nov  6 02:11:12 UTC 2026
$ TZ=Asia/Tashkent date
Fri Nov  6 07:11:12 +05 2026
$ echo "$TZ"

```

`date` Toshkent vaqtini ko'rsatdi, qobiqda (shell) esa `TZ` paydo bo'lmadi. Ilovani boshqa sozlama bilan bir marta sinab ko'rish uchun qulay: `PORT=3001 node server.js`.

## Maxsus o'zgaruvchilar

Ubuntu hujjatidagi eng foydali ikkitasi (ularni faqat o'qish mumkin):

```text
$ echo $$
167
$ ps -o pid,comm -p $$
  PID COMMAND
  167 bash
```

- `$$` — joriy qobiqning (shell) jarayon raqami (PID, 28-bob).
- `$?` — oxirgi buyruqning chiqish kodi (2-bob).

## Dasturchi uchun: `.env` fayli

Ko'p ilovalar sozlamani `.env` faylidan oladi. Uni qobiqqa (shell) yuklashda keng uchraydigan xato bor:

```text
$ printf 'DB_HOST=localhost\nDB_PORT=5432\n' > .env
$ cat .env
DB_HOST=localhost
DB_PORT=5432
$ . ./.env; bash -c 'echo "[$DB_HOST]"'
[]
$ set -a; . ./.env; set +a; bash -c 'echo "[$DB_HOST:$DB_PORT]"'
[localhost:5432]
$ declare -p DB_PORT
declare -x DB_PORT="5432"
```

- `. ./.env` faylni o'qidi, lekin o'zgaruvchilar **export qilinmadi**. Ilova ularni ko'rmaydi.
- Bash qo'llanmasiga ko'ra `set -a` yoqilganda yaratilgan yoki o'zgartirilgan har bir o'zgaruvchi avtomatik export qilinadi. `set +a` uni o'chiradi.
- `declare -p` o'zgaruvchining holatini ko'rsatadi: `-x` — export qilingan.

Serverda servis sifatida ishlaydigan ilovaga esa muhit systemd orqali beriladi (`Environment=`, `EnvironmentFile=`, 35-bob).

## Muhit qayerdan keladi

Debian Reference'ga ko'ra muhit o'zgaruvchilarining standart qiymatlari:

1. avval PAM tizimi tomonidan `/etc/environment` va `/etc/default/locale` dan o'rnatiladi;
2. keyin foydalanuvchining `~/.profile`, `~/.bash_profile` va `~/.bashrc` fayllari ularni o'zgartirishi mumkin (15-bob).

## Debian va Ubuntu

Bu bobdagi hamma narsani bash qiladi, shuning uchun ikkala tizimda bir xil. `PATH` ning standart qiymati esa farq qilishi mumkin. Masalan, Ubuntu hujjatidagi oddiy foydalanuvchida `/usr/games` va `/snap/bin` ham bor.

## Tipik xatolar

**1. `=` atrofida probel.**
`X = 5` — qobiq (shell) `X` ni buyruq deb qidiradi.
To'g'risi: `X=5`.

**2. Export qilmasdan ilovani ishga tushirish.**
`DB_HOST=localhost` qilindi, keyingi qatorda esa `node app.js` `undefined` ni ko'radi.
To'g'risi: `export DB_HOST=localhost` yoki `DB_HOST=localhost node app.js`.

**3. Skript ichidagi `export` terminalga ta'sir qiladi deb kutish.**
Bola jarayon otaning muhitini o'zgartira olmaydi.
To'g'risi: `source skript.sh`.

**4. `PATH` ni butunlay almashtirib yuborish.**
`PATH=~/bin` qilinsa, `ls` ham topilmay qoladi.
To'g'risi: `PATH="$HOME/bin:$PATH"`, ya'ni eskisini saqlab qo'shish.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=13-ozgaruvchilar)** "Ilovaga sozlama berish": o'zgaruvchini export qilasiz, `.env` ni yuklaysiz va `PATH` ga papka qo'shasiz.

Savollar:

1. `NOM=1` va `export NOM=1` farqi nima?
2. Nega skriptdagi `export` dan keyin terminalda o'zgaruvchi ko'rinmaydi?
3. `PORT=4000 npm start` dan keyin `echo $PORT` nima chiqaradi?
4. `PATH="$PATH:/opt/ilova/bin"` va `PATH="/opt/ilova/bin:$PATH"` farqi nima?

<details>
<summary>Javoblar</summary>

1. Birinchisini faqat shu qobiq (shell) ko'radi. Ikkinchisi muhitga qo'shiladi va har bir bola jarayonga uzatiladi.
2. Skript alohida (bola) jarayonda ishladi. Bola otaning muhitini o'zgartira olmaydi.
3. Hech narsa (agar `PORT` oldin o'rnatilmagan bo'lsa): qiymat faqat `npm` jarayoniga berildi.
4. Qidiruv tartibi: birinchisida tizimdagi bir xil nomli dastur ustun, ikkinchisida `/opt/ilova/bin` dagisi.

</details>

## Rasmiy hujjat

- [Ubuntu Server — The command line in depth: Shell environment variables](https://ubuntu.com/server/docs/tutorial/cli-in-depth/)
- [Bash Reference Manual — Environment](https://www.gnu.org/software/bash/manual/bash.html#Environment)
- [Bash Reference Manual — The Set Builtin (`-a`)](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin)
- [Bash Reference Manual — Special Parameters](https://www.gnu.org/software/bash/manual/bash.html#Special-Parameters)
- [Debian Reference 1.5.1–1.5.4](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_command_execution_and_environment_variable)
- [environ(7)](https://man7.org/linux/man-pages/man7/environ.7.html)

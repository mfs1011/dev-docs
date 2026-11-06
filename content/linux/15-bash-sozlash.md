# 15 — Bash'ni sozlash

[← Oldingi: Kengaytmalar va qo'shtirnoq](14-kengaytmalar.md) · [Mundarija](README.md) · [Keyingi: Matn muharriri →](16-matn-muharriri.md)

## Tushuncha

13-bobda `PATH` ga papka qo'shdik, lekin u terminal yopilishi bilan yo'qoladi. Doimiy sozlamalar, ya'ni `PATH`, alias'lar va tarix hajmi, bash ishga tushganda o'qiladigan **sozlama fayllariga** yoziladi.

Qiyin joyi shundaki, bash bu fayllarni **har doim ham o'qimaydi**. Qaysi biri o'qilishi bash qanday ishga tushganiga bog'liq. Bash qo'llanmasi ikki belgini ajratadi:

- **login qobiq (shell)** — tizimga kirganda ochiladi: SSH, konsol. Nomi `-bash` bo'ladi;
- **interaktiv qobiq (shell)** — klaviaturadan buyruq kutadigan qobiq (shell). Skript esa interaktiv emas.

<div data-animatsiya="bash-fayllar"></div>

## Siz qaysi qobiqdasiz (shell)?

```text
$ shopt -q login_shell && echo "login qobiq (shell)" || echo "login emas"
login qobiq (shell)
$ echo $0
-bash
$ bash -c 'shopt -q login_shell && echo login || echo "login emas"; [[ $- == *i* ]] && echo interaktiv || echo "interaktiv emas"'
login emas
interaktiv emas
```

- Trenajordagi terminal — login qobiq (shell). `$0` ning boshidagi `-` shuni bildiradi.
- `bash -c` esa na login, na interaktiv. Skriptlar ham xuddi shunday ishlaydi.

## Qaysi fayl qachon o'qiladi

Bash qo'llanmasidagi qoida:

| Qobiq (shell) | O'qiladigan fayllar |
| --- | --- |
| Interaktiv **login** (SSH, konsol) | `/etc/profile`, keyin `~/.bash_profile`, `~/.bash_login`, `~/.profile` dan **birinchi topilgani** |
| Interaktiv, login **emas** (`bash`, yangi terminal oynasi) | `~/.bashrc` |
| Interaktiv **emas** (skript, `bash -c`) | Hech qaysi (faqat `BASH_ENV` ko'rsatgan fayl) |

Debian ikkita narsani qo'shadi:

- Debian'ning `man bash` sahifasiga ko'ra interaktiv qobiq (shell) `~/.bashrc` dan oldin umumiy `/etc/bash.bashrc` ni ham o'qiydi. Login qobiqda (shell) uni `/etc/profile` chaqiradi.
- Foydalanuvchining `~/.profile` fayli `~/.bashrc` ni o'zi chaqiradi:

```text
$ cat ~/.profile
# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

mesg n 2> /dev/null || true
```

Bash qo'llanmasi ham buni tavsiya qiladi: login sozlamasi `~/.bashrc` ni chaqirsa, sozlamalarni bitta joyda saqlash mumkin.

Buni tekshiramiz. Ikkala faylga belgi qo'yib, uch xil bash ishga tushiramiz (keyin fayllarni tiklaymiz):

```text
$ cp ~/.bashrc /tmp/bashrc.bak && cp ~/.profile /tmp/profile.bak
$ echo 'echo ".bashrc o'"'"'qildi"' >> ~/.bashrc && echo 'echo ".profile o'"'"'qildi"' >> ~/.profile
$ bash -c 'echo skript'
skript
$ bash -i -c 'echo interaktiv'
.bashrc o'qildi
interaktiv
$ bash -l -c 'echo login'
.bashrc o'qildi
.profile o'qildi
login
$ cp /tmp/bashrc.bak ~/.bashrc && cp /tmp/profile.bak ~/.profile
```

- Skript hech narsani o'qimadi.
- Interaktiv qobiq (shell) — faqat `.bashrc` ni.
- Login qobiq (shell) `.profile` ni o'qidi, u esa `.bashrc` ni chaqirdi. Shuning uchun `.bashrc` ning belgisi birinchi chiqdi: biz belgini `.profile` ning oxiriga yozgan edik.

### Nimani qayerga yozish

| Nima | Qayerga | Nega |
| --- | --- | --- |
| Alias'lar, prompt, tarix sozlamalari | `~/.bashrc` | Har bir interaktiv qobiqda (shell) kerak |
| `PATH`, muhit o'zgaruvchilari | `~/.profile` | Bir marta, login'da o'rnatilsa, hamma bola jarayonlarga o'tadi (13-bob) |
| Hamma foydalanuvchi uchun | `/etc/profile.d/*.sh` | `/etc/profile` ularni o'qiydi. `/etc/profile` ning o'zini paket boshqaradi |
| Servis (systemd) uchun | Unit faylida `Environment=` | Servis qobiq (shell) fayllarini umuman o'qimaydi (35-bob) |

O'zgartirgandan keyin joriy qobiqqa (shell) qo'llash uchun faylni qayta o'qing: `source ~/.bashrc`.

## Alias

Debian Reference'ga ko'ra alias — tez-tez ishlatiladigan buyruqning qisqa nomi:

```text
$ alias ll='ls -lh'
$ ll /etc/hostname
-rw-r--r-- 1 root root 9 Nov  5 11:40 /etc/hostname
$ alias
alias ll='ls -lh'
$ type ll
ll is aliased to `ls -lh'
$ unalias ll
```

Alias faqat **interaktiv** qobiqda (shell) ishlaydi. Shuning uchun skriptda `ll` yozsangiz, "command not found" chiqadi. Skriptda funksiya ishlatiladi (50-bob).

## Tarix

```text
$ echo $HISTSIZE $HISTFILE
500 /root/.bash_history
$ history | tail -3
   18  unalias ll
   19  echo $HISTSIZE $HISTFILE
   20  history | tail -3
```

Bash buyruqlar tarixini xotirada saqlaydi va chiqishda `HISTFILE` ga yozadi. Foydali tugmalar 2-bobda: `↑`, `Ctrl+R`.

> **Xavfsizlik.** Buyruq ichida yozilgan parol yoki token (`mysql -pMaxfiy123`, `curl -H "Authorization: ..."`) `~/.bash_history` ga yozilib qoladi. Bunday buyruq oldiga probel qo'ying va `HISTCONTROL=ignorespace` bo'lsin. Undan ham yaxshisi, maxfiy ma'lumotni buyruq qatorida bermang.

## Debian va Ubuntu

Ubuntu'da root uchun tayyor `~/.bashrc` boyroq. Sinov VPS'ida undagi sozlamalar:

```text vps
$ grep -E "^(HIST|shopt|alias)" ~/.bashrc
HISTCONTROL=ignoredups:ignorespace
shopt -s histappend
HISTSIZE=1000
HISTFILESIZE=2000
shopt -s checkwinsize
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
```

- `HISTCONTROL=ignoredups:ignorespace` — ketma-ket takrorlangan va probel bilan boshlangan buyruqlar tarixga yozilmaydi.
- `histappend` — bir nechta SSH sessiya bir-birining tarixini o'chirib yubormaydi.

Debian trenajorida root'ning `~/.bashrc` fayli deyarli bo'sh, shuning uchun `ll` u yerda yo'q.

## Tipik xatolar

**1. `PATH` ni `~/.bashrc` ga yozib, servisda kutish.**
systemd servisi bash fayllarini o'qimaydi.
To'g'risi: unit'da `Environment=PATH=...` (35-bob).

**2. Alias'ni skriptda ishlatish.**
Skript interaktiv emas, alias'lar unda yo'q.
To'g'risi: to'liq buyruq yoki funksiya.

**3. `~/.bash_profile` yaratib, `~/.profile` ni "o'chirib qo'yish".**
Bash birinchi topilganini o'qiydi. Yangi `~/.bash_profile` bo'lsa, Debian'ning `~/.profile` i (va u chaqiradigan `~/.bashrc`) login'da o'qilmay qoladi.
To'g'risi: `~/.profile` ni tahrirlang. `~/.bash_profile` kerak bo'lsa, unda `. ~/.profile` ni chaqiring.

**4. O'zgarishdan keyin "ishlamayapti" deyish.**
Fayl faqat qobiq (shell) ishga tushganda o'qiladi.
To'g'risi: `source ~/.bashrc` yoki qayta kirish.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=15-bash-sozlash)** "Doimiy sozlamalar": alias va `PATH` ni to'g'ri faylga yozasiz va qaysi qobiq (shell) ularni ko'rishini tekshirasiz.

Savollar:

1. SSH bilan kirganingizda `~/.bashrc` qanday qilib o'qiladi?
2. Nega `~/.bashrc` dagi alias skriptda ishlamaydi?
3. `~/.bashrc` ni o'zgartirdingiz. Joriy terminalda kuchga kirishi uchun nima qilasiz?
4. Hamma foydalanuvchilar uchun `PATH` ga papka qo'shmoqchisiz. Qaysi faylga yozasiz?

<details>
<summary>Javoblar</summary>

1. Login qobiq (shell) `~/.profile` ni o'qiydi, Debian'dagi `~/.profile` esa `~/.bashrc` ni chaqiradi.
2. Skript interaktiv bo'lmagan qobiqda (shell) ishlaydi: u `~/.bashrc` ni o'qimaydi, alias'lar esa interaktiv qobiqda (shell) ishlaydi.
3. `source ~/.bashrc` (yoki `. ~/.bashrc`).
4. `/etc/profile.d/` ichidagi yangi `.sh` fayliga.

</details>

## Rasmiy hujjat

- [Bash Reference Manual — Bash Startup Files](https://www.gnu.org/software/bash/manual/bash.html#Bash-Startup-Files)
- [Bash Reference Manual — Aliases](https://www.gnu.org/software/bash/manual/bash.html#Aliases)
- [Bash Reference Manual — Bash History Facilities](https://www.gnu.org/software/bash/manual/bash.html#Bash-History-Facilities)
- [bash(1) — Debian 12 (FILES: /etc/bash.bashrc)](https://manpages.debian.org/bookworm/bash/bash.1.en.html)
- [Debian Reference 1.4.1–1.4.2 — The login shell, Customizing bash](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_login_shell)
- [Debian Reference 1.5.9 — Command alias](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_command_alias)

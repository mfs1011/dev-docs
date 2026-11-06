# 16 — Matn muharriri

[← Oldingi: Bash'ni sozlash](15-bash-sozlash.md) · [Mundarija](README.md)

## Tushuncha

Serverda VS Code yo'q, sozlama fayllarini esa tahrirlash kerak: nginx konfiguratsiyasi, `.env`, systemd unit, crontab. Buning uchun terminal ichida ishlaydigan matn muharriri kerak.

Debian va Ubuntu'da ikkitasi deyarli doim bor:

| | **nano** | **vim** (vi) |
| --- | --- | --- |
| Boshlash | Darhol yozasiz | Avval rejimlarni tushunish kerak |
| Tugmalar | Ekranning pastida ko'rinib turadi | Yodda tutiladi |
| Qayerda bor | Debian va Ubuntu'da standart muharrir | Debian Reference'ga ko'ra vi har qanday Linux/Unix tizimida bor |
| Kimga | Vaqti-vaqti bilan sozlama tahrirlaydiganlarga | Serverda ko'p ishlaydiganlarga |

Debian Reference vim yoki Emacs'dan birini yaxshi o'rganishni maslahat beradi va o'zi vim'ni tanlaydi: vi Linux/Unix dunyosida hamma joyda bor. Bu qo'llanmada ikkalasining eng kerakli qismi bor. nano'dan boshlash mumkin, lekin vim'dan qanday chiqishni bilish shart: ba'zi buyruqlar (`git commit`, `crontab -e`) muharrirni o'zi ochadi.

## nano

```text
$ nano --version | head -1
 GNU nano, version 7.2
```

`nano fayl.txt` faylni ochadi. Matnni darhol yozasiz. Tugmalar ekranning pastida turadi, `^` — Ctrl tugmasi. nano'ning rasmiy qisqa yo'riqnomasidan eng kerakli tugmalar:

| Tugma | Nima qiladi |
| --- | --- |
| `Ctrl+O` | Saqlash (fayl nomini so'raydi, `Enter`) |
| `Ctrl+X` | Chiqish. O'zgarish saqlanmagan bo'lsa, so'raydi |
| `Ctrl+K` | Joriy qatorni kesish |
| `Ctrl+U` | Kesilganni qo'yish |
| `Alt+U` | Oxirgi amalni bekor qilish (undo) |
| `Ctrl+A` / `Ctrl+E` | Qator boshiga / oxiriga |
| `Alt+G` | Berilgan qatorga o'tish |

> **Trenajorda.** nano'da qidiruv `Ctrl+W`, lekin brauzer bu tugmani yorliqni yopish uchun ushlab oladi (2-bob). Trenajorda nano'da qidiruvni ishlatmang.

## vim

vim **rejimli** muharrir. Uning eng chalkash joyi ham shu: oddiy (NORMAL) rejimda bosilgan harf matnga yozilmaydi, u buyruq bo'lib bajariladi.

<div data-animatsiya="vim"></div>

Debian Reference'dagi asosiy tugmalar:

| Rejim | Tugma | Nima qiladi |
| --- | --- | --- |
| NORMAL | `i` | Yozish (INSERT) rejimiga o'tish |
| har qanday | `Esc` | NORMAL rejimga qaytish |
| NORMAL | `:w` | Saqlash |
| NORMAL | `:q` | Chiqish |
| NORMAL | `:q!` | **Saqlamasdan** chiqish |
| NORMAL | `:wq` | Saqlab chiqish |
| NORMAL | `:help` | Yordam |

**vim'da "qotib qoldim" degan holat:** avval `Esc`, keyin `:q!` va `Enter`. Bu har doim ishlaydi.

Debian Reference vim'ni o'rganish uchun uning ichki darsligini tavsiya qiladi: `vim` ni ochib, `F1` ni bosing. Trenajordagi `vim.tiny` qisqartirilgan versiya: unda faqat qisqa `help.txt` (37 qator) bor. To'liq yordam bilan vim kerak bo'lsa, VPS'da `vim` paketini o'rnating (`apt install vim`, 24-bob).

```text
$ vim.tiny --version | head -1
VIM - Vi IMproved 9.0 (2022 Jun 28, compiled Feb 16 2025 05:23:41)
```

## Standart muharrirni tanlash

`crontab -e`, `visudo`, `systemctl edit` kabi buyruqlar muharrirni o'zi ochadi. Debian Reference'ga ko'ra:

- Debian tizimdagi standart muharrirni `/usr/bin/editor` buyrug'i orqali beradi va uni `update-alternatives` boshqaradi;
- ko'p dasturlar `$EDITOR` yoki `$VISUAL` o'zgaruvchisiga qaraydi.

```text
$ update-alternatives --display editor | head -6
editor - auto mode
  link best version is /bin/nano
  link currently points to /bin/nano
  link editor is /usr/bin/editor
  slave editor.1.gz is /usr/share/man/man1/editor.1.gz
  slave editor.da.1.gz is /usr/share/man/da/man1/editor.1.gz
$ ls -l /usr/bin/editor /etc/alternatives/editor
lrwxrwxrwx 1 root root  9 May  6  2024 /etc/alternatives/editor -> /bin/nano
lrwxrwxrwx 1 root root 24 May  6  2024 /usr/bin/editor -> /etc/alternatives/editor
$ echo "[$EDITOR] [$VISUAL]"
[] []
```

Trenajorda standart muharrir nano. `/usr/bin/editor` ikki pog'onali symlink (6-bob) orqali unga olib boradi. O'zgartirishning ikki yo'li bor:

| Yo'l | Buyruq | Ta'sir doirasi |
| --- | --- | --- |
| Butun tizim uchun | `update-alternatives --config editor` (root) | Hamma foydalanuvchi, `/usr/bin/editor` |
| Faqat o'zingiz uchun | `export EDITOR=vim.tiny` ni `~/.profile` ga yozish (15-bob) | Faqat siz. `$EDITOR` ga qaraydigan dasturlar uchun |

`update-alternatives --config` raqamli menyu ochadi va javob kutadi. Uni trenajor terminalida o'zingiz bajarib ko'ring.

## Debian va Ubuntu

| | Trenajor (Debian 12) | VPS (Ubuntu 26.04) |
| --- | --- | --- |
| nano | 7.2 | 8.7.1 |
| vim | `vim.tiny` 9.0 | `vim.tiny` (`vi` uning nomi) |
| Standart muharrir | nano | nano |

```text vps
$ nano --version | head -1
 GNU nano, version 8.7.1
$ command -v vim vi vim.tiny || echo "vim yoq"
/usr/bin/vi
/usr/bin/vim.tiny
```

VPS'da to'liq `vim` yo'q, lekin `vi` bor. Shuning uchun vim'ning asosiy tugmalarini bilish foydali.

## Tipik xatolar

**1. vim'da harf bosib, matn o'rniga "g'alati narsalar" bo'lishi.**
NORMAL rejimda harflar buyruq bo'lib bajariladi.
To'g'risi: `Esc` bosing va saqlamasdan chiqing (`:q!`). Yozish uchun avval `i`.

**2. vim'dan chiqa olmaslik.**
To'g'risi: `Esc`, `:q!`, `Enter`.

**3. Sozlama faylini zaxirasiz tahrirlash.**
Bitta xato nginx yoki sshd'ni ishga tushirmay qo'yadi.
To'g'risi: avval `cp -a fayl fayl.bak` (5-bob), tahrirdan keyin sintaksisni tekshiring (`nginx -t`, `sshd -t`, `visudo -c`).

**4. Root bo'lmasdan root faylini tahrirlash.**
Saqlashda "Permission denied" chiqadi.
To'g'risi: `sudoedit fayl` yoki `sudo nano fayl` (23-bob).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=16-muharrir)** "Sozlama faylini tahrirlash": nano va vim bilan fayl yaratasiz, o'zgartirasiz va saqlaysiz.

Savollar:

1. nano'da faylni saqlab chiqish uchun qaysi tugmalar kerak?
2. vim'da INSERT rejimidan qanday chiqiladi?
3. vim'da o'zgarishlarni saqlamasdan qanday chiqiladi?
4. `crontab -e` qaysi muharrirni ochishini nima belgilaydi?

<details>
<summary>Javoblar</summary>

1. `Ctrl+O`, `Enter`, keyin `Ctrl+X`.
2. `Esc`.
3. `Esc`, `:q!`, `Enter`.
4. `$VISUAL` yoki `$EDITOR` o'zgaruvchisi. Ular bo'lmasa, Debian'da `/usr/bin/editor` (`update-alternatives`).

</details>

## Rasmiy hujjat

- [Debian Reference 1.4.6 — The text editor](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_text_editor)
- [Debian Reference 1.4.7 — Setting a default text editor](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_setting_a_default_text_editor)
- [Debian Reference 1.4.8 — Using vim](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_using_vim)
- [GNU nano — Cheatsheet](https://www.nano-editor.org/dist/latest/cheatsheet.html)
- [nano(1)](https://manpages.debian.org/bookworm/nano/nano.1.en.html) · [update-alternatives(1)](https://manpages.debian.org/bookworm/dpkg/update-alternatives.1.en.html)

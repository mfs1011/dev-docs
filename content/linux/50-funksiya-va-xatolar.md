# 50 — Funksiya va xatolar

[← Oldingi: Shart va sikl](49-shart-va-sikl.md) · [Mundarija](README.md) · [Keyingi: Amaliy: zaxira skripti →](51-zaxira-skripti.md)

## Tushuncha

Skript kattalashgani sari ikki muammo chiqadi: bir xil kod qayta-qayta yoziladi va xato bo'lganda ortda "axlat" (vaqtinchalik fayllar) qoladi. Bu bobda ikkalasining yechimi:

| Vosita | Nima qiladi |
| --- | --- |
| Funksiya | Buyruqlar guruhiga nom beradi; uni oddiy buyruqdek chaqirish mumkin |
| `local` | O'zgaruvchini faqat funksiya ichida ko'rinadigan qiladi |
| `return` / `exit` | Funksiyadan / butun skriptdan chiqish kodi bilan chiqish |
| Chiqish kodi | Buyruq qanday tugaganini bildiradigan son (0–255) |
| `trap` | Skript tugaganda yoki signal kelganda bajariladigan buyruq |
| `shellcheck` | Skriptdagi tipik xatolarni ishga tushirmasdan topadi |

## Funksiya

Bash qo'llanmasi: funksiya — buyruqlar guruhiga bitta nom berish usuli; u oddiy buyruqdek chaqiriladi. E'lon qilish:

```text sxema
nom() {
  buyruqlar
}
```

`function nom { … }` shakli ham bor, lekin u bashism (48-bob) — dash'da ishlamaydi.

```text
$ mkdir funk && cd funk
$ cat > salom.sh <<'EOF'
> #!/bin/sh
> salom() {
>   echo "Salom, $1! (argumentlar: $#, \$0: $0)"
> }
> salom Aziz
> salom Ali Vali
> echo "skript argumentlari: $#"
> EOF
$ chmod +x salom.sh
$ ./salom.sh x y z
Salom, Aziz! (argumentlar: 1, $0: ./salom.sh)
Salom, Ali! (argumentlar: 2, $0: ./salom.sh)
skript argumentlari: 3
```

Bash qo'llanmasi:

- funksiya ichida uning argumentlari pozitsion parametrlar bo'ladi: `$1`, `$#` — funksiyaniki, skriptniki emas;
- `$0` o'zgarmaydi — skript nomi;
- funksiya tugagach skriptning `$1`, `$#` lari qaytadi (`skript argumentlari: 3`);
- funksiya **joriy qobiqda** bajariladi — yangi jarayon ochilmaydi (skriptni ishga tushirishdan farqi shu).

Qavslar `{` va `}` — qobiqning zaxiralangan so'zlari: ular atrofida bo'sh joy, `}` dan oldin esa `;` yoki yangi qator bo'lishi shart.

## local: funksiyaning o'z o'zgaruvchisi

Bash qo'llanmasi: odatda o'zgaruvchilar funksiya va uni chaqirgan kod o'rtasida **umumiy**. Funksiya ichida o'zgartirilgan qiymat tashqarida ham o'zgaradi:

```text
$ ism=global; f() { ism=ichki; }; f; echo "$ism"
ichki
$ ism=global; g() { local ism=ichki; echo "ichida: $ism"; }; g; echo "tashqarida: $ism"
ichida: ichki
tashqarida: global
```

`local` bilan e'lon qilingan o'zgaruvchi funksiya ichida tashqi o'zgaruvchini "yopib turadi", funksiya tugagach tashqi qiymat qaytadi. `local` POSIX standartida yo'q, lekin dash'da bor (dash(1): "Local is implemented as a builtin command"):

```text
$ sh -c 'x=1; f() { local x=2; echo "ichida $x"; }; f; echo "tashqarida $x"'
ichida 2
tashqarida 1
```

Qoida: funksiya ichidagi yordamchi o'zgaruvchilar — `local`.

## return va chiqish kodi

Bash qo'llanmasi: funksiyaning chiqish kodi — undagi oxirgi buyruqning kodi. `return N` funksiyani darhol tugatadi va `N` ni qaytaradi. `exit N` esa **butun skriptni** tugatadi.

```text
$ bormi() { [ -e "$1" ] || return 3; echo "bor: $1"; }
$ bormi /etc/hosts; echo "kod: $?"
bor: /etc/hosts
kod: 0
$ bormi /yoq; echo "kod: $?"
kod: 3
$ if bormi /etc/passwd; then echo "davom etamiz"; fi
bor: /etc/passwd
davom etamiz
```

Funksiya kod qaytargani uchun uni `if` da shart sifatida ishlatish mumkin (49-bob).

### Kodlarning ma'nosi

Bash qo'llanmasi (Exit Status): kod 0 dan 255 gacha; `0` — muvaffaqiyat, boshqasi — xato. Qobiqning o'zi qo'yadigan maxsus kodlar:

| Kod | Qachon |
| --- | --- |
| `2` | Ichki (builtin) buyruq noto'g'ri ishlatilgan: noma'lum parametr, argument yetishmaydi |
| `126` | Buyruq topildi, lekin bajarib bo'lmaydi |
| `127` | Buyruq topilmadi |
| `128+N` | Buyruq `N` raqamli signal bilan to'xtatildi |

```text
$ yoqbuyruq; echo "kod: $?"
-bash: yoqbuyruq: command not found
kod: 127
$ printf 'echo hi\n' > x.sh; ./x.sh; echo "kod: $?"
-bash: ./x.sh: Permission denied
kod: 126
$ sleep 30 & kill $!; wait $!; echo "kod: $?"
[1] 183
[1]+  Terminated              sleep 30
kod: 143
$ kill -l 15
TERM
```

`143` = 128 + 15, 15 — `TERM` signali (29-bob).

O'z skriptingizda: muvaffaqiyat — `exit 0` (yoki oxirgi buyruq muvaffaqiyatli bo'lsa, hech narsa), xato — `exit 1` yoki boshqa kichik son, xato xabari esa standart xato oqimiga: `echo "xato: …" >&2` (49-bobdagi `xizmat.sh`). Shunda skriptni chaqirgan kod (`if`, `&&`, `set -e`, systemd) natijani to'g'ri tushunadi.

## trap: tugaganda tozalash

Skript ko'pincha vaqtinchalik fayl yaratadi. `mktemp(1)` — xavfsiz nom bilan vaqtinchalik fayl yaratib, nomini chiqaradi (standart holatda `/tmp/tmp.XXXXXXXXXX`). Uni o'chirishni unutish yoki skript yarim yo'lda yiqilib, faylni qoldirish oson.

Bash qo'llanmasi (`trap`): `trap 'buyruq' SIGNAL` — qobiq signalni olganda buyruq bajariladi. Maxsus nom `EXIT` (yoki `0`) — **qobiq chiqayotganda**, qanday sabab bilan chiqishidan qat'i nazar:

```text
$ cat > vaqtincha.sh <<'EOF'
> #!/bin/sh
> set -e
> t=$(mktemp)
> trap 'rm -f "$t"; echo "tozalandi"' EXIT
> echo "ma'lumot" > "$t"
> echo "vaqtinchalik fayl: $(wc -l < "$t") qator"
> cp "$t" /yoq/papka/
> echo "bu qator chiqmaydi"
> EOF
$ chmod +x vaqtincha.sh
$ ./vaqtincha.sh; echo "kod: $?"
vaqtinchalik fayl: 1 qator
cp: cannot create regular file '/yoq/papka/': No such file or directory
tozalandi
kod: 1
$ ls /tmp/tmp.*
ls: cannot access '/tmp/tmp.*': No such file or directory
```

<div data-animatsiya="qadamli" data-nom="trap"></div>

`cp` yiqildi, `set -e` skriptni to'xtatdi (48-bob), lekin chiqishdan oldin `EXIT` trap'i faylni o'chirdi. Chiqish kodi — `cp` niki (`1`), trap uni o'zgartirmadi.

Trap'dagi buyruq bitta qo'shtirnoqda: `$t` trap **e'lon qilinganda** emas, **bajarilganda** ochiladi.

### Signal kelganda

Skriptni `kill` (29-bob) yoki systemd to'xtatsa-chi? Trenajorda sinadik:

```text
$ sh -c 'trap "echo tozalash" EXIT; sleep 20' & sleep 2; kill $!; wait $!; echo "kod: $?"
[1] 192
[1]+  Terminated              sh -c 'trap "echo tozalash" EXIT; sleep 20'
kod: 143
$ bash -c 'trap "echo tozalash" EXIT; sleep 20' & sleep 2; kill $!; wait $!; echo "kod: $?"
[1] 195
tozalash
[1]+  Terminated              bash -c 'trap "echo tozalash" EXIT; sleep 20'
kod: 143
$ sh -c 'trap "echo tozalash" EXIT; trap "exit 143" TERM; sleep 20 & wait' & sleep 2; kill $!; wait $!; echo "kod: $?"
[1] 198
tozalash
[1]+  Exit 143                sh -c 'trap "echo tozalash" EXIT; trap "exit 143" TERM; sleep 20 & wait'
kod: 143
```

Kuzatildi (rasmiy hujjatda bu farqning tavsifini topmadik): `TERM` signali kelganda dash `EXIT` trap'ini bajarmadi, bash esa bajardi. dash'da ham tozalash ishlashi uchun `TERM` ga alohida trap qo'yildi: `trap 'exit 143' TERM` — signal kelganda qobiq oddiy `exit` qiladi, `exit` esa `EXIT` trap'ini ishga tushiradi. Uchinchi misolda `sleep` fonda (`&`) ishga tushirilib, `wait` bilan kutiladi. Bash qo'llanmasi (Signals): qobiq oddiy buyruq tugashini kutayotganda trap shu buyruq tugagandan keyingina bajariladi; `wait` bilan kutayotganda esa signal kelishi bilan `wait` darhol qaytadi va trap bajariladi.

### ERR (bash)

bash'da yana bir maxsus nom bor: `ERR` — buyruq noldan farqli kod bilan tugaganda (`set -e` ishlamaydigan joylar bundan ham mustasno, 48-bob). Xato qayerda bo'lganini ko'rsatish uchun qulay:

```text
$ bash -c 'trap "echo \"xato: \$LINENO-qatorda\" >&2" ERR; true; false; echo davom'
xato: 1-qatorda
davom
```

## shellcheck: xatolarni oldindan topish

Debian Reference (12.4) statik tahlil vositalari ro'yxatida skriptlar uchun `shellcheck` ni beradi: u skriptni **ishga tushirmasdan** o'qib, tipik xatolarni topadi. Trenajorda u o'rnatilmagan va internet yo'q, shuning uchun VPS'ga o'rnatdik (`apt install shellcheck`, 24-bob) va 48–49-boblardagi xatolar bilan to'la skriptni tekshirdik:

```text vps
$ cat tekshir.sh
#!/bin/sh
papka=$1
for f in $(ls $papka/*.log); do
  if [ $f == "eski.log" ]; then
    echo "topildi: $f"
  fi
done
cd /srv/ilova
rm -rf eski
$ shellcheck tekshir.sh; echo "kod: $?"

In tekshir.sh line 3:
for f in $(ls $papka/*.log); do
         ^----------------^ SC2045 (error): Iterating over ls output is fragile. Use globs.
              ^----^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
for f in $(ls "$papka"/*.log); do


In tekshir.sh line 4:
  if [ $f == "eski.log" ]; then
       ^-- SC2086 (info): Double quote to prevent globbing and word splitting.
          ^-- SC3014 (warning): In POSIX sh, == in place of = is undefined.

Did you mean:
  if [ "$f" == "eski.log" ]; then


In tekshir.sh line 8:
cd /srv/ilova
^-----------^ SC2164 (warning): Use 'cd ... || exit' or 'cd ... || return' in case cd fails.

Did you mean:
cd /srv/ilova || exit

For more information:
  https://www.shellcheck.net/wiki/SC2045 -- Iterating over ls output is fragi...
  https://www.shellcheck.net/wiki/SC2164 -- Use 'cd ... || exit' or 'cd ... |...
  https://www.shellcheck.net/wiki/SC3014 -- In POSIX sh, == in place of = is ...
kod: 1
```

shellcheck(1) chiqish kodlari: `0` — muammo yo'q, `1` — muammolar topildi, `2` — ba'zi fayllarni o'qib bo'lmadi, `3` — noto'g'ri parametr. Shuning uchun uni avtomatik tekshiruvlarda (masalan, kodni saqlashdan oldin) ishlatish mumkin. Har xato kodining (`SC2045` va h.k.) batafsil izohi — chiqishdagi havolada.

Tozalash:

```text
$ cd .. && rm -rf funk
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `shellcheck` | o'rnatilmagan (paket: `shellcheck`) | 0.11.0, shu bob uchun o'rnatildi |
| `local` dash'da | bor | bor |

Funksiyalar, `return`, chiqish kodlari va `trap` ikkala tizimda bir xil ishlaydi: ikkalasida ham bash va dash (48-bob).

## Tipik xatolar

**1. Funksiyada `local` siz o'zgaruvchi.**
Tashqaridagi shu nomli o'zgaruvchi buziladi.
To'g'risi: `local nom=…`.

**2. Funksiyadan `exit` bilan chiqish.**
Butun skript tugaydi.
To'g'risi: funksiyadan — `return`.

**3. Xato xabarini standart chiqishga yozish va `exit 0`.**
Chaqiruvchi xatoni sezmaydi.
To'g'risi: `echo "…" >&2; exit 1`.

**4. Vaqtinchalik faylni skript oxirida o'chirish.**
Skript yarim yo'lda yiqilsa, fayl qoladi.
To'g'risi: yaratgandan keyin darhol `trap 'rm -f "$t"' EXIT`.

**5. dash skriptida faqat `trap … EXIT`.**
`kill` bilan to'xtatilganda tozalash ishlamadi.
To'g'risi: `trap 'exit 143' TERM` ni ham qo'shish (yoki bash).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=50-funksiya)** "Funksiya va trap": `local` siz va `local` bilan funksiyani solishtirasiz, kod qaytaradigan funksiya yozasiz va `trap` vaqtinchalik faylni o'chirishini tekshirasiz.

Savollar:

1. Funksiya ichida `$0` va `$1` nimani bildiradi?
2. `return 3` va `exit 3` ning farqi nima?
3. `127` va `126` kodlari nimani bildiradi?
4. Skript `137` kod bilan tugadi. Nima bo'lgan?
5. `trap 'rm -f "$t"' EXIT` qachon bajariladi?

<details>
<summary>Javoblar</summary>

1. `$0` — skript nomi (o'zgarmaydi), `$1` — funksiyaning birinchi argumenti.
2. `return` — faqat funksiyadan chiqadi, `exit` — butun skriptdan.
3. 127 — buyruq topilmadi, 126 — topildi, lekin bajarib bo'lmaydi.
4. 137 = 128 + 9: `KILL` signali bilan o'ldirilgan.
5. Qobiq chiqayotganda: oxirigacha ishlaganda, `exit` da, `set -e` to'xtatganda. dash'da signal bilan to'xtatilganda — faqat signalga ham trap qo'yilgan bo'lsa.

</details>

## Rasmiy hujjat

- [GNU Bash: Shell Functions](https://www.gnu.org/software/bash/manual/bash.html#Shell-Functions) — funksiya, argumentlar, `return`, `local`
- [GNU Bash: Exit Status](https://www.gnu.org/software/bash/manual/bash.html#Exit-Status) — 126, 127, 128+N
- [GNU Bash: Bourne Shell Builtins (trap)](https://www.gnu.org/software/bash/manual/bash.html#Bourne-Shell-Builtins) — `trap`, `EXIT`, `ERR`
- [GNU Bash: Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals) — trap va kutish
- [Debian Reference 12.4](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_static_code_analysis_tools) — `shellcheck`
- [mktemp(1)](https://manpages.debian.org/bookworm/coreutils/mktemp.1.en.html) · [dash(1)](https://manpages.debian.org/bookworm/dash/dash.1.en.html) — `local`
- [shellcheck(1)](https://manpages.ubuntu.com/manpages/resolute/man1/shellcheck.1.html) — chiqish kodlari

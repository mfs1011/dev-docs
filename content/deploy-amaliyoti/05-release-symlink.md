# 05 — Release papkalari va symlink

[Mundarija](README.md)

## Tushuncha

Eng oddiy deploy — yangi fayllarni eskisining **ustiga** yozish. Kamchiligi: nusxalash davomida papkada eski va yangi fayllar aralash turadi; muammo chiqsa, qaytadigan eski versiya ham qolmaydi.

Shuning uchun har versiya (**release**) alohida papkaga joylanadi, ilova esa doim **`current`** nomli **ramziy havola** (symlink — boshqa yo'lga ishora qiluvchi maxsus fayl) orqali ishlaydi:

```text
/srv/ilova/
├── releases/
│   ├── 20261105-1000/
│   ├── 20261107-1630/
│   └── 20261109-0110/     ← yangi
└── current -> releases/20261109-0110
```

Yangi versiyaga o'tish — faqat `current` ni boshqa papkaga yo'naltirish. Orqaga qaytish — uni oldingisiga qaytarish (20-bob).

### Atomik almashtirish

Muhim savol: `current` almashtirilayotgan **lahzada** ilova uni o'qisa, nima bo'ladi?

MAN (rename(2)): agar `newpath` allaqachon mavjud bo'lsa, u **atomik** almashtiriladi — boshqa jarayon `newpath` ga murojaat qilganda uni **topa olmaydigan payt bo'lmaydi**. `oldpath` symlink bo'lsa, havolaning o'zi qayta nomlanadi; `newpath` symlink bo'lsa, ustidan yoziladi.

Demak, to'g'ri usul — yangi havolani **vaqtinchalik nom** bilan yaratish va uni `rename` bilan `current` o'rniga qo'yish:

```bash
ln -s releases/20261109-0110 current.tmp
mv -T current.tmp current
```

GNU (mv invocation): `mv` odatda faylni shunchaki qayta nomlaydi (bir fayl tizimi ichida). **`-T`** (`--no-target-directory`) — oxirgi argument papka yoki **papkaga ishora qiluvchi symlink** bo'lsa ham, uni maxsus ko'rmaslik. `-T` siz `mv current.tmp current` — `current` papkaga ishora qilgani uchun `current.tmp` ni **o'sha papka ichiga** ko'chiradi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### Vositalar

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q strace 2>&1 | grep -E '^Setting up strace'; ls -l /usr/bin/mv | awk '{print $(NF-2), $(NF-1), $NF}'; dpkg -S /usr/bin/gnumv; dpkg-divert --list | grep -w mv
Setting up strace (6.19+ds-0ubuntu5) ...
/usr/bin/mv -> gnumv
gnu-coreutils: /usr/bin/gnumv
```

Kuzatildi: Ubuntu 26.04 da `mv` — GNU coreutils'dan (`gnumv`, `gnu-coreutils` paketi), `ln` esa — `/usr/lib/cargo/bin/coreutils/` dagi Rust'da yozilgan coreutils. Tizim chaqiruvlarini (system call — dasturning yadroga murojaati) ko'rish uchun `strace` o'rnatildi.

### `ln -sfn` — ikki qadam

```text vps
$ mkdir -p /srv/ilova/releases/1 /srv/ilova/releases/2; echo "v1" > /srv/ilova/releases/1/versiya.txt; echo "v2" > /srv/ilova/releases/2/versiya.txt; cd /srv/ilova && ln -s releases/1 current; strace -e trace=symlink,symlinkat,unlink,unlinkat,rename,renameat,renameat2 ln -sfn releases/2 current 2>&1 | grep -v '^+++'; cat current/versiya.txt
unlink("current")                       = 0
symlink("releases/2", "current")        = 0
v2
```

`ln -sfn` havolani **almashtirmaydi**: avval eskisini o'chiradi (`unlink`), keyin yangisini yaratadi (`symlink`). Ikkisi orasida `current` **mavjud emas**.

### `mv -T` — bitta `rename`

```text vps
$ cd /srv/ilova && ln -s releases/1 current.tmp && strace -e trace=rename,renameat,renameat2 mv -T current.tmp current 2>&1 | grep -v '^+++'; cat current/versiya.txt; ls
renameat2(AT_FDCWD, "current.tmp", AT_FDCWD, "current", RENAME_NOREPLACE) = -1 EEXIST (File exists)
renameat(AT_FDCWD, "current.tmp", AT_FDCWD, "current") = 0
v1
current
releases
```

`mv -T` — bitta `renameat`: `current` darhol yangi havolaga almashdi, `current.tmp` qolmadi. (Birinchi urinish — `RENAME_NOREPLACE` — mavjud nomni almashtirmaydi va `EEXIST` qaytaradi; shundan keyin `mv` oddiy `renameat` ni chaqiradi.)

### O'lchaymiz: 10 soniya, uzluksiz o'qish

Kichik Python skripti 10 soniya davomida `current/versiya.txt` ni to'xtovsiz o'qiydi va xatolarni sanaydi. Shu paytda `current` `releases/1` va `releases/2` orasida qayta-qayta almashtiriladi.

```python
# current/versiya.txt ni N soniya davomida uzluksiz o'qiydi, xatolarni sanaydi
import sys, time
yol, sek = sys.argv[1], float(sys.argv[2])
ok = xato = 0; oxir = time.time() + sek
while time.time() < oxir:
    try:
        with open(yol) as f: f.read(); ok += 1
    except OSError: xato += 1
print(f"o'qildi: {ok}, xato: {xato}")
```

```bash
#!/bin/bash
# almash.sh USUL SONIYA — current ni 1 va 2 orasida almashtiradi
cd /srv/ilova; oxir=$((SECONDS+$2)); n=0
while [ $SECONDS -lt $oxir ]; do
  for r in 1 2; do
    if [ "$1" = ln ]; then ln -sfn releases/$r current
    else ln -sfn releases/$r current.tmp && mv -T current.tmp current; fi
    n=$((n+1))
  done
done
echo "almashtirishlar: $n"
```

`ln -sfn` bilan:

```text vps
$ cd /srv/ilova && (python3 /root/oqi.py current/versiya.txt 10 &) ; bash /root/almash.sh ln 10; sleep 1
almashtirishlar: 880
o'qildi: 297179, xato: 5717
```

`ln` + `mv -T` bilan:

```text vps
$ cd /srv/ilova && (python3 /root/oqi.py current/versiya.txt 10 &) ; bash /root/almash.sh mv 10; sleep 1
almashtirishlar: 652
o'qildi: 301838, xato: 0
```

`ln -sfn` — 880 almashtirishda **5717** o'qish xato bilan tugadi (fayl topilmadi). `mv -T` — **0** xato. Ilova so'rovni shunday paytda o'qisa — xato javob qaytaradi.

### `-T` siz `mv` tuzog'i

```text vps
$ cd /srv/ilova && ln -s releases/2 current.tmp && mv current.tmp current; ls -l current | awk '{print $(NF-2), $(NF-1), $NF}'; ls releases/1/; rm releases/1/current.tmp
current -> releases/1
current.tmp
versiya.txt
```

`current` o'zgarmadi (`releases/1`), `current.tmp` esa `releases/1/` **ichiga** ko'chib ketdi — chunki `current` papkaga ishora qiladi.

### Eski release'larni tozalash

Nomlari vaqt tamg'asi bo'lsa (`YYYYMMDD-HHMM`), oddiy saralash — vaqt bo'yicha. Oxirgi 3 tasidan boshqasini o'chirish:

```text vps
$ cd /srv/ilova/releases && rm -rf 1 2 && for t in 20261101-0900 20261103-1400 20261105-1000 20261107-1630 20261109-0110; do mkdir $t; done; ls -1; ls -1 | head -n -3; ls -1 | head -n -3 | xargs -r rm -rf; ls -1
20261101-0900
20261103-1400
20261105-1000
20261107-1630
20261109-0110
20261101-0900
20261103-1400
20261105-1000
20261107-1630
20261109-0110
```

`ls -1 | head -n -3` — oxirgi 3 tadan oldingilar (eng eski 2 ta); ular o'chirildi, 3 tasi qoldi. `current` ishora qilayotgan release o'chirilmasligi kerak — u doim eng yangilar orasida bo'lishi uchun yangi release'ga o'tgandan **keyin** tozalanadi.

## Variantlar

| Usul | Atomik | Izoh |
| --- | --- | --- |
| Fayllarni ustidan yozish | Yo'q | Aralash holat, qaytish yo'q |
| `ln -sfn` | Yo'q | `unlink` + `symlink` (sinovda xato) |
| `ln -s … tmp` + `mv -T tmp current` | Ha | `rename(2)` |
| `mv -T --exchange d1 d2` (GNU) | Ha, fayl tizimi qo'llasa | Ikki nomni o'zaro almashtirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `ln -sfn` bilan almashtirish | Oraliqda `current` yo'q (sinovda 5717 xato) | `ln -s` + `mv -T` |
| `mv` ni `-T` siz | Havola papka ichiga ko'chadi (sinovda) | `mv -T` |
| Vaqtinchalik havola boshqa fayl tizimida | `mv` nusxalashga o'tadi — atomik emas (GNU) | `current` yonida yaratish |
| Release nomi tasodifiy | Saralab bo'lmaydi | Vaqt tamg'asi |
| Tozalashda `current` ni o'chirish | Ilova ishlamay qoladi | Yangisiga o'tgach, oxirgi bir nechtasini qoldirish |
| Barcha eski release'larni o'chirish | Qaytish yo'q (20-bob) | 3–5 tasini saqlash |

## Amaliyot

1. Nega yangi fayllarni eskisining ustiga yozish yomon?
2. `rename(2)` mavjud `newpath` haqida nima kafolat beradi?
3. `ln -sfn` nega atomik emas?
4. `mv -T` dagi `-T` nima qiladi?
5. Sinovda `ln -sfn` va `mv -T` natijalari qanday bo'ldi?

<details>
<summary>Javoblar</summary>

1. Nusxalash paytida eski va yangi fayllar aralash; qaytadigan versiya qolmaydi.
2. Atomik almashtiriladi — uni topa olmaydigan payt bo'lmaydi.
3. Avval `unlink`, keyin `symlink` — orasida havola yo'q.
4. Oxirgi argument papkaga ishora qilsa ham uni nishon papka deb ko'rmaydi.
5. `ln -sfn` — 5717 xato, `mv -T` — 0.

</details>

## Rasmiy hujjat

- [MAN: rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html)
- [GNU: mv invocation](https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html) · [Target directory](https://www.gnu.org/software/coreutils/manual/html_node/Target-directory.html)

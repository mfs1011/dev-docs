# 06 — Ma'lumot saqlash

[← Oldingi: Tarmoq, portlar va firewall](05-tarmoq-va-portlar.md) · [Mundarija](README.md) · [Keyingi: Birinchi Dockerfile →](07-birinchi-dockerfile.md)

## Tushuncha

Docker hujjati (Storage): konteyner ichida yaratilgan har fayl standart holatda konteynerning **yoziladigan qatlamiga** yoziladi — u image'ning o'zgarmas qatlamlari ustida turadi (1-, 3-boblar). Bu qatlam:

- har konteyner uchun alohida;
- konteyner **o'chirilganda yo'qoladi**;
- undan ma'lumotni serverga yoki boshqa konteynerga chiqarib olish qiyin.

Baza fayllari, foydalanuvchi yuklagan rasmlar, loglar — bularning hammasi konteynerdan uzoqroq yashashi kerak. Buning uchun Docker konteynerga tashqi omborni **ulaydi** (mount). Asosiy uch turi:

| Tur | Ma'lumot qayerda | Kim boshqaradi | Qachon |
| --- | --- | --- | --- |
| **Volume** | Serverda, Docker ajratgan joyda | Docker | Baza, ilova ma'lumotlari — doimiy saqlash |
| **Bind mount** | Serverdagi siz ko'rsatgan papka yoki fayl | Siz | Kod, sozlama fayllari — server va konteyner birga ishlatadi |
| **tmpfs** | Serverning **xotirasida** | — | Vaqtinchalik, diskka yozilmasligi kerak bo'lgan narsa |

Hujjat: qaysi turini tanlamang, konteyner ichidan ma'lumot oddiy papka yoki fayl bo'lib ko'rinadi.

## Yoziladigan qatlam yo'qoladi

```text vps
$ docker run --name v1 alpine sh -c 'echo salom > /fayl.txt; cat /fayl.txt'
salom
$ docker rm v1
v1
$ docker run --rm alpine cat /fayl.txt
cat: can't open '/fayl.txt': No such file or directory
```

Ikkinchi konteyner ham `alpine` dan, lekin `/fayl.txt` yo'q: u image'dan toza boshlandi, birinchisining qatlami esa `docker rm` bilan birga o'chdi.

<div data-animatsiya="qadamli" data-nom="volume"></div>

## Volume

Docker hujjati (Volumes): volume — Docker daemon boshqaradigan doimiy ombor; uni ishlatgan konteynerlar o'chirilgandan keyin ham saqlanadi.

```text vps
$ docker volume create malumot
malumot
$ docker run --rm -v malumot:/data alpine sh -c 'echo "1-konteyner yozdi" > /data/eslatma.txt'
$ docker run --rm -v malumot:/data alpine cat /data/eslatma.txt
1-konteyner yozdi
$ docker volume ls
DRIVER    VOLUME NAME
local     malumot
$ docker volume inspect malumot -f '{{.Mountpoint}}'
/var/lib/docker/volumes/malumot/_data
```

- `-v malumot:/data` — `malumot` volume'ini konteynerdagi `/data` ga ulash.
- Birinchi konteyner yozdi va o'chdi (`--rm`), ikkinchisi o'qidi — ma'lumot joyida.
- Diskda u `/var/lib/docker/volumes/malumot/_data` da. Lekin hujjat ogohlantiradi: volume ma'lumotiga **to'g'ridan-to'g'ri** (serverdan, Docker'siz) kirish qo'llab-quvvatlanmaydi va volume'ni buzishi mumkin — faqat konteynerga ulab ishlang.

### Bo'sh volume image fayllari bilan to'ladi

Hujjat: konteynerdagi fayllari bor papkaga **bo'sh** volume ulansa, o'sha fayllar standart holatda volume'ga **ko'chiriladi**:

```text vps
$ docker run --rm -v html:/usr/share/nginx/html nginx:1.29 ls /usr/share/nginx/html
50x.html
index.html
```

`html` volume'i hali yo'q edi — Docker uni bo'sh yaratdi va nginx image'idagi `index.html` va `50x.html` ni unga ko'chirdi. Bind mount'da bunday bo'lmaydi (pastda).

### Nomsiz volume va `--rm`

Volume'ga nom bermasangiz (`-v /data`), Docker tasodifiy nom beradi — **nomsiz** (anonymous) volume. Hujjat: nomsiz volume'lar ham konteyner o'chirilganda qoladi, faqat konteyner `--rm` bilan yaratilgan bo'lsa, u bilan birga o'chadi:

```text vps
$ docker volume ls -q | wc -l
2
$ docker run --rm -v /data alpine true
$ docker volume ls -q | wc -l
2
$ docker run -v /data --name v2 alpine true
$ docker volume ls -q | wc -l
3
$ docker rm -v v2
v2
```

- `--rm` bilan — volume'lar soni o'zgarmadi (2): nomsiz volume konteyner bilan o'chdi.
- `--rm` siz — 3 ta bo'ldi: konteyner tugadi, lekin uning volume'i qoldi.
- `docker rm -v` — konteynerni nomsiz volume'lari bilan birga o'chirish.

Nomsiz volume'lar sezilmasdan to'planadi — 28-bobda tozalaymiz.

## Bind mount

Docker hujjati: bind mount serverdagi istalgan papka yoki faylni konteynerga **to'g'ridan-to'g'ri** bog'laydi. Docker uni ajratmaydi: server jarayonlari ham, konteyner ham bir vaqtda o'zgartira oladi. Hujjatdagi qo'llanishlari: ishlab chiqishda kodni konteynerga ulash (18-bob) va sozlama fayllarini berish — Docker'ning o'zi ham har konteynerga serverning `/etc/resolv.conf` ini shunday ulaydi.

```text vps
$ mkdir -p sayt && echo '<h1>Salom</h1>' > sayt/index.html
$ docker run -d --name veb -p 127.0.0.1:8080:80 --mount type=bind,src=/root/sayt,dst=/usr/share/nginx/html,ro nginx:1.29
42d11266db1d328bc8526ff9de13f69b15049c64ae60c841b40c0af20c69afcb
$ sleep 1; curl -s http://127.0.0.1:8080/
<h1>Salom</h1>
$ echo '<h1>Yangilandi</h1>' > sayt/index.html
$ curl -s http://127.0.0.1:8080/
<h1>Yangilandi</h1>
$ docker exec veb sh -c 'echo x > /usr/share/nginx/html/a.txt'
sh: 1: cannot create /usr/share/nginx/html/a.txt: Read-only file system
$ docker rm -f veb
veb
```

- `--mount type=bind,src=…,dst=…,ro` — serverdagi `sayt` papkasi nginx'ning sahifalar papkasiga, **faqat o'qish** (`ro`) uchun.
- Serverda faylni o'zgartirdik — nginx darhol yangisini berdi: bu nusxa emas, o'sha papkaning o'zi.
- `ro` tufayli konteyner ichidan yozib bo'lmaydi — `Read-only file system`. Konteynerga faqat o'qish kerak bo'lsa, `ro` qo'ying.
- Bind mount papkani **yopib qo'yadi**: image'dagi nginx sahifalari (`index.html`, `50x.html`) endi ko'rinmaydi — volume'dagidek ko'chirish yo'q.

### `--mount` va `-v`

Ikkala sintaksis ham bor:

```text sxema
docker run --mount type=bind,src=<serverdagi yo'l>,dst=<konteynerdagi yo'l>
docker run --volume <serverdagi yo'l>:<konteynerdagi yo'l>
```

Hujjat `--mount` ni afzal ko'radi: aniqroq va barcha parametrlarni qo'llaydi. Muhim farq — serverda yo'l **mavjud bo'lmasa**:

```text vps
$ docker run --rm --mount type=bind,src=/root/yoq-papka,dst=/x alpine true
docker: Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /root/yoq-papka

Run 'docker run --help' for more information
$ docker run --rm -v /root/yoq-papka:/x alpine true
$ ls -ld /root/yoq-papka
drwxr-xr-x 2 root root 4096 Nov  7 22:26 /root/yoq-papka
```

- `--mount` — xato: `bind source path does not exist`.
- `-v` — papkani **o'zi yaratdi** (root egaligida, har doim papka sifatida). Yo'lda xato qilsangiz, `-v` jimgina bo'sh papka ulaydi va ilova "fayllar yo'q" deb hayron qoladi.

## tmpfs

Docker hujjati: tmpfs fayllarni serverning **xotirasida** saqlaydi, diskka yozmaydi; konteyner to'xtasa yoki qayta ishga tushsa, ma'lumot yo'qoladi. Hujjatdagi qo'llanishlari: vaqtinchalik kesh, maxfiy ma'lumot (parollar) diskda iz qoldirmasligi, disk yozuvini kamaytirish.

```text vps
$ docker run --rm --tmpfs /kesh alpine sh -c 'df -h /kesh; echo x > /kesh/a; ls /kesh'
Filesystem                Size      Used Available Use% Mounted on
tmpfs                   896.8M         0    896.8M   0% /kesh
a
```

`/kesh` — `tmpfs`, hajmi serverning xotirasi bilan cheklangan (Linux, 10-bob: tmpfs).

Tozalash:

```text vps
$ rm -r sayt yoq-papka
$ docker volume rm malumot html
malumot
html
```

## Qaysi birini tanlash

| Vaziyat | Tanlov |
| --- | --- |
| PostgreSQL ma'lumotlari | Nomli volume: `-v pgdata:/var/lib/postgresql` (24-bob) |
| Ishlab chiqishda kod | Bind mount (18-bob) |
| Nginx sozlama fayli | Bind mount, `ro` |
| Sessiya kesh, vaqtinchalik fayllar | tmpfs |
| Konteynerlar o'rtasida umumiy ma'lumot | Nomli volume, ikkalasiga ulanadi |

## Tipik xatolar

**1. Bazani volume'siz ishga tushirish.**
`docker rm` bilan barcha ma'lumot yo'qoladi.
To'g'risi: nomli volume.

**2. `-v` da yo'lni xato yozish.**
Docker bo'sh papka yaratib ulaydi — xato bermaydi.
To'g'risi: `--mount` (yo'q yo'lga xato beradi).

**3. `/var/lib/docker/volumes/…` dagi fayllarni serverdan o'zgartirish.**
Hujjat bo'yicha qo'llab-quvvatlanmaydi, volume buzilishi mumkin.
To'g'risi: volume'ni konteynerga ulab ishlash (zaxira — 24-bob).

**4. Bind mount image'dagi fayllarni ham ko'rsatadi deb kutish.**
Bind mount papkani butunlay yopadi.
To'g'risi: kerakli fayllar serverdagi papkada bo'lsin yoki volume ishlating.

**5. Nomsiz volume'larni unutish.**
`--rm` siz konteynerlar ularni qoldiradi.
To'g'risi: `--rm`, `docker rm -v`, nomli volume'lar.

## Amaliyot

Savollar:

1. Konteyner ichida yaratilgan fayl `docker rm` dan keyin qayerda qoladi?
2. Volume va bind mount farqi nimada?
3. Bo'sh volume nginx'ning `/usr/share/nginx/html` papkasiga ulansa, unda nima paydo bo'ladi?
4. `-v /root/yoq:/x` va `--mount type=bind,src=/root/yoq,dst=/x` — `/root/yoq` mavjud bo'lmasa, nima bo'ladi?
5. Parolni o'z ichiga oladigan vaqtinchalik faylni qayerga yozish kerak?

<details>
<summary>Javoblar</summary>

1. Hech qayerda: yoziladigan qatlam konteyner bilan o'chadi.
2. Volume'ni Docker boshqaradi (o'z joyida); bind mount — serverdagi siz ko'rsatgan yo'l, server va konteyner birga o'zgartiradi.
3. Image'dagi `index.html` va `50x.html` — bo'sh volume'ga ko'chiriladi.
4. `-v` — papkani yaratib ulaydi; `--mount` — xato beradi.
5. tmpfs: diskka yozilmaydi va konteyner to'xtaganda yo'qoladi.

</details>

## Rasmiy hujjat

- [Storage](https://docs.docker.com/engine/storage/) — yoziladigan qatlam, volume, bind mount, tmpfs
- [Volumes](https://docs.docker.com/engine/storage/volumes/) — nomli va nomsiz, bo'sh volume'ni to'ldirish, `--rm`
- [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) — `--mount` va `-v` farqi, `ro`
- [tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/)
- [Persisting container data](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/) · [Sharing local files](https://docs.docker.com/get-started/docker-concepts/running-containers/sharing-local-files/)

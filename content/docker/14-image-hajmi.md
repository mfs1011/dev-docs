# 14 — Image hajmini kamaytirish

[← Oldingi: BuildKit imkoniyatlari](13-buildkit.md) · [Mundarija](README.md) · [Keyingi: Compose asoslari →](15-compose-asoslari.md)

## Tushuncha

Katta image sekin yuklanadi (har deploy'da, har serverda), diskda ko'p joy oladi va unda zaifliklar ko'proq bo'ladi (11-bob). Docker hujjati (Best practices — Don't install unnecessary packages): keraksiz paketlarni "bo'lsa yaxshi" deb o'rnatmang — image soddaroq, bog'liqliklari kamroq, hajmi va build vaqti kichikroq bo'ladi.

Bu bob — II qismning xulosasi: hajmni **o'lchash** va oldingi boblardagi choralarni bir joyga yig'ish, hamda bitta yangi qoida — qatlamlarda o'chirish.

## O'lchash

| Buyruq | Nima ko'rsatadi |
| --- | --- |
| `docker image ls` | Image'ning umumiy hajmi (3-bob) |
| `docker image history` | Har qatlamning hajmi va uni qaysi ko'rsatma yaratgani |
| `docker system df` | Docker diskda jami qancha joy olgani (3-bob) |
| `docker image ls --tree` | Multi-platform image'ning har varianti (13-bob) |

Eng foydalisi — `history`: qaysi qatlam katta ekanini ko'rsatadi, shuni kamaytirish kerak.

## Qatlamda o'chirish image'ni kichraytirmaydi

3-bobdan: image qatlamlari **o'zgarmas**, har biri o'zidan pastdagining ustiga qo'shilgan o'zgarishlar. Demak bir `RUN` da yaratilgan faylni keyingi `RUN` da o'chirsangiz, u pastki qatlamda **qolib ketadi** — yuqori qatlam uni faqat ko'rinmas qiladi.

Docker hujjati (Best practices — apt-get) Debian/Ubuntu asosidagi image'lar uchun aniq qoidalar beradi:

1. `apt-get update` ni **har doim** `apt-get install` bilan bitta `RUN` da yozing — aks holda `update` qatlami keshdan olinib, eskirgan paket ro'yxati bilan o'rnatilishi mumkin (9-bob: kesh).
2. `--no-install-recommends` — faqat kerakli paketlar, "tavsiya etilgan" qo'shimchalarsiz.
3. Paket ro'yxati keshini (`/var/lib/apt/lists`) **o'sha** `RUN` ichida o'chiring — shunda u hech qaysi qatlamga yozilmaydi.
4. Rasmiy Debian va Ubuntu image'lari `apt-get clean` ni o'zi bajaradi — alohida yozish shart emas.

Sinaymiz — `debian:trixie-slim` ga `curl` o'rnatish, ikki usulda:

```text vps
$ docker pull -q debian:trixie-slim
docker.io/library/debian:trixie-slim
$ cat Dockerfile.yomon
FROM debian:trixie-slim
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
$ docker build -q -t curl:yomon -f Dockerfile.yomon .
sha256:5c1d0aef9b710198b6834d0123126bd5b5e6c892fa8e4e958171ced77f9144b1
$ cat Dockerfile.yaxshi
FROM debian:trixie-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
$ docker build -q -t curl:yaxshi -f Dockerfile.yaxshi .
sha256:9e6b2a33ec84e01d1d32f410c6f305939a312c6faa1a20c4456469af00d12e9a
```

Natija:

```text vps
$ docker image ls debian:trixie-slim
IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
debian:trixie-slim   a72b4433de1c        120MB         31.8MB        
$ docker image ls curl
IMAGE         ID             DISK USAGE   CONTENT SIZE   EXTRA
curl:yaxshi   9e6b2a33ec84        136MB         34.9MB        
curl:yomon    5c1d0aef9b71        184MB         53.4MB        
```

Asos 120MB. "Yomon" usul unga **64MB**, "yaxshi" usul — **16MB** qo'shdi. Nega — qatlamlarda:

```text vps
$ docker image history curl:yomon | head -4
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
5c1d0aef9b71   23 seconds ago   RUN /bin/sh -c rm -rf /var/lib/apt/lists/* #…   20.5kB    buildkit.dockerfile.v0
<missing>      24 seconds ago   RUN /bin/sh -c apt-get install -y curl # bui…   21.5MB    buildkit.dockerfile.v0
<missing>      38 seconds ago   RUN /bin/sh -c apt-get update # buildkit        21.7MB    buildkit.dockerfile.v0
$ docker image history curl:yaxshi | head -2
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
9e6b2a33ec84   2 seconds ago   RUN /bin/sh -c apt-get update && apt-get ins…   13.4MB    buildkit.dockerfile.v0
```

<div data-animatsiya="qadamli" data-nom="qatlam"></div>

- `RUN apt-get update` — 21.7MB: paket ro'yxatlari qatlamga yozildi.
- `RUN rm -rf /var/lib/apt/lists/*` — atigi 20.5kB: u ro'yxatlarni **o'chirmadi**, faqat "o'chirildi" deb belgiladi. 21.7MB pastki qatlamda qoldi.
- "Yaxshi" usulda — bitta qatlam, 13.4MB: ro'yxatlar yuklandi, ishlatildi va qatlam yozilishidan **oldin** o'chirildi.

`--no-install-recommends` ning hissasi:

```text vps
$ docker run --rm curl:yomon sh -c 'dpkg -l | grep -c ^ii'
108
$ docker run --rm curl:yaxshi sh -c 'dpkg -l | grep -c ^ii'
101
```

7 ta paket kam — `curl` uchun kerak emas edi.

## Choralar ro'yxati

Shu qismdagi barcha choralar va bizning o'lchovlar:

| Chora | Bob | Bizdagi natija |
| --- | --- | --- |
| Kichik base image (`slim`, `alpine`) | 11 | `node:26` 1.8GB → `node:26-alpine` 252MB |
| Multi-stage: yakuniy image'ga faqat natija | 10 | 322MB → 255MB |
| `.dockerignore` | 9 | Kontekst 2.38MB → 30.52kB, `Dockerfile` va keraksiz fayllar image'ga tushmadi |
| Production bog'liqliklari: `npm ci --omit=dev` | 10 | TypeScript va `@types` yakuniy image'da yo'q |
| `apt-get update && install --no-install-recommends && rm -rf /var/lib/apt/lists/*` bitta `RUN` da | shu bob | 184MB → 136MB |
| Keraksiz paketlarni o'rnatmaslik | shu bob | — |

Har image uchun tartib: `docker image history` → eng katta qatlam → yuqoridagi choralardan qaysi biri unga tegishli.

## Tipik xatolar

**1. Faylni keyingi `RUN` da o'chirish.**
Pastki qatlamda qoladi, hajm kamaymaydi.
To'g'risi: yaratilgan `RUN` ning o'zida o'chirish.

**2. `RUN apt-get update` alohida qatorda.**
Hajm katta va kesh tufayli eskirgan ro'yxat bilan o'rnatilishi mumkin.
To'g'risi: `apt-get update && apt-get install …` bitta `RUN` da.

**3. "Kerak bo'lib qolar" deb paket qo'shish.**
Matn muharriri, `curl`, kompilyator production image'da — ortiqcha hajm va zaiflik.
To'g'risi: faqat ilovaga kerakli narsa; debug uchun — alohida bosqich (10-bob) yoki `docker debug` (11-bob).

**4. Hajmni o'lchamasdan "optimallashtirish".**
To'g'risi: avval `docker image history`.

## Amaliyot

Savollar:

1. `RUN rm -rf /tmp/katta-fayl` keyingi qatorda yozildi. Image kichrayadimi?
2. `apt-get update` va `apt-get install` ni nega bitta `RUN` da yozish kerak? Ikki sabab.
3. `--no-install-recommends` nima qiladi?
4. Qaysi qatlam katta ekanini qanday bilasiz?
5. Node.js image'ini kichraytirishning uchta yo'lini ayting.

<details>
<summary>Javoblar</summary>

1. Yo'q: fayl oldingi qatlamda qoladi, yangi qatlam uni faqat yashiradi.
2. Hajm (ro'yxatlarni o'sha qatlamda o'chirish uchun) va kesh (`update` eskirgan holda keshdan olinmasligi uchun).
3. Faqat kerakli bog'liqliklarni o'rnatadi, "tavsiya etilgan" paketlarsiz.
4. `docker image history IMAGE`.
5. Kichik base (`node:26-alpine`/`slim`), multi-stage + `npm ci --omit=dev`, `.dockerignore`.

</details>

## Rasmiy hujjat

- [Best practices](https://docs.docker.com/build/building/best-practices/) — keraksiz paketlar, `apt-get` qoidalari
- [Understanding image layers](https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/) — qatlamlar o'zgarmas
- [docker image history](https://docs.docker.com/reference/cli/docker/image/history/) · [docker image ls](https://docs.docker.com/reference/cli/docker/image/ls/)

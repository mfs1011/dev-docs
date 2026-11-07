# 11 — Base image tanlash

[← Oldingi: Multi-stage build](10-multi-stage.md) · [Mundarija](README.md)

## Tushuncha

Docker hujjati (Base images): har Dockerfile **base image**dan boshlanadi — `FROM` dagi image, sizniki uning ustiga quriladi. Ko'p hollarda o'z base image'ingizni yasash shart emas: Docker Hub'da tayyorlari bor.

Tanlov ikki savolga bog'liq (hujjat, Best practices — Choose the right base image):

1. **Ishonchli manbami?** Docker Official Images — aniq hujjatlashtirilgan, yaxshi amaliyotga rioya qiladi va muntazam yangilanadi. Verified Publisher va Docker-Sponsored Open Source image'lari ham ishonchli (Docker Hub'da belgisi bor).
2. **Kichikmi?** Kichik base image tez yuklanadi, image'ingizni kichraytiradi va bog'liqliklar orqali keladigan **zaifliklar sonini kamaytiradi**.

Hujjat yana maslahat beradi: build va test uchun bitta, production uchun boshqa (odatda yengilroq) base image — multi-stage build bilan (10-bob).

## Bitta til — bir nechta variant

Rasmiy image'lar odatda bir necha variantda chiqadi. Node.js 26 ning uchtasini solishtiramiz:

```text vps
$ docker pull -q node:26
docker.io/library/node:26
$ docker pull -q node:26-slim
docker.io/library/node:26-slim
$ docker image ls node
IMAGE            ID             DISK USAGE   CONTENT SIZE   EXTRA
node:26          438603bbb5cd        1.8GB          462MB        
node:26-alpine   8996bb5821d6        252MB         63.3MB        
node:26-slim     5adad64f9a1f        355MB           88MB        
```

1.8GB, 355MB va 252MB — bir xil Node.js, uch xil hajm. Farq — atrofidagi tizimda:

```text vps
$ for t in 26 26-slim 26-alpine; do printf '%-10s ' $t; docker run --rm node:$t sh -c '. /etc/os-release; echo $PRETTY_NAME'; done
26         Debian GNU/Linux 13 (trixie)
26-slim    Debian GNU/Linux 13 (trixie)
26-alpine  Alpine Linux v3.24
$ for t in 26 26-slim 26-alpine; do printf '%-10s ' $t; docker run --rm node:$t sh -c 'ls /lib/libc.so.6 /lib/*/libc.so.6 /lib/ld-musl* 2>/dev/null | head -1'; done
26         /lib/x86_64-linux-gnu/libc.so.6
26-slim    /lib/x86_64-linux-gnu/libc.so.6
26-alpine  /lib/ld-musl-x86_64.so.1
$ for t in 26 26-slim 26-alpine; do printf '%-10s ' $t; docker run --rm node:$t sh -c 'for p in bash apt-get apk curl git python3 gcc; do command -v $p >/dev/null && printf "%s " $p; done; echo'; done
26         bash apt-get curl git python3 gcc 
26-slim    bash apt-get 
26-alpine  apk 
```

| Teg | Asos | C kutubxonasi | Ichida (tekshirilganlardan) |
| --- | --- | --- | --- |
| `node:26` | Debian 13 | glibc | bash, apt, curl, git, python3, gcc |
| `node:26-slim` | Debian 13, qisqartirilgan | glibc | bash, apt |
| `node:26-alpine` | Alpine Linux 3.24 | **musl** | apk |

- **To'liq** variantda kompilyator (`gcc`), `git`, `python3` bor — native (C/C++da yozilgan) npm paketlarini yig'ish uchun qulay. Lekin bularning hammasi production'da ham qoladi.
- **`slim`** — o'sha Debian, keraksiz paketlarsiz.
- **`alpine`** — eng kichik, lekin boshqa C kutubxonasi bilan.

### glibc va musl

Docker hujjati (DHI: glibc and musl): C kutubxonasi ilovaning operatsion tizim bilan ishlashida asosiy rol o'ynaydi.

| | glibc | musl |
| --- | --- | --- |
| Qayerda | Debian, Ubuntu, Red Hat — keng tarqalgan tizimlar | Alpine kabi minimal tizimlar |
| Moslik | Eng keng: tillar, framework'lar, tijorat dasturlari | Har doim ham to'liq mos emas — glibc kutadigan dastur ishlamasligi mumkin |
| Hajm | Kattaroq | Kichikroq |

Hujjatdagi tavsiya: moslik muhim bo'lsa (masalan, native kengaytmali Python, Java, .NET) — **glibc** (Debian asosidagi), minimal hajm muhim bo'lsa — **musl** (Alpine). Node.js'da native modul ishlatsangiz, Alpine'da sinab ko'ring.

## Distroless va `scratch`

Hujjat (DHI: distroless): **minimal** yoki **distroless** image'larda faqat ilova, uning runtime bog'liqliklari (libc, Node.js va h.k.) va kerakli sozlamalar bor. Ularda yo'q:

- OT vositalari (`ls`, `ps`, `cat`);
- qobiqlar (`sh`, `bash`);
- paket menejerlari (`apt`, `apk`);
- debug vositalari (`curl`, `wget`).

Foydasi — kamroq komponent, kamroq zaiflik; qobiq va paket menejeri yo'q bo'lsa, buzg'unchi konteynerga kirib olganda ham kam ish qila oladi. Narxi — konteyner ichida debug qilish qiyin (hujjat `docker debug` ni taklif qiladi). Docker'ning **Hardened Images** (DHI) to'plami shu yondashuvda quriladi — Alpine va Debian variantlari bilan.

Eng chekka holat — `FROM scratch`: Docker hujjati bo'yicha bu **bo'sh** base, faqat ilovaga kerakli narsadan iborat minimal image uchun. Unga statik yig'ilgan dastur qo'yiladi:

```text vps
$ cat Dockerfile
FROM busybox:musl AS manba

FROM scratch
COPY --from=manba /bin/busybox /busybox
CMD ["/busybox", "echo", "Salom, scratch!"]
$ docker build -q -t scratch-sinov .
sha256:600d6294ac6d56eae4fb8f80f393414338620a76caf6a201851d360d8f96575c
$ docker image ls scratch-sinov
IMAGE                  ID             DISK USAGE   CONTENT SIZE   EXTRA
scratch-sinov:latest   600d6294ac6d       2.03MB          788kB        
$ docker run --rm scratch-sinov
Salom, scratch!
$ docker run --rm scratch-sinov ls /
docker: Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: exec: "ls": executable file not found in $PATH

Run 'docker run --help' for more information
$ docker run --rm scratch-sinov /busybox ls /
busybox
dev
etc
proc
sys
```

- 2.03MB: image'da faqat bitta fayl — `/busybox` (statik yig'ilgan BusyBox, `busybox:musl` dan multi-stage bilan olindi, 10-bob).
- `ls` — topilmadi: `scratch` da hech narsa yo'q, hatto qobiq ham. `/busybox ls /` da ko'rinadigan `/dev`, `/etc`, `/proc`, `/sys` ni biz qo'shmadik — ular konteyner ishga tushganda paydo bo'ldi.

Go yoki Rust kabi tillarda ilova bitta statik faylga yig'iladi va `scratch` yoki distroless'ga qo'yiladi. Node.js'ga esa runtime kerak — uning uchun `slim`, `alpine` yoki Node.js distroless/DHI image'lari.

## Base image'ni yangilab turish

Hujjat (Best practices — Rebuild your images often): image o'zgarmas — u yig'ilgan paytdagi holatning "surati", base image va kutubxonalari bilan birga. Xavfsizlik tuzatishlarini olish uchun image'larni **muntazam qayta yig'ing**. Teg (`node:26-alpine`) vaqt o'tishi bilan yangilangan image'ga ko'chadi (3-bob), lekin keshdagi eski nusxa qolib ketishi mumkin:

```text sxema
docker build --pull -t ilova:2026-11-08 .
```

`--pull` — keshda bo'lsa ham base image'ning yangi versiyasini tekshirib, yuklaydi.

## Qaysi birini tanlash

| Vaziyat | Tanlov |
| --- | --- |
| Odatiy Node.js/PHP/Python ilova | Rasmiy image'ning `slim` yoki `alpine` varianti |
| Native kengaytmalar, glibc'ga bog'liq dasturlar | `slim` (Debian, glibc) |
| Eng kichik hajm, musl bilan muammo yo'q | `alpine` |
| Build bosqichi (kompilyator, git kerak) | To'liq variant — faqat multi-stage'ning build bosqichida |
| Statik dastur (Go, Rust) | `scratch` yoki distroless |
| Yuqori xavfsizlik talabi | Distroless / Docker Hardened Images |

## Tipik xatolar

**1. Production'da to'liq variant (`node:26`).**
1.8GB, ichida kompilyator va keraksiz vositalar — zaifliklar ko'p.
To'g'risi: `slim`/`alpine`, to'liq variant faqat build bosqichida.

**2. Noma'lum muallifning image'i.**
Ichida nima borligi va yangilanishi noma'lum.
To'g'risi: Docker Official / Verified Publisher.

**3. Alpine'ga o'tib, glibc kutadigan dasturni ishlatish.**
Ishlamay qolishi mumkin.
To'g'risi: sinash yoki `slim`.

**4. Image'ni bir marta yig'ib, yillab ishlatish.**
Base image'dagi tuzatishlar kelmaydi.
To'g'risi: muntazam qayta yig'ish, `--pull`.

## Amaliyot

Savollar:

1. `node:26` va `node:26-slim` ning farqi nimada?
2. Alpine image'lari nega kichik va bunda qanday xavf bor?
3. Distroless image'da `docker exec … sh` nega ishlamaydi?
4. `FROM scratch` image'ida nima bor?
5. `docker build --pull` nima uchun?

<details>
<summary>Javoblar</summary>

1. Ikkalasi Debian 13; `slim` da qo'shimcha vositalar (gcc, git, python3, curl) yo'q — 1.8GB va 355MB.
2. Minimal tizim va musl C kutubxonasi; glibc kutadigan dasturlar bilan to'liq mos bo'lmasligi mumkin.
3. Distroless'da qobiq yo'q.
4. Hech narsa — faqat siz `COPY` qilgan fayllar.
5. Keshdagi eski base image o'rniga uning yangi versiyasini tekshirib yuklash uchun — xavfsizlik tuzatishlari bilan.

</details>

## Rasmiy hujjat

- [Base images](https://docs.docker.com/build/building/base-images/) — base image, `scratch`
- [Best practices: Choose the right base image, Rebuild your images often](https://docs.docker.com/build/building/best-practices/)
- [DHI: Distroless images](https://docs.docker.com/dhi/explore/security-concepts/distroless/) · [DHI: glibc and musl](https://docs.docker.com/dhi/explore/security-concepts/glibc-musl/)
- [Docker Hub: Trusted content](https://docs.docker.com/docker-hub/image-library/trusted-content/) — Official, Verified Publisher, Sponsored Open Source

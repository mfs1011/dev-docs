# 25 — Registry va teglash

[← Oldingi: Ma'lumotlar bazasi konteynerda](24-malumotlar-bazasi.md) · [Mundarija](README.md) · [Keyingi: CI'da Docker →](26-ci.md)

## Tushuncha

**Registry** — image'lar saqlanadigan va tarqatiladigan server. `docker pull postgres:18` — Docker Hub registry'sidan yuklash; `docker push` — registry'ga yuborish. Image serverga shu yo'l bilan yetadi: kompyuterda (yoki CI'da, 26-bob) yig'iladi → registry'ga `push` → serverda `pull` (27-bob).

Docker hujjati (Build, tag, and publish) image nomining to'liq shakli:

```text sxema
[HOST[:PORT_NUMBER]/]PATH[:TAG]
```

| Qism | Ma'nosi | Ko'rsatilmasa |
| --- | --- | --- |
| `HOST[:PORT]` | Registry manzili | `docker.io` (Docker Hub) |
| `PATH` | Docker Hub'da `[NAMESPACE/]REPOSITORY` — foydalanuvchi yoki tashkilot nomi va repozitoriy | Namespace — `library` (Docker Official Images) |
| `TAG` | Versiya yoki variant | `latest` |

Hujjatdagi misol: `nginx` = `docker.io/library/nginx:latest`.

| Registry | Nomi | Kirish |
| --- | --- | --- |
| Docker Hub | `docker.io/<foydalanuvchi>/<repo>:<teg>` (qisqasi: `<foydalanuvchi>/<repo>:<teg>`) | `docker login` |
| GitHub Container Registry (GHCR) | `ghcr.io/<namespace>/<image>:<teg>` | `docker login ghcr.io` + token |
| O'z registry'ingiz | `<host>:<port>/<repo>:<teg>` | Sozlamaga qarab |

## Lokal registry bilan amaliyot

Bu bobdagi buyruqlarni hisob ochmasdan sinash uchun serverda rasmiy `registry` image'ini (Docker Hub: OCI Distribution spetsifikatsiyasining amalga oshirilishi) ishga tushiramiz — Docker Hub va GHCR bilan ishlash bir xil, faqat manzil va `login` farq qiladi. Port faqat `127.0.0.1` da (5-bob).

```text vps
$ docker run -d -p 127.0.0.1:5000:5000 --name registry registry:3
6c7680e612c0e4af354f5e8a1a277a42cd399371e7b19412f20ad80625433014
```

Kichik image va uch teg — `Dockerfile`:

```dockerfile
FROM busybox:1.37
ARG VERSIYA
RUN echo "versiya $VERSIYA" > /versiya
CMD ["cat", "/versiya"]
```

```text vps
$ docker build -q --build-arg VERSIYA=1.0.0 -t ilova:1.0.0 .
sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737
$ docker tag ilova:1.0.0 localhost:5000/ilova:1.0.0
$ docker tag ilova:1.0.0 localhost:5000/ilova:1.0
$ docker tag ilova:1.0.0 localhost:5000/ilova:latest
$ docker image ls --format 'table {{.Repository}}:{{.Tag}}\t{{.ID}}' | grep -E "REPOSITORY|^(localhost:5000/)?ilova:"
REPOSITORY:TAG                IMAGE ID
ilova:1.0.0                   f4621b18b5c4
localhost:5000/ilova:1.0      f4621b18b5c4
localhost:5000/ilova:1.0.0    f4621b18b5c4
localhost:5000/ilova:latest   f4621b18b5c4
```

`docker tag` image'ni nusxalamaydi — bitta image'ga (`f4621b18b5c4`) **yangi nom** qo'shadi. `localhost:5000/` prefiksi — `push` qayerga borishini bildiradi.

```text vps
$ docker push localhost:5000/ilova:1.0.0
The push refers to repository [localhost:5000/ilova]
864c5742afff: Pushed
68fe9bff2ad4: Waiting
44136fa355b3: Pushed
18b2ee3a2572: Pushed
68fe9bff2ad4: Pushed
1.0.0: digest: sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737 size: 855
$ docker push --all-tags localhost:5000/ilova
The push refers to repository [localhost:5000/ilova]
68fe9bff2ad4: Layer already exists
864c5742afff: Layer already exists
44136fa355b3: Already exists
18b2ee3a2572: Already exists
1.0: digest: sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737 size: 855
864c5742afff: Layer already exists
44136fa355b3: Already exists
18b2ee3a2572: Already exists
68fe9bff2ad4: Layer already exists
1.0.0: digest: sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737 size: 855
864c5742afff: Layer already exists
44136fa355b3: Already exists
18b2ee3a2572: Already exists
68fe9bff2ad4: Layer already exists
latest: digest: sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737 size: 855
$ curl -s http://127.0.0.1:5000/v2/_catalog
{"repositories":["ilova"]}
$ curl -s http://127.0.0.1:5000/v2/ilova/tags/list
{"name":"ilova","tags":["1.0","1.0.0","latest"]}
$ docker image inspect --format '{{json .RepoDigests}}' localhost:5000/ilova:1.0.0
["ilova@sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737","localhost:5000/ilova@sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737"]
```

- Birinchi `push` — qatlamlar yuklandi; `--all-tags` (CLI hujjati: image'ning barcha teglarini yuborish) bilan qolgan teglar uchun qatlamlar qayta yuborilmadi — `Layer already exists`.
- `digest` — image manifestining SHA256 xeshi: mazmun o'zgarmasa, digest ham o'zgarmaydi. Uch tegning digesti bir xil — bitta image.
- Registry API'si (`/v2/_catalog`, `/v2/<repo>/tags/list`) — repozitoriylar va teglar.

## Teg o'zgaradi, digest — yo'q

Yangi versiya chiqardik — `1.0.1`, va `1.0` hamda `latest` teglarini **unga ko'chirdik**:

```text vps
$ docker build -q --build-arg VERSIYA=1.0.1 -t localhost:5000/ilova:1.0.1 .
sha256:710ecd0ea2c4a08c7c6690d1e05f47b6ddcf3ac2e01c422e80fc976af09a1458
$ docker tag localhost:5000/ilova:1.0.1 localhost:5000/ilova:1.0
$ docker tag localhost:5000/ilova:1.0.1 localhost:5000/ilova:latest
$ docker push -q --all-tags localhost:5000/ilova
localhost:5000/ilova
$ curl -s http://127.0.0.1:5000/v2/ilova/tags/list
{"name":"ilova","tags":["1.0","1.0.0","1.0.1","latest"]}
```

Endi lokal image'larni o'chirib, registry'dan qayta olamiz:

```text vps
$ docker rmi -f ilova:1.0.0 localhost:5000/ilova:1.0.0 localhost:5000/ilova:1.0.1 localhost:5000/ilova:1.0 localhost:5000/ilova:latest >/dev/null
$ docker image ls localhost:5000/ilova
IMAGE   ID             DISK USAGE   CONTENT SIZE   EXTRA
$ docker run --rm localhost:5000/ilova:1.0
Unable to find image 'localhost:5000/ilova:1.0' locally
1.0: Pulling from ilova
99b298a836e5: Pulling fs layer
68fe9bff2ad4: Pulling fs layer
99b298a836e5: Already exists
68fe9bff2ad4: Already exists
44136fa355b3: Already exists
c18314303b20: Download complete
99b298a836e5: Pull complete
68fe9bff2ad4: Pull complete
Digest: sha256:710ecd0ea2c4a08c7c6690d1e05f47b6ddcf3ac2e01c422e80fc976af09a1458
Status: Downloaded newer image for localhost:5000/ilova:1.0
versiya 1.0.1
$ docker run --rm localhost:5000/ilova:1.0.0
Unable to find image 'localhost:5000/ilova:1.0.0' locally
1.0.0: Pulling from ilova
864c5742afff: Pulling fs layer
68fe9bff2ad4: Pulling fs layer
864c5742afff: Already exists
68fe9bff2ad4: Already exists
44136fa355b3: Already exists
18b2ee3a2572: Download complete
864c5742afff: Pull complete
Digest: sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737
Status: Downloaded newer image for localhost:5000/ilova:1.0.0
versiya 1.0.0
$ curl -s -o /dev/null -w '%header{docker-content-digest}\n' -H 'Accept: application/vnd.oci.image.index.v1+json' http://127.0.0.1:5000/v2/ilova/manifests/1.0.0
sha256:f4621b18b5c48e8f9e23e46df75e19903e9092fdd67b6504ac509cd032fb1737
$ docker run --rm localhost:5000/ilova@$(curl -s -o /dev/null -w '%header{docker-content-digest}' -H 'Accept: application/vnd.oci.image.index.v1+json' http://127.0.0.1:5000/v2/ilova/manifests/1.0.0)
versiya 1.0.0
```

- `ilova:1.0` endi `versiya 1.0.1` — teg yangi image'ga ko'chdi. Kecha `1.0` ni ishlatgan server bugun `pull` qilsa, boshqa image oladi.
- `ilova:1.0.0` — hali eski image (uni hech kim ko'chirmadi).
- `@sha256:…` — digest bo'yicha olish: har doim aynan shu image. (Buyruqdagi `curl` digestni registry API'sidan oldi; odatda digestni `push` chiqishidan yoki `docker image inspect` ning `RepoDigests` maydonidan olasiz.)

Docker hujjati (Build best practices): image teglari **o'zgaruvchan** (mutable) — nashr qiluvchi tegni yangi image'ga ko'chirishi mumkin; aniq image kerak bo'lsa — digest bilan bog'lang (pin).

### Teg strategiyasi

Biz ko'rgan naqsh rasmiy image'larda ham bor: Docker Hub'dagi `postgres` sahifasida bitta image uchun `18.6`, `18`, `latest` teglari birga turadi.

| Teg | Nimaga ishora qiladi | Kim ishlatadi |
| --- | --- | --- |
| `1.0.1` | Aniq reliz (biz uni boshqa ko'chirmaymiz) | Production deploy |
| `1.0`, `1` | Shu qatordagi eng oxirgi | Avtomatik yangilanish kerak bo'lsa |
| `latest` | Eng oxirgi | Faqat sinov uchun |
| Git commit (`sha-90dd603`) | Aniq kod holati | CI (`docker/metadata-action`, 26-bob) |
| `@sha256:…` | Aniq image | Eng qat'iy talab |

## Docker Hub

Docker Hub hujjati (Push images, Tags):

```text sxema
$ docker login
$ docker build -t <foydalanuvchi>/<repo>:<teg> .
$ docker push <foydalanuvchi>/<repo>:<teg>
```

Mavjud image'ga teg — `docker tag <image> <foydalanuvchi>/<repo>:<teg>`. Teg ko'rsatilmasa — `latest`.

## GitHub Container Registry

GitHub hujjati (Working with the Container registry):

- Registry — `ghcr.io`; image nomi `ghcr.io/NAMESPACE/IMAGE_NAME:teg`, `NAMESPACE` — foydalanuvchi yoki tashkilot.
- Kirish — **personal access token (classic)** bilan: `read:packages` — yuklab olish, `write:packages` — yuborish, `delete:packages` — o'chirish. Hujjat ogohlantiradi: UI'da `write:packages` tanlanganda `repo` ham avtomatik belgilanadi — u keraksiz keng huquq; faqat `write:packages` uchun `https://github.com/settings/tokens/new?scopes=write:packages` havolasi.
- Token muhit o'zgaruvchisida, kirish — `--password-stdin` bilan (`docker login` hujjati: STDIN orqali berilgan parol qobiq tarixiga tushmaydi):

```text sxema
$ export CR_PAT=YOUR_TOKEN
$ echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
> Login Succeeded
```

- Image buyruq qatoridan yuborilganda repozitoriyga **bog'lanmaydi**; bog'lash uchun Dockerfile'ga label:

```dockerfile
LABEL org.opencontainers.image.source=https://github.com/OWNER/REPO
```

- GitHub Actions'dan `GITHUB_TOKEN` bilan yuborilsa, workflow turgan repozitoriy avtomatik bog'lanadi (26-bob).

Docker Hub va GHCR bo'limlaridagi buyruqlar ushbu kitob uchun **sinalmagan** (hisob kerak) — ular rasmiy hujjatdan, `push` va teglash mexanikasi esa yuqorida lokal registry'da tekshirildi.

## O'z registry'ingiz haqida

`registry` image'i hujjati (Distribution: Deploying a registry server) ogohlantiradi: localhost'dagi sodda misollar **faqat sinov uchun**; production registry TLS bilan himoyalangan bo'lishi va iloji bo'lsa kirish nazorati (access control) bo'lishi kerak.

## Tipik xatolar

**1. Production'da `latest`.**
Qaysi versiya ishlayotgani noma'lum, qaytarish (rollback) qiyin.
To'g'risi: aniq teg (`1.0.1`) yoki digest.

**2. Bir xil aniq tegni qayta yuborish.**
`1.0.1` ni boshqa image bilan qayta `push` qilish — kecha va bugun "1.0.1" ikki xil narsa.
To'g'risi: har reliz — yangi teg.

**3. Tokenni buyruq qatorida yozish (`-p TOKEN`).**
Qobiq tarixida qoladi.
To'g'risi: `--password-stdin`.

**4. GHCR token'iga `repo` huquqi.**
To'g'risi: faqat kerakli `packages` huquqlari.

## Amaliyot

Savollar:

1. `redis` nomining to'liq shakli nima?
2. `docker tag` image'ni nusxalaydimi?
3. `--all-tags` bilan ikkinchi `push` da nega `Layer already exists`?
4. Nega `ilova:1.0` ikki xil vaqtda ikki xil natija berdi?
5. GHCR uchun token'ga qaysi huquq kerak?

<details>
<summary>Javoblar</summary>

1. `docker.io/library/redis:latest`.
2. Yo'q — o'sha image'ga yangi nom qo'shadi (IMAGE ID bir xil).
3. Qatlamlar registry'da allaqachon bor — faqat yangi teg manifesti yuboriladi.
4. Teg o'zgaruvchan: `1.0` yangi image'ga ko'chirildi. Aniq image uchun — digest.
5. Yuklash — `read:packages`, yuborish — `write:packages`.

</details>

## Rasmiy hujjat

- [Get started: Build, tag, and publish an image](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/) — image nomi tuzilishi
- [Docker Hub: Push images](https://docs.docker.com/docker-hub/repos/manage/hub-images/push/) · [Docker Hub: Tags](https://docs.docker.com/docker-hub/repos/manage/hub-images/tags/)
- [docker image push](https://docs.docker.com/reference/cli/docker/image/push/) — `--all-tags` · [docker login](https://docs.docker.com/reference/cli/docker/login/) — `--password-stdin`
- [Build best practices: pin base image versions](https://docs.docker.com/build/building/best-practices/#pin-base-image-versions) — teglar o'zgaruvchan, digest
- [GitHub: Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [registry rasmiy image (Docker Hub)](https://hub.docker.com/_/registry) · [Distribution: Deploying a registry server](https://distribution.github.io/distribution/about/deploying/)

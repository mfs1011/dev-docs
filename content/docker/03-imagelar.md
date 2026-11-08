# 03 — Image'lar

[← Oldingi: O'rnatish](02-ornatish.md) · [Mundarija](README.md) · [Keyingi: Konteynerlar bilan ishlash →](04-konteynerlar.md)

## Tushuncha

1-bobda image — konteyner uchun o'zgarmas shablon ekanini ko'rdik. Bu bobda u bilan amalda ishlaymiz: qayerdan olinadi, nomi qanday tuzilgan, ichidagi qatlamlar va diskda qancha joy oladi.

| Tushuncha | Ma'nosi | Misol |
| --- | --- | --- |
| Registry | Image'lar ombori | `docker.io` (Docker Hub) |
| Repozitoriy | Bir loyihaning image'lari | `library/debian` |
| Teg (tag) | Versiyaga berilgan nom — o'zgarishi mumkin | `trixie`, `latest` |
| Digest | Image mazmunidan hisoblangan SHA256 — **o'zgarmas** identifikator | `sha256:9c6e…` |
| Qatlam (layer) | Fayl tizimidagi o'zgarishlar to'plami | `RUN apt-get install …` natijasi |

## Image'ni yuklab olish: `pull`

VPS'da 2-bobdan qolgan image'lar:

```text vps
$ docker image ls
IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
alpine:latest        3f4d6b32e267         13MB         3.94MB        
hello-world:latest   c567b231f656       25.9kB         9.49kB        
nginx:1.29           1881968aff6f        240MB         65.8MB        
```

`docker pull` — image'ni registry'dan yuklash. Teg ko'rsatilmasa:

```text vps
$ docker pull debian
Using default tag: latest
latest: Pulling from library/debian
a6dd1c05fbba: Pulling fs layer
a992b59d2ed9: Download complete
a6dd1c05fbba: Download complete
a6dd1c05fbba: Pull complete
Digest: sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
Status: Downloaded newer image for debian:latest
docker.io/library/debian:latest
```

`docker pull` ma'lumotnomasi bo'yicha:

- teg berilmasa, Docker `:latest` ni oladi (`Using default tag: latest`);
- oxirgi qatordagi **to'liq nom**: `docker.io/library/debian:latest`. Biz `debian` deb yozdik, Docker qolganini to'ldirdi: registry — `docker.io` (Docker Hub, standart), `library/` — Docker Official Images (1-bob) uchun nomlar maydoni, so'ng teg;
- `Pull complete` — qatlamlar yuklandi; `Digest:` — yuklangan image'ning digest'i.

## Teg va image ID

Endi xuddi shu repozitoriydan `trixie` tegini so'raymiz (Debian versiyasining kod nomi):

```text vps
$ docker pull debian:trixie
trixie: Pulling from library/debian
Digest: sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
Status: Downloaded newer image for debian:trixie
docker.io/library/debian:trixie
$ docker image ls debian
IMAGE           ID             DISK USAGE   CONTENT SIZE   EXTRA
debian:latest   9c6e381421d0        187MB         52.6MB        
debian:trixie   9c6e381421d0        187MB         52.6MB        
$ docker image inspect debian:trixie --format "{{.Id}}"
sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
$ docker image inspect debian:latest --format "{{.Id}}"
sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
```

- Hech narsa yuklanmadi — faqat `Digest` va `Status`: kerakli qatlamlar allaqachon bor edi.
- `docker image ls` da ikki teg, lekin **ID bitta** — `9c6e381421d0`.

`docker pull` ma'lumotnomasi aynan shuni tushuntiradi: Docker mazmun bo'yicha manzillanadigan (content-addressable) ombor ishlatadi, image ID — image sozlamasi va qatlamlaridan hisoblangan SHA256 digest. Ikki teg bir xil ID'ga ega — demak bu **bitta image**ning ikki nomi, qatlamlari diskda faqat bir marta saqlanadi. Hozir `debian:latest` va `debian:trixie` bir narsa. Lekin teg — repozitoriy egasi boshqa image'ga ko'chira oladigan nom: `docker pull` ma'lumotnomasi bo'yicha tegni qayta `pull` qilish aynan shu tegning eng yangi holatini olish uchun ishlatiladi.

Xulosa: **teg — ko'chadigan yorliq**. `latest` ayniqsa: "eng yangisi" degani emas, shunchaki standart teg nomi.

### Ustunlar va containerd image store

Docker hujjati (containerd image store): Docker Engine 29.0 dan boshlab **yangi o'rnatishlarda** image'larni containerd image store saqlaydi (eski versiyadan yangilangan tizimlar avvalgi overlay2 drayverida qoladi). Bizning VPS — yangi o'rnatish (2-bobdagi `docker info` da `driver-type: io.containerd.snapshotter.v1`). Shuning uchun `docker image ls` ning ustunlari eski qo'llanmalardagidan boshqacha: `ID`, `DISK USAGE`, `CONTENT SIZE`.

Hujjat bo'yicha containerd image store qatlamlarni **ikki ko'rinishda** saqlaydi: registry'dan kelgan siqilgan holatda va diskka ochilgan holatda — shuning uchun eski drayverlarga qaraganda ko'proq joy oladi. Debian image'ida `CONTENT SIZE` 52.6MB, `DISK USAGE` esa 187MB. Ustunlarning aniq ta'rifi CLI ma'lumotnomasida hozircha berilmagan.

## Qatlamlar

Docker hujjati (Understanding image layers): har qatlam — fayl tizimidagi o'zgarishlar (qo'shish, o'chirish, o'zgartirish). Qatlamlar bir-birining ustiga qo'yiladi va konteyner ishga tushganda ulardan bitta birlashtirilgan (union) fayl tizimi hosil bo'ladi; konteyner uchun esa ustidan alohida yoziladigan papka ochiladi (1-bobdagi 3-qadam). Qatlamlar o'zgarmas bo'lgani uchun bir qatlamni ko'p image va ko'p konteyner birga ishlatadi.

`docker image history` image qanday qurilganini ko'rsatadi — pastdan yuqoriga:

```text vps
$ docker image history nginx:1.29
IMAGE          CREATED        CREATED BY                                      SIZE      COMMENT
1881968aff6f   6 months ago   CMD ["nginx" "-g" "daemon off;"]                0B        buildkit.dockerfile.v0
<missing>      6 months ago   STOPSIGNAL SIGQUIT                              0B        buildkit.dockerfile.v0
<missing>      6 months ago   EXPOSE map[80/tcp:{}]                           0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENTRYPOINT ["/docker-entrypoint.sh"]            0B        buildkit.dockerfile.v0
<missing>      6 months ago   COPY 30-tune-worker-processes.sh /docker-ent…   16.4kB    buildkit.dockerfile.v0
<missing>      6 months ago   COPY 20-envsubst-on-templates.sh /docker-ent…   12.3kB    buildkit.dockerfile.v0
<missing>      6 months ago   COPY 15-local-resolvers.envsh /docker-entryp…   12.3kB    buildkit.dockerfile.v0
<missing>      6 months ago   COPY 10-listen-on-ipv6-by-default.sh /docker…   12.3kB    buildkit.dockerfile.v0
<missing>      6 months ago   COPY docker-entrypoint.sh / # buildkit          8.19kB    buildkit.dockerfile.v0
<missing>      6 months ago   RUN /bin/sh -c set -x     && groupadd --syst…   86.7MB    buildkit.dockerfile.v0
<missing>      6 months ago   ENV DYNPKG_RELEASE=1~trixie                     0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENV PKG_RELEASE=1~trixie                        0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENV ACME_VERSION=0.3.1                          0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENV NJS_RELEASE=1~trixie                        0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENV NJS_VERSION=0.9.6                           0B        buildkit.dockerfile.v0
<missing>      6 months ago   ENV NGINX_VERSION=1.29.8                        0B        buildkit.dockerfile.v0
<missing>      6 months ago   LABEL maintainer=NGINX Docker Maintainers <d…   0B        buildkit.dockerfile.v0
<missing>      6 months ago   # debian.sh --arch 'amd64' out/ 'trixie' '@1…   87.4MB    debuerreotype 0.17
$ docker image inspect nginx:1.29 --format "{{len .RootFS.Layers}} qatlam, {{.Os}}/{{.Architecture}}"
7 qatlam, linux/amd64
```

O'qish:

- **Eng pastki qator** (`debian.sh --arch 'amd64' … 'trixie'`, 87.4MB) — asosi: Debian trixie. Nginx image'i Debian ustiga qurilgan.
- `RUN … groupadd …` (86.7MB) — nginx'ni o'rnatish. `ENV NGINX_VERSION=1.29.8` — `1.29` tegi aslida 1.29.8 versiya.
- `COPY …` — kichik skriptlar.
- `ENV`, `EXPOSE`, `CMD`, `ENTRYPOINT`, `STOPSIGNAL` — **0B**: ular fayl qo'shmaydi, faqat image sozlamasini yozadi (8-bob).
- Hajmi noldan katta qatorlar — 7 ta, `RootFS.Layers` ham 7 ta: haqiqiy qatlamlarni faqat fayl o'zgartiradigan ko'rsatmalar hosil qiladi.
- `linux/amd64` — image qaysi OT va protsessor uchun (13-bob: bir image bir necha platforma uchun).

Bu yozuvlar Dockerfile ko'rsatmalari — o'zingiz Dockerfile yozganingizda (7-bob) aynan shunday tarix hosil bo'ladi.

## Digest bilan yuklash

Teg ko'chadi, digest — yo'q. `docker pull` ma'lumotnomasi: digest bilan aynan qaysi image kerakligini ko'rsatasiz — kimdir tegni boshqa image'ga ko'chirsa ham sizniki o'zgarmaydi:

```text vps
$ docker pull debian@sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
docker.io/library/debian@sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6: Pulling from library/debian
Digest: sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
Status: Image is up to date for debian@sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
docker.io/library/debian@sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6
```

Image allaqachon bor — `Image is up to date`. Production'da (25-, 27-boblar) aynan bir xil image ishlashi kerak bo'lgan joyda digest ishlatiladi.

## Tegni o'chirish va disk

```text vps
$ docker image rm debian:latest
Untagged: debian:latest
$ docker image ls debian
IMAGE                                                                            ID             DISK USAGE   CONTENT SIZE   EXTRA
debian:trixie                                                                    9c6e381421d0        187MB         52.6MB        
debian@sha256:9c6e381421d0f48d1b8133e573f33c185ee16cbf505eda9c4a8a4791b25ea8a6   9c6e381421d0        187MB         52.6MB        
$ docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          4         0         440MB     439.9MB (99%)
Containers      0         0         0B        0B
Local Volumes   0         0         0B        0B
Build Cache     0         0         0B        0B
```

- `docker image rm debian:latest` — `Untagged`: faqat **nom** o'chdi. Image o'zi qoldi, chunki unga boshqa nomlar ham ishora qiladi (`trixie` va digest bilan yuklanganda paydo bo'lgan yozuv). Linux kitobidagi hard link'ga o'xshaydi: ma'lumot oxirgi nom yo'qolganda o'chadi (Linux, 6-bob).
- `docker system df` — Docker diskda qancha joy egallagani: image'lar, konteynerlar, volume'lar, build kesh. `RECLAIMABLE` — bo'shatsa bo'ladigan joy (hech bir konteyner ishlatmayotgan image'lar). Tozalash — 28-bobda.

## Tipik xatolar

**1. `latest` — "eng yangi versiya" deb o'ylash.**
Bu shunchaki teg berilmaganda ishlatiladigan nom; u qaysi image'ga ishora qilishini repozitoriy egasi belgilaydi va istalgan vaqtda ko'chiradi.
To'g'risi: aniq teg (`nginx:1.29`), qat'iy kerak bo'lsa — digest.

**2. Ikki teg — ikki marta joy deb o'ylash.**
Bir xil ID — bitta image, qatlamlar bir marta saqlanadi.

**3. `docker image rm` image'ni albatta o'chiradi deb o'ylash.**
Boshqa teg ham ishora qilsa, faqat `Untagged` bo'ladi.

**4. Eski qo'llanmadagi `docker images` ustunlarini kutish.**
Docker 29 da containerd image store bilan ustunlar boshqacha (`DISK USAGE`, `CONTENT SIZE`) va image ko'proq joy oladi.

## Amaliyot

Savollar:

1. `docker pull redis` qaysi registry'dan, qaysi repozitoriydan va qaysi tegni oladi?
2. `debian:latest` va `debian:trixie` ning ID'si bir xil. Bu nimani bildiradi?
3. `docker image history` da `ENV` va `CMD` qatorlari nega 0B?
4. Teg o'rniga digest bilan yuklash qachon kerak?
5. `docker image rm nginx:1.29` faqat `Untagged` dedi. Nega image o'chmadi?

<details>
<summary>Javoblar</summary>

1. `docker.io` (Docker Hub), `library/redis`, teg — `latest`.
2. Bu bitta image'ning ikki nomi; qatlamlar bir marta saqlanadi.
3. Ular fayl o'zgartirmaydi — faqat image sozlamasiga yoziladi, qatlam hosil qilmaydi.
4. Aynan bir xil image kafolatlanishi kerak bo'lganda (production, takrorlanadigan build): teg ko'chishi mumkin, digest — yo'q.
5. Image'ga boshqa nom (teg yoki digest yozuvi) ham ishora qiladi — faqat shu nom o'chdi.

</details>

## Rasmiy hujjat

- [Understanding image layers](https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/) — qatlamlar, birlashtirilgan fayl tizimi
- [What is a registry?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/) · [Docker Hub](https://docs.docker.com/docker-hub/)
- [docker image pull](https://docs.docker.com/reference/cli/docker/image/pull/) — standart teg, qatlamlarni qayta ishlatish, digest bilan yuklash
- [docker image history](https://docs.docker.com/reference/cli/docker/image/history/) · [docker image ls](https://docs.docker.com/reference/cli/docker/image/ls/) · [docker system df](https://docs.docker.com/reference/cli/docker/system/df/)
- [containerd image store](https://docs.docker.com/engine/storage/containerd/) — Docker 29 dagi standart, disk sarfi

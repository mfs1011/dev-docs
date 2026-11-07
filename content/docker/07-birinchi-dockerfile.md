# 07 — Birinchi Dockerfile

[← Oldingi: Ma'lumot saqlash](06-malumot-saqlash.md) · [Mundarija](README.md) · [Keyingi: `CMD` va `ENTRYPOINT` →](08-cmd-va-entrypoint.md)

## Tushuncha

Shu paytgacha boshqalar yasagan image'larni ishlatdik. Endi o'zimiznikini yasaymiz. Docker hujjati (Writing a Dockerfile): **Dockerfile** — image yaratish uchun matnli hujjat; unda image yig'uvchiga (builder) qaysi buyruqlarni bajarish, qaysi fayllarni nusxalash, konteyner qanday buyruq bilan ishga tushishi va hokazo yoziladi.

Hujjatdagi eng ko'p ishlatiladigan ko'rsatmalar (instructions):

| Ko'rsatma | Nima qiladi |
| --- | --- |
| `FROM <image>` | Qaysi image ustiga quriladi (asos, base image) |
| `WORKDIR <yo'l>` | Image ichidagi ishchi papka: keyingi `COPY` va `RUN` shu yerda |
| `COPY <manba> <manzil>` | Kompyuterdagi fayllarni image'ga nusxalash |
| `RUN <buyruq>` | Yig'ish paytida buyruq bajarish (paket o'rnatish va h.k.) |
| `ENV <nom> <qiymat>` | Konteynerda bo'ladigan muhit o'zgaruvchisi |
| `EXPOSE <port>` | Ilova qaysi portda tinglashi haqida ma'lumot (5-bob) |
| `USER <foydalanuvchi>` | Keyingi ko'rsatmalar va konteyner kim nomidan ishlaydi (12-bob) |
| `CMD ["buyruq", "arg"]` | Konteyner ishga tushganda bajariladigan standart buyruq (8-bob) |

## Ilova

Misol uchun eng kichik Node.js veb-ilova: bitta `server.js`, bog'liqliklarsiz. Versiya — Node.js 26: Node.js reliz jadvali bo'yicha 2026-10-28 dan **Active LTS** (uzoq qo'llab-quvvatlanadigan) versiya.

`server.js`:

```js
const http = require('node:http');

const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.end(`Salom! Node.js ${process.version}\n`);
}).listen(port, () => {
  console.log(`Tinglayapti: ${port}`);
});
```

`package.json`:

```json
{
  "name": "salom-ilova",
  "version": "1.0.0",
  "main": "server.js"
}
```

## Dockerfile

```text vps
$ ls
Dockerfile
package.json
server.js
$ cat Dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

Qatorma-qator:

1. `FROM node:26-alpine` — asos: Node.js 26 o'rnatilgan Alpine Linux (Docker Official Image, 1-bob). `alpine` va boshqa variantlar — 11-bobda.
2. `WORKDIR /app` — image ichida `/app` papkasi (bo'lmasa yaratiladi); keyingi ko'rsatmalar shu yerda ishlaydi.
3. `COPY package.json ./` va `COPY server.js ./` — fayllarni `/app` ga nusxalash. Nega ikki alohida qator — 9-bobda (kesh).
4. `EXPOSE 3000` — ilova 3000-portda tinglaydi degan ma'lumot (portni ochmaydi, 5-bob).
5. `CMD ["node", "server.js"]` — konteyner ishga tushganda bajariladigan buyruq.

## Yig'ish: `docker build`

Asos image'ni oldindan yuklab olamiz — build chiqishi qisqaroq bo'lsin:

```text vps
$ docker pull node:26-alpine
26-alpine: Pulling from library/node
8b2b08fc70f6: Pulling fs layer
881fc932939e: Pulling fs layer
9d08e2a19ff6: Pulling fs layer
881fc932939e: Already exists
8b2b08fc70f6: Download complete
c57b07216fc3: Download complete
07ff16b57500: Download complete
9d08e2a19ff6: Download complete
8b2b08fc70f6: Pull complete
9d08e2a19ff6: Pull complete
Digest: sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
Status: Downloaded newer image for node:26-alpine
docker.io/library/node:26-alpine
```

`881fc932939e: Already exists` — bu qatlam allaqachon diskda edi: `alpine:latest` ning asosiy qatlami (2-bobda yuklagandik). `node:26-alpine` Alpine ustiga qurilgan — qatlamlar image'lar o'rtasida qayta ishlatiladi (3-bob).

Endi yig'amiz:

```text vps
$ docker build -t salom-ilova:1 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 147B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:26-alpine
#2 DONE 0.0s

#3 [internal] load .dockerignore
#3 transferring context:
#3 transferring context: 2B done
#3 DONE 0.0s

#4 [internal] load build context
#4 transferring context: 379B done
#4 DONE 0.0s

#5 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 resolve docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 0.0s done
#5 DONE 0.1s

#5 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 extracting sha256:881fc932939efef04ca120ad44bbd2c0917851eb247aa4995428afb1e80ede17
#5 extracting sha256:881fc932939efef04ca120ad44bbd2c0917851eb247aa4995428afb1e80ede17 0.2s done
#5 DONE 0.3s

#5 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 extracting sha256:9d08e2a19ff6887ccb4cc80690394949d826093ae4fa3a156ba476f38d319316
#5 extracting sha256:9d08e2a19ff6887ccb4cc80690394949d826093ae4fa3a156ba476f38d319316 2.6s done
#5 DONE 3.0s

#5 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 extracting sha256:8b2b08fc70f63b63d92176523e536ba2ee5ab21fc52ae70e2cc1e635d9fa660a 0.0s done
#5 DONE 3.0s

#6 [2/4] WORKDIR /app
#6 DONE 0.2s

#7 [3/4] COPY package.json ./
#7 DONE 0.1s

#8 [4/4] COPY server.js ./
#8 DONE 0.0s

#9 exporting to image
#9 exporting layers
#9 exporting layers 0.2s done
#9 exporting manifest sha256:ac7c61f0369840f1737d54c84c98b9be783533d1e4803ddcd8e9cfcb7ef389c1
#9 exporting manifest sha256:ac7c61f0369840f1737d54c84c98b9be783533d1e4803ddcd8e9cfcb7ef389c1 0.0s done
#9 exporting config sha256:67c29e0509d5e377e084ca8a89fb87b169b4053d8d36cf61222f716745990478 0.0s done
#9 exporting attestation manifest sha256:88c9a0b70e93dd00a32f59f0ede1899c4fd2a4310cf1077695f3b82e6d7dd28a 0.0s done
#9 exporting manifest list sha256:f66077d9e9f7ce1f1a251318ee4f008caa2f53ab61ef462d07ed064cd84eff8f 0.0s done
#9 naming to docker.io/library/salom-ilova:1
#9 naming to docker.io/library/salom-ilova:1 done
#9 unpacking to docker.io/library/salom-ilova:1 0.1s done
#9 DONE 0.4s
```

- `docker build -t salom-ilova:1 .` — `-t` (`--tag`) image'ga nom va teg beradi; nuqta (`.`) — **build konteksti**.
- Build konteksti (Docker hujjati, Build context) — build kira oladigan fayllar to'plami. Mahalliy papka berilsa, uning barcha ichki papkalari ham kiradi; `COPY` faqat kontekst ichidagi fayllarni ko'radi. `load build context … 379B` — kontekst (bizning uch fayl) builder'ga yuborildi. Kontekstdan keraksiz fayllarni chiqarish — `.dockerignore` (9-bob; hozir `load .dockerignore … 2B` — fayl yo'q).
- `#5` … `#8` — Dockerfile ko'rsatmalari: `[1/4] FROM`, `[2/4] WORKDIR`, `[3/4] COPY`, `[4/4] COPY`. `EXPOSE` va `CMD` alohida qadam emas — ular faqat image sozlamasiga yoziladi.
- `exporting attestation manifest` — Docker hujjati (Build attestations): BuildKit image'ga standart holatda build haqidagi ma'lumotni (provenance attestation, `mode=min`) qo'shadi — image qanday va qayerdan yig'ilganini keyin tekshirish uchun.
- `naming to docker.io/library/salom-ilova:1` — to'liq nom. Image nomi tuzilishi (Docker hujjati, Build, tag, and publish): `[HOST[:PORT]/]PATH[:TAG]`; host yozilmasa — `docker.io`, nomlar maydoni (namespace) yozilmasa — `library`.

Ishga tushiramiz:

```text vps
$ docker image ls salom-ilova
IMAGE           ID             DISK USAGE   CONTENT SIZE   EXTRA
salom-ilova:1   f66077d9e9f7        251MB           63MB        
$ docker run -d --name salom -p 127.0.0.1:3000:3000 salom-ilova:1
eef0ce645b9a423a71633e14503fc353f6af4336f4ee82fea5263d9d219c6cdb
$ sleep 1; curl -s http://127.0.0.1:3000/
Salom! Node.js v26.13.0
$ docker logs salom
Tinglayapti: 3000
```

O'z image'imiz ham boshqalarnikidek ishlaydi: `docker run`, `-p`, `docker logs` — 4–5-boblardagi hamma narsa.

### Image tarixi

```text vps
$ docker image history salom-ilova:1 | head -6
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
f66077d9e9f7   2 seconds ago   CMD ["node" "server.js"]                        0B        buildkit.dockerfile.v0
<missing>      2 seconds ago   EXPOSE [3000/tcp]                               0B        buildkit.dockerfile.v0
<missing>      2 seconds ago   COPY server.js ./ # buildkit                    12.3kB    buildkit.dockerfile.v0
<missing>      2 seconds ago   COPY package.json ./ # buildkit                 12.3kB    buildkit.dockerfile.v0
<missing>      2 seconds ago   WORKDIR /app                                    8.19kB    buildkit.dockerfile.v0
```

Yuqoridagi beshta qator — **bizning** Dockerfile (pastdan yuqoriga: `WORKDIR`, ikki `COPY`, `EXPOSE`, `CMD`); ulardan pastdagilari `node:26-alpine` dan keladi. 3-bobda nginx'da ko'rganimiz kabi, `EXPOSE` va `CMD` — 0B.

### Qo'shimcha teg

`docker image tag` mavjud image'ga yangi nom beradi:

```text vps
$ docker image tag salom-ilova:1 salom-ilova:latest
$ docker image ls salom-ilova
IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
salom-ilova:1        f66077d9e9f7        251MB           63MB   U    
salom-ilova:latest   f66077d9e9f7        251MB           63MB   U    
$ docker rm -f salom
salom
```

Ikki nom, bitta ID (3-bob). Image'ni registry'ga yuborish (`push`) — 25-bobda.

## Tipik xatolar

**1. `COPY` kontekstdan tashqaridagi faylni ko'rsatadi.**
`COPY ../config.json .` — builder kontekst tashqarisini ko'rmaydi.
To'g'risi: faylni kontekst papkasiga qo'yish yoki kontekstni kattaroq papkadan berish.

**2. `docker build` oxiridagi nuqtani unutish.**
Kontekst — majburiy argument.
To'g'risi: `docker build -t nom:teg .`

**3. `EXPOSE` yozib, `-p` ni unutish.**
Port ochilmaydi (5-bob).

**4. Teg bermaslik.**
`-t` siz image nomsiz qoladi — faqat ID bilan ishlatiladi.
To'g'risi: har build'ga mazmunli teg (`ilova:1`, `ilova:2026-11-07`).

## Amaliyot

Savollar:

1. Dockerfile'dagi `RUN` va `CMD` ning farqi nima?
2. `docker build -t ilova .` dagi nuqta nimani bildiradi?
3. `docker image history` da `EXPOSE` va `CMD` nega 0B?
4. `node:26-alpine` ni yuklaganda `Already exists` nega chiqdi?
5. `-t salom-ilova:1` bilan yig'ilgan image'ning to'liq nomi qanday?

<details>
<summary>Javoblar</summary>

1. `RUN` — yig'ish paytida bajariladi va natijasi image qatlami bo'ladi; `CMD` — konteyner ishga tushganda bajariladigan standart buyruq.
2. Build konteksti — joriy papka: builder shu papkadagi fayllarni ko'radi.
3. Ular fayl o'zgartirmaydi — faqat image sozlamasiga yoziladi.
4. Alpine'ning asosiy qatlami `alpine:latest` dan allaqachon diskda edi — qatlamlar image'lar o'rtasida bo'lishiladi.
5. `docker.io/library/salom-ilova:1`.

</details>

## Rasmiy hujjat

- [Writing a Dockerfile](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/) — asosiy ko'rsatmalar
- [Build, tag, and publish an image](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/) — `docker build -t`, image nomi tuzilishi
- [Build context](https://docs.docker.com/build/concepts/context/)
- [Build attestations](https://docs.docker.com/build/metadata/attestations/) — standart provenance attestation
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases) — LTS jadvali

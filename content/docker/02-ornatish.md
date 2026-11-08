# 02 — O'rnatish

[← Oldingi: Konteyner nima](01-konteyner-nima.md) · [Mundarija](README.md) · [Keyingi: Image'lar →](03-imagelar.md)

## Tushuncha

Docker'ni ikki xil yo'l bilan olasiz:

| | Docker Desktop | Docker Engine |
| --- | --- | --- |
| Nima | Ilova: ichida Docker daemon (`dockerd`), `docker` klienti, Docker Compose, Kubernetes, Credential Helper va boshqalar (Docker overview) | Daemon (`dockerd`) va klient — Linux paketlari sifatida |
| Qayerda | macOS, Windows, Linux (ish kompyuteri) | Linux (server) |
| Konteynerlar qayerda ishlaydi | Desktop boshqaradigan Linux virtual mashinasida (1-bob) | To'g'ridan-to'g'ri server yadrosida |
| Litsenziya | Kichik biznes (250 kishidan kam **va** yillik daromad 10 mln dollardan kam), shaxsiy, ta'lim va notijorat ochiq loyihalar uchun bepul; katta kompaniyalarda tijorat maqsadida — pullik obuna | Apache License 2.0 (ochiq kod) |

Bu qo'llanmada misollar sinov VPS'idagi Docker Engine'da (README'dagi "Muhit tanlovi"), ish kompyuteringizda esa odatda Docker Desktop bo'ladi. `docker` buyruqlari ikkalasida bir xil.

## macOS'da Docker Desktop

Docker Desktop hujjati (Install on Mac) bo'yicha talablar:

- macOS'ning joriy yoki oldingi ikki asosiy versiyasidan biri;
- kamida 4 GB xotira;
- Apple silicon (M1 va undan keyingi) yoki Intel protsessorli Mac uchun alohida o'rnatuvchi.

O'rnatish:

1. Docker hujjatidagi tugma yoki reliz sahifasidan protsessoringizga mos `Docker.dmg` ni yuklab oling.
2. `Docker.dmg` ni oching va Docker belgisini **Applications** papkasiga torting. Ilova `/Applications/Docker.app` ga o'rnatiladi.
3. **Applications** dan `Docker.app` ni ishga tushiring.
4. Docker Subscription Service Agreement (obuna shartlari) chiqadi — **Accept**. Shartlarni qabul qilmasangiz, Docker Desktop ishlamaydi.
5. Docker Desktop ishga tushadi. Hujjat bo'yicha qo'shimcha sozlash kerak emas va parol so'ralmaydi.

Hujjatdagi muhim yangilik: Docker Desktop 4.89 dan boshlab standart sozlama imtiyozli (administrator) huquq talab qilmaydi — `docker` va boshqa CLI vositalari `$HOME/.docker/bin` ga o'rnatiladi va shu papka `PATH` ga qo'shiladi, standart Docker soketi (`/var/run/docker.sock`) esa yaratilmaydi. Buni **Settings → Advanced** da o'zgartirish mumkin. 4.88 va undan oldingi versiyalarda bu tanlov o'rnatish paytida so'ralardi.

Yangilash — Docker Desktop menyusidagi **Check for updates** yoki **Settings → Software updates**.

Tekshirish — terminalda:

```text sxema
docker version
docker run hello-world
```

Natija pastdagi VPS'dagiga o'xshash bo'ladi: Client va Server qismlari, so'ng `Hello from Docker!`.

## Ubuntu'da Docker Engine

Docker hujjati (Install Docker Engine on Ubuntu) bir necha usulni beradi: Docker'ning `apt` repozitoriysi, paketni qo'lda o'rnatish va "convenience script" (faqat sinov va development uchun tavsiya etiladi). Server uchun asosiy yo'l — **apt repozitoriy**: keyin `apt upgrade` bilan yangilanib turadi (Linux, 24-bob).

### Talablar

- Ubuntu'ning 64-bitli versiyasi: hujjatdagi ro'yxatda 26.10, **26.04 (LTS)**, 24.04 (LTS) va 22.04 (LTS). Bizning VPS — 26.04.
- **Firewall ogohlantirishi.** Hujjat o'rnatishdan **oldin** ogohlantiradi: ufw yoki firewalld ishlatsangiz, Docker'da ochilgan konteyner portlari firewall qoidalarini **chetlab o'tadi**. Bizning VPS'da ufw yoqilgan (Linux, 43-bob) — buni 5-bobda amalda ko'ramiz.

### 1. Eski va norasmiy paketlarni olib tashlash

Ubuntu'ning o'z omborida norasmiy Docker paketlari bor (`docker.io`, `docker-compose`, `podman-docker` va boshqalar), ular rasmiy paketlar bilan to'qnashadi. Hujjatdagi buyruq avval qaysilari o'rnatilganini topadi (`apt remove $(dpkg --get-selections … | cut -f1)`). Bizda ularning birortasi yo'q:

```text vps
$ dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc 2>&1 | cut -f1
dpkg: no packages found matching docker.io
dpkg: no packages found matching docker-compose
dpkg: no packages found matching docker-compose-v2
dpkg: no packages found matching docker-doc
dpkg: no packages found matching docker-buildx
dpkg: no packages found matching podman-docker
dpkg: no packages found matching containerd
dpkg: no packages found matching runc
```

### 2. Docker'ning apt repozitoriysi

Repozitoriyni ulash — Linux kitobining 26-bobidagi tashqi repozitoriy bilan bir xil ish: imzo kaliti va `.sources` (deb822) fayli. Hujjatdagi buyruqlar:

```text sxema
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
```

VPS'da root bilan bajardik (`sudo` kerak emas). Hosil bo'lgan fayl va repozitoriy:

```text vps
$ apt-get install -y ca-certificates curl 2>&1 | tail -2
Solving dependencies...
0 upgraded, 0 newly installed, 0 to remove and 5 not upgraded.
$ install -m 0755 -d /etc/apt/keyrings
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
$ chmod a+r /etc/apt/keyrings/docker.asc
$ cat /etc/apt/sources.list.d/docker.sources
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: resolute
Components: stable
Architectures: amd64
Signed-By: /etc/apt/keyrings/docker.asc
$ apt-get update 2>&1 | grep -i docker
Get:4 https://download.docker.com/linux/ubuntu resolute InRelease [32.5 kB]
Get:5 https://download.docker.com/linux/ubuntu resolute/stable amd64 Packages [33.1 kB]
```

- `Suites: resolute` — Ubuntu 26.04 ning kod nomi `/etc/os-release` dan olindi.
- `Signed-By:` — bu repozitoriy paketlari faqat shu kalit bilan tekshiriladi (Linux, 26-bob).

### 3. O'rnatish

```text vps
$ apt-cache policy docker-ce | head -3
docker-ce:
  Installed: (none)
  Candidate: 5:29.9.3-1~ubuntu.26.04~resolute
```

Hujjatdagi buyruq beshta paketni o'rnatadi:

```text sxema
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

| Paket | Nima |
| --- | --- |
| `docker-ce` | Docker Engine — daemon (`dockerd`) |
| `docker-ce-cli` | `docker` klienti |
| `containerd.io` | Konteynerlarni ishga tushiradigan quyi qatlam (`containerd` va `runc`) |
| `docker-buildx-plugin` | Buildx — image yig'ish vositasi (13-bob) |
| `docker-compose-plugin` | `docker compose` (15-bob) |

O'rnatilgandan keyin:

```text vps
$ dpkg-query -W docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
containerd.io	2.4.2-3~ubuntu.26.04~resolute
docker-buildx-plugin	0.38.1-1~ubuntu.26.04~resolute
docker-ce	5:29.9.3-1~ubuntu.26.04~resolute
docker-ce-cli	5:29.9.3-1~ubuntu.26.04~resolute
docker-compose-plugin	5.7.0-1~ubuntu.26.04~resolute
$ systemctl status docker --no-pager -n 0 | head -4
● docker.service - Docker Application Container Engine
     Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; preset: enabled)
     Active: active (running) since Sat 2026-11-07 21:11:39 MSK; 2s ago
 Invocation: 1289874dd28b4cca81ab1fe71b22995b
```

Docker Engine darhol ishga tushdi. apt'dagi Buildx paketi 0.38.1 — GitHub'dagi eng oxirgi relizdan (0.38.2) bitta tuzatish orqada; apt repozitoriysi yangi relizni biroz keyin oladi.

### 4. Tekshirish: hello-world

```text vps
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
4f55086f7dd0: Pulling fs layer
4f55086f7dd0: Download complete
4f55086f7dd0: Pull complete
d5e71e642bf5: Download complete
Digest: sha256:c567b231f65614688711a75f31518a064258a51d442117a3e771a3a8fdba78ef
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

`hello-world` image'i o'zi nima bo'lganini tushuntiradi — 1-bobdagi zanjirning o'zi:

1. Klient daemon'ga murojaat qildi.
2. Daemon `hello-world` image'ini Docker Hub'dan yukladi (`Pull complete`, `Digest:` — image'ning aniq identifikatori, 3-bob). `(amd64)` — serverimiz protsessori uchun varianti.
3. Daemon image'dan konteyner yaratdi va undagi dasturni ishga tushirdi.
4. Dastur chiqishini daemon klientga, klient terminalga uzatdi.

## Versiya va holat

```text vps
$ docker version
Client: Docker Engine - Community
 Version:           29.9.3
 API version:       1.56
 Go version:        go1.26.10
 Git commit:        5457199
 Built:             Tue Nov  3 21:42:07 2026
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          29.9.3
  API version:      1.56 (minimum version 1.40)
  Go version:       go1.26.10
  Git commit:       70efc0e
  Built:            Tue Nov  3 21:42:07 2026
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v2.4.2
  GitCommit:        b7a25261e029d68978bbf290df0a62fc819b3c51
 runc:
  Version:          1.5.2
  GitCommit:        v1.5.2-0-g29dd3dc2
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
$ docker info 2>/dev/null | grep -E "Server Version|Storage Driver|Cgroup (Driver|Version)|Operating System|Kernel Version|Architecture|CPUs|Total Memory|Docker Root Dir|Firewall Backend"
 Server Version: 29.9.3
 Storage Driver: overlayfs
 Cgroup Driver: systemd
 Cgroup Version: 2
 Kernel Version: 7.0.0-42-generic
 Operating System: Ubuntu 26.04.1 LTS
 Architecture: x86_64
 CPUs: 1
 Total Memory: 1.751GiB
 Docker Root Dir: /var/lib/docker
 Firewall Backend: iptables
$ docker compose version
Docker Compose version v5.7.0
$ docker buildx version
github.com/docker/buildx v0.38.1 0dbe87f36ed472fe36b6796c3f70b4210a731fc5
```

- `docker version` ikki qismdan iborat: **Client** (`docker`) va **Server** (`dockerd`). Ular boshqa-boshqa dastur — 1-bobdagi klient-server arxitekturasi. Server qismida pastki qatlamlar ham bor: `containerd`, `runc`.
- `docker info` dan bizga keraklilari: `Storage Driver: overlayfs` (image qatlamlari qanday saqlanadi, 3-bob), `Cgroup Version: 2` (resurs cheklovlari, Linux, 39-bob va bu kitobning 27-bobi), `Docker Root Dir: /var/lib/docker` (image, konteyner va volume'lar diskda shu yerda), `Firewall Backend: iptables`.

Hujjat (Linux post-installation steps): Debian va Ubuntu'da Docker servisi yonishda o'zi ishga tushadi. Tekshiramiz va xotira sarfini ko'ramiz:

```text vps
$ systemctl is-enabled docker containerd
enabled
enabled
$ ps -o rss=,comm= -C dockerd,containerd
49216 containerd
97936 dockerd
```

`enabled` — yonishda ishga tushadi (Linux, 34-bob). Hech qanday konteyner ishlamay turganda `dockerd` ~96 MiB, `containerd` ~48 MiB xotira oladi (`ps` dagi `RSS`, KiB).

## `docker` guruhi = root

Hujjat (Linux post-installation steps): Docker daemon TCP portini emas, **UNIX soketini** tinglaydi; soket egasi — root, va daemon har doim root sifatida ishlaydi. Daemon ishga tushganda soketni `docker` guruhi a'zolari uchun ochadi. Shuning uchun boshqa foydalanuvchi `docker` ni `sudo` siz ishlatishi uchun uni `docker` guruhiga qo'shish kerak.

Hujjatdagi **ogohlantirish**: `docker` guruhi foydalanuvchiga **root darajasidagi huquq** beradi. Buni ko'rsatamiz — oddiy `demo` foydalanuvchi yaratib:

```text vps
$ getent group docker
docker:x:989:
$ ls -l /var/run/docker.sock
srw-rw---- 1 root docker 0 Nov  7 21:11 /var/run/docker.sock
$ adduser --disabled-password --comment "" demo >/dev/null
$ su - demo -c "docker ps"
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
$ usermod -aG docker demo
$ su - demo -c "id"
uid=1000(demo) gid=1000(demo) groups=1000(demo),100(users),989(docker)
$ su - demo -c "head -1 /etc/shadow"
head: cannot open '/etc/shadow' for reading: Permission denied
$ su - demo -c "docker run --rm -v /etc:/h alpine head -1 /h/shadow | cut -d: -f1"
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
881fc932939e: Pulling fs layer
c35a7d82b8fa: Download complete
86ff264fe568: Download complete
881fc932939e: Download complete
881fc932939e: Pull complete
Digest: sha256:3f4d6b32e26703c6082839234f43769d5046b3ac7c910033911d1e71d8cd630a
Status: Downloaded newer image for alpine:latest
systemd-network
$ deluser --remove-home demo >/dev/null 2>&1; id demo
id: 'demo': no such user
```

1. Soket `srw-rw---- root docker` — faqat root va `docker` guruhi. Guruhsiz `demo` daemon'ga ulana olmadi.
2. Guruhga qo'shildi. `/etc/shadow` (parol xeshlari, Linux, 22-bob) ni o'zi o'qiy olmaydi — `Permission denied`.
3. Lekin konteyner orqali — o'qidi: konteynerni root huquqidagi daemon yaratadi, `-v /etc:/h` esa serverning `/etc` papkasini konteyner ichiga ulaydi (6-bob). Chiqishda faylning birinchi qatoridagi foydalanuvchi nomigina ko'rsatildi (`cut -d: -f1`) — parol xeshlari maxfiy.
4. `demo` o'chirildi.

Xulosa: `docker` guruhiga faqat root'ga ishonadigan odamni qo'shing. Hujjat boshqa yo'lni ham beradi — daemon'ning o'zini root'siz ishga tushirish (**Rootless mode**). Bu kitobda biz VPS'da root sifatida ishlaymiz (Linux, 45-bob).

## Debian va Ubuntu

Debian uchun ham xuddi shunday sahifa bor (Install Docker Engine on Debian): farq faqat repozitoriy manzilida (`…/linux/debian`). Bu kitobdagi barcha misollar Ubuntu 26.04 dagi Docker Engine'da.

## Tipik xatolar

**1. Ubuntu'ning `docker.io` paketini o'rnatish.**
U Docker'ning rasmiy paketi emas va rasmiy paketlar bilan to'qnashadi.
To'g'risi: Docker'ning apt repozitoriysidan `docker-ce` (yoki Docker Desktop).

**2. `permission denied while trying to connect to the docker API`.**
Foydalanuvchi `docker` guruhida emas.
To'g'risi: `sudo docker …`, yoki — xavfini bilgan holda — `usermod -aG docker FOYDALANUVCHI` va qayta kirish.

**3. `docker` guruhini "zararsiz" deb hisoblash.**
Guruh a'zosi konteyner orqali butun serverga root bo'la oladi.
To'g'risi: guruhga faqat ishonchli administratorlar; yoki Rootless mode.

**4. Firewall ogohlantirishini o'tkazib yuborish.**
`-p` bilan ochilgan port ufw qoidasiga qaramay internetga ochiq bo'ladi.
To'g'risi: 5-bob.

## Amaliyot

Savollar:

1. Serverga Docker Desktop emas, Docker Engine o'rnatiladi. Nega?
2. `docker version` nega ikki qism (Client va Server) ko'rsatadi?
3. `docker ps` yozdingiz: `permission denied while trying to connect to the docker API`. Sababi nima?
4. Foydalanuvchini `docker` guruhiga qo'shish nega xavfli?
5. VPS qayta yonsa, Docker o'zi ishga tushadimi va buni qanday tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Desktop — ish kompyuteri uchun ilova (Linux VM, grafik interfeys). Linux serverda konteynerlar to'g'ridan-to'g'ri yadroda ishlaydi — Engine yetarli.
2. Docker — klient-server: `docker` klienti va `dockerd` daemon'i boshqa-boshqa dasturlar, versiyalari alohida ko'rsatiladi.
3. Soket faqat root va `docker` guruhi uchun ochiq; foydalanuvchi guruhda emas.
4. Guruh a'zosi daemon orqali konteyner ishga tushiradi, daemon esa root — konteynerga serverning istalgan faylini ulash mumkin.
5. Ha (Ubuntu'da standart): `systemctl is-enabled docker` → `enabled`.

</details>

## Rasmiy hujjat

- [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/) — talablar, o'rnatish, litsenziya shartlari
- [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) — talablar, firewall ogohlantirishi, apt repozitoriy, tekshirish
- [Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/) — `docker` guruhi, yonishda ishga tushish
- [Rootless mode](https://docs.docker.com/engine/security/rootless/) — daemon'ni root'siz ishga tushirish
- [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)

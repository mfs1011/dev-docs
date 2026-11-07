# Docker — konteynerlar, Compose va deploy

Bu qo'llanma Docker'ni dasturchi ko'zi bilan o'rgatadi: konteyner va image nima, ilovani Dockerfile bilan qanday qadoqlash, bir nechta servisni Compose bilan qanday birga ishga tushirish, framework'lar uchun tayyor sozlamalar va image'ni CI orqali serverga yetkazish.

Mundarija Docker'ning rasmiy hujjati (docs.docker.com) tuzilmasiga solishtirib tuzilgan: "Get started" (Docker concepts), Engine, Build, Compose va Guides bo'limlari. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Har Dockerfile va `compose.yaml` haqiqiy build va ishga tushirish bilan tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Docker Engine | 29.9.3 (2026-11-03) | <https://docs.docker.com/engine/release-notes/> |
| Docker Desktop | 4.98.0 (2026-11-03) | <https://docs.docker.com/desktop/release-notes/> |
| Docker Compose | v5.7.0 (2026-11-02) | <https://github.com/docker/compose/releases> |
| Buildx | v0.38.2 (2026-11-03) | <https://github.com/docker/buildx/releases> |
| Ubuntu (VPS) | 26.04 LTS — Docker Engine o'rnatish hujjatida qo'llab-quvvatlanadigan versiyalar ro'yxatida bor | <https://docs.docker.com/engine/install/ubuntu/> |

Muhit tanlovi haqida:

- **Noutbuk (macOS, Apple silicon) — Docker Desktop.** Ishlab chiqish (development) boblari shu yerda: Desktop macOS uchun rasmiy yo'l ([Install on Mac](https://docs.docker.com/desktop/setup/install/mac-install/)).
- **Sinov VPS (Ubuntu 26.04) — Docker Engine.** Server boblari (o'rnatish, deploy, restart policy, firewall) shu yerda: serverda Desktop emas, Engine ishlatiladi ([Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)). VPS'da 2 GB xotira — misollar shunga mos tanlanadi.

"Muhit" ustunida:

- **M** — noutbukda (Docker Desktop).
- **V** — VPS'da (Docker Engine, Ubuntu 26.04).
- **M+V** — ikkalasida; farq bo'lsa, bobda ikkala chiqish.
- **—** — tushuncha bobi.

Qisqartmalar:

- **GS** — Get started: Docker concepts (docs.docker.com/get-started).
- **EN** — Docker Engine qo'llanmasi (docs.docker.com/engine).
- **BD** — Docker Build qo'llanmasi (docs.docker.com/build).
- **CO** — Docker Compose qo'llanmasi (docs.docker.com/compose).
- **RF** — ma'lumotnoma (reference): Dockerfile, Compose fayli, CLI.
- **GD** — Docker Guides (docs.docker.com/guides): tillar va framework'lar uchun.

Bu qo'llanmaga kirmaydigan mavzular:

- Linux asoslari — namespace, cgroup, jarayonlar, servislar — **"Linux"** kitobida (28, 31, 39-boblar).
- Kubernetes va Docker Swarm — alohida katta mavzu. Docker hujjatida Kubernetes faqat Docker Desktop ichidagi sinov klasteri sifatida bor ([Desktop: Kubernetes](https://docs.docker.com/desktop/use-desktop/kubernetes/)).
- Nuxt — Docker hujjatida u uchun qo'llanma yo'q; Node.js va Next.js qo'llanmalaridagi tamoyillar unga ham taalluqli.
- Serverni himoyalash (SSH, firewall, fail2ban) — **"Server xavfsizligi"** kitobida; Docker portlari va firewall bog'liqligi esa shu kitobning 5-bobida.

> **Holat.** Qo'llanma yozilmoqda: 1/28 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar va fayllar** — haqiqiy build va ishga tushirish, **haqiqiy** chiqishlar.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Tushunchalar (1–6)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Konteyner nima](01-konteyner-nima.md) | Konteyner va virtual mashina farqi; image, konteyner, registry; Docker arxitekturasi: klient, daemon (`dockerd`), registry | — | [GS Docker overview](https://docs.docker.com/get-started/docker-overview/) · [GS What is a container](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) · [GS What is an image](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) · [GS What is a registry](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/) |
| 02 | O'rnatish | macOS'da Docker Desktop; Ubuntu'da Docker Engine (rasmiy apt repozitoriy); o'rnatishdan keyin: `docker` guruhi va u root huquqiga teng ekani; birinchi `docker run hello-world`; `docker version`, `docker info` | M+V | [Install Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/) · [EN Install on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) · [EN Linux post-installation](https://docs.docker.com/engine/install/linux-postinstall/) |
| 03 | Image'lar | Registry va Docker Hub; repozitoriy, teg, digest; qatlamlar (layers); `pull`, `images`, `image history`, `image inspect` | M | [GS Understanding image layers](https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/) · [GS What is a registry](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/) · [Docker Hub](https://docs.docker.com/docker-hub/) |
| 04 | Konteynerlar bilan ishlash | `run` (`-d`, `--name`, `--rm`, `-it`), `ps`, `logs`, `exec`, `stop`, `start`, `rm`; konteyner hayot sikli; standart qiymatlarni almashtirish | M | [RF docker container run](https://docs.docker.com/reference/cli/docker/container/run/) · [EN Running containers](https://docs.docker.com/engine/containers/run/) · [GS Overriding container defaults](https://docs.docker.com/get-started/docker-concepts/running-containers/overriding-container-defaults/) |
| 05 | Portlar, muhit o'zgaruvchilari va firewall | `-p` (va `127.0.0.1:` bilan cheklash), `-e`, `--env-file`; Docker ochgan port `ufw` qoidalarini chetlab o'tadi — `DOCKER-USER` zanjiri | M+V | [GS Publishing ports](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/) · [EN Port publishing](https://docs.docker.com/engine/network/port-publishing/) · [EN Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) |
| 06 | Ma'lumot saqlash | Konteyner o'chsa ma'lumot yo'qoladi; volume, bind mount, tmpfs — qachon qaysi; `docker volume` | M | [GS Persisting container data](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/) · [GS Sharing local files](https://docs.docker.com/get-started/docker-concepts/running-containers/sharing-local-files/) · [EN Volumes](https://docs.docker.com/engine/storage/volumes/) · [EN Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/) · [EN tmpfs](https://docs.docker.com/engine/storage/tmpfs/) |

## II qism — Dockerfile (7–14)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 07 | Birinchi Dockerfile | `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`; build konteksti; `docker build -t`; build → run | M | [GS Writing a Dockerfile](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/) · [GS Build, tag, and publish](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/) · [BD Build context](https://docs.docker.com/build/concepts/context/) · [RF Dockerfile](https://docs.docker.com/reference/dockerfile/) |
| 08 | `CMD` va `ENTRYPOINT` | Exec va shell shakllari; ikkalasi birga; signallar va PID 1 — nega shell shaklida `docker stop` 10 soniya kutadi | M | [RF Dockerfile: CMD, ENTRYPOINT](https://docs.docker.com/reference/dockerfile/#entrypoint) · [BD Best practices](https://docs.docker.com/build/building/best-practices/) |
| 09 | Build kesh | Qatlam keshi qanday ishlaydi va qachon buziladi; instruksiyalar tartibi; `.dockerignore` | M | [GS Using the build cache](https://docs.docker.com/get-started/docker-concepts/building-images/using-the-build-cache/) · [BD Cache invalidation](https://docs.docker.com/build/cache/invalidation/) · [BD Optimize cache usage](https://docs.docker.com/build/cache/optimize/) · [BD Build context: .dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files) |
| 10 | Multi-stage build | Build bosqichi va yakuniy bosqich; `COPY --from`; `--target` | M | [GS Multi-stage builds](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/) · [BD Multi-stage](https://docs.docker.com/build/building/multi-stage/) |
| 11 | Base image tanlash | Rasmiy (Docker Official) image'lar; `alpine` va `slim`; distroless; o'z base image'ingiz | M | [BD Base images](https://docs.docker.com/build/building/base-images/) · [BD Best practices](https://docs.docker.com/build/building/best-practices/) · [DHI: distroless](https://docs.docker.com/dhi/explore/security-concepts/distroless/) |
| 12 | Xavfsiz image | Root'siz foydalanuvchi (`USER`); sirlarni build'ga qo'shmaslik — secret mount; zaifliklarni skanerlash (Docker Scout) | M | [BD Best practices: USER](https://docs.docker.com/build/building/best-practices/#user) · [BD Build secrets](https://docs.docker.com/build/building/secrets/) · [Docker Scout quickstart](https://docs.docker.com/scout/quickstart/) |
| 13 | BuildKit imkoniyatlari | Builder'lar; cache mount (`RUN --mount=type=cache`); multi-platform image (`amd64` + `arm64`) va `buildx` | M | [BD BuildKit](https://docs.docker.com/build/buildkit/) · [BD Optimize cache usage](https://docs.docker.com/build/cache/optimize/) · [BD Multi-platform](https://docs.docker.com/build/building/multi-platform/) · [BD Builders](https://docs.docker.com/build/builders/) |
| 14 | Image hajmini kamaytirish | O'lchash: `docker images`, `image history`; choralar: multi-stage, kichik base, keraksiz fayllar, qatlamlarni birlashtirish | M | [BD Best practices](https://docs.docker.com/build/building/best-practices/) · [RF docker image history](https://docs.docker.com/reference/cli/docker/image/history/) |

## III qism — Docker Compose (15–20)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 15 | Compose asoslari | Nega Compose; `compose.yaml`: servislar, image va build; `up`, `down`, `ps`, `logs`; loyiha nomi | M | [GS What is Docker Compose](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/) · [CO Application model](https://docs.docker.com/compose/intro/compose-application-model/) · [CO Quickstart](https://docs.docker.com/compose/gettingstarted/) · [RF Services](https://docs.docker.com/reference/compose-file/services/) |
| 16 | Tarmoq | Servislar bir-biriga nom bilan ulanadi; standart tarmoq; o'z tarmoqlari; bridge drayveri | M | [CO Networking](https://docs.docker.com/compose/how-tos/networking/) · [EN Networking overview](https://docs.docker.com/engine/network/) · [EN Bridge driver](https://docs.docker.com/engine/network/drivers/bridge/) · [RF Networks](https://docs.docker.com/reference/compose-file/networks/) |
| 17 | Ishga tushish tartibi va healthcheck | `depends_on` faqat tartib beradi, tayyorlikni emas; `healthcheck` va `condition: service_healthy` | M | [CO Startup order](https://docs.docker.com/compose/how-tos/startup-order/) · [RF Services: healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck) |
| 18 | Lokal ishlab chiqish muhiti | Bind mount bilan kodni ulash; `compose watch` (sync, rebuild); `.env` va o'zgaruvchilar | M | [CO File watch](https://docs.docker.com/compose/how-tos/file-watch/) · [CO Environment variables](https://docs.docker.com/compose/how-tos/environment-variables/) · [RF Develop](https://docs.docker.com/reference/compose-file/develop/) |
| 19 | Profillar va bir nechta fayl | `profiles`; `compose.override.yaml`; `-f` bilan birlashtirish; `include`, `extends` | M | [CO Profiles](https://docs.docker.com/compose/how-tos/profiles/) · [CO Multiple Compose files](https://docs.docker.com/compose/how-tos/multiple-compose-files/) · [CO Merge](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/) |
| 20 | Tipik stack: Nginx + PHP-FPM + PostgreSQL + Redis | Docker'ning Laravel qo'llanmasidagi to'plam qismma-qism: har servis nima uchun, ular qanday bog'lanadi, ma'lumot qayerda saqlanadi | M | [GD Laravel](https://docs.docker.com/guides/laravel/) · [GD Databases](https://docs.docker.com/guides/databases/) |

## IV qism — Framework'lar uchun (21–24)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 21 | PHP: Laravel va Symfony | PHP-FPM image, kengaytmalar, development va production bosqichlari; Symfony'ning o'z Docker yondashuvi | M | [GD PHP](https://docs.docker.com/guides/php/) · [GD Laravel](https://docs.docker.com/guides/laravel/) · [Symfony: Using Docker](https://symfony.com/doc/current/setup/docker.html) |
| 22 | Node.js va Next.js | Node API'ni konteynerga joylash, ma'lumotlar bazasi bilan; Next.js `standalone` build | M | [GD Node.js](https://docs.docker.com/guides/nodejs/) · [GD Next.js](https://docs.docker.com/guides/nextjs/) |
| 23 | SPA: React, Vue, Angular | Statik build + Nginx; SPA marshrutlari uchun fallback | M | [GD React.js](https://docs.docker.com/guides/reactjs/) · [GD Vue.js](https://docs.docker.com/guides/vuejs/) · [GD Angular](https://docs.docker.com/guides/angular/) |
| 24 | Ma'lumotlar bazasi konteynerda | Rasmiy DB image'lari, volume, boshlang'ich ma'lumot (pre-seeding); zaxira va tiklash | M | [GD Databases](https://docs.docker.com/guides/databases/) · [GD Pre-seeding](https://docs.docker.com/guides/pre-seeding/) · [EN Volumes: back up, restore](https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes) |

## V qism — Production (25–28)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 25 | Registry va teglash | Docker Hub va GitHub Container Registry (GHCR); `tag`, `push`; teg strategiyasi | M+V | [GS Build, tag, and publish](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/) · [Docker Hub: Push images](https://docs.docker.com/docker-hub/repos/manage/hub-images/push/) · [Docker Hub: Tags](https://docs.docker.com/docker-hub/repos/manage/hub-images/tags/) · [GitHub: Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) |
| 26 | CI'da Docker | GitHub Actions: build, kesh, teg va label'lar, push; push'dan oldin test | — | [BD GitHub Actions](https://docs.docker.com/build/ci/github-actions/) · [BD GHA: Cache](https://docs.docker.com/build/ci/github-actions/cache/) · [BD GHA: Tags and labels](https://docs.docker.com/build/ci/github-actions/manage-tags-labels/) · [BD GHA: Test before push](https://docs.docker.com/build/ci/github-actions/test-before-push/) |
| 27 | Serverga deploy | Bitta serverda Compose; restart policy; resurs cheklovlari; loglar va ularning hajmi; Compose production uchun | V | [CO Use Compose in production](https://docs.docker.com/compose/how-tos/production/) · [EN Start containers automatically](https://docs.docker.com/engine/containers/start-containers-automatically/) · [EN Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) · [EN Configure logging drivers](https://docs.docker.com/engine/logging/configure/) |
| 28 | Muammolarni topish va tozalash | `inspect`, `logs`, `stats`, `exec`; disk joyi — `system df`, `prune`; daemon muammolari | M+V | [RF docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/) · [RF docker container stats](https://docs.docker.com/reference/cli/docker/container/stats/) · [RF docker system df](https://docs.docker.com/reference/cli/docker/system/df/) · [EN Prune](https://docs.docker.com/engine/manage-resources/pruning/) · [EN Troubleshoot the daemon](https://docs.docker.com/engine/daemon/troubleshoot/) |

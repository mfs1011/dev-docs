# Docker — konteynerlar, Compose va deploy

Lokal muhitni hamma uchun bir xil qilish, ilovani konteynerga joylash, CI va deploy'da ishlatish. Har Dockerfile haqiqiy build bilan tekshiriladi.

Rasmiy manba: <https://docs.docker.com/>. Versiyalar har bobni yozishdan oldin tekshiriladi va shu yerda jadval sifatida beriladi.

> **Holat.** Qo'llanma tayyorlanmoqda — quyida rejalashtirilgan mundarija.

---

## I qism — Tushunchalar (1–6)

| # | Bob | Mazmun |
| --- | --- | --- |
| 01 | Konteyner nima *(tayyorlanmoqda)* | VM bilan farqi, image vs container, nega kerak |
| 02 | O'rnatish *(tayyorlanmoqda)* | Docker Desktop / Engine, OrbStack (macOS), birinchi `docker run` |
| 03 | Image'lar *(tayyorlanmoqda)* | Registry, teglar, qatlamlar (layers), `pull`, `images` |
| 04 | Konteynerlar bilan ishlash *(tayyorlanmoqda)* | `run`, `ps`, `logs`, `exec`, `stop`, `rm`, hayot sikli |
| 05 | Portlar va muhit o'zgaruvchilari *(tayyorlanmoqda)* | `-p`, `-e`, `--env-file` |
| 06 | Ma'lumot saqlash *(tayyorlanmoqda)* | Volume, bind mount, tmpfs — qachon qaysi |

## II qism — Dockerfile (7–14)

| # | Bob | Mazmun |
| --- | --- | --- |
| 07 | Birinchi Dockerfile *(tayyorlanmoqda)* | `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD` |
| 08 | `CMD` vs `ENTRYPOINT` *(tayyorlanmoqda)* | Farqi, exec shakli, signallar |
| 09 | Build kesh *(tayyorlanmoqda)* | Qatlamlar tartibi, `.dockerignore` |
| 10 | Multi-stage build *(tayyorlanmoqda)* | Kichik production image |
| 11 | Base image tanlash *(tayyorlanmoqda)* | `alpine`, `slim`, distroless — trade-off |
| 12 | Xavfsiz image *(tayyorlanmoqda)* | Root'siz foydalanuvchi, sirlarsiz build, skanerlash |
| 13 | BuildKit imkoniyatlari *(tayyorlanmoqda)* | Cache mount, secret mount, multi-platform (`buildx`) |
| 14 | Image hajmini kamaytirish *(tayyorlanmoqda)* | O'lchash va choralar |

## III qism — Docker Compose (15–20)

| # | Bob | Mazmun |
| --- | --- | --- |
| 15 | Compose asoslari *(tayyorlanmoqda)* | `compose.yaml`, servislar, `up/down` |
| 16 | Tarmoq *(tayyorlanmoqda)* | Servislararo nom bilan ulanish, tarmoqlar |
| 17 | Bog'liqliklar va healthcheck *(tayyorlanmoqda)* | `depends_on`, `healthcheck`, tayyorlikni kutish |
| 18 | Lokal ishlab chiqish muhiti *(tayyorlanmoqda)* | Hot reload, bind mount, `compose watch` |
| 19 | Profillar va bir nechta fayl *(tayyorlanmoqda)* | dev/test/prod, `override` |
| 20 | Tipik stack'lar *(tayyorlanmoqda)* | PHP-FPM + Nginx + PostgreSQL + Redis; Node + PostgreSQL |

## IV qism — Framework'lar uchun (21–24)

| # | Bob | Mazmun |
| --- | --- | --- |
| 21 | Symfony/Laravel konteynerda *(tayyorlanmoqda)* | FPM, OPcache, migratsiya, queue worker |
| 22 | Node, Next.js, Nuxt konteynerda *(tayyorlanmoqda)* | `standalone` build, SSR server |
| 23 | SPA (Vue/React/Angular) *(tayyorlanmoqda)* | Statik build + Nginx, SPA fallback |
| 24 | Ma'lumotlar bazasi konteynerda *(tayyorlanmoqda)* | Lokal — ha, production — ehtiyot; zaxira |

## V qism — Production (25–28)

| # | Bob | Mazmun |
| --- | --- | --- |
| 25 | Registry va teglash *(tayyorlanmoqda)* | Docker Hub, GHCR, teg strategiyasi (sha, semver) |
| 26 | CI'da Docker *(tayyorlanmoqda)* | GitHub Actions: build, kesh, push |
| 27 | Deploy *(tayyorlanmoqda)* | Bitta server (compose), logs, restart policy, resurs limitlari; Kubernetes haqida tushuncha |
| 28 | Muammolarni hal qilish va checklist *(tayyorlanmoqda)* | `inspect`, `stats`, tipik xatolar, production ro'yxati |

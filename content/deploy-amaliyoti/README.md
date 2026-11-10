# Deploy amaliyoti — domendan nol to'xtovli deploy'gacha

Bu qo'llanma oldingi kitoblarda o'rganilganlarni bitta jarayonga bog'laydi: domenni serverga ulash, ilovani serverda birinchi marta qo'lda ishga tushirish, release'larni tartibli joylash, GitHub Actions bilan har push'da test va avtomatik deploy, ilovani to'xtatmasdan yangilash (nol to'xtovli deploy), orqaga qaytarish va deploydan keyingi tekshiruv.

Bu amaliy kitob. Har bob bir nechta rasmiy hujjatdagi qismlarni birlashtiradi: GitHub Actions, systemd, nginx, Docker, OpenSSH va Linux man sahifalari. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| GitHub Actions | GitHub'ning joriy hujjati | <https://docs.github.com/en/actions> |
| nginx | Mainline 1.31.8 | `content/nginx/README.md` |
| systemd | VPS'da 259 | `content/linux/README.md` |
| Docker | Ubuntu 26.04 da `docker.io` 29.1.3, `docker-compose-v2` 2.40.3 (universe). Rasmiy versiyalar "Docker" kitobida tekshiriladi | VPS: `apt-cache policy docker.io docker-compose-v2` |
| Node.js / npm | VPS'da 26.13.0 / 11.20.0 (2026-11-10) | VPS: `node -v`, `npm -v` |
| PHP / Composer | VPS'da 8.5.4 / 2.11.1 (2026-11-10) | VPS: `php -v`, `composer --version` |
| Sinov VPS | Ubuntu 26.04 LTS | — |

Muhit tanlovi haqida:

- **GitHub'da sinov repozitoriysi kerak.** GitHub Actions boblari haqiqiy repozitoriyda, haqiqiy sirlar (secrets) bilan sinaladi. Repozitoriy egasi bilan kelishib ochiladi.
- **HTTPS uchun domen kerak** — "Nginx va HTTPS" kitobidagi kabi.
- **Kitob ketma-ketligi.** "Linux", "Server xavfsizligi" va "Nginx va HTTPS" kitoblaridagi asoslar bu yerda qaytarilmaydi, faqat havola beriladi.

Qisqartmalar:

- **GH** — GitHub hujjati (docs.github.com).
- **SD** — systemd man sahifalari (freedesktop.org).
- **NG** — nginx.org hujjati.
- **DK** — Docker hujjati.
- **SSH** — OpenSSH qo'llanmalari (man.openbsd.org).
- **MAN** — Linux man-pages (man7.org).
- **GNU** — GNU Coreutils qo'llanmasi.

"Muhit" ustunida:

- **V** — VPS'da sinaladi.
- **V+D** — VPS va unga yo'naltirilgan domen.
- **G** — GitHub'dagi sinov repozitoriysida (GitHub Actions).
- **G+V** — GitHub Actions'dan VPS'ga.
- **—** — tushuncha bobi.

⚑ belgisi: bobdagi har bir buyruq va sozlama rasmiy manbadan olingan, lekin ularning ketma-ketligi yoki birikmasi sinalgan amaliyot, rasmiy hujjatda bitta joyda yozilmagan. Bu kitobda bunday boblar ko'p — deploy aynan turli vositalarni bog'lash.

Bu qo'llanmaga kirmaydigan mavzular:

- Ma'lumotlar bazasi sxemasini to'xtovsiz o'zgartirish (expand/contract kabi usullar) — umumiy rasmiy manba topilmadi, kiritilmadi.
- Kubernetes va bulut platformalari (AWS, GCP, Azure) — alohida katta mavzu.
- Docker'ning o'zi — **"Docker"** kitobida.

> **Holat.** Qo'llanma yozilmoqda: 9/22 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — nima qilamiz va nega, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Qadamlar** — VPS yoki GitHub Actions'da bajarilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Tayyorgarlik (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Deploy nima](01-deploy-nima.md) | Kodni repozitoriydan serverga yetkazish, ishga tushirish va eski versiyani almashtirish. Qo'lda deploy va uzluksiz deploy (continuous deployment). "Nol to'xtovli" nimani anglatadi | — | [GH Continuous deployment](https://docs.github.com/en/actions/get-started/continuous-deployment) · [GH Understand GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions) |
| 02 | ⚑ Domenni serverga ulash | Domen sotuvchisining (registrar) panelida A va AAAA yozuvlari, TTL. `dig` bilan yozuv tarqalganini tekshirish | V+D | [MDN What is a Domain Name?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name) · [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035) |
| 03 | ⚑ Serverni tayyorlash | Deploy uchun alohida foydalanuvchi, SSH kalit, firewall'da 22, 80 va 443-portlar | V | [UB User management](https://ubuntu.com/server/docs/how-to/security/user-management/) · [UB OpenSSH server](https://ubuntu.com/server/docs/how-to/security/openssh-server/) · [UB Firewalls](https://ubuntu.com/server/docs/how-to/security/firewalls/) |
| 04 | ⚑ Birinchi deploy qo'lda | Repozitoriyni deploy key bilan olish, bog'liqliklarni o'rnatish, ilovani systemd servisi qilish, nginx ortiga qo'yish va HTTPS'ni yoqish | V+D | [GH Managing deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) · [SD systemd.service(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) · [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) |

## II qism — Release tuzilishi (5–8)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [⚑ Release papkalari va symlink](05-release-symlink.md) | Har versiya alohida papkada, `current` — oxirgisiga symlink. Symlink'ni atomik almashtirish: `rename(2)` mavjud nomni bir zumda almashtiradi, oraliq holat bo'lmaydi (`mv -T`). Eski release'larni tozalash | V | [MAN rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html) · [GNU mv invocation](https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html) |
| 06 | [Bog'liqliklar va build](06-boglanish-build.md) | `npm ci` (lock-fayldan aniq o'rnatish), `composer install --no-dev`. Build serverda yoki CI'da; tayyor natijani (artifact) uzatish | V | [npm ci](https://docs.npmjs.com/cli/commands/npm-ci) · [Composer CLI → install](https://getcomposer.org/doc/03-cli.md#install-i) · [GH Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts) |
| 07 | [Konfiguratsiya va sirlar](07-sozlama-sirlar.md) | `.env` serverda turadi, repozitoriyda emas. `EnvironmentFile=` va fayl ruxsatlari | V | [SD systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) · [GH Secrets](https://docs.github.com/en/actions/concepts/security/secrets) |
| 08 | [Restart va reload](08-restart-reload.md) | `systemctl restart` va `reload` farqi. nginx'ning `HUP` signali: yangi worker'lar yangi sozlama bilan ishga tushadi, eskilari ishini tugatib chiqadi | V | [NG Controlling nginx](https://nginx.org/en/docs/control.html) · [SD systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) |

## III qism — GitHub Actions (9–15)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 09 | GitHub Actions asoslari | Workflow, hodisa (event), job, step, runner. Birinchi workflow | G | [GH Understand GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions) · [GH Quickstart](https://docs.github.com/en/actions/get-started/quickstart) · [GH Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) |
| 10 | Har push'da test | Node.js loyihasini build qilish va test. Bog'liqliklarni keshlash. Qaysi hodisada ishga tushadi | G | [GH Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) · [GH Dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) · [GH Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) |
| 11 | Sirlar va o'zgaruvchilar | `secrets` va `vars`. `GITHUB_TOKEN` va uning ruxsatlarini cheklash | G | [GH Use secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) · [GH Variables](https://docs.github.com/en/actions/concepts/workflows-and-actions/variables) · [GH GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token) |
| 12 | Muhitlar | `production` muhiti, himoya qoidalari (masalan, qo'lda tasdiqlash), muhitga tegishli sirlar | G | [GH Deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments) · [GH Manage environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) · [GH Deploy to environment](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/deploy-to-environment) |
| 13 | ⚑ Serverga SSH orqali deploy | Runner'dan VPS'ga `ssh` yoki `rsync`. Faqat deploy foydalanuvchisiga ruxsatli kalit, `authorized_keys` cheklovlari. Server kalitini (`known_hosts`) tekshirish | G+V | [GH Use secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) · [SSH ssh(1)](https://man.openbsd.org/ssh) · [SSH sshd(8) → AUTHORIZED_KEYS](https://man.openbsd.org/sshd.8#AUTHORIZED_KEYS_FILE_FORMAT) |
| 14 | Bir vaqtda ikki deploy bo'lmasin | `concurrency` guruhlari, `cancel-in-progress` | G | [GH Concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency) · [GH Control workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) |
| 15 | Workflow xavfsizligi | Skript ichiga begona matn kirib qolishi (script injection). Tashqi action'ni aniq commit'ga bog'lash. Eng kam ruxsatlar | G | [GH Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) · [GH Script injections](https://docs.github.com/en/actions/concepts/security/script-injections) |

## IV qism — Nol to'xtovli deploy (16–20)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 16 | [⚑ To'xtash qayerdan keladi](16-toxtash.md) | Ilova qayta ishga tushayotganda kelgan so'rovlar: 502 xatosi. Uni o'lchash: deploy paytida uzluksiz so'rovlar yuborib, javoblarni sanash | V | [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) · [SD systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) |
| 17 | [⚑ Ikki nusxa va nginx](17-ikki-nusxa.md) | Ilovaning ikki nusxasi ikki portda. Yangisi tayyor ekanini tekshirib, nginx `upstream` ni almashtirish va reload qilish | V | [NG upstream module](https://nginx.org/en/docs/http/ngx_http_upstream_module.html) · [NG Using nginx as HTTP load balancer](https://nginx.org/en/docs/http/load_balancing.html) · [NG Controlling nginx](https://nginx.org/en/docs/control.html) |
| 18 | [systemd socket activation](18-socket-activation.md) | Portni systemd ochib turadi, ilova qayta ishga tushganda yangi ulanishlar kutib turadi. `daemon(7)`: holatsiz protokollarda bunday servis bitta so'rovni ham yo'qotmasdan qayta ishga tushishi mumkin. HTTP'da sinab ko'ramiz | V | [SD systemd.socket(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.socket.html) · [SD daemon(7)](https://www.freedesktop.org/software/systemd/man/latest/daemon.html) · [SD sd_listen_fds(3)](https://www.freedesktop.org/software/systemd/man/latest/sd_listen_fds.html) |
| 19 | Docker Compose bilan deploy | Image'ni CI'da yig'ib, GitHub Container Registry'ga yuklash. Serverda `docker compose up --no-deps -d`: hujjatga ko'ra bu servisni to'xtatib, qayta yaratadi — qisqa to'xtash shundan | G+V | [DK Use Compose in production](https://docs.docker.com/compose/how-tos/production/) · [GH Publishing Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images) · [GH Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) |
| 20 | [⚑ Orqaga qaytarish](20-orqaga-qaytarish.md) | `current` symlink'ni oldingi release'ga qaytarish, oldingi image tegi. Nima qaytmaydi: bazadagi o'zgarishlar | V | [MAN rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html) · [GH View deployment history](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/view-deployment-history) |

## V qism — Deploydan keyin (21–22)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 21 | ⚑ Tekshiruv va kuzatish | Holatni tekshirish manzili (health endpoint), deploydan keyingi tezkor sinov. Loglar: `journalctl -u`, nginx loglari. GitHub'dagi deploy tarixi | G+V | [SD journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) · [NG log module](https://nginx.org/en/docs/http/ngx_http_log_module.html) · [GH View deployment history](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/view-deployment-history) |
| 22 | ⚑ Push'dan production'gacha | Butun kitobni bog'lovchi yakuniy loyiha: push → test → build → deploy → tekshiruv → kerak bo'lsa orqaga qaytarish | G+V | Oldingi boblardagi manbalar |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 05 | `current` symlink yangi release'ga atomik o'tadi: o'tish paytida ham har so'rov to'liq versiyani ko'radi |
| 16 | Oddiy restart'da so'rovlar uzilishi va 502 |
| 17 | Ikki nusxa: yangisi tayyor bo'lgach nginx trafikni unga o'tkazadi, eskisi joriy so'rovlarni tugatadi |
| 18 | Socket activation: ilova qayta ishga tushganda ulanishlar systemd ushlab turgan socket'da kutadi |

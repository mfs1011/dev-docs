# Nginx trenajori

Saytdagi `/nginx/trenajor` sahifasi: brauzerda (v86) haqiqiy Debian 12 va nginx 1.31.8, yonida "So'rov yo'li" sxemasi.

## Qanday ishlaydi

- **Tasvir** Linux trenajori quvurining `nginx` profili bilan yig'iladi (`linux-trenajor/scripts`, `TRENAJOR_PROFIL=nginx`):
  `profil.json` — qo'shimcha Debian paketlari, nginx arxivi va v86 parametrlari; `ildiz/` — fayl tizimiga qo'shiladigan
  fayllar; `ildiz/linux-trenajor/qoshimcha.sh` — 2-bosqich oxirida emulyator ichida bajariladi.
- **nginx** Debian 12 i386 konteynerida nginx.org manba arxividan yig'iladi (`scripts/nginx-yigish.sh`): nginx.org
  paketidagi `configure` parametrlari, `--with-control-api` siz, `--with-debug` bilan. Konfiguratsiya fayllari
  (`nginx.conf`, `conf.d/default.conf`, `nginx.service` …) — nginx.org paketining (1.31.8-1~resolute) o'zinikidan.
- **Sxema ma'lumoti** nginx'ning o'zidan:
  - `nginx.service.d/trenajor.conf` — nginx `-g "error_log /run/nginx-kuzatuv/debug.log debug;"` bilan ishga tushadi;
  - `conf.d/trenajor-kuzatuv.conf` — qo'shimcha JSON access log (`$server_name`, `$upstream_addr`, `$upstream_cache_status` …);
  - `nginx-kuzatuv` servisi ikkala log'dan kerakli qatorlarni ikkinchi serial portga (`/dev/ttyS1`, v86 `uart1`) yuboradi;
  - sahifada `src/nginx/kuzatuv.js` ularni so'rovlarga yig'adi (debug'dagi `*N` = access log'dagi `$connection`),
    `src/nginx/SorovYoli.vue` chizadi.
- **Backend** — `ilova.service`: alohida nginx nusxasi (`/etc/ilova/nginx.conf`), 127.0.0.1:8081–8083 da qaysi port
  javob berganini va kelgan sarlavhalarni qaytaradi.
- **Mashqlar** — `src/nginx/mashqlar.js` (format Linux trenajoriniki bilan bir xil). `check` ichidagi `curl` lar
  `-A trenajor-tekshiruv` bilan — bunday so'rovlar sxemada ko'rsatilmaydi.

## Yig'ish va tekshirish

```sh
sh nginx-trenajor/scripts/nginx-yigish.sh             # Docker kerak (linux/386) -> build/nginx-1.31.8-i386.tar.gz
TRENAJOR_PROFIL=nginx sh linux-trenajor/scripts/yigish.sh   # -> build/web/{fs/, holat.zst}
ln -sfn ../nginx-trenajor/build/web public/nginx-trenajor   # lokal dev uchun (CI nusxalaydi)
node nginx-trenajor/test/mashqlar.mjs                   # har mashq VM'da oxirigacha
echo 'curl -s localhost/' | node nginx-trenajor/test/buyruq.mjs - --sorov
URL=http://localhost:5182/nginx/trenajor node nginx-trenajor/test/brauzer.mjs 'curl -s localhost/'   # skrinshot
```

Bu kompyuterda Docker yo'q bo'lsa, `nginx-yigish.sh` ni sinov VPS'ida ishlatib, arxivni `build/` ga ko'chiring.

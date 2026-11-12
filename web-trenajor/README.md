# Web asoslari — HTTP laboratoriyasi

Saytdagi `/web-asoslari/trenajor` sahifasi. Alohida tasvir yig'ilmaydi: **nginx trenajorining tasviri**
(`nginx-trenajor/build/web` — Debian 12, nginx 1.31.8, curl 7.88.1) ishlatiladi, laboratoriya sahifa ochilganda sozlanadi.

## Qanday ishlaydi

- `lab/` fayllari (`src/web/labFayllar.js` orqali `?raw`) VM'ga `/root/.lab-*` qilib yoziladi, so'ng terminalda
  `sh /root/.lab-sozla.sh` bajariladi:
  - `nginx.conf` → `/etc/nginx/conf.d/web-lab.conf`: 8080-portda mavzular bo'yicha manzillar — metodlar (405 + Allow,
    201 + Location), holat kodlari, redirectlar (301/302/303/307 va zanjir), kesh (statik fayllarda ETag, `expires 1h`,
    `no-store`), sekin javob (`limit_rate`), cookie sessiyasi, Basic auth (`{PLAIN}` htpasswd: ali / parol123),
    CORS (`map $http_origin`, preflight), gzip, Range;
  - `/etc/hosts` ga `api.test` va `sayt.test` (127.0.0.1);
  - `nginx-kuzatuv` to'xtatiladi: ikkinchi serial port (`/dev/ttyS1`) endi laboratoriya kanali.
- **Kanal** (`yuritma.sh`, `src/web/lab.js`): sahifa ttyS1 ga `ID BASE64(sh skript)` yuboradi; skript — bitta haqiqiy
  `curl -v -w '%{json}'` so'rovi. Javob `LAB ID BASE64(chiqish)`: `-v` qatorlari (so'rov/javob sarlavhalari, ulanish),
  vaqtlar, tana (6000 baytgacha), cookie fayli (`/run/lab-jar`).
- **Sahifa** (`src/views/WebTrenajorPage.vue`): so'rov konstruktori (mavzular bo'yicha tayyorlar, metod, URL,
  sarlavhalar, `-L`, cookie, `--compressed`, curl buyrug'i), so'rov yo'li (`SorovYoli.vue`: Klient → DNS → TCP → Server,
  har redirect alohida, vaqt chizig'i), "Nima bo'ldi?" (`izohlar.js`), xom xabarlar (`XomXabar.vue`, sarlavha izohlari),
  Network paneli (`Tarmoq.vue`), cookie'lar, terminal, mashqlar (`mashqlar.js` — haqiqiy so'rovlar tarixiga qarab).

## Tekshirish

```sh
TRENAJOR_PROFIL=nginx sh linux-trenajor/scripts/yigish.sh      # nginx tasviri (README: nginx-trenajor)
ln -sfn ../nginx-trenajor/build/web public/nginx-trenajor
node web-trenajor/test/lab.mjs sorovlar.json                    # so'rovlarni VM'da bajarib, natijani chiqaradi
node web-trenajor/test/mashqlar.mjs                             # har mashq haqiqiy so'rovlar bilan oxirigacha
URL=http://localhost:5182/web-asoslari/trenajor node web-trenajor/test/brauzer.mjs   # skrinshotlar (test/shots/)
```

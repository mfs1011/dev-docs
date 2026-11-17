# 52 — Deploy va ishlab turgan ilova

[Mundarija](README.md)

> Deploy sinov serverida (Ubuntu 26.04, Node 26.13, Nginx 1.31.8, mavjud HTTPS sayt) haqiqatan bajarildi. Domen va IP matnda
> `<domen>` bilan almashtirilgan. systemd va Nginx tafsilotlari — Linux va Nginx qo'llanmalarida.

## Tushuncha

Ilovani serverga chiqarish — qaytarib bo'lmaydigan, boshqalarga ko'rinadigan amal (11-bob). Shuning uchun bu bobda ish **taqsimlangan**:

| Kim | Nima qiladi | Nega |
| --- | --- | --- |
| Agent | Kodni deploy talablariga moslaydi, deploy fayllari va qadamlar ro'yxatini yozadi | Fayllar review qilinadi, git'da qoladi |
| Inson | Qadamlarni serverda bajaradi, natijani tekshiradi | Server kirish ma'lumotlari agentga berilmaydi (38, 47-boblar) |
| Agent | Production'dan kelgan xatoni qayta hosil qiladi va tuzatadi | 49-bobdagi "avval test" tsikli |

Agentga so'rovda aniq aytildi: "Serverga o'zing ulanma."

## Amalda: deploy talabi kodni o'zgartiradi

Server: mavjud HTTPS sayt. Ilova uning `/kalkulyator/` yo'lida turishi kerak, Nginx prefiksni olib tashlab `127.0.0.1:3100` ga uzatadi.
Muammo: ilova **absolyut** yo'llardan foydalanadi (`/api/installments`, `/app.js`, `/style.css`) — `/kalkulyator/` ostida ular saytning
ildiziga ketadi. Bu — deploy muhiti kodga talab qo'yadigan odatiy holat.

Yangi sessiya, yangi branch:

```text
Yangi branch deploy/vps da ishla. Deploy talablari:
- Server: Ubuntu 26.04, Node 26 (/usr/local/bin/node), Nginx 1.31 allaqachon HTTPS bilan ishlayapti. Ilova mavjud domen ostida
  /kalkulyator/ yo'lida ochiladi; Nginx prefiksni olib tashlab 127.0.0.1:3100 ga uzatadi
  (location /kalkulyator/ { proxy_pass http://127.0.0.1:3100/; }).
- Shuning uchun frontend /kalkulyator/ ostida ham, ildizda ham ishlashi kerak: absolyut yo'llarni (/api/..., /app.js, /style.css)
  nisbiy qil va buni testlar bilan tekshir.
- deploy/ papkaga: systemd unit (alohida tizim foydalanuvchisi, kod /opt/kalkulyator da, faqat o'qish; xavfsizlik cheklovlari:
  NoNewPrivileges, ProtectSystem=strict, ProtectHome va h.k.), Nginx location parchasi, DEPLOY.md — serverda bajariladigan qadamlar
  ketma-ketligi va tekshiruv buyruqlari.
- Domen va IP yozma, o'rniga <domen>. Serverga o'zing ulanma.
Commit qil va to'xta.
```

Natija — 28 navbat, $1.06, bitta commit (196 test). Agent javobidan e'tiborga loyiq qismlar:

- **Prefiks testi.** `test/base-path.test.js` Nginx'ga o'xshash kichik proksi ochadi (prefiksni olib tashlaydi, boshqa yo'llarga 404)
  va brauzer so'raydigan hamma narsani — sahifa, CSS, JS, API'ga POST — `/kalkulyator/` va ildiz ostida so'raydi. Agent: "Eski kodda bu
  test 5 joyda yiqilishini tekshirdim, ya'ni muammoni haqiqatan ushlaydi."
- **So'ralganidan farq — sababi bilan.** Nginx parchasida ikki o'zgarish: `^~` (server blokidagi regex location'lar `/kalkulyator/app.js` ni
  "tortib olmasligi" uchun) va `/kalkulyator` (oxirgi `/` siz) → 301 (aks holda nisbiy yo'llar ildizga ketadi).
- **Rad etilgan cheklovlar — sababi bilan.** systemd unit'da `MemoryDenyWriteExecute` qo'yilmagan ("V8 JIT yoziladigan+bajariladigan xotira
  talab qiladi") va `ProcSubset=pid` ("libuv xotira hajmini /proc/meminfo dan o'qiydi").

systemd unit'dan parcha:

```ini
[Service]
Type=exec
User=kalkulyator
Group=kalkulyator
WorkingDirectory=/opt/kalkulyator
Environment=PORT=3100
Environment=HOST=127.0.0.1
ExecStart=/usr/local/bin/node /opt/kalkulyator/src/server.js
ProtectSystem=strict
ProtectHome=yes
NoNewPrivileges=yes
CapabilityBoundingSet=
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
IPAddressDeny=any
IPAddressAllow=localhost
MemoryMax=256M
```

`DEPLOY.md` — 9 bo'lim: lokal arxiv (`git archive` — faqat commit qilingan kod), server tekshiruvi, tizim foydalanuvchisi, kodni joylash
(egasi root, xizmat uchun faqat o'qish), systemd, Nginx, tashqaridan tekshiruv, yangilash va **orqaga qaytarish**, muammolar jadvali.

## Serverda: qadamlar bo'yicha

`DEPLOY.md` buyruqlari ketma-ket bajarildi. Muhim natijalar:

```text
$ sudo -u kalkulyator /usr/local/bin/node --test        # serverning o'zida, xizmat foydalanuvchisi nomidan
ℹ tests 196
ℹ pass 196
ℹ fail 0

$ systemd-analyze verify /etc/systemd/system/kalkulyator.service
(kalkulyator.service uchun xato yo'q; boshqa tizim unit'lari haqida ogohlantirishlar)

$ systemctl is-active kalkulyator
active
$ ss -ltnp 'sport = :3100'
127.0.0.1:3100
$ ps -o user=,cmd= -p "$(systemctl show -p MainPID --value kalkulyator)"
kalkuly+ /usr/local/bin/node /opt/kalkulyator/src/server.js

$ systemd-analyze security kalkulyator --no-pager | tail -1
→ Overall exposure level for kalkulyator.service: 1.3 OK :-)

$ sudo -u kalkulyator touch /opt/kalkulyator/x
touch: cannot touch '/opt/kalkulyator/x': Permission denied
```

Yo'riqnoma bilan **bitta farq** bor edi: `DEPLOY.md` Nginx konfiguratsiyasini `/etc/nginx/sites-available/<domen>` da deb taxmin qilgan,
bu serverda esa saytlar `/etc/nginx/conf.d/` da va `snippets/` papkasi yo'q edi. Agent serverni ko'rmagan — buni u bilishi mumkin emas edi.
Shuning uchun `sayt.conf` ning zaxira nusxasi olinib, `snippets/` yaratildi va HTTPS `server` blokiga bitta qator qo'shildi:

```nginx
server {
    listen 443 ssl;
    ...
    server_name <domen> www.<domen>;
    include snippets/kalkulyator.conf;
```

```text
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Tashqaridan tekshiruv (`DEPLOY.md` 6-bo'lim):

```text
$ curl -sSI https://<domen>/kalkulyator | grep -iE '^(HTTP|location)'
HTTP/2 301
location: https://<domen>/kalkulyator/

$ curl -sSI https://<domen>/kalkulyator/ | grep -iE '^(HTTP|content-type|content-security-policy)'
HTTP/2 200
content-type: text/html; charset=utf-8
content-security-policy: default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'

style.css  200 text/css; charset=utf-8
app.js     200 text/javascript; charset=utf-8
lib.js     200 text/javascript; charset=utf-8
healthz    200 application/json; charset=utf-8

$ curl -sS -X POST https://<domen>/kalkulyator/api/installments -H 'Content-Type: application/json' -d '{"amount":1000,"months":3}'
{"amount":1000,"months":3,"payments":[{"month":1,"amount":334},{"month":2,"amount":333},{"month":3,"amount":333}]}

$ curl -m 5 http://<domen>:3100/healthz
curl: (28) Connection timed out after 5006 milliseconds
```

Port 3100 tashqaridan yopiq, saytning ildizi avvalgidek `200`.

## Foydalanuvchi xabaridan tuzatishgacha

Ishlab turgan ilovada formani sinab ko'ramiz. Telefonda summalarni ko'pincha nuqta bilan yozishadi:

```text
"1 000 000" → 1000000
"1.000.000" → "1.000.000"      ← matn bo'lib qoldi
"1,000,000" → "1,000,000"
```

Serverga matn boradi va javob — "Summa son bo'lishi kerak (masalan, 1000)". Foydalanuvchi uchun bu tushunarsiz: u raqam yozgan. Bu holat
foydalanuvchi xabari ko'rinishida agentga berildi (xabar sinov uchun tuzilgan, xatti-harakat esa haqiqiy):

```text
Foydalanuvchidan xabar (production, /kalkulyator/): "Telefonda summani 1.000.000 deb yozdim, 'Summa son bo'lishi kerak (masalan, 1000)'
degan xato chiqdi. Raqam yozdim-ku?"
Branch fix/nuqtali-summa da ishla. Avval muammoni test bilan qayta hosil qil (tasdiq bo'yicha yiqilsin). Keyin tuzat. Noaniq holatlar
(masalan, 1.5 yoki 1,5) bo'yicha qaroringni va sababini javobda yoz. Commit qil va to'xta.
```

11 navbat, $0.31. Agent xabardagi muammodan tashqari **jiddiyroq** xatoni topdi:

```text
Testda yana bir jiddiyroq xato topildi: "1.000" jimgina 1 ga aylanardi. Agar oylar soni 1 bo'lsa, foydalanuvchi xato xabarini ko'rmay,
1 so'mlik jadval olardi.
```

Ya'ni `1.000` kasr sifatida o'qilib, `1` bo'lib qolgan — xato xabarisiz noto'g'ri natija, bu xatodan yomonroq. Agentning qarori — noaniq
holatlar jadvali bilan:

| Kiritilgan | Natija | Sabab (agent) |
| --- | --- | --- |
| `1.000.000`, `1,000,000` | 1 000 000 | Telefonda shunday yozish odatiy |
| `1.000` | 1000 | So'mda tiyin yo'q — "1,0 so'm" deyarli mumkin emas; eski xatti-harakat jimgina noto'g'ri summa berardi |
| `1.5`, `1,5` | 1.5 → server "butun son bo'lishi kerak" | Yaxlitlab taxmin qilish xavfli |
| `1.000.00`, `1.00.000` | o'zgarmaydi → xato | Guruhlash noto'g'ri, taxmin qilinmaydi |

Asosiy qoida: nuqta yoki vergul faqat sonni **aniq uchtadan guruhlashga** to'liq mos kelsagina ming ajratuvchisi deb olinadi. Bu qaror
biznesga oid — review'da aynan shu jadval tasdiqlanadi.

Yangilash `DEPLOY.md` 8-bo'limi bo'yicha: yangi arxiv `/opt/kalkulyator.new` ga, eski versiya `/opt/kalkulyator.old` ga (orqaga qaytarish
uchun), xizmat qayta ishga tushirildi:

```text
$ curl -fsS http://127.0.0.1:3100/healthz
{"status":"ok"}
$ journalctl -u kalkulyator -n 4 --no-pager -o cat
Stopped kalkulyator.service - Kalkulyator (bo'lib to'lash) HTTP serveri.
Starting kalkulyator.service - Kalkulyator (bo'lib to'lash) HTTP serveri...
Started kalkulyator.service - Kalkulyator (bo'lib to'lash) HTTP serveri.
Server ishga tushdi: http://127.0.0.1:3100
```

PR'lar: deploy — [#2](https://github.com/mfs1011/ai-agentlar-sinov/pull/2), tuzatish — [#3](https://github.com/mfs1011/ai-agentlar-sinov/pull/3).

## XI qism yakuni

| Bob | Natija | Narx |
| --- | --- | --- |
| 48 | Reja (9 ta savol), CLAUDE.md, skelet | $0.48 |
| 49 | Hisob-kitob, validatsiya, server, veb-sahifa; brauzerda topilgan formatlash xatosi | $2.28 |
| 50 | CSV funksiyasi, ikki review, 2 tuzatish, PR tavsifi va uning tekshiruvi | $1.76 |
| 52 | Deploy fayllari va prefiks; foydalanuvchi xabari bo'yicha tuzatish | $1.37 |
| **Jami** | **Ishlab turgan ilova, 206 test** | **≈ $5.90** |

Narxlar — Opus 5.5 (standart model), ro'yxat narxida taxmin (41-bob). Agentning hissasi — kod, testlar, deploy fayllari va bir nechta
o'z-o'zidan topilgan xato. Insonning hissasi — talablar va qarorlar, haqiqiy muhitdagi tekshiruv (brauzer, server), review topilmalarini
saralash, push va deploy.

## Variantlar

| Usul | Qachon | Trade-off |
| --- | --- | --- |
| Agent fayl yozadi, inson bajaradi (shu bob) | Server kirish ma'lumotlari maxfiy, deploy kam | Xavfsiz; qo'lda |
| CI/CD (masalan, GitHub Actions) bajaradi | Tez-tez deploy | Takrorlanadigan; CI'ga server kaliti kerak — alohida kalit, minimal huquq |
| Agent SSH orqali o'zi bajaradi | Sinov serveri, vaqtinchalik muhit | Tez; agentga server kaliti — 37, 38-boblardagi xavflar |
| Konteyner | Bir nechta xizmat, bir xil muhit | Docker qo'llanmasi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Agentga production server kalitini berish | Prompt injection yoki xato — haqiqiy zarar | Agent fayl yozadi, inson yoki CI bajaradi |
| Yo'riqnomani tekshirmasdan bajarish | Tajribada server tuzilmasi taxmindan farq qildi | Har qadamni natijasi bilan; zaxira nusxa |
| Orqaga qaytarish rejasisiz deploy | Yangi versiya buzilsa — tez qaytarish yo'q | `.old` nusxa va qaytarish buyruqlari |
| Faqat lokal testlarga ishonish | Prefiks, Nginx, systemd cheklovlari lokalda yo'q | Serverning o'zida test va tashqaridan tekshiruv |
| Foydalanuvchi xabarini "ishlamayapti" deb uzatish | Agent taxmin qiladi | Aniq kiritish, aniq xabar, qayerda |
| Agentning noaniq holatlar bo'yicha qarorini review qilmaslik | Bu biznes qarori | Jadvalni tasdiqlash |

## Amaliyot

1. Nega bu bobda deploy agent va inson orasida taqsimlandi?
2. Deploy talabi kodga qanday o'zgarish talab qildi va agent buni qanday tekshirdi?
3. Agent qaysi systemd cheklovlarini ataylab qo'ymadi va nega?
4. Serverda yo'riqnomadan qanday farq chiqdi va nega agent buni bilishi mumkin emas edi?
5. Foydalanuvchi xabari bo'yicha ishlaganda agent qanday qo'shimcha xato topdi va nega u xatodan yomonroq?
6. Yangilashda orqaga qaytarish qanday ta'minlangan?

<details>
<summary>Javoblar</summary>

1. Deploy qaytarib bo'lmaydigan, boshqalarga ko'rinadigan amal; server kirish ma'lumotlari agentga berilmaydi. Agent fayllarni yozdi, inson bajardi va tekshirdi.
2. Absolyut yo'llarni nisbiyga o'tkazish. Agent Nginx'ga o'xshash proksi bilan test yozdi va u eski kodda 5 joyda yiqilishini tekshirdi.
3. `MemoryDenyWriteExecute` (V8 JIT bilan Node ishga tushmaydi) va `ProcSubset=pid` (libuv `/proc/meminfo` ni o'qiydi).
4. Yo'riqnoma `sites-available` ni taxmin qilgan, serverda esa `conf.d/` va `snippets/` yo'q edi. Agent serverni ko'rmagan.
5. `1.000` jimgina `1` ga aylanardi — xato xabarisiz noto'g'ri natija; foydalanuvchi noto'g'ri jadvalni to'g'ri deb o'ylaydi.
6. Eski versiya `/opt/kalkulyator.old` ga ko'chiriladi; muammo bo'lsa nomlarni almashtirib, xizmatni qayta ishga tushirish.

</details>

## Rasmiy hujjat

- [CC: Common workflows](https://code.claude.com/docs/en/common-workflows)
- [CC: Securely deploying AI agents — Least privilege, Credential management](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
- systemd va Nginx — Linux va Nginx qo'llanmalaridagi rasmiy manbalar (`systemd.exec(5)`, `systemd-analyze(1)`, nginx.org `location`, `proxy_pass`)

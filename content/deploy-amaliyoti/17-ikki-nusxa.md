# 17 — Ikki nusxa va nginx

[Mundarija](README.md)

## Tushuncha

16-bobda to'xtash eski jarayon to'xtagan va yangisi hali tayyor bo'lmagan oraliqdan keldi. Yechim — bu oraliqni yo'qotish: eskisini to'xtatishdan **oldin** yangisini **boshqa portda** ishga tushirish, uning tayyorligini tekshirish va shundan keyingina trafikni unga o'tkazish.

```text
1. eski  :8097 ◀── nginx ◀── so'rovlar
2. eski  :8097 ◀── nginx        yangi :8098 ishga tushyapti
3. eski  :8097 ◀── nginx        yangi :8098 tayyor? ✓
4. eski  :8097                  yangi :8098 ◀── nginx (reload)
5. eski to'xtatildi             yangi :8098 ◀── nginx
```

Keyingi deployda rollar almashadi: bo'sh port — 8097.

Ikki qism allaqachon tanish:

- **nginx reload** (8-bob, NG: Controlling nginx) — yangi worker'lar yangi sozlama bilan ishga tushadi, eskilari yo'ldagi so'rovlarni tugatib chiqadi. Reload paytida ulanishlar uzilmaydi.
- **upstream** (NG: ngx_http_upstream_module) — `proxy_pass` murojaat qiladigan serverlar guruhi. Serverlar turli portlarda bo'lishi mumkin. Standart taqsimlash — vaznli navbat (weighted round-robin); server bilan aloqada xato bo'lsa, so'rov keyingisiga uzatiladi.

Bu bobda upstream'da har doim **bitta** server — joriy nusxa. Trafikni o'tkazish — upstream'dagi portni almashtirib, reload qilish.

### Tayyorlik tekshiruvi

Port ochilgani ilova so'rovlarga **to'g'ri** javob berishini bildirmaydi. Shuning uchun skript yangi nusxaga to'g'ridan-to'g'ri so'rov yuboradi va **kutilgan versiya** qaytguncha kutadi. Kutilgan vaqtda javob kelmasa — trafik **o'tkazilmaydi**, yangi nusxa to'xtatiladi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04, nginx 1.31.8).

Ilova — 16-bobdagi kabi, ishga tushishi 2 soniya; portni argumentdan oladi. Versiya `buzuq` bo'lsa — ishga tushmaydi (xato sozlama o'rniga):

```python
# Sinov ilovasi: port — argument, versiya — fayldan; ishga tushishi 2 soniya
import http.server, sys, time
port = int(sys.argv[1])
time.sleep(2)
versiya = open(f"/srv/ilova17/versiya-{port}").read().strip()
if versiya == "buzuq":
    sys.exit("sozlama xato: ishga tushmadi")
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(versiya.encode())
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
```

systemd **shablon unit**i (template) — `ilova17@8097`, `ilova17@8098`; `%i` — SD (systemd.unit(5)): birinchi `@` va unit turi qo'shimchasi orasidagi qator, bu yerda port:

```ini
[Unit]
Description=Deploy kitobi: 17-bob, nusxa %i

[Service]
DynamicUser=yes
ExecStart=/usr/bin/python3 /srv/ilova17/ilova.py %i
```

nginx: upstream ichidagi server qatori alohida faylda — skript faqat shu faylni almashtiradi:

```nginx
upstream ilova17 {
    include /etc/nginx/ilova17-upstream.conf;
}
server {
    listen 127.0.0.1:8099;
    location / {
        proxy_pass http://ilova17;
    }
}
```

Deploy skripti:

```bash
#!/bin/bash
# almashtir.sh VERSIYA — bo'sh portda yangi nusxa; tayyor bo'lgach nginx'ni unga o'tkazadi
set -e
up=/etc/nginx/ilova17-upstream.conf
joriy=$(grep -oE '80[0-9]{2}' $up)
if [ "$joriy" = 8097 ]; then yangi=8098; else yangi=8097; fi
echo "$1" > /srv/ilova17/versiya-$yangi
systemctl restart ilova17@$yangi
# Tayyorlikni tekshirish: 10 soniyagacha kutamiz
for i in $(seq 1 50); do
  [ "$(curl -s http://127.0.0.1:$yangi/)" = "$1" ] && break
  sleep 0.2
done
if [ "$(curl -s http://127.0.0.1:$yangi/)" != "$1" ]; then
  systemctl stop ilova17@$yangi
  echo "yangi nusxa ($yangi) tayyor emas — trafik $joriy da qoldi"; exit 1
fi
echo "server 127.0.0.1:$yangi;" > $up.tmp
mv -T $up.tmp $up
nginx -t -q && systemctl reload nginx
echo "trafik: $joriy -> $yangi ($1)"
sleep 2
systemctl stop ilova17@$joriy
```

- Joriy portni upstream faylidan oladi, boshqasini tanlaydi.
- Yangi nusxani ishga tushiradi va 10 soniyagacha kutilgan versiyani kutadi.
- Upstream faylini atomik almashtiradi (5-bobdagi `mv -T`), `nginx -t` va reload.
- Eski nusxani 2 soniyadan keyin to'xtatadi — eski worker'lar yo'ldagi so'rovlarni tugatishi uchun.

### Boshlang'ich holat

```text vps
$ install -d /srv/ilova17; install -m 644 /root/ilova.py /srv/ilova17/; install -m 755 /root/almashtir.sh /usr/local/bin/almashtir; mv /root/ilova17-shablon.service /etc/systemd/system/ilova17@.service; mv /root/ilova17.conf /etc/nginx/conf.d/; rm /root/ilova.py /root/almashtir.sh; echo v1 > /srv/ilova17/versiya-8097; echo 'server 127.0.0.1:8097;' > /etc/nginx/ilova17-upstream.conf; systemctl daemon-reload; systemctl start ilova17@8097; sleep 3; nginx -t -q && systemctl reload nginx; curl -s http://127.0.0.1:8099/; echo
v1
```

### Ikki deploy, uzluksiz so'rovlar ostida

14 soniya davomida so'rovlar; shu orada ikki marta deploy — `v2`, keyin `v3`:

```text vps
$ (sleep 2; almashtir v2; sleep 1; almashtir v3) & python3 /root/yuk.py http://127.0.0.1:8099/ 14; wait
trafik: 8097 -> 8098 (v2)
trafik: 8098 -> 8097 (v3)
200 v1: 343
200 v2: 430
200 v3: 344
```

**Xato — 0.** 1117 so'rovning hammasi 200: avval `v1`, keyin `v2`, keyin `v3`. 16-bobdagi oddiy restart'da shu sharoitda 183 ta 502 bo'lgan edi.

```text vps
$ systemctl is-active ilova17@8097 ilova17@8098; cat /etc/nginx/ilova17-upstream.conf
active
inactive
server 127.0.0.1:8097;
```

Ikkinchi deploydan keyin trafik yana 8097 da; 8098 to'xtatilgan.

### Buzuq versiya

```text vps
$ (sleep 1; almashtir buzuq) & python3 /root/yuk.py http://127.0.0.1:8099/ 14; wait; cat /etc/nginx/ilova17-upstream.conf
yangi nusxa (8098) tayyor emas — trafik 8097 da qoldi
200 v3: 1120
server 127.0.0.1:8097;
```

Yangi nusxa ishga tushmadi — skript trafikni **o'tkazmadi**, upstream o'zgarmadi. Foydalanuvchilar uchun hech narsa sezilmadi: 1120 so'rov, hammasi `v3`. Oddiy restart'da (16-bob) bunday deploy saytni **butunlay** to'xtatgan bo'lardi.

```text vps
$ systemctl stop 'ilova17@*'; rm -rf /etc/systemd/system/ilova17@.service /etc/nginx/conf.d/ilova17.conf /etc/nginx/ilova17-upstream.conf /srv/ilova17 /usr/local/bin/almashtir /root/yuk.py; systemctl daemon-reload; systemctl reset-failed 'ilova17@*' 2>/dev/null; nginx -t 2>&1 | tail -1; systemctl reload nginx; echo tozalandi
nginx: configuration file /etc/nginx/nginx.conf test is successful
tozalandi
```

## Variantlar

| Usul | Yutug'i | Kamchiligi |
| --- | --- | --- |
| Upstream'da bitta server, almashtirib reload (shu bob) | Oddiy; tekshirilmagan nusxaga trafik bormaydi | Deploy paytida ikki nusxa — ikki baravar xotira |
| Upstream'da ikkala server, birini `down` qilib reload | Fayl tuzilmasi o'zgarmaydi | NG: `down` — server butunlay ishlamaydi deb belgilanadi; sozlama murakkablashadi |
| Ikkala server doim yoqiq, birini restart | Yuklama taqsimlanadi | Restart qilinayotganiga so'rov tushsa — nginx keyingisiga uzatadi (NG), lekin uzoq so'rovlar uziladi |
| `backup` server | Asosiy ishlamasa so'rov unga (NG) | Deployni boshqarish uchun emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Tayyorlikni tekshirmay o'tkazish | Ishga tushmagan nusxaga trafik — 502 | Kutilgan javobni kutish (sinovda buzuq versiya to'xtatildi) |
| Eski nusxani reload bilan bir vaqtda to'xtatish | Eski worker'larning yo'ldagi so'rovlari uziladi | Biroz kutib to'xtatish |
| Upstream faylini joyida tahrirlash | Yarim yozilgan fayl bilan `nginx -t` | Vaqtinchalik fayl + `mv -T` |
| `nginx -t` siz reload | Xato sozlama jimgina e'tiborga olinmaydi (8-bob) | `nginx -t -q && systemctl reload nginx` |
| Ikkala nusxa bitta portda | Ikkinchisi ishga tushmaydi | Turli portlar, shablon unit |

## Amaliyot

1. Ikki nusxa usuli 16-bobdagi to'xtashni qanday yo'qotadi?
2. Nega eski nusxa darhol emas, biroz kutib to'xtatiladi?
3. Skript yangi nusxa tayyorligini qanday tekshiradi?
4. Sinovda buzuq versiya bilan nima bo'ldi?
5. systemd shablon unit'ida `%i` nima?

<details>
<summary>Javoblar</summary>

1. Eskisini to'xtatishdan oldin yangisi boshqa portda tayyor bo'ladi; trafik reload bilan o'tkaziladi.
2. Eski nginx worker'lari yo'ldagi so'rovlarni unga yuborib tugatishi uchun.
3. Yangi portga so'rov yuborib, kutilgan versiya qaytguncha kutadi.
4. Ishga tushmadi, trafik o'tkazilmadi, foydalanuvchilar eski versiyada qoldi.
5. `@` dan keyingi qism (bu yerda port).

</details>

## Rasmiy hujjat

- [NG: ngx_http_upstream_module](https://nginx.org/en/docs/http/ngx_http_upstream_module.html) — upstream, server (`down`, `backup`)
- [NG: Using nginx as HTTP load balancer](https://nginx.org/en/docs/http/load_balancing.html)
- [NG: Controlling nginx](https://nginx.org/en/docs/control.html) — Changing Configuration
- [SD: systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html) — shablon unit'lar, `%i`

# 16 — To'xtash qayerdan keladi

[Mundarija](README.md)

## Tushuncha

1-bobdagi ta'rif: nol to'xtovli deploy — yangi versiyaga o'tishda **birorta ham** so'rov xato bilan tugamaydi. Buni his bilan emas, **o'lchab** tekshiramiz: deploy paytida uzluksiz so'rov yuborib, javoblarni sanaymiz.

Oddiy deploy — kodni yangilab, `systemctl restart` (8-bob). SD (systemctl(1)): restart — unit'ni **to'xtatadi**, keyin **ishga tushiradi**. Ikki holat orasida port **hech kim tinglamaydi**:

```text
eski jarayon ─────────┐ to'xtadi
                      │  ← ilova ishga tushyapti (kutubxonalar, bazaga ulanish)
yangi jarayon         └──────── port ochildi ─────────
so'rovlar   ✓ ✓ ✓ ✓ ✓  ✗ ✗ ✗ ✗ ✗ ✗ ✗  ✓ ✓ ✓ ✓ ✓
```

Bu oraliqda:

- to'g'ridan-to'g'ri ilovaga kelgan ulanish — **rad etiladi** (connection refused);
- nginx orqali — nginx orqadagi serverga ulana olmaydi va mijozga **502 Bad Gateway** qaytaradi; nginx jurnalida — `connect() failed (111: Connection refused) while connecting to upstream`.

NG (proxy module, `proxy_next_upstream`): ulanish o'rnatishda xato bo'lsa (`error`, standart yoqilgan), nginx so'rovni **keyingi serverga** uzatishi mumkin — lekin faqat `upstream` da boshqa server bo'lsa. Bitta backend bo'lsa — boradigan joy yo'q. Ikki nusxa — 17-bob.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04, nginx 1.31.8).

Sinov ilovasi ishga tushishga 2 soniya sarflaydi (haqiqiy ilovadagi kutubxonalarni yuklash, bazaga ulanish o'rniga) va versiyasini qaytaradi:

```python
# Sinov ilovasi: ishga tushishi 2 soniya oladi (kutubxonalar, bazaga ulanish o'rniga)
import http.server, time
time.sleep(2)
versiya = open("/srv/ilova16/versiya").read().strip()
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(versiya.encode())
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", 8096), H).serve_forever()
```

Yuk beruvchi skript — berilgan vaqt davomida ketma-ket so'rov yuboradi va natijalarni sanaydi:

```python
# yuk.py URL SONIYA — ketma-ket so'rov yuboradi, natijalarni sanaydi
import sys, time, urllib.request, urllib.error, collections
url, sek = sys.argv[1], float(sys.argv[2])
natija = collections.Counter(); xatolar = []
boshi = time.time()
while time.time() - boshi < sek:
    t = time.time() - boshi
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            natija[f"200 {r.read().decode()}"] += 1
    except urllib.error.HTTPError as e:
        natija[str(e.code)] += 1; xatolar.append(t)
    except OSError as e:
        natija[type(e.__cause__ or e).__name__] += 1; xatolar.append(t)
    time.sleep(0.01)
for k, v in sorted(natija.items()): print(f"{k}: {v}")
if xatolar: print(f"xatolar oralig'i: {xatolar[0]:.2f}s – {xatolar[-1]:.2f}s ({xatolar[-1]-xatolar[0]:.2f}s)")
```

Servis va nginx:

```ini
[Unit]
Description=Deploy kitobi: 16-bob sinov ilovasi

[Service]
DynamicUser=yes
ExecStart=/usr/bin/python3 /srv/ilova16/ilova.py
```

```nginx
server {
    listen 127.0.0.1:8095;
    location / {
        proxy_pass http://127.0.0.1:8096;
    }
}
```

### Tayyorlash va oddiy holat

```text vps
$ install -d /srv/ilova16; install -m 644 /root/ilova.py /srv/ilova16/; echo v1 > /srv/ilova16/versiya; mv /root/ilova16.service /etc/systemd/system/; mv /root/ilova16.conf /etc/nginx/conf.d/; rm /root/ilova.py; systemctl daemon-reload; systemctl start ilova16; nginx -t 2>&1 | tail -1; systemctl reload nginx; sleep 3; curl -s http://127.0.0.1:8095/; echo
nginx: configuration file /etc/nginx/nginx.conf test is successful
v1
$ python3 /root/yuk.py http://127.0.0.1:8095/ 3
200 v1: 243
```

3 soniyada 243 so'rov — hammasi 200.

### Deploy: versiya yangilanib, restart

So'rovlar 8 soniya davom etadi; 2-soniyada versiya `v2` ga o'zgaradi va servis restart qilinadi:

```text vps
$ (sleep 2; echo v2 > /srv/ilova16/versiya; systemctl restart ilova16) & python3 /root/yuk.py http://127.0.0.1:8095/ 8; wait
200 v1: 154
200 v2: 311
502: 183
xatolar oralig'i: 1.93s – 4.06s (2.13s)
```

- **183** ta so'rov **502** bilan tugadi.
- Xatolar oralig'i — **2.13 soniya**: ilovaning ishga tushish vaqti (2 s) va restart'ning o'zi.
- Oldin — `v1`, keyin — `v2`: deploy bo'ldi, lekin foydalanuvchilarning bir qismi xato ko'rdi.

### nginx'siz — to'g'ridan-to'g'ri ilovaga

```text vps
$ (sleep 2; echo v3 > /srv/ilova16/versiya; systemctl restart ilova16) & python3 /root/yuk.py http://127.0.0.1:8096/ 8; wait
200 v2: 160
200 v3: 321
ConnectionResetError: 1
URLError: 198
xatolar oralig'i: 1.95s – 4.06s (2.11s)
```

Xuddi shu oraliq (2.11 s), lekin 502 o'rniga ulanish xatolari: `URLError` (ichida — connection refused) va bitta `ConnectionResetError` — eski jarayon to'xtayotganda ochiq qolgan ulanish.

```text vps
$ grep -c 'connect() failed (111: Connection refused) while connecting to upstream' /var/log/nginx/error.log | sed 's/^/jurnalda "Connection refused": /'; tail -1 /var/log/nginx/error.log | grep -oE 'connect\(\) failed \(111: Connection refused\) while connecting to upstream'
jurnalda "Connection refused": 192
connect() failed (111: Connection refused) while connecting to upstream
```

nginx jurnalida — ulanish rad etilgan yozuvlar (son butun jurnal fayli bo'yicha). Har 502 ortida — shunday qator.

```text vps
$ systemctl stop ilova16; rm -rf /etc/systemd/system/ilova16.service /etc/nginx/conf.d/ilova16.conf /srv/ilova16 /root/yuk.py; systemctl daemon-reload; nginx -t 2>&1 | tail -1; systemctl reload nginx; echo tozalandi
nginx: configuration file /etc/nginx/nginx.conf test is successful
tozalandi
```

### Nimaga bog'liq

| Omil | Ta'siri |
| --- | --- |
| Ilovaning ishga tushish vaqti | To'xtash shuncha uzayadi (sinovda 2 s → 2.1 s) |
| So'rovlar oqimi | Ko'proq so'rov — ko'proq xato (bir xil vaqtda) |
| Yo'ldagi uzoq so'rovlar | Restart ularni uzadi (8-bob) |

## Variantlar

| Usul | To'xtash | Bob |
| --- | --- | --- |
| `systemctl restart` | Ishga tushish vaqtiga teng (sinovda 2.1 s) | 16 |
| Ikki nusxa + nginx reload | Yangisi tayyor bo'lgach o'tiladi | 17 |
| systemd socket activation | Ulanishlar kutib turadi | 18 |
| Ishga tushishni tezlashtirish | Kamayadi, lekin nolga tushmaydi | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Restart bir soniya, sezilmaydi" | Shu vaqtda 183 so'rov xato (sinovda) | O'lchash |
| Deployni brauzerda bir marta yangilab tekshirish | Xato oralig'ini ko'rib bo'lmaydi | Deploy paytida uzluksiz so'rov |
| Bitta backend'da `proxy_next_upstream` ga umid | Boradigan boshqa server yo'q (NG) | Ikki nusxa (17-bob) |
| Ilova port ochilishi bilan tayyor deb hisoblash | Hali bazaga ulanmagan bo'lishi mumkin | Holat tekshiruvi (17, 21-boblar) |

## Amaliyot

1. Restart paytida nega so'rovlar xato beradi?
2. nginx orqali va to'g'ridan-to'g'ri ulanishda xato qanday ko'rinadi?
3. Sinovda xatolar oralig'i nimaga teng bo'ldi?
4. Nega bitta backend bilan `proxy_next_upstream` yordam bermaydi?
5. Nol to'xtovni qanday tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Eski jarayon to'xtagandan yangisi portni ochguncha hech kim tinglamaydi.
2. nginx orqali — 502; to'g'ridan-to'g'ri — connection refused.
3. Taxminan ilovaning ishga tushish vaqtiga (2.1 s).
4. So'rovni uzatish uchun boshqa server yo'q.
5. Deploy paytida uzluksiz so'rov yuborib, xato javoblarni sanash — 0 bo'lishi kerak.

</details>

## Rasmiy hujjat

- [NG: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — proxy_next_upstream
- [SD: systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) — restart

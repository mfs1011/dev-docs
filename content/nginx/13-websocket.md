# 13 — WebSocket

[Mundarija](README.md)

## Tushuncha

**WebSocket** — brauzer va server orasida doimiy, ikki tomonlama ulanish (chat, bildirishnomalar, jonli yangilanishlar). Ulanish oddiy HTTP/1.1 so'rovi bilan boshlanadi va **protokolni almashtirish** (protocol switch) mexanizmi bilan WebSocket'ga o'tadi: mijoz `Upgrade: websocket` va `Connection: Upgrade` yuboradi, server **101 Switching Protocols** bilan javob beradi.

### Muammo

NG (WebSocket proxying): `Upgrade` — **hop-by-hop** header (faqat bitta bo'g'in uchun): u mijozdan proksilangan serverga **uzatilmaydi**. Forward proksida mijoz `CONNECT` bilan aylanib o'tadi, lekin reverse proksida mijoz proksi borligini bilmaydi — proksining o'zida maxsus ishlov kerak.

### Yechim

NG: 1.3.13 dan nginx backend 101 qaytarsa va mijoz `Upgrade` bilan so'ragan bo'lsa, mijoz va backend orasida **tunnel** ochadi. Lekin `Upgrade` va `Connection` ni backend'ga **aniq** uzatish kerak:

```nginx
location /chat/ {
    proxy_pass http://backend;
    # proxy_http_version 1.1; # 1.29.7 dan oldin
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

`proxy_http_version 1.1` — 1.29.7 dan standart (11-bob), shuning uchun endi shart emas.

Murakkabroq variant — `Connection` mijozda `Upgrade` bor-yo'qligiga qarab (NG):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
```

### Jimlikdagi uzilish

NG: backend **60 soniya** davomida hech narsa yubormasa, ulanish yopiladi. Oshirish — `proxy_read_timeout`; yoki backend vaqti-vaqti bilan WebSocket **ping** kadrlarini yuborib, taymerni yangilab turadi.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Backend va mijoz — Python standart kutubxonasida yozilgan minimal WebSocket (RFC 6455) aks-sado serveri va mijozi (faqat sinov uchun):

```python
# Sinov uchun minimal WebSocket aks-sado serveri (faqat Python standart kutubxonasi)
import base64, hashlib, socketserver, struct

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"  # RFC 6455

def kadr_oqi(f):
    sarlavha = f.read(2)
    if len(sarlavha) < 2:  # mijoz ulanishni yopdi
        return 8, b""
    b1, b2 = sarlavha
    n = b2 & 0x7F
    if n == 126: n = struct.unpack("!H", f.read(2))[0]
    elif n == 127: n = struct.unpack("!Q", f.read(8))[0]
    mask = f.read(4) if b2 & 0x80 else b"\0\0\0\0"
    data = bytes(c ^ mask[i % 4] for i, c in enumerate(f.read(n)))
    return b1 & 0x0F, data

def kadr_yoz(w, opcode, data):
    w.write(bytes([0x80 | opcode, len(data)]) + data)  # 125 baytgacha
    w.flush()

class WS(socketserver.StreamRequestHandler):
    def handle(self):
        h = {}
        so_rov = self.rfile.readline().decode().strip()
        while (l := self.rfile.readline().decode().strip()):
            k, v = l.split(":", 1); h[k.lower()] = v.strip()
        print("so'rov:", so_rov, "| Upgrade:", h.get("upgrade"), "| Connection:", h.get("connection"), flush=True)
        if h.get("upgrade", "").lower() != "websocket":
            self.wfile.write(b"HTTP/1.1 400 Bad Request\r\nContent-Length: 18\r\n\r\nWebSocket kutildi\n")
            return
        kalit = base64.b64encode(hashlib.sha1((h["sec-websocket-key"] + GUID).encode()).digest()).decode()
        self.wfile.write(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\n"
                          f"Connection: Upgrade\r\nSec-WebSocket-Accept: {kalit}\r\n\r\n").encode())
        while True:
            op, data = kadr_oqi(self.rfile)
            if op == 8:          # close yoki uzilish
                return
            kadr_yoz(self.wfile, 1, b"aks-sado: " + data)

socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer(("127.0.0.1", 9010), WS).serve_forever()
```

```python
# Sinov mijozi: WebSocket ulanish, xabar yuborish, javobni o'qish
import base64, os, socket, sys, time

port, yol = int(sys.argv[1]), sys.argv[2]
kutish = float(sys.argv[3]) if len(sys.argv) > 3 else 0
s = socket.create_connection(("127.0.0.1", port))
kalit = base64.b64encode(os.urandom(16)).decode()
s.sendall((f"GET {yol} HTTP/1.1\r\nHost: ws.test\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
           f"Sec-WebSocket-Key: {kalit}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
f = s.makefile("rb")
print("javob:", f.readline().decode().strip())
while f.readline().strip():
    pass
def yubor(matn):
    d = matn.encode(); m = os.urandom(4)
    s.sendall(bytes([0x81, 0x80 | len(d)]) + m + bytes(c ^ m[i % 4] for i, c in enumerate(d)))
def ol():
    b = f.read(2)
    if len(b) < 2: return None
    return f.read(b[1] & 0x7F).decode()
for matn in ["salom", "ikkinchi xabar"]:
    yubor(matn); print("keldi:", ol())
if kutish:
    time.sleep(kutish); yubor("kechikkan xabar")
    print(f"{kutish:.0f} s jimlikdan keyin:", ol() or "ulanish yopilgan")
```

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 127.0.0.1:8107;

    location /oddiy/ {
        proxy_pass http://127.0.0.1:9010;
    }
    location /chat/ {
        proxy_pass http://127.0.0.1:9010;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
    location /qisqa/ {
        proxy_pass http://127.0.0.1:9010;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3s;
    }
}
```

```text vps
$ mkdir -p /opt/ws && mv /root/ws_server.py /root/ws_client.py /opt/ws/; (nohup python3 /opt/ws/ws_server.py > /tmp/ws.log 2>&1 &); sleep 1; cp /root/ws.conf /etc/nginx/conf.d/ws.conf; rm /root/ws.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

### To'g'ridan-to'g'ri va nginx orqali

```text vps
$ python3 /opt/ws/ws_client.py 9010 /to-gridan
javob: HTTP/1.1 101 Switching Protocols
keldi: aks-sado: salom
keldi: aks-sado: ikkinchi xabar
$ python3 /opt/ws/ws_client.py 8107 /oddiy/ 2>&1 | head -1
javob: HTTP/1.1 400 Bad Request
$ python3 /opt/ws/ws_client.py 8107 /chat/
javob: HTTP/1.1 101 Switching Protocols
keldi: aks-sado: salom
keldi: aks-sado: ikkinchi xabar
```

| Yo'l | Natija | Nega |
| --- | --- | --- |
| Backend'ga to'g'ridan-to'g'ri | 101, xabarlar qaytdi | Oddiy WebSocket |
| `/oddiy/` (header'larsiz) | **400** | `Upgrade` backend'ga yetmadi |
| `/chat/` (`Upgrade` + `Connection`) | 101, xabarlar qaytdi | nginx tunnel ochdi |

Backend nima olgani:

```text vps
$ cat /tmp/ws.log
so'rov: GET /to-gridan HTTP/1.1 | Upgrade: websocket | Connection: Upgrade
so'rov: GET /oddiy/ HTTP/1.1 | Upgrade: None | Connection: None
so'rov: GET /chat/ HTTP/1.1 | Upgrade: websocket | Connection: upgrade
so'rov: GET /qisqa/ HTTP/1.1 | Upgrade: websocket | Connection: upgrade
```

`/oddiy/` da `Upgrade: None`, `Connection: None` — NG aytganidek, hop-by-hop header'lar uzatilmadi. `/chat/` da — `websocket` va `upgrade` (`map` dan).

### Jimlik

`/qisqa/` da `proxy_read_timeout 3s`; mijoz ikki xabardan keyin 5 soniya jim turdi:

```text vps
$ python3 /opt/ws/ws_client.py 8107 /qisqa/ 5
javob: HTTP/1.1 101 Switching Protocols
keldi: aks-sado: salom
keldi: aks-sado: ikkinchi xabar
5 s jimlikdan keyin: ulanish yopilgan
```

3 soniya backend'dan ma'lumot kelmadi — nginx ulanishni yopdi; kechikkan xabarga javob yo'q.

```text vps
$ rm /etc/nginx/conf.d/ws.conf; pkill -f /opt/ws/ws_server.py; rm -rf /opt/ws /tmp/ws.log; nginx -t -q && nginx -s reload; echo ok
ok
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Oddiy `proxy_pass` bilan WebSocket | `Upgrade` uzatilmaydi — 400 yoki ulanmaslik (sinovda 400) | `proxy_set_header Upgrade $http_upgrade;` va `Connection` |
| `Connection "upgrade"` ni oddiy so'rovlar uchun ham | WebSocket bo'lmagan so'rovlar ham `upgrade` deydi | `map $http_upgrade $connection_upgrade` |
| Standart 60 s ni hisobga olmaslik | Jim ulanishlar uziladi (sinovda 3 s bilan) | Backend ping yoki `proxy_read_timeout` |
| 1.29.7 dan oldingi nginx'da `proxy_http_version 1.1` siz | Eski standart 1.0 — protokol almashmaydi | `proxy_http_version 1.1;` |
| `proxy_read_timeout` ni hammaga juda katta qilish | Osilgan ulanishlar uzoq turadi | Faqat WebSocket location'ida |

## Amaliyot

1. Nega WebSocket uchun nginx'da maxsus sozlama kerak?
2. nginx qachon tunnel ochadi?
3. Qaysi ikki header'ni backend'ga aniq uzatish kerak?
4. `map $http_upgrade $connection_upgrade` nima uchun?
5. Standart holatda jim WebSocket ulanishi qancha vaqtdan keyin yopiladi? Qanday oldini olinadi?
6. 1.31.8 da `proxy_http_version 1.1` yozish shartmi?

<details>
<summary>Javoblar</summary>

1. `Upgrade` — hop-by-hop header, proksi uni avtomatik uzatmaydi.
2. Mijoz `Upgrade` bilan so'raganda va backend 101 qaytarganda.
3. `Upgrade` va `Connection`.
4. Mijozda `Upgrade` bo'lsa — `Connection: upgrade`, bo'lmasa — `close`.
5. 60 s; `proxy_read_timeout` ni oshirish yoki backend ping yuborishi.
6. Yo'q — 1.29.7 dan standart 1.1.

</details>

## Rasmiy hujjat

- [NG: WebSocket proxying](https://nginx.org/en/docs/http/websocket.html)
- [NG: proxy_read_timeout](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) · [proxy_http_version](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version)

# 06 — So'rov qaysi server'ga tushadi

[Mundarija](README.md)

## Tushuncha

nginx so'rovni ikki bosqichda yo'naltiradi: avval **qaysi `server`** (virtual server), keyin uning ichida **qaysi `location`**.

### 1. `server` tanlash

NG (How nginx processes a request):

1. So'rov kelgan **IP manzil va port** `listen` direktivalari bilan solishtiriladi.
2. Shu manzil va portga mos `server` lar orasida **`Host`** header'i `server_name` bilan solishtiriladi.
3. Mos nom topilmasa yoki `Host` umuman bo'lmasa — shu portning **standart serveri** (default server).

Standart server — portdagi **birinchi** `server` yoki `listen … default_server;` bilan aniq belgilangani. NG: standart server — `server_name` ning emas, **tinglash portining** xususiyati; har xil port/manzil uchun har xil standart server bo'lishi mumkin.

**`server_name` turlari** va tekshirish tartibi (NG, Server names) — birinchi mos kelgani bilan to'xtaydi:

1. **Aniq nom** — `example.org`.
2. `*` bilan **boshlanadigan** eng uzun nom — `*.example.org`.
3. `*` bilan **tugaydigan** eng uzun nom — `mail.*`.
4. Birinchi mos **muntazam ifoda** (fayldagi tartib bo'yicha) — `~^(?<user>.+)\.example\.net$` (nomlangan guruh o'zgaruvchiga aylanadi).

**`Host` siz so'rovlar** (NG): `server_name "";` va `return 444;` — 444 nginx'ning nostandart kodi: javob bermay ulanishni yopadi. 0.8.48 dan bo'sh nom — `server_name` ning standart qiymati.

### 2. `location` tanlash

NG (core module, `location`): solishtirish **normallashtirilgan URI** bilan — `%XX` kodlari ochiladi, `.` va `..` hal qilinadi, ketma-ket `//` bittaga qisqarishi mumkin. So'rov argumentlari (`?…`) solishtirishga **kirmaydi**.

| Tur | Ko'rinishi | Ma'nosi |
| --- | --- | --- |
| Aniq | `location = /` | URI aynan teng — qidiruv darhol to'xtaydi |
| Prefiks | `location /documents/` | URI shu bilan boshlanadi |
| Prefiks, regex'siz | `location ^~ /images/` | Eng uzun mos prefiks shu bo'lsa — regex tekshirilmaydi |
| Regex | `location ~ \.php$` / `~*` | Muntazam ifoda (`~*` — katta-kichik harf farqsiz) |
| Predikat (1.31.5 dan) | `location $arg_pred` | O'zgaruvchi bo'sh emas va `0` emas bo'lsa |
| Nomli | `location @backend` | Oddiy so'rovlar uchun emas, faqat yo'naltirish uchun (`try_files`) |

Tanlash algoritmi (NG):

1. Barcha **prefiks** location'lar tekshiriladi, **eng uzun** mosi eslab qolinadi (fayldagi tartib muhim emas). `=` aniq mos kelsa — tamom.
2. Eslab qolingan prefiks `^~` bo'lsa — tamom, regex tekshirilmaydi.
3. **Regex** location'lar **fayldagi tartib bilan** tekshiriladi; birinchi mosi — tanlanadi.
4. Regex mos kelmasa — **predikat** location'lar tartib bilan.
5. Hech biri bo'lmasa — 1-qadamda eslab qolingan prefiks.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Sinov konfiguratsiyasi — `127.0.0.1` da, ikki portda.

### `server` tanlash

```nginx
server {
    listen 127.0.0.1:8096;
    server_name example.org www.example.org;
    return 200 "1: aniq nom (example.org)\n";
}
server {
    listen 127.0.0.1:8096 default_server;
    server_name standart.test;
    return 200 "2: default_server\n";
}
server {
    listen 127.0.0.1:8096;
    server_name *.example.org;
    return 200 "3: *.example.org\n";
}
server {
    listen 127.0.0.1:8096;
    server_name mail.*;
    return 200 "4: mail.*\n";
}
server {
    listen 127.0.0.1:8096;
    server_name ~^(?<user>.+)\.example\.net$;
    return 200 "5: regex, user=$user\n";
}
server {
    listen 127.0.0.1:8096;
    server_name "";
    return 444;
}
```

```text vps
$ cp /root/tanlash.conf /etc/nginx/conf.d/tanlash.conf; rm /root/tanlash.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
$ h() { printf '%-26s → %s\n' "$1" "$(curl -s --http1.0 -H "Host: $1" http://127.0.0.1:8096/ || echo "ulanish yopildi (curl kodi $?)")"; }; h example.org; h www.example.org; h api.example.org; h mail.example.com; h ali.example.net; h boshqa.uz; h mail.example.org
example.org                → 1: aniq nom (example.org)
www.example.org            → 1: aniq nom (example.org)
api.example.org            → 3: *.example.org
mail.example.com           → 4: mail.*
ali.example.net            → 5: regex, user=ali
boshqa.uz                  → 2: default_server
mail.example.org           → 3: *.example.org
```

| `Host` | Server | Nega |
| --- | --- | --- |
| `example.org`, `www.example.org` | 1 | Aniq nom |
| `api.example.org` | 3 | `*.example.org` |
| `mail.example.com` | 4 | `mail.*` |
| `ali.example.net` | 5 | Regex; `$user` = `ali` |
| `boshqa.uz` | 2 | Hech biri mos emas → `default_server` (birinchi server emas — aniq belgilangani) |
| `mail.example.org` | 3 | Ham `*.example.org`, ham `mail.*` mos — `*` bilan **boshlanadigan** ustun |

```text vps
$ curl -s --http1.0 -H 'Host: ' -o /dev/null -w 'Host qiymatsiz: HTTP %{http_code}\n' http://127.0.0.1:8096/; curl -s --http1.0 -H 'Host:' http://127.0.0.1:8096/; echo "Host umuman yuborilmadi: curl kodi $?"
Host qiymatsiz: HTTP 400
Host umuman yuborilmadi: curl kodi 52
```

- `Host` header'i bor, lekin bo'sh — **400 Bad Request**.
- `Host` umuman yo'q (HTTP/1.0) — `server_name ""` server'iga tushdi va `return 444` ulanishni javobsiz yopdi: curl kodi 52 ("Empty reply from server").

### `location` tanlash

NG'dagi A–F misoli:

```nginx
server {
    listen 127.0.0.1:8097;
    location = / {
        return 200 "A: = /\n";
    }
    location / {
        return 200 "B: /\n";
    }
    location /documents/ {
        return 200 "C: /documents/\n";
    }
    location ^~ /images/ {
        return 200 "D: ^~ /images/\n";
    }
    location ~* \.(gif|jpg|jpeg)$ {
        return 200 "E: ~* rasm\n";
    }
    location $arg_pred {
        return 200 "F: predikat\n";
    }
}
```

```text vps
$ u() { printf '%-36s → %s' "$1" "$(curl -s "http://127.0.0.1:8097$1")"; echo; }; u /; u /index.html; u /documents/document.html; u /images/1.gif; u /documents/1.jpg; u '/documents/index.html?pred=1'; u '/documents/1.jpg?pred=1'; u /DOCUMENTS/1.JPG
/                                    → A: = /
/index.html                          → B: /
/documents/document.html             → C: /documents/
/images/1.gif                        → D: ^~ /images/
/documents/1.jpg                     → E: ~* rasm
/documents/index.html?pred=1         → F: predikat
/documents/1.jpg?pred=1              → E: ~* rasm
/DOCUMENTS/1.JPG                     → E: ~* rasm
```

| URI | Location | Nega |
| --- | --- | --- |
| `/` | A | `=` aniq mos — darhol |
| `/index.html` | B | Faqat `/` prefiksi mos, regex yo'q |
| `/documents/document.html` | C | Eng uzun prefiks `/documents/`, regex mos emas |
| `/images/1.gif` | D | `^~` — `.gif` regex'i tekshirilmadi |
| `/documents/1.jpg` | E | Prefiks C eslab qolindi, lekin regex E mos keldi — regex ustun |
| `/documents/index.html?pred=1` | F | Regex mos emas → predikat (`$arg_pred` = `1`) |
| `/documents/1.jpg?pred=1` | E | Regex predikatdan oldin tekshiriladi |
| `/DOCUMENTS/1.JPG` | E | `~*` katta-kichik harfni farqlamaydi; prefikslar (Linux'da) farqlaydi — C mos emas |

### Normallashtirish

`--path-as-is` — curl yo'lni o'zi o'zgartirmasdan yuborsin:

```text vps
$ v() { printf '%-36s → %s' "$1" "$(curl -s --path-as-is "http://127.0.0.1:8097$1")"; echo; }; v '/documents/../images/1.gif'; v '/documents//1.jpg'; v '/%64ocuments/x'
/documents/../images/1.gif           → D: ^~ /images/
/documents//1.jpg                    → E: ~* rasm
/%64ocuments/x                       → C: /documents/
```

- `/documents/../images/1.gif` → nginx `..` ni hal qildi → `/images/1.gif` → D.
- `//` bittaga qisqardi; `%64` → `d` ochildi → `/documents/x` → C.

```text vps
$ rm /etc/nginx/conf.d/tanlash.conf; nginx -t -q && nginx -s reload; echo ok
ok
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Standart serverni belgilamaslik | Noma'lum `Host` lar **birinchi** server'ga tushadi — tasodifiy sayt ochiladi | `listen … default_server` (masalan, `return 444` bilan) |
| Location'lar fayldagi tartib bilan tanlanadi deb o'ylash | Prefikslarda — eng uzuni; tartib faqat regex uchun (NG) | Algoritmni yodda tutish |
| Statik papka uchun oddiy prefiks, yonida rasm regex'i | Regex prefiksdan ustun (sinovda `/documents/1.jpg` → E) | `^~` |
| Location'da `?` argumentlarini tekshirish | Argumentlar solishtirilmaydi (NG) | `$arg_…` o'zgaruvchilari, predikat yoki `map` |
| Har so'rovga ko'p regex location | Har so'rovda regex'lar tartib bilan tekshiriladi | Iloji bo'lsa prefiks, tez-tez so'raladigan `=` |
| `*.example.org` va `mail.*` ikkalasi mos keladi deb kutish | Faqat bittasi — `*` bilan boshlanadigan ustun | NG tartibi |

## Amaliyot

1. nginx server tanlashda nimalarga qaraydi va qaysi tartibda?
2. Standart server qaysi? Uni qanday aniq belgilaysiz?
3. `server_name` turlari qaysi tartibda tekshiriladi?
4. `location /` va `location = /` farqi nima?
5. `^~` nima uchun kerak? Sinovda u nimani o'zgartirdi?
6. `/documents/1.jpg` nega C emas, E ga tushdi?

<details>
<summary>Javoblar</summary>

1. Avval IP va port (`listen`), keyin `Host` header'i (`server_name`); topilmasa — standart server.
2. Portdagi birinchi server yoki `listen … default_server`.
3. Aniq nom → `*` bilan boshlanadigan eng uzun → `*` bilan tugaydigan eng uzun → birinchi mos regex.
4. `/` — prefiks (hamma narsaga mos, oxirgi chora); `= /` — faqat aynan `/`, mos kelsa qidiruv darhol to'xtaydi.
5. Eng uzun mos prefiks `^~` bo'lsa, regex'lar tekshirilmaydi; `/images/1.gif` `.gif` regex'iga emas, D ga tushdi.
6. Prefikslardan keyin regex'lar tekshiriladi va mos regex prefiksdan ustun.

</details>

## Rasmiy hujjat

- [NG: How nginx processes a request](https://nginx.org/en/docs/http/request_processing.html)
- [NG: Server names](https://nginx.org/en/docs/http/server_names.html)
- [NG: location](https://nginx.org/en/docs/http/ngx_http_core_module.html#location) · [listen](https://nginx.org/en/docs/http/ngx_http_core_module.html#listen)

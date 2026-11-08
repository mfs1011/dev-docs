# 26 — So'rovlarni cheklash

[Mundarija](README.md)

## Tushuncha

NA (Limiting Access to Proxied HTTP Resources): nginx bilan cheklash mumkin:

- kalit (masalan, IP manzil) bo'yicha **ulanishlar soni**;
- kalit bo'yicha **so'rovlar tezligi** (soniya yoki daqiqasiga);
- ulanish uchun **yuklab olish tezligi** (`limit_rate`, 4-bobda ishlatilgan).

NA ogohlantiradi: NAT ortida ko'p foydalanuvchi bitta IP'ni bo'lishishi mumkin — IP bo'yicha cheklashni ehtiyotkorlik bilan.

### So'rovlar tezligi: `limit_req`

NA: **chelak teshigi** (leaky bucket) algoritmi — so'rovlar chelakka turli tezlikda tushadi va undan **belgilangan tezlikda** chiqadi. DDoS hujumlaridan yoki backend'ning bir vaqtda ko'p so'rov bilan to'lib qolishidan himoya.

```nginx
http {
    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
    server {
        location /search/ {
            limit_req zone=one;
        }
    }
}
```

- `limit_req_zone` — `http` darajasida: **kalit** (`$binary_remote_addr` — IP ikkilik ko'rinishda, IPv4 uchun 4 bayt, `$remote_addr` dan ixcham), **zona** (holat saqlanadigan umumiy xotira) va **tezlik** (`r/s` yoki soniyadan sekinroq uchun `r/m`).
- NA: 64 bitli platformada bitta holat 128 bayt — 1 MB zonada ~16 000 IP. Zona to'lsa — eng eskisi o'chiriladi; joy baribir yetmasa — 503.

| Parametr | Ortiqcha so'rovlar |
| --- | --- |
| (yo'q) | Darhol **rad etiladi** |
| `burst=N` | N tagacha **navbatga** qo'yiladi va belgilangan tezlikda **kechiktirib** bajariladi; navbatdan ortiqlari rad |
| `burst=N nodelay` | N tagacha **darhol** bajariladi (tezlikdan qat'i nazar); ortiqlari rad |
| `burst=N delay=M` | Birinchi M tasi darhol, keyingilari kechiktirib |

`limit_req_status` — rad etish kodi (standart **503**; masalan, 429). `limit_req_dry_run on;` — "sinov rejimi": cheklamaydi, lekin ortiqcha so'rovlar hisoblanadi va jurnalga `dry run` belgisi bilan yoziladi (NA). `limit_req_log_level` — standart `error` (NG).

### Ulanishlar soni: `limit_conn`

```nginx
limit_conn_zone $binary_remote_addr zone=addr:10m;
location /download/ {
    limit_conn addr 1;
}
```

NG: **hamma ulanishlar hisoblanmaydi** — faqat server so'roviga ishlov berayotgan va so'rov header'i to'liq o'qilgan ulanishlar. Kalit `$server_name` bo'lsa — butun server uchun umumiy cheklov (NA).

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Tezlik — 2 so'rov/s (har 500 ms da bittadan):

```nginx
limit_req_zone  $binary_remote_addr zone=one:10m rate=2r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    listen 127.0.0.1:8115;
    root /var/www/lim;

    location /qattiq/  { limit_req zone=one; }
    location /burst/   { limit_req zone=one burst=3; }
    location /nodelay/ { limit_req zone=one burst=3 nodelay; }
    location /kod429/  { limit_req zone=one; limit_req_status 429; }
    location /sinov/   { limit_req zone=one; limit_req_dry_run on; }
    location /yuklab/  { limit_conn addr 1; limit_rate 1m; }
}
```

```text vps
$ for d in qattiq burst nodelay kod429 sinov yuklab; do mkdir -p /var/www/lim/$d; echo ok > /var/www/lim/$d/a.html; done; head -c 2097152 /dev/zero > /var/www/lim/yuklab/katta.bin; cp /root/limit.conf /etc/nginx/conf.d/limit.conf; rm /root/limit.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

`p URI son` — shuncha so'rovni **bir vaqtda** yuboradi; har biri: `kod@vaqt`:

```text vps
$ p() { for i in $(seq 1 $2); do curl -s -o /dev/null -w "%{http_code}@%{time_total}s " "http://127.0.0.1:8115$1" & done; wait; echo; }; echo -n 'qattiq:  '; p /qattiq/a.html 6; sleep 2
qattiq:  200@0.001390s 503@0.003596s 503@0.007371s 503@0.010467s 503@0.003848s 503@0.003721s 
$ echo -n 'burst=3: '; p /burst/a.html 6; sleep 3; echo -n 'nodelay: '; p /nodelay/a.html 6; sleep 3
burst=3: 200@0.000409s 503@0.005398s 503@0.000347s 200@0.500263s 200@1.004723s 200@1.502167s 
nodelay: 200@0.000397s 200@0.002286s 200@0.010924s 200@0.007743s 503@0.010458s 503@0.010204s 
```

| Rejim | 6 ta bir vaqtdagi so'rov |
| --- | --- |
| `burst` siz | 1 ta 200, 5 tasi darhol **503** |
| `burst=3` | 1 ta darhol, 3 tasi **0,5 / 1,0 / 1,5 s** da (2 r/s tezlikda navbat), 2 tasi 503 |
| `burst=3 nodelay` | 4 tasi **darhol** 200, 2 tasi 503 |

### Kod, sinov rejimi, jurnal

```text vps
$ echo -n 'kod429:  '; p /kod429/a.html 3; sleep 2; echo -n 'dry_run: '; p /sinov/a.html 4; grep -c 'dry run' /var/log/nginx/error.log | sed 's/^/jurnalda "dry run": /'; grep 'limiting requests' /var/log/nginx/error.log | grep -v 'dry run' | tail -1 | grep -oE '\[[a-z]+\].*excess: [0-9.]+ by zone "[a-z]+"' | sed -E 's/[0-9]+#[0-9]+: \*[0-9]+ //'
kod429:  429@0.002635s 200@0.003589s 429@0.000648s 
dry_run: 200@0.002812s 200@0.004610s 200@0.000948s 200@0.003064s 
jurnalda "dry run": 3
[error] limiting requests, excess: 0.998 by zone "one"
```

- `limit_req_status 429` — rad etilganlar 503 emas, 429 Too Many Requests.
- `limit_req_dry_run on` — 4 tasi ham 200, jurnalda 3 ta `dry run` yozuvi (cheklov bo'lganda rad etilardi).
- Haqiqiy rad etish jurnalda `[error] limiting requests, excess: … by zone "one"` bilan.

### Bir vaqtdagi ulanishlar

`limit_conn addr 1` — bitta IP'dan bittadan ko'p yuklab olish yo'q:

```text vps
$ for i in 1 2; do curl -s -o /dev/null -w "yuklab $i: %{http_code} %{size_download} bayt %{time_total}s\n" http://127.0.0.1:8115/yuklab/katta.bin & sleep 0.2; done; wait; tail -n 1 /var/log/nginx/error.log | grep -oE 'limiting connections by zone "[a-z]+"'
yuklab 2: 503 197 bayt 0.000718s
yuklab 1: 200 2097152 bayt 1.001919s
limiting connections by zone "addr"
```

Birinchi yuklab olish davom etayotganda ikkinchisi — darhol **503**; jurnalda `limiting connections by zone "addr"`.

```text vps
$ rm /etc/nginx/conf.d/limit.conf; rm -rf /var/www/lim; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vazifa | Sozlama |
| --- | --- |
| Login sahifasini parol terishdan himoya | `limit_req zone=… rate=5r/m` (faqat shu location) |
| API: qisqa to'lqinlarga ruxsat, lekin o'rtacha cheklov | `burst=20 nodelay` |
| Avval sinab ko'rish | `limit_req_dry_run on` |
| Katta fayllar | `limit_conn` + `limit_rate` |
| Mijozga aniq javob | `limit_req_status 429` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `burst` siz qattiq cheklov | Bir vaqtdagi so'rovlarning ko'pi rad etiladi (sinovda 6 tadan 5 tasi) | `burst` (va kerak bo'lsa `nodelay`) |
| `burst` ni "darhol bajarish" deb o'ylash | `nodelay` siz — kechiktiriladi (sinovda 0,5–1,5 s) | `nodelay` |
| Proksi ortida `$binary_remote_addr` | Hamma — proksi IP'si, birga cheklanadi | Avval realip (17-bob) |
| NAT ortidagi foydalanuvchilarni hisobga olmaslik | Bitta IP — ko'p odam (NA) | Yumshoqroq chegara yoki boshqa kalit |
| Cheklovni sinovsiz production'ga | Haqiqiy foydalanuvchilar rad etiladi | `limit_req_dry_run on` bilan oldin |
| 503 ni server xatosi deb o'ylash | Cheklov ham 503 qaytaradi | Jurnaldagi `limiting requests` yoki 429 |

## Amaliyot

1. `limit_req` qaysi algoritmga asoslangan?
2. `$binary_remote_addr` nega `$remote_addr` dan yaxshiroq?
3. `burst=3` va `burst=3 nodelay` farqi nima? Sinovda nima bo'ldi?
4. Rad etilgan so'rovlar standart holatda qaysi kodni oladi?
5. `limit_req_dry_run` nima uchun?
6. `limit_conn` qaysi ulanishlarni hisoblaydi?

<details>
<summary>Javoblar</summary>

1. Chelak teshigi (leaky bucket).
2. Ixcham (IPv4 uchun 4 bayt) — zona ko'proq IP sig'diradi.
3. `burst=3` — 3 tasi navbatda kechiktiriladi (0,5–1,5 s); `nodelay` — 3 tasi darhol. Ikkalasida ortiqchasi 503.
4. 503 (`limit_req_status` bilan o'zgaradi).
5. Cheklamasdan, qaysi so'rovlar cheklanishini jurnalda ko'rish.
6. So'roviga ishlov berilayotgan va header'i to'liq o'qilganlarini.

</details>

## Rasmiy hujjat

- [NA: Limiting Access to Proxied HTTP Resources](https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-http/)
- [NG: ngx_http_limit_req_module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
- [NG: ngx_http_limit_conn_module](https://nginx.org/en/docs/http/ngx_http_limit_conn_module.html)

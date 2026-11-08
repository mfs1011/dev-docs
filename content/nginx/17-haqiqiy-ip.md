# 17 — Mijozning haqiqiy IP manzili

[Mundarija](README.md)

## Tushuncha

nginx oldida yana bir proksi (CDN, bulut balansiri, boshqa nginx) tursa, nginx uchun ulanish **o'sha proksidan** keladi: `$remote_addr` — proksi manzili, mijozniki emas. Mijoz manzili proksi qo'shgan header'da — odatda `X-Forwarded-For` yoki `X-Real-IP` (11-bob).

`X-Forwarded-For` ni **mijozning o'zi** ham yuborishi mumkin (11-bobda nginx mijoz yozgan qiymatni saqlab, oxiriga qo'shgan edi). Shuning uchun header'ga faqat **ishonchli proksidan** kelganda ishonish kerak.

### `ngx_http_realip_module`

NG: mijoz manzilini (va portini) ko'rsatilgan header'dagi qiymat bilan **almashtiradi**. Rasmiy paketda bor (`--with-http_realip_module`, 2-bob).

| Direktiva | Standart | Nima (NG) |
| --- | --- | --- |
| `set_real_ip_from manzil \| CIDR \| unix:;` | — | **Ishonchli** manzillar — to'g'ri almashtirish manzilini yuborishi ma'lum bo'lganlar |
| `real_ip_header maydon;` | `X-Real-IP` | Qaysi header'dan olish: `X-Real-IP`, `X-Forwarded-For`, istalgan nom yoki `proxy_protocol` |
| `real_ip_recursive on \| off;` | `off` | Rekursiv qidiruv |

`real_ip_recursive` (NG):

- `off` — ishonchli manzildan kelgan ulanish manzili header'dagi **oxirgi** manzil bilan almashtiriladi;
- `on` — header'dagi **oxirgi ishonchsiz** manzil bilan (o'ngdan chapga, ishonchlilarni o'tkazib).

O'zgaruvchilar: `$realip_remote_addr`, `$realip_remote_port` — **asl** ulanish manzili va porti.

NG namunasi:

```nginx
set_real_ip_from  192.168.1.0/24;
set_real_ip_from  192.168.2.1;
set_real_ip_from  2001:0db8::/32;
real_ip_header    X-Forwarded-For;
real_ip_recursive on;
```

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Oldidagi proksi `127.0.0.1` dan keladi deb faraz qilinadi; `curl --interface 127.0.0.2` — "ishonchsiz" manzildan kelgan so'rov:

```nginx
# Ilova oldidagi proksi (CDN, balanser) 127.0.0.1 dan keladi deb faraz qilamiz

# 1) realip location darajasida — return bilan birga (tuzoq)
server {
    listen 127.0.0.1:8112;
    location / {
        set_real_ip_from 127.0.0.1;
        real_ip_header   X-Forwarded-For;
        return 200 "remote_addr=$remote_addr\n";
    }
}

# 2) realip server darajasida
server {
    listen 127.0.0.1:8113;
    set_real_ip_from 127.0.0.1;
    real_ip_header   X-Forwarded-For;
    location / {
        return 200 "remote_addr=$remote_addr (asl ulanish: $realip_remote_addr)\n";
    }
}

# 3) rekursiv: ichki proksilar (10.0.0.0/8) ham ishonchli
server {
    listen 127.0.0.1:8114;
    set_real_ip_from 127.0.0.1;
    set_real_ip_from 10.0.0.0/8;
    real_ip_header   X-Forwarded-For;
    real_ip_recursive on;
    location / {
        return 200 "remote_addr=$remote_addr (asl ulanish: $realip_remote_addr)\n";
    }
}
```

```text vps
$ cp /root/realip.conf /etc/nginx/conf.d/realip.conf; rm /root/realip.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

`r port X-Forwarded-For [manba]` — server ko'rgan `$remote_addr`:

### Location darajasida — tuzoq

```text vps
$ r() { printf '%-5s %-40s → %s' "$1" "$2" "$(curl -s ${3:+--interface $3} -H "X-Forwarded-For: $2" "http://127.0.0.1:$1/")"; echo; }; r 8112 '203.0.113.7'
8112  203.0.113.7                              → remote_addr=127.0.0.1
```

Kuzatildi: realip direktivalari `return` bilan bitta **location** ichida bo'lganda `$remote_addr` almashtirilmadi (`127.0.0.1`). `server` darajasiga ko'chirilgach — ishladi (quyida).

### `server` darajasida

```text vps
$ r 8113 '203.0.113.7'; r 8113 '198.51.100.9, 203.0.113.7'; r 8113 '203.0.113.7' 127.0.0.2
8113  203.0.113.7                              → remote_addr=203.0.113.7 (asl ulanish: 127.0.0.1)
8113  198.51.100.9, 203.0.113.7                → remote_addr=203.0.113.7 (asl ulanish: 127.0.0.1)
8113  203.0.113.7                              → remote_addr=127.0.0.2 (asl ulanish: 127.0.0.2)
```

| Holat | `$remote_addr` | Nega |
| --- | --- | --- |
| Ishonchli `127.0.0.1` dan, `203.0.113.7` | `203.0.113.7` | Header'dan olindi; asl ulanish `$realip_remote_addr` da |
| `198.51.100.9, 203.0.113.7` | `203.0.113.7` | `recursive off` — **oxirgi** manzil |
| Ishonchsiz `127.0.0.2` dan | `127.0.0.2` | Header'ga **ishonilmadi** — yolg'on `X-Forwarded-For` yuborgan mijoz o'zini boshqa qila olmadi |

### Rekursiv

Mijoz → CDN → ichki proksi (`10.0.0.5`) → nginx:

```text vps
$ r 8113 '198.51.100.9, 10.0.0.5'; r 8114 '198.51.100.9, 10.0.0.5'; r 8114 '198.51.100.9, 203.0.113.7, 10.0.0.5'
8113  198.51.100.9, 10.0.0.5                   → remote_addr=10.0.0.5 (asl ulanish: 127.0.0.1)
8114  198.51.100.9, 10.0.0.5                   → remote_addr=198.51.100.9 (asl ulanish: 127.0.0.1)
8114  198.51.100.9, 203.0.113.7, 10.0.0.5      → remote_addr=203.0.113.7 (asl ulanish: 127.0.0.1)
```

| Server | Header | `$remote_addr` | Nega |
| --- | --- | --- | --- |
| 8113 (`off`) | `198.51.100.9, 10.0.0.5` | `10.0.0.5` | Oxirgisi — ichki proksi, mijoz emas |
| 8114 (`on`, `10.0.0.0/8` ishonchli) | `198.51.100.9, 10.0.0.5` | `198.51.100.9` | Ishonchli `10.0.0.5` o'tkazildi |
| 8114 | `198.51.100.9, 203.0.113.7, 10.0.0.5` | `203.0.113.7` | Oxirgi **ishonchsiz** — `198.51.100.9` ni mijoz o'zi yozgan bo'lishi mumkin |

```text vps
$ rm /etc/nginx/conf.d/realip.conf; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Oldingi qatlam | Sozlama |
| --- | --- |
| Bitta ishonchli proksi | `set_real_ip_from <proksi>; real_ip_header X-Forwarded-For;` |
| CDN + ichki proksilar | Hammasini `set_real_ip_from` ga + `real_ip_recursive on` |
| CDN o'z header'ini yuboradi | `real_ip_header <CDN header nomi>;` + CDN manzillar ro'yxati |
| TCP balanser PROXY protokoli bilan | `listen … proxy_protocol;` + `real_ip_header proxy_protocol;` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `set_real_ip_from 0.0.0.0/0` (hammaga ishonish) | Har kim `X-Forwarded-For` bilan o'zini istalgan IP qiladi | Faqat haqiqiy proksilar manzillari |
| Ilovada `X-Forwarded-For` ning **birinchi** qiymatiga ishonish | Uni mijoz yozadi | nginx realip natijasi (`$remote_addr`) ni uzatish |
| Ichki proksilarni ishonchli ro'yxatga qo'shmaslik | `$remote_addr` — ichki proksi (sinovda `10.0.0.5`) | `set_real_ip_from` + `real_ip_recursive on` |
| realip'ni `return` bilan bir location'da sinash | Natija ko'rinmadi (kuzatildi) | `server` yoki `http` darajasida |
| CDN manzillari ro'yxatini yangilamaslik | Yangi manzillardan kelganlar ishonchsiz | Ro'yxatni CDN manbasidan muntazam yangilash |

## Amaliyot

1. Nega proksi ortida `$remote_addr` mijoz manzili emas?
2. `set_real_ip_from` nima uchun kerak?
3. `real_ip_recursive off` va `on` farqi nima?
4. Sinovda ishonchsiz manzildan yolg'on `X-Forwarded-For` yuborilganda nima bo'ldi?
5. `198.51.100.9, 10.0.0.5` header'ida mijoz qaysi — `off` va `on` holatlarida nginx nimani tanladi?
6. Asl ulanish manzili qaysi o'zgaruvchida?

<details>
<summary>Javoblar</summary>

1. Ulanish proksidan keladi; mijoz manzili header'da.
2. Faqat shu manzillardan kelgan header'ga ishonish uchun.
3. `off` — header'dagi oxirgi manzil; `on` — oxirgi ishonchsiz manzil.
4. Header e'tiborsiz qoldirildi — `$remote_addr` haqiqiy manzil (`127.0.0.2`) bo'lib qoldi.
5. Mijoz — `198.51.100.9`; `off` — `10.0.0.5`, `on` (`10.0.0.0/8` ishonchli) — `198.51.100.9`.
6. `$realip_remote_addr`.

</details>

## Rasmiy hujjat

- [NG: ngx_http_realip_module](https://nginx.org/en/docs/http/ngx_http_realip_module.html)
- [NG: $proxy_add_x_forwarded_for](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#var_proxy_add_x_forwarded_for)

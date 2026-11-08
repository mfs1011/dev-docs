# 07 — Redirect va rewrite

[Mundarija](README.md)

## Tushuncha

NG (`ngx_http_rewrite_module`): bu modul PCRE muntazam ifodalari bilan **so'rov URI'sini o'zgartiradi**, **yo'naltirish** (redirect) qaytaradi va shartga qarab konfiguratsiya tanlaydi. Direktivalari: `return`, `rewrite`, `break`, `if`, `set`.

Bajarilish tartibi (NG):

1. `server` darajasidagi shu modul direktivalari ketma-ket bajariladi.
2. Takrorlanadi: URI bo'yicha `location` qidiriladi → topilgan location ichidagi direktivalar bajariladi → URI qayta yozilgan bo'lsa, sikl yana — lekin **10 martadan ko'p emas**.

### `return`

```text
return kod [matn];
return kod URL;
return URL;
```

NG: ishlov berishni to'xtatadi va mijozga kodni qaytaradi.

- 301, 302, 303, 307, 308 — yo'naltirish URL bilan; boshqa kodlar — javob matni bilan. Ikkalasida ham o'zgaruvchilar bo'lishi mumkin.
- URL shu serverdagi URI bo'lsa (`/yangi`), to'liq URL so'rov sxemasi (`$scheme`), `server_name_in_redirect` va `port_in_redirect` asosida quriladi.
- `return URL;` — 302; URL `http://`, `https://` yoki `$scheme` bilan boshlanishi kerak.
- 444 — nostandart kod: javobsiz ulanishni yopadi (6-bob).

| Kod | Ma'nosi (Web asoslari kitobi, 10-bob) |
| --- | --- |
| 301 / 308 | Doimiy ko'chirildi (308 — metod va tana o'zgarmaydi) |
| 302 / 307 | Vaqtincha (307 — metod va tana o'zgarmaydi) |
| 303 | Boshqa resursni GET bilan olish |

### `rewrite`

```text
rewrite regex almashtirish [bayroq];
```

NG: regex so'rov URI'siga mos kelsa, URI almashtirish satriga o'zgartiriladi. `rewrite` lar fayldagi tartib bilan bajariladi. Almashtirish `http://`, `https://` yoki `$scheme` bilan boshlansa — ishlov to'xtaydi va mijozga yo'naltirish qaytadi.

| Bayroq | Nima |
| --- | --- |
| `last` | Shu modul direktivalarini to'xtatib, o'zgargan URI uchun **yangi location qidiradi** |
| `break` | Shu modul direktivalarini to'xtatadi; joriy location'da davom etadi |
| `redirect` | 302 yo'naltirish |
| `permanent` | 301 yo'naltirish |

NG qoidalari:

- Almashtirishda yangi argumentlar bo'lsa, **eski argumentlar ularning oxiriga qo'shiladi**; kerak bo'lmasa — oxiriga `?`: `rewrite ^/users/(.*)$ /show?user=$1? last;`.
- Regex'da `}` yoki `;` bo'lsa — butun ifoda qo'shtirnoqqa olinadi.
- Location **ichida** `last` ishlatilsa va yangi URI yana shu location'ga tushib, yana qayta yozilsa — 10 sikldan keyin **500**. Location ichida odatda `break`.

Regex guruhlari: `$1`, `$2`… yoki nomlangan: `(?<yil>\d{4})` → `$yil`.

### To'g'ri yo'l: alohida server va `return`

NG (Converting rewrite rules): Apache `.htaccess` dagi `RewriteCond %{HTTP_HOST}` qoidalarini `if ($http_host = …) { rewrite … }` ga aylantirish — "noto'g'ri, noqulay va samarasiz". To'g'risi — har domen uchun **alohida server**:

```nginx
server {
    listen       80;
    server_name  example.org;
    return       301 http://www.example.org$request_uri;
}
server {
    listen       80;
    server_name  www.example.org;
    ...
}
```

`$request_uri` — asl URI argumentlari bilan.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8), `127.0.0.1:8098`.

### Qo'shtirnoqsiz regex

Birinchi urinishda `rewrite ^/maqola/(?<yil>\d{4})/…` qo'shtirnoqsiz yozilgan edi:

```text vps
$ mkdir -p /var/www/dl/download/albom/mp3 /var/www/dl/yuklash/albom/mp3; echo 'mp3 fayl' > /var/www/dl/download/albom/mp3/qoshiq.mp3; cp /var/www/dl/download/albom/mp3/qoshiq.mp3 /var/www/dl/yuklash/albom/mp3/; cp /root/yonalt.conf /etc/nginx/conf.d/yonalt.conf; rm /root/yonalt.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
nginx: [emerg] directive "rewrite" is not terminated by ";" in /etc/nginx/conf.d/yonalt.conf:22
nginx: configuration file /etc/nginx/nginx.conf test failed
yuklandi
```

`{4}` dagi `}` ni nginx blok oxiri deb tushundi — NG aytgan holat. Qo'shtirnoq bilan tuzatilgan konfiguratsiya:

```nginx
server {
    listen 127.0.0.1:8098;
    server_name example.org;
    return 301 http://www.example.org$request_uri;
}
server {
    listen 127.0.0.1:8098;
    server_name www.example.org;
    root /var/www/dl;

    location = /eski {
        return 301 /yangi;
    }
    location = /qidir {
        return 302 https://duckduckgo.com/?q=$arg_q;
    }
    location = /yopildi {
        return 410 "bu sahifa olib tashlandi\n";
    }
    rewrite ^/users/(.*)$ /show?user=$1 last;
    rewrite ^/u2/(.*)$ /show?user=$1? last;
    rewrite "^/maqola/(?<yil>\d{4})/(?<slug>[a-z-]+)$" /show?yil=$yil&slug=$slug last;
    rewrite ^/blog/(.*)$ /maqolalar/$1 permanent;

    location = /show {
        return 200 "show: args=$args\n";
    }
    location /download/ {
        rewrite ^(/download/.*)/media/(.*)\..*$ $1/mp3/$2.mp3 break;
    }
    location /yuklash/ {
        rewrite ^(/yuklash/.*)/media/(.*)\..*$ $1/mp3/$2.mp3 last;
    }
}
```

### `return`

`r URI [Host]` — kod, `Location` header'i va javob boshi:

```text vps
$ r() { curl -s -o /tmp/j -D /tmp/h -H "Host: ${2:-www.example.org}" "http://127.0.0.1:8098$1"; printf '%-34s %s %s %s\n' "$1" "$(head -1 /tmp/h | cut -d' ' -f2)" "$(grep -i '^Location:' /tmp/h | tr -d '\r')" "$(head -c 60 /tmp/j | tr '\n' ' ' | grep -v '<html>')"; }; r '/biror/sahifa?x=1' example.org; r /eski; r '/qidir?q=nginx'; r /yopildi
/biror/sahifa?x=1                  301 Location: http://www.example.org/biror/sahifa?x=1 
/eski                              301 Location: http://www.example.org:8098/yangi 
/qidir?q=nginx                     302 Location: https://duckduckgo.com/?q=nginx 
/yopildi                           410  bu sahifa olib tashlandi 
```

- `example.org` → `www.example.org`, **argumentlar bilan** (`$request_uri`).
- `return 301 /yangi` — nisbiy URI'dan to'liq URL qurildi: sxema, `Host` va **port** (`:8098`) qo'shildi (`port_in_redirect` standart yoqilgan).
- `return 302 https://…?q=$arg_q` — o'zgaruvchi bilan tashqi URL.
- `return 410 "…"` — yo'naltirish emas, matnli javob.

### `rewrite`

```text vps
$ r '/users/ali'; r '/users/ali?tab=1'; r '/u2/ali?tab=1'; r '/maqola/2026/nginx-rewrite'; r '/maqola/26/xato'; r '/blog/salom?ref=x'
/users/ali                         200  show: args=user=ali 
/users/ali?tab=1                   200  show: args=user=ali&tab=1 
/u2/ali?tab=1                      200  show: args=user=ali 
/maqola/2026/nginx-rewrite         200  show: args=yil=2026&slug=nginx-rewrite 
/maqola/26/xato                    404  
/blog/salom?ref=x                  301 Location: http://www.example.org:8098/maqolalar/salom?ref=x 
```

| URI | Natija | Nega |
| --- | --- | --- |
| `/users/ali` | `user=ali` | `$1` |
| `/users/ali?tab=1` | `user=ali&tab=1` | Eski argumentlar oxiriga qo'shildi |
| `/u2/ali?tab=1` | `user=ali` | Oxirida `?` — eski argumentlar tashlandi |
| `/maqola/2026/nginx-rewrite` | `yil=2026&slug=…` | Nomlangan guruhlar |
| `/maqola/26/xato` | 404 | `\d{4}` mos emas — rewrite bo'lmadi |
| `/blog/salom?ref=x` | 301 | `permanent`; argumentlar saqlandi |

### `break` va `last`

```text vps
$ r '/download/albom/media/qoshiq.ogg'; r '/yuklash/albom/media/qoshiq.ogg'; tail -n 1 /var/log/nginx/error.log | grep -o 'rewrite or internal redirection cycle[^,]*'
/download/albom/media/qoshiq.ogg   200  mp3 fayl 
/yuklash/albom/media/qoshiq.ogg    200  mp3 fayl 
```

Ikkalasi ham faylni berdi: `last` bilan yangi URI (`…/mp3/qoshiq.mp3`) yana `/yuklash/` location'iga tushdi, lekin unda `/media/` yo'q — regex mos kelmadi, sikl to'xtadi. Kuzatildi: NG ogohlantirgan 10 siklli xato **har doim emas**, faqat yangi URI yana qayta yozilsa yuz beradi:

```text vps
$ printf '%s\n' 'server {' '    listen 127.0.0.1:8099;' '    location /tsikl/ {' '        rewrite ^/tsikl/(.*)$ /tsikl/$1 last;' '    }' '}' > /etc/nginx/conf.d/tsikl.conf; cat /etc/nginx/conf.d/tsikl.conf; nginx -t -q && nginx -s reload; sleep 0.5; curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:8099/tsikl/a; tail -n 1 /var/log/nginx/error.log | grep -o 'rewrite or internal redirection cycle[^,]*'
server {
    listen 127.0.0.1:8099;
    location /tsikl/ {
        rewrite ^/tsikl/(.*)$ /tsikl/$1 last;
    }
}
HTTP 500
rewrite or internal redirection cycle while processing "/tsikl/a"
$ rm /etc/nginx/conf.d/tsikl.conf; nginx -t -q && nginx -s reload; echo ok
ok
```

`/tsikl/a` → `/tsikl/a` → … — 10 sikldan keyin **500**, jurnalda `rewrite or internal redirection cycle`.

## Variantlar

| Vazifa | Yaxshi yo'l | Yomon yo'l |
| --- | --- | --- |
| Domenni boshqasiga | Alohida server + `return 301 …$request_uri` | `if ($http_host …)` + `rewrite` (NG) |
| Bitta sahifa ko'chdi | `location = /eski { return 301 /yangi; }` | Umumiy `rewrite` |
| URI qismlarini qayta tartiblash | `rewrite … last` (server darajasida) | — |
| Location ichida URI o'zgartirib, shu yerda berish | `rewrite … break` | `last` (sikl xavfi) |
| HTTP → HTTPS | `return 301 https://$host$request_uri;` (21-bob) | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `}` yoki `;` li regex'ni qo'shtirnoqsiz | `nginx -t` xatosi (sinovda shunday) | `"…"` ichida |
| Location ichida `last` bilan o'z-o'zini qayta yozish | 10 sikl → 500 | `break` |
| Argumentlarni tashlamoqchi bo'lib `?` ni unutish | Eski argumentlar qo'shiladi | Almashtirish oxirida `?` |
| Yo'naltirishda `$uri` ishlatish | Argumentlar yo'qoladi | `$request_uri` |
| `if` + `rewrite` bilan domen tekshirish | NG: "noto'g'ri va samarasiz" | Alohida `server` |
| Vaqtinchalik ko'chirishga 301 | 301 — doimiy ko'chirish ma'nosida (Web asoslari, 10-bob) | Vaqtincha — 302/307 |
| Nisbiy `return 301 /x` dan portsiz URL kutish | nginx portni ham qo'shadi (sinovda `:8098`) | To'liq URL yoki `port_in_redirect off` |

## Amaliyot

1. `return` va `rewrite` farqi nima?
2. `last` va `break` farqi nima? Qachon `last` 500 ga olib keladi?
3. `rewrite ^/a/(.*)$ /b?x=$1 last;` — `/a/1?y=2` so'rovida `$args` nima bo'ladi? Oxiriga `?` qo'shilsa-chi?
4. Nega `example.org` → `www.example.org` uchun alohida server yaxshiroq?
5. Regex qachon qo'shtirnoqqa olinishi shart?
6. `return 301 /yangi` sinovda qanday `Location` berdi?

<details>
<summary>Javoblar</summary>

1. `return` — darhol javob yoki yo'naltirish; `rewrite` — URI'ni regex bilan o'zgartiradi (bayroqqa qarab qayta qidirish, davom etish yoki yo'naltirish).
2. `last` — yangi location qidiradi; `break` — joriy location'da qoladi. Yangi URI yana qayta yoziladigan bo'lsa — 10 sikldan keyin 500.
3. `x=1&y=2`; `?` bilan — `x=1`.
4. NG bo'yicha `if` + `rewrite` noto'g'ri va samarasiz; alohida server oddiy va tez.
5. Ifodada `}` yoki `;` bo'lsa.
6. `http://www.example.org:8098/yangi` — sxema, host va port qo'shildi.

</details>

## Rasmiy hujjat

- [NG: ngx_http_rewrite_module](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html)
- [NG: Converting rewrite rules](https://nginx.org/en/docs/http/converting_rewrite_rules.html)
- [NG: port_in_redirect](https://nginx.org/en/docs/http/ngx_http_core_module.html#port_in_redirect)

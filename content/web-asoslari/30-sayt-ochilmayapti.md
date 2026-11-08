# 30 — ⚑ Sayt ochilmayapti

[Mundarija](README.md)

## Tushuncha

Butun kitob bitta savolga javob berishga tayyorlaydi: **sayt ochilmasa, muammo qayerda?** 1-bobdagi yo'l bo'ylab — pastdan yuqoriga — har qatlamni tekshiramiz. Birinchi buzilgan qatlam topilsa, undan yuqorisini tekshirishning ma'nosi yo'q.

⚑ Bu bobdagi har buyruq va xato ma'nosi oldingi boblardagi rasmiy manbalardan; tekshirish **ketma-ketligi** esa amaliyot — rasmiy hujjatda bitta joyda yozilmagan.

```text
1 DNS     → nom IP manzilga aylanadimi?           (4-bob)
2 TCP     → shu IP:portga ulanib bo'ladimi?        (3-bob)
3 TLS     → shifrlangan ulanish va sertifikat?     (25–26-boblar)
4 HTTP    → server qanday holat kodi qaytaradi?    (8-bob)
5 Brauzer → konsol va Network paneli               (18–24, 29-boblar)
```

### Har qatlamda nima ko'rinadi

| Qatlam | Belgisi | Tekshirish | Odatiy sabab |
| --- | --- | --- | --- |
| **DNS** | Brauzer: sayt topilmadi; `dig`: `NXDOMAIN` yoki javob yo'q | `dig +short nom A`, `dig +trace` | Domen yozilishi xato, yozuv yo'q, yangi o'zgarish hali keshda (TTL, 4-bob) |
| **TCP — rad etildi** | `curl: (7) … Could not connect`, darhol | `curl -v`, `ss -tln` (serverda) | Portda dastur ishlamayapti (RST, 3-bob) |
| **TCP — javob yo'q** | Uzoq kutish, keyin vaqt tugashi | 5 soniyalik urinish | Xavfsizlik devori paketni tashlab yuboryapti; noto'g'ri IP; marshrut |
| **TLS** | Brauzer ogohlantirishi; `curl: (60)` yoki `(35)` | `openssl s_client -servername … -verify_hostname …` | Muddat o'tgan, nom mos emas, zanjir to'liq emas, o'z-o'zidan imzolangan (26-bob) |
| **HTTP 4xx** | `404`, `401`, `403`, `429` | `curl -i` | URL xato, autentifikatsiya yo'q, ruxsat yo'q, tezlik cheklovi (8, 16-boblar) |
| **HTTP 5xx** | `500`, `502`, `503`, `504` | `curl -i`, proksi va ilova jurnallari | Ilova xatosi; `502`/`504` — proksi orqasidagi ilova ishlamayapti yoki sekin (8-bob) |
| **Yo'naltirish** | Cheksiz aylanish, `ERR_TOO_MANY_REDIRECTS` | `curl -sL -w '%{num_redirects}'` | Redirect halqasi (10-bob) |
| **Brauzer** | Sahifa ochiladi, lekin ishlamaydi | Konsol, Network paneli | CORS (19), aralash kontent (23), CSP (21), kesh (11), cookie `SameSite` (14) |

## Ko'rib chiqamiz

Birinchi to'rt qatlamni ketma-ket tekshiradigan kichik skript. Har qatlam oldingi boblarda ishlatilgan vosita bilan: `dig`, Bash'ning `/dev/tcp` qurilmasi (Bash qo'llanmasi: `/dev/tcp/host/port` — shu xost va portga TCP soket ochishga urinadi), `openssl s_client`, `curl`. Birinchi xatoda to'xtaydi va chiqish kodi — xato qatlami raqami:

```bash
#!/bin/bash
# tekshir.sh URL — sayt ochilmasa, qaysi qatlamda muammo ekanini bosqichma-bosqich ko'rsatadi
url=$1
host=$(echo "$url" | sed -E 's#^[a-z]+://([^/:]+).*#\1#')
sxema=$(echo "$url" | sed -E 's#^([a-z]+)://.*#\1#')
port=$(echo "$url" | sed -nE 's#^[a-z]+://[^/:]+:([0-9]+).*#\1#p'); [ -z "$port" ] && { [ "$sxema" = https ] && port=443 || port=80; }

# 1. DNS (4-bob)
if [[ $host =~ ^[0-9.]+$ ]]; then ip=$host; echo "1 DNS     : IP manzil berilgan ($ip)"
else
  ip=$(dig +short -4 "$host" A | grep -E '^[0-9.]+$' | head -1)
  [ -z "$ip" ] && { echo "1 DNS     : XATO — '$host' uchun A yozuv yo'q ($(dig "$host" A | grep -o 'status: [A-Z]*'))"; exit 1; }
  echo "1 DNS     : ok — $host -> $ip"
fi

# 2. TCP ulanish (3-bob)
if timeout 5 bash -c "exec 3<>/dev/tcp/$ip/$port" 2>/dev/null; then echo "2 TCP     : ok — $ip:$port ochiq"
else
  rc=$?; [ $rc -eq 124 ] && echo "2 TCP     : XATO — $ip:$port javob bermadi (5 s), paket tashlab yuborilmoqda (firewall?)" \
                         || echo "2 TCP     : XATO — $ip:$port ulanish rad etildi (portda dastur yo'q)"
  exit 2
fi

# 3. TLS va sertifikat (25–26-boblar)
if [ "$sxema" = https ]; then
  natija=$(timeout 10 openssl s_client -connect "$ip:$port" -servername "$host" -verify_hostname "$host" -brief </dev/null 2>&1)
  kod=$(timeout 10 openssl s_client -connect "$ip:$port" -servername "$host" -verify_hostname "$host" </dev/null 2>/dev/null | grep -o 'Verify return code: .*')
  if echo "$kod" | grep -q ': 0 (ok)'; then echo "3 TLS     : ok — $(echo "$natija" | grep -o 'TLSv[0-9.]*' | head -1), sertifikat to'g'ri"
  else [ -z "$kod" ] && kod="kelishuv bo'lmadi"; echo "3 TLS     : XATO — $kod"; exit 3; fi
fi

# 4. HTTP holat kodi (8-bob)
kod=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$url")
case $kod in
  2??) echo "4 HTTP    : ok — $kod" ;;
  3??) echo "4 HTTP    : $kod — yo'naltirish: $(curl -s -o /dev/null -m 15 -w '%{redirect_url}' "$url")" ;;
  4??) echo "4 HTTP    : XATO — $kod (mijoz tomoni: URL, autentifikatsiya, ruxsat)"; exit 4 ;;
  5??) echo "4 HTTP    : XATO — $kod (server tomoni; 502/504 — proksi orqasidagi ilova)"; exit 5 ;;
  *)   echo "4 HTTP    : XATO — javob yo'q ($kod)"; exit 6 ;;
esac
echo "Server tomoni joyida. Sahifa baribir ishlamasa — brauzer konsoli va Network paneli (CORS, aralash kontent, CSP)."
```

VPS'da turli holatlar:

### Hammasi joyida

```text vps
$ /tmp/k30/tekshir.sh https://example.com/; echo "chiqish kodi: $?"
1 DNS     : ok — example.com -> 8.47.69.0
2 TCP     : ok — 8.47.69.0:443 ochiq
3 TLS     : ok — TLSv1.3, sertifikat to'g'ri
4 HTTP    : ok — 200
Server tomoni joyida. Sahifa baribir ishlamasa — brauzer konsoli va Network paneli (CORS, aralash kontent, CSP).
chiqish kodi: 0
```

### DNS

```text vps
$ /tmp/k30/tekshir.sh https://nomavjud-domen-7f3k2.uz/; echo "chiqish kodi: $?"
1 DNS     : XATO — 'nomavjud-domen-7f3k2.uz' uchun A yozuv yo'q (status: NXDOMAIN)
chiqish kodi: 1
```

Domen yo'q — undan keyingi qatlamlarga yetib bo'lmaydi.

### TCP: rad etildi va javob yo'q

```text vps
$ /tmp/k30/tekshir.sh http://127.0.0.1:9/; echo "chiqish kodi: $?"
1 DNS     : IP manzil berilgan (127.0.0.1)
2 TCP     : XATO — 127.0.0.1:9 ulanish rad etildi (portda dastur yo'q)
chiqish kodi: 2
$ /tmp/k30/tekshir.sh http://10.255.255.1/; echo "chiqish kodi: $?"
1 DNS     : IP manzil berilgan (10.255.255.1)
2 TCP     : XATO — 10.255.255.1:80 javob bermadi (5 s), paket tashlab yuborilmoqda (firewall?)
chiqish kodi: 2
```

Ikki xil TCP xatosi:

- `127.0.0.1:9` — kompyuter javob berdi, lekin portda hech kim yo'q: RST, darhol (3-bob). Tekshirish — serverda ilova ishlayaptimi, to'g'ri portdami (`ss -tln`).
- `10.255.255.1` — umuman javob kelmadi, 5 soniya kutildi: bu xususiy tarmoq manzili (RFC 1918, 3-bob), VPS'dan unga yo'l yo'q. Haqiqiy serverda xuddi shunday belgi — xavfsizlik devori paketlarni **jim** tashlab yuborishi yoki noto'g'ri IP.

### TLS

```text vps
$ /tmp/k30/tekshir.sh https://expired.badssl.com/; echo "chiqish kodi: $?"
1 DNS     : ok — expired.badssl.com -> 104.154.89.105
2 TCP     : ok — 104.154.89.105:443 ochiq
3 TLS     : XATO — Verify return code: 10 (certificate has expired)
chiqish kodi: 3
```

DNS va TCP joyida, lekin sertifikat muddati o'tgan — brauzer shu yerda to'xtaydi (26-bob).

### HTTP

```text vps
$ /tmp/k30/tekshir.sh https://example.com/yoq-sahifa; echo "chiqish kodi: $?"
1 DNS     : ok — example.com -> 8.6.112.0
2 TCP     : ok — 8.6.112.0:443 ochiq
3 TLS     : ok — TLSv1.3, sertifikat to'g'ri
4 HTTP    : XATO — 404 (mijoz tomoni: URL, autentifikatsiya, ruxsat)
chiqish kodi: 4
$ /tmp/k30/tekshir.sh http://github.com/; echo "chiqish kodi: $?"
1 DNS     : ok — github.com -> 140.82.121.4
2 TCP     : ok — 140.82.121.4:80 ochiq
4 HTTP    : 301 — yo'naltirish: https://github.com/
Server tomoni joyida. Sahifa baribir ishlamasa — brauzer konsoli va Network paneli (CORS, aralash kontent, CSP).
chiqish kodi: 0
```

- `404` — server ishlayapti, sahifa yo'q.
- `301` — xato emas: HTTP sayt HTTPS'ga yo'naltirmoqda (10, 27-boblar). Yakuniy manzilni (`https://github.com/`) alohida tekshirish kerak.

### Brauzer qatlami

Server tomoni to'liq ishlasa ham, sahifa brauzerda buzilishi mumkin. Bu holatlar oldingi boblarda Chromium'da ko'rilgan — konsoldagi xabar sababni aniq aytadi:

| Konsol xabari (boshi) | Sabab | Bob |
| --- | --- | --- |
| `… has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header …` | Boshqa origin API'si ruxsat bermagan | 19 |
| `… must not be the wildcard '*' when the request's credentials mode is 'include'` | Cookie bilan so'rovda `*` | 19 |
| `Mixed Content: … requested an insecure script … has been blocked` | HTTPS sahifada HTTP skript | 23 |
| `Executing inline script violates the following Content Security Policy directive …` | CSP ichki skriptni to'sdi | 21 |
| `Refused to display … in a frame because it set 'X-Frame-Options' to 'deny'` | Sahifa freymga qo'yilishini taqiqlagan | 22 |
| `Failed to find a valid digest in the 'integrity' attribute …` | CDN fayli o'zgargan (SRI) | 24 |
| `net::ERR_TOO_MANY_REDIRECTS` | Redirect halqasi | 10 |
| `net::ERR_SSL_PROTOCOL_ERROR` (HSTS'li xostga `http://`) | Brauzer HTTPS bilan ulandi, portda HTTP server | 27 |

Network panelida (29-bob): **Status** ustunida `CORS error`, `(blocked:origin)`, `(failed)`; **Timing** — qaysi bosqich uzun (DNS, ulanish, TTFB, yuklab olish).

## Standartda nima deyilgan

Bu bob — amaliyot (⚑). Har qatlamning manbasi:

| Qatlam | Manba | Bob |
| --- | --- | --- |
| DNS | RFC 1034/1035, `dig` qo'llanmasi | 4 |
| TCP | RFC 9293 | 3 |
| TLS va sertifikat | RFC 9846, RFC 9525, RFC 5280 | 25–26 |
| HTTP | RFC 9110 | 5–13 |
| Brauzer siyosatlari | WHATWG Fetch, W3C CSP, Mixed Content, MDN | 18–24 |
| Bash `/dev/tcp` | GNU Bash Reference Manual — Redirections | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Darhol ilova kodini tuzatishga kirishish | Muammo DNS yoki tarmoqda bo'lishi mumkin | Pastdan yuqoriga: DNS → TCP → TLS → HTTP → brauzer |
| Faqat brauzerda tekshirish | Brauzer keshi, kengaytmalar, HSTS natijani o'zgartiradi | `dig`, `curl -v` bilan alohida |
| "Rad etildi" va "javob yo'q" ni bir xil deb hisoblash | Birinchisi — portda dastur yo'q; ikkinchisi — paketlar yetmayapti | Xato turiga qarab qidirish |
| TLS xatosini `curl -k` bilan "chetlab" o'tish | Asl muammo (sertifikat) qoladi, foydalanuvchilar ochmaydi | Sertifikatni tuzatish |
| `502` da ilova kodini ko'rish | Proksi orqadagi ilovaga yeta olmagan | Proksi jurnali, keyin ilova jurnali (8-bob) |
| CORS xatosini serverda "yo'q" deb hisoblash | So'rov serverga yetgan, header yo'q | Server javobiga to'g'ri `Access-Control-*` |
| Faqat o'z kompyuteringizdan tekshirish | DNS keshi, mahalliy tarmoq boshqacha | Boshqa joydan (masalan, VPS'dan) ham |

## Amaliyot

1. Tekshirish tartibi qanday va nega pastdan yuqoriga?
2. `curl: (7) … Could not connect to server` darhol chiqdi. Qaysi qatlam va nima tekshiriladi?
3. Ulanish 30 soniya kutib, vaqt tugadi. Bu "rad etildi" dan nimasi bilan farq qiladi?
4. DNS, TCP va TLS joyida, lekin `502`. Qayerdan qidirish kerak?
5. Server tomoni to'liq ishlayapti, lekin sahifadagi ma'lumot yuklanmayapti. Keyingi qadam?
6. Skript `http://github.com/` uchun `301` ko'rsatdi. Bu xatomi?

<details>
<summary>Javoblar</summary>

1. DNS → TCP → TLS → HTTP → brauzer. Har qatlam pastdagisiga tayanadi: pastda xato bo'lsa, yuqorini tekshirish befoyda.
2. TCP; portda dastur yo'q (RST). Serverda ilova ishlayaptimi va to'g'ri portda tinglayaptimi (`ss -tln`).
3. Javob umuman kelmayapti — paketlar yetmayapti yoki xavfsizlik devori tashlab yubormoqda; "rad etildi" da esa kompyuter javob berib, port yopiqligini aytgan.
4. Proksi (nginx) xato jurnali, keyin ilova jurnali: proksi orqadagi ilovaga yeta olmagan yoki noto'g'ri javob olgan.
5. Brauzer konsoli va Network paneli: CORS, aralash kontent, CSP xabarlari.
6. Yo'q — HTTPS'ga yo'naltirish. Yakuniy `https://github.com/` ni tekshirish kerak.

</details>

## Rasmiy hujjat

- Oldingi boblardagi manbalar (har qatlam jadvalda)
- [GNU Bash: Redirections (`/dev/tcp`)](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)
- [curl qo'llanmasi: chiqish kodlari](https://curl.se/docs/manpage.html)
- [OpenSSL: s_client](https://docs.openssl.org/3.5/man1/openssl-s_client/)
- [Chrome DevTools: Network features reference](https://developer.chrome.com/docs/devtools/network/reference)

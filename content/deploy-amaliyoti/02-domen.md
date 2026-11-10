# 02 — Domenni serverga ulash

[Mundarija](README.md)

## Tushuncha

MDN (What is a Domain Name?): internetga ulangan har kompyuterga ochiq **IP manzil** orqali murojaat qilinadi — IPv4 (`192.0.2.172`) yoki IPv6 (`2001:db8:…`). Bunday manzilni eslab qolish qiyin, u o'zgarishi ham mumkin. Shuning uchun inson o'qiy oladigan manzil — **domen nomi** ishlatiladi.

### Domen tuzilishi (MDN)

Domen nuqtalar bilan ajratilgan qismlardan iborat va **o'ngdan chapga** o'qiladi: `www.kamgapir.uz`

- `uz` — **TLD** (yuqori darajadagi domen). Mahalliy TLD'lar (`.uz`, `.fr` …) muayyan mamlakat yoki tilni bildiradi;
- `kamgapir` — TLD'dan oldingi qism, **ikkinchi darajali domen** (SLD);
- `www` — yana bir qism (subdomen).

### Domenga egalik (MDN)

Domenni "sotib olib bo'lmaydi" — undan bir yoki bir necha yil **foydalanish huquqi** to'lanadi va uzaytiriladi. Ro'yxatga olishni **registrator** (registrar)lar bajaradi.

### DNS yozuvlari

**DNS** — domen nomini IP manzilga aylantiradigan tizim. Domen haqidagi asosiy ma'lumot **avtoritativ** (authoritative — shu domen uchun javobgar) **nom serverlari**da turadi. Qolgan DNS serverlar javobni ma'lum vaqt saqlab (keshlab) turadi, keyin yana so'raydi (MDN: DNS refreshing). Deploy uchun kerakli yozuvlar:

| Yozuv | Nima | Manba |
| --- | --- | --- |
| **A** | Domen → **IPv4** manzil (32 bit). Bir nechta manzilli host uchun bir nechta A yozuvi | RFC 1035 §3.4.1 |
| **AAAA** | Domen → **IPv6** manzil | RFC 3596 §2.1 |
| **NS** | Domen qaysi nom serverlarida turadi | RFC 1035 |
| **CNAME** | Bu nom boshqa nomning taxallusi | RFC 1035 |
| **TTL** | Yozuvni keshda **qancha soniya** saqlash mumkin, keyin manbadan qayta so'rash kerak | RFC 1035 §3.2.1 |

MDN: ro'yxatga olingandan keyin barcha DNS serverlar ma'lumotni **bir necha soat ichida** oladi.

**TTL va deploy.** Server manzili o'zgarsa, eski yozuv keshlarda TTL tugaguncha qoladi — bu TTL ta'rifidan kelib chiqadi (RFC 1035). Ko'chishdan oldin TTL'ni kamaytirib qo'yish shundan kelib chiqadigan amaliy usul.

### Registrator panelida (domen egasi bajaradi)

1. DNS boshqaruvi (zona) bo'limida `kamgapir.uz` uchun **A** yozuvi — server IPv4 manzili.
2. `www` uchun — yana A yozuvi yoki asosiy domenga **CNAME**.
3. Serverda IPv6 bo'lsa — **AAAA**. Yo'q bo'lsa AAAA qo'yilmaydi: noto'g'ri AAAA bo'lsa, IPv6 klientlar ulana olmaydi.
4. TTL — panel standarti yoki kerakli qiymat.

## Ko'rib chiqamiz

`kamgapir.uz` yozuvlari panelda allaqachon qo'yilgan. Serverdan `dig` bilan tekshiramiz (BIND 9.20).

### A, AAAA va server manzili

```text vps
$ dig +short kamgapir.uz A; dig +short www.kamgapir.uz A; ip -4 -o addr show scope global | awk '{print $2, $4}'
203.0.113.10
kamgapir.uz.
203.0.113.10
ens3 203.0.113.10/32
br-1767fc1d3cdd 172.19.0.1/16
docker0 172.17.0.1/16
$ dig www.kamgapir.uz A +noall +answer
www.kamgapir.uz.	7179	IN	CNAME	kamgapir.uz.
kamgapir.uz.		7179	IN	A	203.0.113.10
$ dig kamgapir.uz A +noall +answer; dig kamgapir.uz AAAA +noall +answer; echo "AAAA javob qatorlari: $(dig +short kamgapir.uz AAAA | wc -l)"
kamgapir.uz.		7199	IN	A	203.0.113.10
AAAA javob qatorlari: 0
```

- `kamgapir.uz` A yozuvi serverning `ens3` interfeysidagi manzilga to'g'ri keladi. `www` — `kamgapir.uz` ga **CNAME** (taxallus), u orqali o'sha manzilga.
- AAAA yo'q — serverda global IPv6 manzil ham yo'q. Bu to'g'ri.
- `dig` javobidagi ikkinchi ustun — keshda qolgan **TTL** (soniya).

### Nom serverlari va avtoritativ javob

```text vps
$ dig +short kamgapir.uz NS
rdns2.ahost.uz.
rdns3.ahost.uz.
rdns1.ahost.uz.
$ NS=$(dig +short kamgapir.uz NS | head -1); dig @$NS kamgapir.uz A +noall +answer +norecurse; dig @$NS kamgapir.uz A +norecurse | grep -o 'flags: [a-z ]*'
kamgapir.uz.		14440	IN	A	203.0.113.10
flags: qr aa
$ dig +short kamgapir.uz SOA
rdns1.ahost.uz. root.rdns1.ahost.uz. 2026110517 3600 1800 1209600 86400
```

- Domen `ahost.uz` nom serverlarida (registrator).
- To'g'ridan-to'g'ri nom serveridan so'ralganda (`+norecurse`) javobda **`aa`** (authoritative answer) bayrog'i bor, TTL — to'liq qiymat: 14440 s (~4 soat).
- SOA'dagi oxirgi raqamlar — zonaning yangilanish va keshlash parametrlari (soniyada).

### Kesh va TTL

```text vps
$ dig kamgapir.uz A +noall +answer; sleep 7; dig kamgapir.uz A +noall +answer
kamgapir.uz.		7199	IN	A	203.0.113.10
kamgapir.uz.		7192	IN	A	203.0.113.10
$ dig @1.1.1.1 kamgapir.uz A +noall +answer; dig @8.8.8.8 kamgapir.uz A +noall +answer
kamgapir.uz.		14440	IN	A	203.0.113.10
kamgapir.uz.		14440	IN	A	203.0.113.10
```

- Server resolveri (systemd-resolved, `127.0.0.53`) keshidagi TTL 7 soniyada 7199 dan 7192 ga tushdi — yozuv keshda qolgan vaqt sanalyapti. TTL 0 ga yetganda resolver manbadan qayta so'raydi.
- Kuzatildi: bu resolver TTL'ni ~7200 s bilan cheklagan ko'rinadi. `1.1.1.1` va `8.8.8.8` esa avtoritativ qiymatni (14440) qaytardi. Resolverlar keshni turlicha boshqaradi, shuning uchun yangi yozuv turli joyda turli vaqtda ko'rinadi.

### Delegatsiya zanjiri

```text vps
$ dig kamgapir.uz A +trace +nodnssec | grep -E '^\S+\s+[0-9]+\s+IN\s+(NS|A)\s' | awk '{print $1, $4, $5}' | sort -u
. NS a.root-servers.net.
. NS b.root-servers.net.
. NS c.root-servers.net.
. NS d.root-servers.net.
. NS e.root-servers.net.
. NS f.root-servers.net.
. NS g.root-servers.net.
. NS h.root-servers.net.
. NS i.root-servers.net.
. NS j.root-servers.net.
. NS k.root-servers.net.
. NS l.root-servers.net.
. NS m.root-servers.net.
kamgapir.uz. A 203.0.113.10
kamgapir.uz. NS rdns1.ahost.uz.
kamgapir.uz. NS rdns2.ahost.uz.
kamgapir.uz. NS rdns3.ahost.uz.
uz. NS ns1.uz.
uz. NS ns2.uz.
uz. NS ns3.uz.
uz. NS ns4.uz.
uz. NS ns5.uz.
uz. NS ns6.uz.
uz. NS ns7.uz.
uz. NS ns8.uz.
```

`+trace` so'rovni ildizdan boshlaydi: ildiz serverlari (`.`) → `uz.` nom serverlari → `kamgapir.uz.` uchun `rdns*.ahost.uz.` → A yozuvi. Domen "tarqalgan"ini tekshirish — ommaviy resolverlardan so'rash:

```text vps
$ dig @1.1.1.1 +short kamgapir.uz A; dig @8.8.8.8 +short kamgapir.uz A
203.0.113.10
203.0.113.10
$ curl -sI http://kamgapir.uz | head -3 | tr -d '\r'
HTTP/1.1 301 Moved Permanently
Server: nginx/1.31.8
Date: Tue, 10 Nov 2026 07:01:52 GMT
```

Ommaviy resolverlar to'g'ri manzilni qaytaradi, so'rov serverdagi nginx'ga yetib bordi (HTTP → HTTPS'ga `301`, nginx kitobi 19–25-boblar).

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Bitta server, IPv4 | `@` va `www` uchun A (yoki `www` → CNAME) |
| Serverda IPv6 ham bor | + AAAA |
| Server ko'chiriladi | Oldindan TTL'ni kamaytirish, keyin A ni almashtirish |
| Tarqalishni tekshirish | `dig @1.1.1.1`, `dig @8.8.8.8`, `dig +trace` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Noto'g'ri yoki eski AAAA | IPv6 klientlar boshqa joyga boradi | AAAA faqat haqiqiy IPv6 bo'lsa |
| Yozuv o'zgargach darhol hamma ko'radi deb kutish | Keshlar TTL tugaguncha eski javobni beradi (RFC 1035) | TTL'ni hisobga olish |
| Faqat o'z kompyuterida tekshirish | Mahalliy kesh | Bir nechta resolver, `+trace` |
| `www` ni unutish | `www.` manzil ochilmaydi | A yoki CNAME |
| Domen muddatini kuzatmaslik | Foydalanish huquqi yillik (MDN) | Uzaytirish |

## Amaliyot

1. A va AAAA yozuvlari farqi nima?
2. TTL nimani bildiradi?
3. Sinovda `www.kamgapir.uz` qanday yozuv bilan sozlangan?
4. Javob avtoritativ ekanini qanday bildingiz?
5. Nega turli resolverlar turli TTL ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. A — IPv4, AAAA — IPv6 manzil.
2. Yozuvni keshda qancha soniya saqlash mumkinligi.
3. CNAME — `kamgapir.uz.` ga.
4. Nom serveridan `+norecurse` bilan so'raganda `aa` bayrog'i bor edi.
5. Har resolver o'z keshida qolgan vaqtni ko'rsatadi; serverdagisi TTL'ni ~7200 bilan cheklagan.

</details>

## Rasmiy hujjat

- [MDN: What is a Domain Name?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name)
- [RFC 1035: Domain Names — Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035) — 3.2.1 (TTL), 3.4.1 (A)
- [RFC 3596: DNS Extensions to Support IP Version 6](https://www.rfc-editor.org/rfc/rfc3596) — AAAA

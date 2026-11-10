# 07 — Konfiguratsiya va sirlar

[Mundarija](README.md)

## Tushuncha

Ilova kodi har serverda bir xil, **sozlamalar** esa farq qiladi: port, ma'lumotlar bazasi manzili, API kalitlari. Ular kodga yozilmaydi va repozitoriyga tushmaydi. Serverda alohida faylda turadi, servis ishga tushganda unga beriladi.

Ikki xil narsa bor:

| | Misol | Maxfiymi |
| --- | --- | --- |
| **Sozlama** (konfiguratsiya) | Port, muhit nomi (`production`) | Yo'q |
| **Sir** (secret) | Parol, API kalit, shaxsiy kalit | Ha |

### systemd'da uch usul (SD: systemd.exec(5))

| Direktiva | Nima |
| --- | --- |
| `Environment=` | Muhit o'zgaruvchilari to'g'ridan-to'g'ri unit faylida: `Environment="VAR1=word1 word2" VAR2=word3` |
| `EnvironmentFile=` | Xuddi shunday, lekin matnli fayldan: har qatorda `NOM=qiymat`; bo'sh qatorlar, `#` va `;` bilan boshlanganlari e'tiborga olinmaydi |
| `LoadCredential=ID:YO'L` | **Credential** (maxfiy ma'lumot) — fayl tizimi orqali, faqat o'qish uchun joyda; manzili — `$CREDENTIALS_DIRECTORY` |

SD (`EnvironmentFile=`):

- yo'l absolyut bo'lishi kerak; fayl **yo'q**, o'qib bo'lmasa yoki noto'g'ri bo'lsa — servis **ishga tushmaydi**;
- oldiga `-` qo'yilsa (`EnvironmentFile=-/yo'l`) — fayl ixtiyoriy, xatolar jimgina e'tiborga olinmaydi;
- fayl jarayon ishga tushishidan **biroz oldin** o'qiladi.

SD — **muhim ogohlantirish**: muhit o'zgaruvchilari sirlarni (parol, kalit) servisga uzatish uchun **yaroqsiz**. Unit uchun berilgan muhit o'zgaruvchilari **imtiyozsiz** mijozlarga D-Bus orqali ochiq va himoya talab qiladigan ma'lumot deb hisoblanmaydi; bundan tashqari, ular jarayonlar daraxti bo'ylab pastga, xavfsizlik chegaralaridan ham o'tib uzatiladi. Sirlar uchun — `LoadCredential=`, `LoadCredentialEncrypted=` yoki `SetCredentialEncrypted=`.

SD (`LoadCredential=`): credential ma'lumoti faqat unit foydalanuvchisi (`User=`/`DynamicUser=`) va root uchun ochiq; iloji bo'lsa, diskka (swap) tushmaydigan xotirada saqlanadi.

### GitHub Actions'da

GH (Secrets): **sirlar** — tashkilot, repozitoriy yoki muhit darajasida saqlanadigan maxfiy o'zgaruvchilar. Workflow sirni faqat **aniq ko'rsatilgan** bo'lsa o'qiy oladi. Jurnalga chiqqan sir qiymatlari avtomatik yashiriladi, lekin bu **kafolatlanmagan** (qiymat o'zgartirilib chiqarilishi mumkin). Huquqlar — eng kami: shaxsiy hisob o'rniga deploy key yoki servis hisobi, kerak bo'lsa faqat o'qish. Batafsil — 11-bob.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). Sinov ilovasi — Python standart kutubxonasidagi kichik HTTP server. Sozlamani muhitdan, parolni credential faylidan oladi va javobda faqat parol **uzunligini** ko'rsatadi:

```python
# Sinov ilovasi: sozlamani muhitdan, sirni credential faylidan oladi
import os, http.server
maqsad = os.environ.get("ILOVA_MUHIT", "?")
port = int(os.environ.get("ILOVA_PORT", "8091"))
with open(os.path.join(os.environ["CREDENTIALS_DIRECTORY"], "db-parol")) as f:
    parol = f.read().strip()
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        javob = f"muhit: {maqsad}, parol uzunligi: {len(parol)}\n".encode()
        self.send_response(200); self.end_headers(); self.wfile.write(javob)
http.server.HTTPServer(("127.0.0.1", port), H).serve_forever()
```

Servis — uchala usul bilan:

```ini
[Unit]
Description=Deploy kitobi: sozlama va sirlar sinovi

[Service]
DynamicUser=yes
ExecStart=/usr/bin/python3 /opt/ilova-sinov/ilova.py
Environment=ILOVA_MUHIT=production
EnvironmentFile=/etc/ilova-sinov/ilova.env
LoadCredential=db-parol:/etc/ilova-sinov/db-parol
```

`DynamicUser=yes` — SD: servis ishga tushganda UNIX foydalanuvchi va guruh dinamik ajratiladi, to'xtaganda bo'shatiladi; `/etc/passwd` ga qo'shilmaydi (root emas). Sozlama fayli:

```text
# ilova sozlamalari (repozitoriyda emas)
ILOVA_PORT=8091
API_KALIT=sinov-kalit-123
```

### Joylash va ishga tushirish

```text vps
$ ss -ltn | grep -c ':8091 ' ; install -d /opt/ilova-sinov /etc/ilova-sinov; install -m 644 /root/ilova.py /opt/ilova-sinov/; install -m 600 /root/ilova.env /etc/ilova-sinov/ilova.env; (umask 077; head -c 24 /dev/urandom | base64 > /etc/ilova-sinov/db-parol); mv /root/ilova-sinov.service /etc/systemd/system/; rm /root/ilova.py /root/ilova.env; ls -l /etc/ilova-sinov | awk 'NR>1 {print $1, $3, $NF}'
0
-rw------- root db-parol
-rw------- root ilova.env
```

Ikkala fayl — `-rw-------`, faqat root. Parol — tasodifiy.

```text vps
$ systemctl daemon-reload; systemctl start ilova-sinov; sleep 1; systemctl is-active ilova-sinov; curl -s http://127.0.0.1:8091/
active
muhit: production, parol uzunligi: 32
```

Ilova `Environment=` dan `production` ni, credential'dan 32 belgili parolni oldi; port esa fayldan keldi.

### Oddiy foydalanuvchi nimani ko'radi

`boshqaruv` (`sudo` siz):

```text vps
$ runuser -u boshqaruv -- systemctl show ilova-sinov -p Environment -p EnvironmentFiles
Environment=ILOVA_MUHIT=production
EnvironmentFiles=/etc/ilova-sinov/ilova.env (ignore_errors=no)
```

`Environment=` qiymati (`ILOVA_MUHIT=production`) **ko'rindi** — SD ogohlantirishi aynan shu. `EnvironmentFile=` dan — faqat fayl **yo'li**, qiymatlar emas.

```text vps
$ p=$(systemctl show -p MainPID --value ilova-sinov); ps -o user=,pid=,cmd= -p $p; runuser -u boshqaruv -- cat /proc/$p/environ 2>&1 | head -1; tr '\0' '\n' < /proc/$p/environ | grep -E '^(ILOVA_|API_|CREDENTIALS_)'
61464      14992 /usr/bin/python3 /opt/ilova-sinov/ilova.py
cat: /proc/14992/environ: Permission denied
CREDENTIALS_DIRECTORY=/run/credentials/ilova-sinov.service
ILOVA_MUHIT=production
ILOVA_PORT=8091
API_KALIT=sinov-kalit-123
```

- Jarayon — vaqtinchalik foydalanuvchi (`61464`) nomidan.
- Jarayon muhitini (`/proc/PID/environ`) oddiy foydalanuvchi o'qiy olmadi; root uchun — fayldagi `API_KALIT` va `CREDENTIALS_DIRECTORY` ham bor.

```text vps
$ p=$(systemctl show -p MainPID --value ilova-sinov); d=$(tr '\0' '\n' < /proc/$p/environ | sed -n 's/^CREDENTIALS_DIRECTORY=//p'); ls -ld $d | awk '{print $1, $3}'; ls -l $d | awk 'NR>1 {print $1, $3, $NF}'; runuser -u boshqaruv -- ls $d 2>&1
dr-xr-x---+ root
-r--r-----+ root db-parol
ls: cannot open directory '/run/credentials/ilova-sinov.service': Permission denied
```

Credential papkasi va fayli — faqat o'qish uchun (`r-x`, `r--`), `+` — qo'shimcha ACL (alohida ruxsat ro'yxati) bilan; `boshqaruv` papkani ochib ham ko'ra olmadi.

### Fayl yo'q bo'lsa

```text vps
$ systemctl stop ilova-sinov; mv /etc/ilova-sinov/ilova.env /etc/ilova-sinov/ilova.env.bak; systemctl start ilova-sinov 2>&1 | head -2; journalctl -u ilova-sinov -n 3 --no-pager -o cat | grep -i 'environment\|Failed' | head -2
Job for ilova-sinov.service failed because of unavailable resources or another system error.
See "systemctl status ilova-sinov.service" and "journalctl -xeu ilova-sinov.service" for details.
ilova-sinov.service: Failed to spawn 'start' task: No such file or directory
ilova-sinov.service: Failed with result 'resources'.
```

`EnvironmentFile=` dagi fayl yo'q — servis **ishga tushmadi** (`Failed with result 'resources'`).

```text vps
$ sed -i 's#^EnvironmentFile=/etc#EnvironmentFile=-/etc#' /etc/systemd/system/ilova-sinov.service; grep EnvironmentFile /etc/systemd/system/ilova-sinov.service; systemctl daemon-reload; systemctl start ilova-sinov; sleep 1; systemctl is-active ilova-sinov; curl -s http://127.0.0.1:8091/
EnvironmentFile=-/etc/ilova-sinov/ilova.env
active
muhit: production, parol uzunligi: 32
```

`-` bilan — ishga tushdi; fayldagi qiymatlar yo'q, ilova o'zining standart portini (8091) ishlatdi. Ixtiyoriy fayl — muhim sozlama yo'qolsa ham servis "ishlayotgandek" ko'rinadi.

```text vps
$ systemctl stop ilova-sinov; rm -rf /etc/systemd/system/ilova-sinov.service /etc/ilova-sinov /opt/ilova-sinov; systemctl daemon-reload; systemctl reset-failed ilova-sinov 2>/dev/null; echo tozalandi
tozalandi
```

## Variantlar

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| `Environment=` | Maxfiy bo'lmagan sozlama | Imtiyozsiz foydalanuvchiga ko'rinadi (sinovda) |
| `EnvironmentFile=` (0600) | Sozlamalar to'plami, ilova muhitdan o'qiydi | Muhit o'zgaruvchisi — bola jarayonlarga o'tadi (SD) |
| `LoadCredential=` | Parol, kalit (SD tavsiyasi) | Ilova fayldan o'qishi kerak |
| `LoadCredentialEncrypted=` | Diskda ham shifrlangan | Murakkabroq (SD) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `.env` ni repozitoriyga commit qilish | Sir hammaga ochiq | Serverda, repozitoriyda — faqat namuna |
| Parolni `Environment=` ga | D-Bus orqali ko'rinadi (SD, sinovda) | `LoadCredential=` |
| Sozlama faylini `0644` | Hamma o'qiy oladi | `0600`, root |
| Muhim fayl uchun `EnvironmentFile=-` | Fayl yo'qolsa servis jimgina noto'g'ri sozlama bilan ishlaydi (sinovda) | `-` siz — xato darhol ko'rinadi |
| Sirni jurnalga chiqarish | Jurnalni ko'p kishi o'qiydi | Faqat borligini yoki uzunligini |

## Amaliyot

1. Nega sozlamalar kodga yozilmaydi?
2. `EnvironmentFile=` dagi fayl bo'lmasa nima bo'ladi? `-` bilan-chi?
3. SD nega muhit o'zgaruvchilarini sirlar uchun yaroqsiz deydi?
4. Sinovda oddiy foydalanuvchi nimani ko'ra oldi, nimani ko'ra olmadi?
5. Ilova `LoadCredential=` dagi sirni qayerdan o'qiydi?

<details>
<summary>Javoblar</summary>

1. Har serverda farq qiladi, sirlar repozitoriyga tushmasligi kerak.
2. Servis ishga tushmaydi; `-` bilan — fayl e'tiborga olinmay ishga tushadi.
3. D-Bus orqali imtiyozsiz mijozlarga ochiq va bola jarayonlarga uzatiladi.
4. `Environment=` qiymatini va fayl yo'lini ko'rdi; fayl ichini, jarayon muhitini va credential'ni — yo'q.
5. `$CREDENTIALS_DIRECTORY/ID` faylidan.

</details>

## Rasmiy hujjat

- [SD: systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) — Environment, Credentials
- [GH: Secrets](https://docs.github.com/en/actions/concepts/security/secrets)

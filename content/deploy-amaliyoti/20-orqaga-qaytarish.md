# 20 — Orqaga qaytarish

[Mundarija](README.md)

## Tushuncha

Yangi versiyada xato chiqdi — tezda **oldingi** versiyaga qaytish kerak (rollback). 5-bobdagi tuzilma buni oddiy qiladi: eski release'lar diskda turibdi, `current` ni oldingisiga yo'naltirish kifoya. MAN (rename(2)): mavjud `current` atomik almashtiriladi — oraliq holat yo'q.

```text
releases/20261109-1000   (v1)  ◀── current  (qaytarildi)
releases/20261109-1100   (v2)      current  (xato)
```

### Nima qaytmaydi

Release papkasi — faqat **kod**. Ko'p narsa uning tashqarisida va `current` bilan qaytmaydi:

| Qaytadi | Qaytmaydi |
| --- | --- |
| Kod (release papkasi) | **Ma'lumotlar bazasi** — migratsiyalar (sxema o'zgarishlari) |
| Release ichidagi build natijalari | Release'lar umumiy papkasidagi fayllar (yuklangan fayllar va h.k.) |
| — | Server sozlamalari (`.env`, 7-bob), tashqi xizmatlar |

Eng xavflisi — baza: yangi versiya sxemani o'zgartirgan bo'lsa (masalan, ustun nomini — SQLite: `ALTER TABLE … RENAME COLUMN` ustun nomini jadval ta'rifida ham, unga murojaat qiluvchi indeks, trigger va view'larda ham o'zgartiradi), eski kod endi bazani **tushunmaydi**. Bazani to'xtovsiz o'zgartirish usullari (expand/contract kabi) bu kitobga kirmaydi — umumiy rasmiy manba topilmadi (README).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). Ilova — bazadan mijoz ismini o'qiydi; baza — release'lardan tashqarida, `shared/` papkada.

v1:

```python
# v1: mijoz ismini bazadan o'qiydi
import http.server, sqlite3
VERSIYA = "v1"
def javob():
    db = sqlite3.connect("file:/srv/ilova20/shared/baza.db?mode=ro", uri=True)
    return f"{VERSIYA}: {db.execute('SELECT ism FROM mijoz').fetchone()[0]}"
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        try: kod, matn = 200, javob()
        except Exception as e: kod, matn = 500, f"{VERSIYA} xato: {e}"
        self.send_response(kod); self.end_headers(); self.wfile.write((matn + "\n").encode())
    def log_message(self, *a): pass
http.server.HTTPServer(("127.0.0.1", 8101), H).serve_forever()
```

v2 — ustun nomi `nom` bo'ldi (migratsiya bilan) va kodda xato bor:

```text
1c1
< # v1: mijoz ismini bazadan o'qiydi
---
> # v2: ustun nomi "nom" ga o'zgardi (migratsiya.py); yangi kodda xato bor
3c3
< VERSIYA = "v1"
---
> VERSIYA = "v2"
6c6
<     return f"{VERSIYA}: {db.execute('SELECT ism FROM mijoz').fetchone()[0]}"
---
>     return f"{VERSIYA}: {db.execute('SELECT nom FROM mijoz').fetchone()[0].title_()}"
```

```python
# v2 migratsiyasi: ustun nomini o'zgartiradi
import sqlite3
db = sqlite3.connect("/srv/ilova20/shared/baza.db")
db.execute("ALTER TABLE mijoz RENAME COLUMN ism TO nom"); db.commit()
print("migratsiya: mijoz.ism -> mijoz.nom")
```

Qaytarish skripti — joriy release'dan oldingisini topadi va `current` ni atomik almashtiradi:

```bash
#!/bin/bash
# orqaga.sh — current ni oldingi release'ga qaytaradi
set -e
cd /srv/ilova20
joriy=$(basename "$(readlink current)")
oldingi=$(ls -1 releases | grep -B1 -x "$joriy" | head -1)
if [ "$oldingi" = "$joriy" ]; then echo "oldingi release yo'q"; exit 1; fi
ln -s "releases/$oldingi" current.tmp
mv -T current.tmp current
systemctl restart ilova20
echo "qaytarildi: $joriy -> $oldingi"
```

### v1 ishlayapti

```text vps
$ install -d /srv/ilova20/releases/20261109-1000 /srv/ilova20/shared; install -m 644 /root/ilova-v1.py /srv/ilova20/releases/20261109-1000/ilova.py; python3 -c "import sqlite3; db=sqlite3.connect('/srv/ilova20/shared/baza.db'); db.execute('CREATE TABLE mijoz (ism TEXT)'); db.execute(\"INSERT INTO mijoz VALUES ('Aziz')\"); db.commit()"; cd /srv/ilova20 && ln -s releases/20261109-1000 current; mv /root/ilova20.service /etc/systemd/system/; install -m 755 /root/orqaga.sh /usr/local/bin/orqaga; systemctl daemon-reload; systemctl start ilova20; sleep 1; curl -s http://127.0.0.1:8101/
v1: Aziz
```

### v2 deploy — migratsiya va xato

```text vps
$ install -d /srv/ilova20/releases/20261109-1100; install -m 644 /root/ilova-v2.py /srv/ilova20/releases/20261109-1100/ilova.py; install -m 644 /root/migratsiya.py /srv/ilova20/releases/20261109-1100/; python3 /srv/ilova20/releases/20261109-1100/migratsiya.py; cd /srv/ilova20 && ln -s releases/20261109-1100 current.tmp && mv -T current.tmp current && systemctl restart ilova20; sleep 1; ls -l current | awk '{print $(NF-2), $(NF-1), $NF}'; curl -s -w '%{http_code}\n' http://127.0.0.1:8101/
migratsiya: mijoz.ism -> mijoz.nom
current -> releases/20261109-1100
v2 xato: 'str' object has no attribute 'title_'
500
```

Migratsiya ustunni o'zgartirdi, `current` — v2, ilova **500** qaytaryapti.

### Orqaga qaytarish

```text vps
$ orqaga; sleep 1; ls -l /srv/ilova20/current | awk '{print $(NF-2), $(NF-1), $NF}'; curl -s -w '%{http_code}\n' http://127.0.0.1:8101/
qaytarildi: 20261109-1100 -> 20261109-1000
/srv/ilova20/current -> releases/20261109-1000
v1 xato: no such column: ism
500
```

`current` — yana v1. Lekin ilova **baribir 500**: `no such column: ism` — v1 kodi eski ustunni qidiryapti, migratsiya esa **qaytmadi**. Kod qaytdi, baza qaytmadi.

```text vps
$ orqaga 2>&1 | tail -1
oldingi release yo'q
```

Undan oldingi release yo'q — skript to'xtadi.

### Bazani qo'lda qaytarish

```text vps
$ python3 -c "import sqlite3; db=sqlite3.connect('/srv/ilova20/shared/baza.db'); db.execute('ALTER TABLE mijoz RENAME COLUMN nom TO ism'); db.commit(); print('ustun qaytarildi: mijoz.nom -> mijoz.ism')"; curl -s -w '%{http_code}\n' http://127.0.0.1:8101/
ustun qaytarildi: mijoz.nom -> mijoz.ism
v1: Aziz
200
```

Ustun eski nomiga qaytarilgach — v1 yana ishladi. Haqiqiy loyihada bu — har migratsiya uchun **qaytarish** qadami yoki eski kod ham tushunadigan o'zgarishlar.

```text vps
$ systemctl stop ilova20; rm -rf /etc/systemd/system/ilova20.service /srv/ilova20 /usr/local/bin/orqaga /root/ilova-v1.py /root/ilova-v2.py /root/migratsiya.py /root/orqaga.sh; systemctl daemon-reload; echo tozalandi
tozalandi
```

Restart (`systemctl restart`) — 16-bobdagi qisqa to'xtash bilan. To'xtovsiz qaytarish — 17-bobdagi usul: oldingi release'ni bo'sh portda ishga tushirib, nginx'ni unga o'tkazish.

### Bu bobda hali yo'q

- **Oldingi image tegiga qaytish** (Docker Compose) — 19-bob bilan, GitHub Container Registry kerak.
- **GitHub'dagi deploy tarixi** (GH: View deployment history) — GitHub sinov repozitoriysi bilan (III qism).

## Variantlar

| Usul | Qachon | Diqqat |
| --- | --- | --- |
| `current` → oldingi release + restart | Oddiy, bitta nusxa | Restart'dagi to'xtash (16-bob) |
| Oldingi release'ni bo'sh portda, nginx'ni o'tkazish | To'xtovsiz (17-bob) | Ikki nusxa |
| Xatoni tuzatib, yangi deploy ("oldinga") | Baza o'zgargan, qaytarish xavfli | Vaqt ketadi |
| Migratsiyani qaytarish | Sxema o'zgargan | Ma'lumot yo'qolishi mumkin; avval zaxira (Server xavfsizligi, 19–21) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Rollback = hammasi qaytdi deb o'ylash | Baza qaytmaydi (sinovda 500) | Migratsiyalarni alohida o'ylash |
| Eski release'larni o'chirib yuborish | Qaytadigan joy yo'q (sinovda "oldingi release yo'q") | 3–5 tasini saqlash (5-bob) |
| Bazani release papkasida saqlash | Har release'da boshqa baza | Umumiy `shared/` papka |
| `ln -sfn` bilan qaytarish | Oraliqda `current` yo'q (5-bob) | `ln -s` + `mv -T` |
| Qaytarishni hech qachon sinamaslik | Kerak paytda ishlamasligi mumkin | Skriptni oldindan sinash |

## Amaliyot

1. Release tuzilmasida orqaga qaytish qanday bajariladi?
2. Nima `current` bilan qaytmaydi?
3. Sinovda qaytarishdan keyin nega ilova baribir 500 qaytardi?
4. Qanday qilib tuzaldi?
5. Qaytarishni to'xtovsiz qanday qilish mumkin?

<details>
<summary>Javoblar</summary>

1. `current` ni oldingi release'ga atomik yo'naltirib, servisni qayta ishga tushirish.
2. Baza (migratsiyalar), umumiy fayllar, server sozlamalari.
3. Migratsiya ustunni o'zgartirgan, eski kod eski ustunni qidirdi.
4. Ustun nomi qo'lda qaytarildi.
5. Oldingi release'ni bo'sh portda ishga tushirib, nginx'ni unga o'tkazish (17-bob).

</details>

## Rasmiy hujjat

- [MAN: rename(2)](https://man7.org/linux/man-pages/man2/rename.2.html)
- [SQLite: ALTER TABLE](https://www.sqlite.org/lang_altertable.html) — RENAME COLUMN
- [GH: View deployment history](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/view-deployment-history) — III qism bilan

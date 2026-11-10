# 27 — Konfiguratsiya va loglar

[Mundarija](README.md)

## Tushuncha

### Sozlash usullari (RQ: Configuration)

| Usul | Nima uchun |
| --- | --- |
| **Konfiguratsiya fayl(lar)i** | Server va plaginlar sozlamalari: tinglovchilar, TLS, resurs chegaralari, autentifikatsiya, loglar va h.k. |
| **Muhit o'zgaruvchilari** (environment variables) | Tugun nomi, fayl va kataloglar joyi; `rabbitmq-env.conf` da ham beriladi |
| `rabbitmqctl` | Vhost, foydalanuvchi, ruxsat, policy (ichki backend) |
| `rabbitmq-diagnostics` va boshqalar | Ishlab turgan tugunni ko'rish va ba'zi qiymatlarni o'zgartirish |

### `rabbitmq.conf` (RQ)

Asosiy fayl, **sysctl formati**:

- bitta sozlama — bitta qator, `kalit = qiymat`;
- `#` bilan boshlangan — izoh; tarkibida `#` bo'lgan qiymat (masalan, generatsiya qilingan parol) bitta qo'shtirnoqqa olinadi: `'efd3!53a9@92#a08_d_6d'`;
- `$(O'ZGARUVCHI)` — muhit o'zgaruvchisi o'rniga qo'yiladi (masalan, `cluster_name = deployment-$(DEPLOYMENT_ID)`);
- `RABBITMQ_CONFIG_FILES` bilan `conf.d` katalogidagi `.conf` fayllar **alifbo tartibida** yuklanadi (`00-defaults.conf`, `10-main.conf` …).

**`advanced.config`** — Erlang term formatidagi qo'shimcha fayl. Sysctl formatida ifodalab bo'lmaydigan kam sonli sozlamalar uchun; `rabbitmq.conf` bilan birlashtiriladi. RQ: imkon bo'lsa — `rabbitmq.conf`.

**Qachon kuchga kiradi** (RQ): `rabbitmq.conf` va `advanced.config` o'zgarishlari — **tugun qayta ishga tushgandan keyin**.

**Haqiqiy konfiguratsiyani ko'rish** (RQ): `rabbitmq-diagnostics environment` — standart qiymatlar va barcha fayllar birlashtirilgan natija.

### Fayllar joyi (RQ: Configuration, File and Directory Locations)

Debian/Ubuntu paketi:

| Nima | Joy | O'zgaruvchi |
| --- | --- | --- |
| Konfiguratsiya | `/etc/rabbitmq/rabbitmq.conf`, `/etc/rabbitmq/advanced.config` | `RABBITMQ_CONFIG_FILE`, `RABBITMQ_ADVANCED_CONFIG_FILE` |
| Yoqilgan plaginlar | `/etc/rabbitmq/enabled_plugins` | `RABBITMQ_ENABLED_PLUGINS_FILE` |
| Ma'lumotlar | `/var/lib/rabbitmq/mnesia/<tugun>` | `RABBITMQ_MNESIA_BASE` |
| Loglar | `/var/log/rabbitmq/<tugun>.log` | `RABBITMQ_LOG_BASE` |

Qaysi konfiguratsiya fayli ishlatilayotgani — logning boshida (`config file(s)`) va `rabbitmq-diagnostics status` ning `Config files` bo'limida (RQ).

### Loglar (RQ: Logging)

- Standart chiqish — **fayl**. Joyi — `rabbitmq-diagnostics log_location`.
- `log.file.level` — standart `info`. Darajalar: `debug` < `info` < `warning` < `error` < `critical`, `none` — umuman yozmaslik.
- **Kategoriyalar**: `log.<kategoriya>.level` (masalan, `log.connection.level`) — faqat shu turdagi xabarlar darajasi.
- `log.file.formatter = json` — JSON formatida, boshqa dasturlar o'qishi uchun.
- Darajani **ishlab turgan** tugunda o'zgartirish: `rabbitmqctl set_log_level debug` — qayta ishga tushirilguncha amal qiladi.
- Oxirgi qatorlar: `rabbitmq-diagnostics log_tail -N 300`, oqim: `log_tail_stream`.
- **Aylantirish** (rotation): RQ tavsiyasi — `logrotate`. Debian paketi uni haftalik qilib o'rnatadi (`/etc/logrotate.d/rabbitmq-server`). Ichki usul — `log.file.rotation.date` yoki `log.file.rotation.size` (ikkalasi birga ishlamaydi).

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, Debian paketi).

### Fayllar qayerda

```text vps
$ rabbitmq-diagnostics -q status | grep -A3 '^Config files'
Config files
 * /etc/rabbitmq/rabbitmq.conf
$ grep 'config file(s)' /var/log/rabbitmq/rabbit@lab.log | tail -1 | sed 's/^.*> *//'
config file(s) : /etc/rabbitmq/rabbitmq.conf
$ ls -l /etc/rabbitmq/ | tail -n +2 | awk '{print $1, $3, $4, $NF}'; ls /var/lib/rabbitmq/mnesia/ | head; ls /var/log/rabbitmq/
-rw-r--r-- root rabbitmq enabled_plugins
-rw-r--r-- root rabbitmq rabbitmq.conf
rabbit@lab
rabbit@lab-feature_flags
rabbit@lab-plugins-expand
rabbit@lab.pid
rabbit@lab.log
$ cat /etc/logrotate.d/rabbitmq-server
/var/log/rabbitmq/*.log {
        weekly
        missingok
        rotate 20
        compress
        notifempty
}
```

- Ishlatilayotgan fayl — `/etc/rabbitmq/rabbitmq.conf` (23-bobda `stream.advertised_host` uchun yaratilgan).
- `advanced.config` yo'q. `enabled_plugins` — 4- va 23-boblarda yoqilgan plaginlar.
- `logrotate` — haftalik, 20 ta arxiv, siqilgan.

### Haqiqiy konfiguratsiya

```text vps
$ rabbitmq-diagnostics -q environment | grep -A3 '{rabbitmq_stream' | head -4; rabbitmq-diagnostics -q environment | grep -E '\{advertised_host|\{log,' | head -3
 {rabbitmq_stream,
     [{advertised_host,<<"localhost">>},
      {advertised_port,undefined},
      {credits_required_for_unblocking,12500},
      {log,
     [{advertised_host,<<"localhost">>},
```

`rabbitmq.conf` dagi `stream.advertised_host = localhost` — `rabbitmq_stream` ilovasida `{advertised_host,<<"localhost">>}` bo'lib ko'rinadi, qolganlari — standart qiymatlar.

### Noto'g'ri qiymat

```text vps
$ cp /etc/rabbitmq/rabbitmq.conf /root/rabbitmq.conf.zaxira; echo 'log.file.level = juda_kop' >> /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; echo "restart kodi: $?"; systemctl is-active rabbitmq-server
Job for rabbitmq-server.service failed because the control process exited with error code.
See "systemctl status rabbitmq-server.service" and "journalctl -xeu rabbitmq-server.service" for details.
restart kodi: 1
activating
$ journalctl -u rabbitmq-server --since '-2min' --no-pager -o cat | grep -i -m3 'error\|invalid\|juda'
Failed to create dirty cpu scheduler thread 238, error = 11
2026-11-10 09:07:04.122328+03:00 [error] <0.146.0> Error preparing configuration in phase transform_datatypes:
2026-11-10 09:07:04.167069+03:00 [error] <0.146.0>   - Error transforming datatype for: log.file.level
$ cp /root/rabbitmq.conf.zaxira /etc/rabbitmq/rabbitmq.conf; systemctl reset-failed rabbitmq-server; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
active
```

- Noto'g'ri `log.file.level` bilan tugun **ishga tushmadi** — xato aniq kalitni ko'rsatadi: `Error transforming datatype for: log.file.level`.
- Kuzatildi: o'sha jurnalda alohida `Failed to create dirty cpu scheduler thread … error = 11` qatori ham bor — bu konfiguratsiya xatosiga aloqasi yo'q, tugun keyin muammosiz ishga tushdi.
- Zaxira fayl qaytarildi — tugun yana ishlayapti. Xulosa: konfiguratsiyani o'zgartirishdan oldin nusxa oling, qayta ishga tushirgach holatini tekshiring.

### JSON log

```text vps
$ printf '%s\n' 'log.file.formatter = json' 'log.connection.level = warning' >> /etc/rabbitmq/rabbitmq.conf; cat /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
# Stream klientlari tugunga qanday ulanishi kerakligi (RQ: Advertised Host and Port)
# Bitta tugun, klientlar shu serverda: guest faqat loopback orqali kira oladi
stream.advertised_host = localhost
log.file.formatter = json
log.connection.level = warning
active
$ rabbitmq-diagnostics -q log_tail -N 1 | cut -c1-200
{"time":"2026-11-10 09:07:47.716290+03:00","level":"info","msg":"Time to start RabbitMQ: 8464 ms","line":449,"pid":"<0.10.0>","file":"rabbit.erl","domain":"rabbitmq","mfa":["rabbit","start_it",1]}
```

### Kategoriya darajasi

Har AMQP ulanishi `info` darajasida `accepting AMQP connection` qatorini yozadi. `log.connection.level = warning` bilan:

```text vps
$ cd /root/rabbit-ilova && A=$(grep -c 'accepting AMQP connection' /var/log/rabbitmq/rabbit@lab.log); node -e "require('amqplib').connect('amqp://localhost').then(c=>c.close())"; sleep 1; B=$(grep -c 'accepting AMQP connection' /var/log/rabbitmq/rabbit@lab.log); echo "info: oldin $A, keyin $B"
info: oldin 133, keyin 134
$ cp /etc/rabbitmq/rabbitmq.conf /root/rabbitmq.conf.zaxira; echo 'log.connection.level = warning' >> /etc/rabbitmq/rabbitmq.conf; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
active
$ cd /root/rabbit-ilova && A=$(grep -c 'accepting AMQP connection' /var/log/rabbitmq/rabbit@lab.log); node -e "require('amqplib').connect('amqp://localhost').then(c=>c.close())"; sleep 1; B=$(grep -c 'accepting AMQP connection' /var/log/rabbitmq/rabbit@lab.log); echo "warning: oldin $A, keyin $B"
warning: oldin 134, keyin 134
$ cp /root/rabbitmq.conf.zaxira /etc/rabbitmq/rabbitmq.conf; rm /root/rabbitmq.conf.zaxira; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server
active
```

`info` da bitta ulanish — bitta yangi qator; `warning` da — birorta ham yo'q. Boshqa kategoriyalar o'zgarmadi.

### Debug — qayta ishga tushirmasdan

```text vps
$ rabbitmqctl -q set_log_level debug; cd /root/rabbit-ilova && node -e "require('amqplib').connect('amqp://localhost').then(c=>c.close())"; sleep 1; rabbitmq-diagnostics -q log_tail -N 100 | grep '\[debug\]' | tail -2 | sed 's/<[0-9.]*>/<…>/' | cut -c1-150; rabbitmqctl -q set_log_level info
2026-11-10 09:09:13.542666+03:00 [debug] <…> Client address during authN phase: {0,0,0,0,0,65535,32512,1}
2026-11-10 09:09:13.543671+03:00 [debug] <…> User 'guest' authenticated successfully by backend rabbit_auth_backend_internal
```

`set_log_level debug` dan keyin ulanishning autentifikatsiya tafsilotlari ham yozildi; so'ng `info` ga qaytarildi. Oxirida `rabbitmq.conf` faqat `stream.advertised_host` bilan qoldi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Ko'p sozlama, avtomatlashtirish | `conf.d` katalogi (`RABBITMQ_CONFIG_FILES`) |
| Maxfiy qiymatni faylga yozmaslik | `$(O'ZGARUVCHI)` yoki shifrlangan qiymat (RQ: `encrypted:`) |
| Muammoni vaqtincha chuqur ko'rish | `set_log_level debug`, keyin `info` |
| Loglarni yig'ish tizimiga (ELK, Loki) | `log.file.formatter = json` |
| Konteyner | `log.console = true` (RQ: Logging to Console) |
| Shovqinli kategoriyani pasaytirish | `log.<kategoriya>.level` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faylni o'zgartirib, qayta ishga tushirmaslik | Faqat restartdan keyin kuchga kiradi (RQ) | Restart (yoki CLI bilan vaqtinchalik) |
| Zaxirasiz o'zgartirish | Noto'g'ri qiymat — tugun ishga tushmaydi (sinovda) | Nusxa, keyin tekshiruv |
| Fayl o'qilyapti deb taxmin qilish | Boshqa joyda bo'lishi mumkin | `status` → `Config files`, log boshi |
| Qiymatdagi `#` | Izoh deb o'qiladi (RQ) | Bitta qo'shtirnoq |
| `debug` ni doim yoqiq qoldirish | Juda ko'p log (RQ) | Faqat muammo vaqtida |
| `RABBITMQ_LOGS` va fayldagi log sozlamalari birga | Fayldagi sozlamalar e'tiborsiz qoladi (RQ) | Bittasini tanlash |

## Amaliyot

1. `rabbitmq.conf` qaysi formatda va izoh qanday yoziladi?
2. `advanced.config` qachon kerak?
3. Ishlatilayotgan konfiguratsiya faylini qanday topasiz?
4. Sinovda noto'g'ri `log.file.level` nimaga olib keldi?
5. Tugunni qayta ishga tushirmasdan debug logni qanday yoqasiz?

<details>
<summary>Javoblar</summary>

1. Sysctl formati (`kalit = qiymat`); izoh — `#`.
2. Sysctl formatida ifodalab bo'lmaydigan kam sonli sozlamalar uchun.
3. `rabbitmq-diagnostics status` (`Config files`) yoki log boshidagi `config file(s)`.
4. Tugun ishga tushmadi; jurnalda `Error transforming datatype for: log.file.level`.
5. `rabbitmqctl set_log_level debug` (restartgacha amal qiladi).

</details>

## Rasmiy hujjat

- [RQ: Configuration](https://www.rabbitmq.com/docs/configure)
- [RQ: File and Directory Locations](https://www.rabbitmq.com/docs/relocate)
- [RQ: Logging](https://www.rabbitmq.com/docs/logging)

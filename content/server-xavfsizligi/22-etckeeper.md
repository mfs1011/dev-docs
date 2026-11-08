# 22 — etckeeper: `/etc` o'zgarishlar tarixi

[Mundarija](README.md)

## Tushuncha

Server sozlamalari — `/etc` da. Biror narsa buzilsa, birinchi savol: **nima, qachon o'zgardi?**

UB (etckeeper): etckeeper `/etc` mazmunini **versiyalar boshqaruvi tizimi** (VCS — Version Control System) omborida saqlaydi. U APT bilan birlashgan: paket o'rnatilganda yoki yangilanganda `/etc` dagi o'zgarishlarni avtomatik commit qiladi. `/etc` ni versiya nazoratida saqlash — sohadagi eng yaxshi amaliyot hisoblanadi.

| Narsa | UB |
| --- | --- |
| Asosiy sozlama | `/etc/etckeeper/etckeeper.conf`; VCS — standart `git` |
| Ombor | Paket o'rnatilganda o'zi yaratiladi va birinchi commit qilinadi; bekor qilish — `etckeeper uninit` |
| Avtomatik commit | Har kuni (o'chirish — `AVOID_DAILY_AUTOCOMMITS`); paket o'rnatishdan oldin va keyin |
| Qo'lda commit | `etckeeper commit "sabab"` — aniqroq tarix uchun tavsiya etiladi |
| VCS buyruqlari | `etckeeper vcs …` — `/etc` ichida (masalan, `etckeeper vcs log /etc/passwd`) |

etckeeper **zaxira emas**: ombor o'sha serverdagi `/etc/.git` da — server yo'qolsa, tarix ham yo'qoladi (19–21-boblar).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### O'rnatish

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q etckeeper 2>&1 | grep -E '^Setting up etckeeper'; grep -E '^(VCS|AVOID_DAILY_AUTOCOMMITS|#AVOID_DAILY_AUTOCOMMITS|HIGHLEVEL_PACKAGE_MANAGER)=' /etc/etckeeper/etckeeper.conf
Setting up etckeeper (1.18.23-2build1) ...
VCS="git"
#AVOID_DAILY_AUTOCOMMITS=1
HIGHLEVEL_PACKAGE_MANAGER=apt
$ etckeeper vcs log --format='%h %an | %s' | head -3; etckeeper vcs ls-files | wc -l | sed 's/^/kuzatilayotgan fayllar: /'; stat -c '%A %U %n' /etc/.git; etckeeper vcs ls-files | grep -E '^(shadow|ssh/sshd_config)$'
9852989 root | Initial commit
kuzatilayotgan fayllar: 1400
drwx------ root /etc/.git
shadow
ssh/sshd_config
```

- VCS — `git`; kunlik avtomatik commit yoqilgan (`AVOID_DAILY_AUTOCOMMITS` izohda); paket menejeri — `apt`.
- Birinchi commit — 1400 fayl. Ombor ichida `shadow` ham bor; `/etc/.git` — `drwx------`, faqat root uchun.

### APT bilan birga

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q sysstat 2>&1 | grep -E 'master|files? changed|create mode.*sysstat'
[master 54b1628] committing changes in /etc made by "apt-get install -y -q sysstat"
 12 files changed, 894 insertions(+)
 create mode 100644 default/sysstat
 create mode 100644 sysstat/sysstat
 create mode 100644 sysstat/sysstat.ioconf
 create mode 120000 systemd/system/multi-user.target.wants/sysstat.service
 create mode 120000 systemd/system/sysstat.service.wants/sysstat-collect.timer
 create mode 120000 systemd/system/sysstat.service.wants/sysstat-rotate.timer
 create mode 120000 systemd/system/sysstat.service.wants/sysstat-summary.timer
$ etckeeper vcs log --format='%h | %s' -3
54b1628 | committing changes in /etc made by "apt-get install -y -q sysstat"
9852989 | Initial commit
```

Paket o'rnatildi — etckeeper o'zi commit qildi: xabarida qaysi buyruq ekani, ichida yangi sozlama fayllari va systemd havolalari.

### Qo'lda o'zgarish

```text vps
$ echo '# 22-bob sinovi' >> /etc/hosts; etckeeper vcs status --short; etckeeper vcs diff | tail -3
 M hosts
 
 203.0.113.10 lab
+# 22-bob sinovi
```

`status` — `hosts` o'zgargan; `diff` — qaysi qator qo'shilgani.

```text vps
$ etckeeper commit "hosts: sinov izohi" 2>&1 | head -2; etckeeper vcs log --format='%h | %s' -1 -- hosts
[master 6f56ae8] hosts: sinov izohi
 1 file changed, 1 insertion(+)
6f56ae8 | hosts: sinov izohi
$ sed -i '/^# 22-bob sinovi$/d' /etc/hosts; etckeeper commit "hosts: sinov izohi olib tashlandi" 2>&1 | head -1; etckeeper vcs diff HEAD~2 -- hosts | wc -l | sed 's/^/2 commit oldingi holatdan farq (qator): /'
[master 5721983] hosts: sinov izohi olib tashlandi
2 commit oldingi holatdan farq (qator): 0
```

O'zgarish sababi bilan commit qilindi, keyin qaytarildi — ikki commit oldingi holatdan farqi yo'q. Tarixda ikkalasi ham qoldi.

### Tozalash

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get purge -y -q sysstat libsensors5 libsensors-config 2>&1 | grep -E 'master|files? changed'; etckeeper vcs log --format='%h | %s' -1; systemctl list-timers --all --no-pager | grep -o 'etckeeper.timer.*' | awk '{print $1, $2}'
[master d33a95a] committing changes in /etc made by "apt-get purge -y -q sysstat libsensors5 libsensors-config"
 12 files changed, 894 deletions(-)
d33a95a | committing changes in /etc made by "apt-get purge -y -q sysstat libsensors5 libsensors-config"
etckeeper.timer etckeeper.service
```

Sinov paketi olib tashlandi — bu ham commit. Kunlik commit — `etckeeper.timer` (systemd).

## Foydali buyruqlar

| Buyruq | Nima |
| --- | --- |
| `etckeeper vcs log --oneline` | Tarix |
| `etckeeper vcs log -p -- ssh/sshd_config` | Bitta fayl o'zgarishlari |
| `etckeeper vcs status`, `vcs diff` | Commit qilinmagan o'zgarishlar |
| `etckeeper vcs show ID` | Bitta commit |
| `etckeeper commit "sabab"` | Qo'lda commit |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| etckeeper — zaxira deb o'ylash | Ombor o'sha serverda | Alohida zaxira (19–21-boblar) |
| `/etc` omborini ochiq masofaviy repo'ga push qilish | Ichida `shadow`, kalitlar | Faqat ishonchli joyga yoki umuman push qilmaslik |
| Faqat avtomatik commit'larga tayanish | "Nega" yozilmaydi | `etckeeper commit "sabab"` (UB) |
| `/etc/.git` huquqlarini o'zgartirish | Boshqalar sozlamalarni o'qiydi | `700`, root |
| Qo'lda o'zgarishni commit qilmaslik | Keyingi kunlik yoki APT commit'iga aralashadi | O'zgarishdan keyin darhol commit |

## Amaliyot

1. etckeeper nima qiladi?
2. Qachon avtomatik commit qiladi?
3. Qo'lda o'zgarishni qanday ko'rasiz va commit qilasiz?
4. Nega `/etc` omborini ochiq joyga push qilib bo'lmaydi?
5. etckeeper zaxira o'rnini bosadimi?

<details>
<summary>Javoblar</summary>

1. `/etc` ni VCS (git) omborida saqlaydi va o'zgarishlarni commit qiladi.
2. Har kuni va paket o'rnatishdan oldin hamda keyin.
3. `etckeeper vcs status`, `vcs diff`; `etckeeper commit "sabab"`.
4. Ichida `shadow` va boshqa maxfiy fayllar bor.
5. Yo'q — ombor o'sha serverda.

</details>

## Rasmiy hujjat

- [UB: etckeeper](https://ubuntu.com/server/docs/how-to/backups/install-etckeeper/)
- [etckeeper](https://etckeeper.branchable.com/)

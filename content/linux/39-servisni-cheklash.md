# 39 — Servisni cheklash

[← Oldingi: Rejali ishlar](38-rejali-ishlar.md) · [Mundarija](README.md) · [Keyingi: IP, interfeys va marshrut →](40-ip-interfeys-marshrut.md)

## Tushuncha

Servis — serverda uzoq ishlaydigan dastur. U xato qilsa (xotirani to'ldirsa, protsessorni band qilsa) yoki uni buzib kirishsa, zarar butun serverga yetishi mumkin. 35-bobda birinchi qadamni qilganmiz: servisni root emas, alohida foydalanuvchi (`User=`) nomidan ishga tushirdik. systemd servisga yana ikki xil chegara qo'ya oladi:

| Turi | Nima qiladi | Sozlamalar | Hujjat |
| --- | --- | --- | --- |
| Resurs chegarasi | Servis qancha xotira va protsessor vaqti ishlatishi mumkin | `MemoryHigh=`, `MemoryMax=`, `CPUQuota=` | systemd.resource-control(5) |
| Qum qutisi (sandbox) | Servis fayl tizimining qaysi qismini ko'radi va qanday huquq ola oladi | `ProtectSystem=`, `ProtectHome=`, `PrivateTmp=`, `NoNewPrivileges=` | systemd.exec(5) |

Resurs chegaralari Linux yadrosining cgroup mexanizmi orqali ishlaydi (31-bobda `MemoryMax=` bilan OOM'ni ko'rganmiz). Qum qutisi sozlamalarining ko'pi servis uchun alohida fayl tizimi ko'rinishini (namespace) yaratadi: servis tizimni boshqacha ko'radi, qolgan dasturlar esa odatdagidek.

Sozlamalarni sinash uchun 29–31-boblardagi `systemd-run` qulay. `-p` bilan sozlama beriladi. Man sahifasiga ko'ra `-P` (`--pipe`) servisning kirish va chiqishini `systemd-run` ning o'ziga ulaydi — natija shu terminalda ko'rinadi. `-q` (`--quiet`) esa qo'shimcha xabarlarni o'chiradi.

## Protsessor: `CPUQuota=`

systemd.resource-control(5): `CPUQuota=` servisga beriladigan protsessor vaqtini foizda belgilaydi, foiz **bitta** protsessorning umumiy vaqtiga nisbatan. Bir nechta protsessor berish uchun 100% dan katta qiymat yoziladi.

Cheksiz sikl bitta protsessorni to'liq band qiladi. Uni 20% bilan cheklaymiz:

```text
$ systemd-run --unit=yuk -p CPUQuota=20% /bin/sh -c 'while :; do :; done'
Running as unit: yuk.service
$ sleep 6
$ top -b -n1 -p $(systemctl show -p MainPID --value yuk) | tail -n 2
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  184 root      20   0    2860   1544   1468 R  16.7   0.7   0:02.75 sh
$ systemctl show yuk -p CPUQuotaPerSecUSec
CPUQuotaPerSecUSec=200ms
$ systemctl stop yuk
```

`top` ~20% ko'rsatadi (o'lchash payti tufayli biroz farq qilishi mumkin). `CPUQuotaPerSecUSec=200ms` — har soniyadan servisga 200 millisoniya protsessor vaqti beriladi.

## Xotira: `MemoryHigh=` va `MemoryMax=`

| Sozlama | Chegaradan oshganda | Hujjatdagi tavsif |
| --- | --- | --- |
| `MemoryHigh=` | Chegaradan oshishi mumkin, lekin servis jarayonlari qattiq sekinlashtiriladi va xotira ulardan tortib olinadi | Asosiy boshqaruv mexanizmi |
| `MemoryMax=` | Qat'iy chegara: sig'masa, servis ichida OOM killer ishga tushadi (31-bob) | Oxirgi himoya chizig'i |

systemd.resource-control(5) aynan shunday tavsiya qiladi: `MemoryHigh=` — asosiy mexanizm, `MemoryMax=` — oxirgi himoya chizig'i. Qiymat baytda yoki `K`, `M`, `G`, `T` qo'shimchasi bilan yoziladi. Ikkalasini birga qo'llashni pastda VPS'da ko'ramiz.

## Tizim fayllarini faqat o'qish: `ProtectSystem=`

| Qiymat | Faqat o'qish uchun bo'ladi |
| --- | --- |
| `yes` (`true`) | `/usr`, `/boot`, `/efi` |
| `full` | yuqoridagilar va `/etc` |
| `strict` | butun fayl tizimi; `/dev`, `/proc` va `/sys` bundan mustasno |

Hujjat bu sozlamani tizimni yangilash bilan shug'ullanmaydigan barcha uzoq ishlaydigan servislarda yoqishni tavsiya qiladi. `strict` bilan servis hech qayerga yoza olmaydi, shuning uchun unga kerak bo'lgan katalog `ReadWritePaths=` bilan ochiladi:

```text
$ systemd-run -q -P -p ProtectSystem=strict touch /etc/sinov
/usr/bin/touch: cannot touch '/etc/sinov': Read-only file system
$ mkdir -p /var/lib/ilova
$ systemd-run -q -P -p ProtectSystem=strict -p ReadWritePaths=/var/lib/ilova touch /var/lib/ilova/ok
$ ls /var/lib/ilova
ok
```

Birinchi buyruq root nomidan ishladi, lekin `/etc` ga yoza olmadi: servis uchun u faqat o'qish uchun. Hujjatga ko'ra `StateDirectory=`, `LogsDirectory=` kabi katalog sozlamalari ham o'z katalogini `ProtectSystem=` ta'siridan chiqaradi.

## Uy kataloglari: `ProtectHome=`

`ProtectHome=yes` bo'lsa, `/home`, `/root` va `/run/user` servis uchun bo'sh va kirib bo'lmaydigan bo'ladi. `read-only` — faqat o'qish uchun, `tmpfs` — ular o'rniga bo'sh vaqtinchalik fayl tizimi.

```text
$ ls -la /root
total 5
drwx------  4 root root   0 Jul  2 19:05 .
drwxr-xr-x 17 root root   0 Nov  5 11:40 ..
-rw-r--r--  1 root root 571 Apr 10  2021 .bashrc
drwx------  3 root root   0 Nov  7 10:15 .config
-rw-------  1 root root  20 Nov  7 10:15 .lesshst
-rw-r--r--  1 root root 161 Jul  9  2019 .profile
drwx------  2 root root   0 Nov  5 11:40 .ssh
$ systemd-run -q -P -p ProtectHome=yes ls -la /root
total 1
d---------  2 root root 40 Nov  5 11:41 .
drwxr-xr-x 17 root root  0 Nov  5 11:40 ..
```

Servis `/root` ni bo'sh katalog sifatida ko'radi: `.bashrc` ham, `.ssh` ham yo'q. Hujjat buni ayniqsa tarmoqqa ochiq servislarda yoqishni tavsiya qiladi — ular foydalanuvchilarning shaxsiy fayllarini o'qiy olmasin.

## Shaxsiy `/tmp`: `PrivateTmp=`

`PrivateTmp=yes` servis uchun alohida `/tmp` va `/var/tmp` yaratadi. Ular boshqa dasturlar bilan umumiy emas:

```text
$ systemd-run -q -P -p PrivateTmp=yes sh -c 'echo salom > /tmp/sir.txt; ls -l /tmp/sir.txt'
-rw-r--r-- 1 root root 6 Nov  7 10:15 /tmp/sir.txt
$ ls -l /tmp/sir.txt
ls: cannot access '/tmp/sir.txt': No such file or directory
```

Servis ichida fayl bor, tashqarida yo'q. Hujjat kamchiligini ham aytadi: servislar endi `/tmp` orqali fayl almasha olmaydi.

## Yangi huquq olmaslik: `NoNewPrivileges=`

8-bobda setuid bitini ko'rganmiz: masalan, `sudo` shu bit tufayli root huquqi bilan ishga tushadi. systemd.exec(5): `NoNewPrivileges=yes` servis jarayoni va uning barcha bolalari `execve()` orqali yangi huquq ololmasligini kafolatlaydi (setuid, setgid bitlari yoki fayl capability'lari orqali). Hujjat buni huquq oshishining oldini olishning eng oddiy va samarali yo'li deb ataydi.

```text
$ systemd-run -q -P -p User=nobody sudo -n true
sudo: a password is required
$ systemd-run -q -P -p User=nobody -p NoNewPrivileges=yes sudo -n true
sudo: The "no new privileges" flag is set, which prevents sudo from running as root.
sudo: If sudo is running in a container, you may need to adjust the container configuration to disable the flag.
```

Birinchi holatda `sudo` root bo'lib ishga tushdi va parol so'radi. Ikkinchisida u umuman root bo'la olmadi.

## Qanchalik himoyalangan: `systemd-analyze security`

systemd-analyze(1): `systemd-analyze security` servisning cheklov sozlamalarini tekshiradi va har biriga "ochiqlik" (exposure) bali beradi. Umumiy bal 0.0 dan 10.0 gacha: yuqori bal — servis deyarli cheklanmagan, past bal — qattiq cheklangan. Hujjat ogohlantiradi: bu faqat systemd'ning o'z sozlamalarini hisoblaydi, dasturning ichki himoyasini emas.

Trenajorda bu buyruq 20 soniyadan ko'proq ishlaydi, shuning uchun uni VPS'da, 35–36-boblardagi `salom.service` misolida ko'ramiz:

```text vps
$ systemd-analyze security salom.service --no-pager | tail -n 1
→ Overall exposure level for salom.service: 9.2 UNSAFE :-{
$ systemd-analyze security salom.service --no-pager | grep -E '(NoNewPrivileges|PrivateTmp|ProtectSystem|ProtectHome)='
✗ NoNewPrivileges=                                            Service processes may acquire new privileges                                 0.2
✗ ProtectSystem=                                              Service has full access to the OS file hierarchy                             0.2
✗ ProtectHome=                                                Service has full access to home directories                                  0.2
✗ PrivateTmp=                                                 Service has access to other software's temporary files                       0.2
```

Cheklovlarni drop-in bilan qo'shamiz (36-bobdagi `systemctl edit --stdin`, systemd 256+):

```text vps
$ systemctl edit --stdin --drop-in=cheklov salom <<'EOF'
> [Service]
> MemoryHigh=80M
> MemoryMax=100M
> CPUQuota=50%
> NoNewPrivileges=yes
> PrivateTmp=yes
> ProtectSystem=strict
> ProtectHome=yes
> EOF
Successfully installed edited file '/etc/systemd/system/salom.service.d/cheklov.conf'.
$ systemctl restart salom
$ sleep 1
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/
200
$ systemctl status salom --no-pager | head -n 10
● salom.service - Salom veb-ilovasi (python http.server)
     Loaded: loaded (/etc/systemd/system/salom.service; enabled; preset: enabled)
    Drop-In: /etc/systemd/system/salom.service.d
             └─cheklov.conf
     Active: active (running) since Sat 2026-11-07 13:11:40 MSK; 1s ago
 Invocation: b3eed79f420d42c498d18df924d44d18
   Main PID: 5541 (python3)
      Tasks: 1 (limit: 984)
     Memory: 11.9M (high: 80M, max: 100M, available: 68M, peak: 11.9M)
        CPU: 123ms
$ systemd-analyze security salom.service --no-pager | grep -E '(NoNewPrivileges|PrivateTmp|ProtectSystem|ProtectHome)='
✓ NoNewPrivileges=                                            Service processes cannot acquire new privileges                         
✓ ProtectSystem=                                              Service has strict read-only access to the OS file hierarchy            
✓ PrivateTmp=                                                 Service has no access to other software's temporary files               
✓ ProtectHome=                                                Service has no access to home directories                               
$ systemd-analyze security salom.service --no-pager | tail -n 1
→ Overall exposure level for salom.service: 8.3 EXPOSED :-(
```

- Ilova ishlashda davom etdi (`200`): u faqat `/srv/salom` dan o'qiydi, yozishga ehtiyoji yo'q. Ilova biror joyga yozsa, `ProtectSystem=strict` uni to'xtatar edi — o'sha katalog `ReadWritePaths=` bilan ochilardi.
- `status` endi xotira chegaralarini ham ko'rsatadi: `high: 80M, max: 100M`.
- Bal 9.2 dan 8.3 ga tushdi. Qolgani — boshqa sozlamalar (tarmoq, yadro sozlamalari, tizim chaqiruvlari va hokazo). Ro'yxatning to'liq ko'rinishi: `systemd-analyze security salom.service`. Ularni ham birma-bir qo'shib, har safar ilovani tekshirish mumkin.

Butun tizim bo'yicha jadval:

```text vps
$ systemd-analyze security --no-pager | head -n 12
UNIT                                 EXPOSURE PREDICATE HAPPY
chrony.service                            3.7 OK        :-)
dbus.service                              9.2 UNSAFE    :-{
dmesg.service                             9.6 UNSAFE    :-{
emergency.service                         9.5 UNSAFE    :-{
getty@tty1.service                        9.6 UNSAFE    :-{
ifup@ens3.service                         9.5 UNSAFE    :-{
polkit.service                            1.2 OK        :-)
qemu-guest-agent.service                  9.6 UNSAFE    :-{
rc-local.service                          9.6 UNSAFE    :-{
rescue.service                            9.5 UNSAFE    :-{
rsyslog.service                           6.3 MEDIUM    :-|
```

`chrony` (vaqt sinxronizatsiyasi) va `polkit` ning unit fayllarida cheklovlar allaqachon yozilgan. Ularning unit fayllarini `systemctl cat chrony` bilan ko'rib, qanday sozlamalar ishlatilganini o'rganish mumkin.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| systemd | 252 | 259 |
| `systemctl edit --stdin` | yo'q | bor (256+) |
| `systemd-analyze security` | 20 soniyadan ko'proq | bir zumda |

Bu bobdagi sozlamalar ikkala versiyada bir xil ishlaydi.

## Tipik xatolar

**1. `ProtectSystem=strict` qo'yib, yozish katalogini ochmaslik.**
Servis "Read-only file system" xatosi bilan to'xtaydi.
To'g'risi: kerakli katalogni `ReadWritePaths=` (yoki `StateDirectory=`) bilan ochish.

**2. `MemoryMax=` ni ilova ehtiyojidan kichik qo'yish.**
Servisni OOM killer qayta-qayta o'ldiradi.
To'g'risi: avval `systemctl status` dagi `Memory:` va `peak` ni kuzatish. Asosiy chegara — `MemoryHigh=`, `MemoryMax=` esa undan yuqorida.

**3. `PrivateTmp=yes` bilan servislar orasida `/tmp` orqali fayl almashish.**
Boshqa servis faylni ko'rmaydi.
To'g'risi: umumiy katalog (masalan, `/var/lib/...` yoki `/run/...`).

**4. Hamma sozlamani birdan yoqish.**
Ilova qayerda buzilganini topish qiyin bo'ladi.
To'g'risi: bittadan qo'shish, har safar `restart` va ilovani tekshirish (`curl`, loglar).

**5. Ballni 0 ga tushirishni maqsad qilish.**
Bal faqat systemd sozlamalarini hisoblaydi. Maqsad — ilovaga kerak bo'lmagan huquqlarni olib tashlash.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=39-cheklov)** "Servisni cheklash": tayyor servisga `ProtectSystem=strict` qo'shib, uning yiqilishini ko'rasiz, sababini jurnaldan topasiz va `ReadWritePaths=` bilan tuzatasiz.

Savollar:

1. Servisni bitta protsessorning yarmi bilan cheklash uchun qaysi sozlama yoziladi?
2. `MemoryHigh=` va `MemoryMax=` ning farqi nima?
3. `ProtectSystem=strict` li servis `/var/lib/ilova` ga yozishi kerak. Nima qilasiz?
4. Servis `/tmp/x` ga yozdi, siz esa terminalda `/tmp/x` ni ko'rmayapsiz. Sababi nima bo'lishi mumkin?
5. `systemd-analyze security` bali 9.6. Bu servis buzilgan degani-mi?

<details>
<summary>Javoblar</summary>

1. `CPUQuota=50%`.
2. `MemoryHigh=` — oshib ketish mumkin, lekin servis sekinlashtiriladi; `MemoryMax=` — qat'iy chegara, oshsa OOM killer.
3. `ReadWritePaths=/var/lib/ilova` (yoki `StateDirectory=ilova`).
4. Servisda `PrivateTmp=yes`: uning `/tmp` i alohida.
5. Yo'q. Bal servis qanchalik kam cheklanganini ko'rsatadi, xolos.

</details>

## Rasmiy hujjat

- [systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) — `CPUQuota=`, `MemoryHigh=`, `MemoryMax=`
- [systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) — `ProtectSystem=`, `ProtectHome=`, `PrivateTmp=`, `NoNewPrivileges=`, `ReadWritePaths=`
- [systemd-analyze(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html) — `security`
- [systemd-run(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html) — `-p`, `--pipe`, `--quiet`
- Trenajorda: `man systemd.resource-control`, `man systemd.exec`, `man systemd-analyze`

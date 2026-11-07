# 45 — SSH bilan ulanish

[← Oldingi: Vaqt va xost nomi](44-vaqt-va-xost-nomi.md) · [Mundarija](README.md) · [Keyingi: Fayl ko'chirish →](46-fayl-kochirish.md)

## Tushuncha

SSH (Secure Shell) — boshqa kompyuterga shifrlangan ulanish: serverda buyruq bajarish, fayl ko'chirish (46-bob), tunnel (47-bob). Ulanishda ikki tomon bir-birini tekshiradi:

| Kim kimni tekshiradi | Qanday | Qayerda saqlanadi |
| --- | --- | --- |
| Mijoz serverni | Serverning host kaliti | Mijozda: `~/.ssh/known_hosts` |
| Server mijozni | Parol yoki mijozning kaliti | Serverda: `~/.ssh/authorized_keys` |

Kalit juftligi ikki qismdan iborat: **shaxsiy** (private) kalit faqat sizning kompyuteringizda qoladi, **ochiq** (public) kalit esa serverga qo'yiladi. Debian Reference (6.3) bo'yicha `~/.ssh/authorized_keys` — shu hisobga ulanishga ruxsat berilgan ochiq kalitlar ro'yxati.

> **Chiqishlar haqida.** Trenajorda SSH yo'q, shuning uchun bu bob VPS va tashqi kompyuterda: muallifning noutbukidan (macOS) VPS'ga. VPS'ning ochiq IP manzili `203.0.113.10` bilan, server logidagi noutbuk manzili `198.51.100.20` bilan almashtirilgan (RFC 5737). Tajriba uchun VPS'da vaqtinchalik `demo` foydalanuvchisi va yangi sinov kaliti ishlatildi, oxirida ikkalasi ham o'chirildi.

<div data-animatsiya="qadamli" data-nom="ssh"></div>

## Kalit yaratish

Ubuntu Server hujjati ed25519 algoritmini tavsiya qiladi: kaliti qisqa va hisoblash uchun yengil.

```text tashqi
$ ssh -V
OpenSSH_10.2p1, LibreSSL 3.3.6
$ ssh-keygen -t ed25519 -f sinov_key -N '' -C 'sinov-kalit'
Generating public/private ed25519 key pair.
Your identification has been saved in sinov_key
Your public key has been saved in sinov_key.pub
The key fingerprint is:
SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8 sinov-kalit
The key's randomart image is:
+--[ED25519 256]--+
|                 |
|               .o|
|            o +oo|
|         . o XoB.|
|        S o B @=o|
|       .   * oo=B|
|      .   = *.+E.|
|       .   =.+.=o|
|        ....o.=++|
+----[SHA256]-----+
$ ls -l sinov_key sinov_key.pub
-rw-------@ 1 mfsv  wheel  399 Nov  7 15:51 sinov_key
-rw-r--r--@ 1 mfsv  wheel   93 Nov  7 15:51 sinov_key.pub
$ cat sinov_key.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIJfSt/MfIaSGiHbLSvcilJA0ND+9KMHmM3TlCGEIXCB sinov-kalit
$ ssh-keygen -lf sinov_key.pub
256 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8 sinov-kalit (ED25519)
```

- `-t ed25519` — algoritm, `-f` — fayl nomi (standart holatda `~/.ssh/id_ed25519`), `-C` — izoh.
- `sinov_key` — shaxsiy kalit, ruxsati `600` (faqat egasi o'qiydi). `sinov_key.pub` — ochiq kalit, uni ko'rsatish xavfsiz.
- Fingerprint (`SHA256:...`) — kalitning qisqa "barmoq izi", kalitlarni solishtirish uchun.
- `-N ''` — kalitga parol so'zi (passphrase) qo'ymaslik. Bu faqat sinov uchun. Debian Reference (6.3.5): shaxsiy kalitni parol so'zi bilan himoyalash xavfsizroq. Mavjud kalitga keyin ham qo'shsa bo'ladi: `ssh-keygen -p`.

## Ochiq kalitni serverga qo'yish

Odatda buni `ssh-copy-id foydalanuvchi@server` qiladi (Ubuntu hujjati), lekin u server parol bilan kirishga ruxsat berishini talab qiladi. Bizda admin (root) bor, shuning uchun kalitni qo'lda qo'yamiz:

```text vps
$ useradd -m -s /bin/bash demo
$ install -d -m 700 -o demo -g demo /home/demo/.ssh
$ echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIJfSt/MfIaSGiHbLSvcilJA0ND+9KMHmM3TlCGEIXCB sinov-kalit' > /home/demo/.ssh/authorized_keys
$ chown demo:demo /home/demo/.ssh/authorized_keys
$ chmod 600 /home/demo/.ssh/authorized_keys
$ ls -la /home/demo/.ssh
total 12
drwx------ 2 demo demo 4096 Nov  7 13:51 .
drwxr-x--- 3 demo demo 4096 Nov  7 13:51 ..
-rw------- 1 demo demo   93 Nov  7 13:51 authorized_keys
```

`~/.ssh` — `700`, `authorized_keys` — `600`. Ubuntu hujjati: `authorized_keys` ga faqat foydalanuvchining o'zi yoza olishi kerak. Nega bu muhim — pastda.

## Birinchi ulanish va `known_hosts`

```text tashqi
$ ssh -i sinov_key -o UserKnownHostsFile=./known_hosts -o StrictHostKeyChecking=accept-new demo@203.0.113.10 'whoami; hostname'
Warning: Permanently added '203.0.113.10' (ED25519) to the list of known hosts.
demo
lab
$ cut -d' ' -f1,2 known_hosts
203.0.113.10 ssh-ed25519
$ ssh -i sinov_key -o UserKnownHostsFile=./known_hosts demo@203.0.113.10 'echo ikkinchi marta'
ikkinchi marta
```

- `-i` — qaysi shaxsiy kalit bilan kirish. Oxirgi argument — serverda bajariladigan buyruq.
- Birinchi ulanishda serverning host kaliti `known_hosts` ga yozildi. Keyingi ulanishlarda ssh kalitni shu yozuv bilan solishtiradi.
- ssh_config(5) bo'yicha `StrictHostKeyChecking` ning standart qiymati `ask`: yangi server kaliti foydalanuvchi tasdiqlagandan keyingina qo'shiladi — ssh fingerprint'ni ko'rsatib, so'raydi. `accept-new` yangi kalitni o'zi qo'shadi, lekin kaliti **o'zgargan** serverga ulanmaydi.
- `-o UserKnownHostsFile=./known_hosts` — sinov uchun alohida fayl, haqiqiy `~/.ssh/known_hosts` ga tegmaslik uchun.

Fingerprint so'ralganda uni shunchaki "yes" bilan qabul qilmang. Serverning o'zida (masalan, provayder panelidagi konsol orqali) `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` bilan haqiqiy fingerprint'ni ko'rib, solishtiring. (Bizning VPS fingerprint'ini qo'llanmaga yozmadik: u server manzilini topishga yordam berishi mumkin.)

## `~/.ssh/config`: qisqa nom

Har safar uzun buyruq yozmaslik uchun sozlamalar `~/.ssh/config` ga yoziladi (Debian Reference 6.3.2). Haqiqiy `~/.ssh/config` ga tegmaslik uchun sinovda alohida faylni `-F` bilan beramiz:

```text tashqi
$ cat config
Host sinov
    HostName 203.0.113.10
    User demo
    IdentityFile ./sinov_key
    IdentitiesOnly yes
    PasswordAuthentication no
    UserKnownHostsFile ./known_hosts
$ ssh -F config sinov 'whoami'
demo
```

ssh_config(5) bo'yicha:

| Sozlama | Ma'nosi |
| --- | --- |
| `Host sinov` | Qisqa nom: `ssh sinov` |
| `HostName` | Haqiqiy manzil |
| `User` | Serverdagi foydalanuvchi |
| `IdentityFile` | Shaxsiy kalit fayli |
| `IdentitiesOnly yes` | Faqat ko'rsatilgan kalitni ishlatish, ssh-agent'dagi boshqa kalitlarni emas |
| `PasswordAuthentication no` | Parol bilan kirishga urinmaslik |

## ssh-agent

Kalitga parol so'zi qo'yilgan bo'lsa, ssh-agent uni bir marta so'raydi va kalitni xotirada saqlab turadi (Debian Reference 6.3.5):

```text tashqi
$ eval "$(ssh-agent -s)"
Agent pid 23763
$ ssh-add sinov_key
Identity added: sinov_key (sinov-kalit)
$ ssh-add -l
256 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8 sinov-kalit (ED25519)
$ ssh-agent -k
unset SSH_AUTH_SOCK;
unset SSH_AGENT_PID;
echo Agent pid 23763 killed;
```

`ssh-agent -s` o'zgaruvchilarni (`SSH_AUTH_SOCK` va boshqalar) chiqaradi, `eval` ularni joriy qobiq (shell)ga o'rnatadi. `ssh-add -l` — agentdagi kalitlar ro'yxati, `ssh-agent -k` — agentni to'xtatish.

## "Permission denied (publickey)"

`~/.ssh` katalogi ruxsatini ataylab buzamiz:

```text vps
$ chmod 777 /home/demo/.ssh
```

```text tashqi
$ ssh -F config sinov 'whoami'
demo@203.0.113.10: Permission denied (publickey,password).
```

Mijoz faqat "rad etildi" deydi. Sababi server logida:

```text vps
$ journalctl -u ssh --since '-1min' --no-pager -o cat | grep demo
Accepted publickey for demo from 198.51.100.20 port 54272 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8
pam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)
pam_unix(sshd:session): session closed for user demo
Accepted publickey for demo from 198.51.100.20 port 54273 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8
pam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)
pam_unix(sshd:session): session closed for user demo
Accepted publickey for demo from 198.51.100.20 port 54274 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8
pam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)
pam_unix(sshd:session): session closed for user demo
Authentication refused: bad ownership or modes for directory /home/demo/.ssh
Connection closed by authenticating user demo 198.51.100.20 port 54276 [preauth]
$ chmod 700 /home/demo/.ssh
```

```text tashqi
$ ssh -F config sinov 'whoami'
demo
```

sshd_config(5): `StrictModes` (standart holatda yoqilgan) — sshd kirishga ruxsat berishdan oldin foydalanuvchi fayllari va uy katalogining ruxsatlari va egasini tekshiradi, chunki yangi boshlovchilar ba'zan ularni hammaga yoziladigan qilib qo'yadi. `777` — har kim yoza oladi, demak boshqa birov `authorized_keys` ga o'z kalitini qo'shishi mumkin edi. Shuning uchun server kalitni rad etdi.

Debian Reference (6.3.9) maslahati ham shu: muammo bo'lsa, sozlama fayllari ruxsatlarini tekshiring va ssh'ni `-v` bilan ishga tushiring.

Shaxsiy kalitning ruxsati ochiq bo'lsa, mijozning o'zi ham uni rad etadi:

```text tashqi
$ chmod 644 sinov_key
$ ssh-keygen -y -f sinov_key
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for 'sinov_key' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "sinov_key": bad permissions
$ chmod 600 sinov_key
```

## Tozalash

```text vps
$ userdel -r demo
userdel: user demo is currently used by process 9584
$ sleep 11
$ userdel -r demo
userdel: demo mail spool (/var/mail/demo) not found
$ id demo
id: 'demo': no such user
```

Birinchi urinish muvaffaqiyatsiz bo'ldi: foydalanuvchi chiqqandan keyin uning jarayoni hali ishlayotgan edi. logind.conf(5): `UserStopDelaySec=` — foydalanuvchi to'liq chiqqandan keyin uning `user@.service` i qancha saqlanib turishi, standart qiymati 10 soniya. 11 soniyadan keyin o'chirildi (`mail spool` haqidagi xabar — shunchaki pochta qutisi yo'qligi).

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) | Noutbuk (macOS) |
| --- | --- | --- | --- |
| SSH | o'rnatilmagan | server: OpenSSH 10.2p1 | mijoz: OpenSSH 10.2p1 |

## Tipik xatolar

**1. Shaxsiy kalitni serverga yoki chatga ko'chirish.**
Shaxsiy kalit faqat sizning kompyuteringizda turadi. Serverga — faqat `.pub`.

**2. Fingerprint'ni tekshirmay "yes" deyish.**
Bu ssh'ning o'rtadagi odam hujumidan himoyasini bekor qiladi.
To'g'risi: fingerprint'ni serverning o'zida ko'rib, solishtirish.

**3. "REMOTE HOST IDENTIFICATION HAS CHANGED" dan keyin `known_hosts` ni o'ylamay tozalash.**
Debian Reference (6.3.9): avval host kaliti haqiqatan o'zgarganiga (masalan, server qayta o'rnatilgan) va hech kim serverni soxtalashtirmayotganiga ishonch hosil qiling, shundan keyingina eski yozuvni o'chiring.

**4. `~/.ssh` yoki `authorized_keys` ruxsatlari ochiq.**
Server kalitni rad etadi ("bad ownership or modes").
To'g'risi: `700` va `600`, egasi — foydalanuvchining o'zi.

**5. Chiqqan zahoti foydalanuvchini o'chirish.**
`userdel` "currently used by process" deydi.
To'g'risi: `UserStopDelaySec` (10 s) o'tishini kutish.

## Amaliyot

Trenajorda SSH yo'q, shuning uchun mashq yo'q. O'z VPS'ingiz bo'lsa, shu bobdagi tartibni takrorlang.

Savollar:

1. Serverga qaysi fayl qo'yiladi: `id_ed25519` mi yoki `id_ed25519.pub` mi?
2. Server kaliti qayerda saqlanadi va nima uchun kerak?
3. `Permission denied (publickey)` chiqdi. Sababni qayerdan qidirasiz?
4. `~/.ssh/config` dagi `IdentitiesOnly yes` nima qiladi?
5. Shaxsiy kalitni qanday qo'shimcha himoyalash mumkin?

<details>
<summary>Javoblar</summary>

1. `id_ed25519.pub` — ochiq kalit, serverdagi `~/.ssh/authorized_keys` ga.
2. Mijozdagi `~/.ssh/known_hosts` da. Keyingi ulanishlarda server o'sha ekanini tekshirish uchun.
3. Server logida: `journalctl -u ssh`. Mijoz tomonida — `ssh -v`.
4. Faqat sozlamada ko'rsatilgan kalitni ishlatadi, ssh-agent'dagi boshqa kalitlarni taklif qilmaydi.
5. Parol so'zi (passphrase) qo'yish: `ssh-keygen -p`; ssh-agent bilan uni har safar kiritmaslik mumkin.

</details>

## Rasmiy hujjat

- [Debian Reference 6.3](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_remote_access_server_and_utilities_ssh) — SSH asoslari, `authorized_keys`, `~/.ssh/config`, ssh-agent, muammolarni hal qilish
- [Ubuntu Server: OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/) — ed25519, `ssh-copy-id`, ruxsatlar
- [ssh(1)](https://man.openbsd.org/ssh) · [ssh-keygen(1)](https://man.openbsd.org/ssh-keygen) · [ssh-agent(1)](https://man.openbsd.org/ssh-agent) · [ssh-add(1)](https://man.openbsd.org/ssh-add)
- [ssh_config(5)](https://man.openbsd.org/ssh_config) — `StrictHostKeyChecking`, `IdentitiesOnly` · [sshd_config(5)](https://man.openbsd.org/sshd_config) — `StrictModes`
- [logind.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/logind.conf.html) — `UserStopDelaySec=`

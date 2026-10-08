# 30 — SSH kalit va credential'lar

[← Oldingi: `fetch` va `push` ichidan](29-fetch-push-ichidan.md) · [Mundarija](README.md) · [Keyingi: Branch bilan ishlash uslublari →](31-branch-workflowlari.md)

## Tushuncha

[29-bobda](29-fetch-push-ichidan.md) ko'rdik: tarmoq orqali `fetch`/`push` uchun Git ikki yo'ldan birini ishlatadi — **SSH** yoki **HTTPS**. Ikkalasida ham server "siz kimsiz?" deb so'raydi. Bu bob shu savolga qanday javob berilishi haqida.

**Autentifikatsiya** — server sizning shaxsingizni tekshirishi. Git'ning o'zi bu ishni qilmaydi, uni transportga topshiradi:

| Transport | Kim tekshiradi | Siz nima berasiz | Git'dagi mexanizm |
| --- | --- | --- | --- |
| SSH (`git@host:yo'l`) | `ssh` dasturi | **Kalit juftligi** — maxfiy kalit sizda, ommaviy kalit serverda | `core.sshCommand`, `~/.ssh/config` |
| HTTPS (`https://host/yo'l`) | Git'ning HTTP qismi | **Login va parol** (amalda — **token**) | **Credential helper**'lar |

**SSH kalit juftligi** — bir-biriga matematik bog'langan ikki fayl. **Ommaviy kalit** (`.pub`) qulfga o'xshaydi: uni istagan joyga — GitHub'ga, kompaniya serveriga — o'rnatish mumkin, undan nusxa olgan odam hech narsa yutmaydi. **Maxfiy kalit** — shu qulfni ochadigan yagona kalit, u faqat sizning kompyuteringizda turadi va hech qachon tarmoqqa chiqmaydi. Ulanishda server "shu qulfni och" degan sinov yuboradi, sizning `ssh` maxfiy kalit bilan javob beradi — parol uzatilmaydi.

**Credential** (hisob ma'lumoti) — HTTPS uchun login va parol (yoki token) juftligi. **Credential helper** — Git'dan alohida kichik dastur, u bu ma'lumotni eslab qoladi: xotirada bir necha daqiqa (`cache`), diskdagi faylda (`store`) yoki operatsion tizimning xavfsiz omborida (macOS Keychain, Windows Credential Manager, Linux libsecret).

**Token** (personal access token) — parol o'rnida ishlatiladigan, server yaratgan uzun tasodifiy satr. GitHub hujjati aytadi: Git uchun parol bilan autentifikatsiya **olib tashlangan**; HTTPS'da Git parol so'raganda token kiritiladi.

> **Bu bobdagi misollar haqida.** Hamma kalitlar faqat shu bob uchun yaratilgan **sinov kalitlari** — ular hech qayerda ishlatilmaydi. Hech qanday haqiqiy serverga (GitHub'ga ham) ulanilmadi: SSH transporti soxta `ssh` skripti bilan, HTTPS autentifikatsiyasi esa lokal kompyuterdagi kichik test serveri bilan ko'rsatilgan. Hostlar (`git.soxta.example`, `soxta-host.example`) va tokenlar (`soxta-token-...`) — o'ylab topilgan.

## Nega shunday: nega Git parolni o'zi saqlamaydi

Git paroldan foydalanadi, lekin uni saqlash ishini ataylab tashqariga chiqargan. Sabablari:

1. **Xavfsiz saqlash — operatsion tizimning ishi.** macOS Keychain, Windows Credential Manager, Linux libsecret — shifrlangan, tizim hisobi bilan qulflangan omborlar. Git o'z shifrlashini yozsa, ulardan yaxshiroq bo'lmasdi.
2. **Har xil muhit — har xil talab.** Noutbukda — Keychain; CI serverida — muhit o'zgaruvchisidagi token; jamoada — umumiy papkadagi fayl. Pro Git'dagi "o'z helper'ingizni yozish" misoli aynan shuni ko'rsatadi: helper — oddiy dastur, uni istalgan tilda yozish mumkin.
3. **Yangi autentifikatsiya usullari.** OAuth (brauzer orqali kirish), ikki bosqichli tekshiruv, muddati o'tadigan tokenlar — bularni Git yadrosini o'zgartirmay, yangi helper bilan qo'shish mumkin (Git Credential Manager, `git-credential-oauth`).

SSH'da esa Git umuman autentifikatsiyaga aralashmaydi: u shunchaki `ssh` dasturini ishga tushiradi va unga "serverda `git-upload-pack` ni ishga tushir" deydi. Kalitlar, agent, `known_hosts` — hammasi SSH'ning o'z dunyosi.

## Kod: SSH kalit yaratish

### Avval tekshiring

Pro Git maslahati — yangi kalit yaratishdan oldin borini tekshiring. Kalitlar odatda `~/.ssh` papkasida turadi:

```bash
$ ls ~/.ssh
```

`id_ed25519` va `id_ed25519.pub` (eski tizimlarda `id_rsa`/`id_rsa.pub`) juftligi bo'lsa — kalitingiz bor. `.pub` — ommaviy, kengaytmasizi — maxfiy.

### `ssh-keygen`

Bu bobda kalit sinov papkasiga `-f` bilan yaratiladi — sizning `~/.ssh` papkangizga hech narsa yozilmaydi. Haqiqiy kalit uchun `-f` ni tashlab ketsangiz, `ssh-keygen` joyni so'raydi va standart `~/.ssh/id_ed25519` ni taklif qiladi.

GitHub hujjati tavsiya qiladigan tur — **Ed25519**:

```bash
$ ssh-keygen -t ed25519 -C "ali@example.com" -f ./sinov_ed25519 -N ''
Generating public/private ed25519 key pair.
Your identification has been saved in ./sinov_ed25519
Your public key has been saved in ./sinov_ed25519.pub
The key fingerprint is:
SHA256:+eD57snPfOVWmAoip4fcoqxDLUnKA3brt6rV/Xq+xwg ali@example.com
The key's randomart image is:
+--[ED25519 256]--+
|                 |
|                 |
|                 |
|....     .       |
|+o.o.   S      o |
|.o+.o oEo+.   o o|
| .oo o B+.+. . o.|
|  oo .= += *. . o|
| .o+=o.++*O.+. . |
+----[SHA256]-----+
```

(Bu — sinov kaliti; barmoq izi va ommaviy kalit shu bob uchun yaratilgan va boshqa joyda ishlatilmaydi.)

| Opsiya | Ma'nosi |
| --- | --- |
| `-t ed25519` | Kalit turi. Ed25519 — qisqa, tez va zamonaviy |
| `-t rsa -b 4096` | GitHub'ning muqobil tavsiyasi — Ed25519'ni bilmaydigan eski tizimlar uchun |
| `-t ed25519-sk` | Apparat xavfsizlik kaliti (USB token) bilan bog'langan kalit; ishlamasa `ecdsa-sk` |
| `-C "..."` | Izoh — kalitni tanish uchun yorliq, odatda email. Xavfsizlikka ta'siri yo'q |
| `-f <fayl>` | Qayerga yozish |
| `-N '<parol>'` | Parol iborasi (*passphrase*); bu yerda bo'sh — faqat sinov uchun |

Ikki fayl paydo bo'ldi:

```bash
$ ls -l
-rw-------@ 1 ali   staff  411 Oct  8 12:33 sinov_ed25519
-rw-r--r--@ 1 ali   staff   97 Oct  8 12:33 sinov_ed25519.pub
```

Ruxsatlarga qarang: maxfiy kalit **faqat egasi uchun** (`-rw-------`, ya'ni `600`). Ommaviy kalit hamma o'qishi mumkin. Ruxsatlar kengroq bo'lsa, SSH vositalari bunday kalitni ishlatishdan bosh tortadi — sinov kalitining nusxasida:

```bash
$ cp sinov_ed25519 ochiq_nusxa && chmod 644 ochiq_nusxa
$ ssh-keygen -y -f ochiq_nusxa
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for 'ochiq_nusxa' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "ochiq_nusxa": bad permissions
```

Ommaviy kalit — bitta qator: tur, base64 ma'lumot va izoh. Aynan shu qatorni serverga (GitHub'da: Settings → SSH and GPG keys) qo'yasiz:

```bash
$ cat sinov_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIILmyeFDMY2rxc4tNsyuWO60obihyfSdyuhoiz1T9FWe ali@example.com
```

RSA kaliti ancha uzun — Pro Git'dagi misol ham RSA:

```bash
$ ssh-keygen -t rsa -b 4096 -C ali@example.com -f ./sinov_rsa -N '' -q
$ ssh-keygen -l -f sinov_rsa.pub
4096 SHA256:x3e5vrV2ReVwaWK+mqKiA2c6/Mhw5qM2IQLZYDksfDs ali@example.com (RSA)
$ cut -c1-60 sinov_rsa.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDv+QTXe1Y1jcWxpEEM/10Y
```

### Parol iborasi: maxfiy kalitni qulflash

Parolsiz maxfiy kalit — kim faylni ko'chirsa, o'sha siz bo'la oladi (noutbuk o'g'irlansa, zaxira nusxa sizib chiqsa). **Parol iborasi** maxfiy kalitni diskda shifrlaydi. Farqni fayl ichida ko'rish mumkin — sinov kalitlarining base64 qismini ochamiz:

```bash
$ ssh-keygen -t ed25519 -C "ali@example.com" -f ./parolli_ed25519 -N 'sinov-parol-123' -q
$ for f in sinov_ed25519 parolli_ed25519; do sed -n 2p $f | python3 -I -c "import sys,base64;d=base64.b64decode(sys.stdin.read().strip()+'==');print(d[:60])"; done
b'openssh-key-v1\x00\x00\x00\x00\x04none\x00\x00\x00\x04none\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x003\x00\x00\x00\x0bssh-e'
b'openssh-key-v1\x00\x00\x00\x00\naes256-ctr\x00\x00\x00\x06bcrypt\x00\x00\x00\x18\x00\x00\x00\x10 \xd5\x01\xd4\x9a'
```

Parolsizda — `none`/`none` (shifrlanmagan). Parollida — `aes256-ctr` (shifr) va `bcrypt` (paroldan kalit yasash funksiyasi; u ataylab sekin, parolni terib topishni qiyinlashtiradi).

> **Pro Git bilan farq.** Pro Git `ssh-keygen -o` ni tavsiya qiladi: "`-o` maxfiy kalitni terib topishga chidamliroq formatda saqlaydi". Bu eskirgan maslahat: OpenSSH'ning hozirgi versiyalari (sinovda OpenSSH 10.2) yangi `openssh-key-v1` formatini **standart** ishlatadi — yuqorida `-o` siz ham aynan shu format va `bcrypt` chiqdi. `-o` hozir ham qabul qilinadi (xato bermaydi), lekin `ssh-keygen` qo'llanmasidan olib tashlangan. Pro Git'dagi `id_dsa` (DSA) kalitlari ham eskirgan — sinovdagi OpenSSH ularni umuman yaratmaydi:
>
> ```bash
> $ ssh-keygen -t dsa -f ./dsa_sinov -N '' -q
> unknown key type dsa
> ```

Noto'g'ri parol bilan kalit ochilmaydi; to'g'ri parol bilan maxfiy kalitdan ommaviy kalitni qayta tiklash mumkin (`-y`), parolni almashtirish — `-p`:

```bash
$ ssh-keygen -y -f parolli_ed25519 -P 'noto-g-ri'
Load key "parolli_ed25519": incorrect passphrase supplied to decrypt private key
$ ssh-keygen -y -f parolli_ed25519 -P 'sinov-parol-123'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAxLueiEWguc1CnnMjsEQJlFAAUC1Lz9b82rJcLw+cUT ali@example.com
$ ssh-keygen -p -f parolli_ed25519 -P 'sinov-parol-123' -N 'yangi-sinov-parol'
Key has comment 'ali@example.com'
Your identification has been saved with the new passphrase.
```

(Parolni buyruq qatorida `-P`/`-N` bilan berish faqat sinov uchun — u shell tarixida qoladi. Haqiqiy kalitda bu opsiyalarsiz ishga tushiring, `ssh-keygen` parolni yashirin so'raydi.)

### Barmoq izi

**Barmoq izi** (fingerprint) — ommaviy kalitning qisqa xesh'i, kalitlarni ko'z bilan solishtirish uchun:

```bash
$ ssh-keygen -l -f sinov_ed25519.pub
256 SHA256:+eD57snPfOVWmAoip4fcoqxDLUnKA3brt6rV/Xq+xwg ali@example.com (ED25519)
$ ssh-keygen -l -E md5 -f sinov_ed25519.pub
256 MD5:11:e4:16:25:ac:1b:79:a5:ad:ba:83:96:c9:fe:d4:cc ali@example.com (ED25519)
```

Pro Git'dagi `d0:82:24:...` ko'rinishidagi barmoq izi — eski MD5 formati. Hozir standart — `SHA256:...`. GitHub sozlamalarida ham kalitlaringiz SHA256 barmoq izi bilan ko'rsatiladi — qaysi kalit qaysi kompyuterniki ekanini shu bilan aniqlaysiz.

## Kod: `ssh-agent` — parolni bir marta kiritish

Parolli kalit har ulanishda parol so'raydi — har `git fetch` da. **`ssh-agent`** — fonda ishlaydigan dastur, u ochilgan (parol bilan yechilgan) kalitni xotirada saqlaydi; `ssh` kalitni undan so'raydi. Maxfiy kalit agentdan tashqariga chiqmaydi: agent faqat "imzo qo'yib beradi".

Quyidagi tajriba sizning tizim agentingizga tegmasligi uchun **alohida, vaqtinchalik agent** bilan qilingan (`-a` — o'z socket fayli; oxirida o'chiriladi):

```bash
$ eval "$(ssh-agent -a agent.sock -s)"
Agent pid 29647
$ ssh-add -l
The agent has no identities.
$ ssh-add kalitlar/sinov_ed25519
Identity added: kalitlar/sinov_ed25519 (ali@example.com)
$ ssh-add -t 600 -c kalitlar/sinov_rsa
Identity added: kalitlar/sinov_rsa (ali@example.com)
Lifetime set to 00:10:00
The user must confirm each use of the key
$ ssh-add -l
256 SHA256:+eD57snPfOVWmAoip4fcoqxDLUnKA3brt6rV/Xq+xwg ali@example.com (ED25519)
4096 SHA256:x3e5vrV2ReVwaWK+mqKiA2c6/Mhw5qM2IQLZYDksfDs ali@example.com (RSA)
$ ssh-add -d kalitlar/sinov_ed25519
Identity removed: kalitlar/sinov_ed25519 ED25519 (ali@example.com)
$ ssh-add -D
All identities removed.
$ ssh-agent -k
unset SSH_AUTH_SOCK;
unset SSH_AGENT_PID;
echo Agent pid 29647 killed;
```

| Buyruq | Vazifa |
| --- | --- |
| `eval "$(ssh-agent -s)"` | Agentni ishga tushirish; `SSH_AUTH_SOCK` va `SSH_AGENT_PID` o'zgaruvchilarini o'rnatadi |
| `ssh-add <kalit>` | Kalitni agentga qo'shish (parolli bo'lsa — parol bir marta so'raladi) |
| `ssh-add -t <soniya>` | Ma'lum vaqtdan keyin avtomatik unutish |
| `ssh-add -c` | Har ishlatishda tasdiq so'rash |
| `ssh-add -l` / `-L` | Agentdagi kalitlar: barmoq izi / ommaviy kalit |
| `ssh-add -d <kalit>` / `-D` | Bittasini / hammasini olib tashlash |
| `ssh-agent -k` | Agentni to'xtatish |

`SSH_AUTH_SOCK` — `ssh` agentni qayerdan topishini bildiruvchi socket yo'li. Ko'p tizimlarda agent kirishda avtomatik ishga tushadi (macOS'da — tizimning o'zi), shuning uchun odatda faqat `ssh-add` kerak.

GitHub hujjati macOS uchun qo'shimcha tavsiya beradi — kalit parolini Keychain'da saqlash (bu bobda **sinab ko'rilmadi**, chunki foydalanuvchining Keychain'iga tegadi):

```text
Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

va `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`. Linux va Windows'da — oddiy `ssh-add ~/.ssh/id_ed25519`.

## Kod: `~/.ssh/config` — xostlar uchun sozlama

`~/.ssh/config` — SSH'ning o'z sozlama fayli. Git uchun eng ko'p kerak bo'ladigan ishi — **bir serverda ikki hisob** (masalan, shaxsiy va ish GitHub hisobi). SSH'da hamma bir xil `git@github.com` foydalanuvchisi bilan ulanadi — server sizni **kalitingizga qarab** taniydi. Demak, har hisobga alohida kalit va `ssh` qaysi kalitni berishini bilishi uchun alohida "taxallus" xost kerak.

Sinov fayli (`ssh -F` bilan beriladi — haqiqiy `~/.ssh/config` ga tegilmaydi):

```text
Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

Host github-ish
  HostName github.com
  User git
  IdentityFile ~/.ssh/ish_ed25519
  IdentitiesOnly yes
```

`ssh -G` sozlamani **ulanmasdan** hisoblab ko'rsatadi:

```bash
$ ssh -G -F ssh_config github-ish | grep -E '^(hostname|user|port|identityfile|identitiesonly|stricthostkeychecking|userknownhostsfile) '
user git
hostname github.com
port 22
identitiesonly yes
stricthostkeychecking ask
identityfile ~/.ssh/ish_ed25519
userknownhostsfile ~/.ssh/known_hosts ~/.ssh/known_hosts2
```

`github-ish` — haqiqiy xost emas, taxallus: `ssh` uni `github.com` ga aylantiradi, lekin boshqa kalitni oladi. `IdentitiesOnly yes` — agentdagi boshqa kalitlarni sinamasdan, faqat ko'rsatilganini ishlat (aks holda server birinchi mos kelgan kalitni — balki boshqa hisobnikini — qabul qilib qo'yadi). Endi ish repo'sida URL'ni taxallus bilan yozasiz:

```bash
$ git remote set-url origin https://github.com/ali/kutubxona.git
$ git remote -v
origin	https://github.com/ali/kutubxona.git (fetch)
origin	https://github.com/ali/kutubxona.git (push)
$ git remote set-url origin git@github-ish:ali/kutubxona.git
$ git remote -v
origin	git@github-ish:ali/kutubxona.git (fetch)
origin	git@github-ish:ali/kutubxona.git (push)
```

`set-url` bilan HTTPS'dan SSH'ga (yoki aksincha) o'tish — [27-bob](27-remote.md). Hamma GitHub manzillarini avtomatik SSH'ga burish — `url."git@github.com:".insteadOf "https://github.com/"` ([27-bob](27-remote.md)).

## Kod: `known_hosts` — serverni tanish

Autentifikatsiya ikki tomonlama: server sizni tekshiradi, siz esa serverni. Birinchi ulanishda `ssh` server kalitining barmoq izini ko'rsatib so'raydi. GitHub hujjatidagi namuna:

```text
The authenticity of host 'github.com (IP ADDRESS)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
```

Bu barmoq izini GitHub'ning rasmiy "GitHub's SSH key fingerprints" sahifasidagi qiymat bilan **solishtiring** va faqat mos kelsa `yes` deng. Shundan keyin server kaliti `~/.ssh/known_hosts` ga yoziladi va keyingi safar jim tekshiriladi. Kalit o'zgarsa, `ssh` ulanishni to'xtatib, katta ogohlantirish chiqaradi — bu "o'rtadagi odam" hujumi belgisi bo'lishi mumkin. [29-bobda](29-fetch-push-ichidan.md) aytilganidek, SSH orqali klon faqat noto'g'ri barmoq izini qabul qilsangiz xavfli.

`known_hosts` bilan ishlash (sinov fayli va soxta host kaliti bilan):

```bash
$ cut -c1-70 known_hosts_sinov
git.soxta.example ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBtotJ8sJMnRVCsm
$ ssh-keygen -l -f known_hosts_sinov
256 SHA256:oZCrkbUKoEveA6MR9TDAb94U2rUJmy7Kjcp4JNwcW3Y git.soxta.example (ED25519)
$ ssh-keygen -F git.soxta.example -f known_hosts_sinov
# Host git.soxta.example found: line 1
git.soxta.example ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBtotJ8sJMnRVCsmPbqTIKLSi3...
$ ssh-keygen -R git.soxta.example -f known_hosts_sinov
# Host git.soxta.example found: line 1
known_hosts_sinov updated.
Original contents retained as known_hosts_sinov.old
```

`-F` — xostni qidirish, `-R` — o'chirish (server kaliti **qonuniy** almashganini — masalan, server egasining rasmiy e'lonidan — aniq bilganingizda). Haqiqiy ulanishni tekshirish — GitHub hujjatidagi `ssh -T git@github.com`; muvaffaqiyatli bo'lsa: "Hi USERNAME! You've successfully authenticated, but GitHub does not provide shell access."

## Kod: Git `ssh` ni qanday chaqiradi

[29-bobda](29-fetch-push-ichidan.md) Pro Git'dan ko'rgan edik: `push` da Git `ssh -x git@server "git-receive-pack 'loyiha.git'"` kabi buyruqni ishga tushiradi. Buni haqiqiy serverga ulanmasdan ko'rish uchun `ssh` o'rniga **soxta skript** beramiz. Git'da buning uchun `GIT_SSH_COMMAND` muhit o'zgaruvchisi (yoki `core.sshCommand` sozlamasi) bor. Skript argumentlarini ko'rsatadi va buyruqni lokal "server" papkasida bajaradi:

```bash
$ cat soxta-ssh
#!/bin/sh
# O'quv maqsadida: ssh o'rniga. Argumentlarni ko'rsatadi va buyruqni lokal "server" papkasida bajaradi.
echo "soxta-ssh chaqirildi: $*" >&2
for a; do last=$a; done
cd "$(dirname "$0")/srv" || exit 1
cmd=$(printf '%s' "$last" | sed 's/^git-\([a-z-]*\)/git \1/')
exec sh -c "$cmd"
$ git remote add origin git@soxta-host.example:ali/kutubxona.git
$ GIT_SSH_COMMAND=/tmp/misol/30/soxta-ssh git push -u origin main
soxta-ssh chaqirildi: git@soxta-host.example git-receive-pack 'ali/kutubxona.git'
To soxta-host.example:ali/kutubxona.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

Git `ssh` ga ikkita narsa berdi: kimga ulanish (`git@soxta-host.example`) va u yerda nima ishga tushirish (`git-receive-pack 'ali/kutubxona.git'`). Qolgan hammasi — [29-bobdagi](29-fetch-push-ichidan.md) pkt-line suhbati — shu kanal orqali ketdi. Haqiqiy serverda `ssh` aynan shunday qiladi, faqat buyruq uzoq kompyuterda ishlaydi.

`core.sshCommand` bilan ham xuddi shu — repo darajasida doimiy:

```bash
$ git config core.sshCommand /tmp/misol/30/soxta-ssh
$ git ls-remote origin
soxta-ssh chaqirildi: git@soxta-host.example git-upload-pack 'ali/kutubxona.git'
3c8955c614a4425231ef8cd867c61e8aed0e2a74	HEAD
3c8955c614a4425231ef8cd867c61e8aed0e2a74	refs/heads/main
```

Ustunlik tartibi (`git` va `git config` hujjatlari): `GIT_SSH_COMMAND` > `core.sshCommand` > `GIT_SSH` > oddiy `ssh`. `GIT_SSH_COMMAND` shell orqali talqin qilinadi (argument qo'shish mumkin: `GIT_SSH_COMMAND='ssh -i ~/.ssh/ish_ed25519 -o IdentitiesOnly=yes'`), `GIT_SSH` esa faqat dastur yo'li. Hujjat baribir maslahat beradi: odatda bunday sozlamalarni `~/.ssh/config` da qilish osonroq.

### `ssh.variant` — qaysi opsiyalarni berish

Git dastur nomiga qarab uning "tilini" aniqlaydi: `ssh` — OpenSSH opsiyalari, `plink`/`putty`/`tortoiseplink` — PuTTY opsiyalari. Nom notanish bo'lsa (bizning `soxta-ssh`), hujjatga ko'ra Git avval uni `-G` bilan chaqirib ko'radi; ishlamasa — `simple` rejim: faqat xost va buyruq, boshqa hech narsa. Shuning uchun yuqoridagi chiqishlarda opsiya yo'q. Port berib ko'ramiz:

```bash
$ GIT_SSH_COMMAND=/tmp/misol/30/soxta-ssh git ls-remote ssh://git@soxta-host.example:2222/ali/kutubxona.git
fatal: ssh variant 'simple' does not support setting port
$ GIT_SSH_COMMAND=/tmp/misol/30/soxta-ssh git -c ssh.variant=ssh fetch origin
soxta-ssh chaqirildi: -o SendEnv=GIT_PROTOCOL git@soxta-host.example git-upload-pack 'ali/kutubxona.git'
```

OpenSSH rejimida Git `-o SendEnv=GIT_PROTOCOL` qo'shdi — protokolning 2-versiyasini so'rash uchun `GIT_PROTOCOL` o'zgaruvchisini serverga uzatish ([29-bob](29-fetch-push-ichidan.md); `gitprotocol-v2`: SSH'da server bu o'zgaruvchini qabul qilishga sozlangan bo'lishi kerak).

### `ssh://` va scp-shakli: yo'l farqi

```bash
$ GIT_SSH_COMMAND=/tmp/misol/30/soxta-ssh git -c ssh.variant=ssh ls-remote ssh://git@soxta-host.example:2222/ali/kutubxona.git
soxta-ssh chaqirildi: -o SendEnv=GIT_PROTOCOL -p 2222 git@soxta-host.example git-upload-pack '/ali/kutubxona.git'
fatal: '/ali/kutubxona.git' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

Ikki muhim farq:

- `ssh://` shaklida port berish mumkin (`-p 2222`), scp-shaklida (`host:yo'l`) — yo'q (port uchun `~/.ssh/config` dagi `Port`).
- `ssh://host/ali/...` da yo'l **absolyut** (`/ali/kutubxona.git` — server ildizidan), `host:ali/...` da esa **nisbiy** (`ali/kutubxona.git` — server foydalanuvchisining uy papkasidan). Bizning soxta serverda `/ali/...` yo'q, shuning uchun xato.

Oxirgi xato matni — SSH bilan bog'liq deyarli har qanday muammoda (kalit qabul qilinmadi, repo nomi xato, ruxsat yo'q) chiqadigan umumiy xabar. Sababini topish uchun: `ssh -T git@github.com` (kalit ishlayaptimi), `ssh -v ...` (batafsil jurnal) yoki `GIT_SSH_COMMAND='ssh -v' git fetch`.

## Kod: credential tizimi ichidan — `git credential`

HTTPS tomonga o'tamiz. Pro Git tizimning "kapoti ostini" `git credential` plumbing buyrug'i orqali ko'rsatadi. U standart kirishdan `kalit=qiymat` qatorlarini o'qiydi (bo'sh qator — tugadi) va natijani shu formatda chiqaradi. To'rt amal (v2.56 hujjati):

| Amal | Vazifa |
| --- | --- |
| `fill` | Login/parolni topish: config → helper'lar → foydalanuvchidan so'rash |
| `approve` | "Bu credential ishladi" — helper'larga saqlash uchun yuboriladi |
| `reject` | "Bu credential rad etildi" — helper'lar uni o'chiradi |
| `capability` | Qo'llab-quvvatlanadigan imkoniyatlar |

### Helper'siz: foydalanuvchidan so'rash

Helper sozlanmagan bo'lsa, `gitcredentials` hujjatiga ko'ra Git so'rash usulini shu tartibda tanlaydi: `GIT_ASKPASS` → `core.askPass` → `SSH_ASKPASS` → terminal. Terminalsiz ko'rsatish uchun `GIT_ASKPASS` ga soxta skript beramiz — u savolni ko'rsatib, soxta javob qaytaradi:

```bash
$ cat soxta-askpass
#!/bin/sh
# O'quv maqsadida: GIT_ASKPASS. Savolni ko'rsatadi va soxta javob qaytaradi.
echo "askpass so'radi: $1" >&2
case "$1" in
  Username*) echo ali ;;
  Password*) echo soxta-token-2 ;;
esac
$ printf 'protocol=https\nhost=git.soxta.example\npath=ali/kutubxona.git\n\n' | GIT_ASKPASS=./soxta-askpass git credential fill
askpass so'radi: Username for 'https://git.soxta.example': 
askpass so'radi: Password for 'https://ali@git.soxta.example': 
protocol=https
host=git.soxta.example
username=ali
password=soxta-token-2
```

Kirishda `path` bor edi, chiqishda — yo'q. Hujjat sababini aytadi: HTTP(S) uchun `credential.useHttpPath` o'chiq bo'lsa (standart), Git yo'lni olib tashlaydi — bitta xostdagi hamma repo'lar uchun bitta credential.

`url=` atributi URL'ni o'zi bo'laklarga ajratadi; URL'dagi foydalanuvchi nomi ham olinadi — shuning uchun login so'ralmadi:

```bash
$ printf 'url=https://vali@git.soxta.example/ali/kutubxona.git\n\n' | GIT_ASKPASS=./soxta-askpass git credential fill
askpass so'radi: Password for 'https://vali@git.soxta.example': 
protocol=https
host=git.soxta.example
username=vali
password=soxta-token-2
```

Skriptda so'rovni butunlay taqiqlash — `GIT_TERMINAL_PROMPT=0` (CI uchun muhim: osilib qolish o'rniga darhol xato):

```text
fatal: could not read Username for 'https://git.soxta.example': terminal prompts disabled
```

## Kod: `store` helper — diskdagi fayl

Bu bobdagi helper sinovlari Git'ning shu qo'llanma uchun ajratilgan HOME papkasida (`~` — o'sha papka) va `-c credential.helper=...` bilan bir martalik o'tkazildi.

```bash
$ printf 'protocol=https\nhost=git.soxta.example\nusername=ali\npassword=soxta-token-2\n\n' | git -c credential.helper=store credential approve
$ ls -l ~/.git-credentials
-rw-------@ 1 ali   staff  44 Oct  8 12:35 ~/.git-credentials
$ cat ~/.git-credentials
https://ali:soxta-token-2@git.soxta.example
```

Fayl formati (`git-credential-store` hujjati): har qatorda bitta "credential bilan bezatilgan" URL. Ruxsat `600` — boshqa foydalanuvchilar o'qiy olmaydi, lekin **shifrlanmagan**: faylni o'qiy olgan har qanday dastur (yoki zaxira nusxa) tokenni ko'radi. Hujjat buni "NOTE" bilan ochiq ogohlantiradi.

Endi `fill` so'ramasdan javob beradi:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.helper=store credential fill
protocol=https
host=git.soxta.example
username=ali
password=soxta-token-2
```

Moslik qoidasi: **protokol, xost va (agar ma'lum bo'lsa) foydalanuvchi nomi** mos kelishi kerak. Boshqa foydalanuvchi, boshqa xost yoki `http` (`https` emas) — mos kelmaydi:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\nusername=vali\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.helper=store credential fill
askpass so'radi: Password for 'https://vali@git.soxta.example': 
...
$ printf 'protocol=https\nhost=boshqa.soxta.example\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.helper=store credential fill
askpass so'radi: Username for 'https://boshqa.soxta.example': 
askpass so'radi: Password for 'https://ali@boshqa.soxta.example': 
...
$ printf 'protocol=http\nhost=git.soxta.example\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.helper=store credential fill
askpass so'radi: Username for 'http://git.soxta.example': 
askpass so'radi: Password for 'http://ali@git.soxta.example': 
...
```

Maxsus belgilar URL'da kodlanadi (`@` → `%40`, `:` → `%3a`, `/` → `%2f`) — shuning uchun hujjat faylni muharrirda tahrirlamaslikni aytadi:

```bash
$ printf 'protocol=https\nhost=git.soxta.example:8443\nusername=ali@ish\npassword=p@ss:w/rd\n\n' | git -c credential.helper=store credential approve
$ cat ~/.git-credentials
https://ali%40ish:p%40ss%3aw%2frd@git.soxta.example%3a8443
https://ali:soxta-token-2@git.soxta.example
```

`reject` mos yozuvni o'chiradi:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\nusername=ali\n\n' | git -c credential.helper=store credential reject
$ cat ~/.git-credentials
https://ali%40ish:p%40ss%3aw%2frd@git.soxta.example%3a8443
```

Fayl joyi: standart `~/.git-credentials`, keyin `$XDG_CONFIG_HOME/git/credentials` (`~/.config/git/credentials`) qidiriladi; boshqa joy — `store --file <yo'l>`. Hujjat maslahati: konfiguratsiyada `--file=~/...` emas, `--file ~/...` yozing — shunda shell `~` ni ochadi.

## Kod: `cache` helper — xotirada, vaqtincha

`cache` credential'ni diskka yozmaydi: u fonda `git credential-cache--daemon` jarayonini ishga tushirib, ma'lumotni uning xotirasida saqlaydi. Standart muddat — 900 soniya (15 daqiqa).

```bash
$ printf 'protocol=https\nhost=git.soxta.example\nusername=ali\npassword=soxta-token-1\n\n' | git -c credential.helper='cache --timeout=300' credential approve
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | git -c credential.helper=cache credential fill
protocol=https
host=git.soxta.example
username=ali
password=soxta-token-1
$ ls -la ~/.cache/git/credential
total 0
drwx------@ 3 ali   staff  96 Oct  8 12:35 .
drwxr-xr-x@ 3 ali   staff  96 Oct  8 12:35 ..
srwxr-xr-x@ 1 ali   staff   0 Oct  8 12:35 socket
```

Diskda faqat **socket** (`s` turi) — demon bilan aloqa nuqtasi; papka `drwx------`, ya'ni faqat egasi ulana oladi. Joyi: `$XDG_CACHE_HOME/git/credential/socket` (yoki `~/.git-credential-cache/` papkasi bo'lsa — o'sha yerda), `--socket <absolyut yo'l>` bilan o'zgartiriladi.

Unutish va to'xtatish:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | git -c credential.helper=cache credential reject
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | GIT_TERMINAL_PROMPT=0 git -c credential.helper=cache credential fill
fatal: could not read Username for 'https://git.soxta.example': terminal prompts disabled
$ git credential-cache exit
```

`exit` — demonni to'xtatadi va hamma narsani unutadi. Kompyuter qayta yuklanganda ham shunday bo'ladi. Hujjat ta'kidlaydi: `cache` **token uchun yaroqsiz** — tokenlar haftalab yashaydi, cache esa 15 daqiqada unutadi; har safar yangi token yaratmaslik uchun doimiy xavfsiz ombor yoki OAuth helper ishlating.

## Kod: haqiqiy HTTP so'rovda credential aylanishi

`git credential` qo'lda chaqirilganda faqat mexanizmni ko'rdik. Endi Git o'zi uni qanday ishlatishini ko'ramiz. Lokal kompyuterda (`127.0.0.1`) kichik test serveri ishga tushirildi: u har so'rovga `401 Unauthorized` qaytaradi va kelgan `Authorization` sarlavhasini jurnalga yozadi; faqat `togri-token` kelsa, bo'sh repo e'lonini qaytaradi.

**1-holat: saqlangan token eskirgan.** `store` faylida eski token bor:

```bash
$ cat http-store.txt
http://ali:eski-token@127.0.0.1%3a8731
$ GIT_ASKPASS=./soxta-askpass git -c credential.helper="store --file http-store.txt" ls-remote http://127.0.0.1:8731/ali/kutubxona.git
fatal: Authentication failed for 'http://127.0.0.1:8731/ali/kutubxona.git/'
$ cat http-store.txt
$
```

Server jurnali:

```text
so'rov: /ali/kutubxona.git/info/refs?service=git-upload-pack  Authorization: yo'q
so'rov: /ali/kutubxona.git/info/refs?service=git-upload-pack  Authorization: ali:eski-token
```

Ketma-ketlik (`git-credential` hujjatidagi "TYPICAL USE" bo'yicha):

1. Git avval credential'siz so'raydi → `401`.
2. `fill`: `store` helper `ali:eski-token` ni beradi (askpass chaqirilmadi).
3. Shu bilan qayta so'raydi → yana `401`.
4. `reject`: helper'lar yomon credential'ni o'chiradi — fayl bo'shab qoldi. Git qayta so'ramay, xato bilan to'xtaydi.

**2-holat: to'g'ri token.** Fayl bo'sh, askpass to'g'ri tokenni beradi:

```bash
$ GIT_ASKPASS=./togri-askpass git -c credential.helper="store --file http-store.txt" ls-remote http://127.0.0.1:8731/ali/kutubxona.git
askpass so'radi: Username for 'http://127.0.0.1:8731': 
askpass so'radi: Password for 'http://ali@127.0.0.1:8731': 
$ cat http-store.txt
http://ali:togri-token@127.0.0.1%3a8731
$ GIT_ASKPASS=./togri-askpass git -c credential.helper="store --file http-store.txt" ls-remote http://127.0.0.1:8731/ali/kutubxona.git
$ echo "exit=$?"
exit=0
```

Muvaffaqiyatdan keyin Git `approve` qildi — token faylga yozildi. Ikkinchi marta hech narsa so'ralmadi. Jurnalda har safar ikki so'rov: avval sarlavhasiz (`401`), keyin credential bilan. Bu yerda `http://` faqat lokal test uchun; tarmoqda token faqat `https://` orqali yuborilishi kerak — `Authorization: Basic` sarlavhasi shunchaki base64, shifr emas.

## Kod: helper'larni sozlash

### `credential.helper` qiymati qanday dasturga aylanadi

`gitcredentials` hujjatidagi uch qoida (Pro Git jadvalidagi bilan bir xil):

| Qiymat | Ishga tushadigan buyruq |
| --- | --- |
| `foo` | `git credential-foo <amal>` |
| `foo --opt=x` | `git credential-foo --opt=x <amal>` |
| `/absolyut/yol/foo -x` | `/absolyut/yol/foo -x <amal>` |
| `!f() { ...; }; f` | `!` dan keyingi shell kodi |

Helper'ga beriladigan amal nomlari `git credential` nikidan biroz farq qiladi: `get` (= `fill`), `store` (= `approve`), `erase` (= `reject`). Helper'ni to'g'ridan-to'g'ri ham chaqirish mumkin — Pro Git'dagi `git credential-store --file ~/git.store store` misoli.

Shell parchasi bilan "helper" — CI'da tokenni muhit o'zgaruvchisidan berish uchun qulay:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | git -c credential.helper='!f() { test "$1" = get && echo "password=snippet-token"; }; f' -c credential.username=ali credential fill
protocol=https
host=git.soxta.example
username=ali
password=snippet-token
```

(Haqiqiy CI'da `echo "password=$GIT_TOKEN"` kabi yoziladi.)

### Bir nechta helper

Pro Git va hujjat: helper'lar **tartib bilan** so'raladi; login va (muddati o'tmagan) parol topilgach to'xtaladi. Saqlash (`approve`) esa **hammasiga** yuboriladi:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\nusername=ali\npassword=soxta-token-3\n\n' | git -c credential.helper="store --file maxfiy.txt" -c credential.helper='cache --timeout=60' credential approve
$ cat maxfiy.txt
https://ali:soxta-token-3@git.soxta.example
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | git -c credential.helper=cache credential fill
protocol=https
host=git.soxta.example
username=ali
password=soxta-token-3
```

Bitta `approve` — ikkala omborda. Bo'sh qiymat (`credential.helper=`) ro'yxatni tozalaydi — global sozlamadagi helper'ni bitta repo'da o'chirish uchun:

```bash
$ printf 'protocol=https\nhost=git.soxta.example\n\n' | GIT_TERMINAL_PROMPT=0 git -c credential.helper=cache -c credential.helper= credential fill
fatal: could not read Username for 'https://git.soxta.example': terminal prompts disabled
```

`cache` da token bor edi, lekin undan keyingi bo'sh qiymat ro'yxatni bo'shatdi — hech kim so'ralmadi.

### Kontekst: `credential.<url>.*`

Sozlamani bitta xost (yoki yo'l prefiksi) uchun berish mumkin:

```bash
$ printf 'url=https://git.soxta.example/ali/kutubxona.git\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.https://git.soxta.example.username=bobur credential fill
askpass so'radi: Password for 'https://bobur@git.soxta.example': 
protocol=https
host=git.soxta.example
username=bobur
password=soxta-token-2
```

Moslik qoidalari (hujjat): protokol va xost **aynan** mos kelishi kerak — `https://example.com` sozlamasi `http://example.com` ga ham, `foo.example.com` ga ham tatbiq etilmaydi (xostda `*` ishlatish mumkin). Yo'l berilsa, u yo'l **bo'laklari** bo'yicha prefiks: `https://example.com/bar` `.../bar/baz.git` ga mos, `.../barry/repo.git` ga emas.

`useHttpPath=true` — har repo'ga alohida credential (masalan, har repo uchun alohida "deploy token"):

```bash
$ printf 'url=https://git.soxta.example/ali/kutubxona.git\nusername=ali\npassword=t-kutubxona\n\n' | git -c credential.helper="store --file yol.txt" -c credential.useHttpPath=true credential approve
$ cat yol.txt
https://ali:t-kutubxona@git.soxta.example/ali/kutubxona.git
$ printf 'url=https://git.soxta.example/ali/boshqa.git\n\n' | GIT_ASKPASS=./soxta-askpass git -c credential.helper="store --file yol.txt" -c credential.useHttpPath=true credential fill
askpass so'radi: Username for 'https://git.soxta.example/ali/boshqa.git': 
...
```

`kutubxona.git` uchun saqlangan token `boshqa.git` ga berilmadi.

### Tizim helper'lari

| Helper | Tizim | Qayerda saqlaydi |
| --- | --- | --- |
| `osxkeychain` | macOS | Keychain (shifrlangan) |
| `wincred` / Git Credential Manager | Windows | Windows Credential Store |
| `libsecret` | Linux | GNOME Keyring / KWallet |
| Git Credential Manager (GCM) | Hammasi | Tizim ombori + OAuth (brauzer orqali kirish) |
| `git-credential-oauth` | Hammasi | OAuth tokenlarini yaratadi |

macOS'da Git o'rnatilishi bilan `osxkeychain` ko'pincha allaqachon yoqilgan bo'ladi: sinov kompyuterida Homebrew Git'ining tizim fayli (`/opt/homebrew/etc/gitconfig`) va Apple Command Line Tools Git'ining tizim fayli ikkalasida ham `helper = osxkeychain` bor edi. Ya'ni siz hech narsa sozlamasangiz ham, HTTPS token'lari Keychain'ga tushadi. Qaysi helper'lar ishlayotganini va qaysi fayldan kelayotganini ko'rish:

```bash
$ git config --show-origin --get-all credential.helper
```

(Bu qo'llanmaning sinov muhitida tizim sozlamasi o'chirilgan — `GIT_CONFIG_NOSYSTEM=1` — shuning uchun natija bo'sh, chiqish kodi `1`.)

## Kod: URL ichidagi parol — qilmang

`https://ali:parol@host/...` ko'rinishidagi URL ishlaydi, lekin parol `.git/config` da ochiq turadi, buyruqlar orasida argument sifatida uzatiladi (jarayonlar ro'yxatida ko'rinishi mumkin) va zaxira nusxalarga tushadi. Git buni tutib olish uchun `transfer.credentialsInUrl` sozlamasini beradi (standart `allow`):

```bash
$ git -c transfer.credentialsInUrl=die ls-remote http://ali:parol@127.0.0.1:8739/x.git
fatal: URL 'http://ali:<redacted>@127.0.0.1:8739/x.git' uses plaintext credentials
$ git -c transfer.credentialsInUrl=warn ls-remote http://ali:parol@127.0.0.1:8739/x.git
warning: URL 'http://ali:<redacted>@127.0.0.1:8739/x.git' uses plaintext credentials
...
```

Hujjatdagi cheklov: tekshiruv faqat `remote.<nom>.url` uchun, `pushurl` uchun emas.

## Muhandislik nuqtai nazari: SSH yoki HTTPS

| | SSH | HTTPS + token |
| --- | --- | --- |
| Sozlash | Kalit yaratish, ommaviy kalitni serverga qo'yish | Token yaratish, helper |
| Firewall | 22-port ba'zan yopiq; GitHub muqobili — `ssh.github.com` xosti, 443-port | 443 deyarli doim ochiq |
| Huquqlarni cheklash | Kalit — hisobning to'liq huquqi (deploy key bundan mustasno) | Tokenni repo va amal bo'yicha cheklash mumkin, muddat qo'yiladi |
| Kompyuter yo'qolsa | Kalitni serverdan o'chirasiz | Tokenni bekor qilasiz |
| CI | Deploy key yoki SSH agent forwarding | Muhit o'zgaruvchisidagi token + shell helper |

Amaliy tavsiya: shaxsiy kompyuterda — parolli Ed25519 kalit + agent, yoki HTTPS + tizim helper'i (Keychain/GCM). Ikkalasi ham yaxshi; muhimi — bitta usulni ongli tanlash va parol/token'ni ochiq faylda saqlamaslik.

## Muhandislik nuqtai nazari: kalit va token gigiyenasi

- **Har kompyuterga alohida kalit.** Bitta kalitni hamma joyga ko'chirmang — bitta qurilma yo'qolsa, faqat uning kalitini bekor qilasiz. `-C` izohiga kompyuter nomini yozing.
- **Maxfiy kalitga parol qo'ying**, agent bilan esa uni kuniga bir marta kiritasiz.
- **Maxfiy kalit hech qachon** repo'ga, chat'ga, emailga tushmasin. Tushib qolsa — darhol yangi kalit, eskisini serverdan o'chirish. Repo tarixidan o'chirish yetarli emas ([25-bob](25-tarixni-qayta-yozish.md)): kim klon qilgan bo'lsa, unda qoldi.
- **`store` helper — faqat boshqa iloj bo'lmasa.** Hujjatning o'zi uni "tavsiya etilmaydi" (*discouraged*) deb belgilaydi. Tizim helper'i bor joyda o'shani ishlating.
- **Tokenga minimal huquq va muddat.** "Hamma repo, hamma huquq, muddatsiz" token — parolning eng yomon o'rinbosari.
- **Server kalit barmoq izini tekshiring.** Birinchi ulanishdagi `yes` — bu ishonch qarori.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Maxfiy kalitni (`id_ed25519`, `.pub` siz) serverga yoki GitHub'ga qo'yish | Kalit oshkor bo'ldi | Faqat `.pub` ni bering; oshkor bo'lgan kalitni almashtiring |
| Maxfiy kalit fayliga keng ruxsat (`644`) | `ssh` kalitni rad etadi ("UNPROTECTED PRIVATE KEY FILE") | `chmod 600 ~/.ssh/id_ed25519` |
| Parolsiz kalit noutbukda | Fayl ko'chirilsa — hisob ham ko'chadi | Parol iborasi + `ssh-agent` |
| Ikki GitHub hisobi uchun bitta xost yozuvi | Noto'g'ri hisob bilan autentifikatsiya, `Permission denied` | `~/.ssh/config` da taxallus xostlar + `IdentitiesOnly yes` |
| Barmoq izini tekshirmay `yes` deyish | O'rtadagi odam hujumi | Rasmiy barmoq izlari bilan solishtirish |
| HTTPS'da GitHub hisob parolini kiritish | Parol bilan Git autentifikatsiyasi olib tashlangan — rad | Personal access token yoki GCM/OAuth |
| `credential.helper store` ni o'ylamay yoqish | Token diskda ochiq matnda | `osxkeychain`/`wincred`/`libsecret`/GCM |
| Token'ni URL'ga yozish (`https://token@...`) | `.git/config` da, jarayonlar ro'yxatida ko'rinadi | Helper; `transfer.credentialsInUrl=die` |
| `ssh://host/yo'l` va `host:yo'l` ni bir xil deb o'ylash | Biri absolyut, biri nisbiy yo'l — "does not appear to be a git repository" | Server qaysi shaklni kutishini bilib yozing |
| Eskirgan token xatosidan keyin "Git parol so'ramayapti" deb hayron bo'lish | Helper eski tokenni berdi va `reject` qildi; keyingi safar so'raydi | Qayta urinib ko'ring yoki `git credential reject` bilan qo'lda o'chiring |
| Pro Git bo'yicha `ssh-keygen -o` va `id_dsa` qidirish | Eskirgan: yangi format standart, DSA qo'llab-quvvatlanmaydi | `ssh-keygen -t ed25519` |

## Amaliyot

1. Sinov papkasida `ssh-keygen -t ed25519 -f ./sinov -C "test"` bilan parolli kalit yarating. `ls -l` ruxsatlarini, `.pub` faylini va `ssh-keygen -l` barmoq izini ko'ring. Ruxsatni `644` qilib, `ssh-keygen -y -f ./sinov` nima deyishini tekshiring.
2. Parolsiz va parolli kalitlarning base64 qismini Python bilan ochib, shifr nomlarini solishtiring. Keyin `ssh-keygen -p` bilan parolni almashtiring.
3. `ssh-agent -a ./agent.sock` bilan alohida agent ishga tushiring, kalitni `-t 60` bilan qo'shing va bir daqiqadan keyin `ssh-add -l` ni qayta ishlating. Oxirida `ssh-agent -k`.
4. Ikki taxallus xostli sinov `ssh_config` yozing va `ssh -G -F ./ssh_config <taxallus>` bilan `hostname`, `identityfile`, `port` ni tekshiring.
5. Bu bobdagi `soxta-ssh` skriptini yozib, lokal bare repo'ga `GIT_SSH_COMMAND` orqali push qiling. `ssh.variant=ssh` bilan va siz, `ssh://` va scp-shakli bilan Git qanday argumentlar berishini solishtiring.
6. `git credential fill` ni `GIT_ASKPASS` skripti bilan ishlating. Keyin `store --file ./sinov.txt` bilan `approve`, `fill`, `reject` qiling va har qadamdan keyin faylni ko'ring. Parolda `@` va `:` bo'lsa, fayl qanday ko'rinadi?
7. `cache --timeout=30` bilan credential saqlang, 30 soniyadan keyin `fill` qiling. `git credential-cache exit` dan keyin socket fayli qolganmi?
8. (Qiyinroq) Faqat `get` ga javob beradigan o'z helper'ingizni yozing (`git-credential-faqat-oqish` nomli skript, `PATH` da): u `--file` dagi `store` formatidagi fayldan protokol/xost/foydalanuvchi bo'yicha mos qatorni topsin, `store` va `erase` ni jimgina e'tiborsiz qoldirsin. `git config credential.helper 'faqat-oqish --file ./umumiy.txt'` bilan ulab, `git credential fill` bilan sinang.

## Rasmiy hujjat

- Pro Git — Generating Your SSH Public Key: <https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key>
- Pro Git — Credential Storage: <https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage>
- `gitcredentials`: <https://git-scm.com/docs/gitcredentials>
- `git credential`: <https://git-scm.com/docs/git-credential>
- `git credential-store`: <https://git-scm.com/docs/git-credential-store>
- `git credential-cache`: <https://git-scm.com/docs/git-credential-cache>
- `git` — `GIT_SSH`, `GIT_SSH_COMMAND`, `GIT_ASKPASS`, `GIT_TERMINAL_PROMPT`: <https://git-scm.com/docs/git>
- `git config` — `core.sshCommand`, `ssh.variant`, `transfer.credentialsInUrl`: <https://git-scm.com/docs/git-config>
- GitHub — Generating a new SSH key and adding it to the ssh-agent: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent>
- GitHub — Testing your SSH connection: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection>
- GitHub — SSH key fingerprints: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints>
- GitHub — About remote repositories (HTTPS va token): <https://docs.github.com/en/get-started/git-basics/about-remote-repositories>

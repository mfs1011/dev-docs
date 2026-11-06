// Linux trenajori mashqlari. Har mashq VM ichida /tmp/mashq/<id> papkasini (tmpfs — haqiqiy fayl tizimi) noldan yaratadi, `setup` (bash) shu papkada
// ishlaydi, so'ng o'quvchi qadamma-qadam boradi. Qadam bajarilgani ikki yo'l bilan aniqlanadi:
//   check — bash shart: har prompt oldidan (PROMPT_COMMAND) haqiqiy tizim holatidan tekshiriladi; $MASHQ — mashq papkasi
//   ran   — yozilgan buyruq shu regex'ga mos kelsa (holatni o'zgartirmaydigan buyruqlar: cat, uname, type ...)
// Hammasi linux-trenajor/test/mashqlar.mjs da brauzerda, haqiqiy VM'da tekshiriladi (`sinov` — testda yoziladigan buyruqlar,
// berilmasa `cmd`).

// 21-bob logi: srand(7) — har safar bir xil (bob matnidagi sonlar shu logdan)
const LOG_21 = String.raw`BEGIN { srand(7); split("10.0.0.5 10.0.0.7 10.0.0.12 192.168.1.20 192.168.1.33 172.16.0.4", ip, " "); split("/ /api/users /api/orders /api/products /static/app.js /static/app.css", p, " "); for (t = 0; t < 1800; t++) { m = int(t / 60); s = t % 60; a = ip[int(rand() * 6) + 1]; u = p[int(rand() * 6) + 1]; c = 200; if (rand() < 0.03) c = 404; if (m >= 20 && m < 23 && u == "/api/orders" && rand() < 0.7) c = 500; printf "%s - - [06/Nov/2026:10:%02d:%02d +0000] \"GET %s HTTP/1.1\" %d %d\n", a, m, s, u, c, int(rand() * 5000) + 100; if (m >= 12 && m < 14 && s % 2 == 0) printf "203.0.113.9 - - [06/Nov/2026:10:%02d:%02d +0000] \"POST /api/login HTTP/1.1\" 401 64\n", m, s } }`

export const LINUX_MASHQLAR = [
  {
    id: '01-tizimni-tanish',
    title: 'Notanish serverni tanib olish',
    bob: '/linux/01-linux-debian-ubuntu',
    intro: 'Notanish serverga kirdingiz. Avval bu qaysi distributiv, qaysi versiya va qaysi yadro ekanini aniqlang.',
    steps: [
      {
        cmd: 'cat /etc/os-release',
        text: 'Distributiv va versiyani ko‘ring.',
        ran: /^cat\s+\/etc\/os-release\b/,
        natija: '`ID=debian`, `VERSION_ID="12"`, kod nomi `bookworm`. Bu fayl Debian’da ham, Ubuntu’da ham bir xil formatda.',
      },
      {
        cmd: 'uname -r',
        text: 'Yadro versiyasini aniqlang.',
        ran: /^uname\s+(-\w*r\w*|--kernel-release)\b/,
        natija: '`6.1.0-50-686` — Linux 6.1 yadrosi. Distributiv versiyasi (12) bilan aralashtirmang: bu boshqa narsa.',
      },
      {
        cmd: 'uname -m',
        text: 'Protsessor arxitekturasini aniqlang.',
        ran: /^uname\s+(-\w*m\w*|--machine)\b/,
        natija: '`i686` — 32-bitli x86. Sinov VPS’ida bu `x86_64` (64-bitli).',
      },
      {
        cmd: 'cat /etc/os-release > tizim.txt',
        text: 'Natijani faylga saqlang. `>` buyruq chiqishini ekranga emas, faylga yozadi (11-bob).',
        check: 'grep -q "^VERSION_CODENAME=bookworm" "$MASHQ/tizim.txt"',
        natija: 'Mashq papkasida `tizim.txt` paydo bo‘ldi. `cat tizim.txt` bilan ichini ko‘ring.',
      },
      {
        cmd: 'neofetch',
        text: 'Tizim haqidagi asosiy ma’lumotni bitta ekranda ko‘ring.',
        ran: /^neofetch\b/,
        natija: 'neofetch distributiv, yadro, xotira va boshqalarni bir joyda chiqaradi. Debian 13 da shunga o‘xshash `fastfetch` paketi ham bor.',
      },
    ],
  },
  {
    id: '02-buyruq-tuzilishi',
    title: 'Buyruq, opsiya va argument',
    bob: '/linux/02-terminal-va-qobiq',
    intro: 'Mashq papkasida ikkita fayl bor: `eski.txt` va nomi `-r` bo‘lgan fayl. Opsiyalar, qo‘shtirnoq va `--` bilan ishlashni mashq qilasiz.',
    setup: 'touch -- -r eski.txt',
    steps: [
      {
        cmd: 'whoami',
        text: 'Kim bo‘lib ishlayotganingizni tekshiring.',
        ran: /^whoami\b/,
        natija: '`root`. Trenajorda siz root’siz, shuning uchun prompt `#` bilan tugaydi.',
      },
      {
        cmd: 'ls -lh /usr/bin/bash',
        text: 'Bash dasturi faylining hajmini odam o‘qiydigan ko‘rinishda chiqaring: `-l` va `-h` opsiyalarini birlashtiring.',
        ran: /^ls(?=.*\s-\w*l)(?=.*\s(-\w*h|--human-readable))/,
        natija: '`1.4M`. `-lh` = `-l -h` = `-l --human-readable`.',
      },
      {
        cmd: 'rm -- -r',
        text: '`-r` nomli faylni o‘chiring. `eski.txt` qolsin.',
        check: '[ ! -e "$MASHQ/-r" ] && [ -e "$MASHQ/eski.txt" ]',
        natija: '`--` dan keyingi `-r` opsiya emas, fayl nomi deb tushunildi. `rm ./-r` ham shunday ishlaydi.',
      },
      {
        cmd: 'mkdir "mening papkam"',
        text: 'Nomida probel bor bitta papka yarating: `mening papkam`. Agar qo‘shtirnoqsiz yozib, ikkita papka yaratib qo‘ysangiz, ularni `rmdir mening papkam` bilan o‘chiring.',
        check: '[ -d "$MASHQ/mening papkam" ] && [ ! -e "$MASHQ/mening" ] && [ ! -e "$MASHQ/papkam" ]',
        natija: 'Qo‘shtirnoq probelli nomni bitta argument qildi. `ls` uni `\'mening papkam\'` deb ko‘rsatadi.',
      },
      {
        cmd: 'type cd',
        text: '`cd` alohida dasturmi yoki qobiqning (shell) ichki buyrug‘imi?',
        ran: /^type\s+(-\w+\s+)*cd\b/,
        natija: '`cd is a shell builtin` — ichki buyruq: u qobiqning (shell) o‘z joriy papkasini o‘zgartiradi.',
      },
      {
        cmd: 'echo $?',
        text: 'Mavjud bo‘lmagan buyruq yozing (masalan, `salom`), so‘ng uning chiqish kodini ko‘ring.',
        sinov: ['salom', 'echo $?'],
        ran: /^echo\s+"?\$\?"?\s*$/,
        natija: '`127` — buyruq topilmadi. Muvaffaqiyatli buyruqdan keyin `0` chiqadi.',
      },
    ],
  },
  {
    id: '03-yordam',
    title: 'Kerakli buyruqni o‘zingiz toping',
    bob: '/linux/03-yordam',
    intro: 'Hech narsani yodlamasdan, javobni tizimning o‘z qo‘llanmasidan topasiz: `whatis`, `man`, `apropos`, `help`.',
    steps: [
      {
        cmd: 'whatis passwd',
        text: '`passwd` nomi qo‘llanmaning qaysi bo‘limlarida bor?',
        ran: /^(whatis|man\s+-f)\s+passwd\b/,
        natija: 'Ikki bo‘limda: `passwd (1)` — parolni o‘zgartiradigan buyruq, `passwd (5)` — `/etc/passwd` fayli formati.',
      },
      {
        cmd: 'man 5 passwd',
        text: '`/etc/passwd` fayli formatini oching. O‘qib bo‘lgach, `q` bilan chiqing.',
        ran: /^man\s+(5\s+passwd|passwd\.5|'passwd\(5\)')/,
        sinov: ['man 5 passwd', 'q'],
        natija: 'Bo‘lim raqami sahifani aniq tanlaydi. Hujjatlarda bu `passwd(5)` deb yoziladi.',
      },
      {
        cmd: 'apropos -a add user',
        text: 'Foydalanuvchi qo‘shadigan buyruqni toping. Ikkala so‘z ham uchrashi uchun `-a` ni ishlating.',
        ran: /^(apropos|man\s+-k)\b.*\buser/,
        natija: '`adduser (8)` va `useradd (8)`. 8-bo‘lim — administrator buyruqlari (22-bob).',
      },
      {
        cmd: 'help -d cd',
        text: '`cd` ga `man` sahifasi yo‘q. Uning tavsifini qobiqning (shell) o‘zidan oling.',
        ran: /^help\b.*\bcd\b/,
        natija: '`cd` — bash’ning ichki buyrug‘i, shuning uchun `help` ishlatiladi. `man cd` → `No manual entry for cd`.',
      },
      {
        cmd: 'ls -lS /usr/bin > katta.txt',
        text: '`man ls` dan fayllarni hajm bo‘yicha saralaydigan opsiyani toping (`/size` bilan qidiring). So‘ng `/usr/bin` ro‘yxatini shu tartibda `katta.txt` ga yozing.',
        check: '[ -s "$MASHQ/katta.txt" ] && head -2 "$MASHQ/katta.txt" | grep -q "^-" && awk \'NR > 1 { print $5 }\' "$MASHQ/katta.txt" | sort -c -n -r',
        natija: '`-S` — eng kattasi birinchi. `head katta.txt` bilan eng katta fayllarni ko‘ring.',
      },
    ],
  },
  {
    id: '04-katalog-daraxti',
    title: 'Ilovaga joy tayyorlash',
    bob: '/linux/04-katalog-daraxti',
    intro: 'Serverga `ilova` nomli dastur qo‘yiladi. Avval daraxt bo‘ylab yurib, standart papkalarni ko‘rasiz, so‘ng ilovaning kodi, sozlamasi, ma’lumoti va logi uchun joy tayyorlaysiz.',
    setup: 'rm -rf /opt/ilova /etc/ilova /var/lib/ilova /var/log/ilova',
    steps: [
      {
        cmd: 'ls -l /',
        text: 'Ildiz papkani batafsil ko‘ring. Qaysilari havola (`->`)?',
        ran: /^ls\s+(-\w*l\w*\s+)+\/\s*$/,
        natija: '`bin`, `lib`, `sbin` — `usr/...` ga havola (merged-/usr). Qolganlari oddiy papka.',
      },
      {
        cmd: 'command -v systemctl',
        text: '`systemctl` dasturi qaysi papkada turibdi?',
        ran: /^(command\s+-v|type(\s+-\w+)*|which)\s+.*\bsystemctl\b/,
        natija: '`/usr/bin/systemctl` — paketlardan kelgan buyruqlar `/usr/bin` da.',
      },
      {
        cmd: 'mkdir -p /opt/ilova /etc/ilova /var/lib/ilova /var/log/ilova',
        text: 'Ilova uchun to‘rt papka yarating: kod (`/opt`), sozlama (`/etc`), doimiy ma’lumot (`/var/lib`) va log (`/var/log`). `mkdir -p` bir nechta papkani bir yo‘la yaratadi (5-bob).',
        check: 'for d in /opt/ilova /etc/ilova /var/lib/ilova /var/log/ilova; do [ -d "$d" ] || exit 1; done',
        natija: 'Har tur fayl o‘z joyida: kod yangilansa ham `/var/lib/ilova` dagi ma’lumot va `/etc/ilova` dagi sozlama tegilmaydi.',
      },
      {
        cmd: 'echo "PORT=8080" > /etc/ilova/ilova.conf',
        text: 'Sozlama faylini yarating: `PORT=8080` qatorini `/etc/ilova/ilova.conf` ga yozing.',
        check: 'grep -qx "PORT=8080" /etc/ilova/ilova.conf',
        natija: 'Sozlama `/etc` da: administrator uni shu yerdan qidiradi, zaxira nusxa olganda ham `/etc` saqlanadi.',
      },
      {
        cmd: 'ls -d /etc/ilova /opt/ilova /var/lib/ilova /var/log/ilova',
        text: 'Yaratilgan papkalarni bir buyruq bilan tekshiring.',
        ran: /^ls\b.*\/etc\/ilova/,
        natija: '`-d` papkaning ichini emas, o‘zini ko‘rsatadi. Keyingi boblarda shu ilova uchun egasi va ruxsatlarni sozlaysiz (7-bob).',
      },
    ],
  },
  {
    id: '05-fayllar',
    title: 'Loyiha papkasini tartibga solish',
    bob: '/linux/05-fayllar',
    intro: 'Mashq papkasida `config.yml` va eski loglar turgan `eski/` papkasi bor. Ularni tartibga solasiz: yangi papkalar, zaxira nusxa, nomini o‘zgartirish va xavfsiz o‘chirish.',
    setup: 'mkdir eski && touch eski/a.log eski/b.log eski/c.log && echo "port: 8080" > config.yml',
    steps: [
      {
        cmd: 'pwd',
        text: 'Avval qayerda turganingizni tekshiring.',
        ran: /^pwd\b/,
        natija: '`/tmp/mashq/05-fayllar` — mutlaq yo‘l: `/` dan boshlanadi.',
      },
      {
        cmd: 'mkdir -p src/lib',
        text: 'Ichma-ich `src/lib` papkasini bitta buyruq bilan yarating.',
        check: '[ -d "$MASHQ/src/lib" ]',
        natija: '`-p` yetishmayotgan `src` ni ham yaratdi.',
      },
      {
        cmd: 'cp -a config.yml config.yml.bak',
        text: '`config.yml` ning aynan nusxasini (ruxsat va vaqtlari bilan) `config.yml.bak` nomi bilan oling.',
        check: '[ -f "$MASHQ/config.yml.bak" ] && cmp -s "$MASHQ/config.yml" "$MASHQ/config.yml.bak"',
        natija: '`-a` faylning ruxsati va vaqtini ham saqlaydi. Zaxira nusxa uchun shu kerak.',
      },
      {
        cmd: 'mv eski arxiv',
        text: '`eski` papkasining nomini `arxiv` ga o‘zgartiring.',
        check: '[ -d "$MASHQ/arxiv" ] && [ ! -e "$MASHQ/eski" ] && [ -f "$MASHQ/arxiv/a.log" ]',
        natija: 'Papka ichidagilari bilan ko‘chdi. `mv` papka uchun `-r` talab qilmaydi.',
      },
      {
        cmd: 'rm -r arxiv',
        text: '`arxiv` ni o‘chiring. Avval `rmdir arxiv` bilan urinib ko‘ring: nega o‘chmaydi?',
        check: '[ ! -e "$MASHQ/arxiv" ] && [ -f "$MASHQ/config.yml" ] && [ -d "$MASHQ/src/lib" ]',
        natija: '`rmdir` faqat bo‘sh papkani o‘chiradi. `rm -r` esa ichidagilari bilan, so‘ramasdan o‘chiradi. Savat yo‘q: ish shu bilan tugadi.',
      },
    ],
  },
  {
    id: '06-havolalar',
    title: 'Havolalar bilan versiya almashtirish',
    bob: '/linux/06-inode-va-havolalar',
    intro: 'Mashq papkasida ilovaning ikki versiyasi (`releases/v1`, `releases/v2`), ishlab turganini ko‘rsatuvchi `current` havolasi va `data.txt` bor.',
    setup: 'mkdir -p releases/v1 releases/v2 && echo v1 > releases/v1/version && echo v2 > releases/v2/version && ln -s releases/v1 current && echo muhim > data.txt',
    steps: [
      {
        cmd: 'ls -l current',
        text: '`current` qaysi versiyaga ishora qilyapti?',
        ran: /^ls\b.*\bcurrent\b/,
        natija: '`current -> releases/v1`. Boshidagi `l` — bu symlink.',
      },
      {
        cmd: 'ln data.txt data-zaxira.txt',
        text: '`data.txt` ga ikkinchi nom (hard link) bering: `data-zaxira.txt`. Keyin `ls -li` bilan inode raqamlarini solishtiring.',
        check: '[ "$(stat -c %i "$MASHQ/data.txt")" = "$(stat -c %i "$MASHQ/data-zaxira.txt")" ]',
        natija: 'Ikkala nom bitta inode’ga ishora qiladi, havolalar soni `2`.',
      },
      {
        cmd: 'rm data.txt',
        text: '`data.txt` ni o‘chiring. Ma’lumot yo‘qoldimi?',
        check: '[ ! -e "$MASHQ/data.txt" ] && grep -qx muhim "$MASHQ/data-zaxira.txt" && [ "$(stat -c %h "$MASHQ/data-zaxira.txt")" = 1 ]',
        natija: 'Yo‘q: `rm` faqat nomni o‘chirdi. Ma’lumot `data-zaxira.txt` orqali turibdi, havolalar soni `1`.',
      },
      {
        cmd: 'ln -sfn releases/v2 current',
        text: '`current` ni `releases/v2` ga almashtiring. `-n` ni unutsangiz, havola versiya papkasining ichida paydo bo‘ladi: uni o‘chirib, qayta urinib ko‘ring.',
        check: '[ "$(readlink "$MASHQ/current")" = releases/v2 ] && [ ! -L "$MASHQ/releases/v1/v2" ] && [ ! -L "$MASHQ/releases/v2/v1" ]',
        natija: '`-f` eskisini almashtirdi, `-n` esa `current` ni papka deb emas, havolaning o‘zi deb ko‘rdi.',
      },
      {
        cmd: 'cat current/version',
        text: 'Endi qaysi versiya ishlayapti?',
        ran: /^cat\s+(\.\/)?current\/version\b/,
        natija: '`v2`. Deploy’da versiya shunday almashtiriladi: fayllar ko‘chirilmaydi, faqat havola o‘zgaradi.',
      },
    ],
  },
  {
    id: '07-ruxsatlar',
    title: 'Ilova fayllariga to‘g‘ri ruxsat',
    bob: '/linux/07-ruxsatlar',
    intro: 'Mashq papkasida ilova fayllari bor: `.env` (maxfiy kalit), `conf/app.conf` (sozlama) va `start.sh` (ishga tushirish skripti). Hammasi `umask 022` bilan yaratilgan, ya’ni hamma o‘qiy oladi. Ruxsatlarni to‘g‘rilang.',
    setup: 'getent group ilova >/dev/null || groupadd ilova\nmkdir conf && echo "DB=ilova" > conf/app.conf && echo "SECRET=abc123" > .env && echo "echo ishladi" > start.sh && chmod 644 .env conf/app.conf start.sh',
    steps: [
      {
        cmd: 'ls -la',
        text: 'Fayllar va ularning ruxsatlarini ko‘ring (`-a` — `.env` ham ko‘rinsin).',
        ran: /^ls\s+(-\w*a\w*|-\w*l\w*\s+-\w*a\w*)/,
        natija: 'Hammasi `-rw-r--r--` (644): `.env` ni ham istalgan foydalanuvchi o‘qiy oladi.',
      },
      {
        cmd: 'chmod 600 .env',
        text: '`.env` ni faqat egasi o‘qiydigan va yozadigan qiling.',
        check: '[ "$(stat -c %a "$MASHQ/.env")" = 600 ]',
        natija: '`rw-------`: guruh ham, boshqalar ham kira olmaydi.',
      },
      {
        cmd: 'chgrp ilova conf/app.conf && chmod 640 conf/app.conf',
        text: 'Sozlamani `ilova` guruhiga bering: egasi yozadi, guruh o‘qiydi, boshqalar hech narsa qila olmaydi.',
        check: '[ "$(stat -c "%G %a" "$MASHQ/conf/app.conf")" = "ilova 640" ]',
        natija: '`-rw-r----- root ilova`: servisni `ilova` guruhiga qo‘shsangiz, u sozlamani o‘qiydi, boshqalar esa o‘qiy olmaydi.',
      },
      {
        cmd: 'chmod u+x start.sh',
        text: '`start.sh` ni egasi ishga tushira oladigan qiling.',
        check: '[ "$(stat -c %a "$MASHQ/start.sh")" = 744 ]',
        natija: '`rwxr--r--` (744). `chmod 744 start.sh` ham shu natijani beradi.',
      },
      {
        cmd: './start.sh',
        text: 'Skriptni ishga tushiring.',
        ran: /^(\.\/start\.sh|.*\/start\.sh)\b/,
        natija: '`ishladi`. `x` huquqisiz bu `Permission denied` bilan tugardi.',
      },
    ],
  },
  {
    id: '08-maxsus-bitlar',
    title: 'Jamoa papkasi',
    bob: '/linux/08-maxsus-bitlar-va-acl',
    intro: '`ali` va `vali` — `jamoa` guruhi a’zolari. Ular uchun umumiy deploy papkasi va hammaga ochiq yuklash papkasi qurasiz, `token.txt` ni esa faqat `vali` ga ochasiz.',
    setup: 'for u in ali vali; do id $u >/dev/null 2>&1 || useradd -m $u; done\ngetent group jamoa >/dev/null || groupadd jamoa\nusermod -aG jamoa ali && usermod -aG jamoa vali\necho token > token.txt && chmod 600 token.txt',
    steps: [
      {
        cmd: 'mkdir deploy && chgrp jamoa deploy && chmod 2775 deploy',
        text: '`deploy` papkasini yarating, uni `jamoa` guruhiga bering va setgid qo‘ying (`2775`).',
        check: '[ "$(stat -c "%G %a" "$MASHQ/deploy")" = "jamoa 2775" ]',
        natija: '`drwxrwsr-x`: guruhning `x` o‘rnidagi `s` — setgid.',
      },
      {
        cmd: 'runuser -u ali -- touch deploy/app.js',
        text: '`ali` nomidan `deploy` ichida fayl yarating va uning guruhini tekshiring.',
        check: '[ "$(stat -c %G "$MASHQ/deploy/app.js")" = jamoa ]',
        natija: 'Fayl `ali` ning shaxsiy guruhida emas, papkaning `jamoa` guruhida yaratildi.',
      },
      {
        cmd: 'mkdir yuklash && chmod 1777 yuklash',
        text: 'Hamma yoza oladigan, lekin har kim faqat o‘z faylini o‘chira oladigan `yuklash` papkasini yarating.',
        check: '[ "$(stat -c %a "$MASHQ/yuklash")" = 1777 ]',
        natija: '`drwxrwxrwt`: oxiridagi `t` — sticky bit, xuddi `/tmp` dagi kabi.',
      },
      {
        cmd: 'setfacl -m u:vali:r token.txt',
        text: '`token.txt` (600) ni guruhni o‘zgartirmasdan faqat `vali` ga o‘qishga oching.',
        check: 'getfacl -c "$MASHQ/token.txt" 2>/dev/null | grep -qx "user:vali:r--" && runuser -u vali -- cat "$MASHQ/token.txt" && ! runuser -u ali -- cat "$MASHQ/token.txt"',
        natija: '`vali` o‘qiydi, `ali` esa yo‘q. `ls -l` da `+` belgisi paydo bo‘ldi.',
      },
      {
        cmd: 'getfacl token.txt',
        text: 'Fayldagi ACL yozuvlarini ko‘ring.',
        ran: /^getfacl\b.*token\.txt/,
        natija: '`user:vali:r--` va `mask::r--`. ACL bor faylda ruxsatni `chmod` emas, `setfacl` bilan o‘zgartiring: `chmod` mask’ni o‘zgartiradi.',
      },
    ],
  },
  {
    id: '09-maxsus-fayllar',
    title: 'Maxsus fayllar bilan tanishuv',
    bob: '/linux/09-hamma-narsa-fayl',
    intro: 'Yadro ma’lumotini `/proc` dan o‘qiysiz, nomli pipe orqali ikki jarayonni bog‘laysiz va keraksiz chiqishni `/dev/null` ga yuborasiz.',
    steps: [
      {
        cmd: 'cat /proc/loadavg',
        text: 'Tizim yuklamasini `/proc` dan o‘qing.',
        ran: /^cat\s+\/proc\/loadavg\b/,
        natija: 'Birinchi uch son — so‘nggi 1, 5 va 15 daqiqadagi o‘rtacha yuklama (31-bob). Bu fayl diskda yo‘q: yadro uni o‘qish paytida hosil qiladi.',
      },
      {
        cmd: 'head -1 /proc/meminfo > xotira.txt',
        text: '`/proc/meminfo` ning birinchi qatorini (umumiy xotira) `xotira.txt` ga saqlang.',
        check: 'grep -q "^MemTotal:" "$MASHQ/xotira.txt"',
        natija: 'Oddiy fayl kabi o‘qildi va saqlandi: `/proc` dagi ma’lumot bilan odatdagi buyruqlar ishlaydi.',
      },
      {
        cmd: 'mkfifo quvur',
        text: '`quvur` nomli pipe (FIFO) yarating va `ls -l` bilan uning turiga qarang.',
        check: '[ -p "$MASHQ/quvur" ]',
        natija: '`prw-r--r--`: birinchi `p` — nomli pipe. Hajmi doim `0`.',
      },
      {
        cmd: 'echo salom > quvur & cat quvur',
        text: 'Bir jarayon quvurga yozsin (fonda, `&`), ikkinchisi o‘qisin.',
        ran: /\bcat\s+(\.\/)?quvur\b/,
        natija: '`salom` quvur orqali o‘tdi. Yozuvchi o‘quvchi kelguncha kutib turdi.',
      },
      {
        cmd: 'ls /yoq 2>/dev/null',
        text: 'Xato xabarini ekranga chiqarmasdan, `/dev/null` ga yuboring.',
        ran: /2>\s*\/dev\/null/,
        natija: 'Ekran toza qoldi, lekin `echo $?` chiqish kodini baribir ko‘rsatadi: xato yashiringan, yo‘qolmagan.',
      },
    ],
  },
  {
    id: '10-disk',
    title: 'Yo‘qolgan joyni topish',
    bob: '/linux/10-disk-va-mount',
    intro: '20 MB lik fayl tizimini ulaysiz, unga log yozasiz va "disk to‘la, lekin fayl yo‘q" holatini o‘zingiz yaratib, keyin hal qilasiz.',
    setup: 'umount /mnt/m10 2>/dev/null || true\nrm -rf /mnt/m10',
    steps: [
      {
        cmd: 'mkdir -p /mnt/m10 && mount -t tmpfs -o size=20M tmpfs /mnt/m10',
        text: '`/mnt/m10` papkasini yaratib, unga 20 MB lik tmpfs ulang.',
        check: 'findmnt -n /mnt/m10',
        natija: '`findmnt /mnt/m10` va `df -h /mnt/m10` bilan tekshiring: yangi fayl tizimi shu papkada ko‘rinadi.',
      },
      {
        cmd: 'head -c 15M /dev/zero > /mnt/m10/app.log',
        text: '15 MB lik `app.log` yarating.',
        check: '[ "$(stat -c %s /mnt/m10/app.log)" -ge 15000000 ]',
        natija: '`df -h /mnt/m10` endi 15 MB band ekanini ko‘rsatadi.',
      },
      {
        cmd: 'tail -f /mnt/m10/app.log > /dev/null 2>&1 &',
        text: 'Logni ochib turadigan "ilova"ni fonda ishga tushiring (`tail -f`).',
        check: '[ -n "$(lsof -t /mnt/m10/app.log 2>/dev/null)" ]',
        natija: '`tail` faylni ochiq tutib turibdi, xuddi log yozayotgan ilova kabi.',
      },
      {
        cmd: 'rm /mnt/m10/app.log',
        text: 'Logni o‘chiring, keyin `du -sh /mnt/m10` va `df -h /mnt/m10` ni solishtiring.',
        check: '[ ! -e /mnt/m10/app.log ] && [ "$(df --output=used -BM /mnt/m10 | tail -1 | tr -dc 0-9)" -ge 15 ]',
        natija: 'Fayl yo‘q, `du` deyarli 0 deydi, `df` esa joy hali band ekanini ko‘rsatadi.',
      },
      {
        cmd: 'lsof +L1',
        text: 'Joyni kim ushlab turganini toping.',
        ran: /^lsof\b.*\+L\s*1/,
        natija: '`tail` va `(deleted)` belgisi: nom o‘chgan, lekin jarayon faylni ochib turibdi.',
      },
      {
        cmd: 'kill %1',
        text: 'Faylni ochib turgan jarayonni to‘xtating va `df -h /mnt/m10` ni qayta tekshiring.',
        check: '[ "$(df --output=used -BM /mnt/m10 | tail -1 | tr -dc 0-9)" -lt 5 ]',
        natija: 'Joy bo‘shadi. Haqiqiy serverda ilovani to‘xtatmaslik uchun logni o‘chirish o‘rniga `: > app.log` bilan bo‘shatish kerak edi.',
      },
      {
        cmd: 'umount /mnt/m10',
        text: 'Fayl tizimini uzing.',
        check: '! findmnt -n /mnt/m10',
        natija: 'tmpfs uzildi va undagi hamma narsa yo‘qoldi: u xotirada edi.',
      },
    ],
  },
  {
    id: '11-oqimlar',
    title: 'Natija va xatoni ajratish',
    bob: '/linux/11-standart-oqimlar',
    intro: '`ls /etc/hostname /yoq` bitta natija va bitta xato chiqaradi. Ularni turli joylarga yo‘naltirasiz.',
    steps: [
      {
        cmd: 'ls /etc/hostname /yoq > natija.txt',
        text: 'Natijani `natija.txt` ga yozing. Xato qayerda qoldi?',
        check: 'grep -qx /etc/hostname "$MASHQ/natija.txt" && ! grep -q yoq "$MASHQ/natija.txt"',
        natija: 'Faylda faqat natija. Xato ekranda qoldi: `>` faqat 1-kanalni buradi.',
      },
      {
        cmd: 'ls /etc/hostname /yoq 2> xato.txt',
        text: 'Endi faqat xatoni `xato.txt` ga yozing.',
        check: 'grep -q "/yoq" "$MASHQ/xato.txt" && ! grep -qx /etc/hostname "$MASHQ/xato.txt"',
        natija: 'Ekranda natija, faylda xato.',
      },
      {
        cmd: 'ls /etc/hostname /yoq > hammasi.txt 2>&1',
        text: 'Ikkalasini `hammasi.txt` ga yozing. Tartibga e’tibor bering.',
        check: 'grep -q "/yoq" "$MASHQ/hammasi.txt" && grep -qx /etc/hostname "$MASHQ/hammasi.txt"',
        natija: 'Avval `> hammasi.txt`, keyin `2>&1` — xato ham faylga ketdi. Teskari tartibda xato ekranga chiqardi.',
      },
      {
        cmd: 'echo ikkinchi >> log.txt',
        text: '`log.txt` ga ikki qator qo‘shing: avval `echo birinchi >> log.txt`, keyin `echo ikkinchi >> log.txt`.',
        sinov: ['echo birinchi >> log.txt', 'echo ikkinchi >> log.txt'],
        check: '[ "$(wc -l < "$MASHQ/log.txt")" = 2 ]',
        natija: '`>>` oxiriga qo‘shdi. `>` bilan yozganingizda faqat oxirgi qator qolardi.',
      },
      {
        cmd: 'wc -l < /etc/passwd',
        text: '`/etc/passwd` dagi qatorlar sonini fayl nomisiz chiqaring: faylni stdin’ga bering.',
        ran: /^wc\s+-l\s*<\s*\/etc\/passwd/,
        natija: 'Faqat son chiqdi: faylni qobiq (shell) ochdi, `wc` esa oqimni o‘qidi va nomini bilmaydi.',
      },
    ],
  },
  {
    id: '12-pipe',
    title: 'Pipe va zanjir',
    bob: '/linux/12-pipe',
    intro: 'Mashq papkasida `app.log` bor: unda `INFO` va `ERROR` qatorlari aralash. Ma’lumotni pipe orqali o‘tkazasiz va xavfsiz zanjir tuzasiz.',
    setup: 'printf "INFO start\\nERROR db\\nINFO ok\\nERROR disk\\nINFO stop\\nERROR net\\n" > app.log',
    steps: [
      {
        cmd: 'grep ERROR app.log | wc -l',
        text: 'Logdagi `ERROR` qatorlarini sanang: `grep` tanlaydi (18-bob), `wc -l` sanaydi.',
        ran: /grep\b.*ERROR.*\|\s*wc\s+-l/,
        natija: '`3`. `grep` ning stdout’i pipe orqali `wc` ning stdin’iga o‘tdi.',
      },
      {
        cmd: 'ls /etc | tee etc.txt | wc -l',
        text: '`/etc` ro‘yxatini ham `etc.txt` ga saqlang, ham sanang.',
        check: 'grep -qx passwd "$MASHQ/etc.txt"',
        natija: '`tee` oqimni ikkiga bo‘ldi: biri faylga, biri `wc` ga.',
      },
      {
        cmd: 'mkdir -p zaxira && cp app.log zaxira/',
        text: '`zaxira` papkasini yarating va faqat u yaratilgan bo‘lsa, logni unga nusxalang.',
        check: '[ -f "$MASHQ/zaxira/app.log" ]',
        natija: '`&&` — ikkinchi buyruq birinchisi muvaffaqiyatli bo‘lgandagina ishladi.',
      },
      {
        cmd: 'cd /yoq || echo "topilmadi"',
        text: 'Mavjud bo‘lmagan papkaga o‘tishga urining va muvaffaqiyatsiz bo‘lsa, xabar chiqaring.',
        ran: /^cd\s+\S+\s*\|\|/,
        natija: '`||` — "zaxira" buyruq faqat birinchisi yiqilganda ishladi.',
      },
      {
        cmd: 'false | true; echo "${PIPESTATUS[@]}"',
        text: 'Pipe’dagi har bir buyruqning chiqish kodini ko‘ring.',
        ran: /PIPESTATUS/,
        natija: '`1 0`: `$?` faqat oxirgisini (0) ko‘rsatardi, birinchi buyruqning xatosi yo‘qolardi. Skriptlarda `set -o pipefail`.',
      },
    ],
  },
  {
    id: '13-ozgaruvchilar',
    title: 'Ilovaga sozlama berish',
    bob: '/linux/13-ozgaruvchilar',
    intro: 'Mashq papkasida `.env` fayli va `bin/salom` dasturi bor. O‘zgaruvchilarni bola jarayonlarga uzatasiz va `PATH` ga papka qo‘shasiz.',
    setup: 'printf "DB_HOST=db\\nDB_USER=ilova\\n" > .env\nmkdir bin && printf "#!/bin/sh\\necho salom mashqdan\\n" > bin/salom && chmod +x bin/salom\nunset APP_PORT DB_HOST DB_USER',
    steps: [
      {
        cmd: 'export APP_PORT=8080',
        text: '`APP_PORT=8080` ni yarating va bola jarayonlar ham ko‘radigan qiling.',
        check: '[ "$(bash -c \'echo $APP_PORT\')" = 8080 ]',
        natija: 'Endi `bash -c \'echo $APP_PORT\'` ham `8080` ni ko‘radi. `export` siz bo‘sh chiqardi.',
      },
      {
        cmd: 'set -a; . ./.env; set +a',
        text: '`.env` dagi o‘zgaruvchilarni yuklang — ilova ularni ko‘rishi uchun export qilingan holda.',
        check: '[ "$(bash -c \'echo $DB_HOST:$DB_USER\')" = db:ilova ]',
        natija: '`set -a` yuklangan har bir o‘zgaruvchini avtomatik export qildi. Faqat `. ./.env` bo‘lsa, bola jarayon ularni ko‘rmasdi.',
      },
      {
        cmd: 'PATH="$MASHQ/bin:$PATH"',
        text: '`bin` papkasini `PATH` ning boshiga qo‘shing, keyin `salom` ni nomi bilan ishga tushiring.',
        check: '[ "$(command -v salom)" = "$MASHQ/bin/salom" ]',
        natija: '`command -v salom` endi mashq papkasidagi dasturni ko‘rsatadi. Eski `PATH` saqlandi — `ls` ham ishlayveradi.',
      },
      {
        cmd: 'TZ=Asia/Tashkent date',
        text: '`date` ni faqat bir marta Toshkent vaqt zonasi bilan ishga tushiring.',
        ran: /^TZ=\S+\s+date\b/,
        natija: '`TZ` faqat shu `date` ning muhitiga berildi — `echo $TZ` bo‘sh.',
      },
      {
        cmd: 'unset APP_PORT',
        text: '`APP_PORT` ni o‘chiring.',
        check: '[ -z "${APP_PORT+x}" ]',
        natija: 'O‘zgaruvchi qobiqdan (shell) ham, muhitdan ham olib tashlandi.',
      },
    ],
  },
  {
    id: '14-kengaytmalar',
    title: 'Kengaytmalar bilan ishlash',
    bob: '/linux/14-kengaytmalar',
    intro: 'Mashq papkasida probelli nomli `oylik hisobot.txt` fayli bor. Kengaytmalar va qo‘shtirnoq bilan ishlaysiz.',
    setup: 'echo "maxfiy raqamlar" > "oylik hisobot.txt"',
    steps: [
      {
        cmd: 'mkdir -p app/{logs,data,tmp}',
        text: '`app` ichida `logs`, `data` va `tmp` papkalarini bitta buyruq bilan yarating.',
        check: '[ -d "$MASHQ/app/logs" ] && [ -d "$MASHQ/app/data" ] && [ -d "$MASHQ/app/tmp" ]',
        natija: '`{logs,data,tmp}` uch so‘zga kengaydi — `mkdir` uchta argument oldi.',
      },
      {
        cmd: 'NOM="oylik hisobot.txt"',
        text: 'Fayl nomini `NOM` o‘zgaruvchisiga saqlang.',
        check: '[ "$NOM" = "oylik hisobot.txt" ]',
        natija: 'Endi `ls $NOM` va `ls "$NOM"` ni solishtirib ko‘ring.',
      },
      {
        cmd: 'cp "$NOM" app/data/',
        text: 'Faylni `app/data/` ga nusxalang. Qo‘shtirnoqni unutmang.',
        check: '[ -f "$MASHQ/app/data/oylik hisobot.txt" ]',
        natija: '`"$NOM"` bitta argument bo‘lib qoldi. Qo‘shtirnoqsiz `cp` "oylik" va "hisobot.txt" degan ikki faylni qidirardi.',
      },
      {
        cmd: 'echo "Bugun: $(date +%F)" > sana.txt',
        text: 'Bugungi sanani `$( )` bilan `sana.txt` ga yozing.',
        check: 'grep -qx "Bugun: $(date +%F)" "$MASHQ/sana.txt"',
        natija: '`$(date +%F)` buyruqning chiqishiga almashtirildi.',
      },
      {
        cmd: "echo 'narx: $5'",
        text: '`narx: $5` matnini aynan shunday chiqaring — `$5` almashib ketmasin.',
        ran: /^echo\s+('narx: \$5'|"narx: \\\$5")/,
        natija: 'Bitta tirnoq ichida hech narsa almashtirilmaydi. Qo‘sh tirnoqda esa `\\$5` kerak bo‘lardi.',
      },
    ],
  },
  {
    id: '15-bash-sozlash',
    title: 'Doimiy sozlamalar',
    bob: '/linux/15-bash-sozlash',
    intro: 'Alias va `PATH` ni to‘g‘ri faylga yozasiz va qaysi qobiq (shell) ularni ko‘rishini tekshirasiz. (Mashq boshida `~/.bashrc` va `~/.profile` asl holiga qaytariladi.)',
    setup: 'for f in .bashrc .profile; do [ -f /tmp/.asl$f ] || cp ~/$f /tmp/.asl$f; cp /tmp/.asl$f ~/$f; done',
    steps: [
      {
        cmd: "echo \"alias ll='ls -lh'\" >> ~/.bashrc",
        text: '`ll` alias’ini `~/.bashrc` ga yozing.',
        check: 'grep -q "^alias ll=" ~/.bashrc',
        natija: 'Faylga yozildi, lekin joriy qobiq (shell) uni hali bilmaydi: fayl qobiq (shell) ishga tushganda o‘qiladi.',
      },
      {
        cmd: 'source ~/.bashrc',
        text: '`~/.bashrc` ni joriy qobiqda (shell) qayta o‘qing, so‘ng `ll /etc` ni sinang.',
        check: 'alias ll',
        natija: 'Endi `ll` ishlaydi. `source` (yoki `.`) faylni shu qobiqning (shell) o‘zida bajaradi.',
      },
      {
        cmd: "bash -c 'type ll'",
        text: 'Skript `ll` ni ko‘radimi? Tekshiring.',
        ran: /^bash\s+-c\b.*\bll\b/,
        natija: '`ll: not found` — skript interaktiv emas: `~/.bashrc` ni o‘qimaydi va alias’lar ishlamaydi.',
      },
      {
        cmd: "echo 'PATH=\"$HOME/bin:$PATH\"' >> ~/.profile",
        text: '`~/bin` ni `PATH` ga qo‘shadigan qatorni `~/.profile` ga yozing (muhit sozlamasi login uchun).',
        check: 'grep -q "^PATH=\\"\\$HOME/bin:\\$PATH\\"" ~/.profile',
        natija: 'Qator yozildi. U har bir login qobiqda (shell) ishga tushadi.',
      },
      {
        cmd: "bash -l -c 'echo $PATH'",
        text: 'Login qobiq (shell) ochib, `PATH` ni tekshiring.',
        ran: /^bash\s+(-l|--login)\b/,
        natija: '`/root/bin:...` bilan boshlanadi: login qobiq (shell) `~/.profile` ni o‘qidi. SSH bilan kirganda ham aynan shunday bo‘ladi.',
      },
    ],
  },
  {
    id: '16-muharrir',
    title: 'Sozlama faylini tahrirlash',
    bob: '/linux/16-matn-muharriri',
    intro: 'Mashq papkasida `app.conf` bor: `port=80`. Uni nano va vim bilan tahrirlaysiz. Muharrir ichidagi tugmalar uchun bob jadvallariga qarang.',
    setup: 'echo "port=80" > app.conf',
    steps: [
      {
        cmd: 'cp -a app.conf app.conf.bak',
        text: 'Tahrirlashdan oldin zaxira nusxa oling.',
        check: 'cmp -s "$MASHQ/app.conf" "$MASHQ/app.conf.bak"',
        natija: 'Xato qilsangiz, `cp -a app.conf.bak app.conf` bilan qaytarasiz.',
      },
      {
        cmd: 'nano app.conf',
        text: 'nano bilan `port=80` ni `port=8080` ga o‘zgartiring. Saqlash: `Ctrl+O`, `Enter`; chiqish: `Ctrl+X`.',
        sinov: ["sed -i 's/port=80$/port=8080/' app.conf"],
        check: 'grep -qx "port=8080" "$MASHQ/app.conf"',
        natija: 'Fayl saqlandi. nano tugmalari ekran pastida doim ko‘rinib turadi.',
      },
      {
        cmd: 'vim.tiny app.conf',
        text: 'vim bilan oxiriga `host=0.0.0.0` qatorini qo‘shing: `G` (oxirgi qator), `o` (pastga yangi qator), matnni yozing, `Esc`, `:wq`.',
        sinov: ["echo 'host=0.0.0.0' >> app.conf"],
        check: 'grep -qx "host=0.0.0.0" "$MASHQ/app.conf" && grep -qx "port=8080" "$MASHQ/app.conf"',
        natija: 'Ikkala qator ham joyida. vim’dan adashib chiqolmasangiz: `Esc`, `:q!`.',
      },
      {
        cmd: 'diff app.conf.bak app.conf',
        text: 'Zaxira bilan solishtiring: nima o‘zgardi?',
        ran: /^diff\b.*app\.conf/,
        natija: '`<` — eski qator, `>` — yangisi. Sozlamani o‘zgartirgandan keyin shunday tekshirish odat bo‘lsin.',
      },
    ],
  },
  {
    id: '17-korish',
    title: 'Logni ko‘rish',
    bob: '/linux/17-faylni-korish',
    intro: 'Mashq papkasida 1000 qatorli `app.log` (har 100-qatori `ERROR`), `users.csv` va Windows’da yozilgan `win.conf` bor. Ularni tahrirlamasdan ko‘rasiz.',
    setup: 'for i in $(seq 1 1000); do if [ $((i % 100)) -eq 0 ]; then t=ERROR; else t=INFO; fi; printf "2026-11-06 10:%02d:%02d %s sorov %d\\n" $((i/60)) $((i%60)) $t $i; done > app.log; printf "id,ism\\n1,ali\\n2,vali\\n" > users.csv; printf "host=db\\r\\nport=5432\\r\\n" > win.conf',
    steps: [
      {
        cmd: 'head -n 5 app.log',
        text: 'Logning birinchi 5 qatorini chiqaring.',
        ran: /^head\s+(-n\s*5|-5)\s+app\.log\s*$/,
        natija: 'Standart holatda `head` 10 qator beradi, `-n` bilan sonini o‘zingiz tanlaysiz.',
      },
      {
        cmd: 'tail -n 3 app.log',
        text: 'Oxirgi 3 qatorni chiqaring.',
        ran: /^tail\s+(-n\s*3|-3)\s+app\.log\s*$/,
        natija: 'Oxirgi qator — `sorov 1000`, u `ERROR`.',
      },
      {
        cmd: 'head -n 500 app.log | tail -n 1',
        text: 'Faqat 500-qatorni oling: avval birinchi 500 tasini, keyin ulardan oxirgisini.',
        ran: /^head\s+(-n\s*500|-500)\s+app\.log\s*\|\s*tail\s+(-n\s*1|-1)\s*$/,
        natija: '`sorov 500` — u ham `ERROR`. 20-bobda buni `sed -n 500p` bilan qilasiz.',
      },
      {
        cmd: 'wc -l app.log',
        text: 'Logda nechta qator borligini sanang.',
        ran: /^wc\s+-l\s+app\.log\s*$/,
        natija: '`1000 app.log`.',
      },
      {
        cmd: 'tail -n +2 users.csv > users.txt',
        text: '`users.csv` dan sarlavha qatorini (`id,ism`) olib tashlab, qolganini `users.txt` ga yozing.',
        check: '[ "$(cat "$MASHQ/users.txt")" = "$(printf "1,ali\\n2,vali")" ]',
        natija: '`-n +2` — 2-qatordan boshlab oxirigacha.',
      },
      {
        cmd: 'less app.log',
        text: 'Logni `less` da oching. `/ERROR` bilan qidiring, `n` bilan keyingisiga o‘ting, `q` bilan chiqing.',
        sinov: ['less app.log | head -n 1'],
        ran: /^less\b.*app\.log/,
        natija: '`less` tugmalari `man` ichida ham xuddi shunday ishlaydi.',
      },
      {
        cmd: 'cat -A win.conf',
        text: '`win.conf` dagi ko‘rinmas belgilarni ko‘ring.',
        ran: /^cat\s+(-A|--show-all)\s+win\.conf\s*$/,
        natija: 'Qator oxiridagi `^M` — Windows qator oxiri (`\\r`). Dastur qiymatni `db\\r` deb o‘qiydi.',
      },
    ],
  },
  {
    id: '18-grep',
    title: 'Logdan qidirish',
    bob: '/linux/18-grep-va-regex',
    intro: 'Mashq papkasida veb-serverning `access.log` kirish logi va `app.conf` sozlama fayli bor. `grep` bilan kerakli qatorlarni ajratib olasiz.',
    setup: 'printf "%s\\n" \'10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512\' \'10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024\' \'10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64\' \'192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128\' \'10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32\' > access.log; printf "# ilova sozlamasi\\n\\nport=8080\\n  # eski: port=80\\nhost=0.0.0.0\\n" > app.conf',
    steps: [
      {
        cmd: 'grep -n POST access.log',
        text: '`POST` so‘rovlarini qator raqami bilan toping.',
        ran: /^grep\s+(-\w*n\w*\s+)?.*POST.*access\.log/,
        natija: '`3:` — bu 3-qator. Raqam bilan faylni `less +3 access.log` da ochish mumkin.',
      },
      {
        cmd: "grep -c ' 200 ' access.log",
        text: 'Muvaffaqiyatli (`200`) so‘rovlar sonini toping. Probellar raqamni boshqa sonlardan ajratadi.',
        ran: /^grep\s+-c\s+['"] 200 ['"]\s+access\.log\s*$/,
        natija: '`2`. `-v` qo‘shsangiz, qolgan 3 tasi chiqadi.',
      },
      {
        cmd: "grep -E '\" (4|5)[0-9]{2} ' access.log > xatolar.log",
        text: '4xx va 5xx javob kodli qatorlarni `xatolar.log` ga yozing. Kengaytirilgan regex kerak.',
        check: '[ "$(wc -l < "$MASHQ/xatolar.log")" -eq 3 ] && ! grep -q " 200 " "$MASHQ/xatolar.log"',
        natija: '3 qator: `401`, `404`, `500`.',
      },
      {
        cmd: "grep -oE '^[0-9.]+' access.log",
        text: 'Har qatordan faqat IP manzilni chiqaring.',
        ran: /^grep\s+-(oE|Eo|o\s+-E|E\s+-o)\s/,
        natija: '`-o` faqat topilgan qismni beradi. 20-bobda ularni sanaysiz.',
      },
      {
        cmd: 'grep -wF 10.0.0.5 access.log',
        text: '`10.0.0.5` dan kelgan so‘rovlarni toping: nuqta oddiy belgi bo‘lsin va `10.0.0.50` kabi manzil tushmasin.',
        ran: /^grep\s+(-wF|-Fw|-w\s+-F|-F\s+-w)\s+['"]?10\.0\.0\.5['"]?\s+access\.log/,
        natija: '`-F` — oddiy matn, `-w` — butun so‘z.',
      },
      {
        cmd: "grep -Ev '^[[:space:]]*(#|$)' app.conf",
        text: '`app.conf` dan izohlar va bo‘sh qatorlarni olib tashlab, faqat sozlamalarni ko‘ring.',
        ran: /^grep\s+-(Ev|vE)\s/,
        natija: 'Ikki qator qoldi: `port=8080` va `host=0.0.0.0`. Probel bilan boshlangan izoh ham olib tashlandi.',
      },
    ],
  },
  {
    id: '19-find',
    title: 'Eski loglarni tozalash',
    bob: '/linux/19-find-va-xargs',
    intro: 'Mashq papkasida `logs/` (1, 5, 10, 20 va 30 kunlik loglar, bittasining nomida probel), 2 MB lik `dump.bin` va `skript/` papkasida ruxsatsiz `.sh` fayllar bor.',
    setup: 'mkdir -p logs skript; for d in 1 5 10 20; do echo log > logs/app-$d.log; touch -d "$d days ago" logs/app-$d.log; done; echo bo > "logs/eski yozuv.log"; touch -d "30 days ago" "logs/eski yozuv.log"; head -c 2M /dev/zero > logs/dump.bin; echo "echo a" > skript/a.sh; echo "echo b" > "skript/ishga tushir.sh"',
    steps: [
      {
        cmd: "find logs -name '*.log' -mtime +7",
        text: '7 kundan eski loglarni toping (hozircha faqat ko‘ring).',
        ran: /^find\s+\S+.*-name\s+['"]\*\.log['"].*-mtime\s+\+7\s*(-print)?\s*$/,
        natija: '3 ta: 10, 20 va 30 kunlik. 5 kunlik tushmadi.',
      },
      {
        cmd: 'find . -type f -size +1M',
        text: '1 MB dan katta fayllarni toping.',
        ran: /^find\s+\S+.*-size\s+\+1M/,
        natija: '`./logs/dump.bin`. Diskni nima to‘ldirayotganini shunday qidirasiz.',
      },
      {
        cmd: "find logs -name '*.log' -print0 | xargs -0 wc -l",
        text: 'Hamma loglardagi qatorlarni sanang. Probelli nom bo‘linmasin.',
        ran: /-print0\s*\|\s*xargs\s+(-\w*0|--null)/,
        natija: '`logs/eski yozuv.log` bitta nom bo‘lib qoldi. `-print0` va `-0` birga ishlaydi.',
      },
      {
        cmd: "find logs -name '*.log' -mtime +7 -delete",
        text: '1-qadamdagi buyruqning oxiriga `-delete` qo‘shib, eski loglarni o‘chiring.',
        check: '[ ! -e "$MASHQ/logs/app-10.log" ] && [ ! -e "$MASHQ/logs/app-20.log" ] && [ ! -e "$MASHQ/logs/eski yozuv.log" ] && [ -e "$MASHQ/logs/app-5.log" ] && [ -e "$MASHQ/logs/app-1.log" ] && [ -e "$MASHQ/logs/dump.bin" ]',
        natija: 'Faqat eski loglar o‘chdi, yangilari va `dump.bin` joyida.',
      },
      {
        cmd: "find skript -name '*.sh' -exec chmod +x {} +",
        text: '`skript/` dagi barcha `.sh` fayllarga bajarish ruxsatini bering. Bitta nomda probel bor.',
        check: '[ -x "$MASHQ/skript/a.sh" ] && [ -x "$MASHQ/skript/ishga tushir.sh" ]',
        natija: '`-exec ... {} +` nomlarni bo‘lmaydi va `chmod` ni bir marta ishga tushiradi.',
      },
    ],
  },
  {
    id: '20-matn',
    title: 'Sozlama va hisobot',
    bob: '/linux/20-matnni-ozgartirish',
    intro: 'Mashq papkasida `app.conf` (`port=80` va `metrics_port=8090`) va 18-bobdagi `access.log` bor. Sozlamani `sed` bilan o‘zgartirasiz va logdan hisobot tuzasiz.',
    setup: 'printf "# ilova\\nport=80\\nmetrics_port=8090\\n" > app.conf; printf "%s\\n" \'10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512\' \'10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024\' \'10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64\' \'192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128\' \'10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32\' > access.log',
    steps: [
      {
        cmd: "sed 's/^port=80$/port=8080/' app.conf",
        text: '`port=80` ni `port=8080` ga almashtirib, natijani faqat ekranda ko‘ring. `metrics_port=8090` ham `port=80` matnini o‘z ichiga oladi — shablon faqat `port` qatoriga tegsin.',
        ran: /^sed\s+(-E\s+)?'s\/\^port=80\$?\//,
        natija: '`^` va `$` shablonni butun qatorga bog‘ladi. Fayl hali o‘zgarmagan.',
      },
      {
        cmd: "sed -i.bak 's/^port=80$/port=8080/' app.conf",
        text: 'Endi o‘sha almashtirishni faylning o‘zida qiling va `.bak` zaxira oling.',
        check: 'grep -qx "port=8080" "$MASHQ/app.conf" && grep -qx "metrics_port=8090" "$MASHQ/app.conf" && grep -qx "port=80" "$MASHQ/app.conf.bak"',
        natija: '`diff app.conf.bak app.conf` bilan farqni ko‘rishingiz mumkin.',
      },
      {
        cmd: "sed '/^#/d' app.conf",
        text: 'Izoh qatorlarisiz ko‘ring.',
        ran: /^sed\s+(-E\s+)?'\/\^#\/d'/,
        natija: '`/^#/d` — `#` bilan boshlangan qatorlarni o‘chirdi (faqat chiqishda).',
      },
      {
        cmd: "cut -d' ' -f1 access.log | sort | uniq -c | sort -rn > top.txt",
        text: 'Har IP nechta so‘rov yuborganini sanab, ko‘pidan ozigacha `top.txt` ga yozing.',
        check: '[ "$(wc -l < "$MASHQ/top.txt")" -eq 3 ] && head -n 1 "$MASHQ/top.txt" | grep -q "^ *2 " && tail -n 1 "$MASHQ/top.txt" | grep -q "^ *1 192.168.1.20$"',
        natija: '`sort` siz `uniq -c` hammasini `1` deb sanardi.',
      },
      {
        cmd: "awk '$9 >= 400 {print $9, $7}' access.log",
        text: '`awk` bilan javob kodi 400 va undan katta so‘rovlarning kodi va yo‘lini chiqaring.',
        ran: /^awk\s+'\s*\$9\s*>=?\s*(400|399)/,
        natija: '`401 /api/login`, `404 /admin`, `500 /api/orders`.',
      },
      {
        cmd: "awk '{s += $10} END {print s}' access.log",
        text: 'Barcha javoblarning umumiy hajmini (10-ustun) hisoblang.',
        ran: /^awk\s+'.*\$10.*END/,
        natija: '`1760` bayt. `END` hamma qator o‘qilgandan keyin bir marta ishlaydi.',
      },
    ],
  },
  {
    id: '21-log-tahlili',
    title: 'Log tahlili',
    bob: '/linux/21-log-tahlili',
    intro: '10:00–10:30 oralig‘idagi veb-server logi: joriy `access.log` va aylantirilgan `access.log.1.gz`. Foydalanuvchilar buyurtma bera olmaganidan shikoyat qilgan. Sababini toping.',
    setup: `awk '${LOG_21}' > hammasi.log; head -n 1000 hammasi.log > access.log.1; gzip access.log.1; tail -n +1001 hammasi.log > access.log; rm hammasi.log`,
    steps: [
      {
        cmd: 'zcat -f access.log.1.gz access.log > tahlil.log',
        text: 'Ikkala logni (avval eskisini) bitta `tahlil.log` fayliga birlashtiring.',
        check: '[ "$(wc -l < "$MASHQ/tahlil.log")" -eq 1860 ] && head -n 1 "$MASHQ/tahlil.log" | grep -q "10:00:00"',
        natija: '1860 qator. `-f` siqilmagan faylni ham o‘zgartirmasdan chiqaradi.',
      },
      {
        cmd: "awk '{print $9}' tahlil.log | sort | uniq -c | sort -rn",
        text: 'Javob kodlari bo‘yicha taqsimotni chiqaring.',
        ran: /^awk\s+'\{\s*print\s+\$9\s*\}'\s+tahlil\.log\s*\|\s*sort\s*\|\s*uniq\s+-c/,
        natija: '`200` — 1731, `401` — 60, `404` — 53, `500` — 16.',
      },
      {
        cmd: "awk '$9 >= 500 {print $7, substr($4, 14, 5)}' tahlil.log | sort | uniq -c",
        text: '500 xatolari qaysi yo‘lda va qaysi daqiqalarda bo‘lganini toping.',
        ran: /^awk\s+'\s*\$9\s*(>=|==)\s*500/,
        natija: 'Hammasi `/api/orders` da, 10:20–10:22. Shikoyatning sababi shu.',
      },
      {
        cmd: "awk '$9 == 401 {print $1}' tahlil.log | sort -u > shubhali.txt",
        text: '401 (rad etilgan) javob olgan IP manzillarni takrorlarsiz `shubhali.txt` ga yozing.',
        check: '[ "$(cat "$MASHQ/shubhali.txt")" = "203.0.113.9" ]',
        natija: 'Bitta IP: `203.0.113.9`, 60 urinish — parolni terib topishga urinish belgisi.',
      },
      {
        cmd: "awk '$4 >= \"[06/Nov/2026:10:20:00\" && $4 < \"[06/Nov/2026:10:23:00\"' tahlil.log > voqea.log",
        text: '10:20:00 dan 10:23:00 gacha bo‘lgan barcha so‘rovlarni `voqea.log` ga kesib oling.',
        check: '[ "$(wc -l < "$MASHQ/voqea.log")" -eq 180 ]',
        natija: '180 qator — ilova logi bilan solishtirish uchun.',
      },
    ],
  },
  {
    id: '22-foydalanuvchi',
    title: 'Jamoa va servis',
    bob: '/linux/22-foydalanuvchi-va-guruh',
    intro: 'Yangi loyiha uchun: dasturchi `aziz`, `dev` guruhi, ilova uchun `api` servis foydalanuvchisi va jamoaning umumiy papkasi `/srv/loyiha`.',
    setup: 'userdel -r aziz 2>/dev/null || true; userdel api 2>/dev/null || true; groupdel dev 2>/dev/null || true; groupdel api 2>/dev/null || true; rm -rf /srv/loyiha /home/aziz',
    steps: [
      {
        cmd: "adduser --disabled-password --gecos '' aziz",
        text: '`aziz` foydalanuvchisini parolsiz yarating (keyin SSH kalit bilan kiradi).',
        check: 'getent passwd aziz | grep -q ":/home/aziz:/bin/bash$"',
        natija: 'O‘z nomidagi guruh va `/home/aziz` ham yaratildi.',
      },
      {
        cmd: 'addgroup dev',
        text: '`dev` guruhini yarating.',
        check: 'getent group dev',
        natija: 'Guruh bo‘sh: a’zolar ro‘yxati (4-maydon) hali yo‘q.',
      },
      {
        cmd: 'adduser aziz dev',
        text: '`aziz` ni `dev` guruhiga qo‘shing va `id aziz` bilan tekshiring.',
        check: 'id -nG aziz | grep -qw dev',
        natija: '`usermod -aG dev aziz` ham shu ishni qiladi — `-a` siz emas!',
      },
      {
        cmd: 'adduser --system --group --no-create-home api',
        text: 'Ilova uchun `api` tizim foydalanuvchisini o‘z guruhi bilan, uy papkasisiz yarating.',
        check: '[ "$(id -u api)" -lt 1000 ] && getent passwd api | grep -q nologin && getent group api',
        natija: 'UID 1000 dan kichik, qobiq (shell) `nologin` — bu hisob bilan kirib bo‘lmaydi.',
      },
      {
        cmd: 'mkdir /srv/loyiha && chgrp dev /srv/loyiha && chmod 2770 /srv/loyiha',
        text: '`/srv/loyiha` papkasini yarating: guruhi `dev`, ruxsati `2770` (setgid, 8-bob).',
        check: '[ "$(stat -c "%a %G" /srv/loyiha)" = "2770 dev" ]',
        natija: '`dev` a’zolari ishlaydi, boshqalar ichiga kira olmaydi.',
      },
      {
        cmd: 'runuser -u aziz -- touch /srv/loyiha/reja.txt',
        text: '`aziz` nomidan papkada fayl yarating va `ls -l /srv/loyiha` bilan egasini ko‘ring.',
        check: '[ "$(stat -c "%U %G" /srv/loyiha/reja.txt)" = "aziz dev" ]',
        natija: 'Fayl egasi `aziz`, guruhi `dev` — setgid papkadan oldi.',
      },
    ],
  },
  {
    id: '23-sudo',
    title: 'Deploy uchun sudo',
    bob: '/linux/23-sudo',
    intro: '`deploy` foydalanuvchisi bor. Unga faqat `systemctl restart cron` ni parolsiz bajarishga ruxsat berasiz — boshqa hech narsaga.',
    setup: 'rm -f /etc/sudoers.d/deploy /etc/sudoers.d/deploy.conf; userdel -r deploy 2>/dev/null || true; adduser --quiet --disabled-password --gecos "" deploy',
    steps: [
      {
        cmd: 'sudo -l -U deploy',
        text: '`deploy` ga hozir nima ruxsat etilganini ko‘ring.',
        ran: /^sudo\s+-l\s+-U\s+deploy\s*$/,
        natija: '`User deploy is not allowed to run sudo` — hozircha hech narsa.',
      },
      {
        cmd: "echo 'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart cron' > deploy",
        text: 'Qoidani avval mashq papkasidagi `deploy` fayliga yozing.',
        check: 'grep -qx "deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart cron" "$MASHQ/deploy"',
        natija: 'Qoida hali kuchga kirmagan: u faqat oddiy fayl.',
      },
      {
        cmd: 'visudo -cf deploy',
        text: 'Faylni `visudo` bilan tekshiring.',
        ran: /^visudo\s+-c\s*-?f\s+\S*deploy\s*$|^visudo\s+-cf\s+\S*deploy\s*$/,
        natija: '`parsed OK` — sintaksis to‘g‘ri.',
      },
      {
        cmd: 'install -m 0440 deploy /etc/sudoers.d/deploy',
        text: 'Faylni `0440` ruxsat bilan `/etc/sudoers.d/deploy` ga qo‘ying (nomida nuqta bo‘lmasin).',
        check: '[ "$(stat -c %a /etc/sudoers.d/deploy)" = 440 ] && sudo -l -U deploy | grep -q "restart cron"',
        natija: 'Qoida kuchga kirdi.',
      },
      {
        cmd: 'runuser -u deploy -- sudo -n systemctl restart cron',
        text: '`deploy` nomidan servisni qayta ishga tushiring (`-n` — parol so‘ramasin).',
        ran: /^runuser\s+-u\s+deploy\s+--\s+sudo\s+-n\s+(\/usr\/bin\/)?systemctl\s+restart\s+cron\s*$/,
        natija: 'Ishladi: parol so‘ralmadi.',
      },
      {
        cmd: 'runuser -u deploy -- sudo -n systemctl stop cron',
        text: 'Endi `stop` ni sinang.',
        ran: /^runuser\s+-u\s+deploy\s+--\s+sudo\s+-n\s+(\/usr\/bin\/)?systemctl\s+stop\s+cron\s*$/,
        natija: '`a password is required` — qoida faqat `restart cron` ga.',
      },
    ],
  },
  {
    id: '25-dpkg',
    title: 'Paket tergovi',
    bob: '/linux/25-paket-ichida',
    intro: 'Serverda kimdir `cron` sozlamasini o‘zgartirgan. Fayllar qaysi paketdan ekanini topasiz, o‘zgarishni aniqlaysiz va paketni yangilanishdan ushlab turasiz. Oxirida hold’ni olib tashlang.',
    setup: 'apt-mark unhold cron >/dev/null 2>&1 || true; grep -q "EXTRA_OPTS=\"-L 15\"" /etc/default/cron || echo "EXTRA_OPTS=\"-L 15\"" >> /etc/default/cron',
    steps: [
      {
        cmd: 'dpkg -S /usr/bin/crontab',
        text: '`/usr/bin/crontab` qaysi paketdan ekanini toping.',
        ran: /^dpkg\s+(-S|--search)\s+\/usr\/bin\/crontab\s*$/,
        natija: '`cron: /usr/bin/crontab`.',
      },
      {
        cmd: "dpkg-query -W -f='${Conffiles}\\n' cron",
        text: '`cron` paketining conffile’larini chiqaring.',
        ran: /^dpkg-query\s+(-W|--show)\s+-f=?\s*'?\$\{Conffiles\}/,
        natija: 'Uchta conffile: `/etc/default/cron`, `/etc/init.d/cron`, `/etc/pam.d/cron`.',
      },
      {
        cmd: 'dpkg --verify cron | grep -v missing',
        text: 'Qaysi fayl o‘zgartirilganini toping (`missing` qatorlari — trenajorda o‘rnatilmagan hujjatlar).',
        ran: /^dpkg\s+(-V|--verify)\s+cron/,
        natija: '`??5?????? c /etc/default/cron` — conffile o‘zgargan. Yangilanishda bu o‘zgarish himoyalanadi.',
      },
      {
        cmd: 'apt-mark hold cron',
        text: '`cron` ni yangilanishdan ushlab turing.',
        check: 'apt-mark showhold | grep -qx cron',
        natija: '`dpkg -l cron` endi `hi` deb ko‘rsatadi.',
      },
      {
        cmd: 'apt-mark unhold cron',
        text: 'Hold’ni olib tashlang — aks holda xavfsizlik yangilanishlari ham kelmaydi.',
        check: '! apt-mark showhold | grep -qx cron && [ -n "$(history 1 | grep unhold)" ]',
        natija: '`apt-mark showhold` bo‘sh.',
      },
    ],
  },
  {
    id: '28-jarayon',
    title: 'Jarayonlar oilasi',
    bob: '/linux/28-jarayon',
    intro: 'Jarayonlarni topasiz, kim kimni yaratganini aniqlaysiz va `/proc` dan jarayon haqida o‘qiysiz.',
    setup: 'pkill -x sleep 2>/dev/null || true',
    steps: [
      {
        cmd: 'ps -o pid,ppid,user,stat,cmd',
        text: 'Terminalingizdagi jarayonlarni PID, PPID, egasi va holati bilan chiqaring.',
        ran: /^ps\s+-o\s+\S*pid\S*ppid/,
        natija: '`ps` ning otasi — sizning bash’ingiz, bash’ning otasi — `login`.',
      },
      {
        cmd: 'pstree -p',
        text: 'Butun jarayon daraxtini PID’lar bilan ko‘ring.',
        ran: /^pstree\b.*-\w*p/,
        natija: 'Hammasi `systemd(1)` dan o‘sib chiqadi.',
      },
      {
        cmd: 'sleep 1000 &',
        text: '`sleep 1000` ni fonda ishga tushiring.',
        check: 'pgrep -x sleep',
        natija: 'bash fork qildi: `sleep` — yangi PID, otasi bash.',
      },
      {
        cmd: 'grep PPid /proc/$!/status',
        text: '`/proc` orqali `sleep` ning otasini toping (`$!` — oxirgi fon jarayonining PID’i).',
        ran: /\/proc\/(\$!|\d+)\/status/,
        natija: '`PPid` — `echo $$` bilan bir xil: bu sizning bash’ingiz.',
      },
      {
        cmd: 'readlink /proc/$!/exe',
        text: '`sleep` jarayoni qaysi dastur faylidan ishlayotganini toping.',
        ran: /readlink\s+\/proc\/(\$!|\d+)\/exe/,
        natija: '`/usr/bin/sleep` — jarayon shu dasturning ishlab turgan nusxasi.',
      },
      {
        cmd: 'kill %1',
        text: 'Fondagi `sleep` ni to‘xtating (29-bobda batafsil).',
        check: '! pgrep -x sleep',
        natija: 'Jarayon tugadi. `jobs` bo‘sh.',
      },
    ],
  },
]

/** VM ichida `source` qilinadigan skript: papka, setup va har prompt oldidan qadamlarni tekshiradigan funksiya */
export function mashqSkripti(m) {
  const tekshiruv = m.steps
    .map((s) => (s.check ? `    { ${s.check}\n    } >/dev/null 2>&1 && printf 1 || printf 0` : '    printf 0'))
    .join('\n')
  return `MASHQ=/tmp/mashq/${m.id}
rm -rf "$MASHQ" && mkdir -p "$MASHQ" && cd "$MASHQ"
( set -e
${m.setup ?? ':'}
) >/dev/null 2>&1
# har prompt oldidan: qadamlar holati va oxirgi buyruq ko'rinmas OSC 7771 bilan sahifaga; $? va joriy papka o'zgarmaydi
__mashq() {
  local s=$? n
  n="$( (
${tekshiruv}
  ) )"
  # oxirgi buyruq bash tarixidan ("  N  buyruq"): ekrandan o'qilgan qatorga ishonib bo'lmaydi
  printf '\\e]7771;%s\\a' "$(printf 'mashq:${m.id}:%s:%s' "$n" "$(history 1)" | base64 -w0)"
  return $s
}
PROMPT_COMMAND=__mashq
clear
`
}

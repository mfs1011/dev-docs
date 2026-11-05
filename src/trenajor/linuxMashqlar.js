// Linux trenajori mashqlari. Har mashq VM ichida /tmp/mashq/<id> papkasini (tmpfs — haqiqiy fayl tizimi) noldan yaratadi, `setup` (bash) shu papkada
// ishlaydi, so'ng o'quvchi qadamma-qadam boradi. Qadam bajarilgani ikki yo'l bilan aniqlanadi:
//   check — bash shart: har prompt oldidan (PROMPT_COMMAND) haqiqiy tizim holatidan tekshiriladi; $MASHQ — mashq papkasi
//   ran   — yozilgan buyruq shu regex'ga mos kelsa (holatni o'zgartirmaydigan buyruqlar: cat, uname, type ...)
// Hammasi linux-trenajor/test/mashqlar.mjs da brauzerda, haqiqiy VM'da tekshiriladi (`sinov` — testda yoziladigan buyruqlar,
// berilmasa `cmd`).

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
        text: '`cd` alohida dasturmi yoki qobiqning ichki buyrug‘imi?',
        ran: /^type\s+(-\w+\s+)*cd\b/,
        natija: '`cd is a shell builtin` — ichki buyruq: u qobiqning o‘z joriy papkasini o‘zgartiradi.',
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
        text: '`cd` ga `man` sahifasi yo‘q. Uning tavsifini qobiqning o‘zidan oling.',
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

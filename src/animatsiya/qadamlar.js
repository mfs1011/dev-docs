// Qadamli animatsiyalar ma'lumoti (QadamliAnim.vue). Buyruq chiqishlari — bob matnidagi bilan bir xil, trenajorda olingan.
// holat: panel qatorlari — { yol, qiymat, belgi: 'yangi' | 'xato' | 'ochiq' | 'yoq' }

export const QADAMLI = {
  // 05-bob: cp so'ramasdan ustidan yozadi; zaxira; mv — ko'chirish va nom o'zgartirish
  'cp-mv': {
    panel: 'loyiha papkasi',
    qadamlar: [
      {
        cmd: ['echo birinchi > a.txt', 'echo ikkinchi > yangi.txt'],
        holat: [{ yol: 'a.txt', qiymat: '"birinchi"', belgi: 'yangi' }, { yol: 'yangi.txt', qiymat: '"ikkinchi"', belgi: 'yangi' }],
        izoh: 'Ikki fayl, ikki xil matn.',
      },
      {
        cmd: ['cp a.txt yangi.txt', 'cat yangi.txt'], chiqish: 'birinchi',
        holat: [{ yol: 'a.txt', qiymat: '"birinchi"' }, { yol: 'yangi.txt', qiymat: '"birinchi" — "ikkinchi" yo‘qoldi', belgi: 'xato' }],
        izoh: '`cp` hech narsa so‘ramadi: `yangi.txt` dagi eski matn jimgina o‘chib ketdi. Savat yo‘q.',
      },
      {
        cmd: ['echo ikkinchi > yangi.txt', 'cp --backup=numbered a.txt yangi.txt', 'ls'], chiqish: 'a.txt  src  src-zaxira\tyangi.txt  yangi.txt.~1~',
        holat: [{ yol: 'a.txt', qiymat: '"birinchi"' }, { yol: 'yangi.txt', qiymat: '"birinchi"' }, { yol: 'yangi.txt.~1~', qiymat: '"ikkinchi" — eski nusxa', belgi: 'yangi' }],
        izoh: '`--backup=numbered` yozishdan oldin eski faylni `.~1~` qilib saqlab qo‘ydi. Qaytarish imkoni qoldi.',
      },
      {
        cmd: ['mv b.txt src/'],
        holat: [{ k: 'b', yol: 'src/b.txt', qiymat: 'papka ICHIGA ko‘chdi', belgi: 'yangi' }, { k: 'b0', yol: 'b.txt', belgi: 'yoq' }],
        izoh: 'Oxirgi argument mavjud papka bo‘lsa, `mv` faylni o‘z nomi bilan shu papka ichiga ko‘chiradi.',
      },
      {
        cmd: ['mv c.txt yangi.txt'],
        holat: [{ k: 'c', yol: 'yangi.txt', qiymat: 'c.txt ning yangi NOMI', belgi: 'yangi' }, { k: 'c0', yol: 'c.txt', belgi: 'yoq' }],
        izoh: 'Oxirgi argument papka bo‘lmasa — bu nom o‘zgartirish. Shu nomli fayl bo‘lsa, `mv` ham `cp` kabi uning ustidan so‘ramasdan yozadi.',
      },
    ],
  },

  // 06-bob: deploy'dagi current havolasi; -n siz ln -sf havolani papka ichiga yaratadi
  current: {
    panel: 'havolalar',
    qadamlar: [
      {
        cmd: ['mkdir -p releases/v1 releases/v2', 'ln -s releases/v1 current', 'ls -l current'],
        chiqish: 'lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v1',
        holat: [{ yol: 'current', qiymat: '→ releases/v1', belgi: 'yangi' }, { yol: 'releases/v1/', qiymat: 'ishlab turgan versiya' }, { yol: 'releases/v2/', qiymat: 'yangi versiya' }],
        izoh: 'Server `current` orqali ishlaydi. Yangi versiya alohida papkada tayyorlandi.',
      },
      {
        cmd: ['ln -sfn releases/v2 current', 'ls -l current'],
        chiqish: 'lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v2',
        holat: [{ yol: 'current', qiymat: '→ releases/v2', belgi: 'yangi' }, { yol: 'releases/v1/', qiymat: 'eski versiya (qaytish uchun)' }, { yol: 'releases/v2/', qiymat: 'ishlab turgan versiya' }],
        izoh: 'Versiya almashdi: fayllar ko‘chirilmadi, faqat havola o‘zgardi. `-f` eskisini almashtirdi, `-n` havolani papka deb emas, havolaning o‘zi deb ko‘rdi.',
      },
      {
        cmd: ['ln -sf releases/v1 current', 'ls -l current releases/v2'],
        chiqish: 'lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v2\n\nreleases/v2:\ntotal 0\nlrwxrwxrwx 1 root root 11 Nov  5 11:21 v1 -> releases/v1',
        holat: [{ yol: 'current', qiymat: '→ releases/v2 — O‘ZGARMADI', belgi: 'xato' }, { yol: 'releases/v2/v1', qiymat: 'keraksiz va osilgan havola', belgi: 'xato' }],
        izoh: '`-n` siz: `current` papkaga ishora qilgani uchun `ln` uni papka deb tushundi va yangi havolani uning ICHIDA yaratdi. Deploy "o‘tdi", lekin versiya qaytmadi.',
      },
    ],
  },

  // 07/08-bob: sticky bit va setgid papka
  sticky: {
    panel: 'kim nima qila oldi',
    qadamlar: [
      {
        cmd: ['mkdir umumiy && chmod 777 umumiy && echo root > umumiy/root.txt', 'runuser -u ali -- rm -f umumiy/root.txt', 'ls umumiy'],
        holat: [{ yol: 'umumiy/', qiymat: 'drwxrwxrwx (777)' }, { yol: 'umumiy/root.txt', qiymat: 'ali root’ning faylini o‘chirdi', belgi: 'xato' }],
        izoh: 'Papkaga yoza oladigan har kim undagi istalgan faylni o‘chira oladi — fayl egasidan qat’i nazar (7-bob).',
      },
      {
        cmd: ['ls -ld /tmp', 'runuser -u ali -- touch /tmp/ali.txt', 'runuser -u vali -- rm -f /tmp/ali.txt'],
        chiqish: "drwxrwxrwt 7 root root 140 Nov  5 11:27 /tmp\nrm: cannot remove '/tmp/ali.txt': Operation not permitted",
        holat: [{ yol: '/tmp/', qiymat: 'drwxrwxrwt — oxirida t', belgi: 'yangi' }, { yol: '/tmp/ali.txt', qiymat: 'vali o‘chira olmadi', belgi: 'yangi' }],
        izoh: 'Sticky bit (`t`): papka hammaga ochiq, lekin faylni faqat egasi, papka egasi yoki root o‘chira oladi.',
      },
      {
        cmd: ['mkdir oddiy umumiy && chgrp jamoa oddiy umumiy && chmod 775 oddiy && chmod 2775 umumiy', 'runuser -u ali -- touch oddiy/a umumiy/a', 'ls -l oddiy/a umumiy/a'],
        chiqish: '-rw-r--r-- 1 ali ali   0 Nov  5 11:27 oddiy/a\n-rw-r--r-- 1 ali jamoa 0 Nov  5 11:27 umumiy/a',
        holat: [{ yol: 'oddiy/a', qiymat: 'guruh: ali (shaxsiy)', belgi: 'xato' }, { yol: 'umumiy/a', qiymat: 'guruh: jamoa (papkaniki)', belgi: 'yangi' }],
        izoh: 'setgid papka (`2775`, `drwxrwsr-x`): ichida yaratilgan fayl papkaning guruhini oladi. Jamoaning umumiy papkasi uchun aynan shu kerak.',
      },
    ],
  },

  // 10-bob: o'chirilgan, lekin ochiq fayl
  'ochiq-fayl': {
    panel: '/tmp va jarayonlar',
    qadamlar: [
      {
        cmd: ['head -c 30M /dev/zero > /tmp/katta.log', 'df -h /tmp'],
        chiqish: 'Filesystem      Size  Used Avail Use% Mounted on\ntmpfs           111M   30M   81M  28% /tmp',
        holat: [{ yol: '/tmp/katta.log', qiymat: '30 MB', belgi: 'yangi' }, { yol: 'df', qiymat: '30M band' }],
        izoh: 'Log 30 MB joy egalladi.',
      },
      {
        cmd: ['tail -f /tmp/katta.log > /dev/null 2>&1 &'], chiqish: '[1] 177',
        holat: [{ yol: '/tmp/katta.log', qiymat: '30 MB' }, { k: 'tail', yol: 'tail (PID 177)', qiymat: 'faylni OCHIB turibdi', belgi: 'ochiq' }],
        izoh: 'Ilova (bu yerda `tail`) faylni ochiq tutib turibdi — xuddi logga yozayotgan servis kabi.',
      },
      {
        cmd: ['rm /tmp/katta.log', 'du -sh /tmp', 'df -h /tmp'],
        chiqish: '0\t/tmp\nFilesystem      Size  Used Avail Use% Mounted on\ntmpfs           111M   30M   81M  28% /tmp',
        holat: [{ yol: '/tmp/katta.log', qiymat: 'nomi o‘chdi', belgi: 'yoq' }, { k: 'tail', yol: 'tail (PID 177)', qiymat: 'hali ochiq — ma’lumot turibdi', belgi: 'ochiq' }, { yol: 'df', qiymat: '30M hali band!', belgi: 'xato' }],
        izoh: '`rm` faqat NOMNI o‘chirdi. `du` nomlarni sanaydi — 0; `df` esa fayl tizimidan so‘raydi — 30 MB band. Ma’lumot oxirgi ochiq dastur yopilguncha turadi.',
      },
      {
        cmd: ['lsof +L1'],
        chiqish: 'COMMAND PID USER   FD   TYPE DEVICE SIZE/OFF NLINK NODE NAME\ntail    177 root    3r   REG   0,29 31457280     0   10 /tmp/katta.log (deleted)',
        holat: [{ k: 'tail', yol: 'tail (PID 177)', qiymat: '/tmp/katta.log (deleted)', belgi: 'ochiq' }],
        izoh: '`lsof +L1` — nomi o‘chirilgan, lekin ochiq fayllar. `NLINK 0`: nomi yo‘q, joyni `tail` ushlab turibdi.',
      },
      {
        cmd: ['kill %1', 'df -h /tmp'],
        chiqish: 'Filesystem      Size  Used Avail Use% Mounted on\ntmpfs           111M     0  111M   0% /tmp',
        holat: [{ k: 'tail', yol: 'tail', qiymat: 'to‘xtadi', belgi: 'yoq' }, { yol: 'df', qiymat: '0 — joy bo‘shadi', belgi: 'yangi' }],
        izoh: 'Jarayon to‘xtagach joy bo‘shadi. Servisni to‘xtatmaslik uchun logni o‘chirish o‘rniga `: > fayl.log` bilan bo‘shatish kerak edi.',
      },
    ],
  },

  // 17-bob: log aylantirilganda tail -f eski faylda qoladi, tail -F yangisiga o'tadi (trenajordagi sinov, sleep'lar tushirilgan)
  'tail-f': {
    panel: 'kuzatuvchi qayerga qarab turibdi',
    qadamlar: [
      {
        cmd: ['echo bir > f.log; tail -f f.log > f.txt &', 'echo bir > F.log; tail -F F.log > F.txt &', 'echo ikki >> f.log; echo ikki >> F.log'],
        holat: [{ k: 'f', yol: 'tail -f', qiymat: '→ f.log (faylning o‘zi)', belgi: 'ochiq' }, { k: 'F', yol: 'tail -F', qiymat: '→ "F.log" nomi', belgi: 'ochiq' }],
        izoh: 'Hozircha ikkalasi bir xil: `bir` va `ikki` darhol ko‘rinadi.',
      },
      {
        cmd: ['mv f.log f.log.1; echo yangi > f.log', 'mv F.log F.log.1; echo yangi > F.log'],
        holat: [{ k: 'f', yol: 'tail -f', qiymat: '→ f.log.1 (eski faylda qoldi)', belgi: 'xato' }, { k: 'F', yol: 'tail -F', qiymat: '→ yangi F.log', belgi: 'yangi' }],
        izoh: 'Log aylantirildi: eski fayl `.1` bo‘ldi, o‘rniga yangisi yaratildi. `-f` fayl deskriptorini kuzatadi, shuning uchun qayta nomlangan eski faylda qoladi. `-F` nomni kuzatadi va yangi faylga o‘tadi.',
      },
      {
        cmd: ['echo eski-faylga >> f.log.1; echo eski-faylga >> F.log.1', 'cat F.txt'],
        chiqish: "bir\nikki\ntail: 'F.log' has become inaccessible: No such file or directory\ntail: 'F.log' has appeared;  following new file\nyangi",
        holat: [{ k: 'F', yol: 'tail -F', qiymat: '"yangi" ko‘rindi', belgi: 'yangi' }],
        izoh: '`-F` eski fayl yo‘qolganini va yangisi paydo bo‘lganini aytdi, keyin `yangi` ni ko‘rsatdi. Eski faylga yozilgan qator uni qiziqtirmaydi.',
      },
      {
        cmd: ['cat f.txt'],
        chiqish: 'bir\nikki\neski-faylga',
        holat: [{ k: 'f', yol: 'tail -f', qiymat: '"yangi" ko‘rinmadi', belgi: 'xato' }],
        izoh: '`-f` faqat eski faylga yozilgan qatorni ko‘rdi. Servis endi yangi logga yozadi, siz esa hech narsa ko‘rmaysiz. Aylantiriladigan logni `tail -F` bilan kuzating.',
      },
    ],
  },

  // 19-bob: xargs nomlarni probel bo'yicha bo'ladi; -print0/-0 va -exec {} +
  xargs: {
    panel: 'wc qanday argumentlar oldi',
    qadamlar: [
      {
        cmd: ["find logs -name '*.log'"],
        chiqish: 'logs/eski yozuv.log\nlogs/app-20.log\nlogs/app-10.log\nlogs/app-5.log\nlogs/app-1.log',
        holat: [{ yol: 'logs/eski yozuv.log', qiymat: 'nomida probel', belgi: 'ochiq' }, { yol: 'logs/app-*.log', qiymat: '4 ta oddiy nom' }],
        izoh: '`find` har nomni alohida qatorga chiqardi. Birinchi nomda probel bor.',
      },
      {
        cmd: ["find logs -name '*.log' | xargs wc -l"],
        chiqish: 'wc: logs/eski: No such file or directory\nwc: yozuv.log: No such file or directory\n 1 logs/app-20.log\n 1 logs/app-10.log\n 1 logs/app-5.log\n 1 logs/app-1.log\n 4 total',
        holat: [{ k: 'a', yol: 'logs/eski', qiymat: 'bunday fayl yo‘q', belgi: 'xato' }, { k: 'b', yol: 'yozuv.log', qiymat: 'bunday fayl yo‘q', belgi: 'xato' }, { yol: 'logs/app-*.log', qiymat: '4 ta — to‘g‘ri' }],
        izoh: '`xargs` nomlarni probel va yangi qator bo‘yicha bo‘ladi: bitta nom ikki argumentga aylandi. `wc` o‘rnida `rm` bo‘lsa, boshqa fayl o‘chishi mumkin edi.',
      },
      {
        cmd: ["find logs -name '*.log' -print0 | xargs -0 wc -l"],
        chiqish: ' 1 logs/eski yozuv.log\n 1 logs/app-20.log\n 1 logs/app-10.log\n 1 logs/app-5.log\n 1 logs/app-1.log\n 5 total',
        holat: [{ k: 'a', yol: 'logs/eski yozuv.log', qiymat: 'bitta argument', belgi: 'yangi' }, { yol: 'logs/app-*.log', qiymat: '4 ta' }],
        izoh: '`-print0` nomlarni null belgisi bilan ajratadi, `xargs -0` faqat shu belgi bo‘yicha bo‘ladi. Probel endi nomning bir qismi.',
      },
      {
        cmd: ["find logs -name 'app-*' -exec echo chaqiruv: {} \\;"],
        chiqish: 'chaqiruv: logs/app-20.log\nchaqiruv: logs/app-10.log\nchaqiruv: logs/app-5.log\nchaqiruv: logs/app-1.log',
        holat: [{ yol: 'echo', qiymat: '4 marta ishga tushdi', belgi: 'ochiq' }],
        izoh: '`xargs` siz ham bo‘ladi. `-exec ... \\;` — har fayl uchun alohida jarayon.',
      },
      {
        cmd: ["find logs -name 'app-*' -exec echo chaqiruv: {} +"],
        chiqish: 'chaqiruv: logs/app-20.log logs/app-10.log logs/app-5.log logs/app-1.log',
        holat: [{ yol: 'echo', qiymat: '1 marta, 4 argument bilan', belgi: 'yangi' }],
        izoh: '`+` bilan `find` nomlarni o‘zi yig‘ib beradi, `xargs` kabi. Nomlar hech qachon bo‘linmaydi.',
      },
    ],
  },

  // 20-bob: cut | sort | uniq -c | sort -rn — har bosqichdagi oqim (trenajor chiqishi)
  quvur: {
    panel: 'oqimdagi ma’lumot',
    qadamlar: [
      {
        cmd: ["cut -d' ' -f1 access.log"],
        chiqish: '10.0.0.5\n10.0.0.7\n10.0.0.5\n192.168.1.20\n10.0.0.7',
        holat: [{ yol: 'cut', qiymat: '5 qator → 5 ta IP', belgi: 'yangi' }],
        izoh: '`cut` har qatordan 1-ustunni (IP) kesib oldi. Takrorlar bor, lekin ular yonma-yon emas.',
      },
      {
        cmd: ["cut -d' ' -f1 access.log | uniq -c"],
        chiqish: '      1 10.0.0.5\n      1 10.0.0.7\n      1 10.0.0.5\n      1 192.168.1.20\n      1 10.0.0.7',
        holat: [{ yol: 'cut', qiymat: '5 ta IP' }, { yol: 'uniq -c', qiymat: 'hammasi 1 — xato', belgi: 'xato' }],
        izoh: '`uniq` faqat yonma-yon turgan bir xil qatorlarni birlashtiradi. Bu yerda hech bir takror yonma-yon emas.',
      },
      {
        cmd: ["cut -d' ' -f1 access.log | sort"],
        chiqish: '10.0.0.5\n10.0.0.5\n10.0.0.7\n10.0.0.7\n192.168.1.20',
        holat: [{ yol: 'cut', qiymat: '5 ta IP' }, { yol: 'sort', qiymat: 'bir xillar yonma-yon', belgi: 'yangi' }],
        izoh: '`sort` dan keyin bir xil IP’lar ketma-ket turibdi.',
      },
      {
        cmd: ["cut -d' ' -f1 access.log | sort | uniq -c"],
        chiqish: '      2 10.0.0.5\n      2 10.0.0.7\n      1 192.168.1.20',
        holat: [{ yol: 'cut', qiymat: '5 ta IP' }, { yol: 'sort', qiymat: 'yonma-yon' }, { yol: 'uniq -c', qiymat: '3 ta noyob, soni bilan', belgi: 'yangi' }],
        izoh: 'Endi `uniq -c` har IP necha marta uchraganini to‘g‘ri sanadi.',
      },
      {
        cmd: ["cut -d' ' -f1 access.log | sort | uniq -c | sort -rn"],
        chiqish: '      2 10.0.0.7\n      2 10.0.0.5\n      1 192.168.1.20',
        holat: [{ yol: 'cut', qiymat: '5 ta IP' }, { yol: 'sort', qiymat: 'yonma-yon' }, { yol: 'uniq -c', qiymat: 'sanaldi' }, { yol: 'sort -rn', qiymat: 'ko‘pidan ozigacha', belgi: 'yangi' }],
        izoh: 'Oxirgi `sort -rn` son bo‘yicha teskari saraladi: eng faol IP tepada. Katta logda `| head` qo‘shib, "top 10" olinadi.',
      },
    ],
  },

  // 23-bob: sudo so'rovni qanday hal qiladi (trenajor, sudo 1.9.13; parol — trenajordagi sinov qiymati)
  sudo: {
    panel: 'sudo nimaga qaradi',
    qadamlar: [
      {
        cmd: ['echo PAROL | runuser -u ali -- sudo -S true'],
        chiqish: '[sudo] password for ali: ali is not in the sudoers file.',
        holat: [{ yol: 'parol', qiymat: 'ali’ning O‘Z paroli — to‘g‘ri' }, { yol: '/etc/sudoers', qiymat: 'ali uchun qoida yo‘q', belgi: 'xato' }],
        izoh: 'Parol to‘g‘ri bo‘lsa ham, `sudoers` da `ali` ga ruxsat yo‘q — rad etildi.',
      },
      {
        cmd: ['adduser ali sudo', 'echo PAROL | runuser -u ali -- sudo -S whoami'],
        chiqish: '[sudo] password for ali: root',
        holat: [{ yol: '%sudo ALL=(ALL:ALL) ALL', qiymat: 'sudo guruhiga hamma narsa', belgi: 'yangi' }, { yol: 'ali', qiymat: 'sudo guruhida', belgi: 'yangi' }],
        izoh: '`/etc/sudoers` dagi `%sudo` qatori guruhga ruxsat beradi. `ali` endi root nomidan istalgan buyruqni bajaradi.',
      },
      {
        cmd: ['runuser -u ali -- sudo -n whoami'],
        chiqish: 'root',
        holat: [{ yol: 'vaqt belgisi', qiymat: 'parol yaqinda kiritilgan', belgi: 'ochiq' }],
        izoh: 'Parol qayta so‘ralmadi: sudo uni bir muddat eslab qoladi (sudoers man: standart 15 daqiqa). `sudo -k` bu belgini o‘chiradi.',
      },
      {
        cmd: ["echo 'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart cron' > /tmp/deploy", 'visudo -cf /tmp/deploy && install -m 0440 /tmp/deploy /etc/sudoers.d/deploy', 'runuser -u deploy -- sudo -n systemctl restart cron; echo "kod: $?"'],
        chiqish: '/tmp/deploy: parsed OK\nkod: 0',
        holat: [{ yol: '/etc/sudoers.d/deploy', qiymat: 'faqat bitta buyruq, parolsiz', belgi: 'yangi' }],
        izoh: '`deploy` — deploy skripti uchun foydalanuvchi. Unga faqat servisni qayta ishga tushirish ruxsat etildi.',
      },
      {
        cmd: ['runuser -u deploy -- sudo -n systemctl stop cron; echo "kod: $?"'],
        chiqish: 'sudo: a password is required\nkod: 1',
        holat: [{ yol: '/etc/sudoers.d/deploy', qiymat: 'stop ro‘yxatda yo‘q', belgi: 'xato' }],
        izoh: 'Qoidada aynan `restart cron` yozilgan. Boshqa buyruq uchun qoida yo‘q, parol ham yo‘q — rad.',
      },
      {
        cmd: ["echo 'deploy ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/hamma.conf && chmod 440 /etc/sudoers.d/hamma.conf", 'sudo -l -U deploy | tail -2'],
        chiqish: 'User deploy may run the following commands on trenajor:\n    (root) NOPASSWD: /usr/bin/systemctl restart cron',
        holat: [{ yol: '/etc/sudoers.d/hamma.conf', qiymat: 'nomida nuqta — O‘QILMADI', belgi: 'yoq' }],
        izoh: '`/etc/sudoers.d` dagi nomida `.` bor yoki `~` bilan tugagan fayllar o‘qilmaydi. `deploy.conf` kabi nom qo‘ysangiz, qoidangiz jimgina ishlamaydi.',
      },
    ],
  },

  // 24-bob: bog'liqliklar, "auto" belgisi va autoremove (Ubuntu 26.04 VPS, jq)
  'apt-bogliq': {
    panel: 'serverdagi paketlar',
    qadamlar: [
      {
        cmd: ['apt show jq | grep Depends'],
        chiqish: 'Depends: libjq1 (= 1.8.1-4ubuntu2), libc6 (>= 2.38), libonig5 (>= 6.8.1)',
        holat: [{ yol: 'libc6', qiymat: 'allaqachon bor' }],
        izoh: '`jq` ishlashi uchun uchta kutubxona kerak. `libc6` serverda bor, qolgan ikkitasi yo‘q.',
      },
      {
        cmd: ['apt install -y jq'],
        chiqish: 'Installing:\n  jq\n\nInstalling dependencies:\n  libjq1  libonig5',
        holat: [{ k: 'jq', yol: 'jq', qiymat: 'siz so‘radingiz — manual', belgi: 'yangi' }, { k: 'l1', yol: 'libjq1', qiymat: 'bog‘liqlik — auto', belgi: 'yangi' }, { k: 'l2', yol: 'libonig5', qiymat: 'bog‘liqlik — auto', belgi: 'yangi' }, { yol: 'libc6', qiymat: 'allaqachon bor' }],
        izoh: 'apt bog‘liqliklarni o‘zi qo‘shdi va ularni "avtomatik o‘rnatilgan" deb belgiladi.',
      },
      {
        cmd: ['apt-mark showauto libjq1 libonig5 jq', 'apt-mark showmanual jq'],
        chiqish: 'libjq1\nlibonig5\njq',
        holat: [{ k: 'jq', yol: 'jq', qiymat: 'manual', belgi: 'ochiq' }, { k: 'l1', yol: 'libjq1', qiymat: 'auto' }, { k: 'l2', yol: 'libonig5', qiymat: 'auto' }],
        izoh: 'Belgi muhim: apt "auto" paketlarni keyinchalik kerak bo‘lmay qolsa, o‘chirishni taklif qiladi.',
      },
      {
        cmd: ['apt remove -y jq'],
        chiqish: "The following packages were automatically installed and are no longer required:\n  libjq1  libonig5\nUse 'apt autoremove' to remove them.\n\nREMOVING:\n  jq",
        holat: [{ k: 'jq', yol: 'jq', qiymat: 'o‘chirildi', belgi: 'yoq' }, { k: 'l1', yol: 'libjq1', qiymat: 'auto — endi hech kimga kerak emas', belgi: 'xato' }, { k: 'l2', yol: 'libonig5', qiymat: 'auto — endi hech kimga kerak emas', belgi: 'xato' }],
        izoh: '`remove` faqat so‘ralgan paketni o‘chirdi. Bog‘liqliklar qoldi — apt ular haqida eslatdi.',
      },
      {
        cmd: ['apt autoremove -y'],
        chiqish: 'REMOVING:\n  libjq1  libonig5',
        holat: [{ k: 'l1', yol: 'libjq1', qiymat: 'o‘chirildi', belgi: 'yoq' }, { k: 'l2', yol: 'libonig5', qiymat: 'o‘chirildi', belgi: 'yoq' }, { yol: 'libc6', qiymat: 'boshqalarga kerak — qoldi' }],
        izoh: '`autoremove` "auto" belgili va hech bir paket talab qilmaydigan paketlarni o‘chiradi. `libc6` boshqa paketlarga kerak, unga tegilmadi.',
      },
    ],
  },

  // 26-bob: tashqi repo Ubuntu paketini "yutib" oladi; pinning qaytaradi (VPS, PostgreSQL rasmiy repo'si, o'rnatilmagan)
  pin: {
    panel: 'apt install nimani tanlaydi',
    qadamlar: [
      {
        cmd: ['apt policy postgresql   # faqat Ubuntu manbalari'],
        chiqish: 'postgresql:\n  Installed: (none)\n  Candidate: 18+290ubuntu1\n  Version table:\n     18+290ubuntu1 500\n        500 http://mirror.hoztnode.net/ubuntu resolute/main amd64 Packages',
        holat: [{ k: 'ub', yol: 'Ubuntu: 18+290ubuntu1', qiymat: 'ustuvorlik 500 — tanlanadi', belgi: 'yangi' }],
        izoh: 'Hozircha yagona manba — Ubuntu arxivi.',
      },
      {
        cmd: ['# pgdg.sources qo‘shildi', 'apt update', 'apt policy postgresql | head -n 3'],
        chiqish: 'postgresql:\n  Installed: (none)\n  Candidate: 18+293.pgdg26.04+1',
        holat: [{ k: 'pg', yol: 'pgdg: 18+293.pgdg26.04+1', qiymat: '500, versiya kattaroq — tanlanadi', belgi: 'xato' }, { k: 'ub', yol: 'Ubuntu: 18+290ubuntu1', qiymat: '500' }],
        izoh: 'Ustuvorlik teng (500) bo‘lsa, apt eng katta versiyani oladi. Tashqi repo endi Ubuntu’ning o‘z paketini ham almashtiradi. `postgresql-18` da ham shunday: nomzod `18.6-1.pgdg26.04+2`.',
      },
      {
        cmd: ['cat /etc/apt/preferences.d/pgdg', 'apt policy postgresql-18 | head -n 3'],
        chiqish: 'Package: *\nPin: origin apt.postgresql.org\nPin-Priority: 100\npostgresql-18:\n  Installed: (none)\n  Candidate: 18.6-0ubuntu0.26.04.1',
        holat: [{ k: 'pg', yol: 'pgdg: 18.6-1.pgdg26.04+2', qiymat: 'ustuvorlik 100' }, { k: 'ub', yol: 'Ubuntu: 18.6-0ubuntu0.26.04.1', qiymat: '500 — tanlanadi', belgi: 'yangi' }],
        izoh: 'Pinning tashqi repo ustuvorligini 100 ga tushirdi. Ikkalasida bor paketda (`postgresql-18`) Ubuntu versiyasi g‘olib.',
      },
      {
        cmd: ['apt-get -s install postgresql-17 | grep "^Inst postgresql-17 "'],
        chiqish: 'Inst postgresql-17 (17.11-1.pgdg26.04+2 PostgreSQL for Debian/Ubuntu repository:resolute-pgdg [amd64])',
        holat: [{ k: 'p17', yol: 'postgresql-17', qiymat: 'faqat pgdg’da — baribir o‘rnatiladi', belgi: 'yangi' }],
        izoh: 'Ubuntu’da yo‘q paket esa tashqi repodan o‘rnatilaveradi. Repo aynan shu uchun qo‘shilgan edi.',
      },
    ],
  },

  // 27-bob: avtomatik yangilanish kuni (Ubuntu 26.04 VPS, 2026-11-06 — haqiqiy log va holat)
  avto: {
    panel: 'server holati',
    qadamlar: [
      {
        cmd: ['cat /etc/apt/apt.conf.d/20auto-upgrades'],
        chiqish: 'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";',
        holat: [{ yol: 'apt-daily.timer', qiymat: 'kuniga: apt update' }, { yol: 'apt-daily-upgrade.timer', qiymat: 'kuniga: unattended-upgrade' }],
        izoh: '`1` — har kuni. Ikkita systemd timer ishni tasodifiy kechikish bilan boshlaydi.',
      },
      {
        cmd: ['tail -n 6 /var/log/unattended-upgrades/unattended-upgrades.log'],
        chiqish: '2026-11-06 06:16:03,349 INFO Packages that will be upgraded: apt apt-utils bind9-dnsutils bind9-host bind9-libs ca-certificates libapt-pkg7.0 libpcre2-8-0 linux-image-virtual\n2026-11-06 06:16:22,673 WARNING package linux-image-virtual upgradable but fails to be marked for upgrade (E:Unable to correct problems, you have held broken packages.)\n2026-11-06 06:17:17,718 INFO All upgrades installed',
        holat: [{ yol: '06:16', qiymat: '8 paket yangilandi', belgi: 'yangi' }, { yol: 'linux-image-virtual', qiymat: 'o‘tkazib yuborildi (24-bob)', belgi: 'ochiq' }],
        izoh: 'Ertalab 06:16 da hech kim aralashmasdan xavfsizlik yangilanishlari o‘rnatildi.',
      },
      {
        cmd: ['ls -l /var/run/reboot-required /var/run/reboot-required.pkgs', 'cat /var/run/reboot-required.pkgs', 'uname -r'],
        chiqish: '-rw-r--r-- 1 root root  0 Nov  6 06:17 /var/run/reboot-required\n-rw-r--r-- 1 root root 29 Nov  6 06:17 /var/run/reboot-required.pkgs\nlinux-image-7.0.0-42-generic\n7.0.0-38-generic',
        holat: [{ yol: 'o‘rnatilgan yadro', qiymat: '7.0.0-42' }, { yol: 'ishlab turgan yadro', qiymat: '7.0.0-38 — eski', belgi: 'xato' }],
        izoh: 'Yangi yadro diskda, lekin u faqat qayta yonganda ishlaydi. `Automatic-Reboot` o‘chiq (standart), shuning uchun server o‘zi qayta yonmadi.',
      },
      {
        cmd: ['needrestart -b -r l'],
        chiqish: 'NEEDRESTART-KCUR: 7.0.0-38-generic\nNEEDRESTART-KEXP: 7.0.0-42-generic\nNEEDRESTART-KSTA: 3\nNEEDRESTART-SVC: dbus.service\nNEEDRESTART-SVC: systemd-logind.service\nNEEDRESTART-SVC: unattended-upgrades.service',
        holat: [{ yol: 'KSTA: 3', qiymat: 'yadro versiyasi yangilangan — reboot kerak', belgi: 'xato' }, { yol: '3 ta servis', qiymat: 'eski kutubxonalar bilan ishlayapti', belgi: 'ochiq' }],
        izoh: '`needrestart` ham buni tasdiqlaydi va qaysi servislarni qayta ishga tushirish kerakligini aytadi. Qachon qayta yondirishni administrator rejalashtiradi.',
      },
    ],
  },

  // 28-bob: fork va exec — jarayon daraxti qanday o'sadi (trenajor; har qadam alohida ishga tushirishdan, PID'lar shundan farq qiladi)
  'fork-exec': {
    panel: 'jarayon daraxti',
    qadamlar: [
      {
        cmd: ['ps -o pid,ppid,user,stat,cmd'],
        chiqish: '  PID  PPID USER     STAT CMD\n  157     1 root     Ss   /bin/login -f\n  167   157 root     S    -bash\n  185   167 root     R+   ps -o pid,ppid,user,stat,cmd',
        holat: [{ k: 'l', yol: 'login (157)', qiymat: 'ota: systemd (1)' }, { k: 'b', yol: 'bash (167)', qiymat: 'ota: login (157)' }, { k: 'p', yol: 'ps (185)', qiymat: 'ota: bash (167)', belgi: 'yangi' }],
        izoh: 'Siz yozgan buyruq ham jarayon: `ps` bash’ning bolasi (PPID 167) bo‘lib ishladi va tugadi.',
      },
      {
        cmd: ['sleep 300 &', 'ps -o pid,ppid,stat,cmd'],
        chiqish: '  PID  PPID STAT CMD\n  157     1 Ss   /bin/login -f\n  167   157 S    -bash\n  194   167 S    sleep 300\n  195   167 R+   ps -o pid,ppid,stat,cmd',
        holat: [{ k: 'b', yol: 'bash (167)', qiymat: 'ota' }, { k: 's', yol: 'sleep (194)', qiymat: 'bola, fonda kutyapti (S)', belgi: 'yangi' }, { k: 'p', yol: 'ps (195)', qiymat: 'bola, ishlayapti (R+)', belgi: 'yangi' }],
        izoh: 'bash har buyruq uchun o‘zidan nusxa oladi (fork): yangi PID, ota — bash. Bola nusxa keyin kerakli dasturga aylanadi (exec).',
      },
      {
        cmd: [`bash -c 'echo "bash PID: $$"; ps -o pid,ppid,cmd --ppid $$; true'`],
        chiqish: 'bash PID: 177\n  PID  PPID CMD\n  178   177 ps -o pid,ppid,cmd --ppid 177',
        holat: [{ k: 'b2', yol: 'bash -c (177)', qiymat: 'yangi bash — bola' }, { k: 'p', yol: 'ps (178)', qiymat: 'uning bolasi: fork → yangi PID', belgi: 'yangi' }],
        izoh: 'fork(2): "chaqirgan jarayonni nusxalab, yangi jarayon yaratadi". Bolaning PID’i yangi, PPID’i — otaniki.',
      },
      {
        cmd: [`bash -c 'echo "bash PID: $$"; exec ps -o pid,ppid,cmd -p $$'`],
        chiqish: 'bash PID: 284\n  PID  PPID CMD\n  284   167 ps -o pid,ppid,cmd -p 284',
        holat: [{ k: 'b2', yol: 'PID 284', qiymat: 'avval bash edi → endi ps', belgi: 'ochiq' }],
        izoh: '`exec` fork qilmaydi: jarayonning o‘zida dastur almashadi. execve(2): dastur yangisiga almashtiriladi, PID esa o‘zgarmaydi — 284 avval bash, keyin ps.',
      },
    ],
  },

  // 29-bob: SIGTERM va SIGKILL farqi
  signal: {
    panel: 'jarayon va tozalash',
    qadamlar: [
      {
        cmd: ['/tmp/ilova.sh &', 'sleep 1', 'cat /tmp/ish.txt'],
        chiqish: '[1] 178\nishlayapman',
        holat: [
          { k: 'p', yol: 'ilova (PID 178)', qiymat: 'ishlayapti (S)', belgi: 'yangi' },
          { k: 'f', yol: '/tmp/ish.txt', qiymat: '"ishlayapman"', belgi: 'yangi' },
          { k: 'd', yol: '/tmp/ish.pid', qiymat: '178', belgi: 'yangi' },
        ],
        izoh: 'Ilova ishga tushdi: o‘z PID’ini yozdi va fonda kutyapti.',
      },
      {
        cmd: ['sleep 1', 'kill -TERM $!', 'sleep 1', 'cat /tmp/ish.txt'],
        chiqish: '[1]+  Done                    /tmp/ilova.sh\ntozalash',
        holat: [
          { k: 'p', yol: 'ilova (PID 178)', qiymat: 'to‘xtadi (kod 0)', belgi: 'ochiq' },
          { k: 'f', yol: '/tmp/ish.txt', qiymat: '"tozalash" — trap ishladi', belgi: 'yangi' },
          { k: 'd', yol: '/tmp/ish.pid', belgi: 'yoq' },
        ],
        izoh: 'SIGTERM yetib bordi: ilova `trap` bilan tozalash kodini bajardi va xavfsiz chiqdi (graceful shutdown).',
      },
      {
        cmd: ['/tmp/ilova.sh &'],
        chiqish: '[1] 186',
        holat: [
          { k: 'p', yol: 'ilova (PID 186)', qiymat: 'qayta ishga tushdi', belgi: 'yangi' },
          { k: 'f', yol: '/tmp/ish.txt', qiymat: '"ishlayapman"', belgi: 'yangi' },
          { k: 'd', yol: '/tmp/ish.pid', qiymat: '186', belgi: 'yangi' },
        ],
        izoh: 'Ilova yana fonda ishga tushirildi.',
      },
      {
        cmd: ['sleep 1', 'kill -KILL $!', 'sleep 1', 'cat /tmp/ish.txt', 'cat /tmp/ish.pid'],
        chiqish: '[1]+  Killed                  /tmp/ilova.sh\nishlayapman\n186',
        holat: [
          { k: 'p', yol: 'ilova (PID 186)', qiymat: 'yadro darhol to‘xtatdi', belgi: 'xato' },
          { k: 'f', yol: '/tmp/ish.txt', qiymat: '"ishlayapman" — O‘ZGARMADI', belgi: 'xato' },
          { k: 'd', yol: '/tmp/ish.pid', qiymat: '186 — O‘CHIRILMADI', belgi: 'xato' },
        ],
        izoh: 'SIGKILL ni ushlab bo‘lmaydi: yadro ilovani darhol to‘xtatdi. Tozalash kodi ishlamadi, qoldiq fayllar qoldi.',
      },
    ],
  },

  // 30-bob: ish holatlari (trenajor, bob bloklaridagi chiqishlar). Ctrl+Z o'rniga kill -TSTP (stty: susp = SIGTSTP)
  ishlar: {
    panel: 'qobiq (shell) ishlar jadvali',
    qadamlar: [
      {
        cmd: ['sleep 100 &', 'sleep 200 &', 'jobs -l'],
        chiqish: '[1]-   179 Running                 sleep 100 &\n[2]+   180 Running                 sleep 200 &',
        holat: [{ k: '1', yol: '%1  sleep 100', qiymat: 'Running — fonda' }, { k: '2', yol: '%2  sleep 200', qiymat: 'Running — fonda (+ joriy)' }, { k: 't', yol: 'terminal', qiymat: 'bo‘sh — buyruq yozish mumkin', belgi: 'yangi' }],
        izoh: '`&` bilan ishga tushgan buyruqlar fonda ishlaydi, terminal darhol bo‘shaydi.',
      },
      {
        cmd: ['kill -TSTP %1   # terminalda: Ctrl+Z'],
        chiqish: '[1]+  Stopped                 sleep 100',
        holat: [{ k: '1', yol: '%1  sleep 100', qiymat: 'Stopped — ps’da T', belgi: 'ochiq' }, { k: '2', yol: '%2  sleep 200', qiymat: 'Running' }],
        izoh: 'SIGTSTP ishni to‘xtatib turadi: jarayon tirik, lekin hech narsa qilmayapti.',
      },
      {
        cmd: ['bg %1'],
        chiqish: '[1]+ sleep 100 &',
        holat: [{ k: '1', yol: '%1  sleep 100', qiymat: 'Running — yana fonda', belgi: 'yangi' }, { k: '2', yol: '%2  sleep 200', qiymat: 'Running' }],
        izoh: '`bg` to‘xtatilgan ishni fonda davom ettiradi.',
      },
      {
        cmd: ['kill %1 %2', 'sleep 3 &', 'fg'],
        chiqish: '[3] 191\n[1]   Terminated              sleep 100\n[2]   Terminated              sleep 200\nsleep 3',
        holat: [{ k: '1', yol: '%1, %2', qiymat: 'Terminated', belgi: 'yoq' }, { k: '3', yol: '%3  sleep 3', qiymat: 'oldingi planda', belgi: 'ochiq' }, { k: 't', yol: 'terminal', qiymat: 'band — sleep tugashini kutyapti', belgi: 'xato' }],
        izoh: '`fg` ishni oldingi planga oladi: u tugaguncha terminal band, Ctrl+C unga yetadi.',
      },
    ],
  },

  // 30-bob: SSH to'satdan uzilganda va oddiy exit'da qaysi jarayonlar qoladi (Ubuntu 26.04 VPS tajribasi)
  uzilish: {
    panel: 'VPS’dagi jarayonlar',
    qadamlar: [
      {
        cmd: ['sleep 1001 &', 'nohup sleep 1002 >/dev/null 2>&1 &', 'sleep 1003 &', 'disown', 'tmux new-session -d -s ish "sleep 1004"'],
        holat: [{ k: 'a', yol: 'sleep 1001', qiymat: 'oddiy fon ishi' }, { k: 'b', yol: 'sleep 1002', qiymat: 'nohup: SIGHUP e’tiborsiz' }, { k: 'c', yol: 'sleep 1003', qiymat: 'disown: jadvaldan chiqarilgan' }, { k: 'd', yol: 'sleep 1004', qiymat: 'tmux sessiyasida' }],
        izoh: 'Bitta SSH sessiyada to‘rt xil usulda ishga tushirdik.',
      },
      {
        cmd: ['# ulanish to‘satdan uzildi (noutbukda ssh: kill -9)'],
        holat: [{ k: 's', yol: 'login qobig‘i (shell)', qiymat: 'SIGHUP oldi → barcha ishlariga yubordi', belgi: 'ochiq' }],
        izoh: 'Terminal yo‘qoldi. bash SIGHUP oladi va chiqishdan oldin uni o‘zining ishlar jadvalidagi har bir ishga qayta yuboradi.',
      },
      {
        cmd: ['ps -o pid,stat,cmd -C sleep; tmux ls'],
        chiqish: '    PID STAT CMD\n  70219 S    sleep 1002\n  70223 S    sleep 1003\n  70233 Ss+  sleep 1004\nish: 1 windows (created Sat Nov  7 07:29:51 2026)',
        holat: [{ k: 'a', yol: 'sleep 1001', qiymat: 'SIGHUP → tugadi', belgi: 'xato' }, { k: 'b', yol: 'sleep 1002', qiymat: 'nohup — tirik', belgi: 'yangi' }, { k: 'c', yol: 'sleep 1003', qiymat: 'disown — tirik', belgi: 'yangi' }, { k: 'd', yol: 'sleep 1004', qiymat: 'tmux — tirik', belgi: 'yangi' }],
        izoh: 'Faqat oddiy `&` bilan ishga tushgani to‘xtadi.',
      },
      {
        cmd: ['# xuddi shu, lekin oddiy exit bilan', 'ps -o pid,stat,cmd -C sleep'],
        chiqish: '    PID STAT CMD\n  70317 S    sleep 1001\n  70321 S    sleep 1002\n  70325 S    sleep 1003\n  70335 Ss+  sleep 1004',
        holat: [{ k: 'a', yol: 'sleep 1001', qiymat: 'tirik — huponexit off', belgi: 'ochiq' }, { k: 'b', yol: 'sleep 1002', qiymat: 'tirik' }, { k: 'c', yol: 'sleep 1003', qiymat: 'tirik' }, { k: 'd', yol: 'sleep 1004', qiymat: 'tirik' }],
        izoh: 'Oddiy `exit` da SIGHUP yuborilmadi (`huponexit` o‘chiq, logind `KillUserProcesses=no`). Lekin ulanish qachon uzilishini bilmaysiz — uzoq ishni nohup, tmux yoki systemd bilan ishga tushiring.',
      },
    ],
  },

  // 31-bob: cgroup xotira cheklovida OOM (trenajor, bob blokidagi haqiqiy chiqishlar)
  oom: {
    panel: 'ochkoz.service (MemoryMax=50M)',
    qadamlar: [
      {
        cmd: [`systemd-run --wait --unit=ochkoz -p MemoryMax=50M perl -e 'my @a; while (1) { push @a, "a" x (1024*1024) }'`],
        chiqish: 'Running as unit: ochkoz.service',
        holat: [{ k: 'm', yol: 'xotira', qiymat: '1 MB … 10 MB … 30 MB … — o‘syapti', belgi: 'ochiq' }, { k: 'l', yol: 'chegara', qiymat: 'MemoryMax=50M' }],
        izoh: 'Dastur xotirani to‘xtamay egallaydi. systemd uni 50 MB cheklangan guruhda (cgroup) ishga tushirdi — server xavfsiz.',
      },
      {
        cmd: ['# xotira chegaraga yetdi'],
        chiqish: '[   69.861790] Memory cgroup out of memory: Killed process 246 (perl) total-vm:59900kB, anon-rss:51032kB, file-rss:2076kB, shmem-rss:0kB, UID:0 pgtables:72kB oom_score_adj:0',
        holat: [{ k: 'm', yol: 'xotira', qiymat: 'anon-rss ≈ 51 MB — chegaradan oshdi', belgi: 'xato' }, { k: 'o', yol: 'OOM killer', qiymat: 'perl’ni tanladi → SIGKILL', belgi: 'xato' }],
        izoh: 'Yadro xotirani bo‘shata olmadi va OOM killer’ni ishga tushirdi: cheklov doirasidagi jarayon SIGKILL bilan o‘ldirildi.',
      },
      {
        cmd: ['# systemd natijani yozdi'],
        chiqish: 'Finished with result: oom-kill\nMain processes terminated with: code=killed/status=KILL',
        holat: [{ k: 's', yol: 'ochkoz.service', qiymat: "Failed with result 'oom-kill'", belgi: 'xato' }, { k: 'k', yol: 'chiqish', qiymat: 'status=9/KILL → kod 137 (29-bob)' }],
        izoh: 'Ilova "o‘zi o‘chib qolgandek" ko‘rinadi. Sababini systemd va yadro jurnali aytib turibdi.',
      },
      {
        cmd: ["journalctl -k --no-pager -o cat | grep 'out of memory'"],
        chiqish: 'Memory cgroup out of memory: Killed process 246 (perl) total-vm:59900kB, anon-rss:51032kB, file-rss:2076kB, shmem-rss:0kB, UID:0 pgtables:72kB oom_score_adj:0',
        holat: [{ k: 'j', yol: 'yadro jurnali', qiymat: 'OOM izi saqlandi', belgi: 'yangi' }],
        izoh: 'Ilova kutilmaganda to‘xtasa, birinchi tekshiriladigan joy — `journalctl -k`.',
      },
    ],
  },

  // 33-bob: VPS yonish bosqichlari (Ubuntu 26.04; qayta yondirishdan keyingi haqiqiy chiqishlar)
  yonish: {
    panel: 'boshqaruv kimda',
    qadamlar: [
      {
        cmd: ['[ -d /sys/firmware/efi ] && echo UEFI || echo "BIOS (legacy)"'],
        chiqish: 'UEFI',
        holat: [{ k: '1', yol: '1. Mikrodastur', qiymat: 'UEFI — NVRAM’dagi sozlama bo‘yicha yuklovchini topadi', belgi: 'ochiq' }, { k: '2', yol: '2. Yuklovchi', qiymat: 'kutmoqda' }, { k: '3', yol: '3. initramfs', qiymat: 'kutmoqda' }, { k: '4', yol: '4. systemd', qiymat: 'kutmoqda' }],
        izoh: 'Tok berildi. UEFI ishga tushadi va yuklovchini (GRUB) ishga tushiradi.',
      },
      {
        cmd: ['cat /proc/cmdline'],
        chiqish: 'BOOT_IMAGE=/boot/vmlinuz-7.0.0-42-generic root=UUID=caaa98a8-869e-4008-a15d-d75d96af40f7 ro console=tty1',
        holat: [{ k: '1', yol: '1. Mikrodastur', qiymat: 'tugadi' }, { k: '2', yol: '2. GRUB', qiymat: 'vmlinuz va initrd.img’ni xotiraga yukladi', belgi: 'ochiq' }, { k: '3', yol: '3. initramfs', qiymat: 'kutmoqda' }, { k: '4', yol: '4. systemd', qiymat: 'kutmoqda' }],
        izoh: 'GRUB yadroni qaysi parametrlar bilan ishga tushirganini yadro `/proc/cmdline` da saqlaydi: qaysi yadro, asosiy disk qaysi.',
      },
      {
        cmd: ['systemd-analyze'],
        chiqish: 'Startup finished in 1.408s (kernel) + 2.882s (initrd) + 6.857s (userspace) = 11.148s \nmulti-user.target reached after 6.784s in userspace.',
        holat: [{ k: '2', yol: '2. GRUB', qiymat: 'tugadi' }, { k: '3', yol: '3. yadro + initramfs', qiymat: '1.4 s + 2.9 s — asosiy diskni topib, ulashga tayyorladi', belgi: 'ochiq' }, { k: '4', yol: '4. systemd (PID 1)', qiymat: '6.9 s — unit’larni parallel ishga tushirdi', belgi: 'yangi' }],
        izoh: '`systemd-analyze` uch bosqich vaqtini alohida ko‘rsatadi: kernel, initrd, userspace.',
      },
      {
        cmd: ['systemd-analyze critical-chain --no-pager | head -n 7'],
        chiqish: 'multi-user.target @6.784s\n└─tuned.service @6.062s +720ms\n  └─polkit.service @6.732s +123ms\n    └─basic.target @4.110s\n      └─sockets.target @4.107s',
        holat: [{ k: '4', yol: '4. systemd', qiymat: 'multi-user.target — tizim tayyor', belgi: 'yangi' }, { k: 't', yol: 'default.target', qiymat: '→ multi-user.target (/etc dagi havola)' }],
        izoh: 'systemd `default.target` ga yetguncha unit’larni bog‘liqliklari bo‘yicha ishga tushiradi. Server ishga tayyor.',
      },
    ],
  },

  // 34-bob: enable va start farqi — VPS'da tuned bilan, qayta yondirish orqali (haqiqiy chiqishlar)
  'enable-start': {
    panel: 'tuned.service',
    qadamlar: [
      {
        cmd: ['systemctl is-enabled tuned', 'systemctl is-active tuned'],
        chiqish: 'enabled\nactive',
        holat: [{ k: 'h', yol: 'hozir', qiymat: 'active — ishlayapti', belgi: 'yangi' }, { k: 'y', yol: 'yonishda', qiymat: 'enabled — havola bor', belgi: 'yangi' }],
        izoh: 'Odatiy holat: servis ishlayapti va yonishda ishga tushadi.',
      },
      {
        cmd: ['systemctl disable tuned', 'systemctl is-active tuned'],
        chiqish: "Removed '/etc/systemd/system/multi-user.target.wants/tuned.service'.\nactive",
        holat: [{ k: 'h', yol: 'hozir', qiymat: 'active — hali ishlayapti!', belgi: 'ochiq' }, { k: 'y', yol: 'yonishda', qiymat: 'disabled — havola o‘chirildi', belgi: 'xato' }],
        izoh: '`disable` faqat havolani o‘chirdi. Servis to‘xtamadi — tashqaridan hammasi joyida ko‘rinadi.',
      },
      {
        cmd: ['systemctl reboot', '# ... qayta yongandan keyin:', 'systemctl is-active tuned'],
        chiqish: 'inactive',
        holat: [{ k: 'h', yol: 'hozir', qiymat: 'inactive — ishga tushmadi', belgi: 'xato' }, { k: 'y', yol: 'yonishda', qiymat: 'disabled' }],
        izoh: 'Server qayta yondi: multi-user.target tuned’ni so‘ramadi — servis ishlamayapti. "O‘zi o‘chib qoldi" deyiladigan holat shu.',
      },
      {
        cmd: ['systemctl enable --now tuned'],
        chiqish: "Created symlink '/etc/systemd/system/multi-user.target.wants/tuned.service' → '/usr/lib/systemd/system/tuned.service'.",
        holat: [{ k: 'h', yol: 'hozir', qiymat: 'active', belgi: 'yangi' }, { k: 'y', yol: 'yonishda', qiymat: 'enabled', belgi: 'yangi' }],
        izoh: '`enable --now` — ikkalasi birga: havola yaratildi va servis darhol ishga tushdi.',
      },
    ],
  },

  // 35-bob: VPS'dagi salom.service hayoti (haqiqiy chiqishlar)
  servis: {
    panel: 'salom.service',
    qadamlar: [
      {
        cmd: ['systemctl daemon-reload', 'systemctl enable --now salom'],
        chiqish: "Created symlink '/etc/systemd/system/multi-user.target.wants/salom.service' → '/etc/systemd/system/salom.service'.",
        holat: [{ k: 'f', yol: '/etc/systemd/system/salom.service', qiymat: 'unit fayli o‘qildi' }, { k: 'y', yol: 'yonishda', qiymat: 'enabled', belgi: 'yangi' }, { k: 'p', yol: 'jarayon', qiymat: 'python3 … 8000 — ishga tushdi', belgi: 'yangi' }],
        izoh: 'systemd yangi unit’ni o‘qidi, yonishga qo‘shdi va darhol ishga tushirdi.',
      },
      {
        cmd: ['ps -o user,pid,cmd -p $(systemctl show -p MainPID --value salom)'],
        chiqish: 'USER         PID CMD\nsalom       1380 /usr/bin/python3 -m http.server 8000 --bind 127.0.0.1',
        holat: [{ k: 'p', yol: 'jarayon (PID 1380)', qiymat: 'salom foydalanuvchisi nomidan', belgi: 'yangi' }, { k: 'e', yol: '${PORT}', qiymat: '8000 — /etc/salom.env dan' }],
        izoh: '`User=` va `EnvironmentFile=` ishladi: ilova root emas, `salom` nomidan, port fayldagi sozlamadan.',
      },
      {
        cmd: ['kill -9 $(systemctl show -p MainPID --value salom)'],
        chiqish: "salom.service: Main process exited, code=killed, status=9/KILL\nsalom.service: Failed with result 'signal'.\nsalom.service: Scheduled restart job, restart counter is at 1.",
        holat: [{ k: 'p', yol: 'jarayon (PID 1380)', qiymat: 'SIGKILL — o‘ldi', belgi: 'xato' }, { k: 'r', yol: 'Restart=on-failure', qiymat: 'qayta ishga tushirish rejalashtirildi', belgi: 'ochiq' }],
        izoh: 'Ilova kutilmaganda o‘ldi. `Restart=on-failure` buni xato deb bildi.',
      },
      {
        cmd: ['curl -s http://127.0.0.1:8000/'],
        chiqish: '<h1>Salom, systemd!</h1>',
        holat: [{ k: 'p', yol: 'jarayon (PID 1393)', qiymat: 'yangi — sahifani beryapti', belgi: 'yangi' }, { k: 'r', yol: 'restart counter', qiymat: '1' }],
        izoh: 'Hech kim aralashmasdan ilova qaytdi. `nohup` bilan ishga tushirilganida u yiqilganicha qolardi.',
      },
    ],
  },

  // 36-bob: drop-in qatlamlari (trenajor, cron; bob bloklaridagi haqiqiy chiqishlar)
  'drop-in': {
    panel: 'systemd nimani o‘qiydi',
    qadamlar: [
      {
        cmd: ['ps -o pid,ni,cmd -C cron'],
        chiqish: '  PID  NI CMD\n  151   0 /usr/sbin/cron -f',
        holat: [{ k: 'a', yol: '/lib/systemd/system/cron.service', qiymat: 'paketniki — tegmaymiz' }, { k: 'n', yol: 'natija', qiymat: 'Nice: 0' }],
        izoh: 'Faqat paket bergan unit fayli bor.',
      },
      {
        cmd: ["printf '[Service]\\nNice=10\\n' > /etc/systemd/system/cron.service.d/override.conf", 'systemctl daemon-reload', 'systemctl restart cron', 'ps -o pid,ni,cmd -C cron'],
        chiqish: '  PID  NI CMD\n  205  10 /usr/sbin/cron -f',
        holat: [{ k: 'a', yol: '/lib/systemd/system/cron.service', qiymat: '1. asosiy fayl' }, { k: 'o', yol: 'cron.service.d/override.conf', qiymat: '2. ustiga: Nice=10', belgi: 'yangi' }, { k: 'n', yol: 'natija', qiymat: 'Nice: 10', belgi: 'yangi' }],
        izoh: 'Drop-in asosiy fayldan KEYIN o‘qiladi va Nice= ni almashtiradi. Asosiy faylga tegilmadi.',
      },
      {
        cmd: ["printf '[Service]\\nExecStart=/usr/sbin/cron -f -L 15\\n' > .../buyruq.conf", 'systemctl daemon-reload', 'systemctl restart cron'],
        chiqish: 'Failed to restart cron.service: Unit cron.service has a bad unit file setting.',
        holat: [{ k: 'a', yol: 'cron.service', qiymat: 'ExecStart #1' }, { k: 'b', yol: 'buyruq.conf', qiymat: 'ExecStart #2 — QO‘SHILDI', belgi: 'xato' }, { k: 'n', yol: 'natija', qiymat: 'ikkita ExecStart — rad etildi', belgi: 'xato' }],
        izoh: 'ExecStart= ro‘yxat: drop-in’dagi qiymat almashtirmaydi, qo‘shiladi.',
      },
      {
        cmd: ["printf '[Service]\\nExecStart=\\nExecStart=/usr/sbin/cron -f -L 15\\n' > .../buyruq.conf", 'systemctl daemon-reload', 'systemctl restart cron', 'ps -o pid,ni,cmd -C cron'],
        chiqish: '  PID  NI CMD\n  292  10 /usr/sbin/cron -f -L 15',
        holat: [{ k: 'a', yol: 'cron.service', qiymat: 'ExecStart #1' }, { k: 'b', yol: 'buyruq.conf', qiymat: 'ExecStart= (tozalash) + yangi', belgi: 'yangi' }, { k: 'n', yol: 'natija', qiymat: 'cron -f -L 15, Nice: 10', belgi: 'yangi' }],
        izoh: 'Bo‘sh ExecStart= ro‘yxatni tozaladi. Ikkala drop-in ham ishlayapti.',
      },
      {
        cmd: ['systemctl revert cron', 'systemctl restart cron'],
        chiqish: '  PID  NI CMD\n  311   0 /usr/sbin/cron -f',
        holat: [{ k: 'a', yol: '/lib/systemd/system/cron.service', qiymat: 'yana yolg‘iz' }, { k: 'n', yol: 'natija', qiymat: 'Nice: 0 — paket holati' }],
        izoh: '`revert` drop-in papkasini o‘chirdi — hammasi paket bergan holatga qaytdi.',
      },
    ],
  },

  // 38-bob: Persistent=true — VPS tajribasi (eslatma.timer, OnCalendar=*:0/2; haqiqiy chiqishlar)
  persistent: {
    panel: 'eslatma.timer (har 2 daqiqada)',
    qadamlar: [
      {
        cmd: ['systemctl enable --now eslatma.timer', 'cat /var/log/eslatma.log'],
        chiqish: '08:54:00 ishladi',
        holat: [{ k: 't', yol: 'timer', qiymat: 'yoqilgan', belgi: 'yangi' }, { k: 'a', yol: '08:54:00', qiymat: 'ishladi', belgi: 'yangi' }, { k: 'b', yol: '08:56:00', qiymat: 'kutilmoqda' }],
        izoh: 'Timer vaqtida ishladi. Oxirgi ishga tushish vaqti diskda saqlandi (Persistent=true).',
      },
      {
        cmd: ['systemctl stop eslatma.timer', 'date +%T'],
        chiqish: '08:54:01',
        holat: [{ k: 't', yol: 'timer', qiymat: 'to‘xtatildi — server o‘chganga o‘xshash', belgi: 'xato' }, { k: 'a', yol: '08:54:00', qiymat: 'ishladi' }, { k: 'b', yol: '08:56:00', qiymat: 'kutilmoqda' }],
        izoh: 'Timer o‘chiq — xuddi server o‘chiq yoki qayta yonayotgandek.',
      },
      {
        cmd: ['sleep 150', 'date +%T', 'cat /var/log/eslatma.log'],
        chiqish: '08:56:31\n08:54:00 ishladi',
        holat: [{ k: 't', yol: 'timer', qiymat: 'o‘chiq' }, { k: 'a', yol: '08:54:00', qiymat: 'ishladi' }, { k: 'b', yol: '08:56:00', qiymat: 'O‘TIB KETDI — bajarilmadi', belgi: 'xato' }],
        izoh: '08:56:00 dagi ish vaqti o‘tdi, lekin timer o‘chiq edi — hech narsa bo‘lmadi.',
      },
      {
        cmd: ['systemctl start eslatma.timer', 'cat /var/log/eslatma.log'],
        chiqish: '08:54:00 ishladi\n08:56:31 ishladi',
        holat: [{ k: 't', yol: 'timer', qiymat: 'yoqildi', belgi: 'yangi' }, { k: 'a', yol: '08:54:00', qiymat: 'ishladi' }, { k: 'b', yol: '08:56:00', qiymat: '08:56:31 da DARHOL bajarildi', belgi: 'yangi' }],
        izoh: 'Timer yoqilishi bilan systemd o‘tkazib yuborilgan ishni bajardi. Persistent=false bo‘lsa, keyingi navbatni (08:58) kutardi.',
      },
    ],
  },

  // 40-bob: 127.0.0.1 va 0.0.0.0 — trenajor (haqiqiy chiqishlar)
  bind: {
    panel: 'Kompyuter manzillari va kutayotgan servislar',
    qadamlar: [
      {
        cmd: ['ip addr add 192.0.2.10/32 dev lo'],
        chiqish: '',
        holat: [{ k: 'a', yol: '127.0.0.1', qiymat: 'loopback' }, { k: 'b', yol: '192.0.2.10', qiymat: 'qo‘shildi', belgi: 'yangi' }],
        izoh: 'Kompyuterda endi ikkita IPv4 manzil bor. Haqiqiy serverda ikkinchisi — internetdagi ochiq IP.',
      },
      {
        cmd: ['systemd-socket-activate -l 127.0.0.1:8081 -a --inetd cat 2>/dev/null &', 'systemd-socket-activate -l 0.0.0.0:8082 -a --inetd cat 2>/dev/null &', 'ss -tln'],
        chiqish: 'LISTEN     0          0                    0.0.0.0:8082                0.0.0.0:*                    \nLISTEN     0          0                  127.0.0.1:8081                0.0.0.0:*                    ',
        holat: [{ k: 'a', yol: '127.0.0.1', qiymat: 'loopback' }, { k: 'b', yol: '192.0.2.10', qiymat: 'ikkinchi manzil' }, { k: 's1', yol: '127.0.0.1:8081', qiymat: 'faqat loopback’da kutadi', belgi: 'yangi' }, { k: 's2', yol: '0.0.0.0:8082', qiymat: 'barcha manzillarda kutadi', belgi: 'yangi' }],
        izoh: 'Ikkita servis: biri faqat 127.0.0.1 da, ikkinchisi kompyuterning barcha manzillarida (0.0.0.0).',
      },
      {
        cmd: ['echo salom > /dev/tcp/192.0.2.10/8082 && echo ulandi'],
        chiqish: 'ulandi',
        holat: [{ k: 's1', yol: '127.0.0.1:8081', qiymat: 'faqat loopback’da kutadi' }, { k: 's2', yol: '0.0.0.0:8082', qiymat: '192.0.2.10 orqali ulandi', belgi: 'yangi' }],
        izoh: '0.0.0.0 — kompyuterning har qanday manzili, jumladan 192.0.2.10.',
      },
      {
        cmd: ['echo salom > /dev/tcp/192.0.2.10/8081 && echo ulandi'],
        chiqish: '-bash: connect: Connection refused\n-bash: /dev/tcp/192.0.2.10/8081: Connection refused',
        holat: [{ k: 's1', yol: '127.0.0.1:8081', qiymat: '192.0.2.10 orqali — rad etildi', belgi: 'xato' }, { k: 's2', yol: '0.0.0.0:8082', qiymat: '192.0.2.10 orqali ulandi' }],
        izoh: '127.0.0.1 dagi servis boshqa manzilga kelgan ulanishni qabul qilmaydi. Ichki servislar (baza, Redis) aynan shunday bo‘lishi kerak.',
      },
    ],
  },

  // 42-bob: nom aniqlash zanjiri — VPS tajribasi (haqiqiy chiqishlar; hosts: files dns, resolv.conf → 127.0.0.53)
  nom: {
    panel: 'sinov.lan nomi qayerdan topiladi',
    qadamlar: [
      {
        cmd: ["echo '192.0.2.30 sinov.lan' >> /etc/hosts"],
        chiqish: '',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'sinov.lan → 192.0.2.30', belgi: 'yangi' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'o‘zgarishni hali ko‘rmagan' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: '/etc/hosts ni bilmaydi' }],
        izoh: 'Faylga yozuv qo‘shildi.',
      },
      {
        cmd: ['getent hosts sinov.lan'],
        chiqish: '192.0.2.30      sinov.lan',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'sinov.lan → 192.0.2.30 — topildi', belgi: 'yangi' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'so‘ralmadi' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'so‘ralmadi' }],
        izoh: 'NSS tartibi: files birinchi. Fayl darhol o‘qiladi — DNS’ga ehtiyoj yo‘q.',
      },
      {
        cmd: ['dig +short sinov.lan'],
        chiqish: '',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'sinov.lan → 192.0.2.30' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'hali ko‘rmagan — bo‘sh javob', belgi: 'xato' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'so‘ralmadi' }],
        izoh: 'dig NSS’ni emas, DNS’ni so‘raydi: so‘rov 127.0.0.53 ga ketdi.',
      },
      {
        cmd: ['sleep 3', 'dig +short sinov.lan'],
        chiqish: '192.0.2.30',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'sinov.lan → 192.0.2.30' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'endi /etc/hosts dan beradi', belgi: 'yangi' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'so‘ralmadi' }],
        izoh: 'systemd-resolved /etc/hosts yozuvlarini ham beradi; biz sinaganda bir necha soniyadan keyin.',
      },
      {
        cmd: ['dig @1.1.1.1 sinov.lan | grep status'],
        chiqish: ';; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 39526',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'sinov.lan → 192.0.2.30' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'chetlab o‘tildi' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'NXDOMAIN — bunday nom yo‘q', belgi: 'xato' }],
        izoh: 'Tashqi server bizning faylimizni bilmaydi.',
      },
      {
        cmd: ["sed -i '/sinov\\.lan/d' /etc/hosts", 'getent hosts sinov.lan'],
        chiqish: '192.0.2.30      sinov.lan',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'o‘chirildi — topilmadi', belgi: 'xato' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'hali eski javobni beradi', belgi: 'yangi' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'so‘ralmadi' }],
        izoh: 'files’da yo‘q → navbat dns’ga → 127.0.0.53 hali o‘zgarishni ko‘rmagan.',
      },
      {
        cmd: ['sleep 3', 'getent hosts sinov.lan; echo "kod: $?"'],
        chiqish: 'kod: 2',
        holat: [{ k: 'f', yol: '/etc/hosts', qiymat: 'yo‘q' }, { k: 'r', yol: 'systemd-resolved (127.0.0.53)', qiymat: 'yo‘q' }, { k: 't', yol: 'tashqi DNS (1.1.1.1)', qiymat: 'NXDOMAIN' }],
        izoh: 'Endi hech qayerda yo‘q: getent 2 kodini qaytardi.',
      },
    ],
  },

  // 43-bob: firewall va servis — VPS + tashqi kompyuter tajribasi (haqiqiy chiqishlar; IP 203.0.113.10 bilan yashirilgan)
  port: {
    panel: 'Tashqaridan VPS:8080 ga ulanish',
    qadamlar: [
      {
        cmd: ["curl -sS -o /dev/null -w '%{http_code}\\n' --max-time 5 http://203.0.113.10:8080/"],
        chiqish: 'curl: (28) Connection timed out after 5001 milliseconds\n000',
        holat: [{ k: 'f', yol: 'firewall (ufw)', qiymat: '8080 — deny (standart)', belgi: 'xato' }, { k: 's', yol: 'servis (ss -tln)', qiymat: '0.0.0.0:8080 — ishlayapti' }, { k: 'n', yol: 'natija', qiymat: 'javob yo‘q → 5 s kutib, kod 28', belgi: 'xato' }],
        izoh: 'deny paketni jim tashlab yuboradi: mijoz javob kutib qoladi.',
      },
      {
        cmd: ['ufw allow 8080/tcp', "curl -sS -o /dev/null -w '%{http_code}\\n' --max-time 5 http://203.0.113.10:8080/"],
        chiqish: '200',
        holat: [{ k: 'f', yol: 'firewall (ufw)', qiymat: '8080 — allow', belgi: 'yangi' }, { k: 's', yol: 'servis (ss -tln)', qiymat: '0.0.0.0:8080 — ishlayapti' }, { k: 'n', yol: 'natija', qiymat: '200 — ishladi', belgi: 'yangi' }],
        izoh: 'Port ochildi, servis ishlayapti — so‘rov o‘tdi.',
      },
      {
        cmd: ['systemctl stop sinov8080', "curl -sS -o /dev/null -w '%{http_code}\\n' --max-time 5 http://203.0.113.10:8080/"],
        chiqish: "curl: (7) Failed to connect to 203.0.113.10 port 8080 after 55 ms: Couldn't connect to server\n000",
        holat: [{ k: 'f', yol: 'firewall (ufw)', qiymat: '8080 — allow' }, { k: 's', yol: 'servis (ss -tln)', qiymat: '8080 yo‘q — to‘xtatildi', belgi: 'xato' }, { k: 'n', yol: 'natija', qiymat: '55 ms da rad etildi, kod 7', belgi: 'xato' }],
        izoh: 'Portda hech kim kutmayapti: server darhol rad etadi.',
      },
      {
        cmd: ['ufw delete allow 8080/tcp', 'ufw reject 8080/tcp', 'systemd-run --unit=sinov8080 -p User=nobody python3 -m http.server 8080 --directory /srv/bosh', "curl -sS -o /dev/null -w '%{http_code}\\n' --max-time 5 http://203.0.113.10:8080/"],
        chiqish: "curl: (7) Failed to connect to 203.0.113.10 port 8080 after 54 ms: Couldn't connect to server\n000",
        holat: [{ k: 'f', yol: 'firewall (ufw)', qiymat: '8080 — reject', belgi: 'xato' }, { k: 's', yol: 'servis (ss -tln)', qiymat: '0.0.0.0:8080 — ishlayapti', belgi: 'yangi' }, { k: 'n', yol: 'natija', qiymat: '54 ms da rad etildi, kod 7 — 3-holatdan farqi yo‘q', belgi: 'xato' }],
        izoh: 'reject ham darhol rad etadi. Tashqaridan "servis yo‘q" bilan farqlab bo‘lmaydi — serverda ss -tln kerak.',
      },
    ],
  },

  // 45-bob: SSH kalit bilan kirish — noutbuk (macOS) → VPS tajribasi (haqiqiy chiqishlar; IP'lar RFC 5737 manzillari bilan)
  ssh: {
    panel: 'Noutbuk → VPS: SSH kalit bilan',
    qadamlar: [
      {
        cmd: ['ls -l sinov_key sinov_key.pub'],
        chiqish: '-rw-------@ 1 mfsv  wheel  399 Nov  7 15:51 sinov_key\n-rw-r--r--@ 1 mfsv  wheel   93 Nov  7 15:51 sinov_key.pub',
        holat: [{ k: 'p', yol: 'noutbuk: sinov_key', qiymat: 'shaxsiy kalit (600) — hech qayerga bermaydi', belgi: 'yangi' }, { k: 'o', yol: 'noutbuk: sinov_key.pub', qiymat: 'ochiq kalit', belgi: 'yangi' }],
        izoh: 'ssh-keygen yaratgan juftlik: shaxsiy kalit (600) noutbukda qoladi, ochig‘i serverga boradi.',
      },
      {
        cmd: ['ls -la /home/demo/.ssh'],
        chiqish: 'total 12\ndrwx------ 2 demo demo 4096 Nov  7 13:51 .\ndrwxr-x--- 3 demo demo 4096 Nov  7 13:51 ..\n-rw------- 1 demo demo   93 Nov  7 13:51 authorized_keys',
        holat: [{ k: 'p', yol: 'noutbuk: sinov_key', qiymat: 'shaxsiy kalit' }, { k: 'a', yol: 'server: ~demo/.ssh/authorized_keys', qiymat: 'ochiq kalit qo‘yildi (600)', belgi: 'yangi' }],
        izoh: 'Ochiq kalit authorized_keys ga yozildi: .ssh — 700, fayl — 600. Server endi shu kalit egasini taniydi.',
      },
      {
        cmd: ["ssh -i sinov_key -o UserKnownHostsFile=./known_hosts -o StrictHostKeyChecking=accept-new demo@203.0.113.10 'whoami; hostname'"],
        chiqish: "Warning: Permanently added '203.0.113.10' (ED25519) to the list of known hosts.\ndemo\nlab",
        holat: [{ k: 'k', yol: 'noutbuk: known_hosts', qiymat: 'server kaliti yozildi', belgi: 'yangi' }, { k: 'a', yol: 'server: authorized_keys', qiymat: 'kalit mos keldi — kirildi', belgi: 'yangi' }],
        izoh: 'Ikki tomonlama tekshiruv: noutbuk serverni known_hosts bilan, server noutbukni authorized_keys bilan taniydi.',
      },
      {
        cmd: ['chmod 777 /home/demo/.ssh', "ssh -F config sinov 'whoami'"],
        chiqish: 'demo@203.0.113.10: Permission denied (publickey,password).',
        holat: [{ k: 'd', yol: 'server: ~demo/.ssh', qiymat: '777 — har kim yoza oladi', belgi: 'xato' }, { k: 'a', yol: 'server: authorized_keys', qiymat: 'ishonchsiz — rad etildi', belgi: 'xato' }],
        izoh: 'StrictModes: katalogga har kim yoza olsa, authorized_keys ga ham begona kalit qo‘shilishi mumkin edi.',
      },
      {
        cmd: ["journalctl -u ssh --since '-1min' --no-pager -o cat | grep demo"],
        chiqish: 'Accepted publickey for demo from 198.51.100.20 port 54272 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8\npam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)\npam_unix(sshd:session): session closed for user demo\nAccepted publickey for demo from 198.51.100.20 port 54273 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8\npam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)\npam_unix(sshd:session): session closed for user demo\nAccepted publickey for demo from 198.51.100.20 port 54274 ssh2: ED25519 SHA256:+n9d0gkib560HIfx3gTGw8di7ze+anYeSYeRO5WXzp8\npam_unix(sshd:session): session opened for user demo(uid=1000) by demo(uid=0)\npam_unix(sshd:session): session closed for user demo\nAuthentication refused: bad ownership or modes for directory /home/demo/.ssh\nConnection closed by authenticating user demo 198.51.100.20 port 54276 [preauth]',
        holat: [{ k: 'd', yol: 'server: ~demo/.ssh', qiymat: '777', belgi: 'xato' }, { k: 'l', yol: 'server logi', qiymat: 'sababi yozilgan', belgi: 'yangi' }],
        izoh: 'Mijoz faqat "rad etildi" deydi, sababi server logida.',
      },
      {
        cmd: ['chmod 700 /home/demo/.ssh', "ssh -F config sinov 'whoami'"],
        chiqish: 'demo',
        holat: [{ k: 'd', yol: 'server: ~demo/.ssh', qiymat: '700 — faqat egasi', belgi: 'yangi' }, { k: 'a', yol: 'server: authorized_keys', qiymat: 'kirildi', belgi: 'yangi' }],
        izoh: 'Ruxsat tuzatildi — kalit yana qabul qilindi.',
      },
    ],
  },

  // 47-bob: ssh -L tunnel — noutbuk (macOS) → VPS tajribasi (haqiqiy chiqishlar; VPS IP 203.0.113.10)
  tunnel: {
    panel: 'Noutbuk:9090 → SSH → VPS 127.0.0.1:8090',
    qadamlar: [
      {
        cmd: ['ss -tln | grep 8090'],
        chiqish: 'LISTEN 0      5          127.0.0.1:8090      0.0.0.0:*   ',
        holat: [{ k: 's', yol: 'VPS: ichki servis', qiymat: '127.0.0.1:8090 — faqat serverning o‘zidan', belgi: 'yangi' }, { k: 'n', yol: 'noutbuk: 9090', qiymat: 'yopiq' }],
        izoh: 'Servis faqat loopback’da kutadi — internetdan ko‘rinmaydi (VPS’da bajarildi).',
      },
      {
        cmd: ['curl -sS --max-time 5 http://203.0.113.10:8090/; echo "kod: $?"'],
        chiqish: 'curl: (28) Connection timed out after 5006 milliseconds\nkod: 28',
        holat: [{ k: 's', yol: 'VPS: ichki servis', qiymat: '127.0.0.1:8090' }, { k: 'n', yol: 'noutbuk → VPS:8090', qiymat: 'yetib bo‘lmaydi', belgi: 'xato' }],
        izoh: 'Noutbukdan to‘g‘ridan-to‘g‘ri ulanib bo‘lmaydi.',
      },
      {
        cmd: ['ssh -F config -f -N -L 9090:127.0.0.1:8090 lab', 'lsof -nP -iTCP:9090 -sTCP:LISTEN'],
        chiqish: 'COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME\nssh     39786 mfsv    5u  IPv6 0xb93896751b1ac09f      0t0  TCP [::1]:9090 (LISTEN)\nssh     39786 mfsv    6u  IPv4 0xd60de3454a668c6d      0t0  TCP 127.0.0.1:9090 (LISTEN)',
        holat: [{ k: 'n', yol: 'noutbuk: 9090', qiymat: 'ssh tinglayapti', belgi: 'yangi' }, { k: 't', yol: 'SSH kanali', qiymat: 'noutbuk ⇄ VPS:22 (shifrlangan)', belgi: 'yangi' }, { k: 's', yol: 'VPS: ichki servis', qiymat: '127.0.0.1:8090' }],
        izoh: 'Noutbukdagi 9090 ga kelgan ulanish SSH ichidan o‘tib, server tomonda 127.0.0.1:8090 ga ochiladi.',
      },
      {
        cmd: ['curl -s http://127.0.0.1:9090/'],
        chiqish: 'ichki servis',
        holat: [{ k: 'n', yol: 'noutbuk: 9090', qiymat: 'so‘rov qabul qilindi' }, { k: 't', yol: 'SSH kanali', qiymat: 'uzatdi' }, { k: 's', yol: 'VPS: ichki servis', qiymat: 'javob berdi', belgi: 'yangi' }],
        izoh: 'Yopiq servisga ulanildi, lekin uning porti internetga ochilmadi.',
      },
      {
        cmd: ["pkill -f 'ssh -F config -f -N -L 9090'", 'curl -sS http://127.0.0.1:9090/; echo "kod: $?"'],
        chiqish: "curl: (7) Failed to connect to 127.0.0.1 port 9090 after 1 ms: Couldn't connect to server\nkod: 7",
        holat: [{ k: 'n', yol: 'noutbuk: 9090', qiymat: 'yopildi', belgi: 'xato' }, { k: 't', yol: 'SSH kanali', qiymat: 'yo‘q' }],
        izoh: 'Tunnel yopildi — port ham yo‘qoldi.',
      },
    ],
  },
  // 48-bob: set -e siz skript cd xatosidan keyin davom etib, boshqa papkadagi "eski" ni o'chiradi
  'set-e': {
    panel: 'eski papkalar',
    qadamlar: [
      {
        cmd: ['mkdir eski'],
        chiqish: '',
        holat: [{ k: 'r', yol: '/root/eski', qiymat: 'yaratildi', belgi: 'yangi' }, { k: 's', yol: '/srv/ilova', qiymat: 'mavjud emas', belgi: 'yoq' }],
        izoh: 'Joriy papkada `eski` bor. Skript esa `/srv/ilova/eski` ni tozalashi kerak.',
      },
      {
        cmd: ['./tozala.sh'],
        chiqish: "./tozala.sh: 2: cd: can't cd to /srv/ilova\ntozalandi",
        holat: [{ k: 'r', yol: '/root/eski', qiymat: 'o‘chdi — noto‘g‘ri papka!', belgi: 'xato' }, { k: 's', yol: '/srv/ilova', qiymat: 'mavjud emas', belgi: 'yoq' }],
        izoh: '`cd` yiqildi, lekin skript davom etdi: `rm -rf eski` joriy papkada bajarildi va oxirida `tozalandi` deb yolg‘on xabar berdi.',
      },
      {
        cmd: ['ls -d eski'],
        chiqish: "ls: cannot access 'eski': No such file or directory",
        holat: [{ k: 'r', yol: '/root/eski', qiymat: 'yo‘q', belgi: 'xato' }],
        izoh: 'Kerakli papka emas, boshqasi o‘chib ketdi.',
      },
      {
        cmd: ['mkdir eski', "sed -i '2i set -e' tozala.sh", './tozala.sh; echo "kod: $?"'],
        chiqish: "./tozala.sh: 3: cd: can't cd to /srv/ilova\nkod: 2",
        holat: [{ k: 'r', yol: '/root/eski', qiymat: 'tegilmadi', belgi: 'yangi' }, { k: 's', yol: '/srv/ilova', qiymat: 'mavjud emas', belgi: 'yoq' }],
        izoh: '`set -e` bilan qobiq birinchi xatoda chiqdi: `rm` gacha yetmadi, chiqish kodi — `cd` niki (2).',
      },
      {
        cmd: ['ls -d eski'],
        chiqish: 'eski',
        holat: [{ k: 'r', yol: '/root/eski', qiymat: 'joyida', belgi: 'yangi' }],
        izoh: 'Papka saqlanib qoldi.',
      },
    ],
  },
  // 49-bob: glob har fayl nomini bitta so'z qiladi, $(ls) esa bo'sh joydan bo'ladi; mos fayl bo'lmasa glob o'zgarmaydi
  sikl: {
    panel: 'sikl qaysi qiymatlarni oldi',
    qadamlar: [
      {
        cmd: ['touch a.log "b c.log" eski.txt', 'ls'],
        chiqish: " a.log\t'b c.log'   eski.txt",
        holat: [{ k: '1', yol: 'a.log', qiymat: 'fayl' }, { k: '2', yol: 'b c.log', qiymat: 'bitta fayl, nomida bo‘sh joy' }],
        izoh: 'Ikkita `.log` fayl. Ikkinchisining nomida bo‘sh joy bor.',
      },
      {
        cmd: ['for f in *.log; do echo "[$f]"; done'],
        chiqish: '[a.log]\n[b c.log]',
        holat: [{ k: '1', yol: '1-aylanish', qiymat: 'a.log', belgi: 'yangi' }, { k: '2', yol: '2-aylanish', qiymat: 'b c.log', belgi: 'yangi' }],
        izoh: 'Glob: qobiq har fayl nomini butunligicha bitta so‘z qilib berdi — 2 ta aylanish.',
      },
      {
        cmd: ['for f in $(ls *.log); do echo "[$f]"; done'],
        chiqish: '[a.log]\n[b]\n[c.log]',
        holat: [{ k: '1', yol: '1-aylanish', qiymat: 'a.log' }, { k: '2', yol: '2-aylanish', qiymat: 'b — bunday fayl yo‘q', belgi: 'xato' }, { k: '3', yol: '3-aylanish', qiymat: 'c.log — bunday fayl yo‘q', belgi: 'xato' }],
        izoh: '`$(ls)` — matn. Qobiq uni bo‘sh joydan bo‘ldi: 3 ta aylanish, ikkitasi mavjud bo‘lmagan nomlar.',
      },
      {
        cmd: ['for f in *.csv; do echo "[$f]"; done'],
        chiqish: '[*.csv]',
        holat: [{ k: '1', yol: '1-aylanish', qiymat: '*.csv — naqshning o‘zi', belgi: 'xato' }],
        izoh: 'Mos fayl yo‘q — glob o‘zgarmay qoldi va sikl bir marta “*.csv” bilan aylandi.',
      },
      {
        cmd: ['for f in *.csv; do [ -e "$f" ] || continue; echo "[$f]"; done'],
        chiqish: '',
        holat: [{ k: '1', yol: '1-aylanish', qiymat: '[ -e ] → yo‘q → continue', belgi: 'yoq' }],
        izoh: 'Fayl bor-yo‘qligini tekshirib, yo‘q bo‘lsa keyingi aylanishga o‘tamiz — hech narsa bajarilmadi.',
      },
    ],
  },
  // 50-bob: set -e skriptni cp xatosida to'xtatadi, EXIT trap'i baribir vaqtinchalik faylni o'chiradi
  trap: {
    panel: 'vaqtincha.sh ichida nima bo‘ldi',
    qadamlar: [
      {
        cmd: ['chmod +x vaqtincha.sh'],
        chiqish: '',
        holat: [{ k: 'm', yol: 't=$(mktemp)', qiymat: '/tmp/tmp.XXXXXXXXXX yaratadi' }, { k: 't', yol: "trap '…' EXIT", qiymat: 'chiqishda: rm -f "$t"' }, { k: 'c', yol: 'cp "$t" /yoq/papka/', qiymat: 'bunday papka yo‘q' }, { k: 'e', yol: 'set -e', qiymat: 'birinchi xatoda chiqadi' }],
        izoh: 'Skriptdagi asosiy qatorlar. Trap fayl yaratilgan zahoti qo‘yiladi — tozalash qayerda chiqilsa ham ishlashi uchun.',
      },
      {
        cmd: ['./vaqtincha.sh; echo "kod: $?"'],
        chiqish: "vaqtinchalik fayl: 1 qator\ncp: cannot create regular file '/yoq/papka/': No such file or directory\ntozalandi\nkod: 1",
        holat: [{ k: 'm', yol: 't=$(mktemp)', qiymat: 'fayl yaratildi, 1 qator yozildi', belgi: 'yangi' }, { k: 'c', yol: 'cp "$t" /yoq/papka/', qiymat: 'xato — kod 1', belgi: 'xato' }, { k: 'e', yol: 'set -e', qiymat: 'skript to‘xtadi, oxirgi echo bajarilmadi', belgi: 'xato' }, { k: 't', yol: "trap '…' EXIT", qiymat: 'chiqishda ishladi: fayl o‘chirildi', belgi: 'yangi' }],
        izoh: '`cp` yiqildi → `set -e` chiqishni boshladi → chiqishdan oldin `EXIT` trap’i ishladi. Kod — `cp` niki (1).',
      },
      {
        cmd: ['ls /tmp/tmp.*'],
        chiqish: "ls: cannot access '/tmp/tmp.*': No such file or directory",
        holat: [{ k: 'm', yol: '/tmp/tmp.*', qiymat: 'qolmadi', belgi: 'yoq' }],
        izoh: 'Skript yarim yo‘lda yiqilgan bo‘lsa ham, `/tmp` da axlat qolmadi.',
      },
    ],
  },
  // 52-bob: bir servis — besh xil buzilish; status kodi bir xil bo'lishi mumkin, sabab jurnalda
  'servis-xato': {
    panel: 'ilova.service: kod → sabab',
    qadamlar: [
      {
        cmd: ["sed -i 's|ishga.sh|isga.sh|' /etc/systemd/system/ilova.service", 'systemctl daemon-reload', 'systemctl restart ilova; echo "kod: $?"'],
        chiqish: 'kod: 0',
        holat: [{ k: 'r', yol: 'systemctl restart', qiymat: 'kod 0 — lekin bu hech narsani isbotlamaydi', belgi: 'xato' }, { k: 's', yol: 'status', qiymat: 'failed, status=203/EXEC', belgi: 'xato' }],
        izoh: '`Type=simple`: systemd jarayon yaratilishi bilan qaytdi. Haqiqiy holat — `status` da.',
      },
      {
        cmd: ['journalctl -u ilova -n 4 --no-pager -o cat'],
        chiqish: 'ilova.service: Failed to locate executable /opt/ilova/isga.sh: No such file or directory\nilova.service: Failed at step EXEC spawning /opt/ilova/isga.sh: No such file or directory\nilova.service: Main process exited, code=exited, status=203/EXEC\nilova.service: Failed with result \'exit-code\'.',
        holat: [{ k: 's', yol: 'status', qiymat: '203/EXEC' }, { k: 'j', yol: 'sabab (jurnal)', qiymat: 'fayl yo‘q: isga.sh', belgi: 'yangi' }],
        izoh: 'Jurnal aniq aytdi: yo‘lda harf xato.',
      },
      {
        cmd: ['chmod 644 /opt/ilova/ishga.sh', 'systemctl restart ilova', 'journalctl -u ilova -n 3 --no-pager -o cat'],
        chiqish: 'ilova.service: Failed at step EXEC spawning /opt/ilova/ishga.sh: Permission denied\nilova.service: Main process exited, code=exited, status=203/EXEC\nilova.service: Failed with result \'exit-code\'.',
        holat: [{ k: 's', yol: 'status', qiymat: '203/EXEC — avvalgidek' }, { k: 'j', yol: 'sabab (jurnal)', qiymat: 'Permission denied: x ruxsati yo‘q', belgi: 'yangi' }],
        izoh: 'Kod bir xil, sabab boshqa. Shuning uchun jurnalsiz xulosa qilib bo‘lmaydi.',
      },
      {
        cmd: ['chmod 600 /etc/ilova.conf', 'systemctl restart ilova', 'journalctl -u ilova -n 3 --no-pager -o cat'],
        chiqish: '/opt/ilova/ishga.sh: 3: .: cannot open /etc/ilova.conf: Permission denied\nilova.service: Main process exited, code=exited, status=2/INVALIDARGUMENT\nilova.service: Failed with result \'exit-code\'.',
        holat: [{ k: 's', yol: 'status', qiymat: '2 — skriptning o‘z kodi' }, { k: 'j', yol: 'sabab (jurnal)', qiymat: 'User=ilova faylni o‘qiy olmaydi (600, root)', belgi: 'yangi' }],
        izoh: 'Servis root emas, `User=ilova` nomidan ishlaydi — ruxsatni shu foydalanuvchi uchun tekshiring.',
      },
      {
        cmd: ["echo 'PORT = 8080' > /etc/ilova.conf", 'systemctl restart ilova', 'journalctl -u ilova -n 3 --no-pager -o cat'],
        chiqish: '/opt/ilova/ishga.sh: 1: /etc/ilova.conf: PORT: not found\nilova.service: Main process exited, code=exited, status=127/n/a\nilova.service: Failed with result \'exit-code\'.',
        holat: [{ k: 's', yol: 'status', qiymat: '127 — buyruq topilmadi' }, { k: 'j', yol: 'sabab (jurnal)', qiymat: 'sozlamada sintaksis xatosi: PORT = 8080', belgi: 'yangi' }],
        izoh: '`=` atrofidagi bo‘sh joy `PORT` ni buyruqqa aylantirdi.',
      },
      {
        cmd: ['systemd-socket-activate -l 8080 cat >/dev/null 2>&1 &', 'systemctl restart ilova', 'journalctl -u ilova -n 3 --no-pager -o cat'],
        chiqish: "Failed to open '8080': Address already in use\nilova.service: Main process exited, code=exited, status=1/FAILURE\nilova.service: Failed with result 'exit-code'.",
        holat: [{ k: 's', yol: 'status', qiymat: '1' }, { k: 'j', yol: 'sabab (jurnal)', qiymat: 'port band → ss -tlnp kimligini ko‘rsatadi', belgi: 'yangi' }],
        izoh: 'Port boshqa jarayonda. Keyingi qadam — `ss -tlnp | grep 8080`.',
      },
    ],
  },
  // 53-bob: VPS'da uch resursni bo'g'ib, vmstat va PSI'dagi belgilar (haqiqiy VPS chiqishlari)
  sekin: {
    keng: true,
    panel: 'qaysi resurs? (VPS, 1 CPU)',
    qadamlar: [
      {
        cmd: ['vmstat 2 3'],
        chiqish: "procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu\n 0  0      0 802064  42776 638904    0    0    10    23  140    0  1  0 99  0  0  0\n 0  0      0 802064  42776 638944    0    0     0     0  135   66  0  1 99  0  0  0\n 0  0      0 802064  42776 638944    0    0     0     0  123   60  0  0 100  0  0  0",
        holat: [{ k: 'c', yol: 'CPU', qiymat: 'id 99 — bo‘sh' }, { k: 'm', yol: 'xotira', qiymat: 'swap faol emas (si/so 0)' }, { k: 'd', yol: 'disk', qiymat: 'wa 0, b 0' }],
        izoh: 'Tinch holat. Birinchi qator — yonganidan beri o‘rtacha, keyingilariga qarang.',
      },
      {
        cmd: ['yes > /dev/null & yes > /dev/null &', 'vmstat 2 3', 'cat /proc/pressure/cpu'],
        chiqish: "procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu\n 3  0      0 785180  42792 638952    0    0    10    23  141    0  1  1 99  0  0  0\n 2  0      0 787336  42792 638952    0    0     0     0 1089 1050  3 97  0  0  0  0\n 2  0      0 787376  42792 638952    0    0     0   492 1155 1052  3 98  0  0  0  0\nsome avg10=84.83 avg60=27.24 avg300=6.44 total=162364679\nfull avg10=0.00 avg60=0.00 avg300=0.00 total=0",
        holat: [{ k: 'c', yol: 'CPU', qiymat: 'r 2 > 1 CPU, id 0, cpu some 85%', belgi: 'xato' }, { k: 'm', yol: 'xotira', qiymat: 'normal' }, { k: 'd', yol: 'disk', qiymat: 'wa 0' }],
        izoh: 'CPU yetmayapti: ishga tayyor jarayonlar CPU sonidan ko‘p, bo‘sh vaqt yo‘q.',
      },
      {
        cmd: ['python3 -c "import time; a = bytearray(1300 * 1024 * 1024); time.sleep(40)" &', 'vmstat 2 4', 'cat /proc/pressure/memory'],
        chiqish: "procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu\n 1  0   1136 1269396    372 212348    0    0    10    23  141    0  1  1 99  0  0  0\n 0  0 109620 203052    196  75884   48 24742    80 24742  968  244 10 77 13  0  0  0\n 0  0 109492 203052    204  75936   66    0    96     0  129   66  0  0 100  0  0  0\n 0  0 109492 203052    212  75936    0    0     0    10  128   70  0  0 100  0  0  0\nsome avg10=4.51 avg60=1.33 avg300=0.34 total=1049811\nfull avg10=2.85 avg60=0.79 avg300=0.19 total=606252",
        holat: [{ k: 'c', yol: 'CPU', qiymat: 'normal' }, { k: 'm', yol: 'xotira', qiymat: 'so 24742 — swap’ga chiqarildi, kesh 76 MiB, memory full > 0', belgi: 'xato' }, { k: 'd', yol: 'disk', qiymat: 'wa 0' }],
        izoh: 'Xotira yetmayapti: yadro sahifalarni swap’ga chiqarib, keshni tashladi.',
      },
      {
        cmd: ['dd if=/dev/zero of=/root/katta bs=4k count=5000 oflag=dsync status=none &', 'vmstat 2 3', 'cat /proc/pressure/io'],
        chiqish: "procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu\n 0  1  46856 1378264   6560 129376    0    1    12    73  141    0  1  1 99  0  0  0\n 0  1  46856 1370452  13900 133076    0    0     0 11368 3251 6553  1  8  0 91  0  0\n 0  1  46856 1363396  15344 137296    0    0     2 12660 3593 7460  0 10  0 90  0  0\nsome avg10=40.06 avg60=9.42 avg300=2.13 total=21838295\nfull avg10=38.29 avg60=8.47 avg300=1.87 total=18312013",
        holat: [{ k: 'c', yol: 'CPU', qiymat: 'us+sy 9 — CPU ishlamayapti, kutyapti' }, { k: 'm', yol: 'xotira', qiymat: 'normal' }, { k: 'd', yol: 'disk', qiymat: 'b 1, wa 91, io full 38%', belgi: 'xato' }],
        izoh: 'Disk: CPU vaqtining 91% i disk javobini kutish. Yuklama o‘sadi, CPU esa bo‘sh.',
      },
    ],
  },
  // 54-bob: joy bor, lekin inode tugagan — df -h aldaydi, df -i va du --inodes haqiqatni ko'rsatadi
  disk: {
    keng: true,
    panel: '/mnt/kichik: 4 MB, 64 inode',
    qadamlar: [
      {
        cmd: ['touch /mnt/kichik/yana'],
        chiqish: "touch: cannot touch '/mnt/kichik/yana': No space left on device",
        holat: [{ k: 'j', yol: 'joy (df -h)', qiymat: '?' }, { k: 'i', yol: 'inode (df -i)', qiymat: '?' }, { k: 'x', yol: 'fayl yaratish', qiymat: 'No space left on device', belgi: 'xato' }],
        izoh: 'Fayl yaratib bo‘lmayapti. Birinchi savol: nima tugagan?',
      },
      {
        cmd: ['df -h /mnt/kichik'],
        chiqish: 'Filesystem      Size  Used Avail Use% Mounted on\nsinov           4.0M     0  4.0M   0% /mnt/kichik',
        holat: [{ k: 'j', yol: 'joy (df -h)', qiymat: '0% band — joy bor' }, { k: 'i', yol: 'inode (df -i)', qiymat: '?' }, { k: 'x', yol: 'fayl yaratish', qiymat: 'No space left on device', belgi: 'xato' }],
        izoh: '`df -h` bo‘yicha disk bo‘m-bo‘sh. Xato esa “joy yo‘q” deydi.',
      },
      {
        cmd: ['df -i /mnt/kichik'],
        chiqish: 'Filesystem     Inodes IUsed IFree IUse% Mounted on\nsinov              64    64     0  100% /mnt/kichik',
        holat: [{ k: 'j', yol: 'joy (df -h)', qiymat: '0% band' }, { k: 'i', yol: 'inode (df -i)', qiymat: '64/64 — 100%', belgi: 'xato' }, { k: 'x', yol: 'fayl yaratish', qiymat: 'inode yo‘q' }],
        izoh: 'Sabab: inode’lar tugagan. Har fayl, bo‘sh bo‘lsa ham, bitta inode oladi.',
      },
      {
        cmd: ['du --inodes -x /mnt/kichik | sort -n'],
        chiqish: '63\t/mnt/kichik/kesh\n64\t/mnt/kichik',
        holat: [{ k: 'k', yol: '/mnt/kichik/kesh', qiymat: '63 inode — aybdor', belgi: 'xato' }, { k: 'i', yol: 'inode (df -i)', qiymat: '100%' }],
        izoh: '`du --inodes` qaysi papka inode yeganini ko‘rsatdi.',
      },
      {
        cmd: ['rm -r /mnt/kichik/kesh', 'df -i /mnt/kichik'],
        chiqish: 'Filesystem     Inodes IUsed IFree IUse% Mounted on\nsinov              64     1    63    2% /mnt/kichik',
        holat: [{ k: 'k', yol: '/mnt/kichik/kesh', belgi: 'yoq' }, { k: 'i', yol: 'inode (df -i)', qiymat: '1/64 — 2%', belgi: 'yangi' }, { k: 'x', yol: 'fayl yaratish', qiymat: 'yana mumkin', belgi: 'yangi' }],
        izoh: 'Mayda fayllar o‘chdi — inode’lar qaytdi.',
      },
    ],
  },
  // Docker 01-bob: docker run ichida nima bo'ladi — Docker hujjati ("What is Docker?") dagi 6 qadam; buyruq bajarilmagan, chiqish yo'q
  'docker-run': {
    panel: 'docker run -i -t ubuntu /bin/bash',
    qadamlar: [
      {
        cmd: ['docker run -i -t ubuntu /bin/bash'],
        holat: [{ k: 'i', yol: 'image: ubuntu', qiymat: 'registry’dan yuklandi (docker pull kabi)', belgi: 'yangi' }],
        izoh: '1. Image kompyuterda bo‘lmasa, Docker uni sozlangan registry’dan yuklaydi.',
      },
      {
        cmd: ['docker run -i -t ubuntu /bin/bash'],
        holat: [{ k: 'i', yol: 'image: ubuntu', qiymat: 'faqat o‘qish uchun' }, { k: 'c', yol: 'konteyner', qiymat: 'yaratildi (docker container create kabi)', belgi: 'yangi' }],
        izoh: '2. Image’dan yangi konteyner yaratiladi.',
      },
      {
        cmd: ['docker run -i -t ubuntu /bin/bash'],
        holat: [{ k: 'i', yol: 'image: ubuntu', qiymat: 'faqat o‘qish uchun' }, { k: 'c', yol: 'konteyner', qiymat: 'yaratildi' }, { k: 'f', yol: 'yoziladigan qatlam', qiymat: 'konteyner o‘zgarishlari shu yerga', belgi: 'yangi' }],
        izoh: '3. Konteynerga oxirgi qatlam sifatida yoziladigan fayl tizimi ajratiladi — image o‘zgarmaydi.',
      },
      {
        cmd: ['docker run -i -t ubuntu /bin/bash'],
        holat: [{ k: 'c', yol: 'konteyner', qiymat: 'yaratildi' }, { k: 'f', yol: 'yoziladigan qatlam', qiymat: 'tayyor' }, { k: 'n', yol: 'tarmoq', qiymat: 'standart tarmoqqa ulandi, IP berildi', belgi: 'yangi' }],
        izoh: '4. Tarmoq interfeysi yaratiladi: konteyner standart tarmoqqa ulanadi va IP oladi.',
      },
      {
        cmd: ['docker run -i -t ubuntu /bin/bash'],
        holat: [{ k: 'c', yol: 'konteyner', qiymat: 'ishlayapti: /bin/bash', belgi: 'yangi' }, { k: 't', yol: 'terminal (-i -t)', qiymat: 'klaviatura konteynerga ulangan', belgi: 'yangi' }],
        izoh: '5. Konteyner ishga tushadi va /bin/bash bajariladi; -i va -t tufayli u terminalingizga ulangan.',
      },
      {
        cmd: ['exit'],
        holat: [{ k: 'c', yol: 'konteyner', qiymat: 'to‘xtadi, lekin o‘chirilmadi', belgi: 'ochiq' }, { k: 'i', yol: 'image: ubuntu', qiymat: 'o‘zgarmagan' }],
        izoh: '6. /bin/bash tugadi — konteyner to‘xtadi, lekin o‘chirilmadi: uni qayta ishga tushirish yoki o‘chirish mumkin.',
      },
    ],
  },
  // Docker 04-bob: konteyner hayot sikli (VPS, haqiqiy chiqishlar)
  hayot: {
    panel: 'konteyner holati (docker ps -a)',
    qadamlar: [
      {
        cmd: ["docker container create --name bosh alpine echo salom", "docker ps -a --filter name=bosh --format '{{.Names}} {{.Status}}'"],
        chiqish: "6593929c9695f91b79514bf719075092806ffa47797faa55bd310909fd9fdf6c\nbosh Exited (0) Less than a second ago",
        holat: [{ k: "h", yol: "bosh", qiymat: "Created — yaratildi, ishlamayapti", belgi: "ochiq" }],
        izoh: "`create` — faqat yaratish. Fayl tizimi tayyor, jarayon yo‘q.",
      },
      {
        cmd: ["docker start -a bosh", "docker ps -a --filter name=bosh --format '{{.Names}} {{.Status}}'"],
        chiqish: "salom\nbosh Exited (0) Less than a second ago",
        holat: [{ k: "h", yol: "bosh", qiymat: "Exited (0) — buyruq tugadi" }],
        izoh: "`start` jarayonni ishga tushirdi; `echo` tugadi — konteyner ham to‘xtadi. Kod 0 — muvaffaqiyat.",
      },
      {
        cmd: ["time docker stop uxla", "docker ps -a --filter name=uxla --format \"{{.Names}} {{.Status}}\""],
        chiqish: "uxla\n\nreal\t0m10.295s\nuser\t0m0.019s\nsys\t0m0.017s\nuxla Exited (137) Less than a second ago",
        holat: [{ k: "h", yol: "uxla", qiymat: "Exited (137) — SIGKILL bilan", belgi: "xato" }],
        izoh: "`sleep` SIGTERM’ga javob bermadi — 10 soniyadan keyin SIGKILL (8-bob).",
      },
      {
        cmd: ["docker start uxla", "docker ps --filter name=uxla --format \"{{.Names}} {{.Status}}\""],
        chiqish: "uxla\nuxla Up Less than a second",
        holat: [{ k: "h", yol: "uxla", qiymat: "Up — o‘sha konteyner qayta ishlayapti", belgi: "yangi" }],
        izoh: "`start` yangi konteyner yaratmaydi — eskisini qayta ishga tushiradi.",
      },
      {
        cmd: ["docker rm uxla"],
        chiqish: "Error response from daemon: cannot remove container \"uxla\": container is running: stop the container before removing or force remove",
        holat: [{ k: "h", yol: "uxla", qiymat: "Up — o‘chirilmadi", belgi: "xato" }],
        izoh: "Ishlayotgan konteynerni oddiy `rm` o‘chirmaydi.",
      },
      {
        cmd: ["docker rm -f uxla"],
        chiqish: "uxla",
        holat: [{ k: "h", yol: "uxla", qiymat: "o‘chirildi", belgi: "yoq" }],
        izoh: "`-f` — majburan: to‘xtatib, o‘chiradi.",
      },
    ],
  },
  // Docker 05-bob: -p ufw'ni chetlab o'tadi; 127.0.0.1 bilan yopiq (VPS + noutbuk, haqiqiy chiqishlar, IP 203.0.113.10)
  'docker-port': {
    panel: 'VPS: ufw va 8080-port',
    qadamlar: [
      {
        cmd: ["ufw status | grep -E \"Status|8080\""],
        chiqish: "Status: active",
        holat: [{ k: "u", yol: "ufw", qiymat: "active, 8080 uchun qoida yo‘q" }, { k: "p", yol: "8080", qiymat: "?" }],
        izoh: "Firewall yoqilgan, 8080-port uchun ruxsat yo‘q.",
      },
      {
        cmd: ["docker run -d --name veb -p 8080:80 nginx:1.29 >/dev/null && echo ishga tushdi", "docker port veb"],
        chiqish: "Unable to find image 'nginx:1.29' locally\n1.29: Pulling from library/nginx\n8e9b53b630de: Pulling fs layer\n57fb71246055: Pulling fs layer\n38a7e44929f3: Pulling fs layer\n6e9f32fdbd61: Pulling fs layer\n382a36159731: Pulling fs layer\n20d41cd6829d: Pulling fs layer\n83742381311a: Pulling fs layer\n8e9b53b630de: Download complete\n83742381311a: Download complete\n6e9f32fdbd61: Download complete\n382a36159731: Download complete\n20d41cd6829d: Download complete\n57fb71246055: Download complete\n46ca9676efb5: Download complete\n94a543ead0f2: Download complete\n38a7e44929f3: Download complete\n57fb71246055: Pull complete\n38a7e44929f3: Pull complete\n83742381311a: Pull complete\n6e9f32fdbd61: Pull complete\n382a36159731: Pull complete\n20d41cd6829d: Pull complete\n8e9b53b630de: Pull complete\nDigest: sha256:1881968aff6f7cdcc4b888c00a11f4ce241ad7ec957e0cb4a9e19e93a3ff87ea\nStatus: Downloaded newer image for nginx:1.29\nishga tushdi\n80/tcp -> 0.0.0.0:8080\n80/tcp -> [::]:8080",
        holat: [{ k: "u", yol: "ufw", qiymat: "active, 8080 uchun qoida yo‘q" }, { k: "p", yol: "8080", qiymat: "0.0.0.0 va [::] — barcha manzillar", belgi: "ochiq" }],
        izoh: "Port barcha manzillarda publish qilindi.",
      },
      {
        cmd: ["curl -sS --max-time 5 -o /dev/null -w \"%{http_code}\\n\" http://203.0.113.10:8080/"],
        chiqish: "200",
        holat: [{ k: "u", yol: "ufw", qiymat: "chetlab o‘tildi", belgi: "xato" }, { k: "p", yol: "8080", qiymat: "internetdan ochiq", belgi: "xato" }],
        izoh: "Noutbukdan: 200. Docker’ning nat qoidasi ufw’dan oldin ishladi.",
      },
      {
        cmd: ["docker rm -f veb >/dev/null", "docker run -d --name veb -p 127.0.0.1:8080:80 nginx:1.29 >/dev/null && echo ishga tushdi", "docker port veb", "curl -sS -o /dev/null -w \"%{http_code}\\n\" http://127.0.0.1:8080/"],
        chiqish: "ishga tushdi\n80/tcp -> 127.0.0.1:8080\n200",
        holat: [{ k: "u", yol: "ufw", qiymat: "active" }, { k: "p", yol: "8080", qiymat: "faqat 127.0.0.1", belgi: "yangi" }],
        izoh: "Qayta: faqat loopback’da. Serverning o‘zidan — 200.",
      },
      {
        cmd: ["curl -sS --max-time 5 -o /dev/null -w \"%{http_code}\\n\" http://203.0.113.10:8080/"],
        chiqish: "curl: (28) Operation timed out after 5004 milliseconds with 0 bytes received\n000",
        holat: [{ k: "u", yol: "ufw", qiymat: "active" }, { k: "p", yol: "8080", qiymat: "tashqaridan yopiq", belgi: "yangi" }],
        izoh: "Noutbukdan javob yo‘q — port faqat serverning ichida.",
      },
    ],
  },
  // Docker 06-bob: yoziladigan qatlam konteyner bilan o'ladi, volume — qoladi (VPS, haqiqiy chiqishlar)
  volume: {
    panel: 'ma’lumot qayerda',
    qadamlar: [
      {
        cmd: ["docker run --name v1 alpine sh -c 'echo salom > /fayl.txt; cat /fayl.txt'"],
        chiqish: "salom",
        holat: [{ k: "c", yol: "konteyner v1", qiymat: "yozdi: /fayl.txt (yoziladigan qatlam)", belgi: "yangi" }],
        izoh: "Fayl konteynerning yoziladigan qatlamida.",
      },
      {
        cmd: ["docker rm v1", "docker run --rm alpine cat /fayl.txt"],
        chiqish: "v1\ncat: can't open '/fayl.txt': No such file or directory",
        holat: [{ k: "c", yol: "konteyner v1", qiymat: "o‘chirildi — qatlami bilan", belgi: "yoq" }, { k: "f", yol: "/fayl.txt", qiymat: "yo‘q", belgi: "xato" }],
        izoh: "Yangi konteyner image’dan toza boshlanadi — fayl yo‘qoldi.",
      },
      {
        cmd: ["docker volume create malumot", "docker run --rm -v malumot:/data alpine sh -c 'echo \"1-konteyner yozdi\" > /data/eslatma.txt'"],
        chiqish: "malumot",
        holat: [{ k: "v", yol: "volume: malumot", qiymat: "eslatma.txt yozildi", belgi: "yangi" }],
        izoh: "Volume — konteynerdan tashqarida, Docker boshqaradi.",
      },
      {
        cmd: ["docker run --rm -v malumot:/data alpine cat /data/eslatma.txt"],
        chiqish: "1-konteyner yozdi",
        holat: [{ k: "v", yol: "volume: malumot", qiymat: "eslatma.txt — joyida", belgi: "yangi" }, { k: "c", yol: "1-konteyner", qiymat: "allaqachon o‘chgan (--rm)", belgi: "yoq" }],
        izoh: "Boshqa konteyner o‘sha volume’ni uladi — ma’lumot saqlanib qolgan.",
      },
    ],
  },
}

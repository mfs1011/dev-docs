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
}

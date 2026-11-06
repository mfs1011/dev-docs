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
}

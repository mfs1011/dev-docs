// Linux trenajori terminali uchun xira maslahatlar: [{ add, full, d }] (Terminal.vue bilan bir xil shakl).
// Ro'yxatda faqat Linux kitobidagi va trenajorda haqiqatan o'rnatilgan buyruqlar bor
// (git, curl, vim yo'q — muharrir `vi`, ya'ni vim.tiny).

const BUYRUQ = {
  // fayl tizimi
  ls: 'fayllar ro‘yxati', cd: 'papkaga o‘tish', pwd: 'joriy papka', cat: 'fayl ichini ko‘rish',
  less: 'faylni sahifalab ko‘rish', head: 'fayl boshi', tail: 'fayl oxiri (-f — kuzatish)', touch: 'bo‘sh fayl yaratish',
  mkdir: 'papka yaratish', rmdir: 'bo‘sh papkani o‘chirish', cp: 'nusxa olish', mv: 'ko‘chirish yoki nomini o‘zgartirish',
  rm: 'o‘chirish', ln: 'havola yaratish (-s — symlink)', stat: 'fayl haqida batafsil (inode, vaqtlar)', file: 'fayl turi',
  tree: 'papka daraxti', find: 'fayl qidirish', readlink: 'havola qayerga ko‘rsatadi',
  // ruxsatlar
  chmod: 'ruxsatlarni o‘zgartirish', chown: 'egasini o‘zgartirish', chgrp: 'guruhini o‘zgartirish', umask: 'yangi fayllar ruxsati niqobi',
  getfacl: 'ACL ni ko‘rish', setfacl: 'ACL qo‘yish',
  // disk
  df: 'fayl tizimlarida bo‘sh joy (-i — inode)', du: 'papka hajmi', lsblk: 'disklar va bo‘limlar', findmnt: 'ulangan fayl tizimlari',
  mount: 'fayl tizimini ulash', umount: 'fayl tizimini uzish',
  // matn
  grep: 'matndan qator qidirish', sed: 'matnni almashtirish', awk: 'ustunlar bilan ishlash', cut: 'ustun kesib olish',
  sort: 'saralash', uniq: 'takrorlarni olib tashlash (-c — sanash)', wc: 'qator/so‘z soni', tr: 'belgilarni almashtirish',
  tee: 'oqimni faylga ham yozish', xargs: 'kirishdan argument yasash', diff: 'ikki faylni solishtirish',
  // qobiq
  echo: 'matn chiqarish', printf: 'formatlab chiqarish', env: 'muhit o‘zgaruvchilari', export: 'o‘zgaruvchini bola jarayonlarga berish',
  type: 'buyruq nima ekanini ko‘rsatish', which: 'buyruq faylining yo‘li', history: 'buyruqlar tarixi', alias: 'qisqa nom berish',
  man: 'qo‘llanma sahifasi', clear: 'ekranni tozalash', sleep: 'kutish', date: 'sana va vaqt', seq: 'sonlar ketma-ketligi',
  mktemp: 'vaqtinchalik fayl', basename: 'yo‘ldan fayl nomi', dirname: 'yo‘ldan papka', exit: 'chiqish',
  nano: 'oddiy matn muharriri', vi: 'vim muharriri (vim.tiny)', tmux: 'terminal multipleksori',
  // foydalanuvchilar
  id: 'foydalanuvchi va guruhlar', whoami: 'kimligim', sudo: 'boshqa foydalanuvchi (root) nomidan', su: 'foydalanuvchini almashtirish',
  adduser: 'foydalanuvchi qo‘shish', useradd: 'foydalanuvchi qo‘shish (past darajali)', usermod: 'foydalanuvchini o‘zgartirish',
  userdel: 'foydalanuvchini o‘chirish', passwd: 'parol', groups: 'guruhlar', getent: 'hisob bazalaridan o‘qish',
  // paketlar
  apt: 'paketlar (o‘rnatish, qidirish)', 'apt-cache': 'paket ma’lumotlari', 'apt-mark': 'paket belgilari (auto, hold)',
  dpkg: 'o‘rnatilgan paketlar (-l, -L, -S)',
  // jarayonlar va resurslar
  ps: 'jarayonlar ro‘yxati', pstree: 'jarayonlar daraxti', top: 'jarayonlar jonli', kill: 'jarayonga signal yuborish',
  pkill: 'nom bo‘yicha signal', pgrep: 'nom bo‘yicha PID topish', jobs: 'fondagi ishlar', bg: 'ishni fonda davom ettirish',
  fg: 'ishni oldingi rejimga olish', nice: 'past ustuvorlik bilan ishga tushirish', renice: 'ustuvorlikni o‘zgartirish',
  nohup: 'terminal yopilsa ham ishlashi uchun', free: 'xotira', uptime: 'ish vaqti va yuklama', vmstat: 'CPU, xotira, disk bir jadvalda',
  lsof: 'ochiq fayllar va portlar', fuser: 'faylni/portni kim ishlatyapti',
  // systemd
  systemctl: 'servislarni boshqarish', journalctl: 'jurnal (loglar)', 'systemd-analyze': 'yonish vaqti, unit tekshiruvi',
  'systemd-run': 'buyruqni vaqtinchalik servis qilib ishga tushirish', timedatectl: 'vaqt va vaqt zonasi', hostnamectl: 'xost nomi',
  crontab: 'rejali ishlar (cron)', logger: 'jurnalga yozuv qo‘shish',
  // tarmoq
  ip: 'IP manzil, interfeys, marshrut', ss: 'portlar va ulanishlar', ping: 'ulanishni tekshirish',
  // arxiv
  tar: 'arxivlash (-czf, -tzf, -xzf)', gzip: 'siqish',
}

// Ikkinchi so'z: eng ko'p ishlatiladigan qism buyruqlar
const QISM = {
  systemctl: {
    status: 'holati', start: 'ishga tushirish', stop: 'to‘xtatish', restart: 'qayta ishga tushirish', reload: 'sozlamani qayta o‘qitish',
    enable: 'yonishda ishga tushadigan qilish', disable: 'yonishda ishga tushmaydigan qilish', 'daemon-reload': 'unit fayllarini qayta o‘qish',
    'is-active': 'ishlayaptimi', 'is-enabled': 'yoqilganmi', 'list-units': 'unit’lar ro‘yxati', 'list-timers': 'timer’lar',
    cat: 'unit faylini ko‘rsatish', edit: 'drop-in yaratish', show: 'xossalar', mask: 'butunlay taqiqlash', unmask: 'taqiqni olish',
    'reset-failed': 'failed holatini tozalash', revert: 'drop-in’larni olib tashlash',
  },
  apt: {
    update: 'paketlar ro‘yxatini yangilash', upgrade: 'yangilash', install: 'o‘rnatish', remove: 'o‘chirish', purge: 'sozlamalari bilan o‘chirish',
    search: 'qidirish', show: 'paket haqida', policy: 'qaysi versiya, qaysi repodan', autoremove: 'keraksiz bog‘liqliklarni o‘chirish',
    list: 'ro‘yxat (--installed, --upgradable)',
  },
}

const prefiksli = (lugat, p) => Object.entries(lugat).filter(([k]) => k.startsWith(p) && k !== p)

export function linuxSuggest(line) {
  if (!line.trim()) return []
  const parts = line.split(' ')
  const last = parts[parts.length - 1]
  const head = parts.slice(0, -1).join(' ')
  const make = (items) => items.slice(0, 7).map(([k, d]) => ({ add: k.slice(last.length) + ' ', full: (head ? head + ' ' : '') + k + ' ', d }))
  if (parts.length === 1) return make(prefiksli(BUYRUQ, last))
  // "sudo systemctl ..." ham
  const buyruq = parts[0] === 'sudo' ? parts[1] : parts[0]
  const qadam = parts[0] === 'sudo' ? 3 : 2
  if (parts.length === 2 && parts[0] === 'sudo') return make(prefiksli(BUYRUQ, last))
  if (parts.length === qadam && QISM[buyruq]) return make(prefiksli(QISM[buyruq], last))
  return []
}

<script setup>
// 04-bob: katalog daraxti bo'ylab yurish. Tavsiflar — file-hierarchy(7) va FHS 3.0 (bob jadvali), "ichida" —
// trenajordagi haqiqiy `ls` chiqishi.
import { ref } from 'vue'

const PAPKALAR = [
  { yol: '/etc', nima: 'Shu tizimning sozlamalari', ichida: 'adduser.conf  alternatives  apparmor.d  apt  bash.bashrc  cron.d  crontab  debian_version  …  (97 ta)', sen: 'Ilovangiz sozlamasi: /etc/ilova/' },
  { yol: '/home', nima: 'Oddiy foydalanuvchilarning uy papkalari', ichida: '(trenajorda bo‘sh — faqat root bor)', sen: 'Servis foydalanuvchilari uchun emas' },
  { yol: '/root', nima: 'root’ning uy papkasi (/home dan tashqarida)', ichida: '.bashrc  .profile  .ssh', sen: '' },
  { yol: '/usr', nima: 'Paketlardan o‘rnatilgan dasturlar — qo‘lda o‘zgartirilmaydi', ichida: 'bin  games  include  lib  libexec  local  sbin  share  src', sen: '' },
  { yol: '/usr/local', nima: 'Administrator o‘zi o‘rnatgan dasturlar', ichida: 'bin  etc  games  include  lib  man  sbin  share  src', sen: 'Bitta bajariladigan fayl: /usr/local/bin/' },
  { yol: '/var', nima: 'O‘zgarib turadigan, saqlanadigan ma’lumot', ichida: 'backups  cache  lib  local  lock  log  mail  opt  run  spool  tmp', sen: '' },
  { yol: '/var/log', nima: 'Loglar', ichida: 'README  alternatives.log  apt  btmp  dpkg.log  faillog  journal  lastlog  private  wtmp', sen: 'Ilova logi: journal yoki /var/log/ilova/' },
  { yol: '/var/lib', nima: 'Dasturlarning doimiy ma’lumoti (bazalar)', ichida: 'apt  dbus  dpkg  man-db  misc  pam  private  shells.state  sudo  systemd  vim', sen: 'Ilova ma’lumoti: /var/lib/ilova/' },
  { yol: '/tmp', nima: 'Kichik vaqtinchalik fayllar; Debian 13/Ubuntu’da xotirada (tmpfs)', ichida: 'yonganda tozalanadi', sen: 'Katta fayl — /var/tmp ga' },
  { yol: '/run', nima: 'Ishlab turgan tizim ma’lumoti: socket, PID — xotirada', ichida: 'agetty.reload  credentials  crond.pid  dbus  lock  log  mount  shm  sudo  systemd  udev  user  utmp  …', sen: 'Socket: /run/ilova/' },
  { yol: '/opt', nima: 'Qo‘shimcha dastur paketlari (/opt/<paket>)', ichida: '(bo‘sh)', sen: 'Ilova kodi: /opt/ilova/' },
  { yol: '/srv', nima: 'Server tarqatadigan ma’lumot', ichida: '(bo‘sh)', sen: 'Sayt yoki API: /srv/ilova/' },
  { yol: '/dev', nima: 'Qurilmalar (yadro yaratadi)', ichida: 'null  zero  urandom  full  ttyS0  …', sen: '9-bob' },
  { yol: '/proc', nima: 'Jarayonlar va yadro ma’lumoti — diskda yo‘q', ichida: '1  10  11  …  loadavg  meminfo  self', sen: '9-bob' },
  { yol: '/bin', nima: 'Havola: → usr/bin (merged-/usr)', ichida: 'lrwxrwxrwx … bin -> usr/bin', sen: '' },
]
const tanlangan = ref(PAPKALAR[0])
</script>

<template>
  <div class="daraxt-anim">
    <ul class="da-royxat">
      <li v-for="p in PAPKALAR" :key="p.yol">
        <button type="button" :class="{ on: tanlangan.yol === p.yol, ich: p.yol.split('/').length > 2 }" @click="tanlangan = p">{{ p.yol }}</button>
      </li>
    </ul>
    <div :key="tanlangan.yol" class="da-karta">
      <code class="da-yol">{{ tanlangan.yol }}</code>
      <p class="da-nima">{{ tanlangan.nima }}</p>
      <div class="da-ls"><span>$ ls {{ tanlangan.yol }}</span>{{ tanlangan.ichida }}</div>
      <p v-if="tanlangan.sen" class="da-sen">→ {{ tanlangan.sen }}</p>
    </div>
  </div>
</template>

<style scoped>
.daraxt-anim { display: grid; grid-template-columns: 170px 1fr; gap: 14px; margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.da-royxat { display: grid; gap: 3px; align-content: start; margin: 0; padding: 0; list-style: none; }
.da-royxat button { width: 100%; padding: 4px 8px; border: 0; border-radius: 6px; background: none; color: var(--text); font: 13.5px var(--font-mono); text-align: left; cursor: pointer; }
.da-royxat button.ich { padding-left: 22px; }
.da-royxat button:hover { background: var(--bg-sunken); }
.da-royxat button.on { background: var(--accent); color: var(--bg-elevated); }
.da-karta { padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); animation: da-kir .35s ease; }
.da-yol { font: 700 18px var(--font-mono); background: none; border: 0; padding: 0; }
.da-nima { margin: 6px 0 10px; font-size: 15px; }
.da-ls { display: grid; gap: 4px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 13px/1.5 var(--font-mono); white-space: pre-wrap; word-break: break-word; }
.da-ls span { color: #7ee787; }
.da-sen { margin: 10px 0 0; font-size: 14px; color: var(--accent-text); }
@keyframes da-kir { from { opacity: 0; transform: translateX(-4px); } }
@media (max-width: 640px) { .daraxt-anim { grid-template-columns: 1fr; } .da-royxat { grid-template-columns: repeat(3, 1fr); } .da-royxat button.ich { padding-left: 8px; } }
</style>

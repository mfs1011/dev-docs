<script setup>
// 15-bob: bash qaysi sozlama fayllarini o'qiydi. Qoida — Bash qo'llanmasi (6.2 Bash Startup Files) va Debian'ning
// ~/.profile fayli (u ~/.bashrc ni o'zi chaqiradi). Natijalar trenajorda sinalgan.
import { computed, ref } from 'vue'

const HOLATLAR = [
  { k: 'ssh', nom: 'SSH bilan kirish', tur: 'interaktiv, login', misol: 'ssh root@server',
    fayllar: ['/etc/profile', '/etc/bash.bashrc', '~/.profile', '~/.bashrc'],
    izoh: 'Login qobiq (shell) avval `/etc/profile` ni o‘qiydi (Debian’da u `/etc/bash.bashrc` ni chaqiradi), keyin `~/.bash_profile`, `~/.bash_login`, `~/.profile` dan BIRINCHI topilganini. Debian’dagi `~/.profile` o‘z navbatida `~/.bashrc` ni chaqiradi.' },
  { k: 'oyna', nom: 'Yangi terminal yoki bash', tur: 'interaktiv, login emas', misol: 'bash',
    fayllar: ['~/.bashrc'],
    izoh: 'Login bo‘lmagan interaktiv qobiq (shell) `~/.bashrc` ni o‘qiydi. Debian’ning `man bash` sahifasiga ko‘ra undan oldin tizim bo‘yicha umumiy `/etc/bash.bashrc` ham o‘qiladi.' },
  { k: 'skript', nom: 'Skript yoki bash -c', tur: 'interaktiv emas', misol: "bash -c 'echo skript'",
    fayllar: [],
    izoh: 'Skript hech qanday sozlama faylini o‘qimaydi (faqat `BASH_ENV` o‘zgaruvchisi ko‘rsatgan faylni). Shuning uchun `~/.bashrc` dagi alias va `PATH` o‘zgarishlari skriptda YO‘Q.' },
  { k: 'servis', nom: 'systemd servisi', tur: 'qobiq umuman emas', misol: 'systemctl start ilova',
    fayllar: [],
    izoh: 'systemd dasturni qobiqsiz (shell) ishga tushiradi: na `~/.profile`, na `~/.bashrc` o‘qiladi. Muhit unit faylida beriladi (`Environment=`, 35-bob).' },
]
const BARCHA = ['/etc/profile', '/etc/bash.bashrc', '~/.bash_profile', '~/.profile', '~/.bashrc']

const tanlov = ref(HOLATLAR[0])
const tartib = (f) => {
  const fayllar = tanlov.value.k === 'oyna' ? ['/etc/bash.bashrc', '~/.bashrc'] : tanlov.value.k === 'ssh' ? ['/etc/profile', '/etc/bash.bashrc', '~/.profile', '~/.bashrc'] : []
  const n = fayllar.indexOf(f)
  return n < 0 ? null : n + 1
}
const qismlar = computed(() => tanlov.value.izoh.split('`').map((t, k) => ({ t, code: k % 2 === 1 })))
</script>

<template>
  <div class="bashf-anim">
    <div class="bf-holatlar">
      <button v-for="h in HOLATLAR" :key="h.k" type="button" :class="{ on: tanlov.k === h.k }" @click="tanlov = h">
        <strong>{{ h.nom }}</strong><small>{{ h.tur }}</small>
      </button>
    </div>
    <div class="bf-misol"><span>$</span> {{ tanlov.misol }}</div>
    <ul class="bf-fayllar">
      <li v-for="f in BARCHA" :key="f" :class="{ oqiladi: tartib(f) }">
        <span class="bf-raqam">{{ tartib(f) ?? '' }}</span>
        <code>{{ f }}</code>
        <small v-if="f === '~/.bash_profile'">bo‘lsa, ~/.profile o‘rniga o‘qiladi</small>
        <small v-else-if="f === '/etc/bash.bashrc'">Debian/Ubuntu: har bir interaktiv qobiqda (shell)</small>
      </li>
    </ul>
    <p class="bf-izoh"><template v-for="(p, k) in qismlar" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
  </div>
</template>

<style scoped>
.bashf-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.bf-holatlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
.bf-holatlar button { display: grid; gap: 2px; text-align: left; padding: 8px 10px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; cursor: pointer; }
.bf-holatlar strong { font-size: 13.5px; }
.bf-holatlar small { font-size: 11.5px; color: var(--text-subtle); }
.bf-holatlar button.on { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.bf-misol { margin: 12px 0 10px; padding: 7px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #7ee787; font: 14px var(--font-mono); }
.bf-misol span { color: #6b7689; margin-right: 6px; }
.bf-fayllar { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.bf-fayllar li { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 8px; border: 1px dashed var(--border); opacity: .5; transition: opacity .35s, background .35s, border-color .35s; }
.bf-fayllar li.oqiladi { opacity: 1; border-style: solid; border-color: var(--success); background: var(--success-soft); }
.bf-fayllar code { font: 14px var(--font-mono); background: none; border: 0; padding: 0; color: var(--text); }
.bf-fayllar small { font-size: 12px; color: var(--text-subtle); }
.bf-raqam { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; font: 700 12px var(--font-sans); background: var(--success); color: var(--bg-elevated); }
.bf-fayllar li:not(.oqiladi) .bf-raqam { background: none; }
.bf-izoh { margin: 12px 0 0; min-height: 3em; font-size: 15px; line-height: 1.55; }
.bf-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
</style>

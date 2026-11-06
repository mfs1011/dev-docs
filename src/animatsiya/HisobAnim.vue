<script setup>
// 22-bob: foydalanuvchi hisobi uch faylda (DR 4.1): /etc/passwd, /etc/shadow, /etc/group.
// Qatorlar trenajordagi haqiqiy `getent` chiqishi (adduser ali; adduser ali jamoa). Maydonni bossangiz,
// boshqa fayllardagi bog'liq maydonlar yonadi.
import { computed, ref } from 'vue'

const FAYLLAR = [
  {
    nom: '/etc/passwd', ruxsat: '-rw-r--r-- root root — hamma o‘qiydi',
    maydon: [
      { t: 'ali', k: 'nom', m: 'Login nomi' },
      { t: 'x', k: 'parol', m: '`x` — parol /etc/shadow da' },
      { t: '1000', k: 'uid', m: 'UID — foydalanuvchi raqami. Yadro nomni emas, shu raqamni biladi' },
      { t: '1000', k: 'gid', m: 'Asosiy guruh raqami (GID)' },
      { t: 'Ali Valiyev,,,', k: 'izoh', m: 'Izoh: to‘liq ism va h.k. (GECOS)' },
      { t: '/home/ali', k: 'uy', m: 'Uy papkasi' },
      { t: '/bin/bash', k: 'qobiq', m: 'Kirishdagi qobiq (shell). `/usr/sbin/nologin` — kira olmaydi' },
    ],
  },
  {
    nom: '/etc/shadow', ruxsat: '-rw-r----- root shadow — faqat root',
    maydon: [
      { t: 'ali', k: 'nom', m: 'Login nomi — passwd bilan shu orqali bog‘lanadi' },
      { t: '!', k: 'parol', m: 'Parol xeshi. `!` yoki `*` — parol bilan kirib bo‘lmaydi (--disabled-password)' },
      { t: '20763', k: 'sana', m: 'Parol oxirgi o‘zgargan kun: 1970-01-01 dan beri kunlar' },
      { t: '0', k: 'muddat', m: 'Parolni o‘zgartirish oralig‘i: eng kam kun' },
      { t: '99999', k: 'muddat', m: 'Eng ko‘p kun — 99999: muddat yo‘q' },
      { t: '7', k: 'muddat', m: 'Muddat tugashidan necha kun oldin ogohlantirish' },
      { t: '', k: 'muddat', m: 'Faolsizlik muddati (bo‘sh)' },
      { t: '', k: 'muddat', m: 'Hisob tugash sanasi (bo‘sh)' },
      { t: '', k: 'muddat', m: 'Zaxira maydon' },
    ],
  },
  {
    nom: '/etc/group', ruxsat: '-rw-r--r-- root root — hamma o‘qiydi',
    qatorlar: [
      [
        { t: 'ali', k: 'gnom', m: 'Guruh nomi: adduser har foydalanuvchiga o‘z nomidagi guruhni yaratadi' },
        { t: 'x', k: 'gparol', m: 'Guruh paroli — amalda ishlatilmaydi' },
        { t: '1000', k: 'gid', m: 'GID — passwd’dagi 4-maydon shu guruhga ishora qiladi' },
        { t: '', k: 'azo', m: 'A’zolar ro‘yxati. Asosiy guruh a’zolari bu yerga yozilmaydi' },
      ],
      [
        { t: 'jamoa', k: 'gnom2', m: 'Qo‘shimcha guruh' },
        { t: 'x', k: 'gparol', m: 'Guruh paroli — amalda ishlatilmaydi' },
        { t: '1001', k: 'gid2', m: 'GID' },
        { t: 'ali', k: 'nom', m: 'A’zolar: `adduser ali jamoa` shu ro‘yxatga qo‘shdi' },
      ],
    ],
  },
]
const tanlangan = ref({ f: 0, q: 0, i: 2 })
const qatorlar = (f) => f.qatorlar ?? [f.maydon]
const joriy = computed(() => qatorlar(FAYLLAR[tanlangan.value.f])[tanlangan.value.q][tanlangan.value.i])
const tanla = (f, q, i) => { tanlangan.value = { f, q, i } }
const bogliq = (m) => m.k === joriy.value.k && m !== joriy.value
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div class="hisob-anim">
    <div v-for="(f, fi) in FAYLLAR" :key="f.nom" class="ha-fayl">
      <div class="ha-sar"><code>{{ f.nom }}</code><small>{{ f.ruxsat }}</small></div>
      <div v-for="(q, qi) in qatorlar(f)" :key="qi" class="ha-qator">
        <template v-for="(m, i) in q" :key="i">
          <button type="button" class="ha-maydon" :class="{ on: joriy === m, bog: bogliq(m), bosh: !m.t }" @click="tanla(fi, qi, i)">{{ m.t || '∅' }}</button><span v-if="i < q.length - 1" class="ha-ikki">:</span>
        </template>
      </div>
    </div>
    <p class="ha-izoh"><b>{{ joriy.t || 'bo‘sh' }}</b> — <template v-for="(p, k) in qismlar(joriy.m)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
  </div>
</template>

<style scoped>
.hisob-anim { display: grid; gap: 12px; margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ha-sar { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-bottom: 6px; }
.ha-sar code { font: 600 14px var(--font-mono); background: none; border: 0; padding: 0; }
.ha-sar small { font-size: 12.5px; color: var(--text-subtle); }
.ha-qator { display: flex; flex-wrap: wrap; align-items: center; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--code-bg); font: 14px var(--font-mono); }
.ha-qator + .ha-qator { margin-top: 4px; }
.ha-maydon { padding: 2px 4px; border: 0; border-radius: 4px; background: none; color: #d7dde8; font: inherit; cursor: pointer; transition: background .25s, color .25s; }
.ha-maydon:hover { background: #2c3340; }
.ha-maydon.bosh { color: #6b7689; }
.ha-maydon.on { background: var(--accent); color: #fff; }
.ha-maydon.bog { background: #e3b341; color: #1b1f27; }
.ha-ikki { color: #6b7689; }
.ha-izoh { margin: 0; min-height: 3em; font-size: 15px; line-height: 1.55; }
.ha-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
</style>

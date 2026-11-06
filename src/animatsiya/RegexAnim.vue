<script setup>
// 18-bob: regex shablon qatorning qaysi qismini tutadi. Mosliklar JS regex bilan hisoblanmaydi —
// trenajordagi haqiqiy `grep -on` chiqishidan olingan (qator raqami + topilgan matn).
import { computed, ref } from 'vue'

const LOG = [
  '10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512',
  '10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024',
  '10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64',
  '192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128',
  '10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32',
]
const SHABLONLAR = [
  {
    cmd: "grep -on api access.log",
    qism: [['api', 'oddiy harflar — aynan shu matn']],
    topildi: [[2, 'api'], [3, 'api'], [5, 'api']],
  },
  {
    cmd: "grep -on '10\\.0\\.0\\.5' access.log",
    qism: [['10', 'aynan "10"'], ['\\.', 'nuqtaning o‘zi (\\ maxsus ma’noni o‘chiradi)'], ['0\\.0\\.5', 'qolgani ham aynan']],
    topildi: [[1, '10.0.0.5'], [3, '10.0.0.5']],
  },
  {
    cmd: "grep -onE '^[0-9.]+' access.log",
    qism: [['^', 'qator boshi'], ['[0-9.]', 'raqam yoki nuqta (qavs ichida . oddiy belgi)'], ['+', 'oldingisi 1 yoki ko‘p marta']],
    topildi: [[1, '10.0.0.5'], [2, '10.0.0.7'], [3, '10.0.0.5'], [4, '192.168.1.20'], [5, '10.0.0.7']],
  },
  {
    cmd: "grep -onE '\" (4|5)[0-9]{2} ' access.log",
    qism: [['" ', 'qo‘shtirnoq va probel'], ['(4|5)', '4 yoki 5'], ['[0-9]', 'bitta raqam'], ['{2}', 'oldingisi aynan 2 marta'], [' ', 'probel']],
    topildi: [[3, '" 401 '], [4, '" 404 '], [5, '" 500 ']],
  },
  {
    cmd: "grep -onE 'GET /api/(users|orders)' access.log",
    qism: [['GET /api/', 'aynan shu matn'], ['(users|orders)', 'users yoki orders']],
    topildi: [[2, 'GET /api/users'], [5, 'GET /api/orders']],
  },
  {
    cmd: "grep -onE '\\[[^]]+\\]' access.log",
    qism: [['\\[', '[ belgisining o‘zi'], ['[^]]', '] dan boshqa istalgan belgi'], ['+', '1 yoki ko‘p marta'], ['\\]', '] belgisining o‘zi']],
    topildi: [[1, '[06/Nov/2026:10:00:01 +0000]'], [2, '[06/Nov/2026:10:00:02 +0000]'], [3, '[06/Nov/2026:10:00:03 +0000]'], [4, '[06/Nov/2026:10:00:04 +0000]'], [5, '[06/Nov/2026:10:00:05 +0000]']],
  },
  {
    cmd: "grep -onE '[0-9]+$' access.log",
    qism: [['[0-9]+', 'bir yoki ko‘p raqam'], ['$', 'qator oxiri']],
    topildi: [[1, '512'], [2, '1024'], [3, '64'], [4, '128'], [5, '32']],
  },
  {
    cmd: "grep -nv ' 200 ' access.log",
    qism: [['-v', 'teskari: shablon TOPILMAGAN qatorlar']],
    butun: [3, 4, 5],
  },
]
const i = ref(3)
const s = computed(() => SHABLONLAR[i.value])
// Har qatorni bo'laklarga ajratish: topilgan matn grep aytgan joyda (qatorda birinchi uchragan joyidan qidirib)
const qatorlar = computed(() => LOG.map((q, k) => {
  const n = k + 1
  if (s.value.butun) return { n, ok: s.value.butun.includes(n), bolak: [{ t: q, h: s.value.butun.includes(n) }] }
  const bolak = []
  let joy = 0
  for (const [qn, m] of s.value.topildi.filter(([x]) => x === n)) {
    const j = q.indexOf(m, joy)
    if (j < 0) continue
    if (j > joy) bolak.push({ t: q.slice(joy, j) })
    bolak.push({ t: m, h: true })
    joy = j + m.length
  }
  if (joy < q.length) bolak.push({ t: q.slice(joy) })
  return { n, ok: bolak.some((b) => b.h), bolak }
}))
</script>

<template>
  <div class="regex-anim">
    <div class="rx-tanlov">
      <button v-for="(x, k) in SHABLONLAR" :key="k" type="button" :class="{ on: k === i }" @click="i = k">{{ k + 1 }}</button>
    </div>
    <div class="rx-cmd"><span>$</span> {{ s.cmd }}</div>
    <ul class="rx-qism">
      <li v-for="([b, m], k) in s.qism" :key="i + '-' + k" :style="{ animationDelay: k * 0.12 + 's' }"><code>{{ b.replaceAll(' ', '␣') }}</code> {{ m }}</li>
    </ul>
    <div :key="i" class="rx-log">
      <div v-for="q in qatorlar" :key="q.n" class="rx-qator" :class="{ ok: q.ok }">
        <span class="rx-n">{{ q.n }}</span><span class="rx-matn"><template v-for="(b, k) in q.bolak" :key="k"><mark v-if="b.h">{{ b.t }}</mark><template v-else>{{ b.t }}</template></template></span>
      </div>
    </div>
    <p class="rx-izoh">{{ qatorlar.filter((q) => q.ok).length }} ta qator tanlandi. Yoritilgan joylar — trenajordagi <code>{{ s.butun ? 'grep -nv' : 'grep -on' }}</code> chiqishi<template v-if="!s.butun">, <code>␣</code> — probel</template>.</p>
  </div>
</template>

<style scoped>
.regex-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.rx-tanlov { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.rx-tanlov button { width: 32px; height: 30px; border: 1px solid var(--border-strong); border-radius: 7px; background: var(--bg); color: var(--text); font: 600 13px var(--font-mono); cursor: pointer; }
.rx-tanlov button.on { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.rx-cmd { padding: 8px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #7ee787; font: 14px var(--font-mono); white-space: pre-wrap; word-break: break-all; }
.rx-cmd span { color: #6b7689; margin-right: 6px; }
.rx-qism { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 10px 0; padding: 0; list-style: none; font-size: 14px; }
.rx-qism li { animation: rx-kir .35s ease both; }
.rx-qism code { font: 13px var(--font-mono); padding: 1px 6px; border-radius: 4px; background: color-mix(in srgb, #e3b341 22%, var(--bg)); }
.rx-log { padding: 8px 0; border-radius: var(--radius-sm); background: var(--code-bg); font: 12.5px/1.7 var(--font-mono); overflow-x: auto; }
.rx-qator { display: flex; gap: 10px; padding: 0 12px; color: #6b7689; white-space: pre; transition: color .3s; }
.rx-qator.ok { color: #d7dde8; }
.rx-n { width: 1ch; flex: none; color: #6b7689; }
.rx-qator mark { padding: 0 1px; border-radius: 3px; background: #e3b341; color: #1b1f27; animation: rx-yon .5s ease; }
.rx-izoh { margin: 10px 0 0; font-size: 14px; color: var(--text-muted); }
.rx-izoh code { font: 12.5px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
@keyframes rx-kir { from { opacity: 0; transform: translateY(-3px); } }
@keyframes rx-yon { from { background: transparent; } }
</style>

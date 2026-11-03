<script setup>
// SQL konsoli: yuqorida chiqish (psql / sqlite3 uslubidagi matn yoki chiroyli jadval), pastda kiritish.
// Enter — so'rov ; bilan tugagan bo'lsa bajariladi, aks holda yangi qator. Ctrl/⌘+Enter — har doim bajaradi.
// Tab — maslahatni qabul qiladi, ↑↓ — tarix (yoki maslahatlar ro'yxati).
import { computed, nextTick, ref, watch } from 'vue'
import { ajrat, ochiqHolat } from './ajrat.js'
import { boxJadval, psqlJadval, psqlXato, sqliteXato } from './format.js'
import { FUNKSIYALAR, KALIT_SOZLAR, rangla } from './rang.js'
import { xatoIzohi } from './xatolar.js'

const props = defineProps({ dvigatel: Object, log: Array, view: String, schema: Object, busy: Boolean })
const emit = defineEmits(['run', 'plan', 'update:view'])

const input = ref('')
const ta = ref(null)
const outEl = ref(null)
const tarix = []
let tarixI = -1

// ---------- chiqish ----------
const KO_RSATISH = 200 // jadval ko'rinishida ko'pi bilan shuncha qator
// davom qatori prompt'i: psql — %R o'rnida nima ochiq qolgani (-, (, ', ", *, $);
// sqlite3 3.54 — tugatish uchun kerakli belgilar (masalan `);`), asosiy prompt kengligiga tekislangan
function davom(oldin) {
  const h = ochiqHolat(oldin), p = props.dvigatel.prompt
  if (props.dvigatel.id === 'pg') {
    const r = h.comment ? '*' : h.quote ?? (h.dollar ? '$' : h.depth ? '(' : '-')
    return p.replace(/=(?=[#>]$)/, r)
  }
  const yop = (h.comment ? '*/' : '') + (h.quote ?? '') + (h.dollar ?? '') + ')'.repeat(h.depth) + ';'
  return (yop + '->').padStart(p.length)
}
function echo(sql) {
  const lines = sql.split('\n')
  return lines.map((l, i) => {
    const p = i ? davom(lines.slice(0, i).join('\n') + '\n') : props.dvigatel.prompt
    return `<span class="pr">${esc(p).replace('memory', '<i>memory</i>')}</span> ${rangla(l)}`
  }).join('\n')
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const matn = (r) => (props.dvigatel.id === 'pg' ? psqlJadval(r) : boxJadval(r))
const xatoMatn = (r) => (props.dvigatel.id === 'pg' ? psqlXato(r.sql, r.error) : sqliteXato(r.sql, r.error))
const izoh = (r) => xatoIzohi(props.dvigatel.id, r.error)
const ms = (r) => (r.ms < 1 ? '<1 ms' : `${Math.round(r.ms)} ms`)

watch(() => props.log?.length, async () => {
  await nextTick()
  outEl.value?.scrollTo({ top: outEl.value.scrollHeight, behavior: 'smooth' })
})

// ---------- kiritish ----------
const tayyor = (t) => {
  const s = ajrat(t)
  return s.length > 0 && s.at(-1).complete
}
function yubor() {
  const t = input.value.trim()
  if (!t || props.busy) return
  tarix.push(t)
  tarixI = -1
  input.value = ''
  menu.value = null
  emit('run', t)
}

// maslahat: kursor oldidagi so'z bo'yicha jadval, ustun, kalit so'z va funksiyalar
const menu = ref(null) // { items, sel, from }
const sozlar = computed(() => {
  const s = props.schema
  const t = s?.tables ?? []
  return [
    ...t.map((x) => ({ w: x.name, d: x.view ? 'view' : `jadval · ${x.count ?? '?'} qator` })),
    ...[...new Map(t.flatMap((x) => x.columns.map((c) => [c.name, { w: c.name, d: `${x.name}.${c.name} · ${c.type}` }]))).values()],
    ...KALIT_SOZLAR.map((w) => ({ w, d: 'kalit so‘z', kw: true })),
    ...FUNKSIYALAR.map((w) => ({ w, d: 'funksiya', fn: true })),
  ]
})
function maslahat() {
  const el = ta.value
  if (!el || el.selectionStart !== el.selectionEnd) return (menu.value = null)
  const before = input.value.slice(0, el.selectionStart)
  const m = /[A-Za-z_][A-Za-z0-9_]*$/.exec(before)
  if (!m || m[0].length < 1) return (menu.value = null)
  const p = m[0], lp = p.toLowerCase()
  const items = sozlar.value.filter((s) => s.w.toLowerCase().startsWith(lp) && s.w.toLowerCase() !== lp).slice(0, 8)
  menu.value = items.length ? { items, sel: 0, from: m.index, upper: p === p.toUpperCase() && /[A-Z]/.test(p) } : null
}
function qabul(i = menu.value?.sel ?? 0) {
  const mm = menu.value
  if (!mm) return
  const it = mm.items[i]
  let w = it.kw ? (mm.upper ? it.w : it.w.toLowerCase()) : it.w
  if (it.fn) w += '('
  const pos = ta.value.selectionStart
  input.value = input.value.slice(0, mm.from) + w + input.value.slice(pos)
  menu.value = null
  nextTick(() => { const c = mm.from + w.length; ta.value.setSelectionRange(c, c); ta.value.focus() })
}

function onKey(e) {
  const mm = menu.value
  if (mm && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault()
    mm.sel = (mm.sel + (e.key === 'ArrowDown' ? 1 : mm.items.length - 1)) % mm.items.length
    return
  }
  if (mm && e.key === 'Tab') { e.preventDefault(); qabul(); return }
  if (mm && e.key === 'Escape') { menu.value = null; return }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); yubor(); return }
  if (e.key === 'Enter' && !e.shiftKey) {
    if (mm) { e.preventDefault(); qabul(); return }
    if (tayyor(input.value)) { e.preventDefault(); yubor() }
    return
  }
  // tarix: kursor birinchi/oxirgi qatorda bo'lsa
  const el = ta.value
  if (e.key === 'ArrowUp' && !input.value.slice(0, el.selectionStart).includes('\n') && tarix.length) {
    e.preventDefault()
    tarixI = tarixI < 0 ? tarix.length - 1 : Math.max(0, tarixI - 1)
    input.value = tarix[tarixI]
  } else if (e.key === 'ArrowDown' && !input.value.slice(el.selectionEnd).includes('\n') && tarixI >= 0) {
    e.preventDefault()
    tarixI++
    input.value = tarixI >= tarix.length ? ((tarixI = -1), '') : tarix[tarixI]
  }
}
const rangli = computed(() => rangla(input.value) + '\n')
const hl = ref(null)
const sync = () => { if (hl.value) hl.value.scrollTop = ta.value.scrollTop }
const qatorlar = computed(() => Math.min(10, Math.max(2, input.value.split('\n').length)))

function setInput(t) {
  input.value = t
  nextTick(() => { ta.value.focus(); ta.value.setSelectionRange(t.length, t.length) })
}
defineExpose({ setInput, focus: () => ta.value?.focus() })
</script>

<template>
  <div class="konsol">
    <div class="bar">
      <span class="db">{{ dvigatel.name }} {{ dvigatel.version }}</span>
      <div class="seg" role="group" aria-label="Natija ko‘rinishi">
        <button type="button" :class="{ on: view === 'terminal' }" @click="emit('update:view', 'terminal')">Terminal</button>
        <button type="button" :class="{ on: view === 'jadval' }" @click="emit('update:view', 'jadval')">Jadval</button>
      </div>
    </div>
    <div ref="outEl" class="out" @click="ta?.focus()">
      <slot name="bosh" />
      <div v-for="e in log" :key="e.id" class="entry" :class="{ tizim: e.tizim }">
        <p v-if="e.tizim" class="tz">{{ e.tizim }}</p>
        <template v-for="(r, i) in e.results" :key="i">
          <pre v-if="!e.tizim" class="echo" v-html="echo(r.sql)" />
          <template v-if="r.error">
            <pre class="err">{{ xatoMatn(r) }}</pre>
            <p v-if="izoh(r)" class="izoh">{{ izoh(r) }}</p>
          </template>
          <template v-else-if="r.columns">
            <pre v-if="view === 'terminal'" class="res">{{ matn(r) }}</pre>
            <div v-else class="tbl">
              <table>
                <thead><tr><th v-for="c in r.columns" :key="c.name">{{ c.name }}</th></tr></thead>
                <tbody>
                  <tr v-for="(row, k) in r.rows.slice(0, KO_RSATISH)" :key="k">
                    <td v-for="(v, j) in row" :key="j" :class="{ num: r.columns[j].num, nul: v === null }">{{ v === null ? 'NULL' : v }}</td>
                  </tr>
                </tbody>
              </table>
              <p class="cnt">{{ r.rows.length }} qator<template v-if="r.rows.length > KO_RSATISH"> · birinchi {{ KO_RSATISH }} tasi ko‘rsatildi</template></p>
            </div>
          </template>
          <pre v-else-if="r.tag" class="res">{{ r.tag }}</pre>
          <p v-else-if="!e.tizim" class="ok">✓ bajarildi<template v-if="r.affected != null"> · o‘zgargan qatorlar: {{ r.affected }}</template></p>
          <p v-if="!e.tizim" class="meta">
            {{ ms(r) }}
            <button v-if="r.plan" type="button" class="plan" @click.stop="emit('plan', r)">Reja daraxti →</button>
          </p>
        </template>
      </div>
    </div>
    <div class="in" :class="{ busy }">
      <span class="pr">{{ dvigatel.prompt }}</span>
      <div class="ed">
        <pre ref="hl" class="hl" aria-hidden="true" v-html="rangli" />
        <textarea
          ref="ta" v-model="input" :rows="qatorlar" spellcheck="false" autocapitalize="off" autocomplete="off"
          placeholder="SQL yozing va ; bilan tugating, keyin Enter" aria-label="SQL so‘rov"
          @keydown="onKey" @input="maslahat" @click="maslahat" @scroll="sync" @blur="menu = null"
        />
        <div v-if="menu" class="menu">
          <div v-for="(it, i) in menu.items" :key="it.w + it.d" class="item" :class="{ on: i === menu.sel }" @mousedown.prevent="qabul(i)">
            <span class="w">{{ it.w }}</span><span class="d">{{ it.d }}</span>
          </div>
          <div class="hint"><b>Tab</b> tanlash · <b>↑↓</b> boshqasi · <b>Esc</b> yopish</div>
        </div>
      </div>
      <button type="button" class="run" :disabled="busy || !input.trim()" title="Bajarish (Ctrl/⌘+Enter)" @click="yubor">▶</button>
    </div>
  </div>
</template>

<style scoped>
.konsol { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--code-bg); color: #d7dde8; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 10px 6px 14px; border-bottom: 1px solid #263044; }
.db { color: #8a96ab; font: 12px var(--font-mono); }
.seg { display: flex; padding: 2px; border-radius: 7px; background: #11151c; }
.seg button { padding: 3px 10px; border: 0; border-radius: 5px; background: none; color: #8a96ab; font: 600 12px var(--font-sans); cursor: pointer; }
.seg button.on { background: #263044; color: #e6e9f0; }
.out { flex: 1; min-height: 0; overflow: auto; padding: 10px 14px; font: 13.5px/1.45 var(--font-mono); }
pre { margin: 0; font: inherit; white-space: pre; }
.entry { margin-bottom: 12px; }
.echo { white-space: pre-wrap; word-break: break-word; }
.pr { color: #7ee787; }
.res { color: #e6e9f0; overflow-x: auto; line-height: 1.22; } /* box chiziqlari uzilmasin */
.err { color: #ff8a80; white-space: pre-wrap; }
.izoh { margin: 6px 0 0; padding: 6px 10px; border-left: 3px solid #f0b45f; background: rgba(240, 180, 95, .08); color: #f5d9a8; font: 13px/1.45 var(--font-sans); white-space: normal; }
.ok { margin: 0; color: #7ee787; font: 12.5px var(--font-sans); }
.meta { margin: 2px 0 0; color: #5d687c; font: 11.5px var(--font-sans); }
.plan { margin-left: 8px; padding: 0; border: 0; background: none; color: #79bbf5; font: inherit; cursor: pointer; }
.plan:hover { text-decoration: underline; }
.tz { margin: 0; color: #8a96ab; font: italic 12.5px var(--font-sans); }
.tbl { overflow-x: auto; margin-top: 4px; }
table { border-collapse: collapse; font: 13px var(--font-mono); }
th { position: sticky; top: 0; padding: 5px 12px; background: #263044; color: #c7d2e3; text-align: left; font-weight: 600; white-space: nowrap; }
td { padding: 4px 12px; border-bottom: 1px solid #232b3a; white-space: nowrap; }
tbody tr:nth-child(even) td { background: rgba(255, 255, 255, .025); }
td.num { color: #f5c77e; text-align: right; }
td.nul { color: #7f8a9e; font-style: italic; font-size: 11.5px; }
.cnt { margin: 4px 0 0; color: #7f8a9e; font: 12px var(--font-sans); }
.in { position: relative; display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px 10px 14px; border-top: 1px solid #263044; }
.in.busy { opacity: .6; }
.in > .pr { padding-top: 5px; font: 13.5px var(--font-mono); white-space: nowrap; }
.ed { position: relative; flex: 1; min-width: 0; }
.hl, textarea { margin: 0; padding: 5px 0; border: 0; font: 13.5px/1.45 var(--font-mono); white-space: pre-wrap; word-break: break-word; tab-size: 2; }
.hl { position: absolute; inset: 0; overflow: hidden; pointer-events: none; color: #e6e9f0; }
textarea { position: relative; width: 100%; resize: none; background: transparent; color: transparent; caret-color: #7ee787; outline: none; }
textarea::placeholder { color: #5d687c; }
.run { padding: 4px 10px; border: 1px solid #2f3b52; border-radius: 6px; background: #1b2230; color: #7ee787; cursor: pointer; }
.run:disabled { opacity: .4; cursor: default; }
.menu { position: absolute; z-index: 5; left: 0; bottom: calc(100% + 6px); min-width: 300px; max-width: 480px; padding: 4px 0; border: 1px solid #2f3b52; border-radius: 8px; background: #1b2230; box-shadow: 0 8px 24px rgba(0, 0, 0, .45); font: 13px var(--font-sans); }
.item { display: flex; gap: 12px; align-items: baseline; padding: 4px 12px; cursor: pointer; }
.item.on { background: #253047; }
.w { color: #7ee787; font-family: var(--font-mono); white-space: nowrap; }
.d { overflow: hidden; color: #9aa6ba; text-overflow: ellipsis; white-space: nowrap; }
.hint { margin-top: 4px; padding: 4px 12px 2px; border-top: 1px solid #2f3b52; color: #6b7689; font-size: 11px; }
.hint b { color: #9aa6ba; font-weight: 600; }
:deep(.s-kw) { color: #ff9ec4; }
:deep(.s-str) { color: #9ede9b; }
:deep(.s-num) { color: #f5c77e; }
:deep(.s-com) { color: #7f8a9e; font-style: italic; }
:deep(.s-fn) { color: #8dc6ff; }
:deep(.s-id) { color: #c7a6ff; }
</style>

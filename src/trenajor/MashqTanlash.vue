<script setup>
// Mashq tanlash: kitob qismlari bo'yicha guruhlangan ro'yxat, bob raqami, bajarilganlar belgisi va qidiruv.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { MASHQLAR as GIT_MASHQLAR } from './mashqlar.js'
import { findPage } from '@/docs'

// mashqlar va erkin rejimlar tashqaridan beriladi (SQL trenajori ham shu oynani ishlatadi); standart — git
const props = defineProps({
  modelValue: String, done: Set, disabled: Boolean,
  mashqlar: { type: Array, default: () => GIT_MASHQLAR },
  erkin: { type: Array, default: () => [{ id: '', title: 'Erkin rejim', note: 'bo‘sh ~/loyiha papkasi, hech narsa tayyorlanmaydi' }] },
})
const bobRaqami = (m) => +m.bob.match(/\/(\d+)-/)[1]
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const q = ref('')
const active = ref(0)
const root = ref(null)
const input = ref(null)
const list = ref(null)

const current = computed(() => [...props.erkin, ...props.mashqlar].find((m) => m.id === props.modelValue) ?? props.erkin[0])

// qidiruvdan o'tganlar, kitob bo'limlari bo'yicha
const groups = computed(() => {
  const t = q.value.trim().toLowerCase()
  const out = []
  for (const m of props.mashqlar) {
    const page = findPage(m.bob)
    const hay = `${m.title} ${m.id} ${page?.title ?? ''}`.toLowerCase()
    if (t && !hay.includes(t)) continue
    const section = page?.section ?? 'Boshqa'
    let g = out.at(-1)
    if (g?.title !== section) out.push((g = { title: section, items: [] }))
    g.items.push({ ...m, n: bobRaqami(m), bobTitle: (page?.title ?? '').replace(/^\d+ — /, '') })
  }
  return out
})
const flat = computed(() => [...(q.value.trim() ? [] : props.erkin), ...groups.value.flatMap((g) => g.items)])
const doneCount = computed(() => props.mashqlar.filter((m) => props.done?.has(m.id)).length)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}
function pick(m) {
  emit('update:modelValue', m.id)
  open.value = false
}

watch(open, async (v) => {
  if (!v) return
  q.value = ''
  await nextTick() // q kuzatuvchisi active'ni 0 ga tushiradi — undan keyin joriy mashqqa qo'yamiz
  active.value = Math.max(0, flat.value.findIndex((m) => m.id === props.modelValue))
  await nextTick()
  input.value?.focus()
  list.value?.querySelector('.on')?.scrollIntoView({ block: 'center' })
})
watch(q, () => { active.value = 0 })

function onKey(e) {
  if (e.key === 'Escape') { open.value = false; return }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const n = flat.value.length
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : n - 1)) % n
    nextTick(() => list.value?.querySelector('.on')?.scrollIntoView({ block: 'nearest' }))
  }
  if (e.key === 'Enter' && flat.value[active.value]) pick(flat.value[active.value])
}

const onDoc = (e) => { if (open.value && !root.value?.contains(e.target)) open.value = false }
document.addEventListener('pointerdown', onDoc)
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDoc))

const idx = (m) => flat.value.findIndex((x) => x.id === m.id)
</script>

<template>
  <div ref="root" class="tanlash">
    <button type="button" class="trigger" :class="{ open }" :disabled="disabled" :aria-expanded="open" @click="toggle">
      <span class="lbl">Mashq</span>
      <span class="val">{{ current.title }}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
    </button>

    <div v-if="open" class="pop" role="dialog" aria-label="Mashq tanlash" @keydown="onKey">
      <div class="head">
        <input ref="input" v-model="q" type="search" placeholder="Mashq yoki mavzu qidirish…" aria-label="Mashqlarni qidirish">
        <span class="count">{{ doneCount }}/{{ mashqlar.length }} bajarildi</span>
      </div>
      <div ref="list" class="list">
        <template v-if="!q.trim()">
          <button
            v-for="(f, i) in erkin" :key="f.id" type="button" class="item free"
            :class="{ on: active === i, cur: modelValue === f.id }" @mouseenter="active = i" @click="pick(f)"
          >
            <span class="num">~</span>
            <span class="txt"><strong>{{ f.title }}</strong><small>{{ f.note }}</small></span>
          </button>
        </template>
        <section v-for="g in groups" :key="g.title">
          <p class="group">{{ g.title }}</p>
          <button
            v-for="m in g.items" :key="m.id" type="button" class="item"
            :class="{ on: active === idx(m), cur: modelValue === m.id }"
            @mouseenter="active = idx(m)" @click="pick(m)"
          >
            <span class="num">{{ String(m.n).padStart(2, '0') }}</span>
            <span class="txt"><strong>{{ m.title }}</strong><small>{{ m.steps.length }} qadam · {{ m.bobTitle }}</small></span>
            <span v-if="done?.has(m.id)" class="ok" title="Bajarilgan">✓</span>
          </button>
        </section>
        <p v-if="!flat.length" class="empty">Hech narsa topilmadi.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tanlash { position: relative; }
.trigger { display: flex; align-items: center; gap: 8px; min-width: 300px; max-width: 420px; padding: 6px 10px 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13.5px; cursor: pointer; text-align: left; }
.trigger:hover:not(:disabled), .trigger.open { border-color: var(--accent); }
.trigger:disabled { opacity: .6; cursor: default; }
.lbl { color: var(--text-subtle); font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.val { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.trigger svg { width: 14px; height: 14px; fill: none; stroke: var(--text-subtle); stroke-width: 1.8; transition: transform .2s; }
.trigger.open svg { transform: rotate(180deg); }

.pop { position: absolute; z-index: 40; top: calc(100% + 6px); left: 0; width: min(460px, calc(100vw - 32px)); max-height: min(70vh, 560px); display: flex; flex-direction: column; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); overflow: hidden; }
.head { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border); }
.head input { flex: 1; min-width: 0; padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; font-size: 13.5px; }
.head input:focus { outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent); outline-offset: 1px; }
.count { color: var(--text-subtle); font-size: 12px; white-space: nowrap; }
.list { overflow: auto; padding: 6px; }
.group { margin: 10px 8px 4px; color: var(--text-subtle); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 8px; border: 0; border-radius: var(--radius-sm); background: none; color: var(--text); font: inherit; text-align: left; cursor: pointer; }
.item.on { background: var(--surface-hover); }
.item.cur { background: var(--accent-soft); }
.item.cur strong { color: var(--accent-text); }
.num { flex: none; width: 26px; color: var(--text-subtle); font: 12px var(--font-mono); text-align: right; }
.txt { flex: 1; display: grid; min-width: 0; }
.txt strong { font-size: 13.5px; font-weight: 600; }
.txt small { overflow: hidden; color: var(--text-subtle); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ok { flex: none; width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%; background: var(--success-soft); color: var(--success); font-size: 12px; font-weight: 700; }
.free { margin-bottom: 2px; }
.empty { margin: 12px 8px; color: var(--text-subtle); font-size: 13px; }
@media (max-width: 640px) {
  .trigger { min-width: 0; max-width: none; width: 100%; }
}
</style>

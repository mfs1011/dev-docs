<script setup>
// Git'ning uch "qutisi": ishchi papka -> index (staging) -> oxirgi commit (HEAD).
// Manba: git status --porcelain (X — index, Y — ishchi papka) va git ls-tree HEAD.
import { computed } from 'vue'

const props = defineProps({ holat: Object })
const WORK = { '?': ['yangi, kuzatilmaydi', 'new'], M: ['o‘zgargan', 'mod'], D: ['o‘chirilgan', 'del'], U: ['konflikt', 'err'], A: ['konflikt', 'err'] }
const INDEX = { A: ['qo‘shiladi', 'new'], M: ['o‘zgargan', 'mod'], D: ['o‘chiriladi', 'del'], R: ['nomi o‘zgargan', 'mod'], C: ['nusxa', 'new'], U: ['konflikt', 'err'] }

const boxes = computed(() => {
  const h = props.holat
  if (!h?.repo) return null
  const conflict = (s) => s.x === 'U' || s.y === 'U' || (s.x === s.y && (s.x === 'A' || s.x === 'D'))
  const work = h.status.filter((s) => s.y !== ' ').map((s) => {
    const [t, k] = conflict(s) ? ['konflikt', 'err'] : WORK[s.y] ?? [s.y, 'mod']
    return { path: s.path, t, k }
  })
  const index = h.status.filter((s) => s.x !== ' ' && s.x !== '?' && !conflict(s)).map((s) => {
    const [t, k] = INDEX[s.x] ?? [s.x, 'mod']
    return { path: s.path, t, k }
  })
  const head = h.headFiles.map((p) => ({ path: p }))
  return { work, index, head }
})
</script>

<template>
  <div class="uch" v-if="boxes">
    <section>
      <h3>Ishchi papka</h3>
      <TransitionGroup name="f" tag="ul">
        <li v-for="f in boxes.work" :key="f.path" :class="f.k"><span>{{ f.path }}</span><em>{{ f.t }}</em></li>
      </TransitionGroup>
      <p v-if="!boxes.work.length" class="toza">o‘zgarish yo‘q</p>
    </section>
    <div class="arrow">git add →</div>
    <section>
      <h3>Index (staging)</h3>
      <TransitionGroup name="f" tag="ul">
        <li v-for="f in boxes.index" :key="f.path" :class="f.k"><span>{{ f.path }}</span><em>{{ f.t }}</em></li>
      </TransitionGroup>
      <p v-if="!boxes.index.length" class="toza">commit'ga tayyor narsa yo‘q</p>
    </section>
    <div class="arrow">git commit →</div>
    <section>
      <h3>Oxirgi commit (HEAD)</h3>
      <TransitionGroup name="f" tag="ul">
        <li v-for="f in boxes.head" :key="f.path" class="saved"><span>{{ f.path }}</span></li>
      </TransitionGroup>
      <p v-if="!boxes.head.length" class="toza">hali commit yo‘q</p>
    </section>
  </div>
  <p v-else class="toza pad">Repo ochilgach, fayllar shu yerda ishchi papka → index → commit bo‘ylab ko‘chib boradi.</p>
</template>

<style scoped>
.uch { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 8px; height: 100%; padding: 10px 12px; box-sizing: border-box; }
section { background: var(--bg-sunken); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; overflow: auto; min-width: 0; }
h3 { margin: 0 0 8px; font: 700 11px var(--font-sans); color: var(--text-subtle); text-transform: uppercase; letter-spacing: .06em; }
ul { list-style: none; margin: 0; padding: 0; }
li { display: flex; justify-content: space-between; gap: 8px; padding: 4px 8px; margin-bottom: 4px; border-radius: 6px; font: 13px var(--font-mono); background: var(--bg-elevated); color: var(--text); border-left: 3px solid var(--info); box-shadow: var(--shadow-sm); }
li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
li em { font: italic 11px var(--font-sans); color: var(--text-subtle); white-space: nowrap; }
li.new { border-color: var(--success); } li.mod { border-color: var(--warning); } li.del { border-color: var(--danger); } li.err { border-color: var(--danger); background: var(--danger-soft); } li.saved { border-color: var(--insight); }
.pad { padding: 16px; font-size: 13px; }
.toza { color: var(--text-subtle); font: italic 12px var(--font-sans); margin: 4px 0; }
.arrow { align-self: center; color: var(--text-subtle); font: 12px var(--font-mono); writing-mode: vertical-rl; transform: rotate(180deg); }
.f-enter-active { transition: all .5s cubic-bezier(.3, 1.4, .5, 1); }
.f-leave-active { transition: all .35s; position: absolute; }
.f-enter-from { opacity: 0; transform: translateX(-30px); }
.f-leave-to { opacity: 0; transform: translateX(30px); }
</style>

<script setup>
// Loyiha fayllari daraxti: fayl yoki papkani tanlash, yangi fayl, ko'chirish/nomini o'zgartirish, o'chirish.
// Papkani ko'chirish — ichidagi hamma fayl yo'li o'zgaradi (FSD'da eng ko'p qilinadigan tuzatish).
import { computed, nextTick, ref } from 'vue'

const props = defineProps({ fayllar: Object, tanlangan: String, xatoli: Set })
const emit = defineEmits(['tanla', 'yarat', 'kochir', 'ochir'])

const qatorlar = computed(() => {
  const papkalar = new Set()
  for (const f of Object.keys(props.fayllar)) {
    const q = f.split('/')
    for (let i = 1; i < q.length; i++) papkalar.add(q.slice(0, i).join('/'))
  }
  const hammasi = [...[...papkalar].map((p) => ({ yol: p, papka: true })), ...Object.keys(props.fayllar).map((f) => ({ yol: f, papka: false }))]
  // papka avval, keyin fayl; qatlam tartibi FSD bo'yicha
  const TARTIB = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
  const kalit = (y) => y.yol.split('/').map((s, i, a) => `${i === 1 && a[0] === 'src' ? String(TARTIB.indexOf(s) + 10).padStart(2, '0') : ''}${i === a.length - 1 && !y.papka ? '~' : ''}${s}`).join('/')
  return hammasi.sort((a, b) => kalit(a).localeCompare(kalit(b))).map((y) => ({ ...y, nom: y.yol.split('/').pop(), d: y.yol.split('/').length - 1 }))
})

const rejim = ref(null) // { tur: 'yangi' | 'kochir', qiymat }
const kirish = ref(null)
async function boshla(tur) {
  const t = props.tanlangan ?? 'src'
  const papka = props.fayllar[t] === undefined ? t : t.split('/').slice(0, -1).join('/')
  rejim.value = { tur, qiymat: tur === 'yangi' ? `${papka}/` : t }
  await nextTick()
  kirish.value?.focus()
}
function tasdiq() {
  const r = rejim.value
  const v = r.qiymat.trim().replace(/\/+$/, '')
  if (!v.startsWith('src/')) return
  if (r.tur === 'yangi') emit('yarat', v)
  else if (v !== props.tanlangan) emit('kochir', props.tanlangan, v)
  rejim.value = null
}
</script>

<template>
  <div class="daraxt">
    <div class="asboblar">
      <button type="button" title="Yangi fayl" @click="boshla('yangi')">＋ Fayl</button>
      <button type="button" :disabled="!tanlangan || tanlangan === 'src'" title="Ko‘chirish yoki nomini o‘zgartirish" @click="boshla('kochir')">✎ Ko‘chirish</button>
      <button type="button" :disabled="!tanlangan || tanlangan === 'src'" title="O‘chirish" @click="emit('ochir', tanlangan)">🗑</button>
    </div>
    <form v-if="rejim" class="kirish" @submit.prevent="tasdiq">
      <label>{{ rejim.tur === 'yangi' ? 'Yangi fayl yo‘li' : 'Yangi yo‘l (papka bo‘lsa — ichidagilar ham ko‘chadi)' }}</label>
      <input ref="kirish" v-model="rejim.qiymat" spellcheck="false" @keydown.esc="rejim = null" />
      <div><button type="submit">OK</button> <button type="button" @click="rejim = null">Bekor</button></div>
    </form>
    <ul role="tree">
      <li
        v-for="q in qatorlar"
        :key="q.yol"
        role="treeitem"
        :aria-selected="q.yol === tanlangan"
        :class="{ on: q.yol === tanlangan, papka: q.papka, xato: xatoli?.has(q.yol) }"
        :style="{ paddingLeft: `${8 + q.d * 14}px` }"
        @click="emit('tanla', q.yol)"
      >{{ q.papka ? '📁' : q.nom === 'index.ts' ? '🚪' : '📄' }} {{ q.nom }}</li>
    </ul>
  </div>
</template>

<style scoped>
.daraxt { display: flex; flex-direction: column; min-height: 0; }
.asboblar { display: flex; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--border); }
.asboblar button, .kirish button { padding: 3px 9px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 12.5px; cursor: pointer; }
.asboblar button:disabled { opacity: .45; cursor: default; }
.kirish { display: grid; gap: 4px; padding: 8px; border-bottom: 1px solid var(--border); background: var(--bg-sunken); font-size: 12px; }
.kirish input { padding: 4px 8px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: 12.5px var(--font-mono); }
ul { flex: 1; min-height: 0; margin: 0; padding: 4px 0; overflow: auto; list-style: none; }
li { padding: 2px 8px; cursor: pointer; font: 12.5px/1.6 var(--font-mono); white-space: nowrap; }
li:hover { background: var(--bg-sunken); }
li.on { background: var(--accent-soft, var(--bg-sunken)); color: var(--accent-text); }
li.papka { color: var(--text-muted); }
li.xato { color: var(--danger); }
</style>

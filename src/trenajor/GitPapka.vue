<script setup>
// Haqiqiy .git papka: fayllar daraxti (yangi — yashil, o'zgargan — sariq) va tanlangan fayl ichi.
// Fayl VM fayl tizimidan o'qiladi (9p); obyektlar zlib bilan siqilgan — brauzerda ochiladi.
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({ holat: Object, diff: Object, readFile: Function })
const open = ref(new Set(['refs', 'refs/heads', 'objects']))
const sel = ref(null)
const view = ref(null)
const glow = ref(new Map()) // yo'l -> 'new' | 'mod' (bir necha soniya yonib turadi)
const treeEl = ref(null)

watch(() => props.diff, (d) => {
  if (!d) return
  const m = new Map()
  d.newFiles?.forEach((p) => m.set(p, 'new'))
  d.changedFiles?.forEach((p) => m.set(p, 'mod'))
  glow.value = m
  // yangi obyektlar ko'rinsin
  for (const p of m.keys()) { const parts = p.split('/'); for (let i = 1; i < parts.length; i++) open.value.add(parts.slice(0, i).join('/')) }
  if (sel.value && m.has(sel.value)) show(sel.value)
  // birinchi yangi obyekt ko'rinadigan joyga — faqat daraxt suriladi (scrollIntoView butun sahifani ham surardi)
  nextTick(() => {
    const t = treeEl.value, row = t?.querySelector('.row.new, .row.mod')
    if (!row) return
    const y = row.getBoundingClientRect().top - t.getBoundingClientRect().top
    if (y < 0 || y > t.clientHeight - row.offsetHeight) t.scrollTo({ top: t.scrollTop + y - t.clientHeight / 3, behavior: 'smooth' })
  })
  setTimeout(() => { if (glow.value === m) glow.value = new Map() }, 5000)
})

const ORDER = ['HEAD', 'config', 'index', 'refs', 'objects', 'logs']
const rows = computed(() => {
  const files = props.holat?.files ?? []
  const tree = { kids: new Map() }
  for (const f of files) {
    let node = tree
    const parts = f.path.split('/')
    parts.forEach((p, i) => {
      if (!node.kids.has(p)) node.kids.set(p, { name: p, path: parts.slice(0, i + 1).join('/'), kids: new Map(), file: i === parts.length - 1 ? f : null })
      node = node.kids.get(p)
    })
  }
  const out = []
  const walk = (node, depth) => {
    const kids = [...node.kids.values()].sort((a, b) => {
      const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name)
      if (depth === 0 && (ia >= 0 || ib >= 0)) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
      return (a.file ? 1 : 0) - (b.file ? 1 : 0) || a.name.localeCompare(b.name)
    })
    for (const k of kids) {
      const g = glow.value.get(k.path) ?? (!k.file && [...glow.value.keys()].some((p) => p.startsWith(k.path + '/')) ? 'sub' : null)
      out.push({ ...k, depth, isDir: !k.file, g })
      if (!k.file && open.value.has(k.path)) walk(k, depth + 1)
    }
  }
  walk(tree, 0)
  return out
})

function toggle(r) {
  if (r.isDir) { const s = new Set(open.value); s.has(r.path) ? s.delete(r.path) : s.add(r.path); open.value = s }
  else show(r.path)
}

const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
async function inflate(bytes) {
  const ds = new DecompressionStream('deflate')
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer())
}
function parseTree(body) {
  const lines = []
  let i = 0
  while (i < body.length) {
    const sp = body.indexOf(0x20, i), nul = body.indexOf(0, sp)
    const mode = new TextDecoder().decode(body.slice(i, sp))
    const name = new TextDecoder().decode(body.slice(sp + 1, nul))
    const sha = hex(body.slice(nul + 1, nul + 21))
    lines.push(`${mode.padStart(6, '0')} ${mode.startsWith('4') ? 'tree' : 'blob'} ${sha}    ${name}`)
    i = nul + 21
  }
  return lines.join('\n')
}
function parseIndex(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const sig = new TextDecoder().decode(b.slice(0, 4)), ver = dv.getUint32(4), n = dv.getUint32(8)
  const out = [`${sig} — index fayli, versiya ${ver}, ${n} ta yozuv (binary; asosiysi quyida):`, '']
  let o = 12
  for (let k = 0; k < n && o < b.length; k++) {
    const mode = dv.getUint32(o + 24).toString(8), sha = hex(b.slice(o + 40, o + 60)), flags = dv.getUint16(o + 60)
    const len = flags & 0xfff, name = new TextDecoder().decode(b.slice(o + 62, o + 62 + len))
    out.push(`${mode} ${sha}  ${name}`)
    if (ver >= 4) break
    o += Math.ceil((62 + len + 1) / 8) * 8
  }
  return out.join('\n')
}

async function show(path) {
  sel.value = path
  try {
    const bytes = await props.readFile(props.holat.gitdir + '/' + path)
    if (/^objects\/[0-9a-f]{2}\/[0-9a-f]{38}$/.test(path)) {
      const raw = await inflate(bytes)
      const nul = raw.indexOf(0)
      const header = new TextDecoder().decode(raw.slice(0, nul))
      const body = raw.slice(nul + 1)
      const type = header.split(' ')[0]
      const sha = path.replace('objects/', '').replace('/', '')
      view.value = {
        title: `${type} obyekti ${sha.slice(0, 7)}`,
        note: `Fayl zlib bilan siqilgan. Ochilganda: "${header}\\0" sarlavha + mazmun. Nomi — mazmunning SHA-1 hash'i.`,
        text: type === 'tree' ? parseTree(body) : new TextDecoder().decode(body),
      }
    } else if (path === 'index') {
      view.value = { title: '.git/index', note: 'Index (staging) — keyingi commit qanday bo‘lishini saqlaydigan binary fayl.', text: parseIndex(bytes) }
    } else if (path.includes('/pack/')) {
      view.value = { title: path, note: 'Pack fayl — ko‘p obyekt bitta faylga siqilgan (binary).', text: '' }
    } else {
      view.value = { title: '.git/' + path, note: path.startsWith('refs/') ? 'Branch/teg — ichida faqat commit hash’i.' : '', text: new TextDecoder().decode(bytes) }
    }
  } catch (e) {
    view.value = { title: path, note: 'O‘qib bo‘lmadi: ' + e.message, text: '' }
  }
}
</script>

<template>
  <div class="gp" v-if="holat?.repo">
    <div class="tree" ref="treeEl">
      <div class="root">.git/</div>
      <div v-for="r in rows" :key="r.path" class="row" :class="[r.g, { dir: r.isDir, sel: sel === r.path }]" :style="{ paddingLeft: 10 + r.depth * 14 + 'px' }" @click="toggle(r)">
        <span class="ic">{{ r.isDir ? (open.has(r.path) ? '▾' : '▸') : '·' }}</span>{{ r.name }}{{ r.isDir ? '/' : '' }}
      </div>
    </div>
    <div class="view">
      <template v-if="view">
        <h4>{{ view.title }}</h4>
        <p v-if="view.note">{{ view.note }}</p>
        <pre>{{ view.text }}</pre>
      </template>
      <p v-else class="hint">Faylni bosing — ichini ko‘rasiz. Commit qilganda yangi obyektlar yashil yonadi.</p>
    </div>
  </div>
  <div v-else class="hint pad">Repo ochilgach, haqiqiy .git papkasi shu yerda ko‘rinadi.</div>
</template>

<style scoped>
.gp { display: grid; grid-template-rows: minmax(160px, 55%) 1fr; height: 100%; }
.tree { overflow: auto; border-bottom: 1px solid var(--border); padding: 8px 0; font: 13px var(--font-mono); }
.root { color: var(--text-subtle); padding: 0 10px 4px; }
.row { padding: 2px 10px; cursor: pointer; color: var(--text); white-space: nowrap; transition: background 1.5s; }
.row:hover { background: var(--surface-hover); }
.row.dir { color: var(--info); }
.row.sel { background: var(--accent-soft); }
.row.new { background: var(--success-soft); color: var(--success); font-weight: 600; transition: none; }
.row.mod { background: var(--warning-soft); color: var(--warning); font-weight: 600; transition: none; }
.row.sub { color: var(--success); }
.ic { display: inline-block; width: 14px; color: var(--text-subtle); }
.view { overflow: auto; padding: 10px 14px; }
h4 { margin: 0 0 6px; font: 600 13px var(--font-mono); color: var(--accent-text); }
.view p { margin: 0 0 8px; color: var(--text-muted); font: 12.5px/1.45 var(--font-sans); }
pre { margin: 0; font: 12.5px/1.5 var(--font-mono); color: var(--text); white-space: pre-wrap; word-break: break-all; }
.hint { color: var(--text-subtle); font: 13px var(--font-sans); }
.pad { padding: 16px; }
</style>

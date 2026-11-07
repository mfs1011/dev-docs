<script setup>
// Haqiqiy bash terminali (xterm.js <-> VM serial port) + xira maslahat va Tab bilan tanlash.
// Joriy qator xterm buferidan o'qiladi (prompt belgisidan kursorgacha) — shuning uchun bash'ning o'z
// Tab to'ldirishi, tarix (↑) va tahrirlashdan keyin ham maslahat to'g'ri qoladi.
import { onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { suggest as gitSuggest } from './maslahat.js'

// suggest — maslahat funksiyasi (line, holat) => [{ add, full, d }]; standart — Git trenajoriniki
const props = defineProps({ holat: Object, suggest: { type: Function, default: gitSuggest } })
const emit = defineEmits(['send', 'holat', 'command', 'prompt'])

const box = ref(null)
const ghost = reactive({ show: false, x: 0, y: 0, text: '', items: [], sel: 0, below: true, cw: 9, ch: 18 })
let term, fit, prompt = null, atPrompt = false, timer = 0

function decodeB64(s) {
  const bin = atob(s)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

// prompt'dan kursorgacha yozilgan matn; kursor qator oxirida bo'lmasa — null (maslahat ko'rsatilmaydi)
function currentLine() {
  if (!prompt || !atPrompt) return null
  const b = term.buffer.active
  const cur = b.baseY + b.cursorY
  if (cur < prompt.row) return null
  let before = ''
  for (let r = prompt.row; r <= cur; r++) {
    const s = b.getLine(r)?.translateToString(false) ?? ''
    const from = r === prompt.row ? prompt.col : 0
    const to = r === cur ? b.cursorX : s.length
    before += s.slice(from, to)
  }
  const tail = (b.getLine(cur)?.translateToString(true) ?? '').slice(b.cursorX)
  if (tail.trim() !== '') return null
  return before
}

function cellSize() {
  const screen = term.element.querySelector('.xterm-screen')
  const r = screen.getBoundingClientRect()
  const outer = box.value.getBoundingClientRect()
  return { cw: r.width / term.cols, ch: r.height / term.rows, ox: r.left - outer.left, oy: r.top - outer.top }
}

function render() {
  const line = currentLine()
  const items = line == null ? [] : props.suggest(line, props.holat)
  if (!items.length) { ghost.show = false; return }
  if (ghost.sel >= items.length) ghost.sel = 0
  const { cw, ch, ox, oy } = cellSize()
  const b = term.buffer.active
  ghost.items = items
  ghost.text = items[ghost.sel].add
  ghost.cw = cw
  ghost.ch = ch
  ghost.x = ox + b.cursorX * cw
  ghost.y = oy + b.cursorY * ch
  ghost.below = b.cursorY < term.rows - 9
  ghost.show = true
}
const schedule = () => { clearTimeout(timer); timer = setTimeout(render, 30) }

function accept() {
  const it = ghost.items[ghost.sel]
  ghost.show = false
  ghost.sel = 0
  if (it) emit('send', it.add)
}

function onData(data) {
  if (ghost.show) {
    if (data === '\t' || (data === '\x1b[C' && ghost.text)) { accept(); return }
    if (ghost.items.length > 1 && (data === '\x1b[B' || data === '\x1b[A')) {
      ghost.sel = (ghost.sel + (data === '\x1b[B' ? 1 : ghost.items.length - 1)) % ghost.items.length
      ghost.text = ghost.items[ghost.sel].add
      return
    }
    if (data === '\x1b') { ghost.show = false; return }
  }
  if (data.includes('\r')) {
    const line = currentLine()
    if (line != null && line.trim()) emit('command', line.trim())
    atPrompt = false
  }
  ghost.show = false
  ghost.sel = 0
  emit('send', data)
}

function write(chunk) { term.write(chunk, schedule) }
function focus() { term?.focus() }
function size() { return { cols: term.cols, rows: term.rows } }
function reset() { term.reset() }
defineExpose({ write, focus, size, reset })

// fon — saytdagi kod bloklari rangi (--code-bg), ikkala mavzuda ham to'q
const themeColors = () => ({
  background: getComputedStyle(document.documentElement).getPropertyValue('--code-bg').trim() || '#1d2230',
  foreground: '#d7dde8', cursor: '#7ee787', selectionBackground: '#2f3b52',
})
// mavzu almashganda --code-bg ham o'zgaradi (data-theme keyingi kadrda qo'yiladi)
const onTheme = () => requestAnimationFrame(() => { if (term) term.options.theme = themeColors() })

let ro
onMounted(() => {
  term = new Terminal({
    fontFamily: 'Menlo, "DejaVu Sans Mono", monospace', fontSize: 15, lineHeight: 1.15, cursorBlink: true,
    scrollback: 3000,
    theme: themeColors(),
  })
  window.addEventListener('docs-theme-change', onTheme)
  fit = new FitAddon()
  term.loadAddon(fit)
  term.open(box.value)
  fit.fit()
  // repo holati (trenajor-holat skripti) — ekranga chiqmaydi
  term.parser.registerOscHandler(7771, (data) => { emit('holat', decodeB64(data)); return true })
  // prompt tayyor: shu nuqtadan keyin foydalanuvchi yozadi
  term.parser.registerOscHandler(7770, () => {
    const b = term.buffer.active
    prompt = { row: b.baseY + b.cursorY, col: b.cursorX }
    atPrompt = true
    emit('prompt')
    return true
  })
  term.onData(onData)
  term.onScroll(() => { ghost.show = false; schedule() })
  ro = new ResizeObserver(() => { fit.fit(); schedule() })
  ro.observe(box.value)
})
onBeforeUnmount(() => { ro?.disconnect(); window.removeEventListener('docs-theme-change', onTheme); term?.dispose() })
</script>

<template>
  <div class="term" ref="box" @click="focus">
    <div v-if="ghost.show" class="ghost" :style="{ left: ghost.x + 'px', top: ghost.y + 'px', height: ghost.ch + 'px', lineHeight: ghost.ch + 'px' }">{{ ghost.text }}</div>
    <div v-if="ghost.show" class="menu" :class="{ up: !ghost.below }"
      :style="{ left: Math.max(0, ghost.x - 8) + 'px', top: (ghost.below ? ghost.y + ghost.ch + 4 : ghost.y - 4) + 'px' }">
      <div v-for="(it, i) in ghost.items" :key="it.full" class="item" :class="{ on: i === ghost.sel }">
        <span class="k">{{ it.full.trim().split(' ').pop() }}</span><span class="d">{{ it.d }}</span>
      </div>
      <div class="hint"><b>Tab</b> tanlash · <b>↑↓</b> boshqasi · <b>Esc</b> yopish</div>
    </div>
  </div>
</template>

<style scoped>
.term { position: relative; height: 100%; background: var(--code-bg); padding: 10px 0 0 12px; box-sizing: border-box; }
.ghost { position: absolute; z-index: 5; pointer-events: none; color: #6b7689; font: 15px Menlo, "DejaVu Sans Mono", monospace; white-space: pre; }
.menu { position: absolute; z-index: 6; pointer-events: none; min-width: 300px; max-width: 520px; background: #1b2230; border: 1px solid #2f3b52; border-radius: 8px; padding: 4px 0; box-shadow: 0 8px 24px rgba(0, 0, 0, .45); font: 13px system-ui, sans-serif; }
.menu.up { transform: translateY(-100%); }
.item { display: flex; gap: 12px; padding: 4px 12px; align-items: baseline; }
.item.on { background: #253047; }
.k { font-family: Menlo, monospace; color: #7ee787; white-space: nowrap; }
.d { color: #9aa6ba; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hint { border-top: 1px solid #2f3b52; margin-top: 4px; padding: 4px 12px 2px; color: #6b7689; font-size: 11px; }
.hint b { color: #9aa6ba; font-weight: 600; }
</style>

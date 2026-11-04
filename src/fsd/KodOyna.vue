<script setup>
// Tanlangan faylni tahrirlash: shaffof textarea ostida highlight.js chizgan nusxa. `qator` — belgilanadigan qator.
import { computed, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('typescript', typescript)

const props = defineProps({ yol: String, matn: String, qator: Number })
const emit = defineEmits(['ozgar'])
const ta = ref(null)
const pre = ref(null)
const sTop = ref(0)
const html = computed(() => hljs.highlight((props.matn ?? '') + '\n', { language: 'typescript' }).value)
const scroll = () => {
  sTop.value = ta.value.scrollTop
  pre.value.scrollTop = ta.value.scrollTop
  pre.value.scrollLeft = ta.value.scrollLeft
}
function tab(e) {
  if (e.key !== 'Tab') return
  e.preventDefault()
  e.target.setRangeText('  ', e.target.selectionStart, e.target.selectionEnd, 'end')
  emit('ozgar', e.target.value)
}
watch(() => [props.yol, props.qator], () => {
  if (props.qator && ta.value) ta.value.scrollTop = Math.max(0, (props.qator - 3) * 20.8)
})
</script>

<template>
  <div class="oyna">
    <div class="sarlavha">{{ yol ?? 'Fayl tanlang' }}</div>
    <div v-if="matn != null" class="maydon">
      <div v-if="qator" class="belgi" :style="{ top: `${12 + (qator - 1) * 20.8 - sTop}px` }" />
      <pre ref="pre" aria-hidden="true"><code v-html="html" /></pre>
      <textarea ref="ta" :value="matn" spellcheck="false" :aria-label="`${yol} fayli`" @input="emit('ozgar', $event.target.value)" @scroll="scroll" @keydown="tab" />
    </div>
  </div>
</template>

<style scoped>
.oyna { display: flex; flex-direction: column; min-height: 0; background: var(--code-bg); }
.sarlavha { padding: 6px 12px; border-bottom: 1px solid #ffffff14; color: #9aa6ba; font: 12px var(--font-mono); }
.maydon { position: relative; flex: 1; min-height: 0; overflow: hidden; }
pre, textarea { position: absolute; inset: 0; margin: 0; padding: 12px 14px; overflow: auto; border: 0; font: 13px/1.6 var(--font-mono); tab-size: 2; white-space: pre; }
pre { color: var(--code-text); pointer-events: none; }
textarea { resize: none; outline: none; background: transparent; color: transparent; caret-color: #e6e9f0; }
.belgi { position: absolute; left: 0; right: 0; height: 20.8px; background: #ff8a8026; border-left: 3px solid #ff8a80; pointer-events: none; }
</style>

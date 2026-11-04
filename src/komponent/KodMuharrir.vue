<script setup>
// Fayl tablari va rangli kod muharriri: shaffof textarea ostida highlight.js chizgan nusxa turadi.
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)

const props = defineProps({ fayllar: Object, faol: String, xato: Object })
const emit = defineEmits(['update:faol', 'ozgar'])

const ta = ref(null)
const pre = ref(null)
const matn = computed(() => props.fayllar[props.faol] ?? '')
// .vue — xml (ichidagi <script>/<style> ni highlight.js o'zi JS/CSS deb taniydi), .jsx/.js — javascript
const html = computed(() => hljs.highlight(matn.value + '\n', { language: props.faol.endsWith('.vue') ? 'xml' : 'javascript' }).value)

function kirit(e) {
  emit('ozgar', props.faol, e.target.value)
}
function scroll() {
  pre.value.scrollTop = ta.value.scrollTop
  pre.value.scrollLeft = ta.value.scrollLeft
}
// Tab — 2 bo'shliq; Shift+Tab — qator boshidan olib tashlash
function tugma(e) {
  if (e.key !== 'Tab') return
  e.preventDefault()
  const el = e.target
  const { selectionStart: a, selectionEnd: b, value: v } = el
  if (e.shiftKey) {
    const bosh = v.lastIndexOf('\n', a - 1) + 1
    if (v.startsWith('  ', bosh)) {
      el.setRangeText('', bosh, bosh + 2, 'preserve')
      el.setSelectionRange(Math.max(bosh, a - 2), Math.max(bosh, b - 2))
    }
  } else el.setRangeText('  ', a, b, 'end')
  emit('ozgar', props.faol, el.value)
}
</script>

<template>
  <div class="muharrir">
    <div class="tablar" role="tablist">
      <button
        v-for="(_, f) in fayllar"
        :key="f"
        type="button"
        role="tab"
        :aria-selected="f === faol"
        :class="{ on: f === faol, xato: xato?.file === f }"
        @click="emit('update:faol', f)"
      >{{ f }}</button>
    </div>
    <div class="maydon">
      <pre ref="pre" aria-hidden="true"><code v-html="html" /></pre>
      <textarea
        ref="ta"
        :value="matn"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        :aria-label="`${faol} fayli`"
        @input="kirit"
        @scroll="scroll"
        @keydown="tugma"
      />
    </div>
  </div>
</template>

<style scoped>
.muharrir { display: flex; flex-direction: column; min-height: 0; background: var(--code-bg); }
.tablar { display: flex; gap: 2px; padding: 6px 8px 0; overflow-x: auto; border-bottom: 1px solid #ffffff14; }
.tablar button { padding: 6px 12px; border: 0; border-radius: 6px 6px 0 0; background: none; color: #9aa6ba; font: 12.5px var(--font-mono); cursor: pointer; white-space: nowrap; }
.tablar button.on { background: #ffffff12; color: #e6e9f0; }
.tablar button.xato { color: #ff8a80; }
.maydon { position: relative; flex: 1; min-height: 0; }
pre, textarea { position: absolute; inset: 0; margin: 0; padding: 12px 14px; overflow: auto; border: 0; font: 13px/1.6 var(--font-mono); tab-size: 2; white-space: pre; }
pre { color: var(--code-text); pointer-events: none; }
textarea { resize: none; outline: none; background: transparent; color: transparent; caret-color: #e6e9f0; }
textarea::selection { background: #4cc79a44; color: transparent; }
</style>

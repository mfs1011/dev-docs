<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * Bobni tinglash: `npm run tts` yaratgan `<bob>.ogg` va `<bob>.timings.json` (docs/tts.md).
 * O'qilayotgan paragraf `.markable[data-line]` bo'yicha belgilanadi — o'sha qator raqamlari
 * segmentlarda ham saqlangan. Audio bo'lmagan bobda tugma umuman ko'rinmaydi.
 */
const props = defineProps({
  page: { type: Object, default: null },
  container: { type: Object, default: null },
})

// Saytda: `public/tinglash/` (`npm run tts:publish`); dev'da Vite yangi audio'ni `audio/` dan ham beradi.
// Kelajakda tashqi ombor bo'lsa — VITE_AUDIO_BASE_URL
const BASE = import.meta.env.VITE_AUDIO_BASE_URL || `${import.meta.env.BASE_URL}tinglash/`
const VOICE = import.meta.env.VITE_AUDIO_VOICE || 'Charon'
const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

const available = ref(false)
const open = ref(false)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)
const speed = ref(1)
const follow = ref(true)

let audio = null
let timings = []
let words = []
let highlighted = null
let frame = 0
let activeWord = -1
// Audio va so'z vaqtlari bir xil versiyadan bo'lsin: fayl qayta yozilsa, brauzer keshidagi eskisi ishlatilmaydi
let version = ''
// Sahifadagi so'zlar: qator → [{ token, range }] (birinchi kerak bo'lganda hisoblanadi)
const domWords = new Map()
const WORD_HIGHLIGHT = 'tinglash-soz'
const supportsWordHighlight = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined'

const source = computed(() => {
  if (!BASE || !props.page?.file) return null

  return `${BASE}${VOICE}/${props.page.file.replace(/\.md$/, '')}`
})

const format = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0))

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const progress = computed(() => (duration.value ? (current.value / duration.value) * 100 : 0))

// Belgilanadigan elementlar ro'yxati bir marta yig'iladi (har kadrda DOM qidirilmasin)
let markables = null

function elementFor(line) {
  // Bob sarlavhasi (H1) `.markable` emas, lekin u ham o'qiladi
  markables ??= [...(props.container?.querySelectorAll('.markable[data-line], h1[data-line]') ?? [])]

  const nodes = markables
  let best = null

  // Aniq qator bo'lmasa (masalan, ro'yxat ichidagi yashirin paragraf) — undan oldingi eng yaqin element
  for (const node of nodes) {
    const value = Number(node.dataset.line)

    if (value <= line && (!best || value >= Number(best.dataset.line))) best = node
  }

  return best
}

/** Joriy so'z indeksi: boshlanishi `time` dan oldingi oxirgi so'z (ikkilik qidiruv) */
function wordAt(time) {
  let low = 0
  let high = words.length - 1
  let found = -1

  while (low <= high) {
    const middle = (low + high) >> 1

    if (words[middle].s <= time) {
      found = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return found
}

function highlight(time) {
  let entry = null

  // So'z vaqtlari bor bo'lsa — paragraf ham aniq so'z bo'yicha; bo'lmasa taxminiy `timings`
  if (words.length) {
    const word = words[wordAt(time)]
    entry = word ? { line: word.line } : null
  } else {
    for (const item of timings) {
      if (item.at <= time + 0.05) entry = item
      else break
    }
  }

  const node = entry ? elementFor(entry.line) : null

  if (node === highlighted) return

  highlighted?.classList.remove('is-reading')
  highlighted = node
  node?.classList.add('is-reading')

  if (node && follow.value) {
    const rect = node.getBoundingClientRect()

    if (rect.top < 80 || rect.bottom > window.innerHeight - 120) node.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

function clearHighlight() {
  highlighted?.classList.remove('is-reading')
  highlighted = null
  activeWord = -1
  if (supportsWordHighlight) CSS.highlights.delete(WORD_HIGHLIGHT)
}

/** Taqqoslash uchun so'z: kichik harf, apostroflar bir xil, belgilar olib tashlangan */
const normalize = (word) => String(word).toLowerCase().replace(/[ʻʼ’‘`´]/g, "'").replace(/[^\p{L}\p{N}']/gu, '')

/** Element ichidagi so'zlar va ularning DOM Range'lari (kod bloklari tashlab ketiladi) */
function wordsOf(line) {
  if (domWords.has(line)) return domWords.get(line)

  const element = elementFor(line)
  const list = []

  if (element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement?.closest('pre, .line-mark, .code-copy') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    })

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.data.matchAll(/\S+/g)) {
        const token = normalize(match[0])
        if (!token) continue

        const range = document.createRange()
        range.setStart(node, match.index)
        range.setEnd(node, match.index + match[0].length)
        list.push({ token, range })
      }
    }
  }

  // Segment so'zlarini sahifadagi so'zlarga ketma-ket moslash (URL o'rniga "havola" kabi farqlar o'tkazib yuboriladi)
  const mapped = new Map()
  let cursor = 0

  for (const item of words.filter((word) => word.line === line)) {
    const token = normalize(item.word)
    if (!token) continue

    for (let index = cursor; index < Math.min(list.length, cursor + 8); index += 1) {
      if (list[index].token === token) {
        mapped.set(item.w, list[index].range)
        cursor = index + 1
        break
      }
    }
  }

  domWords.set(line, mapped)

  return mapped
}

function highlightWord(time) {
  if (!supportsWordHighlight || !words.length) return

  let found = wordAt(time)

  // So'z vaqti g'ayritabiiy uzun bo'lsa (ovoz va matn mos kelmagan joy) — highlight 1 s dan ortiq turmasin
  if (found >= 0 && time > Math.min(words[found].e, words[found].s + 1) + 0.15) found = -1

  if (found === activeWord) return
  activeWord = found

  const word = words[found]
  const range = word ? wordsOf(word.line).get(word.w) : null

  if (range) CSS.highlights.set(WORD_HIGHLIGHT, new Highlight(range))
  else CSS.highlights.delete(WORD_HIGHLIGHT)
}

/** timeupdate soniyasiga ~4 marta keladi — so'z uchun kam, shuning uchun har kadrda */
function tick() {
  if (!audio || audio.paused) return

  highlightWord(audio.currentTime)
  if (words.length) highlight(audio.currentTime)
  frame = requestAnimationFrame(tick)
}

/** Paragrafni bosib — o'sha joydan tinglash */
function onContainerClick(event) {
  if (!open.value || !audio || event.target.closest('a, button, input, .line-mark, .code-copy')) return

  const node = event.target.closest('.markable[data-line]')
  if (!node) return

  const line = Number(node.dataset.line)
  const entry = [...timings].reverse().find((item) => item.line <= line)

  if (entry) {
    audio.currentTime = entry.at
    audio.play()
  }
}

async function probe() {
  available.value = false
  close()

  if (!source.value) return

  try {
    const response = await fetch(`${source.value}.timings.json`, { cache: 'no-cache' })

    if (!response.ok) return

    version = String(Date.now())
    timings = (await response.json()).sort((a, b) => a.at - b.at)
    available.value = timings.length > 0

    // So'z vaqtlari ixtiyoriy (`npm run tts:align`) — bo'lmasa faqat paragraf belgilanadi
    words = []
    domWords.clear()
    markables = null

    const wordResponse = await fetch(`${source.value}.words.json`, { cache: 'no-cache' }).catch(() => null)

    if (wordResponse?.ok) words = await wordResponse.json().catch(() => [])
  } catch {
    // Audio yo'q yoki tarmoq yo'q — tugma ko'rinmaydi
  }
}

function start() {
  if (!audio) {
    audio = new Audio(`${source.value}.ogg?v=${version}`)
    audio.preload = 'metadata'
    audio.playbackRate = speed.value
    audio.addEventListener('loadedmetadata', () => { duration.value = audio.duration })
    audio.addEventListener('timeupdate', () => {
      current.value = audio.currentTime
      highlight(audio.currentTime)
    })
    audio.addEventListener('play', () => {
      playing.value = true
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(tick)
    })
    audio.addEventListener('seeked', () => highlightWord(audio.currentTime))
    audio.addEventListener('pause', () => { playing.value = false })
    audio.addEventListener('ended', () => {
      playing.value = false
      clearHighlight()
    })
  }

  open.value = true
  audio.play()
}

function toggle() {
  if (!audio || audio.paused) start()
  else audio.pause()
}

function skip(seconds) {
  if (!audio) return

  audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), duration.value || audio.currentTime)
}

function seek(event) {
  if (!audio || !duration.value) return

  const rect = event.currentTarget.getBoundingClientRect()

  audio.currentTime = ((event.clientX - rect.left) / rect.width) * duration.value
}

function cycleSpeed() {
  speed.value = SPEEDS[(SPEEDS.indexOf(speed.value) + 1) % SPEEDS.length]
  if (audio) audio.playbackRate = speed.value
}

function close() {
  cancelAnimationFrame(frame)
  audio?.pause()
  audio = null
  open.value = false
  playing.value = false
  current.value = 0
  duration.value = 0
  clearHighlight()
}

watch(source, probe, { immediate: true })

watch(
  () => props.container,
  (element, previous) => {
    previous?.removeEventListener('click', onContainerClick)
    element?.addEventListener('click', onContainerClick)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  props.container?.removeEventListener('click', onContainerClick)
  close()
})
</script>

<template>
    <button v-if="available && !open" type="button" class="listen-start" @click="start">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.8v10.4L13 8z" /></svg>
        Tinglash
    </button>

    <Teleport to="body">
        <div v-if="open" class="listen-bar" role="region" aria-label="Bobni tinglash">
            <div class="listen-inner">
                <button type="button" class="listen-btn" aria-label="15 soniya orqaga" @click="skip(-15)">−15</button>
                <button type="button" class="listen-btn listen-play" :aria-label="playing ? 'Pauza' : 'Davom etish'" @click="toggle">
                    <svg v-if="playing" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg>
                    <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.8v10.4L13 8z" /></svg>
                </button>
                <button type="button" class="listen-btn" aria-label="15 soniya oldinga" @click="skip(15)">+15</button>

                <div class="listen-track" role="slider" aria-label="Joy" :aria-valuenow="Math.round(current)" aria-valuemin="0" :aria-valuemax="Math.round(duration)" @click="seek">
                    <span :style="{ width: `${progress}%` }" />
                </div>

                <span class="listen-time">{{ format(current) }} / {{ format(duration) }}</span>

                <button type="button" class="listen-btn listen-speed" aria-label="Tezlik" @click="cycleSpeed">{{ speed }}×</button>
                <label class="listen-follow" title="O'qilayotgan joyga avtomatik surish">
                    <input v-model="follow" type="checkbox">
                    <span>kuzatish</span>
                </label>
                <button type="button" class="listen-btn" aria-label="Yopish" @click="close">✕</button>
            </div>
        </div>
    </Teleport>
</template>

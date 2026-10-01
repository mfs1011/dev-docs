<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { books, findBook } from '@/docs'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: null },
})

const emit = defineEmits(['close'])

const router = useRouter()
const term = ref('')
const input = ref(null)

/** Qidiruv indeksi alohida chunk — faqat qidiruv birinchi ochilganda yuklanadi */
const searchIndex = ref(null)

async function loadIndex() {
  if (searchIndex.value) return
  searchIndex.value = (await import('@/search-index.json')).default
}

const index = computed(() => {
  if (!searchIndex.value) return []

  const book = findBook(props.bookId)
  if (book) return searchIndex.value[book.id] ?? []

  return books.flatMap((item) => searchIndex.value[item.id] ?? [])
})

const results = computed(() => {
  const query = term.value.trim().toLowerCase()
  if (query.length < 2) return []

  return index.value
    .filter((entry) => entry.text.toLowerCase().includes(query))
    .slice(0, 30)
})

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    loadIndex()
    term.value = ''
    await nextTick()
    input.value?.focus()
  },
)

const go = (entry) => {
  router.push(entry.anchor ? `${entry.route}#${entry.anchor}` : entry.route)
  emit('close')
}
</script>

<template>
    <div v-if="open" class="search-overlay" @click.self="emit('close')">
        <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Qidiruv">
            <input
                ref="input"
                v-model="term"
                type="search"
                placeholder="Sarlavha yoki bo'lim nomi…"
                @keydown.esc="emit('close')"
            >

            <ul v-if="results.length" class="search-results">
                <li v-for="(entry, index) in results" :key="index">
                    <button type="button" @click="go(entry)">
                        <span class="search-result-text">{{ entry.text }}</span>
                        <span class="search-result-page">{{ entry.title }}</span>
                    </button>
                </li>
            </ul>

            <p v-else-if="term.trim().length >= 2" class="search-empty">Natija yo'q.</p>
            <p v-else class="search-hint">Kamida 2 ta belgi kiriting. Yopish — Esc.</p>
        </div>
    </div>
</template>

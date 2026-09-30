<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VariantToggle from '@/components/VariantToggle.vue'
import { findBook } from '@/docs'
import { markFor } from '@/progress'

const props = defineProps({
  bookId: { type: String, default: null },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate'])

const route = useRoute()
const filter = ref('')

const book = computed(() => findBook(props.bookId))
const sections = computed(() => book.value?.sections ?? [])

const visibleSections = computed(() => {
  const term = filter.value.trim().toLowerCase()
  if (!term) return sections.value

  return sections.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.label.toLowerCase().includes(term)),
    }))
    .filter((section) => section.items.length > 0)
})

const isActive = (item) => route.path === item.route

/** Shu bobda o'qish belgisi turibdimi */
const mark = computed(() => markFor(props.bookId))
const isMarked = (item) => mark.value?.route === item.route

const nav = ref(null)

/** Chetdan shuncha joy qolsa, element "ko'rinadi" deb hisoblanadi */
const REVEAL_MARGIN = 24

/**
 * Aktiv bo'limni ko'rinadigan joyga suradi (uzun ro'yxatda muhim).
 *
 * scrollIntoView ishlatilmaydi: u butun sahifani ham suradi va bosilgan
 * element kursor ostidan qochib ketardi. Faqat sidebar konteyneri suriladi
 * va faqat element ko'rinmay qolgan bo'lsa. Birinchi ochilishda — markazga,
 * keyingi o'tishlarda (pager, qidiruv) — eng kam harakat bilan.
 */
async function revealActive({ center = false } = {}) {
  await nextTick()

  const item = nav.value?.querySelector('.is-active')
  const box = item?.closest('.sidebar-inner')
  if (!item || !box) return

  const itemRect = item.getBoundingClientRect()
  const boxRect = box.getBoundingClientRect()
  const top = itemRect.top - boxRect.top
  const bottom = itemRect.bottom - boxRect.top

  if (center) {
    box.scrollTop += top - (box.clientHeight - itemRect.height) / 2
  } else if (top < REVEAL_MARGIN) {
    box.scrollTop += top - REVEAL_MARGIN
  } else if (bottom > box.clientHeight - REVEAL_MARGIN) {
    box.scrollTop += bottom - box.clientHeight + REVEAL_MARGIN
  }
}

onMounted(() => revealActive({ center: true }))
watch(() => route.path, () => revealActive())
</script>

<template>
    <aside class="sidebar" :class="{ 'is-open': open }">
        <div class="sidebar-inner">
            <div v-if="book?.variants" class="sidebar-variants">
                <p class="sidebar-variants-label">{{ book.variants.label }}</p>

                <VariantToggle
                    :key="book.id"
                    :group="book.variants.group"
                    :options="book.variants.options"
                    :label="book.variants.label"
                />
            </div>

            <div class="sidebar-filter">
                <input
                    v-model="filter"
                    type="search"
                    placeholder="Bo'limlar ichida filtr…"
                    aria-label="Bo'limlarni filtrlash"
                >
            </div>

            <nav ref="nav" class="sidebar-nav" aria-label="Bo'limlar">
                <div v-for="section in visibleSections" :key="section.title" class="sidebar-group">
                    <p class="sidebar-group-title">{{ section.title }}</p>
                    <ul>
                        <li v-for="item in section.items" :key="item.route">
                            <RouterLink
                                :to="item.route"
                                :class="{ 'is-active': isActive(item) }"
                                @click="emit('navigate')"
                            >
                                <span v-if="item.chapter" class="sidebar-number">
                                    {{ String(item.chapter).padStart(2, '0') }}
                                </span>
                                <span class="sidebar-label">{{ item.label }}</span>

                                <svg
                                    v-if="isMarked(item)"
                                    class="sidebar-mark"
                                    viewBox="0 0 12 14"
                                    aria-label="O'qish belgisi shu yerda"
                                    role="img"
                                >
                                    <path d="M2 1h8v12l-4-3.2L2 13z" />
                                </svg>
                            </RouterLink>
                        </li>
                    </ul>
                </div>

                <p v-if="!visibleSections.length" class="sidebar-empty">Hech narsa topilmadi.</p>
            </nav>
        </div>
    </aside>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findBook } from '@/docs'

const props = defineProps({
  bookId: { type: String, default: null },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate'])

const route = useRoute()
const filter = ref('')

const sections = computed(() => findBook(props.bookId)?.sections ?? [])

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

const nav = ref(null)

/** Aktiv bo'limni ko'rinadigan joyga suradi (uzun ro'yxatda muhim). */
async function revealActive() {
  await nextTick()
  nav.value?.querySelector('.is-active')?.scrollIntoView({ block: 'center' })
}

onMounted(revealActive)
watch(() => route.path, revealActive)
</script>

<template>
    <aside class="sidebar" :class="{ 'is-open': open }">
        <div class="sidebar-inner">
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
                            </RouterLink>
                        </li>
                    </ul>
                </div>

                <p v-if="!visibleSections.length" class="sidebar-empty">Hech narsa topilmadi.</p>
            </nav>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  headings: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
})

const items = computed(() => props.headings.filter((heading) => heading.level <= 3))
</script>

<template>
    <aside class="toc" aria-label="Sahifa ichidagi bo'limlar">
        <p class="toc-title">Shu sahifada</p>

        <ul v-if="items.length" class="toc-list">
            <li
                v-for="heading in items"
                :key="heading.id"
                :class="[`toc-level-${heading.level}`, { 'is-active': heading.id === activeId }]"
            >
                <a :href="`#${heading.id}`">{{ heading.text }}</a>
            </li>
        </ul>

        <p v-else class="toc-empty">Bo'limlar yo'q.</p>
    </aside>
</template>

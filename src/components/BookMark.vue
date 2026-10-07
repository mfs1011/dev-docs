<script setup>
import SymfonyMark from '@/components/SymfonyMark.vue'
import LaravelMark from '@/components/LaravelMark.vue'
import VueMark from '@/components/VueMark.vue'
import ReactMark from '@/components/ReactMark.vue'
import NextMark from '@/components/NextMark.vue'
import ArchMark from '@/components/ArchMark.vue'
import AngularMark from '@/components/AngularMark.vue'
import FsdMark from '@/components/FsdMark.vue'

defineProps({
  book: { type: String, required: true },
  size: { type: Number, default: 30 },
})

/** Rasmiy logolar fayl sifatida (ranglari mavzuga bog'liq emas): public/marks/<nom>.svg */
const FILE_MARKS = {
  sql: { file: 'postgresql.svg', alt: 'PostgreSQL' },
  git: { file: 'git.svg', alt: 'Git' },
  docker: { file: 'docker.svg', alt: 'Docker' },
}
const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
</script>

<template>
    <SymfonyMark v-if="book === 'symfony'" :size="size" />
    <LaravelMark v-else-if="book === 'laravel'" :size="size" />
    <VueMark v-else-if="book === 'vue'" :size="size" />
    <ReactMark v-else-if="book === 'react'" :size="size" />
    <NextMark v-else-if="book === 'nextjs'" :size="size" />
    <AngularMark v-else-if="book === 'angular'" :size="size" />
    <ArchMark v-else-if="book === 'arxitektura'" :size="size" />
    <FsdMark v-else-if="book === 'fsd'" :size="size" />
    <img
        v-else-if="FILE_MARKS[book]"
        class="file-mark"
        :src="`${base}marks/${FILE_MARKS[book].file}`"
        :alt="FILE_MARKS[book].alt"
        :width="size"
        :height="size"
    >
    <span v-else class="book-mark-fallback" :style="{ width: `${size}px`, height: `${size}px` }">
        {{ book.slice(0, 2).toUpperCase() }}
    </span>
</template>

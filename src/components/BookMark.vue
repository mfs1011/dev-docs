<script setup>
import SymfonyMark from '@/components/SymfonyMark.vue'
import LaravelMark from '@/components/LaravelMark.vue'

defineProps({
  book: { type: String, required: true },
  size: { type: Number, default: 30 },
})
</script>

<template>
    <SymfonyMark v-if="book === 'symfony'" :size="size" />
    <LaravelMark v-else-if="book === 'laravel'" :size="size" />
    <span v-else class="book-mark-fallback" :style="{ width: `${size}px`, height: `${size}px` }">
        {{ book.slice(0, 2).toUpperCase() }}
    </span>
</template>

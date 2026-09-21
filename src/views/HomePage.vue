<script setup>
import { onMounted } from 'vue'
import BookMark from '@/components/BookMark.vue'
import { books, formatDate } from '@/docs'

onMounted(() => {
  document.title = "Qo'llanmalar — Symfony va Laravel"
})
</script>

<template>
    <main class="home">
        <section class="home-hero">
            <h1>Qo'llanmalar</h1>
            <p>
                Rasmiy hujjatlar asosida yozilgan, o'zbek tilidagi to'liq qo'llanmalar.
                Har bobda: tushuncha → nega shunday → kod → tipik xatolar → amaliyot.
            </p>
        </section>

        <div class="home-grid">
            <RouterLink v-for="book in books" :key="book.id" :to="`/${book.id}`" class="book-card">
                <span class="book-card-mark" :style="{ '--card-accent': book.accent }">
                    <BookMark :book="book.id" :size="40" />
                </span>

                <span class="book-card-body">
                    <span class="book-card-title">
                        {{ book.title }}
                        <em v-if="book.version">v{{ book.version }}</em>
                    </span>
                    <span class="book-card-subtitle">{{ book.subtitle }}</span>

                    <span class="book-card-meta">
                        <span>{{ book.chapterCount }} bob</span>
                        <span>{{ book.pageCount }} sahifa</span>
                        <span v-if="book.updatedAt">{{ formatDate(book.updatedAt) }}</span>
                    </span>
                </span>

                <span class="book-card-cta">Ochish →</span>
            </RouterLink>
        </div>
    </main>
</template>

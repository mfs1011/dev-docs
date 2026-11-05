<script setup>
// Yo'nalish sahifasi (yo'l xaritasi): shu yo'nalish kitoblari o'qish tartibida — har qadamda nega kerakligi,
// o'qish holati va hali yozilmaganlari «rejada» deb.
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import BookMark from '@/components/BookMark.vue'
import { findBook, findYonalish, yonalishlar } from '@/docs'
import { bookProgress } from '@/progress'

const route = useRoute()
const y = computed(() => findYonalish(route.params.id))
const qadamlar = computed(() => (y.value?.qadamlar ?? []).map((q) => ({ ...q, book: q.kitob ? findBook(q.kitob) : null })))

watchEffect(() => {
  document.title = y.value ? `${y.value.title} — yo'l xaritasi` : "Yo'nalish topilmadi"
})
</script>

<template>
    <main class="yonalish">
        <div class="yonalish-inner">
            <RouterLink to="/" class="yonalish-back">← Bosh sahifa</RouterLink>

            <template v-if="y">
                <p class="yonalish-kicker">// yo'nalish</p>
                <h1 class="yonalish-title">{{ y.title }}</h1>
                <p class="yonalish-izoh">{{ y.izoh }}</p>

                <ol class="yonalish-qadamlar">
                    <li
                        v-for="(q, i) in qadamlar"
                        :key="q.kitob ?? q.rejada"
                        :class="{ reja: !q.book }"
                        :style="q.book ? { '--c-light': q.book.accent, '--c-dark': q.book.accentDark ?? q.book.accent } : null"
                    >
                        <span class="yonalish-raqam">{{ i + 1 }}</span>
                        <RouterLink v-if="q.book" :to="`/${q.book.id}`" class="yonalish-karta">
                            <BookMark :book="q.book.id" :size="30" />
                            <span class="yonalish-matn">
                                <strong>{{ q.book.title }}</strong>
                                <span>{{ q.nega }}</span>
                                <small>
                                    <template v-if="bookProgress(q.book).read">{{ bookProgress(q.book).read }}/{{ bookProgress(q.book).total }} bob o'qildi</template>
                                    <template v-else-if="q.book.chapterCount">{{ q.book.chapterCount }} bob</template>
                                    <template v-else>mundarija tayyor, boblar yozilmoqda</template>
                                </small>
                            </span>
                            <span v-if="bookProgress(q.book).read" class="yonalish-progress" :style="{ width: `${bookProgress(q.book).percent}%` }" />
                        </RouterLink>
                        <div v-else class="yonalish-karta">
                            <span class="yonalish-matn">
                                <strong>{{ q.rejada }}</strong>
                                <span>{{ q.nega }}</span>
                                <small>rejada — hali yozilmagan</small>
                            </span>
                        </div>
                    </li>
                </ol>

                <nav class="yonalish-boshqa" aria-label="Boshqa yo'nalishlar">
                    <span>Boshqa yo'nalishlar:</span>
                    <RouterLink v-for="o in yonalishlar.filter((o) => o.id !== y.id)" :key="o.id" :to="`/yonalish/${o.id}`">{{ o.title }}</RouterLink>
                </nav>
            </template>

            <p v-else class="yonalish-izoh">Bunday yo'nalish yo'q.</p>
        </div>
    </main>
</template>

<style scoped>
.yonalish { padding: 32px 24px 64px; }
.yonalish-inner { max-width: 760px; margin: 0 auto; }
.yonalish-back { color: var(--text-muted); font-size: 13px; text-decoration: none; }
.yonalish-back:hover { color: var(--accent-text); }
.yonalish-kicker { margin: 24px 0 4px; color: var(--text-subtle); font: 600 12px var(--font-mono); }
.yonalish-title { margin: 0; font-size: 30px; }
.yonalish-izoh { margin: 8px 0 28px; color: var(--text-muted); font-size: 15px; line-height: 1.55; }
.yonalish-qadamlar { margin: 0; padding: 0; list-style: none; }
.yonalish-qadamlar li { position: relative; display: flex; gap: 14px; padding-bottom: 14px; --card-accent: var(--c-light, var(--accent)); }
:root[data-theme='dark'] .yonalish-qadamlar li { --card-accent: var(--c-dark, var(--accent)); }
/* qadamlar orasidagi chiziq — o'qish tartibi */
.yonalish-qadamlar li:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 34px; bottom: 0; border-left: 2px solid var(--border); }
.yonalish-raqam { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border: 2px solid var(--card-accent); border-radius: 50%; background: var(--bg-elevated); font: 700 13px var(--font-mono); }
.reja .yonalish-raqam { border-style: dashed; border-color: var(--border-strong); color: var(--text-subtle); }
.yonalish-karta { position: relative; flex: 1; display: flex; gap: 12px; align-items: flex-start; overflow: hidden; padding: 12px 14px; border: 1px solid var(--border); border-left: 3px solid var(--card-accent); border-radius: var(--radius); background: var(--bg-elevated); color: var(--text); text-decoration: none; }
a.yonalish-karta:hover { border-color: var(--card-accent); }
.reja .yonalish-karta { border-style: dashed; border-left-color: var(--border-strong); background: transparent; }
.yonalish-matn { display: grid; gap: 3px; }
.yonalish-matn strong { font-size: 15px; }
.yonalish-matn span { color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
.yonalish-matn small { color: var(--text-subtle); font: 12px var(--font-mono); }
.yonalish-progress { position: absolute; left: 0; bottom: 0; height: 3px; background: var(--card-accent); }
.yonalish-boshqa { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-subtle); font-size: 13px; }
.yonalish-boshqa a { color: var(--accent-text); text-decoration: none; }
.yonalish-boshqa a:hover { text-decoration: underline; }
@media (max-width: 640px) { .yonalish { padding: 20px 16px 48px; } .yonalish-title { font-size: 24px; } }
</style>

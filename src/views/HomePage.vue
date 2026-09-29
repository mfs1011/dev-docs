<script setup>
import { computed, onMounted } from 'vue'
import BookMark from '@/components/BookMark.vue'
import { books, formatDate } from '@/docs'
import { markFor } from '@/progress'

const totals = computed(() =>
  books.reduce(
    (sum, book) => ({
      chapters: sum.chapters + (book.chapterCount ?? 0),
      pages: sum.pages + (book.pageCount ?? 0),
    }),
    { chapters: 0, pages: 0 },
  ),
)

/** Boblari hali yozilmagan kitob — kartada "tayyorlanmoqda" deb ko'rsatiladi */
const isDraft = (book) => !book.chapterCount

/** Kitobda qoldirilgan o'qish belgisi */
const bookMark = (book) => markFor(book.id)

onMounted(() => {
  document.title = "Qo'llanmalar — backend va frontend"
})
</script>

<template>
    <main class="home">
        <div class="home-inner">
            <section class="home-hero">
                <p class="home-prompt">
                    <span aria-hidden="true">$</span>
                    <code>qollanmalar --lang=uz --level=0..senior</code>
                </p>

                <h1 class="home-title">
                    Dasturchi qo'llanmalari
                </h1>

                <p class="home-lead">
                    Rasmiy hujjatlar asosida yozilgan to'liq qo'llanmalar.
                    Har bob bir xil skeletda:
                </p>

                <ol class="home-skeleton">
                    <li>Tushuncha</li>
                    <li>Nega shunday</li>
                    <li>Kod</li>
                    <li>Muhandislik nuqtai nazari</li>
                    <li>Tipik xatolar</li>
                    <li>Amaliyot</li>
                </ol>

                <dl class="home-stats">
                    <div class="home-stat">
                        <dt>qo'llanma</dt>
                        <dd>{{ books.length }}</dd>
                    </div>
                    <div class="home-stat">
                        <dt>bob</dt>
                        <dd>{{ totals.chapters }}</dd>
                    </div>
                    <div class="home-stat">
                        <dt>sahifa</dt>
                        <dd>{{ totals.pages }}</dd>
                    </div>
                </dl>
            </section>

            <h2 class="home-section-title">Qo'llanmalar</h2>

            <div class="home-grid">
                <div
                    v-for="book in books"
                    :key="book.id"
                    class="book-cell"
                    :style="{ '--c-light': book.accent, '--c-dark': book.accentDark ?? book.accent }"
                >
                <RouterLink
                    :to="`/${book.id}`"
                    class="book-card"
                    :class="{ 'is-draft': isDraft(book), 'has-mark': Boolean(bookMark(book)) }"
                >
                    <span class="book-card-head">
                        <span class="book-card-mark">
                            <BookMark :book="book.id" :size="34" />
                        </span>

                        <span v-if="book.version" class="book-card-version">{{ book.version }}</span>
                        <span v-else class="book-card-version is-soon">tayyorlanmoqda</span>
                    </span>

                    <h3 class="book-card-title">{{ book.title }}</h3>
                    <p class="book-card-subtitle">{{ book.subtitle }}</p>

                    <span class="book-card-path">content/{{ book.id }}/</span>

                    <span class="book-card-foot">
                        <span class="book-card-count">
                            <template v-if="isDraft(book)">mundarija</template>
                            <template v-else>{{ book.chapterCount }} bob</template>
                        </span>

                        <span v-if="book.updatedAt" class="book-card-date">
                            {{ formatDate(book.updatedAt) }}
                        </span>

                        <span class="book-card-cta" aria-hidden="true">
                            <svg viewBox="0 0 16 16">
                                <path d="M3 8h9M8.5 4l4 4-4 4" />
                            </svg>
                        </span>
                    </span>
                </RouterLink>

                <RouterLink
                    v-if="bookMark(book)"
                    :to="`${bookMark(book).route}#belgi`"
                    class="book-resume"
                >
                    <svg viewBox="0 0 12 14" aria-hidden="true"><path d="M2 1h8v12l-4-3.2L2 13z" /></svg>

                    <span class="book-resume-body">
                        <span class="book-resume-title">
                            <template v-if="bookMark(book).chapter">
                                {{ String(bookMark(book).chapter).padStart(2, '0') }}-bob
                            </template>
                            <template v-else>{{ bookMark(book).title }}</template>
                            — davom etish
                        </span>
                        <span v-if="bookMark(book).excerpt" class="book-resume-excerpt">
                            {{ bookMark(book).excerpt }}
                        </span>
                    </span>
                </RouterLink>
                </div>
            </div>
        </div>
    </main>
</template>

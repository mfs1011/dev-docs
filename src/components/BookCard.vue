<script setup>
// Kitob kartasi: bosh sahifa va yo'nalish sahifasida bir xil — versiya, bob soni yoki o'qish holati, o'qish belgisi.
import BookMark from '@/components/BookMark.vue'
import { formatDate } from '@/docs'
import { bookProgress, markFor } from '@/progress'

defineProps({ book: { type: Object, required: true } })

/** Boblari hali yozilmagan kitob — kartada "tayyorlanmoqda" deb ko'rsatiladi */
const isDraft = (book) => !book.chapterCount

/** Kitobda qoldirilgan o'qish belgisi */
const bookMark = (book) => markFor(book.id)
</script>

<template>
    <div
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

                <span v-if="book.badge || book.version" class="book-card-version">{{ book.badge ?? book.version }}</span>
                <span v-else-if="isDraft(book)" class="book-card-version is-soon">tayyorlanmoqda</span>
            </span>

            <h3 class="book-card-title">{{ book.title }}</h3>
            <p class="book-card-subtitle">{{ book.subtitle }}</p>

            <span class="book-card-path">content/{{ book.id }}/</span>

            <span class="book-card-foot">
                <span class="book-card-count">
                    <template v-if="isDraft(book)">mundarija</template>
                    <template v-else-if="bookProgress(book).read">
                        {{ bookProgress(book).read }}/{{ bookProgress(book).total }} bob
                    </template>
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

            <span
                v-if="bookProgress(book).read"
                class="book-card-progress"
                role="progressbar"
                :aria-valuenow="bookProgress(book).percent"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`${book.title}: ${bookProgress(book).percent}% o'qildi`"
            >
                <span :style="{ width: `${bookProgress(book).percent}%` }" />
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
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import BookMark from '@/components/BookMark.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { applyBookTheme, bookIdFromRoute, books, docsUpdatedAt, findBook, formatDate } from '@/docs'

const route = useRoute()
const sidebarOpen = ref(false)
const searchOpen = ref(false)

const activeBookId = computed(() => bookIdFromRoute(route.path))
const activeBook = computed(() => findBook(activeBookId.value))
const updatedLabel = computed(() => formatDate(activeBook.value?.updatedAt ?? docsUpdatedAt))

watch(activeBook, (book) => applyBookTheme(book), { immediate: true })

const onKeydown = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('docs-theme-change', () => applyBookTheme(activeBook.value))
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
    <div class="layout" :class="{ 'is-home': !activeBook }">
        <header class="topbar">
            <div class="topbar-left">
                <button
                    v-if="activeBook"
                    type="button"
                    class="menu-button"
                    aria-label="Menyu"
                    @click="sidebarOpen = !sidebarOpen"
                >
                    ☰
                </button>

                <RouterLink to="/" class="brand">
                    <BookMark :book="activeBookId ?? 'symfony'" :size="30" />
                    <span class="brand-text">
                        <strong>{{ activeBook?.title ?? 'Qo\'llanmalar' }}</strong>
                        <small>{{ activeBook?.subtitle ?? 'Symfony va Laravel' }}</small>
                    </span>
                </RouterLink>

                <span
                    v-if="activeBook?.version"
                    class="version-badge"
                    :title="`${activeBook.versionLabel} ${activeBook.version} bo'yicha yozilgan`"
                >
                    v{{ activeBook.version }}
                </span>
            </div>

            <button type="button" class="search-trigger" @click="searchOpen = true">
                <svg class="search-trigger-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.4" />
                    <line x1="15.8" y1="15.8" x2="20.5" y2="20.5" />
                </svg>
                <span class="search-trigger-text">
                    {{ activeBook ? `${activeBook.title} ichida qidirish` : 'Qidirish' }}
                </span>
                <kbd>⌘K</kbd>
            </button>

            <div class="topbar-actions">
                <nav class="book-switch" aria-label="Qo'llanmalar">
                    <RouterLink
                        v-for="book in books"
                        :key="book.id"
                        :to="`/${book.id}`"
                        class="book-switch-item"
                        :class="{ 'is-active': book.id === activeBookId }"
                    >
                        {{ book.title }}
                    </RouterLink>
                </nav>

                <span v-if="updatedLabel" class="updated-badge">Yangilangan: {{ updatedLabel }}</span>
                <ThemeToggle />
            </div>
        </header>

        <div v-if="activeBook" class="shell">
            <AppSidebar :book-id="activeBookId" :open="sidebarOpen" @navigate="sidebarOpen = false" />
            <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />
            <RouterView :key="route.path" />
        </div>

        <RouterView v-else :key="route.path" />

        <SearchDialog :open="searchOpen" :book-id="activeBookId" @close="searchOpen = false" />
    </div>
</template>

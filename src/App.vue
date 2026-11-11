<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AccountButton from '@/components/AccountButton.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import BookMark from '@/components/BookMark.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UpdatePrompt from '@/components/UpdatePrompt.vue'
import { terminal, TERMINAL_KITOBLARI } from '@/trenajor/linuxTerminal'
import { applyBookFavicon, applyBookTheme, bookIdFromRoute, docsUpdatedAt, findBook, formatDate } from '@/docs'

// v86 va xterm og'ir — faqat Linux kitobi ochilganda yuklanadi
const LinuxTerminal = defineAsyncComponent(() => import('@/components/LinuxTerminal.vue'))

const route = useRoute()
const sidebarOpen = ref(false)
const searchOpen = ref(false)

const activeBookId = computed(() => bookIdFromRoute(route.path))
const activeBook = computed(() => findBook(activeBookId.value))
const terminalKitobida = computed(() => TERMINAL_KITOBLARI.includes(activeBookId.value))
const updatedLabel = computed(() => formatDate(activeBook.value?.updatedAt ?? docsUpdatedAt))

watch(
  activeBook,
  (book) => {
    applyBookTheme(book)
    applyBookFavicon(book)
  },
  { immediate: true },
)

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
            <div class="topbar-inner">
                <div class="topbar-left">
                    <button
                        v-if="activeBook && !route.meta.full"
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
                            <small>{{ activeBook?.subtitle ?? 'Backend va frontend' }}</small>
                        </span>
                    </RouterLink>

                    <span
                        v-if="activeBook?.badge || activeBook?.version"
                        class="version-badge"
                        :title="`${activeBook.badge ?? `${activeBook.versionLabel} ${activeBook.version}`} bo'yicha yozilgan`"
                    >
                        {{ activeBook.badge ?? `v${activeBook.version}` }}
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
                    <span v-if="updatedLabel" class="updated-badge">Yangilangan: {{ updatedLabel }}</span>
                    <ThemeToggle />
                    <AccountButton />
                </div>
            </div>
        </header>

        <div v-if="activeBook && !route.meta.full" class="shell">
            <AppSidebar :book-id="activeBookId" :open="sidebarOpen" @navigate="sidebarOpen = false" />
            <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />
            <RouterView :key="route.path" />
        </div>

        <template v-else>
            <RouterView :key="route.path" />
            <!-- footer faqat sidebar'siz sahifalarda; trenajorlar butun ekranni egallaydi — ularda ham yo'q -->
            <SiteFooter v-if="!route.meta.full" />
        </template>

        <!-- Linux kitobidagi terminal: boblar orasida o'tganda ham VM saqlanadi -->
        <LinuxTerminal v-if="terminalKitobida || terminal.faol" :korinadi="terminalKitobida && route.name !== 'linux-trenajor'" />

        <SearchDialog :open="searchOpen" :book-id="activeBookId" @close="searchOpen = false" />
        <UpdatePrompt />
    </div>
</template>

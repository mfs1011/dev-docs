<script setup>
import { computed, onMounted, ref } from 'vue'

const theme = ref('light')
const isDark = computed(() => theme.value === 'dark')

const apply = (value) => {
  theme.value = value
  document.documentElement.dataset.theme = value
  localStorage.setItem('docs-theme', value)
  window.dispatchEvent(new CustomEvent('docs-theme-change', { detail: value }))
}

onMounted(() => {
  theme.value = document.documentElement.dataset.theme || 'light'
})

const toggle = () => apply(isDark.value ? 'light' : 'dark')
</script>

<template>
    <button
        type="button"
        class="icon-button theme-toggle"
        :class="{ 'is-dark': isDark }"
        :aria-label="isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'"
        :aria-pressed="isDark"
        @click="toggle"
    >
        <span class="theme-icon">
            <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <g class="sun-rays">
                    <line x1="12" y1="2.4" x2="12" y2="4.8" />
                    <line x1="12" y1="19.2" x2="12" y2="21.6" />
                    <line x1="2.4" y1="12" x2="4.8" y2="12" />
                    <line x1="19.2" y1="12" x2="21.6" y2="12" />
                    <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
                    <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
                    <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
                    <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
                </g>
            </svg>

            <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" />
            </svg>
        </span>
    </button>
</template>

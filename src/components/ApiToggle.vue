<script setup>
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'docs-api-pref'
const DEFAULT = 'composition'

const pref = ref(DEFAULT)

const apply = (value) => {
  pref.value = value
  document.documentElement.dataset.api = value
  localStorage.setItem(STORAGE_KEY, value)
}

onMounted(() => apply(localStorage.getItem(STORAGE_KEY) === 'options' ? 'options' : DEFAULT))
</script>

<template>
    <div class="api-switch" role="group" aria-label="API uslubi">
        <button
            type="button"
            class="api-switch-item"
            :class="{ 'is-active': pref === 'options' }"
            :aria-pressed="pref === 'options'"
            title="Options API: export default { data, methods }"
            @click="apply('options')"
        >
            Options
        </button>
        <button
            type="button"
            class="api-switch-item"
            :class="{ 'is-active': pref === 'composition' }"
            :aria-pressed="pref === 'composition'"
            title="Composition API: <script setup> + ref/computed"
            @click="apply('composition')"
        >
            Composition
        </button>
    </div>
</template>

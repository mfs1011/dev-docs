<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  // Guruh nomi: `api` (Options/Composition) yoki `lang` (JS/TS)
  group: { type: String, required: true },
  options: { type: Array, required: true },   // [{ value, label, title }]
  label: { type: String, default: 'Variant' },
})

const current = ref(props.options[0].value)

const storageKey = computed(() => `docs-variant-${props.group}`)
const allowed = computed(() => props.options.map((option) => option.value))

const apply = (value) => {
  current.value = value
  document.documentElement.dataset[props.group] = value
  localStorage.setItem(storageKey.value, value)
}

const restore = () => {
  const saved = localStorage.getItem(storageKey.value)

  apply(allowed.value.includes(saved) ? saved : props.options[0].value)
}

onMounted(restore)
watch(() => props.group, restore)
</script>

<template>
    <div class="api-switch" role="group" :aria-label="label">
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="api-switch-item"
            :class="{ 'is-active': current === option.value }"
            :aria-pressed="current === option.value"
            :title="option.title"
            @click="apply(option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

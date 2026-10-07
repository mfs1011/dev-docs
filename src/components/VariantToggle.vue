<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { applyVariant, chooseVariant } from '@/settings'

const props = defineProps({
  // Guruh nomi: `api` (Options/Composition) yoki `lang` (JS/TS)
  group: { type: String, required: true },
  options: { type: Array, required: true },   // [{ value, label, title }]
  label: { type: String, default: 'Variant' },
})

const current = ref(props.options[0].value)

const storageKey = computed(() => `docs-variant-${props.group}`)
const allowed = computed(() => props.options.map((option) => option.value))

const choose = (value) => {
  current.value = value
  chooseVariant(props.group, value)
}

const restore = () => {
  let saved = null

  try {
    saved = localStorage.getItem(storageKey.value)
  } catch {
    // Saqlash taqiqlangan — birinchi variant
  }

  current.value = allowed.value.includes(saved) ? saved : props.options[0].value
  applyVariant(props.group, current.value)
}

// Boshqa qurilmadan sinxronlangan tanlov
const onRemote = (event) => {
  const { group, value } = event.detail

  if (group === props.group && allowed.value.includes(value)) current.value = value
}

onMounted(() => {
  restore()
  window.addEventListener('docs-variant-change', onRemote)
})

onUnmounted(() => window.removeEventListener('docs-variant-change', onRemote))
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
            @click="choose(option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

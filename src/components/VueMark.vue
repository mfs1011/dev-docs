<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="vue-mark"
        :width="size"
        :height="size"
        viewBox="0 0 261.76 226.69"
        role="img"
        aria-label="Vue"
    >
        <path class="vue-mark-leaf" d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" />
        <path class="vue-mark-body" d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z" />
    </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="arch-mark"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Arxitektura"
    >
        <!-- Uch qatlam: ma'lumot, xizmat, interfeys -->
        <path class="arch-mark-top" d="M12 2 22 7.2 12 12.4 2 7.2z" />
        <path class="arch-mark-mid" d="M2 12l10 5.2L22 12" />
        <path class="arch-mark-bottom" d="M2 16.8 12 22l10-5.2" />
    </svg>
</template>

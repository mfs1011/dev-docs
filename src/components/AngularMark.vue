<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="angular-mark"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Angular"
    >
        <!-- Qalqon va ichidagi A harfi -->
        <path class="angular-mark-shield" d="M12 1.6 2.6 4.9l1.4 12.2L12 22.4l8-5.3 1.4-12.2z" />
        <path class="angular-mark-letter" d="M12 5.2 6.6 17.1h2l1.1-2.7h4.6l1.1 2.7h2zm0 3.1 1.7 4H10.3z" />
    </svg>
</template>

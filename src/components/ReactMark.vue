<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="react-mark"
        :width="size"
        :height="size"
        viewBox="-11.5 -10.23174 23 20.46348"
        role="img"
        aria-label="React"
    >
        <circle cx="0" cy="0" r="2.05" />
        <g stroke-width="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
    </svg>
</template>

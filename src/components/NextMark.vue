<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="next-mark"
        :width="size"
        :height="size"
        viewBox="0 0 180 180"
        role="img"
        aria-label="Next.js"
    >
        <mask id="next-mask" style="mask-type: alpha">
            <circle cx="90" cy="90" r="90" fill="#fff" />
        </mask>

        <g mask="url(#next-mask)">
            <circle class="next-mark-disc" cx="90" cy="90" r="90" />
            <path
                class="next-mark-glyph"
                d="M149.508 157.52 69.142 54H54v71.97h12.114V69.31l73.885 95.607a90.457 90.457 0 0 0 9.509-7.397Z"
            />
            <path class="next-mark-glyph" d="M115 54h12v72h-12z" />
        </g>
    </svg>
</template>

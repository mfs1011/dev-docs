<script setup>
import { useId } from 'vue'

defineProps({
  size: { type: Number, default: 30 },
})

// Sahifada bir nechta logo bo'lishi mumkin — gradient id'lari noyob bo'lsin
const id = useId()
</script>

<template>
    <!-- Rasmiy Angular logosi: angular/angular repozitoriyasi (adev), o'zgartirilmagan geometriya va ranglar -->
    <svg
        class="angular-mark"
        :width="size"
        :height="size"
        viewBox="0 0 223 236"
        fill="none"
        role="img"
        aria-label="Angular"
    >
        <path
            :fill="`url(#${id}-b)`"
            d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
        />
        <path
            :fill="`url(#${id}-c)`"
            d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
        />
        <defs>
            <linearGradient :id="`${id}-b`" x1="49.009" x2="225.829" y1="213.75" y2="129.722" gradientUnits="userSpaceOnUse">
                <stop stop-color="#E40035" />
                <stop offset=".24" stop-color="#F60A48" />
                <stop offset=".352" stop-color="#F20755" />
                <stop offset=".494" stop-color="#DC087D" />
                <stop offset=".745" stop-color="#9717E7" />
                <stop offset="1" stop-color="#6C00F5" />
            </linearGradient>
            <linearGradient :id="`${id}-c`" x1="41.025" x2="156.741" y1="28.344" y2="160.344" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF31D9" />
                <stop offset="1" stop-color="#FF5BE1" stop-opacity="0" />
            </linearGradient>
        </defs>
    </svg>
</template>

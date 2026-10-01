<script setup>
import { useId } from 'vue'

defineProps({
  size: { type: Number, default: 30 },
})

const id = useId()
</script>

<template>
    <!-- Rasmiy FSD logosi: feature-sliced/documentation → static/img/favicon/adaptive.svg (primary: #29BEDC → #517AED) -->
    <svg
        class="fsd-mark"
        :width="size"
        :height="size"
        viewBox="0 0 96 96"
        fill="none"
        role="img"
        aria-label="Feature-Sliced Design"
    >
        <g :fill="`url(#${id}-g)`">
            <path d="M14 2H82V10H14V2Z" />
            <path d="M14 14H82V22H14V14Z" />
            <path d="M14 26H46V34H14V26Z" />
            <path d="M14 38H82V46H14V38Z" />
            <path d="M14 50H82V58H14V50Z" />
            <path d="M14 62H46V70H14V62Z" />
            <path d="M14 74H46V82H14V74Z" />
            <path d="M14 86H46V94H14V86Z" />
        </g>
        <defs>
            <linearGradient :id="`${id}-g`" x1="14" y1="2" x2="101.951" y2="67.0073" gradientUnits="userSpaceOnUse">
                <stop stop-color="#29BEDC" />
                <stop offset="1" stop-color="#517AED" />
            </linearGradient>
        </defs>
    </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 30 },
})
</script>

<template>
    <svg
        class="fsd-mark"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Feature-Sliced Design"
    >
        <!-- Qatlamlar: app → pages → widgets → features → entities → shared; shared — poydevor -->
        <rect class="fsd-mark-layer is-faint" x="3" y="2" width="18" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer is-faint" x="3" y="5.8" width="18" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="3" y="9.6" width="8.4" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="12.6" y="9.6" width="8.4" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="3" y="13.4" width="5.2" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="9.4" y="13.4" width="5.2" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="15.8" y="13.4" width="5.2" height="2.6" rx="1.3" />
        <rect class="fsd-mark-layer" x="3" y="18.2" width="18" height="3.8" rx="1.3" />
    </svg>
</template>

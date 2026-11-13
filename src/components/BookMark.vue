<script setup>
import SymfonyMark from '@/components/SymfonyMark.vue'
import LaravelMark from '@/components/LaravelMark.vue'
import VueMark from '@/components/VueMark.vue'
import ReactMark from '@/components/ReactMark.vue'
import NextMark from '@/components/NextMark.vue'
import ArchMark from '@/components/ArchMark.vue'
import AngularMark from '@/components/AngularMark.vue'
import FsdMark from '@/components/FsdMark.vue'
import KafkaMark from '@/components/KafkaMark.vue'

defineProps({
  book: { type: String, required: true },
  size: { type: Number, default: 30 },
})

/** Rasmiy logolar fayl sifatida (ranglari mavzuga bog'liq emas): public/marks/<nom>.svg */
const FILE_MARKS = {
  sql: { file: 'postgresql.svg', alt: 'PostgreSQL' },
  git: { file: 'git.svg', alt: 'Git' },
  docker: { file: 'docker.svg', alt: 'Docker' },
  javascript: { file: 'javascript.svg', alt: 'JavaScript' },
  // Tux — Linux yadrosi repozitoriysidagi Documentation/images/logo.svg (Garrett LeSage, CC0), sayt uchun ixchamlangan
  linux: { file: 'linux.svg', alt: 'Tux — Linux' },
  // Redis kubi — github.com/redis/docs → assets/icons/redis-cube.svg
  redis: { file: 'redis.svg', alt: 'Redis' },
  // github.com/rabbitmq/rabbitmq-website → static/img/rabbitmq-logo.svg
  rabbitmq: { file: 'rabbitmq.svg', alt: 'RabbitMQ' },
  // nginx logosining olti burchakli belgisi — github.com/nginx/nginx.org → img/nginx_logo.svg
  nginx: { file: 'nginx.svg', alt: 'nginx' },
  // Flutter logosi — github.com/flutter/website → sites/docs/web/assets/images/branding/flutter/logo/default.svg
  flutter: { file: 'flutter.svg', alt: 'Flutter' },
  // Brendi yo'q kitoblar — sayt uchun chizilgan oddiy belgilar
  'web-asoslari': { file: 'web-asoslari.svg', alt: 'Web asoslari' },
  'xabar-tizimlari': { file: 'xabar-tizimlari.svg', alt: 'Xabar tizimlari' },
  'server-xavfsizligi': { file: 'server-xavfsizligi.svg', alt: 'Server xavfsizligi' },
  'deploy-amaliyoti': { file: 'deploy-amaliyoti.svg', alt: 'Deploy amaliyoti' },
}
const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
</script>

<template>
    <SymfonyMark v-if="book === 'symfony'" :size="size" />
    <LaravelMark v-else-if="book === 'laravel'" :size="size" />
    <VueMark v-else-if="book === 'vue'" :size="size" />
    <ReactMark v-else-if="book === 'react'" :size="size" />
    <NextMark v-else-if="book === 'nextjs'" :size="size" />
    <AngularMark v-else-if="book === 'angular'" :size="size" />
    <ArchMark v-else-if="book === 'arxitektura'" :size="size" />
    <FsdMark v-else-if="book === 'fsd'" :size="size" />
    <KafkaMark v-else-if="book === 'kafka'" :size="size" />
    <img
        v-else-if="FILE_MARKS[book]"
        class="file-mark"
        :src="`${base}marks/${FILE_MARKS[book].file}`"
        :alt="FILE_MARKS[book].alt"
        :width="size"
        :height="size"
    >
    <span v-else class="book-mark-fallback" :style="{ width: `${size}px`, height: `${size}px` }">
        {{ book.slice(0, 2).toUpperCase() }}
    </span>
</template>

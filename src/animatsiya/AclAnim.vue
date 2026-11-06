<script setup>
// 08-bob: ACL mask nomlangan yozuvlarni qanday cheklaydi (acl(5)): samarali huquq = yozuv ∧ mask.
// ACL bor faylda `chmod g...` guruhni emas, MASK ni o'zgartiradi. Ko'rinish getfacl chiqishiga o'xshatilgan.
import { computed, reactive } from 'vue'

const vali = reactive({ r: true, w: false, x: false })
const mask = reactive({ r: true, w: false, x: false })
const B = ['r', 'w', 'x']
const yoz = (o) => B.map((b) => (o[b] ? b : '-')).join('')
const samarali = computed(() => B.reduce((o, b) => ({ ...o, [b]: vali[b] && mask[b] }), {}))
const kesildi = computed(() => yoz(samarali.value) !== yoz(vali))
const lsGuruh = computed(() => `-rw${yoz(mask)}---+`)
</script>

<template>
  <div class="acl-anim">
    <div class="ac-boshqa">
      <div class="ac-guruh">
        <span class="ac-nom">user:vali</span>
        <button v-for="b in B" :key="'v' + b" type="button" class="ac-bit" :class="{ on: vali[b] }" @click="vali[b] = !vali[b]">{{ vali[b] ? b : '-' }}</button>
        <small>vali uchun yozilgan huquq</small>
      </div>
      <div class="ac-guruh">
        <span class="ac-nom">mask</span>
        <button v-for="b in B" :key="'m' + b" type="button" class="ac-bit ac-mask" :class="{ on: mask[b] }" @click="mask[b] = !mask[b]">{{ mask[b] ? b : '-' }}</button>
        <small>yuqori chegara — <code>chmod g...</code> aynan shuni o‘zgartiradi</small>
      </div>
    </div>

    <pre class="ac-chiqish">$ getfacl sir.txt
# file: sir.txt
# owner: root
# group: root
user::rw-
user:vali:{{ yoz(vali) }}<span v-if="kesildi" class="ac-kes">			#effective:{{ yoz(samarali) }}</span>
group::---
mask::{{ yoz(mask) }}
other::---

$ ls -l sir.txt
{{ lsGuruh }} 1 root root 7 Nov  5 11:27 sir.txt</pre>

    <p class="ac-izoh">
      <template v-if="kesildi">Mask yozuvni kesdi: vali uchun <code>{{ yoz(vali) }}</code> yozilgan, lekin amalda faqat <code>{{ yoz(samarali) }}</code> ishlaydi. Huquq = yozuv VA mask.</template>
      <template v-else>Samarali huquq yozuv bilan bir xil: mask hech narsani kesmayapti.</template>
      <code>ls -l</code> dagi guruh ustuni ACL bor faylda guruhni emas, mask’ni ko‘rsatadi.
    </p>
  </div>
</template>

<style scoped>
.acl-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ac-boshqa { display: grid; gap: 10px; }
.ac-guruh { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
.ac-nom { width: 90px; font: 600 14px var(--font-mono); }
.ac-bit { width: 38px; height: 36px; border: 1.5px solid var(--border-strong); border-radius: 8px; background: var(--bg); color: var(--text-subtle); font: 700 16px var(--font-mono); cursor: pointer; transition: background .25s, border-color .25s; }
.ac-bit.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--bg)); color: var(--accent-text); }
.ac-mask.on { border-color: #e3b341; background: color-mix(in srgb, #e3b341 18%, var(--bg)); color: #8a6100; }
.ac-guruh small { font-size: 12.5px; color: var(--text-subtle); }
.ac-guruh small code, .ac-izoh code { font: 12.5px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.ac-chiqish { margin: 14px 0 0; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 13.5px/1.5 var(--font-mono); }
.ac-kes { color: #ff8a80; }
.ac-izoh { margin: 10px 0 0; font-size: 15px; line-height: 1.55; }
</style>

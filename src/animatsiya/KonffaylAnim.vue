<script setup>
// 25-bob: paket yangilanganda conffile bilan nima bo'ladi. 4 holat — Ubuntu Server "Managing your software"
// jadvali; savol matni — Ubuntu "Changing package files" sahifasidagi misol.
import { computed, ref } from 'vue'

const siz = ref(false)
const egasi = ref(false)
const natija = computed(() => {
  if (!siz.value && !egasi.value) return { k: 'teng', t: 'Hech narsa o‘zgarmaydi', iz: 'Fayl o‘sha-o‘sha qoladi.' }
  if (!siz.value && egasi.value) return { k: 'yangi', t: 'Yangi versiya o‘rnatiladi', iz: 'Siz faylga tegmagansiz — dpkg uni jimgina yangisiga almashtiradi.' }
  if (siz.value && !egasi.value) return { k: 'sizniki', t: 'Sizning o‘zgarishingiz saqlanadi', iz: 'Paketda bu fayl o‘zgarmagan — almashtirishga sabab yo‘q.' }
  return { k: 'savol', t: 'dpkg sizdan so‘raydi', iz: 'Ikkalangiz ham o‘zgartirgansiz. Standart javob — o‘zingiznikini qoldirish (N).' }
})
</script>

<template>
  <div class="konffayl-anim">
    <div class="kf-tugmalar">
      <button type="button" :class="{ on: siz }" @click="siz = !siz">
        <span class="kf-belgi">{{ siz ? '✎' : '—' }}</span>
        <span><b>Siz</b> faylni {{ siz ? 'o‘zgartirgansiz' : 'o‘zgartirmagansiz' }}</span>
      </button>
      <button type="button" :class="{ on: egasi }" @click="egasi = !egasi">
        <span class="kf-belgi">{{ egasi ? '⇪' : '—' }}</span>
        <span><b>Paket egasi</b> yangi versiyada {{ egasi ? 'o‘zgartirgan' : 'o‘zgartirmagan' }}</span>
      </button>
    </div>
    <div :key="natija.k" class="kf-natija" :class="natija.k">
      <div class="kf-sar">apt upgrade → {{ natija.t }}</div>
      <p>{{ natija.iz }}</p>
      <pre v-if="natija.k === 'savol'">Configuration file '/etc/apparmor.d/usr.bin.swtpm'
 ==> Modified (by you or by a script) since installation.
 ==> Package distributor has shipped an updated version.
   What would you like to do about it ?  Your options are:
    Y or I  : install the package maintainer's version
    N or O  : keep your currently-installed version
      D     : show the differences between the versions
      Z     : start a shell to examine the situation
 The default action is to keep your current version.
*** usr.bin.swtpm (Y/I/N/O/D/Z) [default=N] ?</pre>
      <small v-if="natija.k === 'savol'">Ubuntu "Changing package files" sahifasidagi misol</small>
    </div>
  </div>
</template>

<style scoped>
.konffayl-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.kf-tugmalar { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kf-tugmalar button { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; font-size: 14.5px; text-align: left; cursor: pointer; transition: border-color .25s, background .25s; }
.kf-tugmalar button.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--bg)); }
.kf-belgi { width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--bg-sunken); font-size: 15px; }
.kf-natija { margin-top: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); animation: kf-kir .35s ease; }
.kf-natija.yangi { border-color: var(--success); background: var(--success-soft); }
.kf-natija.sizniki { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated)); }
.kf-natija.savol { border-color: #e3b341; background: color-mix(in srgb, #e3b341 12%, var(--bg-elevated)); }
.kf-sar { font: 600 14px var(--font-mono); }
.kf-natija p { margin: 6px 0 0; font-size: 15px; }
.kf-natija pre { margin: 10px 0 4px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 12.5px/1.5 var(--font-mono); overflow-x: auto; }
.kf-natija small { font-size: 12px; color: var(--text-subtle); }
@keyframes kf-kir { from { opacity: 0; transform: translateY(-3px); } }
@media (max-width: 640px) { .kf-tugmalar { grid-template-columns: 1fr; } }
</style>

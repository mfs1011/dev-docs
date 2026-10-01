<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

/** Yangi versiyani shuncha vaqtda bir tekshiramiz (o'rnatilgan ilova kunlab ochiq turishi mumkin) */
const CHECK_INTERVAL = 60 * 60 * 1000

const needRefresh = ref(false)
const offlineReady = ref(false)

let updateSW = null
let registration = null
let timer = null

const checkForUpdate = () => {
  if (document.visibilityState === 'visible') registration?.update()
}

onMounted(() => {
  updateSW = registerSW({
    onNeedRefresh() {
      needRefresh.value = true
    },
    onOfflineReady() {
      offlineReady.value = true
      setTimeout(() => (offlineReady.value = false), 5000)
    },
    onRegisteredSW(_url, reg) {
      registration = reg
      timer = setInterval(checkForUpdate, CHECK_INTERVAL)
    },
  })

  // Ilovaga qaytilganda (boshqa ilovadan, uyqu rejimidan) — darhol tekshirish
  document.addEventListener('visibilitychange', checkForUpdate)
})

onUnmounted(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', checkForUpdate)
})

const reload = () => updateSW?.(true)
const dismiss = () => (needRefresh.value = false)
</script>

<template>
    <div class="pwa-toast-region" aria-live="polite">
        <div v-if="needRefresh" class="pwa-toast" role="status">
            <p class="pwa-toast-text">
                <strong>Yangi versiya mavjud.</strong>
                Qo'llanmalar yangilangan — yangilash uchun bosing.
            </p>
            <div class="pwa-toast-actions">
                <button type="button" class="pwa-toast-primary" @click="reload">Yangilash</button>
                <button type="button" class="pwa-toast-secondary" @click="dismiss">Keyinroq</button>
            </div>
        </div>

        <div v-else-if="offlineReady" class="pwa-toast" role="status">
            <p class="pwa-toast-text">Ilova offline ishlashga tayyor.</p>
        </div>
    </div>
</template>

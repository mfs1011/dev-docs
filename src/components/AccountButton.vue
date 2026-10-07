<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ProviderIcon from '@/components/ProviderIcon.vue'
import { account, providers, signIn, signOut, syncEnabled } from '@/sync'

const open = ref(false)
const busy = ref(false)
const root = ref(null)

const STATUS = {
  idle: '',
  syncing: 'Sinxronlanmoqda…',
  synced: 'Hammasi sinxronlangan',
  offline: "Internet yo'q — keyin yuboriladi",
  error: 'Sinxronlashda xato',
}

const statusText = computed(() => STATUS[account.status] ?? '')

const login = async (provider) => {
  busy.value = true

  try {
    await signIn(provider)
  } finally {
    // Muvaffaqiyatli bo'lsa sahifa GitHub/Google'ga ketadi; bu yerga faqat xatoda qaytamiz
    busy.value = false
  }
}

const logout = async () => {
  busy.value = true

  try {
    await signOut()
    open.value = false
  } finally {
    busy.value = false
  }
}

const onPointerDown = (event) => {
  if (open.value && !root.value?.contains(event.target)) open.value = false
}

const onKeydown = (event) => {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <div v-if="syncEnabled" ref="root" class="account">
        <button
            type="button"
            class="icon-button account-button"
            :class="{ 'has-avatar': account.user?.avatar }"
            :aria-label="account.user ? `Akkaunt: ${account.user.name}` : 'Kirish'"
            :aria-expanded="open"
            @click="open = !open"
        >
            <img v-if="account.user?.avatar" :src="account.user.avatar" alt="" class="account-avatar">
            <svg v-else viewBox="0 0 24 24" aria-hidden="true" class="account-icon">
                <circle cx="12" cy="8.5" r="3.6" />
                <path d="M4.8 19.6c1.2-3.3 3.9-5 7.2-5s6 1.7 7.2 5" />
            </svg>
            <span
                v-if="account.user && account.status !== 'idle'"
                class="account-dot"
                :class="`is-${account.status}`"
            />
        </button>

        <div v-if="open" class="account-menu" role="dialog" aria-label="Akkaunt">
            <template v-if="account.user">
                <p class="account-name">{{ account.user.name }}</p>
                <p v-if="statusText" class="account-status" :class="`is-${account.status}`" :title="account.error ?? ''">
                    {{ statusText }}
                </p>
                <RouterLink to="/profil" class="account-action" @click="open = false">Profil va statistika</RouterLink>
                <button type="button" class="account-action" :disabled="busy" @click="logout">Chiqish</button>
            </template>

            <template v-else>
                <p class="account-hint">
                    Kirsangiz, o'qish holatingiz telefon va kompyuter o'rtasida sinxronlanadi.
                    Birinchi kirishda akkaunt o'zi ochiladi — alohida ro'yxatdan o'tish yo'q.
                </p>
                <button
                    v-for="(provider, index) in providers"
                    :key="provider.id"
                    type="button"
                    class="account-action"
                    :class="{ 'is-primary': index === 0 }"
                    :disabled="busy"
                    @click="login(provider.id)"
                >
                    <ProviderIcon :provider="provider.id" />
                    {{ provider.label }} orqali kirish
                </button>
                <p class="account-links">
                    <RouterLink to="/profil" @click="open = false">O'qish statistikasi</RouterLink>
                    <RouterLink to="/kirish" @click="open = false">Batafsil</RouterLink>
                </p>
            </template>
        </div>
    </div>
</template>

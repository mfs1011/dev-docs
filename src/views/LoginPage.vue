<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProviderIcon from '@/components/ProviderIcon.vue'
import { account, providers, signIn, syncEnabled } from '@/sync'

const route = useRoute()
const router = useRouter()
const busy = ref(false)

/** Kirgandan keyin qaytiladigan sahifa — faqat sayt ichidagi yo'l (`//boshqa.sayt` emas) */
const target = computed(() => {
  const value = String(route.query.qaytish ?? '')

  return value.startsWith('/') && !value.startsWith('//') ? value : '/profil'
})

// Kirilgan bo'lsa (yoki GitHub/Google'dan qaytib kirildi) — kerakli sahifaga
watch(
  () => account.user,
  (user) => {
    if (user) router.replace(target.value)
  },
  { immediate: true },
)

const login = async (provider) => {
  busy.value = true

  try {
    await signIn(provider)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  document.title = "Kirish — Qo'llanmalar"
})
</script>

<template>
    <main class="home auth-page">
        <div class="home-inner">
            <section class="auth-card">
                <h1>Kirish</h1>

                <template v-if="syncEnabled">
                    <p class="auth-lead">
                        Kirsangiz, o'qish belgilari, o'qilgan boblar, tema va kod varianti
                        telefon va kompyuter o'rtasida sinxronlanadi.
                    </p>

                    <div class="auth-buttons">
                        <button
                            v-for="(provider, index) in providers"
                            :key="provider.id"
                            type="button"
                            class="profile-button"
                            :class="{ 'is-primary': index === 0 }"
                            :disabled="busy"
                            @click="login(provider.id)"
                        >
                            <ProviderIcon :provider="provider.id" />
                            {{ provider.label }} orqali kirish
                        </button>
                    </div>

                    <p v-if="account.status === 'error'" class="profile-status is-error">{{ account.error }}</p>

                    <ul class="auth-notes">
                        <li><strong>Ro'yxatdan o'tish alohida yo'q</strong> — birinchi kirishda akkaunt o'zi ochiladi.</li>
                        <li>Parol yo'q: kirishni GitHub yoki Google tasdiqlaydi.</li>
                        <li>Faqat ism, email va avatar olinadi; boshqa hech narsa so'ralmaydi.</li>
                        <li>Kirmasangiz ham hammasi ishlaydi — holat shu brauzerda saqlanadi.</li>
                    </ul>
                </template>

                <p v-else class="auth-lead">
                    Akkaunt bilan kirish hozircha yoqilmagan. O'qish holatingiz shu brauzerda saqlanadi.
                </p>

                <RouterLink to="/profil" class="auth-link">O'qish statistikasini ko'rish →</RouterLink>
            </section>
        </div>
    </main>
</template>

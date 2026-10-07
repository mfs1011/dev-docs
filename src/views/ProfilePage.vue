<script setup>
import { computed, onMounted, ref } from 'vue'
import BookMark from '@/components/BookMark.vue'
import ProviderIcon from '@/components/ProviderIcon.vue'
import { books, formatDate } from '@/docs'
import { bookProgress, markFor, overallProgress } from '@/progress'
import { account, deleteAccount, exportData, linkProvider, providers, signIn, signOut, syncEnabled } from '@/sync'

const STATUS = {
  idle: '',
  syncing: 'Sinxronlanmoqda…',
  synced: 'Hammasi sinxronlangan',
  offline: "Internet yo'q — o'zgarishlar keyin yuboriladi",
  error: 'Sinxronlashda xato',
}

const busy = ref(false)
const confirmDelete = ref(false)
const deleteError = ref('')
const linkError = ref('')

const isLinked = (provider) => account.user?.providers.includes(provider)

const link = (provider) =>
  run(async () => {
    linkError.value = ''

    try {
      await linkProvider(provider)
    } catch (error) {
      linkError.value = error?.message ?? String(error)
    }
  })

/** Boblari yozilgan kitoblar; o'qishni boshlaganlari tepada */
const shelf = computed(() =>
  books
    .filter((book) => book.chapterCount)
    .map((book) => ({ book, progress: bookProgress(book), mark: markFor(book.id) }))
    .sort((a, b) => b.progress.read - a.progress.read || Boolean(b.mark) - Boolean(a.mark)),
)

const overall = computed(() => overallProgress())
const overallPercent = computed(() =>
  overall.value.total ? Math.round((overall.value.read / overall.value.total) * 100) : 0,
)

const run = async (action) => {
  busy.value = true

  try {
    await action()
  } finally {
    busy.value = false
  }
}

const download = () => {
  const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' })
  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = `qollanmalar-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

const removeAccount = () =>
  run(async () => {
    deleteError.value = ''

    try {
      await deleteAccount()
      confirmDelete.value = false
    } catch (error) {
      deleteError.value = error?.message ?? String(error)
    }
  })

onMounted(() => {
  document.title = "Profil — Qo'llanmalar"
})
</script>

<template>
    <main class="home profile">
        <div class="home-inner">
            <section class="profile-head">
                <template v-if="account.user">
                    <img v-if="account.user.avatar" :src="account.user.avatar" alt="" class="profile-avatar">
                    <div class="profile-who">
                        <h1>{{ account.user.name }}</h1>
                        <p class="profile-meta">
                            <span v-if="account.user.login">@{{ account.user.login }}</span>
                            <span v-if="account.user.email">{{ account.user.email }}</span>
                            <span v-if="account.user.createdAt">A'zo: {{ formatDate(account.user.createdAt) }}</span>
                        </p>
                        <p v-if="STATUS[account.status]" class="profile-status" :class="`is-${account.status}`">
                            {{ STATUS[account.status] }}
                        </p>
                    </div>
                    <button type="button" class="profile-button" :disabled="busy" @click="run(signOut)">Chiqish</button>
                </template>

                <template v-else>
                    <div class="profile-who">
                        <h1>Profil</h1>
                        <p class="profile-meta">
                            <template v-if="syncEnabled">
                                Kirmagansiz — o'qish holati faqat shu brauzerda saqlanadi.
                                Kirsangiz, telefon va kompyuter o'rtasida sinxronlanadi.
                                Birinchi kirishda akkaunt o'zi ochiladi.
                            </template>
                            <template v-else>O'qish holati shu brauzerda saqlanadi.</template>
                        </p>
                    </div>
                    <div v-if="syncEnabled" class="profile-actions">
                        <button
                            v-for="(provider, index) in providers"
                            :key="provider.id"
                            type="button"
                            class="profile-button"
                            :class="{ 'is-primary': index === 0 }"
                            :disabled="busy"
                            @click="run(() => signIn(provider.id))"
                        >
                            <ProviderIcon :provider="provider.id" />
                            {{ provider.label }} orqali kirish
                        </button>
                    </div>
                </template>
            </section>

            <section class="profile-section">
                <h2>O'qish</h2>
                <p class="profile-overall">
                    <strong>{{ overall.read }}</strong> / {{ overall.total }} bob o'qildi
                    <span>({{ overallPercent }}%)</span>
                </p>

                <ul class="profile-shelf">
                    <li v-for="{ book, progress, mark } in shelf" :key="book.id" class="profile-book">
                        <RouterLink :to="`/${book.id}`" class="profile-book-title">
                            <BookMark :book="book.id" :size="24" />
                            {{ book.title }}
                        </RouterLink>

                        <span class="profile-book-count">{{ progress.read }}/{{ progress.total }}</span>

                        <span
                            class="profile-bar"
                            role="progressbar"
                            :aria-valuenow="progress.percent"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            :aria-label="`${book.title}: ${progress.percent}%`"
                        >
                            <span :style="{ width: `${progress.percent}%` }" />
                        </span>

                        <RouterLink v-if="mark" :to="`${mark.route}#belgi`" class="profile-book-resume">
                            <template v-if="mark.chapter">{{ String(mark.chapter).padStart(2, '0') }}-bob</template>
                            <template v-else>{{ mark.title }}</template>
                            — davom etish
                        </RouterLink>
                    </li>
                </ul>
            </section>

            <section v-if="account.user" class="profile-section">
                <h2>Kirish usullari</h2>
                <p class="profile-note">
                    Bir akkauntga bir nechta usul ulash mumkin — qaysi biri bilan kirsangiz ham, holatingiz bir xil.
                </p>

                <ul class="profile-providers">
                    <li v-for="provider in providers" :key="provider.id">
                        <ProviderIcon :provider="provider.id" />
                        <span>{{ provider.label }}</span>
                        <span v-if="isLinked(provider.id)" class="profile-linked">Ulangan</span>
                        <button v-else type="button" class="profile-button" :disabled="busy" @click="link(provider.id)">
                            Ulash
                        </button>
                    </li>
                </ul>
                <p v-if="linkError" class="profile-status is-error">{{ linkError }}</p>
            </section>

            <section class="profile-section">
                <h2>Ma'lumotlar</h2>
                <p class="profile-note">
                    Saqlanadigani: o'qish belgilari, o'qilgan boblar, tema va kod varianti tanlovi.
                    Boshqa hech narsa yig'ilmaydi.
                </p>

                <div class="profile-actions">
                    <button type="button" class="profile-button" @click="download">JSON qilib yuklab olish</button>

                    <template v-if="account.user">
                        <button
                            v-if="!confirmDelete"
                            type="button"
                            class="profile-button is-danger"
                            @click="confirmDelete = true"
                        >
                            Akkauntni o'chirish
                        </button>

                        <div v-else class="profile-confirm" role="alert">
                            <p>
                                Akkaunt va serverdagi hamma ma'lumot butunlay o'chiriladi, qaytarib bo'lmaydi.
                                Shu brauzerdagi nusxa qoladi.
                            </p>
                            <div class="profile-actions">
                                <button
                                    type="button"
                                    class="profile-button is-danger"
                                    :disabled="busy"
                                    @click="removeAccount"
                                >
                                    Ha, o'chirish
                                </button>
                                <button type="button" class="profile-button" :disabled="busy" @click="confirmDelete = false">
                                    Bekor qilish
                                </button>
                            </div>
                            <p v-if="deleteError" class="profile-status is-error">{{ deleteError }}</p>
                        </div>
                    </template>
                </div>
            </section>
        </div>
    </main>
</template>

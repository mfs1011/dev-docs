<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BookCard from '@/components/BookCard.vue'
import { books, findBook, yonalishlar } from '@/docs'
import { overallProgress } from '@/progress'
import { account, syncEnabled } from '@/sync'

const totals = computed(() =>
  books.reduce(
    (sum, book) => ({
      chapters: sum.chapters + (book.chapterCount ?? 0),
      pages: sum.pages + (book.pageCount ?? 0),
    }),
    { chapters: 0, pages: 0 },
  ),
)

const overall = computed(() => overallProgress())

/** Hero'dagi buyruq: sahifa ochilganda harfma-harf yoziladi, keyin kursor lippillaydi */
const PROMPT = 'qollanmalar --lang=uz --source=official-docs'
const typed = ref('')
const typing = ref(true)
let typeTimer = 0

function typePrompt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typed.value = PROMPT
    typing.value = false

    return
  }

  let index = 0
  const step = () => {
    index += 1
    typed.value = PROMPT.slice(0, index)
    if (index >= PROMPT.length) {
      typing.value = false

      return
    }
    // Probeldan keyin qisqa to'xtash, harflar orasida biroz notekis — qo'lda yozilgandek
    typeTimer = setTimeout(step, PROMPT[index - 1] === ' ' ? 140 : 40 + ((index * 7) % 30))
  }
  typeTimer = setTimeout(step, 400)
}

onMounted(() => {
  document.title = "Qo'llanmalar — backend va frontend"
  typePrompt()
})

onBeforeUnmount(() => clearTimeout(typeTimer))
</script>

<template>
    <main class="home">
        <div class="home-inner">
            <section class="home-hero">
                <p class="home-prompt">
                    <span aria-hidden="true">$</span>
                    <code>
                        <span class="home-prompt-sr">{{ PROMPT }}</span>
                        <span aria-hidden="true">{{ typed }}</span><i class="home-cursor" :class="{ 'is-typing': typing }" aria-hidden="true" />
                    </code>
                </p>

                <h1 class="home-title">
                    Dasturchi qo'llanmalari
                </h1>

                <p class="home-lead">
                    Rasmiy hujjatlar asosida yozilgan to'liq qo'llanmalar.
                    Har bob bir xil skeletda:
                </p>

                <ol class="home-skeleton">
                    <li>Tushuncha</li>
                    <li>Nega shunday</li>
                    <li>Kod</li>
                    <li>Muhandislik nuqtai nazari</li>
                    <li>Tipik xatolar</li>
                    <li>Amaliyot</li>
                </ol>

                <dl class="home-stats">
                    <div class="home-stat">
                        <dt>qo'llanma</dt>
                        <dd>{{ books.length }}</dd>
                    </div>
                    <div class="home-stat">
                        <dt>bob</dt>
                        <dd>{{ totals.chapters }}</dd>
                    </div>
                    <div class="home-stat">
                        <dt>sahifa</dt>
                        <dd>{{ totals.pages }}</dd>
                    </div>
                </dl>
            </section>

            <section class="home-why" aria-labelledby="home-why-title">
                <h2 id="home-why-title" class="home-why-title">
                    <span aria-hidden="true">//</span> Nega bu qo'llanmalar
                </h2>

                <p>
                    AI davrida asosiy ko'nikma kod yozish emas, kod yozdirish bo'lib qoldi.
                    Lekin yaxshi yozdirish uchun nima qanday ishlashini tushunish kerak —
                    aks holda AI bergan yechim to'g'rimi yoki yo'qmi, ajrata olmaysiz.
                    AI istalgan narsani qura oladi, lekin uni ideal qurishiga hech kim
                    kafolat bermaydi. Qarorni baribir muhandis qabul qiladi.
                </p>

                <p>
                    Shuning uchun o'qish hali ham kerak: asoslardan boshlab, har bir qaror
                    nega shunday ekanini tushunib. Bu qo'llanmalar avvalo o'zim uchun
                    yozilgan. Kimgadir foydasi tegsa — xursandman.
                </p>
            </section>

            <RouterLink v-if="account.user" to="/profil" class="home-account">
                <img v-if="account.user.avatar" :src="account.user.avatar" alt="" class="home-account-avatar">
                <span class="home-account-body">
                    <strong>{{ account.user.name }}</strong>
                    <span>{{ overall.read }}/{{ overall.total }} bob o'qildi</span>
                </span>
                <span class="home-account-cta">Profil →</span>
            </RouterLink>

            <div v-else-if="syncEnabled || overall.read" class="home-account">
                <span class="home-account-body">
                    <strong v-if="overall.read">{{ overall.read }}/{{ overall.total }} bob o'qildi</strong>
                    <strong v-else>O'qish holatingiz saqlanadi</strong>
                    <span v-if="syncEnabled">Kirsangiz — telefon va kompyuter o'rtasida sinxronlanadi.</span>
                </span>
                <RouterLink to="/profil" class="home-account-link">Statistika</RouterLink>
                <RouterLink v-if="syncEnabled" to="/kirish" class="home-account-cta">Kirish →</RouterLink>
            </div>

            <section
                v-for="y in yonalishlar"
                :key="y.id"
                class="home-yonalish"
                :aria-labelledby="`yonalish-${y.id}`"
            >
                <div class="home-yonalish-head">
                    <h2 :id="`yonalish-${y.id}`" class="home-section-title">{{ y.title }}</h2>
                    <p class="home-yonalish-izoh">{{ y.izoh }}</p>
                    <RouterLink v-if="y.qadamlar.length > 1" :to="`/yonalish/${y.id}`" class="home-yonalish-link">
                        Yo'l xaritasi →
                    </RouterLink>
                </div>

                <div class="home-grid">
                    <template v-for="q in y.qadamlar" :key="q.kitob ?? q.rejada">
                        <BookCard v-if="q.kitob" :book="findBook(q.kitob)" />
                        <div v-else class="book-cell">
                            <div class="book-card book-card-reja">
                                <span class="book-card-head">
                                    <span class="book-card-version is-soon">rejada</span>
                                </span>
                                <h3 class="book-card-title">{{ q.rejada }}</h3>
                                <p class="book-card-subtitle">{{ q.nega }}</p>
                            </div>
                        </div>
                    </template>
                </div>
            </section>
        </div>
    </main>
</template>

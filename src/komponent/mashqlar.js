// Komponent trenajori mashqlari. Har qadam jonli tekshiriladi: iframe'dan kelgan voqealar (set, render,
// skip, compute, watch, bosish, konsol) `s` statistikasiga yig'iladi (stat.js) va `check(s)` chaqiriladi.
// `amal` — «Ko'rsatish» tugmasi (va avtomatik test) bajaradigan harakatlar; `yechim` — yordam kodi.
// Tushuntirishlar rasmiy hujjatga tayanadi (`manba`).

const kodda = (s, re) => Object.values(s.kod).some((t) => re.test(t))

// ── Vue ───────────────────────────────────────────────────────────────────────────────────────────

const VUE_REF_0 = `<script setup>
let count = 0

function add() {
  count++
  console.log('count =', count)
}
</script>

<template>
  <button @click="add">Bosildi: {{ count }} marta</button>
</template>
`
const VUE_REF_1 = `<script setup>
import { ref } from 'vue'

const count = ref(0)

function add() {
  count.value++
  console.log('count =', count.value)
}
</script>

<template>
  <button @click="add">Bosildi: {{ count }} marta</button>
</template>
`
const VUE_REF_2 = VUE_REF_1.replace('  count.value++\n', '  count.value++\n  count.value++\n  count.value++\n')

const VUE_COMPUTED_0 = `<script setup>
import { ref } from 'vue'

const items = ref([
  { nom: 'Olma', narx: 12000 },
  { nom: 'Non', narx: 5000 },
])
const qorongi = ref(false)

function jami() {
  console.log('jami hisoblandi')
  return items.value.reduce((s, i) => s + i.narx, 0)
}

function qosh() {
  items.value.push({ nom: 'Sut', narx: 9000 })
}
</script>

<template>
  <div class="karta" :class="{ qorongi }">
    <ul>
      <li v-for="i in items" :key="i.nom">{{ i.nom }} — {{ i.narx }}</li>
    </ul>
    <p>Jami: {{ jami() }}</p>
    <button @click="qorongi = !qorongi">Mavzu</button>
    <button @click="qosh">Qo‘shish</button>
  </div>
</template>

<style>
.qorongi { background: #1f2430; color: #eef; }
</style>
`
const VUE_COMPUTED_1 = VUE_COMPUTED_0
  .replace("import { ref } from 'vue'", "import { computed, ref } from 'vue'")
  .replace(`function jami() {
  console.log('jami hisoblandi')
  return items.value.reduce((s, i) => s + i.narx, 0)
}`, `const jami = computed(() => {
  console.log('jami hisoblandi')
  return items.value.reduce((s, i) => s + i.narx, 0)
})`)
  .replace('{{ jami() }}', '{{ jami }}')

const VUE_PROPS_APP_0 = `<script setup>
import { ref } from 'vue'
import Hisob from './Hisob.vue'
import Qator from './Qator.vue'

const count = ref(0)
const tanlangan = ref(1)
const royxat = [
  { id: 1, nom: 'Vue' },
  { id: 2, nom: 'Pinia' },
  { id: 3, nom: 'Vite' },
  { id: 4, nom: 'Vitest' },
  { id: 5, nom: 'Nuxt' },
]
</script>

<template>
  <button @click="count++">+1</button>
  <Hisob :n="count" />
  <ul>
    <Qator
      v-for="r in royxat"
      :key="r.id"
      :item="r"
      :tanlangan-id="tanlangan"
      @tanla="tanlangan = r.id"
    />
  </ul>
</template>
`
const VUE_PROPS_QATOR_0 = `<script setup>
defineProps(['item', 'tanlanganId'])
defineEmits(['tanla'])
</script>

<template>
  <li :class="{ faol: item.id === tanlanganId }" @click="$emit('tanla')">
    {{ item.nom }}
  </li>
</template>

<style>
.faol { font-weight: 700; color: #2f8f5b; }
</style>
`
const VUE_PROPS_HISOB = `<script setup>
defineProps(['n'])
</script>

<template>
  <p>Son: {{ n }}</p>
</template>
`
const VUE_PROPS_APP_1 = VUE_PROPS_APP_0.replace(':tanlangan-id="tanlangan"', ':faol="r.id === tanlangan"')
const VUE_PROPS_QATOR_1 = `<script setup>
defineProps(['item', 'faol'])
defineEmits(['tanla'])
</script>

<template>
  <li :class="{ faol }" @click="$emit('tanla')">
    {{ item.nom }}
  </li>
</template>

<style>
.faol { font-weight: 700; color: #2f8f5b; }
</style>
`

const VUE_REACTIVE_0 = `<script setup>
import { reactive } from 'vue'

const holat = reactive({ count: 0, nom: 'Hisoblagich' })
let { count } = holat

function add() {
  count++
  console.log('count =', count, '| holat.count =', holat.count)
}
</script>

<template>
  <h3>{{ holat.nom }}</h3>
  <button @click="add">count: {{ count }}</button>
</template>
`
const VUE_REACTIVE_1 = `<script setup>
import { reactive } from 'vue'

const holat = reactive({ count: 0, nom: 'Hisoblagich' })

function add() {
  holat.count++
  console.log('holat.count =', holat.count)
}
</script>

<template>
  <h3>{{ holat.nom }}</h3>
  <button @click="add">count: {{ holat.count }}</button>
</template>
`

const VUE_BARQAROR_0 = `<script setup>
import { computed, ref } from 'vue'

const count = ref(0)
const juftmi = computed(() => count.value % 2 === 0)

function add() {
  count.value += 2
}
</script>

<template>
  <p>Son juftmi? {{ juftmi ? 'ha' : 'yo‘q' }}</p>
  <button @click="add">Qo‘shish</button>
</template>
`
const VUE_BARQAROR_1 = VUE_BARQAROR_0.replace('count.value += 2', 'count.value++')

const VUE_WATCH_0 = `<script setup>
import { ref, watchEffect } from 'vue'

const qidiruv = ref('')
const sahifa = ref(1)

watchEffect(() => {
  console.log('so‘rov yuborildi:', qidiruv.value)
})
</script>

<template>
  <input v-model="qidiruv" placeholder="Qidiruv…" />
  <p>Sahifa: {{ sahifa }} <button @click="sahifa++">Keyingi</button></p>
</template>
`
const VUE_WATCH_1 = VUE_WATCH_0.replace("console.log('so‘rov yuborildi:', qidiruv.value)", "console.log('so‘rov yuborildi:', qidiruv.value, sahifa.value)")

// Pinia
const PINIA_STORE = `import { defineStore } from 'pinia'

export const useSavatStore = defineStore('savat', {
  state: () => ({ items: [] }),
  getters: {
    soni: (state) => state.items.length,
    jami: (state) => state.items.reduce((s, i) => s + i.narx, 0),
  },
  actions: {
    qosh(nom, narx) {
      this.items.push({ nom, narx })
    },
  },
})
`
const PINIA_APP = `<script setup>
import Sarlavha from './Sarlavha.vue'
import Mahsulotlar from './Mahsulotlar.vue'
</script>

<template>
  <Sarlavha />
  <Mahsulotlar />
</template>
`
const PINIA_SARLAVHA_0 = `<script setup>
import { useSavatStore } from './stores/savat.js'

const savat = useSavatStore()
</script>

<template>
  <h3>🛒 Savatda: {{ savat.soni }} ta · {{ savat.jami }} so‘m</h3>
</template>
`
const PINIA_SARLAVHA_1 = `<script setup>
import { useSavatStore } from './stores/savat.js'

const { soni, jami } = useSavatStore()
</script>

<template>
  <h3>🛒 Savatda: {{ soni }} ta · {{ jami }} so‘m</h3>
</template>
`
const PINIA_SARLAVHA_2 = `<script setup>
import { storeToRefs } from 'pinia'
import { useSavatStore } from './stores/savat.js'

const { soni, jami } = storeToRefs(useSavatStore())
</script>

<template>
  <h3>🛒 Savatda: {{ soni }} ta · {{ jami }} so‘m</h3>
</template>
`
const PINIA_MAHSULOTLAR = `<script setup>
import { useSavatStore } from './stores/savat.js'

const savat = useSavatStore()
const mahsulotlar = [
  { nom: 'Olma', narx: 12000 },
  { nom: 'Non', narx: 5000 },
]
</script>

<template>
  <button v-for="m in mahsulotlar" :key="m.nom" @click="savat.qosh(m.nom, m.narx)">
    {{ m.nom }} qo‘shish
  </button>
</template>
`

// Vue Router
const ROUTER_JS = `import { createRouter, createWebHistory } from 'vue-router'
import Bosh from './Bosh.vue'
import Mahsulot from './Mahsulot.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Bosh },
    { path: '/mahsulot/:id', component: Mahsulot },
  ],
})
`
const ROUTER_APP = `<template>
  <nav>
    <RouterLink to="/">Bosh sahifa</RouterLink> ·
    <RouterLink to="/mahsulot/1">Mahsulot 1</RouterLink> ·
    <RouterLink to="/mahsulot/2">Mahsulot 2</RouterLink>
  </nav>
  <RouterView />
</template>
`
const ROUTER_BOSH = `<template>
  <h3>Bosh sahifa</h3>
</template>
`
const ROUTER_MAHSULOT = `<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log('Mahsulot yaratildi')
</script>

<template>
  <h3>Mahsulot № {{ route.params.id }}</h3>
</template>
`
const GUARD_AUTH = `import { ref } from 'vue'

export const kirgan = ref(false)
`
const GUARD_ROUTER = `import { createRouter, createWebHistory } from 'vue-router'
import { kirgan } from './auth.js'
import Bosh from './Bosh.vue'
import Profil from './Profil.vue'
import Kirish from './Kirish.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Bosh },
    { path: '/profil', component: Profil, meta: { kirishKerak: true } },
    { path: '/kirish', component: Kirish },
  ],
})

router.beforeEach((to) => {
  if (to.meta.kirishKerak && !kirgan.value) return '/kirish'
})

export default router
`
const GUARD_APP = `<template>
  <nav>
    <RouterLink to="/">Bosh sahifa</RouterLink> ·
    <RouterLink to="/profil">Profil</RouterLink>
  </nav>
  <RouterView />
</template>
`
const GUARD_PROFIL = `<template>
  <h3>Profil — shaxsiy sahifa</h3>
</template>
`
const GUARD_KIRISH = `<script setup>
import { useRouter } from 'vue-router'
import { kirgan } from './auth.js'

const router = useRouter()

function kir() {
  kirgan.value = true
  router.push('/profil')
}
</script>

<template>
  <h3>Kirish</h3>
  <button @click="kir">Tizimga kirish</button>
</template>
`

export const VUE_MASHQLAR = [
  {
    id: 'vue-ref',
    title: 'ref va qayta render',
    bob: '/vue/09-reaktivlik-asoslari',
    intro: 'Vue qachon komponentni qayta chizadi? Oddiy o‘zgaruvchi va ref farqini hamda bir nechta o‘zgarish bitta render’ga yig‘ilishini ko‘ramiz.',
    fayllar: { 'App.vue': VUE_REF_0 },
    manba: ['https://vuejs.org/guide/essentials/reactivity-fundamentals.html'],
    steps: [
      {
        text: 'Tugmani bosing. Konsolda `count` oshyapti, lekin sahifadagi son o‘zgarmayapti va daraxtda `App` yonmayapti.',
        amal: [{ click: 'button' }],
        check: (s) => s.click > 0 && s.r('App') === 0 && s.log.some((l) => l.includes('count =')),
        natija: '`let count` — oddiy JavaScript o‘zgaruvchisi. Vue uni kuzatmaydi: o‘zgarganidan xabar topmaydi va komponentni qayta chizmaydi.',
      },
      {
        text: '`count` ni `ref` qiling: `import { ref } from \'vue\'`, `const count = ref(0)`, funksiyada `count.value++`. Keyin tugmani bosing.',
        yechim: { 'App.vue': VUE_REF_1 },
        amal: [{ click: 'button' }],
        check: (s) => kodda(s, /\bref\(/) && s.set('count') > 0 && s.r('App') > 0,
        natija: 'Zanjir ko‘rindi: `count` o‘zgardi → `App` qayta chizildi. Render paytida `count.value` o‘qilganda Vue buni yozib qo‘yadi (track), qiymat yozilganda shu komponentni yangilaydi (trigger).',
      },
      {
        text: '`add` ichida `count.value++` ni uch marta yozing va tugmani bir marta bosing. Jurnalga qarang: nechta o‘zgarish, nechta render?',
        yechim: { 'App.vue': VUE_REF_2 },
        amal: [{ click: 'button' }],
        check: (s) => s.batches.some((b) => b.set('count') >= 3 && b.r('App') === 1),
        natija: 'Uch o‘zgarish — bitta render. Vue DOM’ni har o‘zgarishda darhol yangilamaydi: o‘zgarishlarni yig‘ib, keyingi «tick»da (`nextTick`) komponentni bir marta chizadi.',
      },
    ],
  },
  {
    id: 'vue-computed',
    title: 'computed keshi va metod',
    bob: '/vue/10-computed',
    intro: 'Shablondagi metod har render’da qayta chaqiriladi, computed esa bog‘liqligi o‘zgarmaguncha keshdan beriladi.',
    fayllar: { 'App.vue': VUE_COMPUTED_0 },
    manba: ['https://vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods'],
    steps: [
      {
        text: '«Mavzu» tugmasini bosing. Ro‘yxat o‘zgarmadi, lekin konsolda `jami hisoblandi` yana chiqdi.',
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => s.r('App') > 0 && s.log.some((l) => l.includes('jami hisoblandi')),
        natija: '`qorongi` o‘zgardi → App qayta chizildi → shablondagi `jami()` yana chaqirildi, garchi `items` o‘zgarmagan bo‘lsa ham.',
      },
      {
        text: '`jami` ni computed qiling: `const jami = computed(() => { … })`, shablonda `{{ jami }}` (qavssiz). So‘ng yana «Mavzu» ni bosing.',
        yechim: { 'App.vue': VUE_COMPUTED_1 },
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => kodda(s, /computed\(/) && s.r('App') > 0 && s.c('jami') === 0,
        natija: 'App chizildi, ammo `jami` qayta hisoblanmadi: computed natijasi keshlanadi va faqat o‘zi o‘qigan qiymat (`items`) o‘zgarganda yangilanadi. Grafda `jami` faqat `items` ga bog‘langan.',
      },
      {
        text: 'Endi «Qo‘shish» ni bosing.',
        amal: [{ click: 'button', matn: 'Qo‘shish' }],
        check: (s) => s.c('jami') > 0,
        natija: '`items` o‘zgardi → `jami` qayta hisoblandi → App chizildi. Jurnalda zanjir tartibi ko‘rinadi.',
      },
    ],
  },
  {
    id: 'vue-props',
    title: 'Bola komponent va props barqarorligi',
    bob: '/vue/22-props',
    intro: 'Vue’da bola komponent ota chizilgani uchun emas, faqat o‘ziga kelgan props o‘zgarganda yangilanadi. Shundan props’ni qanday berish kerakligi kelib chiqadi.',
    fayllar: { 'App.vue': VUE_PROPS_APP_0, 'Hisob.vue': VUE_PROPS_HISOB, 'Qator.vue': VUE_PROPS_QATOR_0 },
    manba: ['https://vuejs.org/guide/best-practices/performance.html#props-stability'],
    steps: [
      {
        text: '«+1» ni bosing. Daraxtda qaysi komponentlar yondi?',
        amal: [{ click: 'button', matn: '+1' }],
        check: (s) => s.r('App') > 0 && s.r('Hisob') > 0 && s.r('Qator') === 0,
        natija: 'App va Hisob chizildi, beshta Qator esa yo‘q: ularning props’i (`item`, `tanlanganId`) o‘zgarmadi. Vue bola komponentni faqat props’i o‘zgarganda yangilaydi.',
      },
      {
        text: 'Ro‘yxatdan boshqa qatorni bosing. Tanlov faqat ikki qatorda o‘zgaradi — nechta Qator chizildi?',
        amal: [{ click: 'li', n: 2 }],
        check: (s) => s.batches.some((b) => b.r('Qator') === 5),
        natija: 'Beshalasi chizildi: hammasiga `tanlanganId` beriladi va u o‘zgardi. Har bir Qator «men tanlanganmanmi?» ni o‘zi hisoblaydi.',
      },
      {
        text: 'Qatorga faqat kerakli narsani bering: App’da `:tanlangan-id="tanlangan"` o‘rniga `:faol="r.id === tanlangan"`, Qator’da `faol` props’i. So‘ng yana boshqa qatorni bosing.',
        yechim: { 'App.vue': VUE_PROPS_APP_1, 'Qator.vue': VUE_PROPS_QATOR_1 },
        amal: [{ click: 'li', n: 3 }],
        check: (s) => s.batches.some((b) => b.r('Qator') === 2),
        natija: 'Endi faqat ikki qator chizildi: tanlovdan chiqqani va tanlangani. Qolganlarining `faol` qiymati o‘zgarmadi. Rasmiy hujjat buni «props barqarorligi» deb ataydi.',
      },
    ],
  },
  {
    id: 'vue-reactive',
    title: 'reactive va destructuring',
    bob: '/vue/09-reaktivlik-asoslari',
    intro: 'reactive obyektdan xossani ajratib olsak, u reaktivligini yo‘qotadi. Nega shundayligini grafda ko‘ramiz.',
    fayllar: { 'App.vue': VUE_REACTIVE_0 },
    manba: ['https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive'],
    steps: [
      {
        text: 'Tugmani bosing. Konsolga qarang: `count` oshdi, `holat.count` esa 0 ligicha.',
        amal: [{ click: 'button' }],
        check: (s) => s.click > 0 && s.r('App') === 0 && s.log.some((l) => l.includes('holat.count')),
        natija: '`let { count } = holat` — `holat.count` ning shu paytdagi qiymati (0) nusxalandi. Yangi o‘zgaruvchi `holat` bilan bog‘lanmagan, Vue uni kuzatmaydi.',
      },
      {
        text: 'Destructuring’ni olib tashlang: funksiyada `holat.count++`, shablonda `{{ holat.count }}`. Tugmani bosing.',
        yechim: { 'App.vue': VUE_REACTIVE_1 },
        amal: [{ click: 'button' }],
        check: (s) => s.set('holat.count') > 0 && s.r('App') > 0,
        natija: 'reactive Proxy orqali ishlaydi: o‘qish va yozish `holat.` orqali bo‘lgandagina kuzatiladi. Grafda `holat.count` va `holat.nom` alohida — har xossa alohida bog‘liqlik.',
      },
    ],
  },
  {
    id: 'vue-computed-barqaror',
    title: 'computed qiymati o‘zgarmasa — render yo‘q',
    bob: '/vue/10-computed',
    intro: 'computed qayta hisoblansa ham, natijasi avvalgisi bilan bir xil bo‘lsa, unga bog‘liq komponent chizilmaydi (Vue 3.4 dan beri).',
    fayllar: { 'App.vue': VUE_BARQAROR_0 },
    manba: ['https://vuejs.org/guide/best-practices/performance.html#computed-stability'],
    steps: [
      {
        text: '«Qo‘shish» ni bosing (son 2 ga oshadi). Jurnalda `juftmi` qayta hisoblandi — App chizildimi?',
        amal: [{ click: 'button' }],
        check: (s) => s.c('juftmi') > 0 && s.r('App') === 0,
        natija: '`count` o‘zgardi → `juftmi` qayta hisoblandi, lekin natija yana `true`. Qiymat o‘zgarmagani uchun App’ning render’i o‘tkazib yuborildi.',
      },
      {
        text: '`count.value += 2` ni `count.value++` qiling va yana bosing.',
        yechim: { 'App.vue': VUE_BARQAROR_1 },
        amal: [{ click: 'button' }],
        check: (s) => s.c('juftmi') > 0 && s.r('App') > 0,
        natija: 'Endi `juftmi` `true → false` bo‘ldi va App chizildi. computed — nafaqat kesh, balki keraksiz render’lardan ham himoya.',
      },
    ],
  },
  {
    id: 'vue-watch',
    title: 'watchEffect bog‘liqliklari',
    bob: '/vue/16-watch-va-watcheffect',
    intro: 'watchEffect o‘zi o‘qigan qiymatlarni avtomatik kuzatadi. O‘qilmagan qiymat o‘zgarsa, effekt ishlamaydi.',
    fayllar: { 'App.vue': VUE_WATCH_0 },
    manba: ['https://vuejs.org/guide/essentials/watchers.html#watcheffect'],
    steps: [
      {
        text: 'Qidiruv maydoniga biror narsa yozing.',
        amal: [{ yoz: 'input', matn: 'vue' }],
        check: (s) => s.set('qidiruv') > 0 && s.w() > 0,
        natija: 'Effekt ichida `qidiruv.value` o‘qilgani uchun u kuzatildi: har harfda effekt qayta ishladi. Grafda `qidiruv → watchEffect` bog‘lanishi bor.',
      },
      {
        text: '«Keyingi» ni bosing.',
        amal: [{ click: 'button', matn: 'Keyingi' }],
        // to'plam bo'yicha: oldingi qadamdagi yozish voqealari kechikib kelsa ham adashmasin
        check: (s) => s.batches.some((b) => b.set('sahifa') > 0 && b.w() === 0),
        natija: '`sahifa` o‘zgardi va App chizildi, lekin effekt ishlamadi: u `sahifa` ni o‘qimaydi, demak unga bog‘lanmagan.',
      },
      {
        text: 'Effekt ichida `sahifa.value` ni ham o‘qing: `console.log(\'so‘rov yuborildi:\', qidiruv.value, sahifa.value)`. So‘ng yana «Keyingi» ni bosing.',
        yechim: { 'App.vue': VUE_WATCH_1 },
        amal: [{ click: 'button', matn: 'Keyingi' }],
        check: (s) => s.batches.some((b) => b.set('sahifa') > 0 && b.w() > 0),
        natija: 'Endi effekt ikkala qiymatga bog‘langan. watchEffect bog‘liqliklarni bajarilish paytida o‘zi yig‘adi; `watch` esa faqat aniq berilgan manbani kuzatadi.',
      },
    ],
  },
  {
    id: 'vue-pinia',
    title: 'Pinia: umumiy ombor',
    bob: '/vue/42-pinia',
    intro: 'Ikki komponent bir-biriga hech narsa bermaydi, lekin bitta ombordan (store) foydalanadi. Ombordagi o‘zgarish kimga yetib borishini va destructuring nega xavfli ekanini ko‘ramiz.',
    fayllar: { 'App.vue': PINIA_APP, 'Sarlavha.vue': PINIA_SARLAVHA_0, 'Mahsulotlar.vue': PINIA_MAHSULOTLAR, 'stores/savat.js': PINIA_STORE },
    manba: ['https://pinia.vuejs.org/core-concepts/', 'https://pinia.vuejs.org/core-concepts/#Destructuring-from-a-Store'],
    steps: [
      {
        text: '«Olma qo‘shish» ni bosing. Sarlavha va Mahsulotlar bir-biriga props bermaydi — Sarlavha yangilandimi? «Ombor» tabiga ham qarang.',
        amal: [{ click: 'button', matn: 'Olma qo‘shish' }],
        check: (s) => s.action('qosh') > 0 && s.r('Sarlavha') > 0 && s.r('Mahsulotlar') === 0,
        natija: 'Mahsulotlar `savat.qosh()` amalini chaqirdi → ombordagi `items` o‘zgardi → `soni` va `jami` qayta hisoblandi → ularni ishlatgan Sarlavha chizildi. Mahsulotlar ombordan hech narsa o‘qimaydi — unga tegilmadi.',
      },
      {
        text: 'Sarlavha.vue’da qiymatlarni ajratib oling: `const { soni, jami } = useSavatStore()`, shablonda `{{ soni }}` va `{{ jami }}`. So‘ng yana qo‘shing.',
        yechim: { 'Sarlavha.vue': PINIA_SARLAVHA_1 },
        amal: [{ click: 'button', matn: 'Olma qo‘shish' }],
        check: (s) => kodda(s, /const \{ soni, jami \} = useSavatStore\(\)/) && s.action('qosh') > 0 && s.r('Sarlavha') === 0,
        natija: 'Sarlavha yangilanmadi! Destructuring `soni` va `jami` ning shu paytdagi qiymatini nusxaladi — ular ombor bilan bog‘lanmagan.',
      },
      {
        text: '`storeToRefs` bilan ajrating: `const { soni, jami } = storeToRefs(useSavatStore())` (`import { storeToRefs } from \'pinia\'`). So‘ng qo‘shing.',
        yechim: { 'Sarlavha.vue': PINIA_SARLAVHA_2 },
        amal: [{ click: 'button', matn: 'Olma qo‘shish' }],
        check: (s) => kodda(s, /storeToRefs\(/) && s.r('Sarlavha') > 0,
        natija: '`storeToRefs` har state va getter uchun ombor bilan bog‘langan ref yaratadi. Amallarni (`qosh`) esa to‘g‘ridan-to‘g‘ri ombordan olish mumkin.',
      },
    ],
  },
  {
    id: 'vue-router',
    title: 'Vue Router: yo‘l va parametr',
    bob: '/vue/39-router-asoslari',
    intro: 'Router manzilni jadvaldagi yo‘lga moslaydi va `<RouterView>` o‘rniga kerakli komponentni qo‘yadi. Parametr o‘zgarganda nima bo‘lishini ko‘ramiz.',
    fayllar: { 'App.vue': ROUTER_APP, 'router.js': ROUTER_JS, 'Bosh.vue': ROUTER_BOSH, 'Mahsulot.vue': ROUTER_MAHSULOT },
    manba: ['https://router.vuejs.org/guide/essentials/dynamic-matching.html#Reacting-to-Params-Changes'],
    steps: [
      {
        text: '«Mahsulot 1» havolasini bosing. «Yo‘llar» tabida qaysi qator yondi?',
        amal: [{ click: 'a', matn: 'Mahsulot 1' }],
        check: (s) => s.navOk('/mahsulot/1') && s.m('Mahsulot') > 0,
        natija: 'Router `/mahsulot/1` ni jadvaldagi `/mahsulot/:id` ga mosladi, `id = 1` ni ajratdi va `<RouterView>` o‘rniga Mahsulot komponentini yaratdi.',
      },
      {
        text: 'Endi «Mahsulot 2» ni bosing. Mahsulot yangidan yaratildimi? Konsolga ham qarang.',
        amal: [{ click: 'a', matn: 'Mahsulot 2' }],
        check: (s) => s.navOk('/mahsulot/2') && s.m('Mahsulot') === 0 && s.r('Mahsulot') > 0,
        natija: 'Yangi Mahsulot yaratilmadi — o‘sha komponent qayta ishlatildi, faqat `route.params.id` o‘zgardi va u qayta chizildi. Shuning uchun konsoldagi «Mahsulot yaratildi» qayta chiqmadi. Parametr o‘zgarishiga javob berish kerak bo‘lsa — `watch` yoki `onBeforeRouteUpdate`.',
      },
    ],
  },
  {
    id: 'vue-router-guard',
    title: 'Vue Router: nazorat punktlari (guard)',
    bob: '/vue/40-router-chuqur',
    intro: 'Guard — o‘tishdan oldin ishlaydigan funksiya: u o‘tkazishi, to‘xtatishi yoki boshqa joyga yo‘naltirishi mumkin. Kirish talab qilinadigan sahifani himoya qilamiz.',
    fayllar: { 'App.vue': GUARD_APP, 'router.js': GUARD_ROUTER, 'auth.js': GUARD_AUTH, 'Bosh.vue': ROUTER_BOSH, 'Profil.vue': GUARD_PROFIL, 'Kirish.vue': GUARD_KIRISH },
    manba: ['https://router.vuejs.org/guide/advanced/navigation-guards.html', 'https://router.vuejs.org/guide/advanced/meta.html'],
    steps: [
      {
        text: '«Profil» havolasini bosing. Qaysi sahifa ochildi? «Yo‘llar» tabidagi nazorat punktlariga qarang.',
        amal: [{ click: 'a', matn: 'Profil' }],
        check: (s) => s.guard('beforeEach', 'yonaltirdi') > 0 && s.navOk('/kirish'),
        natija: '`beforeEach` yo‘lning `meta.kirishKerak` belgisini ko‘rdi, foydalanuvchi kirmagan — `\'/kirish\'` qaytardi. Router eski o‘tishni bekor qilib, `/kirish` ga yangi o‘tish boshladi.',
      },
      {
        text: '«Tizimga kirish» tugmasini bosing.',
        amal: [{ click: 'button', matn: 'Tizimga kirish' }],
        check: (s) => s.guard('beforeEach', 'ruxsat') > 0 && s.navOk('/profil'),
        natija: 'Endi `kirgan` — `true`: o‘sha guard hech narsa qaytarmadi (ruxsat) va Profil ochildi.',
      },
    ],
  },
]

// ── React ─────────────────────────────────────────────────────────────────────────────────────────

const REACT_STATE_0 = `export default function App() {
  let count = 0

  function add() {
    count++
    console.log('count =', count)
  }

  return <button onClick={add}>Bosildi: {count} marta</button>
}
`
const REACT_STATE_1 = `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  function add() {
    setCount(count + 1)
  }

  return <button onClick={add}>Bosildi: {count} marta</button>
}
`
const REACT_STATE_2 = REACT_STATE_1.replace('    setCount(count + 1)\n', '    setCount(count + 1)\n    setCount(count + 1)\n    setCount(count + 1)\n')
const REACT_STATE_3 = REACT_STATE_1.replace('    setCount(count + 1)\n', '    setCount((c) => c + 1)\n    setCount((c) => c + 1)\n    setCount((c) => c + 1)\n')

const REACT_OTA_APP_0 = `import { useState } from 'react'
import Royxat from './Royxat.jsx'

export default function App() {
  const [matn, setMatn] = useState('')

  return (
    <div>
      <input value={matn} onChange={(e) => setMatn(e.target.value)} placeholder="Yozing…" />
      <p>Siz yozdingiz: {matn}</p>
      <Royxat />
    </div>
  )
}
`
const REACT_OTA_ROYXAT_0 = `const MAHSULOTLAR = ['Olma', 'Non', 'Sut', 'Choy', 'Guruch']

export default function Royxat() {
  console.log('Royxat chizildi')
  return (
    <ul>
      {MAHSULOTLAR.map((m) => <li key={m}>{m}</li>)}
    </ul>
  )
}
`
const REACT_OTA_ROYXAT_1 = `import { memo } from 'react'

const MAHSULOTLAR = ['Olma', 'Non', 'Sut', 'Choy', 'Guruch']

function Royxat() {
  console.log('Royxat chizildi')
  return (
    <ul>
      {MAHSULOTLAR.map((m) => <li key={m}>{m}</li>)}
    </ul>
  )
}

export default memo(Royxat)
`
const REACT_OTA_APP_2 = `import { useState } from 'react'
import Royxat from './Royxat.jsx'

export default function App() {
  return (
    <div>
      <Qidiruv />
      <Royxat />
    </div>
  )
}

function Qidiruv() {
  const [matn, setMatn] = useState('')

  return (
    <>
      <input value={matn} onChange={(e) => setMatn(e.target.value)} placeholder="Yozing…" />
      <p>Siz yozdingiz: {matn}</p>
    </>
  )
}
`

const REACT_CB_APP_0 = `import { useState } from 'react'
import Tugma from './Tugma.jsx'

export default function App() {
  const [count, setCount] = useState(0)
  const [yoqdi, setYoqdi] = useState(0)

  const like = () => setYoqdi((y) => y + 1)

  return (
    <div>
      <p>Son: {count} · Yoqdi: {yoqdi}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <Tugma onClick={like}>Yoqdi</Tugma>
    </div>
  )
}
`
const REACT_CB_TUGMA = `import { memo } from 'react'

function Tugma({ onClick, children }) {
  return <button className="ikkinchi" onClick={onClick}>{children}</button>
}

export default memo(Tugma)
`
const REACT_CB_APP_1 = REACT_CB_APP_0
  .replace("import { useState } from 'react'", "import { useCallback, useState } from 'react'")
  .replace('const like = () => setYoqdi((y) => y + 1)', 'const like = useCallback(() => setYoqdi((y) => y + 1), [])')

const REACT_CTX_0 = `import { createContext, memo, useContext, useState } from 'react'

const Foydalanuvchi = createContext(null)
Foydalanuvchi.displayName = 'Foydalanuvchi'

export default function App() {
  const [ism, setIsm] = useState('Ali')
  const [count, setCount] = useState(0)

  const qiymat = { ism, setIsm }

  return (
    <Foydalanuvchi value={qiymat}>
      <button onClick={() => setCount(count + 1)}>Hisob: {count}</button>
      <Sahifa />
    </Foydalanuvchi>
  )
}

const Sahifa = memo(function Sahifa() {
  return (
    <main>
      <Profil />
    </main>
  )
})

function Profil() {
  const { ism } = useContext(Foydalanuvchi)
  return <p>Salom, {ism}!</p>
}
`
const REACT_CTX_1 = REACT_CTX_0
  .replace('import { createContext, memo, useContext, useState }', 'import { createContext, memo, useContext, useMemo, useState }')
  .replace('const qiymat = { ism, setIsm }', 'const qiymat = useMemo(() => ({ ism, setIsm }), [ism])')

const REACT_KEY_0 = `import { useState } from 'react'

const KONTAKTLAR = [
  { id: 1, ism: 'Ali' },
  { id: 2, ism: 'Vali' },
]

export default function App() {
  const [tanlangan, setTanlangan] = useState(KONTAKTLAR[0])

  return (
    <div>
      {KONTAKTLAR.map((k) => (
        <button key={k.id} onClick={() => setTanlangan(k)}>{k.ism}</button>
      ))}
      <Xabar kontakt={tanlangan} />
    </div>
  )
}

function Xabar({ kontakt }) {
  const [matn, setMatn] = useState('')

  return (
    <label>
      {kontakt.ism}ga xabar:
      <input value={matn} onChange={(e) => setMatn(e.target.value)} />
    </label>
  )
}
`
const REACT_KEY_1 = REACT_KEY_0.replace('<Xabar kontakt={tanlangan} />', '<Xabar key={tanlangan.id} kontakt={tanlangan} />')

// useEffect
const EFFECT_0 = `import { useEffect, useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  const [qorongi, setQorongi] = useState(false)

  useEffect(() => {
    console.log('effekt: sarlavha yangilandi')
    document.title = \`Bosildi: \${count}\`
  })

  return (
    <div className={qorongi ? 'karta qorongi' : 'karta'}>
      <p>Bosildi: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setQorongi(!qorongi)}>Mavzu</button>
    </div>
  )
}
`
const EFFECT_1 = EFFECT_0.replace("    document.title = `Bosildi: ${count}`\n  })", "    document.title = `Bosildi: ${count}`\n  }, [count])")
const CLEANUP_0 = `import { useEffect, useState } from 'react'

export default function App() {
  const [korinadi, setKorinadi] = useState(true)

  return (
    <div>
      <button onClick={() => setKorinadi(!korinadi)}>{korinadi ? 'Yashirish' : 'Ko‘rsatish'}</button>
      {korinadi && <Taymer />}
    </div>
  )
}

function Taymer() {
  useEffect(() => {
    const id = setInterval(() => {
      console.log('tik')
    }, 400)
  }, [])

  return <p>⏱ Taymer ishlayapti…</p>
}
`
const CLEANUP_1 = CLEANUP_0.replace("    }, 400)\n  }, [])", "    }, 400)\n    return () => clearInterval(id)\n  }, [])")

// Zustand
const Z_OMBOR = `import { create } from 'zustand'

export const useSavat = create((set) => ({
  items: [],
  qorongi: false,
  qosh: (nom) => set((s) => ({ items: [...s.items, nom] })),
  mavzu: () => set((s) => ({ qorongi: !s.qorongi })),
}))
`
const Z_APP = `import Sarlavha from './Sarlavha.jsx'
import Tugmalar from './Tugmalar.jsx'

export default function App() {
  return (
    <div>
      <Sarlavha />
      <Tugmalar />
    </div>
  )
}
`
const Z_SARLAVHA_0 = `import { useSavat } from './ombor.js'

export default function Sarlavha() {
  const ombor = useSavat()
  return <h3>🛒 Savatda: {ombor.items.length} ta</h3>
}
`
const Z_SARLAVHA_1 = `import { useSavat } from './ombor.js'

export default function Sarlavha() {
  const soni = useSavat((s) => s.items.length)
  return <h3>🛒 Savatda: {soni} ta</h3>
}
`
const Z_TUGMALAR = `import { useSavat } from './ombor.js'

export default function Tugmalar() {
  const qosh = useSavat((s) => s.qosh)
  const mavzu = useSavat((s) => s.mavzu)

  return (
    <p>
      <button onClick={() => qosh('Olma')}>Olma qo‘shish</button>
      <button onClick={mavzu}>Mavzu</button>
    </p>
  )
}
`

// TanStack Query
const QUERY_0 = `import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  const [korinadi, setKorinadi] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <button onClick={() => setKorinadi(!korinadi)}>{korinadi ? 'Yashirish' : 'Ko‘rsatish'}</button>
      {korinadi && (
        <>
          <Hisob />
          <Royxat />
        </>
      )}
    </QueryClientProvider>
  )
}

function useVazifalar() {
  return useQuery({
    queryKey: ['vazifalar'],
    queryFn: () => fetch('/api/vazifalar').then((r) => r.json()),
  })
}

function Hisob() {
  const { data } = useVazifalar()
  return <p>Vazifalar soni: {data ? data.length : '…'}</p>
}

function Royxat() {
  const { data, isPending } = useVazifalar()
  if (isPending) return <p>Yuklanmoqda…</p>
  return (
    <ul>
      {data.map((v) => <li key={v.id}>{v.matn}</li>)}
    </ul>
  )
}
`
const QUERY_1 = QUERY_0.replace("    queryFn: () => fetch('/api/vazifalar').then((r) => r.json()),\n", "    queryFn: () => fetch('/api/vazifalar').then((r) => r.json()),\n    staleTime: 10_000,\n")

export const REACT_MASHQLAR = [
  {
    id: 'react-state',
    title: 'useState, snapshot va batching',
    bob: '/react/16-usestate',
    intro: 'React qachon komponentni qayta chizadi? Oddiy o‘zgaruvchi va state farqi, state’ning «surat» ekani va bir nechta set chaqiruvi bitta render’ga yig‘ilishi.',
    fayllar: { 'App.jsx': REACT_STATE_0 },
    manba: ['https://react.dev/learn/state-a-components-memory', 'https://react.dev/learn/state-as-a-snapshot', 'https://react.dev/learn/queueing-a-series-of-state-updates'],
    steps: [
      {
        text: 'Tugmani bosing. Konsolda `count` oshyapti, lekin son o‘zgarmayapti va `App` yonmayapti.',
        amal: [{ click: 'button' }],
        check: (s) => s.click > 0 && s.r('App') === 0 && s.log.some((l) => l.includes('count =')),
        natija: 'Lokal o‘zgaruvchi render’lar orasida saqlanmaydi, uning o‘zgarishi esa React’ga qayta chizish kerakligini aytmaydi.',
      },
      {
        text: '`useState` ishlating: `const [count, setCount] = useState(0)`, funksiyada `setCount(count + 1)`. Tugmani bosing.',
        yechim: { 'App.jsx': REACT_STATE_1 },
        amal: [{ click: 'button' }],
        check: (s) => kodda(s, /useState\(/) && s.set('count') > 0 && s.r('App') > 0,
        natija: '`setCount` React’ga yangi qiymatni beradi va render so‘raydi: App funksiyasi yana chaqirildi, endi `count` yangi qiymat bilan.',
      },
      {
        text: '`add` ichida `setCount(count + 1)` ni uch marta yozing va bosing. Son nechtaga oshdi?',
        yechim: { 'App.jsx': REACT_STATE_2 },
        amal: [{ click: 'button' }],
        check: (s) => s.batches.some((b) => b.set('count') >= 3 && b.r('App') === 1 && b.qadam('App', 'count') === 1),
        natija: 'Uch chaqiruv — bitta render, son faqat 1 ga oshdi. Bu render ichida `count` — o‘zgarmas «surat»: uchala chaqiruv ham `0 + 1` ni so‘radi. React o‘zgarishlarni yig‘ib (batching), bir marta chizadi.',
      },
      {
        text: 'Endi `setCount((c) => c + 1)` ko‘rinishida uch marta yozing va bosing.',
        yechim: { 'App.jsx': REACT_STATE_3 },
        amal: [{ click: 'button' }],
        check: (s) => s.batches.some((b) => b.set('count') >= 3 && b.r('App') === 1 && b.qadam('App', 'count') === 3),
        natija: 'Yangilovchi funksiya navbatdagi qiymatni oladi: 0 → 1 → 2 → 3. Render baribir bitta.',
      },
    ],
  },
  {
    id: 'react-ota',
    title: 'Ota chizilsa — bola ham chiziladi',
    bob: '/react/41-unumdorlik',
    intro: 'React’da komponent chizilsa, uning ichidagi barcha bolalar ham chiziladi — props o‘zgarmagan bo‘lsa ham. Buni ikki yo‘l bilan to‘xtatamiz.',
    fayllar: { 'App.jsx': REACT_OTA_APP_0, 'Royxat.jsx': REACT_OTA_ROYXAT_0 },
    manba: ['https://react.dev/learn/render-and-commit', 'https://react.dev/reference/react/memo'],
    steps: [
      {
        text: 'Maydonga bir nechta harf yozing. Royxat qayta chizilyaptimi?',
        amal: [{ yoz: 'input', matn: 'abc' }],
        check: (s) => s.r('Royxat') >= 2,
        natija: 'Royxat’ga hech narsa o‘zgarmagan, lekin App chizilgani uchun u ham chizildi (sabab: «ota chizildi»). Bu React’ning standart xatti-harakati.',
      },
      {
        text: 'Royxat.jsx’da komponentni `memo` bilan o‘rang: `export default memo(Royxat)` (`import { memo } from \'react\'`). So‘ng yana yozing.',
        yechim: { 'Royxat.jsx': REACT_OTA_ROYXAT_1 },
        amal: [{ yoz: 'input', matn: 'abc' }],
        check: (s) => kodda(s, /memo\(/) && s.r('App') > 0 && s.r('Royxat') === 0 && s.skip('Royxat') > 0,
        natija: 'memo props’ni oldingisi bilan solishtiradi: o‘zgarmagan bo‘lsa, render o‘tkazib yuboriladi (daraxtda kulrang chiziq bilan).',
      },
      {
        text: 'memo’siz yo‘l: memo’ni olib tashlang, input va `matn` state’ini alohida `Qidiruv` komponentiga ko‘chiring — App’da state qolmasin. So‘ng yozing.',
        yechim: { 'App.jsx': REACT_OTA_APP_2, 'Royxat.jsx': REACT_OTA_ROYXAT_0 },
        amal: [{ yoz: 'input', matn: 'abc' }],
        check: (s) => !kodda(s, /memo\(/) && s.r('Qidiruv') > 0 && s.r('App') === 0 && s.r('Royxat') === 0,
        natija: 'State endi faqat kerakli joyda: Qidiruv chizilsa ham, Royxat uning bolasi emas — unga tegilmadi. Rasmiy hujjat ham memo’dan oldin shuni maslahat beradi: state’ni keragidan yuqoriga ko‘tarmang.',
      },
    ],
  },
  {
    id: 'react-usecallback',
    title: 'memo, yangi funksiya va useCallback',
    bob: '/react/22-usememo-usecallback',
    intro: 'memo props’ni `Object.is` bilan solishtiradi. Har render’da yangi yaratiladigan funksiya memo’ni befoyda qiladi.',
    fayllar: { 'App.jsx': REACT_CB_APP_0, 'Tugma.jsx': REACT_CB_TUGMA },
    manba: ['https://react.dev/reference/react/useCallback#skipping-re-rendering-of-components'],
    steps: [
      {
        text: '«+1» ni bosing. Tugma memo bilan o‘ralgan — chizildimi? Sababiga qarang.',
        amal: [{ click: 'button', matn: '+1' }],
        check: (s) => s.r('Tugma') > 0 && s.sabab('Tugma').some((x) => x.label === 'props.onClick'),
        natija: 'Chizildi: `like` har render’da qaytadan yaratiladi — yangi funksiya, demak `props.onClick` o‘zgardi va memo render’ni to‘xtatmadi.',
      },
      {
        text: '`like` ni `useCallback` bilan o‘rang: `const like = useCallback(() => setYoqdi((y) => y + 1), [])`. So‘ng «+1» ni bosing.',
        yechim: { 'App.jsx': REACT_CB_APP_1 },
        amal: [{ click: 'button', matn: '+1' }],
        check: (s) => kodda(s, /useCallback\(/) && s.r('App') > 0 && s.r('Tugma') === 0 && s.skip('Tugma') > 0,
        natija: 'useCallback funksiyani render’lar orasida saqlaydi (bog‘liqliklari o‘zgarmaguncha) — props bir xil, memo ishladi.',
      },
    ],
  },
  {
    id: 'react-context',
    title: 'Context qiymati va memo',
    bob: '/react/20-context',
    intro: 'Context o‘zgarsa, uni o‘qigan komponent memo ichida bo‘lsa ham chiziladi. Context qiymatini har render’da yangi obyekt qilish shuning uchun qimmat.',
    fayllar: { 'App.jsx': REACT_CTX_0 },
    manba: ['https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions'],
    steps: [
      {
        text: '«Hisob» tugmasini bosing. Sahifa memo bilan to‘xtadi — Profil-chi?',
        amal: [{ click: 'button' }],
        check: (s) => s.skip('Sahifa') > 0 && s.r('Profil') > 0 && s.sabab('Profil').some((x) => x.context),
        natija: 'Profil chizildi, sabab — context: `{ ism, setIsm }` har render’da yangi obyekt. Context o‘zgarsa, uni o‘qigan har komponent memo’dan qat’i nazar chiziladi.',
      },
      {
        text: 'Qiymatni `useMemo` bilan saqlang: `const qiymat = useMemo(() => ({ ism, setIsm }), [ism])`. So‘ng yana bosing.',
        yechim: { 'App.jsx': REACT_CTX_1 },
        amal: [{ click: 'button' }],
        check: (s) => kodda(s, /useMemo\(/) && s.r('App') > 0 && s.r('Profil') === 0,
        natija: 'Qiymat faqat `ism` o‘zgarganda yangilanadi. `count` o‘zgarganda Profil’ga tegilmadi.',
      },
    ],
  },
  {
    id: 'react-key',
    title: 'key bilan holatni qayta boshlash',
    bob: '/react/09-royxatlar-va-key',
    intro: 'React state’ni komponentning daraxtdagi o‘rniga bog‘laydi. O‘rin va tur bir xil qolsa — state saqlanadi; key o‘zgarsa — komponent yangidan yaratiladi.',
    fayllar: { 'App.jsx': REACT_KEY_0 },
    manba: ['https://react.dev/learn/preserving-and-resetting-state'],
    steps: [
      {
        text: 'Maydonga xabar yozing, keyin «Vali» ni tanlang. Yozilgan matn qoldimi?',
        amal: [{ yoz: 'input', matn: 'salom' }, { click: 'button', matn: 'Vali' }],
        check: (s) => s.set('tanlangan') > 0 && s.r('Xabar') > 0 && s.m('Xabar') === 0 && s.doc?.querySelector('input')?.value !== '',
        natija: 'Matn qoldi: Xabar o‘sha joyda, o‘sha turdagi komponent — React uni saqlab, faqat props’ini yangiladi. Ali’ga yozilgan xabar Vali’ga ham ko‘rinib turibdi.',
      },
      {
        text: '`<Xabar key={tanlangan.id} kontakt={tanlangan} />` qiling. Yozing va boshqa kontaktni tanlang.',
        yechim: { 'App.jsx': REACT_KEY_1 },
        amal: [{ yoz: 'input', matn: 'salom' }, { click: 'button', matn: 'Vali' }],
        check: (s) => kodda(s, /<Xabar[^>]*\bkey=/) && s.m('Xabar') > 0 && s.doc?.querySelector('input')?.value === '',
        natija: 'key o‘zgardi → React eski Xabar’ni olib tashladi va yangisini yaratdi (mount): state noldan boshlandi.',
      },
    ],
  },
  {
    id: 'react-effect',
    title: 'useEffect va bog‘liqliklar',
    bob: '/react/27-useeffect-asoslar',
    intro: 'Effekt — render’dan keyin ishlaydigan kod. Bog‘liqliklar ro‘yxati React’ga effektni qachon qayta ishlatish kerakligini aytadi.',
    fayllar: { 'App.jsx': EFFECT_0 },
    manba: ['https://react.dev/learn/synchronizing-with-effects', 'https://react.dev/reference/react/useEffect'],
    steps: [
      {
        text: '«Mavzu» tugmasini bosing. Effekt `count` ni ishlatadi — mavzu o‘zgarganda u ishladimi?',
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => s.set('qorongi') > 0 && s.effect('App') > 0,
        natija: 'Ishladi: bog‘liqliklar ro‘yxati berilmagan, shuning uchun effekt har render’dan keyin ishlaydi — mavzu o‘zgarganda ham.',
      },
      {
        text: 'Effektga ikkinchi argument bering: `}, [count])`. So‘ng yana «Mavzu» ni bosing.',
        yechim: { 'App.jsx': EFFECT_1 },
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => kodda(s, /\}, \[count\]\)/) && s.set('qorongi') > 0 && s.effect('App') === 0,
        natija: 'Effekt ishlamadi: React ro‘yxatdagi har qiymatni oldingisi bilan solishtirdi (`Object.is`) — `count` o‘zgarmagan.',
      },
      {
        text: 'Endi «+1» ni bosing.',
        amal: [{ click: 'button', matn: '+1' }],
        check: (s) => s.effektSababi('App', 'count'),
        natija: '`count` o‘zgardi — effekt qayta ishladi. Hikoyada qaysi bog‘liqlik o‘zgargani ko‘rsatilgan.',
      },
    ],
  },
  {
    id: 'react-cleanup',
    title: 'Effektni tozalash (cleanup)',
    bob: '/react/29-effekt-hayot-sikli',
    intro: 'Effekt nimanidir boshlasa (taymer, obuna, ulanish), u to‘xtatilishi ham kerak. Buning uchun effekt tozalash funksiyasini qaytaradi.',
    fayllar: { 'App.jsx': CLEANUP_0 },
    manba: ['https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development', 'https://react.dev/learn/lifecycle-of-reactive-effects'],
    steps: [
      {
        text: '«Yashirish» ni bosing va konsolga qarang. Taymer ekrandan o‘chdi — `tik` to‘xtadimi?',
        amal: [{ click: 'button', matn: 'Yashirish' }, { kut: 1400 }],
        check: (s) => s.u('Taymer') > 0 && s.unmountdanKeyin.filter((l) => l === 'tik').length >= 2,
        natija: 'To‘xtamadi: komponent o‘chdi, lekin `setInterval` ishlashda davom etyapti — uni hech kim to‘xtatmadi. Bu xotira oqishi (memory leak).',
      },
      {
        text: 'Effektdan tozalash funksiyasini qaytaring: `return () => clearInterval(id)`. So‘ng «Yashirish» ni bosing.',
        yechim: { 'App.jsx': CLEANUP_1 },
        amal: [{ click: 'button', matn: 'Yashirish' }],
        check: (s) => kodda(s, /clearInterval\(/) && s.cleanup('Taymer') > 0 && s.u('Taymer') > 0,
        natija: 'Komponent o‘chirilishidan oldin React effekt qaytargan funksiyani chaqirdi — interval to‘xtadi, konsolda yangi `tik` yo‘q.',
      },
    ],
  },
  {
    id: 'react-zustand',
    title: 'Zustand: ombor va selector',
    bob: '/react/36-zustand',
    intro: 'Zustand ombori komponentlarga umumiy. Komponent ombordan nimani olsa (selector), faqat o‘sha o‘zgarganda qayta chiziladi.',
    fayllar: { 'App.jsx': Z_APP, 'Sarlavha.jsx': Z_SARLAVHA_0, 'Tugmalar.jsx': Z_TUGMALAR, 'ombor.js': Z_OMBOR },
    manba: ['https://zustand.docs.pmnd.rs/getting-started/introduction', 'https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow'],
    steps: [
      {
        text: '«Mavzu» ni bosing. U faqat `qorongi` ni o‘zgartiradi, Sarlavha esa uni ko‘rsatmaydi — Sarlavha chizildimi?',
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => s.action('mavzu') > 0 && s.r('Sarlavha') > 0,
        natija: 'Chizildi: Sarlavha butun omborni oldi (`useSavat()`). Ombordagi istalgan o‘zgarish yangi obyekt beradi — tanlov «o‘zgardi» deb hisoblanadi.',
      },
      {
        text: 'Sarlavha faqat kerakligini olsin: `const soni = useSavat((s) => s.items.length)`, ichida `{soni}`. So‘ng «Mavzu» ni bosing.',
        yechim: { 'Sarlavha.jsx': Z_SARLAVHA_1 },
        amal: [{ click: 'button', matn: 'Mavzu' }],
        check: (s) => kodda(s, /useSavat\(\(s\) => s\.items\.length\)/) && s.action('mavzu') > 0 && s.r('Sarlavha') === 0,
        natija: 'Sarlavha chizilmadi: tanlov natijasi (`items.length`) o‘sha-o‘sha. Hikoyadagi 🔍 qadamda har komponent tanlovi solishtirilgani ko‘rinadi.',
      },
      {
        text: 'Endi «Olma qo‘shish» ni bosing.',
        amal: [{ click: 'button', matn: 'Olma qo‘shish' }],
        check: (s) => s.action('qosh') > 0 && s.r('Sarlavha') > 0,
        natija: '`items.length` 0 → 1 bo‘ldi — Sarlavha chizildi. Tugmalar esa faqat funksiyalarni tanlaydi, ular o‘zgarmaydi — u chizilmadi.',
      },
    ],
  },
  {
    id: 'react-query',
    title: 'TanStack Query: kesh va so‘rovlar',
    bob: '/react/32-tanstack-query',
    intro: 'Server ma’lumoti keshda saqlanadi: bir xil kalit bilan so‘ragan komponentlar bitta so‘rovni bo‘lishadi. Ma’lumot qachon «eskirgan» bo‘lib, qayta so‘ralishini ko‘ramiz.',
    fayllar: { 'App.jsx': QUERY_0 },
    manba: ['https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', 'https://tanstack.com/query/latest/docs/framework/react/guides/caching'],
    steps: [
      {
        text: '«Ko‘rsatish» ni bosing. Ikki komponent ma’lumot so‘raydi — serverga nechta so‘rov ketdi? «Kesh» tabiga qarang.',
        amal: [{ click: 'button', matn: 'Ko‘rsatish' }, { kut: 1400 }],
        check: (s) => s.tarmoq() === 1 && s.keldi() === 1 && s.kesh('observerAdded') >= 2,
        natija: 'Bitta: ikkala komponent bir xil kalit (`[\'vazifalar\']`) so‘radi — TanStack Query so‘rovlarni birlashtirdi va javobni keshga yozdi.',
      },
      {
        text: '«Yashirish», keyin yana «Ko‘rsatish» ni bosing. «Yuklanmoqda…» chiqdimi? Tarmoqqa qarang.',
        amal: [{ click: 'button', matn: 'Yashirish' }, { click: 'button', matn: 'Ko‘rsatish' }, { kut: 1400 }],
        check: (s) => s.m('Royxat') > 0 && s.keldi() > 0,
        natija: 'Ro‘yxat darhol keshdan chiqdi, lekin fonda qayta so‘raldi: standart `staleTime: 0` — ma’lumot olingan zahoti «eskirgan» hisoblanadi.',
      },
      {
        text: '`useQuery` ga `staleTime: 10_000` qo‘shing. «Ko‘rsatish», «Yashirish», yana «Ko‘rsatish» ni bosing.',
        yechim: { 'App.jsx': QUERY_1 },
        amal: [{ click: 'button', matn: 'Ko‘rsatish' }, { kut: 1400 }, { click: 'button', matn: 'Yashirish' }, { click: 'button', matn: 'Ko‘rsatish' }, { kut: 600 }],
        check: (s) => kodda(s, /staleTime/) && s.m('Royxat') >= 2 && s.tarmoq() === 1,
        natija: '10 soniya davomida ma’lumot «yangi» — qayta ko‘rsatilganda serverga so‘rov ketmadi. Kesh tabidagi yashil chiziq yangilik qancha qolganini ko‘rsatadi.',
      },
    ],
  },
]

export const ERKIN = {
  vue: {
    id: '',
    title: 'Erkin rejim',
    note: 'hisoblagich, computed va bola komponent — o‘zingiz o‘zgartiring',
    fayllar: {
      'App.vue': `<script setup>
import { computed, ref } from 'vue'
import Bola from './Bola.vue'

const count = ref(0)
const ikki = computed(() => count.value * 2)
</script>

<template>
  <button @click="count++">count: {{ count }}</button>
  <p>ikki barobari: {{ ikki }}</p>
  <Bola :qiymat="ikki" />
</template>
`,
      'Bola.vue': `<script setup>
defineProps(['qiymat'])
</script>

<template>
  <p>Bola oldi: {{ qiymat }}</p>
</template>
`,
    },
  },
  react: {
    id: '',
    title: 'Erkin rejim',
    note: 'hisoblagich va bola komponent — o‘zingiz o‘zgartiring',
    fayllar: {
      'App.jsx': `import { useState } from 'react'
import Bola from './Bola.jsx'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      <Bola qiymat={count * 2} />
    </div>
  )
}
`,
      'Bola.jsx': `export default function Bola({ qiymat }) {
  return <p>Bola oldi: {qiymat}</p>
}
`,
    },
  },
}

export const MASHQLAR = { vue: VUE_MASHQLAR, react: REACT_MASHQLAR }
export const findMashq = (fw, id) => MASHQLAR[fw].find((m) => m.id === id) ?? null
export const kirishFayli = (fayllar) => Object.keys(fayllar).find((f) => /^App\.(vue|jsx)$/.test(f)) ?? Object.keys(fayllar)[0]

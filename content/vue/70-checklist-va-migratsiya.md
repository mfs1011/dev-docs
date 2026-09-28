# 70 — Checklist va migratsiya

[← Oldingi: Amaliy loyiha](69-amaliy-loyiha.md) · [Mundarija](README.md)

## Tushuncha

Yakuniy bob ikki qismdan iborat:

1. **Checklistlar** — yangi loyiha, kod ko'rigi va reliz uchun amaliy ro'yxatlar;
2. **Migratsiya** — Vue 2 → 3, Options → Composition, 3.5 → 3.6.

## Checklist: yangi loyiha boshlanishi

- [ ] Render rejimi tanlangan (SPA / SSR / SSG / gibrid) — 04, 58-bob
- [ ] `npm create vue@latest` yoki `npm create nuxt@latest`
- [ ] TypeScript + `strict` — 48-bob
- [ ] ESLint (flat config) + Prettier — 55-bob
- [ ] Vitest + bitta namunaviy test — 52-bob
- [ ] `@` aliasi va papka konvensiyasi — 06-bob
- [ ] CSS tokenlari (`:root` o'zgaruvchilari) va tema — 37-bob
- [ ] Router + sahifa tuzilmasi — 39-bob
- [ ] Pinia (kerak bo'lsa) — 42-bob
- [ ] HTTP qatlami (`api/client`, `useQuery`) — 44-bob
- [ ] Xato monitoringi — 68-bob
- [ ] CI: lint + typecheck + test + build — 55-bob
- [ ] `.env.example` va sirlar siyosati — 06, 65-bob

## Checklist: komponent yozib bo'lgach

- [ ] Props e'lon qilingan va tiplangan (validator/`interface`)
- [ ] Emits e'lon qilingan
- [ ] `v-for` da barqaror `key`
- [ ] Yuklanish / xato / bo'sh / ma'lumot holatlari qamrab olingan
- [ ] Tugmalar `<button>`, havolalar `<RouterLink>`
- [ ] Forma maydonlarida `<label>`, `aria-invalid`, `aria-describedby`
- [ ] Tinglovchilar va timerlar tozalanadi (`onUnmounted`)
- [ ] Props o'zgartirilmaydi
- [ ] Og'ir hisob `computed` da, shablonda emas
- [ ] Matnlar `t()` orqali (i18n bo'lsa)
- [ ] Testda asosiy xatti-harakat qamrab olingan

## Checklist: reliz

- [ ] CI yashil
- [ ] `npm run build && npm run preview` lokal sinaldi
- [ ] Bundle hajmi budjetda — 63-bob
- [ ] Lighthouse: performance, SEO, a11y — 61, 64-bob
- [ ] Sirlar bundle'da yo'q (`grep`) — 65-bob
- [ ] Kesh sarlavhalari (`index.html` — no-cache) — 67-bob
- [ ] SPA fallback ishlaydi
- [ ] Monitoring va source map yuklangan — 68-bob
- [ ] Rollback yo'li ma'lum
- [ ] Smoke test o'tdi

## Kod: Options API → Composition API

Bitta komponentni ko'chirish tartibi:

```js
// Oldin
export default {
  props: { userId: Number },
  data() {
    return { user: null, loading: false }
  },
  computed: {
    displayName() { return this.user?.name ?? '—' },
  },
  watch: {
    userId: { immediate: true, handler(id) { this.load(id) } },
  },
  mounted() { document.title = 'Profil' },
  methods: {
    async load(id) {
      this.loading = true
      this.user = await api.get(`/users/${id}`)
      this.loading = false
    },
  },
}
```

```vue
<!-- Keyin -->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({ userId: Number })

const user = ref(null)                                    // data → ref
const loading = ref(false)

const displayName = computed(() => user.value?.name ?? '—')   // computed → computed

async function load(id) {                                 // methods → funksiya
  loading.value = true
  user.value = await api.get(`/users/${id}`)
  loading.value = false
}

watch(() => props.userId, load, { immediate: true })      // watch → watch
onMounted(() => (document.title = 'Profil'))              // mounted → onMounted
</script>
```

Moslik jadvali:

| Options API | Composition API |
| --- | --- |
| `data()` | `ref()` / `reactive()` |
| `computed` | `computed()` |
| `methods` | Oddiy funksiya |
| `watch` | `watch()` / `watchEffect()` |
| `created` | `<script setup>` tanasi |
| `mounted` | `onMounted()` |
| `unmounted` | `onUnmounted()` |
| `props` | `defineProps()` |
| `$emit` | `defineEmits()` |
| `provide`/`inject` | `provide()`/`inject()` |
| `mixins` | Composable (29-bob) |
| `this.$refs.x` | `useTemplateRef('x')` |
| `this.$router` | `useRouter()` |

Tartib: **bir komponent — bitta commit**, testlar yashil qolsin. Hammasini birdan ko'chirish — eng keng tarqalgan migratsiya xatosi.

## Kod: Vue 2 → Vue 3

Asosiy buzuvchi o'zgarishlar:

| Vue 2 | Vue 3 |
| --- | --- |
| `new Vue({...})` | `createApp({...})` |
| `Vue.component()`, `Vue.use()` | `app.component()`, `app.use()` (03-bob) |
| `Vue.set` / `Vue.delete` | Kerak emas (Proxy, 07-bob) |
| Filtrlar (`{{ x \| fmt }}`) | Olib tashlandi — metod yoki `computed` |
| `beforeDestroy` / `destroyed` | `beforeUnmount` / `unmounted` |
| `$listeners` | `$attrs` ichida (25-bob) |
| `.sync` modifikatori | `v-model:propName` (24-bob) |
| Bitta ildiz element majburiy | Fragment ruxsat (19-bob) |
| `EventBus` (`new Vue()`) | Store yoki mitt kutubxonasi |
| `functional: true` komponentlar | Oddiy funksiya komponent |
| `v-for` + `v-if` prioriteti | Teskari (12-bob) |

Bosqichma-bosqich reja:

1. **Vue 2.7** ga yangilang — u Composition API'ni qo'llab-quvvatlaydi;
2. Yangi kodni Composition API'da yozing;
3. Bog'liqliklarni tekshiring: har bir kutubxonaning Vue 3 versiyasi bormi;
4. `@vue/compat` (migration build) bilan Vue 3 ga o'ting — u Vue 2 xatti-harakatini ogohlantirishlar bilan saqlaydi;
5. Ogohlantirishlarni fayl-fayl tuzating;
6. `@vue/compat` ni olib tashlang.

Eng ko'p vaqt oladigan qism — **ekotizm**: Vuex → Pinia, Vue Router 3 → 4, UI kutubxonasi versiyasi, webpack → Vite.

## Kod: Vuex → Pinia

```js
// Vuex
export default {
  state: () => ({ items: [] }),
  getters: { count: (state) => state.items.length },
  mutations: { ADD(state, item) { state.items.push(item) } },
  actions: {
    add({ commit }, item) { commit('ADD', item) },
  },
}
```

```js
// Pinia (42-bob)
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const count = computed(() => items.value.length)

  function add(item) {
    items.value.push(item)
  }

  return { items, count, add }
})
```

Mutatsiyalar yo'qoladi — action holatni to'g'ridan-to'g'ri o'zgartiradi. Kod hajmi odatda 30–40% ga qisqaradi.

## Kod: 3.5 → 3.6

Minor versiya, API buzilmaydi (47-bob):

1. `npm i vue@3.6` (barqaror chiqqach);
2. Regress testlarni ishlating;
3. Reaktivlik yadrosi tezlashadi — kod o'zgarmaydi;
4. Vapor'ni **ixtiyoriy** ravishda, nuqtaviy sinab ko'ring.

Tekshirish: `npm view vue dist-tags`.

## Muhandislik nuqtai nazari: migratsiya qachon arziydi

| Holat | Qaror |
| --- | --- |
| Vue 2 loyiha, aktiv rivojlanmoqda | Ko'chiring — Vue 2 qo'llab-quvvatlash tugagan (2023-12-31) |
| Vue 2 loyiha, faqat bugfix | Xavfsizlik yamog'i yo'qligini hisobga oling; rejalashtiring |
| Options API, barqaror ishlayapti | Majburan ko'chirmang; yangi kodni Composition'da yozing |
| TypeScript joriy qilinmoqda | Composition API'ga o'tish mantiqan to'g'ri (50-bob) |
| Jamoada yangi odamlar ko'p | Bitta uslubga kelishish foydali |

"Ishlayotgan kodni qayta yozish" o'z-o'zidan qiymat emas. Migratsiya **muammoni** hal qilishi kerak: xavfsizlik, ekotizm, ishga yollash, unumdorlik.

## Muhandislik nuqtai nazari: keyin nima o'qish kerak

Bu qo'llanma tugadi, lekin o'rganish tugamaydi:

| Yo'nalish | Manba |
| --- | --- |
| Rasmiy hujjat (to'liq) | <https://vuejs.org> |
| Vue RFC'lar — kelajakdagi o'zgarishlar | <https://github.com/vuejs/rfcs> |
| Vue core kodi | <https://github.com/vuejs/core> |
| VueUse — composable'lar to'plami | <https://vueuse.org> |
| Nuxt modullari | <https://nuxt.com/modules> |
| Brauzer platformasi | <https://web.dev>, <https://developer.mozilla.org> |

Eng foydali odat: **rasmiy changelog'larni o'qish.** Vue, Vite, Nuxt, Pinia relizlari qisqa va ular ekotizm qayoqqa ketayotganini ko'rsatadi.

## Muhandislik nuqtai nazari: yakuniy fikr

Qo'llanma davomida takrorlangan bir nechta tamoyil — ular Vue'dan kengroq:

1. **Haqiqatning yagona manbai** — hosila qiymatni saqlamang, hisoblang (10-bob);
2. **Ma'lumot bir tomonlama oqadi** — pastga props, yuqoriga hodisa (22, 23-bob);
3. **Holatni ishlatiladigan joyga yaqin saqlang** (41-bob);
4. **Chegarada tekshiring** — server javobi, forma, URL (45, 49-bob);
5. **Klientdagi hech narsa ishonchli emas** (65-bob);
6. **O'lchang, keyin optimallashtiring** (62-bob);
7. **Xatti-harakatni test qiling, ko'rinishni emas** (51-bob).

Vue versiyalari o'zgaradi, API'lar qo'shiladi, Vapor mode keladi — bu tamoyillar qoladi.

## Amaliyot

1. O'z loyihangizni "yangi loyiha checklisti" bo'yicha tekshiring: nechta punkt bajarilmagan?
2. Bitta Options API komponentini Composition API'ga ko'chiring va testlar yashil qolishini tasdiqlang.
3. Vuex store'i bo'lsa, bittasini Pinia'ga ko'chiring va kod hajmini solishtiring.
4. `npm outdated` ni ishga tushiring: qaysi bog'liqliklar orqada qolgan?
5. Reliz checklistini jamoangiz uchun moslashtiring va PR shabloniga qo'shing.

## Rasmiy hujjat

- Vue 3 migratsiya qo'llanmasi: <https://v3-migration.vuejs.org>
- Migration build: <https://v3-migration.vuejs.org/migration-build.html>
- Pinia'ga o'tish: <https://pinia.vuejs.org/cookbook/migration-vuex.html>
- Vue RFC'lar: <https://github.com/vuejs/rfcs>

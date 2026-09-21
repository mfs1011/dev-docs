# 33 — `<TransitionGroup>` va animatsiya texnikalari

[← Oldingi: Transition](32-transition.md) · [Mundarija](README.md) · [Keyingi: KeepAlive →](34-keepalive.md)

## Tushuncha

`<Transition>` bitta element uchun. Ro'yxat uchun `<TransitionGroup>`:

```vue
<template>
    <TransitionGroup name="list" tag="ul">
        <li v-for="item in items" :key="item.id">{{ item.title }}</li>
    </TransitionGroup>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all .3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }

/* Qolgan elementlarning siljishi */
.list-move { transition: transform .3s ease; }

/* Chiqayotgan element oqimdan chiqarilsin — aks holda qolganlari sakraydi */
.list-leave-active { position: absolute; }
</style>
```

Uchta farq `<Transition>` dan:

1. Bir nechta bola bo'lishi mumkin (va **har biriga `key` shart**);
2. `tag` orqali o'ram element beriladi (yoki umuman berilmaydi);
3. Qo'shimcha `v-move` class'i bor — joyini o'zgartirgan elementlar uchun.

## Nega shunday: FLIP texnikasi

Ro'yxatdan element o'chirilganda qolganlari yuqoriga siljiydi. Buni animatsiya qilish oson emas, chunki brauzer elementlarni **darhol** yangi joyga qo'yadi.

Vue ichkarida FLIP (First, Last, Invert, Play) texnikasidan foydalanadi:

1. **First** — eski pozitsiyani o'lchaydi (`getBoundingClientRect`);
2. **Last** — DOM'ni yangilaydi, yangi pozitsiyani o'lchaydi;
3. **Invert** — elementga `transform` qo'yib, uni **vizual ravishda** eski joyiga qaytaradi;
4. **Play** — `v-move` class'idagi `transition` bilan `transform` ni nolga qaytaradi.

Natijada element yangi joyiga silliq "suzib" boradi, garchi DOM allaqachon yangilangan bo'lsa ham. Bu `transform` ishlatgani uchun arzon (32-bob).

## Kod: tartiblanadigan ro'yxat

```vue
<script setup>
import { computed, ref } from 'vue'

const items = ref([
  { id: 1, title: 'Non', price: 5000 },
  { id: 2, title: 'Sut', price: 12000 },
  { id: 3, title: 'Tuxum', price: 24000 },
])

const sortKey = ref('title')

const sorted = computed(() =>
  [...items.value].sort((a, b) =>
    sortKey.value === 'title' ? a.title.localeCompare(b.title) : a.price - b.price,
  ),
)
</script>

<template>
    <button @click="sortKey = 'title'">Nom bo'yicha</button>
    <button @click="sortKey = 'price'">Narx bo'yicha</button>

    <TransitionGroup name="list" tag="ul" class="list">
        <li v-for="item in sorted" :key="item.id">{{ item.title }} — {{ item.price }}</li>
    </TransitionGroup>
</template>
```

Tugma bosilganda elementlar yangi joyiga siljiydi — `key` barqaror bo'lgani uchun Vue ularni taniydi va FLIP ishlaydi.

## Kod: bosqichma-bosqich (staggered) animatsiya

Har element bir oz kechikib chiqsin:

```vue
<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(12px)'
}

function onEnter(el, done) {
  const index = Number(el.dataset.index)

  el.animate(
    [
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 250, delay: index * 40, fill: 'forwards', easing: 'ease-out' },
  ).onfinish = done
}
</script>

<template>
    <TransitionGroup :css="false" tag="ul" @before-enter="onBeforeEnter" @enter="onEnter">
        <li v-for="(item, index) in items" :key="item.id" :data-index="index">
            {{ item.title }}
        </li>
    </TransitionGroup>
</template>
```

Kechikish 40 ms — 10 element uchun 400 ms. Undan ko'p element bo'lsa, kechikishni chegaralang (`Math.min(index, 8) * 40`), aks holda oxirgi element juda kech chiqadi.

## Kod: raqam va holat animatsiyasi

Vue reaktivligi bilan son qiymatini ham animatsiya qilish mumkin:

```vue
<script setup>
import { ref, watch } from 'vue'

const target = ref(0)
const displayed = ref(0)

watch(target, (to) => {
  const from = displayed.value
  const start = performance.now()
  const duration = 600

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) ** 3          // easeOutCubic

    displayed.value = Math.round(from + (to - from) * eased)

    if (progress < 1) requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
})
</script>

<template>
    <p class="counter">{{ displayed.toLocaleString('uz-UZ') }}</p>
    <button @click="target += 1000">+1000</button>
</template>
```

Xuddi shu naqsh bilan SVG yo'lini, rangni yoki grafik ma'lumotini animatsiya qilish mumkin. Kutubxona kerak bo'lsa: `@vueuse/motion`, GSAP, Motion One.

## Muhandislik nuqtai nazari: qachon TransitionGroup kerak emas

Ro'yxat animatsiyasi chiroyli, lekin narxi bor:

- Har element uchun pozitsiya o'lchash (`getBoundingClientRect`) — 100+ element bo'lsa sezilarli;
- `position: absolute` bilan chiqish — layout buziladi, grid/flex bilan ehtiyot bo'lish kerak;
- Virtualizatsiya (62-bob) bilan birga deyarli ishlamaydi.

Amaliy chegara: **30–50 elementgacha** animatsiya qiling, undan katta ro'yxatda faqat qo'shilish/o'chirish uchun oddiy `opacity` bering yoki umuman animatsiya qilmang.

## Muhandislik nuqtai nazari: animatsiya va idrok

Animatsiya foydalanuvchiga **nima o'zgarganini** tushuntirishi kerak:

| Holat | To'g'ri animatsiya |
| --- | --- |
| Element ro'yxatga qo'shildi | Yuqoridan/chapdan silliq kirish |
| Element o'chirildi | O'chib borish + qolganlarning siljishi |
| Tartib o'zgardi | Faqat `move` — kirish/chiqish yo'q |
| Sahifa almashdi | Fade yoki gorizontal siljish (yo'nalish bilan) |
| Modal ochildi | Scale + fade (kelib chiqish nuqtasidan) |

Yomon misol: element o'chirilganda butun ro'yxat qayta chizilib, hammasi "sakrab" chiqsa — foydalanuvchi qaysi element yo'qolganini tushunmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `TransitionGroup` da `key` yo'q | Animatsiya ishlamaydi, elementlar chalkashadi | Barqaror `:key` |
| `.list-leave-active { position: absolute }` yozmaslik | Chiqayotgan element joy egallab turadi, qolganlari sakraydi | `position: absolute` |
| `:key="index"` | Tartib o'zgarsa FLIP noto'g'ri ishlaydi | ID |
| 500 elementli ro'yxatga animatsiya | Har o'zgarishda 500 ta o'lchov | Animatsiyasiz yoki virtualizatsiya |
| `v-move` uchun `transition` bermaslik | Siljish animatsiyasi bo'lmaydi | `.list-move { transition: transform .3s }` |
| Grid layoutda `position: absolute` bilan chiqish | Grid oqimi buziladi | O'ram elementga `position: relative` yoki boshqa yondashuv |

## Amaliyot

1. Vazifalar ro'yxatiga `TransitionGroup` qo'shing: qo'shish, o'chirish va tartiblash animatsiyalari ishlasin.
2. `position: absolute` ni olib tashlab, o'chirishda ro'yxat qanday "sakrashini" ko'ring.
3. Staggered kirish animatsiyasini yozing (`:css="false"` + Web Animations API).
4. Raqam animatsiyasini yozing va `requestAnimationFrame` o'rniga `setInterval` bilan qilib ko'ring — farqni Performance panelida solishtiring.

## Rasmiy hujjat

- TransitionGroup: <https://vuejs.org/guide/built-ins/transition-group.html>
- Animatsiya texnikalari: <https://vuejs.org/guide/extras/animation.html>

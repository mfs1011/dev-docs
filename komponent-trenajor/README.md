# Komponent trenajori (Vue va React)

Brauzerda **haqiqiy** Vue 3.5 va React 19: o'quvchi yozgan kod shu yerning o'zida kompilyatsiya qilinadi va
alohida iframe'da ishlaydi. Har o'zgarish va render jonli ko'rinadi. Sahifalar: `/vue/trenajor`, `/react/trenajor`
(`src/views/KomponentTrenajorPage.vue`, kod `src/komponent/`).

```bash
npm run dev                            # http://localhost:5180/vue/trenajor
npx vite --port 5181 &                 # testlar uchun alohida server
npm run komponent-trenajor:test        # brauzerda (Chromium) har mashqning har qadami
```

| Qism | Fayl | Vazifa |
| --- | --- | --- |
| Natija oynasi | `lab/vue.html`, `lab/react.html` | alohida HTML sahifa (Vite multi-page): o'z Vue/React nusxasi, sayt ilovasiga aralashmaydi |
| Umumiy | `runner/umumiy.js` | fayllarni modul sifatida bajarish (sucrase: `import` → `require`, JSX), konsol va xatolarni ushlash, tekshiruv harakatlari (bosish, yozish) |
| Vue | `runner/vue.js` | `vue.runtime.esm-browser.js` (dev build) va `@vue/compiler-sfc` (brauzer build'i). Kuzatish: `renderTracked`/`renderTriggered`, computed va watch'ning `onTrack`/`onTrigger` debug ilgaklari |
| React | `runner/react.js` | React DevTools ilgagi (`__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`): har commit'da fiber daraxti — kim chizildi, kim o'tkazib yuborildi va nega (props, state, context, ota) |
| Statistika | `stat.js` | mashq qadamini tekshirish uchun voqealar hisobi (jami va har hodisa bo'yicha) |
| Mashqlar | `mashqlar.js` | Vue 6 ta, React 5 ta; har biri kitob bobiga va rasmiy hujjatga bog'langan |
| Ko'rinish | `KodMuharrir.vue`, `KomponentDaraxt.vue`, `ZanjirGraf.vue`, `VoqeaJurnal.vue` | kod, komponentlar daraxti, Vue reaktivlik zanjiri, voqealar jurnali |

## Qanday ishlaydi

- **Vue**: `.vue` fayl `parse` → `compileScript` (`inlineTemplate: false` — setup holati nomlari bilan ko'rinsin)
  → `compileTemplate` → `compileStyle` qilinadi. Foydalanuvchi kodiga beriladigan `vue` modulida `computed`,
  `watch`, `watchEffect` debug ilgaklari bilan o'ralgan — qaysi qiymatni kim o'qigani (graf) va qayta hisoblanishi
  (jurnal) shundan olinadi. Komponentlarga global mixin qo'shiladi.
- **React**: `const [x, setX] = useState(…)` qatori `__lab.useState("x", …)` ga o'giriladi — state'ga nom berish
  va set chaqiruvini jurnalga yozish uchun. Render sabablari commit'dan keyin fiber'ning oldingi nusxasi
  (`alternate`) bilan solishtirib topiladi: props (`Object.is`), hook state, context qiymati.
- Bitta hodisa (bosish, harf) davomidagi barcha voqealar bitta to'plam: Vue'da `nextTick`, React'da batching
  natijasida bir nechta o'zgarish bitta render'ga tushgani shundan ko'rinadi.

## Cheklovlar

- React'ning fiber tuzilmasi rasmiy API emas (React DevTools ham shunga tayanadi) — React yangilanganda
  `runner/react.js` tekshiriladi.
- Kod TypeScript'siz: `.vue` (`<script setup>`), `.js`, `.jsx`.
- Vue natija oynasi ~315 KB (gzip): Vue dev build va brauzerdagi SFC kompilyatori.

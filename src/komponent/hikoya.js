// «Nima bo'ldi?» — bitta hodisa (bosish, yozish, server javobi) voqealarini yangi boshlovchi tushunadigan oddiy
// gaplarga aylantiradi. Tartib haqiqiy ishlash tartibiga mos: siz nima qildingiz → (router nazoratlari) → qaysi
// amal chaqirildi → qaysi qiymat o'zgardi → kim buni ishlatadi → kim qayta chizildi va nega → ekranda nima
// yangilandi → effektlar. Natija — qadamlar ro'yxati (Hikoya.vue chizadi).

const c = (s) => `\`${s}\``
const komp = (n) => `\`<${n}>\``
// voqea ichidagi qisqa qiymat ko'rinishi: "\"abc\"" → «abc»
const q = (v) => (v == null ? '' : String(v).replace(/^"(.*)"$/, '«$1»'))

function harakat(t) {
  const s = t.sabab
  if (!s) {
    if (t.ev.some((e) => e.k === 'tarmoq' && e.faza === 'keldi')) return { ikon: '📥', sarlavha: 'Serverdan javob keldi', matn: 'Bu hodisani siz qilmadingiz — oldin yuborilgan so‘rovning javobi yetib keldi.' }
    if (t.ev.some((e) => e.k === 'effect' || e.k === 'cleanup')) return { ikon: '⚡', sarlavha: 'Effektlar ishladi', matn: 'React effektlarni ekran yangilangandan keyin, alohida bajaradi.' }
    return t.b === 1 ? null : { ikon: '⏱️', sarlavha: 'Kod o‘zi nimanidir o‘zgartirdi', matn: 'Bu hodisani siz qilmadingiz — taymer, effekt yoki tarmoq javobi.' }
  }
  if (s.type === 'click') {
    const nima = s.tag === 'button' ? 'tugmasini' : s.tag === 'li' ? 'qatorini' : s.tag === 'a' ? 'havolasini' : 'elementini'
    return { ikon: '👆', sarlavha: s.text ? `Siz «${s.text.slice(0, 30)}» ${nima} bosdingiz` : 'Siz sahifada bosdingiz' }
  }
  if (s.type === 'change') return { ikon: '☑️', sarlavha: 'Siz belgichani o‘zgartirdingiz' }
  return { ikon: '⌨️', sarlavha: 'Siz maydonga yozdingiz' }
}

// render sababi → oddiy gap
function nega(r, fw, ota) {
  if (r.ota) return fw === 'react'
    ? `chunki otasi${ota ? ` (${komp(ota)})` : ''} chizildi. React’da ota chizilsa, ichidagi bolalar ham chiziladi — props o‘zgarmagan bo‘lsa ham`
    : 'chunki otasi unga slot orqali yangi tarkib berdi'
  if (r.ozi) return 'o‘zi yangilanishni so‘radi'
  if (r.tashqi) {
    const qiy = String(r.old).length + String(r.new).length < 60 ? ` (${q(r.old)} → ${q(r.new)})` : ''
    return r.label === 'useQuery natijasi' ? `chunki ${c('useQuery')} holati o‘zgardi${qiy}` : `chunki ombordan tanlagan qiymati o‘zgardi${qiy}`
  }
  if (r.context) return `chunki u o‘qigan context (${c(r.label)}) qiymati yangilandi`
  const nom = r.label.replace(/^[^:]+: /, '').replace(/^props\./, '')
  if (r.props || r.label.startsWith('props.') || r.label.includes(': props.')) {
    if (r.tur === 'funksiya') return `chunki otasi ${c(nom)} uchun har safar yangi funksiya beradi`
    if (r.tur === 'obyekt') return `chunki otasi ${c(nom)} uchun yangi obyekt berdi`
    if (r.tur === 'element') return `chunki otasi ichiga (${c(nom)}) yangi JSX berdi`
    return `chunki otasi bergan ${c(nom)} o‘zgardi (${q(r.old)} → ${q(r.new)})`
  }
  if (r.computed) return `chunki u ishlatadigan ${c(r.label)} ning natijasi o‘zgardi`
  if (fw === 'react') return `chunki uning state’i ${c(r.label)} o‘zgardi (${q(r.old)} → ${q(r.new)})`
  return `chunki u ${c(r.label)} ni ishlatadi, u esa o‘zgardi`
}

// Vue: o'zgargan qiymatni kim o'qiydi (graf chiziqlaridan)
function kimlar(graf, nodeId) {
  if (!graf || !nodeId) return []
  const nomi = new Map(graf.nodes.map((n) => [n.id, n]))
  return graf.edges.filter(([a]) => a === nodeId).map(([, b]) => nomi.get(b)).filter(Boolean)
    .map((n) => (n.kind === 'component' ? `<${n.label}>` : n.kind === 'computed' ? `ƒ ${n.label}` : `👀 ${n.label}`))
}

const GUARD = {
  beforeEach: 'har o‘tishdan oldin ishlaydigan umumiy nazorat',
  beforeResolve: 'o‘tish tasdiqlanishidan oldingi oxirgi umumiy nazorat',
  afterEach: 'o‘tish tugagandan keyin ishlaydi (to‘xtata olmaydi)',
  beforeEnter: 'faqat shu yo‘lga kirishda ishlaydigan nazorat',
  beforeRouteEnter: 'sahifa komponentiga kirishdan oldingi nazorat',
  beforeRouteUpdate: 'shu sahifa boshqa parametr bilan qayta ochilgandagi nazorat',
  beforeRouteLeave: 'sahifadan chiqib ketishdan oldingi nazorat',
  onBeforeRouteLeave: 'sahifadan chiqib ketishdan oldingi nazorat',
  onBeforeRouteUpdate: 'shu sahifa boshqa parametr bilan qayta ochilgandagi nazorat',
}
function routerQadami(e) {
  if (e.k === 'nav' && e.faza === 'boshlandi') return { ikon: '🧭', sarlavha: e.from ? `Sahifadan sahifaga o‘tish: ${c(e.from)} → ${c(e.to)}` : `Birinchi sahifa ochilmoqda: ${c(e.to)}`, matn: 'Router avval nazorat punktlaridan (guard) o‘tadi — ulardan biri to‘xtatishi yoki boshqa joyga yo‘naltirishi mumkin.' }
  if (e.k === 'guard') {
    const joy = e.joy === 'global' ? '' : ` — ${e.joy}`
    const izoh = GUARD[e.nom] ?? ''
    if (e.tur === 'ruxsat') return { ikon: '🚦', sarlavha: `${c(e.nom)}${joy}: ✓ o‘tkazdi`, matn: izoh ? `Bu — ${izoh}.` : '', yashil: true }
    if (e.tur === 'bekor') return { ikon: '⛔', sarlavha: `${c(e.nom)}${joy}: to‘xtatdi`, matn: '`false` qaytardi — o‘tish bekor qilindi, sahifa o‘zgarmaydi.', ogoh: true }
    if (e.tur === 'yonaltirdi') return { ikon: '↪️', sarlavha: `${c(e.nom)}${joy}: ${c(e.manzil)} ga yo‘naltirdi`, matn: 'Boshqa manzil qaytardi — eski o‘tish bekor bo‘ladi va yangisi boshlanadi.', ogoh: true }
    return { ikon: '💥', sarlavha: `${c(e.nom)}${joy}: xato`, matn: e.matn, ogoh: true }
  }
  if (e.k === 'nav' && e.faza === 'tugadi') {
    if (!e.ok) return { ikon: '⛔', sarlavha: `O‘tish ${e.sabab}`, kulrang: true }
    const p = e.params?.length ? ` Parametrlar: ${e.params.map(([k, v]) => `${k} = ${v}`).join(', ')}.` : ''
    return { ikon: '📍', sarlavha: `Manzil endi ${c(e.to)}`, matn: `${e.komponent?.length ? `${e.komponent.map(komp).join(' → ')} ko‘rsatiladi.` : ''}${p}`, yashil: true }
  }
  return null
}

function tarmoqQadami(e) {
  if (e.k === 'tarmoq') return e.faza === 'yuborildi'
    ? { ikon: '🌐', sarlavha: `Serverga so‘rov yuborildi: ${c(e.url)}`, matn: 'Javob kelguncha sahifa ishlashda davom etadi.' }
    : { ikon: '📥', sarlavha: `Javob keldi: ${c(e.url)} (${(e.ms / 1000).toFixed(1)} s)` }
  if (e.k !== 'kesh') return null
  const k = c(e.kalit)
  if (e.amal === 'added') return { ikon: '🆕', sarlavha: `Keshda yangi joy ochildi: ${k}`, matn: 'Bu kalit bo‘yicha ma’lumot shu yerda saqlanadi.' }
  if (e.amal === 'fetch') return { ikon: '⏳', sarlavha: `${k} yuklanmoqda` }
  if (e.amal === 'success') return { ikon: '🗄️', sarlavha: `Javob keshga yozildi: ${k}`, matn: 'Endi shu kalitni so‘ragan har bir komponent ma’lumotni keshdan oladi.', yashil: true }
  if (e.amal === 'error') return { ikon: '💥', sarlavha: `${k} yuklanmadi — xato`, ogoh: true }
  if (e.amal === 'invalidate') return { ikon: '♻️', sarlavha: `${k} eskirgan deb belgilandi` }
  if (e.amal === 'observerAdded') return { ikon: '👁️', sarlavha: `Komponent ${k} ni kuzatishni boshladi (jami ${e.kuzatuvchi})` }
  if (e.amal === 'observerRemoved') return { ikon: '🙈', sarlavha: `Komponent ${k} ni kuzatishni to‘xtatdi (qoldi ${e.kuzatuvchi})`, matn: e.kuzatuvchi ? '' : 'Hech kim kuzatmayapti — ma’lumot keshda qoladi va `gcTime` tugagach o‘chiriladi.' }
  if (e.amal === 'removed') return { ikon: '🗑️', sarlavha: `${k} keshdan o‘chirildi`, matn: 'Uzoq vaqt hech kim ishlatmadi (`gcTime` tugadi).' }
  return null
}

function effektQadami(e, unmountlar) {
  const qayer = `${komp(e.komp)} dagi ${c(e.tur)} (${e.qator}-qator)`
  if (e.k === 'cleanup') {
    return { ikon: '🧹', sarlavha: `${qayer} tozalandi (cleanup)`, matn: unmountlar.has(e.komp) ? 'Komponent o‘chirilgani uchun effekt qaytargan tozalash funksiyasi chaqirildi.' : 'Effekt qayta ishlashidan oldin eskisining tozalash funksiyasi chaqiriladi.' }
  }
  let matn
  if (e.birinchi) matn = 'Komponent ekranga chiqqandan keyin birinchi marta.'
  else if (e.depsYoq) matn = 'Bog‘liqliklar ro‘yxati berilmagan — effekt har render’dan keyin ishlaydi.'
  else if (e.ozgargan?.length) matn = `Chunki ${c(e.depsMatn)} ichidagi ${e.ozgargan.map((o) => `${c(o.nom)} o‘zgardi (${q(o.old)} → ${q(o.new)})`).join(', ')}.`
  return { ikon: '⚡', sarlavha: `${qayer} ishladi`, matn, yashil: true }
}

export function hikoya(t, { fw, graf, nodes }) {
  if (!t) return []
  const ev = t.ev
  const out = []
  const otaNomi = new Map((nodes ?? []).map((n) => [n.id, nodes.find((x) => x.id === n.parent)?.name]))

  if (t.b === 1) {
    const m = ev.filter((e) => e.k === 'mount').map((e) => e.name)
    out.push({ ikon: '🚀', sarlavha: 'Ilova ishga tushdi', matn: m.length ? `${m.length} ta komponent yaratildi va ekranga chizildi: ${m.map(komp).join(', ')}.` : '' })
    for (const e of ev) {
      const r = routerQadami(e) ?? tarmoqQadami(e)
      if (r && !(e.k === 'guard' && e.tur === 'ruxsat')) out.push(r)
      if (e.k === 'compute') out.push({ ikon: '🧮', sarlavha: `${c(e.label)} birinchi marta hisoblandi`, qutilar: [e.value] })
      if (e.k === 'effect') out.push(effektQadami(e, new Set()))
    }
    out.push({ ikon: '👉', sarlavha: 'Endi natija oynasida bosing yoki yozing', matn: 'Har bir hodisadan keyin shu yerda nima bo‘lgani qadamma-qadam ko‘rsatiladi.', xulosa: true })
    return out
  }

  const h = harakat(t)
  if (h) out.push(h)

  // 1. router: nazorat punktlari tartib bilan
  for (const e of ev) {
    const r = routerQadami(e)
    if (r) out.push(r)
  }

  // 2. amallar (Pinia action, Zustand action) va $patch
  for (const e of ev) {
    if (e.k === 'action') out.push({ ikon: '🏪', sarlavha: `${c(`${e.store}.${e.name}(${e.args})`)} amali chaqirildi`, matn: 'Amal (action) — ombordagi ma’lumotni o‘zgartiradigan funksiya. Uni istalgan komponent chaqira oladi.' })
    if (e.k === 'zaction') out.push({ ikon: '🏪', sarlavha: `${c(e.store)} omboridagi ${c(`${e.name}(${e.args})`)} chaqirildi`, matn: 'Bu funksiya ichida `set(…)` ombordagi qiymatni yangilaydi.' })
    if (e.k === 'patch') out.push({ ikon: '🧩', sarlavha: `${c(`${e.store}.$patch(…)`)} — bir nechta qiymat birdaniga o‘zgartirildi`, matn: e.payload ?? '' })
  }

  // 3. qiymat o'zgarishlari (bir xil nomlilar bitta zanjirga)
  const setlar = []
  for (const e of ev.filter((x) => x.k === 'set')) {
    const oldi = setlar.find((s) => s.label === e.label)
    if (oldi) oldi.qiymatlar.push(e.new)
    else setlar.push({ label: e.label, setter: e.setter, node: e.node, turi: e.turi, qiymatlar: e.old !== undefined && e.turi !== 'add' ? [e.old, e.new] : [e.new], updater: String(e.new).includes('yangilovchi') })
  }
  for (const s of setlar) {
    if (fw === 'react') {
      const marta = s.qiymatlar.length
      out.push({
        ikon: '📨',
        sarlavha: `${c(`${s.setter ?? 'set'}(…)`)} ${marta > 1 ? `${marta} marta ` : ''}chaqirildi`,
        matn: s.updater ? 'Yangi qiymat o‘rniga funksiya berildi: React uni navbatdagi (eng so‘nggi) qiymat bilan chaqiradi.' : 'React’ga yangi qiymat yuborildi. U darhol emas — hodisa tugagach qayta chizadi.',
        qutilar: s.qiymatlar.map((v) => String(v).replace(' (yangilovchi funksiya)', '')),
      })
    } else {
      const royxat = s.label.endsWith('(ro‘yxat)')
      const asos = s.label.replace(/\[\d+\]$/, '')
      if (s.label === 'route') out.push({ ikon: '📦', sarlavha: 'Joriy manzil (`route`) yangilandi', matn: '`route` — router’ning reaktiv qiymati: manzil, parametrlar, meta.' })
      else if (s.turi === 'add') out.push({ ikon: '📦', sarlavha: `${c(asos)} ro‘yxatiga yangi element qo‘shildi`, qutilar: s.qiymatlar })
      else if (s.turi === 'delete') out.push({ ikon: '📦', sarlavha: `${c(asos)} dan element o‘chirildi` })
      else out.push({
        ikon: '📦',
        sarlavha: royxat ? `${c(s.label.replace(' (ro‘yxat)', ''))} ro‘yxati o‘zgardi` : `${c(s.label)} qiymati o‘zgardi`,
        qutilar: royxat ? null : s.qiymatlar,
      })
      const k = kimlar(graf, s.node)
      if (k.length) out.push({ ikon: '🔔', sarlavha: `Vue eslab qolgan: ${c(s.label.replace(' (ro‘yxat)', ''))} ni kimlar ishlatadi`, matn: 'Render (yoki hisoblash) paytida bu qiymatni o‘qiganlar endi yangilanadi:', chiplar: k })
    }
  }
  for (const e of ev.filter((x) => x.k === 'zset')) {
    for (const o of e.ozgargan) out.push({ ikon: '📦', sarlavha: `Omborda ${c(o.k)} o‘zgardi`, qutilar: [o.old, o.new] })
  }
  const tanlovlar = ev.filter((x) => x.k === 'tanlov')
  if (tanlovlar.length) {
    out.push({
      ikon: '🔍',
      sarlavha: 'Ombor har bir komponentning tanlovini (selector) qayta hisobladi',
      matn: 'Natija avvalgisi bilan bir xil bo‘lsa — komponent chizilmaydi; boshqacha bo‘lsa — chiziladi.',
      tanlovlar: tanlovlar.map((x) => ({ komp: x.komp, matn: x.matn, old: x.old, new: x.new, teng: x.teng })),
    })
  }

  // 4. tarmoq va kesh
  for (const e of ev) {
    const r = tarmoqQadami(e)
    if (r) out.push(r)
  }

  const renders = ev.filter((e) => e.k === 'render')
  const muhim = ['set', 'compute', 'mount', 'action', 'zaction', 'zset', 'nav', 'tarmoq', 'kesh', 'effect', 'cleanup']
  if (!renders.length && !ev.some((e) => muhim.includes(e.k))) {
    out.push({
      ikon: '🤷',
      sarlavha: 'Hech qanday kuzatiladigan qiymat o‘zgarmadi',
      matn: fw === 'vue'
        ? 'Vue faqat reaktiv qiymatlarni (ref, reactive) kuzatadi. Oddiy o‘zgaruvchi o‘zgarsa, Vue buni bilmaydi va hech narsani qayta chizmaydi.'
        : 'React faqat state o‘zgarganda (set funksiyasi chaqirilganda) qayta chizadi. Oddiy o‘zgaruvchining o‘zgarishi ekranga chiqmaydi.',
      ogoh: true,
    })
  }

  // 5. qayta hisoblash va kuzatuvchilar
  for (const e of ev.filter((x) => x.k === 'compute' && !x.birinchi)) {
    out.push(e.ozgardi
      ? { ikon: '🧮', sarlavha: `${c(e.label)} qayta hisoblandi`, qutilar: [e.value] }
      : { ikon: '🧮', sarlavha: `${c(e.label)} qayta hisoblandi — natija o‘sha-o‘sha (${q(e.value)})`, matn: 'Natija o‘zgarmagani uchun uni ishlatadigan komponentlar qayta chizilmaydi.' })
  }
  for (const e of ev.filter((x) => x.k === 'watch')) out.push({ ikon: '👀', sarlavha: `${c(e.label)} qayta ishladi`, matn: 'U o‘qigan qiymat o‘zgargani uchun.' })

  // 6. komponentlar
  const unmountlar = new Set(ev.filter((x) => x.k === 'unmount').map((x) => x.name))
  for (const e of ev.filter((x) => x.k === 'unmount')) out.push({ ikon: '🗑️', sarlavha: `${komp(e.name)} o‘chirildi`, matn: 'Uning ichidagi state ham yo‘qoldi.' })
  for (const e of ev.filter((x) => x.k === 'mount')) out.push({ ikon: '✨', sarlavha: `${komp(e.name)} yangidan yaratildi`, matn: 'State boshlang‘ich qiymatdan boshlanadi.' })
  // bir xil nomli va bir xil sababli render'lar bitta qadam: «<Qator> ×5 qayta chizildi»
  const guruh = []
  for (const e of renders) {
    const sabab = (e.reasons ?? []).filter((r) => !(r.ota && e.reasons.length > 1)).map((r) => nega(r, fw, otaNomi.get(e.id)))
    const kalit = e.name + '|' + sabab.map((x) => x.replace(/\(.*\)/, '')).join(';')
    const g = guruh.find((x) => x.kalit === kalit)
    if (g) g.soni++
    else guruh.push({ kalit, name: e.name, sabab, soni: 1 })
  }
  for (const g of guruh.slice(0, 6)) {
    out.push({ ikon: '🖌️', sarlavha: `${komp(g.name)}${g.soni > 1 ? ` ×${g.soni}` : ''} qayta chizildi`, matn: g.sabab.join('; ') + '.', yashil: true })
  }
  if (guruh.length > 6) out.push({ ikon: '🖌️', sarlavha: `Yana ${guruh.slice(6).reduce((a, g) => a + g.soni, 0)} ta komponent qayta chizildi`, yashil: true })
  for (const e of ev.filter((x) => x.k === 'skip')) {
    out.push({
      ikon: '⏭️',
      sarlavha: `${komp(e.name)} chizilmadi`,
      matn: e.memo ? '`memo` props’ni oldingisi bilan solishtirdi — hammasi bir xil, chizish shart emas.' : 'U ishlatadigan computed qiymati o‘zgarmadi.',
      kulrang: true,
    })
  }
  // tegilmaganlar: ishga tushgan, lekin bu hodisada chizilmagan komponentlar
  if (renders.length && nodes?.length) {
    const tegilgan = new Set(ev.filter((x) => x.k === 'render' || x.k === 'skip' || x.k === 'mount').map((x) => x.id))
    const qolgan = new Map()
    for (const n of nodes) if (!tegilgan.has(n.id)) qolgan.set(n.name, (qolgan.get(n.name) ?? 0) + 1)
    if (qolgan.size) {
      out.push({
        ikon: '😴',
        sarlavha: 'Bu komponentlarga tegilmadi',
        matn: fw === 'vue' ? 'Ular o‘zgargan qiymatni ishlatmaydi va props’i ham o‘zgarmadi.' : 'Ular chizilgan komponentlar ichida emas va ular kuzatadigan ombor qiymati o‘zgarmadi.',
        chiplar: [...qolgan].map(([n, k]) => (k > 1 ? `<${n}> ×${k}` : `<${n}>`)),
        kulrang: true,
      })
    }
  }

  // 7. ekran
  if (t.ekran && (renders.length || ev.some((e) => e.k === 'mount' || e.k === 'unmount') || t.sabab)) {
    if (!t.ekran.length) out.push({ ikon: '🖥️', sarlavha: 'Ekranda hech narsa o‘zgarmadi', kulrang: true })
    else {
      out.push({
        ikon: '🖥️',
        sarlavha: `Ekranda ${t.ekran.length} ta joy yangilandi`,
        matn: 'Natija oynasida sariq ramka bilan belgilandi. Faqat shu joylar o‘zgardi — qolgan sahifa o‘sha-o‘sha.',
        ekran: t.ekran.slice(0, 4),
      })
    }
  }

  // 8. effektlar — ekran yangilangandan keyin, haqiqiy tartibda (avval tozalash, keyin yangi effekt)
  for (const e of ev) if (e.k === 'effect' || e.k === 'cleanup') out.push(effektQadami(e, unmountlar))

  const p = []
  if (setlar.length) p.push(`${ev.filter((x) => x.k === 'set').length} ta o‘zgarish`)
  p.push(`${renders.length} ta komponent chizildi`)
  if (t.ekran) p.push(`${t.ekran.length} ta joy yangilandi`)
  out.push({ ikon: '✅', sarlavha: p.join(' → '), xulosa: true })
  return out
}

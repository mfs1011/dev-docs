// Commit grafi joylashuvi (sof funksiya — Node'da ham sinaladi: trenajor/test/graf.mjs).
// Ustun — commit chuqurligi (ota-onasidan bittaga o'ngda), yo'lak — branch bo'lagi.
// ranglar mavzuga qarab TrenajorPage.vue dagi --lane-N dan olinadi
const COLORS = Array.from({ length: 8 }, (_, i) => `var(--lane-${i})`)
const NEUTRAL = 'var(--text-subtle)'
// branch rangi bir marta beriladi va o'zgarmaydi (yangi branch qo'shilsa ham eski ranglar siljimaydi)
const branchColor = new Map([['refs/heads/main', COLORS[0]], ['refs/heads/master', COLORS[0]]])
// main rangi (0) faqat main/master niki: aylanishda u o'tkazib yuboriladi
const colorOf = (name) => {
  if (!branchColor.has(name)) branchColor.set(name, COLORS[1 + ((branchColor.size - 2) % (COLORS.length - 1))])
  return branchColor.get(name)
}
// bir soniyada yaratilgan branch'lar uchun: sahifada birinchi ko'ringan tartibi
const seen = new Map()
const DX = 104, DY = 104, X0 = 60, Y0 = 92
export function grafLayout(h, diff) {
  if (!h?.repo || !h.commits.length) return null
  const byHash = new Map(h.commits.map((c) => [c.hash, c]))
  // ustun: eng uzun ota-ona zanjiri (eskidan yangiga)
  const col = new Map()
  for (const c of [...h.commits].reverse()) {
    const ps = c.parents.filter((p) => col.has(p))
    col.set(c.hash, ps.length ? Math.max(...ps.map((p) => col.get(p))) + 1 : 0)
  }
  // yo'laklar: avval main/master, keyin branch'lar YARATILGAN tartibida (reflog'ning birinchi yozuvi),
  // so'ng remote, teglar, qolgan (reflog) commit'lar. Commit o'zidan oldin yaratilgan branch yo'lagida turadi:
  // masalan, «yangi»da qilingan commit keyin undan ochilgan «foo» yo'lagiga o'tib ketmaydi.
  const lane = new Map()
  const heads = h.refs.filter((r) => r.name.startsWith('refs/heads/'))
  heads.forEach((r) => seen.has(r.name) || seen.set(r.name, seen.size))
  heads.sort((a, b) => {
    const w = (n) => (/\/(main|master)$/.test(n) ? 0 : 1)
    const t = (n) => h.born?.get(n) ?? Infinity
    return w(a.name) - w(b.name) || t(a.name) - t(b.name) || seen.get(a.name) - seen.get(b.name)
  })
  const tips = [
    ...heads.map((r) => [r.hash, colorOf(r.name)]),
    ...h.refs.filter((r) => r.name.startsWith('refs/remotes/')).map((r) => [r.hash, 'var(--info)']),
    ...h.refs.filter((r) => r.name.startsWith('refs/tags/')).map((r) => [r.hash, NEUTRAL]),
    [h.head.detached, NEUTRAL],
    ...h.commits.map((c) => [c.hash, NEUTRAL]),
  ].filter(([x]) => x)
  // 1) bo'laklar: har uchdan birinchi-ota zanjiri bo'ylab, oldin olingan commit'gacha
  const segs = []
  for (const [tip, color] of tips) {
    const items = []
    let x = tip
    while (x && byHash.has(x) && !lane.has(x) && !items.includes(x)) { items.push(x); x = byHash.get(x).parents[0] }
    if (!items.length) continue
    items.forEach((c) => lane.set(c, null))
    segs.push({ items, color, from: x && byHash.has(x) ? x : null })
  }
  const segOf = new Map()
  segs.forEach((sg) => sg.items.forEach((c) => segOf.set(c, sg)))
  // 2) har bo'lak egallaydigan oraliq (ustunlarda): ajralgan joydan oxirgi commit'gacha,
  //    shu bo'lakdan boshqa yo'lakdagi merge commit'ga boradigan chiziq ham hisobga olinadi
  for (const sg of segs) {
    const cols = sg.items.map((c) => col.get(c))
    sg.a = sg.from ? col.get(sg.from) : Math.min(...cols)
    sg.b = Math.max(...cols)
  }
  // birinchi bo'lak (main) qatori oxirigacha uniki: boshqa branch u tugagan joyda main'ning davomidek ko'rinmasin
  if (segs[0] && !segs[0].from) segs[0].b = Infinity
  for (const c of h.commits) {
    for (const p of c.parents.slice(1)) {
      const sg = segOf.get(p)
      if (sg && segOf.get(c.hash) !== sg) {
        sg.b = Math.max(sg.b, col.get(c.hash))
        ;(sg.outs ??= []).push({ x0: col.get(p), x1: col.get(c.hash), to: c.hash })
      }
    }
  }
  // 3) yo'lak tanlash: ota bo'lak yo'lagiga eng yaqini (+1, −1, +2, −2 …). Shartlar:
  //    yo'lakning o'zi shu oraliqda bo'sh va oradagi yo'laklar ajralish joyida bo'sh — chiziq hech narsani kesmaydi
  // joylash tartibi: bo'laklar daraxti bo'ylab (avval ota, keyin uning bolalari va ularning bolalari).
  // Bitta bo'lakdan ajralganlar orasida KEYINROQ ajralgani birinchi joylanadi — u ota qatorga yaqin turadi,
  // ertaroq ajralganlar tashqariga suriladi: ularning ajralish chizig'i hali hech narsa boshlanmagan joydan o'tadi
  const kids = new Map()
  for (const sg of segs) if (sg.from) { const ps = segOf.get(sg.from); kids.set(ps, [...(kids.get(ps) ?? []), sg]) }
  const order = []
  const visit = (sg) => {
    order.push(sg)
    // bir joydan ajralganlar orasida qisqarog'i (ertaroq tugaydigan / merge bo'ladigani) ichkarida,
    // uzunrog'i uni tashqaridan aylanib o'tadi — oraliqlar ichma-ich joylashadi, chiziqlar kesishmaydi
    const ks = (kids.get(sg) ?? []).map((k, i) => [k, i])
      .sort(([x, i], [y, j]) => y.a - x.a || x.b - y.b || i - j).map(([k]) => k)
    ks.forEach(visit)
  }
  segs.filter((sg) => !sg.from).forEach(visit)
  const busy = new Map() // yo'lak -> [{ a, b, from }, ...]
  // uchlari tegib turishi ham band: bir qatorda biri tugab, ikkinchisi boshlansa — bitta zanjirdek o'qiladi
  const free = (l, a, b) => !(busy.get(l) ?? []).some((r) => a <= r.b && r.a <= b)
  // oradagi qator: ajralish chizig'i u yerni faqat (a, first) oralig'ida kesib o'tadi; shu commit'dan
  // ajralgan aka-uka branch'lar chizig'i bir nuqtadan tarqaladi — bu kesishish emas
  const pass = (l, a, first, sib) => !(busy.get(l) ?? []).some((r) => r.a < first && a < r.b && r.from !== sib)
  const take = (l, a, b, from) => busy.set(l, [...(busy.get(l) ?? []), { a, b, from }])
  const pick = (sg, strict) => {
    const base = sg.from ? lane.get(sg.from) : 0
    const first = Math.min(...sg.items.map((c) => col.get(c)))
    for (let k = 1; k < 60; k++) {
      for (const l of [base + k, base - k]) {
        if (!free(l, sg.a, sg.b)) continue
        if (!strict) return l
        // ajralish chizig'i ota ustunidan birinchi commit ustunigacha oradagi yo'laklardan o'tadi;
        // shu commit'dan ajralgan aka-uka branch'lar chizig'i bir nuqtadan tarqaladi — bu kesishish emas
        const step = l > base ? 1 : -1
        let ok = true
        for (let m = base + step; ok && m !== l; m += step) ok = pass(m, sg.a, first, sg.from)
        // merge chizig'i: joylangan maqsad qatorigacha oradagi qatorlar burilish oralig'ida bo'sh bo'lsin
        for (const o of sg.outs ?? []) {
          const t = lane.get(o.to)
          if (t == null || t === l) continue
          const st = t > l ? 1 : -1
          for (let m = l + st; ok && m !== t; m += st) ok = pass(m, o.x1 - 1, o.x1, null)
        }
        if (ok) return l
      }
    }
    return null
  }
  for (const sg of order) {
    // kesishsiz joy topilmasa — hech bo'lmasa o'zi bo'sh yo'lak (commit'lar ustma-ust tushmaydi)
    const chosen = !sg.from && !busy.size ? 0 : pick(sg, true) ?? pick(sg, false)
    take(chosen, sg.a, sg.b, sg.from)
    sg.items.forEach((c) => lane.set(c, chosen))
    sg.lane = chosen
  }
  const minLane = Math.min(...segs.map((sg) => sg.lane)), maxLane = Math.max(...segs.map((sg) => sg.lane))
  const pos = (hash) => ({ x: X0 + col.get(hash) * DX, y: Y0 + (lane.get(hash) - minLane) * DY })
  const headHash = h.head.ref ? h.refs.find((r) => r.name === h.head.ref)?.hash : h.head.detached
  const nodes = h.commits.map((c) => ({
    ...c, ...pos(c.hash), color: segOf.get(c.hash).color,
    lost: !h.reachable.has(c.hash), isHead: c.hash === headHash, fresh: diff?.newCommits?.has(c.hash),
  }))
  const edges = []
  for (const c of nodes) {
    c.parents.forEach((p, i) => {
      if (!byHash.has(p)) return
      // ajralish (birinchi ota): burilish birinchi oraliqda, keyin bola qatori bo'ylab to'g'ri.
      // merge (ikkinchi ota): qo'shilayotgan branch o'z qatori bo'ylab boradi va oxirgi oraliqda buriladi,
      // chiziq o'sha branch rangida. Hamma yo'l bir xil buyruqlardan iborat — CSS `d` o'tishi silliq ishlaydi.
      const a = pos(p), merge = i > 0
      const x1 = merge ? Math.max(a.x, c.x - DX) : a.x
      const x2 = merge ? c.x : Math.min(c.x, a.x + DX)
      const mx = (x1 + x2) / 2
      const d = `M${a.x},${a.y} L${x1},${a.y} C${mx},${a.y} ${mx},${c.y} ${x2},${c.y} L${c.x},${c.y}`
      edges.push({ key: p + '-' + c.hash, d, color: merge ? segOf.get(p).color : c.color, lost: c.lost || (merge && !h.reachable.has(p)) })
    })
  }
  // yorliqlar: bir commit ustida taxlanadi
  const stack = new Map()
  const labels = []
  // yorliq kengligi qo'shni commit oralig'idan katta bo'lishi mumkin: ustma-ust tushsa bir qavat yuqoriga
  const placed = []
  const add = (key, hash, text, kind, color) => {
    if (!byHash.has(hash)) return
    const p = pos(hash), half = (text.length * 8.2 + 20) / 2
    let i = stack.get(hash) ?? 0
    while (placed.some((r) => r.y === p.y - 40 - i * 26 && r.l < p.x + half + 4 && p.x - half - 4 < r.r)) i++
    stack.set(hash, i + 1)
    placed.push({ y: p.y - 40 - i * 26, l: p.x - half, r: p.x + half })
    labels.push({ key, text, kind, color, x: p.x, y: p.y - 40 - i * 26, moved: diff?.movedRefs?.has(key) })
  }
  if (h.head.detached) add('HEAD', h.head.detached, 'HEAD (detached)', 'head', 'var(--danger)')
  for (const r of heads) {
    const name = r.name.slice(11)
    const attached = h.head.ref === r.name
    add(r.name, r.hash, attached ? `HEAD → ${name}` : name, attached ? 'branch cur' : 'branch', colorOf(r.name))
  }
  // origin/HEAD — faqat «origin'ning asosiy branch'i» belgisi, alohida yorliq kerak emas
  for (const r of h.refs.filter((x) => x.name.startsWith('refs/remotes/') && !x.name.endsWith('/HEAD'))) add(r.name, r.hash, r.name.slice(13), 'remote', 'var(--info)')
  for (const r of h.refs.filter((x) => x.name.startsWith('refs/tags/'))) add(r.name, r.hash, '🏷 ' + r.name.slice(10), 'tag', 'var(--warning)')
  const maxCol = Math.max(...col.values()), lanes = maxLane - minLane + 1
  const maxStack = Math.max(1, ...stack.values())
  return { nodes, edges, labels, w: X0 + maxCol * DX + 150, h: Y0 + (lanes - 1) * DY + 70, top: Math.max(0, maxStack - 2) * 26 }
}

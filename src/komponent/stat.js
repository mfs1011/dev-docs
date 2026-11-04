// Mashq qadamini tekshirish uchun voqealar statistikasi: qadam boshlanganidan (yoki kod qayta
// ishga tushganidan) beri nechta set, render, skip, compute, watch, bosish bo'ldi — jami va to'plam bo'yicha.

const inc = (m, k, n = 1) => m.set(k, (m.get(k) ?? 0) + n)

function sanoq() {
  return {
    set: new Map(), render: new Map(), mount: new Map(), skip: new Map(), unmount: new Map(), compute: new Map(), watch: 0, sabab: new Map(),
    action: new Map(), guard: [], nav: [], effect: new Map(), effectEv: [], cleanup: new Map(), yuborildi: 0, keldi: 0, kesh: new Map(),
  }
}

export function yangiStat() {
  return { ...sanoq(), click: 0, input: 0, log: [], to: new Map(), unmountdanKeyin: [], unmountBoldi: false }
}

export function yoz(st, m) {
  if (m.t === 'dom') {
    if (m.type === 'click') st.click++
    else st.input++
    return
  }
  if (m.t === 'log') {
    st.log.push(m.text)
    if (st.unmountBoldi) st.unmountdanKeyin.push(m.text)
    return
  }
  // 1-to'plam — ilovaning ishga tushishi (birinchi mount'lar), o'quvchi harakati emas
  if (m.t !== 'ev' || m.b === 1) return
  if (!st.to.has(m.b)) st.to.set(m.b, sanoq())
  for (const t of [st, st.to.get(m.b)]) {
    if (m.k === 'set') inc(t.set, m.label)
    if (m.k === 'render') {
      inc(t.render, m.name)
      t.sabab.set(m.name, [...(t.sabab.get(m.name) ?? []), ...(m.reasons ?? [])])
    }
    if (m.k === 'mount') inc(t.mount, m.name)
    if (m.k === 'unmount') inc(t.unmount, m.name)
    if (m.k === 'skip') inc(t.skip, m.name)
    if (m.k === 'compute' && !m.birinchi) inc(t.compute, m.label)
    if (m.k === 'watch') t.watch++
    if (m.k === 'action' || m.k === 'zaction') inc(t.action, m.name)
    if (m.k === 'guard') t.guard.push(m)
    if (m.k === 'nav' && m.faza === 'tugadi') t.nav.push(m)
    if (m.k === 'effect') { inc(t.effect, m.komp); t.effectEv.push(m) }
    if (m.k === 'cleanup') inc(t.cleanup, m.komp)
    if (m.k === 'tarmoq') m.faza === 'yuborildi' ? t.yuborildi++ : t.keldi++
    if (m.k === 'kesh') inc(t.kesh, m.amal)
  }
  if (m.k === 'unmount') st.unmountBoldi = true
}

function yordamchilar(t) {
  return {
    r: (n) => t.render.get(n) ?? 0,
    m: (n) => t.mount.get(n) ?? 0,
    u: (n) => t.unmount.get(n) ?? 0,
    skip: (n) => t.skip.get(n) ?? 0,
    set: (l) => t.set.get(l) ?? 0,
    c: (l) => t.compute.get(l) ?? 0,
    w: () => t.watch,
    sabab: (n) => t.sabab.get(n) ?? [],
    action: (n) => t.action.get(n) ?? 0,
    guard: (nom, tur) => t.guard.filter((g) => g.nom === nom && (!tur || g.tur === tur)).length,
    navOk: (yol) => t.nav.some((n) => n.ok && n.to === yol),
    effect: (k) => t.effect.get(k) ?? 0,
    effektSababi: (k, nom) => t.effectEv.some((e) => e.komp === k && e.ozgargan?.some((o) => o.nom === nom)),
    cleanup: (k) => t.cleanup.get(k) ?? 0,
    tarmoq: () => t.yuborildi,
    keldi: () => t.keldi,
    kesh: (a) => t.kesh.get(a) ?? 0,
    // render sababidagi state qadami: `count: 1 → 2` → 1
    qadam: (n, l) => {
      const x = (t.sabab.get(n) ?? []).find((s) => s.label === l)
      return x ? Number(x.new) - Number(x.old) : NaN
    },
  }
}

// check(s) uchun: jami hisoblar + har to'plam (bitta bosish/harf) alohida
export function korinish(st, kod, doc) {
  return {
    ...yordamchilar(st),
    click: st.click,
    input: st.input,
    log: st.log,
    unmountdanKeyin: st.unmountdanKeyin,
    kod,
    doc,
    batches: [...st.to.values()].map(yordamchilar),
  }
}

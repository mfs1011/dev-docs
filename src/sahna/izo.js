// Izometrik proyeksiya va tugun bloklari ("Sahna" uslubi — loyihaning o'z chizmasi).
// Pol tekisligi: u — darsdagi x (chapdan o'ngga), v — darsdagi y (yuqoridan pastga), z — balandlik.
// Ekranda u yuqori-o'ngga, v past-o'ngga ketadi: chapdan o'ngga oqim diagonal bo'lib ko'rinadi.

export const C = 0.62 // cos 30° × masshtab
export const S = 0.36 // sin 30° × masshtab

/** Pol nuqtasi → ekran */
export const P = (u, v, z = 0) => [(u + v) * C, (v - u) * S - z]
const pt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`
const poly = (...ps) => `M${ps.map(pt).join(' L')}Z`

/** Har tur bloki: o'lcham (w — yarim kenglik polda), balandlik, rang toni */
export const TURLAR = {
  server: { w: 44, h: 75, ton: 'info' },
  lb: { w: 49, h: 52, ton: 'warning' },
  dns: { w: 42, h: 60, ton: 'success' },
  baza: { w: 39, h: 65, ton: 'insight', silindr: true },
  kesh: { w: 39, h: 39, ton: 'success' },
  router: { w: 39, h: 23, ton: 'neytral', antenna: true },
  noutbuk: { w: 52, h: 9, ton: 'neytral', ekran: true },
  foydalanuvchilar: { w: 73, h: 10, ton: 'neytral', odamlar: true },
  navbat: { w: 52, h: 31, ton: 'insight' },
  bulut: { w: 52, h: 26, ton: 'info' },
}

/** Tugun bloki geometriyasi (u, v — pol markazi) */
export function blok(n) {
  const t = { ...(TURLAR[n.ikonka] ?? TURLAR.server), ...(n.ton ? { ton: n.ton } : {}) }
  const { w, h } = t
  const { u, v } = n
  const A = (z) => P(u - w, v - w, z), B = (z) => P(u + w, v - w, z), Cc = (z) => P(u + w, v + w, z), D = (z) => P(u - w, v + w, z)
  const out = { ton: t.ton, h, w, tepa: P(u, v, h), asos: P(u, v, 0), past: D(0) }
  if (t.silindr) {
    const [cx, cy] = P(u, v, 0)
    const rx = w * 1.414 * C, ry = w * 1.414 * S
    out.silindr = { cx, cy, rx, ry, h, tana: `M${cx - rx} ${cy - h} L${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} L${cx + rx} ${cy - h}Z` }
    out.tepa = [cx, cy - h]
    out.halqa = [h * 0.36, h * 0.7]
    return out
  }
  out.chap = poly(A(0), D(0), D(h), A(h))
  out.ong = poly(D(0), Cc(0), Cc(h), D(h))
  out.ust = poly(A(h), B(h), Cc(h), D(h))
  // server: old tomonda tirqishlar
  if (n.ikonka === 'server') {
    out.chiziq = [0.32, 0.62].map((k) => `M${pt(P(u - w * 0.8, v + w, h * k))} L${pt(P(u + w * 0.8, v + w, h * k))}`)
    out.chiroq = [0.32, 0.62].map((k) => P(u - w * 0.65, v + w, h * k + 7))
  }
  if (t.antenna) out.antenna = { dan: P(u + w * 0.5, v - w * 0.5, h), ga: P(u + w * 0.5, v - w * 0.5, h + 30) }
  if (t.ekran) {
    // ekran: orqa qirradan (v - w) ko'tarilgan va biroz orqaga qiyshaygan panel
    const e = (k, z) => P(u - w * 0.85 + 1.7 * w * k, v - w - z * 0.18, h + z)
    out.ekran = poly(e(0, 0), e(1, 0), e(1, 52), e(0, 52))
    out.ekranIchi = poly(e(0.08, 6), e(0.92, 6), e(0.92, 47), e(0.08, 47))
    out.klaviatura = poly(P(u - w * 0.7, v - w * 0.55, h), P(u + w * 0.7, v - w * 0.55, h), P(u + w * 0.7, v + w * 0.15, h), P(u - w * 0.7, v + w * 0.15, h))
    out.tepa = P(u, v - w, h + 56)
  }
  if (t.odamlar) {
    // platformadagi odamchalar (3 × 3), har biri: tana (yumaloq to'rtburchak) + bosh
    const TON = ['info', 'success', 'insight', 'warning']
    out.odamlar = []
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const [x, y] = P(u - w * 0.55 + i * w * 0.55, v - w * 0.55 + j * w * 0.55, h)
      out.odamlar.push({ x, y, ton: TON[(i * 3 + j) % 4] })
    }
    out.odamlar.sort((a, b) => a.y - b.y)
    out.tepa = P(u, v, h + 40)
  }
  if (!t.ekran && !t.odamlar) {
    // ust yuzadagi ikonka: ikonka tekisligi (24×24) ust yuzaga xaritalanadi
    const k = (w * 1.1) / 24
    const [cx, cy] = P(u, v, h)
    out.ikonkaMatritsa = `matrix(${C * k} ${-S * k} ${C * k} ${S * k} ${cx - 24 * C * k} ${cy})`
  }
  return out
}

/** Izometrik pol to'ri uchun pattern o'lchami (g — pol katagi) */
export const TOR = (g) => ({ w: 2 * C * g, h: 2 * S * g, d: `M0 ${S * g} L${C * g} 0 L${2 * C * g} ${S * g} L${C * g} ${2 * S * g}Z` })

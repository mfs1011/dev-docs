// Web asoslari laboratoriyasi: sahifa <-> VM (nginx trenajori tasviri) kanali va curl natijasini o'qish.
// Sahifa ikkinchi serial portga "ID BASE64(sh skript)" qatorini yuboradi; VM'dagi yuritma.sh skriptni bajarib,
// "LAB ID BASE64(chiqish)" qaytaradi. Skript — bitta haqiqiy curl so'rovi (-v: so'rov va javob sarlavhalari,
// -w '%{json}': vaqtlar va hajmlar), tana va cookie fayli.

/** sh uchun bitta argument: 'matn' (ichidagi ' xavfsiz) */
export const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`

const b64 = (matn) => {
  const bayt = new TextEncoder().encode(matn)
  let s = ''
  for (const x of bayt) s += String.fromCharCode(x)
  return btoa(s)
}
const b64oqi = (s) => {
  const x = atob(s)
  const bayt = new Uint8Array(x.length)
  for (let i = 0; i < x.length; i++) bayt[i] = x.charCodeAt(i)
  return new TextDecoder().decode(bayt)
}

export const JAR = '/run/lab-jar'

/**
 * So'rov → sh skript.
 * s: { usul, url, headerlar: [[nom, qiymat]], tana, ergash, cookie, siqish }
 */
export function sorovSkripti(s) {
  const a = ['curl', '-sS', '-v', '-o', '/run/lab-tana', '-w', q('%{json}'), '--max-time', '25']
  const tanali = s.tana != null && s.tana !== '' && !['GET', 'HEAD'].includes(s.usul)
  if (s.usul === 'HEAD') a.push('--head')
  else if (!(s.usul === 'GET' || (s.usul === 'POST' && tanali))) a.push('-X', q(s.usul))
  for (const [k, v] of s.headerlar ?? []) if (k.trim()) a.push('-H', q(`${k.trim()}: ${v}`))
  if (s.ergash) a.push('-L')
  if (s.cookie) a.push('-b', JAR, '-c', JAR)
  if (s.siqish) a.push('--compressed')
  if (tanali) a.push('--data-binary', '@/run/lab-body')
  a.push(q(s.url))
  return [
    'rm -f /run/lab-tana /run/lab-w /run/lab-v',
    tanali ? `printf '%s' ${q(s.tana)} > /run/lab-body` : ':',
    `${a.join(' ')} > /run/lab-w 2> /run/lab-v`,
    'echo "__KOD__ $?"',
    'echo "__V__"; cat /run/lab-v',
    'echo "__W__"; cat /run/lab-w; echo',
    'echo "__TANA__"; head -c 6000 /run/lab-tana 2>/dev/null; echo',
    `echo "__JAR__"; cat ${JAR} 2>/dev/null`,
    '',
  ].join('\n')
}

/** Cookie fayli (Netscape formati) → [{ domen, yol, nom, qiymat, httpOnly, muddat }] */
function jarOqi(matn) {
  const l = []
  for (let qator of matn.split('\n')) {
    let httpOnly = false
    if (qator.startsWith('#HttpOnly_')) { httpOnly = true; qator = qator.slice(10) } else if (qator.startsWith('#') || !qator.trim()) continue
    const u = qator.split('\t')
    if (u.length < 7) continue
    l.push({ domen: u[0], yol: u[2], muddat: Number(u[4]), nom: u[5], qiymat: u[6], httpOnly })
  }
  return l
}

/** curl chiqishi → { kod, hoplar: [{ info, sorov: {qator, headerlar}, javob: {qator, versiya, kod, matn, headerlar} }], w, tana, cookielar } */
export function natijaniOqi(matn) {
  const bolim = (nom, keyingi) => {
    const i = matn.indexOf(`__${nom}__`)
    if (i < 0) return ''
    const boshi = matn.indexOf('\n', i) + 1
    const j = keyingi ? matn.indexOf(`\n__${keyingi}__`, boshi) : -1
    return matn.slice(boshi, j < 0 ? undefined : j)
  }
  const kod = Number(matn.match(/__KOD__ (\d+)/)?.[1] ?? -1)
  const v = bolim('V', 'W')
  let w = {}
  try { w = JSON.parse(bolim('W', 'TANA').trim() || '{}') } catch { /* curl yiqilgan bo'lsa */ }
  const tana = bolim('TANA', 'JAR').replace(/\n$/, '')
  const cookielar = jarOqi(bolim('JAR'))

  const hoplar = []
  let hop = null, info = []
  for (const x of v.split('\n')) {
    const qator = x.replace(/\r$/, '')
    if (qator.startsWith('> ') || qator === '>') {
      const t = qator.slice(2)
      if (!hop || hop.javob.qator) {
        hop = { info, sorov: { qator: t, headerlar: [] }, javob: { qator: '', headerlar: [] } }
        hoplar.push(hop)
        info = []
      } else if (t) {
        const i = t.indexOf(':')
        hop.sorov.headerlar.push([t.slice(0, i), t.slice(i + 1).trim()])
      }
    } else if (qator.startsWith('< ') || qator === '<') {
      if (!hop) continue
      const t = qator.slice(2)
      if (!hop.javob.qator) {
        const m = t.match(/^(HTTP\/[\d.]+) (\d{3}) ?(.*)$/)
        hop.javob = { qator: t, versiya: m?.[1], kod: Number(m?.[2]), matn: m?.[3] ?? '', headerlar: [] }
      } else if (t) {
        const i = t.indexOf(':')
        hop.javob.headerlar.push([t.slice(0, i), t.slice(i + 1).trim()])
      }
    } else if (qator.startsWith('* ')) {
      // ulanish qatorlari keyingi so'rovniki; so'rov yuborilib, javob hali kelmagan bo'lsa — shu so'rovniki
      if (hop && !hop.javob.qator) hop.info.push(qator.slice(2))
      else info.push(qator.slice(2))
    } else if (qator.startsWith('curl: ')) {
      info.push(qator)
    }
  }
  return { kod, hoplar, w, tana, cookielar, xato: kod > 0 ? (v.split('\n').find((x) => x.startsWith('curl: ')) ?? `curl ${kod}`) : '' }
}

/** Sarlavha qiymati (katta-kichik harf farqsiz) */
export const hdr = (headerlar, nom) => headerlar?.find(([k]) => k.toLowerCase() === nom.toLowerCase())?.[1]

/** Kanal: yuborBayt(Uint8Array) — v86 serial_send_bytes(1, ...) */
export function yangiLab(yuborBayt) {
  const kutilmoqda = new Map()
  const tinglovchilar = new Set()
  let id = 0, bufer = ''
  const kanal = {
    tayyor: false,
    bayt(b) {
      if (b !== 10) { bufer += String.fromCharCode(b); return }
      const qator = bufer
      bufer = ''
      const m = qator.match(/^LAB (\S+) ?(.*)$/)
      if (!m) return
      if (m[1] === 'tayyor') { kanal.tayyor = true; tinglovchilar.forEach((f) => f({ t: 'tayyor' })); return }
      const k = kutilmoqda.get(m[1])
      if (!k) return
      kutilmoqda.delete(m[1])
      let matn = ''
      try { matn = b64oqi(m[2]) } catch { /* bo'sh */ }
      k(matn)
    },
    /** Skriptni bajarib, xom chiqishni qaytaradi */
    bajar(skript, kutish = 40000) {
      const bid = String(++id)
      return new Promise((resolve, reject) => {
        kutilmoqda.set(bid, resolve)
        setTimeout(() => { if (kutilmoqda.delete(bid)) reject(new Error(`javob kelmadi (${kutish / 1000} s)`)) }, kutish)
        yuborBayt(new TextEncoder().encode(`${bid} ${b64(skript)}\n`))
      })
    },
    async sorov(s) {
      const t0 = Date.now()
      const n = natijaniOqi(await kanal.bajar(sorovSkripti(s)))
      if (s.usul === 'HEAD') n.tana = ''   // --head bilan curl sarlavhalarni -o fayliga yozadi — HEAD javobida tana yo'q
      return { ...n, sorov: s, vaqt: t0 }
    },
    tingla(f) { tinglovchilar.add(f); return () => tinglovchilar.delete(f) },
  }
  return kanal
}

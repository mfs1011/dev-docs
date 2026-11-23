// Virtual fayl tizimi: host (VPS'dagi /root) va konteynerlar uchun.
// Konteyner fayl tizimi Docker'dagi kabi qatlamli (overlay): pastda image qatlamlari (faqat o'qish, barcha konteynerlar
// uchun umumiy), ustida konteynerning o'z yoziladigan qatlami, eng ustida mount'lar (volume, bind, tmpfs).
// O'chirilgan fayl yuqori qatlamda "whiteout" belgisi bilan yashiriladi — `docker diff` shu ma'lumotdan quriladi.

export class FsXato extends Error {
  constructor(kod, yol) { super(`${kod}: ${yol}`); this.kod = kod; this.yol = yol }
}
const XABAR = { ENOENT: 'No such file or directory', EEXIST: 'File exists', ENOTDIR: 'Not a directory', EISDIR: 'Is a directory', ENOTEMPTY: 'Directory not empty', EROFS: 'Read-only file system', EACCES: 'Permission denied' }
export const xatoMatni = (e) => XABAR[e.kod] ?? e.kod

export function normal(yol) {
  const q = []
  for (const s of yol.split('/')) {
    if (!s || s === '.') continue
    if (s === '..') q.pop(); else q.push(s)
  }
  return '/' + q.join('/')
}
export const yolHal = (cwd, p) => normal(p.startsWith('/') ? p : cwd + '/' + p)
export const ota = (p) => normal(p + '/..')
export const nomi = (p) => p.split('/').filter(Boolean).pop() ?? '/'

const hozir = () => Math.floor(Date.now() / 1000)

// Oddiy daraxt: tugun { k: 'd'|'f'|'l'|'c', m, u, g, s, t, c?, l?, b?: Map }
export function tugun(k, x = {}) {
  const n = { k, m: x.m ?? (k === 'd' ? 0o755 : k === 'l' ? 0o777 : 0o644), u: x.u ?? 0, g: x.g ?? 0, s: x.s ?? (k === 'd' ? 4096 : 0), t: x.t ?? hozir() }
  if (k === 'd') n.b = new Map()
  if (x.c != null) { n.c = x.c; n.s = new TextEncoder().encode(x.c).length }
  if (x.l != null) n.l = x.l
  return n
}

// Katalogdagi `docker export` ro'yxatidan (katalog.py) daraxt
export function daraxtQur(yozuvlar) {
  const ildiz = tugun('d', { t: 0 })
  const hardlar = []
  for (const e of yozuvlar) {
    const qism = e.n.replace(/\/$/, '').split('/').filter(Boolean)
    if (!qism.length) continue
    let d = ildiz
    for (const s of qism.slice(0, -1)) {
      if (!d.b.has(s)) d.b.set(s, tugun('d'))
      d = d.b.get(s)
    }
    const oxir = qism[qism.length - 1]
    const eski = d.b.get(oxir)
    const n = { k: e.k === 'b' || e.k === 'p' ? 'c' : e.k, m: e.m, u: e.u, g: e.g, s: e.s, t: e.t }
    if (e.k === 'd') { n.b = eski?.b ?? new Map(); if (!n.s) n.s = 4096 } // ext4/overlay papka hajmi
    if (e.c != null) n.c = e.c
    if (e.l != null) n.l = e.l
    if (e.k === 'l') n.s = new TextEncoder().encode(e.l).length // ls -l: havola hajmi = manzil uzunligi
    if (e.h != null) hardlar.push([n, e.h])
    d.b.set(oxir, n)
  }
  // hard link'lar: hajm va mazmun asl fayldan, link soni — nomlar soni (busybox: /bin/ls → 406 ta nom)
  const fs = new DaraxtFs(ildiz)
  const soni = new Map()
  for (const [n, manzil] of hardlar) {
    const asl = fs.stat('/' + manzil, false)
    if (!asl) continue
    n.s = asl.s
    if (asl.c != null) n.c = asl.c
    soni.set(asl, (soni.get(asl) ?? 1) + 1)
    n.asl = asl
  }
  for (const [asl, k] of soni) asl.n = k
  for (const [n] of hardlar) if (n.asl) n.n = soni.get(n.asl)
  return ildiz
}

// Daraxt ustidagi oddiy FS (host, volume, tmpfs)
export class DaraxtFs {
  constructor(ildiz = tugun('d'), { faqatOqish = false } = {}) { this.ildiz = ildiz; this.faqatOqish = faqatOqish }
  _top(yol, ergash = true, chuqur = 0) {
    const qism = normal(yol).split('/').filter(Boolean)
    let n = this.ildiz, joriy = '/'
    for (let i = 0; i < qism.length; i++) {
      if (n.k === 'l' ) {
        if (chuqur > 16) throw new FsXato('ELOOP', yol)
        return this._top(normal((n.l.startsWith('/') ? n.l : ota(joriy) + '/' + n.l) + '/' + qism.slice(i).join('/')), ergash, chuqur + 1)
      }
      if (n.k !== 'd') throw new FsXato('ENOTDIR', yol)
      const b = n.b.get(qism[i])
      if (!b) return null
      n = b
      joriy = normal(joriy + '/' + qism[i])
    }
    if (ergash && n.k === 'l') {
      if (chuqur > 16) throw new FsXato('ELOOP', yol)
      return this._top(n.l.startsWith('/') ? n.l : ota(joriy) + '/' + n.l, true, chuqur + 1)
    }
    return n
  }
  stat(yol, ergash = true) { return this._top(yol, ergash) }
  bormi(yol) { try { return !!this._top(yol) } catch { return false } }
  oqi(yol) {
    const n = this._top(yol)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k === 'd') throw new FsXato('EISDIR', yol)
    return n.c ?? ''
  }
  royxat(yol) {
    const n = this._top(yol)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k !== 'd') throw new FsXato('ENOTDIR', yol)
    return [...n.b.keys()].sort()
  }
  _otaTugun(yol) {
    if (this.faqatOqish) throw new FsXato('EROFS', yol)
    const o = this._top(ota(yol))
    if (!o) throw new FsXato('ENOENT', yol)
    if (o.k !== 'd') throw new FsXato('ENOTDIR', yol)
    return o
  }
  yoz(yol, matn, qosh = false) {
    const n = this._top(yol)
    if (n) {
      if (n.k === 'd') throw new FsXato('EISDIR', yol)
      if (this.faqatOqish) throw new FsXato('EROFS', yol)
      n.c = qosh ? (n.c ?? '') + matn : matn
      n.s = new TextEncoder().encode(n.c).length
      n.t = hozir()
      return
    }
    this._otaTugun(yol).b.set(nomi(yol), tugun('f', { c: matn }))
  }
  papka(yol, { ota: otasi = false } = {}) {
    if (otasi) {
      let p = ''
      for (const s of normal(yol).split('/').filter(Boolean)) {
        p += '/' + s
        const n = this._top(p)
        if (n && n.k !== 'd') throw new FsXato('ENOTDIR', p)
        if (!n) this._otaTugun(p).b.set(s, tugun('d'))
      }
      return
    }
    if (this._top(yol, false)) throw new FsXato('EEXIST', yol)
    this._otaTugun(yol).b.set(nomi(yol), tugun('d'))
  }
  ochir(yol, { rekursiv = false } = {}) {
    const n = this._top(yol, false)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k === 'd' && n.b.size && !rekursiv) throw new FsXato('ENOTEMPTY', yol)
    this._otaTugun(yol).b.delete(nomi(yol))
  }
  qoy(yol, n) { this._otaTugun(yol).b.set(nomi(yol), n) }
}

// Konteyner fayl tizimi: mount'lar → yuqori qatlam (o'zgarishlar) → image (past).
// yuqori: Map<yol, tugun | null>  (null — whiteout: pastdagi fayl o'chirilgan)
export class OverlayFs {
  constructor(past, mountlar = []) {
    this.past = new DaraxtFs(past, { faqatOqish: true })
    this.yuqori = new Map()
    this.mountlar = mountlar // [{ yol, fs: DaraxtFs, ro }]
  }
  _mount(yol) {
    const p = normal(yol)
    let eng = null
    for (const m of this.mountlar) if ((p === m.yol || p.startsWith(m.yol + '/')) && (!eng || m.yol.length > eng.yol.length)) eng = m
    if (!eng) return null
    return { m: eng, ichki: normal('/' + p.slice(eng.yol.length)) }
  }
  // havolalarni (symlink) yo'l bo'ylab hal qilish
  _hal(yol, ergash = true, chuqur = 0) {
    const qism = normal(yol).split('/').filter(Boolean)
    let joriy = '/'
    for (let i = 0; i < qism.length; i++) {
      const keyingi = normal(joriy + '/' + qism[i])
      const n = this._oddiy(keyingi)
      if (n && n.k === 'l' && (i < qism.length - 1 || ergash)) {
        if (chuqur > 16) throw new FsXato('ELOOP', yol)
        const manzil = n.l.startsWith('/') ? n.l : joriy + '/' + n.l
        return this._hal(normal(manzil + '/' + qism.slice(i + 1).join('/')), ergash, chuqur + 1)
      }
      if (!n && i < qism.length - 1) return keyingi + '/' + qism.slice(i + 1).join('/')
      if (n && n.k !== 'd' && n.k !== 'l' && i < qism.length - 1) throw new FsXato('ENOTDIR', yol)
      joriy = keyingi
    }
    return joriy
  }
  // havolalarni hal qilmasdan bitta yo'l bo'yicha tugun
  _oddiy(p) {
    if (p === '/' && this.ildizVaqt) { const n = this.past.stat('/', false); return { ...n, t: this.ildizVaqt } }
    const mt = this._mount(p)
    if (mt) return mt.m.fs.stat(mt.ichki, false)
    if (this.yuqori.has(p)) return this.yuqori.get(p)
    // ota-papka o'chirilgan bo'lsa (whiteout) — pastdagi ham yo'q
    for (let o = ota(p); o !== '/'; o = ota(o)) if (this.yuqori.get(o) === null || (this.yuqori.get(o) && this.yuqori.get(o).yangi)) return this.yuqori.get(o) === null ? null : this._yangiIchida(p, o)
    try { return this.past.stat(p, false) } catch { return null }
  }
  _yangiIchida() { return null }
  stat(yol, ergash = true) { return this._oddiy(ergash ? this._hal(yol) : normal(this._hal(ota(yol)) + '/' + nomi(yol))) }
  bormi(yol) { try { return !!this.stat(yol) } catch { return false } }
  oqi(yol) {
    const n = this.stat(yol)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k === 'd') throw new FsXato('EISDIR', yol)
    const mt = this._mount(this._hal(yol))
    if (mt) return mt.m.fs.oqi(mt.ichki)
    return n.c ?? ''
  }
  royxat(yol) {
    const p = this._hal(yol)
    const n = this._oddiy(p)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k !== 'd') throw new FsXato('ENOTDIR', yol)
    const mt = this._mount(p)
    const nomlar = new Set(mt ? mt.m.fs.royxat(mt.ichki) : [])
    if (!mt) {
      const pastN = (() => { try { return this.past.stat(p, false) } catch { return null } })()
      if (pastN?.k === 'd' && !(this.yuqori.get(p)?.yangi)) for (const x of pastN.b.keys()) nomlar.add(x)
      const old = p === '/' ? '/' : p + '/'
      for (const [k, v] of this.yuqori) if (k.startsWith(old) && !k.slice(old.length).includes('/')) { if (v === null) nomlar.delete(nomi(k)); else nomlar.add(nomi(k)) }
      for (const m of this.mountlar) if (ota(m.yol) === p) nomlar.add(nomi(m.yol))
    }
    return [...nomlar].sort()
  }
  _yozish(p) {
    const mt = this._mount(p)
    if (mt) { if (mt.m.ro) throw new FsXato('EROFS', p); return mt }
    return null
  }
  _otaBor(p) {
    const o = this._oddiy(ota(p))
    if (!o) throw new FsXato('ENOENT', p)
    if (o.k !== 'd') throw new FsXato('ENOTDIR', p)
  }
  yoz(yol, matn, qosh = false) {
    const p = this._hal(yol)
    const mt = this._yozish(p)
    if (mt) return mt.m.fs.yoz(mt.ichki, matn, qosh)
    const n = this._oddiy(p)
    if (n?.k === 'd') throw new FsXato('EISDIR', yol)
    this._otaBor(p)
    const yangi = tugun('f', { c: (qosh && n ? n.c ?? '' : '') + matn, m: n?.m, u: n?.u, g: n?.g })
    if (!n) yangi.qoshildi = true
    else if (n.qoshildi) yangi.qoshildi = true
    this.yuqori.set(p, yangi)
  }
  papka(yol, { ota: otasi = false } = {}) {
    const qism = normal(yol).split('/').filter(Boolean)
    let p = ''
    for (let i = 0; i < qism.length; i++) {
      p += '/' + qism[i]
      const oxirgi = i === qism.length - 1
      if (!otasi && !oxirgi) continue
      const mt = this._yozish(p)
      if (mt) { mt.m.fs.papka(mt.ichki, { ota: otasi }); continue }
      const n = this._oddiy(p)
      if (n) { if (oxirgi && !otasi) throw new FsXato('EEXIST', yol); continue }
      this._otaBor(p)
      const d = tugun('d'); d.qoshildi = true; d.yangi = this.yuqori.get(p) === null
      this.yuqori.set(p, d)
    }
  }
  ochir(yol, { rekursiv = false } = {}) {
    const p = this._hal(ota(yol)) + '/' + nomi(yol)
    const q = normal(p)
    const mt = this._yozish(q)
    if (mt) return mt.m.fs.ochir(mt.ichki, { rekursiv })
    const n = this._oddiy(q)
    if (!n) throw new FsXato('ENOENT', yol)
    if (n.k === 'd' && this.royxat(q).length && !rekursiv) throw new FsXato('ENOTEMPTY', yol)
    if (n.k === 'd') for (const k of [...this.yuqori.keys()]) if (k.startsWith(q + '/')) this.yuqori.delete(k)
    const pastda = (() => { try { return !!this.past.stat(q, false) } catch { return false } })()
    if (pastda) this.yuqori.set(q, null); else this.yuqori.delete(q)
  }
  // `docker diff`: A — qo'shilgan, C — o'zgargan, D — o'chirilgan (ota-papkalar C bo'lib chiqadi)
  diff() {
    const natija = new Map()
    for (const [k, v] of this.yuqori) {
      if (v?.tizim) continue // Docker o'zi qo'ygan /etc/hosts, hostname, resolv.conf — diff'da ko'rinmaydi
      natija.set(k, v === null ? 'D' : v.qoshildi ? 'A' : 'C')
      for (let o = ota(k); o !== '/'; o = ota(o)) if (!natija.has(o) && !this.yuqori.get(o)?.qoshildi) natija.set(o, 'C')
    }
    return [...natija].sort(([a], [b]) => (a < b ? -1 : 1))
  }
  // yuqori qatlam hajmi (docker ps -s, system df uchun)
  yuqoriHajm() { let s = 0; for (const v of this.yuqori.values()) if (v && v.k === 'f' && !v.tizim && !v.asos) s += Math.ceil(v.s / 4096) * 4096; return s }
}

// Virtual fayl tizimi (/proc, /sys, /dev): tugunlar funksiya orqali hisoblanadi
export class VirtualFs {
  constructor(ildizAttr, fayllar) { this.ildizAttr = ildizAttr; this.fayllar = fayllar } // fayllar: { '/1/cmdline': () => matn }
  _papkalar() {
    const p = new Set(['/'])
    for (const y of Object.keys(this.fayllar)) { let o = ota(y); while (o !== '/') { p.add(o); o = ota(o) } }
    return p
  }
  stat(yol) {
    const y = normal(yol)
    if (y === '/') return { k: 'd', m: 0o555, u: 0, g: 0, s: 0, t: Math.floor(Date.now() / 1000), b: new Map(), bloksiz: true, ...this.ildizAttr }
    if (this.fayllar[y]) return { k: 'f', m: 0o444, u: 0, g: 0, s: 0, t: Math.floor(Date.now() / 1000), get c() { return '' }, bloksiz: true }
    if (this._papkalar().has(y)) return { k: 'd', m: 0o555, u: 0, g: 0, s: 0, t: Math.floor(Date.now() / 1000), b: new Map(), bloksiz: true }
    return null
  }
  bormi(y) { return !!this.stat(y) }
  oqi(yol) {
    const f = this.fayllar[normal(yol)]
    if (!f) throw new FsXato(this._papkalar().has(normal(yol)) ? 'EISDIR' : 'ENOENT', yol)
    return f()
  }
  royxat(yol) {
    const y = normal(yol)
    const old = y === '/' ? '/' : y + '/'
    const r = new Set()
    for (const k of [...Object.keys(this.fayllar), ...this._papkalar()]) if (k.startsWith(old) && k !== y) r.add(k.slice(old.length).split('/')[0])
    return [...r].sort()
  }
  yoz(yol) { throw new FsXato('EACCES', yol) }
  papka(yol) { throw new FsXato('EACCES', yol) }
  ochir(yol) { throw new FsXato('EACCES', yol) }
}

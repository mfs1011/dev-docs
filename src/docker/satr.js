// Terminal qator muharriri (bash readline'ning kerakli qismi): xterm.js tugmalarini qabul qiladi, qatorni tahrirlaydi,
// Enter'da buyruqni beradi. Buyruq ishlayotganda: Ctrl+C — to'xtatish, konteyner qobig'i qator so'rasa — shu muharrir
// bilan o'qiladi (docker run -it). Prompt'dan keyin OSC 7770 yuboriladi — Terminal.vue xira maslahatni shundan chizadi.
import { toliqmi } from './qobiq/tahlil.js'

const PROMPT_BELGI = '\x1b]7770;\x07'

export class SatrMuharrir {
  constructor(yoz) {
    this.yozXom = yoz          // (matn) => terminalga
    this.buf = ''
    this.pos = 0
    this.tarix = []
    this.tarixI = -1
    this.saqlangan = ''
    this.kutuvchi = null       // { res, prompt, davom }
    this.oldinYozilgan = ''    // buyruq ishlayotganda yozilgan tugmalar (type-ahead)
    this.uzilishF = null       // Ctrl+C
    this.ajralishF = null      // Ctrl+P Ctrl+Q
    this.ctrlP = false
    this.prompt = ''
  }
  yoz(m) { this.yozXom(m.replace(/\r?\n/g, '\r\n')) }

  // qator so'rash: prompt chiqariladi, Enter bosilganda qaytadi. davom — tugallanmagan buyruqni davom ettirish
  oqi(prompt, { tarixga = true, davom = true } = {}) {
    return new Promise((res) => {
      this.prompt = prompt
      this.kutuvchi = { res, prompt, davom, tarixga, toplam: '' }
      this.buf = ''
      this.pos = 0
      this.kur = 0
      this.tarixI = -1
      this.yozXom(prompt + PROMPT_BELGI)
      if (this.oldinYozilgan) { const x = this.oldinYozilgan; this.oldinYozilgan = ''; this.kirish(x) }
    })
  }
  // konteyner qobig'i o'z prompt'ini o'zi chiqargan — faqat qator o'qiymiz
  oqiPromptsiz() {
    return new Promise((res) => {
      this.prompt = ''
      this.kutuvchi = { res, prompt: '', davom: false, tarixga: true, toplam: '', konteyner: true }
      this.buf = ''
      this.pos = 0
      this.kur = 0
      this.tarixI = -1
      this.yozXom(PROMPT_BELGI)
    })
  }

  // xterm onData → bu yerga
  kirish(data) {
    if (data === '\x03') { this.ctrlC(); return }
    if (this.ajralishF) {
      if (data === '\x10') { this.ctrlP = true; return }
      if (data === '\x11' && this.ctrlP) { this.ctrlP = false; const f = this.ajralishF; this.ajralishF = null; f(); return }
      this.ctrlP = false
    }
    if (!this.kutuvchi) {
      // buyruq ishlayapti: tugmalar navbatga (real terminal ham ularni keyingi prompt'ga beradi)
      if (data === '\r') { this.oldinYozilgan += '\r'; this.yoz('\n'); return }
      if (/^[\x20-\x7e -￿]+$/.test(data)) { this.oldinYozilgan += data; this.yozXom(data) }
      return
    }
    let i = 0
    while (i < data.length) {
      const qolgan = data.slice(i)
      const esc = /^\x1b(\[[0-9;]*[A-Za-z~]|O[A-Z])/.exec(qolgan)
      if (esc) { this.maxsus(esc[0]); i += esc[0].length; continue }
      const c = data[i++]
      if (c === '\r' || c === '\n') { this.enter(); if (!this.kutuvchi) { this.oldinYozilgan += data.slice(i); return } continue }
      if (c === '\x7f' || c === '\b') { this.ochir(); continue }
      if (c === '\x01') { this.kursor(0); continue }
      if (c === '\x05') { this.kursor(this.buf.length); continue }
      if (c === '\x15') { this.buf = this.buf.slice(this.pos); this.pos = 0; this.chiz(); continue }
      if (c === '\x0b') { this.buf = this.buf.slice(0, this.pos); this.chiz(); continue }
      if (c === '\x17') { const b = this.buf.slice(0, this.pos).replace(/\S+\s*$/, ''); this.buf = b + this.buf.slice(this.pos); this.pos = b.length; this.chiz(); continue }
      if (c === '\x0c') { this.yozXom('\x1b[H\x1b[2J' + this.kutuvchi.prompt + PROMPT_BELGI); this.chiz(true); continue }
      if (c === '\x04') { if (!this.buf) this.eof(); continue }
      if (c === '\t') continue
      if (c < ' ') continue
      this.qosh(c)
    }
  }

  // this.kur — terminaldagi kursor prompt oxiridan qancha o'ngda (har amaldan keyin = this.pos)
  qosh(m) {
    this.buf = this.buf.slice(0, this.pos) + m + this.buf.slice(this.pos)
    this.pos += m.length
    if (this.pos === this.buf.length) { this.yozXom(m); this.kur = this.pos } else this.chiz()
  }
  ochir() {
    if (!this.pos) return
    this.buf = this.buf.slice(0, this.pos - 1) + this.buf.slice(this.pos)
    this.pos--
    if (this.pos === this.buf.length) { this.yozXom('\b \b'); this.kur = this.pos } else this.chiz()
  }
  kursor(p) {
    this.pos = Math.max(0, Math.min(this.buf.length, p))
    const d = this.pos - (this.kur ?? 0)
    if (d > 0) this.yozXom(`\x1b[${d}C`)
    if (d < 0) this.yozXom(`\x1b[${-d}D`)
    this.kur = this.pos
  }
  // joriy qatorni qayta chizish
  chiz(tozalangan = false) {
    let s = ''
    if (!tozalangan && this.kur) s += `\x1b[${this.kur}D`
    s += '\x1b[K' + this.buf
    const ort = this.buf.length - this.pos
    if (ort) s += `\x1b[${ort}D`
    this.yozXom(s)
    this.kur = this.pos
  }
  maxsus(e) {
    if (e === '\x1b[D' || e === '\x1bOD') return this.kursor(this.pos - 1)
    if (e === '\x1b[C' || e === '\x1bOC') return this.kursor(this.pos + 1)
    if (e === '\x1b[H' || e === '\x1bOH' || e === '\x1b[1~') return this.kursor(0)
    if (e === '\x1b[F' || e === '\x1bOF' || e === '\x1b[4~') return this.kursor(this.buf.length)
    if (e === '\x1b[3~') { if (this.pos < this.buf.length) { this.buf = this.buf.slice(0, this.pos) + this.buf.slice(this.pos + 1); this.chiz() } return }
    if (e === '\x1b[A' || e === '\x1b[B') {
      if (!this.tarix.length) return
      if (this.tarixI === -1) this.saqlangan = this.buf
      let i = this.tarixI === -1 ? this.tarix.length : this.tarixI
      i += e === '\x1b[A' ? -1 : 1
      if (i < 0) i = 0
      let yangi
      if (i >= this.tarix.length) { this.tarixI = -1; yangi = this.saqlangan } else { this.tarixI = i; yangi = this.tarix[i] }
      this.buf = yangi.split('\n').pop()
      this.pos = this.buf.length
      this.chiz()
    }
  }
  enter() {
    const k = this.kutuvchi
    this.yozXom('\r\n')
    const toplam = k.toplam ? k.toplam + '\n' + this.buf : this.buf
    if (k.davom && toplam.trim() && !toliqmi(toplam)) {
      k.toplam = toplam
      this.buf = ''
      this.pos = 0
      this.kur = 0
      k.prompt = '> '
      this.yozXom('> ' + PROMPT_BELGI)
      return
    }
    this.kutuvchi = null
    this.kur = 0
    if (k.tarixga && toplam.trim() && this.tarix[this.tarix.length - 1] !== toplam) this.tarix.push(toplam)
    k.res(toplam)
  }
  eof() {
    const k = this.kutuvchi
    if (!k?.konteyner) return
    this.kutuvchi = null
    k.res(null)
  }
  ctrlC() {
    if (this.kutuvchi) {
      // qatorni bekor qilish (bash: ^C va yangi prompt)
      const k = this.kutuvchi
      this.yozXom('^C\r\n')
      this.buf = ''
      this.pos = 0
      this.kur = 0
      k.toplam = ''
      if (k.konteyner) { this.kutuvchi = null; k.res(''); return }
      k.prompt = this.prompt
      this.yozXom(this.prompt + PROMPT_BELGI)
      return
    }
    this.yozXom('^C')
    this.uzilishF?.()
  }
}

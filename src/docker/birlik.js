// Docker CLI'dagi birliklar — github.com/docker/go-units (HumanSize, HumanDuration) va vaqt formatlari.

const BIRLIK = ['B', 'kB', 'MB', 'GB', 'TB', 'PB']
// Go %.{p}g: p ta muhim raqam, oxiridagi nollarsiz
const g = (x, p) => String(Number(x.toPrecision(p)))

// units.HumanSizeWithPrecision(size, p): 1000 lik birliklar. docker image ls, ps -s — p=3; system df, prune — p=4
export function hajm(bayt, p = 4) {
  let i = 0, x = bayt
  while (x >= 1000 && i < BIRLIK.length - 1) { x /= 1000; i++ }
  return g(x, p) + BIRLIK[i]
}

// units.HumanDuration
export function davomiylik(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 1) return 'Less than a second'
  if (s === 1) return '1 second'
  if (s < 60) return `${s} seconds`
  const m = Math.floor(s / 60)
  if (m === 1) return 'About a minute'
  if (m < 60) return `${m} minutes`
  const h = Math.floor(s / 3600 + 0.5)
  if (h === 1) return 'About an hour'
  if (h < 48) return `${h} hours`
  if (h < 24 * 7 * 2) return `${Math.floor(h / 24)} days`
  if (h < 24 * 30 * 2) return `${Math.floor(h / 24 / 7)} weeks`
  if (h < 24 * 365 * 2) return `${Math.floor(h / 24 / 30)} months`
  return `${Math.floor(s / 3600 / 24 / 365)} years`
}

const ikki = (n) => String(n).padStart(2, '0')
// Go RFC3339Nano: 2026-11-23T04:57:09.199652068Z (nanosoniya — oxiridagi nollar tashlanadi)
export function rfc3339(ms, nano = null) {
  const d = new Date(ms)
  const asosiy = `${d.getUTCFullYear()}-${ikki(d.getUTCMonth() + 1)}-${ikki(d.getUTCDate())}T${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())}`
  const n = nano ?? String(d.getUTCMilliseconds()).padStart(3, '0') + String(Math.floor(Math.random() * 1e6)).padStart(6, '0')
  const kasr = n.replace(/0+$/, '')
  return asosiy + (kasr ? '.' + kasr : '') + 'Z'
}
export const rfc3339s = (ms) => rfc3339(ms, '0') // soniyagacha: 2026-11-23T04:52:13Z
// "2026-11-23 04:57:09 +0000 UTC" (ps/images --format json CreatedAt)
export function goVaqt(ms) {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${ikki(d.getUTCMonth() + 1)}-${ikki(d.getUTCDate())} ${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())} +0000 UTC`
}
// nginx: 2026/11/23 04:50:29 va [23/Nov/2026:04:51:40 +0000]
const OY = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const KUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export function nginxVaqt(ms) {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}/${ikki(d.getUTCMonth() + 1)}/${ikki(d.getUTCDate())} ${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())}`
}
export function accessVaqt(ms) {
  const d = new Date(ms)
  return `${ikki(d.getUTCDate())}/${OY[d.getUTCMonth()]}/${d.getUTCFullYear()}:${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())} +0000`
}
// HTTP Date: Mon, 23 Nov 2026 04:51:40 GMT
export function httpVaqt(ms) {
  const d = new Date(ms)
  return `${KUN[d.getUTCDay()]}, ${ikki(d.getUTCDate())} ${OY[d.getUTCMonth()]} ${d.getUTCFullYear()} ${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())} GMT`
}
// busybox `date`: Mon Nov 23 04:50:29 UTC 2026;  ls -l: "Nov 23 04:52" (6 oydan eski bo'lsa "Apr  7  2026")
export function busyboxDate(ms) {
  const d = new Date(ms)
  return `${KUN[d.getUTCDay()]} ${OY[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${ikki(d.getUTCHours())}:${ikki(d.getUTCMinutes())}:${ikki(d.getUTCSeconds())} UTC ${d.getUTCFullYear()}`
}
export function lsVaqt(soniya, hozir = Date.now()) {
  const d = new Date(soniya * 1000)
  const yarimYil = 182.5 * 24 * 3600 * 1000
  const eski = Math.abs(hozir - d.getTime()) > yarimYil
  return `${OY[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${eski ? ' ' + d.getUTCFullYear() : ikki(d.getUTCHours()) + ':' + ikki(d.getUTCMinutes())}`
}

export const hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(Math.ceil(n / 2))), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, n)
export const mac = () => {
  const b = crypto.getRandomValues(new Uint8Array(6))
  b[0] = (b[0] & 0xfe) | 0x02 // mahalliy (locally administered), unicast
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(':')
}

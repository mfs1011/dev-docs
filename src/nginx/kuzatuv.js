// Nginx trenajori: VM'dagi nginx-kuzatuv (ttyS1) yuboradigan qatorlarni so'rovlarga yig'adi.
// Ikki manba bor, ikkalasi ham nginx'ning o'zidan:
//   debug log ("*12 test location: ...") — nginx qaysi location'larni sinagani va qaysi birini tanlagani, kesh, upstream;
//   trenajor access log (JSON, conf.d/trenajor-kuzatuv.conf) — server_name, status, upstream, kesh holati.
// Ularni ulanish raqami bog'laydi: debug'dagi *N = access log'dagi $connection.

const DEBUG = /^\*(\d+) (.*)$/
/** mashq tekshiruvlari shu User-Agent bilan so'raydi (mashqlar.js) */
export const TEKSHIRUV_UA = 'trenajor-tekshiruv'

/** Yangi bo'sh holat */
export function yangiKuzatuv() {
  return { sorovlar: [], ochiq: new Map(), keyingiId: 1 }
}

function yangiSorov(k, c, qator) {
  const m = qator.match(/^"(\S+) (\S+) ([^"]+)"$/)
  const s = {
    id: k.keyingiId++,
    c,
    usul: m?.[1] ?? '',
    yol: m?.[2] ?? qator,
    // har "using configuration" — bitta tanlov bosqichi; ichki yo'naltirish (try_files, error_page) yangisini ochadi
    bosqichlar: [{ sinalgan: [], tanlangan: null }],
    kesh: null, // 'yoq' | 'bor' | null — debug'dagi "http upstream cache"
    ulanishlar: [], // upstream manzillari, tartib bilan (next upstream bo'lsa — bir nechta)
    xatolar: [],
    cheklandi: false,
    kechiktirildi: false,
    tugadi: false,
    tekshiruv: false,
    log: null, // access log JSON
  }
  k.sorovlar.push(s)
  if (k.sorovlar.length > 200) k.sorovlar.shift()
  k.ochiq.set(c, s)
  return s
}

/** Bitta qatorni qo'shadi. Qaytaradi: o'zgargan so'rov (yoki null) */
export function qatorQosh(k, qator) {
  qator = qator.replace(/\r$/, '')
  if (qator.startsWith('{"c"')) {
    let j
    try { j = JSON.parse(qator) } catch { return null }
    // shu ulanishdagi log'i hali yo'q eng so'nggi so'rov
    const s = [...k.sorovlar].reverse().find((x) => x.c === j.c && !x.log)
    if (!s) return null
    s.log = j
    s.tugadi = true
    // $upstream_addr har so'rovda bor (debug'dagi "connect to" esa har ulanishda chiqmaydi): "a, b" — bitta guruh ichida
    // keyingi serverga o'tilgan (proxy_next_upstream), "a : b" — ichki yo'naltirishdan keyin boshqa guruh
    if (j.upstream) s.ulanishlar = j.upstream.split(/, | : /)
    if (j.kesh) s.kesh = ['HIT', 'STALE', 'UPDATING', 'REVALIDATED'].includes(j.kesh) ? 'bor' : 'yoq'
    return s
  }
  const m = qator.match(DEBUG)
  if (!m) return null
  const [, c, matn] = m
  if (matn.startsWith('http request line: ')) return yangiSorov(k, c, matn.slice(19))
  const s = k.ochiq.get(c)
  if (!s) return null
  const b = s.bosqichlar[s.bosqichlar.length - 1]
  let t
  // mashq tekshiruvlari (check) `curl -A trenajor-tekshiruv` bilan so'raydi — ular sxemada ko'rsatilmaydi
  if ((t = matn.match(/^http header: "User-Agent: (.*)"$/))) {
    if (t[1] === TEKSHIRUV_UA) s.tekshiruv = true
    return s
  }
  if ((t = matn.match(/^test location: (~\*? )?"(.*)"$/))) {
    const bosq = b.tanlangan ? (s.bosqichlar.push({ sinalgan: [], tanlangan: null }), s.bosqichlar[s.bosqichlar.length - 1]) : b
    // debug "~" ni ~ uchun ham, ~* uchun ham yozadi; predikat location (1.31.5) nomi $ bilan boshlanadi
    bosq.sinalgan.push({ nom: t[2], regex: Boolean(t[1]), predikat: !t[1] && t[2].startsWith('$') })
  } else if ((t = matn.match(/^using configuration "(.*)"$/))) {
    const bosq = b.tanlangan ? (s.bosqichlar.push({ sinalgan: [], tanlangan: null }), s.bosqichlar[s.bosqichlar.length - 1]) : b
    bosq.tanlangan = t[1]
  } else if ((t = matn.match(/^http upstream cache: (-?\d+)/))) {
    s.kesh = t[1] === '0' ? 'bor' : 'yoq'
  } else if ((t = matn.match(/^connect to ([^,]+),/))) {
    s.ulanishlar.push(t[1])
  } else if (matn.startsWith('limiting requests')) {
    s.cheklandi = true
  } else if (matn.startsWith('delaying request')) {
    s.kechiktirildi = true
  } else if (/^(upstream timed out|connect\(\) failed)/.test(matn)) {
    s.xatolar.push(matn.replace(/, client: .*$/, ''))
  } else {
    return null
  }
  return s
}

/**
 * "test location" qatorlaridagi prefiks nomlar nginx ichki daraxtidagi qoldiq ko'rinishda keladi: nginx mos tugunga
 * kirganda URI'ning shu qismini "yeydi" va keyingi tugunlar faqat qolgan qism bilan solishtiriladi
 * (ngx_http_core_find_static_location). Masalan, URI /50x.html: avval "/" sinaladi va mos keladi, keyin uning
 * ichidagi "50x.html". Shu yo'l bilan to'liq nomni tiklaymiz: "/" + "50x.html" = "/50x.html".
 * Regex nomlari to'liq keladi. uri — normallashtirilgan URI (argumentlarsiz).
 */
export function toliqNomlar(bosqich, uri) {
  let asos = ''
  return bosqich.sinalgan.map((x) => {
    if (x.regex || x.predikat) return { ...x, toliq: x.nom }
    const toliq = asos + x.nom
    // tugun URI'ning qolgan qismi bilan boshlansa va undan qisqa bo'lsa — nginx shu tugun ichiga kiradi
    if (uri.startsWith(toliq) && uri.length > toliq.length) asos = toliq
    return { ...x, toliq }
  })
}

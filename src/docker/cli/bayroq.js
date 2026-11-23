// Docker CLI bayroqlari (flags) tahlili — cobra/pflag qoidalari bo'yicha:
//   -it  (qisqa bayroqlar birga), -p8080:80, -p 8080:80, --name=x, --name x, --rm, --  (oxiri)
//   `run`/`exec`/`create` da birinchi pozitsion argumentdan keyingisi — konteyner buyrug'i (interspersed=false).
// Xato matnlari docker 29.9.3 dan: "unknown flag: --foo", "unknown shorthand flag: 'z' in -z",
// "flag needs an argument: --name", "flag needs an argument: 'e' in -e".

export class BayroqXato extends Error {}

// spek: { nom: { q: 'qisqa', tur: 'bool'|'str'|'list'|'int', std } }
export function bayroqlar(argv, spek, { interspersed = true } = {}) {
  const qisqa = {}
  for (const [nom, s] of Object.entries(spek)) if (s.q) qisqa[s.q] = nom
  const f = {}
  for (const [nom, s] of Object.entries(spek)) f[nom] = s.tur === 'list' ? [] : s.tur === 'bool' ? false : s.std ?? null
  const pos = []
  const ber = (nom, v) => {
    const s = spek[nom]
    if (s.tur === 'list') f[nom].push(v)
    else if (s.tur === 'int') {
      if (!/^-?\d+$/.test(v)) throw new BayroqXato(`invalid argument "${v}" for "${s.q ? '-' + s.q + ', ' : ''}--${nom}" flag: strconv.ParseInt: parsing "${v}": invalid syntax`)
      f[nom] = Number(v)
    } else f[nom] = v
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (pos.length && !interspersed) { pos.push(...argv.slice(i)); break }
    if (a === '--') { pos.push(...argv.slice(i + 1)); break }
    if (a.startsWith('--') && a.length > 2) {
      const [nom, ...qol] = a.slice(2).split('=')
      const s = spek[nom]
      if (!s) throw new BayroqXato(`unknown flag: --${nom}`)
      if (s.tur === 'bool') { f[nom] = qol.length ? qol.join('=') !== 'false' : true; continue }
      if (qol.length) { ber(nom, qol.join('=')); continue }
      if (i + 1 >= argv.length) throw new BayroqXato(`flag needs an argument: --${nom}`)
      ber(nom, argv[++i]); continue
    }
    if (a.startsWith('-') && a.length > 1) {
      for (let j = 1; j < a.length; j++) {
        const c = a[j]
        const nom = qisqa[c]
        if (!nom) throw new BayroqXato(`unknown shorthand flag: '${c}' in ${a}`)
        const s = spek[nom]
        if (s.tur === 'bool') { f[nom] = true; continue }
        let v = a.slice(j + 1)
        if (v.startsWith('=')) v = v.slice(1)
        if (!v) {
          if (i + 1 >= argv.length) throw new BayroqXato(`flag needs an argument: '${c}' in -${c}`)
          v = argv[++i]
        }
        ber(nom, v)
        break
      }
      continue
    }
    pos.push(a)
  }
  return { f, pos }
}

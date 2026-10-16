// Ovoz va animatsiya sinxroni: gap/so'z -> video vaqti (voice/timing.js dagi TM dan).
//   SY.L('L17')            -> { s, e }   gap boshlanishi va tugashi
//   SY.W('L17', 'order')   -> so'z boshlanishi (aytilgan shakl bo'yicha, prefiks; n — nechanchi uchrashi)
// Topilmagan so'z — gap boshi qaytadi va SY.missing ga yoziladi (stills.mjs xato sifatida ko'rsatadi).
(function (g) {
  const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '');
  const missing = [];
  const L = (id) => {
    const line = g.TM.lines[id];
    if (!line) { missing.push(id); return { s: 0, e: 0 }; }
    return line;
  };
  const W = (id, prefix, n = 0) => {
    const line = L(id), p = norm(prefix);
    const hits = (line.words ?? []).filter((w) => norm(w.w).startsWith(p));
    if (!hits[n]) { missing.push(`${id}:${prefix}#${n}`); return line.s; }
    return hits[n].s;
  };
  const WE = (id, prefix, n = 0) => {
    const line = L(id), p = norm(prefix);
    const hits = (line.words ?? []).filter((w) => norm(w.w).startsWith(p));
    return hits[n] ? hits[n].e : line.e;
  };
  const scene = (name) => g.TM.scenes[name];
  g.SY = { L, W, WE, scene, missing };
})(typeof window !== 'undefined' ? window : globalThis);

// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'may'], ['L1', 'es-kyu-layt'], ['L1', 'oltita'],
   ['L2', 'char'], ['L2', 'varchar'],
   ['L3', 'oltmish'], ['L3', 'xatolik'],
   ['L4', 'tekst'], ['L4', 'difolt'],
   ['L5', 'kollation'], ['L5', 'teng'],
   ['L6', 'qat‘iy'], ['L6', 'e’tiborsiz'],
   ['L7', 'o‘n'], ['L7', 'milliard'],
   ['L8', 'nol'], ['L8', 'taqiqlangan'],
   ['L9', 'uchala'], ['L9', 'postgres'],
   ['L10', 'qat‘iy'], ['L10', 'kesib'],
   ['L11', 'chek'],
   ['L12', 'oltita'],
   ['L13', 'birinchi'], ['L14', 'ikkinchi'],
   ['L15', 'uchinchi'], ['L16', 'to‘rtinchi'],
   ['L17', 'beshinchi'], ['L18', 'oltinchi'],
   ['L19', 'to‘liq'], ['L19', 'sana']
  ].forEach(([l, w]) => {
    const t = W(l, w);
    if (t) add(t, 'pop');
  });

  const wL3 = W('L3', 'xatolik'); if (wL3) add(wL3, 'strike');
  const wL4 = W('L4', 'difolt'); if (wL4) add(wL4, 'strike');
  const wL7 = W('L7', 'milliard'); if (wL7) add(wL7, 'ding');
  const wL8 = W('L8', 'taqiqlangan'); if (wL8) add(wL8, 'strike');
  const wL10 = W('L10', 'kesib'); if (wL10) add(wL10, 'strike');
  const wL11 = W('L11', 'chek'); if (wL11) add(wL11, 'ding');
  const wL12 = W('L12', 'oltita'); if (wL12) add(wL12, 'strike');
  const wL19 = W('L19', 'to‘liq'); if (wL19) add(wL19, 'swell');
  add(L('L19').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

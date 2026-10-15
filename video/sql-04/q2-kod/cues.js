// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'postgres'], ['L1', 'pi-es-kyu-el'], ['L2', 'mahsulot'],
   ['L3', 'qo‘shtirnoq'], ['L4', 'ikkita'], ['L5', 'di-ti'],
   ['L6', 'order'], ['L7', 'muvaffaqiyatli'], ['L8', 'oltmish'],
   ['L9', 'tutuq'], ['L10', 'escape'], ['L11', 'dollar'], ['L12', 'birlashtiradi'],
   ['L13', 'millionni'], ['L14', 'pi-ji'], ['L14', 'intijer'], ['L14', 'big-int'], ['L14', 'nyumerik'],
   ['L16', 'besh'], ['L17', 'olti'], ['L18', 'ichma-ich'], ['L19', 'oltmish'],
   ['L21', 'may'], ['L21', 'es-kyu-layt']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L3', 'xato'), 'strike');
  add(W('L6', 'xato'), 'strike');
  add(W('L8', 'ogohlantirish'), 'ding');
  add(W('L16', 'tuzog‘i'), 'strike');
  add(W('L17', 'haqiqiy'), 'ding');
  add(W('L20', 'nozik'), 'swell');
  add(L('L21').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

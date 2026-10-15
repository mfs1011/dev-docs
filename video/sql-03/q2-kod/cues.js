// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'pi-es-kyu-el'], ['L1', 'may'], ['L1', 'es-kyu-layt'],
   ['L2', 'host'], ['L2', 'port'], ['L2', 'bitta'],
   ['L3', 'yu-ar-ay'], ['L3', 'applikeyshn'],
   ['L4', 'nuqta'], ['L4', 'ch-mod'],
   ['L5', 'meta-buyruq'], ['L6', 'de-te'], ['L6', 'iks'],
   ['L7', 'superuser'],
   ['L8', 'katta'], ['L8', 'kichik'],
   ['L9', 'option'], ['L9', 'ch-mod'],
   ['L10', 'status'], ['L10', 'yuniks'],
   ['L11', 'minus-minus'],
   ['L12', 'xotiradagi'],
   ['L13', 'teyblz'], ['L13', 'skima'], ['L13', 'boks'],
   ['L14', 'nuqtali'], ['L14', 'uch'],
   ['L16', 'keyingi'], ['L16', 'oltita']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L4', 'parolni'), 'strike');
  add(W('L4', 'ch-mod'), 'ding');
  add(W('L9', 'xavfli'), 'strike');
  add(W('L11', 'minus-minus'), 'ding');
  add(W('L12', 'xotiradagi'), 'strike');
  add(W('L15', 'uchala'), 'swell');
  add(L('L16').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

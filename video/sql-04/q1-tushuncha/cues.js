// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['L1', 'es-kyu-el'], ['L1', 'to‘rtinchi'], ['L2', 'buyruqlar'], ['L2', 'nuqtali'],
   ['L3', 'tokenlardan'], ['L3', 'kalit'], ['L3', 'identifikatorlar'], ['L3', 'literallar'],
   ['L4', 'izohlar'], ['L5', 'kalit'], ['L5', 'se-lekt'], ['L6', 'identifikator'],
   ['L7', 'standartida'], ['L7', 'postgres'], ['L8', 'kichik'],
   ['L9', 'qo‘shtirnoq'], ['L10', 'order'], ['L11', 'sezgir'], ['L12', 'oltmish'],
   ['L13', 'satr'], ['L14', 'escape'], ['L15', 'dollar'], ['L16', 'sonlarda'],
   ['L17', 'operatorlarning'], ['L18', 'taqqoslash'], ['L19', 'darajaga'],
   ['L21', 'keyingi'], ['L21', 'postgres']
  ].forEach(([l, w]) => add(W(l, w), 'pop'));

  add(W('L4', 'muhim'), 'strike');
  add(W('L7', 'buzib'), 'strike');
  add(W('L11', 'eng'), 'ding');
  add(W('L19', 'diqqat'), 'strike');
  add(W('L20', 'xulosa'), 'swell');
  add(L('L21').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

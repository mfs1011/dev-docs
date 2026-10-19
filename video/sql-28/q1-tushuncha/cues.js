// Ovoz effektlari (anim.js bilan bir xil so'z bog'lanishlari)
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.3, 'scribble'));

  // So'z bog'lanishlari
  [['intro', 'Es-kyu-el'], ['intro', 'Joyn'], ['intro', 'ustma-ust'],
   ['uch_amal', 'yunion'], ['uch_amal', 'intersekt'], ['uch_amal', 'eksept'],
   ['takrorlar', 'Sukut'], ['takrorlar', 'oll'],
   ['null_takror', 'null'],
   ['moslik', 'mos'], ['moslik', 'birinchi'],
   ['ustuvorlik', 'ustuvorlikka'], ['ustuvorlik', 'intersekt'],
   ['order_limit', 'order'], ['order_limit', 'limit']
  ].forEach(([l, w]) => {
    try {
      const t = W(l, w);
      if (typeof t === 'number' && !isNaN(t)) add(t, 'pop');
    } catch (e) {}
  });

  try { add(W('uch_amal', 'yunion'), 'ding'); } catch (e) {}
  try { add(W('uch_amal', 'intersekt'), 'ding'); } catch (e) {}
  try { add(W('uch_amal', 'eksept'), 'ding'); } catch (e) {}
  try { add(W('takrorlar', 'oll'), 'ding'); } catch (e) {}
  try { add(W('null_takror', 'null'), 'strike'); } catch (e) {}
  try { add(W('ustuvorlik', 'intersekt'), 'ding'); } catch (e) {}
  add(L('order_limit').e + 0.3, 'swell');

  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

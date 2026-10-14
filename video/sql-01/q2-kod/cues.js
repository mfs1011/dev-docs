// Ovoz effektlari: terminal yozuvi (anim.js dagi buyruqlar va vaqtlar bilan bir xil), jadval harakatlari
(function (g) {
  const { L, W } = g.SY, TM = g.TM, NR = g.NR;
  const cues = [], add = (t, type) => cues.push({ t, type });
  const cmdOf = (start) => g.TTY.pg.split('\n').find((l) => l.startsWith('qollanma=# ' + start));
  const type = (cmd, t0) => { const d = Math.min(2.4, 0.4 + cmd.length * 0.03); for (let t = 0; t < d; t += 0.07) add(t0 + t, 'tick'); add(t0 + d + 0.15, 'pop'); return t0 + d + 0.15; };
  add(0.3, 'swell');
  NR.scenes.slice(1).forEach((s) => add(TM.scenes[s].s + 0.4, 'scribble'));
  type(cmdOf('CREATE TABLE talabalar'), W('L2', 'yaratamiz') - 0.6);
  type(cmdOf('INSERT INTO talabalar'), W('L2', 'uchta') - 0.3);
  type('qollanma=# SELECT * FROM talabalar;', W('L3', 'selekt') - 0.2);
  const tUpd = type(cmdOf('UPDATE'), W('L4', 'ozgartiramiz') - 0.4);
  const tSel2 = type('qollanma=# SELECT * FROM talabalar;', W('L4', 'qaytaramiz'));
  add(tSel2 + 0.3, 'whoosh'); add(W('L5', 'oxirida'), 'error');
  const tOrd = type(cmdOf('SELECT * FROM talabalar ORDER BY'), W('L7', 'order') - 0.3);
  add(tOrd + 0.3, 'whoosh'); add(tOrd + 0.6, 'ding');
  const tCnt = type(cmdOf('SELECT is_supported'), W('L9', 'guruhlab') - 0.4);
  add(tCnt + 0.3, 'pop'); add(tCnt + 0.5, 'pop');
  type(cmdOf('SELECT feature_id'), W('L11', 'torttasini') - 0.3);
  [W('L12', 'e'), W('L12', 'f'), W('L12', 'olti', 0), W('L12', 'olti', 1)].forEach((t) => add(t, 'pop'));
  add(W('L13', 'taqribiy'), 'blip');
  add(W('L14', 'tayanmang'), 'error'); add(W('L14', 'doim'), 'ding');
  add(L('L14').e + 0.3, 'swell');
  cues.sort((a, b) => a.t - b.t); g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

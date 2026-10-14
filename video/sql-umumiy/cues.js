// Ovoz effektlari: anim.js dagi harakatlar bilan bir xil so'z bog'lanishlari (SY.W) -> [vaqt, tur]
(function (g) {
  const { L, W } = g.SY, TM = g.TM;
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  const typing = (t0, dur) => { for (let t = t0; t < t0 + dur; t += 0.075) add(t + ((t * 997) % 0.02), 'tick'); };

  add(0.3, 'swell');
  // har sahna sarlavhasi qalam bilan yoziladi
  ['L2', 'L5', 'L9', 'L12', 'L18', 'L21', 'L24', 'L29', 'L32', 'L36'].forEach((id) => add(L(id).s - 0.6, 'scribble'));
  add(W('L4', 'bazasi'), 'whoosh');
  add(W('L4', 'savol'), 'pop'); add(W('L4', 'buyruq'), 'pop');
  for (let i = 0; i < 5; i++) add(W('L7', 'qator') + i * 0.42, 'pop');
  add(W('L8', 'birlamchi'), 'ding');
  add(W('L10', 'ishora'), 'whoosh');
  add(W('L11', 'xato'), 'error');
  typing(L('L13').s + 0.2, 2.2);
  add(W('L13', 'tartibida'), 'pop');
  add(W('L15', 'ver') + 0.5, 'strike');
  add(W('L16', 'selekt') + 0.3, 'whoosh');
  add(W('L17', 'order') + 0.6, 'whoosh');
  add(W('L17', 'natija'), 'ding');
  add(W('L19', 'boglaydi'), 'whoosh');
  for (let i = 0; i < 6; i++) add(W('L19', 'juftlab') + 0.3 + i * 0.22, 'pop');
  typing(L('L20').s, 1.6);
  for (let i = 0; i < 4; i++) add(W('L22', 'grup') + 0.9 + i * 0.35, 'whoosh');
  for (let i = 0; i < 3; i++) add(W('L22', 'kaunt') + i * 0.3, 'pop');
  typing(L('L23').s, 1.4);
  [W('L25', 'insert'), W('L26', 'apdeyt'), W('L27', 'dilit')].forEach((t, i) => { typing(t, 0.9); add(t + 1.0, i === 2 ? 'strike' : 'pop'); });
  add(W('L28', 'hamma'), 'error');
  add(W('L29', 'indekssiz'), 'whoosh');
  add(W('L30', 'darhol'), 'whoosh');
  typing(L('L31').s, 1.0); add(L('L31').s + 1.2, 'ding');
  add(W('L32', 'ellik'), 'whoosh');
  add(W('L33', 'xato'), 'error');
  add(L('L34').s, 'scribble');
  add(W('L35', 'roulbek'), 'whoosh');
  add(W('L35', 'kommit'), 'ding');
  typing(L('L36').s + 0.2, 1.0);
  for (let i = 0; i < 3; i++) add(W('L36', 'tushunadi') + i * 0.2, 'pop');
  add(L('L39').s, 'scribble');
  add(L('L40').s, 'swell');
  cues.sort((a, b) => a.t - b.t);
  g.CUES = cues;
})(typeof window !== 'undefined' ? window : globalThis);

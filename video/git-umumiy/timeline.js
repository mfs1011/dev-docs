// Umumiy vaqt jadvali: animatsiya (brauzer) va musiqa (node) ikkalasi shundan foydalanadi.
(function (g) {
  const CPS = 20; // terminalda yozish tezligi (belgi/soniya)
  const S = { intro: 0, muammo: 9, hudud: 22, commit: 52, branch: 72, remote: 115, xulosa: 140, end: 156 };
  const cmd = (t, text, out) => ({ t, text, out, end: t + text.length / CPS });

  const intro = { nodes: [0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8], title: 2.0, sub: 2.8 };
  const muammo = { files: [0.4, 1.2, 2.0, 2.8, 3.6], worry: 5.2, fly: 7.8, nodes: [8.7, 8.85, 9.0, 9.15, 9.3], head: 9.6 };

  const hudud = {
    cmds: [
      cmd(7, 'git add index.html style.css'),
      cmd(12, 'git commit -m "Bosh sahifa"', '[main a1b2c3d] Bosh sahifa'),
      cmd(19, 'git add app.js'),
      cmd(22, 'git commit -m "Tugma qo‘shildi"', '[main e4f5a6b] Tugma qo‘shildi'),
    ],
    files: 2.5, edit1: 4, edit2: 17.8,
  };
  hudud.fly1 = hudud.cmds[0].end + 0.3;
  hudud.snap1 = hudud.cmds[1].end + 0.3;
  hudud.node1 = hudud.snap1 + 1.4;
  hudud.fly2 = hudud.cmds[2].end + 0.3;
  hudud.snap2 = hudud.cmds[3].end + 0.3;
  hudud.node2 = hudud.snap2 + 1.4;

  const commit = { rows: [1, 1.55, 2.1, 2.65, 3.2, 3.75], chain: [7, 7.3, 7.6], link: 8.6, parent: 9.5, travel: 15 };

  const branch = {
    cmds: [
      cmd(6, 'git branch feature'),
      cmd(9.5, 'git switch feature', "Switched to branch 'feature'"),
      cmd(12.5, 'git commit -m "Yangi menyu"', '[feature 3c4d5e6] Yangi menyu'),
      cmd(16.5, 'git commit -m "Menyu stili"', '[feature 8a9b0c1] Menyu stili'),
      cmd(26, 'git switch main', "Switched to branch 'main'"),
      cmd(29, 'git commit -m "Tezkor tuzatish"', '[main 5f6a7b8] Tezkor tuzatish'),
      cmd(33.5, 'git merge feature', "Merge made by the 'ort' strategy."),
    ],
    base: [0.2, 0.5, 0.8], mainPill: 1.3, head: 1.8, mergeChip: 25, conflict: 38.5,
  };
  const bc = branch.cmds;
  branch.feat = bc[0].end + 0.2;
  branch.sw1 = bc[1].end + 0.2;
  branch.f1 = bc[2].end + 0.25;
  branch.f2 = bc[3].end + 0.25;
  branch.sw2 = bc[4].end + 0.2;
  branch.c4 = bc[5].end + 0.25;
  branch.m = bc[6].end + 0.25;

  const remote = {
    cmds: [
      cmd(3, 'git push origin main', '   e4f5a6b..9d0e1f2  main -> main'),
      cmd(13, 'git pull', 'Fast-forward'),
    ],
    mate: 8.5, mateSend: 10, fetchMerge: 18.3,
  };
  remote.push = remote.cmds[0].end + 0.25;
  remote.pull = remote.cmds[1].end + 0.3;

  const xulosa = { stations: [0.4, 0.75, 1.1, 1.45, 1.8], outro: 9.5, thanks: 10.5 };

  // Ovoz effektlari uchun belgilar (global vaqtda)
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  [S.muammo, S.hudud, S.commit, S.branch, S.branch + branch.mergeChip, S.remote, S.xulosa].forEach((t) => add(t + 0.15, 'chime'));
  const typing = (base, cmds) => cmds.forEach((c) => {
    for (let i = 0; i < c.text.length; i++) if (c.text[i] !== ' ') add(base + c.t + i / CPS, 'tick');
  });
  typing(S.hudud, hudud.cmds); typing(S.branch, branch.cmds); typing(S.remote, remote.cmds);

  add(S.intro + intro.title - 0.05, 'swell');
  intro.nodes.forEach((t) => add(S.intro + t, 'pop'));
  add(S.muammo + muammo.worry, 'worry');
  add(S.muammo + muammo.fly, 'whoosh');
  muammo.nodes.forEach((t) => add(S.muammo + t, 'pop'));
  add(S.hudud + hudud.fly1, 'whoosh'); add(S.hudud + hudud.fly2, 'whoosh');
  add(S.hudud + hudud.snap1 + 0.45, 'snap'); add(S.hudud + hudud.snap2 + 0.45, 'snap');
  add(S.hudud + hudud.node1, 'pop'); add(S.hudud + hudud.node2, 'pop');
  [hudud.edit1, hudud.edit2].forEach((t) => add(S.hudud + t, 'blip'));
  commit.chain.forEach((t) => add(S.commit + t, 'pop'));
  add(S.commit + commit.parent, 'blip'); add(S.commit + commit.travel + 0.3, 'whoosh');
  branch.base.forEach((t) => add(S.branch + t, 'pop'));
  [branch.feat, branch.f1, branch.f2, branch.c4].forEach((t) => add(S.branch + t, 'pop'));
  [branch.sw1, branch.sw2].forEach((t) => add(S.branch + t, 'whoosh'));
  add(S.branch + branch.m, 'big');
  add(S.branch + branch.conflict, 'worry');
  add(S.remote + remote.push, 'whoosh');
  add(S.remote + remote.push + 1.1, 'pop'); add(S.remote + remote.push + 1.35, 'pop');
  add(S.remote + remote.mateSend, 'whoosh'); add(S.remote + remote.mateSend + 1.0, 'pop');
  add(S.remote + remote.pull, 'whoosh'); add(S.remote + remote.pull + 1.1, 'pop');
  xulosa.stations.forEach((t) => add(S.xulosa + t, 'pop'));
  add(S.xulosa + xulosa.thanks - 0.05, 'swell');
  cues.sort((a, b) => a.t - b.t);

  g.TL = { CPS, S, intro, muammo, hudud, commit, branch, remote, xulosa, cues };
})(typeof window !== 'undefined' ? window : globalThis);

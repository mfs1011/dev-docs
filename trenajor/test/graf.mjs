// Graf joylashuvi: VM'da haqiqiy tarix yasab, grafLayout natijasini tekshiradi —
// ikki commit bir joyga tushmasin, ajralish chizig'i boshqa yo'lakdagi chiziqni kesmasin.
//   node trenajor/test/graf.mjs
import { V86 } from "v86";
import path from "node:path";
import url from "node:url";
import { grafLayout } from "../../src/trenajor/grafLayout.js";
import { parseHolat } from "../../src/trenajor/holat.js";

const pub = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "public", "trenajor");
const vm = new V86({
  wasm_path: path.join(pub, "v86.wasm"),
  bios: { url: path.join(pub, "bios/seabios.bin") },
  vga_bios: { url: path.join(pub, "bios/vgabios.bin") },
  bzimage: { url: path.join(pub, "kernel/buildroot-bzimage68.bin") },
  filesystem: { basefs: path.join(pub, "fs/fs.json"), baseurl: path.join(pub, "fs/base/") },
  cmdline: "rw rdinit=/nonexistent root=host9p rootfstype=9p rootflags=trans=virtio,version=9p2000.L,cache=loose init=/sbin/trenajor-init console=ttyS0 tsc=reliable mitigations=off quiet",
  memory_size: 256 * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
});

const VERBOSE = !!process.env.V;
let buf = "", out = "", waiter = null, holat = null;
vm.add_listener("serial0-output-byte", (b) => {
  buf += String.fromCharCode(b); out += String.fromCharCode(b);
  const m = buf.match(/\x1b\]7771;([A-Za-z0-9+/=]*)\x07/);
  if (m) { holat = parseHolat(Buffer.from(m[1], "base64").toString()); buf = buf.replace(m[0], ""); }
  if (buf.endsWith("\x1b]7770;tayyor\x07")) { buf = ""; const w = waiter; waiter = null; w?.(); }
});
const run = (cmd) => new Promise((r) => { out = ""; waiter = r; vm.serial0_send(cmd + "\n"); });

// c — commit (har biri alohida faylga: merge'da konflikt bo'lmasin)
const HOLATLAR = [
  ["main'dan ikki branch, ikkinchisi keyinroq", ["git init -q g1 && cd g1", "c(){ echo \"$1\" > \"$1.txt\"; git add .; git commit -qm \"$1\"; }", "c 1 && c 2 && git branch feature && c 3 && c 4",
    "git switch -q feature && c a1 && c a2 && c a3 && git switch -q -c feature-2 main && c b1"]],
  ["ichma-ich branch'lar", ["git switch -q -c sub1 feature~1 && c s1 && c s1b && git switch -q -c sub2 feature~1 && c s2 && git switch -q -c yana main~3 && c y1"]],
  ["merge'lardan keyin", ["git switch -q main && git merge -q --no-edit feature-2 && git merge -q --no-edit sub2 && git merge -q --no-edit yana"]],
  ["rebase'dan keyin (eski commit'lar xira)", ["git switch -q sub1 && git rebase -q main"]],
  // main'dan uch branch: ikkitasi bir joydan, uchinchisi keyinroq — keyingisi main'ga yaqin turishi kerak
  ["keyinroq ajralgan branch ichkarida", ["cd .. && git init -q g2 && cd g2", "c a && c b && git branch feature && git branch feature-2 && c c",
    "git switch -q feature && c f1 && c f2 && git switch -q feature-2 && c g1 && c g2 && c g3 && git switch -q -c feature-3 main && c d"]],
  ["uning ichidan yana branch", ["git switch -q -c ichki feature-3 && c i1 && git switch -q -c ichki-2 feature && c j1"]],
  // foydalanuvchi holati (aynan uning buyruqlari; tahrir `>>` bilan — 9p bir soniyada bir xil hajmli
  // qayta yozishni git'ga «o'zgarmagan» deb ko'rsatishi mumkin): feature-2 ichidan ikki subfeature, ikkalasi ham orqaga merge
  ["ichma-ich merge'lar", ["cd .. && mkdir g3 && cd g3", "git init -q && echo salom > a.txt && git add . && git commit -qm \"a\" && echo \"salom 2\" >> a.txt && git commit -qam \"a change\" && git switch -qc feature && echo salom > b.txt && git add . && git commit -qm \"b\" && echo \"salom 2\" >> b.txt && git commit -qam \"b change\" && git switch -qc feature-2 main && echo salom > c.txt && git add . && git commit -qm \"c\" && echo \"salom 2\" >> c.txt && git commit -qam \"c change\" && echo \"salom 3\" >> c.txt && git commit -qam \"c change change\" && git switch -q main && echo \"salom 3\" >> a.txt && git commit -qam \"a change change\" && git switch -qc feature-3 main && echo salom > d.txt && git add . && git commit -qm \"d\" && git switch -qc subfeature feature && echo salom > e.txt && git add . && git commit -qm \"e\" && git switch -qc subfeature-2 feature-2 && echo salom > f.txt && git add . && git commit -qm \"f\" && git switch -qc subfeature-3 feature-2 && echo salom > g.txt && git add . && git commit -qm \"g\" && git switch -q feature-2 && echo \"salom 4\" >> c.txt && git commit -qam \"c change\" && git switch -q feature-3 && echo \"salom 2\" >> d.txt && git commit -qam \"d change\" && echo salom > h.txt && git add . && git commit -qm \"h\" && git switch -q subfeature-3 && echo salom > i.txt && git add . && git commit -qm \"i\" && git switch -qc feature-sub feature-3 && echo salom > j.txt && git add . && git commit -qm \"j\" && git switch -qc feature-sub-1 feature && echo salom > k.txt && git add . && git commit -qm \"k\" && git switch -qc feature-sub-3 feature-3 && echo salom > l.txt && git add . && git commit -qm \"l\" && git switch -q main && echo \"salom 4\" >> a.txt && git commit -qam \"change a\" && git switch -q feature-2 && git merge -q --no-edit subfeature-3 && git merge -q --no-edit subfeature-2"]],
];

await new Promise((r) => { waiter = r; });
// terminal o'lchami berilmasa bash uzun qatorni (~1000+ belgi) qabul qilmay qoladi; sahifa buni boot'da qiladi
await run(" stty cols 120 rows 40");
let fail = 0;
for (const [nom, cmds] of HOLATLAR) {
  for (const c of cmds) { await run(c); if (process.env.D) console.log(out.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "").slice(-4000)); }
  if (process.env.D) console.log("commit'lar:", holat.commits.length, holat.commits.map((c) => c.subject).join(","));
  const L = grafLayout(holat);
  const at = new Map(), xato = [];
  for (const n of L.nodes) {
    const k = n.x + "," + n.y;
    if (at.has(k)) xato.push(`${n.subject} va ${at.get(k)} bir joyda`);
    at.set(k, n.subject);
  }
  // har chiziq: to'g'ri qismlar (ota qatorida a.x→x1, bola qatorida x2→c.x) va burilish (x1..x2).
  // Burilish oradagi qatorlardagi biror to'g'ri qismni kesmasin
  const P = (d) => { const m = d.match(/^M([\d.]+),([\d.]+) L([\d.]+),[\d.]+ C[\d.]+,[\d.]+ [\d.]+,([\d.]+) ([\d.]+),[\d.]+ L([\d.]+),/); return m && m.slice(1).map(Number); };
  const hor = []; // [y, x0, x1, key]
  for (const e of L.edges) { const q = P(e.d); if (!q) continue; const [ax, ay, x1, cy, x2, cx] = q; if (x1 > ax) hor.push([ay, ax, x1, e.key]); if (cx > x2) hor.push([cy, x2, cx, e.key]); }
  for (const e of L.edges) {
    const q = P(e.d); if (!q) continue;
    const [, y0, x1, y1, x2] = q;
    if (y0 === y1) continue;
    for (const m of L.nodes) if (m.y > Math.min(y0, y1) && m.y < Math.max(y0, y1) && m.x > x1 && m.x < x2) xato.push(`chiziq ${e.key.slice(0, 7)} ${m.subject} commit'i ustidan o'tadi`);
    for (const [y, a, b, k] of hor) if (k !== e.key && y > Math.min(y0, y1) && y < Math.max(y0, y1) && a < x2 && x1 < b) xato.push(`chiziq ${e.key.slice(0, 7)}→${e.key.slice(41, 48)} qatordagi chiziqni kesadi (y=${y})`);
  }
  fail += xato.length;
  console.log(`${xato.length ? "✗" : "✓"} ${nom}`);
  xato.forEach((x) => console.log("    " + x));
  if (VERBOSE || xato.length) {
    const ys = [...new Set(L.nodes.map((n) => n.y))].sort((a, b) => a - b), xs = [...new Set(L.nodes.map((n) => n.x))].sort((a, b) => a - b);
    for (const y of ys) console.log("    " + xs.map((x) => (L.nodes.find((n) => n.x === x && n.y === y)?.subject ?? "·").padEnd(5)).join(""));
  }
}
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi");
vm.stop();
process.exit(fail ? 1 : 0);

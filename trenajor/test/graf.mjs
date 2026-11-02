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
let buf = "", waiter = null, holat = null;
vm.add_listener("serial0-output-byte", (b) => {
  buf += String.fromCharCode(b);
  const m = buf.match(/\x1b\]7771;([A-Za-z0-9+/=]*)\x07/);
  if (m) { holat = parseHolat(Buffer.from(m[1], "base64").toString()); buf = buf.replace(m[0], ""); }
  if (buf.endsWith("\x1b]7770;tayyor\x07")) { buf = ""; const w = waiter; waiter = null; w?.(); }
});
const run = (cmd) => new Promise((r) => { waiter = r; vm.serial0_send(cmd + "\n"); });

// c — commit (har biri alohida faylga: merge'da konflikt bo'lmasin)
const HOLATLAR = [
  ["main'dan ikki branch, ikkinchisi keyinroq", ["git init -q g1 && cd g1", "c(){ echo \"$1\" > \"$1.txt\"; git add .; git commit -qm \"$1\"; }", "c 1 && c 2 && git branch feature && c 3 && c 4",
    "git switch -q feature && c a1 && c a2 && c a3 && git switch -q -c feature-2 main && c b1"]],
  ["ichma-ich branch'lar", ["git switch -q -c sub1 feature~1 && c s1 && c s1b && git switch -q -c sub2 feature~1 && c s2 && git switch -q -c yana main~3 && c y1"]],
  ["merge'lardan keyin", ["git switch -q main && git merge -q --no-edit feature-2 && git merge -q --no-edit sub2 && git merge -q --no-edit yana"]],
  ["rebase'dan keyin (eski commit'lar xira)", ["git switch -q sub1 && git rebase -q main"]],
];

await new Promise((r) => { waiter = r; });
let fail = 0;
for (const [nom, cmds] of HOLATLAR) {
  for (const c of cmds) await run(c);
  const L = grafLayout(holat);
  const at = new Map(), xato = [];
  for (const n of L.nodes) {
    const k = n.x + "," + n.y;
    if (at.has(k)) xato.push(`${n.subject} va ${at.get(k)} bir joyda`);
    at.set(k, n.subject);
  }
  // ajralish chizig'i: ota va bola orasidagi yo'laklarda, shu ustunlar oralig'ida commit bo'lmasin
  const byHash = new Map(L.nodes.map((n) => [n.hash, n]));
  for (const n of L.nodes) for (const p of n.parents) {
    const a = byHash.get(p); if (!a || a.y === n.y) continue;
    for (const m of L.nodes) if (m !== n && m !== a && m.x > a.x && m.x < n.x && m.y > Math.min(a.y, n.y) && m.y < Math.max(a.y, n.y)) xato.push(`${a.subject}→${n.subject} chizig'i ${m.subject} ustidan o'tadi`);
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

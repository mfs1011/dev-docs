// Har mashqni haqiqiy VM'da bosib chiqadi: tayyorlash skripti -> har qadam buyrug'i -> check(holat).
//   node trenajor/test/mashqlar.mjs [mashq-id ...]
import { V86 } from "v86";
import path from "node:path";
import url from "node:url";
import { MASHQLAR, setupScript } from "../../src/trenajor/mashqlar.js";
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

const only = process.argv.slice(2);
const list = only.length ? MASHQLAR.filter((m) => only.includes(m.id)) : MASHQLAR;
const VERBOSE = !!process.env.V;

// prompt kelguncha kutadi, oxirgi holat va chiqish matnini qaytaradi
let buf = "", out = "", waiter = null, holat = null;
vm.add_listener("serial0-output-byte", (b) => {
  const c = String.fromCharCode(b);
  buf += c; out += c;
  const m = buf.match(/\x1b\]7771;([A-Za-z0-9+/=]*)\x07/);
  if (m) { holat = parseHolat(Buffer.from(m[1], "base64").toString()); buf = buf.replace(m[0], ""); }
  if (buf.endsWith("\x1b]7770;tayyor\x07")) { buf = ""; const w = waiter; waiter = null; w?.(); }
});
const prompt = () => new Promise((r) => { waiter = r; });
const run = async (cmd) => { out = ""; vm.serial0_send(cmd + "\n"); await prompt(); return out; };

await prompt();
let fail = 0;
for (const m of list) {
  // /tmp — VM ichida tmpfs, 9p orqali yozilgan fayl u yerda ko'rinmaydi; nom har safar yangi (9p keshi)
  const f = `/usr/local/lib/trenajor/m-${m.id}-${Date.now()}.sh`;
  await vm.create_file(f, new TextEncoder().encode(setupScript(m)));
  const so = await run(` bash ${f}; rm -f ${f}; cd ~/mashq/${m.id}`);
  if (!holat?.repo) { console.log(`✗ ${m.id}: tayyorlash ishlamadi\n${so}`); fail++; continue; }
  const born = holat.born ? [...holat.born].map(([k, v]) => `${k.slice(11)}@${v}`).join(" ") : "";
  console.log(`\n▶ ${m.id} — ${holat.commits.length} commit, ${born}`);
  for (const [i, s] of m.steps.entries()) {
    const o = await run(s.cmd);
    const ok = !!s.check(holat, s.cmd);
    if (!ok) fail++;
    console.log(`  ${ok ? "✓" : "✗"} ${i + 1}. ${s.cmd}`);
    if (!ok || VERBOSE) console.log(o.replace(/\x1b\][^\x07]*\x07/g, "").replace(/^/gm, "      | "));
  }
}
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi");
vm.stop();
process.exit(fail ? 1 : 0);

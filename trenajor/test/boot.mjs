// Node'da VM'ni ko'tarib, haqiqiy git buyruqlarini ishga tushiradi va vaqtni o'lchaydi.
//   node test/boot.mjs
import { V86 } from "v86";
import path from "node:path";
import url from "node:url";

const pub = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "public", "trenajor");
const t0 = Date.now();
const vm = new V86({
  wasm_path: path.join(pub, "v86.wasm"),
  bios: { url: path.join(pub, "bios/seabios.bin") },
  vga_bios: { url: path.join(pub, "bios/vgabios.bin") },
  bzimage: { url: path.join(pub, "kernel/buildroot-bzimage68.bin") },
  filesystem: { basefs: path.join(pub, "fs/fs.json"), baseurl: path.join(pub, "fs/base/") },
  cmdline: "rw rdinit=/nonexistent root=host9p rootfstype=9p rootflags=trans=virtio,version=9p2000.L,cache=loose init=/sbin/trenajor-init console=ttyS0 tsc=reliable mitigations=off",
  memory_size: 256 * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
});

const MARK = "\x1b]7770;tayyor\x07";
const steps = [
  "git --version",
  "git init -q demo && cd demo && echo salom > a.txt && git add a.txt && git commit -qm 'birinchi' && git switch -qc feature && echo 2 >> a.txt && git commit -qam ikkinchi && git log --oneline --all --graph",
  "git switch -q main && echo b > b.txt && git add b.txt && git commit -qm uchinchi && git switch -q feature && git rebase main",
];
let buf = "", step = 0, tStep = 0;
vm.add_listener("serial0-output-byte", (b) => {
  const c = String.fromCharCode(b);
  buf += c;
  process.stdout.write(c === "\x07" ? "" : c);
  const m = buf.match(/\x1b\]7771;([A-Za-z0-9+/=]*)\x07/);
  if (m) { const txt = Buffer.from(m[1], "base64").toString(); console.error("\n[holat " + m[1].length + " bayt]\n" + txt.split("\n").filter((l) => l.startsWith("@") || l.length < 120).slice(0, 40).join("\n")); buf = buf.replace(m[0], ""); }
  if (buf.endsWith(MARK)) {
    buf = "";
    const now = Date.now();
    if (step === 0) console.error(`\n[ishga tushdi: ${((now - t0) / 1000).toFixed(1)} s]`);
    else console.error(`\n[buyruq: ${((now - tStep) / 1000).toFixed(2)} s]`);
    if (step < steps.length) { tStep = Date.now(); vm.serial0_send(steps[step++] + "\n"); }
    else { vm.stop(); process.exit(0); }
  }
});
setTimeout(() => { console.error("\n[vaqt tugadi]"); process.exit(1); }, 240000);

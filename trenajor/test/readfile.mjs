// 9p orqali .git fayllarini o'qish: commit'dan keyin ref va obyekt darhol yangimi?
import { V86 } from "v86";
import path from "node:path";
import url from "node:url";
import zlib from "node:zlib";
const pub = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "public", "trenajor");
const vm = new V86({
  wasm_path: path.join(pub, "v86.wasm"), bios: { url: path.join(pub, "bios/seabios.bin") }, vga_bios: { url: path.join(pub, "bios/vgabios.bin") },
  bzimage: { url: path.join(pub, "kernel/buildroot-bzimage68.bin") },
  filesystem: { basefs: path.join(pub, "fs/fs.json"), baseurl: path.join(pub, "fs/base/") },
  cmdline: "rw rdinit=/nonexistent root=host9p rootfstype=9p rootflags=trans=virtio,version=9p2000.L,cache=loose init=/sbin/trenajor-init console=ttyS0 tsc=reliable mitigations=off",
  memory_size: 256 * 1024 * 1024, autostart: true, disable_keyboard: true, disable_mouse: true,
});
const steps = ["git init -q d && cd d && echo a > a && git add a && git commit -qm bir", "echo b >> a && git commit -qam ikki"];
let buf = "", i = 0;
vm.add_listener("serial0-output-byte", async (b) => {
  buf += String.fromCharCode(b);
  if (!buf.endsWith("\x1b]7770;tayyor\x07")) return;
  buf = "";
  if (i > 0) {
    const ref = new TextDecoder().decode(await vm.read_file("/root/d/.git/refs/heads/main")).trim();
    const obj = await vm.read_file(`/root/d/.git/objects/${ref.slice(0, 2)}/${ref.slice(2)}`);
    console.log(`#${i} main=${ref.slice(0, 7)} obyekt:`, JSON.stringify(zlib.inflateSync(obj).toString().slice(0, 80)));
  }
  if (i < steps.length) vm.serial0_send(steps[i++] + "\n"); else { vm.stop(); process.exit(0); }
});
setTimeout(() => process.exit(1), 120000);

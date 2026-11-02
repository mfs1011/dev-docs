// Brauzerdagi Linux VM (v86): asl git shu yerda ishlaydi.
// Terminal baytlari serial port orqali keladi; repo holati — ko'rinmas OSC 7771 ketma-ketligi (trenajor-holat skripti).
import { V86 } from 'v86'

const BASE = import.meta.env.BASE_URL + 'trenajor/'
const CMDLINE = [
  'rw', 'rdinit=/nonexistent', // buildroot yadrosidagi initramfs o'tkazib yuboriladi -> to'g'ridan-to'g'ri 9p ildiz
  'root=host9p', 'rootfstype=9p', 'rootflags=trans=virtio,version=9p2000.L,cache=loose',
  'init=/sbin/trenajor-init', 'console=ttyS0', 'tsc=reliable', 'mitigations=off', 'quiet',
].join(' ')

export function startVM({ onOutput, onProgress }) {
  const vm = new V86({
    wasm_path: BASE + 'v86.wasm',
    bios: { url: BASE + 'bios/seabios.bin' },
    vga_bios: { url: BASE + 'bios/vgabios.bin' },
    bzimage: { url: BASE + 'kernel/buildroot-bzimage68.bin' },
    filesystem: { basefs: BASE + 'fs/fs.json', baseurl: BASE + 'fs/base/' },
    cmdline: CMDLINE,
    memory_size: 256 * 1024 * 1024,
    autostart: true,
    disable_keyboard: true,
    disable_mouse: true,
    disable_speaker: true,
  })
  // v86 fayl yopilganda uni keshdan chiqaradi (uncache) — har buyruqda git binari qayta yuklanardi.
  // fs9p asinxron yaratiladi: yaratilgan zahoti ushlab, keshni saqlab qolamiz (jami fayl tizimi ~25 MB).
  const keep = (fs) => { if (fs?.storage) fs.storage.uncache = () => {} }
  if (vm.fs9p) keep(vm.fs9p)
  else {
    let fs9p
    Object.defineProperty(vm, 'fs9p', { configurable: true, get: () => fs9p, set: (v) => { keep(v); fs9p = v } })
  }
  // Baytlar bittalab keladi — kadrga yig'ib uzatamiz
  let pending = []
  let scheduled = false
  vm.add_listener('serial0-output-byte', (b) => {
    pending.push(b)
    if (!scheduled) {
      scheduled = true
      queueMicrotask(() => {
        scheduled = false
        const chunk = Uint8Array.from(pending)
        pending = []
        onOutput(chunk)
      })
    }
  })
  vm.add_listener('download-progress', (e) => onProgress?.(e))
  return {
    // serial port baytlarni qabul qiladi: matn UTF-8 baytlariga aylantiriladi (o‘, ’ kabi harflar uchun)
    send: (text) => vm.serial0_send(String.fromCharCode(...new TextEncoder().encode(text))),
    readFile: (p) => vm.read_file(p),
    writeFile: (p, text) => vm.create_file(p, new TextEncoder().encode(text)),
    raw: vm,
  }
}

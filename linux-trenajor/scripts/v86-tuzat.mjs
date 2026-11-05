// v86 9p fayl tizimida yangi symlink hajmi 0 va huquqlari 0000 bo'lib yaratiladi (CreateSymlink: mode=S_IFLNK).
// Linux'da symlink hajmi — nishon yo'li uzunligi, huquqi — 0777 (lrwxrwxrwx). dpkg/update-alternatives
// lstat hajmini readlink uzunligi bilan solishtiradi va farq bo'lsa «cannot stat file: Invalid argument» beradi.
// O'quvchi `ln -s` qilganda ham `ls -l` to'g'ri ko'rinishi uchun — brauzerda ham shu tuzatish ishlatiladi.
export function symlinkTuzat(vm) {
  const fs9p = vm.fs9p
  // fs9p WASM yuklangach (asinxron) yaratiladi — paydo bo'lguncha kutamiz (mehmon tizim hali yuklanmagan bo'ladi)
  if (!fs9p) return void setTimeout(() => symlinkTuzat(vm), 5)
  if (fs9p.__symlinkTuzatildi) return
  const asl = fs9p.CreateSymlink.bind(fs9p)
  fs9p.CreateSymlink = (nom, ota, nishon) => {
    const id = asl(nom, ota, nishon)
    const ino = fs9p.inodes[id]
    if (ino && ino.symlink === nishon) {
      ino.size = new TextEncoder().encode(nishon).length
      ino.mode = 0xa000 | 0o777
    }
    return id
  }
  fs9p.__symlinkTuzatildi = true
}

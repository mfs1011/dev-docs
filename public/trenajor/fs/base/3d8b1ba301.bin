# Mashq repo'larini tayyorlash yordamchilari (src/trenajor/mashqlar.js dagi skriptlar shuni o'qiydi).
# Vaqt soxta va har amalda 1 daqiqaga oshadi: commit'lar va reflog tartibi har safar bir xil chiqadi.
T=1767207600 # 2026-01-01 00:00 (+05:00)
tick() { T=$((T + 60)); export GIT_AUTHOR_DATE="@$T +0500" GIT_COMMITTER_DATE="@$T +0500"; }
# c <xabar> [fayl] [qator]: faylga qator qo'shib commit qiladi
c() { tick; f=${2:-fayl.txt}; printf '%s\n' "${3:-$1}" >> "$f"; git add "$f" && git commit -qm "$1"; }
br() { tick; git branch "$@"; }
sw() { tick; git switch -q "$@"; }
mrg() { tick; git merge -q --no-edit "$@"; }
# yangi <papka>: bo'sh repo yaratib, ichiga kiradi
yangi() { rm -rf "$1" && mkdir -p "$1" && cd "$1" && git init -q; }
# origin <papka>: shu repo'dan bare nusxa yasab, uni origin qiladi (main → origin/main kuzatadi)
origin() { ORIGIN=$(cd .. && pwd)/$1; rm -rf "$ORIGIN"; git clone -q --bare . "$ORIGIN" && git remote add origin "$ORIGIN" && git fetch -q origin && git branch -q -u origin/main main; }
# hamkasb <qator> <fayl>: origin'ga boshqa odam nomidan commit push qiladi (lokal repo buni bilmaydi)
hamkasb() {
  tick
  ( d=$(mktemp -d) && git clone -q "$ORIGIN" "$d/h" && cd "$d/h" && printf '%s\n' "$1" >> "$2" && git add "$2" &&
    GIT_AUTHOR_NAME=Hamkasb GIT_AUTHOR_EMAIL=hamkasb@trenajor.uz GIT_COMMITTER_NAME=Hamkasb GIT_COMMITTER_EMAIL=hamkasb@trenajor.uz \
    git commit -qm "$1" && git push -q origin main; rm -rf "$d" )
}

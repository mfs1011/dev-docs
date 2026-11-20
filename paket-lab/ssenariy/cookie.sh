# Cookie: kirish → profil → chiqish → profil. curl cookie'larni o'zi saqlamaydi: -c (yozish) va -b (o'qish) bilan fayl.
# Bitta curl, --next — bitta TCP ulanish. Ochiq HTTP — sarlavhalar yozuvda ko'rinsin. DNS aralashmasin deb --resolve.
J=/tmp/jar.txt; rm -f $J
curl -sS --http1.1 --resolve hisob.sayt.test:80:203.0.113.10 \
  -c $J -b $J -o /dev/null -w '1: %{http_code}\n' http://hisob.sayt.test/kirish \
  --next -c $J -b $J -w '2: %{http_code} ' http://hisob.sayt.test/profil \
  --next -c $J -b $J -o /dev/null -w '3: %{http_code}\n' http://hisob.sayt.test/chiqish \
  --next -c $J -b $J -w '4: %{http_code} ' http://hisob.sayt.test/profil
echo '--- cookie fayli:'
cat $J

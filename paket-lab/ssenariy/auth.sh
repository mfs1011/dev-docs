# HTTP autentifikatsiya (Basic): bitta ulanishda uch so'rov — ma'lumotsiz, xato parol, to'g'ri parol.
# curl -u Basic sarlavhasini o'zi yasaydi. Ochiq HTTP — base64 tarmoqda qanday ko'rinishini ko'rish uchun. DNS aralashmasin deb --resolve.
curl -sS --http1.1 --resolve panel.sayt.test:80:203.0.113.10 \
  -o /dev/null -w '1: %{http_code}\n' http://panel.sayt.test/ \
  --next -u lab:xato-parol -o /dev/null -w '2: %{http_code}\n' http://panel.sayt.test/ \
  --next -u lab:sinov-parol -o /dev/null -w '3: %{http_code}\n' http://panel.sayt.test/

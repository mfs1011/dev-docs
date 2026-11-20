# Redirect: eski manzil http://www.sayt.test/ → 301 → https://sayt.test/ (yangi TCP + TLS). DNS aralashmasin deb --resolve.
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS -L --http1.1 --cacert /tls/ildiz.pem \
  --resolve www.sayt.test:80:203.0.113.10 --resolve sayt.test:443:203.0.113.10 -o /dev/null \
  -w 'http=%{http_code} yonaltirish=%{num_redirects} oxirgi=%{url_effective} jami=%{time_total} redirect_vaqti=%{time_redirect}\n' \
  http://www.sayt.test/

FROM nginx:1.30.6
# 80-portdagi asosiy server — rasmdagi default.conf (sayt.test, IP bilan so'rovlar). Boshqa nomli server'lar (cookie, api)
# conf.d da alifbo bo'yicha oldin kelsa ham, ular asosiy bo'lib qolmasin
RUN sed -i -E 's/^( *listen +)80;/\180 default_server;/' /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
# HTTP/2 darsi: sahifa bilan birga so'raladigan ikki kichik fayl
COPY uslub.css ilova.js /usr/share/nginx/html/
# HTTPS (TLS darsi): tls/yarat.sh yaratgan sozlama /etc/nginx/tls ga ulanadi; papka bo'sh bo'lsa — faqat HTTP
RUN echo 'include /etc/nginx/tls/*.conf;' > /etc/nginx/conf.d/tls.conf
# Siqish darsi: gzip (text/html doim siqiladi) va Vary: Accept-Encoding. Faqat so'rovda Accept-Encoding: gzip bo'lsa
# siqadi — boshqa darslardagi curl uni yubormaydi; ulardagi farq: javobda Vary sarlavhasi.
RUN printf 'gzip on;\ngzip_vary on;\n' > /etc/nginx/conf.d/siqish.conf
# Cookie darsi: hisob.sayt.test (alohida nom, sayt.test ga ta'sir qilmaydi)
COPY cookie.conf /etc/nginx/conf.d/cookie.conf
# CORS darsi: API (api.sayt.test) va uni chaqiradigan sahifa (sayt.test/cors.html)
COPY api.conf /etc/nginx/conf.d/api.conf
COPY cors.html /usr/share/nginx/html/cors.html
# HTTP autentifikatsiya darsi: panel.sayt.test, Basic. Sinov foydalanuvchisi lab / sinov-parol (faqat laboratoriya uchun);
# parol fayli build paytida openssl passwd -apr1 bilan yaratiladi (nginx hujjati: auth_basic_user_file)
COPY panel.conf /etc/nginx/conf.d/panel.conf
COPY panel/ /usr/share/nginx/panel/
RUN printf 'lab:%s\n' "$(openssl passwd -apr1 sinov-parol)" > /etc/nginx/panel.htpasswd
# MITM darsi: sayt.test:80 da ham /kirish (login formasi qabul qiladigan joy) — ochiq HTTP holati uchun
COPY kirish.inc /etc/nginx/kirish.inc
RUN sed -i -E 's|^( *listen +80 default_server;)|\1\n    include /etc/nginx/kirish.inc;|' /etc/nginx/conf.d/default.conf
# HTTP/3 darsi: uslub va skriptni chaqiradigan sahifa — bitta QUIC ulanishda uch oqim
COPY h3.html /usr/share/nginx/html/h3.html
# Metodlar va holat kodlari darsi: fayl.sayt.test — WebDAV (PUT, DELETE), yoziladigan papka nginx foydalanuvchisiga
COPY fayl.conf /etc/nginx/conf.d/fayl.conf
RUN mkdir -p /var/lib/nginx-dav /var/lib/nginx-dav-tmp && chown nginx:nginx /var/lib/nginx-dav /var/lib/nginx-dav-tmp
# CSRF darsi: boshqa sayt (yomon.test) va uning hujum sahifasi
COPY yomon.conf /etc/nginx/conf.d/yomon.conf
COPY yomon/ /usr/share/nginx/yomon/
# CSP va clickjacking darsi: himoya.sayt.test
COPY himoya.conf /etc/nginx/conf.d/himoya.conf
COPY himoya/ /usr/share/nginx/himoya/

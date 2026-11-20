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

FROM nginx:1.30.6
COPY index.html /usr/share/nginx/html/index.html
# HTTPS (TLS darsi): tls/yarat.sh yaratgan sozlama /etc/nginx/tls ga ulanadi; papka bo'sh bo'lsa — faqat HTTP
RUN echo 'include /etc/nginx/tls/*.conf;' > /etc/nginx/conf.d/tls.conf
# Siqish darsi: gzip (text/html doim siqiladi) va Vary: Accept-Encoding. Faqat so'rovda Accept-Encoding: gzip bo'lsa
# siqadi — boshqa darslardagi curl uni yubormaydi; ulardagi farq: javobda Vary sarlavhasi.
RUN printf 'gzip on;\ngzip_vary on;\n' > /etc/nginx/conf.d/siqish.conf

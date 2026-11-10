#!/bin/sh
# nginx'ni brauzerdagi VM (v86, 32-bit) uchun yig'ish: Debian 12 i386 konteynerida, nginx.org manba arxividan.
# Parametrlar — nginx.org rasmiy paketidagi (nginx -V) bilan bir xil, farqi: --with-debug (trenajor debug log'dan
# nginx'ning qarorlarini chizadi) va --with-control-api yo'q (trenajorda ishlatilmaydi). ACME moduli (Rust) ham yo'q.
# Docker bor kompyuterda (masalan, sinov VPS) ishlatiladi:
#   sh nginx-trenajor/scripts/nginx-yigish.sh  ->  nginx-trenajor/build/nginx-1.31.8-i386.tar.gz (profil.json shuni kutadi)
set -eu
V=1.31.8
SHA256=0652b760b3b772d2ec17b47c2fc15d9a95e6fe35cd5b877eadc1a62d9bc75af1
cd "$(dirname "$0")/.."
mkdir -p build
cd build
[ -f nginx-$V.tar.gz ] || curl -fsSLO https://nginx.org/download/nginx-$V.tar.gz
echo "$SHA256  nginx-$V.tar.gz" | sha256sum -c -
# seccomp=unconfined: GitHub Actions runner'ida (Docker 29.4, Azure 7.0 yadro) standart seccomp profili i386 konteynerda
# DNS'ni ishlatmaydi ("Temporary failure resolving") — amd64 konteynerda ishlaydi, i386 da faqat seccomp'siz.
# Konteyner faqat Debian paketlari bilan nginx'ni yig'adi.
docker run --rm --security-opt seccomp=unconfined --platform linux/386 -v "$PWD:/w" -w /w debian:bookworm setarch i686 sh -euc "
  export DEBIAN_FRONTEND=noninteractive
  apt-get -o Acquire::Retries=3 update -qq && apt-get -o Acquire::Retries=3 install -y -qq build-essential libpcre2-dev libssl-dev zlib1g-dev > /dev/null
  rm -rf /tmp/b && mkdir /tmp/b && tar -xzf nginx-$V.tar.gz -C /tmp/b && cd /tmp/b/nginx-$V
  ./configure --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log \
    --pid-path=/run/nginx.pid --lock-path=/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio \
    --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module \
    --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_json_module \
    --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module \
    --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module \
    --with-http_v2_module --with-http_v3_module --with-mail --with-mail_ssl_module --with-stream \
    --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module \
    --with-debug --with-cc-opt='-O2' > /tmp/configure.log || { tail -20 /tmp/configure.log; exit 1; }
  make -j\$(nproc) > /tmp/make.log 2>&1 || { tail -30 /tmp/make.log; exit 1; }
  make install DESTDIR=/tmp/out > /dev/null
  mkdir -p /tmp/out/var/cache/nginx /tmp/out/var/log/nginx
  # nginx.org paketida yo'q fayllar (manba namunalari): konfiguratsiya fayllari profilning ildiz/ papkasidan keladi
  cd /tmp/out/etc/nginx && rm -rf html *.default koi-utf koi-win win-utf fastcgi.conf nginx.conf && cd /tmp/b/nginx-$V
  strip /tmp/out/usr/sbin/nginx
  /tmp/out/usr/sbin/nginx -V 2>&1 | head -3
  tar -czf /w/nginx-$V-i386.tar.gz -C /tmp/out .
"
ls -l nginx-$V-i386.tar.gz

# Web asoslari laboratoriyasini sozlash (sahifa VM ochilgach bir marta bajaradi).
systemctl stop nginx-kuzatuv 2>/dev/null          # ttyS1 endi laboratoriya kanali
grep -q 'sayt.test' /etc/hosts || echo '127.0.0.1 sayt.test api.test' >> /etc/hosts
mkdir -p /srv/lab/static /srv/lab/maxfiy
cp /root/.lab-index.html /srv/lab/index.html
cp /root/.lab-logo.svg /srv/lab/static/logo.svg
cp /root/.lab-uslub.css /srv/lab/static/uslub.css
echo '<h1>Maxfiy sahifa</h1>' > /srv/lab/maxfiy/index.html
chmod -R a+rX /srv/lab                            # vm.create_file fayllari 600 bo'ladi — nginx o'qiy olsin
i=1; while [ $i -le 400 ]; do printf '%04d: HTTP qismli yuklash (Range) va siqish (gzip) uchun matn qatori.\n' $i; i=$((i+1)); done > /srv/lab/katta.txt
head -c 24576 /srv/lab/katta.txt > /srv/lab/sekin.txt
printf 'ali:{PLAIN}parol123\n' > /etc/nginx/lab.htpasswd
cp /root/.lab-nginx.conf /etc/nginx/conf.d/web-lab.conf
nginx -t 2>&1 | tail -1
nginx -s reload
setsid sh /root/.lab-yuritma.sh < /dev/null > /dev/null 2>&1 &

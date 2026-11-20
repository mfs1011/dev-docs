#!/bin/sh
# Sinov CA zanjiri: ildiz CA → oraliq CA → sayt.test. Faqat laboratoriya uchun; kalitlar tls/sinov/ da (git'da yo'q).
# Bir marta yaratiladi — keyingi yozuvlarda zanjir o'zgarmaydi. Qayta yaratish: rm -r tls/sinov
set -eu
cd "$(dirname "$0")"
mkdir -p sinov
# nginx sozlamasi har safar yangilanadi (zanjir esa bir marta)
cp sayt.conf sinov/ && chmod 644 sinov/sayt.conf
[ -f sinov/zanjir.pem ] && exit 0
cd sinov
EC="-newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes"
printf 'basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid\n' > oraliq.ext
printf 'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:sayt.test\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid\n' > sayt.ext
openssl req -x509 -new $EC -keyout ildiz.key -out ildiz.pem -days 3650 -subj "/O=Paket lab/CN=Paket lab ildiz CA" \
  -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign"
openssl req -new $EC -keyout oraliq.key -out oraliq.csr -subj "/O=Paket lab/CN=Paket lab oraliq CA"
openssl x509 -req -in oraliq.csr -CA ildiz.pem -CAkey ildiz.key -CAcreateserial -days 1825 -extfile oraliq.ext -out oraliq.pem
openssl req -new $EC -keyout sayt.key -out sayt.csr -subj "/CN=sayt.test"
openssl x509 -req -in sayt.csr -CA oraliq.pem -CAkey oraliq.key -CAcreateserial -days 397 -extfile sayt.ext -out sayt.pem
# server zanjiri: o'z sertifikati + oraliq (ildiz yuborilmaydi — u klientda bor)
cat sayt.pem oraliq.pem > zanjir.pem
chmod 644 *.pem sayt.key
rm -f *.csr *.srl *.ext
openssl verify -CAfile ildiz.pem -untrusted oraliq.pem sayt.pem

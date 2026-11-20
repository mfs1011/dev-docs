# Metodlar va holat kodlari: bitta ulanishda bir fayl ustida ketma-ket metodlar (curl --next, bitta TCP ulanish).
# GET (yo'q) → PUT (yaratildi) → PUT (almashtirildi) → GET → HEAD → POST (ruxsat yo'q) → DELETE → DELETE (yana) → /tashqi (502).
U=http://fayl.sayt.test
R='--resolve fayl.sayt.test:80:203.0.113.10'
curl -sS --http1.1 $R -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -X PUT --data-binary 'salom' -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -X PUT --data-binary 'salom, dunyo' -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -o /dev/null -w '%{method} %{http_code} %{size_download}\n' $U/qayd.txt \
  --next $R -I -o /dev/null -w '%{method} %{http_code} %{size_download}\n' $U/qayd.txt \
  --next $R -X POST --data-binary 'x' -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -X DELETE -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -X DELETE -o /dev/null -w '%{method} %{http_code}\n' $U/qayd.txt \
  --next $R -o /dev/null -w '%{method} %{http_code}\n' $U/tashqi

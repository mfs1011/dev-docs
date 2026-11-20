# TCP: uch tomonlama salomlashuv → ma'lumot va tasdiq → yopish; keyin yopiq port → RST
# DNS aralashmasin deb to'g'ridan-to'g'ri IP manzil bilan
curl -sS --http1.1 -o /dev/null http://203.0.113.10/
sleep 1
curl -sS --http1.1 -o /dev/null --max-time 3 http://203.0.113.10:81/ || true

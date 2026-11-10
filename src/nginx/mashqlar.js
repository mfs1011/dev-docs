// Nginx trenajori mashqlari. Format — Linux trenajoridagi bilan bir xil (linuxMashqlar.js boshidagi izoh):
//   check — bash shart, har prompt oldidan haqiqiy tizim holatidan tekshiriladi; ran — yozilgan buyruq regex'i.
// Har mashq nginx'ni boshlang'ich holatga qaytaradi (TOZALA): conf.d da faqat paketdagi default.conf va trenajor
// kuzatuv fayli qoladi. Natija matnlari VM'dagi haqiqiy chiqishdan; nginx-trenajor/test/mashqlar.mjs har mashqni
// VM'da oxirigacha bajarib tekshiradi.
// check ichidagi curl — `-A trenajor-tekshiruv` bilan: bunday so'rovlar "So'rov yo'li"da ko'rsatilmaydi (kuzatuv.js).

const TOZALA = String.raw`find /etc/nginx/conf.d -name '*.conf' ! -name default.conf ! -name trenajor-kuzatuv.conf -delete
rm -rf /var/www /var/cache/nginx/kesh
nginx -s reload`

// 6-bobdagi A–F misoli (NG core module, location)
const TANLASH_CONF = String.raw`server {
    listen 127.0.0.1:8097;
    location = / {
        return 200 "A: = /\n";
    }
    location / {
        return 200 "B: /\n";
    }
    location /documents/ {
        return 200 "C: /documents/\n";
    }
    location ^~ /images/ {
        return 200 "D: ^~ /images/\n";
    }
    location ~* \.(gif|jpg|jpeg)$ {
        return 200 "E: ~* rasm\n";
    }
    location $arg_pred {
        return 200 "F: predikat\n";
    }
}`

export const NGINX_MASHQLAR = [
  {
    id: 'ng-01-tanishuv',
    title: 'Ishlab turgan nginx bilan tanishuv',
    bob: '/nginx/04-boshqarish',
    intro: 'nginx o‘rnatilgan va ishlab turibdi. Uning holatini, standart saytini va log’ini ko‘ring. Har so‘rov o‘ngdagi “So‘rov yo‘li”da chiziladi.',
    setup: TOZALA,
    steps: [
      {
        cmd: 'systemctl status nginx --no-pager',
        text: 'nginx servisining holatini ko‘ring.',
        ran: /^systemctl\s+status\s+nginx\b/,
        natija: '`active (running)`, bitta `master process` va `worker process`. `Drop-In: trenajor.conf` — trenajorning qo‘shimchasi: nginx debug log ham yozadi, “So‘rov yo‘li” shundan chiziladi.',
      },
      {
        cmd: 'curl -i http://localhost/',
        text: 'Standart sahifani so‘rang. `-i` javob sarlavhalarini ham ko‘rsatadi.',
        ran: /^curl\s.*localhost\/?(\s|$)/,
        natija: '`HTTP/1.1 200 OK`, `Server: nginx/1.31.8`. Sxemada ikkita tanlov bor: `/` so‘rovi `index` direktivasi bilan `/index.html` ga aylandi (ichki yo‘naltirish) va nginx location’ni qaytadan tanladi.',
      },
      {
        cmd: 'cat /etc/nginx/conf.d/default.conf',
        text: 'Bu javobni bergan konfiguratsiyani o‘qing.',
        ran: /\/etc\/nginx\/conf\.d\/default\.conf/,
        natija: '`listen 80`, `server_name localhost`, `location /` (`root /usr/share/nginx/html`, `index index.html index.htm`) va `location = /50x.html`.',
      },
      {
        cmd: 'curl -s -o /dev/null -w "%{http_code}\\n" http://localhost/yoq',
        text: 'Mavjud bo‘lmagan sahifani so‘rang.',
        ran: /^curl\s.*localhost\/yoq/,
        natija: '`404`. Location baribir `/` — u har qanday URI’ga mos keladi, faqat diskda `/usr/share/nginx/html/yoq` fayli yo‘q.',
      },
      {
        cmd: 'tail -n 2 /var/log/nginx/access.log',
        text: 'Ikkala so‘rov access log’ga yozilganini ko‘ring (10-bob).',
        ran: /^tail\s.*\/var\/log\/nginx\/access\.log/,
        natija: 'Har qatorda mijoz IP’si, vaqt, `"GET /yoq HTTP/1.1"`, status (`200`, `404`) va javob hajmi — `nginx.conf` dagi `main` formati.',
      },
    ],
  },
  {
    id: 'ng-05-statik-sayt',
    title: 'Birinchi sayt va server tanlash',
    bob: '/nginx/05-statik-sayt',
    intro: 'O‘z saytingizni `sayt.test` nomi bilan qo‘shasiz. Keyin nginx so‘rovni `Host` sarlavhasiga qarab qaysi serverga berishini ko‘rasiz (6-bob).',
    setup: TOZALA,
    steps: [
      {
        cmd: "mkdir -p /var/www/sayt && echo '<h1>Salom, sayt.test</h1>' > /var/www/sayt/index.html",
        text: 'Sayt papkasini va bosh sahifani yarating.',
        check: 'grep -q Salom /var/www/sayt/index.html',
        natija: '`/var/www/sayt/index.html` tayyor. Bu hali nginx’ga ulanmagan — oddiy fayl.',
      },
      {
        cmd: "cat > /etc/nginx/conf.d/sayt.conf <<'EOF'\nserver {\n    listen 80;\n    server_name sayt.test;\n    root /var/www/sayt;\n}\nEOF",
        text: 'Yangi `server` blokini yozing: shu nom uchun shu papka.',
        check: "grep -Eq 'server_name[[:space:]]+sayt\\.test' /etc/nginx/conf.d/sayt.conf && grep -q '/var/www/sayt' /etc/nginx/conf.d/sayt.conf",
        natija: '`conf.d/` dagi `*.conf` fayllar `nginx.conf` dagi `include` bilan `http` blokiga kiradi (3-bob). Lekin ishlab turgan nginx hali eski konfiguratsiyada.',
      },
      {
        cmd: 'nginx -t && nginx -s reload',
        text: 'Konfiguratsiyani tekshiring va qayta yuklang.',
        check: "curl -s -A trenajor-tekshiruv -H 'Host: sayt.test' http://localhost/ | grep -q Salom",
        natija: '`syntax is ok`, `test is successful` — keyin `reload`: yangi worker’lar yangi konfiguratsiya bilan ishga tushdi (4-bob).',
      },
      {
        cmd: "curl -s -H 'Host: sayt.test' http://localhost/",
        text: 'Saytni `Host: sayt.test` bilan so‘rang.',
        ran: /^curl\s.*Host:\s*sayt\.test/,
        natija: '`<h1>Salom, sayt.test</h1>`. Sxemada: `server_name sayt.test`, location bosqichi yo‘q — bu serverda `location` yozilmagan, `root` server darajasida.',
      },
      {
        cmd: "curl -s -H 'Host: boshqa.test' http://localhost/ | grep title",
        text: 'Hech qaysi serverga mos kelmaydigan nom bilan so‘rang.',
        ran: /^curl\s.*Host:\s*boshqa\.test/,
        natija: '`<title>Welcome to nginx!</title>` — 80-portning **standart serveri** javob berdi: `default.conf` (`server_name localhost`). `default_server` yozilmagan, shuning uchun portdagi birinchi server; `conf.d` fayllari alifbo tartibida o‘qiladi.',
      },
    ],
  },
  {
    id: 'ng-06-location',
    title: 'nginx location’ni qanday tanlaydi',
    bob: '/nginx/06-server-tanlash',
    intro: '`/etc/nginx/conf.d/tanlash.conf` da 6-bobdagi A–F misoli tayyor (127.0.0.1:8097). Har so‘rovdan keyin o‘ngda nginx qaysi location’larni qaysi tartibda sinagani va nega aynan shunisini tanlagani chiziladi.',
    setup: `${TOZALA}\ncat > /etc/nginx/conf.d/tanlash.conf <<'EOF'\n${TANLASH_CONF}\nEOF\nnginx -t -q && nginx -s reload`,
    steps: [
      {
        cmd: 'cat /etc/nginx/conf.d/tanlash.conf',
        text: 'Avval konfiguratsiyani o‘qing: oltita location, har biri o‘z harfini qaytaradi.',
        ran: /tanlash\.conf/,
        natija: '`=` aniq, `/` va `/documents/` prefiks, `^~ /images/`, `~*` regex va `$arg_pred` predikat (1.31.5 dan).',
      },
      {
        cmd: 'curl -s http://127.0.0.1:8097/',
        text: '`/` ni so‘rang.',
        ran: /^curl\s.*8097\/?(\s|$)/,
        natija: '`A: = /`. Sxemada bitta sinov: aniq moslik topilishi bilan nginx qidiruvni to‘xtatdi.',
      },
      {
        cmd: 'curl -s http://127.0.0.1:8097/documents/document.html',
        text: 'Hujjat sahifasini so‘rang.',
        ran: /^curl\s.*8097\/documents\/document\.html/,
        natija: '`C: /documents/`. Prefikslar sinaldi, eng uzuni `/documents/` eslab qolindi; regex `.html` ga mos kelmadi, predikat bo‘sh — eslab qolingan prefiks tanlandi.',
      },
      {
        cmd: 'curl -s http://127.0.0.1:8097/documents/1.jpg',
        text: 'Endi o‘sha papkadagi rasmni so‘rang.',
        ran: /^curl\s.*8097\/documents\/1\.jpg/,
        natija: '`E: ~* rasm`. Prefiks `/documents/` eslab qolindi, lekin regex mos keldi — **regex ustun**.',
      },
      {
        cmd: 'curl -s http://127.0.0.1:8097/images/1.gif',
        text: '`/images/` dagi rasmni so‘rang.',
        ran: /^curl\s.*8097\/images\/1\.gif/,
        natija: '`D: ^~ /images/`. Sxemada regex umuman sinalmadi: eng uzun prefiks `^~` bilan belgilangan — nginx regex bosqichini o‘tkazib yubordi.',
      },
      {
        cmd: "curl -s 'http://127.0.0.1:8097/documents/index.html?pred=1'",
        text: 'Argument bilan so‘rang.',
        ran: /^curl\s.*8097\/documents\/index\.html\?pred=1/,
        natija: '`F: predikat`. Regex mos kelmadi, keyin predikat sinaldi: `$arg_pred` = `1` — bo‘sh emas va `0` emas.',
      },
    ],
  },
  {
    id: 'ng-11-reverse-proxy',
    title: 'Reverse proxy: so‘rovni backend’ga uzatish',
    bob: '/nginx/11-reverse-proxy',
    intro: 'Trenajorda “ilova” degan backend bor: u 8081–8083 portlarida qaysi port javob berganini va kelgan sarlavhalarni qaytaradi. nginx’ni uning oldiga qo‘yasiz.',
    setup: TOZALA,
    steps: [
      {
        cmd: "cat > /etc/nginx/conf.d/proxy.conf <<'EOF'\nserver {\n    listen 8090;\n    location /api/ {\n        proxy_pass http://127.0.0.1:8081;\n    }\n    location /v2/ {\n        proxy_pass http://127.0.0.1:8081/;\n    }\n}\nEOF",
        text: 'Ikki location yozing: biri `proxy_pass` oxirida `/` siz, ikkinchisi `/` bilan.',
        check: 'grep -q "proxy_pass http://127.0.0.1:8081;" /etc/nginx/conf.d/proxy.conf && grep -q "proxy_pass http://127.0.0.1:8081/;" /etc/nginx/conf.d/proxy.conf',
        natija: 'Fayl tayyor. Farq bitta belgi — lekin backend’ga boradigan URI boshqacha bo‘ladi.',
      },
      {
        cmd: 'nginx -t && nginx -s reload',
        text: 'Tekshiring va qayta yuklang.',
        check: 'curl -s -A trenajor-tekshiruv http://localhost:8090/api/x | grep -q ilova:8081',
        natija: 'nginx endi 8090-portda ham tinglaydi.',
      },
      {
        cmd: 'curl -s http://localhost:8090/api/users',
        text: '`/api/users` ni so‘rang.',
        ran: /^curl\s.*8090\/api\/users/,
        natija: '`ilova:8081 GET /api/users` — URI o‘zgarmasdan ketdi (`proxy_pass` da URI qismi yo‘q). `Host: 127.0.0.1:8081`, `X-Real-IP` bo‘sh. Sxemada: location `/api/`, backend `127.0.0.1:8081`.',
      },
      {
        cmd: 'curl -s http://localhost:8090/v2/users',
        text: '`/v2/users` ni so‘rang.',
        ran: /^curl\s.*8090\/v2\/users/,
        natija: '`ilova:8081 GET /users` — `proxy_pass` da URI (`/`) bor, shuning uchun location’ga mos qism (`/v2/`) shu bilan almashtirildi.',
      },
      {
        cmd: "sed -i 's|proxy_pass http://127.0.0.1:8081;|proxy_pass http://127.0.0.1:8081;\\n        proxy_set_header Host $host;\\n        proxy_set_header X-Real-IP $remote_addr;|' /etc/nginx/conf.d/proxy.conf && nginx -t -q && nginx -s reload",
        text: '`/api/` ga asl `Host` va mijoz IP’sini uzatuvchi sarlavhalarni qo‘shing.',
        check: 'curl -s -A trenajor-tekshiruv http://localhost:8090/api/x | grep -q "X-Real-IP: 127.0.0.1"',
        natija: 'Qo‘shildi va qayta yuklandi.',
      },
      {
        cmd: 'curl -s http://localhost:8090/api/users',
        text: 'Yana so‘rang va sarlavhalarni solishtiring.',
        ran: /^curl\s.*8090\/api\/users/,
        natija: '`Host: localhost`, `X-Real-IP: 127.0.0.1` — backend endi asl nom va mijoz manzilini biladi (17-bob).',
      },
    ],
  },
  {
    id: 'ng-15-yuklama',
    title: 'Yuklamani uch backend orasida taqsimlash',
    bob: '/nginx/15-yuklama',
    intro: '`upstream` guruhiga uchta backend qo‘shasiz. So‘rovlar ular orasida qanday taqsimlanishi o‘ngdagi “backend’lar orasida” chizig‘ida ko‘rinadi.',
    setup: TOZALA,
    steps: [
      {
        cmd: "cat > /etc/nginx/conf.d/yuklama.conf <<'EOF'\nupstream ilova {\n    server 127.0.0.1:8081;\n    server 127.0.0.1:8082;\n    server 127.0.0.1:8083;\n}\nserver {\n    listen 8090;\n    location / {\n        proxy_pass http://ilova;\n    }\n}\nEOF\nnginx -t && nginx -s reload",
        text: 'Uch serverli `upstream` va unga `proxy_pass` yozib, qayta yuklang.',
        check: 'curl -s -A trenajor-tekshiruv http://localhost:8090/ | grep -q ^ilova',
        natija: 'Tayyor. Standart usul — round robin (navbat bilan).',
      },
      {
        cmd: 'for i in 1 2 3 4 5 6; do curl -s http://localhost:8090/ | head -1; done',
        text: 'Ketma-ket olti so‘rov yuboring.',
        ran: /^for\s.*curl\s.*8090/,
        natija: '`8081, 8082, 8083, 8081, 8082, 8083` — navbat bilan. Sxemadagi chiziqlar teng.',
      },
      {
        cmd: "sed -i 's|server 127.0.0.1:8081;|server 127.0.0.1:8081 weight=3;|' /etc/nginx/conf.d/yuklama.conf && nginx -t -q && nginx -s reload",
        text: 'Birinchi serverga `weight=3` bering.',
        check: 'grep -q "8081 weight=3" /etc/nginx/conf.d/yuklama.conf',
        natija: 'Endi 8081 boshqalardan uch barobar ko‘p so‘rov oladi.',
      },
      {
        cmd: 'for i in 1 2 3 4 5 6 7 8 9 10; do curl -s http://localhost:8090/ | head -1; done | sort | uniq -c',
        text: 'O‘nta so‘rov yuborib, sanang.',
        ran: /^for\s.*curl\s.*8090.*uniq/,
        natija: '`6 × 8081`, `2 × 8082`, `2 × 8083` — og‘irliklar nisbati 3:1:1.',
      },
      {
        cmd: "sed -i 's|server 127.0.0.1:8083;|server 127.0.0.1:8084;|' /etc/nginx/conf.d/yuklama.conf && nginx -t -q && nginx -s reload && for i in 1 2 3 4 5; do curl -s http://localhost:8090/ | head -1; done",
        text: 'Uchinchi serverni ishlamaydigan portga (8084) almashtiring va yana so‘rang.',
        ran: /8084.*for\s.*curl/,
        natija: 'Hamma javob baribir `200`: 8084 ga ulanish rad etilganda nginx so‘rovni keyingi serverga berdi. Sxemada bunday so‘rovda ikkita backend: `127.0.0.1:8084` (xato) va undan keyingisi.',
      },
    ],
  },
  {
    id: 'ng-16-kesh',
    title: 'Proxy kesh: MISS va HIT',
    bob: '/nginx/16-proxy-kesh',
    intro: 'nginx backend javobini diskda saqlab, keyingi so‘rovni backend’ga bormasdan beradi. Sxemadagi “Backend” bekatida kesh holati ko‘rinadi.',
    setup: TOZALA,
    steps: [
      {
        cmd: "cat > /etc/nginx/conf.d/kesh.conf <<'EOF'\nproxy_cache_path /var/cache/nginx/kesh keys_zone=kesh:1m;\nserver {\n    listen 8091;\n    location / {\n        proxy_pass http://127.0.0.1:8082;\n        proxy_cache kesh;\n        proxy_cache_valid 200 1m;\n        add_header X-Cache-Status $upstream_cache_status;\n    }\n}\nEOF\nnginx -t && nginx -s reload",
        text: 'Kesh zonasi va keshli proxy yozing. `X-Cache-Status` — kesh holatini javobda ko‘rsatish uchun.',
        check: 'curl -s -A trenajor-tekshiruv -o /dev/null -D - http://localhost:8091/sinov | grep -qi x-cache-status',
        natija: '`proxy_cache_path` — kesh fayllari papkasi va kalitlar zonasi (`kesh`, 1 MB). `proxy_cache_valid 200 1m` — `200` javoblar 1 daqiqa saqlanadi.',
      },
      {
        cmd: 'curl -s -o /dev/null -D - http://localhost:8091/mahsulot | grep -i x-cache',
        text: '`/mahsulot` ni so‘rang.',
        ran: /^curl\s.*8091\/mahsulot/,
        natija: '`X-Cache-Status: MISS` — keshda yo‘q, nginx backend’dan (`127.0.0.1:8082`) oldi va saqladi.',
      },
      {
        cmd: 'curl -s -o /dev/null -D - http://localhost:8091/mahsulot | grep -i x-cache',
        text: 'Xuddi shu manzilni yana so‘rang.',
        ran: /^curl\s.*8091\/mahsulot/,
        natija: '`X-Cache-Status: HIT`. Sxemada bu safar backend’ga ulanish yo‘q — javob keshdan.',
      },
      {
        cmd: 'ls /var/cache/nginx/kesh',
        text: 'Kesh fayllarini ko‘ring.',
        ran: /^ls\s.*\/var\/cache\/nginx\/kesh/,
        natija: 'Har kalit uchun bitta fayl, nomi — kalitning MD5 xeshi (kalit standart holatda `$scheme$proxy_host$request_uri`).',
      },
    ],
  },
  {
    id: 'ng-26-cheklash',
    title: 'limit_req va return tuzog‘i',
    bob: '/nginx/26-sorov-cheklash',
    intro: 'Bir IP’dan sekundiga 1 ta so‘rov. Lekin cheklov hamma joyda ham ishlamaydi — buni o‘zingiz ko‘rasiz.',
    setup: `${TOZALA}\nmkdir -p /var/www/cheklash/fayl && echo ok > /var/www/cheklash/fayl/a.txt`,
    steps: [
      {
        cmd: "cat > /etc/nginx/conf.d/cheklash.conf <<'EOF'\nlimit_req_zone $binary_remote_addr zone=bir:1m rate=1r/s;\nserver {\n    listen 8092;\n    root /var/www/cheklash;\n    location /return/ {\n        limit_req zone=bir;\n        return 200 \"ok\\n\";\n    }\n    location /fayl/ {\n        limit_req zone=bir;\n    }\n}\nEOF\nnginx -t && nginx -s reload",
        text: 'Zona va ikki location yozing: biri `return` bilan, ikkinchisi fayl beradi. Ikkalasida ham `limit_req`.',
        check: 'curl -s -A trenajor-tekshiruv -o /dev/null -w "%{http_code}" http://localhost:8092/fayl/a.txt | grep -qE "200|503"',
        natija: '`rate=1r/s` — sekundiga bitta so‘rov, `burst` yo‘q.',
      },
      {
        cmd: 'for i in 1 2 3 4; do curl -s -o /dev/null -w "%{http_code} " http://localhost:8092/return/; done; echo',
        text: '`/return/` ga ketma-ket to‘rtta so‘rov yuboring.',
        ran: /^for\s.*8092\/return/,
        natija: '`200 200 200 200` — **hech biri cheklanmadi**. `return` rewrite bosqichida javob beradi, `limit_req` esa undan keyingi (preaccess) bosqichda — navbat unga yetmaydi.',
      },
      {
        cmd: 'sleep 2; for i in 1 2 3 4; do curl -s -o /dev/null -w "%{http_code} " http://localhost:8092/fayl/a.txt; done; echo',
        text: 'Endi `/fayl/` ga to‘rtta so‘rov.',
        ran: /^sleep\s.*for\s.*8092\/fayl/,
        natija: '`200 503 503 503` — birinchisi o‘tdi, qolganlari tezlikdan oshdi. Sxemada ularda “limit_req: rad etildi”.',
      },
      {
        cmd: 'grep "limiting requests" /var/log/nginx/error.log | tail -1',
        text: 'Rad etilgan so‘rov error log’da qanday ko‘rinadi?',
        ran: /^grep\s.*limiting requests/,
        natija: '`limiting requests, excess: … by zone "bir"` — `[error]` darajasida (`limit_req_log_level` bilan o‘zgartirsa bo‘ladi).',
      },
    ],
  },
]

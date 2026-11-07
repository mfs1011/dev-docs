# 23 — SPA: React, Vue, Angular

[← Oldingi: Node.js va Next.js](22-node-va-nextjs.md) · [Mundarija](README.md)

## Tushuncha

SPA (single-page application — bir sahifali ilova) — React, Vue yoki Angular'da yozilgan, build'dan keyin **faqat statik fayllar** (HTML, JS, CSS) bo'lib qoladigan ilova. Unga Node.js server kerak emas — fayllarni veb-server beradi. Docker'ning React.js, Vue.js va Angular qo'llanmalari bir xil naqshni beradi:

| Bosqich | Nima |
| --- | --- |
| `builder` (Node.js) | `npm ci` va `npm run build` → statik fayllar |
| `runner` (Nginx) | Faqat statik fayllar va Nginx sozlamasi |

| Framework | Build natijasi (qo'llanmalarda) |
| --- | --- |
| React (Vite) | `dist/` |
| Vue (Vite) | `dist/` |
| Angular | `dist/<loyiha>/browser/` |

Ikki muhim tafsilot:

1. **Root'siz Nginx.** Qo'llanmalar `nginxinc/nginx-unprivileged` image'ini ishlatadi — hujjat izohi: xavfsizlik amaliyoti uchun, yakuniy image root bo'lmagan foydalanuvchi nomidan ishlaydi (12-bob). Image README'si: standart port 80 emas, **8080** — Docker'da 20.03 versiyadan beri bu shart emas, lekin boshqa konteyner runtime'larida hali kerak. (README: image endi `nginx/nginx-unprivileged` nomi bilan ham chiqadi; qo'llanmalar va biz `nginxinc/…` nomini ishlatdik.)
2. **Client-side routing.** SPA'da `/profil` kabi manzillarni brauzerdagi JavaScript boshqaradi — serverda `profil` degan fayl yo'q. Qo'llanma bo'yicha topilmagan manzillar `index.html` ga yo'naltiriladi: `try_files $uri /index.html`.

## Ilova

Vite + React — eng kichik variant. `src/main.jsx` joriy manzilni ko'rsatadi:

```jsx
import { createRoot } from 'react-dom/client';

function App() {
  return <h1>Sahifa: {window.location.pathname}</h1>;
}

createRoot(document.getElementById('root')).render(<App />);
```

Bog'liqliklar konteyner ichida o'rnatildi: `react`, `react-dom` 19.3.1; `vite` 8.3.6, `@vitejs/plugin-react` 6.2.1 (`devDependencies` — faqat build uchun).

`nginx.conf` (qo'llanmadagisining qisqartmasi):

```nginx
worker_processes auto;
pid /tmp/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    access_log off;
    error_log  /dev/stderr warn;

    server {
        listen       8080;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        location ~* \.(?:css|js|svg|png|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

- `pid /tmp/nginx.pid` — root bo'lmagan foydalanuvchi `/var/run` ga yoza olmaydi.
- `error_log /dev/stderr` — loglar `docker logs` ga (4-bob).
- `try_files $uri /index.html` — fayl bo'lsa uni, bo'lmasa `index.html` ni berish.
- Statik fayllarga bir yillik kesh: Vite fayl nomiga mazmun xeshini qo'shadi (`index-BLtOl1F9.js`) — fayl o'zgarsa, nomi ham o'zgaradi.

`Dockerfile` (qo'llanmadagi "Docker Official Image" varianti, Node.js 26 bilan):

```dockerfile
FROM node:26-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
```

`daemon off` — Nginx oldingi rejimda qolsin (konteynerning asosiy jarayoni, 8-bob).

## Yig'ish va tekshirish

```text vps
$ docker build -q -t spa:1 .
sha256:c8d7dacbc9d28c76f50889d2f7383a92a6889919a02f6fb7fffc2b9e0c32c3c1
$ docker image ls --format 'table {{.Repository}}:{{.Tag}}\t{{.Size}}' spa
REPOSITORY:TAG   SIZE
spa:1            91.4MB
$ docker run --rm spa:1 ls /usr/share/nginx/html /usr/share/nginx/html/assets
nginx: invalid option: "ls"
```

- Image — **91.4MB**: Node.js va `node_modules` umuman yo'q, faqat Nginx va statik fayllar.
- `docker run spa:1 ls` — `nginx: invalid option: "ls"`: 8-bobdagi qoida — `ENTRYPOINT` bor bo'lsa, argumentlar unga **qo'shiladi**. Ichini ko'rish uchun `ENTRYPOINT` ni almashtiramiz:

```text vps
$ docker run --rm --entrypoint ls spa:1 /usr/share/nginx/html /usr/share/nginx/html/assets
/usr/share/nginx/html:
50x.html
assets
index.html

/usr/share/nginx/html/assets:
index-BLtOl1F9.js
```

```text vps
$ docker run -d --name spa -p 127.0.0.1:8081:8080 spa:1
f3bfe4ea7a741ae64b86cb1c9d983621f0d909e6085674cb8b7790ee31404146
$ sleep 1; curl -s -o /dev/null -w '/        %{http_code}\n' http://127.0.0.1:8081/
/        200
$ curl -s -o /dev/null -w '/profil  %{http_code}\n' http://127.0.0.1:8081/profil
/profil  200
$ curl -s http://127.0.0.1:8081/profil | grep -o '<div id="root"></div>'
<div id="root"></div>
$ curl -sI http://127.0.0.1:8081/assets/$(docker exec spa ls /usr/share/nginx/html/assets | grep '\.js$') | grep -i cache-control
Cache-Control: max-age=31536000
Cache-Control: public, immutable
$ docker exec spa id
uid=101(nginx) gid=101(nginx) groups=101(nginx)
$ docker rm -f spa
spa
```

- `/` va `/profil` — ikkalasi ham `200`, `/profil` da `index.html` qaytdi: React manzilni o'zi o'qiydi.
- JS fayliga — `Cache-Control: public, immutable` va bir yil.
- `uid=101(nginx)` — root emas.

Fallback'siz nima bo'ladi — xuddi shu build, lekin image'ning standart Nginx sozlamasi bilan:

```text vps
$ docker build -q -f Dockerfile.fallbacksiz -t spa:fallbacksiz .
sha256:73d5788bd4ab1c698ae894a687ca7a6cf2aa42bbebb66e9f0ade7e469c085f75
$ docker run -d --name spa0 -p 127.0.0.1:8082:8080 spa:fallbacksiz
f311e9f2fb2afe65f6895fd80cead94a5ad10bfdeaf6a8e8e1d02bbbb542bf9d
$ sleep 1; curl -s -o /dev/null -w '/        %{http_code}\n' http://127.0.0.1:8082/
/        200
$ curl -s -o /dev/null -w '/profil  %{http_code}\n' http://127.0.0.1:8082/profil
/profil  404
$ docker rm -f spa0
spa0
```

`/profil` — **404**. Foydalanuvchi ichki sahifada "yangilash" tugmasini bossa yoki havolani to'g'ridan-to'g'ri ochsa, xato oladi. Bu SPA'ni konteynerga joylashdagi eng ko'p uchraydigan xato.

## Vue va Angular

Docker'ning Vue.js va Angular qo'llanmalari xuddi shu tuzilmani beradi (`nginx-unprivileged`, 8080, `try_files`). Farqlar:

- Vue (Vite) — natija `dist/`, Dockerfile React'nikidek.
- Angular — natija `dist/<loyiha>/browser/`: qo'llanmada `COPY --chown=nginx:nginx --from=builder /app/dist/*/browser /usr/share/nginx/html`; `try_files $uri $uri/ /index.html`.

## Tipik xatolar

**1. `try_files` siz Nginx.**
Ichki manzillarda 404.
To'g'risi: `try_files $uri /index.html`.

**2. SPA'ni `npm run dev` yoki Node server bilan production'da berish.**
Og'ir image va keraksiz jarayon.
To'g'risi: build → Nginx.

**3. Root Nginx va 80-port.**
To'g'risi: `nginx-unprivileged`, 8080, `USER nginx`.

**4. `index.html` ga ham uzoq kesh.**
Yangi versiya chiqqanda brauzer eski `index.html` ni (eski JS nomlari bilan) olib turadi.
To'g'risi: uzoq kesh faqat xeshli statik fayllarga; `index.html` — keshsiz yoki qisqa.

## Amaliyot

Savollar:

1. Nega SPA image'ida Node.js yo'q?
2. `try_files $uri /index.html` nima qiladi?
3. Nega Nginx 80 emas, 8080 da tinglaydi?
4. `docker run spa:1 ls` nega ishlamadi va qanday tuzatiladi?
5. Angular build natijasi qayerda?

<details>
<summary>Javoblar</summary>

1. Build'dan keyin SPA — statik fayllar; ularni Nginx beradi. Node.js faqat `builder` bosqichida.
2. So'ralgan fayl bo'lsa — uni, bo'lmasa `index.html` ni beradi: marshrutni brauzerdagi ilova hal qiladi.
3. `nginx-unprivileged` image'ining standarti shunday: Docker'da 20.03 dan beri shart emas, lekin boshqa runtime'lar uchun saqlangan (image README'si).
4. `ENTRYPOINT` (`nginx`) bor — `ls` uning argumenti bo'lib qoldi. `docker run --entrypoint ls spa:1 …`.
5. `dist/<loyiha>/browser/`.

</details>

## Rasmiy hujjat

- [Docker Guides: React.js](https://docs.docker.com/guides/reactjs/) — Dockerfile, `nginx-unprivileged`, `nginx.conf`, client-side routing
- [Docker Guides: Vue.js](https://docs.docker.com/guides/vuejs/) · [Docker Guides: Angular](https://docs.docker.com/guides/angular/)
- [nginx/docker-nginx-unprivileged (GitHub)](https://github.com/nginx/docker-nginx-unprivileged) — image README'si: port 8080, root'siz
- [NGINX: try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

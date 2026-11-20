# Haqiqiy brauzer (headless Chromium): CORS kabi faqat brauzer qo'llaydigan qoidalar uchun. Profil "brauzer".
FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends chromium tcpdump iproute2 ethtool ca-certificates && rm -rf /var/lib/apt/lists/*
COPY start.sh /start.sh
CMD ["sh", "/start.sh"]

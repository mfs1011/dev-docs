FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends curl tcpdump iproute2 ethtool bind9-dnsutils && rm -rf /var/lib/apt/lists/*
COPY start.sh /start.sh
CMD ["sh", "/start.sh"]

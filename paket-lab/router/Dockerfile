FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends iptables iproute2 ethtool tcpdump && rm -rf /var/lib/apt/lists/*
COPY start.sh /start.sh
CMD ["sh", "/start.sh"]

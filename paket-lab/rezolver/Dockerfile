FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends unbound tcpdump iproute2 ethtool && rm -rf /var/lib/apt/lists/*
COPY start.sh lab.conf ildiz.hints /etc/unbound/
CMD ["sh", "/etc/unbound/start.sh"]

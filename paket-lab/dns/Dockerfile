FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends dnsmasq && rm -rf /var/lib/apt/lists/*
CMD ["dnsmasq", "--no-daemon", "--no-resolv", "--no-hosts", "--local=/test/", "--host-record=sayt.test,203.0.113.10", "--log-queries"]

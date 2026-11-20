FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
COPY yuk.py tekshir.py /
CMD ["sleep", "infinity"]

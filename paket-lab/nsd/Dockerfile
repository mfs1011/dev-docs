FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends nsd && rm -rf /var/lib/apt/lists/*
# Har xizmat o'z sozlamasini (lab.conf va zona fayli) /etc/nsd/lab ga ulaydi
CMD ["nsd", "-d", "-c", "/etc/nsd/lab/lab.conf"]

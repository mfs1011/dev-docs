FROM debian:bookworm
RUN apt-get update -q && apt-get install -y -q --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
COPY app.py /app.py
CMD ["python3", "/app.py"]

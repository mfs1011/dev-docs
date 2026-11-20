FROM python:3.13-slim
RUN pip install --no-cache-dir "psycopg[binary]==3.2.13" "redis==6.4.0"
COPY app.py /app.py
CMD ["python3", "/app.py"]

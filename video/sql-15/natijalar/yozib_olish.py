#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X"]
MY_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "qollanma", "-e"]
SQLITE_BIN = "/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3"

def run_pg(sql):
    p = subprocess.run(PG_CMD, input=sql, text=True, capture_output=True, env=PG_ENV)
    return (p.stdout + p.stderr).strip()

def run_my(sql):
    p = subprocess.run(MY_CMD + [sql], capture_output=True, text=True)
    return (p.stdout + p.stderr).strip()

def run_sqlite(sql):
    p = subprocess.run([SQLITE_BIN, "-box", ":memory:"], input=sql, text=True, capture_output=True)
    return (p.stdout + p.stderr).strip()

out = {"pg": {}, "mysql": {}, "sqlite": {}}

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["virtual_and_stored"] = run_pg("""
DROP TABLE IF EXISTS buyurtma_qatorlari CASCADE;
CREATE TABLE buyurtma_qatorlari (
    id        integer PRIMARY KEY,
    narx      numeric(12,2) NOT NULL,
    soni      integer NOT NULL,
    summa     numeric(14,2) GENERATED ALWAYS AS (narx * soni),
    summa_s   numeric(14,2) GENERATED ALWAYS AS (narx * soni) STORED
);
INSERT INTO buyurtma_qatorlari (id, narx, soni) VALUES (1, 4000, 3), (2, 12000, 2);
SELECT * FROM buyurtma_qatorlari;
""")

out["pg"]["update_demo"] = run_pg("""
UPDATE buyurtma_qatorlari SET soni = 5 WHERE id = 1;
SELECT id, soni, summa, summa_s FROM buyurtma_qatorlari WHERE id = 1;
""")

out["pg"]["catalog_check"] = run_pg("""
SELECT attname, attgenerated FROM pg_attribute
WHERE attrelid = 'buyurtma_qatorlari'::regclass AND attname LIKE 'summa%';
""")

out["pg"]["cannot_insert_non_default"] = run_pg("""
INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (3, 1, 1, 999);
""")

out["pg"]["disallowed_now"] = run_pg("""
DROP TABLE IF EXISTS xato1 CASCADE;
CREATE TABLE xato1 (a int, vaqt timestamptz GENERATED ALWAYS AS (now()) STORED);
""")

out["pg"]["disallowed_chain"] = run_pg("""
DROP TABLE IF EXISTS xato2 CASCADE;
CREATE TABLE xato2 (a int, b int GENERATED ALWAYS AS (a * 2), c int GENERATED ALWAYS AS (b + 1));
DROP TABLE IF EXISTS buyurtma_qatorlari, xato1, xato2 CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_gen"] = run_my("""
DROP TABLE IF EXISTS buyurtma_my;
CREATE TABLE buyurtma_my (
    id INT PRIMARY KEY,
    narx DECIMAL(12,2) NOT NULL,
    soni INT NOT NULL,
    summa DECIMAL(14,2) AS (narx * soni),
    summa_s DECIMAL(14,2) AS (narx * soni) STORED,
    jami_qqs DECIMAL(14,2) AS (summa * 1.12),
    INDEX (summa)
);
INSERT INTO buyurtma_my (id, narx, soni) VALUES (1, 4000, 3);
SELECT * FROM buyurtma_my;
""")

out["mysql"]["mysql_err"] = run_my("""
INSERT INTO buyurtma_my (id, narx, soni, summa) VALUES (2, 1, 1, 5);
CREATE TABLE xato (a INT, v DATETIME AS (NOW()));
DROP TABLE IF EXISTS buyurtma_my;
""")

print("SQLite sinovlari...")
out["sqlite"]["sqlite_gen"] = run_sqlite("""
CREATE TABLE q (
    id INTEGER PRIMARY KEY, narx NUMERIC, soni INT,
    summa NUMERIC AS (narx * soni),
    summa_s NUMERIC AS (narx * soni) STORED,
    ikki_baravar AS (summa * 2)
);
INSERT INTO q (narx, soni) VALUES (4000, 3);
SELECT * FROM q;
""")

out["sqlite"]["sqlite_alter_stored_err"] = run_sqlite("""
CREATE TABLE q2 (id INTEGER PRIMARY KEY, soni INT);
INSERT INTO q2 (soni) VALUES (1);
ALTER TABLE q2 ADD COLUMN v2 AS (soni + 1);
ALTER TABLE q2 ADD COLUMN s2 AS (soni + 1) STORED;
""")

print("Natijalar tty.js ga yozilmoqda...")
os.makedirs("video/sql-15/natijalar", exist_ok=True)
with open("video/sql-15/natijalar/tty.js", "w") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Tayyor!")

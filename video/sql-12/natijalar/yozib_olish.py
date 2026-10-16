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
out["pg"]["create_default"] = run_pg("""
DROP TABLE IF EXISTS mahsulotlar CASCADE;
CREATE TABLE mahsulotlar (
    id          integer,
    nom         text,
    narx        numeric(12,2) DEFAULT 0,
    soni        integer DEFAULT 1,
    yaratilgan  timestamptz DEFAULT now()
);
INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non');
INSERT INTO mahsulotlar VALUES (2, 'Sut', DEFAULT, 5, DEFAULT);
INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');
INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');
SELECT id, nom, narx, soni, yaratilgan IS NOT NULL AS vaqt_bor FROM mahsulotlar;
""")

out["pg"]["sys_cols"] = run_pg("""
SELECT ctid, xmin, tableoid::regclass, id, nom FROM mahsulotlar;
UPDATE mahsulotlar SET soni = 2 WHERE id = 1;
SELECT ctid, xmin, id, soni FROM mahsulotlar WHERE id = 1;
""")

out["pg"]["sys_err"] = run_pg("CREATE TABLE xato (ctid int);")

out["pg"]["like_demo"] = run_pg("""
DROP TABLE IF EXISTS nusxa, nusxa2 CASCADE;
CREATE TABLE nusxa  (LIKE mahsulotlar);
CREATE TABLE nusxa2 (LIKE mahsulotlar INCLUDING DEFAULTS);
INSERT INTO nusxa  (id, nom) VALUES (1, 'test');
INSERT INTO nusxa2 (id, nom) VALUES (1, 'test');
SELECT 'nusxa' AS jadval, narx, soni FROM nusxa
UNION ALL
SELECT 'nusxa2', narx, soni FROM nusxa2;
""")

out["pg"]["temp_unlogged"] = run_pg("""
DROP TABLE IF EXISTS kesh CASCADE;
CREATE TEMP TABLE vaqtinchalik (x int);
CREATE UNLOGGED TABLE kesh (k text, v text);
SELECT relname, relpersistence FROM pg_class
WHERE relname IN ('mahsulotlar', 'vaqtinchalik', 'kesh');
DROP TABLE IF EXISTS mahsulotlar, nusxa, nusxa2, kesh CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["expr_err"] = run_my("CREATE TABLE xato1 (d DATE DEFAULT CURRENT_DATE + INTERVAL 1 YEAR);")
out["mysql"]["blob_err"] = run_my("CREATE TABLE xato2 (t TEXT DEFAULT 'abc');")
out["mysql"]["blob_ok"] = run_my("CREATE TABLE togri2 (t TEXT DEFAULT ('abc')); DROP TABLE togri2;")

out["mysql"]["invisible_demo"] = run_my("""
DROP TABLE IF EXISTS mahsulotlar_my;
CREATE TABLE mahsulotlar_my (
    id INT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    izoh VARCHAR(100) INVISIBLE
);
INSERT INTO mahsulotlar_my (id, nom, izoh) VALUES (1, 'Non', 'Maxfiy eslatma');
SELECT * FROM mahsulotlar_my;
SELECT id, izoh FROM mahsulotlar_my;
DROP TABLE mahsulotlar_my;
""")

print("SQLite sinovlari...")
out["sqlite"]["default_demo"] = run_sqlite("""
CREATE TABLE mahsulotlar (
    id INTEGER,
    nom TEXT,
    narx NUMERIC DEFAULT 0,
    kod BLOB DEFAULT (randomblob(8)),
    yaratilgan TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non'), (2, 'Sut');
SELECT rowid, id, nom, narx, hex(kod) AS kod_hex, yaratilgan FROM mahsulotlar;
""")

out["sqlite"]["expr_err"] = run_sqlite("CREATE TABLE xato (d TEXT DEFAULT current_timestamp + 1);")

print("Natijalar tty.js ga yozilmoqda...")
with open("tty.js", "w") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Tayyor!")

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
out["pg"]["bool_sel"] = run_pg("""
DROP TABLE IF EXISTS vazifalar;
CREATE TABLE vazifalar (nom text, bajarildi boolean);
INSERT INTO vazifalar VALUES ('xat', TRUE), ('qongiroq', 'no'), ('hisobot', 'on'), ('sinov', NULL);
SELECT * FROM vazifalar;
""")

out["pg"]["bool_int_err"] = run_pg("INSERT INTO vazifalar VALUES ('xato', 2);")

out["pg"]["bool_null_where"] = run_pg("""
SELECT nom FROM vazifalar WHERE bajarildi;
SELECT nom FROM vazifalar WHERE NOT bajarildi;
SELECT nom, bajarildi IS NOT TRUE AS bajarilmagan FROM vazifalar;
DROP TABLE vazifalar;
""")

out["pg"]["uuid_demo"] = run_pg("""
SELECT uuid_extract_version(uuidv4()) AS v4_ver,
       uuid_extract_version(uuidv7()) AS v7_ver;
SELECT pg_column_size(uuidv4()) AS uuid_bayt, pg_column_size(uuidv4()::text) AS matn_bayt;
""")

out["pg"]["enum_demo"] = run_pg("""
DROP TABLE IF EXISTS murojaatlar;
DROP TYPE IF EXISTS holat CASCADE;
CREATE TYPE holat AS ENUM ('yangi', 'jarayonda', 'yopildi');
CREATE TABLE murojaatlar (id int, h holat);
INSERT INTO murojaatlar VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');
SELECT * FROM murojaatlar ORDER BY h;
""")

out["pg"]["enum_invalid_err"] = run_pg("INSERT INTO murojaatlar VALUES (4, 'bekor');")

out["pg"]["enum_alter"] = run_pg("""
ALTER TYPE holat ADD VALUE 'bekor' BEFORE 'yopildi';
SELECT enum_range(NULL::holat);
DROP TABLE murojaatlar;
DROP TYPE holat;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["bool_trap"] = run_my("""
DROP TABLE IF EXISTS vazifalar;
CREATE TABLE vazifalar (nom VARCHAR(20), bajarildi BOOLEAN);
INSERT INTO vazifalar VALUES ('xat', TRUE), ('qongiroq', FALSE), ('xato', 2), ('salbiy', -5);
SELECT nom, bajarildi, bajarildi = TRUE AS teng_true, IF(bajarildi, 'ha', 'yoq') AS shart FROM vazifalar;
DROP TABLE vazifalar;
""")

out["mysql"]["uuid_to_bin"] = run_my("""
SELECT HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db')) AS oddiy,
       HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db', 1)) AS almashtirilgan;
""")

out["mysql"]["enum_demo"] = run_my("""
DROP TABLE IF EXISTS murojaatlar;
CREATE TABLE murojaatlar (id INT, h ENUM('yangi', 'jarayonda', 'yopildi') NOT NULL);
INSERT INTO murojaatlar VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');
SELECT id, h, h + 0 AS indeks FROM murojaatlar ORDER BY h;
DROP TABLE murojaatlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["bool_demo"] = run_sqlite("""
CREATE TABLE v (b BOOLEAN);
INSERT INTO v VALUES (TRUE), (2), ('ha');
SELECT b, typeof(b) FROM v;
""")

out["sqlite"]["no_uuid_err"] = run_sqlite("SELECT uuid();")

out_file = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! Natijalar: {out_file}")

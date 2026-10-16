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
out["pg"]["add_columns"] = run_pg("""
DROP TABLE IF EXISTS qatorlar, mahsulotlar CASCADE;
CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text, narx text);
CREATE TABLE qatorlar (id int PRIMARY KEY, mahsulot_id int REFERENCES mahsulotlar);
INSERT INTO mahsulotlar VALUES (1, 'Non', '4000'), (2, 'Sut', '12000');
INSERT INTO qatorlar VALUES (10, 1);
ALTER TABLE mahsulotlar ADD COLUMN tavsif text CHECK (tavsif <> '');
ALTER TABLE mahsulotlar ADD COLUMN soni integer NOT NULL DEFAULT 0;
SELECT * FROM mahsulotlar ORDER BY id;
""")

out["pg"]["type_using_err"] = run_pg("""
ALTER TABLE mahsulotlar ALTER COLUMN narx TYPE numeric(12,2);
""")

out["pg"]["type_using_fix"] = run_pg("""
ALTER TABLE mahsulotlar ALTER COLUMN narx TYPE numeric(12,2) USING narx::numeric;
ALTER TABLE mahsulotlar ALTER COLUMN nom SET NOT NULL;
ALTER TABLE mahsulotlar ADD CONSTRAINT musbat_narx CHECK (narx > 0);
ALTER TABLE mahsulotlar ALTER COLUMN soni SET DEFAULT 1;
ALTER TABLE mahsulotlar RENAME COLUMN nom TO nomi;
\\d mahsulotlar
""")

out["pg"]["drop_cascade_demo"] = run_pg("""
DROP TABLE mahsulotlar;
""")

out["pg"]["drop_cascade_rollback"] = run_pg("""
BEGIN;
DROP TABLE mahsulotlar CASCADE;
\\d qatorlar
ROLLBACK;
SELECT count(*) AS mahsulotlar_qaytdi FROM mahsulotlar;
""")

out["pg"]["truncate_demo"] = run_pg("""
TRUNCATE mahsulotlar;
""")

out["pg"]["truncate_rollback"] = run_pg("""
BEGIN;
TRUNCATE qatorlar;
ROLLBACK;
SELECT count(*) AS qatorlar_qaytdi FROM qatorlar;
DROP TABLE IF EXISTS qatorlar, mahsulotlar CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["alter_instant"] = run_my("""
DROP TABLE IF EXISTS mahsulot_my;
CREATE TABLE mahsulot_my (id INT PRIMARY KEY, nom VARCHAR(50), narx VARCHAR(20));
INSERT INTO mahsulot_my VALUES (1, 'Non', '4000'), (2, 'Sut', '12000');
ALTER TABLE mahsulot_my ADD COLUMN soni INT NOT NULL DEFAULT 0, ALGORITHM = INSTANT;
ALTER TABLE mahsulot_my MODIFY COLUMN narx DECIMAL(12,2);
ALTER TABLE mahsulot_my RENAME COLUMN nom TO nomi;
SELECT * FROM mahsulot_my;
""")

out["mysql"]["implicit_commit"] = run_my("""
START TRANSACTION;
INSERT INTO mahsulot_my (id, nomi, narx) VALUES (3, 'Choy', 9000);
ALTER TABLE mahsulot_my ADD COLUMN izoh VARCHAR(100);
ROLLBACK;
SELECT id, nomi FROM mahsulot_my ORDER BY id;
DROP TABLE IF EXISTS mahsulot_my;
""")

print("SQLite sinovlari...")
out["sqlite"]["alter_demo"] = run_sqlite("""
CREATE TABLE m (id INTEGER PRIMARY KEY, nom TEXT UNIQUE, narx TEXT);
INSERT INTO m VALUES (1, 'Non', '4000');
ALTER TABLE m ADD COLUMN soni INTEGER NOT NULL DEFAULT 0;
ALTER TABLE m RENAME COLUMN nom TO nomi;
ALTER TABLE m DROP COLUMN narx;
SELECT sql FROM sqlite_schema WHERE name = 'm';
""")

out["sqlite"]["alter_err"] = run_sqlite("""
CREATE TABLE m2 (id INTEGER PRIMARY KEY);
ALTER TABLE m2 ADD COLUMN yaratilgan TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE m2 ADD COLUMN kod TEXT UNIQUE;
""")

print("Natijalar tty.js ga yozilmoqda...")
os.makedirs("video/sql-16/natijalar", exist_ok=True)
with open("video/sql-16/natijalar/tty.js", "w") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Tayyor!")

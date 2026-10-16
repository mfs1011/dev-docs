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
out["pg"]["check_err"] = run_pg("""
DROP TABLE IF EXISTS mahsulotlar CASCADE;
CREATE TABLE mahsulotlar (
    id        integer PRIMARY KEY,
    nom       text NOT NULL,
    narx      numeric CONSTRAINT musbat_narx CHECK (narx > 0),
    chegirma  numeric CHECK (chegirma > 0),
    sku       text UNIQUE,
    CHECK (narx > chegirma)
);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, 3500, 'NON-1');
INSERT INTO mahsulotlar VALUES (2, 'Sut', -5, NULL, 'SUT-1');
""")

out["pg"]["table_check_err"] = run_pg("""
INSERT INTO mahsulotlar VALUES (3, 'Choy', 9000, 9500, 'CHOY-1');
""")

out["pg"]["null_check_pass"] = run_pg("""
INSERT INTO mahsulotlar VALUES (4, 'Tuz', NULL, NULL, NULL);
SELECT id, nom, narx, chegirma FROM mahsulotlar WHERE id IN (1, 4);
""")

out["pg"]["unique_nulls"] = run_pg("""
DROP TABLE IF EXISTS t_unique CASCADE;
CREATE TABLE t_unique (kod text UNIQUE NULLS NOT DISTINCT);
INSERT INTO t_unique VALUES (NULL);
INSERT INTO t_unique VALUES (NULL);
""")

out["pg"]["fk_cascade_restrict"] = run_pg("""
DROP TABLE IF EXISTS ota, bola_cascade, bola_restrict CASCADE;
CREATE TABLE ota (id int PRIMARY KEY, nom text);
CREATE TABLE bola_cascade (id int PRIMARY KEY, ota_id int REFERENCES ota(id) ON DELETE CASCADE);
CREATE TABLE bola_restrict (id int PRIMARY KEY, ota_id int REFERENCES ota(id) ON DELETE RESTRICT);
INSERT INTO ota VALUES (1, 'Ota-1'), (2, 'Ota-2');
INSERT INTO bola_cascade VALUES (10, 1);
INSERT INTO bola_restrict VALUES (20, 2);
DELETE FROM ota WHERE id = 1;
SELECT * FROM bola_cascade;
DELETE FROM ota WHERE id = 2;
""")

out["pg"]["deferrable_demo"] = run_pg("""
DROP TABLE IF EXISTS aylana CASCADE;
CREATE TABLE aylana (
    id int PRIMARY KEY,
    keyingi int REFERENCES aylana(id) DEFERRABLE INITIALLY DEFERRED
);
BEGIN;
INSERT INTO aylana VALUES (1, 2);
INSERT INTO aylana VALUES (2, 1);
COMMIT;
SELECT * FROM aylana;
DROP TABLE IF EXISTS aylana, ota, bola_cascade, bola_restrict, mahsulotlar, t_unique CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["check_demo"] = run_my("""
DROP TABLE IF EXISTS mahsulot_my;
CREATE TABLE mahsulot_my (
    id INT PRIMARY KEY,
    narx DECIMAL(10,2) CHECK (narx > 0)
);
INSERT INTO mahsulot_my VALUES (1, -10);
""")

out["mysql"]["fk_auto_index"] = run_my("""
DROP TABLE IF EXISTS bola_my, ota_my;
CREATE TABLE ota_my (id INT PRIMARY KEY);
CREATE TABLE bola_my (id INT PRIMARY KEY, ota_id INT, FOREIGN KEY (ota_id) REFERENCES ota_my(id));
SHOW INDEX FROM bola_my;
DROP TABLE bola_my, ota_my;
""")

print("SQLite sinovlari...")
out["sqlite"]["fk_pragma_demo"] = run_sqlite("""
PRAGMA foreign_keys;
CREATE TABLE ota_sq (id INTEGER PRIMARY KEY);
CREATE TABLE bola_sq (id INTEGER PRIMARY KEY, ota_id INTEGER REFERENCES ota_sq(id));
INSERT INTO bola_sq VALUES (1, 999);
SELECT * FROM bola_sq;
PRAGMA foreign_keys = ON;
INSERT INTO bola_sq VALUES (2, 999);
""")

print("Natijalar tty.js ga yozilmoqda...")
with open("video/sql-14/natijalar/tty.js", "w") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Tayyor!")

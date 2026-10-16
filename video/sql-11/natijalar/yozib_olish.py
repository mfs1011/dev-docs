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
out["pg"]["enc"] = run_pg("""
SHOW server_encoding;
SHOW client_encoding;
SELECT datcollate, datctype, datlocprovider FROM pg_database WHERE datname = current_database();
""")

out["pg"]["uz_sort"] = run_pg("""
DROP TABLE IF EXISTS sozlar;
CREATE TABLE sozlar (s text);
INSERT INTO sozlar VALUES ('olma'), ('Oʻrik'), ('zarda'), ('shaftoli'), ('sabzi'),
                          ('gʻoz'), ('gilos'), ('choy'), ('Anor'), ('banan');
SELECT string_agg(s, ', ' ORDER BY s COLLATE "C") AS c_tartib FROM sozlar;
SELECT string_agg(s, ', ' ORDER BY s) AS default_en_us FROM sozlar;
SELECT string_agg(s, ', ' ORDER BY s COLLATE "uz-Latn-x-icu") AS uz_icu FROM sozlar;
""")

out["pg"]["case_ci"] = run_pg("""
SELECT upper('oʻzbek') AS u, lower('ISTANBUL') AS l, lower('ISTANBUL' COLLATE "tr-x-icu") AS turk;
DROP COLLATION IF EXISTS ci CASCADE;
CREATE COLLATION ci (provider = icu, locale = 'und-u-ks-level2', deterministic = false);
SELECT 'Salom' = 'salom' AS oddiy,
       'Salom' = 'salom' COLLATE ci AS ci_bilan,
       'Salom' = 'Sàlom' COLLATE ci AS urgu;
""")

out["pg"]["unique_email_err"] = run_pg("""
DROP TABLE IF EXISTS foydalanuvchilar;
CREATE TABLE foydalanuvchilar (email text COLLATE ci UNIQUE);
INSERT INTO foydalanuvchilar VALUES ('Ali@Mail.uz');
INSERT INTO foydalanuvchilar VALUES ('ali@mail.uz');
SELECT * FROM foydalanuvchilar WHERE email LIKE 'ALI%';
DROP TABLE foydalanuvchilar;
DROP TABLE sozlar;
DROP COLLATION ci;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["enc"] = run_my("""
SELECT @@character_set_server, @@collation_server, @@character_set_client;
""")

out["mysql"]["ci_demo"] = run_my("""
SELECT 'Salom' = 'salom' AS katta_kichik, 'e' = 'é' AS urgu,
       'Salom' = 'salom' COLLATE utf8mb4_bin AS bin_bilan,
       'e' = 'é' COLLATE utf8mb4_0900_as_cs AS as_cs;
""")

out["mysql"]["emoji_err"] = run_my("""
DROP TABLE IF EXISTS eski;
CREATE TABLE eski (s VARCHAR(10)) CHARACTER SET utf8mb3;
INSERT INTO eski VALUES ('salom 😀');
DROP TABLE eski;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["enc_col"] = run_sqlite("""
PRAGMA encoding;
SELECT 'Salom' = 'salom' AS binary_,
       'Salom' = 'salom' COLLATE NOCASE AS nocase,
       'Ölma' = 'ölma' COLLATE NOCASE AS nocase_unicode,
       'ab' = 'ab  ' COLLATE RTRIM AS rtrim;
SELECT upper('salom') AS ascii, upper('ölma oʻrik') AS unicode, upper('тошкент') AS kirill;
""")

out_file = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! Natijalar: {out_file}")

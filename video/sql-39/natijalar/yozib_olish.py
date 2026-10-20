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
out["pg"]["version"] = run_pg("SELECT version();")
out["pg"]["indexes"] = run_pg("""
DROP TABLE IF EXISTS k_bigint, k_v4, k_v7 CASCADE;
CREATE TABLE k_bigint (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, x int);
CREATE TABLE k_v4     (id uuid DEFAULT uuidv4() PRIMARY KEY, x int);
CREATE TABLE k_v7     (id uuid DEFAULT uuidv7() PRIMARY KEY, x int);

INSERT INTO k_bigint (x) SELECT g FROM generate_series(1, 100000) g;
INSERT INTO k_v4     (x) SELECT g FROM generate_series(1, 100000) g;
INSERT INTO k_v7     (x) SELECT g FROM generate_series(1, 100000) g;

SELECT relname, pg_size_pretty(pg_relation_size(relname::regclass)) AS indeks
FROM (VALUES ('k_bigint_pkey'), ('k_v4_pkey'), ('k_v7_pkey')) v(relname);

SELECT pg_column_size(1::bigint) AS bigint_bayt, pg_column_size(uuidv7()) AS uuid_bayt;
SELECT uuid_extract_timestamp(uuidv7()) AS v7_timestamp;
""")

print("MySQL 9.7.2 sinovlari...")
out["mysql"]["version"] = run_my("SELECT VERSION();")
out["mysql"]["indexes"] = run_my("""
SET SESSION cte_max_recursion_depth = 60000;
DROP TABLE IF EXISTS k_int, k_char, k_bin;
CREATE TABLE k_int  (id int AUTO_INCREMENT PRIMARY KEY, x int, KEY (x));
CREATE TABLE k_char (id char(36)   PRIMARY KEY, x int, KEY (x));
CREATE TABLE k_bin  (id binary(16) PRIMARY KEY, x int, KEY (x));

INSERT INTO k_int (x)
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 50000) SELECT n FROM g;
INSERT INTO k_char (id, x)
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 50000) SELECT UUID(), n FROM g;
INSERT INTO k_bin (id, x)
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 50000) SELECT UUID_TO_BIN(UUID(), 1), n FROM g;

ANALYZE TABLE k_int, k_char, k_bin;
SELECT table_name, ROUND(data_length/1024/1024,1) AS data_mb,
       ROUND(index_length/1024/1024,1) AS ikkilamchi_mb
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name IN ('k_int','k_char','k_bin')
ORDER BY data_length;
""")

print("SQLite 3.54.0 sinovlari...")
out["sqlite"]["version"] = run_sqlite("SELECT sqlite_version();")
out["sqlite"]["without_rowid"] = run_sqlite("""
CREATE TABLE wordcount (word TEXT PRIMARY KEY, cnt INTEGER) WITHOUT ROWID;
INSERT INTO wordcount VALUES ('salom', 3), ('dunyo', 1);
SELECT rowid, word FROM wordcount;
""")

out["sqlite"]["oddiy"] = run_sqlite("""
CREATE TABLE oddiy (word TEXT PRIMARY KEY, cnt INTEGER);
INSERT INTO oddiy VALUES ('salom', 3);
SELECT rowid, word FROM oddiy;
""")

out["sqlite"]["errors"] = run_sqlite("""
CREATE TABLE xpk (a INTEGER) WITHOUT ROWID;
""")

out["sqlite"]["errors_ai"] = run_sqlite("""
CREATE TABLE xai (id INTEGER PRIMARY KEY AUTOINCREMENT, a) WITHOUT ROWID;
""")

out["sqlite"]["wi_null"] = run_sqlite("""
CREATE TABLE wi (id INTEGER PRIMARY KEY, a) WITHOUT ROWID;
INSERT INTO wi (a) VALUES ('x');
""")

out["sqlite"]["ri_ok"] = run_sqlite("""
CREATE TABLE ri (id INTEGER PRIMARY KEY, a);
INSERT INTO ri (a) VALUES ('x');
SELECT id, rowid FROM ri;
""")

# Save outputs to tty.js
tty_js = f"""// Auto-generated live database test runs for SQL Chapter 39
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

export const tty = {json.dumps(out, indent=2, ensure_ascii=False)};
"""

with open("video/sql-39/natijalar/tty.js", "w", encoding="utf-8") as f:
    f.write(tty_js)

print("Tamomlandi! video/sql-39/natijalar/tty.js yozildi.")

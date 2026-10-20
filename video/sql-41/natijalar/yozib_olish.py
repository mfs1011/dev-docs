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
out["pg"]["seq_scan"] = run_pg("""
DROP TABLE IF EXISTS buyurtmalar CASCADE;
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int NOT NULL, holat text NOT NULL, summa int NOT NULL);
INSERT INTO buyurtmalar
SELECT g, (g % 10000) + 1,
       CASE WHEN g % 50 = 0 THEN 'yangi' ELSE 'yopilgan' END,
       (g * 37) % 100000
FROM generate_series(1, 100000) g;
ANALYZE buyurtmalar;

EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
""")

out["pg"]["index_scan"] = run_pg("""
CREATE INDEX buyurtmalar_mijoz_idx ON buyurtmalar (mijoz_id);
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
""")

out["pg"]["selectivity"] = run_pg("""
CREATE INDEX buyurtmalar_holat_idx ON buyurtmalar (holat);
ANALYZE buyurtmalar;

EXPLAIN (COSTS OFF) SELECT count(*) FROM buyurtmalar WHERE holat = 'yangi';
EXPLAIN (COSTS OFF) SELECT count(*) FROM buyurtmalar WHERE holat = 'yopilgan';
""")

out["pg"]["sizes"] = run_pg("""
SELECT relname, pg_size_pretty(pg_relation_size(oid)) FROM pg_class
WHERE relname IN ('buyurtmalar', 'buyurtmalar_pkey', 'buyurtmalar_mijoz_idx', 'buyurtmalar_holat_idx')
ORDER BY relname;
""")

print("MySQL 9.7.2 sinovlari...")
out["mysql"]["version"] = run_my("SELECT VERSION();")
out["mysql"]["explain"] = run_my("""
DROP TABLE IF EXISTS buyurtmalar;
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int NOT NULL, holat varchar(20) NOT NULL, summa int NOT NULL, KEY (mijoz_id));
INSERT INTO buyurtmalar VALUES (1, 777, 'yangi', 50000), (2, 777, 'yopilgan', 75000), (3, 888, 'yangi', 20000);

EXPLAIN FORMAT=TREE SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
EXPLAIN FORMAT=TREE SELECT id FROM buyurtmalar WHERE mijoz_id = 777;
""")

print("SQLite 3.54.0 sinovlari...")
out["sqlite"]["version"] = run_sqlite("SELECT sqlite_version();")
out["sqlite"]["explain"] = run_sqlite("""
CREATE TABLE buyurtmalar (id INTEGER PRIMARY KEY, mijoz_id INT NOT NULL, holat TEXT NOT NULL, summa INT NOT NULL);
CREATE INDEX buyurtmalar_mijoz_idx ON buyurtmalar (mijoz_id);

EXPLAIN QUERY PLAN SELECT * FROM buyurtmalar WHERE id = 777;
EXPLAIN QUERY PLAN SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
EXPLAIN QUERY PLAN SELECT id FROM buyurtmalar WHERE mijoz_id = 777;
""")

# Save outputs to tty.js with UMD wrapper
tty_js = f"""// Auto-generated live database test runs for SQL Chapter 41
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {{
  g.TTY = {json.dumps(out, indent=2, ensure_ascii=False)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-41/natijalar/tty.js", "w", encoding="utf-8") as f:
    f.write(tty_js)

print("Tamomlandi! video/sql-41/natijalar/tty.js yozildi.")

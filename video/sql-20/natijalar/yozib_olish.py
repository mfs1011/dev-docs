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
out["pg"]["on_conflict_demo"] = run_pg("""
DROP TABLE IF EXISTS lugat CASCADE;
CREATE TABLE lugat (soz text PRIMARY KEY, soni int NOT NULL DEFAULT 1);
INSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1 RETURNING *, (old.soz IS NULL) AS yangi;
INSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1 RETURNING *, (old.soz IS NULL) AS yangi;
INSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5) ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + EXCLUDED.soni RETURNING soz, old.soni AS eski, new.soni AS yangi;
DROP TABLE IF EXISTS lugat CASCADE;
""")

out["pg"]["merge_demo"] = run_pg("""
DROP TABLE IF EXISTS ombor, yangi_kelgan CASCADE;
CREATE TABLE ombor (sku text PRIMARY KEY, soni int, narx numeric);
CREATE TABLE yangi_kelgan (sku text, soni int, narx numeric, ochirilsin boolean DEFAULT false);
INSERT INTO ombor VALUES ('NON', 10, 4000), ('SUT', 5, 12000), ('CHOY', 3, 9000);
INSERT INTO yangi_kelgan VALUES ('NON', 20, 4200, false), ('TUZ', 30, 2000, false), ('CHOY', 0, 0, true);

MERGE INTO ombor o
USING yangi_kelgan y ON o.sku = y.sku
WHEN MATCHED AND y.ochirilsin THEN DELETE
WHEN MATCHED THEN UPDATE SET soni = o.soni + y.soni, narx = y.narx
WHEN NOT MATCHED THEN INSERT (sku, soni, narx) VALUES (y.sku, y.soni, y.narx)
RETURNING merge_action(), o.*;

SELECT * FROM ombor ORDER BY sku;
DROP TABLE IF EXISTS ombor, yangi_kelgan CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["upsert_demo"] = run_my("""
DROP TABLE IF EXISTS lugat;
CREATE TABLE lugat (id INT AUTO_INCREMENT PRIMARY KEY, soz VARCHAR(30) UNIQUE, soni INT NOT NULL DEFAULT 1);
INSERT INTO lugat (soz) VALUES ('olma') ON DUPLICATE KEY UPDATE soni = soni + 1;
SELECT ROW_COUNT() AS rc_1;
INSERT INTO lugat (soz) VALUES ('olma') ON DUPLICATE KEY UPDATE soni = soni + 1;
SELECT ROW_COUNT() AS rc_2;
INSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5) AS new ON DUPLICATE KEY UPDATE soni = lugat.soni + new.soni;
SELECT * FROM lugat ORDER BY id;
""")

out["mysql"]["replace_demo"] = run_my("""
REPLACE INTO lugat (id, soz, soni) VALUES (1, 'olma', 100);
SELECT ROW_COUNT() AS rc_replace;
REPLACE INTO lugat (soz) VALUES ('nok');
SELECT * FROM lugat ORDER BY id;
DROP TABLE IF EXISTS lugat;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_demo"] = run_sqlite("""
CREATE TABLE lugat (id INTEGER PRIMARY KEY AUTOINCREMENT, soz TEXT UNIQUE, soni INT NOT NULL DEFAULT 1);
INSERT INTO lugat (soz, soni) VALUES ('olma', 5), ('nok', 10) ON CONFLICT (soz) DO UPDATE SET soni = soni + excluded.soni RETURNING *;
INSERT INTO lugat (id, soz) VALUES (1, 'yangi') ON CONFLICT (soz) DO NOTHING ON CONFLICT (id) DO UPDATE SET soz = excluded.soz RETURNING *;
INSERT OR REPLACE INTO lugat (soz, soni) VALUES ('nok', 1);
SELECT * FROM lugat;
""")

js_content = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
target = os.path.join(os.path.dirname(__file__), "tty.js")
with open(target, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Natijalar yozildi: {target}")

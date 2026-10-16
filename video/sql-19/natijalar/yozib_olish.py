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
out["pg"]["insert_returning"] = run_pg("""
DROP TABLE IF EXISTS mijozlar, arxiv CASCADE;
CREATE TABLE mijozlar (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ism text NOT NULL,
    yaratilgan timestamptz NOT NULL DEFAULT now(),
    balans numeric NOT NULL DEFAULT 0
);
INSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;
INSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir') RETURNING id, ism, (yaratilgan IS NOT NULL) AS vaqt;
""")

out["pg"]["update_old_new"] = run_pg("""
UPDATE mijozlar SET balans = balans + 50000 WHERE ism IN ('Ali', 'Vali')
RETURNING id, ism, old.balans AS eski, new.balans AS yangi;
""")

out["pg"]["delete_returning"] = run_pg("""
DELETE FROM mijozlar WHERE ism = 'Sobir' RETURNING *;
UPDATE mijozlar SET balans = 0 WHERE ism = 'Yoq' RETURNING id;
""")

out["pg"]["cte_pipeline"] = run_pg("""
CREATE TABLE arxiv (id bigint, ism text, balans numeric);
WITH ochirilgan AS (
    DELETE FROM mijozlar WHERE balans = 0 RETURNING id, ism, balans
)
INSERT INTO arxiv SELECT * FROM ochirilgan RETURNING *;
SELECT id, ism FROM mijozlar ORDER BY id;
DROP TABLE IF EXISTS mijozlar, arxiv CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["returning_err"] = run_my("""
DROP TABLE IF EXISTS mijozlar;
CREATE TABLE mijozlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ism VARCHAR(50) NOT NULL,
    balans DECIMAL(10,2) NOT NULL DEFAULT 0
);
INSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;
""")

out["mysql"]["last_insert_id"] = run_my("""
INSERT INTO mijozlar (ism) VALUES ('Ali');
SELECT LAST_INSERT_ID() AS yangi_id, ROW_COUNT() AS qatorlar;
INSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir');
SELECT LAST_INSERT_ID() AS birinchi_id;
""")

out["mysql"]["row_count"] = run_my("""
UPDATE mijozlar SET balans = 50000 WHERE ism IN ('Ali', 'Vali');
SELECT ROW_COUNT() AS ozgargan;
UPDATE mijozlar SET balans = 50000 WHERE ism IN ('Ali', 'Vali');
SELECT ROW_COUNT() AS ozgargan_ikkinchi_marta;
DROP TABLE IF EXISTS mijozlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_demo"] = run_sqlite("""
CREATE TABLE mijozlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ism TEXT NOT NULL,
    yaratilgan TEXT DEFAULT (datetime('now')),
    balans NUMERIC DEFAULT 0
);
INSERT INTO mijozlar (ism) VALUES ('Ali'), ('Vali') RETURNING id, ism;
UPDATE mijozlar SET balans = 50000 WHERE ism = 'Ali' RETURNING id, balans;
DELETE FROM mijozlar WHERE ism = 'Vali' RETURNING *;
SELECT last_insert_rowid();
""")

out["sqlite"]["sqlite_err"] = run_sqlite("""
CREATE TABLE mijozlar (id INT, balans INT);
SELECT * FROM (INSERT INTO mijozlar (id) VALUES (1) RETURNING id);
UPDATE mijozlar SET balans = 1 RETURNING sum(balans);
""")

js_content = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
target = os.path.join(os.path.dirname(__file__), "tty.js")
with open(target, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Natijalar yozildi: {target}")

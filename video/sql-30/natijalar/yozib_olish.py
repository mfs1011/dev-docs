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
out["pg"]["setup"] = run_pg("""
DROP TABLE IF EXISTS org, yol CASCADE;
CREATE TABLE org (name varchar(20) PRIMARY KEY, boss varchar(20));
INSERT INTO org VALUES
    ('Alice',NULL), ('Bob','Alice'), ('Cindy','Alice'),
    ('Dave','Bob'), ('Emma','Bob'), ('Fred','Cindy'), ('Gail','Cindy');

CREATE TABLE yol (dan varchar(5), ga varchar(5));
INSERT INTO yol VALUES ('A','B'), ('B','C'), ('C','A'), ('C','D');
""")

out["pg"]["series"] = run_pg("""
WITH RECURSIVE t(n) AS (
    VALUES (1)
    UNION ALL
    SELECT n + 1 FROM t WHERE n < 100
)
SELECT sum(n) FROM t;
""")

out["pg"]["tree_levels"] = run_pg("""
WITH RECURSIVE ostida(name, daraja) AS (
    SELECT name, 0 FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT name, daraja FROM ostida ORDER BY daraja, name;
""")

out["pg"]["tree_path"] = run_pg("""
WITH RECURSIVE ostida(name, daraja, yol) AS (
    SELECT name, 0, CAST(name AS text) FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1, u.yol || '/' || o.name
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT repeat('   ', daraja) || name AS daraxt, yol FROM ostida ORDER BY yol;
""")

out["pg"]["search_cycle"] = run_pg("""
WITH RECURSIVE borish(nuqta, qadam) AS (
    SELECT 'A'::varchar, 0
    UNION ALL
    SELECT y.ga, b.qadam + 1 FROM yol y JOIN borish b ON y.dan = b.nuqta
) CYCLE nuqta SET aylana USING yol_
SELECT nuqta, qadam, aylana, yol_ FROM borish;
""")

out["pg"]["syntax_errors"] = run_pg("""
WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT max(n) + 1 FROM s WHERE n < 3) SELECT * FROM s;
WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM t LIMIT 5) SELECT * FROM t;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS org, yol;
CREATE TABLE org (name VARCHAR(20) PRIMARY KEY, boss VARCHAR(20));
INSERT INTO org VALUES
    ('Alice',NULL), ('Bob','Alice'), ('Cindy','Alice'),
    ('Dave','Bob'), ('Emma','Bob'), ('Fred','Cindy'), ('Gail','Cindy');

CREATE TABLE yol (dan VARCHAR(5), ga VARCHAR(5));
INSERT INTO yol VALUES ('A','B'), ('B','C'), ('C','A'), ('C','D');

WITH RECURSIVE ostida(name, daraja, yol) AS (
    SELECT name, 0, CAST(name AS CHAR(200)) FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1, CONCAT(u.yol, '/', o.name)
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT CONCAT(REPEAT('   ', daraja), name) AS daraxt, yol FROM ostida ORDER BY yol;

WITH RECURSIVE borish(nuqta, qadam) AS (
    SELECT CAST('A' AS CHAR(5)), 0
    UNION ALL
    SELECT y.ga, b.qadam + 1 FROM yol y JOIN borish b ON y.dan = b.nuqta LIMIT 5
)
SELECT * FROM borish;
DROP TABLE org, yol;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE org (name TEXT PRIMARY KEY, boss TEXT);
INSERT INTO org VALUES
    ('Alice',NULL), ('Bob','Alice'), ('Cindy','Alice'),
    ('Dave','Bob'), ('Emma','Bob'), ('Fred','Cindy'), ('Gail','Cindy');

WITH RECURSIVE ostida(name, daraja) AS (
    SELECT name, 0 FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1 FROM org o JOIN ostida u ON o.boss = u.name
    ORDER BY 2 DESC
)
SELECT substr('............', 1, daraja * 3) || name AS daraxt FROM ostida;

WITH ostida(name) AS (
    SELECT name FROM org WHERE name = 'Bob'
    UNION ALL
    SELECT o.name FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT name FROM ostida;
""")

with open("video/sql-30/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-30/natijalar/tty.js")

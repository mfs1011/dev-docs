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
DROP TABLE IF EXISTS talabalar2 CASCADE;
CREATE TABLE talabalar2 (id int PRIMARY KEY, ism text, guruh text, ball int);
INSERT INTO talabalar2 VALUES
    (1,'Ali','A',85), (2,'Vali','B',92), (3,'Sobir','A',NULL),
    (4,'Dilnoza','B',92), (5,'Malika','A',78), (6,'Jasur','B',85);
""")

out["pg"]["nulls_order"] = run_pg("""
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC;
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST;
""")

out["pg"]["with_ties"] = run_pg("""
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST FETCH FIRST 2 ROWS WITH TIES;
""")

out["pg"]["pagination"] = run_pg("""
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST, id LIMIT 2 OFFSET 0;
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST, id LIMIT 2 OFFSET 2;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_tests"] = run_my("""
DROP TABLE IF EXISTS t2;
CREATE TABLE t2 (id INT PRIMARY KEY, ism VARCHAR(30), guruh VARCHAR(10), ball INT);
INSERT INTO t2 VALUES
    (1,'Ali','A',85), (2,'Vali','B',92), (3,'Sobir','A',NULL),
    (4,'Dilnoza','B',92), (5,'Malika','A',78), (6,'Jasur','B',85);
SELECT ism, ball FROM t2 ORDER BY ball;
SELECT ism, ball FROM t2 ORDER BY ball IS NULL, ball DESC;
SELECT ism, ball FROM t2 ORDER BY ball DESC LIMIT 2, 2;
DROP TABLE t2;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_tests"] = run_sqlite("""
CREATE TABLE t2 (id INT PRIMARY KEY, ism TEXT, guruh TEXT, ball INT);
INSERT INTO t2 VALUES
    (1,'Ali','A',85), (2,'Vali','B',92), (3,'Sobir','A',NULL),
    (4,'Dilnoza','B',92), (5,'Malika','A',78), (6,'Jasur','B',85);
SELECT ism, ball FROM t2 ORDER BY ball;
SELECT ism, ball FROM t2 ORDER BY ball DESC NULLS FIRST LIMIT 3;
SELECT ism, ball FROM t2 ORDER BY ball DESC LIMIT 2, 2;
""")

# tty.js ga yozamiz
js = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
with open("video/sql-24/natijalar/tty.js", "w", encoding="utf-8") as f:
    f.write(js)

print("video/sql-24/natijalar/tty.js tayyor!")

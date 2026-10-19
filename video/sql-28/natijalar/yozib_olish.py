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
DROP TABLE IF EXISTS a, b, c CASCADE;
CREATE TABLE a (m int, n int);
CREATE TABLE b (m int, n int);
CREATE TABLE c (m int, n int);
INSERT INTO a VALUES (1,2), (2,3), (3,4);
INSERT INTO b VALUES (1,2), (1,3), (3,4);
INSERT INTO c VALUES (1,3), (1,3), (3,4);
""")

out["pg"]["union_ops"] = run_pg("""
SELECT * FROM a UNION     SELECT * FROM b ORDER BY m, n;
SELECT * FROM a UNION ALL SELECT * FROM b ORDER BY m, n;
""")

out["pg"]["intersect_except"] = run_pg("""
SELECT * FROM a INTERSECT SELECT * FROM b ORDER BY m, n;
SELECT * FROM a EXCEPT    SELECT * FROM b ORDER BY m, n;
""")

out["pg"]["all_counts"] = run_pg("""
SELECT * FROM c INTERSECT ALL SELECT * FROM c ORDER BY m, n;
SELECT * FROM c EXCEPT ALL    SELECT * FROM a ORDER BY m, n;
SELECT * FROM c EXCEPT        SELECT * FROM a ORDER BY m, n;
""")

out["pg"]["precedence"] = run_pg("""
SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c ORDER BY m, n;
""")

out["pg"]["order_limit"] = run_pg("""
SELECT m AS x, n FROM a UNION SELECT * FROM b ORDER BY x DESC, n LIMIT 2;
(SELECT m FROM a ORDER BY m DESC LIMIT 1)
UNION
(SELECT m FROM b ORDER BY m LIMIT 1)
ORDER BY m;
SELECT m, n FROM a UNION SELECT m, n FROM b ORDER BY m + n;
""")

out["pg"]["compat_null"] = run_pg("""
SELECT m, n FROM a UNION SELECT m FROM b;
SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;
SELECT 1 AS k, 'x' AS v UNION SELECT NULL, NULL UNION SELECT NULL, NULL;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS a, b, c;
CREATE TABLE a (m int, n int);
CREATE TABLE b (m int, n int);
CREATE TABLE c (m int, n int);
INSERT INTO a VALUES (1,2), (2,3), (3,4);
INSERT INTO b VALUES (1,2), (1,3), (3,4);
INSERT INTO c VALUES (1,3), (1,3), (3,4);

SELECT m, n FROM a UNION SELECT m, n FROM b ORDER BY m + n;
SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;
TABLE a INTERSECT TABLE b;
DROP TABLE a, b, c;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE a (m int, n int);
CREATE TABLE b (m int, n int);
CREATE TABLE c (m int, n int);
INSERT INTO a VALUES (1,2), (2,3), (3,4);
INSERT INTO b VALUES (1,2), (1,3), (3,4);
INSERT INTO c VALUES (1,3), (1,3), (3,4);

SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c ORDER BY m, n;
SELECT * FROM (SELECT m FROM a ORDER BY m DESC LIMIT 1)
UNION
SELECT * FROM (SELECT m FROM b ORDER BY m LIMIT 1)
ORDER BY m;
SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;
""")

with open("video/sql-28/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-28/natijalar/tty.js")

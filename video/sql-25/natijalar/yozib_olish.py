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
DROP TABLE IF EXISTS t1, t2, guruhlar, baholar CASCADE;
CREATE TABLE t1 (num int, name varchar(10));
CREATE TABLE t2 (num int, value varchar(10));
INSERT INTO t1 VALUES (1,'a'), (2,'b'), (3,'c');
INSERT INTO t2 VALUES (1,'xxx'), (3,'yyy'), (5,'zzz');
""")

out["pg"]["cross_and_inner"] = run_pg("""
SELECT * FROM t1 CROSS JOIN t2 ORDER BY t1.num, t2.num;
SELECT * FROM t1 INNER JOIN t2 ON t1.num = t2.num;
SELECT * FROM t1 INNER JOIN t2 USING (num);
""")

out["pg"]["outer_joins"] = run_pg("""
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num ORDER BY t1.num;
SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num ORDER BY t2.num;
SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num ORDER BY t1.num, t2.num;
""")

out["pg"]["on_vs_where"] = run_pg("""
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num AND t2.value = 'xxx' ORDER BY t1.num;
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num WHERE t2.value = 'xxx';
SELECT t1.* FROM t1 LEFT JOIN t2 ON t1.num = t2.num WHERE t2.num IS NULL;
""")

out["pg"]["lateral"] = run_pg("""
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90), (4,2,'Dilnoza',88), (5,1,'Malika',78);

SELECT g.nom, t.ism, t.ball
FROM guruhlar g
LEFT JOIN LATERAL (
    SELECT b.ism, b.ball FROM baholar b
    WHERE b.guruh_id = g.id
    ORDER BY b.ball DESC
    LIMIT 2
) AS t ON true
ORDER BY g.nom, t.ball DESC;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_tests"] = run_my("""
DROP TABLE IF EXISTS t1, t2;
CREATE TABLE t1 (num INT, name VARCHAR(10));
CREATE TABLE t2 (num INT, value VARCHAR(10));
INSERT INTO t1 VALUES (1,'a'), (2,'b'), (3,'c');
INSERT INTO t2 VALUES (1,'xxx'), (3,'yyy'), (5,'zzz');

SELECT count(*) FROM t1 JOIN t2;
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num
UNION
SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num;

DROP TABLE t1;
DROP TABLE t2;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_tests"] = run_sqlite("""
CREATE TABLE t1 (num INT, name TEXT);
CREATE TABLE t2 (num INT, value TEXT);
INSERT INTO t1 VALUES (1,'a'), (2,'b'), (3,'c');
INSERT INTO t2 VALUES (1,'xxx'), (3,'yyy'), (5,'zzz');

SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num ORDER BY t1.num, t2.num;
SELECT count(*) FROM t1 LEFT JOIN t2;
""")

with open("video/sql-25/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-25/natijalar/tty.js")

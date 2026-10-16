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
DROP TABLE IF EXISTS baholar, guruhlar CASCADE;
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);
""")

out["pg"]["basic_aggs"] = run_pg("""
SELECT count(*), count(ball), count(DISTINCT guruh_id), sum(ball), round(avg(ball), 1) as avg, min(ball), max(ball) FROM baholar;
SELECT count(*), sum(ball) FROM baholar WHERE ball > 100;
""")

out["pg"]["group_by_having"] = run_pg("""
SELECT guruh_id, count(*) AS soni, max(ball) AS eng_yuqori FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT guruh_id, count(*) FROM baholar GROUP BY guruh_id HAVING count(*) > 1 ORDER BY guruh_id;
""")

out["pg"]["functional_dep"] = run_pg("""
SELECT g.id, g.nom, count(b.id) AS soni
FROM guruhlar g LEFT JOIN baholar b ON b.guruh_id = g.id
GROUP BY g.id ORDER BY g.id;
""")

out["pg"]["filter_rollup"] = run_pg("""
SELECT count(*) AS hammasi, count(*) FILTER (WHERE ball >= 88) AS alochi FROM baholar;
SELECT g.nom, b.ism, sum(b.ball), grouping(g.nom, b.ism) AS gr
FROM baholar b JOIN guruhlar g ON g.id = b.guruh_id
GROUP BY ROLLUP (g.nom, b.ism)
ORDER BY g.nom, b.ism;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_tests"] = run_my("""
DROP TABLE IF EXISTS baholar, guruhlar;
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom VARCHAR(10));
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism VARCHAR(20), ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

SELECT guruh_id, ANY_VALUE(ism) AS ism, max(ball) FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT guruh_id, GROUP_CONCAT(ism ORDER BY ism SEPARATOR ', ') AS ismlar FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT count(*) AS hammasi, sum(ball >= 88) AS alochi FROM baholar;

DROP TABLE baholar, guruhlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_tests"] = run_sqlite("""
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom TEXT);
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism TEXT, ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

SELECT guruh_id, ism, max(ball) FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT sum(ball), total(ball) FROM baholar WHERE 0;
""")

with open("video/sql-26/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-26/natijalar/tty.js")

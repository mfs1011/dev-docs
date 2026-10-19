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
DROP TABLE IF EXISTS baholar, guruhlar, arxiv CASCADE;
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
CREATE TABLE arxiv   (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);
""")

out["pg"]["chain_cte"] = run_pg("""
WITH guruh_ortacha AS (
    SELECT guruh_id, avg(ball) AS ortacha FROM baholar
    WHERE guruh_id IS NOT NULL GROUP BY guruh_id
),
eng_yaxshi AS (
    SELECT guruh_id FROM guruh_ortacha
    WHERE ortacha = (SELECT max(ortacha) FROM guruh_ortacha)
)
SELECT b.ism, b.ball FROM baholar b
WHERE b.guruh_id IN (SELECT guruh_id FROM eng_yaxshi)
ORDER BY b.ball DESC;
""")

out["pg"]["explicit_cols"] = run_pg("""
WITH s (guruh, soni) AS (SELECT guruh_id, count(*) FROM baholar GROUP BY guruh_id)
SELECT g.nom, s.soni FROM guruhlar g JOIN s ON s.guruh = g.id ORDER BY g.nom;
""")

out["pg"]["syntax_errors"] = run_pg("""
WITH a AS (SELECT 1 AS x) WITH b AS (SELECT 2 AS y) SELECT * FROM a, b;
WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a;
""")

out["pg"]["update_explain"] = run_pg("""
WITH m AS (SELECT max(ball) AS mx FROM baholar)
UPDATE baholar SET ball = (SELECT mx FROM m) WHERE id = 5;
EXPLAIN (COSTS OFF)
WITH w AS (SELECT * FROM baholar) SELECT * FROM w WHERE id = 2;
EXPLAIN (COSTS OFF)
WITH w AS MATERIALIZED (SELECT * FROM baholar) SELECT * FROM w WHERE id = 2;
""")

out["pg"]["data_modifying"] = run_pg("""
WITH kochirilgan AS (
    DELETE FROM baholar WHERE ball < 86 RETURNING *
)
INSERT INTO arxiv SELECT * FROM kochirilgan;
SELECT ism, ball FROM arxiv ORDER BY id;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS baholar, guruhlar, arxiv;
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom VARCHAR(10));
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism VARCHAR(20), ball INT);
CREATE TABLE arxiv   (id INT PRIMARY KEY, guruh_id INT, ism VARCHAR(20), ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

WITH m AS (SELECT max(ball) AS mx FROM baholar)
UPDATE baholar SET ball = (SELECT mx FROM m) WHERE id = 5;
INSERT INTO arxiv WITH t AS (SELECT 1) SELECT * FROM baholar WHERE id = 4;
SELECT ism, ball FROM arxiv;
DROP TABLE baholar, guruhlar, arxiv;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom TEXT);
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism TEXT, ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a;
WITH w AS MATERIALIZED (SELECT * FROM baholar) SELECT count(*) FROM w;
""")

with open("video/sql-29/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-29/natijalar/tty.js")

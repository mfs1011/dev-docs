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

out["pg"]["scalar"] = run_pg("""
SELECT ism, ball FROM baholar
WHERE ball > (SELECT avg(ball) FROM baholar)
ORDER BY ball DESC;
SELECT (SELECT ism FROM baholar WHERE guruh_id = 1) AS ism;
SELECT (SELECT ism, ball FROM baholar WHERE id = 1) AS x;
SELECT (SELECT ism FROM baholar WHERE id = 99) AS yoq;
""")

out["pg"]["correlated"] = run_pg("""
SELECT nom,
       (SELECT max(b.ball) FROM baholar b WHERE b.guruh_id = g.id) AS eng_yuqori
FROM guruhlar g ORDER BY nom;
SELECT ism, ball FROM baholar b
WHERE ball = (SELECT max(ball) FROM baholar b2 WHERE b2.guruh_id = b.guruh_id)
ORDER BY ism;
""")

out["pg"]["exists_in"] = run_pg("""
SELECT nom FROM guruhlar g
WHERE EXISTS (SELECT 1 FROM baholar b WHERE b.guruh_id = g.id)
ORDER BY nom;
SELECT nom FROM guruhlar
WHERE id IN (SELECT guruh_id FROM baholar)
ORDER BY nom;
""")

out["pg"]["not_in_trap"] = run_pg("""
SELECT nom FROM guruhlar WHERE id NOT IN (SELECT guruh_id FROM baholar);
SELECT nom FROM guruhlar g WHERE NOT EXISTS (SELECT 1 FROM baholar b WHERE b.guruh_id = g.id);
SELECT nom FROM guruhlar WHERE id NOT IN (SELECT guruh_id FROM baholar WHERE guruh_id IS NOT NULL);
""")

out["pg"]["any_all"] = run_pg("""
SELECT ism, ball FROM baholar
WHERE ball > ALL (SELECT ball FROM baholar WHERE guruh_id = 1 AND ball IS NOT NULL);
SELECT ism, ball FROM baholar
WHERE ball > ALL (SELECT ball FROM baholar WHERE guruh_id = 1);
SELECT ism, ball FROM baholar
WHERE ball < ANY (SELECT ball FROM baholar WHERE guruh_id = 2)
ORDER BY ism;
""")

out["pg"]["derived_update"] = run_pg("""
SELECT avg(soni)
FROM (SELECT guruh_id, count(*) AS soni FROM baholar GROUP BY guruh_id) AS t;
SELECT ism FROM baholar
WHERE id IN (SELECT id FROM baholar WHERE ball IS NOT NULL ORDER BY ball DESC LIMIT 2)
ORDER BY ism;
UPDATE baholar SET ball = (SELECT max(ball) FROM baholar) WHERE id = 5;
SELECT ism, ball FROM baholar WHERE id = 5;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS baholar, guruhlar;
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom VARCHAR(10));
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism VARCHAR(20), ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

SELECT avg(soni) FROM (SELECT guruh_id, count(*) AS soni FROM baholar GROUP BY guruh_id) AS t;
SELECT ism FROM baholar
WHERE id IN (SELECT id FROM (SELECT id FROM baholar WHERE ball IS NOT NULL
                              ORDER BY ball DESC LIMIT 2) AS t)
ORDER BY ism;
UPDATE baholar SET ball = (SELECT m FROM (SELECT max(ball) AS m FROM baholar) AS t) WHERE id = 5;
SELECT ism, ball FROM baholar WHERE id = 5;

DROP TABLE baholar, guruhlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE guruhlar (id INT PRIMARY KEY, nom TEXT);
CREATE TABLE baholar (id INT PRIMARY KEY, guruh_id INT, ism TEXT, ball INT);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);

SELECT (SELECT ism FROM baholar WHERE guruh_id = 1) AS ism;
SELECT avg(soni) FROM (SELECT guruh_id, count(*) AS soni FROM baholar GROUP BY guruh_id);
SELECT nom FROM guruhlar WHERE id IN baholar;
""")

with open("video/sql-27/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-27/natijalar/tty.js")

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
DROP TABLE IF EXISTS mijozlar CASCADE;
CREATE TABLE mijozlar (id int PRIMARY KEY, ism text, telefon text, shahar text, yosh int);
INSERT INTO mijozlar VALUES
    (1,'Ali','+998901234567','Toshkent',25),
    (2,'aliya','+998935550011','Samarqand',31),
    (3,'Vali','998-90-111-22-33','Toshkent',NULL),
    (4,'Sobir_2','+998977770000',NULL,40),
    (5,'Dilnoza','+79161234567','Buxoro',19);
""")

out["pg"]["between_symmetric"] = run_pg("""
SELECT id, ism, yosh FROM mijozlar WHERE yosh BETWEEN SYMMETRIC 31 AND 25 ORDER BY id;
""")

out["pg"]["in_null_trap"] = run_pg("""
SELECT id, shahar FROM mijozlar WHERE shahar NOT IN ('Toshkent', NULL);
""")

out["pg"]["distinct_from"] = run_pg("""
SELECT id, ism, shahar FROM mijozlar WHERE shahar IS DISTINCT FROM 'Toshkent' ORDER BY id;
""")

out["pg"]["like_ilike_regex"] = run_pg("""
SELECT id, ism FROM mijozlar WHERE ism ILIKE 'ali%' ORDER BY id;
SELECT id, telefon FROM mijozlar WHERE telefon ~ '^\\+998' ORDER BY id;
SELECT id, ism FROM mijozlar WHERE ism LIKE '%\\_%';
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_tests"] = run_my("""
DROP TABLE IF EXISTS mijozlar;
CREATE TABLE mijozlar (id INT PRIMARY KEY, ism VARCHAR(30), telefon VARCHAR(30), shahar VARCHAR(30), yosh INT);
INSERT INTO mijozlar VALUES
    (1,'Ali','+998901234567','Toshkent',25),
    (2,'aliya','+998935550011','Samarqand',31),
    (3,'Vali','998-90-111-22-33','Toshkent',NULL),
    (4,'Sobir_2','+998977770000',NULL,40),
    (5,'Dilnoza','+79161234567','Buxoro',19);
SELECT id, shahar FROM mijozlar WHERE NOT (shahar <=> 'Toshkent') ORDER BY id;
SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%' ORDER BY id;
SELECT id, telefon FROM mijozlar WHERE telefon REGEXP '^\\\\+998' ORDER BY id;
DROP TABLE mijozlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_tests"] = run_sqlite("""
CREATE TABLE mijozlar (id INT PRIMARY KEY, ism TEXT, telefon TEXT, shahar TEXT, yosh INT);
INSERT INTO mijozlar VALUES
    (1,'Ali','+998901234567','Toshkent',25),
    (2,'aliya','+998935550011','Samarqand',31),
    (3,'Vali','998-90-111-22-33','Toshkent',NULL),
    (4,'Sobir_2','+998977770000',NULL,40),
    (5,'Dilnoza','+79161234567','Buxoro',19);
SELECT id, ism FROM mijozlar WHERE ism GLOB 'A*';
SELECT id, ism, shahar FROM mijozlar WHERE shahar IS NOT 'Toshkent' ORDER BY id;
SELECT 'Sobir_2' LIKE '%\\_%' AS bez_escape, 'Sobir_2' LIKE '%!_%' ESCAPE '!' AS bilan_escape;
""")

# tty.js ga yozamiz
js = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
with open("video/sql-23/natijalar/tty.js", "w", encoding="utf-8") as f:
    f.write(js)

print("video/sql-23/natijalar/tty.js tayyor!")

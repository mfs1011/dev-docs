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
out["pg"]["alias_where_error"] = run_pg("""
DROP TABLE IF EXISTS sotuvlar CASCADE;
CREATE TABLE sotuvlar (id int PRIMARY KEY, sotuvchi text, shahar text, summa numeric);
INSERT INTO sotuvlar VALUES (1,'Ali','Toshkent',500), (2,'Ali','Toshkent',300), (3,'Vali','Samarqand',700), (4,'Vali','Toshkent',200), (5,'Sobir','Buxoro',900), (6,'Sobir','Buxoro',100);
SELECT sotuvchi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan > 500;
""")

out["pg"]["alias_order_ok"] = run_pg("""
SELECT sotuvchi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE summa * 1.12 > 500 ORDER BY qqs_bilan DESC;
""")

out["pg"]["distinct_on"] = run_pg("""
SELECT DISTINCT ON (sotuvchi) sotuvchi, shahar, summa FROM sotuvlar ORDER BY sotuvchi, summa DESC;
""")

out["pg"]["missing_comma"] = run_pg("""
SELECT sotuvchi shahar FROM sotuvlar WHERE id = 1;
DROP TABLE IF EXISTS sotuvlar CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["mysql_having_alias"] = run_my("""
DROP TABLE IF EXISTS sotuvlar;
CREATE TABLE sotuvlar (id INT PRIMARY KEY, sotuvchi VARCHAR(30), shahar VARCHAR(30), summa DECIMAL(10,2));
INSERT INTO sotuvlar VALUES (1,'Ali','Toshkent',500), (2,'Ali','Toshkent',300), (3,'Vali','Samarqand',700), (4,'Vali','Toshkent',200), (5,'Sobir','Buxoro',900), (6,'Sobir','Buxoro',100);
SELECT sotuvchi, SUM(summa) AS jami FROM sotuvlar GROUP BY sotuvchi HAVING jami > 700 ORDER BY jami DESC;
DROP TABLE IF EXISTS sotuvlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_alias"] = run_sqlite("""
CREATE TABLE sotuvlar (id INT PRIMARY KEY, sotuvchi TEXT, shahar TEXT, summa NUMERIC);
INSERT INTO sotuvlar VALUES (1,'Ali','Toshkent',500), (2,'Ali','Toshkent',300), (3,'Vali','Samarqand',700), (4,'Vali','Toshkent',200), (5,'Sobir','Buxoro',900), (6,'Sobir','Buxoro',100);
SELECT sotuvchi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan > 700;
SELECT sotuvchi, sum(summa) AS jami FROM sotuvlar GROUP BY sotuvchi HAVING jami > 800;
""")

js_content = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
target = os.path.join(os.path.dirname(__file__), "tty.js")
with open(target, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Natijalar yozildi: {target}")

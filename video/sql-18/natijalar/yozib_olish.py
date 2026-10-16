#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X", "-q"]
MYSQL_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "qollanma"]
SQLITE_CMD = ["/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3", ":memory:"]

def run_pg(sql):
    res = subprocess.run(PG_CMD, input=sql, text=True, capture_output=True, env=PG_ENV)
    return (res.stdout + res.stderr).strip()

def run_mysql(sql):
    res = subprocess.run(MYSQL_CMD, input=sql, text=True, capture_output=True)
    return (res.stdout + res.stderr).strip()

def run_sqlite(sql):
    res = subprocess.run(SQLITE_CMD, input=sql, text=True, capture_output=True)
    return (res.stdout + res.stderr).strip()

# PostgreSQL 18.6
pg_setup = """
DROP TABLE IF EXISTS sotuvlar CASCADE;
DROP TABLE IF EXISTS ombor CASCADE;
CREATE TABLE ombor (
    mahsulot_id int PRIMARY KEY, nom text NOT NULL,
    soni int NOT NULL DEFAULT 0, narx numeric NOT NULL DEFAULT 0
);
CREATE TABLE sotuvlar (id int GENERATED ALWAYS AS IDENTITY, mahsulot_id int, soni int);
"""

pg_insert_demo = pg_setup + """
INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (1, 'Non', 100, 4000);
INSERT INTO ombor (nom, mahsulot_id) VALUES ('Sut', 2);
INSERT INTO ombor VALUES (3, 'Choy');
INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (4, 'Tuz', 50, 2000), (5, 'Shakar', 80, 11000);
INSERT INTO sotuvlar (mahsulot_id, soni) VALUES (1, 10), (1, 5), (4, 3), (5, 20);
SELECT * FROM ombor ORDER BY mahsulot_id;
"""

pg_update_from = pg_insert_demo + """
UPDATE ombor o
SET soni = o.soni - k.jami
FROM (SELECT mahsulot_id, sum(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) k
WHERE o.mahsulot_id = k.mahsulot_id;
SELECT * FROM ombor ORDER BY mahsulot_id;
"""

pg_delete_using = pg_update_from + """
DELETE FROM sotuvlar s USING ombor o
WHERE s.mahsulot_id = o.mahsulot_id AND o.nom = 'Shakar';
SELECT * FROM sotuvlar ORDER BY id;
"""

pg_values = """
VALUES (1, 'bir'), (2, 'ikki') ORDER BY 1 DESC;
SELECT * FROM (VALUES (1, 'bir'), (2, 'ikki')) AS t(raqam, soz);
"""

# MySQL 9.7.2
mysql_setup = """
DROP TABLE IF EXISTS sotuvlar;
DROP TABLE IF EXISTS ombor;
CREATE TABLE ombor (
    mahsulot_id int PRIMARY KEY, nom varchar(50) NOT NULL,
    soni int NOT NULL DEFAULT 0, narx decimal(12,2) NOT NULL DEFAULT 0
);
CREATE TABLE sotuvlar (id int AUTO_INCREMENT PRIMARY KEY, mahsulot_id int, soni int);
INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (1, 'Non', 100, 4000), (4, 'Tuz', 50, 2000), (5, 'Shakar', 80, 11000);
INSERT INTO sotuvlar (mahsulot_id, soni) VALUES (1, 10), (1, 5), (4, 3), (5, 20);
"""

mysql_err_demo = mysql_setup + """
INSERT INTO ombor VALUES (3, 'Choy');
"""

mysql_update_join = mysql_setup + """
UPDATE ombor o
JOIN (SELECT mahsulot_id, SUM(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) k USING (mahsulot_id)
SET o.soni = o.soni - k.jami;
SELECT mahsulot_id, nom, soni, narx FROM ombor ORDER BY mahsulot_id;
"""

mysql_order_limit = mysql_setup + """
UPDATE ombor SET narx = narx + 1 ORDER BY narx DESC LIMIT 1;
SELECT mahsulot_id, narx FROM ombor WHERE mahsulot_id = 5;
"""

# SQLite 3.54
sqlite_script = """
CREATE TABLE ombor (mahsulot_id INTEGER PRIMARY KEY, nom TEXT, soni INTEGER DEFAULT 0);
CREATE TABLE sotuvlar (id INTEGER PRIMARY KEY, mahsulot_id INTEGER, soni INTEGER);
INSERT INTO ombor VALUES (1, 'Non', 100), (4, 'Tuz', 50), (5, 'Shakar', 80);
INSERT INTO sotuvlar VALUES (1, 1, 10), (2, 1, 5), (3, 4, 3), (4, 5, 20);
UPDATE ombor SET soni = soni - k.jami
FROM (SELECT mahsulot_id, sum(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) AS k
WHERE ombor.mahsulot_id = k.mahsulot_id;
SELECT * FROM ombor;
DELETE FROM sotuvlar USING ombor WHERE sotuvlar.mahsulot_id = ombor.mahsulot_id;
CREATE TABLE d (a INT DEFAULT 7, b TEXT);
INSERT INTO d DEFAULT VALUES;
SELECT * FROM d;
"""

tty_data = {
    "pg": {
        "insert_demo": run_pg(pg_insert_demo),
        "update_from": run_pg(pg_update_from),
        "delete_using": run_pg(pg_delete_using),
        "values_demo": run_pg(pg_values),
    },
    "mysql": {
        "insert_err": run_mysql(mysql_err_demo),
        "update_join": run_mysql(mysql_update_join),
        "order_limit": run_mysql(mysql_order_limit),
    },
    "sqlite": {
        "sqlite_demo": run_sqlite(sqlite_script),
    }
}

os.makedirs("video/sql-18/natijalar", exist_ok=True)
js_content = f"""(function (g) {{
  g.TTY = {json.dumps(tty_data, indent=2, ensure_ascii=False)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-18/natijalar/tty.js", "w") as f:
    f.write(js_content)

print("tty.js muvaffaqiyatli saqlandi!")
for k, v in tty_data.items():
    print(f"[{k}] kalitlar:", list(v.keys()))

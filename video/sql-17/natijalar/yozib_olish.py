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

# PostgreSQL 18
pg_setup = """
DROP MATERIALIZED VIEW IF EXISTS narx_hisoboti CASCADE;
DROP VIEW IF EXISTS statistika CASCADE;
DROP VIEW IF EXISTS arzonlar CASCADE;
DROP VIEW IF EXISTS faol_mahsulotlar CASCADE;
DROP TABLE IF EXISTS mahsulotlar CASCADE;

CREATE TABLE mahsulotlar (
    id int PRIMARY KEY, nom text NOT NULL, narx numeric NOT NULL,
    faol boolean NOT NULL DEFAULT true
);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, true), (2, 'Sut', 12000, true), (3, 'Eski choy', 9000, false);
"""

pg_view_demo = pg_setup + """
CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol;
UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
INSERT INTO faol_mahsulotlar VALUES (4, 'Tuz', 2000);
SELECT * FROM mahsulotlar ORDER BY id;
"""

pg_check_opt = pg_setup + """
CREATE VIEW arzonlar AS
    SELECT id, nom, narx FROM mahsulotlar WHERE narx < 5000
    WITH CHECK OPTION;
INSERT INTO arzonlar VALUES (5, 'Shakar', 3000);
INSERT INTO arzonlar VALUES (6, 'Go''sht', 90000);
"""

pg_not_updatable = pg_setup + """
CREATE VIEW statistika AS
    SELECT faol, count(*) AS soni, avg(narx) AS ortacha
    FROM mahsulotlar GROUP BY faol;
UPDATE statistika SET soni = 0;
"""

pg_matview = pg_setup + """
CREATE MATERIALIZED VIEW narx_hisoboti AS
    SELECT faol, count(*) AS soni, sum(narx) AS jami
    FROM mahsulotlar GROUP BY faol;
INSERT INTO mahsulotlar VALUES (7, 'Guruch', 15000, true);
SELECT 'eski_natija' AS holat, * FROM narx_hisoboti ORDER BY faol;
REFRESH MATERIALIZED VIEW narx_hisoboti;
SELECT 'yangi_natija' AS holat, * FROM narx_hisoboti ORDER BY faol;
"""

pg_concurrent = pg_setup + """
CREATE MATERIALIZED VIEW narx_hisoboti AS
    SELECT faol, count(*) AS soni, sum(narx) AS jami
    FROM mahsulotlar GROUP BY faol;
REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;
CREATE UNIQUE INDEX ON narx_hisoboti (faol);
REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;
"""

pg_dep_err = pg_setup + """
CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol;
CREATE MATERIALIZED VIEW narx_hisoboti AS SELECT faol, sum(narx) AS jami FROM mahsulotlar GROUP BY faol;
ALTER TABLE mahsulotlar DROP COLUMN narx;
"""

# MySQL 9.7
mysql_setup = """
DROP VIEW IF EXISTS arzonlar;
DROP VIEW IF EXISTS faol_mahsulotlar;
DROP TABLE IF EXISTS mahsulotlar;
CREATE TABLE mahsulotlar (
    id int PRIMARY KEY, nom varchar(50) NOT NULL, narx decimal(12,2) NOT NULL,
    faol boolean NOT NULL DEFAULT true
);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, true), (2, 'Sut', 12000, true);
"""

mysql_drop_broken = mysql_setup + """
CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol;
ALTER TABLE mahsulotlar DROP COLUMN narx;
SELECT * FROM faol_mahsulotlar;
"""

mysql_matview_fake = """
DROP TABLE IF EXISTS m;
CREATE TABLE m (id INT PRIMARY KEY, faol BOOLEAN);
INSERT INTO m VALUES (1, TRUE);
CREATE MATERIALIZED VIEW mv AS SELECT faol, COUNT(*) AS soni FROM m GROUP BY faol;
INSERT INTO m VALUES (2, TRUE);
SELECT * FROM mv;
REFRESH MATERIALIZED VIEW mv;
"""

# SQLite 3.54
sqlite_script = """
CREATE TABLE mahsulotlar (id INTEGER PRIMARY KEY, nom TEXT, narx NUMERIC, faol INTEGER DEFAULT 1);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, 1), (2, 'Eski choy', 9000, 0);
CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol = 1;
UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
CREATE TRIGGER faol_narx INSTEAD OF UPDATE OF narx ON faol_mahsulotlar
BEGIN UPDATE mahsulotlar SET narx = NEW.narx WHERE id = OLD.id; END;
UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
SELECT * FROM mahsulotlar;
CREATE MATERIALIZED VIEW x AS SELECT 1;
"""

tty_data = {
    "pg": {
        "view_updatable": run_pg(pg_view_demo),
        "check_option_err": run_pg(pg_check_opt),
        "not_updatable_err": run_pg(pg_not_updatable),
        "matview_refresh": run_pg(pg_matview),
        "concurrent_refresh": run_pg(pg_concurrent),
        "drop_dep_err": run_pg(pg_dep_err),
    },
    "mysql": {
        "drop_broken_view": run_mysql(mysql_drop_broken),
        "matview_fake": run_mysql(mysql_matview_fake),
    },
    "sqlite": {
        "sqlite_demo": run_sqlite(sqlite_script),
    }
}

os.makedirs("video/sql-17/natijalar", exist_ok=True)
js_content = f"""(function (g) {{
  g.TTY = {json.dumps(tty_data, indent=2, ensure_ascii=False)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-17/natijalar/tty.js", "w") as f:
    f.write(js_content)

print("tty.js muvaffaqiyatli saqlandi!")
for k, v in tty_data.items():
    print(f"[{k}] kalitlar:", list(v.keys()))

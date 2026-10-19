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

SETUP_SQL = """
DROP TABLE IF EXISTS narxlar CASCADE;
CREATE TABLE narxlar (
    id int PRIMARY KEY, nom varchar(20), narx int, chegirma int,
    eski_narx int, tavsif varchar(50), qisqa varchar(20)
);
INSERT INTO narxlar VALUES
    (1, 'Daftar', 12000, NULL, 15000, 'Katak daftar 48 varaq', 'Daftar'),
    (2, 'Ruchka',  3000,  500,  NULL, NULL,                    'Ruchka'),
    (3, 'Kitob',  85000,    0, 90000, NULL,                    NULL),
    (4, 'Sumka',      0, NULL,  NULL, 'Bo''sh',                '');
"""

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["setup"] = run_pg(SETUP_SQL)

out["pg"]["case_toifa"] = run_pg("""
SELECT nom, narx,
       CASE WHEN narx >= 50000 THEN 'qimmat'
            WHEN narx >= 10000 THEN 'o''rta'
            WHEN narx > 0      THEN 'arzon'
            ELSE 'tekin'
       END AS toifa
FROM narxlar ORDER BY id;
""")

out["pg"]["case_null"] = run_pg("""
SELECT nom,
       CASE WHEN chegirma = NULL  THEN 'yo''q' ELSE 'bor' END AS xato,
       CASE WHEN chegirma IS NULL THEN 'yo''q' ELSE 'bor' END AS togri
FROM narxlar ORDER BY id;
""")

out["pg"]["coalesce"] = run_pg("""
SELECT nom, COALESCE(tavsif, qisqa, '(yo''q)') AS matn FROM narxlar ORDER BY id;
SELECT nom, narx - COALESCE(chegirma, 0) AS yakuniy FROM narxlar ORDER BY id;
""")

out["pg"]["nullif"] = run_pg("""
SELECT nom, NULLIF(qisqa, '') AS qisqa FROM narxlar ORDER BY id;
SELECT nom, 1000000 / NULLIF(narx, 0) AS nisbat FROM narxlar ORDER BY id;
""")

out["pg"]["greatest_least"] = run_pg("""
SELECT nom, GREATEST(narx, eski_narx) AS katta, LEAST(narx, eski_narx) AS kichik
FROM narxlar ORDER BY id;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS narxlar;
CREATE TABLE narxlar (
    id int PRIMARY KEY, nom varchar(20), narx int, chegirma int,
    eski_narx int, tavsif varchar(50), qisqa varchar(20)
);
INSERT INTO narxlar VALUES
    (1, 'Daftar', 12000, NULL, 15000, 'Katak daftar 48 varaq', 'Daftar'),
    (2, 'Ruchka',  3000,  500,  NULL, NULL,                    'Ruchka'),
    (3, 'Kitob',  85000,    0, 90000, NULL,                    NULL),
    (4, 'Sumka',      0, NULL,  NULL, 'Bo''sh',                '');

SELECT nom, GREATEST(narx, eski_narx) AS katta, LEAST(narx, eski_narx) AS kichik FROM narxlar ORDER BY id;
SELECT IF(narx > 10000, 'ha', 'yo''q'), IFNULL(chegirma, 0) FROM narxlar WHERE id = 1;
DROP TABLE narxlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE narxlar (
    id int PRIMARY KEY, nom text, narx int, chegirma int,
    eski_narx int, tavsif text, qisqa text
);
INSERT INTO narxlar VALUES
    (1, 'Daftar', 12000, NULL, 15000, 'Katak daftar 48 varaq', 'Daftar'),
    (2, 'Ruchka',  3000,  500,  NULL, NULL,                    'Ruchka'),
    (3, 'Kitob',  85000,    0, 90000, NULL,                    NULL),
    (4, 'Sumka',      0, NULL,  NULL, 'Bo''sh',                '');

SELECT nom, max(12000, 15000) AS k, iif(narx > 10000, 'ha', 'yo''q') AS iif_natija FROM narxlar WHERE id = 1;
""")

with open("video/sql-32/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-32/natijalar/tty.js")

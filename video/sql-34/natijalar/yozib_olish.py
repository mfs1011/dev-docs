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

SETUP_PG = """
DROP TABLE IF EXISTS sotuvlar CASCADE;
CREATE TABLE sotuvlar (id int PRIMARY KEY, vaqt timestamp, summa int);
INSERT INTO sotuvlar VALUES
    (1, '2026-01-30 09:12:00', 120), (2, '2026-01-31 18:47:30',  80),
    (3, '2026-02-02 10:05:00', 200), (4, '2026-02-02 10:21:00',  50),
    (5, '2026-02-05 23:59:59',  70), (6, '2026-03-01 00:00:00',  90);
"""

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["setup"] = run_pg(SETUP_PG)

out["pg"]["extract"] = run_pg("""
SELECT id, vaqt,
       extract(year FROM vaqt) AS yil, extract(month FROM vaqt) AS oy,
       extract(dow FROM vaqt) AS dow, extract(isodow FROM vaqt) AS isodow
FROM sotuvlar ORDER BY id;
""")

out["pg"]["trunc_bin"] = run_pg("""
SELECT date_trunc('month', vaqt) AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;

SELECT id, vaqt, date_trunc('hour', vaqt) AS soat,
       date_bin('15 minutes', vaqt, timestamp '2026-01-01') AS chorak
FROM sotuvlar WHERE id IN (3, 4) ORDER BY id;
""")

out["pg"]["gap_fill"] = run_pg("""
SELECT k.kun::date AS kun, count(s.id) AS soni, coalesce(sum(s.summa), 0) AS jami
FROM generate_series(timestamp '2026-02-01', timestamp '2026-02-06', interval '1 day') AS k(kun)
LEFT JOIN sotuvlar s ON s.vaqt >= k.kun AND s.vaqt < k.kun + interval '1 day'
GROUP BY k.kun ORDER BY k.kun;
""")

out["pg"]["age_diff"] = run_pg("""
SELECT age(timestamp '2026-03-01', timestamp '2024-01-15') AS yosh,
       timestamp '2026-03-01' - timestamp '2024-01-15' AS ayirma,
       date '2026-03-01' - date '2024-01-15' AS kunlar;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS sotuvlar;
CREATE TABLE sotuvlar (id int PRIMARY KEY, vaqt datetime, summa int);
INSERT INTO sotuvlar VALUES
    (1, '2026-01-30 09:12:00', 120), (2, '2026-01-31 18:47:30',  80),
    (3, '2026-02-02 10:05:00', 200), (4, '2026-02-02 10:21:00',  50),
    (5, '2026-02-05 23:59:59',  70), (6, '2026-03-01 00:00:00',  90);

SELECT id, DAYOFWEEK(vaqt) AS dayofweek, WEEKDAY(vaqt) AS weekday FROM sotuvlar ORDER BY id;

SELECT DATE_FORMAT(vaqt, '%Y-%m-01') AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;

SELECT TIMESTAMPDIFF(MONTH, '2024-01-15', '2026-03-01') AS oylar,
       TIMESTAMPDIFF(YEAR,  '2024-01-15', '2026-03-01') AS yillar,
       DATEDIFF('2026-03-01', '2024-01-15') AS kunlar;

DROP TABLE sotuvlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE sotuvlar (id int PRIMARY KEY, vaqt text, summa int);
INSERT INTO sotuvlar VALUES
    (1, '2026-01-30 09:12:00', 120), (2, '2026-01-31 18:47:30',  80),
    (3, '2026-02-02 10:05:00', 200), (4, '2026-02-02 10:21:00',  50),
    (5, '2026-02-05 23:59:59',  70), (6, '2026-03-01 00:00:00',  90);

SELECT id, strftime('%Y', vaqt) AS yil, strftime('%m', vaqt) AS oy,
       strftime('%w', vaqt) AS w, strftime('%u', vaqt) AS u
FROM sotuvlar ORDER BY id;

SELECT date(vaqt, 'start of month') AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;

SELECT date('2026-02-10', 'end of month') AS oy_oxiri;
""")

with open("video/sql-34/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-34/natijalar/tty.js")

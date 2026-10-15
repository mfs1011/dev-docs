#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X", "-A", "-c"]
MY_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "qollanma", "-e"]
SQLITE_BIN = "/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3"

def run_pg(sql):
    p = subprocess.run(
        ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X"],
        input=sql, text=True, capture_output=True, env=PG_ENV
    )
    return (p.stdout + p.stderr).strip()

def run_my(sql):
    p = subprocess.run(MY_CMD + [sql], capture_output=True, text=True)
    return (p.stdout + p.stderr).strip()

def run_sqlite(sql):
    p = subprocess.run([SQLITE_BIN, "-box", ":memory:"], input=sql, text=True, capture_output=True)
    return (p.stdout + p.stderr).strip()

out = {"pg": {}, "mysql": {}, "sqlite": {}}

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["sel_tz"] = run_pg("SHOW TimeZone;")
out["pg"]["sel_voqealar_tashkent"] = run_pg("""
DROP TABLE IF EXISTS voqealar;
SET TimeZone = 'Asia/Tashkent';
CREATE TABLE voqealar (nom text, oddiy timestamp, zonali timestamptz);
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');
INSERT INTO voqealar VALUES ('qongiroq', '2026-10-12 09:00:00+03', '2026-10-12 09:00:00+03');
SELECT * FROM voqealar;
""")

out["pg"]["sel_voqealar_utc"] = run_pg("""
SET TimeZone = 'UTC';
SELECT * FROM voqealar;
DROP TABLE voqealar;
""")

out["pg"]["at_time_zone"] = run_pg("""
SET TimeZone = 'Asia/Tashkent';
SELECT '2026-10-12 09:00:00+05'::timestamptz AT TIME ZONE 'Europe/Moscow' AS moskva_vaqti,
       '2026-10-12 09:00:00'::timestamp AT TIME ZONE 'Europe/Moscow' AS moskvadagi_soat;
""")

out["pg"]["interval_math"] = run_pg("""
SELECT date '2026-01-31' + interval '1 month' AS bir_oy,
       date '2026-03-31' + interval '1 month' AS mart_oxiri;
SELECT '2 years 15 months 100 weeks 99 hours'::interval AS normallashgan;
SELECT timestamp '2026-10-12 18:00' - timestamp '2026-10-10 09:30' AS farq,
       date '2026-10-12' - date '2026-01-01' AS kunlar;
""")

out["pg"]["dst_ny"] = run_pg("""
SET TimeZone = 'America/New_York';
SELECT timestamptz '2026-03-07 12:00' + interval '1 day'    AS bir_kun,
       timestamptz '2026-03-07 12:00' + interval '24 hours' AS yigirma_tort_soat;
""")

out["pg"]["datestyle_err"] = run_pg("SELECT '13/01/2026'::date;")
out["pg"]["datestyle_ok"] = run_pg("SET DateStyle = 'ISO, DMY'; SELECT '13/01/2026'::date AS dmy;")
out["pg"]["feb30_err"] = run_pg("SELECT '2026-02-30'::date;")

print("MySQL 9.7 sinovlari...")
out["mysql"]["dt_vs_ts"] = run_my("""
DROP TABLE IF EXISTS voqealar;
CREATE TABLE voqealar (nom VARCHAR(20), dt DATETIME, ts TIMESTAMP);
SET time_zone = '+05:00';
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');
SET time_zone = '+00:00';
SELECT * FROM voqealar;
DROP TABLE voqealar;
""")

out["mysql"]["year2038_err"] = run_my("""
DROP TABLE IF EXISTS voqealar;
CREATE TABLE voqealar (ts TIMESTAMP);
SET time_zone = '+00:00';
INSERT INTO voqealar VALUES ('2038-01-19 03:14:08');
DROP TABLE voqealar;
""")

out["mysql"]["interval_err"] = run_my("CREATE TABLE i (x INTERVAL);")

out["mysql"]["fractional"] = run_my("""
DROP TABLE IF EXISTS kasr;
CREATE TABLE kasr (a DATETIME, b DATETIME(3));
INSERT INTO kasr VALUES ('2026-10-12 09:00:00.777', '2026-10-12 09:00:00.7777');
SELECT * FROM kasr;
DROP TABLE kasr;
""")

out["mysql"]["math"] = run_my("""
SELECT DATE_ADD('2026-01-31', INTERVAL 1 MONTH) AS bir_oy,
       DATEDIFF('2026-10-12', '2026-01-01') AS kunlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["formats"] = run_sqlite("""
CREATE TABLE voqealar (nom TEXT, vaqt TEXT, unix INTEGER, julian REAL);
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00',
       unixepoch('2026-10-12 09:00:00'), julianday('2026-10-12 09:00:00'));
SELECT * FROM voqealar;
""")

out["sqlite"]["month_ceiling_floor"] = run_sqlite("""
SELECT date('2026-01-31', '+1 month') AS bir_oy,
       date('2026-01-31', '+1 month', 'floor') AS floor;
""")

out["sqlite"]["rollover"] = run_sqlite("SELECT date('2026-02-30') AS fevral30, date('salom') AS notogri;")
out["sqlite"]["str_cmp_pitfall"] = run_sqlite("SELECT '2026-10-12' < '2026-9-30' AS matn_solishtirish;")

out_file = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! Natijalar: {out_file}")

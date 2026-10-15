#!/usr/bin/env python3
"""
6-bob "Raqamlar" uchun haqiqiy terminal chiqishlarini yozib oladi.
PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0.
"""
import subprocess, os, json
from pathlib import Path

HERE = Path(__file__).parent
SQL_SINOV = Path('/Users/mfsv/Projects/experiment/sql-sinov')
PG_BIN = '/opt/homebrew/opt/postgresql@18/bin/psql'
MY_BIN = 'mysql'
SQ_BIN = str(SQL_SINOV / "bin/sqlite3")

env_pg = os.environ.copy()
env_pg["PGPASSFILE"] = str(SQL_SINOV / "pgpass")

def run_pg(sql, db="postgres"):
    res = subprocess.run([PG_BIN, "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", db, "-c", sql],
                         capture_output=True, env=env_pg)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

def run_my(sql):
    cmd = [MY_BIN, f"--defaults-extra-file={SQL_SINOV}/talaba.cnf", "-t", "-e", sql]
    res = subprocess.run(cmd, capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

def run_sq(script):
    res = subprocess.run([SQ_BIN, ":memory:"], input=script.encode("utf-8"), capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

# 1. PostgreSQL sinovlari
run_pg("DROP TABLE IF EXISTS narxlar;")

# 1.1 0.1 + 0.2 va tenglik
out_pg_point1, _, _ = run_pg("SELECT 0.1 + 0.2 AS numeric_yigindi, 0.1::float8 + 0.2::float8 AS float_yigindi;")
out_pg_compare, _, _ = run_pg("SELECT 0.1::float8 + 0.2::float8 = 0.3::float8 AS teng_mi, 0.1 + 0.2 = 0.3 AS numeric_teng_mi;")

# 1.2 Oraliqdan chiqish
_, err_pg_smallint, _ = run_pg("SELECT 32767::smallint + 1::smallint;")
_, err_pg_int, _ = run_pg("SELECT 2147483647 + 1;")
out_pg_bigint, _, _ = run_pg("SELECT 2147483647::bigint + 1 AS bigint_bilan;")

# 1.3 numeric(5,2) yaxlitlash va to'lib ketish
run_pg("CREATE TABLE narxlar (n numeric(5,2)); INSERT INTO narxlar VALUES (123.456), (999.994);")
_, err_pg_num_overflow, _ = run_pg("INSERT INTO narxlar VALUES (999.995);")
out_pg_narxlar, _, _ = run_pg("SELECT * FROM narxlar;")
run_pg("DROP TABLE IF EXISTS narxlar;")

# 1.4 Bo'lish
out_pg_div, _, _ = run_pg("SELECT 10 / 4 AS butun_bolish, 10 / 4.0 AS numeric_bolish, 10 % 4 AS qoldiq;")

# 1.5 Yaxlitlash
out_pg_round, _, _ = run_pg("SELECT x, round(x::numeric) AS num_round, round(x::double precision) AS dbl_round FROM generate_series(-2.5, 2.5, 1) AS x;")

# 1.6 Maxsus qiymatlar va manfiy scale
out_pg_special, _, _ = run_pg("SELECT 'NaN'::numeric = 'NaN'::numeric AS nan_teng, 'Infinity'::numeric + 1 AS cheksiz; SELECT 1234.5::numeric(2,-3) AS minglik;")

# 1.7 money
out_pg_money, _, _ = run_pg("SHOW lc_monetary; SELECT 12.345::money AS pul, '1000'::money / 3 AS bolingan;")

# 2. MySQL sinovlari
run_my("USE qollanma; DROP TABLE IF EXISTS eskirgan; DROP TABLE IF EXISTS sonlar;")

# 2.1 Eskirgan atributlar
out_my_warnings, _, _ = run_my("USE qollanma; CREATE TABLE eskirgan (a INT(4) ZEROFILL, b DECIMAL(5,2) UNSIGNED); SHOW WARNINGS;")

# 2.2 Oraliqdan chiqish (strict vs relaxed)
run_my("USE qollanma; CREATE TABLE sonlar (t TINYINT, tu TINYINT UNSIGNED, d DECIMAL(5,2));")
_, err_my_strict, _ = run_my("USE qollanma; INSERT INTO sonlar (t) VALUES (128);")
out_my_relaxed, _, _ = run_my("USE qollanma; SET SESSION sql_mode = ''; INSERT INTO sonlar (t, tu) VALUES (128, -1); SELECT t, tu FROM sonlar WHERE t IS NOT NULL;")

# 2.3 0.1 + 0.2
out_my_float_point, _, _ = run_my("SELECT 0.1 + 0.2 AS decimal_yigindi, 0.1E0 + 0.2E0 AS double_yigindi;")

# 2.4 Bo'lish
out_my_div, _, _ = run_my("SELECT 10 / 4 AS bolish, 10 DIV 4 AS butun_bolish, 10 % 4 AS qoldiq;")

run_my("USE qollanma; DROP TABLE IF EXISTS eskirgan; DROP TABLE IF EXISTS sonlar;")

# 3. SQLite sinovlari
sq_script = """
.mode box
CREATE TABLE t (n NUMERIC, d DECIMAL(5,2), i INTEGER);
INSERT INTO t VALUES ('3.0e+5', 123.456, 3.0), ('abc', 99999.999, 2.5);
SELECT n, typeof(n), d, typeof(d), i, typeof(i) FROM t;

SELECT 10 / 4 AS bolish, 10 / 4.0 AS haqiqiy, 10 % 4 AS qoldiq;
SELECT 9223372036854775807 + 1 AS natija, typeof(9223372036854775807 + 1) AS tip;

SELECT 0.1 + 0.2 AS yigindi, 0.1 + 0.2 = 0.3 AS teng_mi;
SELECT decimal_add('0.1', '0.2') AS aniq;
"""
out_sq, _, _ = run_sq(sq_script)

data = {
    "pg": {
        "point1": out_pg_point1.strip(),
        "compare": out_pg_compare.strip(),
        "smallint_err": err_pg_smallint.strip(),
        "int_err": err_pg_int.strip(),
        "bigint": out_pg_bigint.strip(),
        "num_overflow": err_pg_num_overflow.strip(),
        "narxlar": out_pg_narxlar.strip(),
        "div": out_pg_div.strip(),
        "round": out_pg_round.strip(),
        "special": out_pg_special.strip(),
        "money": out_pg_money.strip()
    },
    "mysql": {
        "warnings": out_my_warnings.strip(),
        "strict_err": err_my_strict.strip(),
        "relaxed": out_my_relaxed.strip(),
        "float_point": out_my_float_point.strip(),
        "div": out_my_div.strip()
    },
    "sqlite": {
        "out": out_sq.strip()
    }
}

tty_js_path = HERE / "tty.js"
with open(tty_js_path, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! 6-bob natijalari yozildi: {tty_js_path}")

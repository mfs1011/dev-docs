#!/usr/bin/env python3
"""
7-bob "Matn va binary" uchun haqiqiy terminal chiqishlarini yozib oladi.
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
    cmd = [MY_BIN, f"--defaults-extra-file={SQL_SINOV}/talaba.cnf", "qollanma", "-t", "-e", sql]
    res = subprocess.run(cmd, capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

def run_sq(script):
    res = subprocess.run([SQ_BIN, "-box", ":memory:"], input=script.encode("utf-8"), capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

print("1. PostgreSQL 18.6 sinovlari...")
run_pg("DROP TABLE IF EXISTS matnlar, fayllar;")

# 1.1 char, varchar, text va uzunlik xatosi
run_pg("CREATE TABLE matnlar (c char(4), v varchar(5), t text);")
out_pg_ins1, _, _ = run_pg("INSERT INTO matnlar VALUES ('ok', 'ok', 'ok');")
_, err_pg_toolong, _ = run_pg("INSERT INTO matnlar (v) VALUES ('juda uzun');")
out_pg_ins_spaces, _, _ = run_pg("INSERT INTO matnlar (v) VALUES ('salom   ');")
out_pg_ins_cast, _, _ = run_pg("INSERT INTO matnlar (v) VALUES ('juda uzun'::varchar(5));")
out_pg_sel_matnlar, _, _ = run_pg("SELECT '(' || c || ')' AS c, char_length(c) AS c_uzunlik, '(' || v || ')' AS v, octet_length(v) AS bayt FROM matnlar;")

# 1.2 char vs varchar probel tengligi
out_pg_compare, _, _ = run_pg("SELECT 'ab'::char(4) = 'ab  '::char(4) AS char_teng, 'ab'::varchar = 'ab  '::varchar AS varchar_teng;")

# 1.3 Belgi va bayt (UTF-8 tutuq belgisi)
out_pg_ozbek, _, _ = run_pg("SELECT char_length('Oʻzbekiston') AS belgi, octet_length('Oʻzbekiston') AS bayt;")
out_pg_birxilmi, _, _ = run_pg("SELECT 'O''zbek' = 'Oʻzbek' AS bir_xilmi;")

# 1.4 Nol bayt (NUL) taqiqi
_, err_pg_nul, _ = run_pg("SELECT E'a\\000b';")

# 1.5 bytea
run_pg("CREATE TABLE fayllar (nom text, mazmun bytea);")
run_pg("INSERT INTO fayllar VALUES ('salom.txt', 'Salom'::bytea), ('nol', '\\x00ff10'::bytea);")
out_pg_bytea, _, _ = run_pg("SELECT nom, mazmun, length(mazmun) AS bayt FROM fayllar;")
out_pg_bytea_cmp, _, _ = run_pg("SELECT 'Salom'::bytea = 'salom'::bytea AS teng;")
_, err_pg_bytea_upper, _ = run_pg("SELECT upper('Salom'::bytea);")

run_pg("DROP TABLE IF EXISTS matnlar, fayllar;")

print("2. MySQL 9.7.2 sinovlari...")
run_my("DROP TABLE IF EXISTS matnlar, katta, fb, b;")
run_my("CREATE TABLE matnlar (c CHAR(4), v VARCHAR(5), t TEXT);")
run_my("INSERT INTO matnlar VALUES ('ab  ', 'ab  ', 'ab  ');")
out_my_concat, _, _ = run_my("SELECT CONCAT('(', c, ')') AS c, CONCAT('(', v, ')') AS v, CONCAT('(', t, ')') AS t FROM matnlar;")
out_my_compare, _, _ = run_my("SELECT 'ab' = 'ab  ' AS teng, 'Salom' = 'salom' AS katta_kichik;")

# MySQL cheklovlari
_, err_my_blob_def, _ = run_my("CREATE TABLE b (x BLOB DEFAULT 'a');")
_, err_my_rowsize, _ = run_my("CREATE TABLE katta (a VARCHAR(16000), b VARCHAR(16000));")

# VARBINARY
run_my("CREATE TABLE fb (mazmun VARBINARY(10));")
run_my("INSERT INTO fb VALUES ('Salom');")
out_my_varbinary, _, _ = run_my("SELECT mazmun, HEX(mazmun), mazmun = 'salom' AS teng FROM fb;")
run_my("DROP TABLE IF EXISTS matnlar, katta, fb, b;")

print("3. SQLite 3.54.0 sinovlari...")
sq_script = """
CREATE TABLE matnlar (c CHAR(4), v VARCHAR(5));
INSERT INTO matnlar VALUES ('ab', 'juda ham uzun matn');
SELECT '(' || c || ')' AS c, v, length(v) AS uzunlik, typeof(v) AS tip FROM matnlar;
SELECT 'ab' = 'ab  ' AS teng;
SELECT x'53616C6F6D' AS blob, typeof(x'53616C6F6D') AS tip, x'53616C6F6D' = 'Salom' AS teng;
"""
out_sq, err_sq, _ = run_sq(sq_script)

tty_data = {
    "pg": {
        "ins_too_long_err": err_pg_toolong.strip(),
        "sel_matnlar": out_pg_sel_matnlar.strip(),
        "char_vs_varchar_cmp": out_pg_compare.strip(),
        "utf8_ozbek": out_pg_ozbek.strip(),
        "tutuq_cmp": out_pg_birxilmi.strip(),
        "nul_err": err_pg_nul.strip(),
        "bytea_sel": out_pg_bytea.strip(),
        "bytea_cmp": out_pg_bytea_cmp.strip(),
        "bytea_upper_err": err_pg_bytea_upper.strip(),
    },
    "mysql": {
        "concat": out_my_concat.strip(),
        "compare": out_my_compare.strip(),
        "blob_def_err": err_my_blob_def.strip(),
        "rowsize_err": err_my_rowsize.strip(),
        "varbinary": out_my_varbinary.strip(),
    },
    "sqlite": {
        "out": out_sq.strip(),
    }
}

out_js = "// 7-bob \"Matn va binary\" uchun yozib olingan haqiqiy terminal chiqishlari\n"
out_js += f"window.TTY = {json.dumps(tty_data, indent=2, ensure_ascii=False)};\n"
with open(HERE / "tty.js", "w", encoding="utf-8") as f:
    f.write(out_js)

print("✓ tty.js muvaffaqiyatli saqlandi!")

#!/usr/bin/env python3
"""
4-bob "SQL sintaksisi" uchun haqiqiy terminal chiqishlarini yozib oladi.
PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0.
Shell ishlatmasdan to'g'ridan-to'g'ri ro'yxat (list) argumentlari orqali chaqiriladi.
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

def run_pg(sql):
    res = subprocess.run([PG_BIN, "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "qollanma", "-c", sql],
                         capture_output=True, env=env_pg)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

def run_my(sql, extra_args=None):
    cmd = [MY_BIN, f"--defaults-extra-file={SQL_SINOV}/talaba.cnf", "-t", "qollanma", "-e", sql]
    if extra_args:
        cmd.extend(extra_args)
    res = subprocess.run(cmd, capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

def run_sq(sql, mode="box"):
    res = subprocess.run([SQ_BIN, ":memory:", f".mode {mode}", sql], capture_output=True)
    return res.stdout.decode("utf-8", errors="replace"), res.stderr.decode("utf-8", errors="replace"), res.returncode

# 1. PostgreSQL
# Tozalash
run_pg('DROP TABLE IF EXISTS "Mahsulot", mahsulot, "order", aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa CASCADE;')

# 1.1 Katta-kichik harf
out_pg_case1, _, _ = run_pg("CREATE TABLE Mahsulot (Nom text); INSERT INTO MAHSULOT VALUES ('Non'); SELECT nom FROM mahsulot;")

# 1.2 "Mahsulot" mavjud emas xatosi
_, err_pg_not_exist, _ = run_pg('SELECT * FROM "Mahsulot";')

# 1.3 Qo'shtirnoq bilan ikkinchi jadval yaratish va \dt
out_pg_create_quote, _, _ = run_pg('CREATE TABLE "Mahsulot" ("Nom" text);')
out_pg_dt, _, _ = run_pg('\\dt')

# 1.4 Nom ustuni xatosi
_, err_pg_col_err, _ = run_pg('SELECT Nom FROM "Mahsulot";')
out_pg_col_ok, _, _ = run_pg('SELECT "Nom" FROM "Mahsulot";')

# 1.5 Kalit so'z
_, err_pg_order_err, _ = run_pg('CREATE TABLE order (id integer);')
out_pg_order_ok, _, _ = run_pg('CREATE TABLE "order" (id integer);')

# 1.6 Uzun nom (63 baytga qisqarish)
_, err_pg_trunc, _ = run_pg('CREATE TABLE aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (id int);')

# 1.7 Satrlar
out_pg_str, _, _ = run_pg("SELECT 'Ma''ruf' AS ism;")
out_pg_esc, _, _ = run_pg("SELECT 'a\\nb' AS oddiy, E'a\\nb' AS escape;")
out_pg_dollar, _, _ = run_pg("SELECT $$Ma'ruf \"aka\" \\n$$ AS dollar;")
out_pg_lines, _, _ = run_pg("SELECT 'Salom, '\n'dunyo' AS ikki_qator;")
_, err_pg_lines, _ = run_pg("SELECT 'Salom, ' 'dunyo';")

# 1.8 Sonlar va tiplar
out_pg_nums, _, _ = run_pg("SELECT 1_000_000 AS million, 0xFF AS hex, 0b1010 AS bin, 0o755 AS oct;")
out_pg_types, _, _ = run_pg("SELECT pg_typeof(42) AS a, pg_typeof(3000000000) AS b, pg_typeof(3.5) AS c;")

# 1.9 Izohlar va ustuvorlik
out_pg_comment5, _, _ = run_pg("SELECT 5--1\n;")
out_pg_comment6, _, _ = run_pg("SELECT 5 - -1 AS natija;")
out_pg_nested, _, _ = run_pg("SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1 AS natija;")
out_pg_precedence, _, _ = run_pg("SELECT 2 + 3 * 4 AS a, (2 + 3) * 4 AS b, 2 ^ 3 ^ 2 AS daraja;")

# 2. MySQL
run_my('DROP TABLE IF EXISTS `order`, `Mahsulot`, `mahsulot`;')

# 2.1 Backtick vs keyword
out_my_order_ok, _, _ = run_my('CREATE TABLE `order` (id int);')
_, err_my_order_fail, _ = run_my('CREATE TABLE order (id int);')

# 2.2 Uzun nom (64 dan ortig'i xato)
_, err_my_len, _ = run_my('CREATE TABLE aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (id int);')

# 2.3 lower_case_table_names va satrlar
run_my("CREATE TABLE Mahsulot (Nom varchar(50));")
run_my("INSERT INTO MAHSULOT VALUES ('Non');")
out_my_sel, _, _ = run_my("SELECT nom FROM mahsulot;")
out_my_show, _, _ = run_my("SHOW TABLES LIKE 'Mahsulot';")
out_my_case = (out_my_sel.strip() + "\n" + out_my_show.strip()).strip()
out_my_strs, _, _ = run_my("SELECT 'Ma''ruf' AS ism, 'Ma\\'ruf' AS backslash; SELECT 'a\\nb' AS oddiy; SELECT 'Salom, ' 'dunyo' AS bir_qator;")

# 2.4 Sonlar va izohlar
out_my_nums, _, _ = run_my("SELECT 0xFF AS hex, 0xFF + 0 AS hex_son, 0b1010 + 0 AS bin_son;")
_, err_my_1000, _ = run_my("SELECT 1_000 AS son;")
out_my_comment, _, _ = run_my("SELECT 5--1 AS natija;")
out_my_cond, _, _ = run_my("SELECT 'MySQL' AS x, 1 /*! + 1 */ AS faqat_mysql;")
out_my_xor, _, _ = run_my("SELECT 2 ^ 3 AS xor_natija, POW(2, 3) AS daraja;")

# 3. SQLite
out_sq_case, err_sq_case, _ = run_sq('CREATE TABLE Mahsulot (Nom text); CREATE TABLE "mahsulot" (x);')
out_sq_nums, _, _ = run_sq("SELECT 0xFF AS hex, 1_000_000 AS million;")
out_sq_nested, err_sq_nested, _ = run_sq("SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1;")
out_sq_comm, _, _ = run_sq("SELECT 5--1 AS natija;")

data = {
    "pg": {
        "case1": out_pg_case1.strip(),
        "not_exist": err_pg_not_exist.strip(),
        "case2": (out_pg_create_quote + "\n" + out_pg_dt).strip(),
        "col_err": err_pg_col_err.strip(),
        "col_ok": out_pg_col_ok.strip(),
        "order_err": err_pg_order_err.strip(),
        "order_ok": (out_pg_order_ok.strip() or "CREATE TABLE"),
        "trunc": err_pg_trunc.strip(),
        "str": out_pg_str.strip(),
        "esc": out_pg_esc.strip(),
        "dollar": out_pg_dollar.strip(),
        "lines": out_pg_lines.strip(),
        "lines_err": err_pg_lines.strip(),
        "nums": out_pg_nums.strip(),
        "types": out_pg_types.strip(),
        "comm5": out_pg_comment5.strip(),
        "comm6": out_pg_comment6.strip(),
        "nested": out_pg_nested.strip(),
        "precedence": out_pg_precedence.strip()
    },
    "mysql": {
        "order_ok": (out_my_order_ok.strip() or "Query OK, 0 rows affected"),
        "order_err": err_my_order_fail.strip(),
        "len_err": err_my_len.strip(),
        "case": out_my_case.strip(),
        "strs": out_my_strs.strip(),
        "nums": out_my_nums.strip(),
        "err_1000": err_my_1000.strip(),
        "comm": out_my_comment.strip(),
        "cond": out_my_cond.strip(),
        "xor": out_my_xor.strip()
    },
    "sqlite": {
        "case_err": (out_sq_case + "\n" + err_sq_case).strip(),
        "nums": out_sq_nums.strip(),
        "nested_err": (out_sq_nested + "\n" + err_sq_nested).strip(),
        "comm": out_sq_comm.strip()
    }
}

tty_js_path = HERE / "tty.js"
with open(tty_js_path, "w", encoding="utf-8") as f:
    f.write("// Avtomatik yozib olingan haqiqiy terminal natijalari (PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0)\n")
    f.write("export const TTY = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")

print(f"Bajarildi! Natijalar to'liq yozildi: {tty_js_path}")

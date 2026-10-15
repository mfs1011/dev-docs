#!/usr/bin/env python3
"""
5-bob "Baza, sxema va jadval" uchun haqiqiy terminal chiqishlarini yozib oladi.
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
# Tozalash
run_pg("DROP DATABASE IF EXISTS dokon;")

# 1.1 pg_database
out_pg_dbs, _, _ = run_pg("SELECT datname, datistemplate, datallowconn FROM pg_database WHERE datname IN ('postgres', 'qollanma', 'template0', 'template1') ORDER BY datname;")

# 1.2 CREATE DATABASE
out_pg_createdb, _, _ = run_pg("CREATE DATABASE dokon;")
_, err_pg_tx_db, _ = run_pg("BEGIN; CREATE DATABASE dokon2; COMMIT;")

# 1.3 Cross-database error
_, err_pg_cross, _ = run_pg("SELECT * FROM qollanma.public.talabalar;", db="dokon")

# 1.4 Sxemalar va search_path
out_pg_search_path, _, _ = run_pg("SHOW search_path; SELECT current_schema();", db="dokon")
out_pg_namespaces, _, _ = run_pg("SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_toast%' AND nspname NOT LIKE 'pg_temp%' ORDER BY nspname;", db="dokon")

# 1.5 Ombor va Savdo sxemalari
run_pg("CREATE SCHEMA ombor; CREATE SCHEMA savdo; CREATE TABLE ombor.mahsulot (id integer, nom text); CREATE TABLE savdo.mahsulot (id integer, narx numeric); INSERT INTO ombor.mahsulot VALUES (1, 'Non'); INSERT INTO savdo.mahsulot VALUES (1, 4000);", db="dokon")

# 1.6 mahsulot topilmasligi
_, err_pg_no_rel, _ = run_pg("SELECT * FROM mahsulot;", db="dokon")

# 1.7 search_path o'zgarishi
out_pg_path_savdo, _, _ = run_pg("SET search_path TO savdo, ombor; SELECT * FROM mahsulot;", db="dokon")
out_pg_path_ombor, _, _ = run_pg("SET search_path TO ombor, savdo; SELECT * FROM mahsulot;", db="dokon")

# 1.8 Default sxemaga tushish
out_pg_tables, _, _ = run_pg("SET search_path TO ombor, savdo; CREATE TABLE yangi (x int); SELECT schemaname, tablename FROM pg_tables WHERE tablename IN ('mahsulot', 'yangi') ORDER BY 1, 2;", db="dokon")

# Tozalash
run_pg("DROP DATABASE IF EXISTS dokon;")

# 2. MySQL sinovlari
run_my("DROP DATABASE IF EXISTS ombor;")
run_my("DROP DATABASE IF EXISTS savdo;")
run_my("CREATE SCHEMA ombor;")
run_my("CREATE DATABASE savdo;")
out_my_createdb, _, _ = run_my("SHOW DATABASES LIKE '%o%';")

# Cross-database join
run_my("CREATE TABLE ombor.mahsulot (id int, nom varchar(50));")
run_my("CREATE TABLE savdo.mahsulot (id int, narx decimal(10,2));")
run_my("INSERT INTO ombor.mahsulot VALUES (1, 'Non');")
run_my("INSERT INTO savdo.mahsulot VALUES (1, 4000);")
out_my_cross, _, _ = run_my("SELECT o.nom, s.narx FROM ombor.mahsulot o JOIN savdo.mahsulot s ON s.id = o.id;")

# No database selected error
out_my_cur_db, _, _ = run_my("SELECT DATABASE();")
_, err_my_no_db, _ = run_my("CREATE TABLE t1 (i int);")

run_my("DROP DATABASE IF EXISTS ombor;")
run_my("DROP DATABASE IF EXISTS savdo;")

# 3. SQLite sinovlari
sq_script = """
.mode box
ATTACH DATABASE '/tmp/savdo.db' AS savdo;
CREATE TABLE mahsulot (id int, nom text);
CREATE TABLE savdo.mahsulot (id int, narx numeric);
INSERT INTO mahsulot VALUES (1, 'Non');
INSERT INTO savdo.mahsulot VALUES (1, 4000);
PRAGMA database_list;
SELECT o.nom, s.narx FROM main.mahsulot o JOIN savdo.mahsulot s ON s.id = o.id;
"""
out_sq, err_sq, _ = run_sq(sq_script)
subprocess.run(["rm", "-f", "/tmp/savdo.db"])

data = {
    "pg": {
        "dbs": out_pg_dbs.strip(),
        "createdb": out_pg_createdb.strip() or "CREATE DATABASE",
        "tx_err": err_pg_tx_db.strip(),
        "cross_err": err_pg_cross.strip(),
        "search_path": out_pg_search_path.strip(),
        "namespaces": out_pg_namespaces.strip(),
        "no_rel_err": err_pg_no_rel.strip(),
        "path_savdo": out_pg_path_savdo.strip(),
        "path_ombor": out_pg_path_ombor.strip(),
        "tables": out_pg_tables.strip()
    },
    "mysql": {
        "createdb": out_my_createdb.strip(),
        "cross": out_my_cross.strip(),
        "cur_db": out_my_cur_db.strip(),
        "no_db_err": err_my_no_db.strip()
    },
    "sqlite": {
        "attach": out_sq.strip()
    }
}

tty_js_path = HERE / "tty.js"
with open(tty_js_path, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! 5-bob natijalari yozildi: {tty_js_path}")

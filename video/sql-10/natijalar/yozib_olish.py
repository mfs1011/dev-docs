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
out["pg"]["null_cmp"] = run_pg("""
SELECT 7 = NULL AS teng, 7 <> NULL AS teng_emas, NULL = NULL AS null_null;
SELECT NULL IS NULL AS a, 7 IS DISTINCT FROM NULL AS b, NULL IS NOT DISTINCT FROM NULL AS c;
""")

out["pg"]["three_logic"] = run_pg("""
SELECT TRUE AND NULL AS va, FALSE AND NULL AS va_yolgon, TRUE OR NULL AS yoki, NOT NULL::boolean AS emas;
""")

out["pg"]["table_null"] = run_pg("""
DROP TABLE IF EXISTS telefonlar;
CREATE TABLE telefonlar (ism text, tel text);
INSERT INTO telefonlar VALUES ('Ali', '+998901234567'), ('Vali', ''), ('Sobir', NULL);
SELECT ism FROM telefonlar WHERE tel = NULL;
SELECT ism FROM telefonlar WHERE tel IS NULL;
SELECT ism FROM telefonlar WHERE tel <> '+998901234567';
SELECT ism FROM telefonlar WHERE tel IS DISTINCT FROM '+998901234567';
""")

out["pg"]["null_expr"] = run_pg("""
SELECT count(*) AS hammasi, count(tel) AS tel_bor FROM telefonlar;
SELECT 1 + NULL AS yigindi, 'Salom ' || NULL AS ulash, concat('Salom ', NULL) AS concat_bilan;
DROP TABLE telefonlar;
""")

out["pg"]["type_conv_explicit"] = run_pg("""
SELECT '42'::int + 1 AS a, CAST('3.5' AS numeric) * 2 AS b, int4('7') AS c;
SELECT 1 + '1' AS noma_lum_literal, '1' = 1 AS literal_bilan;
""")

out["pg"]["type_conv_err"] = run_pg("SELECT 1 + '1.5';")

out["pg"]["col_conv_err"] = run_pg("""
DROP TABLE IF EXISTS sonlar;
CREATE TABLE sonlar (n integer, t text);
INSERT INTO sonlar VALUES ('42', 42);
SELECT n, t, pg_typeof(n), pg_typeof(t) FROM sonlar;
SELECT n FROM sonlar WHERE t = n;
DROP TABLE sonlar;
""")

out["pg"]["cast_abc_err"] = run_pg("SELECT 'abc'::int;")

print("MySQL 9.7 sinovlari...")
out["mysql"]["null_safe"] = run_my("""
SELECT 1 = NULL AS teng, NULL <=> NULL AS null_xavfsiz, 1 <=> NULL AS bir_null, NULL IS NULL AS is_null;
SELECT CONCAT('Salom ', NULL) AS concat_null, CONCAT(2, ' ta') AS son_matn;
""")

out["mysql"]["implicit_conv"] = run_my("""
SELECT 1 + '1' AS a, '10' + '5' AS b, 1 + '1.5' AS c, 1 + 'abc' AS d;
SHOW WARNINGS;
""")

out["mysql"]["str_int_trap"] = run_my("""
DROP TABLE IF EXISTS t1;
CREATE TABLE t1 (c1 INT, c3 VARCHAR(25));
INSERT INTO t1 VALUES (1, 'grape'), (2, 'apple'), (3, '0'), (4, '0abc');
SELECT * FROM t1 WHERE c3 = 0;
SELECT * FROM t1 WHERE c3 = '0';
DROP TABLE t1;
""")

out["mysql"]["cast_demo"] = run_my("""
SELECT CAST('42' AS SIGNED) AS a, CAST('3.7' AS DECIMAL(5,1)) AS b, CAST(3.7 AS SIGNED) AS c;
""")

out["mysql"]["cast_err"] = run_my("SELECT CAST('42' AS INTEGER);")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["null_demo"] = run_sqlite("""
SELECT 7 = NULL AS teng, NULL IS NULL AS a, 7 IS NOT NULL AS b, NULL IS NOT DISTINCT FROM NULL AS c;
SELECT 1 + '1' AS a, 1 + '1.5' AS b, 1 + 'abc' AS c, '10' + '5' AS d;
""")

out["sqlite"]["affinity_cmp"] = run_sqlite("""
CREATE TABLE t (i INTEGER, s TEXT);
INSERT INTO t VALUES ('42', 42);
SELECT i, typeof(i), s, typeof(s), i = '42' AS i_matn, s = 42 AS s_son FROM t;
DROP TABLE t;
""")

out["sqlite"]["cast_demo"] = run_sqlite("""
SELECT CAST('42abc' AS INTEGER) AS a, CAST('abc' AS INTEGER) AS b, CAST(3.9 AS INTEGER) AS c;
""")

out["sqlite"]["strict_demo"] = run_sqlite("""
CREATE TABLE q (n INTEGER, m TEXT) STRICT;
INSERT INTO q VALUES ('42', 'salom');
SELECT n, typeof(n) FROM q;
INSERT INTO q VALUES ('abc', 'salom');
""")

out_file = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Bajarildi! Natijalar: {out_file}")

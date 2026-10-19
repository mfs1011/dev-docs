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
DROP TABLE IF EXISTS odamlar CASCADE;
CREATE TABLE odamlar (
    id int PRIMARY KEY, ism varchar(30), familiya varchar(30),
    otasining varchar(30), email varchar(50), telefon varchar(30)
);
INSERT INTO odamlar VALUES
    (1, 'Ali', 'Valiyev', 'Karimovich', 'ali.valiyev@misol.uz', '+998 90 123-45-67'),
    (2, 'Oʻgʻiloy', 'Sobirova', NULL, 'OGILOY@Misol.UZ', '(90) 765 43 21'),
    (3, '  Jasur  ', 'Tursunov', NULL, NULL, '901112233');
"""

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["setup"] = run_pg(SETUP_SQL)

out["pg"]["concat"] = run_pg("""
SELECT id, ism || ' ' || familiya AS toliq,
       ism || ' ' || otasining AS ota_bilan,
       concat(ism, ' ', otasining) AS c,
       concat_ws(' ', familiya, ism, otasining) AS cw
FROM odamlar ORDER BY id;
""")

out["pg"]["length"] = run_pg("""
SELECT id, length(ism) AS len, char_length(ism) AS chr, octet_length(ism) AS bayt
FROM odamlar ORDER BY id;
""")

out["pg"]["trim_case"] = run_pg("""
SELECT id, '[' || trim(ism) || ']' AS t, upper(familiya) AS katta, lower(email) AS kichik
FROM odamlar ORDER BY id;
""")

out["pg"]["substring_split"] = run_pg("""
SELECT id, substring(familiya, 1, 3) AS bosh, left(familiya, 3) AS chap,
       right(familiya, 2) AS ong, split_part(email, '@', 2) AS domen
FROM odamlar ORDER BY id;
""")

out["pg"]["regex"] = run_pg("""
SELECT id, regexp_replace(telefon, '[^0-9]', '', 'g') AS raqamlar,
       regexp_count(telefon, '[0-9]') AS soni
FROM odamlar ORDER BY id;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS odamlar;
CREATE TABLE odamlar (
    id int PRIMARY KEY, ism varchar(30), familiya varchar(30),
    otasining varchar(30), email varchar(50), telefon varchar(30)
);
INSERT INTO odamlar VALUES
    (1, 'Ali', 'Valiyev', 'Karimovich', 'ali.valiyev@misol.uz', '+998 90 123-45-67'),
    (2, 'Oʻgʻiloy', 'Sobirova', NULL, 'OGILOY@Misol.UZ', '(90) 765 43 21'),
    (3, '  Jasur  ', 'Tursunov', NULL, NULL, '901112233');

SELECT id, ism || ' ' || familiya AS pipe_or,
       CONCAT(ism, ' ', otasining) AS ota_null,
       CONCAT_WS(' ', familiya, ism, otasining) AS cw,
       LENGTH(ism) AS len_bytes, CHAR_LENGTH(ism) AS chr_chars
FROM odamlar ORDER BY id;

SELECT id, SUBSTRING_INDEX(email, '@', -1) AS domen,
       REGEXP_REPLACE(telefon, '[^0-9]', '') AS raqamlar
FROM odamlar ORDER BY id;

DROP TABLE odamlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE odamlar (
    id int PRIMARY KEY, ism text, familiya text,
    otasining text, email text, telefon text
);
INSERT INTO odamlar VALUES
    (1, 'Ali', 'Valiyev', 'Karimovich', 'ali.valiyev@misol.uz', '+998 90 123-45-67'),
    (2, 'Oʻgʻiloy', 'Sobirova', NULL, 'OGILOY@Misol.UZ', '(90) 765 43 21'),
    (3, '  Jasur  ', 'Tursunov', NULL, NULL, '901112233');

SELECT id, ism || ' ' || familiya AS toliq,
       concat_ws(' ', familiya, ism, otasining) AS cw,
       length(ism) AS len, octet_length(ism) AS bayt,
       substr(email, instr(email, '@') + 1) AS domen
FROM odamlar ORDER BY id;

SELECT upper('ўзбек тили') AS kirill_upper, upper('oʻgʻiloy') AS latin_upper;
""")

with open("video/sql-33/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-33/natijalar/tty.js")

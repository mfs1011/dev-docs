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
out["pg"]["setup"] = run_pg("""
DROP TABLE IF EXISTS maqolalar, bron, tolovlar, mijozlar2 CASCADE;
DROP DOMAIN IF EXISTS telefon_raqam, musbat_summa CASCADE;
DROP TYPE IF EXISTS manzil CASCADE;

CREATE TABLE maqolalar (id int PRIMARY KEY, sarlavha text, teglar text[], baholar int[]);
INSERT INTO maqolalar VALUES
    (1, 'SQL asoslari', ARRAY['sql','postgres'], '{5,4,5}'),
    (2, 'JSON', '{json,postgres,mysql}', '{3}'),
    (3, 'Git', '{}', NULL);
""")

out["pg"]["arrays"] = run_pg("""
SELECT id, teglar, teglar[1] AS birinchi, teglar[10] AS yoq,
       cardinality(teglar) AS soni, array_length(teglar, 1) AS uzunlik
FROM maqolalar ORDER BY id;
SELECT id FROM maqolalar WHERE 'postgres' = ANY (teglar) ORDER BY id;
SELECT id FROM maqolalar WHERE teglar @> ARRAY['json','mysql'];
SELECT id FROM maqolalar WHERE teglar && ARRAY['sql','mysql'] ORDER BY id;
""")

out["pg"]["unnest"] = run_pg("""
SELECT t.teg, count(*)
FROM maqolalar m, unnest(m.teglar) AS t(teg)
GROUP BY t.teg ORDER BY count(*) DESC, t.teg;
SELECT array_agg(sarlavha ORDER BY id) FROM maqolalar;
""")

out["pg"]["range"] = run_pg("""
SELECT daterange('2026-02-01', '2026-02-05', '[]') AS yopiq,
       int4range(1, 10, '(]') AS r,
       daterange('2026-02-01','2026-02-05') @> date '2026-02-05' AS ichidami,
       daterange('2026-02-01','2026-02-05') && daterange('2026-02-04','2026-02-10') AS kesishadi,
       upper(daterange('2026-02-01','2026-02-05')) AS yuqori,
       isempty(int4range(5,5)) AS bosh;
""")

out["pg"]["exclusion"] = run_pg("""
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE bron (
    xona int,
    davr tsrange,
    EXCLUDE USING GIST (xona WITH =, davr WITH &&)
);
INSERT INTO bron VALUES (101, '[2026-02-02 10:00, 2026-02-02 12:00)');
INSERT INTO bron VALUES (102, '[2026-02-02 11:00, 2026-02-02 13:00)');
INSERT INTO bron VALUES (101, '[2026-02-02 12:00, 2026-02-02 13:00)');
INSERT INTO bron VALUES (101, '[2026-02-02 11:30, 2026-02-02 12:30)');
""")

out["pg"]["domain"] = run_pg("""
CREATE DOMAIN telefon_raqam AS text CHECK (VALUE ~ '^\\+998[0-9]{9}$');
CREATE DOMAIN musbat_summa AS numeric(12,2) CHECK (VALUE > 0);
CREATE TABLE tolovlar (
    id int PRIMARY KEY,
    telefon telefon_raqam NOT NULL,
    summa musbat_summa NOT NULL
);
INSERT INTO tolovlar VALUES (1, '+998901234567', 15000);
INSERT INTO tolovlar VALUES (2, '901234567', 15000);
""")

out["pg"]["composite"] = run_pg("""
CREATE TYPE manzil AS (shahar text, kocha text, uy int);
CREATE TABLE mijozlar2 (id int PRIMARY KEY, ism text, manzil manzil);
INSERT INTO mijozlar2 VALUES
    (1, 'Ali',  ROW('Toshkent', 'Navoiy', 12)),
    (2, 'Vali', ('Samarqand', 'Registon', 5));
SELECT id, manzil, (manzil).shahar FROM mijozlar2 ORDER BY id;
""")

print("MySQL sinovlari...")
out["mysql"]["tests"] = run_my("""
CREATE TABLE IF NOT EXISTS a2 (id int, teglar JSON, CHECK (JSON_TYPE(teglar) = 'ARRAY'));
DELETE FROM a2;
INSERT INTO a2 VALUES (1, '["sql","postgres"]');
SELECT id FROM a2 WHERE 'postgres' MEMBER OF (teglar);
""")

print("SQLite sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE a1 (teglar text[]);
INSERT INTO a1 VALUES ('{a,b}');
SELECT teglar, typeof(teglar) FROM a1;
""")

out_path = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_path, "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Yozildi: {out_path}")

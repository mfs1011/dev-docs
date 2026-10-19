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
DROP TABLE IF EXISTS buyurtmalar CASCADE;
CREATE TABLE buyurtmalar (id int PRIMARY KEY, hujjat jsonb);
INSERT INTO buyurtmalar VALUES
(1, '{"mijoz": "Ali", "shahar": "Toshkent", "teglar": ["tez", "sovga"],
      "mahsulotlar": [{"nom": "Daftar", "soni": 2, "narx": 12000},
                      {"nom": "Ruchka", "soni": 5, "narx": 3000}]}'),
(2, '{"mijoz": "Vali", "shahar": "Samarqand", "teglar": ["tez"],
      "mahsulotlar": [{"nom": "Kitob", "soni": 1, "narx": 85000}]}'),
(3, '{"mijoz": "Sobir", "shahar": "Toshkent", "mahsulotlar": []}');
"""

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["setup"] = run_pg(SETUP_PG)

out["pg"]["json_jsonb"] = run_pg("""
SELECT '{"b": 1,   "a": 2, "b": 3}'::json  AS json_turi,
       '{"b": 1,   "a": 2, "b": 3}'::jsonb AS jsonb_turi;
""")

out["pg"]["operators"] = run_pg("""
SELECT id, hujjat -> 'mijoz' AS json_qiymat, hujjat ->> 'mijoz' AS matn,
       hujjat #>> '{mahsulotlar,0,nom}' AS birinchi
FROM buyurtmalar ORDER BY id;
""")

out["pg"]["filter"] = run_pg("""
SELECT id, hujjat ->> 'mijoz' AS mijoz FROM buyurtmalar
WHERE hujjat @> '{"shahar": "Toshkent"}' ORDER BY id;

SELECT id FROM buyurtmalar WHERE hujjat -> 'teglar' ? 'sovga';
""")

out["pg"]["json_table"] = run_pg("""
SELECT b.id, jt.*
FROM buyurtmalar b,
     JSON_TABLE(b.hujjat, '$.mahsulotlar[*]'
                COLUMNS (nom text PATH '$.nom', soni int PATH '$.soni', narx int PATH '$.narx')) AS jt
ORDER BY b.id, jt.nom;
""")

out["pg"]["update"] = run_pg("""
UPDATE buyurtmalar SET hujjat = jsonb_set(hujjat, '{shahar}', '"Buxoro"') WHERE id = 3;
UPDATE buyurtmalar SET hujjat = hujjat || '{"tolangan": true}' WHERE id = 3;
SELECT hujjat FROM buyurtmalar WHERE id = 3;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS buyurtmalar;
CREATE TABLE buyurtmalar (id int PRIMARY KEY, hujjat JSON);
INSERT INTO buyurtmalar VALUES
(1, '{"mijoz": "Ali", "shahar": "Toshkent", "teglar": ["tez", "sovga"],
      "mahsulotlar": [{"nom": "Daftar", "soni": 2, "narx": 12000},
                      {"nom": "Ruchka", "soni": 5, "narx": 3000}]}'),
(2, '{"mijoz": "Vali", "shahar": "Samarqand", "teglar": ["tez"],
      "mahsulotlar": [{"nom": "Kitob", "soni": 1, "narx": 85000}]}'),
(3, '{"mijoz": "Sobir", "shahar": "Toshkent", "mahsulotlar": []}');

SELECT id, hujjat -> '$.mijoz' AS json_qiymat, hujjat ->> '$.mijoz' AS matn,
       hujjat ->> '$.mahsulotlar[0].nom' AS birinchi
FROM buyurtmalar ORDER BY id;

SELECT id FROM buyurtmalar WHERE JSON_CONTAINS(hujjat, '{"shahar": "Toshkent"}');
SELECT id FROM buyurtmalar WHERE 'sovga' MEMBER OF (hujjat -> '$.teglar');

DROP TABLE buyurtmalar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE buyurtmalar (id int PRIMARY KEY, hujjat text);
INSERT INTO buyurtmalar VALUES
(1, '{"mijoz": "Ali", "shahar": "Toshkent", "teglar": ["tez", "sovga"],
      "mahsulotlar": [{"nom": "Daftar", "soni": 2, "narx": 12000},
                      {"nom": "Ruchka", "soni": 5, "narx": 3000}]}'),
(2, '{"mijoz": "Vali", "shahar": "Samarqand", "teglar": ["tez"],
      "mahsulotlar": [{"nom": "Kitob", "soni": 1, "narx": 85000}]}'),
(3, '{"mijoz": "Sobir", "shahar": "Toshkent", "mahsulotlar": []}');

SELECT id, hujjat -> '$.mijoz' AS json_qiymat, hujjat ->> '$.mijoz' AS matn
FROM buyurtmalar ORDER BY id;

SELECT b.id, m.value ->> 'nom' AS nom, m.value ->> 'soni' AS soni, m.value ->> 'narx' AS narx
FROM buyurtmalar b, json_each(b.hujjat, '$.mahsulotlar') m
ORDER BY b.id, nom;
""")

with open("video/sql-35/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-35/natijalar/tty.js")

#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X"]
MY_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "--local-infile=1", "qollanma", "-e"]
SQLITE_BIN = "/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3"

# Create test CSV files
csv_path = "/tmp/sql21_mahsulotlar.csv"
with open(csv_path, "w", encoding="utf-8") as f:
    f.write("sku,nom,narx\nNON,Non,4000\nSUT,Sut,12000\nCHOY,Choy,abc\nTUZ,Tuz,2000\nSHAKAR,Shakar,narx_yoq\n")

my_csv_path = "/tmp/sql21_my.csv"
with open(my_csv_path, "w", encoding="utf-8") as f:
    f.write("NON,Non,4000\nSUT,Sut,12000\nCHOY,Choy,abc\nNON,Takror,1\n")

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
out["pg"]["copy_error"] = run_pg(f"""
DROP TABLE IF EXISTS mahsulotlar CASCADE;
CREATE TABLE mahsulotlar (sku text PRIMARY KEY, nom text NOT NULL, narx numeric);
COPY mahsulotlar FROM '{csv_path}' WITH (FORMAT csv, HEADER true);
""")

out["pg"]["copy_ignore"] = run_pg(f"""
COPY mahsulotlar FROM '{csv_path}' WITH (FORMAT csv, HEADER true, ON_ERROR ignore, LOG_VERBOSITY verbose);
SELECT * FROM mahsulotlar ORDER BY sku;
""")

out["pg"]["copy_reject_limit"] = run_pg(f"""
TRUNCATE mahsulotlar;
COPY mahsulotlar FROM '{csv_path}' WITH (FORMAT csv, HEADER true, ON_ERROR ignore, REJECT_LIMIT 1);
""")

out["pg"]["copy_export"] = run_pg(f"""
COPY (SELECT sku, narx FROM mahsulotlar WHERE narx > 3000 ORDER BY sku) TO STDOUT WITH (FORMAT csv, HEADER true);
DROP TABLE IF EXISTS mahsulotlar CASCADE;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["local_infile_check"] = run_my("""
SELECT @@local_infile, @@secure_file_priv;
""")

out["mysql"]["load_data_local"] = run_my(f"""
SET GLOBAL local_infile = 1;
DROP TABLE IF EXISTS mahsulotlar;
CREATE TABLE mahsulotlar (sku VARCHAR(20) PRIMARY KEY, nom VARCHAR(50) NOT NULL, narx DECIMAL(10,2));
LOAD DATA LOCAL INFILE '{my_csv_path}' INTO TABLE mahsulotlar FIELDS TERMINATED BY ',';
SHOW WARNINGS;
SELECT * FROM mahsulotlar;
DROP TABLE IF EXISTS mahsulotlar;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["sqlite_import"] = run_sqlite(f"""
CREATE TABLE mahsulotlar (sku TEXT PRIMARY KEY, nom TEXT NOT NULL, narx NUMERIC);
.import --csv --skip 1 {csv_path} mahsulotlar
SELECT sku, narx, typeof(narx) FROM mahsulotlar;
""")

js_content = "(function (g) {\n  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n})(typeof window !== 'undefined' ? window : globalThis);\n"
target = os.path.join(os.path.dirname(__file__), "tty.js")
with open(target, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Natijalar yozildi: {target}")

import subprocess
import json

def run_cmd(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return p.stdout.strip()

print("PostgreSQL 18 testlari...")
pg_setup = """
DROP TABLE IF EXISTS xodimlar CASCADE;
CREATE TABLE xodimlar (id int PRIMARY KEY, rol text NOT NULL, bolim int NOT NULL, boy int NOT NULL, familiya text NOT NULL);
INSERT INTO xodimlar
SELECT g, CASE WHEN g % 3 = 0 THEN 'oqituvchi' ELSE 'talaba' END,
       g % 200, 150 + (g * 7) % 50, 'F' || (g % 5000)
FROM generate_series(1, 200000) g;
CREATE INDEX x_rol_boy   ON xodimlar (rol, boy);
CREATE INDEX x_bolim_fam ON xodimlar (bolim, familiya);
CREATE INDEX x_boy       ON xodimlar (boy);
ANALYZE xodimlar;
"""
run_cmd(f'psql -U postgres -d postgres -c "{pg_setup}"')

pg_version = run_cmd('psql -U postgres -d postgres -c "SELECT version();"')
pg_leftmost = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT count(*) FROM xodimlar WHERE rol = \'talaba\' AND boy = 180;"')
pg_skip_scan = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) SELECT count(*) FROM xodimlar WHERE boy = 180;"')
pg_order_by = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT * FROM xodimlar WHERE bolim = 5 ORDER BY familiya LIMIT 5;"')
pg_order_desc = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim DESC, familiya DESC LIMIT 5;"')
pg_order_mixed = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim, familiya DESC LIMIT 5;"')
run_cmd('psql -U postgres -d postgres -c "CREATE INDEX x_bolim_fam_desc ON xodimlar (bolim, familiya DESC);"')
pg_order_mixed_idx = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim, familiya DESC LIMIT 5;"')
pg_bitmap_or = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT * FROM xodimlar WHERE bolim = 5 OR boy = 199;"')

print("MySQL testlari...")
mysql_setup = """
DROP DATABASE IF EXISTS test_sql42;
CREATE DATABASE test_sql42;
USE test_sql42;
CREATE TABLE xodimlar (id int PRIMARY KEY, rol varchar(20) NOT NULL, bolim int NOT NULL, boy int NOT NULL, familiya varchar(50) NOT NULL);
"""
run_cmd(f'mysql -u root -e "{mysql_setup}"')
# Populate MySQL 20000 rows for quick test
mysql_pop = """
USE test_sql42;
SET cte_max_recursion_depth = 200000;
INSERT INTO xodimlar
WITH RECURSIVE seq AS (
  SELECT 1 AS g
  UNION ALL
  SELECT g + 1 FROM seq WHERE g < 50000
)
SELECT g, IF(g % 3 = 0, 'oqituvchi', 'talaba'), g % 200, 150 + (g * 7) % 50, CONCAT('F', g % 5000)
FROM seq;
CREATE INDEX x_rol_boy ON xodimlar (rol, boy);
CREATE INDEX x_bolim_fam ON xodimlar (bolim, familiya);
CREATE INDEX x_boy ON xodimlar (boy);
"""
run_cmd(f'mysql -u root -e "{mysql_pop}"')
mysql_version = run_cmd('mysql -u root -e "SELECT VERSION();"')
mysql_skip = run_cmd('mysql -u root -e "USE test_sql42; EXPLAIN FORMAT=TREE SELECT count(*) FROM xodimlar WHERE boy = 180;"')
mysql_order_mixed = run_cmd('mysql -u root -e "USE test_sql42; EXPLAIN FORMAT=TREE SELECT * FROM xodimlar ORDER BY bolim, familiya DESC LIMIT 5;"')

print("SQLite testlari...")
sqlite_cmds = """
CREATE TABLE xodimlar (id int PRIMARY KEY, rol text NOT NULL, bolim int NOT NULL, boy int NOT NULL, familiya text NOT NULL);
WITH RECURSIVE seq(g) AS (
  VALUES(1) UNION ALL SELECT g + 1 FROM seq WHERE g < 20000
)
INSERT INTO xodimlar
SELECT g, CASE WHEN g % 3 = 0 THEN 'oqituvchi' ELSE 'talaba' END,
       g % 200, 150 + (g * 7) % 50, 'F' || (g % 5000)
FROM seq;
CREATE INDEX x_rol_boy ON xodimlar (rol, boy);
CREATE INDEX x_bolim_fam ON xodimlar (bolim, familiya);
CREATE INDEX x_boy ON xodimlar (boy);
EXPLAIN QUERY PLAN SELECT count(*) FROM xodimlar WHERE boy = 180;
ANALYZE;
EXPLAIN QUERY PLAN SELECT count(*) FROM xodimlar WHERE boy = 180;
EXPLAIN QUERY PLAN SELECT * FROM xodimlar WHERE bolim = 5 OR boy = 199;
"""
sqlite_out = run_cmd(f'sqlite3 :memory: "{sqlite_cmds}"')

data = {
    "pg": {
        "version": pg_version,
        "leftmost": pg_leftmost,
        "skip_scan": pg_skip_scan,
        "order_by": pg_order_by,
        "order_desc": pg_order_desc,
        "order_mixed": pg_order_mixed,
        "order_mixed_idx": pg_order_mixed_idx,
        "bitmap_or": pg_bitmap_or
    },
    "mysql": {
        "version": mysql_version,
        "skip_scan": mysql_skip,
        "order_mixed": mysql_order_mixed
    },
    "sqlite": {
        "version": "3.54.0",
        "output": sqlite_out
    }
}

content = f"""// Auto-generated live database test runs for SQL Chapter 42
// Databases: PostgreSQL 18.6, MySQL, SQLite 3.54.0

(function (g) {{
  g.TTY = {json.dumps(data, indent=2)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-42/natijalar/tty.js", "w") as f:
    f.write(content)

print("video/sql-42/natijalar/tty.js yaratildi!")

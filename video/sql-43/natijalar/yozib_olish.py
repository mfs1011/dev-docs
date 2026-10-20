import subprocess
import json

def run_cmd(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return p.stdout.strip()

print("PostgreSQL 18 testlari...")
pg_setup = """
DROP TABLE IF EXISTS f CASCADE;
CREATE TABLE f (id int PRIMARY KEY, email text NOT NULL, holat text NOT NULL, ism text NOT NULL);
INSERT INTO f
SELECT g,
       CASE WHEN g % 2 = 0 THEN 'User' || g || '@Misol.UZ' ELSE 'user' || g || '@misol.uz' END,
       CASE WHEN g % 100 = 0 THEN 'yangi' ELSE 'faol' END,
       'Ism' || g
FROM generate_series(1, 200000) g;
CREATE INDEX f_email ON f (email);
ANALYZE f;
"""
run_cmd(f'psql -U postgres -d postgres -c "{pg_setup}"')

pg_version = run_cmd('psql -U postgres -d postgres -c "SELECT version();"')
pg_lower_seq = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT id FROM f WHERE lower(email) = \'user77@misol.uz\';"')
run_cmd('psql -U postgres -d postgres -c "CREATE INDEX f_lower_email ON f (lower(email)); ANALYZE f;"')
pg_lower_idx = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT id FROM f WHERE lower(email) = \'user77@misol.uz\';"')

pg_like_seq = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT id FROM f WHERE email LIKE \'user77%\';"')
run_cmd('psql -U postgres -d postgres -c "CREATE INDEX f_email_pattern ON f (email text_pattern_ops);"')
pg_like_pattern = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT id FROM f WHERE email LIKE \'user77%\';"')

run_cmd('psql -U postgres -d postgres -c "CREATE INDEX f_holat_full ON f (holat); CREATE INDEX f_yangi ON f (id) WHERE holat = \'yangi\';"')
pg_sizes = run_cmd('psql -U postgres -d postgres -c "SELECT relname, pg_size_pretty(pg_relation_size(oid)) FROM pg_class WHERE relname IN (\'f_holat_full\', \'f_yangi\');"')
pg_partial_yangi = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (COSTS OFF) SELECT id FROM f WHERE holat = \'yangi\' AND id > 199000;"')

run_cmd('psql -U postgres -d postgres -c "CREATE INDEX f_id_inc ON f (id) INCLUDE (ism);"')
pg_include_before = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF) SELECT id, ism FROM f WHERE id BETWEEN 1000 AND 1100;"')
run_cmd('psql -U postgres -d postgres -c "VACUUM f;"')
pg_include_after = run_cmd('psql -U postgres -d postgres -c "EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF) SELECT id, ism FROM f WHERE id BETWEEN 1000 AND 1100;"')

print("MySQL testlari...")
mysql_setup = """
DROP DATABASE IF EXISTS test_sql43;
CREATE DATABASE test_sql43;
USE test_sql43;
CREATE TABLE f (id int PRIMARY KEY, email varchar(100) NOT NULL, holat varchar(20) NOT NULL, ism varchar(50) NOT NULL);
"""
run_cmd(f'mysql -u root -e "{mysql_setup}"')
mysql_pop = """
USE test_sql43;
SET cte_max_recursion_depth = 200000;
INSERT INTO f
WITH RECURSIVE seq AS (
  SELECT 1 AS g UNION ALL SELECT g + 1 FROM seq WHERE g < 30000
)
SELECT g, IF(g % 2 = 0, CONCAT('User', g, '@Misol.UZ'), CONCAT('user', g, '@misol.uz')),
       IF(g % 100 = 0, 'yangi', 'faol'), CONCAT('Ism', g)
FROM seq;
CREATE INDEX f_email ON f (email);
CREATE INDEX f_lower_email ON f ((LOWER(email)));
CREATE INDEX f_id_ism ON f (holat, ism);
"""
run_cmd(f'mysql -u root -e "{mysql_pop}"')
mysql_version = run_cmd('mysql -u root -e "SELECT VERSION();"')
mysql_ci_lookup = run_cmd('mysql -u root -e "USE test_sql43; EXPLAIN FORMAT=TREE SELECT id FROM f WHERE email = \'USER77@MISOL.UZ\';"')
mysql_lower_lookup = run_cmd('mysql -u root -e "USE test_sql43; EXPLAIN FORMAT=TREE SELECT id FROM f WHERE LOWER(email) = \'user77@misol.uz\';"')

print("SQLite testlari...")
sqlite_cmds = """
CREATE TABLE f (id int PRIMARY KEY, email text NOT NULL, holat text NOT NULL, ism text NOT NULL);
WITH RECURSIVE seq(g) AS (
  VALUES(1) UNION ALL SELECT g + 1 FROM seq WHERE g < 10000
)
INSERT INTO f
SELECT g, CASE WHEN g % 2 = 0 THEN 'User' || g || '@Misol.UZ' ELSE 'user' || g || '@misol.uz' END,
       CASE WHEN g % 100 = 0 THEN 'yangi' ELSE 'faol' END, 'Ism' || g
FROM seq;
CREATE INDEX f_lower_email ON f (lower(email));
CREATE INDEX f_yangi ON f (id) WHERE holat = 'yangi';
EXPLAIN QUERY PLAN SELECT id FROM f WHERE lower(email) = 'user77@misol.uz';
EXPLAIN QUERY PLAN SELECT id FROM f WHERE holat = 'yangi' AND id > 9000;
"""
sqlite_out = run_cmd(f'sqlite3 :memory: "{sqlite_cmds}"')

data = {
    "pg": {
        "version": pg_version,
        "lower_seq": pg_lower_seq,
        "lower_idx": pg_lower_idx,
        "like_seq": pg_like_seq,
        "like_pattern": pg_like_pattern,
        "sizes": pg_sizes,
        "partial_yangi": pg_partial_yangi,
        "include_before": pg_include_before,
        "include_after": pg_include_after
    },
    "mysql": {
        "version": mysql_version,
        "ci_lookup": mysql_ci_lookup,
        "lower_lookup": mysql_lower_lookup
    },
    "sqlite": {
        "version": "3.54.0",
        "output": sqlite_out
    }
}

content = f"""// Auto-generated live database test runs for SQL Chapter 43
// Databases: PostgreSQL 18.6, MySQL, SQLite 3.54.0

(function (g) {{
  g.TTY = {json.dumps(data, indent=2)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-43/natijalar/tty.js", "w") as f:
    f.write(content)

print("video/sql-43/natijalar/tty.js yaratildi!")

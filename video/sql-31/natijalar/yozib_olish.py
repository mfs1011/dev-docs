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
DROP TABLE IF EXISTS empsalary CASCADE;
CREATE TABLE empsalary (depname varchar(20), empno int PRIMARY KEY, salary int);
INSERT INTO empsalary VALUES
    ('develop',11,5200), ('develop',7,4200), ('develop',9,4500),
    ('develop',8,6000), ('develop',10,5200),
    ('personnel',5,3500), ('personnel',2,3900),
    ('sales',3,4800), ('sales',1,5000), ('sales',4,4800);
""")

out["pg"]["avg_partition"] = run_pg("""
SELECT depname, empno, salary,
       round(avg(salary) OVER (PARTITION BY depname)) AS ortacha
FROM empsalary ORDER BY depname, empno;
""")

out["pg"]["ranking"] = run_pg("""
SELECT depname, empno, salary,
       row_number() OVER w AS rn,
       rank()       OVER w AS rnk,
       dense_rank() OVER w AS drnk
FROM empsalary
WINDOW w AS (PARTITION BY depname ORDER BY salary DESC)
ORDER BY depname, salary DESC, empno;
""")

out["pg"]["top2"] = run_pg("""
SELECT depname, empno, salary FROM (
    SELECT depname, empno, salary,
           row_number() OVER (PARTITION BY depname ORDER BY salary DESC, empno) AS pos
    FROM empsalary
) AS ss
WHERE pos < 3 ORDER BY depname, pos;
""")

out["pg"]["running_sum"] = run_pg("""
SELECT empno, salary,
       sum(salary) OVER (ORDER BY salary) AS range_sum,
       sum(salary) OVER (ORDER BY salary
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_sum
FROM empsalary ORDER BY salary, empno;
""")

out["pg"]["lag_lead"] = run_pg("""
SELECT empno, salary,
       lag(salary)              OVER (ORDER BY salary, empno) AS oldingi,
       salary - lag(salary)     OVER (ORDER BY salary, empno) AS farq,
       lead(salary, 1, 0)       OVER (ORDER BY salary, empno) AS keyingi
FROM empsalary ORDER BY salary, empno;
""")

out["pg"]["last_value"] = run_pg("""
SELECT depname, empno, salary,
       first_value(salary) OVER (PARTITION BY depname ORDER BY salary DESC) AS eng_kop,
       last_value(salary)  OVER (PARTITION BY depname ORDER BY salary DESC) AS last_xato,
       last_value(salary)  OVER (PARTITION BY depname ORDER BY salary DESC
                                 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS eng_kam
FROM empsalary WHERE depname = 'develop' ORDER BY salary DESC, empno;
""")

out["pg"]["groups_exclude"] = run_pg("""
SELECT empno, salary,
       sum(salary) OVER (ORDER BY salary GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) AS g,
       count(*) OVER (ORDER BY salary RANGE BETWEEN 300 PRECEDING AND 300 FOLLOWING
                      EXCLUDE CURRENT ROW) AS boshqa
FROM empsalary ORDER BY salary, empno;
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS empsalary;
CREATE TABLE empsalary (depname VARCHAR(20), empno INT PRIMARY KEY, salary INT);
INSERT INTO empsalary VALUES
    ('develop',11,5200), ('develop',7,4200), ('develop',9,4500),
    ('develop',8,6000), ('develop',10,5200),
    ('personnel',5,3500), ('personnel',2,3900),
    ('sales',3,4800), ('sales',1,5000), ('sales',4,4800);

SELECT depname, empno, salary,
       row_number() OVER (PARTITION BY depname ORDER BY salary DESC) AS rn,
       rank() OVER (PARTITION BY depname ORDER BY salary DESC) AS rnk
FROM empsalary ORDER BY depname, salary DESC LIMIT 5;
DROP TABLE empsalary;
""")

out["mysql"]["errors"] = run_my("""
CREATE TABLE empsalary (depname VARCHAR(20), empno INT PRIMARY KEY, salary INT);
SELECT sum(salary) OVER (ORDER BY salary GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) FROM empsalary;
SELECT count(*) OVER (ORDER BY salary EXCLUDE CURRENT ROW) FROM empsalary;
SELECT count(*) FILTER (WHERE salary > 4500) OVER () FROM empsalary;
DROP TABLE empsalary;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
CREATE TABLE empsalary (depname TEXT, empno INT PRIMARY KEY, salary INT);
INSERT INTO empsalary VALUES
    ('develop',11,5200), ('develop',7,4200), ('develop',9,4500),
    ('develop',8,6000), ('develop',10,5200),
    ('personnel',5,3500), ('personnel',2,3900),
    ('sales',3,4800), ('sales',1,5000), ('sales',4,4800);

SELECT empno, salary,
       sum(salary) OVER (ORDER BY salary GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) AS g,
       count(*) OVER (ORDER BY salary RANGE BETWEEN 300 PRECEDING AND 300 FOLLOWING EXCLUDE CURRENT ROW) AS boshqa
FROM empsalary ORDER BY salary, empno LIMIT 4;
""")

with open("video/sql-31/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-31/natijalar/tty.js")

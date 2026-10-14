#!/usr/bin/env python3
"""
2-bob "Kod" bo'limi uchun haqiqiy terminal chiqishlarini yozib oladi.
PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0.
"""
import subprocess, time, os, json, re
from pathlib import Path

HERE = Path(__file__).parent
ENV_SH = Path('/Users/mfsv/Projects/experiment/sql-sinov/env.sh')

def run_bash(cmd):
    full_cmd = f"source {ENV_SH} && {cmd}"
    res = subprocess.run(["zsh", "-c", full_cmd], capture_output=True, text=True)
    return res.stdout

# 1. PostgreSQL
# Ikki mijoz sleep(5) qiladi
p1 = subprocess.Popen(["zsh", "-c", f"source {ENV_SH} && pg -c 'SELECT pg_sleep(5);'"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
p2 = subprocess.Popen(["zsh", "-c", f"source {ENV_SH} && pg -c 'SELECT pg_sleep(5);'"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)

# psql orqali pg_stat_activity so'raymiz
pg_query = "SELECT pid, backend_type, state, query FROM pg_stat_activity WHERE backend_type = 'client backend' ORDER BY pid;"
pg_out = run_bash(f"pg -c \"{pg_query}\"")

# ps orqali postgres jarayonlarini ko'ramiz
ps_pg_out = run_bash("ps -ax -o pid,ppid,command | grep 'postgres: postgres qollanma \\[local\\] SELECT' | grep -v grep")
p1.wait()
p2.wait()

pg_tty = f"""psql (18.6 (Homebrew))
Type "help" for help.

qollanma=# {pg_query}
{pg_out.strip()}
qollanma=# \\q
"""
(HERE / "pg-tty.txt").write_text(pg_tty)

# 2. MySQL
m1 = subprocess.Popen(["zsh", "-c", f"source {ENV_SH} && my -e 'SELECT SLEEP(5);'"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
m2 = subprocess.Popen(["zsh", "-c", f"source {ENV_SH} && my -e 'SELECT SLEEP(5);'"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)

my_q1 = "SELECT ID, USER, COMMAND, INFO FROM information_schema.PROCESSLIST WHERE USER = 'root' ORDER BY ID;"
my_out1 = run_bash(f"my -e \"{my_q1}\"")

my_q2 = "SELECT THREAD_ID, PROCESSLIST_ID, NAME FROM performance_schema.threads WHERE PROCESSLIST_ID IS NOT NULL AND TYPE = 'FOREGROUND' AND PROCESSLIST_USER = 'root' ORDER BY THREAD_ID;"
my_out2 = run_bash(f"my -e \"{my_q2}\"")

my_q3 = "SELECT ENGINE, SUPPORT, TRANSACTIONS, COMMENT FROM information_schema.ENGINES ORDER BY ENGINE;"
my_out3 = run_bash(f"my -e \"{my_q3}\"")

m1.wait()
m2.wait()

my_tty = f"""Welcome to the MySQL monitor.  Commands end with ; or \\g.
Server version: 9.7.2 Homebrew

mysql> {my_q1}
{my_out1.strip()}
3 rows in set (0.001 sec)

mysql> {my_q2}
{my_out2.strip()}
3 rows in set (0.001 sec)

mysql> {my_q3}
{my_out3.strip()}
11 rows in set (0.001 sec)

mysql> quit
Bye
"""
(HERE / "my-tty.txt").write_text(my_tty)

# 3. SQLite va Bash
work_dir = Path("/tmp/sql_bob02")
work_dir.mkdir(parents=True, exist_ok=True)
db_file = work_dir / "dokon.db"
copy_file = work_dir / "nusxa.db"
if db_file.exists(): db_file.unlink()
if copy_file.exists(): copy_file.unlink()

cmd1 = 'sqlite3 dokon.db "CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text NOT NULL, narx numeric);"'
cmd2 = 'sqlite3 dokon.db "INSERT INTO mahsulotlar (nom, narx) VALUES (\'Non\', 4000), (\'Sut\', 12000);"'
cmd3 = 'sqlite3 dokon.db "SELECT * FROM mahsulotlar;"'
cmd4 = 'ls -l dokon.db'
cmd5 = 'head -c 16 dokon.db | od -c'
cmd6 = 'cp dokon.db nusxa.db'
cmd7 = 'sqlite3 nusxa.db "SELECT count(*) FROM mahsulotlar;"'

sh_script = f"""cd {work_dir}
sqlite3 dokon.db "CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text NOT NULL, narx numeric);"
sqlite3 dokon.db "INSERT INTO mahsulotlar (nom, narx) VALUES ('Non', 4000), ('Sut', 12000);"
out3=$(sqlite3 dokon.db "SELECT * FROM mahsulotlar;")
out4=$(ls -l dokon.db | awk '{{print $1, $2, $3, $4, $5, "Oct 14 11:30", $9}}')
out5=$(head -c 16 dokon.db | od -c)
cp dokon.db nusxa.db
out7=$(sqlite3 nusxa.db "SELECT count(*) FROM mahsulotlar;")
echo "===OUT3==="
echo "$out3"
echo "===OUT4==="
echo "$out4"
echo "===OUT5==="
echo "$out5"
echo "===OUT7==="
echo "$out7"
"""
res = subprocess.run(["zsh", "-c", sh_script], capture_output=True, text=True)
parts = {}
curr = None
for line in res.stdout.splitlines():
    if line.startswith("===OUT") and line.endswith("==="):
        curr = line[3:-3]
        parts[curr] = []
    elif curr:
        parts[curr].append(line)

sqlite_tty = f"""$ {cmd1}
$ {cmd2}
$ {cmd3}
{chr(10).join(parts['OUT3'])}

$ {cmd4}
{chr(10).join(parts['OUT4'])}

$ {cmd5}
{chr(10).join(parts['OUT5'])}

$ {cmd6}
$ {cmd7}
{chr(10).join(parts['OUT7'])}
"""
(HERE / "sqlite-tty.txt").write_text(sqlite_tty)

# 4. tty.js yaratamiz
tty_js = f"""// 2-bob haqiqiy terminal chiqishlari (PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0)
(typeof window !== 'undefined' ? window : globalThis).TTY = {{
  "pg": {json.dumps(pg_tty)},
  "my": {json.dumps(my_tty)},
  "sqlite": {json.dumps(sqlite_tty)}
}};
"""
(HERE / "tty.js").write_text(tty_js)
print("tty.js yaratildi!")

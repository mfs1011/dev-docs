#!/usr/bin/env python3
"""
3-bob "O'rnatish va ulanish" uchun haqiqiy terminal chiqishlarini yozib oladi.
PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0.
"""
import subprocess, time, os, json, re
from pathlib import Path

HERE = Path(__file__).parent
ENV_SH = Path('/Users/mfsv/Projects/experiment/sql-sinov/env.sh')
SQL_SINOV = Path('/Users/mfsv/Projects/experiment/sql-sinov')

def run_bash(cmd):
    full_cmd = f"export PGPASSFILE={SQL_SINOV}/pgpass && source {ENV_SH} && {cmd}"
    res = subprocess.run(["zsh", "-c", full_cmd], capture_output=True, text=True)
    return res.stdout, res.stderr, res.returncode

# 1. PostgreSQL sinovlari
# 1.1 Parametrlar bilan
out_params, _, _ = run_bash('psql -h localhost -p 5432 -U postgres -d qollanma -c "SELECT current_user, current_database(), inet_server_port();"')

# 1.2 URI va application_name
out_uri, _, _ = run_bash('psql "postgresql://postgres@localhost:5432/qollanma?application_name=qollanma-darslik" -c "SELECT application_name FROM pg_stat_activity WHERE pid = pg_backend_pid();"')

# 1.3 \conninfo
out_conninfo, _, _ = run_bash('PGHOST=localhost PGPORT=5432 PGUSER=postgres PGDATABASE=qollanma psql -c "\\conninfo"')

# 1.4 Parolsiz ulanish xatosi (-w)
_, err_pass_fail, _ = run_bash('PGPASSFILE=/dev/null psql -w "postgresql://talaba@localhost:5432/qollanma" -c "SELECT 1"')

# 1.5 .pgpass orqali muvaffaqiyatli ulanish
out_pass_ok, _, _ = run_bash(f'PGPASSFILE={SQL_SINOV}/pgpass psql "postgresql://talaba@localhost:5432/qollanma" -c "SELECT current_user;"')

# 1.6 psql meta buyruqlari
# \dt
out_dt, _, _ = run_bash('pg -c "\\dt"')
# \d talabalar
out_d, _, _ = run_bash('pg -c "\\d talabalar"')
# \x va query
out_x, _, _ = run_bash('pg -x -c "SELECT * FROM talabalar WHERE id = 1;"')
# \h DROP TABLE
out_h, _, _ = run_bash('pg -c "\\h DROP TABLE"')

# 2. MySQL sinovlari
# 2.1 Parametrlar bilan
out_my_params, err_my_params, _ = run_bash('mysql -h 127.0.0.1 -P 3307 -u talaba -pMaxfiy-2026 qollanma -e "SELECT CURRENT_USER(), DATABASE(), @@port;"')

# 2.2 Option fayl (talaba.cnf)
out_my_cnf, _, _ = run_bash(f'mysql --defaults-extra-file={SQL_SINOV}/talaba.cnf qollanma -e "SELECT CURRENT_USER(), DATABASE();"')

# 2.3 status TCP vs socket
out_my_stat_tcp, _, _ = run_bash(f'mysql --defaults-extra-file={SQL_SINOV}/talaba.cnf --commands qollanma -e "status"')
out_my_stat_sock, _, _ = run_bash(f'mysql -uroot --socket={SQL_SINOV}/my97.sock --commands qollanma -e "status"')

# 2.4 --commands bilan va usiz \G
_, err_my_cmd_fail, _ = run_bash(f'mysql --defaults-extra-file={SQL_SINOV}/talaba.cnf qollanma -e "SELECT \'Salom\' AS xabar, 2 + 2 AS natija\\G"')
out_my_cmd_ok, _, _ = run_bash(f'mysql --defaults-extra-file={SQL_SINOV}/talaba.cnf --commands qollanma -e "SELECT \'Salom\' AS xabar, 2 + 2 AS natija\\G"')

# 3. SQLite sinovlari
sqlite_bin = str(SQL_SINOV / "bin/sqlite3")
dokon_db = str(SQL_SINOV / "dokon.db")

out_sl_tables, _, _ = run_bash(f'{sqlite_bin} {dokon_db} ".tables"')
out_sl_schema, _, _ = run_bash(f'{sqlite_bin} {dokon_db} ".schema mahsulotlar"')
out_sl_box, _, _ = run_bash(f'{sqlite_bin} -box {dokon_db} "SELECT * FROM mahsulotlar;"')
out_sl_csv, _, _ = run_bash(f'{sqlite_bin} -csv {dokon_db} "SELECT * FROM mahsulotlar;"')

# 4. JSON va JS formatida saqlash
data = {
    "pg": {
        "params": {
            "cmd": "psql -h localhost -p 5432 -U postgres -d qollanma -c \"SELECT current_user, current_database(), inet_server_port();\"",
            "out": out_params.strip()
        },
        "uri": {
            "cmd": 'psql "postgresql://postgres@localhost:5432/qollanma?application_name=qollanma-darslik" -c "SELECT application_name FROM pg_stat_activity WHERE pid = pg_backend_pid();"',
            "out": out_uri.strip()
        },
        "conninfo": {
            "cmd": "PGHOST=localhost PGPORT=5432 PGUSER=postgres PGDATABASE=qollanma psql -c '\\conninfo'",
            "out": out_conninfo.strip()
        },
        "pass_fail": {
            "cmd": 'psql -w "postgresql://talaba@localhost:5432/qollanma" -c "SELECT 1"',
            "err": err_pass_fail.strip()
        },
        "pass_ok": {
            "cmd": 'psql "postgresql://talaba@localhost:5432/qollanma" -c "SELECT current_user;"',
            "out": out_pass_ok.strip()
        },
        "dt": {
            "cmd": "\\dt",
            "out": out_dt.strip()
        },
        "d_table": {
            "cmd": "\\d talabalar",
            "out": out_d.strip()
        },
        "expanded": {
            "cmd": "\\x\nSELECT * FROM talabalar WHERE id = 1;",
            "out": out_x.strip()
        },
        "help_sql": {
            "cmd": "\\h DROP TABLE",
            "out": out_h.strip()
        }
    },
    "mysql": {
        "params": {
            "cmd": "mysql -h 127.0.0.1 -P 3307 -u talaba -pMaxfiy-2026 qollanma -e \"SELECT CURRENT_USER(), DATABASE(), @@port;\"",
            "warn": err_my_params.strip(),
            "out": out_my_params.strip()
        },
        "cnf": {
            "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"SELECT CURRENT_USER(), DATABASE();\"",
            "out": out_my_cnf.strip()
        },
        "stat_tcp": {
            "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"status\"",
            "out": out_my_stat_tcp.strip()
        },
        "stat_sock": {
            "cmd": "mysql -uroot -e \"status\"",
            "out": out_my_stat_sock.strip()
        },
        "cmd_fail": {
            "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"SELECT 'Salom' AS xabar, 2 + 2 AS natija\\G\"",
            "err": err_my_cmd_fail.strip()
        },
        "cmd_ok": {
            "cmd": "mysql --defaults-extra-file=talaba.cnf --commands qollanma -e \"SELECT 'Salom' AS xabar, 2 + 2 AS natija\\G\"",
            "out": out_my_cmd_ok.strip()
        }
    },
    "sqlite": {
        "tables": {
            "cmd": ".tables",
            "out": out_sl_tables.strip()
        },
        "schema": {
            "cmd": ".schema mahsulotlar",
            "out": out_sl_schema.strip()
        },
        "box": {
            "cmd": "SELECT * FROM mahsulotlar;",
            "out": out_sl_box.strip()
        },
        "csv": {
            "cmd": ".mode csv\nSELECT * FROM mahsulotlar;",
            "out": out_sl_csv.strip()
        }
    }
}

(HERE / "results.json").write_text(json.dumps(data, indent=2, ensure_ascii=False))

js_content = "export const TTY = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
(HERE / "tty.js").write_text(js_content)
print("3-bob haqiqiy terminal natijalari muvaffaqiyatli saqlandi!")

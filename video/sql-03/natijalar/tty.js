(function (g) {
  g.TTY = {
  "pg": {
    "params": {
      "cmd": "psql -h localhost -p 5432 -U postgres -d qollanma -c \"SELECT current_user, current_database(), inet_server_port();\"",
      "out": "current_user | current_database | inet_server_port \n--------------+------------------+------------------\n postgres     | qollanma         |             5432\n(1 row)"
    },
    "uri": {
      "cmd": "psql \"postgresql://postgres@localhost:5432/qollanma?application_name=qollanma-darslik\" -c \"SELECT application_name FROM pg_stat_activity WHERE pid = pg_backend_pid();\"",
      "out": "application_name \n------------------\n qollanma-darslik\n(1 row)"
    },
    "conninfo": {
      "cmd": "PGHOST=localhost PGPORT=5432 PGUSER=postgres PGDATABASE=qollanma psql -c '\\conninfo'",
      "out": "Connection Information\n      Parameter       |   Value   \n----------------------+-----------\n Database             | qollanma\n Client User          | postgres\n Host                 | localhost\n Host Address         | ::1\n Server Port          | 5432\n Options              | \n Protocol Version     | 3.0\n Password Used        | true\n GSSAPI Authenticated | false\n Backend PID          | 63632\n SSL Connection       | false\n Superuser            | on\n Hot Standby          | off\n(13 rows)"
    },
    "pass_fail": {
      "cmd": "psql -w \"postgresql://talaba@localhost:5432/qollanma\" -c \"SELECT 1\"",
      "err": "WARNING: password file \"/dev/null\" is not a plain file\npsql: error: connection to server at \"localhost\" (::1), port 5432 failed: fe_sendauth: no password supplied"
    },
    "pass_ok": {
      "cmd": "psql \"postgresql://talaba@localhost:5432/qollanma\" -c \"SELECT current_user;\"",
      "out": "current_user \n--------------\n talaba\n(1 row)"
    },
    "dt": {
      "cmd": "\\dt",
      "out": "List of tables\n Schema |   Name    | Type  |  Owner   \n--------+-----------+-------+----------\n public | talabalar | table | postgres\n(1 row)"
    },
    "d_table": {
      "cmd": "\\d talabalar",
      "out": "Table \"public.talabalar\"\n Column |  Type   | Collation | Nullable | Default \n--------+---------+-----------+----------+---------\n id     | integer |           | not null | \n ism    | text    |           | not null | \n kurs   | integer |           |          | \nIndexes:\n    \"talabalar_pkey\" PRIMARY KEY, btree (id)"
    },
    "expanded": {
      "cmd": "\\x\nSELECT * FROM talabalar WHERE id = 1;",
      "out": "-[ RECORD 1 ]\nid   | 1\nism  | Ali\nkurs | 2"
    },
    "help_sql": {
      "cmd": "\\h DROP TABLE",
      "out": "Command:     DROP TABLE\nDescription: remove a table\nSyntax:\nDROP TABLE [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]\n\nURL: https://www.postgresql.org/docs/18/sql-droptable.html"
    }
  },
  "mysql": {
    "params": {
      "cmd": "mysql -h 127.0.0.1 -P 3307 -u talaba -pMaxfiy-2026 qollanma -e \"SELECT CURRENT_USER(), DATABASE(), @@port;\"",
      "warn": "mysql: [Warning] Using a password on the command line interface can be insecure.",
      "out": "CURRENT_USER()\tDATABASE()\t@@port\ntalaba@127.0.0.1\tqollanma\t3307"
    },
    "cnf": {
      "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"SELECT CURRENT_USER(), DATABASE();\"",
      "out": "CURRENT_USER()\tDATABASE()\ntalaba@127.0.0.1\tqollanma"
    },
    "stat_tcp": {
      "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"status\"",
      "out": "--------------\nmysql  Ver 26.7.0 for macos26.6 on arm64 (Homebrew)\n\nConnection id:\t\t174\nCurrent database:\tqollanma\nCurrent user:\t\ttalaba@localhost\nSSL:\t\t\tCipher in use is TLS_AES_128_GCM_SHA256\nCurrent pager:\t\tstdout\nUsing outfile:\t\t''\nUsing delimiter:\t;\nServer version:\t\t9.7.2 Homebrew\nProtocol version:\t10\nConnection:\t\t127.0.0.1 via TCP/IP\nServer characterset:\tutf8mb4\nDb     characterset:\tutf8mb4\nClient characterset:\tutf8mb4\nConn.  characterset:\tutf8mb4\nTCP port:\t\t3307\nUptime:\t\t\t4 days 4 hours 10 min 16 sec\n\nThreads: 2  Questions: 1449  Slow queries: 0  Opens: 663  Flush tables: 3  Open tables: 424  Queries per second avg: 0.004\n--------------"
    },
    "stat_sock": {
      "cmd": "mysql -uroot -e \"status\"",
      "out": "--------------\nmysql  Ver 26.7.0 for macos26.6 on arm64 (Homebrew)\n\nConnection id:\t\t175\nCurrent database:\tqollanma\nCurrent user:\t\troot@localhost\nSSL:\t\t\tNot in use\nCurrent pager:\t\tstdout\nUsing outfile:\t\t''\nUsing delimiter:\t;\nServer version:\t\t9.7.2 Homebrew\nProtocol version:\t10\nConnection:\t\tLocalhost via UNIX socket\nServer characterset:\tutf8mb4\nDb     characterset:\tutf8mb4\nClient characterset:\tutf8mb4\nConn.  characterset:\tutf8mb4\nUNIX socket:\t\t/Users/mfsv/Projects/experiment/sql-sinov/my97.sock\nUptime:\t\t\t4 days 4 hours 10 min 16 sec\n\nThreads: 2  Questions: 1455  Slow queries: 0  Opens: 663  Flush tables: 3  Open tables: 424  Queries per second avg: 0.004\n--------------"
    },
    "cmd_fail": {
      "cmd": "mysql --defaults-extra-file=talaba.cnf qollanma -e \"SELECT 'Salom' AS xabar, 2 + 2 AS natija\\G\"",
      "err": "ERROR at line 1: Unknown command '\\G'."
    },
    "cmd_ok": {
      "cmd": "mysql --defaults-extra-file=talaba.cnf --commands qollanma -e \"SELECT 'Salom' AS xabar, 2 + 2 AS natija\\G\"",
      "out": "*************************** 1. row ***************************\n xabar: Salom\nnatija: 4"
    }
  },
  "sqlite": {
    "tables": {
      "cmd": ".tables",
      "out": "mahsulotlar"
    },
    "schema": {
      "cmd": ".schema mahsulotlar",
      "out": "CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text NOT NULL, narx numeric);"
    },
    "box": {
      "cmd": "SELECT * FROM mahsulotlar;",
      "out": "╭────┬─────┬───────╮\n│ id │ nom │ narx  │\n╞════╪═════╪═══════╡\n│  1 │ Non │  4000 │\n│  2 │ Sut │ 12000 │\n╰────┴─────┴───────╯"
    },
    "csv": {
      "cmd": ".mode csv\nSELECT * FROM mahsulotlar;",
      "out": "1,Non,4000\n2,Sut,12000"
    }
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

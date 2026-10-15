(function (g) {
  g.TTY = {
  "pg": {
    "dbs": "datname  | datistemplate | datallowconn \n-----------+---------------+--------------\n postgres  | f             | t\n qollanma  | f             | t\n template0 | t             | f\n template1 | t             | t\n(4 rows)",
    "createdb": "CREATE DATABASE",
    "tx_err": "ERROR:  CREATE DATABASE cannot run inside a transaction block",
    "cross_err": "ERROR:  cross-database references are not implemented: \"qollanma.public.talabalar\"\nLINE 1: SELECT * FROM qollanma.public.talabalar;\n                      ^",
    "search_path": "search_path   \n-----------------\n \"$user\", public\n(1 row)\n\n current_schema \n----------------\n public\n(1 row)",
    "namespaces": "nspname       \n--------------------\n information_schema\n pg_catalog\n public\n(3 rows)",
    "no_rel_err": "ERROR:  relation \"mahsulot\" does not exist\nLINE 1: SELECT * FROM mahsulot;\n                      ^",
    "path_savdo": "SET\n id | narx \n----+------\n  1 | 4000\n(1 row)",
    "path_ombor": "SET\n id | nom \n----+-----\n  1 | Non\n(1 row)",
    "tables": "SET\nCREATE TABLE\n schemaname | tablename \n------------+-----------\n ombor      | mahsulot\n ombor      | yangi\n savdo      | mahsulot\n(3 rows)"
  },
  "mysql": {
    "createdb": "+--------------------+\n| Database (%o%)     |\n+--------------------+\n| information_schema |\n| ombor              |\n| performance_schema |\n| qollanma           |\n| savdo              |\n| video_bob01        |\n+--------------------+",
    "cross": "+------+---------+\n| nom  | narx    |\n+------+---------+\n| Non  | 4000.00 |\n+------+---------+",
    "cur_db": "+------------+\n| DATABASE() |\n+------------+\n| NULL       |\n+------------+",
    "no_db_err": "ERROR 1046 (3D000) at line 1: No database selected"
  },
  "sqlite": {
    "attach": "╭─────┬───────┬───────────────────────╮\n│ seq │ name  │         file          │\n╞═════╪═══════╪═══════════════════════╡\n│   0 │ main  │                       │\n│   2 │ savdo │ /private/tmp/savdo.db │\n╰─────┴───────┴───────────────────────╯\n╭─────┬──────╮\n│ nom │ narx │\n╞═════╪══════╡\n│ Non │ 4000 │\n╰─────┴──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

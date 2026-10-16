(function (g) {
  g.TTY = {
  "pg": {
    "create_default": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\nINSERT 0 1\nINSERT 0 1\n id | nom | narx | soni | vaqt_bor \n----+-----+------+------+----------\n  1 | Non | 0.00 |    1 | t\n  2 | Sut | 0.00 |    5 | t\n  3 | Non | 0.00 |    1 | t\n  3 | Non | 0.00 |    1 | t\n(4 rows)\n\nNOTICE:  table \"mahsulotlar\" does not exist, skipping",
    "sys_cols": "ctid  | xmin |  tableoid   | id | nom \n-------+------+-------------+----+-----\n (0,1) | 1472 | mahsulotlar |  1 | Non\n (0,2) | 1473 | mahsulotlar |  2 | Sut\n (0,3) | 1474 | mahsulotlar |  3 | Non\n (0,4) | 1475 | mahsulotlar |  3 | Non\n(4 rows)\n\nUPDATE 1\n ctid  | xmin | id | soni \n-------+------+----+------\n (0,5) | 1476 |  1 |    2\n(1 row)",
    "sys_err": "ERROR:  column name \"ctid\" conflicts with a system column name",
    "like_demo": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\n jadval | narx | soni \n--------+------+------\n nusxa  |      |     \n nusxa2 | 0.00 |    1\n(2 rows)\n\nNOTICE:  table \"nusxa\" does not exist, skipping\nNOTICE:  table \"nusxa2\" does not exist, skipping",
    "temp_unlogged": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\n   relname    | relpersistence \n--------------+----------------\n mahsulotlar  | p\n vaqtinchalik | t\n kesh         | u\n(3 rows)\n\nDROP TABLE\nNOTICE:  table \"kesh\" does not exist, skipping"
  },
  "mysql": {
    "expr_err": "ERROR 1064 (42000) at line 1: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'CURRENT_DATE + INTERVAL 1 YEAR)' at line 1",
    "blob_err": "ERROR 1101 (42000) at line 1: BLOB, TEXT, GEOMETRY or JSON column 't' can't have a default value",
    "blob_ok": "",
    "invisible_demo": "id\tnom\n1\tNon\nid\tizoh\n1\tMaxfiy eslatma"
  },
  "sqlite": {
    "default_demo": "╭───────┬────┬─────┬──────┬──────────────────┬─────────────────────╮\n│ rowid │ id │ nom │ narx │     kod_hex      │     yaratilgan      │\n╞═══════╪════╪═════╪══════╪══════════════════╪═════════════════════╡\n│     1 │  1 │ Non │    0 │ 9526A055E1713804 │ 2026-10-16 03:51:24 │\n│     2 │  2 │ Sut │    0 │ 5AE63E2A7D390957 │ 2026-10-16 03:51:24 │\n╰───────┴────┴─────┴──────┴──────────────────┴─────────────────────╯",
    "expr_err": "Parse error near line 1: near \"+\": syntax error\n  EATE TABLE xato (d TEXT DEFAULT current_timestamp + 1);\n                                      error here ---^"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

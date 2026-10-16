(function (g) {
  g.TTY = {
  "pg": {
    "insert_returning": "DROP TABLE\nCREATE TABLE\n id \n----\n  1\n(1 row)\n\nINSERT 0 1\n id |  ism  | vaqt \n----+-------+------\n  2 | Vali  | t\n  3 | Sobir | t\n(2 rows)\n\nINSERT 0 2\nNOTICE:  table \"mijozlar\" does not exist, skipping\nNOTICE:  table \"arxiv\" does not exist, skipping",
    "update_old_new": "id | ism  | eski | yangi \n----+------+------+-------\n  1 | Ali  |    0 | 50000\n  2 | Vali |    0 | 50000\n(2 rows)\n\nUPDATE 2",
    "delete_returning": "id |  ism  |          yaratilgan           | balans \n----+-------+-------------------------------+--------\n  3 | Sobir | 2026-10-16 12:53:30.318949+05 |      0\n(1 row)\n\nDELETE 1\n id \n----\n(0 rows)\n\nUPDATE 0",
    "cte_pipeline": "CREATE TABLE\n id | ism | balans \n----+-----+--------\n(0 rows)\n\nINSERT 0 0\n id | ism  \n----+------\n  1 | Ali\n  2 | Vali\n(2 rows)\n\nDROP TABLE"
  },
  "mysql": {
    "returning_err": "ERROR 1064 (42000) at line 8: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'RETURNING id' at line 1",
    "last_insert_id": "yangi_id\tqatorlar\n1\t1\nbirinchi_id\n2",
    "row_count": "ozgargan\n2\nozgargan_ikkinchi_marta\n0"
  },
  "sqlite": {
    "sqlite_demo": "╭────┬──────╮\n│ id │ ism  │\n╞════╪══════╡\n│  1 │ Ali  │\n│  2 │ Vali │\n╰────┴──────╯\n╭────┬────────╮\n│ id │ balans │\n╞════╪════════╡\n│  1 │  50000 │\n╰────┴────────╯\n╭────┬──────┬─────────────────────┬────────╮\n│ id │ ism  │     yaratilgan      │ balans │\n╞════╪══════╪═════════════════════╪════════╡\n│  2 │ Vali │ 2026-10-16 07:53:30 │      0 │\n╰────┴──────┴─────────────────────┴────────╯\n╭─────────────────────╮\n│ last_insert_rowid() │\n╞═════════════════════╡\n│                   2 │\n╰─────────────────────╯",
    "sqlite_err": "Parse error near line 3: near \"INSERT\": syntax error\n  SELECT * FROM (INSERT INTO mijozlar (id) VALUES (1) RETURNING id);\n                 ^--- error here\nParse error near line 4: misuse of aggregate function sum()\n  UPDATE mijozlar SET balans = 1 RETURNING sum(balans);\n                             error here ---^"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

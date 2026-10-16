(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 5\nNOTICE:  table \"mijozlar\" does not exist, skipping",
    "between_symmetric": "id |  ism  | yosh \n----+-------+------\n  1 | Ali   |   25\n  2 | aliya |   31\n(2 rows)",
    "in_null_trap": "id | shahar \n----+--------\n(0 rows)",
    "distinct_from": "id |   ism   |  shahar   \n----+---------+-----------\n  2 | aliya   | Samarqand\n  4 | Sobir_2 | \n  5 | Dilnoza | Buxoro\n(3 rows)",
    "like_ilike_regex": "id |  ism  \n----+-------\n  1 | Ali\n  2 | aliya\n(2 rows)\n\n id |    telefon    \n----+---------------\n  1 | +998901234567\n  2 | +998935550011\n  4 | +998977770000\n(3 rows)\n\n id |   ism   \n----+---------\n  4 | Sobir_2\n(1 row)"
  },
  "mysql": {
    "mysql_tests": "id\tshahar\n2\tSamarqand\n4\tNULL\n5\tBuxoro\nid\tism\n1\tAli\n2\taliya\nid\ttelefon\n1\t+998901234567\n2\t+998935550011\n4\t+998977770000"
  },
  "sqlite": {
    "sqlite_tests": "╭────┬─────╮\n│ id │ ism │\n╞════╪═════╡\n│  1 │ Ali │\n╰────┴─────╯\n╭────┬─────────┬───────────╮\n│ id │   ism   │  shahar   │\n╞════╪═════════╪═══════════╡\n│  2 │ aliya   │ Samarqand │\n│  4 │ Sobir_2 │           │\n│  5 │ Dilnoza │ Buxoro    │\n╰────┴─────────┴───────────╯\n╭────────────┬──────────────╮\n│ bez_escape │ bilan_escape │\n╞════════════╪══════════════╡\n│          0 │            1 │\n╰────────────┴──────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

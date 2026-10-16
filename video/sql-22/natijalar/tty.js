(function (g) {
  g.TTY = {
  "pg": {
    "alias_where_error": "DROP TABLE\nCREATE TABLE\nINSERT 0 6\nERROR:  column \"qqs_bilan\" does not exist\nLINE 1: ...hi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan ...\n                                                             ^",
    "alias_order_ok": "sotuvchi | qqs_bilan \n----------+-----------\n Sobir    |   1008.00\n Vali     |    784.00\n Ali      |    560.00\n(3 rows)",
    "distinct_on": "sotuvchi |  shahar   | summa \n----------+-----------+-------\n Ali      | Toshkent  |   500\n Sobir    | Buxoro    |   900\n Vali     | Samarqand |   700\n(3 rows)",
    "missing_comma": "shahar \n--------\n Ali\n(1 row)\n\nDROP TABLE"
  },
  "mysql": {
    "mysql_having_alias": "sotuvchi\tjami\nSobir\t1000.00\nVali\t900.00\nAli\t800.00"
  },
  "sqlite": {
    "sqlite_alias": "╭──────────┬────────────────────╮\n│ sotuvchi │     qqs_bilan      │\n╞══════════╪════════════════════╡\n│ Vali     │ 784.00000000000011 │\n│ Sobir    │ 1008.0000000000001 │\n╰──────────┴────────────────────╯\n╭──────────┬──────╮\n│ sotuvchi │ jami │\n╞══════════╪══════╡\n│ Sobir    │ 1000 │\n│ Vali     │  900 │\n╰──────────┴──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

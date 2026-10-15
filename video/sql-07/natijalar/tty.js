(function (g) {
  g.TTY = {
  "pg": {
    "ins_too_long_err": "ERROR:  value too long for type character varying(5)",
    "sel_matnlar": "c   | c_uzunlik |    v    | bayt \n------+-----------+---------+------\n (ok) |         2 | (ok)    |    2\n      |           | (salom) |    5\n      |           | (juda ) |    5\n(3 rows)",
    "char_vs_varchar_cmp": "char_teng | varchar_teng \n-----------+--------------\n t         | f\n(1 row)",
    "utf8_ozbek": "belgi | bayt \n-------+------\n    11 |   12\n(1 row)",
    "tutuq_cmp": "bir_xilmi \n-----------\n f\n(1 row)",
    "nul_err": "ERROR:  invalid byte sequence for encoding \"UTF8\": 0x00",
    "bytea_sel": "nom    |    mazmun    | bayt \n-----------+--------------+------\n salom.txt | \\x53616c6f6d |    5\n nol       | \\x00ff10     |    3\n(2 rows)",
    "bytea_cmp": "teng \n------\n f\n(1 row)",
    "bytea_upper_err": "ERROR:  function upper(bytea) does not exist\nLINE 1: SELECT upper('Salom'::bytea);\n               ^\nHINT:  No function matches the given name and argument types. You might need to add explicit type casts."
  },
  "mysql": {
    "concat": "+------+--------+--------+\n| c    | v      | t      |\n+------+--------+--------+\n| (ab) | (ab  ) | (ab  ) |\n+------+--------+--------+",
    "compare": "+------+--------------+\n| teng | katta_kichik |\n+------+--------------+\n|    0 |            1 |\n+------+--------------+",
    "blob_def_err": "ERROR 1101 (42000) at line 1: BLOB, TEXT, GEOMETRY or JSON column 'x' can't have a default value",
    "rowsize_err": "ERROR 1118 (42000) at line 1: Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs",
    "varbinary": "+--------+-------------+------+\n| mazmun | HEX(mazmun) | teng |\n+--------+-------------+------+\n| Salom  | 53616C6F6D  |    0 |\n+--------+-------------+------+"
  },
  "sqlite": {
    "out": "╭──────┬────────────────────┬─────────┬──────╮\n│  c   │         v          │ uzunlik │ tip  │\n╞══════╪════════════════════╪═════════╪══════╡\n│ (ab) │ juda ham uzun matn │      18 │ text │\n╰──────┴────────────────────┴─────────┴──────╯\n╭──────╮\n│ teng │\n╞══════╡\n│    0 │\n╰──────╯\n╭───────┬──────┬──────╮\n│ blob  │ tip  │ teng │\n╞═══════╪══════╪══════╡\n│ Salom │ blob │    0 │\n╰───────┴──────┴──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

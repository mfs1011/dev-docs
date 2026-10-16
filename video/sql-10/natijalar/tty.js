(function (g) {
  g.TTY = {
  "pg": {
    "null_cmp": "teng | teng_emas | null_null \n------+-----------+-----------\n      |           | \n(1 row)\n\n a | b | c \n---+---+---\n t | t | t\n(1 row)",
    "three_logic": "va | va_yolgon | yoki | emas \n----+-----------+------+------\n    | f         | t    | \n(1 row)",
    "table_null": "DROP TABLE\nCREATE TABLE\nINSERT 0 3\n ism \n-----\n(0 rows)\n\n  ism  \n-------\n Sobir\n(1 row)\n\n ism  \n------\n Vali\n(1 row)\n\n  ism  \n-------\n Vali\n Sobir\n(2 rows)\n\nNOTICE:  table \"telefonlar\" does not exist, skipping",
    "null_expr": "hammasi | tel_bor \n---------+---------\n       3 |       2\n(1 row)\n\n yigindi | ulash | concat_bilan \n---------+-------+--------------\n         |       | Salom \n(1 row)\n\nDROP TABLE",
    "type_conv_explicit": "a  |  b  | c \n----+-----+---\n 43 | 7.0 | 7\n(1 row)\n\n noma_lum_literal | literal_bilan \n------------------+---------------\n                2 | t\n(1 row)",
    "type_conv_err": "ERROR:  invalid input syntax for type integer: \"1.5\"\nLINE 1: SELECT 1 + '1.5';\n                   ^",
    "col_conv_err": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\n n  | t  | pg_typeof | pg_typeof \n----+----+-----------+-----------\n 42 | 42 | integer   | text\n(1 row)\n\nDROP TABLE\nNOTICE:  table \"sonlar\" does not exist, skipping\nERROR:  operator does not exist: text = integer\nLINE 1: SELECT n FROM sonlar WHERE t = n;\n                                     ^\nHINT:  No operator matches the given name and argument types. You might need to add explicit type casts.",
    "cast_abc_err": "ERROR:  invalid input syntax for type integer: \"abc\"\nLINE 1: SELECT 'abc'::int;\n               ^"
  },
  "mysql": {
    "null_safe": "teng\tnull_xavfsiz\tbir_null\tis_null\nNULL\t1\t0\t1\nconcat_null\tson_matn\nNULL\t2 ta",
    "implicit_conv": "a\tb\tc\td\n2\t15\t2.5\t1\nLevel\tCode\tMessage\nWarning\t1292\tTruncated incorrect DOUBLE value: 'abc'",
    "str_int_trap": "c1\tc3\n1\tgrape\n2\tapple\n3\t0\n4\t0abc\nc1\tc3\n3\t0",
    "cast_demo": "a\tb\tc\n42\t3.7\t4",
    "cast_err": "ERROR 1064 (42000) at line 1: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'INTEGER)' at line 1"
  },
  "sqlite": {
    "null_demo": "╭──────┬───┬───┬───╮\n│ teng │ a │ b │ c │\n╞══════╪═══╪═══╪═══╡\n│      │ 1 │ 1 │ 1 │\n╰──────┴───┴───┴───╯\n╭───┬─────┬───┬────╮\n│ a │  b  │ c │ d  │\n╞═══╪═════╪═══╪════╡\n│ 2 │ 2.5 │ 1 │ 15 │\n╰───┴─────┴───┴────╯",
    "affinity_cmp": "╭────┬───────────┬────┬───────────┬────────┬───────╮\n│ i  │ typeof(i) │ s  │ typeof(s) │ i_matn │ s_son │\n╞════╪═══════════╪════╪═══════════╪════════╪═══════╡\n│ 42 │ integer   │ 42 │ text      │      1 │     1 │\n╰────┴───────────┴────┴───────────┴────────┴───────╯",
    "cast_demo": "╭────┬───┬───╮\n│ a  │ b │ c │\n╞════╪═══╪═══╡\n│ 42 │ 0 │ 3 │\n╰────┴───┴───╯",
    "strict_demo": "╭────┬───────────╮\n│ n  │ typeof(n) │\n╞════╪═══════════╡\n│ 42 │ integer   │\n╰────┴───────────╯\nError near line 5: cannot store TEXT value in INTEGER column q.n"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

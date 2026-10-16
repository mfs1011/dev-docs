// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 3",
    "cross_and_inner": "num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   1 | a    |   3 | yyy\n   1 | a    |   5 | zzz\n   2 | b    |   1 | xxx\n   2 | b    |   3 | yyy\n   2 | b    |   5 | zzz\n   3 | c    |   1 | xxx\n   3 | c    |   3 | yyy\n   3 | c    |   5 | zzz\n(9 rows)\n\n num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   3 | c    |   3 | yyy\n(2 rows)\n\n num | name | value \n-----+------+-------\n   1 | a    | xxx\n   3 | c    | yyy\n(2 rows)",
    "outer_joins": "num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   2 | b    |     | \n   3 | c    |   3 | yyy\n(3 rows)\n\n num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   3 | c    |   3 | yyy\n     |      |   5 | zzz\n(3 rows)\n\n num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   2 | b    |     | \n   3 | c    |   3 | yyy\n     |      |   5 | zzz\n(4 rows)",
    "on_vs_where": "num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n   2 | b    |     | \n   3 | c    |     | \n(3 rows)\n\n num | name | num | value \n-----+------+-----+-------\n   1 | a    |   1 | xxx\n(1 row)\n\n num | name \n-----+------\n   2 | b\n(1 row)",
    "lateral": "CREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 5\n nom |   ism   | ball \n-----+---------+------\n A   | Sobir   |   90\n A   | Ali     |   85\n B   | Vali    |   92\n B   | Dilnoza |   88\n C   |         |     \n(5 rows)"
  },
  "mysql": {
    "mysql_tests": "count(*)\n9\nnum\tname\tnum\tvalue\n1\ta\t1\txxx\n2\tb\tNULL\tNULL\n3\tc\t3\tyyy\nNULL\tNULL\t5\tzzz"
  },
  "sqlite": {
    "sqlite_tests": "╭─────┬──────┬─────┬───────╮\n│ num │ name │ num │ value │\n╞═════╪══════╪═════╪═══════╡\n│     │      │   5 │ zzz   │\n│   1 │ a    │   1 │ xxx   │\n│   2 │ b    │     │       │\n│   3 │ c    │   3 │ yyy   │\n╰─────┴──────┴─────┴───────╯\n╭──────────╮\n│ count(*) │\n╞══════════╡\n│        9 │\n╰──────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

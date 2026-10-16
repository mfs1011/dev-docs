// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 6",
    "basic_aggs": "count | count | count | sum | avg  | min | max \n-------+-------+-------+-----+------+-----+-----\n     6 |     5 |     2 | 425 | 85.0 |  70 |  92\n(1 row)\n\n count | sum \n-------+-----\n     0 |    \n(1 row)",
    "group_by_having": "guruh_id | soni | eng_yuqori \n----------+------+------------\n        1 |    3 |         90\n        2 |    2 |         92\n          |    1 |         70\n(3 rows)\n\n guruh_id | count \n----------+-------\n        1 |     3\n        2 |     2\n(2 rows)",
    "functional_dep": "id | nom | soni \n----+-----+------\n  1 | A   |    3\n  2 | B   |    2\n  3 | C   |    0\n(3 rows)",
    "filter_rollup": "hammasi | alochi \n---------+--------\n       6 |      3\n(1 row)\n\n nom |   ism   | sum | gr \n-----+---------+-----+----\n A   | Ali     |  85 |  0\n A   | Malika  |     |  0\n A   | Sobir   |  90 |  0\n A   |         | 175 |  1\n B   | Dilnoza |  88 |  0\n B   | Vali    |  92 |  0\n B   |         | 180 |  1\n     |         | 355 |  3\n(8 rows)"
  },
  "mysql": {
    "mysql_tests": "guruh_id\tism\tmax(ball)\nNULL\tJasur\t70\n1\tAli\t90\n2\tVali\t92\nguruh_id\tismlar\nNULL\tJasur\n1\tAli, Malika, Sobir\n2\tDilnoza, Vali\nhammasi\talochi\n6\t3"
  },
  "sqlite": {
    "sqlite_tests": "╭──────────┬───────┬───────────╮\n│ guruh_id │  ism  │ max(ball) │\n╞══════════╪═══════╪═══════════╡\n│          │ Jasur │        70 │\n│        1 │ Sobir │        90 │\n│        2 │ Vali  │        92 │\n╰──────────┴───────┴───────────╯\n╭───────────┬─────────────╮\n│ sum(ball) │ total(ball) │\n╞═══════════╪═════════════╡\n│           │         0.0 │\n╰───────────┴─────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

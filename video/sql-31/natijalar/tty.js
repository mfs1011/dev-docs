// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 10\nNOTICE:  table \"empsalary\" does not exist, skipping",
    "avg_partition": "depname  | empno | salary | ortacha \n-----------+-------+--------+---------\n develop   |     7 |   4200 |    5020\n develop   |     8 |   6000 |    5020\n develop   |     9 |   4500 |    5020\n develop   |    10 |   5200 |    5020\n develop   |    11 |   5200 |    5020\n personnel |     2 |   3900 |    3700\n personnel |     5 |   3500 |    3700\n sales     |     1 |   5000 |    4867\n sales     |     3 |   4800 |    4867\n sales     |     4 |   4800 |    4867\n(10 rows)",
    "ranking": "depname  | empno | salary | rn | rnk | drnk \n-----------+-------+--------+----+-----+------\n develop   |     8 |   6000 |  1 |   1 |    1\n develop   |    10 |   5200 |  2 |   2 |    2\n develop   |    11 |   5200 |  3 |   2 |    2\n develop   |     9 |   4500 |  4 |   4 |    3\n develop   |     7 |   4200 |  5 |   5 |    4\n personnel |     2 |   3900 |  1 |   1 |    1\n personnel |     5 |   3500 |  2 |   2 |    2\n sales     |     1 |   5000 |  1 |   1 |    1\n sales     |     3 |   4800 |  2 |   2 |    2\n sales     |     4 |   4800 |  3 |   2 |    2\n(10 rows)",
    "top2": "depname  | empno | salary \n-----------+-------+--------\n develop   |     8 |   6000\n develop   |    10 |   5200\n personnel |     2 |   3900\n personnel |     5 |   3500\n sales     |     1 |   5000\n sales     |     3 |   4800\n(6 rows)",
    "running_sum": "empno | salary | range_sum | rows_sum \n-------+--------+-----------+----------\n     5 |   3500 |      3500 |     3500\n     2 |   3900 |      7400 |     7400\n     7 |   4200 |     11600 |    11600\n     9 |   4500 |     16100 |    16100\n     3 |   4800 |     25700 |    25700\n     4 |   4800 |     25700 |    20900\n     1 |   5000 |     30700 |    30700\n    10 |   5200 |     41100 |    41100\n    11 |   5200 |     41100 |    35900\n     8 |   6000 |     47100 |    47100\n(10 rows)",
    "lag_lead": "empno | salary | oldingi | farq | keyingi \n-------+--------+---------+------+---------\n     5 |   3500 |         |      |    3900\n     2 |   3900 |    3500 |  400 |    4200\n     7 |   4200 |    3900 |  300 |    4500\n     9 |   4500 |    4200 |  300 |    4800\n     3 |   4800 |    4500 |  300 |    4800\n     4 |   4800 |    4800 |    0 |    5000\n     1 |   5000 |    4800 |  200 |    5200\n    10 |   5200 |    5000 |  200 |    5200\n    11 |   5200 |    5200 |    0 |    6000\n     8 |   6000 |    5200 |  800 |       0\n(10 rows)",
    "last_value": "depname | empno | salary | eng_kop | last_xato | eng_kam \n---------+-------+--------+---------+-----------+---------\n develop |     8 |   6000 |    6000 |      6000 |    4200\n develop |    10 |   5200 |    6000 |      5200 |    4200\n develop |    11 |   5200 |    6000 |      5200 |    4200\n develop |     9 |   4500 |    6000 |      4500 |    4200\n develop |     7 |   4200 |    6000 |      4200 |    4200\n(5 rows)",
    "groups_exclude": "empno | salary |   g   | boshqa \n-------+--------+-------+--------\n     5 |   3500 |  3500 |      0\n     2 |   3900 |  7400 |      1\n     7 |   4200 |  8100 |      2\n     9 |   4500 |  8700 |      3\n     3 |   4800 | 14100 |      3\n     4 |   4800 | 14100 |      3\n     1 |   5000 | 14600 |      4\n    10 |   5200 | 15400 |      2\n    11 |   5200 | 15400 |      2\n     8 |   6000 | 16400 |      0\n(10 rows)"
  },
  "mysql": {
    "tests": "depname\tempno\tsalary\trn\trnk\ndevelop\t8\t6000\t1\t1\ndevelop\t10\t5200\t2\t2\ndevelop\t11\t5200\t3\t2\ndevelop\t9\t4500\t4\t4\ndevelop\t7\t4200\t5\t5",
    "errors": "ERROR 1235 (42000) at line 3: This version of MySQL doesn't yet support 'GROUPS'"
  },
  "sqlite": {
    "tests": "╭───────┬────────┬──────┬────────╮\n│ empno │ salary │  g   │ boshqa │\n╞═══════╪════════╪══════╪════════╡\n│     5 │   3500 │ 3500 │      0 │\n│     2 │   3900 │ 7400 │      1 │\n│     7 │   4200 │ 8100 │      2 │\n│     9 │   4500 │ 8700 │      3 │\n╰───────┴────────┴──────┴────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

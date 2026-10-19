// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 7\nCREATE TABLE\nINSERT 0 4\nNOTICE:  table \"org\" does not exist, skipping\nNOTICE:  table \"yol\" does not exist, skipping",
    "series": "sum  \n------\n 5050\n(1 row)",
    "tree_levels": "name  | daraja \n-------+--------\n Alice |      0\n Bob   |      1\n Cindy |      1\n Dave  |      2\n Emma  |      2\n Fred  |      2\n Gail  |      2\n(7 rows)",
    "tree_path": "daraxt   |       yol        \n------------+------------------\n Alice      | Alice\n    Bob     | Alice/Bob\n       Dave | Alice/Bob/Dave\n       Emma | Alice/Bob/Emma\n    Cindy   | Alice/Cindy\n       Fred | Alice/Cindy/Fred\n       Gail | Alice/Cindy/Gail\n(7 rows)",
    "search_cycle": "nuqta | qadam | aylana |       yol_        \n-------+-------+--------+-------------------\n A     |     0 | f      | {(A)}\n B     |     1 | f      | {(A),(B)}\n C     |     2 | f      | {(A),(B),(C)}\n A     |     3 | t      | {(A),(B),(C),(A)}\n D     |     3 | f      | {(A),(B),(C),(D)}\n(5 rows)",
    "syntax_errors": "ERROR:  aggregate functions are not allowed in a recursive query's recursive term\nLINE 1: WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT max(n) + 1...\n                                                          ^\nERROR:  LIMIT in a recursive query is not implemented\nLINE 1: ... AS (SELECT 1 UNION ALL SELECT n + 1 FROM t LIMIT 5) SELECT ...\n                                                             ^"
  },
  "mysql": {
    "tests": "daraxt\tyol\nAlice\tAlice\n   Bob\tAlice/Bob\n      Dave\tAlice/Bob/Dave\n      Emma\tAlice/Bob/Emma\n   Cindy\tAlice/Cindy\n      Fred\tAlice/Cindy/Fred\n      Gail\tAlice/Cindy/Gail\nnuqta\tqadam\nA\t0\nB\t1\nC\t2\nA\t3\nD\t3"
  },
  "sqlite": {
    "tests": "╭────────────╮\n│   daraxt   │\n╞════════════╡\n│ Alice      │\n│ ...Bob     │\n│ ......Dave │\n│ ......Emma │\n│ ...Cindy   │\n│ ......Fred │\n│ ......Gail │\n╰────────────╯\n╭──────╮\n│ name │\n╞══════╡\n│ Bob  │\n│ Dave │\n│ Emma │\n╰──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

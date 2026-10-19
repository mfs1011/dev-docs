// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 3\nINSERT 0 3\nNOTICE:  table \"a\" does not exist, skipping\nNOTICE:  table \"b\" does not exist, skipping\nNOTICE:  table \"c\" does not exist, skipping",
    "union_ops": "m | n \n---+---\n 1 | 2\n 1 | 3\n 2 | 3\n 3 | 4\n(4 rows)\n\n m | n \n---+---\n 1 | 2\n 1 | 2\n 1 | 3\n 2 | 3\n 3 | 4\n 3 | 4\n(6 rows)",
    "intersect_except": "m | n \n---+---\n 1 | 2\n 3 | 4\n(2 rows)\n\n m | n \n---+---\n 2 | 3\n(1 row)",
    "all_counts": "m | n \n---+---\n 1 | 3\n 1 | 3\n 3 | 4\n(3 rows)\n\n m | n \n---+---\n 1 | 3\n 1 | 3\n(2 rows)\n\n m | n \n---+---\n 1 | 3\n(1 row)",
    "precedence": "m | n \n---+---\n 1 | 2\n 1 | 3\n 2 | 3\n 3 | 4\n(4 rows)",
    "order_limit": "x | n \n---+---\n 3 | 4\n 2 | 3\n(2 rows)\n\n m \n---\n 1\n 3\n(2 rows)\n\nERROR:  invalid UNION/INTERSECT/EXCEPT ORDER BY clause\nLINE 1: SELECT m, n FROM a UNION SELECT m, n FROM b ORDER BY m + n;\n                                                             ^\nDETAIL:  Only result column names can be used, not expressions or functions.\nHINT:  Add the expression/function to every SELECT, or move the UNION into a FROM clause.",
    "compat_null": "k | v \n---+---\n   | \n 1 | x\n(2 rows)\n\nERROR:  each UNION query must have the same number of columns\nLINE 1: SELECT m, n FROM a UNION SELECT m FROM b;\n                                        ^\nERROR:  invalid input syntax for type integer: \"matn\"\nLINE 1: SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;\n                                     ^"
  },
  "mysql": {
    "tests": "m\tn\n1\t2\n1\t3\n2\t3\n3\t4\nm\n1\n2\n3\nmatn\nm\tn\n1\t2\n3\t4"
  },
  "sqlite": {
    "tests": "╭───┬───╮\n│ m │ n │\n╞═══╪═══╡\n│ 1 │ 3 │\n│ 3 │ 4 │\n╰───┴───╯\n╭───╮\n│ m │\n╞═══╡\n│ 1 │\n│ 3 │\n╰───╯\n╭──────╮\n│  m   │\n╞══════╡\n│    1 │\n│    2 │\n│    3 │\n│ matn │\n╰──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

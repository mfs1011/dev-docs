// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 6",
    "scalar": "ism   | ball \n---------+------\n Vali    |   92\n Sobir   |   90\n Dilnoza |   88\n(3 rows)\n\n yoq \n-----\n \n(1 row)\n\nERROR:  more than one row returned by a subquery used as an expression\nERROR:  subquery must return only one column\nLINE 1: SELECT (SELECT ism, ball FROM baholar WHERE id = 1) AS x;\n               ^",
    "correlated": "nom | eng_yuqori \n-----+------------\n A   |         90\n B   |         92\n C   |           \n(3 rows)\n\n  ism  | ball \n-------+------\n Sobir |   90\n Vali  |   92\n(2 rows)",
    "exists_in": "nom \n-----\n A\n B\n(2 rows)\n\n nom \n-----\n A\n B\n(2 rows)",
    "not_in_trap": "nom \n-----\n(0 rows)\n\n nom \n-----\n C\n(1 row)\n\n nom \n-----\n C\n(1 row)",
    "any_all": "ism  | ball \n------+------\n Vali |   92\n(1 row)\n\n ism | ball \n-----+------\n(0 rows)\n\n   ism   | ball \n---------+------\n Ali     |   85\n Dilnoza |   88\n Jasur   |   70\n Sobir   |   90\n(4 rows)",
    "derived_update": "avg         \n--------------------\n 2.0000000000000000\n(1 row)\n\n  ism  \n-------\n Sobir\n Vali\n(2 rows)\n\nUPDATE 1\n  ism   | ball \n--------+------\n Malika |   92\n(1 row)"
  },
  "mysql": {
    "tests": "avg(soni)\n2.0000\nism\nSobir\nVali\nism\tball\nMalika\t92"
  },
  "sqlite": {
    "tests": "╭─────╮\n│ ism │\n╞═════╡\n│ Ali │\n╰─────╯\n╭───────────╮\n│ avg(soni) │\n╞═══════════╡\n│       2.0 │\n╰───────────╯\nParse error near line 11: sub-select returns 4 columns - expected 1"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);

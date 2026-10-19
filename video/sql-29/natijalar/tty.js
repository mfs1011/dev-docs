// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 6\nNOTICE:  table \"arxiv\" does not exist, skipping",
    "chain_cte": "ism   | ball \n---------+------\n Vali    |   92\n Dilnoza |   88\n(2 rows)",
    "explicit_cols": "nom | soni \n-----+------\n A   |    3\n B   |    2\n(2 rows)",
    "syntax_errors": "m | n \n---+---\n 1 | 2\n 1 | 3\n 3 | 4\n(3 rows)\n\nERROR:  syntax error at or near \"WITH\"\nLINE 1: WITH a AS (SELECT 1 AS x) WITH b AS (SELECT 2 AS y) SELECT *...\n                                  ^",
    "update_explain": "UPDATE 1\n                QUERY PLAN                \n------------------------------------------\n Index Scan using baholar_pkey on baholar\n   Index Cond: (id = 2)\n(2 rows)\n\n         QUERY PLAN          \n-----------------------------\n CTE Scan on w\n   Filter: (id = 2)\n   CTE w\n     ->  Seq Scan on baholar\n(4 rows)",
    "data_modifying": "INSERT 0 2\n  ism  | ball \n-------+------\n Ali   |   85\n Jasur |   70\n(2 rows)"
  },
  "mysql": {
    "tests": "ism\tball\nDilnoza\t88"
  },
  "sqlite": {
    "tests": "╭───╮\n│ x │\n╞═══╡\n│ 1 │\n╰───╯\n╭──────────╮\n│ count(*) │\n╞══════════╡\n│        6 │\n╰──────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
